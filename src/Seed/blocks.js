/**
 * Short helpers for writing lesson text blocks (the "reading" version of a section).
 * They produce the block shapes stored in Lesson.versions[].sections[].blocks.
 */

export const paragraph = (text) => ({ type: 'paragraph', text });

export const codeBlock = (code, expected_output = null) => ({
  type: 'code',
  language: 'python',
  code,
  expected_output
});

export const list = (...items) => ({ type: 'list', items });

/** type: 'tip' | 'warning' | 'note' */
export const callout = (callout_type, text) => ({ type: 'callout', callout_type, text });
