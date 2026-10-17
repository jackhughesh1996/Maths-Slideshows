/** Shared, browser/Node-safe math detection and diagnostics (no CSS or DOM). */
import katex from 'katex';

export const MATH_OPTIONS = Object.freeze({ output: 'html', strict: false });
const RAW_FIELDS = new Set(['latex', 'checkMath', 'calculation', 'fraction']);
// Deliberately mathematical commands: ordinary backslash text and file paths
// are not LaTeX merely because they contain a backslash.
const MATH_COMMAND = /\\(?:frac|dfrac|tfrac|sqrt|times|cdot|div|circ|theta|alpha|beta|gamma|pi|sum|prod|int|infty|sin|cos|tan|log|ln|exp|le|ge|ne|leq|geq|neq|approx|implies|rightarrow|left|right|begin|end|binom|overline|underline|underbrace|overbrace|dot|ddot|pm|in|notin|cup|cap|subset|ldots|cdots|displaystyle|operatorname|mathbf|mathrm|mathbb|mathcal|text|Pr)\b/g;

function isEscaped(text, index) {
  let count = 0;
  while (index > 0 && text[--index] === '\\') count++;
  return count % 2 === 1;
}

function nextDollar(text, from) {
  for (let index = from; index < text.length; index++) {
    if (text[index] === '$' && !isEscaped(text, index)) return index;
  }
  return -1;
}

function currencyEnd(text, index) {
  const amount = /^\$\d[\d,]*(?:\.\d+)?/.exec(text.slice(index));
  if (!amount) return -1;
  const end = index + amount[0].length;
  if (text[end] === '$' || /[A-Za-z\\_^/]/.test(text[end] || ' ') || text.slice(end, end + 2) === '.\\') return -1;
  // Numeric formulas are math even when their closing delimiter is missing.
  // Prices such as "$5 and $10", "$5 + $10" and "$5 + tax" stay prose.
  const rest = text.slice(end);
  const close = nextDollar(text, end);
  // A balanced closing dollar also disambiguates numeric lists such as
  // $0, 0.5, 1$. A dollar before another price is an opener, not a closer.
  if (close >= 0 && /\S/.test(text[close - 1]) && !/\d/.test(text[close + 1] || '')) return -1;
  if (/^\s*\\[A-Za-z]/.test(rest) ||
      /^\s*[+*=<>-]\s*(?:[\d{\\]|[A-Za-z](?![A-Za-z]))/.test(rest)) return -1;
  return end;
}

/** Tokens retain offsets so rendering and diagnostics use exactly the same spans. */
export function scanMathText(text) {
  const tokens = [];
  const issues = [];
  let plainStart = 0;
  let index = 0;
  const emit = (type, start, end, value, display = false) => {
    if (start > plainStart) tokens.push({ type: 'text', value: text.slice(plainStart, start), start: plainStart, end: start });
    tokens.push({ type, value, start, end, display });
    plainStart = end;
    index = end;
  };
  while (index < text.length) {
    if (text[index] === '`' && !isEscaped(text, index)) {
      const end = text.indexOf('`', index + 1);
      if (end > index + 1 && !/[\r\n]/.test(text.slice(index + 1, end))) {
        emit('code', index, end + 1, text.slice(index + 1, end));
        continue;
      }
    }
    if (text[index] !== '$' || isEscaped(text, index)) { index++; continue; }
    const display = text[index + 1] === '$';
    const width = display ? 2 : 1;
    if (!display) {
      const end = currencyEnd(text, index);
      if (end >= 0) { index = end; continue; }
    }
    const end = nextDollar(text, index + width);
    if (end < 0) {
      // A bare currency symbol in prose is not an incomplete formula.
      if (display || /[\w\\{]/.test(text[index + width] || '') || /[\w}$]/.test(text[index - 1] || '')) {
        issues.push({ offset: index, message: `Unclosed ${display ? 'display ($$)' : 'inline ($)'} math delimiter.` });
      }
      index += width;
      continue;
    }
    const closingWidth = display && text[end + 1] === '$' ? 2 : 1;
    const expression = text.slice(index + width, end);
    if (closingWidth !== width || !expression.trim()) {
      issues.push({ offset: index, message: closingWidth !== width ? 'Mismatched inline/display math delimiters.' : 'Empty math expression.' });
      index = end + closingWidth;
      continue;
    }
    emit('math', index, end + width, expression, display);
  }
  if (plainStart < text.length) tokens.push({ type: 'text', value: text.slice(plainStart), start: plainStart, end: text.length });
  for (const token of tokens) {
    if (token.type !== 'text') continue;
    for (const match of token.value.matchAll(MATH_COMMAND)) {
      if (isEscaped(token.value, match.index)) continue;
      // Do not treat an ordinary Windows path as a mathematical command.
      const word = token.value.slice(0, match.index).split(/\s/).at(-1);
      if (/^[A-Za-z]:(?:\\|$)/.test(word) || word.startsWith('\\\\')) continue;
      issues.push({ offset: token.start + match.index, message: `Mathematical command ${match[0]} outside math delimiters; use $...$ or a raw-LaTeX field.` });
    }
  }
  return { tokens, issues };
}

export function unescapeDollarSigns(text) {
  return text.replace(/(\\+)\$/g, (_, slashes) => (slashes.length % 2 ? slashes.slice(0, -1) : slashes) + '$');
}

export function checkMathText(text, { raw = false } = {}) {
  if (typeof text !== 'string' || !text.trim()) return { expressions: 0, issues: [] };
  const scanned = raw ? { tokens: [{ type: 'math', value: text, start: 0, display: false }], issues: [] } : scanMathText(text);
  const issues = [...scanned.issues];
  let expressions = 0;
  for (const token of scanned.tokens) {
    if (token.type !== 'math') continue;
    expressions++;
    try {
      katex.renderToString(token.value.trim(), { ...MATH_OPTIONS, displayMode: token.display, throwOnError: true });
    } catch (error) {
      issues.push({ offset: token.start, message: `Invalid KaTeX expression ${JSON.stringify(token.value)}: ${error.message}` });
    }
  }
  return { expressions, issues };
}

/** Audit nested lesson data once, preserving lesson/slide/property context. */
export function auditLessonMath(lesson) {
  const issues = [];
  let expressions = 0;
  function walk(value, path, key, slideIndex, parent) {
    if (typeof value === 'string') {
      const barCheck = ['measured-bar', 'divided-bar'].includes(parent?.type) &&
        (key === 'check' || key === 'checkSum') && !value.includes('$') && /\\text|[+=]/.test(value);
      const raw = RAW_FIELDS.has(key) || barCheck || (key === 'check' && parent?.type === 'sector-construction');
      const result = checkMathText(value, { raw });
      expressions += result.expressions;
      issues.push(...result.issues.map((issue) => ({ ...issue, lessonId: lesson.id, slideIndex, path })));
    } else if (Array.isArray(value)) {
      value.forEach((child, index) => walk(child, `${path}[${index}]`, '', key === 'slides' ? index : slideIndex, value));
    } else if (value && typeof value === 'object') {
      for (const [childKey, child] of Object.entries(value)) {
        walk(child, `${path}.${childKey}`, childKey, slideIndex, value);
      }
    }
  }
  walk(lesson, 'lesson', '', undefined, null);
  return { expressions, issues };
}

export function formatMathIssue(issue) {
  const slide = issue.slideIndex === undefined ? '' : ` Slide ${issue.slideIndex + 1}`;
  return `[MathValidation: ${issue.lessonId}]${slide} [${issue.path}] offset ${issue.offset}: ${issue.message}`;
}
