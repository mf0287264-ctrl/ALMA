import test from 'node:test';
import assert from 'node:assert/strict';
import { ObjectId } from 'mongodb';
import { db } from '../src/DB/db.connection.js';
import lessonsRepository from '../src/Module/Lessons/Lessons.repository.js';
import lessonsService from '../src/Module/Lessons/Lessons.service.js';
import coursesRepository from '../src/Module/Courses/Courses.repository.js';
import modulesRepository from '../src/Module/Modules/Modules.repository.js';
import studentsRepository from '../src/Module/Students/Students.repository.js';
import teacherGroupsRepository from '../src/Module/TeacherGroups/TeacherGroups.repository.js';

test('lesson summary keeps both ID filters and preserves the caller input', async (t) => {
  const course = new ObjectId().toHexString();
  const module = new ObjectId().toHexString();
  const filter = { course_id: course, module_id: module, topic: 'Loops' };
  let captured;
  t.mock.method(db, 'collection', () => ({ find(query, options) {
    captured = { query, options };
    return { toArray: async () => [] };
  } }));
  await lessonsRepository.findAll(filter, { summary: true });
  assert.equal(captured.query.course_id.$in[0].toHexString(), course);
  assert.equal(captured.query.course_id.$in[1], course);
  assert.equal(captured.query.module_id.$in[0].toHexString(), module);
  assert.equal(captured.query.module_id.$in[1], module);
  assert.equal(captured.query.topic, 'Loops');
  assert.deepEqual(captured.options.projection, {
    'versions.sections.whiteboard.scenes': 0,
    'versions.sections.whiteboard.plan': 0,
  });
  assert.deepEqual(filter, { course_id: course, module_id: module, topic: 'Loops' });
  await lessonsRepository.findAll(filter);
  assert.deepEqual(captured.options.projection, {});
});

test('lesson service forwards summary options after the merge', async (t) => {
  let captured;
  t.mock.method(lessonsRepository, 'findAll', async (filter, options) => {
    captured = { filter, options };
    return [];
  });
  await lessonsService.getAllLessons({ topic: 'Loops' }, { summary: true });
  assert.deepEqual(captured, { filter: { topic: 'Loops' }, options: { summary: true } });
});

test('enrolled and teacher group lesson enrichment survives the merge', async (t) => {
  const student = new ObjectId(), course = new ObjectId(), module = new ObjectId(), teacher = new ObjectId();
  t.mock.method(studentsRepository, 'findById', async () => ({ _id: student, teacher_id: teacher, enrolled_courses: [course] }));
  t.mock.method(coursesRepository, 'findAll', async () => [{ _id: course, title: 'Python' }]);
  t.mock.method(modulesRepository, 'findAll', async () => [{ _id: module, title: 'Basics' }]);
  t.mock.method(lessonsRepository, 'findByCourseIds', async ids => {
    assert.deepEqual(ids, [course]);
    return [{ _id: new ObjectId(), course_id: course, module_id: module, topic: 'Loops' }];
  });
  t.mock.method(lessonsRepository, 'findTeacherLessons', async id => {
    assert.equal(id, teacher);
    return [];
  });
  t.mock.method(teacherGroupsRepository, 'findByStudentId', async () => [{
    name: 'Class A', subject: 'Programming', class_code: 'ABC',
    lessons: [{ _id: new ObjectId(), title: 'Practice' }],
  }]);
  const result = await lessonsService.getMyLessons({ _id: student });
  assert.equal(result.available_lessons[0].course_title, 'Python');
  assert.equal(result.available_lessons[0].module_title, 'Basics');
  assert.equal(result.teacher_lessons[0].is_group_lesson, true);
  assert.equal(result.teacher_lessons[0].course_title, 'Class A');
});
