/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Unfinished Works
 */
import { copyFile, lstat, readFile, readdir, appendFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
// Explicit publication boundary: never archive the worktree or an entire directory.
const files = [
  'LICENSE', 'THIRD_PARTY_NOTICES.md', 'README.md', 'CONTRIBUTING.md', '.node-version',
  'package.json', 'package-lock.json', 'vite.config.js', 'playwright.config.js',
  'index.html', 'examples/plain.html', 'examples/components.html', 'examples/components.js', 'examples/components.css',
  'src/index.js', 'src/ambient.js', 'src/palettes.js', 'src/palette-snapshot.json',
  'src/core.css', 'src/components.css', 'src/fonts.css',
  'fonts/victor-mono/LICENSE', 'fonts/victor-mono/provenance.json',
  'fonts/victor-mono/VictorMono-Regular.woff2', 'fonts/victor-mono/VictorMono-Italic.woff2',
  'fonts/victor-mono/VictorMono-Bold.woff2', 'fonts/victor-mono/VictorMono-BoldItalic.woff2',
  'playground/main.js', 'playground/optics.js', 'playground/specimens.js', 'playground/playground.css',
  'docs/README.md', 'docs/api.md', 'docs/palettes.md', 'docs/accessibility-performance.md', 'docs/troubleshooting.md',
  'docs/integration.md', 'docs/provenance.md', 'docs/deployment.md', 'docs/getting-started.md', 'docs/style-reference.md', 'docs/adapters.md',
  'scripts/package-demo.mjs', 'scripts/check-engines.mjs', 'scripts/check-docs.mjs', 'scripts/snapshot-palettes.mjs',
  'tests/palettes.test.js', 'tests/browser/playground.spec.js',
];
for (const name of files) {
  const stat = await lstat(root + name);
  if (!stat.isFile() || stat.size > 10 * 1024 * 1024) {
    throw new Error(`Source archive input must be a regular file under 10 MB: ${name}`);
  }
}
await readFile(root + 'dist/index.html'); // Run only after a successful Vite build.
for (const name of ['LICENSE', 'THIRD_PARTY_NOTICES.md']) {
  await copyFile(root + name, root + 'dist/' + name);
}
execFileSync('tar', ['--format=ustar', '--owner=0', '--group=0', '--numeric-owner', '--mtime=@0', '-czf', 'dist/source.tgz', '--', ...files], {
  cwd: root, stdio: 'pipe', timeout: 30000, maxBuffer: 100000,
});
const notice = '\n/*! Unfinished Phosphor: GPL-3.0-only, without warranty. Source: /source.tgz; license: /LICENSE; third-party terms: /THIRD_PARTY_NOTICES.md */\n';
for (const name of await readdir(root + 'dist/assets')) {
  if (/\.(js|css)$/.test(name)) await appendFile(root + 'dist/assets/' + name, notice);
}
console.log(`Packaged ${files.length} source files and license notices. The public palette selection includes upstream notices.`);
