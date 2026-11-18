// 心動力 AI｜迺台灣：動起來得骰子 → 擲骰遊台灣 → 每站一張動腦卡 → 心動點數與紀念品
// 規則全部是固定程式邏輯，不經過 AI。資料只存在這支手機（store.js 的 journey 欄位）。
// 依 AGENTS.md：不做排行榜、不比較長輩之間的成績；不斷簽懲罰；雙任務只給今天確認通過的人、而且全部坐著做。
import * as S from './store.js';
import * as C from './content.js';
import { stopArt, stamp, dieSVG, postcard, PAPER_FILTER, INK, PAPER, BRICK, TEAL, MUSTARD, SAGE } from './journeyArt.js';

const STOPS = C.JOURNEY_STOPS;
const blankJourney = () => ({ pos: 0, used: 0, visited: [0], items: [], pts: 0, turns: 0, history: [], card: null, roll: null, last: null });

export function journey() {
  const s = S.get();
  if (!s.journey) { s.journey = blankJourney(); S.save(); }
  return s.journey;
}

// 已賺到的骰子：新手禮 + 每次居家活動／散步 + 每次靜坐
export function diceEarned() {
  const s = S.get();
  return C.JOURNEY_STARTER_DICE + s.sessions.length + (s.meditations || []).length;
}
export const diceLeft = () => Math.max(0, diceEarned() - journey().used);

let D; // app.js 傳進來的共用工具
const esc = t => String(t ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const appURL = () => location.origin + location.pathname;

// ---------- 地圖 ----------
const LAND = 'M172 20 C193 36 199 55 194 80 C214 91 210 112 199 131 C190 156 185 181 188 207 C199 240 226 257 226 286 C227 316 206 348 194 377 C181 404 167 423 160 452 C156 484 172 501 161 529 C148 536 134 510 127 484 C112 465 106 445 102 426 C82 398 85 378 72 355 C65 330 68 307 75 286 C68 262 76 235 81 209 C83 176 100 148 108 126 C115 104 131 86 139 61 C148 38 160 24 172 20 Z';
function routePath() {
  const p = STOPS.map(s => [s.x, s.y]);
  return 'M' + p.map(([x, y]) => `${x} ${y}`).join(' L');
}
function mapSVG(j) {
  const cur = STOPS[j.pos];
  const pet = S.get().profile.petType;
  const petMark = pet && D.petSVG ? `<foreignObject x="${cur.x - 26}" y="${cur.y - 64}" width="52" height="52"><div xmlns="http://www.w3.org/1999/xhtml" class="jr-pet">${D.petSVG(pet, 52)}</div></foreignObject>` : '';
  const waves = Array.from({ length: 9 }, (_, i) => { const y = 90 + i * 52, x = i % 2 ? 236 : 20; return `<path d="M${x} ${y}c6-4 10 4 16 0s10 4 16 0" />`; }).join('');
  return `<svg class="jr-map" viewBox="0 0 300 560" role="img" aria-label="迺台灣地圖：目前在 ${esc(cur.name)}，已經到過 ${j.visited.length} 站">
    <defs>${PAPER_FILTER}</defs>
    <rect width="300" height="560" rx="18" fill="#E4EEE6"/>
    <rect width="300" height="560" rx="18" fill="#000" filter="url(#jrPaper)"/>
    <g fill="none" stroke="${TEAL}" stroke-width="1.6" stroke-linecap="round" opacity=".45">${waves}</g>
    <path d="${LAND}" fill="${SAGE}" transform="translate(4 5)"/>
    <path d="${LAND}" fill="#F3EAD3" stroke="${INK}" stroke-width="2.2" stroke-linejoin="round"/>
    <path d="M150 120c10 40 8 90 18 140s20 90 4 150" fill="none" stroke="${SAGE}" stroke-width="7" stroke-linecap="round" opacity=".55"/>
    <path d="${routePath()}" fill="none" stroke="${BRICK}" stroke-width="2.4" stroke-dasharray="2 6" stroke-linecap="round" stroke-linejoin="round"/>
    ${STOPS.map((s, i) => {
      const here = i === j.pos, been = j.visited.includes(i);
      return `<g transform="translate(${s.x} ${s.y})"><circle r="${here ? 15 : 12}" fill="${here ? MUSTARD : been ? '#FFF8EA' : PAPER}" stroke="${here || been ? BRICK : INK}" stroke-width="${here ? 3 : 1.8}" ${been || here ? '' : 'stroke-dasharray="3 3"'}/><text text-anchor="middle" y="4.5" font-size="12.5" font-weight="800" fill="${INK}" font-family="Noto Serif TC, Noto Serif CJK TC, Songti TC, serif">${i + 1}</text></g>`;
    }).join('')}
    ${petMark}
    <g transform="translate(16 440)"><text font-size="20" font-weight="900" fill="${INK}" font-family="Noto Serif TC, Noto Serif CJK TC, Songti TC, serif">迺台灣</text><text y="18" font-size="10" fill="${INK}" letter-spacing="2" opacity=".75">SLOW TRIP · TAIWAN</text></g>
    <g transform="translate(258 66)" stroke="${INK}" stroke-width="1.4" fill="none"><circle r="14"/><path d="M0 -12 4 0 0 12 -4 0z" fill="${BRICK}"/><text y="-17" text-anchor="middle" font-size="9" fill="${INK}" stroke="none">北</text></g>
    <text x="226" y="540" font-size="11" fill="${TEAL}" letter-spacing="3" font-family="Noto Serif TC, Noto Serif CJK TC, Songti TC, serif">太平洋</text>
    <text x="14" y="300" font-size="11" fill="${TEAL}" letter-spacing="3" font-family="Noto Serif TC, Noto Serif CJK TC, Songti TC, serif" transform="rotate(-90 14 300)">臺灣海峽</text>
  </svg>`;
}

// ---------- 畫面 ----------
function mapScreen() {
  const j = journey(), left = diceLeft(), cur = STOPS[j.pos];
  const tour = j.visited.length;
  const head = left > 0 ? `你有 ${left} 顆骰子，擲骰出發吧！` : '骰子用完了。做一次活動、散步或靜坐，就能再得到 1 顆骰子。';
  D.page('迺台灣', `
    <section class="jr-head">
      <div><p class="eyebrow">動起來就得骰子</p><h2 class="jr-title">${esc(D.petName())}帶你迺台灣</h2></div>
      <div class="jr-badges"><span class="jr-badge" aria-label="骰子 ${left} 顆">${dieSVG(1, 26)} ${left}</span><span class="jr-badge gold">點數 ${S.points()}</span></div>
    </section>
    <div class="q-card"><p class="q">${esc(head)}</p>${D.sayBtn(head)}</div>
    <div class="jr-map-wrap">${mapSVG(j)}</div>
    <p class="jr-here">現在在：<b>${esc(cur.name)}</b>　已到過 ${tour} / ${STOPS.length} 站</p>
    ${left > 0
      ? `<button class="btn primary huge" data-jr="roll">擲骰出發</button>`
      : `<button class="btn primary huge" data-go="activities">在家動一動，得到骰子</button><button class="btn soft big" data-go="walk">出門散步，也能得到骰子</button>`}
    <div class="grid2">
      <button class="btn soft big" data-jr="book">紀念章本</button>
      <button class="btn soft big" data-jr="shop">兌換站</button>
    </div>
    <button class="btn line-btn big" data-jr="invite">邀家人朋友一起迺台灣（LINE）</button>
    <p class="note">每次前進 1–3 站，沒有輸贏、不會扣分。每站有一張 1 分鐘的動腦小卡，答錯也有點數。</p>
  `, { back: 'today' });
  D.speak(head);
}

function rollScreen() {
  const j = journey(), r = j.roll;
  if (!r) return D.go('journey');
  const to = STOPS[r.to];
  const msg = `擲出 ${r.n} 點！${D.petName()}帶你來到「${to.name}」。${to.story}`;
  D.page('擲骰子', `
    <div class="jr-dice" aria-hidden="true"><span class="jr-die">${dieSVG(r.n, 104)}</span></div>
    <div class="q-card"><p class="q">${esc(msg)}</p>${D.sayBtn(msg)}</div>
    <div class="jr-map-wrap small">${mapSVG(j)}</div>
    <button class="btn primary huge" data-jr="card">打開這一站的小卡</button>
  `, { back: 'journey' });
  D.speak(msg);
}

function pickCardType(j) {
  const allowed = ['seated', 'standard'].includes(S.get().today.allowed); // 今天的安全確認通過（坐姿或一般）
  const order = ['quiz', 'memory', 'dual'];
  let t = order[j.turns % 3];
  if (t === 'dual' && !allowed) t = 'quiz'; // 今天沒有通過安全確認：不出動身體的卡
  return t;
}

function cardScreen() {
  const j = journey(), c = j.card;
  if (!c) return D.go('journey');
  const stop = STOPS[c.stop];
  if (c.type === 'quiz') {
    const q = stop.quiz;
    const text = `${stop.name}的小問題：${q.q}`;
    D.page('動腦小卡', `
      ${postcard(stop, '懷舊問答')}
      <div class="q-card"><p class="q">${esc(q.q)}</p>${D.sayBtn(text + '答案有：' + q.options.join('、'))}</div>
      <div class="jr-choices">${c.order.map(i => `<button class="btn big jr-choice" data-jrq="${i}">${esc(q.options[i])}</button>`).join('')}</div>
      <button class="btn ghost" data-jr="skip">跳過這張卡</button>
    `, { back: 'journey' });
    D.speak(text);
    return;
  }
  if (c.type === 'memory') {
    const text = '翻翻看，找出兩張一樣的卡片。慢慢來，沒有時間限制。';
    const done = c.matched.length === c.deck.length;
    D.page('動腦小卡', `
      ${postcard(stop, '記憶翻牌')}
      <div class="q-card"><p class="q">${esc(text)}</p>${D.sayBtn(text)}</div>
      <div class="jr-memory">${c.deck.map((w, i) => {
        const open = c.open.includes(i) || c.matched.includes(i);
        return `<button class="jr-mcard ${open ? 'open' : ''} ${c.matched.includes(i) ? 'got' : ''}" data-jrm="${i}" aria-label="${open ? esc(w) : `第 ${i + 1} 張，蓋著`}">${open ? esc(w) : '？'}</button>`;
      }).join('')}</div>
      <p class="jr-here">已找到 ${c.matched.length / 2} / ${c.deck.length / 2} 對</p>
      ${done ? '<button class="btn primary huge" data-jr="memoryDone">全部找到了！領點數</button>' : '<button class="btn ghost" data-jr="skip">跳過這張卡</button>'}
    `, { back: 'journey' });
    if (!c.spoke) { D.speak(text); c.spoke = true; }
    return;
  }
  // 雙任務：坐著做
  const d = C.JOURNEY_DUAL[c.dual];
  const text = `${d.title}。${d.how}慢慢來，覺得不舒服就停下來。`;
  D.page('動腦小卡', `
    ${postcard(stop, '邊動邊動腦')}
    <div class="q-card"><p class="q">${esc(d.title)}</p><p class="jr-how">${esc(d.how)}</p>${D.sayBtn(text)}</div>
    <p class="note strong">全程坐著做，速度自己決定。覺得不舒服就停下來，按右上角「不舒服」。</p>
    <button class="btn primary huge" data-jr="dualDone">我做完了</button>
    <button class="btn soft big" data-jr="dualSwap">換成問答小卡（不用動）</button>
    <button class="btn ghost" data-jr="skip">跳過這張卡</button>
  `, { back: 'journey' });
  D.speak(text);
}

function rewardScreen() {
  const j = journey(), r = j.last;
  if (!r) return D.go('journey');
  const stop = STOPS[r.stop];
  const lines = [r.headline, `得到 ${r.pts} 個心動點數。`];
  if (r.item) lines.push(`第一次來到${stop.name}，蓋到紀念章，收集到「${stop.item}」，還送你 1 顆花園種子！`);
  const msg = lines.join('');
  D.page('這一站完成了', `
    <div class="jr-reward">
      <div class="jr-reward-icon">${r.item ? stamp(stop, 150, { rot: -8 }) : stopArt(stop.id, 96)}</div>
      <p class="lead">${esc(r.headline)}</p>
      ${r.tip ? `<p class="jr-tip">💡 ${esc(r.tip)}</p>` : ''}
      <p class="jr-pts">＋${r.pts} 心動點數</p>
      ${r.item ? `<p class="jr-item">蓋到「${esc(stop.name)}」紀念章，收藏「<b>${esc(stop.item)}</b>」　＋1 顆花園種子</p>` : ''}
      ${D.sayBtn(msg)}
    </div>
    <button class="btn line-btn big" data-jr="share">分享到 LINE：「我到${esc(stop.name.split('・')[0])}了！」</button>
    ${diceLeft() > 0 ? `<button class="btn primary huge" data-jr="roll">再擲一次（還有 ${diceLeft()} 顆）</button>` : `<button class="btn primary huge" data-go="activities">動一動，得到下一顆骰子</button>`}
    <button class="btn soft big" data-go="journey">回地圖</button>
  `, { back: 'journey' });
  D.petals?.();
  D.speak(msg);
}

function bookScreen() {
  const j = journey();
  const msg = `你已經蓋了 ${j.items.length} 個紀念章，一共有 ${STOPS.length} 站。`;
  D.page('紀念章本', `
    <div class="q-card"><p class="q">已蓋 ${j.items.length} / ${STOPS.length} 個紀念章</p>${D.sayBtn(msg)}</div>
    <div class="jr-book">${STOPS.map((s, i) => {
      const got = j.items.includes(s.id);
      return `<div class="jr-book-item ${got ? 'got' : ''}">${stamp(s, 112, { faded: !got, rot: got ? [-7, 5, -3, 8][i % 4] : 0 })}<b>${got ? esc(s.item) : '還沒來過'}</b></div>`;
    }).join('')}</div>
    ${j.history.length ? `<p class="note">最近走過：${j.history.slice(-6).map(esc).join(' → ')}</p>` : ''}
    <button class="btn primary big" data-go="journey">回地圖</button>
  `, { back: 'journey' });
  D.speak(msg);
}

function shopScreen() {
  const pts = S.points();
  const msg = `你現在有 ${pts} 個心動點數。兌換站會在試辦合作店家開放後啟用，點數會一直保留。`;
  D.page('兌換站', `
    <div class="q-card"><p class="q">⭐ 我的心動點數：${pts}</p>${D.sayBtn(msg)}</div>
    <div class="jr-shop">${C.JOURNEY_REWARDS.map(r => `<div class="jr-shop-item"><div><b>${esc(r.name)}</b><span>${esc(r.note)}</span></div><span class="jr-cost">${r.cost} 點</span></div>`).join('')}</div>
    <p class="note strong">試辦合作店家開放後才能兌換，目前先累積點數，不會過期。</p>
    <p class="note">心動點數也可以在${esc(D.petName())}的小屋換零食；換零食會用掉點數。</p>
    <button class="btn primary big" data-go="journey">回地圖</button>
  `, { back: 'journey' });
  D.speak(msg);
}

// ---------- 動作 ----------
function shuffle(a) { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const k = Math.floor(Math.random() * (i + 1)); [b[i], b[k]] = [b[k], b[i]]; } return b; }

function doRoll() {
  const j = journey();
  if (diceLeft() < 1) return D.go('journey');
  const n = 1 + Math.floor(Math.random() * 3);
  const to = (j.pos + n) % STOPS.length;
  j.used += 1; j.turns += 1; j.pos = to;
  if (!j.visited.includes(to)) j.visited.push(to);
  j.history = [...j.history, STOPS[to].name].slice(-30);
  j.roll = { n, to };
  const type = pickCardType(j);
  j.card = { stop: to, type };
  if (type === 'quiz') j.card.order = shuffle([0, 1, 2]);
  if (type === 'memory') { j.card.deck = shuffle([...STOPS[to].pairs, ...STOPS[to].pairs]); j.card.open = []; j.card.matched = []; }
  if (type === 'dual') j.card.dual = j.turns % C.JOURNEY_DUAL.length;
  S.save();
  D.go('journeyRoll');
}

function finish(pts, headline, tip) {
  const j = journey(), stop = j.card ? j.card.stop : j.pos;
  const first = !j.items.includes(STOPS[stop].id);
  j.pts += pts;
  if (first) { j.items.push(STOPS[stop].id); S.get().garden.seeds += 1; }
  j.last = { stop, pts, headline, tip, item: first };
  j.card = null; j.roll = null;
  S.save();
  D.go('journeyReward');
}

function memoryFlip(i) {
  const c = journey().card;
  if (!c || c.type !== 'memory' || c.busy || c.open.includes(i) || c.matched.includes(i)) return;
  c.open.push(i);
  if (c.open.length === 2) {
    const [a, b] = c.open;
    if (c.deck[a] === c.deck[b]) { c.matched.push(a, b); c.open = []; D.speak(`找到了，${c.deck[a]}！`); }
    else { c.busy = true; setTimeout(() => { c.open = []; c.busy = false; cardScreen(); }, 1100); }
  }
  S.save();
  cardScreen();
}

function shareStop() {
  const j = journey(), r = j.last, stop = STOPS[r ? r.stop : j.pos];
  const text = `【心動力 迺台灣】我和${D.petName()}到了「${stop.name}」，${r && r.item ? `收集到「${stop.item}」！` : '又完成一站！'}動一動就能擲骰子遊台灣，一起來玩：${appURL()}`;
  window.open(D.lineURL(text), '_blank', 'noopener');
}
function invite() {
  const text = `【心動力 迺台灣】我在玩「動一動就能擲骰子遊台灣」，已經走到第 ${journey().visited.length} 站了！免下載、免註冊，一起來：${appURL()}`;
  window.open(D.lineURL(text), '_blank', 'noopener');
}

function onClick(e) {
  const t = e.target.closest('[data-jr],[data-jrq],[data-jrm]');
  if (!t) return;
  const j = journey();
  if (t.dataset.jrq !== undefined) {
    const c = j.card; if (!c) return;
    const q = STOPS[c.stop].quiz, pick = Number(t.dataset.jrq);
    const right = pick === q.answer;
    return finish(right ? C.JOURNEY_POINTS.quizRight : C.JOURNEY_POINTS.quizTry, right ? `答對了！就是「${q.options[q.answer]}」。` : `答案是「${q.options[q.answer]}」，沒關係，又多知道一件事！`, q.tip);
  }
  if (t.dataset.jrm !== undefined) return memoryFlip(Number(t.dataset.jrm));
  switch (t.dataset.jr) {
    case 'roll': return doRoll();
    case 'card': return D.go('journeyCard');
    case 'skip': return finish(1, '這張卡先跳過，下次再玩。', '');
    case 'memoryDone': return finish(C.JOURNEY_POINTS.memory, '全部配對成功，記性真好！', '');
    case 'dualDone': return finish(C.JOURNEY_POINTS.dual, '邊動邊動腦，完成了！身體和頭腦都活動到了。', '');
    case 'dualSwap': { j.card.type = 'quiz'; j.card.order = shuffle([0, 1, 2]); S.save(); return cardScreen(); }
    case 'book': return D.go('journeyBook');
    case 'shop': return D.go('journeyShop');
    case 'share': return shareStop();
    case 'invite': return invite();
  }
}

// app.js 啟動時呼叫：把畫面註冊到路由
export function registerJourney(deps) {
  D = deps;
  Object.assign(deps.screens, { journey: mapScreen, journeyRoll: rollScreen, journeyCard: cardScreen, journeyReward: rewardScreen, journeyBook: bookScreen, journeyShop: shopScreen });
  document.addEventListener('click', onClick);
}

// 首頁小卡
export function homeCard(petName) {
  const left = diceLeft(), j = journey();
  return `<button class="jr-home" data-go="journey">
    <span class="jr-home-die" aria-hidden="true">${dieSVG(3, 56)}</span>
    <span><b>迺台灣</b><span>${left > 0 ? `你有 ${left} 顆骰子，帶${esc(petName)}出發！` : `已到過 ${j.visited.length} 站，動一動得骰子`}</span></span>
  </button>`;
}
