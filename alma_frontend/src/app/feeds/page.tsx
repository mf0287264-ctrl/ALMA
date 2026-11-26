"use client";

import { apiError } from "@/lib/api-error";

import { deferRequest } from "@/lib/defer-request";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TeacherSidebar from "@/components/TeacherSidebar";
import ParentSidebar from "@/components/ParentSidebar";
import api from "@/services/api";
import { useAuth } from "@/app/_Context/AuthContext";
import {
  Compass,
  Sparkles,
  Trophy,
  Heart,
  Bookmark,
  Share2,
  Trash2,
  Search,
  Plus,
  Send,
  Loader2,
  Award,
  Globe,
  Users,
  Lock,
  Tag,
  Hash,
  MessageCircle,
  MoreVertical,
  CheckCircle2,
  Flame,
  X,
  Repeat,
  Clock,
  BookOpen,
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

interface SharedFrom {
  post_id: string;
  author_id?: string;
  author_name?: string;
  author_role?: string;
  content?: string;
  media?: string[];
}

interface PostItem {
  _id: string;
  title?: string | null;
  content: string;
  author_id: string;
  author_name: string;
  author_role: "student" | "teacher" | "parent" | "admin";
  author_image?: string | null;
  likes_count: number;
  bookmarks_count: number;
  shares_count: number;
  tags: string[];
  visibility: "public" | "friends" | "followers";
  created_at: string;
  is_liked?: boolean;
  is_bookmarked?: boolean;
  shared_from?: SharedFrom | null;
}

interface AchievementOption {
  course_id?: string;
  course_title: string;
  badge_title: string;
  earned_at?: string;
  color?: string;
}

const PRESET_TAGS = [
  "achievement",
  "algorithms",
  "python",
  "study-tips",
  "questions",
  "announcement",
  "compete",
];

export default function FeedsPage() {
  const router = useRouter();
  const { user, role } = useAuth();

  const effectiveRole = role || user?.role || "student";

  useEffect(() => {
    if (effectiveRole === "parent") {
      router.replace("/parent/feeds");
    }
  }, [effectiveRole, router]);

  const [posts, setPosts] = useState<PostItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "achievements" | "my_posts" | "saved">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // New Post Form State
  const [postTitle, setPostTitle] = useState("");
  const [postContent, setPostContent] = useState("");
  const [postTags, setPostTags] = useState<string[]>([]);
  const [customTagInput, setCustomTagInput] = useState("");
  const [postVisibility, setPostVisibility] = useState<"public" | "friends">("public");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);

  // Achievement Sharing Modal
  const [achievementModalOpen, setAchievementModalOpen] = useState(false);
  const [availableAchievements, setAvailableAchievements] = useState<AchievementOption[]>([]);
  const [loadingAchievements, setLoadingAchievements] = useState(false);

  // Repost / Share Modal
  const [shareModalPost, setShareModalPost] = useState<PostItem | null>(null);
  const [shareComment, setShareComment] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  // Render appropriate sidebar based on role
  const renderRoleSidebar = () => {
    if (effectiveRole === "teacher") return <TeacherSidebar />;
    if (effectiveRole === "parent") return <ParentSidebar />;
    return <Sidebar />;
  };

  // Fetch posts from backend
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
      const url = `/posts?${params.toString()}`;
      const res = await api.get(url);
      if (res.data?.success && res.data?.data) {
        setPosts(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch feeds:", err);
      toast.error("Could not load feeds. Please refresh.");
    } finally {
      setLoading(false);
    }
  }, [selectedTag, searchQuery]);

  useEffect(() => {
    return deferRequest(() => {
      fetchPosts();
    });
  }, [fetchPosts]);

  // Load earned achievements for quick sharing
  const loadEarnedAchievements = async () => {
    try {
      setLoadingAchievements(true);
      const res = await api.get("/achievements");
      if (res.data?.success && res.data?.data?.earned) {
        setAvailableAchievements(res.data.data.earned);
      } else {
        // Fallback default achievements
        setAvailableAchievements([
          {
            course_title: "Algorithms Lab",
            badge_title: "Algorithmic Master",
            color: "#ffa11f",
          },
          {
            course_title: "Intro to Python",
            badge_title: "Python Pioneer",
            color: "#118a80",
          },
          {
            course_title: "Data Basics",
            badge_title: "Data Structurer",
            color: "#9333ea",
          },
        ]);
      }
    } catch (err) {
      console.error("Error loading achievements:", err);
      setAvailableAchievements([
        {
          course_title: "Algorithms Lab",
          badge_title: "Algorithmic Master",
          color: "#ffa11f",
        },
      ]);
    } finally {
      setLoadingAchievements(false);
    }
  };

  const handleOpenAchievementModal = () => {
    setAchievementModalOpen(true);
    loadEarnedAchievements();
  };

  const handlePickAchievement = (ach: AchievementOption) => {
    setAchievementModalOpen(false);
    setIsComposerExpanded(true);
    setPostTitle(`Earned the "${ach.badge_title}" Badge! 🏆`);
    setPostContent(
      `Excited to share that I just completed ${ach.course_title} and unlocked the "${ach.badge_title}" achievement! Loving the step-by-step adaptive lessons at ALMA.`
    );
    if (!postTags.includes("achievement")) {
      setPostTags((prev) => [...prev, "achievement"]);
    }
    toast.success(`Achievement "${ach.badge_title}" attached to post!`);
  };

  // Tag helper
  const handleToggleTag = (tag: string) => {
    setPostTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleAddCustomTag = () => {
    const clean = customTagInput.trim().toLowerCase().replace(/^#/, "");
    if (clean && !postTags.includes(clean)) {
      setPostTags((prev) => [...prev, clean]);
      setCustomTagInput("");
    }
  };

  // Submit new post
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!postContent.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const payload = {
        title: postTitle.trim() || null,
        content: postContent.trim(),
        tags: postTags,
        visibility: postVisibility,
      };

      const res = await api.post("/posts", payload);
      if (res.data?.success && res.data?.data) {
        toast.success("Post published to Campus Feed! 🎉");
        setPosts((prev) => [res.data.data, ...prev]);
        setPostTitle("");
        setPostContent("");
        setPostTags([]);
        setIsComposerExpanded(false);
      }
    } catch (err: unknown) {
      console.error("Failed to create post:", err);
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(apiError(error, "Failed to publish post"));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle Like
  const handleLike = async (postId: string) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id === postId) {
          const currentlyLiked = !!p.is_liked;
          return {
            ...p,
            is_liked: !currentlyLiked,
            likes_count: currentlyLiked ? Math.max(0, p.likes_count - 1) : p.likes_count + 1,
          };
        }
        return p;
      })
    );

    try {
      await api.put(`/posts/${postId}/like`);
    } catch (err) {
      console.error("Error toggling like:", err);
      fetchPosts(); // Rollback
    }
  };

  // Toggle Bookmark
  const handleBookmark = async (postId: string) => {
    // Optimistic UI update
    setPosts((prev) =>
      prev.map((p) => {
        if (p._id === postId) {
          const currentlyBm = !!p.is_bookmarked;
          return {
            ...p,
            is_bookmarked: !currentlyBm,
            bookmarks_count: currentlyBm
              ? Math.max(0, p.bookmarks_count - 1)
              : p.bookmarks_count + 1,
          };
        }
        return p;
      })
    );

    try {
      const res = await api.put(`/posts/${postId}/bookmark`);
      if (res.data?.data?.is_bookmarked) {
        toast.success("Post saved to bookmarks!");
      } else {
        toast.info("Post removed from bookmarks");
      }
    } catch (err) {
      console.error("Error toggling bookmark:", err);
      fetchPosts();
    }
  };

  // Delete Post
  const handleDeletePost = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      await api.delete(`/posts/${postId}`);
      toast.success("Post deleted");
      setPosts((prev) => prev.filter((p) => p._id !== postId));
    } catch (err: unknown) {
      console.error("Error deleting post:", err);
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(apiError(error, "Failed to delete post"));
    }
  };

  // Repost / Share
  const handleShareSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shareModalPost || isSharing) return;

    try {
      setIsSharing(true);
      const res = await api.post(`/posts/${shareModalPost._id}/share`, {
        content: shareComment.trim() || undefined,
        visibility: "public",
      });
      if (res.data?.success && res.data?.data) {
        toast.success("Reposted to your feed! 🚀");
        setPosts((prev) => [res.data.data, ...prev]);
        setShareModalPost(null);
        setShareComment("");
      }
    } catch (err: unknown) {
      console.error("Error sharing post:", err);
      const error = err as { response?: { data?: { message?: string } } };
      toast.error(apiError(error, "Failed to share post"));
    } finally {
      setIsSharing(false);
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
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "Recently";
    }
  };

  // Filter posts based on active tab
  const filteredPosts = useMemo(() => {
    const currentUserId = user?._id || user?.id;

    return posts.filter((p) => {
      if (activeTab === "achievements") {
        return (
          p.tags?.includes("achievement") ||
          p.title?.toLowerCase().includes("badge") ||
          p.content?.toLowerCase().includes("achievement")
        );
      }
      if (activeTab === "my_posts") {
        return p.author_id === currentUserId;
      }
      if (activeTab === "saved") {
        return !!p.is_bookmarked;
      }
      return true;
    });
  }, [posts, activeTab, user]);

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      {/* Role-based Dashboard Sidebar */}
      {renderRoleSidebar()}

      {/* Main Feeds Content Container */}
      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-4 sm:px-6 lg:px-10 pt-20 lg:pt-8 pb-16">
        <div className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Main Feed Column (Center) */}
          <div className="flex-1 min-w-0 space-y-6">
            {/* Feeds Hero Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#e8eeea] shadow-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-2xl bg-[#ffa11f]/20 text-[#ffa11f] flex items-center justify-center font-bold shadow-2xs">
                    <Compass size={20} />
                  </div>
                  <h1 className="text-xl sm:text-2xl font-black text-[#10292e]">
                    Campus Feeds
                  </h1>
                </div>
                <p className="text-xs text-[#607274] max-w-md leading-relaxed">
                  Connect with classmates & teachers, share coding milestones, ask questions, and celebrate unlocked achievements.
                </p>
              </div>

              <button
                onClick={() => setIsComposerExpanded(true)}
                className="inline-flex items-center gap-2 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-center"
              >
                <Plus size={16} />
                <span>Create Post</span>
              </button>
            </div>

            {/* Post Composer Card */}
            <div className="bg-white rounded-3xl border border-[#e8eeea] shadow-xs p-5 transition-all">
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#118a80] to-[#0f5953] text-white flex items-center justify-center font-black text-sm shrink-0 shadow-2xs">
                    {user?.first_name ? user.first_name[0] : "A"}
                    {user?.last_name ? user.last_name[0] : ""}
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    {isComposerExpanded && (
                      <input
                        type="text"
                        value={postTitle}
                        onChange={(e) => setPostTitle(e.target.value)}
                        placeholder="Add a title or milestone header (optional)..."
                        className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] placeholder-[#8a999b] text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-[#ffa11f] focus:bg-white transition-all"
                      />
                    )}

                    <textarea
                      rows={isComposerExpanded ? 3 : 2}
                      value={postContent}
                      onFocus={() => setIsComposerExpanded(true)}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share a thought, coding question, or celebrate an achievement..."
                      className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] placeholder-[#8a999b] text-xs font-medium rounded-2xl p-3.5 focus:outline-hidden focus:border-[#ffa11f] focus:bg-white resize-none transition-all leading-relaxed"
                    />
                  </div>
                </div>

                {/* Selected Tags Chips */}
                {postTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pl-13">
                    {postTags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 bg-[#fff7ee] text-[#10292e] border border-[#ffd599] text-[10px] font-bold px-2 py-0.5 rounded-full"
                      >
                        #{tag}
                        <button
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className="hover:text-red-500 cursor-pointer"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}

                {/* Composer Action Toolbar */}
                {isComposerExpanded && (
                  <div className="pt-3 border-t border-[#f0ede4] flex flex-wrap items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Share Achievement Button */}
                      <button
                        type="button"
                        onClick={handleOpenAchievementModal}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-all cursor-pointer shadow-2xs"
                      >
                        <Trophy size={14} className="text-[#ffa11f]" />
                        <span>Share Achievement</span>
                      </button>

                      {/* Tag Pills */}
                      <div className="hidden sm:flex items-center gap-1">
                        {PRESET_TAGS.slice(0, 4).map((ptag) => (
                          <button
                            key={ptag}
                            type="button"
                            onClick={() => handleToggleTag(ptag)}
                            className={`text-[10px] font-bold px-2 py-1 rounded-lg border transition-colors cursor-pointer ${
                              postTags.includes(ptag)
                                ? "bg-[#ffa11f] text-[#10292e] border-[#ffa11f]"
                                : "bg-white text-[#607274] border-[#e8eeea] hover:bg-[#fafaf8]"
                            }`}
                          >
                            #{ptag}
                          </button>
                        ))}
                      </div>

                      {/* Visibility Selector */}
                      <select
                        value={postVisibility}
                        onChange={(e) => setPostVisibility(e.target.value as "public" | "friends")}
                        className="text-xs font-medium bg-[#fafaf8] border border-[#e8eeea] text-[#607274] rounded-xl px-2.5 py-1.5 focus:outline-hidden cursor-pointer"
                      >
                        <option value="public">🌐 Public (Campus)</option>
                        <option value="friends">👥 Friends Only</option>
                      </select>
                    </div>

                    <div className="flex items-center gap-2 ml-auto">
                      <button
                        type="button"
                        onClick={() => {
                          setIsComposerExpanded(false);
                          setPostTitle("");
                          setPostContent("");
                          setPostTags([]);
                        }}
                        className="text-xs font-bold text-[#8a999b] hover:text-[#10292e] px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={!postContent.trim() || isSubmitting}
                        className="inline-flex items-center gap-1.5 bg-[#ffa11f] hover:bg-[#ff9400] disabled:opacity-40 disabled:hover:bg-[#ffa11f] text-[#10292e] font-black text-xs px-5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
                      >
                        {isSubmitting ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <>
                            <span>Publish</span>
                            <Send size={13} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>

            {/* Filter Tabs & Search Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#e8eeea] shadow-xs">
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => setActiveTab("all")}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTab === "all"
                      ? "bg-[#fff7ee] text-[#10292e] border border-[#ffd599]"
                      : "text-[#607274] hover:text-[#10292e] hover:bg-[#fafaf8]"
                  }`}
                >
                  All Posts
                </button>
                <button
                  onClick={() => setActiveTab("achievements")}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTab === "achievements"
                      ? "bg-[#fff7ee] text-[#10292e] border border-[#ffd599]"
                      : "text-[#607274] hover:text-[#10292e] hover:bg-[#fafaf8]"
                  }`}
                >
                  <Trophy size={13} className="text-[#ffa11f]" />
                  <span>Achievements</span>
                </button>
                <button
                  onClick={() => setActiveTab("my_posts")}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTab === "my_posts"
                      ? "bg-[#fff7ee] text-[#10292e] border border-[#ffd599]"
                      : "text-[#607274] hover:text-[#10292e] hover:bg-[#fafaf8]"
                  }`}
                >
                  My Posts
                </button>
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                    activeTab === "saved"
                      ? "bg-[#fff7ee] text-[#10292e] border border-[#ffd599]"
                      : "text-[#607274] hover:text-[#10292e] hover:bg-[#fafaf8]"
                  }`}
                >
                  Saved
                </button>
              </div>

              <div className="relative min-w-[200px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#8a999b]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search posts or #tag..."
                  className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] placeholder-[#8a999b] text-xs font-medium rounded-xl pl-8 pr-3 py-2 focus:outline-hidden focus:border-[#ffa11f] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Tag Filter Active Pill */}
            {selectedTag && (
              <div className="flex items-center gap-2 px-2">
                <span className="text-xs text-[#607274]">Filtered by:</span>
                <span className="inline-flex items-center gap-1.5 bg-[#ffa11f]/20 text-[#10292e] text-xs font-extrabold px-3 py-1 rounded-full border border-[#ffa11f]/30">
                  #{selectedTag}
                  <button
                    onClick={() => setSelectedTag(null)}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              </div>
            )}

            {/* Posts Timeline Stream */}
            <div className="space-y-4">
              {loading ? (
                <div className="py-20 flex flex-col items-center justify-center text-[#8a999b] bg-white rounded-3xl border border-[#e8eeea]">
                  <Loader2 className="w-8 h-8 animate-spin text-[#ffa11f] mb-2" />
                  <p className="text-xs font-medium">Loading campus feeds...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                /* Empty Feed State */
                <div className="py-16 text-center space-y-3 bg-white rounded-3xl border border-[#e8eeea] p-8 shadow-xs">
                  <div className="w-14 h-14 rounded-2xl bg-[#fff8ec] border border-[#f0ede4] text-[#ffa11f] flex items-center justify-center mx-auto text-2xl shadow-xs">
                    💬
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-[#10292e]">No Posts Found</h3>
                    <p className="text-xs text-[#607274] max-w-sm mx-auto leading-relaxed mt-1">
                      {searchQuery || selectedTag
                        ? "No posts match your search or filter. Try a different tag."
                        : "Be the first to share a coding milestone or achievement with the academy!"}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsComposerExpanded(true)}
                    className="inline-flex items-center gap-1.5 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Create a Post</span>
                  </button>
                </div>
              ) : (
                /* Render Post Cards */
                filteredPosts.map((post) => {
                  const isAuthor =
                    post.author_id === (user?._id || user?.id) ||
                    user?.role === "admin";
                  const isAchievementPost =
                    post.tags?.includes("achievement") ||
                    post.title?.toLowerCase().includes("badge") ||
                    post.content?.toLowerCase().includes("achievement");

                  return (
                    <article
                      key={post._id}
                      className="bg-white rounded-3xl border border-[#e8eeea] p-5 shadow-xs space-y-3.5 transition-all hover:shadow-sm"
                    >
                      {/* Author Header */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="relative shrink-0">
                            <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#118a80] to-[#0f5953] text-white flex items-center justify-center font-black text-xs shadow-2xs border border-[#118a80]/20">
                              {post.author_name[0] || "A"}
                            </div>
                            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                          </div>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-xs font-black text-[#10292e] truncate">
                                {post.author_name}
                              </h4>
                              <span
                                className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                  post.author_role === "teacher"
                                    ? "bg-[#e6f5f2] text-[#118a80]"
                                    : post.author_role === "admin"
                                    ? "bg-purple-100 text-purple-800"
                                    : post.author_role === "parent"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-[#dff0fa] text-[#2b88d8]"
                                }`}
                              >
                                {post.author_role}
                              </span>
                            </div>

                            <p className="text-[10px] text-[#8a999b]">
                              {formatRelativeTime(post.created_at)} · {post.visibility === "public" ? "🌐 Campus" : "👥 Friends"}
                            </p>
                          </div>
                        </div>

                        {/* Author Actions (Delete) */}
                        {isAuthor && (
                          <button
                            onClick={() => handleDeletePost(post._id)}
                            title="Delete post"
                            className="p-1.5 rounded-lg text-[#8a999b] hover:text-red-500 hover:bg-[#fafaf8] transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>

                      {/* Post Title if present */}
                      {post.title && (
                        <h3 className="text-sm font-black text-[#10292e] leading-snug">
                          {post.title}
                        </h3>
                      )}

                      {/* Post Content */}
                      <p className="text-xs text-[#2d3a3d] leading-relaxed whitespace-pre-line">
                        {post.content}
                      </p>

                      {/* Achievement Showcase Callout Card */}
                      {isAchievementPost && (
                        <div className="rounded-2xl bg-linear-to-r from-[#fff7ee] via-[#fffbf4] to-[#fff3e0] border border-[#ffd599] p-3.5 flex items-center gap-3.5 shadow-2xs">
                          <div className="w-11 h-11 rounded-2xl bg-[#ffa11f] text-[#10292e] flex items-center justify-center text-xl shadow-xs shrink-0">
                            🏆
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 block">
                              Course Milestone Unlocked
                            </span>
                            <p className="text-xs font-black text-[#10292e] truncate">
                              ALMA Academy Achievement
                            </p>
                            <p className="text-[10px] text-[#607274]">
                              Verified completion in ALMA Adaptive Tutor curriculum
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Embedded Shared Post (if repost) */}
                      {post.shared_from && (
                        <div className="p-3.5 rounded-2xl bg-[#fafaf8] border border-[#e8eeea] space-y-1.5 text-xs">
                          <div className="flex items-center gap-2 text-[11px] text-[#8a999b] font-bold">
                            <Repeat size={12} className="text-[#ffa11f]" />
                            <span>Shared from {post.shared_from.author_name || "Classmate"}</span>
                          </div>
                          <p className="text-xs text-[#2d3a3d] italic leading-relaxed">
                            &ldquo;{post.shared_from.content}&rdquo;
                          </p>
                        </div>
                      )}

                      {/* Tags Bar */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {post.tags.map((t) => (
                            <button
                              key={t}
                              onClick={() => setSelectedTag(t)}
                              className="text-[10px] font-extrabold text-[#118a80] hover:text-[#0f5953] bg-[#e6f4f2]/60 hover:bg-[#e6f4f2] px-2 py-0.5 rounded-md transition-colors cursor-pointer"
                            >
                              #{t}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* Action Bar (Like, Share, Bookmark) */}
                      <div className="pt-2.5 border-t border-[#f0ede4] flex items-center justify-between text-[#607274] text-xs">
                        <div className="flex items-center gap-4">
                          {/* Like Button */}
                          <button
                            onClick={() => handleLike(post._id)}
                            className={`inline-flex items-center gap-1.5 py-1 px-2.5 rounded-xl transition-all cursor-pointer ${
                              post.is_liked
                                ? "text-rose-600 bg-rose-50 font-black"
                                : "hover:text-[#10292e] hover:bg-[#fafaf8]"
                            }`}
                          >
                            <Heart
                              size={15}
                              className={post.is_liked ? "fill-rose-500 text-rose-500" : ""}
                            />
                            <span>{post.likes_count || 0}</span>
                          </button>

                          {/* Share / Repost Button */}
                          <button
                            onClick={() => {
                              setShareModalPost(post);
                              setShareComment("");
                            }}
                            className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-xl hover:text-[#10292e] hover:bg-[#fafaf8] transition-all cursor-pointer"
                          >
                            <Share2 size={15} />
                            <span>{post.shares_count || 0}</span>
                          </button>
                        </div>

                        {/* Bookmark Button */}
                        <button
                          onClick={() => handleBookmark(post._id)}
                          title={post.is_bookmarked ? "Remove bookmark" : "Save post"}
                          className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                            post.is_bookmarked
                              ? "text-[#ffa11f] bg-amber-50"
                              : "hover:text-[#10292e] hover:bg-[#fafaf8]"
                          }`}
                        >
                          <Bookmark
                            size={16}
                            className={post.is_bookmarked ? "fill-[#ffa11f] text-[#ffa11f]" : ""}
                          />
                        </button>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Rail: Community Pulse, Trending & Badges Showcase */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6">
            {/* Quick Share Achievement Card */}
            <div className="bg-white rounded-3xl border border-[#e8eeea] p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#ffa11f]/20 text-[#ffa11f] flex items-center justify-center font-bold">
                  <Trophy size={16} />
                </div>
                <div>
                  <h3 className="text-xs font-black text-[#10292e]">Showcase Milestone</h3>
                  <p className="text-[10px] text-[#8a999b]">Celebrate what you unlocked</p>
                </div>
              </div>

              <p className="text-xs text-[#607274] leading-relaxed">
                Completed a course or finished diagnostic checkpoints? Share your badge to inspire classmates!
              </p>

              <button
                onClick={handleOpenAchievementModal}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#fff7ee] hover:bg-[#ffedd5] text-[#10292e] border border-[#ffd599] font-black text-xs py-2.5 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <Award size={15} className="text-[#ffa11f]" />
                <span>Pick Badge to Share</span>
              </button>
            </div>

            {/* Trending Academy Topics */}
            <div className="bg-white rounded-3xl border border-[#e8eeea] p-5 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Flame size={16} className="text-[#ffa11f]" />
                <h3 className="text-xs font-black text-[#10292e]">Trending Topics</h3>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {PRESET_TAGS.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag === selectedTag ? null : tag)}
                    className={`text-xs font-extrabold px-3 py-1.5 rounded-xl border transition-all cursor-pointer ${
                      selectedTag === tag
                        ? "bg-[#ffa11f] text-[#10292e] border-[#ffa11f] shadow-2xs"
                        : "bg-[#fafaf8] text-[#607274] border-[#e8eeea] hover:bg-white hover:text-[#10292e]"
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Community Values */}
            <div className="bg-linear-to-br from-[#fafaf8] to-[#f4f7f5] rounded-3xl border border-[#e8eeea] p-5 shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-xs font-black text-[#10292e]">
                <Sparkles size={14} className="text-[#118a80]" />
                <span>ALMA Community Guidelines</span>
              </div>
              <ul className="text-[11px] text-[#607274] space-y-1.5 leading-relaxed list-disc list-inside">
                <li>Be encouraging and celebrate classmates&apos; progress.</li>
                <li>Share pseudocode and concepts, not direct test answers.</li>
                <li>Tag discussions for easier search and collaboration.</li>
              </ul>
            </div>
          </aside>
        </div>
      </main>

      {/* Share Achievement Modal */}
      {achievementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => setAchievementModalOpen(false)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-md bg-white text-[#10292e] rounded-3xl shadow-2xl border border-[#e8eeea] overflow-hidden flex flex-col max-h-[80vh] z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#e8eeea] bg-[#fafaf8]">
              <div className="flex items-center gap-2">
                <span className="text-xl">🏆</span>
                <div>
                  <h3 className="text-sm font-black text-[#10292e]">Select Achievement to Share</h3>
                  <p className="text-[10px] text-[#8a999b]">Choose an unlocked milestone</p>
                </div>
              </div>
              <button
                onClick={() => setAchievementModalOpen(false)}
                className="p-1.5 rounded-full text-[#8a999b] hover:text-[#10292e] hover:bg-[#e8eeea] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-2.5">
              {loadingAchievements ? (
                <div className="py-10 text-center text-[#8a999b] text-xs flex flex-col items-center">
                  <Loader2 className="w-6 h-6 animate-spin text-[#ffa11f] mb-2" />
                  Loading your achievements...
                </div>
              ) : availableAchievements.length === 0 ? (
                <div className="p-6 text-center space-y-2 bg-[#fafaf8] rounded-2xl border border-[#e8eeea]">
                  <Trophy className="w-8 h-8 text-[#8a999b] mx-auto opacity-50" />
                  <p className="text-xs font-black text-[#10292e]">No Badges Earned Yet</p>
                  <p className="text-[11px] text-[#607274]">
                    Complete course lessons or diagnostic checkpoints to unlock badges!
                  </p>
                </div>
              ) : (
                availableAchievements.map((ach, idx) => (
                  <div
                    key={idx}
                    onClick={() => handlePickAchievement(ach)}
                    className="flex items-center justify-between p-3.5 rounded-2xl bg-[#fffdfa] hover:bg-[#fff7ee] border border-[#f0ede4] hover:border-[#ffd599] cursor-pointer transition-all shadow-2xs group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#ffa11f] text-[#10292e] flex items-center justify-center text-lg font-black shadow-xs shrink-0">
                        🏆
                      </div>
                      <div>
                        <p className="text-xs font-black text-[#10292e] group-hover:text-amber-900 transition-colors">
                          {ach.badge_title}
                        </p>
                        <p className="text-[10px] text-[#8a999b]">{ach.course_title}</p>
                      </div>
                    </div>

                    <span className="text-xs font-black text-[#ffa11f] group-hover:translate-x-0.5 transition-transform">
                      Share →
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Share / Repost Modal */}
      {shareModalPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => setShareModalPost(null)}
            aria-hidden="true"
          />

          <div className="relative w-full max-w-md bg-white text-[#10292e] rounded-3xl shadow-2xl border border-[#e8eeea] overflow-hidden flex flex-col max-h-[85vh] z-10 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between px-6 pt-5 pb-3 border-b border-[#e8eeea] bg-[#fafaf8]">
              <div className="flex items-center gap-2">
                <Share2 size={16} className="text-[#ffa11f]" />
                <h3 className="text-sm font-black text-[#10292e]">Repost to Campus Feed</h3>
              </div>
              <button
                onClick={() => setShareModalPost(null)}
                className="p-1.5 rounded-full text-[#8a999b] hover:text-[#10292e] hover:bg-[#e8eeea] transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleShareSubmit} className="p-6 space-y-4">
              <textarea
                rows={3}
                value={shareComment}
                onChange={(e) => setShareComment(e.target.value)}
                placeholder="Add your thoughts or commentary (optional)..."
                className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] placeholder-[#8a999b] text-xs font-medium rounded-2xl p-3.5 focus:outline-hidden focus:border-[#ffa11f] focus:bg-white resize-none transition-all"
              />

              {/* Quoted Post Preview */}
              <div className="p-3.5 rounded-2xl bg-[#fafaf8] border border-[#e8eeea] space-y-1">
                <p className="text-[11px] font-black text-[#10292e]">
                  {shareModalPost.author_name}
                </p>
                <p className="text-xs text-[#607274] line-clamp-3 leading-relaxed">
                  {shareModalPost.content}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#f0ede4]">
                <button
                  type="button"
                  onClick={() => setShareModalPost(null)}
                  className="text-xs font-bold text-[#8a999b] hover:text-[#10292e] px-4 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSharing}
                  className="inline-flex items-center gap-1.5 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-black text-xs px-5 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer"
                >
                  {isSharing ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <>
                      <span>Repost Now</span>
                      <Share2 size={13} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
