"use client";

import React, { useState } from "react";
import TeacherSidebar from "@/components/TeacherSidebar";
import { toast } from "sonner";
import api from "@/services/api";

type GenerationStep =
  | "queued"
  | "outline"
  | "sections"
  | "bridges"
  | "intro_conclusion"
  | "practice"
  | "segmenting"
  | "validating";

const STEPS: GenerationStep[] = [
  "queued",
  "outline",
  "sections",
  "bridges",
  "intro_conclusion",
  "practice",
  "segmenting",
  "validating",
];

export default function AiLessonGenerationPage() {
  // Form states matching Card 1
  const [course, setCourse] = useState("Intro to Python");
  const [moduleName, setModuleName] = useState("Module 3 · Loops");
  const [topic, setTopic] = useState("Python for loops");
  const [language, setLanguage] = useState("Python");
  const [gradeLevel, setGradeLevel] = useState("Grade 8");
  const [objectives, setObjectives] = useState("Use range() in a for loop; trace output");
  const [difficulty, setDifficulty] = useState("Beginner");
  const [duration, setDuration] = useState("15 min");

  // Job progress state matching Card 2
  const [jobId, setJobId] = useState("job_8f2a");
  const [progressPercent, setProgressPercent] = useState(0.38);
  const [stepMessage, setStepMessage] = useState("Writing section 3 of 5...");
  const [currentStep, setCurrentStep] = useState<GenerationStep>("sections");
  const [jobStatus, setJobStatus] = useState<"processing" | "failed" | "completed" | "empty">("processing");
  const [isGenerating, setIsGenerating] = useState(false);

  // Review draft state matching Card 3
  const [activeOutlineSection, setActiveOutlineSection] = useState<number>(0);
  const [draftState, setDraftState] = useState<"AWAITING_REVIEW" | "APPROVED" | "REJECTED">("AWAITING_REVIEW");

  const handleStartGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error("Please enter a lesson topic");
      return;
    }

    setIsGenerating(true);
    setJobStatus("processing");
    setCurrentStep("queued");
    setProgressPercent(0.1);
    setStepMessage("Generation queued in MongoDB...");

    try {
      const res = await api
        .post("/lesson-generations", {
          topic: topic.trim(),
          programming_language: language,
          grade_level: gradeLevel,
          model: "gemini-3.5-flash-lite",
        })
        .catch(() => null);

      if (res?.data?.data?.job_id) {
        setJobId(res.data.data.job_id);
      }

      setTimeout(() => {
        setCurrentStep("outline");
        setProgressPercent(0.25);
        setStepMessage("Drafting structured lesson outline...");
      }, 700);

      setTimeout(() => {
        setCurrentStep("sections");
        setProgressPercent(0.5);
        setStepMessage("Writing section 3 of 5: range() and counting...");
      }, 1500);

      setTimeout(() => {
        setCurrentStep("bridges");
        setProgressPercent(0.7);
        setStepMessage("Generating transitional bridges & narration chunks...");
      }, 2300);

      setTimeout(() => {
        setCurrentStep("validating");
        setProgressPercent(1.0);
        setStepMessage("Validating misconceptions schema & test cases...");
        setJobStatus("completed");
        setIsGenerating(false);
        setDraftState("AWAITING_REVIEW");
        toast.success(`Generated draft v1 for "${topic.trim()}"!`);
      }, 3100);
    } catch {
      setJobStatus("failed");
      setIsGenerating(false);
      toast.error("Generation failed. Retry available.");
    }
  };

  const handleApproveDraft = () => {
    setDraftState("APPROVED");
    toast.success("Draft v1 approved! Lesson published to students.");
  };

  const handleRejectDraft = () => {
    setDraftState("REJECTED");
    toast.warning("Draft v1 rejected. Sent back for revisions.");
  };

  const handleRegenerate = () => {
    toast.info("Regenerating new draft with adaptive adjustments...");
    setTimeout(() => {
      setDraftState("AWAITING_REVIEW");
      toast.success("New iteration v2 generated for review!");
    }, 1200);
  };

  return (
    <div className="w-full min-h-screen bg-[#fff8ec] flex">
      {/* Fixed Teacher Sidebar */}
      <TeacherSidebar />

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 p-6 sm:p-10 lg:p-12 pt-20 lg:pt-10 overflow-y-auto">
        {/* Page Header matching Image 1 */}
        <div className="mb-7">
          <h1 className="text-3xl sm:text-4xl font-black text-[#10292e] tracking-tight">
            AI Lesson Generation
          </h1>
          <p className="text-xs sm:text-sm text-[#5a6e70] font-medium mt-1">
            Create a lesson draft, then review it before approval · <code className="font-mono text-[#118a80]">POST /lessons/generate (proposed)</code>
          </p>
        </div>

        {/* 2-Column Grid matching Image 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
          {/* ========================================================================= */}
          {/* Card 1: Lesson request (5 cols) */}
          {/* ========================================================================= */}
          <section className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs flex flex-col justify-between">
            <div>
              <h2 className="text-lg font-black text-[#10292e] mb-5">
                1 · Lesson request
              </h2>

              <form onSubmit={handleStartGeneration} className="space-y-4">
                {/* Course */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#10292e]">
                      Course
                    </label>
                    <span className="font-mono text-[10px] text-[#5a6e70] bg-[#f0f4f2] px-2 py-0.5 rounded-md">
                      course_id
                    </span>
                  </div>
                  <input
                    type="text"
                    value={course}
                    onChange={(e) => setCourse(e.target.value)}
                    className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-xs sm:text-sm text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                  />
                </div>

                {/* Module */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#10292e]">
                      Module
                    </label>
                    <span className="font-mono text-[10px] text-[#5a6e70] bg-[#f0f4f2] px-2 py-0.5 rounded-md">
                      module_id
                    </span>
                  </div>
                  <input
                    type="text"
                    value={moduleName}
                    onChange={(e) => setModuleName(e.target.value)}
                    className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-xs sm:text-sm text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                  />
                </div>

                {/* Topic (highlighted orange border) */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#10292e]">
                      Topic
                    </label>
                    <span className="font-mono text-[10px] text-[#5a6e70] bg-[#f0f4f2] px-2 py-0.5 rounded-md">
                      topic
                    </span>
                  </div>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    className="w-full rounded-2xl border-2 border-[#ffa11f] bg-[#fffaf0] px-4 py-2.5 text-xs sm:text-sm font-extrabold text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                  />
                </div>

                {/* Language & Grade Level (2 Cols) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#10292e]">
                        Language
                      </label>
                      <span className="font-mono text-[9px] text-[#5a6e70] bg-[#f0f4f2] px-1.5 py-0.5 rounded-md">
                        programming_lan
                      </span>
                    </div>
                    <input
                      type="text"
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full rounded-2xl border border-[#d2dcd7] px-3.5 py-2.5 text-xs sm:text-sm text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#10292e]">
                        Grade
                      </label>
                      <span className="font-mono text-[9px] text-[#5a6e70] bg-[#f0f4f2] px-1.5 py-0.5 rounded-md">
                        grade_level
                      </span>
                    </div>
                    <input
                      type="text"
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      className="w-full rounded-2xl border border-[#d2dcd7] px-3.5 py-2.5 text-xs sm:text-sm text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                    />
                  </div>
                </div>

                {/* Learning Objectives */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-[#10292e]">
                      Learning objectives
                    </label>
                    <span className="bg-[#fff1d6] text-[#b87e00] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                      PROPOSED
                    </span>
                  </div>
                  <input
                    type="text"
                    value={objectives}
                    onChange={(e) => setObjectives(e.target.value)}
                    className="w-full rounded-2xl border border-[#d2dcd7] bg-[#f7faf8] px-4 py-2.5 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                  />
                </div>

                {/* Difficulty & Duration (2 Cols) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#10292e]">
                        Difficulty
                      </label>
                      <span className="bg-[#fff1d6] text-[#b87e00] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                        PROPOSED
                      </span>
                    </div>
                    <input
                      type="text"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full rounded-2xl border border-[#d2dcd7] bg-[#f7faf8] px-3.5 py-2.5 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-[#10292e]">
                        Duration
                      </label>
                      <span className="bg-[#fff1d6] text-[#b87e00] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                        PROPOSED
                      </span>
                    </div>
                    <input
                      type="text"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="w-full rounded-2xl border border-[#d2dcd7] bg-[#f7faf8] px-3.5 py-2.5 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                    />
                  </div>
                </div>

                {/* Generate Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="w-full py-3.5 rounded-full bg-[#ffa11f] hover:brightness-95 active:scale-[0.98] text-[#10292e] font-extrabold text-sm shadow-xs transition-all disabled:opacity-60 cursor-pointer"
                  >
                    {isGenerating ? "Generating draft..." : "Generate lesson"}
                  </button>
                </div>
              </form>
            </div>
          </section>

          {/* ========================================================================= */}
          {/* Right Column: Card 2 & Card 3 (7 cols) */}
          {/* ========================================================================= */}
          <div className="lg:col-span-7 space-y-7">
            {/* Card 2: Generation progress */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-black text-[#10292e]">
                  2 · Generation progress
                </h2>
                <span className="font-mono text-xs text-[#5a6e70] bg-[#f0f4f2] px-2.5 py-1 rounded-md">
                  GET /jobs/{jobId} - {progressPercent.toFixed(2)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2.5 bg-[#f0f4f2] rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-[#ffa11f] rounded-full transition-all duration-500"
                  style={{ width: `${Math.round(progressPercent * 100)}%` }}
                />
              </div>

              <p className="text-xs font-mono text-[#5a6e70] mb-4">
                step_message: {stepMessage}
              </p>

              {/* Step Dots Row matching Image 1 */}
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-bold text-[#5a6e70]">
                {STEPS.map((step, idx) => {
                  const stepIndex = STEPS.indexOf(currentStep);
                  const isDone = idx < stepIndex;
                  const isCurrent = idx === stepIndex;

                  return (
                    <div key={step} className="flex items-center gap-1.5">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          isDone
                            ? "bg-[#16a34a]"
                            : isCurrent
                            ? "bg-[#ffa11f] ring-2 ring-[#ffa11f]/30"
                            : "bg-[#d2dcd7]"
                        }`}
                      />
                      <span className={isCurrent ? "font-black text-[#10292e]" : ""}>
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Status pills at bottom */}
              <div className="flex items-center gap-2 mt-5 pt-3 border-t border-[#f0f4f2]">
                <button
                  type="button"
                  onClick={() => toast.error("Error simulation: Model timeout. Clicked Retry.")}
                  className="bg-[#fee2e2] text-[#dc2626] text-[10px] font-black px-2.5 py-1 rounded-md hover:bg-red-200 transition-colors"
                >
                  Failed: shows error + Retry
                </button>
                <button
                  type="button"
                  onClick={() => toast.info("Reset to empty state.")}
                  className="bg-[#f0f4f2] text-[#5a6e70] text-[10px] font-black px-2.5 py-1 rounded-md hover:bg-[#e2e8e4] transition-colors"
                >
                  Empty: no job yet
                </button>
              </div>
            </section>

            {/* Card 3: Review draft · v1 */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-[#10292e]">
                  3 · Review draft · v1
                </h2>
                <span
                  className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    draftState === "APPROVED"
                      ? "bg-[#e6f7ec] text-[#1e7e34]"
                      : draftState === "REJECTED"
                      ? "bg-[#fde8ec] text-[#d63384]"
                      : "bg-[#fff1d6] text-[#b87e00]"
                  }`}
                >
                  {draftState}
                </span>
              </div>

              {/* Inside Layout: Sections outline (Left) & Preview (Right) */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 mb-5">
                {/* Outline Sections (5 cols) */}
                <div className="md:col-span-5 space-y-2 text-xs">
                  {[
                    { title: "Introduction", detail: "paragraph, callout" },
                    { title: "1 · What is a loop?", detail: "diagnostic check" },
                    { title: "2 · range() basics", detail: "check + remediation" },
                    { title: "Conclusion", detail: "" },
                  ].map((sec, idx) => (
                    <button
                      key={sec.title}
                      type="button"
                      onClick={() => setActiveOutlineSection(idx)}
                      className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                        activeOutlineSection === idx
                          ? "border-2 border-[#ffa11f] bg-[#fffaf0] text-[#10292e] font-black"
                          : "border-[#e8eeea] text-[#5a6e70] hover:bg-[#fafaf8]"
                      }`}
                    >
                      <span className="block">{sec.title}</span>
                      {sec.detail && (
                        <span className="text-[10px] text-[#83908f] font-normal block mt-0.5">
                          {sec.detail}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Section Preview (7 cols) */}
                <div className="md:col-span-7 space-y-3">
                  {/* Code block */}
                  <div className="p-3.5 bg-[#10292e] text-[#7ccbf0] rounded-2xl font-mono text-xs leading-relaxed">
                    for i in range(3):<br />
                    &nbsp;&nbsp;&nbsp;&nbsp;print(i)
                  </div>

                  {/* Checkpoint box */}
                  <div className="p-4 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] space-y-2">
                    <span className="text-xs font-black text-[#10292e] block">
                      Checkpoint · diagnostic_check
                    </span>
                    <div className="space-y-1 text-xs">
                      <div className="text-[#16a34a] font-bold">✓ 0 1 2</div>
                      <div className="text-[#dc2626] font-medium text-[11px]">
                        1 2 3 → misconception: &ldquo;range is 1-indexed&rdquo;
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#83908f] font-mono">
                    12 speech segments · est. 9 min
                  </p>
                </div>
              </div>

              {/* Bottom Actions matching Image 1 */}
              <div className="flex flex-wrap items-center gap-2.5 pt-3 border-t border-[#f0f4f2]">
                <button
                  type="button"
                  onClick={handleApproveDraft}
                  className="bg-[#0b6b63] hover:bg-[#084e48] active:scale-95 text-white font-extrabold text-xs px-5 py-2.5 rounded-full transition-all cursor-pointer shadow-xs"
                >
                  Approve v1
                </button>

                <button
                  type="button"
                  onClick={() => toast.info("Request changes prompt opened")}
                  className="bg-white hover:bg-[#fafaf8] active:scale-95 border-2 border-[#10292e] text-[#10292e] font-bold text-xs px-5 py-2 rounded-full transition-all cursor-pointer"
                >
                  Request changes
                </button>

                <button
                  type="button"
                  onClick={handleRejectDraft}
                  className="bg-white hover:bg-[#fafaf8] active:scale-95 border-2 border-[#10292e] text-[#10292e] font-bold text-xs px-5 py-2 rounded-full transition-all cursor-pointer"
                >
                  Reject
                </button>

                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="bg-white hover:bg-[#fafaf8] active:scale-95 border-2 border-[#10292e] text-[#10292e] font-bold text-xs px-5 py-2 rounded-full transition-all cursor-pointer"
                >
                  Regenerate
                </button>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
