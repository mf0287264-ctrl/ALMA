"use client";

import { deferRequest } from "@/lib/defer-request";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import api from "@/services/api";
import { useAuth } from "@/app/_Context/AuthContext";
import {
  ArrowRight,
  Flame,
  Trophy,
  Award,
  BookOpen,
  Sparkles,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
  Zap,
} from "lucide-react";

interface StrugglingConcept {
  concept_id: string;
  concept_label: string;
  times_tested: number;
  times_wrong: number;
  last_diagnosed_misconception?: string | null;
}

interface AchievementItem {
  _id: string;
  title: string;
  description: string;
  badge_icon?: string;
  category: string;
  awarded_at: string;
}

interface RecentSessionItem {
  id: string;
  title: string;
  course_name: string;
  status: string;
  type: "lesson" | "quiz" | "assessment";
  date: string;
  detail: string;
}

interface DashboardData {
  student: {
    _id: string;
    first_name: string;
    last_name?: string;
    student_code: string;
    grade_level: string;
    current_streak: number;
    longest_streak: number;
    lessons_completed: number;
    xp: number;
    level: number;
    personalized_greeting: string;
  };
  continue_learning: {
    _id?: string;
    lesson_id?: string;
    lesson_title?: string;
    course_name?: string;
    current_section_order?: number;
    total_sections?: number;
    status?: string;
    course_id?: string;
  } | null;
  daily_goal: {
    target: number;
    completed_today: number;
  };
  struggling_concepts: StrugglingConcept[];
  recent_achievements: AchievementItem[];
  recent_sessions: RecentSessionItem[];
}

export default function HomePage() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get("/students/dashboard-summary");
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      }
    } catch (err: unknown) {
      console.error("Error loading dashboard data:", err);
      setError("Unable to load real-time dashboard data. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return deferRequest(() => {
      fetchDashboard();
    });
  }, []);

  // Student profile fallbacks from AuthContext while loading
  const firstName =
    data?.student?.first_name ||
    user?.first_name ||
    (user?.name ? user.name.split(" ")[0] : "Student");
  const currentStreak = data?.student?.current_streak ?? user?.current_streak ?? 0;
  const longestStreak = data?.student?.longest_streak ?? user?.longest_streak ?? 0;
  const lessonsCompleted = data?.student?.lessons_completed ?? user?.lessons_completed ?? 0;
  const xp = data?.student?.xp ?? 0;
  const level = data?.student?.level ?? 1;

  const greeting =
    data?.student?.personalized_greeting ||
    (currentStreak > 0
      ? `You're on a ${currentStreak}-day streak! Let's keep learning today.`
      : "Welcome to ALMA! Ready to discover the magic of algorithms and code?");

  const getAchievementIcon = (category: string) => {
    switch (category?.toLowerCase()) {
      case "streak":
        return { icon: Flame, color: "bg-[#59b8eb]" };
      case "quiz":
        return { icon: Trophy, color: "bg-[#f25c78]" };
      case "learning":
      default:
        return { icon: Award, color: "bg-[#ffa11f]" };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recent";
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              Hi, {firstName}
            </h1>
            <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
              ALMA: &ldquo;{greeting}&rdquo;
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            <button
              onClick={fetchDashboard}
              title="Refresh dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#118a80] hover:text-[#0f5953] bg-white border border-[#e8eeea] px-3.5 py-1.5 rounded-full shadow-2xs hover:bg-[#fafaf8] transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Sync</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="p-4 mb-6 rounded-2xl bg-[#fff0f3] border border-[#f4c8ce] text-[#f25c78] text-xs font-medium flex items-center justify-between">
            <span>{error}</span>
            <button onClick={fetchDashboard} className="underline font-bold">
              Try again
            </button>
          </div>
        )}

        {/* 4 Real Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 my-6">
          <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#8a999b] font-medium mb-1">
              <span>Current streak</span>
              <Flame className="w-4 h-4 text-[#ffa11f]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#10292e]">
              {currentStreak} {currentStreak === 1 ? "day" : "days"}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#8a999b] font-medium mb-1">
              <span>Longest streak</span>
              <Zap className="w-4 h-4 text-[#59b8eb]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#10292e]">
              {longestStreak} {longestStreak === 1 ? "day" : "days"}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#8a999b] font-medium mb-1">
              <span>Lessons completed</span>
              <CheckCircle2 className="w-4 h-4 text-[#118a80]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#10292e]">
              {lessonsCompleted}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs">
            <div className="flex items-center justify-between text-xs text-[#8a999b] font-medium mb-1">
              <span>XP & Level</span>
              <Sparkles className="w-4 h-4 text-[#a855f7]" />
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-[#10292e]">
              {xp} <span className="text-sm font-bold text-[#8a999b]">· Lvl {level}</span>
            </div>
          </div>
        </div>

        {/* Row 2: Continue Learning & Daily Goal */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Continue Learning Card */}
          <div className="lg:col-span-2 bg-[#0f5953] rounded-3xl p-6 sm:p-7 text-white shadow-sm flex flex-col justify-between">
            {data?.continue_learning ? (
              <>
                <div>
                  <span className="text-emerald-200/90 text-xs font-semibold tracking-wider uppercase">
                    Continue learning
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-2">
                    {data.continue_learning.lesson_title}
                  </h2>
                  <p className="text-emerald-100/80 text-xs font-medium">
                    {data.continue_learning.course_name} · Section{" "}
                    {data.continue_learning.current_section_order || 1} of{" "}
                    {data.continue_learning.total_sections || 4}
                  </p>
                </div>

                <div className="mt-6">
                  <div className="flex items-center justify-between text-xs text-emerald-200/90 font-mono mb-2">
                    <span>
                      Section {data.continue_learning.current_section_order || 1} of{" "}
                      {data.continue_learning.total_sections || 4}
                    </span>
                    <span>
                      {Math.round(
                        ((data.continue_learning.current_section_order || 1) /
                          (data.continue_learning.total_sections || 4)) *
                          100
                      )}
                      % completed
                    </span>
                  </div>
                  <div className="w-full bg-[#0a3f3b] h-2.5 rounded-full overflow-hidden flex">
                    <div
                      className="bg-[#ffa11f] h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            10,
                            Math.round(
                              ((data.continue_learning.current_section_order || 1) /
                                (data.continue_learning.total_sections || 4)) *
                                100
                            )
                          )
                        )}%`,
                      }}
                    />
                  </div>

                  <div className="mt-5">
                    <Link
                      href={
                        data.continue_learning.lesson_id
                          ? `/my-lessons/player?lessonId=${data.continue_learning.lesson_id}${
                              data.continue_learning.course_id
                                ? `&courseId=${data.continue_learning.course_id}`
                                : ""
                            }`
                          : "/my-lessons"
                      }
                      className="inline-flex items-center gap-2 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-sm px-6 py-2.5 rounded-full shadow-sm transition-all"
                    >
                      Resume lesson <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <div className="py-6 flex flex-col justify-between h-full">
                <div>
                  <span className="text-emerald-200/90 text-xs font-semibold tracking-wider uppercase">
                    Get Started
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 mb-2">
                    Start Your First Course
                  </h2>
                  <p className="text-emerald-100/80 text-xs font-medium max-w-md leading-relaxed">
                    Choose from Python, Data Structures, Algorithms and computational thinking to
                    begin your personalized learning track.
                  </p>
                </div>

                <div className="mt-6">
                  <Link
                    href="/courses"
                    className="inline-flex items-center gap-2 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-sm px-6 py-2.5 rounded-full shadow-sm transition-all"
                  >
                    Explore Courses →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Daily Goal Card */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between text-xs text-[#8a999b] font-medium mb-2">
                <span className="font-bold text-[#10292e]">Daily goal</span>
                <span className="text-[#118a80] font-semibold">Today</span>
              </div>
              <div className="text-4xl font-black text-[#10292e] my-3">
                {data?.daily_goal?.completed_today || 0}/{data?.daily_goal?.target || 2}
              </div>
              <div className="w-full bg-[#f1f3f2] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#ffa11f] h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(
                        ((data?.daily_goal?.completed_today || 0) /
                          (data?.daily_goal?.target || 2)) *
                          100
                      )
                    )}%`,
                  }}
                />
              </div>
            </div>

            <p className="text-[11px] text-[#8a999b] leading-relaxed mt-4">
              {(data?.daily_goal?.completed_today || 0) >= (data?.daily_goal?.target || 2)
                ? "Daily goal reached! Keep up the great momentum or take a well-deserved break."
                : `Complete ${
                    (data?.daily_goal?.target || 2) - (data?.daily_goal?.completed_today || 0)
                  } more lesson or quiz to hit today's daily learning target.`}
            </p>
          </div>
        </div>

        {/* Row 3: Practice These & Recent Achievements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Practice these (Struggling Concepts) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-extrabold text-lg text-[#10292e]">Practice these</h3>
              <span className="text-xs text-[#8a999b] font-medium">Adaptive Review</span>
            </div>
            <p className="text-xs text-[#8a999b] mb-4">
              Review concepts identified from your diagnostic checkpoints and quizzes.
            </p>

            {data?.struggling_concepts && data.struggling_concepts.length > 0 ? (
              <div className="space-y-4">
                {data.struggling_concepts.map((concept) => {
                  const percentWrong =
                    concept.times_tested > 0
                      ? Math.round((concept.times_wrong / concept.times_tested) * 100)
                      : 40;

                  return (
                    <div
                      key={concept.concept_id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#fafaf8] rounded-2xl border border-[#f0f0eb]"
                    >
                      <div className="flex-1">
                        <div className="font-bold text-sm text-[#10292e]">
                          {concept.concept_label}
                        </div>
                        <div className="text-xs text-[#8a999b] mt-0.5">
                          wrong {concept.times_wrong} of {concept.times_tested}
                          {concept.last_diagnosed_misconception && (
                            <> · last: {concept.last_diagnosed_misconception}</>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-28 bg-[#e8eeea] h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-[#f25c78] h-full rounded-full"
                            style={{ width: `${percentWrong}%` }}
                          />
                        </div>
                        <Link
                          href="/quize"
                          className="border border-[#10292e] text-[#10292e] hover:bg-[#10292e] hover:text-white text-xs font-bold px-4 py-1.5 rounded-full transition-colors"
                        >
                          Practice
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-[#fafaf8] rounded-2xl border border-[#f0f0eb] space-y-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-[#10292e]">All concepts mastered</h4>
                <p className="text-xs text-[#8a999b] max-w-sm mx-auto">
                  As you complete lessons and quizzes, challenging topics will automatically appear
                  here for quick review.
                </p>
                <Link
                  href="/quize"
                  className="inline-block text-xs font-bold text-[#118a80] hover:underline"
                >
                  Take a diagnostic quiz →
                </Link>
              </div>
            )}
          </div>

          {/* Recent achievements */}
          <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-lg text-[#10292e]">Recent achievements</h3>
                <span className="text-xs text-[#8a999b]">Badges</span>
              </div>

              {data?.recent_achievements && data.recent_achievements.length > 0 ? (
                <div className="space-y-3">
                  {data.recent_achievements.map((ach) => {
                    const { icon: AchIcon, color } = getAchievementIcon(ach.category);
                    return (
                      <div
                        key={ach._id}
                        className="flex items-center gap-3.5 p-3 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb]"
                      >
                        <div
                          className={`w-10 h-10 rounded-2xl ${color} flex items-center justify-center text-white shrink-0 shadow-2xs`}
                        >
                          <AchIcon className="w-5 h-5 fill-white" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs sm:text-sm text-[#10292e] truncate">
                            {ach.title}
                          </div>
                          <div className="text-[11px] text-[#8a999b] truncate">
                            {ach.category} · {formatDate(ach.awarded_at)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-6 text-center bg-[#fafaf8] rounded-2xl border border-[#f0f0eb] space-y-2">
                  <Award className="w-8 h-8 text-[#ffa11f] mx-auto opacity-70" />
                  <p className="text-xs font-bold text-[#10292e]">No Badges Earned Yet</p>
                  <p className="text-[11px] text-[#8a999b]">
                    Complete your first lesson or maintain a 3-day streak to unlock your first badge!
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-[#f0f0eb]">
              <Link
                href="/achievements"
                className="text-xs font-bold text-[#118a80] hover:underline flex items-center gap-1"
              >
                View all achievements <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Row 4: Recent sessions */}
        <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-extrabold text-lg text-[#10292e]">Recent sessions</h3>
            <span className="text-xs text-[#8a999b]">Activity History</span>
          </div>

          {data?.recent_sessions && data.recent_sessions.length > 0 ? (
            <div className="divide-y divide-[#f0f0eb]">
              {data.recent_sessions.map((session) => (
                <div
                  key={session.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#118a80]" />
                    <div>
                      <span className="font-bold text-sm text-[#10292e] block">
                        {session.title}
                      </span>
                      <span className="text-xs text-[#8a999b]">{session.course_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs self-start sm:self-auto">
                    <span
                      className={`px-2.5 py-0.5 rounded-full font-semibold capitalize ${
                        session.status === "completed"
                          ? "bg-[#e8eeea] text-[#607274]"
                          : session.status === "active"
                          ? "bg-[#e6f5f2] text-[#118a80]"
                          : "bg-[#fff0f3] text-[#f25c78]"
                      }`}
                    >
                      {session.status}
                    </span>
                    <span className="text-[#8a999b]">
                      {session.detail} · {formatDate(session.date)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center text-xs text-[#8a999b]">
              No learning sessions recorded yet. Start a lesson to see your history here!
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
