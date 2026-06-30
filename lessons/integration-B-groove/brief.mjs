// 統合B: ドラム + ベース + フィルター展開のグルーヴ
// 統合A のドラムに、M4〜M6 で学んだベースと音作りを足して育ててください。
setcpm(130 / 4)
stack(
  s("bd*4"),
  // TODO: 統合A のドラム(ハット/クラップ/パーカッション)を貼る        ← Phase 1
  // TODO: スケールに沿ったベースラインを足す(n(...).scale("c2:minor")) ← M6
  // TODO: ベースの音色を sawtooth + ADSR で整える                      ← M4
  // TODO: どこかのレイヤーに lpf(sine.range(...).slow(...)) で展開を付ける ← M5
).punchcard()
