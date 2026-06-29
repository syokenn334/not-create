/// <reference path="../types/strudel.d.ts" />
// @title demo-techno
// 4つ打ちのテクノ。$: 区切りでキック/クラップ/ハット/ベースの4パート。
$: s("bd*4").gain(0.9)
$: s("~ cp ~ cp")
$: s("hh*8").gain(0.32)
$: note("c2 c2 g1 c2").s("sawtooth").lpf(620).gain(0.5)
