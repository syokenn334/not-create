// 全音声の周波数スペクトルを「離散化した棒グラフ」で背景に描く。
// データは getAnalyzerData('frequency','master') の Float32Array（dB 値）。
// 描画と「目標レベルの算出」を分離し、イージング（上昇/減衰）は呼び出し側で行う。

export const NUM_BARS = 40; // 棒の本数
const MIN_DB = -90; // これ以下は無音扱い
const MAX_DB = -10; // これ以上はピーク扱い

const normDb = (db) => {
  if (!Number.isFinite(db)) return 0;
  const v = (db - MIN_DB) / (MAX_DB - MIN_DB);
  return v < 0 ? 0 : v > 1 ? 1 : v;
};

// 周波数データ（dB）→ 棒ごとの目標レベル（0..1）配列。
export function computeBarLevels(data) {
  const out = new Array(NUM_BARS).fill(0);
  if (!data || data.length === 0) return out;
  const bins = data.length;
  for (let i = 0; i < NUM_BARS; i++) {
    const t0 = i / NUM_BARS;
    const t1 = (i + 1) / NUM_BARS;
    // 低域を広げる軽い指数スケールで bin 範囲を決め、その範囲のピークを採用。
    const b0 = Math.floor(Math.pow(t0, 1.6) * bins);
    const b1 = Math.max(b0 + 1, Math.floor(Math.pow(t1, 1.6) * bins));
    let peak = -Infinity;
    for (let b = b0; b < b1 && b < bins; b++) {
      if (data[b] > peak) peak = data[b];
    }
    out[i] = normDb(peak);
  }
  return out;
}

// 棒グラフ描画。levels は 0..1 の配列（イージング済みの表示値）。
export function drawSpectrumBars(ctx, levels, opts) {
  const { W, H } = opts;
  ctx.clearRect(0, 0, W, H);
  if (!levels || levels.length === 0) return;

  const n = levels.length;
  const gap = 2;
  const barW = Math.max(1, (W - gap * (n - 1)) / n);

  for (let i = 0; i < n; i++) {
    const h = levels[i] * (H - 2);
    if (h <= 0.5) continue;
    const x = i * (barW + gap);
    const y = H - h;

    const grad = ctx.createLinearGradient(0, y, 0, H);
    grad.addColorStop(0, 'rgba(70, 255, 149, 0.45)');
    grad.addColorStop(1, 'rgba(70, 255, 149, 0.04)');
    ctx.fillStyle = grad;
    ctx.fillRect(x, y, barW, h);
    // 棒の頂点に少し明るいキャップ（控えめ）
    ctx.fillStyle = 'rgba(125, 255, 184, 0.5)';
    ctx.fillRect(x, y, barW, 2);
  }
}
