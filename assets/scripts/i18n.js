// UI copy only: campaign names, player names, descriptions and asset paths are never translated.
(() => {
  "use strict";
  const messages = {
  "Cropping stays on your device. Save Changes to keep the avatar in this browser.": "裁剪在本机完成，保存修改后头像仅保存在当前浏览器。",
  "A selected image takes priority over the existing image above. Demo limit: 2 MB.": "所选图片优先于上方的已有图片，演示版上限为 2 MB。",
  "Optional. A selected image takes priority over the existing image above. Demo limit: 2 MB.": "可选。所选图片优先于上方的已有图片，演示版上限为 2 MB。",
  "A selected image takes priority. Demo limit: 2 MB.": "所选图片优先，演示版上限为 2 MB。",
  "Delete demo campaign \"{name}\"? Its maps, markers, and memberships will be removed from this browser. Reset Demo can restore the sample world.": "删除演示战役“{name}”？地图、标记和成员关系将从当前浏览器中移除。重置演示可以恢复初始世界。",
  "Portfolio Demo": "作品演示",
  "Demo information": "演示说明",
  "Reset Demo": "重置演示",
  "Demo views": "演示视角",
  "Changes stay in this browser. No account, cloud uploads, or production data.": "修改仅保存在此浏览器，不需要账号，不上传到云端，也不访问正式数据。",
  "Browser storage is unavailable. Changes last only until this page is closed or refreshed.": "浏览器存储不可用，修改仅保留到页面关闭或刷新。",
  "Player Demo": "玩家演示",
  "DM Demo": "DM 演示",
  "View Full Project": "查看完整项目",
  "Explore the story": "探索故事",
  "As a Player": "扮演玩家",
  "Discover locations, meet Captain Mira, and open Briarport's harbor map.": "探索地点、认识米拉船长，并进入荆棘港的港区地图。",
  "Try Player Demo": "体验玩家视角",
  "Shape the adventure": "创造冒险",
  "As a Dungeon Master": "担任主持人",
  "Reveal the hidden cove, place your own markers, and manage a fictional party.": "揭示隐藏海湾、放置自己的标记，并管理虚构的冒险队伍。",
  "Try DM Demo": "体验 DM 视角",
  "Preview of the Lantern Coast demo map": "灯塔海岸演示地图预览",
  "The Lantern Coast · an original world, ready to explore": "灯塔海岸 · 一个等待探索的原创世界",
  "No signup. No shared accounts. Your changes are yours to experiment with.": "无需注册，不共用账号，可以放心尝试修改。",
  "Choose a role to explore the demo. No registration or password needed.": "选择一个视角进入演示，无需注册或密码。",
  "Explore an original fantasy world, then step behind the screen and make it your own.": "探索原创奇幻世界，再切换到主持人视角，创造属于你的冒险。",
  "Demo images must be JPG, PNG, WebP, GIF or AVIF, up to 2 MB.": "演示图片须为 JPG、PNG、WebP、GIF 或 AVIF 格式，最大 2 MB。",
  "Reset all demo changes in this browser? Your real campaigns are not affected.": "重置此浏览器内的全部演示修改？不会影响你的真实战役。",
  "Choose Your Role": "选择体验视角",
  "Demo tip: open Briarport to explore its harbor map, or select Captain Mira to meet your guide.": "体验提示：打开荆棘港探索港区地图，或选择米拉船长认识你的向导。",
  "Demo tip: reveal the Smuggler's Cove below, then switch to Player. Open Campaigns to try Manage Players.": "体验提示：在下方公开走私者海湾，再切换到玩家视角。打开战役列表即可体验玩家管理。",
  "Demo uploads stay on this device (up to 2 MB each). Reset Demo restores the original world.": "演示上传仅保存在此设备（每张最大 2 MB），重置演示可恢复初始世界。",
  "Preparing local image...": "正在准备本地图片…",
  "Demo storage is full. Reset the demo or use smaller images.": "演示存储已满，请重置演示或使用更小的图片。",
  "Player demo cannot edit campaigns. Switch to the DM demo.": "玩家演示不能编辑战役，请切换到 DM 演示。",
  "Could not read this image.": "无法读取此图片。",
  "Cancel": "取消",
  "This photo could not be opened. Try another image.": "无法打开此图片，请选择其他图片。",
  "Crop Your Photo": "裁剪头像",
  "Drag the photo to position it, then zoom to frame your avatar. You can also use the arrow keys.": "拖动照片调整位置，通过缩放选择头像范围，也可以使用方向键微调。",
  "Avatar crop area. Drag or use arrow keys to move the photo.": "头像裁剪区域，拖动或使用方向键移动照片。",
  "Circular avatar preview": "圆形头像预览",
  "Preview": "预览",
  "Zoom": "缩放",
  "Reset Crop": "重置裁剪",
  "Use This Crop": "使用此裁剪",
  "Cropping stays on your device. Save Changes in your profile to upload.": "裁剪仅在本地进行，返回用户中心点击保存修改后才会上传。",
  "Loading photo…": "正在加载照片…",
  "This photo is too large to edit. Choose an image under 32 megapixels.": "照片尺寸过大，请选择不超过 3200 万像素的图片。",
  "Preparing cropped photo…": "正在生成裁剪头像…",
  "Could not crop this photo. Try again or choose another image.": "无法裁剪此照片，请重试或选择其他图片。",
  "Choose Photo": "选择头像",
  "Profile Photo": "用户头像",
  "Remove Photo": "移除头像",
  "JPG, PNG or WebP · up to 2 MB. Photos are shown in a circle. Save Changes to apply.": "支持 JPG、PNG 或 WebP，最大 2 MB。头像以圆形显示，点击保存修改后生效。",
  "Choose a JPG, PNG or WebP photo.": "请选择 JPG、PNG 或 WebP 格式的头像。",
  "Your profile photo must be smaller than 2 MB.": "头像文件须非空且不超过 2 MB。",
  "Photo ready. Save Changes to apply.": "头像已预览，点击保存修改后生效。",
  "Photo removed from preview. Save Changes to apply.": "已从预览中移除头像，点击保存修改后生效。",
  "Uploading profile photo…": "正在上传头像…",
  "Profile saved. Your party will see your updated details.": "资料已保存，队友将看到你的最新信息。",
  "Build your party. Search by display name or sign-in username.": "组建你的冒险队伍，按显示名称或登录用户名搜索玩家。",
  "Refresh Players": "刷新玩家",
  "Your Party": "当前成员",
  "Find Players": "添加玩家",
  "Search current players": "搜索当前成员",
  "Search your party...": "搜索队伍成员…",
  "Search registered players": "搜索已注册玩家",
  "Search by name or @username...": "搜索昵称或 @用户名…",
  "Current players pages": "当前成员分页",
  "Available players pages": "可添加玩家分页",
  "Previous": "上一页",
  "Next": "下一页",
  "Players · {count}": "玩家 · {count}",
  "{count} results · {page} / {pages}": "{count} 个结果 · {page} / {pages}",
  "Could not load players. Use Refresh Players to try again.": "无法加载玩家，点击刷新玩家重试。",
  "No matching players. Try another name.": "没有匹配的玩家，请尝试其他名称。",
  "Your party is empty. Add a player from Find Players.": "当前还没有成员，从添加玩家区域邀请队友吧。",
  "All registered players are already in this campaign.": "所有已注册玩家都已加入此战役。",
  "Add to Party": "添加成员",
  "Remove {name}": "移除{name}",
  "Add {name} to party": "将{name}添加到队伍",
  "This player's membership changed. The list has been refreshed.": "这位玩家的成员状态已变更，列表已刷新。",
  "DND Map": "DND 地图网站",
  "DND Map · Player": "DND 地图网站 · 玩家",
  "DND Map · DM": "DND 地图网站 · DM",
  "Your world · Your adventure": "你的世界 · 你们的冒险",
  "Player View": "玩家页面",
  "DM View": "DM 页面",
  "User Center": "用户中心",
  "Close user center": "关闭用户中心",
  "Let your party know what to call you.": "让队友知道该如何称呼你。",
  "Display Name": "显示名称",
  "1–24 characters. Your profile and player lists use this name; your sign-in username stays the same.": "1–24 个字符。页面身份信息和玩家列表将显示这个名称，登录用户名不变。",
  "Sign-in Username": "登录用户名",
  "Used to sign in and identify your account. It cannot be changed here.": "仅用于登录和识别账号，不能在这里修改。",
  "Show me in campaign player lists when I join as a player": "作为玩家时，在战役玩家列表中显示我",
  "Save Changes": "保存修改",
  "Choose your campaign, explore its maps, and discover the places and characters revealed by your DM.": "选择你的战役，探索地图，查看 DM 为你们公开的地点与人物。",
  "Build your world, manage maps and players, and reveal your adventure one location at a time.": "创建你的世界，管理地图、地点与玩家，逐步揭开冒险的故事。",
  "One account can host your own campaigns and join others as a player.": "一个账号可以主持自己的战役，也可以作为玩家加入其他战役。",
  "Every registered user can create campaigns and manage their own maps and players.": "每位注册用户都能创建战役，管理自己的地图与玩家。",
  "Sign in or register to create a campaign and manage your maps and players as a DM.": "注册或登录后即可创建战役，成为 DM 并管理自己的地图与玩家。",
  "Sign in or register to create and manage your own campaigns.": "注册或登录后，即可创建并管理自己的战役。",
  "Username": "用户名",
  "Password": "密码",
  "Sign In": "登录",
  "Create Account": "注册账号",
  "Sign Out": "退出登录",
  "DM Workspace": "DM 工作台",
  "Player Preview": "玩家视角",
  "Your Campaigns": "我的战役",
  "Managed Campaigns": "我主持的战役",
  "Choose a campaign to view the places and characters your DM has revealed.": "选择战役进入地图，查看 DM 已公开的地点与人物。",
  "Choose a campaign to manage its maps and players, or create a new world.": "选择战役管理地图与玩家，或创建一个全新的世界。",
  "Choose a campaign to manage its maps and players, or create a new campaign.": "选择战役管理地图与玩家，或创建一个新的战役。",
  "New Campaign Name": "新战役名称",
  "e.g. The Lost Isles": "例如：失落的群岛",
  "Create Campaign": "创建战役，成为 DM",
  "Add a Registered Player": "添加已注册玩家",
  "Select a player": "选择玩家",
  "Add to Campaign": "添加到当前战役",
  "Current Players": "当前玩家",
  "Map Not Ready": "地图准备中",
  "Your DM has not set a starting map for this campaign yet. Please check back later.": "DM 尚未设置这个战役的起始地图，请稍后再来。",
  "Campaign Map": "战役地图",
  "Return to Parent Map": "返回上级地图",
  "Campaigns": "战役列表",
  "Set Campaign Starting Map": "设置战役起始地图",
  "Welcome to your new campaign. Upload a starting map, then add locations, NPCs, and linked maps.": "欢迎来到你的新战役。上传一张地图作为起点，再添加地点、NPC 和子地图。",
  "Map Title": "地图名称",
  "World Map": "世界地图",
  "Existing Map Image": "使用站内图片",
  "Choose map image": "选择地图图片",
  "Upload New Map Image": "上传地图图片",
  "Set Starting Map": "保存起始地图",
  "Gate": "大门",
  "Village": "村庄",
  "Town": "城镇",
  "Manor": "庄园",
  "Castle": "城堡",
  "Temple": "神殿",
  "Tent": "帐篷",
  "Hill": "山丘",
  "Letter": "信件",
  "Point of Interest": "兴趣点",
  "Dungeon Master": "主持人（DM）",
  "Player": "玩家",
  "Adventurer": "冒险者",
  "Open Map": "打开地图",
  "Manage Players": "管理玩家",
  "Delete Campaign": "删除战役",
  "Remove": "移除",
  "You no longer have access to this campaign.": "你已不再拥有该战役的访问权限。",
  "You are not managing any campaigns yet. Create one below to become its DM.": "还没有管理中的战役。在下方创建战役，即可成为这个战役的 DM。",
  "You have not joined any campaigns. Ask your DM to add your username, or create your own campaign in the DM workspace.": "还没有加入战役。请将用户名告诉 DM，由 DM 添加你；也可以前往 DM 工作台创建自己的战役。",
  "Display name must contain 1–24 characters and cannot be blank.": "显示名称需要 1–24 个字符，不能只包含空格。",
  "Saving…": "正在保存…",
  "Saved. Your party will see your new name.": "已保存。大家将看到你的新名称。",
  "Could not save. Check your connection and try again.": "保存失败，请检查网络后重试。",
  "Legend": "图例",
  "Hide Markers": "隐藏标记",
  "Show Markers": "显示标记",
  "Character portraits": "人物肖像",
  "Party Roster": "队伍名册",
  "Registered Players": "玩家名册",
  "Marker Visibility": "标记可见性",
  "Choose which locations and portraits are revealed to players. These settings are synchronized with campaign members.": "选择向玩家公开的地点与肖像。设置会同步给战役成员。",
  "Map Markers": "地图标记",
  "Portrait Markers": "肖像标记",
  "Selected Location": "选中地点",
  "Create Marker": "创建标记",
  "Fill in the marker details, then click the map to place it on the current view.": "填写标记信息，再点击当前地图放置标记。",
  "Title": "标题",
  "New marker title": "新标记标题",
  "Type": "类型",
  "NPC": "NPC",
  "Existing Image": "使用已有图片",
  "No image": "不使用图片",
  "Upload New Image": "上传新图片",
  "Optional. A selected upload takes priority over the existing image above. Maximum 10 MB.": "可选。上传图片将优先于已有图片，最大 10 MB。",
  "A selected upload takes priority over the existing image above. Maximum 10 MB.": "上传图片将优先于已有图片，最大 10 MB。",
  "A selected upload takes priority. Maximum 10 MB.": "上传图片优先，最大 10 MB。",
  "Big map marker": "子地图入口",
  "Map Name": "地图名称",
  "Optional, defaults to title": "可选，默认使用标记标题",
  "Description": "描述",
  "Add notes for players and yourself.": "添加你和玩家可见的说明。",
  "Visible to players immediately": "立即向玩家公开",
  "Place Marker On Map": "在地图上放置标记",
  "Create NPC": "创建 NPC",
  "Cancel Placement": "取消放置",
  "Click an empty spot on the current map to place the marker.": "点击当前地图的空白处放置标记。",
  "Location": "地点",
  "Portrait": "肖像",
  "Map": "地图",
  "Information": "情报",
  "Big Map": "子地图",
  "Unnamed location": "未命名地点",
  "Unknown player": "未知玩家",
  "Unknown user": "未知用户",
  "NPC portrait": "NPC 肖像",
  "Custom NPC": "自定义 NPC",
  "Custom Marker": "自定义标记",
  "Show the {name} map": "查看{name}地图",
  "Open details for {name}": "查看{name}的详情",
  "Show NPC {name}": "查看 NPC {name}",
  "Show portrait of {name}": "查看{name}的肖像",
  "previous map": "上级地图",
  "No notes have been added for this marker yet.": "此标记尚未添加说明。",
  "DM only": "仅 DM 可见",
  "Marker Icon": "标记图标",
  "Choose the symbol displayed on the map. This setting is shared with players in this campaign.": "选择地图上显示的图标。此设置会同步给战役玩家。",
  "Default marker preview": "默认标记预览",
  "Map icon": "地图图标",
  "Default marker": "默认标记",
  "Save Icon": "保存图标",
  "Choose a valid marker icon.": "请选择有效的标记图标。",
  "Saving marker icon...": "正在保存标记图标…",
  "Marker icon updated.": "标记图标已更新。",
  "Default marker restored.": "已恢复默认标记。",
  "Marker icon could not be saved. Check your Firebase rules.": "无法保存标记图标，请检查 Firebase 规则。",
  "Linked Map": "关联地图",
  "DM Marker Settings": "DM 标记设置",
  "DM Map Entrance": "DM 地图入口",
  "Selected Portrait": "选中肖像",
  "Use the DM controls below to change this marker icon.": "使用下方的 DM 控件修改此标记图标。",
  "Loading...": "正在加载…",
  "Failed to load character content.": "人物内容加载失败。",
  "Failed to load location content.": "地点内容加载失败。",
  "No registered players are currently visible.": "目前没有可显示的玩家。",
  "Registered player": "战役玩家",
  "Listed": "已显示",
  "Ready": "已就绪",
  "Player list could not be loaded.": "玩家列表加载失败。",
  "DM state could not be saved to Firebase. Check your database rules.": "无法保存 DM 设置，请检查数据库规则。",
  "Firebase SDK or config is unavailable, so authentication cannot start.": "Firebase SDK 或配置不可用，无法启动登录。",
  "Firebase could not be initialized. Check your config and reload the page.": "Firebase 初始化失败，请检查配置并刷新页面。",
  "Campaign map configuration could not be loaded.": "无法加载战役地图配置。",
  "Map sync could not read Firebase data. Check your database rules.": "地图同步无法读取 Firebase 数据，请检查数据库规则。",
  "Custom markers could not be loaded from Firebase.": "无法从 Firebase 加载自定义标记。",
  "Marker icons could not be loaded. Check your database rules.": "无法加载标记图标，请检查数据库规则。",
  "Campaign could not be deleted. Check your Firebase rules and try again.": "无法删除战役，请检查 Firebase 规则后重试。",
  "Loading players...": "正在加载玩家…",
  "All existing players are already members": "所有已注册玩家均已加入",
  "Player list could not be loaded": "无法加载玩家列表",
  "Loading current players...": "正在加载当前玩家…",
  "No players are currently in this campaign.": "此战役还没有玩家。",
  "Current players could not be loaded.": "无法加载当前玩家。",
  "This account is signed in, but it does not have DM access.": "已登录，但此账号没有该战役的 DM 权限。",
  "You are signed in with the DM account.": "你正在以 DM 身份查看此战役。",
  "You are signed in and can open the player map.": "你已登录，可以查看玩家地图。",
  "Visible to Players": "玩家可见",
  "Hidden from Players": "对玩家隐藏",
  "Change Icon": "更换图标",
  "Delete": "删除",
  "No content is available for this marker yet.": "此标记尚无内容。",
  "Choose a valid marker type.": "请选择有效的标记类型。",
  "Add a title before creating the NPC.": "请先填写 NPC 名称。",
  "Add a title before placing the marker.": "请先填写标记标题。",
  "Click the map to choose where this marker should appear.": "点击地图选择标记位置。",
  "Use an image file name ending in .jpg, .jpeg, .png, .webp, .gif, or .avif.": "图片扩展名需为 .jpg、.jpeg、.png、.webp、.gif 或 .avif。",
  "Add a map name before placing a big map marker.": "请先填写子地图名称。",
  "Use at least one letter or number in the map name.": "地图名称至少需包含一个字母或数字。",
  "Choose an existing map image or upload a new one.": "请选择已有地图图片或上传新图片。",
  "Uploading marker image to Cloudinary...": "正在上传标记图片到 Cloudinary…",
  "Uploading map image to Cloudinary...": "正在上传地图图片到 Cloudinary…",
  "Image upload failed. Try again.": "图片上传失败，请重试。",
  "Firebase did not return a marker id.": "Firebase 未返回标记 ID。",
  "Marker could not be saved. Check your Firebase rules.": "无法保存标记，请检查 Firebase 规则。",
  "Marker could not be deleted. Check your Firebase rules.": "无法删除标记，请检查 Firebase 规则。",
  "Add a title before entering placement mode.": "请先填写标题再进入放置模式。",
  "Enter a campaign name with 1-60 characters.": "请输入 1–60 个字符的战役名称。",
  "Campaign could not be created. Check your Firebase rules.": "无法创建战役，请检查 Firebase 规则。",
  "Enter a map title and choose or upload an image.": "请输入地图名称并选择或上传图片。",
  "Saving starting map...": "正在保存起始地图…",
  "Uploading starting map to Cloudinary...": "正在上传起始地图到 Cloudinary…",
  "Starting map saved.": "起始地图已保存。",
  "Starting map could not be saved.": "无法保存起始地图。",
  "Select a player and a campaign you manage.": "请选择玩家和你管理的战役。",
  "Player could not be added. Check the username and Firebase rules.": "无法添加玩家，请检查用户名和 Firebase 规则。",
  "Player could not be removed. Check your Firebase rules.": "无法移除玩家，请检查 Firebase 规则。",
  "Use a username with 3-24 letters, numbers, dots, underscores, or dashes.": "用户名需为 3–24 位字母、数字、点、下划线或连字符。",
  "Choose a password with at least 6 characters.": "密码至少需要 6 个字符。",
  "Signing in...": "正在登录…",
  "Creating account...": "正在创建账号…",
  "Account created. You are now signed in.": "账号已创建并登录。",
  "Signed out.": "已退出登录。",
  "Signed in, but the user profile could not be loaded. Check Firebase rules.": "已登录，但无法加载账号资料，请检查 Firebase 规则。",
  "Campaigns could not be loaded. Publish the updated Firebase rules and try again.": "无法加载战役，请发布最新 Firebase 规则后重试。",
  "That username and password combination did not match.": "用户名或密码不正确。",
  "That username already exists. Try signing in instead.": "用户名已存在，请尝试登录。",
  "Firebase could not be reached. Check your internet connection.": "无法连接 Firebase，请检查网络。",
  "Authentication failed.": "登录验证失败。",
  "Choose a JPG, JPEG, PNG, WebP, GIF, or AVIF image with a file name under 120 characters.": "请选择 JPG、JPEG、PNG、WebP、GIF 或 AVIF 图片，文件名不得超过 120 个字符。",
  "The selected image is empty.": "所选图片为空。",
  "The selected image is larger than 10 MB.": "所选图片超过 10 MB。",
  "The selected file is not an image.": "所选文件不是图片。",
  "Cloudinary upload is not configured.": "尚未配置 Cloudinary 上传。",
  "Cloudinary did not return a valid image URL.": "Cloudinary 未返回有效图片地址。",
  "Cloudinary returned an unexpected image URL.": "Cloudinary 返回了不受支持的图片地址。",
  "Manage players: {name}": "管理玩家：{name}",
  "Sign-in username: {name}": "登录用户名：{name}",
  "{name} marker icon preview": "{name}标记图标预览",
  "This marker opens {name}. You can enter the map after changing its icon.": "此标记通往{name}，你可以修改图标后进入地图。",
  "Open {name}": "打开{name}",
  "Return to {name}": "返回{name}",
  "Permanently delete \"{name}\"?\n\nThis deletes its maps, markers, and player memberships. Cloudinary images remain in your Media Library. This cannot be undone.": "永久删除“{name}”？\n\n此操作将删除地图、标记和成员关系，且无法撤销。Cloudinary 图片会保留在素材库中。",
  "Deleting campaign \"{name}\"...": "正在删除战役“{name}”…",
  "Campaign \"{name}\" was permanently deleted.": "已永久删除战役“{name}”。",
  "Delete \"{name}\"? This cannot be undone.": "删除“{name}”？此操作无法撤销。",
  "Marker \"{name}\" deleted.": "标记“{name}”已删除。",
  "Remove {name} from this campaign?": "将{name}从此战役移除？",
  "{name} was removed from this campaign.": "已将{name}从此战役移除。",
  "{name} can now see {campaign}.": "{name}现在可以访问{campaign}。",
  "this campaign": "此战役",
  "this player": "此玩家",
  "this marker": "此标记",
  "Selected player": "所选玩家",
  "Could not find \"{name}\" in assets/images. Upload it there first.": "在 assets/images 中找不到“{name}”，请先上传。",
  "Could not find \"{name}\" in assets/images.": "在 assets/images 中找不到“{name}”。",
  "Marker \"{name}\" added to {map}.": "已将标记“{name}”添加到{map}。",
  "NPC \"{name}\" added.": "NPC“{name}”已添加。",
  "NPC \"{name}\" added to {map}.": "已将 NPC“{name}”添加到{map}。",
  "Cloudinary upload failed ({status}).": "Cloudinary 上传失败（{status}）。",
  "Switch to Chinese": "切换为中文",
  "Switch to English": "切换为英文"
};
  const aliases = new Map();
  for (const [key, chinese] of Object.entries(messages)) {
    aliases.set(key, key);
    aliases.set(chinese, key);
  }
  const storageKey = "dnd-map-language";
  let language = "en";
  try { if (window.localStorage.getItem(storageKey) === "zh") language = "zh"; } catch {}
  const canonical = key => aliases.get(key) || key;
  const t = (key, values = {}) => {
    key = canonical(String(key ?? ""));
    const template = language === "zh" ? (messages[key] || key) : key;
    return template.replace(/\{(\w+)\}/g, (match, name) =>
      Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match);
  };
  const bindings = new WeakMap();
  function setText(element, key, values = {}) {
    if (!element) return;
    key = canonical(String(key ?? ""));
    // Remove static bindings if this element now displays dynamic content.
    element.removeAttribute("data-i18n");
    bindings.set(element, { ...bindings.get(element), key, values });
    element.setAttribute("data-i18n-bound", "");
    const text = t(key, values);
    if (element.textContent !== text) element.textContent = text;
  }
  function setAttribute(element, attribute, key, values = {}) {
    if (!element) return;
    const binding = bindings.get(element) || {};
    binding.attributes ||= {};
    binding.attributes[attribute] = { key: canonical(key), values };
    bindings.set(element, binding);
    element.setAttribute("data-i18n-bound", "");
    const text = t(key, values);
    if (element.getAttribute(attribute) !== text) element.setAttribute(attribute, text);
  }
  function translateElement(element) {
    const binding = bindings.get(element);
    const key = binding?.key ?? element.getAttribute("data-i18n");
    if (key !== null && key !== undefined) {
      const text = t(key, binding?.values);
      if (element.textContent !== text) element.textContent = text;
    }
    for (const attribute of ["placeholder", "aria-label", "title", "alt"]) {
      const bound = binding?.attributes?.[attribute];
      const attributeKey = bound?.key ?? element.getAttribute("data-i18n-" + attribute);
      if (attributeKey !== null && attributeKey !== undefined) {
        const text = t(attributeKey, bound?.values);
        if (element.getAttribute(attribute) !== text) element.setAttribute(attribute, text);
      }
    }
  }
  const selector = "[data-i18n], [data-i18n-bound], [data-i18n-placeholder], [data-i18n-aria-label], [data-i18n-title], [data-i18n-alt]";
  function apply(root = document) {
    if (root.matches?.(selector)) translateElement(root);
    root.querySelectorAll?.(selector).forEach(translateElement);
  }
  function refreshLanguageButton() {
    const button = document.getElementById("language-toggle");
    if (!button) return;
    button.textContent = language === "en" ? "中文" : "English";
    button.lang = language === "en" ? "zh-CN" : "en";
    button.setAttribute("aria-label", language === "en" ? "Switch to Chinese" : "切换为英文");
  }
  function setLanguage(next, persist = true) {
    language = next === "zh" ? "zh" : "en";
    if (persist) {
      try { window.localStorage.setItem(storageKey, language); } catch {}
    }
    document.documentElement?.setAttribute("lang", language === "zh" ? "zh-CN" : "en");
    apply();
    refreshLanguageButton();
    window.dispatchEvent(new CustomEvent("languagechange", { detail: { language } }));
  }
  window.I18n = { t, setText, setAttribute, apply, setLanguage, get language() { return language; } };
  document.documentElement?.setAttribute("lang", language === "zh" ? "zh-CN" : "en");
  apply();
  refreshLanguageButton();
  document.getElementById("language-toggle")?.addEventListener("click", () => setLanguage(language === "en" ? "zh" : "en"));
  window.addEventListener("storage", event => {
    if (event.key === storageKey) setLanguage(event.newValue, false);
  });
  // Only explicitly tagged UI is translated when dynamic panels are inserted.
  if (typeof MutationObserver !== "undefined" && document.body) {
    new MutationObserver(records => {
      for (const record of records) for (const node of record.addedNodes) {
        if (node.nodeType === 1) apply(node);
      }
    }).observe(document.body, { childList: true, subtree: true });
  }
})();
