"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import TeacherSidebar from "@/components/TeacherSidebar";
import MangoIcon from "@/components/MangoIcon";

interface LessonVersionItem {
  id: string;
  topic: string;
  course: string;
  programming_language: string;
  grade_level: string;
  target_duration_minutes: number;
  current_version_no: number;
  approved_version_no: number | null;
  state: "AWAITING_REVIEW" | "APPROVED" | "REJECTED";
}

const LESSONS_DATABASE: LessonVersionItem[] = [
  {
    id: "l-1",
    topic: "Python for loops",
    course: "Intro to Python · Loops",
    programming_language: "Python",
    grade_level: "Grade 8",
    target_duration_minutes: 15,
    current_version_no: 2,
    approved_version_no: null,
    state: "AWAITING_REVIEW",
  },
  {
    id: "l-2",
    topic: "Variables and types",
    course: "Intro to Python",
    programming_language: "Python",
    grade_level: "Grade 8",
    target_duration_minutes: 12,
    current_version_no: 1,
    approved_version_no: null,
    state: "AWAITING_REVIEW",
  },
  {
    id: "l-3",
    topic: "Lists and indexing",
    course: "Data Basics",
    programming_language: "Python",
    grade_level: "Grade 9",
    target_duration_minutes: 20,
    current_version_no: 3,
    approved_version_no: 3,
    state: "APPROVED",
  },
  {
    id: "l-4",
    topic: "If statements",
    course: "Intro to Python",
    programming_language: "Python",
    grade_level: "Grade 8",
    target_duration_minutes: 15,
    current_version_no: 1,
    approved_version_no: 1,
    state: "APPROVED",
  },
  {
    id: "l-5",
    topic: "Functions",
    course: "Data Basics",
    programming_language: "Python",
    grade_level: "Grade 9",
    target_duration_minutes: 25,
    current_version_no: 2,
    approved_version_no: null,
    state: "REJECTED",
  },
];

interface NarrationSegment {
  num: number;
  title: string;
  quote: string;
  est_seconds: number;
  attached_code?: string | null;
}

const NARRATION_SEGMENTS: NarrationSegment[] = [
  {
    num: 1,
    title: "Hook: repeat 5 times",
    quote: "Imagine writing print five times..",
    est_seconds: 45,
    attached_code: null,
  },
  {
    num: 2,
    title: "Writing your first for loop",
    quote: "Now we use for to repeat..",
    est_seconds: 90,
    attached_code: "for i in range(5):",
  },
  {
    num: 3,
    title: "Tracing range(3)",
    quote: "Let us follow each step..",
    est_seconds: 75,
    attached_code: "range(3)",
  },
  {
    num: 4,
    title: "Common mistake: off by one",
    quote: "Remember the stop value..",
    est_seconds: 60,
    attached_code: null,
  },
  {
    num: 5,
    title: "Practice: count to ten",
    quote: "Try it yourself..",
    est_seconds: 50,
    attached_code: "range(1, 11)",
  },
  {
    num: 6,
    title: "Wrap-up",
    quote: "To recap, a loop repeats..",
    est_seconds: 45,
    attached_code: null,
  },
];

function LessonsContent() {
  const searchParams = useSearchParams();
  const initialTopic = searchParams.get("topic") || "Python for loops";

  const [lessons, setLessons] = useState<LessonVersionItem[]>(LESSONS_DATABASE);
  const [selectedLessonId, setSelectedLessonId] = useState<string>(() => {
    const found = LESSONS_DATABASE.find(
      (l) => l.topic.toLowerCase() === initialTopic.toLowerCase()
    );
    return found ? found.id : LESSONS_DATABASE[0].id;
  });

  const selectedLesson =
    lessons.find((l) => l.id === selectedLessonId) || lessons[0];

  const [activeTab, setActiveTab] = useState<
    "Overview" | "Content" | "Narration" | "Version history"
  >("Content");

  const [activeSection, setActiveSection] = useState(2);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterState, setFilterState] = useState<"All" | "Awaiting" | "Approved">("All");

  // Feedback & Decisions
  const [feedbackInput, setFeedbackInput] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [modalFeedback, setModalFeedback] = useState("");
  const [modalError, setModalError] = useState(false);

  // Filter lessons
  const filteredLessons = lessons.filter((l) => {
    const matchSearch =
      l.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchState =
      filterState === "All"
        ? true
        : filterState === "Awaiting"
        ? l.state === "AWAITING_REVIEW"
        : l.state === "APPROVED";
    return matchSearch && matchState;
  });

  // Approve action
  const handleApproveCurrent = () => {
    setLessons((prev) =>
      prev.map((l) =>
        l.id === selectedLesson.id
          ? {
              ...l,
              state: "APPROVED",
              approved_version_no: l.current_version_no,
            }
          : l
      )
    );
    toast.success(
      `Version ${selectedLesson.current_version_no} approved · students can now open it!`
    );
  };

  // Reject action with modal
  const handleOpenRejectModal = () => {
    setModalFeedback(feedbackInput);
    setModalError(false);
    setShowRejectModal(true);
  };

  const handleConfirmReject = () => {
    if (!modalFeedback.trim()) {
      setModalError(true);
      return;
    }

    setLessons((prev) =>
      prev.map((l) =>
        l.id === selectedLesson.id
          ? {
              ...l,
              state: "REJECTED",
              approved_version_no: null,
            }
          : l
      )
    );

    setShowRejectModal(false);
    setFeedbackInput("");
    setModalFeedback("");
    toast.warning(`Version rejected with feedback: "${modalFeedback.trim()}"`);
  };

  // Regenerate action
  const handleRegenerate = () => {
    toast.info("Regenerating new version from AI engine...");
    setTimeout(() => {
      setLessons((prev) =>
        prev.map((l) =>
          l.id === selectedLesson.id
            ? {
                ...l,
                current_version_no: l.current_version_no + 1,
                state: "AWAITING_REVIEW",
                approved_version_no: null,
              }
            : l
        )
      );
      toast.success(
        `Generated Version ${selectedLesson.current_version_no + 1} for review!`
      );
    }, 1200);
  };

  const isApproved = selectedLesson.state === "APPROVED";

  return (
    <div className="w-full min-h-screen bg-[#fff8ec] flex">
      {/* Fixed Sidebar */}
      <TeacherSidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-6 sm:p-10 lg:p-12 pt-20 lg:pt-10 overflow-y-auto">
        {/* Top Header Row */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl sm:text-3xl font-black text-[#10292e] tracking-tight">
                Lessons & version review
              </h1>
              <div className="flex items-center gap-2">
                <span className="bg-[#e6f7ec] text-[#1e7e34] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Existing
                </span>
                <span className="border border-dashed border-[#f25c78] text-[#f25c78] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                  Proposed
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#5a6e70] font-medium">
              {activeTab === "Overview" &&
                "Empty, generating, failed and not-yet-approved states"}
              {activeTab === "Content" &&
                "Review AI-generated versions, then approve or reject · Lesson.versions[].state · sample data"}
              {activeTab === "Narration" &&
                `${selectedLesson.topic} · v${selectedLesson.current_version_no} · ${selectedLesson.state}`}
              {activeTab === "Version history" &&
                `${selectedLesson.topic} · compare versions from Lesson.versions[]`}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/teacher/dashboard"
              className="bg-white hover:bg-[#fafaf8] border-2 border-[#10292e] text-[#10292e] font-bold text-xs px-5 py-2.5 rounded-full transition-all"
            >
              Back to lessons
            </Link>
            <Link
              href="/teacher/ai-generation"
              className="bg-[#ffa11f] hover:brightness-95 active:scale-95 text-[#10292e] font-extrabold text-xs px-5 py-2.5 rounded-full transition-all shadow-xs"
            >
              Generate lesson
            </Link>
          </div>
        </div>

        {/* Green Top Alert Banner when Approved (Image 2) */}
        {isApproved && (
          <div className="w-full bg-[#dcfce7] border border-[#86efac] rounded-2xl px-5 py-3 mb-5 flex items-center justify-between text-xs sm:text-sm font-black text-[#15803d] animate-fadeIn shadow-xs">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#16a34a] text-white flex items-center justify-center text-xs">
                ✓
              </span>
              <span>
                Version {selectedLesson.current_version_no} approved · students can open it
              </span>
            </div>
            <span className="text-[11px] font-mono font-bold text-[#166534]">
              approved_version_no: {selectedLesson.approved_version_no}
            </span>
          </div>
        )}

        {/* View Tabs Header */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#e8eeea] pb-2">
          {(["Overview", "Content", "Narration", "Version history"] as const).map(
            (tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  activeTab === tab
                    ? "bg-[#10292e] text-white shadow-xs"
                    : "bg-white text-[#5a6e70] hover:text-[#10292e] border border-[#e8eeea]"
                }`}
              >
                {tab}
              </button>
            )
          )}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: OVERVIEW (4 States: Empty, Generating, Failed, Not approved - Image 1) */}
        {/* ========================================================================= */}
        {activeTab === "Overview" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
            {/* Card 1: Empty */}
            <div className="bg-white rounded-3xl p-7 border border-[#e8eeea] shadow-xs flex flex-col items-center justify-center text-center min-h-[260px]">
              <span className="text-xs font-black text-[#10292e] self-start mb-6 uppercase tracking-wider">
                Empty
              </span>

              <div className="w-14 h-16 bg-[#ffa11f] rounded-t-full flex items-center justify-center mb-4 shadow-xs">
                <div className="flex gap-1.5 mb-2">
                  <span className="w-1.5 h-1.5 bg-[#10292e] rounded-full" />
                  <span className="w-1.5 h-1.5 bg-[#10292e] rounded-full" />
                </div>
              </div>

              <h3 className="text-lg font-black text-[#10292e]">
                No lessons yet
              </h3>
              <p className="text-xs text-[#5a6e70] mt-1 mb-5 max-w-xs font-medium">
                Generate your first lesson from a course module.
              </p>

              <Link
                href="/teacher/ai-generation"
                className="bg-[#ffa11f] hover:brightness-95 active:scale-95 text-[#10292e] font-extrabold text-xs px-6 py-2.5 rounded-full transition-all shadow-xs"
              >
                Generate lesson
              </Link>
            </div>

            {/* Card 2: Generating */}
            <div className="bg-white rounded-3xl p-7 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[260px]">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-black text-[#10292e] uppercase tracking-wider">
                    Generating
                  </span>
                  <span className="bg-[#fff1d6] text-[#b87e00] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                    processing
                  </span>
                </div>

                <h3 className="text-base font-black text-[#10292e] mb-3">
                  Nested loops · v1
                </h3>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-[#f0f4f2] rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-[#ffa11f] rounded-full transition-all duration-500"
                    style={{ width: "60%" }}
                  />
                </div>

                <p className="text-xs font-mono text-[#5a6e70]">
                  sections · Writing section 3 of 5
                </p>
              </div>

              <div>
                <Link
                  href="/teacher/ai-generation"
                  className="inline-block bg-white hover:bg-[#fafaf8] border-2 border-[#10292e] text-[#10292e] font-bold text-xs px-5 py-2 rounded-full mb-3 transition-all"
                >
                  View job
                </Link>
                <p className="text-[11px] text-[#83908f] font-medium">
                  The version appears here as AWAITING_REVIEW when ready.
                </p>
              </div>
            </div>

            {/* Card 3: Generation failed */}
            <div className="bg-white rounded-3xl p-7 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[260px]">
              <div>
                <span className="text-xs font-black text-[#10292e] uppercase tracking-wider block mb-4">
                  Generation failed
                </span>

                <div className="p-4 rounded-2xl bg-[#fee2e2]/60 border border-[#fca5a5] mb-4">
                  <span className="block text-xs font-black text-[#dc2626]">
                    Functions intro could not be generated
                  </span>
                  <span className="font-mono text-[11px] text-[#b91c1c] block mt-0.5">
                    status: failed · error: model timeout
                  </span>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-3 mb-3">
                  <button
                    onClick={() => toast.success("Retrying generation with same parameters...")}
                    className="bg-[#ffa11f] hover:brightness-95 active:scale-95 text-[#10292e] font-extrabold text-xs px-5 py-2 rounded-full transition-all shadow-xs"
                  >
                    Retry
                  </button>
                  <Link
                    href="/teacher/ai-generation"
                    className="bg-white hover:bg-[#fafaf8] border-2 border-[#10292e] text-[#10292e] font-bold text-xs px-5 py-1.5 rounded-full transition-all"
                  >
                    Edit request
                  </Link>
                </div>
                <p className="text-[11px] text-[#83908f] font-medium">
                  Retry creates a new job with the same topic and grade.
                </p>
              </div>
            </div>

            {/* Card 4: No approved version */}
            <div className="bg-white rounded-3xl p-7 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[260px]">
              <div>
                <span className="text-xs font-black text-[#10292e] uppercase tracking-wider block mb-4">
                  No approved version
                </span>

                <div className="p-4 rounded-2xl bg-[#fffbeb] border border-[#fde68a] mb-4">
                  <span className="block text-xs font-black text-[#b45309]">
                    Students cannot open this lesson yet
                  </span>
                  <span className="font-mono text-[11px] text-[#92400e] block mt-0.5">
                    approved_version_no: null
                  </span>
                </div>
              </div>

              <div>
                <button
                  onClick={() => setActiveTab("Content")}
                  className="bg-[#ffa11f] hover:brightness-95 active:scale-95 text-[#10292e] font-extrabold text-xs px-6 py-2.5 rounded-full mb-3 transition-all shadow-xs"
                >
                  Review v2
                </button>
                <p className="text-[11px] text-[#83908f] font-medium">
                  Approve a version to publish the lesson to students.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2, 3, 4: CONTENT, NARRATION, OR VERSION HISTORY (3 Columns) */}
        {/* ========================================================================= */}
        {activeTab !== "Overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-fadeIn">
            {/* Left Column: Lessons & Sections Navigator (3 cols) */}
            <div className="lg:col-span-3 space-y-5">
              {/* Lessons Selector Card */}
              <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs">
                <span className="text-xs font-black text-[#10292e] block mb-2 uppercase tracking-wider">
                  Lessons
                </span>

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search lessons..."
                  className="w-full rounded-xl border border-[#d2dcd7] px-3 py-1.5 text-xs text-[#10292e] mb-3 focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                />

                <div className="flex gap-1.5 mb-3">
                  {(["All", "Awaiting", "Approved"] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setFilterState(s)}
                      className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
                        filterState === s
                          ? "bg-[#fff1d6] text-[#b87e00]"
                          : "bg-[#f5f7f6] text-[#5a6e70] hover:bg-[#e8eeea]"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="space-y-2">
                  {filteredLessons.map((l) => {
                    const isSelected = selectedLesson.id === l.id;
                    return (
                      <div
                        key={l.id}
                        onClick={() => setSelectedLessonId(l.id)}
                        className={`p-3 rounded-2xl border text-left cursor-pointer transition-all ${
                          isSelected
                            ? "border-2 border-[#ffa11f] bg-[#fffaf0] shadow-xs"
                            : "border-[#e8eeea] hover:border-[#ffa11f]/50 bg-white"
                        }`}
                      >
                        <h4 className="text-xs font-black text-[#10292e] leading-snug">
                          {l.topic}
                        </h4>
                        <p className="text-[10px] text-[#5a6e70] mt-0.5">
                          {l.course}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2">
                          <span className="font-mono text-[10px] text-[#5a6e70]">
                            v{l.current_version_no}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              l.state === "AWAITING_REVIEW"
                                ? "bg-[#fff1d6] text-[#b87e00]"
                                : l.state === "APPROVED"
                                ? "bg-[#e6f7ec] text-[#1e7e34]"
                                : "bg-[#fde8ec] text-[#d63384]"
                            }`}
                          >
                            {l.state}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Sections list */}
              {activeTab === "Content" && (
                <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs">
                  <span className="text-xs font-black text-[#10292e] block mb-3 uppercase tracking-wider">
                    Sections
                  </span>
                  <div className="space-y-2 text-xs font-bold">
                    {[
                      { order: 0, title: "0 Introduction", blocks: "3 blocks" },
                      { order: 1, title: "1 What is a loop?", blocks: "5 blocks" },
                      { order: 2, title: "2 range() and counting", blocks: "6 blocks" },
                      { order: 3, title: "3 Tracing output", blocks: "4 blocks" },
                      { order: 4, title: "- Conclusion", blocks: "2 blocks" },
                    ].map((sec) => (
                      <button
                        key={sec.order}
                        onClick={() => setActiveSection(sec.order)}
                        className={`w-full p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                          activeSection === sec.order
                            ? "border-2 border-[#ffa11f] bg-[#fffaf0] text-[#10292e]"
                            : "border-[#e8eeea] text-[#5a6e70] hover:bg-[#fafaf8]"
                        }`}
                      >
                        <span>{sec.title}</span>
                        <span className="text-[10px] text-[#83908f] font-normal">
                          {sec.blocks}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Middle Column: Dynamic based on Active Tab (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Header metadata pill card */}
              <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-black text-[#10292e]">
                    {selectedLesson.topic}
                  </h3>
                  <div className="flex gap-2">
                    <span className="bg-[#fde8ec] text-[#d63384] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                      v1 · REJECTED
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        isApproved
                          ? "bg-[#e6f7ec] text-[#1e7e34]"
                          : "bg-[#fff1d6] text-[#b87e00]"
                      }`}
                    >
                      v{selectedLesson.current_version_no} · {selectedLesson.state}
                    </span>
                  </div>
                </div>
                <p className="text-xs font-mono text-[#5a6e70]">
                  programming_language: {selectedLesson.programming_language} · grade_level:{" "}
                  {selectedLesson.grade_level} · target_duration_minutes:{" "}
                  {selectedLesson.target_duration_minutes} · current_version_no:{" "}
                  {selectedLesson.current_version_no} · approved_version_no:{" "}
                  {selectedLesson.approved_version_no ?? "null"}
                </p>
              </div>

              {/* -------------------- SUBVIEW: CONTENT (Images 2, 3, 4) -------------------- */}
              {activeTab === "Content" && (
                <>
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs space-y-6">
                    <div>
                      <h3 className="text-xl font-black text-[#10292e]">
                        Section 2 · range() and counting
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-[#5a6e70]">
                        <span>purpose: show how range() counts from zero.</span>
                        <span>•</span>
                        <span>covers_objectives:</span>
                        <span className="bg-[#f0f4f2] text-[#118a80] font-mono text-[11px] px-2 py-0.5 rounded-full">
                          use range()
                        </span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <span className="text-xs font-black text-[#10292e] uppercase tracking-wider block">
                        Blocks
                      </span>

                      {/* Paragraph */}
                      <div className="p-4 rounded-2xl bg-[#fafaf8] border border-[#e8eeea]">
                        <span className="text-[10px] font-mono uppercase bg-[#e8eeea] text-[#5a6e70] px-2 py-0.5 rounded-md inline-block mb-2">
                          paragraph
                        </span>
                        <p className="text-sm font-semibold text-[#10292e]">
                          range(5) gives the numbers 0, 1, 2, 3 and 4.
                        </p>
                      </div>

                      {/* Code */}
                      <div className="p-4 rounded-2xl bg-[#10292e] text-white">
                        <span className="text-[10px] font-mono uppercase bg-white/20 text-white px-2 py-0.5 rounded-md inline-block mb-3">
                          code
                        </span>
                        <pre className="font-mono text-xs sm:text-sm text-[#7ccbf0] leading-relaxed">
{`for i in range(5):
    print(i)`}
                        </pre>
                        <div className="mt-3 pt-3 border-t border-white/15 text-xs font-mono text-[#ffd84a]">
                          expected_output: 0 1 2 3 4
                        </div>
                      </div>

                      {/* Callout tip */}
                      <div className="p-4 rounded-2xl bg-[#e6f4fa] border border-[#b8e2f6]">
                        <span className="text-[10px] font-mono uppercase bg-white/60 text-[#0f5478] px-2 py-0.5 rounded-md inline-block mb-1 font-bold">
                          callout · tip
                        </span>
                        <p className="text-xs sm:text-sm text-[#0f5478] font-bold mt-1">
                          Tip: range(5) stops before 5.
                        </p>
                      </div>

                      {/* Callout warning */}
                      <div className="p-4 rounded-2xl bg-[#fff2e0] border border-[#ffd59e]">
                        <span className="text-[10px] font-mono uppercase bg-white/60 text-[#965304] px-2 py-0.5 rounded-md inline-block mb-1 font-bold">
                          callout · warning
                        </span>
                        <p className="text-xs sm:text-sm text-[#965304] font-bold mt-1">
                          Counting starts at 0, not 1.
                        </p>
                      </div>

                      {/* List */}
                      <div className="p-4 rounded-2xl bg-[#fafaf8] border border-[#e8eeea]">
                        <span className="text-[10px] font-mono uppercase bg-[#e8eeea] text-[#5a6e70] px-2 py-0.5 rounded-md inline-block mb-2">
                          list
                        </span>
                        <ul className="list-disc list-inside text-xs sm:text-sm text-[#10292e] space-y-1 font-medium">
                          <li>range(stop) starts at 0</li>
                          <li>range(start, stop) stops before stop</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Diagnostic Check */}
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-black text-[#10292e]">
                        Diagnostic check · Section 2
                      </h3>
                      <span className="bg-[#f0f4f2] text-[#118a80] text-[11px] font-mono px-3 py-1 rounded-full">
                        concept_tag: zero_indexing
                      </span>
                    </div>

                    <p className="text-sm font-bold text-[#10292e]">
                      What does range(3) produce?
                    </p>

                    <div className="p-3 bg-[#10292e] text-[#7ccbf0] rounded-xl font-mono text-xs">
                      print(list(range(3)))
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-[#fee2e2] text-[#991b1b] text-xs font-mono px-3 py-1 rounded-lg border border-[#fecaca]">
                        1 2 3 · off-by-one
                      </span>
                      <span className="bg-[#dcfce7] text-[#166534] text-xs font-mono px-3 py-1 rounded-lg border border-[#bbf7d0] font-black">
                        0 1 2 · correct
                      </span>
                      <span className="bg-[#fee2e2] text-[#991b1b] text-xs font-mono px-3 py-1 rounded-lg border border-[#fecaca]">
                        0 1 2 3 · includes stop
                      </span>
                    </div>

                    <p className="text-xs text-[#5a6e70] font-medium leading-relaxed">
                      misconception_map routes each wrong option to remediation_blocks.
                    </p>
                  </div>
                </>
              )}

              {/* -------------------- SUBVIEW: NARRATION (Image 5) -------------------- */}
              {activeTab === "Narration" && (
                <>
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs">
                    <h3 className="text-xl font-black text-[#10292e]">
                      Narration segments
                    </h3>
                    <p className="text-xs text-[#5a6e70] mt-1 mb-5 font-medium">
                      Each segment is a short script of about 45 to 60 seconds.
                    </p>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="border-b border-[#f0f4f2] text-[11px] font-extrabold uppercase tracking-wider text-[#5a6e70]">
                            <th className="pb-3 pr-3">#</th>
                            <th className="pb-3 px-4">TITLE</th>
                            <th className="pb-3 px-4">EST_SECONDS</th>
                            <th className="pb-3 pl-4">ATTACHED_CODE</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#f7faf8] text-xs">
                          {NARRATION_SEGMENTS.map((seg) => (
                            <tr key={seg.num} className="hover:bg-[#fafaf8] transition-colors">
                              <td className="py-4 pr-3 font-black text-[#10292e]">
                                {seg.num}
                              </td>
                              <td className="py-4 px-4">
                                <span className="font-extrabold text-[#10292e] block">
                                  {seg.title}
                                </span>
                                <span className="text-[#5a6e70] text-[11px]">
                                  {seg.quote}
                                </span>
                              </td>
                              <td className="py-4 px-4 font-mono text-[#5a6e70] whitespace-nowrap">
                                <span className="bg-[#f0f4f2] px-2.5 py-1 rounded-full">
                                  {seg.est_seconds} s
                                </span>
                              </td>
                              <td className="py-4 pl-4">
                                {seg.attached_code ? (
                                  <code className="bg-[#10292e] text-[#7ccbf0] font-mono text-[11px] px-2.5 py-1 rounded-md">
                                    {seg.attached_code}
                                  </code>
                                ) : (
                                  <span className="text-[#d2dcd7]">—</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <div className="mt-5 pt-4 border-t border-[#f0f4f2] text-xs font-mono text-[#5a6e70]">
                      Speech segments: 6 · estimated 6:05 total
                    </div>
                  </div>

                  {/* Audio Preview Box matching Image 5 */}
                  <div className="rounded-3xl border border-dashed border-[#f25c78] p-6 bg-white/60">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="text-sm font-black text-[#10292e]">
                        Audio preview
                      </h4>
                      <span className="border border-dashed border-[#f25c78] text-[#f25c78] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                        Proposed
                      </span>
                    </div>
                    <p className="text-xs text-[#5a6e70] font-medium">
                      Playing narration needs a speech service in the backend.
                    </p>
                  </div>
                </>
              )}

              {/* -------------------- SUBVIEW: VERSION HISTORY (Image 3) -------------------- */}
              {activeTab === "Version history" && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Version 1 Card */}
                    <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-black text-[#10292e]">
                          Version 1
                        </h4>
                        <span className="bg-[#fde8ec] text-[#d63384] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                          REJECTED
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-[#5a6e70] block mb-1">
                          teacher_feedback
                        </span>
                        <div className="p-3 rounded-2xl bg-[#fafaf8] border border-[#e8eeea] text-xs text-[#10292e] font-semibold italic">
                          &ldquo;Intro is too long. Add a diagnostic check after section 2.&rdquo;
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-[#5a6e70] block">
                          sections
                        </span>
                        <div className="p-2.5 rounded-xl border border-[#e8eeea] flex items-center justify-between text-xs font-semibold">
                          <span>Introduction · 6 blocks</span>
                          <span className="bg-[#fff1d6] text-[#b87e00] text-[9px] font-black px-2 py-0.5 rounded-md">
                            long
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl border border-[#e8eeea] text-xs font-semibold">
                          What is a loop? · 5 blocks
                        </div>
                        <div className="p-2.5 rounded-xl border border-[#e8eeea] flex items-center justify-between text-xs font-semibold">
                          <span>range() and counting</span>
                          <span className="bg-[#fff1d6] text-[#b87e00] text-[9px] font-black px-2 py-0.5 rounded-md">
                            no diagnostic
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl border border-[#e8eeea] flex items-center justify-between text-xs font-semibold">
                          <span>Tracing output</span>
                          <span className="bg-[#fff1d6] text-[#b87e00] text-[9px] font-black px-2 py-0.5 rounded-md">
                            no diagnostic
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Version 2 Card */}
                    <div className="bg-white rounded-3xl p-5 border-2 border-[#ffa11f] shadow-xs space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-base font-black text-[#10292e]">
                          Version 2
                        </h4>
                        <span
                          className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            isApproved
                              ? "bg-[#e6f7ec] text-[#1e7e34]"
                              : "bg-[#fff1d6] text-[#b87e00]"
                          }`}
                        >
                          {selectedLesson.state}
                        </span>
                      </div>

                      <div>
                        <span className="text-[10px] font-mono text-[#5a6e70] block mb-1">
                          teacher_feedback
                        </span>
                        <div className="p-3 rounded-2xl bg-[#f0f7f4] border border-[#d2dcd7] text-xs text-[#5a6e70]">
                          No feedback yet
                        </div>
                      </div>

                      <div className="space-y-2">
                        <span className="text-[10px] font-mono text-[#5a6e70] block">
                          sections
                        </span>
                        <div className="p-2.5 rounded-xl border border-[#e8eeea] flex items-center justify-between text-xs font-semibold">
                          <span>Introduction · 3 blocks</span>
                          <span className="bg-[#fff1d6] text-[#b87e00] text-[9px] font-black px-2 py-0.5 rounded-md">
                            shortened
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl border border-[#e8eeea] text-xs font-semibold">
                          What is a loop? · 5 blocks
                        </div>
                        <div className="p-2.5 rounded-xl border border-[#e8eeea] flex items-center justify-between text-xs font-semibold">
                          <span>range() and counting</span>
                          <span className="bg-[#e6f7ec] text-[#1e7e34] text-[9px] font-black px-2 py-0.5 rounded-md">
                            diagnostic added
                          </span>
                        </div>
                        <div className="p-2.5 rounded-xl border border-[#e8eeea] flex items-center justify-between text-xs font-semibold">
                          <span>Tracing output</span>
                          <span className="bg-[#e6f7ec] text-[#1e7e34] text-[9px] font-black px-2 py-0.5 rounded-md">
                            diagnostic added
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* How this was built Card matching Image 3 */}
                  <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
                    <h4 className="text-base font-black text-[#10292e] mb-1">
                      How this was built
                    </h4>
                    <p className="text-xs text-[#5a6e70] font-medium mb-3">
                      Versions are immutable, so every difference above comes from Lesson.versions[].
                    </p>
                    <span className="inline-block bg-[#e6f7ec] text-[#1e7e34] text-[10px] font-black px-3 py-1 rounded-full mb-2">
                      Derived from existing data
                    </span>
                    <p className="text-xs text-[#5a6e70] font-medium">
                      No backend change needed to compare versions.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Right Column: Versions & Decision (3 cols) */}
            <div className="lg:col-span-3 space-y-6">
              {/* Versions Card */}
              <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs">
                <span className="text-xs font-black text-[#10292e] uppercase tracking-wider block mb-3">
                  Versions
                </span>

                <div className="space-y-2.5">
                  <div className="p-3 rounded-2xl border-2 border-[#ffa11f] bg-[#fffaf0]">
                    <span className="text-xs font-black text-[#10292e] block">
                      Version 2
                    </span>
                    <span
                      className={`text-[10px] font-black uppercase mt-1 inline-block ${
                        isApproved ? "text-[#16a34a]" : "text-[#b87e00]"
                      }`}
                    >
                      {selectedLesson.state}
                    </span>
                  </div>

                  <div className="p-3 rounded-2xl border border-[#e8eeea] bg-[#fafaf8]">
                    <span className="text-xs font-black text-[#10292e] block">
                      Version 1
                    </span>
                    <span className="text-[10px] font-black uppercase text-[#d63384] mt-1 inline-block">
                      REJECTED
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-[#f0f4f2] text-[11px] font-mono text-[#83908f]">
                  approved_version_no:{" "}
                  {selectedLesson.approved_version_no ?? "null"}
                </div>
              </div>

              {/* Your Decision / Decision Card (Images 2 & 4) */}
              <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-[#10292e] uppercase tracking-wider">
                    {isApproved ? "Decision" : "Your decision"}
                  </span>
                  {!isApproved && (
                    <span className="text-[10px] font-mono text-[#118a80] bg-[#f0f4f2] px-2 py-0.5 rounded-full">
                      teacher_feedback
                    </span>
                  )}
                </div>

                {/* If approved: show green approval banner and regenerate as v3 button */}
                {isApproved ? (
                  <div className="space-y-4">
                    <div className="p-4 rounded-2xl bg-[#dcfce7] border border-[#86efac]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-5 h-5 rounded-full bg-[#16a34a] text-white flex items-center justify-center text-xs">
                          ✓
                        </span>
                        <span className="text-xs font-black text-[#166534]">
                          Version 2 approved
                        </span>
                      </div>
                      <span className="font-mono text-[11px] text-[#15803d]">
                        approved_version_no: 2
                      </span>
                    </div>

                    <p className="text-xs text-[#5a6e70] font-medium leading-relaxed">
                      Students now open v2. Older versions stay in history.
                    </p>

                    <button
                      type="button"
                      onClick={handleRegenerate}
                      className="w-full py-3 rounded-full border-2 border-[#10292e] text-[#10292e] hover:bg-[#fafaf8] active:scale-95 text-xs font-black transition-all cursor-pointer shadow-xs"
                    >
                      Regenerate as v3
                    </button>
                  </div>
                ) : (
                  /* If awaiting review: feedback textarea and actions */
                  <div className="space-y-3">
                    <textarea
                      value={feedbackInput}
                      onChange={(e) => setFeedbackInput(e.target.value)}
                      placeholder="Tell ALMA what to change..."
                      rows={4}
                      className="w-full rounded-2xl border border-[#d2dcd7] p-3 text-xs text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#ffa11f] resize-none"
                    />

                    <div className="space-y-2">
                      <button
                        type="button"
                        onClick={handleApproveCurrent}
                        className="w-full py-3 rounded-full bg-[#ffa11f] hover:brightness-95 active:scale-95 text-[#10292e] text-xs font-black transition-all shadow-xs cursor-pointer"
                      >
                        Approve v2
                      </button>

                      <button
                        type="button"
                        onClick={handleOpenRejectModal}
                        className="w-full py-2.5 rounded-full border-2 border-[#f25c78] text-[#f25c78] hover:bg-rose-50 active:scale-95 text-xs font-black transition-all cursor-pointer"
                      >
                        Reject with feedback
                      </button>

                      <button
                        type="button"
                        onClick={handleRegenerate}
                        className="w-full py-2.5 rounded-full border-2 border-[#10292e] text-[#10292e] hover:bg-[#fafaf8] active:scale-95 text-xs font-black transition-all cursor-pointer"
                      >
                        Regenerate
                      </button>
                    </div>

                    <p className="text-[11px] text-[#5a6e70] font-medium leading-relaxed pt-2">
                      Approve sets approved_version_no. Rejected versions stay in history.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* REJECT MODAL DIALOG (Matching Image 4 exactly) */}
      {/* ========================================================================= */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#e8eeea] animate-scaleUp">
            <h3 className="text-xl sm:text-2xl font-black text-[#10292e] mb-1">
              Reject {selectedLesson.topic} · v{selectedLesson.current_version_no}?
            </h3>
            <p className="text-xs sm:text-sm text-[#5a6e70] font-medium mb-4">
              ALMA writes the next version from your feedback.
            </p>

            <div className="space-y-2 mb-4">
              <span className="text-[11px] font-mono text-[#5a6e70] block">
                teacher_feedback
              </span>
              <textarea
                value={modalFeedback}
                onChange={(e) => {
                  setModalFeedback(e.target.value);
                  if (modalError) setModalError(false);
                }}
                placeholder="Tell ALMA what to change..."
                rows={4}
                className={`w-full rounded-2xl p-3 text-xs text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none transition-all resize-none ${
                  modalError
                    ? "border-2 border-red-500 focus:ring-2 focus:ring-red-400"
                    : "border-2 border-red-400 focus:ring-2 focus:ring-red-400"
                }`}
              />

              {/* Error message matching Image 4 */}
              <p className="text-xs text-red-500 font-semibold">
                Feedback is required when rejecting.
              </p>
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRejectModal(false)}
                className="py-2.5 px-6 rounded-full border-2 border-[#10292e] text-[#10292e] text-xs font-black hover:bg-[#fafaf8] cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmReject}
                disabled={!modalFeedback.trim()}
                className={`py-2.5 px-6 rounded-full text-xs font-black transition-all cursor-pointer ${
                  modalFeedback.trim()
                    ? "bg-[#f25c78] hover:bg-[#e04c68] text-white shadow-xs"
                    : "bg-[#d2dcd7] text-[#5a6e70] cursor-not-allowed"
                }`}
              >
                Reject version
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function LessonsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#fff8ec] flex items-center justify-center">
          <MangoIcon size={64} animated />
        </div>
      }
    >
      <LessonsContent />
    </Suspense>
  );
}
