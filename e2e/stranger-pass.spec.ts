import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'https://readycounter.vercel.app';

test.describe('Stranger pass — score your store', () => {
  test('live URL → domain input → score → fix list → 8 tool checks', async ({ page }) => {
    test.setTimeout(120_000);
    await page.goto(`${BASE}/`);
    await expect(page.getByRole('heading', { name: 'ReadyCounter' })).toBeVisible();

    await expect(page.getByRole('heading', { name: /Paste your store/i })).toBeVisible({
      timeout: 10_000,
    });

    const domainInput = page.getByRole('textbox', { name: 'Your store domain' });
    await domainInput.fill('colourpop.com');
    await page.getByRole('button', { name: /score my store/i }).click();

    await expect(page.getByText(/catalog pts/i).first()).toBeVisible({ timeout: 90_000 });
    await expect(page.getByText(/Top fixes this month|Against the field/i).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByRole('heading', { name: /Tool checks/i })).toBeVisible();
    await expect(page.locator('.tool-probes__table tbody tr')).toHaveCount(8);
  });
});
