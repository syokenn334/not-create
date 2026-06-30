# Strudel 作曲学習フロー(Phase 2: 音色・ベース編)実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax.

**Goal:** Phase 1(リズム編)に続き、シンセの音作り(波形・ADSR)、フィルターと空間(LFO・残響・ディレイ)、スケールに基づくベースラインを、理論と Strudel 操作の二本立てで学べるレッスン M4–M6 + 統合B を追加する。

**Architecture:** Phase 1 で作った `lessons/` 構成・スモークテスト基盤(`lib/lesson-check.mjs` + `npm run check-lesson`)・テンプレートをそのまま再利用する。各レッスンは `README.md` + `example.mjs` + `practice.mjs` + `CHALLENGE.md`、統合課題は `README.md` + `brief.mjs` + `rubric.md`。

**Tech Stack:** 既存(Node ESM, `@strudel/core`+`mini`+`tonal`+`transpiler`, editor-sync)。新規依存なし。

---

## 前提(Phase 1 完了済み・実機確認済みの API)

以下は `node_modules` のソースで実在を確認済み。これらだけを使う:
- 音色/エンベロープ: `note` / `n` / `.s("sawtooth")`(波形名は sine/sawtooth/square/triangle)/ `attack` `decay` `sustain` `release`(別名 att/dec/sus/rel)。
- フィルター/空間: `lpf`(=cutoff、第2引数で resonance)/ `room` / `delay` / 信号 `sine` `saw` 等と `.range(min,max)` / `.slow(n)`。
- 音程/スケール: `scale("c2:minor")` / `n("0 3 5")` でスケール度数。
- リズム(既習): `s` / `stack` / `*` `~` / `setcpm` / `.gain` `.euclid` `.swing`。

レッスン本文の関数名・引数は執筆時に必要なら strudel.cc 公式で再確認する。スモークテスト(`npm run check-lesson`)が存在しない API を客観検出するので、各 example/practice は必ず通すこと。

## File Structure

- Create: `lessons/04-sound-basics/{README.md,example.mjs,practice.mjs,CHALLENGE.md}`
- Create: `lessons/05-filter-space/{README.md,example.mjs,practice.mjs,CHALLENGE.md}`
- Create: `lessons/06-bassline/{README.md,example.mjs,practice.mjs,CHALLENGE.md}`
- Create: `lessons/integration-B-groove/{README.md,brief.mjs,rubric.md}`
- Modify: `lessons/CHEATSHEET.md`(Phase 2 の行を追記)、`lessons/GLOSSARY.md`(用語追記)、`lessons/README.md`(ロードマップに Phase 2 を追加)

各レッスンフォルダは「1 音楽概念 + 1 Strudel 操作」の独立ユニット。

---

## Task 1: M4 サウンド基礎(04-sound-basics)

**Files:** Create the 4 files under `lessons/04-sound-basics/`.

- [ ] **Step 1: `example.mjs`(厳密にこの内容)**
```js
// M4 サウンド基礎(シンセと ADSR)
setcpm(130 / 4)
note("c3 eb3 g3 c4")           // C マイナーの分散和音
  .s("sawtooth")               // のこぎり波シンセ
  .attack(0.01)                // 立ち上がり(秒)
  .decay(0.15)                 // 減衰
  .sustain(0.4)                // 保持レベル(0〜1)
  .release(0.1)                // 余韻
```

- [ ] **Step 2: `practice.mjs`(厳密にこの内容)**
```js
// M4 練習
setcpm(130 / 4)
note("c3 eb3 g3 c4")
  // TODO 1: .s("sawtooth") を "square" / "triangle" / "sine" に変えて音色の違いを聴く。
  .s("sawtooth")
  // TODO 2: .attack の値を 0.01→0.3 に上げて、音の立ち上がりが遅くなるのを聴く。
  .attack(0.01)
  // TODO 3: .sustain を 0 にして、.decay だけで切れる短い音(プラック)を作る。
  .decay(0.15).sustain(0.4).release(0.1)
```

- [ ] **Step 3: `README.md`** — 初学者向け日本語で、次の構成で書く(example のコードを正確に埋め込む):
  - 見出し `# M4 サウンド基礎`
  - 2 行:
    - `**今回の Strudel:** \`note\` / \`.s("sawtooth")\`(波形)/ \`.attack/.decay/.sustain/.release\``
    - `**今回の音楽理論:** 音色 / ADSR エンベロープ(音の時間的な形)`
  - 「音を選ぶ vs 音を作る」: `s("bd")` は録音されたサンプル、`note(...).s("sawtooth")` は波形からシンセで音を作る。波形(sine/sawtooth/square/triangle)で音色が変わる。
  - 「ADSR とは」: 音量の時間変化。Attack(立ち上がり)→Decay(減衰)→Sustain(保持レベル)→Release(余韻)。短い decay + sustain 0 = プラック、長い attack = ふわっと入る音、と説明。example を読み解く。
  - 「やってみる」: 3 つの TODO。

- [ ] **Step 4: `CHALLENGE.md`(厳密にこの内容)**
````markdown
# 課題: M4

## やること
`note(...)` で短いフレーズを 1 つ作り、波形と ADSR を変えて「プラック」と「パッド(ふわっとした音)」の 2 種類の音色を作り分ける。

## 完成チェックリスト
- [ ] 波形(`.s`)を 2 種類以上試した
- [ ] ADSR を調整して、歯切れの良い音と、ゆるやかな音を作り分けた
- [ ] `npm run check-lesson -- lessons/04-sound-basics/practice.mjs` が OK

## 講評の観点(Claude 用 rubric)
1. ADSR の各値が狙いの音色(プラック/パッド)に合っているか
2. 波形選びが音楽的に妥当か
3. コードが素直か
4. 次の一歩: フィルターと空間で音に陰影をつける(M5)
````

- [ ] **Step 5: スモークテスト**
Run: `npm run check-lesson -- lessons/04-sound-basics/example.mjs lessons/04-sound-basics/practice.mjs`
Expected: 両方 `OK`(`note("c3 eb3 g3 c4")` = 4 events/cycle × 4 = 16 events / 4 cycles)、`2/2 OK`、exit 0。`cannot use window`/`🌀` の行は無害。FAIL したら BLOCKED 報告(example/practice を勝手に書き換えない)。

- [ ] **Step 6: コミット**
```bash
git add lessons/04-sound-basics
git commit -m "feat(lessons): M4 サウンド基礎を追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: M5 フィルターと空間(05-filter-space)

**Files:** Create the 4 files under `lessons/05-filter-space/`.

- [ ] **Step 1: `example.mjs`(厳密にこの内容)**
```js
// M5 フィルターと空間
setcpm(130 / 4)
note("c2*8").s("sawtooth")
  .lpf(sine.range(300, 1500).slow(4))  // カットオフを LFO でゆっくり上下
  .room(0.3)                           // 残響(空間)
  .delay(0.25)                         // ディレイ(やまびこ)
```

- [ ] **Step 2: `practice.mjs`(厳密にこの内容)**
```js
// M5 練習
setcpm(130 / 4)
note("c2*8").s("sawtooth")
  // TODO 1: .lpf を固定値 800 にしてから sine.range(300,1500).slow(4) に戻し、動く/動かないを聴き比べる。
  .lpf(sine.range(300, 1500).slow(4))
  // TODO 2: .room の値を 0→0.6 で変えて、空間の広さの違いを聴く。
  .room(0.3)
  // TODO 3: .delay を消したり 0.5 にしたりして、やまびこの量を変える。
  .delay(0.25)
```

- [ ] **Step 3: `README.md`** — 次の構成:
  - 見出し `# M5 フィルターと空間`
  - 2 行:
    - `**今回の Strudel:** \`.lpf\`(=cutoff)/ \`sine.range(min,max).slow(n)\` / \`.room\` / \`.delay\``
    - `**今回の音楽理論:** 周波数と倍音 / フィルター / 残響・ディレイ(空間)`
  - 「フィルター」: ローパスフィルター(`lpf`)は指定周波数より上の倍音を削る。値を下げると暗く・こもった音に。`lpf` の第 2 引数で resonance(カットオフ付近を強調)も足せる、と一言。
  - 「フィルターを動かす」: `sine.range(300,1500).slow(4)` は 0〜1 の sine 波を 300〜1500 に変換し、4 サイクルかけてゆっくり動かす。これでフィルターが開閉し「展開」が生まれる。
  - 「空間」: `room`(残響)と `delay`(やまびこ)で奥行きを作る。かけ過ぎると濁るので控えめに。
  - 「やってみる」: 3 つの TODO。

- [ ] **Step 4: `CHALLENGE.md`(厳密にこの内容)**
````markdown
# 課題: M5

## やること
持続するシンセ音に、動くローパスフィルターと控えめな残響/ディレイをかけて、時間とともに開いていく音を作る。

## 完成チェックリスト
- [ ] `lpf` を信号(`sine.range(...).slow(...)`)で動かしている
- [ ] `room` と `delay` を足し、量を調整して濁らせていない
- [ ] `npm run check-lesson -- lessons/05-filter-space/practice.mjs` が OK

## 講評の観点(Claude 用 rubric)
1. フィルターの動き(range の幅・slow の速さ)が音楽的か
2. 残響/ディレイがやり過ぎず空間を作れているか
3. コードが素直か
4. 次の一歩: スケールに沿ったベースラインを作る(M6)
````

- [ ] **Step 5: スモークテスト**
Run: `npm run check-lesson -- lessons/05-filter-space/example.mjs lessons/05-filter-space/practice.mjs`
Expected: 両方 `OK` かつ非ゼロ(`c2*8` = 8 events/cycle × 4 = 32 程度)、`2/2 OK`、exit 0。**ここは `lpf`/`sine`/`range`/`slow`/`room`/`delay` の実在を検証する重要ステップ。** どちらか FAIL(関数未定義など)したら BLOCKED 報告し、勝手に書き換えない。

- [ ] **Step 6: コミット**
```bash
git add lessons/05-filter-space
git commit -m "feat(lessons): M5 フィルターと空間を追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: M6 ベースライン(06-bassline)

**Files:** Create the 4 files under `lessons/06-bassline/`.

- [ ] **Step 1: `example.mjs`(厳密にこの内容)**
```js
// M6 ベースライン(スケールとルート)
setcpm(130 / 4)
stack(
  s("bd*4"),                                       // キック
  n("0 ~ 0 ~ 3 ~ 5 ~").scale("c2:minor")           // C マイナーの度数でベース
    .s("sawtooth").lpf(600).decay(0.2).sustain(0)  // 短いプラックベース
)
```

- [ ] **Step 2: `practice.mjs`(厳密にこの内容)**
```js
// M6 練習
setcpm(130 / 4)
stack(
  s("bd*4"),
  // TODO 1: n の数字(度数)を変えてベースの動きを作る。0 がルート(c)、7 で 1 オクターブ上。
  n("0 ~ 0 ~ 3 ~ 5 ~").scale("c2:minor")
    // TODO 2: scale を "c2:major" や "c2:dorian" に変えて雰囲気の違いを聴く。
    .s("sawtooth").lpf(600).decay(0.2).sustain(0)
  // TODO 3: ベースの音をキックの隙間(~ の位置)に置いて、キックとぶつからないようにする。
)
```

- [ ] **Step 3: `README.md`** — 次の構成:
  - 見出し `# M6 ベースライン`
  - 2 行:
    - `**今回の Strudel:** \`scale("c2:minor")\` / \`n("0 3 5")\`(度数)/ オクターブ`
    - `**今回の音楽理論:** スケール(マイナー) / 度数 / ルート / キックとベースの住み分け`
  - 「スケールと度数」: スケールは使う音の集合。`scale("c2:minor")` を指定すると `n("0")` がルート(c2)、`n("1")` が次の音…と度数で書ける。半音を覚えなくても外れない音が選べる、と説明。
  - 「ルートとオクターブ」: `0` がルート。`7` で 1 オクターブ上。低めのオクターブ(c2)がベースらしい。
  - 「キックと住み分け」: キックとベースは同じ低域でぶつかりやすい。ベースをキックの隙間(`~`)に置く/短く切る(`sustain(0)`)と濁らない、と説明。example を読み解く。
  - 「やってみる」: 3 つの TODO。

- [ ] **Step 4: `CHALLENGE.md`(厳密にこの内容)**
````markdown
# 課題: M6

## やること
4 つ打ちキックの隙間に、C マイナースケールのプラックベースを置き、キックとぶつからないグルーヴを作る。

## 完成チェックリスト
- [ ] `scale(...)` を使い、`n` の度数でベースの音を選んでいる
- [ ] ベースが低めのオクターブ(例: c2)で鳴っている
- [ ] キックとベースが低域でぶつかっていない(隙間/短さで住み分け)
- [ ] `npm run check-lesson -- lessons/06-bassline/practice.mjs` が OK

## 講評の観点(Claude 用 rubric)
1. スケール/度数の使い方が正しいか(外れた音になっていないか)
2. キックとベースの住み分けができているか
3. ベースのリズムがグルーヴに貢献しているか
4. 次の一歩: ドラム+ベース+フィルター展開を 1 つにまとめる(統合B)
````

- [ ] **Step 5: スモークテスト**
Run: `npm run check-lesson -- lessons/06-bassline/example.mjs lessons/06-bassline/practice.mjs`
Expected: 両方 `OK` かつ非ゼロ(bd4 + ベース 4 音 = 8 events/cycle × 4 = 32 程度)、`2/2 OK`、exit 0。**`scale` / `n`+scale の実在を検証する重要ステップ。** FAIL したら BLOCKED 報告。

- [ ] **Step 6: コミット**
```bash
git add lessons/06-bassline
git commit -m "feat(lessons): M6 ベースラインを追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: 統合B グルーヴ完成(integration-B-groove)

**Files:** Create the 3 files under `lessons/integration-B-groove/`.

- [ ] **Step 1: `brief.mjs`(厳密にこの内容)**
```js
// 統合B: ドラム + ベース + フィルター展開のグルーヴ
// 統合A のドラムに、M4〜M6 で学んだベースと音作りを足して育ててください。
setcpm(130 / 4)
stack(
  s("bd*4"),
  // TODO: 統合A のドラム(ハット/クラップ/パーカッション)を貼る        ← Phase 1
  // TODO: スケールに沿ったベースラインを足す(n(...).scale("c2:minor")) ← M6
  // TODO: ベースの音色を sawtooth + ADSR で整える                      ← M4
  // TODO: どこかのレイヤーに lpf(sine.range(...).slow(...)) で展開を付ける ← M5
)
```

- [ ] **Step 2: `README.md`** — 次の構成:
  - 見出し `# 統合B: グルーヴ完成`
  - 2 行:
    - `**まとめる Strudel:** \`stack\` / \`s\` \`note\` \`n\` / \`.scale\` / \`.s\` \`.adsr\`系 / \`.lpf\`+\`sine.range\` / \`.room\` \`.delay\``
    - `**まとめる音楽理論:** リズム + ベース + 音色 + フィルター展開`
  - 「狙い」: 統合A のドラムに、スケールに沿ったベースと音作り・フィルター展開を重ね、低域がぶつからない 1 つのグルーヴを完成させる。
  - 「ポイント」: キックとベースの住み分け(M6)、フィルターの動きで単調さを避ける(M5)、ベース音色の ADSR(M4)。
  - 「進め方」: `brief.mjs` の TODO を上から埋める。`rubric.md` を満たしたら完成。完成したらギャラリーに残してもよい。

- [ ] **Step 3: `rubric.md`(厳密にこの内容)**
````markdown
# 統合B 講評 rubric

## 必須要件
- [ ] 統合A 相当のドラム(キック/ハット/クラップ/パーカッション)がある
- [ ] スケールに沿ったベースラインがある(`scale` + `n`)
- [ ] ベースに音色設定(波形 + ADSR)がある
- [ ] どこかに動くフィルター(`lpf` + 信号)があり、展開が感じられる
- [ ] キックとベースが低域でぶつかっていない
- [ ] `npm run check-lesson -- lessons/integration-B-groove/brief.mjs` が OK

## 講評の観点(Claude 用)
1. 低域(キック/ベース)の住み分けができているか
2. フィルター展開が単調さを解消できているか
3. 各レイヤーの音色・音量バランス
4. コードの読みやすさ
5. 次の一歩: Phase 3(和声編)へ。コードとコード進行を学ぶ。
````

- [ ] **Step 4: スモークテスト**
Run: `npm run check-lesson -- lessons/integration-B-groove/brief.mjs`
Expected: `OK ...(16 events / 4 cycles)`(`bd*4` のみアクティブ)、`1/1 OK`、exit 0。FAIL したら BLOCKED 報告。

- [ ] **Step 5: コミット**
```bash
git add lessons/integration-B-groove
git commit -m "feat(lessons): 統合B グルーヴ完成課題を追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: チートシート・用語集・ロードマップ更新

**Files:** Modify `lessons/CHEATSHEET.md`, `lessons/GLOSSARY.md`, `lessons/README.md`.

- [ ] **Step 1: `CHEATSHEET.md` の「概念 ↔ 関数」表に次の行を追記**(表の末尾に追加。既存行は消さない):
```markdown
| 波形シンセ | `note("c3").s("sawtooth")` | sine/sawtooth/square/triangle |
| 音の形(ADSR) | `.attack(.01).decay(.2).sustain(.3).release(.1)` | 立ち上がり/減衰/保持/余韻 |
| ローパスフィルター | `.lpf(800)` / `.lpf(sine.range(300,1500).slow(4))` | 倍音を削る/LFOで動かす |
| 残響・ディレイ | `.room(0.3)` / `.delay(0.25)` | 空間/やまびこ |
| スケール | `n("0 3 5").scale("c2:minor")` | 度数でスケール上の音を選ぶ |
```

- [ ] **Step 2: `GLOSSARY.md` の表に次の行を追記**(末尾に追加):
```markdown
| 音色(ティンバー) | 音の「色」。同じ高さでも波形や倍音構成で違って聞こえる。 |
| ADSR | 音量の時間変化(Attack 立ち上がり / Decay 減衰 / Sustain 保持 / Release 余韻)。 |
| ローパスフィルター | ある周波数より上の成分を削るフィルター。値を下げると暗い音になる。 |
| LFO | 低周波の信号で、フィルターや音量をゆっくり動かして変化を作る(`sine.range(...)` など)。 |
| スケール | 曲で使う音の集合(例: C マイナー)。度数で音を選べば外れにくい。 |
| 度数 | スケール内での音の位置。0 がルート、7 で 1 オクターブ上。 |
```

- [ ] **Step 3: `README.md` のロードマップを更新** — `### Phase 2 以降(今後追加)` の節を、次の構造に置き換える(Phase 1 の節は残す):
```markdown
### Phase 2 音色・ベース編
- [ ] M4 サウンド基礎(`04-sound-basics/`)
- [ ] M5 フィルターと空間(`05-filter-space/`)
- [ ] M6 ベースライン(`06-bassline/`)
- [ ] 統合B グルーヴ完成(`integration-B-groove/`)

### Phase 3 以降(今後追加)
和声編 / 構成・仕上げ編。
```

- [ ] **Step 4: 全体スモーク + テスト**
Run: `npm run check-lessons` then `npm test`
Expected: `check-lessons` は Phase 1+2 の全 `.mjs` が `OK`(最終行 `N/N OK`、exit 0)。`npm test` は 16/16 pass。

- [ ] **Step 5: コミット**
```bash
git add lessons/CHEATSHEET.md lessons/GLOSSARY.md lessons/README.md
git commit -m "docs(lessons): Phase 2 をチートシート/用語集/ロードマップに反映" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## 完了の定義(Phase 2)

- `lessons/` に M4–M6 + 統合B が揃い、全 `.mjs` がスモークテストを通過(`npm run check-lessons` green)。
- `npm test` green。CHEATSHEET/GLOSSARY/README が Phase 2 を反映。
- (実機の耳確認は学習時にユーザーが strudel.cc で実施。)

## 次のプラン

- Phase 3(和声編 M7–M9 + 統合C): `scale`/三和音/`"<Am F C G>"`/`voicing()`/`rootNotes()`。
- Phase 4(構成・仕上げ M10–M12 + 統合D): `mask`/`every`/`arrange`/ミックス/作品化。
