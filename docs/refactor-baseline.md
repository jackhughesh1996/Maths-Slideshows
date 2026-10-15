# Refactor Baseline & Validation Results

Initial assessment and command execution results recorded prior to commencing reliability improvements.

Date: 2026-10-15
Environment: Node.js (Linux x86_64), Vite 8.3.4, TypeScript 7.0.2

---

## 1. Summary of Execution Results

| Check / Command | Description | Status | Exit Code | Notes |
| :--- | :--- | :--- | :--- | :--- |
| `npm run lint` | TypeScript type check (`tsc --noEmit`) | **PASS** | 0 | Clean; 0 diagnostics or errors. |
| `node scripts/generate-lesson-catalog.js` | Lesson schema validation & catalogue generation | **PASS** | 0 | Validated all 5 lessons (8E, 8F, 8G, 8H, 8I) using `validateLesson()`. |
| `node scripts/generate-lesson-pages.js` | Static HTML entry page generator | **PASS** | 0 | Generated `lessons/<id>/index.html` for 8E, 8F, 8G, 8H, 8I. |
| `node --test scripts/test-8i-regressions.mjs` | Simulation & animation regression tests | **PASS** | 0 | 3/3 subtests passed (widget DOM, simulation totals, timer cancellation). |
| `node scripts/audit-math.js` | KaTeX mathematical expression audit | **PASS** | 0 | 117 expressions tested across 8E and 8F; 0 errors, 0 warnings. |
| `npm run build` | Full production build pipeline | **PASS** | 0 | Generated catalogue, static pages, Vite bundle, and launcher HTML files. |

---

## 2. Command Details & Observed Output

### 2.1 TypeScript Lint (`npm run lint`)
- **Command**: `npm run lint` (`tsc --noEmit`)
- **Result**: Success (exit code 0). No type mismatches, missing imports, or compiler errors found.

### 2.2 Lesson Catalogue Generator (`node scripts/generate-lesson-catalog.js`)
- **Command**: `node scripts/generate-lesson-catalog.js`
- **Result**: Success (exit code 0).
- **Details**:
  - `8E`: Stem-and-Leaf Plots (12 slides) — Valid
  - `8F`: Sector Graphs and Divided Bar Graphs (12 slides) — Valid
  - `8G`: Describing Probability (13 slides) — Valid
  - `8H`: Theoretical Probability (15 slides) — Valid
  - `8I`: Experimental Probability in Single-Step Experiments (15 slides) — Valid
  - Emitted `src/generated/lesson-catalog.js` (5 lessons).

### 2.3 Static Lesson Page Generator (`node scripts/generate-lesson-pages.js`)
- **Command**: `node scripts/generate-lesson-pages.js`
- **Result**: Success (exit code 0).
- **Details**: Created/verified static entry pages at `lessons/8E/index.html` through `lessons/8I/index.html`.

### 2.4 Simulation Regression Tests (`node --test scripts/test-8i-regressions.mjs`)
- **Command**: `node --test scripts/test-8i-regressions.mjs`
- **Result**: Success (exit code 0).
- **Details**:
  - `summary preserves HTML structure and renders real KaTeX in populated state`: ok (18.8 ms)
  - `initialisation stays empty and graph totals agree after explicit actions`: ok (3.3 ms)
  - `cancelled callbacks cannot commit a later animation; navigation commits once`: ok (2.0 ms)
  - Tests: 3 passed, 0 failed, duration 214 ms.

### 2.5 Math Formula Audit (`node scripts/audit-math.js`)
- **Command**: `node scripts/audit-math.js`
- **Result**: Success (exit code 0).
- **Scope note**: Script only imports and audits lessons `8E` and `8F`. Tested 117 expressions; 0 errors, 0 warnings.
- **Supplemental test on 8G, 8H, 8I**:
  - Ran math verification over lessons 8G, 8H, 8I. Tested 280 expressions with KaTeX; 0 syntax errors.
  - KaTeX strict-mode warning noted in `src/lessons/8H.js:289` where `"$\%$"` in a JavaScript string literal evaluates to `$%$`, causing KaTeX to warn that a comment character `%` is terminating math mode without a newline.

### 2.6 Full Production Build (`npm run build`)
- **Command**: `npm run build`
- **Result**: Success (exit code 0).
- **Outputs**:
  - 5 static lesson pages (`dist/lessons/<id>/index.html`)
  - Course library (`dist/index.html`)
  - KaTeX webfonts and bundled assets in `dist/assets/`
  - 5 launcher files in `dist/downloads/` and `public/downloads/`
- **Observed build warnings**:
  - Vite/Rolldown bundler warning:
    `[INEFFECTIVE_DYNAMIC_IMPORT] src/lessons/manifest.js is dynamically imported by src/lesson-entry.js but also statically imported by src/lesson-entry.js, dynamic import will not move module into another chunk.`
  - Launcher generator notice:
    `[Launcher Generator] Warning: No production SITE_URL configured. Using development fallback URL: http://localhost:3000` (expected for local development builds without `SITE_URL`).

---

## 3. Pre-Existing Anomalies & Observations (To Report Separately)

1. **Obsolete Lesson Registry**:
   `src/lessons/index.js` only imports 8E and 8F and is marked obsolete in documentation (`LESSON_AUTHORING.md`), but still exists in the codebase.
2. **Hardcoded Math Audit Scope**:
   `scripts/audit-math.js` hardcodes imports for `8E.js` and `8F.js` only, omitting `8G`, `8H`, and `8I`.
3. **Rolldown Import Warning**:
   In `src/lesson-entry.js`, `lessonManifest` is statically imported (`import { lessonManifest } from './lessons/manifest.js';`), while Vite also detects dynamic import patterns, triggering an `[INEFFECTIVE_DYNAMIC_IMPORT]` warning during build.
4. **KaTeX Comment Character in 8H**:
   `src/lessons/8H.js:289` contains `"Convert fraction to decimal and $\%$"`. In JavaScript string syntax, `\%` is not an escaped backslash, producing a raw `%` that acts as a LaTeX comment before the ending `$`.

---

## 4. Verification Note

No visual rendering verification on live display was performed during this baseline setup phase. Only automated command-line builds, type checks, unit regressions, and schema validations were executed and reported.
