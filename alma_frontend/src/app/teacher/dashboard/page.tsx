"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import TeacherSidebar from "@/components/TeacherSidebar";
import { useAuth } from "@/app/_Context/AuthContext";
import api from "@/services/api";

interface AwaitingLesson {
  id: string;
  topic: string;
  course: string;
  version: string;
  state: "AWAITING_REVIEW" | "APPROVED" | "REJECTED";
}

interface GenerationJob {
  id: string;
  topic: string;
  status: "processing" | "completed" | "pending";
  progress: number;
  message: string;
}

export default function TeacherOverviewPage() {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    coursesCount: 8,
    lessonsCount: 42,
    awaitingReviewCount: 5,
    studentsCount: 1204,
  });

  const [reviewLessons, setReviewLessons] = useState<AwaitingLesson[]>([
    {
      id: "les-1",
      topic: "Python for loops",
      course: "Intro to Python",
      version: "v2",
      state: "AWAITING_REVIEW",
    },
    {
      id: "les-2",
      topic: "Variables and types",
      course: "Intro to Python",
      version: "v1",
      state: "AWAITING_REVIEW",
    },
    {
      id: "les-3",
      topic: "Lists and indexing",
      course: "Data Basics",
      version: "v3",
      state: "APPROVED",
    },
    {
      id: "les-4",
      topic: "While loops",
      course: "Intro to Python",
      version: "v1",
      state: "REJECTED",
    },
  ]);

  const [jobs, setJobs] = useState<GenerationJob[]>([
    {
      id: "job-1",
      topic: "Nested loops",
      status: "processing",
      progress: 60,
      message: "sections · Writing section 3 of 5",
    },
    {
      id: "job-2",
      topic: "Functions intro",
      status: "completed",
      progress: 100,
      message: "completed",
    },
  ]);

  // Load real backend counts if available
  useEffect(() => {
    async function loadBackendData() {
      try {
        const [coursesRes, lessonsRes, genRes] = await Promise.allSettled([
          api.get("/courses"),
          api.get("/lessons"),
          api.get("/lesson-generations"),
        ]);

        let courseCount = 8;
        if (coursesRes.status === "fulfilled" && coursesRes.value?.data?.data) {
          const list = coursesRes.value.data.data;
          courseCount = Array.isArray(list) ? list.length : courseCount;
        }

        let lessonCount = 42;
        if (lessonsRes.status === "fulfilled" && lessonsRes.value?.data?.data) {
          const list = lessonsRes.value.data.data;
          lessonCount = Array.isArray(list) ? list.length : lessonCount;
        }

        if (genRes.status === "fulfilled" && genRes.value?.data?.data) {
          const list = genRes.value.data.data;
          if (Array.isArray(list) && list.length > 0) {
            setJobs(
              list.slice(0, 3).map((j: any) => ({
                id: j._id || j.job_id,
                topic: j.topic,
                status: j.status === "completed" ? "completed" : "processing",
                progress: Math.round((j.progress_percent || 0.6) * 100),
                message: j.step_message || (j.status === "completed" ? "completed" : "processing"),
              }))
            );
          }
        }

        setStats((prev) => ({
          ...prev,
          coursesCount: courseCount,
          lessonsCount: lessonCount,
        }));
      } catch (err) {
        console.warn("Using sample dashboard telemetry", err);
      }
    }

    loadBackendData();
  }, []);

  const teacherFirstName = user?.first_name || user?.name?.split(" ")[0] || "Sara";

  return (
    <div className="w-full min-h-screen bg-[#fff8ec] flex">
      {/* Fixed Sidebar */}
      <TeacherSidebar />

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-6 sm:p-10 lg:p-12 pt-20 lg:pt-10 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#10292e] tracking-tight">
              Welcome back, {teacherFirstName}
            </h1>
            <p className="text-sm text-[#5a6e70] font-medium mt-1">
              Your courses, lessons and generation jobs · live & mock data
            </p>
          </div>

          <Link
            href="/teacher/ai-generation"
            className="self-start sm:self-auto bg-[#ffa11f] hover:brightness-95 active:scale-[0.98] text-[#10292e] font-extrabold text-sm px-6 py-3 rounded-full transition-all shadow-xs"
          >
            Generate lesson
          </Link>
        </div>

        {/* 4 Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 mb-8">
          {/* Card 1: Courses */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[140px]">
            <span className="text-4xl font-black text-[#10292e]">
              {stats.coursesCount}
            </span>
            <span className="text-xs text-[#5a6e70] font-bold">
              Courses · Course.created_by
            </span>
          </div>

          {/* Card 2: Lessons */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[140px]">
            <span className="text-4xl font-black text-[#10292e]">
              {stats.lessonsCount}
            </span>
            <span className="text-xs text-[#5a6e70] font-bold">
              Lessons · Lesson.created_by
            </span>
          </div>

          {/* Card 3: Versions awaiting review */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[140px]">
            <span className="text-4xl font-black text-[#10292e]">
              {stats.awaitingReviewCount}
            </span>
            <span className="text-xs text-[#5a6e70] font-bold">
              Versions awaiting review
            </span>
          </div>

          {/* Card 4: Students enrolled */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[140px]">
            <span className="text-4xl font-black text-[#10292e]">
              {stats.studentsCount.toLocaleString()}
            </span>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#5a6e70] font-bold">
                Students enrolled
              </span>
              <span className="bg-[#fff1d6] text-[#b87e00] text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                PROPOSED · needs Enrollment
              </span>
            </div>
          </div>
        </div>

        {/* 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-7 mb-8">
          {/* Left Column: Lessons awaiting review Table (7 cols) */}
          <section className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg sm:text-xl font-black text-[#10292e]">
                Lessons awaiting your review
              </h2>
              <span className="text-[11px] font-mono text-[#5a6e70] bg-[#f0f4f2] px-2.5 py-1 rounded-full">
                Lesson.versions[].state
              </span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-[#f0f4f2] text-[11px] font-extrabold uppercase tracking-wider text-[#5a6e70]">
                    <th className="pb-3 pr-4">TOPIC</th>
                    <th className="pb-3 px-4">COURSE</th>
                    <th className="pb-3 px-3">VERSION</th>
                    <th className="pb-3 px-3">STATE</th>
                    <th className="pb-3 pl-3 text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f7faf8] text-sm">
                  {reviewLessons.map((item) => (
                    <tr key={item.id} className="hover:bg-[#fafaf8] transition-colors">
                      <td className="py-4 pr-4 font-black text-[#10292e]">
                        {item.topic}
                      </td>
                      <td className="py-4 px-4 text-[#5a6e70] font-medium text-xs">
                        {item.course}
                      </td>
                      <td className="py-4 px-3 font-mono text-xs text-[#5a6e70]">
                        {item.version}
                      </td>
                      <td className="py-4 px-3">
                        {item.state === "AWAITING_REVIEW" && (
                          <span className="bg-[#fff1d6] text-[#b87e00] font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap">
                            AWAITING_REVIEW
                          </span>
                        )}
                        {item.state === "APPROVED" && (
                          <span className="bg-[#e6f7ec] text-[#1e7e34] font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap">
                            APPROVED
                          </span>
                        )}
                        {item.state === "REJECTED" && (
                          <span className="bg-[#fde8ec] text-[#d63384] font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full whitespace-nowrap">
                            REJECTED
                          </span>
                        )}
                      </td>
                      <td className="py-4 pl-3 text-right">
                        {item.state === "AWAITING_REVIEW" ? (
                          <Link
                            href={`/teacher/lessons?topic=${encodeURIComponent(item.topic)}`}
                            className="inline-block bg-[#ffa11f] hover:brightness-95 active:scale-95 text-[#10292e] font-extrabold text-xs px-4 py-1.5 rounded-full transition-all"
                          >
                            Review
                          </Link>
                        ) : (
                          <Link
                            href={`/teacher/lessons?topic=${encodeURIComponent(item.topic)}`}
                            className="inline-block bg-white hover:bg-[#fafaf8] active:scale-95 border-2 border-[#10292e] text-[#10292e] font-bold text-xs px-4 py-1 rounded-full transition-all"
                          >
                            Open
                          </Link>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Right Column: Quick actions & Generation jobs (5 cols) */}
          <div className="lg:col-span-5 space-y-7">
            {/* Quick Actions Card */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs">
              <h2 className="text-lg font-black text-[#10292e] mb-4">
                Quick actions
              </h2>
              <div className="space-y-3">
                <Link
                  href="/teacher/ai-generation"
                  className="w-full bg-[#ffa11f] hover:brightness-95 active:scale-[0.98] text-[#10292e] font-extrabold text-sm py-3 px-5 rounded-full block text-center transition-all shadow-xs"
                >
                  Generate lesson with AI
                </Link>

                <Link
                  href="/teacher/assessments"
                  className="w-full bg-white hover:bg-[#fafaf8] active:scale-[0.98] border-2 border-[#10292e] text-[#10292e] font-bold text-sm py-2.5 px-5 rounded-full block text-center transition-all"
                >
                  New assessment
                </Link>

                <Link
                  href="/teacher/courses?action=new"
                  className="w-full bg-white hover:bg-[#fafaf8] active:scale-[0.98] border-2 border-[#10292e] text-[#10292e] font-bold text-sm py-2.5 px-5 rounded-full block text-center transition-all"
                >
                  New course
                </Link>
              </div>
            </section>

            {/* Generation Jobs Card */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-[#10292e]">
                  Generation jobs
                </h2>
                <span className="text-[11px] font-mono text-[#5a6e70] bg-[#f0f4f2] px-2 py-0.5 rounded-full">
                  LessonGeneration
                </span>
              </div>

              <div className="space-y-4">
                {jobs.map((job) => (
                  <div key={job.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#10292e]">
                        {job.topic}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          job.status === "completed"
                            ? "bg-[#e6f7ec] text-[#1e7e34]"
                            : "bg-[#fff1d6] text-[#b87e00]"
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-2 bg-[#f0f4f2] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          job.status === "completed" ? "bg-[#1e7e34]" : "bg-[#ffa11f]"
                        }`}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-[#5a6e70] font-medium">
                      {job.message}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        {/* Bottom Card: Students who may need support */}
        <section className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-black text-[#10292e]">
              Students who may need support
            </h2>
            <span className="bg-[#fff1d6] text-[#b87e00] text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
              PROPOSED
            </span>
          </div>

          <p className="text-xs text-[#5a6e70] font-medium">
            Uses <code className="font-mono text-[#118a80]">Student.struggling_concepts</code>. Scoped to your classes once Enrollment exists.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div className="p-3.5 rounded-2xl bg-[#fff8ec] border border-[#ffd84a]/40">
              <span className="block text-xs font-black text-[#10292e]">
                Zero-Based Indexing
              </span>
              <span className="text-[11px] text-[#5a6e70]">
                4 students misidentified array 0-indexing
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#fff8ec] border border-[#ffd84a]/40">
              <span className="block text-xs font-black text-[#10292e]">
                Infinite Loops
              </span>
              <span className="text-[11px] text-[#5a6e70]">
                2 students missing while-loop step increment
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#fff8ec] border border-[#ffd84a]/40">
              <span className="block text-xs font-black text-[#10292e]">
                Variable Scope
              </span>
              <span className="text-[11px] text-[#5a6e70]">
                3 students referencing local inside outer scope
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
