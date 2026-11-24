// 心動力 AI｜心動療癒站：雙手充電、聲音療癒、心跳呼吸、暖手輕揉、睡前放鬆、感恩小事、笑一笑
// 這裡提供陪伴與放鬆，不是醫療、不是治療，也不宣稱療效。所有聲音都由瀏覽器即時合成（團隊原創），不使用外部音檔。
// 資料只存在這支手機（store.js 的 heal 欄位）。文字內容放在 content.js 的 HEAL_ 開頭常數。
import * as S from './store.js';
import * as C from './content.js';

let D = null; // app.js 傳進來的共用工具：page, go, speak, sayBtn, petals, petName, canListen, listenOnce, run
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function heal() {
  const s = S.get();
  if (!s.heal) { s.heal = { pts: 0, log: [], thanks: [], day: '', n: 0 }; S.save(); }
  return s.heal;
}
function weekCount() {
  const since = Date.now() - 7 * 864e5;
  return heal().log.filter(x => x.at >= since).length;
}

// ---------- 圖示（原創線條） ----------
const ICON = {
  touch: '<circle cx="6.5" cy="16.5" r="3.5"/><circle cx="17.5" cy="16.5" r="3.5"/><path d="M12 11.5s-4-2.4-4-5.3A2.2 2.2 0 0 1 12 5a2.2 2.2 0 0 1 4 1.2c0 2.9-4 5.3-4 5.3z"/>',
  sound: '<path d="M4 10v4M8 7v10M12 4v16M16 8v8M20 11v2"/>',
  breath: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
  hand: '<path d="M8 13V6.5a1.5 1.5 0 0 1 3 0V12M11 11V5a1.5 1.5 0 0 1 3 0v6M14 11V6.5a1.5 1.5 0 0 1 3 0V14c0 4-2.5 6.5-6 6.5-2.6 0-4.2-1.4-5.4-3.6L4 13.6a1.4 1.4 0 0 1 2.4-1.4L8 14.5"/>',
  scan: '<path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z"/><path d="M16 4.5v3M14.5 6h3"/>',
  thanks: '<path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1"/><circle cx="12" cy="12" r="3.2"/>',
  laugh: '<circle cx="12" cy="12" r="9"/><path d="M7.5 13.5h9a4.5 4.5 0 0 1-9 0zM8.5 9.5q1-1.4 2 0M13.5 9.5q1-1.4 2 0"/>',
};
const icon = (k, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;

// 主視覺：湖面上浮著一顆發光的心，水波一圈圈散開（原創 SVG）
function heroArt() {
  return `<svg viewBox="0 0 400 210" preserveAspectRatio="xMidYMid slice" role="img" aria-label="心動療癒站：湖面上一顆發光的心">
    <defs>
      <linearGradient id="hlSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F8E9DC"/><stop offset=".55" stop-color="#EAD9E6"/><stop offset="1" stop-color="#D5E4EC"/></linearGradient>
      <linearGradient id="hlWater" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#BFD6E2"/><stop offset="1" stop-color="#9DBFD1"/></linearGradient>
      <radialGradient id="hlGlow" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#FFF4E0" stop-opacity=".95"/><stop offset="1" stop-color="#FFF4E0" stop-opacity="0"/></radialGradient>
      <linearGradient id="hlHeart" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F2A2A2"/><stop offset="1" stop-color="#D86E78"/></linearGradient>
      <filter id="hlSoft"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>
    </defs>
    <rect width="400" height="210" fill="url(#hlSky)"/>
    <g filter="url(#hlSoft)" opacity=".75">
      <path d="M0 118 Q60 92 120 104 T240 98 T400 104 V130 H0Z" fill="#B9CDB5"/>
      <path d="M0 124 Q90 108 190 116 T400 112 V134 H0Z" fill="#9FBC9E"/>
    </g>
    <rect y="128" width="400" height="82" fill="url(#hlWater)"/>
    <g class="hl-ripples" fill="none" stroke="#FFFFFF" stroke-width="1.6">
      <ellipse cx="200" cy="168" rx="40" ry="8" opacity=".8"/><ellipse cx="200" cy="168" rx="80" ry="15" opacity=".5"/><ellipse cx="200" cy="168" rx="125" ry="22" opacity=".3"/>
    </g>
    <circle cx="200" cy="110" r="70" fill="url(#hlGlow)"/>
    <g class="hl-heart"><path d="M200 152s-34-21-34-48a19 19 0 0 1 34-12 19 19 0 0 1 34 12c0 27-34 48-34 48z" fill="url(#hlHeart)" stroke="#B4505C" stroke-width="1.5"/>
      <path d="M182 96q4-8 12-8" stroke="#FFFFFF" stroke-width="3" stroke-linecap="round" fill="none" opacity=".7"/></g>
    <g fill="#7E9F5A" opacity=".85"><ellipse cx="70" cy="176" rx="16" ry="4.5"/><ellipse cx="330" cy="184" rx="18" ry="5"/></g>
    <g fill="#F7CCD4" stroke="#C97C8C" stroke-width=".8"><path d="M330 182c-5-8-4-15 0-19 4 4 5 11 0 19z"/><path d="M70 174c-4-7-3-13 0-16 3 3 4 9 0 16z"/></g>
    <g fill="#FFFFFF" opacity=".8"><circle cx="120" cy="60" r="2"/><circle cx="290" cy="48" r="2.4"/><circle cx="250" cy="76" r="1.6"/><circle cx="150" cy="38" r="1.4"/></g>
  </svg>`;
}

// ---------- 合成聲音：雨聲、溪水、海浪、山林、風鈴 ----------
let ac = null, out = null, srcs = [], timers = [];
function noiseBuf(color = 'brown', seconds = 3) {
  const b = ac.createBuffer(1, ac.sampleRate * seconds, ac.sampleRate), d = b.getChannelData(0);
  let last = 0;
  for (let i = 0; i < d.length; i++) {
    const w = Math.random() * 2 - 1;
    if (color === 'white') d[i] = w * .5; else { last = (last + .02 * w) / 1.02; d[i] = last * 3.5; }
  }
  const s = ac.createBufferSource(); s.buffer = b; s.loop = true; return s;
}
function chain(src, nodes) { let n = src; nodes.forEach(x => { n.connect(x); n = x; }); n.connect(out); src.start(); srcs.push(src); }
function filt(type, f, q = .7) { const x = ac.createBiquadFilter(); x.type = type; x.frequency.value = f; x.Q.value = q; return x; }
function gain(v) { const g = ac.createGain(); g.gain.value = v; return g; }
function lfo(target, rate, depth) { const o = ac.createOscillator(), g = gain(depth); o.frequency.value = rate; o.connect(g); g.connect(target); o.start(); srcs.push(o); }
function every(min, max, fn) { const t = () => { fn(); timers.push(setTimeout(t, min + Math.random() * (max - min))); }; timers.push(setTimeout(t, min)); }
function tone(freq, dur, vol, type = 'sine', sweepTo = null) {
  const o = ac.createOscillator(), g = ac.createGain(), t = ac.currentTime;
  o.type = type; o.frequency.setValueAtTime(freq, t); if (sweepTo) o.frequency.exponentialRampToValueAtTime(sweepTo, t + dur * .6);
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .01); g.gain.exponentialRampToValueAtTime(.0001, t + dur);
  o.connect(g); g.connect(out); o.start(t); o.stop(t + dur + .05);
}
export function startSound(kind, volume = .6) {
  stopSound();
  const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return false;
  ac = new AC(); out = ac.createGain(); out.gain.value = 0; out.connect(ac.destination);
  out.gain.linearRampToValueAtTime(volume, ac.currentTime + 3); // 3 秒淡入
  if (kind === 'rain') {
    chain(noiseBuf('white'), [filt('highpass', 1000), filt('lowpass', 7000), gain(.16)]);
    chain(noiseBuf('brown'), [filt('lowpass', 300), gain(.08)]);
    every(80, 400, () => tone(2200 + Math.random() * 2600, .05, .015, 'triangle'));          // 屋簷滴水
  } else if (kind === 'stream') {
    const g = gain(.12); chain(noiseBuf('white'), [filt('bandpass', 1400, .6), g]); lfo(g.gain, 1.3, .05); lfo(g.gain, .37, .04);
    chain(noiseBuf('brown'), [filt('lowpass', 600), gain(.10)]);
    every(150, 700, () => tone(500 + Math.random() * 900, .08, .02, 'sine', 900 + Math.random() * 900)); // 水泡聲
  } else if (kind === 'wave') {
    const g = gain(.12); chain(noiseBuf('brown'), [filt('lowpass', 650), g]); lfo(g.gain, .085, .11);
    const h = gain(.03); chain(noiseBuf('white'), [filt('highpass', 2500), h]); lfo(h.gain, .085, .028);
  } else if (kind === 'forest') {
    chain(noiseBuf('brown'), [filt('lowpass', 450), gain(.07)]);                                // 遠方的風
    every(1500, 5000, () => {                                                                     // 小鳥叫
      const base = 2300 + Math.random() * 1500, n = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < n; i++) timers.push(setTimeout(() => ac && tone(base, .14, .04, 'sine', base * 1.35), i * 170));
    });
  } else if (kind === 'music') {
    // 輕柔音樂：慢慢換和弦的長音，加上偶爾出現的五聲音階小旋律（團隊原創，即時合成）
    const chords = [[130.81, 196, 261.63, 329.63], [110, 164.81, 220, 261.63], [87.31, 174.61, 220, 261.63], [98, 146.83, 196, 246.94]];
    let ci = 0;
    const pad = () => {
      if (!ac) return;
      const t = ac.currentTime;
      chords[ci % chords.length].forEach(f => {
        const o = ac.createOscillator(), g = ac.createGain();
        o.type = 'sine'; o.frequency.value = f;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.035, t + 3); g.gain.linearRampToValueAtTime(.035, t + 7); g.gain.linearRampToValueAtTime(0, t + 10.5);
        o.connect(g); g.connect(out); o.start(t); o.stop(t + 11);
      });
      ci += 1;
    };
    pad(); timers.push(setInterval(pad, 8000));
    const notes = [523.25, 587.33, 659.25, 783.99, 880];
    every(1800, 4200, () => { const f = notes[Math.floor(Math.random() * notes.length)]; tone(f, 2.6, .035); });
  } else if (kind === 'chime') {
    const w = gain(.05); chain(noiseBuf('brown'), [filt('lowpass', 500), w]); lfo(w.gain, .12, .03);
    const notes = [523.25, 587.33, 659.25, 783.99, 880, 1046.5];                                // 五聲音階
    every(900, 3200, () => { const f = notes[Math.floor(Math.random() * notes.length)]; tone(f, 3.2, .05); tone(f * 2.76, 1.2, .012); });
  }
  return true;
}
export function stopSound() {
  timers.forEach(t => { clearTimeout(t); clearInterval(t); }); timers = [];
  srcs.forEach(s => { try { s.stop(); } catch (e) { /* 忽略 */ } }); srcs = [];
  if (ac) { const c = ac; try { out.gain.linearRampToValueAtTime(0, c.currentTime + .4); } catch (e) { /* 忽略 */ } setTimeout(() => c.close().catch(() => {}), 500); }
  ac = null; out = null;
}

// 離開畫面時自動停止：每一拍都檢查畫面上的標記還在不在
let tick = null;
function stopAll() { clearInterval(tick); tick = null; stopSound(); releaseWake(); }
let wake = null;
async function keepAwake() { try { wake = await navigator.wakeLock?.request('screen'); } catch (e) { wake = null; } }
function releaseWake() { try { wake?.release(); } catch (e) { /* 忽略 */ } wake = null; }
const onStage = id => !!document.getElementById(id);

// ---------- 療癒站首頁 ----------
function hubScreen() {
  stopAll();
  const n = weekCount();
  const intro = '歡迎來到心動療癒站。給自己幾分鐘，選一個喜歡的方式，慢慢把心照顧好。';
  D.page('療癒站', `
    <div class="scene-hero hl-hero">${heroArt()}<div class="scene-cap"><b>心動療癒站</b><span>給自己幾分鐘，慢慢把心照顧好</span></div></div>
    <div class="q-card"><p class="q">${intro}</p>${D.sayBtn(intro)}</div>
    <div class="hl-grid">${C.HEAL_OPTIONS.map(o => `
      <button class="hl-tile" data-hl="go:${o.id}" style="--hc:${o.color}">
        <span class="hl-ic">${icon(o.id)}</span>${o.isNew ? '<span class="hl-new">新</span>' : ''}
        <b>${o.name}</b><span>${o.sub}</span>
      </button>`).join('')}</div>
    <p class="hl-week">${n ? `這 7 天，你已經照顧自己 <b>${n}</b> 次了 💛` : '今天，也給自己一點溫柔吧。'}</p>
    <p class="note">心動療癒站提供陪伴與放鬆，不是醫療，也不能取代看醫生。心裡很難受時，請撥打 <a href="tel:1925">1925 安心專線</a>（24 小時）。</p>
  `, { back: 'lake', tab: 'lake' });
}

// ---------- 聲音療癒 ----------
const pick = { sound: 'rain', min: 5 };
function soundScreen() {
  stopAll();
  const intro = '選一個喜歡的聲音和時間，找個舒服的姿勢坐好，閉上眼睛聽就好。';
  D.page('聲音療癒', `
    <div class="q-card"><p class="q">${intro}</p>${D.sayBtn(intro)}</div>
    <h3 class="hl-h">想聽什麼聲音？</h3>
    <div class="hl-sounds">${C.HEAL_SOUNDS.map(s => `<button class="hl-chip ${pick.sound === s.id ? 'on' : ''}" data-hl="snd:${s.id}" aria-pressed="${pick.sound === s.id}"><span aria-hidden="true">${s.emoji}</span>${s.name}</button>`).join('')}</div>
    <button class="text-link" data-hl="preview">${icon('sound')} 先試聽 5 秒</button>
    <h3 class="hl-h">聽多久？</h3>
    <div class="answer-row three">${C.HEAL_MINUTES.map(m => `<button class="btn choice ${pick.min === m ? 'on' : ''}" data-hl="min:${m}" aria-pressed="${pick.min === m}">${m} 分鐘</button>`).join('')}</div>
    <button class="btn huge primary" data-hl="playSound">開始聆聽</button>
    <p class="note">請把手機音量調到舒服的大小。聽的時候可以把手機放在旁邊，不用一直看。</p>
  `, { back: 'heal' });
}
function playSoundScreen() {
  const s = C.HEAL_SOUNDS.find(x => x.id === pick.sound);
  let left = pick.min * 60;
  D.page('聲音療癒', `
    <div class="hl-stage" id="hlSound">
      <div class="hl-pulse" aria-hidden="true"><i></i><i></i><i></i><span>${s.emoji}</span></div>
      <p class="hl-big">${s.name}</p>
      <p class="hl-time" id="hlLeft" aria-live="off">${fmt(left)}</p>
      <p class="note">閉上眼睛，慢慢呼吸，聽聲音就好。</p>
    </div>
    <button class="btn big" data-hl="stop">先停在這裡</button>
  `, { back: 'heal' });
  if (!startSound(pick.sound)) { document.getElementById('hlLeft').textContent = '這支手機不支援播放聲音'; return; }
  tick = setInterval(() => {
    if (!onStage('hlSound')) return stopAll();
    left -= 1; const el = document.getElementById('hlLeft'); if (el) el.textContent = fmt(left);
    if (left <= 0) { stopAll(); finish('sound'); }
  }, 1000);
}
const fmt = s => `${Math.floor(s / 60)}:${String(Math.max(0, s % 60)).padStart(2, '0')}`;

// ---------- 雙手充電：兩隻大拇指按住才會充電，放開只是暫停（不扣分、不重來） ----------
const tPick = { sound: 'music', min: 3, voice: true, oneHand: false };
function touchScreen() {
  stopAll();
  const T = C.HEAL_TOUCH;
  D.page('雙手充電', `
    <div class="tc-hero" aria-hidden="true">${chargeArt(0)}</div>
    <div class="q-card"><p class="q">${esc(T.intro)}</p>${D.sayBtn(T.intro)}</div>
    <h3 class="hl-h">要搭配聲音嗎？</h3>
    <div class="hl-sounds">${T.sounds.map(x => `<button class="hl-chip ${tPick.sound === x.id ? 'on' : ''}" data-hl="tsnd:${x.id}" aria-pressed="${tPick.sound === x.id}"><span aria-hidden="true">${x.emoji}</span>${x.name}</button>`).join('')}</div>
    <h3 class="hl-h">充電多久？</h3>
    <div class="answer-row three">${T.minutes.map(m => `<button class="btn choice ${tPick.min === m ? 'on' : ''}" data-hl="tmin:${m}" aria-pressed="${tPick.min === m}">${m} 分鐘</button>`).join('')}</div>
    <h3 class="hl-h">陪伴方式</h3>
    <button class="tc-opt ${tPick.voice ? 'on' : ''}" data-hl="topt:voice" aria-pressed="${tPick.voice}"><span class="tc-box" aria-hidden="true">${tPick.voice ? '✓' : ''}</span><span><b>${esc(D.petName())}用聲音陪我</b><span>每隔一段時間，輕輕提醒你放鬆</span></span></button>
    <button class="tc-opt ${tPick.oneHand ? 'on' : ''}" data-hl="topt:oneHand" aria-pressed="${tPick.oneHand}"><span class="tc-box" aria-hidden="true">${tPick.oneHand ? '✓' : ''}</span><span><b>只用一隻手</b><span>${esc(T.oneHandNote)}</span></span></button>
    <button class="btn huge primary" data-hl="touchGo">開始充電</button>
    <p class="note">${esc(T.safety)}</p>
  `, { back: 'heal' });
}
// 主視覺：一顆會充電的心（電量越多，心越滿、越亮）
function chargeArt(pct) {
  const h = 84 * pct / 100;
  return `<svg viewBox="0 0 120 110" class="tc-heart" role="img" aria-label="心動力電量 ${Math.round(pct)}%">
    <defs><clipPath id="tcClip"><path d="M60 100S8 70 8 34a24 24 0 0 1 52-14 24 24 0 0 1 52 14c0 36-52 66-52 66z"/></clipPath>
      <linearGradient id="tcFill" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#2F8A7A"/><stop offset="1" stop-color="#7CC4A8"/></linearGradient></defs>
    <path d="M60 100S8 70 8 34a24 24 0 0 1 52-14 24 24 0 0 1 52 14c0 36-52 66-52 66z" fill="#F4EFE6"/>
    <rect id="tcLevel" clip-path="url(#tcClip)" x="0" y="${102 - h}" width="120" height="${h + 4}" fill="url(#tcFill)"/>
    <path d="M60 100S8 70 8 34a24 24 0 0 1 52-14 24 24 0 0 1 52 14c0 36-52 66-52 66z" fill="none" stroke="#1F5F54" stroke-width="2.5"/>
    <path d="M64 30 50 58h11l-5 22 16-30H61z" fill="#FFF6D8" stroke="#C99A3A" stroke-width="1.4" stroke-linejoin="round"/>
  </svg>`;
}
const TS = { total: 0, left: 0, L: null, R: null, started: false, active: false, breathAt: 0, lineAt: 0, li: 0, muted: false };
function touchRun() {
  stopAll();
  const T = C.HEAL_TOUCH;
  Object.assign(TS, { total: tPick.min * 60, left: tPick.min * 60, L: null, R: null, started: false, active: false, breathAt: 0, lineAt: 0, li: 0, muted: tPick.sound === 'none' });
  D.page('雙手充電', `
    <div class="tc-stage" id="hlTouch">
      <div class="tc-top">${chargeArt(0)}<p class="tc-pct"><span>心動力</span> <b id="tcPct">0%</b></p></div>
      <p class="tc-cue" id="tcCue" aria-live="polite">${tPick.oneHand ? T.cueStartOne : T.cueStart}</p>
      <p class="tc-time" id="tcLeft">${fmt(TS.left)}</p>
      <p class="tc-line" id="tcLine">${esc(T.lines[0])}</p>
      <div class="tc-pads ${tPick.oneHand ? 'one' : ''}">
        <div class="tc-pad" data-side="L" role="button" aria-label="左手大拇指按這裡"><i aria-hidden="true"></i><span>左手<br>大拇指</span></div>
        <div class="tc-pad" data-side="R" role="button" aria-label="右手大拇指按這裡"><i aria-hidden="true"></i><span>右手<br>大拇指</span></div>
      </div>
    </div>
    <div class="answer-row two">
      ${tPick.sound === 'none' ? '' : `<button class="btn" data-hl="tmute">${TS.muted ? '🔈 打開聲音' : '🔇 先關聲音'}</button>`}
      <button class="btn" data-hl="stop">先停在這裡</button>
    </div>
  `, { back: 'heal_touch' });
  const stage = document.getElementById('hlTouch');
  stage.addEventListener('contextmenu', e => e.preventDefault());
  stage.querySelectorAll('.tc-pad').forEach(pad => {
    const side = pad.dataset.side;
    pad.addEventListener('pointerdown', e => {
      e.preventDefault();
      try { pad.setPointerCapture(e.pointerId); } catch (err) { /* 忽略 */ }
      TS[side] = e.pointerId; pad.classList.add('on'); touchUpdate();
    });
    const up = e => { if (TS[side] === e.pointerId) { TS[side] = null; pad.classList.remove('on'); touchUpdate(); } };
    pad.addEventListener('pointerup', up); pad.addEventListener('pointercancel', up); pad.addEventListener('lostpointercapture', up);
  });
  keepAwake();
  tick = setInterval(() => {
    if (!onStage('hlTouch')) return stopAll();
    if (!TS.active) return;
    TS.left = Math.max(0, TS.left - .25);
    const now = Date.now();
    // 呼吸提示：吸 4 秒、吐 6 秒
    const ph = ((now - TS.breathAt) / 1000) % 10;
    const cue = document.getElementById('tcCue'); if (cue) cue.textContent = ph < 4 ? T.inhale : T.exhale;
    // 陪伴的話：每 20 秒換一句
    if (now - TS.lineAt > 20000) {
      TS.lineAt = now; TS.li = (TS.li + 1) % T.lines.length;
      const line = TS.left < 25 ? T.lines[T.lines.length - 1] : T.lines[TS.li];
      const el = document.getElementById('tcLine'); if (el) el.textContent = line;
      if (tPick.voice) D.speak(line);
    }
    touchPaint();
    if (TS.left <= 0) { stopAll(); finish('touch'); }
  }, 250);
}
function touchUpdate() {
  const T = C.HEAL_TOUCH;
  const active = tPick.oneHand ? (TS.L !== null || TS.R !== null) : (TS.L !== null && TS.R !== null);
  const was = TS.active; TS.active = active;
  const stage = document.getElementById('hlTouch'); if (!stage) return;
  stage.classList.toggle('active', active);
  const cue = document.getElementById('tcCue');
  if (active && !was) {
    TS.breathAt = Date.now(); if (!TS.lineAt) TS.lineAt = Date.now();
    try { navigator.vibrate?.(30); } catch (e) { /* 忽略 */ }
    if (!TS.started) { TS.started = true; if (tPick.sound !== 'none' && !TS.muted) startSound(tPick.sound === 'music' ? 'music' : 'stream', .5); }
    if (cue) cue.textContent = T.inhale;
  } else if (!active) {
    const one = TS.L !== null || TS.R !== null;
    if (cue) cue.textContent = !TS.started ? (one && !tPick.oneHand ? T.cueOne : (tPick.oneHand ? T.cueStartOne : T.cueStart)) : (one ? T.cueOne : T.cuePause);
  }
}
function touchPaint() {
  const pct = 100 * (1 - TS.left / TS.total);
  const lv = document.getElementById('tcLevel'), p = document.getElementById('tcPct'), t = document.getElementById('tcLeft');
  if (lv) { const h = 84 * pct / 100; lv.setAttribute('y', 102 - h); lv.setAttribute('height', h + 4); }
  if (p) p.textContent = `${Math.floor(pct)}%`;
  if (t) t.textContent = fmt(Math.ceil(TS.left));
}

// ---------- 心跳呼吸 ----------
function breathScreen() {
  stopAll();
  const B = C.HEAL_BREATH;
  const intro = `看著愛心：愛心變大時，用鼻子慢慢吸氣 ${B.inhale} 秒；愛心變小時，慢慢吐氣 ${B.exhale} 秒。一共 ${B.rounds} 次，大約 1 分鐘。`;
  D.page('心跳呼吸', `
    <div class="q-card"><p class="q">${intro}</p>${D.sayBtn(intro)}</div>
    <div class="hl-stage" id="hlBreath">
      <svg class="hl-bheart" id="hlBheart" viewBox="0 0 120 110" aria-hidden="true"><path d="M60 100S8 70 8 34a24 24 0 0 1 52-14 24 24 0 0 1 52 14c0 36-52 66-52 66z" fill="#E88C92" stroke="#B4505C" stroke-width="2"/></svg>
      <p class="hl-big" id="hlCue">準備好了就按開始</p>
      <p class="note" id="hlRound"></p>
    </div>
    <button class="btn huge primary" id="hlBreathBtn" data-hl="startBreath">開始</button>
    <p class="note">不需要憋氣。覺得頭暈，就恢復平常的呼吸。</p>
  `, { back: 'heal' });
}
function startBreath() {
  const B = C.HEAL_BREATH, heart = document.getElementById('hlBheart'), cue = document.getElementById('hlCue'), rd = document.getElementById('hlRound');
  document.getElementById('hlBreathBtn').hidden = true;
  let n = 0;
  const step = phase => {
    if (!onStage('hlBreath')) return;
    if (phase === 'in') {
      n += 1; if (n > B.rounds) return finish('breath');
      rd.textContent = `第 ${n} / ${B.rounds} 次`;
      cue.textContent = '慢慢吸氣…'; D.speak('吸氣');
      heart.style.transition = `transform ${B.inhale}s ease-in-out`; heart.style.transform = 'scale(1.35)';
      timers.push(setTimeout(() => step('out'), B.inhale * 1000));
    } else {
      cue.textContent = '慢慢吐氣…'; D.speak('吐氣');
      heart.style.transition = `transform ${B.exhale}s ease-in-out`; heart.style.transform = 'scale(.85)';
      timers.push(setTimeout(() => step('in'), B.exhale * 1000));
    }
  };
  step('in');
}

// ---------- 引導式：暖手輕揉、睡前放鬆、笑一笑 ----------
const GUIDES = { hand: () => C.HEAL_HAND, scan: () => C.HEAL_SCAN, laugh: () => C.HEAL_LAUGH };
const BG = { hand: null, scan: 'wave', laugh: null };
function guideIntro(kind) {
  stopAll();
  const G = GUIDES[kind]();
  const total = G.steps.reduce((a, s) => a + s.sec, 0);
  D.page(G.title, `
    <div class="hl-intro" style="--hc:${C.HEAL_OPTIONS.find(o => o.id === kind).color}"><span class="hl-ic big">${icon(kind)}</span><b>${G.title}</b><span>${G.steps.length} 個步驟・大約 ${Math.round(total / 60)} 分鐘</span></div>
    <div class="q-card warn"><p class="q">${esc(G.before)}</p>${D.sayBtn(G.before)}</div>
    <button class="btn huge primary" data-hl="guide:${kind}">開始</button>
    ${BG[kind] ? '<p class="note">會搭配輕輕的海浪聲。</p>' : ''}
  `, { back: 'heal' });
}
const G_STATE = { kind: null, i: 0, left: 0, paused: false };
function guideRun(kind) {
  stopAll();
  Object.assign(G_STATE, { kind, i: 0, paused: false });
  if (BG[kind]) startSound(BG[kind], .35);
  showStep();
  tick = setInterval(() => {
    if (!onStage('hlGuide')) return stopAll();
    if (G_STATE.paused) return;
    G_STATE.left -= 1;
    const bar = document.getElementById('hlBar'), G = GUIDES[G_STATE.kind](), st = G.steps[G_STATE.i];
    if (bar) bar.style.width = `${100 * (1 - G_STATE.left / st.sec)}%`;
    if (G_STATE.left <= 0) nextStep(1);
  }, 1000);
}
function showStep() {
  const G = GUIDES[G_STATE.kind](), st = G.steps[G_STATE.i];
  G_STATE.left = st.sec;
  D.page(G.title, `
    <div class="hl-stage" id="hlGuide" style="--hc:${C.HEAL_OPTIONS.find(o => o.id === G_STATE.kind).color}">
      <p class="hl-step">第 ${G_STATE.i + 1} / ${G.steps.length} 步</p>
      <span class="hl-ic big breathe-soft">${icon(G_STATE.kind)}</span>
      <p class="hl-text">${esc(st.text)}</p>
      <div class="hl-bar"><i id="hlBar"></i></div>
    </div>
    <div class="answer-row three">
      <button class="btn" data-hl="prev" ${G_STATE.i ? '' : 'disabled'}>上一步</button>
      <button class="btn" data-hl="pause">${G_STATE.paused ? '繼續' : '暫停'}</button>
      <button class="btn primary" data-hl="next">下一步</button>
    </div>
    <button class="text-link" data-hl="stop">先停在這裡</button>
  `, { back: 'heal' });
  D.speak(st.text);
}
function nextStep(d) {
  const G = GUIDES[G_STATE.kind]();
  G_STATE.i += d;
  if (G_STATE.i < 0) G_STATE.i = 0;
  if (G_STATE.i >= G.steps.length) { const k = G_STATE.kind; stopAll(); return finish(k); }
  showStep();
}

// ---------- 感恩小事 ----------
function thanksScreen(reply) {
  stopAll();
  const T = C.HEAL_THANKS, h = heal();
  const recent = h.thanks.slice(-5).reverse();
  D.page('感恩小事', `
    <div class="q-card"><p class="q">${T.prompt}</p>${D.sayBtn(T.prompt)}</div>
    ${reply ? `<div class="bubble bot">${esc(reply)}</div>` : ''}
    <div class="hl-sounds">${T.chips.map(c => `<button class="hl-chip" data-hl="thx:${esc(c)}">${esc(c)}</button>`).join('')}</div>
    <div class="chat-input"><input id="hlThx" type="text" maxlength="60" placeholder="也可以自己寫一句…" aria-label="今天感謝的小事"><button class="btn send" data-hl="thxSend">記下來</button></div>
    ${D.canListen ? '<button class="btn soft" data-hl="thxVoice">🎤 用說的</button>' : ''}
    ${recent.length ? `<section class="card"><h3 class="card-title">${icon('thanks')} 我的感恩小本子</h3><ul class="hl-list">${recent.map(x => `<li><span>${new Date(x.at).getMonth() + 1}/${new Date(x.at).getDate()}</span>${esc(x.text)}</li>`).join('')}</ul></section>` : ''}
    ${reply ? '<button class="btn primary big" data-hl="go:hub">回療癒站</button>' : ''}
  `, { back: 'heal' });
}
function saveThanks(text) {
  text = String(text || '').trim().slice(0, 60);
  if (!text) return;
  heal().thanks.push({ text, at: Date.now() }); S.save();
  const T = C.HEAL_THANKS, reply = T.replies[heal().thanks.length % T.replies.length];
  const earned = award('thanks');
  thanksScreen(`${D.petName()}：${reply}${earned ? '（得到 1 點療癒點數）' : ''}`);
  D.speak(reply); D.petals(10);
}

// ---------- 完成 ----------
function award(id) {
  const h = heal(), today = S.dayKey();
  h.log.push({ id, at: Date.now() });
  if (h.day !== today) { h.day = today; h.n = 0; }
  let got = false;
  if (h.n < C.HEAL_POINTS.dailyMax) { h.n += 1; h.pts += C.HEAL_POINTS.done; got = true; }
  if (h.log.length > 200) h.log = h.log.slice(-200);
  S.save();
  return got;
}
function finish(id) {
  const got = award(id);
  const o = C.HEAL_OPTIONS.find(x => x.id === id);
  const G = GUIDES[id] ? GUIDES[id]() : null;
  const msg = G ? G.end : id === 'touch' ? C.HEAL_TOUCH.end : id === 'sound' ? '聽完了。希望現在的你，心裡比剛才更安靜一點。' : '做完了！呼吸慢下來，心也跟著慢下來了。';
  D.page('完成了', `
    <div class="hl-done" style="--hc:${o.color}"><span class="hl-ic big">${icon(id)}</span><b>${o.name}・完成</b></div>
    <div class="q-card"><p class="q">${esc(msg)}</p>${D.sayBtn(msg)}</div>
    ${got ? `<p class="hl-week">得到 1 點療癒點數，可以換${esc(D.petName())}的點心 🍪</p>` : '<p class="note">今天的療癒點數已經拿滿了，但照顧自己永遠不嫌多。</p>'}
    <button class="btn big" data-go="mood">記錄一下現在的心情</button>
    <button class="btn primary big" data-hl="go:hub">回療癒站</button>
  `, { back: 'heal' });
  D.speak(msg); D.petals(14);
}

// ---------- 點擊 ----------
async function onClick(e) {
  const b = e.target.closest('[data-hl]'); if (!b || !D) return;
  const [cmd, ...rest] = b.dataset.hl.split(':'); const arg = rest.join(':');
  switch (cmd) {
    case 'go': return arg === 'hub' ? D.go('heal') : D.go('heal_' + arg);
    case 'snd': pick.sound = arg; return soundScreen();
    case 'tsnd': tPick.sound = arg; return touchScreen();
    case 'tmin': tPick.min = +arg; return touchScreen();
    case 'topt': tPick[arg] = !tPick[arg]; return touchScreen();
    case 'touchGo': return D.go('heal_touchRun');
    case 'tmute':
      TS.muted = !TS.muted; b.textContent = TS.muted ? '🔈 打開聲音' : '🔇 先關聲音';
      if (TS.muted) stopSound(); else if (TS.started) startSound(tPick.sound === 'music' ? 'music' : 'stream', .5);
      return;
    case 'min': pick.min = +arg; return soundScreen();
    case 'preview': startSound(pick.sound); timers.push(setTimeout(stopSound, 5000)); return;
    case 'playSound': return playSoundScreen();
    case 'stop': stopAll(); return D.go('heal');
    case 'startBreath': return startBreath();
    case 'guide': return guideRun(arg);
    case 'prev': return nextStep(-1);
    case 'next': return nextStep(1);
    case 'pause': G_STATE.paused = !G_STATE.paused; b.textContent = G_STATE.paused ? '繼續' : '暫停'; if (G_STATE.paused) speechSynthesis?.cancel?.(); return;
    case 'thx': return saveThanks(arg);
    case 'thxSend': return saveThanks(document.getElementById('hlThx')?.value);
    case 'thxVoice': {
      b.textContent = '請說…（說完會自動記下）';
      try { const t = await D.listenOnce(); if (t) saveThanks(t); else b.textContent = '沒有聽清楚，再按一次'; }
      catch (err) { b.textContent = '沒有聽清楚，可以改用打字或點上面的選項'; }
      return;
    }
  }
}

// 首頁、心靈湖畔用的入口卡片
export function healCard() {
  const n = weekCount();
  return `<button class="hl-entry" data-go="heal">
    <span class="hl-entry-art" aria-hidden="true">${icon('breath')}</span>
    <span><b>心動療癒站</b><span>${n ? `這 7 天照顧自己 ${n} 次・` : ''}雙手充電、聲音、呼吸、暖手、放鬆、感恩、笑一笑</span></span>
  </button>`;
}

export function registerHealing(deps) {
  D = deps;
  Object.assign(deps.screens, {
    heal: hubScreen, heal_touch: touchScreen, heal_touchRun: touchRun, heal_sound: soundScreen, heal_breath: breathScreen,
    heal_hand: () => guideIntro('hand'), heal_scan: () => guideIntro('scan'), heal_laugh: () => guideIntro('laugh'),
    heal_thanks: () => thanksScreen(),
  });
  document.addEventListener('click', onClick);
}
