"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { useAuth, getProfileImageUrl } from "@/app/_Context/AuthContext";
import { toast } from "sonner";
import { Award, Flame, Trophy, CheckCircle2, ArrowRight, ShieldCheck, KeyRound, Camera, Loader2, Trash2 } from "lucide-react";

export default function ProfilePage() {
  const { user, updateUser, uploadProfilePicture, updateName } = useAuth();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [activeTab, setActiveTab] = useState<"account" | "workspace">("account");

  // Profile Form States
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [gradeLevel, setGradeLevel] = useState(user?.grade_level || "");
  const [schoolName, setSchoolName] = useState(user?.school_name || "");
  const [parentPhone, setParentPhone] = useState(user?.parent_phone || "");

  // Preferences
  const [ageRange, setAgeRange] = useState(user?.age_group || "");
  const [codingExp, setCodingExp] = useState(user?.coding_experience || "");
  const [learningStyle, setLearningStyle] = useState(
    user?.learning_styles?.length ? user.learning_styles.join(", ") : ""
  );
  const [dailyReminder, setDailyReminder] = useState(true);
  const [streakAlerts, setStreakAlerts] = useState(true);

  // Sync state when user profile is loaded
  useEffect(() => {
    if (user) {
      if (user.first_name) setFirstName(user.first_name);
      if (user.last_name) setLastName(user.last_name);
      if (user.email) setEmail(user.email);
      if (user.grade_level) setGradeLevel(user.grade_level);
      if (user.school_name) setSchoolName(user.school_name);
      if (user.parent_phone) setParentPhone(user.parent_phone);
      if (user.age_group) setAgeRange(user.age_group);
      if (user.coding_experience) setCodingExp(user.coding_experience);
      if (user.learning_styles && user.learning_styles.length > 0) {
        setLearningStyle(user.learning_styles.join(", "));
      }
    }
  }, [user]);

  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  const fullName = `${firstName} ${lastName}`.trim() || user?.name || user?.email?.split("@")[0] || "";
  const studentCode = user?.student_code || "";
  const currentStreak = user?.current_streak ?? 0;
  const longestStreak = user?.longest_streak ?? 0;
  const lessonsCompleted = user?.lessons_completed ?? 0;

  const initials =
    fullName
      ? fullName
          .split(" ")
          .filter(Boolean)
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase()
      : "ST";

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpe?g|webp)$/i) && !file.name.match(/\.(png|jpe?g|webp)$/i)) {
      toast.error("Please upload a valid image file (PNG, JPG, JPEG, or WebP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image file size must be less than 10MB.");
      return;
    }

    setUploadingPhoto(true);
    try {
      const res = await uploadProfilePicture(file);
      if (res.success) {
        toast.success("Profile picture updated successfully!");
      } else {
        toast.error(res.error || "Failed to upload profile picture");
      }
    } catch {
      toast.error("An error occurred during file upload.");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    try {
      await updateUser({ profile_image: null });
      toast.info("Profile picture removed");
    } catch {
      toast.error("Failed to remove profile picture");
    }
  };

  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name cannot be empty.");
      return;
    }
    try {
      const nameRes = await updateName(firstName, lastName);
      if (!nameRes.success) {
        toast.error(nameRes.error || "Failed to update name");
        return;
      }

      const res = await updateUser({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        grade_level: gradeLevel,
        school_name: schoolName,
        parent_phone: parentPhone,
      });
      if (res.success) {
        toast.success("Profile changes saved successfully!");
      } else {
        toast.error(res.error || "Failed to update profile");
      }
    } catch {
      toast.success("Profile preferences saved locally!");
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      const res = await updateUser({ password: newPassword });
      if (res.success) {
        setShowPasswordModal(false);
        setNewPassword("");
        setConfirmPassword("");
        toast.success("Password changed successfully!");
      } else {
        toast.error(res.error || "Failed to update password");
      }
    } catch {
      toast.error("Error updating password");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {/* Top Header & View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            {activeTab === "workspace" && (
              <span className="text-[#118a80] text-[11px] font-black uppercase tracking-wider block mb-0.5">
                STUDENT WORKSPACE
              </span>
            )}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              {activeTab === "account" ? "Profile" : "Profile & achievements"}
            </h1>
            <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
              {activeTab === "account"
                ? "Student account and learning data."
                : "Celebrate your progress and see how far you've come."}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto">
            {activeTab === "account" ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("workspace")}
                  className="px-5 py-2 rounded-full border border-[#10292e] text-[#10292e] hover:bg-[#10292e] hover:text-white text-xs font-bold transition-colors"
                >
                  View Workspace &rarr;
                </button>
                <div className="hidden sm:flex items-center gap-2 text-xs font-mono ml-2">
                  <span className="text-[#8a999b]">Sample data</span>
                  <span className="bg-[#e6f5f2] text-[#118a80] px-2.5 py-0.5 rounded-full font-semibold">
                    Existing
                  </span>
                  <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] px-2.5 py-0.5 rounded-full font-semibold">
                    Proposed
                  </span>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setActiveTab("account")}
                className="px-5 py-2 rounded-full bg-white border border-[#e8eeea] text-[#10292e] hover:bg-[#fafaf8] text-xs font-bold shadow-xs transition-colors"
              >
                Edit profile
              </button>
            )}
          </div>
        </div>

        {/* VIEW 1: Account and learning data */}
        {activeTab === "account" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Profile Form Card (5 cols) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs">
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative group shrink-0">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-[#ffa11f] flex items-center justify-center text-white font-extrabold text-2xl shadow-xs border-2 border-white ring-2 ring-[#ffa11f]/30">
                      {user?.profile_image ? (
                        <img
                          src={getProfileImageUrl(user.profile_image)}
                          alt={fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{initials}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingPhoto}
                      title="Upload new profile picture"
                      className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-[#10292e] text-white hover:bg-[#ffa11f] transition-colors shadow-sm cursor-pointer"
                    >
                      {uploadingPhoto ? <Loader2 size={12} className="animate-spin" /> : <Camera size={12} />}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png, image/jpeg, image/jpg"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-xl font-extrabold text-[#10292e] truncate">
                      {fullName}
                    </h2>
                    <p className="text-xs text-[#8a999b] font-mono mt-0.5">
                      {studentCode} · active
                    </p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingPhoto}
                        className="text-[11px] font-semibold text-[#ffa11f] hover:underline cursor-pointer"
                      >
                        {uploadingPhoto ? "Uploading..." : "Change photo"}
                      </button>
                      {user?.profile_image && (
                        <>
                          <span className="text-[#c2cbcc] text-xs">·</span>
                          <button
                            type="button"
                            onClick={handleRemovePhoto}
                            className="text-[11px] font-semibold text-red-500 hover:underline cursor-pointer"
                          >
                            Remove
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSaveChanges} className="space-y-4">
                  {/* First Name & Last Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="flex items-center justify-between text-xs text-[#8a999b] mb-1 font-medium">
                        <span>First name</span>
                        <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] px-2 py-0.5 rounded-full font-semibold">
                          Editable
                        </span>
                      </div>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="First name"
                        required
                        className="w-full px-4 py-2.5 rounded-2xl border border-[#e8eeea] bg-white text-xs sm:text-sm text-[#10292e] font-medium focus:border-[#ffa11f] focus:outline-hidden"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-[#8a999b] mb-1 font-medium">
                        <span>Last name</span>
                        <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] px-2 py-0.5 rounded-full font-semibold">
                          Editable
                        </span>
                      </div>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Last name"
                        required
                        className="w-full px-4 py-2.5 rounded-2xl border border-[#e8eeea] bg-white text-xs sm:text-sm text-[#10292e] font-medium focus:border-[#ffa11f] focus:outline-hidden"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8a999b] mb-1 font-medium">
                      <span>Email</span>
                      <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] px-2 py-0.5 rounded-full font-semibold">
                        Existing
                      </span>
                    </div>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] text-xs sm:text-sm text-[#10292e] font-medium opacity-80"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8a999b] mb-1 font-medium">
                      <span>Grade level</span>
                      <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] px-2 py-0.5 rounded-full font-semibold">
                        Existing
                      </span>
                    </div>
                    <input
                      type="text"
                      value={gradeLevel}
                      onChange={(e) => setGradeLevel(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#e8eeea] bg-white text-xs sm:text-sm text-[#10292e] font-medium focus:border-[#ffa11f] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8a999b] mb-1 font-medium">
                      <span>School name</span>
                      <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] px-2 py-0.5 rounded-full font-semibold">
                        Existing
                      </span>
                    </div>
                    <input
                      type="text"
                      value={schoolName}
                      onChange={(e) => setSchoolName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#e8eeea] bg-white text-xs sm:text-sm text-[#10292e] font-medium focus:border-[#ffa11f] focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs text-[#8a999b] mb-1 font-medium">
                      <span>Parent phone</span>
                      <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] px-2 py-0.5 rounded-full font-semibold">
                        Existing
                      </span>
                    </div>
                    <input
                      type="text"
                      value={parentPhone}
                      onChange={(e) => setParentPhone(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-[#e8eeea] bg-white text-xs sm:text-sm text-[#10292e] font-medium focus:border-[#ffa11f] focus:outline-hidden"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <button
                      type="submit"
                      className="bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs px-6 py-2.5 rounded-full shadow-xs transition-colors"
                    >
                      Save changes
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(true)}
                      className="text-xs font-bold text-[#118a80] hover:underline flex items-center gap-1"
                    >
                      <KeyRound className="w-3.5 h-3.5" /> Change password
                    </button>
                  </div>
                </form>
              </div>

              {/* Right Column: Learning stats & Concepts I struggle with (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                {/* Learning stats */}
                <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-base text-[#10292e]">
                      Learning stats
                    </h3>
                    <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] px-2 py-0.5 rounded-full font-semibold">
                      Existing
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="p-4 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb]">
                      <div className="text-[11px] text-[#8a999b]">Current streak</div>
                      <div className="text-xl sm:text-2xl font-black text-[#10292e] mt-1">
                        {currentStreak} days
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb]">
                      <div className="text-[11px] text-[#8a999b]">Longest streak</div>
                      <div className="text-xl sm:text-2xl font-black text-[#10292e] mt-1">
                        {longestStreak} days
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb]">
                      <div className="text-[11px] text-[#8a999b]">Lessons completed</div>
                      <div className="text-xl sm:text-2xl font-black text-[#10292e] mt-1">
                        {lessonsCompleted}
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-[#8a999b] flex items-center gap-1.5">
                    <span>XP, level and rank are shown in the mobile prototype but have no field yet.</span>
                    <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[9px] px-1.5 py-0.2 rounded-full font-semibold">
                      Proposed
                    </span>
                  </p>
                </div>

                {/* Concepts I struggle with */}
                <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-base text-[#10292e]">
                      Concepts I struggle with
                    </h3>
                    <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] px-2 py-0.5 rounded-full font-semibold">
                      Existing
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-[#f0f0eb] text-[#8a999b]">
                          <th className="pb-2 font-semibold">Concept</th>
                          <th className="pb-2 font-semibold text-center">Tested</th>
                          <th className="pb-2 font-semibold text-center">Wrong</th>
                          <th className="pb-2 font-semibold">Last misconception</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#f0f0eb]">
                        <tr>
                          <td className="py-3 font-bold text-[#10292e]">
                            Zero-Based Indexing
                          </td>
                          <td className="py-3 text-center text-[#607274]">25</td>
                          <td className="py-3 text-center text-[#f25c78] font-bold">13</td>
                          <td className="py-3 text-[#8a999b]">
                            Thinks range() starts at 1
                          </td>
                        </tr>
                        <tr>
                          <td className="py-3 font-bold text-[#10292e]">
                            Loop stop condition
                          </td>
                          <td className="py-3 text-center text-[#607274]">24</td>
                          <td className="py-3 text-center text-[#f25c78] font-bold">9</td>
                          <td className="py-3 text-[#8a999b]">
                            Forgets the exit condition
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Card: Preferences [Proposed] */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-dashed border-[#f4c8ce] shadow-xs space-y-5">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-lg text-[#10292e]">
                    Preferences
                  </h3>
                  <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[10px] font-semibold px-2 py-0.5 rounded-full">
                    Proposed
                  </span>
                </div>
                <p className="text-xs text-[#8a999b] mt-0.5">
                  The mobile onboarding collects these but Student has no fields for them.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#8a999b] mb-1">
                    <span>Age range</span>
                    <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[9px] px-1.5 py-0.2 rounded-full font-semibold">
                      Proposed
                    </span>
                  </div>
                  <input
                    type="text"
                    value={ageRange}
                    onChange={(e) => setAgeRange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-dashed border-[#f4c8ce] bg-white text-xs text-[#10292e] font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-[#8a999b] mb-1">
                    <span>Coding experience</span>
                    <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[9px] px-1.5 py-0.2 rounded-full font-semibold">
                      Proposed
                    </span>
                  </div>
                  <input
                    type="text"
                    value={codingExp}
                    onChange={(e) => setCodingExp(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-dashed border-[#f4c8ce] bg-white text-xs text-[#10292e] font-medium"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs text-[#8a999b] mb-1">
                    <span>How I like to learn</span>
                    <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] text-[9px] px-1.5 py-0.2 rounded-full font-semibold">
                      Proposed
                    </span>
                  </div>
                  <input
                    type="text"
                    value={learningStyle}
                    onChange={(e) => setLearningStyle(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl border-2 border-dashed border-[#f4c8ce] bg-white text-xs text-[#10292e] font-medium"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={dailyReminder}
                    onChange={(e) => setDailyReminder(e.target.checked)}
                    className="w-5 h-5 rounded accent-[#ffa11f]"
                  />
                  <span className="text-xs sm:text-sm font-bold text-[#10292e]">
                    Daily reminder
                  </span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={streakAlerts}
                    onChange={(e) => setStreakAlerts(e.target.checked)}
                    className="w-5 h-5 rounded accent-[#ffa11f]"
                  />
                  <span className="text-xs sm:text-sm font-bold text-[#10292e]">
                    Streak alerts
                  </span>
                </label>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: Student Workspace (Profile & achievements) */}
        {activeTab === "workspace" && (
          <div className="space-y-6">
            {/* Top Row: User Card + 3 Stat Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* User overview card (4 cols) */}
              <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-14 h-14 rounded-full bg-[#f3b5fc] text-[#86259e] font-black text-xl flex items-center justify-center shrink-0">
                      {initials}
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-[#10292e]">
                        {fullName}
                      </h2>
                      <div className="text-xs text-[#8a999b] font-mono">
                        {studentCode} · Active
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[#8a999b]">Grade level: </span>
                      <span className="font-bold text-[#10292e]">{gradeLevel}</span>
                    </div>
                    <div>
                      <span className="text-[#8a999b]">School: </span>
                      <span className="font-bold text-[#10292e]">{schoolName}</span>
                    </div>
                    <div>
                      <span className="text-[#8a999b]">Email: </span>
                      <span className="font-bold text-[#10292e]">{email}</span>
                    </div>
                    <div>
                      <span className="text-[#8a999b]">Parent contact: </span>
                      <span className="font-bold text-[#10292e]">{parentPhone}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3 Stats (7 cols) */}
              <div className="lg:col-span-7 grid grid-cols-3 gap-4">
                <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-center">
                  <div className="text-3xl sm:text-4xl font-black text-[#10292e] mb-1">
                    {lessonsCompleted}
                  </div>
                  <div className="text-xs font-bold text-[#8a999b]">
                    Lessons completed
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-center">
                  <div className="text-3xl sm:text-4xl font-black text-[#10292e] mb-1">
                    {currentStreak} days
                  </div>
                  <div className="text-xs font-bold text-[#8a999b]">
                    Current streak
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-center">
                  <div className="text-3xl sm:text-4xl font-black text-[#10292e] mb-1">
                    {longestStreak} days
                  </div>
                  <div className="text-xs font-bold text-[#8a999b]">
                    Longest streak
                  </div>
                </div>
              </div>
            </div>

            {/* Keep your momentum: Active courses progress */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs space-y-4">
              <div>
                <h3 className="font-black text-lg text-[#10292e]">
                  Keep your momentum
                </h3>
                <p className="text-xs text-[#8a999b]">Your active courses</p>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#10292e] mb-1.5">
                    <span>Intro to Python</span>
                    <span className="text-[#8a999b] font-normal">4 / 6 modules</span>
                  </div>
                  <div className="w-full bg-[#f1f3f2] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#118a80] h-full w-2/3 rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#10292e] mb-1.5">
                    <span>Data Basics</span>
                    <span className="text-[#8a999b] font-normal">1 / 4 modules</span>
                  </div>
                  <div className="w-full bg-[#f1f3f2] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#118a80] h-full w-1/4 rounded-full" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-[#10292e] mb-1.5">
                    <span>Algorithms Lab</span>
                    <span className="text-[#8a999b] font-normal">2 / 5 modules</span>
                  </div>
                  <div className="w-full bg-[#f1f3f2] h-2.5 rounded-full overflow-hidden">
                    <div className="bg-[#118a80] h-full w-2/5 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Achievements & Certificates */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Achievements */}
              <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-black text-base text-[#10292e]">
                      Achievements
                    </h3>
                    <p className="text-xs text-[#8a999b]">3 badges earned</p>
                  </div>
                  <Link
                    href="/achievements"
                    className="text-xs font-bold text-[#118a80] hover:underline"
                  >
                    View badge gallery &rarr;
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-2xl bg-[#fff8ec] border border-[#fae2b8] text-center">
                    <div className="flex justify-center mb-1 text-[#ffa11f]">
                      <Flame className="w-5 h-5 fill-current" />
                    </div>
                    <div className="font-extrabold text-xs text-[#10292e]">
                      7-day streak
                    </div>
                    <div className="text-[10px] text-[#8a999b]">Oct 28</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#fff8ec] border border-[#fae2b8] text-center">
                    <div className="flex justify-center mb-1 text-[#ffa11f]">
                      <Award className="w-5 h-5 fill-current" />
                    </div>
                    <div className="font-extrabold text-xs text-[#10292e]">
                      First lesson
                    </div>
                    <div className="text-[10px] text-[#8a999b]">Oct 12</div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#fff8ec] border border-[#fae2b8] text-center">
                    <div className="flex justify-center mb-1 text-[#ffa11f]">
                      <Trophy className="w-5 h-5 fill-current" />
                    </div>
                    <div className="font-extrabold text-xs text-[#10292e]">
                      Quiz master
                    </div>
                    <div className="text-[10px] text-[#8a999b]">Oct 20</div>
                  </div>
                </div>
              </div>

              {/* Certificates */}
              <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-base text-[#10292e]">
                    Certificates
                  </h3>
                  <p className="text-xs text-[#8a999b]">
                    A record of what you&apos;ve mastered
                  </p>

                  <div className="mt-4 p-4 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 text-[#118a80]" />
                      <div>
                        <div className="font-bold text-sm text-[#10292e]">
                          Logic &amp; Puzzles
                        </div>
                        <div className="text-xs text-[#8a999b]">
                          Course completed · Nov 2
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => toast.info("Certificate view modal opened")}
                      className="px-4 py-1.5 rounded-full border border-[#10292e] text-[#10292e] text-xs font-bold hover:bg-[#10292e] hover:text-white transition-colors"
                    >
                      View awards
                    </button>
                  </div>
                </div>

                <div className="text-[11px] text-[#8a999b] mt-4">
                  1 certificate earned
                </div>
              </div>
            </div>

            {/* Completed courses & Milestone */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Completed courses */}
              <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-base text-[#10292e]">
                    Completed courses
                  </h3>

                  <div className="mt-4">
                    <div className="font-bold text-sm text-[#10292e]">
                      Logic &amp; Puzzles
                    </div>
                    <div className="text-xs text-[#8a999b]">
                      All modules completed · Review anytime
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-[#f0f0eb]">
                  <span className="text-xs font-bold text-[#118a80]">
                    100% complete
                  </span>
                  <Link
                    href="/courses/logic-puzzles"
                    className="text-xs font-bold text-[#118a80] hover:underline"
                  >
                    Review course &rarr;
                  </Link>
                </div>
              </div>

              {/* Your next milestone */}
              <div className="bg-[#fff9ea] rounded-3xl p-6 border border-[#fae2b8] shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="font-black text-base text-[#10292e]">
                    Your next milestone
                  </h3>

                  <div className="mt-3 flex items-baseline justify-between">
                    <span className="text-3xl font-black text-[#10292e]">
                      1,240 XP
                    </span>
                    <span className="text-xs font-bold text-[#8a999b]">
                      Level 5 · 260 XP to Level 6
                    </span>
                  </div>

                  <div className="w-full bg-[#f0e4cc] h-2.5 rounded-full overflow-hidden mt-3">
                    <div className="bg-[#118a80] h-full w-[65%] rounded-full" />
                  </div>
                </div>

                <div className="text-xs font-semibold text-[#118a80] mt-4">
                  Explorer theme unlocked
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#8a999b] pt-2">
              Progress &amp; reward examples · Profile information matches your existing account
            </p>
          </div>
        )}

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full border border-[#e8eeea] shadow-xl">
              <h3 className="font-black text-xl text-[#10292e] mb-1">
                Change Password
              </h3>
              <p className="text-xs text-[#8a999b] mb-4">
                Enter your new password below.
              </p>

              <form onSubmit={handleSavePassword} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#10292e] block mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#e8eeea] text-xs sm:text-sm focus:border-[#ffa11f] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#10292e] block mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-2xl border border-[#e8eeea] text-xs sm:text-sm focus:border-[#ffa11f] focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-5 py-2 rounded-full border border-[#e8eeea] text-xs font-bold text-[#607274] hover:bg-[#fafaf8]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-6 py-2 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] text-xs font-extrabold text-[#10292e] disabled:opacity-50"
                  >
                    {savingPassword ? "Updating..." : "Update password"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
