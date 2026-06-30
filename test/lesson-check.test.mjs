import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateLessonString } from '../lib/lesson-check.mjs';

test('有効なパターンはイベントを生成する', async () => {
  const haps = await evaluateLessonString('s("bd*4")');
  assert.ok(haps.length >= 4, `4個以上のイベントを期待、実際は ${haps.length}`);
});

test('ミニ記法が解釈される(単一リテラル扱いにならない)', async () => {
  const haps = await evaluateLessonString('s("bd hh sd hh")', 1);
  assert.equal(haps.length, 4);
});

test('存在しない API は失敗する(架空APIの検出)', async () => {
  await assert.rejects(() => evaluateLessonString('s("bd").totallyNotAStrudelFn()'));
});

test('setcpm を含む複数文も評価できる', async () => {
  const haps = await evaluateLessonString('setcpm(130/4)\nstack(s("bd*4"), s("hh*8"))');
  assert.ok(haps.length >= 12, `12個以上を期待、実際は ${haps.length}`);
});

test('punchcard などの描画メソッドも評価できる(@strudel/draw)', async () => {
  const haps = await evaluateLessonString('s("bd*4").punchcard()');
  assert.ok(haps.length >= 4, `4個以上のイベントを期待、実際は ${haps.length}`);
});
