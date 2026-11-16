"use client";

import React, { useState, useMemo } from "react";
import TeacherSidebar from "@/components/TeacherSidebar";
import { toast } from "sonner";

interface StudentRow {
  id: string;
  name: string;
  code: string;
  grade: string;
  streak: number;
  lessons: number;
  struggling_with: string;
  struggling_type: "yellow" | "red" | "teal" | "orange";
}

const INITIAL_STUDENTS: StudentRow[] = [
  {
    id: "1",
    name: "Layla Hassan",
    code: "S-1042",
    grade: "Grade 8",
    streak: 12,
    lessons: 27,
    struggling_with: "Loop conditions",
    struggling_type: "yellow",
  },
  {
    id: "2",
    name: "Omar Khaled",
    code: "S-1057",
    grade: "Grade 8",
    streak: 3,
    lessons: 14,
    struggling_with: "Zero-Based Indexing",
    struggling_type: "red",
  },
  {
    id: "3",
    name: "Nour Adel",
    code: "S-1063",
    grade: "Grade 9",
    streak: 21,
    lessons: 38,
    struggling_with: "None",
    struggling_type: "teal",
  },
  {
    id: "4",
    name: "Youssef Ali",
    code: "S-1071",
    grade: "Grade 8",
    streak: 0,
    lessons: 6,
    struggling_with: "Zero-Based Indexing",
    struggling_type: "red",
  },
  {
    id: "5",
    name: "Mariam Samir",
    code: "S-1088",
    grade: "Grade 9",
    streak: 8,
    lessons: 22,
    struggling_with: "Variable scope",
    struggling_type: "yellow",
  },
  {
    id: "6",
    name: "Ziad Tarek",
    code: "S-1098",
    grade: "Grade 8",
    streak: 5,
    lessons: 17,
    struggling_with: "Off-by-one range",
    struggling_type: "orange",
  },
];

const STRUGGLING_CONCEPTS = [
  {
    name: "Zero-Based Indexing",
    wrong: 34,
    tested: 60,
    misconception: "Thinks range(3) is 1 2 3",
  },
  {
    name: "Loop conditions",
    wrong: 22,
    tested: 55,
    misconception: "Forgets the exit condition",
  },
  {
    name: "Off-by-one range",
    wrong: 18,
    tested: 47,
    misconception: "Includes the stop value",
  },
  {
    name: "Variable scope",
    wrong: 9,
    tested: 40,
    misconception: "Expects loop variable to reset",
  },
];

export default function StudentPerformancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGrade, setSelectedGrade] = useState("All");

  const filteredStudents = useMemo(() => {
    return INITIAL_STUDENTS.filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGrade =
        selectedGrade === "All" || s.grade === selectedGrade;
      return matchesSearch && matchesGrade;
    });
  }, [searchTerm, selectedGrade]);

  const handleExport = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      ["Name,Code,Grade,Streak,Lessons,Struggling With"]
        .concat(
          filteredStudents.map(
            (s) =>
              `"${s.name}","${s.code}","${s.grade}",${s.streak},${s.lessons},"${s.struggling_with}"`
          )
        )
        .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "alma_student_performance.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Student performance data exported successfully!");
  };

  return (
    <div className="w-full min-h-screen bg-[#fff8ec] flex">
      <TeacherSidebar />

      <main className="flex-1 lg:ml-64 p-6 sm:p-10 lg:p-12 pt-20 lg:pt-10 overflow-y-auto">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#10292e] tracking-tight">
              Student performance
            </h1>
            <p className="text-sm text-[#5a6e70] font-medium mt-1">
              Progress, streaks and the concepts students struggle with · Student + StudentLessonSession · mock data
            </p>
          </div>

          <button
            onClick={handleExport}
            className="self-start sm:self-auto px-6 py-2.5 rounded-full border border-[#d2dcd7] bg-white hover:bg-[#fafaf8] text-[#10292e] font-black text-sm transition-all shadow-xs cursor-pointer active:scale-95"
          >
            Export
          </button>
        </div>

        {/* 4 Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-4xl font-black text-[#10292e] tracking-tight mb-1">
                1,270
              </div>
              <div className="text-sm font-bold text-[#5a6e70]">
                Students
              </div>
            </div>
            <div className="mt-4 font-mono text-xs text-[#118a80]">
              Student
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-4xl font-black text-[#10292e] tracking-tight mb-1">
                18.4
              </div>
              <div className="text-sm font-bold text-[#5a6e70]">
                Avg lessons completed
              </div>
            </div>
            <div className="mt-4 font-mono text-xs text-[#118a80]">
              lessons_completed
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-4xl font-black text-[#10292e] tracking-tight mb-1">
                5.2 days
              </div>
              <div className="text-sm font-bold text-[#5a6e70]">
                Avg current streak
              </div>
            </div>
            <div className="mt-4 font-mono text-xs text-[#118a80]">
              current_streak
            </div>
          </div>

          {/* Card 4 */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between">
            <div>
              <div className="text-4xl font-black text-[#10292e] tracking-tight mb-1">
                71%
              </div>
              <div className="text-sm font-bold text-[#5a6e70]">
                Checkpoint accuracy
              </div>
            </div>
            <div className="mt-4 font-mono text-xs text-[#118a80]">
              checkpoint_logs.is_correct
            </div>
          </div>
        </div>

        {/* 2-Column Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Students Table (7 cols or ~60%) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs">
            <h2 className="text-xl font-black text-[#10292e] mb-5">
              Students
            </h2>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="relative flex-1 min-w-[220px]">
                <input
                  type="text"
                  placeholder="Search by name or student_code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-xs text-[#10292e] placeholder-[#83908f] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                />
              </div>

              <div className="relative">
                <select
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                  className="appearance-none bg-white rounded-2xl border border-[#d2dcd7] px-4 py-2.5 pr-8 text-xs font-bold text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f] cursor-pointer"
                >
                  <option value="All">Grade: All</option>
                  <option value="Grade 8">Grade 8</option>
                  <option value="Grade 9">Grade 9</option>
                </select>
                <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#5a6e70]">
                  ▾
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#f5b842] bg-[#fffbf2] text-[#b87e00] text-[11px] font-bold">
                Class filter · needs Enrollment
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#eef4f1] text-[11px] font-black uppercase tracking-wider text-[#5a6e70] rounded-xl">
                    <th className="py-3 px-4 rounded-l-xl">NAME</th>
                    <th className="py-3 px-4">CODE</th>
                    <th className="py-3 px-4">GRADE</th>
                    <th className="py-3 px-4">STREAK</th>
                    <th className="py-3 px-4">LESSONS</th>
                    <th className="py-3 px-4 rounded-r-xl">STRUGGLING WITH</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f5f8f6] text-sm">
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-xs text-[#83908f]">
                        No students match your search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-[#fafaf8] transition-colors">
                        <td className="py-4 px-4 font-black text-[#10292e]">
                          {s.name}
                        </td>
                        <td className="py-4 px-4 font-mono text-xs text-[#5a6e70]">
                          {s.code}
                        </td>
                        <td className="py-4 px-4 text-xs font-semibold text-[#5a6e70]">
                          {s.grade}
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-[#10292e]">
                          {s.streak}
                        </td>
                        <td className="py-4 px-4 text-xs font-bold text-[#10292e]">
                          {s.lessons}
                        </td>
                        <td className="py-4 px-4">
                          {s.struggling_type === "yellow" && (
                            <span className="inline-block bg-[#fff1d6] text-[#b87e00] px-3 py-1 rounded-full text-xs font-bold">
                              {s.struggling_with}
                            </span>
                          )}
                          {s.struggling_type === "red" && (
                            <span className="inline-block bg-[#fee2e2] text-[#b91c1c] px-3 py-1 rounded-full text-xs font-bold">
                              {s.struggling_with}
                            </span>
                          )}
                          {s.struggling_type === "teal" && (
                            <span className="inline-block bg-[#e6f5f2] text-[#118a80] px-3 py-1 rounded-full text-xs font-bold">
                              {s.struggling_with}
                            </span>
                          )}
                          {s.struggling_type === "orange" && (
                            <span className="inline-block bg-[#ffedd5] text-[#c2410c] px-3 py-1 rounded-full text-xs font-bold">
                              {s.struggling_with}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column: Top Struggling Concepts (4 cols or ~40%) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs">
            <h2 className="text-xl font-black text-[#10292e] mb-1">
              Top struggling concepts
            </h2>
            <p className="font-mono text-xs text-[#118a80] mb-6">
              struggling_concepts: times_wrong / times_tested
            </p>

            <div className="space-y-6">
              {STRUGGLING_CONCEPTS.map((concept) => {
                const percentage = Math.round((concept.wrong / concept.tested) * 100);
                return (
                  <div key={concept.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-black text-[#10292e]">
                        {concept.name}
                      </span>
                      <span className="font-bold text-xs text-[#ef4444]">
                        {concept.wrong} / {concept.tested}
                      </span>
                    </div>

                    {/* Progress Bar in coral/red */}
                    <div className="w-full h-2 rounded-full bg-[#fce7e7] overflow-hidden">
                      <div
                        className="h-full bg-[#f87171] rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    <div className="text-[11px] text-[#5a6e70] font-mono leading-tight">
                      last_diagnosed_misconception:{" "}
                      <span className="text-[#10292e] font-semibold">{concept.misconception}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Routed to remediation card */}
            <div className="mt-8 rounded-2xl bg-[#fffbf2] border border-[#f5eedb] p-4">
              <h3 className="font-black text-sm text-[#10292e] mb-1">
                Routed to remediation
              </h3>
              <p className="text-xs text-[#5a6e70] leading-relaxed">
                38% of wrong checkpoint answers triggered remediation_blocks (routed_to_remediation).
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
