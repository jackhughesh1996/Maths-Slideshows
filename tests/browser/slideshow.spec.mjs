import { writeFile } from 'node:fs/promises';
import { inspectVisibility, settleSlide, pendingOverflow } from './helpers/visibility.mjs';
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
      const groups = await revealGroups(page);
      if (id === '8F' && lesson.slides[index].workspaceContent?.some((block) => block.type === 'sector-construction')) {
        expect(groups).toEqual([[1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 2]]);
      }
      if (id === '8F' && lesson.slides[index].rightBlocks?.some((block) => block.progressive)) {
        expect(groups).toEqual([[1, 1], [2, 1], [3, 1], [4, 1], [5, 1]]);
      }
      if (id === '8I' && lesson.slides[index].separateSolutions) {
        const table = lesson.slides[index].leftBlocks?.find((block) => block.type === 'table');
        const perGroup = table ? table.rows.length + 2 : 1;
        expect(groups).toEqual([[1, perGroup], [2, perGroup]]);
        await expect(activeSlide.locator('.solution-container .reveal-item')).toHaveCount(0);
      }
      await expect(activeSlide.locator('.reveal-item.is-revealed')).toHaveCount(0);
      let revealedCount = 0;
      for (let step = 0; step < maxReveals && (await next.getAttribute('aria-label')).startsWith('Reveal step '); step++) {
        await next.click();
        revealedCount += groups[step][1];
        await expect(activeSlide.locator('.reveal-item.is-revealed')).toHaveCount(revealedCount);
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

// Each Playwright test gets a fresh browser context/storage. These helpers only
// read rendered output; all state changes go through classroom controls.
const activeSlide = (page) => page.locator('#slideViewport .slide.active');

async function revealGroups(page) {
  return activeSlide(page).locator('.reveal-item').evaluateAll((items) => {
    const explicit = items.some((item) => item.dataset.revealStep !== undefined);
    const counts = new Map();
    items.forEach((item, index) => {
      const step = explicit ? Number(item.dataset.revealStep ?? 1) : index + 1;
      counts.set(step, (counts.get(step) || 0) + 1);
    });
    return [...counts].sort(([a], [b]) => a - b);
  });
}

async function finishReveals(page) {
  const next = page.locator('#btnNextSlide');
  for (const _ of await revealGroups(page)) {
    if (!(await next.getAttribute('aria-label')).startsWith('Reveal step ')) break;
    await next.click();
  }
  await expect(next).toHaveAttribute('aria-label', 'Advance to next slide');
}

async function openLessonAt(page, id, index = 0) {
  const { lesson } = lessons.find((entry) => entry.id === id);
  expect(index).toBeGreaterThanOrEqual(0);
  await openPage(page, `/lessons/${encodeURIComponent(id)}/`);
  for (let current = 0; current < index; current++) {
    await finishReveals(page);
    await page.locator('#btnNextSlide').click();
    await expect(page.locator('#presSlideCounter')).toHaveText(`${current + 2} / ${lesson.slides.length}`);
  }
  return lesson;
}

async function expectRevealState(page, lesson, index, groups, count) {
  await expect(activeSlide(page)).toHaveAttribute('data-slide-index', String(index));
  await expect(page.locator('#presSlideCounter')).toHaveText(`${index + 1} / ${lesson.slides.length}`);
  await expect(activeSlide(page).locator('.reveal-item.is-revealed'))
    .toHaveCount(groups.slice(0, count).reduce((sum, [, size]) => sum + size, 0));
  const indicator = page.locator('#presStepIndicator');
  await expect(indicator.locator('.step-dot')).toHaveCount(groups.length);
  await expect(indicator.locator('.step-dot.filled')).toHaveCount(count);
  const complete = count === groups.length;
  await expect(indicator.locator('.step-text')).toHaveText(count === 0
    ? `${groups.length} reveals` : complete ? 'All shown · → next slide' : `${count} of ${groups.length}`);
  await expect(page.locator('#btnNextSlide')).toHaveAttribute('aria-label', complete
    ? 'Advance to next slide' : `Reveal step ${count + 1} of ${groups.length}`);
  await expect(page.locator('#btnPrevSlide')).toHaveAttribute('aria-label', count
    ? `Step back to step ${count - 1} of ${groups.length}` : 'Go to previous slide');
}

for (const id of ['8E', '8I']) {
  test(`${id}: keyboard reveals, indicators and saved reveal state`, async ({ page }) => {
    const { lesson } = lessons.find((entry) => entry.id === id);
    const index = lesson.slides.findIndex((slide) => id === '8E'
      ? slide.type === 'worked-example' : slide.separateSolutions && slide.leftBlocks?.some((block) => block.type === 'table'));
    await openLessonAt(page, id, index);
    const groups = await revealGroups(page);
    expect(groups.length).toBeGreaterThanOrEqual(2);
    if (id === '8E') expect(groups.length).toBe(lesson.slides[index].steps.length);
    else expect(groups.map(([number]) => number)).toEqual(lesson.slides[index].solution.map((block) => block.revealStep));
    await expectRevealState(page, lesson, index, groups, 0);

    await page.keyboard.press('Space');
    await expectRevealState(page, lesson, index, groups, 1);
    await page.keyboard.press('ArrowRight');
    await expectRevealState(page, lesson, index, groups, 2);
    await page.keyboard.press('ArrowLeft');
    await expectRevealState(page, lesson, index, groups, 1);
    for (let count = 2; count <= groups.length; count++) {
      await page.keyboard.press(count % 2 ? 'Space' : 'ArrowRight');
      await expectRevealState(page, lesson, index, groups, count);
    }
    await page.keyboard.press('ArrowRight');
    await expect(page.locator('#presSlideCounter')).toHaveText(`${index + 2} / ${lesson.slides.length}`);
    await page.keyboard.press('ArrowLeft');
    await expectRevealState(page, lesson, index, groups, groups.length);
    for (let count = groups.length - 1; count >= 0; count--) {
      await page.keyboard.press('ArrowLeft');
      await expectRevealState(page, lesson, index, groups, count);
    }
    await page.keyboard.press('ArrowLeft');
    await expect(activeSlide(page)).toHaveAttribute('data-slide-index', String(index - 1));
    await expect(page.locator('#presSlideCounter')).toHaveText(`${index} / ${lesson.slides.length}`);
  });
}

test('classroom timer configures, ticks, pauses and restores per-slide time', async ({ page }) => {
  const { lesson } = lessons.find(({ id }) => id === '8E');
  const index = lesson.slides.findIndex((slide) => slide.timerMinutes > 0);
  await openLessonAt(page, lesson.id, index);
  const timer = page.locator('#presTimerWidget');
  const display = timer.locator('.timer-time');
  const duration = (seconds) => `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
  await expect(timer).toBeVisible();
  await expect(display).toHaveText(duration(Math.round(lesson.slides[index].timerMinutes * 60)));
  // Freeze only after the lesson has loaded; runFor delivers every interval tick
  // without waiting for classroom minutes or relying on wall-clock boundaries.
  const epoch = new Date('2026-01-01T00:00:00Z');
  await page.clock.install({ time: epoch });
  await page.clock.pauseAt(new Date(epoch.getTime() + 1000));
  await timer.getByRole('button', { name: 'Start Timer', exact: true }).click();
  await page.clock.runFor(3000);
  await expect(display).toHaveText(duration(lesson.slides[index].timerMinutes * 60 - 3));
  await timer.getByRole('button', { name: 'Pause Timer', exact: true }).click();
  await page.clock.runFor(5000);
  await expect(display).toHaveText(duration(lesson.slides[index].timerMinutes * 60 - 3));
  await timer.getByRole('button', { name: 'Reset Timer', exact: true }).click();
  await expect(display).toHaveText(duration(lesson.slides[index].timerMinutes * 60));

  await timer.getByRole('button', { name: 'Configure timer duration', exact: true }).click();
  await timer.getByRole('button', { name: '3 min', exact: true }).click();
  await expect(display).toHaveText('03:00');
  await timer.getByRole('button', { name: 'Configure timer duration', exact: true }).click();
  const input = timer.locator('.timer-custom-input');
  await expect(input).toBeFocused();
  const counter = await page.locator('#presSlideCounter').textContent();
  const revealed = await activeSlide(page).locator('.reveal-item.is-revealed').count();
  for (const key of ['Space', 'ArrowRight', 'ArrowLeft', 'p', 'f']) {
    await input.press(key);
    await expect(page.locator('#presSlideCounter')).toHaveText(counter);
    await expect(activeSlide(page).locator('.reveal-item.is-revealed')).toHaveCount(revealed);
  }
  await expect(page.locator('#btnTogglePen')).not.toHaveClass(/active/);
  expect(await page.evaluate(() => document.fullscreenElement !== null)).toBe(false);
  await input.fill('7');
  await timer.getByRole('button', { name: 'Set', exact: true }).click();
  await expect(display).toHaveText('07:00');
  await finishReveals(page);
  await timer.getByRole('button', { name: 'Start Timer', exact: true }).click();
  await page.clock.runFor(4000);
  await expect(display).toHaveText('06:56');
  await page.locator('#btnNextSlide').click();
  await expect(page.locator('#presSlideCounter')).toHaveText(`${index + 2} / ${lesson.slides.length}`);
  await expect(timer).not.toBeVisible();
  await page.clock.runFor(10000);
  await page.locator('#btnPrevSlide').click();
  await expect(display).toHaveText('06:56');
  await expect(timer.getByRole('button', { name: 'Start Timer', exact: true })).toBeVisible();
  await page.clock.runFor(5000);
  await expect(display).toHaveText('06:56');
  await timer.getByRole('button', { name: 'Reset Timer', exact: true }).click();
  await expect(display).toHaveText('07:00');
});

async function inkPixels(page) {
  return page.locator('#drawingCanvas').evaluate((canvas) => {
    const { data } = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
    const counts = { ink: 0, blue: 0, green: 0 };
    for (let i = 0; i < data.length; i += 4) {
      if (!data[i + 3]) continue;
      counts.ink++;
      if (data[i + 2] > data[i] && data[i + 2] > data[i + 1]) counts.blue++;
      if (data[i + 1] > data[i] && data[i + 1] > data[i + 2]) counts.green++;
    }
    return counts;
  });
}

async function drawStroke(page, yFraction) {
  const canvas = page.locator('#drawingCanvas');
  const box = await canvas.boundingBox();
  expect(box).not.toBeNull();
  await page.mouse.move(box.x + box.width * 0.3, box.y + box.height * yFraction);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.6, box.y + box.height * yFraction, { steps: 8 });
  await page.mouse.up();
}

test('pen controls record coloured strokes and isolate/clear ink per slide', async ({ page }) => {
  await openLessonAt(page, '8E');
  const pen = page.locator('#btnTogglePen');
  await expect.poll(() => inkPixels(page)).toEqual({ ink: 0, blue: 0, green: 0 });
  await pen.click();
  await expect(pen).toHaveClass(/active/);
  await page.keyboard.press('p');
  await expect(pen).not.toHaveClass(/active/);
  await drawStroke(page, 0.4);
  await expect.poll(() => inkPixels(page)).toEqual({ ink: 0, blue: 0, green: 0 });
  await page.keyboard.press('p');
  await expect(pen).toHaveClass(/active/);
  await page.getByTitle('Blue', { exact: true }).click();
  await expect(page.getByTitle('Blue', { exact: true })).toHaveClass(/active/);
  await drawStroke(page, 0.4);
  await expect.poll(async () => (await inkPixels(page)).blue).toBeGreaterThan(0);
  const firstInk = await inkPixels(page);
  await page.locator('#btnNextSlide').click();
  await expect(activeSlide(page)).toHaveAttribute('data-slide-index', '1');
  await expect.poll(() => inkPixels(page)).toEqual({ ink: 0, blue: 0, green: 0 });
  await page.getByTitle('Green', { exact: true }).click();
  await drawStroke(page, 0.6);
  await expect.poll(async () => (await inkPixels(page)).green).toBeGreaterThan(0);
  const secondInk = await inkPixels(page);
  expect(secondInk.blue).toBe(0);
  await page.locator('#btnPrevSlide').click();
  await expect(activeSlide(page)).toHaveAttribute('data-slide-index', '0');
  await expect.poll(() => inkPixels(page)).toEqual(firstInk);
  await page.locator('#btnClearInk').click();
  await expect.poll(() => inkPixels(page)).toEqual({ ink: 0, blue: 0, green: 0 });
  await page.locator('#btnNextSlide').click();
  await expect(activeSlide(page)).toHaveAttribute('data-slide-index', '1');
  await expect.poll(() => inkPixels(page)).toEqual(secondInk);
  await pen.click();
  await expect(pen).not.toHaveClass(/active/);
});

test('teacher tools suspend shortcuts and persist an invented class for picker/teams', async ({ page }) => {
  const lesson = await openLessonAt(page, '8E');
  const tools = page.locator('#btnPresTeacherTools');
  const modal = page.getByRole('dialog', { name: 'Teacher Classroom Tools' });
  await tools.click();
  await expect(modal).toBeVisible();
  await modal.getByRole('button', { name: 'Close', exact: true }).click();
  await expect(modal).not.toBeVisible();
  await tools.click();
  await modal.getByRole('button', { name: '🎲 Random Student', exact: true }).focus();
  for (const key of ['ArrowRight', 'ArrowLeft', 'Space', 'p', 'f']) {
    await page.keyboard.press(key);
    await expect(modal).toBeVisible();
    await expect(page.locator('#presSlideCounter')).toHaveText(`1 / ${lesson.slides.length}`);
  }
  await expect(page.locator('#btnTogglePen')).not.toHaveClass(/active/);
  expect(await page.evaluate(() => document.fullscreenElement !== null)).toBe(false);
  await page.keyboard.press('Escape');
  await expect(modal).not.toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('#presSlideCounter')).toHaveText(`2 / ${lesson.slides.length}`);

  await tools.click();
  await modal.getByRole('button', { name: /Class Lists/ }).click();
  const className = 'Presenter Test Class';
  const names = ['Test Zephyr', 'Test Quasar', 'Test Comet', 'Test Nebula'];
  page.once('dialog', (dialog) => dialog.accept(className));
  await modal.getByRole('button', { name: '+ New Class', exact: true }).click();
  await expect(modal.locator('#inputClassName')).toHaveValue(className);
  const nameInput = modal.locator('#inputClassName');
  await nameInput.fill('Typing');
  await nameInput.press('End');
  for (const key of ['Space', 'p', 'ArrowLeft', 'ArrowRight']) {
    await nameInput.press(key);
    await expect(page.locator('#presSlideCounter')).toHaveText(`2 / ${lesson.slides.length}`);
  }
  await expect(nameInput).toHaveValue('Typing p');
  await nameInput.fill(className);
  await modal.locator('#textareaPasteNames').fill(names.join('\n'));
  await modal.getByRole('button', { name: 'Add to Class', exact: true }).click();
  await expect(modal.locator('.tt-student-pill > span')).toHaveText(names);
  const classSelect = modal.locator('#ttHeaderClassSelect');
  await expect(classSelect.locator('option:checked')).toHaveText(`${className} (${names.length})`);

  await modal.getByRole('button', { name: '🎲 Random Student', exact: true }).click();
  await expect(modal.locator('#ttAvoidRepeats')).toBeChecked();
  const picked = [];
  for (let index = 0; index < names.length; index++) {
    await modal.getByRole('button', { name: '🎲 Pick Random Student', exact: true }).click();
    picked.push(await modal.locator('.tt-picker-name').textContent());
    await expect(modal.locator('#ttPoolCount')).toHaveText(`${names.length - index - 1} of ${names.length} remaining`);
  }
  expect([...picked].sort()).toEqual([...names].sort());
  await modal.getByRole('button', { name: /Team Generator/ }).click();
  await modal.getByRole('button', { name: 'Pairs (2)', exact: true }).click();
  await modal.getByRole('button', { name: '🎲 Generate Teams', exact: true }).click();
  await expect(modal.locator('.tt-team-card')).toHaveCount(2);
  await expect(modal.locator('.tt-team-card-count')).toHaveText(['2', '2']);
  expect((await modal.locator('.tt-team-members li').allTextContents()).sort()).toEqual([...names].sort());

  await modal.getByRole('button', { name: 'Close', exact: true }).click();
  await page.reload();
  await expect(page.locator('.presentation-view')).toBeVisible();
  await tools.click();
  await expect(classSelect.locator('option:checked')).toHaveText(`${className} (${names.length})`);
  await modal.getByRole('button', { name: /Class Lists/ }).click();
  await expect(modal.locator('#inputClassName')).toHaveValue(className);
  await expect(modal.locator('.tt-student-pill > span')).toHaveText(names);
});

test('fullscreen control enters fullscreen and keyboard shortcut leaves it', async ({ page }) => {
  await openLessonAt(page, '8E');
  test.skip(!await page.evaluate(() => document.fullscreenEnabled), 'Fullscreen API unavailable in this runner');
  await page.locator('#btnToggleFullscreen').click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.tagName ?? null)).toBe('HTML');
  await page.keyboard.press('f');
  await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true);
  await expect(page.locator('#presSlideCounter')).toHaveText(`1 / ${lessons.find(({ id }) => id === '8E').lesson.slides.length}`);
});

// Exhaustive classroom audit: every registered slide, every real reveal state.
// A generic card scrollbar is a projection failure, not an exemption. Only the
// two live simulation-history ribbons documented in the helper are informational.
for (const viewport of [{ width: 1920, height: 1080 }, { width: 1366, height: 768 }, { width: 1280, height: 720 }]) {
  for (const { id, lesson } of lessons) {
    test(`${id}: classroom visibility ${viewport.width}x${viewport.height}`, async ({ page }, testInfo) => {
      await page.setViewportSize(viewport);
      await openPage(page, `/lessons/${encodeURIComponent(id)}/`);
      const states = [];
      let screenshotTaken = false;
      for (let index = 0; index < lesson.slides.length; index++) {
        const groups = await revealGroups(page);
        for (let step = 0; step <= groups.length; step++) {
          await expect(activeSlide(page)).toHaveAttribute('data-slide-index', String(index));
          await settleSlide(page);
          const findings = await inspectVisibility(page);
          states.push({ lesson: id, slide: index + 1, resolution: viewport, revealStep: step, revealGroup: step ? groups[step - 1][0] : null, findings });
          const problems = findings.filter((finding) => finding.kind !== 'intentional-history-scroll');
          if (problems.length && !screenshotTaken) {
            await page.screenshot({ path: testInfo.outputPath(`overflow-slide-${index + 1}-step-${step}.png`) });
            screenshotTaken = true;
          }
          if (step < groups.length) await page.locator('#btnNextSlide').click();
        }
        if (index < lesson.slides.length - 1) await page.locator('#btnNextSlide').click();
      }
      await writeFile(testInfo.outputPath('visibility.json'), JSON.stringify(states, null, 2));
      const problems = states.flatMap(({ findings, ...state }) => findings
        .filter((finding) => finding.kind !== 'intentional-history-scroll').map((finding) => ({ ...state, ...finding })));
      const pending = problems.filter((problem) => pendingOverflow(id, problem.slide,
        lesson.slides[problem.slide - 1].title, viewport.width, problem));
      for (const slide of new Set(pending.map((problem) => problem.slide))) {
        const entries = pending.filter((problem) => problem.slide === slide);
        const reason = pendingOverflow(id, slide, lesson.slides[slide - 1].title, viewport.width, entries[0]).reason;
        const message = `${id} slide ${slide}: remaining vertical scroll ${Math.max(...entries.map((entry) => entry.pixels))}px. ${reason}`;
        testInfo.annotations.push({ type: 'known-overflow', description: message });
        console.warn(message);
      }
      const unexpected = process.env.CLASSROOM_VISIBILITY_STRICT ? problems : problems.filter((problem) => !pending.includes(problem));
      expect(unexpected, `${id} ${viewport.width}x${viewport.height}: see visibility.json and overflow screenshot`).toEqual([]);
    });
  }
}

test('visibility detector separates hidden reveals, clipping and live history scrolling', async ({ page }) => {
  const fixture = async (content) => page.setContent(`
    <style>
      * { box-sizing: border-box; } body { margin: 0; font: 16px/20px sans-serif; }
      .pres-stage, .pres-slide-viewport { width: 400px; height: 200px; overflow: hidden; }
      .card { width: 200px; height: 100px; overflow: auto; }
      .reveal-item:not(.is-revealed) { visibility: hidden; }
      p { margin: 0; } .future { height: 220px; display: flex; align-items: end; }
    </style>
    <main class="pres-stage"><div class="pres-slide-viewport"><section class="slide active">${content}</section></div></main>`);
  await fixture('<div class="card"><p>Visible prompt</p><div class="future reveal-item"><p>Future answer</p></div></div>');
  expect(await inspectVisibility(page)).toEqual([]); // Reserved space alone is not clipping visible content.
  await fixture('<div class="card"><p>Visible prompt</p><div class="future reveal-item is-revealed"><p>Revealed answer</p></div></div>');
  expect(await inspectVisibility(page)).toEqual([expect.objectContaining({ kind: 'scroll-required', axis: 'y', text: 'Revealed answer' })]);
  await fixture('<div class="card" style="overflow:hidden"><div class="future"><p>Clipped answer</p></div></div>');
  expect(await inspectVisibility(page)).toEqual([expect.objectContaining({ kind: 'hidden-clipping', axis: 'y' })]);
  await fixture('<p style="position:relative;top:240px">Outside stage</p>');
  expect(await inspectVisibility(page)).toEqual([expect.objectContaining({ kind: 'outside-presentation', axis: 'y' })]);
  for (const className of ['table-container', 'coin-chips-scroll', 'coin-anim-history-strip']) {
    await fixture(`<div class="${className}" style="width:100px;overflow:auto;white-space:nowrap"><span>Long sequence of recorded outcomes or essential table data</span></div>`);
    expect(await inspectVisibility(page)).toEqual([expect.objectContaining({
      kind: className === 'table-container' ? 'scroll-required' : 'intentional-history-scroll', axis: 'x'
    })]);
  }
});


test('pending authoring allowances cannot hide new slides, horizontal clipping or larger regressions', () => {
  const finding = { kind: 'scroll-required', axis: 'y', pixels: 100,
    container: 'div.slide-body:nth-child(2) > div.card.col-third:nth-child(1)' };
  const title = 'You Do: Independent Practice';
  expect(pendingOverflow('8G', 10, title, 1280, finding)).toBeDefined();
  for (const slide of [5, 6]) {
    expect(pendingOverflow('8F', slide, 'I Do: Constructing a Sector Graph', 1280, {
      ...finding, container: 'div.slide-body:nth-child(2) > div.card.col-half:nth-child(2)'
    })).toBeUndefined();
  }
  for (const args of [
    ['8J', 10, title, 1280, finding], ['8G', 11, title, 1280, finding],
    ['8G', 10, 'New lesson content', 1280, finding], ['8G', 10, title, 1920, finding],
    ['8G', 10, title, 1280, { ...finding, axis: 'x' }],
    ['8G', 10, title, 1280, { ...finding, kind: 'hidden-clipping' }],
    ['8G', 10, title, 1280, { ...finding, pixels: 327 }],
    ['8G', 10, title, 1280, { ...finding, container: `${finding.container} > .table-container` }]
  ]) expect(pendingOverflow(...args)).toBeUndefined();
});

test('short-projector simulation layouts keep controls, live results and explanations visible', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openLessonAt(page, '8I', 10);
  await page.locator('.slide.active .btn-add-1000').click();
  await expect(activeSlide(page).locator('.cumul-stats-strip')).toContainText('1000');
  await settleSlide(page);
  expect(await inspectVisibility(page)).toEqual([]);
  await openLessonAt(page, '8G', 11);
  await finishReveals(page);
  await settleSlide(page);
  expect(await inspectVisibility(page)).toEqual([]);
  await activeSlide(page).locator('.btn-sim-draw-10').click();
  await expect(activeSlide(page).locator('.sim-total-draws')).toHaveText('Total draws: 10');
  await settleSlide(page);
  expect(await inspectVisibility(page)).toEqual([]);
});
