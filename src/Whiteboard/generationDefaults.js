/** The default contract attached to every new lesson-generation request. */
export const WHITEBOARD_GENERATION_DEFAULTS = {
  version: 2,
  animation_mode: 'explanatory',
  detail_level: 'step_by_step',
  required_for_every_section: true,
  instructions: [
    'Create whiteboard.plan.beats for every section alongside its reading blocks.',
    'Use short spoken steps. Each step must explain one observable change: a comparison, assignment, branch, output, insertion, removal, or physical relationship.',
    'Use algorithm layouts for loops, search, sorting, stacks and queues. Use flow, trace, boxes, chart, diagram and physics when they express the actual concept.',
    'Give algorithms their real values and operations. Binary search requires ascending sorted values. Never invent execution results or animate a random shuffle.',
    'Explain input, intermediate states, and the result. Narration and step_seconds must cover the complete animation. The compiler reserves extra time before clearing the board.',
    'Include a prediction or understanding check before revealing a result when appropriate; include an expected answer only when it is known.',
    'Use a recap after the worked example. Keep meaning in text and diagrams so students who disable motion can still understand every step.',
    'Do not supply decorative looping motion. Movement must show where data or execution goes, what changes, or why a result follows.',
    'Do not write x/y coordinates: supported layouts own the 800 by 500 geometry.'
  ],
  limits: { loop_values: 8, search_values: 10, sort_values: 7, collection_values: 6, collection_operations: 12 },
  example_plan: {
    beats: [
      {
        layout: 'algorithm', algorithm: 'search', title: 'Find 12 by narrowing the range',
        values: [2, 4, 6, 8, 10, 12, 14], target: 12, strategy: 'binary', step_seconds: 4,
        say: 'A sorted sequence lets us discard values that cannot be the target.',
        steps: [
          { say: 'Compare the middle value, eight, with twelve. Eight is smaller, so discard the middle and every value to its left.' },
          { say: 'The new middle is twelve. It matches the target, so the search finishes after two comparisons.' },
          { say: 'What made it safe to discard the left half?', ask: { question: 'The values must be in which order?', answer: 'Ascending' } }
        ]
      },
      {
        layout: 'recap', title: 'Remember the rule',
        steps: [
          { say: 'Binary search requires sorted values.', text: 'Start with sorted values' },
          { say: 'Compare the middle and keep only the half that can contain the target.', text: 'Compare → discard → repeat' }
        ]
      }
    ]
  }
};
