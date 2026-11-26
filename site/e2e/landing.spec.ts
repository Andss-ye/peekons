import { expect, test, type Page } from '@playwright/test';

// las mascotas, no las animaciones infinitas propias de los botones de Magic UI
const mascots = (page: Page, scope = 'body') =>
  page.evaluate((s) => ({
    drawn: document.querySelectorAll(`${s} .pk svg`).length,
    moving: document.getAnimations().filter((a) => (a.effect as KeyframeEffect)?.target?.closest?.('.pk')).length,
  }), scope);
const rest = (page: Page) => expect.poll(() => mascots(page), { timeout: 8000 }).toEqual({ drawn: 0, moving: 0 });

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    const Real = window.AudioContext;
    (window as unknown as { audioContexts: number }).audioContexts = 0;
    window.AudioContext = class extends Real {
      constructor() {
        super();
        (window as unknown as { audioContexts: number }).audioContexts++;
      }
    };
  });
});

test('loads clean, the hero says hello on its own, then everything rests', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto('/');
  await expect.poll(async () => (await mascots(page, '#peekons')).drawn).toBeGreaterThanOrEqual(5);
  await rest(page);
  expect(errors).toEqual([]);
});

test('silent until the speaker is turned on', async ({ page }) => {
  await page.goto('/');
  await rest(page);
  await page.locator('#peekons [data-slot=button]').first().hover();
  expect(await page.evaluate(() => (window as unknown as { audioContexts: number }).audioContexts)).toBe(0);
  await page.click('#sound');
  await page.mouse.move(0, 0);
  await page.locator('#peekons [data-slot=button]').first().hover();
  await expect.poll(() => page.evaluate(() => (window as unknown as { audioContexts: number }).audioContexts)).toBe(1);
  await page.reload();
  await expect(page.locator('#sound')).toHaveAttribute('aria-pressed', 'true');
});

test('theme persists across reloads', async ({ page }) => {
  await page.goto('/');
  const before = await page.evaluate(() => document.documentElement.classList.contains('dark'));
  await page.click('#theme');
  await page.reload();
  expect(await page.evaluate(() => document.documentElement.classList.contains('dark'))).toBe(!before);
});

test('pick: kits, ink, speed, zoom and copy-ready code', async ({ page }) => {
  await page.goto('/#pick');
  const pick = page.locator('#pick');
  await pick.getByRole('tab', { name: 'Animata' }).click();
  await pick.getByText('Duolingo, check').click();
  await expect(pick.locator('pre')).toContainText("import { Duolingo } from '@/components/animata'");
  await expect(pick.locator('pre')).toContainText('<Peekon icon={check} gesture="flip" sound={chirp} />');
  await pick.getByRole('radio', { name: 'tomato' }).click();
  await pick.getByRole('radio', { name: '¼×' }).click();
  await pick.locator('input[type=range]').fill('2');
  await pick.locator('li', { hasText: 'Duolingo' }).locator('button').first().hover();
  await expect.poll(() => page.evaluate(() => document.querySelector('#pick .pk svg')?.getAnimations()[0]?.playbackRate)).toBe(0.25);
  expect(await page.evaluate(() => getComputedStyle(document.querySelector('#pick .pk')!).getPropertyValue('--pk-ink').trim())).toBe('#e0522e');
});

test('every piece in every kit shows its mascot, unclipped, on hover', async ({ page }) => {
  await page.goto('/#pick');
  const pick = page.locator('#pick');
  for (const kit of ['shadcn/ui', 'Magic UI', 'Animata', 'Beyond buttons']) {
    await pick.getByRole('tab', { name: kit }).click();
    await page.waitForTimeout(300);
    const slots = pick.locator('li .pk');
    const n = await slots.count();
    expect(n, kit).toBeGreaterThanOrEqual(5);
    for (let i = 0; i < n; i++) {
      const slot = slots.nth(i);
      const clip = await slot.evaluate((pk) => {
        const host = pk.parentElement!;
        const st = getComputedStyle(host);
        return st.overflowX !== 'visible' || st.maskImage !== 'none' ? host.outerHTML.slice(0, 80) : '';
      });
      expect(clip, `${kit} #${i}`).toBe('');
      await slot.evaluate((pk) => pk.parentElement!.dispatchEvent(new PointerEvent('pointerenter')));
      await expect(slot.locator('svg'), `${kit} #${i}`).toHaveCount(1);
      await slot.evaluate((pk) => pk.parentElement!.dispatchEvent(new PointerEvent('pointerleave')));
      await expect(slot.locator('svg'), `${kit} #${i} at rest`).toHaveCount(0);
    }
  }
});

test('copy labels come back after quick repeated clicks', async ({ page }) => {
  await page.goto('/');
  const pill = page.locator('#peekons [data-copy]');
  await pill.click();
  await pill.click();
  await expect(pill.locator('[data-copy-label]')).toHaveText('Copy', { timeout: 3000 });
});

test('fits a phone screen without sideways scroll', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
