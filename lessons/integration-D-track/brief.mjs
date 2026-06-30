// 統合D: 構成のある 1 曲(最終課題)
// これまで学んだ全部を使い、arrange でセクションを並べて 1 曲にする。
setcpm(124 / 4)
arrange(
  [8, s("bd*4")],
  // TODO: [8, stack(...ドラム+ベース...)],                    ← Phase 1/2
  // TODO: [16, stack(...フル: ドラム+ベース+コード+パッド...)], ← Phase 3
  // TODO: [8, stack(...ブレイク: キックを抜く...)],
  // TODO: 各レイヤーの gain / pan / room を整える(ミックス)   ← M12
)._punchcard()
