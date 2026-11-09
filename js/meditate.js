// 靜坐冥想的背景音樂：由瀏覽器即時合成的原創音樂（溫和長音＋雨聲／海浪），版權屬於心動力團隊，可公開使用
let ctx = null, nodes = [], master = null;

function noise(c, seconds = 2) {
  const b = c.createBuffer(1, c.sampleRate * seconds, c.sampleRate), d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; last = (last + 0.02 * w) / 1.02; d[i] = last * 3.5; } // 柔和的棕噪音
  const s = c.createBufferSource(); s.buffer = b; s.loop = true; return s;
}

export function startMusic(kind = 'rain', volume = 0.5) {
  stopMusic();
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
  ctx = new AC(); master = ctx.createGain(); master.gain.value = 0; master.connect(ctx.destination);
  master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 4); // 4 秒淡入
  // 溫和長音：C 大調和弦，緩慢起伏
  [130.81, 196.0, 261.63, 329.63].forEach((f, i) => {
    const o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
    o.type = 'sine'; o.frequency.value = f; g.gain.value = 0.05;
    lfo.frequency.value = 0.05 + i * 0.02; lg.gain.value = 0.035; lfo.connect(lg); lg.connect(g.gain);
    o.connect(g); g.connect(master); o.start(); lfo.start(); nodes.push(o, lfo);
  });
  // 環境聲：雨聲（高通的細噪音）或海浪（低通噪音＋緩慢起伏）
  const n = noise(ctx), f = ctx.createBiquadFilter(), g = ctx.createGain();
  if (kind === 'rain') { f.type = 'highpass'; f.frequency.value = 900; g.gain.value = 0.10; }
  else { f.type = 'lowpass'; f.frequency.value = 500; g.gain.value = 0.10; const l = ctx.createOscillator(), lg = ctx.createGain(); l.frequency.value = 0.09; lg.gain.value = 0.09; l.connect(lg); lg.connect(g.gain); l.start(); nodes.push(l); }
  n.connect(f); f.connect(g); g.connect(master); n.start(); nodes.push(n);
  return true;
}

export function stopMusic() {
  if (!ctx) return;
  try { master.gain.linearRampToValueAtTime(0, ctx.currentTime + 1.5); } catch (e) { /* 忽略 */ }
  const c = ctx, ns = nodes; ctx = null; nodes = [];
  setTimeout(() => { ns.forEach(n => { try { n.stop(); } catch (e) { /* 忽略 */ } }); c.close?.(); }, 1700);
}

// 適合長輩的引導語（坐著做、可以睜眼）
export const GUIDE = [
  '找一張穩固的椅子坐好，雙腳踩在地上。',
  '眼睛可以閉上，也可以輕輕看著前方。',
  '慢慢吸一口氣，再慢慢吐出來。',
  '感覺肩膀放鬆，手輕輕放在大腿上。',
  '聽聽周圍的聲音，不用想任何事情。',
  '如果有念頭跑出來，沒關係，回到呼吸就好。',
  '再慢慢吸一口氣，慢慢吐出來。',
  '你做得很好，好好陪伴自己。',
];
