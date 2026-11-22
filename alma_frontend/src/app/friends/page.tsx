"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import api from "@/services/api";
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Swords,
  CheckCircle2,
  Clock,
  Loader2,
  ShieldAlert,
  ArrowRight,
  Flame,
} from "lucide-react";
import { toast } from "sonner";

interface StudentCard {
  _id: string;
  first_name: string;
  last_name?: string;
  email?: string;
  student_code?: string;
  grade_level?: string;
  school_name?: string | null;
  profile_image?: string | null;
  current_streak?: number;
  friendship_status?: "friend" | "sent" | "received" | "none";
}

export default function FriendsSearchPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"search" | "friends" | "requests">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [students, setStudents] = useState<StudentCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState<StudentCard[]>([]);
  const [requests, setRequests] = useState<StudentCard[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Load initial classmates / search results
  const fetchStudents = useCallback(async (query: string = "") => {
    try {
      setLoading(true);
      const res = await api.get(`/students/search?q=${encodeURIComponent(query.trim())}`);
      if (res.data?.success && res.data?.data) {
        setStudents(res.data.data);
      }
    } catch (err) {
      console.error("Failed to search students:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFriendsAndRequests = useCallback(async () => {
    try {
      const res = await api.get("/students/friends/me");
      if (res.data?.success && res.data?.data) {
        setFriends(res.data.data.friends || []);
        setRequests(res.data.data.friend_requests_received || []);
      }
    } catch (err) {
      console.error("Failed to fetch friends data:", err);
    }
  }, []);

  useEffect(() => {
    fetchStudents("");
    fetchFriendsAndRequests();
  }, [fetchStudents, fetchFriendsAndRequests]);

  // Debounced live search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchStudents(searchQuery);
    }, 250);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchStudents]);

  const handleSendRequest = async (targetId: string) => {
    try {
      setActionLoadingId(targetId);
      const res = await api.post(`/students/friend-request/${targetId}`);
      if (res.data?.success) {
        toast.success("Friend request sent!");
        setStudents((prev) =>
          prev.map((s) => (s._id === targetId ? { ...s, friendship_status: "sent" } : s))
        );
        fetchFriendsAndRequests();
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
        fetchFriendsAndRequests();
        fetchStudents(searchQuery);
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
        fetchFriendsAndRequests();
        fetchStudents(searchQuery);
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to reject request");
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              Find Classmates & Friends
            </h1>
            <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
              Search by name, student code, or email to connect, study together, and share coding challenges.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#8a999b] bg-white border border-[#e8eeea] px-3.5 py-1.5 rounded-full">
              {friends.length} {friends.length === 1 ? "Friend" : "Friends"}
            </span>
          </div>
        </div>

        {/* Large Search Bar (Prominent ALMA styling) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#e8eeea] shadow-xs mb-6">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-[#8a999b]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, code (e.g. STU-1102), or email..."
              className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] placeholder-[#8a999b] text-sm font-medium rounded-2xl pl-12 pr-10 py-3.5 focus:outline-hidden focus:border-[#ffa11f] focus:bg-white transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8a999b] hover:text-[#10292e] text-sm font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Quick Tabs: All Classmates | My Friends | Requests */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#f0ede4] text-xs font-bold">
            <button
              onClick={() => setActiveTab("search")}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "search"
                  ? "bg-[#10292e] text-white shadow-xs"
                  : "bg-[#fafaf8] text-[#607274] hover:bg-[#f0ede4]"
              }`}
            >
              All Classmates ({students.length})
            </button>

            <button
              onClick={() => setActiveTab("friends")}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer ${
                activeTab === "friends"
                  ? "bg-[#10292e] text-white shadow-xs"
                  : "bg-[#fafaf8] text-[#607274] hover:bg-[#f0ede4]"
              }`}
            >
              My Friends ({friends.length})
            </button>

            <button
              onClick={() => setActiveTab("requests")}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer relative ${
                activeTab === "requests"
                  ? "bg-[#10292e] text-white shadow-xs"
                  : "bg-[#fafaf8] text-[#607274] hover:bg-[#f0ede4]"
              }`}
            >
              Requests ({requests.length})
              {requests.length > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 rounded-full text-[9px] bg-[#ffa11f] text-[#10292e] font-black">
                  {requests.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#8a999b]">
            <Loader2 className="w-8 h-8 animate-spin text-[#ffa11f] mb-2" />
            <p className="text-xs">Searching classmates across ALMA...</p>
          </div>
        ) : activeTab === "friends" ? (
          /* My Friends Tab */
          friends.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-[#e8eeea] p-8 space-y-3">
              <Users className="w-12 h-12 text-[#ffa11f] mx-auto opacity-40" />
              <h3 className="text-base font-extrabold text-[#10292e]">No Friends Added Yet</h3>
              <p className="text-xs text-[#8a999b] max-w-sm mx-auto leading-relaxed">
                Connect with your peers to collaborate on coding exercises and challenge them in logic games.
              </p>
              <button
                onClick={() => setActiveTab("search")}
                className="inline-flex items-center gap-2 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs px-5 py-2.5 rounded-full transition-all shadow-xs cursor-pointer"
              >
                <Search size={14} />
                <span>Find Classmates</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {friends.map((friend) => {
                const fullName = `${friend.first_name} ${friend.last_name || ""}`.trim();
                return (
                  <div
                    key={friend._id}
                    className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div className="flex items-start gap-3.5 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-[#118a80] to-[#0f5953] text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        {friend.first_name[0]}
                        {friend.last_name ? friend.last_name[0] : ""}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-extrabold text-[#10292e] truncate">{fullName}</h4>
                        <p className="text-xs text-[#8a999b]">{friend.student_code || "Student"}</p>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1.5">
                          <CheckCircle2 size={11} /> Connected Friend
                        </span>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#f0ede4] flex items-center gap-2">
                      <Link
                        href={`/messages/${friend.student_code || friend._id}`}
                        className="flex-1 py-2 px-3 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Mail size={13} />
                        <span>Message</span>
                      </Link>

                      <Link
                        href="/compete"
                        className="py-2 px-3 bg-[#fafaf8] hover:bg-[#f0ede4] text-[#10292e] border border-[#e8eeea] rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <Swords size={13} />
                        <span>Challenge</span>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : activeTab === "requests" ? (
          /* Incoming Requests Tab */
          requests.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-[#e8eeea] p-8 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-[#118a80] mx-auto opacity-40" />
              <h3 className="text-base font-extrabold text-[#10292e]">No Incoming Requests</h3>
              <p className="text-xs text-[#8a999b] max-w-sm mx-auto">
                When classmates send you friend requests, you can accept or decline them here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {requests.map((req) => {
                const fullName = `${req.first_name} ${req.last_name || ""}`.trim();
                return (
                  <div
                    key={req._id}
                    className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3.5 mb-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#ffa11f]/20 text-[#ffa11f] flex items-center justify-center font-bold text-sm shrink-0">
                        {req.first_name[0]}
                        {req.last_name ? req.last_name[0] : ""}
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-extrabold text-[#10292e] truncate">{fullName}</h4>
                        <p className="text-xs text-[#8a999b]">{req.student_code || "Classmate"}</p>
                        <p className="text-[11px] text-[#ffa11f] font-semibold mt-1">
                          Wants to be your friend
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#f0ede4] flex items-center gap-2">
                      <button
                        onClick={() => handleAcceptRequest(req._id)}
                        disabled={actionLoadingId === req._id}
                        className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        {actionLoadingId === req._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          "Accept"
                        )}
                      </button>

                      <button
                        onClick={() => handleRejectRequest(req._id)}
                        disabled={actionLoadingId === req._id}
                        className="py-2 px-3 bg-[#fafaf8] hover:bg-[#f0ede4] text-[#8a999b] hover:text-red-500 border border-[#e8eeea] rounded-xl font-bold text-xs transition-colors cursor-pointer"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* All Classmates / Search Results Tab */
          students.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-[#e8eeea] p-8 space-y-3">
              <Users className="w-12 h-12 text-[#8a999b] mx-auto opacity-40" />
              <h3 className="text-base font-extrabold text-[#10292e]">No Students Found</h3>
              <p className="text-xs text-[#8a999b] max-w-sm mx-auto">
                No registered classmates found matching &ldquo;{searchQuery}&rdquo;. Try another name or student code.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {students.map((student) => {
                const fullName = `${student.first_name} ${student.last_name || ""}`.trim();
                const isFriend = student.friendship_status === "friend";
                const isSent = student.friendship_status === "sent";
                const isReceived = student.friendship_status === "received";

                return (
                  <div
                    key={student._id}
                    className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs flex flex-col justify-between hover:shadow-md transition-all"
                  >
                    <div>
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-2xl bg-[#f3e8ff] text-[#9333ea] flex items-center justify-center font-bold text-sm shrink-0 border border-[#e9d5ff]">
                            {student.first_name[0]}
                            {student.last_name ? student.last_name[0] : ""}
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-sm font-extrabold text-[#10292e] truncate">{fullName}</h4>
                            <p className="text-xs text-[#8a999b]">{student.student_code || student.email}</p>
                          </div>
                        </div>

                        {student.current_streak && student.current_streak > 0 ? (
                          <span className="flex items-center gap-1 text-[10px] font-bold text-[#ffa11f] bg-[#fff8ec] border border-[#fae2b8] px-2 py-0.5 rounded-full">
                            <Flame size={12} className="fill-[#ffa11f]" /> {student.current_streak}d
                          </span>
                        ) : null}
                      </div>

                      <div className="text-[11px] text-[#607274] space-y-1 mb-4">
                        <p>{student.grade_level || "Grade 8"} · ALMA Academy</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-[#f0ede4]">
                      {isFriend ? (
                        <div className="flex items-center gap-2">
                          <span className="flex-1 text-center py-2 text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl">
                            ✓ Friend
                          </span>
                          <Link
                            href={`/messages/${student.student_code || student._id}`}
                            className="p-2 rounded-xl bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] transition-colors"
                            title="Chat"
                          >
                            <Mail size={15} />
                          </Link>
                        </div>
                      ) : isSent ? (
                        <span className="block w-full text-center py-2 text-xs font-semibold text-[#ffa11f] bg-amber-50 rounded-xl">
                          Request Sent · Pending
                        </span>
                      ) : isReceived ? (
                        <button
                          onClick={() => handleAcceptRequest(student._id)}
                          disabled={actionLoadingId === student._id}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                        >
                          Accept Friend Request
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendRequest(student._id)}
                          disabled={actionLoadingId === student._id}
                          className="w-full py-2.5 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                        >
                          {actionLoadingId === student._id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <>
                              <UserPlus size={14} />
                              <span>Add Friend</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </main>
    </div>
  );
}
