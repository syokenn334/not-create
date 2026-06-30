// M11 練習
setcpm(124 / 4)
arrange(
  // TODO 1: 各セクションのサイクル数を変えて、長さの構成を設計する。
  [4, s("bd*4")],
  [4, stack(s("bd*4"), s("hh*8"))],
  // TODO 2: ドロップの後に「ブレイク」(キックを抜く)セクションを足してみる。
  //   例: [4, stack(s("hh*8"), s("~ cp ~ cp"))],
  [8, stack(s("bd*4"), s("hh*8"), s("~ cp ~ cp"))],
)._punchcard()
