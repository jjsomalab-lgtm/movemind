// 心動綠洲｜美術：葉靈角色與花園場景（全部以程式原創繪製）
// 風格規範見 docs/美術設計規範.md：圓潤、柔和漸層、同色系深色描邊、無尖角、低對比背景、高辨識角色。
import { SPIRITS } from './content.js';

let uid = 0;
const nid = p => `${p}${++uid}`;

// ---------- 葉靈 ----------
function petalPath(shape) {
  switch (shape) {
    case 'bract': return 'M50 62 Q24 40 50 14 Q76 40 50 62Z';
    case 'long': return 'M50 62 C40 50 40 24 50 12 C60 24 60 50 50 62Z';
    case 'point': return 'M50 62 C38 46 42 24 50 10 C58 24 62 46 50 62Z';
    case 'heart': return 'M50 60 C30 46 32 18 45 20 Q50 22 50 28 Q50 22 55 20 C68 18 70 46 50 60Z';
    case 'big': return 'M50 62 C30 52 30 20 50 14 C70 20 70 52 50 62Z';
    default: return 'M50 62 C34 52 34 24 50 18 C66 24 66 52 50 62Z';
  }
}

export function spiritArt(id, size = 120, { silhouette = false, mood = 'happy' } = {}) {
  const s = SPIRITS.find(x => x.id === id);
  if (!s) return '';
  const g1 = nid('pg'), g2 = nid('fg'), g3 = nid('lg');
  const P1 = silhouette ? '#D6E0D2' : s.petal, P2 = silhouette ? '#BCCAB6' : s.petal2, E = silhouette ? '#A9B9A3' : s.edge;
  const defs = `<defs>
    <linearGradient id="${g1}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${P1}"/><stop offset="1" stop-color="${P2}"/></linearGradient>
    <radialGradient id="${g2}" cx=".4" cy=".35" r=".75"><stop offset="0" stop-color="${silhouette ? '#E6ECE3' : '#FFFCF2'}"/><stop offset="1" stop-color="${silhouette ? '#CBD6C6' : '#F5E3BA'}"/></radialGradient>
    <linearGradient id="${g3}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${silhouette ? '#C1CFBB' : '#7CC47F'}"/><stop offset="1" stop-color="${silhouette ? '#A9B9A3' : '#3E8E5C'}"/></linearGradient>
  </defs>`;
  const leaf = (x, y, rot) => `<path d="M0 0 C6 -8 18 -8 22 0 C18 8 6 8 0 0Z" transform="translate(${x} ${y}) rotate(${rot})" fill="url(#${g3})"/>`;
  let body = '';
  // 腳與小手（葉子）
  body += `<ellipse cx="50" cy="114" rx="22" ry="4" fill="#1D2B24" opacity=".12"/>`;
  body += leaf(46, 104, 115) + leaf(54, 104, 65);
  body += leaf(29, 74, 200) + leaf(71, 74, -20);
  if (s.shape === 'fruit') {
    body += `<circle cx="50" cy="64" r="30" fill="url(#${g1})" stroke="${E}" stroke-width="2"/>
      <ellipse cx="38" cy="50" rx="8" ry="5" fill="#fff" opacity=".45" transform="rotate(-30 38 50)"/>
      ${[[40, 76], [60, 72], [52, 84], [64, 58], [36, 64]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.2" fill="${E}" opacity=".5"/>`).join('')}`;
  } else if (s.shape === 'orchid') {
    body += `<g stroke="${E}" stroke-width="1.6">
      <ellipse cx="28" cy="56" rx="20" ry="16" fill="url(#${g1})" transform="rotate(-20 28 56)"/>
      <ellipse cx="72" cy="56" rx="20" ry="16" fill="url(#${g1})" transform="rotate(20 72 56)"/>
      <ellipse cx="50" cy="30" rx="10" ry="16" fill="url(#${g1})"/>
      <ellipse cx="36" cy="88" rx="9" ry="14" fill="url(#${g1})" transform="rotate(30 36 88)"/>
      <ellipse cx="64" cy="88" rx="9" ry="14" fill="url(#${g1})" transform="rotate(-30 64 88)"/></g>
      <path d="M40 86 Q50 98 60 86" fill="${silhouette ? P2 : '#E9C24B'}" stroke="${E}" stroke-width="1.4"/>`;
  } else if (s.shape === 'dot') {
    for (let i = 0; i < s.n; i++) {
      const a = (i * 360 / s.n) * Math.PI / 180, r = 30;
      const x = 50 + Math.cos(a) * r, y = 64 + Math.sin(a) * r;
      body += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">${[0, 90, 180, 270].map(d => `<ellipse cx="0" cy="-4.5" rx="3.6" ry="4.8" fill="url(#${g1})" stroke="${E}" stroke-width="1" transform="rotate(${d + i * 12})"/>`).join('')}<circle r="2" fill="${E}"/></g>`;
    }
  } else {
    for (let i = 0; i < s.n; i++) {
      const a = i * 360 / s.n;
      body += `<g transform="rotate(${a} 50 64) translate(0 2)"><path d="${petalPath(s.shape)}" fill="url(#${g1})" stroke="${E}" stroke-width="1.8"/>
        <path d="M50 58 Q50 40 50 26" stroke="${E}" stroke-width="1" opacity=".35" fill="none"/></g>`;
    }
  }
  // 臉（花心）
  const faceR = s.shape === 'fruit' ? 0 : 21;
  if (faceR) body += `<circle cx="50" cy="64" r="${faceR}" fill="url(#${g2})" stroke="${E}" stroke-width="1.6"/><path d="M36 56 A16 16 0 0 1 48 47" stroke="#fff" stroke-width="3" opacity=".6" fill="none" stroke-linecap="round"/>`;
  // 頭頂小配件
  if (!silhouette) {
    if (s.top === 'bud') body += `<path d="M50 40 Q50 32 50 26" stroke="#4E9A63" stroke-width="2.5" fill="none"/><ellipse cx="50" cy="22" rx="5" ry="7" fill="#FFFFFF" stroke="${E}" stroke-width="1.4"/>`;
    if (s.top === 'sprig') body += `<path d="M50 34 Q54 24 60 20" stroke="#4E9A63" stroke-width="2.5" fill="none"/>${leaf(58, 20, -30)}`;
    if (s.top === 'twig') body += `<path d="M50 30 L50 18 M50 22 L58 14 M50 24 L43 16" stroke="#7A5634" stroke-width="2.8" stroke-linecap="round" fill="none"/>`;
    if (s.top === 'drop') body += `<path d="M66 30 Q70 38 66 42 Q62 38 66 30Z" fill="#9FD3F0" stroke="#5FA9D3" stroke-width="1.2"/>`;
    if (s.top === 'leaf') body += `<path d="M50 34 L50 28" stroke="#7A5634" stroke-width="3" stroke-linecap="round"/>${leaf(50, 28, -40)}`;
  }
  // 表情
  if (silhouette) {
    body += `<text x="50" y="72" text-anchor="middle" font-size="24" font-weight="800" fill="#8FA58A" font-family="sans-serif">?</text>`;
  } else {
    const eye = (x) => `<ellipse cx="${x}" cy="62" rx="3.3" ry="4" fill="#2B2420"/><circle cx="${x + 1.1}" cy="60.6" r="1.2" fill="#fff"/>`;
    const mouth = mood === 'sleepy' ? '<path d="M46 72 Q50 74 54 72" stroke="#2B2420" stroke-width="2" fill="none" stroke-linecap="round"/>'
      : '<path d="M45 70 Q50 76 55 70" stroke="#2B2420" stroke-width="2.2" fill="#E8776E" stroke-linejoin="round"/>';
    body += eye(43) + eye(57) + mouth + '<ellipse cx="37" cy="69" rx="4" ry="2.6" fill="#F59A92" opacity=".55"/><ellipse cx="63" cy="69" rx="4" ry="2.6" fill="#F59A92" opacity=".55"/>';
  }
  return `<svg viewBox="0 0 100 120" width="${size}" height="${size * 1.2}" aria-hidden="true">${defs}${body}</svg>`;
}

// ---------- 花園場景（依真實時間變化） ----------
export function timeOfDay(h = new Date().getHours()) {
  if (h >= 5 && h < 8) return 'dawn';
  if (h >= 8 && h < 16) return 'day';
  if (h >= 16 && h < 19) return 'dusk';
  return 'night';
}

const SKY = {
  dawn: ['#F7C9A6', '#FBE6CF', '#D7ECEF'],
  day: ['#A9D8EE', '#CFE8F2', '#EAF4E4'],
  dusk: ['#F49A73', '#F8C79A', '#F6E2C2'],
  night: ['#1D2A4C', '#34467A', '#566A9A'],
};

export function sceneBack(W, H, t) {
  const id = nid('sky'), hz = nid('hz'), pd = nid('pd');
  const [a, b, c] = SKY[t];
  const night = t === 'night';
  const sun = t === 'night'
    ? `<circle cx="${W - 70}" cy="54" r="20" fill="#F6EFD2"/><circle cx="${W - 62}" cy="48" r="18" fill="${a}"/>`
    : `<circle cx="${t === 'day' ? W - 72 : W - 60}" cy="${t === 'day' ? 50 : 96}" r="26" fill="${t === 'dusk' ? '#FFB067' : '#FFD66B'}" opacity=".95"/><circle cx="${t === 'day' ? W - 72 : W - 60}" cy="${t === 'day' ? 50 : 96}" r="38" fill="#FFE9A8" opacity=".25"/>`;
  const stars = night ? Array.from({ length: 22 }, (_, i) => {
    const x = (i * 97) % W, y = 12 + (i * 53) % 90;
    return `<circle class="twinkle" style="animation-delay:${(i % 5) * .6}s" cx="${x}" cy="${y}" r="${i % 3 ? 1.2 : 1.8}" fill="#FFF7D6"/>`;
  }).join('') : '';
  const cloud = (x, y, s, d) => `<g class="cloud" style="animation-duration:${d}s"><g transform="translate(${x} ${y}) scale(${s})" fill="#fff" opacity="${night ? .15 : .85}"><ellipse cx="0" cy="0" rx="22" ry="11"/><ellipse cx="18" cy="-6" rx="16" ry="12"/><ellipse cx="34" cy="2" rx="18" ry="9"/></g></g>`;
  const m1 = night ? '#2E4566' : t === 'dusk' ? '#C98F86' : '#9FC3B0', m2 = night ? '#2A4A4A' : t === 'dusk' ? '#B79A6E' : '#8DBE87';
  const hill = night ? '#355C47' : '#A9D38E', ground = night ? '#2F5A3E' : '#93C978';
  return `<defs>
      <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${a}"/><stop offset=".6" stop-color="${b}"/><stop offset="1" stop-color="${c}"/></linearGradient>
      <linearGradient id="${hz}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${ground}"/><stop offset="1" stop-color="${night ? '#264A33' : '#7DB865'}"/></linearGradient>
      <radialGradient id="${pd}" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="${night ? '#5C7BA8' : '#BFE6F5'}"/><stop offset="1" stop-color="${night ? '#3B5A86' : '#7FC3E0'}"/></radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#${id})"/>
    ${stars}${sun}
    ${cloud(40, 40, 1, 60)}${cloud(200, 70, .8, 80)}
    <path d="M0 150 L40 112 L78 136 L130 96 L176 132 L230 104 L282 138 L330 110 L${W} 140 V${H} H0Z" fill="${m1}" opacity=".7"/>
    <path d="M0 158 Q70 128 150 150 T300 142 T${W} 150 V${H} H0Z" fill="${m2}"/>
    <path d="M0 176 Q110 150 220 170 T${W} 166 V${H} H0Z" fill="${hill}"/>
    <path d="M0 192 Q120 178 240 188 T${W} 186 V${H} H0Z" fill="url(#${hz})"/>
    <!-- 木棉樹（高雄市花） -->
    <g transform="translate(46 192)">
      <path d="M-4 0 L-3 -54 Q-2 -62 0 -66 Q2 -62 3 -54 L4 0Z" fill="${night ? '#4A3A2C' : '#8A6440'}"/>
      <path d="M0 -50 L-22 -70 M0 -58 L20 -78 M0 -64 L-6 -88 M-12 -60 L-26 -64 M10 -68 L28 -70" stroke="${night ? '#4A3A2C' : '#8A6440'}" stroke-width="3.5" stroke-linecap="round"/>
      ${[[-22, -70], [20, -78], [-6, -88], [-26, -64], [28, -70], [6, -80], [-14, -78], [14, -62]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="${night ? '#8E4A3A' : '#E8553A'}"/><circle cx="${x}" cy="${y}" r="2" fill="${night ? '#A88B45' : '#FFC24A'}"/>`).join('')}
    </g>
    <!-- 池塘 -->
    <g transform="translate(${W - 66} 206)">
      <ellipse cx="0" cy="0" rx="52" ry="15" fill="url(#${pd})"/>
      <ellipse cx="-16" cy="-2" rx="9" ry="3.6" fill="${night ? '#3E6B4A' : '#6DB46F'}"/><ellipse cx="14" cy="3" rx="7" ry="3" fill="${night ? '#3E6B4A' : '#6DB46F'}"/>
      <circle cx="16" cy="1" r="3" fill="${night ? '#B07A8C' : '#F6A9C2'}"/>
      <path d="M-30 -4 Q-24 -6 -18 -4" stroke="#fff" stroke-width="1.5" opacity=".6" fill="none"/>
    </g>
    <!-- 小路與長椅 -->
    <path d="M${W * 0.62} ${H} Q${W * 0.5} 250 ${W * 0.56} 214 T${W * 0.6} 190" fill="none" stroke="${night ? '#6B6A55' : '#E8D9B0'}" stroke-width="14" stroke-linecap="round" opacity=".8"/>
    <g transform="translate(${W - 120} 196)" fill="${night ? '#5A4636' : '#A77B4F'}"><rect x="0" y="0" width="34" height="4" rx="2"/><rect x="0" y="-8" width="34" height="3" rx="1.5"/><rect x="3" y="4" width="3" height="8"/><rect x="28" y="4" width="3" height="8"/></g>
    <!-- 花圃邊 -->
    <path d="M30 ${H - 4} Q${W / 2} ${H - 120} ${W - 30} ${H - 4}" fill="${night ? '#3D5E3F' : '#A2D184'}" opacity=".55"/>`;
}

export function sceneFront(W, H, t) {
  if (t !== 'night') return '';
  return `<rect width="${W}" height="${H}" fill="#14203D" opacity=".18"/>` + Array.from({ length: 10 }, (_, i) =>
    `<circle class="firefly" style="animation-delay:${(i * .7) % 4}s" cx="${30 + (i * 71) % (W - 60)}" cy="${170 + (i * 37) % 110}" r="2.4" fill="#F9F3A0"/>`).join('');
}

// ---------- 品牌標誌：一片葉子與心跳線組成的「心動之葉」 ----------
export function brandMark(size = 40) {
  return `<svg viewBox="0 0 48 48" width="${size}" height="${size}" aria-hidden="true">
    <path d="M24 44 C8 34 4 22 10 12 C16 4 24 8 24 14 C24 8 32 4 38 12 C44 22 40 34 24 44Z" fill="#164F43"/>
    <path d="M10 26 H17 L20 19 L25 32 L28 24 H38" fill="none" stroke="#F7F5EC" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M24 44 Q25 36 30 30" stroke="#D69B54" stroke-width="2.4" fill="none" stroke-linecap="round"/>
  </svg>`;
}

// ---------- 心靈湖畔：湖、蓮花、水波、晨光；記錄過的心情會變成湖上的花 ----------
export function lakeScene(flowers = 0) {
  const g = nid('lk'), w = nid('wt');
  const lotus = Array.from({ length: Math.min(flowers, 9) }, (_, i) => {
    const x = 60 + (i * 47) % 300, y = 196 + (i * 23) % 70;
    return `<g transform="translate(${x} ${y})"><ellipse rx="16" ry="5" fill="#5E9C6A" opacity=".9"/>
      ${[-40, -15, 15, 40].map(d => `<path d="M0 0 C-5 -8 -4 -16 0 -20 C4 -16 5 -8 0 0Z" fill="#F4B6C9" stroke="#D7809E" stroke-width="1" transform="rotate(${d})"/>`).join('')}
      <path d="M0 0 C-5 -9 -4 -18 0 -22 C4 -18 5 -9 0 0Z" fill="#FAD3DF" stroke="#D7809E" stroke-width="1"/></g>`;
  }).join('');
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" role="img" aria-label="心靈湖畔，湖上開了 ${flowers} 朵心情之花">
    <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6E3C8"/><stop offset=".55" stop-color="#E9EFE3"/><stop offset="1" stop-color="#DCE9DF"/></linearGradient>
    <linearGradient id="${w}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#A9CBD9"/><stop offset="1" stop-color="#6E9DB7"/></linearGradient></defs>
    <rect width="400" height="300" fill="url(#${g})"/>
    <circle cx="300" cy="96" r="34" fill="#F3C98B" opacity=".9"/><circle cx="300" cy="96" r="54" fill="#F7DDB0" opacity=".35"/>
    <path d="M0 140 Q90 110 180 132 T400 124 V300 H0Z" fill="#B9CFB4"/>
    <path d="M0 160 Q120 140 240 156 T400 150 V300 H0Z" fill="#9FBF9C"/>
    <path d="M0 176 Q200 160 400 176 V300 H0Z" fill="url(#${w})"/>
    ${[190, 214, 240, 266].map((y, i) => `<path class="wave" style="animation-delay:${i * .8}s" d="M${30 + i * 40} ${y} q20 -6 40 0 t40 0" stroke="#fff" stroke-width="2" fill="none" opacity=".5" stroke-linecap="round"/>`).join('')}
    <path d="M300 176 L300 300" stroke="#F7DDB0" stroke-width="22" opacity=".25"/>
    <g fill="#6E9A6C"><path d="M18 182 q4 -40 8 -60 q2 30 0 60z"/><path d="M30 182 q2 -30 10 -46 q-2 26 -4 46z"/><path d="M372 180 q4 -36 10 -52 q0 30 -4 52z"/></g>
    ${lotus}
  </svg>`;
}

// ---------- 活力森林：步道、陽光、樹木 ----------
export function forestScene() {
  const g = nid('fs');
  const tree = (x, y, s, c) => `<g transform="translate(${x} ${y}) scale(${s})"><rect x="-4" y="-6" width="8" height="34" rx="3" fill="#7A5B3E"/><circle cx="0" cy="-22" r="24" fill="${c}"/><circle cx="-14" cy="-10" r="16" fill="${c}"/><circle cx="14" cy="-10" r="16" fill="${c}"/></g>`;
  return `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" role="img" aria-label="活力森林">
    <defs><linearGradient id="${g}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E8F0DE"/><stop offset="1" stop-color="#F7F5EC"/></linearGradient></defs>
    <rect width="400" height="220" fill="url(#${g})"/>
    <g opacity=".5">${[0, 1, 2, 3, 4].map(i => `<path d="M${330 - i * 26} 0 L${250 - i * 40} 220" stroke="#F3D9A4" stroke-width="${10 - i}" />`).join('')}</g>
    <path d="M0 150 Q100 120 200 140 T400 130 V220 H0Z" fill="#B7D0A8"/>
    ${tree(40, 150, 1.1, '#5E8F64')}${tree(96, 140, .8, '#7AA673')}${tree(330, 146, 1.2, '#4F7F57')}${tree(372, 156, .9, '#6C9A66')}${tree(280, 140, .7, '#86B07E')}
    <path d="M150 220 Q190 170 210 150 T240 128" stroke="#E7D7B4" stroke-width="26" fill="none" stroke-linecap="round"/>
    <path d="M0 190 Q200 176 400 192 V220 H0Z" fill="#9FC191"/>
  </svg>`;
}

// ---------- 生命之樹：6 個階段，隨參與長大 ----------
export function treeOfLife(stage = 0, { size = 260 } = {}) {
  const g = nid('tg'), sky = nid('ts');
  const trunkH = [0, 18, 60, 90, 110, 120][stage];
  const crown = [0, 0, 34, 56, 70, 82][stage];
  let t = `<defs><radialGradient id="${sky}" cx=".5" cy=".4" r=".7"><stop offset="0" stop-color="#FFF9EC"/><stop offset="1" stop-color="#E7F0E7"/></radialGradient>
    <radialGradient id="${g}" cx=".4" cy=".35" r=".7"><stop offset="0" stop-color="#6FA877"/><stop offset="1" stop-color="#164F43"/></radialGradient></defs>
    <rect width="300" height="280" rx="24" fill="url(#${sky})"/>
    <ellipse cx="150" cy="248" rx="110" ry="16" fill="#C9DCC3"/>`;
  if (stage === 0) {
    t += `<ellipse cx="150" cy="238" rx="12" ry="8" fill="#7A5634"/><path d="M146 232 q4 -8 10 -8" stroke="#6FA877" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  } else if (stage === 1) {
    t += `<path d="M150 246 V222" stroke="#5E8F64" stroke-width="5" stroke-linecap="round"/><path d="M150 226 C138 214 128 218 126 224 C134 230 144 230 150 226Z M150 222 C162 210 172 214 174 220 C166 226 156 226 150 222Z" fill="#6FA877"/>`;
  } else {
    const top = 246 - trunkH;
    t += `<path d="M${150 - 7 - stage} 248 C${148 - stage} ${top + 40} ${146} ${top + 20} 150 ${top} C${154} ${top + 20} ${152 + stage} ${top + 40} ${150 + 7 + stage} 248Z" fill="#7A5B3E"/>`;
    if (stage >= 3) t += `<path d="M150 ${top + 30} L120 ${top + 6} M150 ${top + 22} L182 ${top}" stroke="#7A5B3E" stroke-width="6" stroke-linecap="round"/>`;
    t += `<circle cx="150" cy="${top - 4}" r="${crown}" fill="url(#${g})"/>`;
    if (stage >= 3) t += `<circle cx="${150 - crown * .8}" cy="${top + crown * .3}" r="${crown * .62}" fill="url(#${g})"/><circle cx="${150 + crown * .8}" cy="${top + crown * .3}" r="${crown * .62}" fill="url(#${g})"/>`;
    if (stage >= 4) {
      const n = stage === 5 ? 16 : 9;
      for (let i = 0; i < n; i++) {
        const a = i * 2.4, r = crown * (.3 + (i % 4) * .2);
        t += `<circle cx="${(150 + Math.cos(a) * r).toFixed(1)}" cy="${(top + Math.sin(a) * r * .8).toFixed(1)}" r="6" fill="${['#F4B6C9', '#F3C98B', '#FFFFFF'][i % 3]}" stroke="#D69B54" stroke-width="1"/>`;
      }
    }
    if (stage === 5) t += Array.from({ length: 6 }, (_, i) => `<circle class="twinkle" style="animation-delay:${i * .5}s" cx="${70 + i * 32}" cy="${40 + (i % 2) * 24}" r="3" fill="#D69B54"/>`).join('');
  }
  return `<svg viewBox="0 0 300 280" width="${size}" height="${size * 280 / 300}" role="img" aria-label="生命之樹">${t}</svg>`;
}

// ---------- 紀念徽章 ----------
export function badgeSVG(icon, got) {
  return `<svg viewBox="0 0 80 80" width="72" height="72" aria-hidden="true">
    <circle cx="40" cy="40" r="34" fill="${got ? '#F7F5EC' : '#ECEFEA'}" stroke="${got ? '#D69B54' : '#C8CFC6'}" stroke-width="5"/>
    <circle cx="40" cy="40" r="25" fill="${got ? '#E7F0E7' : '#F3F5F1'}"/>
    <text x="40" y="49" text-anchor="middle" font-size="26" ${got ? '' : 'opacity=".35" filter="grayscale(1)"'}>${icon}</text>
  </svg>`;
}
