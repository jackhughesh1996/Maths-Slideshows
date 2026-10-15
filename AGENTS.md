# AGENTS.md

Operating guidelines and repository conventions for automated agents and engineers working on this codebase.

## 1. Project Overview & Architecture

A static, client-side classroom slideshow web application for Year 7 Mathematics, engineered for interactive whiteboards and projectors. Built with vanilla JavaScript, semantic HTML, CSS, Vite, and KaTeX. No external runtime UI frameworks (no React/Vue/Tailwind/backend).

- **Multi-page setup**:
  - Course library home page: `index.html` (served at `/`)
  - Dedicated static lesson pages: `lessons/<id>/index.html` (served at `/lessons/<id>/`)
  - Legacy query router: `/?lesson=<id>` redirects to `/lessons/<id>/` via `src/main.js`
- **Separation of concerns**:
  - Slideshow engine (`src/slideshow/`): navigation, progressive reveals, whiteboard pen (`drawing.js`), timer (`timer.js`), math formatting (`math.js`), slide renderer (`renderer.js`), and schema validation (`validator.js`).
  - Lesson definitions (`src/lessons/`): structured declarative JS modules (8E, 8F, 8G, 8H, 8I).
  - Teacher tools (`src/tools/`): random student picker and team generator with localStorage class management.

## 2. Lesson Registration

Lessons are registered strictly via `src/lessons/manifest.js`:

```javascript
export const lessonManifest = [
  { id: '8E', path: './8E.js' },
  { id: '8F', path: './8F.js' },
  { id: '8G', path: './8G.js' },
  { id: '8H', path: './8H.js' },
  { id: '8I', path: './8I.js' },
];
```

- Each lesson module in `src/lessons/<id>.js` exports a default configuration object conforming to `validateLesson()`.
- **Note on `src/lessons/index.js`**: An obsolete legacy registry that only references 8E and 8F. Do not register new lessons here; all dynamic loading and generators consume `manifest.js`.

## 3. Generated Files

The following files and directories are generated artifacts. Do not edit them directly:

| Generated Path | Generator Script | When Created / Updated |
| :--- | :--- | :--- |
| `src/generated/lesson-catalog.js` | `scripts/generate-lesson-catalog.js` | Dev server start (`npm run dev`) & build (`npm run build`) |
| `lessons/<id>/index.html` | `scripts/generate-lesson-pages.js` | Dev server start (`npm run dev`) & build (`npm run build`) |
| `dist/` | `vite build` | Production build (`npm run build`) |
| `public/downloads/*.html` | `scripts/generate-launchers.js` | Production build (`npm run build`) or `npm run generate-launchers` |
| `dist/downloads/*.html` | `scripts/generate-launchers.js` | Production build (`npm run build`) |

## 4. Current Commands

- **Development server**: `npm run dev`
  Runs `generate-lesson-catalog.js` and `generate-lesson-pages.js`, then starts Vite on port 3000 (`0.0.0.0:3000`).
- **Type check & lint**: `npm run lint`
  Runs TypeScript type checking without emitting files (`tsc --noEmit`).
- **Production build**: `npm run build`
  Runs catalogue generation, page generation, Vite build, and student HTML launcher generation.
- **Student launchers**: `npm run generate-launchers`
  Runs `scripts/generate-launchers.js` independently.
- **Math formula audit**: `node scripts/audit-math.js`
  KaTeX audit script (currently audits 8E and 8F).
- **Regression tests**: `node --test scripts/test-8i-regressions.mjs`
  Node test runner executing regression checks for simulation state, animations, and math rendering.

## 5. Non-Negotiable Operational Rules

When executing tasks or reliability improvements:

1. **Preserve lesson content, appearance, URLs, reveal behaviour and teacher tools**:
   Do not alter teaching text, slide styling, canonical URLs (`/lessons/<id>/`), step-by-step reveal sequences, or teacher utilities (drawing pen, timer, random picker, team generator) unless explicitly requested.
2. **Make only the requested change**:
   Avoid opportunistic or broad refactoring beyond the explicit task scope. Keep changes minimal, clean, and isolated.
3. **Never weaken checks merely to make existing lessons pass**:
   Validators, linters, schemas, and test assertions must maintain strict standards. Do not relax rules or delete checks to mask defects.
4. **Report pre-existing failures separately**:
   Distinguish between issues introduced by the current change and pre-existing flaws or warnings in earlier code.
5. **Run relevant checks and report what actually ran**:
   Always execute and report the specific commands tested (lint, schema validation, tests, build) along with exact output or status codes. Do not state or imply visual inspection unless actual visual checks were performed.
