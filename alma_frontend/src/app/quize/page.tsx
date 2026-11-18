"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { Check, X } from "lucide-react";
import { toast } from "sonner";

interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 1,
    question: "What does range(5) produce in Python?",
    options: [
      "Numbers from 0 to 4",
      "Numbers from 1 to 5",
      "Numbers from 0 to 5",
      "Numbers from 1 to 4",
    ],
    correctIndex: 0,
    explanation: "range(5) starts at 0 by default and produces 5 integers: 0, 1, 2, 3, 4.",
  },
  {
    id: 2,
    question: "Which loop prints 0, 1 and 2?",
    options: [
      "for i in range(3): print(i)",
      "for i in range(1, 3): print(i)",
      "for i in range(4): print(i)",
      "while i < 3: print(i)",
    ],
    correctIndex: 0,
    explanation:
      "range(3) gives 0, 1 and 2. The stop value is not included, so range(4) would also print 3.",
  },
  {
    id: 3,
    question: "What is the step value if not specified in range(start, stop)?",
    options: ["0", "1", "2", "-1"],
    correctIndex: 1,
    explanation: "The default increment step for range() is 1.",
  },
  {
    id: 4,
    question: "What will range(2, 6) output when iterated?",
    options: ["2, 3, 4, 5", "2, 3, 4, 5, 6", "0, 1, 2, 3, 4, 5", "3, 4, 5"],
    correctIndex: 0,
    explanation: "It starts at 2 and stops just before 6.",
  },
  {
    id: 5,
    question: "How do you count down from 5 to 1 using range()?",
    options: [
      "range(5, 0, -1)",
      "range(5, 1, -1)",
      "range(1, 5, -1)",
      "range(5, -1)",
    ],
    correctIndex: 0,
    explanation:
      "range(5, 0, -1) starts at 5, decrements by 1 on each step, and stops before 0.",
  },
];

export default function QuizPage() {
  const [currentIdx, setCurrentIdx] = useState(1); // default on Question 2 as shown in mockup
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({
    0: 0, // Question 1 answered correctly
    1: 2, // Question 2 answered option 2 (wrong, like mockup)
  });
  const [showExplanation, setShowExplanation] = useState<Record<number, boolean>>({
    0: true,
    1: true,
  });

  const question = QUIZ_QUESTIONS[currentIdx];
  const totalQuestions = QUIZ_QUESTIONS.length;
  const userSelected = selectedAnswers[currentIdx];

  // Calculate score so far
  let correctCount = 0;
  let attemptedCount = 0;
  QUIZ_QUESTIONS.forEach((q, idx) => {
    if (selectedAnswers[idx] !== undefined) {
      attemptedCount++;
      if (selectedAnswers[idx] === q.correctIndex) {
        correctCount++;
      }
    }
  });

  const handleSelectOption = (optIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [currentIdx]: optIdx }));
    setShowExplanation((prev) => ({ ...prev, [currentIdx]: true }));
    if (optIdx === question.correctIndex) {
      toast.success("Spot on!");
    } else {
      toast.error("Not quite right.");
    }
  };

  const handleNext = () => {
    if (currentIdx < totalQuestions - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      toast.success(`Quiz completed! You scored ${correctCount}/${totalQuestions}`);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 py-8 sm:py-10 overflow-y-auto pb-24 md:pb-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              Quiz · Python for loops
            </h1>
            <p className="text-xs text-[#8a999b] font-mono mt-1">
              Quiz.questions: question, options, correct_option_index, explanation
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-mono">
            <span className="text-[#8a999b]">Sample data</span>
            <span className="bg-[#e6f5f2] text-[#118a80] px-2.5 py-0.5 rounded-full font-semibold">
              Existing
            </span>
            <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] px-2.5 py-0.5 rounded-full font-semibold">
              Proposed
            </span>
          </div>
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
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#10292e]">
              {question.question}
            </h2>

            {/* Options list */}
            <div className="space-y-3 font-mono text-xs sm:text-sm">
              {question.options.map((option, idx) => {
                const isSelected = userSelected === idx;
                const isCorrect = idx === question.correctIndex;
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
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between ${cardStyle}`}
                  >
                    <span>{option}</span>
                    {icon}
                  </button>
                );
              })}
            </div>

            {/* Explanation box */}
            {showExplanation[currentIdx] && (
              <div className="p-4 rounded-2xl bg-[#fffdf9] border border-[#fae2b8] text-xs sm:text-sm leading-relaxed">
                <div className="font-extrabold text-[#10292e] mb-1">
                  Explanation
                </div>
                <p className="text-[#607274]">
                  {question.explanation}
                </p>
              </div>
            )}

            {/* Next question button */}
            <div className="pt-2">
              <button
                onClick={handleNext}
                className="px-7 py-2.5 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs sm:text-sm shadow-xs transition-colors"
              >
                {currentIdx < totalQuestions - 1 ? "Next question" : "Finish quiz"}
              </button>
            </div>
          </div>

          {/* Right Card: Your result (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border-2 border-dashed border-[#f4c8ce] shadow-xs space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-extrabold text-base text-[#10292e]">
                  Your result
                </h3>
                <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Proposed
                </span>
              </div>
              <p className="text-xs text-[#8a999b]">
                No quiz attempt model exists today. Scores are only held in the app.
              </p>
            </div>

            {/* Question circles */}
            <div className="flex items-center gap-2.5">
              {QUIZ_QUESTIONS.map((q, idx) => {
                const answer = selectedAnswers[idx];
                const isAnswered = answer !== undefined;
                const isCorrect = answer === q.correctIndex;
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
                    key={q.id}
                    onClick={() => setCurrentIdx(idx)}
                    className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center transition-all ${circleClass}`}
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
              Needs QuizAttempt (student_id, quiz_id, answers, score, taken_at) to store history.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
