import { useState, useCallback } from 'react';
import { initStrudel, evaluate, hush, evalScope, samples } from '@strudel/web';

// SPIKE.md 参照:
// - evaluate/hush/samples/evalScope は import で使う(window ではない)
// - 既定 prebake は合成音のみ。ドラム等のサンプルと @strudel/draw を読み込む
let initPromise = null;
function ensureInit() {
  if (!initPromise) {
    initPromise = initStrudel({
      prebake: () =>
        Promise.all([
          evalScope(import('@strudel/draw')).catch((e) => console.warn('[gallery] draw load failed', e)),
          samples('github:tidalcycles/dirt-samples').catch((e) => console.warn('[gallery] dirt-samples failed', e)),
          samples('github:ritchse/tidal-drum-machines').catch((e) => console.warn('[gallery] drum-machines failed', e)),
        ]),
    });
  }
  return initPromise;
}

// strudel.cc と同じく、再生コードと同じ評価内で all(...) を前置して
// 再生中パターンに punchcard を適用する(#test-canvas に描画)。
const DRAW_PREFIX = 'all(x => x.punchcard())\n';

export function usePlayer() {
  const [playingId, setPlayingId] = useState(null);
  const [error, setError] = useState(null);

  const stop = useCallback(() => {
    try {
      hush();
    } catch (err) {
      console.warn('[gallery] hush error', err);
    }
    setPlayingId(null);
  }, []);

  const play = useCallback(async (id, code) => {
    setError(null);
    try {
      await ensureInit();
    } catch (err) {
      console.error('[gallery] init error', err);
      setError('INIT: ' + (err?.message || String(err)));
      return;
    }
    // まず punchcard 付きで再生。失敗したら音だけは確実に出す。
    try {
      await evaluate(DRAW_PREFIX + code);
      setPlayingId(id);
    } catch (errDraw) {
      console.warn('[gallery] punchcard wrap failed, fallback to audio-only', errDraw);
      try {
        await evaluate(code);
        setPlayingId(id);
        setError('PUNCHCARD: ' + (errDraw?.message || String(errDraw)));
      } catch (err) {
        console.error('[gallery] evaluate error', err);
        setError('EVAL: ' + (err?.message || String(err)));
        setPlayingId(null);
      }
    }
  }, []);

  return { playingId, play, stop, error };
}
