import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { WebSocket } from 'ws';
import { createSyncServer } from '../lib/server.mjs';

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

test('.strudel 以外の変更は配信しない', async () => {
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
