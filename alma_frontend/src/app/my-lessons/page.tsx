"use client";

import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import MangoIcon from "@/components/MangoIcon";
import { BookOpen, BarChart2, Trophy, ArrowRight } from "lucide-react";

interface LessonItem {
  id: string;
  title: string;
  quizStatus: string;
  status: "completed" | "active" | "not started";
}

interface ModuleItem {
  id: string;
  number: number;
  title: string;
  status: "completed" | "active" | "not started";
  lessons: LessonItem[];
}

const COURSES_DATA = [
  {
    id: "python-basics",
    title: "Python Basics",
    category: "Programming",
    grade: "Grade 8",
    lang: "en",
    totalModules: 4,
    percentComplete: 38,
    modules: [
      {
        id: "m1",
        number: 1,
        title: "Variables",
        status: "completed" as const,
        lessons: [
          {
            id: "l1",
            title: "What is a variable?",
            quizStatus: "Quiz available",
            status: "completed" as const,
          },
          {
            id: "l2",
            title: "Data types",
            quizStatus: "Quiz available",
            status: "completed" as const,
          },
        ],
      },
      {
        id: "m2",
        number: 2,
        title: "Loops",
        status: "active" as const,
        lessons: [
          {
            id: "l3",
            title: "Python for loops",
            quizStatus: "Quiz available",
            status: "active" as const,
          },
          {
            id: "l4",
            title: "While loops",
            quizStatus: "Quiz: published",
            status: "not started" as const,
          },
          {
            id: "l5",
            title: "Loop practice",
            quizStatus: "Quiz: published",
            status: "not started" as const,
          },
        ],
      },
      {
        id: "m3",
        number: 3,
        title: "Functions",
        status: "not started" as const,
        lessons: [
          {
            id: "l6",
            title: "Defining functions",
            quizStatus: "Quiz: published",
            status: "not started" as const,
          },
          {
            id: "l7",
            title: "Parameters",
            quizStatus: "Quiz: published",
            status: "not started" as const,
          },
        ],
      },
    ],
  },
  {
    id: "algo-thinking",
    title: "Algorithmic Thinking",
    category: "Computer Science",
    grade: "Grade 8",
    lang: "en",
    totalModules: 5,
    percentComplete: 40,
    modules: [],
  },
  {
    id: "frontend-web",
    title: "Frontend Web Basics",
    category: "Web Development",
    grade: "Grade 8",
    lang: "en",
    totalModules: 4,
    percentComplete: 0,
    modules: [],
  },
];

export default function MyLessonsPage() {
  const [selectedCourseId, setSelectedCourseId] = useState("python-basics");
  const course = COURSES_DATA.find((c) => c.id === selectedCourseId) || COURSES_DATA[0];

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              Learn
            </h1>
            <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
              Published courses, modules and lessons. Your progress comes from lesson sessions.
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

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Courses list & curiosity card (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Courses selector card */}
            <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-base text-[#10292e]">Courses</h3>
                <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Proposed
                </span>
              </div>
              <p className="text-xs text-[#8a999b] mb-4">My courses needs Enrollment.</p>

              <div className="space-y-3">
                {COURSES_DATA.map((c) => {
                  const isSelected = c.id === selectedCourseId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedCourseId(c.id)}
                      className={`w-full text-left p-4 rounded-2xl transition-all ${
                        isSelected
                          ? "border-2 border-[#ffa11f] bg-white shadow-xs"
                          : "border border-[#e8eeea] bg-[#fafaf8] hover:bg-white"
                      }`}
                    >
                      <div className="font-extrabold text-sm text-[#10292e]">
                        {c.title}
                      </div>
                      <div className="text-xs text-[#8a999b] mt-0.5">
                        {c.grade} · {c.lang}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Keep your curiosity growing Mascot Card */}
            <div className="bg-[#fff3db] rounded-3xl p-6 text-center border border-[#fae2b8] flex flex-col items-center justify-center">
              <div className="w-24 h-24 relative flex items-center justify-center mb-3">
                <MangoIcon size={72} animated />
              </div>
              <h4 className="font-black text-base text-[#10292e]">
                Keep your curiosity growing
              </h4>
              <p className="text-xs text-[#607274] mt-1 mb-4">
                One lesson. One new skill.
              </p>
              <div className="flex items-center justify-center gap-4 text-[#10292e]/70">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
                  <BarChart2 className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-xs">
                  <Trophy className="w-4 h-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Modules and Lessons list (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#e8eeea] shadow-xs">
            {/* Active Course Banner */}
            <div className="mb-6">
              <h2 className="text-2xl font-black text-[#10292e]">
                {course.title}
              </h2>
              <p className="text-xs text-[#8a999b] mt-0.5">
                {course.category} · {course.grade} · {course.totalModules} modules
              </p>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-[#f1f3f2] h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#118a80] h-full rounded-full transition-all"
                    style={{ width: `${course.percentComplete}%` }}
                  />
                </div>
                <div className="text-[11px] text-[#8a999b] font-medium text-right mt-1">
                  {course.percentComplete}% (sessions completed)
                </div>
              </div>
            </div>

            {/* Modules Accordion */}
            <div className="space-y-6">
              {course.modules.length > 0 ? (
                course.modules.map((m) => (
                  <div
                    key={m.id}
                    className="border border-[#e8eeea] rounded-2xl p-5 bg-white"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-extrabold text-base text-[#10292e]">
                        Module {m.number} · {m.title}
                      </h3>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          m.status === "completed"
                            ? "bg-[#e6f5f2] text-[#118a80]"
                            : m.status === "active"
                            ? "bg-[#e6f5f2] text-[#118a80]"
                            : "bg-[#f0f0eb] text-[#8a999b]"
                        }`}
                      >
                        {m.status}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {m.lessons.map((l) => (
                        <div
                          key={l.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#fafaf8] rounded-xl border border-[#f0f0eb]"
                        >
                          <div>
                            <div className="font-bold text-sm text-[#10292e]">
                              {l.title}
                            </div>
                            <div className="text-xs text-[#8a999b]">
                              {l.quizStatus}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                                l.status === "completed"
                                  ? "bg-[#e6f5f2] text-[#118a80]"
                                  : l.status === "active"
                                  ? "bg-[#e6f5f2] text-[#118a80]"
                                  : "bg-[#f0f0eb] text-[#8a999b]"
                              }`}
                            >
                              {l.status}
                            </span>

                            {l.status === "completed" && (
                              <Link
                                href="/my-lessons/player"
                                className="border border-[#10292e] text-[#10292e] hover:bg-[#10292e] hover:text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
                              >
                                Review
                              </Link>
                            )}
                            {l.status === "active" && (
                              <Link
                                href="/my-lessons/player"
                                className="bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] text-xs font-extrabold px-5 py-1.5 rounded-full shadow-xs transition-colors"
                              >
                                Resume
                              </Link>
                            )}
                            {l.status === "not started" && (
                              <Link
                                href="/my-lessons/player"
                                className="border border-[#10292e] text-[#10292e] hover:bg-[#10292e] hover:text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
                              >
                                Start
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[#8a999b] text-center py-8">
                  Modules will be unlocked soon.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
