const t = (key, values) => window.I18n.t(key, values);
const setUiText = (element, key, values) => window.I18n.setText(element, key, values);
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
const mapFrame = document.querySelector(".map-frame");
const mapLegendItems = document.getElementById("map-legend-items");
const rootMapSetup = document.getElementById("root-map-setup");
const rootMapForm = document.getElementById("root-map-form");
const rootMapTitleInput = document.getElementById("root-map-title");
const rootMapImageFileInput = document.getElementById("root-map-image-file");
const rootMapImageUploadInput = document.getElementById("root-map-image-upload");
const rootMapStatus = document.getElementById("root-map-status");
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
const dmMarkerImageUploadInput = document.getElementById("dm-marker-image-upload");
const dmMarkerIsMapInput = document.getElementById("dm-marker-is-map");
const dmMarkerMapFields = document.getElementById("dm-marker-map-fields");
const dmMarkerMapTitleInput = document.getElementById("dm-marker-map-title");
const dmMarkerMapImageFileInput = document.getElementById("dm-marker-map-image-file");
const dmMarkerMapImageUploadInput = document.getElementById("dm-marker-map-image-upload");
const dmMarkerPlacementButton = document.getElementById("dm-marker-place");
const dmMarkerStatus = document.getElementById("dm-marker-status");
const presencePanel = document.getElementById("presence-panel");
const presenceList = document.getElementById("presence-list");
const displayNameForm = document.getElementById("display-name-form");
const displayNameInput = document.getElementById("display-name-input");
const displayNameVisibleInput = document.getElementById("display-name-visible");
const displayNameSaveButton = document.getElementById("display-name-save");
const displayNameStatus = document.getElementById("display-name-status");
const userCenter = document.getElementById("user-center");
const userCenterOpen = document.getElementById("user-center-open");
const userCenterClose = document.getElementById("user-center-close");
const userCenterName = document.getElementById("user-center-name");
const profileUsername = document.getElementById("profile-username");
const profileAvatarInput = document.getElementById("profile-avatar-input");
const profileAvatarChoose = document.getElementById("profile-avatar-choose");
const profileAvatarPreview = document.getElementById("profile-avatar-preview");
const profileAvatarRemove = document.getElementById("profile-avatar-remove");
const userCenterAvatar = document.getElementById("user-center-avatar");
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
const campaignPanel = document.getElementById("campaign-panel");
const campaignList = document.getElementById("campaign-list");
const campaignAdmin = document.getElementById("campaign-admin");
const campaignCreateForm = document.getElementById("campaign-create-form");
const campaignNameInput = document.getElementById("campaign-name");
const campaignInviteForm = document.getElementById("campaign-invite-form");
const campaignInviteList = document.getElementById("campaign-invite-list");
const playerManagement = document.getElementById("player-management");
const playersStatus = document.getElementById("players-status");
const playersRefresh = document.getElementById("players-refresh");
const campaignMembers = document.getElementById("campaign-members");
const campaignMemberList = document.getElementById("campaign-member-list");
const campaignSwitchButton = document.getElementById("campaign-switch");

const VISIBILITY_STORAGE_KEY = "barovia-marker-visibility";
const VISIBILITY_STORAGE_VERSION_KEY = "barovia-marker-visibility-version";
const VISIBILITY_STORAGE_VERSION = 2;
const USERS_PATH = "users";
const USER_CAMPAIGNS_PATH = "userCampaigns";
const USERNAME_DIRECTORY_PATH = "usernameDirectory";
const LEGACY_CAMPAIGN_ID = "curse-of-strahd";
const ROOT_MAP = {
  id: "barovia",
  src: "assets/images/Map%20-%20Barovia.jpg",
  alt: "Illustrated map of Barovia",
  title: "Map of Barovia"
};
const MARKER_ICON_DEFINITIONS = [
  { id: "gate", get label() { return t("Gate"); }, fileName: "大门.png" },
  { id: "village", get label() { return t("Village"); }, fileName: "村庄.png" },
  { id: "town", get label() { return t("Town"); }, fileName: "城镇.png" },
  { id: "manor", get label() { return t("Manor"); }, fileName: "庄园.png" },
  { id: "castle", get label() { return t("Castle"); }, fileName: "城堡.png" },
  { id: "temple", get label() { return t("Temple"); }, fileName: "神殿.png" },
  { id: "tent", get label() { return t("Tent"); }, fileName: "帐篷.png" },
  { id: "hill", get label() { return t("Hill"); }, fileName: "山丘.png" },
  { id: "letter", get label() { return t("Letter"); }, fileName: "信件.png" },
  { id: "point-of-interest", get label() { return t("Point of Interest"); }, fileName: "兴趣点.png" }
].map((icon) => ({
  ...icon,
  get label() { return icon.label; },
  src: `assets/icons/${encodeURIComponent(icon.fileName)}`
}));
const MARKER_ICON_BY_ID = new Map(MARKER_ICON_DEFINITIONS.map((icon) => [icon.id, icon]));
const DEFAULT_MARKER_TYPE_ID = "point-of-interest";
const AUTH_CONFIG = window.APP_AUTH_CONFIG || {};
const CLOUDINARY_CONFIG = window.CLOUDINARY_CONFIG || {};
const USERNAME_DOMAIN = AUTH_CONFIG.usernameDomain || "barovia.local";
const CLOUDINARY_CLOUD_NAME = String(CLOUDINARY_CONFIG.cloudName || "").trim();
const CLOUDINARY_UPLOAD_PRESET = String(CLOUDINARY_CONFIG.uploadPreset || "").trim();
const MAX_IMAGE_UPLOAD_BYTES = 10 * 1024 * 1024;
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
const markerVisibility = {};
const mapHistory = [{ ...ROOT_MAP }];
const IMAGE_FILE_EXTENSION_PATTERN = /\.(avif|gif|jpe?g|png|webp)$/i;

let currentMap = { ...ROOT_MAP };
let firebaseApp = null;
let firebaseAuth = null;
let firebaseDatabase = null;
let databaseRef = null;
let customMarkersRef = null;
let markerIconsRef = null;
let rootMapRef = null;
let playerDirectoryRef = null;
let playerDirectoryConnected = false;
let currentPlayerDirectoryRef = null;
let campaignMembershipsRef = null;
let firebaseReady = false;
let firebaseSyncStarted = false;
let currentUser = null;
let currentUserProfile = null;
let activeCampaignId = "";
let campaignMemberships = {};
let campaignPickerOpen = true;
let campaignRootMap = null;
let placementModeActive = false;
let markerSaveBusy = false;
let campaignDeleteBusy = false;
let campaignCreateBusy = false;
let profileSaveBusy = false;
let userProfileRef = null;
let avatarDraft = null;
let avatarPreviewUrl = "";
let avatarSelectionGeneration = 0;
let playerManagementGeneration = 0;
let managedPlayers = [];
let managedCampaignId = "";
let playersLoading = false;
let playersLoadFailed = false;
const playerPages = { member: 1, invite: 1 };
const pendingPlayerActions = new Set();
const PLAYER_PAGE_SIZE = 6;
const customMarkers = {};
const markerIconAssignments = {};

function normalizeCampaignId(value) {
  return String(value || "").trim().toLowerCase();
}

function isValidCampaignId(value) {
  return /^[a-z0-9-]{3,40}$/.test(value);
}

function createCampaignId(name) {
  const slug = normalizeCampaignId(name)
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 18) || "campaign";
  const random = Array.from(crypto.getRandomValues(new Uint8Array(5)), (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${slug}-${Date.now().toString(36)}-${random}`;
}

function getCurrentCampaignId() {
  return activeCampaignId;
}

function getCampaignPath(suffix = "") {
  const campaignId = getCurrentCampaignId();
  return campaignId ? `campaigns/${campaignId}${suffix ? `/${suffix}` : ""}` : "";
}

// Existing campaigns retain their original storage path; new campaigns are generic.
function getMapDataPath(suffix) {
  const collection = campaignMemberships[getCurrentCampaignId()]?.schemaVersion === 2 ? "shared" : "barovia";
  return getCampaignPath(`maps/${collection}/${suffix}`);
}

function getCampaignViewUrl(mode, campaignId = getCurrentCampaignId()) {
  return `${mode === "dm" ? "dm.html" : "index.html"}${campaignId ? `?campaign=${encodeURIComponent(campaignId)}` : ""}`;
}

function syncCampaignUrl(campaignId = "") {
  const query = new URLSearchParams(window.location.search);
  if (campaignId) {
    query.set("campaign", campaignId);
  } else {
    query.delete("campaign");
  }
  const search = query.toString();
  const url = `${window.location.pathname}${search ? `?${search}` : ""}${window.location.hash}`;
  window.history.replaceState(window.history.state, "", url);
}

function getVisibilityStorageKey(baseKey) {
  return `${baseKey}:${getCurrentCampaignId() || "unassigned"}`;
}

function loadMarkerVisibility() {
  try {
    const stored = window.localStorage.getItem(getVisibilityStorageKey(VISIBILITY_STORAGE_KEY));
    const parsed = stored ? JSON.parse(stored) : {};
    const storedVersion = Number(
      window.localStorage.getItem(getVisibilityStorageKey(VISIBILITY_STORAGE_VERSION_KEY)) || "0"
    );

    if (storedVersion < VISIBILITY_STORAGE_VERSION) {
      return { ...parsed, ...(getCurrentCampaignId() === LEGACY_CAMPAIGN_ID ? DEFAULT_REVEALED_MARKERS : {}) };
    }

    return { ...(getCurrentCampaignId() === LEGACY_CAMPAIGN_ID ? DEFAULT_REVEALED_MARKERS : {}), ...parsed };
  } catch (error) {
    console.warn("Unable to read marker visibility from localStorage.", error);
    return getCurrentCampaignId() === LEGACY_CAMPAIGN_ID ? { ...DEFAULT_REVEALED_MARKERS } : {};
  }
}

function saveMarkerVisibility() {
  try {
    window.localStorage.setItem(
      getVisibilityStorageKey(VISIBILITY_STORAGE_KEY),
      JSON.stringify(markerVisibility)
    );
    window.localStorage.setItem(
      getVisibilityStorageKey(VISIBILITY_STORAGE_VERSION_KEY),
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

function getMarkerIconStorageKey(marker) {
  return encodeURIComponent(getMarkerVisibilityKey(marker));
}

function getAssignedMarkerIconId(marker) {
  return markerIconAssignments[getMarkerIconStorageKey(marker)] || "";
}

function renderMapLegend() {
  if (!mapLegendItems) {
    return;
  }

  mapLegendItems.innerHTML = MARKER_ICON_DEFINITIONS.map((icon) => `
    <div class="map-legend__item">
      <img class="map-legend__icon" src="${icon.src}" alt="" aria-hidden="true" decoding="async">
      <span>${escapeHtml(icon.label)}</span>
    </div>
  `).join("");
}

function applyMarkerIcon(marker) {
  if (!marker || isPortraitMarker(marker)) {
    return;
  }

  marker.querySelector(".map-marker__icon")?.remove();
  const iconId = getAssignedMarkerIconId(marker);
  const icon = MARKER_ICON_BY_ID.get(iconId);
  marker.dataset.iconId = icon?.id || "";
  marker.classList.toggle("map-marker--with-icon", !!icon);

  if (!icon) {
    return;
  }

  const image = document.createElement("img");
  image.className = "map-marker__icon";
  image.src = icon.src;
  image.alt = "";
  image.setAttribute("aria-hidden", "true");
  image.decoding = "async";
  marker.prepend(image);
}

function applyAllMarkerIcons() {
  for (const marker of markerButtons) {
    applyMarkerIcon(marker);
  }
}

function applyMarkerIconsSnapshot(nextAssignments) {
  for (const key of Object.keys(markerIconAssignments)) {
    delete markerIconAssignments[key];
  }

  for (const [key, iconId] of Object.entries(nextAssignments || {})) {
    if (typeof iconId === "string" && MARKER_ICON_BY_ID.has(iconId)) {
      markerIconAssignments[key] = iconId;
    }
  }

  applyAllMarkerIcons();
  if (viewMode === "dm" && canAccessCurrentView() && !campaignPickerOpen) {
    renderDmControls();
  }
}

function isMarkerRevealed(marker) {
  return markerVisibility[getMarkerVisibilityKey(marker)] ?? false;
}

function isMarkerOnCurrentMap(marker) {
  if (
    getCurrentCampaignId() !== LEGACY_CAMPAIGN_ID &&
    !marker.classList.contains("map-marker--custom") &&
    !marker.classList.contains("portrait-marker--custom")
  ) {
    return false;
  }
  const scope = getMarkerScope(marker);
  return scope === currentMap.id || scope === "global";
}

function isPortraitMarker(marker) {
  return marker.classList.contains("portrait-marker");
}

function isCampaignDm(campaignId = getCurrentCampaignId()) {
  return campaignMemberships[campaignId]?.role === "dm";
}

function canManageCampaign(campaignId = getCurrentCampaignId()) {
  return viewMode === "dm" && isCampaignDm(campaignId);
}

function canAccessCurrentView() {
  if (!currentUser || !isValidCampaignId(getCurrentCampaignId())) {
    return false;
  }

  return viewMode === "dm" ? isCampaignDm() : !!campaignMemberships[getCurrentCampaignId()];
}

function setAuthMessage(message, type = "info", values = {}) {
  if (!authMessage) {
    return;
  }

  if (!message) {
    authMessage.hidden = true;
    setUiText(authMessage, "");
    authMessage.dataset.state = "";
    return;
  }

  authMessage.hidden = false;
  setUiText(authMessage, message, values);
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
  return currentUserProfile?.displayName || currentUserProfile?.username || currentUser?.displayName || currentUser?.email || t("Unknown user");
}

async function loadDisplayName(uid, fallback) {
  try {
    const snapshot = await firebaseDatabase.ref(`${USERS_PATH}/${uid}/displayName`).once("value");
    const name = snapshot.val();
    return typeof name === "string" && name.trim() ? name : fallback;
  } catch (error) {
    // Older database rules keep other users' profiles private.
    return fallback;
  }
}

function safeAvatarUrl(value) {
  if (typeof value !== "string" || value.length > 1000) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname === "res.cloudinary.com" &&
      !url.username && !url.password && url.pathname.startsWith(`/${CLOUDINARY_CLOUD_NAME}/image/upload/`)
      ? url.href : "";
  } catch { return ""; }
}

async function loadAvatarUrl(uid) {
  try {
    return safeAvatarUrl((await firebaseDatabase.ref(`${USERS_PATH}/${uid}/avatarUrl`).once("value")).val());
  } catch { return ""; } // Older rules and accounts still render initials.
}

function avatarInitials(name) {
  const words = String(name || "?").trim().split(/\s+/);
  return (words.length > 1 ? Array.from(words[0])[0] + Array.from(words[words.length - 1])[0]
    : Array.from(words[0]).slice(0, 2).join("")).toUpperCase();
}

function avatarMarkup(name, url) {
  const safeUrl = safeAvatarUrl(url);
  return `<span class="user-avatar" aria-hidden="true">${escapeHtml(avatarInitials(name))}${safeUrl
    ? `<img src="${escapeHtml(safeUrl)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ""}</span>`;
}

function bindAvatarFallbacks(root) {
  root?.querySelectorAll(".user-avatar img").forEach(image => {
    image.addEventListener("error", () => { image.hidden = true; }, { once: true });
  });
}

function renderAvatar(element, name, url, localPreview = false) {
  if (!element) return;
  element.textContent = avatarInitials(name);
  const src = localPreview ? avatarPreviewUrl : safeAvatarUrl(url);
  if (!src) return;
  const image = document.createElement("img");
  image.src = src;
  image.alt = "";
  image.referrerPolicy = "no-referrer";
  image.addEventListener("error", () => { image.hidden = true; }, { once: true });
  element.append(image);
}

function clearAvatarPreview() {
  if (avatarPreviewUrl) URL.revokeObjectURL(avatarPreviewUrl);
  avatarPreviewUrl = "";
}

function resetAvatarDraft() {
  avatarSelectionGeneration++;
  window.AvatarCropper?.cancel();
  clearAvatarPreview();
  avatarDraft = null;
  if (profileAvatarInput) profileAvatarInput.value = "";
}

function renderProfileAvatar() {
  renderAvatar(profileAvatarPreview, displayNameInput?.value || getDisplayName(),
    avatarDraft === null ? currentUserProfile?.avatarUrl : avatarDraft.url, !!avatarPreviewUrl);
  if (profileAvatarRemove) profileAvatarRemove.disabled = profileSaveBusy ||
    !(avatarDraft === null ? safeAvatarUrl(currentUserProfile?.avatarUrl) : avatarDraft.file || avatarDraft.url);
}

function getAvatarValidationError(file) {
  if (!file || !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
      !/\.(jpe?g|png|webp)$/i.test(file.name)) return "Choose a JPG, PNG or WebP photo.";
  if (!file.size || file.size > 2 * 1024 * 1024) return "Your profile photo must be smaller than 2 MB.";
  return "";
}

profileAvatarChoose?.addEventListener("click", () => {
  if (!profileSaveBusy) profileAvatarInput?.click();
});
profileAvatarInput?.addEventListener("change", async () => {
  if (profileSaveBusy) return;
  const file = profileAvatarInput.files?.[0];
  profileAvatarInput.value = "";
  if (!file) return;
  const error = getAvatarValidationError(file);
  if (error) {
    profileAvatarInput.value = "";
    setDisplayNameStatus(t(error), "error");
    return;
  }
  const generation = ++avatarSelectionGeneration;
  const uid = currentUser?.uid;
  try {
    const croppedFile = await window.AvatarCropper.open(file);
    if (!croppedFile || generation !== avatarSelectionGeneration || currentUser?.uid !== uid || !userCenter.open) return;
    clearAvatarPreview();
    avatarDraft = { file: croppedFile, url: "" };
    avatarPreviewUrl = URL.createObjectURL(croppedFile);
    renderProfileAvatar();
    setDisplayNameStatus(t("Photo ready. Save Changes to apply."), "info");
  } catch (error) {
    if (generation !== avatarSelectionGeneration) return;
    window.AvatarCropper?.cancel();
    setDisplayNameStatus(t("This photo could not be opened. Try another image."), "error");
  }
});

profileAvatarRemove?.addEventListener("click", () => {
  if (profileSaveBusy) return;
  clearAvatarPreview();
  avatarDraft = { file: null, url: "" };
  profileAvatarInput.value = "";
  renderProfileAvatar();
  setDisplayNameStatus(t("Photo removed from preview. Save Changes to apply."), "info");
});

displayNameInput?.addEventListener("input", renderProfileAvatar);
userCenter?.addEventListener("close", () => { if (!profileSaveBusy) resetAvatarDraft(); });
userCenter?.addEventListener("cancel", event => { if (profileSaveBusy) event.preventDefault(); });

function startUserProfileSync() {
  userProfileRef?.off();
  const uid = currentUser?.uid;
  if (!firebaseDatabase || !uid) return;
  userProfileRef = firebaseDatabase.ref(`${USERS_PATH}/${uid}`);
  userProfileRef.on("value", (snapshot) => {
    if (currentUser?.uid !== uid || !snapshot.val()) return;
    currentUserProfile = snapshot.val();
    updateSessionPanel();
  }, (error) => console.warn("Unable to sync profile.", error));
}

userCenterOpen?.addEventListener("click", () => {
  if (!currentUser || !currentUserProfile || userCenter.open) return;
  displayNameInput.value = getDisplayName();
  displayNameVisibleInput.checked = currentUserProfile.showInPlayerList !== false;
  profileUsername.value = currentUserProfile.username || "";
  if (!profileSaveBusy) resetAvatarDraft();
  renderProfileAvatar();
  setDisplayNameStatus("", "info");
  userCenter.showModal();
});

userCenterClose?.addEventListener("click", () => { if (!profileSaveBusy) userCenter.close(); });

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setDmMarkerStatus(message, type = "info", values = {}) {
  if (!dmMarkerStatus) {
    return;
  }

  if (!message) {
    dmMarkerStatus.hidden = true;
    setUiText(dmMarkerStatus, "");
    dmMarkerStatus.dataset.state = "";
    return;
  }

  dmMarkerStatus.hidden = false;
  setUiText(dmMarkerStatus, message, values);
  dmMarkerStatus.dataset.state = type;
}

function setDisplayNameStatus(message, type = "info") {
  if (!displayNameStatus) {
    return;
  }

  if (!message) {
    displayNameStatus.hidden = true;
    setUiText(displayNameStatus, "");
    displayNameStatus.dataset.state = "";
    return;
  }

  displayNameStatus.hidden = false;
  setUiText(displayNameStatus, message);
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

function getImageUploadValidationError(file) {
  if (!file) {
    return "";
  }

  const fileName = normalizeImageFileName(file.name);
  if (!isSafeImageFileName(fileName)) {
    return t("Choose a JPG, JPEG, PNG, WebP, GIF, or AVIF image with a file name under 120 characters.");
  }

  if (!file.size) {
    return t("The selected image is empty.");
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return t("The selected image is larger than 10 MB.");
  }

  if (file.type && !file.type.startsWith("image/")) {
    return t("The selected file is not an image.");
  }

  return "";
}

async function uploadImageToCloudinary(file) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error(t("Cloudinary upload is not configured."));
  }

  const validationError = getImageUploadValidationError(file);
  if (validationError) {
    throw new Error(validationError);
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${encodeURIComponent(CLOUDINARY_CLOUD_NAME)}/image/upload`,
    {
      method: "POST",
      body: formData
    }
  );

  let payload = null;
  try {
    payload = await response.json();
  } catch (error) {
    console.warn("Cloudinary returned a non-JSON response.", error);
  }

  if (!response.ok) {
    throw new Error(t("Cloudinary upload failed ({status}).", { status: response.status }));
  }

  const secureUrl = String(payload?.secure_url || "");
  let uploadedUrl;
  try {
    uploadedUrl = new URL(secureUrl);
  } catch {
    throw new Error(t("Cloudinary did not return a valid image URL."));
  }

  const expectedPathPrefix = `/${CLOUDINARY_CLOUD_NAME}/image/upload/`;
  if (
    uploadedUrl.protocol !== "https:" ||
    uploadedUrl.hostname !== "res.cloudinary.com" ||
    !uploadedUrl.pathname.startsWith(expectedPathPrefix)
  ) {
    throw new Error(t("Cloudinary returned an unexpected image URL."));
  }

  return {
    fileName: normalizeImageFileName(file.name),
    path: uploadedUrl.href
  };
}

function bindExclusiveImageInputs(select, uploadInput) {
  uploadInput?.addEventListener("change", () => {
    if (uploadInput.files?.length && select) {
      select.value = "";
    }
  });

  select?.addEventListener("change", () => {
    if (select.value && uploadInput) {
      uploadInput.value = "";
    }
  });
}

async function loadImageFileOptions() {
  if ((!dmMarkerImageFileInput && !dmMarkerMapImageFileInput && !rootMapImageFileInput) || viewMode !== "dm") {
    return;
  }

  try {
    const imageNames = await fetchImageFileNames();
    populateImageSelect(dmMarkerImageFileInput, imageNames, t("No image"));
    populateImageSelect(dmMarkerMapImageFileInput, imageNames, t("Choose map image"));
    populateImageSelect(rootMapImageFileInput, imageNames, t("Choose map image"));
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
    `<option value="" data-i18n="${escapeHtml(emptyLabel)}">${escapeHtml(t(emptyLabel))}</option>`,
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
    setUiText(dmMarkerPlacementButton, isNpcMarker
      ? t("Create NPC")
      : placementModeActive
        ? t("Cancel Placement")
        : t("Place Marker On Map"));
  }
}

function setPlacementMode(isActive) {
  placementModeActive = isActive;

  if (dmMarkerPlacementButton) {
    dmMarkerPlacementButton.setAttribute("aria-pressed", String(isActive));
    setUiText(dmMarkerPlacementButton, dmMarkerTypeInput?.value === "npc"
      ? t("Create NPC")
      : isActive
        ? t("Cancel Placement")
        : t("Place Marker On Map"));
  }

  mapStage?.classList.toggle("map-stage--placement-mode", isActive);

  if (isActive) {
    setDmMarkerStatus(t("Click an empty spot on the current map to place the marker."), "info");
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
  const title = marker.dataset.locationName || t("Location");
  const imagePath = marker.dataset.imageSrc || "";

  if (!description && !imagePath) {
    locationPanelBody.innerHTML = `<p class="location-panel__status" data-i18n="No notes have been added for this marker yet.">${t("No notes have been added for this marker yet.")}</p>`;
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

function updateMarkerIconPreview(previewImage, defaultPreview, iconId) {
  const icon = MARKER_ICON_BY_ID.get(iconId);
  previewImage.hidden = !icon;
  defaultPreview.hidden = !!icon;

  if (icon) {
    previewImage.src = icon.src;
    window.I18n.setAttribute(previewImage, "alt", "{name} marker icon preview", { name: icon.label });
  } else {
    previewImage.removeAttribute("src");
    previewImage.alt = "";
  }
}

function renderMarkerIconEditor(marker) {
  if (
    viewMode !== "dm" ||
    !isCampaignDm() ||
    !markerIconsRef ||
    !locationPanelBody ||
    isPortraitMarker(marker)
  ) {
    return;
  }

  const editor = document.createElement("section");
  editor.className = "marker-icon-editor";
  editor.setAttribute("aria-labelledby", "marker-icon-editor-title");

  const heading = document.createElement("div");
  heading.className = "marker-icon-editor__heading";
  heading.innerHTML = `
    <p class="location-panel__eyebrow" data-i18n="DM only">${t("DM only")}</p>
    <h3 id="marker-icon-editor-title" data-i18n="Marker Icon">${t("Marker Icon")}</h3>
    <p data-i18n="Choose the symbol displayed on the map. This setting is shared with players in this campaign.">${t("Choose the symbol displayed on the map. This setting is shared with players in this campaign.")}</p>
  `;

  const form = document.createElement("form");
  form.className = "marker-icon-editor__form";

  const preview = document.createElement("div");
  preview.className = "marker-icon-editor__preview";
  const previewImage = document.createElement("img");
  previewImage.className = "marker-icon-editor__preview-image";
  const defaultPreview = document.createElement("span");
  defaultPreview.className = "marker-icon-editor__default-preview";
  window.I18n.setAttribute(defaultPreview, "aria-label", "Default marker preview");
  preview.append(previewImage, defaultPreview);

  const field = document.createElement("label");
  field.className = "marker-icon-editor__field";
  const fieldLabel = document.createElement("span");
  setUiText(fieldLabel, t("Map icon"));
  const select = document.createElement("select");
  window.I18n.setAttribute(select, "aria-label", "Map icon");
  select.innerHTML = [
    `<option value="" data-i18n="Default marker">${t("Default marker")}</option>`,
    ...MARKER_ICON_DEFINITIONS.map(
      (icon) => `<option value="${escapeHtml(icon.id)}" data-i18n="${escapeHtml(icon.label)}">${escapeHtml(icon.label)}</option>`
    )
  ].join("");
  select.value = getAssignedMarkerIconId(marker);
  field.append(fieldLabel, select);

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "auth-button auth-button--primary";
  setUiText(saveButton, t("Save Icon"));

  const status = document.createElement("p");
  status.className = "marker-icon-editor__status";
  status.hidden = true;
  status.setAttribute("role", "status");

  updateMarkerIconPreview(previewImage, defaultPreview, select.value);
  select.addEventListener("change", () => {
    updateMarkerIconPreview(previewImage, defaultPreview, select.value);
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (!markerIconsRef || !isCampaignDm()) {
      return;
    }

    const iconId = select.value;
    if (iconId && !MARKER_ICON_BY_ID.has(iconId)) {
      status.hidden = false;
      status.dataset.state = "error";
      setUiText(status, t("Choose a valid marker icon."));
      return;
    }

    saveButton.disabled = true;
    status.hidden = false;
    status.dataset.state = "info";
    setUiText(status, t("Saving marker icon..."));

    try {
      const iconRef = markerIconsRef.child(getMarkerIconStorageKey(marker));
      if (iconId) {
        await iconRef.set(iconId);
      } else {
        await iconRef.remove();
      }
      status.dataset.state = "success";
      setUiText(status, iconId ? t("Marker icon updated.") : t("Default marker restored."));
    } catch (error) {
      console.error("Unable to update marker icon.", error);
      status.dataset.state = "error";
      setUiText(status, t("Marker icon could not be saved. Check your Firebase rules."));
    } finally {
      saveButton.disabled = false;
    }
  });

  form.append(preview, field, saveButton);
  editor.append(heading, form, status);
  locationPanelBody.prepend(editor);
}

function renderMapMarkerNavigation(marker) {
  if (!locationPanelBody || !marker.dataset.mapSrc) {
    return;
  }

  const targetTitle = marker.dataset.targetMapTitle || marker.dataset.locationName || t("Map");
  const navigation = document.createElement("section");
  navigation.className = "map-marker-navigation";

  const copy = document.createElement("div");
  copy.className = "map-marker-navigation__copy";
  const eyebrow = document.createElement("p");
  eyebrow.className = "location-panel__eyebrow";
  setUiText(eyebrow, t("Linked Map"));
  const description = document.createElement("p");
  setUiText(description, "This marker opens {name}. You can enter the map after changing its icon.", { name: targetTitle });
  copy.append(eyebrow, description);

  const openButton = document.createElement("button");
  openButton.type = "button";
  openButton.className = "auth-button auth-button--primary";
  setUiText(openButton, "Open {name}", { name: targetTitle });
  openButton.addEventListener("click", async () => {
    openButton.disabled = true;
    try {
      await showMapImage(marker);
      mapFrame?.scrollIntoView({ behavior: "smooth", block: "start" });
    } finally {
      openButton.disabled = false;
    }
  });

  navigation.append(copy, openButton);
  locationPanelBody.append(navigation);
}

async function showMarkerDetails(marker, options = {}) {
  if (!canAccessCurrentView()) {
    return;
  }

  const { iconOnly = false } = options;
  const mapSrc = marker.dataset.mapSrc;
  if (mapSrc && !iconOnly && viewMode === "player") {
    await showMapImage(marker);
    return;
  }

  const locationSrc = marker.dataset.locationSrc;
  if (locationEyebrow) {
    setUiText(locationEyebrow, iconOnly
      ? t("DM Marker Settings")
      : mapSrc
        ? t("DM Map Entrance")
        : isPortraitMarker(marker)
          ? t("Selected Portrait")
          : t("Selected Location"));
  }
  locationTitle.textContent = marker.dataset.locationName || (isPortraitMarker(marker) ? t("Portrait") : t("Location"));
  locationTitle.classList.toggle("location-panel__title--strahd", marker.dataset.locationId === "strahd-portrait");
  locationPanelBody.innerHTML = iconOnly
    ? `<p class="location-panel__status" data-i18n="Use the DM controls below to change this marker icon.">${t("Use the DM controls below to change this marker icon.")}</p>`
    : mapSrc
      ? ""
      : `<p class="location-panel__status" data-i18n="Loading...">${t("Loading...")}</p>`;
  locationPanel.hidden = false;
  locationPanel.scrollIntoView({ behavior: "smooth", block: "start" });

  if (iconOnly) {
    renderMarkerIconEditor(marker);
    return;
  }

  if (mapSrc) {
    renderMapMarkerNavigation(marker);
    renderMarkerIconEditor(marker);
    return;
  }

  if (marker.dataset.inlineDescription || marker.dataset.imageSrc) {
    renderInlineMarkerContent(marker);
    renderMarkerIconEditor(marker);
    return;
  }

  if (!locationSrc) {
    renderMarkerFallback(marker);
    renderMarkerIconEditor(marker);
    return;
  }

  try {
    const html = await loadLocationContent(locationSrc);
    locationPanelBody.innerHTML = html;
  } catch (error) {
    locationPanelBody.innerHTML = isPortraitMarker(marker)
      ? `<p class="location-panel__status" data-i18n="Failed to load character content.">${t("Failed to load character content.")}</p>`
      : `<p class="location-panel__status" data-i18n="Failed to load location content.">${t("Failed to load location content.")}</p>`;
    console.error(error);
  }

  renderMarkerIconEditor(marker);
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

    await showMarkerDetails(marker);
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
  applyMarkerIcon(marker);
}

function registerExistingMarkers() {
  markerButtons = [];

  for (const marker of document.querySelectorAll(".map-marker, .portrait-marker")) {
    window.I18n.setAttribute(marker, "aria-label",
      marker.dataset.mapSrc ? "Show the {name} map" : isPortraitMarker(marker) ? "Show portrait of {name}" : "Open details for {name}",
      { name: marker.dataset.locationName || marker.dataset.locationId });
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
    marker.dataset.locationName = markerRecord.title || t("Custom Marker");
    marker.dataset.locationType = markerRecord.type || "location";
    marker.dataset.inlineDescription = markerRecord.description || "";
    marker.dataset.imageSrc = markerRecord.imagePath || "";
    marker.dataset.mapSrc = markerRecord.mapSrc || "";
    marker.dataset.targetMapId = markerRecord.targetMapId || "";
    marker.dataset.targetMapTitle = markerRecord.targetMapTitle || "";
    marker.dataset.mapAlt = markerRecord.mapAlt || "";
    marker.setAttribute("aria-controls", "location-panel");
    window.I18n.setAttribute(marker,
      "aria-label",
      markerRecord.mapSrc
        ? "Show the {name} map"
        : "Open details for {name}",
      { name: markerRecord.targetMapTitle || markerRecord.title || t("Custom Marker") }
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
  marker.dataset.locationName = markerRecord.title || t("Custom NPC");
  marker.dataset.locationType = "npc";
  marker.dataset.inlineDescription = markerRecord.description || "";
  marker.dataset.imageSrc = markerRecord.imagePath || "";
  marker.setAttribute("aria-controls", "location-panel");
  window.I18n.setAttribute(marker, "aria-label", "Show NPC {name}", { name: markerRecord.title || t("Custom NPC") });

  if (markerRecord.imagePath) {
    const image = document.createElement("img");
    image.src = markerRecord.imagePath;
    image.alt = markerRecord.title || t("NPC portrait");
    marker.append(image);
  }

  const label = document.createElement("span");
  label.textContent = markerRecord.title || t("Custom NPC");
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
    presenceList.innerHTML = `<p class="location-panel__status" data-i18n="No registered players are currently visible.">${t("No registered players are currently visible.")}</p>`;
    return;
  }

  presenceList.innerHTML = visiblePlayers.map(([, entry]) => `
    <article class="presence-item">
      <div class="player-identity">
        ${avatarMarkup(entry.displayName || entry.username, entry.avatarUrl)}
        <div>
        <p class="presence-item__name">${escapeHtml(entry.displayName || entry.username || t("Unknown player"))}</p>
        <p class="presence-item__meta" data-i18n="Registered player">${t("Registered player")}</p>
        </div>
      </div>
      <p class="presence-item__meta" data-i18n="${entry.lastUpdated ? "Listed" : "Ready"}">${entry.lastUpdated ? t("Listed") : t("Ready")}</p>
    </article>
  `).join("");
  bindAvatarFallbacks(presenceList);
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

  playerDirectoryRef = firebaseDatabase.ref(getCampaignPath("playerDirectory"));
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
      presenceList.innerHTML = `<p class="location-panel__status" data-i18n="Player list could not be loaded.">${t("Player list could not be loaded.")}</p>`;
    }
  });
}

async function syncCurrentPlayerDirectoryProfile() {
  if (!currentPlayerDirectoryRef || !currentUser || !currentUserProfile || campaignMemberships[activeCampaignId]?.role !== "player") {
    return;
  }

  await currentPlayerDirectoryRef.update({
    username: currentUserProfile.username || "",
    displayName: getDisplayName(),
    ...(safeAvatarUrl(currentUserProfile.avatarUrl) ? { avatarUrl: safeAvatarUrl(currentUserProfile.avatarUrl) } : {}),
    role: "player",
    showInPlayerList: currentUserProfile.showInPlayerList !== false,
    lastUpdated: window.firebase.database.ServerValue.TIMESTAMP
  });
}

function applyVisibilitySnapshot(nextVisibility) {
  for (const key of Object.keys(markerVisibility)) {
    delete markerVisibility[key];
  }

  Object.assign(
    markerVisibility,
    getCurrentCampaignId() === LEGACY_CAMPAIGN_ID ? DEFAULT_REVEALED_MARKERS : {},
    nextVisibility || {}
  );
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
    setAuthMessage(t("DM state could not be saved to Firebase. Check your database rules."), "error");
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

  if (markerIconsRef) {
    markerIconsRef.off();
  }

  if (rootMapRef) {
    rootMapRef.off();
  }

  databaseRef = null;
  customMarkersRef = null;
  markerIconsRef = null;
  rootMapRef = null;
  firebaseReady = false;
  firebaseSyncStarted = false;
  applyMarkerIconsSnapshot({});
}

function applyCampaignRootMap(rootMap) {
  const hasRootMap = rootMap?.src && rootMap?.id && rootMap?.title;
  campaignRootMap = hasRootMap ? rootMap : null;

  if (!campaignRootMap && getCurrentCampaignId() === LEGACY_CAMPAIGN_ID) {
    campaignRootMap = { ...ROOT_MAP };
  }

  if (rootMapSetup) {
    rootMapSetup.hidden = !!campaignRootMap;
  }
  if (mapFrame) {
    mapFrame.hidden = !campaignRootMap;
  }

  if (!campaignRootMap) {
    currentMap = { id: "root", title: t("Campaign Map"), src: "", alt: "" };
    mapHistory.splice(0, mapHistory.length);
    mapImage.removeAttribute("src");
    locationPanel.hidden = true;
    applyCustomMarkersSnapshot({});
    applyVisibilitySnapshot({});
    updateMapHeader();
    return;
  }

  mapHistory.splice(0, mapHistory.length, { ...campaignRootMap });
  currentMap = { ...campaignRootMap };
  mapImage.src = campaignRootMap.src;
  mapImage.alt = campaignRootMap.alt || campaignRootMap.title;
  updateMapHeader();
  applyAllMarkerStates();
  if (currentUser && !campaignPickerOpen) {
    updateAppVisibility();
  }
}

function initializeFirebaseServices() {
  if (!window.firebase || !window.FIREBASE_CONFIG) {
    setAuthMessage(t("Firebase SDK or config is unavailable, so authentication cannot start."), "error");
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
    setAuthMessage(t("Firebase could not be initialized. Check your config and reload the page."), "error");
    return false;
  }
}

function initializeFirebaseSync() {
  if (!firebaseDatabase || firebaseSyncStarted || !getCurrentCampaignId()) {
    return;
  }

  databaseRef = firebaseDatabase.ref(getMapDataPath("markerVisibility"));
  customMarkersRef = firebaseDatabase.ref(getMapDataPath("customMarkers"));
  markerIconsRef = firebaseDatabase.ref(getMapDataPath("markerIcons"));
  rootMapRef = firebaseDatabase.ref(getCampaignPath("rootMap"));
  firebaseReady = true;
  firebaseSyncStarted = true;

  rootMapRef.on("value", (snapshot) => {
    applyCampaignRootMap(snapshot.val());
  }, (error) => {
    console.warn("Unable to read campaign root map.", error);
    setAuthMessage(t("Campaign map configuration could not be loaded."), "error");
  });

  databaseRef.on("value", (snapshot) => {
    const data = snapshot.val();

    if (data && typeof data === "object") {
      applyVisibilitySnapshot(data);
      return;
    }

    if (viewMode === "dm" && canAccessCurrentView() && campaignRootMap) {
      broadcastVisibilityState();
    }
  }, (error) => {
    console.warn("Unable to read marker visibility from Firebase.", error);
    setAuthMessage(t("Map sync could not read Firebase data. Check your database rules."), "error");
  });

  customMarkersRef.on("value", (snapshot) => {
    const data = snapshot.val();
    applyCustomMarkersSnapshot(data && typeof data === "object" ? data : {});
  }, (error) => {
    console.warn("Unable to read custom markers from Firebase.", error);
    setDmMarkerStatus(t("Custom markers could not be loaded from Firebase."), "error");
  });

  markerIconsRef.on("value", (snapshot) => {
    const data = snapshot.val();
    applyMarkerIconsSnapshot(data && typeof data === "object" ? data : {});
  }, (error) => {
    console.warn("Unable to read marker icons from Firebase.", error);
    setAuthMessage(t("Marker icons could not be loaded. Check your database rules."), "error");
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
      username: existingProfile?.username || username || user.displayName || user.email?.split("@")[0] || "player",
      displayName: existingProfile?.displayName || existingProfile?.username || username || user.displayName || user.email?.split("@")[0] || "player",
      showInPlayerList: existingProfile?.showInPlayerList ?? true,
      role: existingProfile?.role || "player",
      createdAt: existingProfile?.createdAt || now,
      lastLoginAt: now
    };

    await userRef.update(nextProfile);
    await firebaseDatabase.ref(`${USERNAME_DIRECTORY_PATH}/${nextProfile.username}`).set(user.uid);

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

async function loadCampaignMemberships() {
  if (!firebaseDatabase || !currentUser) {
    campaignMemberships = {};
    return;
  }

  const snapshot = await firebaseDatabase.ref(`${USER_CAMPAIGNS_PATH}/${currentUser.uid}`).once("value");
  const data = snapshot.val();
  campaignMemberships = data && typeof data === "object" ? data : {};
}

function stopCampaignMembershipSync() {
  if (campaignMembershipsRef) {
    campaignMembershipsRef.off();
  }
  campaignMembershipsRef = null;
}

function startCampaignMembershipSync() {
  if (!firebaseDatabase || !currentUser) {
    return;
  }

  stopCampaignMembershipSync();
  campaignMembershipsRef = firebaseDatabase.ref(`${USER_CAMPAIGNS_PATH}/${currentUser.uid}`);
  campaignMembershipsRef.on("value", (snapshot) => {
    const data = snapshot.val();
    campaignMemberships = data && typeof data === "object" ? data : {};
    if (activeCampaignId && !canAccessCurrentView()) {
      setPlacementMode(false);
      stopFirebaseSync();
      stopPresenceSync();
      activeCampaignId = "";
      campaignPickerOpen = true;
      syncCampaignUrl();
      applyCampaignRootMap(null);
      setAuthMessage(t("You no longer have access to this campaign."), "info");
    }
    updateAuthCopy();
    updateSessionPanel();
    renderCampaignList();
    updateAppVisibility();
  });
}

function renderCampaignList() {
  if (!campaignPanel || !campaignList || !currentUser) {
    return;
  }

  const memberships = Object.entries(campaignMemberships)
    .filter(([, membership]) => membership && (viewMode !== "dm" || membership.role === "dm"))
    .sort((a, b) => String(a[1].name || a[0]).localeCompare(String(b[1].name || b[0])));

  campaignPanel.hidden = false;
  campaignList.innerHTML = "";

  if (memberships.length === 0) {
    campaignList.innerHTML = `<p class="location-panel__status">${
      viewMode === "dm" ? t("You are not managing any campaigns yet. Create one below to become its DM.") : t("You have not joined any campaigns. Ask your DM to add your username, or create your own campaign in the DM workspace.")
    }</p>`;
  }

  for (const [campaignId, membership] of memberships) {
    const card = document.createElement("article");
    card.className = "campaign-card";
    card.setAttribute("aria-pressed", String(campaignId === activeCampaignId));
    card.innerHTML = `
      <strong>${escapeHtml(membership.name || campaignId)}</strong>
      <span data-i18n="${membership.role === "dm" ? "Dungeon Master" : "Player"}">${membership.role === "dm" ? t("Dungeon Master") : t("Player")}</span>
      <div class="session-panel__actions">
        <button type="button" class="auth-button auth-button--primary" data-campaign-open="${escapeHtml(campaignId)}" data-i18n="Open Map">${t("Open Map")}</button>
        ${canManageCampaign(campaignId) ? `
          <button type="button" class="auth-button" data-campaign-manage="${escapeHtml(campaignId)}" data-i18n="Manage Players">${t("Manage Players")}</button>
          <button type="button" class="auth-button auth-button--danger" data-campaign-delete="${escapeHtml(campaignId)}" data-i18n="Delete Campaign">${t("Delete Campaign")}</button>
        ` : ""}
      </div>
    `;
    campaignList.append(card);
  }

  if (campaignAdmin) {
    campaignAdmin.hidden = viewMode !== "dm";
  }
  if (playerManagement) playerManagement.hidden = !canManageCampaign() || managedCampaignId !== getCurrentCampaignId();
  if (campaignInviteForm) {
    campaignInviteForm.hidden = !canManageCampaign();
  }
  if (campaignMembers && !canManageCampaign()) {
    campaignMembers.hidden = true;
  }
  const managementTitle = document.getElementById("campaign-management-title");
  if (managementTitle) {
    managementTitle.hidden = !canManageCampaign();
    setUiText(managementTitle, "Manage players: {name}", { name: campaignMemberships[activeCampaignId]?.name || "" });
  }
}

async function getCampaignMemberUids(campaignId) {
  const directorySnapshot = await firebaseDatabase.ref(USERNAME_DIRECTORY_PATH).once("value");
  const directory = directorySnapshot.val();
  const candidateUids = new Set([currentUser.uid]);

  for (const uid of Object.values(directory && typeof directory === "object" ? directory : {})) {
    if (typeof uid === "string" && uid) {
      candidateUids.add(uid);
    }
  }

  const membershipChecks = await Promise.all(
    [...candidateUids].map(async (uid) => {
      const snapshot = await firebaseDatabase
        .ref(`${USER_CAMPAIGNS_PATH}/${uid}/${campaignId}`)
        .once("value");
      return snapshot.exists() ? uid : null;
    })
  );

  return membershipChecks.filter(Boolean);
}

async function deleteCampaign(campaignId, deleteButton) {
  const membership = campaignMemberships[campaignId];
  if (
    campaignDeleteBusy ||
    !firebaseDatabase ||
    !currentUser ||
    !canManageCampaign(campaignId)
  ) {
    return;
  }

  const campaignName = membership.name || campaignId;
  const shouldDelete = window.confirm(
    t('Permanently delete "{name}"?\n\nThis deletes its maps, markers, and player memberships. Cloudinary images remain in your Media Library. This cannot be undone.', { name: campaignName })
  );
  if (!shouldDelete) {
    return;
  }

  campaignDeleteBusy = true;
  const cardButtons = deleteButton?.closest(".campaign-card")?.querySelectorAll("button") || [];
  for (const button of cardButtons) {
    button.disabled = true;
  }
  setAuthMessage('Deleting campaign "{name}"...', "info", { name: campaignName });

  try {
    const memberUids = await getCampaignMemberUids(campaignId);
    const updates = {
      [`campaigns/${campaignId}`]: null
    };

    for (const uid of memberUids) {
      updates[`${USER_CAMPAIGNS_PATH}/${uid}/${campaignId}`] = null;
    }

    await firebaseDatabase.ref().update(updates);

    window.localStorage.removeItem(`${VISIBILITY_STORAGE_KEY}:${campaignId}`);
    window.localStorage.removeItem(`${VISIBILITY_STORAGE_VERSION_KEY}:${campaignId}`);
    delete campaignMemberships[campaignId];

    if (activeCampaignId === campaignId) {
      stopFirebaseSync();
      stopPresenceSync();
      activeCampaignId = "";
      campaignRootMap = null;
      applyCampaignRootMap(null);
    }

    campaignPickerOpen = true;
    syncCampaignUrl();
    updateAuthCopy();
    updateSessionPanel();
    renderCampaignList();
    updateAppVisibility();
    setAuthMessage('Campaign "{name}" was permanently deleted.', "success", { name: campaignName });
  } catch (error) {
    console.error("Unable to delete campaign.", error);
    for (const button of cardButtons) {
      button.disabled = false;
    }
    setAuthMessage(t("Campaign could not be deleted. Check your Firebase rules and try again."), "error");
  } finally {
    campaignDeleteBusy = false;
  }
}

function setPlayersStatus(key, type = "info", values = {}) {
  if (!playersStatus) return;
  playersStatus.hidden = !key;
  playersStatus.dataset.state = type;
  setUiText(playersStatus, key, values);
}

function getPlayerPage(kind) {
  const search = String(document.getElementById(kind + "-search")?.value || "").trim().replace(/^@/, "").toLocaleLowerCase();
  const candidates = managedPlayers.filter(player => kind === "member" ? player.role === "player" : !player.role);
  const filtered = candidates.filter(player =>
    player.displayName.toLocaleLowerCase().includes(search) || player.username.toLocaleLowerCase().includes(search));
  filtered.sort((a, b) => a.displayName.localeCompare(b.displayName) || a.username.localeCompare(b.username));
  const pages = Math.max(1, Math.ceil(filtered.length / PLAYER_PAGE_SIZE));
  const page = Math.min(Math.max(1, playerPages[kind]), pages);
  return { items: filtered.slice((page - 1) * PLAYER_PAGE_SIZE, page * PLAYER_PAGE_SIZE),
    page, pages, total: candidates.length, matches: filtered.length, search };
}

function renderPlayerManagement() {
  if (!canManageCampaign() || managedCampaignId !== getCurrentCampaignId()) return;
  if (playerManagement) playerManagement.hidden = false;
  if (campaignMembers) campaignMembers.hidden = false;
  for (const kind of ["member", "invite"]) {
    const list = kind === "member" ? campaignMemberList : campaignInviteList;
    if (!list) continue;
    const page = getPlayerPage(kind);
    playerPages[kind] = page.page;
    setUiText(document.getElementById(kind + "-count"), "Players · {count}", { count: page.total });
    setUiText(document.getElementById(kind + "-page"), "{count} results · {page} / {pages}",
      { count: page.matches, page: page.page, pages: page.pages });
    document.getElementById(kind + "-prev").disabled = playersLoading || page.page <= 1;
    document.getElementById(kind + "-next").disabled = playersLoading || page.page >= page.pages;
    list.setAttribute("aria-busy", String(playersLoading));
    if (playersLoading || playersLoadFailed || page.items.length === 0) {
      const key = playersLoading ? "Loading players..." : playersLoadFailed ? "Could not load players. Use Refresh Players to try again."
        : page.search ? "No matching players. Try another name."
        : kind === "member" ? "Your party is empty. Add a player from Find Players."
        : "All registered players are already in this campaign.";
      list.innerHTML = '<p class="player-empty" data-i18n="' + key + '">' + t(key) + "</p>";
      continue;
    }
    list.innerHTML = page.items.map(player => {
      const busy = pendingPlayerActions.has(managedCampaignId + ":" + player.uid);
      const action = kind === "member" ? "Remove" : "Add to Party";
      const attribute = kind === "member" ? "data-remove-campaign-member" : "data-invite-player";
      return '<article class="campaign-member"><div class="player-identity">' +
        avatarMarkup(player.displayName, player.avatarUrl) +
        '<div class="player-identity__copy"><strong>' + escapeHtml(player.displayName) +
        '</strong><small>@' + escapeHtml(player.username) + '</small></div></div>' +
        '<button type="button" class="auth-button ' + (kind === "member" ? "campaign-member__remove" : "") +
        '" ' + attribute + '="' + escapeHtml(player.uid) + '" data-member-username="' + escapeHtml(player.displayName) +
        '" aria-label="' + escapeHtml(t(kind === "member" ? "Remove {name}" : "Add {name} to party", { name: player.displayName })) +
        '"' + (busy ? " disabled" : "") + '>' + t(busy ? "Saving…" : action) + '</button></article>';
    }).join("");
    bindAvatarFallbacks(list);
  }
  if (playersRefresh) playersRefresh.disabled = playersLoading || pendingPlayerActions.size > 0;
}

async function refreshCampaignPlayerManagement() {
  if (!firebaseDatabase || !canManageCampaign()) return;
  const campaignId = getCurrentCampaignId();
  const actor = currentUser.uid;
  const generation = ++playerManagementGeneration;
  const isCurrent = () => generation === playerManagementGeneration &&
    campaignId === getCurrentCampaignId() && currentUser?.uid === actor && canManageCampaign();
  if (managedCampaignId !== campaignId) {
    managedPlayers = [];
    playerPages.member = playerPages.invite = 1;
    for (const kind of ["member", "invite"]) {
      const input = document.getElementById(kind + "-search");
      if (input) input.value = "";
    }
  }
  managedCampaignId = campaignId;
  playersLoading = true;
  playersLoadFailed = false;
  setPlayersStatus("");
  renderPlayerManagement();
  try {
    // Read the directory once. Bounded workers avoid serial N+1 reads and unbounded requests.
    const snapshot = await firebaseDatabase.ref(USERNAME_DIRECTORY_PATH).once("value");
    const directory = snapshot.val() || {};
    const entries = Object.entries(directory).filter(([, uid]) => typeof uid === "string" && uid);
    const result = [];
    let nextIndex = 0;
    await Promise.all(Array.from({ length: Math.min(8, entries.length) }, async () => {
      while (isCurrent() && nextIndex < entries.length) {
        const [username, uid] = entries[nextIndex++];
        const membership = (await firebaseDatabase.ref(
          USER_CAMPAIGNS_PATH + "/" + uid + "/" + campaignId).once("value")).val();
        if (membership?.role === "dm") continue;
        const [displayName, avatarUrl] = await Promise.all([loadDisplayName(uid, username), loadAvatarUrl(uid)]);
        result.push({ uid, username, displayName, avatarUrl, role: membership?.role || "" });
      }
    }));
    if (!isCurrent()) return;
    managedPlayers = result;
  } catch (error) {
    if (!isCurrent()) return;
    console.warn("Unable to load campaign players.", error);
    managedPlayers = [];
    playersLoadFailed = true;
    setPlayersStatus("Could not load players. Use Refresh Players to try again.", "error");
  } finally {
    if (isCurrent()) {
      playersLoading = false;
      renderPlayerManagement();
    }
  }
}

for (const kind of ["member", "invite"]) {
  document.getElementById(kind + "-search")?.addEventListener("input", () => {
    playerPages[kind] = 1;
    renderPlayerManagement();
  });
  for (const [direction, increment] of [["prev", -1], ["next", 1]]) {
    document.getElementById(kind + "-" + direction)?.addEventListener("click", () => {
      playerPages[kind] += increment;
      renderPlayerManagement();
    });
  }
}
playersRefresh?.addEventListener("click", () => {
  if (!pendingPlayerActions.size) return refreshCampaignPlayerManagement();
});
campaignInviteForm?.addEventListener("submit", event => event.preventDefault());

function selectCampaign(campaignId, openMap = true) {
  if (!openMap && !canManageCampaign(campaignId)) return;
  if (!campaignMemberships[campaignId] || (viewMode === "dm" && campaignMemberships[campaignId].role !== "dm")) {
    return;
  }

  setPlacementMode(false);
  stopFirebaseSync();
  stopPresenceSync();
  activeCampaignId = campaignId;
  playerManagementGeneration++;
  campaignPickerOpen = !openMap;
  syncCampaignUrl(openMap ? campaignId : "");
  campaignRootMap = null;
  applyCustomMarkersSnapshot({});
  applyCampaignRootMap(null);
  applyVisibilitySnapshot(loadMarkerVisibility());
  updateAuthCopy();
  updateSessionPanel();
  renderCampaignList();
  updateAppVisibility();

  if (openMap) {
    initializeFirebaseSync();
    startPresenceSync();
    setAuthMessage("", "info");
  } else if (isCampaignDm()) {
    refreshCampaignPlayerManagement();
  }
}

function openCampaignPicker() {
  setPlacementMode(false);
  stopFirebaseSync();
  stopPresenceSync();
  campaignPickerOpen = true;
  syncCampaignUrl();
  updateAuthCopy();
  renderCampaignList();
  updateAppVisibility();
  if (canManageCampaign()) refreshCampaignPlayerManagement();
}

function updateAuthCopy() {
  if (!authCopy) {
    return;
  }

  if (!currentUser) {
    setUiText(authCopy,
      viewMode === "dm"
        ? "Sign in or register to create a campaign and manage your maps and players as a DM."
        : "One account can host your own campaigns and join others as a player.");
    return;
  }

  if (campaignPickerOpen) {
    setUiText(authCopy,
      viewMode === "dm"
        ? "Choose a campaign to manage its maps and players, or create a new campaign."
        : "Choose a campaign to view the places and characters your DM has revealed.");
    return;
  }

  if (viewMode === "dm" && !canAccessCurrentView()) {
    setUiText(authCopy, t("This account is signed in, but it does not have DM access."));
    return;
  }

  setUiText(authCopy,
    viewMode === "dm"
      ? "You are signed in with the DM account."
      : "You are signed in and can open the player map.");
}

function updateSessionPanel() {
  if (userCenterOpen) userCenterOpen.hidden = !currentUser || !currentUserProfile;
  if (userCenterName) userCenterName.textContent = currentUser ? getDisplayName() : "";
  renderAvatar(userCenterAvatar, currentUser ? getDisplayName() : "", currentUserProfile?.avatarUrl);
  if (userCenter?.open && avatarDraft === null) renderProfileAvatar();
  if (!currentUser && userCenter?.open) userCenter.close();
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
    if (campaignPanel) {
      campaignPanel.hidden = true;
    }
    if (campaignList) {
      campaignList.innerHTML = "";
    }
    return;
  }

  if (authForm) {
    authForm.hidden = true;
  }

  const roleLabel = activeCampaignId ? (isCampaignDm() ? "DM" : t("Player")) : t("Adventurer");
  sessionPanel.hidden = false;
  const campaignName = campaignMemberships[getCurrentCampaignId()]?.name;
  sessionSummary.textContent = `${getDisplayName()} · ${roleLabel}${campaignName ? ` · ${campaignName}` : ""}`;

  if (dmLink) {
    dmLink.hidden = false;
    dmLink.href = getCampaignViewUrl("dm", isCampaignDm() ? activeCampaignId : "");
  }

  if (playerLink) {
    playerLink.hidden = false;
    playerLink.href = getCampaignViewUrl("player");
  }
  const mapViewSwitch = document.getElementById("map-view-switch");
  if (mapViewSwitch) {
    mapViewSwitch.hidden = viewMode === "player" && !isCampaignDm();
    setUiText(mapViewSwitch, viewMode === "dm" ? t("Player Preview") : t("DM Workspace"));
    mapViewSwitch.href = getCampaignViewUrl(viewMode === "dm" ? "player" : "dm");
  }
}

function updateAppVisibility() {
  const allowed = canAccessCurrentView();
  const shouldHideAuthPanel = !!currentUser && allowed && !campaignPickerOpen;

  if (authPanel) {
    authPanel.hidden = shouldHideAuthPanel;
  }

  if (appShell) {
    appShell.hidden = !allowed || campaignPickerOpen;
  }

  if (appSignoutButton) {
    appSignoutButton.hidden = !allowed;
  }

  if (dmControls) {
    dmControls.hidden = viewMode !== "dm" || !allowed || campaignPickerOpen || !campaignRootMap;
  }

  if (locationPanel && (!allowed || campaignPickerOpen)) {
    locationPanel.hidden = true;
  }

  if (presencePanel) {
    presencePanel.hidden = !allowed || campaignPickerOpen || viewMode !== "player";
  }

  if (allowed && !campaignPickerOpen) {
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
  setUiText(control, revealed ? t("Visible to Players") : t("Hidden from Players"));
  control
    .closest(".dm-marker-item")
    ?.classList.toggle("dm-marker-item--hidden", !revealed);
}

function formatMarkerType(type) {
  const iconType = MARKER_ICON_BY_ID.get(type);
  if (iconType) {
    return iconType.label;
  }

  switch (type) {
    case "information":
      return t("Information");
    case "npc":
      return t("NPC");
    case "portrait":
      return t("Portrait");
    default:
      return t("Location");
  }
}

function createDmControlItem(marker, container) {
  const item = document.createElement("div");
  item.className = "dm-marker-item";

  const label = document.createElement("div");
  label.className = "dm-marker-item__label";

  const title = document.createElement("p");
  title.className = "dm-marker-item__title";
  title.textContent = marker.dataset.locationName || t("Unnamed location");

  const meta = document.createElement("p");
  meta.className = "dm-marker-item__meta";
  const markerType = marker.dataset.locationType || "location";
  const markerKind = marker.dataset.mapSrc ? t("Big Map") : formatMarkerType(markerType);
  const assignedIcon = MARKER_ICON_BY_ID.get(getAssignedMarkerIconId(marker));
  const iconLabel = assignedIcon && assignedIcon.label !== markerKind ? ` - ${assignedIcon.label}` : "";
  meta.textContent = `${markerKind} - ${marker.dataset.locationId || ""}${iconLabel}`;

  const actions = document.createElement("div");
  actions.className = "dm-marker-item__actions";

  if (!isPortraitMarker(marker)) {
    const iconButton = document.createElement("button");
    iconButton.type = "button";
    iconButton.className = "dm-marker-item__icon";
    setUiText(iconButton, t("Change Icon"));
    iconButton.addEventListener("click", () => {
      showMarkerDetails(marker, { iconOnly: true });
    });
    actions.append(iconButton);
  }

  const toggle = document.createElement("button");
  toggle.type = "button";
  toggle.className = "dm-marker-item__toggle";
  toggle.dataset.markerControl = getMarkerVisibilityKey(marker);
  toggle.addEventListener("click", () => {
    setMarkerRevealed(marker, !isMarkerRevealed(marker));
  });

  label.append(title, meta);
  actions.append(toggle);

  if (
    marker.classList.contains("map-marker--custom") ||
    marker.classList.contains("portrait-marker--custom")
  ) {
    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.className = "dm-marker-item__delete";
    setUiText(removeButton, t("Delete"));
    removeButton.addEventListener("click", () => {
      deleteCustomMarker(marker);
    });
    actions.append(removeButton);
  }

  item.append(label, actions);

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
    setUiText(viewIntro,
      viewMode === "dm"
        ? "Build your world, manage maps and players, and reveal your adventure one location at a time."
        : "Choose your campaign, explore its maps, and discover the places and characters revealed by your DM.");
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
  const title = map?.title || t("previous map");
  return title.replace(/^Map of\s+/i, "").trim() || title;
}

function updateMapHeader() {
  if (mapTitle) {
    mapTitle.textContent = campaignRootMap ? currentMap.title : t("Campaign Map");
  }

  if (mapReturn) {
    const previousMap = mapHistory.length > 1 ? mapHistory[mapHistory.length - 2] : null;
    mapReturn.hidden = !previousMap;
    if (previousMap) {
      setUiText(mapReturn, "Return to {name}", { name: getMapReturnTitle(previousMap) });
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
  setUiText(markerToggle, nextVisible ? t("Hide Markers") : t("Show Markers"));
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
    locationPanelBody.innerHTML = `<p class="location-panel__status" data-i18n="No content is available for this marker yet.">${t("No content is available for this marker yet.")}</p>`;
    return;
  }

  locationPanelBody.innerHTML = `
    <div class="location-panel__split location-panel__split--portrait">
      <img
        src="${imageSrc}"
        alt="${marker.dataset.imageAlt || marker.dataset.locationName || t("Portrait")}"
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
  mapImage.alt = nextMap.alt || t("Map");
  currentMap = { ...nextMap };
  updateMapHeader();
  applyAllMarkerStates();
  renderDmControls();

  if (locationEyebrow) {
    setUiText(locationEyebrow, t("Selected Location"));
  }

  if (locationTitle) {
    locationTitle.textContent = nextMap.title || t("Location");
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
    alt: marker.dataset.mapAlt || marker.dataset.locationName || t("Map"),
    title: marker.dataset.targetMapTitle || marker.dataset.locationName || t("Map")
  });
}

function clampPercentage(value) {
  return Math.min(99.5, Math.max(0.5, value));
}

async function buildCustomMarkerRecord(position = null) {
  const title = dmMarkerTitleInput?.value.trim() || "";
  const description = dmMarkerDescriptionInput?.value.trim() || "";
  const markerType = dmMarkerTypeInput?.value || DEFAULT_MARKER_TYPE_ID;
  const visible = dmMarkerVisibleInput?.checked ?? true;
  const imageUploadFile = dmMarkerImageUploadInput?.files?.[0] || null;
  let imageFileName = normalizeImageFileName(dmMarkerImageFileInput?.value || "");
  let imagePath = getImagePathFromFileName(imageFileName);
  const isNpcMarker = markerType === "npc";
  const isMapMarker = (dmMarkerIsMapInput?.checked ?? false) && !isNpcMarker;
  const targetMapTitle = (dmMarkerMapTitleInput?.value.trim() || title).trim();
  const mapImageUploadFile = dmMarkerMapImageUploadInput?.files?.[0] || null;
  let mapImageFileName = normalizeImageFileName(dmMarkerMapImageFileInput?.value || "");
  let mapSrc = getImagePathFromFileName(mapImageFileName);
  const targetMapId = getMapIdFromTitle(targetMapTitle);

  if (markerType !== "npc" && !MARKER_ICON_BY_ID.has(markerType)) {
    setDmMarkerStatus(t("Choose a valid marker type."), "error");
    return null;
  }

  if (!title) {
    setDmMarkerStatus(isNpcMarker ? t("Add a title before creating the NPC.") : t("Add a title before placing the marker."), "error");
    return null;
  }

  if (!isNpcMarker && !position) {
    setDmMarkerStatus(t("Click the map to choose where this marker should appear."), "error");
    return null;
  }

  const imageUploadError = getImageUploadValidationError(imageUploadFile);
  if (imageUploadError) {
    setDmMarkerStatus(imageUploadError, "error");
    return null;
  }

  if (!imageUploadFile && imageFileName) {
    if (!isSafeImageFileName(imageFileName)) {
      setDmMarkerStatus(t("Use an image file name ending in .jpg, .jpeg, .png, .webp, .gif, or .avif."), "error");
      return null;
    }

    const imageExists = await imageExistsAtPath(imagePath);
    if (!imageExists) {
      setDmMarkerStatus('Could not find "{name}" in assets/images. Upload it there first.', "error", { name: imageFileName });
      return null;
    }
  }

  if (isMapMarker) {
    if (!targetMapTitle) {
      setDmMarkerStatus(t("Add a map name before placing a big map marker."), "error");
      return null;
    }

    if (!targetMapId) {
      setDmMarkerStatus(t("Use at least one letter or number in the map name."), "error");
      return null;
    }

    const mapImageUploadError = getImageUploadValidationError(mapImageUploadFile);
    if (mapImageUploadError) {
      setDmMarkerStatus(mapImageUploadError, "error");
      return null;
    }

    if (!mapImageUploadFile && !isSafeImageFileName(mapImageFileName)) {
      setDmMarkerStatus(t("Choose an existing map image or upload a new one."), "error");
      return null;
    }

    if (!mapImageUploadFile) {
      const mapImageExists = await imageExistsAtPath(mapSrc);
      if (!mapImageExists) {
        setDmMarkerStatus('Could not find "{name}" in assets/images.', "error", { name: mapImageFileName });
        return null;
      }
    }
  }

  try {
    if (imageUploadFile) {
      setDmMarkerStatus(t("Uploading marker image to Cloudinary..."), "info");
      const upload = await uploadImageToCloudinary(imageUploadFile);
      imageFileName = upload.fileName;
      imagePath = upload.path;
    }

    if (isMapMarker && mapImageUploadFile) {
      setDmMarkerStatus(t("Uploading map image to Cloudinary..."), "info");
      const upload = await uploadImageToCloudinary(mapImageUploadFile);
      mapImageFileName = upload.fileName;
      mapSrc = upload.path;
    }
  } catch (error) {
    console.error("Unable to upload marker image.", error);
    setDmMarkerStatus(error?.message || t("Image upload failed. Try again."), "error");
    return null;
  }

  const markerRef = customMarkersRef.push();
  const markerId = markerRef.key;

  if (!markerId) {
    setDmMarkerStatus(t("Firebase did not return a marker id."), "error");
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
    dmMarkerTypeInput.value = DEFAULT_MARKER_TYPE_ID;
  }
  syncMapMarkerFields();
}

async function saveCustomMarker(markerRef, markerRecord, successMessage, successValues = {}) {
  try {
    const markerId = markerRef.key;
    const updates = {
      [`${getMapDataPath("customMarkers")}/${markerId}`]: markerRecord
    };
    if (MARKER_ICON_BY_ID.has(markerRecord.type)) {
      const markerIconKey = encodeURIComponent(getCustomMarkerVisibilityKey(markerRecord));
      updates[`${getMapDataPath("markerIcons")}/${markerIconKey}`] = markerRecord.type;
    }
    await firebaseDatabase.ref().update(updates);
    markerVisibility[getCustomMarkerVisibilityKey(markerRecord)] = markerRecord.visible !== false;
    saveMarkerVisibility();
    broadcastVisibilityState();
    setPlacementMode(false);
    setDmMarkerStatus(successMessage, "success", successValues);
    resetDmMarkerForm();
  } catch (error) {
    console.error("Unable to create custom marker.", error);
    setDmMarkerStatus(t("Marker could not be saved. Check your Firebase rules."), "error");
  }
}

async function createCustomNpcMarker() {
  if (markerSaveBusy || !firebaseDatabase || !customMarkersRef || !canAccessCurrentView() || viewMode !== "dm") {
    return;
  }

  markerSaveBusy = true;
  dmMarkerPlacementButton.disabled = true;
  try {
    const result = await buildCustomMarkerRecord();
    if (!result) {
      return;
    }

    const { markerRef, markerRecord } = result;
    await saveCustomMarker(markerRef, markerRecord, 'NPC "{name}" added to {map}.', { name: markerRecord.title, map: currentMap.title });
  } finally {
    markerSaveBusy = false;
    dmMarkerPlacementButton.disabled = false;
  }
}

async function createCustomMarkerAtPosition(x, y) {
  if (markerSaveBusy || !firebaseDatabase || !customMarkersRef || !canAccessCurrentView() || viewMode !== "dm") {
    return;
  }

  markerSaveBusy = true;
  dmMarkerPlacementButton.disabled = true;
  try {
    const result = await buildCustomMarkerRecord({ x, y });
    if (!result) {
      return;
    }

    const { markerRef, markerRecord } = result;
    await saveCustomMarker(markerRef, markerRecord, 'Marker "{name}" added to {map}.', { name: markerRecord.title, map: currentMap.title });
  } finally {
    markerSaveBusy = false;
    dmMarkerPlacementButton.disabled = false;
  }
}

async function deleteCustomMarker(marker) {
  if (!firebaseDatabase || !customMarkersRef || !canAccessCurrentView() || viewMode !== "dm") {
    return;
  }

  const markerId = marker.dataset.locationId;
  const markerName = marker.dataset.locationName || t("this marker");

  if (
    !markerId ||
    (
      !marker.classList.contains("map-marker--custom") &&
      !marker.classList.contains("portrait-marker--custom")
    )
  ) {
    return;
  }

  const shouldDelete = window.confirm(t('Delete "{name}"? This cannot be undone.', { name: markerName }));
  if (!shouldDelete) {
    return;
  }

  try {
    const updates = {
      [`${getMapDataPath("customMarkers")}/${markerId}`]: null,
      [`${getMapDataPath("markerIcons")}/${getMarkerIconStorageKey(marker)}`]: null
    };
    await firebaseDatabase.ref().update(updates);
    delete markerVisibility[getMarkerVisibilityKey(marker)];
    saveMarkerVisibility();
    broadcastVisibilityState();

    if (locationPanel && locationTitle?.textContent === markerName) {
      locationPanel.hidden = true;
    }

    setDmMarkerStatus('Marker "{name}" deleted.', "success", { name: markerName });
  } catch (error) {
    console.error("Unable to delete custom marker.", error);
    setDmMarkerStatus(t("Marker could not be deleted. Check your Firebase rules."), "error");
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
    setDmMarkerStatus(t("Add a title before entering placement mode."), "error");
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
rootMapImageFileInput?.addEventListener("focus", loadImageFileOptions);
rootMapImageFileInput?.addEventListener("pointerdown", loadImageFileOptions);
bindExclusiveImageInputs(dmMarkerImageFileInput, dmMarkerImageUploadInput);
bindExclusiveImageInputs(dmMarkerMapImageFileInput, dmMarkerMapImageUploadInput);
bindExclusiveImageInputs(rootMapImageFileInput, rootMapImageUploadInput);

mapStage?.addEventListener("click", async (event) => {
  if (markerSaveBusy || !placementModeActive || viewMode !== "dm" || !canAccessCurrentView() || !mapImage) {
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
      return t("That username and password combination did not match.");
    case "auth/email-already-in-use":
      return t("That username already exists. Try signing in instead.");
    case "auth/weak-password":
      return t("Choose a password with at least 6 characters.");
    case "auth/network-request-failed":
      return t("Firebase could not be reached. Check your internet connection.");
    default:
      return error?.message || t("Authentication failed.");
  }
}

campaignList?.addEventListener("click", async (event) => {
  const openButton = event.target.closest("[data-campaign-open]");
  const manageButton = event.target.closest("[data-campaign-manage]");
  const deleteButton = event.target.closest("[data-campaign-delete]");

  if (openButton) {
    selectCampaign(openButton.dataset.campaignOpen, true);
  } else if (manageButton) {
    selectCampaign(manageButton.dataset.campaignManage, false);
  } else if (deleteButton) {
    await deleteCampaign(deleteButton.dataset.campaignDelete, deleteButton);
  }
});

campaignSwitchButton?.addEventListener("click", openCampaignPicker);

campaignCreateForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const name = String(campaignNameInput?.value || "").trim();

  if (viewMode !== "dm" || campaignCreateBusy) return;
  if (!firebaseDatabase || !currentUser || !name || name.length > 60) {
    setAuthMessage(t("Enter a campaign name with 1-60 characters."), "error");
    return;
  }

  const submitButton = campaignCreateForm.querySelector('button[type="submit"]');
  campaignCreateBusy = true;
  submitButton.disabled = true;
  try {
    const campaignId = createCampaignId(name);
    const createdAt = new Date().toISOString();
    const membership = {
      name,
      role: "dm",
      joinedAt: createdAt,
      schemaVersion: 2
    };
    await firebaseDatabase.ref().update({
      [`campaigns/${campaignId}`]: { name, ownerUid: currentUser.uid, createdAt, schemaVersion: 2 },
      [`${USER_CAMPAIGNS_PATH}/${currentUser.uid}/${campaignId}`]: membership
    });
    campaignMemberships[campaignId] = membership;
    campaignNameInput.value = "";
    selectCampaign(campaignId, true);
  } catch (error) {
    console.error("Unable to create campaign.", error);
    setAuthMessage(t("Campaign could not be created. Check your Firebase rules."), "error");
  } finally {
    campaignCreateBusy = false;
    submitButton.disabled = false;
  }
});

rootMapForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = String(rootMapTitleInput?.value || "").trim();
  const uploadFile = rootMapImageUploadInput?.files?.[0] || null;
  let fileName = normalizeImageFileName(rootMapImageFileInput?.value || "");
  let imageSrc = getImagePathFromFileName(fileName);

  if (!firebaseDatabase || !canManageCampaign() || !title) {
    setAuthMessage(t("Enter a map title and choose or upload an image."), "error");
    return;
  }

  const uploadError = getImageUploadValidationError(uploadFile);
  if (uploadError || (!uploadFile && !isSafeImageFileName(fileName))) {
    setAuthMessage(uploadError || t("Choose an existing map image or upload a new one."), "error");
    return;
  }

  const submitButton = rootMapForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  if (rootMapStatus) {
    rootMapStatus.hidden = false;
    setUiText(rootMapStatus, t("Saving starting map..."));
    rootMapStatus.dataset.state = "info";
  }

  try {
    if (uploadFile) {
      setUiText(rootMapStatus, t("Uploading starting map to Cloudinary..."));
      const upload = await uploadImageToCloudinary(uploadFile);
      fileName = upload.fileName;
      imageSrc = upload.path;
    }

    setUiText(rootMapStatus, t("Saving starting map..."));
    await firebaseDatabase.ref(getCampaignPath("rootMap")).set({
      id: "root",
      title,
      src: imageSrc,
      alt: `Map of ${title}`,
      imageFileName: fileName
    });

    rootMapForm.reset();
    setUiText(rootMapStatus, t("Starting map saved."));
    rootMapStatus.dataset.state = "success";
  } catch (error) {
    console.error("Unable to save campaign starting map.", error);
    setUiText(rootMapStatus, error?.message || t("Starting map could not be saved."));
    rootMapStatus.dataset.state = "error";
  } finally {
    submitButton.disabled = false;
  }
});

async function changeCampaignPlayer(uid, remove = false) {
  const campaignId = getCurrentCampaignId();
  const actor = currentUser?.uid;
  const membership = campaignMemberships[campaignId];
  const player = managedCampaignId === campaignId ? managedPlayers.find(item => item.uid === uid) : null;
  const actionKey = campaignId + ":" + uid;
  if (!firebaseDatabase || !actor || !canManageCampaign() || !player || playersLoading ||
      pendingPlayerActions.has(actionKey) || (remove ? player.role !== "player" : !!player.role)) return;
  if (remove && !window.confirm(t("Remove {name} from this campaign?", { name: player.displayName }))) return;
  pendingPlayerActions.add(actionKey);
  renderPlayerManagement();
  const isCurrent = () => currentUser?.uid === actor && getCurrentCampaignId() === campaignId && canManageCampaign();
  try {
    const membershipRef = firebaseDatabase.ref(USER_CAMPAIGNS_PATH + "/" + uid + "/" + campaignId);
    // Recheck before writing: another DM tab may already have changed this membership.
    const latest = (await membershipRef.once("value")).val();
    if (!isCurrent()) return;
    if (remove ? latest?.role !== "player" : !!latest) {
      await refreshCampaignPlayerManagement();
      if (isCurrent()) setPlayersStatus("This player's membership changed. The list has been refreshed.", "info");
      return;
    }
    if (remove) {
      await firebaseDatabase.ref().update({
        [USER_CAMPAIGNS_PATH + "/" + uid + "/" + campaignId]: null,
        ["campaigns/" + campaignId + "/playerDirectory/" + uid]: null
      });
    } else {
      await membershipRef.set({
        name: membership.name || campaignId, role: "player", joinedAt: new Date().toISOString(),
        ...(membership.schemaVersion === 2 ? { schemaVersion: 2 } : {})
      });
    }
    if (!isCurrent()) return;
    const listedPlayer = managedPlayers.find(item => item.uid === uid);
    if (listedPlayer) listedPlayer.role = remove ? "" : "player";
    setPlayersStatus(remove ? "{name} was removed from this campaign." : "{name} can now see {campaign}.", "success",
      { name: player.displayName, campaign: membership.name || campaignId });
  } catch (error) {
    console.warn("Unable to update campaign player.", error);
    if (isCurrent()) setPlayersStatus(remove ? "Player could not be removed. Check your Firebase rules."
      : "Player could not be added. Check the username and Firebase rules.", "error");
  } finally {
    pendingPlayerActions.delete(actionKey);
    if (isCurrent()) renderPlayerManagement();
  }
}

campaignInviteList?.addEventListener("click", event => {
  const button = event.target.closest("[data-invite-player]");
  if (button) return changeCampaignPlayer(button.dataset.invitePlayer);
});
campaignMemberList?.addEventListener("click", event => {
  const button = event.target.closest("[data-remove-campaign-member]");
  if (button) return changeCampaignPlayer(button.dataset.removeCampaignMember, true);
});

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
    setAuthMessage(t("Use a username with 3-24 letters, numbers, dots, underscores, or dashes."), "error");
    return;
  }

  if (password.length < 6) {
    setAuthMessage(t("Choose a password with at least 6 characters."), "error");
    return;
  }

  setAuthBusy(true);
  setAuthMessage(t("Signing in..."), "info");

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
    setAuthMessage(t("Use a username with 3-24 letters, numbers, dots, underscores, or dashes."), "error");
    return;
  }

  if (password.length < 6) {
    setAuthMessage(t("Choose a password with at least 6 characters."), "error");
    return;
  }

  setAuthBusy(true);
  setAuthMessage(t("Creating account..."), "info");

  try {
    await createUserWithUsername(username, password);
    authPasswordInput.value = "";
    setAuthMessage(t("Account created. You are now signed in."), "success");
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
    setAuthMessage(t("Signed out."), "info");
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
    setAuthMessage(t("Signed out."), "info");
  } catch (error) {
    setAuthMessage(getFriendlyAuthError(error), "error");
  }
});

displayNameForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!firebaseDatabase || !currentUser || !currentUserProfile || profileSaveBusy) {
    return;
  }

  const nextDisplayName = normalizeDisplayName(displayNameInput?.value || "");

  if (!isValidDisplayName(nextDisplayName)) {
    setDisplayNameStatus(t("Display name must contain 1–24 characters and cannot be blank."), "error");
    return;
  }

  profileSaveBusy = true;
  const uid = currentUser.uid;
  const profile = currentUserProfile;
  const draft = avatarDraft;
  const profileControls = [displayNameInput, displayNameVisibleInput, profileAvatarInput, profileAvatarChoose, profileAvatarRemove, userCenterClose];
  profileControls.forEach(control => { if (control) control.disabled = true; });
  if (displayNameSaveButton) {
    displayNameSaveButton.disabled = true;
  }

  try {
    const showInPlayerList = displayNameVisibleInput?.checked ?? true;
    setDisplayNameStatus(t("Saving…"), "info");
    if (draft?.file && !draft.url) {
      const validationError = getAvatarValidationError(draft.file);
      if (validationError) throw new Error(validationError);
      setDisplayNameStatus(t("Uploading profile photo…"), "info");
      const upload = await uploadImageToCloudinary(draft.file);
      if (currentUser?.uid !== uid) return;
      draft.url = safeAvatarUrl(upload.path);
      if (!draft.url) throw new Error("Cloudinary returned an unexpected image URL.");
    }
    const avatarUrl = draft === null ? safeAvatarUrl(profile.avatarUrl) : draft.url;
    // Refresh memberships so a removed campaign cannot block unrelated profile edits.
    const snapshot = await firebaseDatabase.ref(`${USER_CAMPAIGNS_PATH}/${uid}`).once("value");
    const memberships = snapshot.val() || {};
    const updates = {
      [`${USERS_PATH}/${uid}/displayName`]: nextDisplayName,
      [`${USERS_PATH}/${uid}/showInPlayerList`]: showInPlayerList
    };
    if (draft !== null) updates[`${USERS_PATH}/${uid}/avatarUrl`] = avatarUrl || null;
    for (const [campaignId, membership] of Object.entries(memberships)) {
      if (membership?.role !== "player") continue;
      updates[`campaigns/${campaignId}/playerDirectory/${uid}`] = {
        username: profile.username,
        displayName: nextDisplayName,
        ...(avatarUrl ? { avatarUrl } : {}),
        role: "player",
        showInPlayerList,
        lastUpdated: Date.now()
      };
    }
    if (currentUser?.uid !== uid) return;
    await firebaseDatabase.ref().update(updates);
    if (currentUser?.uid !== uid) return;

    currentUserProfile = {
      ...currentUserProfile,
      displayName: nextDisplayName,
      showInPlayerList,
      avatarUrl
    };

    resetAvatarDraft();
    updateSessionPanel();
    renderProfileAvatar();
    setDisplayNameStatus(t("Profile saved. Your party will see your updated details."), "success");
  } catch (error) {
    console.error("Unable to update display name.", error);
    if (currentUser?.uid === uid) setDisplayNameStatus(t("Could not save. Check your connection and try again."), "error");
  } finally {
    profileSaveBusy = false;
    profileControls.forEach(control => { if (control) control.disabled = false; });
    renderProfileAvatar();
    if (displayNameSaveButton) {
      displayNameSaveButton.disabled = false;
    }
  }
});

async function handleAuthStateChanged(user) {
  playerManagementGeneration++;
  managedPlayers = [];
  managedCampaignId = "";
  resetAvatarDraft();
  userProfileRef?.off();
  userProfileRef = null;
  currentUser = user;
  currentUserProfile = null;
  activeCampaignId = "";
  campaignMemberships = {};
  campaignPickerOpen = true;
  stopFirebaseSync();
  stopPresenceSync();
  stopCampaignMembershipSync();
  setPlacementMode(false);
  applyCampaignRootMap(null);

  if (!user) {
    updateAuthCopy();
    updateSessionPanel();
    updateAppVisibility();
    setAuthBusy(false);
    if (viewMode === "dm") {
      setAuthMessage(t("Sign in or register to create and manage your own campaigns."), "info");
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
      setAuthMessage(t("Signed in, but the user profile could not be loaded. Check Firebase rules."), "error");
    }
  }

  startUserProfileSync();
  updateAuthCopy();
  updateSessionPanel();
  try {
    await loadCampaignMemberships();
    startCampaignMembershipSync();
    updateSessionPanel();
    renderCampaignList();
    const requestedCampaign = new URLSearchParams(window.location.search).get("campaign");
    if (requestedCampaign && campaignMemberships[requestedCampaign] &&
        (viewMode !== "dm" || isCampaignDm(requestedCampaign))) {
      selectCampaign(requestedCampaign, true);
    } else if (requestedCampaign) {
      syncCampaignUrl();
    }
  } catch (error) {
    console.error("Unable to load campaigns.", error);
    setAuthMessage(t("Campaigns could not be loaded. Publish the updated Firebase rules and try again."), "error");
  }
  updateAppVisibility();
  if (Object.keys(campaignMemberships).length > 0) {
    setAuthMessage("", "info");
  }
}

function initializeAuth() {
  if (!initializeFirebaseServices()) {
    return;
  }

  firebaseAuth.onAuthStateChanged((user) => {
    handleAuthStateChanged(user);
  });
}

window.addEventListener("languagechange", () => {
  // Update UI only; keep selected maps, uploads, open dialogs and unsaved form values.
  applyViewMode();
  updateAuthCopy();
  updateSessionPanel();
  renderMapLegend();
  renderCampaignList();
  updateMapHeader();
  renderPlayerManagement();
  if (viewMode === "dm" && canAccessCurrentView() && !campaignPickerOpen) renderDmControls();
  const editor = locationPanelBody?.querySelector(".marker-icon-editor");
  if (editor) {
    updateMarkerIconPreview(
      editor.querySelector(".marker-icon-editor__preview-image"),
      editor.querySelector(".marker-icon-editor__default-preview"),
      editor.querySelector("select").value
    );
  }
  window.I18n.apply();
});

window.addEventListener("resize", syncPortraitRailHeight);

renderMapLegend();
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
