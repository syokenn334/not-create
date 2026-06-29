/// <reference path="../types/strudel.d.ts" />
// .mjs にすると Zed で Strudel 関数の補完が効く（types/strudel.d.ts による）。
// 1行目の reference は補完を確実にするための保険（Strudel では単なるコメント）。
// 保存すると strudel.cc に反映される（音は途切れない）。
stack(
  s("bd*2 sd").bank("RolandTR909"),
  s("hh*8").gain(0.4),
);
