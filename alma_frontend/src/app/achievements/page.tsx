"use client";

import { deferRequest } from "@/lib/defer-request";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import api from "@/services/api";
import {
  Award,
  Trophy,
  Sparkles,
  Flame,
  Zap,
  Lock,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

interface AchievementProgress {
  completed_lessons: number;
  total_lessons: number;
  percentage: number;
}

interface CourseAchievement {
  course_id: string;
  course_title: string;
  title: string;
  description: string;
  badge_icon: string;
  badge_color: string;
  category: string;
  is_unlocked: boolean;
  awarded_at?: string | null;
  progress: AchievementProgress;
}

interface AchievementsResponse {
  unlocked_count: number;
  locked_count: number;
  unlocked: CourseAchievement[];
  available: CourseAchievement[];
}

export default function AchievementsPage() {
  const [data, setData] = useState<AchievementsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"All" | "Unlocked" | "Locked">("All");

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await api.get("/achievements");
      if (res.data?.success && res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load achievements:", err);
      toast.error("Failed to load your achievements. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return deferRequest(() => {
      fetchAchievements();
    });
  }, []);

  const getIconComponent = (iconName: string) => {
    switch (iconName?.toLowerCase()) {
      case "award":
        return Award;
      case "flame":
        return Flame;
      case "zap":
        return Zap;
      case "sparkles":
        return Sparkles;
      case "trophy":
      default:
        return Trophy;
    }
  };

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "Unlocked";
    try {
      const d = new Date(dateStr);
      return `Earned ${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`;
    } catch {
      return "Earned";
    }
  };

  const available = data?.available || [];
  const filtered = available.filter((a) => {
    if (filter === "Unlocked") return a.is_unlocked;
    if (filter === "Locked") return !a.is_unlocked;
    return true;
  });

  const unlockedCount = data?.unlocked_count || 0;
  const totalBadges = available.length;

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              Course Achievements
            </h1>
            <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
              Complete each specific course curriculum to unlock its exclusive mastery badge.
            </p>
          </div>

          <button
            onClick={fetchAchievements}
            className="inline-flex items-center gap-1.5 self-start sm:self-auto text-xs font-bold text-[#118a80] hover:text-[#0f5953] bg-white border border-[#e8eeea] px-3.5 py-1.5 rounded-full shadow-2xs hover:bg-[#fafaf8] transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-[#8a999b] font-medium">Unlocked Badges</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#10292e] mt-0.5">
                {unlockedCount} / {totalBadges}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#fff8ec] text-[#ffa11f] flex items-center justify-center border border-[#fae2b8]">
              <Trophy size={24} />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-[#8a999b] font-medium">Locked Mastery</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#10292e] mt-0.5">
                {totalBadges - unlockedCount}
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#fafaf8] text-[#8a999b] flex items-center justify-center border border-[#e8eeea]">
              <Lock size={22} />
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs text-[#8a999b] font-medium">Mastery Progress</p>
              <p className="text-2xl sm:text-3xl font-extrabold text-[#118a80] mt-0.5">
                {totalBadges > 0 ? Math.round((unlockedCount / totalBadges) * 100) : 0}%
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#e6f5f2] text-[#118a80] flex items-center justify-center">
              <CheckCircle2 size={24} />
            </div>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex items-center gap-2 mb-6 border-b border-[#f0ede4] pb-3 text-xs font-bold">
          {(["All", "Unlocked", "Locked"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                filter === tab
                  ? "bg-[#10292e] text-white shadow-xs"
                  : "bg-white text-[#607274] hover:bg-[#fafaf8] border border-[#e8eeea]"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#8a999b]">
            <Loader2 className="w-8 h-8 animate-spin text-[#ffa11f] mb-2" />
            <p className="text-xs">Loading course achievements...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#e8eeea] p-8 space-y-3">
            <Trophy className="w-12 h-12 text-[#ffa11f] mx-auto opacity-40" />
            <h3 className="text-base font-extrabold text-[#10292e]">
              {filter === "Unlocked"
                ? "No Course Achievements Earned Yet"
                : "No Achievements Found"}
            </h3>
            <p className="text-xs text-[#8a999b] max-w-md mx-auto leading-relaxed">
              Complete all lessons in a course to automatically trigger and unlock its exclusive
              mastery badge!
            </p>
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs px-5 py-2.5 rounded-full transition-all shadow-xs"
            >
              <BookOpen size={14} />
              <span>Browse Courses</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((item) => {
              const IconComp = getIconComponent(item.badge_icon);
              const isUnlocked = item.is_unlocked;

              return (
                <div
                  key={item.course_id}
                  className={`rounded-3xl p-6 transition-all flex flex-col justify-between ${
                    isUnlocked
                      ? "bg-white border-2 border-[#118a80]/30 shadow-md hover:shadow-lg relative overflow-hidden"
                      : "bg-[#fafaf8] border border-[#e8eeea] opacity-80 hover:opacity-100"
                  }`}
                >
                  {isUnlocked && (
                    <div className="absolute top-0 right-0 bg-[#118a80] text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-bl-xl shadow-2xs">
                      Mastered
                    </div>
                  )}

                  <div>
                    {/* Badge Icon & Course Tag */}
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm ${
                          isUnlocked ? item.badge_color : "bg-[#d0d7d9] text-[#707e80]"
                        }`}
                      >
                        {isUnlocked ? (
                          <IconComp size={28} className="fill-white" />
                        ) : (
                          <Lock size={24} />
                        )}
                      </div>

                      <span className="text-[11px] font-bold text-[#8a999b] truncate max-w-[140px]">
                        {item.course_title}
                      </span>
                    </div>

                    {/* Achievement Details */}
                    <h3 className="text-base font-extrabold text-[#10292e] mb-1.5 flex items-center gap-2">
                      <span>{item.title}</span>
                    </h3>

                    <p className="text-xs text-[#607274] leading-relaxed mb-4">
                      {item.description}
                    </p>
                  </div>

                  {/* Footer: Progress / Unlocked Status + Action */}
                  <div className="pt-3 border-t border-[#f0ede4] space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      {isUnlocked ? (
                        <span className="text-[#118a80] font-bold flex items-center gap-1">
                          <CheckCircle2 size={14} />
                          {formatDate(item.awarded_at)}
                        </span>
                      ) : (
                        <span className="text-[#8a999b] font-medium">
                          {item.progress.completed_lessons} / {item.progress.total_lessons} lessons
                        </span>
                      )}

                      {!isUnlocked && (
                        <span className="font-bold text-[#10292e]">
                          {item.progress.percentage}%
                        </span>
                      )}
                    </div>

                    {!isUnlocked && (
                      <div className="w-full bg-[#e8eeea] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#ffa11f] h-full rounded-full transition-all duration-300"
                          style={{ width: `${item.progress.percentage}%` }}
                        />
                      </div>
                    )}

                    <Link
                      href={`/courses/${item.course_id}`}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                        isUnlocked
                          ? "bg-[#e6f5f2] hover:bg-[#d5eee9] text-[#118a80]"
                          : "bg-[#10292e] hover:bg-[#1b3438] text-white"
                      }`}
                    >
                      <span>{isUnlocked ? "Review Course" : "Continue Course"}</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
