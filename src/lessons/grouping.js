/**
 * @file grouping.js
 * Hierarchical grouping and search filtering for lesson library navigation.
 * Dynamically organizes lessons by course (Subject & Year) and unit/folder
 * derived entirely from lesson metadata.
 */

/**
 * Format course label from lesson metadata.
 * @param {Object} lesson
 * @returns {string} e.g. "Year 7 Mathematics"
 */
export function getLessonCourse(lesson) {
  const subject = lesson.subject ? String(lesson.subject).trim() : 'Mathematics';
  let yearLevel = lesson.yearLevel !== undefined ? lesson.yearLevel : 'Year 7';
  if (typeof yearLevel === 'number') {
    yearLevel = `Year ${yearLevel}`;
  } else {
    yearLevel = String(yearLevel).trim();
    if (!yearLevel.toLowerCase().startsWith('year') && /^\d+$/.test(yearLevel)) {
      yearLevel = `Year ${yearLevel}`;
    }
  }
  return `${yearLevel} ${subject}`;
}

/**
 * Format folder label from lesson metadata.
 * @param {Object} lesson
 * @returns {string} e.g. "Chapter 8 — Statistics and Probability"
 */
export function getLessonFolder(lesson) {
  const unit = lesson.unit ? String(lesson.unit).trim() : '';
  const folder = lesson.folder ? String(lesson.folder).trim() : (lesson.chapter ? String(lesson.chapter).trim() : '');

  if (unit && folder) {
    if (folder.toLowerCase().includes(unit.toLowerCase())) {
      return folder;
    }
    return `${unit} — ${folder}`;
  }
  if (unit) return unit;
  if (folder) return folder;
  return 'General';
}

/**
 * Safely resolve slide count for a lesson object or metadata record.
 * Prefers actual slides.length when a valid slides array exists.
 * Otherwise uses slideCount if it is a non-negative integer, defaulting to 0.
 * @param {Object} lesson
 * @returns {number}
 */
export function getLessonSlideCount(lesson) {
  if (!lesson || typeof lesson !== 'object') return 0;
  if (Array.isArray(lesson.slides)) {
    return lesson.slides.length;
  }
  if (typeof lesson.slideCount === 'number' && Number.isInteger(lesson.slideCount) && lesson.slideCount >= 0) {
    return lesson.slideCount;
  }
  return 0;
}

/**
 * Generate a slug identifier for a folder.
 * @param {string} course
 * @param {string} folderTitle
 * @returns {string}
 */
export function getFolderId(course, folderTitle) {
  return `${course}-${folderTitle}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

/**
 * Check if a lesson matches the search filter query.
 * Matches against lesson id, title, unit, folder, chapter, subject, and topics.
 * @param {Object} lesson
 * @param {string} query
 * @returns {boolean}
 */
export function matchesLessonSearch(lesson, query) {
  if (!query || !query.trim()) return true;
  const q = query.trim().toLowerCase();

  if (lesson.id && String(lesson.id).toLowerCase().includes(q)) return true;
  if (lesson.title && String(lesson.title).toLowerCase().includes(q)) return true;
  if (lesson.unit && String(lesson.unit).toLowerCase().includes(q)) return true;
  if (lesson.folder && String(lesson.folder).toLowerCase().includes(q)) return true;
  if (lesson.chapter && String(lesson.chapter).toLowerCase().includes(q)) return true;
  if (lesson.subject && String(lesson.subject).toLowerCase().includes(q)) return true;
  if (lesson.yearLevel !== undefined && String(lesson.yearLevel).toLowerCase().includes(q)) return true;

  if (Array.isArray(lesson.topics)) {
    if (lesson.topics.some((topic) => String(topic).toLowerCase().includes(q))) return true;
  }

  return false;
}

/**
 * Extract integer number from a chapter/unit string for natural sorting.
 * e.g. "Chapter 8 — Statistics..." -> 8
 * @param {string} text
 * @returns {number}
 */
function extractNumber(text) {
  const match = text.match(/(?:Chapter|Unit|\bCh\.?)\s*(\d+)/i) || text.match(/\b(\d+)\b/);
  return match ? parseInt(match[1], 10) : Infinity;
}

/**
 * Sort folders by natural chapter number, then alphabetically.
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 */
function compareFolders(a, b) {
  const numA = extractNumber(a.title);
  const numB = extractNumber(b.title);
  if (numA !== numB) {
    return numA - numB;
  }
  return a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Sort lessons within a folder by lesson code (e.g. 8E before 8F).
 * @param {Object} a
 * @param {Object} b
 * @returns {number}
 */
function compareLessons(a, b) {
  if (a.order !== undefined && b.order !== undefined) {
    return a.order - b.order;
  }
  return String(a.id).localeCompare(String(b.id), undefined, { numeric: true, sensitivity: 'base' });
}

/**
 * Groups a collection of lessons into hierarchical course and folder trees.
 * Filters lessons when a search query is supplied.
 * 
 * @param {Array<Object>} lessonsList
 * @param {string} [searchQuery='']
 * @returns {{
 *   courses: Array<{
 *     courseTitle: string,
 *     totalLessons: number,
 *     folders: Array<{
 *       id: string,
 *       title: string,
 *       unit: string,
 *       folder: string,
 *       lessonCount: number,
 *       totalSlides: number,
 *       lessons: Array<Object>
 *     }>
 *   }>,
 *   totalMatchedLessons: number,
 *   totalAllLessons: number
 * }}
 */
export function groupLessonsHierarchically(lessonsList, searchQuery = '') {
  const isSearching = Boolean(searchQuery && searchQuery.trim());
  let totalMatched = 0;
  const totalAll = lessonsList.length;

  // Map structure: courseTitle -> (folderTitle -> lessons[])
  const courseMap = new Map();

  lessonsList.forEach((lesson) => {
    const courseTitle = getLessonCourse(lesson);
    const folderTitle = getLessonFolder(lesson);
    const matches = matchesLessonSearch(lesson, searchQuery);

    if (matches) {
      totalMatched++;
    }

    if (!courseMap.has(courseTitle)) {
      courseMap.set(courseTitle, new Map());
    }

    const folderMap = courseMap.get(courseTitle);
    if (!folderMap.has(folderTitle)) {
      folderMap.set(folderTitle, {
        allLessons: [],
        matchedLessons: [],
        unit: lesson.unit || '',
        folder: lesson.folder || lesson.chapter || ''
      });
    }

    const folderData = folderMap.get(folderTitle);
    folderData.allLessons.push(lesson);
    if (matches) {
      folderData.matchedLessons.push(lesson);
    }
  });

  const courses = [];

  // Build sorted hierarchy
  for (const [courseTitle, folderMap] of courseMap.entries()) {
    const folders = [];

    for (const [folderTitle, folderData] of folderMap.entries()) {
      const activeLessons = isSearching ? folderData.matchedLessons : folderData.allLessons;

      // Skip folders with no matches if actively filtering
      if (isSearching && activeLessons.length === 0) {
        continue;
      }

      // Sort lessons within this folder
      const sortedLessons = [...activeLessons].sort(compareLessons);

      const totalSlides = sortedLessons.reduce((sum, l) => sum + getLessonSlideCount(l), 0);

      folders.push({
        id: getFolderId(courseTitle, folderTitle),
        title: folderTitle,
        unit: folderData.unit,
        folder: folderData.folder,
        lessonCount: sortedLessons.length,
        totalAllCountInFolder: folderData.allLessons.length,
        totalSlides,
        lessons: sortedLessons
      });
    }

    // Sort folders in course
    folders.sort(compareFolders);

    if (folders.length > 0) {
      const courseLessonsCount = folders.reduce((sum, f) => sum + f.lessonCount, 0);
      courses.push({
        courseTitle,
        totalLessons: courseLessonsCount,
        folders
      });
    }
  }

  // Sort courses naturally
  courses.sort((a, b) => a.courseTitle.localeCompare(b.courseTitle, undefined, { numeric: true }));

  return {
    courses,
    totalMatchedLessons: totalMatched,
    totalAllLessons: totalAll
  };
}
