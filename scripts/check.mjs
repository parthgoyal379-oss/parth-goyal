// Run after building and serving dist on port 8765. BASE_URL can target staging.
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || process.env.APPDATA + '/npm/node_modules/@playwright/cli/node_modules/playwright')); }
const base = process.env.BASE_URL || 'http://localhost:8765';
const routes = ['/', '/projects/classpredictor/', '/projects/synapse/', '/projects/verdikt/'];
const browser = await chromium.launch({ channel: 'chrome', headless: true });
mkdirSync('audit', { recursive: true });
const results = [];
try {
  for (const width of [320, 390, 768, 1440]) {
    for (const mode of ['standard', 'no-js', 'reduced-motion']) {
      const context = await browser.newContext({ javaScriptEnabled: mode !== 'no-js', reducedMotion: mode === 'reduced-motion' ? 'reduce' : 'no-preference', viewport: { width, height: 900 } });
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', e => errors.push(e.message));
      for (const path of routes) {
        const response = await page.goto(base + path);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForTimeout(100);
        const data = await page.evaluate(() => {
          const ids = new Set([...document.querySelectorAll('[id]')].map(e => e.id));
          const visible = el => {
            for (let node = el; node; node = node.parentElement) if (getComputedStyle(node).opacity === '0' || getComputedStyle(node).visibility === 'hidden') return false;
            return el.getBoundingClientRect().height > 0;
          };
          return {
            title: document.title,
            canonical: document.querySelector('link[rel="canonical"]').href,
            h1Count: document.querySelectorAll('h1').length,
            mainCount: document.querySelectorAll('main').length,
            h1Visible: visible(document.querySelector('h1')),
            overflow: document.documentElement.scrollWidth > innerWidth,
            brokenFragments: [...document.querySelectorAll('a[href^="#"]')].map(a => a.hash.slice(1)).filter(id => id && !ids.has(id)),
            schemaTypes: [...document.querySelectorAll('script[type="application/ld+json"]')].flatMap(s => JSON.parse(s.textContent)['@graph'].map(n => n['@type'])),
            hiddenHeadings: [...document.querySelectorAll('h1,h2,h3')].filter(el => !visible(el)).map(el => el.textContent.trim()),
            cityPresent: /saharanpur/i.test(document.documentElement.outerHTML),
            agePresent: document.body.textContent.includes('Age 17') && document.body.textContent.includes('(seventeen, if that matters)')
          };
        });
        const result = { path, width, mode, status: response.status(), ...data, errors: [...errors] };
        results.push(result);
        if (response.status() !== 200 || data.h1Count !== 1 || data.mainCount !== 1 || !data.h1Visible || data.overflow || data.brokenFragments.length || errors.length || data.cityPresent || (path === '/' && !data.agePresent) || (mode !== 'standard' && data.hiddenHeadings.length)) throw new Error(JSON.stringify(result));
        if (mode === 'standard' && [390,1440].includes(width)) {
          if (path === '/') {
            await page.screenshot({ path: `audit/home-${width}-viewport.png` });
            for (const section of ['about', 'work', 'method', 'contact']) {
              await page.locator('#' + section).scrollIntoViewIfNeeded();
              await page.waitForTimeout(800);
            }
          }
          await page.screenshot({ path: `audit/${path === '/' ? 'home' : path.split('/')[2]}-${width}.png`, fullPage: true });
        }
      }
      await context.close();
    }
  }
  const context = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'], viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  await page.goto(base);
  await page.locator('#nav a[href="#work"]').click();
  await page.waitForTimeout(1200);
  if (await page.locator('#nav a[aria-current="location"]').getAttribute('href') !== '#work') throw new Error('Active navigation is incorrect');
  if (await page.locator('#project-classpredictor').evaluate(el => getComputedStyle(el).opacity) !== '1') throw new Error('Project reveal failed');
  await page.locator('[data-copy-email]').click();
  if (await page.evaluate(() => navigator.clipboard.readText()) !== 'Parthgoyal379@gmail.com') throw new Error('Copy email failed');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.waitForFunction(() => document.getAnimations().filter(a => a.playState === 'running').length === 0, { timeout: 5000 });
  await context.close();
  writeFileSync('audit/browser-checks.json', JSON.stringify(results, null, 2));
  console.log(`PASS: ${results.length} page/viewport/mode checks; clipboard, active nav, reveals and live reduced motion.`);
} finally { await browser.close(); }
