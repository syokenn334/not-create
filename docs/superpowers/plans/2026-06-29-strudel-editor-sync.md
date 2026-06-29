# Strudel エディタ同期 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `patterns/*.strudel` を保存すると、strudel.cc 上のパターンが音を途切れさせずに差し替わる(ホットスワップ)、エディタ非依存のライブコーディング同期ツールを作る。

**Architecture:** Node プロセスが chokidar でファイルを監視し、変更内容を `ws` の WebSocket でブロードキャストする。strudel.cc 側にユーザースクリプト(Tampermonkey/Violentmonkey)を入れ、受信したコードを `StrudelMirror.setCode()` → `evaluate()` で適用する。同期は一方向(エディタ → strudel.cc)。

**Tech Stack:** Node.js (ESM, `.mjs`)、chokidar v4(ファイル監視)、ws v8(WebSocket)、Node 組み込みテストランナー `node:test`、ユーザースクリプト(ブラウザ)。

参照スペック: `docs/superpowers/specs/2026-06-29-strudel-editor-sync-design.md`

---

## ファイル構成

| ファイル | 責務 |
|---|---|
| `package.json` | 依存・スクリプト定義(ESM) |
| `lib/server.mjs` | `createSyncServer()`: chokidar 監視 + ws サーバ + ブロードキャスト(テスト対象) |
| `watch-server.mjs` | CLI エントリ。環境変数を読み `createSyncServer` を起動 |
| `userscript/strudel-sync.user.js` | strudel.cc 内で動く WS クライアント。`setCode`→`evaluate` |
| `patterns/live.strudel` | 編集対象のサンプルパターン |
| `test/server.test.mjs` | `createSyncServer` の結合テスト(`node:test`) |
| `README.md` | セットアップ・実行手順 |

---

## Task 1: プロジェクト初期化

**Files:**
- Create: `package.json`
- Create: `.gitignore`

- [ ] **Step 1: git リポジトリを初期化**

このディレクトリは git 管理外。コミット運用のため初期化する。

Run (PowerShell):
```powershell
git init
```
Expected: `Initialized empty Git repository ...`

- [ ] **Step 2: `package.json` を作成**

```json
{
  "name": "strudel-editor-sync",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "description": "Edit .strudel files in any editor; hot-swap them into strudel.cc over WebSocket.",
  "scripts": {
    "start": "node watch-server.mjs",
    "test": "node --test"
  },
  "dependencies": {
    "chokidar": "^4.0.0",
    "ws": "^8.18.0"
  }
}
```

- [ ] **Step 3: `.gitignore` を作成**

```gitignore
node_modules/
*.log
```

- [ ] **Step 4: 依存をインストール**

Run (PowerShell):
```powershell
npm install
```
Expected: `node_modules/` が作成され、`chokidar` と `ws` が入る。エラーなく完了。

- [ ] **Step 5: コミット**

```powershell
git add package.json package-lock.json .gitignore
git commit -m "chore: scaffold strudel-editor-sync project

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: 同期サーバのコア (`lib/server.mjs`)

**Files:**
- Create: `lib/server.mjs`
- Test: `test/server.test.mjs`

- [ ] **Step 1: 失敗するテストを書く**

`test/server.test.mjs`:
```javascript
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
```

- [ ] **Step 2: テストを実行して失敗を確認**

Run:
```powershell
npm test
```
Expected: FAIL（`Cannot find module '../lib/server.mjs'` など）

- [ ] **Step 3: 最小実装を書く**

`lib/server.mjs`:
```javascript
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
```

- [ ] **Step 4: テストを実行して成功を確認**

Run:
```powershell
npm test
```
Expected: PASS（2 tests passed）

- [ ] **Step 5: コミット**

```powershell
git add lib/server.mjs test/server.test.mjs
git commit -m "feat: add file-watch + websocket sync server

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: CLI エントリ (`watch-server.mjs`)

**Files:**
- Create: `watch-server.mjs`

- [ ] **Step 1: エントリを実装**

`watch-server.mjs`:
```javascript
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
```

- [ ] **Step 2: 起動確認**

Run (PowerShell, 別ターミナル推奨):
```powershell
npm start
```
Expected: 上記ログが出て常駐する。`Ctrl+C` で停止する。確認後 `Ctrl+C`。

- [ ] **Step 3: コミット**

```powershell
git add watch-server.mjs
git commit -m "feat: add watch-server CLI entry

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: ユーザースクリプト (`userscript/strudel-sync.user.js`)

**Files:**
- Create: `userscript/strudel-sync.user.js`

> 注: ブラウザ内 + strudel.cc 依存のため自動テスト対象外。Task 6 で実機検証する。

- [ ] **Step 1: ユーザースクリプトを実装**

`userscript/strudel-sync.user.js`:
```javascript
// ==UserScript==
// @name         Strudel Sync
// @namespace    local.strudel.sync
// @version      0.1.0
// @description  Apply .strudel files pushed over ws://localhost into strudel.cc's editor.
// @match        https://strudel.cc/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
(function () {
  'use strict';

  const PORT = 3001;
  const WS_URL = `ws://localhost:${PORT}`;

  const badge = document.createElement('div');
  badge.style.cssText =
    'position:fixed;bottom:8px;right:8px;z-index:2147483647;' +
    'font:12px/1.4 monospace;padding:4px 8px;border-radius:4px;' +
    'color:#fff;background:#a33;pointer-events:none;';
  badge.textContent = 'strudel-sync: connecting…';
  function mountBadge() {
    (document.body || document.documentElement).appendChild(badge);
  }
  if (document.body) mountBadge();
  else document.addEventListener('DOMContentLoaded', mountBadge);

  // strudel.cc が公開する StrudelMirror インスタンスを取得する。
  // 実際のグローバル参照名は Task 6 でコンソール確認し、必要なら下記候補を調整する。
  function getMirror() {
    return (
      window.strudelMirror ||
      (window.editor && (window.editor.repl || window.editor)) ||
      null
    );
  }

  function apply(code) {
    const mirror = getMirror();
    if (!mirror || typeof mirror.setCode !== 'function' || typeof mirror.evaluate !== 'function') {
      console.warn('[strudel-sync] StrudelMirror が見つかりません。getMirror() を調整してください。');
      badge.style.background = '#c80';
      badge.textContent = 'strudel-sync: mirror not found';
      return;
    }
    try {
      mirror.setCode(code);
      mirror.evaluate();
    } catch (err) {
      console.error('[strudel-sync] evaluate error', err);
    }
  }

  let ws = null;
  let retry = 0;

  function connect() {
    ws = new WebSocket(WS_URL);

    ws.onopen = () => {
      retry = 0;
      badge.style.background = '#2a7';
      badge.textContent = 'strudel-sync: connected';
    };

    ws.onclose = () => {
      badge.style.background = '#a33';
      badge.textContent = 'strudel-sync: disconnected';
      retry = Math.min(retry + 1, 6);
      setTimeout(connect, 500 * 2 ** (retry - 1));
    };

    ws.onerror = () => {
      try { ws.close(); } catch (_) {}
    };

    ws.onmessage = (ev) => {
      let msg;
      try { msg = JSON.parse(ev.data); } catch (_) { return; }
      if (msg && msg.type === 'code' && typeof msg.content === 'string') {
        apply(msg.content);
      }
    };
  }

  connect();
})();
```

- [ ] **Step 2: 構文チェック(任意)**

Run (PowerShell):
```powershell
node --check userscript/strudel-sync.user.js
```
Expected: 出力なし（構文 OK）。

- [ ] **Step 3: コミット**

```powershell
git add userscript/strudel-sync.user.js
git commit -m "feat: add strudel.cc userscript ws client

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: サンプルパターンと README

**Files:**
- Create: `patterns/live.strudel`
- Create: `README.md`

- [ ] **Step 1: サンプルパターンを作成**

`patterns/live.strudel`:
```
// このファイルを編集して保存すると strudel.cc に反映される（音は途切れない）
s("bd hh sd hh").bank("RolandTR909")
```

- [ ] **Step 2: README を作成**

`README.md`:
```markdown
# strudel-editor-sync

`.strudel` ファイルを任意のエディタ(Zed など)で編集・保存すると、
strudel.cc 上のパターンが音を途切れさせずに差し替わる(ホットスワップ)同期ツール。

## 構成

エディタ → ファイル保存 → Node(chokidar + ws)→ WebSocket →
strudel.cc 内ユーザースクリプト → `StrudelMirror.setCode()` → `evaluate()`

## セットアップ

1. 依存をインストール

   ```powershell
   npm install
   ```

2. 監視サーバを起動

   ```powershell
   npm start
   ```

3. ブラウザに Tampermonkey または Violentmonkey を入れ、
   `userscript/strudel-sync.user.js` を追加する。

4. `https://strudel.cc` を開く。右下に `strudel-sync: connected` が出る。

5. ページ上で一度 Play して音を出す(ブラウザの自動再生ポリシー対策)。

6. `patterns/live.strudel` を編集・保存する。音が途切れずにパターンが変わる。

## 設定

- ポート変更: `PORT=3010 npm start`(ユーザースクリプト側の `PORT` も合わせる)
- 監視先変更: `PATTERNS_DIR=tunes npm start`

## 既知の注意点

- `https://strudel.cc` から `ws://localhost` への接続は、ブラウザがループバックを
  信頼するため Chromium 系で通る。通らない場合はスペックの将来案(ローカル
  `@strudel/web` ページ化)を検討する。
- `StrudelMirror` のグローバル参照名は strudel.cc 更新で変わり得る。
  反映されない場合はコンソールでインスタンスを確認し、
  `userscript/strudel-sync.user.js` の `getMirror()` を調整する。
- 同期は一方向(エディタ → strudel.cc)。
```

- [ ] **Step 3: コミット**

```powershell
git add patterns/live.strudel README.md
git commit -m "docs: add sample pattern and README

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: 実機エンドツーエンド検証

**Files:** なし(手動検証)

- [ ] **Step 1: サーバ起動**

Run:
```powershell
npm start
```
Expected: 監視ログが出て常駐。

- [ ] **Step 2: ユーザースクリプトを有効化して strudel.cc を開く**

Tampermonkey/Violentmonkey で `userscript/strudel-sync.user.js` を有効化し、
`https://strudel.cc` を開く。
Expected: 右下バッジが `connected`(緑)。サーバ側ログに `client connected`。

- [ ] **Step 3: `StrudelMirror` グローバル参照を確認**

ブラウザのコンソールで次を実行:
```javascript
window.strudelMirror && typeof window.strudelMirror.setCode
```
Expected: `'function'`。
- もし `undefined`/別名なら、コンソールでエディタインスタンスを特定し、
  `getMirror()` の候補を実際の参照に修正して Task 4 Step 3 を更新・再コミットする。

- [ ] **Step 4: 初回再生**

strudel.cc 上で一度 Play(または `Ctrl+Enter`)して発音させる。
Expected: 音が鳴る(AudioContext 起動)。

- [ ] **Step 5: ホットスワップ確認**

`patterns/live.strudel` を例えば次に変更して保存:
```
s("bd*2 hh sd hh").bank("RolandTR909")
```
Expected: **音を止めずに**パターンが変わる。バッジは `connected` のまま。

- [ ] **Step 6: 構文エラー耐性確認**

`patterns/live.strudel` に壊れたコードを保存:
```
s("bd hh sd hh"  // 閉じ括弧なし
```
Expected: 直前のパターンが鳴り続ける。strudel.cc / コンソールにエラー表示。
その後、正しいコードに戻して保存すると復帰する。

- [ ] **Step 7: 再接続確認**

サーバを `Ctrl+C` で止め、再度 `npm start`。
Expected: バッジが一旦 `disconnected`(赤)→ 自動で `connected`(緑)に戻る。

- [ ] **Step 8: 検証結果をコミット(必要な修正があれば)**

Task 4 の `getMirror()` を実機に合わせて修正した場合のみ:
```powershell
git add userscript/strudel-sync.user.js
git commit -m "fix: align getMirror() with strudel.cc runtime handle

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## 完了条件(スペック §8 対応)

- [ ] `npm install` → `npm start` でサーバが起動する(Task 1, 3)
- [ ] ユーザースクリプト有効状態で strudel.cc を開くと `connected` 表示(Task 6 Step 2)
- [ ] 一度 Play 後、`.strudel` 保存で音が途切れずパターンが変わる(Task 6 Step 5)
- [ ] 構文エラー保存でも直前パターンが鳴り続ける(Task 6 Step 6)
- [ ] サーバ再起動でユーザースクリプトが自動再接続(Task 6 Step 7)
