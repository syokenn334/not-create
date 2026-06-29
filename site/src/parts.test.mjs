import { test } from 'node:test';
import assert from 'node:assert/strict';
import { splitParts } from './parts.js';

test('$: が無ければソース全体を1パートとして返す', () => {
  assert.deepEqual(splitParts('s("bd*2 sd")'), ['s("bd*2 sd")']);
});

test('末尾セミコロンと空白を除去する', () => {
  assert.deepEqual(splitParts('  s("bd") ;  \n'), ['s("bd")']);
});

test('複数の $: を各パートに分割する', () => {
  const code = '$: s("bd*2 sd")\n$: s("hh*8").gain(0.4)';
  assert.deepEqual(splitParts(code), ['s("bd*2 sd")', 's("hh*8").gain(0.4)']);
});

test('パートが複数行にまたがってもよい', () => {
  const code = '$: stack(\n  s("bd"),\n  s("sd")\n)\n$: s("hh*8")';
  assert.deepEqual(splitParts(code), ['stack(\n  s("bd"),\n  s("sd")\n)', 's("hh*8")']);
});

test('空のパート（$: のみ）は除外する', () => {
  const code = '$: s("bd")\n$:\n$: s("hh")';
  assert.deepEqual(splitParts(code), ['s("bd")', 's("hh")']);
});

test('空文字列は空配列', () => {
  assert.deepEqual(splitParts('   '), []);
});

test('$ と : の間に空白があっても認識する', () => {
  assert.deepEqual(splitParts('$ : s("bd")'), ['s("bd")']);
});
