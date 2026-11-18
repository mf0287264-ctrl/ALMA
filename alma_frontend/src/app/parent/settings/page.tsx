"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/app/_Context/AuthContext";
import { toast } from "sonner";
import { Loader2, LogOut, Check } from "lucide-react";

interface LinkedChild {
  _id: string;
  student_id?: string;
  first_name: string;
  last_name: string;
}

export default function ParentSettingsPage() {
  const { user, logout, refreshUser } = useAuth();

  const [firstName, setFirstName] = useState("Mona");
  const [lastName, setLastName] = useState("Hassan");
  const [email, setEmail] = useState("mona.h@mail.com");
  const [phone, setPhone] = useState("+20 100 222 3333");
  const [saving, setSaving] = useState(false);

  const [children, setChildren] = useState<LinkedChild[]>([]);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  // Privacy toggles
  const [privacy, setPrivacy] = useState({
    show_alma_questions: false,
    show_session_times: true,
    weekly_report_email: true,
  });

  const loadProfile = async () => {
    try {
      const res = await api.get("/parents/profile");
      const data = res.data?.data;
      if (data) {
        if (data.first_name) setFirstName(data.first_name);
        if (data.last_name) setLastName(data.last_name);
        if (data.email) setEmail(data.email);
        if (data.phone_number) setPhone(data.phone_number);
        if (data.privacy_settings) {
          setPrivacy((prev) => ({ ...prev, ...data.privacy_settings }));
        }
      }

      // Load children
      const cRes = await api.get("/parents/children").catch(() => null);
      setChildren(Array.isArray(cRes?.data?.data) ? cRes.data.data : []);
    } catch {
      // Default
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/parents/profile", {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: phone.trim(),
        privacy_settings: privacy,
      });
      await refreshUser();
      toast.success("Parent profile updated successfully!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleUnlink = async (childId: string, name: string) => {
    if (!confirm(`Are you sure you want to unlink ${name}?`)) return;

    setUnlinkingId(childId);
    try {
      await api.post("/parents/unlink-child", { child_id: childId });
      toast.success(`Unlinked ${name}`);
      setChildren((prev) => prev.filter((c) => (c._id || c.student_id) !== childId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to unlink child");
    } finally {
      setUnlinkingId(null);
    }
  };

  const togglePrivacy = (key: keyof typeof privacy) => {
    setPrivacy((prev) => {
      const updated = { ...prev, [key]: !prev[key] };
      api.put("/parents/profile", { privacy_settings: updated }).catch(() => null);
      toast.success("Privacy preferences updated");
      return updated;
    });
  };

  const initials = (first?: string, last?: string) =>
    `${(first || "S")[0]}${(last || "K")[0]}`.toUpperCase();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#10292e]">
            Settings
          </h1>
          <p className="text-sm md:text-base text-[#607274] mt-1 font-medium">
            Your account, linked children and privacy.
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

      {/* Top Banner Notice */}
      <div className="p-4 rounded-2xl bg-white border border-dashed border-[#f7a4b8] flex items-center gap-2.5 text-xs text-[#7f9092] flex-wrap">
        <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[10px] font-bold px-2 py-0.5 rounded-full">
          Proposed
        </span>
        <span>
          The Parent role is a proposed addition: it needs a Parent model and a ParentStudent link.
          Child data comes from Student, StudentLessonSession and Achievement.
        </span>
      </div>

      {/* Main Grid: Profile & (Linked Children + Privacy) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Parent Profile */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-dashed border-[#f7a4b8] shadow-2xs space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-extrabold text-[#10292e]">Parent profile</h2>
            <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Proposed
            </span>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#7f9092]">First name</label>
                  <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[9px] font-bold px-2 py-0.2 rounded-full">
                    Proposed
                  </span>
                </div>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Mona"
                  className="w-full px-4 py-3 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] text-sm text-[#10292e] focus:outline-hidden focus:border-[#ffa11f] font-medium"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-[#7f9092]">Last name</label>
                  <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[9px] font-bold px-2 py-0.2 rounded-full">
                    Proposed
                  </span>
                </div>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Hassan"
                  className="w-full px-4 py-3 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] text-sm text-[#10292e] focus:outline-hidden focus:border-[#ffa11f] font-medium"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#7f9092]">Email</label>
                <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[9px] font-bold px-2 py-0.2 rounded-full">
                  Proposed
                </span>
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mona.h@mail.com"
                className="w-full px-4 py-3 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] text-sm text-[#10292e] focus:outline-hidden focus:border-[#ffa11f] font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#7f9092]">Phone number</label>
                <span className="bg-[#e6f5f2] text-[#118a80] text-[9px] font-bold px-2 py-0.2 rounded-full">
                  Existing
                </span>
              </div>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+20 100 222 3333"
                className="w-full px-4 py-3 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] text-sm text-[#10292e] focus:outline-hidden focus:border-[#ffa11f] font-medium"
              />
            </div>

            <p className="text-xs text-[#8a999b] leading-relaxed">
              The phone number should match Student.parent_phone for each linked child.
            </p>

            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 rounded-full bg-[#ffa11f] hover:bg-[#ff9505] text-[#10292e] font-extrabold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : null}
              <span>Save changes</span>
            </button>
          </form>
        </div>

        {/* Right Column: Linked Children & Privacy */}
        <div className="lg:col-span-5 space-y-6">
          {/* Linked Children Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#ece8de] shadow-2xs space-y-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#10292e]">Linked children</h2>
              <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[10px] font-bold px-2 py-0.5 rounded-full">
                Proposed
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {children.map((child) => {
                const cid = child._id || child.student_id!;
                const fullName = `${child.first_name} ${child.last_name}`;
                return (
                  <div
                    key={cid}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fffcf7] border border-[#f0ede4]"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                          child.first_name === "Layla"
                            ? "bg-[#f3e8ff] text-[#9333ea]"
                            : "bg-[#e2f7ed] text-[#118a80]"
                        }`}
                      >
                        {initials(child.first_name, child.last_name)}
                      </div>
                      <span className="font-extrabold text-sm text-[#10292e]">{fullName}</span>
                    </div>

                    <button
                      disabled={unlinkingId === cid}
                      onClick={() => handleUnlink(cid, fullName)}
                      className="px-4 py-1.5 rounded-full border border-[#10292e] text-[#10292e] text-xs font-bold hover:bg-red-50 hover:border-red-500 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {unlinkingId === cid ? "..." : "Unlink"}
                    </button>
                  </div>
                );
              })}
              {children.length === 0 && (
                <p className="text-xs text-[#8a999b] text-center py-4">No linked children.</p>
              )}
            </div>
          </div>

          {/* Privacy Card */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-dashed border-[#f7a4b8] shadow-2xs space-y-5">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#10292e]">Privacy</h2>
              <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[10px] font-bold px-2 py-0.5 rounded-full">
                Proposed
              </span>
            </div>

            <div className="space-y-4 pt-1">
              {/* Privacy 1 */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs md:text-sm font-bold text-[#10292e]">
                  Show what my child asked ALMA
                </span>
                <button
                  type="button"
                  onClick={() => togglePrivacy("show_alma_questions")}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    privacy.show_alma_questions ? "bg-[#118a80]" : "bg-[#e5e7eb]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                      privacy.show_alma_questions ? "left-6.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Privacy 2 */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs md:text-sm font-bold text-[#10292e]">
                  Show session times
                </span>
                <button
                  type="button"
                  onClick={() => togglePrivacy("show_session_times")}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    privacy.show_session_times ? "bg-[#118a80]" : "bg-[#e5e7eb]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                      privacy.show_session_times ? "left-6.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>

              {/* Privacy 3 */}
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs md:text-sm font-bold text-[#10292e]">
                  Weekly report by email
                </span>
                <button
                  type="button"
                  onClick={() => togglePrivacy("weekly_report_email")}
                  className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                    privacy.weekly_report_email ? "bg-[#118a80]" : "bg-[#e5e7eb]"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full bg-white shadow-xs transition-transform absolute top-0.5 ${
                      privacy.weekly_report_email ? "left-6.5" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Log out Button */}
          <div>
            <button
              onClick={() => logout()}
              className="px-6 py-2.5 rounded-full border border-[#10292e] text-[#10292e] text-xs font-bold hover:bg-[#10292e] hover:text-white transition-colors cursor-pointer"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
