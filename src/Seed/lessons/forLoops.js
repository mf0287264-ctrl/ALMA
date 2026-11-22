/**
 * Lesson 2: Python for loops
 *
 * Editable source of the lesson (see variables.js for how the parts fit together).
 * Run `npm run seed:lessons` after editing to rebuild the whiteboards and save the lesson.
 */

import { callout, codeBlock, list, paragraph } from '../blocks.js';

export default {
  module: {
    title: 'Loops',
    order: 2,
    description: 'Make Python repeat work for you with for loops and range().',
    objectives: ['Explain why programs repeat work', 'Use range() to count', 'Write and read a for loop']
  },

  lesson: {
    topic: 'Python for loops',
    grade_level: 'Grade 8',
    target_duration_minutes: 7,

    introduction: [
      paragraph('Computers are brilliant at boring work: they never get tired of repeating. A loop tells Python to repeat something for you.'),
      callout('tip', 'If you ever want to copy and paste a line of code, a loop is probably the better answer.')
    ],

    sections: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Why loops?',
        purpose: 'Show why repeating work by hand does not scale and how a loop fixes it.',
        objectives: ['Explain what a loop is for', 'Describe the three moves of a loop'],
        blocks: [
          paragraph('A loop repeats a block of code. Instead of writing the same line a hundred times, you write it once and tell Python how many times to run it.'),
          codeBlock('for i in range(3):\n    print("Hello")', 'Hello\nHello\nHello'),
          list('Loops save typing and avoid mistakes', 'Change one number to change how many repeats', 'Every loop picks a value, runs the body, then checks if there is more'),
          callout('tip', 'Whenever you catch yourself copying a line, ask: could a loop do this?')
        ],
        board: [
          {
            layout: 'statement',
            title: 'Say hello one hundred times.',
            sub: 'Would you type it one hundred times?',
            icon: 'pencil_edit',
            say: 'Imagine your teacher asks you to print the word Hello one hundred times.',
            steps: [
              { say: 'You could type print Hello again, and again, and again.', text: 'print("Hello") × 100', color: 'pink' },
              { say: "That's slow and boring, and one typo means hunting through a hundred lines.", text: 'Slow and error-prone', color: 'pink' },
              { say: 'There is a smarter way, and it is called a loop.', text: 'A loop repeats for you', color: 'teal' }
            ]
          },
          {
            layout: 'compare',
            title: 'Typing it out vs using a loop',
            left: { title: 'Typing it out', color: 'pink' },
            right: { title: 'Using a loop', color: 'teal' },
            say: "Let's put the two approaches side by side.",
            steps: [
              { side: 'left', text: 'print("Hello")', mono: true, say: 'Typing it out means one line for every single Hello.' },
              { side: 'left', text: '…and 99 more lines like this', say: 'A hundred Hellos means a hundred lines.' },
              { side: 'right', code: ['for i in range(100):', '    print("Hello")'], say: 'With a loop, two short lines do the same job.' },
              { side: 'right', text: 'Need 1000? Change one number.', say: 'And if you need a thousand Hellos, you change a single number.' }
            ]
          },
          {
            layout: 'flow',
            title: 'How a loop thinks',
            loop: 'repeat',
            say: "Here's the idea behind every loop, in three moves.",
            steps: [
              { title: 'Next value', detail: 'i becomes 0, then 1, then 2...', say: 'First, Python picks the next value to work with.' },
              { title: 'Run the body', detail: 'the indented lines', say: 'Second, it runs the indented lines, the body of the loop, once.' },
              { title: 'Any left?', detail: 'yes: go back. no: stop', say: 'Third, it asks: any values left? If yes, it jumps back to the start. If not, the loop is finished.' }
            ]
          },
          {
            layout: 'recap',
            title: 'Why loops?',
            say: 'So why do we love loops?',
            steps: [
              { text: 'Loops repeat work so you do not have to', say: 'They repeat the work so you do not have to.' },
              { text: 'Less typing means fewer mistakes', say: 'Less typing means fewer mistakes.' },
              { text: 'Change one number, change the result', say: 'And changing one number changes the whole result.' }
            ]
          }
        ],
        check: {
          concept: 'loop_purpose',
          question: 'Which job is a loop best for?',
          code: null,
          options: ['Printing your name once', 'Adding two numbers once', 'Printing Hello 100 times', 'Storing one value'],
          answer: 'Printing Hello 100 times',
          mistakes: {
            'Printing your name once': 'Does not see that loops are for repeated work',
            'Adding two numbers once': 'Does not see that loops are for repeated work',
            'Storing one value': 'Mixes up loops with variables'
          },
          explanation: 'A loop is for repeating work. Printing Hello a hundred times is exactly that.'
        },
        remediation: [
          callout('warning', 'Ask yourself: does this need to happen many times? If yes, use a loop.'),
          paragraph('Printing a name once or adding two numbers once happens only one time, so no loop is needed.')
        ]
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Counting with range()',
        purpose: 'Explain that range(n) starts at 0 and stops before n, and show its three forms.',
        objectives: ['Predict the numbers range(n) produces', 'Use start, stop and step'],
        blocks: [
          paragraph('range(5) gives the numbers 0, 1, 2, 3 and 4. It starts at 0 and stops just before 5. A for loop runs once for each number.'),
          codeBlock('for i in range(5):\n    print(i)', '0\n1\n2\n3\n4'),
          list('range(5) gives 0 to 4', 'range(1, 6) gives 1 to 5', 'range(0, 10, 2) gives 0, 2, 4, 6, 8'),
          callout('warning', 'The stop value is never included. range(5) never produces 5.')
        ],
        board: [
          {
            layout: 'statement',
            title: 'Where does Python start counting?',
            sub: 'Not where you think.',
            icon: 'target',
            say: "Here's a surprise: when Python counts, it starts at zero, not one.",
            steps: [
              { say: 'So the very first number is zero.', text: 'First number: 0', color: 'teal' },
              { say: 'And it stops one short of the number you give it.', text: 'Stops before the end', color: 'pink' }
            ]
          },
          {
            layout: 'numberline',
            title: 'range(5) makes five numbers',
            ticks: [0, 1, 2, 3, 4, 5],
            say: 'Let us see what range of five really gives us.',
            steps: [
              { mark: [0], label: 'start here', labelAt: 0, color: 'teal', say: 'It starts at zero.' },
              { mark: [1, 2, 3, 4], color: 'teal', say: 'Then one, two, three and four. That is five numbers in total.' },
              { hollow: [5], label: 'stops BEFORE 5', labelAt: 5, say: 'But five itself is left out. Range stops just before the number you give it.' }
            ]
          },
          {
            layout: 'trace',
            title: 'range() cheat sheet',
            columns: ['Code', 'Numbers'],
            rows: [
              ['range(5)', '0 1 2 3 4'],
              ['range(1, 6)', '1 2 3 4 5'],
              ['range(0, 10, 2)', '0 2 4 6 8']
            ],
            say: 'Range can take more than one number. Let us build a little cheat sheet.',
            steps: [
              { say: 'One number is the stop. Range of five counts from zero up to four.' },
              { say: 'Two numbers are the start and the stop. Range of one comma six counts from one up to five.' },
              { say: 'A third number is the step size. Counting by twos gives zero, two, four, six and eight.' }
            ]
          },
          {
            layout: 'code',
            title: 'Our first for loop',
            code: ['for i in range(5):', '    print(i)'],
            say: 'Now we put range to work inside a for loop.',
            steps: [
              { say: 'The first line says: for every number i in range of five...', lines: [1], note: 'i takes each number from range(5)' },
              { say: '...run the indented line below. That is the body of the loop.', lines: [2], note: 'runs once for each number' },
              {
                say: 'Before I run it, can you guess what it prints?',
                ask: { question: 'What will this loop print? Type the numbers with spaces between them.', answer: '0 1 2 3 4' }
              },
              { say: "Let's see: zero, one, two, three and four, one per line.", output: ['0', '1', '2', '3', '4'] }
            ]
          }
        ],
        check: {
          concept: 'zero_indexing',
          question: 'What does range(5) produce?',
          code: 'for i in range(5):\n    print(i)',
          options: ['0 to 4', '1 to 5', '0 to 5', '1 to 4'],
          answer: '0 to 4',
          mistakes: {
            '1 to 5': 'Assumes range() starts counting at 1',
            '0 to 5': 'Thinks the stop value is included',
            '1 to 4': 'Mixes up both the start and the stop'
          },
          explanation: 'range(5) starts at 0 and stops before 5, so you get 0, 1, 2, 3, 4.'
        },
        remediation: [
          callout('warning', 'Remember: range(n) starts at 0 and stops before n.'),
          paragraph('If you want the numbers 1 to 5, write range(1, 6): the stop value 6 is not included.')
        ]
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'The loop body',
        purpose: 'Show that indentation marks the loop body and trace a loop lap by lap.',
        objectives: ['Tell loop body lines from lines after the loop', 'Trace a loop with a table'],
        blocks: [
          paragraph('The body of a loop is the indented block under the for line. Lines that are not indented run only once, after the loop ends.'),
          codeBlock('for i in range(3):\n    print("Hello")\n    print("World")\nprint("Done")', 'Hello\nWorld\nHello\nWorld\nHello\nWorld\nDone'),
          list('Indented lines repeat', 'The loop variable changes on every lap', 'Tracing with a table shows what the computer does'),
          callout('tip', 'Four spaces of indentation is the Python habit.')
        ],
        board: [
          {
            layout: 'code',
            title: 'Indentation is the body',
            code: ['for i in range(3):', '    print("Hello")', '    print("World")', 'print("Done")'],
            say: 'The body of a loop is everything indented under the for line.',
            steps: [
              { say: 'These two lines are pushed to the right, so they belong to the loop and repeat every lap.', lines: [2, 3], note: 'Indented = repeated' },
              { say: "This last line isn't indented, so it runs once, after the loop has finished.", lines: [4], note: 'Not indented = runs once' },
              { say: 'So we get Hello and World three times, and then Done.', output: ['Hello', 'World', 'Hello', 'World', 'Hello', 'World', 'Done'] }
            ]
          },
          {
            layout: 'trace',
            title: 'Tracing a loop',
            code: ['total = 0', 'for n in range(1, 4):', '    total = total + n', 'print(total)'],
            columns: ['n', 'total'],
            rows: [
              ['-', '0'],
              ['1', '1'],
              ['2', '3'],
              ['3', '6']
            ],
            say: 'Let us follow a loop like a detective, one lap at a time.',
            steps: [
              { say: 'Before the loop starts, total is zero.' },
              { say: 'First lap: n is one, so total becomes one.' },
              { say: 'Second lap: n is two, so total becomes three.' },
              { say: 'Third lap: n is three, and total reaches six.' },
              { say: 'The loop has run out of numbers. So what will the last line print?', ask: { question: 'What will print(total) show?', answer: '6' } },
              { say: 'Python moves on after the loop and prints six.', note: 'Output: 6' }
            ]
          },
          {
            layout: 'code',
            title: 'Using the loop variable',
            code: ['for i in range(1, 4):', '    print(i * 2)'],
            say: "The loop variable isn't just a counter. You can use it in your calculations.",
            steps: [
              { say: 'Here i is one, then two, then three.', lines: [1], note: 'i = 1, then 2, then 3' },
              { say: 'Each lap, the body multiplies it by two.', lines: [2], note: 'i * 2 on every lap' },
              { say: 'So the output is two, four, six.', output: ['2', '4', '6'] }
            ]
          },
          {
            layout: 'recap',
            title: 'The loop body',
            say: 'Three things to take away.',
            steps: [
              { text: 'Indented lines are the loop body', say: 'Indented lines are the body, and they repeat.' },
              { text: 'Unindented lines run once, after the loop', say: 'Lines that are not indented run just once, after the loop.' },
              { text: 'The loop variable changes on every lap', say: 'And the loop variable changes on every lap.' }
            ]
          }
        ],
        check: {
          concept: 'loop_body',
          question: 'How many times does this print Hello?',
          code: 'for i in range(4):\n    print("Hello")',
          options: ['3', '4', '5', '1'],
          answer: '4',
          mistakes: {
            '3': 'Counts one less because range starts at 0',
            '5': 'Counts range(4) as 0 to 4 included',
            '1': 'Thinks the loop body runs only once'
          },
          explanation: 'range(4) gives four values: 0, 1, 2 and 3. The body runs once for each of them.'
        },
        remediation: [
          callout('warning', 'Count the values range gives you, not the stop number.'),
          paragraph('range(4) produces 0, 1, 2, 3. That is four values, so Hello is printed four times.')
        ]
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Practice: a times table',
        purpose: 'Combine range(), a loop variable and arithmetic to build a times table.',
        objectives: ['Build a loop from a plan', 'Avoid the most common range() mistakes'],
        blocks: [
          paragraph('Let us print the 3 times table: 3, 6, 9, 12, 15. We multiply 3 by every number from 1 to 5.'),
          codeBlock('for i in range(1, 6):\n    print(3 * i)', '3\n6\n9\n12\n15'),
          list('range(1, 6) gives 1, 2, 3, 4, 5', '3 * i changes on every lap', 'The stop value is one more than the last number you want'),
          callout('warning', 'Do not forget the colon at the end of the for line.')
        ],
        board: [
          {
            layout: 'statement',
            title: 'Your turn: the 3 times table',
            sub: 'Three, six, nine, twelve, fifteen...',
            icon: 'pencil_edit',
            say: "Time to practice. Let's print the three times table together.",
            steps: [
              { say: 'The plan: multiply three by each number from one to five.', text: '3 × 1  …  3 × 5', color: 'mango' }
            ]
          },
          {
            layout: 'code',
            title: 'Build the loop',
            code: ['for i in range(1, 6):', '    print(3 * i)'],
            say: 'Here is the loop that does the job.',
            steps: [
              { say: 'We want one to five, so range starts at one and stops at six.', lines: [1], note: 'i = 1, 2, 3, 4, 5' },
              { say: 'Each lap, the body multiplies three by i and prints it.', lines: [2], note: '3 * i on every lap' },
              {
                say: 'Can you work out what it prints before we run it?',
                ask: { question: 'What does it print? Type the numbers with spaces between them.', answer: '3 6 9 12 15' }
              },
              { say: 'And out comes the times table: three, six, nine, twelve, fifteen.', output: ['3', '6', '9', '12', '15'] }
            ]
          },
          {
            layout: 'compare',
            title: 'Common mistakes',
            left: { title: 'Mistake', color: 'pink' },
            right: { title: 'Fix', color: 'teal' },
            say: 'Before you try it yourself, watch out for two classic mistakes.',
            steps: [
              { side: 'left', text: 'range(1, 5)', mono: true, say: 'This one stops at four. Where did our fifth line go?' },
              { side: 'right', text: 'range(1, 6)', mono: true, say: 'To include five, the stop value must be six.' },
              { side: 'left', text: 'for i in range(5)', mono: true, say: 'And here the colon is missing.' },
              { side: 'right', text: 'for i in range(5):', mono: true, say: 'Always finish the for line with a colon.' }
            ]
          },
          {
            layout: 'recap',
            title: 'Loops: your checklist',
            say: 'Let us finish with your loop checklist.',
            steps: [
              { text: 'for i in range(n): repeats n times', mono: true, say: 'A for loop with range repeats the body once for each number.' },
              { text: 'range(n) counts 0 up to n - 1', mono: true, say: 'Range counts from zero up to one less than n.' },
              { text: 'Indent the body and end the line with a colon', say: 'Indent the body and finish the for line with a colon.' }
            ]
          }
        ],
        check: {
          concept: 'range_start_stop',
          question: 'What does this code print?',
          code: 'for i in range(1, 4):\n    print(i + 10)',
          options: ['11, 12, 13', '10, 11, 12', '11, 12, 13, 14', '1, 2, 3'],
          answer: '11, 12, 13',
          mistakes: {
            '10, 11, 12': 'Starts i at 0 instead of 1',
            '11, 12, 13, 14': 'Thinks the stop value 4 is included',
            '1, 2, 3': 'Forgets to add 10'
          },
          explanation: 'i is 1, 2 and 3 (the stop value 4 is not included). Adding 10 gives 11, 12 and 13.'
        },
        remediation: [
          callout('warning', 'range(1, 4) starts at 1 and stops before 4: the values are 1, 2, 3.'),
          paragraph('Add 10 to each of them: 11, 12, 13.')
        ]
      }
    ],

    conclusion: [
      paragraph('Well done! You can now repeat work with a for loop, count with range() and trace what a loop does lap by lap.'),
      callout('tip', 'Next up: functions, which give a name to a block of code so you can reuse it.')
    ]
  }
};
