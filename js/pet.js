// 心動夥伴：住在心動花園裡的電子寵物（原創角色）
// 原則：寵物是陪伴者，不是監督者。永遠健康、不會餓、不會生病、不責備；只算累積，不算連續天數。
export const PETS = {
  dog: { name: '阿福', kind: '台灣土狗', sound: '汪！', trait: '熱情、愛散步，最喜歡陪你出門走走' },
  cat: { name: '咪咪', kind: '虎斑貓', sound: '喵～', trait: '溫柔慢條斯理，陪你在家伸展放鬆' },
  turtle: { name: '慢慢', kind: '長壽龜', sound: '（慢慢點頭）', trait: '不急不徐，最常說「慢慢來就好」' },
};

// 照顧互動：每個照顧動作都對應一個健康行為
export const CARE = [
  { id: 'hello', icon: '👋', label: '打招呼', sub: '說說今天的心情', go: 'mood' },
  { id: 'exercise', icon: '🤸', label: '一起運動', sub: '在家輕鬆動一動', go: 'forest' },
  { id: 'walk', icon: '🚶', label: '出門散步', sub: '帶牠去外面走走', go: 'walk', only: ['dog', 'cat', 'turtle'] },
  { id: 'bath', icon: '🫧', label: '洗澎澎', sub: '1 分鐘呼吸放鬆', go: 'breathe' },
  { id: 'meditate', icon: '🍃', label: '一起靜坐', sub: '3 分鐘安靜時光', go: 'meditate' },
  { id: 'treat', icon: '🍪', label: '吃點心', sub: '用心動點數換', act: 'feedPet' },
];

// 吃過幾次點心會學會的把戲（只增不減）
export const TRICKS = [
  { at: 1, name: '開心打招呼' }, { at: 3, name: '握手' }, { at: 6, name: '轉圈圈' },
  { at: 10, name: '跳舞' }, { at: 15, name: '送你一朵花' },
];

// 各畫面的陪伴台詞（{call} = 寵物怎麼稱呼主人）
const LINES = {
  today: ['{call}，今天也很高興見到你！', '{call}，要不要跟我一起動一動？', '我在花園等你好久了～'],
  lake: ['{call}，心裡有什麼都可以跟我說。', '我們一起慢慢呼吸，好嗎？'],
  breathe: ['跟著圓圈，慢慢吸氣、慢慢吐氣～', '泡泡好舒服，我們一起放鬆。'],
  meditate: ['我陪你一起安靜坐一下。', '眼睛可以睜著，舒服就好。'],
  forest: ['{call}，選一個今天想做的動作吧！', '我在旁邊陪你一起做！'],
  activities: ['{call}，選一個今天想做的動作吧！', '慢慢做，舒服最重要。'],
  check: ['回答完，我們就知道今天適合做什麼了。'],
  checkSummary: ['看看有沒有選錯，沒問題就送出！'],
  player: ['一起數！一、二、三！', '做得很好，累了就休息喔。'],
  walk: ['要出門了嗎？我好期待！', '記得穿好走的鞋子喔。'],
  walking: ['走慢一點沒關係，我陪著你。', '看路就好，不用一直看我。'],
  reward: ['好棒！花園又開了一朵花！', '{call}最厲害了！'],
  garden: ['這是我們一起種的花園！'], week: ['看看我們這週一起做了什麼！'], oasis: ['生命之樹又長大了一點！'],
  knowledge: ['我也想學！讀一張給我聽好嗎？'], card: ['原來是這樣，我學到了！'],
  chat: ['想聊什麼都可以，按住麥克風跟我說也行！'],
  settings: ['想改什麼都可以，我會記得的。'], reminders: ['設定好時間，我會準時提醒你！'],
  petHome: ['這是我的小屋！{call}要陪我做什麼呢？'],
  mood: ['今天心情怎麼樣？跟我說說。'],
};
export function petLine(screen, call, seed = 0) {
  const list = LINES[screen] || LINES.today;
  return list[seed % list.length].replaceAll('{call}', call || '你');
}

// ---------- 原創造型 ----------
export function petSVG(type, size = 96, { mood = 'happy' } = {}) {
  const eyes = mood === 'calm'
    ? '<path d="M36 50 q5 -4 10 0 M54 50 q5 -4 10 0" stroke="#2B2420" stroke-width="3" fill="none" stroke-linecap="round"/>'
    : '<circle cx="41" cy="50" r="4.2" fill="#2B2420"/><circle cx="59" cy="50" r="4.2" fill="#2B2420"/><circle cx="42.4" cy="48.4" r="1.4" fill="#fff"/><circle cx="60.4" cy="48.4" r="1.4" fill="#fff"/>';
  const blush = '<ellipse cx="33" cy="60" rx="5" ry="3" fill="#F59A92" opacity=".55"/><ellipse cx="67" cy="60" rx="5" ry="3" fill="#F59A92" opacity=".55"/>';
  let body = '';
  if (type === 'dog') {
    body = `<ellipse cx="50" cy="96" rx="26" ry="5" fill="#000" opacity=".12"/>
      <path d="M78 74 q16 -8 10 -22 q-2 10 -12 12z" fill="#C98B4A"/>
      <ellipse cx="50" cy="78" rx="24" ry="17" fill="#D9A15F"/><ellipse cx="50" cy="82" rx="13" ry="10" fill="#F3DDB8"/>
      <rect x="32" y="84" width="9" height="12" rx="4" fill="#C98B4A"/><rect x="59" y="84" width="9" height="12" rx="4" fill="#C98B4A"/>
      <path d="M24 34 L30 10 L44 30Z" fill="#B87A3C"/><path d="M76 34 L70 10 L56 30Z" fill="#B87A3C"/>
      <circle cx="50" cy="50" r="27" fill="#D9A15F"/><ellipse cx="50" cy="62" rx="15" ry="11" fill="#F3DDB8"/>
      <ellipse cx="50" cy="57" rx="5" ry="3.6" fill="#2B2420"/><path d="M45 64 q5 5 10 0" stroke="#2B2420" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
  } else if (type === 'cat') {
    const stripes = '<path d="M38 26 q12 4 24 0 M36 32 q14 5 28 0" stroke="#8A5A2E" stroke-width="3" fill="none" stroke-linecap="round" opacity=".7"/>';
    body = `<ellipse cx="50" cy="96" rx="24" ry="5" fill="#000" opacity=".12"/>
      <path d="M74 86 q22 2 16 -22 q-4 8 -16 12z" fill="#D89A55"/>
      <ellipse cx="50" cy="80" rx="22" ry="16" fill="#E6AE6A"/><ellipse cx="50" cy="84" rx="12" ry="9" fill="#FBEBD3"/>
      <path d="M26 36 L28 12 L44 28Z" fill="#E6AE6A"/><path d="M74 36 L72 12 L56 28Z" fill="#E6AE6A"/>
      <path d="M30 32 L31 18 L40 28Z" fill="#F7B9B3"/><path d="M70 32 L69 18 L60 28Z" fill="#F7B9B3"/>
      <circle cx="50" cy="50" r="26" fill="#E6AE6A"/>${stripes}<ellipse cx="50" cy="61" rx="13" ry="9" fill="#FBEBD3"/>
      <path d="M47 57 L53 57 L50 60Z" fill="#E07A7A"/><path d="M50 60 q-4 5 -8 2 M50 60 q4 5 8 2" stroke="#2B2420" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M30 60 L18 57 M30 63 L18 65 M70 60 L82 57 M70 63 L82 65" stroke="#8A5A2E" stroke-width="1.5"/>`;
  } else {
    body = `<ellipse cx="50" cy="96" rx="30" ry="5" fill="#000" opacity=".12"/>
      <ellipse cx="22" cy="86" rx="8" ry="6" fill="#8FC48A"/><ellipse cx="78" cy="86" rx="8" ry="6" fill="#8FC48A"/>
      <path d="M14 80 Q50 40 86 80 Q50 92 14 80Z" fill="#5E9C6A"/>
      <path d="M30 70 L40 58 L60 58 L70 70 L50 78Z M24 78 L30 70 M76 78 L70 70" stroke="#3E7A4E" stroke-width="2.5" fill="none" stroke-linejoin="round"/>
      <circle cx="50" cy="44" r="22" fill="#8FC48A"/><ellipse cx="50" cy="54" rx="12" ry="7" fill="#B8DDB0"/>
      <path d="M44 56 q6 5 12 0" stroke="#2B2420" stroke-width="2.4" fill="none" stroke-linecap="round"/>`;
    return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${body}${eyes.replace(/cy="50"/g, 'cy="44"').replace(/48\.4/g, '42.4').replace(/q5 -4 10 0/g, 'q5 -4 10 0')}${blush.replace(/cy="60"/g, 'cy="52"')}</svg>`;
  }
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true">${body}${eyes}${blush}</svg>`;
}

// 依所剩點數與累積點心數，計算可以吃的點心與已學會的把戲
export function petStats(state) {
  const p = state.pet || { treats: 0, spent: 0 };
  const earned = state.sessions.length * 2 + state.breaths.length + (state.meditations || []).length + state.moods.length;
  return { points: Math.max(0, earned - p.spent), treats: p.treats, tricks: TRICKS.filter(t => p.treats >= t.at) };
}
