import { WebSocketServer } from 'ws';
import chokidar from 'chokidar';
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const OPEN = 1; // WebSocket.OPEN

export function createSyncServer({ port = 3001, dir = 'patterns' } = {}) {
  const wss = new WebSocketServer({ port });
  let current = null; // 直近にブロードキャストした { type, path, content }

  async function pushFile(filePath) {
    if (!filePath.endsWith('.strudel')) return;
    let content;
    try {
      content = await readFile(filePath, 'utf8');
    } catch (err) {
      console.error(`[strudel-sync] read error: ${filePath}: ${err.message}`);
      return;
    }
    current = { type: 'code', path: path.basename(filePath), content };
    const data = JSON.stringify(current);
    for (const client of wss.clients) {
      if (client.readyState === OPEN) client.send(data);
    }
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
