"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Award, Flame, Trophy, Sparkles, HelpCircle, RefreshCw } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  category: "learning" | "streak" | "quiz" | "General";
  date: string;
  color: string;
  icon: React.ElementType;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first-lesson",
    title: "First lesson",
    description: "Finished your first lesson",
    category: "learning",
    date: "awarded_at Oct 12",
    color: "bg-[#ffa11f]",
    icon: Award,
  },
  {
    id: "7-day-streak",
    title: "7-day streak",
    description: "Learned 7 days in a row",
    category: "streak",
    date: "awarded_at Oct 28",
    color: "bg-[#59b8eb]",
    icon: Flame,
  },
  {
    id: "quiz-master",
    title: "Quiz master",
    description: "Scored well on a quiz",
    category: "quiz",
    date: "awarded_at Oct 20",
    color: "bg-[#f25c78]",
    icon: Trophy,
  },
  {
    id: "loop-explorer",
    title: "Loop explorer",
    description: "Completed the loops module",
    category: "learning",
    date: "awarded_at Nov 2",
    color: "bg-[#ffd84a]",
    icon: Sparkles,
  },
  {
    id: "curious-mind",
    title: "Curious mind",
    description: "Asked ALMA 10 questions",
    category: "General",
    date: "awarded_at Nov 4",
    color: "bg-[#0f5953]",
    icon: HelpCircle,
  },
  {
    id: "comeback",
    title: "Comeback",
    description: "Returned after a break",
    category: "streak",
    date: "awarded_at Nov 6",
    color: "bg-[#ffa11f]",
    icon: RefreshCw,
  },
];

export default function AchievementsPage() {
  const [filter, setFilter] = useState<string>("All");

  const filtered = ACHIEVEMENTS.filter((a) => {
    if (filter === "All") return true;
    return a.category.toLowerCase() === filter.toLowerCase();
  });

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              Achievements
            </h1>
            <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
              Awarded achievements from the Achievement model.
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 mb-8">
          <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#8a999b] font-medium mb-1">
              <span>Earned</span>
              <span className="bg-[#e6f5f2] text-[#118a80] px-2 py-0.5 rounded-full text-[10px] font-semibold">
                Existing
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-[#10292e]">7</div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#8a999b] font-medium mb-1">
              <span>Categories</span>
              <span className="bg-[#e6f5f2] text-[#118a80] px-2 py-0.5 rounded-full text-[10px] font-semibold">
                Existing
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-[#10292e]">3</div>
          </div>

          <div className="bg-white rounded-3xl p-5 border-2 border-dashed border-[#f4c8ce] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#8a999b] font-medium mb-1">
              <span>Locked</span>
              <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] px-2 py-0.5 rounded-full text-[10px] font-semibold">
                Proposed
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-[#10292e]">&mdash;</div>
          </div>

          <div className="bg-white rounded-3xl p-5 border-2 border-dashed border-[#f4c8ce] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#8a999b] font-medium mb-1">
              <span>Next goal</span>
              <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] px-2 py-0.5 rounded-full text-[10px] font-semibold">
                Proposed
              </span>
            </div>
            <div className="text-3xl sm:text-4xl font-black text-[#10292e]">&mdash;</div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 flex-wrap mb-6">
          {["All", "learning", "streak", "quiz", "General"].map((cat) => {
            const isSelected = filter.toLowerCase() === cat.toLowerCase();
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isSelected
                    ? "bg-[#ffa11f] text-[#10292e]"
                    : "bg-white text-[#607274] border border-[#e8eeea] hover:bg-[#fafaf8]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Badges Grid (3 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {filtered.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex items-start gap-4"
              >
                {/* Arch-shaped badge container */}
                <div
                  className={`w-14 h-16 rounded-t-full rounded-b-lg ${item.color} flex items-center justify-center text-white shrink-0 shadow-xs`}
                >
                  <Icon className="w-6 h-6 fill-white/20 text-white" />
                </div>

                <div className="flex-1">
                  <h3 className="font-extrabold text-base text-[#10292e]">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#607274] mt-0.5">
                    {item.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between">
                    <span className="bg-[#e6f5f2] text-[#118a80] text-[11px] font-semibold px-2.5 py-0.5 rounded-full">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-[#8a999b] font-mono">
                      {item.date} · badge_icon
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Locked Achievements Section */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-dashed border-[#f4c8ce] shadow-xs">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-extrabold text-[#10292e]">
              Locked achievements
            </h2>
            <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[10px] font-semibold px-2 py-0.5 rounded-full">
              Proposed
            </span>
          </div>
          <p className="text-xs text-[#8a999b] mb-6">
            Needs an AchievementDefinition collection for criteria, progress and locked state.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Locked 1 */}
            <div className="bg-[#fafaf8] rounded-2xl p-5 border border-[#f0f0eb] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e8eeea] shrink-0" />
                <div>
                  <div className="font-bold text-sm text-[#10292e]">Loop master</div>
                  <div className="text-xs text-[#8a999b]">Finish 5 loop lessons</div>
                </div>
              </div>
              <div className="w-full bg-[#e8eeea] h-2 rounded-full overflow-hidden">
                <div className="bg-[#118a80] h-full w-[40%]" />
              </div>
              <div className="text-[11px] text-[#8a999b] font-medium">In progress</div>
            </div>

            {/* Locked 2 */}
            <div className="bg-[#fafaf8] rounded-2xl p-5 border border-[#f0f0eb] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e8eeea] shrink-0" />
                <div>
                  <div className="font-bold text-sm text-[#10292e]">Perfect quiz</div>
                  <div className="text-xs text-[#8a999b]">Score 100% on a quiz</div>
                </div>
              </div>
              <div className="w-full bg-[#e8eeea] h-2 rounded-full overflow-hidden">
                <div className="bg-[#118a80] h-full w-[8%]" />
              </div>
              <div className="text-[11px] text-[#8a999b] font-medium">Locked</div>
            </div>

            {/* Locked 3 */}
            <div className="bg-[#fafaf8] rounded-2xl p-5 border border-[#f0f0eb] space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#e8eeea] shrink-0" />
                <div>
                  <div className="font-bold text-sm text-[#10292e]">30-day streak</div>
                  <div className="text-xs text-[#8a999b]">Learn 30 days in a row</div>
                </div>
              </div>
              <div className="w-full bg-[#e8eeea] h-2 rounded-full overflow-hidden">
                <div className="bg-[#118a80] h-full w-[15%]" />
              </div>
              <div className="text-[11px] text-[#8a999b] font-medium">In progress</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
