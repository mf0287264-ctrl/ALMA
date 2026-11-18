"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MangoIcon from "./MangoIcon";
import { useAuth } from "@/app/_Context/AuthContext";
import {
  LayoutGrid,
  BookOpen,
  BookMarked,
  FileCheck,
  CheckSquare,
  Sparkles,
  Trophy,
  Award,
  User,
  MessageSquare,
  Menu,
  X,
  LogOut
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const STUDENT_SECTIONS: NavSection[] = [
  {
    title: "LEARN",
    items: [
      { label: "Home", href: "/home", icon: LayoutGrid },
      { label: "Courses", href: "/courses", icon: BookOpen },
      { label: "My lessons", href: "/my-lessons", icon: BookMarked },
      { label: "Assessments", href: "/assessments", icon: FileCheck },
      { label: "Quizzes", href: "/quize", icon: CheckSquare },
    ],
  },
  {
    title: "GROW",
    items: [
      { label: "AI journey", href: "/ai-lesson", icon: Sparkles },
      { label: "Competition", href: "/compete", icon: Trophy },
      { label: "Achievements", href: "/achievements", icon: Award },
      { label: "Profile", href: "/profile", icon: User },
    ],
  },
  {
    title: "CONNECT",
    items: [
      { label: "Teachers", href: "/teachers", icon: MessageSquare, badge: 3 },
    ],
  },
];

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const studentName =
    user?.name ||
    (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "Layla Hassan");
  const studentCode = user?.student_code || "STU-1102";
  const gradeLevel = user?.grade_level || "Grade 8";

  const initials =
    studentName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "LH";

  const isActive = (href: string) => {
    if (href === "/home") return pathname === "/home";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#e8eeea] flex items-center justify-between px-5 z-50 select-none shadow-xs">
        <Link href="/home" className="flex items-center gap-2">
          <MangoIcon size={28} animated />
          <span className="font-extrabold text-lg text-[#10292e]">ALMA</span>
          <span className="bg-[#dff0fa] text-[#2b88d8] text-[9px] font-black uppercase px-2 py-0.5 rounded-full ml-1">
            Student
          </span>
        </Link>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl text-[#10292e] hover:bg-[#fafaf8] border border-[#e8eeea] cursor-pointer"
          aria-label="Toggle Navigation"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col justify-between p-5 pt-20 z-50 overflow-y-auto">
            <div className="space-y-6">
              {STUDENT_SECTIONS.map((section) => (
                <div key={section.title} className="space-y-1">
                  <span className="text-[10px] font-bold text-[#8a999b] uppercase tracking-wider px-3 block">
                    {section.title}
                  </span>
                  {section.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                          active
                            ? "bg-[#fff7ee] text-[#10292e] font-bold border-l-4 border-[#ffa11f]"
                            : "text-[#607274] hover:text-[#10292e] hover:bg-[#fafaf8] border-l-4 border-transparent"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon size={18} className={active ? "text-[#ffa11f]" : "text-[#8a999b]"} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span className="w-5 h-5 rounded-full bg-[#ffa11f] text-[#10292e] text-[10px] font-black flex items-center justify-center">
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-[#e8eeea] mt-6">
              <p className="text-[11px] text-[#8a999b] mb-3 font-medium">Small steps. Bright futures.</p>
              <div className="flex items-center gap-3 p-2 rounded-xl bg-[#fafaf8]">
                <div className="w-9 h-9 rounded-full bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center font-bold text-xs border border-[#e9d5ff]">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#10292e] truncate">{studentName}</p>
                  <p className="text-[10px] text-[#8a999b]">{studentCode} · {gradeLevel}</p>
                </div>
                <button
                  onClick={() => logout()}
                  title="Log out"
                  className="p-1.5 text-[#8a999b] hover:text-red-500 rounded-lg hover:bg-white"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Fixed Left Sidebar */}
      <aside
        className={`hidden lg:flex w-64 h-screen fixed left-0 top-0 bg-white border-r border-[#e8eeea] flex-col justify-between select-none z-30 ${className}`}
      >
        <div className="overflow-y-auto flex-1 py-6 px-4 space-y-6">
          {/* Logo & Student Tag */}
          <div className="px-3 pb-2 flex items-center gap-2">
            <Link href="/home" className="flex items-center gap-2">
              <MangoIcon size={32} animated />
              <span className="font-black text-xl text-[#10292e] tracking-tight">ALMA</span>
              <span className="bg-[#dff0fa] text-[#2b88d8] text-[10px] font-bold px-2 py-0.5 rounded-md ml-1">
                Student
              </span>
            </Link>
          </div>

          {/* Sections List */}
          {STUDENT_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              <span className="text-[11px] font-black text-[#8a999b] uppercase tracking-wider px-3 block mb-1.5">
                {section.title}
              </span>
              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                        active
                          ? "bg-[#fff7ee] text-[#10292e] font-extrabold border-l-4 border-[#ffa11f]"
                          : "text-[#607274] hover:text-[#10292e] hover:bg-[#fafaf8] border-l-4 border-transparent font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          size={18}
                          className={active ? "text-[#ffa11f]" : "text-[#7f9092]"}
                        />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span className="w-5 h-5 rounded-full bg-[#ffa11f] text-[#10292e] text-[10px] font-black flex items-center justify-center">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom Profile Badge & Quote */}
        <div className="p-4 border-t border-[#f4f4f2] bg-white">
          <p className="text-[11px] text-[#8a999b] px-2 mb-3 font-medium">Small steps. Bright futures.</p>
          <div className="flex items-center gap-3 px-3 py-2 rounded-2xl bg-[#fafaf8] border border-[#f0ede4]">
            <div className="w-9 h-9 rounded-full bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center font-black text-xs border border-[#e9d5ff] shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#10292e] truncate">{studentName}</p>
              <p className="text-[10px] text-[#8a999b]">{studentCode} · {gradeLevel}</p>
            </div>
            <button
              onClick={() => logout()}
              title="Log out"
              className="text-[#a0afb1] hover:text-red-500 p-1.5 rounded-lg hover:bg-white transition-colors cursor-pointer"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
