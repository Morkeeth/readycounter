import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome', args: ['--enable-features=WebMCP'] });
const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
await p.goto('https://readycounter.vercel.app/?judge=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
await p.waitForTimeout(6500);
const panel = p.locator('.agent-shopper');
console.log('panel present:', await panel.count() > 0);
if (await panel.count()) {
  await panel.scrollIntoViewIfNeeded();
  await p.getByRole('button', { name: /send the agent/i }).click({ timeout: 8000 });
  // wait for the loop to settle
  for (let i = 0; i < 40; i++) {
    await p.waitForTimeout(1500);
    const busy = await p.getByRole('button', { name: /agent is shopping/i }).count();
    if (!busy) break;
  }
  const rows = await p.evaluate(() =>
    [...document.querySelectorAll('.agent-shopper__row')].map(r => r.innerText.replace(/\s+/g, ' ').slice(0, 150)));
  console.log(`\n${rows.length} log rows:`);
  rows.forEach(r => console.log('  ' + r));
  console.log('\ncart:', await p.evaluate(() => {
    const t = document.body.innerText;
    const m = t.match(/Total\s*\$[\d.,]+/); return m ? m[0] : 'n/a';
  }));
  console.log('AGENT chip in cart:', await p.evaluate(() => document.body.innerText.includes('AGENT')));
  await panel.screenshot({ path: '/tmp/rc-dir/agent-shopper.png' });
}
await b.close();
