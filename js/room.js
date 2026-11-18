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
  const has = k => items.includes(k);
  const drops = rain ? Array.from({ length: 22 }, (_, i) => `<line class="rain" style="animation-delay:${(i % 6) * .15}s" x1="${150 + (i * 13) % 150}" y1="${8 + (i * 17) % 80}" x2="${146 + (i * 13) % 150}" y2="${20 + (i * 17) % 80}" stroke="#E8F3FF" stroke-width="1.4" opacity=".75"/>`).join('') : '';
  // 背景：團隊色鉛筆插畫（台灣老屋、花磚、編織地毯）；寵物床、碗、球由程式畫，方便互動
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" role="img" aria-label="寵物的小屋，${state.text}">
    <image href="img/scenes/room_bg.webp" x="0" y="0" width="400" height="300" preserveAspectRatio="xMidYMax slice"/>
    ${rain ? '<rect x="140" y="0" width="165" height="100" fill="#8FA3B0" opacity=".35"/>' : ''}${drops}
    <ellipse cx="330" cy="262" rx="44" ry="12" fill="#B8553D" opacity=".85"/><ellipse cx="330" cy="258" rx="35" ry="8" fill="#E8B394"/>
    <path d="M92 266 h26 l-4 10 h-18z" fill="#3E8A84"/><ellipse cx="105" cy="266" rx="13" ry="3.4" fill="#C98B4A"/>
    ${has('ball') ? `<g class="ball"><circle cx="262" cy="270" r="9" fill="#D9442F"/><path d="M253 270 h18 M262 261 v18" stroke="#FFF6E6" stroke-width="2"/></g>` : ''}
    ${night ? '<rect width="400" height="300" fill="#16213D" opacity=".42"/><circle cx="36" cy="80" r="70" fill="#FFD98A" opacity=".18"/>' : state.id === 'wait' ? '<rect width="400" height="300" fill="#E8925A" opacity=".1"/>' : ''}
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
