// Browser validation against locally served build, plus a saved pre-change page.
import { createRequire } from 'node:module';
import { writeFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.APPDATA + '/npm/node_modules/@playwright/cli/node_modules/playwright');
const browser = await chromium.launch({ channel: 'chrome', headless: true });
const results = [];
for (const js of [true, false]) {
  const context = await browser.newContext({ javaScriptEnabled: js, viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  for (const path of ['/', '/projects/classpredictor/', '/projects/synapse/', '/projects/verdikt/']) {
    const response = await page.goto('http://localhost:8765' + path);
    await page.waitForTimeout(400);
    const data = await page.evaluate(() => {
      const h1 = document.querySelector('h1');
      const schemas = [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(s => JSON.parse(s.textContent)['@graph']);
      const ids = new Set([...document.querySelectorAll('[id]')].map(e => e.id));
      return {
        title: document.title,
        canonical: document.querySelector('link[rel="canonical"]').href,
        h1Count: document.querySelectorAll('h1').length,
        mainCount: document.querySelectorAll('main').length,
        h1Visible: getComputedStyle(h1).opacity === '1' && h1.getBoundingClientRect().height > 0,
        overflow: document.documentElement.scrollWidth > innerWidth,
        brokenFragments: [...document.querySelectorAll('a[href^="#"]')].map(a => a.getAttribute('href').slice(1)).filter(id => id && !ids.has(id)),
        schemaTypes: schemas.map(s => s['@type'])
      };
    });
    results.push({ path, js, status: response.status(), ...data, errors: [...errors] });
    if (js) await page.screenshot({ path: 'audit/' + (path === '/' ? 'home' : path.split('/')[2]) + '-mobile.png', fullPage: true });
    if (response.status() !== 200 || data.h1Count !== 1 || data.mainCount !== 1 || !data.h1Visible || data.overflow || data.brokenFragments.length || errors.length) throw new Error(JSON.stringify(results.at(-1)));
  }
  if (js) {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:8765/');
    await page.locator('a[href="#work"]').first().click();
    await page.waitForTimeout(1200);
    await page.screenshot({ path: 'audit/home-desktop.png', fullPage: true });
    const visible = await page.locator('#work .pj-name').first().evaluate(e => getComputedStyle(e.closest('.pj-card')).opacity);
    if (visible !== '1') throw new Error('Project reveal did not complete');
  }
  await context.close();
}
await browser.close();
writeFileSync('audit/browser-checks.json', JSON.stringify(results, null, 2));
console.log('PASS: 8 mobile page checks, JS on/off; desktop navigation/reveal; JSON-LD parses.');
