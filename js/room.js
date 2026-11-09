// 心動夥伴的小屋：與現實時間、天氣同步的生活場景（原創繪製）
// 原則：沉浸感導向真實活動——長大、學把戲、布置小屋都靠一起運動累積；晚上寵物會提醒主人早點休息。

// 依現實時間，寵物正在做什麼
export function lifeState(h = new Date().getHours()) {
  if (h >= 5 && h < 10) return { id: 'morning', spot: 'window', sleep: false, text: '在窗邊伸懶腰，看外面的天氣' };
  if (h >= 10 && h < 12) return { id: 'play', spot: 'center', sleep: false, text: '精神很好，在屋裡跑來跑去' };
  if (h >= 12 && h < 14) return { id: 'nap', spot: 'bed', sleep: true, text: '吃飽了，在小床上睡午覺' };
  if (h >= 14 && h < 17) return { id: 'play', spot: 'center', sleep: false, text: '在玩，等你一起動一動' };
  if (h >= 17 && h < 20) return { id: 'wait', spot: 'door', sleep: false, text: '坐在門口等你回來' };
  return { id: 'night', spot: 'bed', sleep: true, text: '睡著了，呼嚕呼嚕' };
}

// 成長：依親密度與吃過的點心累積（只會長大，不會倒退）
export function growth(pet) {
  const v = (pet.love || 0) + (pet.treats || 0);
  if (v < 8) return { id: 'baby', label: '幼年', scale: 0.78, next: 8 - v };
  if (v < 25) return { id: 'teen', label: '少年', scale: 0.9, next: 25 - v };
  return { id: 'adult', label: '成年', scale: 1, next: 0 };
}

// 小屋布置：用心動點數購買
export const SHOP = [
  { id: 'rug', name: '圓形地毯', cost: 3 }, { id: 'plant', name: '盆栽', cost: 3 }, { id: 'ball', name: '小皮球', cost: 3 },
  { id: 'lamp', name: '暖暖檯燈', cost: 4 }, { id: 'frame', name: '全家福相框', cost: 5 }, { id: 'shelf', name: '小書櫃', cost: 5 },
];

const WALL = { morning: '#F6E7CF', play: '#F4EBD8', nap: '#F4EBD8', wait: '#F1D9BC', night: '#2F3A55' };
const SKY = { morning: ['#FFD9A8', '#CDE7F2'], play: ['#9FD3EC', '#D8EEF5'], nap: ['#9FD3EC', '#D8EEF5'], wait: ['#F49A73', '#F8D3A4'], night: ['#16213D', '#2E3E66'] };

export function roomSVG(state, items = [], rain = false) {
  const night = state.id === 'night';
  const [s1, s2] = SKY[state.id];
  const has = k => items.includes(k);
  const drops = rain ? Array.from({ length: 18 }, (_, i) => `<line class="rain" style="animation-delay:${(i % 6) * .15}s" x1="${248 + (i * 13) % 104}" y1="${42 + (i * 17) % 60}" x2="${244 + (i * 13) % 104}" y2="${54 + (i * 17) % 60}" stroke="#E8F3FF" stroke-width="1.6" opacity=".8"/>`).join('') : '';
  const sky = night
    ? `<circle cx="330" cy="62" r="11" fill="#F6EFD2"/><circle cx="335" cy="58" r="10" fill="${s1}"/>${[[262, 56], [290, 80], [318, 96], [276, 100]].map(([x, y]) => `<circle class="twinkle" cx="${x}" cy="${y}" r="1.6" fill="#FFF6D6"/>`).join('')}`
    : rain ? `<ellipse cx="290" cy="58" rx="34" ry="12" fill="#B8C4CC"/><ellipse cx="320" cy="66" rx="28" ry="11" fill="#A9B6BF"/>`
      : `<circle cx="${state.id === 'wait' ? 320 : 330}" cy="${state.id === 'wait' ? 100 : 62}" r="13" fill="#FFD66B"/><ellipse class="cloud" cx="280" cy="80" rx="20" ry="7" fill="#fff" opacity=".9"/>`;
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" role="img" aria-label="寵物的小屋，${state.text}">
    <defs><linearGradient id="rsky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${rain && !night ? '#8FA3B0' : s1}"/><stop offset="1" stop-color="${rain && !night ? '#C3CED6' : s2}"/></linearGradient>
    <radialGradient id="rlamp" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(78 150) scale(120)"><stop offset="0" stop-color="#FFE3A3" stop-opacity="${has('lamp') ? (night ? .55 : .25) : 0}"/><stop offset="1" stop-color="#FFE3A3" stop-opacity="0"/></radialGradient></defs>
    <rect width="400" height="300" fill="${WALL[state.id]}"/>
    <rect x="0" y="0" width="400" height="14" fill="${night ? '#26304A' : '#E8D3B2'}"/>
    <!-- 窗戶 -->
    <rect x="236" y="34" width="128" height="96" rx="8" fill="url(#rsky)" stroke="${night ? '#5A4A3A' : '#B98B5E'}" stroke-width="6"/>
    ${sky}${drops}
    <path d="M300 34 V130 M236 82 H364" stroke="${night ? '#5A4A3A' : '#B98B5E'}" stroke-width="4"/>
    <path d="M230 30 q-6 60 4 106 L246 136 q-8 -50 0 -106z M370 30 q6 60 -4 106 L354 136 q8 -50 0 -106z" fill="${night ? '#4B4E78' : '#E59A6B'}" opacity=".9"/>
    <!-- 門 -->
    <rect x="22" y="72" width="70" height="146" rx="6" fill="${night ? '#4A3A2E' : '#B98B5E'}"/><circle cx="80" cy="150" r="4" fill="#F2C35B"/>
    <!-- 地板 -->
    <rect x="0" y="218" width="400" height="82" fill="${night ? '#3D3A44' : '#D9B48A'}"/>
    ${[0, 1, 2, 3, 4, 5].map(i => `<line x1="0" y1="${232 + i * 14}" x2="400" y2="${232 + i * 14}" stroke="${night ? '#35323B' : '#C9A176'}" stroke-width="1.2"/>`).join('')}
    ${has('rug') ? `<ellipse cx="200" cy="262" rx="110" ry="22" fill="${night ? '#5D6B8F' : '#9CC6B4'}" stroke="${night ? '#4B5878' : '#7FAE98'}" stroke-width="4"/>` : ''}
    <!-- 寵物小床 -->
    <ellipse cx="320" cy="244" rx="52" ry="16" fill="${night ? '#6B4F6A' : '#E7837A'}"/><ellipse cx="320" cy="240" rx="42" ry="10" fill="${night ? '#86688A' : '#F6B2A4'}"/>
    <!-- 飯碗 -->
    <path d="M118 236 h30 l-4 12 h-22z" fill="#5E9C78"/><ellipse cx="133" cy="236" rx="15" ry="4" fill="#C98B4A"/>
    ${has('plant') ? `<g><rect x="100" y="188" width="22" height="30" rx="4" fill="#C77B4A"/><path d="M111 190 q-18 -26 -6 -40 q8 18 6 40 q2 -30 18 -38 q4 18 -18 38z" fill="#5E9C6A"/></g>` : ''}
    ${has('lamp') ? `<g><rect x="70" y="160" width="6" height="58" fill="#7A5634"/><path d="M58 160 h30 l-6 -20 h-18z" fill="#F2C35B"/></g>` : ''}
    ${has('frame') ? `<g><rect x="132" y="56" width="62" height="46" rx="4" fill="#fff" stroke="#B98B5E" stroke-width="5"/><circle cx="152" cy="80" r="7" fill="#E8C3A2"/><circle cx="170" cy="82" r="6" fill="#E8C3A2"/><circle cx="160" cy="92" r="5" fill="#D9A15F"/></g>` : ''}
    ${has('shelf') ? `<g><rect x="150" y="128" width="64" height="88" fill="#A47A52"/><rect x="156" y="136" width="52" height="4" fill="#7A5634"/><rect x="156" y="172" width="52" height="4" fill="#7A5634"/>${[0, 1, 2, 3].map(i => `<rect x="${160 + i * 11}" y="${142 + (i % 2) * 2}" width="8" height="28" fill="${['#5E9C78', '#E59A6B', '#477A9C', '#F2C35B'][i]}"/>`).join('')}</g>` : ''}
    ${has('ball') ? `<g class="ball"><circle cx="250" cy="250" r="10" fill="#E8553A"/><path d="M240 250 h20 M250 240 v20" stroke="#fff" stroke-width="2.4"/></g>` : ''}
    <rect width="400" height="300" fill="url(#rlamp)"/>
    ${night ? '<rect width="400" height="300" fill="#0B1428" opacity=".18"/>' : ''}
  </svg>`;
}

// 寵物日記：用寵物的口吻記錄一起做的事
export function diaryText(kind, d = {}, call = '你') {
  const t = {
    move: [`今天${call}陪我做了「${d.name || '運動'}」，我跟著數數，好開心！`, `${call}做完「${d.name || '運動'}」說心情${d.mood || '不錯'}，我也覺得好棒！`],
    walk: [`今天${call}帶我走了 ${d.km || ''} 公里，路上聞到好香的花！`, `散步 ${d.km || ''} 公里！我一直搖尾巴，好喜歡跟${call}出門。`],
    breath: [`我們一起泡泡浴（呼吸練習），${call}吐氣好慢好放鬆。`],
    meditate: [`${call}陪我安靜坐了 ${d.min || 3} 分鐘，聽著${d.sound === 'wave' ? '海浪' : '雨'}聲差點睡著。`],
    mood: [`${call}說今天心情「${d.label || ''}」，我在旁邊陪著。`],
    feed: [`${call}給我吃了點心！${d.trick ? `我學會「${d.trick}」了！` : '好好吃。'}`],
    pet: [`${call}摸了我好久，我舒服得瞇起眼睛。`],
    bath: [`洗澎澎！泡泡好多，我現在香噴噴的。`],
    quest: [`今日任務完成！${call}帶我出門，得到 3 個心動點數！`],
    decor: [`小屋多了「${d.item || ''}」，我好喜歡！`],
  }[kind] || ['今天也很開心。'];
  return t[Math.floor(Math.random() * t.length)];
}
