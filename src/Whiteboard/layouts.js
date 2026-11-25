/**
 * Layouts: each one turns a lesson "beat" into marks placed on the board.
 *
 * A beat is one board (it is cleared before the next beat). The teacher says one
 * sentence per step and something new appears with every sentence:
 *
 *   { layout, say?, title, ...layout fields, steps: [{ say, ...step fields }] }
 *
 *   say    the opening sentence, spoken while the title and frame appear
 *   steps  one object per sentence; its fields describe what appears with it
 *
 * Every layout returns { intro, steps }:
 *   intro  marks drawn with the opening sentence
 *   steps  one list of marks per step, in the same order as beat.steps
 *
 * Layouts own all coordinates, so lessons stay free of x/y and cannot overlap.
 */

import {
  COLORS,
  accentOf,
  arrow,
  badge,
  box,
  callout,
  circle,
  clamp,
  code,
  codeHeight,
  codeLineTop,
  codeWidth,
  countLines,
  fitSize,
  highlight,
  icon,
  kindOf,
  line,
  text,
  textWidth,
  CODE
} from './marks.js';

/** Big handwritten heading with a mango underline. */
const heading = (title) => [
  text(title, 400, 52, { fontSize: 26, fontWeight: 800, textAnchor: 'middle', maxWidth: 700, maxLines: 1 }),
  line([340, 67], [460, 67], { color: COLORS.mango, strokeWidth: 4 })
];
const transfer = (from, to, label = '') => ({ type: 'animate_transfer', payload: { from, to, label, duration_seconds: 1.4 } });

/** Hands out vertical slots for short notes under a figure. */
const noteSlots = (firstY = 372, spacing = 54) => {
  let used = 0;
  return () => firstY + spacing * Math.min(used++, 2);
};

/**
 * statement: one big idea (hooks, reveals).
 *   { title, sub?, icon?, steps?: [{ say, text, color? }] }
 * `icon` is a draw_object type ('lightbulb', 'database'...). Each step adds a chip below.
 */
function statement(beat) {
  const chips = beat.steps ?? [];
  const intro = [];

  let top = beat.icon ? 62 : 120;
  if (beat.icon) {
    intro.push(icon(beat.icon, 352, top, 96));
    top += 96 + 22;
  }

  const lines = countLines(beat.title, 34, 640);
  const baseline = top + 30;
  intro.push(text(beat.title, 400, baseline, { fontSize: 34, fontWeight: 800, textAnchor: 'middle', maxWidth: 640, maxLines: 3 }));

  if (beat.sub) {
    const subBaseline = baseline + (lines - 1) * 44 + 42;
    intro.push(text(beat.sub, 400, subBaseline, { fontSize: 19, fontWeight: 500, color: COLORS.muted, textAnchor: 'middle', maxWidth: 600, maxLines: 2 }));
  }

  const width = chips.length > 3 ? 170 : 220;
  const gap = 18;
  const left = (800 - (chips.length * width + (chips.length - 1) * gap)) / 2;
  const steps = chips.map((chip, i) => {
    const { main, soft } = accentOf(chip.color, i);
    return [box(left + i * (width + gap), 392, width, 48, chip.text, { fill: soft, stroke: main, rx: 24, fontSize: 15 })];
  });

  return { intro, steps };
}

/**
 * flow: boxes joined by arrows (a process, a machine, a loop).
 *   { title, loop?: 'repeat', steps: [{ say, title, detail?, icon?, color?, note? }] }
 * Keep step titles short (about 14 characters). `loop` adds a return arrow from the
 * last box back to the first, labeled with the given word.
 */
function flow(beat) {
  const n = beat.steps.length;
  const gap = 46;
  const width = Math.min(172, (720 - gap * (n - 1)) / n);
  const height = 134;
  const left = (800 - (n * width + gap * (n - 1))) / 2;
  const top = beat.loop ? 124 : 150;
  const nextNote = noteSlots();

  const steps = beat.steps.map((step, i) => {
    const { main, soft } = accentOf(step.color, i);
    const x = left + i * (width + gap);
    const cx = x + width / 2;
    const marks = [];

    if (i > 0) {
      marks.push(arrow([x - gap + 4, top + height / 2], [x - 4, top + height / 2], '', { strokeWidth: 3 }));
      marks.push(transfer([x - gap + 4, top + height / 2], [x + width / 2, top + height / 2], step.title));
    }
    marks.push(box(x, top, width, height, '', { fill: soft, stroke: main, strokeWidth: 2.5, rx: 18 }));
    marks.push(step.icon ? icon(step.icon, cx - 22, top + 14, 44) : circle(cx, top + 32, 16, String(i + 1), { fill: main, stroke: main }));
    marks.push(text(step.title, cx, top + 86, { fontSize: fitSize(step.title, width - 14, 17, 12), fontWeight: 800, textAnchor: 'middle', maxWidth: width - 8, maxLines: 1 }));
    if (step.detail) {
      marks.push(text(step.detail, cx, top + 110, { fontSize: 12.5, fontWeight: 500, color: COLORS.muted, textAnchor: 'middle', maxWidth: width - 14, maxLines: 2 }));
    }

    if (beat.loop && i === n - 1) {
      const railY = top + height + 46;
      const first = left + width / 2;
      const rail = { color: COLORS.mango, strokeWidth: 3.5 };
      marks.push(line([cx, top + height + 4], [cx, railY], rail));
      marks.push(line([cx, railY], [first, railY], rail));
      marks.push(arrow([first, railY], [first, top + height + 8], '', rail));
      marks.push(transfer([cx, railY], [first, railY], String(beat.loop)));
      const label = String(beat.loop);
      marks.push(badge(label, 400 - (textWidth(label, 14) + 28) / 2, railY - 14, { bg: COLORS.mango, color: COLORS.ink }));
    }

    if (step.note) marks.push(callout(step.note, 120, nextNote(), 560, { bg: COLORS.mangoSoft, stroke: COLORS.mango }));
    return marks;
  });

  return { intro: heading(beat.title), steps };
}

/**
 * code: a program explained line by line.
 *   { title, code: ['line', ...], steps: [{ say, lines?: [2], note?, output?: ['0', '1'] }] }
 * A step can highlight lines (a note card points at them) and/or show the output so far
 * (give the whole output each time: later steps replace earlier ones).
 */
function codeBoard(beat) {
  const x = 40;
  const y = 92;
  const width = codeWidth(beat.code);
  const bottom = y + codeHeight(beat.code.length);
  const noteX = x + width + 28;
  const noteWidth = 760 - noteX;
  let nextNoteY = y;
  let color = 0;
  let outputLines = 0;
  let previousLine = 1;

  const steps = beat.steps.map((step) => {
    const marks = [];
    if (step.lines?.length) {
      const { main, soft } = accentOf(step.color, color++);
      const first = Math.min(...step.lines);
      const last = Math.max(...step.lines);
      const top = codeLineTop(y, first);
      const bandHeight = (last - first + 1) * CODE.lineHeight;
      marks.push(highlight(x, top, width, bandHeight, main));
      marks.push(transfer([x - 10, codeLineTop(y, previousLine) + CODE.lineHeight / 2], [x - 10, top + CODE.lineHeight / 2], `Line ${first}`));
      previousLine = first;

      if (step.note) {
        const noteHeight = 24 + countLines(step.note, 13.5, noteWidth - 28) * 17;
        const noteY = Math.max(top + bandHeight / 2 - noteHeight / 2, nextNoteY);
        nextNoteY = noteY + noteHeight + 12;
        marks.push(arrow([noteX, noteY + noteHeight / 2], [x + width + 4, top + bandHeight / 2], '', { color: main }));
        marks.push(box(noteX, noteY, noteWidth, noteHeight, step.note, { fill: soft, stroke: main, rx: 12, fontSize: 13.5, fontWeight: 600 }));
      }
    }
    if (step.output) {
      // A longer output extends the one on the board: only the new lines print.
      const grows = outputLines > 0 && step.output.length > outputLines;
      const growth = grows ? { append: true, reveal_from: outputLines + 1 } : {};
      outputLines = step.output.length;
      marks.push(code(step.output, x, bottom + 14, { width: Math.min(width, 300), language: 'text', title: 'Output', ...growth }));
      marks.push(transfer([x + width / 2, codeLineTop(y, previousLine) + CODE.lineHeight / 2], [x + Math.min(width, 300) / 2, bottom + 50], 'Output'));
    }
    return marks;
  });

  return { intro: [...heading(beat.title), code(beat.code, x, y, { width, language: beat.language ?? 'python' })], steps };
}

/**
 * trace: a table that fills in row by row (what the computer does, step by step).
 *   { title, columns: ['i', 'output'], rows: [['0', '0'], ...], code?: [...],
 *     steps: [{ say, rows?: 1, note? }] }
 * `rows` on a step is how many table rows appear with it (default 1). `code` shows the
 * program on the left. Up to about 8 rows fit.
 */
function trace(beat) {
  const columns = beat.columns.length;
  const hasCode = Boolean(beat.code);
  const codeW = hasCode ? codeWidth(beat.code, { min: 240, max: 320 }) : 0;
  const tableLeft = hasCode ? 40 + codeW + 36 : 0;
  const colWidth = Math.min(hasCode ? 150 : 230, (hasCode ? 760 - tableLeft : 640) / columns);
  const left = hasCode ? tableLeft : (800 - colWidth * columns) / 2;
  const rowHeight = Math.min(42, 340 / (beat.rows.length + 1));
  const top = 96;
  const nextNote = noteSlots(404, 50);

  const row = (cells, r, current) =>
    cells.map((cell, c) =>
      box(left + c * colWidth, top + (r + 1) * rowHeight, colWidth, rowHeight, cell, {
        fill: current ? COLORS.mangoSoft : COLORS.paper,
        stroke: current ? COLORS.mango : COLORS.line,
        strokeWidth: current ? 2.5 : 1.5,
        rx: 0,
        fontSize: 15,
        fontWeight: 600,
        mono: true
      })
    );

  const header = beat.columns.map((label, c) =>
    box(left + c * colWidth, top, colWidth, rowHeight, label, { fill: COLORS.ink, stroke: COLORS.ink, rx: 0, fontSize: 14, mono: true })
  );

  let shown = 0;
  const steps = beat.steps.map((step) => {
    const marks = [];
    const from = shown;
    const to = Math.min(beat.rows.length, shown + (step.rows ?? 1));
    // The row that was "current" becomes a normal row, then the new rows are drawn.
    if (from > 0) marks.push(...row(beat.rows[from - 1], from - 1, false));
    for (let r = from; r < to; r++) marks.push(...row(beat.rows[r], r, r === to - 1));
    if (to > from) marks.push(transfer([hasCode ? 40 + codeW : left, top + Math.max(0, from) * rowHeight + rowHeight / 2], [left + colWidth * columns / 2, top + to * rowHeight + rowHeight / 2], beat.rows[to - 1].join(' → ')));
    shown = to;
    if (step.note) marks.push(callout(step.note, left, nextNote(), Math.max(colWidth * columns, 300), { bg: COLORS.mangoSoft, stroke: COLORS.mango }));
    return marks;
  });

  const intro = [...heading(beat.title), ...header];
  if (hasCode) intro.push(code(beat.code, 40, top, { width: codeW }));
  return { intro, steps };
}

/**
 * boxes: variables as labeled boxes that fill and change (computer memory).
 *   { title, steps: [{ say, line?: 'score = 10', set?: ['score', '10'], note? }] }
 * `line` adds a line to the program shown on the left; `set` creates the variable box or,
 * when the name already exists, crosses out the old value and writes the new one;
 * `output` shows what the program has printed so far (the whole output each time).
 * Values are Python source text: '10', '"Layla"', 'True', '9.5'.
 */
function boxes(beat) {
  const programLines = beat.steps.map((s) => s.line).filter(Boolean);
  const names = [...new Set(beat.steps.filter((s) => s.set).map((s) => s.set[0]))];
  const hasCode = programLines.length > 0;
  const codeW = hasCode ? codeWidth(programLines, { min: 250, max: 330 }) : 0;
  const outputTop = 96 + codeHeight(programLines.length) + 14; // below the finished program

  const roomy = names.length <= 2;
  const boxW = hasCode ? (roomy ? 200 : 150) : 170;
  const boxH = roomy ? 110 : 96;
  const gridLeft = hasCode ? 40 + codeW + 44 : 70;
  const gridWidth = hasCode ? 760 - gridLeft : 660;
  const perRow = Math.max(1, Math.floor((gridWidth + 20) / (boxW + 20)));
  const rowSize = Math.min(names.length, perRow);
  const rowLeft = gridLeft + (gridWidth - (rowSize * boxW + (rowSize - 1) * 20)) / 2;
  const slot = (name) => {
    const i = names.indexOf(name);
    return [rowLeft + (i % perRow) * (boxW + 20), (roomy ? 150 : 132) + Math.floor(i / perRow) * 150];
  };

  const values = {};
  const written = [];
  let printed = 0;
  const nextNote = noteSlots(400, 54);

  const steps = beat.steps.map((step) => {
    const marks = [];

    if (step.line) {
      written.push(step.line);
      // The program grows by one line: only that line animates in.
      const growth = written.length > 1 ? { append: true, reveal_from: written.length } : {};
      marks.push(code(written, 40, 96, { width: codeW, active_line: written.length, ...growth }));
    }

    if (step.output) {
      const grows = printed > 0 && step.output.length > printed;
      const growth = grows ? { append: true, reveal_from: printed + 1 } : {};
      printed = step.output.length;
      marks.push(code(step.output, 40, outputTop, { width: Math.min(codeW, 300), language: 'text', title: 'Output', ...growth }));
    }

    if (step.set) {
      const [name, value] = step.set;
      const [x, y] = slot(name);
      const previous = values[name];
      const kind = kindOf(value);
      values[name] = value;

      marks.push(box(x, y, boxW, boxH, '', { fill: kind.soft, stroke: kind.main, strokeWidth: 3, rx: 16 }));
      marks.push(badge(name, x + 12, y - 15, { bg: kind.main }));
      marks.push(text(String(value), x + boxW / 2, y + boxH / 2 + 11, { fontSize: fitSize(String(value), boxW - 28, 30, 16), fontWeight: 800, textAnchor: 'middle', maxWidth: boxW - 20, maxLines: 1 }));
      if (kind.label) marks.push(text(kind.label, x + boxW - 10, y + boxH + 18, { fontSize: 12, fontWeight: 600, color: COLORS.muted, textAnchor: 'end' }));
      if (previous !== undefined) {
        const w = textWidth(previous, 15);
        marks.push(text(String(previous), x + boxW - 14, y + 30, { fontSize: 15, fontWeight: 600, color: COLORS.faint, textAnchor: 'end' }));
        marks.push(line([x + boxW - 14 - w - 2, y + 25], [x + boxW - 12, y + 25], { color: COLORS.pink, strokeWidth: 2.5 }));
      }
      marks.push(transfer(hasCode ? [40 + codeW / 2, codeLineTop(96, written.length || 1) + CODE.lineHeight / 2] : [x + boxW / 2, y - 35], [x + boxW / 2, y + boxH / 2], String(value)));
    }

    if (step.note) marks.push(callout(step.note, hasCode ? 40 : 120, nextNote(), hasCode ? 640 : 560, { bg: COLORS.mangoSoft, stroke: COLORS.mango }));
    return marks;
  });

  return { intro: heading(beat.title), steps };
}

/**
 * compare: two ideas side by side.
 *   { title, left: { title, color? }, right: { title, color? },
 *     steps: [{ say, side: 'left' | 'right', text?, mono?, code?: ['line', ...] }] }
 * Each step adds one item under its side: a text box, or a code card when `code` is given.
 */
function compare(beat) {
  const width = 340;
  const sides = {
    left: { x: 40, used: 0, ...accentOf(beat.left.color, 3), title: beat.left.title },
    right: { x: 420, used: 0, ...accentOf(beat.right.color, 1), title: beat.right.title }
  };

  const intro = [...heading(beat.title)];
  for (const side of Object.values(sides)) {
    intro.push(box(side.x, 96, width, 46, side.title, { fill: side.main, stroke: side.main, rx: 14, fontSize: 17 }));
  }
  intro.push(circle(400, 119, 17, 'vs', { fill: COLORS.ink, stroke: COLORS.paper, strokeWidth: 3 }));

  const steps = beat.steps.map((step) => {
    const side = sides[step.side];
    const y = 160 + side.used;
    side.used += (step.code ? codeHeight(step.code.length) : 52) + 12;

    if (step.code) return [code(step.code, side.x, y, { width })];
    return [box(side.x, y, width, 52, step.text, { fill: side.soft, stroke: side.main, rx: 12, fontSize: step.mono ? 14 : 15, fontWeight: 600, mono: step.mono })];
  });

  return { intro, steps };
}

/**
 * numberline: values in a row (what range() makes, list positions...).
 *   { title, ticks: [0, 1, 2, 3, 4, 5],
 *     steps: [{ say, mark?: [0, 1, 2], hollow?: [5], label?, labelAt? }] }
 * `mark` and `hollow` are positions in `ticks` (0 = first). `mark` fills them, `hollow`
 * shows them as "not included". `label` is written under position `labelAt`.
 */
function numberline(beat) {
  const n = beat.ticks.length;
  const spacing = Math.min(86, 640 / Math.max(n - 1, 1));
  const left = (800 - spacing * (n - 1)) / 2;
  const cy = 235;
  const radius = Math.min(27, spacing * 0.38);
  const at = (i) => left + i * spacing;

  const intro = [...heading(beat.title), line([left - 44, cy], [at(n - 1) + 44, cy], { color: COLORS.line, strokeWidth: 4 })];
  beat.ticks.forEach((tick, i) => {
    intro.push(circle(at(i), cy, radius, String(tick), { fill: COLORS.paper, stroke: COLORS.line, strokeWidth: 2 }));
  });

  let color = 0;
  const steps = beat.steps.map((step) => {
    const { main, soft } = accentOf(step.color, color++);
    const marks = [];
    for (const i of step.mark ?? []) {
      marks.push(circle(at(i), cy, radius, String(beat.ticks[i]), { fill: main, stroke: main }));
    }
    for (const i of step.hollow ?? []) {
      marks.push(circle(at(i), cy, radius, String(beat.ticks[i]), { fill: COLORS.pinkSoft, stroke: COLORS.pink, strokeWidth: 3 }));
    }
    if (step.label) {
      const x = at(step.labelAt ?? 0);
      const accent = step.hollow?.length && !step.mark?.length ? COLORS.pink : main;
      marks.push(arrow([x, cy + 100], [x, cy + radius + 10], '', { color: accent, strokeWidth: 3 }));
      marks.push(text(step.label, clamp(x, 130, 670), cy + 128, { fontSize: 17, fontWeight: 800, color: accent === COLORS.mango ? COLORS.ink : accent, textAnchor: 'middle', maxWidth: 240, maxLines: 2 }));
    }
    return marks;
  });

  return { intro, steps };
}

/**
 * cards: a few kinds of things side by side (data types, parts of a statement).
 *   { title, steps: [{ say, title, example, detail?, color? }] }   (2 to 4 cards)
 */
function cards(beat) {
  const n = beat.steps.length;
  const gap = 24;
  const width = Math.min(200, (720 - gap * (n - 1)) / n);
  const left = (800 - (n * width + gap * (n - 1))) / 2;
  const top = 128;

  const steps = beat.steps.map((step, i) => {
    const { main, soft } = accentOf(step.color, i);
    const x = left + i * (width + gap);
    const cx = x + width / 2;
    const marks = [
      box(x, top, width, 240, '', { fill: soft, stroke: main, strokeWidth: 2.5, rx: 18 }),
      badge(step.title, cx - (textWidth(step.title, 15) + 28) / 2, top - 15, { bg: main, fontSize: 15 }),
      text(step.example, cx, top + 112, { fontSize: fitSize(step.example, width - 24, 30, 15), fontWeight: 800, textAnchor: 'middle', maxWidth: width - 16, maxLines: 2 })
    ];
    if (step.detail) {
      marks.push(text(step.detail, cx, top + 178, { fontSize: 14, fontWeight: 500, color: COLORS.muted, textAnchor: 'middle', maxWidth: width - 28, maxLines: 3 }));
    }
    return marks;
  });

  return { intro: heading(beat.title), steps };
}

/**
 * recap: the key points to remember, one row per step.
 *   { title?, steps: [{ say, text, mono? }] }   (up to 5 rows)
 */
function recap(beat) {
  const steps = beat.steps.map((step, i) => {
    const y = 104 + i * 70;
    return [
      box(150, y, 560, 56, step.text, { fill: COLORS.tealSoft, stroke: COLORS.teal, rx: 16, fontSize: step.mono ? 15 : 16, fontWeight: 700, mono: step.mono }),
      circle(118, y + 28, 17, '✓', { fill: COLORS.teal, stroke: COLORS.teal })
    ];
  });

  return { intro: heading(beat.title ?? 'Remember'), steps };
}

/** array: { structure?: 'array'|'stack'|'queue', values, steps: [{say, values?, active_index?, note?}] } */
function structure(beat) {
  const type = ['stack', 'queue'].includes(beat.structure) ? beat.structure : 'array';
  const position = type === 'stack' ? [310, 150] : [80, 190];
  const base = { values: beat.values ?? [], position, width: type === 'stack' ? 180 : 640, label: beat.label, replace: true };
  const nextNote = noteSlots(type === 'stack' ? 420 : 330, 48);
  return {
    intro: [...heading(beat.title), { type: `draw_${type}`, payload: base }],
    steps: beat.steps.map((step) => [
      { type: `draw_${type}`, payload: { ...base, values: step.values ?? base.values, active_index: step.active_index } },
      ...(step.note ? [callout(step.note, 120, nextNote(), 560)] : [])
    ])
  };
}

/** diagram: { nodes, edges, steps: [{say, nodes?, edges?, note?}] } */
function diagram(beat) {
  const base = { nodes: beat.nodes ?? [], edges: beat.edges ?? [], position: [65, 160], replace: true };
  return {
    intro: [...heading(beat.title), { type: 'draw_flowchart', payload: base }],
    steps: beat.steps.map((step) => [
      { type: 'draw_flowchart', payload: { ...base, nodes: step.nodes ?? base.nodes, edges: step.edges ?? base.edges } },
      ...(step.note ? [callout(step.note, 120, 390, 560)] : [])
    ])
  };
}

/** chart: { values, labels?, graph_type?: 'bar'|'line', steps: [{say, values?, note?}] } */
function chart(beat) {
  const base = { graph_type: beat.graph_type ?? 'bar', position: [150, 145], size: [500, 210], data: { values: beat.values ?? [], labels: beat.labels ?? [] }, replace: true };
  return {
    intro: [...heading(beat.title), { type: 'draw_graph', payload: base }],
    steps: beat.steps.map((step) => [
      { type: 'draw_graph', payload: { ...base, data: { values: step.values ?? base.data.values, labels: step.labels ?? base.data.labels } } },
      ...(step.note ? [callout(step.note, 120, 415, 560)] : [])
    ])
  };
}

/** physics: { shape_type?: 'wave'|'pendulum'|'spring'|'triangle', steps: [{say, label?, note?}] } */
function physics(beat) {
  return {
    intro: heading(beat.title),
    steps: beat.steps.map((step) => [
      { type: 'draw_physics_shape', payload: { shape_type: step.shape_type ?? beat.shape_type ?? 'wave', position: [240, 125], size: [320, 210], label: step.label, replace: true } },
      ...(step.note ? [callout(step.note, 120, 405, 560)] : [])
    ])
  };
}

/** algorithm: { algorithm: 'loop'|'search'|'sort'|'stack'|'queue', values, target?, strategy?, operations?, step_seconds?, steps: [{say, note?}] } */
function algorithm(beat) {
  const name = ['loop', 'search', 'sort', 'stack', 'queue'].includes(beat.algorithm) ? beat.algorithm : 'loop';
  const payload = { values: beat.values, target: beat.target, strategy: beat.strategy, operations: beat.operations, prefix: beat.prefix, output_mode: beat.output_mode, variable: beat.variable, code: beat.code, step_seconds: beat.step_seconds };
  return {
    intro: heading(beat.title),
    steps: beat.steps.map((_, index) => index === 0 ? [{ type: `animate_${name}`, payload }] : [])
  };
}

export const LAYOUTS = { statement, flow, code: codeBoard, trace, boxes, compare, numberline, cards, recap, array: structure, diagram, chart, physics, algorithm };
