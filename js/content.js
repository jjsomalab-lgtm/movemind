// 心動力 AI｜內容資料
// 活動與篩選內容為團隊整理之初稿，正式使用前須經運動醫學專業審閱（見 docs/SPEC.md「待審閱清單」）。

// 時間＝含準備與休息的估計值，可依體力調整；level：seated＝坐姿，standing＝扶椅站姿
// easier：做不到或不舒服時的「退階」做法
export const ACTIVITIES = [
  {
    id: 'seated-knee', name: '坐姿抬腿', level: 'seated', minutes: 4, reps: 10, repsNote: '左右腳合計', pose: true,     goal: '強化大腿前側，起身和走路更穩',
    cues: ['坐在穩固椅子的前半段，背挺直，雙手扶著椅子兩側。', '慢慢把一隻腳往前抬，抬到舒服的高度，停一下。', '再慢慢放下，換另一隻腳。記得呼吸，不要憋氣。'],
    caution: '膝蓋會痛的話，抬低一點就好，不用伸直，一樣算完成。',
    easier: '只把腳跟輕輕滑向前方，不抬離地面。',
  },
  {
    id: 'seated-march', name: '坐姿踏步', level: 'seated', minutes: 3, reps: 20, repsNote: '左右腳合計', pose: true,
    goal: '暖身，讓腿部循環變好',
    cues: ['坐穩，雙手放在大腿上。', '左右腳輪流抬起，像在原地走路。', '保持呼吸，不要憋氣。'],
    caution: '節奏自己決定，累了就停下來休息。',
    easier: '腳跟不離地，只抬起腳尖輪流踏。',
  },
  {
    id: 'arm-circle', name: '手臂畫圈', level: 'seated', minutes: 3, reps: 10, repsNote: '前後各 5 圈', pose: true,
    goal: '放鬆肩膀，活動上半身',
    cues: ['坐穩，雙手往兩側打開，和肩膀差不多高。', '手臂慢慢往前畫小圈圈。', '再換方向往後畫。記得呼吸，不要憋氣。'],
    caution: '肩膀會痛的話，手放低一點，圈畫小一點。',
    easier: '雙手放在肩膀上，只用手肘畫圈。',
  },
  {
    id: 'seated-twist', name: '坐姿轉身', level: 'seated', minutes: 3, reps: 6, repsNote: '左右合計', pose: true,
    goal: '放鬆腰背，轉身更輕鬆',
    cues: ['坐直，雙手交叉放在胸前。', '身體慢慢轉向右邊，停兩秒。', '回到中間，再轉向左邊。記得呼吸。'],
    caution: '轉到舒服的角度就好，腰會痛就停止。',
    easier: '只轉頭和肩膀，腰不用轉。',
  },
  {
    id: 'ankle-pump', name: '腳踝上下動', level: 'seated', minutes: 2, reps: 15, repsNote: '一上一下算 1 下', pose: true,
    goal: '促進小腿循環，久坐後特別適合',
    cues: ['坐著，雙腳平放在地上。', '腳尖往上翹，腳跟踩地。', '再換腳跟抬起，腳尖踩地。'],
    caution: '小腿抽筋時先停下來，慢慢把腳尖往身體方向拉，輕輕伸展。疼痛或腫脹一直沒有改善，請就醫。',
    easier: '一次只動一隻腳，動作放慢。',
  },
  {
    id: 'sit-to-stand', name: '扶椅起立', level: 'standing', minutes: 4, reps: 8, repsNote: '站起再坐下算 1 下', pose: true,
    goal: '練習起身的力氣，生活更方便',
    cues: ['坐在靠牆、不會滑動的穩固椅子上，前面放一張桌子可以扶。', '身體微微往前，一邊吐氣一邊用雙腳站起來。', '慢慢坐回去，屁股輕輕碰到椅子。'],
    caution: '頭暈時先扶穩，再慢慢坐下休息。膝蓋痛就停止。',
    easier: '坐高一點的椅子，或用手撐著扶手起身。',
  },
  {
    id: 'heel-raise', name: '扶椅踮腳', level: 'standing', minutes: 3, reps: 10, repsNote: '踮起再放下算 1 下', pose: true,
    goal: '強化小腿，走路更有力',
    cues: ['站在靠牆、不會滑動的椅子後面，雙手扶好椅背。', '腳跟慢慢抬起，用腳尖站著。', '再慢慢放下。記得呼吸，不要憋氣。'],
    caution: '全程扶著椅背，不要放手。頭暈時先扶穩，再坐下休息。',
    easier: '腳跟只抬起一點點，或改做坐姿的腳踝上下動。',
  },
  {
    id: 'stand-march', name: '扶椅原地踏步', level: 'standing', minutes: 3, reps: 20, repsNote: '左右腳合計', pose: true,
    goal: '練習平衡，為出門散步做準備',
    cues: ['站在靠牆、不會滑動的椅子後面，雙手扶好。', '左右腳輪流抬起，像原地走路。', '抬到舒服的高度就好。'],
    caution: '全程扶著椅背。覺得身體晃，先坐下休息，再改做坐姿踏步。',
    easier: '改做坐姿踏步。',
  },
];

// 首次使用健康篩選：參考 PAR-Q+ 精神改寫之初稿，非正式量表
// tier 'doctor'：回答「有」或「不確定」→ 只開放坐姿，扶椅活動與散步需醫師同意、由據點人員解鎖
// tier 'assist'：回答「有」或「不確定」→ 扶椅活動與散步需要「有人陪同」
export const SCREENING = [
  { q: '醫師曾經說過你有心臟方面的疾病嗎？', tier: 'doctor' },
  { q: '醫師曾經說過你有高血壓嗎？', tier: 'assist' },
  { q: '活動身體的時候，曾經胸口痛或胸悶嗎？', tier: 'doctor' },
  { q: '過去一年，曾經頭暈到站不穩，或昏倒過嗎？', tier: 'doctor' },
  { q: '過去一年，曾經跌倒過嗎？', tier: 'assist' },
  { q: '有骨頭或關節的問題，活動時會變得更痛嗎？', tier: 'assist' },
  { q: '目前有在吃心臟或血壓的藥嗎？', tier: 'assist' },
  { q: '醫師曾經說過，你只能在醫療人員陪同下運動嗎？', tier: 'doctor' },
];
export const RESCREEN_DAYS = 90; // 每 3 個月提醒重新回答

// 每日確認：chest「有」或「不確定」→ 今天停止；pain「有/不確定」、ready「還沒/不確定」→ 只給坐姿
export const DAILY_CHECK = [
  { id: 'chest', q: '今天有沒有胸悶、胸痛，或頭暈？', yes: '有', no: '沒有' },
  { id: 'pain', q: '身體有沒有新的疼痛？', yes: '有', no: '沒有' },
  { id: 'ready', q: '穿好不會滑的鞋，旁邊也有穩固的椅子了嗎？', yes: '好了', no: '還沒' },
];

export const MOODS = [
  { id: 'good', face: '😊', label: '不錯', reply: '聽到你心情不錯，我也很開心！今天要不要動一動，讓好心情延續下去？' },
  { id: 'ok', face: '🙂', label: '還好', reply: '還好也很不錯喔。我們挑一個輕鬆的活動，動完說不定會更有精神。' },
  { id: 'tired', face: '😴', label: '有點累', reply: '辛苦了，累的時候不用勉強。今天我們只做坐著的溫和動作，好嗎？' },
  { id: 'upset', face: '😟', label: '心煩', reply: '謝謝你願意告訴我。先慢慢深呼吸三次。想說說看發生什麼事嗎？如果心裡很難受，也可以打 1925 安心專線，有人會陪你聊。' },
];

// 展示模式聊天：預先設計的回應（決審版改為後端 AI，見 SPEC「AI 串接」）
// 順序重要：自傷 → 身體緊急 → 其他。前兩類為固定回覆，決審版也不送給 AI
export const CHAT_RULES = [
  { keys: ['想死', '不想活', '毋想活', '自殺', '活著沒意思', '活著沒意義', '結束生命', '不想拖累', '拖累家人', '早點走', '想走了', '沒有我比較好'], crisis: true,
    reply: '聽起來你現在很難受，謝謝你願意說出來，我很在乎你的安全。請現在打 1925 安心專線，24 小時都有人陪你聊；如果有立即危險，請打 119。' },
  { keys: ['胸痛', '胸悶', '胸口', '喘不過氣', '呼吸困難', '心悸', '心跳很快', '冒冷汗', '半邊', '手腳無力', '講話不清', '嘴歪', '昏倒', '暈倒', '頭暈', '很暈', '跌倒了', '摔倒了', '跌了一跤', '摔了一跤'], body: true,
    reply: '請先停下來，找地方坐好。胸痛、呼吸困難、冒冷汗、半邊無力或講話不清楚，都可能是緊急狀況，請馬上打 119。跌倒後覺得痛或站不起來，也請打 119 或通知家人。' },
  { keys: ['怕跌倒', '怕摔', '會跌倒', '站不穩'],
    reply: '會擔心跌倒很正常。我們先從坐著的動作開始，慢慢把腳的力氣練起來；想做站著的活動時，請家人或據點人員在旁邊陪你。' },
  { keys: ['膝蓋', '腳痛', '腰痛', '肩膀', '痛', '緊'],
    reply: '聽起來那個地方讓你不太舒服。今天我們避開它，只做坐著的輕鬆動作，好嗎？一直沒好的話，記得請醫師看看喔。' },
  { keys: ['累', '沒力', '沒精神', '睡不好'],
    reply: '聽起來今天真的有點累。累的時候，你通常怎麼讓自己舒服一點呢？如果想動一點點，「腳踝上下動」坐著兩分鐘就能完成。' },
  { keys: ['孤單', '一個人', '無聊', '沒人'],
    reply: '一個人的時候，有時候會覺得時間特別長。你以前最喜歡跟誰一起出門呢？我可以陪你動一動，也很推薦到附近的社區據點走走，那裡有很多朋友。' },
  { keys: ['孫', '兒子', '女兒', '家人'],
    reply: '聽得出來你很在意家人。最近有跟他們聊到什麼嗎？動完之後，也可以把這週的紀錄分享給他們看看。' },
  { keys: ['動一動', '運動', '活動', '散步'], go: true,
    reply: '好啊！我們先做簡單的安全確認，再一起選活動。' },
  { keys: ['謝謝', '感謝'], reply: '不客氣！能陪你是我的榮幸。' },
];
export const CHAT_DEFAULT = '我聽到了，謝謝你跟我說。可以再多說一點嗎？今天是什麼讓你有這樣的感覺？';
// AI 是橋梁、不是替代：聊了幾句後，鼓勵長輩和真實的人連結
export const BRIDGE_LINES = [
  '跟你聊天很開心！今天有沒有機會打個電話給家人或朋友，跟他們說說話？',
  '我很喜歡陪你聊天。也別忘了，據點的朋友們一定也很想見到你喔。',
];
export const CHAT_CHIPS = ['今天有點累', '膝蓋有點緊', '一個人有點無聊', '我想動一動'];

// 心動綠洲植物（原創繪製，臺灣常見植物）
export const PLANTS = {
  jasmine: { name: '茉莉花', petal: '#FFFFFF', edge: '#D9E2D2', center: '#F2D16B' },
  osmanthus: { name: '桂花', petal: '#F2A93B', edge: '#D9861A', center: '#B8650C' },
  magnolia: { name: '玉蘭花', petal: '#FBF3DC', edge: '#E3D4A6', center: '#E9C96A' },
  bougainvillea: { name: '九重葛', petal: '#D63A86', edge: '#A8256A', center: '#F4E6A0' },
  kapok: { name: '木棉花', petal: '#D9482B', edge: '#A83418', center: '#F2B33D', special: true },
};
export const STARTER_PLANTS = ['jasmine', 'osmanthus', 'magnolia', 'bougainvillea'];
export const STAGE_NAMES = ['種子', '發芽', '長葉', '開花'];
export const GARDEN_SLOTS = 9;
export const KM_PER_WATER = 0.3;      // 散步每 0.3 公里澆一次水
export const COMMUNITY_GOAL_KM = 10;  // 社區合作任務：大家一起走 10 公里

export const EMERGENCY = { medical: '119', mental: '1925' };

// LINE 官方帳號的 ID（在 LINE Official Account Manager 首頁可看到，例如 @123abcde）
// 填好之後，APP 裡的「到 LINE 聊」按鈕會直接打開官方帳號的聊天室，並自動帶入文字
export const LINE_OA_ID = '@615drddf';
// 網頁聊天的 AI 大腦：n8n「網頁聊天」工作流程的 Webhook Production URL（見 line/LINE整合說明.md 第八節）
// 留空時，APP 內聊天使用預先設計的回應（展示模式）
export const AI_CHAT_URL = '';
export const aiReady = () => /^https:\/\//.test(AI_CHAT_URL);
export const lineReady = () => /^@[0-9a-z._-]+$/i.test(LINE_OA_ID);

// 活動後心情（行為活化：讓長輩看見「動一動」和「心情」的關聯）
export const AFTER_MOODS = [
  { id: 'better', face: '😊', label: '比較好', reply: '太好了！你看，動一動心情真的會不一樣。' },
  { id: 'same', face: '🙂', label: '差不多', reply: '差不多也很好，你今天有照顧自己的身體，這就很棒了。' },
  { id: 'worse', face: '😟', label: '比較差', reply: '謝謝你誠實告訴我。先坐下休息一下。如果是身體不舒服，請按右上角的「不舒服」。' },
];

// 每週一次：跌倒擔心度（0–10）。追蹤「怕跌倒 → 不敢動」循環是否改善
// 這是自評的趨勢參考，不是量表，也不做任何判讀或診斷
export const FOF_QUESTION = '這一週，出門走路的時候，你擔心跌倒的程度有多少？';
export const FOF_DAYS = 7;
export function fofReply(score) {
  if (score >= 7) return '謝謝你告訴我。很多長輩都會擔心跌倒，這很正常。我們從坐著的動作慢慢把力氣練起來；也可以跟家人或據點人員聊聊這份擔心。';
  if (score >= 4) return '有一點擔心是很自然的。我們繼續一步一步練習，你會越來越有信心。';
  return '很好！你對走路越來越有信心了。記得還是要穿好鞋、注意腳下喔。';
}

// 展示用模擬散步路線（高醫附近，僅供室內展示）
export const DEMO_ROUTE = [
  [22.6466, 120.3093], [22.6471, 120.3094], [22.6477, 120.3096], [22.6483, 120.3097],
  [22.6488, 120.3101], [22.6490, 120.3108], [22.6489, 120.3115], [22.6484, 120.3119],
  [22.6478, 120.3120], [22.6472, 120.3118], [22.6467, 120.3113], [22.6464, 120.3106],
  [22.6464, 120.3099], [22.6466, 120.3093],
];

// ---------- 葉靈：散步時遇到的原創小精靈（以臺灣常見植物為靈感，原創設計） ----------
// walk：散步時依序遇到；checkin：打卡時遇到（第 1 次木棉、第 2 次荷花）
export const SPIRITS = [
  { id: 'jasmine', name: '茉莉小白', from: 'walk', petal: '#FFFFFF', edge: '#CFD8C8', n: 5, shape: 'round', line: '喜歡陪人慢慢散步，走累了就一起休息。' },
  { id: 'osmanthus', name: '桂花金金', from: 'walk', petal: '#F2A93B', edge: '#D9861A', n: 12, shape: 'dot', line: '身上香香的，聞到它就會想笑。' },
  { id: 'bougainvillea', name: '九重葛紫紫', from: 'walk', petal: '#D63A86', edge: '#A8256A', n: 3, shape: 'bract', line: '住在巷口的牆上，最喜歡跟鄰居打招呼。' },
  { id: 'magnolia', name: '玉蘭香香', from: 'walk', petal: '#FBF3DC', edge: '#E3D4A6', n: 6, shape: 'long', line: '很會等待，總是在路口等你經過。' },
  { id: 'tung', name: '油桐雪雪', from: 'walk', petal: '#FFFFFF', edge: '#E7B7C0', n: 5, shape: 'heart', line: '輕輕飄下來的小白花，看到它代表今天走得很遠。' },
  { id: 'kapok', name: '木棉紅紅', from: 'checkin', petal: '#D9482B', edge: '#A83418', n: 5, shape: 'big', line: '高雄的市花精靈，在你第一次打卡的地方等你。' },
  { id: 'lotus', name: '荷花粉粉', from: 'checkin', petal: '#F3A6C0', edge: '#D9708F', n: 8, shape: 'point', line: '從蓮池來的精靈，第二次打卡時會出現。' },
];
export const KM_PER_SPIRIT = 0.25; // 散步每 0.25 公里遇到一隻
export const FLOWER_EVERY_M = 40;  // 散步路線每 40 公尺開一朵花
