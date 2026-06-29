import { createSyncServer } from './lib/server.mjs';

const port = Number(process.env.PORT) || 3001;
const dir = process.env.PATTERNS_DIR || 'patterns';

const server = createSyncServer({ port, dir });
await server.ready;

console.log(`[strudel-sync] watching ${dir}/**/*.strudel`);
console.log(`[strudel-sync] WebSocket: ws://localhost:${port}`);
console.log('[strudel-sync] 1) ユーザースクリプトを有効化して https://strudel.cc を開く');
console.log('[strudel-sync] 2) 一度 Play して音を出す（自動再生ポリシー対策）');
console.log('[strudel-sync] 3) patterns/ の .strudel を保存すると反映される');

process.on('SIGINT', async () => {
  console.log('\n[strudel-sync] shutting down');
  await server.close();
  process.exit(0);
});
