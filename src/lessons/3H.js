/**
 * @file 3H.js
 * Year 7 Mathematics: Lesson 3H — Dividing Fractions
 * Textbook: Essential Mathematics for the Victorian Curriculum, Year 7, 3rd edition, Section 3H (pp. 188–193).
 * Pacing: 17-slide, 60-minute lesson designed around a gradual release model (Do Now -> I Do -> We Do -> You Do -> Exit Ticket).
 * Meaningful independent textbook practice begins at minute 23 (Slide 11).
 */

export default {
  id: "3H",
  title: "Dividing Fractions",
  subject: "Mathematics",
  yearLevel: 7,
  unit: "Chapter 3",
  folder: "Fractions",
  chapter: "Fractions",
  topics: [
    "Reciprocals",
    "Visual Grouping & Explorer",
    "Fractions Divided by Whole Numbers",
    "Whole Numbers Divided by Fractions",
    "Dividing Fractions",
    "Dividing Mixed Numerals"
  ],
  slides: [
    // ------------------------------------------------------------------------
    // SLIDE 1: Title (1 min)
    // ------------------------------------------------------------------------
    {
      type: "title",
      phase: "opening",
      estimatedMinutes: 1,
      title: "3H: Dividing Fractions",
      subtitle: "How many times does one fraction fit into another?",
      overview: "Understand why division by a fraction is equivalent to multiplication by its reciprocal. Explore how many fractional groups fit into an amount, debunk the misconception that division always makes numbers smaller, and master dividing fractions, whole numbers and mixed numerals.",
      topics: [
        "Opening Question: $\\frac{1}{2} \\div \\frac{1}{4} = ?$",
        "Meaning of Division: Counting Equal Groups",
        "Interactive Fraction Division Explorer",
        "Reciprocals & The Invert-and-Multiply Principle",
        "Dividing Fractions & Mixed Numerals"
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 2: Do Now (3 min)
    // ------------------------------------------------------------------------
    {
      type: "do-now",
      phase: "opening",
      estimatedMinutes: 3,
      timerMinutes: 3,
      title: "Do Now: Prior Knowledge Recall",
      subtitle: "Answer these four questions in your exercise book (3 minutes)",
      questions: [
        {
          prompt: "Calculate: $\\frac{3}{4} \\times \\frac{2}{5}$ (simplify your answer)",
          answer: "$\\frac{3 \\times 2}{4 \\times 5} = \\frac{6}{20} = \\mathbf{\\frac{3}{10}}$"
        },
        {
          prompt: "Convert to an improper fraction: $1\\frac{1}{2}$",
          answer: "$1\\frac{1}{2} = \\frac{(1 \\times 2) + 1}{2} = \\mathbf{\\frac{3}{2}}$"
        },
        {
          prompt: "Calculate: $12 \\div 3$",
          answer: "$12 \\div 3 = \\mathbf{4}$ (How many groups of $3$ fit into $12$?)"
        },
        {
          prompt: "How many quarters make one whole?",
          answer: "$\\mathbf{4\\text{ quarters}}$ make $1$ whole (since $\\frac{4}{4} = 1$)"
        }
      ],
      sidebarNotes: [
        {
          type: "note-box",
          variant: "gold",
          title: "💡 Connecting Prior Skills",
          text: "• **Multiplication:** When we divide fractions, we will transform the problem into multiplication!\n• **Improper fractions:** Mixed numerals must always be converted before calculating.\n• **Equal groups:** Division asks: *How many groups of that size fit inside?*"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 3: Do Now Answers (1 min)
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "opening",
      estimatedMinutes: 1,
      title: "Do Now: Worked Solutions",
      subtitle: "Check and correct your answers · Spacebar reveals each solution",
      prompt: "Review the foundational reasoning for today's lesson:",
      steps: [
        {
          label: "1. Calculate 3/4 × 2/5",
          latex: "\\frac{3}{4} \\times \\frac{2}{5} = \\frac{3 \\times 2}{4 \\times 5} = \\frac{6}{20} = \\mathbf{\\frac{3}{10}}"
        },
        {
          label: "2. Convert 1 1/2 to an improper fraction",
          latex: "1\\frac{1}{2} = \\frac{(1 \\times 2) + 1}{2} = \\mathbf{\\frac{3}{2}}"
        },
        {
          label: "3. Calculate 12 ÷ 3",
          latex: "12 \\div 3 = \\mathbf{4} \\quad (\\text{four groups of } 3 \\text{ fit into } 12)"
        },
        {
          label: "4. How many quarters make one whole?",
          text: "There are **$4$ quarters** in one whole: $\\frac{4}{4} = 1$. Knowing how many parts fit into a whole is key to dividing fractions!"
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
      subtitle: "Section 3H: Dividing Fractions (Textbook pp. 188–193)",
      learningIntention: "We are learning how to divide fractions, whole numbers and mixed numerals.",
      successCriteria: [
        "I can find the reciprocal of a fraction, whole number or mixed numeral.",
        "I can explain why division by a non-zero number is equivalent to multiplication by its reciprocal.",
        "I can divide fractions and mixed numerals, showing working and simplifying my answer."
      ],
      keyPrinciple: "Central Question: Why can dividing by a fraction produce a larger answer? Because division asks 'How many pieces of that size fit inside?' Smaller pieces mean MORE pieces fit!"
    },

    // ------------------------------------------------------------------------
    // SLIDE 5: What Does Fraction Division Mean? (3 min)
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 3,
      title: "What Does Fraction Division Mean?",
      subtitle: "Understanding division as counting equal groups · 1/2 ÷ 1/4 = 2",
      prompt: "Consider the division problem $\\frac{1}{2} \\div \\frac{1}{4}$:",
      leftBlocks: [
        {
          type: "note-box",
          variant: "default",
          title: "Sharing vs Grouping",
          text: "In primary school, $12 \\div 3$ often meant sharing $12$ items among $3$ people.\n\nIn secondary mathematics, division also means **measurement or grouping**:\n$$\\text{How many groups of } B \\text{ fit into } A?$$\n\nFor $\\frac{1}{2} \\div \\frac{1}{4}$, we ask: **How many quarters fit into one half?**"
        }
      ],
      steps: [
        {
          label: "Step 1: Translate division into equal groups",
          text: "Ask: *How many quarters ($\\frac{1}{4}$) fit inside one half ($\\frac{1}{2}$)?*"
        },
        {
          label: "Step 2: Visualise with fraction bars",
          text: "One half is equivalent to two quarters:\n$$\\frac{1}{2} = \\frac{2}{4}$$"
        },
        {
          label: "Step 3: Count the groups",
          latex: "\\frac{1}{2} \\div \\frac{1}{4} = \\mathbf{2} \\quad (\\text{exactly } 2 \\text{ quarters fit into one half})"
        },
        {
          label: "Step 4: Cardinal Misconception Alert",
          text: "**Does division always make numbers smaller? NO!**\nDividing $\\frac{1}{2}$ by $\\frac{1}{4}$ gave **$2$**, which is larger than $\\frac{1}{2}$. When you divide by a number smaller than $1$, the answer gets **larger** because you are counting smaller pieces!"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 6: Interactive Fraction Division Explorer (4 min)
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 4,
      title: "Interactive Fraction Division Explorer",
      subtitle: "Explore how many fractional groups fit into an amount",
      content: [
        {
          type: "note-box",
          variant: "gold",
          title: "💡 Classroom Investigation",
          text: "Before clicking **Show Groups**, predict how many groups fit!\n• **Notice partial groups:** For $\\frac{3}{4} \\div \\frac{1}{2}$, notice that $\\frac{3}{4}$ contains **one complete half** and **half of another half** ($1\\frac{1}{2}$ groups)!"
        },
        {
          type: "simulation",
          simType: "fraction-division",
          mode: "fit",
          title: "Fraction Division Explorer · Counting Groups",
          subtitle: "Explore $\\frac{1}{2} \\div \\frac{1}{4} = 2$, $\\frac{3}{4} \\div \\frac{1}{2} = 1\\frac{1}{2}$, and $3 \\div \\frac{1}{2} = 6$"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 7: Dividing and Multiplying Are Connected (2 min)
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 2,
      title: "Dividing & Multiplying Are Connected",
      subtitle: "Sharing 24 lollies among 3 people · Uncovering the reciprocal connection",
      columns: [
        {
          width: "60",
          title: "1. The Lolly Sharing Model",
          blocks: [
            {
              type: "note-box",
              variant: "default",
              title: "Sharing 24 Lollies Equally Among 3 People",
              text: "Consider two ways of calculating each person's share:\n\n• **Division:** Share $24$ into $3$ equal groups:\n$$24 \\div 3 = 8$$\n• **Multiplication:** Find one-third of $24$:\n$$24 \\times \\frac{1}{3} = \\frac{24}{3} = 8$$\n\nBoth operations produce the exact same outcome: **8 lollies**!"
            },
            {
              type: "note-box",
              variant: "green",
              title: "The Reciprocal Principle",
              text: "**Dividing by 3 is identical to multiplying by $\\frac{1}{3}$!**\nIn mathematics, division by any non-zero number is equivalent to multiplying by its reciprocal."
            }
          ]
        },
        {
          width: "40",
          title: "2. Think & Apply",
          blocks: [
            {
              type: "note-box",
              variant: "gold",
              title: "Quick Question",
              text: "**What multiplication is equivalent to dividing by 5?**\n\nDividing by $5$ is equivalent to multiplying by $\\mathbf{\\frac{1}{5}}$!\n\n$$A \\div 5 = A \\times \\frac{1}{5}$$\n\nSimilarly:\n$$A \\div 10 = A \\times \\frac{1}{10}$$"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 8: I Do: Reciprocals (3 min)
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 3,
      title: "I Do: Understanding Reciprocals",
      subtitle: "Two non-zero numbers are reciprocals if their product is 1 · Textbook Page 188",
      columns: [
        {
          width: "50",
          title: "1. Definition & Rules",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "default",
              title: "The Reciprocal Rule",
              text: "The **reciprocal** of a non-zero number is the number that multiplies with it to give **1**.\n\n• **Fractions:** Invert (swap) numerator & denominator:\n$$\\text{Reciprocal of } \\frac{2}{3} \\text{ is } \\mathbf{\\frac{3}{2}} \\quad \\left(\\frac{2}{3} \\times \\frac{3}{2} = \\frac{6}{6} = 1\\right)$$\n• **Whole Numbers:** Write over 1 first:\n$$5 = \\frac{5}{1} \\implies \\text{Reciprocal is } \\mathbf{\\frac{1}{5}}$$\n• **Mixed Numerals:** Convert to improper first:\n$$1\\frac{3}{7} = \\frac{10}{7} \\implies \\text{Reciprocal is } \\mathbf{\\frac{7}{10}}$$"
            }
          ]
        },
        {
          width: "50",
          title: "2. Interactive Demonstrator",
          blocks: [
            {
              type: "simulation",
              simType: "reciprocal-explorer",
              title: "Reciprocal Demonstrator",
              subtitle: "Select a number, reveal its reciprocal, and verify the product is 1"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 9: We Do: Which Fraction Changes? (2 min)
    // ------------------------------------------------------------------------
    {
      type: "we-do",
      phase: "guided",
      estimatedMinutes: 2,
      title: "We Do: Which Fraction Changes?",
      subtitle: "Diagnostic Multiple Choice · Textbook Page 189",
      studentAction: "On mini-whiteboards: write the letter (A, B, C, or D) of the correct multiplication.",
      prompt: "To calculate $\\frac{3}{5} \\div \\frac{4}{7}$, which multiplication is mathematically correct?",
      workspaceContent: [
        {
          type: "note-box",
          variant: "default",
          title: "Look carefully at these four options:",
          text: "• **A.** $\\frac{3}{5} \\times \\frac{7}{4}$\n• **B.** $\\frac{5}{3} \\times \\frac{4}{7}$\n• **C.** $\\frac{5}{3} \\times \\frac{7}{4}$\n• **D.** $\\frac{3}{5} \\times \\frac{4}{7}$"
        }
      ],
      solution: [
        {
          type: "paragraph",
          text: "**✔ Correct Answer: Option A**\n$$\\frac{3}{5} \\div \\frac{4}{7} = \\mathbf{\\frac{3}{5} \\times \\frac{7}{4}} = \\frac{21}{20} = 1\\frac{1}{20}$$\n\n• **Rule:** Only the **divisor** (the second fraction) is replaced by its reciprocal!\n• **The dividend (first fraction) never changes!**\n• Inverting the first fraction (Options B and C) changes the starting quantity.\n• Option D forgot to invert the divisor."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 10: I Do: Fraction Divided by a Whole Number (3 min)
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 3,
      title: "I Do: Fraction Divided by Whole Number",
      subtitle: "Textbook Example 21 (Page 189) · Equal sharing & multiplying by the reciprocal",
      prompt: "Calculate $\\frac{5}{8} \\div 3$, showing visual sharing and full working:",
      leftBlocks: [
        {
          type: "simulation",
          simType: "fraction-division",
          mode: "sharing",
          dividendNum: 5,
          dividendDen: 8,
          shares: 3,
          title: "Visual Sharing: 5/8 ÷ 3",
          subtitle: "Each eighth is cut into 3 slices $\\implies 24$ slices in the whole"
        }
      ],
      steps: [
        {
          label: "Step 1: Write whole number over 1 and multiply by reciprocal",
          text: "Write $3$ as $\\frac{3}{1}$. Replace division with multiplication by $\\frac{1}{3}$:",
          latex: "\\frac{5}{8} \\div 3 = \\frac{5}{8} \\div \\frac{3}{1} = \\frac{5}{8} \\times \\frac{1}{3}"
        },
        {
          label: "Step 2: Multiply across and simplify",
          text: "Multiply numerators and denominators ($5$ and $24$ share no common factors):",
          latex: "\\frac{5 \\times 1}{8 \\times 3} = \\mathbf{\\frac{5}{24}}"
        },
        {
          label: "Now You Try: Calculate 3/4 ÷ 5",
          text: "Write $5$ as $\\frac{5}{1}$, multiply by reciprocal $\\frac{1}{5}$, and multiply across:",
          latex: "\\frac{3}{4} \\div 5 = \\frac{3}{4} \\times \\frac{1}{5} = \\frac{3 \\times 1}{4 \\times 5} = \\mathbf{\\frac{3}{20}}"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 11: Independent Textbook Practice, Part 1 (11 min)
    // ------------------------------------------------------------------------
    {
      type: "practice",
      phase: "independent",
      estimatedMinutes: 11,
      timerMinutes: 11,
      title: "You Do: Exercise 3H — Practice Part 1",
      subtitle: "Textbook Page 192 · Core Reciprocals & Dividing by Whole Numbers (11-min timer)",
      content: [
        {
          type: "note-box",
          variant: "default",
          title: "Exercise Book Instructions",
          text: "Work independently in your **exercise book**, showing all steps:\n• Write whole numbers as $\\frac{n}{1}$ before finding reciprocals.\n• Convert mixed numerals to improper fractions first.\n• Show the multiplication step before calculating."
        }
      ],
      tasks: [
        {
          title: "Q1–2: Reciprocals of Fractions & Whole Numbers",
          prompt: "**Exercise 3H (Page 192):**\n• **Q1:** State the reciprocal of $\\frac{1}{3}$, $\\frac{3}{4}$, $\\frac{5}{8}$, $\\frac{7}{2}$\n• **Q2:** State the reciprocal of $4$, $7$, $1$, $12$",
          solution: [
            {
              type: "paragraph",
              text: "• **Q1:** $\\frac{1}{3} \\to \\mathbf{3}$; $\\frac{3}{4} \\to \\mathbf{\\frac{4}{3} = 1\\frac{1}{3}}$; $\\frac{5}{8} \\to \\mathbf{\\frac{8}{5} = 1\\frac{3}{5}}$; $\\frac{7}{2} \\to \\mathbf{\\frac{2}{7}}$\n• **Q2:** $4 \\to \\mathbf{\\frac{1}{4}}$; $7 \\to \\mathbf{\\frac{1}{7}}$; $1 \\to \\mathbf{1}$; $12 \\to \\mathbf{\\frac{1}{12}}$"
            }
          ]
        },
        {
          title: "Q3: Reciprocals of Mixed Numerals",
          prompt: "**Exercise 3H (Page 192):**\n• **Q3a–d:** Find the reciprocal of $1\\frac{1}{2}$, $2\\frac{3}{4}$, $3\\frac{1}{5}$, $4\\frac{2}{3}$\n*(Remember: Convert to an improper fraction first!)*",
          solution: [
            {
              type: "paragraph",
              text: "• $1\\frac{1}{2} = \\frac{3}{2} \\implies \\mathbf{\\frac{2}{3}}$\n• $2\\frac{3}{4} = \\frac{11}{4} \\implies \\mathbf{\\frac{4}{11}}$\n• $3\\frac{1}{5} = \\frac{16}{5} \\implies \\mathbf{\\frac{5}{16}}$\n• $4\\frac{2}{3} = \\frac{14}{3} \\implies \\mathbf{\\frac{3}{14}}$"
            }
          ]
        },
        {
          title: "Q4 & Q5: Dividing Fractions by Whole Numbers",
          prompt: "**Exercise 3H (Page 192):**\n• **Q4a–d:** Calculate $\\frac{2}{3} \\div 4$, $\\frac{4}{5} \\div 2$, $\\frac{3}{8} \\div 6$, $\\frac{5}{6} \\div 5$\n• **Q5a–b:** Dividing mixed numerals by whole numbers: $1\\frac{1}{2} \\div 3$",
          solution: [
            {
              type: "paragraph",
              text: "• $\\frac{2}{3} \\div 4 = \\frac{2}{3} \\times \\frac{1}{4} = \\frac{2}{12} = \\mathbf{\\frac{1}{6}}$\n• $\\frac{4}{5} \\div 2 = \\frac{4}{5} \\times \\frac{1}{2} = \\frac{4}{10} = \\mathbf{\\frac{2}{5}}$\n• $\\frac{3}{8} \\div 6 = \\frac{3}{8} \\times \\frac{1}{6} = \\frac{3}{48} = \\mathbf{\\frac{1}{16}}$\n• $\\frac{5}{6} \\div 5 = \\frac{5}{6} \\times \\frac{1}{5} = \\mathbf{\\frac{1}{6}}$\n• $1\\frac{1}{2} \\div 3 = \\frac{3}{2} \\times \\frac{1}{3} = \\mathbf{\\frac{1}{2}}$"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 12: I Do: Whole Number Divided by a Fraction (3 min)
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 3,
      title: "I Do: Whole Number Divided by Fraction",
      subtitle: "Textbook Example 22a (Page 190) · Why division produces a larger answer",
      prompt: "Calculate $6 \\div \\frac{1}{3}$. Predict before revealing: will the answer be larger or smaller than 6?",
      leftBlocks: [
        {
          type: "note-box",
          variant: "gold",
          title: "Why Does the Answer Get Larger?",
          text: "• Dividing by $\\frac{1}{3}$ asks: **How many thirds fit into 6 wholes?**\n• In $1$ whole, there are $3$ thirds ($1 \\div \\frac{1}{3} = 3$).\n• In $6$ wholes, there are $6 \\times 3 = 18$ thirds!\n• **Dividing by $\\frac{1}{3}$ is identical to multiplying by $3$!**"
        }
      ],
      steps: [
        {
          label: "Step 1: Write 6 as a fraction over 1",
          text: "Express the whole number with denominator 1:",
          latex: "6 \\div \\frac{1}{3} = \\frac{6}{1} \\div \\frac{1}{3}"
        },
        {
          label: "Step 2: Multiply by the reciprocal of 1/3",
          text: "Replace $\\div \\frac{1}{3}$ with multiplication by its reciprocal $\\frac{3}{1}$:",
          latex: "\\frac{6}{1} \\div \\frac{1}{3} = \\frac{6}{1} \\times \\frac{3}{1}"
        },
        {
          label: "Step 3: Multiply across",
          text: "Multiply numerators and denominators:",
          latex: "\\frac{6 \\times 3}{1 \\times 1} = \\frac{18}{1} = \\mathbf{18}"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 13: I Do: Fraction Divided by Fraction (4 min)
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 4,
      title: "I Do: Fraction Divided by Fraction",
      subtitle: "Textbook Example 22b (Page 190) · Invert divisor, multiply & simplify",
      prompt: "Calculate $\\frac{3}{5} \\div \\frac{3}{8}$, showing all working steps:",
      leftBlocks: [
        {
          type: "note-box",
          variant: "default",
          title: "The Four-Step Method",
          text: "1. **Keep** the first fraction (dividend).\n2. **Change** $\\div$ to $\\times$.\n3. **Flip** the second fraction (divisor reciprocal).\n4. **Cancel** common factors and simplify!\n\n*(Why? Because division asks how many groups of $\\frac{3}{8}$ fit into $\\frac{3}{5}$)*"
        }
      ],
      steps: [
        {
          label: "Step 1: Multiply by the reciprocal of the divisor",
          text: "Keep $\\frac{3}{5}$, change $\\div$ to $\\times$, and flip $\\frac{3}{8}$ to $\\frac{8}{3}$:",
          latex: "\\frac{3}{5} \\div \\frac{3}{8} = \\frac{3}{5} \\times \\frac{8}{3}"
        },
        {
          label: "Step 2: Cancel common factor 3 diagonally",
          text: "Divide numerator $3$ and denominator $3$ by $3$ ($3 \\div 3 = 1$):",
          latex: "\\frac{^1\\cancel{3}}{5} \\times \\frac{8}{_1\\cancel{3}} = \\frac{1 \\times 8}{5 \\times 1} = \\mathbf{\\frac{8}{5}}"
        },
        {
          label: "Step 3: Convert improper fraction to mixed numeral",
          text: "Divide $8 \\div 5 = 1$ remainder $3$:",
          latex: "\\frac{8}{5} = \\mathbf{1\\frac{3}{5}}"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 14: We Do: Mixed Numerals (4 min)
    // ------------------------------------------------------------------------
    {
      type: "we-do",
      phase: "guided",
      estimatedMinutes: 4,
      title: "We Do: Dividing Mixed Numerals",
      subtitle: "Textbook Example 23 (Page 191) · Guided practice on mini-whiteboards",
      studentAction: "On mini-whiteboards: convert to improper, invert divisor, cancel and solve.",
      prompt: "Calculate $2\\frac{2}{5} \\div 1\\frac{3}{5}$, showing all working and simplifying fully:",
      workspaceContent: [
        {
          type: "note-box",
          variant: "default",
          title: "Step-by-Step Action Plan",
          text: "**1.** Convert both mixed numerals to improper fractions: $2\\frac{2}{5} = \\frac{\\underline{\\hspace{1.5em}}}{5}$ and $1\\frac{3}{5} = \\frac{\\underline{\\hspace{1.5em}}}{5}$.\n**2.** Multiply by the reciprocal of the second fraction.\n**3.** Cancel common factors before multiplying!\n**4.** Write the final answer as a simplified mixed numeral."
        },
        {
          type: "note-box",
          variant: "alert",
          title: "⚠️ Cardinal Rule: Convert First!",
          text: "**Why can't we simply reverse the visible numbers in a mixed numeral?**\nBecause $1\\frac{3}{5} = 1 + \\frac{3}{5} = \\frac{8}{5}$. Inverting the entire quantity gives $\\frac{5}{8}$, NOT $1\\frac{5}{3}$!"
        }
      ],
      solution: [
        {
          type: "paragraph",
          text: "**Step 1: Convert to improper fractions:**\n$$2\\frac{2}{5} = \\frac{(2 \\times 5) + 2}{5} = \\frac{12}{5} \\quad \\text{and} \\quad 1\\frac{3}{5} = \\frac{(1 \\times 5) + 3}{5} = \\frac{8}{5}$$\n\n**Step 2: Multiply by the reciprocal of the divisor:**\n$$\\frac{12}{5} \\div \\frac{8}{5} = \\frac{12}{5} \\times \\frac{5}{8}$$\n\n**Step 3: Cancel common factors ($5$ with $5$, and divide $12$ & $8$ by $4$):**\n$$\\frac{^3\\cancel{12}}{_1\\cancel{5}} \\times \\frac{^1\\cancel{5}}{_2\\cancel{8}} = \\frac{3 \\times 1}{1 \\times 2} = \\frac{3}{2}$$\n\n**Step 4: Convert to mixed numeral:**\n$$\\frac{3}{2} = \\mathbf{1\\frac{1}{2}}$$"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 15: Diagnostic Checkpoint: Find the Mistake (3 min)
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "guided",
      estimatedMinutes: 3,
      title: "Diagnostic Checkpoint: Find the Mistake",
      subtitle: "Spot the error in student working · Spacebar reveals analysis",
      columns: [
        {
          width: "60",
          title: "1. Incorrect Student Working",
          blocks: [
            {
              type: "note-box",
              variant: "alert",
              title: "❌ Student's Calculation",
              text: "A student answered the following question on a test:\n\n$$\\frac{2}{3} \\div \\frac{4}{5} = \\frac{3}{2} \\times \\frac{5}{4} = \\frac{15}{8} = 1\\frac{7}{8}$$\n\n**What did the student do wrong?**"
            },
            {
              type: "note-box",
              variant: "default",
              title: "Question 2: Dividing by 1/2 vs Halving",
              text: "**Is dividing by $\\frac{1}{2}$ the same as halving?**\n• Think carefully about the words!\n• If you have $10$ apples and divide by $\\frac{1}{2}$, what do you get?"
            }
          ]
        },
        {
          width: "40",
          title: "2. Worked Correction",
          blocks: [
            {
              type: "note-box",
              variant: "green",
              revealStep: 1,
              title: "✔ Analysis of the Error",
              text: "**The student inverted BOTH fractions!**\n\n• The first fraction (dividend) must **NEVER** be inverted!\n• Only the divisor is replaced by its reciprocal.\n\n**Correct Working:**\n$$\\frac{2}{3} \\div \\frac{4}{5} = \\frac{2}{3} \\times \\frac{5}{4} = \\frac{1 \\times 5}{3 \\times 2} = \\mathbf{\\frac{5}{6}}$$"
            },
            {
              type: "note-box",
              variant: "gold",
              revealStep: 2,
              title: "💡 Dividing by 1/2 vs Halving",
              text: "**No! They are exact opposites!**\n\n• **Halving** means dividing by $2$ (or multiplying by $\\frac{1}{2}$): $10 \\div 2 = 5$.\n• **Dividing by $\\frac{1}{2}$** means multiplying by $2$: $10 \\div \\frac{1}{2} = 10 \\times 2 = \\mathbf{20}$!\n*(How many half-apples in 10 apples? 20 halves!)*"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 16: Independent Textbook Practice, Part 2 (9 min)
    // ------------------------------------------------------------------------
    {
      type: "practice",
      phase: "independent",
      estimatedMinutes: 9,
      timerMinutes: 9,
      title: "You Do: Exercise 3H — Practice Part 2",
      subtitle: "Textbook Pages 192–193 · Fraction Division, Mixed Numerals & Word Problems (9-min timer)",
      content: [
        {
          type: "note-box",
          variant: "default",
          title: "Exercise Book Instructions",
          text: "Complete questions in your **exercise book**, showing all working steps.\n• Write down each problem and show the multiplication by the reciprocal.\n• **Cancel common factors** before multiplying to keep numbers small.\n• Always simplify final fractions and convert improper fractions to mixed numerals."
        }
      ],
      tasks: [
        {
          title: "Q6 & Q7a–d: Whole Numbers & Proper Fractions",
          prompt: "**Exercise 3H (Page 192):**\n• **Q6a–d:** Whole numbers divided by fractions: $8 \\div \\frac{1}{2}$, $6 \\div \\frac{2}{3}$, $10 \\div \\frac{5}{6}$, $4 \\div \\frac{2}{5}$\n• **Q7a–d:** Fraction divided by fraction: $\\frac{1}{2} \\div \\frac{1}{4}$, $\\frac{2}{3} \\div \\frac{4}{9}$, $\\frac{3}{5} \\div \\frac{9}{10}$, $\\frac{5}{6} \\div \\frac{1}{3}$",
          solution: [
            {
              type: "paragraph",
              text: "• **Q6:** $8 \\times 2 = \\mathbf{16}$; $6 \\times \\frac{3}{2} = \\mathbf{9}$; $10 \\times \\frac{6}{5} = \\mathbf{12}$; $4 \\times \\frac{5}{2} = \\mathbf{10}$\n• **Q7:** $\\frac{1}{2} \\times 4 = \\mathbf{2}$; $\\frac{2}{3} \\times \\frac{9}{4} = \\mathbf{\\frac{3}{2} = 1\\frac{1}{2}}$; $\\frac{3}{5} \\times \\frac{10}{9} = \\mathbf{\\frac{2}{3}}$; $\\frac{5}{6} \\times 3 = \\mathbf{\\frac{5}{2} = 2\\frac{1}{2}}$"
            }
          ]
        },
        {
          title: "Q7e–h & Q8: Challenging Fractions & Mixed Numerals",
          prompt: "**Exercise 3H (Pages 192–193):**\n• **Q7e–h:** Further fraction division: $\\frac{7}{8} \\div \\frac{3}{4}$, $\\frac{4}{9} \\div \\frac{8}{15}$\n• **Q8a–d:** Dividing mixed numerals: $1\\frac{1}{2} \\div 2\\frac{1}{4}$, $3\\frac{1}{3} \\div 1\\frac{2}{3}$, $2\\frac{2}{5} \\div 1\\frac{1}{5}$",
          solution: [
            {
              type: "paragraph",
              text: "• **Q7:** $\\frac{7}{8} \\times \\frac{4}{3} = \\mathbf{\\frac{7}{6} = 1\\frac{1}{6}}$; $\\frac{4}{9} \\times \\frac{15}{8} = \\mathbf{\\frac{5}{6}}$\n• **Q8:** $\\frac{3}{2} \\times \\frac{4}{9} = \\mathbf{\\frac{2}{3}}$; $\\frac{10}{3} \\times \\frac{3}{5} = \\mathbf{2}$; $\\frac{12}{5} \\times \\frac{5}{6} = \\mathbf{2}$"
            }
          ]
        },
        {
          title: "Q9 & Q12–13: Problem-Solving & Extension",
          prompt: "**Exercise 3H (Page 193):**\n• **Q9:** A ribbon is $4\\frac{1}{2}\\text{ m}$ long. How many $\\frac{3}{4}\\text{ m}$ strips can be cut from it?\n• **Q12:** Explain why dividing by $0$ is undefined using reciprocals.\n• **Q13:** Find the missing fraction: $\\frac{2}{3} \\div \\Box = \\frac{8}{9}$",
          solution: [
            {
              type: "paragraph",
              text: "• **Q9:** $4\\frac{1}{2} \\div \\frac{3}{4} = \\frac{9}{2} \\times \\frac{4}{3} = \\mathbf{6\\text{ strips}}$\n• **Q12:** If $0$ had a reciprocal $R$, then $0 \\times R = 1$, which is impossible because $0$ multiplied by any number is $0$.\n• **Q13:** $\\Box = \\frac{2}{3} \\div \\frac{8}{9} = \\frac{2}{3} \\times \\frac{9}{8} = \\mathbf{\\frac{3}{4}}$"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 17: Exit Ticket (3 min)
    // ------------------------------------------------------------------------
    {
      type: "exit-ticket",
      phase: "assessment",
      estimatedMinutes: 3,
      title: "Exit Ticket: Dividing Fractions",
      subtitle: "Complete independently in your exercise book before the bell · Spacebar reveals solutions",
      questions: [
        {
          prompt: "**1. Reciprocal of a Mixed Numeral:**\nFind the reciprocal of $1\\frac{1}{2}$.",
          solution: [
            {
              type: "paragraph",
              text: "Convert to an improper fraction first:\n$$1\\frac{1}{2} = \\frac{3}{2}$$\nInvert numerator and denominator to get the reciprocal:\n$$\\mathbf{\\frac{2}{3}}$$\n*(Check: $\\frac{3}{2} \\times \\frac{2}{3} = 1$ ✔)*"
            }
          ]
        },
        {
          prompt: "**2. Fraction Divided by Whole Number:**\nCalculate and simplify:\n$$\\frac{3}{4} \\div 2$$",
          solution: [
            {
              type: "paragraph",
              text: "Write $2$ as $\\frac{2}{1}$ and multiply by its reciprocal $\\frac{1}{2}$:\n$$\\frac{3}{4} \\div 2 = \\frac{3}{4} \\times \\frac{1}{2} = \\mathbf{\\frac{3}{8}}$$"
            }
          ]
        },
        {
          prompt: "**3. Fraction Divided by Fraction:**\nCalculate and write as a simplified mixed numeral:\n$$\\frac{2}{3} \\div \\frac{1}{4}$$",
          solution: [
            {
              type: "paragraph",
              text: "Multiply by the reciprocal of the divisor:\n$$\\frac{2}{3} \\div \\frac{1}{4} = \\frac{2}{3} \\times \\frac{4}{1} = \\frac{8}{3} = \\mathbf{2\\frac{2}{3}}$$\n\n**Revisiting our central question:** *Why did dividing make the number larger?*\nBecause quarters ($\\frac{1}{4}$) are smaller than one whole, so **more** than $2$ quarters fit inside $\\frac{2}{3}$!"
            }
          ]
        }
      ]
    }
  ]
};
