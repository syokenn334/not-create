// M6 練習
setcpm(130 / 4)
stack(
  s("bd*4"),
  // TODO 1: n の数字(度数)を変えてベースの動きを作る。0 がルート(c)、7 で 1 オクターブ上。
  n("0 ~ 0 ~ 3 ~ 5 ~").scale("c2:minor")
    // TODO 2: scale を "c2:major" や "c2:dorian" に変えて雰囲気の違いを聴く。
    .s("sawtooth").lpf(600).decay(0.2).sustain(0)
  // TODO 3: ベースの音をキックの隙間(~ の位置)に置いて、キックとぶつからないようにする。
)
