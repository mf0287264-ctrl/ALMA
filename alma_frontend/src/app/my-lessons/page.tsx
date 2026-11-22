"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import MangoIcon from "@/components/MangoIcon";
import api from "@/services/api";
import {
  BookOpen,
  Sparkles,
  Clock,
  Play,
  CheckCircle2,
  GraduationCap,
  Search,
  Loader2,
  FolderOpen,
  ChevronRight,
  Layers,
  Award,
} from "lucide-react";

interface LessonItem {
  _id: string;
  topic: string;
  title?: string;
  course_id?: string;
  course_title?: string;
  module_id?: string;
  module_title?: string;
  programming_language?: string;
  grade_level?: string;
  target_duration_minutes?: number;
  status?: string;
}

interface ModuleGroup {
  module_id?: string;
  module_title: string;
  lessons: LessonItem[];
}

interface CourseGroup {
  course_id?: string;
  course_title: string;
  totalLessons: number;
  modules: ModuleGroup[];
}

export default function MyLessonsPage() {
  const [courses, setCourses] = useState<CourseGroup[]>([]);
  const [selectedCourseTitle, setSelectedCourseTitle] = useState<string>("");
  const [teacherLessons, setTeacherLessons] = useState<LessonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchMyLessons = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/lessons/my-lessons");
      const data = res.data?.data;
      if (data) {
        const available: LessonItem[] = data.available_lessons || [];
        setTeacherLessons(data.teacher_lessons || []);

        // Group available lessons by Course and then by Module
        const coursesMap: Record<string, { course_id?: string; course_title: string; totalLessons: number; modulesMap: Record<string, ModuleGroup> }> = {};

        available.forEach((l) => {
          const cTitle = l.course_title || "Platform Course";
          if (!coursesMap[cTitle]) {
            coursesMap[cTitle] = {
              course_id: l.course_id,
              course_title: cTitle,
              totalLessons: 0,
              modulesMap: {},
            };
          }
          coursesMap[cTitle].totalLessons += 1;

          const mTitle = l.module_title || "Core Concepts";
          if (!coursesMap[cTitle].modulesMap[mTitle]) {
            coursesMap[cTitle].modulesMap[mTitle] = {
              module_id: l.module_id,
              module_title: mTitle,
              lessons: [],
            };
          }
          coursesMap[cTitle].modulesMap[mTitle].lessons.push(l);
        });

        const groupedCourses: CourseGroup[] = Object.values(coursesMap).map((c) => ({
          course_id: c.course_id,
          course_title: c.course_title,
          totalLessons: c.totalLessons,
          modules: Object.values(c.modulesMap),
        }));

        setCourses(groupedCourses);
        if (groupedCourses.length > 0) {
          setSelectedCourseTitle(groupedCourses[0].course_title);
        }
      }
    } catch (err: any) {
      console.error("Failed to load lessons from database:", err);
      setError("Could not load your lessons. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyLessons();
  }, []);

  const activeCourse = courses.find((c) => c.course_title === selectedCourseTitle) || courses[0];

  const query = search.toLowerCase();
  const filteredTeacher = teacherLessons.filter(
    (l) =>
      l.topic?.toLowerCase().includes(query) ||
      l.course_title?.toLowerCase().includes(query) ||
      l.programming_language?.toLowerCase().includes(query)
  );

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              My Lessons
            </h1>
            <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
              Select a course to view all its modules and lessons, or start an assigned teacher lesson.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/courses"
              className="px-5 py-2 bg-white border border-[#e8eeea] text-[#10292e] hover:bg-[#fafaf8] rounded-full text-xs font-bold transition-colors shadow-2xs"
            >
              Browse All Courses &rarr;
            </Link>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 text-[#118a80] animate-spin mb-3" />
            <p className="text-sm font-bold text-[#10292e]">Loading your courses &amp; lessons...</p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="p-8 bg-white rounded-3xl border border-red-200 text-center max-w-md mx-auto my-12">
            <p className="text-sm font-semibold text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchMyLessons}
              className="px-5 py-2.5 bg-[#ffa11f] text-[#10292e] rounded-full text-xs font-bold hover:brightness-95 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-8">
            {/* TEACHER GROUP LESSONS (Classroom Assignments) */}
            {teacherLessons.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#e6f5f2] text-[#118a80] flex items-center justify-center">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-[#10292e]">
                        Teacher Classroom Lessons
                      </h2>
                      <p className="text-xs text-[#8a999b]">
                        Custom AI lessons generated by your teacher for your classroom.
                      </p>
                    </div>
                  </div>
                  <span className="bg-[#e6f5f2] text-[#118a80] text-xs font-bold px-3 py-1 rounded-full">
                    {teacherLessons.length} Assigned
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredTeacher.map((lesson) => (
                    <div
                      key={lesson._id}
                      className="p-4 rounded-2xl bg-[#fafaf8] border border-[#e8eeea] hover:border-[#118a80]/50 transition-all flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-[#118a80] text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                            Assigned
                          </span>
                          <span className="text-xs text-[#8a999b] truncate">
                            {lesson.programming_language || "Python"} · {lesson.grade_level || "Grade 8"}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-sm text-[#10292e] truncate">
                          {lesson.topic}
                        </h3>
                        <div className="text-[11px] text-[#8a999b] flex items-center gap-1 mt-1 font-mono">
                          <Clock className="w-3 h-3" /> {lesson.target_duration_minutes || 15}m
                        </div>
                      </div>

                      <Link
                        href={`/my-lessons/player?lessonId=${lesson._id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#118a80] hover:bg-[#0e746b] text-white rounded-full font-extrabold text-xs shadow-xs transition-colors shrink-0"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        Start
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MAIN 2-COLUMN LAYOUT: COURSES ON LEFT -> MODULES & LESSONS ON RIGHT */}
            {courses.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-[#e8eeea] max-w-lg mx-auto">
                <FolderOpen className="w-12 h-12 text-[#8a999b] mx-auto mb-3 opacity-60" />
                <h3 className="text-base font-extrabold text-[#10292e]">No lessons available</h3>
                <p className="text-xs text-[#607274] mt-1 mb-6">
                  Enroll in a course from our catalog to unlock its full curriculum.
                </p>
                <Link
                  href="/courses"
                  className="inline-block px-6 py-2.5 bg-[#ffa11f] text-[#10292e] font-extrabold text-xs rounded-full shadow-xs"
                >
                  Explore Courses &rarr;
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Courses Selector (4 cols) */}
                <div className="lg:col-span-4 space-y-6">
                  {/* Courses Selector Card */}
                  <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-extrabold text-base text-[#10292e]">
                        My Courses
                      </h3>
                      <span className="bg-[#fff5e6] text-[#ffa11f] text-xs font-bold px-2.5 py-0.5 rounded-full">
                        {courses.length} Courses
                      </span>
                    </div>
                    <p className="text-xs text-[#8a999b] mb-4">
                      Click a course to view all of its lessons.
                    </p>

                    <div className="space-y-3">
                      {courses.map((c) => {
                        const isSelected = c.course_title === activeCourse?.course_title;
                        return (
                          <button
                            key={c.course_title}
                            onClick={() => setSelectedCourseTitle(c.course_title)}
                            className={`w-full text-left p-4 rounded-2xl transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? "border-2 border-[#ffa11f] bg-[#fffcf7] shadow-xs"
                                : "border border-[#e8eeea] bg-[#fafaf8] hover:bg-white"
                            }`}
                          >
                            <div>
                              <div className="font-extrabold text-sm text-[#10292e]">
                                {c.course_title}
                              </div>
                              <div className="text-xs text-[#8a999b] mt-0.5 flex items-center gap-2">
                                <span>{c.modules.length} modules</span>
                                <span>·</span>
                                <span>{c.totalLessons} lessons</span>
                              </div>
                            </div>
                            <ChevronRight
                              className={`w-4 h-4 transition-transform ${
                                isSelected ? "text-[#ffa11f] translate-x-1" : "text-[#8a999b]"
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Mascot Motivation Card */}
                  <div className="bg-[#fff3db] rounded-3xl p-6 text-center border border-[#fae2b8] flex flex-col items-center justify-center">
                    <div className="w-20 h-20 relative flex items-center justify-center mb-3">
                      <MangoIcon size={64} animated />
                    </div>
                    <h4 className="font-black text-sm text-[#10292e]">
                      One lesson at a time
                    </h4>
                    <p className="text-xs text-[#607274] mt-1 mb-3">
                      Completing interactive checkpoints strengthens your problem-solving intuition.
                    </p>
                    <div className="w-full pt-3 border-t border-[#fae2b8]/60 flex items-center justify-around text-center text-xs">
                      <div>
                        <div className="font-black text-base text-[#10292e]">
                          {courses.reduce((sum, c) => sum + c.totalLessons, 0)}
                        </div>
                        <div className="text-[10px] text-[#8a999b]">Available Lessons</div>
                      </div>
                      <div className="w-px h-6 bg-[#fae2b8]" />
                      <div>
                        <div className="font-black text-base text-[#118a80]">
                          {courses.length}
                        </div>
                        <div className="text-[10px] text-[#8a999b]">Active Courses</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Selected Course's Modules & Lessons (8 cols) */}
                <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#e8eeea] shadow-xs space-y-6">
                  {/* Active Course Banner */}
                  <div className="border-b border-[#f0f0eb] pb-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
                      <div>
                        <span className="text-xs font-bold text-[#ffa11f] uppercase tracking-wider block mb-0.5">
                          Active Course
                        </span>
                        <h2 className="text-2xl font-black text-[#10292e]">
                          {activeCourse?.course_title}
                        </h2>
                      </div>
                      {activeCourse?.course_id && (
                        <Link
                          href={`/courses/${activeCourse.course_id}`}
                          className="text-xs font-bold text-[#118a80] hover:underline self-start sm:self-auto"
                        >
                          View Syllabus &rarr;
                        </Link>
                      )}
                    </div>
                    <p className="text-xs text-[#8a999b]">
                      {activeCourse?.modules.length} modules · {activeCourse?.totalLessons} total lessons
                    </p>
                  </div>

                  {/* Modules Accordion / List */}
                  <div className="space-y-6">
                    {activeCourse?.modules.map((m, mIdx) => (
                      <div
                        key={m.module_id || mIdx}
                        className="border border-[#e8eeea] rounded-2xl p-5 bg-white space-y-3"
                      >
                        {/* Module Header */}
                        <div className="flex items-center justify-between pb-2 border-b border-[#f5f6f4]">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-full bg-[#e6f5f2] text-[#118a80] text-xs font-bold flex items-center justify-center">
                              {mIdx + 1}
                            </span>
                            <h3 className="font-extrabold text-sm sm:text-base text-[#10292e]">
                              {m.module_title}
                            </h3>
                          </div>
                          <span className="text-xs text-[#8a999b] font-medium">
                            {m.lessons.length} {m.lessons.length === 1 ? "lesson" : "lessons"}
                          </span>
                        </div>

                        {/* Lessons List inside this Module */}
                        <div className="space-y-2.5 pt-1">
                          {m.lessons.map((lesson) => (
                            <div
                              key={lesson._id}
                              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#fafaf8] rounded-xl border border-[#f0f0eb] hover:bg-white hover:border-[#ffa11f]/40 transition-all"
                            >
                              <div className="min-w-0">
                                <div className="font-bold text-sm text-[#10292e] truncate">
                                  {lesson.topic}
                                </div>
                                <div className="text-xs text-[#8a999b] flex items-center gap-1.5 mt-0.5">
                                  <Clock className="w-3 h-3" />
                                  <span>{lesson.target_duration_minutes || 15} minutes</span>
                                </div>
                              </div>

                              <Link
                                href={`/my-lessons/player?lessonId=${lesson._id}${
                                  lesson.course_id ? `&courseId=${lesson.course_id}` : ""
                                }`}
                                className="inline-flex items-center justify-center gap-1.5 px-5 py-2 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] rounded-full font-extrabold text-xs shadow-xs transition-colors self-start sm:self-auto shrink-0"
                              >
                                <Play className="w-3 h-3 fill-current" />
                                Start
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
