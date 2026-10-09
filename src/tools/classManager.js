/**
 * @file classManager.js
 * Teacher Tools data layer: class list management, localStorage persistence,
 * forgiving CSV parsing, Fisher-Yates random shuffle, and team generation.
 * 
 * Strict Privacy Rule: All data is saved strictly to browser localStorage.
 * No data is ever transmitted to any remote server or cloud.
 */

const STORAGE_KEY_CLASSES = 'y7maths_teacher_classes';
const STORAGE_KEY_ACTIVE = 'y7maths_active_class_id';

const DEFAULT_SAMPLE_CLASS = {
  id: 'sample-class-7m',
  name: 'Year 7 Mathematics (Sample)',
  students: [
    'Alex Chen',
    'Maya Patel',
    'Jordan Smith',
    'Sam Nguyen',
    'Chloe Taylor',
    'Ethan Walker',
    'Zoe Martin',
    'Liam O\'Connor',
    'Sophia Davis',
    'Noah Wilson',
    'Olivia Brown',
    'Lucas Harris'
  ]
};

/**
 * Fisher-Yates shuffle algorithm for fair browser-side randomisation.
 * @template T
 * @param {Array<T>} array
 * @returns {Array<T>} A newly shuffled array
 */
export function shuffleArray(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Load all saved classes from localStorage.
 * @returns {Array<{ id: string, name: string, students: string[] }>}
 */
export function getClasses() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CLASSES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('[TeacherTools] Could not parse stored classes:', err);
  }

  // Seed default sample class if no classes exist
  const initial = [DEFAULT_SAMPLE_CLASS];
  saveClasses(initial);
  return initial;
}

/**
 * Persist classes array to localStorage.
 * @param {Array<{ id: string, name: string, students: string[] }>} classes
 */
export function saveClasses(classes) {
  try {
    localStorage.setItem(STORAGE_KEY_CLASSES, JSON.stringify(classes));
  } catch (err) {
    console.error('[TeacherTools] Failed to save classes to localStorage:', err);
  }
}

/**
 * Get active class ID from localStorage.
 * @returns {string}
 */
export function getActiveClassId() {
  const classes = getClasses();
  try {
    const active = localStorage.getItem(STORAGE_KEY_ACTIVE);
    if (active && classes.some((c) => c.id === active)) {
      return active;
    }
  } catch (err) {
    // Ignore error
  }
  return classes[0]?.id || '';
}

/**
 * Set active class ID.
 * @param {string} id
 */
export function setActiveClassId(id) {
  try {
    localStorage.setItem(STORAGE_KEY_ACTIVE, id);
  } catch (err) {
    // Ignore error
  }
}

/**
 * Get active class object.
 * @returns {{ id: string, name: string, students: string[] }|null}
 */
export function getActiveClass() {
  const classes = getClasses();
  const activeId = getActiveClassId();
  return classes.find((c) => c.id === activeId) || classes[0] || null;
}

/**
 * Create and save a new class.
 * @param {string} name
 * @param {string[]} [students=[]]
 * @returns {{ id: string, name: string, students: string[] }}
 */
export function createClass(name, students = []) {
  const classes = getClasses();
  const id = `class-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const cleanName = String(name || 'New Class').trim();
  const newClass = {
    id,
    name: cleanName,
    students: cleanStudentsList(students)
  };
  classes.push(newClass);
  saveClasses(classes);
  setActiveClassId(id);
  return newClass;
}

/**
 * Update an existing class.
 * @param {string} id
 * @param {string} name
 * @param {string[]} students
 * @returns {boolean}
 */
export function updateClass(id, name, students) {
  const classes = getClasses();
  const idx = classes.findIndex((c) => c.id === id);
  if (idx === -1) return false;

  classes[idx].name = String(name || classes[idx].name).trim();
  classes[idx].students = cleanStudentsList(students);
  saveClasses(classes);
  return true;
}

/**
 * Delete a class by ID.
 * @param {string} id
 * @returns {boolean}
 */
export function deleteClass(id) {
  let classes = getClasses();
  if (classes.length <= 1) {
    // If deleting last class, replace with empty class
    classes = [{
      id: `class-${Date.now()}`,
      name: 'Year 7 Class',
      students: []
    }];
    saveClasses(classes);
    setActiveClassId(classes[0].id);
    return true;
  }

  classes = classes.filter((c) => c.id !== id);
  saveClasses(classes);

  const currentActive = getActiveClassId();
  if (currentActive === id) {
    setActiveClassId(classes[0].id);
  }
  return true;
}

/**
 * Parse plain-text pasted lines into cleaned student names.
 * @param {string} text
 * @returns {string[]}
 */
export function parsePastedNames(text) {
  if (!text) return [];
  const lines = text.split(/\r?\n/);
  return cleanStudentsList(lines);
}

/**
 * Forgiving CSV parser for student rosters.
 * Handles single column, quoted values, or multi-column CSVs with name headers.
 * 
 * @param {string} csvText
 * @returns {{ students: string[], detectedHeader: string|null, totalRows: number }}
 */
export function parseCsvNames(csvText) {
  if (!csvText || !csvText.trim()) {
    return { students: [], detectedHeader: null, totalRows: 0 };
  }

  const rawLines = csvText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (rawLines.length === 0) {
    return { students: [], detectedHeader: null, totalRows: 0 };
  }

  // Parse lines into cell arrays
  const rows = rawLines.map((line) => parseCsvLine(line));

  // Check header row for common name column indicators
  const headerRow = rows[0].map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));
  const candidateNames = [
    'name',
    'student',
    'studentname',
    'firstname',
    'fullname',
    'preferredname',
    'givenname'
  ];

  let nameColIdx = -1;
  let detectedHeader = null;

  for (let c = 0; c < headerRow.length; c++) {
    const colVal = headerRow[c];
    if (candidateNames.includes(colVal)) {
      nameColIdx = c;
      detectedHeader = rows[0][c];
      break;
    }
  }

  let studentRows = [];

  if (nameColIdx !== -1) {
    // Header row found, use that column from row 1 onward
    for (let r = 1; r < rows.length; r++) {
      if (rows[r][nameColIdx]) {
        studentRows.push(rows[r][nameColIdx]);
      }
    }
  } else {
    // No explicit header recognized
    // If row 0 looks like a header, skip it; otherwise include it
    const firstCell = String(rows[0][0] || '').toLowerCase().trim();
    const startsWithHeaderWord = ['name', 'student', 'id', 'first', 'last'].includes(firstCell);
    const startRow = startsWithHeaderWord ? 1 : 0;

    for (let r = startRow; r < rows.length; r++) {
      if (rows[r][0]) {
        studentRows.push(rows[r][0]);
      }
    }
  }

  const cleaned = cleanStudentsList(studentRows);
  return {
    students: cleaned,
    detectedHeader,
    totalRows: rows.length
  };
}

/**
 * Parse a single CSV line respecting quotes.
 * @param {string} text
 * @returns {string[]}
 */
function parseCsvLine(text) {
  const result = [];
  let cur = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += ch;
    }
  }
  result.push(cur.trim());
  return result;
}

/**
 * Filter, trim, and remove empty values.
 * @param {string[]} list
 * @returns {string[]}
 */
export function cleanStudentsList(list) {
  if (!Array.isArray(list)) return [];
  const seen = new Set();
  const result = [];

  for (const item of list) {
    if (!item) continue;
    const clean = String(item).replace(/^["']|["']$/g, '').trim();
    if (clean.length > 0) {
      // Keep case-sensitive names, ignore exact duplicates
      const key = clean.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(clean);
      }
    }
  }

  return result;
}

/**
 * Random student picker session with no-repeat pool tracking.
 */
export class RandomPickerSession {
  constructor(classId = null) {
    this.classId = classId;
    this.pool = [];
    this.history = [];
    this.currentStudent = null;
    this.reset();
  }

  reset(classId = null) {
    if (classId) this.classId = classId;
    const cls = this.classId
      ? getClasses().find((c) => c.id === this.classId)
      : getActiveClass();

    const students = cls ? [...cls.students] : [];
    this.pool = shuffleArray(students);
    this.history = [];
    this.currentStudent = null;
  }

  /**
   * Pick next random student.
   * @param {boolean} [avoidRepeats=true]
   * @returns {{ student: string|null, remainingCount: number, wasRefilled: boolean, totalCount: number }}
   */
  pick(avoidRepeats = true) {
    const cls = this.classId
      ? getClasses().find((c) => c.id === this.classId)
      : getActiveClass();

    const totalStudents = cls ? cls.students : [];
    if (totalStudents.length === 0) {
      this.currentStudent = null;
      return { student: null, remainingCount: 0, wasRefilled: false, totalCount: 0 };
    }

    if (!avoidRepeats) {
      // Pure random pick from full roster
      const randIdx = Math.floor(Math.random() * totalStudents.length);
      const student = totalStudents[randIdx];
      this.currentStudent = student;
      this.history.unshift(student);
      if (this.history.length > 20) this.history.pop();
      return {
        student,
        remainingCount: totalStudents.length,
        wasRefilled: false,
        totalCount: totalStudents.length
      };
    }

    let wasRefilled = false;
    if (this.pool.length === 0) {
      // Refill and reshuffle pool
      this.pool = shuffleArray(totalStudents);
      wasRefilled = true;
    }

    const student = this.pool.pop();
    this.currentStudent = student;
    this.history.unshift(student);
    if (this.history.length > 30) this.history.pop();

    return {
      student,
      remainingCount: this.pool.length,
      wasRefilled,
      totalCount: totalStudents.length
    };
  }

  getStatus() {
    const cls = this.classId
      ? getClasses().find((c) => c.id === this.classId)
      : getActiveClass();
    const totalCount = cls ? cls.students.length : 0;
    return {
      currentStudent: this.currentStudent,
      remainingCount: this.pool.length,
      totalCount,
      history: [...this.history]
    };
  }
}

/**
 * Generate fairly shuffled teams from a student list.
 * Distributes uneven remainders sensibly so no student is left alone.
 * 
 * @param {string[]} students
 * @param {'size'|'count'} mode - 'size' for team size (e.g. 2, 3, 4), 'count' for number of teams
 * @param {number} value - target size or count
 * @returns {Array<{ name: string, members: string[] }>}
 */
export function generateTeams(students, mode, value) {
  const cleanList = cleanStudentsList(students);
  if (cleanList.length === 0) return [];

  const shuffled = shuffleArray(cleanList);
  const total = shuffled.length;

  if (mode === 'count') {
    // Fixed number of teams
    const teamCount = Math.max(1, Math.min(Math.floor(value), total));
    const teams = Array.from({ length: teamCount }, (_, i) => ({
      name: `Team ${i + 1}`,
      members: []
    }));

    // Deal students round-robin for perfectly balanced distribution
    shuffled.forEach((student, idx) => {
      teams[idx % teamCount].members.push(student);
    });

    return teams;
  }

  // mode === 'size'
  const teamSize = Math.max(2, Math.floor(value));

  if (total <= teamSize) {
    return [{ name: 'Team 1', members: shuffled }];
  }

  const numTeams = Math.floor(total / teamSize);
  const remainder = total % teamSize;

  const teams = [];
  let curIndex = 0;

  for (let i = 0; i < numTeams; i++) {
    teams.push({
      name: `Team ${i + 1}`,
      members: shuffled.slice(curIndex, curIndex + teamSize)
    });
    curIndex += teamSize;
  }

  // Handle remainders sensibly:
  // If remainder is 1, add it to the last team (e.g. 3, 3, 4 instead of 3, 3, 3, 1)
  // If remainder is 2+, distribute members across the existing teams or make an extra team
  const remainingStudents = shuffled.slice(curIndex);
  if (remainingStudents.length === 1 && teams.length > 0) {
    teams[teams.length - 1].members.push(remainingStudents[0]);
  } else if (remainingStudents.length > 0) {
    // If remainder is at least 2, either make a smaller team or distribute
    if (remainder >= 2 && teamSize >= 3) {
      teams.push({
        name: `Team ${teams.length + 1}`,
        members: remainingStudents
      });
    } else {
      // Distribute round-robin among earlier teams
      remainingStudents.forEach((st, idx) => {
        teams[idx % teams.length].members.push(st);
      });
    }
  }

  return teams;
}

/**
 * Format teams into clean copyable text.
 * @param {Array<{ name: string, members: string[] }>} teams
 * @returns {string}
 */
export function formatTeamsText(teams) {
  return teams
    .map((t) => {
      const header = `${t.name} (${t.members.length} students)`;
      const members = t.members.map((m) => `  • ${m}`).join('\n');
      return `${header}\n${members}`;
    })
    .join('\n\n');
}
