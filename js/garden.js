// 心動綠洲｜遊戲規則與原創 SVG 繪圖
import { get, save } from './store.js';
import { PLANTS, GARDEN_SLOTS, KM_PER_WATER, STARTER_PLANTS, SPIRITS } from './content.js';

// ---------- 規則 ----------
// 居家活動：得到 1 顆種子，並幫最需要的植物澆 1 次水
// 戶外散步：每 0.3 公里澆 1 次水（至少 1 次），並累積社區合作里程
// 探索打卡：第一次打卡解鎖木棉花，每次打卡再得 1 顆種子

function waterPlants(times) {
  const g = get().garden;
  let used = 0;
  for (let i = 0; i < times; i++) {
    const growing = g.plots.filter(p => p.stage < 3).sort((a, b) => a.stage - b.stage);
    if (!growing.length) { g.water += 1; continue; } // 全部開花時，水先存起來給下一株
    growing[0].stage += 1; used += 1;
  }
  return used;
}

export function rewardHome() {
  const g = get().garden;
  g.seeds += 1;
  const grown = waterPlants(1);
  save();
  return { seeds: 1, grown };
}

export function rewardWalk(km) {
  const g = get().garden;
  const times = Math.max(1, Math.floor(km / KM_PER_WATER));
  const grown = waterPlants(times);
  g.communityKm = Math.round((g.communityKm + km) * 100) / 100;
  save();
  return { water: times, grown };
}

export function checkin(place) {
  const g = get().garden;
  const first = !g.unlocked.includes('kapok');
  if (first) g.unlocked.push('kapok');
  g.seeds += 1;
  g.checkins.push({ ...place, at: new Date().toISOString() });
  save();
  return { unlockedKapok: first };
}

export function canPlant() {
  const g = get().garden;
  return g.seeds > 0 && g.plots.length < GARDEN_SLOTS;
}

export function plant(type) {
  const g = get().garden;
  if (!canPlant() || !g.unlocked.includes(type)) return false;
  g.seeds -= 1;
  const stage = g.water > 0 ? 1 : 0;
  if (g.water > 0) g.water -= 1;
  g.plots.push({ type, stage });
  save();
  return true;
}

export const nextSuggestion = () => {
  const g = get().garden;
  const counts = Object.fromEntries(g.unlocked.map(t => [t, g.plots.filter(p => p.type === t).length]));
  return [...g.unlocked].sort((a, b) => counts[a] - counts[b])[0] || STARTER_PLANTS[0];
};

// ---------- 繪圖 ----------
const leaf = (x, y, r, flip, c = '#3E8E5C') =>
  `<path d="M${x} ${y} q ${flip * r} ${-r * 0.9} ${flip * r * 1.9} ${-r * 0.35} q ${-flip * r * 0.7} ${r * 0.85} ${-flip * r * 1.9} ${r * 0.35}z" fill="${c}"/>`;

function flower(type, cx, cy, s) {
  const p = PLANTS[type];
  let out = '';
  if (type === 'osmanthus') { // 桂花：成簇小花
    const pts = [[0, 0], [-7, 4], [7, 3], [-3, -7], [5, -6], [-9, -3], [9, -4]];
    pts.forEach(([dx, dy]) => {
      for (let k = 0; k < 4; k++) {
        const a = k * Math.PI / 2 + 0.4;
        out += `<circle cx="${cx + dx * s + Math.cos(a) * 2.2 * s}" cy="${cy + dy * s + Math.sin(a) * 2.2 * s}" r="${1.9 * s}" fill="${p.petal}"/>`;
      }
      out += `<circle cx="${cx + dx * s}" cy="${cy + dy * s}" r="${1.1 * s}" fill="${p.center}"/>`;
    });
    return out;
  }
  if (type === 'magnolia') { // 玉蘭花：細長合起的花瓣
    [-24, -8, 8, 24].forEach(deg => {
      out += `<ellipse cx="${cx}" cy="${cy - 7 * s}" rx="${3 * s}" ry="${9 * s}" fill="${p.petal}" stroke="${p.edge}" stroke-width="1" transform="rotate(${deg} ${cx} ${cy + 1 * s})"/>`;
    });
    return out;
  }
  if (type === 'bougainvillea') { // 九重葛：三片苞片
    [0, 120, 240].forEach(deg => {
      out += `<path d="M${cx} ${cy} q ${-8 * s} ${-6 * s} 0 ${-13 * s} q ${8 * s} ${7 * s} 0 ${13 * s}z" fill="${p.petal}" stroke="${p.edge}" stroke-width="1" transform="rotate(${deg} ${cx} ${cy})"/>`;
    });
    return out + `<circle cx="${cx}" cy="${cy}" r="${2 * s}" fill="${p.center}"/>`;
  }
  // 茉莉、木棉：五瓣花
  const n = 5, len = type === 'kapok' ? 10 : 7.5, w = type === 'kapok' ? 5.5 : 4;
  for (let k = 0; k < n; k++) {
    const deg = k * 72 - 90;
    out += `<ellipse cx="${cx}" cy="${cy - len * 0.6 * s}" rx="${w * s}" ry="${len * 0.62 * s}" fill="${p.petal}" stroke="${p.edge}" stroke-width="1" transform="rotate(${deg + 90} ${cx} ${cy})"/>`;
  }
  return out + `<circle cx="${cx}" cy="${cy}" r="${(type === 'kapok' ? 3.4 : 2.6) * s}" fill="${p.center}"/>`;
}

export function plantSVG(type, stage, x, y, s = 1) {
  // (x, y) = 土壤中心
  let g = `<ellipse cx="${x}" cy="${y}" rx="${22 * s}" ry="${7 * s}" fill="#7A5634"/><ellipse cx="${x}" cy="${y - 1.5 * s}" rx="${18 * s}" ry="${4.5 * s}" fill="#8E6640"/>`;
  if (stage === 0) {
    return g + `<ellipse cx="${x}" cy="${y - 4 * s}" rx="${4 * s}" ry="${3 * s}" fill="#5B3B1E"/><path d="M${x - 1 * s} ${y - 6.5 * s} q ${1 * s} ${-2 * s} ${3 * s} ${-2.5 * s}" stroke="#7BB662" stroke-width="${1.4 * s}" fill="none"/>`;
  }
  const tall = type === 'kapok' ? 1.35 : 1;
  const h = (stage === 1 ? 14 : stage === 2 ? 32 : 40) * s * tall;
  const stem = type === 'kapok' && stage === 3 ? '#7A5634' : '#4E9A63';
  g += `<path d="M${x} ${y - 2 * s} C ${x - 3 * s} ${y - h * 0.4}, ${x + 3 * s} ${y - h * 0.7}, ${x} ${y - h}" stroke="${stem}" stroke-width="${(type === 'kapok' && stage === 3 ? 4 : 2.4) * s}" fill="none" stroke-linecap="round"/>`;
  if (stage === 1) {
    g += leaf(x, y - h + 2 * s, 5 * s, -1, '#6DB46F') + leaf(x, y - h + 2 * s, 5 * s, 1, '#6DB46F');
    return g;
  }
  g += leaf(x, y - h * 0.35, 8 * s, -1) + leaf(x, y - h * 0.5, 8 * s, 1) + leaf(x, y - h * 0.7, 6.5 * s, -1, '#55A36A');
  if (stage === 2) {
    const p = PLANTS[type];
    return g + `<ellipse cx="${x}" cy="${y - h - 3 * s}" rx="${3.2 * s}" ry="${5 * s}" fill="${p.petal}" stroke="${p.edge}" stroke-width="1"/>`;
  }
  return g + flower(type, x, y - h - 4 * s, s);
}

export function gardenSVG({ highlight = -1 } = {}) {
  const g = get().garden;
  const W = 360, H = 300;
  // 九格花圃，後排較小，製造前後深度
  const rows = [{ y: 136, s: 0.9, xs: [104, 180, 256] }, { y: 196, s: 1.05, xs: [80, 180, 280] }, { y: 268, s: 1.25, xs: [60, 180, 300] }];
  // 先種前排中間（最大、最明顯），再往兩側與後排
  const slots = [...rows].reverse().flatMap(r => [r.xs[1], r.xs[0], r.xs[2]].map(x => ({ x, y: r.y, s: r.s })));
  let plants = '';
  const order = slots.map((sl, i) => i).sort((a, b) => slots[a].y - slots[b].y); // 由後往前畫，前排蓋住後排
  order.forEach(i => {
    const sl = slots[i];
    const p = g.plots[i];
    if (p) {
      plants += `<g class="${i === highlight ? 'grow' : ''}" style="transform-origin:${sl.x}px ${sl.y}px">${plantSVG(p.type, p.stage, sl.x, sl.y, sl.s)}</g>`;
    } else {
      plants += `<ellipse cx="${sl.x}" cy="${sl.y}" rx="${20 * sl.s}" ry="${6 * sl.s}" fill="none" stroke="#B9C9A8" stroke-width="2" stroke-dasharray="4 4"/>`;
    }
  });
  return `<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="我的心動綠洲，種了 ${g.plots.length} 株植物">
    <defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#CFE8F2"/><stop offset="1" stop-color="#EAF4E4"/></linearGradient></defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    <circle cx="300" cy="46" r="24" fill="#F6C453"/>
    <path d="M0 120 Q 90 82 190 112 T 360 100 V300 H0Z" fill="#B8D99A"/>
    <path d="M0 140 Q 120 112 230 134 T 360 128 V300 H0Z" fill="#9CCB7E"/>
    ${plants}
  </svg>`;
}

// ---------- 葉靈（原創小精靈） ----------
// 遇到葉靈：散步依序遇到 walk 類；打卡依序遇到 checkin 類；都遇過之後隨機重逢
export function meetSpirit(from) {
  const g = get().garden;
  g.spirits = g.spirits || [];
  const pool = SPIRITS.filter(s => s.from === from);
  const found = new Set(g.spirits.map(s => s.id));
  const fresh = pool.find(s => !found.has(s.id));
  const sp = fresh || pool[Math.floor(Math.random() * pool.length)];
  return { spirit: sp, isNew: !!fresh };
}

export function befriend(id, where) {
  const g = get().garden;
  g.spirits = g.spirits || [];
  g.spirits.push({ id, at: new Date().toISOString(), where });
  save();
}

// 原創造型：圓圓的「花糰子」，臉在花心裡，下面有兩片小葉子當腳
export function spiritSVG(id, size = 120, { silhouette = false } = {}) {
  const s = SPIRITS.find(x => x.id === id);
  if (!s) return '';
  const fill = silhouette ? '#C9D6C4' : s.petal, edge = silhouette ? '#B5C4AF' : s.edge;
  let petals = '';
  for (let i = 0; i < s.n; i++) {
    const a = i * 360 / s.n;
    if (s.shape === 'dot') petals += `<circle cx="50" cy="16" r="9" fill="${fill}" stroke="${edge}" stroke-width="2" transform="rotate(${a} 50 50)"/>`;
    else if (s.shape === 'bract') petals += `<path d="M50 50 Q22 30 50 8 Q78 30 50 50Z" fill="${fill}" stroke="${edge}" stroke-width="2" transform="rotate(${a} 50 50)"/>`;
    else if (s.shape === 'long') petals += `<ellipse cx="50" cy="18" rx="9" ry="20" fill="${fill}" stroke="${edge}" stroke-width="2" transform="rotate(${a} 50 50)"/>`;
    else if (s.shape === 'point') petals += `<path d="M50 50 Q36 30 50 6 Q64 30 50 50Z" fill="${fill}" stroke="${edge}" stroke-width="2" transform="rotate(${a} 50 50)"/>`;
    else if (s.shape === 'heart') petals += `<path d="M50 48 C30 36 34 10 46 14 Q50 16 50 22 Q50 16 54 14 C66 10 70 36 50 48Z" fill="${fill}" stroke="${edge}" stroke-width="2" transform="rotate(${a} 50 50)"/>`;
    else petals += `<ellipse cx="50" cy="${s.shape === 'big' ? 18 : 20}" rx="${s.shape === 'big' ? 16 : 13}" ry="${s.shape === 'big' ? 19 : 16}" fill="${fill}" stroke="${edge}" stroke-width="2" transform="rotate(${a} 50 50)"/>`;
  }
  const face = silhouette
    ? '<text x="50" y="58" text-anchor="middle" font-size="22" font-weight="800" fill="#8FA58A">?</text>'
    : '<circle cx="43" cy="49" r="3" fill="#1D2B24"/><circle cx="57" cy="49" r="3" fill="#1D2B24"/><path d="M44 57 Q50 62 56 57" stroke="#1D2B24" stroke-width="2.5" fill="none" stroke-linecap="round"/><circle cx="38" cy="55" r="3" fill="#F7A6A0" opacity=".7"/><circle cx="62" cy="55" r="3" fill="#F7A6A0" opacity=".7"/>';
  return `<svg viewBox="0 0 100 112" width="${size}" height="${size * 1.12}" aria-hidden="true">
    <path d="M40 82 q-12 14 -22 16 q10 -14 22 -16z M60 82 q12 14 22 16 q-10 -14 -22 -16z" fill="${silhouette ? '#B5C4AF' : '#4E9A63'}"/>
    ${petals}<circle cx="50" cy="52" r="20" fill="${silhouette ? '#DDE6D8' : '#FFF6DE'}" stroke="${edge}" stroke-width="2"/>${face}</svg>`;
}
