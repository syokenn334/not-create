import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { buildManifest } from './generate-manifest.mjs';

test('対象抽出・_除外・@title/ファイル名でtitle・再帰', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'gal-'));
  await writeFile(path.join(dir, 'a.mjs'), '// @title Cool Beat\ns("bd*4")');
  await writeFile(path.join(dir, 'b.strudel'), 's("hh*8")');
  await writeFile(path.join(dir, '_template.mjs'), 's("bd")');
  await writeFile(path.join(dir, 'notes.txt'), 'ignore');
  await mkdir(path.join(dir, 'practice'));
  await writeFile(path.join(dir, 'practice', 'day1.mjs'), 's("sd")');

  try {
    const m = await buildManifest(dir);
    assert.deepEqual(m.map((e) => e.file).sort(), ['a.mjs', 'b.strudel', 'practice/day1.mjs']);
    assert.equal(m.find((e) => e.file === 'a.mjs').title, 'Cool Beat');
    assert.equal(m.find((e) => e.file === 'b.strudel').title, 'b');
    assert.equal(m.find((e) => e.file === 'a.mjs').code.includes('bd*4'), true);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
