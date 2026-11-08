/**
 * Year 7 Mathematics — Chapter 3C: Mixed Numerals and Improper Fractions.
 * Source: Essential Mathematics for the Victorian Curriculum, 3rd ed., pp. 157–162.
 * 60 minutes. Independent practice starts at approximately minute 21.
 * Three modes of the shared Fraction Conversion Explorer provide a consistent model.
 */
export default {
  id: '3C',
  title: 'Mixed Numerals and Improper Fractions',
  subject: 'Mathematics',
  yearLevel: 7,
  unit: 'Chapter 3',
  folder: 'Fractions',
  chapter: 'Fractions',
  topics: ['Mixed Numerals', 'Improper Fractions', 'Conversion', 'Simplifying Fractions', 'Number Lines'],
  slides: [
    {
      type: 'title', phase: 'opening', estimatedMinutes: 1,
      title: '3C: Mixed Numerals and Improper Fractions',
      subtitle: 'One quantity. Two equivalent ways to write it.',
      overview: 'How can $2\\frac{3}{4}$ and $\\frac{11}{4}$ name exactly the same amount?',
      topics: ['Understand the representations', 'Convert in both directions', 'Check and simplify']
    },
    {
      type: 'do-now', phase: 'opening', estimatedMinutes: 3, timerMinutes: 3,
      title: 'Do Now: What Do You Remember?',
      subtitle: 'Answer independently in your exercise book before revealing answers.',
      questions: [
        { prompt: 'What does the **denominator** tell us?', answer: 'How many **equal parts** make one whole.' },
        { prompt: 'Is $\\frac34$ greater than or less than $1$?', answer: '$\\frac34<1$ because three quarters are less than four quarters.' },
        { prompt: 'How many **quarters** make one whole?', answer: '$\\frac44=1$: there are **four quarters** in a whole.' },
        { prompt: 'What whole number is $\\frac{12}{4}$?', answer: '$\\frac{12}{4}=3$ because twelve quarters make three groups of four.' }
      ]
    },
    {
      type: 'worked-example', phase: 'opening', estimatedMinutes: 2,
      title: 'Do Now: Discuss the Answers',
      subtitle: 'Check the reasoning, not just the final numbers.',
      prompt: 'The denominator names the size of our pieces. How many quarters make three wholes?',
      steps: [
        { label: 'One whole', latex: '\\frac44=1' },
        { label: 'Three wholes', latex: '3=\\frac{3\\times4}{4}=\\frac{12}{4}' },
        { label: 'Think ahead', text: 'If twelve quarters make three wholes, what do **eleven quarters** make?' }
      ]
    },
    {
      type: 'learning', phase: 'opening', estimatedMinutes: 1,
      title: 'Learning Intention and Success Criteria',
      subtitle: 'Section 3C · Textbook pages 157–162',
      learningIntention: 'To understand mixed numerals and improper fractions, and convert between them without changing the value.',
      successCriteria: [
        'I can recognise and explain mixed numerals and improper fractions.',
        'I can turn a mixed numeral into an improper fraction.',
        'I can turn an improper fraction into a mixed numeral in simplest form.'
      ],
      keyPrinciple: 'Converting changes how we WRITE a number, not how much the number is worth.'
    },
    {
      type: 'notes', phase: 'explicit', estimatedMinutes: 2,
      title: 'Two Ways to Name the Same Amount',
      subtitle: 'A mixed numeral combines wholes and a fractional part.',
      columns: [
        {
          width: '60', title: 'Key definitions', blocks: [
            { type: 'note-box', copyToWorkbook: true, title: 'Write in your book',
              text: '**Mixed numeral:** a whole number together with a proper fraction. For example, $2\\frac34=2+\\frac34$.\n\n**Improper fraction:** a fraction with at least one whole. Its numerator is **greater than or equal to** its denominator. For example, $\\frac{11}{4}$ or $\\frac44$.' },
            { type: 'paragraph', text: '**Important:** A proper fraction like $\\frac34$ represents less than one whole.' }
          ]
        },
        {
          width: '40', title: 'Same value', blocks: [
            { type: 'formula', latex: '2\\frac34=\\frac{11}{4}' },
            { type: 'note-box', variant: 'gold', text: '**Think:** two complete groups of four quarters make eight quarters. Add three quarters: **eleven quarters**.' }
          ]
        }
      ]
    },
    {
      type: 'notes', phase: 'explicit', estimatedMinutes: 3,
      title: 'Explore: Build a Mixed Numeral',
      subtitle: 'Change the whole numbers or extra parts. Predict the numerator before you reveal it.',
      content: [
        { type: 'simulation', simType: 'fraction-conversion', mode: 'build', denominator: 4, whole: 2, part: 3,
          title: 'Fraction Conversion Explorer · Build mode',
          subtitle: 'Each bar is one whole; every bar has the same size. How many quarters are shaded altogether?' }
      ]
    },
    {
      type: 'worked-example', phase: 'explicit', estimatedMinutes: 3,
      title: 'I Do: Mixed Numeral to Improper Fraction',
      subtitle: 'Textbook Example 7 · Page 159',
      prompt: 'Convert $3\\frac15$ into an improper fraction. **Show every step.**',
      leftBlocks: [
        { type: 'note-box', copyToWorkbook: true, title: 'Conversion rule',
          text: '**1.** Multiply the whole number by the denominator.\n**2.** Add the numerator.\n**3.** Keep the same denominator.' }
      ],
      steps: [
        { label: 'Count the fifths in three wholes', latex: '3\\times5=15' },
        { label: 'Add the extra fifth', latex: '15+1=16' },
        { label: 'Write the improper fraction', latex: '3\\frac15=\\frac{3\\times5+1}{5}=\\boxed{\\frac{16}{5}}' }
      ]
    },
    {
      type: 'we-do', phase: 'guided', estimatedMinutes: 3,
      title: 'We Do: Multiply, Add, Keep',
      subtitle: 'Use mini-whiteboards or your exercise book.',
      studentAction: 'Show the whole × denominator + numerator calculation.',
      prompt: 'Convert both: **A** $2\\frac56$ and **B** $1\\frac34$.',
      separateSolutions: true,
      workspaceContent: [
        { type: 'note-box', variant: 'gold', text: 'Start with $2\\frac56$. How many sixths are in **two wholes**? How many more sixths are there?' },
        { type: 'formula', latex: '2\\frac56=\\frac{2\\times6+5}{6}=\\frac{\\square}{6}' },
        { type: 'formula', latex: '1\\frac34=\\frac{1\\times4+3}{4}=\\frac{\\square}{4}' }
      ],
      solution: [
        { type: 'solution', title: 'Answer A', latex: '2\\frac56=\\frac{12+5}{6}=\\boxed{\\frac{17}{6}}' },
        { type: 'solution', title: 'Answer B', latex: '1\\frac34=\\frac{4+3}{4}=\\boxed{\\frac74}' }
      ]
    },
    {
      type: 'worked-example', phase: 'explicit', estimatedMinutes: 3,
      title: 'I Do: Improper Fraction to Mixed Numeral',
      subtitle: 'Textbook Example 8 · Page 160',
      prompt: 'Convert $\\frac{11}{4}$ into a mixed numeral. How many groups of four fit into eleven?',
      leftBlocks: [
        { type: 'note-box', copyToWorkbook: true, title: 'Division with a remainder',
          text: '**Divide** the numerator by the denominator.\n• The answer is the number of complete wholes.\n• The remainder is the numerator of the fractional part.\n• Keep the same denominator.' }
      ],
      steps: [
        { label: 'Divide into groups of four', latex: '11\\div4=2\\text{ remainder }3' },
        { label: 'Write two wholes and three quarters', latex: '\\frac{11}{4}=2+\\frac34' },
        { label: 'Record the mixed numeral', latex: '\\frac{11}{4}=\\boxed{2\\frac34}' }
      ]
    },
    {
      type: 'practice', phase: 'independent', estimatedMinutes: 13, timerMinutes: 13,
      title: 'You Do: Start Exercise 3C',
      subtitle: 'Textbook page 161 · 13 minutes · Work independently and show each step.',
      content: [
        { type: 'note-box', variant: 'gold', title: 'Start here', text: 'Complete **Exercise 3C, Questions 1 and 2** (mixed numerals → improper fractions), then start **Question 3** (improper → mixed). Write your multiplication or division working.' }
      ],
      tasks: [
        { title: 'Getting started', prompt: '**Q1 and Q2a–f:** convert mixed numerals into improper fractions. Use whole × denominator + numerator.' },
        { title: 'Keep going', prompt: '**Q2g–l and Q3:** move into harder conversions. For Q3, divide the numerator by the denominator to find wholes and any remainder.' },
        { title: 'Self-check example', prompt: 'Without a calculator, convert $3\\frac25$ and $\\frac{13}{4}$.',
          solution: [{ type: 'paragraph', text: '$3\\frac25=\\frac{17}{5}$ and $\\frac{13}{4}=3\\frac14$.' }] }
      ]
    },
    {
      type: 'notes', phase: 'guided', estimatedMinutes: 3,
      title: 'Explore: Regroup an Improper Fraction',
      subtitle: 'Colour turns from light to dark as complete wholes are grouped.',
      content: [
        { type: 'simulation', simType: 'fraction-conversion', mode: 'regroup', numerator: 17, denominator: 4,
          title: 'Fraction Conversion Explorer · Regroup mode',
          subtitle: 'Group one complete whole at a time. How many quarters are left after making four wholes?' }
      ]
    },
    {
      type: 'we-do', phase: 'guided', estimatedMinutes: 3,
      title: 'We Do: Divide and Find the Remainder',
      subtitle: 'Check whether any fractional part remains.',
      studentAction: 'Divide and show the quotient and remainder on your whiteboard.',
      prompt: 'Convert **A** $\\frac{23}{7}$ and **B** $\\frac{16}{4}$.',
      separateSolutions: true,
      workspaceContent: [
        { type: 'note-box', variant: 'gold', text: 'For each question: **How many complete wholes?** **How many parts left?**' },
        { type: 'formula', latex: '23\\div7=\\;?\\;\\text{ remainder }\\;?' },
        { type: 'formula', latex: '16\\div4=\\;?\\;\\text{ remainder }\\;?' }
      ],
      solution: [
        { type: 'solution', title: 'Answer A', latex: '23\\div7=3\\text{ remainder }2\\;\\Rightarrow\\;\\boxed{3\\frac27}' },
        { type: 'solution', title: 'Answer B', latex: '16\\div4=4\\text{ exactly}\\;\\Rightarrow\\;\\boxed{4}' }
      ]
    },
    {
      type: 'worked-example', phase: 'explicit', estimatedMinutes: 3,
      title: 'I Do: Simplify the Fractional Part',
      subtitle: 'Textbook Example 9 · Page 160',
      prompt: 'Convert $\\frac{20}{6}$ to a mixed numeral in **simplest form**.',
      leftBlocks: [
        { type: 'note-box', copyToWorkbook: true, title: 'Final answer check', text: 'When an improper fraction becomes a mixed numeral, **simplify the fractional part** if possible. The whole-number part does not change.' }
      ],
      steps: [
        { label: 'Divide by six', latex: '20\\div6=3\\text{ remainder }2' },
        { label: 'Write the mixed numeral', latex: '\\frac{20}{6}=3\\frac26' },
        { label: 'Simplify the fraction part', latex: '3\\frac26=\\boxed{3\\frac13}' }
      ]
    },
    {
      type: 'notes', phase: 'guided', estimatedMinutes: 3,
      title: 'Number Line: One Point, Two Names',
      subtitle: 'A conversion does not move a number along the number line.',
      content: [
        { type: 'simulation', simType: 'fraction-conversion', mode: 'number-line', numerator: 11, denominator: 4,
          title: 'Fraction Conversion Explorer · Number-line mode',
          subtitle: 'Find the position of eleven quarters. Predict its mixed form and reveal it: does the marker move?' }
      ]
    },
    {
      type: 'practice', phase: 'independent', estimatedMinutes: 11, timerMinutes: 11,
      title: 'You Do: Finish Exercise 3C',
      subtitle: 'Textbook pages 161–162 · 11 minutes · Practice, explain, extend.',
      content: [
        { type: 'note-box', variant: 'gold', title: 'Your pathway', text: '**Core:** Finish Q3, then complete **Q4** (mixed numerals in simplest form).\n**Next:** Try **Q5–6** (number lines and neighbouring whole numbers).\n**Challenge:** **Q7** (sharing pizzas) or **Q8** (prove two forms are equivalent using a diagram).' }
      ],
      tasks: [
        { title: 'Check your method', prompt: 'Convert $\\frac{18}{4}$ to simplest mixed form. Explain why $4\\frac24$ is not the final answer.',
          solution: [{ type: 'paragraph', text: '$\\frac{18}{4}=4\\frac24=\\boxed{4\\frac12}$. Since $\\frac24=\\frac12$, the fraction part must be simplified.' }] },
        { title: 'Reasoning extension', prompt: 'Draw four equal-sized quartered bars to explain why $\\frac74=1\\frac34$.',
          solution: [{ type: 'paragraph', text: 'Four quarters make **one whole**, leaving three more quarters. Therefore $\\frac74=1\\frac34$.' }] }
      ]
    },
    {
      type: 'exit-ticket', phase: 'assessment', estimatedMinutes: 3,
      title: 'Exit Ticket: Convert Both Ways',
      subtitle: 'Work independently, then reveal the sample solutions.',
      questions: [
        { prompt: '**1. Mixed → improper:** $4\\frac23$',
          solution: [{ type: 'paragraph', text: '$4\\frac23=\\frac{4\\times3+2}{3}=\\boxed{\\frac{14}{3}}$.' }] },
        { prompt: '**2. Improper → mixed:** $\\frac{19}{5}$',
          solution: [{ type: 'paragraph', text: '$19\\div5=3$ remainder $4$, so $\\frac{19}{5}=\\boxed{3\\frac45}$.' }] },
        { prompt: '**3. Simplest form:** $\\frac{14}{4}$',
          solution: [{ type: 'paragraph', text: '$\\frac{14}{4}=3\\frac24=\\boxed{3\\frac12}$.' }] }
      ]
    }
  ]
};
