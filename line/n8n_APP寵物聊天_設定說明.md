# n8n｜APP 寵物聊天設定（與 LINE 共用同一個 GPT 與提示詞）

## 一、原則：不動現有的 LINE 工作流程
- **新增**一個工作流程「心動力｜APP 寵物聊天（網頁）」，LINE 那份完全不改。
- 兩份都選**同一個 OpenAI 憑證**（同一把 GPT API 金鑰、同一個帳單）、**同一個模型**、**同一份提示詞**。

## 二、最快的方法：匯入現成的工作流程
1. n8n 右上角「⋯」→ **Import from File**，選 `n8n_APP寵物聊天_匯入用.json`。
2. 點「OpenAI Chat Model」節點 → Credential 選你 **LINE 正在用的那個 OpenAI 憑證**；Model 改成 LINE 用的模型。
3. 點「AI Agent」節點，確認 System Message（已放入心動小夥伴＋寵物補充；也可以換成你 LINE 的最新版）。
4. 右上角 **Activate** 啟用 → 點「Webhook」節點 → 複製 **Production URL**。
5. 把網址傳給我（或填入 APP 的 `js/content.js` 的 `AI_CHAT_URL`）。

> 匯入時若有節點顯示紅色（n8n 版本不同），請刪掉該節點，依下表手動新增同類節點即可。

| 節點 | 設定 |
|---|---|
| Webhook | POST；Path：movemind-chat；Respond：Using 'Respond to Webhook' Node；Allowed Origins：https://jjsomalab-lgtm.github.io |
| 安全分流（Code） | Run Once for Each Item；貼上 n8n_web_1_安全分流.js |
| 需要 AI 嗎（If） | {{ $json.route }} 等於 ai；True → AI Agent；False → 回傳給 APP |
| AI Agent | Prompt：Define below，{{ $json.chatInput }}；System Message：同 LINE；**不需要 Memory** |
| AI 回覆檢查（Code） | Run Once for Each Item；貼上 n8n_web_2_AI回覆檢查.js |
| 回傳給 APP | Respond With：JSON；Body：{{ { reply: $json.reply, flag: $json.flag } }} |

## 三、為什麼 APP 改版不會影響 n8n：「介面合約 v1」
APP 與 n8n 之間只靠這個固定格式溝通：

APP 送出：
```json
{ "v": 1, "sessionId": "…", "text": "使用者說的話",
  "history": [{ "role": "user", "text": "…" }, { "role": "pet", "text": "…" }],
  "context": { "mood": "", "allowed": "", "pet": "dog", "petName": "阿福", "call": "阿嬤",
               "county": "高雄市", "weather": "", "plan": "" } }
```
n8n 回傳：
```json
{ "reply": "寵物的回答", "flag": null }
```
- 換畫面、換按鈕、加功能：**合約不變，n8n 不用改**。
- 以後要給 AI 更多背景，只會在 `context` **新增**欄位；n8n 會自動忽略看不懂的欄位。
- 真的要改格式時，會把 `v` 改成 2，並同時提供新版 Code 節點。

## 四、為什麼不需要在 n8n 設定記憶
APP 每次都會附上最近 8 句對話（history），n8n 直接把它交給 GPT，所以：
- 對話能自然接續，像在 LINE 聊天一樣。
- 伺服器**不保存**聊天內容，隱私更好；n8n 設定也更簡單。

## 五、安全
- 自傷、身體緊急關鍵字：APP 先攔一次、n8n「安全分流」再攔一次，都直接給固定回覆，**不經過 GPT**。
- GPT 回覆後，「AI 回覆檢查」擋掉診斷、用藥、療效等字眼。
- 請在 OpenAI 帳號設定**每月用量上限**；工作流程已設定成功的執行紀錄不保存。

## 六、LINE 與 APP 是「同一個大腦」，但目前是「不同的身分」
- 同一個 GPT、同一份提示詞、同一套安全規則。
- APP 會告訴 GPT「你是阿福、叫使用者阿嬤」；LINE 目前不知道使用者養了哪隻寵物，所以預設是「心動小夥伴」。
- 未來若要 LINE 也變成同一隻寵物，需要「帳號綁定」（例如 LINE 登入），屬於後端階段的工作。
