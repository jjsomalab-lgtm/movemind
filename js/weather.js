// 所在地天氣：使用 Open-Meteo 免費開放資料（不需金鑰）。之後可改由 n8n 串接中央氣象署並加入特報。
// 只用「縣市」代表座標，不需開啟 GPS，保護隱私。
export const PLACES = {
  '臺北市': [25.04, 121.56], '新北市': [25.01, 121.46], '基隆市': [25.13, 121.74], '桃園市': [24.99, 121.30],
  '新竹市': [24.80, 120.97], '新竹縣': [24.84, 121.01], '苗栗縣': [24.56, 120.82], '臺中市': [24.15, 120.67],
  '彰化縣': [24.08, 120.54], '南投縣': [23.91, 120.68], '雲林縣': [23.71, 120.43], '嘉義市': [23.48, 120.45],
  '嘉義縣': [23.46, 120.25], '臺南市': [22.99, 120.21], '高雄市': [22.63, 120.30], '屏東縣': [22.67, 120.49],
  '宜蘭縣': [24.75, 121.75], '花蓮縣': [23.99, 121.60], '臺東縣': [22.76, 121.15], '澎湖縣': [23.57, 119.58],
  '金門縣': [24.43, 118.32], '連江縣': [26.16, 119.95],
};
const CACHE_MIN = 30;

export async function getWeather(county) {
  const c = PLACES[county]; if (!c) return null;
  try {
    const cached = JSON.parse(sessionStorage.getItem('mm-weather') || 'null');
    if (cached && cached.county === county && Date.now() - cached.t < CACHE_MIN * 60000) return cached.w;
  } catch (e) { /* 忽略 */ }
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${c[0]}&longitude=${c[1]}&current=temperature_2m,apparent_temperature,precipitation,weather_code&hourly=precipitation_probability&forecast_hours=3&timezone=Asia%2FTaipei`;
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 8000);
  try {
    const d = await (await fetch(url, { signal: ctl.signal })).json();
    const w = {
      temp: Math.round(d.current.temperature_2m), feels: Math.round(d.current.apparent_temperature),
      rain: d.current.precipitation > 0 || [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(d.current.weather_code),
      pop: Math.max(...(d.hourly?.precipitation_probability || [0])), code: d.current.weather_code,
    };
    try { sessionStorage.setItem('mm-weather', JSON.stringify({ county, t: Date.now(), w })); } catch (e) { /* 忽略 */ }
    return w;
  } catch (e) { return null; } finally { clearTimeout(t); }
}

// 依天氣給出建議：outdoor = good | caution | indoor
export function advise(w, call = '你') {
  if (!w) return null;
  const icon = w.rain ? '🌧️' : w.code >= 45 && w.code <= 48 ? '🌫️' : w.code <= 1 ? '☀️' : '⛅';
  const h = new Date().getHours();
  if (w.rain || w.pop >= 60) return { icon, outdoor: 'indoor', text: `外面${w.rain ? '在下雨' : '等一下可能下雨'}，${call}今天我們在家動一動就好！` };
  if (w.feels >= 34 || (w.temp >= 32 && h >= 10 && h < 16)) return { icon, outdoor: 'caution', text: `現在 ${w.temp} 度好熱喔！傍晚涼一點再出門，記得帶水。` };
  if (w.temp <= 12) return { icon, outdoor: 'caution', text: `今天只有 ${w.temp} 度好冷，暖和一點再出門，穿件外套喔。` };
  return { icon, outdoor: 'good', text: `現在 ${w.temp} 度，天氣不錯！要不要出門走走？` };
}
