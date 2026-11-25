"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import api from "@/services/api";
import { useAuth, getProfileImageUrl } from "@/app/_Context/AuthContext";
import {
  Inbox,
  Mail,
  Archive,
  Search,
  Plus,
  Send,
  Bold,
  Italic,
  Code,
  Smile,
  Hash,
  X,
  Loader2,
  Users,
  ShieldAlert,
  Info,
  MessageSquare,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface StudentPartner {
  _id: string;
  first_name: string;
  last_name?: string;
  student_code?: string;
  email?: string;
  grade_level?: string;
  profile_image?: string | null;
}

interface MessageItem {
  _id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  read: boolean;
  created_at: string;
  is_mine: boolean;
}

interface ThreadItem {
  partner: StudentPartner;
  last_message: {
    _id: string;
    text: string;
    created_at: string;
    is_mine: boolean;
    read: boolean;
  };
  unread_count: number;
}

interface MessagesClientProps {
  initialPartnerId?: string;
}

export default function MessagesClient({ initialPartnerId }: MessagesClientProps) {
  const router = useRouter();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<"inbox" | "unread" | "archived">("inbox");
  const [threads, setThreads] = useState<ThreadItem[]>([]);
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [activePartner, setActivePartner] = useState<StudentPartner | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [loadingConversation, setLoadingConversation] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [isSending, setIsSending] = useState(false);

  // New message picker modal
  const [newChatModalOpen, setNewChatModalOpen] = useState(false);
  const [friendsList, setFriendsList] = useState<StudentPartner[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fetch threads list
  const fetchThreads = useCallback(async () => {
    try {
      setLoadingThreads(true);
      const res = await api.get("/messages/threads");
      if (res.data?.success && res.data?.data) {
        setThreads(res.data.data);
      }
    } catch (err) {
      console.error("Error fetching message threads:", err);
    } finally {
      setLoadingThreads(false);
    }
  }, []);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  // Load conversation messages with partner
  const loadConversation = useCallback(
    async (partnerIdentifier: string) => {
      try {
        setLoadingConversation(true);
        const res = await api.get(`/messages/${encodeURIComponent(partnerIdentifier)}`);
        if (res.data?.success && res.data?.data) {
          setActivePartner(res.data.data.partner);
          setMessages(res.data.data.messages || []);
        }
      } catch (err: unknown) {
        console.error("Error loading conversation:", err);
        const error = err as { response?: { data?: { message?: string } } };
        toast.error(error.response?.data?.message || "Failed to load conversation");
      } finally {
        setLoadingConversation(false);
      }
    },
    []
  );

  useEffect(() => {
    if (initialPartnerId) {
      loadConversation(initialPartnerId);
    }
  }, [initialPartnerId, loadConversation]);

  // Fetch friends list for New Message modal
  const fetchFriends = async () => {
    try {
      setLoadingFriends(true);
      const res = await api.get("/students/friends/me");
      if (res.data?.success && res.data?.data) {
        setFriendsList(res.data.data.friends || []);
      }
    } catch (err) {
      console.error("Error fetching friends:", err);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleOpenNewChatModal = () => {
    setNewChatModalOpen(true);
    fetchFriends();
  };

  const handleSelectPartner = (partner: StudentPartner) => {
    setActivePartner(partner);
    const identifier = partner.student_code || partner._id;
    window.history.pushState(null, "", `/messages/${identifier}`);
    loadConversation(identifier);
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!messageInput.trim() || !activePartner || isSending) return;

    const textToSend = messageInput.trim();
    setMessageInput("");

    try {
      setIsSending(true);
      const identifier = activePartner.student_code || activePartner._id;
      const res = await api.post(`/messages/${identifier}`, { message: textToSend });
      if (res.data?.success && res.data?.data) {
        setMessages((prev) => [...prev, res.data.data]);
        fetchThreads(); // Refresh thread last message
      }
    } catch (err: unknown) {
      console.error("Error sending message:", err);
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(error.response?.data?.message || "Failed to send message");
      setMessageInput(textToSend); // Restore
    } finally {
      setIsSending(false);
    }
  };

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

  // Word count helper
  const wordCount = messageInput.trim() ? messageInput.trim().split(/\s+/).length : 0;

  // Filter threads by search query and active tab
  const filteredThreads = threads.filter((t) => {
    const fullName = `${t.partner.first_name} ${t.partner.last_name || ""}`.toLowerCase();
    const code = (t.partner.student_code || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchesQuery = fullName.includes(query) || code.includes(query);

    if (!matchesQuery) return false;
    if (activeTab === "unread") return t.unread_count > 0;
    return true;
  });

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-4 sm:px-8 lg:px-10 pt-20 lg:pt-8 pb-16 flex flex-col">
        {/* Main 2-Column Messaging Container (ALMA Brand Styling) */}
        <div className="w-full max-w-6xl mx-auto flex-1 flex flex-col md:flex-row bg-white rounded-3xl shadow-sm border border-[#e8eeea] overflow-hidden text-[#10292e] min-h-[660px]">
          {/* Left Column: Inbox / Conversations List */}
          <div className="w-full md:w-80 lg:w-96 border-b md:border-b-0 md:border-r border-[#e8eeea] flex flex-col bg-[#fafaf8] shrink-0">
            {/* Top Tabs: Inbox | Unread | Archived */}
            <div className="flex border-b border-[#e8eeea] text-xs font-bold bg-white">
              <button
                onClick={() => setActiveTab("inbox")}
                className={`flex-1 py-3.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "inbox"
                    ? "text-[#10292e] border-b-2 border-[#ffa11f] font-extrabold bg-[#fff8ec]/50"
                    : "text-[#607274] hover:text-[#10292e] hover:bg-[#fafaf8]"
                }`}
              >
                <Inbox size={14} />
                <span>Inbox</span>
              </button>

              <button
                onClick={() => setActiveTab("unread")}
                className={`flex-1 py-3.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "unread"
                    ? "text-[#10292e] border-b-2 border-[#ffa11f] font-extrabold bg-[#fff8ec]/50"
                    : "text-[#607274] hover:text-[#10292e] hover:bg-[#fafaf8]"
                }`}
              >
                <Mail size={14} />
                <span>Unread</span>
              </button>

              <button
                onClick={() => setActiveTab("archived")}
                className={`flex-1 py-3.5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === "archived"
                    ? "text-[#10292e] border-b-2 border-[#ffa11f] font-extrabold bg-[#fff8ec]/50"
                    : "text-[#607274] hover:text-[#10292e] hover:bg-[#fafaf8]"
                }`}
              >
                <Archive size={14} />
                <span>Archived</span>
              </button>
            </div>

            {/* Action Row: + New Message and Search input */}
            <div className="p-3 border-b border-[#e8eeea] flex items-center gap-2 bg-white">
              <button
                onClick={handleOpenNewChatModal}
                className="inline-flex items-center justify-center gap-1.5 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs px-3.5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer shrink-0"
              >
                <Plus size={14} />
                <span>New</span>
              </button>

              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8a999b]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] placeholder-[#8a999b] text-xs font-medium rounded-xl pl-8 pr-3 py-2.5 focus:outline-hidden focus:border-[#ffa11f] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Threads List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#f0ede4] no-scrollbar">
              {loadingThreads ? (
                <div className="py-14 flex flex-col items-center justify-center text-[#8a999b]">
                  <Loader2 className="w-6 h-6 animate-spin text-[#ffa11f] mb-2" />
                  <p className="text-xs font-medium">Loading conversations...</p>
                </div>
              ) : filteredThreads.length === 0 ? (
                /* Empty state */
                <div className="p-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-[#e8eeea] flex items-center justify-center mx-auto shadow-2xs text-[#8a999b]">
                    <Mail className="w-6 h-6 opacity-60" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-[#10292e]">No messages here</p>
                    <p className="text-[11px] text-[#607274] leading-relaxed max-w-[200px] mx-auto mt-1">
                      {searchQuery
                        ? "No conversation found matching your search."
                        : "Start a conversation with one of your classmates!"}
                    </p>
                  </div>
                  <button
                    onClick={handleOpenNewChatModal}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#118a80] hover:text-[#0f5953] cursor-pointer"
                  >
                    <span>+ Pick a friend to chat</span>
                  </button>
                </div>
              ) : (
                filteredThreads.map((thread) => {
                  const partner = thread.partner;
                  const partnerName = `${partner.first_name} ${partner.last_name || ""}`.trim();
                  const isSelected = activePartner?._id === partner._id;

                  return (
                    <div
                      key={partner._id}
                      onClick={() => handleSelectPartner(partner)}
                      className={`flex items-center gap-3 p-3.5 cursor-pointer transition-colors ${
                        isSelected
                          ? "bg-[#fff8ec] border-l-4 border-[#ffa11f]"
                          : "bg-white hover:bg-[#fafaf8] border-l-4 border-transparent"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e6f4f2] text-[#118a80] flex items-center justify-center font-black text-xs shadow-2xs border border-[#118a80]/20">
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
                          <p className="text-xs font-extrabold text-[#10292e] truncate">{partnerName}</p>
                          <span className="text-[10px] text-[#8a999b] shrink-0 font-medium">
                            {formatRelativeTime(thread.last_message.created_at)}
                          </span>
                        </div>
                        <p className="text-[11px] text-[#607274] truncate leading-tight">
                          {thread.last_message.is_mine && (
                            <span className="text-[#8a999b] font-medium mr-1">You:</span>
                          )}
                          {thread.last_message.text}
                        </p>
                      </div>

                      {thread.unread_count > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#ffa11f] text-[#10292e] text-[10px] font-black flex items-center justify-center shrink-0 shadow-2xs">
                          {thread.unread_count}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Footer */}
            <div className="p-3 border-t border-[#e8eeea] bg-[#fafaf8] flex items-center justify-between text-xs text-[#607274]">
              <span className="font-bold">All Messages</span>
              <button
                onClick={handleOpenNewChatModal}
                className="hover:text-[#10292e] hover:bg-[#e8eeea] p-1.5 rounded-lg transition-colors cursor-pointer"
                title="New Chat"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Right Column: Active Conversation */}
          <div className="flex-1 flex flex-col bg-white min-w-0">
            {activePartner ? (
              <>
                {/* Active Chat Header */}
                <div className="flex items-center justify-between px-6 py-3.5 border-b border-[#e8eeea] bg-white">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#e6f4f2] text-[#118a80] flex items-center justify-center font-black text-xs border border-[#118a80]/20 shadow-2xs">
                        {activePartner.profile_image ? (
                          <img
                            src={getProfileImageUrl(activePartner.profile_image)}
                            alt={`${activePartner.first_name} ${activePartner.last_name || ""}`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <>
                            {activePartner.first_name[0]}
                            {activePartner.last_name ? activePartner.last_name[0] : ""}
                          </>
                        )}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-sm font-black text-[#10292e] truncate">
                        Conversation with {activePartner.first_name} {activePartner.last_name || ""}
                      </h3>
                      <p className="text-[11px] text-[#607274]">
                        {activePartner.student_code || "Active now"} · {activePartner.grade_level || "Grade 8"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[#8a999b]">
                    <button
                      onClick={() =>
                        toast.info(
                          `${activePartner.first_name} is enrolled in ALMA Computer Science.`
                        )
                      }
                      title="Student Info"
                      className="p-2 rounded-xl text-[#607274] hover:text-[#10292e] hover:bg-[#fafaf8] border border-[#e8eeea] transition-colors cursor-pointer"
                    >
                      <Info size={16} />
                    </button>
                    <button
                      onClick={() =>
                        toast.info("Report & safety controls monitored by ALMA Academy.")
                      }
                      title="Report & Safety"
                      className="p-2 rounded-xl text-[#607274] hover:text-[#10292e] hover:bg-[#fafaf8] border border-[#e8eeea] transition-colors cursor-pointer"
                    >
                      <ShieldAlert size={16} />
                    </button>
                  </div>
                </div>

                {/* Messages Timeline */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#fafaf8] no-scrollbar">
                  {loadingConversation ? (
                    <div className="py-20 flex flex-col items-center justify-center text-[#8a999b]">
                      <Loader2 className="w-8 h-8 animate-spin text-[#ffa11f] mb-2" />
                      <p className="text-xs font-medium">Loading messages with {activePartner.first_name}...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    /* Empty conversation state */
                    <div className="py-20 text-center space-y-3">
                      <div className="w-14 h-14 rounded-2xl bg-white border border-[#e8eeea] text-[#ffa11f] flex items-center justify-center mx-auto text-2xl shadow-xs">
                        💬
                      </div>
                      <h4 className="text-sm font-extrabold text-[#10292e]">No messages yet</h4>
                      <p className="text-xs text-[#607274] max-w-sm mx-auto leading-relaxed">
                        Say hello to {activePartner.first_name}! You can discuss algorithms,
                        quizzes, or collaborate on coding exercises.
                      </p>
                    </div>
                  ) : (
                    /* Message bubbles */
                    messages.map((msg) => {
                      const isMe = msg.is_mine;
                      const senderName = isMe
                        ? user?.first_name || "You"
                        : activePartner.first_name;

                      return (
                        <div key={msg._id} className="flex items-start gap-3 group">
                          <div className="relative shrink-0 mt-0.5">
                            <div
                              className={`w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center font-bold text-xs shadow-2xs ${
                                isMe
                                  ? "bg-[#ffa11f] text-[#10292e]"
                                  : "bg-white text-[#118a80] border border-[#e8eeea]"
                              }`}
                            >
                              {isMe && user?.profile_image ? (
                                <img
                                  src={getProfileImageUrl(user.profile_image)}
                                  alt={senderName}
                                  className="w-full h-full object-cover"
                                />
                              ) : !isMe && activePartner?.profile_image ? (
                                <img
                                  src={getProfileImageUrl(activePartner.profile_image)}
                                  alt={senderName}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                senderName[0]
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-extrabold text-[#10292e]">
                                {senderName}
                              </span>
                              <span className="text-[10px] text-[#8a999b]">
                                {formatRelativeTime(msg.created_at)}
                              </span>
                            </div>

                            <div
                              className={`p-3.5 rounded-2xl text-xs leading-relaxed max-w-2xl break-words shadow-2xs ${
                                isMe
                                  ? "bg-[#10292e] text-white rounded-tr-xs"
                                  : "bg-white border border-[#e8eeea] text-[#10292e] rounded-tl-xs"
                              }`}
                            >
                              {msg.message}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Composer */}
                <div className="p-4 border-t border-[#e8eeea] bg-white space-y-2">
                  <div className="border border-[#e8eeea] rounded-2xl bg-[#fafaf8] focus-within:bg-white focus-within:border-[#ffa11f] transition-all overflow-hidden shadow-2xs">
                    {/* Rich Formatting Toolbar */}
                    <div className="flex items-center gap-1 px-3 py-2 border-b border-[#e8eeea] text-[#8a999b] text-xs bg-white/60">
                      <button
                        type="button"
                        onClick={() => setMessageInput((prev) => prev + " **bold** ")}
                        className="p-1.5 rounded-lg hover:text-[#10292e] hover:bg-[#e8eeea] transition-colors cursor-pointer"
                        title="Bold"
                      >
                        <Bold size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageInput((prev) => prev + " *italic* ")}
                        className="p-1.5 rounded-lg hover:text-[#10292e] hover:bg-[#e8eeea] transition-colors cursor-pointer"
                        title="Italic"
                      >
                        <Italic size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageInput((prev) => prev + " `code` ")}
                        className="p-1.5 rounded-lg hover:text-[#10292e] hover:bg-[#e8eeea] transition-colors cursor-pointer"
                        title="Code"
                      >
                        <Code size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageInput((prev) => prev + " # ")}
                        className="p-1.5 rounded-lg hover:text-[#10292e] hover:bg-[#e8eeea] transition-colors cursor-pointer"
                        title="Heading"
                      >
                        <Hash size={13} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setMessageInput((prev) => prev + " 😊 ")}
                        className="p-1.5 rounded-lg hover:text-[#10292e] hover:bg-[#e8eeea] transition-colors cursor-pointer"
                        title="Emoji"
                      >
                        <Smile size={13} />
                      </button>
                    </div>

                    {/* Textarea */}
                    <textarea
                      rows={3}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Please be kind and respectful in your messages. You can block and report unfriendly messages."
                      className="w-full p-3 bg-transparent text-[#10292e] placeholder-[#8a999b] text-xs resize-none focus:outline-hidden leading-relaxed"
                    />

                    {/* Composer Footer: Word count + Send button */}
                    <div className="flex items-center justify-between px-3 py-2 bg-white border-t border-[#e8eeea]">
                      <span className="text-[10px] text-[#8a999b] font-mono">
                        Words: {wordCount}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleSendMessage()}
                        disabled={!messageInput.trim() || isSending}
                        className="inline-flex items-center gap-1.5 bg-[#ffa11f] hover:bg-[#ff9400] disabled:opacity-40 disabled:hover:bg-[#ffa11f] text-[#10292e] font-black text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        {isSending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <span>Send</span>
                            <Send size={13} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* Handled empty state when student has no active conversation */
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-4 bg-[#fafaf8]">
                <div className="w-16 h-16 rounded-2xl bg-white border border-[#e8eeea] text-[#ffa11f] flex items-center justify-center text-3xl shadow-xs">
                  💬
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black text-[#10292e]">No Conversation Selected</h3>
                  <p className="text-xs text-[#607274] max-w-sm mx-auto leading-relaxed">
                    Select a conversation from the left to start messaging, or click &ldquo;New
                    Message&rdquo; to chat with a friend.
                  </p>
                </div>
                <button
                  onClick={handleOpenNewChatModal}
                  className="inline-flex items-center gap-2 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  <Plus size={14} />
                  <span>New Message</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* New Message / Pick Friend Modal */}
      {newChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => setNewChatModalOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-md bg-white text-[#10292e] rounded-3xl shadow-2xl border border-[#e8eeea] overflow-hidden flex flex-col max-h-[80vh] z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#e8eeea] bg-[#fafaf8]">
              <div className="flex items-center gap-2">
                <span className="text-lg">💬</span>
                <h3 className="text-base font-black text-[#10292e]">New Message</h3>
              </div>
              <button
                onClick={() => setNewChatModalOpen(false)}
                className="p-1.5 rounded-full text-[#8a999b] hover:text-[#10292e] hover:bg-[#e8eeea] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <p className="text-xs font-bold text-[#607274]">Choose a friend to chat with:</p>

              {loadingFriends ? (
                <div className="py-8 text-center text-[#8a999b] text-xs flex flex-col items-center">
                  <Loader2 className="w-5 h-5 animate-spin text-[#ffa11f] mb-2" />
                  Loading friends...
                </div>
              ) : friendsList.length === 0 ? (
                <div className="p-6 text-center space-y-3 bg-[#fafaf8] rounded-2xl border border-[#e8eeea]">
                  <Users className="w-8 h-8 text-[#8a999b] mx-auto opacity-50" />
                  <p className="text-xs font-extrabold text-[#10292e]">No Friends Connected Yet</p>
                  <p className="text-[11px] text-[#607274]">
                    Add classmates from the sidebar Friends tab or the search directory to begin messaging.
                  </p>
                  <button
                    onClick={() => {
                      setNewChatModalOpen(false);
                      router.push("/friends");
                    }}
                    className="inline-flex items-center gap-1.5 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    <Search size={13} />
                    <span>Find Friends Directory</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  {friendsList.map((friend) => {
                    const fullName = `${friend.first_name} ${friend.last_name || ""}`.trim();
                    return (
                      <div
                        key={friend._id}
                        onClick={() => {
                          setNewChatModalOpen(false);
                          handleSelectPartner(friend);
                        }}
                        className="flex items-center justify-between p-3 rounded-2xl bg-[#fafaf8] hover:bg-[#fff8ec] border border-[#e8eeea] cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full overflow-hidden bg-[#e6f4f2] text-[#118a80] flex items-center justify-center font-black text-xs border border-[#118a80]/20 shrink-0">
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
                          <div>
                            <p className="text-xs font-extrabold text-[#10292e]">{fullName}</p>
                            <p className="text-[10px] text-[#8a999b]">
                              {friend.student_code || "Classmate"}
                            </p>
                          </div>
                        </div>

                        <span className="text-xs font-black text-[#ffa11f]">Chat →</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
