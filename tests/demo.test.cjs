const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const key = 'dnd-map-demo-v1';
const campaign = 'demo-lantern-coast';
const flush = () => new Promise(resolve => setImmediate(resolve));
function app({ role = 'dm', active = true, storage = new Map(), blocked = false, quota = false } = {}) {
  const events = {};
  const localStorage = {
    getItem(k) { if (blocked) throw new Error('Blocked'); return storage.get(k) ?? null; },
    setItem(k, v) { if (blocked) throw new Error('Blocked'); if (quota) throw Object.assign(new Error('Full'), { name: 'QuotaExceededError' }); storage.set(k, v); },
    removeItem(k) { storage.delete(k); }
  };
  const context = vm.createContext({ URL, URLSearchParams, crypto: webcrypto, queueMicrotask,
    document: { body: { dataset: { view: role } }, getElementById: () => null },
    window: { localStorage, sessionStorage: { getItem: () => null, setItem() {}, removeItem() {} },
      location: { search: active ? '?demo=1' : '', href: 'http://localhost/dm.html?demo=1' },
      history: { replaceState() {} }, I18n: { t: value => value },
      addEventListener: (type, handler) => { events[type] = handler; } }
  });
  vm.runInContext(read('assets/scripts/demo-seed.js'), context);
  vm.runInContext(read('assets/scripts/demo-backend.js'), context);
  const backend = context.window.DemoBackend;
  return { ...backend, storage, events, seed: context.window.DemoSeed, ref: backend.database.ref };
}

test('demo seeds are independent, fictional, and have correct map visibility and icons', () => {
  const demo = app();
  const a = demo.seed.create(), b = demo.seed.create();
  const shared = a.campaigns[campaign].maps.shared;
  assert.equal(Object.keys(a.users).length, 16);
  assert.equal(Object.keys(a.campaigns[campaign].playerDirectory).length, 8);
  assert.equal(shared.markerVisibility['coast:hidden-cove'], false);
  assert.equal(shared.markerIcons['coast%3Abriarport'], 'town');
  shared.customMarkers.mira.title = 'Changed';
  assert.equal(b.campaigns[campaign].maps.shared.customMarkers.mira.title, 'Captain Mira');
  for (const name of demo.images) assert.ok(fs.existsSync(path.join(__dirname, '../assets/demo', name)));
});

test('demo requires explicit entry and simulates separate role identities', async () => {
  for (const [role, active, expected] of [['dm', true, 'demo-dm'], ['player', true, 'demo-player'], ['dm', false, null]]) {
    const demo = app({ role, active });
    let uid;
    demo.auth.onAuthStateChanged(user => { uid = user?.uid || null; });
    await flush();
    assert.equal(uid, expected);
    await demo.auth.signOut();
    assert.equal(uid, null);
    await assert.rejects(demo.ref('users/demo-dm/displayName').set('Denied'));
  }
});

test('writes persist across reloads, snapshots stay immutable, reset preserves unrelated storage', async () => {
  const storage = new Map([['barovia-marker-visibility', 'production'], ['dnd-map-language', 'zh']]);
  const demo = app({ storage });
  const ref = demo.ref('users/demo-dm');
  const snapshot = await ref.once('value');
  const original = snapshot.val().displayName;
  const changed = snapshot.val(); changed.displayName = 'Mutation';
  assert.equal(snapshot.val().displayName, original);
  await ref.update({ displayName: 'Updated' });
  assert.equal(snapshot.val().displayName, original);
  assert.equal((await app({ storage }).ref('users/demo-dm/displayName').once()).val(), 'Updated');
  demo.reset();
  assert.equal((await ref.once()).val().displayName, original);
  assert.equal(storage.has(key), false);
  assert.equal(storage.get('barovia-marker-visibility'), 'production');
  assert.equal(storage.get('dnd-map-language'), 'zh');
});

test('player can save their profile but cannot mutate campaigns or another user; updates are atomic', async () => {
  const demo = app({ role: 'player' });
  await demo.ref().update({ 'users/demo-player/displayName': 'My Name',
    [`campaigns/${campaign}/playerDirectory/demo-player/displayName`]: 'My Name' });
  await assert.rejects(demo.ref().update({ 'users/demo-player/displayName': 'Partial',
    [`campaigns/${campaign}/name`]: 'Denied' }), /Player demo/);
  assert.equal((await demo.ref('users/demo-player/displayName').once()).val(), 'My Name');
  await assert.rejects(demo.ref('users/demo-dm/displayName').set('Denied'));
  await assert.rejects(demo.ref('userCampaigns/demo-player/new').set({ role: 'dm' }));
});

test('listeners fire only on related paths and detached callbacks do not fire', async () => {
  const demo = app();
  let rootCalls = 0, profileCalls = 0;
  const root = demo.ref(`campaigns/${campaign}/rootMap`);
  root.on('value', () => rootCalls++);
  demo.ref('users/demo-dm').on('value', () => profileCalls++);
  const gone = demo.ref('users/bramble');
  gone.on('value', () => assert.fail('detached listener')); gone.off();
  await flush();
  await demo.ref('users/demo-dm/displayName').set('New');
  await flush();
  assert.equal(rootCalls, 1); assert.equal(profileCalls, 2);
  await demo.ref(`campaigns/${campaign}/rootMap/title`).set('New Map');
  await flush(); assert.equal(rootCalls, 2);
});

test('same-origin tab storage events update only changed paths and reset propagates', async () => {
  const a = app(), b = app();
  let mapCalls = 0;
  b.ref(`campaigns/${campaign}/rootMap`).on('value', () => mapCalls++);
  await flush();
  await a.ref('users/demo-dm/displayName').set('Other tab');
  b.events.storage({ key, newValue: a.storage.get(key) });
  await flush();
  assert.equal((await b.ref('users/demo-dm/displayName').once()).val(), 'Other tab');
  assert.equal(mapCalls, 1);
  b.events.storage({ key, newValue: null });
  assert.equal((await b.ref('users/demo-dm/displayName').once()).val(), 'The Cartographer');
});

test('blocked storage remains usable and quota errors do not partially mutate state', async () => {
  const memory = app({ blocked: true });
  await memory.ref('users/demo-dm/displayName').set('Memory Only');
  assert.equal((await memory.ref('users/demo-dm/displayName').once()).val(), 'Memory Only');
  const full = app({ quota: true });
  await assert.rejects(full.ref('users/demo-dm/displayName').set('Unsaved'), /storage is full/);
  assert.equal((await full.ref('users/demo-dm/displayName').once()).val(), 'The Cartographer');
  await assert.rejects(app().ref('users/demo-dm/displayName').set('x'.repeat(4000001)), /storage is full/);
  assert.equal((await app({ storage: new Map([[key, '{invalid']]) }).ref('users/demo-dm').once()).val().username, 'demodm');
});

test('rejects prototype paths, unapproved images and real account operations', async () => {
  const demo = app();
  assert.throws(() => demo.ref('users/__proto__/polluted'), /Invalid/);
  await assert.rejects(demo.ref().update({ 'users/demo-dm/constructor/test': true }), /Invalid/);
  assert.equal(demo.imagePath('../../private.png'), '');
  assert.equal(demo.imagePath('briarport.svg'), 'assets/demo/briarport.svg');
  assert.equal(demo.isLocalImage('data:image/png;base64,AAAA'), true);
  assert.equal(demo.isLocalImage('data:image/svg+xml;base64,AAAA'), false);
  await assert.rejects(demo.uploadImage({ type: 'image/svg+xml', size: 100 }));
  await assert.rejects(demo.uploadImage({ type: 'image/png', size: 2097153 }));
  await assert.rejects(demo.auth.createUserWithEmailAndPassword(), /disabled/);
  await assert.rejects(demo.auth.signInWithEmailAndPassword(), /No real sign-in/);
});

test('both demo entrypoints omit production SDKs/config and restrict external connections', () => {
  for (const file of ['index.html', 'dm.html']) {
    const html = read(file);
    assert.doesNotMatch(html, /<script[^>]+(?:firebase|https?:)/i);
    assert.match(html, /connect-src 'self'/);
    assert.match(html, /demo-backend\.js/);
    assert.match(html, /demo-seed\.js/);
    assert.doesNotMatch(html, /src="assets\/images\//);
  }
  assert.doesNotMatch(read('assets/scripts/firebase-config.js'), /apiKey|databaseURL|uploadPreset/);
});
