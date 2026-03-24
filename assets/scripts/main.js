const markerButtons = document.querySelectorAll(".map-marker");
const locationPanel = document.getElementById("location-panel");
const locationTitle = document.getElementById("location-title");
const locationPanelBody = document.getElementById("location-panel-body");
const markerToggle = document.getElementById("marker-toggle");
const mapStage = document.querySelector(".map-stage");
const contentCache = new Map();

markerToggle.addEventListener("click", () => {
  const markersVisible = markerToggle.getAttribute("aria-pressed") === "true";
  const nextVisible = !markersVisible;

  markerToggle.setAttribute("aria-pressed", String(nextVisible));
  markerToggle.textContent = nextVisible ? "Hide Markers" : "Show Markers";
  mapStage.classList.toggle("map-stage--markers-hidden", !nextVisible);
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
  marker.addEventListener("click", async () => {
    if (mapStage.classList.contains("map-stage--markers-hidden")) {
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
