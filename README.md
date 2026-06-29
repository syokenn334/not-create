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
