import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, mkdtemp, mkdir, writeFile, symlink, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { scanMathText, checkMathText, auditLessonMath, formatMathIssue } from '../src/slideshow/mathExpressions.js';
import { validateLesson } from '../src/slideshow/validator.js';
import { lessonManifest } from '../src/lessons/manifest.js';

let mathSource = await readFile(new URL('../src/slideshow/math.js', import.meta.url), 'utf8');
mathSource = mathSource
  .replace("from 'katex'", `from ${JSON.stringify(import.meta.resolve('katex'))}`)
  .replace("from './mathExpressions.js'", `from ${JSON.stringify(import.meta.resolve('../src/slideshow/mathExpressions.js'))}`)
  .replace("import 'katex/dist/katex.min.css';", '');
const { renderRichText, renderMath } = await import(`data:text/javascript;base64,${Buffer.from(mathSource).toString('base64')}`);

const mathTokens = (text) => scanMathText(text).tokens.filter((token) => token.type === 'math');

test('shared detection handles inline, display, adjacent and multiline expressions', () => {
  const text = String.raw`Inline $x=1$, adjacent $y=2$$$z=3$$ and $\frac{1}{2}$`;
  assert.equal(scanMathText(text).issues.length, 0);
  assert.equal(mathTokens(text).length, 4);
  assert.deepEqual(mathTokens('$x$$y$').map((token) => token.value), ['x', 'y']);
  const valid = 'Inline $x=1$, $y=2$ and $$z=3$$\n$$x +\ny = 2$$';
  assert.deepEqual(mathTokens(valid).map(({ value, display }) => [value, display]),
    [['x=1', false], ['y=2', false], ['z=3', true], ['x +\ny = 2', true]]);
  assert.equal(checkMathText(valid).issues.length, 0);
  assert.equal(checkMathText(valid).expressions, 4);
  const html = renderRichText(valid);
  assert.equal((html.match(/class="katex"/g) || []).length, 4);
  assert.equal((html.match(/class="katex-display"/g) || []).length, 2);
});

test('escaped dollars, escaped backslashes, currency and ordinary prose are not formulas', () => {
  for (const text of [
    'Prices are $5 and $10.25, or $1,000.00 total.', '$5 + $10 costs $15.', '$5 + tax; $10 - each.', 'The dollar symbol ($).',
    String.raw`Escaped \$5 and \$x are literal; \\frac is not a command.`,
    String.raw`Windows C:\temp\notes and C:\frac\file; ordinary \n and \hello.`,
    'Code: `$unclosed and \\frac{1}{2}`',
    'A normal sentence with **bold**, 50%, and no equations.'
  ]) {
    assert.equal(checkMathText(text).issues.length, 0, text);
    assert.equal(mathTokens(text).length, 0, text);
  }
  assert.equal(renderRichText('Cost $5 and $10.'), 'Cost $5 and $10.');
  assert.equal(renderRichText(String.raw`Pay \$5.`), 'Pay $5.');
  const code = renderRichText('Code: `$unclosed and \\frac{1}{2}`');
  assert.ok(code.includes('<code class="inline-code">$unclosed and \\frac{1}{2}</code>'));
});

test('numeric formulas and escaped dollars inside math retain valid rendering', () => {
  for (const text of [
    '$25$', '$10n$', '$0, 0.5, 1$', '$52 - 12 = 40$', String.raw`$20 \times 25 = 500$`,
    String.raw`$0.\dot{3} \approx 0.333$`, String.raw`$0 \le \text{Pr} \le 1$`,
    String.raw`$\text{Cost: }\$5$`, String.raw`$$\{x\} = \frac{1}{2}$$`,
    String.raw`A literal pair of backslashes \\$x=1$`
  ]) {
    assert.equal(checkMathText(text).issues.length, 0, text);
    assert.equal(mathTokens(text).length, 1, text);
    assert.match(renderRichText(text), /class="katex"/);
  }
});

test('malformed delimiters and invalid KaTeX produce actionable diagnostics', () => {
  for (const text of ['$x', 'x$', '$2 + 3', String.raw`$0 \times 2`, '$$x$', '$x$$', '$$x', '$ $', '$$$$', String.raw`$\frac{1}{$`, String.raw`$\unknownMathCommand{x}$`]) {
    const result = checkMathText(text);
    assert.ok(result.issues.length > 0, text);
    assert.ok(result.issues.every((issue) => typeof issue.offset === 'number' && issue.message.length > 0));
  }
});

test('mathematical commands outside delimiters are errors, not silent audit warnings', () => {
  for (const command of ['frac', 'sqrt', 'times', 'sin', 'sum', 'le', 'mathbb']) {
    const text = `Compute \\${command}{x} here.`;
    assert.ok(checkMathText(text).issues.some((issue) => issue.message.includes('outside math delimiters')), command);
    assert.equal(checkMathText(`Use $\\${command}{x}{2}$`).issues.length, 0, command);
  }
});

test('raw-LaTeX fields use KaTeX directly and numeric fractions are not coerced to text', () => {
  for (const field of ['latex', 'checkMath', 'calculation', 'fraction']) {
    const valid = auditLessonMath({ id: 'RAW', slides: [{ content: [{ [field]: String.raw`\frac{1}{2}` }] }] });
    assert.equal(valid.expressions, 1);
    assert.deepEqual(valid.issues, []);
    const invalid = auditLessonMath({ id: 'RAW', slides: [{ content: [{ [field]: String.raw`\frac{1}{` }] }] });
    assert.equal(invalid.issues.length, 1);
    assert.equal(invalid.issues[0].path, `lesson.slides[0].content[0].${field}`);
  }
  assert.equal(auditLessonMath({ id: 'RAW', slides: [{ fraction: 0 }] }).expressions, 0);
  assert.equal(checkMathText(String.raw`\text{literal \{ braces \}}`, { raw: true }).issues.length, 0);
});

test('lesson validation and auditing share nested paths, lesson ID and slide index', () => {
  const lesson = { id: 'NESTED-MATH', title: 'Test', slides: [{ type: 'notes', content: [
    { type: 'solution', blocks: [{ type: 'paragraph', text: String.raw`Broken $\frac{1}{$` }] }
  ] }] };
  const audit = auditLessonMath(lesson);
  assert.equal(audit.issues.length, 1);
  const issue = audit.issues[0];
  assert.equal(issue.lessonId, lesson.id);
  assert.equal(issue.slideIndex, 0);
  assert.equal(issue.path, 'lesson.slides[0].content[0].blocks[0].text');
  const validation = validateLesson(lesson, { silent: true });
  assert.equal(validation.valid, false);
  assert.ok(validation.errors.includes(formatMathIssue(issue)));
  assert.match(formatMathIssue(issue), /NESTED-MATH.*Slide 1.*blocks\[0\].text.*offset/);
});

test('rich-text formatting, escaping and raw math rendering remain intact', () => {
  const html = renderRichText('**Bold** ***both*** *italic* `a < b` <script> & $x<2$\nNext');
  for (const part of ['<strong>Bold</strong>', '<strong><em>both</em></strong>', '<em>italic</em>',
    '<code class="inline-code">a &lt; b</code>', '&lt;script&gt; &amp;', 'class="katex"', '<br>Next']) {
    assert.ok(html.includes(part), part);
  }
  assert.doesNotMatch(html, /<script>/);
  assert.match(renderMath(String.raw`\frac{1}{2}`, { display: true }), /class="katex-display"/);
});

test('all manifest lessons are audited and validate without math errors', async () => {
  assert.ok(lessonManifest.length > 0);
  let total = 0;
  for (const { id, path } of lessonManifest) {
    const { default: lesson } = await import(new URL(path, new URL('../src/lessons/', import.meta.url)));
    const result = auditLessonMath(lesson);
    assert.equal(lesson.id, id);
    assert.ok(result.expressions > 0, `${id} must exercise mathematics`);
    assert.deepEqual(result.issues, [], result.issues.map(formatMathIssue).join('\n'));
    assert.equal(validateLesson(lesson, { silent: true }).valid, true, id);
    total += result.expressions;
  }
  assert.ok(total > 0);
});

test('audit CLI follows its manifest and exits nonzero for invalid math', async () => {
  const root = await mkdtemp(join(tmpdir(), 'slideshow-math-audit-'));
  try {
    await mkdir(join(root, 'scripts'), { recursive: true });
    await mkdir(join(root, 'src/slideshow'), { recursive: true });
    await mkdir(join(root, 'src/lessons'), { recursive: true });
    await writeFile(join(root, 'package.json'), '{"type":"module"}');
    await symlink(fileURLToPath(new URL('../node_modules', import.meta.url)), join(root, 'node_modules'), 'dir');
    for (const name of ['scripts/audit-math.js', 'src/slideshow/mathExpressions.js']) {
      await writeFile(join(root, name), await readFile(new URL(`../${name}`, import.meta.url)));
    }
    await writeFile(join(root, 'src/lessons/manifest.js'), `export const lessonManifest = [
      { id: 'FIRST', path: './first.js' }, { id: 'SECOND', path: './second.js' }
    ];`);
    const first = { id: 'FIRST', slides: [{ text: '$x=1$' }] };
    const second = { id: 'SECOND', slides: [{ text: '$y=2$' }] };
    const saveSecond = () => writeFile(join(root, 'src/lessons/second.js'), `export default ${JSON.stringify(second)};`);
    await writeFile(join(root, 'src/lessons/first.js'), `export default ${JSON.stringify(first)};`);
    await saveSecond();
    let run = spawnSync(process.execPath, ['scripts/audit-math.js'], { cwd: root, encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    assert.match(run.stdout, /2 lessons, 2 expressions, 0 errors/);
    second.slides[0].text = String.raw`$\badCommand$`;
    await saveSecond();
    run = spawnSync(process.execPath, ['scripts/audit-math.js'], { cwd: root, encoding: 'utf8' });
    assert.equal(run.status, 1);
    assert.match(run.stderr, /SECOND.*Slide 1.*lesson.slides\[0\].text.*Invalid KaTeX/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('graph check fields follow their raw-versus-rich rendering conventions', () => {
  for (const type of ['measured-bar', 'divided-bar']) {
    for (const key of ['check', 'checkSum']) {
      const result = auditLessonMath({ id: 'CHECK', slides: [{ content: [{ type,
        [key]: String.raw`\unknownCommand + 1 = 2` }] }] });
      assert.equal(result.issues.length, 1);
      assert.match(result.issues[0].message, /Invalid KaTeX/);
      assert.equal(auditLessonMath({ id: 'CHECK', slides: [{ content: [{ type,
        [key]: 'Length is $x=1$' }] }] }).issues.length, 0);
    }
  }
  const unwrapped = auditLessonMath({ id: 'CHECK', slides: [{ content: [{ type: 'measured-bar',
    check: String.raw`\frac{1}{2}` }] }] });
  assert.ok(unwrapped.issues.some((issue) => issue.message.includes('outside math delimiters')));
});
