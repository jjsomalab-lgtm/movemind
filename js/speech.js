// 語音朗讀（臺灣華語）與語音輸入
import { get } from './store.js';

let voice = null;
function pickVoice() {
  if (!('speechSynthesis' in window)) return;
  const vs = speechSynthesis.getVoices();
  voice = vs.find(v => v.lang === 'zh-TW') || vs.find(v => v.lang.startsWith('zh')) || null;
}
if ('speechSynthesis' in window) {
  pickVoice();
  speechSynthesis.onvoiceschanged = pickVoice;
}

export function speak(text, { force = false } = {}) {
  if (!('speechSynthesis' in window)) return;
  if (!force && !get().profile.voice) return;
  speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'zh-TW';
  if (voice) u.voice = voice;
  u.rate = 0.9; // 稍慢，長輩比較聽得清楚
  speechSynthesis.speak(u);
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) speechSynthesis.cancel();
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
