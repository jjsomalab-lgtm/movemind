// 姿勢辨識：所有活動都能開鏡頭自動計數（MediaPipe Pose Landmarker，於手機端分析，影像不上傳）
// 第一次使用需連網下載模型；之後由 service worker 快取。
//
// 計數原則（所有活動相同）：相對門檻，不要求做到最大幅度。
// 每個活動定義一個「訊號」（例如膝蓋角度、膝蓋抬高的高度），動作時訊號會上升。
// 訊號比「休息位置」多出 rise 就算 1 下，回到休息位置 drop 以內才能算下一下。
// 這樣活動角度較小、照「退階做法」做的長輩也能被計數，不會為了獎勵勉強做大。
// 各門檻為初稿，須經專業人員確認並以長輩實測調整（見 docs/SPEC.md 第 5.6 節）。

const VISION_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

// MediaPipe Pose 關鍵點編號
const P = { nose: 0, lSh: 11, rSh: 12, lEl: 13, rEl: 14, lWr: 15, rWr: 16, lHip: 23, rHip: 24, lKn: 25, rKn: 26, lAn: 27, rAn: 28, lHeel: 29, rHeel: 30, lToe: 31, rToe: 32 };

const vis = (lm, ...ids) => ids.every(i => (lm[i]?.visibility ?? 1) >= 0.5);
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
function angle(a, b, c) {
  const ab = [a.x - b.x, a.y - b.y], cb = [c.x - b.x, c.y - b.y];
  const m = Math.hypot(...ab) * Math.hypot(...cb);
  return m ? Math.acos(Math.min(1, Math.max(-1, (ab[0] * cb[0] + ab[1] * cb[1]) / m))) * 180 / Math.PI : 0;
}
const torso = lm => (dist(lm[P.lSh], lm[P.lHip]) + dist(lm[P.rSh], lm[P.rHip])) / 2 || 0.3;

// 每個活動：signals(lm) 回傳 { 通道名稱: 數值 }，數值越大代表動作越到位
export const DETECTORS = {
  'seated-knee': {
    hint: '側坐，讓臀部到腳踝都在畫面中。',
    rise: 20, drop: 10,
    signals: lm => ({
      ...(vis(lm, P.lHip, P.lKn, P.lAn) ? { L: angle(lm[P.lHip], lm[P.lKn], lm[P.lAn]) } : {}),
      ...(vis(lm, P.rHip, P.rKn, P.rAn) ? { R: angle(lm[P.rHip], lm[P.rKn], lm[P.rAn]) } : {}),
    }),
  },
  'seated-march': {
    hint: '正面或側面坐好，讓臀部和膝蓋都在畫面中。',
    rise: 0.12, drop: 0.06,
    signals: lm => {
      const t = torso(lm), o = {};
      if (vis(lm, P.lHip, P.lKn)) o.L = (lm[P.lHip].y - lm[P.lKn].y) / t;
      if (vis(lm, P.rHip, P.rKn)) o.R = (lm[P.rHip].y - lm[P.rKn].y) / t;
      return o;
    },
  },
  'arm-circle': {
    hint: '正面坐在鏡頭前，讓雙手和肩膀都在畫面中。',
    rise: 0.08, drop: 0.04,
    // 手臂畫圈時，手腕會一上一下；每畫一圈，手腕最高點出現一次
    signals: lm => {
      const t = torso(lm), o = {};
      if (vis(lm, P.lSh, P.lWr) && vis(lm, P.rSh, P.rWr)) o.B = ((lm[P.lSh].y - lm[P.lWr].y) + (lm[P.rSh].y - lm[P.rWr].y)) / 2 / t;
      return o;
    },
  },
  'seated-twist': {
    hint: '正面坐在鏡頭前，讓雙肩都在畫面中。',
    rise: 0.12, drop: 0.06,
    // 正面看，身體轉向一側時，兩肩之間的距離會變短
    signals: (lm, st) => {
      if (!vis(lm, P.lSh, P.rSh)) return {};
      const w = Math.abs(lm[P.lSh].x - lm[P.rSh].x);
      st.maxW = Math.max(st.maxW || 0, w);
      return { T: 1 - w / st.maxW };
    },
  },
  'ankle-pump': {
    hint: '側坐，讓膝蓋到腳尖都在畫面中。',
    rise: 12, drop: 6,
    // 雙腳通常一起動，取看得最清楚的一隻腳，避免一次算成兩下
    signals: lm => {
      const v = [];
      if (vis(lm, P.lKn, P.lAn, P.lToe)) v.push(180 - angle(lm[P.lKn], lm[P.lAn], lm[P.lToe]));
      if (vis(lm, P.rKn, P.rAn, P.rToe)) v.push(180 - angle(lm[P.rKn], lm[P.rAn], lm[P.rToe]));
      return v.length ? { F: Math.max(...v) } : {};
    },
  },
  'sit-to-stand': {
    hint: '側面對著鏡頭，讓全身都在畫面中，手機放遠一點。',
    rise: 40, drop: 20,
    signals: lm => {
      const o = {};
      if (vis(lm, P.lHip, P.lKn, P.lAn)) o.L = angle(lm[P.lHip], lm[P.lKn], lm[P.lAn]);
      else if (vis(lm, P.rHip, P.rKn, P.rAn)) o.L = angle(lm[P.rHip], lm[P.rKn], lm[P.rAn]);
      return o;
    },
  },
  'heel-raise': {
    hint: '側面對著鏡頭，讓腳跟和腳尖都在畫面中。',
    rise: 0.08, drop: 0.04,
    signals: (lm, st) => {
      // 腳跟抬高：腳跟相對腳尖的高度差，以小腿長度標準化
      const side = vis(lm, P.lHeel, P.lToe, P.lKn, P.lAn) ? 'l' : vis(lm, P.rHeel, P.rToe, P.rKn, P.rAn) ? 'r' : null;
      if (!side) return {};
      const h = lm[side === 'l' ? P.lHeel : P.rHeel], toe = lm[side === 'l' ? P.lToe : P.rToe];
      const shin = dist(lm[side === 'l' ? P.lKn : P.rKn], lm[side === 'l' ? P.lAn : P.rAn]) || 0.2;
      return { H: (toe.y - h.y) / shin };
    },
  },
  'stand-march': {
    hint: '正面或側面站好，讓臀部和膝蓋都在畫面中。',
    rise: 0.15, drop: 0.07,
    signals: lm => {
      const t = torso(lm), o = {};
      if (vis(lm, P.lHip, P.lKn)) o.L = (lm[P.lHip].y - lm[P.lKn].y) / t;
      if (vis(lm, P.rHip, P.rKn)) o.R = (lm[P.rHip].y - lm[P.rKn].y) / t;
      return o;
    },
  },
};

// 通用計數器：可以單獨測試（tools/test_pose.js）
export function makeCounter(det, onRep) {
  const ch = {}, st = {};
  return lm => {
    const sig = det.signals(lm, st);
    for (const [k, v] of Object.entries(sig)) {
      const c = ch[k] || (ch[k] = { up: false, ema: null, low: Infinity });
      c.ema = c.ema === null ? v : c.ema * 0.6 + v * 0.4;
      if (!c.up) {
        c.low = Math.min(c.low, c.ema);
        if (c.ema - c.low >= det.rise) { c.up = true; onRep(k); }
      } else if (c.ema - c.low <= det.drop) { c.up = false; c.low = c.ema; }
    }
    return sig;
  };
}

let landmarker = null, stream = null, raf = 0, running = false;

export async function startPose(video, canvas, activityId, { onRep, onStatus }) {
  const det = DETECTORS[activityId];
  if (!det) throw Object.assign(new Error('這個活動目前還不能用鏡頭計數，請按「完成一下」。'), { friendly: true });
  onStatus('正在準備鏡頭…');
  if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
    throw Object.assign(new Error('這個網址無法使用鏡頭，請改用 https 網址開啟。'), { friendly: true });
  }
  if (!landmarker) {
    onStatus('第一次使用，正在下載辨識模型（約 5 MB）…');
    const vision = await import(VISION_URL);
    const fileset = await vision.FilesetResolver.forVisionTasks(WASM_URL);
    landmarker = await vision.PoseLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
      runningMode: 'VIDEO', numPoses: 1,
    });
  }
  stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user', width: 640, height: 480 }, audio: false });
  video.srcObject = stream;
  await video.play();
  running = true;
  onStatus(det.hint);

  const ctx = canvas.getContext('2d');
  const step = makeCounter(det, onRep);
  let lastT = -1, seen = 0;

  const loop = () => {
    if (!running) return;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (video.currentTime !== lastT) {
      lastT = video.currentTime;
      const lm = landmarker.detectForVideo(video, performance.now()).landmarks?.[0];
      if (lm) {
        draw(ctx, lm, canvas.width, canvas.height);
        const sig = step(lm);
        seen = Object.keys(sig).length ? 0 : seen + 1;
        if (seen === 45) onStatus(`看不清楚需要的部位。${det.hint}`);
      }
    }
    raf = requestAnimationFrame(loop);
  };
  loop();
}

function draw(ctx, lm, w, h) {
  const pairs = [[11, 12], [11, 13], [13, 15], [12, 14], [14, 16], [11, 23], [12, 24], [23, 24], [23, 25], [25, 27], [27, 31], [24, 26], [26, 28], [28, 32]];
  ctx.lineWidth = 6; ctx.strokeStyle = '#3CC48A'; ctx.lineCap = 'round';
  pairs.forEach(([a, b]) => {
    if ((lm[a].visibility ?? 1) < 0.5 || (lm[b].visibility ?? 1) < 0.5) return;
    ctx.beginPath(); ctx.moveTo(lm[a].x * w, lm[a].y * h); ctx.lineTo(lm[b].x * w, lm[b].y * h); ctx.stroke();
  });
  ctx.fillStyle = '#F6C453';
  [11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28].forEach(i => {
    if ((lm[i].visibility ?? 1) < 0.5) return;
    ctx.beginPath(); ctx.arc(lm[i].x * w, lm[i].y * h, 7, 0, Math.PI * 2); ctx.fill();
  });
}

export function stopPose() {
  running = false;
  cancelAnimationFrame(raf);
  stream?.getTracks().forEach(t => t.stop());
  stream = null;
}
