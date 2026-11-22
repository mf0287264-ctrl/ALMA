"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import api from "@/services/api";
import { CheckCircle2, ArrowRight, Loader2, AlertCircle } from "lucide-react";

interface AssessmentDetail {
  _id: string;
  title: string;
  description?: string;
  course_title?: string;
  module_title?: string;
  total_points: number;
  passing_score: number;
  questions?: any[];
}

export default function AssessmentInstructionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const assessmentId = resolvedParams.id;

  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadAssessment() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/assessments/${assessmentId}`);
        if (res.data?.data) {
          setAssessment(res.data.data);
        } else {
          setError("Assessment not found in database.");
        }
      } catch (err: any) {
        console.error("Failed to load assessment:", err);
        setError("Could not load assessment details from database.");
      } finally {
        setLoading(false);
      }
    }

    if (assessmentId) {
      loadAssessment();
    }
  }, [assessmentId]);

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {loading && (
          <div className="py-24 flex flex-col items-center justify-center text-center">
            <Loader2 className="w-10 h-10 text-[#118a80] animate-spin mb-3" />
            <p className="text-sm font-bold text-[#10292e]">Loading assessment instructions...</p>
          </div>
        )}

        {!loading && error && (
          <div className="p-8 bg-white rounded-3xl border border-red-200 text-center max-w-md mx-auto my-12">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <p className="text-sm font-semibold text-red-600 mb-4">{error}</p>
            <Link
              href="/assessments"
              className="inline-block px-5 py-2.5 bg-[#ffa11f] text-[#10292e] rounded-full text-xs font-bold"
            >
              &larr; Back to Assessments
            </Link>
          </div>
        )}

        {!loading && assessment && (
          <>
            {/* Title & Breadcrumb */}
            <div className="mb-6">
              <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
                {assessment.title}
              </h1>
              <nav className="text-xs text-[#8a999b] mt-1 font-medium">
                <Link href="/assessments" className="hover:underline">
                  Assessments
                </Link>{" "}
                &rsaquo;{" "}
                <span className="text-[#118a80] font-semibold">
                  {assessment.course_title || "Course"}
                </span>{" "}
                &rsaquo; <span className="text-[#10292e]">Instructions</span>
              </nav>
            </div>

            {/* 2 Card Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-5xl">
              {/* Left Card: Before you start (8 cols) */}
              <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#e8eeea] shadow-xs space-y-6">
                <div>
                  <h2 className="text-xl font-extrabold text-[#10292e]">
                    Before you start
                  </h2>
                  <p className="text-xs sm:text-sm text-[#607274] mt-1">
                    {assessment.description ||
                      "Read each question carefully. You can move between questions before submitting your answers."}
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb]">
                    <div className="w-6 h-6 rounded-full bg-[#118a80] text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-[#10292e]">
                        {assessment.questions?.length || 0} questions
                      </div>
                      <div className="text-xs text-[#8a999b]">
                        Multiple choice, coding logic and analytical checks
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb]">
                    <div className="w-6 h-6 rounded-full bg-[#118a80] text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-[#10292e]">
                        {assessment.total_points || 100} points
                      </div>
                      <div className="text-xs text-[#8a999b] font-mono">
                        total_points
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb]">
                    <div className="w-6 h-6 rounded-full bg-[#118a80] text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-[#10292e]">
                        {assessment.passing_score || 60} to pass
                      </div>
                      <div className="text-xs text-[#8a999b] font-mono">
                        passing_score
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb]">
                    <div className="w-6 h-6 rounded-full bg-[#118a80] text-white flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-extrabold text-sm text-[#10292e]">
                        Adaptive Telemetry
                      </div>
                      <div className="text-xs text-[#8a999b]">
                        ALMA analyzes your errors to personalize upcoming review lessons
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <Link
                    href={`/assessments/${assessmentId}/take`}
                    className="inline-flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-sm shadow-xs transition-colors"
                  >
                    <span>I understand, let&apos;s start</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              {/* Right Card: Curriculum context (4 cols) */}
              <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs space-y-4">
                <h3 className="font-extrabold text-base text-[#10292e]">
                  Curriculum Context
                </h3>
                <div className="text-xs text-[#607274] leading-relaxed space-y-2">
                  <p>
                    <strong className="text-[#10292e]">Course:</strong>{" "}
                    {assessment.course_title || "General"}
                  </p>
                  {assessment.module_title && (
                    <p>
                      <strong className="text-[#10292e]">Module:</strong>{" "}
                      {assessment.module_title}
                    </p>
                  )}
                  <p>
                    <strong className="text-[#10292e]">Passing Grade:</strong>{" "}
                    {assessment.passing_score}%
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#fff3db] border border-[#fae2b8] text-xs text-[#10292e]">
                  <span className="font-bold block mb-1">Tip:</span>
                  Take your time on code questions. Syntax matters, and reasoning step by step prevents common logic bugs!
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
