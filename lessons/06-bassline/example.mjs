// M6 ベースライン(スケールとルート)
setcpm(130 / 4)
stack(
  s("bd*4"),                                       // キック
  n("0 ~ 0 ~ 3 ~ 5 ~").scale("c2:minor")           // C マイナーの度数でベース
    .s("sawtooth").lpf(600).decay(0.2).sustain(0)  // 短いプラックベース
)._punchcard()
