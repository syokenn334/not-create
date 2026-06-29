import { useState, useCallback, useRef } from 'react';
import { evalScope, evaluate as evaluateCode, stack } from '@strudel/core';
import { transpiler } from '@strudel/transpiler';
import { webaudioRepl } from '@strudel/webaudio';
import {
  getAudioContext,
  initAudioOnFirstClick,
  registerSynthSounds,
  registerZZFXSounds,
  samples,
  getAnalyserById,
  getAnalyzerData,
} from 'superdough';
import { splitParts } from './parts.js';
import { computeRows, drawGrid, CELL_H } from './punchcard.js';
import { computeBarLevels, drawSpectrumBars, NUM_BARS } from './spectrum.js';

const ANALYSER_ID = 'master';
// スペクトル棒のイージング率。上昇は素早く、減衰（停止後）はゆっくり落とす。
const RISE = 0.6;
const FALL = 0.06;

// なぜ @strudel/web を使わないか:
//   @strudel/web は core を dist 内にインライン同梱しており、別途 import する
//   @strudel/draw（core を外部参照）と Pattern クラスが二重化する。
//   そこで strudel.cc 本体と同じ「個別パッケージ + repl()」構成で core を統一する。
//
// 描画方針:
//   ソースを $: でパートに分割し、各パート式を evaluate(expr, transpiler) で
//   Pattern 化する（スケジュールはしない）。音声は全パートを stack した
//   combined を scheduler.setPattern で再生。描画は requestAnimationFrame で
//   各パートを 1 サイクル固定グリッド（固定セル＋プレイヘッド）に描く。
let session = null; // { scheduler, evaluate }
let initPromise = null;
// 連打対策: play/stop のたびに増やし、非同期処理の途中で値が変わっていたら
// その play は「追い越された」とみなして中断する（scheduler の二重 start を防ぐ）。
let playToken = 0;

function ensureInit() {
  if (initPromise) return initPromise;
  initPromise = (async () => {
    initAudioOnFirstClick();
    // パターン関数（s/note/gain/stack…）・mini 記法・tonal を同一 core に登録。
    await evalScope(
      import('@strudel/core'),
      import('@strudel/mini'),
      import('@strudel/tonal'),
    );
    await Promise.all([
      registerSynthSounds(),
      registerZZFXSounds(),
      // strudel.cc と同じ公式 CDN のドラムマシン。bare な s("bd"/"sd"/"hh"/"cp"…) は
      // ここ（tidal-drum-machines）由来。CDN なので GitHub のレート制限を受けない。
      samples(
        'https://strudel.b-cdn.net/tidal-drum-machines.json',
        'https://strudel.b-cdn.net/tidal-drum-machines/machines/',
        { tag: 'drum-machines' },
      ).catch((e) => console.warn('[gallery] drum-machines (CDN) failed', e)),
      // 予備ソース: GitHub の dirt-samples（bd/sd/hh 等を含む）。どちらか成功すれば鳴る。
      samples('github:tidalcycles/dirt-samples').catch((e) =>
        console.warn('[gallery] dirt-samples (github) failed', e),
      ),
    ]);
    // 公式 @strudel/web と同じ構成。webaudioRepl が getTime/defaultOutput と
    // superdough の setAudioContext をまとめて行う（手組みの repl と等価）。
    const { scheduler, evaluate } = webaudioRepl({ transpiler });
    session = { scheduler, evaluate };
  })();
  return initPromise;
}

export function usePlayer() {
  const [playingId, setPlayingId] = useState(null);
  const [error, setError] = useState(null);
  // 描画する canvas の数（=パート数）。App がこの数だけ canvas を描画する。
  const [partInfos, setPartInfos] = useState([]);

  const canvasesRef = useRef(new Map()); // index -> canvas element
  const spectrumRef = useRef(null); // 背景スペクトル canvas
  // playing: 再生中か。stop 後も減衰アニメのためループは回り続ける。
  const renderRef = useRef({ rafId: 0, parts: [], playing: false });
  const levelsRef = useRef(new Array(NUM_BARS).fill(0)); // 棒の表示レベル(0..1)

  const registerCanvas = useCallback((i, el) => {
    if (el) canvasesRef.current.set(i, el);
    else canvasesRef.current.delete(i);
  }, []);

  const registerSpectrumCanvas = useCallback((el) => {
    spectrumRef.current = el || null;
  }, []);

  const clearCanvas = (canvas) => {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    // 直前フレームの setTransform(dpr) を打ち消してから全バッファをクリア。
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  // canvas のバッファサイズを表示サイズ×dpr に合わせる（変化時のみ）。戻り値は {ctx, W, H, dpr}。
  const fitCanvas = (canvas, cssW, cssH) => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const bw = Math.floor(cssW * dpr);
    const bh = Math.floor(cssH * dpr);
    if (canvas.width !== bw || canvas.height !== bh) {
      canvas.width = bw;
      canvas.height = bh;
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, W: cssW, H: cssH };
  };

  // 1 フレーム描画 → 必要なら次フレームを予約。
  // 再生中はライブ描画。停止後も棒が 0 に減衰しきるまで回り続け、その後自動停止。
  const loop = useCallback(() => {
    const playing = renderRef.current.playing;
    const sched = session?.scheduler;
    const now = sched?.now ? sched.now() : 0;
    const cycle = Math.floor(now);
    const phase = now - cycle;

    // --- 背景スペクトル: 目標レベルへイージング（再生中=上昇、停止中=0へ減衰） ---
    const levels = levelsRef.current;
    let target = null; // null = すべて 0（停止中）
    if (playing) {
      let data = null;
      try {
        data = getAnalyzerData('frequency', ANALYSER_ID);
      } catch {
        data = null;
      }
      target = computeBarLevels(data);
    }
    let maxLevel = 0;
    for (let i = 0; i < levels.length; i++) {
      const t = target ? target[i] : 0;
      const rate = t > levels[i] ? RISE : FALL;
      levels[i] += (t - levels[i]) * rate;
      if (levels[i] < 0.0005) levels[i] = 0;
      if (levels[i] > maxLevel) maxLevel = levels[i];
    }
    const specCanvas = spectrumRef.current;
    if (specCanvas && specCanvas.clientWidth > 0) {
      const { ctx, W, H } = fitCanvas(
        specCanvas,
        specCanvas.clientWidth,
        specCanvas.clientHeight,
      );
      drawSpectrumBars(ctx, levels, { W, H });
    }

    // --- パンチカード: 再生中のみ ---
    if (playing) {
      const parts = renderRef.current.parts;
      for (let i = 0; i < parts.length; i++) {
        const canvas = canvasesRef.current.get(i);
        if (!canvas) continue;
        let haps;
        try {
          haps = parts[i].pattern
            .queryArc(cycle, cycle + 1)
            .filter((h) => (h.hasOnset ? h.hasOnset() : true));
        } catch {
          continue;
        }
        const rows = computeRows(haps);
        const cssW = canvas.clientWidth || 200;
        const cssH = Math.max(rows.length, 1) * CELL_H;
        if (canvas.style.height !== cssH + 'px') canvas.style.height = cssH + 'px';
        const { ctx } = fitCanvas(canvas, cssW, cssH);
        drawGrid(ctx, haps, phase, { W: cssW, rows, cycle });
      }
    }

    // --- 継続判定: 再生中、または減衰がまだ残っているなら継続。完了で停止＆クリア ---
    if (playing || maxLevel > 0.005) {
      renderRef.current.rafId = requestAnimationFrame(loop);
    } else {
      renderRef.current.rafId = 0;
      clearCanvas(spectrumRef.current);
    }
  }, []);

  // ループが止まっていれば開始する。
  const ensureLoop = useCallback(() => {
    if (!renderRef.current.rafId) {
      renderRef.current.rafId = requestAnimationFrame(loop);
    }
  }, [loop]);

  const stop = useCallback(() => {
    playToken++; // 進行中の play を無効化
    renderRef.current.playing = false;
    renderRef.current.parts = [];
    try {
      session?.scheduler?.stop();
    } catch (err) {
      console.warn('[gallery] stop error', err);
    }
    // パンチカードは即消す（NO SIGNAL へ）。スペクトルは消さず、ループが 0 へ減衰させる。
    for (const canvas of canvasesRef.current.values()) clearCanvas(canvas);
    setPartInfos([]);
    setPlayingId(null);
    ensureLoop(); // 減衰アニメを回す（止まっていれば再開）
  }, [ensureLoop]);

  const play = useCallback(
    async (id, code) => {
      const myToken = ++playToken; // この play の世代番号
      setError(null);
      try {
        await ensureInit();
      } catch (err) {
        console.error('[gallery] init error', err);
        setError('INIT: ' + (err?.message || String(err)));
        return;
      }
      if (myToken !== playToken) return; // 追い越された
      try {
        await getAudioContext().resume();
      } catch {
        /* noop */
      }
      if (myToken !== playToken) return;

      // パート分割 → 各パートを Pattern 化（描画用）。評価は前の再生を止めずに行う。
      const exprs = splitParts(code);
      const parts = [];
      let lastErr = null;
      for (let i = 0; i < exprs.length; i++) {
        try {
          const { pattern } = await evaluateCode(exprs[i], transpiler);
          parts.push({ pattern });
        } catch (err) {
          lastErr = err;
          console.warn(`[gallery] part ${i} eval failed`, err);
        }
      }
      if (myToken !== playToken) return; // 評価中に追い越された
      if (parts.length === 0) {
        setError('EVAL: ' + (lastErr?.message || 'no playable parts'));
        return;
      }
      if (lastErr) {
        setError('PART: ' + (lastErr?.message || String(lastErr)));
      }

      // 切替リセット: パンチカードのみクリアして新パートに差し替え。
      // スペクトルのレベルは保持し、ライブ値へ再上昇させる（途中再生で再び伸びる）。
      for (const canvas of canvasesRef.current.values()) clearCanvas(canvas);
      renderRef.current.parts = parts;
      renderRef.current.playing = true;
      setPartInfos(parts.map((_, i) => ({ key: i })));

      // 音声: 全パートを stack し、.analyze('master') で全音声をアナライザに通す。
      // 背景スペクトルはこのアナライザのデータから描く。
      getAnalyserById(ANALYSER_ID, 1024, 0.7); // 事前生成（バッファ確保）
      const base =
        parts.length === 1 ? parts[0].pattern : stack(...parts.map((p) => p.pattern));
      const combined = base.analyze(ANALYSER_ID);
      try {
        await session.scheduler.setPattern(combined, true);
      } catch (err) {
        console.error('[gallery] play error', err);
        setError('PLAY: ' + (err?.message || String(err)));
        return;
      }
      if (myToken !== playToken) return; // setPattern 中に追い越された

      setPlayingId(id);
      ensureLoop(); // 描画ループ（回っていなければ開始）
    },
    [ensureLoop],
  );

  return {
    playingId,
    play,
    stop,
    error,
    partInfos,
    registerCanvas,
    registerSpectrumCanvas,
  };
}
