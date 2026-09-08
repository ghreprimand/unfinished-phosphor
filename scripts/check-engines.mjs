/* SPDX-License-Identifier: GPL-3.0-only; Copyright (C) 2026 Unfinished Works */
import assert from 'node:assert/strict';
import { firefox, webkit } from '@playwright/test';

// Run a dev or preview server first. These checks complement the Chromium suite.
const base = process.env.PHOSPHOR_TEST_URL || 'http://127.0.0.1:5180/';
const engines = {firefox, webkit};
const requested = process.argv.slice(2);
for (const name of requested.length ? requested : Object.keys(engines)) {
  assert.ok(Object.hasOwn(engines, name), `Unknown engine: ${name}`);
  const engine = engines[name];
  const browser = await engine.launch();
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    assert.equal(await page.locator('#tab-optics').getAttribute('aria-selected'), 'true');
    const heading = page.locator('.type-primary h2');
    const shadow = () => heading.evaluate(el => getComputedStyle(el).textShadow);
    assert.notEqual(await shadow(), 'none');
    assert.match(await heading.evaluate(el => getComputedStyle(el).fontFamily), /Victor Mono/);
    assert.notEqual(await page.locator('#specimen').evaluate(el => getComputedStyle(el, '::after').backgroundImage), 'none');
    await page.locator('#glow').fill('0');
    assert.equal(await shadow(), 'none');
    await page.locator('#glow').fill('50');
    assert.notEqual(await shadow(), 'none');
    assert.equal(await page.locator('.code-study pre code').evaluate(el => getComputedStyle(el).textShadow), 'none');
    await page.selectOption('#palette', 'website:amber');
    assert.equal(await page.locator('#specimen').getAttribute('data-ph-palette'), 'website:amber');
    await page.locator('#tab-optics').focus();
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#tab-website').getAttribute('aria-selected'), 'true');
    await page.locator('#tab-optics').click();
    await page.emulateMedia({ reducedMotion: 'reduce' });
    assert.notEqual(await shadow(), 'none');
    for (const width of [390, 1024, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${engine.name()}: overflow at ${width}px`);
    }
    await page.goto(new URL('examples/components.html', base).href);
    await page.getByRole('button', { name: 'Open dialog', exact: true }).click();
    assert.ok(await page.locator('#reference-dialog').isVisible());
    await page.keyboard.press('Escape');
    assert.ok(!await page.locator('#reference-dialog').isVisible());
    await page.getByRole('button', { name: 'Try form' }).click();
    assert.match(await page.locator('#form-status').textContent(), /Nothing was uploaded/);
    assert.deepEqual(errors, []);
    console.log(`${engine.name()}: type, overlays, fonts, optical controls, palette, keyboard tabs, reduced motion, layout, dialog, and form passed.`);
  } finally {
    await browser.close();
  }
}
