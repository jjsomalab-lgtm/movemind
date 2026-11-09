// 語音朗讀（臺灣華語）與語音輸入
// 手機注意事項：
// 1. iPhone／部分 Android 必須「使用者先點過畫面」才允許發聲 → 第一次點擊時先解鎖
// 2. Chrome（Android）在 cancel() 後立刻 speak() 常常沒聲音 → 稍微延遲再說
// 3. 語音清單在手機上是延遲載入 → 等 voiceschanged 再選臺灣華語
import { get } from './store.js';

const ok = 'speechSynthesis' in window;
const IOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let voice = null, unlocked = false, timer = 0, heard = false;
export const voiceHeard = () => heard; // 手機真的發出過聲音（onstart 觸發）

// 挑選較自然的臺灣華語語音：優先「加強版／高品質」，其次 Google，再其次任何 zh-TW
function pickVoice() {
  if (!ok) return;
  const vs = speechSynthesis.getVoices();
  const tw = vs.filter(v => v.lang === 'zh-TW' || /zh[-_]TW|Taiwan|臺灣|台灣/i.test(v.lang + v.name));
  // 越自然的語音分數越高：Edge 的 Natural／Online（例：HsiaoChen）、iPhone 的高品質／加強版、Google
  const score = v => (/Natural|Neural|Online/i.test(v.name) ? 6 : 0) + (/Premium|高品質/i.test(v.name) ? 5 : 0) + (/Enhanced|加強/i.test(v.name) ? 4 : 0) + (/Google/i.test(v.name) ? 2 : 0) + (v.localService ? 0 : 1);
  const chosen = get().profile.voiceName && vs.find(v => v.name === get().profile.voiceName);
  voice = chosen || tw.sort((a, b) => score(b) - score(a))[0] || vs.find(v => v.lang.startsWith('zh')) || null;
}

// 說話風格：寵物可愛（音高略高），但語速接近真人
// 語速接近一般人講話、音調只比原聲高一點點，避免尖銳
const STYLE = { default: { rate: 0.96, pitch: 1.0 }, dog: { rate: 0.98, pitch: 1.05 }, cat: { rate: 0.96, pitch: 1.08 }, turtle: { rate: 0.9, pitch: 0.97 } };

if (ok) {
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
  // 手機發聲權限：iPhone 只承認 click／touchend 這類「完成的點擊」，touchstart、pointerdown 不算
  // 所以在這兩個事件上解鎖，並且一直嘗試到真的成功發聲為止
  const unlock = () => {
    if (heard || IOS) return; // iPhone 不使用無聲解鎖，改由「開啟語音」按鈕直接發聲
    try {
      speechSynthesis.resume();
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0; u.lang = 'zh-TW';
      speechSynthesis.speak(u);
      unlocked = true;
    } catch (e) { /* 忽略 */ }
  };
  document.addEventListener('touchend', unlock, { capture: true, passive: true });
  document.addEventListener('click', unlock, { capture: true });
}

export const canSpeak = 'speechSynthesis' in window;

export function speak(text, { force = false } = {}) {
  if (!ok || !text) return;
  if (!force && !get().profile.voice) return;
  clearTimeout(timer);
  if (!voice) pickVoice();
  text = String(text).replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}]/gu, '').replace(/[～~]/g, '，'); // 不唸表情符號；「～」改成自然停頓
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-TW';
  if (voice) u.voice = voice;
  const st = STYLE[get().profile.petType] || STYLE.default;
  const slow = get().profile.slowVoice ? 0.85 : 1;       // 設定裡可以選「說慢一點」
  u.rate = st.rate * slow; u.pitch = st.pitch;
  u.volume = 1;
  u.onstart = () => { heard = true; };
  const go = () => { try { speechSynthesis.resume(); speechSynthesis.speak(u); } catch (e) { /* 忽略 */ } };
  // iPhone：必須在點擊的「同一個瞬間」呼叫 speak，延遲就會被擋 → 沒有正在說話時立刻說
  // Chrome（Android）：cancel 後立刻 speak 常常無聲 → 只有需要打斷時才稍微延遲
  if (IOS && !heard) {                                   // iPhone 第一次發聲：必須在點擊當下、且前面不能先 cancel
    if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
    go();
  }
  else if (speechSynthesis.speaking || speechSynthesis.pending) { speechSynthesis.cancel(); timer = setTimeout(go, 80); }
  else go();
}

export function stopSpeaking() {
  clearTimeout(timer);
  if (ok) speechSynthesis.cancel();
}

// 給「設定 → 測試聲音」顯示的檢查結果
export function voiceStatus() {
  if (!ok) return '這個瀏覽器不支援語音朗讀。請改用手機內建的 Safari 或 Chrome 開啟（不要用 LINE 內建瀏覽器）。';
  pickVoice();
  const n = speechSynthesis.getVoices().length;
  if (!n) return '還沒載入語音，請再按一次「測試聲音」。如果一直沒有，請確認手機的「文字轉語音」設定。';
  if (!voice) return `找不到中文語音（共有 ${n} 種語音）。請到手機設定下載「中文（臺灣）」語音。`;
  return `使用語音：${voice.name}（${voice.lang}）。如果還是沒聲音，請檢查音量與靜音開關。`;
}

const Rec = window.SpeechRecognition || window.webkitSpeechRecognition;
export const canListen = !!Rec;

// 聽一句話，回傳文字；不支援或失敗時回傳 null
export function listenOnce() {
  return new Promise(resolve => {
    if (!Rec) return resolve(null);
    const r = new Rec();
    r.lang = 'zh-TW';
    r.interimResults = false;
    r.maxAlternatives = 1;
    let done = false;
    r.onresult = e => { done = true; resolve(e.results[0][0].transcript); };
    r.onerror = () => { if (!done) resolve(null); };
    r.onend = () => { if (!done) resolve(null); };
    try { r.start(); } catch (e) { resolve(null); }
  });
}

// 由使用者點擊觸發的測試：2.5 秒內有發聲就回傳 true
export function speakTest(text) {
  return new Promise(resolve => {
    if (!ok) return resolve(false);
    speak(text, { force: true });
    const t0 = Date.now();
    const chk = () => { if (heard) return resolve(true); if (Date.now() - t0 > 2500) return resolve(false); setTimeout(chk, 150); };
    chk();
  });
}

// iPhone 靜音開關：先播放一段極短的「無聲」音檔，把聲音切到「媒體播放」通道，
// 讓靜音開關打開時也比較有機會聽到朗讀（需在使用者點擊當下呼叫）
let mediaUnlocked = false;
export function unlockMediaChannel() {
  if (mediaUnlocked) return;
  try {
    const sr = 8000, n = 800, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
    const w = (o, str) => [...str].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
    w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
    v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
    const a = new Audio(URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })));
    a.setAttribute('playsinline', ''); a.volume = 0.01;
    const p = a.play(); if (p && p.catch) p.catch(() => {});
    mediaUnlocked = true;
  } catch (e) { /* 忽略 */ }
}

// 點一下就開始聽，說完自動停止（比「按住不放」更適合長輩）；回傳 { text } 或 { error }
let liveRec = null;
export function listenTap({ onInterim } = {}) {
  return new Promise(resolve => {
    if (!Rec) return resolve({ error: 'unsupported' });
    stopSpeaking(); // 夥伴正在說話時會干擾麥克風，先停下來
    let text = '', done = false, gotSpeech = false;
    const fin = r => { if (done) return; done = true; liveRec = null; resolve(r); };
    try {
      const r = new Rec(); liveRec = r;
      r.lang = 'zh-TW'; r.interimResults = true; r.continuous = IOS; r.maxAlternatives = 1;
      let silence = 0;
      r.onresult = e => { let t = ''; for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript; text = t; gotSpeech = true; onInterim?.(t);
        clearTimeout(silence); silence = setTimeout(() => { try { r.stop(); } catch (er) { /* 忽略 */ } }, 1800); };
      r.onerror = e => fin(text.trim() ? { text: text.trim() } : { error: e.error || 'unknown' });
      r.onend = () => fin(text.trim() ? { text: text.trim() } : { error: gotSpeech ? 'empty' : 'no-speech' });
      r.start();
      setTimeout(() => { try { r.stop(); } catch (e) { /* 忽略 */ } }, 12000); // 最多聽 12 秒
    } catch (e) { fin({ error: 'start-failed' }); }
  });
}
export function stopListening() { try { liveRec?.stop(); } catch (e) { /* 忽略 */ } }

// 讓長輩看得懂的失敗原因
export function listenErrorText(err) {
  const ios = IOS;
  if (ios && (err === 'no-speech' || err === 'empty' || err === 'service-not-allowed' || err === 'audio-capture')) return '這支 iPhone 的網頁語音辨識沒有反應。請改用打字，並按鍵盤左下角的🎤用說的（需在「設定 → 一般 → 鍵盤」開啟「啟用聽寫」）。';
  return {
    'not-allowed': ios ? '需要麥克風權限：請到 iPhone「設定 → Safari → 麥克風」選「允許」，再重新整理。' : '需要麥克風權限：請點網址列左邊的鎖頭，把「麥克風」改成允許。',
    'service-not-allowed': '這支 iPhone 的「聽寫」沒有開：請到「設定 → 一般 → 鍵盤」，打開「啟用聽寫」。',
    'no-speech': '我沒聽到聲音耶～靠近手機一點，點我之後直接說就好。',
    'empty': '聽到聲音了，但沒聽清楚，再說一次好嗎？',
    'network': '語音辨識需要網路，請確認網路後再試一次。',
    'audio-capture': '找不到麥克風，請確認沒有其他 APP 正在使用麥克風。',
    'unsupported': '這個瀏覽器不能用說的，請改用打字，或用手機鍵盤上的麥克風。',
  }[err] || '這次沒聽清楚，再試一次，或改用打字也可以。';
}

// 可選的中文語音清單（設定頁讓使用者挑最順耳的聲音）
export function listVoices() {
  if (!ok) return [];
  return speechSynthesis.getVoices().filter(v => /^zh/i.test(v.lang)).map(v => ({ name: v.name, lang: v.lang }));
}
export const refreshVoice = () => pickVoice();

// 正在說話嗎？（給寵物排隊用，避免系統提示和寵物互搶）
export const isSpeaking = () => ok && (speechSynthesis.speaking || speechSynthesis.pending);
export function whenIdle(maxMs = 15000) {
  return new Promise(res => { const t0 = Date.now(); const chk = () => (!isSpeaking() || Date.now() - t0 > maxMs) ? res() : setTimeout(chk, 200); chk(); });
}
