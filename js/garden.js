// 心動綠洲｜遊戲規則與原創 SVG 繪圖
import { get, save } from './store.js';
import { PLANTS, GARDEN_SLOTS, KM_PER_WATER, STARTER_PLANTS, SPIRITS } from './content.js';
import { spiritArt, sceneBack, sceneFront, timeOfDay } from './art.js';

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

export function gardenSVG({ highlight = -1, time = timeOfDay() } = {}) {
  const g = get().garden;
  const W = 400, H = 320;
  // 九格花圃，後排較小，製造前後深度；先種前排中間（最大、最明顯）
  const rows = [{ y: 230, s: 0.85, xs: [150, 200, 250] }, { y: 264, s: 1, xs: [122, 200, 278] }, { y: 304, s: 1.15, xs: [96, 200, 304] }];
  const slots = [...rows].reverse().flatMap(r => [r.xs[1], r.xs[0], r.xs[2]].map(x => ({ x, y: r.y, s: r.s })));
  let plants = '';
  const order = slots.map((sl, i) => i).sort((a, b) => slots[a].y - slots[b].y);
  order.forEach(i => {
    const sl = slots[i];
    const p = g.plots[i];
    if (p) plants += `<g class="${i === highlight ? 'grow' : ''}" style="transform-origin:${sl.x}px ${sl.y}px">${plantSVG(p.type, p.stage, sl.x, sl.y, sl.s)}</g>`;
    else plants += `<ellipse cx="${sl.x}" cy="${sl.y}" rx="${20 * sl.s}" ry="${6 * sl.s}" fill="#000" opacity=".06" stroke="#6F8F5E" stroke-opacity=".5" stroke-width="2" stroke-dasharray="4 4"/>`;
  });
  return `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="我的心動綠洲，種了 ${g.plots.length} 株植物">
    ${sceneBack(W, H, time)}${plants}${sceneFront(W, H, time)}
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

// 角色造型見 js/art.js
export function spiritSVG(id, size = 120, opts = {}) { return spiritArt(id, size, opts); }
