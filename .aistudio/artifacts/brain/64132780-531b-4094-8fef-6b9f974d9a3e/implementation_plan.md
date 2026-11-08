# Implementation Plan & Record: Lesson 3H (Dividing Fractions)

Complete implementation of the Year 7 Mathematics interactive classroom slideshow for **Section 3H: Dividing Fractions** from *Essential Mathematics for the Victorian Curriculum, Year 7, 3rd edition* (pages 188–193).

## 1. Overview & Pedagogical Architecture

- **Pacing & Gradual Release**: 17 slides summing to exactly 60 minutes following the I Do → We Do → You Do framework.
- **Independent Practice Timing**: Independent textbook practice begins promptly at minute 23 (Slide 11: Part 1 for 11 min; Slide 16: Part 2 for 9 min), ensuring students spend 20 minutes on exercises.
- **Conceptual Grounding**: Explains division as counting equal groups ("How many fractions fit into the dividend?") before introducing the reciprocal rule, dispelling the misconception that division always makes numbers smaller.
- **Mathematical Rigor**: All fractions formatted with proper horizontal vincula using KaTeX without raw LaTeX, slash notation for displayed math, or raw HTML tags.

---

## 2. Slide Sequence & Timing Breakdown (Total: 60 min)

1. **Slide 1 — Title (1 min)**: "3H: Dividing Fractions" · Subtitle: "How many times does one fraction fit into another?" · Opening question $\frac{1}{2} \div \frac{1}{4} = 2$ with visual quarters fitting into one half.
2. **Slide 2 — Do Now (3 min)**: 4 diagnostic warm-up questions ($\frac{3}{4} \times \frac{2}{5}$, converting $1\frac{1}{2}$ to $\frac{3}{2}$, $12 \div 3$, and how many quarters in a whole).
3. **Slide 3 — Do Now Answers (1 min)**: Progressive reveals for each answer ($\frac{3}{10}$, $\frac{3}{2}$, $4$, and $4\text{ quarters}$), bridging multiplication and equal grouping to division.
4. **Slide 4 — Learning Intentions & Success Criteria (1 min)**: Intention and 3 success criteria (reciprocals, explaining the invert-and-multiply connection, dividing fractions/mixed numerals), highlighting the key question: "Why can dividing by a fraction produce a larger answer?"
5. **Slide 5 — What Does Fraction Division Mean? (3 min)**: I Do: $\frac{1}{2} \div \frac{1}{4} = 2$. Fraction bar illustrating how many quarters fit into one half.
6. **Slide 6 — Interactive Fraction Division Explorer (4 min)**: Interactive simulation exploring $\frac{1}{2} \div \frac{1}{4} = 2$, $\frac{3}{4} \div \frac{1}{2} = 1\frac{1}{2}$ (partial groups), and $3 \div \frac{1}{2} = 6$.
7. **Slide 7 — Dividing and Multiplying Are Connected (2 min)**: Lolly sharing model ($24 \div 3 = 8$ and $24 \times \frac{1}{3} = 8$), connecting division by a number to multiplication by its reciprocal.
8. **Slide 8 — I Do: Reciprocals (3 min)**: Definition of reciprocals ($a \times \frac{1}{a} = 1$), rules for proper fractions, whole numbers, and mixed numerals, paired with the interactive **Reciprocal Demonstrator**.
9. **Slide 9 — We Do: Which Fraction Changes? (2 min)**: Diagnostic multiple-choice question on $\frac{3}{5} \div \frac{4}{7}$ with mini-whiteboard reveals, confirming only the divisor inverts.
10. **Slide 10 — I Do: Fraction Divided by Whole Number (3 min)**: Worked example $\frac{5}{8} \div 3 = \frac{5}{8} \times \frac{1}{3} = \frac{5}{24}$ with sharing visual and You Try $\frac{3}{4} \div 5 = \frac{3}{20}$.
11. **Slide 11 — Independent Textbook Practice, Part 1 (11 min)**: Exercise 3H (Page 192), Q1–2 (reciprocals), Q3 (mixed reciprocals), Q4–5 (dividing fractions by whole numbers), with 11-minute timer and sequential solutions. Starts at minute 23.
12. **Slide 12 — I Do: Whole Number Divided by Fraction (3 min)**: Worked example $6 \div \frac{1}{3} = \frac{6}{1} \times \frac{3}{1} = 18$. Addresses why division by a fraction $< 1$ increases value.
13. **Slide 13 — I Do: Fraction Divided by Fraction (4 min)**: Worked example $\frac{3}{5} \div \frac{3}{8} = \frac{3}{5} \times \frac{8}{3} = \frac{24}{15} = \frac{8}{5} = 1\frac{3}{5}$. Demonstrates pre-simplification and simplifying at the end.
14. **Slide 14 — I Do: Dividing Mixed Numerals (4 min)**: Worked example $2\frac{1}{4} \div 1\frac{1}{2} = \frac{9}{4} \div \frac{3}{2} = \frac{9}{4} \times \frac{2}{3} = \frac{18}{12} = 1\frac{1}{2}$, emphasizing conversion to improper fractions before inverting.
15. **Slide 15 — We Do: Diagnosing Common Errors (3 min)**: 3-column diagnostic analysis identifying common student mistakes (inverting the wrong fraction, flipping before converting mixed numerals, and reciprocal arithmetic).
16. **Slide 16 — Independent Textbook Practice, Part 2 (9 min)**: Exercise 3H (Pages 192–193), Q7 (fraction division), Q8 (mixed numeral division), and Q9/12/13 (word problems and extension) with 9-minute timer.
17. **Slide 17 — Exit Ticket (3 min)**: 3 multi-tiered check questions assessing mixed numeral reciprocals, fractions divided by whole numbers, and fraction division.

---

## 3. Interactive Simulations

- **Simulation A: Fraction Division Explorer (`simType: 'fraction-division'`)**:
  - Mode 1: "How many groups fit?" ($1/2 \div 1/4 = 2$, $3/4 \div 1/2 = 1\frac{1}{2}$, $3 \div 1/2 = 6$, $6 \div 1/3 = 18$, $3/5 \div 3/8 = 1\frac{3}{5}$). Renders SVG whole blocks, shaded dividend, and colored divisor groups with partial group remainder representation.
  - Mode 2: "Equal sharing" ($5/8 \div 3 = 5/24$, $3/4 \div 5 = 3/20$, $3/4 \div 2 = 3/8$). Renders fractional slicing and equal share isolation.
- **Simulation B: Reciprocal Demonstrator (`simType: 'reciprocal-explorer'`)**:
  - Interactive preset chips ($2/3$, $5$, $1\frac{3}{7}$, $3/4$, $8$).
  - Two-step reveal: flips card to show the reciprocal, then allows verifying that the product of the original number and its reciprocal is always $1$.

---

## 4. Verification & Audit Results

- **Math Formula Audit (`npm run audit:math`)**: 0 errors across 215 expressions in Lesson 3H (1049 total expressions across 10 lessons).
- **Unit & Regression Tests (`npm test`)**: 223/223 tests passing, including `scripts/test-3h.mjs` verifying manifest registration, slide count, 60-minute duration, timing milestones, and math calculations.
- **Type Check & Lint (`npm run lint` & `compile_applet`)**: Zero type errors (`tsc --noEmit`), build succeeded.
- **Browser Smoke & Interaction Tests (Playwright)**:
  - `tests/browser/fraction-division.spec.mjs`: 4/4 passing (title slide, Slide 6 simulation interaction, Slide 8 reciprocal reveal & verify, 17-slide navigation to exit ticket).
  - `tests/browser/fraction-conversion.spec.mjs`: 3/3 passing (3C regression check).
