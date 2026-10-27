"use client";

import React, { useState } from "react";
import MangoIcon from "@/components/MangoIcon";
import ChatIllustration from "./ChatIllustration";
import LeaderboardIllustration from "./LeaderboardIllustration";
import WelcomeScreen from "./WelcomeScreen";

export interface OnboardingSlide {
  id: number;
  stepNumber: string;
  title: string;
  description: string;
  bgColor: string;
  illustration: React.ReactNode;
}

const slides: OnboardingSlide[] = [
  {
    id: 1,
    stepNumber: "1 / 3",
    title: "Learn at your pace",
    description:
      "ALMA adapts each lesson to the way you learn best: pictures, step by step, trying things or examples.",
    bgColor: "#118a80",
    illustration: <MangoIcon size={180} animated className="drop-shadow-md" />,
  },
  {
    id: 2,
    stepNumber: "2 / 3",
    title: "Talk to your AI teacher",
    description: "Ask questions anytime. ALMA explains things your way.",
    bgColor: "#7ccbf0",
    illustration: <ChatIllustration />,
  },
  {
    id: 3,
    stepNumber: "3 / 3",
    title: "Play and compete",
    description:
      "Challenge friends in 1v1 duels and climb the leaderboard.",
    bgColor: "#f25c78",
    illustration: <LeaderboardIllustration />,
  },
];

export default function OnboardingSlider() {
  const [currentStep, setCurrentStep] = useState(0);
  const [showWelcome, setShowWelcome] = useState(false);
  const [animating, setAnimating] = useState(false);

  const totalSteps = slides.length;
  const slide = slides[currentStep];

  const changeStep = (newIndex: number) => {
    if (animating || newIndex === currentStep || newIndex < 0 || newIndex >= totalSteps) {
      return;
    }
    setAnimating(true);
    setTimeout(() => {
      setCurrentStep(newIndex);
      setAnimating(false);
    }, 180);
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      changeStep(currentStep + 1);
    } else {
      setShowWelcome(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      changeStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    setShowWelcome(true);
  };

  if (showWelcome) {
    return <WelcomeScreen onBackToSplash={() => setShowWelcome(false)} />;
  }

  return (
    <div className="w-full min-h-screen flex flex-col md:flex-row bg-[#fff8ec]">
      {/* Left Column: Colored Panel with dynamic smooth transition */}
      <div
        style={{ backgroundColor: slide.bgColor }}
        className="w-full md:w-1/2 min-h-[46vh] md:min-h-screen flex items-center justify-center p-6 transition-colors duration-500 ease-in-out"
      >
        <div
          className={`transform transition-all duration-200 ease-out flex items-center justify-center w-full ${
            animating ? "scale-90 opacity-40 translate-y-3" : "scale-100 opacity-100 translate-y-0"
          }`}
        >
          {slide.illustration}
        </div>
      </div>

      {/* Right Column: Warm Cream Content Panel */}
      <div className="w-full md:w-1/2 min-h-[54vh] md:min-h-screen bg-[#fff8ec] flex flex-col justify-between px-8 sm:px-14 md:px-16 lg:px-24 py-8 md:py-14 select-none">
        {/* Top Header: Step Counter & Skip */}
        <div className="flex items-center justify-between w-full max-w-lg mx-auto md:mx-0">
          <span className="text-sm font-semibold tracking-wider text-[#10292e]/80">
            {slide.stepNumber}
          </span>
          <button
            type="button"
            onClick={handleSkip}
            className="text-sm font-bold text-[#118a80] hover:text-[#0c6b63] transition-colors cursor-pointer py-1 px-2 rounded focus:outline-none focus-visible:ring-2 focus-visible:ring-[#118a80]"
          >
            Skip
          </button>
        </div>

        {/* Center Content: Title, Description, Dots, Action Buttons */}
        <div className="w-full max-w-lg mx-auto md:mx-0 my-auto py-6 sm:py-8">
          <div
            className={`transition-all duration-200 ease-out ${
              animating
                ? "opacity-0 translate-y-2"
                : "opacity-100 translate-y-0"
            }`}
          >
            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-extrabold text-[#10292e] tracking-tight leading-[1.15]">
              {slide.title}
            </h1>

            {/* Description */}
            <p className="mt-5 text-[#5a6e70] text-base sm:text-lg leading-relaxed max-w-md">
              {slide.description}
            </p>

            {/* Step Indicators (Dots) */}
            <div className="flex items-center gap-2 mt-8 mb-7" role="tablist" aria-label="Slides">
              {slides.map((_, idx) => {
                const isActive = idx === currentStep;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => changeStep(idx)}
                    aria-label={`Go to slide ${idx + 1}`}
                    aria-selected={isActive}
                    role="tab"
                    className={`transition-all duration-300 rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#ffa11f] ${
                      isActive
                        ? "w-8 h-2.5 bg-[#ffa11f]"
                        : "w-2.5 h-2.5 bg-[#c8cfcb] hover:bg-[#b0b8b3]"
                    }`}
                  />
                );
              })}
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-3">
              {/* Primary Action Button (Next or Get started) */}
              <button
                type="button"
                onClick={handleNext}
                className="bg-[#ffa11f] hover:brightness-95 active:scale-95 text-[#10292e] font-bold text-base px-8 sm:px-9 py-3 rounded-full cursor-pointer transition-all duration-200 shadow-sm inline-flex items-center justify-center min-w-[110px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ffa11f]"
              >
                {currentStep === totalSteps - 1 ? "Get started" : "Next"}
              </button>

              {/* Back Button (Only on Page 2 and Page 3) */}
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="bg-white hover:bg-[#fafaf8] active:scale-95 border-2 border-[#10292e] text-[#10292e] font-bold text-base px-8 sm:px-9 py-2.5 rounded-full cursor-pointer transition-all duration-200 shadow-sm inline-flex items-center justify-center min-w-[100px] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#10292e]"
                >
                  Back
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bottom spacing / alignment block */}
        <div className="hidden md:block h-4" aria-hidden="true" />
      </div>
    </div>
  );
}
