/**
 * @file index.js
 * Central lesson registry for Year 7 Mathematics.
 * Adding a future lesson only requires importing it here and registering in the dictionary.
 */

import lesson8E from './8E.js';
import lesson8F from './8F.js';
import { validateLesson } from '../slideshow/validator.js';
import {
  groupLessonsHierarchically,
  getLessonCourse,
  getLessonFolder,
  getFolderId,
  matchesLessonSearch
} from './grouping.js';

export {
  validateLesson,
  groupLessonsHierarchically,
  getLessonCourse,
  getLessonFolder,
  getFolderId,
  matchesLessonSearch
};

export const lessons = {
  '8E': lesson8E,
  '8F': lesson8F,
};

// Validate registered lessons on load
Object.values(lessons).forEach((lesson) => {
  validateLesson(lesson);
});

/**
 * Get lesson object by ID (case-insensitive).
 * @param {string} id
 * @returns {Object|null}
 */
export function getLesson(id) {
  if (!id) return null;
  const key = String(id).trim().toUpperCase();
  return lessons[key] || null;
}

/**
 * Get all registered lessons as an array.
 * @returns {Array<Object>}
 */
export function getAllLessons() {
  return Object.values(lessons);
}
