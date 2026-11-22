"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MangoIcon from "./MangoIcon";
import { useAuth } from "@/app/_Context/AuthContext";
import { useSidebar } from "@/app/_Context/SidebarContext";
import {
  LayoutGrid,
  Users,
  TrendingUp,
  Activity,
  Trophy,
  FileText,
  MessageSquare,
  Settings,
  Menu,
  X,
  LogOut,
  Compass,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

export interface ParentNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const PARENT_NAV_ITEMS: ParentNavItem[] = [
  { label: "Overview", href: "/parent/dashboard", icon: LayoutGrid },
  { label: "Feeds", href: "/feeds", icon: Compass },
  { label: "My Children", href: "/parent/children", icon: Users },
  { label: "Progress", href: "/parent/progress", icon: TrendingUp },
  { label: "Activity", href: "/parent/activity", icon: Activity },
  { label: "Achievements", href: "/parent/achievements", icon: Trophy },
  { label: "Reports", href: "/parent/reports", icon: FileText },
  { label: "Contact", href: "/parent/contact", icon: MessageSquare },
  { label: "Settings", href: "/parent/settings", icon: Settings },
];

export default function ParentSidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isCollapsed, isAnimating, toggleCollapsed } = useSidebar();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const parentName =
    user?.name ||
    (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "Mona Hassan");
  const parentCode = user?.parent_code || "PAR-001";

  const initials =
    parentName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "MH";

  const isActive = (href: string) => {
    if (href === "/parent/dashboard") {
      return (
        pathname === "/parent" ||
        pathname === "/parent/dashboard" ||
        pathname === "/parent/overview"
      );
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#e8eeea] flex items-center justify-between px-5 z-50 select-none shadow-xs">
        <Link href="/parent/dashboard" className="flex items-center gap-2">
          <MangoIcon size={28} animated />
          <span className="font-extrabold text-lg text-[#10292e]">ALMA</span>
          <span className="bg-[#fff0e6] text-[#ffa11f] border border-[#ffd8b3] text-[9px] font-black uppercase px-2 py-0.5 rounded-full ml-1">
            Parent
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

          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col justify-between p-5 pt-20 z-50 overflow-y-auto no-scrollbar">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-[#8a999b] uppercase tracking-wider px-3 block mb-2">
                Parent Portal
              </span>

              {PARENT_NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? "bg-[#fff7ee] text-[#10292e] border-l-4 border-[#ffa11f]"
                        : "text-[#607274] hover:text-[#10292e] hover:bg-[#fafaf8] border-l-4 border-transparent"
                    }`}
                  >
                    <Icon size={16} className={active ? "text-[#ffa11f]" : "text-[#8a999b]"} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#e8eeea] mt-6">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-[#fafaf8]">
                <div className="w-8 h-8 rounded-full bg-[#fdecd2] text-[#10292e] flex items-center justify-center font-bold text-xs shrink-0 border border-[#f7d6aa]">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-[#10292e] truncate">{parentName}</p>
                  <p className="text-[10px] text-[#8a999b]">{parentCode} · Guardian</p>
                </div>
                <button
                  onClick={() => logout()}
                  title="Log out"
                  className="p-1.5 text-[#8a999b] hover:text-red-500 rounded-lg hover:bg-white cursor-pointer"
                >
                  <LogOut size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sticky In-Flow Sidebar (Collapsible) */}
      <aside
        className={`hidden lg:flex flex-col justify-between select-none z-30 sticky top-0 h-screen shrink-0 bg-white border-r border-[#e8eeea] overflow-hidden ${
          isAnimating ? "transition-[width] duration-250 ease-in-out" : "transition-none"
        } ${
          isCollapsed ? "w-20" : "w-60"
        } ${className}`}
      >
        {/* Navigation Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar py-3 px-2.5 space-y-2">
          {/* Header with Logo and Collapse Toggle */}
          <div
            className={`flex items-center ${
              isCollapsed ? "flex-col gap-2 justify-center" : "justify-between px-2"
            } pb-2 border-b border-[#f4f4f2]`}
          >
            <Link
              href="/parent/dashboard"
              className={`flex items-center gap-2 ${isCollapsed ? "justify-center" : ""}`}
              title="ALMA Parent Portal"
            >
              <MangoIcon size={isCollapsed ? 26 : 28} animated />
              {!isCollapsed && (
                <>
                  <span className="font-black text-lg text-[#10292e] tracking-tight">ALMA</span>
                  <span className="bg-[#fff0e6] text-[#ffa11f] border border-[#ffd8b3] text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ml-0.5">
                    Parent
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

          {!isCollapsed && (
            <span className="text-[10px] font-black text-[#8a999b] uppercase tracking-wider px-2.5 block mb-1">
              Parent Portal
            </span>
          )}

          {/* Navigation Links */}
          <nav className="space-y-0.5">
            {PARENT_NAV_ITEMS.map((item) => {
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
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Card */}
        <div className="p-2 border-t border-[#f0ede4] bg-white relative shrink-0">
          <div
            className={`rounded-2xl bg-[#fafaf8] border border-[#f0ede4] transition-all ${
              isCollapsed ? "p-1.5 flex flex-col items-center gap-1.5" : "p-2"
            }`}
          >
            <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"}`}>
              <div
                title={`${parentName} (${parentCode})`}
                className="w-7 h-7 rounded-full bg-[#fdecd2] text-[#10292e] flex items-center justify-center font-black text-[11px] shrink-0 border border-[#f7d6aa]"
              >
                {initials}
              </div>

              {!isCollapsed && (
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-[#10292e] truncate leading-tight">
                    {parentName}
                  </p>
                  <p className="text-[10px] text-[#8a999b] truncate leading-tight">
                    {parentCode} · Guardian
                  </p>
                </div>
              )}

              <button
                onClick={() => logout()}
                title="Log out"
                className="text-[#a0afb1] hover:text-red-500 p-1 rounded-lg hover:bg-white transition-colors cursor-pointer shrink-0"
              >
                <LogOut size={14} />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
