import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const dist = path.dirname(require.resolve('pdfjs-dist/package.json'));
const candidates = [
  path.join(dist, 'build', 'pdf.worker.mjs'),
  path.join(dist, 'legacy', 'build', 'pdf.worker.mjs'),
];
const source = candidates.find((file) => fs.existsSync(file));
if (!source) throw new Error('pdfjs-dist worker file was not found');
fs.mkdirSync('public', { recursive: true });
fs.copyFileSync(source, path.join('public', 'pdf.worker.mjs'));
console.log(`Copied PDF.js worker from ${source}`);
