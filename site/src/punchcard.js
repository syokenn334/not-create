// 1サイクル固定グリッドの自前描画。Strudel の punchcard 相当を最小実装する。
// （punchcard 標準描画は canvas いっぱいに引き伸ばすため、セル固定サイズの
//  要件には合わない。ハップ取得・時刻は公式 API を使い、描画のみ自前にする。）
import { noteToMidi } from '@strudel/core';

const toNum = (x) => (typeof x === 'number' ? x : x?.valueOf?.() ?? 0);

// ハップ値から行キー（音の識別子）を決める。melodic は note/n、drum は s。
export function rowKeyOf(value) {
  if (value == null) return '~';
  if (typeof value !== 'object') return String(value);
  if (value.note !== undefined) return String(value.note);
  if (value.s !== undefined)
    return String(value.s) + (value.n !== undefined ? ':' + value.n : '');
  if (value.n !== undefined) return 'n' + value.n;
  if (value.sound !== undefined) return String(value.sound);
  return JSON.stringify(value);
}

// 行の音高（MIDI 相当）。melodic でなければ null。
function pitchOf(value) {
  if (!value || typeof value !== 'object') return null;
  if (value.note !== undefined) {
    if (typeof value.note === 'number') return value.note;
    try {
      const m = noteToMidi(value.note);
      return Number.isFinite(m) ? m : null;
    } catch {
      return null;
    }
  }
  if (value.n !== undefined && value.s === undefined) {
    const n = Number(value.n);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

// ハップ配列から行キー一覧を作る。
// 全行が音高を持つ（melodic）なら音高の降順（高音=上）に、
// そうでなければ（drum 等）出現順に並べる。
export function computeRows(haps) {
  const map = new Map(); // key -> { pitch, firstIndex }
  haps.forEach((h, i) => {
    const k = rowKeyOf(h.value);
    if (!map.has(k)) map.set(k, { pitch: pitchOf(h.value), firstIndex: i });
  });
  const entries = [...map.entries()];
  const allPitched = entries.length > 0 && entries.every(([, v]) => v.pitch !== null);
  if (allPitched) {
    entries.sort((a, b) => b[1].pitch - a[1].pitch); // 高音を上に
  } else {
    entries.sort((a, b) => a[1].firstIndex - b[1].firstIndex); // 出現順
  }
  return entries.map(([k]) => k);
}

export const CELL_H = 22; // 固定セル高(px)
const LABEL_W = 38; // 行ラベル用の左ガター(px)

const THEME = {
  gridLine: 'rgba(70, 255, 149, 0.10)',
  cell: 'rgba(70, 255, 149, 0.28)',
  active: '#7dffb8',
  activeGlow: 'rgba(125, 255, 184, 0.9)',
  playhead: 'rgba(255, 180, 84, 0.85)',
  label: 'rgba(70, 255, 149, 0.55)',
};

const clamp01 = (v) => Math.max(0, Math.min(1, v));

// ctx は dpr 補正済み（setTransform 済み）を想定。W は CSS px 幅。
// haps は queryArc(cycle, cycle+1) の結果（オンセットのみ推奨）。
// phase は現在サイクル内の位相 0..1。
export function drawGrid(ctx, haps, phase, opts) {
  const { W, rows, cycle, showLabels = true } = opts;
  const cellH = opts.cellH ?? CELL_H;
  const H = Math.max(rows.length, 1) * cellH;
  const gutter = showLabels ? LABEL_W : 0;
  const gridW = Math.max(1, W - gutter);

  ctx.clearRect(0, 0, W, H);

  // 行の水平グリッド線
  ctx.strokeStyle = THEME.gridLine;
  ctx.lineWidth = 1;
  for (let r = 0; r <= rows.length; r++) {
    const y = r * cellH + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // セル
  const pad = 1.5;
  for (const h of haps) {
    const span = h.whole ?? h.part;
    if (!span) continue;
    const b = clamp01(toNum(span.begin) - cycle);
    const e = clamp01(toNum(span.end) - cycle);
    const rowIdx = rows.indexOf(rowKeyOf(h.value));
    if (rowIdx < 0) continue;
    const x = gutter + b * gridW;
    const w = Math.max(2, (e - b) * gridW - pad * 2);
    const y = rowIdx * cellH;
    const active = phase >= b && phase < e;
    if (active) {
      ctx.fillStyle = THEME.active;
      ctx.shadowColor = THEME.activeGlow;
      ctx.shadowBlur = 8;
    } else {
      ctx.fillStyle = THEME.cell;
      ctx.shadowBlur = 0;
    }
    ctx.fillRect(x + pad, y + pad, w, cellH - pad * 2);
  }
  ctx.shadowBlur = 0;

  // 行ラベル
  if (showLabels) {
    ctx.fillStyle = THEME.label;
    ctx.font = '10px DotGothic16, monospace';
    ctx.textBaseline = 'middle';
    rows.forEach((k, r) => {
      const label = k.length > 5 ? k.slice(0, 5) : k;
      ctx.fillText(label, 4, r * cellH + cellH / 2);
    });
  }

  // プレイヘッド
  const px = gutter + clamp01(phase) * gridW;
  ctx.strokeStyle = THEME.playhead;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(px, 0);
  ctx.lineTo(px, H);
  ctx.stroke();
}
