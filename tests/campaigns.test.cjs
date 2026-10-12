const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const path = require('node:path');

const source = fs.readFileSync(path.join(__dirname, '../assets/scripts/main.js'), 'utf8');

class Element {
  constructor() {
    this.dataset = {};
    this.style = {};
    this.events = {};
    this.children = [];
    this.value = '';
    this.hidden = false;
    this.classList = { contains: () => false, toggle() {}, add() {}, remove() {} };
  }
  addEventListener(type, fn) { this.events[type] = fn; }
  setAttribute(name, value) { this[name] = value; }
  getAttribute(name) { return this[name] ?? null; }
  removeAttribute(name) { delete this[name]; }
  append(child) { this.children.push(child); }
  querySelector() { return this.button ||= new Element(); }
  querySelectorAll() { return []; }
  showModal() { this.open = true; }
  close() { this.open = false; }
}

function app(mode = 'player', search = '', initialLanguage = null) {
  const elements = new Map();
  const get = id => {
    if (!elements.has(id)) elements.set(id, new Element());
    return elements.get(id);
  };
  const writes = [];
  const listeners = new Map();
  const windowListeners = new Map();
  const storage = new Map(initialLanguage ? [['dnd-map-language', initialLanguage]] : []);
  const context = vm.createContext({
    console: { log() {}, warn() {}, error() {} }, URLSearchParams, crypto: webcrypto,
    URL: class extends URL {
      static createObjectURL() { return 'blob:test-avatar'; }
      static revokeObjectURL() {}
    },
    CustomEvent: class { constructor(type, options) { this.type = type; this.detail = options?.detail; } },
    document: {
      documentElement: new Element(),
      body: { dataset: { view: mode } }, getElementById: get,
      querySelector: get,
      querySelectorAll: selector => selector.includes('[data-i18n') ? [...elements.values()].filter(el => el['data-i18n-bound'] !== undefined || el['data-i18n'] !== undefined) : [],
      createElement: () => new Element()
    },
    window: {
      AvatarCropper: { open: async file => file, cancel() {} },
      CLOUDINARY_CONFIG: { cloudName: 'ehj3olxo', uploadPreset: 'test-only' },
      location: { search, pathname: mode === 'dm' ? '/dm.html' : '/index.html', hash: '', assign(url) { context.destination = url; } },
      history: { state: null, replaceState(state, title, url) {
        const parsed = new URL(url, 'http://127.0.0.1:8000');
        Object.assign(context.window.location, { pathname: parsed.pathname, search: parsed.search, hash: parsed.hash });
        this.state = state;
      } },
      localStorage: { getItem: key => storage.get(key) ?? null, setItem(key, value) { storage.set(key, value); }, removeItem(key) { storage.delete(key); } },
      addEventListener(type, handler) { windowListeners.set(type, handler); },
      dispatchEvent(event) { windowListeners.get(event.type)?.(event); },
      confirm: () => true
    },
    database: { ref: (ref = '') => ({
      update: async updates => { writes.push({ ref, updates }); },
      set: async value => { writes.push({ ref, value }); },
      on: (event, callback) => listeners.set(ref, callback),
      off() {},
      once: async () => ({ val: () => null, exists: () => false })
    }) }
  });
  vm.runInContext(fs.readFileSync(path.join(__dirname, '../assets/scripts/i18n.js'), 'utf8'), context);
  // Install the actual event handlers, but omit network-dependent startup.
  vm.runInContext(source.slice(0, source.lastIndexOf('window.addEventListener("resize"')), context);
  const run = code => vm.runInContext(code, context);
  run('firebaseDatabase = database; currentUser = { uid: "alice" }; currentUserProfile = { role: "player", username: "alice" };');
  return { context, run, get, writes, listeners };
}

test('ordinary registered user creates a campaign and DM membership atomically', async () => {
  const a = app('dm');
  a.run('startPresenceSync = () => {};');
  a.get('campaign-name').value = '失落的群岛';
  await a.get('campaign-create-form').events.submit({ preventDefault() {} });
  assert.equal(a.writes.length, 1);
  assert.equal(a.writes[0].ref, '');
  const updates = a.writes[0].updates;
  const campaignPath = Object.keys(updates).find(p => p.startsWith('campaigns/'));
  const id = campaignPath.split('/')[1];
  assert.equal(updates[campaignPath].ownerUid, 'alice');
  assert.equal(updates[campaignPath].schemaVersion, 2);
  assert.equal(updates[`userCampaigns/alice/${id}`].role, 'dm');
  assert.equal(a.run('activeCampaignId'), id);
  assert.equal(a.get('campaign-create-form').button.disabled, false);
});

test('creation from the DM page opens the empty map setup', async () => {
  const a = app('dm');
  a.get('campaign-name').value = 'New world';
  a.run('startPresenceSync = () => {};');
  await a.get('campaign-create-form').events.submit({ preventDefault() {} });
  assert.equal(a.run('isCampaignDm()'), true);
  assert.equal(a.run('campaignPickerOpen'), false);
  assert.equal(a.get('root-map-setup').hidden, false);
  assert.equal(a.get('app-shell').hidden, false);
});

test('failed creation preserves name, enables retry, and does not redirect', async () => {
  const a = app('dm');
  a.context.database.ref = () => ({ update: async () => { throw Error('denied'); } });
  a.get('campaign-name').value = 'Retry me';
  await a.get('campaign-create-form').events.submit({ preventDefault() {} });
  assert.equal(a.context.destination, undefined);
  assert.equal(a.get('campaign-name').value, 'Retry me');
  assert.equal(a.get('campaign-create-form').button.disabled, false);
  assert.equal(a.get('auth-message').dataset.state, 'error');
});

test('duplicate submit during a pending creation does not create two campaigns', async () => {
  const a = app('dm');
  a.run('initializeFirebaseSync = () => {}; startPresenceSync = () => {};');
  let finish;
  let calls = 0;
  a.context.database.ref = () => ({ update: () => { calls++; return new Promise(resolve => { finish = resolve; }); } });
  a.get('campaign-name').value = 'One world';
  const event = { preventDefault() {} };
  const pending = a.get('campaign-create-form').events.submit(event);
  await a.get('campaign-create-form').events.submit(event);
  assert.equal(calls, 1);
  finish();
  await pending;
});

test('DM access is per campaign, never granted by global profile role', () => {
  const a = app('dm');
  a.run('campaignMemberships = { mine: { role: "dm" }, theirs: { role: "player" } }; activeCampaignId = "mine";');
  assert.equal(a.run('canAccessCurrentView()'), true);
  a.run('activeCampaignId = "theirs"; currentUserProfile.role = "admin";');
  assert.equal(a.run('canAccessCurrentView()'), false);
});

test('new campaigns and legacy campaigns resolve to isolated compatible paths', () => {
  const a = app();
  a.run('campaignMemberships = { newworld: { role: "dm", schemaVersion: 2 }, oldworld: { role: "dm" } }; activeCampaignId = "newworld";');
  assert.equal(a.run('getMapDataPath("customMarkers")'), 'campaigns/newworld/maps/shared/customMarkers');
  a.run('activeCampaignId = "oldworld";');
  assert.equal(a.run('getMapDataPath("customMarkers")'), 'campaigns/oldworld/maps/barovia/customMarkers');
});

test('new campaigns are empty while the legacy campaign retains its built-in map', () => {
  const a = app();
  a.run('activeCampaignId = "newworld"; applyCampaignRootMap(null);');
  assert.equal(a.run('campaignRootMap'), null);
  assert.equal(a.get('.map-frame').hidden, true);
  a.run('activeCampaignId = "curse-of-strahd"; applyCampaignRootMap(null);');
  assert.equal(a.run('campaignRootMap.id'), 'barovia');
  assert.equal(a.get('.map-frame').hidden, false);
});

test('player view keeps a workbench switch but hides campaign administration even for a DM', () => {
  const a = app();
  a.run('campaignMemberships = { mine: { role: "dm", name: "Mine", schemaVersion: 2 } }; activeCampaignId = "mine"; renderCampaignList(); updateSessionPanel();');
  assert.equal(a.get('campaign-admin').hidden, true);
  assert.equal(a.get('campaign-invite-form').hidden, true);
  assert.equal(a.get('campaign-management-title').hidden, true);
  const card = a.get('campaign-list').children[0].innerHTML;
  assert.match(card, /data-campaign-open/);
  assert.doesNotMatch(card, /data-campaign-manage|data-campaign-delete|管理地图/);
  assert.equal(a.get('dm-link').hidden, false);
  assert.equal(a.get('dm-link').href, 'dm.html?campaign=mine');
  assert.equal(a.get('map-view-switch').href, 'dm.html?campaign=mine');
});

test('DM workbench retains create, player management and delete controls', () => {
  const a = app('dm');
  a.run('campaignMemberships = { mine: { role: "dm", name: "Mine" } }; activeCampaignId = "mine"; renderCampaignList();');
  assert.equal(a.get('campaign-admin').hidden, false);
  assert.equal(a.get('campaign-invite-form').hidden, false);
  const card = a.get('campaign-list').children[0].innerHTML;
  assert.match(card, /data-campaign-manage/);
  assert.match(card, /data-campaign-delete/);
});

test('player view cannot trigger campaign administration handlers even with DM membership', async () => {
  const a = app();
  a.run('campaignMemberships = { mine: { role: "dm" } }; activeCampaignId = "mine";');
  a.get('campaign-name').value = 'Blocked';
  a.get('campaign-invite-player').value = 'bob';
  const event = { preventDefault() {} };
  await a.get('campaign-create-form').events.submit(event);
  await a.get('campaign-invite-form').events.submit(event);
  await a.get('campaign-member-list').events.click({ target: { closest: () => ({ dataset: { removeCampaignMember: 'bob' } }) } });
  await a.run('deleteCampaign("mine")');
  assert.equal(a.writes.length, 0);
  const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
  assert.doesNotMatch(html, /id="campaign-(create-form|invite-form|member-list)"/);
});

test('membership revocation clears map, pending placement and listeners', () => {
  const a = app();
  a.run('campaignMemberships = { mine: { role: "player" } }; activeCampaignId = "mine"; campaignPickerOpen = false; placementModeActive = true; startCampaignMembershipSync();');
  a.listeners.get('userCampaigns/alice')({ val: () => null });
  assert.equal(a.run('activeCampaignId'), '');
  assert.equal(a.run('campaignPickerOpen'), true);
  assert.equal(a.run('placementModeActive'), false);
  assert.equal(a.run('campaignRootMap'), null);
  assert.equal(a.get('app-shell').hidden, true);
});

test('adding a player carries new campaign schema version', async () => {
  const a = app('dm');
  a.run('campaignMemberships = { mine: { role: "dm", name: "Mine", schemaVersion: 2 } }; activeCampaignId = "mine"; refreshCampaignPlayerManagement = async () => {};');
  a.run('managedCampaignId = "mine"; managedPlayers = [{ uid: "bob", username: "bob", displayName: "Bob", role: "" }];');
  await a.get('campaign-invite-list').events.click({ target: { closest: () => ({ dataset: { invitePlayer: 'bob' } }) } });
  assert.equal(a.writes[0].ref, 'userCampaigns/bob/mine');
  assert.equal(a.writes[0].value.role, 'player');
  assert.equal(a.writes[0].value.schemaVersion, 2);
});

test('removing a player clears both membership and roster in one write', async () => {
  const a = app('dm');
  a.run('campaignMemberships = { mine: { role: "dm" } }; activeCampaignId = "mine"; refreshCampaignPlayerManagement = async () => {};');
  a.run('managedCampaignId = "mine"; managedPlayers = [{ uid: "bob", username: "bob", displayName: "Bob", role: "player" }];');
  const originalRef = a.context.database.ref;
  a.context.database.ref = (ref = '') => ({ ...originalRef(ref), once: async () => ({ val: () => ({ role: 'player' }) }) });
  const button = { dataset: { removeCampaignMember: 'bob', memberUsername: 'bob' } };
  await a.get('campaign-member-list').events.click({ target: { closest: () => button } });
  assert.deepEqual(JSON.parse(JSON.stringify(a.writes[0].updates)), {
    'userCampaigns/bob/mine': null, 'campaigns/mine/playerDirectory/bob': null
  });
});

test('IDs accept non-Latin names and avoid same-millisecond collisions', () => {
  const a = app();
  const ids = new Set(Array.from({ length: 50 }, () => a.run('createCampaignId("测试战役")')));
  assert.equal(ids.size, 50);
  for (const id of ids) assert.match(id, /^[a-z0-9-]{3,40}$/);
});

for (const mode of ['player', 'dm']) {
  test(`${mode} can open user center without selecting a campaign and save a nickname`, async () => {
    const a = app(mode);
    a.run('updateSessionPanel();');
    assert.equal(a.get('user-center-open').hidden, false);
    a.get('user-center-open').events.click();
    assert.equal(a.get('user-center').open, true);
    assert.equal(a.get('profile-username').value, 'alice');
    a.get('display-name-input').value = '  月光旅人  ';
    await a.get('display-name-form').events.submit({ preventDefault() {} });
    assert.equal(a.run('getDisplayName()'), '月光旅人');
    assert.equal(a.get('user-center-name').textContent, '月光旅人');
    assert.match(a.get('session-summary').textContent, /^月光旅人/);
    assert.equal(a.writes[0].updates['users/alice/displayName'], '月光旅人');
    assert.equal(Object.keys(a.writes[0].updates).some(key => key.includes('username')), false);
    assert.equal(a.get('display-name-status').dataset.state, 'success');
  });
}

test('nickname save propagates to all player memberships without writing DM roster entries', async () => {
  const a = app('dm');
  a.context.database.ref = (ref = '') => ({
    once: async () => ({ val: () => ({ one: { role: 'player' }, two: { role: 'player' }, own: { role: 'dm' } }) }),
    update: async updates => a.writes.push({ ref, updates })
  });
  a.get('display-name-input').value = '队友';
  a.get('display-name-visible').checked = false;
  await a.get('display-name-form').events.submit({ preventDefault() {} });
  const updates = a.writes[0].updates;
  for (const campaign of ['one', 'two']) {
    assert.equal(updates[`campaigns/${campaign}/playerDirectory/alice`].displayName, '队友');
    assert.equal(updates[`campaigns/${campaign}/playerDirectory/alice`].showInPlayerList, false);
  }
  assert.equal(updates['campaigns/own/playerDirectory/alice'], undefined);
});

test('invalid names and failed saves preserve the previous displayed name', async () => {
  const a = app();
  for (const name of ['   ', 'a'.repeat(25)]) {
    a.get('display-name-input').value = name;
    await a.get('display-name-form').events.submit({ preventDefault() {} });
    assert.equal(a.writes.length, 0);
    assert.equal(a.get('display-name-status').dataset.state, 'error');
  }
  a.context.database.ref = () => ({ once: async () => { throw Error('offline'); } });
  a.get('display-name-input').value = 'Unsaved';
  await a.get('display-name-form').events.submit({ preventDefault() {} });
  assert.equal(a.run('getDisplayName()'), 'alice');
  assert.equal(a.get('display-name-save').disabled, false);
});

test('profile updates in another tab refresh the name without overwriting an unsaved edit', () => {
  const a = app();
  a.get('display-name-input').value = '正在编辑';
  a.run('startUserProfileSync();');
  a.listeners.get('users/alice')({ val: () => ({ username: 'alice', displayName: '已更新' }) });
  assert.equal(a.get('user-center-name').textContent, '已更新');
  assert.equal(a.get('display-name-input').value, '正在编辑');
});

test('sign-out hides the account button and closes the user center', () => {
  const a = app();
  a.get('user-center-open').events.click();
  a.run('currentUser = null; currentUserProfile = null; updateSessionPanel();');
  assert.equal(a.get('user-center-open').hidden, true);
  assert.equal(a.get('user-center').open, false);
});

test('display name lookup reads only the name and falls back for legacy rules', async () => {
  const a = app();
  a.context.database.ref = ref => {
    assert.equal(ref, 'users/bob/displayName');
    return { once: async () => ({ val: () => '新名字' }) };
  };
  assert.equal(await a.run('loadDisplayName("bob", "bob")'), '新名字');
  a.context.database.ref = () => ({ once: async () => { throw Error('old rules'); } });
  assert.equal(await a.run('loadDisplayName("bob", "bob")'), 'bob');
});

for (const mode of ['player', 'dm']) {
  test(`${mode}: map selection updates URL and returning to list stays there after refresh`, async () => {
    const a = app(mode, '?campaign=old&view=player');
    a.context.window.location.hash = '#section';
    a.run('campaignMemberships = { mine: { role: "dm" } }; startPresenceSync = () => {}; selectCampaign("mine");');
    assert.equal(new URLSearchParams(a.context.window.location.search).get('campaign'), 'mine');
    a.run('openCampaignPicker();');
    assert.equal(a.context.window.location.search, '?view=player');
    assert.equal(a.context.window.location.hash, '#section');
    assert.equal(a.run('campaignPickerOpen'), true);

    const refreshed = app(mode, a.context.window.location.search);
    refreshed.run('ensureUserProfile = async () => ({ username: "alice", role: "player" }); loadCampaignMemberships = async () => { campaignMemberships = { mine: { role: "dm" } }; };');
    await refreshed.run('handleAuthStateChanged({ uid: "alice", email: "alice@barovia.local" })');
    assert.equal(refreshed.run('campaignPickerOpen'), true);
    assert.equal(refreshed.run('activeCampaignId'), '');
  });
}

test('managing players clears the map route without losing the selected campaign', () => {
  const a = app('dm', '?campaign=mine');
  a.run('campaignMemberships = { mine: { role: "dm" } }; refreshCampaignPlayerManagement = async () => {}; selectCampaign("mine", false);');
  assert.equal(a.context.window.location.search, '');
  assert.equal(a.run('activeCampaignId'), 'mine');
  assert.equal(a.run('campaignPickerOpen'), true);
});

test('restoring a deleted or unauthorized map link clears the stale campaign parameter', async () => {
  const a = app('dm', '?campaign=missing');
  a.run('ensureUserProfile = async () => ({ username: "alice", role: "player" });');
  await a.run('handleAuthStateChanged({ uid: "alice", email: "alice@barovia.local" })');
  assert.equal(a.context.window.location.search, '');
  assert.equal(a.run('campaignPickerOpen'), true);
});

test('UI defaults to English and restores a saved Chinese preference', () => {
  const english = app();
  assert.equal(english.run('t("User Center")'), 'User Center');
  assert.equal(english.get('language-toggle').textContent, '中文');
  assert.equal(english.context.document.documentElement.getAttribute('lang'), 'en');
  const chinese = app('dm', '', 'zh');
  assert.equal(chinese.run('t("User Center")'), '用户中心');
  assert.equal(chinese.get('language-toggle').textContent, 'English');
  assert.equal(chinese.context.document.documentElement.getAttribute('lang'), 'zh-CN');
});

for (const mode of ['player', 'dm']) {
  test(`${mode}: language switching preserves map, URL, nickname draft, upload and placement`, () => {
    const a = app(mode, '?campaign=mine');
    a.run('campaignMemberships = { mine: { role: "dm", name: "Gate" } }; activeCampaignId = "mine"; campaignPickerOpen = false; currentMap = { id: "floor-two", title: "二楼地图" }; campaignRootMap = { id: "root" }; placementModeActive = true; currentUserProfile.displayName = "Save Changes";');
    a.get('display-name-input').value = '未保存的名字';
    a.get('dm-marker-title').value = 'Town';
    a.get('dm-marker-image-upload').files = [{ name: '中文地图.png' }];
    a.get('language-toggle').events.click();
    assert.equal(a.run('window.I18n.language'), 'zh');
    assert.equal(a.run('currentMap.id'), 'floor-two');
    assert.equal(a.run('placementModeActive'), true);
    assert.equal(a.get('display-name-input').value, '未保存的名字');
    assert.equal(a.get('dm-marker-title').value, 'Town');
    assert.equal(a.get('dm-marker-image-upload').files[0].name, '中文地图.png');
    assert.equal(a.get('user-center-name').textContent, 'Save Changes');
    assert.equal(a.context.window.location.search, '?campaign=mine');
    assert.equal(a.context.window.localStorage.getItem('dnd-map-language'), 'zh');
    assert.equal(a.get('language-toggle').getAttribute('aria-label'), '切换为英文');
    assert.equal(a.run('MARKER_ICON_DEFINITIONS[0].label'), '大门');
    a.get('language-toggle').events.click();
    assert.equal(a.run('MARKER_ICON_DEFINITIONS[0].label'), 'Gate');
    assert.equal(a.get('language-toggle').textContent, '中文');
  });
}

test('visible status messages translate immediately while names stay verbatim', () => {
  const a = app();
  a.run('setAuthMessage("{name} was removed from this campaign.", "success", { name: "<Gate>中文" });');
  assert.equal(a.get('auth-message').textContent, '<Gate>中文 was removed from this campaign.');
  a.run('window.I18n.setLanguage("zh")');
  assert.equal(a.get('auth-message').textContent, '已将<Gate>中文从此战役移除。');
  a.run('window.I18n.setLanguage("en")');
  assert.equal(a.get('auth-message').textContent, '<Gate>中文 was removed from this campaign.');
});

test('language remains usable when browser storage is unavailable', () => {
  const a = app();
  a.context.window.localStorage.setItem = () => { throw Error('blocked storage'); };
  assert.doesNotThrow(() => a.run('window.I18n.setLanguage("zh")'));
  assert.equal(a.run('t("Save Changes")'), '保存修改');
});

for (const mode of ['player', 'dm']) {
  test(`${mode}: language switching keeps signed-in copy instead of restoring the initial HTML`, () => {
    const a = app(mode);
    const expected = mode === 'dm'
      ? 'Choose a campaign to manage its maps and players, or create a new campaign.'
      : 'Choose a campaign to view the places and characters your DM has revealed.';
    a.get('auth-copy').setAttribute('data-i18n', 'One account can host your own campaigns and join others as a player.');
    a.run('campaignPickerOpen = true; window.I18n.setLanguage("zh");');
    assert.equal(a.get('auth-copy').textContent, a.run(`t(${JSON.stringify(expected)})`));
    a.run('window.I18n.setLanguage("en");');
    assert.equal(a.get('auth-copy').textContent, expected);
    a.run('currentUser = null; window.I18n.setLanguage("zh");');
    const signedOut = mode === 'dm'
      ? 'Sign in or register to create a campaign and manage your maps and players as a DM.'
      : 'One account can host your own campaigns and join others as a player.';
    assert.equal(a.get('auth-copy').textContent, a.run(`t(${JSON.stringify(signedOut)})`));
  });
}

test('only explicitly tagged UI is translated, including dynamic text and accessible labels', () => {
  const a = app();
  a.get('auth-title').setAttribute('data-i18n', 'Player View');
  a.get('unmarked-content').textContent = 'Save Changes';
  a.run('window.I18n.setText(document.getElementById("test-button"), "Save Icon"); window.I18n.setAttribute(document.getElementById("test-button"), "aria-label", "Open {name}", { name: "Gate" }); window.I18n.setLanguage("zh");');
  assert.equal(a.get('auth-title').textContent, '玩家页面');
  assert.equal(a.get('test-button').textContent, '保存图标');
  assert.equal(a.get('test-button').getAttribute('aria-label'), '打开Gate');
  assert.equal(a.get('unmarked-content').textContent, 'Save Changes');
});

test('avatars accept only the configured HTTPS image host and safe photo formats', () => {
  const a = app();
  const valid = 'https://res.cloudinary.com/ehj3olxo/image/upload/v1/avatar.png';
  assert.equal(a.run(`safeAvatarUrl(${JSON.stringify(valid)})`), valid);
  for (const url of ['javascript:alert(1)', 'https://evil.example/photo.png',
    'https://res.cloudinary.com/another/image/upload/a.png', 'http://res.cloudinary.com/ehj3olxo/image/upload/a.png',
    'https://evil@res.cloudinary.com/ehj3olxo/image/upload/a.png']) {
    assert.equal(a.run(`safeAvatarUrl(${JSON.stringify(url)})`), '');
  }
  assert.equal(a.run('getAvatarValidationError({ name: "me.webp", type: "image/webp", size: 1024 })'), '');
  for (const file of [
    { name: 'me.svg', type: 'image/svg+xml', size: 100 },
    { name: 'me.png', type: 'image/png', size: 3 * 1024 * 1024 },
    { name: 'me.jpg', type: 'image/jpeg', size: 0 }
  ]) assert.ok(a.run(`getAvatarValidationError(${JSON.stringify(file)})`));
  const html = a.run('avatarMarkup("<script>", "javascript:alert(1)")');
  assert.doesNotMatch(html, /<script|<img/);
  assert.match(html, /&lt;/);
});

test('selected avatar is a local preview until Save, and language switching preserves it', async () => {
  const a = app();
  a.get('user-center-open').events.click();
  a.get('profile-avatar-input').files = [{ name: 'me.png', type: 'image/png', size: 800 }];
  await a.get('profile-avatar-input').events.change();
  assert.equal(a.writes.length, 0);
  assert.equal(a.run('avatarPreviewUrl'), 'blob:test-avatar');
  a.run('window.I18n.setLanguage("zh")');
  assert.equal(a.run('avatarDraft.file.name'), 'me.png');
  a.get('user-center').events.close();
  assert.equal(a.run('avatarDraft'), null);
  assert.equal(a.run('avatarPreviewUrl'), '');
});

test('cancelling a crop preserves the existing unsaved avatar', async () => {
  const a = app();
  a.get('user-center-open').events.click();
  a.run('avatarDraft = { file: { name: "previous.png" }, url: "" }; avatarPreviewUrl = "blob:previous";');
  a.context.window.AvatarCropper.open = async () => null;
  a.get('profile-avatar-input').files = [{ name: 'new.png', type: 'image/png', size: 800 }];
  await a.get('profile-avatar-input').events.change();
  assert.equal(a.run('avatarDraft.file.name'), 'previous.png');
  assert.equal(a.run('avatarPreviewUrl'), 'blob:previous');
  assert.equal(a.writes.length, 0);
});

test('closing the user center discards a pending crop result', async () => {
  const a = app();
  a.get('user-center-open').events.click();
  let finish;
  a.context.window.AvatarCropper.open = () => new Promise(resolve => { finish = resolve; });
  a.get('profile-avatar-input').files = [{ name: 'new.png', type: 'image/png', size: 800 }];
  const pending = a.get('profile-avatar-input').events.change();
  a.get('user-center').close();
  a.get('user-center').events.close();
  finish({ name: 'avatar.png', type: 'image/png', size: 100 });
  await pending;
  assert.equal(a.run('avatarDraft'), null);
  assert.equal(a.run('avatarPreviewUrl'), '');
  assert.equal(a.writes.length, 0);
});

test('avatar upload and nickname are saved atomically to profile and every player roster', async () => {
  const a = app();
  a.run('avatarDraft = { file: { name: "me.png", type: "image/png", size: 20 }, url: "" }; uploadImageToCloudinary = async () => ({ path: "https://res.cloudinary.com/ehj3olxo/image/upload/v1/me.png" });');
  const originalRef = a.context.database.ref;
  a.context.database.ref = (ref = '') => ({ ...originalRef(ref),
    once: async () => ({ val: () => ({ one: { role: 'player' }, own: { role: 'dm' } }) }) });
  a.get('display-name-input').value = 'Hero';
  await a.get('display-name-form').events.submit({ preventDefault() {} });
  const update = a.writes[0].updates;
  assert.equal(update['users/alice/avatarUrl'], 'https://res.cloudinary.com/ehj3olxo/image/upload/v1/me.png');
  assert.equal(update['campaigns/one/playerDirectory/alice'].avatarUrl, update['users/alice/avatarUrl']);
  assert.equal(update['users/alice/displayName'], 'Hero');
  assert.equal(update['campaigns/own/playerDirectory/alice'], undefined);
  assert.equal(a.run('avatarDraft'), null);
  assert.equal(a.get('profile-avatar-input').disabled, false);
});

test('removing an avatar clears profile and roster photo without deleting the account', async () => {
  const a = app();
  a.run('currentUserProfile.avatarUrl = "https://res.cloudinary.com/ehj3olxo/image/upload/old.png";');
  const originalRef = a.context.database.ref;
  a.context.database.ref = (ref = '') => ({ ...originalRef(ref),
    once: async () => ({ val: () => ({ one: { role: 'player' } }) }) });
  a.get('display-name-input').value = 'Hero';
  a.get('profile-avatar-remove').events.click();
  await a.get('display-name-form').events.submit({ preventDefault() {} });
  const update = a.writes[0].updates;
  assert.equal(update['users/alice/avatarUrl'], null);
  assert.equal(update['campaigns/one/playerDirectory/alice'].avatarUrl, undefined);
  assert.equal(update['users/alice'], undefined);
});

test('failed profile save preserves uploaded avatar for retry without uploading twice', async () => {
  const a = app();
  a.run('avatarDraft = { file: { name: "me.png", type: "image/png", size: 20 }, url: "" }; let uploadCount = 0; uploadImageToCloudinary = async () => { uploadCount++; return { path: "https://res.cloudinary.com/ehj3olxo/image/upload/me.png" }; };');
  const originalRef = a.context.database.ref;
  a.context.database.ref = (ref = '') => ({ ...originalRef(ref), update: async () => { throw Error('offline'); } });
  a.get('display-name-input').value = 'Hero';
  await a.get('display-name-form').events.submit({ preventDefault() {} });
  assert.equal(a.run('currentUserProfile.avatarUrl'), undefined);
  assert.ok(a.run('avatarDraft.url'));
  a.context.database.ref = originalRef;
  await a.get('display-name-form').events.submit({ preventDefault() {} });
  assert.equal(a.run('uploadCount'), 1);
  assert.equal(a.writes.length, 1);
});

test('failed avatar upload does not save half of a profile', async () => {
  const a = app();
  a.run('avatarDraft = { file: { name: "me.png", type: "image/png", size: 20 }, url: "" }; uploadImageToCloudinary = async () => { throw Error("offline"); };');
  a.get('display-name-input').value = 'Hero';
  await a.get('display-name-form').events.submit({ preventDefault() {} });
  assert.equal(a.writes.length, 0);
  assert.equal(a.run('currentUserProfile.username'), 'alice');
  assert.equal(a.get('display-name-status').dataset.state, 'error');
  assert.equal(a.get('profile-avatar-input').disabled, false);
});

function managedApp() {
  const a = app('dm');
  a.run('campaignMemberships = { mine: { role: "dm", name: "Mine", schemaVersion: 2 } }; activeCampaignId = "mine"; managedCampaignId = "mine";');
  return a;
}

test('player lists search by nickname and username, paginate, and clamp after removal', () => {
  const a = managedApp();
  a.run('managedPlayers = Array.from({ length: 15 }, (_, i) => ({ uid: "id" + i, username: "user" + i, displayName: i === 13 ? "月光旅人" : "Hero " + i, role: "player" })); renderPlayerManagement();');
  assert.equal(a.run('getPlayerPage("member").items.length'), 6);
  a.get('member-next').events.click();
  assert.equal(a.run('getPlayerPage("member").page'), 2);
  a.get('member-search').value = '@user13';
  a.get('member-search').events.input();
  assert.equal(a.run('getPlayerPage("member").items[0].displayName'), '月光旅人');
  assert.equal(a.run('getPlayerPage("member").page'), 1);
  a.get('member-search').value = '月光';
  assert.equal(a.run('getPlayerPage("member").matches'), 1);
  a.get('member-search').value = '';
  a.run('playerPages.member = 3; managedPlayers = managedPlayers.slice(0, 6); renderPlayerManagement();');
  assert.equal(a.run('playerPages.member'), 1);
  assert.equal(a.get('member-next').disabled, true);
});

test('management reads directory once and separates members from available players', async () => {
  const a = managedApp();
  let directoryReads = 0;
  const data = {
    usernameDirectory: { bob: 'bob', charlie: 'charlie', alice: 'alice' },
    'userCampaigns/alice/mine': { role: 'dm' }, 'userCampaigns/bob/mine': { role: 'player' },
    'users/bob/displayName': 'Bob the Bard', 'users/charlie/displayName': 'Charlie'
  };
  a.context.database.ref = ref => ({ once: async () => {
    if (ref === 'usernameDirectory') directoryReads++;
    return { val: () => data[ref] ?? null };
  } });
  await a.run('refreshCampaignPlayerManagement()');
  assert.equal(directoryReads, 1);
  assert.equal(a.run('getPlayerPage("member").items[0].uid'), 'bob');
  assert.equal(a.run('getPlayerPage("invite").items[0].uid'), 'charlie');
  assert.equal(a.run('managedPlayers.length'), 2);
  a.get('member-search').value = 'no match';
  a.get('member-search').events.input();
  assert.match(a.get('campaign-member-list').innerHTML, /No matching players/);
});

test('switching campaigns discards old member-loading responses', async () => {
  const a = managedApp();
  let resolve;
  a.context.database.ref = () => ({ once: () => new Promise(done => { resolve = done; }) });
  const pending = a.run('refreshCampaignPlayerManagement()');
  a.run('activeCampaignId = "another"; playerManagementGeneration++; managedPlayers = [{ uid: "new" }];');
  resolve({ val: () => ({ bob: 'bob' }) });
  await pending;
  assert.equal(a.run('managedPlayers[0].uid'), 'new');
});

test('returning from a different map hides the old party until the new campaign loads', async () => {
  const a = managedApp();
  a.run('campaignMemberships.another = { role: "dm", name: "Another" }; activeCampaignId = "another"; renderCampaignList();');
  assert.equal(a.get('player-management').hidden, true);
  a.run('let refreshedCampaign = ""; refreshCampaignPlayerManagement = async () => { refreshedCampaign = activeCampaignId; }; openCampaignPicker();');
  assert.equal(a.run('refreshedCampaign'), 'another');
});

test('failed member loading gives a retry state without stale action buttons', async () => {
  const a = managedApp();
  a.context.database.ref = () => ({ once: async () => { throw Error('offline'); } });
  await a.run('refreshCampaignPlayerManagement()');
  assert.equal(a.run('playersLoadFailed'), true);
  assert.equal(a.get('players-refresh').disabled, false);
  assert.match(a.get('campaign-member-list').innerHTML, /Refresh Players/);
});

test('duplicate player actions are ignored and a changed DM membership is never removed', async () => {
  const a = managedApp();
  a.run('managedPlayers = [{ uid: "bob", username: "bob", displayName: "Bob", role: "player" }];');
  let resolve;
  a.context.database.ref = () => ({ once: () => new Promise(done => { resolve = done; }) });
  const pending = a.run('changeCampaignPlayer("bob", true)');
  await a.run('changeCampaignPlayer("bob", true)');
  assert.equal(a.run('pendingPlayerActions.size'), 1);
  a.run('refreshCampaignPlayerManagement = async () => {};');
  resolve({ val: () => ({ role: 'dm' }) });
  await pending;
  assert.equal(a.writes.length, 0);
  assert.equal(a.run('pendingPlayerActions.size'), 0);
});

test('language switching preserves player queries and escapes user-generated names', () => {
  const a = managedApp();
  a.run('managedPlayers = [{ uid: "bob", username: "bob", displayName: "<script>Bob</script>", role: "" }];');
  a.get('invite-search').value = 'Bob';
  a.run('window.I18n.setLanguage("zh");');
  assert.equal(a.get('invite-search').value, 'Bob');
  assert.match(a.get('campaign-invite-list').innerHTML, /&lt;script&gt;Bob/);
  assert.doesNotMatch(a.get('campaign-invite-list').innerHTML, /<script>/);
  assert.match(a.get('campaign-invite-list').innerHTML, /添加成员/);
});
