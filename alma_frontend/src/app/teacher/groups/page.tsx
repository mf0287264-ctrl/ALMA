"use client";

import { apiError } from "@/lib/api-error";

import { deferRequest } from "@/lib/defer-request";

import React, { useState, useEffect, useRef } from "react";
import TeacherSidebar from "@/components/TeacherSidebar";
import api from "@/services/api";
import { useAuth } from "@/app/_Context/AuthContext";
import {
  Users,
  Plus,
  Copy,
  Check,
  BookOpen,
  CheckSquare,
  MessageSquare,
  Search,
  Trash2,
  ExternalLink,
  Calendar,
  Clock,
  Send,
  Loader2,
  Sparkles,
  GraduationCap,
  ChevronRight,
  ArrowLeft,
  UserPlus,
  Shield,
  Layers,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface StudentItem {
  _id: string;
  first_name: string;
  last_name?: string;
  student_code?: string;
  email?: string;
  grade_level?: string;
  profile_image?: string | null;
}

interface GroupLesson {
  _id: string;
  title: string;
  topic: string;
  duration_minutes: number;
  programming_language: string;
  lesson_id?: string | null;
  created_at: string;
}

interface GroupTask {
  _id: string;
  title: string;
  description?: string;
  due_date?: string | null;
  status: "assigned" | "completed";
  created_at: string;
}

interface GroupMessage {
  _id: string;
  sender_id: string;
  sender_name: string;
  sender_role: "teacher" | "student";
  sender_image?: string | null;
  message: string;
  created_at: string;
}

interface TeacherGroup {
  _id: string;
  name: string;
  description?: string;
  subject: string;
  grade_level: string;
  class_code: string;
  teacher_id: string;
  teacher_name: string;
  students: StudentItem[];
  lessons: GroupLesson[];
  tasks: GroupTask[];
  messages: GroupMessage[];
  created_at: string;
}

export default function TeacherGroupsPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<TeacherGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"roster" | "lessons" | "tasks" | "chat">("roster");

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  // Forms state
  const [createForm, setCreateForm] = useState({
    name: "",
    subject: "Computer Science & Python",
    grade_level: "Grade 8",
    description: "",
  });
  const [isSubmittingGroup, setIsSubmittingGroup] = useState(false);

  const [lessonForm, setLessonForm] = useState({
    title: "",
    topic: "",
    duration_minutes: 15,
    programming_language: "Python",
  });
  const [isSubmittingLesson, setIsSubmittingLesson] = useState(false);

  const [taskForm, setTaskForm] = useState({
    title: "",
    description: "",
    due_date: "",
  });
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  const [studentIdentifier, setStudentIdentifier] = useState("");
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);

  // Chat state
  const [chatInput, setChatInput] = useState("");
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch groups
  const fetchGroups = async (selectId?: string) => {
    try {
      const res = await api.get("/teacher-groups/my-groups");
      const list: TeacherGroup[] = res.data?.data || [];
      setGroups(list);
      if (selectId) {
        setSelectedGroupId(selectId);
      } else if (!selectedGroupId && list.length > 0) {
        // default select first group
        setSelectedGroupId(list[0]._id);
      }
    } catch (err: unknown) {
      console.error("Failed to load teacher groups:", err);
      toast.error(apiError(err, "Failed to load class groups"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return deferRequest(() => {
      fetchGroups();
    });
  }, []);

  const activeGroup = groups.find((g) => g._id === selectedGroupId) || null;

  // Auto-scroll chat to bottom
  useEffect(() => {
    if (activeTab === "chat" && chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [activeGroup?.messages, activeTab]);

  // Copy code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    toast.success(`Class code ${code} copied! Share it with your students.`);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // Create new group
  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.name.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    setIsSubmittingGroup(true);
    try {
      const res = await api.post("/teacher-groups", createForm);
      const newGroup = res.data?.data;
      toast.success(`Group "${newGroup?.name}" created with code ${newGroup?.class_code}!`);
      setShowCreateModal(false);
      setCreateForm({
        name: "",
        subject: "Computer Science & Python",
        grade_level: "Grade 8",
        description: "",
      });
      await fetchGroups(newGroup?._id);
    } catch (err: unknown) {
      toast.error(apiError(err, "Failed to create group"));
    } finally {
      setIsSubmittingGroup(false);
    }
  };

  // Add student directly
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || !studentIdentifier.trim()) return;
    setIsSubmittingStudent(true);
    try {
      const res = await api.post(`/teacher-groups/${activeGroup._id}/students`, {
        student_identifier: studentIdentifier.trim(),
      });
      const updated = res.data?.data;
      setGroups((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
      toast.success("Student enrolled successfully!");
      setStudentIdentifier("");
      setShowAddStudentModal(false);
    } catch (err: unknown) {
      toast.error(apiError(err, "Failed to add student. Ensure code/email is correct."));
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  // Remove student
  const handleRemoveStudent = async (studentId: string, studentName: string) => {
    if (!activeGroup) return;
    if (!confirm(`Are you sure you want to remove ${studentName} from this group?`)) return;
    try {
      const res = await api.delete(`/teacher-groups/${activeGroup._id}/students/${studentId}`);
      const updated = res.data?.data;
      setGroups((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
      toast.success(`${studentName} removed from class.`);
    } catch (err: unknown) {
      toast.error(apiError(err, "Failed to remove student"));
    }
  };

  // Add lesson to group
  const handleAddLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || !lessonForm.title.trim()) return;
    setIsSubmittingLesson(true);
    try {
      const res = await api.post(`/teacher-groups/${activeGroup._id}/lessons`, lessonForm);
      const updated = res.data?.data;
      setGroups((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
      toast.success("Lesson assigned to class group!");
      setLessonForm({
        title: "",
        topic: "",
        duration_minutes: 15,
        programming_language: "Python",
      });
      setShowAddLessonModal(false);
    } catch (err: unknown) {
      toast.error(apiError(err, "Failed to assign lesson"));
    } finally {
      setIsSubmittingLesson(false);
    }
  };

  // Add task to group
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || !taskForm.title.trim()) return;
    setIsSubmittingTask(true);
    try {
      const res = await api.post(`/teacher-groups/${activeGroup._id}/tasks`, taskForm);
      const updated = res.data?.data;
      setGroups((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
      toast.success("Task assigned to class group!");
      setTaskForm({ title: "", description: "", due_date: "" });
      setShowAddTaskModal(false);
    } catch (err: unknown) {
      toast.error(apiError(err, "Failed to assign task"));
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Send group chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeGroup || !chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput("");
    setIsSendingMessage(true);
    try {
      const res = await api.post(`/teacher-groups/${activeGroup._id}/messages`, {
        message: text,
      });
      const newMsg = res.data?.data;
      setGroups((prev) =>
        prev.map((g) =>
          g._id === activeGroup._id
            ? { ...g, messages: [...(g.messages || []), newMsg] }
            : g
        )
      );
    } catch (err: unknown) {
      toast.error(apiError(err, "Failed to send message"));
    } finally {
      setIsSendingMessage(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <TeacherSidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-4 sm:px-8 lg:px-10 pt-20 lg:pt-8 pb-16 flex flex-col">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#ffa11f] bg-[#ffa11f]/15 px-2.5 py-1 rounded-full">
                Classroom Management
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#10292e] tracking-tight mt-1">
              Student Groups & Classes
            </h1>
            <p className="text-sm font-medium text-[#607274] mt-1">
              Create student cohorts, export Class Codes, assign generated lessons, and chat with your students.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center gap-2 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-sm px-5 py-3 rounded-2xl transition-all shadow-xs cursor-pointer shrink-0"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Create New Class Group</span>
          </button>
        </div>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center py-20 text-[#607274]">
            <Loader2 className="animate-spin text-[#ffa11f] mb-3" size={32} />
            <p className="text-sm font-semibold">Loading your class groups...</p>
          </div>
        ) : groups.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-3xl border border-[#e8eeea] p-12 text-center max-w-xl mx-auto my-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#ffa11f]/15 text-[#ffa11f] flex items-center justify-center mx-auto mb-4">
              <Users size={32} />
            </div>
            <h2 className="text-xl font-bold text-[#10292e] mb-2">No Class Groups Yet</h2>
            <p className="text-sm text-[#607274] mb-6">
              Create your first student class group! You&apos;ll receive a unique class code that your students can enter to join your class, view your generated lessons, and collaborate.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-sm px-6 py-3 rounded-2xl transition-all shadow-xs cursor-pointer"
            >
              <Plus size={18} />
              <span>Create Your First Class</span>
            </button>
          </div>
        ) : (
          /* Layout with Class Selector + Workspace */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Groups List */}
            <div className="lg:col-span-4 flex flex-col gap-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold text-[#607274] uppercase tracking-wider">
                  Your Classes ({groups.length})
                </span>
                <span className="text-xs font-semibold text-[#ffa11f]">
                  {groups.reduce((acc, g) => acc + (g.students?.length || 0), 0)} Enrolled Students
                </span>
              </div>

              {groups.map((group) => {
                const isSelected = group._id === selectedGroupId;
                return (
                  <div
                    key={group._id}
                    onClick={() => setSelectedGroupId(group._id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative ${
                      isSelected
                        ? "bg-white border-[#ffa11f] shadow-md ring-2 ring-[#ffa11f]/20"
                        : "bg-white/80 hover:bg-white border-[#e8eeea] hover:border-[#ccd7d3]"
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
                      </div>
                    </div>

                    {/* Class Code Chip */}
                    <div className="mt-3 bg-[#fff8ec] border border-[#f3e5cb] rounded-xl px-3 py-2 flex items-center justify-between">
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-[#607274]">
                          Class Code
                        </div>
                        <div className="font-mono text-base font-extrabold text-[#10292e] tracking-wider">
                          {group.class_code}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCopyCode(group.class_code);
                        }}
                        title="Copy code to share with students"
                        className="p-2 rounded-lg bg-white hover:bg-[#ffa11f] hover:text-[#10292e] border border-[#e8eeea] text-[#607274] transition-all cursor-pointer shadow-xs flex items-center gap-1 text-xs font-bold"
                      >
                        {copiedCode === group.class_code ? (
                          <>
                            <Check size={14} className="text-emerald-600" />
                            <span className="text-[11px] text-emerald-700">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy size={14} />
                            <span className="text-[11px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Quick Metrics */}
                    <div className="mt-3 pt-3 border-t border-[#f0f4f2] grid grid-cols-3 gap-2 text-center text-xs">
                      <div>
                        <span className="block font-black text-[#10292e]">
                          {group.students?.length || 0}
                        </span>
                        <span className="text-[10px] font-semibold text-[#607274]">Students</span>
                      </div>
                      <div>
                        <span className="block font-black text-[#10292e]">
                          {group.lessons?.length || 0}
                        </span>
                        <span className="text-[10px] font-semibold text-[#607274]">Lessons</span>
                      </div>
                      <div>
                        <span className="block font-black text-[#10292e]">
                          {group.tasks?.length || 0}
                        </span>
                        <span className="text-[10px] font-semibold text-[#607274]">Tasks</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Right Column: Selected Class Workspace */}
            <div className="lg:col-span-8 flex flex-col gap-4">
              {activeGroup ? (
                <div className="bg-white rounded-3xl border border-[#e8eeea] shadow-xs overflow-hidden flex flex-col">
                  {/* Class Header Banner */}
                  <div className="p-6 bg-gradient-to-r from-[#10292e] to-[#1c3e44] text-white">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-bold bg-[#ffa11f] text-[#10292e] px-2.5 py-0.5 rounded-full">
                            {activeGroup.grade_level}
                          </span>
                          <span className="text-xs text-emerald-300 font-semibold">
                            {activeGroup.subject}
                          </span>
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                          {activeGroup.name}
                        </h2>
                        {activeGroup.description && (
                          <p className="text-xs text-white/80 mt-1 max-w-xl">
                            {activeGroup.description}
                          </p>
                        )}
                      </div>

                      {/* Prominent Code Export Box */}
                      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-3 sm:text-right shrink-0">
                        <div className="text-[10px] uppercase font-bold text-white/70">
                          Class Code for Students
                        </div>
                        <div className="flex items-center gap-2 mt-0.5 justify-start sm:justify-end">
                          <span className="font-mono text-xl font-black tracking-widest text-[#ffa11f]">
                            {activeGroup.class_code}
                          </span>
                          <button
                            onClick={() => handleCopyCode(activeGroup.class_code)}
                            className="p-1.5 rounded-lg bg-white/20 hover:bg-[#ffa11f] hover:text-[#10292e] text-white transition-all cursor-pointer"
                            title="Copy code"
                          >
                            {copiedCode === activeGroup.class_code ? (
                              <Check size={16} />
                            ) : (
                              <Copy size={16} />
                            )}
                          </button>
                        </div>
                        <div className="text-[10px] text-white/60 mt-0.5">
                          Students enter this to join
                        </div>
                      </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex items-center gap-2 mt-6 pt-4 border-t border-white/10 overflow-x-auto">
                      <button
                        onClick={() => setActiveTab("roster")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                          activeTab === "roster"
                            ? "bg-[#ffa11f] text-[#10292e] shadow-sm"
                            : "text-white/80 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <Users size={15} />
                        <span>Student Roster ({activeGroup.students?.length || 0})</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("lessons")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                          activeTab === "lessons"
                            ? "bg-[#ffa11f] text-[#10292e] shadow-sm"
                            : "text-white/80 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <BookOpen size={15} />
                        <span>Class Lessons ({activeGroup.lessons?.length || 0})</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("tasks")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                          activeTab === "tasks"
                            ? "bg-[#ffa11f] text-[#10292e] shadow-sm"
                            : "text-white/80 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <CheckSquare size={15} />
                        <span>Tasks & Work ({activeGroup.tasks?.length || 0})</span>
                      </button>

                      <button
                        onClick={() => setActiveTab("chat")}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer whitespace-nowrap ${
                          activeTab === "chat"
                            ? "bg-[#ffa11f] text-[#10292e] shadow-sm"
                            : "text-white/80 hover:text-white hover:bg-white/10"
                        }`}
                      >
                        <MessageSquare size={15} />
                        <span>Class Chat ({activeGroup.messages?.length || 0})</span>
                      </button>
                    </div>
                  </div>

                  {/* Tab Body */}
                  <div className="p-6">
                    {/* TAB 1: ROSTER & PROGRESS */}
                    {activeTab === "roster" && (
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <h3 className="text-base font-black text-[#10292e]">
                              Enrolled Students
                            </h3>
                            <p className="text-xs text-[#607274]">
                              Students who joined via code {activeGroup.class_code} or added directly.
                            </p>
                          </div>
                          <button
                            onClick={() => setShowAddStudentModal(true)}
                            className="inline-flex items-center gap-1.5 bg-[#10292e] hover:bg-[#1b434b] text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs self-start sm:self-auto"
                          >
                            <UserPlus size={15} />
                            <span>Add Student Direct</span>
                          </button>
                        </div>

                        {(!activeGroup.students || activeGroup.students.length === 0) ? (
                          <div className="p-8 text-center bg-[#fafaf8] rounded-2xl border border-dashed border-[#ccd7d3]">
                            <GraduationCap className="mx-auto text-[#607274] mb-2" size={32} />
                            <p className="text-sm font-bold text-[#10292e]">No students enrolled yet</p>
                            <p className="text-xs text-[#607274] mt-1 max-w-sm mx-auto">
                              Give students your Class Code <span className="font-mono font-bold text-[#10292e] bg-[#ffa11f]/20 px-1 rounded">{activeGroup.class_code}</span>. When they enter it in their dashboard, they will appear here automatically!
                            </p>
                          </div>
                        ) : (
                          <div className="overflow-x-auto rounded-2xl border border-[#e8eeea]">
                            <table className="w-full text-left text-xs">
                              <thead className="bg-[#fafaf8] text-[#607274] uppercase text-[10px] font-extrabold border-b border-[#e8eeea]">
                                <tr>
                                  <th className="px-4 py-3">Student</th>
                                  <th className="px-4 py-3">Code / ID</th>
                                  <th className="px-4 py-3">Grade</th>
                                  <th className="px-4 py-3">Status</th>
                                  <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-[#e8eeea]">
                                {activeGroup.students.map((student) => (
                                  <tr key={student._id} className="hover:bg-[#fafaf8] transition-colors">
                                    <td className="px-4 py-3">
                                      <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full bg-[#10292e]/10 text-[#10292e] font-black text-xs flex items-center justify-center shrink-0">
                                          {student.first_name?.[0] || "S"}
                                        </div>
                                        <div>
                                          <div className="font-bold text-[#10292e]">
                                            {student.first_name} {student.last_name || ""}
                                          </div>
                                          <div className="text-[11px] text-[#607274]">
                                            {student.email || "student@alma.school"}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-4 py-3 font-mono font-bold text-[#10292e]">
                                      {student.student_code || "STU-001"}
                                    </td>
                                    <td className="px-4 py-3 text-[#607274] font-medium">
                                      {student.grade_level || activeGroup.grade_level}
                                    </td>
                                    <td className="px-4 py-3">
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        Active
                                      </span>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                      <button
                                        onClick={() => handleRemoveStudent(student._id, student.first_name)}
                                        className="p-1.5 text-[#607274] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                        title="Remove student"
                                      >
                                        <Trash2 size={15} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 2: CLASS LESSONS */}
                    {activeTab === "lessons" && (
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <h3 className="text-base font-black text-[#10292e]">
                              Generated & Assigned Lessons
                            </h3>
                            <p className="text-xs text-[#607274]">
                              These lessons are exclusively accessible to students enrolled in this group.
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setShowAddLessonModal(true)}
                              className="inline-flex items-center gap-1.5 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] text-xs font-extrabold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                            >
                              <Plus size={15} />
                              <span>Assign New Lesson</span>
                            </button>
                          </div>
                        </div>

                        {(!activeGroup.lessons || activeGroup.lessons.length === 0) ? (
                          <div className="p-8 text-center bg-[#fafaf8] rounded-2xl border border-dashed border-[#ccd7d3]">
                            <BookOpen className="mx-auto text-[#607274] mb-2" size={32} />
                            <p className="text-sm font-bold text-[#10292e]">No lessons assigned yet</p>
                            <p className="text-xs text-[#607274] mt-1 max-w-sm mx-auto">
                              Add or generate a lesson for this cohort. Students will immediately see it in their lesson player.
                            </p>
                            <button
                              onClick={() => setShowAddLessonModal(true)}
                              className="mt-4 inline-flex items-center gap-1.5 bg-[#ffa11f] text-[#10292e] font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs"
                            >
                              <Plus size={14} /> Assign Lesson
                            </button>
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                  <h4 className="text-sm font-extrabold text-[#10292e] mt-1">
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
                                  <a
                                    href="/teacher/lessons"
                                    className="inline-flex items-center gap-1 text-xs font-bold text-[#ffa11f] hover:underline"
                                  >
                                    <span>Preview</span>
                                    <ExternalLink size={12} />
                                  </a>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* TAB 3: TASKS */}
                    {activeTab === "tasks" && (
                      <div className="space-y-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <h3 className="text-base font-black text-[#10292e]">
                              Class Tasks & Homework
                            </h3>
                            <p className="text-xs text-[#607274]">
                              Assign coding exercises and projects to this cohort.
                            </p>
                          </div>
                          <button
                            onClick={() => setShowAddTaskModal(true)}
                            className="inline-flex items-center gap-1.5 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] text-xs font-extrabold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                          >
                            <Plus size={15} />
                            <span>Assign Task</span>
                          </button>
                        </div>

                        {(!activeGroup.tasks || activeGroup.tasks.length === 0) ? (
                          <div className="p-8 text-center bg-[#fafaf8] rounded-2xl border border-dashed border-[#ccd7d3]">
                            <CheckSquare className="mx-auto text-[#607274] mb-2" size={32} />
                            <p className="text-sm font-bold text-[#10292e]">No tasks assigned yet</p>
                            <p className="text-xs text-[#607274] mt-1 max-w-sm mx-auto">
                              Create tasks and homework assignments for students to complete and submit.
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
                                  <h4 className="text-sm font-bold text-[#10292e] mt-1">
                                    {task.title}
                                  </h4>
                                  {task.description && (
                                    <p className="text-xs text-[#607274] mt-0.5">
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

                    {/* TAB 4: GROUP CHAT */}
                    {activeTab === "chat" && (
                      <div className="flex flex-col h-[520px] rounded-2xl border border-[#e8eeea] bg-[#fafaf8] overflow-hidden">
                        {/* Chat Header */}
                        <div className="px-4 py-3 bg-white border-b border-[#e8eeea] flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-xs font-bold text-[#10292e]">
                              {activeGroup.name} Class Chat
                            </span>
                          </div>
                          <span className="text-[11px] text-[#607274]">
                            {activeGroup.students?.length || 0} students enrolled
                          </span>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                          {(!activeGroup.messages || activeGroup.messages.length === 0) ? (
                            <div className="text-center py-12 text-[#607274] text-xs">
                              No messages yet. Send a greeting to welcome your students!
                            </div>
                          ) : (
                            activeGroup.messages.map((msg, idx) => {
                              const isTeacher = msg.sender_role === "teacher";
                              return (
                                <div
                                  key={msg._id || idx}
                                  className={`flex flex-col ${
                                    isTeacher ? "items-end" : "items-start"
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
                                      isTeacher
                                        ? "bg-[#10292e] text-white rounded-br-xs"
                                        : "bg-white border border-[#e8eeea] text-[#10292e] rounded-bl-xs shadow-xs"
                                    }`}
                                  >
                                    {msg.message}
                                  </div>
                                </div>
                              );
                            })
                          )}
                          <div ref={chatBottomRef} />
                        </div>

                        {/* Message Composer */}
                        <form
                          onSubmit={handleSendMessage}
                          className="p-3 bg-white border-t border-[#e8eeea] flex items-center gap-2"
                        >
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder={`Message ${activeGroup.name}...`}
                            className="flex-1 bg-[#fafaf8] border border-[#e8eeea] rounded-xl px-3.5 py-2.5 text-xs text-[#10292e] placeholder:text-[#607274] focus:outline-none focus:border-[#ffa11f]"
                          />
                          <button
                            type="submit"
                            disabled={isSendingMessage || !chatInput.trim()}
                            className="bg-[#ffa11f] hover:bg-[#ff9400] disabled:opacity-50 text-[#10292e] font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5 shrink-0"
                          >
                            {isSendingMessage ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Send size={14} />
                            )}
                            <span>Send</span>
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-3xl border border-[#e8eeea] p-12 text-center text-[#607274]">
                  Select a class group from the left to view roster, lessons, tasks, and chat.
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: CREATE NEW GROUP */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e8eeea] max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-[#10292e]">Create New Class Group</h3>
            <p className="text-xs text-[#607274] mt-1">
              A unique Class Code will be automatically generated for your students to join.
            </p>

            <form onSubmit={handleCreateGroup} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  Class / Group Name *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  placeholder="e.g. Python Fundamentals - Grade 8A"
                  className="w-full bg-[#fafaf8] border border-[#e8eeea] rounded-xl px-3.5 py-2.5 text-xs text-[#10292e] focus:outline-none focus:border-[#ffa11f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#10292e] mb-1">
                    Subject Area
                  </label>
                  <input
                    type="text"
                    value={createForm.subject}
                    onChange={(e) => setCreateForm({ ...createForm, subject: e.target.value })}
                    className="w-full bg-[#fafaf8] border border-[#e8eeea] rounded-xl px-3 py-2 text-xs text-[#10292e] focus:outline-none focus:border-[#ffa11f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#10292e] mb-1">
                    Target Grade
                  </label>
                  <select
                    value={createForm.grade_level}
                    onChange={(e) => setCreateForm({ ...createForm, grade_level: e.target.value })}
                    className="w-full bg-[#fafaf8] border border-[#e8eeea] rounded-xl px-3 py-2 text-xs text-[#10292e] focus:outline-none focus:border-[#ffa11f]"
                  >
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                    <option value="Grade 12">Grade 12</option>
                    <option value="All Grades">All Grades</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  Description (optional)
                </label>
                <textarea
                  rows={2}
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Goals and syllabus notes for this class cohort..."
                  className="w-full bg-[#fafaf8] border border-[#e8eeea] rounded-xl px-3.5 py-2 text-xs text-[#10292e] focus:outline-none focus:border-[#ffa11f]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8eeea]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#607274] hover:bg-[#fafaf8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingGroup}
                  className="bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {isSubmittingGroup ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>Create Class</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN LESSON */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e8eeea] max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-[#10292e]">Assign Lesson to {activeGroup?.name}</h3>
            <p className="text-xs text-[#607274] mt-1">
              Add a generated lesson to this class. Students will see it in their lesson dashboard.
            </p>

            <form onSubmit={handleAddLesson} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  Lesson Title *
                </label>
                <input
                  type="text"
                  required
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                  placeholder="e.g. For Loops & Sequence Iteration"
                  className="w-full bg-[#fafaf8] border border-[#e8eeea] rounded-xl px-3.5 py-2.5 text-xs text-[#10292e] focus:outline-none focus:border-[#ffa11f]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  Topic Keyword *
                </label>
                <input
                  type="text"
                  required
                  value={lessonForm.topic}
                  onChange={(e) => setLessonForm({ ...lessonForm, topic: e.target.value })}
                  placeholder="e.g. Iteration and range() in Python"
                  className="w-full bg-[#fafaf8] border border-[#e8eeea] rounded-xl px-3.5 py-2.5 text-xs text-[#10292e] focus:outline-none focus:border-[#ffa11f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#10292e] mb-1">
                    Duration (mins)
                  </label>
                  <input
                    type="number"
                    value={lessonForm.duration_minutes}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, duration_minutes: Number(e.target.value) })
                    }
                    className="w-full bg-[#fafaf8] border border-[#e8eeea] rounded-xl px-3 py-2 text-xs text-[#10292e] focus:outline-none focus:border-[#ffa11f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#10292e] mb-1">
                    Language
                  </label>
                  <input
                    type="text"
                    value={lessonForm.programming_language}
                    onChange={(e) =>
                      setLessonForm({ ...lessonForm, programming_language: e.target.value })
                    }
                    className="w-full bg-[#fafaf8] border border-[#e8eeea] rounded-xl px-3 py-2 text-xs text-[#10292e] focus:outline-none focus:border-[#ffa11f]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8eeea]">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#607274] hover:bg-[#fafaf8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingLesson}
                  className="bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {isSubmittingLesson ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>Assign Lesson</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: ASSIGN TASK */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e8eeea] max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-[#10292e]">Assign Task / Homework</h3>

            <form onSubmit={handleAddTask} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  required
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="e.g. Write a loop counting multiples of 3"
                  className="w-full bg-[#fafaf8] border border-[#e8eeea] rounded-xl px-3.5 py-2.5 text-xs text-[#10292e] focus:outline-none focus:border-[#ffa11f]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  Instructions / Description
                </label>
                <textarea
                  rows={3}
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Explain requirements, expected test output, or hints..."
                  className="w-full bg-[#fafaf8] border border-[#e8eeea] rounded-xl px-3.5 py-2 text-xs text-[#10292e] focus:outline-none focus:border-[#ffa11f]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  Due Date (optional)
                </label>
                <input
                  type="date"
                  value={taskForm.due_date}
                  onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                  className="w-full bg-[#fafaf8] border border-[#e8eeea] rounded-xl px-3 py-2 text-xs text-[#10292e] focus:outline-none focus:border-[#ffa11f]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8eeea]">
                <button
                  type="button"
                  onClick={() => setShowAddTaskModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#607274] hover:bg-[#fafaf8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTask}
                  className="bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {isSubmittingTask ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>Assign Task</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD STUDENT DIRECT */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-[#e8eeea] max-w-md w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-lg font-black text-[#10292e]">Add Student Directly</h3>
            <p className="text-xs text-[#607274] mt-1">
              Enter the student&apos;s email or student code to enroll them.
            </p>

            <form onSubmit={handleAddStudent} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  Student Code or Email *
                </label>
                <input
                  type="text"
                  required
                  value={studentIdentifier}
                  onChange={(e) => setStudentIdentifier(e.target.value)}
                  placeholder="e.g. STU-4650 or layla@alma.school"
                  className="w-full bg-[#fafaf8] border border-[#e8eeea] rounded-xl px-3.5 py-2.5 text-xs text-[#10292e] focus:outline-none focus:border-[#ffa11f]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8eeea]">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#607274] hover:bg-[#fafaf8] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingStudent}
                  className="bg-[#10292e] hover:bg-[#1b434b] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center gap-1.5"
                >
                  {isSubmittingStudent ? <Loader2 size={14} className="animate-spin" /> : null}
                  <span>Enroll Student</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
