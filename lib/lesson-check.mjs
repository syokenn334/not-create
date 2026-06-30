import { readFile } from 'node:fs/promises';
import { register } from 'node:module';

// --- @kabelsalat/web の ESM ビルドへ解決を強制する ---
// @strudel/core@1.2.6 の dist は `import { SalatRepl } from "@kabelsalat/web"` を
// トップレベルで静的 import している。しかし @kabelsalat/web は `exports` マップを
// 持たず `"main": "dist/index.js"`(UMD/CJS)を指すため、Node の ESM は
// dist/index.js を選び、SalatRepl 名前付きエクスポートを検出できず import が落ちる
// (ESM の dist/index.mjs には SalatRepl が存在する)。ブラウザ/Vite は "module"
// フィールドを尊重して .mjs を読むのでこの問題は出ないが、ヘッドレス(素の Node)
// では出る。下記フックは @kabelsalat/web を .mjs ビルドへ解決し直し、strudel.cc と
// 同じ評価経路(core+mini+tonal+transpiler)を Node 上で成立させる。
const kabelsalatEsmHook = `
export async function resolve(specifier, context, next) {
  if (specifier === '@kabelsalat/web') {
    return next(specifier + '/dist/index.mjs', context);
  }
  return next(specifier, context);
}`;
register('data:text/javascript,' + encodeURIComponent(kabelsalatEsmHook));

const { evalScope, evaluate } = await import('@strudel/core');
const { transpiler } = await import('@strudel/transpiler');

let initialized = false;

async function init() {
  if (initialized) return;
  // core / mini / tonal の全エクスポートを評価スコープ(globalThis)に注入する
  await evalScope(
    import('@strudel/core'),
    import('@strudel/mini'),
    import('@strudel/tonal'),
  );
  // ミニ記法の文字列パーサを登録("bd*4" を 4 イベントに展開させる)
  const { miniAllStrings } = await import('@strudel/mini');
  miniAllStrings();
  // テンポ/トランスポート系はオフラインの queryArc に影響しないため no-op シムを置く
  for (const name of ['setcpm', 'setcps', 'setCpm', 'setCps']) {
    if (typeof globalThis[name] !== 'function') globalThis[name] = () => {};
  }
  initialized = true;
}

/** strudel.cc 方言のコード文字列を評価し、最初の `cycles` サイクル分のイベント配列を返す */
export async function evaluateLessonString(code, cycles = 4) {
  await init();
  const { pattern } = await evaluate(code, transpiler);
  if (!pattern || typeof pattern.queryArc !== 'function') {
    throw new Error('評価結果がパターンではありません(最後の式がパターンを返していない可能性)');
  }
  return pattern.queryArc(0, cycles);
}

/** ファイルパスを評価してイベント配列を返す */
export async function evaluateLessonFile(path, cycles = 4) {
  const code = await readFile(path, 'utf8');
  return evaluateLessonString(code, cycles);
}
