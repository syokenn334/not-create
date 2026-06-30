// M7 練習
setcpm(120 / 4)
// TODO 1: scale を "c4:major" に変えて、明るさの違いを聴く。
// TODO 2: "c4:dorian" や "c4:phrygian" などモードに変えて雰囲気を比べる。
// TODO 3: n の並びを "0 2 4 2 0" のように変えて、簡単なメロディを作る。
n("0 1 2 3 4 5 6 7").scale("c4:minor").s("triangle").gain(0.5)
