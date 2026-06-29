import { readFile, writeFile, mkdir } from 'node:fs/promises';

// userscript を唯一のソースとして、ブックマークレット(javascript: URL)を生成する。
const src = await readFile('userscript/strudel-sync.user.js', 'utf8');

// // ==UserScript== ... // ==/UserScript== のメタブロックを除去して本体だけ取り出す。
const body = src
  .replace(/\/\/ ==UserScript==[\s\S]*?\/\/ ==\/UserScript==\s*/, '')
  .trim();

const bookmarklet = 'javascript:' + encodeURIComponent(body);

await mkdir('bookmarklet', { recursive: true });
await writeFile('bookmarklet/strudel-sync.bookmarklet.txt', bookmarklet + '\n');

console.log(bookmarklet);
console.error(`\n[build] wrote bookmarklet/strudel-sync.bookmarklet.txt (${bookmarklet.length} chars)`);
