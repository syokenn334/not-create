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
