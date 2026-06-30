# Strudel 作曲学習フロー(Phase 3: 和声編)実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** 理論の核となる和声を、スケールとモード(M7)、三和音とコード進行(M8)、テンションとボイシング(M9)、そして 1 コーラスへの統合(統合C)として、理論と Strudel 操作の二本立てで学べるレッスンを追加する。

**Architecture:** Phase 1/2 の `lessons/` 構成・スモークテスト基盤・テンプレートを再利用。新規依存なし。

**Tech Stack:** 既存(`@strudel/core`+`mini`+`tonal`+`transpiler`)。

---

## 前提(実機スモークで確認済みの API)

本計画の example は、本物の Strudel ランタイムで評価して動作確認済み(`npm run check-lesson`):
- スケール/モード: `n("0 1 2 ...").scale("c4:minor")` / `scale("c4:dorian")`(major/minor/dorian/… 対応)。
- 三和音(明示): `note("[c3,eb3,g3]")`(カンマ = 同時)、`<>` でコードを 1 サイクルずつ切替。
- コード記号 + ボイシング: `"<Cm7 Ab^7 Bb7 Cm7>".voicing()`(`^7`=maj7, `m7`, `7`=dom7 などを解釈し、滑らかなボイシングに展開)。
- ルート(ベース): `"<Cm7 Ab^7 Bb7 Cm7>".rootNotes(2)`(コードのルート音を指定オクターブで)。
- 既習: `s` `note` `n` `stack` `setcpm` `.s` `.lpf` ADSR系 `.gain`。

各 example/practice は必ずスモークテストを通すこと。FAIL は API 不在のサインなので BLOCKED 報告し、勝手に書き換えない。

## File Structure

- Create: `lessons/07-scales-intervals/{README.md,example.mjs,practice.mjs,CHALLENGE.md}`
- Create: `lessons/08-chords/{README.md,example.mjs,practice.mjs,CHALLENGE.md}`
- Create: `lessons/09-voicing-tension/{README.md,example.mjs,practice.mjs,CHALLENGE.md}`
- Create: `lessons/integration-C-chorus/{README.md,brief.mjs,rubric.md}`
- Modify: `lessons/CHEATSHEET.md` / `lessons/GLOSSARY.md` / `lessons/README.md`(Phase 3 追記)

---

## Task 1: M7 スケールと音程(07-scales-intervals)

**Files:** 4 files under `lessons/07-scales-intervals/`.

- [ ] **Step 1: `example.mjs`(厳密にこの内容)**
```js
// M7 スケールと音程(スケールとモード)
setcpm(120 / 4)
n("0 1 2 3 4 5 6 7").scale("c4:minor").s("triangle").gain(0.5)
```

- [ ] **Step 2: `practice.mjs`(厳密にこの内容)**
```js
// M7 練習
setcpm(120 / 4)
// TODO 1: scale を "c4:major" に変えて、明るさの違いを聴く。
// TODO 2: "c4:dorian" や "c4:phrygian" などモードに変えて雰囲気を比べる。
// TODO 3: n の並びを "0 2 4 2 0" のように変えて、簡単なメロディを作る。
n("0 1 2 3 4 5 6 7").scale("c4:minor").s("triangle").gain(0.5)
```

- [ ] **Step 3: `README.md`** — 次の構成:
  - 見出し `# M7 スケールと音程`
  - 2 行:
    - `**今回の Strudel:** \`n("0 1 2 ...")\` / \`.scale("c4:minor")\` / モード名`
    - `**今回の音楽理論:** メジャー/マイナー / 度数 / モード(ドリアン等)`
  - 「スケールと度数」: スケールは使う音の集合。`n` の数字は度数で、`scale` を指定すると 0=ルート、1=次の音…と並ぶ。半音を覚えなくても外れない。
  - 「メジャーとマイナー」: 同じルートでもメジャーは明るく、マイナーは暗い。3 度の音(度数 2)が半音違う、と一言。
  - 「モード」: マイナー/メジャー以外にもドリアン・フリジアンなどの並び方がある。ハウス/テクノはマイナー系やドリアンが多い。`scale("c4:dorian")` で切替。
  - 「やってみる」: 3 つの TODO。

- [ ] **Step 4: `CHALLENGE.md`(厳密にこの内容)**
````markdown
# 課題: M7

## やること
1 つのスケールを選び、`n` の度数で 8 音程度の短いフレーズ(メロディ)を作る。さらにスケールを 2 種類試して雰囲気の違いを聴く。

## 完成チェックリスト
- [ ] `scale(...)` を使い、`n` の度数で音を選んでいる
- [ ] スケール/モードを 2 種類以上試した
- [ ] `npm run check-lesson -- lessons/07-scales-intervals/practice.mjs` が OK

## 講評の観点(Claude 用 rubric)
1. 度数とスケールの対応を理解できているか
2. メジャー/マイナー/モードの雰囲気の違いを言語化できそうか
3. フレーズが音楽的か(行き当たりばったりでないか)
4. 次の一歩: 複数の音を同時に鳴らす=和音へ(M8)
````

- [ ] **Step 5: スモークテスト**
Run: `npm run check-lesson -- lessons/07-scales-intervals/example.mjs lessons/07-scales-intervals/practice.mjs`
Expected: 両方 `OK`(8 度数 × 4 サイクル = 32 events / 4 cycles)、`2/2 OK`、exit 0。

- [ ] **Step 6: コミット**
```bash
git add lessons/07-scales-intervals
git commit -m "feat(lessons): M7 スケールと音程を追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: M8 和音の基礎(08-chords)

**Files:** 4 files under `lessons/08-chords/`.

- [ ] **Step 1: `example.mjs`(厳密にこの内容)**
```js
// M8 和音の基礎(三和音とコード進行)
// カンマ , で同時に鳴らすと和音。<> で 1 サイクルごとにコードが変わる。
// これは Cm → Ab → Bb → Cm(C マイナーの i → VI → VII → i)。
setcpm(120 / 4)
note("<[c3,eb3,g3] [ab2,c3,eb3] [bb2,d3,f3] [c3,eb3,g3]>")
  .s("sawtooth").lpf(1200).attack(0.02).release(0.4).gain(0.4)
```

- [ ] **Step 2: `practice.mjs`(厳密にこの内容)**
```js
// M8 練習
setcpm(120 / 4)
// TODO 1: 各和音の構成音(カンマ区切り)を変えて、メジャー/マイナーを作り分ける。
//   メジャー三和音 = ルート + 4半音 + 7半音、マイナー = ルート + 3半音 + 7半音。
// TODO 2: 進行の順番を入れ替えて、終わった感じ/続く感じの違いを聴く。
note("<[c3,eb3,g3] [ab2,c3,eb3] [bb2,d3,f3] [c3,eb3,g3]>")
  .s("sawtooth").lpf(1200).attack(0.02).release(0.4).gain(0.4)
```

- [ ] **Step 3: `README.md`** — 次の構成:
  - 見出し `# M8 和音の基礎`
  - 2 行:
    - `**今回の Strudel:** \`note("[c3,eb3,g3]")\`(カンマ=同時)/ \`<>\`(コード切替)`
    - `**今回の音楽理論:** 三和音(メジャー/マイナー)/ コード進行 / \`<>\` の意味`
  - 「和音とは」: 複数の音を同時に鳴らすと和音。ミニ記法のカンマ `,` で同時に鳴らせる(`"c3 eb3 g3"` は順番、`"[c3,eb3,g3]"` は同時)。
  - 「三和音」: ルート + 3 度 + 5 度。メジャー(明るい)= ルート+4半音+7半音、マイナー(暗い)= ルート+3半音+7半音。
  - 「コード進行と `<>`」: `<>` はサイクルごとに中身を切り替える。`"<コードA コードB ...>"` で 1 小節ずつコードが変わる=進行。example は Cm→Ab→Bb→Cm。
  - 「やってみる」: 2 つの TODO。
  - 補足: 「コード記号(Cm, Ab 等)から自動でいい配置にする方法は次の M9 で学ぶ」と予告。

- [ ] **Step 4: `CHALLENGE.md`(厳密にこの内容)**
````markdown
# 課題: M8

## やること
4 つのコードからなる進行を、構成音を手で書いて作る。少なくとも 1 つはメジャー、1 つはマイナーにする。

## 完成チェックリスト
- [ ] カンマで同時に鳴らす三和音を作れている
- [ ] `<>` で 1 サイクルごとにコードが変わる進行になっている
- [ ] メジャーとマイナーの三和音を作り分けた
- [ ] `npm run check-lesson -- lessons/08-chords/practice.mjs` が OK

## 講評の観点(Claude 用 rubric)
1. 三和音の構成(メジャー/マイナー)が正しいか
2. 進行に流れ(解決感や緊張感)があるか
3. ボイシング(音の高さの並び)が極端でないか
4. 次の一歩: コード記号から自動ボイシング + テンション(M9)
````

- [ ] **Step 5: スモークテスト**
Run: `npm run check-lesson -- lessons/08-chords/example.mjs lessons/08-chords/practice.mjs`
Expected: 両方 `OK`(1 サイクル 1 コード × 3 音 × 4 サイクル = 12 events / 4 cycles)、`2/2 OK`、exit 0。

- [ ] **Step 6: コミット**
```bash
git add lessons/08-chords
git commit -m "feat(lessons): M8 和音の基礎を追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: M9 テンションとボイシング(09-voicing-tension)

**Files:** 4 files under `lessons/09-voicing-tension/`.

- [ ] **Step 1: `example.mjs`(厳密にこの内容)**
```js
// M9 テンションとボイシング
// コード記号を書くと .voicing() が自動でいい音の重ね方にしてくれる。
// .rootNotes(2) で同じ進行のルート音をベースとして鳴らす。
setcpm(120 / 4)
stack(
  "<Cm7 Ab^7 Bb7 Cm7>".voicing().s("sawtooth").lpf(1500).attack(0.02).release(0.3).gain(0.4),
  "<Cm7 Ab^7 Bb7 Cm7>".rootNotes(2).s("sawtooth").lpf(500).decay(0.2).sustain(0).gain(0.6),
)
```

- [ ] **Step 2: `practice.mjs`(厳密にこの内容)**
```js
// M9 練習
setcpm(120 / 4)
stack(
  // TODO 1: コード記号を変える。Cm7→Cm9、Ab^7→Ab^9 などテンションを足して響きの違いを聴く。
  "<Cm7 Ab^7 Bb7 Cm7>".voicing().s("sawtooth").lpf(1500).attack(0.02).release(0.3).gain(0.4),
  // TODO 2: rootNotes のオクターブ(2)を 1 や 3 に変えて、ベースの高さを調整する。
  "<Cm7 Ab^7 Bb7 Cm7>".rootNotes(2).s("sawtooth").lpf(500).decay(0.2).sustain(0).gain(0.6),
)
```

- [ ] **Step 3: `README.md`** — 次の構成:
  - 見出し `# M9 テンションとボイシング`
  - 2 行:
    - `**今回の Strudel:** \`"<Cm7 ...>".voicing()\` / \`.rootNotes(2)\` / コード記号(m7, ^7, 7)`
    - `**今回の音楽理論:** 7th/9th(テンション)/ ボイシング / ベースとの連動`
  - 「コード記号」: `Cm7`=Cマイナー7th、`Ab^7`=A♭メジャー7th、`Bb7`=B♭ドミナント7th。3 和音に 7 度を足すと響きが豊かになる(ジャジー/ハウスのスタブ)。
  - 「ボイシング」: 同じコードでも音の高さの並べ方で印象が変わる。`.voicing()` はコード記号から、隣のコードへ滑らかにつながる配置を自動で選ぶ。手で並べる手間が省ける。
  - 「テンション(9th 等)」: `Cm9` のように 9th を足すとさらに広がりが出る。やり過ぎると濁る。
  - 「ベースとの連動」: `.rootNotes(2)` は同じ進行のルート音を低オクターブで鳴らし、コードとベースを一致させる。
  - 「やってみる」: 2 つの TODO。

- [ ] **Step 4: `CHALLENGE.md`(厳密にこの内容)**
````markdown
# 課題: M9

## やること
4 コードの 7th 進行を `.voicing()` で鳴らし、`.rootNotes()` でベースを合わせる。1 か所以上にテンション(9th 等)を入れる。

## 完成チェックリスト
- [ ] コード記号の進行を `.voicing()` で鳴らせている
- [ ] `.rootNotes()` でベースがコードと一致している
- [ ] テンション(9th など)を 1 か所以上入れた
- [ ] `npm run check-lesson -- lessons/09-voicing-tension/practice.mjs` が OK

## 講評の観点(Claude 用 rubric)
1. コード進行に流れ・解決感があるか
2. テンションの使い方が響きを濁らせていないか
3. コードとベースが連動し、低域が整理されているか
4. 次の一歩: ドラム+ベース+コード+パッドを 1 コーラスにまとめる(統合C)
````

- [ ] **Step 5: スモークテスト**
Run: `npm run check-lesson -- lessons/09-voicing-tension/example.mjs lessons/09-voicing-tension/practice.mjs`
Expected: 両方 `OK` かつ非ゼロ(voicing + rootNotes で 24 events / 4 cycles 程度)、`2/2 OK`、exit 0。**`voicing()` / `rootNotes()` とコード記号の実在を検証する重要ステップ。** FAIL したら BLOCKED 報告。

- [ ] **Step 6: コミット**
```bash
git add lessons/09-voicing-tension
git commit -m "feat(lessons): M9 テンションとボイシングを追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: 統合C 1 コーラス完成(integration-C-chorus)

**Files:** 3 files under `lessons/integration-C-chorus/`.

- [ ] **Step 1: `brief.mjs`(厳密にこの内容)**
```js
// 統合C: ドラム + ベース + コードスタブ + パッド = 1 コーラス
// 統合B のグルーヴに、M7〜M9 の和声を重ねて 1 コーラス分を作ってください。
setcpm(124 / 4)
stack(
  s("bd*4"),
  // TODO: 統合B 相当のドラム + ベースを貼る                         ← Phase 1/2
  // TODO: コードスタブを足す("<Cm7 Ab^7 Bb7 Cm7>".voicing() を短く gate / decay) ← M9
  // TODO: 同じ進行のパッドを足す(.voicing() を長い release でやわらかく)        ← M8/M9
  // TODO: ベースを進行のルートに合わせる(.rootNotes(2))            ← M9
)
```

- [ ] **Step 2: `README.md`** — 次の構成:
  - 見出し `# 統合C: 1 コーラス完成`
  - 2 行:
    - `**まとめる Strudel:** \`stack\` / \`s\` \`note\` \`n\` / \`.scale\` / \`.voicing\` \`.rootNotes\` / ADSR・\`.lpf\``
    - `**まとめる音楽理論:** リズム + ベース + コード進行 + ボイシング + テクスチャ`
  - 「狙い」: 統合B のグルーヴに、コード進行(スタブ + パッド)とそれに合うベースを重ね、まとまりのある 1 コーラスを作る。
  - 「ポイント」: コードとベースを同じ進行で連動(`.rootNotes`)、スタブ(短い)とパッド(長い)で役割を分ける、`.lpf` で音域を整理して濁らせない。
  - 「進め方」: `brief.mjs` の TODO を上から埋める。`rubric.md` を満たしたら完成。完成したらギャラリーへ。

- [ ] **Step 3: `rubric.md`(厳密にこの内容)**
````markdown
# 統合C 講評 rubric

## 必須要件
- [ ] ドラム + ベース(統合B 相当)がある
- [ ] コード進行のスタブ(短い)がある(`.voicing()`)
- [ ] 同じ進行のパッド(長い)がある
- [ ] ベースが進行のルートに連動している(`.rootNotes()`)
- [ ] 低域・中域が整理され、濁っていない
- [ ] `npm run check-lesson -- lessons/integration-C-chorus/brief.mjs` が OK

## 講評の観点(Claude 用)
1. コード進行に流れがあり、ベース・コード・パッドが調和しているか
2. スタブとパッドの役割分担(リズム vs 持続)ができているか
3. 音域・音量バランス(マスキングがないか)
4. コードの読みやすさ
5. 次の一歩: Phase 4(構成・仕上げ)へ。展開・アレンジ・ミックスを学ぶ。
````

- [ ] **Step 4: スモークテスト**
Run: `npm run check-lesson -- lessons/integration-C-chorus/brief.mjs`
Expected: `OK ...(16 events / 4 cycles)`(`bd*4` のみアクティブ)、`1/1 OK`、exit 0。

- [ ] **Step 5: コミット**
```bash
git add lessons/integration-C-chorus
git commit -m "feat(lessons): 統合C 1 コーラス完成課題を追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: チートシート・用語集・ロードマップ更新

**Files:** Modify `lessons/CHEATSHEET.md`, `lessons/GLOSSARY.md`, `lessons/README.md`.

- [ ] **Step 1: `CHEATSHEET.md` の「概念 ↔ 関数」表に追記**(末尾に追加、既存行は消さない):
```markdown
| モード | `n("0 2 4").scale("c4:dorian")` | major/minor/dorian/phrygian… |
| 三和音(手書き) | `note("[c3,eb3,g3]")` | カンマ=同時。メジャー/マイナー |
| コード進行 | `note("<[c,eb,g] [ab,c,eb]>")` | `<>` で 1 サイクルずつ切替 |
| 自動ボイシング | `"<Cm7 Ab^7 Bb7>".voicing()` | コード記号→滑らかな配置 |
| コードのルート | `"<Cm7 Ab^7>".rootNotes(2)` | ベース用のルート音 |
```

- [ ] **Step 2: `GLOSSARY.md` の表に追記**(末尾に追加):
```markdown
| 三和音(トライアド) | ルート + 3 度 + 5 度の 3 音からなる基本的な和音。 |
| メジャー/マイナー | 3 度が長い(明るい)か短い(暗い)かの違い。 |
| モード | スケールの並び方の種類(ドリアン、フリジアンなど)。 |
| コード進行 | コードが時間とともに移り変わる流れ。`<>` で表す。 |
| テンション | 7th/9th など、三和音に足して響きを豊かにする音。 |
| ボイシング | 同じコードの音を、どの高さでどう並べるか。`.voicing()` が自動化。 |
```

- [ ] **Step 3: `README.md` のロードマップを更新** — `### Phase 3 以降(今後追加)` の節を、次に置き換える(Phase 1/2 の節は残す):
```markdown
### Phase 3 和声編
- [ ] M7 スケールと音程(`07-scales-intervals/`)
- [ ] M8 和音の基礎(`08-chords/`)
- [ ] M9 テンションとボイシング(`09-voicing-tension/`)
- [ ] 統合C 1 コーラス完成(`integration-C-chorus/`)

### Phase 4 以降(今後追加)
構成・仕上げ編。
```

- [ ] **Step 4: 全体スモーク + テスト**
Run: `npm run check-lessons` then `npm test`
Expected: Phase 1–3 の全 `.mjs` が `OK`(`N/N OK`、exit 0)。`npm test` は 16/16 pass。

- [ ] **Step 5: コミット**
```bash
git add lessons/CHEATSHEET.md lessons/GLOSSARY.md lessons/README.md
git commit -m "docs(lessons): Phase 3 をチートシート/用語集/ロードマップに反映" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## 完了の定義(Phase 3)

- `lessons/` に M7–M9 + 統合C が揃い、`npm run check-lessons` green、`npm test` green。
- CHEATSHEET/GLOSSARY/README が Phase 3 を反映。
- (実機の耳確認は学習時にユーザーが strudel.cc で実施。)

## 次のプラン

- Phase 4(構成・仕上げ M10–M12 + 統合D): アレンジ/テクスチャ(`mask`/`every`/signals)、曲構成(`arrange`/`cat`/`<>`)、ミックス(`gain`/`pan`/`room`)、作品化。
