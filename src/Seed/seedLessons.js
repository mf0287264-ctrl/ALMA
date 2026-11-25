/**
 * Seeds the "Python Basics" course with its whiteboard lessons.
 *
 *   npm run seed:lessons
 *
 * Safe to run again: it updates what it created before (matched by course title,
 * module title and lesson topic), so edit a lesson file and run it to see the change.
 */

import { database_connect, db } from '../DB/db.connection.js';
import { PYTHON_COURSE as COURSE, PYTHON_LESSON_PLANS as LESSON_PLANS, toLessonDocument } from './lessonDocuments.js';

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
