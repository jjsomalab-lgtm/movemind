// 心動力 AI｜資料儲存（訪客模式：只存在這支手機的瀏覽器）
// 決審版改為 Firebase 雲端同步，資料結構維持相同（見 SPEC「資料模型」）。

const KEY = 'movemind.v1';

const blank = () => ({
  profile: {
    name: '',
    screening: { done: false, level: 'standard', flags: [], at: null, cleared: false, setupWith: null }, // level: 'seated' | 'assisted' | 'standard'
    contacts: [],          // [{ name, phone }]
    fontScale: 1,          // 1 | 1.25 | 1.5 | 2
    simple: false,         // 簡易模式：首頁只顯示最重要的三個按鈕
    voice: true,
    shareRoute: false,     // 是否保存完整散步路線（預設只存距離與時間）
    petType: null,         // 'dog' | 'cat' | 'turtle'
    petCall: '',           // 寵物怎麼稱呼主人，例如「阿嬤」
    petName: '',           // 主人幫寵物取的名字（空白＝預設名字）
    voiceName: '',         // 使用者選的朗讀聲音
    petFloat: true,        // 寵物在畫面上自由走動
    county: '',            // 所在縣市（用來查天氣，不用 GPS）
  },
  pet: { treats: 0, spent: 0, bonus: 0, love: 0, needsToday: 0, needsDate: '' },   // 心動夥伴：點心數、用掉的點數、小願望獎勵、親密度
  meditations: [],         // 靜坐 { at, minutes }
  petDiary: [],            // 寵物日記 { at, text }
  reminders: [],           // 生活提醒 { id, kind, label, time }
  reminderLog: {},         // { '2026-11-09_r1': 'done' | 'later' }
  today: { date: '', mood: null, check: null, allowed: null },
  sessions: [],            // { id, at, type:'home'|'walk', activityId, name, reps, minutes, km, route? }
  moods: [],               // { at, mood }
  fof: [],                 // 跌倒擔心度 { at, score }（0–10）
  breaths: [],             // 呼吸練習 { at, minutes }
  reads: [],               // 讀過的知識卡 id
  garden: { seeds: 1, water: 0, plots: [{ type: 'jasmine', stage: 0 }], unlocked: ['jasmine', 'osmanthus', 'magnolia', 'bougainvillea'], checkins: [], communityKm: 3.2, spirits: [] },
  chat: [],
  chatSession: '',         // 網頁聊天的對話代碼（讓 AI 記得前幾句），不含個人資料
  demo: false,
});

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return blank();
    const s = JSON.parse(raw);
    const b = blank();
    return { ...b, ...s, profile: { ...b.profile, ...s.profile }, garden: { ...b.garden, ...s.garden }, today: { ...b.today, ...s.today }, pet: { ...b.pet, ...(s.pet || {}) }, petDiary: s.petDiary || [] };
  } catch (e) {
    return blank();
  }
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* 儲存空間不足或被停用時，資料只保留到關閉頁面 */ }
}

export const get = () => state;

export function reset() {
  state = blank();
  save();
}

export const dayKey = (d = new Date()) => {
  const x = new Date(d);
  return `${x.getFullYear()}-${String(x.getMonth() + 1).padStart(2, '0')}-${String(x.getDate()).padStart(2, '0')}`;
};

// 每天第一次打開時，清空當天的心情與安全確認
export function ensureToday() {
  const k = dayKey();
  if (state.today.date !== k) {
    state.today = { date: k, mood: null, check: null, allowed: null };
    save();
  }
}

export function addSession(s) {
  state.sessions.push({ id: Date.now().toString(36), at: new Date().toISOString(), ...s });
  save();
}

export function setAfterMood(id) {
  const last = state.sessions[state.sessions.length - 1];
  if (last) { last.moodAfter = id; save(); }
}

export function addFof(score) {
  state.fof.push({ at: new Date().toISOString(), score });
  save();
}

export function setMood(mood) {
  state.today.mood = mood;
  state.moods.push({ at: new Date().toISOString(), mood });
  save();
}

// 過去 7 天（含今天）的統計
export function weekStats() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = dayKey(d);
    const ss = state.sessions.filter(s => dayKey(s.at) === k);
    const ms = state.moods.filter(m => dayKey(m.at) === k);
    days.push({
      key: k, label: '日一二三四五六'[d.getDay()],
      better: ss.filter(s => s.moodAfter === 'better').length,
      count: ss.length,
      km: ss.filter(s => s.type === 'walk').reduce((a, s) => a + (s.km || 0), 0),
      mood: ms.length ? ms[ms.length - 1].mood : null,
    });
  }
  const rated = state.sessions.filter(s => s.moodAfter && (Date.now() - new Date(s.at)) / 86400000 < 7);
  return {
    days,
    rated: rated.length,
    better: rated.filter(s => s.moodAfter === 'better').length,
    total: days.reduce((a, d) => a + d.count, 0),
    km: days.reduce((a, d) => a + d.km, 0),
    activeDays: days.filter(d => d.count > 0).length,
  };
}

// 載入一週展示資料（給初審展示用）
export function loadDemo() {
  state = blank();
  state.profile.name = '林阿姨';
  state.profile.screening = { done: true, level: 'standard', flags: [], at: new Date().toISOString(), cleared: false, setupWith: 'yes' };
  state.profile.contacts = [{ name: '女兒 小婷', phone: '0900000000' }];
  state.profile.petType = 'dog'; state.profile.petCall = '林阿姨'; state.profile.county = '高雄市';
  state.pet = { treats: 4, spent: 4, bonus: 6, love: 6, needsToday: 0, needsDate: '', items: ['rug', 'plant'] };
  state.petDiary = [
    { at: new Date(Date.now() - 2 * 864e5).toISOString(), text: '今天林阿姨帶我走了 1.1 公里，路上聞到好香的花！' },
    { at: new Date(Date.now() - 864e5).toISOString(), text: '林阿姨陪我做了「坐姿抬腿」，我跟著數數，好開心！' },
  ];
  state.reminders = [{ id: 'rdemo1', kind: 'med', label: '血壓藥（示範）', time: '08:00' }, { id: 'rdemo2', kind: 'water', label: '喝一口水', time: '10:00' }, { id: 'rdemo3', kind: 'move', label: '起來動一動', time: '15:00' }];
  const moods = ['ok', 'tired', 'good', 'ok', 'good', 'good'];
  const plan = [['seated-knee', 'home', 10], ['walk', 'walk', 0.8], ['seated-march', 'home', 20], ['sit-to-stand', 'home', 8], ['walk', 'walk', 1.1], ['arm-circle', 'home', 10]];
  for (let i = 6; i >= 1; i--) {
    const d = new Date(); d.setDate(d.getDate() - i); d.setHours(9, 30, 0, 0);
    const [id, type, v] = plan[6 - i];
    state.moods.push({ at: d.toISOString(), mood: moods[6 - i] });
    if (i === 4) continue; // 有一天休息
    const moodAfter = ['better', 'same', 'better', 'better', 'same', 'better'][6 - i];
    state.sessions.push(type === 'walk'
      ? { id: 'd' + i, at: d.toISOString(), type, name: '散步', km: v, minutes: Math.round(v * 15), moodAfter }
      : { id: 'd' + i, at: d.toISOString(), type, activityId: id, name: id, reps: v, minutes: 5, moodAfter });
  }
  [7, 6, 5].forEach((score, k) => {
    const d = new Date(); d.setDate(d.getDate() - (3 - k) * 7 + 1); d.setHours(10, 0, 0, 0);
    state.fof.push({ at: d.toISOString(), score });
  });
  state.garden = {
    seeds: 1, water: 0,
    plots: [
      { type: 'jasmine', stage: 3 }, { type: 'osmanthus', stage: 3 }, { type: 'magnolia', stage: 2 },
      { type: 'bougainvillea', stage: 1 },
    ],
    unlocked: ['jasmine', 'osmanthus', 'magnolia', 'bougainvillea'],
    checkins: [], communityKm: 6.4,
    spirits: [
      { id: 'jasmine', at: new Date(Date.now() - 5 * 864e5).toISOString(), where: '散步' },
      { id: 'osmanthus', at: new Date(Date.now() - 2 * 864e5).toISOString(), where: '散步' },
    ],
  };
  state.demo = true;
  save();
}

export function chatSession() {
  if (!state.chatSession) { state.chatSession = 'web-' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36); save(); }
  return state.chatSession;
}

export function addBreath(minutes) {
  state.breaths.push({ at: new Date().toISOString(), minutes });
  state.garden.water += 1; // 晨露：存起來，種新植物或下次成長時使用
  save();
}

export function markRead(id) {
  if (!state.reads.includes(id)) { state.reads.push(id); save(); }
}

// 參與點數：只會增加。活動 2 點、其他各 1 點
export function points() {
  return state.sessions.length * 2 + state.moods.length + state.breaths.length + (state.garden.spirits || []).length + state.reads.length;
}

export function earnedBadges() {
  const s = state, got = new Set();
  if (s.moods.length) got.add('first-mood');
  if (s.breaths.length) got.add('first-breath');
  if (s.sessions.some(x => x.type === 'home')) got.add('first-move');
  if (s.sessions.some(x => x.type === 'walk')) got.add('first-walk');
  if ((s.garden.spirits || []).length) got.add('first-spirit');
  if (s.reads.length >= 3) got.add('reader');
  if (s.sessions.length >= 10) got.add('ten-moves');
  const days = new Set([...s.sessions, ...s.breaths].filter(x => (Date.now() - new Date(x.at)) / 864e5 < 7).map(x => dayKey(x.at)));
  if (days.size >= 3) got.add('three-days');
  return got;
}
