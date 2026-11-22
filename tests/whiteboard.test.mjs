import test from 'node:test';
import assert from 'node:assert/strict';
import { toWhiteboardPart } from '../alma_frontend/src/utils/toWhiteboardPart.ts';
import { getBoardState } from '../alma_frontend/src/components/whiteboard/playback.ts';
import { buildWhiteboard } from '../src/Whiteboard/buildWhiteboard.js';

const scene = (id, time, action, payload = {}) => ({ id, time_offset: time, action_type: action, payload });

test('clear respects scene order at a shared timestamp and resets camera', () => {
  const scenes = [scene('old', 0, 'draw_text'), scene('camera', 0.5, 'camera', { mode: 'focus', zoom: 2 }), scene('clear', 1, 'clear'), scene('caption', 1, 'draw_caption', { content: 'Keep this caption' }), scene('new', 1, 'draw_text')];
  const state = getBoardState(scenes, 1);
  assert.deepEqual(state.visible.map(s => s.id), ['new']);
  assert.equal(state.caption.text, 'Keep this caption');
  assert.equal(state.zoom, 1);
  assert.equal(state.pageId, 'clear');
});

test('seeking backward reconstructs the previous page', () => {
  const scenes = [scene('old', 0, 'draw_text'), scene('clear', 2, 'clear'), scene('new', 2.1, 'draw_text')];
  assert.deepEqual(getBoardState(scenes, 3).visible.map(s => s.id), ['new']);
  assert.deepEqual(getBoardState(scenes, 1).visible.map(s => s.id), ['old']);
});

test('updated output replaces old output without replacing another code panel', () => {
  const scenes = [scene('code', 0, 'draw_code_block', { position: [40, 90] }), scene('output', 1, 'draw_code_block', { position: [40, 240], code: '0' }), scene('update', 2, 'draw_code_block', { position: [40, 240], code: '0\n1', append: true })];
  assert.deepEqual(getBoardState(scenes, 2).visible.map(s => s.id), ['code', 'update']);
  assert.deepEqual(getBoardState(scenes, 1).visible.map(s => s.id), ['code', 'output']);
});

test('normalization accepts malformed external input and always produces unique stable keys', () => {
  for (const input of [null, undefined, { scenes: {} }, { scenes: 'bad' }, { parts: [null] }]) {
    const part = toWhiteboardPart(input);
    assert.deepEqual(part.scenes, []);
    assert.ok(Number.isFinite(part.duration_seconds));
  }
  const input = { visual_sequence: [{ id: 'same', type: 'draw_text', time: 2, content: 'B' }, { id: 'same', type: 'draw_text', time: -1, content: 'A' }, { id: 'same-1', type: 'draw_text', time: 2, content: 'C' }, null] };
  const part = toWhiteboardPart(input);
  assert.equal(new Set(part.scenes.map(s => s.id)).size, 3);
  assert.deepEqual(part.scenes.map(s => s.payload.content), ['A', 'B', 'C']);
  assert.equal(part.scenes[0].time_offset, 0);
  assert.ok(part.duration_seconds > 2);
  assert.deepEqual(part, toWhiteboardPart(input));
});

test('snapshot scenes replace only the matching figure', () => {
  const scenes = [scene('a', 0, 'draw_array', { position: [80, 190], values: [1], replace: true }), scene('b', 0, 'draw_array', { position: [80, 300], values: [2] }), scene('c', 1, 'draw_array', { position: [80, 190], values: [1, 2], replace: true })];
  assert.deepEqual(getBoardState(scenes, 1).visible.map(s => s.id), ['b', 'c']);
});

test('new layouts generate playable timelines and question scenes', () => {
  for (const layout of ['array', 'diagram', 'chart', 'physics']) {
    const part = toWhiteboardPart(buildWhiteboard({ beats: [{ layout, title: 'A lesson', values: [1, 2, 3], nodes: [{ id: 'a', label: 'Start' }], steps: [{ say: 'Follow the figure as it appears.', ask: { question: 'What happens next?', answer: '2' } }] }] }));
    assert.ok(part.scenes.some(s => s.action_type === 'sandbox_question'));
    assert.ok(getBoardState(part.scenes, part.duration_seconds).visible.length > 0);
    assert.ok(part.scenes.every(s => s.time_offset <= part.duration_seconds));
  }
});

test('generator rejects invalid sentences and inherited layout names clearly', () => {
  for (const say of [42, '', '   ', null]) assert.throws(() => buildWhiteboard({ beats: [{ layout: 'recap', steps: [{ say }] }] }), /say/);
  assert.throws(() => buildWhiteboard({ beats: [{ layout: 'toString', steps: [{ say: 'Hi' }] }] }), /unknown layout/);
});

import { prepareLessonWhiteboards } from '../src/Whiteboard/prepareLessonWhiteboards.js';
import { WHITEBOARD_GENERATION_DEFAULTS } from '../src/Whiteboard/generationDefaults.js';
import { animationDuration } from '../src/Whiteboard/animationTiming.js';

test('future generation defaults include a valid explanatory storyboard', () => {
  assert.equal(WHITEBOARD_GENERATION_DEFAULTS.animation_mode, 'explanatory');
  const board = buildWhiteboard(WHITEBOARD_GENERATION_DEFAULTS.example_plan);
  const animation = board.scenes.find(scene => scene.action_type === 'animate_search');
  assert.equal(animation.payload.step_times.length, 2);
  const after = board.scenes.find(scene => scene.action_type === 'clear' && scene.time_offset > animation.time_offset);
  assert.ok(after.time_offset > animation.time_offset + animation.payload.end_time);
});

test('algorithm narration is expanded by default and movement follows caption boundaries', () => {
  const board = buildWhiteboard({ beats: [{ layout: 'algorithm', algorithm: 'sort', title: 'Sort', values: [4,2,5,1] }] });
  const animation = board.scenes.find(scene => scene.action_type === 'animate_sort');
  const captions = board.scenes.filter(scene => scene.action_type === 'draw_caption');
  assert.equal(captions.length, 6);
  assert.equal(animation.payload.step_times.length, 6);
  assert.match(captions[0].payload.content, /Compare 4 with 2/);
  assert.match(captions[1].payload.content, /already in order/);
  for (let i=0;i<6;i++) assert.ok(Math.abs(animation.time_offset + animation.payload.step_times[i] - captions[i].time_offset) <= 0.151);
  assert.ok(board.duration_seconds > animation.time_offset + animation.payload.end_time);
});

test('invalid educational states are rejected instead of animating incorrect algorithms', () => {
  assert.throws(() => buildWhiteboard({ beats: [{ layout:'algorithm', algorithm:'search', values:[3,1,2], target:2, strategy:'binary' }] }), /sorted/);
  assert.throws(() => buildWhiteboard({ beats: [{ layout:'algorithm', algorithm:'queue', values:[], operations:[{type:'pop'}], steps:[{say:'Remove a value.'}] }] }), /valid queue operations/);
});

test('lesson saves build missing whiteboards and compile supplied plans without mutating input', () => {
  const input = { versions: [{ sections: [{ title:'Loops', blocks:[{type:'code',code:'for i in range(3):\n    print("Hello", i)'}] },{title:'Search',whiteboard:{plan:WHITEBOARD_GENERATION_DEFAULTS.example_plan}}] }] };
  const original = structuredClone(input);
  const result = prepareLessonWhiteboards(input);
  assert.deepEqual(input, original);
  assert.ok(result.versions[0].sections[0].whiteboard.scenes.some(scene=>scene.action_type==='animate_loop'));
  assert.ok(result.versions[0].sections[1].whiteboard.scenes.some(scene=>scene.action_type==='animate_search'));
});

test('generation from reading blocks never invents unknown output', () => {
  const result = prepareLessonWhiteboards({versions:[{sections:[{title:'Code',blocks:[{type:'code',code:'x = 2\nprint(x)'}]}]}]});
  const board=result.versions[0].sections[0].whiteboard;
  assert.ok(board.scenes.some(scene=>scene.action_type==='animate_transfer'));
  assert.ok(!board.scenes.some(scene=>scene.action_type==='sandbox_question'));
});

test('temporary data movements finish before the next spoken step', () => {
  const board=buildWhiteboard({beats:[{layout:'boxes',title:'Assignment',steps:[{say:'Store ten.',line:'x = 10',set:['x','10']},{say:'Store twenty.',line:'x = 20',set:['x','20']}]}]});
  const transfers=board.scenes.filter(scene=>scene.action_type==='animate_transfer');
  const captions=board.scenes.filter(scene=>scene.action_type==='draw_caption');
  assert.ok(transfers[0].time_offset+animationDuration(transfers[0].action_type,transfers[0].payload)<captions[1].time_offset);
});

test('generation requests receive independent explanatory defaults', async (t) => {
  const { default: repository } = await import('../src/Module/LessonGenerations/LessonGenerations.repository.js');
  const { default: service } = await import('../src/Module/LessonGenerations/LessonGenerations.service.js');
  t.mock.method(repository, 'create', async data => data);
  const first = await service.createGenerationRequest({ topic:'Sorting' });
  first.whiteboard_generation.instructions.push('A local customization');
  const second = await service.createGenerationRequest({ topic:'Searching' });
  assert.equal(second.whiteboard_generation.animation_mode, 'explanatory');
  assert.equal(second.whiteboard_generation.detail_level, 'step_by_step');
  assert.ok(!second.whiteboard_generation.instructions.includes('A local customization'));
});

test('lesson creation compiles the storyboard before handing it to storage', async (t) => {
  const { default: repository } = await import('../src/Module/Lessons/Lessons.repository.js');
  const { default: service } = await import('../src/Module/Lessons/Lessons.service.js');
  t.mock.method(repository, 'create', async data => data);
  const result = await service.createLesson({versions:[{sections:[{title:'Search',whiteboard:{plan:WHITEBOARD_GENERATION_DEFAULTS.example_plan}}]}]});
  assert.ok(result.versions[0].sections[0].whiteboard.scenes.some(scene=>scene.action_type==='animate_search'));
});
