// Original fictional content for the portfolio demo; independent of production data.
(() => {
  const campaignId = "demo-lantern-coast";
  const createdAt = "2026-01-01T00:00:00.000Z";
  const images = ["lantern-coast.svg", "briarport.svg", "captain-mira.svg"];
  function create() {
    const users = {};
    const usernameDirectory = {};
    const userCampaigns = {};
    const playerDirectory = {};
    const people = [
      ["demo-dm", "demodm", "The Cartographer"],
      ["demo-player", "demoplayer", "Avery Starling"],
      ["bramble", "bramble", "Bramble Mossfoot"], ["rowan", "rowan", "Rowan Ash"],
      ["lyra", "lyra", "Lyra Dawnwhisper"], ["orion", "orion", "Orion Vale"],
      ["nia", "nia", "Nia Ember"], ["finch", "finch", "Finch Farrow"],
      ["sable", "sable", "Sable Moon"], ["cedar", "cedar", "Cedar Stone"],
      ["elara", "elara", "Elara Frost"], ["tamsin", "tamsin", "Tamsin Reed"],
      ["kael", "kael", "Kael Brightwater"], ["iris", "iris", "Iris Thorne"],
      ["wren", "wren", "Wren Silverleaf"], ["pip", "pip", "Pip Underbough"]
    ];
    people.forEach(([uid, username, displayName], i) => {
      users[uid] = { username, displayName, role: "player", showInPlayerList: true, createdAt };
      usernameDirectory[username] = uid;
      if (i < 9) {
        userCampaigns[uid] = { [campaignId]: { name: "The Lantern Coast", role: i === 0 ? "dm" : "player", schemaVersion: 2, joinedAt: createdAt } };
        if (i) playerDirectory[uid] = { username, displayName, role: "player", showInPlayerList: true, lastUpdated: 1 };
      }
    });
    const markers = {};
    const visibility = {};
    const icons = {};
    const add = (id, mapId, title, type, x, y, description, extra = {}) => {
      const marker = { id, mapId, title, type, x, y, description, visible: true,
        imagePath: "", mapSrc: "", createdAt, createdBy: "demo-dm", ...extra };
      markers[id] = marker;
      visibility[mapId + ":" + id] = marker.visible;
      if (type !== "npc") icons[encodeURIComponent(mapId + ":" + id)] = type;
    };
    add("lighthouse", "coast", "The Last Lantern", "temple", 24, 33,
      "Every dusk, a single blue flame guides ships through the reefs. Last night, it went dark.\n\nKeeper Elian left a journal on the steps: 'The light is not broken. Something below the island is calling it home.'\n\nAdventure hook: follow the tide-worn stairs beneath the lighthouse.");
    add("briarport", "coast", "Briarport", "town", 47, 63,
      "A harbor of salt-stained rooftops, floating markets, and stories told over spiced tea. Captain Mira is waiting at the docks.\n\nOpen this location's map to explore the harbor district.",
      { isMapMarker: true, mapSrc: "assets/demo/briarport.svg", targetMapId: "briarport", targetMapTitle: "Briarport Harbor", mapAlt: "An illustrated plan of Briarport Harbor" });
    add("observatory", "coast", "The Glass Observatory", "castle", 64, 29,
      "The astronomers vanished a century ago, but the great brass telescope still turns toward a star nobody else can see.\n\nThree stone doors surround the courtyard. Each bears a different phase of the moon.");
    add("whisperwood", "coast", "Whisperwood", "hill", 57, 45,
      "Silver leaves rustle even when the air is still. Travelers who leave an offering at the old bridge are shown the shortest path. Those who do not find themselves walking in circles.");
    add("hidden-cove", "coast", "The Smuggler's Cove", "tent", 74, 58,
      "A hidden inlet behind the black cliffs. Lantern signals reveal a narrow channel at low tide.\n\nDemo tip: this marker starts hidden. Reveal it in the DM controls, then switch to Player to see the change.", { visible: false });
    add("ferry", "coast", "The Tidebound Ferry", "gate", 32, 72,
      "A ferryman with a copper bell offers passage between the islands. His price is a story he has never heard before.");
    add("mira", "coast", "Captain Mira", "npc", 0, 0,
      "Captain of the Wayfarer, collector of impossible maps, and your guide to the Lantern Coast.\n\n'I can get you to the island. Getting you back is where the adventure begins.'",
      { imagePath: "assets/demo/captain-mira.svg" });
    add("inn", "briarport", "The Wandering Kettle", "manor", 33, 38,
      "A warm inn with a green tiled roof. Its owner keeps a room ready for anyone who has lost their way.\n\nRumor: someone has been buying every compass in town.");
    add("market", "briarport", "Saltmarket Square", "village", 62, 37,
      "Maps, moon-pears, old coins, and newly invented legends change hands here. Ask the bookseller about a chart with no north.");
    add("dock", "briarport", "The Wayfarer's Berth", "gate", 48, 74,
      "Captain Mira's ship rocks beside the eastern pier. Its sails are patched with maps of places that may not exist.\n\nYour next destination: the Last Lantern.");
    return { users, usernameDirectory, userCampaigns, campaigns: {
      [campaignId]: { name: "The Lantern Coast", ownerUid: "demo-dm", schemaVersion: 2, createdAt,
        rootMap: { id: "coast", title: "The Lantern Coast", src: "assets/demo/lantern-coast.svg", alt: "An original illustrated island map of the Lantern Coast" },
        maps: { shared: { customMarkers: markers, markerVisibility: visibility, markerIcons: icons } }, playerDirectory }
    } };
  }
  window.DemoSeed = { create, campaignId, images };
})();
