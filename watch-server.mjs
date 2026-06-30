import { createSyncServer, parseDirs } from './lib/server.mjs';

const port = Number(process.env.PORT) || 3001;
const dirs = parseDirs(process.env.PATTERNS_DIR);

const server = createSyncServer({ port, dir: dirs });
await server.ready;

console.log(`[strudel-sync] watching ${dirs.join(', ')}/ (.strudel / .mjs / .js)`);
console.log(`[strudel-sync] WebSocket: ws://localhost:${port}`);
console.log('[strudel-sync] 1) https://strudel.cc を開き、ブックマークレット(npm run bookmarklet)か');
console.log('[strudel-sync]    ユーザースクリプトを実行 -> 右下が connected になる');
console.log('[strudel-sync] 2) 一度 Play して音を出す（ブラウザ自動再生ポリシー対策）');
console.log(`[strudel-sync] 3) ${dirs.join(' / ')} 配下の .strudel / .mjs を保存すると反映（補完を効かせるなら .mjs）`);
console.log('[strudel-sync] このターミナルは開いたまま。stop/toggle/play や他コマンドは別ターミナルで。');

process.on('SIGINT', async () => {
  console.log('\n[strudel-sync] shutting down');
  await server.close();
  process.exit(0);
});
