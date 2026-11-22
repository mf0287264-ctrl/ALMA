"use client";

import React, { useState, Suspense } from "react";
import TeacherSidebar from "@/components/TeacherSidebar";
import MangoIcon from "@/components/MangoIcon";
import Link from "next/link";
import { toast } from "sonner";

interface AssessmentItem {
  id: string;
  title: string;
  course: string;
  module: string;
  questionsCount: number;
  total_points: number;
  passing_score: number;
  status: "draft" | "published" | "archived";
  source: "AI" | "Manual";
  question_mix: string;
}

const INITIAL_ASSESSMENTS: AssessmentItem[] = [
  {
    id: "ass-1",
    title: "Loops checkpoint",
    course: "Intro to Python",
    module: "Module 3 · Loops",
    questionsCount: 8,
    total_points: 100,
    passing_score: 60,
    status: "draft",
    source: "AI",
    question_mix: "mcq 5 · coding 2 · short_answer 1",
  },
  {
    id: "ass-2",
    title: "Variables quiz",
    course: "Intro to Python",
    module: "Module 1 · Basics",
    questionsCount: 10,
    total_points: 100,
    passing_score: 60,
    status: "published",
    source: "AI",
    question_mix: "mcq 8 · coding 2",
  },
  {
    id: "ass-3",
    title: "Lists and indexing test",
    course: "Data Basics",
    module: "Module 2 · Collections",
    questionsCount: 12,
    total_points: 120,
    passing_score: 70,
    status: "published",
    source: "Manual",
    question_mix: "mcq 6 · coding 4 · short_answer 2",
  },
  {
    id: "ass-4",
    title: "If statements quiz",
    course: "Intro to Python",
    module: "Module 2 · Conditionals",
    questionsCount: 6,
    total_points: 60,
    passing_score: 36,
    status: "published",
    source: "AI",
    question_mix: "mcq 4 · coding 2",
  },
  {
    id: "ass-5",
    title: "Web basics midterm",
    course: "Web Foundations",
    module: "Module 4 · DOM",
    questionsCount: 15,
    total_points: 150,
    passing_score: 90,
    status: "draft",
    source: "Manual",
    question_mix: "mcq 10 · coding 5",
  },
  {
    id: "ass-6",
    title: "Old functions quiz",
    course: "Data Basics",
    module: "Module 3 · Functions",
    questionsCount: 5,
    total_points: 50,
    passing_score: 30,
    status: "archived",
    source: "AI",
    question_mix: "mcq 5",
  },
];

function AssessmentsMain() {
  const [assessments, setAssessments] = useState<AssessmentItem[]>(INITIAL_ASSESSMENTS);
  const [selectedId, setSelectedId] = useState<string>("ass-1");
  const [viewMode, setViewMode] = useState<"list" | "editor" | "states">("list");
  const [statusFilter, setStatusFilter] = useState<"All" | "draft" | "published" | "archived">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const selectedAssessment =
    assessments.find((a) => a.id === selectedId) || assessments[0];

  // Editor sub-tabs (Questions | Settings | Preview | Results · proposed)
  const [editorTab, setEditorTab] = useState<
    "Questions" | "Settings" | "Preview" | "Results · proposed"
  >("Questions");

  // Editor form state
  const [title, setTitle] = useState(selectedAssessment.title);
  const [description, setDescription] = useState("Short check on for loops and range().");
  const [courseName, setCourseName] = useState(selectedAssessment.course);
  const [moduleName, setModuleName] = useState(selectedAssessment.module);
  const [totalPoints, setTotalPoints] = useState(selectedAssessment.total_points);
  const [passingScore, setPassingScore] = useState(selectedAssessment.passing_score);
  const [createdWithAi, setCreatedWithAi] = useState(true);

  // Settings proposed availability
  const [timeLimitMinutes, setTimeLimitMinutes] = useState(20);
  const [dueDate, setDueDate] = useState("—");
  const [maxAttempts, setMaxAttempts] = useState(1);

  // Question 1 state
  const [q1Text, setQ1Text] = useState("Which keyword starts a loop over a range?");
  const [q1Option, setQ1Option] = useState<string>("for");
  const [q1Points, setQ1Points] = useState(10);
  const [q1Explanation, setQ1Explanation] = useState("for repeats a block.");

  // Preview Student Mode state
  const [previewQ1Answer, setPreviewQ1Answer] = useState("for");
  const [previewQ2Code, setPreviewQ2Code] = useState("");
  const [previewQ3Text, setPreviewQ3Text] = useState("");

  // Publish Dialog Modal
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [isModuleSet, setIsModuleSet] = useState(true);

  // Filter list
  const filteredAssessments = assessments.filter((a) => {
    const matchSearch =
      a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.course.toLowerCase().includes(searchQuery.toLowerCase());
    const matchStatus = statusFilter === "All" || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleOpenEditor = (item: AssessmentItem) => {
    setSelectedId(item.id);
    setTitle(item.title);
    setCourseName(item.course);
    setModuleName(item.module);
    setTotalPoints(item.total_points);
    setPassingScore(item.passing_score);
    setViewMode("editor");
    setEditorTab("Questions");
  };

  const handleSaveDraft = () => {
    setAssessments((prev) =>
      prev.map((a) =>
        a.id === selectedAssessment.id
          ? {
              ...a,
              title,
              course: courseName,
              module: moduleName,
              total_points: totalPoints,
              passing_score: passingScore,
            }
          : a
      )
    );
    toast.success("Draft saved successfully!");
  };

  const handlePublishAssessment = () => {
    if (!isModuleSet || !moduleName.trim()) {
      setShowPublishModal(true);
      return;
    }

    setAssessments((prev) =>
      prev.map((a) =>
        a.id === selectedAssessment.id ? { ...a, status: "published" } : a
      )
    );
    setShowPublishModal(false);
    toast.success(`Assessment "${title}" published successfully!`);
  };

  const handleDeleteAssessment = () => {
    setAssessments((prev) => prev.filter((a) => a.id !== selectedAssessment.id));
    toast.error(`Assessment "${title}" deleted.`);
    setViewMode("list");
  };

  return (
    <div className="w-full min-h-screen bg-[#fff8ec] flex">
      {/* Fixed Sidebar */}
      <TeacherSidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-6 sm:p-10 lg:p-12 pt-20 lg:pt-10 overflow-y-auto">
        {/* ========================================================================= */}
        {/* VIEW 1: ASSESSMENTS LIST VIEW (Image 2) */}
        {/* ========================================================================= */}
        {viewMode === "list" && (
          <div className="animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl sm:text-4xl font-black text-[#10292e] tracking-tight">
                    Assessments
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
                  Assessment records per course and module · sample data
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode("states")}
                  className="bg-white hover:bg-[#fafaf8] border-2 border-[#10292e] text-[#10292e] font-bold text-xs px-4 py-2 rounded-full transition-all cursor-pointer"
                >
                  States board
                </button>
                <Link
                  href="/teacher/ai-generation"
                  className="bg-white hover:bg-[#fafaf8] border-2 border-[#10292e] text-[#10292e] font-bold text-xs px-4 py-2 rounded-full transition-all"
                >
                  Generate with AI
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenEditor({
                      id: `ass-${Date.now()}`,
                      title: "Loops checkpoint",
                      course: "Intro to Python",
                      module: "Module 3 · Loops",
                      questionsCount: 8,
                      total_points: 100,
                      passing_score: 60,
                      status: "draft",
                      source: "AI",
                      question_mix: "mcq 5 · coding 2 · short_answer 1",
                    });
                  }}
                  className="bg-[#ffa11f] hover:brightness-95 active:scale-95 text-[#10292e] font-extrabold text-xs px-5 py-2.5 rounded-full transition-all shadow-xs cursor-pointer"
                >
                  New assessment
                </button>
              </div>
            </div>

            {/* 2-Column Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
              {/* Left Column: All assessments (8 cols) */}
              <section className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs">
                <h2 className="text-lg font-black text-[#10292e] mb-4">
                  All assessments
                </h2>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search assessments..."
                    className="w-full sm:w-64 rounded-2xl border border-[#d2dcd7] px-4 py-2 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                  />

                  <div className="flex gap-1.5 self-start sm:self-auto">
                    {(["All", "draft", "published", "archived"] as const).map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setStatusFilter(s)}
                        className={`px-3 py-1 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                          statusFilter === s
                            ? s === "draft"
                              ? "bg-[#fff1d6] text-[#b87e00]"
                              : s === "published"
                              ? "bg-[#e6f7ec] text-[#1e7e34]"
                              : s === "archived"
                              ? "bg-[#f0f4f2] text-[#5a6e70]"
                              : "border-2 border-[#ffa11f] text-[#ffa11f]"
                            : "bg-[#f5f7f6] text-[#5a6e70] hover:bg-[#e8eeea]"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-[#f0f4f2] text-[11px] font-extrabold uppercase tracking-wider text-[#5a6e70]">
                        <th className="pb-3 pr-4">TITLE</th>
                        <th className="pb-3 px-4">COURSE</th>
                        <th className="pb-3 px-2 text-center">Q</th>
                        <th className="pb-3 px-2 text-center">POINTS</th>
                        <th className="pb-3 px-2 text-center">PASS</th>
                        <th className="pb-3 px-3 text-center">STATUS</th>
                        <th className="pb-3 pl-3 text-right">SOURCE</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f7faf8] text-xs">
                      {filteredAssessments.map((a) => {
                        const isSelected = selectedId === a.id;
                        return (
                          <tr
                            key={a.id}
                            onClick={() => setSelectedId(a.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? "bg-[#fffbeb] font-black"
                                : "hover:bg-[#fafaf8]"
                            }`}
                          >
                            <td className="py-4 pr-4">
                              <span className="font-extrabold text-[#10292e] block">
                                {a.title}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-[#5a6e70] font-medium">
                              {a.course}
                            </td>
                            <td className="py-4 px-2 text-center font-mono text-[#5a6e70]">
                              {a.questionsCount}
                            </td>
                            <td className="py-4 px-2 text-center font-mono text-[#5a6e70]">
                              {a.total_points}
                            </td>
                            <td className="py-4 px-2 text-center font-mono text-[#5a6e70]">
                              {a.passing_score}
                            </td>
                            <td className="py-4 px-3 text-center">
                              <span
                                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                                  a.status === "published"
                                    ? "bg-[#e6f7ec] text-[#1e7e34]"
                                    : a.status === "draft"
                                    ? "bg-[#fff1d6] text-[#b87e00]"
                                    : "bg-[#f0f4f2] text-[#5a6e70]"
                                }`}
                              >
                                {a.status}
                              </span>
                            </td>
                            <td className="py-4 pl-3 text-right">
                              <span className="text-[10px] font-bold text-[#5a6e70] bg-[#f0f4f2] px-2 py-0.5 rounded-full">
                                {a.source}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                <div className="mt-5 pt-3 border-t border-[#f0f4f2] flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleOpenEditor(selectedAssessment)}
                    className="text-xs font-bold text-[#118a80] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    Open in Assessment editor →
                  </button>
                </div>
              </section>

              {/* Right Column: Ready to publish? & Results (4 cols) */}
              <div className="lg:col-span-4 space-y-6">
                <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs space-y-4">
                  <h3 className="text-base font-black text-[#10292e]">
                    Ready to publish?
                  </h3>
                  <p className="text-xs text-[#5a6e70] font-medium leading-relaxed">
                    Checks derived from the Assessment model for &ldquo;{selectedAssessment.title}&rdquo;.
                  </p>

                  <div className="space-y-2.5 text-xs">
                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="text-[#10292e] font-semibold">
                        total_points equals sum of question points
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="text-[#10292e] font-semibold">
                        passing_score ≤ total_points
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-[#fef3c7] text-[#b45309] flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                        !
                      </span>
                      <span className="text-[#10292e] font-semibold">
                        Every mcq has correct_answer in options
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                        ✓
                      </span>
                      <span className="text-[#10292e] font-semibold">
                        Coding questions have an expected answer
                      </span>
                    </div>

                    <div className="flex items-start gap-2.5">
                      <span className="w-4 h-4 rounded-full bg-[#fee2e2] text-[#dc2626] flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                        ✕
                      </span>
                      <span className="text-[#10292e] font-semibold">
                        Module is set (module_id)
                      </span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#fffbeb] border border-[#fef08a] space-y-1">
                    <span className="text-xs font-black text-[#92400e] block">
                      Question mix
                    </span>
                    <span className="font-mono text-xs text-[#b45309] block">
                      {selectedAssessment.question_mix}
                    </span>
                  </div>
                </section>

                <section className="rounded-3xl border border-dashed border-[#f25c78] p-6 bg-white/60 space-y-2">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-black text-[#10292e]">
                      Results and analytics
                    </h4>
                    <span className="border border-dashed border-[#f25c78] text-[#f25c78] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      Proposed
                    </span>
                  </div>
                  <p className="text-xs text-[#5a6e70] font-medium leading-relaxed">
                    Needs an AssessmentSubmission collection. Average score, pass rate and per-question accuracy appear here once it exists.
                  </p>
                </section>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 2: STATES BOARD (Empty, Loading, Error, Success - Image 5) */}
        {/* ========================================================================= */}
        {viewMode === "states" && (
          <div className="animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl sm:text-4xl font-black text-[#10292e] tracking-tight">
                    Assessments
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
                  Empty, loading, error and success states
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  className="bg-white hover:bg-[#fafaf8] border-2 border-[#10292e] text-[#10292e] font-bold text-xs px-5 py-2.5 rounded-full transition-all cursor-pointer"
                >
                  Back to list
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("editor")}
                  className="bg-[#ffa11f] hover:brightness-95 active:scale-95 text-[#10292e] font-extrabold text-xs px-5 py-2.5 rounded-full transition-all shadow-xs cursor-pointer"
                >
                  New assessment
                </button>
              </div>
            </div>

            {/* 4 State Cards Grid (2x2) matching Image 5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  No assessments yet
                </h3>
                <p className="text-xs text-[#5a6e70] mt-1 mb-5 max-w-xs font-medium">
                  Create one by hand or start from a lesson.
                </p>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setViewMode("editor")}
                    className="bg-[#ffa11f] hover:brightness-95 active:scale-95 text-[#10292e] font-extrabold text-xs px-5 py-2 rounded-full transition-all shadow-xs"
                  >
                    New assessment
                  </button>
                  <Link
                    href="/teacher/ai-generation"
                    className="bg-white hover:bg-[#fafaf8] border-2 border-[#10292e] text-[#10292e] font-bold text-xs px-5 py-1.5 rounded-full transition-all"
                  >
                    Generate with AI
                  </Link>
                </div>
              </div>

              {/* Card 2: Loading */}
              <div className="bg-white rounded-3xl p-7 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[260px]">
                <div>
                  <span className="text-xs font-black text-[#10292e] uppercase tracking-wider block mb-6">
                    Loading
                  </span>

                  <div className="space-y-3.5 animate-pulse">
                    <div className="flex items-center justify-between gap-4">
                      <div className="h-4 bg-[#e2e8e4] rounded-full w-2/5" />
                      <div className="flex gap-2">
                        <div className="h-4 bg-[#e2e8e4] rounded-full w-12" />
                        <div className="h-4 bg-[#e2e8e4] rounded-full w-12" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="h-4 bg-[#e2e8e4] rounded-full w-3/5" />
                      <div className="flex gap-2">
                        <div className="h-4 bg-[#e2e8e4] rounded-full w-12" />
                        <div className="h-4 bg-[#e2e8e4] rounded-full w-12" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="h-4 bg-[#e2e8e4] rounded-full w-4/5" />
                      <div className="flex gap-2">
                        <div className="h-4 bg-[#e2e8e4] rounded-full w-12" />
                        <div className="h-4 bg-[#e2e8e4] rounded-full w-12" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <div className="h-4 bg-[#e2e8e4] rounded-full w-1/2" />
                      <div className="flex gap-2">
                        <div className="h-4 bg-[#e2e8e4] rounded-full w-12" />
                        <div className="h-4 bg-[#e2e8e4] rounded-full w-12" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3: Error */}
              <div className="bg-white rounded-3xl p-7 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[260px]">
                <div>
                  <span className="text-xs font-black text-[#10292e] uppercase tracking-wider block mb-4">
                    Error
                  </span>

                  <div className="p-4 rounded-2xl bg-[#fee2e2]/60 border border-[#fca5a5] mb-4">
                    <span className="block text-xs font-black text-[#dc2626]">
                      Could not load assessments
                    </span>
                    <span className="font-mono text-[11px] text-[#b91c1c] block mt-0.5">
                      GET /assessments failed · timeout after 10 s
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <button
                      onClick={() => toast.success("Retrying connection...")}
                      className="bg-[#ffa11f] hover:brightness-95 active:scale-95 text-[#10292e] font-extrabold text-xs px-5 py-2 rounded-full transition-all shadow-xs"
                    >
                      Retry
                    </button>
                    <button
                      onClick={() => toast.info("Opening admin support...")}
                      className="bg-white hover:bg-[#fafaf8] border-2 border-[#10292e] text-[#10292e] font-bold text-xs px-5 py-1.5 rounded-full transition-all"
                    >
                      Contact admin
                    </button>
                  </div>
                  <p className="text-[11px] text-[#83908f] font-medium">
                    Failed state keeps the last loaded list visible when it exists.
                  </p>
                </div>
              </div>

              {/* Card 4: Success and validation */}
              <div className="bg-white rounded-3xl p-7 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[260px]">
                <div>
                  <span className="text-xs font-black text-[#10292e] uppercase tracking-wider block mb-4">
                    Success and validation
                  </span>

                  <div className="p-3.5 rounded-2xl bg-[#dcfce7] border border-[#86efac] mb-4 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#16a34a] text-white flex items-center justify-center text-[10px]">
                      ✓
                    </span>
                    <span className="text-xs font-black text-[#166534]">
                      Loops checkpoint was published.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <label className="text-[10px] font-mono text-[#5a6e70]">
                          passing_score
                        </label>
                        <span className="bg-[#e6f7ec] text-[#1e7e34] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                          Existing
                        </span>
                      </div>
                      <input
                        type="text"
                        defaultValue="120"
                        className="w-full rounded-2xl border-2 border-[#dc2626] bg-[#fff5f5] px-3.5 py-2 text-xs font-mono font-bold text-[#b91c1c] focus:outline-none"
                      />
                      <p className="text-[10px] text-[#dc2626] font-semibold mt-1">
                        passing_score must be ≤ total_points (100).
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <label className="text-[10px] font-mono text-[#5a6e70]">
                          total_points
                        </label>
                        <span className="bg-[#e6f7ec] text-[#1e7e34] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                          Existing
                        </span>
                      </div>
                      <input
                        type="text"
                        defaultValue="100"
                        className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-3.5 py-2 text-xs font-mono font-bold text-[#10292e] focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* VIEW 3: ASSESSMENT EDITOR (Images 1, 2, 3, 4) */}
        {/* ========================================================================= */}
        {viewMode === "editor" && (
          <div className="animate-fadeIn">
            {/* Header Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-[#10292e] tracking-tight">
                    Assessment editor
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
                  {courseName} · {moduleName} · Assessment record
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                {editorTab === "Preview" || editorTab === "Results · proposed" ? (
                  <button
                    type="button"
                    onClick={() => setEditorTab("Questions")}
                    className="bg-white hover:bg-[#fafaf8] border-2 border-[#10292e] text-[#10292e] font-bold text-xs px-5 py-2 rounded-full transition-all cursor-pointer"
                  >
                    Back to editor
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setViewMode("list")}
                      className="bg-white hover:bg-[#fafaf8] border-2 border-[#10292e] text-[#10292e] font-bold text-xs px-4 py-2 rounded-full transition-all cursor-pointer"
                    >
                      Back to list
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditorTab("Preview")}
                      className="bg-white hover:bg-[#fafaf8] border-2 border-[#10292e] text-[#10292e] font-bold text-xs px-4 py-2 rounded-full transition-all cursor-pointer"
                    >
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveDraft}
                      className="bg-white hover:bg-[#fafaf8] border-2 border-[#10292e] text-[#10292e] font-bold text-xs px-4 py-2 rounded-full transition-all cursor-pointer"
                    >
                      Save draft
                    </button>
                  </>
                )}

                <button
                  type="button"
                  onClick={() => setShowPublishModal(true)}
                  className="bg-[#0b6b63] hover:bg-[#084e48] active:scale-95 text-white font-extrabold text-xs px-5 py-2 rounded-full transition-all shadow-xs cursor-pointer"
                >
                  Publish
                </button>
              </div>
            </div>

            {/* Sub Tabs */}
            <div className="flex items-center gap-2 mb-6 border-b border-[#e8eeea] pb-2">
              {(["Questions", "Settings", "Preview", "Results · proposed"] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setEditorTab(tab)}
                    className={`px-4 py-2 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                      editorTab === tab
                        ? "bg-[#10292e] text-white shadow-xs"
                        : "bg-white text-[#5a6e70] hover:text-[#10292e] border border-[#e8eeea]"
                    }`}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            {/* ------------------------------------------------------------- */}
            {/* SUBTAB 1: QUESTIONS TAB */}
            {/* ------------------------------------------------------------- */}
            {editorTab === "Questions" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 animate-fadeIn">
                <div className="lg:col-span-8 space-y-6">
                  {/* Title Box */}
                  <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#10292e]">Title</span>
                        <span className="bg-[#e6f7ec] text-[#1e7e34] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          Existing
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="bg-[#fff1d6] text-[#b87e00] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                          draft
                        </span>
                        <span className="bg-[#f0f4f2] text-[#5a6e70] text-[10px] font-bold px-2 py-0.5 rounded-full">
                          AI
                        </span>
                      </div>
                    </div>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-sm font-extrabold text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                    />
                  </div>

                  {/* Q1 MCQ */}
                  <div className="bg-white rounded-3xl p-6 border-2 border-[#ffa11f] shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black text-[#10292e]">Q1</span>
                        <div className="flex gap-1">
                          <button
                            type="button"
                            className="bg-[#10292e] text-white text-[11px] font-black px-2.5 py-0.5 rounded-lg"
                          >
                            mcq
                          </button>
                          <button
                            type="button"
                            className="bg-white text-[#5a6e70] border border-[#d2dcd7] text-[11px] font-bold px-2.5 py-0.5 rounded-lg"
                          >
                            coding
                          </button>
                          <button
                            type="button"
                            className="bg-white text-[#5a6e70] border border-[#d2dcd7] text-[11px] font-bold px-2.5 py-0.5 rounded-lg"
                          >
                            short_answer
                          </button>
                        </div>
                      </div>
                      <span className="text-xs font-mono text-[#5a6e70] bg-[#f0f4f2] px-2.5 py-1 rounded-full">
                        10 pts
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#10292e]">
                          question_text
                        </span>
                        <span className="bg-[#e6f7ec] text-[#1e7e34] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                          Existing
                        </span>
                      </div>
                      <input
                        type="text"
                        value={q1Text}
                        onChange={(e) => setQ1Text(e.target.value)}
                        className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-xs sm:text-sm text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                      />
                    </div>

                    <div className="space-y-2">
                      <div
                        onClick={() => setQ1Option("for")}
                        className={`p-3.5 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition-all ${
                          q1Option === "for"
                            ? "border-[#16a34a] bg-[#f0fdf4]"
                            : "border-[#d2dcd7] bg-white"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            q1Option === "for"
                              ? "border-[#16a34a] bg-[#16a34a]"
                              : "border-[#83908f]"
                          }`}
                        >
                          {q1Option === "for" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <span className="text-xs font-extrabold text-[#10292e]">
                          for (correct_answer)
                        </span>
                      </div>

                      <div
                        onClick={() => setQ1Option("if")}
                        className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                          q1Option === "if"
                            ? "border-[#16a34a] bg-[#f0fdf4]"
                            : "border-[#d2dcd7] bg-white"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            q1Option === "if"
                              ? "border-[#16a34a] bg-[#16a34a]"
                              : "border-[#83908f]"
                          }`}
                        >
                          {q1Option === "if" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <span className="text-xs font-semibold text-[#10292e]">if</span>
                      </div>

                      <div
                        onClick={() => setQ1Option("def")}
                        className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                          q1Option === "def"
                            ? "border-[#16a34a] bg-[#f0fdf4]"
                            : "border-[#d2dcd7] bg-white"
                        }`}
                      >
                        <span
                          className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            q1Option === "def"
                              ? "border-[#16a34a] bg-[#16a34a]"
                              : "border-[#83908f]"
                          }`}
                        >
                          {q1Option === "def" && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white" />
                          )}
                        </span>
                        <span className="text-xs font-semibold text-[#10292e]">def</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
                      <div className="sm:col-span-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#10292e]">points</span>
                          <span className="bg-[#e6f7ec] text-[#1e7e34] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                            Existing
                          </span>
                        </div>
                        <input
                          type="number"
                          value={q1Points}
                          onChange={(e) => setQ1Points(Number(e.target.value))}
                          className="w-full rounded-2xl border border-[#d2dcd7] px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold text-[#10292e]">explanation</span>
                          <span className="bg-[#e6f7ec] text-[#1e7e34] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                            Existing
                          </span>
                        </div>
                        <input
                          type="text"
                          value={q1Explanation}
                          onChange={(e) => setQ1Explanation(e.target.value)}
                          className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Q2 Coding */}
                  <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[#10292e]">
                        Q2 · Write a loop that prints 1 to 5
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#fff1d6] text-[#b87e00] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                          coding
                        </span>
                        <span className="text-xs font-mono text-[#5a6e70] bg-[#f0f4f2] px-2 py-0.5 rounded-full">
                          20 pts
                        </span>
                      </div>
                    </div>

                    <div className="p-4 bg-[#10292e] text-[#7ccbf0] rounded-2xl font-mono text-xs leading-relaxed">
{`for i in range(1, 6):
    print(i)`}
                    </div>
                  </div>

                  {/* Q3 Short Answer */}
                  <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-black text-[#10292e]">
                        Q3 · Why does a loop need an exit?
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="bg-[#f0f4f2] text-[#5a6e70] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                          short_answer
                        </span>
                        <span className="text-xs font-mono text-[#5a6e70] bg-[#f0f4f2] px-2 py-0.5 rounded-full">
                          10 pts
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#5a6e70] font-mono">
                      correct_answer + explanation
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => toast.success("Added new question block")}
                    className="bg-white hover:bg-[#fafaf8] border-2 border-[#10292e] text-[#10292e] font-bold text-xs px-6 py-2.5 rounded-full transition-all cursor-pointer shadow-xs"
                  >
                    + Add question
                  </button>
                </div>

                {/* Right side configuration & checks */}
                <div className="lg:col-span-4 space-y-6">
                  <section className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs space-y-4">
                    <h3 className="text-base font-black text-[#10292e]">
                      Configuration
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-mono text-[#5a6e70] block mb-1">
                          total_points
                        </label>
                        <input
                          type="number"
                          value={totalPoints}
                          onChange={(e) => setTotalPoints(Number(e.target.value))}
                          className="w-full rounded-2xl border border-[#d2dcd7] px-3.5 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                        />
                      </div>

                      <div>
                        <label className="text-[11px] font-mono text-[#5a6e70] block mb-1">
                          passing_score
                        </label>
                        <input
                          type="number"
                          value={passingScore}
                          onChange={(e) => setPassingScore(Number(e.target.value))}
                          className="w-full rounded-2xl border border-[#d2dcd7] px-3.5 py-2 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-1">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-[#10292e]">
                            Time limit
                          </label>
                          <span className="border border-dashed border-[#f25c78] text-[#f25c78] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                            Proposed
                          </span>
                        </div>
                        <input
                          type="text"
                          value={`${timeLimitMinutes} min`}
                          onChange={(e) => setTimeLimitMinutes(Number(e.target.value.replace(/\D/g, "")) || 20)}
                          className="w-full rounded-2xl border border-dashed border-[#f25c78] bg-[#fffaf0] px-3.5 py-2 text-xs font-bold text-[#10292e] focus:outline-none"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-[11px] font-bold text-[#10292e]">
                            Due date
                          </label>
                          <span className="border border-dashed border-[#f25c78] text-[#f25c78] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                            Proposed
                          </span>
                        </div>
                        <input
                          type="text"
                          value={dueDate}
                          onChange={(e) => setDueDate(e.target.value)}
                          className="w-full rounded-2xl border border-dashed border-[#f25c78] bg-[#fffaf0] px-3.5 py-2 text-xs font-bold text-[#10292e] focus:outline-none text-center"
                        />
                      </div>
                    </div>
                  </section>

                  <section className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs space-y-4">
                    <h3 className="text-base font-black text-[#10292e]">
                      Ready to publish?
                    </h3>
                    <p className="text-xs text-[#5a6e70] font-medium">
                      Checks derived from the Assessment model for &ldquo;{title}&rdquo;.
                    </p>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                          ✓
                        </span>
                        <span className="text-[#10292e] font-semibold">
                          total_points equals sum of question points
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                          ✓
                        </span>
                        <span className="text-[#10292e] font-semibold">
                          passing_score ≤ total_points
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#fef3c7] text-[#b45309] flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                          !
                        </span>
                        <span className="text-[#10292e] font-semibold">
                          Every mcq has correct_answer in options
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                          ✓
                        </span>
                        <span className="text-[#10292e] font-semibold">
                          Coding questions have an expected answer
                        </span>
                      </div>

                      <div className="flex items-start gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5 ${
                          isModuleSet ? "bg-[#dcfce7] text-[#166534]" : "bg-[#fee2e2] text-[#dc2626]"
                        }`}>
                          {isModuleSet ? "✓" : "✕"}
                        </span>
                        <span className="text-[#10292e] font-semibold">
                          Module is set (module_id)
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-2xl bg-[#fffbeb] border border-[#fef08a] space-y-0.5">
                      <span className="text-xs font-black text-[#92400e] block">
                        Question mix
                      </span>
                      <span className="font-mono text-xs text-[#b45309] block">
                        mcq 5 · coding 2 · short_answer 1
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowPublishModal(true)}
                      className="w-full py-3.5 rounded-full bg-[#ffa11f] hover:brightness-95 active:scale-[0.98] text-[#10292e] font-extrabold text-sm shadow-xs transition-all cursor-pointer"
                    >
                      Publish assessment
                    </button>
                  </section>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SUBTAB 2: SETTINGS TAB (Image 1) */}
            {/* ------------------------------------------------------------- */}
            {editorTab === "Settings" && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 animate-fadeIn">
                {/* Left Column: General & Scoring (8 cols) */}
                <div className="lg:col-span-8 space-y-6">
                  {/* General Card */}
                  <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs space-y-4">
                    <h3 className="text-lg font-black text-[#10292e]">General</h3>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <label className="text-xs font-bold text-[#10292e]">title</label>
                        <span className="bg-[#e6f7ec] text-[#1e7e34] text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                          Existing
                        </span>
                      </div>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-sm text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <label className="text-xs font-bold text-[#10292e]">description</label>
                        <span className="bg-[#e6f7ec] text-[#1e7e34] text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                          Existing
                        </span>
                      </div>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full rounded-2xl border border-[#d2dcd7] p-3 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f] resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <label className="text-xs font-bold text-[#10292e]">course_id</label>
                          <span className="bg-[#e6f7ec] text-[#1e7e34] text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                            Existing
                          </span>
                        </div>
                        <input
                          type="text"
                          value={courseName}
                          onChange={(e) => setCourseName(e.target.value)}
                          className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <label className="text-xs font-bold text-[#10292e]">module_id</label>
                          <span className="bg-[#e6f7ec] text-[#1e7e34] text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                            Existing
                          </span>
                        </div>
                        <input
                          type="text"
                          value={moduleName}
                          onChange={(e) => {
                            setModuleName(e.target.value);
                            setIsModuleSet(Boolean(e.target.value.trim()));
                          }}
                          className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                        />
                      </div>
                    </div>
                  </section>

                  {/* Scoring and source Card */}
                  <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs space-y-5">
                    <h3 className="text-lg font-black text-[#10292e]">Scoring and source</h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <label className="text-xs font-bold text-[#10292e]">total_points</label>
                          <span className="bg-[#e6f7ec] text-[#1e7e34] text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                            Existing
                          </span>
                        </div>
                        <input
                          type="number"
                          value={totalPoints}
                          onChange={(e) => setTotalPoints(Number(e.target.value))}
                          className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                        />
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <label className="text-xs font-bold text-[#10292e]">passing_score</label>
                          <span className="bg-[#e6f7ec] text-[#1e7e34] text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                            Existing
                          </span>
                        </div>
                        <input
                          type="number"
                          value={passingScore}
                          onChange={(e) => setPassingScore(Number(e.target.value))}
                          className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-xs font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                        />
                      </div>
                    </div>

                    {/* Toggle: Created with AI */}
                    <div className="p-4 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setCreatedWithAi(!createdWithAi)}
                          className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                            createdWithAi ? "bg-[#118a80]" : "bg-[#d2dcd7]"
                          }`}
                        >
                          <div
                            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                              createdWithAi ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <div>
                          <span className="text-xs font-black text-[#10292e] block">
                            Created with AI
                          </span>
                          <span className="font-mono text-[11px] text-[#5a6e70]">
                            generated_by_ai · set when questions come from the generator
                          </span>
                        </div>
                      </div>

                      <span className="bg-[#e6f7ec] text-[#1e7e34] text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                        Existing
                      </span>
                    </div>
                  </section>
                </div>

                {/* Right Column: Availability, Status, Danger Zone (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Availability Card (Image 1) */}
                  <section className="rounded-3xl border border-dashed border-[#f25c78] p-6 bg-white/60 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-[#10292e]">Availability</h4>
                      <span className="border border-dashed border-[#f25c78] text-[#f25c78] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                        Proposed
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5a6e70] font-medium">
                      These fields are not in the Assessment model yet.
                    </p>

                    <div>
                      <label className="text-[11px] font-mono text-[#5a6e70] block mb-1">
                        time_limit_minutes
                      </label>
                      <input
                        type="number"
                        value={timeLimitMinutes}
                        onChange={(e) => setTimeLimitMinutes(Number(e.target.value))}
                        className="w-full rounded-2xl border border-dashed border-[#f25c78] bg-[#fffaf0] px-3.5 py-2 text-xs font-bold text-[#10292e] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-[#5a6e70] block mb-1">
                        due_date
                      </label>
                      <input
                        type="text"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full rounded-2xl border border-dashed border-[#f25c78] bg-[#fffaf0] px-3.5 py-2 text-xs font-bold text-[#10292e] focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="text-[11px] font-mono text-[#5a6e70] block mb-1">
                        max_attempts
                      </label>
                      <input
                        type="number"
                        value={maxAttempts}
                        onChange={(e) => setMaxAttempts(Number(e.target.value))}
                        className="w-full rounded-2xl border border-dashed border-[#f25c78] bg-[#fffaf0] px-3.5 py-2 text-xs font-bold text-[#10292e] focus:outline-none"
                      />
                    </div>
                  </section>

                  {/* Status Card */}
                  <section className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-black text-[#10292e]">Status</h4>
                      <span className="bg-[#fff1d6] text-[#b87e00] text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                        draft
                      </span>
                    </div>
                    <p className="text-[11px] text-[#5a6e70] font-mono">
                      status: draft → published → archived
                    </p>

                    <button
                      type="button"
                      onClick={() => setShowPublishModal(true)}
                      className="w-full py-3 rounded-full bg-[#ffa11f] hover:brightness-95 active:scale-95 text-[#10292e] text-xs font-black transition-all shadow-xs cursor-pointer"
                    >
                      Publish assessment
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        toast.info("Assessment moved to archive.");
                        setViewMode("list");
                      }}
                      className="w-full py-2.5 rounded-full border-2 border-[#10292e] text-[#10292e] hover:bg-[#fafaf8] active:scale-95 text-xs font-black transition-all cursor-pointer"
                    >
                      Archive
                    </button>
                  </section>

                  {/* Danger zone Card */}
                  <section className="bg-white rounded-3xl p-6 border border-[#fecaca] shadow-xs space-y-3">
                    <h4 className="text-sm font-black text-[#dc2626]">Danger zone</h4>
                    <p className="text-[11px] text-[#5a6e70] leading-relaxed">
                      Delete removes the assessment and its questions. Archive keeps them.
                    </p>
                    <button
                      type="button"
                      onClick={handleDeleteAssessment}
                      className="w-full py-3 rounded-full bg-[#dc2626] hover:bg-[#b91c1c] active:scale-95 text-white text-xs font-black transition-all shadow-xs cursor-pointer"
                    >
                      Delete assessment
                    </button>
                  </section>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SUBTAB 3: PREVIEW TAB (Image 2) */}
            {/* ------------------------------------------------------------- */}
            {editorTab === "Preview" && (
              <div className="space-y-5 animate-fadeIn">
                {/* Yellow Preview Banner */}
                <div className="w-full bg-[#fffbeb] border border-[#fde68a] rounded-2xl px-5 py-3 text-xs sm:text-sm font-black text-[#92400e]">
                  Preview mode · this is what students see. Answers are not saved.
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
                  {/* Left Column: Student Questions View (8 cols) */}
                  <div className="lg:col-span-8 bg-white rounded-3xl p-7 border border-[#e8eeea] shadow-xs space-y-6">
                    <div>
                      <h2 className="text-2xl font-black text-[#10292e]">
                        {title}
                      </h2>
                      <p className="text-xs text-[#5a6e70] font-medium mt-1">
                        3 questions · {totalPoints} points · pass at {passingScore}
                      </p>
                    </div>

                    {/* Q1 in student preview */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-[#10292e]">
                          Q1 · Which keyword starts a loop over a range?
                        </span>
                        <span className="text-xs font-mono text-[#5a6e70] bg-[#f0f4f2] px-2.5 py-1 rounded-full">
                          10 pts
                        </span>
                      </div>

                      <div className="space-y-2">
                        {["for", "if", "def"].map((opt) => (
                          <div
                            key={opt}
                            onClick={() => setPreviewQ1Answer(opt)}
                            className={`p-3.5 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all ${
                              previewQ1Answer === opt
                                ? "border-2 border-[#ffa11f] bg-[#fffaf0]"
                                : "border-[#d2dcd7] bg-white hover:bg-[#fafaf8]"
                            }`}
                          >
                            <span
                              className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                previewQ1Answer === opt
                                  ? "border-[#ffa11f] bg-[#ffa11f]"
                                  : "border-[#83908f]"
                              }`}
                            >
                              {previewQ1Answer === opt && (
                                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </span>
                            <span className="text-xs font-extrabold text-[#10292e]">
                              {opt}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Q2 in student preview */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-[#10292e]">
                          Q2 · Write a loop that prints 1 to 5
                        </span>
                        <span className="text-xs font-mono text-[#5a6e70] bg-[#f0f4f2] px-2.5 py-1 rounded-full">
                          20 pts
                        </span>
                      </div>

                      <div className="p-4 bg-[#10292e] rounded-2xl font-mono text-xs text-[#7ccbf0] min-h-[100px]">
                        <span className="text-[#5a6e70] block mb-1">1  # Write your code here</span>
                        <textarea
                          value={previewQ2Code}
                          onChange={(e) => setPreviewQ2Code(e.target.value)}
                          placeholder="for i in range(1, 6):"
                          className="w-full bg-transparent text-[#7ccbf0] focus:outline-none resize-none"
                          rows={2}
                        />
                      </div>
                    </div>

                    {/* Q3 in student preview */}
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-extrabold text-[#10292e]">
                          Q3 · Why does a loop need an exit?
                        </span>
                        <span className="text-xs font-mono text-[#5a6e70] bg-[#f0f4f2] px-2.5 py-1 rounded-full">
                          10 pts
                        </span>
                      </div>

                      <textarea
                        value={previewQ3Text}
                        onChange={(e) => setPreviewQ3Text(e.target.value)}
                        placeholder="Type your answer..."
                        rows={3}
                        className="w-full rounded-2xl border border-[#d2dcd7] p-3 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f] resize-none"
                      />
                    </div>

                    {/* Student Action buttons */}
                    <div className="flex items-center justify-between pt-4 border-t border-[#f0f4f2]">
                      <button
                        type="button"
                        className="bg-white hover:bg-[#fafaf8] border-2 border-[#10292e] text-[#10292e] font-bold text-xs px-6 py-2.5 rounded-full"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        className="bg-[#d2dcd7] text-[#5a6e70] font-bold text-xs px-6 py-2.5 rounded-full cursor-not-allowed"
                      >
                        Submit
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Question navigator, Time limit, Scoring (4 cols) */}
                  <div className="lg:col-span-4 space-y-6">
                    {/* Question navigator */}
                    <section className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs space-y-3">
                      <h4 className="text-sm font-black text-[#10292e]">
                        Question navigator
                      </h4>
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full border-2 border-[#16a34a] text-[#16a34a] flex items-center justify-center font-black text-xs">
                          1
                        </span>
                        <span className="w-8 h-8 rounded-full bg-[#ffa11f] text-white flex items-center justify-center font-black text-xs">
                          2
                        </span>
                        <span className="w-8 h-8 rounded-full bg-[#f0f4f2] text-[#5a6e70] flex items-center justify-center font-black text-xs">
                          3
                        </span>
                      </div>
                      <p className="text-[11px] text-[#83908f] font-medium pt-1">
                        answered · current · not answered
                      </p>
                    </section>

                    {/* Time limit clock */}
                    <section className="rounded-3xl border border-dashed border-[#f25c78] p-6 bg-white/60 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#10292e]">Time limit</span>
                        <span className="border border-dashed border-[#f25c78] text-[#f25c78] text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                          Proposed
                        </span>
                      </div>
                      <div className="text-3xl font-black text-[#10292e] font-mono">
                        20:00
                      </div>
                      <p className="text-[11px] text-[#5a6e70]">
                        time_limit_minutes is not in the model yet.
                      </p>
                    </section>

                    {/* Scoring */}
                    <section className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs space-y-3">
                      <h4 className="text-sm font-black text-[#10292e]">Scoring</h4>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#5a6e70]">total_points</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-[#10292e]">{totalPoints}</span>
                          <span className="bg-[#e6f7ec] text-[#1e7e34] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                            Existing
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#5a6e70]">passing_score</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-black text-[#10292e]">{passingScore}</span>
                          <span className="bg-[#e6f7ec] text-[#1e7e34] text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full">
                            Existing
                          </span>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            )}

            {/* ------------------------------------------------------------- */}
            {/* SUBTAB 4: RESULTS TAB (Image 3) */}
            {/* ------------------------------------------------------------- */}
            {editorTab === "Results · proposed" && (
              <div className="space-y-6 animate-fadeIn">
                {/* Proposed Box */}
                <div className="rounded-3xl border border-dashed border-[#f25c78] p-5 bg-white/60 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="border border-dashed border-[#f25c78] text-[#f25c78] text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                      Proposed
                    </span>
                    <span className="text-xs font-black text-[#10292e]">
                      Needs the AssessmentSubmission collection
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#5a6e70]">
                    assessment_id, student_id, answers[], score, passed, submitted_at. All numbers on this page are mock data.
                  </p>
                </div>

                {/* 4 Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                  <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[120px]">
                    <div className="flex justify-between items-start">
                      <span className="text-3xl font-black text-[#10292e]">48</span>
                      <span className="text-[10px] font-mono text-[#83908f] bg-[#f0f4f2] px-2 py-0.5 rounded-full">mock</span>
                    </div>
                    <span className="text-xs text-[#5a6e70] font-bold">Submissions</span>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[120px]">
                    <div className="flex justify-between items-start">
                      <span className="text-3xl font-black text-[#10292e]">71%</span>
                      <span className="text-[10px] font-mono text-[#83908f] bg-[#f0f4f2] px-2 py-0.5 rounded-full">mock</span>
                    </div>
                    <span className="text-xs text-[#5a6e70] font-bold">Average score</span>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[120px]">
                    <div className="flex justify-between items-start">
                      <span className="text-3xl font-black text-[#10292e]">79%</span>
                      <span className="text-[10px] font-mono text-[#83908f] bg-[#f0f4f2] px-2 py-0.5 rounded-full">mock</span>
                    </div>
                    <span className="text-xs text-[#5a6e70] font-bold">Pass rate</span>
                  </div>

                  <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[120px]">
                    <div className="flex justify-between items-start">
                      <span className="text-3xl font-black text-[#10292e]">18 min</span>
                      <span className="text-[10px] font-mono text-[#83908f] bg-[#f0f4f2] px-2 py-0.5 rounded-full">mock</span>
                    </div>
                    <span className="text-xs text-[#5a6e70] font-bold">Average time</span>
                  </div>
                </div>

                {/* Score Distribution & Per-question accuracy */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
                  {/* Score distribution chart (6 cols) */}
                  <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs">
                    <h3 className="text-base font-black text-[#10292e] mb-6">
                      Score distribution
                    </h3>
                    <div className="h-44 flex items-end justify-between gap-3 px-4 pb-2 border-b border-[#f0f4f2]">
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <span className="text-[10px] font-bold text-[#10292e]">2</span>
                        <div className="w-full bg-[#ffa11f] rounded-t-lg" style={{ height: "18px" }} />
                        <span className="text-[10px] text-[#5a6e70] font-mono mt-1">0–20</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <span className="text-[10px] font-bold text-[#10292e]">4</span>
                        <div className="w-full bg-[#ffa11f] rounded-t-lg" style={{ height: "36px" }} />
                        <span className="text-[10px] text-[#5a6e70] font-mono mt-1">20–40</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <span className="text-[10px] font-bold text-[#10292e]">7</span>
                        <div className="w-full bg-[#ffa11f] rounded-t-lg" style={{ height: "64px" }} />
                        <span className="text-[10px] text-[#5a6e70] font-mono mt-1">40–60</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <span className="text-[10px] font-bold text-[#10292e]">19</span>
                        <div className="w-full bg-[#16a34a] rounded-t-lg" style={{ height: "135px" }} />
                        <span className="text-[10px] text-[#5a6e70] font-mono mt-1">60–80</span>
                      </div>
                      <div className="flex flex-col items-center gap-1.5 flex-1">
                        <span className="text-[10px] font-bold text-[#10292e]">16</span>
                        <div className="w-full bg-[#16a34a] rounded-t-lg" style={{ height: "115px" }} />
                        <span className="text-[10px] text-[#5a6e70] font-mono mt-1">80–100</span>
                      </div>
                    </div>
                  </div>

                  {/* Per-question accuracy (6 cols) */}
                  <div className="lg:col-span-6 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs space-y-5">
                    <h3 className="text-base font-black text-[#10292e]">
                      Per-question accuracy
                    </h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-xs font-black text-[#10292e] mb-1.5">
                          <span>Q1 · mcq</span>
                          <span>88%</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#f0f4f2] rounded-full overflow-hidden">
                          <div className="h-full bg-[#16a34a] rounded-full" style={{ width: "88%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-black text-[#10292e] mb-1.5">
                          <span>Q2 · coding</span>
                          <span>61%</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#f0f4f2] rounded-full overflow-hidden">
                          <div className="h-full bg-[#ffa11f] rounded-full" style={{ width: "61%" }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-black text-[#10292e] mb-1.5">
                          <span>Q3 · short_answer</span>
                          <span>72%</span>
                        </div>
                        <div className="w-full h-2.5 bg-[#f0f4f2] rounded-full overflow-hidden">
                          <div className="h-full bg-[#16a34a] rounded-full" style={{ width: "72%" }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Submissions Table matching Image 3 */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs">
                  <h3 className="text-base font-black text-[#10292e] mb-4">Submissions</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[#f0f4f2] text-[11px] font-extrabold uppercase tracking-wider text-[#5a6e70]">
                          <th className="pb-3 pr-4">STUDENT</th>
                          <th className="pb-3 px-4">SCORE</th>
                          <th className="pb-3 px-4">RESULT</th>
                          <th className="pb-3 px-4">SUBMITTED</th>
                          <th className="pb-3 pl-4 text-right">REVIEW</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f7faf8] text-xs">
                        {[
                          { name: "Layla A.", score: "82 / 100", result: "passed", date: "Oct 26, 10:14", action: "Graded" },
                          { name: "Omar K.", score: "54 / 100", result: "failed", date: "Oct 26, 09:50", action: "Review answers" },
                          { name: "Nour S.", score: "76 / 100", result: "passed", date: "Oct 25, 17:02", action: "Graded" },
                          { name: "Huda M.", score: "60 / 100", result: "passed", date: "Oct 25, 12:31", action: "Graded" },
                        ].map((sub) => (
                          <tr key={sub.name} className="hover:bg-[#fafaf8] transition-colors">
                            <td className="py-4 pr-4 font-black text-[#10292e]">{sub.name}</td>
                            <td className="py-4 px-4 font-mono font-bold text-[#10292e]">{sub.score}</td>
                            <td className="py-4 px-4">
                              <span
                                className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  sub.result === "passed" ? "bg-[#e6f7ec] text-[#1e7e34]" : "bg-[#fee2e2] text-[#dc2626]"
                                }`}
                              >
                                {sub.result}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-[#5a6e70]">{sub.date}</td>
                            <td className="py-4 pl-4 text-right">
                              {sub.action === "Review answers" ? (
                                <button
                                  type="button"
                                  onClick={() => toast.info(`Reviewing submission of ${sub.name}`)}
                                  className="border-2 border-[#10292e] px-3.5 py-1 rounded-full font-bold hover:bg-[#fafaf8]"
                                >
                                  Review answers
                                </button>
                              ) : (
                                <span className="text-[#83908f]">{sub.action}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* ========================================================================= */}
      {/* PUBLISH ASSESSMENT MODAL DIALOG (Matching Image 4) */}
      {/* ========================================================================= */}
      {showPublishModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-[#e8eeea] animate-scaleUp space-y-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-[#10292e]">
                Publish &ldquo;{title}&rdquo;?
              </h3>
              <p className="text-xs text-[#5a6e70] font-medium mt-1">
                It becomes visible to students once published.
              </p>
            </div>

            {/* Checklist */}
            <div className="space-y-2 text-xs pt-1">
              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="text-[#10292e] font-semibold">
                  total_points equals sum of question points
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="text-[#10292e] font-semibold">
                  passing_score ≤ total_points
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-[#fef3c7] text-[#b45309] flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                  !
                </span>
                <span className="text-[#10292e] font-semibold">
                  Every mcq has correct_answer in options
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-4 h-4 rounded-full bg-[#dcfce7] text-[#166534] flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5">
                  ✓
                </span>
                <span className="text-[#10292e] font-semibold">
                  Coding questions have an expected answer
                </span>
              </div>

              <div className="flex items-start gap-2.5">
                <span
                  className={`w-4 h-4 rounded-full flex items-center justify-center font-black text-[10px] shrink-0 mt-0.5 ${
                    isModuleSet && moduleName.trim()
                      ? "bg-[#dcfce7] text-[#166534]"
                      : "bg-[#fee2e2] text-[#dc2626]"
                  }`}
                >
                  {isModuleSet && moduleName.trim() ? "✓" : "✕"}
                </span>
                <span className="text-[#10292e] font-semibold">
                  Module is set (module_id)
                </span>
              </div>
            </div>

            {/* Error Banner when module not set matching Image 4 */}
            {(!isModuleSet || !moduleName.trim()) && (
              <div className="p-4 rounded-2xl bg-[#fee2e2]/70 border border-[#fca5a5] space-y-0.5 animate-fadeIn">
                <span className="text-xs font-black text-[#dc2626] block">
                  Select a module before publishing.
                </span>
                <span className="text-[11px] text-[#b91c1c] block">
                  Open Settings and choose module_id.
                </span>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-3">
              <button
                type="button"
                onClick={() => {
                  setShowPublishModal(false);
                  if (!isModuleSet || !moduleName.trim()) {
                    setEditorTab("Settings");
                  }
                }}
                className="py-2.5 px-6 rounded-full border-2 border-[#10292e] text-[#10292e] text-xs font-black hover:bg-[#fafaf8] cursor-pointer"
              >
                Back to editor
              </button>

              <button
                type="button"
                onClick={handlePublishAssessment}
                disabled={!isModuleSet || !moduleName.trim()}
                className={`py-2.5 px-6 rounded-full text-xs font-black transition-all cursor-pointer ${
                  isModuleSet && moduleName.trim()
                    ? "bg-[#0b6b63] hover:bg-[#084e48] text-white shadow-xs"
                    : "bg-[#d2dcd7] text-[#5a6e70] cursor-not-allowed"
                }`}
              >
                Publish
              </button>
            </div>

            {(!isModuleSet || !moduleName.trim()) && (
              <p className="text-[11px] text-[#83908f] font-medium text-center">
                Fix 1 issue to enable Publish.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function AssessmentsPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#fff8ec] flex items-center justify-center">
          <MangoIcon size={64} animated />
        </div>
      }
    >
      <AssessmentsMain />
    </Suspense>
  );
}
