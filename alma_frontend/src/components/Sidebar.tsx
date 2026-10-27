"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MangoIcon from "./MangoIcon";

export interface NavItem {
  label: string;
  href: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", href: "/home" },
  { label: "Learn", href: "/learn" },
  { label: "Compete", href: "/compete" },
  { label: "Profile", href: "/profile" },
];

export default function Sidebar({ className = "" }: { className?: string }) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside
        className={`w-64 min-h-screen bg-white border-r border-[#e8eeea] flex flex-col justify-between py-8 px-5 select-none shrink-0 ${className}`}
      >
        <div>
          {/* Logo */}
          <Link href="/home" className="flex items-center gap-2.5 px-3 mb-10 group">
            <MangoIcon size={32} animated className="group-hover:scale-105 transition-transform" />
            <span className="font-extrabold text-xl tracking-tight text-[#10292e]">
              ALMA
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-2">
            {NAV_ITEMS.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/home" && pathname.startsWith(item.href));

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center px-3.5 py-3 rounded-2xl text-sm transition-all duration-150 ${
                    isActive
                      ? "bg-[#fff8ec] text-[#10292e] font-extrabold shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                      : "text-[#6f7f80] hover:text-[#10292e] hover:bg-[#fafaf8] font-bold"
                  }`}
                >
                  {/* Left orange pill indicator for active link */}
                  <span
                    className={`w-1.5 h-5 rounded-full mr-3.5 transition-all ${
                      isActive ? "bg-[#ffa11f]" : "bg-transparent"
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer / App Info */}
        <div className="px-3 text-xs text-[#83908f] font-medium">
          ALMA Learning Platform
        </div>
      </aside>

      {/* Mobile Bottom Navigation Bar (Hidden on md and up) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#e8eeea] flex items-center justify-around py-2.5 px-4 z-50 shadow-lg">
        {NAV_ITEMS.map((item) => {
          const isActive =
            pathname === item.href ||
            (item.href !== "/home" && pathname.startsWith(item.href));

          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-xl text-xs transition-colors ${
                isActive
                  ? "text-[#10292e] font-extrabold"
                  : "text-[#6f7f80] font-semibold"
              }`}
            >
              <span
                className={`w-4 h-1 rounded-full mb-1 transition-all ${
                  isActive ? "bg-[#ffa11f]" : "bg-transparent"
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
