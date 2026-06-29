# スパイク結果(Task 3)

ソース調査(`@strudel/web/web.mjs`, `@strudel/draw/{pianoroll,draw}.mjs`)で確定した事項。
実機(ブラウザ)での最終確認は Task 5 の目視/試聴で行う。

## @strudel/web のグローバル / API

- `initStrudel(options)` は **Promise を返す**(prebake 完了で resolve)。`window.initStrudel` のみ window に生える。
- **`evaluate` / `hush` は window ではなくモジュールから import する**:
  ```js
  import { initStrudel, evaluate, hush, evalScope } from '@strudel/web';
  ```
  - `evaluate(code, autoplay = true)` … コードを評価して再生(現行パターンを置換 = 同時再生は1つ)。
  - `hush()` … 停止。
- 初回 `evaluate` の前に `await initStrudel(...)` を待つこと。AudioContext は `initAudioOnFirstClick` により**最初のユーザー操作後**に動く(カードのクリックが起点なので問題なし)。

## パンチカード描画(確定方針)

- `@strudel/web` は **`@strudel/draw` を eval scope に含めない**。prebake で追加する:
  ```js
  initStrudel({ prebake: () => evalScope(import('@strudel/draw')) });
  ```
- `getDrawContext(id = 'test-canvas')` は `#test-canvas` を探し、無ければ全画面固定 canvas を生成して body に prepend する。
  → **自前で `<canvas id="test-canvas">` をレイアウトに置けば、そこが描画先**(= CRT メイン画面)。
- `Pattern.prototype.pianoroll/punchcard` は `options.ctx` に任意 ctx を渡せる(将来カードごと描画も可能)。ただし**同時再生は1つ**なので、単一の `#test-canvas` に現在再生中パターンを描く方式を採用。
- コード文字列を改変せず(多文・コメント混在の練習ログでも安全に)描くため、**`all(...)` を使う**:
  - 例: 初期化後に一度 `all(pianoroll)`(または `all(x => x.punchcard())`)を評価しておくと、以後再生される任意パターンが自動で `#test-canvas` に描かれる。
  - 採用: `all(...)` で全再生パターンに punchcard を適用 → 単一 canvas に表示。
  - **実機確認項目(Task 5)**: 正確な形(`all(pianoroll)` か `all(x => x.punchcard({ vertical: 1, labels: 1 }))`)を1つ確定する。

## CRT 樽型歪み(確定方針)

- 採用案 **(c)**: 画面全体の樽型湾曲は**省く**。走査線(CSS)+ グリッチ/ノイズ(react-vfx)+ ベゼル枠(CSS)で CRT 感を出す。
- (a) 全画面シェーダ・(b) CSS/SVG 擬似湾曲 は、余力があれば後追い。

## まとめ(downstream への前提)

- usePlayer: `import { initStrudel, evaluate, hush, evalScope } from '@strudel/web'`。`initStrudel({ prebake: () => evalScope(import('@strudel/draw')) })` を1回 await。`all(...)` を1回評価。`play=evaluate(code)`、`stop=hush()`。
- レイアウト: メイン CRT 画面に `<canvas id="test-canvas">`。
- CRT 表現: CSS(走査線/ベゼル/緑/フリッカー)+ react-vfx(グリッチ)。湾曲なし。
