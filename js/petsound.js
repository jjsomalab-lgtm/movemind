// 寵物叫聲：用瀏覽器即時合成（原創音效，不需音檔）。狗「汪」、貓「喵」、烏龜「噗嚕」
let ctx = null;
const ac = () => { if (!ctx) { const A = window.AudioContext || window.webkitAudioContext; if (A) ctx = new A(); } if (ctx && ctx.state === 'suspended') ctx.resume(); return ctx; };

function tone(c, t0, { f0, f1, dur, type = 'sawtooth', vol = 0.35, q = 6, ff = 1400 }) {
  const o = c.createOscillator(), g = c.createGain(), bp = c.createBiquadFilter();
  o.type = type; o.frequency.setValueAtTime(f0, t0); o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  bp.type = 'bandpass'; bp.frequency.value = ff; bp.Q.value = q;
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(bp); bp.connect(g); g.connect(c.destination); o.start(t0); o.stop(t0 + dur + 0.05);
}

export function petSound(type, times = 1) {
  const c = ac(); if (!c) return 0;
  const t = c.currentTime + 0.01;
  if (type === 'dog') { // 短促的「汪」：音高快速下降＋一點噪音感
    for (let i = 0; i < times; i++) { tone(c, t + i * 0.22, { f0: 520, f1: 260, dur: 0.16, vol: 0.45, ff: 900, q: 3 }); tone(c, t + i * 0.22, { f0: 1040, f1: 520, dur: 0.12, type: 'square', vol: 0.08, ff: 1800, q: 4 }); }
    return 0.22 * times + 0.1;
  }
  if (type === 'cat') { // 「喵～」：音高先升後降，帶一點鼻音
    tone(c, t, { f0: 600, f1: 980, dur: 0.25, type: 'triangle', vol: 0.3, ff: 1600, q: 2 });
    tone(c, t + 0.22, { f0: 980, f1: 560, dur: 0.38, type: 'triangle', vol: 0.28, ff: 1300, q: 2 });
    return 0.65;
  }
  // 烏龜：圓潤的泡泡聲
  [0, 0.12, 0.26].forEach((d, i) => tone(c, t + d, { f0: 300 + i * 80, f1: 600 + i * 120, dur: 0.1, type: 'sine', vol: 0.25, ff: 700, q: 1 }));
  return 0.45;
}
