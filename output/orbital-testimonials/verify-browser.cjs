/* global process, __dirname, console, window, document, sessionStorage, localStorage, getComputedStyle */
const { chromium } = require('../certificates-cursor/tools/node_modules/playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const baseline = process.argv.includes('--baseline');
const base = process.env.PORTFOLIO_URL || 'http://127.0.0.1:5174';
let checks = 0;
const check = (value, message) => { assert.ok(value, message); checks++; };
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const errors = [];
  try {
    for (const mobile of [false, true]) {
      const context = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: 1366, height: 900 }, isMobile: mobile, hasTouch: mobile, reducedMotion: 'reduce' });
      await context.addInitScript(() => { if (!window.location.protocol.startsWith('http')) return; sessionStorage.setItem('rh-intro-seen', '1'); localStorage.setItem('rh-theme', 'light'); });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base, { waitUntil: 'domcontentloaded' });
      const screenshot = async (section, name) => {
        await section.scrollIntoViewIfNeeded();
        await section.evaluate(el => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top + parseFloat(getComputedStyle(el).paddingTop) - 96, behavior: 'instant' }));
        await page.screenshot({ path: `${__dirname}/${baseline ? 'before' : 'after'}-${mobile ? 'mobile' : 'desktop'}-${name}.png`, animations: 'disabled' });
      };
      const skills = page.locator('#skills');
      const quotes = page.locator('#recommendations');
      await skills.waitFor();
      await screenshot(skills, 'skills-light');
      await screenshot(quotes, 'testimonials-light');
      if (baseline) { await context.close(); continue; }
      check(await skills.getByRole('button', { pressed: true }).count() === 1, 'One skill category is selected');
      const groups = await import('../../src/data/skills.js');
      const certs = await import('../../src/data/certifications.js');
      const data = await import('../../src/data/testimonials.js');
      for (const group of groups.skillGroups) {
        await skills.getByRole('button', { name: `Explore ${group.title}`, exact: true }).click();
        const panel = skills.locator('.skill-detail');
        check(await panel.getByRole('heading', { name: group.title, exact: true }).count() === 1, `Selected detail: ${group.title}`);
        const toggle = panel.locator('.skill-toggle');
        if (await toggle.count()) { await toggle.click(); check(await toggle.getAttribute('aria-expanded') === 'true', 'Skills expand'); }
        const shown = await panel.locator('.skill-tag').allTextContents();
        check(JSON.stringify(shown) === JSON.stringify(group.skills), `Every original skill preserved: ${group.title}`);
        check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), `Expanded skills fit the viewport: ${group.title}`);
        if (group.title === 'AI & security') {
          await screenshot(panel, 'ai-expanded');
        }
        for (const link of await panel.locator('.skill-evidence a').all()) {
          const href = await link.getAttribute('href');
          check(certs.certifications.some(cert => href === cert.verifyUrl || href === cert.pdf || href === cert.image), 'Certificate link uses an existing credential');
        }
        const collapse = panel.getByRole('button', { name: 'View less skills', exact: true });
        if (await collapse.count()) { await collapse.click(); check(await panel.locator('.skill-tag').count() === 8, 'Skills collapse to eight'); }
        if (group.title === 'Full-stack development') {
          await panel.getByRole('link', { name: /Explore projects/ }).click();
          await page.waitForFunction(() => window.location.hash === '#projects');
          check(await page.locator('#projects').isVisible(), 'Development evidence links to the projects section');
        }
      }
      await skills.getByRole('button', { name: 'Explore Data & analytics', exact: true }).click();
      await screenshot(skills, 'skills-light');
      check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'No page horizontal overflow');
      const cards = quotes.locator('.testimonial-grid .testimonial-card');
      check(await cards.count() === data.testimonials.length, 'One original card per testimonial in static mode');
      for (let index = 0; index < data.testimonials.length; index++) {
        const card = cards.nth(index);
        check(await card.locator('blockquote p').textContent() === data.testimonials[index].quote, 'Original quote preserved');
        check((await card.locator('figcaption').textContent()).includes(data.testimonials[index].name), 'Original attribution preserved');
        check((await card.locator('figcaption').textContent()).includes(data.testimonials[index].role), 'Original job title preserved');
        check((await card.locator('figcaption').textContent()).includes(data.testimonials[index].company), 'Original company preserved');
      }
      await screenshot(quotes, 'testimonials-light');
      check((await cards.first().textContent()).includes(data.testimonials[0].previously), 'Earlier role remains visible');
      check((await cards.nth(1).textContent()).includes(data.testimonials[1].about), 'Project association preserved');
      await page.getByRole('button', { name: 'Switch to dark theme', exact: true }).click();
      await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
      await screenshot(skills, 'skills-dark');
      await screenshot(quotes, 'testimonials-dark');
      check(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), 'Dark mode has no horizontal overflow');
      if (!mobile) {
        const selector = skills.getByRole('button', { name: 'Explore Full-stack development', exact: true });
        await selector.focus();
        await page.keyboard.press('Enter');
        check(await selector.getAttribute('aria-pressed') === 'true', 'Skill nodes support keyboard selection');
      }
      await context.close();
    }
    if (!baseline) {
      const context = await browser.newContext({ viewport: { width: 1366, height: 900 } });
      const page = await context.newPage();
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(base);
      await page.locator('#skills').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => getComputedStyle(document.querySelector('.skills-explorer')).opacity === '1');
      check(await page.locator('.skill-orbit-ambient').evaluate(el => getComputedStyle(el).animationName !== 'none'), 'Decorative orbit animation is enabled');
      check(await page.locator('.skill-orbit-node').count() === 7, 'All seven categories appear on the orbit');
      await page.locator('#recommendations').scrollIntoViewIfNeeded();
      await page.waitForFunction(() => getComputedStyle(document.querySelector('.testimonials-content')).opacity === '1');
      check(await page.locator('.testimonial-column').count() === 2, 'Two scrolling columns suit the four original testimonials');
      check(await page.locator('.testimonial-group:not([aria-hidden]) .testimonial-card').count() === 4, 'Only the four original testimonials are exposed in the scrolling layout');
      await page.locator('.testimonial-columns').hover();
      check(await page.locator('.testimonial-group').first().evaluate(el => getComputedStyle(el).animationPlayState === 'paused'), 'Hover pauses testimonial scrolling');
      const pause = page.locator('.testimonial-pause');
      await pause.click();
      check(await pause.getAttribute('aria-pressed') === 'true', 'Pause control stays active');
      check(await page.locator('.testimonial-group').first().evaluate(el => getComputedStyle(el).animationPlayState === 'paused'), 'Manual pause stops the columns');
      await page.locator('#recommendations').evaluate(el => window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top + parseFloat(getComputedStyle(el).paddingTop) - 96, behavior: 'instant' }));
      await page.screenshot({ path: `${__dirname}/after-desktop-testimonials-columns.png`, animations: 'disabled' });
      await pause.click();
      check(await pause.getAttribute('aria-pressed') === 'false', 'Resume control restores scrolling');
      check(await page.locator('.testimonial-group').first().evaluate(el => getComputedStyle(el).animationPlayState === 'running'), 'Resume restarts the column animation');
      const read = page.getByRole('button', { name: 'Read all testimonials', exact: true });
      await read.focus();
      await page.keyboard.press('Enter');
      check(await page.locator('.testimonial-columns').isVisible() === false, 'Read all switches from scrolling to a static grid');
      check(await page.locator('.testimonial-grid').isVisible(), 'Static grid is readable with keyboard selection');
      await page.getByRole('button', { name: 'Back to scrolling', exact: true }).click();
      check(await page.locator('.testimonial-columns').isVisible(), 'Return to scrolling works');
      await page.emulateMedia({ reducedMotion: 'reduce' });
      check(await page.locator('.skill-orbit-ambient').evaluate(el => getComputedStyle(el).animationName === 'none'), 'Reduced motion stops orbit animation');
      check(await page.locator('.testimonial-columns').isVisible() === false && await page.locator('.testimonial-grid').isVisible(), 'Reduced motion shows all testimonials without scrolling');
      await context.close();
      for (const fixture of [[], [{ quote: 'Fixture quote for fallback coverage.', role: 'Fixture reviewer', company: 'Fixture company', sample: true }]]) {
        const fixtureContext = await browser.newContext({ reducedMotion: 'reduce' });
        const fixturePage = await fixtureContext.newPage();
        fixturePage.on('pageerror', error => errors.push(error.message));
        await fixturePage.route('**/src/data/testimonials.js*', route => route.fulfill({ contentType: 'application/javascript', body: `export const testimonials = ${JSON.stringify(fixture)};` }));
        await fixturePage.goto(base);
        await fixturePage.locator('#contact').waitFor();
        if (fixture.length === 0) check(await fixturePage.locator('#recommendations').count() === 0, 'Empty testimonial data hides the section');
        else {
          const card = fixturePage.locator('.testimonial-grid .testimonial-card');
          check(await card.locator('.quote-name').textContent() === fixture[0].role, 'Missing name falls back to the role');
          check(await card.locator('.quote-avatar.is-initials').count() === 1, 'Missing logo uses initials');
          check(await card.locator('.quote-tag').textContent() === 'Sample', 'Fixture sample label is preserved');
        }
        await fixtureContext.close();
      }
      check(errors.length === 0, `No page errors: ${errors.join('; ')}`);
      fs.writeFileSync(`${__dirname}/results.json`, JSON.stringify({ checks, errors }, null, 2));
      console.log(`RESULT ${checks} browser checks passed`);
    } else console.log('Baseline screenshots captured');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
