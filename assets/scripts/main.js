let markerButtons = [];
const locationPanel = document.getElementById("location-panel");
const locationTitle = document.getElementById("location-title");
const locationEyebrow = document.getElementById("location-eyebrow");
const locationPanelBody = document.getElementById("location-panel-body");
const markerToggle = document.getElementById("marker-toggle");
const mapReturn = document.getElementById("map-return");
const appSignoutButton = document.getElementById("app-signout");
const mapStage = document.getElementById("map-stage");
const mapLayout = document.querySelector(".map-layout");
const mapImage = document.getElementById("barovia-map");
const portraitRail = document.getElementById("portrait-rail");
const dmControls = document.getElementById("dm-controls");
const dmLocationList = document.getElementById("dm-location-list");
const dmPortraitList = document.getElementById("dm-portrait-list");
const dmCreatorForm = document.getElementById("dm-marker-form");
const dmMarkerTitleInput = document.getElementById("dm-marker-title");
const dmMarkerDescriptionInput = document.getElementById("dm-marker-description");
const dmMarkerTypeInput = document.getElementById("dm-marker-type");
const dmMarkerVisibleInput = document.getElementById("dm-marker-visible");
const dmMarkerImageFileInput = document.getElementById("dm-marker-image-file");
const dmMarkerIsMapInput = document.getElementById("dm-marker-is-map");
const dmMarkerMapFields = document.getElementById("dm-marker-map-fields");
const dmMarkerMapTitleInput = document.getElementById("dm-marker-map-title");
const dmMarkerMapImageFileInput = document.getElementById("dm-marker-map-image-file");
const dmMarkerPlacementButton = document.getElementById("dm-marker-place");
const dmMarkerStatus = document.getElementById("dm-marker-status");
const presencePanel = document.getElementById("presence-panel");
const presenceList = document.getElementById("presence-list");
const displayNameForm = document.getElementById("display-name-form");
const displayNameInput = document.getElementById("display-name-input");
const displayNameVisibleInput = document.getElementById("display-name-visible");
const displayNameSaveButton = document.getElementById("display-name-save");
const displayNameStatus = document.getElementById("display-name-status");
const viewIntro = document.getElementById("view-intro");
const mapTitle = document.getElementById("map-title");
const appShell = document.getElementById("app-shell");
const authPanel = document.getElementById("auth-panel");
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
const playerLink = document.getElementById("player-link");

const VISIBILITY_STORAGE_KEY = "barovia-marker-visibility";
const VISIBILITY_STORAGE_VERSION_KEY = "barovia-marker-visibility-version";
const VISIBILITY_STORAGE_VERSION = 2;
const FIREBASE_PATH = "maps/barovia/markerVisibility";
const CUSTOM_MARKERS_PATH = "maps/barovia/customMarkers";
const PLAYER_DIRECTORY_PATH = "playerDirectory";
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
  "barovia:strahd-portrait": true,
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
const IMAGE_FILE_EXTENSION_PATTERN = /\.(avif|gif|jpe?g|png|webp)$/i;

let currentMap = { ...ROOT_MAP };
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDatabase = null;
let databaseRef = null;
let customMarkersRef = null;
let playerDirectoryRef = null;
let playerDirectoryConnected = false;
let currentPlayerDirectoryRef = null;
let firebaseReady = false;
let firebaseSyncStarted = false;
let currentUser = null;
let currentUserProfile = null;
let unauthorizedRedirectTimer = null;
let placementModeActive = false;
const customMarkers = {};

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
  return currentUserProfile?.displayName || currentUserProfile?.username || currentUser?.displayName || currentUser?.email || "Unknown user";
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setDmMarkerStatus(message, type = "info") {
  if (!dmMarkerStatus) {
    return;
  }

  if (!message) {
    dmMarkerStatus.hidden = true;
    dmMarkerStatus.textContent = "";
    dmMarkerStatus.dataset.state = "";
    return;
  }

  dmMarkerStatus.hidden = false;
  dmMarkerStatus.textContent = message;
  dmMarkerStatus.dataset.state = type;
}

function setDisplayNameStatus(message, type = "info") {
  if (!displayNameStatus) {
    return;
  }

  if (!message) {
    displayNameStatus.hidden = true;
    displayNameStatus.textContent = "";
    displayNameStatus.dataset.state = "";
    return;
  }

  displayNameStatus.hidden = false;
  displayNameStatus.textContent = message;
  displayNameStatus.dataset.state = type;
}

function normalizeDisplayName(value) {
  return String(value || "").trim();
}

function isValidDisplayName(value) {
  const trimmed = normalizeDisplayName(value);
  return trimmed.length >= 1 && trimmed.length <= 24;
}

function normalizeImageFileName(value) {
  return String(value || "").trim().replaceAll("\\", "/").split("/").pop();
}

function getImagePathFromFileName(fileName) {
  const normalizedFileName = normalizeImageFileName(fileName);
  return normalizedFileName ? `assets/images/${encodeURIComponent(normalizedFileName)}` : "";
}

function getMapIdFromTitle(title) {
  return String(title || "")
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function isSafeImageFileName(fileName) {
  const normalizedFileName = normalizeImageFileName(fileName);
  return (
    normalizedFileName.length > 0 &&
    normalizedFileName.length <= 120 &&
    IMAGE_FILE_EXTENSION_PATTERN.test(normalizedFileName)
  );
}

async function imageExistsAtPath(imagePath) {
  try {
    const response = await fetch(imagePath, {
      method: "HEAD",
      cache: "no-store"
    });
    return response.ok;
  } catch (error) {
    console.warn("Unable to verify marker image.", error);
    return false;
  }
}

async function loadImageFileOptions() {
  if ((!dmMarkerImageFileInput && !dmMarkerMapImageFileInput) || viewMode !== "dm") {
    return;
  }

  try {
    const imageNames = await fetchImageFileNames();
    populateImageSelect(dmMarkerImageFileInput, imageNames, "No image");
    populateImageSelect(dmMarkerMapImageFileInput, imageNames, "Choose map image");
  } catch (error) {
    console.warn("Unable to load image file options.", error);
  }
}

async function fetchImageFileNames() {
  try {
    const response = await fetch("/api/images", { cache: "no-store" });
    if (response.ok) {
      const payload = await response.json();
      if (Array.isArray(payload.images)) {
        return payload.images;
      }
    }
  } catch (error) {
    console.warn("Unable to load image list from API.", error);
  }

  const response = await fetch("assets/images/", { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load image directory: ${response.status}`);
  }

  const html = await response.text();
  const documentFragment = new DOMParser().parseFromString(html, "text/html");
  const imageNames = Array.from(documentFragment.querySelectorAll("a"))
    .map((link) => {
      const href = link.getAttribute("href") || "";
      const path = new URL(href, response.url).pathname;
      return decodeURIComponent(path.split("/").pop() || "");
    })
    .filter((fileName) => fileName && IMAGE_FILE_EXTENSION_PATTERN.test(fileName));

  return [...new Set(imageNames)].sort((left, right) => left.localeCompare(right));
}

function populateImageSelect(select, imageNames, emptyLabel) {
  if (!select) {
    return;
  }

  const selectedValue = select.value;
  select.innerHTML = [
    `<option value="">${escapeHtml(emptyLabel)}</option>`,
    ...imageNames.map((imageName) => `<option value="${escapeHtml(imageName)}">${escapeHtml(imageName)}</option>`)
  ].join("");

  if (selectedValue && imageNames.includes(selectedValue)) {
    select.value = selectedValue;
  }
}

function syncMapMarkerFields() {
  if (!dmMarkerIsMapInput || !dmMarkerMapFields) {
    return;
  }

  const isNpcMarker = dmMarkerTypeInput?.value === "npc";
  const isMapMarker = dmMarkerIsMapInput.checked && !isNpcMarker;
  dmMarkerIsMapInput.disabled = isNpcMarker;
  dmMarkerMapFields.hidden = !isMapMarker;

  if (dmMarkerMapImageFileInput) {
    dmMarkerMapImageFileInput.required = isMapMarker;
  }

  if (dmMarkerPlacementButton) {
    dmMarkerPlacementButton.textContent = isNpcMarker
      ? "Create NPC"
      : placementModeActive
        ? "Cancel Placement"
        : "Place Marker On Map";
  }
}

function setPlacementMode(isActive) {
  placementModeActive = isActive;

  if (dmMarkerPlacementButton) {
    dmMarkerPlacementButton.setAttribute("aria-pressed", String(isActive));
    dmMarkerPlacementButton.textContent = dmMarkerTypeInput?.value === "npc"
      ? "Create NPC"
      : isActive
        ? "Cancel Placement"
        : "Place Marker On Map";
  }

  mapStage?.classList.toggle("map-stage--placement-mode", isActive);

  if (isActive) {
    setDmMarkerStatus("Click an empty spot on the current map to place the marker.", "info");
  } else if (dmMarkerStatus?.dataset.state === "info") {
    setDmMarkerStatus("", "info");
  }
}

function getCustomMarkerVisibilityKey(markerRecord) {
  return `${markerRecord.mapId || ROOT_MAP.id}:${markerRecord.id}`;
}

function renderInlineMarkerContent(marker) {
  if (!locationPanelBody) {
    return;
  }

  const description = marker.dataset.inlineDescription;
  const title = marker.dataset.locationName || "Location";
  const imagePath = marker.dataset.imageSrc || "";

  if (!description && !imagePath) {
    locationPanelBody.innerHTML = '<p class="location-panel__status">No notes have been added for this marker yet.</p>';
    return;
  }

  if (imagePath) {
    locationPanelBody.innerHTML = `
      <div class="location-panel__content location-panel__content--stacked-media">
        <p><strong>${escapeHtml(title)}</strong></p>
        ${description ? `<p>${escapeHtml(description)}</p>` : ""}
        <img
          src="${escapeHtml(imagePath)}"
          alt="${escapeHtml(title)}"
          class="location-panel__image location-panel__image--full"
        >
      </div>
    `;
    return;
  }

  locationPanelBody.innerHTML = `
    <div class="location-panel__content">
      <p><strong>${escapeHtml(title)}</strong></p>
      <p>${escapeHtml(description)}</p>
    </div>
  `;
}

function attachMarkerClickHandler(marker) {
  if (marker.dataset.markerBound === "true") {
    return;
  }

  marker.dataset.markerBound = "true";
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
    locationTitle.classList.toggle("location-panel__title--strahd", marker.dataset.locationId === "strahd-portrait");
    locationPanelBody.innerHTML = '<p class="location-panel__status">Loading...</p>';
    locationPanel.hidden = false;
    locationPanel.scrollIntoView({ behavior: "smooth", block: "start" });

    if (marker.dataset.inlineDescription || marker.dataset.imageSrc) {
      renderInlineMarkerContent(marker);
      return;
    }

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

function registerMarkerElement(marker) {
  if (!marker) {
    return;
  }

  if (!markerButtons.includes(marker)) {
    markerButtons.push(marker);
  }

  attachMarkerClickHandler(marker);
}

function registerExistingMarkers() {
  markerButtons = [];

  for (const marker of document.querySelectorAll(".map-marker, .portrait-marker")) {
    registerMarkerElement(marker);
  }
}

function applyCustomMarkersSnapshot(nextMarkers) {
  for (const key of Object.keys(customMarkers)) {
    delete customMarkers[key];
  }

  Object.assign(customMarkers, nextMarkers || {});

  for (const markerRecord of Object.values(customMarkers)) {
    if (!markerRecord?.id || !markerRecord.mapId) {
      continue;
    }

    const visibilityKey = getCustomMarkerVisibilityKey(markerRecord);
    if (!(visibilityKey in markerVisibility)) {
      markerVisibility[visibilityKey] = markerRecord.visible !== false;
    }
  }

  saveMarkerVisibility();
  renderCustomMarkers();
}

function renderCustomMarkers() {
  for (const marker of Array.from(document.querySelectorAll(".map-marker--custom, .portrait-marker--custom"))) {
    marker.remove();
  }

  markerButtons = markerButtons.filter(
    (marker) =>
      !marker.classList.contains("map-marker--custom") &&
      !marker.classList.contains("portrait-marker--custom")
  );

  for (const markerRecord of Object.values(customMarkers)) {
    if (!markerRecord?.id || !markerRecord.mapId) {
      continue;
    }

    if (markerRecord.type === "npc") {
      renderCustomNpcMarker(markerRecord);
      continue;
    }

    const marker = document.createElement("button");
    marker.type = "button";
    marker.className = `map-marker map-marker--custom map-marker--${markerRecord.type || "location"}`;
    marker.style.left = `${Number(markerRecord.x).toFixed(2)}%`;
    marker.style.top = `${Number(markerRecord.y).toFixed(2)}%`;
    marker.dataset.mapId = markerRecord.mapId;
    marker.dataset.locationId = markerRecord.id;
    marker.dataset.locationName = markerRecord.title || "Custom Marker";
    marker.dataset.locationType = markerRecord.type || "location";
    marker.dataset.inlineDescription = markerRecord.description || "";
    marker.dataset.imageSrc = markerRecord.imagePath || "";
    marker.dataset.mapSrc = markerRecord.mapSrc || "";
    marker.dataset.targetMapId = markerRecord.targetMapId || "";
    marker.dataset.targetMapTitle = markerRecord.targetMapTitle || "";
    marker.dataset.mapAlt = markerRecord.mapAlt || "";
    marker.setAttribute("aria-controls", "location-panel");
    marker.setAttribute(
      "aria-label",
      markerRecord.mapSrc
        ? `Show the ${markerRecord.targetMapTitle || markerRecord.title || "custom"} map`
        : `Open details for ${markerRecord.title || "custom marker"}`
    );
    mapStage?.append(marker);
    registerMarkerElement(marker);
  }

  applyAllMarkerStates();

  if (viewMode === "dm" && canAccessCurrentView()) {
    renderDmControls();
  }
}

function renderCustomNpcMarker(markerRecord) {
  const marker = document.createElement("button");
  marker.type = "button";
  marker.className = "portrait-marker portrait-marker--custom";
  marker.dataset.mapId = markerRecord.mapId;
  marker.dataset.locationId = markerRecord.id;
  marker.dataset.locationName = markerRecord.title || "Custom NPC";
  marker.dataset.locationType = "npc";
  marker.dataset.inlineDescription = markerRecord.description || "";
  marker.dataset.imageSrc = markerRecord.imagePath || "";
  marker.setAttribute("aria-controls", "location-panel");
  marker.setAttribute("aria-label", `Show NPC ${markerRecord.title || "custom NPC"}`);

  if (markerRecord.imagePath) {
    const image = document.createElement("img");
    image.src = markerRecord.imagePath;
    image.alt = markerRecord.title || "NPC portrait";
    marker.append(image);
  }

  const label = document.createElement("span");
  label.textContent = markerRecord.title || "Custom NPC";
  marker.append(label);
  portraitRail?.append(marker);
  registerMarkerElement(marker);
}

function renderPresenceList(entries) {
  if (!presencePanel || !presenceList || viewMode !== "player" || !currentUser) {
    return;
  }

  const visiblePlayers = entries
    .filter(([, entry]) => entry && entry.role === "player" && entry.showInPlayerList !== false)
    .sort((a, b) => String(a[1].displayName || a[1].username || "").localeCompare(String(b[1].displayName || b[1].username || "")));

  presencePanel.hidden = false;

  if (visiblePlayers.length === 0) {
    presenceList.innerHTML = '<p class="location-panel__status">No registered players are currently visible.</p>';
    return;
  }

  presenceList.innerHTML = visiblePlayers.map(([, entry]) => `
    <article class="presence-item">
      <div>
        <p class="presence-item__name">${escapeHtml(entry.displayName || entry.username || "Unknown player")}</p>
        <p class="presence-item__meta">Registered player</p>
      </div>
      <p class="presence-item__meta">${entry.lastUpdated ? "Listed" : "Ready"}</p>
    </article>
  `).join("");
}

function stopPresenceSync() {
  if (playerDirectoryRef) {
    playerDirectoryRef.off();
  }

  playerDirectoryRef = null;
  playerDirectoryConnected = false;
  currentPlayerDirectoryRef = null;

  if (presencePanel) {
    presencePanel.hidden = true;
  }

  if (presenceList) {
    presenceList.innerHTML = "";
  }
}

function startPresenceSync() {
  if (!firebaseDatabase || !currentUser || !currentUserProfile || playerDirectoryConnected) {
    return;
  }

  playerDirectoryRef = firebaseDatabase.ref(PLAYER_DIRECTORY_PATH);
  currentPlayerDirectoryRef = playerDirectoryRef.child(currentUser.uid);
  playerDirectoryConnected = true;

  syncCurrentPlayerDirectoryProfile().catch((error) => {
    console.warn("Unable to update player directory profile.", error);
  });

  playerDirectoryRef.on("value", (snapshot) => {
    const data = snapshot.val();
    const entries = data && typeof data === "object" ? Object.entries(data) : [];
    renderPresenceList(entries);
  }, () => {
    if (presenceList) {
      presencePanel.hidden = false;
      presenceList.innerHTML = '<p class="location-panel__status">Player list could not be loaded.</p>';
    }
  });
}

async function syncCurrentPlayerDirectoryProfile() {
  if (!currentPlayerDirectoryRef || !currentUser || !currentUserProfile || currentUserProfile.role !== "player") {
    return;
  }

  await currentPlayerDirectoryRef.update({
    username: currentUserProfile.username || "",
    displayName: getDisplayName(),
    role: currentUserProfile.role || "player",
    showInPlayerList: currentUserProfile.showInPlayerList !== false,
    lastUpdated: window.firebase.database.ServerValue.TIMESTAMP
  });
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

  if (customMarkersRef) {
    customMarkersRef.off();
  }

  databaseRef = null;
  customMarkersRef = null;
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
  customMarkersRef = firebaseDatabase.ref(CUSTOM_MARKERS_PATH);
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

  customMarkersRef.on("value", (snapshot) => {
    const data = snapshot.val();
    applyCustomMarkersSnapshot(data && typeof data === "object" ? data : {});
  }, (error) => {
    console.warn("Unable to read custom markers from Firebase.", error);
    setDmMarkerStatus("Custom markers could not be loaded from Firebase.", "error");
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
  let existingProfile = null;
  let nextProfile = null;

  try {
    const snapshot = await userRef.once("value");
    existingProfile = snapshot.val();

    nextProfile = {
      username: username || existingProfile?.username || user.displayName || user.email?.split("@")[0] || "player",
      displayName: existingProfile?.displayName || existingProfile?.username || username || user.displayName || user.email?.split("@")[0] || "player",
      showInPlayerList: existingProfile?.showInPlayerList ?? true,
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
    if (existingProfile && typeof existingProfile === "object") {
      return existingProfile;
    }
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
    if (authUsernameInput) {
      authUsernameInput.value = "";
    }
    if (authPasswordInput) {
      authPasswordInput.value = "";
    }
    return;
  }

  if (authForm) {
    authForm.hidden = true;
  }

  const roleLabel = isAdminProfile(currentUserProfile) ? "admin" : "player";
  sessionPanel.hidden = false;
  sessionSummary.textContent = `Signed in as ${getDisplayName()} (${roleLabel}).`;

  if (displayNameInput && viewMode === "player") {
    displayNameInput.value = getDisplayName();
  }

  if (displayNameVisibleInput && viewMode === "player") {
    displayNameVisibleInput.checked = currentUserProfile?.showInPlayerList !== false;
  }

  if (dmLink) {
    dmLink.hidden = !isAdminProfile(currentUserProfile);
  }

  if (playerLink) {
    playerLink.hidden = !isAdminProfile(currentUserProfile);
  }
}

function updateAppVisibility() {
  const allowed = canAccessCurrentView();
  const shouldHideAuthPanel =
    !!currentUser && (viewMode === "player" || (viewMode === "dm" && isAdminProfile(currentUserProfile)));

  if (authPanel) {
    authPanel.hidden = shouldHideAuthPanel;
  }

  if (appShell) {
    appShell.hidden = !allowed;
  }

  if (appSignoutButton) {
    appSignoutButton.hidden = !allowed;
  }

  if (dmControls) {
    dmControls.hidden = viewMode !== "dm" || !allowed;
  }

  if (locationPanel && !allowed) {
    locationPanel.hidden = true;
  }

  if (presencePanel) {
    presencePanel.hidden = !allowed || viewMode !== "player";
  }

  if (displayNameForm) {
    displayNameForm.hidden = !allowed || viewMode !== "player";
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
    case "npc":
      return "NPC";
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
  const markerKind = marker.dataset.mapSrc ? "Big Map" : formatMarkerType(markerType);
  meta.textContent = `${markerKind} - ${marker.dataset.locationId || ""}`;

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "dm-marker-item__toggle";
  toggle.dataset.markerControl = getMarkerVisibilityKey(marker);
  toggle.addEventListener("click", () => {
    setMarkerRevealed(marker, !isMarkerRevealed(marker));
  });

  label.append(title, meta);
  item.append(label, toggle);

  if (
    marker.classList.contains("map-marker--custom") ||
    marker.classList.contains("portrait-marker--custom")
  ) {
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "dm-marker-item__delete";
    removeButton.textContent = "Delete";
    removeButton.addEventListener("click", () => {
      deleteCustomMarker(marker);
    });
    item.append(removeButton);
  }

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

function getMapReturnTitle(map) {
  const title = map?.title || "previous map";
  return title.replace(/^Map of\s+/i, "").trim() || title;
}

function updateMapHeader() {
  if (mapTitle) {
    mapTitle.textContent = currentMap.title;
  }

  if (mapReturn) {
    const previousMap = mapHistory.length > 1 ? mapHistory[mapHistory.length - 2] : null;
    mapReturn.hidden = currentMap.id === ROOT_MAP.id || !previousMap;
    if (previousMap) {
      mapReturn.textContent = `Return to ${getMapReturnTitle(previousMap)}`;
    }
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
  setPlacementMode(false);
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

function clampPercentage(value) {
  return Math.min(99.5, Math.max(0.5, value));
}

async function buildCustomMarkerRecord(position = null) {
  const title = dmMarkerTitleInput?.value.trim() || "";
  const description = dmMarkerDescriptionInput?.value.trim() || "";
  const markerType = dmMarkerTypeInput?.value || "location";
  const visible = dmMarkerVisibleInput?.checked ?? true;
  const imageFileName = normalizeImageFileName(dmMarkerImageFileInput?.value || "");
  const imagePath = getImagePathFromFileName(imageFileName);
  const isNpcMarker = markerType === "npc";
  const isMapMarker = (dmMarkerIsMapInput?.checked ?? false) && !isNpcMarker;
  const targetMapTitle = (dmMarkerMapTitleInput?.value.trim() || title).trim();
  const mapImageFileName = normalizeImageFileName(dmMarkerMapImageFileInput?.value || "");
  const mapSrc = getImagePathFromFileName(mapImageFileName);
  const targetMapId = getMapIdFromTitle(targetMapTitle);

  if (!title) {
    setDmMarkerStatus(isNpcMarker ? "Add a title before creating the NPC." : "Add a title before placing the marker.", "error");
    return null;
  }

  if (!isNpcMarker && !position) {
    setDmMarkerStatus("Click the map to choose where this marker should appear.", "error");
    return null;
  }

  if (imageFileName) {
    if (!isSafeImageFileName(imageFileName)) {
      setDmMarkerStatus("Use an image file name ending in .jpg, .jpeg, .png, .webp, .gif, or .avif.", "error");
      return null;
    }

    const imageExists = await imageExistsAtPath(imagePath);
    if (!imageExists) {
      setDmMarkerStatus(`Could not find "${imageFileName}" in assets/images. Upload it there first.`, "error");
      return null;
    }
  }

  if (isMapMarker) {
    if (!targetMapTitle) {
      setDmMarkerStatus("Add a map name before placing a big map marker.", "error");
      return null;
    }

    if (!targetMapId) {
      setDmMarkerStatus("Use at least one letter or number in the map name.", "error");
      return null;
    }

    if (!isSafeImageFileName(mapImageFileName)) {
      setDmMarkerStatus("Use a map image file name ending in .jpg, .jpeg, .png, .webp, .gif, or .avif.", "error");
      return null;
    }

    const mapImageExists = await imageExistsAtPath(mapSrc);
    if (!mapImageExists) {
      setDmMarkerStatus(`Could not find "${mapImageFileName}" in assets/images. Upload it there first.`, "error");
      return null;
    }
  }

  const markerRef = customMarkersRef.push();
  const markerId = markerRef.key;

  if (!markerId) {
    setDmMarkerStatus("Firebase did not return a marker id.", "error");
    return null;
  }

  const markerRecord = {
    id: markerId,
    mapId: currentMap.id,
    title,
    description,
    type: markerType,
    imageFileName,
    imagePath,
    isMapMarker,
    mapImageFileName: isMapMarker ? mapImageFileName : "",
    mapSrc: isMapMarker ? mapSrc : "",
    targetMapId: isMapMarker ? targetMapId : "",
    targetMapTitle: isMapMarker ? targetMapTitle : "",
    mapAlt: isMapMarker ? `Map of ${targetMapTitle}` : "",
    visible,
    createdAt: new Date().toISOString(),
    createdBy: currentUser?.uid || ""
  };

  if (position) {
    markerRecord.x = Number(position.x.toFixed(2));
    markerRecord.y = Number(position.y.toFixed(2));
  }

  return { markerRef, markerRecord };
}

function resetDmMarkerForm() {
  if (!dmCreatorForm) {
    return;
  }

  dmCreatorForm.reset();
  if (dmMarkerVisibleInput) {
    dmMarkerVisibleInput.checked = true;
  }
  if (dmMarkerTypeInput) {
    dmMarkerTypeInput.value = "location";
  }
  syncMapMarkerFields();
}

async function saveCustomMarker(markerRef, markerRecord, successMessage) {
  try {
    await markerRef.set(markerRecord);
    markerVisibility[getCustomMarkerVisibilityKey(markerRecord)] = markerRecord.visible !== false;
    saveMarkerVisibility();
    broadcastVisibilityState();
    setPlacementMode(false);
    setDmMarkerStatus(successMessage, "success");
    resetDmMarkerForm();
  } catch (error) {
    console.error("Unable to create custom marker.", error);
    setDmMarkerStatus("Marker could not be saved. Check your Firebase rules.", "error");
  }
}

async function createCustomNpcMarker() {
  if (!firebaseDatabase || !customMarkersRef || !canAccessCurrentView() || viewMode !== "dm") {
    return;
  }

  const result = await buildCustomMarkerRecord();
  if (!result) {
    return;
  }

  const { markerRef, markerRecord } = result;
  await saveCustomMarker(markerRef, markerRecord, `NPC "${markerRecord.title}" added to ${currentMap.title}.`);
}

async function createCustomMarkerAtPosition(x, y) {
  if (!firebaseDatabase || !customMarkersRef || !canAccessCurrentView() || viewMode !== "dm") {
    return;
  }

  const result = await buildCustomMarkerRecord({ x, y });
  if (!result) {
    return;
  }

  const { markerRef, markerRecord } = result;
  await saveCustomMarker(markerRef, markerRecord, `Marker "${markerRecord.title}" added to ${currentMap.title}.`);
}

async function deleteCustomMarker(marker) {
  if (!firebaseDatabase || !customMarkersRef || !canAccessCurrentView() || viewMode !== "dm") {
    return;
  }

  const markerId = marker.dataset.locationId;
  const markerName = marker.dataset.locationName || "this marker";

  if (
    !markerId ||
    (
      !marker.classList.contains("map-marker--custom") &&
      !marker.classList.contains("portrait-marker--custom")
    )
  ) {
    return;
  }

  const shouldDelete = window.confirm(`Delete "${markerName}"? This cannot be undone.`);
  if (!shouldDelete) {
    return;
  }

  try {
    await customMarkersRef.child(markerId).remove();
    delete markerVisibility[getMarkerVisibilityKey(marker)];
    saveMarkerVisibility();
    broadcastVisibilityState();

    if (locationPanel && locationTitle?.textContent === markerName) {
      locationPanel.hidden = true;
    }

    setDmMarkerStatus(`Marker "${markerName}" deleted.`, "success");
  } catch (error) {
    console.error("Unable to delete custom marker.", error);
    setDmMarkerStatus("Marker could not be deleted. Check your Firebase rules.", "error");
  }
}

dmMarkerPlacementButton?.addEventListener("click", () => {
  if (!canAccessCurrentView() || viewMode !== "dm") {
    return;
  }

  if (dmMarkerTypeInput?.value === "npc") {
    createCustomNpcMarker();
    return;
  }

  const title = dmMarkerTitleInput?.value.trim() || "";
  if (!title) {
    setDmMarkerStatus("Add a title before entering placement mode.", "error");
    return;
  }

  setPlacementMode(!placementModeActive);
});

dmMarkerIsMapInput?.addEventListener("change", syncMapMarkerFields);
dmMarkerTypeInput?.addEventListener("change", () => {
  if (dmMarkerTypeInput.value === "npc") {
    setPlacementMode(false);
  }
  syncMapMarkerFields();
});
dmMarkerImageFileInput?.addEventListener("focus", loadImageFileOptions);
dmMarkerImageFileInput?.addEventListener("pointerdown", loadImageFileOptions);
dmMarkerMapImageFileInput?.addEventListener("focus", loadImageFileOptions);
dmMarkerMapImageFileInput?.addEventListener("pointerdown", loadImageFileOptions);

mapStage?.addEventListener("click", async (event) => {
  if (!placementModeActive || viewMode !== "dm" || !canAccessCurrentView() || !mapImage) {
    return;
  }

  if (event.target.closest(".map-marker, .portrait-marker")) {
    return;
  }

  const bounds = mapImage.getBoundingClientRect();
  const x = clampPercentage(((event.clientX - bounds.left) / bounds.width) * 100);
  const y = clampPercentage(((event.clientY - bounds.top) / bounds.height) * 100);

  await createCustomMarkerAtPosition(x, y);
});

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
    setPlacementMode(false);
    stopPresenceSync();
    await firebaseAuth.signOut();
    setAuthMessage("Signed out.", "info");
  } catch (error) {
    setAuthMessage(getFriendlyAuthError(error), "error");
  }
});

appSignoutButton?.addEventListener("click", async () => {
  if (!firebaseAuth) {
    return;
  }

  try {
    setPlacementMode(false);
    stopPresenceSync();
    await firebaseAuth.signOut();
    setAuthMessage("Signed out.", "info");
  } catch (error) {
    setAuthMessage(getFriendlyAuthError(error), "error");
  }
});

displayNameForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!firebaseDatabase || !currentUser || !currentUserProfile) {
    return;
  }

  const nextDisplayName = normalizeDisplayName(displayNameInput?.value || "");

  if (!isValidDisplayName(nextDisplayName)) {
    setDisplayNameStatus("Display name must be 1-24 characters.", "error");
    return;
  }

  if (displayNameSaveButton) {
    displayNameSaveButton.disabled = true;
  }

  try {
    const showInPlayerList = displayNameVisibleInput?.checked ?? true;
    await firebaseDatabase.ref(`${USERS_PATH}/${currentUser.uid}`).update({
      displayName: nextDisplayName,
      showInPlayerList,
      lastLoginAt: new Date().toISOString()
    });

    currentUserProfile = {
      ...currentUserProfile,
      displayName: nextDisplayName,
      showInPlayerList
    };

    await syncCurrentPlayerDirectoryProfile();

    updateSessionPanel();
    setDisplayNameStatus("Player list settings updated.", "success");
  } catch (error) {
    console.error("Unable to update display name.", error);
    setDisplayNameStatus("Player list settings could not be updated. Check your Firebase rules.", "error");
  } finally {
    if (displayNameSaveButton) {
      displayNameSaveButton.disabled = false;
    }
  }
});

async function handleAuthStateChanged(user) {
  currentUser = user;
  currentUserProfile = null;
  cancelUnauthorizedRedirect();

  stopFirebaseSync();
  stopPresenceSync();

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
    currentUserProfile = await ensureUserProfile(user, fallbackUsername);
    currentUserProfile = await loadUserProfile(user.uid) || currentUserProfile;
    if (authUsernameInput) {
      authUsernameInput.value = "";
    }
    if (authPasswordInput) {
      authPasswordInput.value = "";
    }
  } catch (error) {
    console.warn("Unable to finish loading the signed-in user profile.", error);
    currentUserProfile = await loadUserProfile(user.uid);
    if (!currentUserProfile) {
      setAuthMessage("Signed in, but the user profile could not be loaded. Check Firebase rules.", "error");
    }
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
  startPresenceSync();
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

registerExistingMarkers();
syncMapMarkerFields();
loadImageFileOptions();
applyViewMode();
updateMapHeader();
applyAllMarkerStates();
updateSessionPanel();
updateAuthCopy();
updateAppVisibility();
initializeAuth();
