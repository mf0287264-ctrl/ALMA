"use client";

import React from "react";
import Link from "next/link";
import MangoIcon from "@/components/MangoIcon";

interface WelcomeScreenProps {
  onBackToSplash?: () => void;
}

export default function WelcomeScreen({ onBackToSplash }: WelcomeScreenProps) {
  return (
    <div className="w-full min-h-screen bg-[#fff8ec] flex flex-col items-center justify-center px-6 py-12 select-none relative animate-fadeIn">
      {onBackToSplash && (
        <button
          type="button"
          onClick={onBackToSplash}
          className="absolute top-6 left-6 text-sm font-semibold text-[#118a80] hover:text-[#0b6b63] transition-colors cursor-pointer flex items-center gap-1.5"
        >
          <span>←</span> Back to Intro
        </button>
      )}

      <div className="w-full max-w-sm flex flex-col items-center text-center">
        {/* Mango Mascot */}
        <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
          <MangoIcon size={160} animated />
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
          Welcome to ALMA
        </h1>

        {/* Subtitle */}
        <p className="mt-3 text-[#5a6e70] text-base leading-relaxed max-w-xs">
          Learn to code with an AI teacher who adapts to you.
        </p>

        {/* Buttons */}
        <div className="w-full mt-8 space-y-3.5">
          <Link
            href="/register"
            className="w-full block bg-[#ffa11f] hover:brightness-95 active:scale-[0.98] text-[#10292e] font-bold py-3.5 px-6 rounded-full transition-all shadow-sm text-center"
          >
            Create an account
          </Link>

          <Link
            href="/login"
            className="w-full block bg-white hover:bg-[#fafaf8] active:scale-[0.98] border-2 border-[#10292e] text-[#10292e] font-bold py-3.5 px-6 rounded-full transition-all shadow-sm text-center"
          >
            Log in
          </Link>
        </div>

        {/* Class Code Link */}
        <div className="mt-4">
          <Link
            href="/class-code"
            className="text-sm font-bold text-[#0b6b63] hover:underline cursor-pointer"
          >
            I have a class code
          </Link>
        </div>

        {/* Terms and Privacy Footer */}
        <p className="mt-7 text-xs text-[#5a6e70] leading-relaxed max-w-xs">
          By continuing you agree to our Terms and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
