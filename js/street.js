// 心動力 AI｜台灣街屋水彩場景（原創 SVG：鋼筆線稿＋水彩暈染）
// 參考的是「鋼筆淡彩、台灣街屋、紅燈籠、青綠窗框、植栽」這種氛圍，所有構圖與線條都是團隊自行繪製，
// 不臨摹任何既有畫作。水彩感來自全站共用濾鏡：#mmWash（暈開＋邊緣積色）、#mmWobble（墨線抖動）。

let uid = 0;
const nid = p => `${p}${++uid}`;

// 水彩色票（與 css 的 design tokens 一致）
export const WC = {
  ink: '#3B2E28', paper: '#FBF6EA',
  sky: '#7DB4D3', skyL: '#B9D8E8',
  wall: '#EEDFC3', wall2: '#E5C99C', wall3: '#F2E8D6',
  teal: '#3E8A84', tealD: '#2C6662', tealL: '#BFDCD3',
  red: '#D2492F', redL: '#EC8A62', brick: '#B8553D',
  ochre: '#E0A93F', leaf: '#5E9443', leafL: '#9DC164', leafD: '#3F6E3A',
  stone: '#CDBFA6', wood: '#8A5A3B', shade: '#7A6352', water: '#5E9FBE',
};

// 一層水彩：同色塊一起暈開（每層一個濾鏡，手機也跑得動）
const wash = (color, shapes, op = 1) => `<g filter="url(#mmWash)" fill="${color}" opacity="${op}">${shapes}</g>`;
// 墨線：細、略抖、偶爾出頭，像鋼筆速寫
// 畫兩次、第二次略偏移變淡，像鋼筆來回描的速寫線
const ink = (shapes, w = 1.1, op = .85) => `<g fill="none" stroke="${WC.ink}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" filter="url(#mmWobble)" opacity="${op}">${shapes}<g transform="translate(.9 .6)" opacity=".4" stroke-width="${w * .7}">${shapes}</g></g>`;
// 水彩積色、渲染斑：大片柔邊色塊，讓牆面、天空有深淺
const bloom = (spots, op = .38) => `<g filter="url(#mmBloom)" opacity="${(op * .55).toFixed(2)}">${spots.map(([x, y, r, c], i) => `<ellipse cx="${x}" cy="${y}" rx="${r * 1.9}" ry="${r * 1.1}" transform="rotate(${(i * 37) % 50 - 25} ${x} ${y})" fill="${c}"/>`).join('')}</g>`;
// 顏料噴濺的小點
const splat = (pts, c, op = .55) => `<g fill="${c}" opacity="${op}">${pts.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}"/>`).join('')}</g>`;
// 陰影排線
// 零星的紅磚、牆面裂紋：速寫常見的小細節
const bricks = (pts) => pts.map(([x, y]) => `<rect x="${x}" y="${y}" width="9" height="4"/><rect x="${x + 5}" y="${y + 4}" width="9" height="4"/>`).join('');
const hatch = d => `<path d="${d}" fill="url(#mmHatch)" opacity=".9"/>`;
const P = d => `<path d="${d}"/>`;
const R = (x, y, w, h, rx = 0) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"/>`;

// 紅燈籠：寫上「心動」，晚上會亮
export function lantern(x, y, s = 1, { night = false, word = '' } = {}) {
  const rx = 9 * s, ry = 11 * s;
  const glow = night ? `<circle cx="${x}" cy="${y}" r="${ry * 2.6}" fill="#F7B65A" opacity=".28"/><circle cx="${x}" cy="${y}" r="${ry * 1.5}" fill="#FBD48A" opacity=".35"/>` : '';
  return glow + wash(night ? '#F0663F' : WC.red, `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>`)
    + wash('#3B2E28', `${R(x - rx * .55, y - ry - 2.6 * s, rx * 1.1, 3.2 * s, 1)}${R(x - rx * .55, y + ry - .6 * s, rx * 1.1, 3.2 * s, 1)}`, .85)
    + `<ellipse cx="${x - rx * .35}" cy="${y - ry * .3}" rx="${rx * .28}" ry="${ry * .45}" fill="#FFF3DC" opacity="${night ? .6 : .35}"/>`
    + ink(`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}"/>${P(`M${x} ${y - ry} V${y + ry}M${x - rx * .6} ${y - ry * .8}Q${x - rx * 1.05} ${y} ${x - rx * .6} ${y + ry * .8}M${x + rx * .6} ${y - ry * .8}Q${x + rx * 1.05} ${y} ${x + rx * .6} ${y + ry * .8}M${x} ${y + ry + 2.6 * s}v${7 * s}`)}`, .9)
    + (word ? `<text x="${x}" y="${y + 3.4 * s}" text-anchor="middle" font-family="'Noto Serif TC',serif" font-weight="900" font-size="${7.5 * s}" fill="#2E211B" opacity=".85">${word}</text>` : '');
}

// 吊掛的植物（黃金葛、蕨類），從屋簷垂下
function hangingLeaves(x, y, len, s = 1) {
  let blobs = '';
  for (let i = 0; i < len; i++) {
    const yy = y + i * 7 * s, xx = x + Math.sin(i * 1.3) * 5 * s;
    blobs += `<ellipse cx="${xx - 4 * s}" cy="${yy}" rx="${5 * s}" ry="${3.4 * s}" transform="rotate(-25 ${xx} ${yy})"/><ellipse cx="${xx + 4 * s}" cy="${yy + 3 * s}" rx="${5 * s}" ry="${3.4 * s}" transform="rotate(25 ${xx} ${yy})"/>`;
  }
  return blobs;
}

// 夜晚、黃昏、清晨的整體色溫（疊一層透明色）
function tint(W, H, t) {
  if (t === 'night') return `<rect width="${W}" height="${H}" fill="#1D2B4A" opacity=".52"/>`;
  if (t === 'dusk') return `<rect width="${W}" height="${H}" fill="#E8925A" opacity=".16"/>`;
  if (t === 'dawn') return `<rect width="${W}" height="${H}" fill="#F4C7A4" opacity=".14"/>`;
  return '';
}

// ---------- 首頁花園：台灣街屋騎樓前的一排盆栽 ----------
// 給 gardenSVG 當背景（W=400, H=320）；植物種在 y 230～304 的人行道上
export function streetBack(W, H, t = 'day') {
  const night = t === 'night';
  const winGlow = night ? '#F4C76E' : WC.tealL;
  const sky = night ? '#33476B' : t === 'dusk' ? '#E7A57A' : WC.sky;
  return `
    <rect width="${W}" height="${H}" fill="${WC.paper}"/>
    ${wash(sky, P(`M0 0H${W}V46L272 62V24H130V52H92Q66 28 40 52H0Z`), .55)}
    ${wash(night ? '#4A5F85' : WC.skyL, P('M150 4Q200 -6 250 6Q236 16 196 14Q166 16 150 4Z'), .5)}
    ${bloom([[40, 8, 30, WC.sky], [330, 12, 34, '#5E9CC4'], [210, 2, 26, '#5E9CC4']], night ? .2 : .45)}
    ${night ? Array.from({ length: 12 }, (_, i) => `<circle class="twinkle" style="animation-delay:${(i % 5) * .6}s" cx="${(i * 97 + 20) % W}" cy="${6 + (i * 29) % 40}" r="1.3" fill="#FFF7D6"/>`).join('') : ''}

    <!-- 左：山牆老街屋 -->
    ${wash(WC.wall, P('M2 58H40Q66 34 92 56Q112 52 128 60L126 152Q96 162 64 150Q30 160 4 150Z'))}
    ${wash(WC.wall, P('M6 196Q60 190 126 198V214H6Z'), .8)}
    ${wash(WC.wall2, P('M0 52H40Q66 28 92 52H132V64H0Z M0 196H132V216H0Z'), .7)}
    ${wash(WC.teal, R(20, 78, 92, 54, 2))}
    ${wash(winGlow, `${R(26, 84, 24, 20)}${R(54, 84, 24, 20)}${R(82, 84, 24, 20)}${R(26, 108, 24, 19)}${R(54, 108, 24, 19)}${R(82, 108, 24, 19)}`, night ? .9 : .8)}
    ${wash('#8DB3AE', P('M8 140H124L136 158H-4Z'))}
    ${wash(WC.shade, R(0, 158, 132, 58), .5)}
    ${wash('#5E9C8F', R(12, 166, 74, 50), .85)}
    ${wash(WC.red, R(108, 162, 16, 46, 1))}
    <text x="116" y="176" text-anchor="middle" font-family="'Noto Serif TC',serif" font-weight="900" font-size="10" fill="#FFF3DC">心</text>
    <text x="116" y="190" text-anchor="middle" font-family="'Noto Serif TC',serif" font-weight="900" font-size="10" fill="#FFF3DC">動</text>
    <text x="116" y="204" text-anchor="middle" font-family="'Noto Serif TC',serif" font-weight="900" font-size="10" fill="#FFF3DC">茶</text>
    ${ink(`${P('M0 52H40Q66 28 92 52H132V216')}${P('M0 64H132')}${R(20, 78, 92, 54, 2)}${P('M50 78V132M54 78V132M78 78V132M82 78V132M20 105H112')}${P('M8 140H124L136 158H-4Z')}${P('M20 140L16 158M36 140L34 158M52 140L52 158M68 140L69 158M84 140L86 158M100 140L104 158M116 140L121 158')}${R(12, 166, 74, 50)}${P('M12 174H86M12 182H86M12 190H86M12 198H86M12 206H86')}${R(108, 162, 16, 46, 1)}${P('M66 36V44M60 46Q66 40 72 46')}`)}
    ${wash(WC.leaf, hangingLeaves(16, 136, 4, 1) + hangingLeaves(118, 134, 3, .9))}

    <!-- 中：兩層樓洗石子街屋，屋頂的植物垂下來 -->
    ${wash('#EBDDC4', P('M136 30Q200 22 268 32L266 140Q232 132 200 142Q168 132 138 142Z'))}
    ${wash('#EBDDC4', P('M136 150H268V214Q200 206 136 214Z'), .5)}
    ${wash('#D9C3A0', `${R(132, 24, 140, 10)}${R(132, 140, 140, 8)}`, .8)}
    ${wash(WC.teal, `${P('M150 112V74Q170 54 190 74V112Z')}${P('M214 112V74Q234 54 254 74V112Z')}`)}
    ${wash(winGlow, `${P('M155 108V76Q170 61 185 76V108Z')}${P('M219 108V76Q234 61 249 76V108Z')}`, night ? .9 : .75)}
    ${wash(WC.shade, P('M132 148H272V216H132Z'), .45)}
    ${wash('#EADCC2', `${P('M142 216V176Q162 152 182 176V216Z')}${P('M222 216V176Q242 152 262 176V216Z')}`, .9)}
    ${wash(WC.wood, R(190, 168, 24, 48), .8)}
    ${ink(`${R(132, 24, 140, 192)}${P('M132 34H272M132 140H272M132 148H272')}${P('M150 112V74Q170 54 190 74V112ZM214 112V74Q234 54 254 74V112Z')}${P('M170 64V112M150 92H190M234 64V112M214 92H254')}${P('M144 118H196M144 124H196M208 118H260M208 124H260')}${P('M148 118V124M156 118V124M164 118V124M172 118V124M180 118V124M188 118V124M212 118V124M220 118V124M228 118V124M236 118V124M244 118V124M252 118V124')}${P('M142 216V176Q162 152 182 176V216M222 216V176Q242 152 262 176V216')}${R(190, 168, 24, 48)}${P('M202 168V216')}`)}
    ${wash(WC.leafD, P('M118 30Q130 6 156 12Q170 -2 196 8Q222 -4 244 10Q268 2 286 24Q276 34 258 28Q240 38 220 26Q200 36 182 26Q160 38 142 28Q128 38 118 30Z'), .85)}
    ${wash(WC.leafL, P('M136 22Q150 8 170 16Q186 6 204 16Q226 8 240 18Q226 26 204 22Q186 30 168 22Q150 30 136 22Z'), .8)}
    ${wash(WC.leaf, hangingLeaves(146, 30, 5, 1) + hangingLeaves(262, 28, 6, 1) + hangingLeaves(206, 30, 3, .8))}

    <!-- 右：紅瓦斜屋頂的柑仔店 -->
    ${wash(WC.wall, P('M276 84Q340 68 398 62L396 166Q350 156 312 166Q290 158 276 166Z'))}
    ${wash(WC.brick, P('M262 72L400 48V66L272 82Z'))}
    ${wash(WC.teal, `${R(292, 96, 26, 36)}${R(346, 92, 26, 36)}`)}
    ${wash(winGlow, `${R(296, 100, 18, 28)}${R(350, 96, 18, 28)}`, night ? .9 : .75)}
    ${wash(WC.tealD, R(284, 142, 108, 20, 2))}
    <text x="338" y="157" text-anchor="middle" font-family="'Noto Serif TC',serif" font-weight="900" font-size="13" letter-spacing="3" fill="#FFF3DC">心動雜貨</text>
    ${wash(WC.shade, R(272, 164, 128, 52), .5)}
    ${wash('#D6B98C', R(290, 176, 46, 40), .85)}
    ${wash(WC.ochre, `<circle cx="300" cy="196" r="5"/><circle cx="313" cy="196" r="5"/><circle cx="326" cy="196" r="5"/>`, .9)}
    ${wash('#CFD8D8', R(350, 108, 22, 14), .9)}
    ${ink(`${P('M272 82V216M262 72L400 48M272 82L400 66')}${P('M280 80L284 72M300 77L304 69M320 74L324 66M340 71L344 63M360 68L364 60M380 65L384 57')}${R(292, 96, 26, 36)}${R(346, 92, 26, 36)}${P('M305 96V132M359 92V128')}${R(284, 142, 108, 20, 2)}${R(290, 176, 46, 40)}${P('M290 188H336')}${R(350, 108, 22, 14)}`)}

    ${bloom([[24, 100, 26, '#D9B27A'], [116, 70, 18, '#C98F5A'], [150, 190, 26, '#9C7A5A'], [256, 60, 22, '#D9B27A'], [300, 200, 28, '#8A6A50'], [390, 110, 24, '#D69A6A'], [66, 200, 24, '#6E8FA0'], [210, 140, 20, '#E0A93F']], .32)}
    ${hatch('M0 158H132V176H0Z M132 148H272V166H132Z M272 164H400V180H272Z')}
    ${wash(WC.brick, bricks([[100, 70], [6, 136], [240, 40], [150, 128], [380, 140], [290, 70]]), .55)}
    ${ink(bricks([[100, 70], [6, 136], [240, 40], [150, 128], [380, 140], [290, 70]]) + P('M136 60h6M140 64h4M262 104h6M258 108h8M300 140h10M386 80h8M96 136h-6'), .6, .55)}
    ${ink(P('M4 70l3 6M10 66l2 8M120 120l5 4M262 40l4 6M266 44l3 3M280 120l6 2M286 126l4 1M140 200l6-3M388 190l-5 4'), .7, .5)}
    <!-- 電線與燈籠 -->
    ${ink(`${P(`M0 30Q120 58 ${W} 26`)}${P(`M0 40Q200 70 ${W} 36`)}`, .8, .6)}
    ${lantern(52, 158, .9, { night })}${lantern(160, 150, 1, { night, word: '心' })}${lantern(244, 150, 1, { night, word: '動' })}${lantern(380, 172, .85, { night })}

    <!-- 人行道（磨石子＋紅磚邊） -->
    ${wash(WC.stone, P(`M-4 214H${W + 4}V246Q330 268 262 254Q182 280 100 260Q40 274 -4 258Z`), .75)}
    ${wash('#E2D3B6', P('M70 292Q160 278 250 294Q330 286 380 300Q300 314 200 308Q120 316 70 292Z'), .55)}
    ${wash(WC.brick, R(-4, 212, W + 8, 6), .7)}
    ${ink(`${P(`M-4 212H${W + 4}M-4 218H${W + 4}`)}${P('M60 218L30 320M140 218L124 320M260 218L276 320M340 218L370 320')}`, .8, .4)}
    ${bloom([[60, 240, 30, '#9DB3C0'], [200, 236, 36, '#B9A27E'], [330, 290, 34, '#9DB3C0'], [120, 300, 28, '#C9A06A']], .3)}
    ${splat([[90, 250, 1.6], [96, 256, 1], [230, 290, 1.4], [310, 252, 1.2], [176, 306, 1.8], [20, 300, 1.1]], WC.brick, .4)}
    <!-- 角落的大盆栽與長椅 -->
    ${wash('#B9603F', P('M12 248H54L48 286H18Z'))}
    ${wash(WC.leaf, P('M33 250Q10 236 6 214Q22 220 30 240Q24 214 34 196Q44 216 38 242Q48 220 64 214Q60 236 36 252Z'))}
    ${ink(P('M12 248H54L48 286H18ZM33 250Q10 236 6 214M33 250Q34 220 34 196M35 250Q56 232 64 214'))}
    ${wash(WC.wood, `${R(336, 240, 56, 6, 2)}${R(336, 228, 56, 5, 2)}${R(340, 246, 5, 18)}${R(383, 246, 5, 18)}`, .9)}
    ${ink(`${R(336, 240, 56, 6, 2)}${R(336, 228, 56, 5, 2)}${P('M342 246V264M386 246V264')}`)}
    ${tint(W, H, t)}
    ${night ? `${lantern(160, 150, 1, { night, word: '心' })}${lantern(244, 150, 1, { night, word: '動' })}${lantern(52, 158, .9, { night })}${lantern(380, 172, .85, { night })}
      <g fill="#F4C76E" opacity=".55">${R(26, 84, 80, 43)}${P('M155 108V76Q170 61 185 76V108ZM219 108V76Q234 61 249 76V108Z')}${R(296, 100, 18, 28)}${R(350, 96, 18, 28)}</g>` : ''}`;
}

// ---------- 心靈湖畔：河堤、紅柱涼亭、蓮葉 ----------
export function lakeWC(flowers = 0) {
  const lotus = Array.from({ length: Math.min(flowers, 9) }, (_, i) => {
    const x = 60 + (i * 47) % 300, y = 214 + (i * 23) % 60;
    return wash(WC.leaf, `<ellipse cx="${x}" cy="${y}" rx="17" ry="5.5"/>`, .85)
      + wash('#F2A7B8', [-36, -12, 12, 36].map(d => `<path d="M${x} ${y} c-5 -8 -4 -16 0 -20 c4 4 5 12 0 20Z" transform="rotate(${d} ${x} ${y})"/>`).join(''), .9)
      + ink(`<path d="M${x} ${y} c-5 -9 -4 -18 0 -22 c4 4 5 13 0 22Z"/>`, .8, .7);
  }).join('');
  return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMax slice" role="img" aria-label="心靈湖畔，湖上開了 ${flowers} 朵心情之花">
    <rect width="400" height="300" fill="${WC.paper}"/>
    ${wash(WC.sky, P('M0 0H400V120Q340 100 300 112Q240 88 190 110Q130 92 80 112Q40 100 0 116Z'), .5)}
    ${bloom([[60, 20, 40, '#5E9CC4'], [300, 30, 50, '#5E9CC4'], [200, 60, 30, '#9CC6DD']], .5)}
    ${wash(WC.ochre, '<circle cx="96" cy="70" r="22"/>', .55)}
    ${wash('#86A9B8', P('M0 150L40 118L78 134L120 104L168 138L214 120L250 142H0Z'), .55)}
    ${wash('#7EA27A', P('M0 168Q90 140 180 160T400 150V190H0Z'), .7)}
    ${wash(WC.water, P('M0 178Q200 166 400 178V300H0Z'), .6)}
    ${wash('#A9D0E0', P('M30 200Q120 192 210 200Q120 206 30 200ZM180 240Q280 232 380 240Q280 246 180 240Z'), .8)}
    ${bloom([[80, 230, 40, '#3F7FA0'], [260, 270, 50, '#3F7FA0'], [340, 200, 30, '#5E9443']], .4)}
    ${splat([[140, 40, 1.6], [150, 46, 1], [250, 30, 1.3], [40, 260, 1.4], [370, 280, 1.8]], WC.sky, .6)}
    <!-- 涼亭 -->
    ${wash(WC.tealD, P('M262 104Q300 76 338 104L350 112H250Z'))}
    ${wash(WC.ochre, P('M296 76H304L300 66Z'))}
    ${wash(WC.red, `${R(262, 112, 9, 54)}${R(284, 112, 9, 54)}${R(306, 112, 9, 54)}${R(328, 112, 9, 54)}`)}
    ${wash(WC.stone, R(250, 164, 100, 10), .9)}
    ${ink(`${P('M262 104Q300 76 338 104L350 112H250ZM300 66V80')}${P('M267 112V164M289 112V164M311 112V164M333 112V164M250 164H350V174H250Z')}${P('M262 132H338')}`)}
    ${wash('#5E9C8F', '<ellipse cx="300" cy="196" rx="70" ry="6"/>', .5)}
    ${ink(`${P('M40 210q20 -5 40 0t40 0M150 260q20 -5 40 0t40 0M260 216q16 -4 32 0')}`, 1, .45)}
    <!-- 岸邊蘆葦、垂柳 -->
    ${wash(WC.leafD, P('M0 200Q20 120 60 96Q40 140 46 200ZM10 200Q28 150 22 110Q2 150 0 200Z'), .85)}
    ${wash(WC.leafL, P('M372 190Q378 150 392 128Q394 160 386 190ZM356 192Q356 160 366 140Q372 166 366 192Z'), .9)}
    ${ink(P('M30 200V120M372 190L388 132M362 192L366 142'), 1, .6)}
    ${lotus}
  </svg>`;
}

// ---------- 活力森林：山城石階、榕樹、一串紅燈籠 ----------
export function forestWC() {
  const steps = Array.from({ length: 9 }, (_, i) => {
    const y = 220 - i * 16, x0 = 150 + i * 10, x1 = 262 - i * 6;
    return R(x0, y - 8, x1 - x0, 8);
  }).join('');
  const stepLines = Array.from({ length: 9 }, (_, i) => {
    const y = 220 - i * 16, x0 = 150 + i * 10, x1 = 262 - i * 6;
    return P(`M${x0} ${y - 8}H${x1}M${x0} ${y}H${x1}`);
  }).join('');
  return `<svg viewBox="0 0 400 220" preserveAspectRatio="xMidYMid slice" role="img" aria-label="活力森林：山城石階">
    <rect width="400" height="220" fill="${WC.paper}"/>
    ${wash(WC.sky, P('M120 0H330Q320 40 290 60Q250 50 220 70Q180 52 150 60Q126 34 120 0Z'), .5)}
    ${wash('#8FB0B4', P('M150 80L190 52L226 70L262 46L300 76V100H150Z'), .5)}
    <!-- 左邊大榕樹 -->
    ${wash(WC.leafD, P('M-10 -10H150Q170 30 140 60Q160 90 120 110Q90 130 60 112Q30 132 -10 118Z'), .85)}
    ${wash(WC.leafL, P('M10 20Q50 0 90 22Q120 14 132 42Q110 60 80 50Q50 70 20 52Q0 40 10 20Z'), .75)}
    ${wash(WC.wood, P('M54 220Q62 160 58 110Q70 120 76 112Q80 160 92 220Z'))}
    ${ink(P('M54 220Q62 160 58 110M92 220Q80 160 76 112M64 150Q40 140 30 118M80 140Q100 128 112 108M66 120V180M72 124V200'))}
    ${bloom([[30, 30, 40, '#2F5E33'], [110, 70, 30, '#3F6E3A'], [70, 10, 26, '#B9D46A']], .45)}
    <!-- 右邊老屋與燈籠 -->
    ${wash(WC.wall, P('M286 40H400V220H274Z'))}
    ${wash(WC.brick, P('M278 46L340 24L406 40V52L340 34L284 56Z'))}
    ${wash(WC.teal, `${R(300, 80, 30, 40)}${R(352, 76, 32, 44)}`)}
    ${wash(WC.tealL, `${R(304, 84, 22, 32)}${R(356, 80, 24, 36)}`, .8)}
    ${wash(WC.shade, P('M280 150H400V220H276Z'), .45)}
    ${wash(WC.red, R(380, 130, 14, 50, 1))}
    ${ink(`${P('M286 52V220M278 46L340 24L406 40M284 56L340 34L406 52')}${R(300, 80, 30, 40)}${R(352, 76, 32, 44)}${P('M315 80V120M368 76V120M300 100H330M352 98H384')}${P('M280 150H400')}${R(380, 130, 14, 50, 1)}`)}
    ${bloom([[300, 110, 26, '#D9B27A'], [380, 190, 30, '#8A6A50'], [330, 60, 20, '#C98F5A']], .35)}
    ${hatch('M280 150H400V170H280Z')}
    <!-- 石階 -->
    ${wash(WC.stone, steps, .85)}
    ${wash('#A99A80', P('M150 220L240 92L246 92L162 220Z'), .35)}
    ${ink(stepLines, .9, .6)}
    ${ink(P('M140 220L238 84M272 220L250 84'), 1, .7)}
    <!-- 一串燈籠 -->
    ${ink(P('M110 40Q220 90 400 60'), .8, .6)}
    ${lantern(150, 70, .75)}${lantern(196, 82, .8)}${lantern(246, 86, .85)}${lantern(300, 80, .8, { word: '動' })}
    ${wash(WC.leaf, P('M240 220Q236 196 250 184Q262 200 256 220Z M120 220Q110 200 124 186Q140 204 132 220Z'), .9)}
    ${bloom([[200, 200, 30, '#8A7A60'], [150, 210, 22, '#6E8FA0']], .3)}
    ${splat([[180, 30, 1.4], [190, 36, .9], [260, 20, 1.2], [120, 200, 1.5]], WC.red, .45)}
  </svg>`;
}

// ---------- 知識花園：街角的小書報攤 ----------
export function shopWC() {
  const books = Array.from({ length: 14 }, (_, i) => {
    const x = 120 + i * 12 + (i > 6 ? 8 : 0), h = 22 + (i * 7) % 10;
    const c = [WC.red, WC.teal, WC.ochre, WC.leaf, '#7A8FB8'][i % 5];
    return `<rect x="${x}" y="${i > 6 ? 128 - h : 96 - h}" width="10" height="${h}" fill="${c}"/>`;
  }).join('');
  return `<svg viewBox="0 0 400 200" preserveAspectRatio="xMidYMid slice" role="img" aria-label="知識花園：街角書報攤">
    <rect width="400" height="200" fill="${WC.paper}"/>
    ${wash(WC.sky, P('M0 0H400V30Q300 46 200 30Q100 44 0 30Z'), .45)}
    ${wash(WC.wall3, R(90, 22, 230, 178))}
    ${wash(WC.tealD, P('M80 30H330L320 52H90Z'))}
    <text x="205" y="47" text-anchor="middle" font-family="'Noto Serif TC',serif" font-weight="900" font-size="15" letter-spacing="6" fill="#FFF3DC">知識花園</text>
    ${wash('#E7D4B0', `${R(110, 60, 190, 40)}${R(110, 102, 190, 30)}`, .9)}
    <g filter="url(#mmWash)" opacity=".85">${books}</g>
    ${wash(WC.wood, `${R(106, 96, 198, 5)}${R(106, 130, 198, 5)}${R(100, 150, 210, 10)}`)}
    ${wash(WC.shade, R(90, 160, 230, 40), .4)}
    ${bloom([[110, 40, 26, '#D9B27A'], [300, 120, 30, '#C98F5A'], [200, 180, 34, '#8A6A50'], [40, 20, 30, '#5E9CC4'], [370, 14, 30, '#5E9CC4']], .35)}
    ${hatch('M90 160H320V176H90Z')}
    ${ink(`${R(90, 22, 230, 178)}${P('M80 30H330L320 52H90Z')}${R(110, 60, 190, 72)}${P('M106 98H304M106 132H304M100 150H310V160H100Z')}${P('M120 96V70M134 96V74M148 96V68M184 128V104M200 128V106')}`)}
    ${lantern(70, 70, .9)}${lantern(344, 70, .9, { word: '讀' })}
    ${wash('#B9603F', P('M30 170H64L60 200H34Z M346 170H380L376 200H350Z'))}
    ${wash(WC.leaf, P('M47 172Q24 160 22 132Q38 140 44 160Q40 132 50 118Q60 138 52 162Q60 142 76 136Q72 160 48 174Z M363 172Q342 158 340 136Q356 144 360 160Q362 136 372 124Q380 142 368 164Q378 148 392 146Q386 164 364 174Z'))}
    ${ink(P('M30 170H64L60 200H34ZM346 170H380L376 200H350Z'))}
  </svg>`;
}

// 給首頁或其他頁的小裝飾：一串燈籠的橫幅
export function lanternGarland(W = 360, n = 5) {
  const step = W / (n + 1);
  return `<svg viewBox="0 0 ${W} 56" width="100%" height="56" aria-hidden="true" class="garland">
    ${ink(P(`M0 6Q${W / 2} 30 ${W} 6`), .8, .55)}
    ${Array.from({ length: n }, (_, i) => { const x = step * (i + 1); const y = 6 + 24 * (1 - Math.pow((x - W / 2) / (W / 2), 2)) * .95 + 12; return lantern(x, y, .7); }).join('')}
  </svg>`;
}
