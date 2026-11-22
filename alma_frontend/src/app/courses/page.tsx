"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import api from "@/services/api";
import { Search, BookOpen, BarChart3, FileText, Trophy, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export interface CourseFromDB {
  _id: string;
  id?: string;
  title: string;
  description: string;
  subject: string;
  grade_level: string;
  curriculum?: string;
  language?: string;
  status: "draft" | "published" | "archived";
  created_by?: string | null;
  course_image?: string | null;
  modules_count?: number;
  is_enrolled?: boolean;
}

const COLOR_PALETTE = [
  { bg: "bg-[#ffa11f]", icon: BookOpen },
  { bg: "bg-[#59b8eb]", icon: BarChart3 },
  { bg: "bg-[#ffd84a]", icon: FileText },
  { bg: "bg-[#f25c78]", icon: BarChart3 },
  { bg: "bg-[#118a80]", icon: Trophy },
  { bg: "bg-[#0f5953]", icon: BookOpen },
];

function getCourseCode(title: string): string {
  const words = title.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<CourseFromDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("All");
  const [enrollingId, setEnrollingId] = useState<string | null>(null);

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/courses");
      const list: CourseFromDB[] = res.data?.data || [];
      // Only show published courses for students
      const published = list.filter((c) => c.status === "published");
      setCourses(published);
    } catch (err: any) {
      console.error("Failed to load courses from database:", err);
      setError("Could not load courses from database. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId: string) => {
    try {
      setEnrollingId(courseId);
      await api.post(`/courses/${courseId}/enroll`);
      toast.success("Enrolled in course successfully!");
      setCourses((prev) =>
        prev.map((c) => (c._id === courseId ? { ...c, is_enrolled: true } : c))
      );
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Please log in to enroll in this course.");
        router.push("/login");
      } else {
        toast.error(err.response?.data?.message || "Failed to enroll. Please try again.");
      }
    } finally {
      setEnrollingId(null);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Filter options derived dynamically from data
  const subjects = Array.from(new Set(courses.map((c) => c.subject).filter(Boolean)));
  const filterOptions = ["All", ...subjects];

  const filteredCourses = courses.filter((c) => {
    const query = search.toLowerCase();
    const matchesSearch =
      c.title.toLowerCase().includes(query) ||
      (c.description && c.description.toLowerCase().includes(query)) ||
      (c.grade_level && c.grade_level.toLowerCase().includes(query));

    if (!matchesSearch) return false;
    if (selectedFilter === "All") return true;
    return c.subject === selectedFilter;
  });

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
            Courses
          </h1>
          <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
            Explore platform courses and level up your coding skills.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#8a999b] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white rounded-full border border-[#e8eeea] text-xs sm:text-sm text-[#10292e] placeholder-[#8a999b] focus:outline-hidden focus:border-[#ffa11f]"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs font-semibold">
            {filterOptions.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedFilter(opt)}
                className={`px-3.5 py-1.5 rounded-full transition-all cursor-pointer ${
                  selectedFilter === opt
                    ? "bg-[#10292e] text-white"
                    : "bg-white text-[#607274] border border-[#e8eeea] hover:bg-[#fafaf8]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 text-[#118a80] animate-spin mb-3" />
            <p className="text-sm font-bold text-[#10292e]">Loading courses from database...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-6 bg-white rounded-3xl border border-red-200 text-center max-w-md mx-auto">
            <p className="text-sm font-semibold text-red-600 mb-3">{error}</p>
            <button
              onClick={fetchCourses}
              className="px-5 py-2 bg-[#ffa11f] text-[#10292e] rounded-full text-xs font-bold hover:brightness-95"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredCourses.length === 0 && (
          <div className="py-16 text-center bg-white rounded-3xl border border-[#e8eeea] max-w-md mx-auto p-8">
            <BookOpen className="w-12 h-12 text-[#8a999b] mx-auto mb-3 opacity-60" />
            <h3 className="text-base font-extrabold text-[#10292e]">No courses found</h3>
            <p className="text-xs text-[#607274] mt-1">
              Try adjusting your search query or filter.
            </p>
          </div>
        )}

        {/* Dynamic Courses Grid from DB */}
        {!loading && !error && filteredCourses.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((c, index) => {
              const theme = COLOR_PALETTE[index % COLOR_PALETTE.length];
              const Icon = theme.icon;
              const code = getCourseCode(c.title);
              const totalModules = c.modules_count || 0;

              return (
                <div
                  key={c._id}
                  className="bg-white rounded-3xl border border-[#e8eeea] shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
                >
                  {/* Colored Header Banner with Code & Icon */}
                  <Link
                    href={`/courses/${c._id}`}
                    className={`${theme.bg} h-28 p-5 flex items-center justify-between text-white relative group cursor-pointer`}
                  >
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-3xl font-black tracking-wider text-white/90">
                      {code}
                    </span>
                  </Link>

                  {/* Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <Link href={`/courses/${c._id}`} className="hover:underline">
                        <h3 className="text-lg font-extrabold text-[#10292e]">
                          {c.title}
                        </h3>
                      </Link>
                      <p className="text-xs font-semibold text-[#8a999b] mt-0.5">
                        {c.subject} · {c.grade_level}
                      </p>
                      <p className="text-xs text-[#607274] mt-2 line-clamp-2">
                        {c.description || "Learn core programming concepts with hands-on practice and adaptive guidance."}
                      </p>
                    </div>

                    <div className="mt-6">
                      {/* Module count pill & status */}
                      <div className="mb-4 flex items-center justify-between text-xs">
                        <span className="bg-[#e6f5f2] text-[#118a80] font-semibold px-2.5 py-0.5 rounded-full">
                          {totalModules} {totalModules === 1 ? "module" : "modules"}
                        </span>
                        {c.is_enrolled ? (
                          <span className="text-[#118a80] font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Enrolled
                          </span>
                        ) : (
                          <span className="text-[#8a999b] font-medium">
                            {c.curriculum || "General"}
                          </span>
                        )}
                      </div>

                      {/* Action Button: Enroll in course vs Get Started */}
                      {c.is_enrolled ? (
                        <Link
                          href={`/courses/${c._id}`}
                          className="block text-center w-full py-2.5 rounded-full bg-[#118a80] hover:bg-[#0f7a71] text-white font-extrabold text-sm shadow-xs transition-colors"
                        >
                          Get Started &rarr;
                        </Link>
                      ) : (
                        <button
                          onClick={() => handleEnroll(c._id)}
                          disabled={enrollingId === c._id}
                          className="w-full py-2.5 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-sm shadow-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
                        >
                          {enrollingId === c._id ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Enrolling...</span>
                            </>
                          ) : (
                            "Enroll in course"
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
