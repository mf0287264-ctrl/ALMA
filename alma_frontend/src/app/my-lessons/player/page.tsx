"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  MonitorPlay,
  Save,
  Sparkles,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";
import MangoIcon from "@/components/MangoIcon";
import LessonBlocks from "@/components/lessons/LessonBlocks";
import LessonCheckpoint from "@/components/lessons/LessonCheckpoint";
import { WhiteboardPlayer } from "@/components/whiteboard";
import { PRACTICE_LESSONS } from "@/components/whiteboard/practiceLessons";
import type { LessonDocument, PlayerLesson } from "@/types/Lesson.type";
import { hasWhiteboard, toPlayerLesson } from "@/utils/toPlayerLesson";
import {
  checkpointPassed,
  emptyLessonProgress,
  progressStorageKey,
  restoreLessonProgress,
  type LessonProgress,
} from "@/utils/lessonProgress";
import api from "@/services/api";

function LessonShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen w-full bg-[#fff8ec]">
      <Sidebar />
      <main className="min-w-0 flex-1 px-4 pb-24 pt-20 sm:px-7 lg:pt-8 xl:px-9">
        <div className="mx-auto max-w-[1400px]">{children}</div>
      </main>
    </div>
  );
}

function LoadingLesson() {
  return (
    <LessonShell>
      <div
        role="status"
        className="flex min-h-[60vh] flex-col items-center justify-center gap-3"
      >
        <MangoIcon size={64} animated />
        <p className="text-sm font-bold text-[#607274]">Opening your lesson…</p>
      </div>
    </LessonShell>
  );
}

interface OpenLesson {
  lesson: PlayerLesson;
  progress: LessonProgress;
  storageKey: string;
}

function LessonPlayerContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { data: session, status } = useSession();
  const lessonId = params.get("lessonId");
  const sampleId = params.get("sample");
  const requestedSection = params.get("section");
  const [opened, setOpened] = useState<OpenLesson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [view, setView] = useState<"watch" | "read">("watch");
  const checkpointRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === "loading") return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError(null);
      setOpened(null);
      setView("watch");
      try {
        let document: LessonDocument | undefined;
        if (sampleId) {
          document = PRACTICE_LESSONS.find((lesson) => lesson._id === sampleId);
          if (!document)
            throw new Error(
              "This practice lesson could not be found. Choose another lesson from My Lessons.",
            );
        } else {
          let targetId = lessonId;
          if (!targetId) {
            const response = await api.get("/lessons/my-lessons", {
              signal: controller.signal,
            });
            targetId =
              response.data?.data?.available_lessons?.[0]?._id ??
              response.data?.data?.teacher_lessons?.[0]?._id;
          }
          if (!targetId)
            throw new Error(
              "Choose a course or a whiteboard practice lesson from My Lessons to get started.",
            );
          const response = await api.get(
            `/lessons/${encodeURIComponent(targetId)}`,
            { signal: controller.signal },
          );
          document = response.data?.data;
        }
        if (!document?._id)
          throw new Error(
            "This lesson is unavailable. Please return to My Lessons and try again.",
          );
        const lesson = toPlayerLesson(document);
        if (!lesson.sections.length)
          throw new Error(
            "This lesson has no published content yet. Please choose another lesson.",
          );
        const storageKey = progressStorageKey(
          lesson._id,
          lesson.version_no,
          session?.backendId,
        );
        let progress = emptyLessonProgress();
        try {
          progress = restoreLessonProgress(
            JSON.parse(localStorage.getItem(storageKey) || "null"),
            lesson,
          );
        } catch {}
        const sectionIndex = Number(requestedSection);
        if (
          requestedSection !== null &&
          Number.isInteger(sectionIndex) &&
          sectionIndex >= 0 &&
          sectionIndex < lesson.sections.length
        )
          progress.sectionIndex = sectionIndex;
        if (!controller.signal.aborted)
          setOpened({ lesson, progress, storageKey });
      } catch (cause) {
        if (!controller.signal.aborted)
          setError(
            cause instanceof Error &&
              !(cause as { isAxiosError?: boolean }).isAxiosError
              ? cause.message
              : "We couldn’t load this lesson. Check your connection and try again.",
          );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [lessonId, sampleId, requestedSection, session?.backendId, status]);

  useEffect(() => {
    if (!opened) return;
    try {
      localStorage.setItem(opened.storageKey, JSON.stringify(opened.progress));
    } catch {}
  }, [opened]);

  function updateProgress(
    update: (progress: LessonProgress) => LessonProgress,
  ) {
    setOpened((current) =>
      current ? { ...current, progress: update(current.progress) } : current,
    );
  }

  function selectSection(index: number) {
    setView("watch");
    updateProgress((progress) => ({ ...progress, sectionIndex: index }));
  }

  function saveAndExit() {
    if (opened) {
      try {
        localStorage.setItem(
          opened.storageKey,
          JSON.stringify(opened.progress),
        );
      } catch {
        toast.error("Your browser couldn’t save your place on this device.");
      }
    }
    router.push("/my-lessons");
  }

  if (loading) return <LoadingLesson />;
  if (error || !opened)
    return (
      <LessonShell>
        <div className="mx-auto mt-16 max-w-md rounded-3xl border border-[#fae2b8] bg-white p-8 text-center">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-[#d98c20]" />
          <h1 className="text-xl font-extrabold text-[#10292e]">
            Let’s find your lesson
          </h1>
          <p
            role="status"
            className="mb-6 mt-3 text-sm leading-7 text-[#607274]"
          >
            {error || "This lesson is unavailable."}
          </p>
          <Link
            href="/my-lessons"
            className="inline-flex items-center gap-2 rounded-full bg-[#ffa11f] px-5 py-2.5 text-xs font-bold text-[#10292e]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to My Lessons
          </Link>
        </div>
      </LessonShell>
    );

  const { lesson, progress } = opened;
  const index = progress.sectionIndex;
  const section = lesson.sections[index];
  const boardAvailable = hasWhiteboard(section.whiteboard);
  const showBoard = boardAvailable && view === "watch";
  const passed = checkpointPassed(section, progress.answers[index]);
  const lastSection = index === lesson.sections.length - 1;
  const remaining = lesson.sections.findIndex(
    (_, itemIndex) =>
      itemIndex !== index && !progress.completedSections.includes(itemIndex),
  );
  const canFinish = passed && remaining === -1;
  const percent = Math.round(
    (progress.completedSections.length / lesson.sections.length) * 100,
  );
  const board =
    section.whiteboard &&
    typeof section.whiteboard === "object" &&
    !Array.isArray(section.whiteboard)
      ? {
          ...section.whiteboard,
          id: `${lesson._id}-v${lesson.version_no}-${index}`,
          title: section.title,
        }
      : section.whiteboard;

  function markWatched() {
    updateProgress((current) => ({
      ...current,
      watchedSections: [...new Set([...current.watchedSections, index])],
      completedSections: !section.diagnostic_check
        ? [...new Set([...current.completedSections, index])]
        : current.completedSections,
    }));
  }

  function nextSection() {
    if (!passed) return;
    setView("watch");
    updateProgress((current) => ({
      ...current,
      completedSections: [...new Set([...current.completedSections, index])],
      sectionIndex: index + 1,
    }));
  }

  async function finishLesson() {
    if (!canFinish || completing) return;
    setCompleting(true);
    try {
      if (!lesson.is_practice) {
        const response = await api.post(
          `/lessons/${encodeURIComponent(lesson._id)}/complete`,
          { version_no: lesson.version_no, answers: progress.answers },
        );
        if (!response.data?.success)
          throw new Error("Completion was not recorded.");
        if (response.data?.data?.course_awarded)
          toast.success(
            response.data.data.message ||
              "Course complete! You earned a new achievement.",
            { duration: 6000 },
          );
      }
      updateProgress((current) => ({
        ...current,
        completedSections: [...new Set([...current.completedSections, index])],
        finished: true,
      }));
      toast.success(
        lesson.is_practice
          ? "Practice complete. A little practice, a big step."
          : "Lesson complete. Keep up the momentum!",
      );
    } catch {
      toast.error(
        "We couldn’t record your completion. Your place is saved; please try again.",
      );
    } finally {
      setCompleting(false);
    }
  }

  return (
    <LessonShell>
      <nav
        aria-label="Breadcrumb"
        className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-[#8a999b]"
      >
        <Link
          href="/my-lessons"
          className="inline-flex items-center gap-1.5 font-bold text-[#118a80] hover:underline"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          My lessons
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span>{lesson.course_title || "Your course"}</span>
        {lesson.module_title && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span>{lesson.module_title}</span>
          </>
        )}
      </nav>
      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#fae2b8] bg-white px-2.5 py-1 text-[10px] font-bold text-[#a96310]">
              <Sparkles className="h-3 w-3" />
              {lesson.is_practice
                ? "Whiteboard practice"
                : lesson.has_whiteboard
                  ? "Whiteboard lesson"
                  : "Course lesson"}
            </span>
            {lesson.programming_language && (
              <span className="text-xs font-medium text-[#607274]">
                {lesson.programming_language}
                {lesson.grade_level ? ` · ${lesson.grade_level}` : ""}
              </span>
            )}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-[#10292e] sm:text-3xl">
            {lesson.topic}
          </h1>
          <p className="mt-2 text-sm text-[#607274]">
            Watch the idea unfold, read at your own pace, then put it into
            practice.
          </p>
        </div>
        <button
          type="button"
          onClick={saveAndExit}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#e8eeea] bg-white px-4 py-2.5 text-xs font-bold text-[#10292e] transition-colors hover:border-[#ffa11f]"
        >
          <Save className="h-3.5 w-3.5" />
          Save &amp; exit
        </button>
      </header>

      {progress.finished && (
        <div
          role="status"
          className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#d2ede7] bg-[#e6f5f2] p-5"
        >
          <div className="flex items-center gap-3">
            <Trophy className="h-8 w-8 shrink-0 text-[#118a80]" />
            <div>
              <p className="font-extrabold text-[#10292e]">
                {lesson.is_practice
                  ? "Practice complete. Nicely done."
                  : "Lesson complete. Nicely done."}
              </p>
              <p className="mt-1 text-xs text-[#607274]">
                Your completed checks are saved. Revisit any section whenever
                you like.
              </p>
            </div>
          </div>
          <Link
            href="/my-lessons"
            className="inline-flex items-center gap-2 rounded-full bg-[#118a80] px-4 py-2.5 text-xs font-bold text-white"
          >
            Choose another lesson
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      <div className="mb-5 flex items-center gap-3 xl:hidden">
        <label
          htmlFor="lesson-section"
          className="shrink-0 text-xs font-bold text-[#607274]"
        >
          Section
        </label>
        <select
          id="lesson-section"
          value={index}
          onChange={(event) => selectSection(Number(event.target.value))}
          className="min-w-0 flex-1 rounded-xl border border-[#e8eeea] bg-white px-3 py-2.5 text-sm text-[#10292e]"
        >
          {lesson.sections.map((item, itemIndex) => (
            <option key={itemIndex} value={itemIndex}>
              {itemIndex + 1}. {item.title}
              {progress.completedSections.includes(itemIndex) ? " ✓" : ""}
            </option>
          ))}
        </select>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0 space-y-5">
          <section
            aria-labelledby="section-heading"
            className="overflow-hidden rounded-3xl border border-[#e8eeea] bg-white shadow-xs"
          >
            <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#f0f0eb] px-5 py-4 sm:px-6">
              <div>
                <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-[#118a80]">
                  Section {index + 1} of {lesson.sections.length}
                </p>
                <h2
                  id="section-heading"
                  className="text-lg font-extrabold text-[#10292e]"
                >
                  {section.title}
                </h2>
              </div>
              {boardAvailable && (
                <div
                  className="flex rounded-full bg-[#f3f5f2] p-1"
                  role="group"
                  aria-label="Lesson format"
                >
                  {(
                    [
                      { value: "watch", label: "Watch", icon: MonitorPlay },
                      { value: "read", label: "Read", icon: BookOpen },
                    ] as const
                  ).map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={view === value}
                      onClick={() => setView(value)}
                      className={`inline-flex cursor-pointer items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-colors ${view === value ? "bg-white text-[#10292e] shadow-xs" : "text-[#8a999b] hover:text-[#10292e]"}`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="p-3 sm:p-5">
              {showBoard ? (
                <WhiteboardPlayer
                  lesson={board}
                  autoplay={params.get("autoplay") === "1"}
                  onEnd={markWatched}
                  endTitle="Whiteboard complete"
                  endDescription={
                    section.diagnostic_check
                      ? "Now use the worked example to answer the checkpoint below."
                      : "Revisit a chapter or continue when you’re ready."
                  }
                  onContinue={
                    section.diagnostic_check
                      ? () =>
                          checkpointRef.current?.scrollIntoView({
                            behavior: "smooth",
                            block: "start",
                          })
                      : !lastSection
                        ? nextSection
                        : undefined
                  }
                  continueLabel={
                    section.diagnostic_check
                      ? "Try the checkpoint"
                      : "Next section"
                  }
                />
              ) : (
                <div className="space-y-6 p-2 sm:p-1">
                  {index === 0 && lesson.introduction.length > 0 && (
                    <LessonBlocks blocks={lesson.introduction} />
                  )}
                  <LessonBlocks blocks={section.blocks ?? []} />
                  {!section.blocks?.length && (
                    <p className="text-sm leading-7 text-[#607274]">
                      {section.purpose ||
                        "Use the checkpoint below to practise this section."}
                    </p>
                  )}
                  {lastSection && lesson.conclusion.length > 0 && (
                    <LessonBlocks blocks={lesson.conclusion} />
                  )}
                </div>
              )}
            </div>
            {showBoard &&
            (section.blocks?.length ||
              (index === 0 && lesson.introduction.length) ||
              (lastSection && lesson.conclusion.length)) ? (
              <details className="border-t border-[#f0f0eb] px-5 py-4 sm:px-6">
                <summary className="cursor-pointer text-xs font-bold text-[#118a80]">
                  Read the lesson notes
                </summary>
                <div className="space-y-5 pt-4">
                  {index === 0 && <LessonBlocks blocks={lesson.introduction} />}
                  <LessonBlocks blocks={section.blocks ?? []} />
                  {lastSection && <LessonBlocks blocks={lesson.conclusion} />}
                </div>
              </details>
            ) : null}
          </section>

          {section.diagnostic_check && (
            <div ref={checkpointRef} className="scroll-mt-20">
              <LessonCheckpoint
                key={`${lesson._id}-${lesson.version_no}-${index}`}
                section={section}
                passedAnswer={progress.answers[index]}
                onPass={(answer) =>
                  updateProgress((current) => ({
                    ...current,
                    answers: { ...current.answers, [index]: answer },
                    completedSections: [
                      ...new Set([...current.completedSections, index]),
                    ],
                  }))
                }
              />
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e8eeea] bg-white p-4">
            <button
              type="button"
              onClick={() => selectSection(index - 1)}
              disabled={index === 0}
              className="inline-flex cursor-pointer items-center gap-1.5 px-1 py-2 text-xs font-bold text-[#607274] disabled:cursor-default disabled:opacity-35"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Previous section
            </button>
            <div className="flex flex-col items-end gap-2">
              {!passed && (
                <p className="text-xs text-[#607274]">
                  Complete the checkpoint to continue.
                </p>
              )}
              {lastSection && passed && remaining !== -1 && (
                <button
                  type="button"
                  onClick={() => selectSection(remaining)}
                  className="cursor-pointer text-xs font-bold text-[#118a80]"
                >
                  Complete section {remaining + 1} before finishing
                </button>
              )}
              {lastSection ? (
                <button
                  type="button"
                  onClick={finishLesson}
                  disabled={!canFinish || completing || progress.finished}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#ffa11f] px-5 py-2.5 text-xs font-extrabold text-[#10292e] transition-colors hover:bg-[#ff9400] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {completing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : progress.finished ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <Trophy className="h-4 w-4" />
                  )}
                  {progress.finished
                    ? "Completed"
                    : completing
                      ? "Saving…"
                      : "Finish lesson"}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={nextSection}
                  disabled={!passed}
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#10292e] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#1b3438] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next section
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        <aside
          className="space-y-4 xl:sticky xl:top-5"
          aria-label="Lesson guide"
        >
          <section className="rounded-3xl border border-[#e8eeea] bg-white p-5 shadow-xs">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-extrabold text-[#10292e]">
                Your progress
              </h2>
              <span className="text-xs font-extrabold text-[#118a80]">
                {percent}%
              </span>
            </div>
            <div
              role="progressbar"
              aria-label="Lesson completion"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={percent}
              className="h-1.5 overflow-hidden rounded-full bg-[#edf1ec]"
            >
              <div
                style={{ width: `${percent}%` }}
                className="h-full rounded-full bg-[#118a80] transition-[width]"
              />
            </div>
            <p className="mb-4 mt-2 text-[11px] text-[#8a999b]">
              {progress.completedSections.length} of {lesson.sections.length}{" "}
              sections complete
            </p>
            <nav aria-label="Lesson sections" className="space-y-2">
              {lesson.sections.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  type="button"
                  aria-current={index === itemIndex ? "step" : undefined}
                  onClick={() => selectSection(itemIndex)}
                  className={`flex w-full cursor-pointer items-start gap-2.5 rounded-2xl border p-3 text-left transition-colors ${index === itemIndex ? "border-[#ffa11f] bg-[#fff8ec]" : "border-transparent hover:bg-[#fafaf8]"}`}
                >
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-extrabold ${progress.completedSections.includes(itemIndex) ? "bg-[#118a80] text-white" : index === itemIndex ? "bg-[#ffa11f] text-[#10292e]" : "bg-[#edf1ec] text-[#8a999b]"}`}
                  >
                    {progress.completedSections.includes(itemIndex) ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      itemIndex + 1
                    )}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-bold leading-5 text-[#10292e]">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[10px] text-[#8a999b]">
                      {hasWhiteboard(item.whiteboard)
                        ? "Whiteboard"
                        : "Reading"}
                      {item.diagnostic_check ? " · Checkpoint" : ""}
                    </span>
                  </span>
                </button>
              ))}
            </nav>
          </section>
          <section className="rounded-3xl border border-[#d2ede7] bg-[#e6f5f2] p-5">
            <div className="mb-3 flex items-center gap-2">
              <MangoIcon size={30} />
              <h2 className="text-sm font-extrabold text-[#10292e]">
                What you’ll learn
              </h2>
            </div>
            <p className="text-xs leading-6 text-[#607274]">
              {section.purpose ||
                "Connect the worked example to your own understanding, one step at a time."}
            </p>
            {section.covers_objectives?.length ? (
              <ul className="mt-3 space-y-2">
                {section.covers_objectives.map((objective, objectiveIndex) => (
                  <li
                    key={objectiveIndex}
                    className="flex items-start gap-1.5 text-xs leading-5 text-[#607274]"
                  >
                    <Check className="mt-1 h-3 w-3 shrink-0 text-[#118a80]" />
                    {objective}
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-4 border-t border-[#d2ede7] pt-3">
              <p className="flex items-center gap-1.5 text-[11px] font-bold text-[#118a80]">
                <Clock className="h-3.5 w-3.5" />
                Learn at your own pace
              </p>
              <p className="mt-1 text-[11px] leading-5 text-[#607274]">
                Pause, replay, or read the notes. Your section and completed
                checks are saved on this device.
              </p>
            </div>
          </section>
        </aside>
      </div>
    </LessonShell>
  );
}

export default function LessonPlayerPage() {
  return (
    <Suspense fallback={<LoadingLesson />}>
      <LessonPlayerContent />
    </Suspense>
  );
}
