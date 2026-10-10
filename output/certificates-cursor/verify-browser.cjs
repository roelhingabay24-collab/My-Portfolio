/* global process, __dirname, console, sessionStorage, localStorage, document, window, getComputedStyle, DOMMatrix */
const { chromium } = require('./tools/node_modules/playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
const path = require('node:path');
const baseline = process.argv.includes('--baseline');
const output = __dirname;
let checks = 0;
const check = (value, message) => { assert.ok(value, message); checks++; };

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe', headless: true });
  const errors = [];
  const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
  await context.addInitScript(() => {
    if (window.location.origin !== 'http://127.0.0.1:5173') return;
    sessionStorage.setItem('rh-intro-seen', '1');
    localStorage.setItem('rh-theme', 'light');
  });
  await context.addInitScript(() => {
    if (window.location.origin !== 'http://127.0.0.1:5173') return;
    const start = document.startViewTransition.bind(document);
    document.startViewTransition = callback => {
      const transition = start(callback);
      window.themeTransitionFinished = transition.finished;
      return transition;
    };
  });
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  const shot = async name => {
    await page.waitForFunction(() => !document.querySelector('.lightbox') || getComputedStyle(document.querySelector('.lightbox')).opacity === '1');
    await page.screenshot({ path: path.join(output, `${baseline ? 'before' : 'after'}-${name}.png`), animations: 'disabled' });
  };
  await page.goto('http://127.0.0.1:5173/');
  await page.locator('html.has-cursor').waitFor();
  await page.mouse.move(110, 450);
  await page.locator('.cursor.is-visible').waitFor();
  await page.waitForFunction(() => Math.abs(new DOMMatrix(getComputedStyle(document.querySelector('.cursor-ring')).transform).m41 - 110) < 1);
  await shot('light-cursor');
  const cursorStyle = await page.locator('.cursor-dot').evaluate(el => ({ color: getComputedStyle(el).backgroundColor, blend: getComputedStyle(el).mixBlendMode }));
  console.log('Light cursor:', cursorStyle);
  if (baseline) {
    await page.locator('#certifications').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => getComputedStyle(document.querySelector('.cert-card')).opacity === '1');
    await shot('desktop-certificates');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator('#certifications').scrollIntoViewIfNeeded();
    await shot('mobile-certificates');
    await browser.close();
    check(cursorStyle.color !== 'rgb(255, 255, 255)' || cursorStyle.blend !== 'difference', 'Light cursor uses isolated white artwork that disappears against the light background');
    return;
  }
  check(cursorStyle.color === 'rgb(9, 9, 11)' && cursorStyle.blend === 'normal', 'Light cursor has a dark contrasting dot');
  await page.getByRole('button', { name: 'Switch to dark theme' }).click();
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark' && !document.documentElement.classList.contains('is-transitioning'));
  await page.evaluate(() => window.themeTransitionFinished);
  await page.mouse.move(110, 450);
  await page.waitForFunction(() => document.querySelector('.cursor').classList.contains('is-default'));
  await page.waitForFunction(() => Math.abs(new DOMMatrix(getComputedStyle(document.querySelector('.cursor-ring')).transform).m41 - 110) < 1);
  await shot('dark-cursor');
  check(await page.locator('.cursor-dot').evaluate(el => getComputedStyle(el).backgroundColor === 'rgb(250, 250, 250)'), 'Dark cursor stays light');
  await page.getByRole('button', { name: 'Switch to light theme' }).click();
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'light');
  await page.evaluate(() => window.themeTransitionFinished);
  await page.locator('#certifications').scrollIntoViewIfNeeded();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.cert-card')).opacity === '1');
  check(await page.locator('.cert-card').count() === 12, 'All 12 certificates are present');
  for (const [title, number, id] of [
    ['Generative AI for Digital Marketing', 10, 'LTH5AHFW18YI'],
    ['Mastering Claude AI: Prompting, APIs, RAG, and MCP', 11, '9NQ35KU9ADD2'],
  ]) {
    const card = page.locator('.cert-card').filter({ has: page.getByRole('heading', { name: title, exact: true }) });
    await card.scrollIntoViewIfNeeded();
    check(await card.locator('img').evaluate(el => el.complete && el.naturalWidth > 0), `${title} preview loads`);
    check((await card.getByRole('link').getAttribute('href')).endsWith(id), `${title} verification link`);
    const response = await page.request.get(`http://127.0.0.1:5173/certificates/certificate-${number}.pdf`);
    check(response.ok() && (await response.body()).subarray(0, 4).toString() === '%PDF', `${title} original PDF loads`);
    await card.getByRole('button', { name: `View certificate: ${title}`, exact: true }).click();
    await page.getByRole('dialog').waitFor();
    check((await page.locator('.lightbox iframe').getAttribute('src')).endsWith(`certificate-${number}.pdf`), `${title} opens correct PDF`);
    await shot(`desktop-certificate-${number}-viewer`);
    await page.getByRole('button', { name: 'Next item', exact: true }).click();
    check(!(await page.locator('.lightbox iframe').getAttribute('src')).endsWith(`certificate-${number}.pdf`), 'Viewer next navigation changes certificate');
    await page.getByRole('button', { name: 'Previous item', exact: true }).click();
    check((await page.locator('.lightbox iframe').getAttribute('src')).endsWith(`certificate-${number}.pdf`), 'Viewer previous returns to certificate');
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'detached' });
  }
  await page.locator('.cert-card').first().locator('.cert-open').hover();
  await page.locator('.cursor.is-label').waitFor();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.cursor-ring')).width === '84px');
  check(await page.locator('.cursor-label').textContent() === 'View', 'Cursor certificate hover label preserved');
  await shot('desktop-certificates');
  await page.locator('.cert-card').first().getByRole('button', { name: /View certificate:/ }).hover();
  await page.locator('.cursor.is-hover').waitFor();
  await page.waitForFunction(() => getComputedStyle(document.querySelector('.cursor-ring')).borderTopColor === 'rgb(9, 9, 11)');
  check(await page.locator('.cursor-ring').evaluate(el => getComputedStyle(el).borderTopColor === 'rgb(9, 9, 11)'), 'Hover ring contrasts in light mode');
  await shot('light-hover-cursor');
  await page.locator('#skills').scrollIntoViewIfNeeded();
  for (const group of await page.locator('.skill-group').all()) {
    const toggle = group.getByRole('button');
    if (await toggle.count()) {
      await toggle.click();
      check(await toggle.getAttribute('aria-expanded') === 'true', 'Skill expansion preserved');
    }
  }
  for (const skill of ['Generative AI', 'Prompt engineering', 'Claude API', 'Retrieval-Augmented Generation (RAG)', 'Model Context Protocol (MCP)', 'Generative Engine Optimization (GEO)']) {
    check(await page.locator('.skill-tag').getByText(skill, { exact: true }).count() === 1, `Skill present without duplication: ${skill}`);
  }
  await shot('desktop-skills');
  await page.locator('.skill-group').filter({ has: page.getByRole('heading', { name: 'Digital marketing', exact: true }) }).scrollIntoViewIfNeeded();
  await shot('desktop-marketing-skills');
  for (const group of await page.locator('.skill-group').all()) {
    const toggle = group.getByRole('button');
    if (await toggle.count()) {
      await toggle.click();
      check(await toggle.getAttribute('aria-expanded') === 'false', 'Skill collapse preserved');
    }
  }
  await page.locator('#contact input').first().hover();
  await page.locator('.cursor.is-text').waitFor();
  check(await page.locator('#contact input').first().evaluate(el => getComputedStyle(el).cursor === 'text'), 'Native text cursor preserved');
  await page.setViewportSize({ width: 390, height: 844 });
  await page.locator('.cert-card').first().scrollIntoViewIfNeeded();
  await shot('mobile-certificates');
  check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Mobile has no horizontal overflow');
  await page.getByRole('button', { name: 'View certificate: Generative AI for Digital Marketing', exact: true }).click();
  await page.getByRole('dialog').waitFor();
  await shot('mobile-certificate-viewer');
  await page.getByRole('button', { name: 'Close viewer', exact: true }).click();
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  await page.locator('#skills').scrollIntoViewIfNeeded();
  await shot('mobile-skills');
  const ai = page.locator('.skill-group').filter({ has: page.getByRole('heading', { name: 'AI & security', exact: true }) });
  await ai.getByRole('button').click();
  await ai.scrollIntoViewIfNeeded();
  await ai.locator('.skill-tag').last().waitFor();
  await page.waitForFunction(() => {
    const group = [...document.querySelectorAll('.skill-group')].find(el => el.querySelector('h3').textContent === 'AI & security');
    return [...group.querySelectorAll('.skill-tag')].every(el => getComputedStyle(el).opacity === '1');
  });
  await shot('mobile-ai-skills');
  check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Mobile skills have no horizontal overflow');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.reload();
  await page.locator('#certifications').waitFor();
  await page.locator('.cursor').waitFor({ state: 'detached' });
  check(await page.locator('html').evaluate(el => !el.classList.contains('has-cursor')), 'Reduced motion retains native cursor');
  check(errors.length === 0, `No browser errors: ${errors.join('; ')}`);
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({ checks, errors }, null, 2));
  console.log(`RESULT ${checks} browser checks passed`);
  await browser.close();
})().catch(error => { console.error(error); process.exit(1); });
