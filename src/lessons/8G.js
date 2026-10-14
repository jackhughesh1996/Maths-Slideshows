/**
 * @file 8G.js
 * Year 7 Mathematics: Lesson 8G — Describing Probability
 * Chapter: Statistics and Probability (Consolidating)
 * Pacing: 60-minute lesson designed around tight I Do -> We Do -> You Do model.
 * Substantive student independent practice commences at ~22 minutes (Slide 6).
 */

export default {
  id: "8G",
  title: "Describing Probability",
  subject: "Mathematics",
  yearLevel: 7,
  unit: "Chapter 8",
  folder: "Statistics and Probability",
  chapter: "Statistics and Probability",
  topics: [
    "Probability Scale",
    "Chance Vocabulary",
    "Equally Likely Outcomes",
    "Spinners and Relative Likelihood",
    "Sample Space Lists",
    "Chance Reasoning"
  ],
  slides: [
    // ------------------------------------------------------------------------
    // SLIDE 1: Title
    // ------------------------------------------------------------------------
    {
      type: "title",
      phase: "opening",
      estimatedMinutes: 1,
      title: "Describing Probability",
      subtitle: "Using everyday language and qualitative scales to describe the likelihood of events",
      overview: "Probability is the study of chance. It helps us describe and compare how likely events are to happen using clear mathematical language.",
      topics: [
        "Everyday examples of chance (weather, dice, competitions)",
        "The probability scale from Impossible to Certain",
        "Even chance (50–50) as the central benchmark",
        "Equally likely outcomes in fair trials",
        "Comparing event likelihoods with spinners and word problems",
        "Mathematical reasoning about chance misconceptions"
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
      learningIntention: "To understand and describe the likelihood of events using the language of probability.",
      successCriteria: [
        "I can describe and compare how likely different events are to occur using standard probability terms.",
        "I can place everyday and chance events on a probability scale from impossible to certain.",
        "I can identify whether outcomes are equally likely or not equally likely.",
        "I can explain that likelihood describes long-run expectation, but does not guarantee the exact outcome on any single trial."
      ],
      keyPrinciple: "Probability is a measure of chance that ranges continuously from Impossible (cannot happen) to Certain (must happen)."
    },

    // ------------------------------------------------------------------------
    // SLIDE 3: Do Now (Warm-up)
    // ------------------------------------------------------------------------
    {
      type: "do-now",
      phase: "opening",
      estimatedMinutes: 4,
      title: "Do Now: Thinking About Chance",
      subtitle: "Classify each everyday statement in your workbook. Spacebar reveals model answers.",
      questions: [
        {
          prompt: "The sun will rise in the east tomorrow morning.",
          answer: "Certain (it is guaranteed by the rotation of the Earth)"
        },
        {
          prompt: "You roll an ordinary 6-sided die and obtain a 7.",
          answer: "Impossible (a standard die only has faces 1 to 6)"
        },
        {
          prompt: "Tossing a fair coin and having it land on Heads.",
          answer: "Even chance (50–50 chance; heads and tails are equally balanced)"
        },
        {
          prompt: "It will rain in your town sometime during the next 12 months.",
          answer: "Likely / Highly likely (almost certain over a full year)"
        }
      ],
      sidebarNotes: [
        {
          type: "note-box",
          variant: "gold",
          title: "📌 Warm-up Purpose",
          text: "We naturally use words like *might*, *definitely*, and *unlikely* every day.\nIn mathematics, we give these words **exact benchmark positions** along a continuum of chance."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 4: Key Notes — The Probability Scale & Vocabulary
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 6,
      title: "The Probability Continuum & Key Terms",
      subtitle: "Copy these essential definitions and the chance scale into your workbook",
      columns: [
        {
          width: "half",
          title: "1. The 5 Benchmark Terms",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "default",
              title: "The Qualitative Probability Scale",
              text: "• **Impossible:** The event cannot happen under any circumstances ($0\\%$ chance).\n• **Unlikely:** The event could happen, but there is a low chance (less than half).\n• **Even Chance:** The event is just as likely to occur as not to occur (exactly $50\\%$ or $\\frac{1}{2}$).\n• **Likely:** The event has a high chance of occurring, but is not guaranteed (more than half).\n• **Certain:** The event is guaranteed to happen ($100\\%$ chance)."
            },
            {
              type: "note-box",
              variant: "alert",
              title: "⚠️ Watch Out for 'Even Chance'",
              text: "An event is only an **even chance** if there is exactly a $50\\%$ chance of happening and a $50\\%$ chance of not happening (like a fair coin flip)."
            }
          ]
        },
        {
          width: "half",
          title: "2. Visual Scale & Definitions",
          blocks: [
            {
              type: "table",
              headers: ["Term", "Everyday Example", "Chance Indicator"],
              rows: [
                ["Impossible", "Rolling an 8 on standard 6-sided die", "0% / Zero chance"],
                ["Unlikely", "Drawing an Ace from a standard deck (4 in 52)", "Low chance"],
                ["Even Chance", "Coin landing Heads; rolling an even number on a die", "50–50 / Half"],
                ["Likely", "Selecting a weekday when picking a day of the week", "High chance"],
                ["Certain", "Selecting a red or black card from a standard deck", "100% / Definite"]
              ]
            },
            {
              type: "note-box",
              variant: "green",
              title: "Core Definition: Outcome vs Event",
              text: "• **Outcome:** A single possible result of an experiment (e.g., rolling a 4).\n• **Event:** One or more outcomes of interest (e.g., rolling an even number: {2, 4, 6}).\n• **Sample Space:** The complete set of all possible outcomes."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 5: I Do — Worked Example: Placing Events on the Scale
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 5,
      title: "I Do: Classifying & Ordering Likelihoods",
      subtitle: "Teacher demonstration: analyzing events, identifying total outcomes, and justifying terms",
      prompt: "Classify each of the following events using the standard vocabulary: Impossible, Unlikely, Even Chance, Likely, or Certain.",
      leftBlocks: [
        {
          type: "note-box",
          variant: "default",
          title: "Events to Classify",
          text: "**Event A:** Rolling a number greater than 4 on a standard 6-sided die.\n\n**Event B:** Picking a red card from a standard deck of 52 playing cards.\n\n**Event C:** Picking a month of the year that has at least 28 days.\n\n**Event D:** A newborn baby is born on February 30th."
        },
        {
          type: "note-box",
          variant: "gold",
          title: "Teacher Thinking Routine",
          text: "1. What are all the possible outcomes?\n2. How many outcomes favour the event?\n3. Is that fraction zero, less than half, exactly half, more than half, or all?"
        }
      ],
      steps: [
        {
          label: "Analyze Event A (Die > 4)",
          text: "The possible numbers are $\\{1, 2, 3, 4, 5, 6\\}$. Numbers greater than 4 are **5** and **6** (2 out of 6). Since 2 out of 6 is less than half ($\\frac{2}{6} < \\frac{1}{2}$), this event is **Unlikely**."
        },
        {
          label: "Analyze Event B (Red Card)",
          text: "A standard deck has 52 cards: exactly 26 are red (hearts and diamonds) and 26 are black (spades and clubs). Because red and black are equally balanced ($\\frac{26}{52} = \\frac{1}{2}$), this event has an **Even Chance**."
        },
        {
          label: "Analyze Event C (Month with ≥ 28 days)",
          text: "All 12 months have at least 28 days (February has 28 or 29 days; the other 11 months have 30 or 31 days). Every possible outcome favours this event, so it is **Certain**."
        },
        {
          label: "Analyze Event D (Born on Feb 30th)",
          text: "February never has 30 days in the calendar. It is impossible for any person to be born on this date, so this event is **Impossible**."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 6: We Do — Board Task: Classifying Chance Scenarios
    // ------------------------------------------------------------------------
    {
      type: "board-task",
      phase: "guided",
      estimatedMinutes: 5,
      title: "We Do: Whiteboard Challenge — Term Matching",
      subtitle: "On your whiteboards, write the single best probability term for each statement (A–D)",
      studentAction: "Write A, B, C, D on mini-whiteboards and write: Impossible, Unlikely, Even Chance, Likely, or Certain.",
      prompt: "Match each scenario below to the most accurate probability term. Hold up your boards when the countdown ends!",
      leftBlocks: [
        {
          type: "table",
          headers: ["Label", "Scenario Description"],
          rows: [
            ["A", "Selecting a student whose birthday is on a weekend in a random leap year."],
            ["B", "Spinning a 4-colour spinner (equal red, blue, green, yellow) and landing on red."],
            ["C", "Rolling an odd number on an ordinary 6-sided die {1, 3, 5}."],
            ["D", "Pulling a blue marble from a bag containing 9 blue marbles and 1 yellow marble."]
          ]
        }
      ],
      notes: [
        {
          type: "note-box",
          variant: "gold",
          title: "Teacher Check",
          text: "Scan student whiteboards for correct reasoning: A is Unlikely (2 days out of 7), B is Unlikely (1 out of 4), C is Even Chance (3 out of 6), D is Likely (9 out of 10)."
        }
      ],
      solution: [
        {
          type: "paragraph",
          text: "• **A:** **Unlikely** (2 weekend days out of 7 total days is less than half: $\\frac{2}{7} < \\frac{1}{2}$).\n• **B:** **Unlikely** (1 quadrant out of 4 equal quadrants: $\\frac{1}{4} < \\frac{1}{2}$).\n• **C:** **Even Chance** (Odd numbers are 1, 3, 5; exactly 3 out of 6 outcomes: $\\frac{3}{6} = \\frac{1}{2}$).\n• **D:** **Likely** (9 out of 10 marbles are blue; this is much more than half: $\\frac{9}{10} > \\frac{1}{2}$)."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 7: Key Notes — Equally Likely vs Not Equally Likely
    // ------------------------------------------------------------------------
    {
      type: "notes",
      phase: "explicit",
      estimatedMinutes: 5,
      title: "Equally Likely vs Not Equally Likely",
      subtitle: "Outcomes are equally likely only when each outcome has the exact same chance of occurring",
      columns: [
        {
          width: "half",
          title: "1. Core Mathematical Concept",
          blocks: [
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "default",
              title: "Equally Likely Outcomes",
              text: "Outcomes are **equally likely** if no single outcome is favoured over any other.\n• A fair 6-sided die: rolling a 1, 2, 3, 4, 5, or 6 each has the exact same chance.\n• A fair coin: heads and tails have the exact same chance."
            },
            {
              type: "note-box",
              copyToWorkbook: true,
              variant: "alert",
              title: "Not Equally Likely Outcomes",
              text: "Outcomes are **not equally likely** if some results are more probable than others.\n• A weather forecast: 'It will rain' and 'It will not rain' are NOT equally likely on any random day in the desert!\n• Drawing from a bag of 8 red and 2 blue marbles: choosing red is far more likely than choosing blue."
            }
          ]
        },
        {
          width: "half",
          title: "2. Common Trap: Two Outcomes ≠ 50–50",
          blocks: [
            {
              type: "note-box",
              variant: "gold",
              title: "⚠️ The 'Two Outcomes' Fallacy",
              text: "Just because an event can either **happen** or **not happen** does **NOT** mean it has an even (50%) chance!\n\n*Example:* Winning the division 1 lottery has two outcomes: you win or you do not win. But the chances are certainly not equal!"
            },
            {
              type: "note-box",
              variant: "green",
              title: "How to Test for Equal Likelihood",
              text: "Ask yourself: Is the physical apparatus symmetrical and fair? Does each outcome occupy the same proportion of the sample space?"
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 8: I Do — Worked Example: Comparing Spinner Outcomes
    // ------------------------------------------------------------------------
    {
      type: "worked-example",
      phase: "explicit",
      estimatedMinutes: 5,
      title: "I Do: Analyzing Spinners & Relative Likelihood",
      subtitle: "Comparing sector proportions to determine whether outcomes are equally likely",
      prompt: "Two circular spinners are used in a board game. Analyze the sectors for each spinner and test them using the interactive simulation:",
      leftBlocks: [
        {
          type: "simulation",
          simType: "spinner",
          title: "Interactive Spinner Simulation",
          subtitle: "Spin each spinner to empirically test whether outcomes are equally likely",
          spinners: [
            {
              id: "spinner1",
              name: "Spinner 1 (Fair 4-Part)",
              badge: "Fair",
              expected: "Equally Likely (Red, Blue, Green, Yellow all occupy 90° each)",
              sectors: [
                { label: "Red", angle: 90, color: "#dc2626", term: "Unlikely (1 in 4)" },
                { label: "Blue", angle: 90, color: "#2563eb", term: "Unlikely (1 in 4)" },
                { label: "Green", angle: 90, color: "#16a34a", term: "Unlikely (1 in 4)" },
                { label: "Yellow", angle: 90, color: "#eab308", term: "Unlikely (1 in 4)" }
              ]
            },
            {
              id: "spinner2",
              name: "Spinner 2 (Biased 3-Part)",
              badge: "Biased",
              expected: "Not Equally Likely (Red is half the circle, twice as likely as Blue or Green)",
              sectors: [
                { label: "Red", angle: 180, color: "#dc2626", term: "Even Chance (180°)" },
                { label: "Blue", angle: 90, color: "#2563eb", term: "Unlikely (90°)" },
                { label: "Green", angle: 90, color: "#16a34a", term: "Unlikely (90°)" }
              ]
            }
          ]
        }
      ],
      steps: [
        {
          label: "Analyze Spinner 1 Outcomes",
          text: "On Spinner 1, every color occupies an identical angle ($90^\\circ$). Therefore, the four color outcomes (Red, Blue, Green, Yellow) are **equally likely**."
        },
        {
          label: "Analyze Spinner 2 Outcomes",
          text: "On Spinner 2, Red occupies $180^\\circ$ (half the circle), while Blue and Green each occupy only $90^\\circ$. The outcomes are **not equally likely** because landing on Red is twice as likely as landing on Blue."
        },
        {
          label: "Describe Likelihood of Landing on Red",
          text: "• On Spinner 1: Red is **Unlikely** ($\\frac{1}{4} < \\frac{1}{2}$).\n• On Spinner 2: Red is an **Even Chance** ($\\frac{1}{2} = 50\\%$)."
        },
        {
          label: "Compare Blue vs Green on Spinner 2",
          text: "Although Red is favoured, Blue and Green have identical sector sizes ($90^\\circ$ each). Therefore, Blue and Green are **equally likely to each other**."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 9: We Do — Board Task: Who Has the Fairer Game?
    // ------------------------------------------------------------------------
    {
      type: "board-task",
      phase: "guided",
      estimatedMinutes: 5,
      title: "We Do: Is the Game Fair?",
      subtitle: "Evaluate game rules on your mini-whiteboards: Who has the greater chance of winning?",
      studentAction: "Decide whether the game is fair. Justify your answer using outcomes and equal likelihood.",
      prompt: "Amira and Liam play a game rolling a fair 6-sided die with faces {1, 2, 3, 4, 5, 6}.\n• Amira wins a point if the die lands on a prime number.\n• Liam wins a point if the die lands on a multiple of 2.\nIs this game fair? Explain why or why not.",
      leftBlocks: [
        {
          type: "note-box",
          variant: "default",
          title: "Rule Breakdown",
          text: "• Possible outcomes: **1, 2, 3, 4, 5, 6**\n• Amira's condition: **Prime number**\n• Liam's condition: **Multiple of 2**"
        }
      ],
      notes: [
        {
          type: "note-box",
          variant: "gold",
          title: "Guiding Questions",
          text: "List Amira's winning numbers and Liam's winning numbers. Does each player have the same number of winning outcomes?"
        }
      ],
      solution: [
        {
          type: "paragraph",
          text: "1. **Amira's winning numbers (Prime):** {2, 3, 5} $\\rightarrow$ **3 winning outcomes**.\n*(Note: 1 is not prime!)*\n2. **Liam's winning numbers (Multiple of 2):** {2, 4, 6} $\\rightarrow$ **3 winning outcomes**.\n\n**Conclusion:** **Yes, the game is fair.** Both players have exactly 3 out of 6 equally likely outcomes (an even chance of $\\frac{3}{6} = \\frac{1}{2}$)."
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 10: You Do — Independent Practice: Reasoning & Classification
    // ------------------------------------------------------------------------
    {
      type: "practice",
      phase: "independent",
      estimatedMinutes: 10,
      timerMinutes: 10,
      title: "You Do: Independent Practice",
      subtitle: "Work through these three problems in your workbook. Use full sentences and correct terms.",
      tasks: [
        {
          title: "Task 1: Bag of Counters",
          prompt: "A bag contains 6 red, 3 green, and 1 blue counter. Describe the likelihood of drawing each colour, then test your reasoning with the simulation:",
          blocks: [
            {
              type: "paragraph",
              text: "a) A red counter\nb) A green counter\nc) A blue counter\nd) A yellow counter"
            },
            {
              type: "simulation",
              simType: "counter-bag",
              title: "Bag Draw Simulation",
              subtitle: "Sample from 6 Red, 3 Green, 1 Blue counter",
              items: [
                { label: "Red", count: 6, color: "#dc2626", term: "Likely" },
                { label: "Green", count: 3, color: "#16a34a", term: "Unlikely" },
                { label: "Blue", count: 1, color: "#2563eb", term: "Unlikely" },
                { label: "Yellow", count: 0, color: "#eab308", term: "Impossible" }
              ],
              expected: "Red appears most often (Likely), Green/Blue appear occasionally (Unlikely), Yellow is never drawn (Impossible)."
            }
          ],
          solution: [
            {
              type: "paragraph",
              text: "Total counters = 10.\na) **Red:** Much more than half $\\rightarrow$ **Likely**\nb) **Green:** Less than half $\\rightarrow$ **Unlikely**\nc) **Blue:** Small chance (1 in 10) $\\rightarrow$ **Unlikely**\nd) **Yellow:** 0 yellow counters $\\rightarrow$ **Impossible**"
            }
          ]
        },
        {
          title: "Task 2: Equally Likely Test",
          prompt: "State whether the outcomes are equally likely or not equally likely for each trial:",
          blocks: [
            {
              type: "paragraph",
              text: "a) Rolling an even number vs an odd number on a standard die.\nb) Tossing a drawing pin and noting whether it lands point up or point down.\nc) Guessing the answer to a 4-option multiple choice question."
            }
          ],
          solution: [
            {
              type: "paragraph",
              text: "a) **Equally likely** (3 even {2, 4, 6} vs 3 odd {1, 3, 5}).\nb) **Not equally likely** (the drawing pin is asymmetrical; weight distribution favours one orientation).\nc) **Equally likely** (each of the 4 options A, B, C, D has a $\\frac{1}{4}$ chance of being guessed)."
            }
          ]
        },
        {
          title: "Task 3: Qualitative Reasoning & Even Chance",
          prompt: "A box contains 8 green marbles and 2 red marbles. Answer these questions using qualitative probability terms:\na) Describe the likelihood of drawing a green marble.\nb) Describe the likelihood of drawing a red marble.\nc) Are drawing green and drawing red equally likely? Explain why.\nd) How many red marbles must be added to the box so that drawing a red marble becomes an **even chance**?",
          solution: [
            {
              type: "paragraph",
              text: "a) **Green marble:** **Likely** (green makes up most of the box; much more than half).\nb) **Red marble:** **Unlikely** (only 2 out of 10; less than half).\nc) **Not equally likely:** Green is far more likely than red because there are 4 times as many green marbles. Neither outcome has the same chance.\nd) **Add 6 red marbles** (to make 8 green and 8 red). When the two colours are equally balanced, drawing red becomes an **even chance** (50–50)."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 11: Deep Dive / Misconception — The Gambler's Fallacy
    // ------------------------------------------------------------------------
    {
      type: "comparison",
      phase: "explicit",
      estimatedMinutes: 5,
      title: "Misconception: 'It's Due to Happen!'",
      subtitle: "Why independent trials have no memory of past results",
      columns: [
        {
          title: "The Common Misconception",
          blocks: [
            {
              type: "note-box",
              variant: "alert",
              title: "The 'Due' Fallacy",
              text: "Marcus flips a fair coin 5 times in a row, and it lands on **Heads** every single time.\n\nMarcus says: *'Tails is definitely due to come up next because the coin has to balance out!'*\n\nIs Marcus correct?"
            },
            {
              type: "note-box",
              variant: "default",
              title: "Why People Think This",
              text: "In the long run, heads and tails even out to $50\\%$. People mistake this long-term pattern for a short-term rule that controls the next individual flip."
            }
          ]
        },
        {
          title: "The Mathematical Reality",
          blocks: [
            {
              type: "note-box",
              variant: "green",
              title: "The Coin Has No Memory!",
              text: "• **Marcus is incorrect.**\n• The coin has no brain, no memory, and no knowledge of previous tosses.\n• On flip number 6, the chance of getting Tails is still **exactly an even chance (50%)**."
            },
            {
              type: "note-box",
              variant: "gold",
              title: "Key Takeaway: Independence",
              text: "Each flip of a coin or roll of a die is an **independent event**. Past trials never influence future trials."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 12: Exit Ticket — Formative Assessment
    // ------------------------------------------------------------------------
    {
      type: "exit-ticket",
      phase: "assessment",
      estimatedMinutes: 5,
      title: "Exit Ticket",
      subtitle: "Complete these two quick checks in your workbook before packing up",
      questions: [
        {
          prompt: "A box contains 5 red pens, 5 blue pens, and 0 black pens. Use probability terms to describe the likelihood of:\na) Drawing a red pen\nb) Drawing a green pen\nc) Drawing a pen that writes in either red or blue",
          blocks: [
            {
              type: "simulation",
              simType: "pen-draw",
              title: "Pen Box Simulation",
              subtitle: "Sample from 5 Red and 5 Blue pens",
              items: [
                { label: "Red Pen", count: 5, color: "#dc2626", term: "Even Chance" },
                { label: "Blue Pen", count: 5, color: "#2563eb", term: "Even Chance" },
                { label: "Green/Black Pen", count: 0, color: "#475569", term: "Impossible" }
              ],
              expected: "Red and Blue are equally balanced (Even Chance). Green/Black pen is never drawn (Impossible). Every draw is Red or Blue (Certain)!"
            }
          ],
          solution: [
            {
              type: "paragraph",
              text: "a) **Red pen:** Exactly 5 out of 10 pens $\\rightarrow$ **Even Chance** (50%)\nb) **Green pen:** 0 green pens $\\rightarrow$ **Impossible**\nc) **Red or blue pen:** All 10 pens are red or blue $\\rightarrow$ **Certain**"
            }
          ]
        },
        {
          prompt: "Explain why the outcomes 'Rain tomorrow' and 'No rain tomorrow' are NOT an even chance in summer.",
          solution: [
            {
              type: "paragraph",
              text: "Although there are only two possible outcomes (rain or no rain), weather is determined by climate, air pressure, and seasons. In a dry Australian summer, days without rain are far more common than rainy days, so the two outcomes are **not equally likely**."
            }
          ]
        }
      ]
    },

    // ------------------------------------------------------------------------
    // SLIDE 13: Summary & Next Steps
    // ------------------------------------------------------------------------
    {
      type: "summary",
      phase: "assessment",
      estimatedMinutes: 3,
      title: "Lesson Summary: 8G",
      takeaways: [
        "Probability describes the likelihood of events along a scale from Impossible (0%) to Certain (100%).",
        "Even chance means an event is just as likely to occur as not to occur (exactly 50%).",
        "Outcomes are equally likely only if every outcome has the exact same chance of occurring.",
        "Having two possible outcomes does NOT automatically mean a 50–50 chance (e.g., lottery, weather).",
        "Likelihood describes long-run expectation, but does not guarantee the exact outcome on any single trial.",
        "Next Lesson: 8H – Theoretical Probability, where we begin quantifying chance using fractions, decimals, and percentages!"
      ]
    }
  ]
};
