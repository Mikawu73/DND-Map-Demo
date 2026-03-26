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
const contentCache = new Map();

const VISIBILITY_STORAGE_KEY = "barovia-marker-visibility";
const ROOT_MAP = {
  id: "barovia",
  src: "assets/images/Map%20-%20Barovia.jpg",
  alt: "Illustrated map of Barovia",
  title: "Map of Barovia"
};
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
  "barovia:fortunetellers-tent": true
};
const markerVisibility = loadMarkerVisibility();
const mapHistory = [{ ...ROOT_MAP }];
let currentMap = { ...ROOT_MAP };

function loadMarkerVisibility() {
  try {
    const stored = window.localStorage.getItem(VISIBILITY_STORAGE_KEY);
    const parsed = stored ? JSON.parse(stored) : {};
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

function setMarkerRevealed(marker, revealed) {
  markerVisibility[getMarkerVisibilityKey(marker)] = revealed;
  saveMarkerVisibility();
  applyAllMarkerStates();
  if (viewMode === "dm") {
    renderDmControls();
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
  if (viewMode !== "dm" || !dmControls || !dmLocationList || !dmPortraitList) {
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
  if (contentCache.has(src)) {
    return contentCache.get(src);
  }

  const response = await fetch(src);
  if (!response.ok) {
    throw new Error(`Failed to load ${src}`);
  }

  const html = await response.text();
  contentCache.set(src, html);
  return html;
}

function showImagePanel(marker) {
  if (!locationPanel || !locationTitle || !locationPanelBody) {
    return;
  }

  if (locationEyebrow) {
    locationEyebrow.textContent = "Selected Portrait";
  }

  locationTitle.textContent = marker.dataset.locationName || "Portrait";
  locationPanelBody.innerHTML = `
    <div class="location-panel__split location-panel__split--portrait">
      <img
        src="${marker.dataset.imageSrc}"
        alt="${marker.dataset.imageAlt || marker.dataset.locationName || "Portrait"}"
        class="location-panel__image location-panel__image--portrait"
      >
      <div class="location-panel__portrait-copy"></div>
    </div>
  `;
  locationPanel.hidden = false;
  locationPanel.scrollIntoView({ behavior: "smooth", block: "start" });
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

async function switchMap(nextMap, options = {}) {
  if (!mapImage || !nextMap?.src) {
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

    const imageSrc = marker.dataset.imageSrc;
    if (imageSrc) {
      showImagePanel(marker);
      return;
    }

    const locationSrc = marker.dataset.locationSrc;
    if (locationEyebrow) {
      locationEyebrow.textContent = "Selected Location";
    }
    locationTitle.textContent = marker.dataset.locationName || "Location";
    locationPanelBody.innerHTML = '<p class="location-panel__status">Loading...</p>';
    locationPanel.hidden = false;
    locationPanel.scrollIntoView({ behavior: "smooth", block: "start" });

    try {
      const html = await loadLocationContent(locationSrc);
      locationPanelBody.innerHTML = html;
    } catch (error) {
      locationPanelBody.innerHTML = '<p class="location-panel__status">Failed to load location content.</p>';
      console.error(error);
    }
  });
}

window.addEventListener("resize", syncPortraitRailHeight);

applyViewMode();
updateMapHeader();
applyAllMarkerStates();
renderDmControls();
syncPortraitRailHeight();
