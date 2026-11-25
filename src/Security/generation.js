import { inspectInput, httpError } from "./input.js";

export function validateGenerationInput(data) {
  inspectInput(data);
  if (
    typeof data.topic !== "string" ||
    data.topic.trim().length < 2 ||
    data.topic.length > 200
  )
    throw httpError(400, "Enter a lesson topic of 2–200 characters.");
  for (const field of [
    "special_instructions",
    "reference_notes",
    "scope_constraints",
    "prerequisites",
  ]) {
    if (
      data[field] != null &&
      (typeof data[field] !== "string" || data[field].length > 12000)
    )
      throw httpError(400, "Lesson instructions must be bounded text.");
  }
  for (const field of ["objectives"]) {
    if (
      data[field] != null &&
      (!Array.isArray(data[field]) ||
        data[field].length > 20 ||
        data[field].some(
          (item) => typeof item !== "string" || item.length > 500,
        ))
    )
      throw httpError(
        400,
        "Supply at most 20 short learning objectives or prerequisites.",
      );
  }
  const duration = data.target_duration_minutes ?? data.duration;
  if (
    duration != null &&
    (!Number.isFinite(duration) || duration < 5 || duration > 90)
  )
    throw httpError(400, "Lesson duration must be 5–90 minutes.");
}

let running = 0;
const pending = [];
export function scheduleGeneration(task) {
  if (pending.length >= 20)
    throw httpError(
      503,
      "The lesson generation queue is full. Try again shortly.",
    );
  pending.push(task);
  function drain() {
    while (running < 2 && pending.length) {
      running++;
      Promise.resolve()
        .then(pending.shift())
        .catch(() => {})
        .finally(() => {
          running--;
          drain();
        });
    }
  }
  drain();
}
