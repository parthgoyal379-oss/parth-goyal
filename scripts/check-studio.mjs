import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || process.env.APPDATA + '/npm/node_modules/@playwright/cli/node_modules/playwright')); }
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', error => console.error(error.message));
  page.on('requestfailed', request => console.error(request.url(), request.failure()));
  await page.goto(process.env.BASE_URL || 'http://127.0.0.1:8765');
  await page.evaluate(() => document.fonts.ready);
  for (const [key, title, node] of [
    ['synapse', 'A setback is a data point.', 'Reflection'],
    ['verdikt', 'Less noise. More signal.', 'RSS feeds'],
    ['classpredictor', 'Make the invisible visible.', 'Foundations']
  ]) {
    await page.locator(`[data-system="${key}"]`).click();
    assert.equal(await page.locator('#lab-title').textContent(), title);
    assert.equal(await page.locator('[data-node="0"]').textContent(), node);
    assert.equal(await page.locator('#lab-link').getAttribute('href'), `/projects/${key}/`);
    assert.equal(await page.locator('[data-system][aria-pressed="true"]').count(), 1);
  }
  await page.keyboard.press('Control+k');
  assert.equal(await page.locator('.command-dialog').evaluate(el => el.open), true);
  assert.equal(await page.locator('.command-dialog').evaluate(el => el.contains(document.activeElement)), true);
  await page.keyboard.press('Escape');
  assert.equal(await page.locator('.command-dialog').evaluate(el => el.open), false);
  await page.locator('[data-open-command]').click();
  await page.locator('.command-links a[href="#work"]').click();
  assert.equal(await page.locator('.command-dialog').evaluate(el => el.open), false);
  assert.equal(new URL(page.url()).hash, '#work');
  await page.goto(process.env.BASE_URL || 'http://127.0.0.1:8765');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  assert.equal(await page.locator('.diagram-paths').evaluate(el => getComputedStyle(el).animationName), 'none');
  await page.screenshot({ path: 'audit/studio-desktop.png', fullPage: false });
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Overflow at ${width}`);
    if (width === 390) await page.screenshot({ path: 'audit/studio-mobile.png', fullPage: true });
  }
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
  await mobile.goto(process.env.BASE_URL || 'http://127.0.0.1:8765');
  await mobile.locator('[data-open-command]').tap();
  assert.equal(await mobile.locator('.command-dialog').evaluate(el => el.open), true);
  await mobile.locator('.command-links a[href="#method"]').tap();
  assert.equal(new URL(mobile.url()).hash, '#method');
  assert.equal(await mobile.locator('.command-dialog').evaluate(el => el.open), false);
  await mobile.locator('[data-system="verdikt"]').tap();
  assert.equal(await mobile.locator('#lab-title').textContent(), 'Less noise. More signal.');
  const smallTargets = await mobile.locator('.nav-command, #nav .n-link, .lab-tabs button, .h-actions a, .pj-actions a').evaluateAll(elements => elements.filter(el => el.getClientRects().length && el.getBoundingClientRect().height < 44).map(el => el.textContent));
  assert.deepEqual(smallTargets, [], 'Mobile primary controls need 44px touch targets');
  assert.equal(await mobile.locator('.diagram-paths').evaluate(el => getComputedStyle(el).animationName), 'none');
  await mobile.locator('[data-system="classpredictor"]').tap();
  await mobile.emulateMedia({ reducedMotion: 'reduce' });
  await mobile.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
  await mobile.screenshot({ path: 'audit/mobile-touch-390.png' });
  await mobile.setViewportSize({ width: 320, height: 568 });
  await mobile.locator('[data-open-command]').tap();
  assert.equal(await mobile.locator('.command-dialog').evaluate(el => el.getBoundingClientRect().bottom <= innerHeight), true);
  await mobile.locator('.command-links a[href="#contact"]').tap();
  assert.equal(new URL(mobile.url()).hash, '#contact');
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await mobile.close();
  console.log('PASS: explorer states, keyboard and mobile touch navigation, 44px controls, small-screen dialog, reduced motion, and six viewport widths.');
} finally { await browser.close(); }
