import { test, expect } from '@playwright/test';

test('judge mode lands on co-shop with proof banner', async ({ page }) => {
  await page.goto('https://tooltruth-webmcp.vercel.app/?judge=1');
  await expect(page.getByRole('navigation', { name: 'Main navigation' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Co-shop' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByLabel('Judge quick path')).toBeVisible();
  await expect(page.getByText('Humans + agents, one cart')).toBeVisible();
});
