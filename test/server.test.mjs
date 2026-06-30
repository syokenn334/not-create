import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { WebSocket } from 'ws';
import { createSyncServer, parseDirs } from '../lib/server.mjs';

const PORT = 34567;

test('変更された .strudel の内容を接続中クライアントに配信する', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'strudel-sync-'));
  const server = createSyncServer({ port: PORT, dir });
  await server.ready;

  const ws = new WebSocket(`ws://localhost:${PORT}`);
  const received = new Promise((resolve, reject) => {
    ws.on('message', (d) => resolve(JSON.parse(d.toString())));
    ws.on('error', reject);
  });
  await new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej); });

  const file = path.join(dir, 'live.strudel');
  await writeFile(file, 's("bd sd")');

  try {
    const msg = await received;
    assert.equal(msg.type, 'code');
    assert.equal(msg.path, 'live.strudel');
    assert.equal(msg.content, 's("bd sd")');
  } finally {
    ws.close();
    await server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('.mjs の変更も配信する', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'strudel-sync-'));
  const port = PORT + 3;
  const server = createSyncServer({ port, dir });
  await server.ready;

  const ws = new WebSocket(`ws://localhost:${port}`);
  const received = new Promise((resolve, reject) => {
    ws.on('message', (d) => resolve(JSON.parse(d.toString())));
    ws.on('error', reject);
  });
  await new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej); });

  await writeFile(path.join(dir, 'tune.mjs'), 's("hh*4")');

  try {
    const msg = await received;
    assert.equal(msg.type, 'code');
    assert.equal(msg.path, 'tune.mjs');
    assert.equal(msg.content, 's("hh*4")');
  } finally {
    ws.close();
    await server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('対象外拡張子(.txt)の変更は配信しない', async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'strudel-sync-'));
  const server = createSyncServer({ port: PORT + 1, dir });
  await server.ready;

  const ws = new WebSocket(`ws://localhost:${PORT + 1}`);
  await new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej); });

  let got = false;
  ws.on('message', () => { got = true; });

  await writeFile(path.join(dir, 'notes.txt'), 'ignore me');
  await new Promise((r) => setTimeout(r, 300));

  try {
    assert.equal(got, false);
  } finally {
    ws.close();
    await server.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('PATTERNS_DIR 未設定なら patterns と lessons の両方を既定にする', () => {
  assert.deepEqual(parseDirs(undefined), ['patterns', 'lessons']);
  assert.deepEqual(parseDirs(''), ['patterns', 'lessons']);
});

test('カンマ区切りの PATTERNS_DIR を配列に分解する(空白はトリム)', () => {
  assert.deepEqual(parseDirs('lessons'), ['lessons']);
  assert.deepEqual(parseDirs(' patterns , lessons '), ['patterns', 'lessons']);
});

test('複数ディレクトリのいずれの変更も配信する', async () => {
  const dirA = await mkdtemp(path.join(tmpdir(), 'strudel-sync-a-'));
  const dirB = await mkdtemp(path.join(tmpdir(), 'strudel-sync-b-'));
  const port = PORT + 4;
  const server = createSyncServer({ port, dir: [dirA, dirB] });
  await server.ready;

  const ws = new WebSocket(`ws://localhost:${port}`);
  const received = new Promise((resolve, reject) => {
    ws.on('message', (d) => resolve(JSON.parse(d.toString())));
    ws.on('error', reject);
  });
  await new Promise((res, rej) => { ws.on('open', res); ws.on('error', rej); });

  // 2 つ目のディレクトリ(lessons 相当)に置いたファイルも配信されること
  await writeFile(path.join(dirB, 'example.mjs'), 's("bd*2")');

  try {
    const msg = await received;
    assert.equal(msg.type, 'code');
    assert.equal(msg.path, 'example.mjs');
    assert.equal(msg.content, 's("bd*2")');
  } finally {
    ws.close();
    await server.close();
    await rm(dirA, { recursive: true, force: true });
    await rm(dirB, { recursive: true, force: true });
  }
});

test('control メッセージを全クライアントに中継する', { timeout: 2000 }, async () => {
  const dir = await mkdtemp(path.join(tmpdir(), 'strudel-sync-'));
  const port = PORT + 2;
  const server = createSyncServer({ port, dir });
  await server.ready;

  const browser = new WebSocket(`ws://localhost:${port}`);
  await new Promise((res, rej) => { browser.on('open', res); browser.on('error', rej); });

  const got = new Promise((resolve, reject) => {
    browser.on('message', (d) => {
      const m = JSON.parse(d.toString());
      if (m.type === 'control') resolve(m);
    });
    browser.on('error', reject);
  });

  const ctl = new WebSocket(`ws://localhost:${port}`);
  await new Promise((res, rej) => { ctl.on('open', res); ctl.on('error', rej); });
  ctl.send(JSON.stringify({ type: 'control', action: 'stop' }));

  try {
    const m = await got;
    assert.equal(m.type, 'control');
    assert.equal(m.action, 'stop');
  } finally {
    browser.close();
    ctl.close();
    await server.close();
    await rm(dir, { recursive: true, force: true });
  }
});
