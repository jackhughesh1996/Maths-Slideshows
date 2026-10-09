/**
 * @file 8F.js
 * Year 7 Mathematics: Lesson 8F — Sector Graphs and Divided Bar Graphs
 * Chapter: Statistics and Probability
 * Pacing: 60-minute lesson designed around tight I Do -> We Do -> You Do model.
 * Substantive student independent practice commences at ~21 minutes.
 */

export default {
  id: "8F",
  title: "Sector Graphs and Divided Bar Graphs",
  subject: "Mathematics",
  yearLevel: 7,
  unit: "Chapter 8",
  folder: "Statistics and Probability",
  chapter: "Statistics and Probability",
  topics: ["Proportional Reasoning", "Sector Graphs", "Divided Bar Graphs", "Angle Calculations", "Graph Comparisons"],
  slides: [
    // ------------------------------------------------------------------------
    // SLIDE 1: Title
    // ------------------------------------------------------------------------
    {
      type: "title",
      phase: "opening",
      estimatedMinutes: 1,
      title: "Sector Graphs & Divided Bar Graphs",
      subtitle: "Representing categorical and discrete data as proportions of a whole",
      overview: "Explore how proportions are converted into circle sectors (degrees) and divided rectangular bar segments (centimetres).",
      topics: [
        "Proportions as fractions of a total dataset",
        "Calculating sector angles using 360° of a full revolution",
        "Constructing and dividing a 10 cm bar graph",
        "Working backwards from sector angles to find category frequencies",
        "Comparing visual strengths of pie charts vs divided bars"
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 2: Learning Intentions & Success Criteria
    // ------------------------------------------------------------------------
    {
      type: "learning",
      phase: "opening",
      estimatedMinutes: 2,
      title: "Learning Intentions",
      subtitle: "Clear goals for today's lesson",
      learningIntention: "To construct and interpret sector graphs and divided bar graphs.",
      successCriteria: [
        "I can calculate category proportions and represent them accurately as circle sectors and bar segments."
      ],
      keyPrinciple: "A sector graph divides a $360^\\circ$ circle proportionally, while a divided bar graph divides a fixed line segment proportionally."
    },

    // ------------------------------------------------------------------------
    // SLIDE 3: Do Now (Warm-up)
    // ------------------------------------------------------------------------
    {
      type: "do-now",
      phase: "opening",
      estimatedMinutes: 4,
      title: "Do Now: Fractions & Angles",
      subtitle: "Complete these calculations in your workbook to prepare for sector angles",
      questions: [
        {
          prompt: "Simplify the fraction $\\frac{6}{24}$ to its lowest terms.",
          answer: "$\\frac{6}{24} = \\frac{1}{4}$"
        },
        {
          prompt: "Calculate $\\frac{1}{4}$ of $360^\\circ$ (a quarter turn).",
          answer: "$\\frac{1}{4} \\times 360^\\circ = 90^\\circ$ (a right angle)"
        },
        {
          prompt: "Calculate $\\frac{1}{2}$ of $360^\\circ$ (a straight angle).",
          answer: "$\\frac{1}{2} \\times 360^\\circ = 180^\\circ$"
        },
        {
          prompt: "A class has 8 boys and 12 girls. What fraction of the class are boys?",
          answer: "$\\text{Total} = 8 + 12 = 20$. Fraction = $\\frac{8}{20} = \\frac{2}{5}$"
        }
      ],
      sidebarNotes: [
        {
          type: "note-box",
          variant: "gold",
          title: "📌 Recall: Full Circle",
          text: "One complete revolution around a point is exactly **$360^\\circ$**.\nEvery sector graph must add up to this exact total."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 4: Core Concept: Proportions & Sector Angle Formula
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 4,
      title: "Sector Graphs: Core Formulas",
      subtitle: "Copy these master formulas and definitions into your workbook",
      columns: [
        {
          width: "half",
          title: "1. The Sector Angle Formula",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "default",
              title: "Definition: Sector Graph (Pie Chart)",
              text: "A circular display where each category is represented by a slice (sector). The central angle is directly proportional to that category's share of the whole."
            },
            {
              type: "formula",
              latex: "\\text{Proportion} = \\frac{\\text{Category Amount}}{\\text{Total Amount}}"
            },
            {
              type: "formula",
              latex: "\\text{Sector Angle} = \\frac{\\text{Category Amount}}{\\text{Total Amount}} \\times 360^\\circ"
            }
          ]
        },
        {
          width: "half",
          title: "2. The Mandatory Check Sum",
          blocks: [
            {
              type: "note-box",
              variant: "green",
              title: "Check Sum Rule",
              text: "Because a complete circle measures $360^\\circ$, the sum of all individual sector angles must always equal exactly **$360^\\circ$**!\n$$\\sum \\theta = 360^\\circ$$"
            },
            {
              type: "note-box",
              variant: "gold",
              title: "Rounding Note",
              text: "If rounding angles to whole degrees causes the sum to be $359^\\circ$ or $361^\\circ$, adjust the largest category by $1^\\circ$ so the total is exactly $360^\\circ$."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 5: I Do — Worked Example: Sector Graph Construction
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 5,
      title: "I Do: Constructing a Sector Graph",
      subtitle: "A survey asked 20 Year 7 students their favourite weekend activity",
      prompt: "Construct a complete sector graph for this survey dataset:",
      leftBlocks: [
        {
          type: "table",
          headers: ["Activity", "Count ($f$)", "Proportion", "Angle Calculation"],
          rows: [
            ["Football", "8", "$\\frac{8}{20}$", "$\\frac{8}{20} \\times 360^\\circ = 144^\\circ$"],
            ["Basketball", "6", "$\\frac{6}{20}$", "$\\frac{6}{20} \\times 360^\\circ = 108^\\circ$"],
            ["Gaming", "4", "$\\frac{4}{20}$", "$\\frac{4}{20} \\times 360^\\circ = 72^\\circ$"],
            ["Other", "2", "$\\frac{2}{20}$", "$\\frac{2}{20} \\times 360^\\circ = 36^\\circ$"],
            ["**Total**", "**20**", "**1**", "**$360^\\circ$**"]
          ]
        }
      ],
      steps: [
        {
          label: "Find the total amount",
          text: "$\\text{Total} = 8 + 6 + 4 + 2 = 20\\text{ students}$"
        },
        {
          label: "Calculate each sector angle",
          latex: "\\text{Football}: \\frac{8}{20} \\times 360^\\circ = 0.4 \\times 360^\\circ = 144^\\circ"
        },
        {
          label: "Calculate remaining angles & check total",
          text: "• **Basketball:** $\\frac{6}{20} \\times 360^\\circ = 108^\\circ$\n• **Gaming:** $\\frac{4}{20} \\times 360^\\circ = 72^\\circ$\n• **Other:** $\\frac{2}{20} \\times 360^\\circ = 36^\\circ$",
          blocks: [
            {
              type: "paragraph",
              text: "Check: $144^\\circ + 108^\\circ + 72^\\circ + 36^\\circ = 360^\\circ$ ✔"
            }
          ]
        },
        {
          label: "Render the completed sector graph",
          text: "Using a protractor starting from a radius line at the top, measure and draw each sector:",
          blocks: [
            {
              type: "sector-graph",
              total: 20,
              items: [
                { label: "Football", amount: 8, angle: 144, color: "#2563eb" },
                { label: "Basketball", amount: 6, angle: 108, color: "#16a34a" },
                { label: "Gaming", amount: 4, angle: 72, color: "#d97706" },
                { label: "Other", amount: 2, angle: 36, color: "#dc2626" }
              ]
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 6: We Do — Guided Practice: Calculating Sector Angles
    // ------------------------------------------------------------------------
    {
      type: "board-task",
      phase: "guided",
      estimatedMinutes: 5,
      title: "We Do: Guided Sector Angle Calculations",
      subtitle: "Together we calculate sector angles for 24 students' travel to school",
      studentAction: "On whiteboards: calculate each sector angle.",
      prompt: "A survey of 24 students recorded their method of travel to school: Bus (12), Walk (6), Car (4), Bike (2). Determine the angle for each sector and construct the sector graph.",
      notes: [
        {
          type: "note-box",
          variant: "gold",
          title: "Teacher Checkpoint Question",
          text: "• Notice that 12 is half of 24: $\\frac{12}{24} = \\frac{1}{2} \\rightarrow \\frac{1}{2} \\times 360^\\circ = 180^\\circ$ (straight line across circle).\n• Notice that 6 is a quarter of 24: $\\frac{6}{24} = \\frac{1}{4} \\rightarrow \\frac{1}{4} \\times 360^\\circ = 90^\\circ$ (right angle)."
        }
      ],
      workspaceContent: [
        {
          type: "sector-construction",
          total: 24,
          unitLabel: "students",
          size: 340,
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
          checkMath: "180^\\circ + 90^\\circ + 60^\\circ + 30^\\circ = 360^\\circ"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 7: You Do — Independent Practice 1 (Commences at ~Minute 21!)
    // ------------------------------------------------------------------------
    {
      type: "practice",
      phase: "independent",
      estimatedMinutes: 10,
      timerMinutes: 10,
      title: "Independent Practice: Sector Angles",
      subtitle: "Complete these calculations in your workbook (10 minutes timer)",
      tasks: [
        {
          title: "Task 1: Favourite Subjects Survey",
          prompt: "A survey asked 30 students their favourite subject: Maths (10), Science (9), Art (6), PE (5). Calculate the sector angle for each subject and check the total sum.",
          solution: [
            {
              type: "paragraph",
              text: "Total = $10 + 9 + 6 + 5 = 30\\text{ students}$.\n• **Maths:** $\\frac{10}{30} \\times 360^\\circ = \\frac{1}{3} \\times 360^\\circ = \\mathbf{120^\\circ}$\n• **Science:** $\\frac{9}{30} \\times 360^\\circ = \\frac{3}{10} \\times 360^\\circ = \\mathbf{108^\\circ}$\n• **Art:** $\\frac{6}{30} \\times 360^\\circ = \\frac{1}{5} \\times 360^\\circ = \\mathbf{72^\\circ}$\n• **PE:** $\\frac{5}{30} \\times 360^\\circ = \\frac{1}{6} \\times 360^\\circ = \\mathbf{60^\\circ}$\nCheck: $120^\\circ + 108^\\circ + 72^\\circ + 60^\\circ = 360^\\circ$ ✔"
            }
          ]
        },
        {
          title: "Task 2: Quick Angle Check",
          prompt: "In a survey of 40 people, 10 chose Option A. What is the sector angle for Option A?",
          solution: [
            {
              type: "paragraph",
              text: "$\\text{Proportion} = \\frac{10}{40} = \\frac{1}{4}$.\n$$\\text{Sector Angle} = \\frac{1}{4} \\times 360^\\circ = \\mathbf{90^\\circ}$$"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 8: We Do — Guided Divided Bar Graph Construction (20 cm Bar)
    // ------------------------------------------------------------------------
    {
      type: "board-task",
      phase: "guided",
      estimatedMinutes: 7,
      title: "We Do: Guided Divided Bar Graph (20 cm Bar)",
      subtitle: "Constructing a proportional 20 cm divided bar using a ruler",
      studentAction: "On whiteboards: calculate each segment length and mark boundaries along a 20 cm bar.",
      prompt: "Using the weekend activity survey ($n = 20$), determine the length in centimetres for each segment of a **20 cm measured bar**:",
      notes: [
        {
          type: "note-box",
          variant: "gold",
          title: "Teacher Checkpoint",
          text: "• **Scale:** $\\frac{20\\text{ cm}}{20\\text{ students}} = 1\\text{ cm/student}$.\n• **Division marks:** Mark lines along ruler at **8 cm**, **14 cm**, **18 cm**, and **20 cm**."
        }
      ],
      workspaceContent: [
        {
          type: "table",
          headers: ["Activity", "Count ($f$)", "Length Calculation", "Segment Length"],
          rows: [
            ["Football", "8", "$\\frac{8}{20} \\times 20\\text{ cm}$", "$\\mathbf{8.0\\text{ cm}}$"],
            ["Basketball", "6", "$\\frac{6}{20} \\times 20\\text{ cm}$", "$\\mathbf{6.0\\text{ cm}}$"],
            ["Gaming", "4", "$\\frac{4}{20} \\times 20\\text{ cm}$", "$\\mathbf{4.0\\text{ cm}}$"],
            ["Other", "2", "$\\frac{2}{20} \\times 20\\text{ cm}$", "$\\mathbf{2.0\\text{ cm}}$"],
            ["**Total**", "**20**", "**Bar Length**", "**20.0 cm**"]
          ]
        }
      ],
      rightBlocks: [
        {
          type: "measured-bar",
          title: "Measured Divided Bar Graph",
          subtitle: "Scale: 1 cm per student · Mark boundaries at 8 cm, 14 cm, 18 cm, 20 cm",
          totalLength: 20,
          unit: "cm",
          total: 20,
          showTicks: true,
          showMinorTicks: true,
          progressive: true,
          checkMath: "8\\text{ cm} + 6\\text{ cm} + 4\\text{ cm} + 2\\text{ cm} = 20\\text{ cm}",
          checkLabel: "Full bar length ✔",
          categories: [
            { label: "Football", value: 8, color: "#2563eb" },
            { label: "Basketball", value: 6, color: "#16a34a" },
            { label: "Gaming", value: 4, color: "#d97706" },
            { label: "Other", value: 2, color: "#dc2626" }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 9: Extension: Working Backwards & Comparing Graph Types
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "extension",
      estimatedMinutes: 7,
      title: "Extension: Reverse Problems (Angle to Amount)",
      subtitle: "Working backwards when the sector angle and total are given",
      prompt: "A sector graph represents a total survey of 120 pet owners. The sector angle for 'Cats' is $90^\\circ$. How many people own cats?",
      leftBlocks: [
        {
          type: "note-box",
          variant: "gold",
          title: "Known Values",
          text: "• Total amount: $N = 120$\n• Sector angle: $\\theta = 90^\\circ$\n• Total degrees in circle: $360^\\circ$"
        },
        {
          type: "note-box",
          variant: "green",
          title: "The Reverse Formula",
          text: "$$\\text{Category Amount} = \\frac{\\text{Angle}}{360^\\circ} \\times \\text{Total}$$"
        }
      ],
      steps: [
        {
          label: "Find the fraction of the full circle",
          latex: "\\text{Fraction} = \\frac{90^\\circ}{360^\\circ} = \\frac{1}{4}"
        },
        {
          label: "Multiply fraction by the total survey population",
          latex: "\\text{Cat Owners} = \\frac{1}{4} \\times 120 = 30\\text{ people}"
        },
        {
          label: "Generalisation for any angle",
          text: "For an angle of $54^\\circ$ out of 120 people:\n$$\\text{Amount} = \\frac{54^\\circ}{360^\\circ} \\times 120 = 0.15 \\times 120 = 18\\text{ people}$$"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 10: Extension Practice: Divided Bars & Reverse Calculations
    // ------------------------------------------------------------------------
    {
      type: "practice",
      phase: "extension",
      estimatedMinutes: 7,
      timerMinutes: 5,
      title: "Extension Practice: Divided Bars & Reverse Angle",
      subtitle: "Apply proportional formulas to novel contexts (5 minutes timer)",
      tasks: [
        {
          title: "Task 1: Divided Bar Lengths",
          prompt: "A 10 cm divided bar represents 50 items. Category X has 15 items. What length should its segment be?",
          solution: [
            {
              type: "paragraph",
              text: "$$\\text{Length} = \\frac{15}{50} \\times 10\\text{ cm} = 0.3 \\times 10 = \\mathbf{3.0\\text{ cm}}$$"
            }
          ]
        },
        {
          title: "Task 2: Reverse Angle Calculation",
          prompt: "In a survey of 180 students, the sector for 'Soccer' has an angle of $60^\\circ$. How many students chose Soccer?",
          solution: [
            {
              type: "paragraph",
              text: "$$\\text{Soccer Students} = \\frac{60^\\circ}{360^\\circ} \\times 180 = \\frac{1}{6} \\times 180 = \\mathbf{30\\text{ students}}$$"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 11: Exit Ticket
    // ------------------------------------------------------------------------
    {
      type: "exit-ticket",
      phase: "assessment",
      estimatedMinutes: 5,
      title: "Exit Ticket",
      subtitle: "Two quick calculations before the bell",
      questions: [
        {
          prompt: "Calculate the sector angle for a category containing 5 out of 20 total items.",
          solution: [
            {
              type: "paragraph",
              text: "$$\\text{Angle} = \\frac{5}{20} \\times 360^\\circ = \\frac{1}{4} \\times 360^\\circ = \\mathbf{90^\\circ}$$"
            }
          ]
        },
        {
          prompt: "If sector angles in a graph are $120^\\circ$, $150^\\circ$, and $x^\\circ$, find $x$.",
          solution: [
            {
              type: "paragraph",
              text: "$$x = 360^\\circ - (120^\\circ + 150^\\circ) = 360^\\circ - 270^\\circ = \\mathbf{90^\\circ}$$"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 12: Summary & Key Takeaways
    // ------------------------------------------------------------------------
    {
      type: "summary",
      phase: "assessment",
      estimatedMinutes: 3,
      title: "Lesson Summary: 8F",
      takeaways: [
        "A sector graph (pie chart) divides a $360^\\circ$ circle into angles proportional to category sizes.",
        "Sector Angle formula: $\\text{Angle} = \\frac{\\text{Category Amount}}{\\text{Total Amount}} \\times 360^\\circ$.",
        "The sum of all sector angles in a circle must equal exactly $360^\\circ$.",
        "A divided bar graph divides a fixed length (e.g. 10 cm) proportionally: $\\text{Length} = \\frac{\\text{Amount}}{\\text{Total}} \\times \\text{Bar Length}$.",
        "To work backwards from an angle: $\\text{Amount} = \\frac{\\text{Angle}}{360^\\circ} \\times \\text{Total}$."
      ]
    }
  ]
};
