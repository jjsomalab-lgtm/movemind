// 戶外散步：GPS 記錄距離、時間與路線；地圖使用 OpenStreetMap（Leaflet）
// 網頁 APP 限制：螢幕需保持亮著才能持續記錄（已使用 Wake Lock 防止自動關螢幕）

import { DEMO_ROUTE, FLOWER_EVERY_M } from './content.js';

const FLOWER_COLORS = ['#F2A93B', '#D63A86', '#FFFFFF', '#D9482B', '#F3A6C0'];
const flowerHTML = c => `<svg viewBox="0 0 20 20" width="20" height="20"><g fill="${c}" stroke="#7A5634" stroke-width=".6"><circle cx="10" cy="4.5" r="4"/><circle cx="15.5" cy="9" r="4"/><circle cx="13" cy="15" r="4"/><circle cx="7" cy="15" r="4"/><circle cx="4.5" cy="9" r="4"/></g><circle cx="10" cy="10.5" r="3" fill="#F6C453"/></svg>`;

const R = 6371000;
export function meters(a, b) {
  const toR = d => d * Math.PI / 180;
  const dLat = toR(b[0] - a[0]), dLng = toR(b[1] - a[1]);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toR(a[0])) * Math.cos(toR(b[0])) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function createWalk(mapEl, { onUpdate, onError }) {
  let demo = false;
  let flowers = [];
  let pts = [], dist = 0, start = 0, watchId = null, simTimer = null, lock = null, map = null, line = null, dot = null, tick = null;
  const hasLeaflet = !!window.L;

  function initMap(center) {
    if (hasLeaflet) {
      map = L.map(mapEl, { zoomControl: false, attributionControl: true }).setView(center, 17);
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' }).addTo(map);
      line = L.polyline([], { color: '#2F7D57', weight: 7 }).addTo(map);
      dot = L.circleMarker(center, { radius: 10, color: '#fff', weight: 3, fillColor: '#C2391B', fillOpacity: 1 }).addTo(map);
    } else {
      mapEl.innerHTML = '<svg class="route-fallback" viewBox="0 0 300 200" aria-label="散步路線"><polyline fill="none" stroke="#2F7D57" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" points=""/><g class="fl"></g><circle class="me" r="8" fill="#C2391B" stroke="#fff" stroke-width="3" cx="-20" cy="-20"/></svg><p class="map-note">地圖需要網路，目前先畫出路線形狀。</p>';
    }
  }

  function drawFlower(f) {
    if (hasLeaflet && map) L.marker(f.p, { icon: L.divIcon({ html: flowerHTML(f.c), className: 'trail-flower', iconSize: [20, 20] }), interactive: false }).addTo(map);
  }

  function drawFallback() {
    const svg = mapEl.querySelector('svg'); if (!svg || pts.length < 1) return;
    const lats = pts.map(p => p[0]), lngs = pts.map(p => p[1]);
    const [a, b, c, d] = [Math.min(...lats), Math.max(...lats), Math.min(...lngs), Math.max(...lngs)];
    const sx = v => 20 + (d - c ? (v - c) / (d - c) : 0.5) * 260, sy = v => 180 - (b - a ? (v - a) / (b - a) : 0.5) * 160;
    svg.querySelector('polyline').setAttribute('points', pts.map(p => `${sx(p[1])},${sy(p[0])}`).join(' '));
    const last = pts[pts.length - 1], dotEl = svg.querySelector('circle.me');
    dotEl.setAttribute('cx', sx(last[1])); dotEl.setAttribute('cy', sy(last[0]));
    svg.querySelector('g.fl').innerHTML = flowers.map(f => `<circle cx="${sx(f.p[1])}" cy="${sy(f.p[0])}" r="6" fill="${f.c}" stroke="#7A5634" stroke-width="1.5"/>`).join('');
  }

  function add(p) {
    if (!map && !mapEl.querySelector('svg')) initMap(p);
    if (pts.length) {
      const m = meters(pts[pts.length - 1], p);
      if (m < 4) return;         // 站著不動時的 GPS 飄移不計入
      if (m > 120) return;       // 一次跳太遠，多半是訊號錯誤
      dist += m;
    }
    pts.push(p);
    // 花徑：每走 40 公尺，路邊開一朵花
    if (Math.floor(dist / FLOWER_EVERY_M) > flowers.length) { flowers.push({ p, c: FLOWER_COLORS[flowers.length % FLOWER_COLORS.length] }); drawFlower(flowers[flowers.length - 1]); }
    if (hasLeaflet) { line.addLatLng(p); dot.setLatLng(p); map.panTo(p); } else drawFallback();
    emit();
  }

  // 模擬路線以每公里約 15 分鐘的步行速度顯示時間
  const elapsed = () => demo ? Math.round(dist / 1000 * 900) : Math.round((Date.now() - start) / 1000);
  const emit = () => onUpdate({ km: dist / 1000, seconds: elapsed(), last: pts[pts.length - 1] || null });

  async function keepAwake() {
    try { lock = await navigator.wakeLock?.request('screen'); } catch (e) { lock = null; }
  }

  return {
    startReal() {
      start = Date.now(); keepAwake();
      tick = setInterval(emit, 1000);
      if (!navigator.geolocation) { onError('這支手機無法定位，可以改用「模擬路線」展示。'); return; }
      watchId = navigator.geolocation.watchPosition(
        pos => { if (pos.coords.accuracy <= 50) add([pos.coords.latitude, pos.coords.longitude]); },
        err => onError(err.code === 1 ? '沒有定位權限。請在瀏覽器設定中允許「位置」，或改用模擬路線。' : '暫時收不到 GPS 訊號，到戶外空曠處會比較準。'),
        { enableHighAccuracy: true, maximumAge: 2000, timeout: 20000 }
      );
    },
    startDemo() {
      demo = true; start = Date.now(); keepAwake();
      tick = setInterval(emit, 1000);
      let i = 0;
      add(DEMO_ROUTE[0]);
      simTimer = setInterval(() => {
        i += 1;
        if (i >= DEMO_ROUTE.length) { clearInterval(simTimer); return; }
        add(DEMO_ROUTE[i]);
      }, 700);
    },
    stop() {
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      clearInterval(simTimer); clearInterval(tick);
      lock?.release?.();
      const out = { flowers: flowers.length, km: Math.round(dist / 10) / 100, minutes: Math.max(1, Math.round(elapsed() / 60)), route: pts.slice() };
      if (map) { map.remove(); map = null; }
      return out;
    },
    current: () => pts[pts.length - 1] || null,
    // 從其他頁面回到散步畫面時，把地圖重新畫在新的區塊上
    attach(el) {
      if (map) { map.remove(); map = null; }
      mapEl = el;
      if (!pts.length) return;
      initMap(pts[pts.length - 1]);
      if (hasLeaflet) { line.setLatLngs(pts); dot.setLatLng(pts[pts.length - 1]); flowers.forEach(drawFlower); map.fitBounds(line.getBounds(), { maxZoom: 17 }); } else drawFallback();
      emit();
    },
  };
}

// 取得目前位置一次（打卡、求助用）
export function getPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('no-geo'));
    navigator.geolocation.getCurrentPosition(p => resolve([p.coords.latitude, p.coords.longitude]), reject, { enableHighAccuracy: true, timeout: 15000, maximumAge: 30000 });
  });
}
