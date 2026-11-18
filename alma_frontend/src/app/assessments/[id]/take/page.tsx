"use client";

import React, { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";

const QUESTIONS = [
  {
    id: 1,
    points: 10,
    tag: "mcq",
    question: "What keyword is used to start a loop in Python?",
    code: "",
    options: ["loop", "for", "iterate", "repeat"],
    correct: 1,
  },
  {
    id: 2,
    points: 10,
    tag: "mcq",
    question: "How many times does range(4) execute?",
    code: "for i in range(4):\n    pass",
    options: ["3 times", "4 times", "5 times", "Infinite"],
    correct: 1,
  },
  {
    id: 3,
    points: 10,
    tag: "mcq",
    question: "What does range(3) produce?",
    code: "print(list(range(3)))",
    options: ["1  2  3", "0  1  2", "0  1  2  3", "1  2"],
    correct: 1,
  },
  {
    id: 4,
    points: 15,
    tag: "coding",
    question: "Write a loop that prints numbers from 1 to 5.",
    code: "for i in range(1, 6):\n    print(i)",
    options: ["range(1, 5)", "range(1, 6)", "range(0, 5)", "range(5)"],
    correct: 1,
  },
  {
    id: 5,
    points: 10,
    tag: "mcq",
    question: "What is the starting index in Python range() by default?",
    code: "",
    options: ["0", "1", "-1", "Depends on list length"],
    correct: 0,
  },
  {
    id: 6,
    points: 15,
    tag: "short_answer",
    question: "Why does a loop need an exit condition?",
    code: "",
    options: [
      "To prevent infinite loops and memory leaks",
      "To make code faster",
      "Because Python requires it syntactically",
      "To allow nesting",
    ],
    correct: 0,
  },
  {
    id: 7,
    points: 15,
    tag: "coding",
    question: "What is the output of range(2, 8, 2)?",
    code: "print(list(range(2, 8, 2)))",
    options: ["[2, 4, 6, 8]", "[2, 4, 6]", "[2, 3, 4, 5, 6, 7]", "[4, 6, 8]"],
    correct: 1,
  },
  {
    id: 8,
    points: 15,
    tag: "mcq",
    question: "Which function converts a range object into a displayable list?",
    code: "",
    options: ["to_list()", "list()", "array()", "enumerate()"],
    correct: 1,
  },
];

export default function AssessmentTakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const assessmentId = resolvedParams.id;
  const router = useRouter();

  const [currentIndex, setCurrentIndex] = useState(2); // Question 3 (0-indexed 2)
  const [answers, setAnswers] = useState<Record<number, number>>({
    0: 1,
    1: 1,
    2: 1,
  });

  const currentQ = QUESTIONS[currentIndex];
  const totalQuestions = QUESTIONS.length;

  const answeredCount = Object.keys(answers).length;
  const leftCount = totalQuestions - answeredCount;

  const handleSelectOption = (optIdx: number) => {
    setAnswers((prev) => ({ ...prev, [currentIndex]: optIdx }));
  };

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleSubmit = () => {
    router.push(`/assessments/${assessmentId}/result`);
  };

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 py-8 sm:py-10 overflow-y-auto pb-24 md:pb-10">
        {/* Top Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              Loops checkpoint
            </h1>
            <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
              Question {currentIndex + 1} of {totalQuestions}
            </p>
          </div>

          <span className="bg-[#fff3db] border border-[#fae2b8] text-[#10292e] font-extrabold text-xs px-3.5 py-1.5 rounded-full">
            {currentQ.points} pts
          </span>
        </div>

        {/* 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Question Area (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 border border-[#e8eeea] shadow-xs space-y-6">
            {/* Progress bar */}
            <div>
              <div className="flex items-center justify-between text-xs text-[#8a999b] font-medium mb-1.5">
                <span className="bg-[#e9f4fb] text-[#2b88d8] text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold">
                  {currentQ.tag}
                </span>
                <span>{currentIndex + 1} / {totalQuestions}</span>
              </div>
              <div className="w-full bg-[#f1f3f2] h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#ffa11f] h-full rounded-full transition-all"
                  style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
                />
              </div>
            </div>

            {/* Question Text */}
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#10292e]">
              {currentQ.question}
            </h2>

            {/* Code Block if any */}
            {currentQ.code && (
              <div className="bg-[#0b1a1c] text-[#a4efb3] font-mono text-xs sm:text-sm p-4 rounded-2xl">
                <pre>{currentQ.code}</pre>
              </div>
            )}

            {/* Radio Options */}
            <div className="space-y-3">
              {currentQ.options.map((option, idx) => {
                const isSelected = answers[currentIndex] === idx;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(idx)}
                    className={`w-full text-left p-4 rounded-2xl font-semibold text-xs sm:text-sm flex items-center gap-3 transition-all ${
                      isSelected
                        ? "border-2 border-[#ffa11f] bg-[#fffcf7] text-[#10292e]"
                        : "border border-[#e8eeea] bg-white hover:bg-[#fafaf8] text-[#607274]"
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                        isSelected
                          ? "bg-[#ffa11f]"
                          : "border border-[#d0d0cb]"
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <span>{option}</span>
                  </button>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-4">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="px-6 py-2.5 rounded-full border border-[#10292e] text-[#10292e] hover:bg-[#10292e] hover:text-white font-bold text-xs disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#10292e] transition-colors"
              >
                Previous
              </button>

              <button
                onClick={handleNext}
                disabled={currentIndex === totalQuestions - 1}
                className="px-7 py-2.5 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs shadow-xs disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>

          {/* Right Column: Questions Grid & Submit (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs space-y-6">
            <h3 className="font-extrabold text-lg text-[#10292e]">Questions</h3>

            {/* Number circles */}
            <div className="grid grid-cols-5 gap-2.5">
              {QUESTIONS.map((_, i) => {
                const isAnswered = answers[i] !== undefined;
                const isActive = i === currentIndex;

                return (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`w-10 h-10 rounded-full font-bold text-xs flex items-center justify-center transition-all ${
                      isActive
                        ? "bg-[#ffa11f] text-[#10292e] ring-2 ring-[#ffa11f] ring-offset-2"
                        : isAnswered
                        ? "bg-[#118a80] text-white"
                        : "bg-[#f1f3f2] text-[#8a999b] hover:bg-[#e4e7e6]"
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>

            <div className="text-xs text-[#8a999b] font-medium">
              {answeredCount} answered · {leftCount} left
            </div>

            <button
              onClick={handleSubmit}
              className="w-full py-3 rounded-full bg-[#118a80] hover:bg-[#0f756d] text-white font-extrabold text-sm shadow-xs transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
