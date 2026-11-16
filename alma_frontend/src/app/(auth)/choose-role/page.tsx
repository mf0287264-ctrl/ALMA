"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import MangoIcon from "@/components/MangoIcon";

interface RoleOption {
  id: "student" | "teacher" | "parent";
  title: string;
  description: string;
  archColor: string;
  activeBorderColor: string;
  available: boolean;
}

const ROLES: RoleOption[] = [
  {
    id: "student",
    title: "Student",
    description: "I’m learning to code.",
    archColor: "#ffa11f", // Warm mango orange
    activeBorderColor: "#ffa11f",
    available: true,
  },
  {
    id: "teacher",
    title: "Teacher",
    description: "I’m a teacher and want to create lessons.",
    archColor: "#f25c78", // Vibrant rose pink
    activeBorderColor: "#f25c78",
    available: true,
  },
  {
    id: "parent",
    title: "Parent",
    description: "I want to follow my child's progress.",
    archColor: "#7ccbf0", // Sky blue
    activeBorderColor: "#7ccbf0",
    available: true,
  },
];

function ChooseRoleContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "login" ? "login" : "register";

  const [selectedRole, setSelectedRole] = useState<"student" | "teacher" | "parent">("student");

  const handleContinue = () => {
    if (mode === "login") {
      if (selectedRole === "teacher") {
        router.push("/login?role=teacher");
      } else if (selectedRole === "parent") {
        router.push("/login?role=parent");
      } else {
        router.push("/login?role=student");
      }
    } else {
      // mode === 'register'
      if (selectedRole === "teacher") {
        router.push("/register/teacher");
      } else if (selectedRole === "parent") {
        router.push("/register/parent");
      } else {
        router.push("/register");
      }
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fff8ec] flex flex-col justify-center items-center px-6 sm:px-10 py-12 select-none relative animate-fadeIn">
      {/* Top Left Back Navigation */}
      <Link
        href="/welcome"
        className="absolute top-6 left-6 text-sm font-semibold text-[#118a80] hover:text-[#0b6b63] transition-colors flex items-center gap-1.5"
      >
        <span>←</span> Back to Welcome
      </Link>

      <div className="w-full max-w-4xl flex flex-col items-center text-center">
        {/* Optional small mascot */}
        <div className="mb-4 transform hover:scale-105 transition-transform duration-300">
          <MangoIcon size={64} animated />
        </div>

        {/* Header Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#10292e] tracking-tight mb-4">
          Who are you?
        </h1>

        <p className="text-sm sm:text-base text-[#5a6e70] max-w-md mb-10">
          {mode === "login"
            ? "Select your profile type to log into your dedicated dashboard."
            : "Choose how you'll use ALMA so we can tailor your experience."}
        </p>

        {/* 3 Role Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6 w-full max-w-3xl mb-10">
          {ROLES.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                aria-pressed={isSelected}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col items-start text-left bg-white transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md min-h-[190px] ${
                  isSelected
                    ? "ring-2 scale-[1.02]"
                    : "border border-[#d2dcd7] hover:border-[#10292e]/30 hover:scale-[1.01]"
                }`}
                style={{
                  borderColor: isSelected ? role.activeBorderColor : undefined,
                  boxShadow: isSelected ? `0 0 0 2px ${role.activeBorderColor}` : undefined,
                }}
              >
                {/* Arch Icon (Flat bottom, dome top - matches mockup exactly) */}
                <div
                  className="w-12 h-14 rounded-t-full mb-6 transition-transform duration-200"
                  style={{ backgroundColor: role.archColor }}
                />

                {/* Role Title */}
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl sm:text-2xl font-black text-[#10292e]">
                    {role.title}
                  </h3>
                </div>

                {/* Role Description */}
                <p className="text-xs sm:text-sm text-[#5a6e70] font-medium leading-relaxed">
                  {role.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Continue Button */}
        <div className="w-full max-w-sm flex flex-col items-center gap-4">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full bg-[#ffa11f] hover:brightness-95 active:scale-[0.98] text-[#10292e] font-extrabold text-base py-3.5 px-10 rounded-full transition-all shadow-sm cursor-pointer text-center"
          >
            Continue
          </button>

          {/* Mode Switcher */}
          <div className="text-xs sm:text-sm text-[#5a6e70]">
            {mode === "register" ? (
              <p>
                Already have an account?{" "}
                <Link
                  href="/choose-role?mode=login"
                  className="font-bold text-[#118a80] hover:underline"
                >
                  Log in
                </Link>
              </p>
            ) : (
              <p>
                Don&apos;t have an account?{" "}
                <Link
                  href="/choose-role?mode=register"
                  className="font-bold text-[#ffa11f] hover:underline"
                >
                  Create an account
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChooseRolePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#fff8ec] flex items-center justify-center">
          <MangoIcon size={80} animated />
        </div>
      }
    >
      <ChooseRoleContent />
    </Suspense>
  );
}
