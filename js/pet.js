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

// ---------- 原創造型：文青繪本風（圓潤線條、柔和平塗、腮紅、小配件） ----------
// 阿福＝台灣黑土狗（四眼眉斑、圓眼鏡、卡其格紋圍巾、捧著熱茶、身邊一本書）
// 柑仔＝橘白米克斯貓（磚紅格紋圍巾）；慢慢＝台灣斑龜（暖黃毛線帽）
// 全部原創；不用粗黑漫畫框，線條是暖褐墨色、圓角收尾
// 團隊色鉛筆繪本風圖檔（有圖就用圖，沒有就用下面的向量版）
// 團隊色鉛筆繪本風圖檔：坐姿（sit）、開心（happy）、睡覺（sleep）、走路（walk，朝右）
const POSES = ['sit', 'happy', 'sleep', 'walk'];
const IMG = t => Object.fromEntries(POSES.map(k => [k, `img/pets/${t}_${k === 'sit' ? 'pick' : k}.webp`]));
export const PET_IMG = { dog: IMG('dog'), cat: IMG('cat'), turtle: IMG('turtle') };
// mood：calm＝睡覺、cheer＝開心揮手、walk＝走路、其他＝坐著
const MOOD_POSE = { calm: 'sleep', sleep: 'sleep', cheer: 'happy', happy: 'sit', walk: 'walk' };
export function petSVG(type, size = 96, { mood = 'happy' } = {}) {
  const set = PET_IMG[type];
  if (set) { const pose = MOOD_POSE[mood] || 'sit'; return `<img class="pet-svg pet-img pet-${type} pose-${pose} mood-${mood}" src="${set[pose]}" width="${size}" height="${size}" alt="" decoding="async" draggable="false">`; }
  return petVector(type, size, { mood });
}
export function petVector(type, size = 96, { mood = 'happy' } = {}) {
  const L = '#2E241E';
  const ln = (w = 1.8, c = L) => `fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
  const fl = (c, w = 1.8) => `fill="${c}" stroke="${L}" stroke-width="${w}" stroke-linejoin="round"`;
  const calm = mood === 'calm';
  const eyes = (lx, rx, y, r = 3.6, lidC = L) => calm
    ? `<path d="M${lx - 3.5} ${y} q3.5 3 7 0 M${rx - 3.5} ${y} q3.5 3 7 0" ${ln(1.9, lidC)}/>`
    : `<g class="pt-eye"><circle cx="${lx}" cy="${y}" r="${r}" fill="#1B1512"/><circle cx="${rx}" cy="${y}" r="${r}" fill="#1B1512"/><circle cx="${lx + 1.2}" cy="${y - 1.3}" r="${r * .38}" fill="#fff"/><circle cx="${rx + 1.2}" cy="${y - 1.3}" r="${r * .38}" fill="#fff"/><circle cx="${lx - 1.2}" cy="${y + 1.4}" r="${r * .16}" fill="#fff" opacity=".8"/><circle cx="${rx - 1.2}" cy="${y + 1.4}" r="${r * .16}" fill="#fff" opacity=".8"/></g>`;
  const blush = (lx, rx, y) => `<ellipse cx="${lx}" cy="${y}" rx="4.6" ry="2.8" fill="#EE8E7C" opacity=".6"/><ellipse cx="${rx}" cy="${y}" rx="4.6" ry="2.8" fill="#EE8E7C" opacity=".6"/>`;
  // 格紋圍巾：底色＋兩組細格線，右邊垂下一截有流蘇
  const scarf = (base, c1, c2, y = 62) => `
    <path d="M60 ${y + 3} L67 ${y + 22} L59 ${y + 24} L54 ${y + 6}Z" ${fl(base, 1.6)}/>
    <path d="M58 ${y + 9} L63.5 ${y + 8} M60 ${y + 15} L65.5 ${y + 14} M61 ${y + 6} L65 ${y + 21}" ${ln(1.2, c1)}/>
    <path d="M59.5 ${y + 24.5} l-.6 2.6 M62 ${y + 24} l-.3 2.6 M64.5 ${y + 23.3} l0 2.6 M66.8 ${y + 22.6} l.4 2.4" ${ln(1.1, base)}/>
    <path d="M29 ${y - 2} Q50 ${y + 9} 71 ${y - 2} L72 ${y + 6} Q50 ${y + 17} 28 ${y + 6}Z" ${fl(base, 1.6)}/>
    <path d="M30 ${y + 2} Q50 ${y + 12} 71 ${y + 2}" ${ln(1.3, c1)}/><path d="M38 ${y + 1} l-1 7 M46 ${y + 3} l-.5 8 M54 ${y + 3} l.5 8 M62 ${y + 1} l1 7" ${ln(1.1, c1)}/>
    <path d="M42 ${y + 2} l-.6 7 M58 ${y + 2} l.6 7" ${ln(.8, c2)}/>`;
  let art = '';
  if (type === 'dog') {
    const K = '#2B2724', K2 = '#3D3833', TAN = '#C98F55';
    art = `<ellipse cx="52" cy="97" rx="30" ry="3.4" fill="#3B2E28" opacity=".14"/>
      <!-- 一本精裝書 -->
      <g transform="rotate(-6 82 92)"><rect x="72" y="88" width="20" height="8" rx="1.4" ${fl('#3E6B5A', 1.5)}/><rect x="73.5" y="92.6" width="17" height="2.2" fill="#F3ECDD"/><path d="M76 90.5 h8" ${ln(1, '#C9A46A')}/></g>
      <g class="pt-tail" style="transform-origin:66px 86px"><path d="M64 88 C78 88 84 76 80 64 C79 61 75 62 76 65 C78 74 74 81 63 82Z" ${fl(K)}/></g>
      <path d="M30 96 C27 78 36 65 50 65 C64 65 73 78 70 96Z" ${fl(K)}/>
      <path d="M41 80 C44 74 56 74 59 80 C60 88 56 94 50 94 C44 94 40 88 41 80Z" fill="${K2}"/>
      <ellipse cx="39" cy="95" rx="7.5" ry="4.2" ${fl(K, 1.6)}/><ellipse cx="61" cy="95" rx="7.5" ry="4.2" ${fl(K, 1.6)}/>
      <path d="M36 94.5 v2 M39 94 v2.4 M58 94 v2.4 M61 94.5 v2" ${ln(1, '#5A524B')}/>
      ${scarf('#CFAE74', '#3F6B4E', '#B8553D')}
      <!-- 捧著冒熱氣的馬克杯 -->
      <g class="pt-steam" opacity=".7"><path d="M46 72 q-2 -3 0 -5 q2 -3 0 -5 M53 72 q-2 -3 0 -5 q2 -3 0 -5" ${ln(1.3, '#B8ADA0')}/></g>
      <path d="M57 78 q6 0 6 4.5 q0 4.5 -6 4.5" ${ln(2, L)}/><path d="M57 78.4 q5.2 0 5.2 4.1 q0 4.1 -5.2 4.1" ${ln(1, '#F3ECDD')}/>
      <rect x="42.5" y="74.5" width="15" height="14" rx="2.6" ${fl('#F3ECDD', 1.6)}/><path d="M42.8 81 h14.4" ${ln(2.4, '#C8432B')}/>
      <ellipse cx="41" cy="83" rx="4.6" ry="3.8" ${fl(K, 1.5)}/><ellipse cx="59" cy="83.5" rx="4.6" ry="3.8" ${fl(K, 1.5)}/>
      <g class="pt-head" style="transform-origin:50px 62px">
        <path d="M29 38 C25 26 27 14 31 11 C35 12 42 20 45 26Z" ${fl(K)}/><path d="M71 38 C75 26 73 14 69 11 C65 12 58 20 55 26Z" ${fl(K)}/>
        <path d="M32 31 C31 24 31.5 18 33 16 C36 19 39 23 40 26Z M68 31 C69 24 68.5 18 67 16 C64 19 61 23 60 26Z" fill="#6B4E48"/>
        <ellipse cx="50" cy="42" rx="24.5" ry="21" ${fl(K)}/>
        <ellipse cx="50" cy="52.5" rx="11" ry="7.6" fill="${K2}"/>
        <ellipse cx="40.5" cy="32.5" rx="3.4" ry="2.2" fill="${TAN}"/><ellipse cx="59.5" cy="32.5" rx="3.4" ry="2.2" fill="${TAN}"/>
        ${eyes(41, 59, 41.5, 3.6, '#E9DFD0')}
        <g class="pt-glasses"><circle cx="41" cy="41.5" r="7.4" fill="#FFFFFF" fill-opacity=".12" stroke="#FBF6EA" stroke-width="2.1"/><circle cx="59" cy="41.5" r="7.4" fill="#FFFFFF" fill-opacity=".12" stroke="#FBF6EA" stroke-width="2.1"/><path d="M48.4 40.6 q1.6 -1.6 3.2 0 M33.6 40 l-7 -2 M66.4 40 l7 -2" ${ln(2, '#FBF6EA')}/><path d="M36.6 37.8 l2.6 -2 M54.6 37.8 l2.6 -2" ${ln(1.2, '#fff')} opacity=".85"/></g>
        ${blush(31.5, 68.5, 50)}
        <path d="M46.6 49.4 q3.4 -1.8 6.8 0 q-.5 3 -3.4 3.6 q-2.9 -.6 -3.4 -3.6z" fill="#120E0C"/><ellipse cx="48.6" cy="49.9" rx="1.1" ry=".6" fill="#fff" opacity=".6"/>
        <path d="M46 55 q2 2 4 0 q2 2 4 0" ${ln(1.4, '#9C8E80')}/>
        ${calm ? '' : '<path d="M48.3 56.2 q1.7 3.6 3.4 0z" fill="#E98A86"/>'}
      </g>`;
  } else if (type === 'cat') {
    const O = '#E8A160', OD = '#C47A3C', W = '#FBF4E8';
    art = `<ellipse cx="50" cy="97" rx="26" ry="3.4" fill="#3B2E28" opacity=".14"/>
      <g class="pt-tail" style="transform-origin:66px 90px"><path d="M64 92 C82 93 86 80 80 68 C78 65 74 66 75 69 C79 78 76 86 63 86Z" ${fl(O)}/><path d="M79 72 l4 -1 M80 79 l4 0" ${ln(2, OD)}/></g>
      <path d="M31 96 C28 79 37 66 50 66 C63 66 72 79 69 96Z" ${fl(O)}/>
      <path d="M40 96 C38 84 43 74 50 74 C57 74 62 84 60 96Z" fill="${W}"/>
      <path d="M33 80 l5 1 M32 86 l5 .5 M67 80 l-5 1 M68 86 l-5 .5" ${ln(2, OD)}/>
      <ellipse cx="42" cy="94.8" rx="6.6" ry="4" ${fl(W, 1.6)}/><ellipse cx="58" cy="94.8" rx="6.6" ry="4" ${fl(W, 1.6)}/>
      ${scarf('#C8573C', '#F3E2C2', '#2F5B4E', 63)}
      <g class="pt-head" style="transform-origin:50px 63px">
        <path d="M28 36 C26 25 27 16 30 12 C35 14 41 20 44 25Z" ${fl(O)}/><path d="M72 36 C74 25 73 16 70 12 C65 14 59 20 56 25Z" ${fl(O)}/>
        <path d="M31.5 29 C31 23 31.5 19 32.5 17 C35 19 38 22 39.5 25Z M68.5 29 C69 23 68.5 19 67.5 17 C65 19 62 22 60.5 25Z" fill="#F2B3A6"/>
        <ellipse cx="50" cy="43" rx="24" ry="20.5" ${fl(O)}/>
        <path d="M50 37 C45 37 42 42 40 46 C35 47 31 49 30 52 C34 59 42 63 50 63 C58 63 66 59 70 52 C69 49 65 47 60 46 C58 42 55 37 50 37Z" fill="${W}"/>
        <path d="M45 24 l1.3 5 M50 23 v6 M55 24 l-1.3 5 M27.5 40 l4.5 .5 M72.5 40 l-4.5 .5" ${ln(2.2, OD)}/>
        ${eyes(41, 59, 43, 3.8)}
        ${blush(33, 67, 50.5)}
        <path d="M47.5 48.4 h5 l-2.5 2.6z" fill="#E98A86" stroke="${L}" stroke-width="1" stroke-linejoin="round"/>
        <path d="M50 51 q-1.6 2.6 -4 1.4 M50 51 q1.6 2.6 4 1.4" ${ln(1.4)}/>
        <path d="M33 50 L23 48.5 M33 53 L23 54 M67 50 L77 48.5 M67 53 L77 54" ${ln(1, '#8A6A55')}/>
      </g>`;
  } else {
    const G = '#93A862', GD = '#6C8343', SK = '#C3C98E', Y = '#E0A93F';
    art = `<ellipse cx="50" cy="96" rx="34" ry="3.4" fill="#3B2E28" opacity=".14"/>
      <ellipse cx="22" cy="91" rx="7" ry="4.6" ${fl(SK, 1.6)}/><ellipse cx="78" cy="91" rx="7" ry="4.6" ${fl(SK, 1.6)}/>
      <path d="M13 87 C18 58 82 58 87 87 C72 94 28 94 13 87Z" ${fl(G)}/>
      <path d="M36 74 L42 64 L58 64 L64 74 L50 81Z" fill="${GD}" opacity=".55"/><path d="M36 74 L42 64 L58 64 L64 74 L50 81Z M22 83 L36 74 M78 83 L64 74 M50 81 V90 M42 64 L37 59 M58 64 L63 59" ${ln(1.4, '#4E6034')}/>
      <path d="M14 87 C30 93 70 93 86 87" ${ln(3, Y)}/>
      <g class="pt-head" style="transform-origin:50px 62px">
        <ellipse cx="50" cy="44" rx="17.5" ry="15.5" ${fl(SK)}/>
        <path d="M33 39 C33 27 41 22 50 22 C59 22 67 27 67 39 C62 35 38 35 33 39Z" ${fl(Y, 1.6)}/>
        <path d="M37 33 v4 M42 30 v5 M47 29 v5 M53 29 v5 M58 30 v5 M63 33 v4" ${ln(1.1, '#B5802A')}/>
        <circle cx="50" cy="20" r="4" ${fl('#C8432B', 1.5)}/>
        ${eyes(43.5, 56.5, 45, 3.2)}
        ${blush(38, 62, 51)}
        <path d="M45.5 51.5 q4.5 3.2 9 0" ${ln(1.6)}/>
      </g>
      <path d="M50 96 q-1 -6 2 -9 M52 87 q4 -3 7 -1 q-3 3 -7 1z M51 90 q-4 -3 -7 -1 q3 3 7 1z" ${ln(1.2, '#3F6E3A')} fill="#8CB85A"/>`;
  }
  return `<svg class="pet-svg pet-${type}" viewBox="0 0 100 100" width="${size}" height="${size}" aria-hidden="true" overflow="visible">${art}</svg>`;
}

// ---------- 手繪插畫圖檔（色鉛筆風，團隊自製） ----------
// 把圖檔放進 img/pets/，檔名照下面填好就會自動使用；沒有圖檔時改用上面的向量圖。
// 姿勢：sit（坐著）、happy（開心）、sleep（睡覺）、walk（走路）
export const PET_ART = PET_IMG;
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
  const earned = state.sessions.length * 2 + state.breaths.length + (state.meditations || []).length + state.moods.length + drinkPts + ((state.journey && state.journey.pts) || 0) + ((state.games && state.games.pts) || 0); // 迺台灣與遊戲館動腦小卡的點數也能換零食
  return { points: Math.max(0, earned - p.spent), treats: p.treats, tricks: TRICKS.filter(t => p.treats >= t.at) };
}
