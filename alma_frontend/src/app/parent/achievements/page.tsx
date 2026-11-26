"use client";

import type { LinkedChildSummary, ParentAchievement } from "@/types/Parent.type";

import { deferRequest } from "@/lib/defer-request";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { Trophy, Flame, Sparkles, Send } from "lucide-react";

interface AchievementItem {
  _id?: string;
  title: string;
  description?: string;
  badge_icon?: string;
  category: string;
  awarded_at: string;
}

export default function ParentAchievementsPage() {
  const [children, setChildren] = useState<LinkedChildSummary[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [stats, setStats] = useState({ earned: 0, current_streak: 0, longest_streak: 0 });
  const [sendingWellDone, setSendingWellDone] = useState(false);

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

  const loadAchievements = async (cid: string) => {
    try {
      const res = await api.get(`/parents/child/${cid}/progress`);
      const childData = res.data?.data;
      if (childData) {
        setStats({
          earned: (childData.achievements || []).length || 0,
          current_streak: childData.current_streak ?? 0,
          longest_streak: childData.longest_streak ?? 0,
        });

        if (Array.isArray(childData.achievements) && childData.achievements.length > 0) {
          const mapped = childData.achievements.map((a: ParentAchievement) => ({
            ...a,
            awarded_at: a.awarded_at
              ? new Date(a.awarded_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
              : "Recent",
          }));
          setAchievements(mapped);
        } else {
          setAchievements([]);
        }
      }
    } catch {
      setAchievements([]);
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
      loadAchievements(selectedChildId);
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

  const handleSendWellDone = () => {
    setSendingWellDone(true);
    setTimeout(() => {
      setSendingWellDone(false);
      toast.success(`"Well done!" cheer sent to ${activeChild?.first_name || "your child"}! 🎉`);
    }, 600);
  };

  const getArchColor = (color?: string, idx: number = 0) => {
    switch (color) {
      case "blue":
        return "bg-[#7ccbf0] border-[#55b3e2]";
      case "pink":
        return "bg-[#f25c78] border-[#e04562]";
      case "yellow":
        return "bg-[#fbc02d] border-[#f57f17]";
      case "teal":
        return "bg-[#118a80] border-[#0c6b63]";
      case "orange":
      default:
        return idx % 2 === 0 ? "bg-[#ffa11f] border-[#e68c10]" : "bg-[#ff7a45] border-[#e6632f]";
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#10292e]">
            Achievements
          </h1>
          <p className="text-sm md:text-base text-[#607274] mt-1 font-medium">
            Awarded to {childName}.
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

      {/* Top 3 Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white rounded-3xl p-6 md:p-7 border border-[#ece8de] shadow-2xs">
          <span className="text-xs font-semibold text-[#7f9092]">Earned</span>
          <div className="mt-4">
            <span className="text-4xl font-extrabold text-[#10292e]">{stats.earned}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-7 border border-[#ece8de] shadow-2xs">
          <span className="text-xs font-semibold text-[#7f9092]">Current streak</span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#10292e]">{stats.current_streak}</span>
            <span className="text-sm font-bold text-[#10292e]">days</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 md:p-7 border border-[#ece8de] shadow-2xs">
          <span className="text-xs font-semibold text-[#7f9092]">Longest streak</span>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-[#10292e]">{stats.longest_streak}</span>
            <span className="text-sm font-bold text-[#10292e]">days</span>
          </div>
        </div>
      </div>

      {/* Grid of Achievement Cards or Empty State */}
      {achievements.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-[#ece8de] text-center">
          <Trophy className="w-10 h-10 text-[#ffa11f] mx-auto mb-3 opacity-60" />
          <h3 className="font-extrabold text-base text-[#10292e]">No achievements unlocked yet</h3>
          <p className="text-xs text-[#7f9092] mt-1 max-w-sm mx-auto">
            As {childName} completes lessons, masters coding concepts, and keeps up their daily streak, badges will be recorded here automatically from the database.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {achievements.map((item, idx) => (
            <div
              key={item.title + idx}
              className="bg-white rounded-3xl p-5 md:p-6 border border-[#ece8de] shadow-2xs flex items-center gap-4 hover:border-[#ffa11f]/60 transition-colors"
            >
              <div
                className={`w-12 h-16 rounded-t-full rounded-b-md ${getArchColor(
                  item.badge_icon,
                  idx
                )} border-2 flex items-center justify-center text-white shrink-0 shadow-xs`}
              >
                <Trophy size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-extrabold text-sm text-[#10292e] truncate">{item.title}</h3>
                <p className="text-[11px] text-[#8a999b] mt-0.5">
                  awarded_at {item.awarded_at}
                </p>
                <div className="mt-2.5">
                  <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                    {item.category}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bottom Card: Celebrate Together */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-dashed border-[#f7a4b8] shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-extrabold text-[#10292e]">Celebrate together</h2>
          <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[10px] font-bold px-2 py-0.5 rounded-full">
            Proposed
          </span>
        </div>

        <p className="text-xs md:text-sm text-[#7f9092] leading-relaxed max-w-2xl">
          A one-tap &quot;well done&quot; message to your child when a new achievement is
          awarded. Needs a notification or message feature.
        </p>

        <button
          onClick={handleSendWellDone}
          disabled={sendingWellDone}
          className="px-6 py-2.5 rounded-full border border-[#10292e] text-[#10292e] text-xs font-bold hover:bg-[#10292e] hover:text-white transition-colors cursor-pointer flex items-center gap-2 disabled:opacity-50"
        >
          <Sparkles size={14} />
          <span>{sendingWellDone ? "Sending..." : "Send a well done"}</span>
        </button>
      </div>
    </div>
  );
}
