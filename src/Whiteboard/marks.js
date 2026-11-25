/**
 * Marks: the small building blocks a lesson board is made of.
 *
 * A mark is one thing the teacher draws: { type, payload }.
 *  - `type` is a scene action_type (draw_text, draw_rect, ...)
 *  - `payload` follows alma_frontend/src/types/Whiteboard.type.ts
 *
 * Layouts (layouts.js) place marks on the 800 x 500 board and buildWhiteboard.js
 * gives them times. Lesson authors never write coordinates.
 */

export const BOARD = { width: 800, height: 500 };

/** Same palette as alma_frontend/src/components/whiteboard/theme.ts */
export const COLORS = {
  ink: '#10292e',
  muted: '#607274',
  faint: '#8a999b',
  line: '#d8e0dc',
  paper: '#ffffff',
  mango: '#ffa11f',
  mangoSoft: '#fff3db',
  teal: '#118a80',
  tealSoft: '#e6f5f2',
  blue: '#2b88d8',
  blueSoft: '#e9f4fb',
  pink: '#f25c78',
  pinkSoft: '#fff0f3'
};

const ACCENTS = {
  mango: { main: COLORS.mango, soft: COLORS.mangoSoft },
  teal: { main: COLORS.teal, soft: COLORS.tealSoft },
  blue: { main: COLORS.blue, soft: COLORS.blueSoft },
  pink: { main: COLORS.pink, soft: COLORS.pinkSoft }
};
const ACCENT_ORDER = ['mango', 'teal', 'blue', 'pink'];

/** Accent by name ('teal') or, when no name is given, by position in a list. */
export const accentOf = (name, index = 0) =>
  ACCENTS[name] ?? ACCENTS[ACCENT_ORDER[index % ACCENT_ORDER.length]];

/* ----------------------------------------------------------------- numbers */

export const round = (n) => Math.round(n * 100) / 100;
export const clamp = (n, min, max) => Math.min(max, Math.max(min, n));

/** Average glyph width, the same estimate the player uses to wrap text. */
export const textWidth = (text, size, mono = false) => String(text).length * size * (mono ? 0.6 : 0.56);

/** How many lines `text` needs inside `maxWidth`. */
export const countLines = (text, size, maxWidth) =>
  Math.max(1, Math.ceil(textWidth(text, size) / Math.max(maxWidth, 1)));

/** Largest font size (down to `min`) at which `text` fits on one line of `maxWidth`. */
export const fitSize = (text, maxWidth, size, min = 12) => {
  let fitted = size;
  while (fitted > min && textWidth(text, fitted) > maxWidth) fitted -= 1;
  return fitted;
};

/* ------------------------------------------------------------------- marks */

const mark = (type, payload) => ({ type, payload });

export const text = (content, x, y, style = {}) =>
  mark('draw_text', {
    content,
    position: [round(x), round(y)],
    style: { fontSize: 18, color: COLORS.ink, fontWeight: 600, ...style }
  });

export const box = (x, y, width, height, label = '', style = {}) =>
  mark('draw_rect', {
    x: round(x),
    y: round(y),
    width: round(width),
    height: round(height),
    label,
    style: { fill: COLORS.paper, stroke: COLORS.ink, strokeWidth: 2, rx: 12, ...style }
  });

export const circle = (cx, cy, radius, label = '', style = {}) =>
  mark('draw_circle', {
    center: [round(cx), round(cy)],
    radius,
    label,
    style: { stroke: COLORS.ink, strokeWidth: 2, ...style }
  });

export const arrow = (from, to, label = '', style = {}) =>
  mark('draw_arrow', {
    from: from.map(round),
    to: to.map(round),
    label,
    style: { color: COLORS.ink, strokeWidth: 2.5, ...style }
  });

export const line = (from, to, style = {}) =>
  mark('draw_line', {
    from: from.map(round),
    to: to.map(round),
    style: { color: COLORS.faint, strokeWidth: 2, ...style }
  });

export const badge = (content, x, y, style = {}) =>
  mark('draw_badge', { content, position: [round(x), round(y)], style: { bg: COLORS.teal, fontSize: 14, ...style } });

export const callout = (content, x, y, width, style = {}) =>
  mark('draw_callout', { content, position: [round(x), round(y)], width, style });

/** An icon panel. `type` is a draw_object type such as 'lightbulb', 'database', 'person'. */
export const icon = (type, x, y, size, label = '') =>
  mark('draw_object', { object_type: type, position: [round(x), round(y)], size: [size, size], label });

export const highlight = (x, y, width, height, color, opacity = 0.28) =>
  mark('draw_highlight', { position: [round(x), round(y)], width: round(width), height: round(height), color, opacity, rx: 4 });

/* ------------------------------------------------------------------- code */

/** Geometry of draw_code_block. Keep in sync with scenes/code.tsx in the player. */
export const CODE = { size: 15, lineHeight: 15 * 1.62, header: 34, padding: 12 };

export const codeHeight = (lineCount) => CODE.header + CODE.padding * 2 + lineCount * CODE.lineHeight;

/** Top edge of a 1-based code line inside a block placed at `y`. */
export const codeLineTop = (y, lineNumber) =>
  y + CODE.header + CODE.padding + (lineNumber - 1) * CODE.lineHeight - 2;

export const codeWidth = (lines, { min = 300, max = 440 } = {}) =>
  clamp(Math.max(...lines.map((l) => l.length), 8) * CODE.size * 0.6 + 60, min, max);

/** A code card. Use language 'text' for program output. */
export const code = (lines, x, y, options = {}) =>
  mark('draw_code_block', {
    code: lines.join('\n'),
    language: 'python',
    position: [round(x), round(y)],
    ...options
  });

/**
 * Pauses the lesson and asks the student to predict something ("what will this print?").
 * `answer` is the expected text (a string or one string per line). The player shows a
 * "your turn" card with an input (it is a sandbox_question scene, see Whiteboard.type.ts).
 */
export const ask = (question, answer, title = 'Your turn', details = {}) =>
  mark('sandbox_question', {
    title,
    instructions: question,
    ...(typeof details.code === 'string' ? { code: details.code } : {}),
    ...(typeof details.hint === 'string' ? { hint: details.hint } : {}),
    ...(typeof details.explanation === 'string' ? { explanation: details.explanation } : {}),
    language: 'text',
    testCases: [{ id: 'predict', input: '', expectedOutput: [].concat(answer).join('\n'), description: question }]
  });

/* ------------------------------------------------------------------- value */

/** How a Python value is drawn: its type name and color family. */
export function kindOf(value) {
  const v = String(value).trim();
  if (/^(["']).*\1$/.test(v) || /^f(["']).*\1$/.test(v)) return { label: 'str', ...ACCENTS.teal };
  if (v === 'True' || v === 'False') return { label: 'bool', ...ACCENTS.pink };
  if (/^-?\d+$/.test(v)) return { label: 'int', ...ACCENTS.blue };
  if (/^-?\d*\.\d+$/.test(v)) return { label: 'float', ...ACCENTS.mango };
  return { label: '', main: COLORS.ink, soft: COLORS.paper };
}
