export function activeLessonVersion(lesson) {
  const versions = (lesson.versions || []).filter(Boolean);
  return (
    (lesson.approved_version_no != null
      ? versions.find(
          (version) => version.version_no === lesson.approved_version_no,
        )
      : null) ??
    (lesson.current_version_no != null
      ? versions.find(
          (version) => version.version_no === lesson.current_version_no,
        )
      : null) ??
    versions
      .filter((version) => version.state === "APPROVED")
      .sort((a, b) => (b.version_no || 0) - (a.version_no || 0))[0] ??
    [...versions].sort((a, b) => (b.version_no || 0) - (a.version_no || 0))[0]
  );
}

/** The list reports content that is playable or will be compiled when the lesson is opened. */
function canShowWhiteboard(section) {
  const board = section.whiteboard;
  return Boolean(
    board?.scenes?.length ||
    board?.visual_sequence?.length ||
    board?.parts?.some((part) => part.scenes?.length) ||
    board?.plan?.beats?.length ||
    section.whiteboard_plan?.beats?.length ||
    section.board?.length ||
    section.blocks?.some(
      (block) =>
        block?.text?.trim() || block?.code?.trim() || block?.items?.length,
    ),
  );
}

/** My Lessons needs metadata, not every scene in every lesson. */
export function lessonSummary(lesson) {
  const {
    versions,
    sections: rootSections,
    blocks,
    whiteboard,
    ...metadata
  } = lesson;
  const sections =
    activeLessonVersion(lesson)?.sections ??
    rootSections ??
    (blocks?.length || whiteboard ? [lesson] : []);
  return {
    ...metadata,
    version_no:
      activeLessonVersion(lesson)?.version_no ?? lesson.current_version_no ?? 1,
    section_count: sections.length,
    has_whiteboard: sections.some(canShowWhiteboard),
  };
}

/** Keep explicit unpublished drafts out of the student library; preserve legacy unversioned content. */
export function isPublishedLesson(lesson) {
  if (['draft', 'archived', 'rejected'].includes(lesson.status)) return false;
  const versions = lesson.versions;
  return (
    !Array.isArray(versions) ||
    !versions.length ||
    versions.some((version) => version?.state === "APPROVED") ||
    versions.every((version) => !version?.state)
  );
}

/** Students receive approved content only, including when a newer draft exists. */
export function publishedLessonDocument(lesson) {
  if (!Array.isArray(lesson.versions) || !lesson.versions.some(v => v?.state)) return lesson;
  const approved = lesson.versions.filter(v => v?.state === 'APPROVED');
  const version = approved.find(v => v.version_no === lesson.approved_version_no) || approved.sort((a, b) => b.version_no - a.version_no)[0];
  return { ...lesson, versions: version ? [version] : [], current_version_no: version?.version_no, approved_version_no: version?.version_no, sections: undefined, blocks: undefined, whiteboard: undefined };
}
