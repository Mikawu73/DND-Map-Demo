# DND-CoS-Map

Run the map with live DM-to-player sync:

```powershell
python sync_server.py
```

By default the server binds to `0.0.0.0`, so devices on the same Wi-Fi/LAN can connect.

Then open:

- Player view on this PC: `http://127.0.0.1:8000/index.html`
- DM view on this PC: `http://127.0.0.1:8000/dm.html`
- Phone/tablet on the same network: `http://<your-pc-ip>:8000/index.html`

The DM page broadcasts marker visibility changes over WebSocket, and connected player pages apply them live.