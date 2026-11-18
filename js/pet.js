// 心動夥伴：住在心動花園裡的電子寵物（原創角色）
// 原則：寵物是陪伴者，不是監督者。永遠健康、不會餓、不會生病、不責備；只算累積，不算連續天數。
export const PETS = {
  dog: { name: '阿福', kind: '台灣黑土狗', sound: '汪！', trait: '忠心、熱情、愛散步，最喜歡陪你出門走走' },
  cat: { name: '柑仔', kind: '橘白米克斯貓', sound: '喵～', trait: '溫柔慢條斯理，愛曬太陽，陪你在家伸展放鬆' },
  turtle: { name: '慢慢', kind: '台灣斑龜', sound: '（慢慢點頭）', trait: '不急不徐，最常說「慢慢來就好」' },
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
  // 開頭問候另外處理
  const list = LINES[screen] || LINES.today;
  return list[seed % list.length].replaceAll('{call}', call || '你');
}

// ---------- 原創造型：台灣懷舊手繪風（水彩平塗、鉛筆細線、局部網點、套色微偏移） ----------
// 阿福＝台灣黑土狗（四眼眉斑、立耳、鐮刀尾、紅項圈）；柑仔＝橘白米克斯貓；慢慢＝台灣斑龜
// 濾鏡與網點定義在 art.js 的 paperDefs()（全站只放一次，不重複建立濾鏡）
export function petSVG(type, size = 96, { mood = 'happy' } = {}) {
  // 鉛筆線：細、帶輕微抖動（mmWobble），顏色依角色變化，不用粗黑描邊
  const line = (c, w = 1.4) => `fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="14 1.6 6 1.2" opacity=".9"`;
  // 水彩色塊：主色＋偏移的淡色暈染
  const wash = (d, c, c2, light = false) => `<path d="${d}" fill="${c2}" opacity=".5" transform="translate(.9 .7)"/><path d="${d}" fill="${c}"/><path d="${d}" fill="url(#${light ? 'mmHatchLight' : 'mmHatch'})"/>`;
  const eye = (cx, cy, iris, slit, lineC) => mood === 'calm'
    ? `<path d="M${cx - 4.5} ${cy} q4.5 -3.5 9 0" ${line(lineC, 1.8)}/>`
    : `<g class="pt-eye"><ellipse cx="${cx}" cy="${cy}" rx="3.6" ry="${slit ? 3.6 : 3.2}" fill="${iris}"/>${slit ? `<ellipse cx="${cx}" cy="${cy}" rx=".9" ry="3" fill="#2A2622"/>` : `<circle cx="${cx}" cy="${cy}" r="1.9" fill="#1E1C1A"/>`}<circle cx="${cx + .9}" cy="${cy - 1.1}" r=".9" fill="#FFF8EC"/></g>`;
  let art = '';
  if (type === 'dog') {
    const K = '#393733', K2 = '#5B5852', L = '#1D1C1A', MIST = '#91A9AF';
    art = `<ellipse cx="50" cy="97" rx="24" ry="3" fill="#414641" opacity=".14"/>
      <g class="pt-tail" style="transform-origin:68px 80px">${wash('M67 84 c14 -2 20 -12 17 -26 c-1 -4 -6 -4 -6 0 c1 10 -4 17 -12 20z', K, K2, true)}<path d="M67 84 c14 -2 20 -12 17 -26" ${line(L)}/></g>
      ${wash('M32 96 c-2 -14 3 -27 18 -29 c15 2 20 15 18 29z', K, K2, true)}
      <path d="M32 96 c-2 -14 3 -27 18 -29 c15 2 20 15 18 29" ${line(L)}/>
      <path d="M34 92 c2 -10 5 -16 9 -19" fill="url(#mmDotsLight)" stroke="none"/>
      <path d="M61 74 c4 5 5 12 4 19" ${line(MIST, 1.3)} opacity=".8"/>
      <path d="M41 96 c0 -7 1 -11 2 -14 M59 96 c0 -7 -1 -11 -2 -14" ${line(L, 1.3)} opacity=".7"/>
      <path d="M35 69 c10 5 20 5 30 0 l-3 4 c-3 3 -7 9 -12 12 c-5 -3 -9 -9 -12 -12z" fill="#BC725F"/><path d="M35 69 c10 5 20 5 30 0 l-3 4 c-3 3 -7 9 -12 12 c-5 -3 -9 -9 -12 -12z" fill="url(#mmHatch)"/><g fill="#F5E6CC" opacity=".85"><circle cx="44" cy="74" r="1.2"/><circle cx="50" cy="76" r="1.4"/><circle cx="56" cy="74" r="1.2"/><circle cx="50" cy="80" r="1"/></g><path d="M35 69 c10 5 20 5 30 0" fill="none" stroke="#8E4E3E" stroke-width="1.1" opacity=".8"/>
      <g transform="translate(0 6)"><g class="pt-head" style="transform-origin:50px 62px">
        ${wash('M28 34 L31 10 L44 24z', K, K2, true)}${wash('M72 34 L69 10 L56 24z', K, K2, true)}
        <path d="M28 34 L31 10 L44 24 M72 34 L69 10 L56 24" ${line(L)}/>
        <path d="M32 28 L33 17 L39 24z M68 28 L67 17 L61 24z" fill="#5E4A44" opacity=".7"/>
        ${wash('M50 20 c13 0 21 9 21 20 c0 8 -4 13 -9 16 c-4 3 -8 4 -12 4 s-8 -1 -12 -4 c-5 -3 -9 -8 -9 -16 c0 -11 8 -20 21 -20z', K, K2, true)}
        <path d="M50 20 c13 0 21 9 21 20 c0 8 -4 13 -9 16 c-4 3 -8 4 -12 4 s-8 -1 -12 -4 c-5 -3 -9 -8 -9 -16 c0 -11 8 -20 21 -20z" ${line(L)}/>
        <path d="M66 27 c3 4 4 9 3 13" ${line(MIST, 1.3)} opacity=".8"/>
        <path d="M39 47 c7 -4 15 -4 22 0 c1 8 -4 12 -11 13 c-7 -1 -12 -5 -11 -13z" fill="#4E4A45"/>
        <ellipse cx="41" cy="33" rx="2.8" ry="1.8" fill="#B08A5A"/><ellipse cx="59" cy="33" rx="2.8" ry="1.8" fill="#B08A5A"/>
        ${eye(42, 39, '#A07440', false, '#D9D2C4')}${eye(58, 39, '#A07440', false, '#D9D2C4')}
        <path d="M46.5 47 q3.5 -2 7 0 q-.6 3 -3.5 3.6 q-2.9 -.6 -3.5 -3.6z" fill="#1A1917"/>
        <path d="M45.5 54 q2.2 2 4.5 0 q2.3 2 4.5 0" ${line('#CFC7B8', 1.4)}/>
        <path d="M48 55.4 q2 4.6 4 0z" fill="#C98580"/><circle cx="50.8" cy="56.6" r=".7" fill="#4A2E3A"/>
      </g></g>`;
  } else if (type === 'cat') {
    const O = '#CF8A52', O2 = '#E5B07E', W = '#F5EEDF', W2 = '#E6DCC6', L = '#6B4632', OD = '#A8673A';
    art = `<ellipse cx="50" cy="97" rx="22" ry="3" fill="#414641" opacity=".14"/>
      <g class="pt-tail" style="transform-origin:68px 88px">${wash('M67 90 c17 1 22 -10 18 -26 c-1 -4 -5 -3 -5 0 c2 13 -3 20 -13 21z', O, O2)}<path d="M67 90 c17 1 22 -10 18 -26" ${line(L)}/><path d="M80 70 l4 1 M81 78 l4 -1" ${line(OD, 1.6)}/></g>
      ${wash('M34 96 c-2 -14 3 -25 16 -27 c13 2 18 13 16 27z', O, O2)}
      ${wash('M42 96 c-1 -10 2 -16 8 -19 c6 3 9 9 8 19z', W, W2)}
      <path d="M34 96 c-2 -14 3 -25 16 -27 c13 2 18 13 16 27" ${line(L)}/>
      <path d="M60 74 c4 4 5 10 4 16" fill="none" stroke="url(#mmDots)" stroke-width="5"/>
      <ellipse cx="41" cy="95.5" rx="5" ry="2.8" fill="${W}"/><ellipse cx="59" cy="95.5" rx="5" ry="2.8" fill="${W}"/>
      <path d="M36 95.5 c1 -2 9 -2 10 0 M54 95.5 c1 -2 9 -2 10 0" ${line(L, 1.3)}/>
      <g transform="translate(0 7)"><g class="pt-head" style="transform-origin:50px 64px">
        ${wash('M29 33 L28 11 L43 23z', O, O2)}${wash('M71 33 L72 11 L57 23z', O, O2)}
        <path d="M29 33 L28 11 L43 23 M71 33 L72 11 L57 23" ${line(L)}/>
        <path d="M32 27 L31.5 17 L38 23z M68 27 L68.5 17 L62 23z" fill="#D9A79A" opacity=".8"/>
        ${wash('M50 21 c14 0 22 8 22 19 c0 11 -10 18 -22 18 s-22 -7 -22 -18 c0 -11 8 -19 22 -19z', O, O2)}
        ${wash('M50 36 c-4 0 -7 4 -9 7 c-4 1 -8 2 -9 5 c3 6 10 10 18 10 s15 -4 18 -10 c-1 -3 -5 -4 -9 -5 c-2 -3 -5 -7 -9 -7z', W, W2)}
        <path d="M50 21 c14 0 22 8 22 19 c0 11 -10 18 -22 18 s-22 -7 -22 -18 c0 -11 8 -19 22 -19z" ${line(L)}/>
        <path d="M45 23 l1.4 5 M50 22 v6 M55 23 l-1.4 5 M30 37 l4 .6 M70 37 l-4 .6" ${line(OD, 1.8)}/>
        <path d="M64 25 c5 4 7 9 7 14" fill="none" stroke="url(#mmDots)" stroke-width="4"/>
        ${eye(42, 40, '#A9AE52', true, L)}${eye(58, 40, '#A9AE52', true, L)}
        <path d="M47.6 47 h4.8 l-2.4 2.6z" fill="#C98580"/>
        <path d="M50 49.6 q-1.8 3 -4.4 1.6 M50 49.6 q1.8 3 4.4 1.6" ${line(L, 1.4)}/>
        <path d="M34 48 L22 46 M34 51 L22 52 M66 48 L78 46 M66 51 L78 52" ${line('#8A6A55', 1)}/>
      </g></g>`;
  } else {
    const G = '#7C9466', G2 = '#9DB384', SK = '#A9B88C', L = '#3F4F3A', Y = '#C9A46A';
    art = `<ellipse cx="50" cy="96" rx="30" ry="3" fill="#414641" opacity=".14"/>
      ${wash('M16 90 c0 -4 4 -7 9 -6 c4 1 5 5 3 8z', SK, G2)}${wash('M84 90 c0 -4 -4 -7 -9 -6 c-4 1 -5 5 -3 8z', SK, G2)}
      ${wash('M14 86 C22 56 78 56 86 86 C70 93 30 93 14 86Z', G, G2)}
      <path d="M14 86 C22 56 78 56 86 86 C70 93 30 93 14 86Z" fill="url(#mmDots)"/>
      <path d="M14 86 C22 56 78 56 86 86 C70 93 30 93 14 86Z" ${line(L)}/>
      <path d="M35 74 L42 64 L58 64 L65 74 L50 80Z M23 82 L35 74 M77 82 L65 74 M50 80 V89 M42 64 L38 58 M58 64 L62 58" ${line(L, 1.4)} opacity=".85"/>
      <path d="M15 86 C30 92 70 92 85 86" ${line(Y, 2.2)}/>
      <g transform="translate(0 9)"><g class="pt-head" style="transform-origin:50px 60px">
        ${wash('M50 22 c11 0 18 8 18 17 c0 10 -8 16 -18 16 s-18 -6 -18 -16 c0 -9 7 -17 18 -17z', SK, G2)}
        <path d="M50 22 c11 0 18 8 18 17 c0 10 -8 16 -18 16 s-18 -6 -18 -16 c0 -9 7 -17 18 -17z" ${line(L)}/>
        <path d="M36 34 q5 -2 8 1 M56 35 q3 -3 8 -1 M38 46 q3 2 6 0 M56 46 q3 2 6 0" ${line(Y, 1.8)}/>
        ${eye(43, 38, '#6A5230', false, L)}${eye(57, 38, '#6A5230', false, L)}
        <path d="M45 48 q5 3.5 10 0" ${line(L, 1.6)}/>
      </g></g>`;
  }
  return `<svg class="pet-svg pet-${type}" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true" overflow="visible"><g filter="url(#mmWobble)">${art}</g></svg>`;
}

// ---------- 手繪插畫圖檔（色鉛筆風，團隊自製） ----------
// 把圖檔放進 img/pets/，檔名照下面填好就會自動使用；沒有圖檔時改用上面的向量圖。
// 姿勢：sit（坐著）、happy（開心）、sleep（睡覺）、walk（走路）
export const PET_ART = {
  dog: { sit: 'img/pets/dog_sit.webp' },   // 待補：happy、sleep、walk
  cat: { sit: 'img/pets/cat_sit.webp', happy: 'img/pets/cat_happy.webp' },
  turtle: { sit: 'img/pets/turtle_sit.webp', happy: 'img/pets/turtle_happy.webp' },
};
export function petPortrait(type, pose = 'sit', size = 120) {
  const src = (PET_ART[type] || {})[pose] || (PET_ART[type] || {}).sit;
  if (!src) return petSVG(type, size, { mood: pose === 'sleep' ? 'calm' : 'happy' });
  return `<img class="pet-portrait pose-${pose}" src="${src}" width="${size}" height="${size}" alt="" loading="lazy" decoding="async">`;
}

// 依所剩點數與累積點心數，計算可以吃的點心與已學會的把戲
export function petStats(state) {
  const p = state.pet || { treats: 0, spent: 0 };
  // 喝水每天最多算 4 點，避免一直按
  const byDay = {}; (state.drinks || []).forEach(d => { const k = d.at.slice(0, 10); byDay[k] = Math.min(4, (byDay[k] || 0) + 1); });
  const drinkPts = Object.values(byDay).reduce((x, y) => x + y, 0);
  const earned = state.sessions.length * 2 + state.breaths.length + (state.meditations || []).length + state.moods.length + drinkPts + ((state.journey && state.journey.pts) || 0); // 迺台灣動腦小卡的點數也能換零食
  return { points: Math.max(0, earned - p.spent), treats: p.treats, tricks: TRICKS.filter(t => p.treats >= t.at) };
}
