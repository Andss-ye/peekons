import { expect, test, type Locator, type Page } from '@playwright/test';
import * as icons from '../src/icons/index.js';

const names = Object.keys(icons);
const idle = (page: Page) => page.waitForFunction(() => document.getAnimations().length === 0);
const lift = (button: Locator) =>
  button.evaluate((b) => b.getBoundingClientRect().top - b.querySelector('.pk svg')!.getBoundingClientRect().top);

test('every icon peeks out on hover and hides on leave', async ({ page }) => {
  await page.goto('/');
  expect(names.length).toBeGreaterThanOrEqual(27);
  for (const name of names) {
    const button = page.locator(`#buttons [data-peekon="${name}"]`);
    await expect(button.locator('.pk svg'), `${name} idle`).toHaveCount(0);
    await button.hover();
    await page.waitForTimeout(500);
    expect(await lift(button), `${name} out`).toBeGreaterThan(15);
    await page.mouse.move(0, 0);
    await idle(page);
    await expect(button.locator('.pk svg'), `${name} gone`).toHaveCount(0);
  }
});

test('the mascot never takes a click', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('#react-btn');
  await button.hover();
  await page.waitForTimeout(500);
  const box = (await button.locator('.pk svg').boundingBox())!;
  const hit = await page.evaluate(([x, y]) => document.elementFromPoint(x!, y!)?.closest('.pk') ?? null, [box.x + box.width / 2, box.y + box.height / 3]);
  expect(hit).toBeNull();
  await button.click();
  expect(await page.evaluate(() => (window as { clicks?: number }).clicks)).toBe(1);
});

test('nothing moves with reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.locator('#buttons [data-peekon="mail"]').hover();
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  await expect(page.locator('#buttons [data-peekon="mail"] .pk')).toBeHidden();
});

test('500 mounts leave no animations, nodes or listeners behind', async ({ page }) => {
  await page.goto('/leak.html');
  const cdp = await page.context().newCDPSession(page);
  const counters = async () => {
    await cdp.send('HeapProfiler.collectGarbage');
    return cdp.send('Memory.getDOMCounters');
  };
  await page.evaluate(() => (window as unknown as { cycle: (n: number) => Promise<number> }).cycle(20));
  const before = await counters();
  const alive = await page.evaluate(() => (window as unknown as { cycle: (n: number) => Promise<number> }).cycle(500));
  const after = await counters();
  expect(alive).toBe(0);
  expect(after.jsEventListeners).toBeLessThanOrEqual(before.jsEventListeners);
  expect(after.nodes).toBeLessThanOrEqual(before.nodes + 50);
});

test('100 hosts say hello together without long tasks, then leave nothing behind', async ({ page }) => {
  await page.goto('/perf.html');
  await page.waitForFunction(() => (window as unknown as { mounted?: boolean }).mounted);
  await expect.poll(() => page.evaluate(() => document.querySelectorAll('.pk svg').length)).toBeGreaterThan(50);
  await idle(page);
  const result = await page.evaluate(() => ({
    hosts: document.querySelectorAll('[data-peekon]').length,
    svgs: document.querySelectorAll('.pk svg').length,
    long: (window as unknown as { long: number[] }).long,
  }));
  expect(result.hosts).toBe(100);
  expect(result.svgs).toBe(0);
  expect(result.long.filter((d) => d > 50)).toEqual([]);
});

test('with greet off, 100 hosts stay still', async ({ page }) => {
  await page.goto('/perf.html?greet=false');
  await page.waitForFunction(() => (window as unknown as { mounted?: boolean }).mounted);
  await page.waitForTimeout(1500);
  expect(await page.evaluate(() => document.getAnimations().length + document.querySelectorAll('.pk svg').length)).toBe(0);
});

test('a hover starts rising right away, not after a pause', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('#buttons [data-peekon="mail"]');
  await button.hover();
  await page.waitForTimeout(150);
  expect(await lift(button)).toBeGreaterThan(3);
});
