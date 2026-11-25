/**
 * buildWhiteboard: turns a lesson plan into the timeline the student player draws.
 *
 *   plan   { title, beats: [{ layout, say?, title, ...fields, steps: [{ say, ... }] }] }
 *   result { narration, duration_seconds, scenes: [{ id, time_offset, action_type, payload }] }
 *
 * This is the same method as the whiteboard export: the teacher's words come first,
 * every sentence makes one new thing appear, layouts own all geometry, and the board
 * is cleared between beats. Layout fields are documented in layouts.js.
 *
 * Any step can also pause the lesson with a question for the student, in any layout:
 *   { say: 'What will it print? Have a guess!', ask: { question: 'What does it print?', answer: '12' } }
 * The question appears when the sentence has been said; `answer` is a string or one string per line.
 */

import { LAYOUTS } from './layouts.js';
import { ask } from './marks.js';
import { animationDuration } from './animationTiming.js';
import { algorithmStages } from './algorithmStages.js';

const WORDS_PER_SECOND = 2.6;
const MIN_DWELL_SECONDS = 2.4;
export const WHITEBOARD_COMPILER_VERSION = 3;

const round = (n) => Math.round(n * 100) / 100;
const wordCount = (sentence) => sentence.trim().split(/\s+/).filter(Boolean).length;

/** Seconds the board stays on one sentence: time to say it plus a moment to look. */
export const dwell = (sentence) => Math.max(MIN_DWELL_SECONDS, wordCount(sentence) / WORDS_PER_SECOND + 0.7);

function checkPlan(plan) {
  if (!plan || !Array.isArray(plan.beats) || plan.beats.length === 0) {
    throw new Error('A whiteboard plan needs at least one beat');
  }
  plan.beats.forEach((beat, i) => {
    if (!beat || typeof beat !== 'object') throw new Error(`beat ${i + 1}: needs a layout and steps`);
    const where = `beat ${i + 1} ("${beat.title ?? beat.layout}")`;
    if (!Object.hasOwn(LAYOUTS, beat.layout)) throw new Error(`${where}: unknown layout "${beat.layout}"`);
    if (beat.say != null && (typeof beat.say !== 'string' || !beat.say.trim())) throw new Error(`${where}: "say" must be a non-empty sentence`);
    if (!Array.isArray(beat.steps) || beat.steps.length === 0) throw new Error(`${where}: needs steps`);
    beat.steps.forEach((step, s) => {
      if (typeof step?.say !== 'string' || !step.say.trim()) throw new Error(`${where}, step ${s + 1}: every step needs a "say" sentence`);
    });
    if (beat.layout === 'algorithm') {
      if (beat.step_seconds != null && (typeof beat.step_seconds !== 'number' || !Number.isFinite(beat.step_seconds) || beat.step_seconds <= 0)) throw new Error(`${where}: step_seconds must be a positive finite number`);
      const limits = { loop: 8, search: 10, sort: 7, stack: 6, queue: 6 };
      if (!Object.hasOwn(limits, beat.algorithm)) throw new Error(`${where}: unknown algorithm "${beat.algorithm}"`);
      if (!Array.isArray(beat.values) || beat.values.length > limits[beat.algorithm]) throw new Error(`${where}: provide at most ${limits[beat.algorithm]} values`);
      if (['loop', 'search', 'sort'].includes(beat.algorithm) && !beat.values.length) throw new Error(`${where}: needs at least one value`);
      if (['search', 'sort'].includes(beat.algorithm) && beat.values.some(value => typeof value !== 'number' || !Number.isFinite(value))) throw new Error(`${where}: values must be finite numbers`);
      if (beat.algorithm === 'search' && (typeof beat.target !== 'number' || !Number.isFinite(beat.target))) throw new Error(`${where}: search needs a numeric target`);
      if (beat.strategy === 'binary' && beat.values.some((value, index) => index > 0 && value < beat.values[index - 1])) throw new Error(`${where}: binary search requires ascending sorted values`);
      if (['stack', 'queue'].includes(beat.algorithm)) {
        const allowed = beat.algorithm === 'stack' ? ['push', 'pop'] : ['enqueue', 'dequeue'];
        if (!Array.isArray(beat.operations) || beat.operations.length > 12 || beat.operations.some(op => !op || !allowed.includes(op.type))) throw new Error(`${where}: provide valid ${beat.algorithm} operations (at most 12)`);
        let size = beat.values.length;
        for (const op of beat.operations) {
          if (['push', 'enqueue'].includes(op.type)) size++;
          else size = Math.max(0, size - 1);
          if (size > 6) throw new Error(`${where}: collection cannot exceed six visible values`);
        }
      }
    }
  });
}

export function buildWhiteboard(plan) {
  // Rich algorithm narration is the default, even when an author supplied only a summary.
  if (plan && Array.isArray(plan.beats)) plan = { ...plan, beats: plan.beats.map(beat => {
    if (!beat || beat.layout !== 'algorithm' || !Array.isArray(beat.values) || beat.values.length > 10) return beat;
    const stages = algorithmStages(beat);
    const supplied = Array.isArray(beat.steps) ? beat.steps : [];
    const authoredChecks = supplied.filter(step => step?.ask || step?.text || step?.note);
    return { ...beat, steps: [...stages, ...authoredChecks] };
  }) };
  checkPlan(plan);

  const scenes = [];
  const sentences = [];
  let clock = 0.4;
  let animationEnd = 0;

  const add = (actionType, payload, time) =>
    scenes.push({ id: `s${scenes.length + 1}`, time_offset: round(time), action_type: actionType, payload });

  /** Marks appear one after another so the board is drawn, not pasted. */
  const draw = (marks, start) => {
    const gap = Math.min(0.4, 1.6 / Math.max(marks.length, 1));
    let sentenceEnd = start;
    marks.forEach((mark, i) => {
      const time = start + i * gap;
      add(mark.type, mark.payload, time);
      const end = time + animationDuration(mark.type, mark.payload);
      animationEnd = Math.max(animationEnd, end);
      if (mark.type === 'animate_transfer') sentenceEnd = Math.max(sentenceEnd, end);
    });
    return sentenceEnd;
  };

  plan.beats.forEach((beat, index) => {
    const { intro, steps } = LAYOUTS[beat.layout](beat);
    const beatScenesStart = scenes.length;
    const stepTimes = [];
    const total = (beat.say ? 1 : 0) + beat.steps.length;
    let spoken = 0;

    // Every beat starts with a clear. Its title lets the player offer the beats as chapters.
    if (index > 0) {
      add('clear', { title: beat.title ?? '' }, clock);
      clock += 0.45;
    } else {
      add('clear', { title: beat.title ?? '' }, 0.2);
    }

    const say = (sentence) => {
      add('draw_caption', { content: sentence, index: spoken++, total, estimatedDurationSeconds: round(dwell(sentence)) }, clock);
      sentences.push(sentence);
    };

    if (beat.say) {
      say(beat.say);
      const drawn = draw(intro, clock + 0.1);
      clock = Math.max(clock + dwell(beat.say), drawn + 0.1);
    } else {
      const drawn = draw(intro, clock + 0.1);
      clock = Math.max(clock + 1, drawn + 0.1);
    }

    beat.steps.forEach((step, i) => {
      stepTimes.push(clock);
      say(step.say);
      // A question for the student waits until the sentence has been said.
      const drawn = draw(steps[i], clock + 0.15);
      const next = Math.max(clock + dwell(step.say), drawn + 0.1);
      if (step.ask) {
        const question = ask(step.ask.question, step.ask.answer, step.ask.title, step.ask);
        add(question.type, question.payload, next - 0.25);
      }
      clock = next;
    });

    if (beat.layout === 'algorithm') {
      const animation = scenes.slice(beatScenesStart).find(scene => scene.action_type === `animate_${beat.algorithm}`);
      if (animation) {
        const count = algorithmStages(beat).length;
        animation.payload.step_times = stepTimes.slice(0, count).map(time => round(Math.max(0, time - animation.time_offset)));
        animation.payload.end_time = round(Math.max(0, (stepTimes[count] ?? clock) - animation.time_offset));
        animationEnd = Math.max(animationEnd, animation.time_offset + animation.payload.end_time);
      }
    }

    clock = Math.max(clock, animationEnd + 0.4) + 0.5;
  });

  return {
    compiler_version: WHITEBOARD_COMPILER_VERSION,
    narration: sentences.join(' '),
    duration_seconds: round(clock + 0.8),
    scenes: scenes.sort((a, b) => a.time_offset - b.time_offset)
  };
}
