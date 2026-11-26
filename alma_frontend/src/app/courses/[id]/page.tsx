"use client";

import { apiError } from "@/lib/api-error";

import { isAxiosError } from "axios";

import React, { use, useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import api from "@/services/api";
import { CheckCircle2, Circle, BookOpen, Clock, Loader2, Lock, ArrowRight, Trophy, Award } from "lucide-react";
import { toast } from "sonner";

interface LessonData {
  _id: string;
  topic: string;
  target_duration_minutes?: number;
  programming_language?: string;
}

interface ModuleData {
  _id: string;
  title: string;
  description?: string;
  order: number;
  learning_objectives?: string[];
  status?: string;
  lessons?: LessonData[];
}

interface CourseDetail {
  _id: string;
  title: string;
  description?: string;
  subject: string;
  grade_level: string;
  curriculum?: string;
  language?: string;
  modules?: ModuleData[];
  is_enrolled?: boolean;
}

function CourseDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const courseId = resolvedParams.id;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState(false);
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    async function loadCourse() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/courses/${courseId}`);
        if (res.data?.data) {
          setCourse(res.data.data);
        } else {
          setError("Course not found in database.");
        }
      } catch (err: unknown) {
        console.error("Failed to load course details:", err);
        setError("Could not load course information from database.");
      } finally {
        setLoading(false);
      }
    }

    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const handleEnroll = async () => {
    if (!course) return;
    try {
      setEnrolling(true);
      await api.post(`/courses/${course._id}/enroll`);
      toast.success("Enrolled in course successfully!");
      setCourse((prev) => (prev ? { ...prev, is_enrolled: true } : prev));
    } catch (err: unknown) {
      if (isAxiosError(err) && err.response?.status === 401) {
        toast.error("Please log in to enroll in this course.");
        router.push("/login");
      } else {
        toast.error(apiError(err, "Failed to enroll. Please try again."));
      }
    } finally {
      setEnrolling(false);
    }
  };

  const handleClaimAchievement = async () => {
    if (!course) return;
    try {
      setClaiming(true);
      const res = await api.post(`/courses/${course._id}/complete`, { force: true });
      if (res.data?.success && res.data?.data) {
        if (res.data.data.awarded) {
          toast.success(res.data.data.message || `You earned the achievement for ${course.title}!`, {
            duration: 6000,
          });
          router.push("/achievements");
        } else {
          toast.info(res.data.data.message || "Course achievement status updated.");
        }
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(apiError(error, "Failed to claim achievement."));
    } finally {
      setClaiming(false);
    }
  };

  const modules = course?.modules || [];
  const totalLessons = modules.reduce((sum, m) => sum + (m.lessons?.length || 0), 0);
  const allObjectives = Array.from(
    new Set(modules.flatMap((m) => m.learning_objectives || []))
  );
  const firstLesson = modules.flatMap((m) => m.lessons || [])[0];

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {/* Loading Spinner */}
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 text-[#118a80] animate-spin mb-3" />
            <p className="text-sm font-bold text-[#10292e]">Loading course content from database...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-8 bg-white rounded-3xl border border-red-200 text-center max-w-md mx-auto my-12">
            <p className="text-sm font-semibold text-red-600 mb-4">{error}</p>
            <Link
              href="/courses"
              className="inline-block px-5 py-2.5 bg-[#ffa11f] text-[#10292e] rounded-full text-xs font-bold hover:brightness-95"
            >
              &larr; Back to all courses
            </Link>
          </div>
        )}

        {/* Loaded Course Content */}
        {!loading && course && (
          <>
            {/* Header and Action */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
                  {course.title}
                </h1>
                <nav className="text-xs text-[#8a999b] mt-1 font-medium">
                  <Link href="/courses" className="hover:underline">
                    Courses
                  </Link>{" "}
                  &rsaquo; <span className="text-[#10292e]">{course.title}</span>
                </nav>
              </div>

              {course.is_enrolled ? (
                <Link
                  href={firstLesson ? `/my-lessons/player?lessonId=${firstLesson._id}&courseId=${course._id}` : `/courses`}
                  className="inline-flex items-center justify-center bg-[#118a80] hover:bg-[#0f7a71] text-white font-extrabold text-sm px-6 py-2.5 rounded-full shadow-sm transition-all self-start sm:self-auto"
                >
                  Start Lesson &rarr;
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="inline-flex items-center justify-center bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-sm px-6 py-2.5 rounded-full shadow-sm transition-all self-start sm:self-auto cursor-pointer disabled:opacity-60 gap-2"
                >
                  {enrolling ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Enrolling...</span>
                    </>
                  ) : (
                    "Enroll in course"
                  )}
                </button>
              )}
            </div>

            {/* Content Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Left: About & Modules */}
              <div className="lg:col-span-2 space-y-6">
                {/* About Card */}
                <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
                  <h2 className="text-lg font-extrabold text-[#10292e] mb-2">
                    About this course
                  </h2>
                  <p className="text-xs sm:text-sm text-[#607274] leading-relaxed mb-4">
                    {course.description || "Master essential programming fundamentals through structured modules and hands-on practice."}
                  </p>

                  {/* Dynamic Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    <span className="bg-[#e9f4fb] text-[#2b88d8] text-xs font-semibold px-3 py-1 rounded-full">
                      {course.subject}
                    </span>
                    <span className="bg-[#e9f4fb] text-[#2b88d8] text-xs font-semibold px-3 py-1 rounded-full">
                      {course.grade_level}
                    </span>
                    <span className="bg-[#e9f4fb] text-[#2b88d8] text-xs font-semibold px-3 py-1 rounded-full">
                      {course.curriculum || "General"}
                    </span>
                    <span className="bg-[#e9f4fb] text-[#2b88d8] text-xs font-semibold px-3 py-1 rounded-full uppercase">
                      {course.language || "en"}
                    </span>
                  </div>

                  {/* Summary Stats */}
                  <div className="pt-3 border-t border-[#f0f0eb] flex items-center justify-between text-xs text-[#8a999b]">
                    <span>{modules.length} {modules.length === 1 ? "module" : "modules"}</span>
                    <span>{totalLessons} lessons total</span>
                  </div>
                </div>

                {/* Modules List from DB */}
                <div className="space-y-4">
                  <h2 className="text-lg font-extrabold text-[#10292e]">Modules &amp; Lessons</h2>

                  {modules.length === 0 ? (
                    <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] text-center text-xs text-[#8a999b]">
                      No modules created for this course yet.
                    </div>
                  ) : (
                    modules.map((m, idx) => (
                      <div
                        key={m._id || idx}
                        className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-extrabold text-base text-[#10292e]">
                            {m.order || idx + 1} · {m.title}
                          </h3>
                          <span className="bg-[#e6f5f2] text-[#118a80] text-xs font-semibold px-2.5 py-0.5 rounded-full">
                            Published
                          </span>
                        </div>

                        {m.description && (
                          <p className="text-xs text-[#607274] mb-4">{m.description}</p>
                        )}

                        {/* Lessons inside this module */}
                        {m.lessons && m.lessons.length > 0 ? (
                          <div className="space-y-2.5 pt-2 border-t border-[#f0f0eb]">
                            <span className="text-[11px] font-bold text-[#8a999b] uppercase tracking-wider block">
                              Lessons
                            </span>
                            {m.lessons.map((lesson, lIdx) => (
                              <div
                                key={lesson._id || lIdx}
                                className="flex items-center justify-between p-3 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb] text-xs sm:text-sm text-[#10292e]"
                              >
                                <div className="flex items-center gap-2.5">
                                  <Circle className="w-3 h-3 text-[#118a80] fill-[#118a80]/20" />
                                  <span className="font-semibold">{lesson.topic}</span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-[#8a999b]">
                                  <span className="flex items-center gap-1 font-mono text-[11px]">
                                    <Clock className="w-3 h-3" />
                                    {lesson.target_duration_minutes || 15}m
                                  </span>
                                  {course.is_enrolled ? (
                                    <Link
                                      href={`/my-lessons/player?lessonId=${lesson._id}&courseId=${course._id}`}
                                      className="px-3.5 py-1 bg-white border border-[#10292e] text-[#10292e] hover:bg-[#10292e] hover:text-white rounded-full font-bold text-[11px] transition-colors"
                                    >
                                      Start
                                    </Link>
                                  ) : (
                                    <span className="px-3 py-1 bg-[#f0f2f1] text-[#8a999b] rounded-full font-semibold text-[11px] flex items-center gap-1">
                                      <Lock className="w-3 h-3" /> Enroll to start
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-[#8a999b] italic pt-2">No lessons in this module yet.</p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Right Column: Objectives (Removed static ALMA Adaptive Tutor card) */}
              <div className="space-y-6">
                {/* Dynamic Learning Objectives */}
                <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-base text-[#10292e]">
                      Learning objectives
                    </h3>
                    <span className="bg-[#fff5e6] text-[#ffa11f] text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold">
                      Curriculum
                    </span>
                  </div>

                  {allObjectives.length > 0 ? (
                    <ul className="space-y-2.5 text-xs sm:text-sm text-[#607274]">
                      {allObjectives.map((obj, oIdx) => (
                        <li key={oIdx} className="flex items-start gap-2.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#ffa11f] mt-1.5 shrink-0" />
                          <span>{obj}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-[#8a999b]">Objectives mapped directly to lesson checkpoints.</p>
                  )}
                </div>

                {/* Course Achievement Card */}
                <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-[#ffa11f] tracking-wider">
                      Course Mastery Badge
                    </span>
                    <Trophy className="w-4 h-4 text-[#ffa11f]" />
                  </div>
                  <h4 className="font-extrabold text-sm text-[#10292e]">
                    Mastery Achievement
                  </h4>
                  <p className="text-xs text-[#607274] leading-relaxed">
                    Finish all lessons in {course.title} to automatically unlock its exclusive mastery achievement badge on your profile.
                  </p>

                  {course.is_enrolled && (
                    <button
                      onClick={handleClaimAchievement}
                      disabled={claiming}
                      className="w-full mt-2 py-2.5 px-4 bg-[#fff8ec] hover:bg-[#fae2b8] text-[#ffa11f] border border-[#fae2b8] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                    >
                      {claiming ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <>
                          <Award size={14} />
                          <span>Complete & Claim Badge</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#fafaf8]">
          <Loader2 className="w-8 h-8 animate-spin text-[#118a80]" />
        </div>
      }
    >
      <CourseDetailContent params={params} />
    </Suspense>
  );
}
