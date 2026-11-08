/**
 * @file 3G.js
 * Year 7 Mathematics: Lesson 3G — Multiplying Fractions
 * Textbook: Essential Mathematics for the Victorian Curriculum, Year 7, 3rd edition, Section 3G (pp. 184–185).
 * Pacing: 60-minute lesson designed around a gradual release model (Do Now -> I Do -> We Do -> You Do -> Exit Ticket).
 * Consolidated 16-slide sequence with 23 minutes allocated to independent textbook practice.
 */

export default {
  id: "3G",
  title: "Multiplying Fractions",
  subject: "Mathematics",
  yearLevel: 7,
  unit: "Chapter 3",
  folder: "Fractions",
  chapter: "Fractions",
  topics: [
    "Multiplying Proper Fractions",
    "Area Model Visualisation",
    "Cancelling Common Factors",
    "Fractions of Quantities",
    "Multiplying Improper Fractions",
    "Multiplying Mixed Numerals"
  ],
  slides: [
    // ------------------------------------------------------------------------
    // SLIDE 1: Title (1 min)
    // ------------------------------------------------------------------------
    {
      type: "title",
      phase: "opening",
      estimatedMinutes: 1,
      title: "3G: Multiplying Fractions",
      subtitle: "How do we multiply fractions and simplify the answer?",
      overview: "Understand why multiplying fractions does not require a common denominator, visualise fraction multiplication with a 3×3 area model, master diagonal cancelling of common factors, and multiply whole numbers and mixed numerals.",
      topics: [
        "Prediction & Visual Area Model ($3 \\times 3$ grid)",
        "The Multiplication Rule: Numerators & Denominators",
        "Cancelling Common Factors (Efficiency Strategy)",
        "Fractions of Whole Numbers & Quantities",
        "Improper Fractions & Mixed Numerals"
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 2: Do Now (3 min)
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "opening",
      estimatedMinutes: 3,
      timerMinutes: 3,
      title: "Do Now: Warm Up",
      subtitle: "Answer these three questions in your exercise book (3 minutes)",
      columns: [
        {
          width: "60",
          title: "Questions to Solve",
          blocks: [
            {
              type: "ordered-list",
              items: [
                "**Simplify:** $\\frac{6}{8}$",
                "**Convert to an improper fraction:** $2\\frac{1}{3}$",
                "**Calculate:** $\\frac{1}{3} \\text{ of } 12$"
              ]
            },
            {
              type: "note-box",
              variant: "gold",
              title: "✍️ Exercise Book Task",
              text: "Write down each question and complete your working in your exercise book.\nWe will reveal worked solutions on the next slide."
            }
          ]
        },
        {
          width: "40",
          title: "Prior Knowledge Recall",
          blocks: [
            {
              type: "note-box",
              variant: "default",
              title: "💡 Why These Skills Matter",
              text: "• **Simplifying:** Every fraction multiplication answer must be in simplest form.\n• **Improper fractions:** Required before multiplying mixed numerals.\n• **'Of':** In mathematics, 'of' means multiplication ($\\times$)."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 3: Do Now Answers (2 min)
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "opening",
      estimatedMinutes: 2,
      title: "Do Now: Worked Solutions",
      subtitle: "Check and correct your answers · Spacebar reveals each step",
      prompt: "Worked solutions for the warm-up questions:",
      steps: [
        {
          label: "1. Simplify 6/8",
          latex: "\\frac{6}{8} = \\frac{6 \\div 2}{8 \\div 2} = \\mathbf{\\frac{3}{4}} \\quad (\\text{divide by HCF } 2)"
        },
        {
          label: "2. Convert 2 1/3 to improper fraction",
          latex: "2\\frac{1}{3} = \\frac{(2 \\times 3) + 1}{3} = \\mathbf{\\frac{7}{3}}"
        },
        {
          label: "3. Find 1/3 of 12",
          latex: "\\frac{1}{3} \\text{ of } 12 = 12 \\div 3 = \\mathbf{4}"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 4: Learning Intentions and Success Criteria (1 min)
    // ------------------------------------------------------------------------
    {
      type: "learning",
      phase: "opening",
      estimatedMinutes: 1,
      title: "Learning Intentions & Success Criteria",
      subtitle: "Section 3G: Multiplying Fractions (Textbook pp. 184–185)",
      learningIntention: "To multiply fractions, cancel common factors before multiplying, and multiply fractions involving whole numbers and mixed numerals.",
      successCriteria: [
        "I can multiply fractions by multiplying numerators and multiplying denominators, then simplifying.",
        "I can cancel common factors between numerators and denominators before multiplying.",
        "I can multiply fractions involving whole numbers and mixed numerals."
      ],
      keyPrinciple: "Unlike addition and subtraction, multiplying fractions does NOT require a common denominator: multiply numerators, multiply denominators, and simplify!"
    },

    // ------------------------------------------------------------------------
    // SLIDE 5: Visual Area Model (3 min)
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 3,
      title: "What Is One-Third of Two-Thirds?",
      subtitle: "Calculate $\\frac{1}{3} \\times \\frac{2}{3}$ · Predict: will the answer be larger or smaller than $\\frac{2}{3}$?",
      content: [
        {
          type: "note-box",
          variant: "gold",
          text: "**Think & Predict:** What is $\\frac{1}{3}$ of $\\frac{2}{3}$? Predict: will the result be **larger** or **smaller** than $\\frac{2}{3}$?"
        },
        {
          type: "fraction-area-model",
          fraction1: "1/3",
          fraction2: "2/3"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 6: Multiplication Rule and I Do (2 min)
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 2,
      title: "Multiplication Rule & I Do",
      subtitle: "Textbook Example 17a (Page 181) · The standard algorithm",
      prompt: "Calculate $\\frac{2}{3} \\times \\frac{1}{5}$, showing full working:",
      leftBlocks: [
        {
          type: "note-box",
          copyToWorkbook: true,
          variant: "default",
          title: "The Multiplication Rule",
          text: "Multiply numerators together and denominators together:\n$$\\frac{a}{b} \\times \\frac{c}{d} = \\frac{ac}{bd}$$\n\n• **No common denominator needed!**\n• Simplify the final answer if possible."
        }
      ],
      steps: [
        {
          label: "Step 1: Multiply numerators and denominators",
          text: "Combine numerators and denominators into a single fraction:",
          latex: "\\frac{2}{3} \\times \\frac{1}{5} = \\frac{2 \\times 1}{3 \\times 5}"
        },
        {
          label: "Step 2: Calculate product and simplify",
          text: "Multiply across top and bottom ($2$ and $15$ share no common factors):",
          latex: "\\frac{2 \\times 1}{3 \\times 5} = \\mathbf{\\frac{2}{15}}"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 7: We Do — Basic Multiplication (2 min)
    // ------------------------------------------------------------------------
    {
      type: "we-do",
      phase: "guided",
      estimatedMinutes: 2,
      title: "We Do: Basic Multiplication",
      subtitle: "Guided whiteboard practice · Textbook Page 181",
      studentAction: "On mini-whiteboards: calculate 3/4 × 2/5 showing all working.",
      prompt: "Calculate $\\frac{3}{4} \\times \\frac{2}{5}$ in simplest form:",
      workspaceContent: [
        {
          type: "note-box",
          variant: "default",
          title: "Calculation to Complete",
          text: "$$\\frac{3}{4} \\times \\frac{2}{5}$$\n\n• Write out your working on your mini-whiteboard.\n• Multiply numerators, multiply denominators, and simplify your answer to lowest terms."
        }
      ],
      solution: [
        {
          type: "paragraph",
          text: "**Step 1: Multiply straight across:**\n$$\\frac{3}{4} \\times \\frac{2}{5} = \\frac{3 \\times 2}{4 \\times 5} = \\frac{6}{20}$$\n\n**Step 2: Simplify to lowest terms (divide top and bottom by $2$):**\n$$\\frac{6 \\div 2}{20 \\div 2} = \\mathbf{\\frac{3}{10}}$$"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 8: I Do — Cancelling Common Factors (3 min)
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 3,
      title: "I Do: Cancelling Common Factors",
      subtitle: "Textbook Example 17b (Page 181) · Comparing two valid pathways",
      prompt: "Calculate $\\frac{3}{4} \\times \\frac{8}{9}$ comparing both valid methods:",
      leftBlocks: [
        {
          type: "note-box",
          variant: "gold",
          title: "Efficiency Strategy",
          text: "Cancelling first is an **efficiency strategy** that keeps numbers small and avoids simplifying large products.\nBoth methods produce the exact same correct answer!"
        }
      ],
      steps: [
        {
          label: "Method 1: Multiply first, then simplify",
          text: "Multiply across, then simplify by dividing top and bottom by $\\text{HCF} = 12$:",
          latex: "\\frac{3}{4} \\times \\frac{8}{9} = \\frac{24}{36} = \\frac{24 \\div 12}{36 \\div 12} = \\mathbf{\\frac{2}{3}}"
        },
        {
          label: "Method 2: Cancel common factors first (Recommended)",
          text: "Divide numerator $3$ and denominator $9$ by $3$; divide numerator $8$ and denominator $4$ by $4$:",
          latex: "\\frac{^{\\color{#2563eb}{1}}\\cancel{\\color{#2563eb}{3}}}{_{\\color{#16a34a}{1}}\\cancel{\\color{#16a34a}{4}}} \\times \\frac{^{\\color{#16a34a}{2}}\\cancel{\\color{#16a34a}{8}}}{_{\\color{#2563eb}{3}}\\cancel{\\color{#2563eb}{9}}} = \\frac{{\\color{#2563eb}{1}} \\times {\\color{#16a34a}{2}}}{{\\color{#16a34a}{1}} \\times {\\color{#2563eb}{3}}} = \\mathbf{\\frac{2}{3}}"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 9: Diagnostic MCQ — Valid Cancellation (2 min)
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "guided",
      estimatedMinutes: 2,
      title: "Diagnostic Check: Valid Cancellation",
      subtitle: "Which calculation shows a mathematically valid cancellation step?",
      columns: [
        {
          width: "60",
          title: "Which statement is valid?",
          blocks: [
            {
              type: "note-box",
              variant: "default",
              title: "Look at these four options:",
              text: "• **A.** In $\\frac{4}{7} \\times \\frac{5}{8}$, divide numerator $4$ and denominator $8$ by $4$ $\\implies \\frac{1}{7} \\times \\frac{5}{2}$\n• **B.** In $\\frac{3}{5} \\times \\frac{9}{10}$, divide numerators $3$ and $9$ by $3$ $\\implies \\frac{1}{5} \\times \\frac{3}{10}$\n• **C.** In $\\frac{1}{6} \\times \\frac{5}{18}$, divide denominators $6$ and $18$ by $6$ $\\implies \\frac{1}{1} \\times \\frac{5}{3}$\n• **D.** Cancelling before multiplying is never allowed in mathematics."
            }
          ]
        },
        {
          width: "40",
          title: "Solution & Analysis",
          blocks: [
            {
              type: "note-box",
              variant: "green",
              revealStep: 1,
              title: "✔ Correct Answer: Option A",
              text: "**A is VALID:** You can cancel common factors between **any numerator and any denominator** (including diagonally).\n\n• **B is invalid:** Cancels two numerators.\n• **C is invalid:** Cancels two denominators.\n• **D is false:** Cancelling first is completely valid!"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 10: We Do — Cancelling (2 min)
    // ------------------------------------------------------------------------
    {
      type: "we-do",
      phase: "guided",
      estimatedMinutes: 2,
      title: "We Do: Cancelling Common Factors",
      subtitle: "Textbook Page 182 · Guided practice on mini-whiteboards",
      studentAction: "On mini-whiteboards: cancel common factors diagonally, then multiply.",
      prompt: "Calculate $\\frac{4}{7} \\times \\frac{7}{10}$ by cancelling common factors first. Show all working:",
      workspaceContent: [
        {
          type: "note-box",
          variant: "default",
          title: "Calculation to Complete",
          text: "$$\\frac{4}{7} \\times \\frac{7}{10}$$\n\n• Look for common factors between numerators and denominators.\n• Cancel on your whiteboard and multiply the simplified numbers."
        }
      ],
      solution: [
        {
          type: "paragraph",
          text: "**Step 1: Cancel common factors diagonally:**\n• Cancel $7$ and $7$ by dividing both by $7$ ($7 \\div 7 = 1$).\n• Cancel $4$ and $10$ by dividing both by $2$ ($4 \\div 2 = 2$ and $10 \\div 2 = 5$):\n$$\\frac{^2\\cancel{4}}{_1\\cancel{7}} \\times \\frac{^1\\cancel{7}}{_5\\cancel{10}} = \\frac{2}{1} \\times \\frac{1}{5}$$\n\n**Step 2: Multiply remaining factors:**\n$$\\frac{2 \\times 1}{1 \\times 5} = \\mathbf{\\frac{2}{5}}$$"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 11: I Do — Fractions of Whole Numbers (3 min)
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 3,
      title: "I Do: Fractions of Whole Numbers",
      subtitle: "Textbook Example 18 (Page 182) · Fractions of quantities",
      prompt: "Calculate $\\frac{2}{5} \\text{ of } 30$, showing grouping and full working:",
      leftBlocks: [
        {
          type: "fraction-of-set",
          total: 30,
          numerator: 2,
          denominator: 5,
          title: "Visual Grouping (2/5 of 30)",
          unit: "counters"
        }
      ],
      steps: [
        {
          label: "Step 1: Rewrite with '×' and write 30 over 1",
          text: "Rewrite as fraction multiplication:",
          latex: "\\frac{2}{5} \\text{ of } 30 = \\frac{2}{5} \\times \\frac{30}{1}"
        },
        {
          label: "Step 2: Cancel common factor 5 diagonally",
          text: "Divide $5$ and $30$ by $5$ ($5 \\div 5 = 1$ and $30 \\div 5 = 6$):",
          latex: "\\frac{2}{_1\\cancel{5}} \\times \\frac{^6\\cancel{30}}{1} = \\frac{2}{1} \\times \\frac{6}{1}"
        },
        {
          label: "Step 3: Multiply across",
          text: "Multiply numerators and denominators to get the whole number:",
          latex: "\\frac{2 \\times 6}{1 \\times 1} = \\frac{12}{1} = \\mathbf{12}"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 12: We Do — Fraction of a Quantity (2 min)
    // ------------------------------------------------------------------------
    {
      type: "we-do",
      phase: "guided",
      estimatedMinutes: 2,
      title: "We Do: Fraction of a Quantity",
      subtitle: "Textbook Page 182 · Guided whiteboard practice",
      studentAction: "On mini-whiteboards: rewrite 24 as 24/1, cancel, and calculate independently.",
      prompt: "Find $\\frac{5}{6} \\text{ of } 24$. Show all working:",
      workspaceContent: [
        {
          type: "fraction-of-set",
          total: 24,
          numerator: 5,
          denominator: 6,
          title: "Visual Check: 5/6 of 24",
          unit: "counters"
        },
        {
          type: "note-box",
          variant: "default",
          title: "Calculation to Complete",
          text: "$$\\frac{5}{6} \\text{ of } 24$$\n\n• Rewrite as fraction $\\times$ fraction.\n• Cancel common factors before multiplying."
        }
      ],
      solution: [
        {
          type: "paragraph",
          text: "**Step 1: Rewrite with '$\\times$' and write $24$ over $1$:**\n$$\\frac{5}{6} \\times \\frac{24}{1}$$\n\n**Step 2: Cancel common factor $6$ diagonally ($6 \\div 6 = 1$ and $24 \\div 6 = 4$):**\n$$\\frac{5}{_1\\cancel{6}} \\times \\frac{^4\\cancel{24}}{1} = \\frac{5}{1} \\times \\frac{4}{1}$$\n\n**Step 3: Multiply across:**\n$$\\frac{5 \\times 4}{1 \\times 1} = \\mathbf{20}$$\n\n*(Mental check: $\\frac{1}{6} \\text{ of } 24 = 4 \\implies 5 \\times 4 = \\mathbf{20}$ ✔)*"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 13: I Do — Improper Fractions and Mixed Numerals (4 min)
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 4,
      title: "I Do: Improper Fractions & Mixed Numerals",
      subtitle: "Textbook Examples 19a & 20a (pp. 183–184) · Area model and conversion",
      prompt: "Demonstrating area model reasoning for mixed numerals and improper fraction conversion:",
      leftBlocks: [
        {
          type: "mixed-numeral-area-model",
          title: "Area Model: 2 1/3 × 1 2/5"
        }
      ],
      steps: [
        {
          label: "Part 1: Improper fractions (Example 19a)",
          text: "Multiply across, then convert improper result to a mixed numeral ($35 \\div 6 = 5$ rem $5$):",
          latex: "\\frac{5}{3} \\times \\frac{7}{2} = \\frac{5 \\times 7}{3 \\times 2} = \\frac{35}{6} = \\mathbf{5\\frac{5}{6}}"
        },
        {
          label: "Part 2: Convert mixed numerals to improper (Example 20a)",
          text: "Convert $2\\frac{1}{3} = \\frac{7}{3}$ and $1\\frac{2}{5} = \\frac{7}{5}$:",
          latex: "2\\frac{1}{3} \\times 1\\frac{2}{5} = \\frac{7}{3} \\times \\frac{7}{5}"
        },
        {
          label: "Part 2: Multiply and convert to mixed numeral",
          text: "Multiply across ($49 \\div 15 = 3$ remainder $4$):",
          latex: "\\frac{7 \\times 7}{3 \\times 5} = \\frac{49}{15} = \\mathbf{3\\frac{4}{15}}"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 14: We Do — Mixed Numerals & Independent Checkpoint (4 min)
    // ------------------------------------------------------------------------
    {
      type: "we-do",
      phase: "guided",
      estimatedMinutes: 4,
      title: "We Do: Mixed Numerals & Checkpoint",
      subtitle: "Whiteboard practice & 3-question independent checkpoint",
      studentAction: "On mini-whiteboards: solve the guided task, then complete the 3 checkpoint problems.",
      prompt: "Calculate the guided task, then solve the 3-question checkpoint in your workbook:",
      workspaceContent: [
        {
          type: "note-box",
          variant: "default",
          title: "Guided Task: $1\\frac{1}{2} \\times 2\\frac{2}{3}$",
          text: "• Convert to improper fractions: $\\frac{\\underline{\\hspace{1.5em}}}{\\underline{\\hspace{1.5em}}} \\times \\frac{\\underline{\\hspace{1.5em}}}{\\underline{\\hspace{1.5em}}}$\n• Cancel common factors and multiply!"
        },
        {
          type: "note-box",
          variant: "gold",
          title: "Independent Checkpoint (attempt independently)",
          text: "1. $\\frac{2}{3} \\times \\frac{1}{5}$\n2. $\\frac{3}{4} \\times \\frac{8}{9}$\n3. $1\\frac{1}{2} \\times 2\\frac{1}{3}$"
        }
      ],
      solution: [
        {
          type: "paragraph",
          text: "**Guided Task Solution:**\n$$1\\frac{1}{2} \\times 2\\frac{2}{3} = \\frac{3}{2} \\times \\frac{8}{3} = \\frac{^1\\cancel{3}}{_1\\cancel{2}} \\times \\frac{^4\\cancel{8}}{_1\\cancel{3}} = \\mathbf{4}$$\n\n**Checkpoint Answers:**\n1. $\\frac{2}{3} \\times \\frac{1}{5} = \\mathbf{\\frac{2}{15}}$\n2. $\\frac{3}{4} \\times \\frac{8}{9} = \\frac{1 \\times 2}{1 \\times 3} = \\mathbf{\\frac{2}{3}}$\n3. $1\\frac{1}{2} \\times 2\\frac{1}{3} = \\frac{3}{2} \\times \\frac{7}{3} = \\frac{7}{2} = \\mathbf{3\\frac{1}{2}}$"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 15: You Do — Textbook Practice (23 min)
    // ------------------------------------------------------------------------
    {
      type: "practice",
      phase: "independent",
      estimatedMinutes: 23,
      timerMinutes: 20,
      title: "You Do: Exercise 3G — Independent Practice",
      subtitle: "Textbook Pages 184–185 · Complete in your exercise book (20-minute timer)",
      content: [
        {
          type: "note-box",
          variant: "default",
          title: "Exercise Book Instructions",
          text: "Complete questions in your **exercise book**, showing all working steps.\n• Write down each problem and **cancel before multiplying** where possible.\n• Always simplify final fractions and convert improper fractions to mixed numerals."
        }
      ],
      tasks: [
        {
          title: "Start Here: Core Foundations",
          prompt: "**Exercise 3G (pp. 184–185):**\n• **Q1a–d:** Basic fraction multiplication\n• **Q3a–d:** Multiplying fractions, including expressions using 'of'",
          solution: [
            {
              type: "paragraph",
              text: "• Q1: Multiply numerators across top and denominators across bottom.\n• Q3: Remember 'of' means multiply."
            }
          ]
        },
        {
          title: "Next: Cancelling & Quantities",
          prompt: "**Exercise 3G (pp. 184–185):**\n• **Q2a–b:** Cancelling common factors\n• **Q4a–d:** Fractions multiplied by whole numbers; fractions of quantities",
          solution: [
            {
              type: "paragraph",
              text: "• Q2: Cancel common factors between top and bottom before multiplying.\n• Q4: Write whole numbers as $\\frac{n}{1}$ and cancel."
            }
          ]
        },
        {
          title: "Challenge & Extension",
          prompt: "**Exercise 3G (pp. 184–185):**\n• **Challenge:** **Q5a–b** (Multiplying improper fractions) & **Q6a–b** (Multiplying mixed numerals)\n• **Extension:** **Q9** (Applied problems) or **Q12** (Reasoning)",
          solution: [
            {
              type: "paragraph",
              text: "• Q5/6: Always convert mixed numerals to improper fractions first.\n• Q9/12: Show full mathematical reasoning and include units where required."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 16: Exit Ticket (3 min)
    // ------------------------------------------------------------------------
    {
      type: "exit-ticket",
      phase: "assessment",
      estimatedMinutes: 3,
      title: "Exit Ticket: Multiplying Fractions",
      subtitle: "Answer independently in your exercise book before the bell · Spacebar reveals answers",
      questions: [
        {
          prompt: "**1. Calculate and simplify:**\n$$\\frac{2}{3} \\times \\frac{3}{5}$$",
          solution: [
            {
              type: "paragraph",
              text: "Cancel the common factor $3$ in the numerator and denominator:\n$$\\frac{2}{_1\\cancel{3}} \\times \\frac{^1\\cancel{3}}{5} = \\mathbf{\\frac{2}{5}}$$"
            }
          ]
        },
        {
          prompt: "**2. Mixed Numerals Rule:**\nWhat must you do before multiplying mixed numerals?",
          solution: [
            {
              type: "paragraph",
              text: "**Convert mixed numerals to improper fractions first.**\n*(Unlike addition, whole-number and fractional parts cannot be multiplied separately.)*"
            }
          ]
        },
        {
          prompt: "**3. Conceptual Reasoning:**\nWhy don't we need a common denominator when multiplying fractions?",
          solution: [
            {
              type: "paragraph",
              text: "**Multiplication combines factors of numerators and denominators.**\nIt finds a fraction *of* an amount (scaling parts), rather than adding equal-sized slices."
            }
          ]
        }
      ]
    }
  ]
};
