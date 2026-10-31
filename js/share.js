// 分享給家人：LINE、簡訊或手機內建分享（不需要後端）
import { get, weekStats } from './store.js';

export const lineURL = text => `https://line.me/R/share?text=${encodeURIComponent(text)}`;
export const smsURL = (text, phone = '') => {
  const ios = /iPhone|iPad|iPod/.test(navigator.userAgent);
  return `sms:${phone}${ios ? '&' : '?'}body=${encodeURIComponent(text)}`;
};
export const mapLink = ([lat, lng]) => `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

export function weeklyText() {
  const s = get(), w = weekStats();
  const name = s.profile.name || '我';
  const bloom = s.garden.plots.filter(p => p.stage === 3).length;
  return `【心動力 AI 週報】\n${name}這週活動了 ${w.total} 次（${w.activeDays} 天有動），散步 ${w.km.toFixed(1)} 公里。\n心動綠洲裡已經開了 ${bloom} 朵花。\n謝謝你們的關心！`;
}

export function helpText(pos) {
  const name = get().profile.name || '我';
  return pos
    ? `【心動力 AI】${name}需要幫忙，目前位置：${mapLink(pos)}`
    : `【心動力 AI】${name}需要幫忙，請盡快聯絡我。`;
}

export async function nativeShare(text) {
  if (navigator.share) {
    try { await navigator.share({ text }); return true; } catch (e) { return false; }
  }
  return false;
}
