import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const OPEN = 1; // WebSocket.OPEN

const DEFAULT_DIRS = ['patterns', 'lessons'];

// PATTERNS_DIR(カンマ区切り)を監視ディレクトリの配列に変換する。
// 未設定/空のときは patterns と lessons の両方を既定で監視する。
export function parseDirs(value, fallback = DEFAULT_DIRS) {
  const dirs = String(value ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return dirs.length ? dirs : [...fallback];
}

export function createSyncServer({
  port = 3001,
  dir = 'patterns',
  extensions = ['.strudel', '.mjs', '.js'],
} = {}) {
  const wss = new WebSocketServer({ port });
  let current = null; // 直近にブロードキャストした { type, path, content }

  function broadcast(obj) {
    const data = JSON.stringify(obj);
    for (const client of wss.clients) {
      if (client.readyState === OPEN) client.send(data);
    }
  }

  async function pushFile(filePath) {
    if (!extensions.some((ext) => filePath.endsWith(ext))) return;
    let content;
    try {
      content = await readFile(filePath, 'utf8');
    } catch (err) {
      console.error(`[strudel-sync] read error: ${filePath}: ${err.message}`);
      return;
    }
    current = { type: 'code', path: path.basename(filePath), content };
    broadcast(current);
    console.log(`[strudel-sync] pushed ${current.path} (${content.length} bytes)`);
  }

  const watcher = chokidar.watch(dir, {
    ignoreInitial: true,
    awaitWriteFinish: { stabilityThreshold: 50, pollInterval: 10 },
  });
  watcher.on('add', pushFile);
  watcher.on('change', pushFile);

  wss.on('connection', (client) => {
    console.log('[strudel-sync] client connected');
    if (current) client.send(JSON.stringify(current));

    // 制御クライアント(Zed タスク等)からの control を全クライアントへ中継する。
    client.on('message', (raw) => {
      let msg;
      try { msg = JSON.parse(raw.toString()); } catch { return; }
      if (msg && msg.type === 'control' && typeof msg.action === 'string') {
        broadcast({ type: 'control', action: msg.action });
        console.log(`[strudel-sync] control: ${msg.action}`);
      }
    });
  });

  const ready = Promise.all([
    new Promise((resolve) => wss.on('listening', resolve)),
    new Promise((resolve) => watcher.on('ready', resolve)),
  ]).then(() => undefined);

  return {
    port,
    ready,
    async close() {
      await watcher.close();
      await new Promise((resolve) => wss.close(resolve));
    },
  };
}
