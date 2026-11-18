"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MangoIcon from "./MangoIcon";
import { useAuth } from "@/app/_Context/AuthContext";
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
  LogOut
} from "lucide-react";

export interface ParentNavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const PARENT_NAV_ITEMS: ParentNavItem[] = [
  { label: "Overview", href: "/parent/dashboard", icon: LayoutGrid },
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const parentName =
    user?.name ||
    (user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "Mona Hassan");
  const parentCode = user?.parent_code || "PAR-001";

  // Initials for avatar
  const initials =
    parentName
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "MH";

  const isActive = (href: string) => {
    if (href === "/parent/dashboard") {
      return pathname === "/parent" || pathname === "/parent/dashboard" || pathname === "/parent/overview";
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

      {/* Mobile Backdrop & Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div
            className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl flex flex-col justify-between p-5 pt-20 z-50">
            <div className="space-y-1">
              {PARENT_NAV_ITEMS.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      active
                        ? "bg-[#fff7ee] text-[#10292e] font-bold border-l-4 border-[#ffa11f]"
                        : "text-[#607274] hover:text-[#10292e] hover:bg-[#fafaf8] border-l-4 border-transparent"
                    }`}
                  >
                    <Icon size={18} className={active ? "text-[#ffa11f]" : "text-[#8a999b]"} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-4 border-t border-[#e8eeea]">
              <div className="flex items-center gap-3 p-2 rounded-xl bg-[#fafaf8]">
                <div className="w-9 h-9 rounded-full bg-[#faebd7] text-[#10292e] flex items-center justify-center font-bold text-xs border border-[#eed9c4]">
                  {initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-[#10292e] truncate">{parentName}</p>
                  <p className="text-[10px] text-[#8a999b]">{parentCode} · parent</p>
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
        <div>
          {/* Logo & Parent Role Tag */}
          <div className="h-20 flex items-center px-6 gap-2 border-b border-[#f4f4f2]">
            <Link href="/parent/dashboard" className="flex items-center gap-2">
              <MangoIcon size={32} animated />
              <span className="font-black text-xl text-[#10292e] tracking-tight">ALMA</span>
              <span className="bg-[#fff0e6] text-[#ffa11f] border border-[#ffd8b3] text-[10px] font-bold px-2 py-0.5 rounded-md ml-1">
                Parent
              </span>
            </Link>
          </div>

          {/* Navigation Items */}
          <nav className="py-4 space-y-1">
            {PARENT_NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3.5 px-6 py-3 text-sm transition-all duration-150 ${
                    active
                      ? "bg-[#fff7ee] text-[#10292e] font-bold border-l-4 border-[#ffa11f]"
                      : "text-[#607274] hover:text-[#10292e] hover:bg-[#fafaf8] border-l-4 border-transparent font-medium"
                  }`}
                >
                  <Icon
                    size={19}
                    className={active ? "text-[#ffa11f]" : "text-[#7f9092]"}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile Badge */}
        <div className="p-4 border-t border-[#f4f4f2]">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#fafaf8] transition-colors group">
            <div className="w-10 h-10 rounded-full bg-[#fdecd2] text-[#10292e] flex items-center justify-center font-bold text-xs border border-[#f7d6aa] shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-[#10292e] truncate">{parentName}</p>
              <p className="text-[10px] text-[#8a999b]">{parentCode} · parent</p>
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
