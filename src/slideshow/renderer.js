/**
 * @file renderer.js
 * Renders structured lesson data into semantic HTML elements.
 * Generates SVG sector graphs, divided bar graphs, and stem-and-leaf plots.
 * Infers progressive reveal sequence automatically without manual author indices.
 */

import { renderMath, renderMathInText, escapeHtml } from './math.js';
import { normalizeSlideType } from './slideTypes.js';
import { normalizeBlockType } from './blockTypes.js';
import { renderSimulationBlock } from './simulationMarkup.js';
import {
  renderStemAndLeafBlock,
  renderSectorGraphBlock,
  renderSectorConstructionBlock,
  renderMeasuredBarBlock
} from './graphMarkup.js';
import {
  renderTitleSlide,
  renderLearningSlide,
  renderDoNowSlide,
  renderNotesSlide,
  renderWorkedExampleSlide,
  renderBoardTaskSlide,
  renderComparisonSlide,
  renderPracticeSlide,
  renderExitTicketSlide,
  renderSummarySlide,
  renderSolutionContent
} from './slideMarkup.js';

/**
 * Render a single content block into HTML string.
 * @param {Object} block
 * @returns {string}
 */
export function renderBlock(block) {
  if (!block || typeof block !== 'object') return '';

  // These containers have their own reveal semantics (or no outer element).
  // Keep their existing handling separate from ordinary block reveals.
  const canonicalType = normalizeBlockType(block);
  const supportsNumberedReveal = !['sector-construction', 'board-workspace'].includes(canonicalType);
  const hasStep = supportsNumberedReveal && block.revealStep !== undefined;
  const revealClass = block.reveal || hasStep || (canonicalType === 'solution' && block.reveal === undefined)
    ? 'reveal-item' : '';
  const html = renderBlockHtml(block, revealClass);
  // Decorate the existing root, including roots returned by graph/simulation
  // helpers. Never introduce another reveal wrapper around their markup.
  return hasStep
    ? html.replace(/^(\s*<[a-z][^>]*)(>)/i, `$1 data-reveal-step="${escapeHtml(String(block.revealStep))}"$2`)
    : html;
}

function renderBlockHtml(block, revealClass) {
  switch (normalizeBlockType(block)) {
    case 'heading': {
      const level = block.level || 3;
      const tag = `h${Math.min(6, Math.max(1, level))}`;
      return `<${tag} class="block-heading ${revealClass}">${renderMathInText(block.text || '')}</${tag}>`;
    }

    case 'paragraph': {
      return `<p class="block-paragraph ${revealClass}">${renderMathInText(block.text || '')}</p>`;
    }

    case 'bullet-list': {
      const items = (block.items || [])
        .map((item) => `<li>${renderMathInText(typeof item === 'number' ? String(item) : item)}</li>`)
        .join('');
      return `<ul class="block-list ${revealClass}" style="margin-left: 20px; line-height: 1.6; margin-top: 6px;">${items}</ul>`;
    }

    case 'ordered-list': {
      const items = (block.items || [])
        .map((item) => `<li>${renderMathInText(typeof item === 'number' ? String(item) : item)}</li>`)
        .join('');
      return `<ol class="block-list ${revealClass}" style="margin-left: 20px; line-height: 1.6; margin-top: 6px;">${items}</ol>`;
    }

    case 'note-box': {
      const variant = block.variant || 'default'; // 'default', 'alert', 'gold', 'green'
      const title = block.title ? `<h4>${renderMathInText(block.title)}</h4>` : '';
      const banner = block.copyToWorkbook ? `<span class="copy-badge">✍️ Copy into Workbook</span>` : '';
      return `
        <div class="note-box ${variant} ${revealClass}">
          ${banner}
          ${title}
          <div class="note-box-content">${renderMathInText(block.text || '')}</div>
        </div>
      `;
    }

    case 'raw-data': {
      return `
        <div class="raw-data-strip ${revealClass}">
          ${escapeHtml(block.data || '')}
        </div>
      `;
    }

    case 'formula': {
      return `
        <div class="formula-block ${revealClass}">
          ${renderMath(block.latex || '', { display: true })}
        </div>
      `;
    }

    case 'table': {
      const headers = (block.headers || [])
        .map((h) => {
          if (h && typeof h === 'object') {
            const revClass = h.reveal || h.revealStep !== undefined ? ' class="reveal-item"' : '';
            const stepAttr = h.revealStep !== undefined ? ` data-reveal-step="${h.revealStep}"` : '';
            const hText = (h.text !== undefined && h.text !== null) ? String(h.text) : '';
            return `<th><span${revClass}${stepAttr}>${renderMathInText(hText)}</span></th>`;
          }
          return `<th>${renderMathInText(String(h))}</th>`;
        })
        .join('');
      const rows = (block.rows || [])
        .map((row) => {
          const cells = row
            .map((c) => {
              if (c && typeof c === 'object') {
                const revClass = c.reveal || c.revealStep !== undefined ? ' class="reveal-item"' : '';
                const stepAttr = c.revealStep !== undefined ? ` data-reveal-step="${c.revealStep}"` : '';
                const cText = (c.text !== undefined && c.text !== null) ? String(c.text) : '';
                return `<td><span${revClass}${stepAttr}>${renderMathInText(cText)}</span></td>`;
              }
              return `<td>${renderMathInText(String(c))}</td>`;
            })
            .join('');
          return `<tr>${cells}</tr>`;
        })
        .join('');
      const tableClasses = ['math-table'];
      if (block.compact) tableClasses.push('compact-table');
      if (block.className) tableClasses.push(escapeHtml(block.className));
      return `
        <div class="table-container ${revealClass}">
          <table class="${tableClasses.join(' ')}">
            <thead><tr>${headers}</tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      `;
    }

    case 'stem-and-leaf': {
      return renderStemAndLeafBlock(block, revealClass);
    }

    case 'sector-graph': {
      return renderSectorGraphBlock(block, revealClass);
    }

    case 'sector-construction': {
      return renderSectorConstructionBlock(block, revealClass, renderBlocks);
    }

    case 'measured-bar': {
      return renderMeasuredBarBlock(block, revealClass);
    }

    case 'board-workspace': {
      // Deprecated interactive workspace: render inner content directly without blank/dotted frame
      return block.content ? renderBlocks(block.content) : '';
    }

    case 'solution': {
      // Solutions are always progressive reveal items by default
      return `
        <div class="solution-container ${revealClass}">
          <span class="solution-badge">✔ ${escapeHtml(block.title || 'Model Solution')}</span>
          <div class="solution-content">
            ${renderSolutionContent(block, renderBlocks)}
          </div>
        </div>
      `;
    }

    case 'simulation': {
      return renderSimulationBlock(block, revealClass);
    }

    default:
      return `<div class="${revealClass}">${renderMathInText(block.text || '')}</div>`;
  }
}

/**
 * Render multiple content blocks.
 * @param {Array<Object>} blocks
 * @returns {string}
 */
export function renderBlocks(blocks) {
  if (!Array.isArray(blocks)) return '';
  return blocks.map(renderBlock).join('');
}

/**
 * Render a complete slide into DOM Element.
 * @param {Object} slide - Slide data model
 * @param {number} index - Slide index
 * @returns {HTMLElement}
 */
export function renderSlide(slide, index) {
  const section = document.createElement('section');
  section.className = `slide ${index === 0 ? 'active' : ''}`;
  section.id = `slide-${index + 1}`;
  section.dataset.slideIndex = String(index);

  if (slide.timerMinutes) {
    section.dataset.timerMinutes = String(slide.timerMinutes);
  }

  const rawType = slide.type || 'notes';
  const canonicalType = normalizeSlideType(rawType);

  // Phase badge class mapping
  let phaseClass = 'phase-concept';
  if (canonicalType === 'worked-example') phaseClass = 'phase-i-do';
  else if (['we-do', 'board-task'].includes(canonicalType)) phaseClass = 'phase-we-do';
  else if (canonicalType === 'practice') phaseClass = 'phase-you-do';
  else if (['exit-ticket', 'assessment'].includes(canonicalType)) phaseClass = 'phase-assess';

  const phaseLabel = slide.phase || getPhaseDefaultLabel(rawType);

  // 1. Slide Header
  let headerHtml = '';
  if (canonicalType !== 'title') {
    headerHtml = `
      <div class="slide-header">
        <span class="slide-phase-badge ${phaseClass}">${escapeHtml(phaseLabel)}</span>
        <h2>${renderMathInText(slide.title || '')}</h2>
        ${slide.subtitle ? `<p class="subhead">${renderMathInText(slide.subtitle)}</p>` : ''}
      </div>
    `;
  }

  // 2. Slide Body (determined by canonicalType)
  let bodyHtml = '';

  switch (canonicalType) {
    case 'title':
      bodyHtml = renderTitleSlide(slide);
      break;
    case 'learning':
      bodyHtml = renderLearningSlide(slide, renderBlocks);
      break;
    case 'do-now':
      bodyHtml = renderDoNowSlide(slide, renderBlocks);
      break;
    case 'worked-example':
      bodyHtml = renderWorkedExampleSlide(slide, renderBlocks);
      break;
    case 'we-do':
    case 'board-task':
      bodyHtml = renderBoardTaskSlide(
        slide.separateSolutions && Array.isArray(slide.solution)
          ? { ...slide, solution: slide.solution.map(normalizeSolutionTypes) } : slide,
        renderBlocks, renderBlockHtml
      );
      break;
    case 'comparison':
      bodyHtml = renderComparisonSlide(slide, renderBlocks);
      break;
    case 'practice':
      bodyHtml = renderPracticeSlide(slide, renderBlocks);
      break;
    case 'exit-ticket':
      bodyHtml = renderExitTicketSlide(slide, renderBlocks);
      break;
    case 'summary':
      bodyHtml = renderSummarySlide(slide);
      break;
    case 'notes':
    default:
      bodyHtml = renderNotesSlide(slide, renderBlocks);
      break;
  }

  section.innerHTML = `
    ${headerHtml}
    <div class="slide-body">
      ${bodyHtml}
    </div>
  `;

  return section;
}

// Separate solutions inspect types before dispatch and strip nested reveal metadata.
// Canonicalize copies so padded solution names retain that ownership without
// changing the original lesson or the markup module's dependency interface.
function normalizeSolutionTypes(block) {
  if (!block || typeof block !== 'object') return block;
  const normalized = { ...block, type: normalizeBlockType(block) };
  for (const field of ['blocks', 'content', 'notes']) {
    if (Array.isArray(block[field])) {
      normalized[field] = block[field].map(normalizeSolutionTypes);
    }
  }
  return normalized;
}

function getPhaseDefaultLabel(type) {
  // Preserve distinct default labels for we-do vs board-task
  if (type === 'we-do') return 'We Do — Guided Practice';
  if (type === 'board-task') return 'We Do — Board Task';

  const canonical = normalizeSlideType(type);
  switch (canonical) {
    case 'title': return 'Introduction';
    case 'learning': return 'Lesson Intentions';
    case 'do-now': return 'Do Now — Warm Up';
    case 'worked-example': return 'I Do — Worked Example';
    case 'comparison': return 'Analysis & Comparison';
    case 'practice': return 'You Do — Independent Practice';
    case 'exit-ticket': return 'Check for Understanding';
    case 'summary': return 'Lesson Summary';
    default: return 'Key Knowledge';
  }
}
