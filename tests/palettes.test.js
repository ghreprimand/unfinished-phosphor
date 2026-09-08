/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Unfinished Works
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { palettes, resolvePalette, contrast, paletteProvenance } from '../src/palettes.js';
import snapshot from '../src/palette-snapshot.json' with { type: 'json' };

test('snapshot maps every source ID, name, category, and color without collisions', () => {
  assert.equal(paletteProvenance.count, 4);
  assert.equal(palettes.length, 7);
  assert.deepEqual(snapshot.palettes.map(p => p.id), ['odyssey-crt', 'nord', 'dracula', 'catppuccin']);
  assert.equal(new Set(palettes.map(p => p.id)).size, palettes.length);
  for (const original of snapshot.palettes) {
    const mapped = palettes.find(p => p.id === `dashboard:${original.id}`);
    for (const [key, value] of Object.entries(original)) if (key !== 'id') assert.deepEqual(mapped[key], value);
    if (original.id !== 'odyssey-crt') {
      assert.equal(original.provenance.upstreamLicense, 'MIT');
      assert.match(original.provenance.revision, /^[a-f0-9]{40}$/);
      assert.ok(original.provenance.source.includes(original.provenance.revision));
      assert.ok(original.provenance.licenseSource.includes(original.provenance.revision));
      assert.match(original.provenance.sourceSha256, /^[a-f0-9]{64}$/);
    }
  }
  assert.match(paletteProvenance.sha256, /^[a-f0-9]{64}$/);
  assert.equal(paletteProvenance.sha256, createHash('sha256').update(JSON.stringify(snapshot.palettes)).digest('hex'));
  assert.match(paletteProvenance.revision, /^\d{4}-\d{2}-\d{2}$/);
});
test('all palette roles are complete, valid, and readable on every declared surface', () => {
  const contract = Object.keys(resolvePalette()).sort();
  for (const palette of palettes) {
    const tokens = resolvePalette(palette.id);
    assert.deepEqual(Object.keys(tokens).sort(), contract);
    for (const value of Object.values(tokens)) assert.match(value, /^#[a-f0-9]{6}$/i);
    for (const surface of ['bg','surface','raised','input']) {
      for (const role of ['text','muted','accent','success','warning','danger','info','secondary','focus']) {
        assert.ok(contrast(tokens[`--ph-${role}`],tokens[`--ph-${surface}`])>=4.5, `${palette.id}: ${role}/${surface}`);
      }
      assert.ok(contrast(tokens['--ph-control'],tokens[`--ph-${surface}`])>=3, `${palette.id}: control/${surface}`);
    }
    assert.ok(contrast(tokens['--ph-accent'],tokens['--ph-on-accent'])>=4.5);
    for (let i=1;i<=6;i++) assert.ok(tokens[`--ph-chart-${i}`]);
    assert.ok(Object.isFrozen(tokens));
  }
});
test('unknown IDs fail explicitly and resolution cannot mutate catalog entries', () => {
  const before=JSON.stringify(palettes);
  assert.throws(()=>resolvePalette('missing'),/Unknown palette/);
  for(const palette of palettes)resolvePalette(palette.id);
  assert.equal(JSON.stringify(palettes),before);
});
