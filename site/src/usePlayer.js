import { useState, useCallback } from 'react';
import { initStrudel, evaluate, hush, evalScope, samples } from '@strudel/web';

// SPIKE.md 参照: evaluate/hush/samples/evalScope は import で使う。
// 既定 prebake は合成音のみなので、ドラム等のサンプルと @strudel/draw を読み込む。
let initPromise = null;
function ensureInit() {
  if (!initPromise) {
    initPromise = initStrudel({
      prebake: () =>
        Promise.all([
          evalScope(import('@strudel/draw')).catch((e) => console.warn('[gallery] draw load failed', e)),
          samples('github:tidalcycles/dirt-samples').catch((e) => console.warn('[gallery] dirt-samples failed', e)),
        ]),
    });
  }
  return initPromise;
}

// 単一式パターンを括弧で包む(末尾のセミコロンは除去)。
// .punchcard() を直接適用して #test-canvas に描画する(all() は $: 専用で素の式に効かない)。
function wrapExpr(code) {
  return '(' + code.replace(/;\s*$/, '') + '\n)';
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

    // 緑パンチカード → 既定色パンチカード → 音のみ、の順で試す。
    const attempts = [
      wrapExpr(code) + ".color('#46ff95').punchcard()",
      wrapExpr(code) + '.punchcard()',
      code,
    ];
    let lastErr = null;
    for (let i = 0; i < attempts.length; i++) {
      try {
        await evaluate(attempts[i]);
        setPlayingId(id);
        if (i === attempts.length - 1 && lastErr) {
          setError('PUNCHCARD: ' + (lastErr?.message || String(lastErr)));
        }
        return;
      } catch (err) {
        lastErr = err;
        console.warn(`[gallery] play attempt ${i} failed`, err);
      }
    }
    setError('EVAL: ' + (lastErr?.message || String(lastErr)));
    setPlayingId(null);
  }, []);

  return { playingId, play, stop, error };
}
