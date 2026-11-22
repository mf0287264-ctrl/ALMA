"use client";

import React from "react";
import TeacherSidebar from "@/components/TeacherSidebar";

export default function TeacherAchievementsPage() {
  const earnedBadges = [
    {
      id: "b1",
      title: "First loop",
      description: "Finished your first loop lesson",
      pill: "Earned · Coding",
      color: "#ffa11f",
      pupilColor: "#10292e",
    },
    {
      id: "b2",
      title: "7-day streak",
      description: "Learned 7 days in a row",
      pill: "Earned · Streak",
      color: "#e84364",
      pupilColor: "#10292e",
    },
    {
      id: "b3",
      title: "Bug hunter",
      description: "Found 5 bugs in one lesson",
      pill: "Earned · Debugging",
      color: "#5bc0eb",
      pupilColor: "#10292e",
    },
  ];

  const lockedBadges = [
    {
      id: "l1",
      title: "Loop master",
      description: "Criteria and progress come from definitions",
      pill: "Locked · Coding",
    },
    {
      id: "l2",
      title: "30-day streak",
      description: "Criteria and progress come from definitions",
      pill: "Locked · Streak",
    },
  ];

  const recentAwards = [
    { student: "Layla A.", badge: "First loop", date: "Oct 26" },
    { student: "Omar K.", badge: "7-day streak", date: "Oct 25" },
    { student: "Nour S.", badge: "Bug hunter", date: "Oct 24" },
    { student: "Huda M.", badge: "First loop", date: "Oct 24" },
  ];

  return (
    <div className="w-full min-h-screen bg-[#fff8ec] flex">
      <TeacherSidebar />

      <main className="flex-1 min-w-0 p-6 sm:p-10 lg:p-12 pt-20 lg:pt-10 overflow-y-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-black text-[#10292e] tracking-tight">
            Achievement Center
          </h1>
          <p className="text-sm text-[#5a6e70] font-medium mt-1">
            Awards from the Achievement collection · mock data
          </p>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
            <div className="text-4xl font-black text-[#10292e] tracking-tight mb-1">
              312
            </div>
            <div className="text-sm font-bold text-[#5a6e70]">
              Awards given
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
            <div className="text-4xl font-black text-[#10292e] tracking-tight mb-1">
              5
            </div>
            <div className="text-sm font-bold text-[#5a6e70]">
              Categories
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
            <div className="text-4xl font-black text-[#10292e] tracking-tight mb-1">
              94
            </div>
            <div className="text-sm font-bold text-[#5a6e70]">
              Students with awards
            </div>
          </div>
        </div>

        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Badges (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Earned Section */}
            <div>
              <h2 className="text-xl font-black text-[#10292e] mb-4">
                Earned
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {earnedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col items-center justify-between text-center min-h-[220px]"
                  >
                    {/* Arch shape with pupil */}
                    <div
                      className="w-14 h-16 rounded-t-full flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: badge.color }}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: badge.pupilColor }}
                      />
                    </div>

                    <div className="mt-3">
                      <h3 className="font-black text-sm text-[#10292e]">
                        {badge.title}
                      </h3>
                      <p className="text-xs text-[#5a6e70] mt-1 leading-snug">
                        {badge.description}
                      </p>
                    </div>

                    <div className="mt-4">
                      <span className="inline-block bg-[#e6f7ec] text-[#1e7e34] text-[11px] font-bold px-3 py-1 rounded-full">
                        {badge.pill}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Locked Section */}
            <div>
              <div className="flex items-center gap-2.5 mb-4">
                <h2 className="text-xl font-black text-[#10292e]">
                  Locked
                </h2>
                <span className="inline-block bg-[#f5b842] text-[#10292e] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full tracking-wider">
                  PROPOSED · needs AchievementDefinition
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {lockedBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col items-center justify-between text-center min-h-[220px]"
                  >
                    {/* Grey arch shape with hollow center */}
                    <div className="w-14 h-16 rounded-t-full bg-[#cdd9d4] flex items-center justify-center">
                      <div className="w-4 h-4 rounded-full bg-white" />
                    </div>

                    <div className="mt-3">
                      <h3 className="font-black text-sm text-[#10292e]">
                        {badge.title}
                      </h3>
                      <p className="text-xs text-[#5a6e70] mt-1 leading-snug">
                        {badge.description}
                      </p>
                    </div>

                    <div className="mt-4">
                      <span className="inline-block bg-[#f0f4f2] text-[#6b7280] text-[11px] font-bold px-3 py-1 rounded-full">
                        {badge.pill}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Recent awards (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs">
            <h2 className="text-xl font-black text-[#10292e] mb-5">
              Recent awards
            </h2>

            <div className="divide-y divide-[#f5f8f6]">
              {recentAwards.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between text-sm">
                  <span className="font-black text-[#10292e]">
                    {item.student}
                  </span>
                  <span className="text-xs font-semibold text-[#5a6e70]">
                    {item.badge}
                  </span>
                  <span className="text-xs font-medium text-[#83908f]">
                    {item.date}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-8 pt-4 border-t border-[#f0f4f2]">
              <span className="font-mono text-[11px] text-[#5a6e70]">
                Fields: student_id, title, category, awarded_at
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
