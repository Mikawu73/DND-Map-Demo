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
const campaignInvitePlayerSelect = document.getElementById("campaign-invite-player");
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
  { id: "gate", label: "大门", fileName: "大门.png" },
  { id: "village", label: "村庄", fileName: "村庄.png" },
  { id: "town", label: "城镇", fileName: "城镇.png" },
  { id: "manor", label: "庄园", fileName: "庄园.png" },
  { id: "castle", label: "城堡", fileName: "城堡.png" },
  { id: "temple", label: "神殿", fileName: "神殿.png" },
  { id: "tent", label: "帐篷", fileName: "帐篷.png" },
  { id: "hill", label: "山丘", fileName: "山丘.png" },
  { id: "letter", label: "信件", fileName: "信件.png" },
  { id: "point-of-interest", label: "兴趣点", fileName: "兴趣点.png" }
].map((icon) => ({
  ...icon,
  src: `assets/icons/${encodeURIComponent(icon.fileName)}`
}));
const MARKER_ICON_BY_ID = new Map(MARKER_ICON_DEFINITIONS.map((icon) => [icon.id, icon]));
const AUTH_CONFIG = window.APP_AUTH_CONFIG || {};
const CLOUDINARY_CONFIG = window.CLOUDINARY_CONFIG || {};
const USERNAME_DOMAIN = AUTH_CONFIG.usernameDomain || "barovia.local";
const ADMIN_ROLE = AUTH_CONFIG.adminRole || "admin";
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
    .slice(0, 24) || "campaign";
  return `${slug}-${Date.now().toString(36)}`.slice(0, 40);
}

function getCurrentCampaignId() {
  return activeCampaignId;
}

function getCampaignPath(suffix = "") {
  const campaignId = getCurrentCampaignId();
  return campaignId ? `campaigns/${campaignId}${suffix ? `/${suffix}` : ""}` : "";
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

function isAdminProfile(profile) {
  return profile?.role === ADMIN_ROLE;
}

function isCampaignDm(campaignId = getCurrentCampaignId()) {
  return campaignMemberships[campaignId]?.role === "dm";
}

function canAccessCurrentView() {
  if (!currentUser || !isValidCampaignId(getCurrentCampaignId())) {
    return false;
  }

  return viewMode === "dm" ? isCampaignDm() : !!campaignMemberships[getCurrentCampaignId()];
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

function getImageUploadValidationError(file) {
  if (!file) {
    return "";
  }

  const fileName = normalizeImageFileName(file.name);
  if (!isSafeImageFileName(fileName)) {
    return "Choose a JPG, JPEG, PNG, WebP, GIF, or AVIF image with a file name under 120 characters.";
  }

  if (!file.size) {
    return "The selected image is empty.";
  }

  if (file.size > MAX_IMAGE_UPLOAD_BYTES) {
    return "The selected image is larger than 10 MB.";
  }

  if (file.type && !file.type.startsWith("image/")) {
    return "The selected file is not an image.";
  }

  return "";
}

async function uploadImageToCloudinary(file) {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
    throw new Error("Cloudinary upload is not configured.");
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
    throw new Error(payload?.error?.message || `Cloudinary upload failed (${response.status}).`);
  }

  const secureUrl = String(payload?.secure_url || "");
  let uploadedUrl;
  try {
    uploadedUrl = new URL(secureUrl);
  } catch {
    throw new Error("Cloudinary did not return a valid image URL.");
  }

  const expectedPathPrefix = `/${CLOUDINARY_CLOUD_NAME}/image/upload/`;
  if (
    uploadedUrl.protocol !== "https:" ||
    uploadedUrl.hostname !== "res.cloudinary.com" ||
    !uploadedUrl.pathname.startsWith(expectedPathPrefix)
  ) {
    throw new Error("Cloudinary returned an unexpected image URL.");
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
    populateImageSelect(dmMarkerImageFileInput, imageNames, "No image");
    populateImageSelect(dmMarkerMapImageFileInput, imageNames, "Choose map image");
    populateImageSelect(rootMapImageFileInput, imageNames, "Choose map image");
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

function updateMarkerIconPreview(previewImage, defaultPreview, iconId) {
  const icon = MARKER_ICON_BY_ID.get(iconId);
  previewImage.hidden = !icon;
  defaultPreview.hidden = !!icon;

  if (icon) {
    previewImage.src = icon.src;
    previewImage.alt = `${icon.label} marker icon preview`;
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
    <p class="location-panel__eyebrow">DM only</p>
    <h3 id="marker-icon-editor-title">Marker Icon</h3>
    <p>Choose the symbol displayed on the map. This setting is shared with players in this campaign.</p>
  `;

  const form = document.createElement("form");
  form.className = "marker-icon-editor__form";

  const preview = document.createElement("div");
  preview.className = "marker-icon-editor__preview";
  const previewImage = document.createElement("img");
  previewImage.className = "marker-icon-editor__preview-image";
  const defaultPreview = document.createElement("span");
  defaultPreview.className = "marker-icon-editor__default-preview";
  defaultPreview.setAttribute("aria-label", "Default marker preview");
  preview.append(previewImage, defaultPreview);

  const field = document.createElement("label");
  field.className = "marker-icon-editor__field";
  const fieldLabel = document.createElement("span");
  fieldLabel.textContent = "Map icon";
  const select = document.createElement("select");
  select.setAttribute("aria-label", "Map icon");
  select.innerHTML = [
    '<option value="">Default marker</option>',
    ...MARKER_ICON_DEFINITIONS.map(
      (icon) => `<option value="${escapeHtml(icon.id)}">${escapeHtml(icon.label)}</option>`
    )
  ].join("");
  select.value = getAssignedMarkerIconId(marker);
  field.append(fieldLabel, select);

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "auth-button auth-button--primary";
  saveButton.textContent = "Save Icon";

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
      status.textContent = "Choose a valid marker icon.";
      return;
    }

    saveButton.disabled = true;
    status.hidden = false;
    status.dataset.state = "info";
    status.textContent = "Saving marker icon...";

    try {
      const iconRef = markerIconsRef.child(getMarkerIconStorageKey(marker));
      if (iconId) {
        await iconRef.set(iconId);
      } else {
        await iconRef.remove();
      }
      status.dataset.state = "success";
      status.textContent = iconId ? "Marker icon updated." : "Default marker restored.";
    } catch (error) {
      console.error("Unable to update marker icon.", error);
      status.dataset.state = "error";
      status.textContent = "Marker icon could not be saved. Check your Firebase rules.";
    } finally {
      saveButton.disabled = false;
    }
  });

  form.append(preview, field, saveButton);
  editor.append(heading, form, status);
  locationPanelBody.prepend(editor);
}

async function showMarkerDetails(marker, options = {}) {
  if (!canAccessCurrentView()) {
    return;
  }

  const { iconOnly = false } = options;
  const mapSrc = marker.dataset.mapSrc;
  if (mapSrc && !iconOnly) {
    await showMapImage(marker);
    return;
  }

  const locationSrc = marker.dataset.locationSrc;
  if (locationEyebrow) {
    locationEyebrow.textContent = iconOnly
      ? "DM Marker Settings"
      : isPortraitMarker(marker)
        ? "Selected Portrait"
        : "Selected Location";
  }
  locationTitle.textContent = marker.dataset.locationName || (isPortraitMarker(marker) ? "Portrait" : "Location");
  locationTitle.classList.toggle("location-panel__title--strahd", marker.dataset.locationId === "strahd-portrait");
  locationPanelBody.innerHTML = iconOnly
    ? '<p class="location-panel__status">Use the DM controls below to change this marker icon.</p>'
    : '<p class="location-panel__status">Loading...</p>';
  locationPanel.hidden = false;
  locationPanel.scrollIntoView({ behavior: "smooth", block: "start" });

  if (iconOnly) {
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
      ? '<p class="location-panel__status">Failed to load character content.</p>'
      : '<p class="location-panel__status">Failed to load location content.</p>';
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
    applyCustomMarkersSnapshot({});
    applyVisibilitySnapshot({});
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
  if (!firebaseDatabase || firebaseSyncStarted || !getCurrentCampaignId()) {
    return;
  }

  databaseRef = firebaseDatabase.ref(getCampaignPath("maps/barovia/markerVisibility"));
  customMarkersRef = firebaseDatabase.ref(getCampaignPath("maps/barovia/customMarkers"));
  markerIconsRef = firebaseDatabase.ref(getCampaignPath("maps/barovia/markerIcons"));
  rootMapRef = firebaseDatabase.ref(getCampaignPath("rootMap"));
  firebaseReady = true;
  firebaseSyncStarted = true;

  rootMapRef.on("value", (snapshot) => {
    applyCampaignRootMap(snapshot.val());
  }, (error) => {
    console.warn("Unable to read campaign root map.", error);
    setAuthMessage("Campaign map configuration could not be loaded.", "error");
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
    setAuthMessage("Map sync could not read Firebase data. Check your database rules.", "error");
  });

  customMarkersRef.on("value", (snapshot) => {
    const data = snapshot.val();
    applyCustomMarkersSnapshot(data && typeof data === "object" ? data : {});
  }, (error) => {
    console.warn("Unable to read custom markers from Firebase.", error);
    setDmMarkerStatus("Custom markers could not be loaded from Firebase.", "error");
  });

  markerIconsRef.on("value", (snapshot) => {
    const data = snapshot.val();
    applyMarkerIconsSnapshot(data && typeof data === "object" ? data : {});
  }, (error) => {
    console.warn("Unable to read marker icons from Firebase.", error);
    setAuthMessage("Marker icons could not be loaded. Check your database rules.", "error");
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
      viewMode === "dm" ? "You are not managing any campaigns yet." : "No campaigns are available for this account."
    }</p>`;
  }

  for (const [campaignId, membership] of memberships) {
    const card = document.createElement("article");
    card.className = "campaign-card";
    card.setAttribute("aria-pressed", String(campaignId === activeCampaignId));
    card.innerHTML = `
      <strong>${escapeHtml(membership.name || campaignId)}</strong>
      <span>${membership.role === "dm" ? "Dungeon Master" : "Player"}</span>
      <div class="session-panel__actions">
        <button type="button" class="auth-button auth-button--primary" data-campaign-open="${escapeHtml(campaignId)}">Open Map</button>
        ${membership.role === "dm" ? `
          <button type="button" class="auth-button" data-campaign-manage="${escapeHtml(campaignId)}">Manage Players</button>
          <button type="button" class="auth-button auth-button--danger" data-campaign-delete="${escapeHtml(campaignId)}">Delete Campaign</button>
        ` : ""}
      </div>
    `;
    campaignList.append(card);
  }

  if (campaignAdmin) {
    campaignAdmin.hidden = !isAdminProfile(currentUserProfile);
  }
  if (campaignInviteForm) {
    campaignInviteForm.hidden = !isCampaignDm();
  }
  if (campaignMembers && !isCampaignDm()) {
    campaignMembers.hidden = true;
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
    membership?.role !== "dm"
  ) {
    return;
  }

  const campaignName = membership.name || campaignId;
  const shouldDelete = window.confirm(
    `Permanently delete "${campaignName}"?\n\n` +
    "This deletes its maps, markers, and player memberships. Cloudinary images remain in your Media Library. This cannot be undone."
  );
  if (!shouldDelete) {
    return;
  }

  campaignDeleteBusy = true;
  const cardButtons = deleteButton?.closest(".campaign-card")?.querySelectorAll("button") || [];
  for (const button of cardButtons) {
    button.disabled = true;
  }
  setAuthMessage(`Deleting campaign "${campaignName}"...`, "info");

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
    updateAuthCopy();
    updateSessionPanel();
    renderCampaignList();
    updateAppVisibility();
    setAuthMessage(`Campaign "${campaignName}" was permanently deleted.`, "success");
  } catch (error) {
    console.error("Unable to delete campaign.", error);
    for (const button of cardButtons) {
      button.disabled = false;
    }
    setAuthMessage("Campaign could not be deleted. Check your Firebase rules and try again.", "error");
  } finally {
    campaignDeleteBusy = false;
  }
}

async function loadInvitePlayerOptions() {
  if (!firebaseDatabase || !campaignInvitePlayerSelect || !isCampaignDm()) {
    return;
  }

  campaignInvitePlayerSelect.disabled = true;
  campaignInvitePlayerSelect.innerHTML = '<option value="">Loading players...</option>';

  try {
    const playersSnapshot = await firebaseDatabase.ref(USERNAME_DIRECTORY_PATH).once("value");
    const players = playersSnapshot.val();
    const availablePlayers = [];

    for (const [username, uid] of Object.entries(players && typeof players === "object" ? players : {})) {
      if (uid === currentUser.uid) {
        continue;
      }
      const membershipSnapshot = await firebaseDatabase.ref(`${USER_CAMPAIGNS_PATH}/${uid}/${getCurrentCampaignId()}`).once("value");
      if (!membershipSnapshot.exists()) {
        availablePlayers.push({
          uid,
          username,
          displayName: username
        });
      }
    }

    availablePlayers.sort((a, b) => a.displayName.localeCompare(b.displayName));
    campaignInvitePlayerSelect.innerHTML = '<option value="">Select a player</option>';

    for (const player of availablePlayers) {
      const option = document.createElement("option");
      option.value = player.uid;
      option.dataset.username = player.username;
      option.textContent = `${player.displayName} (${player.username})`;
      campaignInvitePlayerSelect.append(option);
    }

    if (availablePlayers.length === 0) {
      campaignInvitePlayerSelect.innerHTML = '<option value="">All existing players are already members</option>';
    }
  } catch (error) {
    console.error("Unable to load players for invitation.", error);
    campaignInvitePlayerSelect.innerHTML = '<option value="">Player list could not be loaded</option>';
  } finally {
    campaignInvitePlayerSelect.disabled = false;
  }
}

async function loadCampaignMemberList() {
  if (!firebaseDatabase || !campaignMembers || !campaignMemberList || !isCampaignDm()) {
    return;
  }

  campaignMembers.hidden = false;
  campaignMemberList.innerHTML = '<p class="location-panel__status">Loading current players...</p>';

  try {
    const usernamesSnapshot = await firebaseDatabase.ref(USERNAME_DIRECTORY_PATH).once("value");
    const usernames = usernamesSnapshot.val();
    const usernameByUid = {};
    for (const [username, uid] of Object.entries(usernames && typeof usernames === "object" ? usernames : {})) {
      usernameByUid[uid] = username;
    }

    const members = [];
    for (const [uid, username] of Object.entries(usernameByUid)) {
      const membershipSnapshot = await firebaseDatabase.ref(`${USER_CAMPAIGNS_PATH}/${uid}/${getCurrentCampaignId()}`).once("value");
      const membership = membershipSnapshot.val();
      if (membership?.role === "player") {
        members.push({ uid, username });
      }
    }

    members.sort((a, b) => a.username.localeCompare(b.username));
    campaignMemberList.innerHTML = "";

    if (members.length === 0) {
      campaignMemberList.innerHTML = '<p class="location-panel__status">No players are currently in this campaign.</p>';
      return;
    }

    for (const member of members) {
      const item = document.createElement("article");
      item.className = "campaign-member";
      item.innerHTML = `
        <strong>${escapeHtml(member.username)}</strong>
        <button type="button" class="auth-button campaign-member__remove" data-remove-campaign-member="${escapeHtml(member.uid)}" data-member-username="${escapeHtml(member.username)}">Remove</button>
      `;
      campaignMemberList.append(item);
    }
  } catch (error) {
    console.error("Unable to load campaign members.", error);
    campaignMemberList.innerHTML = '<p class="location-panel__status">Current players could not be loaded.</p>';
  }
}

async function refreshCampaignPlayerManagement() {
  await Promise.all([
    loadInvitePlayerOptions(),
    loadCampaignMemberList()
  ]);
}

function selectCampaign(campaignId, openMap = true) {
  if (!campaignMemberships[campaignId] || (viewMode === "dm" && campaignMemberships[campaignId].role !== "dm")) {
    return;
  }

  stopFirebaseSync();
  stopPresenceSync();
  activeCampaignId = campaignId;
  campaignPickerOpen = !openMap;
  campaignRootMap = null;
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
  stopFirebaseSync();
  stopPresenceSync();
  campaignPickerOpen = true;
  updateAuthCopy();
  renderCampaignList();
  updateAppVisibility();
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

  if (campaignPickerOpen) {
    authCopy.textContent =
      viewMode === "dm"
        ? "Choose a campaign to manage, create a new campaign, or add players."
        : "Choose one of your campaigns to open its shared map.";
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

  const roleLabel = isAdminProfile(currentUserProfile) ? "admin" : "player";
  sessionPanel.hidden = false;
  const campaignName = campaignMemberships[getCurrentCampaignId()]?.name;
  sessionSummary.textContent = `Signed in as ${getDisplayName()} (${roleLabel})${campaignName ? ` in ${campaignName}` : "."}`;

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

  if (displayNameForm) {
    displayNameForm.hidden = !allowed || campaignPickerOpen || viewMode !== "player";
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
  const assignedIcon = MARKER_ICON_BY_ID.get(getAssignedMarkerIconId(marker));
  meta.textContent = `${markerKind} - ${marker.dataset.locationId || ""}${assignedIcon ? ` - ${assignedIcon.label}` : ""}`;

  const actions = document.createElement("div");
  actions.className = "dm-marker-item__actions";

  if (!isPortraitMarker(marker)) {
    const iconButton = document.createElement("button");
    iconButton.type = "button";
    iconButton.className = "dm-marker-item__icon";
    iconButton.textContent = "Change Icon";
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
    removeButton.textContent = "Delete";
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

  if (!title) {
    setDmMarkerStatus(isNpcMarker ? "Add a title before creating the NPC." : "Add a title before placing the marker.", "error");
    return null;
  }

  if (!isNpcMarker && !position) {
    setDmMarkerStatus("Click the map to choose where this marker should appear.", "error");
    return null;
  }

  const imageUploadError = getImageUploadValidationError(imageUploadFile);
  if (imageUploadError) {
    setDmMarkerStatus(imageUploadError, "error");
    return null;
  }

  if (!imageUploadFile && imageFileName) {
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

    const mapImageUploadError = getImageUploadValidationError(mapImageUploadFile);
    if (mapImageUploadError) {
      setDmMarkerStatus(mapImageUploadError, "error");
      return null;
    }

    if (!mapImageUploadFile && !isSafeImageFileName(mapImageFileName)) {
      setDmMarkerStatus("Choose an existing map image or upload a new one.", "error");
      return null;
    }

    if (!mapImageUploadFile) {
      const mapImageExists = await imageExistsAtPath(mapSrc);
      if (!mapImageExists) {
        setDmMarkerStatus(`Could not find "${mapImageFileName}" in assets/images.`, "error");
        return null;
      }
    }
  }

  try {
    if (imageUploadFile) {
      setDmMarkerStatus("Uploading marker image to Cloudinary...", "info");
      const upload = await uploadImageToCloudinary(imageUploadFile);
      imageFileName = upload.fileName;
      imagePath = upload.path;
    }

    if (isMapMarker && mapImageUploadFile) {
      setDmMarkerStatus("Uploading map image to Cloudinary...", "info");
      const upload = await uploadImageToCloudinary(mapImageUploadFile);
      mapImageFileName = upload.fileName;
      mapSrc = upload.path;
    }
  } catch (error) {
    console.error("Unable to upload marker image.", error);
    setDmMarkerStatus(error?.message || "Image upload failed. Try again.", "error");
    return null;
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
    await saveCustomMarker(markerRef, markerRecord, `NPC "${markerRecord.title}" added to ${currentMap.title}.`);
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
    await saveCustomMarker(markerRef, markerRecord, `Marker "${markerRecord.title}" added to ${currentMap.title}.`);
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
    const updates = {
      [`${getCampaignPath("maps/barovia/customMarkers")}/${markerId}`]: null,
      [`${getCampaignPath("maps/barovia/markerIcons")}/${getMarkerIconStorageKey(marker)}`]: null
    };
    await firebaseDatabase.ref().update(updates);
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

  if (!firebaseDatabase || !currentUser || !isAdminProfile(currentUserProfile) || !name || name.length > 60) {
    setAuthMessage("Enter a campaign name with 1-60 characters.", "error");
    return;
  }

  try {
    const campaignId = createCampaignId(name);
    const createdAt = new Date().toISOString();
    await firebaseDatabase.ref(`campaigns/${campaignId}`).set({
      name,
      ownerUid: currentUser.uid,
      createdAt
    });
    await firebaseDatabase.ref(`${USER_CAMPAIGNS_PATH}/${currentUser.uid}/${campaignId}`).set({
      name,
      role: "dm",
      joinedAt: createdAt
    });
    campaignNameInput.value = "";
    await loadCampaignMemberships();
    renderCampaignList();
    setAuthMessage(`Campaign "${name}" created.`, "success");
  } catch (error) {
    console.error("Unable to create campaign.", error);
    setAuthMessage("Campaign could not be created. Check your Firebase rules.", "error");
  }
});

rootMapForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const title = String(rootMapTitleInput?.value || "").trim();
  const uploadFile = rootMapImageUploadInput?.files?.[0] || null;
  let fileName = normalizeImageFileName(rootMapImageFileInput?.value || "");
  let imageSrc = getImagePathFromFileName(fileName);

  if (!firebaseDatabase || !isCampaignDm() || !title) {
    setAuthMessage("Enter a map title and choose or upload an image.", "error");
    return;
  }

  const uploadError = getImageUploadValidationError(uploadFile);
  if (uploadError || (!uploadFile && !isSafeImageFileName(fileName))) {
    setAuthMessage(uploadError || "Choose an existing map image or upload a new one.", "error");
    return;
  }

  const submitButton = rootMapForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  if (rootMapStatus) {
    rootMapStatus.hidden = false;
    rootMapStatus.textContent = "Saving starting map...";
    rootMapStatus.dataset.state = "info";
  }

  try {
    if (uploadFile) {
      rootMapStatus.textContent = "Uploading starting map to Cloudinary...";
      const upload = await uploadImageToCloudinary(uploadFile);
      fileName = upload.fileName;
      imageSrc = upload.path;
    }

    rootMapStatus.textContent = "Saving starting map...";
    await firebaseDatabase.ref(getCampaignPath("rootMap")).set({
      id: "root",
      title,
      src: imageSrc,
      alt: `Map of ${title}`,
      imageFileName: fileName
    });

    rootMapForm.reset();
    rootMapStatus.textContent = "Starting map saved.";
    rootMapStatus.dataset.state = "success";
  } catch (error) {
    console.error("Unable to save campaign starting map.", error);
    rootMapStatus.textContent = error?.message || "Starting map could not be saved.";
    rootMapStatus.dataset.state = "error";
  } finally {
    submitButton.disabled = false;
  }
});

campaignInviteForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const invitedUid = campaignInvitePlayerSelect?.value || "";
  const selectedOption = campaignInvitePlayerSelect?.selectedOptions?.[0];
  const username = selectedOption?.dataset.username || "Selected player";
  const membership = campaignMemberships[getCurrentCampaignId()];

  if (!firebaseDatabase || !currentUser || !isCampaignDm() || !invitedUid || !membership) {
    setAuthMessage("Select a player and a campaign you manage.", "error");
    return;
  }

  try {
    await firebaseDatabase.ref(`${USER_CAMPAIGNS_PATH}/${invitedUid}/${getCurrentCampaignId()}`).set({
      name: membership.name || getCurrentCampaignId(),
      role: "player",
      joinedAt: new Date().toISOString()
    });
    await refreshCampaignPlayerManagement();
    setAuthMessage(`${username} can now see ${membership.name || "this campaign"}.`, "success");
  } catch (error) {
    console.error("Unable to invite player.", error);
    setAuthMessage("Player could not be added. Check the username and Firebase rules.", "error");
  }
});

campaignMemberList?.addEventListener("click", async (event) => {
  const removeButton = event.target.closest("[data-remove-campaign-member]");
  if (!removeButton || !firebaseDatabase || !isCampaignDm()) {
    return;
  }

  const uid = removeButton.dataset.removeCampaignMember;
  const username = removeButton.dataset.memberUsername || "this player";
  const shouldRemove = window.confirm(`Remove ${username} from this campaign?`);
  if (!shouldRemove) {
    return;
  }

  removeButton.disabled = true;
  try {
    await firebaseDatabase.ref(`${USER_CAMPAIGNS_PATH}/${uid}/${getCurrentCampaignId()}`).remove();
    await firebaseDatabase.ref(`${getCampaignPath("playerDirectory")}/${uid}`).remove();
    await refreshCampaignPlayerManagement();
    setAuthMessage(`${username} was removed from this campaign.`, "success");
  } catch (error) {
    console.error("Unable to remove campaign member.", error);
    removeButton.disabled = false;
    setAuthMessage("Player could not be removed. Check your Firebase rules.", "error");
  }
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
  activeCampaignId = "";
  campaignMemberships = {};
  campaignPickerOpen = true;
  stopFirebaseSync();
  stopPresenceSync();
  stopCampaignMembershipSync();

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
  try {
    await loadCampaignMemberships();
    startCampaignMembershipSync();
    updateSessionPanel();
    renderCampaignList();
  } catch (error) {
    console.error("Unable to load campaigns.", error);
    setAuthMessage("Campaigns could not be loaded. Publish the updated Firebase rules and try again.", "error");
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
