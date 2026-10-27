"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAuth } from "@/app/_Context/AuthContext";

interface LearningRole {
  id: string;
  title: string;
  description: string;
  color: string;
}

const ROLES: LearningRole[] = [
  {
    id: "me",
    title: "Me",
    description: "I'm learning to code.",
    color: "#ffa11f", // Mango Orange
  },
  {
    id: "child",
    title: "My child",
    description: "I'm a parent and want to add my child.",
    color: "#88d0f2", // Sky Blue
  },
  {
    id: "class",
    title: "My class",
    description: "I'm a teacher and want to create lessons.",
    color: "#f2617c", // Rose Pink
  },
];

export default function RegisterStepTwoPage() {
  const router = useRouter();
  const { updateUser } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>("me");
  const [schoolName, setSchoolName] = useState<string>("");
  const [nationalId, setNationalId] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    const roleName = ROLES.find((r) => r.id === selectedRole)?.title;

    try {
      const res = await updateUser({
        learning_for: selectedRole,
        school_name: schoolName.trim() || null,
        national_id: nationalId.trim() || null,
      });

      if (!res.success) {
        toast.error(res.error || "Could not save details, continuing...");
      } else {
        toast.success(`Selected: ${roleName}`);
      }
    } catch {
      // Proceed even if network hiccups
    } finally {
      setLoading(false);
      router.push("/register/step-3");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fff8ec] flex flex-col justify-center items-center px-6 sm:px-10 py-12 sm:py-16 select-none">
      <div className="w-full max-w-3xl flex flex-col items-center text-center">
        {/* Step Indicator & Progress Bar */}
        <div className="flex flex-col items-center mb-6">
          <span className="text-xs font-semibold tracking-wider text-[#5a6e70] mb-2 uppercase">
            Step 2 of 3
          </span>
          <div className="w-56 sm:w-64 h-1.5 bg-[#e2e8e4] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#ffa11f] rounded-full transition-all duration-500 ease-out"
              style={{ width: "66.6%" }}
            />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-[2.6rem] font-extrabold text-[#10292e] tracking-tight mb-8 sm:mb-10">
          Who will be learning?
        </h1>

        {/* 3 Role Selection Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5 w-full mb-8">
          {ROLES.map((role) => {
            const isSelected = selectedRole === role.id;
            return (
              <button
                key={role.id}
                type="button"
                onClick={() => setSelectedRole(role.id)}
                aria-pressed={isSelected}
                className={`relative rounded-3xl p-6 sm:p-7 flex flex-col items-start justify-between bg-white text-left transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md ${
                  isSelected
                    ? "border-2 border-[#ffa11f] ring-2 ring-[#ffa11f]/15 scale-[1.02]"
                    : "border border-[#d2dcd7] hover:border-[#ffa11f]/60 hover:scale-[1.01]"
                }`}
              >
                {/* Arch Icon (Dome top, flat bottom) */}
                <div
                  style={{ backgroundColor: role.color }}
                  className="w-10 h-11 rounded-t-full mb-6 shrink-0 shadow-sm"
                  aria-hidden="true"
                />

                {/* Content */}
                <div>
                  <h3 className="text-xl font-extrabold text-[#10292e] mb-2">
                    {role.title}
                  </h3>
                  <p className="text-sm text-[#5a6e70] leading-relaxed">
                    {role.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Optional details (School Name & National ID) */}
        <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-[#d2dcd7] text-left shadow-sm mb-8 space-y-4">
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

        {/* Action Button */}
        <div className="w-full max-w-xs sm:max-w-sm">
          <button
            type="button"
            onClick={handleContinue}
            disabled={loading}
            className="w-full bg-[#ffa11f] hover:brightness-95 active:scale-[0.98] text-[#10292e] font-bold text-base py-3.5 rounded-full cursor-pointer transition-all shadow-sm flex items-center justify-center disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ffa11f]"
          >
            {loading ? "Saving..." : "Continue"}
          </button>
        </div>

        {/* Footer Link */}
        <div className="mt-5">
          <Link
            href="/class-code"
            className="text-sm font-bold text-[#0b6b63] hover:text-[#084e48] hover:underline transition-colors"
          >
            I have a class code from my teacher
          </Link>
        </div>
      </div>
    </div>
  );
}
