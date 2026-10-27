"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import MangoIcon from "@/components/MangoIcon";
import { useAuth } from "@/app/_Context/AuthContext";

const AGE_OPTIONS = ["Under 10", "10 to 12", "13 to 15", "16 to 18", "19 and over"];
const CODING_EXPERIENCE = ["Never", "A little", "I know the basics"];
const LEARNING_STYLES = ["Pictures", "Step by step", "Trying things", "Examples"];
const GENDER_OPTIONS = ["Female", "Male"];

const AVATAR_OPTIONS = [
  { id: "mango_orange", label: "Orange Mango", color: "#ffa11f" },
  { id: "teal_curious", label: "Teal Explorer", color: "#118a80" },
  { id: "sky_coder", label: "Sky Coder", color: "#7ccbf0" },
  { id: "pink_creator", label: "Pink Creator", color: "#f2617c" },
];

export default function RegisterStepThreePage() {
  const router = useRouter();
  const { updateUser, refreshUser } = useAuth();

  // Personalization fields
  const [gender, setGender] = useState<string>("Female");
  const [selectedAge, setSelectedAge] = useState<string>("13 to 15");
  const [experience, setExperience] = useState<string>("A little");
  const [learningStyles, setLearningStyles] = useState<string[]>(["Pictures", "Trying things"]);
  const [selectedAvatar, setSelectedAvatar] = useState<string>("#ffa11f");

  // Optional student fields
  const [schoolName, setSchoolName] = useState<string>("");
  const [address, setAddress] = useState<string>("");
  const [nationalId, setNationalId] = useState<string>("");

  // Diagnostic Quiz fields
  const [quiz1, setQuiz1] = useState<string>("Follow clear, step-by-step instructions");
  const [quiz2, setQuiz2] = useState<string>("2 steps forward");
  const [loading, setLoading] = useState(false);

  const toggleLearningStyle = (style: string) => {
    if (learningStyles.includes(style)) {
      setLearningStyles(learningStyles.filter((s) => s !== style));
    } else {
      setLearningStyles([...learningStyles, style]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!gender) {
      toast.error("Please select your gender.");
      return;
    }

    setLoading(true);

    try {
      const quizData = [
        {
          question: "What does code tell a computer to do?",
          answer: quiz1,
          is_correct: quiz1 === "Follow clear, step-by-step instructions",
        },
        {
          question: "Logic Challenge: If Mango walks 3 steps forward and 1 step back, where is Mango?",
          answer: quiz2,
          is_correct: quiz2 === "2 steps forward",
        },
      ];

      const res = await updateUser({
        gender,
        age_group: selectedAge,
        coding_experience: experience,
        learning_styles: learningStyles,
        school_name: schoolName.trim() || null,
        address: address.trim() || null,
        national_id: nationalId.trim() || null,
        profile_image: selectedAvatar,
        quiz_answers: quizData,
      });

      if (!res.success) {
        toast.error(res.error || "Could not save preferences, continuing to dashboard...");
      } else {
        toast.success("Profile setup & diagnostic quiz complete! Welcome to ALMA.");
      }

      await refreshUser();
      router.push("/home");
    } catch {
      toast.error("An unexpected error occurred. Continuing to home.");
      router.push("/home");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      {/* Left Column (Desktop Only: lg and up) */}
      <div className="hidden lg:flex lg:w-1/2 min-h-screen bg-[#118a80] flex-col items-center justify-center p-12 select-none sticky top-0 h-screen">
        <div className="transform hover:scale-105 transition-transform duration-300 mb-8">
          <MangoIcon size={190} animated className="drop-shadow-lg" />
        </div>

        {/* Mascot Speech Bubble */}
        <div className="bg-white text-[#10292e] rounded-2xl py-4 px-6 shadow-md max-w-xs text-left">
          <p className="font-bold text-base leading-snug">
            A quick quiz and a few questions so I can teach you your way!
          </p>
        </div>
      </div>

      {/* Right Column (Mobile, Tablet & Desktop) */}
      <div className="w-full lg:w-1/2 min-h-screen bg-[#fff8ec] flex flex-col justify-start px-6 sm:px-12 md:px-16 lg:px-20 py-10 sm:py-14 select-none overflow-y-auto">
        <div className="w-full max-w-lg mx-auto lg:mx-0">
          {/* Step Indicator */}
          <div className="flex flex-col mb-6">
            <span className="text-xs font-semibold tracking-wider text-[#5a6e70] mb-2 uppercase">
              Step 2 of 2: Collect Profile & Quiz
            </span>
            <div className="w-48 h-1.5 bg-[#e2e8e4] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#ffa11f] rounded-full transition-all duration-500 ease-out"
                style={{ width: "100%" }}
              />
            </div>
          </div>

          {/* Mobile/Tablet Mascot & Speech Bubble Header */}
          <div className="lg:hidden flex items-center gap-3.5 mb-6 bg-white/70 p-3.5 rounded-2xl border border-[#d2dcd7]">
            <MangoIcon size={46} animated className="shrink-0" />
            <p className="font-bold text-xs sm:text-sm text-[#10292e] leading-snug">
              A quick quiz and a few questions so I can teach you your way!
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
            {/* 1. Choose Gender */}
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#10292e] tracking-tight mb-2.5">
                Choose your gender
              </h2>
              <div className="flex flex-wrap gap-2.5">
                {GENDER_OPTIONS.map((g) => {
                  const isSelected = gender === g;
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGender(g)}
                      aria-pressed={isSelected}
                      className={`rounded-full px-6 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-[0_1px_2px_rgba(0,0,0,0.03)] ${
                        isSelected
                          ? "bg-white border-2 border-[#ffa11f] text-[#10292e] ring-2 ring-[#ffa11f]/15 scale-105"
                          : "bg-white border border-[#d2dcd7] text-[#10292e] hover:border-[#ffa11f]/60"
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Age Question */}
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#10292e] tracking-tight mb-2.5">
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
            </div>

            {/* 3. Coding Experience */}
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#10292e] tracking-tight mb-2.5">
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

            {/* 4. Learning Style (Pick any) */}
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#10292e] tracking-tight mb-2.5">
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

            {/* 5. Optional Student Information Card (school_name, address, national_id) */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#d2dcd7] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#10292e] uppercase tracking-wider">
                Optional Information
              </h3>

              <div>
                <label
                  htmlFor="school_name"
                  className="block text-xs font-bold text-[#10292e] mb-1"
                >
                  School or Academy Name (optional)
                </label>
                <input
                  id="school_name"
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Cairo STEM School"
                  className="w-full rounded-2xl border border-[#d2dcd7] bg-[#fff8ec]/50 px-4 py-2.5 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#118a80] transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="address"
                  className="block text-xs font-bold text-[#10292e] mb-1"
                >
                  Address / City (optional)
                </label>
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Cairo, Nasr City"
                  className="w-full rounded-2xl border border-[#d2dcd7] bg-[#fff8ec]/50 px-4 py-2.5 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#118a80] transition-all"
                />
              </div>

              <div>
                <label
                  htmlFor="national_id"
                  className="block text-xs font-bold text-[#10292e] mb-1"
                >
                  National ID or Student ID (optional)
                </label>
                <input
                  id="national_id"
                  type="text"
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value)}
                  placeholder="e.g. 29901011234567"
                  className="w-full rounded-2xl border border-[#d2dcd7] bg-[#fff8ec]/50 px-4 py-2.5 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#118a80] transition-all"
                />
              </div>
            </div>

            {/* 6. Avatar Theme (profile_image) */}
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-[#10292e] tracking-tight mb-2.5">
                Pick your avatar style
              </h2>
              <div className="flex flex-wrap gap-3">
                {AVATAR_OPTIONS.map((avatar) => {
                  const isSelected = selectedAvatar === avatar.color;
                  return (
                    <button
                      key={avatar.id}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar.color)}
                      aria-pressed={isSelected}
                      className={`flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-bold transition-all cursor-pointer shadow-sm ${
                        isSelected
                          ? "bg-white border-2 border-[#ffa11f] ring-2 ring-[#ffa11f]/15 scale-105"
                          : "bg-white border border-[#d2dcd7] hover:border-[#ffa11f]/60"
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full inline-block shadow-xs"
                        style={{ backgroundColor: avatar.color }}
                      />
                      <span>{avatar.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 7. Diagnostic Quiz Section */}
            <div className="bg-white rounded-3xl p-6 border-2 border-[#ffd84a] shadow-sm space-y-5">
              <div className="flex items-center gap-2">
                <span className="bg-[#ffd84a] text-[#10292e] text-xs font-black px-3 py-1 rounded-full uppercase">
                  Diagnostic Quiz
                </span>
                <span className="text-xs font-bold text-[#5a6e70]">
                  Help us adapt lessons to your thinking
                </span>
              </div>

              {/* Quiz Q1 */}
              <div>
                <h3 className="text-sm font-bold text-[#10292e] mb-2">
                  1. What does code tell a computer to do?
                </h3>
                <div className="space-y-2">
                  {[
                    "Follow clear, step-by-step instructions",
                    "Guess what you want automatically",
                    "Generate physical paper documents",
                  ].map((ans) => (
                    <button
                      key={ans}
                      type="button"
                      onClick={() => setQuiz1(ans)}
                      className={`w-full text-left text-xs sm:text-sm font-semibold rounded-xl px-4 py-3 transition-all cursor-pointer ${
                        quiz1 === ans
                          ? "bg-[#118a80] text-white shadow-sm"
                          : "bg-[#fff8ec] text-[#10292e] border border-[#d2dcd7] hover:border-[#118a80]"
                      }`}
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiz Q2 */}
              <div>
                <h3 className="text-sm font-bold text-[#10292e] mb-2">
                  2. Logic challenge: If Mango walks 3 steps forward and 1 step back, where is Mango?
                </h3>
                <div className="space-y-2">
                  {["2 steps forward", "4 steps forward", "Back at the start"].map((ans) => (
                    <button
                      key={ans}
                      type="button"
                      onClick={() => setQuiz2(ans)}
                      className={`w-full text-left text-xs sm:text-sm font-semibold rounded-xl px-4 py-3 transition-all cursor-pointer ${
                        quiz2 === ans
                          ? "bg-[#118a80] text-white shadow-sm"
                          : "bg-[#fff8ec] text-[#10292e] border border-[#d2dcd7] hover:border-[#118a80]"
                      }`}
                    >
                      {ans}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Start Learning Button */}
            <div className="pt-2 pb-6">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-[#ffa11f] hover:brightness-95 active:scale-[0.98] text-[#10292e] font-bold text-base px-10 py-3.5 rounded-full cursor-pointer transition-all shadow-sm flex items-center justify-center disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ffa11f]"
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
