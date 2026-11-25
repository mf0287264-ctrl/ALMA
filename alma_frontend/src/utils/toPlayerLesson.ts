import type {
  LessonDocument,
  LessonVersion,
  PlayerLesson,
} from "@/types/Lesson.type";

/** Match the published version first, then the current version or latest available one. */
export function activeLessonVersion(
  lesson: LessonDocument,
): LessonVersion | undefined {
  const versions = (lesson.versions ?? []).filter(Boolean);
  return (
    (lesson.approved_version_no != null
      ? versions.find(
          (version) => version.version_no === lesson.approved_version_no,
        )
      : undefined) ??
    (lesson.current_version_no != null
      ? versions.find(
          (version) => version.version_no === lesson.current_version_no,
        )
      : undefined) ??
    versions
      .filter((version) => version.state === "APPROVED")
      .sort((a, b) => (b.version_no ?? 0) - (a.version_no ?? 0))[0] ??
    [...versions].sort((a, b) => (b.version_no ?? 0) - (a.version_no ?? 0))[0]
  );
}

export function hasWhiteboard(input: unknown): boolean {
  if (Array.isArray(input))
    return input.some((scene) => scene && typeof scene === "object");
  if (!input || typeof input !== "object") return false;
  const board = input as Record<string, unknown>;
  if (Array.isArray(board.parts)) return board.parts.some(hasWhiteboard);
  const scenes = board.scenes ?? board.visual_sequence;
  return (
    Array.isArray(scenes) &&
    scenes.some((scene) => scene && typeof scene === "object")
  );
}

/** Keep authored sections, whiteboards, checks and remediation together, including one-section lessons. */
export function toPlayerLesson(data: LessonDocument): PlayerLesson {
  const version = activeLessonVersion(data);
  const rawSections = version?.sections ?? data.sections ?? [];
  const sections = rawSections.length
    ? rawSections.map((section, index) => ({
        ...section,
        order: section.order ?? index + 1,
        title: section.title || `Section ${index + 1}`,
      }))
    : data.blocks?.length || hasWhiteboard(data.whiteboard)
      ? [
          {
            order: 1,
            title: data.title || data.topic || "Lesson",
            blocks: data.blocks ?? [],
            whiteboard: data.whiteboard,
            diagnostic_check: data.diagnostic_check,
          },
        ]
      : [];

  return {
    ...data,
    topic: data.topic || data.title || version?.title || "Lesson",
    title: version?.title || data.title || data.topic || "Lesson",
    version_no: version?.version_no ?? 1,
    sections,
    introduction: version?.introduction ?? [],
    conclusion: version?.conclusion ?? [],
    has_whiteboard: sections.some((section) =>
      hasWhiteboard(section.whiteboard),
    ),
  };
}

export function lessonPlayerHref(
  lesson: Pick<LessonDocument, "_id" | "is_practice" | "course_id">,
): string {
  const params = new URLSearchParams(
    lesson.is_practice ? { sample: lesson._id } : { lessonId: lesson._id },
  );
  if (lesson.course_id && !lesson.is_practice)
    params.set("courseId", lesson.course_id);
  return `/my-lessons/player?${params}`;
}
