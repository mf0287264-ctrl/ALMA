/**
 * Lesson 1: What is a variable?
 *
 * This file is the editable source of the lesson. Each section has:
 *   blocks       the reading version (shown under the whiteboard)
 *   board        the whiteboard plan: beats of { layout, say, title, steps: [{ say, ... }] }
 *                (layout fields are documented in src/Whiteboard/layouts.js; no coordinates)
 *   check        the checkpoint question
 *   remediation  what a student sees after a wrong answer
 * Run `npm run seed:lessons` after editing to rebuild the whiteboards and save the lesson.
 */

import { callout, codeBlock, list, paragraph } from '../blocks.js';

export default {
  module: {
    title: 'Variables',
    order: 1,
    description: 'Store values, change them and understand the basic types of data.',
    objectives: ['Explain what a variable is', 'Create and change variables', 'Tell numbers, text and True/False apart']
  },

  lesson: {
    topic: 'What is a variable?',
    grade_level: 'Grade 8',
    target_duration_minutes: 7,

    introduction: [
      paragraph('Every program needs a place to remember things: a score, a name, a temperature. In Python, that place is called a variable.'),
      callout('tip', 'Picture a variable as a box with a label. The label is the name, and what is inside is the value.')
    ],

    sections: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'A box with a name',
        purpose: 'Introduce a variable as a named place that holds a value.',
        objectives: ['Explain what a variable is', 'Read the line score = 10'],
        blocks: [
          paragraph("A variable is a named place in the computer's memory that holds a value. The name is the label on the box. The value is what you put inside."),
          codeBlock('score = 10\nprint(score)', '10'),
          list('The name comes first: score', 'The = sign puts the value into the box', 'print(score) reads the value back'),
          callout('tip', 'In Python, = is an instruction ("put this in that box"), not a question ("are these equal?").')
        ],
        board: [
          {
            layout: 'statement',
            title: 'How does a game remember your score?',
            sub: 'Somewhere, the computer keeps that number safe.',
            icon: 'brain',
            say: "Imagine you're playing a game and you just scored ten points. Quick question: how does the computer remember that ten?",
            steps: [
              { say: 'It needs a place to put the number.', text: 'A place to keep it', color: 'teal' },
              { say: 'And a name, so it can find that number again later.', text: 'A name to find it', color: 'blue' },
              { say: 'A named place that holds a value is called a variable.', text: '= a variable', color: 'mango' }
            ]
          },
          {
            layout: 'boxes',
            title: 'A variable is a labeled box',
            say: 'In Python, a variable works just like a labeled box.',
            steps: [
              { say: 'On the label we write a name, like score, and inside the box we keep a value, like ten.', line: 'score = 10', set: ['score', '10'] },
              { say: "Notice the equals sign. It doesn't mean is equal to. It means: put this value into that box.", note: '= means: put the value into the box' },
              { say: 'Later, when we ask for score, Python opens the box and hands us back the ten.', line: 'print(score)', output: ['10'] }
            ]
          },
          {
            layout: 'compare',
            title: 'Why do we need names?',
            left: { title: 'Just a number', color: 'pink' },
            right: { title: 'A named variable', color: 'teal' },
            say: "Why bother with names at all? Let's compare.",
            steps: [
              { side: 'left', text: '10', mono: true, say: 'A bare ten tells us nothing. Ten what? Points? Apples? Degrees?' },
              { side: 'right', text: 'score = 10', mono: true, say: 'But score equals ten? Now the number has a meaning.' },
              { side: 'right', text: 'lives = 3', mono: true, say: 'And we can keep as many boxes as we like, each with its own name.' }
            ]
          },
          {
            layout: 'recap',
            title: 'Remember',
            say: "Let's lock it in.",
            steps: [
              { text: 'A variable is a named box that stores a value', say: 'A variable is a named box that stores a value.' },
              { text: 'name = value', mono: true, say: 'We create one with a name, an equals sign and a value.' },
              { text: 'print(name) shows what is inside', mono: true, say: 'And we read it back any time by using its name.' }
            ]
          }
        ],
        check: {
          concept: 'variable_basics',
          question: 'After this line runs, what is stored in the variable lives?',
          code: 'lives = 3',
          options: ['The name 3', 'The value 3', 'Nothing yet', 'The word lives'],
          answer: 'The value 3',
          mistakes: {
            'The name 3': 'Mixes up the name and the value',
            'Nothing yet': 'Thinks the box stays empty until print() is called',
            'The word lives': 'Thinks the box stores its own label instead of a value'
          },
          explanation: 'lives is the name on the label. The value 3 is what is inside the box.'
        },
        remediation: [
          callout('warning', 'Name = the label on the box. Value = what is inside the box.'),
          paragraph('In lives = 3, the name is lives and the value is 3. Python puts the 3 into the box called lives.')
        ]
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Creating and changing variables',
        purpose: 'Show that a variable can be set again and that the new value replaces the old one.',
        objectives: ['Change the value of a variable', 'Update a variable using its old value'],
        blocks: [
          paragraph('Variables are called variables because their value can vary. When you give a variable a new value, the old value is replaced.'),
          codeBlock('score = 0\nscore = 10\nscore = score + 5\nprint(score)', '15'),
          list('A box holds one value at a time', 'The newest value always wins', 'score = score + 5 uses the old value to make the new one'),
          callout('note', 'Python works out the right side of = first, then stores the result in the box on the left.')
        ],
        board: [
          {
            layout: 'boxes',
            title: 'Watch the box change',
            say: 'Variables are called variables because they can vary. Let us watch one change.',
            steps: [
              { say: 'We start the game with score equals zero.', line: 'score = 0', set: ['score', '0'] },
              { say: 'The player collects a coin, so we write score equals ten.', line: 'score = 10', set: ['score', '10'] },
              { say: 'Another coin, and the box now holds twenty. The old value is simply replaced.', line: 'score = 20', set: ['score', '20'] },
              { say: 'A variable only remembers its latest value. The old ones are gone.', note: 'A box holds ONE value at a time' }
            ]
          },
          {
            layout: 'boxes',
            title: 'Updating a variable',
            say: 'A very common move is to use the old value to make the new one.',
            steps: [
              { say: 'Start with score equals ten.', line: 'score = 10', set: ['score', '10'] },
              { say: 'Python solves the right side first: score is ten, plus five, makes fifteen.', line: 'score = score + 5', note: 'Right side first: 10 + 5 = 15' },
              { say: 'Then it puts that fifteen back into the same box, replacing the ten.', set: ['score', '15'] }
            ]
          },
          {
            layout: 'code',
            title: 'What will this print?',
            code: ['x = 5', 'x = x + 1', 'x = x * 2', 'print(x)'],
            say: 'Your turn to think like the computer. Read it from top to bottom.',
            steps: [
              { say: 'Line one puts five into x.', lines: [1], note: 'x is 5' },
              { say: 'Line two adds one, so x becomes six.', lines: [2], note: 'x is now 6' },
              { say: 'Line three doubles it, so x becomes twelve.', lines: [3], note: 'x is now 12' },
              { say: 'So what will line four print? Have a guess!', lines: [4], ask: { question: 'What will print(x) show?', answer: '12' } },
              { say: "Let's run it: print shows twelve.", output: ['12'] }
            ]
          }
        ],
        check: {
          concept: 'reassignment',
          question: 'What does this program print?',
          code: 'x = 5\nx = x + 1\nprint(x)',
          options: ['5', '6', 'x + 1', '51'],
          answer: '6',
          mistakes: {
            '5': 'Thinks the first value is kept',
            'x + 1': 'Thinks Python prints the formula instead of its result',
            '51': 'Joins the numbers instead of adding them'
          },
          explanation: 'x starts at 5. Then x + 1 is 6, and that 6 is stored back into x.'
        },
        remediation: [
          callout('warning', 'Read the right side first: x + 1 uses the current value of x.'),
          paragraph('x is 5, so x + 1 is 6. Python stores the 6 in x, replacing the 5.')
        ]
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Numbers, text and True/False',
        purpose: 'Introduce the basic data types: int, float, str and bool.',
        objectives: ['Name the four basic types', 'Tell the number 3 from the text "3"'],
        blocks: [
          paragraph('Every value has a type. Python works out the type from how you write the value.'),
          codeBlock('age = 13\nprice = 9.5\nname = "Layla"\nis_ready = True\nprint(type(age))\nprint(type(name))', "<class 'int'>\n<class 'str'>"),
          list('int: whole numbers, like 42', 'float: numbers with a decimal point, like 9.5', 'str: text, always in quotes, like "Layla"', 'bool: True or False'),
          callout('tip', 'Quotes make text. 3 is a number, but "3" is text.')
        ],
        board: [
          {
            layout: 'statement',
            title: 'Is 3 the same as "3"?',
            sub: 'They look alike. They behave very differently.',
            icon: 'lightbulb',
            say: 'Quick puzzle: is the number three the same as the text three, in quotes?',
            steps: [
              { say: 'To you they look alike.', text: '3', color: 'blue' },
              { say: 'But to Python they are two different kinds of things.', text: '"3"', color: 'teal' }
            ]
          },
          {
            layout: 'cards',
            title: 'Four basic kinds of values',
            say: 'Python has a few basic kinds of values. We call them data types.',
            steps: [
              { title: 'int', example: '42', detail: 'whole numbers', color: 'blue', say: 'Whole numbers are integers, written int.' },
              { title: 'float', example: '9.5', detail: 'numbers with a decimal point', color: 'mango', say: 'Numbers with a decimal point are floats.' },
              { title: 'str', example: '"Layla"', detail: 'text, always inside quotes', color: 'teal', say: 'Text is called a string. It always sits inside quotes.' },
              { title: 'bool', example: 'True', detail: 'yes or no: True or False', color: 'pink', say: 'And True or False are booleans, perfect for yes or no questions.' }
            ]
          },
          {
            layout: 'boxes',
            title: 'Python picks the type for you',
            say: "You don't have to tell Python the type. It works it out from the value.",
            steps: [
              { say: 'Age holds a whole number, so Python calls it an int.', line: 'age = 13', set: ['age', '13'] },
              { say: 'Price has a decimal point, so it is a float.', line: 'price = 9.5', set: ['price', '9.5'] },
              { say: 'Name sits inside quotes, so it is a string.', line: 'name = "Layla"', set: ['name', '"Layla"'] },
              { say: 'And is_ready holds True, which makes it a boolean.', line: 'is_ready = True', set: ['is_ready', 'True'] }
            ]
          },
          {
            layout: 'compare',
            title: 'Number or text?',
            left: { title: 'Numbers', color: 'blue' },
            right: { title: 'Text', color: 'teal' },
            say: 'Why does the type matter? Watch what plus does.',
            steps: [
              { side: 'left', text: '3 + 3  →  6', mono: true, say: 'With numbers, three plus three makes six.' },
              { side: 'right', text: '"3" + "3"  →  "33"', mono: true, say: 'With text, plus glues the pieces together, so you get thirty-three.' },
              { side: 'right', text: 'In quotes = text', say: "Quotes are the clue. If it's in quotes, it's text, even when it looks like a number." }
            ]
          }
        ],
        check: {
          concept: 'data_types',
          question: 'Which of these values is a string?',
          code: null,
          options: ['42', '9.5', '"42"', 'True'],
          answer: '"42"',
          mistakes: {
            '42': 'Thinks any number is text',
            True: 'Thinks True is text instead of a boolean'
          },
          explanation: 'Anything inside quotes is a string, even when it is made of digits.'
        },
        remediation: [
          callout('warning', 'Look for the quotes. No quotes around digits means a number. Quotes mean text.'),
          paragraph('"42" has quotes, so Python treats it as text. 42 without quotes is an int.')
        ]
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Naming and using variables',
        purpose: 'Teach naming rules and show variables used inside a small program.',
        objectives: ['Choose clear variable names', 'Use variables in print() and in calculations'],
        blocks: [
          paragraph('Python lets you choose almost any name, but good names make programs easy to read. Use lowercase words joined with underscores.'),
          codeBlock('name = "Layla"\nage = 13\nprint("Hello", name)\nprint("Next year you will be", age + 1)', 'Hello Layla\nNext year you will be 14'),
          list('No spaces: use my_score, not my score', 'Names cannot start with a digit', 'Pick names that explain themselves: age, not x'),
          callout('tip', 'A good name saves you from a comment.')
        ],
        board: [
          {
            layout: 'compare',
            title: 'Names should explain themselves',
            left: { title: 'Hard to use', color: 'pink' },
            right: { title: 'Easy to use', color: 'teal' },
            say: 'Python lets you pick almost any name, but some names are kinder to your future self.',
            steps: [
              { side: 'left', text: 'x = 13', mono: true, say: 'The name x tells us nothing. Is it an age? A score?' },
              { side: 'right', text: 'age = 13', mono: true, say: 'The name age says exactly what is inside.' },
              { side: 'left', text: 'my score = 10', mono: true, say: 'A space splits the name in two, and Python gets confused.' },
              { side: 'right', text: 'my_score = 10', mono: true, say: 'An underscore joins the words and keeps Python happy.' },
              { side: 'left', text: '2fast = 1', mono: true, say: 'A name can never start with a digit.' },
              { side: 'right', text: 'fast2 = 1', mono: true, say: 'But digits are fine after the first letter.' }
            ]
          },
          {
            layout: 'code',
            title: 'Variables at work',
            code: ['name = "Layla"', 'age = 13', 'print("Hello", name)', 'print("Next year you will be", age + 1)'],
            say: 'Now let us put variables to work inside a small program.',
            steps: [
              { say: 'First we store a name and an age.', lines: [1, 2], note: 'Two boxes: name and age' },
              { say: 'Print can use the variable name, and Python swaps in the value.', lines: [3], note: 'name becomes "Layla"', output: ['Hello Layla'] },
              { say: 'We can even do maths with a variable: age plus one gives fourteen.', lines: [4], note: 'age + 1 is 14', output: ['Hello Layla', 'Next year you will be 14'] }
            ]
          },
          {
            layout: 'recap',
            title: 'Variables: your checklist',
            say: 'Let us finish with a quick checklist.',
            steps: [
              { text: 'A variable is a named box that holds a value', say: 'A variable is a named box that holds a value.' },
              { text: 'A new value replaces the old one', say: 'Giving it a new value replaces the old one.' },
              { text: 'Basic types: int, float, str, bool', say: 'The basic types are int, float, str and bool.' },
              { text: 'Pick clear names: my_score, not x', say: 'And always pick clear names, like my_score instead of x.' }
            ]
          }
        ],
        check: {
          concept: 'naming',
          question: "Which is the best variable name for a player's score?",
          code: null,
          options: ['x', 'my score', 'player_score', '2score'],
          answer: 'player_score',
          mistakes: {
            x: 'Chooses a short name over a clear one',
            'my score': 'Forgets that names cannot contain spaces',
            '2score': 'Forgets that names cannot start with a digit'
          },
          explanation: 'player_score is clear, has no spaces and does not start with a digit.'
        },
        remediation: [
          callout('warning', 'Names cannot have spaces or start with a digit. Use underscores between words.'),
          paragraph('player_score says what it holds and follows all the naming rules.')
        ]
      }
    ],

    conclusion: [
      paragraph('Great work! You now know that a variable is a named box, that its value can change, and that every value has a type.'),
      callout('tip', 'Next up: loops, which let a program repeat work without copying code.')
    ]
  }
};
