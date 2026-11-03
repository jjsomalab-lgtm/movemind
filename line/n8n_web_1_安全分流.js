// ============================================================
// n8n「網頁聊天」工作流程｜Code 節點 ①：安全分流（放在 Webhook 節點之後）
// 設定：Mode = Run Once for Each Item
// APP 送來：{ sessionId, text, mood, allowed }
// 原則與 LINE 版相同：安全相關一律固定回覆，不送給 AI（APP 端也會先擋一次，這裡是第二道）
// ============================================================

const CRISIS = ["想死", "不想活", "毋想活", "自殺", "活著沒意思", "活著沒意義", "結束生命", "不想拖累", "拖累家人", "早點走", "想走了", "沒有我比較好"];
const BODY = ["胸痛", "胸悶", "胸口", "喘不過氣", "呼吸困難", "心悸", "心跳很快", "冒冷汗", "半邊", "手腳無力", "講話不清", "嘴歪", "昏倒", "暈倒", "頭暈", "很暈", "跌倒了", "摔倒了", "跌了一跤", "摔了一跤"];
const has = (t, keys) => keys.some(k => t.includes(k));

const b = $json.body || {};
const text = String(b.text || '').trim().slice(0, 300);
const sessionId = String(b.sessionId || 'web-unknown').slice(0, 60);

if (!text) return { json: { route: 'fixed', reply: '我在這裡，想聊什麼都可以。', flag: null } };
if (has(text, CRISIS)) return { json: { route: 'fixed', flag: 'crisis', reply: "聽起來你現在很難受，謝謝你願意說出來，我很在乎你的安全。請現在打 1925 安心專線，24 小時都有人陪你聊；如果有立即危險，請打 119。" } };
if (has(text, BODY)) return { json: { route: 'fixed', flag: 'body', reply: "請先停下來，找地方坐好。胸痛、呼吸困難、冒冷汗、半邊無力或講話不清楚，都可能是緊急狀況，請馬上打 119。跌倒後覺得痛或站不起來，也請打 119 或通知家人。" } };

// 把今天的狀態當成背景資訊交給 AI（不含姓名等個人資料）
const allowedText = { none: '今天不適合運動', seated: '今天只做坐姿活動', standard: '今天可做坐姿與扶椅活動' }[b.allowed] || '今天還沒做活動前確認';
const context = `（背景資訊，不要直接念出來：今天心情：${b.mood || '未選'}；${allowedText}）`;
return { json: { route: 'ai', sessionId, chatInput: `${context}\n${text}` } };
