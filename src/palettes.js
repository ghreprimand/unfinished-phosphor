/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Unfinished Works
 */
import snapshot from './palette-snapshot.json' with { type: 'json' };

export const catalogVersion = 2;
const website = [
  { id: 'website:green', name: 'P1 · Green', category: 'Phosphor', bg: '#020806', secondary: '#07110d', border: '#335d43', text: '#cfded4', muted: '#86b8aa', accent: '#00ffaa', blue: '#00ffff', orange: '#ffaa00', red: '#ff3344', green: '#00ff66', purple: '#ff44ff' },
  { id: 'website:amber', name: 'P3 · Amber', category: 'Phosphor', bg: '#080502', secondary: '#151007', border: '#6d5530', text: '#f4e3c2', muted: '#c2a172', accent: '#ffaa00', blue: '#ffd75e', green: '#ffb000', orange: '#ffcf66', red: '#ff4433', purple: '#ff8844' },
  { id: 'website:white', name: 'P4 · White', category: 'Phosphor', bg: '#050707', secondary: '#111616', border: '#50645c', text: '#ffffff', muted: '#b7c4c0', accent: '#cfe6dc', blue: '#cfeeff', green: '#eef6f1', orange: '#e8c890', red: '#ff5566', purple: '#d8b8e8' },
];
export const palettes = Object.freeze([
  ...website.map(t => Object.freeze({ ...t, source: 'website-phosphors' })),
  ...snapshot.palettes.map(t => Object.freeze({ ...t, id: `dashboard:${t.id}`, source: snapshot.source })),
]);
export const paletteProvenance = Object.freeze({ source: snapshot.source, revision: snapshot.revision, sha256: snapshot.sha256, count: snapshot.count });
export const defaultPalette = 'dashboard:odyssey-crt';
export function rgb(hex) {
  if (!/^#[\da-f]{6}$/i.test(hex)) throw new TypeError(`Expected a six-digit hex color: ${hex}`);
  return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
}
export function mix(a, b, amount) {
  const right = rgb(b);
  return '#' + rgb(a).map((n, i) => Math.round(n + (right[i] - n) * amount).toString(16).padStart(2, '0')).join('');
}
export function contrast(a, b) {
  const luminance = value => rgb(value).map(n => n / 255).map(n => n <= .04045 ? n / 12.92 : ((n + .055) / 1.055) ** 2.4).reduce((sum, n, i) => sum + n * [.2126, .7152, .0722][i], 0);
  const [x, y] = [luminance(a), luminance(b)];
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
function readable(color, surfaces, ratio = 4.5) {
  // Current catalog is dark. Preserve the seed hue and lift its luminance.
  for (let i = 0; i <= 100; i++) {
    const candidate = mix(color, '#ffffff', i / 100);
    if (surfaces.every(surface => contrast(candidate, surface) >= ratio)) return candidate;
  }
  throw new RangeError('Palette surfaces are outside the supported dark color range.');
}
/** Pure adapter. An unknown ID is an error, never a silent palette change. */
export function resolvePalette(id = defaultPalette) {
  const theme = palettes.find(p => p.id === id);
  if (!theme) throw new RangeError(`Unknown palette: ${id}`);
  const raised = theme.tertiary || mix(theme.secondary, '#ffffff', .04);
  const surfaces = [theme.bg, theme.secondary, raised, theme.input || theme.bg];
  const accent = readable(theme.accent, surfaces);
  const result = {
    '--ph-bg': theme.bg, '--ph-surface': theme.secondary, '--ph-raised': raised, '--ph-input': theme.input || theme.bg,
    '--ph-text': readable(theme.text, surfaces), '--ph-muted': readable(theme.muted, surfaces),
    '--ph-accent': accent, '--ph-on-accent': contrast('#000000', accent) >= contrast('#ffffff', accent) ? '#000000' : '#ffffff',
    '--ph-border': theme.border, '--ph-control': readable(theme.border, surfaces, 3), '--ph-focus': accent,
    '--ph-emission': theme.accent, '--ph-glass': mix(readable(theme.muted, surfaces), accent, .22),
    '--ph-success': readable(theme.green || '#3fb950', surfaces), '--ph-warning': readable(theme.orange || '#d29922', surfaces),
    '--ph-danger': readable(theme.red || '#f85149', surfaces), '--ph-info': readable(theme.blue || '#58a6ff', surfaces),
    '--ph-secondary': readable(theme.purple || '#bc8cff', surfaces),
  };
  ['accent','info','success','warning','secondary','danger'].forEach((role, i) => result[`--ph-chart-${i + 1}`] = result[`--ph-${role}`]);
  return Object.freeze(result);
}
