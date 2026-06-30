import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { evaluateLessonFile } from '../lib/lesson-check.mjs';

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const ent of entries) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...(await walk(p)));
    else if (ent.name.endsWith('.mjs')) out.push(p);
  }
  return out;
}

const args = process.argv.slice(2);
const files = args.includes('--all') || args.length === 0 ? await walk('lessons') : args;

let failed = 0;
for (const f of files) {
  try {
    const haps = await evaluateLessonFile(f);
    if (!haps.length) throw new Error('イベントが 0(音が出ない)');
    console.log(`OK   ${f}  (${haps.length} events / 4 cycles)`);
  } catch (err) {
    failed++;
    console.error(`FAIL ${f}\n     ${err.message}`);
  }
}
console.log(`\n${files.length - failed}/${files.length} OK`);
process.exit(failed ? 1 : 0);
