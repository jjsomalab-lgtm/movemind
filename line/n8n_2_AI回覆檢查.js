// ============================================================
// n8n Code 節點 ②：AI 回覆後的安全檢查與排版（放在 AI Agent 節點之後）
// 設定：Mode = Run Once for Each Item
// 1. 擋下診斷、藥物、處方類用語 → 改用安全回覆
// 2. 移除 LINE 不支援的 Markdown 符號，限制長度
// 3. 組成 LINE 回覆格式，附上快速回覆按鈕
// ============================================================

// AI Agent 的輸出欄位通常是 output；replyToken 從分流節點取回（節點名稱請依實際名稱修改）
const ai = String($json.output ?? $json.text ?? '').trim();
const src = $('解析與安全分流').item.json;

const BLOCK = [
  /診斷|確診|你(可能)?得了|罹患|病因是/,
  /處方|劑量|毫克|\d+\s*mg|停藥|加藥|減藥|換藥/,
  /(吃|服用|使用).{0,6}(藥|藥物|保健食品)/,
  /保證|一定會好|治好|治癒|療效/,
];
const SAFE = '這部分需要醫師或藥師當面評估，我沒辦法幫你判斷喔。如果一直不舒服，記得去看醫生。想的話，我們先做一點坐著的輕鬆動作？';

let reply = ai;
if (!reply || BLOCK.some(r => r.test(reply))) reply = SAFE;
reply = reply.replace(/[*#`>_]/g, '').replace(/\n{3,}/g, '\n\n').trim();
if (reply.length > 160) reply = reply.slice(0, 158) + '…';

const quick = ['我想動一動', '怎麼使用', '我需要幫忙'].map(t => ({ type: 'action', action: { type: 'message', label: t, text: t } }));

return {
  json: {
    replyToken: src.replyToken,
    messages: [{ type: 'text', text: reply, quickReply: { items: quick } }],
    blocked: reply === SAFE && ai !== SAFE, // 方便統計被擋下幾次（不保存對話內容）
  },
};
