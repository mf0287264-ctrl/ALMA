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
    'Write a detailed diagnostic_check for every teaching section. Anchor question_text to the exact worked example, supply its inputs or code_snippet, and ask students to trace a result or explain a specific decision. Never use generic questions about the advantages of learning a topic.',
    'Supply one unambiguously correct_answer that exactly matches an option, three plausible distractors, a misconception_map explaining each wrong option, and a step-by-step explanation of the correct reasoning. Preserve case, indentation, punctuation and line breaks in code and output.',
    'Make remediation_blocks reteach the specific misconception with the same values or a small verified example. Use meaningful questions about the lesson rather than random trivia. Use different worked questions for the in-board prediction and the final checkpoint.',
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
          { say: 'Check why the first comparison was safe.', ask: { question: 'The target is 12 and the middle value is 8 in [2, 4, 6, 8, 10, 12, 14]. Because every value to the left is at most 8, the target cannot be there. What ordering of the array makes this discard rule safe? Answer with the ordering: ascending or descending.', answer: 'Ascending' } }
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
