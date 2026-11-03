// 活動示範動畫：原創繪製的動態人形（SVG + SMIL 動畫），不需要網路、不佔空間
// 動作依活動口令繪製，僅為示意；正式示範影片需由專業人員確認動作標準後拍攝（見 docs/SPEC.md）

const C = { near: '#2F7D57', far: '#9CCB9F', head: '#2F7D57', prop: '#C9B79C', line: '#CFDCCB' };
const pts = a => a.map(p => p.join(',')).join(' ');

// frames：同一條線在不同時間點的座標；自動做成循環動畫
function line(frames, { color = C.near, w = 9, dur = 3, begin = 0 } = {}) {
  const vals = frames.map(pts);
  const anim = frames.length > 1
    ? `<animate attributeName="points" dur="${dur}s" begin="${begin}s" repeatCount="indefinite" values="${[...vals, vals[0]].join(';')}" calcMode="spline" keySplines="${Array(vals.length).fill('.45 0 .55 1').join(';')}" keyTimes="${[...vals, 0].map((_, i) => (i / vals.length).toFixed(3)).join(';')}"/>`
    : '';
  return `<polyline fill="none" stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" points="${vals[0]}">${anim}</polyline>`;
}
function head(frames, { dur = 3, begin = 0, r = 12 } = {}) {
  const anim = k => frames.length > 1
    ? `<animate attributeName="${k}" dur="${dur}s" begin="${begin}s" repeatCount="indefinite" values="${[...frames, frames[0]].map(f => f[k === 'cx' ? 0 : 1]).join(';')}" calcMode="spline" keySplines="${Array(frames.length).fill('.45 0 .55 1').join(';')}" keyTimes="${[...frames, 0].map((_, i) => (i / frames.length).toFixed(3)).join(';')}"/>`
    : '';
  return `<circle r="${r}" cx="${frames[0][0]}" cy="${frames[0][1]}" fill="${C.head}">${anim('cx')}${anim('cy')}</circle>`;
}
const ground = '<line x1="10" y1="182" x2="190" y2="182" stroke="#CFDCCB" stroke-width="3" stroke-linecap="round"/>';
const chairSide = `<g stroke="${C.prop}" stroke-width="6" stroke-linecap="round" fill="none"><path d="M62 64 L66 124 L122 124"/><path d="M70 124 V182 M118 124 V182"/></g>`;
const chairFront = `<g fill="${C.prop}" opacity=".55"><rect x="70" y="46" width="60" height="70" rx="8"/><rect x="64" y="110" width="72" height="14" rx="5"/></g><g stroke="${C.prop}" stroke-width="6" stroke-linecap="round"><path d="M70 124 V182 M130 124 V182"/></g>`;
const chairAhead = `<g stroke="${C.prop}" stroke-width="6" stroke-linecap="round" fill="none"><path d="M140 74 V128 H184"/><path d="M142 128 V182 M182 128 V182"/></g>`;
const table = `<g stroke="${C.prop}" stroke-width="6" stroke-linecap="round" fill="none"><path d="M138 98 H194 M188 98 V182"/></g>`;

// ---------- 側面坐姿基本姿勢 ----------
const sHead = [92, 50], sTorso = [[95, 120], [92, 72]], sArm = [[92, 74], [100, 98], [110, 116]];
const sLeg = [[95, 120], [135, 120], [136, 170], [152, 172]];
const shift = (a, dx) => a.map(([x, y]) => [x + dx, y]);

// ---------- 側面站姿基本姿勢（站在椅背後面扶著） ----------
const tHead = [100, 28], tTorso = [[100, 95], [100, 46]], tArm = [[100, 48], [118, 66], [138, 76]];
const tLeg = [[100, 95], [102, 136], [100, 176], [116, 178]];
const tLegFar = [[100, 95], [96, 136], [94, 176], [110, 178]];
const up = (a, dy) => a.map(([x, y]) => [x, y - dy]);

// ---------- 正面坐姿 ----------
const fLegs = `${line([[[88, 115], [86, 150], [86, 180]]])}${line([[[112, 115], [114, 150], [114, 180]]])}${line([[[88, 115], [112, 115]]], { w: 12 })}`;

const DEMOS = {
  'seated-knee': () => chairSide + ground
    + line([shift(sLeg, -6)], { color: C.far })
    + line([sTorso], { w: 12 }) + head([sHead]) + line([sArm])
    + line([sLeg, [[95, 120], [135, 120], [176, 140], [186, 128]]], { dur: 3.2 }),

  'seated-march': () => chairSide + ground
    + line([shift(sLeg, -6), [[89, 120], [124, 98], [128, 148], [144, 150]]], { color: C.far, dur: 2.4, begin: -1.2 })
    + line([sTorso], { w: 12 }) + head([sHead]) + line([sArm])
    + line([sLeg, [[95, 120], [130, 98], [134, 148], [150, 150]]], { dur: 2.4 }),

  'arm-circle': () => {
    const o = [[0, -9], [9, 0], [0, 9], [-9, 0]];
    const L = o.map(([dx, dy]) => [[75, 58], [52 + dx / 2, 58 + dy / 2], [30 + dx, 58 + dy]]);
    const R = o.map(([dx, dy]) => [[125, 58], [148 - dx / 2, 58 + dy / 2], [170 - dx, 58 + dy]]);
    return chairFront + ground + fLegs + line([[[100, 115], [100, 56]]], { w: 12 }) + line([[[75, 58], [125, 58]]], { w: 10 })
      + head([[100, 36]]) + line(L, { dur: 2 }) + line(R, { dur: 2 });
  },

  'seated-twist': () => {
    const sh = [[[75, 58], [125, 58]], [[86, 60], [121, 55]], [[75, 58], [125, 58]], [[79, 55], [114, 60]]];
    const armL = sh.map(([l, r]) => [l, [(l[0] + r[0]) / 2 - 6, 76], [r[0] - 14, 70]]);
    const armR = sh.map(([l, r]) => [r, [(l[0] + r[0]) / 2 + 6, 76], [l[0] + 14, 70]]);
    const torso = sh.map(([l, r]) => [[100, 115], [(l[0] + r[0]) / 2, 56]]);
    const hd = [[100, 36], [107, 37], [100, 36], [93, 37]];
    return chairFront + ground + fLegs + line(torso, { w: 12, dur: 4.4 }) + line(sh, { w: 10, dur: 4.4 })
      + head(hd, { dur: 4.4 }) + line(armL, { dur: 4.4 }) + line(armR, { dur: 4.4 });
  },

  'ankle-pump': () => {
    const A = [[95, 120], [135, 120], [136, 170], [148, 157]];
    const B = [[95, 120], [135, 120], [137, 165], [153, 175]];
    return chairSide + ground + line([shift(A, -6), shift(B, -6)], { color: C.far, dur: 2 })
      + line([sTorso], { w: 12 }) + head([sHead]) + line([sArm]) + line([A, B], { dur: 2 });
  },

  'sit-to-stand': () => {
    const seat = { h: [92, 50], t: [[95, 120], [92, 72]], a: [[92, 74], [108, 92], [126, 104]], l: [[95, 120], [134, 120], [128, 170], [143, 172]] };
    const lean = { h: [122, 62], t: [[97, 120], [116, 78]], a: [[116, 80], [128, 96], [140, 100]], l: [[97, 120], [134, 121], [128, 170], [143, 172]] };
    const stand = { h: [110, 28], t: [[112, 94], [110, 46]], a: [[110, 48], [118, 72], [128, 92]], l: [[112, 94], [124, 134], [128, 172], [143, 174]] };
    const seq = [seat, lean, stand, stand, lean, seat];
    return chairSide + table + ground
      + line(seq.map(f => shift(f.l, -6)), { color: C.far, dur: 5 })
      + line(seq.map(f => f.t), { w: 12, dur: 5 }) + head(seq.map(f => f.h), { dur: 5 })
      + line(seq.map(f => f.a), { dur: 5 }) + line(seq.map(f => f.l), { dur: 5 });
  },

  'heel-raise': () => {
    const legUp = l => l.map(([x, y], i) => (i === 3 ? [x, y] : [x + (i === 2 ? 3 : 0), y - 9]));
    return chairAhead + ground
      + line([tLegFar, legUp(tLegFar)], { color: C.far, dur: 2.6 })
      + line([tTorso, up(tTorso, 9)], { w: 12, dur: 2.6 }) + head([tHead, up([tHead], 9)[0]], { dur: 2.6 })
      + line([tArm, [[100, 39], [119, 59], [138, 76]]], { dur: 2.6 })
      + line([tLeg, legUp(tLeg)], { dur: 2.6 });
  },

  'stand-march': () => chairAhead + ground
    + line([tLegFar, [[100, 95], [120, 110], [116, 150], [130, 152]]], { color: C.far, dur: 2.4, begin: -1.2 })
    + line([tTorso], { w: 12 }) + head([tHead]) + line([tArm])
    + line([tLeg, [[100, 95], [124, 110], [120, 150], [134, 152]]], { dur: 2.4 }),
};

export function demoSVG(id) {
  const d = DEMOS[id];
  if (!d) return '';
  return `<svg class="demo" viewBox="0 0 200 190" role="img" aria-label="動作示範動畫">${d()}</svg>`;
}
