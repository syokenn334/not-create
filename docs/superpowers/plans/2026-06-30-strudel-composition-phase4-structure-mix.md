# Strudel 作曲学習フロー(Phase 4: 構成・仕上げ編)実装計画

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax.

**Goal:** カリキュラムの締めとして、アレンジ/テクスチャ(M10)、曲の構成(M11)、ミックスと作品化(M12)、構成のある 1 曲への統合(統合D)を、理論と Strudel 操作の二本立てで学べるレッスンを追加する。これで Phase 1–4 が完成する。

**Architecture:** Phase 1–3 の `lessons/` 構成・スモークテスト基盤・テンプレートを再利用。新規依存なし。

**Tech Stack:** 既存(`@strudel/core`+`mini`+`tonal`+`transpiler`)。

---

## 前提(実機スモークで確認済みの API)

本計画の example は本物の Strudel ランタイムで評価して動作確認済み(`npm run check-lesson`):
- テクスチャ: `.mask("<1 1 1 0>")`(サイクルごとにレイヤーを抜く)/ `.every(4, x => x.fast(2))`(N サイクルごとに変化)。
- 構成: `arrange([cycles, pattern], ...)`(各セクションを指定サイクル数だけ並べる。正式用例: `arrange([4, "<c a f e>(3,8)"],[2,"<g a>(5,8)"]).note()`)/ `cat` / `<>`。
- ミックス: `.gain(0.9)` / `.pan(0.7)`(0=左, 1=右)/ `.room(0.3)`。
- 既習: `s` `note` `n` `stack` `setcpm` `.scale` `.voicing` `.rootNotes` `.lpf` ADSR。

各 example/practice は必ずスモークテストを通すこと。FAIL は API 不在のサインなので BLOCKED 報告し、勝手に書き換えない。
注: `arrange` は複数サイクルにまたがるため、スモークテスト(先頭 4 サイクルを query)では最初のセクションぶんのイベントしか出ないことがある(非ゼロなら OK)。

## File Structure

- Create: `lessons/10-arrange-texture/{README.md,example.mjs,practice.mjs,CHALLENGE.md}`
- Create: `lessons/11-song-structure/{README.md,example.mjs,practice.mjs,CHALLENGE.md}`
- Create: `lessons/12-mix-finish/{README.md,example.mjs,practice.mjs,CHALLENGE.md}`
- Create: `lessons/integration-D-track/{README.md,brief.mjs,rubric.md}`
- Modify: `lessons/CHEATSHEET.md` / `lessons/GLOSSARY.md` / `lessons/README.md`(Phase 4 追記・完成反映)

---

## Task 1: M10 アレンジとテクスチャ(10-arrange-texture)

**Files:** 4 files under `lessons/10-arrange-texture/`.

- [ ] **Step 1: `example.mjs`(厳密にこの内容)**
```js
// M10 アレンジとテクスチャ(レイヤーの足し引き)
setcpm(124 / 4)
stack(
  s("bd*4"),
  s("hh*8").gain(0.6).mask("<1 1 1 0>"),          // 4 サイクルめだけハットを抜く
  s("rim*16").gain(0.4).every(4, x => x.fast(2)), // 4 サイクルごとに密度を上げる
)
```

- [ ] **Step 2: `practice.mjs`(厳密にこの内容)**
```js
// M10 練習
setcpm(124 / 4)
stack(
  s("bd*4"),
  // TODO 1: mask の "<1 1 1 0>" を変えて、レイヤーを抜くタイミングを設計する。
  s("hh*8").gain(0.6).mask("<1 1 1 0>"),
  // TODO 2: every(4, ...) の数字や中の関数(x => x.fast(2) / x.rev() など)を変える。
  s("rim*16").gain(0.4).every(4, x => x.fast(2)),
)
```

- [ ] **Step 3: `README.md`** — 次の構成:
  - 見出し `# M10 アレンジとテクスチャ`
  - 2 行:
    - `**今回の Strudel:** \`.mask("<1 0>")\` / \`.every(n, x => ...)\` / 信号でのオートメーション`
    - `**今回の音楽理論:** 密度 / テクスチャ / レイヤーの足し引きによる展開`
  - 「テクスチャと密度」: 同じループでも、鳴っているレイヤーの数(密度)で印象が変わる。足し引きで飽きさせない。
  - 「mask で抜く」: `.mask("<1 1 1 0>")` はサイクルごとに 1=鳴らす / 0=止める。4 サイクルめにハットを抜くと「溜め」ができる。
  - 「every で変化」: `.every(4, x => x.fast(2))` は 4 サイクルごとに関数を適用(ここでは密度 2 倍)。`x.rev()` など他の変形も使える。
  - 「オートメーション」: M5 の `lpf(sine.range(...).slow(...))` のように、信号でパラメータをゆっくり動かすのもテクスチャ作り。
  - 「やってみる」: 2 つの TODO。

- [ ] **Step 4: `CHALLENGE.md`(厳密にこの内容)**
````markdown
# 課題: M10

## やること
1 つのグルーヴに対して、`mask` でのレイヤー抜きと `every` での周期変化を入れ、4〜8 サイクルで「足し引き」の展開を作る。

## 完成チェックリスト
- [ ] `mask` でどこかのレイヤーをサイクル単位で抜いている
- [ ] `every` で周期的な変化を入れている
- [ ] 4〜8 サイクル聴いて、密度の変化(展開)を感じられる
- [ ] `npm run check-lesson -- lessons/10-arrange-texture/practice.mjs` が OK

## 講評の観点(Claude 用 rubric)
1. 足し引きが単調さの解消につながっているか(やり過ぎていないか)
2. 抜き/変化のタイミングが音楽的か
3. コードの読みやすさ
4. 次の一歩: セクションを並べて曲の構成を作る(M11)
````

- [ ] **Step 5: スモークテスト**
Run: `npm run check-lesson -- lessons/10-arrange-texture/example.mjs lessons/10-arrange-texture/practice.mjs`
Expected: 両方 `OK` かつ非ゼロ(120 events / 4 cycles 程度)、`2/2 OK`、exit 0。FAIL したら BLOCKED 報告。

- [ ] **Step 6: コミット**
```bash
git add lessons/10-arrange-texture
git commit -m "feat(lessons): M10 アレンジとテクスチャを追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 2: M11 曲の構成(11-song-structure)

**Files:** 4 files under `lessons/11-song-structure/`.

- [ ] **Step 1: `example.mjs`(厳密にこの内容)**
```js
// M11 曲の構成(arrange でセクションを並べる)
// [サイクル数, パターン] を順に並べる。イントロ→ビルド→ドロップ。
setcpm(124 / 4)
arrange(
  [4, s("bd*4")],                                   // イントロ: キックのみ
  [4, stack(s("bd*4"), s("hh*8"))],                 // ビルド: ハット追加
  [8, stack(s("bd*4"), s("hh*8"), s("~ cp ~ cp"))], // ドロップ: フル
)
```

- [ ] **Step 2: `practice.mjs`(厳密にこの内容)**
```js
// M11 練習
setcpm(124 / 4)
arrange(
  // TODO 1: 各セクションのサイクル数を変えて、長さの構成を設計する。
  [4, s("bd*4")],
  [4, stack(s("bd*4"), s("hh*8"))],
  // TODO 2: ドロップの後に「ブレイク」(キックを抜く)セクションを足してみる。
  //   例: [4, stack(s("hh*8"), s("~ cp ~ cp"))],
  [8, stack(s("bd*4"), s("hh*8"), s("~ cp ~ cp"))],
)
```

- [ ] **Step 3: `README.md`** — 次の構成:
  - 見出し `# M11 曲の構成`
  - 2 行:
    - `**今回の Strudel:** \`arrange([サイクル数, パターン], ...)\` / \`cat\` / \`<>\``
    - `**今回の音楽理論:** 曲の構成(イントロ / ビルド / ドロップ / ブレイク)`
  - 「ループから曲へ」: 1 つのループを延々鳴らすだけでは曲にならない。時間軸でセクションを並べると「展開のある曲」になる。
  - 「arrange」: `arrange([4, パターンA], [8, パターンB])` は A を 4 サイクル、B を 8 サイクル順に流す。セクションごとにレイヤー数を変えて緊張と解放を作る。example を読み解く(イントロ→ビルド→ドロップ)。
  - 「典型的な流れ」: イントロ(要素少)→ビルド(足していく)→ドロップ(フル)→ブレイク(抜く)→…。8 / 16 サイクル単位で区切るのが定番。
  - 「やってみる」: 2 つの TODO(特にブレイクの追加)。

- [ ] **Step 4: `CHALLENGE.md`(厳密にこの内容)**
````markdown
# 課題: M11

## やること
`arrange` を使って、少なくとも「イントロ → ビルド → ドロップ → ブレイク」の 4 セクションを持つ構成を作る。

## 完成チェックリスト
- [ ] `arrange` で 3 セクション以上を並べている
- [ ] セクションごとにレイヤー数(密度)が変化している
- [ ] キックを抜く「ブレイク」がある
- [ ] `npm run check-lesson -- lessons/11-song-structure/practice.mjs` が OK

## 講評の観点(Claude 用 rubric)
1. 構成に起伏(緊張と解放)があるか
2. 各セクションの長さ(サイクル数)が自然か
3. セクション間のつながりが唐突すぎないか
4. 次の一歩: 音量・定位・空間を整えて仕上げる(M12)
````

- [ ] **Step 5: スモークテスト**
Run: `npm run check-lesson -- lessons/11-song-structure/example.mjs lessons/11-song-structure/practice.mjs`
Expected: 両方 `OK` かつ非ゼロ(arrange は複数サイクルにまたがるため先頭 4 サイクルぶん = 16 events / 4 cycles 程度)、`2/2 OK`、exit 0。**`arrange` の実在を検証する重要ステップ。** FAIL したら BLOCKED 報告。

- [ ] **Step 6: コミット**
```bash
git add lessons/11-song-structure
git commit -m "feat(lessons): M11 曲の構成を追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 3: M12 ミックスと作品化(12-mix-finish)

**Files:** 4 files under `lessons/12-mix-finish/`.

- [ ] **Step 1: `example.mjs`(厳密にこの内容)**
```js
// M12 ミックスと作品化(音量・定位・空間)
setcpm(124 / 4)
stack(
  s("bd*4").gain(0.9),                                  // キックは芯。少し大きめ
  s("hh*8").gain(0.5).pan(0.7),                         // ハットは控えめ・右寄り
  s("~ cp ~ cp").gain(0.7).room(0.3),                   // クラップに残響
  note("c2*8").s("sawtooth").lpf(600).gain(0.6).pan(0.4), // ベースは中央やや左
)
```

- [ ] **Step 2: `practice.mjs`(厳密にこの内容)**
```js
// M12 練習
setcpm(124 / 4)
stack(
  // TODO 1: 各レイヤーの gain を調整して、キック>ベース>クラップ>ハットの優先順位を作る。
  s("bd*4").gain(0.9),
  // TODO 2: pan(0=左, 1=右)でハットやパーカッションを左右に振り、広がりを出す。
  s("hh*8").gain(0.5).pan(0.7),
  s("~ cp ~ cp").gain(0.7).room(0.3),
  note("c2*8").s("sawtooth").lpf(600).gain(0.6).pan(0.4),
)
```

- [ ] **Step 3: `README.md`** — 次の構成:
  - 見出し `# M12 ミックスと作品化`
  - 2 行:
    - `**今回の Strudel:** \`.gain\`(音量)/ \`.pan\`(定位 0〜1)/ \`.room\`(空間)`
    - `**今回の音楽理論:** ミックスの基礎(音量バランス / 定位 / 空間)`
  - 「ミックスとは」: 各音の音量・左右位置・空間を整え、全体を聴きやすくする作業。
  - 「音量バランス」: `gain` で優先順位を作る。キックとベースが土台、ハットやパーカッションは控えめ。全部大きいと潰れる。
  - 「定位(パン)」: `.pan(0)`=左、`.pan(1)`=右、`0.5`=中央。キック/ベースは中央、ハットなどを左右に振ると広がる。
  - 「空間」: `room` で奥行き。近くに置きたい音は控えめ、遠くは多め。
  - 「作品化」: 完成したらギャラリーに作品として登録できる(リポジトリ直下 README / ギャラリー仕様を参照)。
  - 「やってみる」: 2 つの TODO。

- [ ] **Step 4: `CHALLENGE.md`(厳密にこの内容)**
````markdown
# 課題: M12

## やること
これまで作ったグルーヴ/コーラスの音量・定位・空間を整え、聴きやすいミックスにする。

## 完成チェックリスト
- [ ] `gain` で音量の優先順位(キック/ベースが土台)を作った
- [ ] `pan` で左右に振り、広がりを出した
- [ ] `room` の量を整え、濁らせていない
- [ ] `npm run check-lesson -- lessons/12-mix-finish/practice.mjs` が OK

## 講評の観点(Claude 用 rubric)
1. 音量バランスが整い、特定の音が潰れていないか
2. 定位(パン)で広がりが出ているか、中央が渋滞していないか
3. 空間(room)のかけ方が適切か
4. 次の一歩: すべてを使って構成のある 1 曲を完成させる(統合D)
````

- [ ] **Step 5: スモークテスト**
Run: `npm run check-lesson -- lessons/12-mix-finish/example.mjs lessons/12-mix-finish/practice.mjs`
Expected: 両方 `OK` かつ非ゼロ(88 events / 4 cycles 程度)、`2/2 OK`、exit 0。FAIL したら BLOCKED 報告。

- [ ] **Step 6: コミット**
```bash
git add lessons/12-mix-finish
git commit -m "feat(lessons): M12 ミックスと作品化を追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 4: 統合D 1 曲完成(integration-D-track)

**Files:** 3 files under `lessons/integration-D-track/`.

- [ ] **Step 1: `brief.mjs`(厳密にこの内容)**
```js
// 統合D: 構成のある 1 曲(最終課題)
// これまで学んだ全部を使い、arrange でセクションを並べて 1 曲にする。
setcpm(124 / 4)
arrange(
  [8, s("bd*4")],
  // TODO: [8, stack(...ドラム+ベース...)],                    ← Phase 1/2
  // TODO: [16, stack(...フル: ドラム+ベース+コード+パッド...)], ← Phase 3
  // TODO: [8, stack(...ブレイク: キックを抜く...)],
  // TODO: 各レイヤーの gain / pan / room を整える(ミックス)   ← M12
)
```

- [ ] **Step 2: `README.md`** — 次の構成:
  - 見出し `# 統合D: 1 曲完成(最終課題)`
  - 2 行:
    - `**まとめる Strudel:** \`arrange\` / \`stack\` / \`s\` \`note\` \`n\` \`.scale\` \`.voicing\` \`.rootNotes\` / \`.mask\` \`.every\` / \`.gain\` \`.pan\` \`.room\``
    - `**まとめる音楽理論:** リズム + 音色 + ベース + 和声 + テクスチャ + 構成 + ミックス`
  - 「狙い」: Phase 1–4 の全要素を使い、`arrange` でイントロ〜展開〜締めのセクションを並べ、ミックスまで整えた **構成のある 1 曲** を完成させる。これがカリキュラムの到達点。
  - 「進め方」: まず 1 つのフル・コーラス(統合C 相当)を作り、それを基準にイントロ(要素を減らす)・ブレイク(抜く)・アウトロを `arrange` で前後に並べる。最後に M12 でミックス。
  - 「仕上げ」: 完成したらギャラリーに作品として公開する。これで「理論を理解して 1 曲を作る」というゴール達成。
  - `rubric.md` を満たしたら完成。

- [ ] **Step 3: `rubric.md`(厳密にこの内容)**
````markdown
# 統合D 講評 rubric(最終課題)

## 必須要件
- [ ] `arrange` で複数セクション(イントロ/展開/ブレイク等)の構成がある
- [ ] ドラム + ベースの土台がある(Phase 1/2)
- [ ] コード進行(スタブ/パッド)がある(Phase 3)
- [ ] `mask`/`every` 等でテクスチャの変化がある(M10)
- [ ] `gain`/`pan`/`room` でミックスが整えられている(M12)
- [ ] `npm run check-lesson -- lessons/integration-D-track/brief.mjs` が OK

## 講評の観点(Claude 用)
1. 曲全体に起伏・ストーリー(緊張と解放)があるか
2. 和声・ベース・リズムが破綻なく噛み合っているか
3. ミックスが整い、各要素が聴き取れるか
4. コードの読みやすさ・構造の明快さ
5. 達成: 「理論を理解して構成のある 1 曲を作る」というゴールに到達できたか
````

- [ ] **Step 4: スモークテスト**
Run: `npm run check-lesson -- lessons/integration-D-track/brief.mjs`
Expected: `OK ...` かつ非ゼロ(`arrange([8, s("bd*4")])` のみアクティブ、先頭 4 サイクルで 16 events / 4 cycles)、`1/1 OK`、exit 0。FAIL したら BLOCKED 報告。

- [ ] **Step 5: コミット**
```bash
git add lessons/integration-D-track
git commit -m "feat(lessons): 統合D 1 曲完成(最終課題)を追加" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Task 5: チートシート・用語集・ロードマップ更新(カリキュラム完成)

**Files:** Modify `lessons/CHEATSHEET.md`, `lessons/GLOSSARY.md`, `lessons/README.md`.

- [ ] **Step 1: `CHEATSHEET.md` の「概念 ↔ 関数」表に追記**(末尾に追加、既存行は消さない):
```markdown
| レイヤーを抜く | `.mask("<1 1 1 0>")` | サイクル単位で 1=鳴/0=止 |
| 周期的な変化 | `.every(4, x => x.fast(2))` | N サイクルごとに変形 |
| 曲の構成 | `arrange([8, パターンA], [16, パターンB])` | セクションを順に並べる |
| 音量バランス | `.gain(0.9)` | キック/ベースを土台に |
| 定位(パン) | `.pan(0.7)` | 0=左 / 0.5=中央 / 1=右 |
```

- [ ] **Step 2: `GLOSSARY.md` の表に追記**(末尾に追加):
```markdown
| テクスチャ | 鳴っている音の重なり具合・密度がつくる「質感」。 |
| アレンジ | レイヤーの足し引きや変化で展開をつけること。 |
| 曲の構成(フォーム) | イントロ・ビルド・ドロップ・ブレイクなどセクションの並び。 |
| ミックス | 各音の音量・定位・空間を整え、全体を聴きやすくする作業。 |
| パン(定位) | 音の左右の位置(0=左, 1=右)。 |
```

- [ ] **Step 3: `README.md` のロードマップを更新** — `### Phase 4 以降(今後追加)` の節を、次に置き換える(Phase 1/2/3 の節は残す):
```markdown
### Phase 4 構成・仕上げ編
- [ ] M10 アレンジとテクスチャ(`10-arrange-texture/`)
- [ ] M11 曲の構成(`11-song-structure/`)
- [ ] M12 ミックスと作品化(`12-mix-finish/`)
- [ ] 統合D 1 曲完成(`integration-D-track/`)

これで Phase 1〜4 のカリキュラムは完成です。各レッスンを順に進め、統合D で構成のある 1 曲を作り上げてください。
```

- [ ] **Step 4: 全体スモーク + テスト**
Run: `npm run check-lessons` then `npm test`
Expected: Phase 1–4 の全 `.mjs` が `OK`(`N/N OK`、exit 0)。`npm test` は 16/16 pass。

- [ ] **Step 5: コミット**
```bash
git add lessons/CHEATSHEET.md lessons/GLOSSARY.md lessons/README.md
git commit -m "docs(lessons): Phase 4 を反映しカリキュラムを完成" -m "Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## 完了の定義(Phase 4 / カリキュラム全体)

- `lessons/` に M10–M12 + 統合D が揃い、`npm run check-lessons` green、`npm test` green。
- CHEATSHEET/GLOSSARY/README が Phase 4 を反映し、ロードマップに Phase 1–4 が揃う。
- (実機の耳確認は学習時にユーザーが strudel.cc で実施。)
- Phase 1–4(M0–M12 + 統合A–D)の全カリキュラムが完成。
