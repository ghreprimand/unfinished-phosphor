/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Unfinished Works
 */
import { mountPhosphor, defaults, palettes, resolvePalette } from '../src/index.js';
import { mountAmbient } from '../src/ambient.js';
import { dashboard, website, workbench, documentViews } from './specimens.js';
const $ = selector => document.querySelector(selector);
const root = $('#specimen');
const display = mountPhosphor(root);
const ambient = mountAmbient(root);
let currentSpecimen = 'dashboard', comparing = false, comparisonEffects;
const savedDraft = { title: 'Import WAV files', body: 'Keep the original WAV file. Store the title and description separately so edits do not change the recording.' };
const paletteSelect = $('#palette');
for (const category of [...new Set(palettes.map(p => p.category))]) {
  const group = document.createElement('optgroup'); group.label = category;
  for (const palette of palettes.filter(p => p.category === category)) {
    const option = document.createElement('option'); option.value = palette.id; option.textContent = palette.name; group.append(option);
  }
  paletteSelect.append(group);
}
$('#palette-count').textContent = palettes.length;
const quick = ['dashboard:odyssey-crt','website:amber','website:white','dashboard:nord','dashboard:dracula','dashboard:catppuccin'];
for (const id of quick) {
  const palette = palettes.find(p => p.id === id); const button = document.createElement('button');
  button.type = 'button'; button.title = palette.name; button.setAttribute('aria-label',palette.name); button.dataset.palette = id;
  button.style.setProperty('--swatch',palette.accent); button.addEventListener('click',()=>update({palette:id})); $('#quick-palettes').append(button);
}
function configText() {
  const config = { ...display.config, ...(comparing ? {effects:comparisonEffects} : {}) };
  return `import { mountPhosphor } from './src/index.js';\nimport { mountAmbient } from './src/ambient.js';\n\nconst root = document.querySelector('#my-interface');\nconst display = mountPhosphor(root, ${JSON.stringify(config,null,2)});\n\n// Optional; CSS supplies the static treatment.\nconst ambient = mountAmbient(root);\n\n// When the container is removed:\n// display.destroy(); // also cleans up ambient`;
}
function syncControls() {
  const config = display.config;
  paletteSelect.value = config.palette;
  $('#effects').value = comparing ? comparisonEffects : config.effects;
  $('#crisp').checked = config.crispText;
  for (const type of ['preset','density','palette']) document.querySelectorAll(`[data-${type}]`).forEach(el=>el.setAttribute('aria-pressed',String(el.dataset[type]===config[type])));
  $('#preset-hint').textContent = config.preset === 'website' ? 'Larger type and stronger text glow.' : 'Smaller type and less text glow.';
  $('#palette-family').textContent = palettes.find(p=>p.id===config.palette).category.toUpperCase();
  $('#display-preset').textContent = config.preset;
  $('#config-code').textContent = configText();
  const tokens = resolvePalette(config.palette);
  $('#token-list').replaceChildren(...['bg','text','accent','success','warning','danger'].map(role=>{
    const el = document.createElement('div'); el.className='token-item';
    const swatch=document.createElement('i');swatch.style.setProperty('--token',tokens[`--ph-${role}`]);swatch.setAttribute('aria-hidden','true');
    const label=document.createElement('span');label.textContent=role;
    const value=document.createElement('code');value.textContent=tokens[`--ph-${role}`];
    el.append(swatch,label,value);return el;
  }));
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  $('#renderer-state').textContent = config.effects === 'off' ? 'DECORATIVE EFFECTS OFF' : reduced ? 'REDUCED MOTION / STATIC CRT' : config.effects==='static' ? 'STATIC GLASS + PHOSPHOR' : ambient.stats.context === 'webgl' ? 'AMBIENT / RESTS AT IDLE' : 'CSS FALLBACK / STATIC CRT';
}
function update(patch) { if(comparing)endCompare(); display.update(patch); syncControls(); }
$('#presets').addEventListener('click',e=>{if(e.target.dataset.preset)update({preset:e.target.dataset.preset});});
$('#densities').addEventListener('click',e=>{if(e.target.dataset.density)update({density:e.target.dataset.density});});
paletteSelect.addEventListener('change',()=>update({palette:paletteSelect.value}));
$('#effects').addEventListener('change',()=>update({effects:$('#effects').value}));
$('#crisp').addEventListener('change',()=>update({crispText:$('#crisp').checked}));
$('#reset').addEventListener('click',()=>{update(defaults);$('#announcement').textContent='Display settings reset.';});
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',syncControls);
function showSample(title, body) { $('#sample-dialog-title').textContent=title; $('#sample-dialog-body').textContent=body; $('#sample-dialog').showModal(); }
function bindTabs(list, activate) {
  list.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    const tabs=[...list.querySelectorAll('[role=tab]')], index=tabs.indexOf(document.activeElement);
    if(index<0)return;event.preventDefault();
    const next=event.key==='Home'?0:event.key==='End'?tabs.length-1:(index+(event.key==='ArrowRight'?1:-1)+tabs.length)%tabs.length;
    tabs[next].focus();activate(tabs[next]);
  });
}
function renderSpecimen(name) {
  currentSpecimen=name; $('#specimen-content').innerHTML=({dashboard,website,workbench})[name]();
  document.querySelectorAll('[data-specimen]').forEach(tab=>{tab.setAttribute('aria-selected',String(tab.dataset.specimen===name));tab.tabIndex=tab.dataset.specimen===name?0:-1;});
  root.setAttribute('aria-labelledby',`tab-${name}`);$('#specimen-path').textContent=`specimens / ${name}`;
  if(name==='dashboard') {
    $('#queue-search').addEventListener('input',e=>{
      let count=0;$('#queue-rows').querySelectorAll('tr').forEach(row=>{row.hidden=!row.textContent.toLowerCase().includes(e.target.value.toLowerCase());if(!row.hidden)count++;});
      $('#queue-empty').hidden=!!count;$('#row-count').textContent=`/ ${String(count).padStart(2,'0')} RECORDS`;
    });
    $('#sample-refresh').addEventListener('click',()=>{$('#sample-status').textContent='Sample refreshed. The same five synthetic records are shown.';});
    document.querySelectorAll('[data-inspect]').forEach(button=>button.addEventListener('click',()=>showSample(button.dataset.inspect,`${button.dataset.inspect} is a sample project in the build queue. This record is included to test tables, status labels, and native dialogs.`)));
  }
  if(name==='website') {
    const descriptions={ 'Field recorder':'Record from an audio input, trim a clip, and add a description. Original WAV files are preserved when editing.', 'Notebook':'Create Markdown files, organize them in folders, and search their contents. Notes are stored locally and can be opened in another editor.', 'Plotter':'Import a CSV file, select the columns to plot, and compare measurements. Export the chart as an SVG or view the values in a table.' };
    document.querySelectorAll('[data-project]').forEach((button,i)=>button.addEventListener('click',()=>{$('#project-name').textContent=button.dataset.project;$('#project-description').textContent=descriptions[button.dataset.project];$('#project-index').textContent=String(i+1).padStart(2,'0');}));
    $('#project-notes').addEventListener('click',()=>showSample(`${$('#project-name').textContent} / Development notes`,'The next build needs import validation, a list of recently opened files, and keyboard shortcuts for opening and saving. This is a fictional project used to demonstrate the website layout.'));
  }
  if(name==='workbench') {
    function showFile(file) {
      $('#document-view').innerHTML=documentViews[file];$('#document-view').setAttribute('aria-labelledby',`doc-tab-${file}`);
      document.querySelectorAll('[data-file]').forEach(button=>{const active=button.dataset.file===file; if(button.role==='tab'){button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;}else button.setAttribute('aria-pressed',String(active));});
    }
    document.querySelectorAll('[data-file]').forEach(button=>button.addEventListener('click',()=>showFile(button.dataset.file)));
    bindTabs($('.ph-tabs'),tab=>showFile(tab.dataset.file));showFile('notes');
    $('#note-title').value=savedDraft.title;$('#note-body').value=savedDraft.body;
    $('#note-form').addEventListener('submit',event=>{event.preventDefault();savedDraft.title=$('#note-title').value;savedDraft.body=$('#note-body').value;$('#note-status').textContent='Draft saved in this session. It will clear on reload.';});
    $('#sample-review').addEventListener('click',()=>showSample('Review the working draft',`Draft title: ${savedDraft.title}. This is a local review only. Publishing is unavailable in this demonstration.`));
  }
  ambient.update();
}
document.querySelectorAll('[data-specimen]').forEach(tab=>tab.addEventListener('click',()=>renderSpecimen(tab.dataset.specimen)));
bindTabs($('.specimen-tabs'),tab=>renderSpecimen(tab.dataset.specimen));
$('#open-config').addEventListener('click',()=>{$('#config-code').textContent=configText();$('#config-dialog').showModal();});
$('#open-guide').addEventListener('click',()=>$('#guide-dialog').showModal());
$('#copy-config').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(configText());$('#copy-status').textContent='Configuration copied.';}catch{const selection=window.getSelection(),range=document.createRange();range.selectNodeContents($('#config-code'));selection.removeAllRanges();selection.addRange(range);$('#copy-status').textContent='Clipboard unavailable. The configuration is selected; press Ctrl+C or Command+C.';}});
function beginCompare(){if(comparing)return;comparisonEffects=display.config.effects;comparing=true;display.update({effects:'off'});$('#compare').setAttribute('aria-pressed','true');$('#compare').firstChild.textContent='Original interface ';}
function endCompare(){if(!comparing)return;comparing=false;display.update({effects:comparisonEffects});$('#compare').setAttribute('aria-pressed','false');$('#compare').firstChild.textContent='Hold to compare ';}
$('#compare').addEventListener('pointerdown',e=>{if(e.button!==0)return;$('#compare').setPointerCapture(e.pointerId);beginCompare();});
for(const event of ['pointerup','pointercancel','lostpointercapture','blur'])$('#compare').addEventListener(event,endCompare);
$('#compare').addEventListener('keydown',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();beginCompare();}});
$('#compare').addEventListener('keyup',e=>{if(e.code==='Space'||e.code==='Enter'){e.preventDefault();endCompare();}});
window.addEventListener('blur',endCompare);
renderSpecimen(currentSpecimen);syncControls();
// Exposed only by the demo for lifecycle/performance inspection in browser tests.
export { display, ambient };
