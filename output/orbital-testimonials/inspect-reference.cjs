/* global console, __dirname, process */
const { chromium } = require('../certificates-cursor/tools/node_modules/playwright');
const fs = require('node:fs');
(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  try {
    const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
    await page.goto('https://cdn.21st.dev/avanishverma4/testimonial-v2/default/bundle.1766064108485.html?theme=light&pv=1', { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('#root').locator('button').first().waitFor({ timeout: 20000 });
    await page.screenshot({ path: `${__dirname}/reference-testimonials.png` });
    fs.writeFileSync(`${__dirname}/reference-testimonials.txt`, await page.locator('body').innerText());
    console.log((await page.locator('body').innerText()).slice(-9000));
    console.log('FRAMES', page.frames().map(frame => frame.url()));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
