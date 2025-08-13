/*
Compares the latest generated Markdown snapshot with the current BASE DE DATOS.txt,
producing a unified diff and writing it under docs/db/snapshots/diff-YYYY-MM-DD_HH-mm-ss.txt
*/

import fs from 'node:fs';
import path from 'node:path';
import { diffLines } from 'diff';

function nowStamp() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}_${pad(d.getHours())}-${pad(d.getMinutes())}-${pad(d.getSeconds())}`;
}

const SNAP_DIR = path.resolve(process.cwd(), 'docs', 'db', 'snapshots');
const TXT_PATH = path.resolve(process.cwd(), 'documentacion modulos', 'BASE DE DATOS.txt');

function findLatestSnapshot(dir: string) {
  if (!fs.existsSync(dir)) return undefined;
  const files = fs.readdirSync(dir).filter(f => f.startsWith('schema-') && f.endsWith('.md'));
  files.sort(); // lexicographic works with our timestamp
  return files.length ? path.join(dir, files[files.length - 1]) : undefined;
}

function main() {
  const latest = findLatestSnapshot(SNAP_DIR);
  if (!latest) {
    console.error('No snapshot found. Run npm run db:snapshot:generate first.');
    process.exit(1);
  }
  const snapshot = fs.readFileSync(latest, 'utf8');
  const txt = fs.readFileSync(TXT_PATH, 'utf8');

  const diff = diffLines(txt, snapshot);
  const outLines: string[] = [];
  outLines.push(`# Diff BASE DE DATOS.txt vs ${path.basename(latest)}`);
  outLines.push('');
  for (const part of diff) {
    const prefix = part.added ? '+ ' : part.removed ? '- ' : '  ';
    const lines = part.value.split('\n');
    for (const l of lines) {
      if (l === '' && lines.indexOf(l) === lines.length - 1) continue;
      outLines.push(prefix + l);
    }
  }

  if (!fs.existsSync(SNAP_DIR)) fs.mkdirSync(SNAP_DIR, { recursive: true });
  const outPath = path.join(SNAP_DIR, `diff-${nowStamp()}.txt`);
  fs.writeFileSync(outPath, outLines.join('\n'), 'utf8');
  console.log(outPath);
}

main();
