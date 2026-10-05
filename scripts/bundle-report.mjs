// Prints the biggest contributors of the initial JS chunks from `ng build --stats-json`.
import { readFileSync } from 'node:fs';
const stats = JSON.parse(readFileSync('dist/angular22-video-demos/browser-stats.json', 'utf8'));
const html = readFileSync('dist/angular22-video-demos/browser/index.html', 'utf8');
const initial = [...html.matchAll(/(?:src|href)="([^"]+\.js)"/g)].map((m) => m[1]);
for (const [name, out] of Object.entries(stats.outputs)) {
  const file = name.split('/').pop();
  if (!name.endsWith('.js') || !(initial.includes(file) || file.startsWith('main'))) continue;
  const agg = {};
  for (const [input, v] of Object.entries(out.inputs)) {
    const m = input.match(/node_modules\/((?:@[^/]+\/)?[^/]+)(\/[^/]+\/[^/]+|\/[^/]+)?/);
    const key = m ? m[1] + (/^@angular\/(material|cdk)$/.test(m[1]) ? (m[2] ?? '') : '') : 'src';
    agg[key] = (agg[key] ?? 0) + v.bytesInOutput;
  }
  console.log(`${file}  ${(out.bytes / 1024).toFixed(1)} kB`);
  for (const [k, v] of Object.entries(agg)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)) {
    console.log(`  ${k.padEnd(40)} ${(v / 1024).toFixed(1)} kB`);
  }
}
