# Year 7 Mathematics Classroom Slideshows

A static, lightweight slideshow web application engineered for classroom teachers projecting onto interactive whiteboards and projectors.

Built with **vanilla JavaScript**, **semantic HTML**, **CSS**, and locally-bundled **KaTeX** using **Vite**. Zero external runtime frameworks (no React, no Vue, no Angular, no Tailwind, no backend databases, no CDN dependencies).

---

## 1. Features

- **Classroom Interactive Board Ready**: Designed specifically for classroom display with high text contrast, dark ink on warm off-white canvas, and no vertical scrolling in presentation mode.
- **Strict Separation of Engine and Content**: All slideshow behaviours (navigation, progressive reveals, board pen, timer, math rendering) belong to the engine. Lessons are defined as structured data files.
- **Static Multi-Page Architecture**:
  - Lightweight course library at `/` displaying lesson cards and metadata without eagerly bundling slideshow data or math engines.
  - Dedicated static lesson pages at `/lessons/<id>/` (e.g. `/lessons/8E/`).
  - Lazy-loaded lesson data modules and shared presentation engine on each lesson page.
  - Full backward-compatibility redirecting legacy `?lesson=<id>` URLs to canonical `/lessons/<id>/` routes.
- **Local KaTeX Mathematics**: Fully self-contained LaTeX rendering for inline (`$...$`) and display (`$$...$$` or formula blocks) mathematical expressions.
- **Progressive Reveals**: Spacebar or Right Arrow advances step-by-step through worked examples, guided solutions, and warm-ups. Previous step (`Left Arrow`) steps backward without losing state.
- **Isolated Board Annotation Pen**: Stylus/touch/mouse drawing layer with Pointer Events. Ink is stored per slide and preserved across window resize and fullscreen toggling.
- **Classroom Practice Timer**: Configurable countdown timer (e.g. 10 minutes) that automatically pauses when leaving a slide and restores remaining time when returning.
- **GitHub Pages Portability**: Configured with `base: './'` so it works anywhere—at domain root or inside any repository subpath (e.g., `https://username.github.io/year-7-mathematics-slideshows/`).
- **Teacher Classroom Tools**: Integrated student name picker (with no-repeat pool selection) and balanced team generator (pairs, 3s, 4s, or custom size/count). Saves multiple named classes locally in `localStorage` with CSV and clipboard import; zero cloud/backend storage. Pauses presentation keyboard shortcuts while open.

---

## 2. Getting Started

### Prerequisites
Node.js 20.19+ or 22.12+ (Node.js 24 is recommended, matching the CI/CD deployment environment) and npm, or [Bun](https://bun.sh/) 1.4+. Dependencies are tracked with `bun.lock`.

### Installation
```bash
npm install
# or
bun install
```

### Development Server
```bash
npm run dev
```
Runs the catalogue and static page generators once at startup (`scripts/generate-lesson-catalog.js` and `scripts/generate-lesson-pages.js`), then starts the local Vite dev server at `http://localhost:3000`.

*(Note: When registering a new lesson in `src/lessons/manifest.js`, restart `npm run dev` or rerun the generator scripts to generate the new lesson's static entry page and catalogue entry).*

### Type Checking & Linting
```bash
npm run lint
```
Runs TypeScript checks (`tsc --noEmit`) without emitting output. Lesson schema, mathematics and graph consistency validation run through the dev/build generators and regression tests; run `npm test` and `npm run audit:math` too.

### Mathematical Notation Audit

Run `npm run audit:math` to audit every lesson registered in
`src/lessons/manifest.js`. The command and lesson validation share the renderer's
math-expression detection and fail on malformed delimiters, invalid KaTeX, or
mathematical commands outside delimiters. Errors identify the lesson, slide,
nested property path and character offset.

Use `$...$` for inline math and `$$...$$` for display math. Dedicated `latex`,
`checkMath`, `calculation` and string-valued `fraction` fields contain raw LaTeX.
Escape literal dollars as `\$`; ordinary prices such as `$5 and $10` remain text.
Explicit `$25$` is a numeric formula. Inline backtick code is treated literally.

### Browser Smoke Tests

```bash
bun ci
npx playwright install --with-deps chromium
npm run test:browser
```

The Playwright suite builds the production site, starts a local Vite preview on
port 4173, and checks the library and every lesson registered in the manifest.
It exercises slide navigation and reveals, and fails on JavaScript errors,
failed essential local assets, external runtime requests, or visible KaTeX errors.
No GitHub Pages deployment or production URL is required. Port 4173 must be free;
the suite starts and stops its own server and does not reuse another process.

If Chromium is already installed, use
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium npm run test:browser`
to avoid downloading another browser. Browser tests run separately from `npm test`.

### Production Build
```bash
npm run build
```
Executes the full static production pipeline:
1. Generates `src/generated/lesson-catalog.js` from `src/lessons/manifest.js`.
2. Generates static lesson HTML entry pages in `lessons/<id>/index.html`.
3. Runs `vite build` to bundle the multi-page site into `dist/`.
4. Runs `scripts/generate-launchers.js` to create standalone student HTML launchers in `dist/downloads/`.

### Continuous Integration

The `CI` workflow (`.github/workflows/ci.yml`) runs on pull requests targeting
`main` and pushes to `main`. It uses Node.js 24, Bun and `bun ci`, then runs lint,
unit tests, the math audit, a production build and local Chromium browser tests.
It needs no repository secrets and does not use the live GitHub Pages site.
Superseded CI runs are cancelled independently of deployment.

For failures, open the pull request's **Checks** tab or the repository's
**Actions → CI** run and inspect the failing step's logs. Browser-test failures
also upload `playwright-failure-diagnostics` (HTML report and retained traces)
for seven days. Any failed check fails the CI job.

CI validates changes; it does not deploy pull requests. The separate Pages
workflow below continues deploying pushes to `main` with its production URL
and launcher validation. It runs independently of CI.

---

## 3. GitHub Pages Deployment

The repository uses an automated GitHub Actions workflow (`.github/workflows/deploy.yml`) to build, validate, and deploy the website to GitHub Pages on every push to `main` (or via manual `workflow_dispatch`).

### Workflow Details
1. **Trigger**: Push to the `main` branch or manual trigger via Actions tab.
2. **Setup & Dependencies**: Installs Node.js 24 and Bun, then runs `bun ci` for frozen dependency installation.
3. **Lint & Validation**: Runs `npm run lint` (`tsc --noEmit`) to verify code and lesson schemas.
4. **GitHub Pages Configuration**: Uses `actions/configure-pages@v5` to resolve the production base URL (e.g., repository subpath `https://<owner>.github.io/<repo>/`).
5. **Production Build with Strict URL Validation**: Executes `npm run build` with `SITE_URL` set to the resolved Pages base URL and `REQUIRE_PRODUCTION_SITE_URL=1` to guarantee production launchers target the canonical HTTPS domain.
6. **Verification Step**: Automatically inspects `src/generated/lesson-catalog.js` to verify that every registered lesson has an HTML page in `dist/lessons/<id>/index.html`, a launcher in `dist/downloads/`, and valid production redirect URLs.
7. **Deploy**: Uploads and deploys `dist/` directly via `actions/deploy-pages@v4`.

### Repository Configuration
In your GitHub repository settings under **Settings > Pages > Build and deployment**:
- Set **Source** to **GitHub Actions**.

No manual builds or `gh-pages` branch management are required.

---

## 4. Downloadable Student HTML Launchers

To make sharing individual lessons effortless for teachers and students, the application includes auto-generated HTML launcher files.

### What Launcher Files Are
- **Direct Lesson Redirection**: Each launcher file (e.g. `8E-stem-and-leaf-plots.html`) is a standalone, lightweight (~1 KB) HTML document that redirects directly to the canonical static lesson URL (`https://<site>/lessons/<id>/`).
- **No Duplication**: Launchers do **not** duplicate the slideshow engine, KaTeX, renderer, or styles. When a student opens the launcher file locally, it immediately redirects to the hosted lesson page while displaying a clean fallback link in case automatic redirection is disabled.
- **Requires Internet Access**: Launchers can be distributed via email, Google Classroom, USB drive, or intranet and opened locally from the student's computer, but an active internet connection is required to load the hosted presentation. They are not offline copies of the lessons.
- **Workflow**:
  1. The teacher downloads `8E-stem-and-leaf-plots.html` using the **Download launcher** button in the lesson library (or grabs it from `dist/downloads/`).
  2. The teacher shares the file with students.
  3. The student opens the HTML file, which redirects directly to the hosted static lesson at `/lessons/8E/`.

### Site URL Configuration
Launcher files redirect to your hosted website base URL. You can configure this in one central place:

1. **Option A (Environment Variable — Recommended)**:
   Set the `SITE_URL` variable before building:
   ```bash
   export SITE_URL="https://username.github.io/year-7-mathematics-slideshows"
   npm run build
   ```
2. **Option B (`site.config.js`)**:
   Edit the `productionUrl` property directly inside `site.config.js` without altering the rest of the configuration object (which contains `resolveBaseUrl()` and fallback resolvers):
   ```javascript
   // Inside site.config.js:
   export const siteConfig = {
     productionUrl: envUrl ? String(envUrl).trim().replace(/\/+$/, '') : 'https://username.github.io/year-7-mathematics-slideshows',
     // ... preserve developmentUrl and resolveBaseUrl()
   };
   ```

*Note on Local Development vs Production*:
- During local development builds, if no production URL is configured, the generator falls back to `http://localhost:3000` so local testing works.
- During release builds (such as CI/CD with `REQUIRE_PRODUCTION_SITE_URL=1`), strict URL validation ensures a valid, secure HTTPS production URL is present and loopback/localhost addresses are rejected before any files are generated or modified.

### Where Generated Launchers Appear
When you build the project (`npm run build` or `npm run generate-launchers`), launcher HTML files are generated automatically for every registered lesson in:
- `dist/downloads/` (for production distribution and static hosting)
- `public/downloads/` (for local development server serving)

Safe file cleanup automatically purges obsolete launchers from both folders when lessons are removed or renamed.

---

## 5. Architecture Overview

Abbreviated tree; `manifest.js` currently registers lessons 8E–8I.

```text
maths-slideshows/
├── index.html                           # Root Library page (metadata only, no eager slide bundles)
├── vite.config.ts                       # Multi-page Vite configuration (base: './')
├── site.config.js                       # Central deployment URL configuration
├── package.json                         # Build scripts, Vite & KaTeX dependencies
├── bun.lock                             # Lockfile for reproducible installs
├── LESSON_AUTHORING.md                  # Comprehensive guide for creating new lessons
├── README.md                            # Project overview & documentation
├── .github/
│   └── workflows/
│       ├── ci.yml                       # PR/main validation, including local browser tests
│       └── deploy.yml                   # Automated GitHub Actions deployment to GitHub Pages
├── scripts/
│   ├── generate-lesson-catalog.js       # Extracts metadata and validates lessons against schema
│   ├── generate-lesson-pages.js         # Generates static HTML pages in lessons/<id>/index.html
│   └── generate-launchers.js            # Auto-generates student HTML launchers with cleanup & validation
├── lessons/
│   ├── 8E/
│   │   └── index.html                   # Static entry page for Lesson 8E
│   └── 8F/
│       └── index.html                   # Static entry page for Lesson 8F
├── public/
│   └── downloads/                       # Local dev copies of student launchers
└── src/
    ├── main.js                          # Root library UI & legacy URL redirect handler
    ├── lesson-entry.js                  # Shared entry point for static lesson pages (lazy-loads lesson data)
    ├── generated/
    │   └── lesson-catalog.js            # Auto-generated lightweight metadata catalogue
    ├── styles/
    │   ├── base.css                     # Reset, typography, colors & library view
    │   ├── presentation.css             # Slideshow layouts, board styles & controls
    │   └── teacher-tools.css            # Teacher tools modal, random picker & teams UI
    ├── tools/
    │   ├── classManager.js              # Class rosters, localStorage, CSV parser, shuffle
    │   └── teacherToolsModal.js         # Modal dialog, random student picker, team generator
    ├── slideshow/
    │   ├── engine.js                    # Presentation engine & navigation logic
    │   ├── renderer.js                  # Slide & SVG graph rendering engine
    │   ├── launcher.js                  # Shared launcher generator & filename resolver
    │   ├── drawing.js                   # Interactive board pen (Pointer Events & ink store)
    │   ├── timer.js                     # Classroom practice timer
    │   └── math.js                      # KaTeX math rendering helper
    └── lessons/
        ├── manifest.js                  # Master lesson registry (ID and file path pairs)
        ├── grouping.js                  # Hierarchical course & chapter grouping logic
        ├── 8E.js                        # Stem-and-Leaf Plots lesson
        └── 8F.js                        # Sector Graphs & Divided Bar Graphs lesson
```

---

## 6. Adding New Lessons

To add a new lesson (e.g. `8J: Frequency Tables and Range`; 8E–8I already exist):

1. Create `src/lessons/8J.js` and export your lesson configuration object as the default export.
2. Register the lesson in `src/lessons/manifest.js`:
   ```javascript
   export const lessonManifest = [
     { id: '8E', path: './8E.js' },
     { id: '8F', path: './8F.js' },
     { id: '8G', path: './8G.js' },
     { id: '8H', path: './8H.js' },
     { id: '8I', path: './8I.js' },
     { id: '8J', path: './8J.js' }, // New lesson entry; retain existing entries
   ];
   ```
3. Restart `npm run dev` (or run `npm run build`). Restarting `npm run dev` automatically regenerates the lesson catalogue (`src/generated/lesson-catalog.js`) and static HTML entry page (`lessons/8J/index.html`). Running `npm run build` runs the full production pipeline, which additionally generates downloadable student launchers in `dist/downloads/`.

Commit the authored lesson and manifest, excluding generated pages, catalogues and launchers. Submit changes on a branch for CI checks before merging.

See the comprehensive [LESSON_AUTHORING.md](LESSON_AUTHORING.md) guide for complete slide schemas, visual components, math formulas, and authoring rules. You never need to touch the slideshow engine.
