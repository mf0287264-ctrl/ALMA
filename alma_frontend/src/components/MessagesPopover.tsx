"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Plus, Loader2, X, MessageSquare, Check, CheckCheck } from "lucide-react";
import api from "@/services/api";
import { getProfileImageUrl } from "@/app/_Context/AuthContext";

interface MessageThread {
  partner: {
    _id: string;
    first_name: string;
    last_name?: string;
    student_code?: string;
    email?: string;
    profile_image?: string | null;
  };
  last_message: {
    _id: string;
    text: string;
    created_at: string;
    is_mine: boolean;
    read: boolean;
  };
  unread_count: number;
}

interface MessagesPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
}

export default function MessagesPopover({
  isOpen,
  onClose,
  isCollapsed = false,
}: MessagesPopoverProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"messages" | "chat">("messages");
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [loading, setLoading] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-popover-trigger="messages"]')) {
        return; // Button click handles toggle
      }
      if (popoverRef.current && !popoverRef.current.contains(target as Node)) {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Escape key listener
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/messages/threads");
      if (res.data?.success && res.data?.data) {
        setThreads(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching message threads:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchThreads();
    }
  }, [isOpen, fetchThreads]);

  const formatRelativeTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - d.getTime();
      const diffMinutes = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMinutes / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMinutes < 1) return "Just now";
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      if (diffDays === 1) return "1 day ago";
      if (diffDays < 7) return `${diffDays} days ago`;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  const handleOpenConversation = (partnerIdentifier: string) => {
    onClose();
    router.push(`/messages/${partnerIdentifier}`);
  };

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className={`z-50 bg-white rounded-2xl shadow-2xl border border-[#e8eeea] text-[#10292e] overflow-hidden flex flex-col transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${
        isCollapsed
          ? "fixed bottom-16 left-20 w-80 max-h-[460px]"
          : "absolute bottom-20 left-2 right-2 w-[calc(100%-16px)] max-h-[460px]"
      }`}
      style={{
        boxShadow: "0 10px 30px -5px rgba(16, 41, 46, 0.15), 0 0 1px 1px rgba(16, 41, 46, 0.05)",
      }}
    >
      {/* Popover Header Tabs: Messages | Chat */}
      <div className="flex items-center justify-between border-b border-[#f0ede4] px-3 pt-1 bg-[#fafaf8]">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("messages")}
            className={`py-2.5 px-3.5 text-xs font-black relative transition-colors cursor-pointer ${
              activeTab === "messages"
                ? "text-[#10292e]"
                : "text-[#8a999b] hover:text-[#10292e]"
            }`}
          >
            Messages
            {threads.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-[#e8eeea] text-[#10292e] font-bold">
                {threads.length}
              </span>
            )}
            {activeTab === "messages" && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#ffa11f] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("chat")}
            className={`py-2.5 px-3.5 text-xs font-black relative transition-colors cursor-pointer ${
              activeTab === "chat"
                ? "text-[#10292e]"
                : "text-[#8a999b] hover:text-[#10292e]"
            }`}
          >
            Chat
            {activeTab === "chat" && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#ffa11f] rounded-full" />
            )}
          </button>
        </div>

        <button
          onClick={onClose}
          className="p-1 rounded-lg text-[#8a999b] hover:text-[#10292e] hover:bg-[#e8eeea] transition-colors cursor-pointer"
          title="Close"
        >
          <X size={15} />
        </button>
      </div>

      {/* Main Messages List */}
      <div className="flex-1 overflow-y-auto max-h-[320px] divide-y divide-[#f7f7f5] no-scrollbar">
        {loading ? (
          <div className="py-10 flex flex-col items-center justify-center text-[#8a999b]">
            <Loader2 className="w-5 h-5 animate-spin text-[#ffa11f] mb-1.5" />
            <p className="text-[11px]">Loading messages...</p>
          </div>
        ) : threads.length === 0 ? (
          /* Empty state when student has no messages (Handled as requested!) */
          <div className="py-9 px-4 text-center space-y-2.5">
            <div className="w-10 h-10 rounded-full bg-[#fff8ec] border border-[#f0ede4] text-[#ffa11f] flex items-center justify-center mx-auto shadow-2xs">
              <Mail size={18} />
            </div>
            <p className="text-xs font-bold text-[#10292e]">No Messages Yet</p>
            <p className="text-[11px] text-[#8a999b] max-w-[200px] mx-auto leading-relaxed">
              When you or your classmates send a message, it will appear here.
            </p>
            <button
              onClick={() => {
                onClose();
                router.push("/messages?new=true");
              }}
              className="inline-flex items-center gap-1.5 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-[11px] px-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
            >
              <Plus size={13} />
              <span>New Message</span>
            </button>
          </div>
        ) : (
          /* Threads List (Matches Screenshot Image 1) */
          threads.map((thread) => {
            const partner = thread.partner;
            const partnerName = `${partner.first_name} ${partner.last_name || ""}`.trim();
            const identifier = partner.student_code || partner._id;

            return (
              <div
                key={partner._id}
                onClick={() => handleOpenConversation(identifier)}
                className="flex items-center gap-3 p-3 hover:bg-[#fafaf8] transition-colors cursor-pointer group"
              >
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-linear-to-br from-[#118a80] to-[#0f5953] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                    {partner.profile_image ? (
                      <img
                        src={getProfileImageUrl(partner.profile_image)}
                        alt={partnerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <>
                        {partner.first_name[0]}
                        {partner.last_name ? partner.last_name[0] : ""}
                      </>
                    )}
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-bold text-[#10292e] truncate group-hover:text-[#118a80] transition-colors">
                      {partnerName}
                    </p>
                    <span className="text-[10px] text-[#8a999b] shrink-0 font-medium">
                      {formatRelativeTime(thread.last_message.created_at)}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#607274] truncate leading-tight">
                    {thread.last_message.is_mine && (
                      <span className="text-[#8a999b] mr-1 font-medium">You:</span>
                    )}
                    {thread.last_message.text}
                  </p>
                </div>

                {thread.unread_count > 0 && (
                  <span className="w-4 h-4 rounded-full bg-[#ffa11f] text-[#10292e] text-[9px] font-black flex items-center justify-center shrink-0">
                    {thread.unread_count}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Popover Footer (Matches Image 1: "+ New Message" and "All Messages") */}
      <div className="p-2.5 border-t border-[#f0ede4] bg-[#fafaf8] flex items-center justify-between">
        <button
          onClick={() => {
            onClose();
            router.push("/messages?new=true");
          }}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#10292e] hover:text-[#118a80] transition-colors cursor-pointer"
        >
          <Plus size={14} className="text-[#ffa11f]" />
          <span>New Message</span>
        </button>

        <Link
          href="/messages"
          onClick={onClose}
          className="text-xs font-bold text-[#118a80] hover:text-[#0f5953] hover:underline transition-colors"
        >
          All Messages
        </Link>
      </div>
    </div>
  );
}
