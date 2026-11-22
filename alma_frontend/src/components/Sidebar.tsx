"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MangoIcon from "./MangoIcon";
import { useAuth } from "@/app/_Context/AuthContext";
import { useSidebar } from "@/app/_Context/SidebarContext";
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
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Mail,
  Bell,
  Settings,
  Compass,
} from "lucide-react";
import FriendsPopover from "./FriendsPopover";
import MessagesPopover from "./MessagesPopover";
import { toast } from "sonner";

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
      { label: "Feeds", href: "/feeds", icon: Compass },
      { label: "Teachers", href: "/teachers", icon: MessageSquare, badge: 0 },
    ],
  },
];

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isCollapsed, isAnimating, toggleCollapsed } = useSidebar();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [friendsPopoverOpen, setFriendsPopoverOpen] = useState(false);
  const [messagesPopoverOpen, setMessagesPopoverOpen] = useState(false);

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
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col justify-between p-5 pt-20 z-50 sidebar-tabs-slider">
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
                        {item.badge !== undefined && item.badge !== null && (
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

              {/* 4 Social / Quick action icons */}
              <div className="flex items-center justify-around pt-3 mt-2 border-t border-[#f0ede4]">
                <button
                  data-popover-trigger="friends"
                  onClick={() => {
                    setFriendsPopoverOpen((prev) => !prev);
                    setMessagesPopoverOpen(false);
                  }}
                  title="Friends & Requests"
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    friendsPopoverOpen
                      ? "bg-[#ffa11f]/20 text-[#10292e] font-bold"
                      : "text-[#7a8a8c] hover:text-[#10292e] hover:bg-[#f0ede4]"
                  }`}
                >
                  <Users size={18} />
                </button>
                <button
                  data-popover-trigger="messages"
                  onClick={() => {
                    setMessagesPopoverOpen((prev) => !prev);
                    setFriendsPopoverOpen(false);
                  }}
                  title="Messages"
                  className={`p-2 rounded-xl transition-colors cursor-pointer ${
                    messagesPopoverOpen
                      ? "bg-[#ffa11f]/20 text-[#10292e] font-bold"
                      : "text-[#7a8a8c] hover:text-[#10292e] hover:bg-[#f0ede4]"
                  }`}
                >
                  <Mail size={18} />
                </button>
                <button
                  onClick={() => toast.info("You're all caught up! No unread notifications.")}
                  title="Notifications"
                  className="p-2 rounded-xl text-[#7a8a8c] hover:text-[#10292e] hover:bg-[#f0ede4] transition-colors"
                >
                  <Bell size={18} />
                </button>
                <Link
                  href="/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  title="Settings"
                  className="p-2 rounded-xl text-[#7a8a8c] hover:text-[#10292e] hover:bg-[#f0ede4] transition-colors"
                >
                  <Settings size={18} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sticky In-Flow Sidebar (Fitted to 100vh with no overflow/slide) */}
      <aside
        className={`hidden lg:flex flex-col justify-between select-none z-30 sticky top-0 h-screen shrink-0 bg-white border-r border-[#e8eeea] overflow-hidden ${
          isAnimating ? "transition-[width] duration-250 ease-in-out" : "transition-none"
        } ${
          isCollapsed ? "w-20" : "w-60"
        } ${className}`}
      >
        {/* Top Navigation Area - Compact so it fits on all screens */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-3 px-2.5 space-y-2">
          {/* Header with Logo and Collapse/Expand Toggle */}
          <div
            className={`flex items-center ${
              isCollapsed ? "flex-col gap-2 justify-center" : "justify-between px-2"
            } pb-2 border-b border-[#f4f4f2]`}
          >
            <Link
              href="/home"
              className={`flex items-center gap-2 ${isCollapsed ? "justify-center" : ""}`}
              title="ALMA Student Portal"
            >
              <MangoIcon size={isCollapsed ? 26 : 28} animated />
              {!isCollapsed && (
                <>
                  <span className="font-black text-lg text-[#10292e] tracking-tight">ALMA</span>
                  <span className="bg-[#dff0fa] text-[#2b88d8] text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ml-0.5">
                    Student
                  </span>
                </>
              )}
            </Link>

            <button
              onClick={toggleCollapsed}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              className="p-1 rounded-lg text-[#8a999b] hover:text-[#10292e] hover:bg-[#f1f3f2] transition-colors cursor-pointer"
            >
              {isCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
            </button>
          </div>

          {/* Sections List */}
          {STUDENT_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-0.5">
              {!isCollapsed && (
                <span className="text-[10px] font-black text-[#8a999b] uppercase tracking-wider px-2.5 block mb-1">
                  {section.title}
                </span>
              )}
              {isCollapsed && (
                <div className="w-full flex justify-center my-1">
                  <span className="w-6 h-[1px] bg-[#e8eeea]" />
                </div>
              )}

              <nav className="space-y-0.5">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={isCollapsed ? item.label : undefined}
                      className={`relative flex items-center ${
                        isCollapsed
                          ? "justify-center p-2 rounded-xl"
                          : "justify-between px-2.5 py-1.5 rounded-xl"
                      } text-xs ${
                        isAnimating ? "transition-colors duration-150" : "transition-none"
                      } ${
                        active
                          ? "bg-[#fff7ee] text-[#10292e] font-black border-l-4 border-[#ffa11f]"
                          : "text-[#607274] hover:text-[#10292e] hover:bg-[#fafaf8] border-l-4 border-transparent font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          size={16}
                          className={active ? "text-[#ffa11f]" : "text-[#7f9092]"}
                        />
                        {!isCollapsed && <span className="font-bold text-xs">{item.label}</span>}
                      </div>

                      {/* Badge indicator */}
                      {item.badge !== undefined && item.badge !== null &&
                        (isCollapsed ? (
                          <span className="absolute top-1 right-1 w-3.5 h-3.5 rounded-full bg-[#ffa11f] text-[#10292e] text-[8px] font-black flex items-center justify-center shadow-xs">
                            {item.badge}
                          </span>
                        ) : (
                          <span className="w-4 h-4 rounded-full bg-[#ffa11f] text-[#10292e] text-[9px] font-black flex items-center justify-center">
                            {item.badge}
                          </span>
                        ))}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        {/* Bottom Student Profile Card with integrated action icons */}
        <div className="p-2 border-t border-[#f0ede4] bg-white relative shrink-0">
          <div
            className={`rounded-2xl bg-[#fafaf8] border border-[#f0ede4] transition-all ${
              isCollapsed ? "p-1.5 flex flex-col items-center gap-1" : "p-2"
            }`}
          >
            {/* User row: Avatar + Name + Logout */}
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"}`}>
              <div
                title={`${studentName} (${studentCode} · ${gradeLevel})`}
                className="w-7 h-7 rounded-full bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center font-black text-[11px] border border-[#e9d5ff] shrink-0"
              >
                {initials}
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-[#10292e] truncate leading-tight">{studentName}</p>
                  <p className="text-[10px] text-[#8a999b] truncate leading-tight">{studentCode} · {gradeLevel}</p>
                </div>
              )}

              {!isCollapsed && (
                <button
                  onClick={() => logout()}
                  title="Log out"
                  className="text-[#a0afb1] hover:text-red-500 p-1 rounded-lg hover:bg-white transition-colors cursor-pointer shrink-0"
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>

            {/* Icons row: Friends, Messages, Notifications, Settings right here */}
            {!isCollapsed ? (
              <div className="flex items-center justify-between pt-1.5 mt-1.5 border-t border-[#f0ede4]">
                <button
                  data-popover-trigger="friends"
                  onClick={() => {
                    setFriendsPopoverOpen((prev) => !prev);
                    setMessagesPopoverOpen(false);
                  }}
                  title="Friends & Requests"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    friendsPopoverOpen
                      ? "bg-[#ffa11f]/20 text-[#10292e] font-bold"
                      : "text-[#7a8a8c] hover:text-[#10292e] hover:bg-[#f0ede4]"
                  }`}
                >
                  <Users size={15} />
                </button>
                <button
                  data-popover-trigger="messages"
                  onClick={() => {
                    setMessagesPopoverOpen((prev) => !prev);
                    setFriendsPopoverOpen(false);
                  }}
                  title="Messages"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    messagesPopoverOpen
                      ? "bg-[#ffa11f]/20 text-[#10292e] font-bold"
                      : "text-[#7a8a8c] hover:text-[#10292e] hover:bg-[#f0ede4]"
                  }`}
                >
                  <Mail size={15} />
                </button>
                <button
                  onClick={() => toast.info("You're all caught up! No unread notifications.")}
                  title="Notifications"
                  className="p-1.5 rounded-lg text-[#7a8a8c] hover:text-[#10292e] hover:bg-[#f0ede4] transition-colors cursor-pointer"
                >
                  <Bell size={15} />
                </button>
                <Link
                  href="/profile"
                  title="Settings"
                  className="p-1.5 rounded-lg text-[#7a8a8c] hover:text-[#10292e] hover:bg-[#f0ede4] transition-colors"
                >
                  <Settings size={15} />
                </Link>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-1 pt-1 mt-1 border-t border-[#f0ede4]">
                <button
                  data-popover-trigger="friends"
                  onClick={() => {
                    setFriendsPopoverOpen((prev) => !prev);
                    setMessagesPopoverOpen(false);
                  }}
                  title="Friends & Requests"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    friendsPopoverOpen
                      ? "bg-[#ffa11f]/20 text-[#10292e] font-bold"
                      : "text-[#7a8a8c] hover:text-[#10292e] hover:bg-[#f0ede4]"
                  }`}
                >
                  <Users size={14} />
                </button>
                <button
                  data-popover-trigger="messages"
                  onClick={() => {
                    setMessagesPopoverOpen((prev) => !prev);
                    setFriendsPopoverOpen(false);
                  }}
                  title="Messages"
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    messagesPopoverOpen
                      ? "bg-[#ffa11f]/20 text-[#10292e] font-bold"
                      : "text-[#7a8a8c] hover:text-[#10292e] hover:bg-[#f0ede4]"
                  }`}
                >
                  <Mail size={14} />
                </button>
                <button
                  onClick={() => toast.info("You're all caught up! No unread notifications.")}
                  title="Notifications"
                  className="p-1.5 rounded-lg text-[#7a8a8c] hover:text-[#10292e] hover:bg-[#f0ede4] transition-colors cursor-pointer"
                >
                  <Bell size={14} />
                </button>
                <Link
                  href="/profile"
                  title="Settings"
                  className="p-1.5 rounded-lg text-[#7a8a8c] hover:text-[#10292e] hover:bg-[#f0ede4] transition-colors"
                >
                  <Settings size={14} />
                </Link>
                <button
                  onClick={() => logout()}
                  title="Log out"
                  className="text-[#a0afb1] hover:text-red-500 p-1 rounded-lg hover:bg-white transition-colors cursor-pointer mt-0.5"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Friends Popover anchored above user card */}
          <FriendsPopover
            isOpen={friendsPopoverOpen}
            onClose={() => setFriendsPopoverOpen(false)}
            isCollapsed={isCollapsed}
          />

          {/* Messages Popover anchored above user card */}
          <MessagesPopover
            isOpen={messagesPopoverOpen}
            onClose={() => setMessagesPopoverOpen(false)}
            isCollapsed={isCollapsed}
          />
        </div>
      </aside>
    </>
  );
}
