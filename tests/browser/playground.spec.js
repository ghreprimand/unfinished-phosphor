/* SPDX-License-Identifier: GPL-3.0-only
 * Copyright (C) 2026 Unfinished Works
 */
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';
const moduleStats = page => page.evaluate(async()=>(await import('/playground/main.js')).ambient.stats);
test('getting-started HTML and named-palette recipe run directly from the documentation', async ({ page }) => {
  const guide = readFileSync(new URL('../../docs/getting-started.md', import.meta.url), 'utf8');
  const examples = [...guide.matchAll(/```html\n([\s\S]*?)```/g)].map(match => match[1]);
  expect(examples).toHaveLength(2);
  const html = examples[0].replace('<main data-phosphor', '<main id="my-interface" data-phosphor').replace('</body>', examples[1] + '</body>').replaceAll('./vendor/phosphor/', '/');
  await page.route('**/documentation-example', route => route.fulfill({ contentType: 'text/html', body: html }));
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/documentation-example');
  await page.evaluate(() => document.fonts.ready);
  const root = page.locator('#my-interface');
  await expect(root).toHaveAttribute('data-ph-palette', 'website:amber');
  await expect(root).toHaveAttribute('data-ph-glow', '50');
  await expect(root).toHaveAttribute('data-ph-density', 'comfortable');
  expect(await root.evaluate(el => getComputedStyle(el).fontFamily)).toContain('Victor Mono');
  expect(await page.locator('.ph-panel-heading').evaluate(el => getComputedStyle(el).textShadow)).not.toBe('none');
  await page.getByRole('link', { name: 'View details' }).click();
  await expect(page.locator('#details')).toBeVisible();
  expect(errors).toEqual([]);
});
test('all catalog palettes render through swatches and preserve the optics specimen', async ({ page }) => {
  await page.goto('/'); await page.evaluate(() => document.fonts.ready);
  const options = await page.locator('#palette option').evaluateAll(nodes => nodes.map(el => ({id:el.value,name:el.textContent})));
  expect(options).toHaveLength(12);
  await expect(page.locator('#quick-palettes button')).toHaveCount(options.length);
  const content = page.locator('.type-primary');
  const measure = () => content.evaluate(el => ({text:el.textContent,font:getComputedStyle(el).font,rect:el.getBoundingClientRect().toJSON()}));
  const before = await measure();
  for (const option of options) {
    await page.locator(`#quick-palettes [data-palette="${option.id}"]`).click();
    await expect(page.locator('#palette')).toHaveValue(option.id);
    await expect(page.locator('#specimen')).toHaveAttribute('data-ph-palette', option.id);
    expect(await measure()).toEqual(before);
    const result = await new AxeBuilder({ page }).include('#specimen').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(result.violations, option.name).toEqual([]);
  }
});
test('optics landing exposes independent controls without blurring or moving native type', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#tab-optics')).toHaveAttribute('aria-selected', 'true');
  const type = page.locator('.type-primary');
  const measure = () => type.evaluate(el => ({color:getComputedStyle(el).color, font:getComputedStyle(el).font, rect:el.getBoundingClientRect().toJSON(), text:el.textContent}));
  const before = await measure();
  const heading = page.locator('.type-primary h2');
  const shadow = () => heading.evaluate(el => getComputedStyle(el).textShadow);
  const full = await shadow();
  await page.locator('#glow').focus(); await page.keyboard.press('Home');
  await expect(page.locator('#glow-value')).toHaveText('0%');
  expect(await shadow()).toBe('none');
  expect(await measure()).toEqual(before);
  await page.keyboard.press('End');
  expect(await shadow()).toBe(full);
  await page.locator('#glow').evaluate(el => {el.value='50';el.dispatchEvent(new Event('input',{bubbles:true}));});
  expect(await shadow()).not.toBe(full);
  for (const selector of ['.code-study pre','.code-study code','.ph-syntax-number']) {
    expect(await page.locator(selector).first().evaluate(el => getComputedStyle(el).textShadow)).toBe('none');
  }
  const overlay = () => page.locator('#specimen').evaluate(el => getComputedStyle(el,'::after').backgroundImage);
  const originalOverlay = await overlay();
  await page.locator('#raster').focus(); await page.keyboard.press('Home');
  expect(await overlay()).not.toBe(originalOverlay);
  await expect(page.locator('#glass')).toHaveValue('100');
  await page.locator('#glass').focus(); await page.keyboard.press('Home');
  await expect(page.locator('#raster')).toHaveValue('0');
  await page.locator('#crisp').check();
  await expect(page.locator('#glow')).toBeDisabled();
  expect(await shadow()).toBe('none');
  await page.locator('#crisp').uncheck();
  await page.emulateMedia({ reducedMotion:'reduce' });
  expect(await shadow()).not.toBe('none');
  expect((await moduleStats(page)).running).toBe(false);
  await page.selectOption('#effects','off');
  for (const key of ['glow','raster','glass']) await expect(page.locator('#'+key)).toBeDisabled();
  await page.locator('#reset').click();
  for (const key of ['glow','raster','glass']) await expect(page.locator('#'+key)).toHaveValue('100');
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  expect(accessibility.violations).toEqual([]);
  for (const width of [3840,2560,1440,1024,720,390]) {
    await page.setViewportSize({width,height:1000});
    const fits = await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
    expect(fits, `Overflow at ${width}px`).toBe(true);
  }
});
test('optical API rejects invalid values atomically and restores host variables', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const { mountPhosphor } = await import('/src/index.js');
    const root=document.createElement('section');root.innerHTML='<h2 class="ph-title">Title</h2><strong class="ph-metric">42</strong><div class="ph-sharp"><span class="ph-title">Sharp region</span></div><input value="Editable">';
    root.style.setProperty('--ph-glow','.3','important'); root.setAttribute('data-ph-glow','30');document.body.append(root);
    const original=root.getAttribute('style');const display=mountPhosphor(root,{glow:0,raster:25,glass:75});
    const zero=[root.querySelector('h2'),root.querySelector('strong')].map(el=>({shadow:getComputedStyle(el).textShadow,filter:getComputedStyle(el).filter}));
    const previous=root.getAttribute('style');let rejected=0;
    for(const key of ['glow','raster','glass']) for(const value of [-1,101,NaN,Infinity,'50',null]) {
      try {display.update({[key]:value});} catch {rejected++;}
      if(root.getAttribute('style')!==previous)throw Error('Invalid update mutated the DOM');
    }
    display.update({glow:100});
    const sharp=[root.querySelector('.ph-sharp span'),root.querySelector('input')].map(el=>getComputedStyle(el).textShadow);
    display.destroy();
    return {zero,sharp,rejected,restored:root.getAttribute('style')===original,attribute:root.getAttribute('data-ph-glow')};
  });
  expect(result).toEqual({zero:[{shadow:'none',filter:'none'},{shadow:'none',filter:'none'}],sharp:['none','none'],rejected:18,restored:true,attribute:'30'});
});
test('shared setup links round-trip settings and invalid settings fall back visibly', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/');
  await page.selectOption('#palette','website:amber');
  await page.locator('#glow').evaluate(el=>{el.value='35';el.dispatchEvent(new Event('input',{bubbles:true}));});
  await page.locator('#tab-workbench').click();
  await page.locator('#share-config').click();
  const url = await page.evaluate(()=>navigator.clipboard.readText());
  await page.goto(url);
  await expect(page.locator('#glow')).toHaveValue('35');
  await expect(page.locator('#palette')).toHaveValue('website:amber');
  await expect(page.locator('#tab-workbench')).toHaveAttribute('aria-selected','true');
  await page.locator('#open-config').click();
  await expect(page.locator('#config-code')).toContainText('"glow": 35');
  await page.goto('/#config='+encodeURIComponent(JSON.stringify({view:'optics',glow:-1})));
  await expect(page.locator('#share-status')).toContainText('invalid settings');
  await expect(page.locator('#glow')).toHaveValue('100');
});
test('website loads local Victor Mono while the unstyled integration host keeps its font', async ({ page }) => {
  const failedFonts = [];
  page.on('response', response => {
    if (response.url().includes('.woff2') && !response.ok()) failedFonts.push(response.url());
  });
  await page.goto('/?view=dashboard');
  await page.evaluate(() => document.fonts.ready);
  for (const selector of [':root', '.site-header', '.intro h1', '#specimen', '.ph-input']) {
    expect(await page.locator(selector).first().evaluate(el => getComputedStyle(el).fontFamily)).toContain('Victor Mono');
  }
  expect(await page.evaluate(() => [...document.fonts].some(font => font.family === 'Victor Mono' && font.status === 'loaded'))).toBe(true);
  await page.goto('/examples/plain.html');
  expect(await page.locator('#outside-text').evaluate(el => getComputedStyle(el).fontFamily)).not.toContain('Victor Mono');
  expect(failedFonts).toEqual([]);
});
test('component reference loads all font faces and supports native controls, keyboard tabs, and narrow screens', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/examples/components.html');
  await page.evaluate(() => document.fonts.ready);
  expect(await page.evaluate(() => [...document.fonts].filter(font => font.family === 'Victor Mono' && font.status === 'loaded').length)).toBe(4);
  await page.selectOption('#palette', 'website:amber');
  await expect(page.locator('#reference')).toHaveAttribute('data-ph-palette', 'website:amber');
  await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Close dialog' })).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('#open-dialog')).toBeFocused();
  await page.getByRole('button', { name: 'Try form' }).click();
  await expect(page.locator('#form-status')).toContainText('Nothing was uploaded or saved');
  await page.locator('#tab-details').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#tab-source')).toBeFocused();
  await expect(page.locator('#panel-source')).toBeVisible();
  await expect(page.locator('#panel-details')).toBeHidden();
  await page.keyboard.press('Home');
  await expect(page.locator('#tab-details')).toBeFocused();
  const accessibility = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  expect(accessibility.violations).toEqual([]);
  for (const width of [720, 390]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Overflow at ${width}px`).toBe(true);
  }
  expect(errors).toEqual([]);
});
test('all independent controls preserve content and palette changes preserve geometry', async({page})=>{
  const errors=[];page.on('pageerror',error=>errors.push(error.message));await page.goto('/?view=dashboard');
  await expect(page.locator('#queue-rows tr')).toHaveCount(5);
  await page.evaluate(() => document.fonts.ready);
  const before=await page.locator('#specimen-content').evaluate(el=>({text:el.textContent,rect:el.getBoundingClientRect().toJSON(),font:getComputedStyle(el).font}));
  await page.selectOption('#palette','website:amber');
  const after=await page.locator('#specimen-content').evaluate(el=>({text:el.textContent,rect:el.getBoundingClientRect().toJSON(),font:getComputedStyle(el).font}));
  expect(after).toEqual(before);
  await page.locator('[data-preset="website"]').click();
  await expect(page.locator('#specimen')).toHaveAttribute('data-ph-density','compact');
  await page.locator('[data-density="comfortable"]').click();
  await expect(page.locator('#specimen')).toHaveAttribute('data-ph-palette','website:amber');
  await expect(page.locator('#queue-rows tr')).toHaveCount(5);
  await expect(page.locator('#specimen-content')).toHaveText(before.text);
  await page.locator('#tab-website').click();await page.locator('[data-density="compact"]').click();
  const compact=await page.locator('.website-demo .ph-panel-body').evaluate(el=>parseFloat(getComputedStyle(el).padding));
  await page.locator('[data-density="comfortable"]').click();
  expect(await page.locator('.website-demo .ph-panel-body').evaluate(el=>parseFloat(getComputedStyle(el).padding))).toBeGreaterThan(compact);
  expect(errors).toEqual([]);
});
test('filter, record dialog, keyboard focus, and sample refresh work',async({page})=>{
  await page.goto('/?view=dashboard');await page.getByRole('searchbox',{name:'Filter projects'}).fill('field');
  await expect(page.locator('#queue-rows tr:visible')).toHaveCount(1);
  await page.getByRole('button',{name:'Field recorder',exact:true}).click();
  await expect(page.locator('#sample-dialog')).toBeVisible();
  await expect(page.getByRole('button',{name:'Back to specimen'})).toBeFocused();
  await page.keyboard.press('Escape');await expect(page.locator('#sample-dialog')).not.toBeVisible();
  await expect(page.getByRole('button',{name:'Field recorder',exact:true})).toBeFocused();
  await page.getByRole('searchbox',{name:'Filter projects'}).fill('not-present');
  await expect(page.locator('#queue-empty')).toBeVisible();
  await page.getByRole('searchbox',{name:'Filter projects'}).fill('');
  await page.getByRole('button',{name:'Refresh sample'}).click();await expect(page.locator('#sample-status')).toContainText('Sample refreshed');
});
test('specimen and document tabs support arrow keys; drafts remain native',async({page})=>{
  await page.goto('/?view=dashboard');await page.locator('#tab-dashboard').focus();await page.keyboard.press('ArrowRight');
  await expect(page.locator('#tab-workbench')).toBeFocused();await expect(page.locator('#tab-workbench')).toHaveAttribute('aria-selected','true');
  await page.locator('#doc-tab-notes').focus();await page.keyboard.press('ArrowRight');await expect(page.locator('#document-view')).toContainText('mountPhosphor');
  await page.getByLabel('Title',{exact:true}).fill('Synthetic field note');await page.getByRole('button',{name:'Save local draft'}).click();
  await expect(page.locator('#note-status')).toContainText('Draft saved');
  await page.locator('#tab-website').click();await page.getByRole('button',{name:'> Notebook',exact:true}).click();
  await expect(page.locator('#project-name')).toHaveText('Notebook');await page.getByRole('button',{name:'Development notes'}).click();await expect(page.locator('#sample-dialog')).toBeVisible();await page.keyboard.press('Escape');
  await page.locator('#tab-workbench').click();await expect(page.getByLabel('Title',{exact:true})).toHaveValue('Synthetic field note');
  await expect(page.getByRole('button',{name:'Publish unavailable in demo'})).toBeDisabled();
});
test('configuration reflects all settings and copy succeeds',async({page,context})=>{
  await context.grantPermissions(['clipboard-read','clipboard-write']);await page.goto('/?view=dashboard');
  await page.selectOption('#palette','website:white');await page.selectOption('#effects','static');await page.locator('#crisp').check();
  await page.locator('#open-config').click();await expect(page.locator('#config-code')).toContainText('"palette": "website:white"');
  await page.locator('#copy-config').click();await expect(page.locator('#copy-status')).toHaveText('Configuration copied.');
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toContain('"crispText": true');
  await page.keyboard.press('Escape');await expect(page.locator('#open-config')).toBeFocused();
});
test('reduced motion retains static glow; crisp text and effects off remove requested layers',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?view=dashboard');
  const shadows=()=>page.locator('.ph-metric').first().evaluate(el=>getComputedStyle(el).textShadow);
  expect(await shadows()).not.toBe('none');
  expect(await page.locator('#specimen').evaluate(el=>getComputedStyle(el,'::after').display)).not.toBe('none');
  expect((await moduleStats(page)).running).toBe(false);expect((await moduleStats(page)).frames).toBe(0);
  await page.locator('#crisp').check();expect(await shadows()).toBe('none');
  await page.locator('#crisp').uncheck();expect(await shadows()).not.toBe('none');
  await page.selectOption('#effects','off');expect(await shadows()).toBe('none');
  expect(await page.locator('#specimen').evaluate(el=>getComputedStyle(el,'::after').display)).toBe('none');
});
test('renderer rests at idle, responds to pointer, caps buffers, and freezes while hidden',async({page})=>{
  await page.goto('/?view=dashboard');await page.waitForTimeout(400);
  const first=await moduleStats(page);expect(first.context).toBe('webgl');expect(Math.max(first.width,first.height)).toBeLessThanOrEqual(900);
  await page.waitForTimeout(300);expect((await moduleStats(page)).frames).toBe(first.frames);
  await page.locator('.demo-heading h2').hover();await page.waitForTimeout(250);expect((await moduleStats(page)).frames).toBeGreaterThan(first.frames);
  await page.waitForTimeout(2400);const resting=await moduleStats(page);expect(resting.running).toBe(false);
  await page.waitForTimeout(250);expect((await moduleStats(page)).frames).toBe(resting.frames);
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});
  const hidden=await moduleStats(page);await page.waitForTimeout(200);expect((await moduleStats(page)).frames).toBe(hidden.frames);expect(hidden.running).toBe(false);
  await page.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});
  expect((await moduleStats(page)).frames).toBeGreaterThan(hidden.frames);
});
test('WebGL unavailability retains CSS and interactive controls',async({page})=>{
  await page.addInitScript(()=>{const original=HTMLCanvasElement.prototype.getContext;HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl'?null:original.call(this,type,...args);};});
  await page.goto('/?view=dashboard');expect((await moduleStats(page)).context).toBe('fallback');await expect(page.locator('.ph-ambient')).toBeHidden();
  expect(await page.locator('.ph-metric').first().evaluate(el=>getComputedStyle(el).textShadow)).not.toBe('none');
  await page.locator('#queue-search').fill('field');await expect(page.locator('#queue-rows tr:visible')).toHaveCount(1);
});
test('context loss falls back and restoration rebuilds the renderer',async({page})=>{
  await page.goto('/?view=dashboard');await page.waitForTimeout(200);
  await page.evaluate(()=>{window.testGL=document.querySelector('.ph-ambient').getContext('webgl').getExtension('WEBGL_lose_context');window.testGL.loseContext();});
  await expect.poll(async()=>(await moduleStats(page)).context).toBe('lost');await expect(page.locator('.ph-ambient')).toBeHidden();
  await page.waitForTimeout(150);await page.evaluate(()=>window.testGL.restoreContext());
  await expect.poll(async()=>(await moduleStats(page)).context).toBe('webgl');await expect(page.locator('.ph-ambient')).toBeVisible();
});
test('mount is idempotent, invalid updates are atomic, destroy restores host state',async({page})=>{
  await page.goto('/examples/plain.html');
  const results=await page.evaluate(async()=>{
    const {mountPhosphor}=await import('/src/index.js');const {mountAmbient}=await import('/src/ambient.js');
    const root=document.createElement('section');root.style.setProperty('--ph-text','#123456','important');root.setAttribute('data-ph-density','host');root.style.padding='20px';root.textContent='Lifecycle sample';document.body.append(root);
    const before=root.outerHTML;let consistent=true;
    for(let i=0;i<12;i++){
      const a=mountPhosphor(root),b=mountPhosphor(root);const ambient=mountAmbient(root);
      consistent &&= a===b && ambient===mountAmbient(root) && root.querySelectorAll('canvas').length===1;
      const config=a.config;try{a.update({palette:'unknown',density:'comfortable'});}catch{}
      consistent &&= a.config===config && root.dataset.phDensity==='compact';
      a.destroy();a.destroy();consistent &&= root.querySelectorAll('canvas').length===0 && ambient.stats.context==='destroyed';
    }
    return {consistent,restored:root.outerHTML===before};
  });expect(results).toEqual({consistent:true,restored:true});
});
test('effects are scoped; removing presentation keeps host behavior and other scopes intact',async({page})=>{
  await page.goto('/examples/plain.html');
  const host=await page.locator('#outside-text').evaluate(el=>({font:getComputedStyle(el).font,color:getComputedStyle(el).color,shadow:getComputedStyle(el).textShadow}));
  expect(host.shadow).toBe('none');await page.locator('#palette').click();
  expect(await page.locator('#outside-text').evaluate(el=>({font:getComputedStyle(el).font,color:getComputedStyle(el).color,shadow:getComputedStyle(el).textShadow}))).toEqual(host);
  await page.locator('#toggle').click();await expect(page.locator('#example')).not.toHaveAttribute('data-phosphor');await expect(page.locator('#example canvas')).toHaveCount(0);await expect(page.locator('#css-only')).toHaveAttribute('data-phosphor','');
  await page.getByLabel('A note to keep').fill('Host event still works');await page.getByRole('button',{name:'Save in this view'}).click();await expect(page.locator('#status')).toContainText('Host event still works');
  await page.locator('#toggle').click();await expect(page.locator('#example canvas')).toHaveCount(1);
});
test('hold to compare restores effects after pointer and keyboard release',async({page})=>{
  await page.goto('/?view=dashboard');await page.selectOption('#effects','static');await page.locator('#compare').scrollIntoViewIfNeeded();
  await page.locator('#compare').hover();await page.mouse.down();await expect(page.locator('#specimen')).toHaveAttribute('data-ph-effects','off');
  await page.mouse.up();await expect(page.locator('#specimen')).toHaveAttribute('data-ph-effects','static');
  await page.locator('#compare').focus();await page.keyboard.down('Space');await expect(page.locator('#specimen')).toHaveAttribute('data-ph-effects','off');
  await page.keyboard.up('Space');await expect(page.locator('#specimen')).toHaveAttribute('data-ph-effects','static');
});
for(const width of [390,720])test(`all specimens retain controls without page overflow at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:950});await page.goto('/?view=dashboard');
  for(const specimen of ['dashboard','website','workbench']){
    await page.locator(`#tab-${specimen}`).click();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
    await expect(page.locator('#specimen-content')).toBeVisible();
    if(specimen==='dashboard')await expect(page.locator('#queue-rows tr')).toHaveCount(5);
    if(specimen==='workbench')await expect(page.locator('#note-body')).toBeVisible();
  }
});
test('200% zoom retains content and accessible scrolling',async({page})=>{
  await page.goto('/?view=dashboard');await page.evaluate(()=>document.documentElement.style.zoom='2');
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await expect(page.locator('#queue-rows tr')).toHaveCount(5);
  const scroll=page.getByRole('region',{name:'Project queue'});await scroll.focus();await expect(scroll).toBeFocused();
  await page.locator('#tab-workbench').click();await expect(page.locator('#note-title')).toBeVisible();
});
test('high DPI, resize and offscreen rendering keep resources bounded',async({browser})=>{
  const context=await browser.newContext({deviceScaleFactor:2,viewport:{width:1200,height:900}});const page=await context.newPage();await page.goto('http://127.0.0.1:5180');await page.waitForTimeout(200);
  expect(Math.max(...Object.entries(await moduleStats(page)).filter(([key])=>['width','height'].includes(key)).map(([,value])=>value))).toBeLessThanOrEqual(900);
  await page.setViewportSize({width:800,height:700});await page.waitForTimeout(200);const resized=await moduleStats(page);expect(Math.max(resized.width,resized.height)).toBeLessThanOrEqual(900);
  await page.evaluate(()=>document.querySelector('#specimen').style.marginTop='3000px');await page.waitForTimeout(200);
  const hidden=await moduleStats(page);await page.waitForTimeout(200);expect((await moduleStats(page)).frames).toBe(hidden.frames);expect(hidden.running).toBe(false);await context.close();
});

test('representative specimens and dialogs have no detected WCAG A/AA violations',async({page})=>{
  await page.goto('/?view=dashboard');
  for(const [specimen,palette] of [['dashboard','dashboard:odyssey-crt'],['website','website:amber'],['workbench','website:white']]){
    await page.locator(`#tab-${specimen}`).click();await page.selectOption('#palette',palette);
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))).toEqual([]);
  }
  for(const trigger of ['#sample-review','#open-config','#open-guide']){
    await page.locator(trigger).click();
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(result.violations.map(v=>v.id)).toEqual([]);
    await page.keyboard.press('Escape');
  }
});
test('native text selection and focus remain usable under effects',async({page})=>{
  await page.goto('/?view=dashboard');
  const selected=await page.locator('.demo-heading h2').evaluate(el=>{
    const range=document.createRange();range.selectNodeContents(el);getSelection().removeAllRanges();getSelection().addRange(range);return getSelection().toString();
  });expect(selected).toBe('Build overview');
  await page.locator('#queue-search').focus();
  expect(await page.locator('#queue-search').evaluate(el=>getComputedStyle(el).outlineStyle)).toBe('solid');
  await page.emulateMedia({forcedColors:'active'});
  expect(await page.locator('#specimen').evaluate(el=>getComputedStyle(el,'::after').display)).toBe('none');expect((await moduleStats(page)).running).toBe(false);
});
test('shader compilation failure falls back without a broken canvas',async({page})=>{
  await page.addInitScript(()=>{const original=WebGLRenderingContext.prototype.getShaderParameter;WebGLRenderingContext.prototype.getShaderParameter=function(shader,pname){return pname===this.COMPILE_STATUS?false:original.call(this,shader,pname);};});
  await page.goto('/?view=dashboard');expect((await moduleStats(page)).context).toBe('fallback');await expect(page.locator('.ph-ambient')).toBeHidden();
  await page.locator('#open-config').click();await expect(page.locator('#config-dialog')).toBeVisible();
});
