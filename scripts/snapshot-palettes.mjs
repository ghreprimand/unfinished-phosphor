/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Unfinished Works
 */
// Explicit, local-only ingestion. No sibling repository is needed to run the toolkit.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { stripTypeScriptTypes } from 'node:module';
const [source, revision, output] = process.argv.slice(2);
if (!source || !output || !/^[a-f0-9]{40}$/.test(revision || '')) {
  throw new Error('Usage: node scripts/snapshot-palettes.mjs <palette.ts> <40-character revision> <local-output.json>');
}
const raw = await readFile(source, 'utf8');
// This script executes trusted source. Review the input before running it.
const module = await import('data:text/javascript;base64,' + Buffer.from(stripTypeScriptTypes(raw)).toString('base64'));
const keys = ['id','name','category','bg','secondary','tertiary','input','border','text','muted','accent','accentLight','green','red','orange','blue','purple'];
const palettes = module.odysseyThemes.map(theme => Object.fromEntries(keys.filter(key => key in theme).map(key => [key, theme[key]])));
const snapshot = { schema: 1, source: 'dashboard-palette-catalog', revision, sha256: createHash('sha256').update(raw).digest('hex'), count: palettes.length, palettes };
await writeFile(output, JSON.stringify(snapshot, null, 2) + '\n', { flag: 'wx' });
console.log(`Exported ${palettes.length} palettes for local review. This does not approve them for publication.`);
