# strudel-editor-sync

`.strudel` ファイルを任意のエディタ(Zed など)で編集・保存すると、
strudel.cc 上のパターンが音を途切れさせずに差し替わる(ホットスワップ)同期ツール。
再生/停止も Zed 側のキー操作から行える。

## 構成

エディタ → ファイル保存 → Node(chokidar + ws)→ WebSocket →
strudel.cc 内クライアント → `StrudelMirror.setCode()` → `evaluate()`

制御(再生/停止)は Zed タスク → `npm run stop/toggle/play` → ws 中継 → `StrudelMirror.stop()/toggle()/evaluate()`。

## セットアップ

1. 依存をインストール

   ```powershell
   npm install
   ```

2. 監視サーバを起動

   ```powershell
   npm start
   ```

3. strudel.cc に WS クライアントを注入する。次のどちらかを選ぶ。

   - **ブックマークレット(拡張機能不要・推奨)**
     1. `npm run bookmarklet` を実行(`bookmarklet/strudel-sync.bookmarklet.txt` が生成される)
     2. その中身(`javascript:` から始まる文字列)をコピー
     3. ブラウザで新規ブックマークを作り、URL 欄に貼り付けて保存
     4. `https://strudel.cc` を開き、そのブックマークをクリック

   - **ユーザースクリプト(Tampermonkey/Violentmonkey)**
     - `userscript/strudel-sync.user.js` を新規スクリプトとして登録

   いずれの場合も、右下に `strudel-sync: connected`(緑)が出れば成功。

4. strudel.cc 上で一度 Play して音を出す(ブラウザの自動再生ポリシー対策)。

5. `patterns/live.strudel`(や他の `.strudel`)を編集・保存すると、音が途切れずにパターンが変わる。

## Zed から再生/停止

`npm start` 起動中に、別ターミナルまたは Zed タスクから:

```powershell
npm run stop     # 停止
npm run toggle   # 再生/停止トグル
npm run play     # 再評価(再生)
```

`.zed/tasks.json` に「Strudel: Stop / Toggle / Play」を定義済み。
キーに割り当てるには、Zed の `keymap.json`(グローバル設定)に追記する:

```json
[
  {
    "context": "Workspace",
    "bindings": {
      "alt-.": ["task::Spawn", { "task_name": "Strudel: Toggle" }],
      "alt-shift-.": ["task::Spawn", { "task_name": "Strudel: Stop" }]
    }
  }
]
```

## 設定

- ポート変更: `PORT=3010 npm start`(注入側スクリプトの `PORT` も合わせる)
- 監視先変更: `PATTERNS_DIR=tunes npm start`

## 既知の注意点

- `https://strudel.cc` から `ws://localhost` への接続は、ブラウザがループバックを
  信頼するため Chromium 系で通る(ブックマークレットでも動作することを numekudi 氏の記事で確認)。
- `StrudelMirror` のグローバル参照名は strudel.cc 更新で変わり得る。
  反映されない場合はコンソールで `window.strudelMirror` を確認し、
  注入スクリプトの `getMirror()` を調整する。
- 同期は一方向(エディタ → strudel.cc)。
