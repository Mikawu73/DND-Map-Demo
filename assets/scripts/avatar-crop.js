// Local-only square cropping. No image is uploaded until the profile is saved.
(() => {
  "use strict";
  const dialog = document.getElementById("avatar-crop-dialog");
  const stage = document.getElementById("avatar-crop-stage");
  const preview = document.getElementById("avatar-crop-preview");
  const zoom = document.getElementById("avatar-crop-zoom");
  const confirm = document.getElementById("avatar-crop-confirm");
  const reset = document.getElementById("avatar-crop-reset");
  const status = document.getElementById("avatar-crop-status");
  let session = null;

  function cropRect(width, height, zoomValue = 1, centerX = width / 2, centerY = height / 2) {
    const scale = Math.max(1, Math.min(4, Number(zoomValue) || 1));
    const size = Math.min(width, height) / scale;
    const x = Math.max(0, Math.min(width - size, centerX - size / 2));
    const y = Math.max(0, Math.min(height - size, centerY - size / 2));
    return { x, y, size };
  }

  function setStatus(key) {
    status.hidden = !key;
    window.I18n.setText(status, key);
  }

  function draw() {
    if (!session?.ready) return;
    const current = session;
    const rect = cropRect(current.image.naturalWidth, current.image.naturalHeight,
      zoom.value, current.centerX, current.centerY);
    current.centerX = rect.x + rect.size / 2;
    current.centerY = rect.y + rect.size / 2;
    current.rect = rect;
    for (const canvas of [stage, preview]) {
      const context = canvas.getContext("2d");
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(current.image, rect.x, rect.y, rect.size, rect.size, 0, 0, canvas.width, canvas.height);
    }
    // The square is the saved image; the circle shows the visible avatar area.
    const context = stage.getContext("2d");
    context.save();
    context.fillStyle = "rgba(20, 14, 9, 0.5)";
    context.beginPath();
    context.rect(0, 0, stage.width, stage.height);
    context.arc(stage.width / 2, stage.height / 2, stage.width / 2 - 1, 0, 2 * Math.PI);
    context.fill("evenodd");
    context.beginPath();
    context.arc(stage.width / 2, stage.height / 2, stage.width / 2 - 2, 0, 2 * Math.PI);
    context.strokeStyle = "rgba(255,255,255,0.9)";
    context.lineWidth = 2;
    context.setLineDash([6, 5]);
    context.stroke();
    context.restore();
  }

  function finish(value = null) {
    const current = session;
    if (!current) return;
    session = null;
    if (current.pointer && stage.hasPointerCapture?.(current.pointer.id)) stage.releasePointerCapture(current.pointer.id);
    current.image.onload = current.image.onerror = null;
    current.image.src = "";
    URL.revokeObjectURL(current.url);
    for (const canvas of [stage, preview]) canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    if (dialog.open) dialog.close();
    current.resolve(value);
  }

  function open(file) {
    finish();
    return new Promise(resolve => {
      const image = new Image();
      const current = { image, url: URL.createObjectURL(file), resolve, ready: false, busy: false, pointer: null };
      session = current;
      zoom.value = "1";
      zoom.disabled = reset.disabled = confirm.disabled = true;
      setStatus("Loading photo…");
      image.onload = () => {
        if (session !== current) return;
        if (!image.naturalWidth || !image.naturalHeight || image.naturalWidth * image.naturalHeight > 32000000) {
          setStatus("This photo is too large to edit. Choose an image under 32 megapixels.");
          return;
        }
        current.ready = true;
        current.centerX = image.naturalWidth / 2;
        current.centerY = image.naturalHeight / 2;
        zoom.disabled = reset.disabled = confirm.disabled = false;
        setStatus("");
        draw();
        stage.focus();
      };
      image.onerror = () => {
        if (session === current) setStatus("This photo could not be opened. Try another image.");
      };
      dialog.showModal();
      image.src = current.url;
    });
  }

  function pan(dx, dy, displayWidth) {
    if (!session?.ready || session.busy || !displayWidth) return;
    const factor = session.rect.size / displayWidth;
    session.centerX -= dx * factor;
    session.centerY -= dy * factor;
    draw();
  }

  stage?.addEventListener("pointerdown", event => {
    if (!session?.ready || session.busy || session.pointer || (event.button !== 0 && event.pointerType !== "touch")) return;
    event.preventDefault();
    stage.focus();
    stage.setPointerCapture(event.pointerId);
    session.pointer = { id: event.pointerId, x: event.clientX, y: event.clientY };
  });
  stage?.addEventListener("pointermove", event => {
    const pointer = session?.pointer;
    if (!pointer || pointer.id !== event.pointerId) return;
    pan(event.clientX - pointer.x, event.clientY - pointer.y, stage.getBoundingClientRect().width);
    pointer.x = event.clientX;
    pointer.y = event.clientY;
  });
  for (const type of ["pointerup", "pointercancel", "lostpointercapture"]) {
    stage?.addEventListener(type, event => {
      if (session?.pointer?.id !== event.pointerId) return;
      session.pointer = null;
      if (stage.hasPointerCapture?.(event.pointerId)) stage.releasePointerCapture(event.pointerId);
    });
  }
  stage?.addEventListener("keydown", event => {
    const directions = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (!directions[event.key]) return;
    event.preventDefault();
    const [x, y] = directions[event.key];
    pan(x * (event.shiftKey ? 20 : 5), y * (event.shiftKey ? 20 : 5), stage.getBoundingClientRect().width);
  });
  zoom?.addEventListener("input", () => { if (!session?.busy) draw(); });
  reset?.addEventListener("click", () => {
    if (!session?.ready || session.busy) return;
    zoom.value = "1";
    session.centerX = session.image.naturalWidth / 2;
    session.centerY = session.image.naturalHeight / 2;
    draw();
  });
  confirm?.addEventListener("click", () => {
    const current = session;
    if (!current?.ready || current.busy) return;
    current.busy = true;
    confirm.disabled = zoom.disabled = reset.disabled = true;
    setStatus("Preparing cropped photo…");
    const failed = () => {
      if (session !== current) return;
      current.busy = false;
      confirm.disabled = zoom.disabled = reset.disabled = false;
      setStatus("Could not crop this photo. Try again or choose another image.");
    };
    try {
      const output = document.createElement("canvas");
      output.width = output.height = 512;
      const { x, y, size } = current.rect;
      output.getContext("2d").drawImage(current.image, x, y, size, size, 0, 0, 512, 512);
      output.toBlob(blob => {
        if (session !== current) return;
        if (!blob || !blob.size || blob.size > 2 * 1024 * 1024) { failed(); return; }
        finish(new File([blob], "avatar.png", { type: "image/png" }));
      }, "image/png");
    } catch { failed(); }
  });
  document.getElementById("avatar-crop-cancel")?.addEventListener("click", () => finish());
  dialog?.addEventListener("cancel", event => { event.preventDefault(); finish(); });
  dialog?.addEventListener("close", () => { if (!dialog.open) finish(); });
  window.AvatarCropper = { open, cancel: () => finish(), cropRect };
})();
