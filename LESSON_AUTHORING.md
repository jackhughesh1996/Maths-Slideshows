# Lesson Authoring Guide

This guide explains how a teacher or an AI model can author new Year 7 Mathematics lessons in the static multi-page slideshow architecture without modifying any slideshow engine code.

Start with [adding a lesson](#1-quick-start-3-step-process-to-add-a-lesson), then choose [slide types](#5-supported-slide-types) and [blocks](#6-supported-content-blocks). Use [reveals](#8-progressive-reveals--solutions), [mathematics](#7-text-formatting--katex-mathematics-syntax), and the [verification commands](#11-local-development-testing--verification) when refining the lesson.

---

## 1. Quick Start: 3-Step Process to Add a Lesson

To add a new lesson (for example, `8J: Frequency Tables and Range`; 8E–8I are already registered):

1. **Create the lesson file**: Create `src/lessons/8J.js` using the complete example in section 9.
2. **Export the lesson configuration object** as the default export using the schema described below.
3. **Register the lesson** in `src/lessons/manifest.js`:
   ```javascript
   export const lessonManifest = [
     { id: '8E', path: './8E.js' },
     { id: '8F', path: './8F.js' },
     { id: '8G', path: './8G.js' },
     { id: '8H', path: './8H.js' },
     { id: '8I', path: './8I.js' },
     { id: '8J', path: './8J.js' }, // New lesson; retain existing entries
   ];
   ```

> **⚠️ Important Notice: `src/lessons/index.js` is Obsolete**
> The old eager registry in `src/lessons/index.js` is obsolete and must **not** be used for new lesson registration.
> All lessons are registered exclusively via `src/lessons/manifest.js`.

That is all. The automated build pipeline, static page generator, slideshow engine, KaTeX math renderer, progressive reveals, teacher tools, and library view handle everything else automatically. (If your dev server is already running, restart `npm run dev` or run `node scripts/generate-lesson-catalog.js && node scripts/generate-lesson-pages.js` to generate the new lesson's static page and catalogue metadata.)

---

## 2. Multi-Page Architecture & Build Pipeline

The website uses a static multi-page architecture with on-demand module loading (tree abbreviated; the manifest currently registers 8E–8I):

```text
maths-slideshows/
├── index.html                           # Root Library page (metadata only, no eager slide bundles)
├── lessons/
│   ├── 8E/index.html                    # Static entry page for Lesson 8E
│   └── 8F/index.html                    # Static entry page for Lesson 8F
├── src/
│   ├── generated/
│   │   └── lesson-catalog.js            # Build-generated metadata catalogue (titles, topics, counts)
│   ├── lessons/
│   │   ├── manifest.js                  # Lesson registry: lists IDs and relative file paths
│   │   ├── 8E.js                        # Lesson 8E definition (slides, tasks, data)
│   │   └── 8F.js                        # Lesson 8F definition (slides, tasks, data)
│   ├── lesson-entry.js                  # Shared entry point for static lesson pages (lazy-loads lesson data)
│   ├── main.js                          # Root library script and backward-compatible redirect router
│   └── slideshow/                       # Shared slideshow presentation engine and renderer
└── scripts/
    ├── generate-lesson-catalog.js       # Extracts metadata and validates lessons against schema
    ├── generate-lesson-pages.js         # Generates static HTML pages in lessons/<id>/index.html
    └── generate-launchers.js            # Generates standalone student HTML redirect launchers
```

### What Happens Automatically at Build and Dev Time

The scripts in `package.json` define how the generators and bundler interact:
- **`npm run dev`**: Executes `scripts/generate-lesson-catalog.js` and `scripts/generate-lesson-pages.js` once at startup before starting the Vite dev server. It does **not** run `scripts/generate-launchers.js`.
- **`npm run build`**: Runs the complete production pipeline: catalogue generation, static page generation, Vite multi-page bundling, and launcher generation (`scripts/generate-launchers.js`).

Here is what each stage does:
1. **Validation & Metadata Extraction (`scripts/generate-lesson-catalog.js`)**:
   - Inspects `src/lessons/manifest.js`.
   - Dynamically imports and validates each registered lesson module using `validateLesson()`.
   - Verifies that `lesson.id` matches the manifest entry ID.
   - Extracts lightweight metadata (`id`, `title`, `unit`, `folder`, `topics`, `slideCount`) and writes `src/generated/lesson-catalog.js`.
   - Runs during `npm run dev` startup and `npm run build`.
2. **Static Lesson Page Generation (`scripts/generate-lesson-pages.js`)**:
   - Generates a dedicated static HTML entry page at `lessons/<id>/index.html` for every registered lesson in `src/lessons/manifest.js`.
   - Mounts `#app` with `data-lesson-id="<id>"` and loads the shared `/src/lesson-entry.js` bundle.
   - Safely removes obsolete generated lesson pages when lessons are deleted or renamed.
   - Runs during `npm run dev` startup and `npm run build`.
3. **Multi-Page Bundling (`vite build`)**:
   - Compiles the root library (`index.html`) and every static lesson page (`lessons/<id>/index.html`).
   - The root library bundle remains lightweight: it only loads `lessonCatalog` without loading full slide definitions or KaTeX.
   - Each static lesson page loads the shared presentation engine and lazily fetches its own lesson bundle on demand.
   - Runs during `npm run build`. (In development, Vite serves modules on demand).
4. **Student HTML Launcher Generation (`scripts/generate-launchers.js`)**:
   - Generates lightweight HTML redirect launchers in `dist/downloads/` and `public/downloads/`.
   - Runs as part of `npm run build` (or `npm run generate-launchers`), not the normal `npm run dev` command.
   - **Requires Internet Access**: Launcher HTML files can be opened locally on a student's computer, but they redirect to the hosted website. An active internet connection is required to load and view the slideshow; launchers are not offline copies of the lesson.
   - Release builds with `REQUIRE_PRODUCTION_SITE_URL=1` require a valid, non-loopback HTTPS `SITE_URL`. Local builds may use the configured development URL (`http://localhost:3000` by default).

### Canonical Lesson URLs & Backward Compatibility

- **Canonical Static Lesson URL**: `/lessons/<id>/` (e.g. `/lessons/8E/` or `/lessons/8G/`).
- Paths above are relative to the site root, including any GitHub Pages repository subpath. Vite uses `base: './'`; preserve the existing URL helpers rather than hardcoding domain-root links.
- **Legacy URL Support**: Old query-parameter links (`/?lesson=8E`) are automatically intercepted by `src/main.js` and redirected via `window.location.replace()` to the canonical static URL (`/lessons/8E/`).
- **Student Launchers**: Both build-generated and browser-downloaded HTML launchers target canonical static URLs (`/lessons/<id>/`). They open in the browser and redirect to the hosted lesson.

### Files to Edit vs Generated Files

| File / Path | Author Action | Purpose |
| :--- | :--- | :--- |
| `src/lessons/<id>.js` | **Edit** | Create your lesson slides, worked examples, and content blocks. |
| `src/lessons/manifest.js` | **Edit** | Register your lesson entry `{ id: '<id>', path: './<id>.js' }`. |
| `src/lessons/index.js` | **Do Not Edit** | Obsolete legacy registry. Retained only for backwards reference. |
| `src/generated/lesson-catalog.js` | **Auto-Generated; do not commit** | Do not edit manually. Re-generated on dev startup and build. |
| `lessons/<id>/index.html` | **Auto-Generated; do not commit** | Do not edit manually. Generated by `generate-lesson-pages.js` on dev startup and build. |
| `dist/` | **Auto-Generated; do not commit** | Production build output directory. |
| `public/downloads/*.html` | **Auto-Generated; do not commit** | Generated student launcher files (created during `npm run build` or `npm run generate-launchers`). |
| `dist/downloads/*.html` | **Auto-Generated; do not commit** | Generated student launcher files for production distribution (created during `npm run build`). |

---

## 3. Top-Level Lesson Schema & Folder Organisation

Every lesson file must default-export an object matching this structure:

```javascript
export default {
  id: "8J",                                    // Match the manifest ID and filename exactly
  title: "Frequency Tables and Range",    // Full lesson title
  subject: "Mathematics",                     // Curriculum subject (e.g. "Mathematics")
  yearLevel: 7,                                // Target year level (e.g. 7 or "Year 7")
  unit: "Chapter 8",                           // Chapter or unit identifier (e.g. "Chapter 8")
  folder: "Statistics and Probability",        // Unit topic / folder name
  topics: ["Frequency", "Range"],      // Topic tags (used for tags and search filter)
  slides: [
    { type: "title", title: "Frequency Tables and Range" }
  ]
};
```

### Organisational Metadata Fields

| Field | Type | Required / Recommended | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | **Required** | Unique lesson code used for URL routing. Match the manifest ID and filename case exactly. | `"8E"` |
| `title` | `string` | **Required** | The full, clear descriptive lesson title. | `"Stem-and-Leaf Plots"` |
| `subject` | `string` | Recommended | Subject domain. Defaults to `"Mathematics"` if omitted. | `"Mathematics"` |
| `yearLevel` | `number \| string` | Recommended | Target cohort year level. Used to group the course header (e.g. `Year 7 Mathematics`). | `7` or `"Year 7"` |
| `unit` | `string` | Recommended | The curriculum chapter or module identifier. | `"Chapter 8"` |
| `folder` | `string` | Recommended | The topic folder name. Paired with `unit` to label folders (e.g. `Chapter 8 — Statistics and Probability`). | `"Statistics and Probability"` |
| `chapter` | `string` | Legacy / Optional | Kept for backwards compatibility. Fallback for `folder` when `folder` is omitted; can be combined with `unit`. | `"Statistics and Probability"` |
| `topics` | `string[]` | Optional | Key skills or content tags. Rendered as tags and matched by the library search filter. | `["Data Displays", "Stem and Leaf"]` |
| `slides` | `Array` | **Required** | Non-empty array of sequential slide definitions. | `[...]` |

### How Hierarchical Folders Work
The library UI is completely dynamic:
1. **Course Grouping**: Grouped by `${yearLevel} ${subject}` (e.g. `Year 7 Mathematics`).
2. **Folder Grouping**: Grouped into collapsible chapters labeled `${unit} — ${folder}` (e.g. `Chapter 8 — Statistics and Probability`).
3. **Automatic Placement**: Folders and lessons are placed automatically from metadata without any manual UI lists.
4. **Natural Chapter Sorting**: Folders sort naturally by chapter numbers (e.g. `Chapter 5` → `Chapter 6` → `Chapter 8` → `Chapter 9`).
5. **Real-Time Search**: Teachers can search by lesson code (e.g. `8E`), title, unit, folder, or topic keyword. Matching folders auto-expand to reveal results immediately.

Illustrative folder organisation (not the complete current catalogue):
```text
Year 7 Mathematics
├── Chapter 5 — Decimals
├── Chapter 6 — Fractions
├── Chapter 8 — Statistics and Probability
│   ├── 8E Stem-and-Leaf Plots
│   └── 8F Sector Graphs and Divided Bar Graphs
└── Chapter 9 — Linear Relationships
```

---

## 4. Lesson Pacing & Slide Metadata

These are **60-minute Year 7 Mathematics lessons**. Slides are designed to support active classroom teaching, not to dominate the lesson with passive teacher talk.

### Primary Pacing Rule
* **Transition to Independent Practice:** Students should begin substantive independent practice by approximately **minute 20–25 at the latest**.
* **Instruction Sequence:** Use a tight **I Do → We Do → You Do** model:
  1. Short retrieval / Do Now (~4 min)
  2. Concise workbook notes (~4 min)
  3. One clear I Do worked example (~4–5 min)
  4. One closely matched We Do guided task (~5 min)
  5. Substantive You Do / Independent Practice (~10–12 min, begins at ~min 20)
  6. Subsequent guided extension or comparison tasks (~10–12 min)
  7. Formative Exit Ticket & Summary (~8 min)

### Slide Pacing Properties
Every slide can include optional pacing properties:

| Property | Type | Description |
| :--- | :--- | :--- |
| `phase` | `string` | The instructional phase. Suggested values: `'opening'`, `'explicit'`, `'guided'`, `'independent'`, `'extension'`, `'assessment'`. Any string is accepted and used as the badge label; styling follows the slide type. Displays an unobtrusive badge in the header. |
| `estimatedMinutes` | `number` | Finite positive time target for the teacher (e.g. `4`). Displays `Target: ~4 min` in the header as a pacing guide (no automatic countdown). |
| `timerMinutes` | `number` | Finite positive default countdown duration (e.g. `10`), commonly used on practice slides. Teacher can configure/adjust it on the fly. |

Example:
```javascript
{
  type: "practice",
  phase: "independent",
  estimatedMinutes: 12,
  timerMinutes: 10,
  title: "Independent Practice: Construction & Reading",
  subtitle: "Complete these core tasks in your workbook (10 minutes timer)",
  tasks: [{ title: "Calculate", prompt: "Find the range of 2, 5, 8." }]
}
```

---

## 5. Supported Slide Types

There are 11 canonical slide types (the shared `board-task` / `we-do` section covers two). `i-do` aliases `worked-example`; `you-do` aliases `practice`. Every slide requires `type` and a non-empty `title`; `subtitle` and the pacing fields above are optional. Unknown slide/block properties are validation errors.

| Choose | Required content / accepted containers |
| :--- | :--- |
| `title` | No additional required fields; optional `overview` and `topics: string[]`. |
| `learning` | Non-empty `learningIntention` and `successCriteria: string[]`; optional `keyPrinciple`, `extraBlocks`. |
| `do-now` | Non-empty `questions: [{prompt, answer}]`, both non-empty strings; optional `sidebarNotes`, static `spinners`, `stimulusTitle`, `stimulusPrompt`. |
| `notes` | Non-empty `content` or `columns`, or both. Each column requires non-empty `blocks`; optional `title`, `width`. |
| `worked-example` | Non-empty `steps`; each step needs `text`, raw `latex`, or non-empty `blocks`; optional `label`. Slide accepts `prompt`, literal `data`, `leftBlocks`. |
| `board-task`, `we-do` | A non-empty `prompt` or one of `workspaceContent`, `leftBlocks`, `content`, `rightBlocks`. Optional `data`, `studentAction`, `notes`, `solution`, `separateSolutions`. |
| `comparison` | Non-empty `columns`; each requires non-empty `blocks`, with optional `title`, `width` (renderer uses equal columns). |
| `practice` | Non-empty `content` or `tasks`, or both. Tasks accept `title`, `prompt`, `blocks`, `solution` and need a title or prompt. |
| `exit-ticket` | Non-empty `questions`; each needs `prompt` (legacy `question` accepted with a warning), optional `blocks`, `solution`. |
| `summary` | Non-empty `takeaways: string[]`. |

Solution arrays contain blocks, not strings, and must be non-empty when supplied. Do not put a generic `blocks` property directly on a slide; use that slide type’s named containers.

### 1. `title`
Introductory cover slide with lesson title, overview, and topics.
```javascript
{
  type: "title",
  title: "Stem-and-Leaf Plots",
  subtitle: "Organising numerical data while preserving individual scores",
  overview: "Learn how to split numbers, construct keys, and interpret spread.",
  topics: ["Stems and Leaves", "Median & Range", "Skewness"]
}
```

### 2. `learning`
Displays the learning intention (**WALT**) and success criteria (**WILF**).
```javascript
{
  type: "learning",
  title: "Learning Intentions",
  learningIntention: "To construct and interpret stem-and-leaf plots...",
  successCriteria: [
    "I can split numbers into stem and leaf.",
    "I can include a key on every plot."
  ],
  keyPrinciple: "A stem-and-leaf plot displays data shape while keeping raw values visible."
}
```

### 3. `do-now`
Warm-up recall questions with step-by-step teacher reveal of answers.
```javascript
{
  type: "do-now",
  title: "Do Now: Warm Up",
  questions: [
    { prompt: "Calculate $\\frac{1}{4} \\times 360^\\circ$", answer: "$90^\\circ$" },
    { prompt: "Find the range of: 12, 19, 25", answer: "$25 - 12 = 13$" }
  ],
  sidebarNotes: [
    { type: "note-box", variant: "gold", text: "Allow 3 minutes before revealing." }
  ]
}
```

### 4. `notes`
Structured workbook notes. `content` renders before non-empty `columns` when both are supplied; `columns: []` does not hide content. Omit `width` for equal columns, or use the existing `60` / `40` width classes as below; this is not an arbitrary percentage setting.
```javascript
{
  type: "notes",
  title: "Key Definitions",
  columns: [
    {
      width: "60", // Existing 60:40 flex ratio with the other column
      title: "Core Rules",
      blocks: [
        {
          type: "note-box",
          copyToWorkbook: true, // Shows copy icon banner
          title: "The Stem and The Leaf",
          text: "• **Stem**: Leading digits.\n• **Leaf**: Last single digit."
        }
      ]
    },
    {
      width: "40",
      title: "Examples",
      blocks: [
        { type: "paragraph", text: "35 has stem 3 and leaf 5." }
      ]
    }
  ]
}
```

### 5. `worked-example`
Step-by-step worked example ("I Do"). Each step is progressively revealed using the Spacebar or Next button.
```javascript
{
  type: "worked-example",
  title: "I Do: Constructing a Sector Graph",
  prompt: "Find the sector angle for 8 football fans out of 20 students:",
  data: "8, 6, 4, 2 (Total = 20)",
  steps: [
    {
      label: "Find the proportion",
      text: "$\\text{Proportion} = \\frac{8}{20} = 0.4$"
    },
    {
      label: "Multiply by 360°",
      latex: "\\text{Angle} = 0.4 \\times 360^\\circ = 144^\\circ"
    }
  ]
}
```

### 6. `board-task` / `we-do`
Guided practice designed for active student problem-solving on **physical mini-whiteboards** or workbooks. The slideshow prioritises large, high-visibility mathematical content (tables, charts, formulas) rather than a blank digital drawing area.

Key properties:
* `studentAction`: Compact action prompt displayed in a prominent header pill (e.g. `"On whiteboards: calculate each sector angle."`). Defaults to `"On whiteboards: calculate each missing value."`.
* `workspaceContent` / `leftBlocks`: Problem representation (e.g. calculation table, starter diagram).
* `notes`: Teacher checkpoint prompt or guidance.
* `solution`: Model solution (e.g. completed sector graph, stem plot, or steps) revealed on spacebar or click alongside the problem representation. Prefer the named workspace and solution containers rather than nested reveal wrappers.

```javascript
{
  type: "board-task",
  phase: "guided",
  title: "We Do: Experimental Probability",
  studentAction: "On whiteboards: calculate each probability.",
  prompt: "The outcomes of four trials were Red, Blue, Red, Red.",
  separateSolutions: true,
  workspaceContent: [{
    type: "table",
    headers: ["Outcome", { text: "Count", revealStep: 1 }, { text: "Probability", revealStep: 2 }],
    rows: [
      ["Red", { text: 3, revealStep: 1 }, { text: "$\\frac{3}{4}$", revealStep: 2 }],
      ["Blue", { text: 1, revealStep: 1 }, { text: "$\\frac{1}{4}$", revealStep: 2 }]
    ]
  }],
  solution: [
    { type: "paragraph", badgeTitle: "Counts", revealStep: 1, text: "Red: 3; Blue: 1; total: 4." },
    { type: "solution", title: "Probabilities", revealStep: 2, latex: "\\frac{3}{4} + \\frac{1}{4} = 1" }
  ]
}
```

Here the table counts and first answer share step 1; probabilities and the second answer share step 2, as in lesson 8I. `separateSolutions: true` makes each solution entry one atomic reveal, retaining its badge and content. An entry defaults to step `index + 1` unless it supplies `revealStep`. Descendant reveal settings are ignored inside that entry; do not use them for extra steps. Root `reveal: false` and internally progressive graphs are rejected there.

Without `separateSolutions`, the slide supplies one automatic solution wrapper. Use plain blocks inside it to avoid extra nested reveals. Put `sector-construction` or progressive bars directly in `workspaceContent` / `rightBlocks`, as in lesson 8F. `workspaceContent` takes precedence over `content` when both are present; `leftBlocks` is additional. `notes` alone do not create the two-column solution layout.

### 7. `comparison`
Side-by-side comparative analysis (e.g. comparing two classes or two graph types).
```javascript
{
  type: "comparison",
  title: "Comparing Two Distributions",
  columns: [
    {
      title: "Class 7A",
      blocks: [{ type: "paragraph", text: "Median = 33" }]
    },
    {
      title: "Class 7B",
      blocks: [{ type: "paragraph", text: "Median = 26" }]
    }
  ]
}
```

### 8. `practice`
Independent student practice ("You Do"). Supply `content`, `tasks`, or both: content renders first, then every task. Empty `tasks: []` is valid with non-empty content. Task solutions are optional block arrays with an automatic reveal wrapper; use plain blocks within them.
```javascript
{
  type: "practice",
  title: "Independent Practice",
  timerMinutes: 10, // Suggested duration (teacher can adjust via timer popover: 3, 5, 10, 15 min or custom)
  content: [{ type: "note-box", text: "Show your fraction and angle calculation in your workbook." }],
  tasks: [
    {
      title: "Task 1: Calculate Angles",
      prompt: "Find the sector angle for 5 items out of 20.",
      solution: [
        { type: "paragraph", text: "$\\frac{5}{20} \\times 360^\\circ = 90^\\circ$" }
      ]
    }
  ]
}
```

### 9. `exit-ticket`
Quick end-of-lesson formative assessment check.
```javascript
{
  type: "exit-ticket",
  title: "Exit Ticket",
  questions: [
    {
      prompt: "What is the sector angle for a quarter of a circle?",
      solution: [
        { type: "paragraph", text: "$90^\\circ$ (since $360^\\circ \\div 4 = 90^\\circ$)." }
      ]
    }
  ]
}
```

### 10. `summary`
Recap checklist slide before pack-up.
```javascript
{
  type: "summary",
  title: "Lesson Summary",
  takeaways: [
    "Proportion = amount divided by total.",
    "Sector Angle = proportion × 360°.",
    "Divided Bar Length = proportion × total bar length."
  ]
}
```

---

## 6. Supported Content Blocks

Any slide supporting `blocks` or `content` can use these reusable building blocks:

| Block Type | Properties | Description |
| :--- | :--- | :--- |
| `heading` | Required non-empty `text`; optional integer `level: 1–6` (default 3) | Semantic section heading with KaTeX support |
| `paragraph` | Required `text: string` | Regular text paragraph with KaTeX support |
| `bullet-list` | Required non-empty `items: (string\|number)[]`; numbers must be finite | Unordered bulleted list |
| `ordered-list` | Required non-empty `items: (string\|number)[]`; numbers must be finite | Numbered list |
| `note-box` | Required `text`; optional `title`, `variant: 'default'\|'gold'\|'green'\|'alert'`, `copyToWorkbook: boolean` | Highlighted callout box |
| `formula` | Required non-empty `latex: string` | Centered display mathematics equation |
| `raw-data` | Required `data: string` (literal text) | Mono-spaced horizontal ribbon for data values |
| `table` | Optional `headers`; required non-empty `rows`, all equal width; cells: string, number, or `{text, reveal?, revealStep?}`; optional `compact` | Lined table with math support |
| `stem-and-leaf` | Standard: `rows: Array<{stem, leaves}>`, `key: string`<br>Back-to-Back: `isBackToBack: true`, `leftHeader: string`, `rightHeader: string`, `rows: Array<{leftLeaves, stem, leaves}>`, `key: string` | Formatted stem-and-leaf plot table |
| `sector-graph` | Non-empty `items` with `label` and `amount` or numeric `fraction`; optional `color`, `angle`; block `total`, `size`, `radius` | Mathematically accurate static SVG pie chart |
| `sector-construction` | Non-empty `categories` (or `items`); `label`, at least one of `value`, `amount`, `fraction`, `angle`; optional `calculation`, `color`; see graph rules below | Step-by-step animated sector graph construction paired with synchronized calculation table |
| `divided-bar` / `measured-bar` | Non-empty `categories` (or `items`); `label`, at least one of numeric `value`, `amount`, `length`, `fraction`; scale/check options below | Proportional SVG divided bar with ruler-style ticks, number labels, and progressive boundary reveals |
| `solution` | Optional `title`, `text`, raw `latex`, nested `blocks` | Reveals automatically by default; see section 8 |
| `board-workspace` | Optional `content: Block[]` | Legacy transparent container: renders only its children, no drawing frame |
| `simulation` | Required `simType`; type-specific data below | Interactive probability simulations |

Use arrays of blocks in each supported container. Only `solution.blocks`, `board-workspace.content` and `sector-construction.notes` are nested block containers within blocks; do not add arbitrary `blocks` / `content` fields to other block types. Shared accepted block metadata is `reveal`, `revealStep`, `badgeTitle`, `className`, subject to the restrictions in section 8. `badgeTitle` labels separate board-task answers; `className` is used on tables, not a general styling API.

For table object headers/cells, `text` is required and may be a string or number (including zero); the only other fields are `reveal` and `revealStep`. If headers are supplied their count must match every row. List items may be strings with rich text/math formatting or finite numbers, including zero.

`stem-and-leaf` requires non-empty `rows`; `key` is optional in the schema but should explain the place values. Use a string or finite number for `stem` and plain strings of leaves (for example `"1 4 7"`); leaves are escaped literal text, not rich text. Even a single numeric leaf must be quoted (for example `"0"`); numeric `leaves` and `leftLeaves` are rejected. Use `stem` and `leaves` in normal rows; back-to-back rows add `leftLeaves` and require block `leftHeader` / `rightHeader`. Do not use obsolete `typeVariant`, `titleLeft`, `titleRight`, `leavesLeft` or `leavesRight`.

### Simulations

Use a `simulation` block with one of these `simType` values:

- `spinner` (alias `spinners`): non-empty `spinners`, each with non-empty `sectors`. Spinner metadata accepts strings `id`, `name`, `badge`, `expected`. Each sector requires non-empty `label` and finite numeric `angle`; optional `color`, `term` are strings.
- `counter-bag` (alias `bag-draw`) and `pen-draw` (alias `box-draw`): non-empty `items`, each with non-empty `label`, integer `count >= 0`, optional string `color`, `term`. Zero counts are valid.
- `coin-class`, `coin-summary`, `coin-cumulative`, `basketball`: do not require spinner or bag data. See lesson 8I for existing configurations.

Shared optional fields: string `title`, `subtitle`, `expected`, `badge`; finite numeric `totalSpins`; finite positive `defaultClassSize`, `trialsPerStudent`. Unknown nested properties fail validation. Use the renderer’s existing controls; do not invent configuration fields. Lesson 8G supplies spinner and draw examples. The static `do-now.spinners` stimulus is a different schema (`id`, `name`, `sectors`, `needleAngle`, `sectorsDescription`), not a simulation block. Its optional `sectors` array contains objects with optional finite `startDeg` / `endDeg` and string `label`, `color`, `textColor`. Omitted sectors/angles use renderer defaults; full-circle and wraparound angles are supported. `needleAngle` must be finite; `id`, `name` and `sectorsDescription` must be strings when supplied.

### Graph data and consistency

Graph category numbers must be finite and non-negative; supplied totals and bar scales must be finite and positive. Zero categories are valid alongside a nonzero remainder. Unknown category fields and contradictory redundant data fail validation. Prefer supplying only one of the alternative arrays (`categories` / `items`); `categories` wins when present.

- **Sector graph:** uses `fraction` if supplied, otherwise `amount / total`; omitted total is the sum of amounts. Numeric fractions must sum to 1, and complete counts must sum to the stated total. If both are supplied, they must agree. Optional `angle` is checked against proportion × 360 but does not control this graph’s geometry or its rounded legend angles.
- **Sector construction:** counts use `value` before `amount`; total defaults to the count sum, then 24. Geometry uses explicit `angle`, otherwise the rounded count-derived angle. `fraction` (number or non-empty raw-LaTeX string) and raw `calculation` annotate the table; they do not replace counts in the geometry. Supply counts and/or explicit angles sufficient to draw a full circle, not just fraction annotations. Other block options: `total`, `size`, `radius`, `showTable`, `tableHeaders: string[]`, `notes: Block[]`, `unitLabel`, `check`, `checkMath`, `checkLabel`.
- **Measured/divided bar:** category weight uses `value`, then `amount`, then `length`; numeric `fraction` overrides weight / total. Omitted total defaults to the weight sum, then total bar length. Physical segment length is proportion × total bar length; the legend uses that same length and shows supplied weights without assuming they count students. Category `length` is a fallback **weight**, not an independent centimetre measurement. Block scale uses `totalLength`, then `totalLengthCm`, then 20; `unit` defaults to `cm`. `showTicks` and `showMinorTicks` default to true; `progressive` defaults to false. Optional `title`, `subtitle`, `checkMath`, `checkLabel`, legacy `check` / `checkSum` are strings. `categories` / `items` accept optional `color` strings. Fractions must sum to 1; complete weights must match a stated total. Supply consistent alternative counts/scales if using more than one name.

The validator compares totals, fractions, comparable calculations and sector angles, with floating-point tolerance. Whole-degree angle rounding (including a closing adjustment to a largest sector) and sensible displayed-decimal bar rounding are supported; arbitrary discrepancies are not. Rounded numeric fractions of at least two decimal places have a rounding allowance against counts, but still must sum to 1. Use exact numeric LaTeX fractions such as `"\\frac{12}{24}"` in construction annotations where possible. Only simple numeric fractions and fraction × 360 calculations are evaluated; symbolic expressions receive syntax checks, not algebraic proof. Free-form check equations are not general arithmetic assertions. Errors include lesson, slide, nested path, observed and expected values.

### Animated Sector Graph Construction (`sector-construction`)
For guided "We Do" practice where students learn how to construct a sector graph with a protractor, use the `sector-construction` component. It renders a synchronized two-column display: a calculation table on the left and an animated step-by-step SVG pie chart on the right.

```javascript
{
  type: "sector-construction",
  total: 24,                                            // Total count (e.g. 24 students)
  size: 340,                                            // SVG chart size in pixels (default: 340)
  categories: [
    {
      label: "Bus",
      value: 12,
      fraction: "\\frac{12}{24}",
      calculation: "\\frac{12}{24} \\times 360^\\circ",
      angle: 180,
      color: "#2563eb"
    },
    {
      label: "Walk",
      value: 6,
      fraction: "\\frac{6}{24}",
      calculation: "\\frac{6}{24} \\times 360^\\circ",
      angle: 90,
      color: "#16a34a"
    },
    {
      label: "Car",
      value: 4,
      fraction: "\\frac{4}{24}",
      calculation: "\\frac{4}{24} \\times 360^\\circ",
      angle: 60,
      color: "#d97706"
    },
    {
      label: "Bike",
      value: 2,
      fraction: "\\frac{2}{24}",
      calculation: "\\frac{2}{24} \\times 360^\\circ",
      angle: 30,
      color: "#7c3aed"
    }
  ],
  checkMath: "180^\\circ + 90^\\circ + 60^\\circ + 30^\\circ = 360^\\circ" // Concluding angle sum check
}
```

#### Step-by-Step Reveal Sequence
The slideshow engine advances through teacher-controlled reveals (Spacebar / Right Arrow):
1. **Initial State (Step 0)**: Displays the empty dashed base circle with a center pivot point and 12 o'clock `0° Baseline` radius. The calculation table displays student answer blanks using valid KaTeX `\underline{\hspace{2.5em}}^\circ`.
2. **Category 1 Calculation**: Reveals the first category angle result (e.g. `180°`) in the table and highlights the active category row.
3. **Category 1 Sector Drawing**: Animates the first sector wedge in its category color, drawing the bounding ruler radii, the inner angle arc, and degree text.
4. **Category 2 Calculation**: Highlights category 2 row and reveals calculation result (e.g. `90°`).
5. **Category 2 Sector Drawing**: Animates the adjacent sector wedge, boundary line, angle arc, and label.
6. **Category 3 Calculation**: Reveals category 3 result (e.g. `60°`).
7. **Category 3 Sector Drawing**: Animates category 3 sector wedge.
8. **Category 4 Calculation**: Reveals category 4 result (e.g. `30°`).
9. **Category 4 Sector Drawing**: Animates category 4 sector wedge, closing the circle to 360°.
10. **Angle Sum Check**: Highlights total row (`Sum = 360° ✔`) and displays full circle equation banner.

Pressing **Left Arrow** reverses through each step cleanly.

### Measured Divided Bar Graphs (`measured-bar`)
For guided and independent practice where students draw a divided bar with a physical ruler, use the `measured-bar` component. It renders a horizontal bar with ruler-style integer and half-interval ticks, number labels along the ruler axis, and optional progressive reveals.

```javascript
{
  type: "measured-bar",
  title: "Measured Divided Bar Graph",                     // Optional heading
  subtitle: "Scale: 1 cm per student · Total = 20 cm",    // Optional subtitle
  totalLength: 20,                                        // Total physical bar length (e.g. 10 or 20)
  unit: "cm",                                             // Unit label (default: "cm")
  total: 20,                                              // Total data count (defaults to sum of categories)
  showTicks: true,                                        // Show integer tick marks (default: true)
  showMinorTicks: true,                                   // Show half-interval tick marks (default: true)
  progressive: true,                                      // Reveal segments one-by-one on spacebar/click
  checkMath: "8\\text{ cm} + 6\\text{ cm} + 4\\text{ cm} + 2\\text{ cm} = 20\\text{ cm}", // Optional revealed equation
  categories: [
    { label: "Football", value: 8, color: "#2563eb" },
    { label: "Basketball", value: 6, color: "#16a34a" },
    { label: "Gaming", value: 4, color: "#d97706" },
    { label: "Other", value: 2, color: "#dc2626" }
  ]
}
```

* **Initial State**: Displays the blank outlined ruler bar with ticks and numbers 0 to $N$ cm.
* **Progressive Sequence**: Each category segment fills from left to right with its boundary marker and label, followed by the length check equation.

---

## 7. Text Formatting & KaTeX Mathematics Syntax

Rich-text fields (such as titles, prompts, paragraphs, lists and table text) support the formatting below and escape ordinary HTML. Exceptions include literal `raw-data.data` / slide `data` and plain escaped badge labels: do not rely on Markdown or math there. Use a formula block or rich-text field for mathematics.

### Supported Formatting Syntax

| Style | Syntax | Example | Rendered Result |
| :--- | :--- | :--- | :--- |
| **Inline Math** | `$ ... $` | `$\\frac{1}{4} \\times 360^\\circ$` | Rendered KaTeX inline formula |
| **Display Math** | `$$ ... $$` | `$$\\text{Range} = \\text{Max} - \\text{Min}$$` | Centered display formula |
| **Bold** | `**text**` | `**Stem:**` | **Stem:** |
| **Italic** | `*text*` | `*last single digit*` | *last single digit* |
| **Bold & Italic** | `***text***` | `***Crucial Rule***` | ***Crucial Rule*** |
| **Inline Code / Keys** | `` `text` `` | `` `2 \| 5 means 25` `` | Code pill with mono typeface |
| **Deliberate Line Break** | `\n` | `"Line 1\nLine 2"` | Breaks line (creates `<br>`) |

### Strict Anti-Raw-HTML Policy
- **Do NOT write raw HTML tags.** Never write `<br>`, `<strong>`, `<em>`, or `<code>` in lesson strings.
- Ordinary HTML characters (`<`, `>`, `&`, `"`, `'`) are automatically escaped to prevent XSS and formatting bugs.
- If you need a mathematical inequality like `mean < median` or `x > 5`, simply write `<` or `>` naturally in text or use math `$x > 5$`.

### KaTeX Formula Guidelines
1. **Inline Math**: Wrap LaTeX inside single dollar signs `$ ... $` anywhere in text.
   ```javascript
   text: "Calculate the angle where $\\text{Proportion} = \\frac{6}{24}$."
   ```
2. **Display Math Block**: Use double dollar signs `$$ ... $$` or the dedicated `formula` block:
   ```javascript
   {
     type: "formula",
     latex: "\\text{Sector Angle} = \\frac{\\text{Category Amount}}{\\text{Total Amount}} \\times 360^\\circ"
   }
   ```
3. **Escaping in JavaScript Strings**: Always escape backslashes: write `\\frac`, `\\times`, `\\circ`, `\\mathbf`, `\\text`.
4. **Raw-LaTeX Fields**: `latex`, `checkMath`, `calculation`, and construction’s string-valued `fraction` take LaTeX **without dollar delimiters**. Construction `check` also takes raw LaTeX; prefer `checkMath`. For measured bars, prefer `checkMath` for equations and `checkLabel` for prose; legacy `check` / `checkSum` handling depends on their contents.
5. **Validation Is Required**: Rendering, validation and auditing share `mathExpressions.js`. Unclosed/mismatched delimiters, invalid KaTeX and mathematical commands outside delimiters are errors. Runtime rendering can emit visible error markup; do not rely on fallback rendering as acceptable lesson content.
6. **Literal Characters**: Ordinary currency such as `"Costs $5 and $10"` stays text; `"$25$"` is a formula. For an explicit literal dollar use `"Costs \\$5"` in JavaScript (the resulting string contains `\$`). Inline backtick code is literal, and ordinary backslashes/file paths are not automatically mathematical commands. JavaScript backslashes still need escaping.

`npm run audit:math` dynamically audits **every registered lesson**, including nested fields, and exits nonzero on errors. Normal lesson validation includes these syntax checks too. Diagnostics name the lesson ID, one-based slide number, nested property path and character offset. The math audit checks notation; graph numerical consistency is checked by lesson validation during dev/build and validation tests.

### Creating Mathematical Answer Blanks
When creating student prompts or board tasks where students must fill in missing numbers or values:
- **Do not use literal underscore runs** such as `\text{______}` or `______` inside KaTeX (`$...$` or `$$...$$`). In LaTeX/KaTeX, the underscore `_` is a reserved subscript token and causes parsing failures that result in red error text.
- **Use an underlined blank space**: Recommend using `\underline{\hspace{2.5em}}` (or adjust the width, e.g. `2em`, `3em`) for an answer line.

Examples:
```javascript
// Simple variable equation
text: "Find the missing value: $x = \\underline{\\hspace{2.5em}}$"

// Calculation with degree symbol
text: "$\\frac{6}{24} \\times 360^\\circ = \\underline{\\hspace{2.5em}}^\\circ$"

// Table cell calculation prompt
["Bus", "12", "$\\frac{12}{24}$", "$\\frac{12}{24} \\times 360^\\circ = \\underline{\\hspace{2.5em}}^\\circ$"]
```

---

## 8. Progressive Reveals & Solutions

Automatic reveals need no manual numbers: worked-example `steps` and do-now answers reveal in sequence; board-task, practice and exit-ticket solutions have automatic wrappers. A standalone `solution` block is an automatic reveal by default, supports `revealStep`, and can be made immediately visible with `reveal: false`.

For ordinary blocks with an outer element and object-form table headers/cells:

- `reveal: true` enables an automatic reveal. `revealStep: 2` alone enables a numbered reveal; it must be a positive integer.
- With **no numbered items**, reveals follow DOM order, one element per advance.
- If **any item is numbered**, equal numbers form one group across the whole slide, groups advance in numeric order, and every unnumbered reveal joins step 1. Numbers are groups, not delay counts. This also affects automatic solution/step wrappers elsewhere on the slide.
- `reveal: false` with `revealStep` is rejected. Ordinary blocks without either setting remain visible.

The board-task example above combines numbered table headers, cells and answers. For an unnumbered reveal, use:

```javascript
{
  type: "paragraph",
  reveal: true,
  text: "The total frequency is 4."
}
```

Do not add independent child reveals inside an already revealable parent when you intend a single step. A worked-example step already owns a reveal; its schema has no step-level `reveal` / `revealStep`. Use plain blocks inside automatic solution wrappers, or explicitly set nested `solution` blocks to `reveal: false` to avoid extra steps. `separateSolutions` has the atomic behaviour described above.

Restrictions for composite blocks:

- `sector-construction` rejects **all** block-level `reveal` / `revealStep` settings, even `reveal: false`. It owns the calculation → sector → final-check sequence with explicit step numbers; other numbered reveals on the slide share those groups.
- `board-workspace` also rejects both fields because it has no rendered outer element. Its child blocks can reveal independently.
- `measured-bar` / `divided-bar` with `progressive: true` own internal segment/check steps and reject outer `reveal: true` or any `revealStep`. With `progressive: false` (the default), an outer reveal is supported. Bar segments and checks are unnumbered: adding any numbered item elsewhere on that slide groups **all** of them into step 1. Keep numbered reveals off the slide if you want the bar’s automatic segment sequence.
- Internally progressive graphs cannot appear anywhere inside an entry of a `separateSolutions` answer; put them in the workspace or right-side blocks instead.

---

## 9. Complete Example Lesson Definition

Below is a complete, ready-to-use lesson file (`src/lessons/8J.js`; register it as shown in section 1):

```javascript
export default {
  id: "8J",
  title: "Frequency Tables and Range",
  subject: "Mathematics",
  yearLevel: 7,
  unit: "Chapter 8",
  folder: "Statistics and Probability",
  topics: ["Tally Marks", "Frequency", "Range"],
  slides: [
    {
      type: "title",
      title: "Frequency Tables & Range",
      subtitle: "Tallying data and measuring the spread of a dataset",
      overview: "Count frequency using tallies and calculate the range (Max - Min)."
    },
    {
      type: "learning",
      title: "Learning Intentions",
      learningIntention: "To organise raw data into a frequency table and calculate the range.",
      successCriteria: [
        "I can record tally marks in groups of 5.",
        "I can calculate frequency by summing tallies.",
        "I can calculate the range using $\\text{Max} - \\text{Min}$."
      ]
    },
    {
      type: "worked-example",
      title: "I Do: Constructing a Frequency Table",
      prompt: "Construct a frequency table for pet counts in 10 households:",
      data: "1, 0, 2, 1, 3, 1, 2, 0, 1, 2",
      steps: [
        {
          label: "Identify distinct values",
          text: "The numbers range from 0 to 3 pets."
        },
        {
          label: "Tally and sum frequencies",
          blocks: [
            {
              type: "table",
              headers: ["Pets", "Tally", "Frequency ($f$)"],
              rows: [
                ["0", "||", "2"],
                ["1", "||||", "4"],
                ["2", "|||", "3"],
                ["3", "|", "1"],
                ["**Total**", "", "**10**"]
              ]
            }
          ]
        },
        {
          label: "Calculate the Range",
          latex: "\\text{Range} = 3 - 0 = 3\\text{ pets}"
        }
      ]
    },
    {
      type: "practice",
      title: "Independent Practice",
      timerMinutes: 5,
      tasks: [
        {
          title: "Practice 1",
          prompt: "Find the range of: 14, 22, 18, 31, 15",
          solution: [
            { type: "paragraph", text: "$\\text{Range} = 31 - 14 = 17$" }
          ]
        }
      ]
    },
    {
      type: "summary",
      title: "Lesson Summary",
      takeaways: [
        "Tally marks are grouped in bundles of 5.",
        "Sum of frequencies must equal the total number of observations.",
        "Range = Maximum Value − Minimum Value."
      ]
    }
  ]
};
```

---

## 10. Automated Lesson Schema Validation

The application includes an automated lightweight schema validator (`validateLesson(lesson)` in `src/slideshow/validator.js`) that runs during build time (`generate-lesson-catalog.js`) and runtime (`lesson-entry.js`).

### What Is Validated

`validateLesson(lesson)` returns `{ valid, errors, warnings }`. It checks identity, non-empty slides, supported types, required content, nested blocks, accepted properties, pacing numbers, reveal contradictions, simulation data, graph consistency and mathematical notation. Unknown slide/block/nested schema properties are **errors**, not advisory warnings. Exit-ticket legacy `question` is accepted with a warning; author new data with `prompt`. Deprecated `prompts` is rejected.

Errors identify the lesson and slide, with nested paths for block, math and graph diagnostics. Validation is not a proof of every statement in teaching prose: review answers and pedagogical content as well as running the checks. Do not weaken the validator to accept an example; correct the data or report an existing issue separately.

---

## 11. Local Development, Testing & Verification

Use the standard npm scripts defined in `package.json`:

```bash
# Start local development server (runs catalog and lesson-page generators once, then starts Vite)
npm run dev

# Run TypeScript checks (lesson schema validation runs in dev/build and tests)
npm run lint

# Run regression tests and audit all registered lessons
npm test
npm run audit:math

# Build production multi-page distribution and launchers (runs generators, Vite build, and launcher generator)
npm run build

# Build/serve locally and smoke-test library, all lessons and reveals in Chromium
# First install the browser and Linux dependencies, if needed:
npx playwright install --with-deps chromium
npm run test:browser

# Check whitespace errors before committing
git diff --check

# Generate student HTML launchers separately (optional)
npm run generate-launchers

# Preview production build locally
npm run preview
```

Browser tests are separate from `npm test`, build the site themselves, and use local port 4173 rather than GitHub Pages. An installed browser can be selected with `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH=/path/to/chromium npm run test:browser`. If the browser is unavailable, report the blocker; passing Node tests is not browser verification.

### Local Development Flow
1. Run `npm run dev`. The startup script generates the catalogue and static lesson HTML pages once, then starts Vite at `http://localhost:3000`.
2. As you author or edit slide content in `src/lessons/<id>.js`, Vite automatically hot-reloads changes in your browser.
3. When registering a **new lesson** in `src/lessons/manifest.js` (or renaming an existing one), restart the dev server (`npm run dev`) or explicitly regenerate the files:
   ```bash
   node scripts/generate-lesson-catalog.js && node scripts/generate-lesson-pages.js
   ```
   Editing `manifest.js` does not automatically trigger the generators on save.
4. Note that `scripts/generate-launchers.js` runs as part of `npm run build` (or `npm run generate-launchers`), not the normal `npm run dev` command.
5. Open `http://localhost:3000/lessons/<id>/` in your browser to view your lesson immediately.
6. Open `http://localhost:3000/` to verify that your lesson appears in the correct folder card, search matches work, and the "Open Lesson ▶" link opens your lesson.
7. Test legacy redirect: navigate to `http://localhost:3000/?lesson=<id>` and confirm it immediately redirects to `http://localhost:3000/lessons/<id>/`.

---

## 12. Deployment to GitHub Pages

The repository contains a fully automated GitHub Actions deployment workflow in `.github/workflows/deploy.yml`:

- **Automatic Trigger**: Pushing commits to the `main` branch automatically triggers deployment. You can also trigger it manually from GitHub Actions using `workflow_dispatch`.
- **Workflow Steps**:
  1. Sets up Node.js 24 and Bun.
  2. Runs `bun ci` for clean, frozen-lockfile dependency installation.
  3. Runs `npm run lint` (`tsc --noEmit`) to verify types and syntax.
  4. Configures GitHub Pages via `actions/configure-pages@v5`, obtaining the canonical base URL (`steps.pages.outputs.base_url`).
  5. Runs `npm run build` with `SITE_URL` and `REQUIRE_PRODUCTION_SITE_URL=1` to enforce strict production HTTPS URL validation.
  6. **Automated Verification**: Dynamically iterates over every lesson in `lessonCatalog` and verifies:
     - `dist/lessons/<id>/index.html` exists.
     - `dist/downloads/<launcher-file-name>.html` exists.
     - Launchers point to the deployed GitHub Pages URL without localhost addresses.
  7. Uploads `dist/` and deploys to GitHub Pages.

Commit authored source (lesson and manifest changes), not generated pages, catalogues, bundles or launchers. Push a dedicated branch and submit a pull request targeting `main`. The separate `CI` workflow runs lint, `npm test`, `audit:math`, build and local Chromium smoke tests on pull requests and pushes to `main`. Inspect the PR **Checks** tab or **Actions → CI** logs; browser failures retain report/trace artifacts.

CI does not deploy pull requests. After merge, the independent Pages workflow above builds and deploys `main`; it is not automatically gated by the CI workflow. Confirm the actual GitHub check/deployment results before reporting success. Preserve the configured production base URL and launcher generation.

---

## 13. Authoring Checklist for New Lessons

Follow this checklist before pushing a new lesson:

- [ ] **Lesson File Created**: `src/lessons/<id>.js` created with unique `id`, `title`, `unit`, `folder`, and `topics`.
- [ ] **Default Export**: The lesson file default-exports the configuration object (`export default { ... }`).
- [ ] **Pacing Respected**: Lesson follows the recommended 60-minute structure; independent practice starts by ~min 20–25.
- [ ] **No Raw HTML**: Formatted text uses Markdown (`**`, `*`, `` ` ``, `\n`); no raw `<br>` or `<b>` tags.
- [ ] **KaTeX Formulas Escaped**: All LaTeX backslashes escaped (`\\frac`, `\\times`, `\\circ`); answer blanks use `\underline{\hspace{2.5em}}`.
- [ ] **Manifest Registered**: Added `{ id: '<id>', path: './<id>.js' }` to `src/lessons/manifest.js` (NOT `src/lessons/index.js`).
- [ ] **Tests and Math Audit Passed**: `npm test` and `npm run audit:math` pass; graph consistency passes during lesson validation/build.
- [ ] **Lint Passed**: `npm run lint` passes without TypeScript or syntax errors.
- [ ] **Build Passed**: `npm run build` successfully generates the catalogue, static page, bundle, and launcher.
- [ ] **Automated Browser Tests Passed**: `npm run test:browser`; report browser-install blockers honestly.
- [ ] **Diff Checked**: `git diff --check` passes and no generated files are staged.
- [ ] **Manual Checks (only claim those actually performed)**:
  - Direct visit to `/lessons/<id>/` loads slides and whiteboard tools.
  - Library view at `/` displays the lesson in the correct unit folder with correct slide count.
  - Legacy `/?lesson=<id>` redirects to `/lessons/<id>/`.
  - Student launcher download produces a valid HTML file targeting the canonical URL.
