// M3 練習
setcpm(130 / 4)
stack(
  s("bd*4"),
  // TODO 1: .swing(4) の数字を変える / .swingBy(1/3, 8) に置き換えて、はね方の違いを聴く。
  s("hh*8").gain("0.5 0.8"),
  s("~ cp ~ cp").room(0.25),
  // TODO 2: euclid の数字を (5, 8) や (3, 8) に変えて、パーカッションの密度を変える。
  s("rim").euclid(3, 8).gain(0.5),
)._punchcard()
