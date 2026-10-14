/**
 * @file 8H.js
 * Year 7 Mathematics: Lesson 8H — Theoretical Probability in Single-Step Experiments
 * Chapter: Statistics and Probability
 * Pacing: 60-minute lesson designed around tight I Do -> We Do -> You Do model.
 * Substantive student independent practice commences at ~22 minutes (Slide 8).
 */

export default {
  id: "8H",
  title: "Theoretical Probability",
  subject: "Mathematics",
  yearLevel: 7,
  unit: "Chapter 8",
  folder: "Statistics and Probability",
  chapter: "Statistics and Probability",
  topics: [
    "Theoretical Probability",
    "Sample Space",
    "Favourable Outcomes",
    "Single-Step Experiments",
    "Complementary Events",
    "Probability Formula"
  ],
  slides: [
    // ------------------------------------------------------------------------
    // SLIDE 1: Title
    // ------------------------------------------------------------------------
    {
      type: "title",
      phase: "opening",
      estimatedMinutes: 1,
      title: "Theoretical Probability",
      subtitle: "Calculating and explaining chances in single-step chance experiments",
      overview: "Theoretical probability allows us to calculate the exact mathematical likelihood of events using sample spaces before conducting any experiment.",
      topics: [
        "Key vocabulary: experiment, trial, outcome, sample space, event",
        "The theoretical probability formula: $\\text{Pr}(E) = \\frac{\\text{favourable outcomes}}{\\text{total possible outcomes}}$",
        "Expressing probabilities as fractions, decimals, and percentages",
        "Single-step experiments with dice, spinners, cards, and letters",
        "Complementary events: $\\text{Pr}(\\text{not } E) = 1 - \\text{Pr}(E)$"
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
      subtitle: "Clear goals and success criteria for today's lesson",
      learningIntention: "To calculate and explain theoretical probabilities in single-step experiments.",
      successCriteria: [
        "I can identify the sample space and favourable outcomes, calculate probabilities as fractions, decimals or percentages, and explain my reasoning."
      ],
      keyPrinciple: "Theoretical probability is based on mathematical reasoning about equally likely outcomes: $\\text{Pr}(E) = \\frac{n(E)}{n(S)}$."
    },

    // ------------------------------------------------------------------------
    // SLIDE 3: Do Now (Warm-up) — Lesson Starter: Spinner Probabilities
    // ------------------------------------------------------------------------
    {
      type: "do-now",
      phase: "opening",
      estimatedMinutes: 5,
      title: "Do Now: Lesson Starter — Spinner Probabilities",
      subtitle: "Find the probability of each spinner landing on (a) Red, (b) Green, (c) Blue. Write answers as fractions in simplest form.",
      stimulusTitle: "LESSON STARTER: SPINNER PROBABILITIES",
      stimulusPrompt: "Find the probability of each spinner landing on: (a) Red, (b) Green, (c) Blue. Write each answer as a fraction in simplest form.",
      spinners: [
        {
          id: "sp1",
          name: "Spinner 1",
          sectorsDescription: "4 equal sectors (90° each)",
          needleAngle: 225,
          sectors: [
            { label: "Red", color: "#dc2626", startDeg: 270, endDeg: 360 },
            { label: "Blue", color: "#0284c7", startDeg: 0, endDeg: 90 },
            { label: "Red", color: "#dc2626", startDeg: 90, endDeg: 180 },
            { label: "Green", color: "#16a34a", startDeg: 180, endDeg: 270 }
          ]
        },
        {
          id: "sp2",
          name: "Spinner 2",
          sectorsDescription: "3 equal sectors (120° each)",
          needleAngle: 225,
          sectors: [
            { label: "Red", color: "#dc2626", startDeg: 270, endDeg: 30 },
            { label: "Blue", color: "#0284c7", startDeg: 30, endDeg: 150 },
            { label: "Green", color: "#16a34a", startDeg: 150, endDeg: 270 }
          ]
        },
        {
          id: "sp3",
          name: "Spinner 3",
          sectorsDescription: "Red (180°), Green (90°), Blue (90°)",
          needleAngle: 225,
          sectors: [
            { label: "Red", color: "#dc2626", startDeg: 90, endDeg: 270 },
            { label: "Green", color: "#16a34a", startDeg: 270, endDeg: 360 },
            { label: "Blue", color: "#0284c7", startDeg: 0, endDeg: 90 }
          ]
        }
      ],
      questions: [
        {
          prompt: "Find the probability of each spinner landing on **(a) Red**:",
          answer: "• **Spinner 1:** $\\text{Pr}(\\text{Red}) = \\frac{2}{4} = \\frac{1}{2}$\n• **Spinner 2:** $\\text{Pr}(\\text{Red}) = \\frac{1}{3}$\n• **Spinner 3:** $\\text{Pr}(\\text{Red}) = \\frac{180^\\circ}{360^\\circ} = \\frac{1}{2}$"
        },
        {
          prompt: "Find the probability of each spinner landing on **(b) Green**:",
          answer: "• **Spinner 1:** $\\text{Pr}(\\text{Green}) = \\frac{1}{4}$\n• **Spinner 2:** $\\text{Pr}(\\text{Green}) = \\frac{1}{3}$\n• **Spinner 3:** $\\text{Pr}(\\text{Green}) = \\frac{90^\\circ}{360^\\circ} = \\frac{1}{4}$"
        },
        {
          prompt: "Find the probability of each spinner landing on **(c) Blue**:",
          answer: "• **Spinner 1:** $\\text{Pr}(\\text{Blue}) = \\frac{1}{4}$\n• **Spinner 2:** $\\text{Pr}(\\text{Blue}) = \\frac{1}{3}$\n• **Spinner 3:** $\\text{Pr}(\\text{Blue}) = \\frac{90^\\circ}{360^\\circ} = \\frac{1}{4}$"
        },
        {
          prompt: "🤔 **Key Insight:** Compare Spinner 1 and Spinner 3. What do you notice?",
          answer: "• Both spinners have **identical probabilities** for every colour!\n• **Spinner 1:** Red is split into two opposite quarters ($\\frac{1}{4} + \\frac{1}{4} = \\frac{1}{2}$).\n• **Spinner 3:** Red is merged into one continuous half ($\\frac{1}{2}$).\n• Total favourable sector area is identical."
        }
      ],
      sidebarNotes: [
        {
          type: "note-box",
          variant: "gold",
          title: "📌 Starter Tip",
          text: "• **Equal sectors:** $\\text{Pr} = \\frac{\\text{favourable sectors}}{\\text{total sectors}}$\n• **Angle fraction:** $\\text{Pr} = \\frac{\\text{sector angle}}{360^\\circ}$\n• Always simplify fractions to lowest terms (e.g. $\\frac{2}{4} = \\frac{1}{2}$)."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 4: Key Notes — Vocabulary
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 5,
      title: "Essential Probability Vocabulary",
      subtitle: "Copy these six core terms into your workbook. All six are illustrated using rolling a single die.",
      columns: [
        {
          width: "half",
          title: "1. Experiment, Trial & Outcome",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "default",
              title: "The Experiment & Trials",
              text: "• **Experiment:** A repeatable process that produces uncertain results.\n  *Die Example:* Rolling a standard six-sided die.\n• **Trial:** One single performance of the experiment.\n  *Die Example:* Rolling the die once.\n• **Outcome:** A single possible result of a trial.\n  *Die Example:* Rolling a **4**."
            }
          ]
        },
        {
          width: "half",
          title: "2. Sample Space, Event & Favourable",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "green",
              title: "Sample Space & Events",
              text: "• **Sample Space ($S$):** The set of **all** possible outcomes.\n  *Die Example:* $S = \\{1, 2, 3, 4, 5, 6\\}$; total outcomes $n(S) = 6$.\n• **Event ($E$):** A collection of one or more outcomes of interest.\n  *Die Example:* The event 'rolling an even number'.\n• **Favourable Outcomes:** The outcomes satisfying the event.\n  *Die Example:* $\\{2, 4, 6\\}$; number of favourable outcomes $n(E) = 3$."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 5: Key Notes — The Probability Formula
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 5,
      title: "The Theoretical Probability Formula",
      subtitle: "Copy this master formula and its notation into your workbook",
      columns: [
        {
          width: "half",
          title: "1. Master Formula & Notation",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "default",
              title: "Theoretical Probability Formula",
              text: "If all outcomes in the sample space are **equally likely**:\n\n$$\\text{Pr}(\\text{event}) = \\frac{\\text{number of favourable outcomes}}{\\text{total number of equally likely outcomes}}$$\n\n$$\\text{Pr}(E) = \\frac{n(E)}{n(S)}$$"
            },
            {
              type: "note-box",
              variant: "gold",
              title: "Notation: What Does Pr Mean?",
              text: "• $\\text{Pr}(E)$ or $P(E)$ stands for *'the probability of event $E$'*.\n• Inside the brackets, we write the event name or condition (e.g. $\\text{Pr}(\\text{even})$, $\\text{Pr}(>4)$)."
            }
          ]
        },
        {
          width: "half",
          title: "2. Range & Representations",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "green",
              title: "The Range of Probability ($0$ to $1$)",
              text: "Probabilities can **never** be negative and can **never** exceed $1$:\n\n$$0 \\le \\text{Pr}(E) \\le 1$$\n\n• $\\text{Pr}(\\text{Impossible Event}) = 0$ ($0\\%$)\n• $\\text{Pr}(\\text{Even Chance}) = \\frac{1}{2} = 0.5$ ($50\\%$)\n• $\\text{Pr}(\\text{Certain Event}) = 1$ ($100\\%$)"
            },
            {
              type: "note-box",
              variant: "default",
              title: "Three Equivalent Forms",
              text: "Always express final probabilities as:\n1. **Simplified Fraction:** e.g. $\\frac{1}{4}$\n2. **Decimal:** e.g. $0.25$\n3. **Percentage:** e.g. $25\\%$"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 6: I Do — Worked Example: Fair Die
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 5,
      title: "I Do: Number Greater Than 4 on a Die",
      subtitle: "Teacher demonstration: calculating single-step theoretical probability step-by-step",
      prompt: "A fair 6-sided die is rolled once. Calculate the theoretical probability of rolling a number greater than 4. Express your answer as a simplified fraction, a decimal (to 3 decimal places), and a percentage (to 1 decimal place).",
      leftBlocks: [
        {
          type: "note-box",
          variant: "default",
          title: "The 4-Step Method",
          text: "1. **Sample Space ($S$):** List all outcomes and find $n(S)$.\n2. **Favourable Outcomes ($E$):** List qualifying outcomes and find $n(E)$.\n3. **Calculate Fraction:** $\\text{Pr}(E) = \\frac{n(E)}{n(S)}$ and simplify.\n4. **Convert:** Decimal and percentage equivalents."
        },
        {
          type: "note-box",
          variant: "alert",
          title: "⚠️ 'Greater than 4' vs 'At least 4'",
          text: "• *Greater than 4* means strictly $> 4$ (does NOT include 4).\n• *At least 4* means $\\ge 4$ (includes 4)."
        }
      ],
      steps: [
        {
          label: "Step 1: Write the Sample Space",
          text: "The sample space of a standard die is:\n$$S = \\{1, 2, 3, 4, 5, 6\\}$$\nTotal number of equally likely outcomes: $n(S) = 6$."
        },
        {
          label: "Step 2: Identify Favourable Outcomes",
          text: "The event is *'rolling a number greater than 4'* ($>4$).\nThe numbers strictly greater than 4 are **5** and **6**:\n$$E = \\{5, 6\\}$$\nNumber of favourable outcomes: $n(E) = 2$."
        },
        {
          label: "Step 3: Calculate Probability as a Fraction",
          text: "Apply the formula and simplify to lowest terms:\n$$\\text{Pr}(>4) = \\frac{n(E)}{n(S)} = \\frac{2}{6} = \\frac{1}{3}$$"
        },
        {
          label: "Step 4: Convert to Decimal & Percentage",
          text: "• As a decimal: $\\frac{1}{3} = 1 \\div 3 = 0.\\dot{3} \\approx 0.333$ (to 3 decimal places).\n• As a percentage: $0.\\dot{3} \\times 100\\% \\approx 33.3\\%$ (or $33\\frac{1}{3}\\%$).\n\nTherefore, $\\mathbf{\\text{Pr}(>4) = \\frac{1}{3} \\approx 0.333 \\approx 33.3\\%}$."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 7: We Do — Board Task: 1–5 Spinner
    // ------------------------------------------------------------------------
    {
      type: "board-task",
      phase: "guided",
      estimatedMinutes: 5,
      title: "We Do: Whiteboard Task — 5-Sector Spinner",
      subtitle: "Work together on your mini-whiteboards: complete the steps and hold up your board",
      studentAction: "On whiteboards: 1. Write S. 2. List odd outcomes. 3. Calculate Pr(odd) as fraction, decimal, and %.",
      prompt: "A fair circular spinner has 5 equal sectors numbered 1, 2, 3, 4, 5. Calculate the theoretical probability that the spinner lands on an odd number.",
      leftBlocks: [
        {
          type: "table",
          headers: ["Step", "Whiteboard Working Prompt", "Your Target Answer"],
          rows: [
            ["1. Sample Space", "Write $S = \\{\\dots\\}$ and find $n(S)$", "$n(S) = \\underline{\\hspace{2.5em}}$"],
            ["2. Favourable Outcomes", "List all odd numbers $\\{1, \\dots\\}$", "$n(\\text{odd}) = \\underline{\\hspace{2.5em}}$"],
            ["3. Probability (Fraction)", "$\\text{Pr}(\\text{odd}) = \\frac{n(E)}{n(S)}$", "$\\text{Pr}(\\text{odd}) = \\underline{\\hspace{2.5em}}$"],
            ["4. Decimal & %", "Convert fraction to decimal and $\%$", "$0.\\underline{\\hspace{1.5em}} = \\underline{\\hspace{2em}}\\%$"]
          ]
        }
      ],
      notes: [
        {
          type: "note-box",
          variant: "gold",
          title: "Teacher Checkpoint",
          text: "Check boards: Did students identify that 1, 3, and 5 are odd? (3 outcomes). Verify that $\\frac{3}{5} = 0.6 = 60\\%$."
        }
      ],
      solution: [
        {
          type: "paragraph",
          text: "1. **Sample Space:** $S = \\{1, 2, 3, 4, 5\\} \\implies n(S) = 5$ equally likely sectors.\n2. **Favourable Outcomes:** Odd numbers are $\\{1, 3, 5\\} \\implies n(\\text{odd}) = 3$.\n3. **Probability as a Fraction:** $\\text{Pr}(\\text{odd}) = \\frac{3}{5}$.\n4. **Decimal and Percentage:** $\\frac{3}{5} = 0.6 = 60\\%$."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 8: You Do — Practice: Four-Sided Die
    // ------------------------------------------------------------------------
    {
      type: "practice",
      phase: "independent",
      estimatedMinutes: 6,
      timerMinutes: 5,
      title: "You Do: Four-Sided Die (Tetrahedron)",
      subtitle: "Solve these three calculations in your workbook (5-minute timer)",
      tasks: [
        {
          title: "Task 1: Pr(3)",
          prompt: "A fair 4-sided die with faces numbered {1, 2, 3, 4} is rolled once. Find the theoretical probability of rolling a 3, $\\text{Pr}(3)$, as a fraction.",
          solution: [
            {
              type: "paragraph",
              text: "• Sample space $S = \\{1, 2, 3, 4\\} \\implies n(S) = 4$.\n• Favourable outcome: $\\{3\\} \\implies n(3) = 1$.\n• $\\mathbf{\\text{Pr}(3) = \\frac{1}{4}}$ (or $0.25$, $25\\%$)."
            }
          ]
        },
        {
          title: "Task 2: Pr(odd) as a Decimal",
          prompt: "Find the probability of rolling an odd number on the 4-sided die, $\\text{Pr}(\\text{odd})$, and express your final answer as a decimal.",
          solution: [
            {
              type: "paragraph",
              text: "• Odd numbers in $\\{1, 2, 3, 4\\}$ are $\\{1, 3\\} \\implies n(\\text{odd}) = 2$.\n• Fraction: $\\text{Pr}(\\text{odd}) = \\frac{2}{4} = \\frac{1}{2}$.\n• Decimal: $\\mathbf{0.5}$ (or $50\\%$)."
            }
          ]
        },
        {
          title: "Task 3: Pr(greater than 1)",
          prompt: "Find the probability of rolling a number strictly greater than 1, $\\text{Pr}(>1)$. Express as a fraction and a percentage.",
          solution: [
            {
              type: "paragraph",
              text: "• Numbers strictly greater than 1 are $\\{2, 3, 4\\} \\implies n(>1) = 3$.\n• Fraction: $\\mathbf{\\frac{3}{4}}$.\n• Percentage: $\\mathbf{75\\%}$ (or $0.75$)."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 9: Key Notes — Complementary Events
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 5,
      title: "Complementary Events: Not Happening",
      subtitle: "Copy these definitions and the complement formula into your workbook",
      columns: [
        {
          width: "half",
          title: "1. What is a Complementary Event?",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "default",
              title: "Definition of Complement",
              text: "• The **complement** of an event $A$ is the event that $A$ does **not** occur.\n• Written as **$\\text{not } A$** or **$A'$** (pronounced *'A prime'*).\n• Together, $A$ and $\\text{not } A$ contain **all** possible outcomes in the entire sample space."
            },
            {
              type: "note-box",
              variant: "green",
              title: "Example: Die Roll",
              text: "• If event $A = \\text{rolling a 6} = \\{6\\}$:\n• Then $\\text{not } A = \\text{not rolling a 6} = \\{1, 2, 3, 4, 5\\}$."
            }
          ]
        },
        {
          width: "half",
          title: "2. The Complement Rule",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "gold",
              title: "The Complement Rule Formula",
              text: "Because an event must either happen or not happen, the sum of their probabilities is always $1$ ($100\\%$):\n\n$$\\text{Pr}(A) + \\text{Pr}(\\text{not } A) = 1$$\n\nRearranging to find the probability of the complement:\n\n$$\\mathbf{\\text{Pr}(\\text{not } A) = 1 - \\text{Pr}(A)}$$"
            },
            {
              type: "note-box",
              variant: "alert",
              title: "Why is this useful?",
              text: "Often, calculating $\\text{Pr}(\\text{not } A)$ directly would require listing dozens of outcomes. Calculating $1 - \\text{Pr}(A)$ takes just one quick subtraction!"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 10: I Do — Worked Example: Playing Cards & Complement
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 5,
      title: "I Do: Complementary Events with Playing Cards",
      subtitle: "Teacher demonstration: using Pr(not A) = 1 - Pr(A) to solve card problems",
      prompt: "A standard deck of 52 playing cards has 4 suits (Hearts, Diamonds, Clubs, Spades) of 13 cards each. Face cards are Jacks, Queens, and Kings (3 in each suit, so 12 in total). A single card is drawn at random.\na) Find the probability of drawing a face card, $\\text{Pr}(\\text{Face card})$.\nb) Use the complement rule to find the probability of NOT drawing a face card.",
      leftBlocks: [
        {
          type: "note-box",
          variant: "default",
          title: "Standard 52-Card Deck Facts",
          text: "• Total cards: $n(S) = 52$\n• 4 suits of 13 cards: 26 Red (Hearts $\\heartsuit$, Diamonds $\\diamondsuit$), 26 Black (Clubs $\\clubsuit$, Spades $\\spadesuit$)\n• Face cards: $4 \\times 3 = 12$ cards (Jacks, Queens, Kings)\n• Non-face cards: $52 - 12 = 40$ cards (Aces and numbers 2 to 10)"
        }
      ],
      steps: [
        {
          label: "Step 1: Calculate Pr(Face Card)",
          text: "There are 12 face cards in a pack of 52:\n$$\\text{Pr}(\\text{Face card}) = \\frac{n(\\text{Face})}{n(S)} = \\frac{12}{52}$$\nDivide numerator and denominator by 4 to simplify:\n$$\\text{Pr}(\\text{Face card}) = \\frac{3}{13}$$"
        },
        {
          label: "Step 2: Apply the Complement Rule",
          text: "NOT drawing a face card is the complement of drawing a face card:\n$$\\text{Pr}(\\text{Not face card}) = 1 - \\text{Pr}(\\text{Face card})$$\nSubstitute $\\text{Pr}(\\text{Face card}) = \\frac{3}{13}$:\n$$\\text{Pr}(\\text{Not face card}) = 1 - \\frac{3}{13} = \\frac{13}{13} - \\frac{3}{13} = \\frac{10}{13}$$"
        },
        {
          label: "Step 3: Verification (Direct Count)",
          text: "Let's check by counting non-face cards directly:\n$52 - 12 = 40$ non-face cards.\n$$\\frac{40}{52} = \\frac{40 \\div 4}{52 \\div 4} = \\frac{10}{13} \\quad \\checkmark$$\nBoth methods give the exact same answer: $\\frac{10}{13} \\approx 0.769$ ($76.9\\%$)."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 11: We Do — Board Task: Letters in 'MATHEMATICS'
    // ------------------------------------------------------------------------
    {
      type: "board-task",
      phase: "guided",
      estimatedMinutes: 5,
      title: "We Do: Word Challenge — Letters in 'MATHEMATICS'",
      subtitle: "On your mini-whiteboards: find the probability of choosing vowels and consonants",
      studentAction: "On whiteboards: count total letters, count vowels, find Pr(vowel) and Pr(consonant) using complement.",
      prompt: "The 11 letters of the word $\\mathbf{M\\;A\\;T\\;H\\;E\\;M\\;A\\;T\\;I\\;C\\;S}$ are written on separate identical cards and placed into a bag. One card is drawn at random.\na) Find $\\text{Pr}(\\text{Vowel})$.\nb) Use the complement rule to find $\\text{Pr}(\\text{Consonant})$.",
      leftBlocks: [
        {
          type: "raw-data",
          data: "M   A   T   H   E   M   A   T   I   C   S   (Total = 11 letters)"
        },
        {
          type: "table",
          headers: ["Target Question", "Whiteboard Working Prompt", "Your Answer"],
          rows: [
            ["Total letters $n(S)$", "Count all letters in MATHEMATICS", "$n(S) = \\underline{\\hspace{2em}}$"],
            ["Vowels", "List vowels (A, E, I, O, U)", "Vowels = $\\{\\underline{\\hspace{4em}}\\}$"],
            ["$\\text{Pr}(\\text{Vowel})$", "$\\frac{n(\\text{Vowels})}{n(S)}$", "$\\text{Pr}(\\text{Vowel}) = \\underline{\\hspace{2.5em}}$"],
            ["$\\text{Pr}(\\text{Consonant})$", "$1 - \\text{Pr}(\\text{Vowel})$", "$\\text{Pr}(\\text{Consonant}) = \\underline{\\hspace{2.5em}}$"]
          ]
        }
      ],
      notes: [
        {
          type: "note-box",
          variant: "gold",
          title: "Teacher Checkpoint",
          text: "Ensure students count both 'A's! Vowels are A, E, A, I (4 vowels). Consonants are 11 - 4 = 7 consonants. Verify $1 - \\frac{4}{11} = \\frac{7}{11}$."
        }
      ],
      solution: [
        {
          type: "paragraph",
          text: "1. **Total outcomes:** $n(S) = 11$.\n2. **Vowels:** $\\{A, E, A, I\\} \\implies n(\\text{Vowel}) = 4$.\n   $$\\mathbf{\\text{Pr}(\\text{Vowel}) = \\frac{4}{11}} \\approx 0.364 \\; (36.4\\%)$$\n3. **Consonants (Complement):** Since every letter is either a vowel or a consonant:\n   $$\\mathbf{\\text{Pr}(\\text{Consonant})} = 1 - \\text{Pr}(\\text{Vowel}) = 1 - \\frac{4}{11} = \\mathbf{\\frac{7}{11}} \\approx 0.636 \\; (63.6\\%)$$\n   *(Direct check: M, T, H, M, T, C, S = 7 consonants. $\\frac{7}{11} \\; \\checkmark$)*"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 12: You Do — Independent Practice: Workbook Problems
    // ------------------------------------------------------------------------
    {
      type: "practice",
      phase: "independent",
      estimatedMinutes: 12,
      timerMinutes: 10,
      title: "You Do: Independent Practice",
      subtitle: "Work through these three problems in your workbook (10-minute timer). Full working required.",
      tasks: [
        {
          title: "Task 1: 8-Sided Die (Octahedron)",
          prompt: "A fair 8-sided die with faces numbered 1 to 8 is rolled once. Find the theoretical probability of each event as a simplified fraction:\na) Rolling a 5: $\\text{Pr}(5)$\nb) Rolling an even number: $\\text{Pr}(\\text{even})$\nc) Rolling a multiple of 3: $\\text{Pr}(\\text{multiple of 3})$\nd) Rolling a number less than 1: $\\text{Pr}(<1)$",
          solution: [
            {
              type: "paragraph",
              text: "Sample space $S = \\{1, 2, 3, 4, 5, 6, 7, 8\\} \\implies n(S) = 8$.\na) $\\text{Pr}(5) = \\mathbf{\\frac{1}{8}}$\nb) Even numbers $\\{2, 4, 6, 8\\} \\implies \\text{Pr}(\\text{even}) = \\frac{4}{8} = \\mathbf{\\frac{1}{2}}$\nc) Multiples of 3 are $\\{3, 6\\} \\implies \\text{Pr}(\\text{mult of 3}) = \\frac{2}{8} = \\mathbf{\\frac{1}{4}}$\nd) Numbers less than 1: none $\\implies \\text{Pr}(<1) = \\frac{0}{8} = \\mathbf{0}$ (Impossible)"
            }
          ]
        },
        {
          title: "Task 2: Marble Bag & Complement",
          prompt: "A bag contains 5 red, 3 green, and 2 blue marbles (total 10 marbles). A marble is selected at random.\na) Find $\\text{Pr}(\\text{Red})$ as a fraction and a decimal.\nb) Find $\\text{Pr}(\\text{Green})$ as a fraction and a percentage.\nc) Use the complement rule to find $\\text{Pr}(\\text{Not Red})$.",
          solution: [
            {
              type: "paragraph",
              text: "Total marbles = $5 + 3 + 2 = 10$.\na) $\\text{Pr}(\\text{Red}) = \\frac{5}{10} = \\mathbf{\\frac{1}{2} = 0.5}$\nb) $\\text{Pr}(\\text{Green}) = \\frac{3}{10} = \\mathbf{30\\%}$\nc) $\\text{Pr}(\\text{Not Red}) = 1 - \\text{Pr}(\\text{Red}) = 1 - \\frac{1}{2} = \\mathbf{\\frac{1}{2} = 0.5}$ (or $50\\%$)"
            }
          ]
        },
        {
          title: "Task 3: Working Backwards (Problem Solving)",
          prompt: "A bag contains 24 coloured tokens. The theoretical probability of randomly picking a yellow token is $\\frac{3}{8}$.\na) How many yellow tokens are in the bag?\nb) What is the probability of NOT picking a yellow token?",
          solution: [
            {
              type: "paragraph",
              text: "a) $\\text{Number of yellow tokens} = \\frac{3}{8} \\times 24 = 3 \\times 3 = \\mathbf{9 \\text{ yellow tokens}}$.\nb) $\\text{Pr}(\\text{Not Yellow}) = 1 - \\frac{3}{8} = \\mathbf{\\frac{5}{8}}$ (or $\\frac{15}{24}$ tokens)."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 13: Comparison / Misconception — Theoretical vs Experimental
    // ------------------------------------------------------------------------
    {
      type: "comparison",
      phase: "explicit",
      estimatedMinutes: 5,
      title: "Theoretical vs Experimental Probability",
      subtitle: "Why mathematical calculation and real-world trials don't always match immediately",
      columns: [
        {
          title: "Theoretical Probability",
          blocks: [
            {
              type: "note-box",
              variant: "default",
              title: "What SHOULD Happen (Math)",
              text: "• Based on mathematical deduction assuming equally likely outcomes.\n• Does **not** require conducting an experiment.\n• Formula: $\\text{Pr}(E) = \\frac{n(E)}{n(S)}$.\n• *Example:* Tossing a coin: $\\text{Pr}(\\text{Heads}) = 0.5$ ($50\\%$). Always exactly $0.5$."
            },
            {
              type: "note-box",
              variant: "gold",
              title: "Fixed & Unchanging",
              text: "The theoretical probability never changes regardless of how many times you toss the coin."
            }
          ]
        },
        {
          title: "Experimental Probability (Relative Frequency)",
          blocks: [
            {
              type: "note-box",
              variant: "green",
              title: "What ACTUALLY Happened (Trials)",
              text: "• Based on data collected from real trials.\n• Formula: $\\frac{\\text{favourable trials}}{\\text{total trials conducted}}$.\n• *Example:* If you toss a coin 10 times and get 7 Heads, the experimental probability is $\\frac{7}{10} = 0.7$."
            },
            {
              type: "note-box",
              variant: "alert",
              title: "The Law of Large Numbers",
              text: "In a small number of trials (e.g. 10 tosses), experimental results vary due to chance.\nAs the number of trials becomes **very large** (e.g. 10,000 tosses), the experimental probability gets closer and closer to the theoretical probability!"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 14: Exit Ticket — Formative Assessment
    // ------------------------------------------------------------------------
    {
      type: "exit-ticket",
      phase: "assessment",
      estimatedMinutes: 5,
      title: "Exit Ticket: Formative Assessment",
      subtitle: "Answer both questions in your workbook to demonstrate today's success criteria",
      questions: [
        {
          prompt: "A 10-sided die numbered 1 to 10 is rolled once. Find the theoretical probability of rolling a prime number. Express your answer as a simplified fraction, a decimal, and a percentage.",
          solution: [
            {
              type: "paragraph",
              text: "• Sample space $S = \\{1, 2, 3, 4, 5, 6, 7, 8, 9, 10\\} \\implies n(S) = 10$.\n• Prime numbers in this range are $\\{2, 3, 5, 7\\}$ (note: 1 is not prime!).\n• Number of favourable outcomes: $n(\\text{prime}) = 4$.\n• Fraction: $\\frac{4}{10} = \\mathbf{\\frac{2}{5}}$.\n• Decimal: $\\mathbf{0.4}$.\n• Percentage: $\\mathbf{40\\%}$."
            }
          ]
        },
        {
          prompt: "The theoretical probability that a randomly chosen raffle ticket wins a prize is $\\frac{3}{20}$. What is the probability that the ticket does NOT win a prize? Show your working using the complement rule.",
          solution: [
            {
              type: "paragraph",
              text: "Using the complement rule:\n$$\\text{Pr}(\\text{Not win}) = 1 - \\text{Pr}(\\text{Win}) = 1 - \\frac{3}{20} = \\frac{20}{20} - \\frac{3}{20} = \\mathbf{\\frac{17}{20}}$$\n(As a decimal: $0.85$, or $85\\%$)."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 15: Lesson Summary & Checklist
    // ------------------------------------------------------------------------
    {
      type: "summary",
      phase: "assessment",
      estimatedMinutes: 2,
      title: "Lesson Summary: 8H Theoretical Probability",
      takeaways: [
        "The sample space ($S$) is the set of all possible outcomes; favourable outcomes ($E$) satisfy the given condition.",
        "Theoretical probability formula: $\\text{Pr}(E) = \\frac{n(E)}{n(S)}$ when all outcomes are equally likely.",
        "Probabilities always range from 0 to 1 ($0 \\le \\text{Pr} \\le 1$), where 0 is impossible and 1 is certain.",
        "Probabilities can be represented interchangeably as simplified fractions, decimals ($0$ to $1$), or percentages ($0\\%$ to $100\\%$).",
        "The complement rule: $\\text{Pr}(\\text{not } E) = 1 - \\text{Pr}(E)$ because the sum of complementary probabilities is always $1$.",
        "Next Lesson: 8I – Experimental Probability and Relative Frequency, where we collect empirical trial data and test the Law of Large Numbers!"
      ]
    }
  ]
};
