"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import api from "@/services/api";
import { Loader2, AlertCircle, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface AssessmentQuestion {
  _id: string;
  question_text: string;
  question_type: string;
  options: string[];
  correct_answer: string;
  points: number;
  explanation?: string;
}

interface AssessmentDetail {
  _id: string;
  title: string;
  course_title?: string;
  total_points: number;
  passing_score: number;
  questions: AssessmentQuestion[];
}

export default function AssessmentTakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const assessmentId = resolvedParams.id;
  const router = useRouter();

  const [assessment, setAssessment] = useState<AssessmentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadAssessment() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`/assessments/${assessmentId}`);
        if (res.data?.data) {
          const data = res.data.data;
          setAssessment(data);
          // If questions exist, set initial index to 0
          setCurrentIndex(0);
        } else {
          setError("Assessment not found in database.");
        }
      } catch (err: any) {
        console.error("Failed to load assessment for taking:", err);
        setError("Could not load assessment questions from database.");
      } finally {
        setLoading(false);
      }
    }

    if (assessmentId) {
      loadAssessment();
    }
  }, [assessmentId]);

  const questions = assessment?.questions || [];
  const currentQ = questions[currentIndex] || null;

  const handleSelectOption = (opt: string) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: opt }));
  };

  const handleSubmit = async () => {
    if (!assessment) return;

    setIsSubmitting(true);

    // Calculate score
    let earnedPoints = 0;
    let correctCount = 0;
    const questionsBreakdown = questions.map((q, idx) => {
      const selected = answers[idx];
      const isCorrect = selected === q.correct_answer;
      if (isCorrect) {
        earnedPoints += q.points || 10;
        correctCount += 1;
      }
      return {
        question_text: q.question_text,
        selected_answer: selected || "Not answered",
        correct_answer: q.correct_answer,
        is_correct: isCorrect,
        points: q.points || 10,
        explanation: q.explanation || "",
      };
    });

    const totalPossible = assessment.total_points || questions.reduce((s, q) => s + (q.points || 10), 0);
    const scorePercent = Math.round((earnedPoints / totalPossible) * 100);
    const passed = scorePercent >= (assessment.passing_score || 60);

    const resultPayload = {
      assessment_id: assessment._id,
      title: assessment.title,
      course_title: assessment.course_title,
      earned_points: earnedPoints,
      total_points: totalPossible,
      score_percent: scorePercent,
      correct_count: correctCount,
      total_questions: questions.length,
      passing_score: assessment.passing_score,
      passed,
      submitted_at: new Date().toISOString(),
      breakdown: questionsBreakdown,
    };

    try {
      // Save directly to MongoDB connected to the logged-in student
      await api.post(`/assessments/${assessment._id}/submit`, resultPayload);
    } catch (apiErr) {
      console.warn("Could not save submission to API, saving to local cache:", apiErr);
      try {
        localStorage.setItem(`assessment_result_${assessment._id}`, JSON.stringify(resultPayload));
      } catch (e) {
        // ignore
      }
    }

    toast.success("Assessment submitted successfully!");
    router.push(`/assessments/${assessment._id}/result`);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#fff8ec]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#118a80] animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-[#10292e]">Loading assessment questions...</p>
        </div>
      </div>
    );
  }

  if (error || !assessment || questions.length === 0) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#fff8ec] p-6">
        <div className="bg-white rounded-3xl p-8 border border-red-200 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-base font-black text-[#10292e] mb-2">Assessment Unavailable</h2>
          <p className="text-xs text-red-600 mb-6">{error || "No questions found for this assessment."}</p>
          <Link
            href="/assessments"
            className="inline-block px-5 py-2.5 bg-[#ffa11f] text-[#10292e] rounded-full text-xs font-bold"
          >
            &larr; Back to Assessments
          </Link>
        </div>
      </div>
    );
  }

  const answeredCount = Object.keys(answers).length;

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10292e] tracking-tight">
              {assessment.title}
            </h1>
            <p className="text-xs text-[#8a999b] mt-0.5">
              {assessment.course_title} · Question {currentIndex + 1} of {questions.length} ·{" "}
              {answeredCount} of {questions.length} answered
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-[#118a80] hover:bg-[#0e746b] text-white rounded-full text-xs font-bold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            >
              Submit Assessment
            </button>
            <Link
              href={`/assessments/${assessment._id}/instructions`}
              className="px-4 py-2 rounded-full border border-[#10292e] text-[#10292e] hover:bg-[#10292e] hover:text-white text-xs font-bold transition-colors"
            >
              Exit
            </Link>
          </div>
        </div>

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start max-w-6xl">
          {/* Left Column: Questions Navigator (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-base text-[#10292e]">Questions</h3>
              <span className="text-xs text-[#8a999b] font-medium">
                {answeredCount}/{questions.length} done
              </span>
            </div>

            <div className="space-y-2">
              {questions.map((q, idx) => {
                const isSelected = idx === currentIndex;
                const isAnswered = answers[idx] !== undefined;

                return (
                  <button
                    key={q._id || idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-full text-left p-3 rounded-2xl flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? "border-2 border-[#ffa11f] bg-[#fffcf7]"
                        : "border border-[#e8eeea] bg-[#fafaf8] hover:bg-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                          isAnswered
                            ? "bg-[#118a80] text-white"
                            : isSelected
                            ? "bg-[#ffa11f] text-[#10292e]"
                            : "bg-[#e8eeea] text-[#607274]"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-[#10292e] truncate max-w-[160px]">
                        {q.question_text}
                      </span>
                    </div>

                    <span className="text-[10px] text-[#8a999b] font-mono shrink-0">
                      {q.points || 10} pts
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Column: Question Content & Options (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#e8eeea] shadow-xs space-y-6">
            {currentQ && (
              <>
                <div className="flex items-center justify-between">
                  <span className="bg-[#e6f5f2] text-[#118a80] text-xs font-bold px-3 py-1 rounded-full uppercase">
                    Question {currentIndex + 1} · {currentQ.question_type || "MCQ"}
                  </span>
                  <span className="text-xs text-[#8a999b] font-mono">
                    Worth {currentQ.points || 10} points
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-extrabold text-[#10292e] leading-snug">
                  {currentQ.question_text}
                </h2>

                {/* Options List */}
                <div className="space-y-3 pt-2">
                  {currentQ.options?.map((opt, oIdx) => {
                    const isChecked = answers[currentIndex] === opt;
                    return (
                      <button
                        key={oIdx}
                        onClick={() => handleSelectOption(opt)}
                        className={`w-full text-left p-4 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center justify-between ${
                          isChecked
                            ? "border-2 border-[#ffa11f] bg-[#fffcf7] text-[#10292e] shadow-2xs"
                            : "border border-[#e8eeea] bg-[#fafaf8] hover:bg-white text-[#607274]"
                        }`}
                      >
                        <span>{opt}</span>
                        {isChecked && (
                          <div className="w-5 h-5 rounded-full bg-[#ffa11f] flex items-center justify-center text-[#10292e] shrink-0">
                            <div className="w-2 h-2 rounded-full bg-[#10292e]" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Navigation Buttons */}
                <div className="pt-6 border-t border-[#f0f0eb] flex items-center justify-between">
                  <button
                    onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                    disabled={currentIndex === 0}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full border border-[#e8eeea] text-[#10292e] font-bold text-xs hover:bg-[#fafaf8] disabled:opacity-40 cursor-pointer"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>

                  {currentIndex < questions.length - 1 ? (
                    <button
                      onClick={() => setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                      className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-full bg-[#10292e] hover:bg-[#1b3438] text-white font-extrabold text-xs transition-colors cursor-pointer"
                    >
                      <span>Next Question</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="inline-flex items-center gap-1.5 px-7 py-2.5 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs shadow-xs transition-colors cursor-pointer"
                    >
                      <span>Finish &amp; View Result</span>
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
