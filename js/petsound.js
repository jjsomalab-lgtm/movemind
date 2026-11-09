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

// 若團隊放了真實錄音檔（sounds/dog.mp3、cat.mp3、turtle.mp3，需有可商用授權），優先播放錄音
const custom = {};
function playFile(type) {
  if (custom[type] === false) return 0;
  const a = new Audio(`sounds/${type}.mp3`); a.volume = 0.9;
  a.onerror = () => { custom[type] = false; };
  const p = a.play(); if (p && p.catch) p.catch(() => { custom[type] = false; });
  custom[type] = true; return 0.8;
}
export function suspendAudio() { try { ctx && ctx.state === 'running' && ctx.suspend(); } catch (e) { /* 忽略 */ } }

export function petSound(type, times = 1) {
  if (custom[type] === true) return playFile(type);
  if (custom[type] === undefined) { fetch(`sounds/${type}.mp3`, { method: 'HEAD' }).then(r => { custom[type] = r.ok ? true : false; }).catch(() => { custom[type] = false; }); }
  const c = ac(); if (!c) return 0;
  const t = c.currentTime + 0.01;
  if (type === 'dog') { // 「汪！」：喉音爆發（噪音）＋快速下滑的聲帶音＋兩個共振峰
    for (let i = 0; i < times; i++) {
      const t0 = t + i * 0.26;
      tone(c, t0, { f0: 420, f1: 210, dur: 0.17, vol: 0.5, ff: 700, q: 4 });
      tone(c, t0, { f0: 420, f1: 210, dur: 0.15, vol: 0.25, ff: 1600, q: 5 });
      const n = c.createBufferSource(), b = c.createBuffer(1, c.sampleRate * 0.08, c.sampleRate), d = b.getChannelData(0);
      for (let k = 0; k < d.length; k++) d[k] = (Math.random() * 2 - 1) * (1 - k / d.length);
      const f = c.createBiquadFilter(), g = c.createGain(); f.type = 'bandpass'; f.frequency.value = 1200; f.Q.value = 1.5; g.gain.value = 0.35;
      n.buffer = b; n.connect(f); f.connect(g); g.connect(c.destination); n.start(t0);
    }
    return 0.26 * times + 0.1;
  }
  if (type === 'cat') { // 「喵～」：鼻音起頭，音高上揚再滑落，帶輕微顫音
    const o = c.createOscillator(), g = c.createGain(), f1 = c.createBiquadFilter(), f2 = c.createBiquadFilter(), vib = c.createOscillator(), vg = c.createGain();
    o.type = 'sawtooth'; o.frequency.setValueAtTime(520, t); o.frequency.linearRampToValueAtTime(880, t + 0.18); o.frequency.linearRampToValueAtTime(760, t + 0.45); o.frequency.exponentialRampToValueAtTime(480, t + 0.7);
    vib.frequency.value = 7; vg.gain.value = 14; vib.connect(vg); vg.connect(o.frequency);
    f1.type = 'bandpass'; f1.Q.value = 3; f1.frequency.setValueAtTime(700, t); f1.frequency.linearRampToValueAtTime(1500, t + 0.25); f1.frequency.linearRampToValueAtTime(900, t + 0.7);
    f2.type = 'lowpass'; f2.frequency.value = 3500;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.06); g.gain.setValueAtTime(0.3, t + 0.5); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.75);
    o.connect(f1); f1.connect(f2); f2.connect(g); g.connect(c.destination); o.start(t); vib.start(t); o.stop(t + 0.8); vib.stop(t + 0.8);
    return 0.8;
  }
  // 烏龜：圓潤的泡泡聲
  [0, 0.12, 0.26].forEach((d, i) => tone(c, t + d, { f0: 300 + i * 80, f1: 600 + i * 120, dur: 0.1, type: 'sine', vol: 0.25, ff: 700, q: 1 }));
  return 0.45;
}
