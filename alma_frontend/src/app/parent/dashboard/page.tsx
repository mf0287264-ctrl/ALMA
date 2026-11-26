"use client";

import type { LessonSessionSummary, StrugglingConceptSummary } from "@/types/Parent.type";

import { deferRequest } from "@/lib/defer-request";

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
  Sparkles,
  Loader2,
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
  sessions?: LessonSessionSummary[];
}

export default function ParentOverviewPage() {
  const { user } = useAuth();
  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [activeChildDetails, setActiveChildDetails] = useState<LinkedChild | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDetails, setLoadingDetails] = useState(false);

  const parentFirstName = user?.first_name || (user?.name?.split(" ")[0]) || "Guardian";

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Get linked children from database
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
      if (kids.length > 0) {
        const firstId = kids[0]._id || kids[0].student_id;
        setSelectedChildId(firstId);
      }
    } catch (err) {
      console.error("Failed to load overview data:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadChildDetails = async (cid: string) => {
    setLoadingDetails(true);
    try {
      const res = await api.get(`/parents/child/${cid}/progress`);
      if (res.data?.data) {
        setActiveChildDetails(res.data.data);
      }
    } catch (e) {
      console.warn("Could not load child progress:", e);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    return deferRequest(() => {
      loadData();
    });
  }, []);

  useEffect(() => {
    return deferRequest(() => {
      if (selectedChildId) {
      loadChildDetails(selectedChildId);
      }
    });
  }, [selectedChildId]);

  const activeChild =
    activeChildDetails ||
    children.find((c) => (c._id || c.student_id) === selectedChildId) ||
    children[0];

  const initials = (first?: string, last?: string) => {
    const f = (first || "").trim();
    const l = (last || "").trim();
    if (!f && !l) return "ST";
    return `${f[0] || ""}${l[0] || ""}`.toUpperCase();
  };

  // Real weekly activity counts from DB sessions
  const weeklyCounts = activeChild?.weekly_activity || {
    Mon: 0,
    Tue: 0,
    Wed: 0,
    Thu: 0,
    Fri: 0,
    Sat: 0,
    Sun: 0,
  };

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const maxSessions = Math.max(...Object.values(weeklyCounts), 4);

  const strugglingList = activeChild?.struggling_concepts || [];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 select-none">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#10292e]">
            Hello, {parentFirstName}
          </h1>
          <p className="text-sm md:text-base text-[#607274] mt-1 font-medium">
            Here is how your children are learning in real time.
          </p>
        </div>
      </div>

      {/* Child Selector Pills */}
      {Array.isArray(children) && children.length > 0 && (
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
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black bg-[#e2f7ed] text-[#118a80]">
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

      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Streak */}
        <div className="bg-white rounded-3xl p-6 border border-[#ece8de] shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7f9092]">Current streak</span>
            <div className="w-8 h-8 rounded-full bg-[#fdecd2] flex items-center justify-center text-[#ffa11f]">
              <Flame size={16} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-[#10292e]">
              {activeChild?.current_streak ?? 0}
            </span>
            <span className="text-xs font-bold text-[#7f9092]">days</span>
          </div>
        </div>

        {/* Lessons Completed */}
        <div className="bg-white rounded-3xl p-6 border border-[#ece8de] shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7f9092]">Lessons completed</span>
            <div className="w-8 h-8 rounded-full bg-[#e6f5f2] flex items-center justify-center text-[#118a80]">
              <BookOpen size={16} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-[#10292e]">
              {activeChild?.lessons_completed ?? 0}
            </span>
            <span className="text-xs font-bold text-[#7f9092]">lessons</span>
          </div>
        </div>

        {/* Checkpoint accuracy */}
        <div className="bg-white rounded-3xl p-6 border border-[#ece8de] shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7f9092]">Checkpoint accuracy</span>
            <div className="w-8 h-8 rounded-full bg-[#eef7ff] flex items-center justify-center text-[#3b82f6]">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl md:text-4xl font-extrabold text-[#10292e]">
              {activeChild?.checkpoint_accuracy !== undefined ? `${activeChild.checkpoint_accuracy}%` : "—"}
            </span>
          </div>
        </div>

        {/* Learning Sessions */}
        <div className="bg-white rounded-3xl p-6 border border-[#ece8de] shadow-2xs relative">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#7f9092]">Total sessions</span>
            <div className="w-8 h-8 rounded-full bg-[#fdf2f8] flex items-center justify-center text-[#ec4899]">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-[#10292e]">
              {activeChild?.sessions?.length ?? 0}
            </span>
            <span className="text-xs font-bold text-[#7f9092]">recorded</span>
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
            </div>
            <Link
              href="/parent/children"
              className="text-xs font-bold text-[#ffa11f] hover:underline"
            >
              Manage all →
            </Link>
          </div>

          <div className="space-y-3.5">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-6 h-6 animate-spin text-[#ffa11f]" />
              </div>
            ) : children.length === 0 ? (
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
                      <div className="w-11 h-11 rounded-full flex items-center justify-center font-black text-sm shrink-0 bg-[#e2f7ed] text-[#118a80]">
                        {initials(child.first_name, child.last_name)}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-sm text-[#10292e]">
                          {child.first_name} {child.last_name}
                        </h3>
                        <p className="text-xs text-[#7f9092] mt-0.5">
                          {child.grade_level ? `${child.grade_level} · ` : ""}{child.student_code} ·{" "}
                          {child.current_streak || 0}-day streak ·{" "}
                          {child.lessons_completed || 0} lessons
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
            </div>
            <p className="text-xs text-[#7f9092] mt-1 font-medium">
              Real lesson sessions completed per day from database
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
          </div>
          <span className="text-xs text-[#7f9092]">
            Derived from diagnostic checkpoints and struggling concepts
          </span>
        </div>

        {strugglingList.length > 0 ? (
          <div className="space-y-3">
            {strugglingList.map((sc: StrugglingConceptSummary, idx: number) => (
              <div
                key={sc.concept_id || idx}
                className="p-4 rounded-2xl bg-[#fff2f4] border border-[#fed7dd] flex items-center justify-between flex-wrap gap-2"
              >
                <div>
                  <p className="font-extrabold text-sm text-[#9f1239]">
                    {activeChild?.first_name || "Your child"} is working on &quot;{sc.concept_label || sc.concept_id}&quot;
                  </p>
                  <p className="text-xs text-[#be123c] mt-0.5">
                    {sc.times_wrong ? `Challenged on ${sc.times_wrong} checkpoint${sc.times_wrong > 1 ? "s" : ""}` : "Identified for review"}
                    {sc.last_diagnosed_misconception ? ` · Note: ${sc.last_diagnosed_misconception}` : ""}
                  </p>
                </div>
                <Link
                  href="/parent/contact"
                  className="text-xs font-bold text-[#9f1239] hover:underline"
                >
                  Ask teacher →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-[#f0fbf8] border border-[#d2f1e8] text-center">
            <p className="font-extrabold text-sm text-[#118a80]">
              All concepts on track!
            </p>
            <p className="text-xs text-[#607274] mt-1">
              {activeChild?.first_name ? `${activeChild.first_name} has` : "Your child has"} no active learning roadblocks.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
