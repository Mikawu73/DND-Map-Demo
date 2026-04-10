const markerButtons = Array.from(document.querySelectorAll(".map-marker, .portrait-marker"));
const locationPanel = document.getElementById("location-panel");
const locationTitle = document.getElementById("location-title");
const locationEyebrow = document.getElementById("location-eyebrow");
const locationPanelBody = document.getElementById("location-panel-body");
const markerToggle = document.getElementById("marker-toggle");
const mapReturn = document.getElementById("map-return");
const mapStage = document.getElementById("map-stage");
const mapLayout = document.querySelector(".map-layout");
const mapImage = document.getElementById("barovia-map");
const portraitRail = document.getElementById("portrait-rail");
const dmControls = document.getElementById("dm-controls");
const dmLocationList = document.getElementById("dm-location-list");
const dmPortraitList = document.getElementById("dm-portrait-list");
const viewIntro = document.getElementById("view-intro");
const mapTitle = document.getElementById("map-title");
const appShell = document.getElementById("app-shell");
const authForm = document.getElementById("auth-form");
const authUsernameInput = document.getElementById("auth-username");
const authPasswordInput = document.getElementById("auth-password");
const authSigninButton = document.getElementById("auth-signin");
const authSignupButton = document.getElementById("auth-signup");
const authSignoutButton = document.getElementById("auth-signout");
const authMessage = document.getElementById("auth-message");
const authCopy = document.getElementById("auth-copy");
const sessionPanel = document.getElementById("session-panel");
const sessionSummary = document.getElementById("session-summary");
const dmLink = document.getElementById("dm-link");

const VISIBILITY_STORAGE_KEY = "barovia-marker-visibility";
const VISIBILITY_STORAGE_VERSION_KEY = "barovia-marker-visibility-version";
const VISIBILITY_STORAGE_VERSION = 2;
const FIREBASE_PATH = "maps/barovia/markerVisibility";
const USERS_PATH = "users";
const ROOT_MAP = {
  id: "barovia",
  src: "assets/images/Map%20-%20Barovia.jpg",
  alt: "Illustrated map of Barovia",
  title: "Map of Barovia"
};
const AUTH_CONFIG = window.APP_AUTH_CONFIG || {};
const USERNAME_DOMAIN = AUTH_CONFIG.usernameDomain || "barovia.local";
const ADMIN_ROLE = AUTH_CONFIG.adminRole || "admin";
const params = new URLSearchParams(window.location.search);
const bodyViewMode = document.body.dataset.view;
const viewMode =
  bodyViewMode === "dm" || bodyViewMode === "player"
    ? bodyViewMode
    : params.get("view") === "dm"
      ? "dm"
      : "player";
const DEFAULT_REVEALED_MARKERS = {
  "barovia:gates-of-barovia-east": true,
  "barovia:roadside-corpse": true,
  "barovia:fortunetellers-tent": true,
  "barovia:village-of-barovia": true,
  "village-of-barovia:bildraths-mercantile": true,
  "village-of-barovia:blood-on-the-vine-tavern": true,
  "village-of-barovia:mad-marys-townhouse": true,
  "village-of-barovia:burgomasters-mansion": true,
  "village-of-barovia:donavich-portrait": true,
  "village-of-barovia:doru-portrait": true,
  "village-of-barovia:ireena-kolyana-portrait": true,
  "village-of-barovia:ismark-the-lesser-portrait": true,
  "village-of-barovia:mad-mary-portrait": true,
  "village-of-barovia:parriwimple-portrait": true
};
const markerVisibility = loadMarkerVisibility();
const mapHistory = [{ ...ROOT_MAP }];

let currentMap = { ...ROOT_MAP };
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDatabase = null;
let databaseRef = null;
let firebaseReady = false;
let firebaseSyncStarted = false;
let currentUser = null;
let currentUserProfile = null;
let unauthorizedRedirectTimer = null;

function loadMarkerVisibility() {
  try {
    const stored = window.localStorage.getItem(VISIBILITY_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
    const storedVersion = Number(
      window.localStorage.getItem(VISIBILITY_STORAGE_VERSION_KEY) || "0"
    );

    if (storedVersion < VISIBILITY_STORAGE_VERSION) {
      return { ...parsed, ...DEFAULT_REVEALED_MARKERS };
    }

    return { ...DEFAULT_REVEALED_MARKERS, ...parsed };
  } catch (error) {
    console.warn("Unable to read marker visibility from localStorage.", error);
    return { ...DEFAULT_REVEALED_MARKERS };
  }
}

function saveMarkerVisibility() {
  try {
    window.localStorage.setItem(
      VISIBILITY_STORAGE_KEY,
      JSON.stringify(markerVisibility)
    );
    window.localStorage.setItem(
      VISIBILITY_STORAGE_VERSION_KEY,
      String(VISIBILITY_STORAGE_VERSION)
    );
  } catch (error) {
    console.warn("Unable to save marker visibility to localStorage.", error);
  }
}

function getMarkerScope(marker) {
  return marker.dataset.mapId || ROOT_MAP.id;
}

function getMarkerVisibilityKey(marker) {
  return `${getMarkerScope(marker)}:${marker.dataset.locationId}`;
}

function isMarkerRevealed(marker) {
  return markerVisibility[getMarkerVisibilityKey(marker)] ?? false;
}

function isMarkerOnCurrentMap(marker) {
  const scope = getMarkerScope(marker);
  return scope === currentMap.id || scope === "global";
}

function isPortraitMarker(marker) {
  return marker.classList.contains("portrait-marker");
}

function isAdminProfile(profile) {
  return profile?.role === ADMIN_ROLE;
}

function canAccessCurrentView() {
  if (!currentUser) {
    return false;
  }

  return viewMode === "dm" ? isAdminProfile(currentUserProfile) : true;
}

function setAuthMessage(message, type = "info") {
  if (!authMessage) {
    return;
  }

  if (!message) {
    authMessage.hidden = true;
    authMessage.textContent = "";
    authMessage.dataset.state = "";
    return;
  }

  authMessage.hidden = false;
  authMessage.textContent = message;
  authMessage.dataset.state = type;
}

function setAuthBusy(isBusy) {
  if (authUsernameInput) {
    authUsernameInput.disabled = isBusy;
  }

  if (authPasswordInput) {
    authPasswordInput.disabled = isBusy;
  }

  if (authSigninButton) {
    authSigninButton.disabled = isBusy;
  }

  if (authSignupButton) {
    authSignupButton.disabled = isBusy;
  }
}

function normalizeUsername(value) {
  return value.trim().toLowerCase();
}

function isValidUsername(username) {
  return /^[a-z0-9._-]{3,24}$/.test(username);
}

function usernameToEmail(username) {
  return `${username}@${USERNAME_DOMAIN}`;
}

function getDisplayName() {
  return currentUserProfile?.username || currentUser?.displayName || currentUser?.email || "Unknown user";
}

function applyVisibilitySnapshot(nextVisibility) {
  for (const key of Object.keys(markerVisibility)) {
    delete markerVisibility[key];
  }

  Object.assign(markerVisibility, DEFAULT_REVEALED_MARKERS, nextVisibility || {});
  saveMarkerVisibility();
  applyAllMarkerStates();

  if (viewMode === "dm" && canAccessCurrentView()) {
    renderDmControls();
  }
}

function broadcastVisibilityState() {
  if (viewMode !== "dm" || !canAccessCurrentView() || !firebaseReady || !databaseRef) {
    return;
  }

  databaseRef.set(markerVisibility).catch((error) => {
    console.warn("Unable to sync marker visibility to Firebase.", error);
    setAuthMessage("DM state could not be saved to Firebase. Check your database rules.", "error");
  });
}

function setMarkerRevealed(marker, revealed) {
  if (viewMode === "dm" && !canAccessCurrentView()) {
    return;
  }

  markerVisibility[getMarkerVisibilityKey(marker)] = revealed;
  saveMarkerVisibility();
  applyAllMarkerStates();

  if (viewMode === "dm") {
    renderDmControls();
    broadcastVisibilityState();
  }
}

function stopFirebaseSync() {
  if (databaseRef) {
    databaseRef.off();
  }

  databaseRef = null;
  firebaseReady = false;
  firebaseSyncStarted = false;
}

function initializeFirebaseServices() {
  if (!window.firebase || !window.FIREBASE_CONFIG) {
    setAuthMessage("Firebase SDK or config is unavailable, so authentication cannot start.", "error");
    return false;
  }

  try {
    firebaseApp = window.firebase.apps.length
      ? window.firebase.app()
      : window.firebase.initializeApp(window.FIREBASE_CONFIG);
    firebaseAuth = window.firebase.auth(firebaseApp);
    firebaseDatabase = window.firebase.database(firebaseApp);
    return true;
  } catch (error) {
    console.warn("Unable to initialize Firebase services.", error);
    setAuthMessage("Firebase could not be initialized. Check your config and reload the page.", "error");
    return false;
  }
}

function initializeFirebaseSync() {
  if (!firebaseDatabase || firebaseSyncStarted) {
    return;
  }

  databaseRef = firebaseDatabase.ref(FIREBASE_PATH);
  firebaseReady = true;
  firebaseSyncStarted = true;

  databaseRef.on("value", (snapshot) => {
    const data = snapshot.val();

    if (data && typeof data === "object") {
      applyVisibilitySnapshot(data);
      return;
    }

    if (viewMode === "dm" && canAccessCurrentView()) {
      broadcastVisibilityState();
    }
  }, (error) => {
    console.warn("Unable to read marker visibility from Firebase.", error);
    setAuthMessage("Map sync could not read Firebase data. Check your database rules.", "error");
  });
}

async function loadUserProfile(uid) {
  if (!firebaseDatabase || !uid) {
    return null;
  }

  try {
    const snapshot = await firebaseDatabase.ref(`${USERS_PATH}/${uid}`).once("value");
    const profile = snapshot.val();
    return profile && typeof profile === "object" ? profile : null;
  } catch (error) {
    console.warn("Unable to load user profile.", error);
    return null;
  }
}

async function ensureUserProfile(user, username) {
  if (!firebaseDatabase || !user) {
    return null;
  }

  const userRef = firebaseDatabase.ref(`${USERS_PATH}/${user.uid}`);
  const now = new Date().toISOString();
  let nextProfile = null;

  try {
    const snapshot = await userRef.once("value");
    const existingProfile = snapshot.val();

    nextProfile = {
      username: username || existingProfile?.username || user.displayName || user.email?.split("@")[0] || "player",
      role: existingProfile?.role || "player",
      createdAt: existingProfile?.createdAt || now,
      lastLoginAt: now
    };

    await userRef.update(nextProfile);

    if (user.displayName !== nextProfile.username) {
      await user.updateProfile({ displayName: nextProfile.username });
    }

    return nextProfile;
  } catch (error) {
    console.warn("Unable to ensure user profile.", error);
    throw error;
  }
}

function scheduleUnauthorizedRedirect() {
  if (viewMode !== "dm") {
    return;
  }

  window.clearTimeout(unauthorizedRedirectTimer);
  unauthorizedRedirectTimer = window.setTimeout(() => {
    window.location.href = "index.html";
  }, 1800);
}

function cancelUnauthorizedRedirect() {
  window.clearTimeout(unauthorizedRedirectTimer);
  unauthorizedRedirectTimer = null;
}

function updateAuthCopy() {
  if (!authCopy) {
    return;
  }

  if (!currentUser) {
    authCopy.textContent =
      viewMode === "dm"
        ? "Only the admin account can open the DM controls for this page."
        : "Players need an account before they can open the shared map.";
    return;
  }

  if (viewMode === "dm" && !canAccessCurrentView()) {
    authCopy.textContent = "This account is signed in, but it does not have DM access.";
    return;
  }

  authCopy.textContent =
    viewMode === "dm"
      ? "You are signed in with the DM account."
      : "You are signed in and can open the player map.";
}

function updateSessionPanel() {
  if (!sessionPanel || !sessionSummary) {
    return;
  }

  if (!currentUser) {
    sessionPanel.hidden = true;
    sessionSummary.textContent = "";
    if (authForm) {
      authForm.hidden = false;
    }
    return;
  }

  if (authForm) {
    authForm.hidden = true;
  }

  const roleLabel = isAdminProfile(currentUserProfile) ? "admin" : "player";
  sessionPanel.hidden = false;
  sessionSummary.textContent = `Signed in as ${getDisplayName()} (${roleLabel}).`;

  if (dmLink) {
    dmLink.hidden = !isAdminProfile(currentUserProfile);
  }
}

function updateAppVisibility() {
  const allowed = canAccessCurrentView();

  if (appShell) {
    appShell.hidden = !allowed;
  }

  if (dmControls) {
    dmControls.hidden = viewMode !== "dm" || !allowed;
  }

  if (locationPanel && !allowed) {
    locationPanel.hidden = true;
  }

  if (allowed) {
    applyAllMarkerStates();
    updateMapHeader();
    syncPortraitRailHeight();
    if (viewMode === "dm") {
      renderDmControls();
    }
  }
}

function syncDmControl(marker, container) {
  if (!container) {
    return;
  }

  const control = container.querySelector(
    `[data-marker-control="${getMarkerVisibilityKey(marker)}"]`
  );

  if (!control) {
    return;
  }

  const revealed = isMarkerRevealed(marker);
  control.setAttribute("aria-pressed", String(revealed));
  control.textContent = revealed ? "Visible to Players" : "Hidden from Players";
  control
    .closest(".dm-marker-item")
    ?.classList.toggle("dm-marker-item--hidden", !revealed);
}

function formatMarkerType(type) {
  switch (type) {
    case "information":
      return "Information";
    case "portrait":
      return "Portrait";
    default:
      return "Location";
  }
}

function createDmControlItem(marker, container) {
  const item = document.createElement("div");
  item.className = "dm-marker-item";

  const label = document.createElement("div");
  label.className = "dm-marker-item__label";

  const title = document.createElement("p");
  title.className = "dm-marker-item__title";
  title.textContent = marker.dataset.locationName || "Unnamed location";

  const meta = document.createElement("p");
  meta.className = "dm-marker-item__meta";
  const markerType = marker.dataset.locationType || "location";
  meta.textContent = `${formatMarkerType(markerType)} - ${marker.dataset.locationId || ""}`;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "dm-marker-item__toggle";
  toggle.dataset.markerControl = getMarkerVisibilityKey(marker);
  toggle.addEventListener("click", () => {
    setMarkerRevealed(marker, !isMarkerRevealed(marker));
  });

  label.append(title, meta);
  item.append(label, toggle);
  container.append(item);

  syncDmControl(marker, container);
}

function renderDmControls() {
  if (viewMode !== "dm" || !canAccessCurrentView() || !dmControls || !dmLocationList || !dmPortraitList) {
    return;
  }

  dmControls.hidden = false;
  dmLocationList.innerHTML = "";
  dmPortraitList.innerHTML = "";

  const scopedMarkers = markerButtons.filter(isMarkerOnCurrentMap);
  const mapMarkers = scopedMarkers.filter((marker) => !isPortraitMarker(marker));
  const portraitMarkers = scopedMarkers.filter(isPortraitMarker);

  for (const marker of mapMarkers) {
    createDmControlItem(marker, dmLocationList);
  }

  for (const marker of portraitMarkers) {
    createDmControlItem(marker, dmPortraitList);
  }
}

function applyViewMode() {
  document.body.dataset.view = viewMode;

  if (viewIntro) {
    viewIntro.textContent =
      viewMode === "dm"
        ? "DM view: reveal or hide each map marker, then share the player view."
        : "Player view: only the locations revealed by the DM are visible.";
  }

  if (markerToggle) {
    markerToggle.hidden = false;
  }
}

function applyMarkerState(marker) {
  const onCurrentMap = isMarkerOnCurrentMap(marker);
  const revealed = isMarkerRevealed(marker);
  const isPlayerView = viewMode === "player";
  const shouldHide = !onCurrentMap || (isPlayerView && !revealed);

  marker.classList.toggle("map-marker--revealed", revealed);
  marker.classList.toggle("map-marker--dm-hidden", viewMode === "dm" && !revealed);
  marker.hidden = shouldHide;
  marker.disabled = shouldHide;
  marker.setAttribute("aria-hidden", String(shouldHide));

  if (isPortraitMarker(marker)) {
    marker.style.display = shouldHide ? "none" : "grid";
  } else {
    marker.style.display = shouldHide ? "none" : "";
  }
}

function applyAllMarkerStates() {
  for (const marker of markerButtons) {
    applyMarkerState(marker);
  }

  updatePortraitRail();
}

function syncPortraitRailHeight() {
  if (!portraitRail || !mapStage || portraitRail.hidden) {
    if (portraitRail) {
      portraitRail.style.maxHeight = "";
    }
    return;
  }

  portraitRail.style.maxHeight = `${mapStage.offsetHeight}px`;
}

function updateMapHeader() {
  if (mapTitle) {
    mapTitle.textContent = currentMap.title;
  }

  if (mapReturn) {
    mapReturn.hidden = currentMap.id === ROOT_MAP.id;
  }
}

function updatePortraitRail() {
  if (!portraitRail) {
    return;
  }

  const scopedPortraits = markerButtons.filter(
    (marker) => isPortraitMarker(marker) && isMarkerOnCurrentMap(marker)
  );
  const visiblePortraits = scopedPortraits.filter((marker) => !marker.hidden);
  const shouldHideRail =
    viewMode === "dm" ? scopedPortraits.length === 0 : visiblePortraits.length === 0;

  portraitRail.hidden = shouldHideRail;
  mapLayout?.classList.toggle("map-layout--with-portraits", !shouldHideRail);
  syncPortraitRailHeight();
}

markerToggle?.addEventListener("click", () => {
  const markersVisible = markerToggle.getAttribute("aria-pressed") === "true";
  const nextVisible = !markersVisible;

  markerToggle.setAttribute("aria-pressed", String(nextVisible));
  markerToggle.textContent = nextVisible ? "Hide Markers" : "Show Markers";
  mapStage?.classList.toggle("map-stage--markers-hidden", !nextVisible);
});

mapReturn?.addEventListener("click", async () => {
  if (mapHistory.length <= 1) {
    return;
  }

  mapHistory.pop();
  const previousMap = mapHistory[mapHistory.length - 1];
  await switchMap(previousMap, { preserveHistory: true });
});

async function loadLocationContent(src) {
  const response = await fetch(src, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load ${src}`);
  }

  return response.text();
}

function renderMarkerFallback(marker) {
  if (!locationPanelBody) {
    return;
  }

  const imageSrc = marker.dataset.imageSrc;
  if (!imageSrc) {
    locationPanelBody.innerHTML = '<p class="location-panel__status">No content is available for this marker yet.</p>';
    return;
  }

  locationPanelBody.innerHTML = `
    <div class="location-panel__split location-panel__split--portrait">
      <img
        src="${imageSrc}"
        alt="${marker.dataset.imageAlt || marker.dataset.locationName || "Portrait"}"
        class="location-panel__image location-panel__image--portrait"
      >
      <div class="location-panel__content">
        <p>No character notes have been added for this portrait yet.</p>
      </div>
    </div>
  `;
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function switchMap(nextMap, options = {}) {
  if (!mapImage || !nextMap?.src || !canAccessCurrentView()) {
    return;
  }

  const { preserveHistory = false } = options;

  if (!preserveHistory && currentMap.id !== nextMap.id) {
    mapHistory.push({ ...nextMap });
  }

  mapStage?.classList.add("map-stage--transitioning");
  await wait(180);

  mapImage.src = nextMap.src;
  mapImage.alt = nextMap.alt || "Map";
  currentMap = { ...nextMap };
  updateMapHeader();
  applyAllMarkerStates();
  renderDmControls();

  if (locationEyebrow) {
    locationEyebrow.textContent = "Selected Location";
  }

  if (locationTitle) {
    locationTitle.textContent = nextMap.title || "Location";
  }

  if (locationPanelBody) {
    locationPanelBody.innerHTML = "";
  }

  if (locationPanel) {
    locationPanel.hidden = true;
  }

  await wait(120);
  mapStage?.classList.remove("map-stage--transitioning");
  syncPortraitRailHeight();
}

async function showMapImage(marker) {
  await switchMap({
    id: marker.dataset.targetMapId || marker.dataset.locationId || ROOT_MAP.id,
    src: marker.dataset.mapSrc,
    alt: marker.dataset.mapAlt || marker.dataset.locationName || "Map",
    title: marker.dataset.targetMapTitle || marker.dataset.locationName || "Map"
  });
}

for (const marker of markerButtons) {
  marker.addEventListener("click", async () => {
    if (!canAccessCurrentView()) {
      return;
    }

    if (!isPortraitMarker(marker) && mapStage?.classList.contains("map-stage--markers-hidden")) {
      return;
    }

    if (viewMode === "player" && !isMarkerRevealed(marker)) {
      return;
    }

    const mapSrc = marker.dataset.mapSrc;
    if (mapSrc) {
      await showMapImage(marker);
      return;
    }

    const locationSrc = marker.dataset.locationSrc;
    if (locationEyebrow) {
      locationEyebrow.textContent = isPortraitMarker(marker)
        ? "Selected Portrait"
        : "Selected Location";
    }
    locationTitle.textContent = marker.dataset.locationName || (isPortraitMarker(marker) ? "Portrait" : "Location");
    locationPanelBody.innerHTML = '<p class="location-panel__status">Loading...</p>';
    locationPanel.hidden = false;
    locationPanel.scrollIntoView({ behavior: "smooth", block: "start" });

    if (!locationSrc) {
      renderMarkerFallback(marker);
      return;
    }

    try {
      const html = await loadLocationContent(locationSrc);
      locationPanelBody.innerHTML = html;
    } catch (error) {
      locationPanelBody.innerHTML = isPortraitMarker(marker)
        ? '<p class="location-panel__status">Failed to load character content.</p>'
        : '<p class="location-panel__status">Failed to load location content.</p>';
      console.error(error);
    }
  });
}

function getFriendlyAuthError(error) {
  switch (error?.code) {
    case "auth/user-not-found":
    case "auth/wrong-password":
    case "auth/invalid-login-credentials":
      return "That username and password combination did not match.";
    case "auth/email-already-in-use":
      return "That username already exists. Try signing in instead.";
    case "auth/weak-password":
      return "Choose a password with at least 6 characters.";
    case "auth/network-request-failed":
      return "Firebase could not be reached. Check your internet connection.";
    default:
      return error?.message || "Authentication failed.";
  }
}

async function signInWithUsername(username, password) {
  if (!firebaseAuth) {
    throw new Error("Firebase Auth is not available.");
  }

  return firebaseAuth.signInWithEmailAndPassword(usernameToEmail(username), password);
}

async function createUserWithUsername(username, password) {
  if (!firebaseAuth) {
    throw new Error("Firebase Auth is not available.");
  }

  const credential = await firebaseAuth.createUserWithEmailAndPassword(
    usernameToEmail(username),
    password
  );

  await ensureUserProfile(credential.user, username);
  return credential;
}

authForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  const username = normalizeUsername(authUsernameInput?.value || "");
  const password = authPasswordInput?.value || "";

  if (!isValidUsername(username)) {
    setAuthMessage("Use a username with 3-24 letters, numbers, dots, underscores, or dashes.", "error");
    return;
  }

  if (password.length < 6) {
    setAuthMessage("Choose a password with at least 6 characters.", "error");
    return;
  }

  setAuthBusy(true);
  setAuthMessage("Signing in...", "info");

  try {
    await signInWithUsername(username, password);
    authPasswordInput.value = "";
    setAuthMessage("", "info");
  } catch (error) {
    setAuthMessage(getFriendlyAuthError(error), "error");
  } finally {
    setAuthBusy(false);
  }
});

authSignupButton?.addEventListener("click", async () => {
  const username = normalizeUsername(authUsernameInput?.value || "");
  const password = authPasswordInput?.value || "";

  if (!isValidUsername(username)) {
    setAuthMessage("Use a username with 3-24 letters, numbers, dots, underscores, or dashes.", "error");
    return;
  }

  if (password.length < 6) {
    setAuthMessage("Choose a password with at least 6 characters.", "error");
    return;
  }

  setAuthBusy(true);
  setAuthMessage("Creating account...", "info");

  try {
    await createUserWithUsername(username, password);
    authPasswordInput.value = "";
    setAuthMessage("Account created. You are now signed in.", "success");
  } catch (error) {
    setAuthMessage(getFriendlyAuthError(error), "error");
  } finally {
    setAuthBusy(false);
  }
});

authSignoutButton?.addEventListener("click", async () => {
  if (!firebaseAuth) {
    return;
  }

  try {
    await firebaseAuth.signOut();
    setAuthMessage("Signed out.", "info");
  } catch (error) {
    setAuthMessage(getFriendlyAuthError(error), "error");
  }
});

async function handleAuthStateChanged(user) {
  currentUser = user;
  currentUserProfile = null;
  cancelUnauthorizedRedirect();

  stopFirebaseSync();

  if (!user) {
    updateAuthCopy();
    updateSessionPanel();
    updateAppVisibility();
    setAuthBusy(false);
    if (viewMode === "dm") {
      setAuthMessage("Sign in with the admin account to open the DM page.", "info");
    } else if (!authMessage?.textContent) {
      setAuthMessage("", "info");
    }
    return;
  }

  try {
    const fallbackUsername = normalizeUsername(
      user.displayName || user.email?.split("@")[0] || authUsernameInput?.value || ""
    );
    await ensureUserProfile(user, fallbackUsername);
    currentUserProfile = await loadUserProfile(user.uid);
  } catch (error) {
    console.warn("Unable to finish loading the signed-in user profile.", error);
    setAuthMessage("Signed in, but the user profile could not be loaded. Check Firebase rules.", "error");
  }

  updateAuthCopy();
  updateSessionPanel();

  if (viewMode === "dm" && !canAccessCurrentView()) {
    updateAppVisibility();
    setAuthMessage("This account is not an admin. Redirecting to the player page...", "error");
    scheduleUnauthorizedRedirect();
    return;
  }

  updateAppVisibility();
  initializeFirebaseSync();
  setAuthMessage("", "info");
}

function initializeAuth() {
  if (!initializeFirebaseServices()) {
    return;
  }

  firebaseAuth.onAuthStateChanged((user) => {
    handleAuthStateChanged(user);
  });
}

window.addEventListener("resize", syncPortraitRailHeight);

applyViewMode();
updateMapHeader();
applyAllMarkerStates();
updateSessionPanel();
updateAuthCopy();
updateAppVisibility();
initializeAuth();
