"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import api from "@/services/api";
import { useAuth, getProfileImageUrl } from "@/app/_Context/AuthContext";
import {
  Compass,
  Sparkles,
  Trophy,
  Heart,
  Bookmark,
  Share2,
  Search,
  MessageCircle,
  Award,
  Users,
  Clock,
  Send,
  Loader2,
  CheckCircle2,
  Flame,
  ArrowRight
} from "lucide-react";
import { toast } from "sonner";

interface PostAuthor {
  _id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  role: "student" | "teacher" | "parent" | "admin";
  profile_image?: string | null;
  student_code?: string;
  grade_level?: string;
}

interface PostItem {
  _id: string;
  title?: string;
  content: string;
  tags: string[];
  visibility: "public" | "friends";
  likes_count: number;
  comments_count: number;
  shares_count: number;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  author_id: string;
  author?: PostAuthor;
  created_at: string;
  comments?: Array<{
    _id: string;
    content: string;
    author_id: string;
    author?: PostAuthor;
    created_at: string;
  }>;
}

const PRESET_TAGS = [
  "milestone",
  "python",
  "project",
  "help",
  "announcement",
  "algorithms",
  "webdev",
  "stem"
];

export default function ParentFeedsPage() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"all" | "saved">("all");

  // Comment state per post
  const [openCommentPostId, setOpenCommentPostId] = useState<string | null>(null);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [submittingComment, setSubmittingComment] = useState(false);

  // Fetch feeds from backend
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedTag) {
        params.append("tag", selectedTag);
      }
      if (searchQuery.trim()) {
        params.append("search", searchQuery.trim());
      }
      const res = await api.get(`/posts?${params.toString()}`);
      if (res.data?.success && res.data?.data) {
        setPosts(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch feeds:", err);
      toast.error("Could not load campus feeds. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [selectedTag, searchQuery]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Handle Like
  const handleLike = async (postId: string) => {
    try {
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const isLiked = !p.is_liked;
          return {
            ...p,
            is_liked: isLiked,
            likes_count: isLiked ? (p.likes_count || 0) + 1 : Math.max(0, (p.likes_count || 0) - 1),
          };
        })
      );
      await api.post(`/posts/${postId}/like`);
    } catch {
      fetchPosts();
    }
  };

  // Handle Bookmark
  const handleBookmark = async (postId: string) => {
    try {
      setPosts((prev) =>
        prev.map((p) => {
          if (p._id !== postId) return p;
          const isBookmarked = !p.is_bookmarked;
          return {
            ...p,
            is_bookmarked: isBookmarked,
          };
        })
      );
      await api.post(`/posts/${postId}/bookmark`);
      toast.success("Saved post updated");
    } catch {
      fetchPosts();
    }
  };

  // Submit comment
  const handleCommentSubmit = async (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    setSubmittingComment(true);
    try {
      const res = await api.post(`/posts/${postId}/comments`, { content: text });
      if (res.data?.success) {
        toast.success("Encouraging comment posted!");
        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
        fetchPosts();
      }
    } catch {
      toast.error("Failed to post comment.");
    } finally {
      setSubmittingComment(false);
    }
  };

  // Filter posts
  const displayedPosts = useMemo(() => {
    return posts.filter((post) => {
      if (activeTab === "saved") {
        return Boolean(post.is_bookmarked);
      }
      return true;
    });
  }, [posts, activeTab]);

  return (
    <div className="w-full min-h-screen px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#e8eeea] shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-[#ffa11f]/20 text-[#ffa11f] flex items-center justify-center font-bold shadow-2xs">
              <Compass size={20} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#10292e]">
              Academy Feeds
            </h1>
          </div>
          <p className="text-xs text-[#607274] max-w-lg leading-relaxed">
            Follow classroom milestones, project showcases, and student achievements from teachers and classmates.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2 bg-[#fafaf8] p-1.5 rounded-2xl border border-[#e8eeea] self-start sm:self-auto">
          <button
            onClick={() => setActiveTab("all")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "all"
                ? "bg-white text-[#10292e] shadow-xs"
                : "text-[#607274] hover:text-[#10292e]"
            }`}
          >
            All Activity
          </button>
          <button
            onClick={() => setActiveTab("saved")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "saved"
                ? "bg-white text-[#10292e] shadow-xs"
                : "text-[#607274] hover:text-[#10292e]"
            }`}
          >
            Saved Posts
          </button>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Post Feed (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search & Tag Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-[#e8eeea] shadow-xs space-y-3">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8a999b]"
              />
              <input
                type="text"
                placeholder="Search feeds, topics, milestones..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] text-xs text-[#10292e] font-medium focus:outline-hidden focus:border-[#ffa11f] transition-all"
              />
            </div>

            {/* Tag Pills */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-[#8a999b] mr-1">Topics:</span>
              <button
                onClick={() => setSelectedTag(null)}
                className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                  selectedTag === null
                    ? "bg-[#ffa11f] text-[#10292e] border-[#ffa11f]"
                    : "bg-[#fafaf8] text-[#607274] border-[#e8eeea] hover:bg-white"
                }`}
              >
                All
              </button>
              {PRESET_TAGS.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border transition-all cursor-pointer ${
                    selectedTag === tag
                      ? "bg-[#ffa11f] text-[#10292e] border-[#ffa11f]"
                      : "bg-[#fafaf8] text-[#607274] border-[#e8eeea] hover:bg-white"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>

          {/* Posts List */}
          {loading ? (
            <div className="bg-white rounded-3xl border border-[#e8eeea] p-12 text-center shadow-xs">
              <Loader2 className="w-8 h-8 animate-spin text-[#ffa11f] mx-auto mb-3" />
              <p className="text-sm font-bold text-[#10292e]">Loading campus activity...</p>
            </div>
          ) : displayedPosts.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#e8eeea] p-12 text-center shadow-xs space-y-3">
              <Compass className="w-10 h-10 text-[#8a999b] mx-auto opacity-50" />
              <h3 className="font-extrabold text-base text-[#10292e]">No activity yet</h3>
              <p className="text-xs text-[#8a999b] max-w-sm mx-auto">
                {activeTab === "saved"
                  ? "You haven't bookmarked any posts yet. Click the bookmark icon on posts to save them here."
                  : "No posts match your search or filter. Try clearing filters to see more activity."}
              </p>
            </div>
          ) : (
            displayedPosts.map((post) => {
              const authorName =
                post.author?.name ||
                `${post.author?.first_name || ""} ${post.author?.last_name || ""}`.trim() ||
                "Academy Member";
              const authorRole = post.author?.role || "student";
              const initials = authorName
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase() || "AM";

              return (
                <article
                  key={post._id}
                  className="bg-white rounded-3xl border border-[#e8eeea] p-5 sm:p-6 shadow-xs space-y-4 transition-all hover:border-[#ffa11f]/40"
                >
                  {/* Author Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-[#ffa11f]/20 text-[#ffa11f] font-black text-sm flex items-center justify-center border border-[#ffa11f]/30 shrink-0">
                        {post.author?.profile_image ? (
                          <img
                            src={getProfileImageUrl(post.author.profile_image)}
                            alt={authorName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span>{initials}</span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-[#10292e]">
                            {authorName}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                              authorRole === "teacher"
                                ? "bg-[#dff0fa] text-[#2b88d8]"
                                : authorRole === "parent"
                                ? "bg-[#fdecd2] text-[#b45309]"
                                : "bg-[#e6f5f2] text-[#118a80]"
                            }`}
                          >
                            {authorRole}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#8a999b] flex items-center gap-1.5 mt-0.5">
                          <Clock size={11} />
                          <span>{new Date(post.created_at).toLocaleDateString()}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Title & Content */}
                  <div className="space-y-1.5">
                    {post.title && (
                      <h3 className="font-extrabold text-base text-[#10292e]">
                        {post.title}
                      </h3>
                    )}
                    <p className="text-xs sm:text-sm text-[#475569] leading-relaxed whitespace-pre-wrap">
                      {post.content}
                    </p>
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="bg-[#fafaf8] text-[#607274] border border-[#e8eeea] text-[10px] font-bold px-2 py-0.5 rounded-lg"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-[#f0ede4] text-xs text-[#607274] font-bold">
                    <div className="flex items-center gap-4">
                      {/* Like */}
                      <button
                        onClick={() => handleLike(post._id)}
                        className={`flex items-center gap-1.5 p-1.5 rounded-xl transition-all cursor-pointer ${
                          post.is_liked
                            ? "text-rose-600 bg-rose-50"
                            : "hover:text-[#10292e] hover:bg-[#fafaf8]"
                        }`}
                      >
                        <Heart
                          size={15}
                          className={post.is_liked ? "fill-rose-500 text-rose-500" : ""}
                        />
                        <span>{post.likes_count || 0}</span>
                      </button>

                      {/* Comment Toggle */}
                      <button
                        onClick={() =>
                          setOpenCommentPostId(
                            openCommentPostId === post._id ? null : post._id
                          )
                        }
                        className="flex items-center gap-1.5 p-1.5 rounded-xl hover:text-[#10292e] hover:bg-[#fafaf8] transition-all cursor-pointer"
                      >
                        <MessageCircle size={15} />
                        <span>{post.comments_count || post.comments?.length || 0}</span>
                      </button>
                    </div>

                    {/* Bookmark */}
                    <button
                      onClick={() => handleBookmark(post._id)}
                      title={post.is_bookmarked ? "Saved" : "Save post"}
                      className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                        post.is_bookmarked
                          ? "text-[#ffa11f] bg-amber-50"
                          : "hover:text-[#10292e] hover:bg-[#fafaf8]"
                      }`}
                    >
                      <Bookmark
                        size={15}
                        className={post.is_bookmarked ? "fill-[#ffa11f] text-[#ffa11f]" : ""}
                      />
                    </button>
                  </div>

                  {/* Comment Section (Expandable) */}
                  {openCommentPostId === post._id && (
                    <div className="pt-3 border-t border-[#f0ede4] space-y-3">
                      {/* Comment Input */}
                      <div className="flex gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Write words of encouragement..."
                          value={commentInputs[post._id] || ""}
                          onChange={(e) =>
                            setCommentInputs((prev) => ({
                              ...prev,
                              [post._id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleCommentSubmit(post._id);
                          }}
                          className="flex-1 px-4 py-2 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] text-xs text-[#10292e] focus:outline-hidden focus:border-[#ffa11f]"
                        />
                        <button
                          type="button"
                          onClick={() => handleCommentSubmit(post._id)}
                          disabled={submittingComment || !commentInputs[post._id]?.trim()}
                          className="p-2 rounded-2xl bg-[#ffa11f] hover:bg-[#e69018] text-[#10292e] disabled:opacity-50 transition-colors cursor-pointer"
                        >
                          {submittingComment ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Send size={14} />
                          )}
                        </button>
                      </div>

                      {/* Comments List */}
                      {post.comments && post.comments.length > 0 && (
                        <div className="space-y-2 pt-2">
                          {post.comments.map((c) => (
                            <div
                              key={c._id}
                              className="bg-[#fafaf8] p-3 rounded-2xl border border-[#f0ede4] text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between font-bold text-[#10292e]">
                                <span>
                                  {c.author?.name ||
                                    `${c.author?.first_name || ""} ${c.author?.last_name || ""}`.trim() ||
                                    "Member"}
                                </span>
                                <span className="text-[10px] text-[#8a999b] font-normal">
                                  {new Date(c.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-[#607274]">{c.content}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })
          )}
        </div>

        {/* Right Rail: Parent Guidance & Children Shortcuts (4 cols) */}
        <aside className="lg:col-span-4 space-y-6">
          {/* Children Activity Shortcut Card */}
          <div className="bg-white rounded-3xl border border-[#e8eeea] p-5 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#118a80]/15 text-[#118a80] flex items-center justify-center font-bold">
                <Users size={16} />
              </div>
              <div>
                <h3 className="text-xs font-black text-[#10292e]">Linked Children</h3>
                <p className="text-[10px] text-[#8a999b]">Track direct progress</p>
              </div>
            </div>

            <p className="text-xs text-[#607274] leading-relaxed">
              Check completed coding checkpoints, badges, and weekly streaks for each linked child.
            </p>

            <Link
              href="/parent/children"
              className="w-full inline-flex items-center justify-center gap-2 bg-[#e6f5f2] hover:bg-[#d5ede8] text-[#118a80] font-black text-xs py-2.5 rounded-xl transition-all shadow-2xs"
            >
              <span>View Children Details</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {/* Guidelines Card */}
          <div className="bg-linear-to-br from-[#fafaf8] to-[#f4f7f5] rounded-3xl border border-[#e8eeea] p-5 shadow-2xs space-y-2">
            <div className="flex items-center gap-2 text-xs font-black text-[#10292e]">
              <Sparkles size={14} className="text-[#ffa11f]" />
              <span>Parent Community Insights</span>
            </div>
            <ul className="text-[11px] text-[#607274] space-y-1.5 leading-relaxed list-disc list-inside">
              <li>Celebrate coding attempts even when bugs occur.</li>
              <li>Encourage daily 15-minute coding streaks.</li>
              <li>Read feedback from teachers on class groups.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
