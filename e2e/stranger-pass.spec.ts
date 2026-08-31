import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'https://tooltruth-webmcp.vercel.app';

test.describe('Stranger pass — Connect lighthouse path', () => {
  test('live URL → paste audit → rankings → delta receipt', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(`${BASE}/?view=integrations&demo=1`);
    await expect(page.getByRole('heading', { name: 'ReadyCounter' })).toBeVisible();

    await expect(page.getByText(/78\/148|148/).first()).toBeVisible({ timeout: 15_000 });

    const rankings = page.getByRole('heading', { name: /DTC rankings/i });
    await rankings.scrollIntoViewIfNeeded();
    await expect(rankings).toBeVisible();

    const auditInput = page.locator('input[placeholder*="http"], input[type="url"]').first();
    await auditInput.fill('https://colourpop.com');
    const auditBtn = page.getByRole('button', { name: /audit storefront|re-audit/i });
    await expect(auditBtn.first()).toBeEnabled();
    await auditBtn.first().click();

    await expect(page.getByText(/catalog|GTIN|0\/24|NOT MEASURED|checkout lines/i).first()).toBeVisible({
      timeout: 90_000,
    });

    const reAudit = page.getByRole('button', { name: /re-audit/i });
    await expect(reAudit.first()).toBeVisible({ timeout: 15_000 });
    await reAudit.first().click();
    await expect(page.getByText(/delta|prior|re-audit/i).first()).toBeVisible({ timeout: 90_000 });
  });
});
