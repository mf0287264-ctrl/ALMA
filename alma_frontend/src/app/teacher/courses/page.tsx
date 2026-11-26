"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import TeacherSidebar from "@/components/TeacherSidebar";
import MangoIcon from "@/components/MangoIcon";
import { useAuth } from "@/app/_Context/AuthContext";
import api from "@/services/api";

interface CourseItem {
  _id?: string;
  id?: string;
  title: string;
  subject: string;
  grade_level: string;
  curriculum: string;
  language: string;
  status: "published" | "draft" | "archived";
  modules_count?: number;
  bannerColor?: string;
  teacher_name?: string;
}

const DEFAULT_COURSES: CourseItem[] = [
  {
    id: "c-1",
    title: "Intro to Python",
    subject: "Computer Science",
    grade_level: "Grade 8",
    curriculum: "General",
    language: "en",
    status: "published",
    modules_count: 6,
    bannerColor: "#ffe8cc", // pastel peach
    teacher_name: "Dr. Sara Hassan",
  },
  {
    id: "c-2",
    title: "Data Basics",
    subject: "Computer Science",
    grade_level: "Grade 9",
    curriculum: "Cambridge",
    language: "en",
    status: "published",
    modules_count: 4,
    bannerColor: "#d9f2e4", // pastel mint green
    teacher_name: "Dr. Sara Hassan",
  },
  {
    id: "c-3",
    title: "Web Foundations",
    subject: "Computer Science",
    grade_level: "Grade 10",
    curriculum: "General",
    language: "en",
    status: "draft",
    modules_count: 3,
    bannerColor: "#dceefc", // pastel sky blue
    teacher_name: "Dr. Sara Hassan",
  },
  {
    id: "c-4",
    title: "Algorithms Lab",
    subject: "Computer Science",
    grade_level: "Grade 11",
    curriculum: "IB",
    language: "en",
    status: "draft",
    modules_count: 5,
    bannerColor: "#fce4ec", // pastel rose
    teacher_name: "Dr. Sara Hassan",
  },
  {
    id: "c-5",
    title: "Scratch Starters",
    subject: "Computer Science",
    grade_level: "Grade 6",
    curriculum: "General",
    language: "en",
    status: "archived",
    modules_count: 2,
    bannerColor: "#e0f2f1", // pastel teal
    teacher_name: "Dr. Sara Hassan",
  },
];

function CoursesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const [courses, setCourses] = useState<CourseItem[]>(DEFAULT_COURSES);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [gradeFilter, setGradeFilter] = useState("all");
  const [langFilter, setLangFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // New Course Modal
  const [modalOpen, setModalOpen] = useState(false);
  const showModal = modalOpen || searchParams.get("action") === "new";
  const setShowModal = (open: boolean) => {
    setModalOpen(open);
    if (!open && searchParams.get("action") === "new") {
      const query = new URLSearchParams(searchParams.toString());
      query.delete("action");
      router.replace(`/teacher/courses${query.size ? `?${query}` : ""}`, { scroll: false });
    }
  };
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("Computer Science");
  const [newGrade, setNewGrade] = useState("Grade 8");
  const [newCurriculum, setNewCurriculum] = useState("General");
  const [newLang, setNewLang] = useState("en");
  const [newStatus, setNewStatus] = useState<"draft" | "published">("published");
  const [creating, setCreating] = useState(false);

  // Fetch real courses from backend if available
  useEffect(() => {
    async function fetchCourses() {
      try {
        const res = await api.get("/courses");
        if (res.data?.data && Array.isArray(res.data.data) && res.data.data.length > 0) {
          const apiCourses: CourseItem[] = res.data.data.map((c: CourseItem, index: number) => ({
            id: c._id || `c-${index}`,
            title: c.title,
            subject: c.subject || "Computer Science",
            grade_level: c.grade_level || "Grade 8",
            curriculum: c.curriculum || "General",
            language: c.language || "en",
            status: c.status || "published",
            modules_count: c.modules_count || 4,
            bannerColor: DEFAULT_COURSES[index % DEFAULT_COURSES.length].bannerColor,
            teacher_name: user?.name || "Dr. Sara Hassan",
          }));
          setCourses(apiCourses);
        }
      } catch (err) {
        console.warn("Using sample courses data", err);
      }
    }

    fetchCourses();
  }, [user]);

  // Filtering
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchSearch =
        c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchGrade = gradeFilter === "all" || c.grade_level === gradeFilter;
      const matchLang = langFilter === "all" || c.language === langFilter;

      return matchSearch && matchStatus && matchGrade && matchLang;
    });
  }, [courses, searchQuery, statusFilter, gradeFilter, langFilter]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error("Please enter a course title");
      return;
    }

    setCreating(true);
    try {
      await api.post("/courses", {
        title: newTitle.trim(),
        subject: newSubject,
        grade_level: newGrade,
        curriculum: newCurriculum,
        language: newLang,
        status: newStatus,
        created_by: user?.id || user?._id || "64fa00000000000000000001",
      }).catch((err) => {
        console.warn("API course creation falling back to client state", err);
      });

      const colors = ["#ffe8cc", "#d9f2e4", "#dceefc", "#fce4ec", "#e0f2f1"];
      const newCourse: CourseItem = {
        id: `c-${Date.now()}`,
        title: newTitle.trim(),
        subject: newSubject,
        grade_level: newGrade,
        curriculum: newCurriculum,
        language: newLang,
        status: newStatus,
        modules_count: 1,
        bannerColor: colors[courses.length % colors.length],
        teacher_name: user?.name || "Dr. Sara Hassan",
      };

      setCourses((prev) => [newCourse, ...prev]);
      toast.success(`Course "${newTitle.trim()}" created successfully!`);
      setShowModal(false);
      setNewTitle("");
    } catch {
      toast.error("Failed to create course. Try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fff8ec] flex">
      {/* Fixed Sidebar */}
      <TeacherSidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-6 sm:p-10 lg:p-12 pt-20 lg:pt-10 overflow-y-auto">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#10292e] tracking-tight">
              Courses
            </h1>
            <p className="text-sm text-[#5a6e70] font-medium mt-1">
              Filters map to subject, grade_level, status, language
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="self-start sm:self-auto bg-[#ffa11f] hover:brightness-95 active:scale-[0.98] text-[#10292e] font-extrabold text-sm px-6 py-3 rounded-full transition-all shadow-xs cursor-pointer"
          >
            New course
          </button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            {/* Search Input */}
            <div className="w-full sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-4 py-2.5 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#ffa11f] shadow-xs"
              />
            </div>

            {/* Status Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-[#d2dcd7] bg-white px-3.5 py-2.5 text-xs font-bold text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f] shadow-xs cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="published">Status: Published</option>
              <option value="draft">Status: Draft</option>
              <option value="archived">Status: Archived</option>
            </select>

            {/* Grade Dropdown */}
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="rounded-2xl border border-[#d2dcd7] bg-white px-3.5 py-2.5 text-xs font-bold text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f] shadow-xs cursor-pointer"
            >
              <option value="all">Grade: All</option>
              <option value="Grade 6">Grade 6</option>
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
            </select>

            {/* Language Dropdown */}
            <select
              value={langFilter}
              onChange={(e) => setLangFilter(e.target.value)}
              className="rounded-2xl border border-[#d2dcd7] bg-white px-3.5 py-2.5 text-xs font-bold text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f] shadow-xs cursor-pointer"
            >
              <option value="all">Language: All</option>
              <option value="en">Language: English (en)</option>
              <option value="ar">Language: Arabic (ar)</option>
            </select>
          </div>

          {/* Cards / Table Switcher */}
          <div className="flex items-center gap-1 bg-[#ede8dc] p-1 rounded-2xl self-start lg:self-auto">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-4 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                viewMode === "cards"
                  ? "bg-[#10292e] text-white shadow-xs"
                  : "text-[#5a6e70] hover:text-[#10292e]"
              }`}
            >
              Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-4 py-1.5 text-xs font-black rounded-xl transition-all cursor-pointer ${
                viewMode === "table"
                  ? "bg-[#10292e] text-white shadow-xs"
                  : "text-[#5a6e70] hover:text-[#10292e]"
              }`}
            >
              Table
            </button>
          </div>
        </div>

        {/* View Mode: Cards Grid */}
        {viewMode === "cards" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <div
                key={course.id}
                className="bg-white rounded-3xl border border-[#e8eeea] shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group"
              >
                <div>
                  {/* Card Banner with Mascot Arch */}
                  <div
                    style={{ backgroundColor: course.bannerColor }}
                    className="h-28 w-full p-5 flex items-end relative overflow-hidden"
                  >
                    {/* Mini Mascot Arch */}
                    <div className="w-12 h-14 bg-[#ffa11f] rounded-t-full flex items-center justify-center shadow-xs">
                      <div className="flex gap-1.5 mb-2">
                        <span className="w-1.5 h-1.5 bg-[#10292e] rounded-full" />
                        <span className="w-1.5 h-1.5 bg-[#10292e] rounded-full" />
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-xl font-black text-[#10292e] group-hover:text-[#118a80] transition-colors">
                        {course.title}
                      </h3>
                      <span
                        className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shrink-0 ${
                          course.status === "published"
                            ? "bg-[#e6f7ec] text-[#1e7e34]"
                            : course.status === "draft"
                            ? "bg-[#f0f4f2] text-[#5a6e70]"
                            : "bg-[#f5f5f5] text-[#888]"
                        }`}
                      >
                        {course.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#5a6e70] font-semibold mb-4">
                      {course.subject} · {course.grade_level} · {course.curriculum}
                    </p>

                    {/* Metadata Pills */}
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <span className="bg-[#f0f4f2] text-[#10292e] text-[11px] font-bold px-3 py-1 rounded-full">
                        {course.modules_count || 4} modules
                      </span>
                      <span className="bg-[#f0f4f2] text-[#10292e] text-[11px] font-bold px-3 py-1 rounded-full">
                        language: {course.language}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-3.5 border-t border-[#f0f4f2] text-xs text-[#5a6e70] font-medium">
                  Teacher: {course.teacher_name || "Dr. Sara Hassan"}
                </div>
              </div>
            ))}

            {/* Card 6: + New Course Card matching design */}
            <div
              onClick={() => setShowModal(true)}
              className="rounded-3xl border-2 border-[#ffa11f] bg-[#fffaf0] p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#fff6e6] transition-all min-h-[320px] shadow-xs"
            >
              <button
                type="button"
                className="bg-[#ffa11f] hover:brightness-95 active:scale-95 text-[#10292e] font-extrabold text-sm py-3 px-6 rounded-full mb-4 shadow-xs transition-all"
              >
                + New course
              </button>
              <p className="text-xs text-[#5a6e70] font-medium max-w-[220px] mb-3">
                Enrolled students and progress appear here once Enrollment is added
              </p>
              <span className="bg-[#fff1d6] text-[#b87e00] text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full">
                PROPOSED
              </span>
            </div>
          </div>
        ) : (
          /* View Mode: Table */
          <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#f0f4f2] text-[11px] font-extrabold uppercase tracking-wider text-[#5a6e70]">
                  <th className="pb-3 pr-4">COURSE TITLE</th>
                  <th className="pb-3 px-4">SUBJECT & GRADE</th>
                  <th className="pb-3 px-4">CURRICULUM</th>
                  <th className="pb-3 px-4">MODULES</th>
                  <th className="pb-3 px-4">STATUS</th>
                  <th className="pb-3 pl-4 text-right">TEACHER</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f7faf8] text-sm">
                {filteredCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-[#fafaf8] transition-colors">
                    <td className="py-4 pr-4 font-black text-[#10292e]">
                      {c.title}
                    </td>
                    <td className="py-4 px-4 text-xs text-[#5a6e70] font-medium">
                      {c.subject} · {c.grade_level}
                    </td>
                    <td className="py-4 px-4 text-xs font-semibold text-[#10292e]">
                      {c.curriculum}
                    </td>
                    <td className="py-4 px-4 text-xs font-bold text-[#118a80]">
                      {c.modules_count || 4} modules
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          c.status === "published"
                            ? "bg-[#e6f7ec] text-[#1e7e34]"
                            : c.status === "draft"
                            ? "bg-[#f0f4f2] text-[#5a6e70]"
                            : "bg-[#f5f5f5] text-[#888]"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right text-xs text-[#5a6e70]">
                      {c.teacher_name}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      {/* New Course Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl border border-[#e8eeea]">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-2xl font-black text-[#10292e]">Create New Course</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-[#5a6e70] hover:text-[#10292e] font-bold text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  Course Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Advanced Python & Algorithms"
                  required
                  className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#10292e] mb-1">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    className="w-full rounded-2xl border border-[#d2dcd7] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#10292e] mb-1">
                    Grade Level
                  </label>
                  <select
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full rounded-2xl border border-[#d2dcd7] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                  >
                    <option value="Grade 6">Grade 6</option>
                    <option value="Grade 7">Grade 7</option>
                    <option value="Grade 8">Grade 8</option>
                    <option value="Grade 9">Grade 9</option>
                    <option value="Grade 10">Grade 10</option>
                    <option value="Grade 11">Grade 11</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#10292e] mb-1">
                    Curriculum
                  </label>
                  <input
                    type="text"
                    value={newCurriculum}
                    onChange={(e) => setNewCurriculum(e.target.value)}
                    placeholder="General / IB / Cambridge"
                    className="w-full rounded-2xl border border-[#d2dcd7] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#10292e] mb-1">
                    Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as typeof newStatus)}
                    className="w-full rounded-2xl border border-[#d2dcd7] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 rounded-full border border-[#d2dcd7] text-xs font-bold text-[#5a6e70] hover:bg-[#fafaf8]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 py-3 rounded-full bg-[#ffa11f] hover:brightness-95 text-[#10292e] text-xs font-black shadow-xs disabled:opacity-60"
                >
                  {creating ? "Creating..." : "Save Course"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#fff8ec] flex items-center justify-center">
          <MangoIcon size={64} animated />
        </div>
      }
    >
      <CoursesContent />
    </Suspense>
  );
}
