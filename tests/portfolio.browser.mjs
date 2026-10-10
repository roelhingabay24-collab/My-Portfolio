import assert from 'node:assert/strict';
import { pathToFileURL } from 'node:url';

// Run against a local preview server. An optional argument points to an existing
// playwright-core installation, so these checks need no new project dependency.
const { chromium } = await import(process.argv[2] ? pathToFileURL(process.argv[2]).href : 'playwright-core');
const browser = await chromium.launch({ headless: true });
try {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('http://127.0.0.1:5187', { waitUntil: 'networkidle' });
  const cdp = await context.newCDPSession(page);
  const figure = page.locator('.figure-zoom');
  const counter = page.locator('.gallery-count');
  const viewer = page.locator('.lightbox');
  const open = async (name) => {
    await page.getByRole('button', { name: `View the ${name} project`, exact: true }).click();
    await figure.waitFor();
  };
  const expectCounter = async (text) => {
    await page.waitForFunction((expected) => document.querySelector('.gallery-count')?.textContent === expected, text);
  };
  const gesture = async (locator, dx, dy = 0, cancel = false) => {
    const box = await locator.boundingBox();
    assert.ok(box);
    const x = box.x + box.width / 2 - dx / 2;
    const y = box.y + box.height / 2 - dy / 2;
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y, id: 1 }] });
    for (let step = 1; step <= 6; step++) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + dx * step / 6, y: y + dy * step / 6, id: 1 }] });
      await page.waitForTimeout(20);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: cancel ? 'touchCancel' : 'touchEnd', touchPoints: [] });
    await page.waitForTimeout(100);
  };

  await open('Account Monitoring Systems');
  await expectCounter('1 / 2');
  await gesture(figure, -130);
  await expectCounter('2 / 2');
  assert.equal(await viewer.count(), 0, 'a swipe must not open the lightbox');
  await gesture(figure, -130);
  await expectCounter('1 / 2');
  await gesture(figure, 130);
  await expectCounter('2 / 2');
  await gesture(figure, 130);
  await expectCounter('1 / 2');
  console.log('PASS: real mobile swipes navigate both directions and wrap without opening the viewer.');

  await gesture(figure, -25);
  await expectCounter('1 / 2');
  assert.equal(await viewer.count(), 0, 'a short drag must not open the lightbox');
  await gesture(figure, -100, 0, true);
  await expectCounter('1 / 2');
  const scrollBefore = await page.locator('.dialog-scroll').evaluate((el) => el.scrollTop);
  await gesture(figure, 2, -70);
  await expectCounter('1 / 2');
  const scrollAfter = await page.locator('.dialog-scroll').evaluate((el) => el.scrollTop);
  assert.ok(scrollAfter > scrollBefore, 'vertical gestures should scroll the project details');
  await page.locator('.dialog-scroll').evaluate((el) => { el.scrollTop = 0; });
  console.log('PASS: short drags, cancellation, and vertical scrolling do not navigate.');

  await page.getByRole('button', { name: 'Next screenshot', exact: true }).click();
  await expectCounter('2 / 2');
  await page.keyboard.press('ArrowLeft');
  await expectCounter('1 / 2');
  await figure.tap();
  await viewer.waitFor();
  await gesture(page.locator('.lightbox-image'), -130);
  await expectCounter('2 / 2');
  assert.match(await page.locator('.lightbox-bar p').textContent(), /2 \/ 2/);
  await gesture(page.locator('.lightbox-image'), 130);
  await expectCounter('1 / 2');
  await page.getByRole('button', { name: 'Next item', exact: true }).click();
  await expectCounter('2 / 2');
  await page.keyboard.press('ArrowLeft');
  await expectCounter('1 / 2');
  await page.keyboard.press('Escape');
  await viewer.waitFor({ state: 'detached' });
  assert.equal(await page.locator('.dialog').count(), 1, 'Escape should close only the top viewer');
  await page.getByRole('button', { name: 'Close project', exact: true }).click();
  console.log('PASS: taps, full-screen swipes, buttons, keyboard arrows, and nested Escape still work.');

  await open('Branch Directory');
  await gesture(figure, -130);
  assert.equal(await counter.count(), 0);
  assert.equal(await viewer.count(), 0, 'dragging a single screenshot must not open the viewer');
  assert.equal(await viewer.count(), 0, 'dragging a single screenshot must not open the viewer');
  await figure.tap();
  await viewer.waitFor();
  await gesture(page.locator('.lightbox-image'), -130);
  assert.equal(await page.locator('.lightbox-nav').count(), 0);
  await page.keyboard.press('Escape');
  await viewer.waitFor({ state: 'detached' });
  await page.getByRole('button', { name: 'Close project', exact: true }).click();
  await page.getByRole('button', { name: 'View the Airfare Booking Request project', exact: true }).click();
  assert.equal(await page.locator('.dialog .work-empty').textContent(), 'Preview coming soon');
  await page.getByRole('button', { name: 'Close project', exact: true }).click();
  console.log('PASS: single screenshots and empty galleries retain their existing behavior.');

  await context.close();
  const normal = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const normalPage = await normal.newPage();
  await normalPage.goto('http://127.0.0.1:5187', { waitUntil: 'networkidle' });
  await normalPage.getByRole('button', { name: 'View the Account Monitoring Systems project', exact: true }).click();
  await normalPage.waitForTimeout(900);
  await normalPage.locator('.figure-zoom').tap();
  await normalPage.locator('.lightbox').waitFor();
  await normalPage.keyboard.press('Escape');
  await normalPage.locator('.lightbox').waitFor({ state: 'detached' });
  await normalPage.getByRole('button', { name: 'Close project', exact: true }).click();
  await normal.close();
  assert.deepEqual(errors, []);
  console.log('PASS: animation-enabled viewing works; no runtime errors in the mobile gesture checks.');

  for (const width of [1440, 1024, 768, 390, 320]) {
    const audit = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce', colorScheme: 'dark' });
    const auditPage = await audit.newPage();
    await auditPage.goto('http://127.0.0.1:5187', { waitUntil: 'networkidle' });
    await auditPage.evaluate(async () => {
      await document.fonts.ready;
      document.querySelectorAll('img').forEach((img) => { img.loading = 'eager'; });
    });
    await auditPage.waitForFunction(() => [...document.images].every((img) => img.complete));
    for (const section of await auditPage.locator('main > section').all()) {
      await section.scrollIntoViewIfNeeded();
    }
    const layout = await auditPage.evaluate(() => ({
      pageOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      missingImages: [...document.images].filter((img) => !img.naturalWidth).map((img) => img.getAttribute('src')),
      titleClips: [...document.querySelectorAll('.hero-line')].filter((el) => {
        const child = el.firstElementChild.getBoundingClientRect();
        const parent = el.getBoundingClientRect();
        return child.bottom > parent.bottom + 1 || child.right > parent.right + 1;
      }).map((el) => el.textContent),
      issuerOverflow: [...document.querySelectorAll('.cert-issuer')].filter((el) => el.scrollWidth > el.clientWidth + 1).map((el) => el.textContent),
      contactClip: document.querySelector('.contact-title-line em').getBoundingClientRect().bottom > document.querySelector('.contact-title-line em').parentElement.getBoundingClientRect().bottom + 1,
    }));
    assert.equal(layout.pageOverflow, false, `page overflow at ${width}px`);
    assert.deepEqual(layout.missingImages, [], `broken images at ${width}px`);
    assert.deepEqual(layout.titleClips, [], `heading clipping at ${width}px`);
    assert.deepEqual(layout.issuerOverflow, [], `issuer overflow at ${width}px`);
    assert.equal(layout.contactClip, false, `contact heading clipping at ${width}px`);
    await audit.close();
    console.log(`PASS: all sections, image assets, hero mask, and certificate labels at ${width}px.`);
  }
} finally {
  await browser.close();
}
