import { readdir, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const EXTS = ['.mjs', '.strudel'];

export async function buildManifest(dir) {
  const entries = [];
  async function walk(d) {
    let items;
    try {
      items = await readdir(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const it of items) {
      const full = path.join(d, it.name);
      if (it.isDirectory()) {
        await walk(full);
        continue;
      }
      if (!EXTS.includes(path.extname(it.name))) continue;
      if (it.name.startsWith('_')) continue;
      const code = await readFile(full, 'utf8');
      const rel = path.relative(dir, full).split(path.sep).join('/');
      const id = rel.replace(/\.(mjs|strudel)$/, '').replace(/[^a-zA-Z0-9]+/g, '__');
      const m = code.match(/\/\/\s*@title\s+(.+)/);
      const title = m ? m[1].trim() : path.basename(it.name).replace(/\.(mjs|strudel)$/, '');
      entries.push({ id, title, file: rel, code });
    }
  }
  await walk(dir);
  entries.sort((a, b) => a.file.localeCompare(b.file));
  return entries;
}

// CLI として直接実行されたときだけマニフェストを書き出す
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const patternsDir = path.resolve(__dirname, '../../patterns');
  const out = path.resolve(__dirname, '../src/patterns.json');
  const entries = await buildManifest(patternsDir);
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, JSON.stringify(entries, null, 2));
  console.log(`[generate] ${entries.length} patterns -> src/patterns.json`);
}
