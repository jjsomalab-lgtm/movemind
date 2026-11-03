// ============================================================
// n8n「網頁聊天」工作流程｜Code 節點 ②：AI 回覆檢查（放在 AI Agent 節點之後）
// 設定：Mode = Run Once for Each Item
// ============================================================

const ai = String($json.output ?? $json.text ?? '').trim();
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

return { json: { reply, flag: null } };
