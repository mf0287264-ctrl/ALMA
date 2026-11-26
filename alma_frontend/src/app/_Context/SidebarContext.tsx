"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useSyncExternalStore } from "react";

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
const CHANGE_EVENT = "alma-sidebar-change";
let fallbackCollapsed = false;

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(CHANGE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(CHANGE_EVENT, callback);
  };
}

function getSnapshot() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === null ? fallbackCollapsed : stored === "true";
  } catch { return fallbackCollapsed; }
}

function writeCollapsed(value: boolean) {
  fallbackCollapsed = value;
  try { localStorage.setItem(STORAGE_KEY, String(value)); } catch {}
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const isCollapsed = useSyncExternalStore(subscribe, getSnapshot, () => false);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const animationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => { if (animationTimer.current) clearTimeout(animationTimer.current); }, []);

  const toggleCollapsed = () => {
    setCollapsed(!getSnapshot());
  };

  const setCollapsed = (val: boolean) => {
    setIsAnimating(true);
    writeCollapsed(val);
    if (animationTimer.current) clearTimeout(animationTimer.current);
    animationTimer.current = setTimeout(() => {
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
