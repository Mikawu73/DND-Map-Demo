const markerButtons = Array.from(document.querySelectorAll(".map-marker"));
const locationPanel = document.getElementById("location-panel");
const locationTitle = document.getElementById("location-title");
const locationPanelBody = document.getElementById("location-panel-body");
const markerToggle = document.getElementById("marker-toggle");
const mapStage = document.getElementById("map-stage");
const dmControls = document.getElementById("dm-controls");
const dmMarkerList = document.getElementById("dm-marker-list");
const viewIntro = document.getElementById("view-intro");
const contentCache = new Map();

const VISIBILITY_STORAGE_KEY = "barovia-marker-visibility";
const params = new URLSearchParams(window.location.search);
const bodyViewMode = document.body.dataset.view;
const viewMode =
  bodyViewMode === "dm" || bodyViewMode === "player"
    ? bodyViewMode
    : params.get("view") === "dm"
      ? "dm"
      : "player";
const markerVisibility = loadMarkerVisibility();

function loadMarkerVisibility() {
  try {
    const stored = window.localStorage.getItem(VISIBILITY_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.warn("Unable to read marker visibility from localStorage.", error);
    return {};
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

function isMarkerRevealed(marker) {
  const markerId = marker.dataset.locationId;
  return markerVisibility[markerId] ?? false;
}

function setMarkerRevealed(marker, revealed) {
  markerVisibility[marker.dataset.locationId] = revealed;
  saveMarkerVisibility();
  applyMarkerState(marker);
  syncDmControl(marker);
}

function applyMarkerState(marker) {
  const revealed = isMarkerRevealed(marker);
  const isPlayerView = viewMode === "player";
  const shouldHide = isPlayerView && !revealed;

  marker.classList.toggle("map-marker--revealed", revealed);
  marker.classList.toggle("map-marker--dm-hidden", viewMode === "dm" && !revealed);
  marker.hidden = shouldHide;
  marker.disabled = shouldHide;
  marker.setAttribute("aria-hidden", String(shouldHide));
}

function syncDmControl(marker) {
  if (!dmMarkerList) {
    return;
  }

  const markerId = marker.dataset.locationId;
  const control = dmMarkerList.querySelector(`[data-marker-control="${markerId}"]`);

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
    default:
      return "Location";
  }
}

function renderDmControls() {
  if (viewMode !== "dm" || !dmControls || !dmMarkerList) {
    return;
  }

  dmControls.hidden = false;
  dmMarkerList.innerHTML = "";

  for (const marker of markerButtons) {
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
    toggle.dataset.markerControl = marker.dataset.locationId || "";
    toggle.addEventListener("click", () => {
      setMarkerRevealed(marker, !isMarkerRevealed(marker));
    });

    label.append(title, meta);
    item.append(label, toggle);
    dmMarkerList.append(item);

    syncDmControl(marker);
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

markerToggle?.addEventListener("click", () => {
  const markersVisible = markerToggle.getAttribute("aria-pressed") === "true";
  const nextVisible = !markersVisible;

  markerToggle.setAttribute("aria-pressed", String(nextVisible));
  markerToggle.textContent = nextVisible ? "Hide Markers" : "Show Markers";
  mapStage?.classList.toggle("map-stage--markers-hidden", !nextVisible);
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

for (const marker of markerButtons) {
  applyMarkerState(marker);

  marker.addEventListener("click", async () => {
    if (mapStage?.classList.contains("map-stage--markers-hidden")) {
      return;
    }

    if (viewMode === "player" && !isMarkerRevealed(marker)) {
      return;
    }

    const locationSrc = marker.dataset.locationSrc;
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

applyViewMode();
renderDmControls();
