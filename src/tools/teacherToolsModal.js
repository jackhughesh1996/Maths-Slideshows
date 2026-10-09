/**
 * @file teacherToolsModal.js
 * Teacher Tools Modal UI: Random Student Selector, Team Generator,
 * and Class Lists Management with CSV and clipboard import.
 */

import {
  getClasses,
  getActiveClass,
  getActiveClassId,
  setActiveClassId,
  createClass,
  updateClass,
  deleteClass,
  parsePastedNames,
  parseCsvNames,
  RandomPickerSession,
  generateTeams,
  formatTeamsText
} from './classManager.js';

let modalContainer = null;
let currentTab = 'picker'; // 'picker' | 'teams' | 'classes'
let pickerSession = new RandomPickerSession();
let currentTeams = [];
let avoidRepeats = true;

// Team generator config
let teamMode = 'size'; // 'size' | 'count'
let teamSizeVal = 3;
let teamCountVal = 4;

// Pending CSV preview state
let pendingCsvImport = null;

/**
 * Open the Teacher Tools modal on a specific tab.
 * @param {'picker'|'teams'|'classes'} [tab='picker']
 */
export function openTeacherTools(tab = 'picker') {
  currentTab = tab;
  document.body.classList.add('teacher-tools-open');

  if (!modalContainer) {
    createModalDOM();
  }

  modalContainer.style.display = 'flex';
  renderModalContent();

  // Reset/sync picker session with active class
  const activeClass = getActiveClass();
  if (activeClass) {
    pickerSession.reset(activeClass.id);
  }
}

/**
 * Close the Teacher Tools modal.
 */
export function closeTeacherTools() {
  if (modalContainer) {
    modalContainer.style.display = 'none';
  }
  document.body.classList.remove('teacher-tools-open');
}

/**
 * Construct modal DOM skeleton attached to document.body.
 */
function createModalDOM() {
  modalContainer = document.createElement('div');
  modalContainer.className = 'teacher-tools-overlay';
  modalContainer.setAttribute('role', 'dialog');
  modalContainer.setAttribute('aria-modal', 'true');
  modalContainer.setAttribute('aria-label', 'Teacher Classroom Tools');

  modalContainer.innerHTML = `
    <div class="teacher-tools-modal">
      <!-- HEADER -->
      <header class="tt-header">
        <div class="tt-header-title">
          <span>👥</span>
          <span>Teacher Classroom Tools</span>
        </div>
        <select class="tt-header-class-select" id="ttHeaderClassSelect" title="Switch active class"></select>
        <button type="button" class="tt-header-close" id="ttBtnClose" title="Close tools (Escape)" aria-label="Close">✕</button>
      </header>

      <!-- NAVIGATION TABS -->
      <nav class="tt-tabs">
        <button type="button" class="tt-tab-btn" data-tab="picker">🎲 Random Student</button>
        <button type="button" class="tt-tab-btn" data-tab="teams">👥 Team Generator</button>
        <button type="button" class="tt-tab-btn" data-tab="classes">📋 Class Lists</button>
      </nav>

      <!-- TAB BODY -->
      <div class="tt-body" id="ttBody"></div>

      <!-- PRIVACY NOTE FOOTER -->
      <footer class="tt-privacy-note">
        <span>🔒</span>
        <span>Class lists are stored only in this browser. No student data is transmitted online.</span>
      </footer>
    </div>
  `;

  document.body.appendChild(modalContainer);

  // Close handlers
  modalContainer.querySelector('#ttBtnClose').addEventListener('click', closeTeacherTools);
  modalContainer.addEventListener('click', (e) => {
    if (e.target === modalContainer) {
      closeTeacherTools();
    }
  });

  // Global Escape key
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('teacher-tools-open')) {
      e.preventDefault();
      closeTeacherTools();
    }
  });

  // Class switcher change listener
  const classSelect = modalContainer.querySelector('#ttHeaderClassSelect');
  classSelect.addEventListener('change', (e) => {
    setActiveClassId(e.target.value);
    pickerSession.reset(e.target.value);
    currentTeams = [];
    renderModalContent();
  });

  // Tab switching listeners
  const tabButtons = modalContainer.querySelectorAll('.tt-tab-btn');
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      currentTab = btn.getAttribute('data-tab');
      renderModalContent();
    });
  });
}

/**
 * Render complete modal body according to current active tab.
 */
function renderModalContent() {
  if (!modalContainer) return;

  const classes = getClasses();
  const activeClass = getActiveClass();

  // 1. Update class select in header
  const classSelect = modalContainer.querySelector('#ttHeaderClassSelect');
  if (classSelect) {
    classSelect.innerHTML = classes
      .map((c) => {
        const isSelected = c.id === activeClass?.id ? 'selected' : '';
        return `<option value="${c.id}" ${isSelected}>${c.name} (${c.students.length})</option>`;
      })
      .join('');
  }

  // 2. Update active tab styling
  const tabButtons = modalContainer.querySelectorAll('.tt-tab-btn');
  tabButtons.forEach((btn) => {
    btn.classList.toggle('active', btn.getAttribute('data-tab') === currentTab);
  });

  // 3. Render body according to tab
  const bodyEl = modalContainer.querySelector('#ttBody');
  if (!bodyEl) return;

  if (currentTab === 'picker') {
    renderPickerTab(bodyEl, activeClass);
  } else if (currentTab === 'teams') {
    renderTeamsTab(bodyEl, activeClass);
  } else if (currentTab === 'classes') {
    renderClassesTab(bodyEl, activeClass, classes);
  }
}

/**
 * Render Random Student Picker Tab.
 */
function renderPickerTab(container, activeClass) {
  const status = pickerSession.getStatus();
  const totalStudents = activeClass ? activeClass.students.length : 0;

  container.innerHTML = `
    <div class="tt-picker-hero ${status.currentStudent ? 'highlight' : ''}" id="ttPickerHero">
      ${
        status.currentStudent
          ? `<div class="tt-picker-name">${status.currentStudent}</div>`
          : `<div class="tt-picker-placeholder">Click below to pick a student</div>`
      }
    </div>

    <div class="tt-picker-controls">
      <button type="button" class="btn btn-primary btn-pick-random" id="btnPickStudent">
        🎲 Pick Random Student
      </button>
      <button type="button" class="btn" id="btnResetPool" title="Reset pool so everyone is eligible again">
        ↺ Reset Pool
      </button>
    </div>

    <div class="tt-picker-options">
      <label class="tt-checkbox-label">
        <input type="checkbox" id="ttAvoidRepeats" ${avoidRepeats ? 'checked' : ''} />
        <span>Avoid repeats until everyone has been selected</span>
      </label>
      <span class="tt-pool-badge" id="ttPoolCount">
        ${status.remainingCount} of ${totalStudents} remaining
      </span>
    </div>

    ${
      status.history.length > 0
        ? `
        <div class="tt-history-section">
          <span class="tt-history-title">Recent Picks:</span>
          <div class="tt-history-chips">
            ${status.history.map((name) => `<span class="tt-history-chip">${name}</span>`).join('')}
          </div>
        </div>
      `
        : ''
    }
  `;

  // Avoid repeats checkbox
  const checkEl = container.querySelector('#ttAvoidRepeats');
  if (checkEl) {
    checkEl.addEventListener('change', (e) => {
      avoidRepeats = e.target.checked;
    });
  }

  // Pick student button
  const pickBtn = container.querySelector('#btnPickStudent');
  if (pickBtn) {
    pickBtn.addEventListener('click', () => {
      if (!activeClass || activeClass.students.length === 0) {
        alert('No students in this class. Go to the "Class Lists" tab to add students.');
        return;
      }

      const res = pickerSession.pick(avoidRepeats);
      renderPickerTab(container, activeClass);

      // Subtle pulse animation on name
      const hero = container.querySelector('#ttPickerHero');
      if (hero) {
        hero.classList.add('highlight');
      }

      if (res.wasRefilled) {
        const poolBadge = container.querySelector('#ttPoolCount');
        if (poolBadge) {
          poolBadge.textContent = 'Everyone selected! Pool refilled.';
          poolBadge.style.color = 'var(--accent-green)';
        }
      }
    });
  }

  // Reset pool button
  const resetBtn = container.querySelector('#btnResetPool');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      pickerSession.reset(activeClass?.id);
      renderPickerTab(container, activeClass);
    });
  }
}

/**
 * Render Team Generator Tab.
 */
function renderTeamsTab(container, activeClass) {
  const students = activeClass ? activeClass.students : [];

  const teamsHtml = currentTeams.length > 0
    ? `
      <div class="tt-teams-grid">
        ${currentTeams
          .map((team) => `
            <div class="tt-team-card">
              <div class="tt-team-card-header">
                <span>${team.name}</span>
                <span class="tt-team-card-count">${team.members.length}</span>
              </div>
              <ul class="tt-team-members">
                ${team.members.map((m) => `<li>${m}</li>`).join('')}
              </ul>
            </div>
          `)
          .join('')}
      </div>
    `
    : `
      <div style="text-align: center; color: var(--text-muted); padding: 30px 10px;">
        Select team sizing above and click <strong>Generate Teams</strong>.
      </div>
    `;

  container.innerHTML = `
    <div class="tt-teams-toolbar">
      <div class="tt-teams-presets">
        <button type="button" class="btn btn-sm tt-preset-btn ${teamMode === 'size' && teamSizeVal === 2 ? 'active' : ''}" data-preset-size="2">
          Pairs (2)
        </button>
        <button type="button" class="btn btn-sm tt-preset-btn ${teamMode === 'size' && teamSizeVal === 3 ? 'active' : ''}" data-preset-size="3">
          Teams of 3
        </button>
        <button type="button" class="btn btn-sm tt-preset-btn ${teamMode === 'size' && teamSizeVal === 4 ? 'active' : ''}" data-preset-size="4">
          Teams of 4
        </button>

        <div class="tt-teams-custom-group">
          <span>Size:</span>
          <input type="number" min="2" max="20" class="tt-teams-input" id="inputTeamSize" value="${teamSizeVal}" />
        </div>

        <div class="tt-teams-custom-group">
          <span>or Teams:</span>
          <input type="number" min="2" max="20" class="tt-teams-input" id="inputTeamCount" value="${teamCountVal}" />
        </div>
      </div>

      <div class="tt-teams-actions">
        <button type="button" class="btn btn-sm btn-primary" id="btnGenTeams">
          🎲 Generate Teams
        </button>
        ${
          currentTeams.length > 0
            ? `
          <button type="button" class="btn btn-sm" id="btnCopyTeams" title="Copy teams text to clipboard">
            📋 Copy Teams
          </button>
        `
            : ''
        }
      </div>
    </div>

    ${teamsHtml}
  `;

  // Presets listeners
  container.querySelectorAll('[data-preset-size]').forEach((btn) => {
    btn.addEventListener('click', () => {
      teamMode = 'size';
      teamSizeVal = parseInt(btn.getAttribute('data-preset-size'), 10);
      currentTeams = generateTeams(students, teamMode, teamSizeVal);
      renderTeamsTab(container, activeClass);
    });
  });

  // Input custom size
  const inputSize = container.querySelector('#inputTeamSize');
  if (inputSize) {
    inputSize.addEventListener('change', (e) => {
      teamMode = 'size';
      teamSizeVal = Math.max(2, parseInt(e.target.value, 10) || 2);
    });
  }

  // Input custom count
  const inputCount = container.querySelector('#inputTeamCount');
  if (inputCount) {
    inputCount.addEventListener('change', (e) => {
      teamMode = 'count';
      teamCountVal = Math.max(2, parseInt(e.target.value, 10) || 2);
    });
  }

  // Generate button
  const genBtn = container.querySelector('#btnGenTeams');
  if (genBtn) {
    genBtn.addEventListener('click', () => {
      if (!students || students.length === 0) {
        alert('No students in this class. Go to "Class Lists" to add students.');
        return;
      }
      const val = teamMode === 'size' ? teamSizeVal : teamCountVal;
      currentTeams = generateTeams(students, teamMode, val);
      renderTeamsTab(container, activeClass);
    });
  }

  // Copy teams button
  const copyBtn = container.querySelector('#btnCopyTeams');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = formatTeamsText(currentTeams);
      navigator.clipboard.writeText(text).then(() => {
        copyBtn.textContent = 'Copied! ✓';
        setTimeout(() => {
          if (copyBtn) copyBtn.textContent = '📋 Copy Teams';
        }, 1800);
      }).catch(() => {
        alert('Unable to copy to clipboard.');
      });
    });
  }
}

/**
 * Render Class Lists Management Tab.
 */
function renderClassesTab(container, activeClass, classes) {
  const students = activeClass ? activeClass.students : [];

  container.innerHTML = `
    <div class="tt-classes-manager">
      <!-- CLASS ACTIONS TOOLBAR -->
      <div class="tt-manage-class-bar">
        <label style="font-size: 0.84rem; font-weight: 600;">Class Name:</label>
        <input 
          type="text" 
          class="tt-class-name-input" 
          id="inputClassName" 
          value="${activeClass ? activeClass.name : ''}" 
          placeholder="e.g. 7 Mathematics (Period 2)"
        />
        <button type="button" class="btn btn-sm" id="btnSaveClassName">Rename</button>
        <button type="button" class="btn btn-sm btn-primary" id="btnNewClass">+ New Class</button>
        <button type="button" class="btn btn-sm" id="btnDeleteClass" style="color: var(--accent-red);" title="Delete this class">Delete</button>
      </div>

      <!-- CURRENT ROSTER -->
      <div class="tt-roster-box">
        <div class="tt-roster-header">
          <h4>Students (${students.length})</h4>
          <span style="font-size: 0.8rem; color: var(--text-muted);">Click ✕ to remove</span>
        </div>

        <div class="tt-roster-chips">
          ${
            students.length > 0
              ? students
                  .map(
                    (st, idx) => `
                <span class="tt-student-pill">
                  <span>${st}</span>
                  <button type="button" class="tt-student-pill-remove" data-remove-idx="${idx}" title="Remove ${st}">✕</button>
                </span>
              `
                  )
                  .join('')
              : '<span style="color: var(--text-muted); font-size: 0.84rem;">No students in this class yet. Paste names or import a CSV below.</span>'
          }
        </div>

        <!-- Add Single Student -->
        <form class="tt-add-student-form" id="formAddStudent">
          <input type="text" class="tt-add-student-input" id="inputAddStudent" placeholder="Add a student name..." />
          <button type="submit" class="btn btn-sm btn-primary">+ Add</button>
        </form>
      </div>

      <!-- CSV PREVIEW (if pending) -->
      ${
        pendingCsvImport
          ? `
        <div class="tt-csv-preview">
          <div>
            <strong>CSV Preview:</strong> Found ${pendingCsvImport.students.length} students 
            (${pendingCsvImport.students.slice(0, 4).join(', ')}${pendingCsvImport.students.length > 4 ? '...' : ''})
          </div>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn btn-sm btn-primary" id="btnConfirmCsv">Save to Class</button>
            <button type="button" class="btn btn-sm" id="btnCancelCsv">Cancel</button>
          </div>
        </div>
      `
          : ''
      }

      <!-- IMPORT WAYS: PASTE & CSV -->
      <div class="tt-import-section">
        <!-- Paste List -->
        <div class="tt-import-card">
          <h5>Paste Names (One Per Line)</h5>
          <textarea class="tt-paste-textarea" id="textareaPasteNames" placeholder="Alex Chen&#10;Maya Patel&#10;Jordan Smith..."></textarea>
          <div style="display: flex; gap: 6px;">
            <button type="button" class="btn btn-sm btn-primary" id="btnAppendPasted">Add to Class</button>
            <button type="button" class="btn btn-sm" id="btnReplacePasted" title="Replace all current students with pasted list">Replace All</button>
          </div>
        </div>

        <!-- Import CSV -->
        <div class="tt-import-card">
          <h5>Import CSV File</h5>
          <label class="tt-csv-dropzone">
            <span>📄 Click to choose .csv file</span>
            <span style="font-size: 0.74rem;">Supports Name / Student / First Name columns</span>
            <input type="file" accept=".csv,.txt" id="inputCsvFile" style="display: none;" />
          </label>
        </div>
      </div>
    </div>
  `;

  // Rename Class
  const renameBtn = container.querySelector('#btnSaveClassName');
  if (renameBtn) {
    renameBtn.addEventListener('click', () => {
      const newName = container.querySelector('#inputClassName').value.trim();
      if (newName && activeClass) {
        updateClass(activeClass.id, newName, activeClass.students);
        renderModalContent();
      }
    });
  }

  // Create New Class
  const newClassBtn = container.querySelector('#btnNewClass');
  if (newClassBtn) {
    newClassBtn.addEventListener('click', () => {
      const name = prompt('Enter a name for the new class:', 'Year 7 Mathematics');
      if (name && name.trim()) {
        const created = createClass(name.trim(), []);
        pickerSession.reset(created.id);
        currentTeams = [];
        renderModalContent();
      }
    });
  }

  // Delete Class
  const deleteBtn = container.querySelector('#btnDeleteClass');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', () => {
      if (!activeClass) return;
      if (confirm(`Delete "${activeClass.name}"?`)) {
        deleteClass(activeClass.id);
        const newActive = getActiveClass();
        pickerSession.reset(newActive?.id);
        currentTeams = [];
        renderModalContent();
      }
    });
  }

  // Remove individual student
  container.querySelectorAll('[data-remove-idx]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-remove-idx'), 10);
      if (activeClass && !isNaN(idx)) {
        const updated = [...activeClass.students];
        updated.splice(idx, 1);
        updateClass(activeClass.id, activeClass.name, updated);
        pickerSession.reset(activeClass.id);
        renderModalContent();
      }
    });
  });

  // Add single student form
  const addForm = container.querySelector('#formAddStudent');
  if (addForm) {
    addForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = container.querySelector('#inputAddStudent');
      const name = input.value.trim();
      if (name && activeClass) {
        const updated = [...activeClass.students, name];
        updateClass(activeClass.id, activeClass.name, updated);
        pickerSession.reset(activeClass.id);
        input.value = '';
        renderModalContent();
      }
    });
  }

  // Paste Add
  const btnAppend = container.querySelector('#btnAppendPasted');
  if (btnAppend) {
    btnAppend.addEventListener('click', () => {
      const text = container.querySelector('#textareaPasteNames').value;
      const parsed = parsePastedNames(text);
      if (parsed.length > 0 && activeClass) {
        const updated = [...activeClass.students, ...parsed];
        updateClass(activeClass.id, activeClass.name, updated);
        pickerSession.reset(activeClass.id);
        renderModalContent();
      }
    });
  }

  // Paste Replace
  const btnReplace = container.querySelector('#btnReplacePasted');
  if (btnReplace) {
    btnReplace.addEventListener('click', () => {
      const text = container.querySelector('#textareaPasteNames').value;
      const parsed = parsePastedNames(text);
      if (parsed.length > 0 && activeClass) {
        if (confirm(`Replace entire roster with ${parsed.length} pasted students?`)) {
          updateClass(activeClass.id, activeClass.name, parsed);
          pickerSession.reset(activeClass.id);
          renderModalContent();
        }
      }
    });
  }

  // CSV File Upload
  const csvInput = container.querySelector('#inputCsvFile');
  if (csvInput) {
    csvInput.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === 'string') {
          const res = parseCsvNames(content);
          if (res.students.length === 0) {
            alert('No student names could be extracted from this CSV file.');
            return;
          }
          pendingCsvImport = res;
          renderModalContent();
        }
      };
      reader.readAsText(file);
    });
  }

  // Confirm CSV Preview
  const btnConfirmCsv = container.querySelector('#btnConfirmCsv');
  if (btnConfirmCsv) {
    btnConfirmCsv.addEventListener('click', () => {
      if (pendingCsvImport && activeClass) {
        const updated = [...activeClass.students, ...pendingCsvImport.students];
        updateClass(activeClass.id, activeClass.name, updated);
        pickerSession.reset(activeClass.id);
        pendingCsvImport = null;
        renderModalContent();
      }
    });
  }

  // Cancel CSV Preview
  const btnCancelCsv = container.querySelector('#btnCancelCsv');
  if (btnCancelCsv) {
    btnCancelCsv.addEventListener('click', () => {
      pendingCsvImport = null;
      renderModalContent();
    });
  }
}
