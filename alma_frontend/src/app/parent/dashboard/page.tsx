"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/app/_Context/AuthContext";
import api from "@/services/api";
import {
  Flame,
  BookOpen,
  CheckCircle2,
  Clock,
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  Sparkles
} from "lucide-react";

interface LinkedChild {
  student_id: string;
  _id: string;
  first_name: string;
  last_name: string;
  student_code: string;
  grade_level: string;
  school_name?: string | null;
  current_streak: number;
  longest_streak: number;
  lessons_completed: number;
  checkpoint_accuracy?: number;
  on_track?: boolean;
  struggling_concepts?: Array<{
    concept_id: string;
    concept_label: string;
    times_tested?: number;
    times_wrong?: number;
    last_diagnosed_misconception?: string | null;
  }>;
  weekly_activity?: Record<string, number>;
}

export default function ParentOverviewPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const parentFirstName = user?.first_name || (user?.name?.split(" ")[0]) || "Mona";

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Get linked children
      const childrenRes = await api.get("/parents/children").catch(() => null);
      let kids: LinkedChild[] = childrenRes?.data?.data || [];

      // If empty, try fetching via profile.children
      if (kids.length === 0) {
        const profRes = await api.get("/parents/profile").catch(() => null);
        const childIds: string[] = profRes?.data?.data?.children || [];
        if (childIds.length > 0) {
          const detailPromises = childIds.map((cid) =>
            api.get(`/parents/child/${cid}/progress`).then((r) => r.data?.data).catch(() => null)
          );
          const detailed = await Promise.all(detailPromises);
          kids = detailed.filter(Boolean);
        }
      }

      setChildren(kids);
      if (kids.length > 0 && !selectedChildId) {
        setSelectedChildId(kids[0]._id || kids[0].student_id);
      }
    } catch (err) {
      console.error("Failed to load overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeChild =
    children.find((c) => (c._id || c.student_id) === selectedChildId) || children[0];

  const initials = (first?: string, last?: string) =>
    `${(first || "S")[0]}${(last || "K")[0]}`.toUpperCase();

  // Weekly activity counts from child or defaults
  const weeklyCounts = activeChild?.weekly_activity || {
    Mon: 3,
    Tue: 5,
    Wed: 1,
    Thu: 4,
    Fri: 6,
    Sat: 0,
    Sun: 3,
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxSessions = Math.max(...Object.values(weeklyCounts), 6);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#10292e]">
            Hello, {parentFirstName}
          </h1>
          <p className="text-sm md:text-base text-[#607274] mt-1 font-medium">
            Here is how your children are learning this week.
          </p>
        </div>

        {/* Status Indicators Legend */}
        <div className="flex items-center gap-2 self-start md:self-auto text-xs font-semibold">
          <span className="text-[#8a999b]">Sample data</span>
          <span className="bg-[#e6f5f2] text-[#118a80] px-2.5 py-0.5 rounded-full">
            Existing
          </span>
          <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] px-2.5 py-0.5 rounded-full">
            Proposed
          </span>
        </div>
      </div>

      {/* Child Selector Pills */}
      {children.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-[#8a999b] uppercase tracking-wider">
            Viewing
          </span>
          {children.map((child) => {
            const cid = child._id || child.student_id;
            const isSelected = cid === (activeChild?._id || activeChild?.student_id);
            return (
              <button
                key={cid}
                onClick={() => setSelectedChildId(cid)}
                className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#fff7ee] text-[#10292e] border-2 border-[#ffa11f] shadow-xs"
                    : "bg-white text-[#607274] border border-[#e8eeea] hover:border-[#ffa11f]/60"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                    child.first_name === "Layla"
                      ? "bg-[#f3e8ff] text-[#9333ea]"
                      : "bg-[#e2f7ed] text-[#118a80]"
                  }`}
                >
                  {initials(child.first_name, child.last_name)}
                </span>
                <span>
                  {child.first_name} {child.last_name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {/* Current streak */}
        <div className="bg-white rounded-3xl p-6 border border-[#ece8de] shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7f9092]">Current streak</span>
            <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Existing
            </span>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-[#10292e]">
              {activeChild?.current_streak ?? 4}
            </span>
            <span className="text-sm font-bold text-[#10292e]">days</span>
          </div>
        </div>

        {/* Lessons completed */}
        <div className="bg-white rounded-3xl p-6 border border-[#ece8de] shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7f9092]">Lessons completed</span>
            <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Existing
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl md:text-4xl font-extrabold text-[#10292e]">
              {activeChild?.lessons_completed ?? 12}
            </span>
          </div>
        </div>

        {/* Checkpoint accuracy */}
        <div className="bg-white rounded-3xl p-6 border border-[#ece8de] shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7f9092]">Checkpoint accuracy</span>
            <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Existing
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl md:text-4xl font-extrabold text-[#10292e]">
              {activeChild?.checkpoint_accuracy ?? 82}%
            </span>
          </div>
        </div>

        {/* Time spent learning */}
        <div className="bg-white rounded-3xl p-6 border border-dashed border-[#f7a4b8] shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7f9092]">Time spent learning</span>
            <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Proposed
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl md:text-4xl font-extrabold text-[#10292e]">—</span>
          </div>
        </div>
      </div>

      {/* Middle Section: My Children & Weekly Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* My Children List Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-7 border border-[#ece8de] shadow-2xs">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-extrabold text-[#10292e]">My children</h2>
              <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[10px] font-bold px-2 py-0.5 rounded-full">
                Proposed
              </span>
            </div>
            <Link
              href="/parent/children"
              className="text-xs font-bold text-[#ffa11f] hover:underline"
            >
              Manage all →
            </Link>
          </div>

          <div className="space-y-3.5">
            {children.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-[#8a999b]">No children linked yet.</p>
                <Link
                  href="/parent/children"
                  className="mt-3 inline-block bg-[#ffa11f] text-[#10292e] font-extrabold px-4 py-2 rounded-xl text-xs hover:bg-[#ff9505]"
                >
                  + Link a child
                </Link>
              </div>
            ) : (
              children.map((child) => {
                const cid = child._id || child.student_id;
                const isOnTrack = (child.struggling_concepts || []).length <= 1;
                return (
                  <div
                    key={cid}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl bg-[#fffcf7] border border-[#f0ede4] gap-4"
                  >
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${
                          child.first_name === "Layla"
                            ? "bg-[#f3e8ff] text-[#9333ea]"
                            : "bg-[#e2f7ed] text-[#118a80]"
                        }`}
                      >
                        {initials(child.first_name, child.last_name)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-[#10292e]">
                          {child.first_name} {child.last_name}
                        </h3>
                        <p className="text-xs text-[#7f9092] mt-0.5">
                          {child.grade_level || "Grade 8"} · {child.student_code} ·{" "}
                          {child.current_streak || 4}-day streak ·{" "}
                          {child.lessons_completed || 12} lessons
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 self-end sm:self-center">
                      <span
                        className={`text-xs font-bold px-3 py-1 rounded-full ${
                          isOnTrack
                            ? "bg-[#e6f5f2] text-[#118a80]"
                            : "bg-[#fff1f2] text-[#e11d48]"
                        }`}
                      >
                        {isOnTrack ? "On track" : "Needs support"}
                      </span>
                      <button
                        onClick={() => setSelectedChildId(cid)}
                        className="px-4 py-1.5 rounded-full border border-[#10292e] text-[#10292e] text-xs font-bold hover:bg-[#10292e] hover:text-white transition-colors cursor-pointer"
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Weekly Activity Bar Chart */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-7 border border-[#ece8de] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-[#10292e]">Weekly activity</h2>
              <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] font-bold px-2 py-0.5 rounded-full">
                Existing
              </span>
            </div>
            <p className="text-xs text-[#7f9092] mt-1 font-medium">
              Sessions completed per day (StudentLessonSession.completed_at)
            </p>
          </div>

          <div className="mt-8 flex items-end justify-between gap-2 h-44 px-2 pt-6">
            {days.map((day) => {
              const val = weeklyCounts[day] ?? 0;
              const heightPercent = maxSessions > 0 ? (val / maxSessions) * 100 : 0;
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-bold text-[#8a999b] group-hover:text-[#118a80] transition-colors">
                    {val > 0 ? val : ""}
                  </span>
                  <div className="w-full bg-[#f4f1e9] h-28 rounded-t-lg flex items-end justify-center overflow-hidden">
                    <div
                      style={{ height: `${Math.max(heightPercent, val > 0 ? 15 : 0)}%` }}
                      className={`w-full transition-all duration-500 rounded-t-lg ${
                        val > 0 ? "bg-[#118a80] group-hover:bg-[#0e746b]" : "bg-transparent"
                      }`}
                    />
                  </div>
                  <span className="text-xs font-bold text-[#7f9092]">{day}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: Needs Attention */}
      <div className="bg-white rounded-3xl p-6 md:p-7 border border-[#ece8de] shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-extrabold text-[#10292e]">Needs attention</h2>
            <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Existing
            </span>
          </div>
          <span className="text-xs text-[#7f9092]">
            Derived from struggling_concepts and session status
          </span>
        </div>

        <div className="space-y-3">
          {/* Card 1: Loop stop condition */}
          <div className="p-4 rounded-2xl bg-[#fff2f4] border border-[#fed7dd] flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-extrabold text-sm text-[#9f1239]">
                Omar is struggling with &quot;Loop stop condition&quot;
              </p>
              <p className="text-xs text-[#be123c] mt-0.5">Wrong 9 of 24 checkpoints</p>
            </div>
            <Link
              href="/parent/progress"
              className="text-xs font-bold text-[#9f1239] hover:underline"
            >
              View details →
            </Link>
          </div>

          {/* Card 2: Abandoned session */}
          <div className="p-4 rounded-2xl bg-[#fff9ed] border border-[#fdecd2] flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-extrabold text-sm text-[#b45309]">
                Layla left &quot;Lists and indexing&quot; unfinished
              </p>
              <p className="text-xs text-[#d97706] mt-0.5">
                Session status: abandoned · Oct 20
              </p>
            </div>
            <Link
              href="/parent/activity"
              className="text-xs font-bold text-[#b45309] hover:underline"
            >
              View session →
            </Link>
          </div>

          {/* Card 3: Zero-based indexing */}
          <div className="p-4 rounded-2xl bg-[#fffcee] border border-[#fbf0c9] flex items-center justify-between flex-wrap gap-2">
            <div>
              <p className="font-extrabold text-sm text-[#854d0e]">
                Layla keeps mixing up zero-based indexing
              </p>
              <p className="text-xs text-[#a16207] mt-0.5">
                Last misconception: thinks range() starts at 1
              </p>
            </div>
            <Link
              href="/parent/contact"
              className="text-xs font-bold text-[#854d0e] hover:underline"
            >
              Ask teacher →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
