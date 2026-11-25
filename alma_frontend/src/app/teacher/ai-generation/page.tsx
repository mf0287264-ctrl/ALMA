"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  AlertCircle,
  ArrowRight,
  Check,
  ChevronRight,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import TeacherSidebar from "@/components/TeacherSidebar";
import MangoIcon from "@/components/MangoIcon";
import LessonBlocks from "@/components/lessons/LessonBlocks";
import LessonCheckpoint from "@/components/lessons/LessonCheckpoint";
import { WhiteboardPlayer } from "@/components/whiteboard";
import type { LessonDocument, PlayerLesson } from "@/types/Lesson.type";
import {
  hasWhiteboard,
  lessonPlayerHref,
  toPlayerLesson,
} from "@/utils/toPlayerLesson";
import api from "@/services/api";

type Job = {
  job_id: string;
  status: "pending" | "processing" | "completed" | "failed";
  current_step: string;
  progress_percent: number;
  step_message?: string;
  error?: string;
  lesson_id?: string;
  quality_report?: { checks?: string[] };
};
type Course = { _id: string; title: string };
type Module = { _id: string; title: string; course_id: string };
const inputClass =
  "w-full rounded-xl border border-[#e8eeea] bg-[#fafaf8] px-3.5 py-2.5 text-sm text-[#10292e] outline-none transition-colors focus:border-[#ffa11f] focus:bg-white";
const stages = [
  { id: "outline", label: "Lesson outline" },
  { id: "sections", label: "Worked sections" },
  { id: "segmenting", label: "Narration & timing" },
  { id: "validating", label: "Quality checks" },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-bold text-[#607274]">{label}</span>
      {children}
    </label>
  );
}

export default function AiLessonGenerationPage() {
  const { data: session } = useSession();
  const [topic, setTopic] = useState("For loops and iteration");
  const [language, setLanguage] = useState("Python");
  const [grade, setGrade] = useState("Grade 8");
  const [depth, setDepth] = useState("comprehensive");
  const [duration, setDuration] = useState(15);
  const [prerequisites, setPrerequisites] = useState(
    "Variables, print statements and basic arithmetic",
  );
  const [standard, setStandard] = useState(
    "CSTA 2-AP-12: Design programs that combine control structures.",
  );
  const [constraints, setConstraints] = useState(
    "Focus on single loops; explain off-by-one errors before introducing nested loops.",
  );
  const [instructions, setInstructions] = useState(
    "Use a game inventory example. Show each iteration, variable changes and output. Explain why each step happens, then test it with a different worked question.",
  );
  const [reference, setReference] = useState("");
  const [objectives, setObjectives] = useState([
    "Explain how a loop avoids repeated code",
    "Trace range(start, stop, step) and predict its values",
    "Follow a running total through every iteration",
  ]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [courseId, setCourseId] = useState("");
  const [moduleId, setModuleId] = useState("");
  const [job, setJob] = useState<Job | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [document, setDocument] = useState<LessonDocument | null>(null);
  const [draft, setDraft] = useState<PlayerLesson | null>(null);
  const [selectedSection, setSelectedSection] = useState(0);
  const [reviewing, setReviewing] = useState(false);
  const busy =
    submitting || job?.status === "pending" || job?.status === "processing";

  useEffect(() => {
    const controller = new AbortController();
    void Promise.allSettled([
      api.get("/courses", { signal: controller.signal }),
      api.get("/modules", { signal: controller.signal }),
    ]).then(([courseResult, moduleResult]) => {
      if (controller.signal.aborted) return;
      if (
        courseResult.status === "fulfilled" &&
        Array.isArray(courseResult.value.data?.data)
      )
        setCourses(courseResult.value.data.data);
      if (
        moduleResult.status === "fulfilled" &&
        Array.isArray(moduleResult.value.data?.data)
      )
        setModules(moduleResult.value.data.data);
    });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!job || !["pending", "processing"].includes(job.status)) return;
    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const response = await api.get(
          `/lesson-generations/job/${encodeURIComponent(job.job_id)}`,
          { signal: controller.signal },
        );
        if (!response.data?.data?.job_id)
          throw new Error("No job status returned");
        if (!controller.signal.aborted) setJob(response.data.data);
      } catch {
        if (!controller.signal.aborted)
          setError(
            "We lost the connection to this generation job. Refresh its status to continue tracking it.",
          );
      }
    }, 2000);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [job]);

  useEffect(() => {
    if (job?.status !== "completed" || !job.lesson_id) return;
    const controller = new AbortController();
    void api
      .get(`/lessons/${encodeURIComponent(job.lesson_id)}`, {
        signal: controller.signal,
      })
      .then((response) => {
        if (controller.signal.aborted || !response.data?.data) return;
        setDocument(response.data.data);
        setDraft(toPlayerLesson(response.data.data));
        setSelectedSection(0);
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setError(
            "The draft was saved, but we couldn’t load its preview. Refresh the status to try again.",
          );
      });
    return () => controller.abort();
  }, [job?.status, job?.lesson_id]);

  async function start(event: React.FormEvent) {
    event.preventDefault();
    if (busy) return;
    if (!topic.trim() || !objectives.some((value) => value.trim())) {
      toast.error("Add a topic and at least one learning objective.");
      return;
    }
    setSubmitting(true);
    setError("");
    setJob(null);
    setDraft(null);
    setDocument(null);
    try {
      const response = await api.post("/lesson-generations", {
        topic: topic.trim(),
        programming_language: language,
        grade_level: grade,
        desired_depth: depth,
        target_duration_minutes: duration,
        duration,
        objectives: objectives.map((value) => value.trim()).filter(Boolean),
        prerequisites,
        curriculum_standard: standard,
        scope_constraints: constraints,
        special_instructions: instructions,
        reference_notes: reference,
        course_id: courseId || null,
        module_id: moduleId || null,
        requested_by: session?.backendId || null,
        whiteboard_generation: {
          detail_level: "step_by_step",
          required_for_every_section: true,
          checkpoint_quality: "worked_reasoning",
          animation_mode: "explanatory",
        },
      });
      if (!response.data?.data?.job_id)
        throw new Error("No generation job was created.");
      setJob(response.data.data);
    } catch {
      setError(
        "We couldn’t start generation. Check the backend connection and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function refreshJob() {
    if (!job) return;
    try {
      const response = await api.get(
        `/lesson-generations/job/${encodeURIComponent(job.job_id)}`,
      );
      setError("");
      setJob(response.data.data);
      if (
        response.data?.data?.status === "completed" &&
        response.data.data.lesson_id
      ) {
        const lesson = await api.get(
          `/lessons/${encodeURIComponent(response.data.data.lesson_id)}`,
        );
        setDocument(lesson.data.data);
        setDraft(toPlayerLesson(lesson.data.data));
      }
    } catch {
      setError(
        "The generation service is still unavailable. Your job ID is kept here so you can retry.",
      );
    }
  }

  async function review(state: "APPROVED" | "REJECTED") {
    if (!document || !draft) return;
    setReviewing(true);
    try {
      const response = await api.put(
        `/lessons/${encodeURIComponent(document._id)}`,
        {
          versions: document.versions?.map((version) =>
            version.version_no === draft.version_no
              ? { ...version, state }
              : version,
          ),
          ...(state === "APPROVED"
            ? { approved_version_no: draft.version_no }
            : {}),
        },
      );
      setDocument(response.data.data);
      setDraft(toPlayerLesson(response.data.data));
      toast.success(
        state === "APPROVED"
          ? "Lesson published. Assign it to your class or make it available through its course."
          : "Draft marked for revision.",
      );
    } catch {
      toast.error("Your review could not be saved. Please try again.");
    } finally {
      setReviewing(false);
    }
  }

  const section = draft?.sections[selectedSection];
  const progress = Math.max(0, Math.min(1, job?.progress_percent || 0));
  const draftState = document?.versions?.find(
    (version) => version.version_no === draft?.version_no,
  )?.state;

  return (
    <div className="flex min-h-screen bg-[#fff8ec]">
      <TeacherSidebar />
      <main className="min-w-0 flex-1 px-4 pb-16 pt-20 sm:px-8 lg:pt-9">
        <div className="mx-auto max-w-[1320px]">
          <header className="mb-7">
            <span className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#fae2b8] bg-white px-3 py-1 text-[10px] font-extrabold text-[#a96310]">
              <Sparkles className="h-3 w-3" />
              ALMA lesson studio
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#10292e]">
              Teach an idea, step by step.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-[#607274]">
              Generate a complete lesson with worked whiteboards, clear
              narration and questions that test understanding. Preview every
              section before publishing.
            </p>
          </header>
          <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0 space-y-6">
              <form
                onSubmit={start}
                className="space-y-6 rounded-3xl border border-[#e8eeea] bg-white p-5 shadow-xs sm:p-7"
              >
                <div>
                  <h2 className="text-base font-extrabold text-[#10292e]">
                    Shape your lesson
                  </h2>
                  <p className="mt-1 text-xs leading-6 text-[#8a999b]">
                    Your objectives, prerequisites and scope guide both the
                    explanation and the questions.
                  </p>
                </div>
                <Field label="Lesson topic">
                  <input
                    required
                    value={topic}
                    onChange={(event) => setTopic(event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Language or subject">
                    <input
                      value={language}
                      onChange={(event) => setLanguage(event.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Grade level">
                    <select
                      value={grade}
                      onChange={(event) => setGrade(event.target.value)}
                      className={inputClass}
                    >
                      {[7, 8, 9, 10, 11, 12].map((value) => (
                        <option key={value}>Grade {value}</option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Lesson depth">
                    <select
                      value={depth}
                      onChange={(event) => setDepth(event.target.value)}
                      className={inputClass}
                    >
                      <option value="introductory">
                        Introductory — build intuition
                      </option>
                      <option value="standard">
                        Standard — explain and practise
                      </option>
                      <option value="comprehensive">
                        Comprehensive — trace, compare and explain
                      </option>
                      <option value="advanced">
                        Advanced — edge cases and trade-offs
                      </option>
                    </select>
                  </Field>
                  <Field label="Target duration (minutes)">
                    <input
                      type="number"
                      min={5}
                      max={45}
                      value={duration}
                      onChange={(event) =>
                        setDuration(Number(event.target.value))
                      }
                      className={inputClass}
                    />
                  </Field>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-[#607274]">
                      Learning objectives
                    </h3>
                    <button
                      type="button"
                      disabled={objectives.length >= 8}
                      onClick={() => setObjectives((values) => [...values, ""])}
                      className="inline-flex cursor-pointer items-center gap-1 text-xs font-bold text-[#118a80] disabled:opacity-40"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      Add objective
                    </button>
                  </div>
                  {objectives.map((objective, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#8a999b]">
                        {index + 1}.
                      </span>
                      <input
                        aria-label={`Learning objective ${index + 1}`}
                        value={objective}
                        onChange={(event) =>
                          setObjectives((values) =>
                            values.map((value, item) =>
                              item === index ? event.target.value : value,
                            ),
                          )
                        }
                        className={inputClass}
                      />
                      <button
                        type="button"
                        aria-label={`Remove objective ${index + 1}`}
                        disabled={objectives.length === 1}
                        onClick={() =>
                          setObjectives((values) =>
                            values.filter((_, item) => item !== index),
                          )
                        }
                        className="cursor-pointer p-2 text-[#8a999b] disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="What students already know">
                    <textarea
                      rows={3}
                      value={prerequisites}
                      onChange={(event) => setPrerequisites(event.target.value)}
                      className={inputClass}
                    />
                  </Field>
                  <Field label="Curriculum standard">
                    <textarea
                      rows={3}
                      value={standard}
                      onChange={(event) => setStandard(event.target.value)}
                      className={inputClass}
                    />
                  </Field>
                </div>
                <Field label="Scope and constraints">
                  <textarea
                    rows={2}
                    value={constraints}
                    onChange={(event) => setConstraints(event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="Examples and teaching instructions">
                  <textarea
                    rows={3}
                    value={instructions}
                    onChange={(event) => setInstructions(event.target.value)}
                    className={inputClass}
                  />
                </Field>
                <details className="rounded-2xl border border-[#e8eeea] p-4">
                  <summary className="cursor-pointer text-xs font-bold text-[#118a80]">
                    Reference notes and course placement
                  </summary>
                  <div className="mt-4 space-y-4">
                    <Field label="Curriculum or textbook notes">
                      <textarea
                        rows={4}
                        value={reference}
                        onChange={(event) => setReference(event.target.value)}
                        placeholder="Paste relevant source text or additional context."
                        className={inputClass}
                      />
                    </Field>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Course (optional)">
                        <select
                          value={courseId}
                          onChange={(event) => {
                            setCourseId(event.target.value);
                            setModuleId("");
                          }}
                          className={inputClass}
                        >
                          <option value="">Classroom lesson</option>
                          {courses.map((course) => (
                            <option key={course._id} value={course._id}>
                              {course.title}
                            </option>
                          ))}
                        </select>
                      </Field>
                      <Field label="Module (optional)">
                        <select
                          value={moduleId}
                          onChange={(event) => setModuleId(event.target.value)}
                          disabled={!courseId}
                          className={inputClass}
                        >
                          <option value="">Choose a module</option>
                          {modules
                            .filter((module) => module.course_id === courseId)
                            .map((module) => (
                              <option key={module._id} value={module._id}>
                                {module.title}
                              </option>
                            ))}
                        </select>
                      </Field>
                    </div>
                  </div>
                </details>
                <button
                  type="submit"
                  disabled={busy}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-[#ffa11f] px-5 py-3.5 text-sm font-extrabold text-[#10292e] transition-colors hover:bg-[#ff9400] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {busy ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  {busy
                    ? "Creating your lesson…"
                    : "Generate lesson & whiteboards"}
                </button>
              </form>

              {(error || job?.status === "failed") && (
                <div
                  role="alert"
                  className="rounded-2xl border border-[#fae2b8] bg-white p-5"
                >
                  <p className="flex items-center gap-2 text-sm font-bold text-[#10292e]">
                    <AlertCircle className="h-4 w-4 text-[#c38525]" />
                    Generation needs attention
                  </p>
                  <p className="mt-2 text-sm leading-7 text-[#607274]">
                    {error || job?.error || job?.step_message}
                  </p>
                  {job && (
                    <button
                      type="button"
                      onClick={refreshJob}
                      className="mt-3 inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-[#118a80]"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Refresh job status
                    </button>
                  )}
                </div>
              )}
              {job && job.status !== "failed" && (
                <section
                  aria-label="Generation progress"
                  className="rounded-3xl border border-[#e8eeea] bg-white p-5 sm:p-6"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h2 className="text-sm font-extrabold text-[#10292e]">
                      {job.status === "completed"
                        ? "Your draft is ready"
                        : "Creating your lesson"}
                    </h2>
                    <span className="text-xs font-bold text-[#118a80]">
                      {Math.round(progress * 100)}%
                    </span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label="Generation completion"
                    aria-valuenow={Math.round(progress * 100)}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    className="h-2 overflow-hidden rounded-full bg-[#edf1ec]"
                  >
                    <div
                      style={{ width: `${progress * 100}%` }}
                      className="h-full rounded-full bg-[#118a80] transition-[width]"
                    />
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[#607274]">
                    {job.step_message}
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {stages.map((stage, index) => (
                      <span
                        key={stage.id}
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold ${job.status === "completed" || index <= stages.findIndex((item) => item.id === job.current_step) ? "bg-[#e6f5f2] text-[#118a80]" : "bg-[#fafaf8] text-[#8a999b]"}`}
                      >
                        <Check className="h-3 w-3" />
                        {stage.label}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-[10px] text-[#8a999b]">
                    Job reference: {job.job_id}
                  </p>
                </section>
              )}

              {draft && section && (
                <section className="space-y-5 rounded-3xl border border-[#e8eeea] bg-white p-4 sm:p-6">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-lg font-extrabold text-[#10292e]">
                        Preview the actual lesson
                      </h2>
                      <p className="mt-1 text-xs text-[#607274]">
                        {draft.topic} · {draft.programming_language} ·{" "}
                        {draft.grade_level}
                      </p>
                    </div>
                    <span className="rounded-full bg-[#e6f5f2] px-3 py-1 text-[10px] font-bold text-[#118a80]">
                      {draftState === "APPROVED"
                        ? "Published"
                        : draftState === "REJECTED"
                          ? "Needs revision"
                          : "Awaiting your review"}
                    </span>
                  </div>
                  <nav
                    aria-label="Draft sections"
                    className="flex flex-wrap gap-2"
                  >
                    {draft.sections.map((item, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setSelectedSection(index)}
                        aria-current={
                          selectedSection === index ? "step" : undefined
                        }
                        className={`cursor-pointer rounded-full border px-3 py-2 text-xs font-bold ${selectedSection === index ? "border-[#ffa11f] bg-[#fff8ec] text-[#10292e]" : "border-[#e8eeea] text-[#607274]"}`}
                      >
                        {index + 1}. {item.title}
                      </button>
                    ))}
                  </nav>
                  {hasWhiteboard(section.whiteboard) && (
                    <WhiteboardPlayer
                      lesson={section.whiteboard}
                      endTitle="Whiteboard preview complete"
                      endDescription="Review the reading notes and checkpoint before publishing this lesson."
                    />
                  )}
                  <details className="rounded-2xl border border-[#e8eeea] p-4">
                    <summary className="cursor-pointer text-xs font-bold text-[#118a80]">
                      Reading notes and worked explanations
                    </summary>
                    <div className="pt-4">
                      <LessonBlocks blocks={section.blocks || []} />
                    </div>
                  </details>
                  {section.diagnostic_check && (
                    <LessonCheckpoint
                      key={selectedSection}
                      section={section}
                      onPass={() =>
                        toast.success(
                          "Checkpoint answer verified in this preview.",
                        )
                      }
                    />
                  )}
                  {job?.quality_report?.checks && (
                    <div className="flex flex-wrap gap-2">
                      {job.quality_report.checks.map((check) => (
                        <span
                          key={check}
                          className="inline-flex items-center gap-1 rounded-full bg-[#e6f5f2] px-2.5 py-1 text-[10px] font-bold text-[#118a80]"
                        >
                          <Check className="h-3 w-3" />
                          {check}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap gap-3 border-t border-[#e8eeea] pt-4">
                    <button
                      type="button"
                      onClick={() => review("APPROVED")}
                      disabled={reviewing || draftState === "APPROVED"}
                      className="cursor-pointer rounded-full bg-[#118a80] px-4 py-2.5 text-xs font-bold text-white disabled:opacity-40"
                    >
                      {reviewing ? "Saving review…" : "Approve & publish"}
                    </button>
                    <Link
                      href={lessonPlayerHref(draft)}
                      className="inline-flex items-center gap-1.5 rounded-full border border-[#e8eeea] px-4 py-2.5 text-xs font-bold text-[#10292e]"
                    >
                      Open student player
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <Link
                      href="/teacher/groups"
                      className="rounded-full bg-[#fff8ec] px-4 py-2.5 text-xs font-bold text-[#a96310]"
                    >
                      Assign to a class
                    </Link>
                    <button
                      type="button"
                      onClick={() => review("REJECTED")}
                      disabled={reviewing}
                      className="cursor-pointer px-3 text-xs font-bold text-[#8a999b]"
                    >
                      Mark for revision
                    </button>
                  </div>
                </section>
              )}
            </div>
            <aside className="space-y-4 xl:sticky xl:top-6">
              <section className="rounded-3xl border border-[#d2ede7] bg-[#e6f5f2] p-5">
                <div className="mb-3 flex items-center gap-2">
                  <MangoIcon size={34} />
                  <h2 className="text-sm font-extrabold text-[#10292e]">
                    Built for understanding
                  </h2>
                </div>
                <ul className="space-y-3">
                  {[
                    "Start with intuition and explicit inputs",
                    "Show the intermediate states, not just the answer",
                    "Keep narration in step with each change",
                    "Predict before revealing the result",
                    "Explain every wrong option and reteach the misconception",
                    "Save a whiteboard and checkpoint for every section",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs leading-6 text-[#607274]"
                    >
                      <Check className="mt-1.5 h-3.5 w-3.5 shrink-0 text-[#118a80]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
              <section className="rounded-3xl border border-[#fae2b8] bg-white p-5">
                <h2 className="text-sm font-extrabold text-[#10292e]">
                  One connected lesson flow
                </h2>
                <p className="mt-2 text-xs leading-6 text-[#607274]">
                  Preview here, publish after review, then assign the lesson.
                  Students find its sections, whiteboards and checks in My
                  Lessons.
                </p>
                <Link
                  href="/my-lessons"
                  className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-[#118a80]"
                >
                  Explore My Lessons
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}
