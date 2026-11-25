import { buildWhiteboard } from "../Whiteboard/buildWhiteboard.js";
import { simpleLoop } from "../Whiteboard/prepareLessonWhiteboards.js";
import variables from "./lessons/variables.js";
import forLoops from "./lessons/forLoops.js";
import functions from "./lessons/functions.js";

export const PYTHON_COURSE = {
  title: "Python Basics",
  description:
    "Learn Python from zero. ALMA draws every idea on a whiteboard and explains it step by step.",
  subject: "Programming",
  grade_level: "Grade 8",
  curriculum: "General",
  language: "en",
  status: "published",
  course_image: null,
  created_by: null,
};

export const PYTHON_LESSON_PLANS = [variables, forLoops, functions];

const firstCode = (blocks) =>
  blocks.find((block) => block.type === "code")?.code ?? null;

/** Plan file -> the lesson document stored in MongoDB (see DB/Models/Lesson.model.js). */
export function toLessonDocument({ lesson }, courseId, moduleId) {
  const sections = lesson.sections.map((section, index) => {
    const beats = [...section.board];
    for (const block of section.blocks) {
      if (block.type !== "code" || typeof block.code !== "string") continue;
      const loop = simpleLoop(block.code);
      if (!loop) continue;
      const predicted = loop.values
        .map((value) =>
          loop.output_mode === "value"
            ? String(value)
            : `${loop.prefix} ${value}`.trimStart(),
        )
        .join("\n");
      if (block.expected_output && block.expected_output.trim() !== predicted)
        continue;
      const beat = {
        layout: "algorithm",
        title: "Trace every iteration",
        say: "Now follow each value into the variable, through the body, and into its own output line.",
        ...loop,
        step_seconds: 4,
      };
      const recapIndex = beats.findIndex((beat) => beat.layout === "recap");
      beats.splice(recapIndex === -1 ? beats.length : recapIndex, 0, beat);
    }
    const whiteboard = buildWhiteboard({ beats });
    const { check } = section;

    return {
      order: index + 1,
      title: section.title,
      purpose: section.purpose,
      covers_objectives: section.objectives,
      blocks: section.blocks,
      whiteboard: { ...whiteboard, plan: { beats } },
      diagnostic_check: {
        concept_tag: check.concept,
        question_text: check.question,
        code_snippet: check.code,
        options: check.options,
        correct_answer: check.answer,
        misconception_map: Object.fromEntries(
          Object.entries(check.mistakes).map(([option, reason]) => [
            option,
            `${reason}. ${check.explanation}`,
          ]),
        ),
        explanation: check.explanation,
      },
      remediation_blocks: section.remediation,
    };
  });

  // Speech segments for clients that only play audio (one per section).
  const segments = sections.map((section) => ({
    order_in_lesson: section.order,
    title: section.title,
    narration_text: section.whiteboard.narration,
    est_seconds: Math.round(section.whiteboard.duration_seconds),
    attached_code: firstCode(section.blocks),
  }));

  return {
    course_id: courseId,
    module_id: moduleId,
    topic: lesson.topic,
    programming_language: "Python",
    grade_level: lesson.grade_level,
    target_duration_minutes: lesson.target_duration_minutes,
    current_version_no: 1,
    approved_version_no: 1,
    versions: [
      {
        version_no: 1,
        state: "APPROVED",
        title: lesson.topic,
        introduction: lesson.introduction,
        sections,
        conclusion: lesson.conclusion,
        segments,
        teacher_feedback: null,
        created_at: new Date(),
      },
    ],
    created_by: null,
  };
}
