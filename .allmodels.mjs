import { chromium } from 'playwright';
const b = await chromium.launch({ channel: 'chrome', args: ['--enable-features=WebMCP'] });
const models = await (await fetch('https://readycounter.vercel.app/api/v1/agent/models')).json();
for (const m of models.models) {
  const p = await b.newPage({ viewport: { width: 1440, height: 1000 } });
  await p.goto('https://readycounter.vercel.app/?judge=1', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await p.waitForTimeout(6000);
  await p.locator('.agent-shopper').scrollIntoViewIfNeeded();
  await p.selectOption('.agent-shopper__controls select', m.id).catch(() => {});
  await p.getByRole('button', { name: /send the agent/i }).click({ timeout: 8000 });
  for (let i = 0; i < 50; i++) {
    await p.waitForTimeout(1500);
    if (!(await p.getByRole('button', { name: /agent is shopping/i }).count())) break;
  }
  const r = await p.evaluate(() => ({
    calls: [...document.querySelectorAll('.agent-shopper__row--call code')].map(e => e.textContent.split('(')[0]),
    blocked: !!document.querySelector('.agent-shopper__blocked'),
    said: document.querySelector('.agent-shopper__say')?.textContent?.slice(0, 90) ?? '',
    err: document.querySelector('.agent-shopper__row--error')?.textContent?.slice(0, 70) ?? '',
  }));
  console.log(`${m.label.padEnd(20)} ${r.calls.join(' → ') || '(none)'} | blocked=${r.blocked} ${r.err ? '| ERR ' + r.err : ''}`);
  if (r.said) console.log(`${''.padEnd(20)} "${r.said}"`);
  await p.close();
}
await b.close();
