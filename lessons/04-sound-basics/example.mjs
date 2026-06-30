// M4 サウンド基礎(シンセと ADSR)
setcpm(130 / 4)
note("c3 eb3 g3 c4")           // C マイナーの分散和音
  .s("sawtooth")               // のこぎり波シンセ
  .attack(0.01)                // 立ち上がり(秒)
  .decay(0.15)                 // 減衰
  .sustain(0.4)                // 保持レベル(0〜1)
  .release(0.1)                // 余韻
