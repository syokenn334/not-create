/// <reference path="../types/strudel.d.ts" />
// @title parts-demo
// $: で区切ると 1 行 = 1 パート。ギャラリーでは各パートが
// 自動グリッドの別マスに 1 サイクル固定グリッドで表示される。
$: s("bd*4")
$: s("~ sd ~ sd")
$: s("hh*8").gain(0.4)
$: note("c3 e3 g3 e3").s("sawtooth").gain(0.5)
