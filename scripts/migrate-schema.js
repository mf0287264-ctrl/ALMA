import dotenv from 'dotenv';
dotenv.config();

import { MongoClient, ObjectId } from 'mongodb';
import { mongoConfig } from '../src/Config/mongodb.config.js';

async function runMigration() {
  const client = new MongoClient(mongoConfig.uri);

  try {
    console.log(`Connecting to MongoDB: ${mongoConfig.uri} (Database: ${mongoConfig.dbName})...`);
    await client.connect();
    const db = client.db(mongoConfig.dbName);
    console.log('Successfully connected.');

    // 1. Ensure Indexes
    console.log('\n--- Ensuring Indexes ---');
    await db.collection('admins').createIndex({ email: 1 }, { unique: true });
    await db.collection('students').createIndex({ email: 1 }, { unique: true });
    await db.collection('students').createIndex({ student_code: 1 }, { unique: true });
    await db.collection('teachers').createIndex({ email: 1 }, { unique: true });
    await db.collection('lesson_generations').createIndex({ job_id: 1 }, { unique: true, sparse: true });
    await db.collection('student_lesson_sessions').createIndex({ session_id: 1 }, { unique: true });
    await db.collection('student_lesson_sessions').createIndex({ student_id: 1 });
    await db.collection('student_lesson_sessions').createIndex({ lesson_id: 1 });
    console.log('Indexes created/verified.');

    // 2. Migrate Students Collection
    console.log('\n--- Migrating Students Collection ---');
    const students = await db.collection('students').find({}).toArray();
    let updatedStudents = 0;
    for (const student of students) {
      const updates = {};
      if (student.current_streak === undefined) updates.current_streak = 0;
      if (student.longest_streak === undefined) updates.longest_streak = 0;
      if (student.lessons_completed === undefined) updates.lessons_completed = 0;
      if (!Array.isArray(student.struggling_concepts)) updates.struggling_concepts = [];

      if (Object.keys(updates).length > 0) {
        await db.collection('students').updateOne(
          { _id: student._id },
          { $set: updates }
        );
        updatedStudents++;
      }
    }
    console.log(`Students updated: ${updatedStudents} / ${students.length}`);

    // 3. Migrate Lesson Generations Collection
    console.log('\n--- Migrating Lesson Generations Collection ---');
    const generations = await db.collection('lesson_generations').find({}).toArray();
    let updatedGenerations = 0;
    for (const gen of generations) {
      const updates = {};
      if (!gen.job_id) {
        updates.job_id = `job_${gen._id.toString().substring(14, 24)}`;
      }
      if (gen.progress_percent === undefined) {
        updates.progress_percent = gen.status === 'completed' ? 1.0 : 0.0;
      }
      if (!gen.current_step) {
        updates.current_step = gen.status === 'completed' ? 'completed' : 'queued';
      }
      if (!gen.step_message) {
        updates.step_message = gen.status === 'completed' ? 'Generation completed' : 'Generation initialized...';
      }
      if (!gen.topic && gen.input_parameters?.topic) {
        updates.topic = gen.input_parameters.topic;
      }
      if (!gen.programming_language) {
        updates.programming_language = gen.input_parameters?.programming_language || 'Python';
      }
      if (!gen.grade_level) {
        updates.grade_level = gen.input_parameters?.grade_level || 'Grade 8';
      }
      if (!gen.model || gen.model === 'gemini-2.5-flash') {
        updates.model = 'gemini-3.5-flash-lite';
      }

      if (Object.keys(updates).length > 0) {
        await db.collection('lesson_generations').updateOne(
          { _id: gen._id },
          { $set: updates }
        );
        updatedGenerations++;
      }
    }
    console.log(`Lesson Generations updated: ${updatedGenerations} / ${generations.length}`);

    // 4. Migrate Lessons Collection
    console.log('\n--- Migrating Lessons Collection ---');
    const lessons = await db.collection('lessons').find({}).toArray();
    let updatedLessons = 0;
    for (const lesson of lessons) {
      const updates = {};
      const topic = lesson.topic || lesson.title || 'Untitled Lesson';
      if (!lesson.topic) updates.topic = topic;
      if (!lesson.programming_language) updates.programming_language = 'Python';
      if (!lesson.grade_level) updates.grade_level = 'Grade 8';
      if (!lesson.target_duration_minutes) {
        updates.target_duration_minutes = lesson.estimated_duration_minutes || 15;
      }
      if (lesson.current_version_no === undefined) updates.current_version_no = 1;

      // Check if versions array is missing or empty, convert old structure
      if (!Array.isArray(lesson.versions) || lesson.versions.length === 0) {
        const sections = Array.isArray(lesson.sections) ? lesson.sections.map((sec, idx) => {
          // If already modern section with blocks, keep it
          if (Array.isArray(sec.blocks)) return sec;

          // Convert old section schema (heading, explanation, code_example) to modular blocks
          const blocks = [];
          if (sec.explanation) {
            blocks.push({
              type: 'paragraph',
              text: sec.explanation,
              callout_type: null,
              items: [],
              language: 'python',
              code: null,
              expected_output: null
            });
          }
          if (sec.code_example?.code) {
            blocks.push({
              type: 'code',
              text: null,
              callout_type: null,
              items: [],
              language: sec.code_example.language || 'python',
              code: sec.code_example.code,
              expected_output: sec.code_example.output_explanation || null
            });
          }
          if (Array.isArray(sec.key_takeaways) && sec.key_takeaways.length > 0) {
            blocks.push({
              type: 'list',
              text: null,
              callout_type: null,
              items: sec.key_takeaways,
              language: 'python',
              code: null,
              expected_output: null
            });
          }

          return {
            order: idx + 1,
            title: sec.heading || `Section ${idx + 1}`,
            purpose: sec.explanation ? sec.explanation.substring(0, 100) : 'Core concept',
            covers_objectives: lesson.learning_objectives || [],
            blocks,
            diagnostic_check: null,
            remediation_blocks: []
          };
        }) : [];

        const introBlocks = lesson.description ? [{
          type: 'paragraph',
          text: lesson.description,
          callout_type: null,
          items: [],
          language: 'python',
          code: null,
          expected_output: null
        }] : [];

        updates.versions = [
          {
            version_no: 1,
            state: lesson.status === 'published' ? 'APPROVED' : 'AWAITING_REVIEW',
            title: topic,
            introduction: introBlocks,
            sections,
            conclusion: [],
            segments: [],
            teacher_feedback: null,
            created_at: lesson.created_at || new Date()
          }
        ];
        if (lesson.status === 'published') {
          updates.approved_version_no = 1;
        }
      }

      if (Object.keys(updates).length > 0) {
        await db.collection('lessons').updateOne(
          { _id: lesson._id },
          { $set: updates }
        );
        updatedLessons++;
      }
    }
    console.log(`Lessons updated: ${updatedLessons} / ${lessons.length}`);

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.close();
  }
}

runMigration();
