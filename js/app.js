// 心動力 AI｜主程式（畫面與流程）
import * as S from './store.js';
import * as C from './content.js';
import { gardenSVG, plantSVG, rewardHome, rewardWalk, checkin, canPlant, plant, nextSuggestion, meetSpirit, befriend, spiritSVG } from './garden.js';
import { demoSVG, animateDemos } from './demos.js';
import { petSound, suspendAudio } from './petsound.js';
import { lifeState, growth, SHOP, roomSVG, diaryText } from './room.js';
import { PETS, CARE, TRICKS, petLine, petSVG, petStats } from './pet.js';
import { PLACES, getWeather, advise } from './weather.js';
import { startMusic, stopMusic, GUIDE } from './meditate.js';
import { KINDS, dueReminders, logKey, icsFor } from './reminders.js';
import { brandMark, lakeScene, forestScene, treeOfLife, badgeSVG } from './art.js';
import { speak, stopSpeaking, canListen, listenOnce, voiceStatus, canSpeak, voiceHeard, speakTest, unlockMediaChannel, listenTap, stopListening, listenErrorText, listVoices, refreshVoice, whenIdle } from './speech.js';
import { createWalk, getPosition, meters } from './walk.js';
import { findParks, bearingText, walkMinutes, gmapsWalkURL } from './places.js';
import { lineURL, smsURL, weeklyText, helpText, nativeShare, lineOaChatURL } from './share.js';

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
  lake: '<path d="M3 15c2 0 2-1.5 4.5-1.5S10 15 12 15s2.5-1.5 4.5-1.5S19 15 21 15M3 19c2 0 2-1.5 4.5-1.5S10 19 12 19s2.5-1.5 4.5-1.5S19 19 21 19M12 11c-2.5-1.5-3-5 0-8 3 3 2.5 6.5 0 8z"/>',
  forest: '<path d="M8 21v-4M16 21v-6M8 17 4 17 8 9l4 8zM16 15h-5l5-10 5 10z"/>',
  book: '<path d="M4 5c3-1.5 5.5-1.5 8 0v15c-2.5-1.5-5-1.5-8 0zM20 5c-3-1.5-5.5-1.5-8 0v15c2.5-1.5 5-1.5 8 0z"/>',
  tree: '<path d="M12 21v-7M12 14c-4 0-7-2.5-7-6s3-5 7-5 7 1.5 7 5-3 6-7 6zM9 21h6"/>',
};
const icon = (k, cls = '') => `<svg class="ic ${cls}" viewBox="0 0 24 24" aria-hidden="true">${I[k]}</svg>`;

// ---------- 共用版面 ----------
function setFont() {
  const f = S.get().profile.fontScale;
  document.documentElement.style.setProperty('--fs', f);
  document.documentElement.dataset.scale = f >= 1.5 ? 'large' : 'normal'; // 字放大時，改成單欄排版避免擠在一起
}

// 每一頁右上角的 LINE 聊聊：一鍵打開官方帳號，並帶入「我想聊聊」讓小夥伴問你想聊什麼
const NO_LINE = ['welcome', 'petPick', 'place', 'setupWith', 'screening', 'screenResult', 'check', 'checkSummary', 'companion', 'help', 'stopToday', 'coach'];
function lineHeaderBtn() {
  if (NO_LINE.includes(currentScreen)) return '';
  if (!C.lineReady()) return `<button class="line-top" data-go="chat" aria-label="跟小夥伴聊聊">${icon('chat')}<span>聊聊</span></button>`;
  return `<a class="line-top" href="${lineOaChatURL(C.LINE_OA_ID, lineOpener())}" target="_blank" rel="noopener" aria-label="打開 LINE 跟小夥伴聊聊">${icon('chat')}<span>LINE</span></a>`;
}

function header(title, { back = null } = {}) {
  return `<header class="top">
    ${back ? `<button class="icon-btn" ${back.startsWith('act:') ? `data-act="${back.slice(4)}"` : `data-go="${back}"`} aria-label="回上一頁">${icon('back')}</button>` : `<button class="brand" data-go="today" aria-label="回首頁">${brandMark(42)}</button>`}
    <h1>${esc(title)}</h1>
    ${lineHeaderBtn()}
    <button class="help-btn" data-act="help">不舒服</button>
  </header>`;
}

// 五大場景：首頁、心靈湖畔、活力森林、知識花園、我的綠洲
const TAB_OF = { activities: 'forest', walk: 'forest', garden: 'oasis', week: 'oasis' };
function nav(active) {
  active = TAB_OF[active] || active;
  const items = [['today', '首頁', 'home'], ['lake', '心靈湖畔', 'lake'], ['forest', '活力森林', 'forest'], ['knowledge', '知識花園', 'book'], ['oasis', '我的綠洲', 'tree']];
  return `<nav class="tabs" aria-label="主要選單"><button class="tab-settings" data-go="settings">${icon('gear')}<span>設定</span></button>${items.map(([id, label, ic]) =>
    `<button data-go="${id}" class="${active === id ? 'on' : ''}" ${active === id ? 'aria-current="page"' : ''}>${icon(ic)}<span>${label}</span></button>`).join('')}</nav>`;
}

// LINE、Facebook 等 APP 內建瀏覽器：常不支援語音朗讀，鏡頭與定位也較不穩，紀錄也和手機瀏覽器分開
const UA = navigator.userAgent;
const IN_LINE = /\bLine\//i.test(UA);
const IN_APP = IN_LINE || /FBAN|FBAV|Instagram/i.test(UA);
const IS_IOS = /iPhone|iPad|iPod/i.test(UA), IS_ANDROID = /Android/i.test(UA);
function inAppBanner() {
  if (!IN_APP) return '';
  const base = `${location.host}${location.pathname}`;
  const ext = `https://${base}?openExternalBrowser=1`;
  // Android：直接用 Chrome 開啟；iPhone（iOS 17 以上）：直接用 Safari 開啟
  const android = `intent://${base}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(ext)};end`;
  const ios = `x-safari-https://${base}`;
  return `<div class="inapp">
    <p><b>請改用手機瀏覽器開啟</b><br>在 ${IN_LINE ? 'LINE' : '這個 APP'} 裡面打開，沒有語音朗讀，鏡頭和定位也比較不穩。</p>
    ${IS_ANDROID ? `<a class="btn primary" href="${android}">用 Chrome 開啟</a>` : IS_IOS ? `<a class="btn primary" href="${ios}">用 Safari 開啟</a>` : `<a class="btn primary" href="${ext}">用瀏覽器開啟</a>`}
    <p class="note">${IS_IOS ? '如果沒有反應：按畫面右下角「⋯」或分享圖示 →「用 Safari 開啟」。' : '如果沒有反應：按右上角「⋮」→「用預設瀏覽器開啟」。'}</p>
  </div>`;
}

// 語音開關提示：手機規定第一次發聲必須由使用者點擊，所以在首頁放一個「開啟語音」小按鈕
function voicePill() {
  if (!canSpeak || IN_APP || !S.get().profile.voice || voiceHeard() || run.voiceDismissed) return '';
  if (run.voiceFail) return `<div class="voice-help" role="status"><b>🔇 還是沒有聽到聲音嗎？</b><ul>
    ${IS_IOS ? '<li>iPhone 側邊的<b>靜音開關</b>要撥到「有聲音」（不是橘色）；沒有開關的機型，請在控制中心關閉「靜音模式」</li><li>到「設定 → 輔助使用 → 語音內容 → 聲音 → 中文（臺灣）」確認已下載語音</li>' : ''}
    <li>按手機側邊的音量鍵，把<b>媒體音量</b>調大</li>
    ${IS_ANDROID ? '<li>到手機「設定 → 文字轉語音」，確認已安裝<b>中文（臺灣）</b>語音</li>' : ''}
    <li>確定是用 ${IS_IOS ? 'Safari' : 'Chrome'} 開啟，不是 LINE 裡面</li></ul>
    <div class="grid2"><button class="btn" data-act="enableVoice">再試一次</button><button class="btn ghost" data-act="dismissVoice">先不用聲音</button></div></div>`;
  return `<div class="voice-pill"><button data-act="enableVoice">🔊 點一下，開啟語音朗讀</button><button class="x" data-act="dismissVoice" aria-label="先不用語音">×</button></div>`;
}

export const APP_VERSION = 'v12.1（2026-11-11）';

// 每個畫面屬於哪個場景：決定背景氛圍與重點色
const SCENE_OF = {
  today: 'home', lake: 'lake', breathe: 'lake', mood: 'lake', fof: 'lake', chat: 'lake',
  forest: 'forest', activities: 'forest', player: 'forest', check: 'forest', checkSummary: 'forest', companion: 'forest', afterMood: 'forest', walk: 'forest', walking: 'forest', stopToday: 'forest',
  knowledge: 'knowledge', card: 'knowledge',
  oasis: 'oasis', garden: 'oasis', week: 'oasis', reward: 'oasis', postcard: 'oasis', settings: 'oasis',
};

// 花瓣飄落：完成、記錄時的小小慶祝（尊重「減少動態效果」設定）
function petals(n = 16) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const box = document.createElement('div');
  box.className = 'petals'; box.setAttribute('aria-hidden', 'true');
  const colors = ['#F4B6C9', '#F3C98B', '#FFFFFF', '#D69B54', '#BFE0C8'];
  box.innerHTML = Array.from({ length: n }, (_, i) => `<i style="left:${(i * 61) % 100}%;background:${colors[i % colors.length]};animation-delay:${(i % 6) * .12}s;animation-duration:${2.2 + (i % 4) * .3}s"></i>`).join('');
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3200);
}

// 心動夥伴：每一頁都在，依畫面說不同的話；點寵物進小屋；按住麥克風跟牠說話
const NO_PET = ['welcome', 'petPick', 'place', 'setupWith', 'screening', 'screenResult', 'help', 'stopToday', 'coach'];
function petName() { const p = S.get().profile; return p.petType ? (p.petName || PETS[p.petType].name) : '小夥伴'; }
function petCall() { const p = S.get().profile; return p.petCall || p.name || '你'; }
function petBar() { return ''; }
function petBarOld() {
  const p = S.get().profile;
  if (!p.petType || NO_PET.includes(currentScreen)) return '';
  run.petSeed = (run.petSeed || 0) + 1;
  let line = run.petSay || petLine(currentScreen, petCall(), run.petSeed);
  if (currentScreen === 'today' && run.weatherAdvice) line = run.weatherAdvice.text;
  run.petSay = null;
  return `<div class="pet-bar">
    <button class="pet-avatar" data-go="petHome" aria-label="去${esc(petName())}的小屋">${petSVG(p.petType, 64)}</button>
    <p class="pet-bubble" id="petBubble"><b>${esc(petName())}</b>　${esc(line)}</p>
    ${canListen ? `<button class="pet-mic" data-hold="talk" aria-label="按住跟${esc(petName())}說話">${icon('mic')}<span>按住說話</span></button>` : `<button class="pet-mic" data-go="chat" aria-label="跟${esc(petName())}聊聊">${icon('chat')}<span>聊聊</span></button>`}
  </div>`;
}

function page(title, body, { tab = null, back = null } = {}) {
  document.body.dataset.scene = SCENE_OF[currentScreen] || 'home';
  const banner = (['today', 'welcome'].includes(currentScreen) || !canSpeak ? inAppBanner() : '') + (['today', 'welcome'].includes(currentScreen) ? voicePill() : '');
  const homeLink = back && back !== 'today' && !NO_LINE.includes(currentScreen) && currentScreen !== 'walking'
    ? `<button class="btn ghost home-link" data-go="today">${icon('home')} 回首頁</button>` : '';
  main().innerHTML = header(title, { back }) + `<section class="body${tab ? '' : ' no-tab'}">${banner}${reminderPop()}${body}${homeLink}</section>` + (tab ? nav(tab) : '');
  if (!['player', 'walking'].includes(currentScreen) && !run.listening) { const st = $('#roamSay'); if (st && !run.sayingSticky) roamEl().classList.remove('talking'); }
  setTimeout(updateRoam, 0);
  setTimeout(animateDemos, 0);
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
  if (['today', 'lake', 'forest', 'knowledge', 'oasis', 'activities', 'walk', 'garden', 'week'].includes(name)) history.replaceState(null, '', '#' + name);
}

function cleanup() {
  stopSpeaking();
  if (run.holdTimer) { clearInterval(run.holdTimer); run.holdTimer = null; run.holding = false; }
  if (run.medTimer) { clearInterval(run.medTimer); run.medTimer = null; stopMusic(); }
  if (run.breathTimer) { clearTimeout(run.breathTimer); run.breathTimer = null; }
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
    <button class="tour-link" data-act="demo">瀏覽示範旅程</button>
    <p class="ver">版本 ${APP_VERSION}</p>
  `);
  speak('你好！我是心動小夥伴。我會陪你每天動一動，也會幫你照顧一座小花園。');
};

screens.petPick = () => {
  const p = S.get().profile; const sel = run.pickPet || p.petType;
  page('選一個夥伴', `
    <p class="lead">誰要陪你每天動一動呢？</p>
    <div class="pet-pick">${Object.entries(PETS).map(([k, v]) => `<button class="pet-card ${sel === k ? 'on' : ''}" data-pickpet="${k}">${petSVG(k, 84)}<b>${v.name}</b><span>${v.kind}</span><small>${v.trait}</small></button>`).join('')}</div>
    <label class="field">幫牠取個名字（可以用預設的）
      <input id="petNameIn" type="text" maxlength="8" placeholder="${sel ? esc(PETS[sel].name) : '例如：小黑、咪寶'}" value="${esc(p.petType === sel ? p.petName : '')}">
    </label>
    <label class="field">牠要怎麼叫你？
      <input id="petCall" type="text" maxlength="8" placeholder="例如：阿嬤、阿公、林阿姨" value="${esc(p.petCall || p.name)}">
    </label>
    <button class="btn primary big" data-act="petNext">${run.fromSettings ? '儲存' : '下一步'}</button>
  `, { back: run.fromSettings ? 'settings' : 'welcome' });
  speak('誰要陪你每天動一動呢？可以選小狗阿福、小貓咪咪，或是長壽龜慢慢。');
};

screens.place = () => {
  const cur = S.get().profile.county;
  page('你住在哪裡？', `
    <div class="q-card"><p class="q">你住在哪個縣市？</p>${sayBtn('你住在哪個縣市？')}</div>
    <p>知道你在哪裡，夥伴就能看天氣，下雨時提醒你在家動一動。不需要開定位。</p>
    <select id="county" class="big-select" aria-label="選擇縣市"><option value="">先不設定</option>${Object.keys(PLACES).map(c => `<option ${cur === c ? 'selected' : ''}>${c}</option>`).join('')}</select>
    <button class="btn primary big" data-act="placeNext">${run.fromSettings ? '儲存' : '下一步'}</button>
  `, { back: run.fromSettings ? 'settings' : 'petPick' });
  speak('你住在哪個縣市？知道你在哪裡，夥伴就能看天氣。');
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
    ${i > 0 ? '<button class="btn ghost" data-act="screenPrev">← 回上一題</button>' : ''}
  `, { back: i === 0 ? 'setupWith' : 'act:screenPrev' });
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
  `, { back: 'place' });
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

function greetWord() {
  const h = new Date().getHours();
  return h < 11 ? '早安' : h < 14 ? '午安' : h < 18 ? '午後好' : '晚安';
}

// 今日推薦任務：依今天的狀態挑一個最適合的小行動
function todayTask() {
  const s = S.get(), t = s.today;
  const doneHome = s.sessions.some(x => x.type === 'home' && S.dayKey(x.at) === t.date);
  const doneWalk = s.sessions.some(x => x.type === 'walk' && S.dayKey(x.at) === t.date);
  if (t.mood === 'tired' || t.mood === 'upset') return { title: '讓心慢下來', what: '2 分鐘呼吸練習', why: '累或心煩的時候，先照顧心情，身體也會跟著放鬆。', btn: '開始呼吸練習', attr: 'data-go="breathe"' };
  if (t.allowed === 'none') return { title: '今天好好休息', what: '讀一張健康小知識', why: '身體不舒服的日子，休息就是最好的照顧。', btn: '到知識花園看看', attr: 'data-go="knowledge"' };
  if (!doneHome) {
    const pick = C.ACTIVITIES.filter(x => x.level === 'seated')[new Date().getDate() % 5];
    return { title: '讓身體輕鬆一下', what: `${pick.minutes} 分鐘「${pick.name}」`, why: '透過溫和的身體活動，為自己創造一點舒適的時間。', btn: '開始今天的小任務', attr: t.allowed ? `data-activity="${pick.id}"` : 'data-act="startActivity"' };
  }
  if (!doneWalk && t.allowed === 'standard') return { title: '出門走一走', what: '散步 10–15 分鐘', why: '沿路會開花，說不定還會遇到葉靈。', btn: '準備出門', attr: 'data-go="walk"' };
  return { title: '今天做得很好', what: '到我的綠洲看看生命之樹', why: '你今天已經照顧了自己，花點時間欣賞一下成果吧。', btn: '看我的綠洲', attr: 'data-go="oasis"' };
}

function treeInfo() {
  const p = S.points();
  let i = 0; C.TREE_STAGES.forEach((st, k) => { if (p >= st.at) i = k; });
  const next = C.TREE_STAGES[i + 1];
  const pct = next ? Math.round((p - C.TREE_STAGES[i].at) / (next.at - C.TREE_STAGES[i].at) * 100) : 100;
  return { stage: i, name: C.TREE_STAGES[i].name, next, pct, points: p };
}

function lineLink(text, label, cls = 'btn line-btn') {
  return C.lineReady() ? `<a class="${cls}" href="${lineOaChatURL(C.LINE_OA_ID, text)}" target="_blank" rel="noopener">${label}</a>` : `<button class="${cls}" data-go="chat">${label}</button>`;
}

async function refreshWeather() {
  const county = S.get().profile.county; if (!county || run.weatherLoading) return;
  run.weatherLoading = true;
  const w = await getWeather(county); run.weatherLoading = false;
  run.weather = w; run.weatherAdvice = advise(w, petCall());
  if (currentScreen === 'today' && run.weatherAdvice && !run.greeted) greetOwner();
}

screens.today = () => {
  S.ensureToday();
  if (!run.weather) setTimeout(refreshWeather, 0);
  if (!S.get().profile.county) setTimeout(greetOwner, 600);
  else setTimeout(() => { if (!run.greeted) greetOwner(); }, 3000); // 天氣沒回來也照樣打招呼
  const s = S.get(), t = s.today, w = S.weekStats();
  const name = s.profile.name ? `${s.profile.name}，` : '';
  const title = `${greetWord()}，今天也為自己留一點時間。`;
  const sub = '從一個小小的行動開始，讓身心慢慢找回平衡。';
  const task = todayTask(), tree = treeInfo();
  const toast = run.homeToast; run.homeToast = null;
  const hero = `<section class="hero">
      <p class="eyebrow">${brandMark(22)} 心動力 AI · MoveMind</p>
      <h2 class="hero-title">${esc(name)}${title}</h2>
      <p class="hero-sub">${sub}</p>
      ${sayBtn(name + title + sub)}
    </section>`;
  if (s.profile.simple) {
    page('首頁', `
      ${s.demo ? `<p class="tour-flag"><span>示範旅程</span><button data-act="endDemo">結束示範</button></p>` : ''}${hero}
      <button class="btn huge" data-go="mood">說說今天的心情</button>
      <button class="btn huge primary" ${task.attr}>${task.btn}</button>
      ${lineLink(lineOpener(), '跟小夥伴聊聊（LINE）', 'btn huge line-btn')}
      <button class="text-link" data-go="settings">設定（可關閉簡易模式）</button>
    `, { tab: 'today' });
    return;
  }
  const heroScene = `<section class="hero-scene">
      ${livingGarden()}
      <div class="hero-text">
        <p class="eyebrow">${brandMark(22)} 心動力 AI · MoveMind</p>
        <h2 class="hero-title">${esc(name)}${title}</h2>
        <p class="hero-sub">${sub}</p>
        ${sayBtn(name + title + sub)}
      </div>
    </section>`;
  page('首頁', `
    ${s.demo ? `<p class="tour-flag"><span>示範旅程</span><button data-act="endDemo">結束示範</button></p>` : ''}
    ${heroScene}
    ${planCard()}
    <section class="task-card float">
      <p class="eyebrow">今日任務</p>
      <h3>${esc(task.title)}</h3>
      <p class="task-what">${esc(task.what)}</p>
      <p>${esc(task.why)}</p>
      <button class="btn primary big" ${task.attr}>${esc(task.btn)}</button>
    </section>
    ${rescreenDue() ? '<button class="btn soft" data-act="redoScreening">已經 3 個月了，請重新回答健康小問題</button>' : ''}
    ${fofDue() ? '<button class="btn soft" data-go="fof">每週小問題：走路時擔心跌倒嗎？</button>' : ''}
    <div class="home-grid">
    <section class="card">
      <h3 class="card-title">今天的心情</h3>
      <div class="mood-row-quick">${C.MOODS.map(m => `<button class="mood-chip ${t.mood === m.id ? 'on' : ''}" data-moodq="${m.id}" aria-pressed="${t.mood === m.id}"><span class="face">${m.face}</span>${m.label}</button>`).join('')}</div>
      ${toast ? `<div class="bubble bot">${esc(toast)}</div>` : '<p class="note">點一下就記錄，心靈湖畔會開一朵心情之花。</p>'}
      ${t.mood === 'upset' ? `<a class="btn soft" href="tel:${C.EMERGENCY.mental}">想找人說說話：撥打 1925 安心專線</a>` : ''}
    </section>
    <button class="oasis-card" data-go="oasis">
      <div class="oasis-pic">${treeOfLife(tree.stage, { size: 120 })}</div>
      <div><p class="eyebrow">我的綠洲</p><h3>生命之樹：${tree.name}</h3>
        <div class="bar" role="progressbar" aria-valuenow="${tree.pct}" aria-valuemin="0" aria-valuemax="100" aria-label="生命之樹成長進度"><i style="width:${tree.pct}%"></i></div>
        <p class="note">這週活動 ${w.total} 次${w.km ? `・散步 ${w.km.toFixed(1)} 公里` : ''}</p></div>
    </button>
    <div class="quick">
      <button class="quick-item lake" data-go="lake">${icon('lake')}<b>心靈湖畔</b><span>呼吸與放鬆</span></button>
      <button class="quick-item forest" data-go="forest">${icon('forest')}<b>活力森林</b><span>在家動一動</span></button>
      <button class="quick-item walk" data-go="walk">${icon('walk')}<b>出門散步</b><span>遇見葉靈</span></button>
      <button class="quick-item know" data-go="knowledge">${icon('book')}<b>知識花園</b><span>健康小知識</span></button>
    </div>
    <section class="ai-card">
      <div class="buddy">${buddy()}</div>
      <div><h3>心動小夥伴</h3><p>想聊聊天、說說心情，小夥伴都在。</p></div>
      ${lineLink(lineOpener(), '到 LINE 跟小夥伴聊')}
      <button class="btn ghost" data-go="chat">在 APP 裡聊</button>
    </section>
    </div>
    <button class="text-link" data-go="settings">${icon('gear')} 設定（字的大小、簡易模式、聯絡人）</button>
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
  S.setMood(id); addDiary('mood', { label: C.MOODS.find(m => m.id === id)?.label });
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
    ${i > 0 ? '<button class="btn ghost" data-act="checkPrev">← 回上一題</button>' : ''}
  `, { back: i > 0 ? 'act:checkPrev' : (run.afterCheck === 'walk' ? 'walk' : 'today') });
  speak(c.q);
};

// 確認回答：送出前可以逐題修改
screens.checkSummary = () => {
  const a = run.checkAns;
  const label = (c, v) => v === 'yes' ? c.yes : v === 'no' ? c.no : '不確定';
  const rows = C.DAILY_CHECK.filter(c => a[c.id]).map((c, i) => `<div class="sum-row"><div><p class="sum-q">${esc(c.q)}</p><p class="sum-a">你的回答：<b>${label(c, a[c.id])}</b></p></div><button class="btn small" data-editcheck="${C.DAILY_CHECK.indexOf(c)}">修改</button></div>`).join('');
  const stop = a.chest && a.chest !== 'no';
  const preview = stop ? '依照這個回答，今天會先休息，不做運動。' : (a.pain !== 'no' || a.ready !== 'yes') ? '依照這些回答，今天會先做坐著的溫和活動。' : '依照這些回答，今天可以做坐著或扶椅的活動，也可以散步。';
  page('確認你的回答', `
    <p class="progress">送出前，看看有沒有選錯</p>
    <div class="sum-list">${rows}</div>
    <div class="q-card ${stop ? 'warn' : ''}"><p class="q">${preview}</p>${sayBtn(preview)}</div>
    ${stop ? '<p class="note">如果真的有胸悶、胸痛或頭暈，請好好休息；嚴重時請撥打 119。只有按錯時才需要修改。</p>' : ''}
    <button class="btn primary big" data-act="confirmCheck">沒問題，送出</button>
  `, { back: 'act:checkPrevFromSummary' });
  speak('送出前，看看有沒有選錯。' + preview);
};

// 重新回答今天的確認：按錯、或已經換好鞋子時使用
function redoLink(from = '') {
  return `<button class="btn soft redo" data-act="redoCheck" data-from="${from}">剛剛選錯，或已經準備好了？重新回答今天的問題</button>`;
}

function finishCheck() {
  const a = run.checkAns, s = S.get();
  let allowed = 'standard';
  if (a.chest !== 'no') allowed = 'none';            // 胸悶胸痛頭暈：有或不確定 → 今天停止
  else if (a.pain !== 'no' || a.ready !== 'yes' || s.today.mood === 'tired' || effectiveLevel() === 'seated') allowed = 'seated';
  s.today.check = { ...a }; s.today.allowed = allowed; S.save();
  if (allowed === 'none') return go('stopToday');
  const next = run.afterCheck || 'activities'; run.afterCheck = null;
  if (run.pendingActivity) {
    const pa = C.ACTIVITIES.find(x => x.id === run.pendingActivity); run.pendingActivity = null;
    if (pa && (allowed === 'standard' || pa.level === 'seated')) return go('player', pa.id);
  }
  go(next);
}

screens.stopToday = () => {
  const msg = '今天先不要運動，坐下來好好休息。如果胸痛、呼吸困難、冒冷汗或很暈，請馬上打 119。';
  page('今天先休息', `
    <div class="q-card warn"><p class="q">${msg}</p>${sayBtn(msg)}</div>
    <a class="btn danger" href="tel:${C.EMERGENCY.medical}">撥打 119</a>
    ${contactButtons()}
    <button class="btn ghost" data-go="oasis">看看我的綠洲就好</button>
    ${redoLink()}
  `, { back: 'today' });
  speak(msg);
};

// ---------- 活力森林（活動列表） ----------
screens.forest = () => screens.activities();
screens.activities = () => {
  S.ensureToday();
  const t = S.get().today;
  const banner = `<div class="scene-hero">${forestScene()}<div class="scene-cap"><b>活力森林</b><span>溫和、有支撐的活動，照自己的步調來</span></div></div>`;
  if (!t.allowed) {
    page('活力森林', `${banner}
      <section class="card"><h3 class="card-title">開始前，先確認今天的身體</h3><p>回答 3 個簡單問題，我們會挑出今天適合你的活動。</p>
      <button class="btn primary big" data-act="startCheck">開始確認</button></section>
      <button class="text-link" data-card="warning-signs">${icon('book')} 活動時，哪些訊號要停下來？</button>
    `, { tab: 'activities' });
    return;
  }
  if (t.allowed === 'none') return go('stopToday');
  const seatedOnly = t.allowed === 'seated';
  const assisted = effectiveLevel() === 'assisted';
  const list = C.ACTIVITIES.map(a => {
    const ok = !seatedOnly || a.level === 'seated';
    const tag = a.level === 'seated' ? '坐姿版本' : '扶椅版本';
    return `<article class="ex-card ${ok ? '' : 'off'}">
      <div class="ex-pic">${demoSVG(a.id)}</div>
      <div class="ex-body">
        <h3>${a.name}</h3>
        <p class="ex-tags"><span>${tag}</span><span>低強度</span><span>約 ${a.minutes} 分鐘</span>${assisted && a.level !== 'seated' ? '<span class="warn">需有人陪同</span>' : ''}</p>
        <p>${ok ? a.goal : '今天先做坐著的活動'}</p>
        ${ok ? `<p class="ex-caution">⚠ ${esc(a.caution)}</p><button class="btn primary" data-activity="${a.id}">開始練習</button>` : ''}
      </div>
    </article>`;
  }).join('');
  const lead = seatedOnly
    ? (effectiveLevel() === 'seated' ? '依照健康小問題的結果，目前先做坐著的溫和動作。' : '依照今天的回答，先做坐著的溫和動作。')
    : assisted ? '坐著的活動可以自己做；扶著椅子的活動請在有人陪同時進行。' : '今天可以做坐著或扶著椅子的活動。';
  page('活力森林', `${banner}
    ${planCard()}
    <p class="lead-note">${lead}</p>
    ${seatedOnly && effectiveLevel() !== 'seated' ? redoLink() : ''}
    ${seatedOnly && t.mood === 'tired' ? '<button class="tour-link" data-act="changeMood">心情好一點了嗎？更改今天的心情</button>' : ''}
    <div class="ex-list">${list}</div>
    <section class="card walk-cta"><h3 class="card-title">${icon('walk')} 出門散步</h3><p>沿路開花、遇見葉靈，也幫花園澆水。</p><button class="btn big" data-go="walk">準備出門</button></section>
    <button class="text-link" data-card="warning-signs">${icon('book')} 活動時，哪些訊號要停下來？</button>
  `, { tab: 'activities' });
  // 列表中的示範動畫先暫停，避免太多東西同時在動；進入活動頁才播放
  main().querySelectorAll('.ex-pic svg').forEach(svg => svg.classList.add('paused'));
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
    <div class="demo-card">${demoSVG(a.id)}<p class="note">示範動畫（原創繪製），動作細節以下方口令為準</p></div>
    <div class="cue-card">
      <ol class="cues">${a.cues.map(c => `<li>${esc(c)}</li>`).join('')}</ol>
      ${sayBtn(a.cues.join(''))}
    </div>
    <p class="caution">${esc(a.caution)}</p>
    <p class="easier"><b>覺得太難：</b>${esc(a.easier)}</p>
    ${planBadge(a.id)}
    <div class="counter" aria-live="polite"><span id="reps">0</span><small>/ ${a.reps} ${a.hold ? '次' : '下'}</small><span class="reps-note">${esc(a.repsNote || '')}</span></div>
    <div id="poseBox" class="pose-box" hidden>
      <video id="cam" playsinline muted></video><canvas id="overlay"></canvas>
      <p id="poseStatus" class="pose-status"></p>
    </div>
    ${a.hold ? `<button class="btn huge primary" data-act="holdStart" id="holdBtn">開始保持 ${a.hold} 秒</button>` : '<button class="btn huge primary" data-act="rep">完成一下</button>'}
    ${a.pose === false ? '' : '<button class="btn ghost" data-act="pose" id="poseBtn">開鏡頭幫我數</button>'}
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
  else if (run.activity.hold) speak(`第 ${run.reps} 次完成，休息一下，準備好再開始。`);
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
    await pose.startPose($('#cam'), $('#overlay'), run.activity.id, {
      onRep: addRep,
      onStatus: m => { status.textContent = m; },
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
  if (run.holdTimer) { clearInterval(run.holdTimer); run.holdTimer = null; run.holding = false; }
  if (run.reps === 0) { go(S.get().plan ? 'today' : 'activities'); return; }
  const pl = S.get().plan;
  if (pl && pl.items.includes(a.id)) { pl.log = [...(pl.log || []), { at: new Date().toISOString(), id: a.id }].slice(-200); S.save(); }
  const before = S.get().garden.plots.map(p => p.stage);
  S.addSession({ type: 'home', activityId: a.id, name: a.name, reps: run.reps, minutes: a.minutes });
  const homeCount = S.get().sessions.filter(x => x.type === 'home').length;
  if (homeCount % C.HOME_ACTIVITIES_PER_SPIRIT === 0) (run.pendingSpirits = run.pendingSpirits || []).push('home');
  rewardHome();
  const after = S.get().garden.plots.map(p => p.stage);
  const grown = after.findIndex((s, i) => s !== before[i]);
  const questMsgMove = questComplete('move'); addDiary('move', { name: a.name });
  run.lastReward = { title: `${a.name} ${run.reps} 下，完成！`, detail: (questMsgMove ? questMsgMove + ' ' : '') + grown >= 0 ? '得到 1 顆種子，也幫花園澆了水。' : '得到 1 顆種子！花都開好了，水先存起來，種新植物時會用上。', grown };
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
  if ((run.pendingSpirits || []).length && !run.greeting) nextPendingSpirit();
  page('做得很好', `
    <div id="greetArea">${greetPanel()}</div>
    <div class="reward">
      ${mr ? `<div class="bubble bot" style="text-align:left">${esc(mr)}</div>` : ''}
      <p class="lead">${esc(r.title)}</p>
      <div class="garden-view">${gardenSVG({ highlight: r.grown })}</div>
      <p>${esc(r.detail)} ${esc(grownText)}</p>
    </div>
    ${r.walk ? '<button class="btn line-btn" data-act="postcard">做一張散步明信片分享</button>' : ''}
    ${canPlant() ? '<button class="btn primary" data-go="garden">去種新的植物</button>' : ''}
    <button class="btn" data-go="today">回首頁</button>
  `);
  speak(`${mr || ''}${r.title}${r.detail}${grownText}`);
  petals();
};

// ---------- 心動綠洲 ----------
// 花園裡的葉靈：會走動，點一下會說話（包含懷舊小問題）
function livingGarden(opts = {}) {
  const g = S.get().garden;
  const ids = [...new Set((g.spirits || []).map(s => s.id))].slice(0, 6);
  const spots = [[16, 76], [84, 72], [36, 90], [64, 92], [50, 70], [92, 90]];
  const spirits = ids.map((id, i) => `<button class="live-spirit" style="left:${spots[i][0]}%;top:${spots[i][1]}%;animation-delay:${i * .7}s" data-talk="${id}" aria-label="跟${esc(C.SPIRITS.find(s => s.id === id).name)}說話">${spiritSVG(id, 46)}</button>`).join('');
  return `<div class="garden-view live">${gardenSVG(opts)}${spirits}</div>${ids.length ? '<p id="spiritTalk" class="spirit-talk">點一下花園裡的葉靈，聽聽它想說什麼</p>' : ''}`;
}

screens.garden = () => {
  const g = S.get().garden;
  const bloom = g.plots.filter(p => p.stage === 3).length;
  const pct = Math.min(100, Math.round(g.communityKm / C.COMMUNITY_GOAL_KM * 100));
  const picker = canPlant() ? `<h2>選一種植物種下去</h2><div class="seed-row">${g.unlocked.map(t => `
      <button class="seed" data-plant="${t}"><svg viewBox="0 0 60 70" aria-hidden="true">${plantSVG(t, 3, 30, 62, 0.95)}</svg>${C.PLANTS[t].name}</button>`).join('')}</div>` : '';
  page('心動綠洲', `
    ${livingGarden()}
    <div class="stats3">
      <div><b>${g.seeds}</b><span>顆種子</span></div>
      <div><b>${g.plots.length}</b><span>株植物</span></div>
      <div><b>${bloom}</b><span>朵花開了</span></div>
    </div>
    ${picker}
    ${g.plots.length >= C.GARDEN_SLOTS ? '<p class="note">花園種滿了！之後的活動會繼續幫植物澆水。</p>' : ''}
    <div class="panel">
      <h2>葉靈圖鑑（${new Set((g.spirits || []).map(s => s.id)).size} / ${C.SPIRITS.length}）</h2>
      <p class="note">出門散步、到公園或據點打卡，就會遇到以臺灣植物為靈感的葉靈。</p>
      <div class="dex">${C.SPIRITS.map(sp => {
        const got = (g.spirits || []).filter(s => s.id === sp.id);
        return `<div class="dex-item ${got.length ? '' : 'unknown'}">${spiritSVG(sp.id, 72, { silhouette: !got.length })}<b>${got.length ? esc(sp.name) : '？？？'}</b><span>${got.length ? `見過 ${got.length} 次` : sp.from === 'checkin' ? '打卡時出現' : '散步時出現'}</span></div>`;
      }).join('')}</div>
    </div>
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
      ${redoLink('walk')}
      <button class="tour-link" data-act="walkDemo">示範散步（室內示範用，不需定位）</button>
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
    ${run.weatherAdvice && run.weatherAdvice.outdoor !== 'good' ? `<div class="q-card ${run.weatherAdvice.outdoor === 'indoor' ? 'warn' : ''}"><p class="q">${run.weatherAdvice.icon} ${esc(run.weatherAdvice.text)}</p>${run.weatherAdvice.outdoor === 'indoor' ? '<button class="btn primary" data-go="activities">改在家動一動</button>' : ''}</div>` : ''}
    <div class="panel">
      <h2>想走去哪裡？（可以不選）</h2>
      <p class="note">找找附近的公園，選一個當目的地。到了會自動打卡，還會遇到特別的葉靈。</p>
      <div id="parkList">${parkListHTML()}</div>
    </div>
    <label class="switch"><input type="checkbox" data-act="toggleRoute" ${keep ? 'checked' : ''}><span>保存完整路線（不勾選時只記錄距離和時間）</span></label>
    <button class="btn huge primary" data-act="walkReal">${run.walkDest ? `開始散步・走去${esc(run.walkDest.name)}` : '開始散步'}</button>
    <p class="note">第一次使用時，手機會詢問能不能使用「位置」，請按「允許」。</p>
    <button class="tour-link" data-act="walkDemo">示範散步（室內示範用，不需定位）</button>
  `, { tab: 'walk' });
};

function parkListHTML() {
  const st = run.parkState;
  if (!st) return '<button class="btn" data-act="findParks">📍 找附近的公園</button>';
  if (st === 'loading') return '<p class="note">正在找附近的公園…</p>';
  if (st === 'nogps') return '<p class="note">取得不到位置。請在瀏覽器設定中允許「位置」，或到戶外再試一次。</p><button class="btn ghost" data-act="findParks">再試一次</button>';
  if (!st.length) return '<p class="note">附近 1.2 公里內找不到公園，或網路不穩。可以直接開始散步，走到喜歡的地方再按「在這裡打卡」。</p>';
  return st.map((p, i) => `<button class="park ${run.walkDest === p ? 'on' : ''}" data-dest="${i}"><b>${esc(p.name)}</b><span>約 ${p.m} 公尺・走路約 ${walkMinutes(p.m)} 分鐘</span></button>`).join('')
    + (run.walkDest ? '<button class="tour-link" data-dest="none">不設目的地</button>' : '');
}

async function loadParks() {
  run.parkState = 'loading'; $('#parkList').innerHTML = parkListHTML();
  const pos = await getPosition().catch(() => null);
  run.parkState = pos ? await findParks(pos) : 'nogps';
  if ($('#parkList')) $('#parkList').innerHTML = parkListHTML();
}

// 散步中的方向提示：距離、方位；到達 40 公尺內自動打卡
function updateGuide(last) {
  const d = run.walkInfo?.dest, el = $('#guide');
  if (!d || !el || !last) return;
  const m = Math.round(meters(last, [d.lat, d.lng]));
  if (!run.walkInfo.arrived && m <= 40) {
    run.walkInfo.arrived = true;
    const r = checkin({ name: d.name.slice(0, 12), lat: d.lat, lng: d.lng });
    el.innerHTML = `<b>🎉 到了「${esc(d.name)}」！</b><span>已經幫你打卡${r.unlockedKapok ? '，解鎖了木棉花' : ''}。休息一下再回家吧。</span>`;
    speak(`到了${d.name}！已經幫你打卡。先找地方坐下休息一下。`);
    queueEncounter('checkin'); return;
  }
  if (run.walkInfo.arrived) return;
  el.innerHTML = `<b>往「${esc(d.name)}」</b><span>還有約 ${m} 公尺・方向：${bearingText(last, [d.lat, d.lng])}方</span>`;
}

screens.walking = () => {
  page('散步中', `
    <div id="map" class="map"></div>
    <div class="walk-stats" aria-live="polite">
      <div><b id="wkm">0.00</b><span>公里</span></div>
      <div><b id="wtime">0:00</b><span>時間</span></div>
      <div><b id="wwater">0</b><span>次澆水</span></div>
    </div>
    ${run.walkInfo?.dest ? `<div id="guide" class="guide"><b>往「${esc(run.walkInfo.dest.name)}」</b><span>正在取得位置…</span></div>
      ${run.walkInfo.demo ? '' : `<a class="tour-link" href="${gmapsWalkURL(run.walkInfo.dest)}" target="_blank" rel="noopener">需要路線導航？用 Google 地圖開啟（切換過去時，這裡的距離會暫停記錄）</a>`}` : ''}
    <p id="walkMsg" class="note"></p>
    <div id="encounter"></div>
    <div class="grid2">
      <button class="btn" data-act="shareLive">安心分享位置</button>
      <button class="btn" data-act="checkin">在這裡打卡</button>
    </div>
    <button class="btn huge primary" data-act="walkStop">結束散步</button>
  `, { tab: 'walk' });
  if (run.walk) { run.walk.attach($('#map')); return; }
  const ctl = createWalk($('#map'), {
    onUpdate: ({ km, seconds, last }) => {
      updateGuide(last);
      const wm = $('#walkMsg'); if (last && wm && /GPS|定位/.test(wm.textContent)) wm.textContent = ''; // 收到位置後清除先前的提示
      const k = $('#wkm'); if (!k) return;
      k.textContent = km.toFixed(2);
      $('#wtime').textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
      $('#wwater').textContent = Math.floor(km / C.KM_PER_WATER);
      const due = Math.floor(km / C.KM_PER_SPIRIT);
      if (due > (run.walkInfo.met || 0)) { run.walkInfo.met = due; queueEncounter('walk'); }
      const half = Math.floor(km / 0.5);
      if (half > (run.walkInfo.spoken || 0)) { run.walkInfo.spoken = half; speak(`已經走了${(half * 0.5).toFixed(1)}公里，很棒！累了就找地方坐下休息。`); }
    },
    onError: m => { const el = $('#walkMsg'); if (el) el.textContent = m; },
  });
  run.walk = ctl;
  if (run.walkInfo.dest) ctl.setDest(run.walkInfo.dest);
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
  const waiting = (run.pendingSpirits || []).length;
  run.walkDest = null; run.parkState = null;
  run.lastWalk = { km: out.km, minutes: out.minutes, flowers: out.flowers, friends: [], at: new Date().toISOString() };
  addDiary('walk', { km: out.km.toFixed(1) });
  const questMsg = questComplete('walk');
  run.lastReward = { walk: true, title: `散步 ${out.km.toFixed(2)} 公里，完成！`, detail: `${questMsg ? questMsg + ' ' : ''}路上開了 ${out.flowers} 朵花${waiting ? `，有 ${waiting} 隻葉靈跟著你回來` : ''}。${grown >= 0 ? `也幫花園澆了 ${r.water} 次水。` : `存了 ${r.water} 次水，種新植物時會用上。`}`, grown };
  go('afterMood');
}

// ---------- 遇到葉靈 ----------
// 安全設計：散步中「不需要看手機」。遇到葉靈時只用語音和震動通知，
// 葉靈先排隊等待，等散步結束、坐下休息時，再一一打招呼（只要輕點一下）。
function queueEncounter(from) {
  (run.pendingSpirits = run.pendingSpirits || []).push(from);
  const n = run.pendingSpirits.length;
  try { navigator.vibrate?.([120, 80, 120]); } catch (e) { /* 不支援震動 */ }
  speak(from === 'checkin' ? '打卡的地方有一隻特別的葉靈在等你，休息的時候再跟它打招呼喔。' : '有一隻葉靈在等你，休息的時候再跟它打招呼喔。');
  const el = $('#encounter');
  if (el) el.innerHTML = `<div class="waiting">${spiritSVG(C.SPIRITS[0].id, 40, { silhouette: true })}<span>有 <b>${n}</b> 隻葉靈在等你，散步結束後再打招呼</span></div>`;
}

function nextPendingSpirit() {
  const from = (run.pendingSpirits || [])[0];
  if (!from) { run.greeting = null; return; }
  const { spirit, isNew } = meetSpirit(from);
  run.greeting = { spirit, isNew, from };
}

function greetPanel() {
  const e = run.greeting; if (!e) return '';
  const left = (run.pendingSpirits || []).length;
  return `<div class="encounter">
    <p class="lead">${e.isNew ? '有新的葉靈來找你！' : '老朋友又來看你了！'}</p>
    <button class="spirit-btn" data-act="greet" aria-label="跟${esc(e.spirit.name)}打招呼">${spiritSVG(e.spirit.id, 140)}</button>
    <p><b>${esc(e.spirit.name)}</b>：${esc(e.spirit.line)}</p>
    <button class="btn primary" data-act="greet">跟${esc(e.spirit.name)}打招呼</button>
    ${left > 1 ? `<p class="note">還有 ${left - 1} 隻在排隊</p>` : ''}
  </div>`;
}

function greet() {
  const e = run.greeting; if (!e) return;
  befriend(e.spirit.id, { walk: '散步', checkin: '打卡', home: '在家' }[e.from] || '散步');
  if (run.lastWalk && e.from !== 'home') run.lastWalk.friends = [...run.lastWalk.friends, e.spirit.id];
  run.pendingSpirits.shift();
  const msg = `${e.spirit.name}${e.isNew ? '加入你的圖鑑，搬進花園住了！' : '很開心又遇到你！'}${e.spirit.talk[2]}`;
  speak(msg);
  nextPendingSpirit();
  const box = $('#greetArea');
  if (box) box.innerHTML = run.greeting ? greetPanel() : `<div class="bubble bot">${esc(msg)}</div>`;
}

async function doCheckin() {
  const pos = run.walk?.current() || await getPosition().catch(() => null);
  const name = prompt('這裡是哪裡？（例如：社區公園、關懷據點）', '社區公園');
  if (!name) return;
  const r = checkin({ name: name.slice(0, 12), lat: pos?.[0] ?? null, lng: pos?.[1] ?? null });
  const msg = r.unlockedKapok ? `打卡成功！解鎖了高雄市花「木棉花」，還得到 1 顆種子。` : `在「${name}」打卡成功，得到 1 顆種子！`;
  const el = $('#walkMsg'); if (el) el.textContent = msg;
  speak(msg);
  queueEncounter('checkin');
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
  const ai = C.aiReady();
  const lineCard = C.lineReady() ? `<div class="line-card">
      <p><b>${ai ? '也可以在 LINE 聊' : '到 LINE 跟小夥伴聊'}</b><br>${ai ? '在官方帳號聊天，是同一個小夥伴。' : '在官方帳號聊天，小夥伴會用 AI 回答你。'}</p>
      <a class="btn line-btn" href="${lineOaChatURL(C.LINE_OA_ID, lineOpener())}" target="_blank" rel="noopener">打開 LINE 聊天</a>
    </div>` : '';
  page(`跟${petName()}聊聊`, `
    ${ai ? '' : lineCard}
    <p class="demo-flag">${ai ? '小夥伴由 AI 回答，和 LINE 官方帳號是同一個小夥伴' : '展示模式：回應為預先設計'}</p>
    <div class="chat" id="chatLog">
      <div class="bubble bot">${esc(greeting())} 想聊什麼都可以，我在這裡。</div>
      ${msgs.map(m => `<div class="bubble ${m.who}">${esc(m.text)}</div>`).join('')}
    </div>
    <div class="chips">${C.CHAT_CHIPS.map(c => `<button class="chip" data-chip="${esc(c)}">${esc(c)}</button>`).join('')}</div>
    <form class="chat-input" data-form="chat">
      <input id="chatText" type="text" maxlength="120" placeholder="想說什麼呢？" aria-label="輸入訊息">
      ${canListen ? `<button type="button" class="icon-btn" data-act="talkPet" aria-label="用說的">${icon('mic')}</button>` : ''}
      <button type="submit" class="btn send">送出</button>
    </form>
    ${ai ? lineCard : ''}
    ${ai ? '<p class="note">小夥伴是 AI，不是醫師或護理師，沒辦法診斷或開藥。請不要輸入身分證字號、病歷等個人資料。</p>' : ''}
  `, { back: 'today' });
  const log = $('#chatLog'); log.scrollTop = log.scrollHeight;
};

// 帶到 LINE 的第一句話：有今天的心情就一起帶過去，讓小夥伴接得上話
function lineOpener() {
  const m = S.get().today.mood && C.MOODS.find(x => x.id === S.get().today.mood);
  return m ? `我想聊聊，今天心情${m.label}` : '我想聊聊';
}

function chatExtras(flag) {
  const log = $('#chatLog'); if (!log) return;
  if (flag === 'crisis') log.insertAdjacentHTML('beforeend', `<a class="btn danger" href="tel:${C.EMERGENCY.mental}">撥打 1925 安心專線</a><a class="btn" href="tel:${C.EMERGENCY.medical}">撥打 119</a>`);
  if (flag === 'body') log.insertAdjacentHTML('beforeend', `<a class="btn danger" href="tel:${C.EMERGENCY.medical}">撥打 119</a>`);
  if (flag === 'go') log.insertAdjacentHTML('beforeend', `<button class="btn primary" data-act="startActivity">開始活動前確認</button>`);
  if (flag === 'low') log.insertAdjacentHTML('beforeend', `<a class="btn soft" href="tel:${C.EMERGENCY.mental}">想找人說說話：撥打 1925 安心專線</a><button class="btn ghost" data-go="breathe">先一起慢慢呼吸</button>`);
  if (flag === 'walk') log.insertAdjacentHTML('beforeend', `<button class="btn primary" data-act="walkFromChat">出發散步（帶${esc(petName())}去溜溜）</button>`);
  if (flag === 'indoor') log.insertAdjacentHTML('beforeend', `<button class="btn primary" data-go="activities">在家一起動一動</button>`);
  log.scrollTop = log.scrollHeight;
}

function pushChat(who, text) {
  const s = S.get();
  s.chat.push({ who, text });
  s.chat = s.chat.slice(-40);
  S.save();
}

const LOW_MOOD = ['心情不好', '心情很差', '難過', '想哭', '很煩', '好煩', '憂鬱', '鬱卒', '孤單', '寂寞', '睡不著', '不開心', '沮喪', '沒力氣', '很累很累', '提不起勁'];
const WALK_WANT = ['散步', '走走', '出去走', '出門走', '去公園', '溜溜', '溜狗', '出去玩'];
// 先處理有特定意圖的話：回傳 { reply, flag } 或 null
async function intentReply(text) {
  const s = S.get();
  if (LOW_MOOD.some(k => text.includes(k))) {
    return { reply: `${petCall()}，聽起來你現在心裡不太好受，謝謝你願意跟我說。我一直在這裡陪你。如果想找人好好聊聊，1925 安心專線 24 小時都有人陪你；也可以打給家人或朋友。`, flag: 'low' };
  }
  if (WALK_WANT.some(k => text.includes(k))) {
    if (s.today.allowed === 'none') return { reply: '今天你回答需要先休息，我們改天再出去走走，今天先在家陪我聊天好嗎？', flag: null };
    if (!run.weather && s.profile.county) { run.weather = await getWeather(s.profile.county); run.weatherAdvice = advise(run.weather, petCall()); }
    const w = run.weatherAdvice;
    if (w && w.outdoor === 'indoor') return { reply: `${w.icon} ${w.text}等雨停了我們再一起出去！`, flag: 'indoor' };
    if (s.today.allowed === 'seated') return { reply: '今天先做坐著的運動比較安全，我們在家動一動，明天再去散步好嗎？', flag: 'indoor' };
    const wx = run.weather ? `${w.icon} ${s.profile.county}現在 ${run.weather.temp} 度${w.outdoor === 'caution' ? '，記得帶水、慢慢走' : '，天氣不錯'}！` : '好耶！';
    return { reply: `${wx}我們出發吧！沿路會開花，說不定還會遇到葉靈喔！`, flag: 'walk' };
  }
  return null;
}

let chatBusy = false;
async function sendChat(text) {
  text = text.trim(); if (!text || chatBusy) return;
  const s = S.get();
  const crisisFirst = C.CHAT_RULES.find(r => (r.crisis || r.body) && r.keys.some(k => text.includes(k)));
  if (!crisisFirst) {
    const it = await intentReply(text);
    if (it) {
      pushChat('me', text); pushChat('bot', it.reply);
      screens.chat(); (it.flag === 'low' ? speak(it.reply) : petVoice(it.reply)); chatExtras(it.flag); return;
    }
  }
  const rule = C.CHAT_RULES.find(r => r.keys.some(k => text.includes(k)));
  const flagOf = r => (r?.crisis ? 'crisis' : r?.body ? 'body' : r?.go ? 'go' : null);

  // 1. 安全相關（自傷、身體緊急、怕跌倒）：一律在手機上直接用固定回覆，不送給 AI
  const safety = rule && (rule.crisis || rule.body || rule.keys.includes('怕跌倒'));
  // 2. 沒有設定 AI 大腦：使用預先設計的回應
  if (safety || !C.aiReady()) {
    let reply = rule ? rule.reply : C.CHAT_DEFAULT;
    const mine = s.chat.filter(m => m.who === 'me').length + 1;
    if (!safety && mine % 4 === 0) reply += '\n' + C.BRIDGE_LINES[(mine / 4) % C.BRIDGE_LINES.length];
    if (!safety && s.profile.petType) reply = `${PETS[s.profile.petType].sound} ${reply}`;
    pushChat('me', text); pushChat('bot', reply);
    screens.chat(); (safety ? speak(reply) : petVoice(reply.replace(/^(汪！|喵～|（慢慢點頭）)\s*/, ''))); chatExtras(flagOf(rule));
    return;
  }

  // 3. 其他：交給 n8n 的 AI 大腦（和 LINE 官方帳號同一套規則）
  pushChat('me', text);
  screens.chat();
  const log = $('#chatLog');
  log.insertAdjacentHTML('beforeend', '<div class="bubble bot typing" id="typing">小夥伴正在想…</div>');
  log.scrollTop = log.scrollHeight;
  chatBusy = true;
  let reply = '', flag = null;
  try {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), 15000);
    const mood = s.today.mood && C.MOODS.find(m => m.id === s.today.mood);
    const res = await fetch(C.AI_CHAT_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, signal: ctl.signal,
      body: JSON.stringify({ sessionId: S.chatSession(), text: text.slice(0, 300), mood: mood ? mood.label : '', allowed: s.today.allowed || '', pet: s.profile.petType || '', petName: petName(), call: petCall() }),
    });
    clearTimeout(t);
    const data = await res.json();
    reply = String(data.reply || '').trim();
    flag = data.flag || null;
  } catch (e) { reply = ''; }
  chatBusy = false;
  if (!reply) { // 連線失敗：退回預先設計的回應，展示不會中斷
    reply = (rule ? rule.reply : C.CHAT_DEFAULT);
    flag = flagOf(rule);
    // 預設回應也用寵物的口吻（危機與身體緊急的回覆保持原樣、不加語氣詞）
    if (s.profile.petType && !rule?.crisis && !rule?.body) reply = `${PETS[s.profile.petType].sound} ${reply}`;
  }
  pushChat('bot', reply);
  if (currentScreen !== 'chat') return;
  screens.chat(); (flag === 'crisis' || flag === 'body' ? speak(reply) : petVoice(reply.replace(/^(汪！|喵～|（慢慢點頭）)\s*/, ''))); chatExtras(flag);
}

// 寵物日記：記錄和主人一起做的事
function addDiary(kind, d = {}) {
  const s = S.get(); if (!s.profile.petType) return;
  s.petDiary = [{ at: new Date().toISOString(), text: diaryText(kind, d, petCall()) }, ...(s.petDiary || [])].slice(0, 60); S.save();
}

// ---------- 心動夥伴的小屋 ----------
const SPOT = { window: [64, 30], center: [46, 10], bed: [76, 12], door: [22, 12] };
screens.petHome = () => {
  const s = S.get(), p = s.profile; if (!p.petType) { run.fromSettings = false; return go('petPick'); }
  const name = petName(), st = petStats(s), life = lifeState(), gr = growth(s.pet);
  const rain = !!(run.weather && run.weather.rain);
  const bath = !!run.bath, items = s.pet.items || [];
  const [x, y] = bath ? [46, 10] : SPOT[life.spot];
  const size = Math.round(130 * gr.scale), sleeping = life.sleep && !bath && !run.wokeUp;
  const msg = run.petMsg; run.petMsg = null;
  const next = TRICKS.find(t => t.at > st.treats);
  page(`${name}的小屋`, `
    <section class="room ${bath ? 'bathing' : ''}" id="room">
      ${roomSVG(life, items, rain)}
      <div class="room-pet ${sleeping ? 'sleeping' : ''}" id="roomPet" style="left:${x}%;bottom:${y}%;width:${size}px" role="button" aria-label="摸摸${esc(name)}" tabindex="0">
        ${bath ? '<div class="tub"></div>' : ''}${petSVG(p.petType, size, { mood: sleeping ? 'calm' : 'happy' })}${sleeping ? '<span class="zzz">Z<small>z</small><small>z</small></span>' : ''}
      </div>
      <div class="room-cap"><b>${esc(name)}</b>（${gr.label}）${bath ? '正在洗澎澎！用手指在牠身上搓一搓' : sleeping ? life.text : `${life.text}${rain ? '，外面在下雨' : ''}`}</div>
      <div id="roomFx" class="room-fx" aria-hidden="true"></div>
    </section>
    ${msg ? `<div class="bubble bot">${esc(msg)}</div>` : ''}
    <p class="note center">${bath ? '搓出好多泡泡，就洗好了！' : '用手指在牠身上來回滑動，就是在摸摸牠喔！'}</p>
    <div class="stats3"><div><b>${st.points}</b><span>心動點數</span></div><div><b>${s.pet.love || 0}</b><span>親密度 ❤</span></div><div><b>${gr.next ? gr.next : '✓'}</b><span>${gr.next ? '再累積就長大' : '已經長大'}</span></div></div>
    <div class="care-grid">
      <button class="care" data-act="feedPet"><span class="ci">🍪</span><b>吃點心</b><small>1 點</small></button>
      <button class="care" data-act="${bath ? 'bathDone' : 'bathMode'}"><span class="ci">🫧</span><b>${bath ? '洗好了' : '洗澎澎'}</b><small>搓泡泡</small></button>
      <button class="care" data-go="forest"><span class="ci">🤸</span><b>一起運動</b><small>賺點數</small></button>
      <button class="care" data-go="walk"><span class="ci">🚶</span><b>出門溜溜</b><small>賺點數</small></button>
      <button class="care" data-go="meditate"><span class="ci">🍃</span><b>一起靜坐</b><small>3 分鐘</small></button>
      <button class="care" data-go="breathe"><span class="ci">💨</span><b>深呼吸</b><small>1 分鐘</small></button>
    </div>
    <section class="card">
      <h3 class="card-title">📖 ${esc(name)}的日記</h3>
      ${(s.petDiary || []).slice(0, 5).map(d => `<p class="diary"><span>${new Date(d.at).toLocaleDateString('zh-TW', { month: 'numeric', day: 'numeric' })}</span>${esc(d.text)}</p>`).join('') || '<p class="note">和牠一起運動、散步、聊天，牠就會寫日記喔！</p>'}
    </section>
    <section class="card">
      <h3 class="card-title">🛋️ 布置小屋</h3>
      <div class="shop">${SHOP.map(it => items.includes(it.id) ? `<div class="shop-item owned"><b>${it.name}</b><span>✓ 已擺放</span></div>` : `<button class="shop-item" data-buy="${it.id}"><b>${it.name}</b><span>${it.cost} 點</span></button>`).join('')}</div>
      <p class="note">做活動、散步、呼吸、靜坐、記錄心情、完成每日任務，都會得到心動點數。</p>
    </section>
    <section class="card">
      <h3 class="card-title">🎓 學會的把戲</h3>
      <p>${st.tricks.length ? st.tricks.map(t => `✓ ${t.name}`).join('　') : '還沒學會把戲，吃點心就會慢慢學會！'}</p>
      ${next ? `<p class="note">再吃 ${next.at - st.treats} 次點心，就會學會「${next.name}」。</p>` : ''}
    </section>
    <button class="btn ghost" data-go="reminders">⏰ 設定提醒（喝水、用藥、動一動）</button>
  `, { tab: 'oasis' });
  run.wokeUp = false;
  bindRoomTouch();
  if (!run.weather && p.county && !run.roomWx) { run.roomWx = true; refreshWeather().then(() => { if (currentScreen === 'petHome' && run.weather && run.weather.rain) screens.petHome(); }); }
};

// ---------- 觸摸互動：摸摸、搓泡泡 ----------
function fx(kind, x, y) {
  const box = $('#roomFx'); if (!box) return;
  const e = document.createElement('span'); e.className = `fx ${kind}`; e.textContent = kind === 'heart' ? '❤' : '';
  e.style.left = x + 'px'; e.style.top = y + 'px'; box.appendChild(e); setTimeout(() => e.remove(), 1400);
}
function bindRoomTouch() {
  const petEl = $('#roomPet'), room = $('#room'); if (!petEl) return;
  let down = false, last = null, dist = 0, count = 0;
  const pos = ev => { const r = room.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
  petEl.addEventListener('pointerdown', ev => { down = true; last = pos(ev); petEl.setPointerCapture?.(ev.pointerId); ev.preventDefault(); });
  petEl.addEventListener('pointermove', ev => {
    if (!down) return; const p = pos(ev), d = Math.hypot(p[0] - last[0], p[1] - last[1]); last = p; dist += d;
    if (dist > 38) {
      dist = 0; count += 1; petEl.classList.add('rubbed');
      fx(run.bath ? 'bubble' : 'heart', p[0] + (Math.random() * 30 - 15), p[1] - 10);
      if (run.bath && count % 1 === 0) fx('bubble', p[0] + (Math.random() * 60 - 30), p[1] + (Math.random() * 30 - 15));
      if (count === 6) petSound(S.get().profile.petType);
      if (!run.bath && count === 14) rubDone();
      if (run.bath && count === 28) actions.bathDone();
    }
  });
  const up = () => { down = false; petEl.classList.remove('rubbed'); };
  petEl.addEventListener('pointerup', up); petEl.addEventListener('pointercancel', up);
  petEl.addEventListener('click', () => {
    if (count > 2) { count = 0; return; }
    const life = lifeState(), call = petCall();
    if (life.sleep && !run.bath) { petInRoom(life.id === 'night' ? `（揉揉眼睛）${call}，很晚了，我們都早點休息喔～` : `（打哈欠）我在睡午覺……${call}也休息一下吧。`); run.wokeUp = true; return; }
    petSound(S.get().profile.petType); petInRoom(['摸摸我的頭嘛～', `${call}最好了！`, '要不要一起出去走走？', '我今天很乖喔！'][Math.floor(Math.random() * 4)]);
  });
}
function petInRoom(text) {
  const cap = document.querySelector('.room-cap'); if (cap) cap.innerHTML = `<b>${esc(petName())}</b> ${esc(text)}`;
  petVoice(text);
}
function rubDone() {
  const s = S.get(), k = S.dayKey();
  s.pet.petDay = s.pet.petDay && s.pet.petDay.d === k ? s.pet.petDay : { d: k, n: 0 };
  const call = petCall();
  if (s.pet.petDay.n < 5) { s.pet.petDay.n += 1; s.pet.love = (s.pet.love || 0) + 1; if (s.pet.petDay.n === 1) addDiary('pet'); S.save(); petInRoom(`好舒服～謝謝${call}！親密度 +1 ❤`); }
  else petInRoom(`好舒服～${call}今天已經摸我好多次了，我好開心！`);
}

// ---------- 靜坐冥想（原創音樂，即時合成） ----------
screens.meditate = () => {
  page('一起靜坐', `
    <div class="med-stage" id="medStage">${petSVG(S.get().profile.petType || 'turtle', 150, { mood: 'calm' })}<p id="medGuide" class="med-guide">找一張穩固的椅子坐好</p><p id="medLeft" class="note"></p></div>
    <p class="note">坐著做，眼睛可以閉上，也可以睜開。覺得不舒服就隨時停下來。背景音樂是心動力原創，可以安心使用。</p>
    <div id="medPick">
      <h3 class="section-title">背景聲音</h3>
      <div class="answer-row two"><button class="btn choice ${run.medSound !== 'wave' ? 'on' : ''}" data-medsound="rain">🌧️ 雨聲</button><button class="btn choice ${run.medSound === 'wave' ? 'on' : ''}" data-medsound="wave">🌊 海浪</button></div>
      <h3 class="section-title">要多久？</h3>
      <div class="answer-row two"><button class="btn primary" data-med="3">3 分鐘</button><button class="btn" data-med="5">5 分鐘</button></div>
    </div>
    <button class="btn ghost" data-act="stopMed" id="medStop" hidden>結束靜坐</button>
    <div id="medDone"></div>
  `, { back: 'lake' });
};

function startMeditation(min) {
  unlockMediaChannel();
  startMusic(run.medSound || 'rain');
  $('#medPick').hidden = true; $('#medStop').hidden = false;
  const total = min * 60; let t = 0, gi = 0;
  const step = Math.floor(total / GUIDE.length);
  const show = () => { const g = GUIDE[gi % GUIDE.length]; $('#medGuide').textContent = g; speak(g); gi += 1; };
  show();
  run.medTimer = setInterval(() => {
    if (currentScreen !== 'meditate') return;
    t += 1; const left = total - t;
    $('#medLeft').textContent = `還有 ${Math.floor(left / 60)} 分 ${String(left % 60).padStart(2, '0')} 秒`;
    if (t % step === 0 && gi < GUIDE.length) show();
    if (left <= 0) finishMeditation(min);
  }, 1000);
}

function finishMeditation(min) {
  clearInterval(run.medTimer); run.medTimer = null; stopMusic();
  const s = S.get(); s.meditations.push({ at: new Date().toISOString(), minutes: min }); s.garden.water += 1; S.save(); addDiary('meditate', { min, sound: run.medSound });
  const msg = `${petCall()}，我們一起安靜了 ${min} 分鐘，好舒服喔。得到一滴晨露和心動點數！`;
  $('#medStop').hidden = true; $('#medGuide').textContent = '完成了！';
  $('#medDone').innerHTML = `<div class="done-card"><span class="big-emoji">🍃</span><p>${esc(msg)}</p></div><button class="btn primary" data-go="petHome">去看${esc(petName())}</button><button class="btn" data-go="lake">回心靈湖畔</button>`;
  speak(msg); petals();
}

// ---------- 生活提醒 ----------
screens.reminders = () => {
  const list = S.get().reminders, k = run.remKind || 'water';
  const msg = run.settingsMsg; run.settingsMsg = null;
  page('生活提醒', `
    ${msg ? `<div class="saved" role="status">✓ ${esc(msg)}</div>` : ''}
    <section class="card">
      <h3 class="card-title">已設定的提醒</h3>
      ${list.length ? list.slice().sort((x, y) => x.time.localeCompare(y.time)).map(r => `<div class="contact-row"><span>${KINDS[r.kind].icon} <b>${r.time}</b>　${esc(r.label)}</span><button class="btn small" data-delrem="${r.id}">刪除</button></div>`).join('') : '<p class="note">還沒有設定提醒。</p>'}
      ${list.length ? '<button class="btn line-btn" data-act="exportIcs">📅 加到手機行事曆（APP 關掉也會響）</button>' : ''}
    </section>
    <section class="card">
      <h3 class="card-title">新增提醒</h3>
      <div class="kind-row">${Object.entries(KINDS).map(([id, v]) => `<button class="btn choice ${k === id ? 'on' : ''}" data-remkind="${id}">${v.icon} ${v.label}</button>`).join('')}</div>
      <label class="field">${k === 'med' ? '要提醒吃什麼？' : '提醒的內容'}<input id="remLabel" type="text" maxlength="20" placeholder="${k === 'med' ? '例如：血壓藥、飯後鈣片' : esc(KINDS[k].default || '例如：量血壓')}" value="${esc(KINDS[k].default)}"></label>
      <label class="field">時間<input id="remTime" type="time" value="${k === 'med' ? '08:00' : k === 'water' ? '10:00' : '15:00'}"></label>
      <button class="btn primary" data-act="addRem">新增提醒</button>
      <p class="note">家人也可以在這支手機上幫忙設定。${k === 'med' ? '心動力只依你設定的時間提醒，<b>不會建議用藥</b>；用藥有疑問，請問醫師或藥師。' : k === 'water' ? '如果醫師有限制喝水量，請依醫師建議。' : ''}</p>
    </section>
  `, { back: 'settings' });
};

// 到時間的提醒：由寵物在頁面最上方提醒
function reminderPop() {
  if (NO_PET.includes(currentScreen) && currentScreen !== 'help') return '';
  const due = dueReminders(S.get()).filter(r => !(run.snooze && run.snooze[r.id] > Date.now()));
  if (!due.length) return '';
  const r = due[0], call = petCall();
  const text = r.kind === 'med' ? `${call}，該吃「${r.label}」了喔！` : r.kind === 'water' ? `${call}，${r.label}吧！` : `${call}，${r.label}的時間到了！`;
  if (run.lastRemSpoken !== r.id) { run.lastRemSpoken = r.id; setTimeout(() => speak(text), 300); }
  return `<div class="rem-pop" role="alert">${S.get().profile.petType ? petSVG(S.get().profile.petType, 56) : ''}<div><p><b>${KINDS[r.kind].icon} ${esc(text)}</b></p>
    <div class="grid2"><button class="btn primary" data-remdone="${r.id}">${r.kind === 'med' ? '吃過了' : '好了'}</button><button class="btn" data-remlater="${r.id}">等一下再提醒</button></div></div></div>`;
}

// ---------- 居家動能保養計畫（教練／店家 → 顧客）----------
// 計畫內容放在網址裡（不需要後端）：?plan=<base64url(JSON)>
const b64e = obj => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(obj)))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const b64d = s => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), ch => ch.charCodeAt(0))));
function planURL(p) { return `${location.origin}${location.pathname}?openExternalBrowser=1&plan=${b64e({ s: p.store, c: p.coach, n: p.note, i: p.items })}`; }
function importPlanFromURL() {
  const q = new URLSearchParams(location.search).get('plan'); if (!q) return false;
  try {
    const d = b64d(q), ids = (d.i || []).filter(id => C.ACTIVITIES.some(x => x.id === id)).slice(0, 8);
    if (!ids.length) return false;
    const s = S.get(), old = s.plan;
    const same = old && old.store === d.s && old.coach === d.c && JSON.stringify(old.items) === JSON.stringify(ids);
    s.plan = { store: String(d.s || '').slice(0, 20), coach: String(d.c || '').slice(0, 12), note: String(d.n || '').slice(0, 60), items: ids, at: same ? old.at : new Date().toISOString(), log: same ? old.log : [] };
    S.save(); run.planNew = !same;
    const u = new URL(location.href); u.searchParams.delete('plan'); history.replaceState(null, '', u.pathname + u.search + u.hash);
    return true;
  } catch (e) { return false; }
}
const planFrom = p => [p.store, p.coach].filter(Boolean).join('・') || '你的教練';
function planWeek(p) {
  const since = Date.now() - 7 * 864e5, wk = (p.log || []).filter(x => new Date(x.at).getTime() >= since);
  const today = S.dayKey(), doneToday = new Set((p.log || []).filter(x => S.dayKey(x.at) === today).map(x => x.id));
  return { count: wk.length, days: new Set(wk.map(x => S.dayKey(x.at))).size, doneToday, byId: id => wk.filter(x => x.id === id).length };
}
function planBadge(id) {
  const p = S.get().plan; if (!p || !p.items.includes(id)) return '';
  return `<p class="plan-badge">🧘 ${esc(planFrom(p))} 為你安排的居家動能保養</p>`;
}
function planCard() {
  const p = S.get().plan; if (!p) return '';
  const w = planWeek(p);
  return `<section class="plan-card">
    <p class="eyebrow">居家動能保養計畫</p>
    <h3>${esc(planFrom(p))} 為你準備的</h3>
    ${p.note ? `<p class="plan-note">「${esc(p.note)}」</p>` : ''}
    <div class="plan-items">${p.items.map(id => { const a = C.ACTIVITIES.find(x => x.id === id); return `<button class="plan-item ${w.doneToday.has(id) ? 'done' : ''}" data-planact="${id}"><span>${w.doneToday.has(id) ? '✓' : '○'}</span><b>${esc(a.name)}</b><small>${esc(a.repsNote || '')}</small></button>`; }).join('')}</div>
    <p class="note">這 7 天完成 <b>${w.count}</b> 次、共 <b>${w.days}</b> 天。動作開始前，會先做安全確認。</p>
    <div class="grid2"><button class="btn line-btn" data-act="reportPlan">回報給${esc(p.coach || '教練')}</button><button class="btn ghost" data-act="clearPlan">移除這份計畫</button></div>
  </section>`;
}

screens.coach = () => {
  const cp = S.get().coachProfile || { store: '', coach: '' }, sel = run.coachSel || [];
  const groups = {};
  C.ACTIVITIES.forEach(a => { const g = C.BODY_OF[a.id] || '其他'; (groups[g] = groups[g] || []).push(a); });
  const out = run.coachOut;
  page('居家動能保養計畫', `
    <section class="card">
      <p class="eyebrow">店家／教練版</p>
      <h3 class="card-title">幫顧客準備回家後的保養動作</h3>
      <p class="note">從動作庫挑 1–5 個動作，產生連結或 QR code 給顧客。顧客用手機打開，就會看到你的名字和這份計畫；每次開始前，系統會先做安全確認。</p>
      <label class="field">店名或單位<input id="cpStore" type="text" maxlength="20" value="${esc(cp.store)}" placeholder="例如：心動力運動工作室"></label>
      <label class="field">教練或師傅的稱呼<input id="cpCoach" type="text" maxlength="12" value="${esc(cp.coach)}" placeholder="例如：王教練"></label>
    </section>
    <section class="card">
      <h3 class="card-title">挑選動作（已選 ${sel.length}／5）</h3>
      ${Object.entries(groups).map(([g, list]) => `<p class="coach-group">${g}</p><div class="coach-list">${list.map(a => `<button class="coach-pick ${sel.includes(a.id) ? 'on' : ''}" data-coachpick="${a.id}"><b>${sel.includes(a.id) ? '✓ ' : ''}${esc(a.name)}</b><small>${a.level === 'seated' ? '坐姿' : '扶椅站姿'}・${esc(a.repsNote || '')}</small></button>`).join('')}</div>`).join('')}
      <label class="field">給顧客的一句話（選填）<input id="cpNote" type="text" maxlength="60" placeholder="例如：每天睡前做一次，慢慢來就好"></label>
      <button class="btn primary big" data-act="genPlan">產生居家動能保養計畫</button>
      <p class="note">動作庫由團隊依運動醫學原則整理，正式使用前將請專業人員確認。只能從動作庫挑選，不能自行新增動作；本計畫為居家保養與活動陪伴，不是醫療處方，也不宣稱療效。</p>
    </section>
    ${out ? `<section class="card" id="coachOut">
      <h3 class="card-title">已產生！傳給顧客吧</h3>
      <div id="qr" class="qr-box" aria-label="計畫 QR code"></div>
      <p class="plan-link">${esc(out)}</p>
      <div class="grid2"><a class="btn line-btn" href="${lineURL(`${planFrom({ store: cp.store, coach: cp.coach })}為你準備了居家動能保養計畫，點這裡開始：\n${out}`)}" target="_blank" rel="noopener">用 LINE 傳給顧客</a><button class="btn" data-act="copyPlan">複製連結</button></div>
      <a class="btn ghost" href="${esc(out)}" target="_blank" rel="noopener">預覽顧客看到的畫面</a>
    </section>` : ''}
  `, { back: 'today' });
  if (out) drawQR(out);
};

// QR code：使用 cdnjs 的 qrcodejs（只在店家頁載入）；載入失敗時仍可用連結
function drawQR(text) {
  const box = $('#qr'); if (!box) return;
  const draw = () => { box.innerHTML = ''; try { new window.QRCode(box, { text, width: 220, height: 220, correctLevel: window.QRCode.CorrectLevel.M }); } catch (e) { box.innerHTML = '<p class="note">QR code 產生失敗，請使用下方連結。</p>'; } };
  if (window.QRCode) return draw();
  const sc = document.createElement('script');
  sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js';
  sc.onload = draw; sc.onerror = () => { box.innerHTML = '<p class="note">目前無法顯示 QR code（需要網路），請使用下方連結。</p>'; };
  document.head.appendChild(sc);
}

// ---------- 心靈湖畔 ----------
screens.lake = () => {
  const s = S.get();
  const flowers = s.moods.length;
  const reply = run.lakeReply; run.lakeReply = null;
  page('心靈湖畔', `
    <div class="scene-hero">${lakeScene(flowers)}<div class="scene-cap"><b>心靈湖畔</b><span>每記錄一次心情，湖上就開一朵心情之花（已開 ${flowers} 朵）</span></div></div>
    <section class="card">
      <h3 class="card-title">你現在的感覺是？</h3>
      <div class="feel-list">${C.LAKE_FEELINGS.map(f => f.go === 'line'
        ? lineLink('我想聊聊', f.label, 'feel')
        : `<button class="feel" data-feel="${f.id}">${f.label}</button>`).join('')}</div>
      ${reply ? `<div class="bubble bot">${esc(reply.text)}</div>${reply.btns}` : ''}
    </section>
    <button class="feature-card" data-go="breathe"><span class="fc-icon">💧</span><span><b>呼吸練習</b><br>吸 4 秒、吐 6 秒，完成可以得到一滴晨露</span></button>
    <button class="feature-card" data-go="meditate"><span class="fc-icon">🍃</span><span><b>靜坐冥想</b><br>3 或 5 分鐘，搭配雨聲或海浪</span></button>
    <button class="feature-card" data-go="mood"><span class="fc-icon">🌸</span><span><b>記錄今天的心情</b><br>點一下，湖上就開一朵花</span></button>
    <button class="feature-card" data-go="fof"><span class="fc-icon">🍃</span><span><b>走路時擔心跌倒嗎？</b><br>每週回答一次，看看信心有沒有回來</span></button>
    <button class="feature-card" data-go="chat"><span class="fc-icon">💬</span><span><b>跟小夥伴聊聊</b><br>在 APP 裡說說話</span></button>
    <p class="note">心靈湖畔提供陪伴與放鬆，不是心理治療，也不做任何診斷。心裡很難受時，請撥打 <a href="tel:1925">1925 安心專線</a>（24 小時）。</p>
  `, { tab: 'lake' });
};

// ---------- 呼吸練習 ----------
screens.breathe = () => {
  const intro = run.breathIntro; run.breathIntro = null;
  page('呼吸練習', `
    ${intro ? `<div class="bubble bot">${esc(intro)}</div>` : ''}
    <div class="breath-stage"><div class="breath-orb" id="orb"></div><p id="breathCue" class="breath-cue">準備好了，就選一個長度開始</p><p id="breathLeft" class="note"></p></div>
    <p class="note">用鼻子慢慢吸氣 ${C.BREATH.inhale} 秒，再慢慢吐氣 ${C.BREATH.exhale} 秒。不需要憋氣；覺得頭暈，就恢復平常的呼吸。</p>
    <div class="answer-row two" id="breathBtns"><button class="btn primary" data-breath="1">1 分鐘</button><button class="btn" data-breath="3">3 分鐘</button></div>
    <div id="breathDone"></div>
  `, { back: 'lake' });
};

function startBreath(min) {
  const total = Math.round(min * 60 / (C.BREATH.inhale + C.BREATH.exhale));
  let n = 0;
  $('#breathBtns').hidden = true;
  const orb = $('#orb'), cue = $('#breathCue'), left = $('#breathLeft');
  const step = phase => {
    if (currentScreen !== 'breathe') return;
    if (phase === 'in') {
      if (n >= total) return finishBreath(min);
      n += 1;
      orb.style.transitionDuration = C.BREATH.inhale + 's'; orb.classList.add('in');
      cue.textContent = '慢慢吸氣…'; left.textContent = `第 ${n} 次，共 ${total} 次`;
      speak('吸氣', { force: false });
      run.breathTimer = setTimeout(() => step('out'), C.BREATH.inhale * 1000);
    } else {
      orb.style.transitionDuration = C.BREATH.exhale + 's'; orb.classList.remove('in');
      cue.textContent = '慢慢吐氣…';
      speak('吐氣', { force: false });
      run.breathTimer = setTimeout(() => step('in'), C.BREATH.exhale * 1000);
    }
  };
  step('in');
}

function finishBreath(min) {
  S.addBreath(min); addDiary('breath');
  $('#breathCue').textContent = '完成了！';
  const msg = '做得很好！你得到了一滴晨露，已經存進花園，下次植物長大時會用上。';
  $('#breathDone').innerHTML = `<div class="done-card"><span class="big-emoji">💧</span><p>${msg}</p></div>
    <button class="btn primary" data-go="oasis">看看我的綠洲</button><button class="btn" data-go="lake">回心靈湖畔</button>`;
  speak(msg); petals();
}

// ---------- 知識花園 ----------
screens.knowledge = () => {
  const reads = new Set(S.get().reads);
  const cats = [...new Set(C.KNOWLEDGE.map(k => k.cat))];
  page('知識花園', `
    <div class="know-hero"><p class="eyebrow">知識花園</p><h2>每天一張小卡，認識自己的身體與心情</h2><p class="note">已讀 ${reads.size} / ${C.KNOWLEDGE.length} 張</p></div>
    ${cats.map(cat => `<h3 class="section-title">${cat}</h3><div class="know-list">${C.KNOWLEDGE.filter(k => k.cat === cat).map(k => `
      <button class="know-card ${reads.has(k.id) ? 'read' : ''}" data-card="${k.id}"><span class="cat">${k.cat}</span><b>${k.title}</b><span class="state">${reads.has(k.id) ? '✓ 讀過了' : '點我閱讀'}</span></button>`).join('')}</div>`).join('')}
    <p class="note">知識卡為一般健康資訊，不是醫療建議；內容由團隊整理，待專業人員確認。身體有狀況請詢問醫師。</p>
  `, { tab: 'knowledge' });
};

screens.card = id => {
  const k = C.KNOWLEDGE.find(x => x.id === id) || C.KNOWLEDGE[0];
  const firstRead = !S.get().reads.includes(k.id);
  S.markRead(k.id);
  const idx = C.KNOWLEDGE.indexOf(k), next = C.KNOWLEDGE[(idx + 1) % C.KNOWLEDGE.length];
  page('知識卡', `
    <article class="know-detail">
      <span class="cat">${k.cat}</span>
      <h2>${esc(k.title)}</h2>
      ${sayBtn(k.title + k.body.join(''))}
      ${k.body.map(p => `<p>${esc(p)}</p>`).join('')}
      ${k.src ? `<p class="src">資料來源：${esc(k.src)}</p>` : ''}
    </article>
    ${firstRead ? '<p class="note">讀完一張卡片，生命之樹也長大了一點 🌱</p>' : ''}
    <button class="btn primary big" data-card="${next.id}">下一張：${esc(next.title)}</button>
    <button class="btn" data-go="knowledge">回知識花園</button>
  `, { back: 'knowledge' });
};

// ---------- 我的綠洲：生命之樹、徽章、花園、每週回顧 ----------
screens.oasis = () => {
  const tree = treeInfo(), got = S.earnedBadges(), w = S.weekStats();
  const g = S.get().garden;
  page('我的綠洲', `
    <button class="btn ghost settings-entry" data-go="settings">${icon('gear')} 設定與個人資料（稱呼、聯絡人、重新回答）</button>
    <section class="tree-card">
      ${treeOfLife(tree.stage, { size: 260 })}
      <h2>生命之樹：${tree.name}</h2>
      <div class="bar big" role="progressbar" aria-valuenow="${tree.pct}" aria-valuemin="0" aria-valuemax="100" aria-label="生命之樹成長進度"><i style="width:${tree.pct}%"></i></div>
      <p>${tree.next ? `再參與 ${tree.next.at - tree.points} 次，就會長成「${tree.next.name}」` : '你的生命之樹已經完全長大了！'}</p>
      <p class="note">記錄心情、呼吸練習、活動、散步、讀知識卡，都會讓樹長大。樹只會長大，不會因為休息而倒退。</p>
    </section>
    <section class="card">
      <h3 class="card-title">紀念徽章（${got.size} / ${C.BADGES.length}）</h3>
      <div class="badges">${C.BADGES.map(b => `<div class="badge ${got.has(b.id) ? 'got' : ''}">${badgeSVG(b.icon, got.has(b.id))}<b>${b.name}</b><span>${got.has(b.id) ? b.desc : '還沒解鎖：' + b.desc}</span></div>`).join('')}</div>
    </section>
    <button class="oasis-card" data-go="petHome"><div class="oasis-pic">${S.get().profile.petType ? petSVG(S.get().profile.petType, 110) : ''}</div><div><p class="eyebrow">心動夥伴</p><h3>${S.get().profile.petType ? esc(PETS[S.get().profile.petType].name) + '的小屋' : '選一個夥伴'}</h3><p class="note">餵點心、學把戲、一起靜坐</p></div></button>
    <div class="quick">
      <button class="quick-item garden" data-go="garden">${icon('garden')}<b>心動綠洲花園</b><span>${g.plots.length} 株植物・${new Set((g.spirits || []).map(s => s.id)).size} 隻葉靈</span></button>
      <button class="quick-item week" data-go="week">${icon('chart')}<b>每週回顧</b><span>這週活動 ${w.total} 次</span></button>
    </div>
    <button class="text-link" data-go="settings">${icon('gear')} 設定</button>
  `, { tab: 'oasis' });
};

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
  const p = S.get().profile, t = S.get().today;
  const msg = run.settingsMsg; run.settingsMsg = null;
  const label = (c, v) => v === 'yes' ? c.yes : v === 'no' ? c.no : '不確定';
  const todayText = !t.allowed ? '今天還沒回答活動前的 3 個問題。'
    : { none: '今天先休息，不做運動。', seated: '今天只做坐著的溫和活動。', standard: '今天可以做坐姿、扶椅活動與散步。' }[t.allowed];
  page('設定與個人資料', `
    ${msg ? `<div class="saved" role="status">✓ ${esc(msg)}</div>` : ''}
    <section class="panel">
      <h2>我的稱呼</h2>
      <div class="inline-form"><input id="sname" type="text" maxlength="12" value="${esc(p.name)}" aria-label="我的稱呼" placeholder="例如：林阿姨"><button class="btn small" data-act="saveName">儲存</button></div>
    </section>
    <section class="panel">
      <h2>心動夥伴與所在地</h2>
      <p>${S.get().profile.petType ? `夥伴：${PETS[S.get().profile.petType].name}（叫你「${esc(petCall())}」）` : '還沒選夥伴'}<br>所在地：${esc(S.get().profile.county || '未設定')}</p>
      <div class="grid2"><button class="btn" data-act="editPet">換夥伴或稱呼</button><button class="btn" data-act="editPlace">更改所在地</button></div>
      <button class="btn ghost" data-go="reminders">⏰ 生活提醒（喝水、用藥、動一動）</button>
    </section>
    <section class="panel">
      <h2>今天的狀況</h2>
      <p>${todayText}</p>
      ${t.check ? `<ul class="rules">${C.DAILY_CHECK.filter(c => t.check[c.id]).map(c => `<li>${esc(c.q)} <b>${label(c, t.check[c.id])}</b></li>`).join('')}</ul>` : ''}
      ${t.mood ? `<p class="note">今天心情：${C.MOODS.find(m => m.id === t.mood).face} ${C.MOODS.find(m => m.id === t.mood).label}</p>` : ''}
      <div class="grid2"><button class="btn" data-act="redoCheck">重新回答今天的問題</button><button class="btn" data-go="mood">更改今天的心情</button></div>
    </section>
    <section class="panel">
      <h2>家人聯絡電話</h2>
      ${p.contacts.length ? p.contacts.map((c, i) => `<div class="contact-row"><span>${esc(c.name)}　${esc(c.phone)}</span><button class="btn small" data-delcontact="${i}">刪除</button></div>`).join('') : '<p class="note">還沒有設定。按「不舒服」時，會顯示這裡的電話。</p>'}
      ${p.contacts.length < 3 ? `<label class="field">稱呼<input id="cname" type="text" maxlength="12" placeholder="例如：女兒 小婷"></label>
      <label class="field">電話<input id="cphone" type="tel" inputmode="tel" maxlength="15" placeholder="0912345678"></label>
      <button class="btn" data-act="addContact">新增聯絡人</button>` : '<p class="note">最多 3 位聯絡人。</p>'}
    </section>
    <section class="panel">
      <h2>健康小問題</h2>
      <p>${{ seated: '目前只開放坐姿活動。', assisted: '扶椅活動與散步需有人陪同。', standard: '坐姿、扶椅活動與散步都可以。' }[effectiveLevel()]}</p>
      ${p.screening.at ? `<p class="note">上次回答：${new Date(p.screening.at).toLocaleDateString('zh-TW')}${p.screening.cleared ? '（已由專業人員確認）' : ''}</p>` : ''}
      <button class="btn ghost" data-act="redoScreening">重新回答健康小問題</button>
      ${p.screening.level === 'seated' && !p.screening.cleared ? '<button class="btn ghost" data-act="clearByStaff">專業人員確認後開放（請由醫師或據點人員操作）</button>' : ''}
    </section>
    <section class="panel">
      <h2>字的大小與聲音</h2>
      <div class="answer-row four">${[[1, '100%'], [1.25, '125%'], [1.5, '150%'], [2, '200%']].map(([v, l]) => `<button class="btn choice ${p.fontScale === v ? 'on' : ''}" data-font="${v}" aria-pressed="${p.fontScale === v}">${l}</button>`).join('')}</div>
      <label class="switch"><input type="checkbox" data-act="toggleSimple" ${p.simple ? 'checked' : ''}><span>簡易模式（首頁只顯示三個大按鈕）</span></label>
      <label class="switch"><input type="checkbox" data-act="toggleVoice" ${p.voice ? 'checked' : ''}><span>語音朗讀（由夥伴的聲音說）</span></label>
      <label class="switch"><input type="checkbox" data-act="toggleSlowVoice" ${p.slowVoice ? 'checked' : ''}><span>說話慢一點</span></label>
      <label class="switch"><input type="checkbox" data-act="togglePetRoam" ${p.petRoam !== false ? 'checked' : ''}><span>夥伴在畫面上走來走去</span></label>
      <label class="field">朗讀的聲音（挑一個最順耳的）
        <select id="voicePick" class="big-select" data-act="pickVoice">${[{ name: '', lang: '' }, ...listVoices()].map(v => `<option value="${esc(v.name)}" ${p.voiceName === v.name ? 'selected' : ''}>${v.name ? esc(v.name) + '（' + esc(v.lang) + '）' : '自動挑最自然的'}</option>`).join('')}</select>
      </label>
      <p class="note">想要更像真人：iPhone 到「設定 → 輔助使用 → 語音內容 → 聲音 → 中文（臺灣）」下載「加強版」或「高品質」聲音；電腦用 Edge 瀏覽器會有更自然的聲音。</p>
      <button class="btn ghost" data-act="testVoice">測試聲音</button>
      <p id="voiceMsg" class="note"></p>
    </section>
    <section class="panel">
      <h2>資料</h2>
      <p class="note">目前是訪客模式，所有紀錄只存在這支手機的瀏覽器裡，不會上傳。</p>
      <button class="btn ghost" data-act="clearToday">清除今天的心情與回答（重新開始今天）</button>
      <button class="btn ghost danger-text" data-act="reset">清除所有資料，從頭開始</button>
      <button class="tour-link" data-act="demo">瀏覽示範旅程（以一週範例資料體驗完整功能）</button>
      <p class="note">目前版本：${APP_VERSION}</p>
    </section>
  `, { back: 'today' });
  if (msg) speak(msg);
};

function readContact() {
  const n = $('#cname')?.value.trim(), ph = $('#cphone')?.value.replace(/[^\d+]/g, '');
  if (n && ph) S.get().profile.contacts.push({ name: n, phone: ph });
}

// ---------- 事件 ----------
// ---------- 散步明信片（分享給家人） ----------
async function makePostcard() {
  const w = run.lastWalk; if (!w) return;
  const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d');
  const grad = x.createLinearGradient(0, 0, 0, H); grad.addColorStop(0, '#CFE8F2'); grad.addColorStop(.55, '#EAF4E4'); grad.addColorStop(1, '#B8D99A');
  x.fillStyle = grad; x.fillRect(0, 0, W, H);
  x.fillStyle = '#F6C453'; x.beginPath(); x.arc(900, 170, 80, 0, Math.PI * 2); x.fill();
  const font = (s, wgt = 800) => `${wgt} ${s}px "PingFang TC","Noto Sans TC","Microsoft JhengHei",sans-serif`;
  x.fillStyle = '#1D2B24'; x.font = font(64); x.fillText('今天的散步明信片', 80, 200);
  x.font = font(40, 500); const d = new Date(w.at); x.fillText(`${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}　${S.get().profile.name || ''}`, 80, 270);
  x.fillStyle = '#215C40'; x.font = font(150); x.fillText(`${w.km.toFixed(2)}`, 80, 470);
  const kmW = x.measureText(`${w.km.toFixed(2)}`).width; x.font = font(54); x.fillText('公里', 100 + kmW, 470);
  x.fillStyle = '#1D2B24'; x.font = font(44, 600); x.fillText(`走了 ${w.minutes} 分鐘・路上開了 ${w.flowers} 朵花`, 80, 560);
  const ids = (w.friends.length ? w.friends : ['jasmine']).slice(0, 3);
  for (let i = 0; i < ids.length; i++) {
    const svg = spiritSVG(ids[i], 300).replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ');
    const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
    await img.decode().catch(() => {});
    x.drawImage(img, 80 + i * 320, 650, 300, 336);
  }
  x.font = font(40, 600); const names = w.friends.map(id => C.SPIRITS.find(s => s.id === id)?.name);
  x.fillText(names.length ? `今天遇到：${names.slice(0, 3).join('、')}${names.length > 3 ? ' 等' : ''}` : '下次散步，說不定會遇到葉靈喔！', 80, 1080);
  x.fillStyle = '#2F7D57'; x.font = font(46); x.fillText('心動力 AI｜讓運動從心開始', 80, 1240);
  const blob = await new Promise(r => cv.toBlob(r, 'image/png'));
  const file = new File([blob], '心動力散步明信片.png', { type: 'image/png' });
  const text = `我今天散步了 ${w.km.toFixed(2)} 公里，路上開了 ${w.flowers} 朵花！🌸`;
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try { await navigator.share({ files: [file], text }); return; } catch (e) { /* 使用者取消 */ return; }
  }
  const url = URL.createObjectURL(blob);
  run.postcardURL = url;
  go('postcard');
}

screens.postcard = () => {
  const w = run.lastWalk;
  page('散步明信片', `
    <img class="postcard" src="${run.postcardURL}" alt="散步明信片">
    <p class="note">長按圖片可以儲存，再用 LINE 傳給家人。</p>
    <a class="btn line-btn" href="${lineURL(`我今天散步了 ${w.km.toFixed(2)} 公里，路上開了 ${w.flowers} 朵花！🌸`)}" target="_blank" rel="noopener">用 LINE 分享文字</a>
    <button class="btn" data-go="today">回首頁</button>
  `, { back: 'today' });
};

const actions = {
  postcard: makePostcard,
  greet,
  help: () => go('help'),
  demo: () => { S.loadDemo(); setFont(); go('today'); },
  // 結束示範：清除範例資料，回到第一次使用的歡迎畫面（下一位使用者看到的是全新狀態）
  endDemo: () => { if (confirm('結束示範旅程？範例資料會清除，回到歡迎畫面。')) { S.reset(); setFont(); go('welcome'); } },
  startScreening: () => { S.get().profile.name = $('#name').value.trim(); S.save(); go('petPick'); },
  petNext: () => {
    const p = S.get().profile;
    if (!run.pickPet && !p.petType) { alert('請先選一個夥伴喔！'); return; }
    const changed = run.pickPet && run.pickPet !== p.petType;
    p.petType = run.pickPet || p.petType; p.petCall = $('#petCall').value.trim() || p.name || '';
    p.petName = $('#petNameIn').value.trim() || (changed ? '' : p.petName); S.save();
    const r = roamEl().querySelector('#roamBody'); if (r) r.dataset.pet = '';
    petSound(p.petType, 2); setTimeout(() => speak(`我是${petName()}！以後請多多指教，${petCall()}！`), voiceHeard() ? 500 : 0);
    go(run.fromSettings ? 'settings' : 'place');
  },
  placeNext: () => { const v = $('#county')?.value || ''; S.get().profile.county = v; S.save(); sessionStorage.removeItem('mm-weather'); run.weatherAdvice = null; go(run.fromSettings ? 'settings' : 'setupWith'); },
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
  findParks: loadParks,
  holdStart: () => {
    if (run.holding) return;
    const a = run.activity; if (!a || !a.hold) return;
    if (run.reps >= a.reps) { speak('都做完了，按「做完了」就可以囉！'); return; }
    run.holding = true; let t = a.hold; const btn = $('#holdBtn');
    if (btn) { btn.textContent = `保持中…${t}`; btn.classList.add('holding'); }
    speak('保持住，慢慢呼吸。');
    run.holdTimer = setInterval(() => {
      t -= 1; const b = $('#holdBtn'); if (b) b.textContent = t > 0 ? `保持中…${t}` : '好，放鬆！';
      if (t === 5) speak('再五秒。');
      if (t <= 0) {
        clearInterval(run.holdTimer); run.holdTimer = null; run.holding = false; addRep();
        if (b) { b.classList.remove('holding'); b.textContent = run.reps >= a.reps ? '都做完了！' : `休息一下，再保持 ${a.hold} 秒`; }
      }
    }, 1000);
  },
  genPlan: () => {
    const store = $('#cpStore').value.trim(), coach = $('#cpCoach').value.trim(), note = $('#cpNote').value.trim(), items = run.coachSel || [];
    if (!items.length) { alert('請至少挑選 1 個動作。'); return; }
    if (!store && !coach) { alert('請填寫店名或教練稱呼，顧客才知道是誰準備的。'); return; }
    S.get().coachProfile = { store, coach }; S.save();
    run.coachOut = planURL({ store, coach, note, items });
    screens.coach(); setTimeout(() => $('#coachOut')?.scrollIntoView({ behavior: 'smooth' }), 50);
  },
  copyPlan: async () => { try { await navigator.clipboard.writeText(run.coachOut); alert('已複製連結！'); } catch (e) { prompt('請複製這個連結：', run.coachOut); } },
  reportPlan: () => {
    const p = S.get().plan; if (!p) return;
    const w = planWeek(p), name = S.get().profile.name || '我';
    const lines = p.items.map(id => `・${C.ACTIVITIES.find(x => x.id === id).name}：${w.byId(id)} 次`).join('\n');
    const text = `【心動力 居家動能保養回報】\n${name}這 7 天完成 ${w.count} 次、共 ${w.days} 天：\n${lines}\n謝謝${p.coach || '教練'}的安排！`;
    window.open(lineURL(text), '_blank', 'noopener');
  },
  clearPlan: () => { if (!confirm('移除這份居家動能保養計畫？')) return; S.get().plan = null; S.save(); go(currentScreen); },
  bathMode: () => { run.bath = true; go('petHome'); petVoice('洗澎澎囉！用手指幫我搓一搓～'); },
  bathDone: () => {
    if (!run.bath) return; run.bath = false;
    const s = S.get(), k = S.dayKey();
    if (s.pet.bathDay !== k) { s.pet.bathDay = k; s.pet.love = (s.pet.love || 0) + 1; addDiary('bath'); S.save(); run.petMsg = `洗好了！香噴噴～謝謝${petCall()}！親密度 +1 ❤`; }
    else run.petMsg = '洗好了！今天已經洗得好乾淨囉～';
    run.petHappy = true; go('petHome'); petVoice(run.petMsg); petals(10);
  },
  walkFromChat: () => { const s = S.get(); if (!s.pet.quest || s.pet.quest.date !== S.dayKey()) { s.pet.quest = { date: S.dayKey(), type: 'walk', done: false }; S.save(); } go('walk'); },
  talkPet: () => talkToPet(),
  togglePetRoam: e => { S.get().profile.petRoam = e.target.checked; S.save(); updateRoam(); },
  toggleSlowVoice: e => { S.get().profile.slowVoice = e.target.checked; S.save(); speak('好的，我會用這個速度說話。', { force: true }); },
  editPet: () => { run.fromSettings = true; run.pickPet = null; go('petPick'); },
  editPlace: () => { run.fromSettings = true; go('place'); },
  feedPet: () => {
    const st = petStats(S.get()), s = S.get();
    if (st.points < 1) { run.petMsg = `點數不夠了～做個活動、散步或呼吸練習，就能得到點數喔！`; return go('petHome'); }
    s.pet.spent += 1; s.pet.treats += 1; S.save(); addDiary('feed', { trick: TRICKS.find(t => t.at === s.pet.treats)?.name });
    const learned = TRICKS.find(t => t.at === s.pet.treats);
    run.petMsg = learned ? `好吃！${PETS[s.profile.petType].sound} 我學會「${learned.name}」了！` : `好吃！謝謝${petCall()}！${PETS[s.profile.petType].sound}`;
    run.petHappy = true; go('petHome'); speak(run.petMsg); petals(10);
  },
  stopMed: () => { clearInterval(run.medTimer); run.medTimer = null; stopMusic(); go('meditate'); },
  addRem: () => {
    const label = $('#remLabel').value.trim(), time = $('#remTime').value, k = run.remKind || 'water';
    if (!label || !time) { alert(k === 'med' ? '請輸入要吃什麼和時間。' : '請輸入內容和時間。'); return; }
    S.get().reminders.push({ id: 'r' + Date.now().toString(36), kind: k, label, time }); S.save();
    run.settingsMsg = `已新增：${time} ${label}`; go('reminders');
  },
  exportIcs: () => {
    const blob = new Blob([icsFor(S.get().reminders)], { type: 'text/calendar;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = '心動力提醒.ics'; document.body.appendChild(a); a.click(); a.remove();
    run.settingsMsg = '已產生行事曆檔，請在手機上選擇「加入行事曆」'; setTimeout(() => go('reminders'), 300);
  },
  checkPrev: () => { run.checkEditing = false; run.checkIdx = Math.max(0, run.checkIdx - 1); go('check'); },
  checkPrevFromSummary: () => { run.checkIdx = run.checkAns.chest && run.checkAns.chest !== 'no' ? 0 : C.DAILY_CHECK.length - 1; run.checkEditing = false; go('check'); },
  confirmCheck: () => finishCheck(),
  changeMood: () => go('mood'),
  screenPrev: () => { run.screenIdx = Math.max(0, run.screenIdx - 1); go('screening'); },
  redoCheck: e => {
    const t = S.get().today;
    // 回答過胸悶胸痛頭暈的人，只在「按錯」時才重新回答
    if (t.allowed === 'none' && !confirm('只有在剛剛按錯時才重新回答。\n如果真的有胸悶、胸痛或頭暈，今天請好好休息。\n確定要重新回答嗎？')) return;
    t.check = null; t.allowed = null; S.save();
    run.checkIdx = 0; run.checkAns = {};
    run.afterCheck = e.target.closest('[data-from]')?.dataset.from === 'walk' ? 'walk' : null;
    go('check');
  },
  fofRedo: () => { const f = S.get().fof; if (f.length && S.dayKey(f[f.length - 1].at) === S.dayKey()) { f.pop(); S.save(); } screens.fof(); },
  walkReal: () => {
    run.walkInfo = { demo: false, dest: run.walkDest || null };
    if (needsCompanion('walk')) { run.companionNext = ['walking']; return go('companion'); }
    go('walking');
  },
  walkCheck: () => { run.afterCheck = 'walk'; run.checkIdx = 0; run.checkAns = {}; go('check'); },
  // 示範散步：沿高醫附近的示範路線，終點設為示範公園，讓「導引＋到達打卡」完整展示
  walkDemo: () => { const r = C.DEMO_ROUTE; run.walkInfo = { demo: true, dest: { name: '示範小公園', lat: r[7][0], lng: r[7][1] } }; go('walking'); },
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
  pickVoice: () => {},
  testVoice: () => { speak('你好，我是心動小夥伴，聽得到我的聲音嗎？', { force: true }); $('#voiceMsg').textContent = voiceStatus(); },
  enableVoice: async e => {
    run.voiceFail = false;
    unlockMediaChannel();                 // 先切到媒體通道（同一次點擊）
    const btn = e?.target?.closest('button'); if (btn && btn.parentElement?.classList.contains('voice-pill')) btn.textContent = '🔊 正在試著說話…';
    const okNow = await speakTest('語音已經開啟了。我是心動小夥伴，接下來我會唸給你聽。');
    if (okNow) { run.voiceDismissed = true; } else { run.voiceFail = true; }
    go(currentScreen);
  },
  dismissVoice: () => { run.voiceDismissed = true; go(currentScreen); },
  toggleVoice: e => { S.get().profile.voice = e.target.checked; S.save(); },
  toggleSimple: e => { S.get().profile.simple = e.target.checked; S.save(); },
  addContact: () => {
    const n = $('#cname')?.value.trim(), ph = $('#cphone')?.value.replace(/[^\d+]/g, '');
    if (!n || !ph || ph.length < 8) { run.settingsMsg = null; alert('請輸入稱呼和正確的電話號碼。'); return; }
    readContact(); S.save(); run.settingsMsg = `已新增聯絡人：${n}`; screens.settings();
  },
  saveName: () => { S.get().profile.name = $('#sname').value.trim(); S.save(); run.settingsMsg = '稱呼已儲存'; screens.settings(); },
  clearToday: () => {
    if (!confirm('清除今天的心情和活動前回答？活動紀錄和花園都會保留。')) return;
    const s = S.get(), k = S.dayKey();
    s.moods = s.moods.filter(m => S.dayKey(m.at) !== k);
    s.today = { date: k, mood: null, check: null, allowed: null }; S.save();
    run.settingsMsg = '今天的心情和回答已清除，可以重新開始'; screens.settings();
  },
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
    // 胸悶胸痛頭暈回答「有／不確定」：其餘題目不用再問，直接到確認頁
    if (C.DAILY_CHECK[run.checkIdx].id === 'chest' && d.check !== 'no') { run.checkAns = { chest: d.check }; return go('checkSummary'); }
    if (run.checkEditing) { run.checkEditing = false; return go('checkSummary'); }
    run.checkIdx += 1;
    return run.checkIdx < C.DAILY_CHECK.length ? go('check') : go('checkSummary');
  }
  if (d.editcheck !== undefined) { run.checkIdx = Number(d.editcheck); run.checkEditing = true; return go('check'); }
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
  if (d.coachpick) {
    const sel = run.coachSel = run.coachSel || [];
    const i = sel.indexOf(d.coachpick);
    if (i >= 0) sel.splice(i, 1); else if (sel.length < 5) sel.push(d.coachpick); else { alert('最多挑選 5 個動作。'); return; }
    run.coachOut = null; const y = window.scrollY; screens.coach(); window.scrollTo(0, y); return;
  }
  if (d.planact) {
    const t = S.get().today;
    if (!t.allowed) { run.pendingActivity = d.planact; run.afterCheck = 'activities'; return actions.startActivity(); }
    const pa = C.ACTIVITIES.find(x => x.id === d.planact);
    if (t.allowed === 'none') return go('stopToday');
    if (t.allowed === 'seated' && pa.level !== 'seated') { alert('依照今天的回答，先做坐著的動作喔。'); return go('activities'); }
    return go('player', d.planact);
  }
  if (d.buy) {
    const it = SHOP.find(x => x.id === d.buy), s = S.get(), st = petStats(s);
    if (st.points < it.cost) { run.petMsg = `還差 ${it.cost - st.points} 點～一起運動或散步就能賺點數！`; return go('petHome'); }
    s.pet.spent += it.cost; s.pet.items = [...(s.pet.items || []), it.id]; S.save(); addDiary('decor', { item: it.name });
    run.petMsg = `小屋多了「${it.name}」！${PETS[s.profile.petType].sound}`; go('petHome'); petVoice(`小屋多了${it.name}，我好喜歡！`); return petals(10);
  }
  if (d.pickpet) { run.pickPet = d.pickpet; screens.petPick(); petSound(d.pickpet); return setTimeout(() => speak(`${PETS[d.pickpet].name}：${PETS[d.pickpet].trait}。`), 600); }
  if (d.med) return startMeditation(Number(d.med));
  if (d.medsound) { run.medSound = d.medsound; return screens.meditate(); }
  if (d.remkind) { run.remKind = d.remkind; return screens.reminders(); }
  if (d.delrem) { if (!confirm('刪除這個提醒？')) return; const s = S.get(); s.reminders = s.reminders.filter(r => r.id !== d.delrem); S.save(); run.settingsMsg = '提醒已刪除'; return go('reminders'); }
  if (d.remdone) { const s = S.get(), r = s.reminders.find(x => x.id === d.remdone); s.reminderLog[logKey(r)] = 'done'; S.save(); run.petSay = r.kind === 'med' ? '好的，記得配溫開水喔！' : '做得好！'; return go(currentScreen); }
  if (d.remlater) { (run.snooze = run.snooze || {})[d.remlater] = Date.now() + 15 * 60000; run.petSay = '好～15 分鐘後我再提醒你。'; return go(currentScreen); }
  if (d.dest) { run.walkDest = d.dest === 'none' ? null : run.parkState[Number(d.dest)]; return screens.walk(); }
  if (d.moodq) {
    S.setMood(d.moodq); addDiary('mood', { label: C.MOODS.find(m => m.id === d.moodq)?.label });
    run.homeToast = C.MOODS.find(m => m.id === d.moodq).reply + ' 心靈湖畔開了一朵心情之花。';
    const said = run.homeToast;
    screens.today(); speak(said); petals(12);
    $(`[data-moodq="${d.moodq}"]`)?.classList.add('pop'); return;
  }
  if (d.feel) {
    const f = C.LAKE_FEELINGS.find(x => x.id === d.feel);
    if (f.go === 'breathe') { run.breathIntro = f.reply; return go('breathe'); }
    if (f.go === 'mood:tired') {
      S.setMood('tired');
      run.lakeReply = { text: C.MOODS.find(m => m.id === 'tired').reply, btns: '<button class="btn primary" data-go="breathe">做 1 分鐘呼吸練習</button><button class="btn" data-act="startActivity">坐著輕輕動一動</button>' };
      screens.lake(); return speak(run.lakeReply?.text || C.MOODS.find(m => m.id === 'tired').reply);
    }
  }
  if (d.breath) return startBreath(Number(d.breath));
  if (d.card) return go('card', d.card);
  if (d.talk) {
    const sp = C.SPIRITS.find(s => s.id === d.talk);
    run.talkIdx = (run.talkIdx || 0) + 1;
    const line = sp.talk[run.talkIdx % sp.talk.length];
    const el = t.closest('.hero-scene') ? null : $('#spiritTalk');
    if (el) el.innerHTML = `<b>${esc(sp.name)}</b>：${esc(line)}`;
    else { // 首頁場景：在葉靈頭上冒出對話泡泡
      const gv = t.closest('.garden-view'); gv.querySelector('.talk-pop')?.remove();
      const pop = document.createElement('div'); pop.className = 'talk-pop'; pop.textContent = `${sp.name}：${line}`;
      pop.style.left = t.style.left; pop.style.top = t.style.top; gv.appendChild(pop);
      setTimeout(() => pop.remove(), 4000);
    }
    t.classList.remove('hop'); void t.offsetWidth; t.classList.add('hop');
    return speak(line, { force: true });
  }
  if (d.after) {
    if (d.after !== 'skip') { S.setAfterMood(d.after); run.afterMoodReply = C.AFTER_MOODS.find(m => m.id === d.after).reply; }
    return go('reward');
  }
  if (d.fof) {
    const n = Number(d.fof); S.addFof(n);
    const msg = C.fofReply(n);
    $('#fofReply').innerHTML = `<div class="bubble bot">${esc(msg)}</div><button class="btn primary" data-go="today">回首頁</button><button class="btn ghost" data-act="fofRedo">選錯了，重新選</button>`;
    main().querySelectorAll('.scale-btn').forEach(b => { b.disabled = true; b.classList.toggle('on', b.dataset.fof === d.fof); });
    speak(msg); return;
  }
  if (d.font) { S.get().profile.fontScale = Number(d.font); S.save(); setFont(); run.settingsMsg = '字的大小已更新'; return screens.settings(); }
  if (d.delcontact) {
    const c = S.get().profile.contacts[Number(d.delcontact)];
    if (!confirm(`刪除聯絡人「${c.name}」？`)) return;
    S.get().profile.contacts.splice(Number(d.delcontact), 1); S.save(); run.settingsMsg = '聯絡人已刪除'; return screens.settings();
  }
});

document.addEventListener('change', e => {
  const t = e.target;
  if (t.matches('input[type=checkbox][data-act]')) actions[t.dataset.act]?.(e);
});

document.addEventListener('change', e => {
  if (e.target.id === 'voicePick') { S.get().profile.voiceName = e.target.value; S.save(); refreshVoice(); petVoice('這個聲音好聽嗎？'); }
});

document.addEventListener('submit', e => {
  if (e.target.dataset.form === 'petType') { e.preventDefault(); const v = $('#roamInput').value.trim(); if (!v) return; petQuiet(); if (currentScreen !== 'chat') go('chat'); sendChat(v); return; }
  if (e.target.dataset.form === 'chat') { e.preventDefault(); sendChat($('#chatText').value); }
});

// ---------- 自由走動的心動夥伴：點牠就能說話 ----------
const ROAM_HIDE = [...NO_PET, 'player', 'walking', 'meditate', 'breathe', 'check', 'checkSummary', 'petHome', 'chat', 'reminders', 'settings'];
function roamEl() {
  let el = document.getElementById('petRoam');
  if (!el) {
    el = document.createElement('div'); el.id = 'petRoam';
    el.innerHTML = '<div class="roam-say" id="roamSay" role="status" aria-live="polite"></div><button class="roam-pet" id="roamPet" aria-label="點我說話"><span class="roam-flip"><span class="roam-bob" id="roamBody"></span></span></button>';
    document.body.appendChild(el);
    el.querySelector('#roamPet').addEventListener('click', e => { e.stopPropagation(); talkToPet(); });
  }
  return el;
}
function updateRoam() {
  const p = S.get().profile, el = roamEl();
  const show = p.petType && p.petRoam !== false && !ROAM_HIDE.includes(currentScreen);
  el.hidden = !show; if (!show) return;
  el.classList.toggle('has-tabs', !!main().querySelector('.tabs'));
  const body = el.querySelector('#roamBody'); if (body.dataset.pet !== p.petType) { body.innerHTML = petSVG(p.petType, 76); body.dataset.pet = p.petType; }
  if (run.lastRoamScreen !== currentScreen) { run.lastRoamScreen = currentScreen; run.petSeed = (run.petSeed || 0) + 1; if (!run.sayingSticky && !(run.sayUntil > Date.now())) petSay(petLine(currentScreen, petCall(), run.petSeed), { quiet: true, ms: 4500 }); }
}
// 夥伴說話：泡泡＋（可選）語音＋（可選）動作按鈕
function petSay(text, { quiet = false, ms = 6000, actions = '' } = {}) {
  const el = roamEl(); if (el.hidden && !actions) { if (!quiet) speak(text); return; }
  const say = el.querySelector('#roamSay');
  say.innerHTML = `<button class="roam-x" data-need="close" aria-label="收起">×</button><b>${esc(petName())}</b> ${esc(text)}${actions ? `<span class="roam-acts">${actions}</span>` : ''}`;
  el.classList.add('talking'); clearTimeout(run.sayTimer); run.sayingSticky = !!actions; run.sayUntil = Date.now() + ms;
  if (!actions) run.sayTimer = setTimeout(() => { el.classList.remove('talking'); }, ms);
  if (!quiet) petVoice(text);
}
// 先發出真的寵物叫聲，再用寵物的聲音說話（語速接近真人）
async function petVoice(text) {
  const t = S.get().profile.petType;
  if (!t || !S.get().profile.voice) return speak(text);
  if (!voiceHeard()) { petSound(t); speak(text); return; } // iPhone 第一次發聲要在點擊當下，不能延遲
  await whenIdle();                                   // 系統提示還在說，就先等它說完，不互搶
  const d = petSound(t);
  setTimeout(() => speak(text), Math.round(d * 1000));
}
function petQuiet() { const el = roamEl(); el.classList.remove('talking'); run.sayingSticky = false; }

async function talkToPet(force = false) {
  if (run.listening) { stopListening(); return; }
  // 這支手機的網頁語音辨識失敗過：直接打開打字框，並提示用鍵盤上的麥克風（iPhone 的聽寫比較穩）
  const fails = run.voiceFails || Number(sessionStorage.getItem('mm-voice-fail') || 0);
  if (!force && fails >= 1) { petType(); return; }
  if (!canListen) { petType(); return; }
  suspendAudio(); stopSpeaking();
  run.listening = true; roamEl().classList.add('listening');
  petSay('我在聽～說完我就知道了！', { quiet: true, actions: '<button data-need="stoplisten">說完了</button>' });
  const r = await listenTap({ onInterim: t => { const s = $('#roamSay'); if (s) s.innerHTML = `<b>${esc(petName())}</b> 🎙️ ${esc(t)}…`; } });
  run.listening = false; roamEl().classList.remove('listening');
  if (r.text) { petQuiet(); if (currentScreen !== 'chat') go('chat'); sendChat(r.text); return; }
  run.voiceFails = (run.voiceFails || 0) + 1; try { sessionStorage.setItem('mm-voice-fail', String(run.voiceFails)); } catch (e) { /* 忽略 */ }
  petSay(`${listenErrorText(r.error)}（代碼：${r.error}）`, { quiet: true, actions: '<button data-need="retalk">再說一次</button><button data-need="type">改用打字</button>' });
}

// 在泡泡裡直接打字跟寵物說話（提示：也可以按鍵盤上的麥克風用說的）
function petType() {
  petSay('想跟我說什麼？打字或按鍵盤上的🎤都可以～', { quiet: true, actions: '<form class="roam-type" data-form="petType"><input id="roamInput" type="text" maxlength="120" placeholder="跟牠說說話…" aria-label="跟寵物說的話" enterkeyhint="send"><button type="submit">送出</button></form>' });
  setTimeout(() => $('#roamInput')?.focus(), 50);
}

// 一打開就跟主人打招呼（每次開啟一次）
function greetOwner() {
  if (run.greeted || !S.get().profile.petType) return; run.greeted = true;
  const h = new Date().getHours(), hi = h < 11 ? '早安' : h < 18 ? '午安' : '晚安';
  const w = run.weatherAdvice ? `${run.weatherAdvice.icon} ${run.weatherAdvice.text}` : '今天想跟我一起做什麼呢？';
  petSay(`${petCall()}${hi}！好想你喔～${w}`, { ms: 8000 });
  setTimeout(() => { run.questOffered = true; if (!run.listening) questOffer(); }, 45000);
}

// 點畫面其他地方、或滑動網頁時，自動收起泡泡（聽話中、或有按鈕的重要訊息除外）
document.addEventListener('pointerdown', e => {
  if (run.listening || e.target.closest('#petRoam')) return;
  if (!run.sayingSticky) petQuiet();
}, true);
let lastScrollY = 0;
window.addEventListener('scroll', () => {
  if (Math.abs(window.scrollY - lastScrollY) > 40 && !run.listening) { lastScrollY = window.scrollY; petQuiet(); }
}, { passive: true });

// ---------- 每日溜溜任務：開 APP 一分鐘內，寵物邀主人出門散步換零食 ----------
function questOffer() {
  const s = S.get(), t = s.today, q = s.pet.quest;
  if (!s.profile.petType || (q && q.date === S.dayKey())) return;
  const outdoorOk = t.allowed !== 'none' && t.allowed !== 'seated' && (!run.weatherAdvice || run.weatherAdvice.outdoor !== 'indoor');
  s.pet.quest = { date: S.dayKey(), type: outdoorOk ? 'walk' : 'move', done: false }; S.save();
  const w = run.weatherAdvice ? `${run.weatherAdvice.icon} ${run.weatherAdvice.text}` : '';
  if (outdoorOk) petSay(`${petCall()}～今天的任務：帶我出去溜溜！走完可以換 3 個心動點數買零食喔！${w}`, { actions: '<button data-need="quest">帶你去溜溜</button><button data-need="later">等一下</button>' });
  else petSay(`${w || '今天'}我們在家一起動一動，完成就能換 3 個心動點數買零食！`, { actions: '<button data-go="activities">一起動一動</button><button data-need="later">等一下</button>' });
}
function startWalkQuest() { petQuiet(); go('walk'); }
// 完成任務：散步（或在家運動）結束時呼叫
function questComplete(kind) {
  const s = S.get(), q = s.pet.quest;
  if (!q || q.date !== S.dayKey() || q.done || q.type !== kind) return '';
  q.done = true; s.pet.bonus = (s.pet.bonus || 0) + 3; s.pet.love = (s.pet.love || 0) + 2; S.save(); addDiary('quest');
  return `今日任務完成！${petName()}得到 3 個心動點數，可以去小屋換零食囉！`;
}

// ---------- 夥伴的小需求：不定時邀約，永遠可以說「等一下」 ----------
const NEEDS = {
  hungry: () => petStats(S.get()).points >= 1
    ? { text: '肚子咕嚕咕嚕叫了～可以給我吃個點心嗎？', acts: '<button data-need="feed">給點心</button><button data-need="later">等一下</button>' }
    : { text: '肚子有點餓～我們一起動一動，賺點心好嗎？', acts: '<button data-go="activities">一起運動</button><button data-need="later">等一下</button>' },
  thirsty: () => ({ text: `好渴喔～${petCall()}，我們一起喝口水好不好？`, acts: '<button data-need="drink">一起喝水</button><button data-need="later">等一下</button>' }),
  walk: () => ({ text: '外面天氣不錯，好想出去散散步～', acts: '<button data-go="walk">帶我去</button><button data-need="later">今天不要</button>' }),
  stretch: () => ({ text: '坐好久了～我們一起伸個懶腰？', acts: '<button data-go="activities">好啊</button><button data-need="later">等一下</button>' }),
  chat: () => ({ text: `${petCall()}，今天過得好嗎？點我跟我說說話～`, acts: '<button data-need="retalk">跟你說</button><button data-need="later">等一下</button>' }),
};
function maybeNeed(force = false) {
  const s = S.get(), p = s.pet, el = roamEl();
  if (!s.profile.petType || el.hidden || run.listening || run.sayingSticky || document.hidden || $('.rem-pop') || !run.questOffered) return;
  const today = S.dayKey(), log = (p.needs || []).filter(x => x.d === today);
  if (!force && (log.length >= 8 || Date.now() - (p.lastNeed || 0) < 15 * 60000 || Math.random() > 0.4)) return;
  const h = new Date().getHours(), t = s.today;
  const pool = ['thirsty', 'hungry', 'chat'];
  if (t.allowed !== 'none') pool.push('stretch');
  if (t.allowed === 'standard' && h >= 7 && h < 18 && (!run.weatherAdvice || run.weatherAdvice.outdoor === 'good')) pool.push('walk');
  const k = pool[Math.floor(Math.random() * pool.length)], n = NEEDS[k]();
  p.lastNeed = Date.now(); p.needs = [...log, { d: today, k }]; S.save();
  petSay(n.text, { actions: n.acts });
}
setInterval(() => maybeNeed(), 45000);

document.addEventListener('click', e => {
  const b = e.target.closest('[data-need]'); if (!b) return;
  e.stopPropagation();
  const k = b.dataset.need, s = S.get();
  if (k === 'later') { petSay('好～那我們等一下再說！', { ms: 3000 }); return; }
  if (k === 'close') { petQuiet(); return; }
  if (k === 'type') { petType(); return; }
  if (k === 'quest') { startWalkQuest(); return; }
  if (k === 'stoplisten') { stopListening(); return; }
  if (k === 'retalk') { talkToPet(true); return; }
  if (k === 'drink') {
    s.drinks = s.drinks || []; s.drinks.push({ at: new Date().toISOString() }); S.save();
    petSay(`咕嚕咕嚕～好好喝！謝謝${petCall()}，你也喝到了嗎？`, { ms: 5000 }); petals(8); return;
  }
  if (k === 'feed') {
    const st = petStats(s); if (st.points < 1) { petSay('點數不夠了～我們一起動一動賺點心！', { actions: '<button data-go="activities">一起運動</button>' }); return; }
    s.pet.spent += 1; s.pet.treats += 1; S.save(); addDiary('feed', { trick: TRICKS.find(t => t.at === s.pet.treats)?.name });
    const learned = TRICKS.find(t => t.at === s.pet.treats);
    petSay(learned ? `好好吃！${PETS[s.profile.petType].sound} 我學會「${learned.name}」了！` : `好好吃！謝謝${petCall()}！${PETS[s.profile.petType].sound}`, { ms: 5000 }); petals(10);
  }
}, true);

// 每分鐘檢查一次提醒：到時間就在頁面最上方出現寵物提醒
setInterval(() => {
  if (document.hidden || $('.rem-pop') || !dueReminders(S.get()).length) return;
  const body = main().querySelector('.body'); const html = reminderPop();
  if (body && html) body.insertAdjacentHTML('afterbegin', html);
}, 60000);

// ---------- 啟動 ----------
setFont();
S.ensureToday();
// 從 LINE 打開時，自動改用手機瀏覽器開啟（LINE 支援 openExternalBrowser=1）
if (IN_LINE && !/openExternalBrowser=1/.test(location.search)) {
  const u = new URL(location.href); u.searchParams.set('openExternalBrowser', '1'); location.replace(u.toString());
}
const start = location.hash.slice(1);
const gotPlan = importPlanFromURL();
if (start === 'coach') go('coach');
else if (start === 'demo') { S.loadDemo(); setFont(); history.replaceState(null, '', location.pathname); go('today'); }
else if (!S.get().profile.screening.done) go('welcome');
else go(screens[start] && start !== 'coach' ? start : 'today');
if (gotPlan && run.planNew && S.get().profile.screening.done) setTimeout(() => { const p = S.get().plan; petSay(`${petCall()}，這是${planFrom(p)}幫你準備的居家動能保養計畫喔！一起做吧！`, { ms: 9000 }); }, 9000);

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
