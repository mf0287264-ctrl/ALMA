import { database_connect } from './db.connection.js';
import Course from './Models/Course.model.js';
import Module from './Models/Module.model.js';
import Lesson from './Models/Lesson.model.js';

export async function seedCourses() {
  await database_connect();

  const platformCourses = [
    {
      title: "Intro to Python",
      subject: "Computer Science",
      grade_level: "Grade 8",
      curriculum: "General",
      language: "en",
      status: "published",
      created_by: null,
      description: "Learn Python from zero: variables, conditions, loops and functions, with an AI tutor that adapts to your learning pace.",
      modules: [
        {
          title: "Getting Started & Variables",
          description: "Introduction to code, print statements, and variables.",
          order: 1,
          learning_objectives: ["Understand variables", "Use print and input", "Recognize data types"],
          lessons: [
            { topic: "What is a Variable?", target_duration_minutes: 10 },
            { topic: "Data Types in Python", target_duration_minutes: 12 },
            { topic: "Basic Arithmetic & Input", target_duration_minutes: 15 }
          ]
        },
        {
          title: "Conditionals & Logic",
          description: "Making decisions with if, elif, and else statements.",
          order: 2,
          learning_objectives: ["Boolean logic", "Comparison operators", "Branching execution"],
          lessons: [
            { topic: "Boolean Values & Comparisons", target_duration_minutes: 12 },
            { topic: "If Statements and Indentation", target_duration_minutes: 15 },
            { topic: "Complex Conditions with and/or", target_duration_minutes: 15 }
          ]
        },
        {
          title: "Loops & Iteration",
          description: "Repeating code and counting with for loops and range().",
          order: 3,
          learning_objectives: ["Understand for loops", "Use range() function", "Avoid off-by-one errors"],
          lessons: [
            { topic: "Why Loops?", target_duration_minutes: 10 },
            { topic: "Counting with range()", target_duration_minutes: 15 },
            { topic: "Loop Body & Step Values", target_duration_minutes: 15 },
            { topic: "Loop Stop Conditions", target_duration_minutes: 15 }
          ]
        },
        {
          title: "Functions & Code Reusability",
          description: "Grouping code into reusable functions with parameters and return values.",
          order: 4,
          learning_objectives: ["Define functions", "Pass parameters", "Return values"],
          lessons: [
            { topic: "Defining Your First Function", target_duration_minutes: 15 },
            { topic: "Function Parameters & Arguments", target_duration_minutes: 15 },
            { topic: "Return Values vs Print", target_duration_minutes: 15 }
          ]
        }
      ]
    },
    {
      title: "Data Basics",
      subject: "Computer Science",
      grade_level: "Grade 9",
      curriculum: "General",
      language: "en",
      status: "published",
      created_by: null,
      description: "Lists, indexing and working with data structures in Python.",
      modules: [
        {
          title: "Lists & Zero-Based Indexing",
          description: "Store sequences of items and access them by index.",
          order: 1,
          learning_objectives: ["Understand zero-based indexing", "Access list elements", "Modify lists"],
          lessons: [
            { topic: "Creating and Accessing Lists", target_duration_minutes: 12 },
            { topic: "Zero-Based Indexing Rules", target_duration_minutes: 15 },
            { topic: "Adding and Removing List Items", target_duration_minutes: 15 }
          ]
        },
        {
          title: "List Slicing & Operations",
          description: "Slice sublists, search items, and measure list length.",
          order: 2,
          learning_objectives: ["List slicing [start:stop]", "len() function", "Iterating through lists"],
          lessons: [
            { topic: "List Slicing Techniques", target_duration_minutes: 15 },
            { topic: "Searching in Lists", target_duration_minutes: 12 }
          ]
        },
        {
          title: "Dictionaries & Key-Value Data",
          description: "Store labeled key-value data with Python dictionaries.",
          order: 3,
          learning_objectives: ["Understand key-value pairs", "Access dictionary values", "Update dictionaries"],
          lessons: [
            { topic: "Introduction to Dictionaries", target_duration_minutes: 15 },
            { topic: "Keys, Values and Items", target_duration_minutes: 15 }
          ]
        }
      ]
    },
    {
      title: "Web Foundations",
      subject: "Programming",
      grade_level: "Grade 10",
      curriculum: "General",
      language: "en",
      status: "published",
      created_by: null,
      description: "HTML, CSS and understanding how modern websites and pages are structured.",
      modules: [
        {
          title: "HTML Essentials",
          description: "Tags, elements, headings, paragraphs, and links.",
          order: 1,
          learning_objectives: ["Document structure", "Semantic tags", "Attributes"],
          lessons: [
            { topic: "HTML Document Skeleton", target_duration_minutes: 12 },
            { topic: "Text, Headings & Links", target_duration_minutes: 15 }
          ]
        },
        {
          title: "CSS Basics & Styling",
          description: "Add styling, colors, and layout properties to HTML elements.",
          order: 2,
          learning_objectives: ["CSS selectors", "Colors and fonts", "Box model"],
          lessons: [
            { topic: "Selectors & Cascade", target_duration_minutes: 15 },
            { topic: "The CSS Box Model", target_duration_minutes: 15 }
          ]
        }
      ]
    },
    {
      title: "Algorithms Lab",
      subject: "Computer Science",
      grade_level: "Grade 10",
      curriculum: "General",
      language: "en",
      status: "published",
      created_by: null,
      description: "Think step by step, decompose complex problems, and design algorithmic solutions.",
      modules: [
        {
          title: "Computational Thinking",
          description: "Decomposition, pattern recognition, and abstraction.",
          order: 1,
          learning_objectives: ["Decompose problems", "Identify patterns", "Write pseudocode"],
          lessons: [
            { topic: "Decomposing Problems", target_duration_minutes: 15 },
            { topic: "Writing Step-by-Step Pseudocode", target_duration_minutes: 15 }
          ]
        },
        {
          title: "Search Algorithms",
          description: "Linear search vs binary search intuition and efficiency.",
          order: 2,
          learning_objectives: ["Linear search", "Binary search conditions", "Complexity intuition"],
          lessons: [
            { topic: "Linear Search Implementation", target_duration_minutes: 15 },
            { topic: "Binary Search on Sorted Data", target_duration_minutes: 18 }
          ]
        }
      ]
    },
    {
      title: "Logic & Puzzles",
      subject: "General",
      grade_level: "Grade 8",
      curriculum: "General",
      language: "en",
      status: "published",
      created_by: null,
      description: "Warm-up brain teasers and logic challenges for sharper problem solving.",
      modules: [
        {
          title: "Deductive Logic & Patterns",
          description: "Solve sequence and deductive puzzles.",
          order: 1,
          learning_objectives: ["Recognize patterns", "Deduce hidden rules"],
          lessons: [
            { topic: "Number Sequence Puzzles", target_duration_minutes: 10 },
            { topic: "Grid Logic Challenges", target_duration_minutes: 12 }
          ]
        }
      ]
    }
  ];

  for (const c of platformCourses) {
    const { modules, ...courseData } = c;

    let courseDoc = await Course.findOne({ title: courseData.title });
    if (!courseDoc) {
      courseDoc = await Course.create(courseData);
      console.log(`[Seed] Created course: ${courseDoc.title} (${courseDoc._id})`);
    } else {
      await Course.updateOne({ _id: courseDoc._id }, { $set: courseData });
      console.log(`[Seed] Updated course: ${courseDoc.title} (${courseDoc._id})`);
    }

    if (modules && modules.length > 0) {
      for (const m of modules) {
        const { lessons, ...moduleData } = m;
        let moduleDoc = await Module.findOne({ course_id: courseDoc._id, title: moduleData.title });
        if (!moduleDoc) {
          moduleDoc = await Module.create({ ...moduleData, course_id: courseDoc._id, status: 'published' });
          console.log(`  [Seed] Created module: ${moduleDoc.title} for ${courseDoc.title}`);
        } else {
          await Module.updateOne({ _id: moduleDoc._id }, { $set: { ...moduleData, status: 'published' } });
        }

        if (lessons && lessons.length > 0) {
          for (const l of lessons) {
            let lessonDoc = await Lesson.findOne({ course_id: courseDoc._id, module_id: moduleDoc._id, topic: l.topic });
            if (!lessonDoc) {
              await Lesson.create({
                course_id: courseDoc._id,
                module_id: moduleDoc._id,
                topic: l.topic,
                programming_language: courseDoc.subject.includes('Python') ? 'Python' : 'General',
                grade_level: courseDoc.grade_level,
                target_duration_minutes: l.target_duration_minutes || 15,
                current_version_no: 1,
                approved_version_no: 1,
                versions: [
                  {
                    version_no: 1,
                    state: 'APPROVED',
                    title: l.topic,
                    introduction: [
                      { type: 'paragraph', text: `Welcome to ${l.topic}. In this lesson we will explore key concepts step-by-step.` }
                    ],
                    sections: [
                      {
                        order: 1,
                        title: 'Concept Overview',
                        purpose: 'Introduce the core concept',
                        covers_objectives: moduleDoc.learning_objectives || [],
                        blocks: [
                          { type: 'paragraph', text: `Here is the explanation for ${l.topic}.` },
                          { type: 'code', language: 'python', code: `# Example for ${l.topic}\nprint("Learning ${l.topic}")` }
                        ]
                      }
                    ],
                    conclusion: [
                      { type: 'paragraph', text: `Great work completing ${l.topic}!` }
                    ],
                    segments: []
                  }
                ]
              });
              console.log(`    [Seed] Created lesson: ${l.topic}`);
            }
          }
        }
      }
    }
  }

  console.log('[Seed] Seeding completed successfully!');
}

if (process.argv[1] && process.argv[1].includes('seedCourses')) {
  seedCourses().then(() => process.exit(0)).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
