"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

interface SidebarContextType {
  isCollapsed: boolean;
  isAnimating: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (val: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  isAnimating: false,
  toggleCollapsed: () => {},
  setCollapsed: () => {},
});

const STORAGE_KEY = "alma_student_sidebar_collapsed";

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  // Default to false initially for SSR consistency
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);

  // Sync once on initial client mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved !== null) {
        setIsCollapsed(saved === "true");
      }
    } catch {}
  }, []);

  const toggleCollapsed = () => {
    // Only animate when the user explicitly clicks the toggle button
    setIsAnimating(true);
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(STORAGE_KEY, String(next));
      } catch {}
      return next;
    });

    // Reset animation flag after transition finishes (250ms)
    setTimeout(() => {
      setIsAnimating(false);
    }, 280);
  };

  const setCollapsed = (val: boolean) => {
    setIsAnimating(true);
    setIsCollapsed(val);
    try {
      localStorage.setItem(STORAGE_KEY, String(val));
    } catch {}
    setTimeout(() => {
      setIsAnimating(false);
    }, 280);
  };

  return (
    <SidebarContext.Provider
      value={{
        isCollapsed,
        isAnimating,
        toggleCollapsed,
        setCollapsed,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  return useContext(SidebarContext);
}
