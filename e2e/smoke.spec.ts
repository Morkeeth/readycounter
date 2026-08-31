import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'https://tooltruth-webmcp.vercel.app';

test.describe('ReadyCounter smoke', () => {
  test('landing loads and health API is up', async ({ page, request }) => {
    await page.goto(BASE);
    await expect(page.getByRole('heading', { name: 'ReadyCounter' })).toBeVisible();
    const health = await request.get(`${BASE}/api/v1/health`);
    expect(health.ok()).toBeTruthy();
    const body = await health.json();
    expect(body.ok).toBe(true);
    expect(body.kv?.backend).toBe('redis');
  });

  test('tools manifest returns 18 tools', async ({ request }) => {
    const res = await request.get(`${BASE}/api/v1/tools`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.toolCount).toBe(18);
  });

  test('shopify status configured on production', async ({ request }) => {
    const res = await request.get(`${BASE}/api/v1/shopify/status`);
    expect(res.ok()).toBeTruthy();
    const data = await res.json();
    expect(data.configured).toBe(true);
  });
});
