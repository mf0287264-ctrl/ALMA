import { MongoClient, ObjectId } from 'mongodb';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ALMA';

async function seedAssessmentsAndQuizzes() {
  const client = await MongoClient.connect(MONGO_URI);
  const db = client.db();

  console.log('Connecting to database...');

  // Get courses
  const courses = await db.collection('courses').find({}).toArray();
  if (courses.length === 0) {
    console.error('No courses found! Please ensure courses are seeded first.');
    await client.close();
    return;
  }

  const pythonCourse = courses.find((c) => c.title.toLowerCase().includes('python')) || courses[0];
  const dataCourse = courses.find((c) => c.title.toLowerCase().includes('data')) || courses[1] || courses[0];
  const algoCourse = courses.find((c) => c.title.toLowerCase().includes('algo')) || courses[2] || courses[0];

  // 1. SEED ASSESSMENTS
  await db.collection('assessments').deleteMany({});

  const assessmentsData = [
    {
      course_id: pythonCourse._id,
      module_id: null,
      title: 'Intro to Python: Midterm Assessment',
      description: 'Test your understanding of variables, conditionals, loops, and functions.',
      total_points: 100,
      passing_score: 60,
      status: 'published',
      generated_by_ai: true,
      questions: [
        {
          _id: new ObjectId(),
          question_text: 'What keyword is used to start a loop in Python?',
          question_type: 'mcq',
          options: ['loop', 'for', 'iterate', 'repeat'],
          correct_answer: 'for',
          points: 10,
          explanation: 'In Python, loops are declared using "for" or "while".',
        },
        {
          _id: new ObjectId(),
          question_text: 'How many times does range(4) execute?',
          question_type: 'mcq',
          options: ['3 times', '4 times', '5 times', 'Infinite'],
          correct_answer: '4 times',
          points: 10,
          explanation: 'range(4) produces 0, 1, 2, 3 which is exactly 4 iterations.',
        },
        {
          _id: new ObjectId(),
          question_text: 'What does range(3) produce?',
          question_type: 'mcq',
          options: ['1, 2, 3', '0, 1, 2', '0, 1, 2, 3', '1, 2'],
          correct_answer: '0, 1, 2',
          points: 10,
          explanation: 'Default start is 0, and the stop value is exclusive.',
        },
        {
          _id: new ObjectId(),
          question_text: 'Write a loop that prints numbers from 1 to 5.',
          question_type: 'coding',
          options: ['range(1, 5)', 'range(1, 6)', 'range(0, 5)', 'range(5)'],
          correct_answer: 'range(1, 6)',
          points: 15,
          explanation: 'To include 5, range(1, 6) starts at 1 and stops before 6.',
        },
        {
          _id: new ObjectId(),
          question_text: 'What is the starting index in Python range() by default?',
          question_type: 'mcq',
          options: ['0', '1', '-1', 'Depends on list length'],
          correct_answer: '0',
          points: 10,
          explanation: 'range(n) starts at 0 unless a custom start is given.',
        },
        {
          _id: new ObjectId(),
          question_text: 'Why does a loop need an exit condition?',
          question_type: 'short_answer',
          options: [
            'To prevent infinite loops and memory leaks',
            'To make code faster',
            'Because Python requires it syntactically',
            'To allow nesting',
          ],
          correct_answer: 'To prevent infinite loops and memory leaks',
          points: 15,
          explanation: 'Without a termination condition, loops run indefinitely.',
        },
        {
          _id: new ObjectId(),
          question_text: 'What is the output of range(2, 8, 2)?',
          question_type: 'coding',
          options: ['[2, 4, 6, 8]', '[2, 4, 6]', '[2, 3, 4, 5, 6, 7]', '[4, 6, 8]'],
          correct_answer: '[2, 4, 6]',
          points: 15,
          explanation: 'Starts at 2, increments by 2, and stops before 8: 2, 4, 6.',
        },
        {
          _id: new ObjectId(),
          question_text: 'Which function converts a range object into a displayable list?',
          question_type: 'mcq',
          options: ['to_list()', 'list()', 'array()', 'enumerate()'],
          correct_answer: 'list()',
          points: 15,
          explanation: 'list(range(...)) converts a range generator into a list.',
        },
      ],
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      course_id: dataCourse._id,
      module_id: null,
      title: 'Data Basics: Lists & Dictionaries Assessment',
      description: 'Comprehensive evaluation of list indexing, slicing, and dictionary lookups.',
      total_points: 100,
      passing_score: 70,
      status: 'published',
      generated_by_ai: true,
      questions: [
        {
          _id: new ObjectId(),
          question_text: 'What index accesses the first element of a Python list?',
          question_type: 'mcq',
          options: ['0', '1', '-1', 'first'],
          correct_answer: '0',
          points: 10,
          explanation: 'Python uses zero-based indexing.',
        },
        {
          _id: new ObjectId(),
          question_text: 'Which method adds a new element to the end of a list?',
          question_type: 'mcq',
          options: ['push()', 'append()', 'insert()', 'add()'],
          correct_answer: 'append()',
          points: 10,
          explanation: 'list.append(x) places x at the end of the list.',
        },
        {
          _id: new ObjectId(),
          question_text: 'What is the value of nums[-1] for nums = [10, 20, 30]?',
          question_type: 'mcq',
          options: ['10', '20', '30', 'Error'],
          correct_answer: '30',
          points: 15,
          explanation: 'Negative index -1 accesses the last item.',
        },
        {
          _id: new ObjectId(),
          question_text: 'What does nums[1:3] return for nums = [0, 1, 2, 3, 4]?',
          question_type: 'coding',
          options: ['[1, 2]', '[1, 2, 3]', '[0, 1, 2]', '[2, 3]'],
          correct_answer: '[1, 2]',
          points: 15,
          explanation: 'Slice starts at index 1 and stops before index 3.',
        },
        {
          _id: new ObjectId(),
          question_text: 'Which data structure stores key-value pairs in Python?',
          question_type: 'mcq',
          options: ['List', 'Dictionary', 'Tuple', 'Set'],
          correct_answer: 'Dictionary',
          points: 15,
          explanation: 'Dictionaries map unique keys to values.',
        },
        {
          _id: new ObjectId(),
          question_text: 'How do you check if a key exists in a dictionary `data`?',
          question_type: 'short_answer',
          options: ['key in data', 'data.has(key)', 'data.contains(key)', 'exists(key, data)'],
          correct_answer: 'key in data',
          points: 15,
          explanation: 'The `in` keyword checks key existence in O(1) average time.',
        },
        {
          _id: new ObjectId(),
          question_text: 'What happens when accessing a non-existent key with `dict[key]`?',
          question_type: 'mcq',
          options: ['Returns None', 'Raises KeyError', 'Returns 0', 'Creates the key'],
          correct_answer: 'Raises KeyError',
          points: 20,
          explanation: 'Direct subscripting raises a KeyError; use .get() to return None.',
        },
      ],
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      course_id: algoCourse._id,
      module_id: null,
      title: 'Algorithms Lab: Search & Complexity Assessment',
      description: 'Evaluates problem decomposition, linear search, and binary search conditions.',
      total_points: 100,
      passing_score: 65,
      status: 'published',
      generated_by_ai: true,
      questions: [
        {
          _id: new ObjectId(),
          question_text: 'What prerequisite must data satisfy before performing Binary Search?',
          question_type: 'mcq',
          options: ['Must be sorted', 'Must contain only positive numbers', 'Must be a linked list', 'Must have even length'],
          correct_answer: 'Must be sorted',
          points: 15,
          explanation: 'Binary Search relies on sorted order to divide the search space in half.',
        },
        {
          _id: new ObjectId(),
          question_text: 'What is the worst-case time complexity of Linear Search on n items?',
          question_type: 'mcq',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n^2)'],
          correct_answer: 'O(n)',
          points: 15,
          explanation: 'Linear Search inspects every item one-by-one in the worst case.',
        },
        {
          _id: new ObjectId(),
          question_text: 'What is the time complexity of Binary Search on n sorted elements?',
          question_type: 'mcq',
          options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
          correct_answer: 'O(log n)',
          points: 15,
          explanation: 'Each comparison eliminates half of the remaining elements.',
        },
        {
          _id: new ObjectId(),
          question_text: 'In problem decomposition, what is the first step?',
          question_type: 'short_answer',
          options: [
            'Break the complex problem into smaller, independent subproblems',
            'Write code directly in the compiler',
            'Optimize memory allocation',
            'Implement parallel threads',
          ],
          correct_answer: 'Break the complex problem into smaller, independent subproblems',
          points: 25,
          explanation: 'Decomposition divides large problems into manageable subtasks.',
        },
        {
          _id: new ObjectId(),
          question_text: 'If target is greater than mid in Binary Search, where do you search next?',
          question_type: 'coding',
          options: ['Right half (low = mid + 1)', 'Left half (high = mid - 1)', 'Stop search', 'Restart from index 0'],
          correct_answer: 'Right half (low = mid + 1)',
          points: 30,
          explanation: 'Since the array is sorted, larger items must reside in the right half.',
        },
      ],
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const assessmentResults = await db.collection('assessments').insertMany(assessmentsData);
  console.log(`Seeded ${assessmentResults.insertedCount} assessments connected to courses.`);

  // 2. SEED QUIZZES
  await db.collection('quizzes').deleteMany({});

  const quizzesData = [
    {
      course_id: pythonCourse._id,
      lesson_id: null,
      title: 'Python Loops & Range Quiz',
      description: 'Quick 5-question test on for loops, range() syntax, and step values.',
      status: 'published',
      generated_by_ai: true,
      questions: [
        {
          _id: new ObjectId(),
          question: 'What does range(5) produce in Python?',
          options: [
            'Numbers from 0 to 4',
            'Numbers from 1 to 5',
            'Numbers from 0 to 5',
            'Numbers from 1 to 4',
          ],
          correct_option_index: 0,
          explanation: 'range(5) starts at 0 by default and produces 5 integers: 0, 1, 2, 3, 4.',
        },
        {
          _id: new ObjectId(),
          question: 'Which loop prints 0, 1 and 2?',
          options: [
            'for i in range(3): print(i)',
            'for i in range(1, 3): print(i)',
            'for i in range(4): print(i)',
            'while i < 3: print(i)',
          ],
          correct_option_index: 0,
          explanation: 'range(3) gives 0, 1 and 2. The stop value is not included.',
        },
        {
          _id: new ObjectId(),
          question: 'What is the step value if not specified in range(start, stop)?',
          options: ['0', '1', '2', '-1'],
          correct_option_index: 1,
          explanation: 'The default increment step for range() is 1.',
        },
        {
          _id: new ObjectId(),
          question: 'What will range(2, 6) output when iterated?',
          options: ['2, 3, 4, 5', '2, 3, 4, 5, 6', '0, 1, 2, 3, 4, 5', '3, 4, 5'],
          correct_option_index: 0,
          explanation: 'It starts at 2 and stops just before 6.',
        },
        {
          _id: new ObjectId(),
          question: 'How do you count down from 5 to 1 using range()?',
          options: [
            'range(5, 0, -1)',
            'range(5, 1, -1)',
            'range(1, 5, -1)',
            'range(5, -1)',
          ],
          correct_option_index: 0,
          explanation: 'range(5, 0, -1) starts at 5, decrements by 1 on each step, and stops before 0.',
        },
      ],
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      course_id: pythonCourse._id,
      lesson_id: null,
      title: 'Python Variables & Types Quiz',
      description: 'Test your mastery over assignments, integers, strings, and booleans.',
      status: 'published',
      generated_by_ai: true,
      questions: [
        {
          _id: new ObjectId(),
          question: 'Which is a valid variable name in Python?',
          options: ['user_age', '2nd_user', 'user-name', 'class'],
          correct_option_index: 0,
          explanation: 'Variable names cannot start with numbers, contain hyphens, or use reserved keywords like "class".',
        },
        {
          _id: new ObjectId(),
          question: 'What is the data type of the expression `3.14` in Python?',
          options: ['float', 'int', 'decimal', 'double'],
          correct_option_index: 0,
          explanation: 'Numbers with fractional points in Python are floats.',
        },
        {
          _id: new ObjectId(),
          question: 'What does the function `type("Hello")` return?',
          options: ["<class 'str'>", "<class 'string'>", "<class 'text'>", "<class 'char'>"],
          correct_option_index: 0,
          explanation: "In Python, string objects have type <class 'str'>.",
        },
        {
          _id: new ObjectId(),
          question: 'What is the boolean result of `10 > 5 and 3 == 4`?',
          options: ['False', 'True', 'None', 'Error'],
          correct_option_index: 0,
          explanation: '`10 > 5` is True, but `3 == 4` is False. True and False evaluates to False.',
        },
        {
          _id: new ObjectId(),
          question: 'Which function takes user keyboard input as a string?',
          options: ['input()', 'read()', 'scan()', 'get_input()'],
          correct_option_index: 0,
          explanation: 'input() prompts the user and returns their entry as a string.',
        },
      ],
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      course_id: dataCourse._id,
      lesson_id: null,
      title: 'Data Structures & Indexing Quiz',
      description: 'Practice zero-based indexing, list appending, and slicing.',
      status: 'published',
      generated_by_ai: true,
      questions: [
        {
          _id: new ObjectId(),
          question: 'Given items = ["a", "b", "c"], what is items[1]?',
          options: ['"b"', '"a"', '"c"', 'Error'],
          correct_option_index: 0,
          explanation: 'Index 1 refers to the second element, which is "b".',
        },
        {
          _id: new ObjectId(),
          question: 'Which method removes and returns the last element of a list?',
          options: ['pop()', 'remove()', 'delete()', 'shift()'],
          correct_option_index: 0,
          explanation: 'list.pop() removes the item at the specified index or the last item by default.',
        },
        {
          _id: new ObjectId(),
          question: 'How do you determine the number of elements in a list `vals`?',
          options: ['len(vals)', 'vals.length', 'vals.size()', 'count(vals)'],
          correct_option_index: 0,
          explanation: 'len() is the standard Python built-in for querying sequence length.',
        },
        {
          _id: new ObjectId(),
          question: 'What does the expression `[1, 2] + [3, 4]` produce?',
          options: ['[1, 2, 3, 4]', '[4, 6]', '[[1, 2], [3, 4]]', 'Error'],
          correct_option_index: 0,
          explanation: 'The + operator concatenates two lists together.',
        },
        {
          _id: new ObjectId(),
          question: 'Are Python lists mutable (can elements be changed)?',
          options: ['Yes', 'No', 'Only if declared mutable', 'Only for integers'],
          correct_option_index: 0,
          explanation: 'Yes, lists are mutable; you can assign new values to indices.',
        },
      ],
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      course_id: algoCourse._id,
      lesson_id: null,
      title: 'Search Algorithms Intuition Quiz',
      description: 'Linear search vs binary search efficiency and prerequisites.',
      status: 'published',
      generated_by_ai: true,
      questions: [
        {
          _id: new ObjectId(),
          question: 'In which scenario is Linear Search required instead of Binary Search?',
          options: [
            'When the collection is unsorted',
            'When the collection is extremely large and sorted',
            'When searching for numbers only',
            'When the collection has an odd count',
          ],
          correct_option_index: 0,
          explanation: 'If data is unordered, you must inspect items sequentially.',
        },
        {
          _id: new ObjectId(),
          question: 'For a sorted array of 1,000 items, approximately how many comparisons does Binary Search need at most?',
          options: ['~10', '~100', '~500', '~1000'],
          correct_option_index: 0,
          explanation: 'log2(1000) is approximately 10 (since 2^10 = 1024).',
        },
        {
          _id: new ObjectId(),
          question: 'How is the midpoint index calculated in binary search?',
          options: ['(low + high) // 2', '(low + high) / 2', 'high - low', 'high // 2'],
          correct_option_index: 0,
          explanation: 'Integer division // calculates the exact mid index without fractional remainders.',
        },
      ],
      created_at: new Date(),
      updated_at: new Date(),
    },
  ];

  const quizResults = await db.collection('quizzes').insertMany(quizzesData);
  console.log(`Seeded ${quizResults.insertedCount} quizzes connected to courses.`);

  await client.close();
  console.log('Seeding completed successfully!');
}

seedAssessmentsAndQuizzes().catch(console.error);
