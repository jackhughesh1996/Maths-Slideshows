/** Browser interaction checks for 3C fraction conversion. Requires installed project dependencies. */
import { test, expect } from '@playwright/test';

async function navigateToSlide(page, slideIndex) {
  await page.goto('/lessons/3C/');
  const next = page.locator('#btnNextSlide');
  for (let safety = 0; safety < 60; safety++) {
    const actual = Number(await page.locator('#slideViewport .slide.active').getAttribute('data-slide-index'));
    if (actual === slideIndex) return;
    expect(actual).toBeLessThan(slideIndex);
    await next.click();
  }
  throw new Error(`Could not reach 3C slide ${slideIndex}`);
}

test('3C build mode changes parts and safely reveals calculation', async ({ page }) => {
  await navigateToSlide(page, 5);
  const sim = page.locator('.slide.active .fraction-conversion-widget');
  await expect(sim).toBeVisible();
  await expect(sim.locator('svg')).toHaveAttribute('aria-label', /11 parts of size one 4th/);
  await sim.locator('.fraction-answer-toggle').click();
  await expect(sim.locator('.fraction-result-visible .katex')).toBeVisible();
  await sim.locator('.fraction-part').fill('1');
  await sim.locator('.fraction-part').press('Tab');
  await expect(sim.locator('svg')).toHaveAttribute('aria-label', /9 parts of size one 4th/);
  await expect(sim.locator('.fraction-answer-toggle')).toHaveAttribute('aria-expanded', 'false');
  await sim.locator('.fraction-reset').click();
  await expect(sim.locator('svg')).toHaveAttribute('aria-label', /11 parts of size one 4th/);
});

test('3C regroup mode groups quarters into exactly four wholes and a quarter', async ({ page }) => {
  await navigateToSlide(page, 10);
  const sim = page.locator('.slide.active .fraction-conversion-widget');
  await expect(sim).toBeVisible();
  await sim.locator('.fraction-group-next').click();
  await expect(sim.locator('.fraction-conversion-result')).toContainText('1 complete whole grouped; 13 parts still ungrouped');
  await sim.locator('.fraction-group-all').click();
  await expect(sim.locator('.fraction-conversion-result')).toContainText('4 complete wholes grouped; 1 part still ungrouped');
  await expect(sim.locator('.fraction-group-next')).toBeDisabled();
  await sim.locator('.fraction-answer-toggle').click();
  await expect(sim.locator('.fraction-result-visible .katex')).toBeVisible();
});

test('3C number line converts labels without moving its point', async ({ page }) => {
  await navigateToSlide(page, 13);
  const sim = page.locator('.slide.active .fraction-conversion-widget');
  const point = sim.locator('svg circle');
  const xBefore = await point.getAttribute('cx');
  await sim.locator('.fraction-answer-toggle').click();
  const xAfter = await point.getAttribute('cx');
  expect(xAfter).toBe(xBefore);
  await expect(sim.locator('.fraction-line-point-label')).toContainText('2 3/4');
  await expect(sim.locator('.fraction-result-visible .katex')).toBeVisible();
});
