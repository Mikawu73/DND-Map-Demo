const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/scripts/avatar-crop.js'), 'utf8');

function cropper() {
  const elements = new Map();
  const images = [];
  const revoked = [];
  const exports = [];
  const get = id => {
    if (!elements.has(id)) {
      const drawCalls = [];
      elements.set(id, {
        width: 320, height: 320, value: '1', events: {}, drawCalls,
        addEventListener(type, handler) { this.events[type] = handler; },
        getContext() { return { clearRect() {}, drawImage(...args) { drawCalls.push(args); },
          save() {}, restore() {}, beginPath() {}, rect() {}, arc() {}, fill() {}, stroke() {}, setLineDash() {} }; },
        showModal() { this.open = true; }, close() { this.open = false; }, focus() {},
        getBoundingClientRect() { return { width: 320 }; },
        setPointerCapture() {}, hasPointerCapture() { return false; },
        toBlob(callback, type) { exports.push({ callback, type, canvas: this }); }
      });
    }
    return elements.get(id);
  };
  let nextCanvas = 0;
  const context = vm.createContext({
    window: { I18n: { setText(element, key) { element.textContent = key; } } },
    document: { getElementById: get, createElement: () => get('output-' + nextCanvas++) },
    Image: class { constructor() { this.naturalWidth = 1200; this.naturalHeight = 800; images.push(this); } },
    URL: { createObjectURL: () => 'blob:source-' + images.length, revokeObjectURL: url => revoked.push(url) },
    File: class { constructor(parts, name, options) { this.name = name; this.type = options.type; this.size = parts[0].size; } }
  });
  vm.runInContext(source, context);
  return { api: context.window.AvatarCropper, get, images, revoked, exports };
}

test('square crop stays inside portrait, landscape and square sources at all zoom levels', () => {
  const c = cropper();
  for (const [w, h] of [[1200, 800], [800, 1200], [800, 800]]) {
    for (const z of [0, 1, 2, 4, 100]) {
      for (const [cx, cy] of [[-9000, -9000], [w / 2, h / 2], [9000, 9000]]) {
        const rect = c.api.cropRect(w, h, z, cx, cy);
        assert.ok(rect.x >= 0 && rect.y >= 0);
        assert.ok(rect.x + rect.size <= w && rect.y + rect.size <= h);
        assert.ok(rect.size >= Math.min(w, h) / 4);
      }
    }
  }
  assert.deepEqual(JSON.parse(JSON.stringify(c.api.cropRect(1200, 800))), { x: 200, y: 0, size: 800 });
});

test('drag, zoom, keyboard and reset update both crop and round preview', () => {
  const c = cropper();
  c.api.open({});
  c.images[0].onload();
  const stage = c.get('avatar-crop-stage');
  const zoom = c.get('avatar-crop-zoom');
  zoom.value = '2'; zoom.events.input();
  assert.equal(stage.drawCalls.at(-1)[3], 400);
  stage.events.pointerdown({ button: 0, pointerId: 1, clientX: 100, clientY: 100, preventDefault() {} });
  stage.events.pointermove({ pointerId: 1, clientX: 180, clientY: 100 });
  assert.equal(stage.drawCalls.at(-1)[1], 300);
  stage.events.pointerup({ pointerId: 1 });
  stage.events.keydown({ key: 'ArrowLeft', preventDefault() {} });
  assert.ok(stage.drawCalls.at(-1)[1] > 300);
  assert.equal(c.get('avatar-crop-preview').drawCalls.length, stage.drawCalls.length);
  c.get('avatar-crop-reset').events.click();
  assert.equal(zoom.value, '1');
  assert.equal(stage.drawCalls.at(-1)[1], 200);
  c.api.cancel();
});

test('confirm exports the chosen source rectangle as a 512px PNG, not the overlay', async () => {
  const c = cropper();
  const result = c.api.open({});
  c.images[0].onload();
  c.get('avatar-crop-zoom').value = '2';
  c.get('avatar-crop-zoom').events.input();
  c.get('avatar-crop-confirm').events.click();
  c.get('avatar-crop-confirm').events.click();
  assert.equal(c.exports.length, 1);
  const output = c.exports[0];
  assert.equal(output.canvas.width, 512);
  assert.equal(output.canvas.height, 512);
  assert.equal(output.type, 'image/png');
  assert.deepEqual(output.canvas.drawCalls[0].slice(1), [400, 200, 400, 400, 0, 0, 512, 512]);
  output.callback({ size: 1024 });
  const file = await result;
  assert.equal(file.name, 'avatar.png');
  assert.equal(file.type, 'image/png');
  assert.equal(c.get('avatar-crop-dialog').open, false);
  assert.equal(c.revoked.length, 1);
});

test('cancel during export releases source and ignores late results', async () => {
  const c = cropper();
  const result = c.api.open({});
  c.images[0].onload();
  c.get('avatar-crop-confirm').events.click();
  c.get('avatar-crop-cancel').events.click();
  c.exports[0].callback({ size: 1024 });
  assert.equal(await result, null);
  assert.equal(c.revoked.length, 1);
});

test('bad images and failed canvas export stay cancellable and retryable', async () => {
  const c = cropper();
  const first = c.api.open({});
  c.images[0].onerror();
  assert.equal(c.get('avatar-crop-confirm').disabled, true);
  assert.match(c.get('avatar-crop-status').textContent, /could not be opened/);
  c.api.cancel();
  assert.equal(await first, null);
  const second = c.api.open({});
  c.images[1].naturalWidth = c.images[1].naturalHeight = 10000;
  c.images[1].onload();
  assert.equal(c.get('avatar-crop-confirm').disabled, true);
  c.api.cancel();
  assert.equal(await second, null);
  const third = c.api.open({});
  c.images[2].onload();
  c.get('avatar-crop-confirm').events.click();
  c.exports[0].callback(null);
  assert.equal(c.get('avatar-crop-confirm').disabled, false);
  assert.match(c.get('avatar-crop-status').textContent, /Could not crop/);
  c.api.cancel();
  await third;
});

test('superseded image loads cannot change the new crop session', async () => {
  const c = cropper();
  const first = c.api.open({});
  const lateLoad = c.images[0].onload;
  const second = c.api.open({});
  assert.equal(await first, null);
  lateLoad();
  assert.equal(c.get('avatar-crop-confirm').disabled, true);
  c.images[1].onload();
  assert.equal(c.get('avatar-crop-confirm').disabled, false);
  c.api.cancel();
  await second;
});
