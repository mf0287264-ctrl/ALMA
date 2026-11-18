"use client";

import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import MangoIcon from "@/components/MangoIcon";
import { Check, Play, Pause, Mic, Send, Volume2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

interface Section {
  id: number;
  title: string;
  subtitle: string;
  status: "completed" | "current" | "upcoming";
}

const SECTIONS: Section[] = [
  { id: 1, title: "Why loops?", subtitle: "Section 1", status: "completed" },
  { id: 2, title: "Counting with range()", subtitle: "Section 2", status: "current" },
  { id: 3, title: "Loop body", subtitle: "Section 3", status: "upcoming" },
  { id: 4, title: "Practice", subtitle: "Section 4", status: "upcoming" },
];

export default function LessonPlayerPage() {
  const [currentSection, setCurrentSection] = useState(2);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("1 to 5");
  const [checkedAnswer, setCheckedAnswer] = useState<boolean | null>(false);
  const [questionInput, setQuestionInput] = useState("");
  const [chatLogs, setChatLogs] = useState([
    {
      sender: "You",
      tag: "section 2",
      text: "Why does it stop at 4?",
      isUser: true,
    },
    {
      sender: "ALMA",
      tag: "spoken_answer",
      text: "Because range(5) stops before 5. It starts at 0, so you get five numbers: 0 to 4.",
      isUser: false,
    },
  ]);

  const handleCheckAnswer = () => {
    if (selectedOption === "0 to 4") {
      setCheckedAnswer(true);
      toast.success("Correct! range(5) generates integers from 0 up to 4.");
    } else {
      setCheckedAnswer(false);
      toast.error("Not quite! Remember that range(n) starts at 0 and stops before n.");
    }
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim()) return;
    const userMsg = questionInput;
    setChatLogs((prev) => [
      ...prev,
      { sender: "You", tag: "section 2", text: userMsg, isUser: true },
    ]);
    setQuestionInput("");

    setTimeout(() => {
      setChatLogs((prev) => [
        ...prev,
        {
          sender: "ALMA",
          tag: "spoken_answer",
          text: `Great question about "${userMsg}"! In Python, loops allow us to iterate through sequences efficiently without repeating statements.`,
          isUser: false,
        },
      ]);
    }, 600);
  };

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 py-8 sm:py-10 overflow-y-auto pb-24 md:pb-10">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              Python for loops
            </h1>
            <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
              Lesson player · Section {currentSection} of 4
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono">
              <span className="text-[#8a999b]">Sample data</span>
              <span className="bg-[#e6f5f2] text-[#118a80] px-2.5 py-0.5 rounded-full font-semibold">
                Existing
              </span>
              <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] px-2.5 py-0.5 rounded-full font-semibold">
                Proposed
              </span>
            </div>

            <Link
              href="/my-lessons"
              className="px-5 py-2 rounded-full border border-[#10292e] text-[#10292e] hover:bg-[#10292e] hover:text-white text-xs font-bold transition-colors"
            >
              Save &amp; exit
            </Link>
          </div>
        </div>

        {/* 3 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Sections (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-[#10292e] px-1">Sections</h3>

            <div className="space-y-2">
              {SECTIONS.map((s) => {
                const isSelected = s.id === currentSection;
                return (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSection(s.id)}
                    className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3 transition-all ${
                      isSelected
                        ? "border-2 border-[#ffa11f] bg-[#fffcf7]"
                        : "border border-[#e8eeea] hover:bg-[#fafaf8]"
                    }`}
                  >
                    {s.status === "completed" ? (
                      <div className="w-5 h-5 rounded-full bg-[#118a80] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-[#ffa11f] flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[#d0d0cb] shrink-0" />
                    )}

                    <div>
                      <div
                        className={`text-xs font-bold leading-tight ${
                          isSelected ? "text-[#10292e]" : "text-[#607274]"
                        }`}
                      >
                        {s.title}
                      </div>
                      <div className="text-[10px] text-[#8a999b]">{s.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center Column: Lesson content & Checkpoint (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Greeting Box */}
            <div className="bg-[#e6f5f2] rounded-2xl p-4 border border-[#d2ede7]">
              <div className="text-xs font-bold text-[#118a80]">
                ALMA: Nice work yesterday! Today we count with range().
              </div>
              <div className="text-[10px] text-[#8a999b] font-mono mt-0.5">
                personalized_greeting
              </div>
            </div>

            {/* ALMA Explains Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
              <h2 className="text-xl font-black text-[#10292e] mb-1">
                Counting with range()
              </h2>
              <p className="text-xs sm:text-sm text-[#607274] leading-relaxed mb-4">
                range(5) gives the numbers 0, 1, 2, 3 and 4. The loop runs once for each number.
              </p>

              {/* Code snippet */}
              <div className="bg-[#0b1a1c] text-[#a4efb3] font-mono text-xs p-4 rounded-2xl space-y-2">
                <div>
                  <span className="text-[#ffa11f]">for</span> i{" "}
                  <span className="text-[#ffa11f]">in</span>{" "}
                  <span className="text-[#64b5f6]">range</span>(5):
                </div>
                <div className="pl-4 text-white">
                  <span className="text-[#64b5f6]">print</span>(i)
                </div>
                <div className="pt-2 border-t border-[#1b3438] text-[#8a999b] text-[11px]">
                  expected_output: 0 1 2 3 4
                </div>
              </div>

              {/* Audio bar */}
              <div className="mt-4 p-3 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb] flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-[#ffa11f] text-[#10292e] flex items-center justify-center shrink-0 hover:bg-[#ff9400] transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  )}
                </button>
                <div className="flex-1 bg-[#e8eeea] h-2 rounded-full overflow-hidden">
                  <div className="bg-[#118a80] h-full w-1/2 rounded-full" />
                </div>
                <span className="text-[11px] text-[#8a999b] font-medium shrink-0">
                  Segment 3 of 6
                </span>
              </div>
            </div>

            {/* Checkpoint Question Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs space-y-4">
              <div className="flex items-center justify-between text-xs text-[#8a999b] font-mono">
                <span>Checkpoint · concept: zero_indexing</span>
              </div>

              <h3 className="font-extrabold text-base text-[#10292e]">
                What does range(5) produce?
              </h3>

              <div className="space-y-2.5">
                {["0 to 4", "1 to 5", "0 to 5", "1 to 4"].map((opt) => {
                  const isChecked = selectedOption === opt;
                  return (
                    <button
                      key={opt}
                      onClick={() => {
                        setSelectedOption(opt);
                        setCheckedAnswer(null);
                      }}
                      className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all ${
                        isChecked
                          ? "border-2 border-[#ffa11f] bg-[#fffcf7] text-[#10292e]"
                          : "border border-[#e8eeea] bg-white hover:bg-[#fafaf8] text-[#607274]"
                      }`}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  onClick={handleCheckAnswer}
                  className="bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs px-6 py-2.5 rounded-full shadow-xs transition-colors self-start sm:self-auto"
                >
                  Check answer
                </button>
                <span className="text-[11px] text-[#8a999b] font-mono">
                  Wrong answers log detected_misconception
                </span>
              </div>
            </div>

            {/* Pink Remediation Hint Box */}
            <div className="bg-[#fff0f3] border-2 border-dashed border-[#f4c8ce] rounded-3xl p-5 text-xs text-[#607274] leading-relaxed">
              <div className="font-bold text-[#f25c78] mb-1">If the answer is wrong</div>
              <p>
                routed_to_remediation = true. ALMA explains the idea again with a short
                remediation block, then retries.
              </p>
            </div>
          </div>

          {/* Right Column: Ask ALMA chat & mascot (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-base text-[#10292e]">Ask ALMA</h3>
                <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold">
                  dialogue_logs
                </span>
              </div>

              {/* Chat messages */}
              <div className="flex-1 space-y-3 overflow-y-auto mb-4">
                {chatLogs.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl text-xs ${
                      msg.isUser
                        ? "bg-[#0b1a1c] text-white ml-6"
                        : "bg-[#fff8ec] text-[#10292e] mr-4 border border-[#fae2b8]"
                    }`}
                  >
                    <div className="font-medium">{msg.text}</div>
                    <div
                      className={`text-[10px] mt-1 font-mono ${
                        msg.isUser ? "text-white/60" : "text-[#8a999b]"
                      }`}
                    >
                      {msg.sender} · {msg.tag}
                    </div>
                  </div>
                ))}

                {/* Mascot Graphic card */}
                <div className="bg-[#fff8ec] rounded-2xl p-4 text-center border border-[#fae2b8] my-4">
                  <div className="flex justify-center mb-2">
                    <MangoIcon size={48} animated />
                  </div>
                  <div className="font-bold text-xs text-[#10292e]">
                    A little practice, a big step.
                  </div>
                  <div className="text-[11px] text-[#607274] mt-0.5">
                    ALMA is here to help you learn.
                  </div>
                </div>
              </div>

              {/* Input row */}
              <form onSubmit={handleAskQuestion} className="flex items-center gap-2 pt-2 border-t border-[#f0f0eb]">
                <input
                  type="text"
                  placeholder="Ask a question..."
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-[#fafaf8] rounded-full border border-[#e8eeea] text-xs text-[#10292e] placeholder-[#8a999b] focus:outline-hidden focus:border-[#ffa11f]"
                />
                <button
                  type="button"
                  onClick={() => toast.info("Listening... Speak your question.")}
                  className="w-9 h-9 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] flex items-center justify-center shrink-0 shadow-xs transition-colors"
                >
                  <Mic className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
