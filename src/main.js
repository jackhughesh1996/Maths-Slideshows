/**
 * @file main.js
 * Application entry point and router.
 * Features hierarchical folder-based course library navigation,
 * real-time filtering, collapsible folders, and query-parameter routing (?lesson=8E).
 */

import './styles/base.css';
import './styles/presentation.css';
import './styles/teacher-tools.css';

import { getLesson, getAllLessons, groupLessonsHierarchically } from './lessons/index.js';
import { SlideshowEngine } from './slideshow/engine.js';
import { getLauncherFileName, generateLauncherHtml } from './slideshow/launcher.js';
import { siteConfig } from '../site.config.js';
import { openTeacherTools } from './tools/teacherToolsModal.js';

let activeEngine = null;

// Persistent collapsed folder state during browsing session
const collapsedFolderKeys = new Set();
let activeSearchQuery = '';

/**
 * Escape HTML special characters for safe string interpolation.
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
 * Navigate to a specific lesson or library by updating URL and triggering render.
 * @param {string|null} lessonId
 */
export function navigateTo(lessonId) {
  const url = new URL(window.location.href);
  if (lessonId) {
    url.searchParams.set('lesson', lessonId);
  } else {
    url.searchParams.delete('lesson');
  }
  window.history.pushState({}, '', url.toString());
  renderApp();
}

/**
 * Render the hierarchical folders tree HTML based on current lessons and search query.
 * @param {Array<Object>} allLessons
 * @param {string} searchQuery
 * @returns {{ html: string, totalMatches: number, totalAll: number, totalFolders: number }}
 */
function buildTreeHtml(allLessons, searchQuery) {
  const { courses, totalMatchedLessons, totalAllLessons } = groupLessonsHierarchically(allLessons, searchQuery);
  const isFiltering = Boolean(searchQuery && searchQuery.trim());

  let totalFoldersCount = 0;
  courses.forEach((c) => {
    totalFoldersCount += c.folders.length;
  });

  if (courses.length === 0 || totalMatchedLessons === 0) {
    return {
      html: `
        <div class="library-empty-state">
          <h3>No lessons found matching "${escapeHtml(searchQuery)}"</h3>
          <p>Try searching by lesson code (e.g. 8E, 8F) or topic keywords (e.g. Plots, Graphs, Probability).</p>
          <button type="button" class="btn btn-sm" id="btnEmptyClearSearch">Clear Filter</button>
        </div>
      `,
      totalMatches: 0,
      totalAll: totalAllLessons,
      totalFolders: 0
    };
  }

  const coursesHtml = courses
    .map((course) => {
      const foldersHtml = course.folders
        .map((folder) => {
          // When actively searching, auto-expand folders to reveal matches.
          // Otherwise, respect user's collapsed state.
          const isCollapsed = !isFiltering && collapsedFolderKeys.has(folder.id);

          const lessonsHtml = folder.lessons
            .map((lesson) => {
              const topicPills = (lesson.topics || [])
                .slice(0, 3)
                .map((t) => `<span class="topic-pill">${escapeHtml(t)}</span>`)
                .join('');

              const slideCount = (lesson.slides || []).length;
              const launcherFileName = getLauncherFileName(lesson);

              return `
                <div class="lesson-row" data-lesson-id="${escapeHtml(lesson.id)}">
                  <div class="lesson-row-left">
                    <span class="lesson-code-badge">${escapeHtml(lesson.id)}</span>
                    <span class="lesson-row-title">${escapeHtml(lesson.title)}</span>
                    ${topicPills ? `<div class="lesson-topic-pills">${topicPills}</div>` : ''}
                  </div>
                  <div class="lesson-row-right">
                    <span class="lesson-row-slides">${slideCount} slides</span>
                    <div class="lesson-actions">
                      <button 
                        type="button" 
                        class="btn btn-launcher-download" 
                        data-download-launcher="${escapeHtml(lesson.id)}"
                        title="Download student HTML launcher (${escapeHtml(launcherFileName)})"
                      >
                        <svg class="launcher-download-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Download launcher
                      </button>
                      <a href="?lesson=${encodeURIComponent(lesson.id)}" class="btn btn-sm btn-primary btn-open-lesson" data-lesson-id="${escapeHtml(lesson.id)}">
                        Open Lesson ▶
                      </a>
                    </div>
                  </div>
                </div>
              `;
            })
            .join('');

          return `
            <div class="folder-block" data-folder-id="${escapeHtml(folder.id)}">
              <button 
                type="button" 
                class="folder-header-btn" 
                data-toggle-folder="${escapeHtml(folder.id)}"
                aria-expanded="${isCollapsed ? 'false' : 'true'}"
                aria-controls="folder-contents-${escapeHtml(folder.id)}"
              >
                <div class="folder-header-left">
                  <svg class="folder-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                    <polyline points="9 18 15 12 9 6"></polyline>
                  </svg>
                  <svg class="folder-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M10 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z"/>
                  </svg>
                  <span class="folder-title">${escapeHtml(folder.title)}</span>
                </div>
                <div class="folder-header-right">
                  <span class="folder-badge">
                    ${folder.lessonCount} ${folder.lessonCount === 1 ? 'lesson' : 'lessons'}
                  </span>
                </div>
              </button>
              <div 
                class="folder-contents ${isCollapsed ? 'is-collapsed' : ''}" 
                id="folder-contents-${escapeHtml(folder.id)}"
              >
                ${lessonsHtml}
              </div>
            </div>
          `;
        })
        .join('');

      return `
        <section class="course-group">
          <h2 class="course-group-header">${escapeHtml(course.courseTitle)}</h2>
          <div class="folders-list">
            ${foldersHtml}
          </div>
        </section>
      `;
    })
    .join('');

  return {
    html: coursesHtml,
    totalMatches: totalMatchedLessons,
    totalAll: totalAllLessons,
    totalFolders: totalFoldersCount
  };
}

/**
 * Render the Lesson Library (Home view).
 * @param {HTMLElement} appEl
 */
function renderLibraryView(appEl) {
  if (activeEngine) {
    activeEngine.destroy();
    activeEngine = null;
  }

  const allLessons = getAllLessons();

  appEl.innerHTML = `
    <div class="library-view">
      <!-- HEADER -->
      <header class="library-header">
        <div class="library-header-main">
          <h1>Year 7 Mathematics</h1>
          <p>Classroom Interactive Whiteboard Slideshow Library</p>
        </div>
        <div class="library-metadata">
          <span>Curriculum: Stage 4 / Year 7</span>
        </div>
      </header>

      <!-- TOOLBAR (Search & Course View Controls) -->
      <div class="library-toolbar">
        <div class="library-search-wrapper">
          <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="search" 
            id="librarySearchInput" 
            class="library-search-input" 
            placeholder="Filter lessons by code or title (e.g. 8E, Stem-and-leaf, Decimals)..."
            value="${escapeHtml(activeSearchQuery)}"
            autocomplete="off"
            spellcheck="false"
            aria-label="Filter lessons"
          />
          <kbd class="search-shortcut-kbd" id="searchShortcutKbd" title="Press '/' to search">/</kbd>
          <button type="button" class="search-clear-btn" id="btnSearchClear" title="Clear filter" style="display: ${activeSearchQuery ? 'flex' : 'none'};" aria-label="Clear filter">✕</button>
        </div>

        <div class="library-toolbar-controls">
          <span class="library-status-count" id="libraryStatusCount"></span>
          <button type="button" class="btn btn-sm btn-teacher-tools" id="btnLibraryTeacherTools" title="Teacher Tools: Random Student & Team Generator">
            👥 Class Tools
          </button>
          <button type="button" class="btn btn-sm" id="btnToggleAllFolders" title="Expand or collapse all folders">
            Collapse All
          </button>
        </div>
      </div>

      <!-- MAIN HIERARCHICAL FOLDERS TREE -->
      <main id="libraryTreeContainer" aria-label="Course folders and lessons">
        <!-- Injected dynamically -->
      </main>

      <!-- TEACHER SHORTCUTS REFERENCE BOX -->
      <section class="teacher-shortcuts-box">
        <h4>Teacher Presentation Controls & Whiteboard Shortcuts</h4>
        <div class="shortcuts-grid">
          <div><kbd>Spacebar</kbd> / <kbd>→</kbd> : Advance step reveal or next slide</div>
          <div><kbd>←</kbd> : Step back reveal or previous slide</div>
          <div><kbd>P</kbd> : Toggle interactive whiteboard drawing pen</div>
          <div><kbd>F</kbd> : Toggle true fullscreen mode</div>
          <div><kbd>Clear</kbd> : Erase ink annotations on current slide only</div>
          <div><kbd>⏱️ Timer</kbd> : Built-in practice timer (auto-pauses on navigation)</div>
        </div>
      </section>
    </div>
  `;

  const searchInput = appEl.querySelector('#librarySearchInput');
  const searchClearBtn = appEl.querySelector('#btnSearchClear');
  const searchShortcutKbd = appEl.querySelector('#searchShortcutKbd');
  const statusCountEl = appEl.querySelector('#libraryStatusCount');
  const toggleAllBtn = appEl.querySelector('#btnToggleAllFolders');
  const toolsBtn = appEl.querySelector('#btnLibraryTeacherTools');
  const treeContainer = appEl.querySelector('#libraryTreeContainer');

  if (toolsBtn) {
    toolsBtn.addEventListener('click', () => openTeacherTools());
  }

  /**
   * Refresh tree contents and status count without re-rendering the outer layout.
   */
  function updateTree() {
    const { html, totalMatches, totalAll, totalFolders } = buildTreeHtml(allLessons, activeSearchQuery);
    treeContainer.innerHTML = html;

    // Update status counter
    if (activeSearchQuery.trim()) {
      statusCountEl.textContent = `${totalMatches} of ${totalAll} ${totalMatches === 1 ? 'lesson' : 'lessons'}`;
    } else {
      statusCountEl.textContent = `${totalAll} ${totalAll === 1 ? 'lesson' : 'lessons'} across ${totalFolders} ${totalFolders === 1 ? 'folder' : 'folders'}`;
    }

    // Toggle search clear button and shortcut indicator
    if (activeSearchQuery) {
      searchClearBtn.style.display = 'flex';
      searchShortcutKbd.style.display = 'none';
    } else {
      searchClearBtn.style.display = 'none';
      searchShortcutKbd.style.display = 'inline-block';
    }

    // Update Toggle All button text
    if (toggleAllBtn) {
      const anyExpanded = Array.from(treeContainer.querySelectorAll('.folder-header-btn')).some(
        (btn) => btn.getAttribute('aria-expanded') === 'true'
      );
      toggleAllBtn.textContent = anyExpanded ? 'Collapse All' : 'Expand All';
    }
  }

  // Initial populate
  updateTree();

  // Search input change listener
  searchInput.addEventListener('input', (e) => {
    activeSearchQuery = e.target.value;
    updateTree();
  });

  // Search clear button listener
  searchClearBtn.addEventListener('click', () => {
    activeSearchQuery = '';
    searchInput.value = '';
    searchInput.focus();
    updateTree();
  });

  // Empty state "Clear Filter" button delegation
  treeContainer.addEventListener('click', (e) => {
    if (e.target && e.target.id === 'btnEmptyClearSearch') {
      activeSearchQuery = '';
      searchInput.value = '';
      searchInput.focus();
      updateTree();
    }
  });

  // Global keyboard shortcut to focus search input with '/'
  const handleDocKeyDown = (e) => {
    if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) {
      e.preventDefault();
      searchInput.focus();
      searchInput.select();
    } else if (e.key === 'Escape' && document.activeElement === searchInput) {
      if (activeSearchQuery) {
        activeSearchQuery = '';
        searchInput.value = '';
        updateTree();
      } else {
        searchInput.blur();
      }
    }
  };
  window.addEventListener('keydown', handleDocKeyDown);

  // Folder header toggle click listener (event delegation on tree container)
  treeContainer.addEventListener('click', (e) => {
    const headerBtn = e.target.closest('[data-toggle-folder]');
    if (headerBtn) {
      const folderId = headerBtn.getAttribute('data-toggle-folder');
      const isExpanded = headerBtn.getAttribute('aria-expanded') === 'true';
      const contentsEl = document.getElementById(`folder-contents-${folderId}`);

      if (isExpanded) {
        headerBtn.setAttribute('aria-expanded', 'false');
        if (contentsEl) contentsEl.classList.add('is-collapsed');
        collapsedFolderKeys.add(folderId);
      } else {
        headerBtn.setAttribute('aria-expanded', 'true');
        if (contentsEl) contentsEl.classList.remove('is-collapsed');
        collapsedFolderKeys.delete(folderId);
      }

      // Update toggle all button text
      const anyExpanded = Array.from(treeContainer.querySelectorAll('.folder-header-btn')).some(
        (btn) => btn.getAttribute('aria-expanded') === 'true'
      );
      if (toggleAllBtn) {
        toggleAllBtn.textContent = anyExpanded ? 'Collapse All' : 'Expand All';
      }
      return;
    }

    // Download launcher button click (secondary teacher action)
    const downloadBtn = e.target.closest('[data-download-launcher]');
    if (downloadBtn) {
      e.preventDefault();
      e.stopPropagation();
      const lessonId = downloadBtn.getAttribute('data-download-launcher');
      const lesson = getLesson(lessonId);
      if (lesson) {
        const fileName = getLauncherFileName(lesson);
        const originPath = window.location.origin + window.location.pathname.replace(/\/index\.html$/, '');
        const { url: baseUrl } = siteConfig.resolveBaseUrl(originPath);
        const targetUrl = `${baseUrl}/?lesson=${encodeURIComponent(lesson.id)}`;
        const htmlContent = generateLauncherHtml(lesson, targetUrl);

        const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      }
      return;
    }

    // Lesson row or Launch button click
    const lessonRow = e.target.closest('[data-lesson-id]');
    if (lessonRow) {
      // If user clicked an anchor with middle click or Ctrl/Cmd, allow native behavior
      if (e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey) {
        e.preventDefault();
        const lessonId = lessonRow.getAttribute('data-lesson-id');
        if (lessonId) {
          window.removeEventListener('keydown', handleDocKeyDown);
          navigateTo(lessonId);
        }
      }
    }
  });

  // Toggle All Folders button
  toggleAllBtn.addEventListener('click', () => {
    const headerButtons = Array.from(treeContainer.querySelectorAll('.folder-header-btn'));
    const anyExpanded = headerButtons.some((btn) => btn.getAttribute('aria-expanded') === 'true');

    if (anyExpanded) {
      // Collapse all
      headerButtons.forEach((btn) => {
        const folderId = btn.getAttribute('data-toggle-folder');
        btn.setAttribute('aria-expanded', 'false');
        const contentsEl = document.getElementById(`folder-contents-${folderId}`);
        if (contentsEl) contentsEl.classList.add('is-collapsed');
        collapsedFolderKeys.add(folderId);
      });
      toggleAllBtn.textContent = 'Expand All';
    } else {
      // Expand all
      headerButtons.forEach((btn) => {
        const folderId = btn.getAttribute('data-toggle-folder');
        btn.setAttribute('aria-expanded', 'true');
        const contentsEl = document.getElementById(`folder-contents-${folderId}`);
        if (contentsEl) contentsEl.classList.remove('is-collapsed');
        collapsedFolderKeys.delete(folderId);
      });
      toggleAllBtn.textContent = 'Collapse All';
    }
  });
}

/**
 * Main application router based on URL query parameter ?lesson=
 */
function renderApp() {
  const appEl = document.getElementById('app');
  if (!appEl) return;

  const params = new URLSearchParams(window.location.search);
  const lessonId = params.get('lesson');

  if (lessonId) {
    const lesson = getLesson(lessonId);
    if (lesson) {
      if (activeEngine) {
        activeEngine.destroy();
        activeEngine = null;
      }
      activeEngine = new SlideshowEngine(lesson, appEl);
      return;
    }
  }

  // Fallback to library view
  renderLibraryView(appEl);
}

// Handle browser Back / Forward buttons
window.addEventListener('popstate', renderApp);

// Initialize on page load exactly once
let hasInitialized = false;
function init() {
  if (hasInitialized) return;
  hasInitialized = true;
  renderApp();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
  init();
}
