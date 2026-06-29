/// <reference path="../types/strudel.d.ts" />
// @title demo-melody
// メロディ＋ベース＋軽いドラム。スペクトルに倍音の山が出やすい。
$: note("c4 e4 g4 b4 c5 b4 g4 e4").s("triangle").gain(0.45)
$: note("c2 ~ g2 ~").s("sawtooth").lpf(900).gain(0.5)
$: s("bd ~ bd ~").gain(0.8)
$: s("hh*4").gain(0.28)
