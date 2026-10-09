import katex from 'katex';
import lesson8E from '../src/lessons/8E.js';
import lesson8F from '../src/lessons/8F.js';

let totalTested = 0;
let errorsFound = 0;
let warningsFound = 0;

function testLatex(expr, path) {
  if (!expr || typeof expr !== 'string') return;
  const trimmed = expr.trim();
  if (!trimmed) return;
  totalTested++;

  // 1. Check for mismatched braces
  let openCount = 0;
  for (const ch of trimmed) {
    if (ch === '{') openCount++;
    if (ch === '}') openCount--;
  }
  if (openCount !== 0) {
    warningsFound++;
    console.warn(`[Brace Mismatch Warning] in ${path}: unclosed braces (diff: ${openCount})`);
  }

  // 2. Render through KaTeX
  const html = katex.renderToString(trimmed, { throwOnError: false });
  if (html.includes('katex-error') || html.includes('color:#cc0000')) {
    errorsFound++;
    console.error(`[KaTeX Error] in ${path}:`);
    console.error(`  Expression: "${trimmed}"`);
    try {
      katex.renderToString(trimmed, { throwOnError: true });
    } catch (e) {
      console.error(`  KaTeX Message: ${e.message}\n`);
    }
  }
}

function checkText(text, path) {
  if (typeof text !== 'string') return;

  // Extract display math $$...$$
  let remaining = text;
  remaining = remaining.replace(/\$\$([\s\S]+?)\$\$/g, (_, eq) => {
    testLatex(eq, `${path} [display]`);
    return ' ';
  });

  // Extract inline math $...$
  remaining = remaining.replace(/(^|[^\\])\$([^\$]+?)\$/g, (_, prefix, eq) => {
    testLatex(eq, `${path} [inline]`);
    return `${prefix} `;
  });

  // Check if raw LaTeX commands remain outside math delimiters
  const rawCmds = remaining.match(/\\[a-zA-Z]+/g);
  if (rawCmds) {
    const mathCmds = rawCmds.filter(cmd => 
      ['\\frac', '\\times', '\\circ', '\\theta', '\\mathbf', '\\sqrt', '\\leq', '\\geq', '\\cdot'].includes(cmd)
    );
    if (mathCmds.length > 0) {
      warningsFound++;
      console.warn(`[Suspicious Raw LaTeX outside $ in ${path}]:`, mathCmds.join(', '));
      console.warn(`  Context text: "${text.substring(0, 120)}..."\n`);
    }
  }
}

function walk(obj, path = '') {
  if (!obj) return;
  if (typeof obj === 'string') {
    checkText(obj, path);
  } else if (Array.isArray(obj)) {
    obj.forEach((item, idx) => walk(item, `${path}[${idx}]`));
  } else if (typeof obj === 'object') {
    // Dedicated raw LaTeX fields - test directly with KaTeX without requiring $...$
    const rawMathKeys = ['latex', 'checkMath', 'fraction', 'calculation'];
    for (const key of rawMathKeys) {
      if (obj[key] && typeof obj[key] === 'string') {
        testLatex(obj[key], `${path}.${key}`);
      }
    }

    for (const key of Object.keys(obj)) {
      if (!rawMathKeys.includes(key)) {
        walk(obj[key], `${path}.${key}`);
      }
    }
  }
}

console.log('=== AUDITING LESSON 8E ===');
walk(lesson8E, '8E');

console.log('=== AUDITING LESSON 8F ===');
walk(lesson8F, '8F');

console.log(`\nAudit complete: Tested ${totalTested} expressions. Found ${errorsFound} errors, ${warningsFound} warnings.\n`);
