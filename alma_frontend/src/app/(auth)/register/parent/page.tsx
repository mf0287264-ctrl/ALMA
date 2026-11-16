"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import MangoIcon from "@/components/MangoIcon";
import { useAuth } from "@/app/_Context/AuthContext";

export default function RegisterParentPage() {
  const router = useRouter();
  const { registerParent } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [relation, setRelation] = useState<"father" | "mother" | "guardian">("guardian");
  const [childEmail, setChildEmail] = useState("");
  const [childStudentCode, setChildStudentCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string[];
    email?: string[];
    password?: string[];
    rePassword?: string[];
    agreeToTerms?: string[];
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = ["Full name is required"];
    }
    if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = ["Enter a valid email address."];
    }
    if (password.length < 6) {
      newErrors.password = ["Password must be at least 6 characters."];
    }
    if (password !== rePassword) {
      newErrors.rePassword = ["Passwords do not match."];
    }
    if (!agreeToTerms) {
      newErrors.agreeToTerms = ["Please agree to the Terms and Privacy Policy."];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const parts = name.trim().split(" ");
      const first_name = parts[0] || "Parent";
      const last_name = parts.slice(1).join(" ") || "User";

      const result = await registerParent({
        first_name,
        last_name,
        email,
        password,
        phone_number: phone || null,
        relation,
        child_email: childEmail.trim() || null,
        child_student_code: childStudentCode.trim() || null,
      });

      if (result.success) {
        toast.success("Parent account created successfully!");
        router.push("/parent/dashboard");
      } else {
        toast.error(result.error || "Registration failed. Please check your details.");
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
      <div className="hidden lg:flex lg:w-1/2 min-h-screen bg-[#4ba3d0] flex-col items-center justify-center p-12 text-center select-none relative">
        <Link
          href="/choose-role?mode=register"
          className="absolute top-8 left-8 text-white/90 hover:text-white text-sm font-semibold flex items-center gap-1.5 transition-colors"
        >
          <span>←</span> Back to Role Selection
        </Link>
        <div className="transform hover:scale-105 transition-transform duration-300">
          <MangoIcon size={190} animated className="drop-shadow-lg" />
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mt-7">
          Parent & Guardian Portal
        </h1>
        <p className="text-white/95 text-base mt-2 font-medium max-w-sm">
          Stay connected with your child&apos;s learning path and cheer on their milestones.
        </p>
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-1/2 min-h-screen bg-[#fff8ec] flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 py-10 sm:py-14">
        <div className="w-full max-w-[420px]">
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <MangoIcon size={46} animated className="drop-shadow-sm" />
              <Link
                href="/choose-role?mode=register"
                className="text-xs font-bold text-[#5a6e70] hover:text-[#10292e]"
              >
                Change role ↔
              </Link>
            </div>
            <h2 className="text-3xl font-extrabold text-[#10292e] tracking-tight">
              Create Parent Account
            </h2>
            <p className="text-[#5a6e70] text-sm font-semibold mt-1">
              Follow your child&apos;s coding journey &amp; progress
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-[#10292e] mb-1">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sarah Connor"
                required
                className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-4 py-3 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
              />
              {errors.name?.[0] && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.name[0]}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#10292e] mb-1">
                Parent Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="parent@example.com"
                required
                className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-4 py-3 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
              />
              {errors.email?.[0] && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.email[0]}</p>
              )}
            </div>

            {/* Phone & Relation Row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 234 567 890"
                  className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-3 py-3 text-xs text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#10292e] mb-1">
                  Relation
                </label>
                <select
                  value={relation}
                  onChange={(e) => setRelation(e.target.value as any)}
                  className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-3 py-3 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
                >
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="guardian">Guardian</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#10292e] mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-2xl border border-[#d2dcd7] bg-white pl-4 pr-16 py-3 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-xs font-bold text-[#4ba3d0] hover:text-[#2d7ba4]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password?.[0] && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.password[0]}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-bold text-[#10292e] mb-1">
                Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={rePassword}
                onChange={(e) => setRePassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-4 py-3 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
              />
              {errors.rePassword?.[0] && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.rePassword[0]}</p>
              )}
            </div>

            {/* Link Child (Optional at registration) */}
            <div className="p-3 bg-[#eef7fb] rounded-2xl border border-[#cbe4f2]">
              <p className="text-xs font-bold text-[#10292e] mb-1">
                Link Your Child (Optional)
              </p>
              <p className="text-[11px] text-[#5a6e70] mb-2">
                Provide either your child&apos;s registered email or student code:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="email"
                  value={childEmail}
                  onChange={(e) => setChildEmail(e.target.value)}
                  placeholder="Child's Email"
                  className="w-full rounded-xl border border-[#d2dcd7] bg-white px-3 py-2 text-xs text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
                />
                <input
                  type="text"
                  value={childStudentCode}
                  onChange={(e) => setChildStudentCode(e.target.value)}
                  placeholder="Code (e.g. STU-1001)"
                  className="w-full rounded-xl border border-[#d2dcd7] bg-white px-3 py-2 text-xs text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={agreeToTerms}
                  onClick={() => setAgreeToTerms(!agreeToTerms)}
                  className={`w-4 h-4 rounded border transition-all flex items-center justify-center shrink-0 ${
                    agreeToTerms
                      ? "bg-[#4ba3d0] border-[#4ba3d0] text-white"
                      : "border-[#4ba3d0] bg-white"
                  }`}
                >
                  {agreeToTerms && (
                    <svg
                      className="w-3 h-3 stroke-current"
                      viewBox="0 0 16 16"
                      fill="none"
                      strokeWidth="3"
                    >
                      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
                    </svg>
                  )}
                </button>
                <span className="text-[#10292e] text-xs font-medium">
                  I agree to the Terms and Privacy Policy
                </span>
              </label>
              {errors.agreeToTerms?.[0] && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.agreeToTerms[0]}</p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#7ccbf0] hover:brightness-95 active:scale-[0.98] text-[#10292e] font-bold text-sm py-3 rounded-full cursor-pointer transition-all shadow-sm flex items-center justify-center disabled:opacity-70"
              >
                {loading ? "Creating Parent Account..." : "Create Parent Account"}
              </button>
            </div>

            <p className="text-center text-xs text-[#5a6e70] pt-2">
              Already have an account?{" "}
              <Link
                href="/login?role=parent"
                className="font-bold text-[#4ba3d0] hover:underline"
              >
                Log in as Parent
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
