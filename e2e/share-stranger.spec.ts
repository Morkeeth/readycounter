import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'https://tooltruth-webmcp.vercel.app';

const IMPORT_JSON = JSON.stringify({
  exported_at: '2026-09-01T00:00:00.000Z',
  store: 'Stranger Tea Co',
  products: [
    {
      id: 'stranger-sku-1',
      title: 'Stranger Matcha Tin',
      body_html: '<p>Incognito share test SKU.</p>',
      vendor: 'Stranger Tea Co',
      product_type: 'Tea',
      tags: 'test',
      variants: [
        {
          id: 'v1',
          sku: 'stranger-sku-1',
          price: '18.00',
          inventory_quantity: 50,
          barcode: '0000000000001',
        },
      ],
    },
  ],
});

test.describe('Share stranger — production incognito', () => {
  test('import catalog → cart → ?co= link → fresh context sees same order', async ({
    browser,
  }) => {
    test.setTimeout(180_000);

    const source = await browser.newContext({ permissions: ['clipboard-read', 'clipboard-write'] });
    const page = await source.newPage();

    await page.goto(`${BASE}/?view=integrations`);
    await expect(page.getByRole('heading', { name: 'ReadyCounter' })).toBeVisible();

    const importDetails = page.locator('details.integrations__advanced');
    await importDetails.scrollIntoViewIfNeeded();
    await importDetails.locator('summary').click();
    const textarea = page.locator('textarea.integrations__import');
    await textarea.fill(IMPORT_JSON);
    await expect(page.getByRole('button', { name: 'Import catalog' })).toBeEnabled({ timeout: 5_000 });
    await page.getByRole('button', { name: 'Import catalog' }).click();

    const storeSelect = page.getByRole('combobox', { name: 'Switch store' });
    await storeSelect.focus();
    await expect(storeSelect).toContainText('Stranger Tea Co', { timeout: 15_000 });

    await page.locator('button.tabs__btn', { hasText: 'Co-shop' }).click();
    await page.getByRole('button', { name: /add/i }).first().click();
    await expect(page.getByText(/Stranger Matcha/i).first()).toBeVisible({ timeout: 15_000 });

    await page.getByRole('button', { name: /copy cart link/i }).click();
    let shareUrl = '';
    try {
      shareUrl = await page.evaluate(async () => navigator.clipboard.readText());
    } catch {
      shareUrl = page.url();
    }
    expect(shareUrl, 'share URL must include ?co=').toMatch(/[?&]co=/);

    const stranger = await browser.newContext();
    const guest = await stranger.newPage();
    await guest.goto(shareUrl);
    await expect(guest.getByText(/Stranger Matcha/i).first()).toBeVisible({ timeout: 20_000 });
    await expect(guest.getByRole('combobox', { name: 'Switch store' })).toContainText('Stranger Tea Co');

    await stranger.close();
    await source.close();
  });
});
