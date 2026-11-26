"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import MangoIcon from "@/components/MangoIcon";
import { useAuth } from "@/app/_Context/AuthContext";
import { loginDestination } from "@/lib/auth-routes";

export default function RegisterPage() {
  const { register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<{
    name?: string[];
    email?: string[];
    password?: string[];
    rePassword?: string[];
    agreeToTerms?: string[];
  }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const rePassword = String(form.get("rePassword") || "");
    const agreeToTerms = form.has("agreeToTerms");
    setErrors({});
    setSubmitError("");

    // Client validation for immediate feedback
    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = ["Full name is required"];
    }
    if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = ["Enter a valid email address."];
    }
    if (password.length < 12 || password.length > 128) {
      newErrors.password = ["12–128 characters"];
    }
    if (password !== rePassword) {
      newErrors.rePassword = ["Passwords don't match."];
    }
    if (!agreeToTerms) {
      newErrors.agreeToTerms = ["Please agree to the Terms and Privacy Policy"];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await register({
        name,
        email,
        password,
      });

      if (result.success) {
        toast.success("Account created successfully!");
        const callback = new URLSearchParams(window.location.search).get("callbackUrl");
        window.location.assign(new URL(callback ? loginDestination("student", callback) : "/register/step-2", window.location.origin).href);
      } else {
        setSubmitError(result.error || "Please correct the errors in the form.");
      }
    } catch {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      {/* Left Column (Desktop Only: lg and up) */}
      <div className="hidden lg:flex lg:w-1/2 min-h-screen bg-[#118a80] flex-col items-center justify-center p-12 text-center select-none">
        <div className="transform hover:scale-105 transition-transform duration-300">
          <MangoIcon size={190} animated className="drop-shadow-lg" />
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mt-7">
          Start small
        </h1>
        <p className="text-white/95 text-base mt-2 font-medium">
          The first win arrives in under two minutes.
        </p>
      </div>

      {/* Right Column (Mobile, Tablet & Desktop) */}
      <div className="w-full lg:w-1/2 min-h-screen bg-[#fff8ec] flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 py-10 sm:py-14">
        <div className="w-full max-w-[370px] sm:max-w-[400px]">
          {/* Header Section */}
          <div className="mb-5">
            <div className="mb-3">
              <MangoIcon size={46} animated className="drop-shadow-sm" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              Create your account
            </h2>
            <p className="text-[#5a6e70] text-sm font-semibold mt-1">
              Step 1 of 3
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-busy={loading}>
            {submitError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{submitError}</p>}
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-bold text-[#10292e] mb-1.5"
              >
                Full name
              </label>
              <input name="name" autoComplete="name" maxLength={100} aria-label="Full name"
                id="name"
                type="text"
                onChange={() => {
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Alex Morgan"
                className={`w-full rounded-2xl bg-white px-4 py-3.5 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:outline-none ${
                  errors.name
                    ? "border-2 border-[#cc4d4c] focus:ring-2 focus:ring-[#cc4d4c]/20"
                    : "border border-[#d2dcd7] focus:ring-2 focus:ring-[#118a80] focus:border-transparent"
                }`}
              />
              {errors.name?.[0] && (
                <p className="text-xs text-[#cc4d4c] font-semibold mt-1">
                  {errors.name[0]}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-[#10292e] mb-1.5"
              >
                Email
              </label>
              <input name="email" autoComplete="email" maxLength={254} autoCapitalize="none" spellCheck={false} aria-label="Email"
                id="email"
                type="email"
                onChange={() => {
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="alex@school.edu"
                className={`w-full rounded-2xl bg-white px-4 py-3.5 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:outline-none ${
                  errors.email
                    ? "border-2 border-[#cc4d4c] focus:ring-2 focus:ring-[#cc4d4c]/20"
                    : "border border-[#d2dcd7] focus:ring-2 focus:ring-[#118a80] focus:border-transparent"
                }`}
              />
              {errors.email?.[0] && (
                <p className="text-xs text-[#cc4d4c] font-semibold mt-1">
                  {errors.email[0]}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-[#10292e] mb-1.5"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <input name="password" autoComplete="new-password" maxLength={128} aria-label="Password"
                  id="password"
                  type={showPassword ? "text" : "password"}
                  onChange={() => {
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••"
                  className={`w-full rounded-2xl bg-white pl-4 pr-16 py-3.5 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:outline-none ${
                    errors.password
                      ? "border-2 border-[#cc4d4c] focus:ring-2 focus:ring-[#cc4d4c]/20"
                      : "border border-[#d2dcd7] focus:ring-2 focus:ring-[#118a80] focus:border-transparent"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-sm font-bold text-[#118a80] hover:text-[#0b6b63] transition-colors cursor-pointer select-none"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p
                className={`text-xs mt-1 font-medium ${
                  errors.password ? "text-[#cc4d4c] font-semibold" : "text-[#5a6e70]"
                }`}
              >
                {errors.password?.[0] || "12–128 characters"}
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="rePassword"
                className="block text-sm font-bold text-[#10292e] mb-1.5"
              >
                Confirm password
              </label>
              <input name="rePassword" autoComplete="new-password" maxLength={128} aria-label="Confirm password"
                id="rePassword"
                type={showPassword ? "text" : "password"}
                onChange={() => {
                  if (errors.rePassword)
                    setErrors((prev) => ({ ...prev, rePassword: undefined }));
                }}
                placeholder="••••••••"
                className={`w-full rounded-2xl bg-white px-4 py-3.5 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:outline-none ${
                  errors.rePassword
                    ? "border-2 border-[#cc4d4c] focus:ring-2 focus:ring-[#cc4d4c]/20"
                    : "border border-[#d2dcd7] focus:ring-2 focus:ring-[#118a80] focus:border-transparent"
                }`}
              />
              {errors.rePassword?.[0] && (
                <p className="text-xs text-[#cc4d4c] font-semibold mt-1">
                  {errors.rePassword[0]}
                </p>
              )}
            </div>

            {/* Terms and Privacy Policy Checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" name="agreeToTerms" className="h-5 w-5 shrink-0 rounded accent-[#118a80]" />
                <span className="text-[#10292e] text-sm font-medium">
                  I agree to the Terms and Privacy Policy
                </span>
              </label>
              {errors.agreeToTerms?.[0] && (
                <p className="text-xs text-[#cc4d4c] font-semibold mt-1">
                  {errors.agreeToTerms[0]}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ffa11f] hover:brightness-95 active:scale-[0.98] text-[#10292e] font-bold text-base py-3.5 rounded-full cursor-pointer transition-all shadow-sm flex items-center justify-center disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ffa11f]"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </div>

            {/* Footer Link */}
            <p className="text-center text-sm text-[#5a6e70] pt-2">
              Already have an account?{" "}
              <Link
                href="/choose-role?mode=login"
                className="font-bold text-[#0b6b63] hover:text-[#084e48] hover:underline transition-colors"
              >
                Log in
              </Link>
            </p>

            <p className="text-center text-xs text-[#5a6e70] pt-1">
              Educator or Teacher?{" "}
              <Link
                href="/register/teacher"
                className="font-bold text-[#f25c78] hover:underline transition-colors"
              >
                Create Teacher account →
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
