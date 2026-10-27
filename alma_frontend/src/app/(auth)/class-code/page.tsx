"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import MangoIcon from "@/components/MangoIcon";

const CODE_LENGTH = 6;

export default function ClassCodePage() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [focusedIndex, setFocusedIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, val: string) => {
    // Only accept alphanumeric characters
    const char = val.slice(-1).toUpperCase();
    if (char && !/^[A-Z0-9]$/.test(char)) return;

    const newCode = [...code];
    newCode[index] = char;
    setCode(newCode);

    // Auto-advance to next input
    if (char && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace") {
      if (!code[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      } else {
        const newCode = [...code];
        newCode[index] = "";
        setCode(newCode);
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData
      .getData("text")
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, CODE_LENGTH);

    if (pastedData) {
      const newCode = [...code];
      for (let i = 0; i < pastedData.length; i++) {
        newCode[i] = pastedData[i];
      }
      setCode(newCode);
      const nextFocus = Math.min(pastedData.length, CODE_LENGTH - 1);
      inputRefs.current[nextFocus]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length < CODE_LENGTH) {
      toast.error(`Please enter the complete ${CODE_LENGTH}-character class code.`);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success(`Joined class with code: ${fullCode}!`);
      router.push("/quize");
    }, 700);
  };

  return (
    <div className="w-full min-h-screen bg-[#fff8ec] flex flex-col justify-center items-center px-6 sm:px-12 py-10 sm:py-16 select-none">
      <div className="w-full max-w-sm sm:max-w-md flex flex-col items-center text-center">
        {/* Large Mango Mascot */}
        <div className="mb-6 transform hover:scale-105 transition-transform duration-300">
          <MangoIcon size={145} animated className="drop-shadow-md" />
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
          Join your class
        </h1>

        {/* Subtitle */}
        <p className="mt-2 text-[#5a6e70] text-sm sm:text-base">
          Enter the code your teacher gave you.
        </p>

        {/* Code Input Form */}
        <form onSubmit={handleSubmit} className="w-full mt-7 flex flex-col items-center">
          {/* 6-box OTP / Code input grid */}
          <div className="flex items-center justify-center gap-2 sm:gap-3 w-full">
            {code.map((char, index) => {
              const isFocused = focusedIndex === index;
              return (
                <input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="text"
                  maxLength={1}
                  value={char}
                  onFocus={() => setFocusedIndex(index)}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={handlePaste}
                  aria-label={`Digit ${index + 1} of class code`}
                  className={`w-11 h-14 sm:w-14 sm:h-16 rounded-2xl bg-white text-xl sm:text-2xl font-extrabold text-[#10292e] uppercase text-center transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:outline-none ${
                    isFocused
                      ? "border-2 border-[#118a80] ring-2 ring-[#118a80]/20"
                      : "border border-[#d2dcd7] hover:border-[#118a80]/60"
                  }`}
                />
              );
            })}
          </div>

          {/* Join class Button */}
          <div className="w-full max-w-[340px] sm:max-w-[370px] mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffa11f] hover:brightness-95 active:scale-[0.98] text-[#10292e] font-bold text-base py-3.5 rounded-full cursor-pointer transition-all shadow-sm flex items-center justify-center disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ffa11f]"
            >
              {loading ? "Joining..." : "Join class"}
            </button>
          </div>

          {/* Footer Link */}
          <p className="text-center text-sm text-[#5a6e70] mt-6">
            Don&apos;t have a code?{" "}
            <Link
              href="/register"
              className="font-bold text-[#0b6b63] hover:text-[#084e48] hover:underline transition-colors"
            >
              Create a personal account
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
