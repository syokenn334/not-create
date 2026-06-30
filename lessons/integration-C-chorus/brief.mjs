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
