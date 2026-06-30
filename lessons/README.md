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

### Phase 2 音色・ベース編
- [ ] M4 サウンド基礎(`04-sound-basics/`)
- [ ] M5 フィルターと空間(`05-filter-space/`)
- [ ] M6 ベースライン(`06-bassline/`)
- [ ] 統合B グルーヴ完成(`integration-B-groove/`)

### Phase 3 和声編
- [ ] M7 スケールと音程(`07-scales-intervals/`)
- [ ] M8 和音の基礎(`08-chords/`)
- [ ] M9 テンションとボイシング(`09-voicing-tension/`)
- [ ] 統合C 1 コーラス完成(`integration-C-chorus/`)

### Phase 4 構成・仕上げ編
- [ ] M10 アレンジとテクスチャ(`10-arrange-texture/`)
- [ ] M11 曲の構成(`11-song-structure/`)
- [ ] M12 ミックスと作品化(`12-mix-finish/`)
- [ ] 統合D 1 曲完成(`integration-D-track/`)

これで Phase 1〜4 のカリキュラムは完成です。各レッスンを順に進め、統合D で構成のある 1 曲を作り上げてください。
