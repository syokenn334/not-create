# Strudel ギャラリーサイト Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** `patterns/` のパターンをグリッドに並べ、クリックで音とパンチカードが再生される CRT モニタ風のギャラリーサイトを作り、push で GitHub Pages に自動公開する。

**Architecture:** React + Vite の静的サイト。ビルド時に生成スクリプトが `../patterns/` を読んで `patterns.json` を作る。`@strudel/web` で再生、`@strudel/draw` でパンチカード描画、`react-vfx` でグリッチ、CSS で走査線/ベゼル/緑/フォント。GitHub Actions で push → ビルド → Pages。

**Tech Stack:** React 18, Vite 5, `@strudel/web`, `@strudel/draw`, `@vfx-js/react`, `@vitejs/plugin-react`, Node 標準テスト(`node:test`), GitHub Actions Pages。

参照スペック: `docs/superpowers/specs/2026-06-29-strudel-gallery-site-design.md`

**UI 実装の方針:** ロジック(生成スクリプト・`usePlayer`・wiring)は本プランに具体コードを記載。**見た目(CRT の CSS・カードの装飾・react-vfx エフェクト)は frontend-design スキルで実装**する(本プランは各コンポーネントの契約=props/状態/責務を定義し、美観は frontend-design に委ねる)。

---

## ファイル構成

| ファイル | 責務 |
|---|---|
| `site/package.json` | 依存・スクリプト(React/Vite/strudel/vfx) |
| `site/vite.config.js` | React プラグイン + `base`(Pages サブパス) |
| `site/index.html` | ルート要素 + DotGothic16 読込 |
| `site/.gitignore` | `node_modules` / `dist` / `src/patterns.json` |
| `site/scripts/generate-manifest.mjs` | `../patterns` 走査 → `src/patterns.json`(テスト対象) |
| `site/scripts/generate-manifest.test.mjs` | 生成スクリプトの単体テスト |
| `site/src/main.jsx` | React エントリ |
| `site/src/App.jsx` | グリッド + `playingId` 状態 |
| `site/src/Card.jsx` | 1パターン(タイトル/canvas/再生)+ react-vfx |
| `site/src/usePlayer.js` | `@strudel/web` ラッパフック |
| `site/src/crt.css` | CRT ビジュアル(frontend-design) |
| `site/SPIKE.md` | スパイク結果の記録 |
| `.github/workflows/deploy.yml` | push → ビルド → Pages |
| `LICENSE` | AGPL-3.0 全文 |

---

## Task 1: site/ スキャフォルド(React + Vite)

**Files:**
- Create: `site/package.json`, `site/vite.config.js`, `site/index.html`, `site/.gitignore`, `site/src/main.jsx`, `site/src/App.jsx`

- [ ] **Step 1: `site/package.json` を作成**

```json
{
  "name": "strudel-gallery",
  "private": true,
  "type": "module",
  "scripts": {
    "generate": "node scripts/generate-manifest.mjs",
    "dev": "npm run generate && vite",
    "build": "npm run generate && vite build",
    "preview": "vite preview",
    "test": "node --test"
  }
}
```

- [ ] **Step 2: 依存をインストール(バージョンは npm に解決させる)**

Run (PowerShell, `site/` 内で):
```powershell
cd site
npm install react react-dom @strudel/web @strudel/draw @vfx-js/react
npm install -D vite @vitejs/plugin-react
```
Expected: `node_modules/` 生成、`dependencies`/`devDependencies` が package.json に追記され、エラーなし。

- [ ] **Step 3: `site/vite.config.js` を作成**

```js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base は GitHub Pages のサブパス。CI では VITE_BASE を設定する(Task 8)。
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
});
```

- [ ] **Step 4: `site/index.html` を作成**

```html
<!doctype html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Strudel Gallery</title>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DotGothic16&display=swap" rel="stylesheet" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
```

- [ ] **Step 5: `site/.gitignore` を作成**

```gitignore
node_modules/
dist/
src/patterns.json
```

- [ ] **Step 6: 最小の `site/src/main.jsx` と `site/src/App.jsx` を作成**

`site/src/main.jsx`:
```jsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(<App />);
```

`site/src/App.jsx`:
```jsx
import React from 'react';

export default function App() {
  return <h1>Strudel Gallery</h1>;
}
```

- [ ] **Step 7: 起動確認**

Run:
```powershell
cd site
npm run dev
```
Expected: Vite が起動し `http://localhost:5173` で "Strudel Gallery" が表示される(`npm run generate` がまだ patterns.json を作らずエラーになる場合は Task 2 まで `dev` ではなく `vite` 単体で確認)。確認後停止。

- [ ] **Step 8: コミット**

```powershell
cd ..
git add site/package.json site/package-lock.json site/vite.config.js site/index.html site/.gitignore site/src/main.jsx site/src/App.jsx
git commit -m "chore: scaffold React+Vite gallery site

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: マニフェスト生成スクリプト(TDD)

**Files:**
- Create: `site/scripts/generate-manifest.mjs`
- Test: `site/scripts/generate-manifest.test.mjs`

- [ ] **Step 1: 失敗するテストを書く**

`site/scripts/generate-manifest.test.mjs`:
```javascript
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
```

- [ ] **Step 2: テストを実行して失敗を確認**

Run:
```powershell
cd site
npm test
```
Expected: FAIL（`Cannot find module './generate-manifest.mjs'`）

- [ ] **Step 3: 実装を書く**

`site/scripts/generate-manifest.mjs`:
```javascript
import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const EXTS = ['.mjs', '.strudel'];

export async function buildManifest(dir) {
  const entries = [];
  async function walk(d) {
    let items;
    try {
      items = await readdir(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const it of items) {
      const full = path.join(d, it.name);
      if (it.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!EXTS.includes(path.extname(it.name))) continue;
      if (it.name.startsWith('_')) continue;
      const code = await readFile(full, 'utf8');
      const rel = path.relative(dir, full).split(path.sep).join('/');
      const id = rel.replace(/\.(mjs|strudel)$/, '').replace(/[^a-zA-Z0-9]+/g, '__');
      const m = code.match(/\/\/\s*@title\s+(.+)/);
      const title = m ? m[1].trim() : path.basename(it.name).replace(/\.(mjs|strudel)$/, '');
      entries.push({ id, title, file: rel, code });
    }
  }
  await walk(dir);
  entries.sort((a, b) => a.file.localeCompare(b.file));
  return entries;
}

// CLI として直接実行されたときだけマニフェストを書き出す
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const patternsDir = path.resolve(__dirname, '../../patterns');
  const out = path.resolve(__dirname, '../src/patterns.json');
  const entries = await buildManifest(patternsDir);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(entries, null, 2));
  console.log(`[generate] ${entries.length} patterns -> src/patterns.json`);
}
```

- [ ] **Step 4: テストを実行して成功を確認**

Run:
```powershell
cd site
npm test
```
Expected: PASS（1 test）

- [ ] **Step 5: 生成を実行して patterns.json を確認**

Run:
```powershell
cd site
npm run generate
```
Expected: `[generate] N patterns -> src/patterns.json` と表示され、`site/src/patterns.json` が生成される(N は patterns/ の対象数)。

- [ ] **Step 6: コミット**

```powershell
cd ..
git add site/scripts/generate-manifest.mjs site/scripts/generate-manifest.test.mjs
git commit -m "feat: add gallery manifest generator

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: スパイク(パンチカード描画 / CRT 樽型歪み)

**Files:**
- Create: `site/SPIKE.md`

> 検証タスク。downstream(Task 4–6)の前提を確定する。コードは scratch で試し、結論を `SPIKE.md` に記録する。

- [ ] **Step 1: `@strudel/web` のグローバル API を確認**

`site/src/usePlayer.js` を書く前に、`initStrudel()` 後に `window` へ何が生えるか(`evaluate`, `hush`, `samples` 等)をブラウザのコンソールで確認する。`site/src/App.jsx` に一時的に `import { initStrudel } from '@strudel/web'; initStrudel(); window.__s = true;` を入れて `npm run dev` で開き、コンソールで `typeof window.evaluate`, `typeof window.hush` を確認。

- [ ] **Step 2: 任意パターンのパンチカード描画方法を検証**

次の候補を scratch で順に試し、**カードごとの `<canvas>`** に1パターンのパンチカードを描ける方法を1つ確定する:
1. パターン式に `.punchcard({ id: <canvasId> })` を付けて `evaluate` する(`@strudel/draw` の punchcard は描画先 canvas を id 等で指定できるか確認)。
2. `@strudel/draw` の `pianoroll(pattern, { ctx })` / `drawPianoroll(ctx, haps, ...)` を直接呼ぶ。
3. 1つの全画面 canvas に現在再生中パターンのみ描く(カードごとではなく単一表示)。

判定基準: 複数文・コメント混在のパターン(練習ログ)でも破綻しないこと。難しければ候補3(再生中のみ単一表示)に落とす。

- [ ] **Step 3: CRT 樽型歪みの方針を決める**

次から1つ選ぶ:
- (a) 全画面 WebGL シェーダで DOM をテクスチャ化して歪ませる(`html2canvas` 等が必要・重い)
- (b) CSS/SVG filter で擬似湾曲
- (c) 湾曲は省き、走査線+グリッチ(react-vfx)+ベゼルで CRT 感を出す

工数と効果で判断。**まず (c) を既定とし、(a)(b) は余力があれば**、という方針でよい。

- [ ] **Step 4: 結論を `site/SPIKE.md` に記録**

`site/SPIKE.md` に「window グローバル名」「採用したパンチカード描画方法(手順・必要な呼び出し)」「CRT 湾曲の採用案」を箇条書きで残す。Task 4–6 はこの結論に従う。

- [ ] **Step 5: 一時コードを除去してコミット**

`App.jsx` の一時 import を消し、`SPIKE.md` を追加。
```powershell
git add site/SPIKE.md site/src/App.jsx
git commit -m "docs: record spike findings (punchcard draw, CRT distortion)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: `usePlayer` フック(再生 + パンチカード)

**Files:**
- Create: `site/src/usePlayer.js`

> SPIKE.md の結論(window グローバル名・描画方法)に合わせて実装する。下記は第一候補に基づくベースライン。

- [ ] **Step 1: `usePlayer.js` を実装**

`site/src/usePlayer.js`:
```javascript
import { useState, useCallback } from 'react';
import { initStrudel } from '@strudel/web';

let initialized = false;
function ensureInit() {
  if (initialized) return;
  initStrudel(); // 初回のみ。AudioContext は最初のユーザー操作後に動く
  initialized = true;
}

// SPIKE.md で確定した描画方法に置き換える。第一候補: 式末尾に .punchcard() を付けて評価。
function withPunchcard(code) {
  return `${code}\n.punchcard()`;
}

export function usePlayer() {
  const [playingId, setPlayingId] = useState(null);

  const stop = useCallback(() => {
    if (typeof window.hush === 'function') window.hush();
    setPlayingId(null);
  }, []);

  const play = useCallback((id, code) => {
    ensureInit();
    try {
      // 同時再生は1つ: evaluate が現行パターンを置き換える
      window.evaluate(withPunchcard(code));
      setPlayingId(id);
    } catch (err) {
      console.error('[gallery] evaluate error', err);
      setPlayingId(null);
    }
  }, []);

  return { playingId, play, stop };
}
```

- [ ] **Step 2: 構文チェック**

Run:
```powershell
cd site
node --check src/usePlayer.js
```
Expected: 出力なし(OK)。

- [ ] **Step 3: 手動確認(Task 5 のカード接続後にまとめて検証するため、ここではビルド通過のみ)**

Run:
```powershell
cd site
npx vite build
```
Expected: ビルド成功(import エラーが無いこと)。

- [ ] **Step 4: コミット**

```powershell
cd ..
git add site/src/usePlayer.js
git commit -m "feat: add usePlayer hook (strudel play/stop + punchcard)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: ギャラリー UI(App / Card)+ CRT ビジュアル

**Files:**
- Create: `site/src/Card.jsx`, `site/src/crt.css`
- Modify: `site/src/App.jsx`

> **このタスクは frontend-design スキルで実装する。** 下記は「契約(必須の構造・props・状態・責務)」。frontend-design には CRT モニタ風(緑リン光 / DotGothic16 / 走査線 / ベゼル枠 / フリッカー / グリッチ=react-vfx)という美観要件と、この契約を渡す。

- [ ] **Step 1: frontend-design スキルを起動し、以下の契約で実装**

契約:
- `App.jsx`:
  - `import patterns from './patterns.json'`(配列 `{id,title,file,code}`)。
  - `const { playingId, play, stop } = usePlayer()`。
  - パターンを**グリッド**に並べ、各要素に `<Card pattern={p} isPlaying={p.id===playingId} onToggle={() => p.id===playingId ? stop() : play(p.id, p.code)} />`。
  - `import './crt.css'`。
- `Card.jsx`:
  - props: `{ pattern, isPlaying, onToggle }`。
  - 表示: `pattern.title`、パンチカード用 `<canvas>`(SPIKE の描画方法に合わせた id/参照)、再生/停止トグルボタン(`onToggle`)。
  - `react-vfx`(`@vfx-js/react`)でカードまたはタイトルに glitch/ノイズを付与。再生中は強める等。
- `crt.css`: 緑リン光カラー、`font-family: 'DotGothic16'`、走査線(`repeating-linear-gradient` オーバーレイ)、`position: fixed` のベゼル枠、フリッカー(微小 opacity アニメ)、ビネット。

美観要件: 全体 CRT モニタ風、文字は緑、CRT らしい走査線/グリッチ/ベゼル。樽型歪みは SPIKE.md の採用案に従う。

- [ ] **Step 2: 生成 → 開発起動して目視確認**

Run:
```powershell
cd site
npm run dev
```
Expected: カードがグリッド表示され、CRT 風の見た目(緑・走査線・ベゼル・DotGothic16)。

- [ ] **Step 3: 手動 E2E(再生 + パンチカード + 単一再生)**

ブラウザで:
- カードをクリック → **音が鳴る**、そのカードに**パンチカードが描画**される。
- 別カードをクリック → 前が止まり新しい方が鳴る(**同時再生は1つ**)。
- 同じカードを再クリック → 停止。
- 構文エラーのパターンを置いても他カードは再生可能(クラッシュしない)。

- [ ] **Step 4: コミット**

```powershell
cd ..
git add site/src/App.jsx site/src/Card.jsx site/src/crt.css
git commit -m "feat: gallery UI with CRT visuals and react-vfx (frontend-design)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: LICENSE(AGPL-3.0)

**Files:**
- Create: `LICENSE`

- [ ] **Step 1: 公式 AGPL-3.0 全文を取得**

Run (リポジトリルート):
```powershell
curl -L -o LICENSE https://www.gnu.org/licenses/agpl-3.0.txt
```
Expected: `LICENSE` が作成され、先頭が "GNU AFFERO GENERAL PUBLIC LICENSE" で始まる。

- [ ] **Step 2: 確認**

Run:
```powershell
Get-Content LICENSE -TotalCount 1
```
Expected: `                    GNU AFFERO GENERAL PUBLIC LICENSE`

- [ ] **Step 3: コミット**

```powershell
git add LICENSE
git commit -m "chore: add AGPL-3.0 LICENSE (bundles @strudel/web, @vfx-js)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: GitHub Actions で Pages デプロイ

**Files:**
- Create: `.github/workflows/deploy.yml`

- [ ] **Step 1: ワークフローを作成**

`.github/workflows/deploy.yml`:
```yaml
name: Deploy gallery to Pages
on:
  push:
    branches: [main]
  workflow_dispatch:
permissions:
  contents: read
  pages: write
  id-token: write
concurrency:
  group: pages
  cancel-in-progress: true
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - name: Configure Pages
        id: pages
        uses: actions/configure-pages@v5
      - name: Install & build
        working-directory: site
        env:
          VITE_BASE: ${{ steps.pages.outputs.base_path }}
        run: |
          npm ci
          npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: site/dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

- [ ] **Step 2: `site/package-lock.json` がコミットされていることを確認**(`npm ci` に必要)

Run:
```powershell
git ls-files site/package-lock.json
```
Expected: `site/package-lock.json` が表示される(無ければ `cd site; npm install` 後に add)。

- [ ] **Step 3: コミット**

```powershell
git add .github/workflows/deploy.yml
git commit -m "ci: deploy gallery to GitHub Pages on push

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: GitHub リポジトリ作成と公開(個人アカウント)

**Files:** なし(セットアップ操作)

> `CLAUDE.md` のとおり**個人アカウント `syokenn334` で push**する。gh の切替が必要。

- [ ] **Step 1: gh アカウントを個人に切替**

事前に一度だけ(ユーザーが対話的に): `gh auth login --user syokenn334`。
その後:
```powershell
gh auth switch --user syokenn334
gh auth status
```
Expected: アクティブアカウントが `syokenn334`。

- [ ] **Step 2: リモートリポジトリを作成して push**

Run (リポジトリルート):
```powershell
gh repo create strudel-gallery --public --source=. --remote=origin --push
```
Expected: 公開リポジトリが作成され、`main` が push される。author が `syokenn334 <yannyaya@icloud.com>` であること。

- [ ] **Step 3: Pages を「GitHub Actions」ソースに設定**

GitHub リポジトリの Settings → Pages → Build and deployment → Source = **GitHub Actions**。
push 済みなので Actions が走り、`deploy` ジョブが Pages URL を出力する。

- [ ] **Step 4: 公開確認**

Actions の `Deploy gallery to Pages` が成功し、出力された Pages URL を開く。

---

## Task 9: 公開 E2E 検証

**Files:** なし(手動検証)

- [ ] **Step 1: ローカル本番ビルドの確認**

Run:
```powershell
cd site
npm run build
npm run preview
```
Expected: `preview` の URL でギャラリーが表示・再生・パンチカード描画される。

- [ ] **Step 2: Pages 上の検証**

公開 URL で:
- カードがグリッド表示、CRT ビジュアル。
- クリックで音が鳴り、パンチカードが出る。
- 同時再生が1つに制限される。

- [ ] **Step 3: 自動公開の確認**

`patterns/` に新しい `.mjs` を1つ追加して commit & push → Actions が走り、数分後に公開サイトへ自動反映されることを確認。

---

## 完了条件(スペック §8 対応)

- [ ] `site` で `npm test` がパス(generate-manifest)(Task 2)
- [ ] `npm run build` 成功(Task 1,4,5,7)
- [ ] グリッド表示・クリックで音+パンチカード・同時再生1つ(Task 5,9)
- [ ] CRT ビジュアル(緑/DotGothic16/走査線/ベゼル/グリッチ)(Task 5)
- [ ] push → GitHub Pages 自動公開(Task 7,8,9)
- [ ] LICENSE(AGPL-3.0)あり(Task 6)
