/**
 * @file 3E.js
 * Year 7 Mathematics: Lesson 3E — Adding Fractions
 * Textbook: Pages 169–174
 * Pacing: 60-minute lesson designed around a gradual release model (I Do -> We Do -> You Do).
 * Covers like fractions, lowest common denominator (LCD), equivalent conversions, and mixed numerals.
 */

export default {
  id: "3E",
  title: "Adding Fractions",
  subject: "Mathematics",
  yearLevel: 7,
  unit: "Chapter 3",
  folder: "Fractions",
  chapter: "Fractions",
  topics: [
    "Adding Like Fractions",
    "Common Denominators & LCD",
    "Equivalent Fractions",
    "Adding Unlike Fractions",
    "Adding Mixed Numerals"
  ],
  slides: [
    // ------------------------------------------------------------------------
    // SLIDE 1: Title & Learning Intentions
    // ------------------------------------------------------------------------
    {
      type: "learning",
      phase: "opening",
      estimatedMinutes: 2,
      title: "3E: Adding Fractions",
      subtitle: "Textbook Pages 169–174 · Adding like, unlike, and mixed fractions",
      learningIntention: "Understand why adding fractions requires a common denominator, add like and unlike fractions using the lowest common denominator (LCD), and add mixed numerals and simplify answers.",
      successCriteria: [
        "I can add fractions with like denominators by adding numerators and keeping the common denominator.",
        "I can find the lowest common denominator (LCD) using multiples to convert and add unlike fractions.",
        "I can add mixed numerals by combining whole-number and fractional parts, simplifying and renaming improper fractions."
      ],
      keyPrinciple: "Fractions can only be added when they have a common denominator (equal-sized parts). Once denominators match, add the numerators!"
    },

    // ------------------------------------------------------------------------
    // SLIDE 2: Starter: Like Addition
    // ------------------------------------------------------------------------
    {
      type: "do-now",
      phase: "opening",
      estimatedMinutes: 4,
      title: "Starter: Like Addition",
      subtitle: "Which quantities can be combined directly? Spacebar reveals answers",
      questions: [
        {
          prompt: "Can you add directly: $3\\text{ goals} + 2\\text{ goals}$?",
          answer: "Yes! $3\\text{ goals} + 2\\text{ goals} = 5\\text{ goals}$ (the units/items are identical)."
        },
        {
          prompt: "Can you add directly: $40\\text{ cm} + 2\\text{ m}$?",
          answer: "No! Different units. Convert to a common unit first: $40\\text{ cm} + 200\\text{ cm} = 240\\text{ cm}$."
        },
        {
          prompt: "Can you add directly: $\\frac{3}{8} + \\frac{2}{8}$?",
          answer: "Yes! Both fractions are in eighths (like denominators): $\\frac{3+2}{8} = \\frac{5}{8}$."
        },
        {
          prompt: "Can you add directly: $\\frac{1}{3} + \\frac{1}{4}$?",
          answer: "No! Thirds and quarters are different-sized parts. We must convert them to a common denominator first!"
        }
      ],
      sidebarNotes: [
        {
          type: "note-box",
          variant: "gold",
          title: "💡 The Denominator Names the Unit",
          text: "You can only add quantities that share the **same name or unit**!\n• The **denominator** tells you the size and name of each slice.\n• When denominators match, you are adding equal-sized slices."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 3: Adding Like Fractions
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 4,
      title: "Adding Like Fractions",
      subtitle: "Fractions with the same denominator count parts of identical size",
      columns: [
        {
          width: "half",
          title: "1. The Like Fraction Rule",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "default",
              title: "Rule for Like Fractions",
              text: "To add fractions with the **same denominator**, add the **numerators** and keep the denominator unchanged:\n$$\\frac{a}{c} + \\frac{b}{c} = \\frac{a + b}{c}$$\nExample: $\\frac{3}{8} + \\frac{2}{8} = \\frac{3 + 2}{8} = \\frac{5}{8}$"
            },
            {
              type: "note-box",
              variant: "alert",
              title: "⚠️ Cardinal Student Misconception",
              text: "**NEVER add the denominators!**\n$$\\frac{3}{8} + \\frac{2}{8} \\neq \\frac{5}{16}$$\nAdding 3 slices of an 8-slice pizza to 2 slices does **not** turn the pizza into 16 slices! The slice size (eighths) remains identical."
            }
          ]
        },
        {
          width: "half",
          title: "2. Visual Fraction Bar: 3/8 + 2/8 = 5/8",
          blocks: [
            {
              type: "measured-bar",
              title: "Fraction Bar: 8 Equal Parts",
              subtitle: "3 eighths (blue) + 2 eighths (green) = 5 eighths shaded",
              totalLength: 8,
              unit: "parts",
              total: 8,
              showTicks: true,
              showMinorTicks: false,
              progressive: true,
              checkMath: "\\frac{3}{8} + \\frac{2}{8} = \\frac{5}{8}",
              checkLabel: "Total Shaded",
              categories: [
                { label: "3/8", value: 3, color: "#2563eb" },
                { label: "2/8", value: 2, color: "#16a34a" },
                { label: "Unshaded", value: 3, color: "#cbd5e1" }
              ]
            },
            {
              type: "note-box",
              variant: "green",
              title: "Summary Insight",
              text: "• **Count:** $3\\text{ eighths} + 2\\text{ eighths} = 5\\text{ eighths}$.\n• The denominator 8 only tells us that 8 slices make a whole."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 4: Worked Example 12: Like Fractions
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 5,
      title: "Worked Example 12: Like Fractions",
      subtitle: "Textbook Example 12 (Page 170) · Adding numerators & simplifying",
      prompt: "Calculate each sum, simplifying your answer or writing as a mixed numeral where appropriate:",
      leftBlocks: [
        {
          type: "note-box",
          variant: "default",
          title: "Questions to Solve",
          text: "**Part (a):**\n$$\\frac{1}{5} + \\frac{3}{5}$$\n\n**Part (b):**\n$$\\frac{3}{11} + \\frac{5}{11} + \\frac{6}{11}$$"
        },
        {
          type: "note-box",
          variant: "gold",
          title: "Textbook Convention",
          text: "• Same denominators: add numerators and keep denominator unchanged.\n• Always convert an improper fraction answer to a **mixed numeral**."
        }
      ],
      steps: [
        {
          part: "Part (a): $\\frac{1}{5} + \\frac{3}{5}$",
          label: "Add numerators over common denominator",
          text: "The denominators are identical ($5$). Add the numerators together over $5$:",
          latex: "\\frac{1}{5} + \\frac{3}{5} = \\frac{1 + 3}{5} = \\mathbf{\\frac{4}{5}}"
        },
        {
          part: "Part (b): $\\frac{3}{11} + \\frac{5}{11} + \\frac{6}{11}$",
          label: "Add numerators over common denominator",
          text: "All three fractions share the common denominator $11$. Add the three numerators:",
          latex: "\\frac{3}{11} + \\frac{5}{11} + \\frac{6}{11} = \\frac{3 + 5 + 6}{11} = \\mathbf{\\frac{14}{11}}"
        },
        {
          part: "Part (b): $\\frac{3}{11} + \\frac{5}{11} + \\frac{6}{11}$",
          label: "Convert improper fraction to a mixed numeral",
          text: "Because the numerator is greater than the denominator ($14 > 11$), divide $14 \\div 11 = 1$ remainder $3$:",
          latex: "\\frac{14}{11} = \\frac{11}{11} + \\frac{3}{11} = \\mathbf{1\\frac{3}{11}}",
          blocks: [
            {
              type: "note-box",
              variant: "gold",
              title: "Textbook Convention",
              text: "Always convert an improper fraction answer into a **mixed numeral** unless explicitly told otherwise."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 5: Adding Unlike Fractions
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 4,
      title: "Adding Unlike Fractions",
      subtitle: "Why we cannot add across, and why a common denominator is necessary",
      columns: [
        {
          width: "half",
          title: "1. The Fallacy: Why 1/3 + 1/4 ≠ 2/7",
          blocks: [
            {
              type: "note-box",
              variant: "alert",
              title: "❌ NON-EXAMPLE: Why 'Adding Across' Fails",
              text: "**False Equation (Common Error):**\n$$\\frac{1}{3} + \\frac{1}{4} = \\frac{1 + 1}{3 + 4} = \\frac{2}{7} \\quad \\mathbf{\\color{#dc2626}{\\text{❌ (FALSE!)}}}$$\n\n**Decimal Contradiction Check:**\n• Starting amount: $\\frac{1}{3} \\approx 0.333$\n• After 'adding' $\\frac{1}{4}$ across: $\\frac{2}{7} \\approx 0.286$\nAdding a positive quantity resulted in a sum that is **smaller** than what you started with! That is mathematically impossible."
            },
            {
              type: "note-box",
              variant: "default",
              title: "Unequal Slices",
              text: "A third ($\\frac{1}{3}$) and a quarter ($\\frac{1}{4}$) are different slice sizes. You cannot count how many pieces you have until all pieces share identical denominators!"
            }
          ]
        },
        {
          width: "half",
          title: "2. Visual Proof: True Sum (7/12) vs Mistake (2/7)",
          blocks: [
            {
              type: "measured-bar",
              title: "True Combined Sum: 1/3 + 1/4 = 7/12",
              subtitle: "4 twelfths (blue) + 3 twelfths (green) = 7 twelfths shaded (more than half)",
              totalLength: 12,
              unit: "twelfths",
              total: 12,
              showTicks: true,
              showMinorTicks: false,
              progressive: true,
              checkMath: "\\frac{4}{12} + \\frac{3}{12} = \\frac{7}{12}",
              checkLabel: "True Sum",
              categories: [
                { label: "1/3 (= 4/12)", value: 4, color: "#2563eb" },
                { label: "1/4 (= 3/12)", value: 3, color: "#16a34a" },
                { label: "Unshaded", value: 5, color: "#cbd5e1" }
              ]
            },
            {
              type: "measured-bar",
              title: "The 'Adding Across' Mistake: 2/7",
              subtitle: "2 sevenths shaded is smaller than 1/3 alone! Visually way too small",
              totalLength: 7,
              unit: "sevenths",
              total: 7,
              showTicks: true,
              showMinorTicks: false,
              reveal: true,
              checkMath: "\\frac{2}{7} \\approx 0.286 \\ll \\frac{7}{12} \\approx 0.583",
              checkLabel: "Visually Way Too Small",
              categories: [
                { label: "2/7 (False)", value: 2, color: "#dc2626" },
                { label: "Unshaded", value: 5, color: "#cbd5e1" }
              ]
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 6: Two Methods for Unlike Fractions
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 4,
      title: "Two Pathways: Adding Unlike Fractions",
      subtitle: "Both methods produce identical, mathematically valid answers — choose the strategy that works best for you!",
      columns: [
        {
          width: "half",
          title: "Method 1: Lowest Common Denominator (LCD)",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "default",
              title: "Strategy 1: Find the Lowest Common Multiple",
              text: "Find the **LCM** of the denominators, then convert both fractions to this common denominator:\n\n**Example: Calculate $\\frac{1}{3} + \\frac{1}{4}$**\n• Multiples of 3: 3, 6, 9, **12**, 15...\n• Multiples of 4: 4, 8, **12**, 16...\n• $\\mathbf{\\text{LCD}(3, 4) = 12}$\n$$\\frac{1 \\times 4}{3 \\times 4} + \\frac{1 \\times 3}{4 \\times 3} = \\frac{4}{12} + \\frac{3}{12} = \\mathbf{\\frac{7}{12}}$$"
            },
            {
              type: "note-box",
              variant: "green",
              title: "✨ Advantages of LCD",
              text: "• **Keeps numbers as small as possible**.\n• Ideal when denominators share common factors (e.g. 4 and 6 $\\to 12$, not 24).\n• Eliminates or minimizes simplifying at the end."
            }
          ]
        },
        {
          width: "half",
          title: "Method 2: Cross-Multiplication (Formula)",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "default",
              title: "Strategy 2: The Cross-Product Method",
              text: "Multiply diagonally across the top, and multiply the denominators together underneath:\n$$\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$$\n\n**Example: Calculate $\\frac{1}{3} + \\frac{1}{4}$**\n$$\\frac{1}{3} + \\frac{1}{4} = \\frac{(1 \\times 4) + (3 \\times 1)}{3 \\times 4} = \\frac{4 + 3}{12} = \\mathbf{\\frac{7}{12}}$$"
            },
            {
              type: "note-box",
              variant: "gold",
              title: "✨ Advantages & Caution",
              text: "• **Fast & formulaic:** No need to write out lists of multiples!\n• **Remember to simplify:** If the denominators share factors, simplify at the end:\n$$\\frac{3}{4} + \\frac{5}{6} = \\frac{18 + 20}{24} = \\frac{38}{24} = \\mathbf{1\\frac{7}{12}}$$"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 7: Converting to Equivalent Fractions
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 4,
      title: "Converting to Equivalent Fractions",
      subtitle: "Showing 1/3 = 4/12 and 1/4 = 3/12 using equivalent quantities",
      columns: [
        {
          width: "half",
          title: "1. Conversion Steps",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "default",
              title: "Problem: Calculate 1/3 + 1/4",
              text: "We want to calculate:\n$$\\frac{1}{3} + \\frac{1}{4}$$\nFrom Slide 6, we found $\\mathbf{\\text{LCD}(3, 4) = 12}$.\nBecause thirds and fourths are different slice sizes, we must convert both into **twelfths** before adding."
            },
            {
              type: "note-box",
              variant: "gold",
              title: "Step 1: Convert Both Fractions to 12ths",
              revealStep: 1,
              text: "• **Convert $\\frac{1}{3}$:** $12 \\div 3 = 4 \\implies \\frac{1 \\times 4}{3 \\times 4} = \\mathbf{\\frac{4}{12}}$\n• **Convert $\\frac{1}{4}$:** $12 \\div 4 = 3 \\implies \\frac{1 \\times 3}{4 \\times 3} = \\mathbf{\\frac{3}{12}}$"
            },
            {
              type: "formula",
              revealStep: 2,
              latex: "\\frac{1}{3} + \\frac{1}{4} = \\frac{4}{12} + \\frac{3}{12} = \\frac{4 + 3}{12} = \\mathbf{\\frac{7}{12}}"
            },
            {
              type: "note-box",
              variant: "green",
              title: "Summary Insight",
              revealStep: 3,
              text: "Both fractions now count parts of identical size (twelfths):\n**4 twelfths + 3 twelfths = 7 twelfths**."
            }
          ]
        },
        {
          width: "half",
          title: "2. Visual Fraction Bars",
          blocks: [
            {
              type: "measured-bar",
              title: "Top: 1/3 (Blue) · Bottom: 1/4 (Green)",
              totalLength: 12,
              unit: "twelfths",
              total: 12,
              showTicks: true,
              showMinorTicks: false,
              categories: [
                { label: "1/3 (= 4/12)", value: 4, color: "#2563eb" },
                { label: "Unshaded", value: 8, color: "#f1f5f9" }
              ]
            },
            {
              type: "measured-bar",
              totalLength: 12,
              unit: "twelfths",
              total: 12,
              showTicks: true,
              showMinorTicks: false,
              categories: [
                { label: "1/4 (= 3/12)", value: 3, color: "#16a34a" },
                { label: "Unshaded", value: 9, color: "#f1f5f9" }
              ]
            },
            {
              type: "measured-bar",
              title: "Combined Sum: 4/12 + 3/12 = 7/12",
              totalLength: 12,
              unit: "twelfths",
              total: 12,
              showTicks: true,
              showMinorTicks: false,
              checkMath: "\\frac{4}{12} + \\frac{3}{12} = \\frac{7}{12}",
              checkLabel: "Combined Sum",
              categories: [
                { label: "1/3 (= 4/12)", value: 4, color: "#2563eb" },
                { label: "1/4 (= 3/12)", value: 3, color: "#16a34a" },
                { label: "Unshaded", value: 5, color: "#cbd5e1" }
              ]
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 8: Worked Example 13: Unlike Fractions
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 5,
      title: "Worked Example 13: Unlike Fractions",
      subtitle: "Textbook Example 13 (Page 171) · Converting to the LCD and adding",
      prompt: "Find each sum by writing each fraction with the lowest common denominator (LCD):",
      leftBlocks: [
        {
          type: "note-box",
          variant: "default",
          title: "Questions to Solve",
          text: "**Part (a):**\n$$\\frac{1}{5} + \\frac{1}{2}$$\n\n**Part (b):**\n$$\\frac{3}{4} + \\frac{5}{6}$$"
        },
        {
          type: "note-box",
          variant: "gold",
          title: "Three-Step Method",
          text: "1. Find the **Lowest Common Denominator** (LCD).\n2. Convert fractions to equivalent fractions.\n3. Add numerators and rename improper fractions as mixed numerals."
        }
      ],
      steps: [
        {
          part: "Part (a): $\\frac{1}{5} + \\frac{1}{2}$",
          label: "Find the LCD of 5 and 2",
          text: "Multiples of 5: 5, **10**, 15... Multiples of 2: 2, 4, 6, 8, **10**... The lowest common denominator is $10$:",
          latex: "\\text{LCD}(5, 2) = 10"
        },
        {
          part: "Part (a): $\\frac{1}{5} + \\frac{1}{2}$",
          label: "Convert to 10ths and add",
          text: "Multiply $\\frac{1}{5}$ by $\\frac{2}{2}$ and $\\frac{1}{2}$ by $\\frac{5}{5}$:",
          latex: "\\frac{1}{5} + \\frac{1}{2} = \\frac{1 \\times 2}{5 \\times 2} + \\frac{1 \\times 5}{2 \\times 5} = \\frac{2}{10} + \\frac{5}{10} = \\mathbf{\\frac{7}{10}}"
        },
        {
          part: "Part (b): $\\frac{3}{4} + \\frac{5}{6}$",
          label: "Find the LCD of 4 and 6",
          text: "Multiples of 4: 4, 8, **12**, 16... Multiples of 6: 6, **12**, 18... The LCD is $12$ (not 24):",
          latex: "\\text{LCD}(4, 6) = 12"
        },
        {
          part: "Part (b): $\\frac{3}{4} + \\frac{5}{6}$",
          label: "Convert to 12ths, add, and rename as mixed numeral",
          text: "Convert each fraction to twelfths ($12 \\div 4 = 3$; $12 \\div 6 = 2$):",
          latex: "\\frac{3 \\times 3}{4 \\times 3} + \\frac{5 \\times 2}{6 \\times 2} = \\frac{9}{12} + \\frac{10}{12} = \\frac{19}{12} = \\mathbf{1\\frac{7}{12}}",
          blocks: [
            {
              type: "note-box",
              variant: "gold",
              text: "$19 \\div 12 = 1$ with remainder $7$, which gives the mixed numeral $1\\frac{7}{12}$."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 9: Your Turn: Adding Fractions
    // ------------------------------------------------------------------------
    {
      type: "we-do",
      phase: "guided",
      estimatedMinutes: 5,
      title: "Your Turn: Adding Fractions",
      subtitle: "Textbook Page 171 · Guided practice in your exercise book",
      studentAction: "On mini-whiteboards or workbook: find the LCD, convert, and solve.",
      prompt: "Calculate each sum. Show your LCD, equivalent fractions, and simplified answer:",
      separateSolutions: true,
      workspaceContent: [
        {
          type: "table",
          headers: ["Question", "Denominators", "Lowest Common Denom", "Strategy"],
          rows: [
            ["**1.** $\\frac{1}{3} + \\frac{1}{5}$", "3 and 5", "$\\text{LCD} = 15$", "Convert both fractions to 15ths, then add."],
            ["**2.** $\\frac{3}{4} + \\frac{7}{10}$", "4 and 10", "$\\text{LCD} = 20$", "Convert both fractions to 20ths, add, and rename as a mixed numeral."]
          ]
        },
        {
          type: "note-box",
          variant: "default",
          title: "Teacher Prompt",
          text: "Give students 2 minutes to calculate both answers before revealing step solutions."
        }
      ],
      solution: [
        {
          type: "solution",
          badgeTitle: "Question 1",
          title: "1. 1/3 + 1/5",
          revealStep: 1,
          latex: "\\frac{1 \\times 5}{3 \\times 5} + \\frac{1 \\times 3}{5 \\times 3} = \\frac{5}{15} + \\frac{3}{15} = \\mathbf{\\frac{8}{15}}"
        },
        {
          type: "solution",
          badgeTitle: "Question 2",
          title: "2. 3/4 + 7/10",
          revealStep: 2,
          latex: "\\frac{3 \\times 5}{4 \\times 5} + \\frac{7 \\times 2}{10 \\times 2} = \\frac{15}{20} + \\frac{14}{20} = \\frac{29}{20} = \\mathbf{1\\frac{9}{20}}"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 10: Adding Mixed Numerals
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 4,
      title: "Adding Mixed Numerals",
      subtitle: "Adding whole-number and fractional parts separately",
      columns: [
        {
          width: "half",
          title: "1. The Split Strategy",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "default",
              title: "Grouping Wholes and Fractions",
              text: "A mixed numeral is the sum of a whole number and a fraction: $3\\frac{2}{3} = 3 + \\frac{2}{3}$.\nWhen adding mixed numerals, add the **whole numbers** and the **fraction parts** separately:\n$$(3 + 4) + \\left(\\frac{2}{3} + \\frac{2}{3}\\right)$$"
            },
            {
              type: "ordered-list",
              items: [
                "**Step 1:** Add the whole-number parts.",
                "**Step 2:** Add the fractional parts (find LCD if unlike).",
                "**Step 3:** If the fraction sum is improper ($> 1$), rename it as a mixed numeral and add the whole to your total."
              ]
            }
          ]
        },
        {
          width: "half",
          title: "2. Introducing: $3\\frac{2}{3} + 4\\frac{2}{3}$",
          blocks: [
            {
              type: "note-box",
              variant: "gold",
              title: "Worked Steps for $3\\frac{2}{3} + 4\\frac{2}{3}$",
              text: "• **Add wholes:** $3 + 4 = 7$\n• **Add fractions:** $\\frac{2}{3} + \\frac{2}{3} = \\frac{4}{3}$\n• **Rename improper fraction:** $\\frac{4}{3} = 1\\frac{1}{3}$\n• **Combine:** $7 + 1\\frac{1}{3} = \\mathbf{8\\frac{1}{3}}$"
            },
            {
              type: "formula",
              latex: "3\\frac{2}{3} + 4\\frac{2}{3} = (3 + 4) + \\left(\\frac{2 + 2}{3}\\right) = 7 + \\frac{4}{3} = 7 + 1\\frac{1}{3} = \\mathbf{8\\frac{1}{3}}"
            },
            {
              type: "note-box",
              variant: "alert",
              title: "Never Leave an Improper Part!",
              text: "$7\\frac{4}{3}$ is not a valid final mixed numeral because $\\frac{4}{3} > 1$. You must carry the $1$ into the whole number."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 11: Worked Example 14: Mixed Numerals
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 5,
      title: "Worked Example 14: Mixed Numerals",
      subtitle: "Textbook Example 14 (Page 172) · Comparing two mathematical methods",
      prompt: "Calculate each sum, comparing both standard methods:",
      leftBlocks: [
        {
          type: "note-box",
          variant: "default",
          title: "Question to Solve",
          text: "$$\\mathbf{2\\frac{5}{6} + 3\\frac{3}{4}}$$"
        },
        {
          type: "note-box",
          variant: "gold",
          title: "Two Methods to Compare",
          text: "• **Method 1 (Recommended):** Add wholes and fractions separately.\n• **Method 2:** Convert both mixed numerals to improper fractions first."
        }
      ],
      steps: [
        {
          label: "Find the LCD of the fractions",
          text: "The denominators are $6$ and $4$. Multiples of 6: 6, **12**... Multiples of 4: 4, 8, **12**... So $\\text{LCD} = 12$:",
          latex: "\\frac{5}{6} = \\frac{10}{12} \\quad \\text{and} \\quad \\frac{3}{4} = \\frac{9}{12}"
        },
        {
          label: "Method 1: Wholes and fractions separately (Recommended)",
          text: "Add whole numbers ($2 + 3$), then add converted fraction parts ($\\frac{10}{12} + \\frac{9}{12}$):",
          latex: "2\\frac{10}{12} + 3\\frac{9}{12} = (2 + 3) + \\left(\\frac{10 + 9}{12}\\right) = 5 + \\frac{19}{12} = 5 + 1\\frac{7}{12} = \\mathbf{6\\frac{7}{12}}"
        },
        {
          label: "Method 2: Convert to improper fractions first",
          text: "Convert both to improper fractions: $2\\frac{5}{6} = \\frac{17}{6} = \\frac{34}{12}$ and $3\\frac{3}{4} = \\frac{15}{4} = \\frac{45}{12}$:",
          latex: "\\frac{34}{12} + \\frac{45}{12} = \\frac{79}{12} = \\mathbf{6\\frac{7}{12}}",
          blocks: [
            {
              type: "note-box",
              variant: "green",
              title: "Method Comparison",
              text: "Both methods give the exact same answer $\\mathbf{6\\frac{7}{12}}$. However, Method 1 keeps numbers smaller and avoids calculating $34 + 45 = 79$!"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 12: Your Turn: Mixed Numerals
    // ------------------------------------------------------------------------
    {
      type: "we-do",
      phase: "guided",
      estimatedMinutes: 5,
      title: "Your Turn: Mixed Numerals",
      subtitle: "Textbook Page 172 · Guided whiteboard practice",
      studentAction: "On mini-whiteboards or workbook: add wholes, add fractions, simplify.",
      prompt: "Calculate each sum. Show your full method and state your answer as a simplified mixed numeral:",
      separateSolutions: true,
      workspaceContent: [
        {
          type: "table",
          headers: ["Question", "Denominator Type", "Target LCD", "Workbook Working Plan"],
          rows: [
            ["**1.** $1\\frac{3}{5} + 2\\frac{3}{5}$", "Like Denominators ($5$)", "Already 5", "Add wholes: $1+2=3$. Add fractions: $\\frac{3+3}{5}=\\frac{6}{5}$. Rename $\\frac{6}{5}$."],
            ["**2.** $2\\frac{1}{10} + 1\\frac{3}{4}$", "Unlike Denominators ($10, 4$)", "$\\text{LCD} = 20$", "Convert to 20ths: $\\frac{1}{10}=\\frac{2}{20}$, $\\frac{3}{4}=\\frac{15}{20}$. Add wholes and fractions."]
          ]
        },
        {
          type: "note-box",
          variant: "default",
          title: "Teacher Prompt",
          text: "Encourage students to use Method 1 (add wholes and fractions separately) for speed and accuracy."
        }
      ],
      solution: [
        {
          type: "solution",
          badgeTitle: "Question 1",
          title: "1. 1 3/5 + 2 3/5",
          revealStep: 1,
          latex: "(1 + 2) + \\left(\\frac{3+3}{5}\\right) = 3 + \\frac{6}{5} = 3 + 1\\frac{1}{5} = \\mathbf{4\\frac{1}{5}}"
        },
        {
          type: "solution",
          badgeTitle: "Question 2",
          title: "2. 2 1/10 + 1 3/4",
          revealStep: 2,
          latex: "\\text{LCD} = 20: \\quad (2 + 1) + \\left(\\frac{2 + 15}{20}\\right) = 3 + \\frac{17}{20} = \\mathbf{3\\frac{17}{20}}"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 13: Exercise 3E — Independent Practice
    // ------------------------------------------------------------------------
    {
      type: "practice",
      phase: "independent",
      estimatedMinutes: 20,
      timerMinutes: 15,
      title: "Exercise 3E: Independent Practice",
      subtitle: "Textbook Pages 173–174 · Complete in your exercise book",
      content: [
        {
          type: "note-box",
          variant: "default",
          title: "Exercise Book Instructions",
          text: "Answer questions in your **exercise book** showing all steps.\n• Write down the original question.\n• For unlike fractions, clearly write the equivalent fractions with the common denominator.\n• Always simplify fractions to lowest terms and convert improper fractions to mixed numerals."
        }
      ],
      tasks: [
        {
          title: "Tier 1: Fluency (Q1–4)",
          prompt: "Foundational Practice (Page 173):\n• **Q1:** Like fractions: $\\frac{2}{7}+\\frac{3}{7}$, $\\frac{5}{9}+\\frac{7}{9}$\n• **Q2:** Find LCD for $(3, 5)$, $(4, 6)$, $(6, 8)$\n• **Q3:** Basic unlike fractions: $\\frac{1}{2}+\\frac{1}{4}$, $\\frac{1}{3}+\\frac{1}{6}$",
          solution: [
            {
              type: "paragraph",
              text: "**Sample Checks (Q1–3):**\n• **Q1:** $\\frac{2+3}{7} = \\mathbf{\\frac{5}{7}}$; $\\frac{5+7}{9} = \\frac{12}{9} = \\mathbf{1\\frac{1}{3}}$\n• **Q2:** $\\text{LCD}(3,5)=15$; $\\text{LCD}(4,6)=12$; $\\text{LCD}(6,8)=24$\n• **Q3:** $\\frac{2}{4}+\\frac{1}{4} = \\mathbf{\\frac{3}{4}}$; $\\frac{2}{6}+\\frac{1}{6} = \\frac{3}{6} = \\mathbf{\\frac{1}{2}}$"
            }
          ]
        },
        {
          title: "Tier 2: Fluency & Mixed (Q5–8)",
          prompt: "Unlike Addition & Mixed (Pages 173–174):\n• **Q5:** Unlike addition: $\\frac{2}{3}+\\frac{1}{4}$, $\\frac{3}{5}+\\frac{5}{6}$\n• **Q6:** Adding three fractions: $\\frac{1}{2}+\\frac{1}{3}+\\frac{1}{4}$\n• **Q7–8:** Mixed numerals: $2\\frac{1}{5}+3\\frac{2}{5}$, $1\\frac{1}{2}+2\\frac{2}{3}$",
          solution: [
            {
              type: "paragraph",
              text: "**Sample Checks (Q5–8):**\n• **Q5:** $\\frac{8+3}{12} = \\mathbf{\\frac{11}{12}}$; $\\frac{18+25}{30} = \\frac{43}{30} = \\mathbf{1\\frac{13}{30}}$\n• **Q6:** $\\text{LCD}=12 \\implies \\frac{6+4+3}{12} = \\frac{13}{12} = \\mathbf{1\\frac{1}{12}}$\n• **Q7:** $2\\frac{1}{5}+3\\frac{2}{5} = \\mathbf{5\\frac{3}{5}}$\n• **Q8:** $1\\frac{3}{6}+2\\frac{4}{6} = 3\\frac{7}{6} = \\mathbf{4\\frac{1}{6}}$"
            }
          ]
        },
        {
          title: "Tier 3: Problem Solving (Q9–12)",
          prompt: "Word Problems & Reasoning (Page 174):\n• **Q9:** Recipe: $1\\frac{3}{4}\\text{ cups}$ flour and $2\\frac{1}{3}\\text{ cups}$ sugar. Total dry ingredients?\n• **Q10:** Find missing digit: $\\frac{1}{\\Box} + \\frac{1}{4} = \\frac{7}{12}$\n• **Q11:** General algebraic rule for $\\frac{a}{b} + \\frac{c}{d}$",
          solution: [
            {
              type: "paragraph",
              text: "**Sample Checks (Q9–11):**\n• **Q9:** $1\\frac{9}{12} + 2\\frac{4}{12} = 3\\frac{13}{12} = \\mathbf{4\\frac{1}{12}\\text{ cups}}$\n• **Q10:** $\\frac{7}{12} - \\frac{3}{12} = \\frac{4}{12} = \\frac{1}{3} \\implies \\mathbf{\\Box = 3}$\n• **Q11:** $\\frac{a \\times d}{b \\times d} + \\frac{c \\times b}{d \\times b} = \\mathbf{\\frac{ad + bc}{bd}}$"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 14: Exit Ticket: Formative Assessment
    // ------------------------------------------------------------------------
    {
      type: "exit-ticket",
      phase: "assessment",
      estimatedMinutes: 5,
      title: "Exit Ticket: Checking Understanding",
      subtitle: "Complete these three quick checks in your exercise book before the bell",
      questions: [
        {
          prompt: "**1. Like Fractions:**\nCalculate and simplify to lowest terms:\n$$\\frac{5}{12} + \\frac{1}{12}$$",
          solution: [
            {
              type: "paragraph",
              text: "Add numerators over common denominator $12$:\n$$\\frac{5 + 1}{12} = \\frac{6}{12}$$\nDivide top and bottom by $6$:\n$$\\mathbf{\\frac{1}{2}}$$"
            }
          ]
        },
        {
          prompt: "**2. Unlike Fractions:**\nFind the LCD and calculate:\n$$\\frac{2}{3} + \\frac{1}{5}$$",
          solution: [
            {
              type: "paragraph",
              text: "Find $\\text{LCD}(3, 5) = 15$:\n$$\\frac{2 \\times 5}{3 \\times 5} + \\frac{1 \\times 3}{5 \\times 3} = \\frac{10}{15} + \\frac{3}{15} = \\mathbf{\\frac{13}{15}}$$"
            }
          ]
        },
        {
          prompt: "**3. Mixed Numerals:**\nCalculate and write as a simplified mixed numeral:\n$$2\\frac{3}{4} + 1\\frac{1}{2}$$",
          solution: [
            {
              type: "paragraph",
              text: "Find $\\text{LCD}(4, 2) = 4 \\implies 1\\frac{1}{2} = 1\\frac{2}{4}$:\n• Wholes: $2 + 1 = 3$\n• Fractions: $\\frac{3}{4} + \\frac{2}{4} = \\frac{5}{4} = 1\\frac{1}{4}$\n• Total: $3 + 1\\frac{1}{4} = \\mathbf{4\\frac{1}{4}}$"
            }
          ]
        }
      ]
    }
  ]
};
