"use client";

import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { Trophy, Flame, ArrowUp, ArrowDown, Minus, ArrowRight } from "lucide-react";

interface LeaderboardEntry {
  rank: number;
  student: string;
  isMe?: boolean;
  totalXP: number;
  change: string;
  changeType: "up" | "down" | "neutral";
}

const LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, student: "Mariam Ali", totalXP: 1760, change: "2", changeType: "up" },
  { rank: 2, student: "Omar Khaled", totalXP: 1680, change: "1", changeType: "up" },
  { rank: 3, student: "Youssef Adel", totalXP: 1540, change: "—", changeType: "neutral" },
  { rank: 6, student: "Nour Ibrahim", totalXP: 1360, change: "4", changeType: "up" },
  { rank: 7, student: "Salma Mostafa", totalXP: 1280, change: "1", changeType: "down" },
  { rank: 8, student: "Layla Hassan · You", isMe: true, totalXP: 1240, change: "3", changeType: "up" },
];

export default function CompetitionPage() {
  const [timeframe, setTimeframe] = useState("This week");

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
            Competition &amp; leaderboard
          </h1>
          <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
            Compete with your classmates, build skills and celebrate every win.
          </p>
        </div>

        {/* Dark Teal Hero Banner */}
        <div className="bg-[#0f5953] rounded-3xl p-6 sm:p-8 text-white shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex-1">
            <span className="text-[10px] font-black tracking-wider uppercase text-emerald-300 block mb-1">
              THIS WEEK · GRADE 8
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Keep climbing, Layla!
            </h2>
            <p className="text-xs text-emerald-100/80 mt-1">
              Every lesson and challenge brings you closer to your next milestone.
            </p>
          </div>

          <div className="flex items-center gap-6 sm:gap-10 self-start md:self-auto border-t md:border-t-0 md:border-l border-white/20 pt-4 md:pt-0 md:pl-8">
            <div>
              <div className="text-3xl sm:text-4xl font-black text-white">#8</div>
              <div className="text-[11px] text-emerald-200 uppercase font-semibold">
                Class rank
              </div>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-white">1,240</div>
              <div className="text-[11px] text-emerald-200 uppercase font-semibold">
                Total XP
              </div>
            </div>

            <div>
              <div className="text-3xl sm:text-4xl font-black text-[#5ce1e6] flex items-center">
                &uarr; 3
              </div>
              <div className="text-[11px] text-emerald-200 uppercase font-semibold">
                Places this week
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Leaderboard (7 cols) + Your challenges (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-8">
          {/* Class leaderboard table */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-lg text-[#10292e]">
                  Class leaderboard
                </h3>
                <p className="text-xs text-[#8a999b]">
                  This week · Top 3 and students near you
                </p>
              </div>

              <span className="text-xs font-bold text-[#10292e] bg-[#fafaf8] border border-[#e8eeea] px-3 py-1.5 rounded-full">
                {timeframe} &darr;
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#f0f0eb] text-[#8a999b] text-[11px] uppercase tracking-wider">
                    <th className="pb-2.5 font-bold">Rank</th>
                    <th className="pb-2.5 font-bold">Student</th>
                    <th className="pb-2.5 font-bold text-right">Total XP</th>
                    <th className="pb-2.5 font-bold text-right pr-2">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f0f0eb]">
                  {LEADERBOARD.map((item) => (
                    <tr
                      key={item.rank}
                      className={item.isMe ? "bg-[#fff9ea] font-extrabold text-[#10292e]" : "text-[#607274]"}
                    >
                      <td className="py-3.5 pl-2 font-bold text-[#10292e]">
                        {item.rank}
                      </td>
                      <td className="py-3.5 font-bold text-[#10292e]">
                        {item.student}
                      </td>
                      <td className="py-3.5 text-right font-mono font-bold text-[#10292e]">
                        {item.totalXP.toLocaleString()}
                      </td>
                      <td className="py-3.5 text-right pr-2 font-bold">
                        {item.changeType === "up" && (
                          <span className="text-[#118a80] inline-flex items-center gap-0.5">
                            &uarr; {item.change}
                          </span>
                        )}
                        {item.changeType === "down" && (
                          <span className="text-[#f25c78] inline-flex items-center gap-0.5">
                            &darr; {item.change}
                          </span>
                        )}
                        {item.changeType === "neutral" && (
                          <span className="text-[#8a999b]">{item.change}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Your challenges */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs space-y-6">
            <div>
              <h3 className="font-extrabold text-lg text-[#10292e]">
                Your challenges
              </h3>
              <p className="text-xs text-[#8a999b]">
                Practice today. Shine this week.
              </p>
            </div>

            {/* Challenge 1 */}
            <div className="p-5 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb] space-y-3">
              <span className="text-[10px] font-black tracking-wider uppercase text-[#118a80] bg-[#e6f5f2] px-2.5 py-0.5 rounded-full inline-block">
                ENDS IN 2 DAYS
              </span>
              <div>
                <h4 className="font-extrabold text-base text-[#10292e]">
                  Python Loop Sprint
                </h4>
                <p className="text-xs text-[#8a999b] mt-0.5">
                  5 questions · Up to 200 XP
                </p>
              </div>

              <div>
                <Link
                  href="/quize"
                  className="inline-block px-5 py-2 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs shadow-xs transition-colors"
                >
                  Practice loops
                </Link>
              </div>
            </div>

            {/* Challenge 2 */}
            <div className="p-5 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb] space-y-3">
              <span className="text-[10px] font-black tracking-wider uppercase text-[#ffa11f] bg-[#fff3db] px-2.5 py-0.5 rounded-full inline-block">
                DAILY CHALLENGE
              </span>
              <div>
                <h4 className="font-extrabold text-base text-[#10292e]">
                  A little logic goes a long way
                </h4>
                <p className="text-xs text-[#8a999b] mt-0.5">
                  3 of 5 puzzles solved · 50 XP reward
                </p>
              </div>

              <div className="w-full bg-[#e8eeea] h-2 rounded-full overflow-hidden">
                <div className="bg-[#118a80] h-full w-[60%]" />
              </div>

              <div>
                <Link
                  href="/courses/logic-puzzles"
                  className="text-xs font-bold text-[#118a80] hover:underline flex items-center gap-1"
                >
                  Continue practice &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: Accuracy Comparison & Next Reward */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-6">
          {/* Accuracy Card (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-base text-[#10292e]">
                You&apos;re building stronger skills
              </h3>
              <p className="text-xs text-[#8a999b]">
                Average quiz accuracy · This week
              </p>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#10292e] mb-1.5">
                  <span>You</span>
                  <span>87%</span>
                </div>
                <div className="w-full bg-[#f1f3f2] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#118a80] h-full w-[87%] rounded-full" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-[#607274] mb-1.5">
                  <span>Class average</span>
                  <span>78%</span>
                </div>
                <div className="w-full bg-[#f1f3f2] h-2.5 rounded-full overflow-hidden">
                  <div className="bg-[#59b8eb] h-full w-[78%] rounded-full" />
                </div>
              </div>
            </div>
          </div>

          {/* Reward Card (5 cols) */}
          <div className="lg:col-span-5 bg-[#fff9ea] rounded-3xl p-6 sm:p-7 border border-[#fae2b8] shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-extrabold text-[#10292e]">
                <Trophy className="w-4 h-4 text-[#ffa11f]" />
                <span>Your next reward</span>
              </div>

              <h4 className="font-black text-lg text-[#10292e]">
                Finish in the top 10 this week
              </h4>

              <p className="text-xs font-semibold text-[#118a80]">
                Rising Star badge + 100 bonus XP
              </p>
            </div>

            <div className="text-xs text-[#8a999b] pt-4 mt-4 border-t border-[#f0e4cc]">
              You&apos;re on track at #8. Keep it up!
            </div>
          </div>
        </div>

        <p className="text-[11px] text-[#8a999b]">
          Example competition data · Weekly rankings reset on Monday
        </p>
      </main>
    </div>
  );
}
