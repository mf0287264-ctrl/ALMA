"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";
import MangoIcon from "@/components/MangoIcon";

export default function HomePage() {
  const [askQuery, setAskQuery] = useState("");

  const handleAsk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askQuery.trim()) return;
    toast.success(`Asking ALMA: "${askQuery}"`);
    setAskQuery("");
  };

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      {/* Sidebar Selector Component */}
      <Sidebar />

      {/* Main Dashboard Content */}
      <main className="flex-1 min-h-screen bg-[#fff8ec] px-6 sm:px-10 lg:px-12 py-8 sm:py-10 overflow-y-auto pb-24 md:pb-10">
        {/* Top Header Row: Greeting & Badges */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
            Hi, Layla
          </h1>

          <div className="flex items-center gap-3">
            <span className="bg-[#ffd84a] text-[#10292e] font-extrabold text-xs sm:text-sm px-4 py-2 rounded-full shadow-sm">
              12 days
            </span>
            <span className="bg-[#7ccbf0] text-[#10292e] font-extrabold text-xs sm:text-sm px-4 py-2 rounded-full shadow-sm">
              1,840 XP
            </span>
          </div>
        </div>

        {/* Top Widgets Grid: Continue Learning & Daily Goal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Card 1: Continue Learning (2 cols on lg) */}
          <div className="lg:col-span-2 bg-[#118a80] rounded-3xl p-6 sm:p-7 text-white flex flex-col justify-between shadow-sm min-h-[220px]">
            <div>
              <span className="text-white/80 text-xs font-semibold tracking-wider">
                Continue learning
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-4">
                Loops, part 3
              </h2>
            </div>

            <div>
              <span className="text-white/90 text-xs font-semibold block mb-2">
                60% complete
              </span>
              <div className="w-full h-2 bg-[#0c6b63] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ffa11f] rounded-full transition-all duration-500"
                  style={{ width: "60%" }}
                />
              </div>

              <div className="mt-5">
                <Link
                  href="/learn"
                  className="bg-[#ffa11f] hover:brightness-95 active:scale-95 text-[#10292e] font-bold text-sm px-7 py-2.5 rounded-full inline-block transition-all shadow-sm"
                >
                  Continue
                </Link>
              </div>
            </div>
          </div>

          {/* Card 2: Daily Goal (1 col on lg) */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-sm flex flex-col justify-between min-h-[220px]">
            <span className="text-[#5a6e70] text-xs font-bold uppercase tracking-wider">
              Daily goal
            </span>

            <div>
              <span className="text-4xl font-extrabold text-[#10292e] block my-2">
                3/4
              </span>
              <span className="text-xs text-[#5a6e70] font-medium block mb-3">
                3 of 4 lessons completed
              </span>
              <div className="w-full h-2 bg-[#e2e8e4] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#ffa11f] rounded-full transition-all duration-500"
                  style={{ width: "75%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Middle Widget: Your Path */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-sm mb-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-extrabold text-[#10292e]">Your path</h3>
            <button
              type="button"
              onClick={() => toast.info("Opening full path curriculum...")}
              className="text-xs font-bold text-[#118a80] hover:underline cursor-pointer"
            >
              See all
            </button>
          </div>

          {/* Milestones row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {/* 1. Variables */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-18 bg-[#ffa11f] rounded-t-full shadow-sm mb-2" />
              <span className="text-xs font-bold text-[#10292e]">Variables</span>
            </div>

            {/* 2. If statements */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-18 bg-[#ffa11f] rounded-t-full shadow-sm mb-2" />
              <span className="text-xs font-bold text-[#10292e]">
                If statements
              </span>
            </div>

            {/* 3. Loops (In Progress) */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-18 bg-[#118a80] rounded-t-full shadow-sm mb-2" />
              <span className="text-xs font-bold text-[#10292e]">Loops</span>
            </div>

            {/* 4. Functions (Locked / Future) */}
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-18 bg-white border-2 border-[#d2dcd7] rounded-t-full shadow-sm mb-2" />
              <span className="text-xs font-bold text-[#83908f]">Functions</span>
            </div>
          </div>
        </div>

        {/* Bottom Widgets Grid: Challenge Duel & Ask ALMA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Challenge a friend to a 1v1 duel (Rose Pink) */}
          <div className="bg-[#f25c78] rounded-3xl p-6 sm:p-7 text-white flex flex-col justify-between shadow-sm min-h-[170px]">
            <h3 className="text-xl sm:text-2xl font-extrabold max-w-xs mb-5">
              Challenge a friend to a 1v1 duel
            </h3>
            <div>
              <Link
                href="/compete"
                className="bg-[#ffa11f] hover:brightness-95 active:scale-95 text-[#10292e] font-bold text-sm px-7 py-2.5 rounded-full inline-block transition-all shadow-sm"
              >
                Play
              </Link>
            </div>
          </div>

          {/* Ask ALMA */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-sm flex flex-col justify-between min-h-[170px]">
            <div className="flex items-center gap-2.5 mb-4">
              <MangoIcon size={30} animated />
              <span className="text-lg font-extrabold text-[#10292e]">
                Ask ALMA
              </span>
            </div>

            <form onSubmit={handleAsk} className="w-full">
              <input
                type="text"
                value={askQuery}
                onChange={(e) => setAskQuery(e.target.value)}
                placeholder="Ask anything about code..."
                className="w-full bg-[#fff8ec] rounded-2xl px-4 py-3.5 border border-[#e8eeea] text-sm text-[#10292e] placeholder:text-[#5a6e70] focus:outline-none focus:ring-2 focus:ring-[#118a80] transition-all shadow-inner"
              />
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
