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

本版规则允许登录用户单独读取其他用户的 `displayName`，供成员选择和管理显示；其他账号资料仍只允许本人读取与修改。若未发布新规则，DM 成员列表中的名称读取会回退到登录用户名。

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
node --test tests/*.test.cjs
```

本地测试使用隔离的页面及数据库替身，不连接生产 Firebase。正式发布规则前，应在 Firebase 模拟器或独立测试项目中验证双账号创建战役、邀请、地图同步及移除流程。
