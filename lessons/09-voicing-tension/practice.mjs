// M9 練習
setcpm(120 / 4)
stack(
  // TODO 1: コード記号を変える。Cm7→Cm9、Ab^7→Ab^9 などテンションを足して響きの違いを聴く。
  "<Cm7 Ab^7 Bb7 Cm7>".voicing().s("sawtooth").lpf(1500).attack(0.02).release(0.3).gain(0.4),
  // TODO 2: rootNotes のオクターブ(2)を 1 や 3 に変えて、ベースの高さを調整する。
  "<Cm7 Ab^7 Bb7 Cm7>".rootNotes(2).s("sawtooth").lpf(500).decay(0.2).sustain(0).gain(0.6),
).punchcard()
