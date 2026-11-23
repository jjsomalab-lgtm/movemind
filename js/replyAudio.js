// 播放 n8n 回傳的寵物語音（mp3 base64）。
// iPhone 規定要在點擊當下開始播放：按送出時先呼叫 unlockReplyAudio()，
// 回覆到了再呼叫 playReplyAudio()。播不出來時回傳 false，呼叫的地方改用手機內建朗讀。
// 來源：n8n 接口說明 v1 第 5.2 節（2026-11-23）
let el = null;
let unlocked = false;

function silentWavUrl() {
  const sr = 8000, n = 800, buf = new ArrayBuffer(44 + n * 2), v = new DataView(buf);
  const w = (o, s) => [...s].forEach((c, i) => v.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt '); v.setUint32(16, 16, true);
  v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, sr, true); v.setUint32(28, sr * 2, true);
  v.setUint16(32, 2, true); v.setUint16(34, 16, true); w(36, 'data'); v.setUint32(40, n * 2, true);
  return URL.createObjectURL(new Blob([buf], { type: 'audio/wav' }));
}

// 一定要在點擊事件裡、任何 await 之前呼叫
export function unlockReplyAudio() {
  try {
    if (!el) { el = new Audio(); el.setAttribute('playsinline', ''); }
    el.pause();
    if (unlocked) return;
    el.src = silentWavUrl();
    el.volume = 0.01;
    const p = el.play();
    if (p && p.then) p.then(() => { unlocked = true; }).catch(() => {});
  } catch (e) { /* 不支援時改用手機內建朗讀 */ }
}

export async function playReplyAudio(b64) {
  if (!el || !b64) return false;
  try {
    el.pause();
    el.volume = 1;
    el.src = 'data:audio/mpeg;base64,' + b64;
    await el.play();
    return true;
  } catch (e) {
    return false;
  }
}

export function stopReplyAudio() { try { if (el) el.pause(); } catch (e) { /* 忽略 */ } }
