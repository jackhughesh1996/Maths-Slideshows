import { test, expect } from '@playwright/test';

async function navigateToSlide(page, targetIndex) {
  await page.goto('/lessons/3H/');
  const next = page.locator('#btnNextSlide');
  for (let safety = 0; safety < 60; safety++) {
    const activeSlide = page.locator('#slideViewport .slide.active');
    const actual = Number(await activeSlide.getAttribute('data-slide-index'));
    if (actual === targetIndex) return;
    expect(actual).toBeLessThan(targetIndex);
    await next.click();
  }
  throw new Error(`Could not reach 3H slide ${targetIndex}`);
}

test.describe('Lesson 3H Browser Tests', () => {
  test('loads lesson 3H and displays title slide', async ({ page }) => {
    await page.goto('/lessons/3H/');
    const activeSlide = page.locator('#slideViewport .slide.active');
    await expect(activeSlide.locator('h1')).toContainText('3H: Dividing Fractions');
    await expect(activeSlide).toContainText('How many times does one fraction fit into another?');
  });

  test('navigates through slides and renders fraction division explorer on slide 6', async ({ page }) => {
    // Slide index 5 is Slide 6
    await navigateToSlide(page, 5);

    const activeSlide = page.locator('#slideViewport .slide.active');
    await expect(activeSlide.locator('.slide-header h2')).toContainText('Fraction Division Explorer');

    // Verify fraction division simulation widget exists
    const simWidget = activeSlide.locator('.fraction-division-widget');
    await expect(simWidget).toBeVisible();

    // Verify preset buttons exist and can be clicked
    const presetBtn = simWidget.locator('.sim-preset-btn').first();
    await expect(presetBtn).toBeVisible();

    // Click "Show Groups"
    const actionBtn = simWidget.locator('.sim-toggle-groups-btn');
    await expect(actionBtn).toBeVisible();
    await actionBtn.click();

    // Verify group visual stage rendered
    const visualStage = simWidget.locator('.sim-visual-stage svg');
    await expect(visualStage).toBeVisible();

    // Click "Show Working & Answer"
    const calcBtn = simWidget.locator('.sim-toggle-calc-btn');
    await expect(calcBtn).toBeVisible();
    await calcBtn.click();

    // Verify result equation container is displayed
    const equation = simWidget.locator('.sim-equation-container');
    await expect(equation).toBeVisible();
  });

  test('renders reciprocal demonstrator on slide 8', async ({ page }) => {
    // Slide index 7 is Slide 8
    await navigateToSlide(page, 7);

    const activeSlide = page.locator('#slideViewport .slide.active');
    await expect(activeSlide.locator('.slide-header h2')).toContainText('Reciprocals');

    // Verify reciprocal simulation widget exists
    const recipWidget = activeSlide.locator('.reciprocal-widget');
    await expect(recipWidget).toBeVisible();

    // Verify interactive preset buttons
    const presetBtn = recipWidget.locator('.sim-recip-preset-btn').nth(1);
    await expect(presetBtn).toBeVisible();
    await presetBtn.click();

    // Click reveal reciprocal button
    const revealBtn = recipWidget.locator('.recip-reveal-btn');
    await expect(revealBtn).toBeVisible();
    await revealBtn.click();

    // Verify flipped card now shows reciprocal fraction
    const flippedCard = recipWidget.locator('.recip-card-flipped');
    await expect(flippedCard).toHaveCSS('opacity', '1');
    await expect(flippedCard.locator('.katex')).toBeVisible();

    // Click verify button to verify product is 1
    const verifyBtn = recipWidget.locator('.recip-verify-btn');
    await expect(verifyBtn).toBeVisible();
    await verifyBtn.click();

    // Verify verification stage is shown
    const verifyStage = recipWidget.locator('.recip-verify-stage');
    await expect(verifyStage).toBeVisible();
    await expect(verifyStage).toContainText('Product is always 1');
  });

  test('can advance across all 17 slides to exit ticket assessment', async ({ page }) => {
    // Slide index 16 is Slide 17 (Exit Ticket)
    await navigateToSlide(page, 16);

    const activeSlide = page.locator('#slideViewport .slide.active');
    await expect(activeSlide.locator('.slide-header h2')).toContainText('Exit Ticket: Dividing Fractions');
    await expect(activeSlide).toContainText('Complete independently in your exercise book');
  });
});
