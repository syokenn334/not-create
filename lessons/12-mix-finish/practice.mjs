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
