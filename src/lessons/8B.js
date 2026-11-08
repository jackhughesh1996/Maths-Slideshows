/**
 * @file 8B.js
 * Year 7 Mathematics: Lesson 8B — Mean, Median and Mode
 * Chapter: Statistics and Probability
 * Resource: Year 7 Mathematics Statistics · Gradual Release Worksheet
 * Pacing: 60-minute lesson designed around tight I Do -> We Do -> You Do model.
 * Prioritises mean and median; mode presented as a concise recap.
 */

export default {
  id: "8B",
  title: "Mean, Median and Mode",
  subject: "Mathematics",
  yearLevel: 7,
  unit: "Chapter 8",
  folder: "Statistics and Probability",
  chapter: "Statistics and Probability",
  topics: [
    "Measures of Centre",
    "meAn: Add and Divide",
    "meDian: Down the Middle",
    "mOde: Occurs Most Often",
    "Worksheet Gradual Release"
  ],
  slides: [
    // ------------------------------------------------------------------------
    // SLIDE 1: Title
    // ------------------------------------------------------------------------
    {
      type: "title",
      phase: "opening",
      estimatedMinutes: 1,
      title: "Mean, Median and Mode",
      subtitle: "Summarising data numerically using three measures of centre",
      overview: "Learn to calculate and distinguish the three core measures of central tendency using the three word mnemonics: meAn, meDian, and mOde.",
      topics: [
        "The Three Mnemonics: meAn, meDian, and mOde",
        "Calculating the Mean: ADD, COUNT, then DIVIDE",
        "Finding the Median: ORDER first, then locate the Middle",
        "Identifying the Mode: The value that Occurs Most Often",
        "Worksheet Gradual Release & Workbook Exercises"
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
      subtitle: "Worksheet Focus & Success Criteria",
      learningIntention: "Find and distinguish the mean, median and mode of a data set.",
      successCriteria: [
        "I can calculate the mean by adding all values and dividing by how many there are.",
        "I can identify the median by sorting the data and finding the middle value (or the average of two middle values).",
        "I can find the mode by identifying the value(s) that occur most often, or state when there is no mode."
      ],
      keyPrinciple: "meAn = Add and divide by count · meDian = Down the middle after sorting · mOde = Occurs most often."
    },

    // ------------------------------------------------------------------------
    // SLIDE 3: Do Now (Warm-up / Oral Diagnostic)
    // ------------------------------------------------------------------------
    {
      type: "do-now",
      phase: "opening",
      estimatedMinutes: 3,
      title: "Do Now: Memory Mnemonics Diagnostic",
      subtitle: "Remember the letters inside the words before we begin",
      questions: [
        {
          prompt: "Which measure of centre requires you to ADD all the numbers, then DIVIDE by how many there are?",
          answer: "**meAn** (The letter **A** = Add the numbers, then divide by count)"
        },
        {
          prompt: "Which measure requires you to put numbers in ORDER and look Down the middle?",
          answer: "**meDian** (The letter **D** = Down the middle, after sorting)"
        },
        {
          prompt: "Which measure identifies the value that Occurs most often?",
          answer: "**mOde** (The letter **O** = Occurs most often)"
        },
        {
          prompt: "In the data set 2, 5, 5, 8, which number is the mode?",
          answer: "**Mode = 5** (5 occurs twice; 2 and 8 occur only once)"
        }
      ],
      sidebarNotes: [
        {
          type: "note-box",
          variant: "gold",
          title: "Worksheet Page 1 Mnemonic Guide",
          text: "• **meAn:** **A** = Add the numbers, then divide by how many there are.\n• **meDian:** **D** = Down the middle of the numbers after sorting.\n• **mOde:** **O** = Occurs often: the value that appears most."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 4: Focus Skill 01 — The Mean
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 3,
      title: "Focus Skill 01: The Mean",
      subtitle: "Worksheet Page 1 · ADD, then DIVIDE",
      columns: [
        {
          width: "60",
          title: "The Three Action Steps",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "default",
              title: "1. Definition of the Mean",
              text: "The **mean** is the total of all values shared out equally:\n$$\\text{Mean} = \\frac{\\text{Total of all the values}}{\\text{Number of values}}$$\nFollow three distinct steps in order:\n• **Step 1 — ADD:** Calculate the total sum of all numbers.\n• **Step 2 — COUNT:** Count how many values there are ($n$).\n• **Step 3 — DIVIDE:** Divide the total sum by the count."
            },
            {
              type: "note-box",
              variant: "alert",
              title: "2. Critical Warning: What to Divide By",
              text: "**Count how many values there are; don't divide by the largest value!**\nIf there are 4 numbers, divide by 4. Never divide by the biggest number in the list."
            }
          ]
        },
        {
          width: "40",
          title: "Check Yourself & Chant",
          blocks: [
            {
              type: "note-box",
              variant: "gold",
              title: "Check Yourself",
              text: "A mean **does not have to be one of the original numbers** in the data set!\nFor example, the mean of 5 and 7 is 6, which is not in the list."
            },
            {
              type: "note-box",
              variant: "green",
              title: "Say It Aloud",
              text: "**meAn = Add, then divide.**\nSay it aloud three times with your class!"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 5: Mean — I Do Worked Example
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 4,
      title: "I Do: Calculating the Mean",
      subtitle: "Worksheet Page 1 · Fully Worked Example",
      prompt: "Find the mean of the data set: 5, 7, 9, 11.",
      data: "Data values: 5, 7, 9, 11",
      leftBlocks: [
        {
          type: "note-box",
          variant: "default",
          title: "Teacher Modelling",
          text: "In your exercise book, always write down the three steps clearly:\n1. **ADD** (the total sum)\n2. **COUNT** (the number of items)\n3. **DIVIDE** (sum divided by count)"
        },
        {
          type: "note-box",
          variant: "gold",
          title: "Notice the Result",
          text: "The mean is **8**. Notice that 8 is not in the list {5, 7, 9, 11}, but it is the exact fair-share centre."
        }
      ],
      steps: [
        {
          label: "Step 1 — ADD all the values",
          text: "Add all the numbers together:",
          latex: "5 + 7 + 9 + 11 = 32"
        },
        {
          label: "Step 2 — COUNT how many values there are",
          text: "Count the number of items in the set:\nThere are **4 numbers** in the data set ($n = 4$)."
        },
        {
          label: "Step 3 — DIVIDE the sum by the count",
          text: "Divide the sum (32) by the count of values (4):",
          latex: "\\text{Mean} = 32 \\div 4 = \\mathbf{8}"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 6: Mean — We Do (Questions 1 & 2)
    // ------------------------------------------------------------------------
    {
      type: "board-task",
      phase: "guided",
      estimatedMinutes: 4,
      title: "We Do: Calculating the Mean (Q1 & Q2)",
      subtitle: "Worksheet Page 1 · The help gradually disappears",
      studentAction: "On mini-whiteboards or in exercise books: complete the missing steps for Q1 and Q2.",
      prompt: "Worksheet Page 1: Copy and complete the missing working in your exercise book.",
      separateSolutions: true,
      workspaceContent: [
        {
          type: "paragraph",
          text: "Fill in the missing blanks before checking the model solutions:"
        },
        {
          type: "table",
          headers: ["Question", "Data Values", "Level of Help", "Working Steps to Complete"],
          rows: [
            [
              "**1**",
              "3, 5, 7, 9, 11",
              "Nearly Done",
              "ADD: $3 + 5 + 7 + 9 + 11 = 35$\nCOUNT: 5 values\nDIVIDE: $35 \\div 5 = \\underline{\\hspace{2em}}$"
            ],
            [
              "**2**",
              "2, 4, 8, 10",
              "Some Gaps",
              "ADD: $2 + 4 + 8 + 10 = \\underline{\\hspace{2em}}$\nCOUNT: 4 values\nDIVIDE: $\\underline{\\hspace{2em}} \\div 4 = \\underline{\\hspace{2em}}$"
            ]
          ]
        }
      ],
      notes: [
        {
          type: "note-box",
          variant: "gold",
          title: "Teacher Checkpoint Question",
          text: "In Question 2, why do we divide by 4 and not by 10? Does the mean (6) appear in the original data?"
        }
      ],
      solution: [
        {
          type: "solution",
          badgeTitle: "Question 1 Solution",
          revealStep: 1,
          text: "**Question 1 (3, 5, 7, 9, 11):**\n• ADD: $3 + 5 + 7 + 9 + 11 = 35$\n• COUNT: 5 values\n• DIVIDE: $35 \\div 5 = 7$\n$$\\mathbf{\\text{Mean} = 7}$$"
        },
        {
          type: "solution",
          badgeTitle: "Question 2 Solution",
          revealStep: 2,
          text: "**Question 2 (2, 4, 8, 10):**\n• ADD: $2 + 4 + 8 + 10 = 24$\n• COUNT: 4 values\n• DIVIDE: $24 \\div 4 = 6$\n$$\\mathbf{\\text{Mean} = 6}$$\n*(Note: 6 is not in the original list!)*"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 7: Mean — We Do (Questions 3, 4 & 5)
    // ------------------------------------------------------------------------
    {
      type: "board-task",
      phase: "guided",
      estimatedMinutes: 4,
      title: "We Do: Calculating the Mean (Q3, Q4 & Q5)",
      subtitle: "Worksheet Page 1 · Releasing scaffolding towards independence",
      studentAction: "In your exercise book: write the full ADD, COUNT, DIVIDE working for Q3, Q4, and Q5.",
      prompt: "Worksheet Page 1: Complete Questions 3, 4, and 5 in your exercise book.",
      separateSolutions: true,
      workspaceContent: [
        {
          type: "table",
          headers: ["Question", "Data Set", "Scaffold Guide"],
          rows: [
            [
              "**3**",
              "4, 6, 9, 13, 18",
              "ADD: total $= \\underline{\\hspace{2.5em}}$ · COUNT: $\\underline{\\hspace{2em}}$ · Mean $= \\underline{\\hspace{2em}}$"
            ],
            [
              "**4**",
              "7, 8, 11, 14",
              "Start with $7 + 8 + 11 + 14 = \\underline{\\hspace{2.5em}}$. Complete the other steps yourself."
            ],
            [
              "**5**",
              "5, 5, 7, 11, 12",
              "Almost independent: Find the mean. Show full working in your exercise book."
            ]
          ]
        }
      ],
      notes: [
        {
          type: "note-box",
          variant: "default",
          title: "Teacher Guidance",
          text: "Check that students write all 3 steps clearly and divide by the number of scores ($n = 5$, $n = 4$, $n = 5$)."
        }
      ],
      solution: [
        {
          type: "solution",
          badgeTitle: "Question 3 Solution",
          revealStep: 1,
          text: "**Question 3 (4, 6, 9, 13, 18):**\n• ADD: $4 + 6 + 9 + 13 + 18 = 50$\n• COUNT: 5 values\n• DIVIDE: $50 \\div 5 = 10 \\implies \\mathbf{\\text{Mean} = 10}$"
        },
        {
          type: "solution",
          badgeTitle: "Question 4 Solution",
          revealStep: 2,
          text: "**Question 4 (7, 8, 11, 14):**\n• ADD: $7 + 8 + 11 + 14 = 40$\n• COUNT: 4 values\n• DIVIDE: $40 \\div 4 = 10 \\implies \\mathbf{\\text{Mean} = 10}$"
        },
        {
          type: "solution",
          badgeTitle: "Question 5 Solution",
          revealStep: 3,
          text: "**Question 5 (5, 5, 7, 11, 12):**\n• ADD: $5 + 5 + 7 + 11 + 12 = 40$\n• COUNT: 5 values\n• DIVIDE: $40 \\div 5 = 8 \\implies \\mathbf{\\text{Mean} = 8}$"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 8: Focus Skill 02 — The Median
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 3,
      title: "Focus Skill 02: The Median",
      subtitle: "Worksheet Page 2 · meDian = Down the middle",
      columns: [
        {
          width: "60",
          title: "The Cardinal Rule: ORDER FIRST!",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "default",
              title: "1. Definition of the Median",
              text: "The **median** is the **middle value** of a data set once the values are sorted from smallest to largest.\n\n• **meDian:** **D** = Down the middle — but **ORDER** the numbers first!\n• You must sort the data in ascending order before locating the middle."
            },
            {
              type: "note-box",
              variant: "alert",
              title: "2. The #1 Student Error",
              text: "Picking the middle number of an *unsorted* list!\nAlways rewrite the numbers in order from smallest to largest in your exercise book before crossing off values."
            }
          ]
        },
        {
          width: "40",
          title: "Odd vs Even Counts",
          blocks: [
            {
              type: "note-box",
              variant: "green",
              title: "Odd Number of Values",
              text: "There is **exactly ONE middle number**.\nExample: For 5 values, the 3rd number is the median:\n$$3,\\; 5,\\; [\\mathbf{7}],\\; 9,\\; 11$$"
            },
            {
              type: "note-box",
              variant: "gold",
              title: "Even Number of Values",
              text: "There are **TWO middle numbers**.\nExample: For 4 values (2, 6, 8, 12), the two middles are **6** and **8**:\n$$2,\\; [\\mathbf{6},\\; \\mathbf{8}],\\; 12$$\n$$\\text{Median} = \\frac{6 + 8}{2} = \\frac{14}{2} = \\mathbf{7}$$"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 9: Median — I Do (Odd Number of Values)
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 3,
      title: "I Do: Median (Odd Number of Values)",
      subtitle: "Worksheet Page 2 · Example 1 (Odd Count)",
      prompt: "Find the median of the 5 values: 7, 3, 11, 9, 5.",
      data: "Original data: 7, 3, 11, 9, 5",
      leftBlocks: [
        {
          type: "note-box",
          variant: "default",
          title: "Odd Number of Values ($n = 5$)",
          text: "When $n$ is odd, pairing inward from both outer ends leaves exactly **one single middle number**."
        },
        {
          type: "note-box",
          variant: "green",
          title: "Symmetric Pairing",
          text: "• Pair 1: 3 and 11 (extremes)\n• Pair 2: 5 and 9\n• Unpaired Centre: **7**\nTwo values sit below 7 and two sit above 7."
        }
      ],
      steps: [
        {
          label: "Step 1 — Put the numbers in ascending order",
          text: "Sort from smallest to largest:\n**3, 5, 7, 9, 11**"
        },
        {
          label: "Step 2 — Count values and identify the middle",
          text: "Five values $\\implies$ exactly one middle value (the 3rd number)."
        },
        {
          label: "Step 3 — State the median",
          latex: "\\text{Ordered: } 3,\\; 5,\\; \\mathbf{7},\\; 9,\\; 11 \\implies \\mathbf{\\text{Median} = 7}"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 10: Median — I Do (Even Number of Values)
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 3,
      title: "I Do: Median (Even Number of Values)",
      subtitle: "Worksheet Page 2 · Example 2 (Even Count)",
      prompt: "Find the median of the 4 values: 12, 2, 8, 6.",
      data: "Original data: 12, 2, 8, 6",
      leftBlocks: [
        {
          type: "note-box",
          variant: "alert",
          title: "Even Number of Values ($n = 4$)",
          text: "There is **no single middle number**! The middle falls halfway between the 2nd and 3rd values."
        },
        {
          type: "note-box",
          variant: "gold",
          title: "Finding the Halfway Point",
          text: "To find what is halfway between 6 and 8, calculate their mean:\n$$\\frac{6 + 8}{2} = \\frac{14}{2} = 7$$"
        }
      ],
      steps: [
        {
          label: "Step 1 — Put the numbers in ascending order",
          text: "Sort from smallest to largest:\n**2, 6, 8, 12**"
        },
        {
          label: "Step 2 — Identify the TWO middle numbers",
          text: "Four values $\\implies$ two middle values: **6** and **8** (one number below 6, one number above 8)."
        },
        {
          label: "Step 3 — Find their mean (add and divide by 2)",
          latex: "\\text{Median} = \\frac{6 + 8}{2} = \\frac{14}{2} = \\mathbf{7}"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 11: Median — We Do (Questions 6 & 7)
    // ------------------------------------------------------------------------
    {
      type: "board-task",
      phase: "guided",
      estimatedMinutes: 4,
      title: "We Do: Finding the Median (Q6 & Q7)",
      subtitle: "Worksheet Page 2 · One odd set, one even set",
      studentAction: "In exercise books: write the numbers in order, then determine the median.",
      prompt: "Worksheet Page 2: Follow the guided prompts for Questions 6 and 7.",
      separateSolutions: true,
      workspaceContent: [
        {
          type: "table",
          headers: ["Question", "Data Values", "Count", "Guided Scaffold"],
          rows: [
            [
              "**6**",
              "10, 4, 8, 6, 12",
              "5 (Odd)",
              "ORDER: 4, 6, 8, 10, 12\nThe middle number is $\\underline{\\hspace{2em}}$\nMedian = $\\underline{\\hspace{2em}}$"
            ],
            [
              "**7**",
              "12, 3, 9, 6",
              "4 (Even)",
              "ORDER: 3, 6, 9, 12\nThe two middle numbers are 6 and 9\nMedian = $(6 + 9) \\div 2 = \\underline{\\hspace{2.5em}}$"
            ]
          ]
        }
      ],
      notes: [
        {
          type: "note-box",
          variant: "gold",
          title: "Teacher Checkpoint",
          text: "In Question 7, $(6 + 9) \\div 2 = 15 \\div 2 = 7.5$. Remind students that medians can be decimals ending in .5 when averaging two middle integers."
        }
      ],
      solution: [
        {
          type: "solution",
          badgeTitle: "Question 6 Solution",
          revealStep: 1,
          text: "**Question 6 (5 values - Odd):**\n• ORDER: 4, 6, **8**, 10, 12\n• The single middle number is 8\n$$\\mathbf{\\text{Median} = 8}$$"
        },
        {
          type: "solution",
          badgeTitle: "Question 7 Solution",
          revealStep: 2,
          text: "**Question 7 (4 values - Even):**\n• ORDER: 3, **6**, **9**, 12\n• Two middle numbers: 6 and 9\n• Median $= (6 + 9) \\div 2 = 15 \\div 2 = \\mathbf{7.5}$\n*(or $7\\frac{1}{2}$)*"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 12: Median — We Do (Questions 8, 9 & 10)
    // ------------------------------------------------------------------------
    {
      type: "board-task",
      phase: "guided",
      estimatedMinutes: 4,
      title: "We Do: Finding the Median (Q8, Q9 & Q10)",
      subtitle: "Worksheet Page 2 · Decreasing scaffolding",
      studentAction: "In exercise books: sort each list and calculate the median.",
      prompt: "Worksheet Page 2: Solve Questions 8, 9, and 10 with full working in your exercise book.",
      separateSolutions: true,
      workspaceContent: [
        {
          type: "table",
          headers: ["Question", "Original Data", "Task Required"],
          rows: [
            [
              "**8**",
              "13, 7, 5, 9, 11",
              "ORDER: $\\underline{\\hspace{8em}}$ · Middle: $\\underline{\\hspace{2em}}$ · Median: $\\underline{\\hspace{2em}}$"
            ],
            [
              "**9**",
              "18, 6, 12, 8, 14, 10",
              "Put six numbers in order; identify two middle numbers; calculate their mean."
            ],
            [
              "**10**",
              "9, 2, 5, 7, 13, 11",
              "Find the median. Show your full method in your exercise book."
            ]
          ]
        }
      ],
      notes: [
        {
          type: "note-box",
          variant: "default",
          title: "Teacher Guidance",
          text: "Questions 9 and 10 both contain 6 values (even). Students must find the 3rd and 4th values in the sorted list and calculate their mean."
        }
      ],
      solution: [
        {
          type: "solution",
          badgeTitle: "Question 8 Solution",
          revealStep: 1,
          text: "**Question 8 (5 numbers - Odd):**\n• ORDER: 5, 7, **9**, 11, 13\n• Single middle number: 9\n$$\\mathbf{\\text{Median} = 9}$$"
        },
        {
          type: "solution",
          badgeTitle: "Question 9 Solution",
          revealStep: 2,
          text: "**Question 9 (6 numbers - Even):**\n• ORDER: 6, 8, **10**, **12**, 14, 18\n• Two middle numbers: 10 and 12\n• Median $= (10 + 12) \\div 2 = 22 \\div 2 = \\mathbf{11}$"
        },
        {
          type: "solution",
          badgeTitle: "Question 10 Solution",
          revealStep: 3,
          text: "**Question 10 (6 numbers - Even):**\n• ORDER: 2, 5, **7**, **9**, 11, 13\n• Two middle numbers: 7 and 9\n• Median $= (7 + 9) \\div 2 = 16 \\div 2 = \\mathbf{8}$"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 13: Misconception Check — Middle vs Extremes
    // ------------------------------------------------------------------------
    {
      type: "board-task",
      phase: "guided",
      estimatedMinutes: 2,
      title: "Common Mistake: Middle vs Extremes",
      subtitle: "Worksheet Page 2 · Do not confuse middle with halfway between extremes",
      studentAction: "Discuss with a partner: why is 21 wrong, and what is the real median?",
      prompt: "Worksheet Page 2 Common Mistake: Look at the values 2, 3, 4, 5, 40.",
      data: "Data set: 2, 3, 4, 5, 40",
      workspaceContent: [
        {
          type: "note-box",
          variant: "alert",
          title: "A Student Claims:",
          text: "'The median of 2, 3, 4, 5, 40 is $(2 + 40) \\div 2 = 21$.'\n\n**Class Questions:**\n1. What did the student do wrong?\n2. What is the actual median of this data set?"
        }
      ],
      solution: [
        {
          type: "solution",
          badgeTitle: "The Common Mistake Explained",
          text: "**Why $(2 + 40) \\div 2 = 21$ is WRONG:**\n• That formula only averages the smallest (2) and largest (40) values (the extremes or mid-range)!\n• It completely ignores where the data values actually cluster.\n\n**Correct Method:**\n• The list is already ordered: $2,\\; 3,\\; \\mathbf{4},\\; 5,\\; 40$.\n• The middle number of the 5 values is **4**.\n$$\\mathbf{\\text{Correct Median} = 4}$$\n*Crucial insight: The extreme outlier 40 does NOT pull the median away from 4!*"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 14: Focus Skill 03 — The Mode (Quick Recap)
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 3,
      title: "Focus Skill 03: The Mode",
      subtitle: "Worksheet Page 3 · mOde = Occurs most Often",
      columns: [
        {
          width: "50",
          title: "One Mode",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "default",
              title: "mOde = Occurs most Often",
              text: "The **mode** is the data value that appears with the highest frequency.\n\n**Example 1 (One Mode):**\nIn the set: 3, **4**, **4**, 6, 8\nThe number 4 appears twice; all other numbers appear once.\n$$\\mathbf{\\text{Mode} = 4}$$"
            },
            {
              type: "note-box",
              variant: "green",
              title: "Say It Aloud",
              text: "**mOde = Occurs most Often!**"
            }
          ]
        },
        {
          width: "50",
          title: "Two Modes or No Mode",
          blocks: [
            {
              type: "note-box",
              variant: "gold",
              title: "Example 2: Two Modes (Bimodal)",
              text: "In the set: **2**, **2**, **3**, **3**, 5\nBoth 2 and 3 appear twice (tied for highest frequency).\n$$\\mathbf{\\text{Modes} = 2 \\text{ and } 3}$$"
            },
            {
              type: "note-box",
              variant: "alert",
              title: "Example 3: No Mode",
              text: "In the set: 2, 3, 4, 5\nEvery value appears exactly once. No value occurs more often than any other.\n$$\\mathbf{\\text{Mode} = \\text{None (No Mode)}}$$"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 15: You Do — Independent Practice
    // ------------------------------------------------------------------------
    {
      type: "practice",
      phase: "independent",
      estimatedMinutes: 10,
      timerMinutes: 10,
      title: "You Do: Independent Practice",
      subtitle: "Worksheet Page 3 · Questions 1–18 (Work in your exercise book)",
      content: [
        {
          type: "note-box",
          variant: "default",
          title: "Workbook Instructions",
          text: "Answer all questions in your **exercise book** — do not write on the printed worksheet sheet!\n• **For mean and median:** show your full method.\n• **For mode:** state the most frequent value(s), or write *no mode*.\n• The teacher will reveal model checks after independent working time."
        }
      ],
      tasks: [
        {
          title: "Tier 1: Core Skills (Q1–12)",
          prompt: "Worksheet Page 3:\n• **Q1–5:** Find the mean (show sum and division)\n• **Q6–10:** Find the median (order numbers first!)\n• **Q11–12:** Find the mode",
          solution: [
            {
              type: "paragraph",
              text: "**Answers Q1–12:**\n• **Mean (Q1–5):** Q1: $\\mathbf{10}$, Q2: $\\mathbf{8}$, Q3: $\\mathbf{10}$, Q4: $\\mathbf{8.5}$, Q5: $\\mathbf{10}$ ($45 - 35$)\n• **Median (Q6–10):** Q6: $\\mathbf{9}$, Q7: $\\mathbf{10}$, Q8: $\\mathbf{35}$, Q9: $\\mathbf{8}$, Q10: $\\mathbf{5}$\n• **Mode (Q11–12):** Q11: $\\mathbf{4}$, Q12: $\\mathbf{2 \\text{ and } 4}$"
            }
          ]
        },
        {
          title: "Tier 2: Mixed Questions (Q13–16)",
          prompt: "Worksheet Page 3:\n• **Q13:** Mean, median and mode of 2, 3, 3, 4, 8\n• **Q14:** Mean, median and mode of 2, 2, 4, 6, 11\n• **Q15:** Explain the mean mistake for 3, 6, 9, 12\n• **Q16:** Explain the median mistake for 2, 4, 5, 7, 18",
          solution: [
            {
              type: "paragraph",
              text: "**Answers Q13–16:**\n• **Q13:** $\\text{Mean} = 20 \\div 5 = \\mathbf{4}$, $\\text{Median} = \\mathbf{3}$, $\\text{Mode} = \\mathbf{3}$\n• **Q14:** $\\text{Mean} = 25 \\div 5 = \\mathbf{5}$, $\\text{Median} = \\mathbf{4}$, $\\text{Mode} = \\mathbf{2}$\n• **Q15:** Mistake: divided by the largest number (12) instead of the count (4). Correct mean is $30 \\div 4 = \\mathbf{7.5}$.\n• **Q16:** Mistake: averaged the extreme values $(2+18)\\div 2 = 10$. The correct median is the middle number: $\\mathbf{5}$."
            }
          ]
        },
        {
          title: "Tier 3: Reasoning & Outliers (Q17–18)",
          prompt: "Worksheet Page 3:\n• **Q17:** Three numbers have mean 8. Two are 5 and 8. Find third number.\n• **Q18:** For 4, 5, 5, 6, 30: find mean, median and mode. Which measure is most affected by 30?",
          solution: [
            {
              type: "paragraph",
              text: "**Answers Q17–18:**\n• **Q17:** Total $= 3 \\times 8 = 24$. Known sum: $5 + 8 = 13$. Third number: $24 - 13 = \\mathbf{11}$.\n• **Q18:** $\\text{Mean} = 50 \\div 5 = \\mathbf{10}$, $\\text{Median} = \\mathbf{5}$, $\\text{Mode} = \\mathbf{5}$.\nThe **mean** is most affected by the unusually large value of 30 (pulled from 5 up to 10), while the median and mode stay at 5!"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 16: Review — Key Problem-Solving Insights
    // ------------------------------------------------------------------------
    {
      type: "board-task",
      phase: "assessment",
      estimatedMinutes: 3,
      title: "Review: Key Problem-Solving Models",
      subtitle: "Worksheet Page 3 · Deep dive into Q5, Q15, Q16, and Q18",
      studentAction: "Check your exercise book working against these model explanations.",
      prompt: "Worksheet Page 3: Comparing the big mathematical ideas from independent practice.",
      separateSolutions: true,
      workspaceContent: [
        {
          type: "table",
          headers: ["Question", "Concept", "Key Mathematical Insight"],
          rows: [
            [
              "**Q5**",
              "Working backwards from Mean",
              "Total $= 5 \\times 9 = 45$. Subtract known sum ($35$) to find missing score."
            ],
            [
              "**Q15**",
              "Mistake: Divide by largest value",
              "Must divide by count ($n = 4$), not 12. $30 \\div 4 = 7.5$."
            ],
            [
              "**Q16**",
              "Mistake: Averaging extremes",
              "Median is middle score of sorted list ($5$), NOT $(2+18)\\div 2 = 10$."
            ],
            [
              "**Q18**",
              "Outlier effect on centre",
              "Mean is sensitive to extreme values; median and mode are resistant."
            ]
          ]
        }
      ],
      notes: [
        {
          type: "note-box",
          variant: "gold",
          title: "Discussion Question",
          text: "Why is the median often preferred over the mean when reporting house prices or salaries in Australia?"
        }
      ],
      solution: [
        {
          type: "solution",
          badgeTitle: "Q5: Missing Value Solution",
          revealStep: 1,
          text: "**Q5 (Working Backwards from Mean):**\n• Mean of 5 scores is 9 $\\implies$ Total sum $= 5 \\times 9 = 45$\n• Sum of 4 known scores: $6 + 8 + 10 + 11 = 35$\n• Missing fifth score: $45 - 35 = \\mathbf{10}$"
        },
        {
          type: "solution",
          badgeTitle: "Q15 & Q16: Error Analysis",
          revealStep: 2,
          text: "**Q15 Error:** Divided by the largest number 12 instead of count 4. Correct: $30 \\div 4 = \\mathbf{7.5}$.\n**Q16 Error:** Averaged the extremes $(2 + 18) \\div 2$. Correct median is the middle value of sorted list: $\\mathbf{5}$."
        },
        {
          type: "solution",
          badgeTitle: "Q18: Impact of Outliers",
          revealStep: 3,
          text: "**Q18 (Data: 4, 5, 5, 6, 30):**\n• Mean $= \\frac{50}{5} = \\mathbf{10}$ (doubled by the extreme value 30!)\n• Median $= \\mathbf{5}$, Mode $= \\mathbf{5}$\n• **The Mean is strongly affected by outliers**, while the Median and Mode remain robust and unchanged."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 17: Exit Ticket
    // ------------------------------------------------------------------------
    {
      type: "exit-ticket",
      phase: "assessment",
      estimatedMinutes: 3,
      title: "Exit Ticket: Distinguishing the Measures",
      subtitle: "Formative check in your exercise book before leaving",
      questions: [
        {
          prompt: "Consider the data set: **3, 4, 4, 5, 9**.\nCalculate the **mean**, **median**, and **mode**.",
          solution: [
            {
              type: "paragraph",
              text: "• **meAn:** Add then divide: $\\frac{3 + 4 + 4 + 5 + 9}{5} = \\frac{25}{5} = \\mathbf{5}$\n• **meDian:** List is already sorted: $3,\\; 4,\\; \\mathbf{4},\\; 5,\\; 9$. Middle number $= \\mathbf{4}$\n• **mOde:** 4 appears most often (twice) $\\implies \\mathbf{4}$"
            }
          ]
        },
        {
          prompt: "If the value **9** was replaced by an extreme score of **99**, which of the three measures would change the most? Explain why.",
          solution: [
            {
              type: "paragraph",
              text: "The **mean** changes the most!\n• **Mean** skyrockets from 5 to $\\frac{3 + 4 + 4 + 5 + 99}{5} = \\frac{115}{5} = \\mathbf{23}$!\n• **Median** stays **4** (still the 3rd number in order).\n• **Mode** stays **4** (still occurs most often)."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 18: Summary & Final Self-Check
    // ------------------------------------------------------------------------
    {
      type: "summary",
      phase: "assessment",
      estimatedMinutes: 1,
      title: "Lesson Summary: The Big Three",
      subtitle: "Worksheet Page 3 Final Self-Check",
      takeaways: [
        "**meAn:** **A** = Add the numbers, then divide by the count ($n$). Does not have to be an original number!",
        "**meDian:** **D** = Down the middle. Always order the numbers first! For even counts, average the two middle numbers.",
        "**mOde:** **O** = Occurs most often. Can be one mode, bimodal (two modes), or no mode.",
        "**Extreme Values (Outliers):** The mean is heavily influenced by unusually large or small values, whereas median and mode are resistant.",
        "**Final Self-Check:** Did I add and divide by count? Did I put data in order? Which value occurs most often?"
      ]
    }
  ]
};
