// A deliberately local adapter for the existing app workflow, not an auth/security service.
// No Firebase SDK, remote database or upload endpoint is used in this branch.
(() => {
  "use strict";
  const storageKey = "dnd-map-demo-v1";
  const sessionKey = "dnd-map-demo-session-v1";
  const clone = value => value === undefined ? null : JSON.parse(JSON.stringify(value));
  const listeners = new Map();
  const authListeners = new Set();
  let persistent = true;
  let state = window.DemoSeed.create();
  try {
    const saved = JSON.parse(window.localStorage.getItem(storageKey) || "null");
    if (saved?.version === 1 && saved.data?.users?.["demo-dm"] && saved.data?.campaigns && saved.data?.userCampaigns && saved.data?.usernameDirectory) state = saved.data;
  } catch { persistent = false; }
  const query = new URLSearchParams(window.location.search);
  let active = query.has("demo");
  try {
    if (active) window.sessionStorage.setItem(sessionKey, "1");
    active ||= window.sessionStorage.getItem(sessionKey) === "1";
  } catch {} // Explicit entry URLs also work when browser storage is blocked.
  let currentUser = active ? makeUser() : null;

  function makeUser() {
    const role = document.body.dataset.view === "dm" ? "dm" : "player";
    const uid = "demo-" + role;
    return { uid, email: "demo" + role + "@demo.invalid", displayName: "demo" + role,
      async updateProfile(update) { this.displayName = update.displayName; } };
  }
  function parts(path) {
    const result = String(path || "").split("/").filter(Boolean);
    if (result.some(part => ["__proto__", "constructor", "prototype"].includes(part))) throw new Error("Invalid demo data path.");
    return result;
  }
  function read(path, tree = state) {
    return parts(path).reduce((node, key) => node && Object.prototype.hasOwnProperty.call(node, key) ? node[key] : null, tree) ?? null;
  }
  function write(tree, path, value) {
    const keys = parts(path);
    if (!keys.length) throw new Error("Replacing the demo database root is not supported.");
    let node = tree;
    for (const key of keys.slice(0, -1)) {
      if (!node[key] || typeof node[key] !== "object") node[key] = {};
      node = node[key];
    }
    if (value === null) delete node[keys.at(-1)];
    else node[keys.at(-1)] = clone(value);
  }
  function snapshot(path) {
    const value = clone(read(path));
    return { val: () => clone(value), exists: () => value !== null };
  }
  function related(a, b) { return !a || !b || a === b || a.startsWith(b + "/") || b.startsWith(a + "/"); }
  function notify(paths) {
    for (const [path, callbacks] of listeners) {
      if (!paths.some(changed => related(path, changed))) continue;
      for (const callback of callbacks) queueMicrotask(() => {
        if (listeners.get(path)?.has(callback)) callback(snapshot(path));
      });
    }
  }
  function allowed(path, value) {
    if (!currentUser) return false;
    if (currentUser.uid === "demo-dm") return true;
    const uid = currentUser.uid;
    const p = parts(path);
    return (p[0] === "users" && p[1] === uid) ||
      (p[0] === "usernameDirectory" && p[1] === "demoplayer" && value === uid) ||
      (p[0] === "campaigns" && p[2] === "playerDirectory" && p[3] === uid && !!read("userCampaigns/" + uid + "/" + p[1]));
  }
  async function commit(updates) {
    for (const [path, value] of Object.entries(updates)) {
      parts(path);
      if (!allowed(path, value)) throw new Error("Player demo cannot edit campaigns. Switch to the DM demo.");
    }
    const next = clone(state);
    for (const [path, value] of Object.entries(updates)) write(next, path, value);
    const payload = JSON.stringify({ version: 1, data: next });
    if (payload.length > 4000000) throw new Error("Demo storage is full. Reset the demo or use smaller images.");
    if (persistent) {
      try { window.localStorage.setItem(storageKey, payload); }
      catch (error) {
        if (error?.name === "QuotaExceededError") throw new Error("Demo storage is full. Reset the demo or use smaller images.");
        persistent = false;
        updateStorageNotice();
      }
    }
    state = next;
    notify(Object.keys(updates));
  }
  function ref(path = "") {
    path = parts(path).join("/");
    return {
      key: parts(path).at(-1) || null,
      child: suffix => ref([path, suffix].filter(Boolean).join("/")),
      push: () => ref([path, "local-" + crypto.randomUUID()].filter(Boolean).join("/")),
      async once() { return snapshot(path); },
      on(event, callback) {
        if (!listeners.has(path)) listeners.set(path, new Set());
        listeners.get(path).add(callback);
        queueMicrotask(() => { if (listeners.get(path)?.has(callback)) callback(snapshot(path)); });
        return callback;
      },
      off() { listeners.delete(path); },
      set: value => commit({ [path]: value }),
      update: updates => commit(Object.fromEntries(Object.entries(updates).map(([key, value]) => [[path, key].filter(Boolean).join("/"), value])))
    };
  }
  function updateStorageNotice() {
    const element = document.getElementById("demo-storage-note");
    if (element) window.I18n.setText(element, persistent
      ? "Changes stay in this browser. No account, cloud uploads, or production data."
      : "Browser storage is unavailable. Changes last only until this page is closed or refreshed.");
  }
  async function uploadImage(file) {
    if (!file || !/^image\/(png|jpeg|webp|gif|avif)$/.test(file.type) || !file.size || file.size > 2 * 1024 * 1024) {
      throw new Error(window.I18n.t("Demo images must be JPG, PNG, WebP, GIF or AVIF, up to 2 MB."));
    }
    const path = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Could not read this image."));
      reader.readAsDataURL(file);
    });
    return { fileName: file.name, path };
  }
  function reset() {
    state = window.DemoSeed.create();
    try { window.localStorage.removeItem(storageKey); } catch {}
    notify([""]);
  }
  window.addEventListener("storage", event => {
    if (event.key !== storageKey) return;
    try {
      const next = event.newValue ? JSON.parse(event.newValue) : null;
      if (next && (next.version !== 1 || !next.data?.users || !next.data?.campaigns)) return;
      const incoming = next?.data || window.DemoSeed.create();
      // Notify only changed subscribed paths; unrelated profile writes must not reset a submap.
      const changed = [...listeners.keys()].filter(path => JSON.stringify(read(path)) !== JSON.stringify(read(path, incoming)));
      state = incoming;
      notify(changed);
    } catch {} // Ignore invalid stored demo data without affecting the current session.
  });
  window.DemoBackend = {
    database: { ref }, uploadImage, reset, storageKey,
    images: window.DemoSeed.images,
    imagePath: name => window.DemoSeed.images.includes(name) ? "assets/demo/" + name : "",
    isLocalImage: value => typeof value === "string" && /^data:image\/(png|jpeg|webp|gif|avif);base64,[A-Za-z0-9+/=]+$/.test(value),
    auth: {
      onAuthStateChanged(callback) { authListeners.add(callback); queueMicrotask(() => callback(currentUser)); },
      async signOut() {
        currentUser = null;
        try { window.sessionStorage.removeItem(sessionKey); } catch {}
        const url = new URL(window.location.href);
        url.searchParams.delete("demo"); url.searchParams.delete("campaign");
        window.history.replaceState(null, "", url.pathname + url.search);
        for (const callback of authListeners) await callback(null);
      },
      async signInWithEmailAndPassword() { throw new Error("Use the demo entry buttons. No real sign-in is available here."); },
      async createUserWithEmailAndPassword() { throw new Error("Registration is disabled in this local demo."); }
    }
  };
  document.getElementById("demo-reset")?.addEventListener("click", () => {
    if (!window.confirm(window.I18n.t("Reset all demo changes in this browser? Your real campaigns are not affected."))) return;
    reset();
    window.location.assign((document.body.dataset.view === "dm" ? "dm.html" : "index.html") + "?demo=1&campaign=" + window.DemoSeed.campaignId);
  });
  window.addEventListener("languagechange", updateStorageNotice);
  updateStorageNotice();
})();
