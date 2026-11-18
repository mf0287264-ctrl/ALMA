"use client";

import React, { use } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { CheckCircle2, Circle, Lock, ArrowRight } from "lucide-react";

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {/* Header and Continue action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              Intro to Python
            </h1>
            <nav className="text-xs text-[#8a999b] mt-1 font-medium">
              <Link href="/courses" className="hover:underline">
                Courses
              </Link>{" "}
              &rsaquo; <span className="text-[#10292e]">Intro to Python</span>
            </nav>
          </div>

          <Link
            href="/my-lessons/player"
            className="inline-flex items-center justify-center bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-sm px-6 py-2.5 rounded-full shadow-sm transition-all self-start sm:self-auto"
          >
            Continue: Loops, part 3
          </Link>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Left: About & Modules */}
          <div className="lg:col-span-2 space-y-6">
            {/* About Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
              <h2 className="text-lg font-extrabold text-[#10292e] mb-2">
                About this course
              </h2>
              <p className="text-xs sm:text-sm text-[#607274] leading-relaxed mb-4">
                Learn Python from zero: variables, conditions, loops and functions, with an AI tutor that
                adapts to the mistakes you make.
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="bg-[#e9f4fb] text-[#2b88d8] text-xs font-semibold px-3 py-1 rounded-full">
                  Computer Science
                </span>
                <span className="bg-[#e9f4fb] text-[#2b88d8] text-xs font-semibold px-3 py-1 rounded-full">
                  Grade 8
                </span>
                <span className="bg-[#e9f4fb] text-[#2b88d8] text-xs font-semibold px-3 py-1 rounded-full">
                  General curriculum
                </span>
                <span className="bg-[#e9f4fb] text-[#2b88d8] text-xs font-semibold px-3 py-1 rounded-full">
                  English
                </span>
              </div>

              {/* Progress */}
              <div>
                <div className="w-full bg-[#f1f3f2] h-2.5 rounded-full overflow-hidden mb-1.5">
                  <div className="bg-[#ffa11f] h-full w-2/3 rounded-full" />
                </div>
                <div className="text-[11px] text-[#8a999b] font-medium text-right">
                  4 of 6 modules · derived from lesson sessions
                </div>
              </div>
            </div>

            {/* Modules List */}
            <div className="space-y-4">
              <h2 className="text-lg font-extrabold text-[#10292e]">Modules</h2>

              {/* Module 1 */}
              <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-base text-[#10292e]">
                    1 · Getting started
                  </h3>
                  <span className="bg-[#e6f5f2] text-[#118a80] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    completed
                  </span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm text-[#607274]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#118a80]" />
                    <span>Hello, Python</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#118a80]" />
                    <span>Variables and types</span>
                  </div>
                </div>
              </div>

              {/* Module 2 */}
              <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-base text-[#10292e]">
                    2 · Making decisions
                  </h3>
                  <span className="bg-[#e6f5f2] text-[#118a80] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    completed
                  </span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm text-[#607274]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#118a80]" />
                    <span>If statements</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#118a80]" />
                    <span>Comparing values</span>
                  </div>
                </div>
              </div>

              {/* Module 3 (Current) */}
              <div className="bg-white rounded-3xl p-6 border-2 border-[#ffa11f] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-base text-[#10292e]">
                    3 · Loops
                  </h3>
                  <span className="bg-[#fff5e6] text-[#ffa11f] text-xs font-bold px-2.5 py-0.5 rounded-full">
                    current
                  </span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm text-[#10292e]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#118a80]" />
                    <span>for loops</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#118a80]" />
                    <span>range() and counting</span>
                  </div>
                  <div className="flex items-center gap-2.5 font-bold text-[#ffa11f]">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#ffa11f]" />
                    <span>Loops, part 3</span>
                  </div>
                </div>
              </div>

              {/* Module 4 (Locked) */}
              <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs opacity-75">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-extrabold text-base text-[#8a999b]">
                    4 · Functions
                  </h3>
                  <span className="bg-[#f0f0eb] text-[#8a999b] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    locked
                  </span>
                </div>
                <div className="space-y-2 text-xs sm:text-sm text-[#8a999b]">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d0d0cb]" />
                    <span>Defining functions</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#d0d0cb]" />
                    <span>Return values</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Objectives & Assessments */}
          <div className="space-y-6">
            {/* Learning Objectives */}
            <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-base text-[#10292e]">
                  Learning objectives
                </h3>
                <span className="bg-[#fff5e6] text-[#ffa11f] text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold">
                  Module.learn
                </span>
              </div>

              <ul className="space-y-3 text-xs sm:text-sm text-[#607274]">
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffa11f] mt-1.5 shrink-0" />
                  <span>Use range() in a for loop</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffa11f] mt-1.5 shrink-0" />
                  <span>Trace loop output line by line</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ffa11f] mt-1.5 shrink-0" />
                  <span>Avoid off-by-one mistakes</span>
                </li>
              </ul>
            </div>

            {/* Assessments */}
            <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
              <h3 className="font-extrabold text-base text-[#10292e] mb-4">
                Assessments
              </h3>

              <div className="space-y-3">
                <Link
                  href="/assessments/variables-quiz/result"
                  className="block p-4 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb] hover:border-[#118a80] transition-colors"
                >
                  <div className="font-bold text-sm text-[#10292e]">
                    Variables quiz
                  </div>
                  <div className="text-xs text-[#118a80] font-semibold mt-1">
                    Passed · 90
                  </div>
                </Link>

                <Link
                  href="/assessments/loops-checkpoint/instructions"
                  className="block p-4 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb] hover:border-[#ffa11f] transition-colors"
                >
                  <div className="font-bold text-sm text-[#10292e]">
                    Loops checkpoint
                  </div>
                  <div className="text-xs text-[#ffa11f] font-semibold mt-1">
                    Available
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
