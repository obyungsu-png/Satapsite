// Math questions for SAT Math section
export const mathQuestions = [
  {
    id: 1,
    question: "The graph of a system of linear equations is shown. What is the solution (x, y) to the system?",
    choices: [
      { id: "a", text: "(-1, 4)" },
      { id: "b", text: "(0, -1)" },
      { id: "c", text: "(0, 4)" },
      { id: "d", text: "(2, -3)" }
    ],
    // SVG graph embedded as data URL
    image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='-6 -6 12 12'%3E%3Cdefs%3E%3Cpattern id='grid' width='1' height='1' patternUnits='userSpaceOnUse'%3E%3Cpath d='M 1 0 L 0 0 0 1' fill='none' stroke='%23ddd' stroke-width='0.05'/%3E%3C/pattern%3E%3C/defs%3E%3Crect x='-6' y='-6' width='12' height='12' fill='url(%23grid)'/%3E%3Cline x1='-6' y1='0' x2='6' y2='0' stroke='black' stroke-width='0.08'/%3E%3Cline x1='0' y1='-6' x2='0' y2='6' stroke='black' stroke-width='0.08'/%3E%3Ctext x='5.5' y='0.5' font-size='0.5' text-anchor='end'%3Ex%3C/text%3E%3Ctext x='0.3' y='-5.5' font-size='0.5'%3Ey%3C/text%3E%3Cline x1='-6' y1='6' x2='6' y2='-6' stroke='%232563eb' stroke-width='0.12'/%3E%3Cline x1='-6' y1='2' x2='6' y2='-4.5' stroke='%232563eb' stroke-width='0.12'/%3E%3Ccircle cx='0' cy='4' r='0.15' fill='%232563eb'/%3E%3C/svg%3E",
    type: "Math"
  },
  {
    id: 2,
    question: "The area of a rectangle is 108 square inches. The length of the longest side of the rectangle is 18 inches. What is the length, in inches, of the shortest side of this rectangle?",
    choices: [
      { id: "a", text: "6" },
      { id: "b", text: "18" },
      { id: "c", text: "36" },
      { id: "d", text: "90" }
    ],
    type: "Math"
  },
  // Add more placeholder math questions
  ...Array.from({ length: 20 }, (_, i) => ({
    id: i + 3,
    question: `Math problem ${i + 3}: This is a placeholder for a math question.`,
    choices: [
      { id: "a", text: "Option A" },
      { id: "b", text: "Option B" },
      { id: "c", text: "Option C" },
      { id: "d", text: "Option D" }
    ],
    type: "Math"
  }))
];
