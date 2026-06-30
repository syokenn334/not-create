// M12 ミックスと作品化(音量・定位・空間)
setcpm(124 / 4)
stack(
  s("bd*4").gain(0.9),                                  // キックは芯。少し大きめ
  s("hh*8").gain(0.5).pan(0.7),                         // ハットは控えめ・右寄り
  s("~ cp ~ cp").gain(0.7).room(0.3),                   // クラップに残響
  note("c2*8").s("sawtooth").lpf(600).gain(0.6).pan(0.4), // ベースは中央やや左
).punchcard()
