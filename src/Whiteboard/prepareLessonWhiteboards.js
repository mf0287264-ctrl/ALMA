import { buildWhiteboard } from './buildWhiteboard.js';

const clip = (text, max = 90) => text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
const sentences = (text) => String(text ?? '').split(/(?<=[.!?])\s+/).map(value => value.trim()).filter(Boolean);

/** Recognize only the exact two-line loop this renderer explains; never execute source. */
function simpleLoop(source) {
  const match = source.trim().match(/^for ([A-Za-z_]\w*) in range\((\d+)(?:,\s*(\d+))?(?:,\s*(\d+))?\):\n\s+print\(["']([^"']*)["'],\s*\1\)$/);
  if (!match) return null;
  const [, variable, a, b, c, prefix] = match;
  const start = b === undefined ? 0 : Number(a), stop = b === undefined ? Number(a) : Number(b), step = c === undefined ? 1 : Number(c);
  if (step <= 0 || stop <= start || Math.ceil((stop-start)/step) > 8) return null;
  const values = Array.from({ length: Math.ceil((stop-start)/step) }, (_, index) => start + index * step);
  return { algorithm: 'loop', variable, prefix, values, code: source.trim() };
}

function describeLine(line, index) {
  const value = line.trim();
  const assignment = value.match(/^([A-Za-z_]\w*)\s*=\s*(?!=)(.+)$/);
  if (assignment) return `Store the value of ${assignment[2]} in ${assignment[1]}.`;
  if (value.startsWith('print(')) return `This instruction displays ${value.slice(6,-1)} in the output.`;
  if (value.startsWith('return ')) return `Return ${value.slice(7)} to the caller.`;
  if (value.startsWith('for ')) return 'This loop visits the values in its sequence. The indented body runs for each value.';
  if (value.startsWith('def ')) return `Define the reusable function ${value.slice(4).split('(')[0]}.`;
  if (value.startsWith('if ')) return `Check the condition ${value.slice(3).replace(/:$/, '')}. Run the indented branch when it is true.`;
  if (value.startsWith('#')) return `The comment explains: ${value.slice(1).trim()}`;
  return `Read instruction ${index + 1}: ${value}`;
}

/** Reading-only lesson output still receives a detailed animated board by default. */
export function planFromSection(section) {
  const beats = [];
  const blocks = Array.isArray(section.blocks) ? section.blocks : [];
  for (const block of blocks) {
    if (!block || typeof block !== 'object') continue;
    if (block.type === 'code' && typeof block.code === 'string' && block.code.trim()) {
      const loop = simpleLoop(block.code);
      if (loop && !block.expected_output) {
        beats.push({ layout: 'algorithm', title: section.title ?? 'Follow the loop', say: 'Watch each value move into the loop variable, through the body, and into the output.', ...loop });
        continue;
      }
      const lines = block.code.replace(/\r\n/g, '\n').trimEnd().split('\n');
      for (let offset = 0; offset < lines.length; offset += 8) {
        const code = lines.slice(offset, offset + 8);
        const steps = code.map((line, index) => ({ say: describeLine(line, offset + index), lines: [index + 1], note: clip(line.trim() || 'Blank line separates instructions', 70) }));
        // Known output can be predicted and then revealed; unknown output is never invented.
        if (offset + 8 >= lines.length && typeof block.expected_output === 'string' && block.expected_output.trim()) {
          steps.push({ say: 'Before revealing the result, predict the output of this code.', ask: { question: 'What does the program print?', answer: block.expected_output } });
          if (block.expected_output.split('\n').length <= 4) steps.push({ say: 'Compare your prediction with the supplied output.', output: block.expected_output.split('\n') });
        }
        beats.push({ layout: 'code', title: lines.length > 8 ? `${section.title ?? 'Code'} · lines ${offset+1}–${offset+code.length}` : section.title ?? 'Read the code', say: 'Follow the highlighted instructions one at a time.', code, steps });
        if (offset + 8 >= lines.length && typeof block.expected_output === 'string' && block.expected_output.split('\n').length > 4) {
          const output = block.expected_output.split('\n');
          for (let start = 0; start < output.length; start += 8) beats.push({ layout: 'code', language: 'output', title: 'Program output', code: output.slice(start, start + 8), say: 'Compare your prediction with these lines of the supplied output.', steps: [{ say: 'Follow each printed line in order.', lines: [1] }] });
        }
      }
    } else {
      const text = block.type === 'list' ? (Array.isArray(block.items) ? block.items : []).flatMap(sentences) : sentences(block.text);
      for (let index = 0; index < text.length; index += 3) {
        const group = text.slice(index, index + 3);
        beats.push({ layout: 'statement', title: section.title ?? 'Key idea', say: index === 0 ? 'Let us build the idea one step at a time.' : 'Now connect this idea with the next details.', steps: group.map(say => ({ say, text: clip(say, 60) })) });
      }
    }
  }
  if (!beats.length) return null;
  beats.push({ layout: 'recap', title: 'Check your understanding', steps: [{ say: 'Revisit the worked steps and explain how the inputs led to the result.', text: 'Input → steps → result' }] });
  return { beats };
}

/** Called by lesson create/update, so plans are compiled before they are stored. */
export function prepareLessonWhiteboards(data) {
  if (!data || !Array.isArray(data.versions)) return data;
  return { ...data, versions: data.versions.map(version => {
    if (!version || !Array.isArray(version.sections)) return version;
    return { ...version, sections: version.sections.map(section => {
      if (!section || typeof section !== 'object') return section;
      const existing = section.whiteboard;
      const explicitPlan = existing?.plan ?? section.whiteboard_plan ?? (Array.isArray(section.board) ? { beats: section.board } : null);
      if (!explicitPlan && Array.isArray(existing?.scenes) && existing.scenes.length) return section;
      const plan = explicitPlan ?? planFromSection(section);
      if (!plan) return section;
      try { return { ...section, whiteboard: { ...existing, ...buildWhiteboard(plan), plan } }; }
      catch (error) { error.statusCode = 400; throw error; }
    }) };
  }) };
}
