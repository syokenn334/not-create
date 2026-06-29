// パターンソースを「パート」に分割する。
// $:（JS のラベル付き文 label `$`）1 つ＝1 パート。各 $: の直後から
// 次の $:（または EOF）までを 1 パートの式とみなし、末尾セミコロンを除去する。
// $: が無ければソース全体を 1 パートとして返す（コメント等はそのまま）。
export function splitParts(code) {
  const src = String(code ?? '');
  // 行頭（または先頭）にある `$ :` を境界として検出する。
  const re = /(^|\n)[ \t]*\$[ \t]*:/g;
  const bounds = [];
  let m;
  while ((m = re.exec(src)) !== null) {
    bounds.push({ boundary: m.index, exprStart: m.index + m[0].length });
  }

  const clean = (s) => s.trim().replace(/;\s*$/, '').trim();

  if (bounds.length === 0) {
    const whole = clean(src);
    return whole ? [whole] : [];
  }

  const parts = [];
  for (let i = 0; i < bounds.length; i++) {
    const from = bounds[i].exprStart;
    const to = i + 1 < bounds.length ? bounds[i + 1].boundary : src.length;
    const chunk = clean(src.slice(from, to));
    if (chunk) parts.push(chunk);
  }
  return parts;
}
