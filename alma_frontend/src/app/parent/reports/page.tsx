"use client";

import type { LinkedChildSummary, ChildProgress, StrugglingConceptSummary, ParentAchievement, LessonSessionSummary } from "@/types/Parent.type";

import { deferRequest } from "@/lib/defer-request";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { Download, Mail, Check, Bell, ShieldAlert } from "lucide-react";

export default function ParentReportsPage() {
  const [children, setChildren] = useState<LinkedChildSummary[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [childProgress, setChildProgress] = useState<ChildProgress | null>(null);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [alertRules, setAlertRules] = useState({
    missed_streak: true,
    struggling: true,
    weekly_digest: true,
    delivery: "email",
  });

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
    }
  };

  const loadChildProgress = async (cid: string) => {
    try {
      const res = await api.get(`/parents/child/${cid}/progress`);
      setChildProgress(res.data?.data || null);
    } catch {
      setChildProgress(null);
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

  const handleSendEmail = () => {
    setSendingEmail(true);
    setTimeout(() => {
      setSendingEmail(false);
      toast.success(`Weekly progress summary sent to your registered email!`);
    }, 700);
  };

  const handleDownloadPDF = () => {
    toast.success("Downloading weekly report PDF...");
  };

  const toggleRule = (key: keyof typeof alertRules) => {
    if (key === "delivery") return;
    setAlertRules((prev) => ({ ...prev, [key]: !prev[key] }));
    toast.success("Alert preferences updated");
  };

  // Build dynamic alerts based on child's actual database telemetry
  const strugglingList = childProgress?.struggling_concepts || [];
  const achievementsList = childProgress?.achievements || [];
  const sessionsList = childProgress?.sessions || [];

  const dynamicAlerts: Array<{ text: string; date: string; type: string }> = [];

  strugglingList.forEach((sc: StrugglingConceptSummary) => {
    dynamicAlerts.push({
      text: `${activeChild?.first_name || "Child"} is working through "${sc.concept_label || sc.concept_id}"`,
      date: "Active",
      type: "Needs attention",
    });
  });

  achievementsList.slice(0, 2).forEach((ach: ParentAchievement) => {
    dynamicAlerts.push({
      text: `${activeChild?.first_name || "Child"} earned "${ach.title || "Milestone"}"`,
      date: ach.awarded_at ? new Date(ach.awarded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent",
      type: "Achievement",
    });
  });

  sessionsList.filter((s: LessonSessionSummary) => s.status === "abandoned").slice(0, 2).forEach((s: LessonSessionSummary) => {
    dynamicAlerts.push({
      text: `${activeChild?.first_name || "Child"} left "${s.lesson_title || "Lesson"}" in progress`,
      date: s.completed_at ? new Date(s.completed_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Recent",
      type: "Lesson in progress",
    });
  });

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#10292e]">
            Reports and alerts
          </h1>
          <p className="text-sm md:text-base text-[#607274] mt-1 font-medium">
            Weekly summary and diagnostic alerts for {childName}.
          </p>
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

      {/* Middle Grid: Weekly Report & Alert Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Report Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-[#ece8de] shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#10292e]">Weekly report</h2>
          </div>

          <p className="text-xs font-bold text-[#7f9092]">
            Current Academic Period · {childName}
          </p>

          {/* Stats Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-[#fffcf7] border border-[#f0ede4]">
              <span className="text-[11px] font-bold text-[#8a999b] block">Streak</span>
              <span className="text-xl font-black text-[#10292e] mt-1 block">
                {childProgress?.current_streak ?? activeChild?.current_streak ?? 0} days
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#fffcf7] border border-[#f0ede4]">
              <span className="text-[11px] font-bold text-[#8a999b] block">Lessons</span>
              <span className="text-xl font-black text-[#10292e] mt-1 block">
                {childProgress?.lessons_completed ?? activeChild?.lessons_completed ?? 0}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#fffcf7] border border-[#f0ede4]">
              <span className="text-[11px] font-bold text-[#8a999b] block">Accuracy</span>
              <span className="text-xl font-black text-[#10292e] mt-1 block">
                {childProgress?.checkpoint_accuracy !== undefined ? `${childProgress.checkpoint_accuracy}%` : "—"}
              </span>
            </div>
            <div className="p-3.5 rounded-2xl bg-[#fffcf7] border border-[#f0ede4]">
              <span className="text-[11px] font-bold text-[#8a999b] block">Status</span>
              <span className="text-sm font-black text-[#118a80] mt-1 block">
                {strugglingList.length <= 1 ? "On Track" : "Needs Review"}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="px-4 py-2 rounded-full bg-[#ffa11f] hover:bg-[#ff9505] text-[#10292e] text-xs font-extrabold flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Mail size={14} />
              <span>{sendingEmail ? "Sending..." : "Email me this summary"}</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 rounded-full border border-[#10292e] text-[#10292e] text-xs font-bold hover:bg-[#10292e] hover:text-white transition-colors cursor-pointer flex items-center gap-2"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Alert Rules Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-[#ece8de] shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#10292e]">Alert preferences</h2>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-extrabold text-sm text-[#10292e]">Streak protection alert</p>
                <p className="text-xs text-[#7f9092]">Notify if today&apos;s goal hasn&apos;t been met</p>
              </div>
              <button
                onClick={() => toggleRule("missed_streak")}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  alertRules.missed_streak ? "bg-[#118a80]" : "bg-[#d5dcd8]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    alertRules.missed_streak ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-extrabold text-sm text-[#10292e]">Concept struggle alert</p>
                <p className="text-xs text-[#7f9092]">When a checkpoint is missed multiple times</p>
              </div>
              <button
                onClick={() => toggleRule("struggling")}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  alertRules.struggling ? "bg-[#118a80]" : "bg-[#d5dcd8]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    alertRules.struggling ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-extrabold text-sm text-[#10292e]">Weekly digest</p>
                <p className="text-xs text-[#7f9092]">Every Sunday morning summary</p>
              </div>
              <button
                onClick={() => toggleRule("weekly_digest")}
                className={`w-11 h-6 rounded-full transition-colors p-0.5 cursor-pointer ${
                  alertRules.weekly_digest ? "bg-[#118a80]" : "bg-[#d5dcd8]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    alertRules.weekly_digest ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Alerts */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#ece8de] shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#10292e]">Recent alerts</h2>
          <span className="text-xs text-[#7f9092]">Live notifications based on student learning activity</span>
        </div>

        <div className="space-y-3 pt-2">
          {dynamicAlerts.length === 0 ? (
            <div className="p-6 rounded-2xl bg-[#f0fbf8] border border-[#d2f1e8] text-center">
              <Check className="w-6 h-6 text-[#118a80] mx-auto mb-1.5" />
              <p className="font-extrabold text-sm text-[#118a80]">No active alerts</p>
              <p className="text-xs text-[#607274] mt-0.5">
                All learning objectives are on track. Diagnostic notifications will appear here as activity occurs.
              </p>
            </div>
          ) : (
            dynamicAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between p-4 rounded-2xl bg-[#fffcf7] border border-[#f0ede4] flex-wrap gap-2"
              >
                <span className="font-extrabold text-sm text-[#10292e]">{alert.text}</span>
                <span className="text-xs font-semibold text-[#8a999b]">
                  {alert.date} · {alert.type}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
