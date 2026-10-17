import { test as base, expect } from '@playwright/test';
import { lessonManifest } from '../../src/lessons/manifest.js';

// Read expected identity and slide counts from the registered source modules,
// independently of the generated catalogue and built HTML under test.
const lessons = await Promise.all(lessonManifest.map(async ({ id, path }) => {
  const { default: lesson } = await import(new URL(path, new URL('../../src/lessons/', import.meta.url)));
  return { id, lesson };
}));

const test = base.extend({
  page: async ({ page, baseURL }, use) => {
    const failures = [];
    const essentialTypes = new Set(['document', 'script', 'stylesheet', 'font', 'image', 'fetch', 'xhr']);
    const isEssentialLocal = (request) => new URL(request.url()).origin === new URL(baseURL).origin &&
      essentialTypes.has(request.resourceType());
    page.on('pageerror', (error) => failures.push(`Uncaught JavaScript: ${error.message}`));
    page.on('console', (message) => {
      if (message.type() === 'error') failures.push(`Console error: ${message.text()}`);
    });
    page.on('requestfailed', (request) => {
      if (isEssentialLocal(request)) failures.push(`Failed asset: ${request.url()} (${request.failure()?.errorText})`);
    });
    page.on('response', (response) => {
      if (response.status() >= 400 && isEssentialLocal(response.request())) {
        failures.push(`HTTP ${response.status()}: ${response.url()}`);
      }
    });
    // The app bundles its runtime dependencies locally; never depend on a live
    // GitHub Pages site or third-party service to make a smoke test pass.
    await page.route('**/*', (route) => {
      const url = new URL(route.request().url());
      if (['http:', 'https:'].includes(url.protocol) && url.origin !== new URL(baseURL).origin) {
        failures.push(`Unexpected external request: ${url.href}`);
        return route.abort();
      }
      return route.continue();
    });
    await use(page);
    expect(failures, 'Runtime errors and essential local asset failures').toEqual([]);
  },
});

async function expectNoMathErrors(page) {
  await expect(page.locator('.katex-error:visible, .math-error:visible')).toHaveCount(0);
}

async function openPage(page, path) {
  const response = await page.goto(path);
  expect(response?.status()).toBe(200);
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.fonts.ready);
}

test('course library loads and links every registered lesson', async ({ page }) => {
  expect(lessons.length).toBeGreaterThan(0);
  await openPage(page, '/');
  await expect(page).toHaveTitle('Year 7 Mathematics Slideshows');
  await expect(page.locator('#libraryTreeContainer')).toBeVisible();
  await expect(page.getByRole('searchbox', { name: 'Filter lessons' })).toBeVisible();
  await expect(page.locator('.btn-open-lesson')).toHaveCount(lessons.length);
  for (const { id, lesson } of lessons) {
    const link = page.locator(`.btn-open-lesson[data-lesson-id="${id}"]`);
    const href = await link.getAttribute('href');
    expect(new URL(href, page.url()).pathname).toBe(`/lessons/${encodeURIComponent(id)}/`);
    await expect(page.locator('.lesson-row-title').filter({ hasText: lesson.title })).toHaveCount(1);
  }
  await expectNoMathErrors(page);
});

for (const { id, lesson } of lessons) {
  test(`${id}: production lesson loads and navigates all slides`, async ({ page }) => {
    await openPage(page, `/lessons/${encodeURIComponent(id)}/`);
    await expect(page.locator('#app')).toHaveAttribute('data-lesson-id', id);
    await expect(page.locator('.presentation-view')).toBeVisible();
    await expect(page.locator('.pres-lesson-title .lesson-code-badge')).toHaveText(id);
    await expect(page.locator('.pres-lesson-title')).toContainText(lesson.title);
    await expect(page.locator('#slideViewport .slide')).toHaveCount(lesson.slides.length);
    const next = page.locator('#btnNextSlide');
    const previous = page.locator('#btnPrevSlide');
    await expect(previous).toBeVisible();
    await expect(next).toBeVisible();
    await expect(previous).toHaveAttribute('aria-label', 'Beginning of lesson');

    for (let index = 0; index < lesson.slides.length; index++) {
      const activeSlide = page.locator('#slideViewport .slide.active');
      await expect(activeSlide).toHaveCount(1);
      await expect(activeSlide).toBeVisible();
      await expect(activeSlide).toHaveAttribute('data-slide-index', String(index));
      await expect(page.locator('#presSlideCounter')).toHaveText(`${index + 1} / ${lesson.slides.length}`);
      await expectNoMathErrors(page);

      // Advance through real reveal controls, without changing engine state or
      // assuming a fixed number of steps. The DOM count bounds the loop even
      // when explicit reveal-step attributes group several items together.
      const maxReveals = await activeSlide.locator('.reveal-item').count();
      for (let step = 0; step < maxReveals && (await next.getAttribute('aria-label')).startsWith('Reveal step '); step++) {
        await next.click();
        await expect(activeSlide).toHaveAttribute('data-slide-index', String(index));
        await expectNoMathErrors(page);
      }
      if (index < lesson.slides.length - 1) {
        await expect(next).toHaveAttribute('aria-label', 'Advance to next slide');
        await next.click();
        await expect(page.locator('#presSlideCounter')).toHaveText(`${index + 2} / ${lesson.slides.length}`);
        // Exercise backward navigation before revealing anything on this slide.
        await previous.click();
        await expect(page.locator('#presSlideCounter')).toHaveText(`${index + 1} / ${lesson.slides.length}`);
        await next.click();
      } else {
        await expect(next).toHaveAttribute('aria-label', 'End of lesson reached');
      }
    }
    await page.locator('#btnBackToLibrary').click();
    await expect(page).toHaveURL('http://127.0.0.1:4173/');
    await expect(page.locator('#libraryTreeContainer')).toBeVisible();
    await page.waitForLoadState('networkidle');
    await expectNoMathErrors(page);
  });
}
