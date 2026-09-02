import { test, expect } from '@playwright/test';

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? 'https://tooltruth-webmcp.vercel.app';

test.describe('Launch test cases', () => {
  test('tc-sandbox-captcha — ember-oak shows CAPTCHA blocker', async ({ page }) => {
    await page.goto(`${BASE}/?store=ember-oak&view=merchant`);
    await expect(page.getByRole('heading', { name: /readiness|bill|merchant/i }).first()).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.locator('.tape').getByText('0/24').first()).toBeVisible();
    await expect(page.getByText('70').first()).toBeVisible();
  });

  test('tc-sandbox-account — neon-matcha shows account wall', async ({ page }) => {
    await page.goto(`${BASE}/?store=neon-matcha&view=merchant`);
    await expect(page.getByText(/account|login/i).first()).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/65/).first()).toBeVisible();
  });

  test('tc-url-audit-gtin — colourpop audit returns catalog score', async ({ request }) => {
    const res = await request.post(`${BASE}/api/v1/audit/url`, {
      data: { url: 'https://colourpop.com' },
      timeout: 60_000,
    });
    expect(res.status()).toBe(201);
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(body.summary).toBeDefined();
    expect(body.summary.unmeasuredLineIds.length).toBeGreaterThan(0);
    expect(body.scoreNote).toMatch(/catalog/i);
  });

  test('tc-url-blocked — gymshark returns 422 with OAuth hint', async ({ request }) => {
    const res = await request.post(`${BASE}/api/v1/audit/url`, {
      data: { url: 'https://www.gymshark.com' },
      timeout: 60_000,
    });
    expect(res.status()).toBe(422);
    const body = await res.json();
    expect(body.error).toMatch(/OAuth|blocked|products/i);
  });

  test('tc-api-production — render status shows partnership + batch', async ({ request }) => {
    const res = await request.get(`${BASE}/api/v1/render/status`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.partner).toBe('render');
    expect(body.kv.connected).toBe(true);
    expect(body.lastAuditBatch?.shopCount).toBeGreaterThanOrEqual(30);
  });

  test('tc-api-production — rankings endpoint returns batch', async ({ request }) => {
    const res = await request.get(`${BASE}/api/v1/rankings`);
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.ok).toBe(true);
    expect(Array.isArray(body.rows)).toBe(true);
    if (body.shopCount >= 30) {
      expect(body.succeeded).toBeGreaterThanOrEqual(30);
      expect(body.ucp?.gtinWhereCrawlZero).toBeGreaterThanOrEqual(1);
      return;
    }
    // Cold miss: meta twin on render/status must still show the field batch.
    const status = await request.get(`${BASE}/api/v1/render/status`);
    expect(status.ok()).toBeTruthy();
    const statusBody = await status.json();
    expect(statusBody.lastAuditBatch?.shopCount).toBeGreaterThanOrEqual(30);
  });

  test('tc-sandbox-paradise — agent-paradise scores 100', async ({ page }) => {
    await page.goto(`${BASE}/?store=agent-paradise&view=merchant`);
    await expect(page.getByText('100').first()).toBeVisible({ timeout: 15_000 });
  });

  test('tc-sandbox-chaos — chaos-pets multi-wall', async ({ page }) => {
    await page.goto(`${BASE}/?store=chaos-pets&view=merchant`);
    await expect(page.locator('.tape').getByText('0/24').first()).toBeVisible({ timeout: 15_000 });
    await expect(page.locator('.tape').getByText('0/11').first()).toBeVisible();
    await expect(page.getByText('40').first()).toBeVisible();
  });

  test('tc-ucp-compare — colourpop returns UCP row', async ({ request }) => {
    const res = await request.post(`${BASE}/api/v1/audit/compare`, {
      data: { url: 'https://colourpop.com' },
      timeout: 60_000,
    });
    expect(res.ok()).toBeTruthy();
    const body = await res.json();
    expect(body.crawl).toBeDefined();
    expect(body.ucp?.available).toBe(true);
  });
});
