// 生活提醒：喝水、用藥、運動、自訂。APP 開著時由寵物提醒；並可「加到手機行事曆」，讓 APP 關掉時手機也會準時響。
// 原則：只依使用者（或家人協助）設定的時間與名稱提醒，不判斷、不建議用藥或喝水量。
export const KINDS = {
  water: { icon: '💧', label: '喝水', default: '喝一口水' },
  med: { icon: '💊', label: '用藥', default: '' },
  move: { icon: '🤸', label: '動一動', default: '起來動一動' },
  custom: { icon: '⏰', label: '自訂', default: '' },
};

const pad = n => String(n).padStart(2, '0');
const dkey = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

// 回傳現在應該提醒、而且今天還沒處理過的提醒（時間到了 60 分鐘內）
export function dueReminders(state, now = new Date()) {
  const list = state.reminders || [], log = state.reminderLog || {};
  const mins = now.getHours() * 60 + now.getMinutes();
  return list.filter(r => {
    const [h, m] = r.time.split(':').map(Number), t = h * 60 + m;
    const key = `${dkey(now)}_${r.id}`;
    return mins >= t && mins - t <= 60 && !log[key];
  });
}
export const logKey = (r, now = new Date()) => `${dkey(now)}_${r.id}`;

// 產生每天重複的行事曆檔（.ics），手機開啟後可加入內建行事曆並跳出提醒
export function icsFor(reminders) {
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}00Z`;
  const day = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const esc = s => s.replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, ' ');
  const ev = reminders.map(r => {
    const [h, m] = r.time.split(':');
    const title = `${KINDS[r.kind].icon} ${r.label}`;
    return ['BEGIN:VEVENT', `UID:${r.id}@movemind`, `DTSTAMP:${stamp}`, `DTSTART;TZID=Asia/Taipei:${day}T${h}${m}00`, 'DURATION:PT5M', 'RRULE:FREQ=DAILY',
      `SUMMARY:${esc(title)}`, `DESCRIPTION:${esc('心動力 AI 提醒。用藥請依醫師或藥師指示。')}`,
      'BEGIN:VALARM', 'ACTION:DISPLAY', `DESCRIPTION:${esc(title)}`, 'TRIGGER:PT0M', 'END:VALARM', 'END:VEVENT'].join('\r\n');
  });
  return ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//MoveMind AI//Reminders//ZH-TW', 'CALSCALE:GREGORIAN',
    'BEGIN:VTIMEZONE', 'TZID:Asia/Taipei', 'BEGIN:STANDARD', 'DTSTART:19700101T000000', 'TZOFFSETFROM:+0800', 'TZOFFSETTO:+0800', 'END:STANDARD', 'END:VTIMEZONE',
    ...ev, 'END:VCALENDAR'].join('\r\n');
}
