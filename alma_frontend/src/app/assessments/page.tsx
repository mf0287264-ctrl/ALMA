"use client";

import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";

interface AssessmentItem {
  id: string;
  title: string;
  course: string;
  module: string;
  questionsCount: number;
  totalPoints: number;
  passScore: number;
  status: "available" | "in-progress" | "completed";
  score?: number;
}

const ASSESSMENTS: AssessmentItem[] = [
  {
    id: "loops-checkpoint",
    title: "Loops checkpoint",
    course: "Intro to Python",
    module: "Module 3",
    questionsCount: 8,
    totalPoints: 100,
    passScore: 60,
    status: "available",
  },
  {
    id: "lists-and-indexing",
    title: "Lists and indexing test",
    course: "Data Basics",
    module: "",
    questionsCount: 12,
    totalPoints: 120,
    passScore: 70,
    status: "available",
  },
  {
    id: "variables-quiz",
    title: "Variables quiz",
    course: "Intro to Python",
    module: "Module 1",
    questionsCount: 10,
    totalPoints: 100,
    passScore: 60,
    status: "completed",
    score: 90,
  },
];

export default function AssessmentsCatalogPage() {
  const [filter, setFilter] = useState<"Available" | "In progress" | "Completed">("Available");

  const filtered = ASSESSMENTS.filter((a) => {
    if (filter === "Available") return a.status === "available";
    if (filter === "In progress") return a.status === "in-progress";
    if (filter === "Completed") return a.status === "completed";
    return true;
  });

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 py-8 sm:py-10 overflow-y-auto pb-24 md:pb-10">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
            Assessments
          </h1>
          <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
            Quizzes and tests from your courses · Assessment (status = published)
          </p>
        </div>

        {/* 3 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
          <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
            <div className="text-3xl sm:text-4xl font-black text-[#10292e] mb-1">
              3
            </div>
            <div className="font-bold text-sm text-[#10292e]">Available</div>
            <div className="text-xs text-[#8a999b] mt-0.5">published, not taken</div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
            <div className="text-3xl sm:text-4xl font-black text-[#10292e] mb-1">
              1
            </div>
            <div className="font-bold text-sm text-[#10292e]">In progress</div>
            <div className="text-xs text-[#8a999b] mt-0.5">needs attempt record</div>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
            <div className="text-3xl sm:text-4xl font-black text-[#10292e] mb-1">
              84%
            </div>
            <div className="font-bold text-sm text-[#10292e]">Average score</div>
            <div className="text-xs text-[#8a999b] mt-0.5">from your results</div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mb-6">
          <button
            onClick={() => setFilter("Available")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === "Available"
                ? "bg-[#ffa11f] text-[#10292e]"
                : "bg-white text-[#607274] border border-[#e8eeea] hover:bg-[#fafaf8]"
            }`}
          >
            Available
          </button>
          <button
            onClick={() => setFilter("In progress")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all border ${
              filter === "In progress"
                ? "bg-[#ffa11f] text-[#10292e] border-[#ffa11f]"
                : "border-[#ffa11f] text-[#ffa11f] bg-transparent hover:bg-[#fff5e6]"
            }`}
          >
            In progress
          </button>
          <button
            onClick={() => setFilter("Completed")}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
              filter === "Completed"
                ? "bg-[#ffa11f] text-[#10292e]"
                : "bg-white text-[#607274] border border-[#e8eeea] hover:bg-[#fafaf8]"
            }`}
          >
            Completed
          </button>
        </div>

        {/* Assessment Cards */}
        <div className="space-y-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e8eeea] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-black text-lg shrink-0 ${
                    item.status === "completed" ? "bg-[#118a80]" : "bg-[#ffa11f]"
                  }`}
                >
                  A
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-[#10292e]">
                    {item.title}
                  </h3>
                  <div className="text-xs text-[#118a80] font-semibold mt-0.5">
                    {item.course} {item.module ? `· ${item.module}` : ""}
                  </div>
                  <div className="text-xs text-[#8a999b] mt-0.5">
                    {item.questionsCount} questions · {item.totalPoints} pts · pass {item.passScore}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center">
                {item.status === "completed" ? (
                  <>
                    <span className="bg-[#e6f5f2] text-[#118a80] text-xs font-semibold px-3 py-1 rounded-full">
                      Passed · {item.score}
                    </span>
                    <Link
                      href={`/assessments/${item.id}/result`}
                      className="px-5 py-2 rounded-full border border-[#10292e] text-[#10292e] hover:bg-[#10292e] hover:text-white text-xs font-bold transition-colors"
                    >
                      View result
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/assessments/${item.id}/instructions`}
                    className="px-6 py-2.5 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] text-xs font-extrabold shadow-xs transition-colors"
                  >
                    Start
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
