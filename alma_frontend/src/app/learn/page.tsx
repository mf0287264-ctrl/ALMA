"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";

const TOPICS = ["Loops", "Variables", "If statements"];
const LEVELS = ["Beginner", "Intermediate"];
const LANGUAGES = ["English", "Arabic"];

const QUESTIONS = [
  "1. What does a for loop do?",
  "2. How many times will this code run?",
  "3. Write a loop that counts to 10.",
];

export default function LearnPage() {
  const [selectedTopic, setSelectedTopic] = useState("Loops");
  const [selectedLevel, setSelectedLevel] = useState("Beginner");
  const [selectedLanguage, setSelectedLanguage] = useState("English");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      toast.success(`Generated new lesson for ${selectedTopic}!`);
    }, 800);
  };

  const handlePublish = () => {
    toast.success("Lesson published to your class successfully!");
  };

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      {/* Sidebar Selector Component */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen bg-[#fff8ec] px-6 sm:px-10 lg:px-12 py-8 sm:py-10 overflow-y-auto pb-24 md:pb-10 select-none">
        {/* Page Title */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight mb-8">
          Create a lesson
        </h1>

        {/* 2-Card Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Left Card: Form Controls */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-sm">
            {/* Topic Section */}
            <div className="mb-5">
              <span className="text-xs font-bold text-[#5a6e70] uppercase tracking-wider block mb-2.5">
                Topic
              </span>
              <div className="flex flex-wrap gap-2">
                {TOPICS.map((topic) => {
                  const isSelected = selectedTopic === topic;
                  return (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => setSelectedTopic(topic)}
                      className={`rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
                        isSelected
                          ? "bg-white border-2 border-[#ffa11f] text-[#10292e] ring-2 ring-[#ffa11f]/15"
                          : "bg-white border border-[#d2dcd7] text-[#10292e] hover:border-[#ffa11f]/60"
                      }`}
                    >
                      {topic}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Level Section */}
            <div className="mb-5">
              <span className="text-xs font-bold text-[#5a6e70] uppercase tracking-wider block mb-2.5">
                Level
              </span>
              <div className="flex flex-wrap gap-2">
                {LEVELS.map((level) => {
                  const isSelected = selectedLevel === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setSelectedLevel(level)}
                      className={`rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
                        isSelected
                          ? "bg-white border-2 border-[#ffa11f] text-[#10292e] ring-2 ring-[#ffa11f]/15"
                          : "bg-white border border-[#d2dcd7] text-[#10292e] hover:border-[#ffa11f]/60"
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Language Section */}
            <div className="mb-7">
              <span className="text-xs font-bold text-[#5a6e70] uppercase tracking-wider block mb-2.5">
                Language
              </span>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => {
                  const isSelected = selectedLanguage === lang;
                  return (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setSelectedLanguage(lang)}
                      className={`rounded-full px-4 py-2 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.02)] ${
                        isSelected
                          ? "bg-white border-2 border-[#ffa11f] text-[#10292e] ring-2 ring-[#ffa11f]/15"
                          : "bg-white border border-[#d2dcd7] text-[#10292e] hover:border-[#ffa11f]/60"
                      }`}
                    >
                      {lang}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Generate Lesson Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating}
              className="w-full bg-[#ffa11f] hover:brightness-95 active:scale-[0.98] text-[#10292e] font-bold text-sm sm:text-base py-3.5 rounded-full cursor-pointer transition-all shadow-sm flex items-center justify-center disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffa11f]"
            >
              {isGenerating ? "Generating..." : "Generate lesson"}
            </button>
          </div>

          {/* Right Card: Generated Preview */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#e8eeea] shadow-sm">
            {/* Badge */}
            <div className="mb-3">
              <span className="bg-[#ffd84a] text-[#10292e] text-xs font-extrabold px-3.5 py-1.5 rounded-full inline-block shadow-sm">
                Generated Preview
              </span>
            </div>

            {/* Lesson Title & Description */}
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#10292e] mb-2">
              Understanding loops
            </h2>
            <p className="text-sm text-[#5a6e70] leading-relaxed mb-6">
              Learn how for and while loops repeat actions automatically with real examples.
            </p>

            {/* Coding Exercise */}
            <div className="mb-6">
              <span className="text-sm font-extrabold text-[#10292e] block mb-2.5">
                Coding exercise
              </span>
              <div className="bg-[#10292e] rounded-2xl p-4 sm:p-5 font-mono text-sm shadow-inner">
                <span className="text-[#ffd84a] font-bold">for</span>{" "}
                <span className="text-white">i</span>{" "}
                <span className="text-[#ffd84a] font-bold">in</span>{" "}
                <span className="text-[#7ccbf0]">range</span>(5):
                <br />
                &nbsp;&nbsp;&nbsp;&nbsp;
                <span className="text-[#7ccbf0]">print</span>(
                <span className="text-[#f25c78]">&quot;Level up!&quot;</span>, i)
              </div>
            </div>

            {/* Questions Section */}
            <div className="mb-7">
              <span className="text-sm font-extrabold text-[#10292e] block mb-2.5">
                Questions
              </span>
              <div className="space-y-2.5">
                {QUESTIONS.map((question, i) => (
                  <div
                    key={i}
                    className="bg-[#fff8ec] rounded-2xl py-3.5 px-4 text-sm font-medium text-[#10292e] border border-[#f0ece1]"
                  >
                    {question}
                  </div>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toast.info("Opening lesson editor...")}
                className="bg-white hover:bg-gray-50 active:scale-95 border-2 border-[#10292e] text-[#10292e] font-bold text-sm px-7 py-2.5 rounded-full cursor-pointer transition-all shadow-sm"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={handlePublish}
                className="bg-[#ffa11f] hover:brightness-95 active:scale-95 text-[#10292e] font-bold text-sm px-7 py-2.5 rounded-full cursor-pointer transition-all shadow-sm"
              >
                Publish to class
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
