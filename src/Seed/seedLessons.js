/**
 * Seeds the "Python Basics" course with its whiteboard lessons.
 *
 *   npm run seed:lessons
 *
 * Safe to run again: it updates what it created before (matched by course title,
 * module title and lesson topic), so edit a lesson file and run it to see the change.
 */

import { database_connect, db } from '../DB/db.connection.js';
import { buildWhiteboard } from '../Whiteboard/buildWhiteboard.js';
import variables from './lessons/variables.js';
import forLoops from './lessons/forLoops.js';
import functions from './lessons/functions.js';

const COURSE = {
  title: 'Python Basics',
  description: 'Learn Python from zero. ALMA draws every idea on a whiteboard and explains it step by step.',
  subject: 'Programming',
  grade_level: 'Grade 8',
  curriculum: 'General',
  language: 'en',
  status: 'published',
  course_image: null,
  created_by: null
};

const LESSON_PLANS = [variables, forLoops, functions];

/** Inserts or updates one document found by `key`, and returns its id as a string. */
async function upsert(collection, key, data) {
  const now = new Date();
  const saved = await db.collection(collection).findOneAndUpdate(
    key,
    { $set: { ...data, updated_at: now }, $setOnInsert: { created_at: now } },
    { upsert: true, returnDocument: 'after' }
  );
  return saved._id.toString();
}

const firstCode = (blocks) => blocks.find((block) => block.type === 'code')?.code ?? null;

/** Plan file -> the lesson document stored in MongoDB (see DB/Models/Lesson.model.js). */
function toLessonDocument({ lesson }, courseId, moduleId) {
  const sections = lesson.sections.map((section, index) => {
    const whiteboard = buildWhiteboard({ beats: section.board });
    const { check } = section;

    return {
      order: index + 1,
      title: section.title,
      purpose: section.purpose,
      covers_objectives: section.objectives,
      blocks: section.blocks,
      whiteboard: { ...whiteboard, plan: { beats: section.board } },
      diagnostic_check: {
        concept_tag: check.concept,
        question_text: check.question,
        code_snippet: check.code,
        options: check.options,
        correct_answer: check.answer,
        misconception_map: check.mistakes,
        explanation: check.explanation
      },
      remediation_blocks: section.remediation
    };
  });

  // Speech segments for clients that only play audio (one per section).
  const segments = sections.map((section) => ({
    order_in_lesson: section.order,
    title: section.title,
    narration_text: section.whiteboard.narration,
    est_seconds: Math.round(section.whiteboard.duration_seconds),
    attached_code: firstCode(section.blocks)
  }));

  return {
    course_id: courseId,
    module_id: moduleId,
    topic: lesson.topic,
    programming_language: 'Python',
    grade_level: lesson.grade_level,
    target_duration_minutes: lesson.target_duration_minutes,
    current_version_no: 1,
    approved_version_no: 1,
    versions: [
      {
        version_no: 1,
        state: 'APPROVED',
        title: lesson.topic,
        introduction: lesson.introduction,
        sections,
        conclusion: lesson.conclusion,
        segments,
        teacher_feedback: null,
        created_at: new Date()
      }
    ],
    created_by: null
  };
}

async function seed() {
  await database_connect();

  const courseId = await upsert('courses', { title: COURSE.title }, COURSE);
  console.log(`Course "${COURSE.title}" ready`);

  for (const plan of LESSON_PLANS) {
    const { module } = plan;
    const moduleId = await upsert(
      'modules',
      { course_id: courseId, title: module.title },
      {
        course_id: courseId,
        title: module.title,
        description: module.description,
        order: module.order,
        learning_objectives: module.objectives,
        status: 'published'
      }
    );

    const document = toLessonDocument(plan, courseId, moduleId);
    await upsert('lessons', { module_id: moduleId, topic: document.topic }, document);

    const [version] = document.versions;
    const scenes = version.sections.reduce((sum, s) => sum + s.whiteboard.scenes.length, 0);
    const seconds = version.sections.reduce((sum, s) => sum + s.whiteboard.duration_seconds, 0);
    console.log(
      `  ${module.title}: "${document.topic}" - ${version.sections.length} sections, ${scenes} scenes, ${(seconds / 60).toFixed(1)} min of whiteboard`
    );
  }
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
