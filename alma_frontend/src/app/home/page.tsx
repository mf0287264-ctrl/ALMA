"use client";

import React from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/app/_Context/AuthContext";
import { ArrowRight, Flame, Trophy, Award, CheckCircle2 } from "lucide-react";

export default function HomePage() {
  const { user } = useAuth();

  const firstName = user?.first_name || (user?.name ? user.name.split(" ")[0] : "Layla");
  const currentStreak = user?.current_streak ?? 4;
  const longestStreak = user?.longest_streak ?? 9;
  const lessonsCompleted = 12;

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 py-8 sm:py-10 overflow-y-auto pb-24 md:pb-10">
        {/* Top Header with Sample data badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              Hi, {firstName}
            </h1>
            <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
              ALMA: &ldquo;You&apos;re on a {currentStreak}-day streak. Let&apos;s pick up with Python for loops.&rdquo;{" "}
              <span className="text-[#8a999b] text-xs font-mono">(personalized_greeting)</span>
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono">
            <span className="text-[#8a999b]">Sample data</span>
            <span className="bg-[#e6f5f2] text-[#118a80] px-2.5 py-0.5 rounded-full font-semibold">
              Existing
            </span>
            <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] px-2.5 py-0.5 rounded-full font-semibold">
              Proposed
            </span>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 my-6">
          <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#8a999b] font-medium mb-1">
              <span>Current streak</span>
              <span className="bg-[#e6f5f2] text-[#118a80] px-2 py-0.5 rounded-full text-[10px] font-semibold">
                Existing
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#10292e]">
              {currentStreak} days
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#8a999b] font-medium mb-1">
              <span>Longest streak</span>
              <span className="bg-[#e6f5f2] text-[#118a80] px-2 py-0.5 rounded-full text-[10px] font-semibold">
                Existing
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#10292e]">
              {longestStreak} days
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#8a999b] font-medium mb-1">
              <span>Lessons completed</span>
              <span className="bg-[#e6f5f2] text-[#118a80] px-2 py-0.5 rounded-full text-[10px] font-semibold">
                Existing
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#10292e]">
              {lessonsCompleted}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border-2 border-dashed border-[#f4c8ce] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#8a999b] font-medium mb-1">
              <span>XP and level</span>
              <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] px-2 py-0.5 rounded-full text-[10px] font-semibold">
                Proposed
              </span>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#10292e]">
              &mdash;
            </div>
          </div>
        </div>

        {/* Row 2: Continue Learning Banner & Daily Goal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Continue Learning Dark Teal Card */}
          <div className="lg:col-span-2 bg-[#0f5953] rounded-3xl p-6 sm:p-7 text-white shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-emerald-200/90 text-xs font-semibold tracking-wider">
                Continue learning
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-2">
                Python for loops
              </h2>
              <p className="text-emerald-100/80 text-xs font-medium">
                Python Basics · Module 2 · session status: active
              </p>
            </div>

            <div className="mt-6">
              <div className="text-xs text-emerald-200/90 font-mono mb-2">
                Section 2 of 4 (current_section_order)
              </div>
              <div className="w-full bg-[#0a3f3b] h-2.5 rounded-full overflow-hidden flex">
                <div className="bg-[#ffa11f] h-full w-1/2 rounded-full transition-all" />
              </div>

              <div className="mt-5">
                <Link
                  href="/my-lessons/player"
                  className="inline-flex items-center gap-2 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-sm px-6 py-2.5 rounded-full shadow-sm transition-all"
                >
                  Resume lesson
                </Link>
              </div>
            </div>
          </div>

          {/* Daily Goal Card */}
          <div className="bg-white rounded-3xl p-6 border-2 border-dashed border-[#f4c8ce] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-[#8a999b] font-medium mb-2">
                <span className="font-bold text-[#10292e]">Daily goal</span>
                <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] px-2 py-0.5 rounded-full text-[10px] font-semibold">
                  Proposed
                </span>
              </div>
              <div className="text-4xl font-black text-[#10292e] my-3">
                3/4
              </div>
              <div className="w-full bg-[#f1f3f2] h-2.5 rounded-full overflow-hidden">
                <div className="bg-[#ffa11f] h-full w-3/4 rounded-full" />
              </div>
            </div>

            <p className="text-[11px] text-[#8a999b] leading-relaxed mt-4">
              Needs a goal setting. Could be derived from sessions completed per day.
            </p>
          </div>
        </div>

        {/* Row 3: Practice These & Recent Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Practice these list */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-lg text-[#10292e]">
                Practice these
              </h3>
              <span className="bg-[#e6f5f2] text-[#118a80] px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                Existing
              </span>
            </div>
            <p className="text-xs text-[#8a999b] font-mono mb-4">
              Student.struggling_concepts
            </p>

            <div className="space-y-4">
              {/* Concept 1 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#fafaf8] rounded-2xl border border-[#f0f0eb]">
                <div className="flex-1">
                  <div className="font-bold text-sm text-[#10292e]">
                    Zero-Based Indexing
                  </div>
                  <div className="text-xs text-[#8a999b] mt-0.5">
                    wrong 13 of 25 · last: Thinks range() starts at 1
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-28 bg-[#e8eeea] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#f25c78] h-full w-[52%]" />
                  </div>
                  <Link
                    href="/quize"
                    className="border border-[#10292e] text-[#10292e] hover:bg-[#10292e] hover:text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
                  >
                    Practice
                  </Link>
                </div>
              </div>

              {/* Concept 2 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#fafaf8] rounded-2xl border border-[#f0f0eb]">
                <div className="flex-1">
                  <div className="font-bold text-sm text-[#10292e]">
                    Loop stop condition
                  </div>
                  <div className="text-xs text-[#8a999b] mt-0.5">
                    wrong 9 of 24 · last: Forgets the exit condition
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-28 bg-[#e8eeea] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#f25c78] h-full w-[38%]" />
                  </div>
                  <Link
                    href="/quize"
                    className="border border-[#10292e] text-[#10292e] hover:bg-[#10292e] hover:text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
                  >
                    Practice
                  </Link>
                </div>
              </div>

              {/* Concept 3 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#fafaf8] rounded-2xl border border-[#f0f0eb]">
                <div className="flex-1">
                  <div className="font-bold text-sm text-[#10292e]">
                    Off-by-one in range()
                  </div>
                  <div className="text-xs text-[#8a999b] mt-0.5">
                    wrong 4 of 15 · last: Confuses stop value
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-28 bg-[#e8eeea] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#f25c78] h-full w-[26%]" />
                  </div>
                  <Link
                    href="/quize"
                    className="border border-[#10292e] text-[#10292e] hover:bg-[#10292e] hover:text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
                  >
                    Practice
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Recent achievements */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-lg text-[#10292e]">
                  Recent achievements
                </h3>
                <span className="bg-[#e6f5f2] text-[#118a80] px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                  Existing
                </span>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb]">
                  <div className="w-10 h-10 rounded-2xl bg-[#59b8eb] flex items-center justify-center text-white shrink-0">
                    <Flame className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-[#10292e]">
                      7-day streak
                    </div>
                    <div className="text-[11px] text-[#8a999b]">
                      streak · awarded_at Oct 28
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb]">
                  <div className="w-10 h-10 rounded-2xl bg-[#ffa11f] flex items-center justify-center text-white shrink-0">
                    <Award className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-[#10292e]">
                      First lesson
                    </div>
                    <div className="text-[11px] text-[#8a999b]">
                      learning · awarded_at Oct 12
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb]">
                  <div className="w-10 h-10 rounded-2xl bg-[#f25c78] flex items-center justify-center text-white shrink-0">
                    <Trophy className="w-5 h-5 fill-white" />
                  </div>
                  <div>
                    <div className="font-bold text-xs sm:text-sm text-[#10292e]">
                      Quiz master
                    </div>
                    <div className="text-[11px] text-[#8a999b]">
                      quiz · awarded_at Oct 20
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#f0f0eb]">
              <Link
                href="/achievements"
                className="text-xs font-bold text-[#118a80] hover:underline flex items-center gap-1"
              >
                View all achievements <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Row 4: Recent sessions */}
        <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-lg text-[#10292e]">
              Recent sessions
            </h3>
            <span className="bg-[#e6f5f2] text-[#118a80] px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
              Existing
            </span>
          </div>

          <div className="divide-y divide-[#f0f0eb]">
            <div className="py-3.5 flex items-center justify-between">
              <span className="font-bold text-sm text-[#10292e]">
                Python for loops
              </span>
              <div className="flex items-center gap-4 text-xs">
                <span className="bg-[#e6f5f2] text-[#118a80] px-2.5 py-0.5 rounded-full font-semibold">
                  active
                </span>
                <span className="text-[#8a999b]">Section 2 · today</span>
              </div>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span className="font-bold text-sm text-[#10292e]">
                If statements
              </span>
              <div className="flex items-center gap-4 text-xs">
                <span className="bg-[#e8eeea] text-[#607274] px-2.5 py-0.5 rounded-full font-semibold">
                  completed
                </span>
                <span className="text-[#8a999b]">Completed Oct 28</span>
              </div>
            </div>

            <div className="py-3.5 flex items-center justify-between">
              <span className="font-bold text-sm text-[#10292e]">
                Lists and indexing
              </span>
              <div className="flex items-center gap-4 text-xs">
                <span className="bg-[#fff0f3] text-[#f25c78] px-2.5 py-0.5 rounded-full font-semibold">
                  abandoned
                </span>
                <span className="text-[#8a999b]">Section 1 · Oct 20</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
