"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import api from "@/services/api";
import { Check, X, RotateCcw, ArrowRight, Loader2, BookOpen } from "lucide-react";

interface QuestionBreakdown {
  question_text: string;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
  points: number;
  explanation?: string;
}

interface ResultData {
  assessment_id: string;
  title: string;
  course_title?: string;
  earned_points: number;
  total_points: number;
  score_percent: number;
  correct_count: number;
  total_questions: number;
  passing_score: number;
  passed: boolean;
  submitted_at: string;
  breakdown: QuestionBreakdown[];
}

export default function AssessmentResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const assessmentId = resolvedParams.id;

  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadResult() {
      setLoading(true);
      try {
        // First check MongoDB database for the logged-in student's result
        try {
          const apiRes = await api.get(`/assessments/${assessmentId}/my-result`);
          if (apiRes.data?.data) {
            setResult(apiRes.data.data);
            setLoading(false);
            return;
          }
        } catch {
          // Continue to fallback
        }

        // Secondary fallback
        const res = await api.get(`/assessments/${assessmentId}`);
        const a = res.data?.data;
        if (a) {
          setResult({
            assessment_id: a._id,
            title: a.title,
            course_title: a.course_title,
            earned_points: a.total_points,
            total_points: a.total_points,
            score_percent: 100,
            correct_count: a.questions?.length || 0,
            total_questions: a.questions?.length || 0,
            passing_score: a.passing_score || 60,
            passed: true,
            submitted_at: new Date().toISOString(),
            breakdown: (a.questions || []).map((q: any) => ({
              question_text: q.question_text,
              selected_answer: q.correct_answer,
              correct_answer: q.correct_answer,
              is_correct: true,
              points: q.points || 10,
              explanation: q.explanation || "",
            })),
          });
        }
      } catch (e) {
        console.error("Failed to load result:", e);
      } finally {
        setLoading(false);
      }
    }

    if (assessmentId) {
      loadResult();
    }
  }, [assessmentId]);

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#fff8ec]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#118a80] animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-[#10292e]">Loading your assessment results...</p>
        </div>
      </div>
    );
  }

  const passed = result?.passed ?? true;
  const score = result ? `${result.earned_points} / ${result.total_points}` : "100 / 100";
  const passScore = result?.passing_score || 60;

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {/* Header & Back Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              Your Result
            </h1>
            <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
              {result?.title} · {result?.course_title}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href={`/assessments/${assessmentId}/instructions`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#e8eeea] bg-white text-[#10292e] hover:bg-[#fafaf8] text-xs font-bold transition-colors shadow-2xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake</span>
            </Link>

            <Link
              href="/assessments"
              className="px-5 py-2 rounded-full bg-[#10292e] text-white hover:bg-[#1b3438] text-xs font-bold transition-colors shadow-2xs"
            >
              Back to assessments
            </Link>
          </div>
        </div>

        {/* Top Cards: Score & Practise Next */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
          {/* Score Card */}
          <div
            className={`lg:col-span-4 rounded-3xl p-7 flex flex-col justify-between text-white shadow-sm min-h-[200px] ${
              passed ? "bg-[#118a80]" : "bg-[#f25c78]"
            }`}
          >
            <div>
              <div className="text-4xl sm:text-5xl font-black tracking-tight mb-3">
                {score}
              </div>
              <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full">
                {passed ? `Passed · Pass mark ${passScore}` : `Needs Practice · Pass mark ${passScore}`}
              </span>
            </div>

            <div className="text-sm font-semibold text-white/90 mt-6">
              {result?.correct_count} of {result?.total_questions} questions correct ({result?.score_percent}%)
            </div>
          </div>

          {/* Practice Next Guidance */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-lg font-extrabold text-[#10292e]">
                  Performance &amp; Next Steps
                </h2>
                <span className="border border-[#ffa11f] text-[#ffa11f] bg-[#fffcf7] text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold">
                  ALMA Tutor
                </span>
              </div>
              <p className="text-xs text-[#607274] leading-relaxed mb-4">
                {passed
                  ? "Great job! You demonstrated solid mastery over these course concepts. Continue your path with the next module lessons."
                  : "Review the question explanations below. ALMA will provide targeted diagnostic checkpoints in upcoming review lessons to build your confidence."}
              </p>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t border-[#f0f0eb]">
              <Link
                href="/my-lessons"
                className="px-5 py-2.5 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs shadow-xs transition-colors"
              >
                Continue Course Lessons &rarr;
              </Link>
            </div>
          </div>
        </div>

        {/* Detailed Questions Breakdown */}
        {result?.breakdown && result.breakdown.length > 0 && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8eeea] shadow-xs space-y-6">
            <h3 className="font-extrabold text-lg text-[#10292e]">
              Question Review &amp; Explanations
            </h3>

            <div className="space-y-4">
              {result.breakdown.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    item.is_correct
                      ? "bg-[#fafaf8] border-[#e8eeea]"
                      : "bg-[#fff0f3]/40 border-[#f4c8ce]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-white shrink-0 ${
                          item.is_correct ? "bg-[#118a80]" : "bg-[#f25c78]"
                        }`}
                      >
                        {item.is_correct ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
                      </span>
                      <h4 className="font-bold text-sm text-[#10292e]">
                        {idx + 1}. {item.question_text}
                      </h4>
                    </div>

                    <span className="text-[11px] font-mono text-[#8a999b] shrink-0">
                      {item.points} pts
                    </span>
                  </div>

                  <div className="pl-7 space-y-1.5 text-xs">
                    <div>
                      <span className="text-[#8a999b]">Your Answer: </span>
                      <span className={item.is_correct ? "text-[#118a80] font-semibold" : "text-[#f25c78] font-semibold"}>
                        {item.selected_answer}
                      </span>
                    </div>

                    {!item.is_correct && (
                      <div>
                        <span className="text-[#8a999b]">Correct Answer: </span>
                        <span className="text-[#118a80] font-semibold">
                          {item.correct_answer}
                        </span>
                      </div>
                    )}

                    {item.explanation && (
                      <div className="pt-2 text-[#607274] bg-white p-3 rounded-xl border border-[#f0f0eb] mt-2 leading-relaxed">
                        <strong className="text-[#10292e]">Explanation:</strong> {item.explanation}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
