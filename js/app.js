// 心動力 AI｜主程式（畫面與流程）
import * as S from './store.js';
import * as C from './content.js';
import { gardenSVG, plantSVG, rewardHome, rewardWalk, checkin, canPlant, plant, nextSuggestion } from './garden.js';
import { speak, stopSpeaking, canListen, listenOnce, voiceStatus, canSpeak } from './speech.js';
import { createWalk, getPosition } from './walk.js';
import { lineURL, smsURL, weeklyText, helpText, nativeShare } from './share.js';

const $ = sel => document.querySelector(sel);
const main = () => $('#main');
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const actName = id => (C.ACTIVITIES.find(a => a.id === id) || {}).name || id;

// 執行中的流程（不存檔）
const run = { afterCheck: null, companionNext: null, activity: null, reps: 0, pose: false, walk: null, walkInfo: null, screenIdx: 0, screenAns: [], checkIdx: 0, checkAns: {}, lastReward: null };

// ---------- 圖示（原創線條） ----------
const I = {
  home: '<path d="M4 11 12 4l8 7v9h-5v-6H9v6H4z"/>',
  move: '<circle cx="13" cy="4.5" r="2"/><path d="M9 21l2-6 3 2v4M7 12l3-4 4 1 2 4 3 1"/>',
  walk: '<path d="M12 3a6 6 0 0 1 6 6c0 4.5-6 11-6 11S6 13.5 6 9a6 6 0 0 1 6-6z"/><circle cx="12" cy="9" r="2"/>',
  garden: '<path d="M12 21v-9M12 12c0-4 3-7 7-7 0 4-3 7-7 7zM12 15c0-3-2.5-5.5-6-5.5 0 3 2.5 5.5 6 5.5z"/>',
  chart: '<path d="M5 20V11M10 20V6M15 20v-7M20 20V9"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>',
  mic: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  sound: '<path d="M4 9v6h4l5 4V5L8 9zM16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11"/>',
};
const icon = (k, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[k]}</svg>`;

// ---------- 共用版面 ----------
function setFont() { document.documentElement.style.setProperty('--fs', S.get().profile.fontScale); }

function header(title, { back = null } = {}) {
  return `<header class="top">
    ${back ? `<button class="icon-btn" data-go="${back}" aria-label="回上一頁">${icon('back')}</button>` : `<button class="icon-btn" data-go="settings" aria-label="設定">${icon('gear')}</button>`}
    <h1>${esc(title)}</h1>
    <button class="help-btn" data-act="help">不舒服</button>
  </header>`;
}

function nav(active) {
  const items = [['today', '今天', 'home'], ['activities', '活動', 'move'], ['walk', '散步', 'walk'], ['garden', '綠洲', 'garden'], ['week', '紀錄', 'chart']];
  return `<nav class="tabs">${items.map(([id, label, ic]) =>
    `<button data-go="${id}" class="${active === id ? 'on' : ''}" ${active === id ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span></button>`).join('')}</nav>`;
}

// LINE、Facebook 等 APP 內建瀏覽器：常不支援語音朗讀，鏡頭與定位也較不穩，紀錄也和手機瀏覽器分開
const UA = navigator.userAgent;
const IN_LINE = /\bLine\//i.test(UA);
const IN_APP = IN_LINE || /FBAN|FBAV|Instagram/i.test(UA);
function inAppBanner() {
  if (!IN_APP) return '';
  const ext = `${location.origin}${location.pathname}?openExternalBrowser=1${location.hash}`;
  return `<div class="inapp">
    <p><b>建議改用手機瀏覽器開啟</b><br>在 ${IN_LINE ? 'LINE' : '這個 APP'} 裡面打開，可能沒有聲音、鏡頭和定位也比較不穩。</p>
    ${IN_LINE ? `<a class="btn primary" href="${ext}">用瀏覽器開啟</a>` : '<p class="note">請按右上角選單，選「用瀏覽器開啟」。</p>'}
  </div>`;
}

function page(title, body, { tab = null, back = null } = {}) {
  const banner = ['today', 'welcome'].includes(currentScreen) || !canSpeak ? inAppBanner() : '';
  main().innerHTML = header(title, { back }) + `<section class="body">${banner}${body}</section>` + (tab ? nav(tab) : '');
  main().querySelector('.body').scrollTop = 0;
  window.scrollTo(0, 0);
}

const sayBtn = text => `<button class="say" data-say="${esc(text)}" aria-label="唸給我聽">${icon('sound')}</button>`;

// ---------- 路由 ----------
const screens = {};
let currentScreen = '';
export function go(name, ...args) {
  // 散步記錄中：只允許打開「不舒服」頁或回到散步畫面，其他頁面先確認是否結束
  if (run.walk && !['walking', 'walk', 'help'].includes(name)) {
    if (!confirm('散步還在記錄中。要結束這次散步嗎？')) return;
    return stopWalk();
  }
  cleanup(name);
  currentScreen = screens[name] ? name : 'today';
  (screens[name] || screens.today)(...args);
  if (['today', 'activities', 'walk', 'garden', 'week'].includes(name)) history.replaceState(null, '', '#' + name);
}

function cleanup() {
  stopSpeaking();
  if (run.pose) { import('./pose.js').then(m => m.stopPose()); run.pose = false; }
}

// ---------- 第一次使用 ----------
screens.welcome = () => {
  page('歡迎', `
    <div class="hero-card">
      <div class="buddy big">${buddy()}</div>
      <p class="lead">你好！我是心動小夥伴。</p>
      <p>我會陪你每天動一動，也會幫你照顧一座小花園。</p>
    </div>
    <label class="field">怎麼稱呼你？（可以不填）
      <input id="name" type="text" maxlength="12" placeholder="例如：林阿姨" value="${esc(S.get().profile.name)}">
    </label>
    <p class="note">開始之前，有 ${C.SCREENING.length} 個簡單問題，幫我們知道哪些活動適合你。</p>
    <button class="btn primary" data-act="startScreening">好，開始</button>
    <button class="btn ghost" data-act="demo">載入展示資料（初審展示用）</button>
  `);
  speak('你好！我是心動小夥伴。我會陪你每天動一動，也會幫你照顧一座小花園。');
};

screens.screening = () => {
  const i = run.screenIdx, q = C.SCREENING[i].q;
  page('健康小問題', `
    <p class="progress">第 ${i + 1} 題，共 ${C.SCREENING.length} 題</p>
    <div class="q-card"><p class="q">${esc(q)}</p>${sayBtn(q)}</div>
    <div class="answer-row">
      <button class="btn choice" data-ans="yes">有</button>
      <button class="btn choice" data-ans="no">沒有</button>
      <button class="btn choice soft" data-ans="unsure">不確定</button>
    </div>
    <p class="note">這些問題參考國際常用的身體活動準備問卷改寫，只用來挑選適合的活動，不是醫療診斷。</p>
  `, { back: i === 0 ? 'setupWith' : null });
  speak(q);
};

screens.setupWith = () => {
  const q = '今天有家人或據點人員陪你一起設定嗎？';
  page('一起設定', `
    <div class="q-card"><p class="q">${q}</p>${sayBtn(q)}</div>
    <div class="answer-row two">
      <button class="btn choice" data-setup="yes">有人陪我</button>
      <button class="btn choice" data-setup="no">我自己設定</button>
    </div>
    <p class="note">建議第一次由家人或據點人員陪同回答，比較不會漏掉重要的事。</p>
  `, { back: 'welcome' });
  speak(q);
};

// 篩選結果：doctor 類任一「有/不確定」→ seated；否則 assist 類任一 → assisted；否則 standard
export function screeningLevel(ans) {
  const hit = tier => C.SCREENING.some((s, i) => s.tier === tier && ans[i] !== 'no');
  return hit('doctor') ? 'seated' : hit('assist') ? 'assisted' : 'standard';
}
const effectiveLevel = () => {
  const sc = S.get().profile.screening;
  return sc.level === 'seated' && sc.cleared ? 'assisted' : sc.level;
};

screens.screenResult = () => {
  const flags = run.screenAns.map((a, i) => (a !== 'no' ? i : -1)).filter(i => i >= 0);
  const level = screeningLevel(run.screenAns);
  const p = S.get().profile;
  p.screening = { done: true, level, flags, at: new Date().toISOString(), cleared: false, setupWith: run.setupWith || 'no' };
  S.save();
  const msg = {
    seated: '謝謝你！有些問題需要醫師確認，所以我們先從坐著做的溫和動作開始。扶著椅子的活動和散步，請先問過醫師，再請據點人員幫你打開。',
    assisted: '謝謝你！坐著的活動可以自己做。扶著椅子的活動和出門散步，請在家人或據點人員陪同時進行。',
    standard: '謝謝你！你可以做坐著和扶著椅子的活動，也可以出門散步。每天開始前，我還是會再確認一次身體狀況。',
  }[level];
  page('篩選完成', `
    <div class="q-card"><p class="q">${msg}</p>${sayBtn(msg)}</div>
    <h2>緊急時要通知誰？（可以之後再填）</h2>
    <label class="field">稱呼<input id="cname" type="text" maxlength="12" placeholder="例如：女兒 小婷"></label>
    <label class="field">電話<input id="cphone" type="tel" inputmode="tel" maxlength="15" placeholder="0912345678"></label>
    <button class="btn primary" data-act="finishOnboard">完成，進入首頁</button>
  `);
  speak(msg);
};

// ---------- 首頁 ----------
function greeting() {
  const h = new Date().getHours();
  const n = S.get().profile.name;
  const who = n ? `${n}，` : '';
  if (h < 11) return `${who}早安！今天好嗎？`;
  if (h < 14) return `${who}午安！吃飽了嗎？`;
  if (h < 18) return `${who}下午好！今天過得怎麼樣？`;
  return `${who}晚安！今天辛苦了。`;
}

function buddy() {
  // 心動小夥伴：一株會微笑的小芽（原創）
  return `<svg viewBox="0 0 80 80" aria-hidden="true"><circle cx="40" cy="48" r="26" fill="#3CC48A"/><path d="M40 22c0-10 8-16 18-16-1 10-8 16-18 16zM40 24c-1-8-7-12-15-12 1 8 7 12 15 12z" fill="#2F7D57"/><circle cx="31" cy="46" r="3.5" fill="#1D2B24"/><circle cx="49" cy="46" r="3.5" fill="#1D2B24"/><path d="M32 56q8 7 16 0" stroke="#1D2B24" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="25" cy="54" r="3.5" fill="#F7A6A0" opacity=".7"/><circle cx="55" cy="54" r="3.5" fill="#F7A6A0" opacity=".7"/></svg>`;
}

function rescreenDue() {
  const at = S.get().profile.screening.at;
  return at && (Date.now() - new Date(at).getTime()) / 86400000 > C.RESCREEN_DAYS;
}

screens.today = () => {
  S.ensureToday();
  const s = S.get(), t = s.today, w = S.weekStats();
  const mood = t.mood ? C.MOODS.find(m => m.id === t.mood) : null;
  const g = greeting();
  page('心動力', `
    ${s.demo ? '<p class="demo-flag">展示模式：資料為示範用</p>' : ''}
    <div class="hero-card">
      <div class="buddy">${buddy()}</div>
      <div><p class="lead">${esc(g)}</p><p>今天想聊聊，還是一起動一動？</p></div>
      ${sayBtn(g + '今天想聊聊，還是一起動一動？')}
    </div>
    ${rescreenDue() ? '<button class="btn soft" data-act="redoScreening">已經 3 個月了，請重新回答健康小問題</button>' : ''}
    ${fofDue() ? '<button class="btn soft" data-go="fof">每週小問題：走路時擔心跌倒嗎？</button>' : ''}
    <button class="btn big mood-btn" data-go="mood">${mood ? `今天心情：${mood.face} ${mood.label}（點我更改）` : '說說今天的心情'}</button>
    <div class="grid2">
      <button class="tile move" data-act="startActivity"><strong>開始活動</strong><span>在家輕鬆動一動</span></button>
      <button class="tile walk" data-go="walk"><strong>出門散步</strong><span>幫花園澆水</span></button>
      <button class="tile garden" data-go="garden"><strong>心動綠洲</strong><span>看看我的花園</span></button>
      <button class="tile chat" data-go="chat"><strong>跟小夥伴聊聊</strong><span>說說話也很好</span></button>
    </div>
    <button class="week-strip" data-go="week">
      <span>這週已經動了 <b>${w.total}</b> 次${w.km ? `，散步 <b>${w.km.toFixed(1)}</b> 公里` : ''}</span>
      <span class="dots">${w.days.map(d => `<i class="${d.count ? 'on' : ''}" title="${d.label}"></i>`).join('')}</span>
    </button>
  `, { tab: 'today' });
};

// ---------- 心情 ----------
screens.mood = () => {
  page('今天心情如何？', `
    <div class="mood-grid">${C.MOODS.map(m => `<button class="mood" data-mood="${m.id}"><span class="face">${m.face}</span>${m.label}</button>`).join('')}</div>
    ${canListen ? `<button class="btn ghost" data-act="moodVoice">${icon('mic')} 用說的告訴我</button>` : ''}
    <button class="btn ghost" data-act="startActivity">略過，直接開始活動</button>
    <div id="moodReply"></div>
  `, { back: 'today' });
  speak('今天心情如何？可以點選，也可以略過。');
};

function showMoodReply(id) {
  S.setMood(id);
  const m = C.MOODS.find(x => x.id === id);
  $('#moodReply').innerHTML = `
    <div class="bubble bot">${esc(m.reply)}</div>
    ${id === 'upset' ? `<a class="btn line-btn soft" href="tel:${C.EMERGENCY.mental}">撥打 1925 安心專線</a>` : ''}
    <button class="btn primary" data-act="startActivity">好，開始活動</button>
    <button class="btn ghost" data-go="chat">再聊一下</button>`;
  speak(m.reply);
  $('#moodReply').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ---------- 每日安全確認 ----------
screens.check = () => {
  const i = run.checkIdx, c = C.DAILY_CHECK[i];
  page('活動前確認', `
    <p class="progress">第 ${i + 1} 題，共 ${C.DAILY_CHECK.length} 題</p>
    <div class="q-card"><p class="q">${esc(c.q)}</p>${sayBtn(c.q)}</div>
    <div class="answer-row">
      <button class="btn choice" data-check="yes">${c.yes}</button>
      <button class="btn choice" data-check="no">${c.no}</button>
      <button class="btn choice soft" data-check="unsure">不確定</button>
    </div>
    <p class="note">${i === 0 ? '回答「有」或「不確定」，今天就先休息，不做運動。' : '回答「不確定」，今天就只提供坐著做的溫和活動。'}</p>
  `, { back: 'today' });
  speak(c.q);
};

function finishCheck() {
  const a = run.checkAns, s = S.get();
  let allowed = 'standard';
  if (a.chest !== 'no') allowed = 'none';            // 胸悶胸痛頭暈：有或不確定 → 今天停止
  else if (a.pain !== 'no' || a.ready !== 'yes' || s.today.mood === 'tired' || effectiveLevel() === 'seated') allowed = 'seated';
  s.today.check = { ...a }; s.today.allowed = allowed; S.save();
  if (allowed === 'none') return go('stopToday');
  const next = run.afterCheck || 'activities'; run.afterCheck = null;
  go(next);
}

screens.stopToday = () => {
  const msg = '今天先不要運動，坐下來好好休息。如果胸痛、呼吸困難、冒冷汗或很暈，請馬上打 119。';
  page('今天先休息', `
    <div class="q-card warn"><p class="q">${msg}</p>${sayBtn(msg)}</div>
    <a class="btn danger" href="tel:${C.EMERGENCY.medical}">撥打 119</a>
    ${contactButtons()}
    <button class="btn ghost" data-go="garden">看看花園就好</button>
  `, { back: 'today' });
  speak(msg);
};

// ---------- 活動列表 ----------
screens.activities = () => {
  S.ensureToday();
  const t = S.get().today;
  if (!t.allowed) {
    page('活動', `
      <div class="q-card"><p class="q">開始活動前，先回答 3 個簡單問題，確認今天身體狀況。</p></div>
      <button class="btn primary" data-act="startCheck">開始確認</button>
    `, { tab: 'activities' });
    return;
  }
  if (t.allowed === 'none') return go('stopToday');
  const seatedOnly = t.allowed === 'seated';
  const assisted = effectiveLevel() === 'assisted';
  const list = C.ACTIVITIES.map(a => {
    const ok = !seatedOnly || a.level === 'seated';
    const tag = a.level === 'seated' ? '坐著做' : assisted ? '扶著椅子・需有人陪同' : '扶著椅子';
    return `<button class="act-card ${ok ? '' : 'off'}" ${ok ? `data-activity="${a.id}"` : 'disabled aria-disabled="true"'}>
      <span class="act-name">${a.name}</span>
      <span class="act-meta">${tag}・約 ${a.minutes} 分鐘${a.pose ? '・可用鏡頭計數' : ''}</span>
      <span class="act-goal">${ok ? a.goal : '今天先做坐著的活動'}</span>
    </button>`;
  }).join('');
  const lead = seatedOnly
    ? (effectiveLevel() === 'seated' ? '依照健康小問題的結果，目前先做坐著的溫和動作。' : '依照今天的回答，先做坐著的溫和動作。')
    : assisted ? '坐著的活動可以自己做；扶著椅子的活動請在有人陪同時進行。' : '今天可以做坐著或扶著椅子的活動。';
  page('選一個活動', `
    <p class="note strong">${lead}</p>
    <div class="act-list">${list}</div>
  `, { tab: 'activities' });
};

// ---------- 有人陪同確認 ----------
screens.companion = () => {
  const q = '這個活動需要有人在旁邊陪同。現在有家人或據點人員在你身邊嗎？';
  page('需要有人陪同', `
    <div class="q-card"><p class="q">${q}</p>${sayBtn(q)}</div>
    <div class="answer-row two">
      <button class="btn choice" data-companion="yes">有，在旁邊</button>
      <button class="btn choice" data-companion="no">沒有</button>
    </div>
  `, { back: 'activities' });
  speak(q);
};

function needsCompanion(kind) {
  return effectiveLevel() === 'assisted' && (kind === 'walk' || C.ACTIVITIES.find(a => a.id === kind)?.level === 'standing');
}

// ---------- 活動進行 ----------
screens.player = id => {
  const a = C.ACTIVITIES.find(x => x.id === id);
  run.activity = a; run.reps = 0;
  page(a.name, `
    <div class="cue-card">
      <ol class="cues">${a.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ol>
      ${sayBtn(a.cues.join(''))}
    </div>
    <p class="caution">${esc(a.caution)}</p>
    <p class="easier"><b>覺得太難：</b>${esc(a.easier)}</p>
    <div class="counter" aria-live="polite"><span id="reps">0</span><small>/ ${a.reps} 下</small><span class="reps-note">${esc(a.repsNote || '')}</span></div>
    <div id="poseBox" class="pose-box" hidden>
      <video id="cam" playsinline muted></video><canvas id="overlay"></canvas>
      <p id="poseStatus" class="pose-status"></p>
    </div>
    <button class="btn huge primary" data-act="rep">完成一下</button>
    ${a.pose ? '<button class="btn ghost" data-act="pose" id="poseBtn">開鏡頭幫我數</button>' : ''}
    <button class="btn" data-act="finishActivity">做完了</button>
  `, { back: 'activities' });
  speak(`我們來做${a.name}。${a.cues.join('')}${a.caution}`);
};

function addRep() {
  run.reps += 1;
  const el = $('#reps'); if (!el) return;
  el.textContent = run.reps;
  const target = run.activity.reps;
  if (run.reps === target) speak('完成了！做得很好！');
  else if (run.reps === Math.ceil(target / 2)) speak(`${run.reps}下，已經一半了，很棒！`);
  else speak(String(run.reps));
}

async function togglePose() {
  const box = $('#poseBox'), btn = $('#poseBtn'), status = $('#poseStatus');
  const pose = await import('./pose.js');
  if (run.pose) { pose.stopPose(); run.pose = false; box.hidden = true; btn.textContent = '開鏡頭幫我數'; return; }
  box.hidden = false; btn.textContent = '關閉鏡頭';
  try {
    run.pose = true;
    await pose.startPose($('#cam'), $('#overlay'), {
      onRep: addRep,
      onStatus: m => { status.textContent = m; },
      onAngle: a => { status.dataset.angle = a; },
    });
  } catch (e) {
    run.pose = false;
    const denied = e && (e.name === 'NotAllowedError' || e.name === 'SecurityError');
    status.textContent = e?.friendly ? e.message
      : denied ? '沒有鏡頭權限。請在瀏覽器設定中允許使用相機，或按「完成一下」自己計數。'
      : '鏡頭或辨識模型暫時無法使用（需要網路），請按「完成一下」自己計數。';
    btn.textContent = '再試一次';
  }
}

function finishActivity() {
  const a = run.activity;
  if (run.pose) { import('./pose.js').then(m => m.stopPose()); run.pose = false; }
  if (run.reps === 0) { go('activities'); return; }
  const before = S.get().garden.plots.map(p => p.stage);
  S.addSession({ type: 'home', activityId: a.id, name: a.name, reps: run.reps, minutes: a.minutes });
  rewardHome();
  const after = S.get().garden.plots.map(p => p.stage);
  const grown = after.findIndex((s, i) => s !== before[i]);
  run.lastReward = { title: `${a.name} ${run.reps} 下，完成！`, detail: grown >= 0 ? '得到 1 顆種子，也幫花園澆了水。' : '得到 1 顆種子！花都開好了，水先存起來，種新植物時會用上。', grown };
  go('afterMood');
}

// ---------- 活動後心情（行為活化） ----------
screens.afterMood = () => {
  const q = '動完之後，心情怎麼樣？';
  page('動完了！', `
    <div class="q-card"><p class="q">${q}</p>${sayBtn(q)}</div>
    <div class="mood-grid three">${C.AFTER_MOODS.map(m => `<button class="mood" data-after="${m.id}"><span class="face">${m.face}</span>${m.label}</button>`).join('')}</div>
    <button class="btn ghost" data-after="skip">略過</button>
    <p class="note">這個小問題幫你看見「動一動」和「心情」的關係，每週回顧裡可以看到。</p>
  `);
  speak(q);
};

// ---------- 跌倒擔心度（每週一次） ----------
function fofDue() {
  const f = S.get().fof;
  if (!S.get().profile.screening.done) return false;
  if (!f.length) return true;
  return (Date.now() - new Date(f[f.length - 1].at).getTime()) / 86400000 >= C.FOF_DAYS;
}

screens.fof = () => {
  const q = C.FOF_QUESTION;
  page('每週小問題', `
    <div class="q-card"><p class="q">${q}</p>${sayBtn(q + '0 分是完全不擔心，10 分是非常擔心。')}</div>
    <div class="scale">${Array.from({ length: 11 }, (_, i) => `<button class="scale-btn" data-fof="${i}">${i}</button>`).join('')}</div>
    <div class="scale-ends"><span>0 完全不擔心</span><span>10 非常擔心</span></div>
    <button class="btn ghost" data-go="today">下次再回答</button>
    <div id="fofReply"></div>
  `, { back: 'today' });
  speak(q + '0 分是完全不擔心，10 分是非常擔心。');
};

// ---------- 獎勵 ----------
screens.reward = () => {
  const r = run.lastReward || { title: '完成！', detail: '', grown: -1 };
  const p = r.grown >= 0 ? S.get().garden.plots[r.grown] : null;
  const grownText = p ? `${C.PLANTS[p.type].name}長到「${C.STAGE_NAMES[p.stage]}」了！` : '';
  const mr = run.afterMoodReply; run.afterMoodReply = null;
  page('做得很好', `
    <div class="reward">
      ${mr ? `<div class="bubble bot" style="text-align:left">${esc(mr)}</div>` : ''}
      <p class="lead">${esc(r.title)}</p>
      <div class="garden-view">${gardenSVG({ highlight: r.grown })}</div>
      <p>${esc(r.detail)} ${esc(grownText)}</p>
    </div>
    ${canPlant() ? '<button class="btn primary" data-go="garden">去種新的植物</button>' : ''}
    <button class="btn" data-go="today">回首頁</button>
  `);
  speak(`${mr || ''}${r.title}${r.detail}${grownText}`);
};

// ---------- 心動綠洲 ----------
screens.garden = () => {
  const g = S.get().garden;
  const bloom = g.plots.filter(p => p.stage === 3).length;
  const pct = Math.min(100, Math.round(g.communityKm / C.COMMUNITY_GOAL_KM * 100));
  const picker = canPlant() ? `<h2>選一種植物種下去</h2><div class="seed-row">${g.unlocked.map(t => `
      <button class="seed" data-plant="${t}"><svg viewBox="0 0 60 70" aria-hidden="true">${plantSVG(t, 3, 30, 62, 0.95)}</svg>${C.PLANTS[t].name}</button>`).join('')}</div>` : '';
  page('心動綠洲', `
    <div class="garden-view">${gardenSVG()}</div>
    <div class="stats3">
      <div><b>${g.seeds}</b><span>顆種子</span></div>
      <div><b>${g.plots.length}</b><span>株植物</span></div>
      <div><b>${bloom}</b><span>朵花開了</span></div>
    </div>
    ${picker}
    ${g.plots.length >= C.GARDEN_SLOTS ? '<p class="note">花園種滿了！之後的活動會繼續幫植物澆水。</p>' : ''}
    <div class="panel">
      <h2>社區合作任務</h2>
      <p>據點的大家一起散步 ${C.COMMUNITY_GOAL_KM} 公里，就能一起種出一棵大樹。</p>
      <div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div>
      <p class="note">目前 ${g.communityKm.toFixed(1)} 公里（展示資料）</p>
    </div>
    <div class="panel">
      <h2>怎麼讓花園長大？</h2>
      <ul class="rules">
        <li>在家做完一次活動：得到 1 顆種子，並澆 1 次水。</li>
        <li>出門散步：每走 0.3 公里澆 1 次水。</li>
        <li>散步時到公園或據點打卡：解鎖高雄市花「木棉花」。</li>
      </ul>
      ${g.checkins.length ? `<p class="note">已打卡：${g.checkins.map(c => esc(c.name)).join('、')}</p>` : ''}
    </div>
  `, { tab: 'garden' });
};

// ---------- 散步 ----------
function weatherTip() {
  const now = new Date(), h = now.getHours(), m = now.getMonth() + 1;
  if (m >= 5 && m <= 10 && h >= 10 && h < 16) return '現在是一天最熱的時段，建議早上或傍晚再出門，記得帶水。';
  if ((m === 12 || m <= 2) && (h < 8 || h >= 18)) return '天冷的清晨和晚上，血壓容易受影響。建議等太陽出來、穿暖再出門。';
  return '';
}

screens.walk = () => {
  if (run.walk) return screens.walking();
  S.ensureToday();
  const t = S.get().today;
  if (!t.allowed) {
    page('出門散步', `
      <div class="q-card"><p class="q">出門前，先回答 3 個簡單問題，確認今天身體狀況。</p></div>
      <button class="btn primary" data-act="walkCheck">開始確認</button>
    `, { tab: 'walk' });
    return;
  }
  if (t.allowed !== 'standard') {
    const why = t.allowed === 'none' ? '今天身體有不舒服，先在家休息，不要出門散步。'
      : effectiveLevel() === 'seated' ? '散步要先問過醫師，再請據點人員幫你打開。現在可以先做坐著的活動。'
      : '依照今天的回答，先做坐著的溫和活動，散步改天再去。';
    page('出門散步', `
      <div class="q-card"><p class="q">${why}</p>${sayBtn(why)}</div>
      ${t.allowed === 'none' ? '' : '<button class="btn primary" data-go="activities">去做坐著的活動</button>'}
      <button class="btn ghost" data-act="walkDemo">模擬路線（室內展示用）</button>
    `, { tab: 'walk' });
    return;
  }
  const tip = weatherTip();
  const keep = S.get().profile.shareRoute;
  page('出門散步', `
    ${tip ? `<div class="q-card warn"><p class="q">${tip}</p></div>` : ''}
    ${effectiveLevel() === 'assisted' ? '<p class="note strong">散步請在家人或據點人員陪同時進行。</p>' : ''}
    <div class="panel">
      <h2>出門前</h2>
      <ul class="rules">
        <li>帶手機、水和帽子，穿好走的鞋。</li>
        <li>走路時聽語音提示就好，不用一直看手機。</li>
        <li>手機螢幕要保持亮著，才能記錄路線。</li>
      </ul>
    </div>
    <label class="switch"><input type="checkbox" data-act="toggleRoute" ${keep ? 'checked' : ''}><span>保存完整路線（不勾選時只記錄距離和時間）</span></label>
    <button class="btn huge primary" data-act="walkReal">開始散步</button>
    <button class="btn ghost" data-act="walkDemo">模擬路線（室內展示用）</button>
  `, { tab: 'walk' });
};

screens.walking = () => {
  page('散步中', `
    <div id="map" class="map"></div>
    <div class="walk-stats" aria-live="polite">
      <div><b id="wkm">0.00</b><span>公里</span></div>
      <div><b id="wtime">0:00</b><span>時間</span></div>
      <div><b id="wwater">0</b><span>次澆水</span></div>
    </div>
    <p id="walkMsg" class="note"></p>
    <div class="grid2">
      <button class="btn" data-act="shareLive">安心分享位置</button>
      <button class="btn" data-act="checkin">在這裡打卡</button>
    </div>
    <button class="btn huge primary" data-act="walkStop">結束散步</button>
  `, { tab: 'walk' });
  if (run.walk) { run.walk.attach($('#map')); return; }
  const ctl = createWalk($('#map'), {
    onUpdate: ({ km, seconds }) => {
      const k = $('#wkm'); if (!k) return;
      k.textContent = km.toFixed(2);
      $('#wtime').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
      $('#wwater').textContent = Math.floor(km / C.KM_PER_WATER);
      const half = Math.floor(km / 0.5);
      if (half > (run.walkInfo.spoken || 0)) { run.walkInfo.spoken = half; speak(`已經走了${(half * 0.5).toFixed(1)}公里，很棒！累了就找地方坐下休息。`); }
    },
    onError: m => { const el = $('#walkMsg'); if (el) el.textContent = m; },
  });
  run.walk = ctl;
  run.walkInfo.demo ? ctl.startDemo() : ctl.startReal();
  speak(run.walkInfo.demo ? '開始模擬散步。' : '開始散步囉！慢慢走，注意安全。');
};

function stopWalk() {
  const out = run.walk.stop();
  const demo = run.walkInfo.demo;
  run.walk = null;
  if (out.km < 0.05 && !demo) { go('walk'); return; }
  const before = S.get().garden.plots.map(p => p.stage);
  S.addSession({ type: 'walk', name: '散步', km: out.km, minutes: out.minutes, ...(S.get().profile.shareRoute ? { route: out.route } : {}) });
  const r = rewardWalk(out.km);
  const after = S.get().garden.plots.map(p => p.stage);
  const grown = after.findIndex((s, i) => s !== before[i]);
  run.lastReward = { title: `散步 ${out.km.toFixed(2)} 公里，完成！`, detail: grown >= 0 ? `幫花園澆了 ${r.water} 次水。` : `存了 ${r.water} 次水，種新植物時會用上。`, grown };
  go('afterMood');
}

async function doCheckin() {
  const pos = run.walk?.current() || await getPosition().catch(() => null);
  const name = prompt('這裡是哪裡？（例如：社區公園、關懷據點）', '社區公園');
  if (!name) return;
  const r = checkin({ name: name.slice(0, 12), lat: pos?.[0] ?? null, lng: pos?.[1] ?? null });
  const msg = r.unlockedKapok ? `打卡成功！解鎖了高雄市花「木棉花」，還得到 1 顆種子。` : `在「${name}」打卡成功，得到 1 顆種子！`;
  const el = $('#walkMsg'); if (el) el.textContent = msg;
  speak(msg);
}

// ---------- 週回顧 ----------
screens.week = () => {
  const w = S.weekStats();
  const max = Math.max(2, ...w.days.map(d => d.count));
  const bars = w.days.map((d, i) => {
    const h = d.count / max * 110;
    const x = 20 + i * 46;
    return `<rect x="${x}" y="${130 - h}" width="30" height="${Math.max(h, 2)}" rx="6" fill="${d.count ? '#2F7D57' : '#CFDCCB'}"/>
      <text x="${x + 15}" y="${124 - h}" text-anchor="middle" class="bar-n">${d.count || ''}</text>
      <text x="${x + 15}" y="156" text-anchor="middle" class="bar-l">${d.label}</text>`;
  }).join('');
  const moodRow = w.days.map(d => `<span title="${d.label}">${d.mood ? C.MOODS.find(m => m.id === d.mood).face : '·'}</span>`).join('');
  const recent = S.get().sessions.slice(-5).reverse().map(s => {
    const d = new Date(s.at);
    return `<li><span>${d.getMonth() + 1}/${d.getDate()}</span>${s.type === 'walk' ? `散步 ${s.km.toFixed(2)} 公里` : `${esc(actName(s.activityId))} ${s.reps} 下`}</li>`;
  }).join('');
  page('這週的我', `
    <div class="stats3">
      <div><b>${w.total}</b><span>次活動</span></div>
      <div><b>${w.activeDays}</b><span>天有動</span></div>
      <div><b>${w.km.toFixed(1)}</b><span>公里散步</span></div>
    </div>
    <div class="panel"><h2>每天活動次數</h2>
      <svg viewBox="0 0 340 165" class="week-chart" role="img" aria-label="過去七天活動次數">${bars}</svg>
    </div>
    <div class="panel"><h2>心情紀錄</h2><div class="mood-row">${moodRow}</div></div>
    <div class="panel">
      <h2>動一動，心情有變好嗎？</h2>
      ${w.rated ? `<p class="big-line">這週有 <b>${w.better}</b> 次，動完之後心情變好了</p><p class="note">共 ${w.rated} 次有回答「動完的心情」</p>` : '<p class="note">完成活動後回答「動完的心情」，這裡就會顯示。</p>'}
    </div>
    ${fofPanel()}
    <div class="panel">
      <h2>跟重要的人說說話</h2>
      <p>這週有什麼開心的事，想跟家人或朋友分享嗎？</p>
      ${S.get().profile.contacts[0] ? `<a class="btn" href="tel:${esc(S.get().profile.contacts[0].phone)}">打給${esc(S.get().profile.contacts[0].name)}</a>` : ''}
    </div>
    ${recent ? `<div class="panel"><h2>最近的紀錄</h2><ul class="recent">${recent}</ul></div>` : ''}
    <a class="btn line-btn" href="${lineURL(weeklyText())}" target="_blank" rel="noopener">用 LINE 分享給家人</a>
    <button class="btn ghost" data-act="shareWeek">用其他方式分享</button>
  `, { tab: 'week' });
};

function fofPanel() {
  const f = S.get().fof.slice(-6);
  if (!f.length) return `<div class="panel"><h2>走路時擔心跌倒嗎？</h2><p class="note">每週回答一次，看看自己的信心有沒有越來越好。</p><button class="btn ghost" data-go="fof">現在回答</button></div>`;
  const pts = f.map((x, i) => {
    const X = f.length === 1 ? 160 : 30 + i * (260 / (f.length - 1));
    return { X, Y: 20 + x.score * 9, s: x.score, d: new Date(x.at) };
  });
  const svg = `<svg viewBox="0 0 320 135" class="week-chart" role="img" aria-label="跌倒擔心度趨勢">
    <line x1="20" y1="110" x2="300" y2="110" stroke="#CFDCCB" stroke-width="2"/>
    <polyline fill="none" stroke="#E9A93B" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" points="${pts.map(p => `${p.X},${p.Y}`).join(' ')}"/>
    ${pts.map(p => `<circle cx="${p.X}" cy="${p.Y}" r="8" fill="#F2B33D"/><text x="${p.X}" y="${p.Y - 13}" text-anchor="middle" class="bar-n">${p.s}</text><text x="${p.X}" y="130" text-anchor="middle" class="bar-l">${p.d.getMonth() + 1}/${p.d.getDate()}</text>`).join('')}
  </svg>`;
  const first = f[0].score, last = f[f.length - 1].score;
  const trend = f.length > 1 ? (last < first ? '擔心的程度比之前少了，信心慢慢回來了！' : last > first ? '最近比較擔心，我們從坐著的動作慢慢練。' : '和之前差不多，繼續一步一步來。') : '';
  return `<div class="panel"><h2>走路時擔心跌倒的程度</h2>${svg}${trend ? `<p>${trend}</p>` : ''}<p class="note">0 分完全不擔心，10 分非常擔心。這是自己的感覺紀錄，不是醫療判斷。</p>${fofDue() ? '<button class="btn ghost" data-go="fof">回答這週的問題</button>' : ''}</div>`;
}

// ---------- 聊天（展示模式） ----------
screens.chat = () => {
  const msgs = S.get().chat;
  page('跟小夥伴聊聊', `
    <p class="demo-flag">展示模式：回應為預先設計，決審版將串接 AI</p>
    <div class="chat" id="chatLog">
      <div class="bubble bot">${esc(greeting())} 想聊什麼都可以，我在這裡。</div>
      ${msgs.map(m => `<div class="bubble ${m.who}">${esc(m.text)}</div>`).join('')}
    </div>
    <div class="chips">${C.CHAT_CHIPS.map(c => `<button class="chip" data-chip="${esc(c)}">${esc(c)}</button>`).join('')}</div>
    <form class="chat-input" data-form="chat">
      <input id="chatText" type="text" maxlength="80" placeholder="想說什麼呢？" aria-label="輸入訊息">
      ${canListen ? `<button type="button" class="icon-btn" data-act="chatVoice" aria-label="用說的">${icon('mic')}</button>` : ''}
      <button type="submit" class="btn send">送出</button>
    </form>
  `, { back: 'today' });
  const log = $('#chatLog'); log.scrollTop = log.scrollHeight;
};

function sendChat(text) {
  text = text.trim(); if (!text) return;
  const s = S.get();
  const rule = C.CHAT_RULES.find(r => r.keys.some(k => text.includes(k)));
  let reply = rule ? rule.reply : C.CHAT_DEFAULT;
  // AI 是橋梁、不是替代：每聊 4 句，鼓勵和真實的人連結（危機與身體緊急回覆除外）
  const mine = s.chat.filter(m => m.who === 'me').length + 1;
  if (!rule?.crisis && !rule?.body && mine % 4 === 0) reply += '\n' + C.BRIDGE_LINES[(mine / 4) % C.BRIDGE_LINES.length];
  s.chat.push({ who: 'me', text }, { who: 'bot', text: reply });
  s.chat = s.chat.slice(-40);
  S.save();
  screens.chat();
  speak(reply);
  const log = $('#chatLog');
  if (rule?.crisis) log.insertAdjacentHTML('beforeend', `<a class="btn danger" href="tel:${C.EMERGENCY.mental}">撥打 1925 安心專線</a><a class="btn" href="tel:${C.EMERGENCY.medical}">撥打 119</a>`);
  if (rule?.body) log.insertAdjacentHTML('beforeend', `<a class="btn danger" href="tel:${C.EMERGENCY.medical}">撥打 119</a>`);
  if (rule?.go) log.insertAdjacentHTML('beforeend', `<button class="btn primary" data-act="startActivity">開始活動前確認</button>`);
  log.scrollTop = log.scrollHeight;
}

// ---------- 不舒服 / 求助 ----------
function contactButtons() {
  return S.get().profile.contacts.map(c => `<a class="btn" href="tel:${esc(c.phone)}">打給${esc(c.name)}</a>`).join('');
}

screens.help = () => {
  if (run.pose) { import('./pose.js').then(m => m.stopPose()); run.pose = false; }
  const msg = '先停下來，找地方坐下，慢慢深呼吸。';
  page('先停下來休息', `
    <div class="q-card warn"><p class="q">${msg}</p>${sayBtn(msg)}</div>
    <div class="panel">
      <p><b>胸痛、呼吸困難、很暈或跌倒受傷</b></p>
      <a class="btn danger" href="tel:${C.EMERGENCY.medical}">撥打 119</a>
    </div>
    <div class="panel">
      <p><b>心裡很難受，想找人說說話</b></p>
      <a class="btn soft" href="tel:${C.EMERGENCY.mental}">撥打 1925 安心專線（24 小時）</a>
    </div>
    <div class="panel">
      <p><b>通知家人</b></p>
      ${contactButtons() || '<p class="note">還沒有設定家人電話，可以到「設定」新增。</p>'}
      <button class="btn line-btn" data-act="helpLine">用 LINE 傳我的位置</button>
      <button class="btn" data-act="helpSms">用簡訊傳我的位置</button>
      <p id="helpMsg" class="note"></p>
    </div>
    <p class="note">心動力不是緊急救護服務，緊急狀況請直接撥打 119。</p>
    ${run.walk ? '<button class="btn primary" data-go="walking">回到散步</button>' : ''}
    <button class="btn ghost" data-go="today">我好多了，回首頁</button>
  `);
  speak(msg + '如果胸痛、呼吸困難或很暈，請馬上打 119。', { force: true });
};

async function sendHelp(kind) {
  const el = $('#helpMsg'); el.textContent = '正在取得位置…';
  const pos = run.walk?.current() || await getPosition().catch(() => null);
  el.textContent = pos ? '' : '取得不到位置，先傳出求助訊息。';
  const text = helpText(pos);
  const phone = S.get().profile.contacts[0]?.phone || '';
  location.href = kind === 'line' ? lineURL(text) : smsURL(text, phone);
}

// ---------- 設定 ----------
screens.settings = () => {
  const p = S.get().profile;
  page('設定', `
    <label class="field">我的稱呼<input id="sname" type="text" maxlength="12" value="${esc(p.name)}"></label>
    <h2>字的大小</h2>
    <div class="answer-row">${[[1, '標準'], [1.15, '大'], [1.3, '特大']].map(([v, l]) => `<button class="btn choice ${p.fontScale === v ? 'on' : ''}" data-font="${v}">${l}</button>`).join('')}</div>
    <label class="switch"><input type="checkbox" data-act="toggleVoice" ${p.voice ? 'checked' : ''}><span>語音朗讀</span></label>
    <button class="btn ghost" data-act="testVoice">測試聲音</button>
    <p id="voiceMsg" class="note"></p>
    <h2>家人聯絡電話</h2>
    ${p.contacts.map((c, i) => `<div class="contact-row"><span>${esc(c.name)}　${esc(c.phone)}</span><button class="btn small" data-delcontact="${i}">刪除</button></div>`).join('')}
    ${p.contacts.length < 3 ? `<label class="field">稱呼<input id="cname" type="text" maxlength="12"></label>
    <label class="field">電話<input id="cphone" type="tel" inputmode="tel" maxlength="15"></label>
    <button class="btn" data-act="addContact">新增聯絡人</button>` : ''}
    <button class="btn primary" data-act="saveSettings">儲存</button>
    <div class="panel">
      <h2>健康小問題</h2>
      <p>${{ seated: '目前只開放坐姿活動。', assisted: '扶椅活動與散步需有人陪同。', standard: '坐姿、扶椅活動與散步都可以。' }[effectiveLevel()]}</p>
      ${p.screening.at ? `<p class="note">上次回答：${new Date(p.screening.at).toLocaleDateString('zh-TW')}${p.screening.cleared ? '（已由專業人員確認）' : ''}</p>` : ''}
      <button class="btn ghost" data-act="redoScreening">重新回答健康小問題</button>
      ${p.screening.level === 'seated' && !p.screening.cleared ? '<button class="btn ghost" data-act="clearByStaff">專業人員確認後開放（請由醫師或據點人員操作）</button>' : ''}
    </div>
    <div class="panel">
      <h2>關於資料</h2>
      <p class="note">目前是訪客模式，所有紀錄只存在這支手機的瀏覽器裡，不會上傳。</p>
      <button class="btn ghost" data-act="demo">載入展示資料</button>
      <button class="btn ghost danger-text" data-act="reset">清除所有資料</button>
    </div>
  `, { back: 'today' });
};

function readContact() {
  const n = $('#cname')?.value.trim(), ph = $('#cphone')?.value.replace(/[^\d+]/g, '');
  if (n && ph) S.get().profile.contacts.push({ name: n, phone: ph });
}

// ---------- 事件 ----------
const actions = {
  help: () => go('help'),
  demo: () => { S.loadDemo(); setFont(); go('today'); },
  startScreening: () => { S.get().profile.name = $('#name').value.trim(); S.save(); go('setupWith'); },
  finishOnboard: () => { readContact(); S.save(); go('today'); },
  startActivity: () => {
    S.ensureToday();
    if (!S.get().today.allowed) { run.checkIdx = 0; run.checkAns = {}; go('check'); } else go('activities');
  },
  startCheck: () => { run.checkIdx = 0; run.checkAns = {}; go('check'); },
  moodVoice: async () => {
    speak('請說說看今天的心情。', { force: true });
    const t = await listenOnce(); if (!t) return;
    const map = [['upset', ['煩', '難過', '生氣', '不好']], ['tired', ['累', '睏', '沒力']], ['good', ['好', '開心', '不錯']]];
    const hit = map.find(([, ks]) => ks.some(k => t.includes(k)));
    showMoodReply(hit ? hit[0] : 'ok');
  },
  rep: addRep,
  pose: togglePose,
  finishActivity,
  toggleRoute: e => { S.get().profile.shareRoute = e.target.checked; S.save(); },
  walkReal: () => {
    run.walkInfo = { demo: false };
    if (needsCompanion('walk')) { run.companionNext = ['walking']; return go('companion'); }
    go('walking');
  },
  walkCheck: () => { run.afterCheck = 'walk'; run.checkIdx = 0; run.checkAns = {}; go('check'); },
  walkDemo: () => { run.walkInfo = { demo: true }; go('walking'); },
  walkStop: stopWalk,
  checkin: doCheckin,
  shareLive: async () => {
    const pos = run.walk?.current() || await getPosition().catch(() => null);
    const name = S.get().profile.name || '我';
    const text = pos ? `【心動力 AI】${name}正在散步，目前位置：https://maps.google.com/?q=${pos[0].toFixed(6)},${pos[1].toFixed(6)}` : `【心動力 AI】${name}正在散步，晚點跟你報平安。`;
    if (!(await nativeShare(text))) window.open(lineURL(text), '_blank');
  },
  shareWeek: async () => { if (!(await nativeShare(weeklyText()))) window.open(lineURL(weeklyText()), '_blank'); },
  chatVoice: async () => { const t = await listenOnce(); if (t) sendChat(t); },
  helpLine: () => sendHelp('line'),
  helpSms: () => sendHelp('sms'),
  testVoice: () => { speak('你好，我是心動小夥伴，聽得到我的聲音嗎？', { force: true }); $('#voiceMsg').textContent = voiceStatus(); },
  toggleVoice: e => { S.get().profile.voice = e.target.checked; S.save(); },
  addContact: () => { readContact(); S.save(); screens.settings(); },
  saveSettings: () => { S.get().profile.name = $('#sname').value.trim(); readContact(); S.save(); go('today'); },
  redoScreening: () => go('setupWith'),
  clearByStaff: () => {
    if (!confirm('這個按鈕請由醫師、物理治療師或據點人員操作。\n確認這位長輩已經過專業評估，可以在有人陪同下做扶椅活動和散步嗎？')) return;
    S.get().profile.screening.cleared = true; S.save(); screens.settings();
  },
  reset: () => { if (confirm('確定要清除所有紀錄和花園嗎？清除後無法復原。')) { S.reset(); setFont(); go('welcome'); } },
};

document.addEventListener('click', e => {
  const t = e.target.closest('button, a, input[type=checkbox]');
  if (!t) return;
  const d = t.dataset;
  if (d.say) return speak(d.say, { force: true });
  if (d.go) return go(d.go);
  if (d.act && t.type !== 'checkbox') return actions[d.act]?.(e);
  if (d.ans) {
    run.screenAns[run.screenIdx] = d.ans;
    run.screenIdx += 1;
    return run.screenIdx < C.SCREENING.length ? go('screening') : go('screenResult');
  }
  if (d.check) {
    run.checkAns[C.DAILY_CHECK[run.checkIdx].id] = d.check;
    if (C.DAILY_CHECK[run.checkIdx].id === 'chest' && d.check !== 'no') return finishCheck();
    run.checkIdx += 1;
    return run.checkIdx < C.DAILY_CHECK.length ? go('check') : finishCheck();
  }
  if (d.mood) return showMoodReply(d.mood);
  if (d.activity) {
    if (needsCompanion(d.activity)) { run.companionNext = ['player', d.activity]; return go('companion'); }
    return go('player', d.activity);
  }
  if (d.companion) {
    if (d.companion === 'yes') return go(...run.companionNext);
    const msg = '沒關係，我們先做坐著的活動。等有人陪你的時候，再一起做站著的活動或出門散步。';
    speak(msg); return go('activities');
  }
  if (d.setup) { run.setupWith = d.setup; run.screenIdx = 0; run.screenAns = []; return go('screening'); }
  if (d.plant) {
    if (plant(d.plant)) { speak(`種下了${C.PLANTS[d.plant].name}！`); go('garden'); }
    return;
  }
  if (d.chip) return sendChat(d.chip);
  if (d.after) {
    if (d.after !== 'skip') { S.setAfterMood(d.after); run.afterMoodReply = C.AFTER_MOODS.find(m => m.id === d.after).reply; }
    return go('reward');
  }
  if (d.fof) {
    const n = Number(d.fof); S.addFof(n);
    const msg = C.fofReply(n);
    $('#fofReply').innerHTML = `<div class="bubble bot">${esc(msg)}</div><button class="btn primary" data-go="today">回首頁</button>`;
    main().querySelectorAll('.scale-btn').forEach(b => { b.disabled = true; b.classList.toggle('on', b.dataset.fof === d.fof); });
    speak(msg); return;
  }
  if (d.font) { S.get().profile.fontScale = Number(d.font); S.save(); setFont(); return screens.settings(); }
  if (d.delcontact) { S.get().profile.contacts.splice(Number(d.delcontact), 1); S.save(); return screens.settings(); }
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.matches('input[type=checkbox][data-act]')) actions[t.dataset.act]?.(e);
});

document.addEventListener('submit', e => {
  if (e.target.dataset.form === 'chat') { e.preventDefault(); sendChat($('#chatText').value); }
});

// ---------- 啟動 ----------
setFont();
S.ensureToday();
const start = location.hash.slice(1);
if (!S.get().profile.screening.done) go('welcome');
else go(screens[start] ? start : 'today');

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
