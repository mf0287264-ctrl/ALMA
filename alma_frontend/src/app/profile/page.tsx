"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/app/_Context/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const fullName = user?.first_name
    ? `${user.first_name} ${user.last_name || ""}`.trim()
    : user?.name || "Student User";

  const initials = fullName
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "ST";

  const streak = user?.current_streak ?? 0;
  const gradeLevel = user?.grade_level || "Grade 8";
  const lessons = user?.lessons_completed ?? 0;

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
  };

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      {/* Sidebar Selector Component */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen bg-[#fff8ec] px-6 sm:px-10 lg:px-12 py-8 sm:py-10 overflow-y-auto pb-24 md:pb-10 select-none">
        {/* User Identity Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-sm flex items-center gap-5 sm:gap-6 mb-6">
          {/* Avatar Arch with initials */}
          <div className="w-18 h-20 bg-[#ffa11f] rounded-t-full flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-xl sm:text-2xl font-extrabold text-[#10292e] tracking-tight">
              {initials}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#10292e] tracking-tight">
              {fullName}
            </h1>
            <p className="text-sm font-semibold text-[#5a6e70] mt-1">
              {gradeLevel} · {user?.email || ""}
            </p>
          </div>
        </div>

        {/* 4 Stat Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-6">
          {/* 1. Days Streak */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e8eeea] shadow-sm flex flex-col justify-between">
            <div className="w-8 h-1.5 bg-[#ffd84a] rounded-full mb-3" />
            <span className="text-2xl sm:text-3xl font-extrabold text-[#10292e]">
              {streak}
            </span>
            <span className="text-xs text-[#5a6e70] font-semibold mt-1">
              Days streak
            </span>
          </div>

          {/* 2. Rank */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e8eeea] shadow-sm flex flex-col justify-between">
            <div className="w-8 h-1.5 bg-[#b2c9be] rounded-full mb-3" />
            <span className="text-2xl sm:text-3xl font-extrabold text-[#10292e]">
              Silver
            </span>
            <span className="text-xs text-[#5a6e70] font-semibold mt-1">
              Rank
            </span>
          </div>

          {/* 3. Lessons */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e8eeea] shadow-sm flex flex-col justify-between">
            <div className="w-8 h-1.5 bg-[#7ccbf0] rounded-full mb-3" />
            <span className="text-2xl sm:text-3xl font-extrabold text-[#10292e]">
              {lessons}
            </span>
            <span className="text-xs text-[#5a6e70] font-semibold mt-1">
              Lessons
            </span>
          </div>

          {/* 4. Badges */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e8eeea] shadow-sm flex flex-col justify-between">
            <div className="w-8 h-1.5 bg-[#f25c78] rounded-full mb-3" />
            <span className="text-2xl sm:text-3xl font-extrabold text-[#10292e]">
              Badges
            </span>
            <button
              type="button"
              onClick={() => toast.info("Opening all badges...")}
              className="text-xs text-[#5a6e70] font-semibold mt-1 text-left hover:underline cursor-pointer"
            >
              See all
            </button>
          </div>
        </div>

        {/* Account Settings List */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-sm">
          <h2 className="text-lg font-extrabold text-[#10292e] mb-2">
            Account
          </h2>

          <div className="divide-y divide-[#f0f4f2]">
            {/* Learning preferences */}
            <button
              type="button"
              onClick={() => router.push("/register/step-3")}
              className="w-full py-4 flex items-center justify-between text-left text-sm font-bold text-[#10292e] hover:text-[#118a80] transition-colors cursor-pointer"
            >
              <span>Learning preferences</span>
              <span className="text-[#83908f] font-normal text-base">›</span>
            </button>

            {/* Language */}
            <div className="w-full py-4 flex items-center justify-between text-sm font-bold text-[#10292e]">
              <span>Language</span>
              <span className="text-[#5a6e70] font-semibold text-xs sm:text-sm">
                English
              </span>
            </div>

            {/* Notifications */}
            <button
              type="button"
              onClick={() => toast.info("Notifications settings")}
              className="w-full py-4 flex items-center justify-between text-left text-sm font-bold text-[#10292e] hover:text-[#118a80] transition-colors cursor-pointer"
            >
              <span>Notifications</span>
              <span className="text-[#83908f] font-normal text-base">›</span>
            </button>

            {/* Parent access */}
            <button
              type="button"
              onClick={() => toast.info("Parent access settings")}
              className="w-full py-4 flex items-center justify-between text-left text-sm font-bold text-[#10292e] hover:text-[#118a80] transition-colors cursor-pointer"
            >
              <span>Parent access</span>
              <span className="text-[#83908f] font-normal text-base">›</span>
            </button>

            {/* Help */}
            <button
              type="button"
              onClick={() => toast.info("Opening Help center...")}
              className="w-full py-4 flex items-center justify-between text-left text-sm font-bold text-[#10292e] hover:text-[#118a80] transition-colors cursor-pointer"
            >
              <span>Help</span>
              <span className="text-[#83908f] font-normal text-base">›</span>
            </button>

            {/* Log out */}
            <div className="pt-4">
              <button
                type="button"
                onClick={handleLogout}
                className="text-sm font-bold text-[#cc4d4c] hover:underline cursor-pointer"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
