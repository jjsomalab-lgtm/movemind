// ============================================================
// n8n Code 節點 ①：解析 LINE 事件 + 安全分流（放在 Webhook 節點之後）
// 設定：Mode = Run Once for All Items，Language = JavaScript
// 原則：自傷、身體緊急、求助一律使用「固定回覆」，絕對不送給 AI
// 關鍵字與 APP（js/content.js）同步，修改時兩邊一起改
// ============================================================

const APP_URL = 'https://你的帳號.github.io/movemind/'; // ← 改成你的 GitHub Pages 網址
const open = hash => `${APP_URL}?openExternalBrowser=1#${hash}`; // 用手機預設瀏覽器開，鏡頭與定位較穩定

const CRISIS = ["想死", "不想活", "毋想活", "自殺", "活著沒意思", "活著沒意義", "結束生命", "不想拖累", "拖累家人", "早點走", "想走了", "沒有我比較好"];
const BODY = ["胸痛", "胸悶", "胸口", "喘不過氣", "呼吸困難", "心悸", "心跳很快", "冒冷汗", "半邊", "手腳無力", "講話不清", "嘴歪", "昏倒", "暈倒", "頭暈", "很暈", "跌倒了", "摔倒了", "跌了一跤", "摔了一跤"];
const FEAR = ["怕跌倒", "怕摔", "會跌倒", "站不穩"];
const HELP = ['我需要幫忙', '求助', '救命'];

const text = t => ({ type: 'text', text: t });
const buttons = (alt, body, actions) => ({
  type: 'template', altText: alt,
  template: { type: 'buttons', text: body.slice(0, 160), actions: actions.slice(0, 4) },
});
const tel = (label, n) => ({ type: 'uri', label, uri: `tel:${n}` });
const link = (label, hash) => ({ type: 'uri', label, uri: open(hash) });
const quick = items => ({ items: items.map(t => ({ type: 'action', action: { type: 'message', label: t, text: t } })) });

const FIXED = {
  crisis: [
    text('聽起來你現在很難受，謝謝你願意說出來，我很在乎你的安全。請現在打 1925 安心專線，24 小時都有人陪你聊；如果有立即危險，請打 119。'),
    buttons('請撥打 1925 或 119', '現在就可以按下面的按鈕撥打電話。', [tel('撥打 1925 安心專線', '1925'), tel('撥打 119', '119')]),
  ],
  body: [
    text('請先停下來，找地方坐好。胸痛、呼吸困難、冒冷汗、半邊無力或講話不清楚，都可能是緊急狀況，請馬上打 119。跌倒後覺得痛或站不起來，也請打 119 或通知家人。'),
    buttons('請撥打 119', '需要的話，按下面的按鈕。', [tel('撥打 119', '119'), link('傳位置給家人', 'help')]),
  ],
  help: [
    buttons('求助選項', '先停下來，找地方坐下，慢慢深呼吸。需要幫忙的話，請選一個：', [
      tel('撥打 119（緊急）', '119'), tel('撥打 1925 安心專線', '1925'), link('傳位置給家人', 'help'),
    ]),
  ],
  fear: [text("會擔心跌倒很正常。我們先從坐著的動作開始，慢慢把腳的力氣練起來；想做站著的活動時，請家人或據點人員在旁邊陪你。")],
  move: [
    buttons('開始活動', '好啊！打開心動力 APP，先回答 3 個簡單問題，再一起選活動。', [
      link('在家動一動', 'activities'), link('出門散步', 'walk'), link('看我的花園', 'garden'),
    ]),
  ],
  welcome: [
    text('你好！我是心動小夥伴 🌱\n我會陪你每天動一動，也會幫你照顧一座小花園。\n\n點下方選單就能打開 APP；想聊天，直接打字給我就好。'),
    {
      ...text('小提醒：我是 AI 小夥伴，不是醫師或護理師，沒辦法診斷或開藥。請不要傳身分證字號、病歷等個人資料。身體不舒服時，請按選單的「不舒服」。'),
      quickReply: quick(['我想動一動', '怎麼使用', '我需要幫忙']),
    },
  ],
  chat: [{ ...text('好啊，想聊什麼都可以，我在這裡。今天過得怎麼樣？'), quickReply: quick(['今天有點累', '膝蓋有點緊', '一個人有點無聊']) }],
};

const has = (t, keys) => keys.some(k => t.includes(k));

const out = [];
for (const item of $input.all()) {
  const events = item.json.body?.events || [];
  for (const ev of events) {
    const base = { replyToken: ev.replyToken, userId: ev.source?.userId || '' };
    if (ev.type === 'follow') { out.push({ json: { ...base, route: 'fixed', messages: FIXED.welcome } }); continue; }
    if (ev.type !== 'message' || ev.message?.type !== 'text' || !ev.replyToken) continue; // 貼圖、圖片等先不處理
    const t = (ev.message.text || '').trim();
    let key = null;
    if (has(t, CRISIS)) key = 'crisis';            // 1. 自傷（最優先）
    else if (has(t, BODY)) key = 'body';           // 2. 身體緊急
    else if (has(t, HELP) || t === '不舒服') key = 'help'; // 3. 求助（選單按鈕）
    else if (has(t, FEAR)) key = 'fear';           // 4. 怕跌倒：安撫
    else if (['我想動一動', '開始活動', '我想運動'].includes(t)) key = 'move';
    else if (t === '我想聊聊') key = 'chat';
    if (key) out.push({ json: { ...base, route: 'fixed', kind: key, messages: FIXED[key] } });
    else out.push({ json: { ...base, route: 'ai', text: t.slice(0, 300) } }); // 其他才交給 AI
  }
}
return out;
