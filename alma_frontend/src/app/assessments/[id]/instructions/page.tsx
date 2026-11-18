"use client";

import React, { use } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function AssessmentInstructionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const assessmentId = resolvedParams.id;

  const assessmentTitle =
    assessmentId === "loops-checkpoint"
      ? "Loops checkpoint"
      : assessmentId === "lists-and-indexing"
      ? "Lists and indexing test"
      : "Variables quiz";

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {/* Title & Breadcrumb */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
            {assessmentTitle}
          </h1>
          <nav className="text-xs text-[#8a999b] mt-1 font-medium">
            <Link href="/assessments" className="hover:underline">
              Assessments
            </Link>{" "}
            &rsaquo; <span className="text-[#10292e]">Instructions</span>
          </nav>
        </div>

        {/* 2 Card Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-5xl">
          {/* Left Card: Before you start (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#e8eeea] shadow-xs space-y-6">
            <div>
              <h2 className="text-xl font-extrabold text-[#10292e]">
                Before you start
              </h2>
              <p className="text-xs sm:text-sm text-[#607274] mt-1">
                Read each question carefully. You can move between questions before you submit.
              </p>
            </div>

            <div className="space-y-3.5">
              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb]">
                <div className="w-6 h-6 rounded-full bg-[#118a80] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-[#10292e]">
                    8 questions
                  </div>
                  <div className="text-xs text-[#8a999b]">
                    Multiple choice, coding and short answer
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb]">
                <div className="w-6 h-6 rounded-full bg-[#118a80] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-[#10292e]">
                    100 points
                  </div>
                  <div className="text-xs text-[#8a999b] font-mono">
                    total_points
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb]">
                <div className="w-6 h-6 rounded-full bg-[#118a80] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-[#10292e]">
                    60 to pass
                  </div>
                  <div className="text-xs text-[#8a999b] font-mono">
                    passing_score
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb]">
                <div className="w-6 h-6 rounded-full bg-[#118a80] text-white flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-extrabold text-sm text-[#10292e]">
                    Answers are saved as you go
                  </div>
                  <div className="text-xs text-[#8a999b]">
                    Only your submitted answers count
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Card: Question types (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-8 border border-[#e8eeea] shadow-xs space-y-4">
            <h2 className="text-xl font-extrabold text-[#10292e]">
              Question types
            </h2>

            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl border border-[#e8eeea] bg-white">
                <div className="font-mono text-xs font-bold text-[#118a80]">
                  mcq
                </div>
                <div className="text-xs text-[#607274] mt-0.5">
                  Pick one answer
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-[#e8eeea] bg-white">
                <div className="font-mono text-xs font-bold text-[#118a80]">
                  coding
                </div>
                <div className="text-xs text-[#607274] mt-0.5">
                  Write a short piece of code
                </div>
              </div>

              <div className="p-3.5 rounded-2xl border border-[#e8eeea] bg-white">
                <div className="font-mono text-xs font-bold text-[#118a80]">
                  short_answer
                </div>
                <div className="text-xs text-[#607274] mt-0.5">
                  Explain in a sentence
                </div>
              </div>

              <div className="pt-2">
                <span className="inline-block border border-[#ffa11f] text-[#ffa11f] bg-[#fffcf7] px-3 py-1 rounded-full text-xs font-semibold">
                  Time limit · needs a duration field
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-8">
          <Link
            href={`/assessments/${assessmentId}/take`}
            className="px-7 py-3 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-sm shadow-xs transition-colors"
          >
            Start assessment
          </Link>
          <Link
            href="/assessments"
            className="px-6 py-3 rounded-full bg-white border border-[#e8eeea] text-[#10292e] hover:bg-[#fafaf8] font-bold text-sm transition-colors"
          >
            Back
          </Link>
        </div>
      </main>
    </div>
  );
}
