// 用合成的關鍵點資料測試每個活動的計數器：node tools/test_pose.mjs
import { DETECTORS, makeCounter } from '../js/pose.js';
const base = () => Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.5, visibility: 0.9 }));
const set = (lm, i, x, y) => { lm[i] = { x, y, visibility: 0.9 }; };
const rad = d => d * Math.PI / 180;
function seated(kneeAng = 90, lift = 0, side = 'both', ankleDorsi = 0) {
  const lm = base();
  set(lm, 11, 0.45, 0.3); set(lm, 12, 0.55, 0.3); set(lm, 23, 0.46, 0.6); set(lm, 24, 0.54, 0.6);
  for (const [h, k, a, t, hip, which] of [[23, 25, 27, 31, 0.46, 'L'], [24, 26, 28, 32, 0.54, 'R']]) {
    const l = (side === 'both' || side === which) ? lift : 0;
    const kx = hip + 0.2, ky = 0.6 - l;
    set(lm, k, kx, ky);
    const ang = side === 'both' || side === which ? kneeAng : 90; // 膝角：90 = 小腿垂直
    const sx = kx + 0.18 * Math.cos(rad(270 - (180 - ang) + 180)), sy = ky + 0.18 * Math.sin(rad(90 - (ang - 90)));
    set(lm, a, kx + 0.18 * Math.sin(rad(ang - 90)), ky + 0.18 * Math.cos(rad(ang - 90)));
    set(lm, t, lm[a].x + 0.06 * Math.cos(rad(-ankleDorsi)), lm[a].y - 0.06 * Math.sin(rad(ankleDorsi)) + 0.01);
    set(lm, h === 23 ? 29 : 30, lm[a].x - 0.02, lm[a].y + 0.01);
  }
  set(lm, 15, 0.3, 0.45); set(lm, 16, 0.7, 0.45);
  return lm;
}
function wave(lo, hi, reps, n = 24) { const out = []; for (let r = 0; r < reps; r++) for (let i = 0; i <= n; i++) out.push(lo + (hi - lo) * (1 - Math.cos(Math.PI * 2 * i / n)) / 2); return out; }
function run(id, frames) { let n = 0; const step = makeCounter(DETECTORS[id], () => n++); frames.forEach(f => step(f)); return n; }
const jitter = (lm, s = 0.004) => lm.map(p => ({ ...p, x: p.x + (Math.random() - .5) * s, y: p.y + (Math.random() - .5) * s }));
const R = {};
R['seated-knee 小幅(90→120)'] = run('seated-knee', wave(90, 120, 5).map(a => jitter(seated(a))));
R['seated-march 交替'] = run('seated-march', [...wave(0, 0.06, 3).map(l => jitter(seated(90, l, 'L'))), ...wave(0, 0.06, 3).map(l => jitter(seated(90, l, 'R')))]);
R['arm-circle'] = run('arm-circle', wave(0, 0.06, 5).map(d => { const lm = jitter(seated()); lm[15].y = 0.32 - d; lm[16].y = 0.32 - d; lm[13].y = 0.31; return lm; }));
R['seated-twist'] = run('seated-twist', [...wave(0, 0.04, 3), ...wave(0, 0.04, 3)].map(d => { const lm = jitter(seated()); lm[11].x = 0.45 + d; lm[12].x = 0.55 - d * 0.3; return lm; }));
R['ankle-pump'] = run('ankle-pump', wave(0, 25, 5).map(d => jitter(seated(90, 0, 'both', d))));
R['sit-to-stand'] = run('sit-to-stand', wave(90, 160, 4).map(a => jitter(seated(a))));
R['heel-raise'] = run('heel-raise', wave(0, 0.03, 5).map(d => { const lm = jitter(seated(170)); lm[29].y = lm[27].y + 0.01 - d; lm[31].y = lm[27].y + 0.015; lm[30].y = lm[28].y + 0.01 - d; lm[32].y = lm[28].y + 0.015; return lm; }));
R['stand-march 交替'] = run('stand-march', [...wave(0, 0.08, 3).map(l => jitter(seated(170, l, 'L'))), ...wave(0, 0.08, 3).map(l => jitter(seated(170, l, 'R')))]);
R['靜止不動（應為 0）'] = run('seated-knee', Array.from({ length: 200 }, () => jitter(seated(95))));
console.table(R);
