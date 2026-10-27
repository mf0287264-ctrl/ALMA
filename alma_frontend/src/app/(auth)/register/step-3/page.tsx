"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import MangoIcon from "@/components/MangoIcon";

const AGE_OPTIONS = ["Under 10", "10 to 12", "13 to 15", "16 to 18", "19 and over"];
const CODING_EXPERIENCE = ["Never", "A little", "I know the basics"];
const LEARNING_STYLES = ["Pictures", "Step by step", "Trying things", "Examples"];
const GENDER_OPTIONS = ["Female", "Male"];

export default function RegisterStepThreePage() {
  const router = useRouter();

  // Initial defaults matching the design screenshot
  const [selectedAge, setSelectedAge] = useState<string>("13 to 15");
  const [experience, setExperience] = useState<string>("A little");
  const [learningStyles, setLearningStyles] = useState<string[]>(["Pictures", "Trying things"]);
  const [gender, setGender] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const toggleLearningStyle = (style: string) => {
    if (learningStyles.includes(style)) {
      setLearningStyles(learningStyles.filter((s) => s !== style));
    } else {
      setLearningStyles([...learningStyles, style]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    toast.success("Profile setup complete! Welcome to ALMA.");
    setTimeout(() => {
      setLoading(false);
      router.push("/home");
    }, 700);
  };

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      {/* Left Column (Desktop Only: lg and up) */}
      <div className="hidden lg:flex lg:w-1/2 min-h-screen bg-[#118a80] flex-col items-center justify-center p-12 select-none relative">
        <div className="transform hover:scale-105 transition-transform duration-300 mb-8">
          <MangoIcon size={190} animated className="drop-shadow-lg" />
        </div>

        {/* Mascot Speech Bubble */}
        <div className="bg-white text-[#10292e] rounded-2xl py-4 px-6 shadow-md max-w-xs text-left">
          <p className="font-bold text-base leading-snug">
            A few questions so I can teach you your way.
          </p>
        </div>
      </div>

      {/* Right Column (Mobile, Tablet & Desktop) */}
      <div className="w-full lg:w-1/2 min-h-screen bg-[#fff8ec] flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-20 py-10 sm:py-14 select-none">
        <div className="w-full max-w-lg mx-auto lg:mx-0">
          {/* Mobile/Tablet Mascot & Speech Bubble Header */}
          <div className="lg:hidden flex items-center gap-3.5 mb-6 bg-white/70 p-3.5 rounded-2xl border border-[#d2dcd7]">
            <MangoIcon size={46} animated className="shrink-0" />
            <p className="font-bold text-xs sm:text-sm text-[#10292e] leading-snug">
              A few questions so I can teach you your way.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
            {/* 1. Age Question */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#10292e] tracking-tight mb-3">
                How old are you?
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {AGE_OPTIONS.map((age) => {
                  const isSelected = selectedAge === age;
                  return (
                    <button
                      key={age}
                      type="button"
                      onClick={() => setSelectedAge(age)}
                      aria-pressed={isSelected}
                      className={`rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
                        isSelected
                          ? "bg-white border-2 border-[#ffa11f] text-[#10292e] ring-2 ring-[#ffa11f]/15"
                          : "bg-white border border-[#d2dcd7] text-[#10292e] hover:border-[#ffa11f]/60"
                      }`}
                    >
                      {age}
                    </button>
                  );
                })}
              </div>
              <p className="text-xs text-[#5a6e70] font-medium mt-2">
                We&apos;ll ask a parent to confirm your account.
              </p>
            </div>

            {/* 2. Coding Experience */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#10292e] tracking-tight mb-3">
                Have you coded before?
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {CODING_EXPERIENCE.map((exp) => {
                  const isSelected = experience === exp;
                  return (
                    <button
                      key={exp}
                      type="button"
                      onClick={() => setExperience(exp)}
                      aria-pressed={isSelected}
                      className={`rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
                        isSelected
                          ? "bg-white border-2 border-[#ffa11f] text-[#10292e] ring-2 ring-[#ffa11f]/15"
                          : "bg-white border border-[#d2dcd7] text-[#10292e] hover:border-[#ffa11f]/60"
                      }`}
                    >
                      {exp}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Learning Style (Pick any) */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#10292e] tracking-tight mb-3">
                How do you like to learn? (pick any)
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {LEARNING_STYLES.map((style) => {
                  const isSelected = learningStyles.includes(style);
                  return (
                    <button
                      key={style}
                      type="button"
                      onClick={() => toggleLearningStyle(style)}
                      aria-pressed={isSelected}
                      className={`rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
                        isSelected
                          ? "bg-white border-2 border-[#ffa11f] text-[#10292e] ring-2 ring-[#ffa11f]/15"
                          : "bg-white border border-[#d2dcd7] text-[#10292e] hover:border-[#ffa11f]/60"
                      }`}
                    >
                      {style}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Gender (optional) */}
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#10292e] tracking-tight mb-3">
                Gender (optional)
              </h2>
              <div className="flex flex-wrap gap-2 sm:gap-2.5">
                {GENDER_OPTIONS.map((g) => {
                  const isSelected = gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(gender === g ? "" : g)}
                      aria-pressed={isSelected}
                      className={`rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
                        isSelected
                          ? "bg-white border-2 border-[#ffa11f] text-[#10292e] ring-2 ring-[#ffa11f]/15"
                          : "bg-white border border-[#d2dcd7] text-[#10292e] hover:border-[#ffa11f]/60"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Start Learning Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="bg-[#ffa11f] hover:brightness-95 active:scale-[0.98] text-[#10292e] font-bold text-base px-9 py-3.5 rounded-full cursor-pointer transition-all shadow-sm flex items-center justify-center disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ffa11f]"
              >
                {loading ? "Starting..." : "Start learning"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
