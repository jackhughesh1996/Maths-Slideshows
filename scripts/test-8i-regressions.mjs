import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';

// Run the production maths renderer in Node, omitting its browser-only CSS import.
const mathUrl = new URL('../src/slideshow/math.js', import.meta.url);
let mathSource = await readFile(mathUrl, 'utf8');
mathSource = mathSource.replace("import katex from 'katex';", `import katex from ${JSON.stringify(import.meta.resolve('katex'))};`)
  .replace("from './mathExpressions.js'", `from ${JSON.stringify(import.meta.resolve('../src/slideshow/mathExpressions.js'))}`)
  .replace("import 'katex/dist/katex.min.css';", '');
const asModule = (source) => `data:text/javascript;base64,${Buffer.from(source).toString('base64')}`;
let source = await readFile(new URL('../src/slideshow/experimentalSimulations.js', import.meta.url), 'utf8');
source = source.replace("'./math.js'", JSON.stringify(asModule(mathSource)));
const { coinExperimentStore: store, CoinClassSimulation, CoinSummaryWidget, CumulativeCoinSimulation } = await import(asModule(source));
const emptyElement = { querySelector: () => null };

test('summary preserves HTML structure and renders real KaTeX in populated state', () => {
  store.resetAll();
  const mount = { innerHTML: '' };
  const widget = new CoinSummaryWidget({ querySelector: () => mount }, {});
  assert.match(mount.innerHTML, /<h4[^>]*>No Class Experiment Run Yet/);
  assert.doesNotMatch(mount.innerHTML, /&lt;(?:div|table|h4)/);
  store.runStudent();
  assert.match(mount.innerHTML, /<table\b/);
  assert.match(mount.innerHTML, /class="katex"/);
  assert.doesNotMatch(mount.innerHTML, /katex-error|&lt;table|\$\\frac/);
  widget.destroy();
});

test('initialisation stays empty and graph totals agree after explicit actions', () => {
  store.resetAll();
  store.classSize = 25;
  const graph = new CumulativeCoinSimulation(emptyElement, {});
  assert.equal(store.getPooledTotalTosses(), 0);
  store.addExtraTosses(10);
  assert.equal(store.getPooledTotalTosses(), 10);
  store.resetAll();
  store.runStudent();
  store.runClass();
  store.addExtraTosses(100);
  assert.equal(store.getPooledTotalTosses(), 600);
  assert.deepEqual(store.cumulativeHistory.at(-1), { n: 600, pr: store.getPooledTotalHeads() / 600 });
  store.showExpected = true;
  store.setClassSize(24);
  assert.equal(store.getPooledTotalTosses(), 0);
  assert.equal(store.showExpected, false);
  assert.deepEqual(store.cumulativeHistory, []);
  graph.destroy();
});

test('cancelled callbacks cannot commit a later animation; navigation commits once', () => {
  const originals = { setInterval, clearInterval, setTimeout, clearTimeout };
  const intervals = new Map(), completions = new Map(), cancelled = new Set();
  let id = 0;
  globalThis.setInterval = (fn) => { intervals.set(++id, fn); return id; };
  globalThis.clearInterval = (handle) => intervals.delete(handle);
  globalThis.setTimeout = (fn) => { completions.set(++id, fn); return id; };
  globalThis.clearTimeout = (handle) => cancelled.add(handle);
  let widget;
  try {
    store.resetAll();
    widget = new CoinClassSimulation(emptyElement, {});
    widget.runOneStudentAnimated();
    const first = widget.activeAnimation;
    const firstTick = intervals.get(first.timerId);
    for (let i = 0; i < 20; i++) firstTick();
    const oldCompletion = completions.get(first.completionTimerId);
    widget.handleReset();
    assert.ok(cancelled.has(first.completionTimerId));
    widget.runOneStudentAnimated();
    const second = widget.activeAnimation;
    oldCompletion();
    firstTick(); // Simulate an already-queued interval from the previous run.
    assert.equal(widget.activeAnimation, second);
    assert.equal(second.tossIndex, 0);
    assert.equal(store.students.length, 0);
    widget.runOneStudentAnimated();
    assert.equal(widget.activeAnimation, second);
    const secondTick = intervals.get(second.timerId);
    for (let i = 0; i < 20; i++) secondTick();
    const secondCompletion = completions.get(second.completionTimerId);
    widget.onSlideChange();
    secondCompletion();
    assert.equal(store.students.length, 1);
    assert.equal(store.getTotalClassTosses(), 20);
    assert.equal(store.students[0].heads, second.finalHeads);
    widget.runOneStudentAnimated();
    widget.handleReset();
    assert.equal(store.getPooledTotalTosses(), 0);
    assert.equal(widget.activeAnimation, null);
  } finally {
    widget?.destroy();
    Object.assign(globalThis, originals);
  }
});
