// Offline visual fixture: no Firebase, Cloudinary requests, credentials or real user data.
// Run: node tests/ui-preview.cjs, then open http://127.0.0.1:8011/dm.html
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const read = file => fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
const main = read('assets/scripts/main.js');
const seed = `
currentUser = { uid: "preview" };
currentUserProfile = { username: "dungeonmaster", displayName: "Dungeon Master" };
campaignMemberships = { demo: { name: "The Lost Isles", role: "dm", schemaVersion: 2 } };
activeCampaignId = "demo";
managedCampaignId = "demo";
managedPlayers = Array.from({ length: 28 }, (_, i) => ({
  uid: "player-" + i, username: "adventurer_" + (i + 1),
  displayName: ["Aurelia Moonwhisper", "Bramble", "月光旅人", "Rowan the Cartographer", "Seraphina", "Thorne"][i % 6],
  role: i < 15 ? "player" : ""
}));
document.getElementById("auth-form").hidden = true;
applyViewMode(); updateSessionPanel(); updateAuthCopy(); renderCampaignList(); renderPlayerManagement();
if (params.get("lang") === "zh") window.I18n.setLanguage("zh", false);
if (["profile", "crop"].includes(params.get("panel"))) userCenterOpen.click();
else {
  // Keep the area under test in view without racing a headless scroll repaint.
  for (const selector of [".hero", ".auth-shell__header", "#session-panel",
    ".campaign-panel__header", "#campaign-list", "#campaign-create-form"]) {
    document.querySelector(selector).hidden = true;
  }
}
if (params.get("panel") === "crop") {
  const sample = document.createElement("canvas");
  sample.width = 900; sample.height = 600;
  const paint = sample.getContext("2d");
  for (const [i, color] of ["#365e5c", "#b77f4e", "#314459"].entries()) {
    paint.fillStyle = color;
    paint.fillRect(i * 300, 0, 300, 600);
  }
  paint.fillStyle = "#f6ead3";
  paint.font = "bold 120px Georgia";
  paint.textAlign = "center";
  paint.fillText("DM", 450, 335);
  sample.toBlob(blob => {
    const files = new DataTransfer();
    files.items.add(new File([blob], "sample.png", { type: "image/png" }));
    profileAvatarInput.files = files.files;
    profileAvatarInput.dispatchEvent(new Event("change"));
    if (params.has("verify")) {
      const timer = setInterval(async () => {
        const confirm = document.getElementById("avatar-crop-confirm");
        if (confirm.disabled || !document.getElementById("avatar-crop-dialog").open) return;
        clearInterval(timer);
        const zoom = document.getElementById("avatar-crop-zoom");
        zoom.value = "2";
        zoom.dispatchEvent(new Event("input"));
        confirm.click();
        const saved = setInterval(async () => {
          if (!avatarDraft?.file) return;
          clearInterval(saved);
          const png = new DataView(await avatarDraft.file.arrayBuffer());
          const result = document.createElement("output");
          result.id = "crop-result"; result.hidden = true;
          result.textContent = JSON.stringify({ width: png.getUint32(16), height: png.getUint32(20),
            type: avatarDraft.file.type, size: avatarDraft.file.size, dialogClosed: !document.getElementById("avatar-crop-dialog").open });
          document.body.append(result);
        }, 30);
      }, 30);
    }
  }, "image/png");
}
setTimeout(() => {
  const result = document.createElement("output");
  result.id = "preview-result";
  result.hidden = true;
  result.textContent = JSON.stringify({
    viewport: innerWidth,
    overflow: document.documentElement.scrollWidth > innerWidth,
    memberRows: document.querySelectorAll("#campaign-member-list .campaign-member").length,
    inviteRows: document.querySelectorAll("#campaign-invite-list .campaign-member").length,
    profileOpen: userCenter.open
  });
  document.body.append(result);
}, 100);
`;
http.createServer((request, response) => {
  const url = new URL(request.url, 'http://127.0.0.1');
  if (url.pathname === '/dm.html') {
    const html = read('dm.html').replace(/<script[\s\S]*?<\/script>/g, '')
      .replace('</head>', '<script src="/assets/scripts/i18n.js" defer></script><script src="/assets/scripts/avatar-crop.js" defer></script><script src="/preview-main.js" defer></script></head>');
    response.setHeader('Content-Type', 'text/html; charset=utf-8');
    response.end(html);
  } else if (url.pathname === '/preview-main.js') {
    response.setHeader('Content-Type', 'text/javascript; charset=utf-8');
    response.end(main.slice(0, main.lastIndexOf('window.addEventListener("resize"')) + seed);
  } else if (['/assets/styles/main.css', '/assets/scripts/i18n.js', '/assets/scripts/avatar-crop.js'].includes(url.pathname)) {
    response.setHeader('Content-Type', url.pathname.endsWith('.css') ? 'text/css' : 'text/javascript; charset=utf-8');
    response.end(read(url.pathname.slice(1)));
  } else {
    response.statusCode = 404;
    response.end();
  }
}).listen(8011, '127.0.0.1', () => console.log('Offline preview: http://127.0.0.1:8011/dm.html'));
