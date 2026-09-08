/* SPDX-License-Identifier: GPL-3.0-only; Copyright (C) 2026 Unfinished Works */
import { mountPhosphor } from '../src/index.js';
import { mountAmbient } from '../src/ambient.js';
import { palettes } from '../src/palettes.js';

const root = document.querySelector('#reference');
const display = mountPhosphor(root, { effects: 'static', density: 'comfortable' });
mountAmbient(root);
const palette = document.querySelector('#palette');
for (const entry of palettes) palette.add(new Option(entry.name, entry.id));
palette.value = display.config.palette;
palette.addEventListener('change', () => display.update({ palette: palette.value }));
document.querySelector('#effects').addEventListener('change', event => display.update({ effects: event.target.value }));
document.querySelector('#open-dialog').addEventListener('click', () => document.querySelector('#reference-dialog').showModal());
document.querySelector('#reference-form').addEventListener('submit', event => {
  event.preventDefault();
  document.querySelector('#form-status').textContent = 'Form handled locally. Nothing was uploaded or saved.';
});
const tabs = [...root.querySelectorAll('[role="tab"]')];
function selectTab(selected) {
  for (const tab of tabs) {
    const active = tab === selected;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
    document.getElementById(tab.getAttribute('aria-controls')).hidden = !active;
  }
}
for (const [index, tab] of tabs.entries()) {
  tab.addEventListener('click', () => selectTab(tab));
  tab.addEventListener('keydown', event => {
    const next = { ArrowRight: (index + 1) % tabs.length, ArrowLeft: (index + tabs.length - 1) % tabs.length, Home: 0, End: tabs.length - 1 }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    selectTab(tabs[next]);
    tabs[next].focus();
  });
}

document.querySelector('#reference-glow').addEventListener('input', event => {
  const glow = Number(event.target.value);
  display.update({glow});
  document.querySelector('#reference-glow-value').textContent = `${glow}%`;
});
