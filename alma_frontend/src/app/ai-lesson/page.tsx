"use client";

import React from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { Check, Sparkles, FileText, CheckSquare, BookOpen, ArrowRight } from "lucide-react";

export default function AILearningJourneyPage() {
  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 py-8 sm:py-10 overflow-y-auto pb-24 md:pb-10">
        {/* Title */}
        <div className="mb-6">
          <span className="text-[#118a80] text-[11px] font-black uppercase tracking-wider block mb-1">
            STUDENT WORKSPACE
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
            AI learning journey
          </h1>
          <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
            Made for your goals, your pace and the concepts you&apos;re practicing.
          </p>
        </div>

        {/* Dark Teal Hero Banner */}
        <div className="bg-[#0f5953] rounded-3xl p-6 sm:p-8 text-white shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <span className="text-[10px] font-black tracking-wider uppercase text-emerald-300 block mb-1">
              PERSONALIZED FOR LAYLA
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Python problem solver
            </h2>
            <p className="text-xs text-emerald-100/80 mt-1 mb-4">
              A visual, hands-on path to confident coding · 4 stages · 10 lessons
            </p>

            <div className="flex items-center gap-3 max-w-md">
              <div className="flex-1 bg-[#0a3f3b] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#ffa11f] h-full w-[60%] rounded-full" />
              </div>
              <span className="text-xs font-bold text-white shrink-0">
                6 / 10 lessons
              </span>
            </div>
          </div>

          <div>
            <Link
              href="/my-lessons/player"
              className="inline-flex items-center justify-center px-7 py-3 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-sm shadow-xs transition-colors"
            >
              Continue learning
            </Link>
          </div>
        </div>

        {/* 2 Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
          {/* Left Column: Your learning path (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-lg text-[#10292e]">
                Your learning path
              </h3>
              <p className="text-xs text-[#8a999b]">
                A clear next step, every time you learn
              </p>
            </div>

            <div className="space-y-3 pt-2">
              {/* Step 1 */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb]">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#e6f5f2] text-[#118a80] flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-[#10292e]">
                      Build your foundations
                    </div>
                    <div className="text-xs text-[#8a999b]">
                      Variables &amp; types · 3 lessons completed
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#8a999b]">
                  Completed
                </span>
              </div>

              {/* Step 2 */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb]">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#e6f5f2] text-[#118a80] flex items-center justify-center shrink-0">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-[#10292e]">
                      Make decisions
                    </div>
                    <div className="text-xs text-[#8a999b]">
                      If statements · 2 lessons completed
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#8a999b]">
                  Completed
                </span>
              </div>

              {/* Step 3 (In progress) */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fffcf7] border-2 border-[#ffa11f] shadow-xs">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#ffa11f] text-[#10292e] font-black text-xs flex items-center justify-center shrink-0">
                    3
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-[#10292e]">
                      Think in loops
                    </div>
                    <div className="text-xs text-[#8a999b]">
                      Python for loops · 1 of 3 lessons completed
                    </div>
                  </div>
                </div>
                <span className="text-xs font-extrabold text-[#ffa11f]">
                  In progress
                </span>
              </div>

              {/* Step 4 */}
              <div className="flex items-center justify-between p-4 rounded-2xl bg-white border border-[#e8eeea]">
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-full bg-[#f1f3f2] text-[#8a999b] font-black text-xs flex items-center justify-center shrink-0">
                    4
                  </div>
                  <div>
                    <div className="font-extrabold text-sm text-[#10292e]">
                      Work with data
                    </div>
                    <div className="text-xs text-[#8a999b]">
                      Lists &amp; indexing · 2 lessons up next
                    </div>
                  </div>
                </div>
                <span className="text-xs font-semibold text-[#8a999b]">
                  Up next
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Recommendations (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Made for your next step */}
            <div className="bg-[#fff9ea] rounded-3xl p-6 border border-[#fae2b8] shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-[#10292e] font-extrabold text-sm">
                <Sparkles className="w-4 h-4 text-[#ffa11f]" />
                <span>Made for your next step</span>
              </div>

              <div>
                <h4 className="font-black text-lg text-[#10292e]">
                  Start counting at zero
                </h4>
                <p className="text-xs text-[#607274] mt-1 leading-relaxed">
                  Indexing needs a little more practice: 13 of 25 answers missed in your recent attempts.
                </p>
              </div>

              <div className="text-[11px] text-[#8a999b] font-medium pt-1">
                Visual explanation · 7 min · AI generated
              </div>

              <div className="pt-2">
                <Link
                  href="/teachers"
                  className="text-xs font-extrabold text-[#118a80] hover:underline flex items-center gap-1"
                >
                  Ask my teacher about this &rarr;
                </Link>
              </div>
            </div>

            {/* A little focus goes a long way */}
            <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs space-y-3">
              <h4 className="font-extrabold text-base text-[#10292e]">
                A little focus goes a long way
              </h4>

              <div className="space-y-2.5 text-xs font-medium text-[#10292e]">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#8a999b] text-[11px]">01</span>
                  <span>Review zero-based indexing</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#8a999b] text-[11px]">02</span>
                  <span>Practice loop stop conditions</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[#8a999b] text-[11px]">03</span>
                  <span>Finish your current lesson</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Your AI study kit */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8eeea] shadow-xs space-y-5">
          <div>
            <h3 className="font-extrabold text-lg text-[#10292e]">
              Your AI study kit
            </h3>
            <p className="text-xs text-[#8a999b]">
              Short, focused materials for the concepts you&apos;re learning now.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Study item 1 */}
            <Link
              href="/my-lessons/player"
              className="p-5 rounded-2xl bg-[#e9f4fb] border border-[#d2e8f8] hover:border-[#2b88d8] transition-colors block"
            >
              <div className="flex items-center gap-2 font-extrabold text-xs text-[#10292e]">
                <FileText className="w-4 h-4 text-[#2b88d8]" />
                <span>Visual lesson</span>
              </div>
              <div className="text-xs text-[#607274] mt-2">
                Zero-based indexing · 7 min
              </div>
            </Link>

            {/* Study item 2 */}
            <Link
              href="/quize"
              className="p-5 rounded-2xl bg-[#fff9ea] border border-[#fae2b8] hover:border-[#ffa11f] transition-colors block"
            >
              <div className="flex items-center gap-2 font-extrabold text-xs text-[#10292e]">
                <CheckSquare className="w-4 h-4 text-[#ffa11f]" />
                <span>Practice questions</span>
              </div>
              <div className="text-xs text-[#607274] mt-2">
                Loop boundaries · 5 questions
              </div>
            </Link>

            {/* Study item 3 */}
            <Link
              href="/courses/intro-to-python"
              className="p-5 rounded-2xl bg-[#e6f5f2] border border-[#d2ede7] hover:border-[#118a80] transition-colors block"
            >
              <div className="flex items-center gap-2 font-extrabold text-xs text-[#10292e]">
                <BookOpen className="w-4 h-4 text-[#118a80]" />
                <span>Quick revision notes</span>
              </div>
              <div className="text-xs text-[#607274] mt-2">
                range() essentials · 2 min
              </div>
            </Link>
          </div>

          <p className="text-[11px] text-[#8a999b] pt-2">
            Example AI plan · Recommendations use the concepts already shown in your learning history
          </p>
        </div>
      </main>
    </div>
  );
}
