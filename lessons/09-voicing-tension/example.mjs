// M9 テンションとボイシング
// コード記号を書くと .voicing() が自動でいい音の重ね方にしてくれる。
// .rootNotes(2) で同じ進行のルート音をベースとして鳴らす。
setcpm(120 / 4)
stack(
  "<Cm7 Ab^7 Bb7 Cm7>".voicing().s("sawtooth").lpf(1500).attack(0.02).release(0.3).gain(0.4),
  "<Cm7 Ab^7 Bb7 Cm7>".rootNotes(2).s("sawtooth").lpf(500).decay(0.2).sustain(0).gain(0.6),
)
