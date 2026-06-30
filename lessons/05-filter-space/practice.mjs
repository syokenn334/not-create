// M5 練習
setcpm(130 / 4)
note("c2*8").s("sawtooth")
  // TODO 1: .lpf を固定値 800 にしてから sine.range(300,1500).slow(4) に戻し、動く/動かないを聴き比べる。
  .lpf(sine.range(300, 1500).slow(4))
  // TODO 2: .room の値を 0→0.6 で変えて、空間の広さの違いを聴く。
  .room(0.3)
  // TODO 3: .delay を消したり 0.5 にしたりして、やまびこの量を変える。
  .delay(0.25).punchcard()
