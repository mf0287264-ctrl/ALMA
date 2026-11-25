"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import api from "@/services/api";
import { toast } from "sonner";
import { Check, AlertCircle, Plus, Loader2 } from "lucide-react";

interface ChildItem {
  _id: string;
  student_id?: string;
  first_name: string;
  last_name: string;
  student_code: string;
  grade_level: string;
  school_name?: string | null;
  status?: string;
}

export default function MyChildrenPage() {
  const [children, setChildren] = useState<ChildItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Link child form states
  const [studentCode, setStudentCode] = useState("");
  const [parentPhone, setParentPhone] = useState("+20 100 222 3333");
  const [linking, setLinking] = useState(false);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  // Feedback banners
  const [successMsg, setSuccessMsg] = useState<{ name: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const loadChildren = async () => {
    setLoading(true);
    try {
      const res = await api.get("/parents/children");
      setChildren(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch {
      // Fallback
      setChildren([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentCode.trim()) {
      setErrorMsg("Student code is required.");
      return;
    }

    setLinking(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await api.post("/parents/link-child", {
        student_code: studentCode.trim(),
        parent_phone: parentPhone.trim() || undefined,
      });

      const linkedChild = res.data?.data?.child;
      setSuccessMsg({
        name: `${linkedChild?.first_name || ""} ${linkedChild?.last_name || ""}`.trim() || studentCode,
      });
      toast.success("Child linked successfully!");
      setStudentCode("");
      loadChildren();
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Phone number does not match. Check the number the school has on file.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setLinking(false);
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

  const initials = (first?: string, last?: string) =>
    `${(first || "S")[0]}${(last || "K")[0]}`.toUpperCase();

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 select-none">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#10292e]">
            My children
          </h1>
          <p className="text-sm md:text-base text-[#607274] mt-1 font-medium">
            Children linked to your account.
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Linked Children List */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 md:p-8 border border-[#ece8de] shadow-2xs">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-[#10292e]">Linked children</h2>
              <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[10px] font-bold px-2 py-0.5 rounded-full">
                Proposed
              </span>
            </div>

            <button
              onClick={() => inputRef.current?.focus()}
              className="flex items-center gap-1.5 bg-[#ffa11f] hover:bg-[#ff9505] text-[#10292e] text-xs font-extrabold px-3.5 py-2 rounded-full transition-colors cursor-pointer shadow-xs"
            >
              <Plus size={14} />
              <span>Link a child</span>
            </button>
          </div>

          <div className="space-y-4">
            {children.length === 0 && !loading && (
              <div className="text-center py-10 bg-[#faf8f5] rounded-2xl border border-dashed border-[#e8eeea]">
                <p className="text-sm text-[#7f9092] font-medium">No children linked yet.</p>
                <p className="text-xs text-[#a0afb1] mt-1">
                  Use the form on the right to connect your child using their Student Code.
                </p>
              </div>
            )}

            {children.map((child) => {
              const cid = child._id || child.student_id!;
              const fullName = `${child.first_name} ${child.last_name}`;
              return (
                <div
                  key={cid}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#fffcf7] border border-[#f0ede4] gap-4"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm shrink-0 bg-[#e2f7ed] text-[#118a80]"
                    >
                      {initials(child.first_name, child.last_name)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-[#10292e]">{fullName}</h3>
                      <p className="text-xs text-[#7f9092] mt-0.5">
                        {child.student_code} · {child.grade_level || "Grade 8"}
                        {child.school_name ? ` · ${child.school_name}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 self-end sm:self-center">
                    <span className="bg-[#e6f5f2] text-[#118a80] text-xs font-bold px-3 py-1 rounded-full">
                      active
                    </span>
                    <Link
                      href="/parent/progress"
                      className="px-4 py-1.5 rounded-full bg-[#ffa11f] hover:bg-[#ff9505] text-[#10292e] text-xs font-extrabold transition-colors"
                    >
                      Open
                    </Link>
                    <button
                      disabled={unlinkingId === cid}
                      onClick={() => handleUnlink(cid, fullName)}
                      className="px-4 py-1.5 rounded-full border border-[#10292e] text-[#10292e] text-xs font-bold hover:bg-red-50 hover:border-red-500 hover:text-red-600 transition-colors cursor-pointer disabled:opacity-50"
                    >
                      {unlinkingId === cid ? "..." : "Unlink"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-[#8a999b] mt-6 leading-relaxed">
            Each link is stored in a ParentStudent record (parent_id, student_id, linked_at). A
            parent can only see students they are linked to.
          </p>
        </div>

        {/* Right Column: Link A Child Form */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 md:p-8 border border-dashed border-[#f7a4b8] shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#10292e]">Link a child</h2>
            <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Proposed
            </span>
          </div>

          <form onSubmit={handleLinkChild} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#10292e]">Student code</label>
                <span className="bg-[#e6f5f2] text-[#118a80] text-[9px] font-bold px-2 py-0.2 rounded-full">
                  Existing
                </span>
              </div>
              <input
                ref={inputRef}
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                placeholder="STU-1090"
                className="w-full px-4 py-3 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] text-sm text-[#10292e] focus:outline-hidden focus:border-[#ffa11f] font-medium"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-[#10292e]">Parent phone on file</label>
                <span className="bg-[#e6f5f2] text-[#118a80] text-[9px] font-bold px-2 py-0.2 rounded-full">
                  Existing
                </span>
              </div>
              <input
                type="text"
                value={parentPhone}
                onChange={(e) => setParentPhone(e.target.value)}
                placeholder="+20 100 222 3333"
                className="w-full px-4 py-3 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] text-sm text-[#10292e] focus:outline-hidden focus:border-[#ffa11f] font-medium"
              />
            </div>

            <p className="text-xs text-[#8a999b] leading-relaxed">
              The phone number must match Student.parent_phone. This reuses an existing field to
              confirm the parent.
            </p>

            <button
              type="submit"
              disabled={linking}
              className="w-full py-3.5 rounded-2xl bg-[#ffa11f] hover:bg-[#ff9505] text-[#10292e] font-extrabold text-sm transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {linking ? <Loader2 size={18} className="animate-spin" /> : null}
              <span>Link child</span>
            </button>
          </form>

          {/* Success Banner */}
          {successMsg && (
            <div className="p-4 rounded-2xl bg-[#e6f7ef] border border-[#b2e5cb] text-[#0d7d59] flex items-start gap-3">
              <Check size={18} className="shrink-0 mt-0.5 text-[#0d7d59]" />
              <div>
                <p className="font-extrabold text-sm">Linked: {successMsg.name}</p>
                <p className="text-xs mt-0.5">You can now see their progress.</p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-[#fff1f2] border border-[#fecdd3] text-[#be123c] flex items-start gap-3">
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-[#be123c]" />
              <div>
                <p className="font-extrabold text-sm">{errorMsg}</p>
                <p className="text-xs mt-0.5">Check the number the school has on file.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
