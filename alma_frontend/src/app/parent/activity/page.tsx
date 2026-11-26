"use client";

import type { LinkedChildSummary, LessonSessionSummary } from "@/types/Parent.type";

import { deferRequest } from "@/lib/defer-request";

import React, { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import api from "@/services/api";

interface SessionItem {
  session_id: string;
  lesson_title: string;
  course_name?: string;
  status: "active" | "completed" | "abandoned";
  current_section_order: number;
  total_sections: number;
  date_label?: string;
  checkpoints_correct?: number;
  checkpoints_total?: number;
  questions_asked?: number;
}

export default function ParentActivityPage() {
  const [children, setChildren] = useState<LinkedChildSummary[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [filter, setFilter] = useState<"all" | "active" | "completed" | "abandoned">("all");
  const [sessions, setSessions] = useState<SessionItem[]>([]);
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

  const loadSessions = async (cid: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/parents/child/${cid}/progress`);
      const rawSessions = res.data?.data?.sessions;
      if (Array.isArray(rawSessions) && rawSessions.length > 0) {
        const mapped = rawSessions.map((s: LessonSessionSummary) => {
          let correct = 0;
          const total = (s.checkpoint_logs || []).length || 2;
          (s.checkpoint_logs || []).forEach((cp: { is_correct: boolean }) => {
            if (cp.is_correct) correct += 1;
          });
          const questions = (s.dialogue_logs || []).length;
          return {
            session_id: s.session_id,
            lesson_title: s.lesson_title || "Lesson Session",
            course_name: s.course_name || "Python Basics",
            status: s.status,
            current_section_order: s.current_section_order || 1,
            total_sections: s.total_sections || 4,
            date_label: s.completed_at
              ? `Completed ${new Date(s.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}`
              : "Today",
            checkpoints_correct: correct,
            checkpoints_total: total,
            questions_asked: questions,
          };
        });
        setSessions(mapped);
      } else {
        setSessions([]);
      }
    } catch {
      setSessions([]);
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
      loadSessions(selectedChildId);
      }
    });
  }, [selectedChildId]);

  const activeChild =
    children.find((c) => (c._id || c.student_id) === selectedChildId) || children[0];

  const childName = activeChild
    ? `${activeChild.first_name} ${activeChild.last_name}`
    : "Your child";

  const initials = (first?: string, last?: string) =>
    `${(first || "S")[0]}${(last || "K")[0]}`.toUpperCase();

  const filteredSessions = sessions.filter((s) => {
    if (filter === "all") return true;
    return s.status === filter;
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#10292e]">
            Activity
          </h1>
          <p className="text-sm md:text-base text-[#607274] mt-1 font-medium">
            Lesson sessions for {childName}.
          </p>
        </div>

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

      {/* Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {(["all", "active", "completed", "abandoned"] as const).map((mode) => (
          <button
            key={mode}
            onClick={() => setFilter(mode)}
            className={`px-4 py-1.5 rounded-full text-xs font-extrabold capitalize transition-all cursor-pointer ${
              filter === mode
                ? "bg-[#ffa11f] text-[#10292e] shadow-xs"
                : "bg-white text-[#7f9092] border border-[#e8eeea] hover:border-[#ffa11f]/60"
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Session Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-[#ece8de]">
            <p className="text-sm font-bold text-[#10292e]">Loading session records...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 text-center border border-[#ece8de]">
            <Clock className="w-10 h-10 text-[#ffa11f] mx-auto mb-3 opacity-60" />
            <h3 className="font-extrabold text-base text-[#10292e]">No activity sessions found</h3>
            <p className="text-xs text-[#7f9092] mt-1 max-w-sm mx-auto">
              {sessions.length === 0
                ? `${childName} has not completed any learning sessions yet. When they start their interactive coding lessons, details will appear here.`
                : `No sessions match the selected filter (${filter}).`}
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => {
          const totalSec = session.total_sections || 4;
          const currSec = session.current_section_order || 1;
          const progressPercent = Math.min(100, Math.round((currSec / totalSec) * 100));

          return (
            <div
              key={session.session_id}
              className="bg-white rounded-3xl p-6 md:p-7 border border-[#ece8de] shadow-2xs space-y-4"
            >
              {/* Row 1: Title, Course, Date, Status */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-lg font-extrabold text-[#10292e]">
                    {session.lesson_title}
                  </h3>
                  <p className="text-xs text-[#7f9092] mt-0.5">{session.course_name}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-[#8a999b]">
                    {session.date_label}
                  </span>
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full ${
                      session.status === "completed"
                        ? "bg-[#e6f5f2] text-[#118a80]"
                        : session.status === "active"
                        ? "bg-[#e6f5f2] text-[#118a80]"
                        : "bg-[#fff1f2] text-[#e11d48]"
                    }`}
                  >
                    {session.status}
                  </span>
                </div>
              </div>

              {/* Row 2: Progress bar & Section text */}
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-[#f4f1e9] h-2.5 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${progressPercent}%` }}
                      className={`h-full rounded-full transition-all duration-500 ${
                        session.status === "completed"
                          ? "bg-[#118a80]"
                          : session.status === "abandoned"
                          ? "bg-[#f25c78]"
                          : "bg-[#ffa11f]"
                      }`}
                    />
                  </div>
                  <span className="text-xs font-mono text-[#7f9092] shrink-0">
                    Section {currSec} of {totalSec} (current_section_order)
                  </span>
                </div>
              </div>

              {/* Row 3: Telemetry Pills */}
              <div className="flex items-center gap-2.5 flex-wrap pt-1">
                <span className="bg-[#e6f5f2] text-[#118a80] text-xs font-bold px-3 py-1 rounded-full">
                  Checkpoints: {session.checkpoints_correct} of {session.checkpoints_total} correct
                </span>
                <span className="bg-[#e6f5f2] text-[#118a80] text-xs font-bold px-3 py-1 rounded-full">
                  Ask ALMA: {session.questions_asked} question{session.questions_asked === 1 ? "" : "s"} asked
                </span>
              </div>
            </div>
          );
          })
        )}
      </div>
    </div>
  );
}
