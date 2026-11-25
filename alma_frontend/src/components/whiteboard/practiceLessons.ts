import type {
  LessonCheckpoint,
  LessonDocument,
  LessonSummary,
} from "@/types/Lesson.type";
import { DEFAULT_LESSONS } from "./defaultLessons";

export const PRACTICE_COURSE_TITLE = "Whiteboard essentials";

const topics: {
  topic: string;
  module: string;
  purpose: string;
  description: string;
  checkpoint: LessonCheckpoint;
}[] = [
  {
    topic: "Python loops",
    module: "Programming foundations",
    purpose:
      "Trace each iteration and explain why range excludes its stopping value.",
    description:
      "Follow a value from the sequence into the loop variable and the printed output.",
    checkpoint: {
      concept_tag: "range_iteration",
      question_text:
        "Trace this program from top to bottom. What does it print, and why does the loop run exactly three times? Choose the complete output in the correct order.",
      code_snippet: 'for i in range(3):\n    print("Hello", i)\nprint("Done")',
      options: [
        "Hello 0\nHello 1\nHello 2\nDone",
        "Hello 1\nHello 2\nHello 3\nDone",
        "Hello 0\nHello 1\nHello 2\nHello 3\nDone",
        "Hello 0\nDone\nHello 1\nDone\nHello 2\nDone",
      ],
      correct_answer: "Hello 0\nHello 1\nHello 2\nDone",
      misconception_map: {
        "Hello 1\nHello 2\nHello 3\nDone":
          "range(3) starts at zero. Its three values are 0, 1 and 2, not 1, 2 and 3.",
        "Hello 0\nHello 1\nHello 2\nHello 3\nDone":
          "The stopping value is excluded. Including 3 would add an extra iteration that the program never runs.",
        "Hello 0\nDone\nHello 1\nDone\nHello 2\nDone":
          'print("Done") is not indented. It runs once after the entire loop, rather than once per iteration.',
      },
      explanation:
        "range(3) supplies 0, then 1, then 2. The indented print runs once for each value. After those three iterations, execution leaves the loop and prints Done once.",
    },
  },
  {
    topic: "Arrays, stacks & queues",
    module: "Programming foundations",
    purpose:
      "Distinguish indexing, last-in-first-out stacks and first-in-first-out queues.",
    description:
      "See how the same two values leave a stack and a queue in different orders.",
    checkpoint: {
      concept_tag: "collection_order",
      question_text:
        'Both collections start empty. Add "First", then "Second" to each collection. Remove one item from each. Which item is removed, and what remains? Read the operations below before choosing.',
      code_snippet:
        'Stack: push("First") → push("Second") → pop()\nQueue: enqueue("First") → enqueue("Second") → dequeue()',
      options: [
        'Stack removes "Second", leaving "First". Queue removes "First", leaving "Second".',
        'Both remove "First", leaving "Second".',
        'Both remove "Second", leaving "First".',
        'Stack removes "First", leaving "Second". Queue removes "Second", leaving "First".',
      ],
      correct_answer:
        'Stack removes "Second", leaving "First". Queue removes "First", leaving "Second".',
      misconception_map: {
        'Both remove "First", leaving "Second".':
          "You applied the queue rule to both collections. A stack removes the most recently added item.",
        'Both remove "Second", leaving "First".':
          "You applied the stack rule to both collections. A queue removes the earliest item still waiting.",
        'Stack removes "First", leaving "Second". Queue removes "Second", leaving "First".':
          "The two removal rules are reversed: stacks are last in, first out; queues are first in, first out.",
      },
      explanation:
        'In the stack, "Second" sits on top, so pop removes it. In the queue, "First" arrived first, so dequeue removes it. Adding values in the same order does not make their removal rules the same.',
    },
  },
  {
    topic: "Charts & science in motion",
    module: "Visual thinking",
    purpose:
      "Read positive and negative values and locate points using ordered coordinates.",
    description:
      "Connect chart values, coordinates and visible patterns in a pendulum and a wave.",
    checkpoint: {
      concept_tag: "signed_values_and_coordinates",
      question_text:
        "A bar chart shows score changes A = 4, B = −2, C = 7 and D = 3. On a separate coordinate grid, point P is (−4, −2). Which description correctly interprets both negative values?",
      options: [
        "B extends 2 units below the zero baseline. P is 4 units left and 2 units below the origin.",
        "B extends 2 units above the zero baseline. P is 4 units left and 2 units below the origin.",
        "B extends 2 units below the zero baseline. P is 2 units left and 4 units below the origin.",
        "B extends 2 units below the zero baseline. P is 4 units right and 2 units above the origin.",
      ],
      correct_answer:
        "B extends 2 units below the zero baseline. P is 4 units left and 2 units below the origin.",
      misconception_map: {
        "B extends 2 units above the zero baseline. P is 4 units left and 2 units below the origin.":
          "The height has magnitude 2, but its sign determines direction. A negative bar grows below zero.",
        "B extends 2 units below the zero baseline. P is 2 units left and 4 units below the origin.":
          "Coordinates are ordered (x, y). Read horizontal movement first, then vertical movement.",
        "B extends 2 units below the zero baseline. P is 4 units right and 2 units above the origin.":
          "Negative x moves left and negative y moves down. Moving right and up would locate (4, 2).",
      },
      explanation:
        "The zero baseline separates gains from losses: −2 is a loss of two. For P = (−4, −2), x = −4 sets the horizontal position and y = −2 sets the vertical position. Both coordinates point in the negative direction.",
    },
  },
  {
    topic: "Linear & binary search",
    module: "Algorithms step by step",
    purpose:
      "Follow comparisons and explain why binary search can discard part of a sorted sequence.",
    description:
      "Watch the candidate range shrink as each comparison rules out values.",
    checkpoint: {
      concept_tag: "binary_search_range",
      question_text:
        "Use binary search to find 12 in the ascending array below. Compare the middle of the current candidate range each time. Which values are compared, and why can the first four values be discarded after the first comparison?",
      code_snippet: "values = [2, 4, 6, 8, 10, 12, 14]\ntarget = 12",
      options: [
        "Compare 8, then 12. All values at or left of 8 are too small because the array is sorted.",
        "Compare 2, 4, 6, 8, 10, then 12. Binary search must visit every earlier value.",
        "Compare 8, then 4. Keep the left half because 8 is smaller than 12.",
        "Compare 8, then 12. The same discard rule is safe even if the array is unsorted.",
      ],
      correct_answer:
        "Compare 8, then 12. All values at or left of 8 are too small because the array is sorted.",
      misconception_map: {
        "Compare 2, 4, 6, 8, 10, then 12. Binary search must visit every earlier value.":
          "That is linear search. Binary search starts at the middle and narrows the candidate range.",
        "Compare 8, then 4. Keep the left half because 8 is smaller than 12.":
          "If the middle is too small, the target can only be in the larger values to the right. Keeping the left half discards the target.",
        "Compare 8, then 12. The same discard rule is safe even if the array is unsorted.":
          "Sorting is essential. In an unsorted array, a value larger than 8 could appear anywhere, including to its left.",
      },
      explanation:
        "The first middle index is 3, whose value is 8. Since 8 < 12 and the array is sorted, indices 0–3 cannot contain 12. The remaining range is [10, 12, 14]; its middle is 12. The target is found in two comparisons.",
    },
  },
  {
    topic: "Bubble sort",
    module: "Algorithms step by step",
    purpose:
      "Trace adjacent comparisons and swaps through one complete left-to-right pass.",
    description:
      "Follow the actual swaps and see why the largest value settles at the end.",
    checkpoint: {
      concept_tag: "bubble_sort_pass",
      question_text:
        "Make one complete left-to-right bubble-sort pass through [4, 2, 5, 1]. Compare neighboring values, swapping only when the left value is larger. What is the array after the three comparisons, and which value is now in its final position?",
      code_snippet:
        "Start: [4, 2, 5, 1]\nCompare indices (0, 1), then (1, 2), then (2, 3).",
      options: [
        "[2, 4, 1, 5]; 5 is in its final position.",
        "[1, 2, 4, 5]; the entire array is sorted after one pass.",
        "[2, 4, 5, 1]; 4 is in its final position.",
        "[4, 2, 1, 5]; 5 is in its final position.",
      ],
      correct_answer: "[2, 4, 1, 5]; 5 is in its final position.",
      misconception_map: {
        "[1, 2, 4, 5]; the entire array is sorted after one pass.":
          "One pass places the largest value at the end; it does not necessarily sort all earlier values. The 1 still needs to move left in later passes.",
        "[2, 4, 5, 1]; 4 is in its final position.":
          "You stopped after the first swap. The final comparison is 5 against 1, so those values must swap too.",
        "[4, 2, 1, 5]; 5 is in its final position.":
          "You applied the final swap but missed the first one: 4 > 2, so the first pair must become [2, 4].",
      },
      explanation:
        "Compare 4 and 2: swap to get [2, 4, 5, 1]. Compare 4 and 5: keep their order. Compare 5 and 1: swap to get [2, 4, 1, 5]. The largest value, 5, has reached its final position; earlier values still need more passes.",
    },
  },
];

/** The existing whiteboards use the same lesson route, sections and checkpoints as academy lessons. */
export const PRACTICE_LESSONS: LessonDocument[] = DEFAULT_LESSONS.map(
  (board, index) => {
    const content = topics[index];
    const checkpoint = {
      ...content.checkpoint,
      options: content.checkpoint.options.map(
        (_, optionIndex) =>
          content.checkpoint.options[
            (optionIndex + index + 1) % content.checkpoint.options.length
          ],
      ),
    };
    return {
      _id: board.id,
      topic: content.topic,
      course_title: PRACTICE_COURSE_TITLE,
      module_title: content.module,
      programming_language:
        index === 2
          ? "Science & maths"
          : index === 0
            ? "Python"
            : "Computer science",
      target_duration_minutes: 3,
      has_whiteboard: true,
      section_count: 1,
      is_practice: true,
      current_version_no: 1,
      approved_version_no: 1,
      versions: [
        {
          version_no: 1,
          state: "APPROVED",
          title: content.topic,
          sections: [
            {
              order: 1,
              title: content.topic,
              purpose: content.purpose,
              whiteboard: board,
              blocks: [
                { type: "paragraph", text: content.description },
                { type: "paragraph", text: content.checkpoint.explanation },
              ],
              diagnostic_check: checkpoint,
              remediation_blocks: [
                {
                  type: "callout",
                  callout_type: "tip",
                  text: content.checkpoint.explanation,
                },
              ],
            },
          ],
        },
      ],
    };
  },
);

export const PRACTICE_LESSON_SUMMARIES: LessonSummary[] = PRACTICE_LESSONS.map(
  (lesson) => {
    const summary = { ...lesson };
    delete summary.versions;
    return summary;
  },
);
