"use client";

import { useCallback, useEffect, useRef, useState, type MouseEvent } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export function useMobileNavigation(pathname: string) {
  const [openedFor, setOpenedFor] = useState<string | null>(null);
  const isOpen = openedFor === pathname;
  const close = useCallback(() => setOpenedFor(null), []);
  const toggle = (event: MouseEvent<HTMLButtonElement>) => {
    // Safari does not focus buttons on pointer clicks. Remember the trigger so
    // closing the dialog returns keyboard focus to the navigation button.
    event.currentTarget.focus();
    setOpenedFor((current) => current === pathname ? null : pathname);
  };
  return { isOpen, close, toggle };
}

export function NavigationDrawer({
  open, onClose, title, id, children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  id: string;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusable = () => Array.from(panel.current?.querySelectorAll<HTMLElement>(
      'a[href], button:not(:disabled), input:not(:disabled), [tabindex="0"]',
    ) || []).filter((element) => element.getClientRects().length > 0);
    focusable()[0]?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key !== "Tab") return;
      const items = focusable();
      const first = items[0], last = items[items.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !panel.current?.contains(document.activeElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onViewportChange = () => { if (desktop.matches) onClose(); };
    document.addEventListener("keydown", onKeyDown);
    desktop.addEventListener("change", onViewportChange);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      desktop.removeEventListener("change", onViewportChange);
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-[60] flex lg:hidden">
      <button type="button" tabIndex={-1} aria-label="Close navigation backdrop" onClick={onClose} className="absolute inset-0 bg-black/30 backdrop-blur-xs" />
      <div ref={panel} id={id} role="dialog" aria-modal="true" aria-labelledby={`${id}-title`} className="relative flex h-full w-80 max-w-[88vw] flex-col bg-white shadow-2xl">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#e8eeea] p-5">
          <span id={`${id}-title`} className="text-base font-bold text-[#10292e]">{title}</span>
          <button type="button" onClick={onClose} aria-label="Close navigation" className="rounded-xl p-2 text-[#607274] hover:bg-[#fafaf8]">
            <X size={20} />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-5 sidebar-tabs-slider">{children}</div>
      </div>
    </div>,
    document.body,
  );
}
