"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  UserPlus,
  Mail,
  Search,
  Check,
  X,
  Swords,
  MoreHorizontal,
  Loader2,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import api from "@/services/api";
import { toast } from "sonner";
import { getProfileImageUrl } from "@/app/_Context/AuthContext";

interface StudentFriend {
  _id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  student_code?: string;
  grade_level?: string;
  profile_image?: string | null;
  friendship_status?: "friend" | "sent" | "received" | "none";
}

interface FriendsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  isCollapsed?: boolean;
}

export default function FriendsPopover({
  isOpen,
  onClose,
  isCollapsed = false,
}: FriendsPopoverProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<StudentFriend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<StudentFriend[]>([]);
  const [sentRequests, setSentRequests] = useState<StudentFriend[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<StudentFriend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Click outside listener with trigger exclusion for clean toggling
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.closest('[data-popover-trigger="friends"]')) {
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

  const fetchFriendsData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get("/students/friends/me");
      if (res.data?.success && res.data?.data) {
        setFriends(res.data.data.friends || []);
        setReceivedRequests(res.data.data.friend_requests_received || []);
        setSentRequests(res.data.data.friend_requests_sent || []);
      }
    } catch (err: unknown) {
      console.error("Error fetching friends data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchFriendsData();
    }
  }, [isOpen, fetchFriendsData]);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await api.get(`/students/search?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.data?.success) {
          setSearchResults(res.data.data || []);
        }
      } catch (err) {
        console.error("Error searching students:", err);
      } finally {
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSendRequest = async (targetId: string) => {
    try {
      setActionLoadingId(targetId);
      const res = await api.post(`/students/friend-request/${targetId}`);
      if (res.data?.success) {
        toast.success("Friend request sent!");
        setSearchResults((prev) =>
          prev.map((s) => (s._id === targetId ? { ...s, friendship_status: "sent" } : s))
        );
        fetchFriendsData();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to send friend request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleAcceptRequest = async (fromId: string) => {
    try {
      setActionLoadingId(fromId);
      const res = await api.post(`/students/accept-friend-request/${fromId}`);
      if (res.data?.success) {
        toast.success("Friend request accepted!");
        fetchFriendsData();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to accept request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejectRequest = async (fromId: string) => {
    try {
      setActionLoadingId(fromId);
      const res = await api.post(`/students/reject-friend-request/${fromId}`);
      if (res.data?.success) {
        toast.info("Friend request removed");
        fetchFriendsData();
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRedirectToSearch = () => {
    onClose();
    router.push("/friends");
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
      {/* Popover Header Tabs: Friends | Requests */}
      <div className="flex items-center justify-between border-b border-[#f0ede4] px-3 pt-1 bg-[#fafaf8]">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab("friends")}
            className={`py-2.5 px-3.5 text-xs font-black relative transition-colors cursor-pointer ${
              activeTab === "friends"
                ? "text-[#10292e]"
                : "text-[#8a999b] hover:text-[#10292e]"
            }`}
          >
            Friends
            {friends.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-[#e8eeea] text-[#10292e] font-bold">
                {friends.length}
              </span>
            )}
            {activeTab === "friends" && (
              <div className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#ffa11f] rounded-full" />
            )}
          </button>

          <button
            onClick={() => setActiveTab("requests")}
            className={`py-2.5 px-3.5 text-xs font-black relative transition-colors cursor-pointer ${
              activeTab === "requests"
                ? "text-[#10292e]"
                : "text-[#8a999b] hover:text-[#10292e]"
            }`}
          >
            Requests
            {receivedRequests.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[10px] bg-[#ffa11f] text-[#10292e] font-extrabold animate-pulse">
                {receivedRequests.length}
              </span>
            )}
            {activeTab === "requests" && (
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

      {/* Search Input Bar */}
      <div className="p-3 border-b border-[#f4f4f2] bg-white">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8a999b]" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Friends..."
            className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] placeholder-[#8a999b] text-xs font-medium rounded-xl pl-8 pr-7 py-2 focus:outline-hidden focus:border-[#ffa11f] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8a999b] hover:text-[#10292e] text-xs"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Main Scrollable Content */}
      <div className="flex-1 overflow-y-auto max-h-[300px] divide-y divide-[#f7f7f5] no-scrollbar">
        {loading ? (
          <div className="py-10 flex flex-col items-center justify-center text-[#8a999b]">
            <Loader2 className="w-5 h-5 animate-spin text-[#ffa11f] mb-1.5" />
            <p className="text-[11px]">Loading...</p>
          </div>
        ) : searchQuery.trim().length > 0 ? (
          /* Search Results */
          <div className="p-2 space-y-1">
            <div className="flex items-center justify-between px-2 py-1 text-[11px] font-bold text-[#8a999b]">
              <span>Search results ({searchResults.length})</span>
              {isSearching && <Loader2 className="w-3 h-3 animate-spin text-[#ffa11f]" />}
            </div>

            {searchResults.length === 0 && !isSearching ? (
              <div className="py-6 text-center text-xs text-[#8a999b]">
                No student found for &ldquo;{searchQuery}&rdquo;
              </div>
            ) : (
              searchResults.map((student) => {
                const fullName = `${student.first_name} ${student.last_name || ""}`.trim();
                const isFriend = student.friendship_status === "friend";
                const isSent = student.friendship_status === "sent";
                const isReceived = student.friendship_status === "received";

                return (
                  <div
                    key={student._id}
                    className="flex items-center justify-between p-2 rounded-xl hover:bg-[#fafaf8] transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center font-bold text-xs border border-[#e9d5ff]">
                          {student.profile_image ? (
                            <img
                              src={getProfileImageUrl(student.profile_image)}
                              alt={fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              {student.first_name[0]}
                              {student.last_name ? student.last_name[0] : ""}
                            </>
                          )}
                        </div>
                        <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#10292e] truncate">{fullName}</p>
                        <p className="text-[10px] text-[#8a999b]">
                          {student.student_code || student.email}
                        </p>
                      </div>
                    </div>

                    {isFriend ? (
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Friend
                      </span>
                    ) : isSent ? (
                      <span className="text-[11px] font-semibold text-[#ffa11f] bg-amber-50 px-2 py-0.5 rounded-full">
                        Pending
                      </span>
                    ) : isReceived ? (
                      <button
                        onClick={() => handleAcceptRequest(student._id)}
                        disabled={actionLoadingId === student._id}
                        className="text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        Accept
                      </button>
                    ) : (
                      <button
                        onClick={() => handleSendRequest(student._id)}
                        disabled={actionLoadingId === student._id}
                        className="text-[11px] font-bold text-[#10292e] bg-[#ffa11f] hover:bg-[#ff9400] px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        {actionLoadingId === student._id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <>
                            <UserPlus size={12} />
                            <span>Add</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        ) : activeTab === "friends" ? (
          /* Friends Tab */
          <div className="divide-y divide-[#f7f7f5]">
            {friends.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-2.5">
                <div className="w-10 h-10 rounded-full bg-[#fafaf8] border border-[#e8eeea] flex items-center justify-center mx-auto text-[#ffa11f]">
                  <Users size={18} />
                </div>
                <p className="text-xs font-bold text-[#10292e]">No friends connected yet</p>
                <p className="text-[11px] text-[#8a999b] leading-tight">
                  Search classmates by name or student code to learn together.
                </p>
                <button
                  onClick={handleRedirectToSearch}
                  className="inline-flex items-center gap-1.5 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-[11px] px-3.5 py-1.5 rounded-full transition-all cursor-pointer shadow-2xs"
                >
                  <Search size={12} />
                  <span>Find Friends</span>
                </button>
              </div>
            ) : (
              friends.map((friend) => {
                const fullName = `${friend.first_name} ${friend.last_name || ""}`.trim();
                return (
                  <div
                    key={friend._id}
                    className="flex items-center justify-between px-3 py-2.5 hover:bg-[#fafaf8] transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-linear-to-br from-[#118a80] to-[#0f5953] text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                          {friend.profile_image ? (
                            <img
                              src={getProfileImageUrl(friend.profile_image)}
                              alt={fullName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <>
                              {friend.first_name[0]}
                              {friend.last_name ? friend.last_name[0] : ""}
                            </>
                          )}
                        </div>
                        <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-[#22c55e] border-2 border-white" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#10292e] truncate">{fullName}</p>
                        <p className="text-[10px] text-[#8a999b] truncate">
                          {friend.student_code || "Active now"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Link
                        href="/compete"
                        onClick={onClose}
                        title="Challenge"
                        className="p-1.5 rounded-lg text-[#10292e] bg-[#fafaf8] hover:bg-[#ffa11f]/20 hover:text-[#ffa11f] border border-[#e8eeea] transition-all cursor-pointer"
                      >
                        <Swords size={13} />
                      </Link>
                      <button
                        onClick={() => {
                          onClose();
                          router.push(`/messages/${friend.student_code || friend._id}`);
                        }}
                        title={`Message ${friend.first_name}`}
                        className="p-1.5 rounded-lg text-[#8a999b] hover:text-[#10292e] hover:bg-[#e8eeea] transition-colors cursor-pointer"
                      >
                        <Mail size={13} />
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        ) : (
          /* Requests Tab */
          <div className="divide-y divide-[#f7f7f5] p-2">
            {receivedRequests.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-3">
                <p className="text-xs font-bold text-[#10292e]">No New Requests</p>
                <p className="text-[11px] text-[#8a999b] leading-tight">
                  When you send or receive friend requests, they will appear here.
                </p>
                <button
                  onClick={handleRedirectToSearch}
                  className="inline-flex items-center gap-1.5 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Search size={13} />
                  <span>Search Friends</span>
                </button>
              </div>
            ) : (
              receivedRequests.map((reqStudent) => {
                const fullName = `${reqStudent.first_name} ${reqStudent.last_name || ""}`.trim();
                return (
                  <div
                    key={reqStudent._id}
                    className="flex items-center justify-between p-2 rounded-xl bg-[#fafaf8] border border-[#f0ede4]"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-[#ffa11f]/20 text-[#ffa11f] flex items-center justify-center font-bold text-xs shrink-0">
                        {reqStudent.profile_image ? (
                          <img
                            src={getProfileImageUrl(reqStudent.profile_image)}
                            alt={fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            {reqStudent.first_name[0]}
                            {reqStudent.last_name ? reqStudent.last_name[0] : ""}
                          </>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-[#10292e] truncate">{fullName}</p>
                        <p className="text-[10px] text-[#8a999b]">
                          {reqStudent.student_code || "Wants to be friends"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleAcceptRequest(reqStudent._id)}
                        disabled={actionLoadingId === reqStudent._id}
                        className="text-[11px] font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        {actionLoadingId === reqStudent._id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          "Accept"
                        )}
                      </button>
                      <button
                        onClick={() => handleRejectRequest(reqStudent._id)}
                        disabled={actionLoadingId === reqStudent._id}
                        className="text-[11px] font-medium text-[#8a999b] hover:text-red-500 hover:bg-[#e8eeea] px-2 py-1 rounded-lg transition-colors cursor-pointer"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                );
              })
            )}

            {/* Sent Requests Sub-list if any */}
            {sentRequests.length > 0 && (
              <div className="pt-2 mt-2 space-y-1">
                <span className="text-[10px] font-black uppercase text-[#8a999b] px-2 block">
                  Sent ({sentRequests.length})
                </span>
                {sentRequests.map((s) => (
                  <div
                    key={s._id}
                    className="flex items-center justify-between px-2 py-1.5 text-xs text-[#8a999b]"
                  >
                    <span className="truncate text-[#10292e] font-medium">
                      {s.first_name} {s.last_name || ""}
                    </span>
                    <span className="text-[10px] text-[#ffa11f] font-semibold">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Popover Footer (Redirects to /friends search page as requested) */}
      <div className="p-2.5 border-t border-[#f0ede4] bg-[#fafaf8] flex items-center justify-between">
        <button
          onClick={handleRedirectToSearch}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#118a80] hover:text-[#0f5953] transition-colors cursor-pointer"
        >
          <Search size={13} />
          <span>Find & Search Friends</span>
        </button>

        <button
          onClick={handleRedirectToSearch}
          className="text-xs font-bold text-[#8a999b] hover:text-[#10292e] transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>See All</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
