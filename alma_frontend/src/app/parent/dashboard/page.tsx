"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/app/_Context/AuthContext";
import api from "@/services/api";
import MangoIcon from "@/components/MangoIcon";
import { toast } from "sonner";
import {
  Users,
  Flame,
  BookOpen,
  Mail,
  PlusCircle,
  AlertCircle,
  Send,
  LogOut,
  RefreshCw,
} from "lucide-react";

interface ChildProgress {
  student_id: string;
  first_name: string;
  last_name: string;
  student_code: string;
  grade_level: string;
  school_name: string | null;
  current_streak: number;
  longest_streak: number;
  lessons_completed: number;
  struggling_concepts: Array<{
    concept_id: string;
    concept_label: string;
    times_tested?: number;
    times_wrong?: number;
    last_diagnosed_misconception?: string | null;
  }>;
}

interface TeacherMessage {
  _id: string;
  to_teacher_name?: string;
  subject: string;
  message: string;
  created_at: string;
}

export default function ParentDashboard() {
  const { user, logout } = useAuth();
  const [children, setChildren] = useState<ChildProgress[]>([]);
  const [messages, setMessages] = useState<TeacherMessage[]>([]);
  const [loading, setLoading] = useState(true);

  // Link child form modal/inline
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkEmail, setLinkEmail] = useState("");
  const [linkCode, setLinkCode] = useState("");
  const [linkLoading, setLinkLoading] = useState(false);

  // Message modal
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [teacherId, setTeacherId] = useState("");
  const [teachersList, setTeachersList] = useState<any[]>([]);
  const [msgSubject, setMsgSubject] = useState("");
  const [msgBody, setMsgBody] = useState("");
  const [msgLoading, setMsgLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Get parent profile to read children array
      const profileRes = await api.get("/parents/profile");
      const parentData = profileRes.data?.data;
      const childIds: string[] = parentData?.children || [];

      // 2. Fetch progress for each child
      const progressPromises = childIds.map((cid) =>
        api
          .get(`/parents/child/${cid}/progress`)
          .then((r) => r.data?.data)
          .catch(() => null)
      );
      const results = await Promise.all(progressPromises);
      setChildren(results.filter(Boolean));

      // 3. Fetch past messages sent to teachers
      const msgRes = await api.get("/parents/messages").catch(() => ({ data: { data: [] } }));
      setMessages(msgRes.data?.data || []);

      // 4. Fetch teachers list for selector
      const tRes = await api.get("/teachers").catch(() => ({ data: { data: [] } }));
      setTeachersList(tRes.data?.data || []);
    } catch (err: any) {
      console.error("Failed to load parent dashboard data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLinkChild = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkEmail.trim() && !linkCode.trim()) {
      toast.error("Please provide either child's email or student code");
      return;
    }
    setLinkLoading(true);
    try {
      const res = await api.post("/parents/link-child", {
        child_email: linkEmail.trim() || undefined,
        child_student_code: linkCode.trim() || undefined,
      });
      if (res.data?.success) {
        toast.success("Child linked successfully!");
        setShowLinkModal(false);
        setLinkEmail("");
        setLinkCode("");
        loadData();
      }
    } catch (err: any) {
      const msg = err.response?.data?.error || "Failed to link child. Check email or student code.";
      toast.error(msg);
    } finally {
      setLinkLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherId || !msgSubject.trim() || !msgBody.trim()) {
      toast.error("Please fill in teacher, subject, and message");
      return;
    }
    setMsgLoading(true);
    try {
      const res = await api.post("/parents/messages", {
        teacher_id: teacherId,
        subject: msgSubject.trim(),
        message: msgBody.trim(),
      });
      if (res.data?.success) {
        toast.success("Message sent to teacher!");
        setShowMessageModal(false);
        setMsgSubject("");
        setMsgBody("");
        loadData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to send message");
    } finally {
      setMsgLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fff8ec] text-[#10292e]">
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#ebdcc7] px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <MangoIcon size={42} animated />
          <div>
            <h1 className="text-xl font-black text-[#10292e]">ALMA Parent Portal</h1>
            <p className="text-xs text-[#5a6e70] font-semibold">
              Monitoring progress &amp; teacher collaboration
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            title="Refresh Data"
            className="p-2.5 rounded-full hover:bg-[#fff8ec] text-[#5a6e70] hover:text-[#10292e] transition"
          >
            <RefreshCw size={18} />
          </button>
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-[#10292e]">
              {user?.first_name} {user?.last_name}
            </p>
            <p className="text-[11px] text-[#5a6e70]">{user?.email}</p>
          </div>
          <button
            onClick={() => logout()}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-[#fbeef0] text-[#cc4d4c] hover:bg-[#f6d7d7] rounded-xl transition"
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Banner */}
        <div className="bg-[#4ba3d0] rounded-3xl p-6 sm:p-8 text-white mb-8 shadow-sm relative overflow-hidden flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase bg-white/20 px-3 py-1 rounded-full text-white tracking-wider">
              Parent Dashboard
            </span>
            <h2 className="text-2xl sm:text-3xl font-black mt-2">
              Welcome, {user?.first_name || "Parent"}!
            </h2>
            <p className="text-white/90 text-sm mt-1 max-w-lg">
              Here you can monitor your children&apos;s coding activity, view their learning streaks,
              check areas where they might need support, and message their teachers.
            </p>
          </div>

          <div className="flex gap-2.5 shrink-0">
            <button
              onClick={() => setShowLinkModal(true)}
              className="bg-white text-[#10292e] hover:bg-[#fff8ec] text-xs font-black px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition"
            >
              <PlusCircle size={16} />
              <span>Link Child</span>
            </button>
            <button
              onClick={() => setShowMessageModal(true)}
              className="bg-[#10292e] text-white hover:bg-black text-xs font-black px-4 py-3 rounded-2xl flex items-center gap-2 shadow-sm transition"
            >
              <Mail size={16} />
              <span>Contact Teacher</span>
            </button>
          </div>
        </div>

        {/* Children Progress Grid */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-[#10292e] flex items-center gap-2">
              <Users className="text-[#4ba3d0]" size={22} />
              <span>My Children ({children.length})</span>
            </h3>
          </div>

          {loading ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#ebdcc7]">
              <MangoIcon size={60} animated className="mx-auto mb-2" />
              <p className="text-sm font-bold text-[#5a6e70]">Loading your children&apos;s data...</p>
            </div>
          ) : children.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-3xl border border-dashed border-[#d2dcd7]">
              <Users size={44} className="mx-auto text-[#a2b5b0] mb-2" />
              <h4 className="text-base font-extrabold text-[#10292e]">No child linked yet</h4>
              <p className="text-xs text-[#5a6e70] mt-1 max-w-md mx-auto">
                Connect your account with your child using their student email or student code so you
                can start following their progress.
              </p>
              <button
                onClick={() => setShowLinkModal(true)}
                className="mt-4 bg-[#7ccbf0] hover:brightness-95 text-[#10292e] text-xs font-black px-5 py-2.5 rounded-full transition"
              >
                + Link a Child Now
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {children.map((child) => (
                <div
                  key={child.student_id}
                  className="bg-white rounded-3xl p-6 border border-[#ebdcc7] shadow-sm hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between border-b border-[#f3ede3] pb-4 mb-4">
                    <div>
                      <h4 className="text-lg font-black text-[#10292e]">
                        {child.first_name} {child.last_name}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-xs text-[#5a6e70]">
                        <span className="bg-[#eef7fb] text-[#2d7ba4] font-bold px-2 py-0.5 rounded-md">
                          {child.student_code}
                        </span>
                        <span>•</span>
                        <span>{child.grade_level || "Grade 8"}</span>
                        {child.school_name && (
                          <>
                            <span>•</span>
                            <span>{child.school_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="bg-[#fff8ec] rounded-2xl p-3 border border-[#f5ebd8] text-center">
                      <Flame size={18} className="text-[#ffa11f] mx-auto mb-1" />
                      <p className="text-lg font-black text-[#10292e]">{child.current_streak}</p>
                      <p className="text-[10px] font-bold text-[#5a6e70] uppercase">Days Streak</p>
                    </div>

                    <div className="bg-[#f0f9f6] rounded-2xl p-3 border border-[#d2eee4] text-center">
                      <BookOpen size={18} className="text-[#118a80] mx-auto mb-1" />
                      <p className="text-lg font-black text-[#10292e]">{child.lessons_completed}</p>
                      <p className="text-[10px] font-bold text-[#5a6e70] uppercase">Lessons</p>
                    </div>

                    <div className="bg-[#eef7fb] rounded-2xl p-3 border border-[#cbe4f2] text-center">
                      <Flame size={18} className="text-[#4ba3d0] mx-auto mb-1" />
                      <p className="text-lg font-black text-[#10292e]">{child.longest_streak}</p>
                      <p className="text-[10px] font-bold text-[#5a6e70] uppercase">Max Streak</p>
                    </div>
                  </div>

                  {/* Struggling Concepts Section */}
                  <div>
                    <h5 className="text-xs font-bold text-[#10292e] mb-2 flex items-center gap-1.5">
                      <AlertCircle size={14} className="text-[#f25c78]" />
                      <span>Areas Needing Practice:</span>
                    </h5>
                    {child.struggling_concepts && child.struggling_concepts.length > 0 ? (
                      <div className="space-y-1.5">
                        {child.struggling_concepts.map((concept, idx) => (
                          <div
                            key={idx}
                            className="text-xs bg-[#fef5f5] text-[#cc4d4c] p-2.5 rounded-xl border border-[#fbd3d3] flex items-center justify-between"
                          >
                            <span className="font-bold">{concept.concept_label}</span>
                            <span className="text-[10px] bg-white px-2 py-0.5 rounded-full font-bold">
                              {concept.times_wrong || 0} misses
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-[#5a6e70] italic bg-[#fafaf8] p-3 rounded-xl border border-[#ecebe6]">
                        Doing great! No major misconceptions detected.
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Teacher & Communication Log */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-black text-[#10292e] flex items-center gap-2">
              <Mail className="text-[#f25c78]" size={22} />
              <span>Teacher Communications ({messages.length})</span>
            </h3>
            <button
              onClick={() => setShowMessageModal(true)}
              className="text-xs font-black text-[#4ba3d0] hover:underline"
            >
              + New Message
            </button>
          </div>

          {messages.length === 0 ? (
            <div className="p-6 bg-white rounded-3xl border border-[#ebdcc7] text-center text-xs text-[#5a6e70]">
              No messages sent yet. Use &ldquo;Contact Teacher&rdquo; to send a note to your child&apos;s educator.
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className="bg-white rounded-2xl p-4 border border-[#ebdcc7] shadow-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-black text-[#10292e]">{msg.subject}</h4>
                    <span className="text-[10px] text-[#5a6e70]">
                      {new Date(msg.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs text-[#5a6e70] mb-2">
                    To: <span className="font-bold text-[#10292e]">{msg.to_teacher_name || "Teacher"}</span>
                  </p>
                  <p className="text-xs text-[#2b4144] bg-[#fafaf8] p-3 rounded-xl border border-[#f0ede6]">
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Link Child Modal */}
      {showLinkModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-md shadow-xl border border-[#ebdcc7]">
            <h3 className="text-xl font-black text-[#10292e] mb-1">Link a Child</h3>
            <p className="text-xs text-[#5a6e70] mb-4">
              Enter your child&apos;s registered student email or their student code (e.g. STU-1001)
            </p>

            <form onSubmit={handleLinkChild} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  Child&apos;s Email
                </label>
                <input
                  type="email"
                  value={linkEmail}
                  onChange={(e) => setLinkEmail(e.target.value)}
                  placeholder="alex.smith@student.alma.edu"
                  className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-3 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
                />
              </div>

              <div className="text-center text-xs font-bold text-[#5a6e70]">OR</div>

              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  Student Code
                </label>
                <input
                  type="text"
                  value={linkCode}
                  onChange={(e) => setLinkCode(e.target.value)}
                  placeholder="STU-1001"
                  className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-3 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="flex-1 py-3 text-xs font-bold text-[#5a6e70] hover:bg-[#fafaf8] rounded-full border border-[#d2dcd7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={linkLoading}
                  className="flex-1 py-3 text-xs font-black bg-[#7ccbf0] hover:brightness-95 text-[#10292e] rounded-full"
                >
                  {linkLoading ? "Linking..." : "Confirm & Link"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Message Teacher Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-lg shadow-xl border border-[#ebdcc7]">
            <h3 className="text-xl font-black text-[#10292e] mb-1">Message Teacher</h3>
            <p className="text-xs text-[#5a6e70] mb-4">
              Send a note to discuss your child&apos;s learning progress or ask questions
            </p>

            <form onSubmit={handleSendMessage} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  Select Educator
                </label>
                <select
                  value={teacherId}
                  onChange={(e) => setTeacherId(e.target.value)}
                  required
                  className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-3 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
                >
                  <option value="">-- Choose a teacher --</option>
                  {teachersList.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.first_name} {t.last_name} ({t.specialization || "Instructor"})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">Subject</label>
                <input
                  type="text"
                  value={msgSubject}
                  onChange={(e) => setMsgSubject(e.target.value)}
                  placeholder="Regarding Alex's lesson pacing"
                  required
                  className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-3 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">Message</label>
                <textarea
                  value={msgBody}
                  onChange={(e) => setMsgBody(e.target.value)}
                  placeholder="Hello, I wanted to ask how my child is doing with loops..."
                  rows={4}
                  required
                  className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-3 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 py-3 text-xs font-bold text-[#5a6e70] hover:bg-[#fafaf8] rounded-full border border-[#d2dcd7]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={msgLoading}
                  className="flex-1 py-3 text-xs font-black bg-[#f25c78] hover:brightness-95 text-white rounded-full flex items-center justify-center gap-1.5"
                >
                  <Send size={14} />
                  <span>{msgLoading ? "Sending..." : "Send Message"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
