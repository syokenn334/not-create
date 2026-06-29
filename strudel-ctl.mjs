import { WebSocket } from 'ws';

const VALID = new Set(['stop', 'toggle', 'play']);
const action = process.argv[2];

if (!VALID.has(action)) {
  console.error(`[strudel-ctl] unknown command: ${action ?? '(none)'} — use: stop | toggle | play`);
  process.exit(1);
}

const port = Number(process.env.PORT) || 3001;
const ws = new WebSocket(`ws://localhost:${port}`);

ws.on('open', () => {
  ws.send(JSON.stringify({ type: 'control', action }), () => {
    ws.close();
  });
});

ws.on('close', () => process.exit(0));

ws.on('error', (err) => {
  console.error(`[strudel-ctl] ${err.message} — サーバ(npm start)は起動していますか?`);
  process.exit(1);
});
