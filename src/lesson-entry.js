/**
 * @file lesson-entry.js
 * Shared entry point for static lesson pages.
 * Lazily loads the requested lesson module specified by the data-lesson-id attribute
 * on #app, validates it against the schema and manifest, and mounts SlideshowEngine.
 */

import './styles/base.css';
import './styles/presentation.css';
import './styles/teacher-tools.css';

import { SlideshowEngine } from './slideshow/engine.js';
import { validateLesson } from './slideshow/validator.js';
import { lessonManifest } from './lessons/manifest.js';

// Vite lazy glob mapping: modules are imported on demand, not bundled eagerly together.
const lessonModules = import.meta.glob('./lessons/**/*.js');

/**
 * Escape HTML special characters for safe error string interpolation.
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Render a clear, styled error banner in the app mount container.
 * @param {HTMLElement} container
 * @param {string} title
 * @param {string} messageHtml
 */
function renderError(container, title, messageHtml) {
  let pathname = window.location.pathname;
  if (!pathname.endsWith('/')) {
    if (/\.[a-zA-Z0-9]+$/.test(pathname)) {
      pathname = pathname.substring(0, pathname.lastIndexOf('/') + 1);
    } else {
      pathname += '/';
    }
  }
  const libraryUrl = new URL('../../', new URL(pathname, window.location.origin)).href;

  container.innerHTML = `
    <div class="library-view" style="display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 24px;">
      <div class="library-empty-state" style="max-width: 580px; width: 100%; text-align: left; align-items: flex-start; padding: 32px; border-color: var(--accent-red, #dc2626); background-color: var(--bg-surface, #ffffff); box-shadow: var(--shadow-card);">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <span style="font-size: 1.5rem;" aria-hidden="true">⚠️</span>
          <h3 style="margin: 0; color: var(--accent-red, #dc2626); font-size: 1.25rem;">${escapeHtml(title)}</h3>
        </div>
        <div style="font-size: 0.95rem; line-height: 1.6; color: var(--text-secondary); margin-bottom: 20px;">
          ${messageHtml}
        </div>
        <div style="display: flex; gap: 12px; margin-top: 8px;">
          <a href="${libraryUrl}" class="btn btn-primary btn-sm" style="text-decoration: none;">
            ← Return to Library
          </a>
          <button type="button" class="btn btn-sm" onclick="window.location.reload()">
            ↻ Retry
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Resolves a manifest path (which is relative to src/lessons/)
 * into a glob key relative to src/lesson-entry.js (e.g. './8E.js' -> './lessons/8E.js').
 * @param {string} relativeToLessonsPath
 * @returns {string}
 */
function resolveLessonGlobKey(relativeToLessonsPath) {
  const sanitized = String(relativeToLessonsPath || '')
    .trim()
    .replace(/\\/g, '/')
    .replace(/^\.\//, '')
    .replace(/^\//, '');
  return `./lessons/${sanitized}`;
}

/**
 * Locate the dynamic module loader from the lazy glob map.
 * @param {string} targetKey
 * @returns {(() => Promise<any>)|null}
 */
function findModuleLoader(targetKey) {
  if (lessonModules[targetKey]) {
    return lessonModules[targetKey];
  }
  const targetNorm = targetKey.replace(/^\.\//, '').toLowerCase();
  for (const [key, loader] of Object.entries(lessonModules)) {
    if (key.replace(/^\.\//, '').toLowerCase() === targetNorm) {
      return loader;
    }
  }
  return null;
}

/**
 * Initialize the lesson page when DOM is ready.
 */
let hasInitialized = false;
let activeEngine = null;

export async function initLessonPage() {
  if (hasInitialized) return;
  hasInitialized = true;

  const appElement = document.getElementById('app');
  if (!appElement) {
    console.error('[LessonEntry] Mount element #app not found in document.');
    return;
  }

  // 1. Read requested lesson ID from data-lesson-id attribute
  const rawId = appElement.getAttribute('data-lesson-id') || appElement.dataset.lessonId;
  const lessonId = rawId ? rawId.trim() : null;

  if (!lessonId) {
    renderError(
      appElement,
      'Missing Lesson Identifier',
      'No <code>data-lesson-id</code> attribute was specified on the <code>#app</code> container.'
    );
    return;
  }

  // 2. Match ID against registered lessonManifest entries
  const manifestEntry = lessonManifest.find(
    (entry) => entry.id && entry.id.toUpperCase() === lessonId.toUpperCase()
  );

  if (!manifestEntry) {
    renderError(
      appElement,
      'Unregistered Lesson',
      `Lesson ID "<strong>${escapeHtml(lessonId)}</strong>" is not registered in the lesson manifest.`
    );
    return;
  }

  // 3. Resolve file path relative to src/lessons/ into Vite's glob key
  const globKey = resolveLessonGlobKey(manifestEntry.path);
  const moduleLoader = findModuleLoader(globKey);

  if (!moduleLoader) {
    renderError(
      appElement,
      'Lesson File Not Found',
      `Could not locate module for lesson "<strong>${escapeHtml(manifestEntry.id)}</strong>" at path <code>${escapeHtml(globKey)}</code>.`
    );
    return;
  }

  // 4. Dynamically import lesson module
  let importedModule;
  try {
    importedModule = await moduleLoader();
  } catch (err) {
    renderError(
      appElement,
      'Module Load Error',
      `Failed to dynamically load lesson "<strong>${escapeHtml(manifestEntry.id)}</strong>":<br><pre style="margin-top:8px;font-size:0.85rem;white-space:pre-wrap;">${escapeHtml(err?.message || String(err))}</pre>`
    );
    return;
  }

  const lesson = importedModule.default || importedModule;
  if (!lesson || typeof lesson !== 'object') {
    renderError(
      appElement,
      'Invalid Lesson Export',
      `Module for lesson "<strong>${escapeHtml(manifestEntry.id)}</strong>" did not export a valid lesson object.`
    );
    return;
  }

  // 5. Confirm lesson ID matches manifest entry
  if (String(lesson.id).trim().toUpperCase() !== String(manifestEntry.id).trim().toUpperCase()) {
    renderError(
      appElement,
      'Lesson ID Mismatch',
      `Manifest requested ID "<strong>${escapeHtml(manifestEntry.id)}</strong>", but loaded module has ID "<strong>${escapeHtml(lesson.id)}</strong>".`
    );
    return;
  }

  // 6. Validate lesson structure
  const validation = validateLesson(lesson);
  if (!validation.valid) {
    const errorList = (validation.errors || []).map((e) => `<li>${escapeHtml(e)}</li>`).join('');
    renderError(
      appElement,
      'Lesson Validation Failed',
      `Lesson "<strong>${escapeHtml(manifestEntry.id)}</strong>" failed schema validation:<ul>${errorList}</ul>`
    );
    return;
  }

  // 7. Mount presentation engine
  try {
    if (activeEngine) {
      activeEngine.destroy();
      activeEngine = null;
    }
    activeEngine = new SlideshowEngine(lesson, appElement);
  } catch (err) {
    renderError(
      appElement,
      'Slideshow Engine Error',
      `An error occurred while initializing the presentation engine:<br><pre style="margin-top:8px;font-size:0.85rem;white-space:pre-wrap;">${escapeHtml(err?.message || String(err))}</pre>`
    );
  }
}

// Initialise once DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initLessonPage, { once: true });
} else {
  initLessonPage();
}

export default initLessonPage;
