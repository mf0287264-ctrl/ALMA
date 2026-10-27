"use client";

import React from "react";
import Sidebar from "@/components/Sidebar";
import LeaderboardIllustration from "@/app/_components/LeaderboardIllustration";

export default function CompetePage() {
  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-[#fff8ec] px-6 sm:px-10 lg:px-12 py-8 sm:py-10 overflow-y-auto pb-24 md:pb-10 select-none">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight mb-8">
          Compete & Duels
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="bg-[#f25c78] rounded-3xl p-8 text-white flex flex-col justify-between shadow-sm min-h-[300px]">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-white/80 block mb-2">
                1v1 Mode
              </span>
              <h2 className="text-3xl font-extrabold mb-3">
                Live Coding Duels
              </h2>
              <p className="text-white/90 text-sm max-w-sm leading-relaxed">
                Race against a classmate in real-time to solve coding challenges and earn bonus XP!
              </p>
            </div>

            <div className="mt-8">
              <button
                type="button"
                className="bg-[#ffa11f] hover:brightness-95 active:scale-95 text-[#10292e] font-bold text-sm px-8 py-3 rounded-full cursor-pointer transition-all shadow-sm"
              >
                Find Opponent
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8eeea] shadow-sm flex flex-col items-center">
            <h3 className="text-xl font-extrabold text-[#10292e] mb-6 self-start">
              Class Leaderboard
            </h3>
            <LeaderboardIllustration />
          </div>
        </div>
      </main>
    </div>
  );
}
