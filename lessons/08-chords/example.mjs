// M8 和音の基礎(三和音とコード進行)
// カンマ , で同時に鳴らすと和音。<> で 1 サイクルごとにコードが変わる。
// これは Cm → Ab → Bb → Cm(C マイナーの i → VI → VII → i)。
setcpm(120 / 4)
note("<[c3,eb3,g3] [ab2,c3,eb3] [bb2,d3,f3] [c3,eb3,g3]>")
  .s("sawtooth").lpf(1200).attack(0.02).release(0.4).gain(0.4).punchcard()
