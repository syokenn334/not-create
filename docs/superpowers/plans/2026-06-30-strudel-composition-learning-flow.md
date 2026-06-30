# Strudel 作曲学習フロー(Phase 1: リズム編)実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Strudel も音楽理論も初学の学習者が、ハウス/テクノのリズムを題材に「理論 + Strudel 操作」を同時に学べる、リポジトリ内完結のレッスン基盤と Phase 1(リズム編)レッスン一式を構築する。

**Architecture:** `lessons/` 配下に「概念別レッスン(README + example.mjs + practice.mjs + CHALLENGE.md)」を段階配置する。各 `.mjs` は strudel.cc 方言の単一/複数文として書き、既存 editor-sync(`PATTERNS_DIR=lessons npm start`)で保存即試聴する。各 example/practice は、本物の Strudel ランタイム(@strudel/core+mini+tonal+transpiler)でヘッドレス評価し「エラーなく音イベントを生成するか」を自動スモークテストする(綴り間違い・存在しない API を検出)。最終的な「音として良いか」は strudel.cc で耳で確認する。

**Tech Stack:** Node.js (ESM, `node --test`), `@strudel/core` / `@strudel/mini` / `@strudel/tonal`(導入済み) + `@strudel/transpiler`(本計画で追加), 既存 editor-sync(`lib/server.mjs`)。

---

## スコープ

本計画は **インフラ + Phase 0(M0)+ Phase 1(M1–M3)+ 統合A** に限定する(= リズム編一式)。
Phase 2(音色・ベース)/ Phase 3(和声)/ Phase 4(構成・仕上げ)は、本計画で作る基盤(スモークテスト・テンプレート・CHEATSHEET/GLOSSARY)を再利用する**後続プラン**として別途作成する。
設計の全体像は `docs/superpowers/specs/2026-06-30-strudel-composition-learning-flow-design.md` を参照。

## File Structure

作成・変更するファイルと責務:

- `package.json`(変更): `@strudel/transpiler` を devDependencies に追加。`check-lesson` / `check-lessons` スクリプトを追加。
- `lib/lesson-check.mjs`(新規): レッスン `.mjs` を本物の Strudel ランタイムで評価し、生成イベント配列を返す純関数群(`evaluateLessonString` / `evaluateLessonFile`)。テスト可能な中核。
- `test/lesson-check.test.mjs`(新規): 上記の `node --test` 用テスト。良いコードは通り、存在しない API は失敗することを保証。
- `scripts/check-lesson.mjs`(新規): 上記 lib を使う薄い CLI。引数のファイル群、または `--all` で `lessons/` 配下の全 `.mjs` をスモークテストし、失敗時に exit code 1。
- `lessons/README.md`(新規): ロードマップ・進め方・練習の起動手順。
- `lessons/CHEATSHEET.md`(新規): 「作曲概念 ↔ Strudel 関数」対応表 兼 構文早見表。レッスンごとに追記。
- `lessons/GLOSSARY.md`(新規): 初学者向け用語集。
- `lessons/00-getting-started/`(新規): M0。README.md / example.mjs / practice.mjs / CHALLENGE.md。
- `lessons/01-cycle-and-kick/`(新規): M1。同上。
- `lessons/02-hats-subdivision/`(新規): M2。同上。
- `lessons/03-groove/`(新規): M3。同上。
- `lessons/integration-A-beat/`(新規): 統合A。README.md / brief.mjs / rubric.md。

各レッスンフォルダは「1 音楽概念 + 1 Strudel 操作」の独立ユニット。`example.mjs` は完成見本、`practice.mjs` は TODO 穴埋め、`CHALLENGE.md` は課題要件 + 講評 rubric。

---

## Task 1: レッスン・スモークチェッカー(lib/lesson-check.mjs)

**Files:**
- Modify: `package.json`(devDependencies に `@strudel/transpiler` を追加)
- Create: `lib/lesson-check.mjs`
- Test: `test/lesson-check.test.mjs`

- [ ] **Step 1: 依存パッケージを追加**

Run:
```bash
npm install -D @strudel/transpiler
```
Expected: `package.json` の devDependencies に `@strudel/transpiler` が入り、`node_modules/@strudel/transpiler/` が生成される。
（注: 導入済みの core は 1.2.6。Step 5 のテストが import/評価でこける場合はバージョン不整合を疑い、`npm view @strudel/transpiler versions` を確認して core と同系統(1.2.x)を `@strudel/transpiler@1.2.x` で明示インストールする。）

- [ ] **Step 2: 失敗するテストを書く**

`test/lesson-check.test.mjs`:
```js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { evaluateLessonString } from '../lib/lesson-check.mjs';

test('有効なパターンはイベントを生成する', async () => {
  const haps = await evaluateLessonString('s("bd*4")');
  assert.ok(haps.length >= 4, `4個以上のイベントを期待、実際は ${haps.length}`);
});

test('ミニ記法が解釈される(単一リテラル扱いにならない)', async () => {
  const haps = await evaluateLessonString('s("bd hh sd hh")', 1);
  assert.equal(haps.length, 4);
});

test('存在しない API は失敗する(架空APIの検出)', async () => {
  await assert.rejects(() => evaluateLessonString('s("bd").totallyNotAStrudelFn()'));
});

test('setcpm を含む複数文も評価できる', async () => {
  const haps = await evaluateLessonString('setcpm(130/4)\nstack(s("bd*4"), s("hh*8"))');
  assert.ok(haps.length >= 12, `12個以上を期待、実際は ${haps.length}`);
});
```

- [ ] **Step 3: テストを実行して失敗を確認**

Run:
```bash
node --test test/lesson-check.test.mjs
```
Expected: FAIL（`lib/lesson-check.mjs` が無いため import エラー / モジュール未解決）。

- [ ] **Step 4: 最小実装を書く**

`lib/lesson-check.mjs`:
```js
import { readFile } from 'node:fs/promises';
import { evalScope, evaluate } from '@strudel/core';
import { transpiler } from '@strudel/transpiler';

let initialized = false;

async function init() {
  if (initialized) return;
  // core / mini / tonal の全エクスポートを評価スコープ(globalThis)に注入する
  await evalScope(
    import('@strudel/core'),
    import('@strudel/mini'),
    import('@strudel/tonal'),
  );
  // ミニ記法の文字列パーサを登録("bd*4" を 4 イベントに展開させる)
  const { miniAllStrings } = await import('@strudel/mini');
  miniAllStrings();
  // テンポ/トランスポート系はオフラインの queryArc に影響しないため no-op シムを置く
  for (const name of ['setcpm', 'setcps', 'setCpm', 'setCps']) {
    if (typeof globalThis[name] !== 'function') globalThis[name] = () => {};
  }
  initialized = true;
}

/** strudel.cc 方言のコード文字列を評価し、最初の `cycles` サイクル分のイベント配列を返す */
export async function evaluateLessonString(code, cycles = 4) {
  await init();
  const { pattern } = await evaluate(code, transpiler);
  if (!pattern || typeof pattern.queryArc !== 'function') {
    throw new Error('評価結果がパターンではありません(最後の式がパターンを返していない可能性)');
  }
  return pattern.queryArc(0, cycles);
}

/** ファイルパスを評価してイベント配列を返す */
export async function evaluateLessonFile(path, cycles = 4) {
  const code = await readFile(path, 'utf8');
  return evaluateLessonString(code, cycles);
}
```

- [ ] **Step 5: テストを実行して成功を確認**

Run:
```bash
node --test test/lesson-check.test.mjs
```
Expected: PASS（4 テストすべて）。

トラブルシュート:
- `@strudel/transpiler` の import で失敗 → Step 1 の注記に従いバージョンを合わせる。
- ミニ記法ラッパー(例: `m` / `mini`)が未定義という ReferenceError → transpiler が生成する呼び出し名が評価スコープに無い。`evalScope` に `import('@strudel/mini')` が含まれていること、`miniAllStrings()` を呼んでいることを確認する(両方とも上記実装に含む)。この組み合わせは strudel.cc の REPL と同じ評価経路。

- [ ] **Step 6: コミット**

```bash
git add package.json package-lock.json lib/lesson-check.mjs test/lesson-check.test.mjs
git commit -m "feat(lessons): レッスン.mjs のヘッドレス・スモークチェッカーを追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: スモークテスト CLI(scripts/check-lesson.mjs)+ npm スクリプト

**Files:**
- Create: `scripts/check-lesson.mjs`
- Modify: `package.json:7-15`(scripts に `check-lesson` / `check-lessons` を追加)

- [ ] **Step 1: CLI を実装**

`scripts/check-lesson.mjs`:
```js
import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { evaluateLessonFile } from '../lib/lesson-check.mjs';

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...(await walk(p)));
    else if (ent.name.endsWith('.mjs')) out.push(p);
  }
  return out;
}

const args = process.argv.slice(2);
const files = args.includes('--all') || args.length === 0 ? await walk('lessons') : args;

let failed = 0;
for (const f of files) {
  try {
    const haps = await evaluateLessonFile(f);
    if (!haps.length) throw new Error('イベントが 0(音が出ない)');
    console.log(`OK   ${f}  (${haps.length} events / 4 cycles)`);
  } catch (err) {
    failed++;
    console.error(`FAIL ${f}\n     ${err.message}`);
  }
}
console.log(`\n${files.length - failed}/${files.length} OK`);
process.exit(failed ? 1 : 0);
```

- [ ] **Step 2: npm スクリプトを追加**

`package.json` の `scripts` に追加(既存の行は残す):
```json
    "check-lesson": "node scripts/check-lesson.mjs",
    "check-lessons": "node scripts/check-lesson.mjs --all"
```

- [ ] **Step 3: 既知の良いコードで動作確認**

一時ファイルで確認する:
```bash
node -e "require('fs').mkdirSync('lessons/_smoke',{recursive:true});require('fs').writeFileSync('lessons/_smoke/ok.mjs','stack(s(\"bd*4\"), s(\"hh*8\"))')"
npm run check-lesson -- lessons/_smoke/ok.mjs
```
Expected: `OK   lessons/_smoke/ok.mjs  (48 events / 4 cycles)` と `1/1 OK`、exit code 0。
（`bd*4` + `hh*8` = 12 events/サイクル × 4 サイクル = 48。）

- [ ] **Step 4: 一時ファイルを削除**

```bash
node -e "require('fs').rmSync('lessons/_smoke',{recursive:true,force:true})"
```

- [ ] **Step 5: コミット**

```bash
git add scripts/check-lesson.mjs package.json
git commit -m "feat(lessons): スモークテスト CLI と npm スクリプトを追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: トップレベルのレッスン文書(README / CHEATSHEET / GLOSSARY)

**Files:**
- Create: `lessons/README.md`
- Create: `lessons/CHEATSHEET.md`
- Create: `lessons/GLOSSARY.md`

- [ ] **Step 1: `lessons/README.md` を作成**

内容(以下をそのまま記載):
````markdown
# Strudel 作曲レッスン(ハウス/テクノ・理論理解型)

Strudel も音楽理論も初めての人が、手を動かしながら「音楽理論」と「Strudel の使い方」を
同時に学ぶためのレッスン集です。各レッスンは独立しており、上から順に進めます。

## 進め方(1 レッスンの流れ)

1. レッスンの `README.md` を読む(「今回の Strudel」「今回の音楽理論」を確認)
2. `example.mjs` を鳴らして耳で確認する
3. `practice.mjs` の TODO を埋める
4. `CHALLENGE.md` の課題に挑戦する
5. Claude に「lesson NN を講評して」と依頼する(音楽 + コードの両面で講評)
6. 気に入ったらギャラリーに作品として残す

## 練習環境の起動

```powershell
# レッスン配下を監視対象にして同期サーバを起動
$env:PATTERNS_DIR="lessons"; npm start
```

その後 strudel.cc を開き、ブックマークレット/ユーザースクリプトを実行(リポジトリ直下の
README 参照)、一度 Play。以後、各レッスンの `.mjs` を保存すると音が即差し替わります。
再生/停止は `npm run play` / `npm run stop` / `npm run toggle`。

## 自分のコードを確認する(任意)

書いた `.mjs` がエラーなく鳴るかは、ブラウザを開かずに確認できます:

```bash
npm run check-lesson -- lessons/01-cycle-and-kick/practice.mjs
npm run check-lessons   # lessons/ 配下を一括チェック
```

## ロードマップ

### Phase 1 リズム編
- [ ] M0 はじめの一歩(`00-getting-started/`)
- [ ] M1 サイクルとキック(`01-cycle-and-kick/`)
- [ ] M2 ハットと細分化(`02-hats-subdivision/`)
- [ ] M3 グルーヴ(`03-groove/`)
- [ ] 統合A ビート完成(`integration-A-beat/`)

### Phase 2 以降(今後追加)
音色・ベース編 / 和声編 / 構成・仕上げ編。
````

- [ ] **Step 2: `lessons/CHEATSHEET.md` を作成**

内容:
````markdown
# チートシート(作曲概念 ↔ Strudel)

レッスンが進むごとに追記します。各関数の正確な引数は strudel.cc 公式ドキュメントで確認できます。

## ミニ記法(文字列の中で使う書き方)

| 記法 | 意味 | 例 |
|---|---|---|
| `a b c` | 1 サイクルを 3 等分して順に鳴らす | `s("bd hh sd")` |
| `a*4` | 1 サイクルに 4 回 | `s("bd*4")`(4 つ打ち) |
| `[a b]` | グループ(さらに細分化) | `s("bd [hh hh]")` |
| `~` | 休符(無音) | `s("bd ~ sd ~")` |
| `<a b>` | サイクルごとに交替 | `s("<bd sd>")` |
| `,`(カンマ) | 同時に重ねる | `s("bd*4, hh*8")` |

## 概念 ↔ 関数

| 作曲概念 | Strudel | 備考 |
|---|---|---|
| 音を選ぶ | `s("bd")` / `sound` | 内蔵のドラム音など |
| 4 つ打ち | `s("bd*4")` | キックを 4 分で |
| テンポ | `setcpm(BPM/4)` | 1 サイクル = 1 小節(4 拍)前提 |
| 重ねる | `stack(a, b, ...)` / `"a, b"` | 複数レイヤー |
| 音量・アクセント | `.gain(0.5)` / `.gain("0.5 0.8")` | 0〜1 |
| スウィング | `.swing(4)` / `.swingBy(1/3, 4)` | はねたリズム |
| ユークリッドリズム | `.euclid(3, 8)` | k 個を n 等分に均等配置 |
| 残響 | `.room(0.3)` | 空間 |
| 構造の指定 | `.struct("x ~ x x")` | リズムの骨組み |
````

- [ ] **Step 3: `lessons/GLOSSARY.md` を作成**

内容:
````markdown
# 用語集(初学者向け)

| 用語 | 意味 |
|---|---|
| サイクル(cycle) | Strudel の時間の単位。基本的に「1 小節」と考えてよい。`s("a b c d")` は 1 サイクルを 4 等分する。 |
| 小節(bar) | 拍のまとまり。ここでは 4 拍 = 1 小節 = 1 サイクルとして扱う。 |
| 拍(beat) | 一定間隔の脈。4 つ打ちは 1 拍ごとにキックが鳴る。 |
| BPM | 1 分間の拍数。Strudel は「1 分間のサイクル数(cpm)」で指定するため、`setcpm(BPM/4)`。 |
| サブディビジョン | 1 拍をさらに分けること(8 分音符 = 1 拍を 2 分割)。 |
| スウィング | 等分ではなく「タッ・タ」とはねるリズムの揺らし。 |
| ユークリッドリズム | k 個の音を n 個の枠になるべく均等に配置する手法(`euclid(3,8)` など)。 |
| アクセント | 特定の音を強く鳴らして強弱をつけること(`gain` で表現)。 |
````

- [ ] **Step 4: コミット**

```bash
git add lessons/README.md lessons/CHEATSHEET.md lessons/GLOSSARY.md
git commit -m "docs(lessons): トップレベルの README / チートシート / 用語集を追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: M0 はじめの一歩(00-getting-started)

**Files:**
- Create: `lessons/00-getting-started/README.md`
- Create: `lessons/00-getting-started/example.mjs`
- Create: `lessons/00-getting-started/practice.mjs`
- Create: `lessons/00-getting-started/CHALLENGE.md`

- [ ] **Step 1: `example.mjs` を作成**

```js
// M0 はじめの一歩
// 1 サイクル(=1 小節)に 1 回だけキックが鳴る、いちばん小さいパターン。
s("bd")
```

- [ ] **Step 2: `practice.mjs` を作成**

```js
// M0 練習
// TODO: "bd" を "bd hh" に変えて保存し、1 サイクルに 2 音入れて聴き比べよう。
// さらに "bd hh sd hh" にすると 1 サイクルが 4 等分される。
s("bd")
```

- [ ] **Step 3: `README.md` を作成**

以下の構成・要点で日本語の解説を書く(箇条書きの内容を文章化し、コードは下記をそのまま埋め込む):

- 見出し: `# M0 はじめの一歩`
- 冒頭に2行:
  - `**今回の Strudel:** サイクルの考え方 / ミニ記法の読み方 / 評価して音を出す`
  - `**今回の音楽理論:** 拍と小節(時間の捉え方)`
- 「サイクルとは」: Strudel は時間を「サイクル」という単位で繰り返す。基本は 1 サイクル = 1 小節。`s("bd")` は 1 サイクルに 1 回キックが鳴る、と説明。
- 「ミニ記法の読み方」: ダブルクォートの中はミニ記法。スペースで区切ると 1 サイクルがその数だけ等分される(`"a b c d"` → 4 等分)。`example.mjs` のコードを引用して読み解く。
- 「やってみる」: 練習環境の起動(`$env:PATTERNS_DIR="lessons"; npm start`)→ strudel.cc 注入 → Play → `example.mjs` を保存、と手順を書き、`lessons/README.md` の「練習環境の起動」へリンク。
- 最後に「`CHALLENGE.md` に進む」と案内。

- [ ] **Step 4: `CHALLENGE.md` を作成**

内容:
````markdown
# 課題: M0

## やること
`practice.mjs` を編集して、**1 サイクルに 4 つの音**(例: `bd hh bd hh`)を等間隔で並べる。

## 完成チェックリスト
- [ ] 1 サイクルに音が 4 つ鳴る
- [ ] スペース区切りで等分されていることを、音を聴いて確認した
- [ ] `npm run check-lesson -- lessons/00-getting-started/practice.mjs` が OK

## 講評の観点(Claude 用 rubric)
1. 1 サイクルに 4 音が等間隔で並んでいるか
2. ミニ記法(スペース区切り)を正しく使えているか
3. コードが最小・素直か
4. 次の一歩: テンポ(`setcpm`)と 4 つ打ちへ(M1)
````

- [ ] **Step 5: スモークテスト**

Run:
```bash
npm run check-lesson -- lessons/00-getting-started/example.mjs lessons/00-getting-started/practice.mjs
```
Expected: 2 ファイルとも `OK`(`s("bd")` は 1 サイクル 1 音 × 4 サイクル = 各 4 events / 4 cycles)、`2/2 OK`。

- [ ] **Step 6: CHEATSHEET 更新は不要(M0 は新関数なし)。コミット**

```bash
git add lessons/00-getting-started
git commit -m "feat(lessons): M0 はじめの一歩を追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: M1 サイクルとキック(01-cycle-and-kick)

**Files:**
- Create: `lessons/01-cycle-and-kick/README.md`
- Create: `lessons/01-cycle-and-kick/example.mjs`
- Create: `lessons/01-cycle-and-kick/practice.mjs`
- Create: `lessons/01-cycle-and-kick/CHALLENGE.md`

- [ ] **Step 1: `example.mjs` を作成**

```js
// M1 サイクルとキック(4 つ打ち)
// setcpm で BPM を指定(1 サイクル = 1 小節 = 4 拍なので BPM/4)。
// "bd*4" は 1 サイクルにキックを 4 回 = 4 つ打ち。
setcpm(130 / 4)
s("bd*4")
```

- [ ] **Step 2: `practice.mjs` を作成**

```js
// M1 練習
setcpm(130 / 4)
// TODO 1: 数字を変えてテンポを変えてみよう(例: 124 / 4、128 / 4)。
// TODO 2: "bd*4" を "bd*2" や "bd*8" にして、1 拍あたりのキック数を変えてみよう。
s("bd*4")
```

- [ ] **Step 3: `README.md` を作成**

構成・要点:
- 見出し: `# M1 サイクルとキック`
- 冒頭2行:
  - `**今回の Strudel:** \`setcpm\` / \`*\`(連符)/ \`s("bd*4")\``
  - `**今回の音楽理論:** 4 つ打ち・テンポ(BPM)・拍子`
- 「4 つ打ちとは」: ハウス/テクノの土台。1 小節 4 拍すべてにキック。安定した推進力を生む、と説明。
- 「テンポの指定」: Strudel は「1 分間のサイクル数(cpm)」。1 サイクル = 1 小節(4 拍)とするので、BPM を 4 で割って `setcpm(130/4)`。ハウスは概ね 120–130 BPM と補足。
- 「`*` の意味」: `"bd*4"` は「bd を 1 サイクルに 4 回」。`example.mjs` を読み解く。
- 「やってみる」: テンポと連符の数字を変えて体感する。

- [ ] **Step 4: `CHALLENGE.md` を作成**

内容:
````markdown
# 課題: M1

## やること
124 BPM の 4 つ打ちキックを作る。さらに 1 サイクルおきにテンポ感の違いを聴き比べる。

## 完成チェックリスト
- [ ] `setcpm(124/4)` でテンポを指定している
- [ ] `s("bd*4")` で 4 つ打ちになっている
- [ ] BPM を 120 / 128 に変えて違いを聴いた
- [ ] `npm run check-lesson -- lessons/01-cycle-and-kick/practice.mjs` が OK

## 講評の観点(Claude 用 rubric)
1. テンポ指定が BPM/4 の考え方に沿っているか
2. 4 つ打ちが正しく表現されているか
3. コードが素直か(不要な記述がないか)
4. 次の一歩: ハイハットと細分化(8/16 分)で隙間を埋める(M2)
````

- [ ] **Step 5: スモークテスト**

Run:
```bash
npm run check-lesson -- lessons/01-cycle-and-kick/example.mjs lessons/01-cycle-and-kick/practice.mjs
```
Expected: 両方 `OK`(`bd*4` = 4 events/サイクル × 4 サイクル = 各 16 events / 4 cycles)、`2/2 OK`。

- [ ] **Step 6: CHEATSHEET にテンポ行が既にあることを確認(Task 3 で記載済み)。コミット**

```bash
git add lessons/01-cycle-and-kick
git commit -m "feat(lessons): M1 サイクルとキックを追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 6: M2 ハットと細分化(02-hats-subdivision)

**Files:**
- Create: `lessons/02-hats-subdivision/README.md`
- Create: `lessons/02-hats-subdivision/example.mjs`
- Create: `lessons/02-hats-subdivision/practice.mjs`
- Create: `lessons/02-hats-subdivision/CHALLENGE.md`

- [ ] **Step 1: `example.mjs` を作成**

```js
// M2 ハットと細分化
// stack で複数のレイヤーを同時に鳴らす。
setcpm(130 / 4)
stack(
  s("bd*4"),          // キック(4 分)
  s("hh*8"),          // ハイハット(8 分)
  s("~ cp ~ cp"),     // クラップを 2 拍目・4 拍目に
)
```

- [ ] **Step 2: `practice.mjs` を作成**

```js
// M2 練習
setcpm(130 / 4)
stack(
  s("bd*4"),
  // TODO 1: ハットを "hh*16"(16 分)にして細かくしてみよう。
  s("hh*8"),
  // TODO 2: クラップの位置を "~ cp ~ cp" から "~ ~ cp ~" などに変えてみよう。
  s("~ cp ~ cp"),
  // TODO 3: 新しい行で s("oh ~ ~ ~") のようにオープンハットを足してみよう。
)
```

- [ ] **Step 3: `README.md` を作成**

構成・要点:
- 見出し: `# M2 ハットと細分化`
- 冒頭2行:
  - `**今回の Strudel:** \`stack\` / \`[]\` / \`~\`(休符)/ \`,\` / \`<>\``
  - `**今回の音楽理論:** サブディビジョン(8/16 分)・レイヤー・拍の位置`
- 「レイヤーを重ねる」: `stack(...)` で複数パターンを同時に鳴らす。`"a, b"` のカンマでも同じこと、と説明。
- 「サブディビジョン」: 1 拍を分割する。8 分 = 1 サイクルに 8 音 = `"hh*8"`。16 分は `"hh*16"`。細かくするほど忙しくなる。
- 「拍の位置と休符」: `"~ cp ~ cp"` は 4 等分のうち 2・4 番目に cp。`~` は休符。スネア/クラップは 2・4 拍に置くのが定番(バックビート)、と説明。
- 「グループ `[]`」: `"bd [hh hh]"` のように一部だけさらに細分化できる、と一言。
- 「やってみる」: 3 つの TODO を試す。

- [ ] **Step 4: `CHALLENGE.md` を作成**

内容:
````markdown
# 課題: M2

## やること
キック(4 分)+ ハイハット(8 分)+ バックビートのクラップ(2・4 拍)を重ね、
さらにオープンハット等を 1 レイヤー足して、隙間のあるビートにする。

## 完成チェックリスト
- [ ] `stack` で 3 レイヤー以上を重ねている
- [ ] クラップ(またはスネア)が 2 拍目・4 拍目に来ている
- [ ] ハイハットの細かさ(8 分 / 16 分)を試した
- [ ] `npm run check-lesson -- lessons/02-hats-subdivision/practice.mjs` が OK

## 講評の観点(Claude 用 rubric)
1. レイヤーが意図どおり重なっているか(役割の重複・衝突がないか)
2. バックビート(2・4 拍)の理解が反映されているか
3. ミニ記法(`*` `~` `[]`)を適切に使えているか
4. 次の一歩: スウィングとユークリッドでグルーヴを出す(M3)
````

- [ ] **Step 5: スモークテスト**

Run:
```bash
npm run check-lesson -- lessons/02-hats-subdivision/example.mjs lessons/02-hats-subdivision/practice.mjs
```
Expected: 両方 `OK`(`example.mjs` は bd4 + hh8 + cp2 = 56 events / 4 cycles 程度)、`2/2 OK`。

- [ ] **Step 6: コミット**

```bash
git add lessons/02-hats-subdivision
git commit -m "feat(lessons): M2 ハットと細分化を追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 7: M3 グルーヴ(03-groove)

**Files:**
- Create: `lessons/03-groove/README.md`
- Create: `lessons/03-groove/example.mjs`
- Create: `lessons/03-groove/practice.mjs`
- Create: `lessons/03-groove/CHALLENGE.md`

- [ ] **Step 1: `example.mjs` を作成**

```js
// M3 グルーヴ(スウィング・アクセント・ユークリッド)
setcpm(130 / 4)
stack(
  s("bd*4"),
  s("hh*8").gain("0.5 0.8").swing(4),   // 8 分ハット、強弱(アクセント)+スウィング
  s("~ cp ~ cp").room(0.25),            // クラップ(2・4 拍)に少し残響
  s("rim").euclid(3, 8).gain(0.5),      // ユークリッド(3/8)のパーカッション
)
```

- [ ] **Step 2: `practice.mjs` を作成**

```js
// M3 練習
setcpm(130 / 4)
stack(
  s("bd*4"),
  // TODO 1: .swing(4) の数字を変える / .swingBy(1/3, 8) に置き換えて、はね方の違いを聴く。
  s("hh*8").gain("0.5 0.8"),
  s("~ cp ~ cp").room(0.25),
  // TODO 2: euclid の数字を (5, 8) や (3, 8) に変えて、パーカッションの密度を変える。
  s("rim").euclid(3, 8).gain(0.5),
)
```

- [ ] **Step 3: `README.md` を作成**

構成・要点:
- 見出し: `# M3 グルーヴ`
- 冒頭2行:
  - `**今回の Strudel:** \`.gain\` / \`.swing\` ・ \`.swingBy\` / \`.euclid\` / \`.room\``
  - `**今回の音楽理論:** スウィング・シンコペーション・アクセント・ユークリッドリズム`
- 「アクセント(強弱)」: `.gain("0.5 0.8")` のように値をパターンにすると、音ごとに音量が変わりノリが出る、と説明。
- 「スウィング」: 等分だとマシン的。`.swing(4)`(= `.swingBy(1/3,4)`)で後ろの音を遅らせてはねさせる。数字はサイクルの分割数、と説明。
- 「ユークリッドリズム」: `.euclid(3,8)` は「8 枠に 3 音をなるべく均等配置」。手で書きにくい民族的・反復的なパーカッションを簡単に作れる、と説明。
- 「残響」: `.room(0.25)` で空間を足す(やりすぎ注意)。
- 「やってみる」: 2 つの TODO。

- [ ] **Step 4: `CHALLENGE.md` を作成**

内容:
````markdown
# 課題: M3

## やること
M2 のビートに、スウィング・アクセント・ユークリッドのパーカッションを加えて「ノリ」を出す。

## 完成チェックリスト
- [ ] ハイハットに `gain` パターンでアクセントが付いている
- [ ] スウィング(`swing` / `swingBy`)を適用して、はねを聴き分けた
- [ ] `euclid` のパーカッションが入っている
- [ ] `npm run check-lesson -- lessons/03-groove/practice.mjs` が OK

## 講評の観点(Claude 用 rubric)
1. スウィング量が過剰/不足でなく、ジャンルに合っているか
2. アクセントの付け方が音楽的か(機械的になっていないか)
3. ユークリッドの密度がビート全体と噛み合っているか
4. 次の一歩: 学んだ要素を 1 つにまとめて 2 小節のビートに(統合A)
````

- [ ] **Step 5: スモークテスト**

Run:
```bash
npm run check-lesson -- lessons/03-groove/example.mjs lessons/03-groove/practice.mjs
```
Expected: 両方 `OK`、`2/2 OK`。

- [ ] **Step 6: CHEATSHEET を確認**

`lessons/CHEATSHEET.md` に スウィング / ユークリッド / 残響 / アクセント の行が Task 3 で記載済みであることを確認(不足があれば追記)。変更した場合のみ add する。

- [ ] **Step 7: コミット**

```bash
git add lessons/03-groove lessons/CHEATSHEET.md
git commit -m "feat(lessons): M3 グルーヴを追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 8: 統合A ビート完成(integration-A-beat)

**Files:**
- Create: `lessons/integration-A-beat/README.md`
- Create: `lessons/integration-A-beat/brief.mjs`
- Create: `lessons/integration-A-beat/rubric.md`

- [ ] **Step 1: `brief.mjs` を作成(学習者の出発点となる足場)**

```js
// 統合A: 2 小節で展開するハウス/テクノのビート
// これは出発点です。M1〜M3 で学んだ要素を足して、自分のビートに育ててください。
setcpm(130 / 4)
stack(
  s("bd*4"),
  // TODO: ハイハット(8 分、アクセント + スウィング)を足す  ← M3
  // TODO: クラップ/スネアを 2・4 拍に置く                  ← M2
  // TODO: euclid のパーカッションを足す                    ← M3
  // TODO: 2 小節目で何かを変化させる。例:
  //   s("<bd*4 [bd*4 bd*2]>")  のように <> でサイクルごとに切り替える
  //   または every(2, x => x.fast(2)) で 2 サイクルに 1 回変化させる
)
```

- [ ] **Step 2: `README.md` を作成**

構成・要点:
- 見出し: `# 統合A: ビート完成`
- 冒頭2行:
  - `**まとめる Strudel:** \`stack\` / \`*\` \`~\` \`[]\` \`<>\` / \`.gain\` \`.swing\` \`.euclid\` \`.room\` / \`every\``
  - `**まとめる音楽理論:** 4 つ打ち・バックビート・サブディビジョン・スウィング・2 小節単位の展開`
- 「狙い」: M1〜M3 の要素を 1 つの `stack` にまとめ、**2 小節(2 サイクル)で変化する**ビートを完成させる、と説明。
- 「展開の付け方」: 単純な 1 小節ループは飽きる。`<>`(サイクルごと交替)や `every(2, ...)`(N サイクルに 1 回変化)で 2 小節のうねりを作る、と説明。`every` の使い方を1例(`s("hh*8").every(2, x => x.fast(2))` 等)で示す。
- 「進め方」: `brief.mjs` の TODO を上から埋める。`rubric.md` の項目を満たしたら完成。
- 「仕上げ」: 完成したらギャラリーに作品として残してもよい(リポジトリ直下 README / ギャラリー仕様を参照)。

- [ ] **Step 3: `rubric.md` を作成**

内容:
````markdown
# 統合A 講評 rubric

## 必須要件
- [ ] 4 つ打ちキックがある
- [ ] ハイハットがあり、アクセント(gain)かスウィングが付いている
- [ ] クラップ/スネアが 2・4 拍(バックビート)にある
- [ ] ユークリッド等のパーカッションが 1 つ以上ある
- [ ] 2 小節(2 サイクル)で聴いて、変化・展開がある(`<>` や `every` など)
- [ ] `npm run check-lesson -- lessons/integration-A-beat/brief.mjs` が OK

## 講評の観点(Claude 用)
1. 各レイヤーの役割が分かれ、ぶつかっていないか(周波数帯・拍の住み分け)
2. グルーヴ(スウィング/アクセント)がジャンルとして自然か
3. 2 小節の展開が単調でないか、やりすぎていないか
4. コードの読みやすさ(レイヤーごとの意図がコメントや構造で分かるか)
5. 次の一歩: Phase 2(音色・ベース編)へ。シンセ音作りとベースラインを学ぶ。
````

- [ ] **Step 4: スモークテスト**

Run:
```bash
npm run check-lesson -- lessons/integration-A-beat/brief.mjs
```
Expected: `OK   lessons/integration-A-beat/brief.mjs  (16 events / 4 cycles)`、`1/1 OK`(bd*4 のみのため)。

- [ ] **Step 5: コミット**

```bash
git add lessons/integration-A-beat
git commit -m "feat(lessons): 統合A ビート完成課題を追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 9: 全体検証と仕上げ

**Files:**
- Modify: `lessons/README.md`(ロードマップのチェックボックスを完了に更新)

- [ ] **Step 1: 全レッスンの一括スモークテスト**

Run:
```bash
npm run check-lessons
```
Expected: `lessons/` 配下の全 `.mjs`(example / practice / brief)がすべて `OK`、最終行 `N/N OK`、exit code 0。
失敗があれば、その `.mjs` を修正してから次へ。

- [ ] **Step 2: ユニットテスト**

Run:
```bash
npm test
```
Expected: `lesson-check` のテストを含め PASS。

- [ ] **Step 3: 実機(strudel.cc)で耳による確認**

手順:
1. `$env:PATTERNS_DIR="lessons"; npm start`
2. strudel.cc にブックマークレット/ユーザースクリプトを注入し Play
3. 各レッスンの `example.mjs` を順に開いて保存し、**意図どおりの音が鳴るか**を耳で確認する(M0→M1→M2→M3→統合A)
4. 問題があったレッスンの `.mjs` / README を修正する

このステップは自動化できない最終確認。スモークテストは「鳴る」ことを保証するが、「狙った音か」は人が聴いて判断する。

- [ ] **Step 4: ロードマップを更新**

`lessons/README.md` の Phase 1 のチェックボックスを、確認できたものから `- [x]` に更新する。

- [ ] **Step 5: コミット**

```bash
git add lessons/README.md
git commit -m "docs(lessons): Phase 1 の検証完了をロードマップに反映" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## 完了の定義(Phase 1)

- `lib/lesson-check.mjs` と CLI が動作し、`npm run check-lessons` / `npm test` が green。
- `lessons/` に トップレベル文書 + M0〜M3 + 統合A が揃い、全 `.mjs` がスモークテストを通過。
- strudel.cc 上で各 example が意図どおり鳴ることを耳で確認済み。
- 学習者が `lessons/README.md` の手順に従って Phase 1 を独習できる状態。

## 次のプラン(本計画スコープ外)

- Phase 2(音色・ベース編 M4–M6 + 統合B): シンセ波形・ADSR・フィルター・`scale("c:minor")` でのベースライン。
- Phase 3(和声編 M7–M9 + 統合C): スケール・三和音・コード進行 `"<Am F C G>"`・`voicing()` / `rootNotes()`。
- Phase 4(構成・仕上げ M10–M12 + 統合D): `mask`/`when`/`every`・`arrange`・ミックス・ギャラリー作品化。

いずれも本計画の スモークテスト基盤・テンプレート・CHEATSHEET/GLOSSARY を再利用する。
