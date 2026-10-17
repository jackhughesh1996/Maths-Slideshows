/**
 * Slide-type bodies and shared solution content. DOM identity, headers and dispatch stay in renderer.js.
 * Block containers receive renderBlocks explicitly; board tasks also receive renderBlockHtml for atomic answers.
 */
import { renderMath, renderMathInText, escapeHtml } from './math.js';

// A separate answer is one atomic reveal. Its descendants must not introduce
// another automatic/default solution reveal or compete with the owner's step.
// Copy the input so lesson data and ordinary workspace child reveals are intact.
function withoutRevealSettings(value) {
  if (!value || typeof value !== 'object') return value;
  if (Array.isArray(value)) return value.map(withoutRevealSettings);
  const copy = Object.fromEntries(Object.entries(value)
    .filter(([key]) => key !== 'reveal' && key !== 'revealStep')
    .map(([key, child]) => [key, withoutRevealSettings(child)]));
  if (copy.type === 'solution') copy.reveal = false;
  return copy;
}

// Shared answer body: separateSolutions already supplies the badge and reveal
// container, so it must not render another solution shell around this content.
export function renderSolutionContent(block, renderBlocks) {
  return `
    ${block.text ? `<p style="margin-bottom: 6px;">${renderMathInText(block.text)}</p>` : ''}
    ${block.latex ? renderMath(block.latex, { display: true }) : ''}
    ${block.blocks ? renderBlocks(block.blocks) : ''}
  `;
}

/* ==========================================================================
   SLIDE TYPE SPECIFIC RENDERERS
   ========================================================================== */

export function renderTitleSlide(slide) {
  return `
    <div class="card col-half" style="display:flex; flex-direction:column; justify-content:center; padding: 36px 40px;">
      <span class="slide-phase-badge phase-concept" style="width:fit-content; margin-bottom:12px;">Year 7 Mathematics</span>
      <h1 style="font-size: 2.5rem; font-weight: 800; color: var(--text-primary); line-height: 1.15; margin-bottom: 12px;">
        ${renderMathInText(slide.title || '')}
      </h1>
      ${slide.subtitle ? `<p style="font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 24px;">${renderMathInText(slide.subtitle)}</p>` : ''}
      <div style="font-size: 0.88rem; color: var(--text-muted); font-family: var(--font-mono);">
        Press <kbd>Spacebar</kbd> or <kbd>→</kbd> to advance
      </div>
    </div>
    <div class="card col-half" style="display:flex; flex-direction:column; justify-content:center; background-color: var(--primary-subtle); border-color: var(--primary-border);">
      <h3 style="font-size: 1.15rem; color: var(--primary); margin-bottom: 12px;">Lesson Overview</h3>
      ${slide.overview ? `<p style="font-size: 1rem; color: var(--text-primary); line-height: 1.6; margin-bottom: 16px;">${renderMathInText(slide.overview)}</p>` : ''}
      ${slide.topics ? `
        <ul style="margin-left: 20px; font-size: 0.95rem; line-height: 1.7; color: var(--text-secondary);">
          ${slide.topics.map((t) => `<li>${renderMathInText(t)}</li>`).join('')}
        </ul>
      ` : ''}
    </div>
  `;
}

export function renderLearningSlide(slide, renderBlocks) {
  const criteria = (slide.successCriteria || [])
    .map((c) => `<li style="margin-bottom: 8px;">${renderMathInText(c)}</li>`)
    .join('');

  return `
    <div class="card col-half" style="display:flex; flex-direction:column; justify-content:center;">
      <div class="note-box" style="padding: 16px; margin-bottom: 20px;">
        <h4 style="font-size: 1.05rem; color: var(--primary);">🎯 WALT (We Are Learning To)</h4>
        <p style="font-size: 1.05rem; color: var(--text-primary); margin-top: 6px; line-height: 1.5;">
          ${renderMathInText(slide.learningIntention || '')}
        </p>
      </div>
      <div class="note-box gold" style="padding: 16px; margin-bottom: 0;">
        <h4 style="font-size: 1.05rem; color: var(--accent-gold);">⭐ WILF (What I'm Looking For)</h4>
        <ul style="margin-left: 20px; font-size: 0.96rem; line-height: 1.6; color: var(--text-primary); margin-top: 6px;">
          ${criteria}
        </ul>
      </div>
    </div>
    <div class="card col-half" style="display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding: 24px;">
      ${slide.keyPrinciple ? `
        <div style="font-size: 2.8rem; margin-bottom: 12px;">📐 ✏️</div>
        <h3 style="font-size: 1.25rem; color: var(--text-primary); margin-bottom: 10px;">Core Mathematics Principle</h3>
        <p style="font-size: 1.08rem; color: var(--primary); font-weight: 700; background: var(--primary-subtle); padding: 16px; border-radius: 8px; border: 1.5px dashed var(--primary-border); line-height: 1.5;">
          "${renderMathInText(slide.keyPrinciple)}"
        </p>
      ` : ''}
      ${slide.extraBlocks ? renderBlocks(slide.extraBlocks) : ''}
    </div>
  `;
}

/**
 * Render visual spinners for Do Now problem stimulus.
 * @param {Array<Object>} spinners
 * @returns {string}
 */
function renderDoNowSpinners(spinners) {
  if (!Array.isArray(spinners) || spinners.length === 0) return '';

  const spinnerCards = spinners.map((sp, sIdx) => {
    const size = 160;
    const cx = 80;
    const cy = 80;
    const r = 70;
    const sectors = sp.sectors || [];

    const pathElements = [];
    const textElements = [];

    sectors.forEach((sec) => {
      const startDeg = sec.startDeg !== undefined ? sec.startDeg : -90;
      const endDeg = sec.endDeg !== undefined ? sec.endDeg : 90;
      let arcDeg = endDeg - startDeg;
      if (arcDeg <= 0) arcDeg += 360;

      const startRad = (startDeg * Math.PI) / 180;
      const endRad = (endDeg * Math.PI) / 180;

      const x1 = cx + r * Math.cos(startRad);
      const y1 = cy + r * Math.sin(startRad);
      const x2 = cx + r * Math.cos(endRad);
      const y2 = cy + r * Math.sin(endRad);
      const largeArc = arcDeg > 180 ? 1 : 0;

      const d = `M ${cx} ${cy} L ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${x2.toFixed(2)} ${y2.toFixed(2)} Z`;
      pathElements.push(`
        <path d="${d}" fill="${sec.color || '#2563eb'}" stroke="#0f172a" stroke-width="2" />
      `);

      const midDeg = startDeg + arcDeg / 2;
      const midRad = (midDeg * Math.PI) / 180;
      const labelDist = r * 0.52;
      const lx = cx + labelDist * Math.cos(midRad);
      const ly = cy + labelDist * Math.sin(midRad);

      if (sec.label) {
        textElements.push(`
          <text x="${lx.toFixed(2)}" y="${ly.toFixed(2)}" text-anchor="middle" dominant-baseline="central"
                fill="${sec.textColor || '#ffffff'}" font-weight="800" font-size="12" font-family="system-ui, -apple-system, sans-serif"
                paint-order="stroke fill" stroke="rgba(15, 23, 42, 0.45)" stroke-width="2.5" stroke-linejoin="round">
            ${escapeHtml(sec.label)}
          </text>
        `);
      }
    });

    const initialRot = sp.needleAngle !== undefined ? sp.needleAngle : 225;
    const needleHtml = `
      <g class="do-now-needle" data-spinner-idx="${sIdx}" style="transform-origin: ${cx}px ${cy}px; transform: rotate(${initialRot}deg); transition: transform 2.2s cubic-bezier(0.15, 0.9, 0.25, 1);">
        <line x1="${cx}" y1="${cy}" x2="${cx}" y2="34" stroke="#0f172a" stroke-width="3" stroke-linecap="round" />
        <polygon points="${cx},25 ${cx - 6},38 ${cx + 6},38" fill="#0f172a" />
        <circle cx="${cx}" cy="${cy}" r="6.5" fill="#0f172a" />
      </g>
    `;

    return `
      <div class="do-now-spinner-card" data-spinner-idx="${sIdx}" title="Click to test spin on ${escapeHtml(sp.name || `Spinner ${sIdx + 1}`)}">
        <svg class="do-now-spinner-svg" viewBox="0 0 ${size} ${size}">
          <circle cx="${cx}" cy="${cy}" r="${r}" fill="#f8fafc" stroke="#0f172a" stroke-width="2.5" />
          ${pathElements.join('')}
          ${textElements.join('')}
          ${needleHtml}
        </svg>
        <div class="do-now-spinner-badge">${escapeHtml(sp.name || `Spinner ${sIdx + 1}`)}</div>
        ${sp.sectorsDescription ? `<div class="do-now-spinner-sub">${escapeHtml(sp.sectorsDescription)}</div>` : ''}
        <button type="button" class="btn btn-sm btn-spin-donow" data-spinner-idx="${sIdx}">
          🎲 Spin
        </button>
      </div>
    `;
  });

  return `
    <div class="do-now-spinners-row">
      ${spinnerCards.join('')}
    </div>
  `;
}

export function renderDoNowSlide(slide, renderBlocks) {
  const hasSpinners = Array.isArray(slide.spinners) && slide.spinners.length > 0;

  const questions = (slide.questions || [])
    .map((q, idx) => `
      <div style="margin-bottom: 14px; padding: 12px; background: var(--bg-muted); border-radius: 6px;">
        <p style="font-weight: 600; font-size: 0.95rem; margin-bottom: 6px;">${idx + 1}. ${renderMathInText(q.prompt)}</p>
        <div class="reveal-item" style="color: var(--accent-green); font-weight: 700; font-size: 0.93rem; line-height: 1.5;">
          ✔ ${renderMathInText(q.answer)}
        </div>
      </div>
    `)
    .join('');

  if (hasSpinners) {
    const spinnersHtml = renderDoNowSpinners(slide.spinners);
    return `
      <div class="card col-half" style="display: flex; flex-direction: column;">
        <h3 class="card-title">🎡 ${renderMathInText(slide.stimulusTitle || 'Lesson Starter: Spinner Probabilities')}</h3>
        ${slide.stimulusPrompt ? `<p style="font-size: 0.92rem; color: var(--text-secondary); margin-bottom: 8px;">${renderMathInText(slide.stimulusPrompt)}</p>` : ''}
        ${spinnersHtml}
        ${slide.sidebarNotes ? `<div style="margin-top: auto; padding-top: 10px;">${renderBlocks(slide.sidebarNotes)}</div>` : ''}
      </div>
      <div class="card col-half">
        <h3 class="card-title">📝 Warm-up Questions</h3>
        <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 12px;">Complete these in your workbook. Spacebar reveals answers.</p>
        ${questions}
      </div>
    `;
  }

  const hasSimulation = Array.isArray(slide.sidebarNotes) && slide.sidebarNotes.some((b) => b.type === 'simulation');

  if (hasSimulation) {
    return `
      <div class="card col-half" style="display: flex; flex-direction: column;">
        <h3 class="card-title">📝 Warm-up Questions</h3>
        <p style="font-size: 0.88rem; color: var(--text-secondary); margin-bottom: 12px;">Consider each question before and after running the class experiment. Spacebar reveals answers.</p>
        ${questions}
      </div>
      <div class="card col-half" style="display: flex; flex-direction: column;">
        ${renderBlocks(slide.sidebarNotes)}
      </div>
    `;
  }

  return `
    <div class="card col-60">
      <h3 class="card-title">Warm-up Questions</h3>
      <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 14px;">Complete these in your workbook. Spacebar reveals answers.</p>
      ${questions}
    </div>
    <div class="card col-40" style="display:flex; flex-direction:column; justify-content:center;">
      ${slide.sidebarNotes ? renderBlocks(slide.sidebarNotes) : `
        <div class="note-box gold">
          <h4>💡 Teacher Reminder</h4>
          <p style="font-size: 0.9rem;">Allow 3–5 minutes for independent student attempts before revealing step answers.</p>
        </div>
      `}
    </div>
  `;
}

export function renderNotesSlide(slide, renderBlocks) {
  const hasColumns = Array.isArray(slide.columns) && slide.columns.length > 0;
  const hasContent = Array.isArray(slide.content) && slide.content.length > 0;

  let contentHtml = '';
  if (hasContent) {
    contentHtml = `
      <div class="card col-full">
        ${renderBlocks(slide.content)}
      </div>
    `;
  }

  let columnsHtml = '';
  if (hasColumns) {
    columnsHtml = slide.columns
      .map((col) => {
        const widthClass = col.width ? `col-${col.width}` : 'col-half';
        return `
          <div class="card ${widthClass}">
            ${col.title ? `<h3 class="card-title">${renderMathInText(col.title)}</h3>` : ''}
            ${renderBlocks(col.blocks || [])}
          </div>
        `;
      })
      .join('');
  }

  if (!hasColumns && !hasContent) {
    return `
      <div class="card col-full">
        ${renderBlocks(slide.content || [])}
      </div>
    `;
  }

  return contentHtml + columnsHtml;
}

export function renderWorkedExampleSlide(slide, renderBlocks) {
  const steps = (slide.steps || [])
    .map((step, idx) => `
      <div class="reveal-item" style="margin-bottom: 14px; padding: 12px 14px; background: var(--bg-muted); border-left: 3px solid var(--primary); border-radius: 0 6px 6px 0;">
        <h4 style="font-size: 0.95rem; font-weight: 700; color: var(--primary); margin-bottom: 4px;">
          Step ${idx + 1}: ${renderMathInText(step.label || '')}
        </h4>
        <div style="font-size: 0.92rem; line-height: 1.5;">${renderMathInText(step.text || '')}</div>
        ${step.latex ? renderMath(step.latex, { display: true }) : ''}
        ${step.blocks ? renderBlocks(step.blocks) : ''}
      </div>
    `)
    .join('');

  return `
    <div class="card col-half">
      <h3 class="card-title">Problem Statement</h3>
      ${slide.prompt ? `<p style="font-size: 1rem; line-height: 1.5; margin-bottom: 12px;">${renderMathInText(slide.prompt)}</p>` : ''}
      ${slide.data ? `<div class="raw-data-strip">${escapeHtml(slide.data)}</div>` : ''}
      ${slide.leftBlocks ? renderBlocks(slide.leftBlocks) : ''}
    </div>
    <div class="card col-half">
      <h3 class="card-title">Step-by-Step Working</h3>
      ${steps}
    </div>
  `;
}

export function renderBoardTaskSlide(slide, renderBlocks, renderBlockHtml) {
  const studentAction = slide.studentAction || 'On whiteboards: calculate each missing value.';
  // Only split into two primary columns if there are explicit two primary presentation representations
  // (e.g. workspaceContent/leftBlocks on one side, and rightBlocks or a model solution on the other side).
  // Notes are secondary teacher support guidance and must NEVER trigger a two-column layout on their own.
  const hasTwoCols = Boolean(slide.solution || slide.rightBlocks);

  const actionBannerHtml = `
    <div class="whiteboard-instruction">
      <span class="wb-icon">📋</span>
      <span class="wb-text">${renderMathInText(studentAction)}</span>
    </div>
  `;

  // Secondary teacher guidance note box (compact styling so it does not dominate presentation area)
  const notesHtml = slide.notes ? `
    <div class="board-task-teacher-notes" style="margin-top: 10px;">
      ${renderBlocks(slide.notes)}
    </div>
  ` : '';

  if (!hasTwoCols) {
    // Single primary mathematical representation layout (e.g. sector-construction component, or wide table)
    // Uses full slide width beneath the compact action banner.
    return `
      <div class="card col-full" style="display: flex; flex-direction: column;">
        ${actionBannerHtml}
        ${slide.prompt ? `<p style="font-size: 1.02rem; line-height: 1.5; margin-bottom: 10px; color: var(--text-primary); font-weight: 500;">${renderMathInText(slide.prompt)}</p>` : ''}
        ${slide.data ? `<div class="raw-data-strip">${escapeHtml(slide.data)}</div>` : ''}
        ${slide.workspaceContent ? renderBlocks(slide.workspaceContent) : (slide.content ? renderBlocks(slide.content) : '')}
        ${slide.leftBlocks ? renderBlocks(slide.leftBlocks) : ''}
        ${notesHtml}
      </div>
    `;
  }

  // Two-column layout when two primary representations are explicitly provided
  // (e.g. Table on left, Measured-Bar / Solution on right)
  const leftContent = `
    ${actionBannerHtml}
    ${slide.prompt ? `<p style="font-size: 0.98rem; line-height: 1.45; margin-bottom: 8px; color: var(--text-primary); font-weight: 500;">${renderMathInText(slide.prompt)}</p>` : ''}
    ${slide.data ? `<div class="raw-data-strip">${escapeHtml(slide.data)}</div>` : ''}
    ${slide.workspaceContent ? renderBlocks(slide.workspaceContent) : (slide.content ? renderBlocks(slide.content) : '')}
    ${slide.leftBlocks ? renderBlocks(slide.leftBlocks) : ''}
    ${notesHtml}
  `;

  let solutionHtml = '';
  if (slide.solution) {
    if (slide.separateSolutions && Array.isArray(slide.solution)) {
      solutionHtml = slide.solution
        .map((solBlock, idx) => {
          const stepNum = solBlock.revealStep !== undefined ? solBlock.revealStep : idx + 1;
          const badgeTitle = solBlock.badgeTitle || solBlock.title || 'Model Solution';
          // The wrapper owns this entry's reveal metadata. Render its body
          // directly so a numbered/default solution root is not revealed twice.
          const contentBlock = withoutRevealSettings(solBlock);
          const bodyHtml = contentBlock.type === 'solution'
            ? renderSolutionContent(contentBlock, renderBlocks)
            : renderBlockHtml(contentBlock, '');
          return `
            <div class="reveal-item solution-container" data-reveal-step="${stepNum}" style="margin-top: 10px;">
              <span class="solution-badge">✔ ${escapeHtml(badgeTitle)}</span>
              <div class="solution-content" style="margin-top: 8px;">
                ${bodyHtml}
              </div>
            </div>
          `;
        })
        .join('');
    } else {
      solutionHtml = `
        <div class="reveal-item solution-container" style="margin-top: 10px;">
          <span class="solution-badge">✔ Model Solution</span>
          <div class="solution-content" style="margin-top: 8px;">
            ${renderBlocks(slide.solution)}
          </div>
        </div>
      `;
    }
  }

  const rightContent = `
    ${slide.rightBlocks ? renderBlocks(slide.rightBlocks) : ''}
    ${solutionHtml}
  `;

  return `
    <div class="card col-half" style="display: flex; flex-direction: column;">
      ${leftContent}
    </div>
    <div class="card col-half" style="display: flex; flex-direction: column; justify-content: flex-start;">
      ${rightContent}
    </div>
  `;
}

export function renderComparisonSlide(slide, renderBlocks) {
  const cols = slide.columns || [];
  return cols
    .map((col) => `
      <div class="card col-half">
        <h3 class="card-title">${renderMathInText(col.title || '')}</h3>
        ${renderBlocks(col.blocks || [])}
      </div>
    `)
    .join('');
}

export function renderPracticeSlide(slide, renderBlocks) {
  const content = Array.isArray(slide.content) && slide.content.length > 0 ? `
    <div class="card col-full">
      ${renderBlocks(slide.content)}
    </div>
  ` : '';
  const tasks = (slide.tasks || [])
    .map((task) => `
      <div class="card col-third" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <h3 class="card-title" style="font-size: 1.05rem;">${renderMathInText(task.title || '')}</h3>
          ${task.prompt ? `<p style="font-size: 0.92rem; line-height: 1.5; margin-bottom: 8px;">${renderMathInText(task.prompt)}</p>` : ''}
          ${task.blocks ? renderBlocks(task.blocks) : ''}
        </div>
        ${task.solution && (Array.isArray(task.solution) ? task.solution.length > 0 : Boolean(task.solution)) ? `
          <div class="reveal-item solution-container" style="margin-top: 12px;">
            <span class="solution-badge">✔ Solution</span>
            ${renderBlocks(task.solution)}
          </div>
        ` : ''}
      </div>
    `)
    .join('');

  return content + tasks;
}

export function renderExitTicketSlide(slide, renderBlocks) {
  const checks = (slide.questions || [])
    .map((q, idx) => {
      const promptText = (q.prompt && String(q.prompt).trim() !== '') ? q.prompt : (q.question || '');
      return `
      <div class="card col-half" style="display:flex; flex-direction:column; justify-content:space-between;">
        <div>
          <h3 class="card-title">Question ${idx + 1}</h3>
          <p style="font-size: 1rem; line-height: 1.5; margin-bottom: 12px;">${renderMathInText(promptText)}</p>
          ${q.blocks ? renderBlocks(q.blocks) : ''}
        </div>
        <div class="reveal-item solution-container" style="margin-top: 14px;">
          <span class="solution-badge">✔ Answer</span>
          ${q.solution ? renderBlocks(q.solution) : ''}
        </div>
      </div>
    `;
    })
    .join('');

  return checks;
}

export function renderSummarySlide(slide) {
  const takeaways = (slide.takeaways || [])
    .map((t) => `
      <li style="margin-bottom: 10px; font-size: 1.05rem; line-height: 1.6;">
        ${renderMathInText(t)}
      </li>
    `)
    .join('');

  return `
    <div class="card col-60" style="display:flex; flex-direction:column; justify-content:center; padding: 30px;">
      <h3 style="font-size: 1.35rem; color: var(--primary); margin-bottom: 16px;">Core Concepts Checklist</h3>
      <ul style="margin-left: 24px; color: var(--text-primary);">
        ${takeaways}
      </ul>
    </div>
    <div class="card col-40" style="display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; padding: 24px;">
      <div style="font-size: 3rem; margin-bottom: 12px;">🎓 ⭐</div>
      <h3 style="font-size: 1.25rem; margin-bottom: 8px;">Well done, Year 7!</h3>
      <p style="font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 16px;">Pack up workbooks, pens and calculators.</p>
      <button class="btn btn-primary btn-summary-return" type="button">
        Return to Lesson Library
      </button>
    </div>
  `;
}
