/**
 * @file math.js
 * Shared KaTeX mathematics renderer for the slideshow framework.
 * Self-contained using npm 'katex' package (bundled by Vite, no CDNs).
 */

import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * Escape HTML characters to prevent XSS.
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Render LaTeX formula to HTML string using KaTeX.
 * Gracefully handles malformed formulas without crashing.
 *
 * @param {string} latex - Raw LaTeX string
 * @param {Object} options
 * @param {boolean} [options.display=false] - Whether to render in display (block) mode
 * @returns {string} HTML string
 */
export function renderMath(latex, { display = false } = {}) {
  if (!latex || typeof latex !== 'string') return '';
  const trimmed = latex.trim();
  if (!trimmed) return '';

  try {
    const html = katex.renderToString(trimmed, {
      displayMode: Boolean(display),
      throwOnError: false, // Prevents throwing on unrecognized commands
      output: 'html',
      strict: false,
    });

    // Detect when throwOnError: false silently emitted KaTeX red error markup
    if (html.includes('katex-error')) {
      console.warn(`[KaTeX warning] Invalid expression:\n${trimmed}`);
    }

    return html;
  } catch (err) {
    console.warn(`[KaTeX warning] Invalid expression:\n${trimmed}`, err);
    return `<span class="math-error" title="KaTeX rendering error: ${escapeHtml(err.message)}">${escapeHtml(latex)}</span>`;
  }
}

/**
 * Parse a text string and safely render KaTeX mathematics, safe markdown formatting,
 * and line breaks while escaping ordinary HTML to prevent XSS and formatting drift.
 *
 * Supported syntax:
 * - Display math: $$...$$
 * - Inline math: $...$
 * - Bold: **text**
 * - Italic: *text*
 * - Bold & Italic: ***text***
 * - Inline code: `text`
 * - Line break: \n
 *
 * Ordinary HTML (<, >, &, ", ') is escaped.
 *
 * @param {string} text - Text containing math and formatting
 * @returns {string} Safe HTML string with rendered math and formatting
 */
export function renderRichText(text) {
  if (text == null || typeof text !== 'string') return '';
  if (!text.trim()) return '';

  const placeholders = [];
  const storeToken = (html) => {
    const id = placeholders.length;
    placeholders.push(html);
    return `\x02TOKEN_${id}\x03`;
  };

  let str = text;

  // 1. Extract display math $$...$$
  str = str.replace(/\$\$([\s\S]+?)\$\$/g, (_, equation) => {
    return storeToken(renderMath(equation, { display: true }));
  });

  // 2. Extract inline math $...$ (ignoring escaped \$)
  str = str.replace(/(^|[^\\])\$([^\$]+?)\$/g, (_, prefix, equation) => {
    return prefix + storeToken(renderMath(equation, { display: false }));
  });
  str = str.replace(/\\\$/g, '$');

  // 3. Extract inline code `...`
  str = str.replace(/`([^`\r\n]+)`/g, (_, code) => {
    return storeToken(`<code class="inline-code">${escapeHtml(code)}</code>`);
  });

  // 4. Escape ordinary HTML in the remaining text
  str = escapeHtml(str);

  // 5. Safe Markdown formatting on escaped text
  // Bold & Italic: ***text***
  str = str.replace(/\*\*\*([^\*\n]+?)\*\*\*/g, '<strong><em>$1</em></strong>');
  // Bold: **text**
  str = str.replace(/\*\*([^\*\n]+?)\*\*/g, '<strong>$1</strong>');
  // Italic: *text* (using lookaround to avoid matching inside ** or bullet points)
  str = str.replace(/(?<!\*)\*([^\*\n]+?)\*(?!\*)/g, '<em>$1</em>');

  // 6. Convert newlines \r\n, \n and literal \n to <br>
  str = str.replace(/\r?\n/g, '<br>');
  str = str.replace(/\\n/g, '<br>');

  // 7. Restore placeholders (math and code)
  str = str.replace(/\x02TOKEN_(\d+)\x03/g, (_, id) => {
    return placeholders[Number(id)] || '';
  });

  return str;
}

/**
 * Backward-compatible alias for renderRichText.
 */
export const renderMathInText = renderRichText;

