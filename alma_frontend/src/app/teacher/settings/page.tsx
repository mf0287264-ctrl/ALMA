"use client";

import React, { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import TeacherSidebar from "@/components/TeacherSidebar";
import { useAuth, getProfileImageUrl, type User } from "@/app/_Context/AuthContext";
import { toast } from "sonner";

export default function TeacherSettingsPage() {
  const { user, refreshUser } = useAuth();
  if (!user) return (
    <div className="flex min-h-screen w-full bg-[#fff8ec]">
      <TeacherSidebar />
      <main className="flex-1 p-6 pt-24 lg:pt-10">
        <p className="text-sm text-[#607274]">Loading your profile…</p>
        <button type="button" onClick={() => void refreshUser()} className="mt-4 rounded-full bg-[#ffa11f] px-5 py-2 font-semibold">Retry</button>
      </main>
    </div>
  );
  return <TeacherSettingsForm key={user._id || user.id} user={user} />;
}

function TeacherSettingsForm({ user }: { user: User }) {
  const router = useRouter();
  const { updateUser, uploadProfilePicture, updateName, logout } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state initialized with user
  const [firstName, setFirstName] = useState(user?.first_name || "");
  const [lastName, setLastName] = useState(user?.last_name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [teacherCode, setTeacherCode] = useState(user?.teacher_code || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "");
  const [specialization, setSpecialization] = useState(user?.specialization || "");
  const [schoolName, setSchoolName] = useState(user?.school_name || "");

  // Profile photo state
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.profile_image ? getProfileImageUrl(user.profile_image) : null);

  // Password modal / change state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Notification toggles (Proposed)
  const [notifGenFinished, setNotifGenFinished] = useState(true);
  const [notifVersionReview, setNotifVersionReview] = useState(true);
  const [notifStudentSupport, setNotifStudentSupport] = useState(false);

  const [saving, setSaving] = useState(false);

  // Handle Photo File Upload
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.match(/^image\/(png|jpe?g|webp)$/i) && !file.name.match(/\.(png|jpe?g|webp)$/i)) {
      toast.error("Please upload a valid image file (PNG, JPG, JPEG, or WebP).");
      return;
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image size exceeds 4MB limit.");
      return;
    }

    try {
      const res = await uploadProfilePicture(file);
      if (res.success) {
        const newImg = res.data?.profile_image || res.data?.profileImage;
        if (newImg) setPhotoPreview(getProfileImageUrl(newImg));
        toast.success("Profile photo uploaded successfully!");
      } else {
        toast.error(res.error || "Failed to upload profile photo.");
      }
    } catch {
      toast.error("An error occurred during photo upload.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemovePhoto = async () => {
    setPhotoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    try {
      await updateUser({ profile_image: null });
      toast.info("Profile photo removed.");
    } catch {
      toast.info("Profile photo reset.");
    }
  };

  const handleSavePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      toast.error("First name and last name cannot be empty.");
      return;
    }
    setSaving(true);
    try {
      const nameRes = await updateName(firstName, lastName);
      if (!nameRes.success) {
        toast.error(nameRes.error || "Failed to update name");
        setSaving(false);
        return;
      }

      const result = await updateUser({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        name: `${firstName.trim()} ${lastName.trim()}`.trim(),
        email,
        phone_number: phoneNumber,
        specialization,
        school_name: schoolName,
        teacher_code: teacherCode,
      });
      if (!result.success) {
        toast.error(result.error || "Unable to save your profile. Please try again.");
        return;
      }
      toast.success("Teacher profile updated successfully!");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save profile changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 12 || newPassword.length > 128) {
      toast.error("Password must be 12–128 characters long.");
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
        toast.success("Password changed successfully! Please log in with your new password.");

        // Clear session and redirect to teacher login
        setTimeout(() => {
          logout();
          router.replace("/login?role=teacher");
        }, 1200);
      } else {
        toast.error(res.error || "Failed to update password.");
      }
    } catch {
      toast.error("An error occurred while changing password.");
    } finally {
      setSavingPassword(false);
    }
  };

  // User avatar initials
  const initials = `${firstName?.[0] || "L"}${lastName?.[0] || "H"}`.toUpperCase();

  return (
    <div className="w-full min-h-screen bg-[#fff8ec] flex">
      <TeacherSidebar />

      <main className="flex-1 min-w-0 p-6 sm:p-10 lg:p-12 pt-20 lg:pt-10 overflow-y-auto">
        {/* Header & Badges Legend */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-black text-[#10292e] tracking-tight">
              Profile and settings
            </h1>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-2 self-start sm:self-auto text-xs font-bold text-[#5a6e70]">
            <span>Sample data</span>
            <span className="bg-[#e6f5f2] text-[#118a80] px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase">
              Existing
            </span>
            <span className="border border-dashed border-[#ef4444] text-[#ef4444] bg-white px-2.5 py-0.5 rounded-md font-bold text-[10px] uppercase">
              Proposed
            </span>
          </div>
        </div>

        {/* Main Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Personal Information (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-[#e8eeea] shadow-xs">
            <h2 className="text-xl font-black text-[#10292e] mb-6">
              Personal information
            </h2>

            {/* Photo Upload Section */}
            <div className="mb-7 pb-6 border-b border-[#f0f4f2] flex flex-col sm:flex-row items-center gap-5">
              <div className="relative group shrink-0">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Teacher Avatar"
                    className="w-20 h-20 rounded-full object-cover border-2 border-[#118a80] shadow-xs"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-[#118a80] text-white flex items-center justify-center font-black text-2xl shadow-xs">
                    {initials}
                  </div>
                )}

                {/* Quick overlay change button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-xs font-bold"
                  title="Change photo"
                >
                  📷 Change
                </button>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <h3 className="font-black text-sm text-[#10292e]">
                  Teacher Profile Photo
                </h3>
                <p className="text-xs text-[#5a6e70] mt-0.5 mb-3">
                  Upload a clear portrait photo (PNG, JPG, JPEG up to 4MB).
                </p>

                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handlePhotoSelect}
                    accept="image/png, image/jpeg, image/jpg"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-1.5 rounded-full bg-[#e6f5f2] hover:bg-[#d6eee9] text-[#118a80] font-black text-xs transition-colors cursor-pointer"
                  >
                    Upload photo
                  </button>

                  {photoPreview && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="px-4 py-1.5 rounded-full border border-[#e8eeea] hover:bg-red-50 hover:border-red-200 text-red-500 font-bold text-xs transition-colors cursor-pointer"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <form onSubmit={handleSavePersonal} className="space-y-4">
              {/* First Name & Last Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="text-xs font-bold text-[#10292e]">
                      First name
                    </label>
                    <span className="bg-[#e6f5f2] text-[#118a80] px-1.5 py-0.2 rounded font-bold text-[9px] uppercase">
                      Existing
                    </span>
                  </div>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="text-xs font-bold text-[#10292e]">
                      Last name
                    </label>
                    <span className="bg-[#e6f5f2] text-[#118a80] px-1.5 py-0.2 rounded font-bold text-[9px] uppercase">
                      Existing
                    </span>
                  </div>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <label className="text-xs font-bold text-[#10292e]">
                    Email
                  </label>
                  <span className="bg-[#e6f5f2] text-[#118a80] px-1.5 py-0.2 rounded font-bold text-[9px] uppercase">
                    Existing
                  </span>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                />
              </div>

              {/* Teacher Code & Phone Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="text-xs font-bold text-[#10292e]">
                      Teacher code
                    </label>
                    <span className="bg-[#e6f5f2] text-[#118a80] px-1.5 py-0.2 rounded font-bold text-[9px] uppercase">
                      Existing
                    </span>
                  </div>
                  <input
                    type="text"
                    value={teacherCode}
                    onChange={(e) => setTeacherCode(e.target.value)}
                    className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="text-xs font-bold text-[#10292e]">
                      Phone number
                    </label>
                    <span className="bg-[#e6f5f2] text-[#118a80] px-1.5 py-0.2 rounded font-bold text-[9px] uppercase">
                      Existing
                    </span>
                  </div>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                  />
                </div>
              </div>

              {/* Specialization & School Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="text-xs font-bold text-[#10292e]">
                      Specialization
                    </label>
                    <span className="bg-[#e6f5f2] text-[#118a80] px-1.5 py-0.2 rounded font-bold text-[9px] uppercase">
                      Existing
                    </span>
                  </div>
                  <input
                    type="text"
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                  />
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="text-xs font-bold text-[#10292e]">
                      School name
                    </label>
                    <span className="bg-[#e6f5f2] text-[#118a80] px-1.5 py-0.2 rounded font-bold text-[9px] uppercase">
                      Existing
                    </span>
                  </div>
                  <input
                    type="text"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                  />
                </div>
              </div>

              {/* Save changes button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#ffa11f] hover:bg-[#e69019] text-[#10292e] font-black text-sm px-8 py-3 rounded-full transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: Account & Notification Preferences (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Account Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e8eeea] shadow-xs">
              <h2 className="text-xl font-black text-[#10292e] mb-6">
                Account
              </h2>

              <div className="space-y-4">
                {/* Email login */}
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <label className="text-xs font-bold text-[#10292e]">
                      Email (login)
                    </label>
                    <span className="bg-[#e6f5f2] text-[#118a80] px-1.5 py-0.2 rounded font-bold text-[9px] uppercase">
                      Existing
                    </span>
                  </div>
                  <input
                    type="text"
                    value={email}
                    disabled
                    className="w-full rounded-2xl border border-[#d2dcd7] bg-[#fafaf8] px-4 py-2.5 text-xs text-[#5a6e70]"
                  />
                </div>

                {/* Password with Change action */}
                <div>
                  <label className="block text-xs font-bold text-[#10292e] mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value="••••••••"
                      disabled
                      className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-4 py-2.5 text-xs font-mono text-[#5a6e70]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordModal(true)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-[#118a80] hover:text-[#0d6e66] transition-colors cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                </div>

                {/* Account status */}
                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="font-bold text-[#5a6e70]">Account status</span>
                  <span className="inline-block bg-[#e6f5f2] text-[#118a80] font-black px-3 py-1 rounded-full text-xs">
                    active
                  </span>
                </div>
              </div>
            </div>

            {/* Notification Preferences Card (Proposed) */}
            <div className="border-2 border-dashed border-[#fca5a5] rounded-3xl p-6 sm:p-8 bg-white shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-black text-[#10292e]">
                  Notification preferences
                </h2>
                <span className="border border-dashed border-[#ef4444] text-[#ef4444] bg-white px-2 py-0.5 rounded-md font-bold text-[10px] uppercase">
                  Proposed
                </span>
              </div>

              <div className="space-y-4">
                {/* Toggle 1 */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-bold text-[#10292e]">
                    Lesson generation finished
                  </span>
                  <button
                    type="button"
                    onClick={() => setNotifGenFinished(!notifGenFinished)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      notifGenFinished ? "bg-[#ffa11f]" : "bg-[#d2dcd7]"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        notifGenFinished ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 2 */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-bold text-[#10292e]">
                    New version awaiting review
                  </span>
                  <button
                    type="button"
                    onClick={() => setNotifVersionReview(!notifVersionReview)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      notifVersionReview ? "bg-[#ffa11f]" : "bg-[#d2dcd7]"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        notifVersionReview ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>

                {/* Toggle 3 */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs font-bold text-[#10292e]">
                    Student needs support
                  </span>
                  <button
                    type="button"
                    onClick={() => setNotifStudentSupport(!notifStudentSupport)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                      notifStudentSupport ? "bg-[#ffa11f]" : "bg-[#d2dcd7]"
                    }`}
                  >
                    <div
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                        notifStudentSupport ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Explanatory Note below Card */}
            <p className="text-[11px] text-[#83908f] leading-relaxed px-1">
              No notification fields exist on Teacher today. This card needs a notification_preferences object.
            </p>
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl border border-[#e8eeea]">
              <h3 className="text-xl font-black text-[#10292e] mb-2">
                Change Password
              </h3>
              <p className="text-xs text-[#5a6e70] mb-5">
                Enter your new password below to update your login credentials.
              </p>

              <form onSubmit={handleSavePassword} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#10292e] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#10292e] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full rounded-2xl border border-[#d2dcd7] px-4 py-2.5 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#ffa11f]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-5 py-2 rounded-full border border-[#d2dcd7] text-xs font-bold text-[#5a6e70] hover:bg-[#fafaf8] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="px-6 py-2 rounded-full bg-[#ffa11f] hover:bg-[#e69019] text-[#10292e] text-xs font-black shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {savingPassword ? "Updating..." : "Update Password"}
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
