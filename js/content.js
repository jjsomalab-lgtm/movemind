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
export const LINE_OA_ID = '@432vovoa';
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
  { id: 'jasmine', name: '茉莉小白', from: 'walk', petal: '#FFFFFF', petal2: '#E9F1E4', edge: '#B9C9B0', n: 5, shape: 'round', top: 'bud',
    line: '喜歡陪人慢慢散步，走累了就一起休息。',
    talk: ['今天也慢慢來就好，我會陪著你。', '走累了就坐一下，風吹起來很舒服喔。', '你小時候，家裡有種茉莉花嗎？'] },
  { id: 'osmanthus', name: '桂花金金', from: 'walk', petal: '#FFC766', petal2: '#F2A93B', edge: '#C97F14', n: 12, shape: 'dot', top: 'sprig',
    line: '身上香香的，聞到它就會想笑。',
    talk: ['嘿嘿，今天也香香的嗎？', '動一動，身體也會跟我一樣香喔！', '你記得哪裡的桂花最香嗎？'] },
  { id: 'bougainvillea', name: '九重葛紫紫', from: 'walk', petal: '#F06AA8', petal2: '#C92C78', edge: '#9E1F5E', n: 3, shape: 'bract', top: 'none',
    line: '住在巷口的牆上，最喜歡跟鄰居打招呼。',
    talk: ['早安！今天有跟鄰居打招呼嗎？', '巷口的風景，走一圈就會看到不一樣的東西。', '你家附近哪一面牆的花開得最漂亮？'] },
  { id: 'magnolia', name: '玉蘭香香', from: 'walk', petal: '#FFF8E4', petal2: '#EBDDB0', edge: '#C9B47A', n: 6, shape: 'long', top: 'none',
    line: '很會等待，總是在路口等你經過。',
    talk: ['我在這裡等你很久了喔，見到你真開心。', '慢慢走，不用急，我一直都在。', '以前在路口買過玉蘭花嗎？是買給誰的呢？'] },
  { id: 'tung', name: '油桐雪雪', from: 'walk', petal: '#FFFFFF', petal2: '#F7DCE2', edge: '#D9A3AF', n: 5, shape: 'heart', top: 'none',
    line: '輕輕飄下來的小白花，看到它代表今天走得很遠。',
    talk: ['你今天走了好遠，好厲害！', '我是從山上飄下來的，路上好漂亮。', '你有看過整片油桐花像下雪一樣嗎？'] },
  { id: 'kapok', name: '木棉紅紅', from: 'checkin', petal: '#F0603E', petal2: '#C23A1E', edge: '#8F2812', n: 5, shape: 'big', top: 'twig',
    line: '高雄的市花精靈，在你第一次打卡的地方等你。',
    talk: ['歡迎來到高雄！我是木棉紅紅。', '春天的時候，我會開滿整條街喔。', '你記得哪一年、在哪裡看過木棉花開嗎？'] },
  { id: 'lotus', name: '荷花粉粉', from: 'checkin', petal: '#FFC3D6', petal2: '#F08AAE', edge: '#C9567E', n: 8, shape: 'point', top: 'drop',
    line: '從蓮池來的精靈，第二次打卡時會出現。',
    talk: ['水邊涼涼的，好舒服。', '我最喜歡夏天的早上了。', '你有去蓮池潭散步過嗎？那時候是跟誰去的？'] },
  { id: 'orchid', name: '蝶蘭仙仙', from: 'home', petal: '#F7EDFC', petal2: '#C99BE3', edge: '#9A66BE', n: 5, shape: 'orchid', top: 'none',
    line: '住在窗邊的蘭花精靈，在家運動時會來看你。',
    talk: ['坐著動也很棒喔，我都看到了！', '窗邊曬曬太陽，心情也會變好。', '家裡有養過蘭花嗎？是誰在照顧的呢？'] },
  { id: 'kumquat', name: '金桔圓圓', from: 'home', petal: '#FFB43C', petal2: '#F08A10', edge: '#C76A00', n: 0, shape: 'fruit', top: 'leaf',
    line: '過年時最常見的金桔，帶來好運和好心情。',
    talk: ['圓圓滾滾，福氣滿滿！', '今天也動了一下，真是好運的一天！', '過年的時候，家裡都會擺什麼呢？'] },
];
export const HOME_ACTIVITIES_PER_SPIRIT = 2; // 每完成 2 次居家活動，窗邊會來一隻葉靈
export const KM_PER_SPIRIT = 0.25; // 散步每 0.25 公里遇到一隻
export const FLOWER_EVERY_M = 40;  // 散步路線每 40 公尺開一朵花

// ---------- 心靈湖畔：此刻的感覺（非診斷，只用來導向合適的活動） ----------
export const LAKE_FEELINGS = [
  { id: 'tired', label: '今天有點累', go: 'mood:tired' },
  { id: 'stress', label: '最近壓力比較大', go: 'breathe', reply: '壓力大的時候，先給自己一分鐘。我們一起慢慢呼吸好嗎？' },
  { id: 'nervous', label: '我有點緊張', go: 'breathe', reply: '緊張是很自然的感覺。跟著畫面，慢慢吸氣、慢慢吐氣。' },
  { id: 'talk', label: '想找人聊聊', go: 'line' },
  { id: 'relax', label: '想做簡單的放鬆練習', go: 'breathe', reply: '好啊，我們做一個簡單的呼吸練習。' },
];

// 呼吸練習：吸 4 秒、吐 6 秒，不憋氣（待專業確認）
export const BREATH = { inhale: 4, exhale: 6 };

// ---------- 知識花園：一般健康知識（非醫療建議，內容待專業人員確認） ----------
export const KNOWLEDGE = [
  { id: 'strength-balance', cat: '運動醫學', title: '肌力和平衡，是長輩活動的重點',
    body: ['世界衛生組織建議，65 歲以上的長輩每週至少 3 天，做著重平衡與肌力的多元活動，可以幫助維持身體功能、減少跌倒。', '剛開始不用多，從坐著的抬腿、扶椅起立這類動作慢慢練起就好。', '身體有狀況的人，請先問醫師適合的活動量。'],
    src: '世界衛生組織《身體活動與靜態行為指引》（2020）' },
  { id: 'warning-signs', cat: '運動醫學', title: '活動時，這些訊號要停下來',
    body: ['胸痛或胸悶、呼吸很困難、頭暈、冒冷汗、半邊手腳無力或講話不清楚，都要馬上停止活動。', '先坐下休息；症狀嚴重或沒有改善，請撥打 119。', '活動時可以說話、不會喘不過氣，通常就是適合的強度。'] },
  { id: 'sit-less', cat: '高齡健康', title: '坐太久，起來動一動',
    body: ['長時間坐著不動對健康不好。世界衛生組織建議減少久坐，用任何強度的活動來取代。', '看電視時，廣告時間做一下腳踝上下動或坐姿踏步，就是很好的開始。'],
    src: '世界衛生組織《身體活動與靜態行為指引》（2020）' },
  { id: 'fear-of-falling', cat: '心理學', title: '擔心跌倒，是很常見的感覺',
    body: ['很多長輩跌倒過一次，或看到別人跌倒後，會開始擔心自己也會跌倒。', '擔心之後，常常就不太敢動；但不動會讓腳的力氣和平衡變差，反而更容易跌倒。', '比較好的方式，是在安全的地方、有支撐的情況下，一步一步把信心找回來。'] },
  { id: 'move-mood', cat: '心理學', title: '動一動，心情也會跟著動',
    body: ['很多人發現，心情低落時更不想動；但先動一點點，心情常常會慢慢好一些。', '心動力在活動後問你心情，就是想讓你自己看看，動完之後有沒有不一樣。', '如果低落的心情持續兩週以上，請找家人或醫師聊聊。'] },
  { id: 'breathing', cat: '壓力調適', title: '慢慢吐氣，讓身體放鬆',
    body: ['緊張或壓力大時，呼吸常常會變得又快又淺。', '試著用鼻子慢慢吸氣，再比吸氣更慢地吐氣，重複幾次。', '練習時不需要憋氣；如果覺得頭暈，就恢復平常的呼吸。'] },
  { id: 'sleep', cat: '睡眠', title: '睡得好的小習慣',
    body: ['每天差不多同一個時間睡覺、起床。', '白天多曬太陽、多活動；午睡不要太長。', '睡前少喝咖啡和濃茶，也少滑手機。', '如果長期睡不好，請找醫師討論，不要自己買藥吃。'] },
  { id: 'connect', cat: '心理學', title: '和人說說話，也是照顧自己',
    body: ['跟家人、朋友或據點的夥伴聊聊天，對心情很有幫助。', '覺得孤單的時候，可以主動打一通電話，或到社區據點走走。', '心裡很難受、想找人說話時，1925 安心專線 24 小時都有人陪你聊。'] },
];

// ---------- 生命之樹：隨參與累積長大，只會長大、不會倒退 ----------
export const TREE_STAGES = [
  { at: 0, name: '一顆種子' }, { at: 3, name: '冒出嫩芽' }, { at: 8, name: '長成小樹' },
  { at: 16, name: '枝葉茂盛' }, { at: 28, name: '開滿花朵' }, { at: 45, name: '生命之樹' },
];

// 紀念徽章：都是「累積」達成，沒有連續天數、沒有排名
export const BADGES = [
  { id: 'first-mood', name: '第一朵心情之花', desc: '第一次記錄心情', icon: '🌸' },
  { id: 'first-breath', name: '第一滴晨露', desc: '完成第一次呼吸練習', icon: '💧' },
  { id: 'first-move', name: '第一步', desc: '完成第一次活動', icon: '👣' },
  { id: 'first-walk', name: '出門走走', desc: '完成第一次散步', icon: '🚶' },
  { id: 'first-spirit', name: '新朋友', desc: '認識第一隻葉靈', icon: '🍃' },
  { id: 'reader', name: '小小園丁學者', desc: '讀完 3 張知識卡', icon: '📖' },
  { id: 'ten-moves', name: '十次的累積', desc: '累積完成 10 次活動', icon: '🌳' },
  { id: 'three-days', name: '這週有在照顧自己', desc: '一週內有 3 天有活動或練習', icon: '☀️' },
];
