# DND Map — Portfolio Demo

This is the **`demo` branch**: a self-contained, browser-local showcase of [the full application](https://github.com/Mikawu73/DND-CoS-Map/tree/main). It does not load Firebase, sign in to real accounts, or upload to Cloudinary. The production configuration is intentionally absent.

## Try the demo locally

```powershell
python -m http.server 8000 --bind 127.0.0.1
```

Open <http://127.0.0.1:8000/> and choose **Player Demo** or **DM Demo**. No account or password is required. Any static host can serve this branch; no backend or build step is needed.

- Explore **The Lantern Coast**, a fictional island with an original SVG map, a linked harbor map, and Captain Mira's portrait.
- In DM mode, reveal **The Smuggler's Cove**, add markers, and return to **Campaigns → Manage Players** to search, invite, and remove fictional players.
- Switch to Player to see the revealed locations. Player mode has no campaign editing or player-management controls.
- Try User Center, display names, avatar cropping, and the English/Chinese UI switch. Story content stays in English.
- **Reset Demo** restores the sample world. It removes only the demo data, not production campaigns or the language preference.

### Isolation and limitations

The two roles are simulated identities (`demodm` and `demoplayer`), not shared production accounts. All visitors get their own browser-local copy. Changes persist under `dnd-map-demo-v1` in localStorage; the active demo session uses sessionStorage. Same-origin tabs share local data, but simultaneous edits are last-write-wins: this is not a multiplayer backend. Different devices do not synchronize.

Images are kept locally as data URLs (up to 2 MB per image, approximately 4 million characters for the entire saved dataset). If storage is blocked, edits last only for the current page; if storage fills, use smaller images or reset. Do not enter personal or sensitive information. Hidden markers and simulated role checks demonstrate the UI, **not an authentication or secrecy boundary**.

`demo-seed.js` supplies the fictional data and `demo-backend.js` adapts the app's data operations to local storage. A Content Security Policy restricts connections to the site's own origin. The full application's Firebase rules and Python server remain in the repository for reference; neither is needed to run this demo.

### Verification

```powershell
node --test tests/*.test.cjs
```

For end-to-end checks in a disposable headless Chrome profile, run `node tests/demo-browser.cjs` (set `CHROME_PATH` if Chrome is not at its standard Windows location). This verifies role switching, local persistence, maps, player management, reset, localization, asset loading, and narrow-screen overflow. Screenshots are saved to a temporary folder printed by the runner. The test script is injected only by this test server, not by the demo pages.

The demo is not automatically published by creating this branch. Deploy its static files to a separate site or branch-based hosting project so the existing live app stays unchanged.

## 中文说明

这是独立的 **demo 分支**，提供免注册的 Player / DM 体验、虚构战役、地图编辑、玩家管理、头像裁剪和中英文切换。数据只保存在当前浏览器，不连接正式 Firebase，也不上传到 Cloudinary。用上面的命令启动后打开首页即可体验；点击 **Reset Demo** 可以恢复初始数据。此分支尚不代表已发布的网站。

---

# Full Application Reference / 正式版说明

The documentation below describes the **main branch**, including its real account and cloud services. Those setup instructions do not apply to this demo branch.

以下保留正式版的英文与中文说明；其中的真实账号、Firebase 和 Cloudinary 配置不适用于当前 demo 分支。

# DND Map

English · [简体中文](#dnd-地图网站)

An interactive campaign-mapping web app for Dungeons & Dragons. Dungeon Masters can build worlds, reveal locations and NPCs, and manage their parties. Players explore the maps and content their DM has revealed.

One account can host its own campaigns and join other campaigns as a player. Permissions are assigned per campaign rather than through a site-wide DM role.

## Features

- **Campaign workspaces:** create campaigns, upload starting maps, and switch between DM and player views.
- **Interactive maps:** add location and NPC markers, attach images and descriptions, link to submaps, and control marker visibility.
- **Player management:** separate current-party and available-player lists with avatars, display names, usernames, search, counts, and pagination.
- **User profiles:** edit display names, choose player-list visibility, and upload or remove an avatar.
- **Local avatar cropping:** drag, zoom, or use the arrow keys to frame a photo, preview its circular appearance, and export a 512×512 PNG before uploading.
- **English and Chinese UI:** English by default, instant language switching, and a remembered browser preference.
- **Realtime data:** Firebase Authentication and Realtime Database provide account access, campaign membership updates, and map synchronization.

## Run locally

From the repository root, with Python 3 installed:

```powershell
python sync_server.py --host 127.0.0.1
```

- Player view and campaign list: <http://127.0.0.1:8000/index.html>
- DM workspace: <http://127.0.0.1:8000/dm.html>

The frontend uses plain HTML, CSS, and JavaScript; no frontend build step is required. Authentication and synchronization require an internet connection to Firebase. Image uploads use Cloudinary.

The Python server serves static files and the `/api/images` asset catalog. Its legacy WebSocket implementation is not used by the current frontend, which synchronizes through Firebase. **Running locally still connects to the Firebase project configured in the repository; it is not an isolated development database.** Use a separate Firebase project for experiments that should not affect existing data.

## Using the app

1. Create an account or sign in. Usernames contain 3–24 lowercase letters, numbers, dots, underscores, or hyphens. Passwords require at least 6 characters.
2. Open **DM Workspace**, enter a campaign name, and select **Create Campaign**. Any registered user can create a campaign; no site administrator role is needed.
3. Upload a starting map or choose an existing image. New campaigns start without preloaded maps, locations, or NPCs.
4. Add markers, descriptions, images, and linked submaps. Choose which markers players can see.
5. Return to the campaign list and choose **Manage Players**. Search registered users by display name or username, add them to your party, or remove existing players with confirmation.
6. Invited players can open the campaign from their player view. Membership changes synchronize in realtime; players lose access when removed.

Map editing, player management, campaign creation, and campaign deletion are exposed only in the DM workspace. Switching views preserves the selected campaign, and returning to the campaign list clears the map route so a refresh does not reopen the previous map.

### Profiles and avatars

Open **User Center** from the top-right account button, without needing to select a campaign first. Display names contain 1–24 characters and are shown in account information and player lists. The original username remains the sign-in identifier and cannot be changed here. Profile saves also update the user's player-directory entries across joined campaigns.

Avatar source images must be nonempty JPG, PNG, or WebP files of up to 2 MB. After selecting a photo:

1. Drag it or use the arrow keys to adjust its position inside the square crop area.
2. Zoom from 1× to 4× and check the circular preview. Reset or cancel without replacing the previous avatar draft.
3. Choose **Use This Crop** to generate a 512×512 PNG locally.
4. Select **Save Changes** in User Center to upload the cropped image and save the profile.

Cropping does not upload the source photo. Images over 32 megapixels are rejected. Closing User Center discards unsaved avatar selections. Names or initials are used when an avatar is missing or fails to load. Removing an avatar clears its database references but does not delete the old Cloudinary file.

### Managing larger parties

**Your Party** and **Find Players** have independent search fields and six-player pages. Both lists show a display name and sign-in username to distinguish players with similar names. A refresh button reloads the directory and current membership state.

The implementation reads the username directory once per refresh and uses bounded concurrent lookups for membership and profile data. Search and pagination happen in the browser; this is not server-side search for a large public user base.

## Architecture and configuration

The app uses native browser APIs for rendering, dialogs, pointer interactions, and canvas-based cropping. Firebase handles authentication and structured data; Cloudinary stores uploaded images.

| File | Responsibility |
| --- | --- |
| `index.html` / `dm.html` | Player view and DM workspace |
| `assets/scripts/main.js` | Campaigns, maps, profiles, and player management |
| `assets/scripts/avatar-crop.js` | Local avatar cropping and PNG export |
| `assets/scripts/i18n.js` | UI translations and language preference |
| `assets/scripts/firebase-config.js` | Firebase and Cloudinary client configuration |
| `firebase-database.rules.json` | Realtime Database access and validation rules |
| `sync_server.py` | Local static server and image catalog |
| `tests/` | Regression tests and offline UI preview |

### Firebase setup and upgrades

1. Enable **Email/Password** in Firebase Authentication.
2. Review the Firebase project settings in `assets/scripts/firebase-config.js`.
3. **Before deploying the frontend, publish [firebase-database.rules.json](firebase-database.rules.json) in Firebase Realtime Database → Rules.** Older rules may reject campaign creation, atomic profile saves, and the new avatar fields.
4. Deploy the HTML, CSS, and JavaScript files. A Git push does not automatically publish database rules or migrate cloud data.

Authenticated users may read other users' `displayName` and `avatarUrl` fields for player listings; the rest of each profile remains private to its owner. Avatar validation only accepts HTTPS image URLs from the configured project's Cloudinary cloud. Existing accounts do not need a data migration for avatars.

Keep `usernameDomain: "barovia.local"` when using existing accounts. It is part of their internal authentication identifier, not the site's branding; changing it would break their current username-based sign-in flow.

New campaigns use `schemaVersion: 2`. The campaign record and its creator's DM membership are saved in one atomic update:

```text
campaigns/<campaignId>/
  name, ownerUid, createdAt, schemaVersion
  rootMap                         Starting map
  maps/shared/markerVisibility    Marker reveal state
  maps/shared/customMarkers       Markers grouped by mapId
  maps/shared/markerIcons         Marker icon assignments
  playerDirectory                 Player display information
userCampaigns/<uid>/<campaignId>/
  name, role (dm or player), joinedAt, schemaVersion
users/<uid>/                      Account profile, including optional avatarUrl
usernameDirectory/<username>      Username-to-UID lookup
```

Older campaigns without `schemaVersion: 2` continue using `maps/barovia`. The reserved `curse-of-strahd` campaign retains its legacy map and static content; new users are not automatically enrolled, and ordinary campaign creation cannot reuse that ID. Existing accounts and memberships are preserved.

### Image hosting

Starting maps, marker illustrations, and submap uploads support images up to 10 MB each. The Cloudinary `cloudName` and unsigned `uploadPreset` are configured in `assets/scripts/firebase-config.js`. Never put an API secret in frontend code. If you change the cloud, also update the allowed image URLs in the database rules.

Map records and image references are stored per campaign, but Cloudinary hosting and the local `assets/images` library are shared. Deleting a campaign removes its database records and memberships, not its uploaded Cloudinary files.

## Localization

The UI defaults to English. The **中文 / English** button beside User Center also works while signed out. The selected language is stored in the browser and synchronized between same-origin tabs.

Switching languages does not reload the page or clear the current map, selected uploads, or unsaved form values. Only interface copy is translated: campaign names, player names, descriptions, and asset filenames remain as entered.

Translations live in `assets/scripts/i18n.js`. Static elements use `data-i18n` attributes, while dynamic text uses `I18n.setText` and `I18n.setAttribute` bindings. Explicit bindings avoid translating user-generated content accidentally.

## Verification

With Node.js installed, run:

```powershell
node --check assets/scripts/main.js
node --check assets/scripts/i18n.js
node --check assets/scripts/avatar-crop.js
node --test tests/*.test.cjs
```

The tests cover campaign membership and permissions, routing, profile updates, avatar cropping, player search and pagination, localization, and stale asynchronous responses. They use isolated browser/database substitutes and do not connect to production Firebase. The database-rule tests evaluate policy expressions; they do **not** replace Firebase Emulator testing. Before publishing rules, verify account creation, invitations, profile uploads, map synchronization, and removal with two accounts in an emulator or separate test project.

For an offline visual preview:

```powershell
node tests/ui-preview.cjs
```

Open <http://127.0.0.1:8011/dm.html>. This fixture uses 28 fictional players and does not connect to Firebase or Cloudinary.

- `?lang=zh`: Chinese UI.
- `?panel=profile`: User Center.
- `?panel=crop`: Crop a locally generated sample image.
- `?panel=crop&verify=1`: Run a browser crop and report the PNG dimensions and format in the DOM element `crop-result`.

This fixture is for local verification, not a deployed public demo.

## Scope and known limitations

- **Hidden markers are a UI visibility feature, not a private-data boundary.** Campaign members can read their campaign's data, and bundled static content is accessible by URL. Do not store confidential DM notes in player-readable marker descriptions.
- Map hierarchy is organized through linked markers; standalone multi-map management, co-DM assignment, invite codes, fog of war, tokens, and import/export are not implemented.
- An isolated browser-local portfolio demo is maintained separately on the `demo` branch; it does not use the production backend.

---

# DND 地图网站

支持多个战役的互动地图网站。每位注册用户都可以创建战役，成为该战役的 DM；同一账号也可以作为玩家加入其他战役。

## 本地运行

```powershell
python sync_server.py --host 127.0.0.1
```

- 玩家与战役首页：<http://127.0.0.1:8000/index.html>
- DM 工作台：<http://127.0.0.1:8000/dm.html>

原生 HTML、CSS、JavaScript，无需构建。登录及同步需要联网访问 Firebase，图片上传使用 Cloudinary。Python 提供静态文件和 `/api/images` 图片目录；前端已使用 Firebase 同步，服务中的旧 WebSocket 接口不参与当前工作流。

## 使用流程

1. 注册或登录。用户名为 3–24 位小写字母、数字、点、下划线或连字符，密码至少 6 位。
2. 前往“DM 工作台”，输入战役名称，点击“创建战役，成为 DM”，无需网站级管理员权限。地图与玩家管理、创建及删除战役只在 DM 工作台提供，玩家页面仅用于浏览。
3. 上传起始地图或选择站内图片。新战役不带默认地点、NPC 或地图。
4. 添加地点、NPC、图片和子地图，控制玩家可见的标记。
5. 返回战役列表，点击“管理玩家”，选择已注册用户添加或移除。
6. 玩家登录后能看到被邀请的战役。成员资格实时同步，被移除的玩家会退出地图。

DM 和玩家视角可以切换并保留当前战役。用户只管理自己拥有 DM 成员资格的战役。网站级 `users/<uid>/role` 保留用于旧账号兼容，不再决定谁能创建战役。

登录后，页面右上角的“用户中心”可修改显示名称（1–24 字符）和玩家名册可见性，无需先选择战役。显示名称用于身份信息、玩家名册和 DM 的成员列表；注册用户名保留用于登录，不能在用户中心修改。改名同时更新所有已加入战役的玩家名册。

用户中心支持头像预览、更换及移除（JPG / PNG / WebP，非空且最大 2 MB），点击 Save Changes 才上传到现有 Cloudinary 并保存。头像以圆形居中裁切显示，无头像或加载失败时显示姓名缩写；头像用于右上角账户入口、DM 玩家管理和玩家名册。关闭弹窗会丢弃未保存的头像选择。移除只清除数据库引用，不删除图床上的旧文件。

选择照片后先打开本地裁剪窗口：拖动或用方向键调整位置，滑块缩放 1–4 倍，圆形预览显示最终可见范围。确认后生成 512×512 PNG，再点击用户中心的 Save Changes 上传；取消裁剪保留之前的头像草稿。裁剪期间没有网络上传，超过 3200 万像素的源图片会被拒绝。

DM 的 Manage Players 分为当前成员和添加玩家两栏，显示头像、昵称和登录用户名，支持独立搜索、每页 6 人、人数统计及刷新。移除成员仍需确认。当前按一次用户名目录读取、限流并发资料查询、客户端搜索分页实现，不重复读取两份目录；这还不是面向海量账号的服务端搜索方案。

本版规则允许登录用户单独读取其他用户的 `displayName` 和 `avatarUrl`，供成员选择和管理显示；其他账号资料仍只允许本人读取与修改。头像字段只接受本项目 Cloudinary 的 HTTPS 图片地址。**启用头像前须发布更新后的 Firebase 规则**，否则头像保存会被拒绝；旧账号无需迁移。

## 界面语言

首次访问默认英文。点击右上角用户中心旁的 `中文 / English` 按钮可即时切换，未登录时也可使用；语言偏好保存在当前浏览器，并在同源标签页间同步。

切换不会刷新页面或清空未保存的表单、上传文件及当前地图。翻译范围是界面标签、提示、错误与确认文案；战役名称、玩家昵称、地点介绍和素材文件名保留用户输入的原文。

翻译词条集中在 `assets/scripts/i18n.js`。静态界面用 `data-i18n` 标记，动态文本通过 `I18n.setText` 和 `I18n.setAttribute` 绑定，避免误翻译用户内容。

## Firebase 配置与升级

1. 在 Authentication 中启用 Email/Password。
2. 检查 `assets/scripts/firebase-config.js` 中的 Firebase 项目配置。
3. **部署新版前，先在 Firebase Realtime Database 的 Rules 页面发布 [firebase-database.rules.json](firebase-database.rules.json)。** 旧规则会拒绝普通用户创建战役及新版原子保存操作。
4. 再发布页面与脚本。本次代码修改不会自动发布云端规则或修改线上数据。

保留 `usernameDomain: "barovia.local"`：它是旧账号的内部登录标识，直接改名会使现有账号无法登录，与网站标题无关。

新战役使用 `schemaVersion: 2`，战役及创建者的 DM 成员资格在一次原子更新中保存，避免只创建一半。

```text
campaigns/<campaignId>/
  name, ownerUid, createdAt, schemaVersion
  rootMap                         起始地图
  maps/shared/markerVisibility    公开状态
  maps/shared/customMarkers       各地图标记（按 mapId 区分）
  maps/shared/markerIcons         图标
  playerDirectory                 玩家展示名录
userCampaigns/<uid>/<campaignId>/
  name, role (dm 或 player), joinedAt, schemaVersion
users/<uid>/                      账号资料
usernameDirectory/<username>      用户名对应 UID
```

没有 `schemaVersion: 2` 的已有战役继续读写 `maps/barovia`，无需迁移。`curse-of-strahd` 仅作为旧战役兼容入口，保留原地图及静态条目；不再为新用户自动加入，也不能通过普通用户新建此保留 ID。原有账号与成员关系保持不变。

地图层级仍通过“标记进入子地图”组织；独立多地图管理、联合 DM、邀请码、迷雾、棋子及导入导出尚未实现。

## 图片与内容

DM 可上传起始地图、标记配图、子地图，单张最大 10 MB。Cloudinary 的 cloudName 与 unsigned uploadPreset 见 `assets/scripts/firebase-config.js`；不要在前端加入 API secret。更换 cloud 时需同步修改数据库规则中的允许 URL。

标记和图片引用按战役保存；Cloudinary 仍共用图床，本地 `assets/images` 为共享素材库。删除战役会移除其数据库数据和成员关系，不会删除 Cloudinary 图片。

标记隐藏是玩家界面的显示控制，不是服务器端的私密内容隔离：成员能读取所属战役数据，内置静态资料也可通过 URL 访问。不要把 DM 私密笔记放在玩家可读的标记描述中。

## 验证

```powershell
node --check assets/scripts/main.js
node --check assets/scripts/i18n.js
node --check assets/scripts/avatar-crop.js
node --test tests/*.test.cjs
```

本地测试使用隔离的页面及数据库替身，不连接生产 Firebase。正式发布规则前，应在 Firebase 模拟器或独立测试项目中验证双账号创建战役、邀请、地图同步及移除流程。

离线界面预览：运行 `node tests/ui-preview.cjs`，访问 <http://127.0.0.1:8011/dm.html>，使用虚构的 28 名玩家且不连接 Firebase / Cloudinary。可加 `?lang=zh` 查看中文，或 `?panel=profile` 查看头像编辑弹窗。

加 `?panel=crop` 可用本地生成的测试图片预览裁剪；`?panel=crop&verify=1` 会执行真实浏览器裁剪并在 DOM 的 `crop-result` 元素中报告输出尺寸和格式。
