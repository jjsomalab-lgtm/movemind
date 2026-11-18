// 心動力 AI｜迺台灣插畫（原創 SVG，文創風格：紙張底色、套色印刷錯位、墨線）
// 每張圖都是團隊自行繪製的幾何插畫，不使用任何既有角色、照片或商標。
// 套色錯位（riso）做法：色塊往右下偏 1.6px，墨線疊在原位。

// 品牌色（與 css 的 design tokens 一致）
export const INK = '#3B2E28', PAPER = '#FBF6EA', BRICK = '#D2492F', TEAL = '#3E8A84', MUSTARD = '#E0A93F', SAGE = '#8CB85A', SKY = '#7DB4D3', ROSE = '#EC9A86';

// 每站插畫：fills＝色塊（不描邊）；lines＝墨線（不填色）；viewBox 0 0 64 64
const ART = {
  taipei: { // 老茶罐
    fills: `<rect x="17" y="21" width="30" height="33" rx="4" fill="${BRICK}"/><rect x="15" y="13" width="34" height="9" rx="3" fill="${MUSTARD}"/><rect x="23" y="29" width="18" height="16" rx="2" fill="${PAPER}"/>`,
    lines: `<rect x="17" y="21" width="30" height="33" rx="4"/><rect x="15" y="13" width="34" height="9" rx="3"/><rect x="23" y="29" width="18" height="16" rx="2"/><path d="M28 34h8M32 32v10M28 39l-2 3M36 39l2 3"/><path d="M24 8c2 2 2 4 0 6M32 6c2 2 2 4 0 6M40 8c2 2 2 4 0 6" opacity=".7"/>` },
  newtaipei: { // 山城燈籠
    fills: `<ellipse cx="32" cy="35" rx="15" ry="17" fill="${BRICK}"/><rect x="25" y="13" width="14" height="6" rx="2" fill="${MUSTARD}"/><rect x="26" y="51" width="12" height="5" rx="2" fill="${MUSTARD}"/>`,
    lines: `<ellipse cx="32" cy="35" rx="15" ry="17"/><path d="M32 18v34M24 21c-4 8-4 20 0 28M40 21c4 8 4 20 0 28"/><rect x="25" y="13" width="14" height="6" rx="2"/><rect x="26" y="51" width="12" height="5" rx="2"/><path d="M32 8v5M32 56v6M29 60l3 2 3-2"/>` },
  taoyuan: { // 埤塘與白鷺鷥
    fills: `<circle cx="46" cy="17" r="7" fill="${MUSTARD}"/><ellipse cx="32" cy="46" rx="25" ry="10" fill="${TEAL}"/><path d="M20 34c3-6 9-7 12-4 2 2 1 6-3 6h-9z" fill="${PAPER}"/>`,
    lines: `<ellipse cx="32" cy="46" rx="25" ry="10"/><path d="M14 46c4-2 8 2 12 0M34 48c4-2 8 2 12 0"/><path d="M20 34c3-6 9-7 12-4 2 2 1 6-3 6h-9zM32 30l6-6 4 1-4 1M24 36v6M27 36v6"/><circle cx="46" cy="17" r="7"/><path d="M9 40V24M12 40V28M55 42V27"/>` },
  hsinchu: { // 米粉與九降風
    fills: `<path d="M12 34h40c0 12-9 20-20 20S12 46 12 34z" fill="${BRICK}"/><ellipse cx="32" cy="34" rx="20" ry="4" fill="${PAPER}"/>`,
    lines: `<path d="M12 34h40c0 12-9 20-20 20S12 46 12 34z"/><ellipse cx="32" cy="34" rx="20" ry="4"/><path d="M22 33c2-8 4 4 6-4s4 4 6-4 4 4 6-3"/><path d="M42 10l12 18M47 9l10 16"/><path d="M6 14c6-3 10 3 16 0M4 22c6-3 10 3 16 0" opacity=".7"/>` },
  miaoli: { // 客家花布
    fills: `<rect x="11" y="11" width="42" height="42" rx="3" fill="${BRICK}"/><circle cx="24" cy="24" r="8" fill="${ROSE}"/><circle cx="41" cy="40" r="9" fill="${ROSE}"/><circle cx="24" cy="24" r="3" fill="${MUSTARD}"/><circle cx="41" cy="40" r="3.5" fill="${MUSTARD}"/><path d="M36 18c6-2 10 2 9 6-5 1-8-1-9-6zM16 42c4-4 9-3 10 1-4 3-8 2-10-1z" fill="${SAGE}"/>`,
    lines: `<rect x="11" y="11" width="42" height="42" rx="3"/><circle cx="24" cy="24" r="8"/><circle cx="41" cy="40" r="9"/><path d="M24 16v16M16 24h16M41 31v18M32 40h18"/><path d="M36 18c6-2 10 2 9 6-5 1-8-1-9-6zM16 42c4-4 9-3 10 1-4 3-8 2-10-1z"/>` },
  taichung: { // 紅磚老車站
    fills: `<path d="M10 28h44v24H10z" fill="${BRICK}"/><path d="M14 28l18-14 18 14z" fill="${TEAL}"/><circle cx="32" cy="22" r="4" fill="${PAPER}"/><path d="M28 52V41a4 4 0 0 1 8 0v11z" fill="${PAPER}"/><rect x="15" y="34" width="7" height="8" fill="${PAPER}"/><rect x="42" y="34" width="7" height="8" fill="${PAPER}"/>`,
    lines: `<path d="M10 28h44v24H10zM14 28l18-14 18 14M6 52h52"/><circle cx="32" cy="22" r="4"/><path d="M32 20v2h2"/><path d="M28 52V41a4 4 0 0 1 8 0v11"/><rect x="15" y="34" width="7" height="8"/><rect x="42" y="34" width="7" height="8"/>` },
  changhua: { // 扇形車庫
    fills: `<path d="M6 50a26 26 0 0 1 52 0z" fill="${MUSTARD}"/><rect x="25" y="40" width="14" height="10" rx="2" fill="${TEAL}"/>`,
    lines: `<path d="M6 50a26 26 0 0 1 52 0zM2 50h60"/><path d="M32 50 12 32M32 50 22 26M32 50l10-24M32 50l20-18M32 50V24"/><rect x="25" y="40" width="14" height="10" rx="2"/><path d="M28 40v-4h4v4"/><circle cx="29" cy="51" r="2"/><circle cx="36" cy="51" r="2"/>` },
  chiayi: { // 阿里山日出
    fills: `<circle cx="32" cy="28" r="9" fill="${MUSTARD}"/><path d="M2 52l18-22 12 14 10-10 20 18z" fill="${SAGE}"/><path d="M20 30l12 14-8 8H2z" fill="${TEAL}"/>`,
    lines: `<path d="M2 52l18-22 12 14 10-10 20 18zM2 52h60"/><circle cx="32" cy="28" r="9"/><path d="M32 12v4M20 17l3 3M44 17l-3 3M14 28h4M46 28h4"/><path d="M46 40v8M42 46l4-4 4 4M50 44v6" opacity=".8"/>` },
  tainan: { // 柑仔店糖果罐
    fills: `<rect x="16" y="20" width="32" height="34" rx="8" fill="${PAPER}"/><rect x="18" y="12" width="28" height="8" rx="3" fill="${BRICK}"/><circle cx="25" cy="44" r="4" fill="${BRICK}"/><circle cx="35" cy="46" r="4" fill="${TEAL}"/><circle cx="31" cy="37" r="4" fill="${MUSTARD}"/><circle cx="40" cy="38" r="3.5" fill="${ROSE}"/>`,
    lines: `<rect x="16" y="20" width="32" height="34" rx="8"/><rect x="18" y="12" width="28" height="8" rx="3"/><circle cx="25" cy="44" r="4"/><circle cx="35" cy="46" r="4"/><circle cx="31" cy="37" r="4"/><circle cx="40" cy="38" r="3.5"/><path d="M21 26v8" opacity=".6"/>` },
  kaohsiung: { // 港都渡輪
    fills: `<path d="M8 38h48l-6 12H14z" fill="${BRICK}"/><rect x="20" y="27" width="22" height="11" rx="2" fill="${PAPER}"/><path d="M33 14l10 5-10 4z" fill="${MUSTARD}"/>`,
    lines: `<path d="M8 38h48l-6 12H14zM20 38V27h22v11M33 27V14l10 5-10 4"/><path d="M24 31h4M32 31h4"/><path d="M4 56c5-3 9 3 14 0s9 3 14 0 9 3 14 0 9 3 14 0"/>` },
  pingtung: { // 鳳梨
    fills: `<ellipse cx="32" cy="42" rx="13" ry="16" fill="${MUSTARD}"/><path d="M32 26c-3-6-8-10-12-11 3 4 4 8 6 11zM32 26c0-7 1-13 0-18 3 5 4 11 2 18zM32 26c3-6 8-10 12-11-3 4-4 8-6 11z" fill="${SAGE}"/>`,
    lines: `<ellipse cx="32" cy="42" rx="13" ry="16"/><path d="M22 34l18 18M20 42l14 14M28 28l16 16M42 34 24 52M44 42 30 56M36 28 20 44"/><path d="M32 26c-3-6-8-10-12-11 3 4 4 8 6 11M32 26c0-7 1-13 0-18 3 5 4 11 2 18M32 26c3-6 8-10 12-11-3 4-4 8-6 11"/>` },
  hualien: { // 太魯閣峽谷與海浪
    fills: `<path d="M4 12h18l-4 18 6 24H4z" fill="${SAGE}"/><path d="M60 12H42l5 16-6 26h19z" fill="${SAGE}"/><path d="M24 54c4-10 10-16 18-26l5 0-6 26z" fill="${TEAL}"/>`,
    lines: `<path d="M4 12h18l-4 18 6 24M60 12H42l5 16-6 26"/><path d="M8 22h8M10 38h8M48 22h8M46 40h8" opacity=".7"/><path d="M26 54c3-4 6 0 9-3s6 0 9-3"/><path d="M2 60c5-3 9 3 14 0s9 3 14 0 9 3 14 0 9 3 14 0"/>` },
};

// 單站插畫（套色錯位）
export function stopArt(id, size = 64) {
  const a = ART[id]; if (!a) return '';
  return `<svg class="jr-art" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true"><g transform="translate(1.6 1.6)">${a.fills}</g><g fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" filter="url(#mmWobble)">${a.lines}</g></svg>`;
}

// 紀念章：圓形印章，外圈站名、中間插畫（像車站紀念章）
let stampN = 0;
export function stamp(stop, size = 120, { faded = false, rot = -6 } = {}) {
  const id = 'jrs' + (++stampN);
  const color = faded ? '#B8B2A3' : BRICK;
  const art = faded ? '' : `<g transform="translate(30 30) scale(.94)" opacity=".95"><g transform="translate(1.6 1.6)">${ART[stop.id].fills}</g><g fill="none" stroke="${INK}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ART[stop.id].lines}</g></g>`;
  return `<svg class="jr-stamp" width="${size}" height="${size}" viewBox="0 0 120 120" role="img" aria-label="${stop.name}紀念章" style="transform:rotate(${rot}deg)">
    <defs><path id="${id}t" d="M18 60a42 42 0 0 1 84 0"/><path id="${id}b" d="M24 64a36 36 0 0 0 72 0"/></defs>
    <circle cx="60" cy="60" r="56" fill="${faded ? 'none' : '#FFF8EA'}" stroke="${color}" stroke-width="3" ${faded ? 'stroke-dasharray="5 6"' : ''}/>
    <circle cx="60" cy="60" r="49" fill="none" stroke="${color}" stroke-width="1.4"/>
    ${art}
    <text font-size="11.5" font-weight="700" fill="${color}" letter-spacing="2"><textPath href="#${id}t" startOffset="50%" text-anchor="middle">${stop.name}</textPath></text>
    <text font-size="9" fill="${color}" letter-spacing="3"><textPath href="#${id}b" startOffset="50%" text-anchor="middle">心動力・迺台灣</textPath></text>
  </svg>`;
}

// 骰子（墨線）
export function dieSVG(n = 3, size = 96) {
  const P = { 1: [[32, 32]], 2: [[22, 22], [42, 42]], 3: [[20, 20], [32, 32], [44, 44]] }[n] || [];
  return `<svg width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true"><rect x="9.6" y="9.6" width="46" height="46" rx="10" fill="${MUSTARD}"/><rect x="8" y="8" width="46" height="46" rx="10" fill="${PAPER}" fill-opacity=".35" stroke="${INK}" stroke-width="2.4"/>${P.map(([x, y]) => `<circle cx="${x - 1}" cy="${y - 1}" r="4.5" fill="${BRICK}"/>`).join('')}</svg>`;
}

// 明信片框：卡片頁上方的站點插畫
export function postcard(stop, label) {
  return `<div class="jr-postcard">
    <div class="jr-pc-art">${stopArt(stop.id, 80)}</div>
    <div class="jr-pc-text"><span class="jr-pc-label">${label}</span><b>${stop.name}</b><span class="jr-pc-story">${stop.story}</span></div>
    <span class="jr-pc-mark" aria-hidden="true">${stop.name.split('・')[0]}<br>郵</span>
  </div>`;
}

// 紙張紋理（地圖底）
export const PAPER_FILTER = `<filter id="jrPaper" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="7" result="n"/><feColorMatrix in="n" type="matrix" values="0 0 0 0 .45  0 0 0 0 .38  0 0 0 0 .28  0 0 0 .09 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>`;
