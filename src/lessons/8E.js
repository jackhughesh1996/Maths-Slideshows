/**
 * @file 8E.js
 * Year 7 Mathematics: Lesson 8E — Stem-and-Leaf Plots
 * Chapter: Statistics and Probability
 * Pacing: 60-minute lesson designed around tight I Do -> We Do -> You Do model.
 * Substantive student independent practice commences at ~20 minutes.
 */

export default {
  id: "8E",
  title: "Stem-and-Leaf Plots",
  subject: "Mathematics",
  yearLevel: 7,
  unit: "Chapter 8",
  folder: "Statistics and Probability",
  chapter: "Statistics and Probability",
  topics: ["Data Displays", "Stem and Leaf", "Measures of Centre", "Distribution Shape", "Back-to-Back Plots"],
  slides: [
    // ------------------------------------------------------------------------
    // SLIDE 1: Title
    // ------------------------------------------------------------------------
    {
      type: "title",
      phase: "opening",
      estimatedMinutes: 1,
      title: "Stem-and-Leaf Plots",
      subtitle: "Organising and displaying numerical data while preserving every original value",
      overview: "Stem-and-leaf plots give us the visual profile of a bar chart without losing the exact raw data numbers.",
      topics: [
        "Splitting numbers into Stems and Leaves",
        "Constructing ordered plots with mandatory keys",
        "Calculating Min, Max, Range, Mode and Median",
        "Classifying distribution shapes (Symmetrical, Skewed)",
        "Comparing two groups with Back-to-Back plots"
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
      learningIntention: "To construct and interpret stem-and-leaf plots.",
      successCriteria: [
        "I can organise data into a stem-and-leaf plot and use it to identify important features of the data."
      ],
      keyPrinciple: "A stem-and-leaf plot displays the overall distribution shape while keeping every single original data value completely visible."
    },

    // ------------------------------------------------------------------------
    // SLIDE 3: Do Now (Warm-up)
    // ------------------------------------------------------------------------
    {
      type: "do-now",
      phase: "opening",
      estimatedMinutes: 4,
      title: "Do Now: Ordering & Place Value",
      subtitle: "Answer these 4 warm-up questions in your workbook",
      questions: [
        {
          prompt: "Write the following numbers in ascending order: 34, 18, 25, 41, 15, 29",
          answer: "15, 18, 25, 29, 34, 41"
        },
        {
          prompt: "In the number 84, which digit is in the tens place and which is in the units place?",
          answer: "Tens = 8, Units = 4"
        },
        {
          prompt: "Find the middle value (median) of: 11, 14, 19, 23, 27",
          answer: "Median = 19 (the 3rd number in an ordered set of 5)"
        },
        {
          prompt: "What is the range of scores: 12, 15, 19, 24, 38?",
          answer: "Range = $\\text{Maximum} - \\text{Minimum} = 38 - 12 = 26$"
        }
      ],
      sidebarNotes: [
        {
          type: "note-box",
          variant: "gold",
          title: "📌 Recall",
          text: "The **range** measures how spread out data is:\n$$\\text{Range} = \\text{Highest Value} - \\text{Lowest Value}$$"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 4: Key Notes — Stem, Leaf, and Key
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 4,
      title: "Anatomy of a Stem-and-Leaf Plot",
      subtitle: "Copy these essential definitions and conventions into your workbook",
      columns: [
        {
          width: "60",
          title: "Core Definitions",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "default",
              title: "1. The Stem & The Leaf",
              text: "• **Stem:** The leading digit or digits (e.g., tens or hundreds). Stems are written vertically in ascending order down the column.\n• **Leaf:** The *last single digit* only (the units or tenths). Leaves are written horizontally in ascending order.\n• **Equal Spacing:** Leaves must be neatly aligned in columns so the length of the row accurately reflects its frequency."
            },
            {
              type: "note-box",
              variant: "alert",
              title: "2. The Mandatory Key",
              text: "A stem-and-leaf plot **must always have a key**! Without a key, nobody knows what place value the numbers represent.\nExample: `2 | 5` could mean **25**, **2.5 kg**, or **250**."
            }
          ]
        },
        {
          width: "40",
          title: "Splitting Numbers Examples",
          blocks: [
            {
              type: "note-box",
              variant: "green",
              title: "Example Splittings",
              text: "• **38** → Stem: **3**, Leaf: **8**\n• **7** (single digit) → Stem: **0**, Leaf: **7**\n• **142** (three digits) → Stem: **14**, Leaf: **2**\n• **5.4** (decimal) → Stem: **5**, Leaf: **4**"
            },
            {
              type: "note-box",
              variant: "gold",
              title: "Rule of Repeated Data",
              text: "If a value occurs more than once (e.g., 34 and 34), write the leaf digit '4' twice. Do not skip duplicate scores!"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 5: I Do — Worked Example Construction
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 4,
      title: "I Do: Constructing a Stem-and-Leaf Plot",
      subtitle: "Watch the teacher demonstrate raw data → sorting → stems → leaves → key",
      prompt: "Construct an ordered stem-and-leaf plot for the following 12 test marks:",
      data: "23, 10, 36, 25, 31, 34, 34, 27, 36, 37, 16, 33",
      leftBlocks: [
        {
          type: "note-box",
          variant: "default",
          title: "Observation",
          text: "Lowest value is **10** (stem 1).\nHighest value is **37** (stem 3).\nTotal values: **12**."
        }
      ],
      steps: [
        {
          label: "Sort the raw numbers in ascending order",
          text: "10, 16, 23, 25, 27, 31, 33, 34, 34, 36, 36, 37"
        },
        {
          label: "Identify the stems",
          text: "Since scores range from 10 to 37, our stems are **1**, **2**, and **3**."
        },
        {
          label: "Place the ordered leaves",
          text: "Fill in each leaf in order from smallest to largest with uniform spacing:",
          blocks: [
            {
              type: "stem-and-leaf",
              key: "Key: 2 | 5 means 25 marks",
              rows: [
                { stem: 1, leaves: "0 6" },
                { stem: 2, leaves: "3 5 7" },
                { stem: 3, leaves: "1 3 4 4 6 6 7" }
              ]
            }
          ]
        },
        {
          label: "Verify leaf count and write the key",
          text: "Count the leaves: 2 + 3 + 7 = **12 leaves** (matches our 12 original data values).\nAlways record the key: `2 | 5 means 25`."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 6: We Do — Collaborative Board Task
    // ------------------------------------------------------------------------
    {
      type: "board-task",
      phase: "guided",
      estimatedMinutes: 5,
      title: "We Do: Guided Board Construction",
      subtitle: "Students construct the plot on mini-whiteboards before checking the model solution",
      studentAction: "On whiteboards: construct an ordered stem-and-leaf plot for these 11 scores.",
      prompt: "Construct an ordered stem-and-leaf plot for these 11 quiz scores. Notice the single-digit scores!",
      data: "6, 14, 23, 17, 28, 31, 15, 23, 35, 9, 20",
      notes: [
        {
          type: "note-box",
          variant: "gold",
          title: "Teacher Checkpoint Question",
          text: "• What stem do we use for single-digit numbers like **6** and **9**? → Stem is **0**.\n• How do we record duplicate scores like **23**? → Write '3' twice."
        }
      ],
      workspaceContent: [
        {
          type: "paragraph",
          text: "Write stems down the left, then place leaves in ascending order across:"
        },
        {
          type: "table",
          headers: ["Stem", "Leaf"],
          rows: [
            ["0", ""],
            ["1", ""],
            ["2", ""],
            ["3", ""]
          ]
        },
        {
          type: "paragraph",
          text: "Key: $\\underline{\\hspace{1.5em}} \\mid \\underline{\\hspace{1.5em}}$ means $\\underline{\\hspace{3em}}$"
        }
      ],
      solution: [
        {
          type: "stem-and-leaf",
          key: "Key: 1 | 4 means 14 marks",
          rows: [
            { stem: 0, leaves: "6 9" },
            { stem: 1, leaves: "4 5 7" },
            { stem: 2, leaves: "0 3 3 8" },
            { stem: 3, leaves: "1 5" }
          ]
        },
        {
          type: "paragraph",
          text: "Sorted values: 6, 9, 14, 15, 17, 20, 23, 23, 28, 31, 35 (11 values total)."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 7: You Do — Independent Practice (Commences at ~Minute 20!)
    // ------------------------------------------------------------------------
    {
      type: "practice",
      phase: "independent",
      estimatedMinutes: 12,
      timerMinutes: 10,
      title: "Independent Practice: Construction & Reading",
      subtitle: "Complete these core tasks in your workbook (10 minutes timer)",
      tasks: [
        {
          title: "Task 1: Read & Interpret",
          prompt: "For the following plot, find: (a) total count $n$, (b) Min and Max, (c) Range, (d) Mode, (e) Median.",
          blocks: [
            {
              type: "stem-and-leaf",
              key: "Key: 2 | 4 means 24",
              rows: [
                { stem: 1, leaves: "3 7" },
                { stem: 2, leaves: "0 2 4 8 9" },
                { stem: 3, leaves: "1 3 5" }
              ]
            }
          ],
          solution: [
            {
              type: "paragraph",
              text: "• (a) Total count: $n = 2 + 5 + 3 = 10$\n• (b) $\\text{Min} = 13$, $\\text{Max} = 35$\n• (c) $\\text{Range} = 35 - 13 = 22$\n• (d) $\\text{Mode}$: No repeated leaf value on any stem → No mode\n• (e) Middle two numbers are the 5th and 6th values: **24** and **28**.\n$$\\text{Median} = \\frac{24 + 28}{2} = 26$$"
            }
          ]
        },
        {
          title: "Task 2: Construct",
          prompt: "Construct an ordered stem-and-leaf plot with a key for this dataset of 12 scores:",
          blocks: [
            {
              type: "raw-data",
              data: "18, 21, 25, 26, 31, 34, 35, 38, 41, 45, 48, 52"
            }
          ],
          solution: [
            {
              type: "stem-and-leaf",
              key: "Key: 3 | 4 means 34",
              rows: [
                { stem: 1, leaves: "8" },
                { stem: 2, leaves: "1 5 6" },
                { stem: 3, leaves: "1 4 5 8" },
                { stem: 4, leaves: "1 5 8" },
                { stem: 5, leaves: "2" }
              ]
            },
            {
              type: "paragraph",
              text: "Check: 1 + 3 + 4 + 3 + 1 = **12 leaves**. Leaves are in ascending order with equal spacing."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 8: Explicit Check — Summary Statistics & Distribution Shapes
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 6,
      title: "Reading Summary Statistics & Outliers",
      subtitle: "Finding Minimum, Maximum, Range, Mode, Median, and Outliers directly from a plot",
      prompt: "Consider the following stem-and-leaf plot representing $n = 14$ daily temperatures in °C:",
      leftBlocks: [
        {
          type: "stem-and-leaf",
          key: "Key: 2 | 0 means 20 °C",
          rows: [
            { stem: 1, leaves: "5 8" },
            { stem: 2, leaves: "0 2 4 7 7 9" },
            { stem: 3, leaves: "1 3 6" },
            { stem: 4, leaves: "2 5" },
            { stem: 5, leaves: "" },
            { stem: 6, leaves: "" },
            { stem: 7, leaves: "8" }
          ]
        },
        {
          type: "note-box",
          variant: "default",
          title: "Total Count ($n$)",
          text: "Count every leaf in the plot: 2 + 6 + 3 + 2 + 0 + 0 + 1 = **14 values**."
        }
      ],
      steps: [
        {
          label: "Minimum, Maximum, and Range",
          text: "• **Minimum** = first leaf on lowest stem = **15 °C**\n• **Maximum** = last leaf on highest stem = **78 °C**\n• **Range** = $78 - 15 = 63\\text{ °C}$"
        },
        {
          label: "Mode (Most Frequent Value)",
          text: "Look for identical leaf digits on the same stem: on stem 2, '7' appears twice.\n• **Mode** = **27 °C**"
        },
        {
          label: "Median Position and Value",
          text: "With $n = 14$, median position is $\\frac{14 + 1}{2} = 7.5^{\\text{th}}$ score (average of 7th and 8th scores: **27** and **29**):\n$$\\text{Median} = \\frac{27 + 29}{2} = \\mathbf{28\\text{ °C}}$$"
        },
        {
          label: "Identifying an Outlier",
          text: "The score **78 °C** lies on stem 7, separated from the rest of the cluster by empty stems 5 and 6.\n• **78 °C is an outlier**."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 9: Guided Concept — Back-to-Back Stem-and-Leaf Plots
    // ------------------------------------------------------------------------
    {
      type: "comparison",
      phase: "guided",
      estimatedMinutes: 7,
      title: "Back-to-Back Stem-and-Leaf Plots",
      subtitle: "Comparing two related datasets using one shared central column of stems",
      columns: [
        {
          width: "half",
          title: "Plot & Key",
          blocks: [
            {
              type: "stem-and-leaf",
              isBackToBack: true,
              leftHeader: "Class 7A (Leaves)",
              rightHeader: "Class 7B (Leaves)",
              key: "Key: 8 | 2 | 4 means 28 for 7A and 24 for 7B",
              rows: [
                { leftLeaves: "8 5", stem: 1, leaves: "2 6 9" },
                { leftLeaves: "9 7 4 1", stem: 2, leaves: "0 3 4 7" },
                { leftLeaves: "8 6 3 0", stem: 3, leaves: "2 5 8" },
                { leftLeaves: "4 1", stem: 4, leaves: "1 5" }
              ]
            },
            {
              type: "note-box",
              variant: "alert",
              title: "⚠️ Crucial Rule for the Left Side",
              text: "Leaves on the **left side** must read **backwards from the stem**: closest to the stem is the smallest digit, furthest left is the largest!"
            }
          ]
        },
        {
          width: "half",
          title: "Comparing the Two Classes",
          blocks: [
            {
              type: "note-box",
              variant: "default",
              title: "Class 7A Performance ($n = 12$)",
              text: "• Min = 15, Max = 44\n• Range = $44 - 15 = 29$\n• Median: Average of 6th and 7th = $\\frac{29 + 30}{2} = 29.5$"
            },
            {
              type: "note-box",
              variant: "default",
              title: "Class 7B Performance ($n = 12$)",
              text: "• Min = 12, Max = 45\n• Range = $45 - 12 = 33$\n• Median: Average of 6th and 7th = $\\frac{24 + 27}{2} = 25.5$"
            },
            {
              type: "note-box",
              variant: "green",
              title: "Statistical Conclusion",
              text: "Class 7A achieved a higher median score (29.5 vs 25.5) and had a more consistent spread (range 29 vs 33)."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 10: Extension Practice — Comparison Challenge
    // ------------------------------------------------------------------------
    {
      type: "practice",
      phase: "extension",
      estimatedMinutes: 7,
      timerMinutes: 5,
      title: "Extension Challenge: Comparing Data Spread",
      subtitle: "Apply statistical reasoning to compare datasets (5 minutes timer)",
      tasks: [
        {
          title: "Challenge: Range & Consistency",
          prompt: "Look at the back-to-back plot on Slide 9. Which class has the greater spread of marks, and what does this tell us about student consistency?",
          blocks: [
            {
              type: "paragraph",
              text: "Calculate and compare both ranges to justify your mathematical conclusion."
            }
          ],
          solution: [
            {
              type: "paragraph",
              text: "• Class 7A Range = $44 - 15 = 29$\n• Class 7B Range = $45 - 12 = 33$\nClass 7B has a greater spread of marks because their range is 4 marks higher (33 vs 29). This indicates that Class 7A performed more consistently overall."
            }
          ]
        },
        {
          title: "Distribution Shape Check",
          prompt: "Examine Class 7A on Slide 9: are the marks symmetrically distributed around the middle stems?",
          solution: [
            {
              type: "paragraph",
              text: "Yes. Class 7A has 2 scores in the 10s, 4 scores in the 20s, 4 scores in the 30s, and 2 scores in the 40s. The shape is balanced and approximately symmetrical."
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
      subtitle: "Complete these two quick checks before packing up",
      questions: [
        {
          prompt: "For the number 148, identify the stem and leaf when splitting into tens and units.",
          solution: [
            {
              type: "paragraph",
              text: "Stem = **14**, Leaf = **8**"
            }
          ]
        },
        {
          prompt: "State the two values used to calculate the range of this plot:",
          blocks: [
            {
              type: "stem-and-leaf",
              key: "Key: 4 | 1 means 41",
              rows: [
                { stem: 4, leaves: "1 5" },
                { stem: 5, leaves: "0 2 8" }
              ]
            }
          ],
          solution: [
            {
              type: "paragraph",
              text: "Lowest value = **41**, Highest value = **58**.\n$$\\text{Range} = 58 - 41 = 17$$"
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
      title: "Lesson Summary: 8E",
      takeaways: [
        "A stem-and-leaf plot retains every single original data value while displaying overall frequency distribution.",
        "Stems are written vertically in order; leaves are single digits written horizontally in ascending order.",
        "Always include a key so readers know the place value of the data.",
        "Equal horizontal spacing between leaf digits is required to avoid visual bias.",
        "Back-to-back plots use a single shared stem, with left-hand leaves reading backwards from the centre."
      ]
    }
  ]
};
