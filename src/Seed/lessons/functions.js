/**
 * Lesson 3: Defining functions
 *
 * Editable source of the lesson (see variables.js for how the parts fit together).
 * Run `npm run seed:lessons` after editing to rebuild the whiteboards and save the lesson.
 */

import { callout, codeBlock, list, paragraph } from '../blocks.js';

export default {
  module: {
    title: 'Functions',
    order: 3,
    description: 'Give a name to a block of code, pass values in and get results back.',
    objectives: ['Explain why we write functions', 'Define and call a function', 'Use parameters and return values']
  },

  lesson: {
    topic: 'Defining functions',
    grade_level: 'Grade 8',
    target_duration_minutes: 7,

    introduction: [
      paragraph('A function is a mini-program with a name. You write it once, and then you can use it whenever you like.'),
      callout('tip', 'You have already used functions: print() and range() are functions someone else wrote for you.')
    ],

    sections: [
      /* ---------------------------------------------------------------- 1 */
      {
        title: 'Why functions?',
        purpose: 'Show how functions remove repeated code and introduce the input-process-output idea.',
        objectives: ['Explain what a function is for', 'Describe a function as input, steps and output'],
        blocks: [
          paragraph('A function is a named block of code. Instead of copying the same lines again and again, you put them in a function and call it by name.'),
          codeBlock('def greet():\n    print("Welcome!")\n\ngreet()\ngreet()', 'Welcome!\nWelcome!'),
          list('Write the code once, use it many times', 'A name tells you what the code does', 'Input goes in, a result comes out'),
          callout('tip', 'If you copy and paste code, a function is usually the better answer.')
        ],
        board: [
          {
            layout: 'statement',
            title: 'Do you reinvent the recipe every morning?',
            sub: 'A function is a recipe with a name.',
            icon: 'book',
            say: 'You make the same sandwich every morning. Do you invent a brand new recipe each time?',
            steps: [
              { say: 'Of course not. You write the recipe once.', text: 'Write it once', color: 'teal' },
              { say: 'You give it a name.', text: 'Give it a name', color: 'blue' },
              { say: 'And you use it whenever you are hungry. That is exactly what a function is.', text: 'Use it anywhere', color: 'mango' }
            ]
          },
          {
            layout: 'compare',
            title: 'Repeating vs reusing',
            left: { title: 'Copy and paste', color: 'pink' },
            right: { title: 'A function', color: 'teal' },
            say: 'Let us see why this matters in code.',
            steps: [
              { side: 'left', code: ['print("Welcome!")', 'print("Let\'s learn!")'], say: 'Here we greet one student with two lines.' },
              { side: 'left', code: ['print("Welcome!")', 'print("Let\'s learn!")'], say: 'And here we greet the next student by copying the same two lines.' },
              { side: 'left', text: 'Copy, paste, copy, paste...', say: 'Imagine doing that for a whole school.' },
              { side: 'right', code: ['def greet():', '    print("Welcome!")', '    print("Let\'s learn!")'], say: 'With a function, we write those lines once and give them a name.' },
              { side: 'right', code: ['greet()', 'greet()'], say: 'Now every greeting is one short line: the name.' }
            ]
          },
          {
            layout: 'flow',
            title: 'A function is a machine',
            say: 'Think of a function as a little machine.',
            steps: [
              { title: 'Input', detail: 'what you give it', icon: 'envelope', color: 'blue', say: 'You feed something in. That is the input.' },
              { title: 'Function', detail: 'follows its steps', icon: 'cog_icon', color: 'mango', say: 'The machine follows its instructions. That is the body of the function.' },
              { title: 'Output', detail: 'what you get back', icon: 'check', color: 'teal', say: 'And something comes out: the result.' }
            ]
          },
          {
            layout: 'recap',
            title: 'Why functions?',
            say: 'Three quick ideas to remember.',
            steps: [
              { text: 'A function is a named mini-program', say: 'A function is a mini-program with a name.' },
              { text: 'Write once, use many times', say: 'You write it once and use it many times.' },
              { text: 'Input goes in, a result comes out', say: 'Input goes in, and a result comes out.' }
            ]
          }
        ],
        check: {
          concept: 'function_purpose',
          question: 'A game needs the same greeting in several places. Define it once, then call it whenever needed. Which benefit explains this design when you edit the function body?',
          code: null,
          options: ['It makes the computer faster', 'You write code once and reuse it', 'It removes the need for variables', 'It fixes errors automatically'],
          answer: 'You write code once and reuse it',
          mistakes: {
            'It makes the computer faster': 'Thinks functions are about speed instead of reuse',
            'It removes the need for variables': 'Mixes up functions with variables',
            'It fixes errors automatically': 'Thinks functions check or repair code'
          },
          explanation: 'A function lets you write code once, give it a name and reuse it whenever you need it.'
        },
        remediation: [
          callout('warning', 'Functions are about reuse: write once, call many times.'),
          paragraph('They do not make the computer faster and they do not fix errors. They save you from copying code.')
        ]
      },

      /* ---------------------------------------------------------------- 2 */
      {
        title: 'Defining and calling',
        purpose: 'Teach the parts of a function definition and the difference between defining and calling.',
        objectives: ['Write a function with def', 'Call a function by name'],
        blocks: [
          paragraph('You create a function with the word def. The indented lines below it are the body. Defining a function does not run it: you call it by name.'),
          codeBlock('def greet():\n    print("Hello!")\n\ngreet()\ngreet()', 'Hello!\nHello!'),
          list('def + name + ( ) + : starts a function', 'The indented lines are the body', 'name() calls the function'),
          callout('warning', 'Define a function before you call it. Python reads from top to bottom.')
        ],
        board: [
          {
            layout: 'code',
            title: 'Anatomy of a function',
            code: ['def greet():', '    print("Hello!")'],
            say: 'Here is the smallest useful function.',
            steps: [
              { say: 'The first line has four parts: the word def, a name, a pair of brackets and a colon.', lines: [1], note: 'def + name + ( ) + :' },
              { say: 'Everything indented underneath is the body: the instructions the function follows.', lines: [2], note: 'The body is indented' }
            ]
          },
          {
            layout: 'code',
            title: 'Define, then call',
            code: ['def greet():', '    print("Hello!")', '', 'greet()', 'greet()'],
            say: 'Now watch what actually runs.',
            steps: [
              { say: 'Defining a function only teaches Python the recipe. Nothing is printed yet.', lines: [1, 2], note: 'Defining does NOT run it' },
              { say: 'To run it, we call it by writing its name followed by brackets.', lines: [4], note: 'Call it by name' },
              {
                say: 'We call it twice in a row. What do you think the screen will show?',
                lines: [5],
                note: 'Call it as often as you like',
                ask: { question: 'What will the program print?', answer: ['Hello!', 'Hello!'] }
              },
              { say: 'Same recipe, twice, and no copying.', output: ['Hello!', 'Hello!'] }
            ]
          },
          {
            layout: 'flow',
            title: 'Order matters',
            say: 'One more rule: Python reads your file from top to bottom.',
            steps: [
              { title: '1. Define', detail: 'def greet():', color: 'blue', say: 'So first we define the function.' },
              { title: '2. Call', detail: 'greet()', color: 'teal', say: 'Then we call it.', note: 'Calling before defining gives a NameError' }
            ]
          },
          {
            layout: 'recap',
            title: 'Define and call',
            say: 'A quick recap before we move on.',
            steps: [
              { text: 'def name(): defines a function', mono: true, say: 'Def, a name, brackets and a colon define a function.' },
              { text: 'name() calls it, as often as you like', mono: true, say: 'Writing the name with brackets calls it, as often as you like.' },
              { text: 'Define first, then call', say: 'And always define a function before you call it.' }
            ]
          }
        ],
        check: {
          concept: 'define_vs_call',
          question: 'Trace this program from top to bottom. Distinguish defining a function from calling it, and evaluate any returned value before the surrounding print. Which output follows from the calls actually present?',
          code: 'def hi():\n    print("Hi!")\n\nprint("Start")',
          options: ['Hi!', 'Start', 'Start then Hi!', 'Nothing'],
          answer: 'Start',
          mistakes: {
            'Hi!': 'Thinks defining a function runs it',
            'Start then Hi!': 'Thinks the function runs on its own',
            Nothing: 'Misses that print("Start") runs'
          },
          explanation: 'Python records the body when it reads def hi() but does not run its indented statements yet. Since the program never calls hi(), that greeting is not printed. Execution continues outside the definition, which prints Start exactly once.'
        },
        remediation: [
          callout('warning', 'Defining a function does not run it. You must call it with hi().'),
          paragraph('Here hi() is never called, so "Hi!" is never printed. Only "Start" appears.')
        ]
      },

      /* ---------------------------------------------------------------- 3 */
      {
        title: 'Parameters',
        purpose: 'Show how parameters let one function work with different values.',
        objectives: ['Add a parameter to a function', 'Tell a parameter from an argument'],
        blocks: [
          paragraph('A parameter is a variable in the brackets of the function definition. When you call the function, the value you pass in (the argument) goes into the parameter.'),
          codeBlock('def greet(name):\n    print("Hello", name)\n\ngreet("Layla")\ngreet("Omar")', 'Hello Layla\nHello Omar'),
          list('Parameter: the label in the definition', 'Argument: the real value in the call', 'Use commas for more than one: def add(a, b)'),
          callout('tip', 'A parameter only exists inside its function.')
        ],
        board: [
          {
            layout: 'statement',
            title: 'Greet Layla. Then Omar. Then you.',
            sub: 'One function, many names.',
            icon: 'person',
            say: 'Our greet function always says the same thing. What if it should greet different people by name?',
            steps: [
              { say: 'We can pass a value into the function when we call it.', text: 'Pass a value in', color: 'blue' },
              { say: 'The function receives it in a variable called a parameter.', text: 'Parameter', color: 'mango' }
            ]
          },
          {
            layout: 'boxes',
            title: 'A parameter is a variable',
            say: 'Let us watch a parameter receive its value.',
            steps: [
              { say: 'Inside the brackets we add a parameter called name. It is a variable that lives inside the function.', line: 'def greet(name):' },
              { say: 'The body can use name just like any other variable.', line: '    print("Hello", name)' },
              { say: 'When we call greet with Layla, the value Layla goes into the name box.', line: 'greet("Layla")', set: ['name', '"Layla"'], output: ['Hello Layla'] },
              { say: 'Call it with Omar, and the box now holds Omar. Same function, different result.', line: 'greet("Omar")', set: ['name', '"Omar"'], output: ['Hello Layla', 'Hello Omar'] }
            ]
          },
          {
            layout: 'compare',
            title: 'Parameter vs argument',
            left: { title: 'Parameter', color: 'blue' },
            right: { title: 'Argument', color: 'mango' },
            say: 'Two words that sound alike but mean different things.',
            steps: [
              { side: 'left', text: 'def greet(name):', mono: true, say: 'A parameter is the label in the definition.' },
              { side: 'left', text: 'a placeholder for a value', say: 'It is a placeholder waiting for a value.' },
              { side: 'right', text: 'greet("Layla")', mono: true, say: 'An argument is the real value you pass in the call.' },
              { side: 'right', text: 'the value that fills the box', say: 'It is the value that fills the parameter box.' }
            ]
          },
          {
            layout: 'code',
            title: 'More than one parameter',
            code: ['def add(a, b):', '    print(a + b)', '', 'add(2, 3)'],
            say: 'A function can take several parameters, separated by commas.',
            steps: [
              { say: 'This function has two parameters: a and b.', lines: [1], note: 'Two parameters: a and b' },
              { say: 'We call it with two and three. Two goes into a, three goes into b, and the function prints five.', lines: [4], note: 'a = 2 and b = 3', output: ['5'] }
            ]
          }
        ],
        check: {
          concept: 'parameters',
          question: 'In def greet(name):, consider a later call greet("Layla"). What role does name play in the definition, and how does it receive the supplied value for this call?',
          code: null,
          options: ['A parameter', 'An argument', 'A function call', 'A string'],
          answer: 'A parameter',
          mistakes: {
            'An argument': 'Mixes up the label in the definition with the value in the call',
            'A function call': 'Thinks a definition line is a call',
            'A string': 'Confuses the variable with the value it may hold'
          },
          explanation: 'name is a parameter: a local name in the function definition. The call greet("Layla") supplies the argument "Layla", which is bound to name for that call. Another call can bind a different argument without changing the definition.'
        },
        remediation: [
          callout('warning', 'Parameter = in the definition. Argument = in the call.'),
          paragraph('In def greet(name): the word name is a parameter. In greet("Layla") the text "Layla" is the argument.')
        ]
      },

      /* ---------------------------------------------------------------- 4 */
      {
        title: 'Returning values',
        purpose: 'Contrast print() and return and show how a returned value can be stored.',
        objectives: ['Use return to give a value back', 'Tell print() from return'],
        blocks: [
          paragraph('print() shows a value on the screen. return hands a value back to the code that called the function, so you can store it or use it in a calculation.'),
          codeBlock('def square(n):\n    return n * n\n\nresult = square(4)\nprint(result)', '16'),
          list('return sends a value back to the caller', 'The call becomes that value', 'Store it: result = square(4)'),
          callout('tip', 'Use print() to show things. Use return to give back an answer.')
        ],
        board: [
          {
            layout: 'compare',
            title: 'print() vs return',
            left: { title: 'print()', color: 'blue' },
            right: { title: 'return', color: 'mango' },
            say: 'Functions can show a value or give it back. These are not the same thing.',
            steps: [
              { side: 'left', text: 'Shows a value on the screen', say: 'Print shows a value on the screen.' },
              { side: 'left', text: 'The program cannot use it later', say: 'But the program cannot use that value afterwards.' },
              { side: 'right', text: 'Hands a value back to the caller', say: 'Return hands a value back to whoever called the function.' },
              { side: 'right', text: 'You can store it in a variable', say: 'And that value can be stored in a variable.' }
            ]
          },
          {
            layout: 'code',
            title: 'A function that returns',
            code: ['def square(n):', '    return n * n', '', 'result = square(4)', 'print(result)'],
            say: 'Let us write a function that gives an answer back.',
            steps: [
              { say: 'Square takes a number n as its input.', lines: [1], note: 'n is the input' },
              { say: 'Return hands the answer back to whoever called the function.', lines: [2], note: 'return sends it back' },
              { say: 'When we call square of four, the call itself turns into sixteen, and sixteen is stored in result.', lines: [4], note: 'square(4) becomes 16' },
              { say: 'Now print shows what is inside result. What will it be?', lines: [5], ask: { question: 'What will print(result) show?', answer: '16' } },
              { say: 'Sixteen, just as the machine promised.', output: ['16'] }
            ]
          },
          {
            layout: 'flow',
            title: 'Following the call',
            say: 'Let us follow that call, step by step, like a machine.',
            steps: [
              { title: 'square(4)', detail: 'input: n = 4', icon: 'envelope', color: 'blue', say: 'We feed four into the function.' },
              { title: 'n * n', detail: '4 times 4', icon: 'cog_icon', color: 'mango', say: 'The body multiplies four by four.' },
              { title: 'return 16', detail: 'back to the caller', icon: 'check', color: 'teal', say: 'And return hands sixteen back.' }
            ]
          },
          {
            layout: 'recap',
            title: 'Functions: your checklist',
            say: 'You made it! Here is everything about functions in four lines.',
            steps: [
              { text: 'def name(parameters): defines a function', mono: true, say: 'Def, a name and parameters define a function.' },
              { text: 'name(arguments) calls it', mono: true, say: 'Writing its name with arguments calls it.' },
              { text: 'return gives a value back', mono: true, say: 'Return gives a value back to the caller.' },
              { text: 'Write once, reuse everywhere', say: 'And the big idea: write once, reuse everywhere.' }
            ]
          }
        ],
        check: {
          concept: 'return_values',
          question: 'Trace this program from top to bottom. Distinguish defining a function from calling it, and evaluate any returned value before the surrounding print. Which output follows from the calls actually present?',
          code: 'def double(n):\n    return n * 2\n\nprint(double(5))',
          options: ['5', '10', 'n * 2', 'Nothing'],
          answer: '10',
          mistakes: {
            '5': 'Prints the argument instead of the returned value',
            'n * 2': 'Thinks Python prints the formula instead of its result',
            Nothing: 'Thinks a function with return cannot be printed'
          },
          explanation: 'Calling double(5) binds n to 5. The body evaluates n * 2 as 10 and returns that value. The call expression becomes 10, so the outer print receives 10 and displays it. Returning and displaying are separate steps.'
        },
        remediation: [
          callout('warning', 'A call to a function that returns a value turns into that value.'),
          paragraph('double(5) becomes 10, so print(double(5)) is the same as print(10).')
        ]
      }
    ],

    conclusion: [
      paragraph('Fantastic! You can now define functions, call them, pass values in with parameters and get answers back with return.'),
      callout('tip', 'Try writing a function of your own: one that takes a name and returns a greeting.')
    ]
  }
};
