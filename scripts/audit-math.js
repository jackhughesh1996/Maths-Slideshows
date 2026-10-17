import { lessonManifest } from '../src/lessons/manifest.js';
import { auditLessonMath, formatMathIssue } from '../src/slideshow/mathExpressions.js';

if (!Array.isArray(lessonManifest) || lessonManifest.length === 0) {
  throw new Error('Math audit requires a non-empty lesson manifest.');
}

let expressions = 0;
let errors = 0;
for (const entry of lessonManifest) {
  try {
    const { default: lesson } = await import(new URL(entry.path, new URL('../src/lessons/', import.meta.url)));
    if (!lesson || lesson.id !== entry.id || !Array.isArray(lesson.slides) || lesson.slides.length === 0) {
      throw new Error('Expected a matching lesson ID and a non-empty slides array.');
    }
    const result = auditLessonMath(lesson);
    expressions += result.expressions;
    errors += result.issues.length;
    for (const issue of result.issues) console.error(formatMathIssue(issue));
    console.log(`${entry.id}: ${result.expressions} expressions, ${result.issues.length} errors`);
  } catch (error) {
    errors++;
    console.error(`[MathAudit: ${entry.id}] Could not audit ${entry.path}: ${error.message}`);
  }
}
console.log(`Math audit: ${lessonManifest.length} lessons, ${expressions} expressions, ${errors} errors.`);
process.exitCode = errors ? 1 : 0;
