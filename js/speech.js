// 語音朗讀（臺灣華語）與語音輸入
// 手機注意事項：
// 1. iPhone／部分 Android 必須「使用者先點過畫面」才允許發聲 → 第一次點擊時先解鎖
// 2. Chrome（Android）在 cancel() 後立刻 speak() 常常沒聲音 → 稍微延遲再說
// 3. 語音清單在手機上是延遲載入 → 等 voiceschanged 再選臺灣華語
import { get } from './store.js';

const ok = 'speechSynthesis' in window;
let voice = null, unlocked = false, timer = 0, heard = false;
export const voiceHeard = () => heard; // 手機真的發出過聲音（onstart 觸發）

function pickVoice() {
  if (!ok) return;
  const vs = speechSynthesis.getVoices();
  voice = vs.find(v => v.lang === 'zh-TW') || vs.find(v => /zh[-_]TW|Taiwan/i.test(v.lang + v.name))
    || vs.find(v => v.lang.startsWith('zh')) || null;
}

if (ok) {
  pickVoice();
  speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
  // 第一次點擊畫面時，用一段無聲的語音「解鎖」手機的發聲權限
  const unlock = () => {
    if (unlocked) return;
    unlocked = true;
    try {
      const u = new SpeechSynthesisUtterance(' ');
      u.volume = 0; u.lang = 'zh-TW';
      speechSynthesis.speak(u);
    } catch (e) { /* 忽略 */ }
  };
  document.addEventListener('pointerdown', unlock, { once: true, capture: true });
  document.addEventListener('touchstart', unlock, { once: true, capture: true });
}

export const canSpeak = 'speechSynthesis' in window;

export function speak(text, { force = false } = {}) {
  if (!ok || !text) return;
  if (!force && !get().profile.voice) return;
  clearTimeout(timer);
  if (speechSynthesis.speaking || speechSynthesis.pending) speechSynthesis.cancel();
  if (!voice) pickVoice();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-TW';
  if (voice) u.voice = voice;
  u.rate = 0.9; // 稍慢，長輩比較聽得清楚
  u.volume = 1;
  u.onstart = () => { heard = true; };
  timer = setTimeout(() => { speechSynthesis.resume(); speechSynthesis.speak(u); }, 80);
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
