import argparse
import base64
import hashlib
import json
import mimetypes
import posixpath
import socketserver
import struct
import threading
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

ROOT = Path(__file__).resolve().parent
MAGIC = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"


class SyncHub:
    def __init__(self):
        self._clients = set()
        self._lock = threading.Lock()
        self._marker_visibility = {}

    def register(self, client):
        with self._lock:
            self._clients.add(client)
            snapshot = dict(self._marker_visibility)
        if snapshot:
            client.send_json({"type": "visibility_state", "markerVisibility": snapshot})

    def unregister(self, client):
        with self._lock:
            self._clients.discard(client)

    def current_visibility(self):
        with self._lock:
            return dict(self._marker_visibility)

    def update_visibility(self, marker_visibility, sender=None):
        with self._lock:
            self._marker_visibility = dict(marker_visibility)
            recipients = list(self._clients)

        payload = {"type": "visibility_state", "markerVisibility": self._marker_visibility}
        for client in recipients:
            if client is sender:
                continue
            client.send_json(payload)


class WebSocketClient:
    def __init__(self, handler, hub):
        self.handler = handler
        self.hub = hub
        self.connection = handler.connection
        self.wfile = handler.wfile
        self._write_lock = threading.Lock()

    def run(self):
        self.hub.register(self)
        try:
            while True:
                message = self._read_message()
                if message is None:
                    break
                self._handle_message(message)
        finally:
            self.hub.unregister(self)

    def _handle_message(self, message):
        msg_type = message.get("type")
        if msg_type == "hello":
            self.send_json({
                "type": "visibility_state",
                "markerVisibility": self.hub.current_visibility()
            })
            return
        if msg_type == "visibility_state":
            marker_visibility = message.get("markerVisibility") or {}
            if isinstance(marker_visibility, dict):
                self.hub.update_visibility(marker_visibility, sender=self)

    def _read_exact(self, size):
        data = b""
        while len(data) < size:
            chunk = self.connection.recv(size - len(data))
            if not chunk:
                return None
            data += chunk
        return data

    def _read_message(self):
        header = self._read_exact(2)
        if not header:
            return None

        first_byte, second_byte = header
        opcode = first_byte & 0x0F
        masked = (second_byte & 0x80) != 0
        payload_len = second_byte & 0x7F

        if opcode == 0x8:
            return None

        if payload_len == 126:
            extended = self._read_exact(2)
            if not extended:
                return None
            payload_len = struct.unpack("!H", extended)[0]
        elif payload_len == 127:
            extended = self._read_exact(8)
            if not extended:
                return None
            payload_len = struct.unpack("!Q", extended)[0]

        mask = self._read_exact(4) if masked else None
        payload = self._read_exact(payload_len)
        if payload is None:
            return None

        if masked and mask:
            payload = bytes(byte ^ mask[index % 4] for index, byte in enumerate(payload))

        if opcode != 0x1:
            return None

        try:
            return json.loads(payload.decode("utf-8"))
        except json.JSONDecodeError:
            return None

    def send_json(self, payload):
        body = json.dumps(payload).encode("utf-8")
        frame = self._build_frame(body)
        with self._write_lock:
            try:
                self.wfile.write(frame)
                self.wfile.flush()
            except OSError:
                pass

    @staticmethod
    def _build_frame(payload):
        frame = bytearray()
        frame.append(0x81)
        length = len(payload)
        if length < 126:
            frame.append(length)
        elif length < 65536:
            frame.append(126)
            frame.extend(struct.pack("!H", length))
        else:
            frame.append(127)
            frame.extend(struct.pack("!Q", length))
        frame.extend(payload)
        return bytes(frame)


class MapRequestHandler(SimpleHTTPRequestHandler):
    server_version = "BaroviaSync/1.0"

    def do_GET(self):
        if self.headers.get("Upgrade", "").lower() == "websocket":
            self._handle_websocket()
            return
        if urlparse(self.path).path == "/api/images":
            self._handle_images_api()
            return
        super().do_GET()


    def translate_path(self, path):
        parsed = urlparse(path)
        request_path = parsed.path
        if request_path in ("/", ""):
            request_path = "/index.html"

        request_path = posixpath.normpath(unquote(request_path))
        parts = [part for part in request_path.split("/") if part and part not in (".", "..")]
        resolved = ROOT
        for part in parts:
            resolved /= part
        return str(resolved)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

    def guess_type(self, path):
        if path.endswith(".js"):
            return "application/javascript"
        return mimetypes.guess_type(path)[0] or "application/octet-stream"

    def log_message(self, format, *args):
        print("%s - - [%s] %s" % (self.address_string(), self.log_date_time_string(), format % args))

    def _handle_websocket(self):
        if self.path != "/ws":
            self.send_error(HTTPStatus.NOT_FOUND)
            return

        key = self.headers.get("Sec-WebSocket-Key")
        if not key:
            self.send_error(HTTPStatus.BAD_REQUEST, "Missing Sec-WebSocket-Key header")
            return

        accept = base64.b64encode(hashlib.sha1((key + MAGIC).encode("ascii")).digest()).decode("ascii")
        self.send_response(HTTPStatus.SWITCHING_PROTOCOLS)
        self.send_header("Upgrade", "websocket")
        self.send_header("Connection", "Upgrade")
        self.send_header("Sec-WebSocket-Accept", accept)
        self.end_headers()

        client = WebSocketClient(self, self.server.sync_hub)
        client.run()

    def _handle_images_api(self):
        images_dir = ROOT / "assets" / "images"
        image_names = []

        if images_dir.is_dir():
            image_names = sorted(
                path.name
                for path in images_dir.iterdir()
                if path.is_file() and path.suffix.lower() in {".avif", ".gif", ".jpeg", ".jpg", ".png", ".webp"}
            )

        body = json.dumps({"images": image_names}).encode("utf-8")
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)



class MapServer(ThreadingHTTPServer):
    def __init__(self, server_address, handler_class, sync_hub):
        super().__init__(server_address, handler_class)
        self.sync_hub = sync_hub


def main():
    parser = argparse.ArgumentParser(description="Serve the CoS map and sync DM marker changes to players.")
    parser.add_argument("--host", default="0.0.0.0", help="Host to bind to.")
    parser.add_argument("--port", type=int, default=8000, help="Port to bind to.")
    args = parser.parse_args()

    hub = SyncHub()
    with MapServer((args.host, args.port), MapRequestHandler, hub) as server:
        host, port = server.server_address
        print(f"Serving Barovia map at http://{host}:{port}")
        print(f"Player view: http://{host}:{port}/index.html")
        print(f"DM view: http://{host}:{port}/dm.html")
        try:
            server.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")


if __name__ == "__main__":
    socketserver.ThreadingMixIn.daemon_threads = True
    main()
