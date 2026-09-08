/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Unfinished Works
 */
import { defaultPalette, resolvePalette } from './palettes.js';
export { palettes, resolvePalette, paletteProvenance } from './palettes.js';
export const defaults = Object.freeze({ palette: defaultPalette, preset: 'dashboard', density: 'compact', effects: 'on', crispText: false });
const choices = { preset: ['website', 'dashboard'], density: ['compact', 'comfortable'], effects: ['on', 'static', 'off'] };
const attributes = ['data-phosphor','data-ph-palette','data-ph-preset','data-ph-density','data-ph-effects','data-ph-crisp'];
const owners = new WeakMap();
function normalize(config) {
  for (const key of Object.keys(config)) if (!Object.hasOwn(defaults, key)) throw new TypeError(`Unknown configuration key: ${key}`);
  for (const [key, values] of Object.entries(choices)) if (!values.includes(config[key])) throw new RangeError(`Invalid ${key}: ${config[key]}`);
  if (typeof config.crispText !== 'boolean') throw new TypeError('crispText must be a boolean');
  return { config: Object.freeze({ ...config }), tokens: resolvePalette(config.palette) };
}
/** Decorates one existing HTML container. Own the lifecycle; call destroy on removal. */
export function mountPhosphor(root, options = {}) {
  if (!root || root.nodeType !== 1) throw new TypeError('mountPhosphor needs an HTML element');
  if (owners.has(root)) { const owned = owners.get(root); owned.update(options); return owned; }
  let state = normalize({ ...defaults, ...options });
  let destroyed = false;
  const previousAttributes = new Map(attributes.map(key => [key, root.getAttribute(key)]));
  const previousTokens = new Map(Object.keys(state.tokens).map(key => [key, [root.style.getPropertyValue(key), root.style.getPropertyPriority(key)]]));
  const emit = () => root.dispatchEvent(new CustomEvent('phosphorchange', { detail: state.config }));
  function apply() {
    root.setAttribute('data-phosphor', '');
    for (const name of ['palette','preset','density','effects']) root.setAttribute(`data-ph-${name}`, state.config[name]);
    root.setAttribute('data-ph-crisp', String(state.config.crispText));
    for (const [name, value] of Object.entries(state.tokens)) root.style.setProperty(name, value);
    emit();
  }
  const api = {
    get config() { return state.config; },
    update(patch = {}) {
      if (destroyed) throw new Error('Cannot update a destroyed Phosphor instance');
      state = normalize({ ...state.config, ...patch }); // Validate everything before mutating the DOM.
      apply();
      return api;
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      root.dispatchEvent(new CustomEvent('phosphordestroy'));
      for (const [key, value] of previousAttributes) value === null ? root.removeAttribute(key) : root.setAttribute(key, value);
      for (const [key, [value, priority]] of previousTokens) value ? root.style.setProperty(key, value, priority) : root.style.removeProperty(key);
      owners.delete(root);
    },
  };
  owners.set(root, api);
  apply();
  return api;
}
