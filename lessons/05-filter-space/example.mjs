// M5 フィルターと空間
setcpm(130 / 4)
note("c2*8").s("sawtooth")
  .lpf(sine.range(300, 1500).slow(4))  // カットオフを LFO でゆっくり上下
  .room(0.3)                           // 残響(空間)
  .delay(0.25)._punchcard()                         // ディレイ(やまびこ)
