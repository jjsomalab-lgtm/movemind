// 姿勢辨識：坐姿抬腿自動計數（MediaPipe Pose Landmarker，於手機端分析，影像不上傳）
// 第一次使用需連網下載模型；之後由 service worker 快取。

const VISION_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/vision_bundle.mjs';
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task';

// 判斷方式（相對門檻）：不要求把腳伸直。
// 膝蓋角度比「放下時的最小角度」多抬 RISE 度就算 1 下，降回到 DROP 度以內才能算下一下。
// 這樣膝蓋活動角度較小的長輩，照「抬低一點就好」的提示做也能被計數。（待實測調整）
const RISE = 20;
const DROP = 10;
const MIN_BENT = 140; // 放下時膝蓋角度需小於此值，避免一開始就伸直坐著被誤算

let landmarker = null, stream = null, raf = 0, running = false;

function angle(a, b, c) {
  const ab = [a.x - b.x, a.y - b.y], cb = [c.x - b.x, c.y - b.y];
  const dot = ab[0] * cb[0] + ab[1] * cb[1];
  const m = Math.hypot(...ab) * Math.hypot(...cb);
  return m ? Math.acos(Math.min(1, Math.max(-1, dot / m))) * 180 / Math.PI : 0;
}

export async function startPose(video, canvas, { onRep, onStatus, onAngle }) {
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
  onStatus('請讓整個下半身出現在畫面中，側坐效果最好。');

  const ctx = canvas.getContext('2d');
  const side = { L: { up: false, ema: 0, low: 999, high: 0 }, R: { up: false, ema: 0, low: 999, high: 0 } };
  let lastT = -1;

  const loop = () => {
    if (!running) return;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const t = performance.now();
    if (video.currentTime !== lastT) {
      lastT = video.currentTime;
      const res = landmarker.detectForVideo(video, t);
      const lm = res.landmarks?.[0];
      if (lm) {
        draw(ctx, lm, canvas.width, canvas.height);
        [['L', 23, 25, 27], ['R', 24, 26, 28]].forEach(([k, h, kn, an]) => {
          if (Math.min(lm[h].visibility ?? 1, lm[kn].visibility ?? 1, lm[an].visibility ?? 1) < 0.5) return;
          const s = side[k];
          const a = angle(lm[h], lm[kn], lm[an]);
          s.ema = s.ema ? s.ema * 0.6 + a * 0.4 : a;
          onAngle?.(Math.round(s.ema));
          if (!s.up) {
            s.low = Math.min(s.low, s.ema);
            if (s.low < MIN_BENT && s.ema - s.low >= RISE) { s.up = true; s.high = s.ema; onRep(); }
          } else {
            s.high = Math.max(s.high, s.ema);
            if (s.ema - s.low <= DROP) { s.up = false; s.low = s.ema; }
          }
        });
      }
    }
    raf = requestAnimationFrame(loop);
  };
  loop();
}

function draw(ctx, lm, w, h) {
  const pairs = [[23, 25], [25, 27], [24, 26], [26, 28], [23, 24], [11, 23], [12, 24], [11, 12]];
  ctx.lineWidth = 6; ctx.strokeStyle = '#3CC48A'; ctx.lineCap = 'round';
  pairs.forEach(([a, b]) => {
    ctx.beginPath(); ctx.moveTo(lm[a].x * w, lm[a].y * h); ctx.lineTo(lm[b].x * w, lm[b].y * h); ctx.stroke();
  });
  ctx.fillStyle = '#F6C453';
  [23, 24, 25, 26, 27, 28].forEach(i => { ctx.beginPath(); ctx.arc(lm[i].x * w, lm[i].y * h, 8, 0, Math.PI * 2); ctx.fill(); });
}

export function stopPose() {
  running = false;
  cancelAnimationFrame(raf);
  stream?.getTracks().forEach(t => t.stop());
  stream = null;
}
