import { expect, test, type Page } from '@playwright/test';

const drawn = (page: Page, scope = 'body') => page.evaluate((s) => document.querySelectorAll(`${s} .pk svg`).length, scope);
const idle = (page: Page) => page.waitForFunction(() => document.getAnimations().length === 0 && !document.querySelector('.pk svg'));

test('loads clean and the headline says hello on its own, then rests', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect.poll(() => drawn(page, 'h1')).toBeGreaterThanOrEqual(3);
  await idle(page);
  expect(errors).toEqual([]);
});

test('theme switch persists across reloads and repaints the mascots', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-theme=dark]');
  await page.reload();
  await expect(page.locator('html')).toHaveClass(/dark/);
  const ink = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue('--fg').trim());
  expect(ink).toBe('#e8ebf3');
  await page.click('[data-theme=light]');
  await expect(page.locator('html')).not.toHaveClass(/dark/);
});

test('playground: pick, zoom, slow down, copy-ready code', async ({ page }) => {
  await page.goto('/#playground');
  const pg = page.locator('#playground');
  await pg.getByRole('button', { name: 'check', exact: true }).click();
  await pg.getByRole('button', { name: 'flip', exact: true }).click();
  await pg.getByRole('button', { name: 'Quarter' }).click();
  await pg.locator('input[type=range]').fill('3');
  await expect(pg.locator('pre')).toContainText("import { check } from 'peekons/icons'");
  await expect(pg.locator('pre')).toContainText('gesture="flip"');
  const host = pg.locator('.grid.h-\\[440px\\] button').first();
  await host.hover();
  await expect.poll(() => page.evaluate(() => document.querySelector('#playground .pk svg')?.getAnimations()[0]?.playbackRate)).toBe(0.25);
  const box = (await host.boundingBox())!;
  expect(box.height).toBeGreaterThan(36 * 2.5);
});

test('every gallery host shows its mascot on hover and lets go after', async ({ page }) => {
  await page.goto('/');
  await idle(page);
  const hosts = page.locator('#styles [data-peekon]');
  const n = await hosts.count();
  expect(n).toBeGreaterThanOrEqual(24);
  for (let i = 0; i < n; i++) {
    const h = hosts.nth(i);
    await h.scrollIntoViewIfNeeded();
    await idle(page);
    await h.hover();
    await expect(h.locator('.pk svg')).toHaveCount(1);
    await page.mouse.move(0, 0);
    await expect(h.locator('.pk svg')).toHaveCount(0);
  }
});

test('a hundred mascots come and go, counters back to zero', async ({ page }) => {
  await page.goto('/#performance');
  await page.click('#perf-toggle');
  await expect(page.locator('#perf-grid [data-peekon]')).toHaveCount(100);
  await expect(page.locator('#perf-drawn')).not.toHaveText('0');
  await expect(page.locator('#perf-drawn')).toHaveText('0', { timeout: 8000 });
  await expect(page.locator('#perf-anims')).toHaveText('0');
  await page.click('#perf-toggle');
  await expect(page.locator('#perf-grid [data-peekon]')).toHaveCount(0);
});

test('fits a phone screen without sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('copy labels come back after quick repeated clicks', async ({ page }) => {
  await page.goto('/');
  const pill = page.locator('h1 ~ div [data-copy]');
  await pill.click();
  await pill.click();
  await expect(pill.locator('[data-copy-label]')).toHaveText('Copy', { timeout: 3000 });
});
