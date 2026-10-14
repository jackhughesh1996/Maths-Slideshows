/**
 * @file 8I.js
 * Year 7 Mathematics: Lesson 8I — Experimental Probability in Single-Step Experiments
 * Chapter: Statistics and Probability
 * Pacing: 60-minute lesson designed around tight I Do -> We Do -> You Do model.
 * First student independent task commences at 21 minutes (Slide 9: You Do).
 * Substantive independent textbook practice commences at Slide 13 (20-minute allocation).
 */

export default {
  id: "8I",
  title: "Experimental Probability in Single-Step Experiments",
  subject: "Mathematics",
  yearLevel: 7,
  unit: "Chapter 8",
  folder: "Statistics and Probability",
  chapter: "Statistics and Probability",
  topics: [
    "Experimental Probability",
    "Relative Frequency",
    "Theoretical vs Experimental",
    "Expected Occurrences",
    "Sample Size & More Trials",
    "Law of Large Numbers",
    "Chance Variation"
  ],
  slides: [
    // ------------------------------------------------------------------------
    // SLIDE 1: Title
    // ------------------------------------------------------------------------
    {
      type: "title",
      phase: "opening",
      estimatedMinutes: 1,
      title: "Experimental Probability",
      subtitle: "In Single-Step Experiments",
      overview: "“A fair coin has a theoretical probability of 1/2 of heads. Will exactly half our tosses land heads?” In this lesson, we test theoretical models with real experimental data and explore how sample size affects probability estimates.",
      topics: [
        "Theoretical probability vs Experimental probability",
        "Relative frequency: $\\text{Experimental Pr}(E) = \\frac{\\text{frequency of } E}{\\text{total trials}}$",
        "Expected occurrences: $\\text{Expected} = \\text{Pr} \\times \\text{trials}$",
        "How the number of trials affects probability estimates",
        "Chance variation and why expected does not mean guaranteed"
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
      learningIntention: "To calculate experimental probabilities and expected numbers of occurrences, and explain how the number of trials affects probability estimates.",
      successCriteria: [
        "I can use experiment results to calculate probabilities, predict expected numbers of occurrences, and explain why results can differ from theoretical probabilities."
      ],
      keyPrinciple: "Theoretical probability models what *should* happen in theory; experimental probability calculates what *did* happen from observed data."
    },

    // ------------------------------------------------------------------------
    // SLIDE 3: Do Now: Flipping Coins (Class Simulation)
    // ------------------------------------------------------------------------
    {
      type: "do-now",
      phase: "opening",
      estimatedMinutes: 5,
      title: "Do Now: Flipping Coins",
      subtitle: "Simulate each student tossing a fair coin 20 times. Spacebar reveals questions and answers.",
      questions: [
        {
          prompt: "Before running: What is the expected number of heads for one student tossing a fair coin 20 times?",
          answer: "$10$ heads ($\\text{Expected} = \\frac{1}{2} \\times 20 = 10$ heads)."
        },
        {
          prompt: "Before running: Must everyone in the class get the exact same result (10 heads)?",
          answer: "No. Individual results vary naturally by chance around 10 (e.g. 7, 9, 11, 14 heads)."
        },
        {
          prompt: "Before running: For a class of $n$ students (each tossing 20 times), what is the expected total number of heads?",
          answer: "$10n$ heads ($\\text{Expected} = \\frac{1}{2} \\times 20n = 10n$). For example, for $25$ students ($500$ tosses), expected heads is $10 \\times 25 = 250$."
        },
        {
          prompt: "After running: Total heads, total tosses, fraction landing heads, and how close to 1/2?",
          answer: "Check the pooled class summary box for your observed heads, total tosses, fraction, and distance from $50\\%$. Ask students: Is your class percentage close to $\\frac{1}{2}$? Why did individual students vary more than the pooled class?"
        }
      ],
      sidebarNotes: [
        {
          type: "simulation",
          simType: "coin-class",
          title: "Classroom Coin Toss Simulation",
          trialsPerStudent: 20,
          defaultClassSize: 25
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 4: Discuss the Experiment
    // ------------------------------------------------------------------------
    {
      type: "board-task",
      phase: "explicit",
      estimatedMinutes: 2,
      title: "Discussing the Class Experiment",
      subtitle: "Comparing individual student variation with pooled classroom results",
      studentAction: "Reflect: Why does pooling results give an estimate closer to 1/2 than individual tosses?",
      prompt: "Let us examine our class coin tossing experiment using theoretical expectations:",
      workspaceContent: [
        {
          type: "bullet-list",
          items: [
            "**Expected heads per student:** $\\frac{1}{2} \\times 20 = 10$ heads.",
            "**For $n$ students:** Total trials = $20n$; Expected heads = $10n$. (For 25 students: $20 \\times 25 = 500$ trials, expecting $250$ heads).",
            "**“Expected does not mean guaranteed.”** Individual students obtained counts above and below 10 because random events vary naturally.",
            "**“Pooling results gives more trials, so the fraction of heads is more likely to be close to 1/2.”** Larger sample sizes smooth out individual chance fluctuations."
          ]
        }
      ],
      rightBlocks: [
        {
          type: "simulation",
          simType: "coin-summary",
          title: "Actual Pooled Class Results"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 5: Copyable Notes
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 2,
      title: "Key Definitions: Theoretical vs Experimental Probability",
      subtitle: "Copy these core rules and formulas into your workbook",
      columns: [
        {
          width: "half",
          title: "Theoretical vs Experimental",
          blocks: [
            {
              type: "note-box",
              variant: "default",
              copyToWorkbook: true,
              title: "Core Definitions",
              text: "• **Theoretical probability** uses a mathematical model of possible outcomes (e.g. symmetry of a fair coin or die) *before* any experiment takes place.\n• **Experimental probability** (also called *relative frequency*) uses **observed results** from an actual experiment.\n• A **trial** is one single repetition of an experiment."
            }
          ]
        },
        {
          width: "half",
          title: "The Experimental Probability Formula",
          blocks: [
            {
              type: "note-box",
              variant: "gold",
              copyToWorkbook: true,
              title: "Formula & Format",
              text: "$$\\text{Experimental Probability} = \\frac{\\text{Frequency of event}}{\\text{Total number of trials}}$$\n\n• Answers may be written as **fractions** (simplified), **decimals**, or **percentages**.\n• Example: 13 heads out of 20 tosses = $\\frac{13}{20} = 0.65 = 65\\%$."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 6: I Do: Calculating Experimental Probability
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 3,
      title: "I Do: Calculating Experimental Probability",
      subtitle: "20 coin tosses produce 13 heads and 7 tails",
      prompt: "A coin is tossed 20 times. The coin lands on Heads 13 times and on Tails 7 times. Calculate the experimental probability of Heads as a fraction, decimal, and percentage, and compare your result with the theoretical probability.",
      data: "Heads (f) = 13 | Tails (f) = 7 | Total trials (n) = 20",
      leftBlocks: [
        {
          type: "note-box",
          variant: "gold",
          title: "Teacher Guidance",
          text: "Notice that our experimental result is 65%, whereas the theoretical model is 50%.\nDoes a result of 65% in 20 tosses prove the coin is biased? No! Small samples vary."
        }
      ],
      steps: [
        {
          label: "Identify frequency and total trials",
          text: "• Frequency of Heads: $f = 13$\n• Total number of trials: $n = 13 + 7 = 20$"
        },
        {
          label: "Apply the experimental probability formula",
          latex: "\\text{Experimental Pr}(\\text{Heads}) = \\frac{\\text{Frequency of Heads}}{\\text{Total Trials}} = \\frac{13}{20}"
        },
        {
          label: "Convert to decimal and percentage",
          text: "• Decimal: $13 \\div 20 = 0.65$\n• Percentage: $0.65 \\times 100\\% = 65\\%$"
        },
        {
          label: "Compare with theoretical probability",
          text: "The theoretical probability of a fair coin is $\\text{Pr}(\\text{Heads}) = \\frac{1}{2} = 50\\%$.\nShort experiments (small number of trials like 20) can differ substantially from theoretical expectations due to natural chance variation."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 7: We Do: Die Results
    // ------------------------------------------------------------------------
    {
      type: "board-task",
      phase: "guided",
      estimatedMinutes: 3,
      title: "We Do: Calculating Die Probabilities From Trials",
      subtitle: "An ordinary six-sided die is rolled 8 times",
      studentAction: "On whiteboards: calculate experimental Pr(3) and Pr(even) as fractions and percentages.",
      prompt: "A six-sided die was rolled 8 times with the following sequence of results recorded:",
      data: "1,  4,  3,  6,  6,  2,  4,  3",
      separateSolutions: true,
      leftBlocks: [
        {
          type: "note-box",
          variant: "alert",
          title: "⚠️ Crucial Denominator Rule",
          text: "The denominator is **8** because 8 **trials** were conducted.\nIt is **NOT 6** (the number of faces on the die)! In experimental probability, always divide by total trials completed."
        },
        {
          type: "table",
          compact: true,
          headers: [
            "Roll #",
            "Outcome",
            { text: "Part (a): Is it 3?", reveal: true, revealStep: 1 },
            { text: "Part (b): Is it Even?", reveal: true, revealStep: 2 }
          ],
          rows: [
            ["Roll 1", "1", { text: "No", reveal: true, revealStep: 1 }, { text: "No", reveal: true, revealStep: 2 }],
            ["Roll 2", "4", { text: "No", reveal: true, revealStep: 1 }, { text: "Yes ✔ (4)", reveal: true, revealStep: 2 }],
            ["Roll 3", "3", { text: "Yes ✔ (3)", reveal: true, revealStep: 1 }, { text: "No", reveal: true, revealStep: 2 }],
            ["Roll 4", "6", { text: "No", reveal: true, revealStep: 1 }, { text: "Yes ✔ (6)", reveal: true, revealStep: 2 }],
            ["Roll 5", "6", { text: "No", reveal: true, revealStep: 1 }, { text: "Yes ✔ (6)", reveal: true, revealStep: 2 }],
            ["Roll 6", "2", { text: "No", reveal: true, revealStep: 1 }, { text: "Yes ✔ (2)", reveal: true, revealStep: 2 }],
            ["Roll 7", "4", { text: "No", reveal: true, revealStep: 1 }, { text: "Yes ✔ (4)", reveal: true, revealStep: 2 }],
            ["Roll 8", "3", { text: "Yes ✔ (3)", reveal: true, revealStep: 1 }, { text: "No", reveal: true, revealStep: 2 }]
          ]
        }
      ],
      solution: [
        {
          type: "paragraph",
          badgeTitle: "Part (a): Experimental Pr(3)",
          revealStep: 1,
          text: "**(a) Experimental $\\text{Pr}(3)$:**\nOutcome 3 appeared 2 times (Roll 3 and Roll 8) out of 8 rolls.\n$$\\text{Pr}(3) = \\frac{\\text{Frequency of 3}}{\\text{Total Trials}} = \\frac{2}{8} = \\frac{1}{4} = 0.25 = 25\\%$$"
        },
        {
          type: "paragraph",
          badgeTitle: "Part (b): Experimental Pr(even)",
          revealStep: 2,
          text: "**(b) Experimental $\\text{Pr}(\\text{even})$:**\nEven outcomes (2, 4, 6) appeared 5 times (Rolls 2, 4, 5, 6, 7) out of 8 rolls.\n$$\\text{Pr}(\\text{even}) = \\frac{\\text{Frequency of even}}{\\text{Total Trials}} = \\frac{5}{8} = 0.625 = 62.5\\%$$"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 8: Notes and I Do: Expected Occurrences
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 3,
      title: "Notes & I Do: Expected Number of Occurrences",
      subtitle: "Predicting occurrences using probability and number of trials",
      leftBlocks: [
        {
          type: "note-box",
          variant: "default",
          copyToWorkbook: true,
          title: "Expected Occurrences Formula",
          text: "$$\\text{Expected Occurrences} = \\text{Probability} \\times \\text{Number of Trials}$$\n$$E = \\text{Pr} \\times n$$\n\n• **“Expected is a prediction, not a guarantee.”** We predict what should happen on average, but chance means actual results can vary."
        }
      ],
      prompt: "A fair six-sided die is rolled 120 times. Calculate the expected number of times that a 6 will be rolled.",
      data: "Fair die: Pr(6) = 1/6 | Number of trials (n) = 120",
      steps: [
        {
          label: "Identify the probability and number of trials",
          text: "• Theoretical probability of rolling a 6: $\\text{Pr}(6) = \\frac{1}{6}$\n• Number of trials: $n = 120$"
        },
        {
          label: "Multiply probability by number of trials",
          latex: "\\text{Expected sixes} = \\frac{1}{6} \\times 120 = \\frac{120}{6} = 20"
        },
        {
          label: "Interpret the prediction",
          text: "We predict around **20 sixes** in 120 rolls.\nHowever, rolling 120 times in real life might produce 18, 22, or 25 sixes. Expected is a prediction, not a guarantee."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 9: You Do: Unknown Spinner Experiment (First Independent Task)
    // Pacing milestone: Starts at 21 minutes
    // ------------------------------------------------------------------------
    {
      type: "practice",
      phase: "independent",
      estimatedMinutes: 4,
      title: "You Do: Unknown Spinner Experiment",
      subtitle: "Attempt these problems independently in your workbook before answers are revealed",
      tasks: [
        {
          title: "Task 1: Experimental Pr(Red)",
          prompt: "Find the experimental probability of landing on Red as a fraction and a percentage.",
          blocks: [
            {
              type: "table",
              headers: ["Color", "Frequency ($f$)", "Fraction of 40"],
              rows: [
                ["Red", "18", "$\\frac{18}{40}$"],
                ["Blue", "14", "$\\frac{14}{40}$"],
                ["Green", "8", "$\\frac{8}{40}$"],
                ["Total", "40", "$\\frac{40}{40} = 1$"]
              ]
            }
          ],
          solution: [
            {
              type: "paragraph",
              text: "$$\\text{Pr}(\\text{Red}) = \\frac{18}{40} = \\frac{9}{20} = 0.45 = 45\\%$$"
            }
          ]
        },
        {
          title: "Task 2: Experimental Pr(not Green)",
          prompt: "Find the experimental probability of NOT landing on Green as a percentage.",
          solution: [
            {
              type: "paragraph",
              text: "Favourable outcomes = $\\text{Red} + \\text{Blue} = 18 + 14 = 32$ (or $40 - 8 = 32$).\n$$\\text{Pr}(\\text{not Green}) = \\frac{32}{40} = \\frac{4}{5} = 0.80 = 80\\%$$"
            }
          ]
        },
        {
          title: "Task 3: Predicted Blue in 200 Further Spins",
          prompt: "Predict the number of times Blue will occur in 200 further spins. Why might actual results differ?",
          solution: [
            {
              type: "paragraph",
              text: "$$\\text{Expected Blue} = \\text{Pr}(\\text{Blue}) \\times n = \\frac{14}{40} \\times 200 = 0.35 \\times 200 = 70$$\n**Why actual results differ:** 70 is an expected prediction, not a guarantee. Random variation occurs in any chance experiment, so future spins might produce 68, 72, or 65 blues."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 10: We Do: Prediction Comparison
    // ------------------------------------------------------------------------
    {
      type: "board-task",
      phase: "guided",
      estimatedMinutes: 3,
      title: "We Do: Comparing Experimental vs Theoretical Predictions",
      subtitle: "Predicting threes in 80 further rolls using two different probability sources",
      studentAction: "On whiteboards: calculate predicted threes using (a) experimental and (b) theoretical probabilities.",
      prompt: "Suppose you roll the die 80 further times. Predict the number of threes rolled using:\n(a) Our experimental result from Slide 7 ($\\text{Pr}(3) = \\frac{1}{4}$)\n(b) The theoretical model of a fair die ($\\text{Pr}(3) = \\frac{1}{6}$)",
      leftBlocks: [
        {
          type: "table",
          headers: ["Probability Source", "Probability Value", "Prediction Formula for 80 Rolls"],
          rows: [
            ["Experimental (Slide 7)", "$\\text{Pr}(3) = \\frac{1}{4} = 0.25$", "$\\frac{1}{4} \\times 80$"],
            ["Theoretical (Fair Die)", "$\\text{Pr}(3) = \\frac{1}{6} \\approx 0.167$", "$\\frac{1}{6} \\times 80$"]
          ]
        },
        {
          type: "note-box",
          variant: "gold",
          title: "📌 Non-Integer Expectations",
          text: "Expected counts can be non-integers (decimals)! E.g. $13.3$ represents the long-run average per 80 rolls over many repeated sets of rolls."
        }
      ],
      solution: [
        {
          type: "paragraph",
          text: "**(a) Experimental Prediction:**\n$$\\text{Expected threes} = \\frac{1}{4} \\times 80 = 20 \\text{ threes}$$"
        },
        {
          type: "paragraph",
          text: "**(b) Theoretical Prediction:**\n$$\\text{Expected threes} = \\frac{1}{6} \\times 80 = \\frac{80}{6} = 13.\\dot{3} \\approx 13.3 \\text{ threes}$$"
        },
        {
          type: "paragraph",
          text: "**Comparison:** The experimental prediction (20) is higher than the theoretical prediction (13.3) because our small initial sample of 8 rolls happened to produce threes more frequently than average ($25\\%$ vs $16.7\\%$)."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 11: Cumulative Graph Simulation
    // ------------------------------------------------------------------------
    {
      type: "board-task",
      phase: "guided",
      estimatedMinutes: 3,
      title: "Simulation: The Effect of More Trials",
      subtitle: "Adding 10, 100, or 1000 tosses to observe cumulative relative frequency",
      studentAction: "Watch the graph: Does the cumulative probability line settle closer to 0.5 as trials increase?",
      prompt: "We reuse our class coin results and add more tosses to observe how experimental probability behaves over large numbers of trials:",
      workspaceContent: [
        {
          type: "simulation",
          simType: "coin-cumulative",
          title: "Cumulative Experimental Probability Graph"
        }
      ],
      notes: [
        {
          type: "note-box",
          variant: "gold",
          title: "Teacher Checkpoint",
          text: "Notice: More trials tend to improve estimates, but the graph does NOT move steadily closer or equal exactly 0.5 on every single toss."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 12: Basketball Simulation
    // ------------------------------------------------------------------------
    {
      type: "board-task",
      phase: "guided",
      estimatedMinutes: 3,
      title: "Simulation: Basketball Free-Throw Experiment",
      subtitle: "Using a 6-sided die to model shots: 1–4 = SCORE, 5–6 = MISS",
      studentAction: "On whiteboards: calculate theoretical Pr(score) and expected scores in 60 attempts.",
      prompt: "A basketball player simulates free-throw attempts using a fair 6-sided die. Rolling 1, 2, 3, or 4 scores a basket; rolling 5 or 6 is a miss.",
      workspaceContent: [
        {
          type: "simulation",
          simType: "basketball",
          title: "Interactive Free-Throw Simulation"
        }
      ],
      separateSolutions: true,
      solution: [
        {
          type: "paragraph",
          badgeTitle: "Part (a): Theoretical Pr(Score)",
          revealStep: 1,
          text: "**Theoretical $\\text{Pr}(\\text{Score})$:**\n4 scoring faces (1, 2, 3, 4) out of 6 possible faces on a fair die.\n$$\\text{Pr}(\\text{Score}) = \\frac{4}{6} = \\frac{2}{3} \\approx 66.7\\%$$"
        },
        {
          type: "paragraph",
          badgeTitle: "Part (b): Expected Scores in 60 Attempts",
          revealStep: 2,
          text: "**Expected scores in 60 attempts:**\n$$\\text{Expected scores} = \\text{Pr}(\\text{Score}) \\times n = \\frac{2}{3} \\times 60 = 40 \\text{ scores}$$"
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 13: Textbook Practice (Exercise 8I)
    // ------------------------------------------------------------------------
    {
      type: "practice",
      phase: "independent",
      estimatedMinutes: 20,
      timerMinutes: 20,
      title: "Independent Practice: Exercise 8I",
      subtitle: "Complete questions in your exercise book (20-minute timer)",
      tasks: [
        {
          title: "Supported Pathway",
          prompt: "Exercise 8I: Q1, Q3(a–b), Q4(a–b)",
          blocks: [
            {
              type: "bullet-list",
              items: [
                "**Q1:** Probabilities and predictions from spinner results.",
                "**Q3(a–b):** Expected coin results and sample size.",
                "**Q4(a–b):** Expected die results and chance variation."
              ]
            }
          ]
        },
        {
          title: "Core Pathway",
          prompt: "Exercise 8I: Q1, Q2, Q3, Q4, Q6",
          blocks: [
            {
              type: "bullet-list",
              items: [
                "**Q1:** Probabilities and predictions from spinner results.",
                "**Q2:** Probabilities from television-viewing survey data.",
                "**Q3:** Expected coin results and sample size.",
                "**Q4:** Expected die results and chance variation.",
                "**Q6:** Probabilities and predictions from car-colour data."
              ]
            }
          ]
        },
        {
          title: "Challenge Pathway",
          prompt: "Exercise 8I: Q8, Q11",
          blocks: [
            {
              type: "bullet-list",
              items: [
                "**Q8:** Estimate marble composition from repeated draws with replacement.",
                "**Q11:** Judge probability statements and justify answers."
              ]
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 14: Explain the Error
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "guided",
      estimatedMinutes: 3,
      title: "Explain the Error: Common Probability Misconceptions",
      subtitle: "Each statement below contains a mathematical mistake. Spacebar reveals the correction.",
      columns: [
        {
          width: "third",
          title: "Claim 1: Unobserved Outcomes",
          blocks: [
            {
              type: "note-box",
              variant: "alert",
              title: "Student Claim",
              text: "“No green results means green is impossible.”"
            },
            {
              type: "solution",
              title: "Correction",
              text: "**Unobserved events may still be possible.** In a small experiment, a possible event with low probability might simply not occur during those specific trials."
            }
          ]
        },
        {
          width: "third",
          title: "Claim 2: Proving Fairness",
          blocks: [
            {
              type: "note-box",
              variant: "alert",
              title: "Student Claim",
              text: "“Half heads proves the coin is fair.”"
            },
            {
              type: "solution",
              title: "Correction",
              text: "**A single run does not prove fairness.** A biased coin can still land on heads half the time in a short sample of 10 or 20 tosses purely by chance."
            }
          ]
        },
        {
          width: "third",
          title: "Claim 3: Larger Experiments",
          blocks: [
            {
              type: "note-box",
              variant: "alert",
              title: "Student Claim",
              text: "“A larger experiment will definitely be closer to theoretical probability.”"
            },
            {
              type: "solution",
              title: "Correction",
              text: "**Larger samples usually improve estimates, but not in every run.** The Law of Large Numbers means estimates *tend* to improve on average, but random variation can still cause any single run to deviate."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 15: Exit Ticket
    // ------------------------------------------------------------------------
    {
      type: "exit-ticket",
      phase: "assessment",
      estimatedMinutes: 3,
      title: "Exit Ticket: Checking Understanding",
      subtitle: "Complete these questions in your workbook before the end of the lesson",
      questions: [
        {
          prompt: "50 coin tosses produce 28 heads. Calculate the experimental probability of heads as a fraction, decimal, and percentage.",
          solution: [
            {
              type: "paragraph",
              text: "$$\\text{Pr}(\\text{Heads}) = \\frac{28}{50} = \\frac{14}{25} = 0.56 = 56\\%$$"
            }
          ]
        },
        {
          prompt: "Using your experimental probability (56%), predict the number of heads expected in 200 further tosses.",
          solution: [
            {
              type: "paragraph",
              text: "$$\\text{Expected Heads} = 0.56 \\times 200 = \\frac{28}{50} \\times 200 = 28 \\times 4 = 112 \\text{ heads}$$"
            }
          ]
        },
        {
          prompt: "Explain why a fair coin need not produce exactly 25 heads in 50 tosses.",
          solution: [
            {
              type: "paragraph",
              text: "Theoretical probability ($0.5$) predicts the long-run expectation, not a guaranteed count in any single run. Natural **chance variation** means real trials will fluctuate around 25 (e.g. 23, 26, 28 heads)."
            }
          ]
        }
      ]
    }
  ]
};
