// M10 練習
setcpm(124 / 4)
stack(
  s("bd*4"),
  // TODO 1: mask の "<1 1 1 0>" を変えて、レイヤーを抜くタイミングを設計する。
  s("hh*8").gain(0.6).mask("<1 1 1 0>"),
  // TODO 2: every(4, ...) の数字や中の関数(x => x.fast(2) / x.rev() など)を変える。
  s("rim*16").gain(0.4).every(4, x => x.fast(2)),
).punchcard()
