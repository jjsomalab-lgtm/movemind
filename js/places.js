// 附近可以散步去的地方：用 OpenStreetMap 的 Overpass API 找附近公園（免費、不需金鑰）
// 網路不穩或找不到時，回傳空陣列，散步功能照常使用
import { meters } from './walk.js';

const ENDPOINT = 'https://overpass-api.de/api/interpreter?data=';

export async function findParks([lat, lng], radius = 1200) {
  const q = `[out:json][timeout:12];(node["leisure"="park"](around:${radius},${lat},${lng});way["leisure"="park"](around:${radius},${lat},${lng});relation["leisure"="park"](around:${radius},${lat},${lng}););out center 30;`;
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 12000);
  try {
    const res = await fetch(ENDPOINT + encodeURIComponent(q), { signal: ctl.signal });
    const data = await res.json();
    const seen = new Set();
    const list = (data.elements || []).map(e => {
      const p = [e.lat ?? e.center?.lat, e.lon ?? e.center?.lon];
      return { name: e.tags?.name || '附近的公園', lat: p[0], lng: p[1], m: Math.round(meters([lat, lng], p)) };
    }).filter(p => p.lat && !seen.has(p.name + Math.round(p.m / 50)) && seen.add(p.name + Math.round(p.m / 50)))
      .sort((a, b) => a.m - b.m);
    // 有名字的公園優先；都沒有名字時才顯示「附近的小公園」
    const named = list.filter(p => p.name !== '附近的公園');
    return (named.length ? named : list.map(p => ({ ...p, name: '附近的小公園' }))).slice(0, 5);
  } catch (e) { return []; } finally { clearTimeout(t); }
}

export function bearingText([a, b], [c, d]) {
  const toR = x => x * Math.PI / 180;
  const y = Math.sin(toR(d - b)) * Math.cos(toR(c));
  const x = Math.cos(toR(a)) * Math.sin(toR(c)) - Math.sin(toR(a)) * Math.cos(toR(c)) * Math.cos(toR(d - b));
  const deg = (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
  return ['北', '東北', '東', '東南', '南', '西南', '西', '西北'][Math.round(deg / 45) % 8];
}

export const walkMinutes = m => Math.max(1, Math.round(m / 50)); // 長輩步行約每分鐘 50 公尺（估計）
export const gmapsWalkURL = p => `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}&travelmode=walking`;
