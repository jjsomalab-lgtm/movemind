// 心動力 AI｜動腦遊戲館：擲筊抽運動籤、老台灣回憶卡、動腦猜一題（台語俗語・成語接龍）
// 原則（AGENTS.md）：先動才有得玩；不排名、不比較；規則是固定程式邏輯，不經過 AI；
// 籤詩是好玩的民俗小遊戲，不是算命，也不判斷身體狀況 — 抽到的活動一樣要先通過「活動前確認」。
// 插畫全部以 SVG 原創繪製，不使用任何品牌商標。資料只存在這支手機（store.js 的 games 欄位）。
import * as S from './store.js';
import * as C from './content.js';

let D; // app.js 傳進來的共用工具
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const shuffle = a => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
const INK = '#3B3A33', RED = '#C8432B', RED2 = '#9E2F1D', CREAM = '#FBF6EA';

export function games() {
  const s = S.get();
  if (!s.games) { s.games = { pts: 0, cards: [], fortune: null, quiz: { day: '', n: 0, idx: 0 } }; S.save(); }
  return s.games;
}
function addPts(n) { games().pts += n; S.save(); }

// 回憶卡：新手送 1 張，之後每完成一次居家活動或散步，就能再抽 1 張
export const cardsLeft = () => {
  const g = games();
  return Math.max(0, Math.min(C.MEMORY_CARDS.length, 1 + S.get().sessions.length) - g.cards.length);
};

// ---------- 插畫（原創 SVG，色鉛筆風：水彩底 + 抖動線 + 排線） ----------
const wrap = (inner, label) => `<svg class="gm-art" viewBox="0 0 200 160" role="img" aria-label="${esc(label)}">
  <rect width="200" height="160" rx="14" fill="${CREAM}"/>
  <ellipse cx="100" cy="146" rx="70" ry="8" fill="#8C7B5E" opacity=".18"/>
  <g stroke="${INK}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round" filter="url(#mmWobble)">${inner}</g></svg>`;
const ART = {
  cooker: () => wrap(`
    <path d="M52 70 Q52 58 64 56 H136 Q148 58 148 70 V122 Q148 136 132 138 H68 Q52 136 52 122 Z" fill="#CFE3C2"/>
    <path d="M52 70 Q52 58 64 56 H136 Q148 58 148 70 V122 Q148 136 132 138 H68 Q52 136 52 122 Z" fill="url(#mmHatch)" stroke="none"/>
    <path d="M58 56 Q100 22 142 56 Z" fill="#E8F0E0"/><rect x="92" y="28" width="16" height="10" rx="4" fill="#5E7D56"/>
    <path d="M44 78 h8 M148 78 h8" stroke-width="5"/><rect x="40" y="72" width="8" height="18" rx="3" fill="#5E7D56"/><rect x="152" y="72" width="8" height="18" rx="3" fill="#5E7D56"/>
    <rect x="84" y="112" width="32" height="14" rx="5" fill="${RED}"/><circle cx="100" cy="98" r="5" fill="#F3C266"/>`, '電鍋'),
  shop: () => wrap(`
    <rect x="34" y="52" width="132" height="86" fill="#F4E2BE"/>
    <path d="M28 52 L40 30 H160 L172 52 Z" fill="#E36F57"/>
    <path d="M52 30 L46 52 M74 30 L70 52 M96 30 L94 52 M118 30 L118 52 M140 30 L142 52" stroke="#FFF4E0" stroke-width="5"/>
    <rect x="70" y="58" width="60" height="16" rx="3" fill="${CREAM}"/>
    <text x="100" y="71" text-anchor="middle" font-size="12" font-weight="800" fill="${INK}" stroke="none" font-family="Noto Serif TC, serif">柑仔店</text>
    <rect x="34" y="108" width="132" height="30" fill="#B7834F"/>
    <path d="M52 108 v-20 q8 -6 16 0 v20 Z" fill="#F7E7A1"/><path d="M86 108 v-20 q8 -6 16 0 v20 Z" fill="#F6B8C8"/><path d="M120 108 v-20 q8 -6 16 0 v20 Z" fill="#BFE0C8"/>
    <circle cx="58" cy="100" r="3" fill="${RED}" stroke="none"/><circle cx="64" cy="96" r="3" fill="#F3C266" stroke="none"/><circle cx="92" cy="100" r="3" fill="#7BA7C9" stroke="none"/><circle cx="128" cy="99" r="3" fill="${RED}" stroke="none"/>`, '柑仔店'),
  tv: () => wrap(`
    <path d="M86 40 L66 14 M114 40 L134 14" stroke-width="3"/><circle cx="66" cy="14" r="4" fill="#9C9C94"/><circle cx="134" cy="14" r="4" fill="#9C9C94"/>
    <rect x="36" y="38" width="128" height="88" rx="12" fill="#A36B3E"/><rect x="36" y="38" width="128" height="88" rx="12" fill="url(#mmHatch)" stroke="none"/>
    <rect x="48" y="50" width="78" height="62" rx="12" fill="#9FA59C"/>
    <path d="M54 62 H120 M54 72 H120 M54 82 H120 M54 92 H120 M54 102 H120" stroke="#C9CEC5" stroke-width="1.6"/>
    <circle cx="146" cy="64" r="8" fill="#E6D3A8"/><circle cx="146" cy="90" r="8" fill="#E6D3A8"/><path d="M146 58 v6 M146 84 v6" stroke-width="2"/>
    <path d="M52 126 l-8 16 M148 126 l8 16" stroke-width="5"/>`, '黑白電視'),
  bento: () => wrap(`
    <ellipse cx="100" cy="92" rx="70" ry="44" fill="#C9CCC8"/><ellipse cx="100" cy="86" rx="62" ry="36" fill="#F7F3E8"/>
    <path d="M70 76 q24 -22 52 -2 q10 8 -4 16 q-26 12 -46 2 q-12 -6 -2 -16 Z" fill="#B5703A"/><path d="M78 80 q18 -10 34 0" stroke="#7A4421" stroke-width="2" fill="none"/>
    <ellipse cx="132" cy="96" rx="14" ry="11" fill="#FFFFFF"/><circle cx="132" cy="96" r="6" fill="#E9B23E"/>
    <path d="M64 100 q10 -6 18 2 q-8 8 -18 -2 Z" fill="#F2D24A"/><path d="M84 106 q10 -6 18 2 q-8 8 -18 -2 Z" fill="#F2D24A"/>
    <path d="M150 40 L176 132 M160 38 L184 128" stroke="#B7834F" stroke-width="4"/>`, '鐵路便當'),
  bike: () => wrap(`
    <circle cx="56" cy="110" r="30" fill="none" stroke-width="5"/><circle cx="148" cy="110" r="30" fill="none" stroke-width="5"/>
    <circle cx="56" cy="110" r="4" fill="${INK}"/><circle cx="148" cy="110" r="4" fill="${INK}"/>
    <path d="M56 110 L86 70 H132 L148 110 M86 70 L102 110 L132 70 M102 110 H148" fill="none" stroke="#2E3B33" stroke-width="5"/>
    <path d="M86 70 L80 56 H70 M80 56 H94" fill="none" stroke-width="4"/><path d="M132 70 L136 50 H150" fill="none" stroke-width="4"/>
    <rect x="34" y="72" width="42" height="8" rx="3" fill="#7A6A52"/><circle cx="102" cy="110" r="7" fill="#D9CDB2"/>`, '鐵馬'),
  radio: () => wrap(`
    <path d="M44 56 Q44 34 70 32 H130 Q156 34 156 56 V128 H44 Z" fill="#B3784A"/><path d="M44 56 Q44 34 70 32 H130 Q156 34 156 56 V128 H44 Z" fill="url(#mmHatch)" stroke="none"/>
    <rect x="58" y="48" width="84" height="44" rx="10" fill="#E8D6AE"/>
    <path d="M66 56 H134 M66 64 H134 M66 72 H134 M66 80 H134" stroke="#B59A6A" stroke-width="2"/>
    <rect x="58" y="100" width="56" height="16" rx="4" fill="#F7E7C0"/><path d="M66 104 v8 M74 104 v8 M82 104 v8 M90 104 v8 M98 104 v8 M106 104 v8" stroke-width="1.4"/><path d="M84 100 v16" stroke="${RED}" stroke-width="2.5"/>
    <circle cx="132" cy="108" r="9" fill="#E6D3A8"/>`, '收音機'),
  basin: () => wrap(`
    <path d="M24 74 Q100 50 176 74 Q170 132 100 136 Q30 132 24 74 Z" fill="#FFFFFF"/>
    <ellipse cx="100" cy="74" rx="76" ry="16" fill="#F7F7F2"/><ellipse cx="100" cy="74" rx="76" ry="16" fill="none" stroke="#3B6AA0" stroke-width="5"/>
    <g stroke="none"><circle cx="76" cy="104" r="11" fill="${RED}"/><circle cx="76" cy="104" r="4" fill="#F3C266"/><circle cx="124" cy="108" r="13" fill="#E05A44"/><circle cx="124" cy="108" r="5" fill="#F3C266"/><circle cx="100" cy="118" r="8" fill="${RED}"/>
    <path d="M86 98 q8 -10 18 -4 q-6 8 -18 4 Z M108 118 q10 -2 14 6 q-10 2 -14 -6 Z" fill="#6E9E58"/></g>`, '紅花臉盆'),
  soda: () => wrap(`
    <path d="M86 16 H114 V34 Q114 40 108 46 Q102 52 108 58 Q122 70 122 90 V136 Q122 142 116 142 H84 Q78 142 78 136 V90 Q78 70 92 58 Q98 52 92 46 Q86 40 86 34 Z" fill="#BFE3E6" fill-opacity=".85"/>
    <path d="M86 16 H114 V34 Q114 40 108 46 Q102 52 108 58 Q122 70 122 90 V136 Q122 142 116 142 H84 Q78 142 78 136 V90 Q78 70 92 58 Q98 52 92 46 Q86 40 86 34 Z" fill="url(#mmHatchLight)" stroke="none"/>
    <circle cx="100" cy="50" r="8" fill="#E8F4F5"/><path d="M96 46 q3 -3 6 0" stroke="#FFFFFF" stroke-width="2" fill="none"/>
    <rect x="80" y="96" width="40" height="22" fill="#4C8FC9"/><path d="M88 104 h24 M90 110 h20" stroke="#FFFFFF" stroke-width="2"/>
    <rect x="86" y="10" width="28" height="8" rx="3" fill="#E36F57"/>`, '彈珠汽水'),
  slipper: () => wrap(`
    <path d="M40 40 Q62 28 78 44 Q92 64 88 112 Q86 138 64 140 Q42 140 38 112 Q32 70 40 40 Z" fill="#FFFFFF"/>
    <path d="M44 78 Q62 54 82 78" fill="none" stroke="#2F64A8" stroke-width="10"/><path d="M62 60 v10" stroke="#2F64A8" stroke-width="6"/>
    <path d="M118 30 Q140 18 156 34 Q170 54 166 102 Q164 128 142 130 Q120 130 116 102 Q110 60 118 30 Z" fill="#FFFFFF"/>
    <path d="M122 68 Q140 44 160 68" fill="none" stroke="#2F64A8" stroke-width="10"/><path d="M140 50 v10" stroke="#2F64A8" stroke-width="6"/>`, '藍白拖'),
  pump: () => wrap(`
    <rect x="80" y="44" width="34" height="78" rx="6" fill="#5F9A6E"/><rect x="80" y="44" width="34" height="78" rx="6" fill="url(#mmHatch)" stroke="none"/>
    <path d="M80 60 H52 Q44 60 44 68 V74" fill="none" stroke="#5F9A6E" stroke-width="10"/>
    <path d="M114 50 L168 28" stroke="#4A7C57" stroke-width="7"/><circle cx="170" cy="27" r="6" fill="#4A7C57"/>
    <rect x="74" y="120" width="46" height="14" rx="3" fill="#8E8A80"/>
    <path d="M44 78 q-2 10 0 18 M48 80 q2 10 -1 18" stroke="#6FB1D6" stroke-width="3" fill="none"/>
    <path d="M26 110 H66 L62 140 H30 Z" fill="#BFC7C9"/><ellipse cx="46" cy="110" rx="20" ry="5" fill="#8CC7E2"/>`, '手壓抽水機'),
};
export const cardArt = id => (ART[id] || ART.cooker)();

// 筊杯：flat=平面朝上，round=凸面朝上
function jiao(face, cls = '') {
  const body = 'M6 50 Q70 -30 134 50 Q70 36 6 50 Z';
  const top = face === 'flat'
    ? `<path d="${body}" fill="#E8735A"/><path d="M22 42 Q70 0 118 42" fill="none" stroke="#F6B19D" stroke-width="3"/><path d="M34 40 Q70 12 106 40" fill="none" stroke="#F6B19D" stroke-width="2"/>`
    : `<path d="${body}" fill="${RED2}"/><path d="M28 30 Q60 4 98 12" fill="none" stroke="#E5856E" stroke-width="6" stroke-linecap="round" opacity=".8"/>`;
  return `<svg class="gm-jiao ${cls}" viewBox="0 0 140 56" aria-hidden="true"><g stroke="${INK}" stroke-width="2.4" stroke-linejoin="round">${top}<path d="${body}" fill="url(#mmHatch)" stroke="none"/></g></svg>`;
}
const JIAO_RESULT = {
  sheng: { faces: ['flat', 'round'], name: '聖筊', say: '是聖筊！今天的運動籤來了！' },
  xiao: { faces: ['flat', 'flat'], name: '笑筊', say: '是笑筊，哈哈，再擲一次！' },
  yin: { faces: ['round', 'round'], name: '陰筊', say: '是陰筊，沒關係，再擲一次！' },
};

// ---------- 遊戲館首頁 ----------
// 三個遊戲的入口方塊：放在「歡樂老街」頁面（app.js 的 screens.plaza）
export function gameTiles() {
  const g = games(), left = cardsLeft(), q = quizToday();
  const f = g.fortune && g.fortune.day === S.dayKey();
  return `
    <button class="gm-tile" data-gm="go:fortune">${jiao('flat', 'mini')}${jiao('round', 'mini')}<span><b>擲筊抽運動籤</b><span>${f ? '今天已經抽過籤，點進來再看一次' : '擲出聖筊，抽一支今日運動籤'}</span></span></button>
    <button class="gm-tile" data-gm="go:album"><span class="gm-tile-art">${cardArt('cooker')}</span><span><b>老台灣回憶卡</b><span>${left ? `有 ${left} 張卡可以抽！` : `已收集 ${g.cards.length} / ${C.MEMORY_CARDS.length} 張，動一動再抽`}</span></span></button>
    <button class="gm-tile" data-gm="go:quiz"><span class="gm-tile-q" aria-hidden="true">台</span><span><b>動腦猜一題</b><span>台語俗語・成語接龍${q.n ? `（今天猜了 ${q.n} 題）` : ''}</span></span></button>`;
}

// ---------- 擲筊抽運動籤 ----------
function fortuneScreen() {
  const g = games(), today = S.dayKey();
  if (!g.fortune || g.fortune.day !== today) g.fortune = { day: today, tries: 0, last: null, pick: null };
  const f = g.fortune;
  if (f.pick !== null) return poemScreen();
  const intro = '心裡想著：「今天想讓身體動一動。」然後按下面的按鈕擲筊。出現一平一凸的聖筊，就能抽一支今日運動籤。';
  const r = f.last ? JIAO_RESULT[f.last] : null;
  D.page('擲筊抽運動籤', `
    <div class="q-card"><p class="q">${esc(intro)}</p>${D.sayBtn(intro)}</div>
    <div class="gm-stage" id="jiaoStage">${r ? jiao(r.faces[0], 'l') + jiao(r.faces[1], 'r') : jiao('flat', 'l') + jiao('round', 'r')}</div>
    <p class="gm-result" id="jiaoMsg" aria-live="polite">${r ? `${r.name}：${r.say.replace(/^是[^！]*！/, '')}` : '準備好了嗎？'}</p>
    <button class="btn huge primary" data-gm="toss">擲筊</button>
    ${motionOK() ? '<p class="note">也可以拿穩手機，輕輕搖一搖來擲筊。</p>' : ''}
    <p class="note">這是好玩的民俗小遊戲，不是算命，也不代表身體狀況。運動前一樣會先做 3 題安全確認。</p>
  `, { back: 'plaza' });
  armShake();
  if (!r) D.speak(intro);
}
// Android 可以直接偵測搖動；iPhone 需要另外授權，所以只用按鈕
const motionOK = () => typeof DeviceMotionEvent !== 'undefined' && typeof DeviceMotionEvent.requestPermission !== 'function' && 'ondevicemotion' in window;
let shakeFn = null, tossing = false;
function armShake() {
  if (!motionOK() || shakeFn) return;
  let lastAt = 0;
  shakeFn = e => {
    if (!document.getElementById('jiaoStage')) { window.removeEventListener('devicemotion', shakeFn); shakeFn = null; return; }
    const a = e.accelerationIncludingGravity || {}; const m = Math.hypot(a.x || 0, a.y || 0, a.z || 0);
    if (m > 22 && Date.now() - lastAt > 2500) { lastAt = Date.now(); toss(); }
  };
  window.addEventListener('devicemotion', shakeFn);
}
function toss() {
  if (tossing) return;
  const g = games(), f = g.fortune; if (!f || f.pick !== null) return;
  tossing = true; f.tries += 1;
  // 第 3 次一定給聖筊：心意到了就好，不讓長輩失望
  const roll = Math.random();
  const res = f.tries >= 3 ? 'sheng' : roll < 0.5 ? 'sheng' : roll < 0.75 ? 'xiao' : 'yin';
  const stage = document.getElementById('jiaoStage'), msg = document.getElementById('jiaoMsg');
  if (stage) { stage.innerHTML = jiao('flat', 'l spin') + jiao('round', 'r spin'); }
  if (msg) msg.textContent = '擲筊中…';
  setTimeout(() => {
    const r = JIAO_RESULT[res]; f.last = res; S.save();
    if (stage) stage.innerHTML = jiao(r.faces[0], 'l land') + jiao(r.faces[1], 'r land');
    if (msg) msg.textContent = r.say;
    D.speak(r.say);
    tossing = false;
    if (res === 'sheng') {
      const allowed = S.get().today.allowed;
      let pool = C.FORTUNES.map((x, i) => i);
      if (allowed !== 'standard') pool = pool.filter(i => C.ACTIVITIES.find(a => a.id === C.FORTUNES[i].act).level === 'seated');
      f.pick = allowed === 'none' ? -1 : pool[Math.floor(Math.random() * pool.length)];
      addPts(C.GAME_POINTS.fortune);
      D.petals(14);
      setTimeout(() => { if (document.getElementById('jiaoStage')) poemScreen(); }, 1800);
    }
  }, 1300);
}
function poemScreen() {
  const f = games().fortune;
  const isRest = f.pick === -1 || S.get().today.allowed === 'none';
  const k = isRest ? C.FORTUNE_REST : C.FORTUNES[f.pick];
  const no = isRest ? '休息籤' : `第 ${['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'][f.pick]} 籤`;
  const text = `${no}。${k.lines.join('，')}。${k.msg}`;
  D.page('今日運動籤', `
    <article class="gm-poem">
      <p class="gm-poem-no">心動力・今日運動籤　${no}</p>
      <div class="gm-poem-lines">${k.lines.map(l => `<span>${esc(l)}</span>`).join('')}</div>
    </article>
    <div class="q-card"><p class="q">${esc(k.msg)}</p>${D.sayBtn(text)}</div>
    ${isRest
      ? '<button class="btn huge primary" data-go="breathe">做一分鐘呼吸練習</button><button class="btn" data-go="knowledge">讀一張健康小知識</button>'
      : `<button class="btn huge primary" data-planact="${k.act}">開始這個動作</button>
         <p class="note">${S.get().today.allowed ? '會依照今天的確認結果，安排適合你的版本。' : '開始前，會先回答 3 題安全確認。'}</p>`}
    <button class="btn ghost" data-go="plaza">回歡樂老街</button>
  `, { back: 'plaza' });
  D.speak(text);
}

// ---------- 老台灣回憶卡 ----------
function albumScreen() {
  const g = games(), left = cardsLeft();
  D.page('老台灣回憶卡', `
    <div class="q-card"><p class="q">每做完一次運動，就能抽一張回憶卡。猜猜看是什麼，再聽${esc(D.petName())}說故事。</p>${D.sayBtn(`每做完一次運動，就能抽一張回憶卡。猜猜看是什麼，再聽${D.petName()}說故事。`)}</div>
    ${left ? `<button class="btn huge primary" data-gm="draw">抽一張回憶卡（還有 ${left} 張）</button>` : `<button class="btn big soft" data-go="activities">動一動，再抽一張</button>`}
    <p class="gm-count">已收集 ${g.cards.length} / ${C.MEMORY_CARDS.length} 張</p>
    <div class="gm-album">${C.MEMORY_CARDS.map(c => g.cards.includes(c.id)
      ? `<button class="gm-card got" data-gm="story:${c.id}" aria-label="${esc(c.name)}，點一下聽故事">${cardArt(c.id)}<b>${esc(c.name)}</b></button>`
      : `<div class="gm-card locked" aria-label="還沒收集"><span>？</span></div>`).join('')}</div>
  `, { back: 'plaza' });
}
function drawCard() {
  const g = games(); if (!cardsLeft()) return albumScreen();
  const pool = C.MEMORY_CARDS.filter(c => !g.cards.includes(c.id));
  const c = pool[Math.floor(Math.random() * pool.length)];
  g.current = { id: c.id, order: shuffle([0, 1, 2]) }; S.save();
  guessScreen();
}
function guessScreen() {
  const g = games(), cur = g.current; if (!cur) return albumScreen();
  const c = C.MEMORY_CARDS.find(x => x.id === cur.id);
  const q = '這是什麼呢？';
  D.page('猜猜看', `
    <div class="gm-bigcard">${cardArt(c.id)}</div>
    <div class="q-card"><p class="q">${q}</p>${D.sayBtn(q + '答案有：' + cur.order.map(i => c.options[i]).join('、'))}</div>
    <div class="jr-choices">${cur.order.map(i => `<button class="btn big jr-choice" data-gm="guess:${i}">${esc(c.options[i])}</button>`).join('')}</div>
    ${D.canListen ? '<button class="btn soft big" data-gm="voice:card">🎤 用說的回答</button>' : ''}
  `, { back: 'album' });
  D.speak(q + '答案有：' + cur.order.map(i => c.options[i]).join('、'));
}
function answerCard(i) {
  const g = games(), cur = g.current; if (!cur) return;
  const c = C.MEMORY_CARDS.find(x => x.id === cur.id), right = c.options[i] === c.name;
  g.cards.push(c.id); g.current = null; addPts(right ? C.GAME_POINTS.cardRight : C.GAME_POINTS.cardTry);
  storyScreen(c.id, right ? `答對了！就是「${c.name}」。` : `答案是「${c.name}」，沒關係，又收集了一張！`);
  if (right) D.petals(12);
}
function storyScreen(id, head = '') {
  const c = C.MEMORY_CARDS.find(x => x.id === id);
  const text = `${head}${D.petName()}說：${c.story}`;
  D.page(c.name, `
    <div class="gm-bigcard">${cardArt(c.id)}</div>
    ${head ? `<p class="gm-result">${esc(head)}</p>` : ''}
    <div class="q-card"><p class="q"><b>${esc(D.petName())}說：</b>${esc(c.story)}</p>${D.sayBtn(text)}</div>
    <p class="note">你以前也用過、吃過嗎？可以跟家人或${esc(D.petName())}聊聊當年的故事。</p>
    <button class="btn big" data-go="chat">跟${esc(D.petName())}聊聊</button>
    <button class="btn ghost" data-gm="go:album">回到回憶卡</button>
  `, { back: 'album' });
  D.speak(text);
}

// ---------- 動腦猜一題（台語俗語・成語接龍） ----------
function quizToday() {
  const g = games(), k = S.dayKey();
  if (!g.quiz || g.quiz.day !== k) g.quiz = { day: k, n: 0, idx: (g.quiz && g.quiz.idx) || 0 };
  return g.quiz;
}
function nextQuestion() {
  const q = quizToday();
  const all = [...C.TAIYU_QUIZ.map((x, i) => ({ t: 'taiyu', i })), ...C.IDIOM_QUIZ.map((x, i) => ({ t: 'idiom', i }))];
  // 台語、成語交替出題，依序輪替，不重複
  const ty = all.filter(x => x.t === 'taiyu'), id = all.filter(x => x.t === 'idiom');
  const seq = []; for (let i = 0; i < Math.max(ty.length, id.length); i++) { if (ty[i]) seq.push(ty[i]); if (id[i]) seq.push(id[i]); }
  const pick = seq[q.idx % seq.length]; q.idx += 1;
  games().cur = { ...pick, order: shuffle([0, 1, 2]) }; S.save();
}
function quizScreen() {
  const g = games(); if (!g.cur) nextQuestion();
  const cur = games().cur, item = (cur.t === 'taiyu' ? C.TAIYU_QUIZ : C.IDIOM_QUIZ)[cur.i];
  const last = [...item.q].slice(-1)[0];
  const ask = cur.t === 'taiyu' ? `這句台語俗語是什麼意思？` : `「${item.q}」的最後一個字是「${last}」，哪一個成語可以接下去？`;
  const opts = cur.order.map(i => item.options[i]);
  D.page('動腦猜一題', `
    <p class="gm-kind">${cur.t === 'taiyu' ? '台語俗語' : '成語接龍'}</p>
    <div class="gm-phrase">${cur.t === 'taiyu' ? esc(item.q) : `${esc(item.q.slice(0, -1))}<em>${esc(last)}</em> → <em>${esc(last)}</em>？？？`}</div>
    <div class="q-card"><p class="q">${esc(ask)}</p>${D.sayBtn(`${cur.t === 'taiyu' ? item.q + '。' : ''}${ask}答案有：${opts.join('、')}`)}</div>
    <div class="jr-choices">${cur.order.map(i => `<button class="btn big jr-choice" data-gm="ans:${i}">${esc(item.options[i])}</button>`).join('')}</div>
    ${D.canListen ? '<button class="btn soft big" data-gm="voice:quiz">🎤 用說的回答</button>' : ''}
    ${backButton()}
  `, { back: D.run.quizBack ? 'act:gmBack' : 'plaza' });
  D.speak(`${cur.t === 'taiyu' ? item.q + '。' : ''}${ask}答案有：${opts.join('、')}`);
}
function answerQuiz(i) {
  const g = games(), cur = g.cur; if (!cur) return;
  const item = (cur.t === 'taiyu' ? C.TAIYU_QUIZ : C.IDIOM_QUIZ)[cur.i], right = i === item.answer;
  const q = quizToday(); q.n += 1; if (q.n <= C.GAME_POINTS.quizDailyMax) addPts(C.GAME_POINTS.quiz); else S.save();
  g.cur = null; S.save();
  const ans = item.options[item.answer];
  const msg = cur.t === 'taiyu'
    ? (right ? `答對了！「${item.q}」就是：${ans}。` : `答案是：${ans}。沒關係，又學會一句台語俗語！`)
    : (right ? `答對了！${item.q}，接${ans}！` : `答案是「${ans}」：${item.q}，接${ans}。下一題一定沒問題！`);
  D.page('動腦猜一題', `
    <div class="gm-phrase">${esc(cur.t === 'taiyu' ? item.q : `${item.q} → ${ans}`)}</div>
    <div class="q-card"><p class="q">${esc(msg)}</p>${D.sayBtn(msg)}</div>
    ${D.run.quizBack ? '' : '<button class="btn huge primary" data-gm="go:quiz">再猜一題</button>'}
    ${backButton(true)}
  `, { back: D.run.quizBack ? 'act:gmBack' : 'plaza' });
  D.speak(msg);
  if (right) D.petals(10);
}
// 從運動中途來玩的：玩完回到剛才的動作，次數保留
function backButton(primary = false) {
  const b = D.run.quizBack;
  if (!b) return '<button class="btn ghost" data-go="plaza">回歡樂老街</button>';
  return `<button class="btn ${primary ? 'huge primary' : 'ghost'}" data-gm="back">休息好了，繼續運動</button>`;
}
function goBack() {
  const b = D.run.quizBack; D.run.quizBack = null;
  if (b && b.id) { D.run.resume = { id: b.id, reps: b.reps }; return D.go('player', b.id); }
  D.go('plaza');
}

// 語音作答：比對說出來的字和每個選項有幾個字相同
async function voiceAnswer(kind) {
  const g = games();
  let opts, idxs;
  if (kind === 'card') { const c = C.MEMORY_CARDS.find(x => x.id === g.current?.id); if (!c) return; opts = c.options; idxs = g.current.order; }
  else { const cur = g.cur; if (!cur) return; opts = (cur.t === 'taiyu' ? C.TAIYU_QUIZ : C.IDIOM_QUIZ)[cur.i].options; idxs = cur.order; }
  D.speak('請說出你的答案。', { force: true });
  const t = await D.listenOnce();
  if (!t) { D.speak('沒有聽清楚，也可以直接按答案喔。'); return; }
  const score = o => [...new Set(o.replace(/[，、。]/g, ''))].filter(ch => t.includes(ch)).length;
  const best = idxs.map(i => ({ i, s: score(opts[i]) })).sort((a, b) => b.s - a.s)[0];
  if (!best || best.s < 2) { D.speak(`我聽到「${t}」，好像不是選項裡的答案。可以再說一次，或直接按答案。`); return; }
  return kind === 'card' ? answerCard(best.i) : answerQuiz(best.i);
}

function onClick(e) {
  const t = e.target.closest('[data-gm]'); if (!t) return;
  const [cmd, arg] = t.dataset.gm.split(':');
  switch (cmd) {
    case 'go': return D.go(arg === 'fortune' ? 'fortune' : arg === 'album' ? 'album' : arg === 'quiz' ? 'quiz' : 'plaza');
    case 'toss': return toss();
    case 'draw': return drawCard();
    case 'guess': return answerCard(Number(arg));
    case 'story': return storyScreen(arg);
    case 'ans': return answerQuiz(Number(arg));
    case 'voice': return voiceAnswer(arg);
    case 'back': return goBack();
  }
}

// 首頁小卡
export function homeCard() {
  const left = cardsLeft();
  return `<button class="gm-home" data-go="plaza">
    <span class="gm-home-pic" aria-hidden="true">${jiao('flat', 'mini')}${jiao('round', 'mini')}</span>
    <span><b>歡樂老街</b><span>${left ? `出門散步・有 ${left} 張回憶卡可以抽` : '出門散步・擲筊抽籤・回憶卡・猜一題'}</span></span>
  </button>`;
}
// 運動畫面上的「休息一下，猜一題」按鈕
export const restButton = () => '<button class="btn soft" data-act="gmRest">休息一下，猜一題台語俗語或成語</button>';

// app.js 啟動時呼叫：把畫面註冊到路由
export function registerGames(deps) {
  D = deps;
  Object.assign(deps.screens, { fortune: fortuneScreen, album: albumScreen, quiz: quizScreen });
  document.addEventListener('click', onClick);
}
export { goBack as gamesBack };
