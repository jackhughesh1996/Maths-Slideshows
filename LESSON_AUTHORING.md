# Lesson Authoring Guide

This guide explains how a teacher or an AI model can author new Year 7 Mathematics lessons without modifying any slideshow engine code.

---

## 1. Quick Start: 3-Step Process to Add a Lesson

To add a new lesson (e.g. `8G: Frequency Tables and Histograms`):

1. **Create the lesson file**: Create `src/lessons/8G.js`.
2. **Export the lesson configuration object** using the schema below.
3. **Register the lesson** in `src/lessons/index.js`:
   ```javascript
   import lesson8G from './8G.js';

   export const lessons = {
     '8E': lesson8E,
     '8F': lesson8F,
     '8G': lesson8G, // Added here
   };
   ```

That is all. The slideshow engine, keyboard navigation, KaTeX math renderer, progressive reveals, board pen, timer, and library view will handle the rest automatically.

---

## 2. Top-Level Lesson Schema & Folder Organisation

Every lesson file must default-export an object matching this structure:

```javascript
export default {
  id: "8G",                                    // Lesson identifier (used in URL: ?lesson=8G)
  title: "Frequency Tables and Histograms",    // Full lesson title
  subject: "Mathematics",                     // Curriculum subject (e.g. "Mathematics")
  yearLevel: 7,                                // Target year level (e.g. 7 or "Year 7")
  unit: "Chapter 8",                           // Chapter or unit identifier (e.g. "Chapter 8")
  folder: "Statistics and Probability",        // Unit topic / folder name
  topics: ["Data Displays", "Intervals"],      // Topic tags (used for tags and search filter)
  slides: [
    // Array of slide objects (see Slide Types and Pacing below)
  ]
};
```

### Organisational Metadata Fields

| Field | Type | Required / Recommended | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | **Required** | Unique lesson code badge used for URL routing (`?lesson=8G`). Case-insensitive. | `"8E"` |
| `title` | `string` | **Required** | The full, clear descriptive lesson title. | `"Stem-and-Leaf Plots"` |
| `subject` | `string` | Recommended | Subject domain. Defaults to `"Mathematics"` if omitted. | `"Mathematics"` |
| `yearLevel` | `number \| string` | Recommended | Target cohort year level. Used to group the course header (e.g. `Year 7 Mathematics`). | `7` or `"Year 7"` |
| `unit` | `string` | Recommended | The curriculum chapter or module identifier. | `"Chapter 8"` |
| `folder` | `string` | Recommended | The topic folder name. Paired with `unit` to label folders (e.g. `Chapter 8 — Statistics and Probability`). | `"Statistics and Probability"` |
| `chapter` | `string` | Legacy / Optional | Kept for backwards compatibility. If `unit` is omitted, `chapter` is used. | `"Statistics and Probability"` |
| `topics` | `string[]` | Optional | Key skills or content tags. Rendered as tags and matched by the library search filter. | `["Data Displays", "Stem and Leaf"]` |
| `slides` | `Array` | **Required** | Sequential slide definitions for the presentation engine. | `[...]` |

### How Hierarchical Folders Work
The library UI is completely dynamic:
1. **Course Grouping**: Grouped by `${yearLevel} ${subject}` (e.g. `Year 7 Mathematics`).
2. **Folder Grouping**: Grouped into collapsible chapters labeled `${unit} — ${folder}` (e.g. `Chapter 8 — Statistics and Probability`).
3. **Automatic Placement**: Folders and lessons are placed automatically from metadata without any manual UI lists.
4. **Natural Chapter Sorting**: Folders sort naturally by chapter numbers (e.g. `Chapter 5` → `Chapter 6` → `Chapter 8` → `Chapter 9`).
5. **Real-Time Search**: Teachers can search by lesson code (e.g. `8E`), title, unit, folder, or topic keyword. Matching folders auto-expand to reveal results immediately.

Future folder growth is seamlessly supported:
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

## 3. Lesson Pacing & Slide Metadata

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
| `phase` | `string` | The instructional phase. Supported values: `'opening'`, `'explicit'`, `'guided'`, `'independent'`, `'extension'`, `'assessment'`. Displays an unobtrusive badge in the header. |
| `estimatedMinutes` | `number` | Suggested time target for the teacher (e.g. `4`). Displays `Target: ~4 min` in the header as a pacing guide (no automatic countdown). |
| `timerMinutes` | `number` | Default countdown duration for practice slides (e.g. `10`). Teacher can configure/adjust it on the fly. |

Example:
```javascript
{
  type: "practice",
  phase: "independent",
  estimatedMinutes: 12,
  timerMinutes: 10,
  title: "Independent Practice: Construction & Reading",
  subtitle: "Complete these core tasks in your workbook (10 minutes timer)",
  tasks: [ ... ]
}
```

---

## 4. Supported Slide Types

The renderer supports 10 distinct, classroom-focused slide types:

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
Structured workbook notes (single-column or multi-column layout).
```javascript
{
  type: "notes",
  title: "Key Definitions",
  columns: [
    {
      width: "60", // 60% width
      title: "Core Rules",
      blocks: [
        {
          type: "note-box",
          copyToWorkbook: true, // Shows copy icon banner
          title: "The Stem and The Leaf",
          text: "• **Stem**: Leading digits.<br>• **Leaf**: Last single digit."
        }
      ]
    },
    {
      width: "40", // 40% width
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
* `solution`: Model solution (e.g. completed sector graph, stem plot, or steps) revealed on spacebar or click without obscuring the problem table.

```javascript
{
  type: "board-task",
  phase: "guided",
  title: "We Do: Guided Sector Angle Calculations",
  subtitle: "Together we calculate sector angles for 24 students' travel to school",
  studentAction: "On whiteboards: calculate each sector angle.",
  prompt: "Determine the angle for each sector in the survey:",
  notes: [
    { type: "note-box", variant: "gold", title: "Teacher Checkpoint", text: "What fraction is 12 out of 24?" }
  ],
  workspaceContent: [
    {
      type: "table",
      headers: ["Travel Method", "Count ($f$)", "Fraction", "Sector Angle Calculation"],
      rows: [
        ["Bus", "12", "$\\frac{12}{24}$", "$\\frac{12}{24} \\times 360^\\circ = \\underline{\\hspace{2.5em}}^\\circ$"],
        ["Walk", "6", "$\\frac{6}{24}$", "$\\frac{6}{24} \\times 360^\\circ = \\underline{\\hspace{2.5em}}^\\circ$"]
      ]
    }
  ],
  solution: [
    {
      type: "sector-graph",
      total: 24,
      items: [
        { label: "Bus", amount: 12, angle: 180, color: "#2563eb" },
        { label: "Walk", amount: 6, angle: 90, color: "#16a34a" }
      ]
    }
  ]
}
```

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
Independent student practice ("You Do") with optional countdown timer and hidden answers.
```javascript
{
  type: "practice",
  title: "Independent Practice",
  timerMinutes: 10, // Suggested duration (teacher can adjust via timer popover: 3, 5, 10, 15 min or custom)
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

## 4. Supported Content Blocks

Any slide supporting `blocks` or `content` can use these reusable building blocks:

| Block Type | Properties | Description |
| :--- | :--- | :--- |
| `heading` | `text`, `level: 2\|3\|4` | Semantic section heading with KaTeX support |
| `paragraph` | `text` | Regular text paragraph with KaTeX support |
| `bullet-list` | `items: string[]` | Unordered bulleted list |
| `ordered-list` | `items: string[]` | Numbered list |
| `note-box` | `title`, `text`, `variant: 'default'\|'gold'\|'green'\|'alert'`, `copyToWorkbook: boolean` | Highlighted callout box |
| `formula` | `latex: string` | Centered display mathematics equation |
| `raw-data` | `data: string` | Mono-spaced horizontal ribbon for data values |
| `table` | `headers: string[]`, `rows: (string\|number)[][]` | Lined table with math support |
| `stem-and-leaf` | Standard: `rows: Array<{stem, leaves}>`, `key: string`<br>Back-to-Back: `isBackToBack: true`, `leftHeader: string`, `rightHeader: string`, `rows: Array<{leftLeaves, stem, leaves}>`, `key: string` | Formatted stem-and-leaf plot table |
| `sector-graph` | `total: number`, `items: Array<{label, amount, color}>` | Mathematically accurate static SVG pie chart |
| `sector-construction` | `total: number`, `categories: Array<{label, value, angle, color}>`, `check: string`, `showTable: boolean` | Step-by-step animated sector graph construction paired with synchronized calculation table |
| `divided-bar` / `measured-bar` | `totalLength: number`, `unit: string`, `showTicks: boolean`, `showMinorTicks: boolean`, `progressive: boolean`, `categories: Array<{label, value, color}>`, `check: string` | Proportional SVG divided bar with ruler-style ticks, number labels, and progressive boundary reveals |
| `solution` | `text: string`, `latex: string`, `blocks: Block[]` | Teacher-controlled revealable solution box |

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
  check: "180^\\circ + 90^\\circ + 60^\\circ + 30^\\circ = 360^\\circ" // Concluding angle sum check
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
  check: "8\\text{ cm} + 6\\text{ cm} + 4\\text{ cm} + 2\\text{ cm} = 20\\text{ cm}", // Optional revealed equation
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

## 5. Text Formatting & KaTeX Mathematics Syntax

All text in lesson files (titles, subtitles, prompts, notes, table cells, lists) is rendered through a unified, safe text-rendering engine.

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
4. **Graceful Degradation**: Malformed math will never crash the slideshow. If a formula is invalid, KaTeX logs a helpful console warning and displays the original formula expression cleanly.

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

## 6. Progressive Reveals & Solutions

- **No manual step numbers are required.** The slideshow engine automatically detects every revealable step in sequence:
  - In `worked-example` slides, each item in `steps` is revealed one-by-one.
  - In `do-now`, each answer is revealed one-by-one.
  - In `practice`, `board-task`, and `exit-ticket`, model solutions start hidden and are revealed on teacher command.
  - Any regular content block can also be progressively revealed simply by setting `reveal: true`:
    ```javascript
    {
      type: "paragraph",
      reveal: true,
      text: "This paragraph will remain hidden until the teacher advances the reveal."
    }
    ```

---

## 7. Complete Example Lesson Definition

Below is a complete, ready-to-use lesson file (`src/lessons/8G_sample.js`):

```javascript
export default {
  id: "8G",
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

## 7. Automated Lesson Schema Validation

The application includes an automated lightweight schema validator (`validateLesson(lesson)` in `src/slideshow/validator.js`) that runs whenever lessons are loaded or registered.

### What Is Validated
1. **Core Identity**: Non-empty `id`, `title`, and `slides` array.
2. **Slide Types**: Every slide must have a recognized type.
3. **Pacing Metadata**: `estimatedMinutes` and `timerMinutes`, if present, must be positive numbers.
4. **Practice Slides**: Must have a valid `tasks` array (or content) with titles/prompts.
5. **Exit Tickets**: Must use canonical `questions: [{ prompt, solution }]` (flags deprecated `prompts` or `question`).
6. **Stem-and-Leaf Plots**:
   - Standard plots require `rows: Array<{stem, leaves}>`.
   - Back-to-back plots require `isBackToBack: true`, `leftHeader`, `rightHeader`, and `rows: Array<{leftLeaves, stem, leaves}>` (flags deprecated `typeVariant`, `titleLeft`, `titleRight`, `leavesLeft`, `leavesRight`).
7. **Graph Data**: Sector graphs and divided bar graphs require non-empty `items` with `label` and `amount` or `fraction`.
8. **Schema Drift Detection**: Warns in console about unexpected properties at slide and block levels.

