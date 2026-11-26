"use client";

import { deferRequest } from "@/lib/defer-request";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import api from "@/services/api";
import { BookOpen, CheckCircle2, Clock, Loader2, AlertCircle } from "lucide-react";

interface AssessmentQuestion {
  _id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  points: number;
  explanation?: string;
}

interface AssessmentItem {
  _id: string;
  title: string;
  description?: string;
  course_id?: string;
  course_title?: string;
  module_id?: string;
  module_title?: string;
  questions?: AssessmentQuestion[];
  total_points: number;
  passing_score: number;
  status: "published" | "draft" | "archived" | "completed" | "available";
  user_score?: number | null;
  passed?: boolean | null;
}

export default function AssessmentsCatalogPage() {
  const [assessments, setAssessments] = useState<AssessmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"All" | "Available" | "Completed">("All");

  const fetchAssessments = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/assessments");
      const list: AssessmentItem[] = res.data?.data || [];
      setAssessments(list);
    } catch (err: unknown) {
      console.error("Failed to load assessments:", err);
      setError("Could not load assessments from database. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return deferRequest(() => {
      fetchAssessments();
    });
  }, []);

  const totalCompleted = assessments.filter((a) => a.status === "completed").length;
  const totalAvailable = assessments.filter((a) => a.status !== "completed").length;

  const filtered = assessments.filter((a) => {
    if (filter === "Available") return a.status !== "completed";
    if (filter === "Completed") return a.status === "completed";
    return true;
  });

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
            Assessments
          </h1>
          <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
            Course checkpoints, module tests, and exams connected to your learning paths.
          </p>
        </div>

        {/* Loading Spinner */}
        {loading && (
          <div className="py-20 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 text-[#118a80] animate-spin mb-3" />
            <p className="text-sm font-bold text-[#10292e]">Loading assessments from database...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="p-8 bg-white rounded-3xl border border-red-200 text-center max-w-md mx-auto my-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchAssessments}
              className="px-5 py-2.5 bg-[#ffa11f] text-[#10292e] rounded-full text-xs font-bold hover:brightness-95 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && (
          <>
            {/* 3 Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
                <div className="text-3xl sm:text-4xl font-black text-[#10292e] mb-1">
                  {totalAvailable}
                </div>
                <div className="font-bold text-sm text-[#10292e]">Available Assessments</div>
                <div className="text-xs text-[#8a999b] mt-0.5">published in database</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
                <div className="text-3xl sm:text-4xl font-black text-[#ffa11f] mb-1">
                  100%
                </div>
                <div className="font-bold text-sm text-[#10292e]">Coverage</div>
                <div className="text-xs text-[#8a999b] mt-0.5">mapped to course curriculum</div>
              </div>

              <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
                <div className="text-3xl sm:text-4xl font-black text-[#118a80] mb-1">
                  {assessments.reduce((sum, a) => sum + (a.questions?.length || 0), 0)}
                </div>
                <div className="font-bold text-sm text-[#10292e]">Total Questions</div>
                <div className="text-xs text-[#8a999b] mt-0.5">MCQ, coding &amp; analytical</div>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 mb-6">
              <button
                onClick={() => setFilter("All")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filter === "All"
                    ? "bg-[#10292e] text-white"
                    : "bg-white text-[#607274] border border-[#e8eeea] hover:bg-[#fafaf8]"
                }`}
              >
                All ({assessments.length})
              </button>
              <button
                onClick={() => setFilter("Available")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filter === "Available"
                    ? "bg-[#ffa11f] text-[#10292e]"
                    : "bg-white text-[#607274] border border-[#e8eeea] hover:bg-[#fafaf8]"
                }`}
              >
                Available ({totalAvailable})
              </button>
              <button
                onClick={() => setFilter("Completed")}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  filter === "Completed"
                    ? "bg-[#118a80] text-white"
                    : "bg-white text-[#607274] border border-[#e8eeea] hover:bg-[#fafaf8]"
                }`}
              >
                Completed ({totalCompleted})
              </button>
            </div>

            {/* Assessment Cards List */}
            {filtered.length === 0 ? (
              <div className="p-12 bg-white rounded-3xl border border-[#e8eeea] text-center max-w-md mx-auto">
                <BookOpen className="w-12 h-12 text-[#8a999b] mx-auto mb-3 opacity-60" />
                <h3 className="font-extrabold text-base text-[#10292e]">No assessments available</h3>
                <p className="text-xs text-[#607274] mt-1 mb-4">
                  Enroll in a course from our catalog to unlock its module checkpoints and exams.
                </p>
                <Link
                  href="/courses"
                  className="inline-block px-5 py-2 bg-[#ffa11f] text-[#10292e] font-extrabold text-xs rounded-full shadow-xs"
                >
                  Explore Courses &rarr;
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {filtered.map((item) => (
                  <div
                    key={item._id}
                    className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e8eeea] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center font-black text-lg shrink-0 shadow-2xs ${
                        item.status === "completed" ? "bg-[#118a80] text-white" : "bg-[#ffa11f] text-[#10292e]"
                      }`}>
                        A
                      </div>

                      <div>
                        <h3 className="font-extrabold text-base text-[#10292e]">
                          {item.title}
                        </h3>
                        <div className="text-xs text-[#118a80] font-semibold mt-0.5">
                          {item.course_title || "Course"} {item.module_title ? `· ${item.module_title}` : ""}
                        </div>
                        <div className="text-xs text-[#8a999b] mt-0.5 flex items-center gap-2">
                          <span>{item.questions?.length || 0} questions</span>
                          <span>·</span>
                          <span>{item.total_points || 100} pts</span>
                          <span>·</span>
                          <span>pass score {item.passing_score || 60}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center">
                      {item.status === "completed" ? (
                        <>
                          <span className="bg-[#e6f5f2] text-[#118a80] text-xs font-semibold px-3 py-1 rounded-full">
                            {item.passed ? "Passed" : "Completed"} · {item.user_score ?? 100}%
                          </span>
                          <Link
                            href={`/assessments/${item._id}/result`}
                            className="px-5 py-2 rounded-full border border-[#10292e] text-[#10292e] hover:bg-[#10292e] hover:text-white text-xs font-bold transition-colors shadow-2xs"
                          >
                            View Result
                          </Link>
                        </>
                      ) : (
                        <Link
                          href={`/assessments/${item._id}/instructions`}
                          className="px-6 py-2.5 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] text-xs font-extrabold shadow-xs transition-colors"
                        >
                          Start Assessment &rarr;
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
