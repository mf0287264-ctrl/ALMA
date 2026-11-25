import type { LessonSection, PlayerLesson } from "@/types/Lesson.type";

export interface LessonProgress {
  sectionIndex: number;
  completedSections: number[];
  watchedSections: number[];
  answers: Record<number, string>;
  finished: boolean;
}

export const emptyLessonProgress = (): LessonProgress => ({
  sectionIndex: 0,
  completedSections: [],
  watchedSections: [],
  answers: {},
  finished: false,
});

export function progressStorageKey(
  lessonId: string,
  version: number,
  studentId?: string,
): string {
  return `alma:lesson-progress:${studentId || "local-practice"}:${lessonId}:v${version}`;
}

export function checkpointPassed(
  section: LessonSection,
  answer?: string,
): boolean {
  return (
    !section.diagnostic_check ||
    answer === section.diagnostic_check.correct_answer
  );
}

/** Validate stored progress against the current lesson, so old or malformed answers cannot pass a check. */
export function restoreLessonProgress(
  input: unknown,
  lesson: PlayerLesson,
): LessonProgress {
  const empty = emptyLessonProgress();
  if (!input || typeof input !== "object") return empty;
  const stored = input as Record<string, unknown>;
  const validIndex = (value: unknown): value is number =>
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value < lesson.sections.length;
  const answers: Record<number, string> = {};
  if (stored.answers && typeof stored.answers === "object") {
    for (const [key, answer] of Object.entries(stored.answers)) {
      const index = Number(key);
      if (
        validIndex(index) &&
        typeof answer === "string" &&
        lesson.sections[index].diagnostic_check?.correct_answer === answer
      )
        answers[index] = answer;
    }
  }
  const completedSections = Array.isArray(stored.completedSections)
    ? [...new Set(stored.completedSections.filter(validIndex))].filter(
        (index) => checkpointPassed(lesson.sections[index], answers[index]),
      )
    : [];
  return {
    sectionIndex: validIndex(stored.sectionIndex) ? stored.sectionIndex : 0,
    completedSections,
    watchedSections: Array.isArray(stored.watchedSections)
      ? [...new Set(stored.watchedSections.filter(validIndex))]
      : [],
    answers,
    finished:
      stored.finished === true &&
      completedSections.length === lesson.sections.length,
  };
}
