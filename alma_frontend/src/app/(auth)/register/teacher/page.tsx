"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import MangoIcon from "@/components/MangoIcon";
import { useAuth } from "@/app/_Context/AuthContext";

const SPECIALIZATIONS = [
  "Computer Science & Python",
  "Web Development (HTML/CSS/JS)",
  "Scratch & Game Building",
  "AI & Data Fundamentals",
  "Robotics & Electronics",
  "General STEM & Algorithms",
  "Other",
];

export default function TeacherRegisterPage() {
  const router = useRouter();
  const { registerTeacher } = useAuth();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [specialization, setSpecialization] = useState(SPECIALIZATIONS[0]);
  const [customSpecialization, setCustomSpecialization] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [teacherCode, setTeacherCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (!firstName.trim()) newErrors.firstName = "First name is required";
    if (!lastName.trim()) newErrors.lastName = "Last name is required";
    if (!email.includes("@") || !email.includes(".")) newErrors.email = "Valid email is required";
    if (password.length < 12 || password.length > 128) newErrors.password = "Password must be 12–128 characters";
    if (password !== rePassword) newErrors.rePassword = "Passwords do not match";
    if (specialization === "Other" && !customSpecialization.trim()) {
      newErrors.specialization = "Please specify your subject area";
    }
    if (!agreeToTerms) newErrors.agreeToTerms = "Please agree to the Terms of Service";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const finalSpecialization = specialization === "Other" ? customSpecialization.trim() : specialization;

      const result = await registerTeacher({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        email: email.trim().toLowerCase(),
        password,
        specialization: finalSpecialization,
        school_name: schoolName.trim() || null,
        phone_number: phoneNumber.trim() || null,
        teacher_code: teacherCode.trim() || undefined,
      });

      if (result.success) {
        toast.success("Teacher account created! Welcome to your dashboard.");
        router.push("/teacher/dashboard");
      } else {
        toast.error(result.error || "Registration failed. Please check your inputs.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      {/* Left Column (Desktop Only: lg and up) */}
      <div className="hidden lg:flex lg:w-5/12 min-h-screen bg-[#f25c78] flex-col items-center justify-between p-12 text-center select-none relative overflow-hidden">
        <div className="w-full flex justify-start">
          <Link
            href="/choose-role?mode=register"
            className="text-white/90 hover:text-white text-sm font-semibold flex items-center gap-1.5 transition-colors"
          >
            <span>←</span> Back to Role Selection
          </Link>
        </div>

        <div className="flex flex-col items-center">
          <div className="w-24 h-28 rounded-t-full bg-white/20 mb-6 flex items-center justify-center">
            <MangoIcon size={120} animated className="drop-shadow-lg" />
          </div>
          <span className="bg-white/25 text-white text-xs font-black uppercase tracking-wider px-3.5 py-1.5 rounded-full mb-3">
            Teacher Portal
          </span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Empower your students with AI
          </h1>
          <p className="text-white/90 text-sm mt-3 font-medium max-w-sm">
            Generate customized coding lessons, track student mastery, and guide the next generation of coders.
          </p>
        </div>

        <p className="text-xs text-white/70">
          ALMA for Educators • Tailored lessons in seconds
        </p>
      </div>

      {/* Right Column (Form) */}
      <div className="w-full lg:w-7/12 min-h-screen bg-[#fff8ec] flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 py-10 sm:py-14 overflow-y-auto">
        <div className="w-full max-w-lg">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-12 rounded-t-full bg-[#f25c78] flex items-center justify-center shadow-sm">
                <span className="text-white font-black text-sm">🍎</span>
              </div>
              <Link
                href="/choose-role?mode=register"
                className="text-xs font-bold text-[#f25c78] hover:underline"
              >
                Change role
              </Link>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              Create Teacher Account
            </h2>
            <p className="text-[#5a6e70] text-sm mt-1">
              Set up your educator profile to generate lessons and manage classes.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Fields (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="e.g. Sarah"
                  required
                  className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-3.5 py-3 text-sm text-[#10292e] placeholder:text-[#5a6e70]/50 focus:outline-none focus:ring-2 focus:ring-[#f25c78] transition-all"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-500 mt-1 font-semibold">{errors.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="e.g. Jenkins"
                  required
                  className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-3.5 py-3 text-sm text-[#10292e] placeholder:text-[#5a6e70]/50 focus:outline-none focus:ring-2 focus:ring-[#f25c78] transition-all"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-500 mt-1 font-semibold">{errors.lastName}</p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-[#10292e] mb-1">
                School or Professional Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="teacher@school.edu"
                required
                className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-3.5 py-3 text-sm text-[#10292e] placeholder:text-[#5a6e70]/50 focus:outline-none focus:ring-2 focus:ring-[#f25c78] transition-all"
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 font-semibold">{errors.email}</p>
              )}
            </div>

            {/* Specialization Field (Key difference from Student) */}
            <div>
              <label className="block text-xs font-bold text-[#10292e] mb-1">
                Teaching Specialization / Focus <span className="text-red-500">*</span>
              </label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-3.5 py-3 text-sm text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#f25c78] transition-all"
              >
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>

              {specialization === "Other" && (
                <input
                  type="text"
                  value={customSpecialization}
                  onChange={(e) => setCustomSpecialization(e.target.value)}
                  placeholder="Specify your field or subject..."
                  className="w-full mt-2 rounded-2xl border border-[#d2dcd7] bg-white px-3.5 py-2.5 text-sm text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#f25c78] transition-all"
                />
              )}
              {errors.specialization && (
                <p className="text-xs text-red-500 mt-1 font-semibold">{errors.specialization}</p>
              )}
            </div>

            {/* School & Phone (2 Columns) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  School / Organization <span className="text-xs text-[#5a6e70] font-normal">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={schoolName}
                  onChange={(e) => setSchoolName(e.target.value)}
                  placeholder="e.g. Oakridge Academy"
                  className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-3.5 py-3 text-sm text-[#10292e] placeholder:text-[#5a6e70]/50 focus:outline-none focus:ring-2 focus:ring-[#f25c78] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  Phone Number <span className="text-xs text-[#5a6e70] font-normal">(Optional)</span>
                </label>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-3.5 py-3 text-sm text-[#10292e] placeholder:text-[#5a6e70]/50 focus:outline-none focus:ring-2 focus:ring-[#f25c78] transition-all"
                />
              </div>
            </div>

            {/* Teacher Code (Optional) */}
            <div>
              <label className="block text-xs font-bold text-[#10292e] mb-1">
                Custom Teacher Code <span className="text-xs text-[#5a6e70] font-normal">(Optional - auto-assigned if empty)</span>
              </label>
              <input
                type="text"
                value={teacherCode}
                onChange={(e) => setTeacherCode(e.target.value.toUpperCase())}
                placeholder="e.g. TEA-4029"
                className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-3.5 py-3 text-sm text-[#10292e] placeholder:text-[#5a6e70]/50 focus:outline-none focus:ring-2 focus:ring-[#f25c78] transition-all font-mono"
              />
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 chars"
                  required
                  className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-3.5 py-3 text-sm text-[#10292e] placeholder:text-[#5a6e70]/50 focus:outline-none focus:ring-2 focus:ring-[#f25c78] transition-all"
                />
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1 font-semibold">{errors.password}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  type={showPassword ? "text" : "password"}
                  value={rePassword}
                  onChange={(e) => setRePassword(e.target.value)}
                  placeholder="Repeat password"
                  required
                  className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-3.5 py-3 text-sm text-[#10292e] placeholder:text-[#5a6e70]/50 focus:outline-none focus:ring-2 focus:ring-[#f25c78] transition-all"
                />
                {errors.rePassword && (
                  <p className="text-xs text-red-500 mt-1 font-semibold">{errors.rePassword}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-[#5a6e70]">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="rounded accent-[#f25c78]"
                />
                Show password
              </label>
            </div>

            {/* Terms Checkbox */}
            <div className="pt-1">
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 rounded accent-[#f25c78]"
                />
                <span className="text-xs text-[#5a6e70] leading-snug">
                  I agree to ALMA&apos;s Terms of Service, Educator Data Privacy, and Code of Conduct.
                </span>
              </label>
              {errors.agreeToTerms && (
                <p className="text-xs text-red-500 mt-1 font-semibold">{errors.agreeToTerms}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#f25c78] hover:bg-[#e04c68] active:scale-[0.98] text-white font-extrabold text-sm py-3.5 px-6 rounded-full transition-all shadow-sm cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin text-base">⏳</span> Creating Teacher Account...
                </>
              ) : (
                "Create Teacher Account"
              )}
            </button>
          </form>

          {/* Footer Navigation */}
          <div className="mt-6 text-center text-xs text-[#5a6e70] space-y-2">
            <p>
              Already have an educator account?{" "}
              <Link href="/login?role=teacher" className="font-bold text-[#f25c78] hover:underline">
                Log in as Teacher
              </Link>
            </p>
            <p>
              Are you a student?{" "}
              <Link href="/register" className="font-bold text-[#118a80] hover:underline">
                Sign up as Student
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
