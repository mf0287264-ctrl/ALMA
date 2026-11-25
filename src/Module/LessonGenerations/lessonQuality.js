const words = (text) =>
  typeof text === "string" ? text.trim().split(/\s+/).length : 0;

/** Validate the teaching contract; compilation separately validates supported animation data. */
export function validateGeneratedSection(section) {
  const errors = [];
  if (!section?.title?.trim() || !section?.purpose?.trim())
    errors.push("Provide a section title and a concrete learning purpose.");
  if (!Array.isArray(section?.blocks) || section.blocks.length < 2)
    errors.push(
      "Provide at least two reading blocks explaining the worked example.",
    );
  const check = section?.diagnostic_check;
  if (!check || words(check.question_text) < 15)
    errors.push(
      "Provide a detailed question with the worked inputs or code and a precise task.",
    );
  if (
    !Array.isArray(check?.options) ||
    check.options.length < 3 ||
    check.options.length > 5 ||
    check.options.some((value) => typeof value !== "string" || !value.trim()) ||
    new Set(check.options).size !== check.options.length
  )
    errors.push("Provide three to five distinct, non-empty answer options.");
  if (!check?.options?.includes(check.correct_answer))
    errors.push("correct_answer must exactly match one answer option.");
  if (words(check?.explanation) < 20)
    errors.push(
      "Explain the answer step by step, using the actual values from the question.",
    );
  if (Array.isArray(check?.options))
    for (const option of check.options) {
      if (
        option !== check.correct_answer &&
        words(check.misconception_map?.[option]) < 8
      )
        errors.push(
          `Explain the misconception for the wrong option: ${option}`,
        );
    }
  if (
    !Array.isArray(section?.remediation_blocks) ||
    !section.remediation_blocks.length
  )
    errors.push("Include a concrete remediation example or a worked hint.");
  const beats = section?.whiteboard?.plan?.beats;
  if (!Array.isArray(beats) || beats.length < 3)
    errors.push(
      "Provide at least three whiteboard beats: the concept, a worked example, and a recap.",
    );
  if (
    Array.isArray(beats) &&
    !beats.some((beat) => beat.steps?.some((step) => step.ask?.question))
  )
    errors.push(
      "Include a prediction question before revealing the worked result.",
    );
  if (errors.length) {
    const error = new Error(errors.join("\n"));
    error.statusCode = 400;
    throw error;
  }
  return section;
}
