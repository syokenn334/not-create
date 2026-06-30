// M4 練習
setcpm(130 / 4)
note("c3 eb3 g3 c4")
  // TODO 1: .s("sawtooth") を "square" / "triangle" / "sine" に変えて音色の違いを聴く。
  .s("sawtooth")
  // TODO 2: .attack の値を 0.01→0.3 に上げて、音の立ち上がりが遅くなるのを聴く。
  .attack(0.01)
  // TODO 3: .sustain を 0 にして、.decay だけで切れる短い音(プラック)を作る。
  .decay(0.15).sustain(0.4).release(0.1)
