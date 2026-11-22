"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import api from "@/services/api";
import { Check, X, Loader2, AlertCircle, RotateCcw, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface QuizItem {
  _id: string;
  question: string;
  options: string[];
  correct_option_index: number;
  explanation?: string;
}

interface QuizDocument {
  _id: string;
  title: string;
  description?: string;
  course_id?: string;
  course_title?: string;
  status?: string;
  questions: QuizItem[];
}

function QuizContent() {
  const searchParams = useSearchParams();
  const quizIdParam = searchParams.get("quizId");

  const [quizzes, setQuizzes] = useState<QuizDocument[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({});

  useEffect(() => {
    async function loadQuizzes() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/quizzes");
        const list: QuizDocument[] = res.data?.data || [];
        setQuizzes(list);

        if (list.length > 0) {
          const match = quizIdParam ? list.find((q) => q._id === quizIdParam) : null;
          const initial = match ? match._id : list[0]._id;
          setSelectedQuizId(initial);
        }
      } catch (err: any) {
        console.error("Failed to load quizzes from database:", err);
        setError("Could not load quizzes. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }

    loadQuizzes();
  }, [quizIdParam]);

  const activeQuiz = quizzes.find((q) => q._id === selectedQuizId) || quizzes[0];
  const questions = activeQuiz?.questions || [];
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIdx] || null;
  const userSelected = selectedAnswers[currentIdx];

  // Calculate score
  let correctCount = 0;
  let attemptedCount = 0;
  questions.forEach((q, idx) => {
    if (selectedAnswers[idx] !== undefined) {
      attemptedCount++;
      if (selectedAnswers[idx] === q.correct_option_index) {
        correctCount++;
      }
    }
  });

  const handleSelectOption = (optIdx: number) => {
    if (!currentQuestion) return;
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }));
    setShowExplanation((prev) => ({ ...prev, [currentIdx]: true }));

    if (optIdx === currentQuestion.correct_option_index) {
      toast.success("Spot on!");
    } else {
      toast.error("Not quite right.");
    }
  };

  const handleNext = async () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      try {
        await api.post(`/quizzes/${activeQuiz._id}/attempt`, {
          score: correctCount,
          total_questions: totalQuestions,
          score_percent: Math.round((correctCount / totalQuestions) * 100),
          answers: selectedAnswers,
        });
        toast.success(`Quiz completed and saved to your profile! You scored ${correctCount}/${totalQuestions}`);
      } catch (e) {
        toast.success(`Quiz completed! You scored ${correctCount}/${totalQuestions}`);
      }
    }
  };

  const handleReset = () => {
    setSelectedAnswers({});
    setShowExplanation({});
    setCurrentIdx(0);
    toast.info("Quiz reset for a fresh attempt.");
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#fff8ec]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#118a80] animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-[#10292e]">Loading quiz questions...</p>
        </div>
      </div>
    );
  }

  if (error || !activeQuiz || questions.length === 0) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#fff8ec] p-6">
        <div className="bg-white rounded-3xl p-8 border border-red-200 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-base font-black text-[#10292e] mb-2">Quiz Unavailable</h2>
          <p className="text-xs text-red-600 mb-6">{error || "No quizzes found in database."}</p>
          <Link
            href="/my-lessons"
            className="inline-block px-5 py-2.5 bg-[#ffa11f] text-[#10292e] rounded-full text-xs font-bold"
          >
            &larr; Back to My Lessons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              {activeQuiz.title}
            </h1>
            <p className="text-xs text-[#8a999b] mt-1 font-medium">
              Course: <span className="text-[#118a80] font-semibold">{activeQuiz.course_title || "General"}</span> · {totalQuestions} questions total
            </p>
          </div>

          {/* Quiz Selector Dropdown / Pills */}
          {quizzes.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              {quizzes.map((q) => (
                <button
                  key={q._id}
                  onClick={() => {
                    setSelectedQuizId(q._id);
                    setCurrentIdx(0);
                    setSelectedAnswers({});
                    setShowExplanation({});
                  }}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    q._id === activeQuiz._id
                      ? "bg-[#10292e] text-white shadow-2xs"
                      : "bg-white text-[#607274] border border-[#e8eeea] hover:bg-[#fafaf8]"
                  }`}
                >
                  {q.title}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Question Card (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#e8eeea] shadow-xs space-y-6">
            {/* Question progress */}
            <div>
              <div className="text-xs text-[#8a999b] font-medium mb-1.5">
                Question {currentIdx + 1} of {totalQuestions}
              </div>
              <div className="w-full bg-[#f1f3f2] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#ffa11f] h-full rounded-full transition-all"
                  style={{ width: `${((currentIdx + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Question title */}
            {currentQuestion && (
              <>
                <h2 className="text-xl sm:text-2xl font-extrabold text-[#10292e]">
                  {currentQuestion.question}
                </h2>

                {/* Options list */}
                <div className="space-y-3 font-mono text-xs sm:text-sm">
                  {currentQuestion.options.map((option, idx) => {
                    const isSelected = userSelected === idx;
                    const isCorrect = idx === currentQuestion.correct_option_index;
                    const hasAnswered = userSelected !== undefined;

                    let cardStyle = "bg-white border-[#e8eeea] hover:bg-[#fafaf8]";
                    let icon = null;

                    if (hasAnswered) {
                      if (isCorrect) {
                        cardStyle = "bg-[#e6f5f2] border-2 border-[#118a80] text-[#10292e]";
                        icon = <Check className="w-4 h-4 text-[#118a80]" />;
                      } else if (isSelected && !isCorrect) {
                        cardStyle = "bg-[#fff0f3] border-2 border-[#f25c78] text-[#10292e]";
                        icon = <X className="w-4 h-4 text-[#f25c78]" />;
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(idx)}
                        className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between cursor-pointer ${cardStyle}`}
                      >
                        <span>{option}</span>
                        {icon}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation box */}
                {showExplanation[currentIdx] && currentQuestion.explanation && (
                  <div className="p-4 rounded-2xl bg-[#fffdf9] border border-[#fae2b8] text-xs sm:text-sm leading-relaxed animate-in fade-in duration-200">
                    <div className="font-extrabold text-[#10292e] mb-1">
                      Explanation
                    </div>
                    <p className="text-[#607274]">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                )}

                {/* Next question button */}
                <div className="pt-2 flex items-center justify-between">
                  <button
                    onClick={handleNext}
                    className="px-7 py-2.5 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs sm:text-sm shadow-xs transition-colors cursor-pointer"
                  >
                    {currentIdx < totalQuestions - 1 ? "Next question" : "Finish quiz"}
                  </button>

                  <button
                    onClick={handleReset}
                    className="inline-flex items-center gap-1.5 text-xs text-[#8a999b] hover:text-[#10292e] font-semibold cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Quiz</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Right Card: Result & Quick Nav (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-extrabold text-base text-[#10292e]">
                  Your Progress
                </h3>
                <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Live
                </span>
              </div>
              <p className="text-xs text-[#8a999b]">
                Click any question number to review your answer and explanation.
              </p>
            </div>

            {/* Question circles */}
            <div className="flex flex-wrap gap-2.5">
              {questions.map((q, idx) => {
                const answer = selectedAnswers[idx];
                const isAnswered = answer !== undefined;
                const isCorrect = answer === q.correct_option_index;
                const isCurrent = idx === currentIdx;

                let circleClass = "bg-white border border-[#e8eeea] text-[#8a999b]";
                if (isAnswered) {
                  circleClass = isCorrect
                    ? "bg-[#118a80] text-white"
                    : "bg-[#fff0f3] text-[#f25c78] border border-[#f4c8ce]";
                } else if (isCurrent) {
                  circleClass = "border-2 border-[#ffa11f] text-[#ffa11f]";
                }

                return (
                  <button
                    key={q._id || idx}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center transition-all cursor-pointer ${circleClass}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            {/* Score box */}
            <div className="p-6 rounded-2xl bg-[#fff8ec] border border-[#fae2b8] text-center">
              <div className="text-4xl font-black text-[#10292e]">
                {correctCount}/{attemptedCount || 1}
              </div>
              <div className="text-xs text-[#8a999b] font-medium mt-1">
                correct so far
              </div>
            </div>

            <p className="text-[11px] text-[#8a999b] leading-relaxed">
              Every answered question logs telemetry to strengthen your personalized study paths.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function QuizPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex items-center justify-center bg-[#fff8ec]">
          <Loader2 className="w-10 h-10 text-[#118a80] animate-spin" />
        </div>
      }
    >
      <QuizContent />
    </Suspense>
  );
}
