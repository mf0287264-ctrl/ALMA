import test from 'node:test';
import assert from 'node:assert/strict';
import { ObjectId } from 'mongodb';
import { toPlayerLesson, hasWhiteboard, lessonPlayerHref } from '../alma_frontend/src/utils/toPlayerLesson.ts';
import { checkpointPassed, progressStorageKey, restoreLessonProgress } from '../alma_frontend/src/utils/lessonProgress.ts';
import { prepareLessonWhiteboards } from '../src/Whiteboard/prepareLessonWhiteboards.js';
import { isPublishedLesson, lessonSummary } from '../src/Whiteboard/lessonSummary.js';
import lessonsRepository from '../src/Module/Lessons/Lessons.repository.js';
import lessonsService from '../src/Module/Lessons/Lessons.service.js';
import coursesRepository from '../src/Module/Courses/Courses.repository.js';
import modulesRepository from '../src/Module/Modules/Modules.repository.js';
import studentsRepository from '../src/Module/Students/Students.repository.js';
import teacherGroupsRepository from '../src/Module/TeacherGroups/TeacherGroups.repository.js';
import achievementsService from '../src/Module/Achievements/Achievements.service.js';
import achievementsController from '../src/Module/Achievements/Achievements.controller.js';

const checkpoint = { question_text: 'Trace x = 7. What value does x contain?', options: ['7', '0', 'x', 'Unknown'], correct_answer: '7', misconception_map: { '0': 'The assignment stores 7.' }, explanation: 'Assignment binds x to the supplied value 7.' };
const scene = { id: 'caption', time_offset: 0, action_type: 'draw_caption', payload: { content: 'Store seven in x.' } };
const section = { order: 1, title: 'Assign a value', blocks: [{ type: 'code', code: 'x = 7' }], whiteboard: { scenes: [scene], duration_seconds: 10 }, diagnostic_check: checkpoint, remediation_blocks: [{ type: 'paragraph', text: 'Read the right side first, then store it using the name on the left.' }] };
const document = { _id: 'lesson-1', topic: 'Variables', versions: [{ version_no: 1, state: 'APPROVED', sections: [section] }] };

test('one-section generated lessons preserve their authored board, check and remediation', () => {
  const before = structuredClone(document), lesson = toPlayerLesson(document);
  assert.equal(lesson.sections.length, 1);
  assert.deepEqual(lesson.sections[0], section);
  assert.equal(lesson.sections[0].diagnostic_check, checkpoint);
  assert.equal(lesson.has_whiteboard, true);
  assert.deepEqual(document, before);
});

test('player and list select the published version even when it is not first', () => {
  const lesson = { ...document, current_version_no: 3, approved_version_no: 2, versions: [{ version_no: 1, state: 'APPROVED', sections: [] }, { version_no: 3, state: 'AWAITING_REVIEW', sections: [] }, { version_no: 2, state: 'APPROVED', sections: [section] }] };
  assert.equal(toPlayerLesson(lesson).version_no, 2);
  assert.equal(lessonSummary(lesson).has_whiteboard, true);
  assert.equal(lessonSummary(lesson).section_count, 1);
  assert.ok(!('versions' in lessonSummary(lesson)));
  assert.equal(toPlayerLesson({ ...lesson, approved_version_no: null }).version_no, 3);
  assert.equal(isPublishedLesson({ versions: [{ state: 'AWAITING_REVIEW' }] }), false);
  assert.equal(isPublishedLesson({ versions: [{ state: 'APPROVED' }] }), true);
  assert.equal(isPublishedLesson({ topic: 'Legacy' }), true);
});

test('legacy content has no invented question or code, and links use stable IDs', () => {
  const lesson = toPlayerLesson({ _id: 'legacy', topic: 'Electricity', blocks: [{ type: 'paragraph', text: 'Current flows through a closed circuit.' }] });
  assert.equal(lesson.sections[0].blocks[0].text, 'Current flows through a closed circuit.');
  assert.equal(lesson.sections[0].diagnostic_check, undefined);
  assert.equal(lesson.has_whiteboard, false);
  assert.equal(lessonPlayerHref({ _id: 'lesson-loops', is_practice: true }), '/my-lessons/player?sample=lesson-loops');
  assert.equal(lessonPlayerHref({ _id: 'abc', course_id: 'course' }), '/my-lessons/player?lessonId=abc&courseId=course');
  assert.equal(hasWhiteboard({ scenes: [] }), false);
  assert.equal(hasWhiteboard({ visual_sequence: [{ time: 0, type: 'draw_text' }] }), true);
  assert.equal(hasWhiteboard({ parts: [{ scenes: [scene] }] }), true);
});

test('resume validates checkpoint answers, section indexes and student/version scope', () => {
  const lesson = toPlayerLesson({ ...document, versions: [{ version_no: 1, sections: [section, { order: 2, title: 'Recap', blocks: [] }] }] });
  const progress = restoreLessonProgress({ sectionIndex: 99, completedSections: [0, 1, 1, -1, 99, '0'], watchedSections: [0, -1], answers: { 0: '0' }, finished: true }, lesson);
  assert.deepEqual(progress.completedSections, [1]);
  assert.deepEqual(progress.watchedSections, [0]);
  assert.equal(progress.sectionIndex, 0);
  assert.equal(progress.finished, false);
  assert.deepEqual(progress.answers, {});
  assert.equal(checkpointPassed(section, '0'), false);
  assert.equal(restoreLessonProgress({ sectionIndex: 1, completedSections: [0, 1], answers: { 0: '7' }, finished: true }, lesson).finished, true);
  assert.notEqual(progressStorageKey('abc', 1, 'alice'), progressStorageKey('abc', 1, 'bob'));
  assert.notEqual(progressStorageKey('abc', 1, 'alice'), progressStorageKey('abc', 2, 'alice'));
});

test('reading legacy lessons creates missing boards without changing stored content', async t => {
  const stored = { _id: 'legacy', topic: 'Assignment', versions: [{ sections: [{ order: 1, title: 'Store seven', blocks: [{ type: 'code', code: 'x = 7' }], diagnostic_check: checkpoint }] }] }, before = structuredClone(stored);
  t.mock.method(lessonsRepository, 'findById', async () => stored);
  t.mock.method(lessonsRepository, 'update', () => assert.fail('Reading must not write storage'));
  const lesson = await lessonsService.getLessonById('legacy');
  assert.ok(lesson.versions[0].sections[0].whiteboard.scenes.length);
  assert.deepEqual(lesson.versions[0].sections[0].diagnostic_check, checkpoint);
  assert.deepEqual(stored, before);
});

test('reads preserve scenes and audio while revised plans and unversioned sections compile on save', () => {
  const plan = { beats: [{ layout: 'recap', steps: [{ say: 'This is the revised explanation.', text: 'Revised' }] }] };
  const stored = { ...document, versions: [{ sections: [{ ...section, whiteboard: { ...section.whiteboard, audio_url: '/narration.mp3', plan } }] }] };
  const read = prepareLessonWhiteboards(stored, { preserveExisting: true });
  assert.deepEqual(read.versions[0].sections[0].whiteboard.scenes, [scene]);
  assert.equal(read.versions[0].sections[0].whiteboard.audio_url, '/narration.mp3');
  assert.ok(prepareLessonWhiteboards(stored).versions[0].sections[0].whiteboard.scenes.some(item => item.payload.content === 'This is the revised explanation.'));
  assert.ok(prepareLessonWhiteboards({ sections: [{ title: 'Assign', blocks: [{ type: 'code', code: 'x = 7' }] }] }).sections[0].whiteboard.scenes.length);
});

test('assigned group links open the actual generated lesson document', async t => {
  const student = new ObjectId(), lessonId = new ObjectId();
  t.mock.method(studentsRepository, 'findById', async () => ({ _id: student, enrolled_courses: [] }));
  t.mock.method(coursesRepository, 'findAll', async () => []);
  t.mock.method(modulesRepository, 'findAll', async () => []);
  t.mock.method(teacherGroupsRepository, 'findByStudentId', async () => [{ name: 'Class A', lessons: [{ _id: new ObjectId(), lesson_id: lessonId.toHexString(), topic: 'Variables' }] }]);
  t.mock.method(lessonsRepository, 'findByIds', async ids => { assert.deepEqual(ids, [lessonId.toHexString()]); return [{ ...document, _id: lessonId }]; });
  const result = await lessonsService.getMyLessons({ _id: student });
  assert.equal(result.teacher_lessons[0]._id, lessonId.toHexString());
  assert.equal(result.teacher_lessons[0].has_whiteboard, true);
  assert.equal(result.teacher_lessons[0].is_available, true);
});

test('both existing completion routes pass the correct lesson ID to the service', async t => {
  const captured = [];
  t.mock.method(achievementsService, 'completeLesson', async (student, lesson) => { captured.push([student, lesson]); return { message: 'Completed' }; });
  const res = { status(code) { assert.equal(code, 200); return this; }, json(data) { assert.equal(data.success, true); } };
  for (const params of [{ id: 'lesson-a' }, { lessonId: 'lesson-b' }]) await achievementsController.completeLesson({ authUser: { _id: 'student' }, params }, res, error => assert.fail(error));
  assert.deepEqual(captured, [['student', 'lesson-a'], ['student', 'lesson-b']]);
});
