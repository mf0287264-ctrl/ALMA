"use client";

import type { LinkedChildSummary, LessonSessionSummary } from "@/types/Parent.type";

import { deferRequest } from "@/lib/defer-request";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { CheckCircle2, TrendingUp, AlertCircle, BookOpen } from "lucide-react";

interface ProgressData {
  student_id: string;
  first_name: string;
  last_name: string;
  student_code: string;
  grade_level?: string;
  current_streak: number;
  longest_streak: number;
  lessons_completed: number;
  checkpoint_accuracy: number;
  checkpoints_correct: number;
  checkpoints_total: number;
  struggling_concepts?: Array<{
    concept_id: string;
    concept_label: string;
    times_tested?: number;
    times_wrong?: number;
    last_diagnosed_misconception?: string | null;
  }>;
  sessions?: LessonSessionSummary[];
}

export default function ParentProgressPage() {
  const [children, setChildren] = useState<LinkedChildSummary[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadChildren = async () => {
    try {
      const res = await api.get("/parents/children");
      const kids = Array.isArray(res.data?.data) ? res.data.data : [];
      setChildren(kids);
      if (kids.length > 0) {
        setSelectedChildId(kids[0]._id || kids[0].student_id);
      }
    } catch {
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  const loadChildProgress = async (cid: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/parents/child/${cid}/progress`);
      setProgressData(res.data?.data || null);
    } catch {
      setProgressData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return deferRequest(() => {
      loadChildren();
    });
  }, []);

  useEffect(() => {
    return deferRequest(() => {
      if (selectedChildId) {
      loadChildProgress(selectedChildId);
      }
    });
  }, [selectedChildId]);

  const activeChild =
    children.find((c) => (c._id || c.student_id) === selectedChildId) || children[0];

  const childName = activeChild
    ? `${activeChild.first_name} ${activeChild.last_name}`
    : "Your child";

  const initials = (first?: string, last?: string) => {
    const f = (first || "").trim();
    const l = (last || "").trim();
    if (!f && !l) return "ST";
    return `${f[0] || ""}${l[0] || ""}`.toUpperCase();
  };

  const concepts = progressData?.struggling_concepts || [];
  const accuracy = progressData?.checkpoint_accuracy ?? 0;
  const correctCount = progressData?.checkpoints_correct ?? 0;
  const totalCount = progressData?.checkpoints_total ?? 0;
  const sessions = progressData?.sessions || [];

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#10292e]">
            Progress & Mastery
          </h1>
          <p className="text-sm md:text-base text-[#607274] mt-1 font-medium">
            Diagnosed concept understanding and curriculum completion for {childName}.
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

      {/* Middle Grid: Curriculum Overview & Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Curriculum Progress Card */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-[#ece8de] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#10292e]">Recent Curriculum Progress</h2>
          </div>

          <div className="space-y-3 pt-2">
            {sessions.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[#faf8f5] border border-dashed border-[#e8eeea] text-center">
                <BookOpen className="w-8 h-8 text-[#ffa11f] mx-auto mb-2 opacity-60" />
                <p className="font-extrabold text-sm text-[#10292e]">No lesson sessions recorded yet</p>
                <p className="text-xs text-[#7f9092] mt-1">
                  When {childName} starts and completes interactive lessons, real session records will appear here.
                </p>
              </div>
            ) : (
              sessions.slice(0, 5).map((s: LessonSessionSummary, idx: number) => {
                const isCompleted = s.status === "completed";
                const isAbandoned = s.status === "abandoned";
                return (
                  <div
                    key={s.session_id || idx}
                    className="flex items-center justify-between p-4 rounded-2xl bg-[#fffcf7] border border-[#f0ede4]"
                  >
                    <div>
                      <p className="font-extrabold text-sm text-[#10292e]">
                        {s.lesson_title || "Lesson"}
                      </p>
                      <p className="text-xs text-[#7f9092] mt-0.5">
                        {s.course_name ? `${s.course_name} · ` : ""}
                        Section {s.current_section_order || 1} of {s.total_sections || 4}
                      </p>
                    </div>
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        isCompleted
                          ? "bg-[#e6f5f2] text-[#118a80]"
                          : isAbandoned
                          ? "bg-[#fff1f2] text-[#e11d48]"
                          : "bg-[#fff7ee] text-[#ffa11f]"
                      }`}
                    >
                      {s.status || "active"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Checkpoint Accuracy Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 md:p-8 border border-[#ece8de] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#10292e]">
                Checkpoint accuracy
              </h2>
            </div>
            <p className="text-xs text-[#7f9092] mt-1 font-medium">
              From evaluated checkpoint logs
            </p>
          </div>

          <div className="my-8 text-center">
            <span className="text-6xl md:text-7xl font-black text-[#10292e] tracking-tight">
              {totalCount > 0 ? `${accuracy}%` : "—"}
            </span>
            <p className="text-sm font-bold text-[#7f9092] mt-3">
              {totalCount > 0 ? `${correctCount} of ${totalCount} answers correct` : "No checkpoints attempted yet"}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#fffcf7] border border-[#f0ede4] text-center text-xs text-[#7f9092]">
            Adaptive checkpoint telemetry tracks concept understanding in real time.
          </div>
        </div>
      </div>

      {/* Concepts To Practice Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#ece8de] shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#10292e]">Concepts to practice</h2>
        </div>

        {concepts.length === 0 ? (
          <div className="p-6 rounded-2xl bg-[#f0fbf8] border border-[#d2f1e8] text-center">
            <CheckCircle2 className="w-8 h-8 text-[#118a80] mx-auto mb-2" />
            <p className="font-extrabold text-sm text-[#118a80]">No concept roadblocks detected</p>
            <p className="text-xs text-[#607274] mt-1">
              {childName} is currently on track with all evaluated learning objectives.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {concepts.map((concept) => {
              const wrong = concept.times_wrong ?? 0;
              const tested = concept.times_tested ?? 0;
              const wrongPercent = tested > 0 ? Math.round((wrong / tested) * 100) : 0;

              return (
                <div
                  key={concept.concept_id}
                  className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#fffcf7] border border-[#f0ede4] gap-4"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="font-extrabold text-sm md:text-base text-[#10292e]">
                      {concept.concept_label || concept.concept_id}
                    </h3>
                    <p className="text-xs text-[#7f9092] mt-1">
                      Tested: {tested} · Wrong: {wrong}
                      {concept.last_diagnosed_misconception
                        ? ` · Note: ${concept.last_diagnosed_misconception}`
                        : ""}
                    </p>
                  </div>

                  <div className="w-full md:w-56 shrink-0">
                    <div className="w-full bg-[#e8eeea] h-3 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${wrongPercent}%` }}
                        className="bg-[#f25c78] h-full rounded-l-full"
                      />
                      <div
                        style={{ width: `${100 - wrongPercent}%` }}
                        className="bg-[#118a80] h-full rounded-r-full"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-[#8a999b] mt-1">
                      <span>{wrong} struggles</span>
                      <span>{Math.max(0, tested - wrong)} mastered</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
