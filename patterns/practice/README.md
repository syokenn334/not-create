# Strudel 練習ログ — 音楽の仕組みを学ぶ

目的: Strudel で**鳴らしながら音楽の仕組み**(リズム・スケール・ハーモニー・構成・サンプリング)を学び、
いずれ **作曲・remix** ができるようになる。三日坊主対策として「毎日ちょっと」を最優先する。

## 毎日のやり方(10〜15分 / 1ループ)

1. `_template.mjs` をコピーして `YYYY-MM-DD-dayN.mjs` の名前で保存
2. その日のテーマ(下のロードマップ)を1つだけやる
3. 末尾の「次回やること」を**必ず1行**書く(再開コストを下げる)
4. `STREAK.md` に印を付ける(チェーンを切らさない)
5. 週1で、その週の断片を `stack(...)` で1曲にまとめ、Strudel の share リンクで1個だけ共有

ノルマは「10分」または「1ループ完成」まで。やりたければ続けてOK、でも義務はここまで。

## 教材の組み合わせ

- **概念を学ぶ**: Ableton「Learning Music」 https://learningmusic.ableton.com/ (無料・インタラクティブ)。
  ビート/音符/スケール/コード/ベースライン/曲構成を手を動かして理解できる。
- **実装して鳴らす**: Strudel 公式 Workshop https://strudel.cc/workshop/getting-started/ と、この練習ログ。
- 各回の流れ: 「Learning Music で概念をつかむ → Strudel で実装して鳴らす」。

## ロードマップ(音楽の概念 ↔ Strudel)

### Phase 1: リズムとグルーヴ
- 概念: 拍・小節・サブディビジョン、四つ打ち、裏拍、休符と密度、ユークリッドリズム
- Strudel: `s`、mini-notation(`*` `[]` `<>` `~` `,`)、`euclid`、`swingBy`
- 例: `s("bd*4, [~ hh]*2, ~ sd")`

### Phase 2: メロディとスケール/調
- 概念: 音名・オクターブ、メジャー/マイナースケール、調、度数
- Strudel: `note`、`n(...).scale("C:minor")`
- 例: `n("0 2 4 6 7").scale("C:minor")`

### Phase 3: ハーモニー(コード)
- 概念: 三和音、定番進行(I–V–vi–IV など)、ボイシング、ベース=ルート
- Strudel: 同時発音 `note("c eb g")`、`voicings`/`voicing`(@strudel/tonal)
- 例: `note("<C Am F G>").voicings()`

### Phase 4: 音作り(音色)
- 概念: 波形、フィルタ=明るさ、エンベロープ(`attack`/`release`)、空間(`room`/`delay`)
- Strudel: `gain` `lpf` `cutoff` `attack` `release` `room` `delay` `shape` `speed`
- 例: `n("0 3 5 7").scale("C:minor").lpf(800).room(.4)`

### Phase 5: 構成・アレンジ(= 作曲)
- 概念: レイヤー(縦)、セクション(イントロ/A/サビ)、ビルドアップ、抜き差し、緊張と解放
- Strudel: `stack`(縦に重ねる)、`cat`/`seq`/`arrange`(時間で展開)、`every` `mask` `degradeBy` `sometimesBy`(抜き差し)
- 例: `arrange([4, intro], [8, groove], [8, drop])`

### Phase 6: サンプリングと remix
- 概念: チョップ、リピッチ、タイムストレッチ、既存素材の再構成(= 素材 × 並べ替え × 加工)
- Strudel: `samples(...)` で音源読込、`chop` `slice` `speed` `loopAt` `fit`
- ローカルサンプルは strudel.cc の sounds-import タブ、または `@strudel/sampler`

## 補足

- ここ(`patterns/practice/`)に置けば `npm start` 中は strudel.cc に同期され、`.mjs` なので補完も効く。
- 公式 Workshop の章(Getting Started → First Sounds → First Notes → First Effects → Pattern Effects → Recap)は
  Phase 1〜4 とほぼ対応。Phase 5・6 は Workshop の先の「作曲・remix」向け拡張。
