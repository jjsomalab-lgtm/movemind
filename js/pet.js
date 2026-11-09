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
  // 開頭問候另外處理
  const list = LINES[screen] || LINES.today;
  return list[seed % list.length].replaceAll('{call}', call || '你');
}

// ---------- 原創造型：美式卡通風（粗描邊、大眼睛、會眨眼、會搖尾巴） ----------
const OL = '#3B2A20'; // 描邊色
export function petSVG(type, size = 96, { mood = 'happy' } = {}) {
  const eye = (cx, cy, r = 7.5) => mood === 'calm'
    ? `<path d="M${cx - 6} ${cy} q6 -5 12 0" stroke="${OL}" stroke-width="3.2" fill="none" stroke-linecap="round"/>`
    : `<g class="pt-eye"><ellipse cx="${cx}" cy="${cy}" rx="${r}" ry="${r * 1.15}" fill="#fff" stroke="${OL}" stroke-width="2.6"/><ellipse cx="${cx + 1}" cy="${cy + 1.5}" rx="${r * .58}" ry="${r * .7}" fill="${OL}"/><circle cx="${cx + 2.6}" cy="${cy - 1.8}" r="${r * .28}" fill="#fff"/></g>`;
  const cheeks = (y) => `<ellipse cx="30" cy="${y}" rx="5.5" ry="3.4" fill="#FF8F86" opacity=".6"/><ellipse cx="70" cy="${y}" rx="5.5" ry="3.4" fill="#FF8F86" opacity=".6"/>`;
  const S = `stroke="${OL}" stroke-width="3" stroke-linejoin="round"`;
  let art = '';
  if (type === 'dog') {
    art = `<ellipse cx="50" cy="97" rx="24" ry="4" fill="#000" opacity=".14"/>
      <g class="pt-tail" style="transform-origin:72px 78px"><path d="M72 80 q18 -6 16 -24 q-8 4 -6 12 q-4 8 -14 8z" fill="#D9963F" ${S}/></g>
      <path d="M28 96 q-2 -26 22 -28 q24 2 22 28z" fill="#E8A24F" ${S}/><ellipse cx="50" cy="86" rx="11" ry="9" fill="#FFF1DA"/>
      <ellipse cx="36" cy="95" rx="7" ry="4.5" fill="#E8A24F" ${S}/><ellipse cx="64" cy="95" rx="7" ry="4.5" fill="#E8A24F" ${S}/>
      <g class="pt-head" style="transform-origin:50px 64px">
        <path d="M20 40 L22 6 L42 26z" fill="#D9963F" ${S}/><path d="M80 40 L78 6 L58 26z" fill="#D9963F" ${S}/><path d="M25 32 L26 15 L36 26z" fill="#F7C9B8"/><path d="M75 32 L74 15 L64 26z" fill="#F7C9B8"/>
        <ellipse cx="50" cy="44" rx="30" ry="27" fill="#E8A24F" ${S}/>
        <ellipse cx="50" cy="56" rx="17" ry="12" fill="#FFF1DA" stroke="${OL}" stroke-width="2"/>
        ${eye(38, 40)}${eye(62, 40)}
        <ellipse cx="50" cy="50" rx="6" ry="4.2" fill="${OL}"/><circle cx="48" cy="48.6" r="1.4" fill="#fff"/>
        <path d="M43 57 q7 6 14 0" stroke="${OL}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
        <path d="M47 59 q3 9 6 0z" fill="#FF7B7B" stroke="${OL}" stroke-width="2"/>${cheeks(54)}
      </g>`;
  } else if (type === 'cat') {
    art = `<ellipse cx="50" cy="97" rx="22" ry="4" fill="#000" opacity=".14"/>
      <g class="pt-tail" style="transform-origin:70px 88px"><path d="M70 90 q26 0 20 -30 q-2 -6 -6 -2 q4 22 -14 24z" fill="#F0A955" ${S}/></g>
      <path d="M30 96 q-2 -24 20 -26 q22 2 20 26z" fill="#F0A955" ${S}/><ellipse cx="50" cy="87" rx="10" ry="8" fill="#FFF3E2"/>
      <ellipse cx="38" cy="95" rx="6.5" ry="4" fill="#F0A955" ${S}/><ellipse cx="62" cy="95" rx="6.5" ry="4" fill="#F0A955" ${S}/>
      <g class="pt-head" style="transform-origin:50px 64px">
        <path d="M22 36 L22 8 L44 24z" fill="#F0A955" ${S}/><path d="M78 36 L78 8 L56 24z" fill="#F0A955" ${S}/><path d="M26 28 L26 15 L36 24z" fill="#FFB8B0"/><path d="M74 28 L74 15 L64 24z" fill="#FFB8B0"/>
        <ellipse cx="50" cy="44" rx="30" ry="26" fill="#F0A955" ${S}/>
        <path d="M40 22 q10 5 20 0 M37 29 q13 6 26 0" stroke="#B86F2A" stroke-width="3.2" fill="none" stroke-linecap="round"/>
        <ellipse cx="50" cy="55" rx="14" ry="9" fill="#FFF3E2" stroke="${OL}" stroke-width="2"/>
        ${eye(37, 42, 8)}${eye(63, 42, 8)}
        <path d="M46 51 L54 51 L50 55z" fill="#FF7B8A" stroke="${OL}" stroke-width="1.8" stroke-linejoin="round"/>
        <path d="M50 55 q-3 5 -7 2 M50 55 q3 5 7 2" stroke="${OL}" stroke-width="2.4" fill="none" stroke-linecap="round"/>
        <path d="M24 52 L10 49 M24 56 L10 58 M76 52 L90 49 M76 56 L90 58" stroke="${OL}" stroke-width="1.8" stroke-linecap="round"/>${cheeks(54)}
      </g>`;
  } else {
    art = `<ellipse cx="50" cy="97" rx="30" ry="4" fill="#000" opacity=".14"/>
      <ellipse cx="22" cy="90" rx="8" ry="6" fill="#9CD08F" ${S}/><ellipse cx="78" cy="90" rx="8" ry="6" fill="#9CD08F" ${S}/>
      <path d="M12 86 Q50 36 88 86 Q50 96 12 86Z" fill="#5FA867" ${S}/>
      <path d="M32 74 L42 60 L58 60 L68 74 L50 82Z" fill="#7DBE76" stroke="#2F6B3A" stroke-width="2.6" stroke-linejoin="round"/>
      <path d="M22 82 L32 74 M78 82 L68 74 M50 82 L50 90" stroke="#2F6B3A" stroke-width="2.6"/>
      <g class="pt-head" style="transform-origin:50px 60px">
        <ellipse cx="50" cy="40" rx="24" ry="22" fill="#9CD08F" ${S}/>
        ${eye(41, 37, 7)}${eye(59, 37, 7)}
        <path d="M43 50 q7 6 14 0" stroke="${OL}" stroke-width="2.8" fill="none" stroke-linecap="round"/>
        <ellipse cx="30" cy="46" rx="5" ry="3" fill="#FF8F86" opacity=".6"/><ellipse cx="70" cy="46" rx="5" ry="3" fill="#FF8F86" opacity=".6"/>
      </g>`;
  }
  return `<svg class="pet-svg pet-${type}" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true" overflow="visible">${art}</svg>`;
}

// 依所剩點數與累積點心數，計算可以吃的點心與已學會的把戲
export function petStats(state) {
  const p = state.pet || { treats: 0, spent: 0 };
  // 喝水每天最多算 4 點，避免一直按
  const byDay = {}; (state.drinks || []).forEach(d => { const k = d.at.slice(0, 10); byDay[k] = Math.min(4, (byDay[k] || 0) + 1); });
  const drinkPts = Object.values(byDay).reduce((x, y) => x + y, 0);
  const earned = state.sessions.length * 2 + state.breaths.length + (state.meditations || []).length + state.moods.length + drinkPts;
  return { points: Math.max(0, earned - p.spent), treats: p.treats, tricks: TRICKS.filter(t => p.treats >= t.at) };
}
