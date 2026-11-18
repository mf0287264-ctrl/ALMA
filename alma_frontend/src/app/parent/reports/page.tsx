"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { Mail, Download, Bell, Check, Loader2 } from "lucide-react";

export default function ParentReportsPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [sendingEmail, setSendingEmail] = useState(false);

  // Alert rules state
  const [alertRules, setAlertRules] = useState({
    streak_broken: true,
    new_struggling_concept: true,
    session_abandoned: false,
    new_achievement: true,
    delivery: "email" as "email" | "sms",
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

  useEffect(() => {
    loadChildren();
  }, []);

  const activeChild =
    children.find((c) => (c._id || c.student_id) === selectedChildId) || children[0];

  const childName = activeChild
    ? `${activeChild.first_name} ${activeChild.last_name}`
    : "Layla Hassan";

  const initials = (first?: string, last?: string) =>
    `${(first || "S")[0]}${(last || "K")[0]}`.toUpperCase();

  const handleSendEmail = () => {
    setSendingEmail(true);
    setTimeout(() => {
      setSendingEmail(false);
      toast.success(`Weekly progress summary sent to your email!`);
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

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#10292e]">
            Reports and alerts
          </h1>
          <p className="text-sm md:text-base text-[#607274] mt-1 font-medium">
            Weekly summary and the alerts you receive.
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

      {/* Middle Grid: Weekly Report & Alert Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Weekly Report Card */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-dashed border-[#f7a4b8] shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#10292e]">Weekly report</h2>
            <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Proposed
            </span>
          </div>

          <p className="text-xs font-bold text-[#7f9092]">
            Oct 28 – Nov 3 · {childName}
          </p>

          {/* 4 Stat Boxes */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[#fffcf7] border border-[#f0ede4]">
              <span className="text-xs text-[#7f9092] font-semibold">Sessions</span>
              <p className="text-2xl font-black text-[#10292e] mt-1">5</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#fffcf7] border border-[#f0ede4]">
              <span className="text-xs text-[#7f9092] font-semibold">Lessons completed</span>
              <p className="text-2xl font-black text-[#10292e] mt-1">2</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#fffcf7] border border-[#f0ede4]">
              <span className="text-xs text-[#7f9092] font-semibold">Accuracy</span>
              <p className="text-2xl font-black text-[#10292e] mt-1">82%</p>
            </div>
            <div className="p-4 rounded-2xl bg-[#fffcf7] border border-[#f0ede4]">
              <span className="text-xs text-[#7f9092] font-semibold">New awards</span>
              <p className="text-2xl font-black text-[#10292e] mt-1">1</p>
            </div>
          </div>

          <p className="text-xs md:text-sm text-[#607274] leading-relaxed">
            {activeChild?.first_name || "Layla"} finished 2 lessons and kept her streak going.
            She still mixes up zero-based indexing, so a quick chat about range() could help.
          </p>

          <div className="flex items-center gap-3 pt-2 flex-wrap">
            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="px-5 py-2.5 rounded-full bg-[#ffa11f] hover:bg-[#ff9505] text-[#10292e] font-extrabold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {sendingEmail ? <Loader2 size={14} className="animate-spin" /> : <Mail size={14} />}
              <span>Send to my email</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-5 py-2.5 rounded-full border border-[#10292e] text-[#10292e] font-bold text-xs hover:bg-[#10292e] hover:text-white transition-colors cursor-pointer flex items-center gap-2"
            >
              <Download size={14} />
              <span>Download PDF</span>
            </button>
          </div>
        </div>

        {/* Alert Rules Card */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-dashed border-[#f7a4b8] shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#10292e]">Alert rules</h2>
            <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Proposed
            </span>
          </div>

          <div className="space-y-4">
            {/* Rule 1: Streak broken */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-extrabold text-sm text-[#10292e]">Streak broken</p>
                <p className="text-[11px] font-mono text-[#8a999b]">current_streak resets to 0</p>
              </div>
              <button
                type="button"
                onClick={() => toggleRule("streak_broken")}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  alertRules.streak_broken ? "bg-[#118a80]" : "bg-[#e5e7eb]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                    alertRules.streak_broken ? "left-6.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Rule 2: New struggling concept */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-extrabold text-sm text-[#10292e]">New struggling concept</p>
                <p className="text-[11px] font-mono text-[#8a999b]">struggling_concepts grows</p>
              </div>
              <button
                type="button"
                onClick={() => toggleRule("new_struggling_concept")}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  alertRules.new_struggling_concept ? "bg-[#118a80]" : "bg-[#e5e7eb]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                    alertRules.new_struggling_concept ? "left-6.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Rule 3: Session abandoned */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-extrabold text-sm text-[#10292e]">Session abandoned</p>
                <p className="text-[11px] font-mono text-[#8a999b]">session status: abandoned</p>
              </div>
              <button
                type="button"
                onClick={() => toggleRule("session_abandoned")}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  alertRules.session_abandoned ? "bg-[#118a80]" : "bg-[#e5e7eb]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                    alertRules.session_abandoned ? "left-6.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>

            {/* Rule 4: New achievement */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-extrabold text-sm text-[#10292e]">New achievement</p>
                <p className="text-[11px] font-mono text-[#8a999b]">Achievement awarded</p>
              </div>
              <button
                type="button"
                onClick={() => toggleRule("new_achievement")}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  alertRules.new_achievement ? "bg-[#118a80]" : "bg-[#e5e7eb]"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                    alertRules.new_achievement ? "left-6.5" : "left-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Delivery Options */}
          <div className="pt-2 border-t border-[#f4f1e9]">
            <span className="text-xs font-bold text-[#8a999b] uppercase tracking-wider block mb-2.5">
              Delivery
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAlertRules((p) => ({ ...p, delivery: "email" }))}
                className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                  alertRules.delivery === "email"
                    ? "border-2 border-[#10292e] text-[#10292e] bg-[#fffaf4]"
                    : "border border-[#e8eeea] text-[#7f9092] hover:bg-[#fafaf8]"
                }`}
              >
                Email
              </button>
              <button
                onClick={() => setAlertRules((p) => ({ ...p, delivery: "sms" }))}
                className={`px-4 py-1.5 rounded-full text-xs font-bold cursor-pointer transition-all ${
                  alertRules.delivery === "sms"
                    ? "border-2 border-[#10292e] text-[#10292e] bg-[#fffaf4]"
                    : "border border-[#e8eeea] text-[#7f9092] hover:bg-[#fafaf8]"
                }`}
              >
                SMS to parent phone
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Alerts Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-dashed border-[#f7a4b8] shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-extrabold text-[#10292e]">Recent alerts</h2>
          <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[10px] font-bold px-2 py-0.5 rounded-full">
            Proposed
          </span>
        </div>

        <div className="space-y-3 pt-2">
          {/* Alert 1 */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fffcf7] border border-[#f0ede4] flex-wrap gap-2">
            <span className="font-extrabold text-sm text-[#10292e]">
              Omar is struggling with &quot;Loop stop condition&quot;
            </span>
            <span className="text-xs font-semibold text-[#8a999b]">
              Nov 5 · Needs attention
            </span>
          </div>

          {/* Alert 2 */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fffcf7] border border-[#f0ede4] flex-wrap gap-2">
            <span className="font-extrabold text-sm text-[#10292e]">
              Layla earned &quot;Comeback&quot;
            </span>
            <span className="text-xs font-semibold text-[#8a999b]">
              Nov 6 · Achievement
            </span>
          </div>

          {/* Alert 3 */}
          <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fffcf7] border border-[#f0ede4] flex-wrap gap-2">
            <span className="font-extrabold text-sm text-[#10292e]">
              Layla left &quot;Lists and indexing&quot; unfinished
            </span>
            <span className="text-xs font-semibold text-[#8a999b]">
              Oct 20 · Session abandoned
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
