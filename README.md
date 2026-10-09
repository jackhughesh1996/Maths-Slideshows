# Year 7 Mathematics Classroom Slideshows

A static, lightweight slideshow web application engineered for classroom teachers projecting onto interactive whiteboards and projectors.

Built with **vanilla JavaScript**, **semantic HTML**, **CSS**, and locally-bundled **KaTeX** using **Vite**. Zero external runtime frameworks (no React, no Vue, no Angular, no Tailwind, no backend databases, no CDN dependencies).

---

## 1. Features

- **Classroom Interactive Board Ready**: Designed specifically for classroom display with high text contrast, dark ink on warm off-white canvas, and no vertical scrolling in presentation mode.
- **Strict Separation of Engine and Content**: All slideshow behaviours (navigation, progressive reveals, board pen, timer, math rendering) belong to the engine. Lessons are defined as structured data files.
- **Local KaTeX Mathematics**: Fully self-contained LaTeX rendering for inline (`$...$`) and display (`$$...$$` or formula blocks) mathematical expressions.
- **Progressive Reveals**: Spacebar or Right Arrow advances step-by-step through worked examples, guided solutions, and warm-ups. Previous step (`Left Arrow`) steps backward without losing state.
- **Isolated Board Annotation Pen**: Stylus/touch/mouse drawing layer with Pointer Events. Ink is stored per slide and preserved across window resize and fullscreen toggling.
- **Classroom Practice Timer**: Configurable countdown timer (e.g. 10 minutes) that automatically pauses when leaving a slide and restores remaining time when returning.
- **GitHub Pages Portability**: Configured with `base: './'` so it works anywhere—at domain root or inside any repository subpath (e.g., `https://username.github.io/year7-maths/`).
- **Query Parameter Routing**: Lessons open directly via `?lesson=8E` or `?lesson=8F`, with full browser Back/Forward history support.
- **Teacher Classroom Tools**: Integrated student name picker (with no-repeat pool selection) and balanced team generator (pairs, 3s, 4s, or custom size/count). Saves multiple named classes locally in `localStorage` with CSV and clipboard import; zero cloud/backend storage. Pauses presentation keyboard shortcuts while open.

---

## 2. Getting Started

### Prerequisites
Node.js 18+ and npm.

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Starts the local Vite dev server at `http://localhost:3000`.

### Production Build
```bash
npm run build
```
Generates a static production bundle in `dist/`. All assets and script paths are relative (`./`), ready for immediate deployment to GitHub Pages or any static file host.

---

## 3. GitHub Pages Deployment

To deploy to GitHub Pages:

1. Push your repository to GitHub.
2. Build the project:
   ```bash
   npm run build
   ```
3. Deploy the contents of the `dist/` directory to your `gh-pages` branch, or configure GitHub Actions to deploy from the build output.
4. Because `base: './'` is configured in `vite.config.ts`, the site functions seamlessly under repository subpaths (e.g. `https://<user>.github.io/<repo>/`) without 404 errors on assets.

---

## 4. Downloadable Student HTML Launchers

To make sharing individual lessons effortless for teachers and students, the application includes auto-generated HTML launcher files.

### What Launcher Files Are
- **Lightweight Entry Points**: Each launcher file (e.g. `8E-stem-and-leaf-plots.html`) is a standalone, lightweight (~1 KB) HTML document designed to be distributed to students (via email, Google Classroom, USB drive, or school intranet).
- **No Duplication**: Launchers do **not** duplicate the slideshow engine, KaTeX, renderer, or styles. When a student opens the launcher file locally, it immediately redirects to the corresponding hosted lesson URL (`https://<site>/?lesson=8E`) while displaying a clean fallback link in case automatic redirection is disabled.
- **Workflow**:
  1. The teacher downloads `8E-stem-and-leaf-plots.html` using the **Download launcher** button in the lesson library (or grabs it from `dist/downloads/`).
  2. The teacher shares the file with students.
  3. The student opens the HTML file, which immediately launches the live, interactive presentation for lesson `8E`.

### Site URL Configuration
Launcher files redirect to your hosted website base URL. You can configure this in one central place:

1. **Option A (Environment Variable)**:
   Set the `SITE_URL` variable before building:
   ```bash
   export SITE_URL="https://username.github.io/year-7-mathematics-slideshows"
   npm run build
   ```
2. **Option B (`site.config.js`)**:
   Edit `site.config.js` in the project root:
   ```javascript
   export const siteConfig = {
     productionUrl: 'https://username.github.io/year-7-mathematics-slideshows',
     developmentUrl: 'http://localhost:3000'
   };
   ```

*Note*: If no production URL is configured, the build emits a helpful warning and defaults to `http://localhost:3000` so local testing never fails.

### Where Generated Launchers Appear
When you build the project (`npm run build` or `npm run generate-launchers`), launcher HTML files are generated automatically for every registered lesson in:
- `dist/downloads/` (for production distribution and static hosting)
- `public/downloads/` (for local development server serving)

File names are safe and descriptive:
```text
dist/downloads/
├── 8E-stem-and-leaf-plots.html
└── 8F-sector-graphs-and-divided-bar-graphs.html
```

---

## 5. Architecture Overview

```text
├── index.html                   # HTML entry point
├── vite.config.ts               # Vite configuration (base: './')
├── site.config.js               # Central deployment URL configuration
├── scripts/
│   └── generate-launchers.js    # Auto-generation build script for student launchers
├── LESSON_AUTHORING.md          # Guide for adding future lessons
├── README.md                    # Project overview & documentation
└── src/
    ├── main.js                  # App router & Course Library view
    ├── styles/
    │   ├── base.css             # Reset, typography, colors & library view
    │   ├── presentation.css     # Slideshow layouts, board styles & controls
    │   └── teacher-tools.css    # Teacher tools modal, random picker & teams UI
    ├── tools/
    │   ├── classManager.js      # Class rosters, localStorage, CSV parser, shuffle
    │   └── teacherToolsModal.js # Modal dialog, random student picker, team generator
    ├── slideshow/
    │   ├── engine.js            # Presentation engine & navigation logic
    │   ├── renderer.js          # Slide & SVG graph rendering engine
    │   ├── launcher.js          # Shared launcher generator & filename resolver
    │   ├── drawing.js           # Interactive board pen (Pointer Events & ink store)
    │   ├── timer.js             # Classroom practice timer
    │   └── math.js              # KaTeX math rendering helper
    └── lessons/
        ├── index.js             # Lesson registry
        ├── grouping.js          # Hierarchical course & chapter grouping logic
        ├── 8E.js                # Stem-and-Leaf Plots lesson
        └── 8F.js                # Sector Graphs & Divided Bar Graphs lesson
```

---

## 6. Adding New Lessons

To add a new lesson (e.g. `8G`), see the comprehensive [LESSON_AUTHORING.md](LESSON_AUTHORING.md) guide. You never need to touch the slideshow engine.
