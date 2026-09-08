/* SPDX-License-Identifier: GPL-3.0-only; Copyright (C) 2026 Unfinished Works */
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
import { dirname, resolve, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import * as api from '../src/index.js';
import * as paletteApi from '../src/palettes.js';
import * as ambientApi from '../src/ambient.js';

const root = fileURLToPath(new URL('../', import.meta.url));
const files = ['README.md', 'CONTRIBUTING.md', 'THIRD_PARTY_NOTICES.md', ...(await readdir(resolve(root, 'docs'))).filter(n => n.endsWith('.md')).map(n => `docs/${n}`)];
const pages = new Map(await Promise.all(files.map(async name => [name, await readFile(resolve(root, name), 'utf8')])));
const withoutCode = text => text.replace(/```[^\n]*\n[\s\S]*?```/g, '');
function anchors(text) {
  const used = new Map();
  return new Set([...withoutCode(text).matchAll(/^#{1,6}\s+(.+)$/gm)].map(([, heading]) => {
    const slug = heading.toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/ /g, '-');
    const occurrence = used.get(slug) || 0;
    used.set(slug, occurrence + 1);
    return occurrence ? `${slug}-${occurrence}` : slug;
  }));
}
let links = 0, snippets = 0;
function checkJavaScript(code, location) {
  const result = spawnSync(process.execPath, ['--input-type=module', '--check'], { input: code, encoding: 'utf8', maxBuffer: 100000 });
  assert.equal(result.status, 0, `${location}: invalid JavaScript\n${result.stderr}`);
  snippets++;
}
const knownIds = new Set(api.palettes.map(p => p.id));
for (const [name, text] of pages) {
  for (const match of withoutCode(text).matchAll(/\[[^\]]+\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
    let target = match[1];
    const ownPrefix = 'https://github.com/ghreprimand/unfinished-phosphor/blob/main/';
    let base = dirname(resolve(root, name));
    if (target.startsWith(ownPrefix)) { target = target.slice(ownPrefix.length); base = root; }
    if (/^[a-z]+:|^\/\//i.test(target)) continue;
    const [path, hash] = target.split('#');
    const absolute = path ? resolve(base, decodeURIComponent(path)) : resolve(root, name);
    assert.ok(!relative(root, absolute).startsWith('..'), `${name}: link leaves repository: ${target}`);
    assert.ok(await stat(absolute).catch(() => false), `${name}: missing link: ${target}`);
    if (hash && absolute.endsWith('.md')) {
      const linked = await readFile(absolute, 'utf8');
      assert.ok(anchors(linked).has(decodeURIComponent(hash)), `${name}: missing heading: ${target}`);
    }
    links++;
  }
  for (const [, language, code] of text.matchAll(/```([^\n]*)\n([\s\S]*?)```/g)) {
    if (['js', 'javascript', 'mjs'].includes(language)) checkJavaScript(code, name);
    if (language === 'html') {
      for (const [, script] of code.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)) checkJavaScript(script, name);
    }
    if (language === 'sh') {
      for (const [, script] of code.matchAll(/<<'JS'[^\n]*\n([\s\S]*?)\nJS(?:\n|$)/g)) checkJavaScript(script, name);
    }
  }
  for (const [, id] of text.matchAll(/(?:['"`])((?:dashboard|website):[a-z0-9-]+)(?:['"`])/g)) {
    if (id === 'dashboard:my-palette') continue; // Explicit custom-catalog example.
    assert.ok(knownIds.has(id), `${name}: unknown documented palette ${id}`);
  }
}
const reference = pages.get('docs/api.md');
for (const exported of new Set([...Object.keys(api), ...Object.keys(paletteApi), ...Object.keys(ambientApi)])) {
  assert.ok(reference.includes(`\`${exported}\``), `API reference omits export: ${exported}`);
}
for (const id of knownIds) assert.ok(pages.get('docs/palettes.md').includes(`\`${id}\``), `Palette guide omits ${id}`);
const packager = await readFile(resolve(root, 'scripts/package-demo.mjs'), 'utf8');
for (const name of files) assert.ok(packager.includes(`'${name}'`), `Source download omits guide: ${name}`);
console.log(`Documentation: ${files.length} files, ${links} local links, ${snippets} JavaScript snippets, all exports and palette IDs checked.`);
