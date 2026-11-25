import test from 'node:test';
import assert from 'node:assert/strict';
import { runLessonGeneration } from '../src/Module/LessonGenerations/generationWorker.js';
import { validateGeneratedSection } from '../src/Module/LessonGenerations/lessonQuality.js';
import { PYTHON_LESSON_PLANS, toLessonDocument } from '../src/Seed/lessonDocuments.js';
import { simpleLoop, prepareLessonWhiteboards } from '../src/Whiteboard/prepareLessonWhiteboards.js';

function teachingSection() {
  return { title: 'Assign and update', purpose: 'Trace the value after each assignment.', blocks: [{ type: 'paragraph', text: 'An assignment stores a value under a name.' }, { type: 'code', code: 'x = 7\nx = x + 2' }], whiteboard: { plan: { beats: [
    { layout: 'statement', title: 'Store a value', steps: [{ say: 'A name lets us find the stored value.', text: 'Name → value' }] },
    { layout: 'boxes', title: 'Follow the assignment', steps: [{ say: 'Store seven in x.', line: 'x = 7', set: ['x', '7'] }, { say: 'Add two, then replace the stored value.', line: 'x = x + 2', set: ['x', '9'] }, { say: 'Predict the updated value.', ask: { question: 'After x = 7 and x = x + 2, what is x?', answer: '9' } }] },
    { layout: 'recap', title: 'Read before replacing', steps: [{ say: 'Read the expression before storing its result.', text: 'Read → calculate → store' }] },
  ] } }, diagnostic_check: { question_text: 'Starting with x = 3, evaluate x = x + 4, then print x. Which value does the program display after the update?', options: ['3', '4', '7', 'x + 4'], correct_answer: '7', misconception_map: { '3': 'This ignores the assignment that replaces the original stored value.', '4': 'This uses only the added amount rather than the complete expression.', 'x + 4': 'Python evaluates the arithmetic expression instead of displaying its source text.' }, explanation: 'First x contains 3. The expression reads that current value and adds 4, giving 7. The assignment stores 7 under x, and print then displays the updated value.' }, remediation_blocks: [{ type: 'paragraph', text: 'Read before replacing: 3 plus 4 is 7.' }] };
}
const outline = { title: 'Variables', sections: [1,2,3].map(order => ({ order, title: `Section ${order}`, purpose: 'Trace a value.' })) };

test('generation authors and compiles sections, reviews them, then saves an unpublished draft', async () => {
  const updates = []; let saved; let calls = 0;
  const result = await runLessonGeneration({ job_id: 'test', topic: 'Variables', requested_by: 'teacher' }, {
    generate: async prompt => { calls++; return prompt.startsWith('Review the following') ? { checks: [1,2,3].map(section_order => ({ section_order, passed: true, issues: [] })) } : calls === 1 ? outline : teachingSection(); },
    update: async (_, update) => updates.push(update), save: async data => { saved = data; return { ...data, _id: 'saved' }; },
  });
  assert.equal(result._id, 'saved'); assert.equal(calls, 5);
  assert.equal(saved.versions[0].state, 'AWAITING_REVIEW'); assert.equal(saved.approved_version_no, null); assert.equal(saved.created_by, 'teacher');
  for (const section of saved.versions[0].sections) assert.ok(section.whiteboard.scenes.some(scene => scene.action_type === 'sandbox_question'));
  assert.equal(updates.at(-1).status, 'completed'); assert.equal(updates.at(-1).quality_report.checkpoint_count, 3);
});

test('invalid checkpoints are repaired once and never saved as a completed lesson', async () => {
  const updates = []; let calls = 0;
  await runLessonGeneration({ job_id: 'invalid', topic: 'Variables' }, {
    generate: async () => { calls++; if (calls === 1) return outline; const section = teachingSection(); section.diagnostic_check.correct_answer = 'Not an option'; return section; },
    update: async (_, update) => updates.push(update), save: async () => assert.fail('Invalid content must not be saved'),
  });
  assert.equal(calls, 3); assert.equal(updates.at(-1).status, 'failed'); assert.match(updates.at(-1).error, /correct_answer/);
  assert.throws(() => validateGeneratedSection({ title: 'Thin content' }), /detailed question/);
});

test('a failed teaching review blocks saving otherwise well-formed content', async () => {
  const updates = []; let calls = 0;
  await runLessonGeneration({ job_id: 'review', topic: 'Variables' }, {
    generate: async prompt => { calls++; return prompt.startsWith('Review the following') ? { checks: [{ section_order: 1, passed: false, issues: ['The worked output is incorrect.'] }] } : calls === 1 ? outline : teachingSection(); },
    update: async (_, update) => updates.push(update), save: async () => assert.fail('Unverified content must not be saved'),
  });
  assert.equal(updates.at(-1).status, 'failed'); assert.match(updates.at(-1).error, /unverified/);
});

test('existing Python curriculum compiles with detailed questions and specific distractor feedback', () => {
  for (const plan of PYTHON_LESSON_PLANS) {
    const lesson = toLessonDocument(plan, 'course', 'module');
    assert.equal(lesson.topic, plan.lesson.topic); assert.equal(lesson.versions[0].sections.length, 4);
    for (const section of lesson.versions[0].sections) {
      assert.ok(section.whiteboard.scenes.length);
      const check = section.diagnostic_check;
      assert.ok(check.options.includes(check.correct_answer)); assert.ok(check.question_text.split(/\s+/).length >= 12);
      for (const option of check.options.filter(value => value !== check.correct_answer)) assert.ok(check.misconception_map[option].split(/\s+/).length >= 15);
    }
  }
  const loop = simpleLoop('for i in range(5, 0, -2):\n    print(i)');
  assert.deepEqual(loop.values, [5,3,1]); assert.equal(loop.output_mode, 'value');
  assert.equal(simpleLoop('for i in range(3):\n    execute_unknown(i)'), null);
});

test('editable old boards upgrade on read while recorded audio keeps its original timeline', () => {
  const old = { versions: [{ sections: [{ title: 'Assign', whiteboard: { scenes: [{ action_type: 'draw_text', payload: { content: 'Old' }, time_offset: 0 }], plan: teachingSection().whiteboard.plan } }] }] }, before = structuredClone(old);
  assert.equal(prepareLessonWhiteboards(old, { preserveExisting: true, upgradeExisting: true }).versions[0].sections[0].whiteboard.compiler_version, 3);
  assert.deepEqual(old, before);
  old.versions[0].sections[0].whiteboard.audio_url = '/recording.mp3';
  assert.deepEqual(prepareLessonWhiteboards(old, { preserveExisting: true, upgradeExisting: true }).versions[0].sections[0].whiteboard.scenes, before.versions[0].sections[0].whiteboard.scenes);
});
