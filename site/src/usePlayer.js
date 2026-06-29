import { useState, useCallback } from 'react';
import { initStrudel, evaluate, hush, evalScope, samples } from '@strudel/web';

// SPIKE.md 参照:
// - evaluate/hush は import で使う(window ではない)
// - @strudel/draw を eval scope に足し、all(...) で再生パターンを #test-canvas に描画
let initPromise = null;
function ensureInit() {
  if (!initPromise) {
    initPromise = initStrudel({
      // 既定では合成音だけ。ドラム等のサンプルと描画関数を読み込む(失敗は非致命)。
      prebake: () =>
        Promise.all([
          evalScope(import('@strudel/draw')).catch((e) => console.warn('[gallery] draw load failed', e)),
          samples('github:tidalcycles/dirt-samples').catch((e) => console.warn('[gallery] dirt-samples failed', e)),
          samples('github:ritchse/tidal-drum-machines').catch((e) => console.warn('[gallery] drum-machines failed', e)),
        ]),
    }).then(async () => {
      // 全再生パターンにパンチカードを適用(コードを改変せず多文でも安全)。
      // 正確な形は Task 5 の実機確認で確定する。
      try {
        await evaluate("all(x => x.color('#46ff95').punchcard())", false);
      } catch (err) {
        console.warn('[gallery] punchcard setup failed (要 Task5 確認):', err);
      }
    });
  }
  return initPromise;
}

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
    try {
      await evaluate(code); // 現行パターンを置換 = 同時再生は1つ
      setPlayingId(id);
    } catch (err) {
      console.error('[gallery] evaluate error', err);
      setError('EVAL: ' + (err?.message || String(err)));
      setPlayingId(null);
    }
  }, []);

  return { playingId, play, stop, error };
}
