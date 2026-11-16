"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MangoIcon from "./MangoIcon";
import { useAuth } from "@/app/_Context/AuthContext";

export interface TeacherNavItem {
  label: string;
  href: string;
  badge?: string;
}

const TEACHER_NAV_ITEMS: TeacherNavItem[] = [
  { label: "Overview", href: "/teacher/dashboard" },
  { label: "Courses", href: "/teacher/courses" },
  { label: "Lessons", href: "/teacher/lessons" },
  { label: "AI Generation", href: "/teacher/ai-generation" },
  { label: "Assessments", href: "/teacher/assessments" },
  { label: "Student Performance", href: "/teacher/students" },
  { label: "Achievements", href: "/teacher/achievements" },
  { label: "Settings", href: "/teacher/settings" },
];

export default function TeacherSidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const teacherName =
    user?.name ||
    (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "Dr. Sara Hassan");
  const teacherCode = user?.teacher_code || "TEA-8402";

  // Get initials for avatar
  const initials = teacherName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "SH";

  return (
    <>
      {/* Mobile Top Header with Hamburger */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#e8eeea] flex items-center justify-between px-5 z-50 select-none shadow-xs">
        <Link href="/teacher/dashboard" className="flex items-center gap-2">
          <MangoIcon size={30} animated />
          <span className="font-extrabold text-lg text-[#10292e]">ALMA</span>
          <span className="bg-[#e6f5f2] text-[#118a80] text-[9px] font-black uppercase px-2 py-0.5 rounded-full ml-1">
            Teacher
          </span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-[#10292e] hover:bg-[#fafaf8] border border-[#e8eeea] cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile Backdrop */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Fixed Desktop Sidebar & Sliding Mobile Drawer */}
      <aside
        className={`w-64 bg-white border-r border-[#e8eeea] flex flex-col justify-between py-7 px-5 select-none fixed top-0 bottom-0 left-0 z-40 transition-transform duration-200 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } ${className}`}
      >
        <div>
          {/* Brand Logo & Teacher Tag */}
          <div className="px-2 mb-7">
            <Link
              href="/teacher/dashboard"
              className="flex items-center gap-2.5 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <MangoIcon size={34} animated className="group-hover:scale-105 transition-transform" />
              <span className="font-black text-2xl tracking-tight text-[#10292e]">
                ALMA
              </span>
            </Link>

            {/* Teacher Workspace Pill */}
            <div className="mt-2.5 inline-block bg-[#eaf6f4] text-[#118a80] text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
              Teacher Workspace
            </div>
          </div>

          {/* Nav Items */}
          <nav className="space-y-1.5">
            {TEACHER_NAV_ITEMS.map((item) => {
              const isActive =
                item.href === "/teacher/dashboard"
                  ? pathname === "/teacher" || pathname === "/teacher/dashboard" || pathname === "/teacher/overview"
                  : pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-sm transition-all duration-150 group cursor-pointer ${
                    isActive
                      ? "bg-[#fff1d6] text-[#10292e] font-black shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                      : "text-[#5a6e70] hover:text-[#10292e] hover:bg-[#fafaf8] font-bold"
                  }`}
                >
                  {/* Circle/Arch indicator matching design */}
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 transition-all ${
                      isActive
                        ? "bg-[#ffa11f] scale-110"
                        : "bg-[#d2dcd7] group-hover:bg-[#a6b8b3]"
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Card */}
        <div className="pt-4 border-t border-[#f0f4f2] px-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5 min-w-0">
              {user?.profile_image ? (
                <img
                  src={user.profile_image}
                  alt={teacherName}
                  className="w-8 h-8 rounded-full object-cover shrink-0 shadow-xs border border-[#118a80]/20"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-[#118a80] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                  {initials}
                </div>
              )}
              <div className="min-w-0">
                <span className="block text-xs font-black text-[#10292e] truncate">
                  {teacherName}
                </span>
                <span className="block text-[11px] text-[#5a6e70] font-medium truncate">
                  {teacherCode} · mock
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              title="Log out"
              className="text-[#83908f] hover:text-red-500 text-xs font-bold p-1 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
