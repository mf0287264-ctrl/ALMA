"use client";

import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { Search, BookOpen, BarChart3, FileText, Trophy } from "lucide-react";

interface Course {
  id: string;
  code: string;
  title: string;
  category: string;
  grade: string;
  description: string;
  completedModules: number;
  totalModules: number;
  status: "in-progress" | "not-started" | "completed";
  color: string;
  icon: React.ElementType;
}

const COURSES: Course[] = [
  {
    id: "intro-to-python",
    code: "It",
    title: "Intro to Python",
    category: "Programming",
    grade: "Grade 8",
    description: "Variables, loops and your first programs.",
    completedModules: 4,
    totalModules: 6,
    status: "in-progress",
    color: "bg-[#ffa11f]",
    icon: BookOpen,
  },
  {
    id: "data-basics",
    code: "DB",
    title: "Data Basics",
    category: "Programming",
    grade: "Grade 9",
    description: "Lists, indexing and working with data.",
    completedModules: 1,
    totalModules: 4,
    status: "in-progress",
    color: "bg-[#59b8eb]",
    icon: BarChart3,
  },
  {
    id: "web-foundations",
    code: "WF",
    title: "Web Foundations",
    category: "Programming",
    grade: "Grade 10",
    description: "HTML, CSS and how pages are built.",
    completedModules: 0,
    totalModules: 5,
    status: "not-started",
    color: "bg-[#ffd84a]",
    icon: FileText,
  },
  {
    id: "algorithms-lab",
    code: "AL",
    title: "Algorithms Lab",
    category: "Programming",
    grade: "Grade 10",
    description: "Think step by step and solve puzzles.",
    completedModules: 2,
    totalModules: 5,
    status: "in-progress",
    color: "bg-[#f25c78]",
    icon: BarChart3,
  },
  {
    id: "logic-puzzles",
    code: "L&",
    title: "Logic & Puzzles",
    category: "General",
    grade: "Grade 8",
    description: "Warm-up challenges for sharper thinking.",
    completedModules: 4,
    totalModules: 4,
    status: "completed",
    color: "bg-[#0f5953]",
    icon: Trophy,
  },
  {
    id: "python-projects",
    code: "PP",
    title: "Python Projects",
    category: "Programming",
    grade: "Grade 9",
    description: "Build small projects from scratch.",
    completedModules: 0,
    totalModules: 6,
    status: "not-started",
    color: "bg-[#ffa11f]",
    icon: BookOpen,
  },
];

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"All" | "Programming" | "Grade 8" | "My courses">("All");

  const filtered = COURSES.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === "All") return true;
    if (filter === "Programming") return c.category === "Programming";
    if (filter === "Grade 8") return c.grade === "Grade 8";
    if (filter === "My courses") return c.status === "in-progress";
    return true;
  });

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
            Courses
          </h1>
          <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
            Pick a course and keep going · Course (status = published)
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#8a999b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-full border border-[#e8eeea] text-xs sm:text-sm text-[#10292e] placeholder-[#8a999b] focus:outline-hidden focus:border-[#ffa11f]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
            <button
              onClick={() => setFilter("All")}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                filter === "All"
                  ? "bg-[#10292e] text-white"
                  : "bg-white text-[#607274] border border-[#e8eeea] hover:bg-[#fafaf8]"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("Programming")}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                filter === "Programming"
                  ? "bg-[#10292e] text-white"
                  : "bg-white text-[#607274] border border-[#e8eeea] hover:bg-[#fafaf8]"
              }`}
            >
              Programming
            </button>
            <button
              onClick={() => setFilter("Grade 8")}
              className={`px-3.5 py-1.5 rounded-full transition-all ${
                filter === "Grade 8"
                  ? "bg-[#10292e] text-white"
                  : "bg-white text-[#607274] border border-[#e8eeea] hover:bg-[#fafaf8]"
              }`}
            >
              Grade 8
            </button>
            <button
              onClick={() => setFilter("My courses")}
              className={`px-3.5 py-1.5 rounded-full transition-all border ${
                filter === "My courses"
                  ? "bg-[#ffa11f] text-[#10292e] border-[#ffa11f]"
                  : "border-[#ffa11f] text-[#ffa11f] bg-transparent hover:bg-[#fff5e6]"
              }`}
            >
              My courses · needs Enrollment
            </button>
          </div>
        </div>

        {/* 6 Courses Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((c) => {
            const Icon = c.icon;
            const pct =
              c.status === "completed"
                ? 100
                : c.status === "not-started"
                ? 0
                : Math.round((c.completedModules / c.totalModules) * 100);

            return (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-[#e8eeea] shadow-xs overflow-hidden flex flex-col justify-between"
              >
                {/* Colored Header Banner with Code & Icon */}
                <div className={`${c.color} h-28 p-5 flex items-center justify-between text-white relative`}>
                  <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center">
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-3xl font-black tracking-wider text-white/90">
                    {c.code}
                  </span>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-extrabold text-[#10292e]">
                      {c.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#8a999b] mt-0.5">
                      {c.category} · {c.grade}
                    </p>
                    <p className="text-xs text-[#607274] mt-2 line-clamp-2">
                      {c.description}
                    </p>
                  </div>

                  <div className="mt-6">
                    {/* Progress Bar & Label */}
                    <div className="mb-4">
                      <div className="w-full bg-[#f1f3f2] h-2 rounded-full overflow-hidden mb-1.5">
                        <div
                          className={`h-full rounded-full transition-all ${
                            c.status === "completed"
                              ? "bg-[#118a80]"
                              : c.status === "in-progress"
                              ? "bg-[#ffa11f]"
                              : "bg-transparent"
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="text-[11px] text-[#8a999b] font-medium text-right">
                        {c.status === "completed"
                          ? "Completed"
                          : c.status === "in-progress"
                          ? `${c.completedModules} / ${c.totalModules} modules`
                          : "Not started"}
                      </div>
                    </div>

                    {/* Action Button */}
                    {c.status === "in-progress" && (
                      <Link
                        href={`/courses/${c.id}`}
                        className="block text-center w-full py-2.5 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-sm shadow-xs transition-colors"
                      >
                        Continue
                      </Link>
                    )}
                    {c.status === "completed" && (
                      <Link
                        href={`/courses/${c.id}`}
                        className="block text-center w-full py-2.5 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-sm shadow-xs transition-colors"
                      >
                        Review
                      </Link>
                    )}
                    {c.status === "not-started" && (
                      <Link
                        href={`/courses/${c.id}`}
                        className="block text-center w-full py-2.5 rounded-full border border-[#10292e] hover:bg-[#10292e] hover:text-white text-[#10292e] font-extrabold text-sm transition-colors"
                      >
                        Start
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
