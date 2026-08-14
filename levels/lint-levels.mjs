import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ALLOWED = new Set(['.', 'X', 'L', 'R', 'S', 'P', 'C', '*', 'E']);
const W = 22;
const H = 40;

function lintFile(file, data) {
  const issues = [];
  const level = data.level;
  if (!Number.isInteger(level) || level < 1) issues.push('level must be a positive integer');
  const m = /(\d+)\.json$/.exec(file);
  if (m && Number(m[1]) !== level) issues.push(`level ${level} does not match filename ${file}`);
  if (!Number.isFinite(data.timer) || data.timer <= 0) issues.push('timer must be a positive number');
  if (!Number.isInteger(data.tileset) || data.tileset < 1) issues.push('tileset must be a positive integer');
  if (!Array.isArray(data.grid) || data.grid.length !== H) issues.push(`grid must have ${H} rows`);
  let s = 0;
  let e = 0;
  for (let r = 0; r < H; r++) {
    const row = data.grid?.[r];
    if (typeof row !== 'string' || row.length !== W) {
      issues.push(`row ${r}: must be a string of exactly ${W} chars`);
      continue;
    }
    for (let c = 0; c < W; c++) {
      const ch = row[c];
      if (!ALLOWED.has(ch)) issues.push(`row ${r} col ${c}: illegal char '${ch}'`);
      if (ch === 'S') s++;
      if (ch === 'E') e++;
    }
    if (row[0] !== 'X' || row[W - 1] !== 'X') issues.push(`row ${r}: columns 0 and ${W - 1} must be walls (X)`);
  }
  if (data.grid?.[H - 1]?.split('').some((ch) => ch !== 'X')) issues.push('bottom row must be solid platform (X)');
  if (s !== 1) issues.push(`expected exactly one S (stickman spawn), found ${s}`);
  if (e !== 1) issues.push(`expected exactly one E (exit door), found ${e}`);
  return issues;
}

let failed = 0;
const dir = new URL('.', import.meta.url).pathname;
for (const file of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
  const raw = readFileSync(join(dir, file), 'utf8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    console.log(`FAIL  ${file}  (invalid JSON: ${err.message})`);
    failed++;
    continue;
  }
  const issues = lintFile(file, data);
  if (issues.length === 0) {
    console.log(`PASS  ${file}`);
  } else {
    console.log(`FAIL  ${file}`);
    for (const i of issues) console.log(`      - ${i}`);
    failed++;
  }
}
if (failed > 0) {
  console.log(`\n${failed} level file(s) failed validation`);
  process.exit(1);
}
console.log('\nAll level files valid');
