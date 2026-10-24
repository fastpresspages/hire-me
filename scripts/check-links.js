import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const htmlFiles = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
const missing = [];
let checked = 0;

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(root, file), 'utf8');
  for (const m of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const raw = m[1].trim();
    if (!raw || raw.startsWith('#') || /^(https?:|mailto:|tel:|data:)/i.test(raw)) continue;
    const clean = raw.split('#')[0].split('?')[0];
    if (!clean) continue;
    checked += 1;
    let target = path.resolve(root, clean);
    if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
    if (!fs.existsSync(target)) missing.push(`${file} -> ${raw}`);
  }
}

for (const file of fs.readdirSync(root).filter((f) => f.endsWith('.css'))) {
  const css = fs.readFileSync(path.join(root, file), 'utf8');
  for (const m of css.matchAll(/url\(["']?([^"')]+)["']?\)/g)) {
    const raw = m[1].trim();
    if (!raw || raw.startsWith('data:') || /^https?:/i.test(raw)) continue;
    checked += 1;
    const target = path.resolve(root, raw.split('#')[0].split('?')[0]);
    if (!fs.existsSync(target)) missing.push(`${file} -> ${raw}`);
  }
}

if (missing.length) {
  console.error(`Missing ${missing.length} local asset(s):`);
  for (const item of missing) console.error(`  ${item}`);
  process.exit(1);
}
console.log(`Checked ${checked} local links and assets across ${htmlFiles.length} pages. All present.`);
