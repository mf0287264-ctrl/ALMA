"use client";

import { apiError } from "@/lib/api-error";

import { deferRequest } from "@/lib/defer-request";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import api from "@/services/api";
import { useAuth } from "@/app/_Context/AuthContext";
import {
  Users,
  Search,
  Send,
  BookOpen,
  CheckSquare,
  MessageSquare,
  Sparkles,
  KeyRound,
  GraduationCap,
  Clock,
  Calendar,
  Loader2,
  ChevronRight,
  User,
} from "lucide-react";
import { toast } from "sonner";

interface RealTeacher {
  _id: string;
  first_name: string;
  last_name?: string;
  email: string;
  teacher_code?: string;
  specialization?: string;
  phone_number?: string;
  profile_image?: string | null;
  bio?: string;
}

interface DirectChatMessage {
  _id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  read?: boolean;
  created_at: string;
  is_mine: boolean;
}

interface EnrolledGroupLesson {
  _id: string;
  title: string;
  topic: string;
  duration_minutes: number;
  programming_language: string;
  lesson_id?: string;
  created_at: string;
}

interface EnrolledGroupTask {
  _id: string;
  title: string;
  description?: string;
  due_date?: string;
  status: "assigned" | "completed";
  created_at: string;
}

interface EnrolledGroupMessage {
  _id: string;
  sender_id: string;
  sender_name: string;
  sender_role: "teacher" | "student";
  sender_image?: string | null;
  message: string;
  created_at: string;
}

interface EnrolledGroup {
  _id: string;
  name: string;
  description?: string;
  subject: string;
  grade_level: string;
  class_code: string;
  teacher_id: { _id?: string; first_name?: string; last_name?: string } | null;
  teacher_name: string;
  lessons: EnrolledGroupLesson[];
  tasks: EnrolledGroupTask[];
  messages: EnrolledGroupMessage[];
  created_at: string;
}

export default function TeacherCommunicationPage() {
  const { user } = useAuth();
  const [topTab, setTopTab] = useState<"classes" | "direct">("classes");

  // Enrolled groups state
  const [myGroups, setMyGroups] = useState<EnrolledGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [classSubTab, setClassSubTab] = useState<"lessons" | "tasks" | "chat">("lessons");

  // Join code state
  const [joinCode, setJoinCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  // Group chat state
  const [groupChatInput, setGroupChatInput] = useState("");
  const [isSendingGroupMessage, setIsSendingGroupMessage] = useState(false);
  const groupChatBottomRef = useRef<HTMLDivElement>(null);

  // TRUE Teachers state (loaded from MongoDB database)
  const [teachersList, setTeachersList] = useState<RealTeacher[]>([]);
  const [loadingTeachers, setLoadingTeachers] = useState(true);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  // Direct Teacher Chat messages
  const [directMessages, setDirectMessages] = useState<DirectChatMessage[]>([]);
  const [loadingDirectChat, setLoadingDirectChat] = useState(false);
  const [directInputMessage, setDirectInputMessage] = useState("");
  const [isSendingDirect, setIsSendingDirect] = useState(false);
  const directChatBottomRef = useRef<HTMLDivElement>(null);

  // Fetch enrolled class groups from DB
  const fetchMyGroups = async (selectId?: string) => {
    try {
      const res = await api.get("/teacher-groups/my-groups");
      const list: EnrolledGroup[] = res.data?.data || [];
      setMyGroups(list);
      if (selectId) {
        setSelectedGroupId(selectId);
      } else if (!selectedGroupId && list.length > 0) {
        const requested = new URLSearchParams(window.location.search).get("group");
        setSelectedGroupId(list.find((group) => group._id === requested)?._id || list[0]._id);
      }
    } catch (err: unknown) {
      console.error("Failed to load joined groups:", err);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Fetch REAL teachers from DB (/api/v1/teachers)
  const fetchTeachers = async () => {
    try {
      setLoadingTeachers(true);
      const res = await api.get("/teachers");
      const list: RealTeacher[] = res.data?.data || [];
      setTeachersList(list);
      if (list.length > 0 && !selectedTeacherId) {
        setSelectedTeacherId(list[0]._id);
      }
    } catch (err: unknown) {
      console.error("Failed to load real teachers:", err);
    } finally {
      setLoadingTeachers(false);
    }
  };

  useEffect(() => {
    return deferRequest(() => {
      fetchMyGroups();
      fetchTeachers();
    });
  }, []);

  const activeGroup = myGroups.find((g) => g._id === selectedGroupId) || null;
  const activeTeacher = teachersList.find((t) => t._id === selectedTeacherId) || teachersList[0] || null;

  // Auto scroll group chat
  useEffect(() => {
    if (activeGroup && groupChatBottomRef.current) {
      groupChatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeGroup?.messages]);

  // Load real direct conversation with selected teacher
  const loadTeacherConversation = useCallback(async (teacherId: string) => {
    try {
      setLoadingDirectChat(true);
      const res = await api.get(`/messages/${teacherId}`);
      if (res.data?.success && res.data?.data) {
        setDirectMessages(res.data.data.messages || []);
      } else {
        setDirectMessages([]);
      }
    } catch (err: unknown) {
      // No prior messages is normal
      setDirectMessages([]);
    } finally {
      setLoadingDirectChat(false);
    }
  }, []);

  useEffect(() => {
    return deferRequest(() => {
      if (selectedTeacherId && topTab === "direct") {
      loadTeacherConversation(selectedTeacherId);
      }
    });
  }, [selectedTeacherId, topTab, loadTeacherConversation]);

  // Auto scroll direct chat
  useEffect(() => {
    if (directChatBottomRef.current) {
      directChatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [directMessages]);

  // Join group via class code
  const handleJoinWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = joinCode.trim().toUpperCase();
    if (!cleanCode) {
      toast.error("Please enter a class code");
      return;
    }

    setIsJoining(true);
    try {
      const res = await api.post("/teacher-groups/join", { class_code: cleanCode });
      const joinedGroup = res.data?.data;
      toast.success(res.data?.message || `Joined ${joinedGroup?.name || "class"}!`);
      setJoinCode("");
      await fetchMyGroups(joinedGroup?._id);
      setTopTab("classes");
    } catch (err: unknown) {
      toast.error(apiError(err, "Failed to join class. Please verify the code."));
    } finally {
      setIsJoining(false);
    }
  };

  // Send message in class group
  const handleSendGroupMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || !groupChatInput.trim()) return;
    const text = groupChatInput.trim();
    setGroupChatInput("");
    setIsSendingGroupMessage(true);

    try {
      const res = await api.post(`/teacher-groups/${activeGroup._id}/messages`, {
        message: text,
      });
      const newMsg = res.data?.data;
      setMyGroups((prev) =>
        prev.map((g) =>
          g._id === activeGroup._id
            ? { ...g, messages: [...(g.messages || []), newMsg] }
            : g
        )
      );
    } catch (err: unknown) {
      toast.error(apiError(err, "Failed to send message to class"));
    } finally {
      setIsSendingGroupMessage(false);
    }
  };

  // Send REAL direct message to teacher
  const handleSendDirect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!directInputMessage.trim() || !activeTeacher || isSendingDirect) return;

    const textToSend = directInputMessage.trim();
    setDirectInputMessage("");
    setIsSendingDirect(true);

    try {
      const res = await api.post(`/messages/${activeTeacher._id}`, {
        message: textToSend,
      });

      if (res.data?.success && res.data?.data) {
        setDirectMessages((prev) => [...prev, res.data.data]);
        toast.success("Message sent to teacher!");
      }
    } catch (err: unknown) {
      toast.error(apiError(err, "Failed to send message"));
    } finally {
      setIsSendingDirect(false);
    }
  };

  // Filter true teachers
  const filteredTeachers = teachersList.filter((t) => {
    const fullName = `${t.first_name || ""} ${t.last_name || ""}`.toLowerCase();
    const spec = (t.specialization || "").toLowerCase();
    const code = (t.teacher_code || "").toLowerCase();
    const q = search.toLowerCase();
    return fullName.includes(q) || spec.includes(q) || code.includes(q);
  });

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-4 sm:px-8 lg:px-10 pt-20 lg:pt-8 pb-16 flex flex-col">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#ffa11f] bg-[#ffa11f]/15 px-2.5 py-1 rounded-full">
                Teacher &amp; Cohort Learning
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#10292e] tracking-tight mt-1">
              My Teachers &amp; Classes
            </h1>
            <p className="text-sm font-medium text-[#607274] mt-1">
              Join your teacher&apos;s class using their Class Code, access custom cohort lessons, and communicate directly with real teachers.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center bg-white p-1 rounded-2xl border border-[#e8eeea] shadow-2xs self-start sm:self-auto">
            <button
              onClick={() => setTopTab("classes")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                topTab === "classes"
                  ? "bg-[#ffa11f] text-[#10292e] shadow-xs"
                  : "text-[#607274] hover:text-[#10292e]"
              }`}
            >
              <Users size={15} />
              <span>My Class Groups ({myGroups.length})</span>
            </button>
            <button
              onClick={() => setTopTab("direct")}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                topTab === "direct"
                  ? "bg-[#ffa11f] text-[#10292e] shadow-xs"
                  : "text-[#607274] hover:text-[#10292e]"
              }`}
            >
              <MessageSquare size={15} />
              <span>Direct Messages with Teachers ({teachersList.length})</span>
            </button>
          </div>
        </div>

        {/* HERO: JOIN CLASS WITH CODE */}
        <div className="bg-gradient-to-r from-[#10292e] to-[#1c3e44] text-white rounded-3xl p-6 sm:p-7 shadow-xs mb-8 border border-[#234b52]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ffa11f]/20 text-[#ffa11f] text-xs font-black uppercase tracking-wider mb-2">
                <KeyRound size={13} />
                <span>Join with Class Code</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Have a Code from Your Teacher?
              </h2>
              <p className="text-xs sm:text-sm text-white/80 mt-1 leading-relaxed">
                Enter your teacher&apos;s unique class code (e.g. <span className="font-mono font-bold text-[#ffa11f]">ALMA-3661</span>) to join their cohort, access custom AI-generated lessons, and complete tasks.
              </p>
            </div>

            {/* Code Input Form */}
            <form
              onSubmit={handleJoinWithCode}
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 bg-white/10 p-2 rounded-2xl border border-white/15 backdrop-blur-xs"
            >
              <input
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="e.g. ALMA-3661"
                className="font-mono uppercase tracking-wider text-sm font-black bg-white text-[#10292e] placeholder:text-[#8a999b] px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#ffa11f] w-full sm:w-48 shadow-inner"
              />
              <button
                type="submit"
                disabled={isJoining || !joinCode.trim()}
                className="inline-flex items-center justify-center gap-2 bg-[#ffa11f] hover:bg-[#ff9400] disabled:opacity-50 text-[#10292e] font-extrabold text-sm px-5 py-3 rounded-xl transition-all cursor-pointer shadow-xs whitespace-nowrap"
              >
                {isJoining ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Sparkles size={16} />
                )}
                <span>Join Class</span>
              </button>
            </form>
          </div>
        </div>

        {/* TAB CONTENT */}
        {topTab === "classes" ? (
          /* CLASS GROUPS WORKSPACE */
          loadingGroups ? (
            <div className="py-20 flex flex-col items-center justify-center text-[#607274]">
              <Loader2 className="animate-spin text-[#ffa11f] mb-3" size={32} />
              <p className="text-sm font-semibold">Loading your classes...</p>
            </div>
          ) : myGroups.length === 0 ? (
            /* Empty State */
            <div className="bg-white rounded-3xl border border-[#e8eeea] p-12 text-center max-w-xl mx-auto my-auto shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-[#ffa11f]/15 text-[#ffa11f] flex items-center justify-center mx-auto mb-4">
                <GraduationCap size={32} />
              </div>
              <h2 className="text-xl font-bold text-[#10292e] mb-2">No Classes Joined Yet</h2>
              <p className="text-sm text-[#607274] mb-6">
                Ask your teacher for their unique ALMA Class Code (like <span className="font-mono font-bold text-[#10292e]">ALMA-3661</span>) and enter it above to view your classroom lessons, assignments, and class chat!
              </p>
            </div>
          ) : (
            /* Grid with joined classes */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: My Class Cohorts */}
              <div className="lg:col-span-4 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-bold text-[#607274] uppercase tracking-wider">
                    My Cohorts ({myGroups.length})
                  </span>
                </div>

                {myGroups.map((group) => {
                  const isSelected = group._id === selectedGroupId;
                  return (
                    <div
                      key={group._id}
                      onClick={() => setSelectedGroupId(group._id)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isSelected
                          ? "bg-white border-[#ffa11f] shadow-md ring-2 ring-[#ffa11f]/20"
                          : "bg-white/80 hover:bg-white border-[#e8eeea]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-[#10292e]/10 text-[#10292e]">
                              {group.grade_level}
                            </span>
                            <span className="text-[10px] font-bold text-[#607274]">
                              {group.subject}
                            </span>
                          </div>
                          <h3 className="text-base font-black text-[#10292e] truncate mt-1">
                            {group.name}
                          </h3>
                          <p className="text-xs text-[#607274] mt-0.5 font-medium">
                            Teacher: <span className="text-[#10292e] font-bold">{group.teacher_name}</span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-[#f0f4f2] flex items-center justify-between text-xs text-[#607274]">
                        <span className="font-mono font-bold bg-[#fff8ec] text-[#10292e] px-2 py-0.5 rounded border border-[#f3e5cb]">
                          {group.class_code}
                        </span>
                        <span>
                          {group.lessons?.length || 0} Lessons · {group.tasks?.length || 0} Tasks
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Selected Class Workspace */}
              <div className="lg:col-span-8 space-y-6">
                {activeGroup && (
                  <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#e8eeea]">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold bg-[#ffa11f] text-[#10292e] px-2.5 py-0.5 rounded-full">
                            {activeGroup.grade_level}
                          </span>
                          <span className="text-xs text-[#118a80] font-bold">
                            {activeGroup.subject}
                          </span>
                        </div>
                        <h2 className="text-2xl font-black text-[#10292e]">
                          {activeGroup.name}
                        </h2>
                        <p className="text-xs text-[#607274] mt-0.5">
                          Taught by <span className="font-bold text-[#10292e]">{activeGroup.teacher_name}</span>
                        </p>
                      </div>

                      <div className="bg-[#fff8ec] border border-[#f3e5cb] rounded-2xl p-3 text-right shrink-0">
                        <div className="text-[10px] uppercase font-bold text-[#607274]">
                          Class Code
                        </div>
                        <div className="font-mono text-lg font-black text-[#10292e]">
                          {activeGroup.class_code}
                        </div>
                      </div>
                    </div>

                    {/* Class Section Navigation Tabs */}
                    <div className="flex items-center gap-2 mt-6 pt-2 pb-4 border-b border-[#e8eeea] overflow-x-auto">
                      <button
                        type="button"
                        onClick={() => setClassSubTab("lessons")}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                          classSubTab === "lessons"
                            ? "bg-[#ffa11f] text-[#10292e] shadow-xs ring-2 ring-[#ffa11f]/30"
                            : "bg-[#fafaf8] text-[#607274] hover:text-[#10292e] hover:bg-[#f0ede4] border border-[#e8eeea]"
                        }`}
                      >
                        <BookOpen size={15} />
                        <span>Teacher Lessons</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            classSubTab === "lessons"
                              ? "bg-[#10292e] text-white"
                              : "bg-[#e8eeea] text-[#607274]"
                          }`}
                        >
                          {activeGroup.lessons?.length || 0}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setClassSubTab("tasks")}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                          classSubTab === "tasks"
                            ? "bg-[#ffa11f] text-[#10292e] shadow-xs ring-2 ring-[#ffa11f]/30"
                            : "bg-[#fafaf8] text-[#607274] hover:text-[#10292e] hover:bg-[#f0ede4] border border-[#e8eeea]"
                        }`}
                      >
                        <CheckSquare size={15} />
                        <span>Tasks &amp; Homework</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            classSubTab === "tasks"
                              ? "bg-[#10292e] text-white"
                              : "bg-[#e8eeea] text-[#607274]"
                          }`}
                        >
                          {activeGroup.tasks?.length || 0}
                        </span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setClassSubTab("chat")}
                        className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                          classSubTab === "chat"
                            ? "bg-[#ffa11f] text-[#10292e] shadow-xs ring-2 ring-[#ffa11f]/30"
                            : "bg-[#fafaf8] text-[#607274] hover:text-[#10292e] hover:bg-[#f0ede4] border border-[#e8eeea]"
                        }`}
                      >
                        <MessageSquare size={15} />
                        <span>Class Discussion</span>
                        <span
                          className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                            classSubTab === "chat"
                              ? "bg-[#10292e] text-white"
                              : "bg-[#e8eeea] text-[#607274]"
                          }`}
                        >
                          {activeGroup.messages?.length || 0}
                        </span>
                      </button>
                    </div>

                    {/* TAB 1: TEACHER LESSONS */}
                    {classSubTab === "lessons" && (
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-black text-[#10292e] flex items-center gap-2">
                              <BookOpen size={18} className="text-[#ffa11f]" />
                              <span>Assigned Lessons ({activeGroup.lessons?.length || 0})</span>
                            </h3>
                            <p className="text-xs text-[#607274] mt-0.5">
                              Custom curriculum generated and assigned by {activeGroup.teacher_name} for this cohort.
                            </p>
                          </div>
                        </div>

                        {(!activeGroup.lessons || activeGroup.lessons.length === 0) ? (
                          <div className="p-8 text-center bg-[#fafaf8] rounded-2xl border border-dashed border-[#ccd7d3]">
                            <BookOpen className="mx-auto text-[#607274] mb-2" size={32} />
                            <p className="text-sm font-bold text-[#10292e]">No lessons assigned yet</p>
                            <p className="text-xs text-[#607274] mt-1">
                              Your teacher hasn&apos;t published lessons for this cohort yet. Check back soon!
                            </p>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {activeGroup.lessons.map((lesson, idx) => (
                              <div
                                key={lesson._id || idx}
                                className="p-4 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] hover:bg-white hover:border-[#ffa11f] transition-all flex flex-col justify-between"
                              >
                                <div>
                                  <div className="flex items-center justify-between text-[11px] font-bold text-[#607274] mb-1">
                                    <span className="bg-[#10292e]/10 text-[#10292e] px-2 py-0.5 rounded">
                                      {lesson.programming_language || "Python"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Clock size={12} /> {lesson.duration_minutes || 15} mins
                                    </span>
                                  </div>
                                  <h4 className="text-sm font-bold text-[#10292e] mt-1">
                                    {lesson.title}
                                  </h4>
                                  <p className="text-xs text-[#607274] mt-0.5">
                                    Topic: {lesson.topic}
                                  </p>
                                </div>

                                <div className="mt-4 pt-3 border-t border-[#e8eeea] flex items-center justify-between">
                                  <span className="text-[10px] text-[#607274]">
                                    Assigned {new Date(lesson.created_at).toLocaleDateString()}
                                  </span>
                                  <Link
                                    href="/my-lessons/player"
                                    className="inline-flex items-center gap-1 bg-[#10292e] hover:bg-[#1b434b] text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs"
                                  >
                                    <span>Start Lesson</span>
                                    <ChevronRight size={13} />
                                  </Link>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 2: TASKS & HOMEWORK */}
                    {classSubTab === "tasks" && (
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-black text-[#10292e] flex items-center gap-2">
                              <CheckSquare size={18} className="text-emerald-600" />
                              <span>Class Tasks &amp; Homework ({activeGroup.tasks?.length || 0})</span>
                            </h3>
                            <p className="text-xs text-[#607274] mt-0.5">
                              Practice assignments, homework, and coding tasks assigned to your class.
                            </p>
                          </div>
                        </div>

                        {(!activeGroup.tasks || activeGroup.tasks.length === 0) ? (
                          <div className="p-8 text-center bg-[#fafaf8] rounded-2xl border border-dashed border-[#ccd7d3]">
                            <CheckSquare className="mx-auto text-[#607274] mb-2" size={32} />
                            <p className="text-sm font-bold text-[#10292e]">No active tasks</p>
                            <p className="text-xs text-[#607274] mt-1">
                              You&apos;re all caught up! No homework or tasks have been assigned.
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {activeGroup.tasks.map((task, idx) => (
                              <div
                                key={task._id || idx}
                                className="p-4 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                              >
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                      {task.status}
                                    </span>
                                    {task.due_date && (
                                      <span className="flex items-center gap-1 text-[11px] text-[#607274]">
                                        <Calendar size={12} />
                                        Due {new Date(task.due_date).toLocaleDateString()}
                                      </span>
                                    )}
                                  </div>
                                  <h4 className="text-sm font-bold text-[#10292e] mt-1.5">
                                    {task.title}
                                  </h4>
                                  {task.description && (
                                    <p className="text-xs text-[#607274] mt-1 leading-relaxed">
                                      {task.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 3: CLASS DISCUSSION CHANNEL */}
                    {classSubTab === "chat" && (
                      <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-base font-black text-[#10292e] flex items-center gap-2">
                              <MessageSquare size={18} className="text-[#ffa11f]" />
                              <span>{activeGroup.name} Discussion Channel</span>
                            </h3>
                            <p className="text-xs text-[#607274] mt-0.5">
                              Live chat room with your teacher and enrolled classmates.
                            </p>
                          </div>
                        </div>

                        <div className="rounded-2xl border border-[#e8eeea] bg-[#fafaf8] overflow-hidden flex flex-col h-[480px]">
                          {/* Messages list */}
                          <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {(!activeGroup.messages || activeGroup.messages.length === 0) ? (
                              <div className="text-center py-16 text-[#607274] text-xs">
                                No messages in this class group yet. Say hello to your teacher and classmates!
                              </div>
                            ) : (
                              activeGroup.messages.map((msg, idx) => {
                                const isTeacher = msg.sender_role === "teacher";
                                const isMe = msg.sender_id === user?._id || msg.sender_name === user?.name;
                                return (
                                  <div
                                    key={msg._id || idx}
                                    className={`flex flex-col ${
                                      isMe ? "items-end" : "items-start"
                                    }`}
                                  >
                                    <div className="flex items-center gap-1.5 mb-1 px-1">
                                      <span className="text-[11px] font-bold text-[#10292e]">
                                        {msg.sender_name}
                                      </span>
                                      <span
                                        className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${
                                          isTeacher
                                            ? "bg-[#ffa11f] text-[#10292e]"
                                            : "bg-[#10292e]/10 text-[#10292e]"
                                        }`}
                                      >
                                        {isTeacher ? "Teacher" : "Student"}
                                      </span>
                                      <span className="text-[10px] text-[#607274]">
                                        {new Date(msg.created_at).toLocaleTimeString([], {
                                          hour: "2-digit",
                                          minute: "2-digit",
                                        })}
                                      </span>
                                    </div>

                                    <div
                                      className={`max-w-md px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                                        isMe
                                          ? "bg-[#ffa11f] text-[#10292e] font-medium rounded-br-xs"
                                          : isTeacher
                                          ? "bg-[#10292e] text-white rounded-bl-xs"
                                          : "bg-white border border-[#e8eeea] text-[#10292e] rounded-bl-xs shadow-xs"
                                      }`}
                                    >
                                      {msg.message}
                                    </div>
                                  </div>
                                );
                              })
                            )}
                            <div ref={groupChatBottomRef} />
                          </div>

                          {/* Chat input */}
                          <form
                            onSubmit={handleSendGroupMessage}
                            className="p-3 bg-white border-t border-[#e8eeea] flex items-center gap-2"
                          >
                            <input
                              type="text"
                              value={groupChatInput}
                              onChange={(e) => setGroupChatInput(e.target.value)}
                              placeholder={`Message ${activeGroup.name} class & teacher...`}
                              className="flex-1 bg-[#fafaf8] border border-[#e8eeea] rounded-xl px-3.5 py-2.5 text-xs text-[#10292e] placeholder:text-[#607274] focus:outline-none focus:border-[#ffa11f]"
                            />
                            <button
                              type="submit"
                              disabled={isSendingGroupMessage || !groupChatInput.trim()}
                              className="bg-[#ffa11f] hover:bg-[#ff9400] disabled:opacity-50 text-[#10292e] font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
                            >
                              {isSendingGroupMessage ? (
                                <Loader2 size={14} className="animate-spin" />
                              ) : (
                                <Send size={14} />
                              )}
                              <span>Send</span>
                            </button>
                          </form>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          /* DIRECT TEACHER MESSAGING TAB (1-on-1 with REAL DB Teachers) */
          <div>
            {loadingTeachers ? (
              <div className="py-20 flex flex-col items-center justify-center text-[#607274]">
                <Loader2 className="animate-spin text-[#ffa11f] mb-3" size={32} />
                <p className="text-sm font-semibold">Loading real academy teachers...</p>
              </div>
            ) : teachersList.length === 0 ? (
              <div className="bg-white rounded-3xl border border-[#e8eeea] p-12 text-center max-w-xl mx-auto shadow-xs">
                <User size={32} className="mx-auto text-[#607274] mb-3" />
                <h3 className="text-base font-bold text-[#10292e]">No Teachers Found</h3>
                <p className="text-xs text-[#607274] mt-1">There are currently no active teachers in the academy system.</p>
              </div>
            ) : (
              /* 3 Columns Layout: Real Teachers List | Active Chat | Real Teacher Details */
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Column 1: Real Teachers (4 cols) */}
                <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[580px]">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="font-extrabold text-base text-[#10292e]">
                        Academy Teachers
                      </h2>
                      <span className="text-xs font-bold text-[#118a80] bg-emerald-50 px-2 py-0.5 rounded-md">
                        {teachersList.length} Active
                      </span>
                    </div>
                    <p className="text-xs text-[#8a999b] mb-4">Select a teacher to ask questions or view office hours</p>

                    {/* Search */}
                    <div className="relative mb-4">
                      <Search className="w-4 h-4 text-[#8a999b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search teachers by name or subject..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-[#fafaf8] rounded-full border border-[#e8eeea] text-xs text-[#10292e] placeholder-[#8a999b] focus:outline-hidden focus:border-[#ffa11f]"
                      />
                    </div>

                    {/* Real Teachers list */}
                    <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                      {filteredTeachers.map((t) => {
                        const isSelected = t._id === selectedTeacherId;
                        const teacherName = `${t.first_name || ""} ${t.last_name || ""}`.trim() || "Teacher";
                        return (
                          <button
                            key={t._id}
                            onClick={() => setSelectedTeacherId(t._id)}
                            className={`w-full text-left p-3.5 rounded-2xl transition-all cursor-pointer ${
                              isSelected
                                ? "border-2 border-[#ffa11f] bg-[#fffcf7] shadow-xs"
                                : "border border-[#e8eeea] bg-white hover:bg-[#fafaf8]"
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-sm text-[#10292e]">
                                {teacherName}
                              </span>
                              <span className="text-[10px] font-mono font-bold bg-[#10292e]/10 text-[#10292e] px-1.5 py-0.5 rounded">
                                {t.teacher_code || "TEACHER"}
                              </span>
                            </div>

                            <div className="text-xs font-semibold text-[#118a80] mt-0.5">
                              {t.specialization || "Computer Science & Programming"}
                            </div>

                            <div className="text-xs text-[#8a999b] truncate mt-1">
                              {t.email}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-[#f0f0eb] text-xs text-[#8a999b] space-y-1 mt-6">
                    <p className="font-medium">Direct messages with academy teachers.</p>
                    <p className="text-[#10292e] font-bold">Ask, learn, and keep growing.</p>
                  </div>
                </div>

                {/* Column 2: Chat Area (5 cols) */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[580px]">
                  <div>
                    {/* Header */}
                    {activeTeacher && (
                      <div className="pb-3 border-b border-[#f0f0eb] mb-4">
                        <div className="flex items-center justify-between">
                          <h2 className="font-black text-lg text-[#10292e]">
                            {activeTeacher.first_name} {activeTeacher.last_name || ""}
                          </h2>
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Verified Teacher
                          </span>
                        </div>
                        <div className="text-xs text-[#118a80] font-semibold mt-0.5">
                          {activeTeacher.specialization || "Computer Science Teacher"} · {activeTeacher.teacher_code || "ALMA"}
                        </div>
                      </div>
                    )}

                    {/* Chat Messages */}
                    {loadingDirectChat ? (
                      <div className="py-20 flex flex-col items-center justify-center text-[#607274]">
                        <Loader2 className="animate-spin text-[#ffa11f] mb-2" size={24} />
                        <span className="text-xs font-medium">Loading messages...</span>
                      </div>
                    ) : directMessages.length === 0 ? (
                      <div className="text-center py-16 text-[#607274] space-y-2">
                        <MessageSquare className="mx-auto text-[#607274]/50" size={32} />
                        <p className="text-xs font-bold text-[#10292e]">No messages yet with {activeTeacher?.first_name || "teacher"}</p>
                        <p className="text-[11px] text-[#8a999b] max-w-xs mx-auto">
                          Send a message to ask about coursework, code debugging, or get homework help.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[360px] overflow-y-auto p-1">
                        {directMessages.map((m) => (
                          <div
                            key={m._id}
                            className={`flex flex-col ${
                              m.is_mine ? "items-end" : "items-start"
                            }`}
                          >
                            <div
                              className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                                m.is_mine
                                  ? "bg-[#ffa11f] text-[#10292e] font-medium rounded-br-xs shadow-2xs"
                                  : "bg-[#f1f3f2] text-[#10292e] rounded-bl-xs"
                              }`}
                            >
                              {m.message}
                            </div>
                            <div className="text-[10px] text-[#8a999b] mt-1 px-1">
                              {new Date(m.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        ))}
                        <div ref={directChatBottomRef} />
                      </div>
                    )}
                  </div>

                  {/* Input area */}
                  <form onSubmit={handleSendDirect} className="pt-4 flex items-center gap-2 mt-4 border-t border-[#f0f0eb]">
                    <input
                      type="text"
                      value={directInputMessage}
                      onChange={(e) => setDirectInputMessage(e.target.value)}
                      placeholder={`Message ${activeTeacher?.first_name || "teacher"}...`}
                      className="flex-1 px-4 py-2.5 bg-[#fafaf8] rounded-full border border-[#e8eeea] text-xs text-[#10292e] focus:outline-hidden focus:border-[#ffa11f]"
                    />
                    <button
                      type="submit"
                      disabled={isSendingDirect || !directInputMessage.trim()}
                      className="px-6 py-2.5 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] disabled:opacity-50 text-[#10292e] font-extrabold text-xs shadow-xs transition-colors shrink-0 cursor-pointer flex items-center gap-1.5"
                    >
                      {isSendingDirect ? <Loader2 size={13} className="animate-spin" /> : null}
                      <span>Send</span>
                    </button>
                  </form>
                </div>

                {/* Column 3: Teacher details (3 cols) */}
                <div className="lg:col-span-3 bg-white rounded-3xl p-5 sm:p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[580px]">
                  {activeTeacher ? (
                    <div className="space-y-5">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-[#10292e]" />
                        <h3 className="font-extrabold text-base text-[#10292e]">
                          Teacher Details
                        </h3>
                      </div>

                      <div>
                        <div className="font-black text-lg text-[#10292e]">
                          {activeTeacher.first_name} {activeTeacher.last_name || ""}
                        </div>
                        <div className="text-xs text-[#118a80] font-semibold mt-0.5">
                          {activeTeacher.specialization || "Computer Science Teacher"}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-black tracking-wider text-[#8a999b] uppercase">
                          TEACHER CODE
                        </div>
                        <div className="font-mono text-xs font-bold text-[#10292e] mt-0.5">
                          {activeTeacher.teacher_code || "TEA-0000"}
                        </div>
                      </div>

                      <div>
                        <div className="text-[10px] font-black tracking-wider text-[#8a999b] uppercase">
                          EMAIL
                        </div>
                        <div className="text-xs font-bold text-[#10292e] mt-0.5 break-all">
                          {activeTeacher.email}
                        </div>
                      </div>

                      {activeTeacher.phone_number && (
                        <div>
                          <div className="text-[10px] font-black tracking-wider text-[#8a999b] uppercase">
                            PHONE
                          </div>
                          <div className="text-xs font-bold text-[#10292e] mt-0.5">
                            {activeTeacher.phone_number}
                          </div>
                        </div>
                      )}

                      <div className="pt-3 border-t border-[#f0f0eb]">
                        <div className="font-black text-sm text-[#10292e]">
                          Enrolled Cohorts
                        </div>
                        <p className="text-xs text-[#607274] mt-1">
                          {myGroups.filter(g => g.teacher_name?.includes(activeTeacher.first_name)).length > 0 ? (
                            <span>You are enrolled in classes taught by {activeTeacher.first_name}.</span>
                          ) : (
                            <span>Ask {activeTeacher.first_name} for their Class Code to join their cohort.</span>
                          )}
                        </p>

                        <div className="mt-4">
                          <Link
                            href="/my-lessons"
                            className="block text-center w-full py-2.5 rounded-full border border-[#10292e] text-[#10292e] hover:bg-[#10292e] hover:text-white text-xs font-bold transition-colors"
                          >
                            Browse My Lessons
                          </Link>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <p className="text-[11px] text-[#8a999b] leading-relaxed pt-4 border-t border-[#f0f0eb] mt-6">
                    Connect with your teachers to ask about coursework, code debugging, and projects.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
