/* global process, __dirname, console, window, document, sessionStorage, localStorage, getComputedStyle */
const { chromium } = require('../certificates-cursor/tools/node_modules/playwright');
const assert = require('node:assert/strict');
let checks = 0;
const check = (value, message) => { assert.ok(value, message); checks++; };
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errors = [];
  try {
    for (const mobile of [false, true]) {
      const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1366, height: 900 }, isMobile: mobile, hasTouch: mobile });
      await context.addInitScript(() => { if (window.location.origin !== 'http://127.0.0.1:5174') return; sessionStorage.setItem('rh-intro-seen', '1'); localStorage.setItem('rh-theme', 'light'); });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await page.goto('http://127.0.0.1:5174');
      const skills = page.locator('#skills');
      await skills.scrollIntoViewIfNeeded();
      check(await skills.locator('.skill-group').count() === 7, 'Original seven skill groups restored');
      check(await skills.locator('.skills-explorer').count() === 0, 'Orbital redesign removed');
      for (const group of await skills.locator('.skill-group').all()) {
        const toggle = group.locator('.skill-toggle');
        if (await toggle.count()) {
          await toggle.click();
          check(await toggle.getAttribute('aria-expanded') === 'true', 'Original skill expansion works');
          await toggle.click();
          check(await toggle.getAttribute('aria-expanded') === 'false', 'Original skill collapse works');
        }
      }
      const screenshot = async (section, name) => {
        await section.evaluate(el => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top + parseFloat(getComputedStyle(el).paddingTop) - 96, behavior: 'instant' }));
        await page.waitForFunction(id => getComputedStyle(document.querySelector(`#${id} > div`)).opacity === '1', await section.getAttribute('id'));
        await page.screenshot({ path: `${__dirname}/${mobile ? 'mobile' : 'desktop'}-${name}.png`, animations: 'disabled' });
      };
      await screenshot(skills, 'skills-restored');
      const quotes = page.locator('#recommendations');
      await quotes.scrollIntoViewIfNeeded();
      check(await quotes.getByRole('heading', { name: 'What colleagues say.', exact: true }).count() === 1, 'Original testimonial heading restored');
      check(await quotes.locator('.quote-group').first().locator('.quote-card').count() === 4, 'Original four testimonial cards restored');
      check(await quotes.locator('.testimonial-columns').count() === 0, 'Vertical testimonial redesign removed');
      await quotes.locator('.quote-marquee').hover();
      check(await quotes.locator('.quote-group').first().evaluate(el => getComputedStyle(el).animationPlayState === 'paused'), 'Original hover pause works');
      await screenshot(quotes, 'testimonials-restored');
      check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Restored layout has no page overflow');
      check(await page.locator('.cert-card').filter({ has: page.getByRole('heading', { name: 'Generative AI for Digital Marketing', exact: true }) }).count() === 1, 'Certificate 10 retained');
      check(await page.locator('.cert-card').filter({ has: page.getByRole('heading', { name: 'Mastering Claude AI: Prompting, APIs, RAG, and MCP', exact: true }) }).count() === 1, 'Certificate 11 retained');
      if (!mobile) {
        await page.mouse.move(100, 200);
        check(await page.locator('.cursor-dot').evaluate(el => getComputedStyle(el).backgroundColor === 'rgb(9, 9, 11)'), 'Light mode cursor fix retained');
      }
      await context.close();
    }
    check(errors.length === 0, `No browser errors: ${errors.join('; ')}`);
    console.log(`RESULT ${checks} browser checks passed`);
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
