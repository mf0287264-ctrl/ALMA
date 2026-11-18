"use client";

import React, { use } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { Check, X } from "lucide-react";

export default function AssessmentResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const assessmentId = resolvedParams.id;

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 py-8 sm:py-10 overflow-y-auto pb-24 md:pb-10">
        {/* Header & Back Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              Your result
            </h1>
            <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
              Loops checkpoint · submitted today
            </p>
          </div>

          <Link
            href="/assessments"
            className="px-5 py-2.5 rounded-full bg-white border border-[#e8eeea] text-[#10292e] hover:bg-[#fafaf8] text-xs font-bold transition-colors self-start sm:self-auto shadow-xs"
          >
            Back to assessments
          </Link>
        </div>

        {/* Top Cards: Score & What to Practise Next */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
          {/* Left Score Card (Teal) (4 cols) */}
          <div className="lg:col-span-4 bg-[#118a80] text-white rounded-3xl p-7 flex flex-col justify-between shadow-sm min-h-[220px]">
            <div>
              <div className="text-4xl sm:text-5xl font-black tracking-tight mb-3">
                80 / 100
              </div>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                Passed · pass mark 60
              </span>
            </div>

            <div className="text-sm font-semibold text-emerald-100/90 mt-6">
              6 of 8 correct
            </div>
          </div>

          {/* Right Card: What to Practise Next (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs">
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-lg font-extrabold text-[#10292e]">
                What to practise next
              </h2>
              <span className="border border-[#ffa11f] text-[#ffa11f] bg-[#fffcf7] text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold">
                Student.struggling_concepts
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#fafaf8] rounded-2xl border border-[#f0f0eb]">
                <div>
                  <div className="font-extrabold text-sm text-[#10292e]">
                    Zero-Based Indexing
                  </div>
                  <div className="text-xs text-[#8a999b] mt-0.5">
                    Missed 2 of 3 · Thinks range(3) is 1 2 3
                  </div>
                </div>

                <Link
                  href="/my-lessons/player"
                  className="px-5 py-2 rounded-full border border-[#10292e] text-[#10292e] hover:bg-[#10292e] hover:text-white text-xs font-bold transition-colors self-start sm:self-auto"
                >
                  Review lesson
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#fafaf8] rounded-2xl border border-[#f0f0eb]">
                <div>
                  <div className="font-extrabold text-sm text-[#10292e]">
                    Loop conditions
                  </div>
                  <div className="text-xs text-[#8a999b] mt-0.5">
                    Missed 1 of 2 · Forgets the exit condition
                  </div>
                </div>

                <Link
                  href="/my-lessons/player"
                  className="px-5 py-2 rounded-full border border-[#10292e] text-[#10292e] hover:bg-[#10292e] hover:text-white text-xs font-bold transition-colors self-start sm:self-auto"
                >
                  Review lesson
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Feedback Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8eeea] shadow-xs space-y-4">
          <h2 className="text-xl font-extrabold text-[#10292e] mb-2">
            Detailed feedback
          </h2>

          <div className="space-y-3.5">
            {/* Q1 */}
            <div className="p-4 rounded-2xl border border-[#e8eeea] bg-white space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#118a80] text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs sm:text-sm text-[#10292e]">
                  Q1 · What does range(3) produce?
                </span>
              </div>
              <div className="font-mono text-xs text-[#118a80] pl-7">
                0 1 2
              </div>
              <div className="text-xs text-[#8a999b] pl-7">
                explanation: range stops before the stop value.
              </div>
            </div>

            {/* Q2 */}
            <div className="p-4 rounded-2xl border border-[#e8eeea] bg-white space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#118a80] text-white flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs sm:text-sm text-[#10292e]">
                  Q2 · Write a loop that prints 1 to 5
                </span>
              </div>
              <div className="font-mono text-xs text-[#118a80] pl-7">
                for i in range(1, 6): print(i)
              </div>
              <div className="text-xs text-[#8a999b] pl-7">
                explanation: Start at 1 and stop before 6.
              </div>
            </div>

            {/* Q3 (Wrong) */}
            <div className="p-4 rounded-2xl border border-[#f4c8ce] bg-[#fff0f3] space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#f25c78] text-white flex items-center justify-center shrink-0">
                  <X className="w-3.5 h-3.5" />
                </div>
                <span className="font-bold text-xs sm:text-sm text-[#10292e]">
                  Q3 · Why does a loop need an exit?
                </span>
              </div>
              <div className="text-xs text-[#607274] pl-7">
                Your answer: <span className="font-bold">&ldquo;To make it faster&rdquo;</span>
              </div>
              <div className="text-xs text-[#8a999b] pl-7">
                explanation: Correct idea: without an exit condition the loop never ends.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
