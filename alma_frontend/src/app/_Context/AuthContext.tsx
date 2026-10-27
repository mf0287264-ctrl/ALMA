"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import api from "@/services/api";
import MangoIcon from "@/components/MangoIcon";

export interface User {
  _id?: string;
  id?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  email: string;
  role?: string;
  student_code?: string;
  grade_level?: string;
  school_name?: string | null;
  profile_image?: string | null;
  is_active?: boolean;
  national_id?: string | null;
  address?: string | null;
  parent_phone?: string | null;
  learning_for?: string;
  age_group?: string | null;
  coding_experience?: string | null;
  learning_styles?: string[];
  gender?: string | null;
  quiz_answers?: any[];
  current_streak?: number;
  longest_streak?: number;
  lessons_completed?: number;
  struggling_concepts?: Array<{
    concept_id: string;
    concept_label: string;
    times_tested?: number;
    times_wrong?: number;
    last_diagnosed_misconception?: string | null;
  }>;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name?: string; first_name?: string; last_name?: string; email: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  updateUser: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function parseJwt(token: string): User | null {
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

const PUBLIC_AUTH_ROUTES = [
  "/",
  "/welcome",
  "/login",
  "/register",
  "/class-code",
  "/forgot-password",
];

const PROTECTED_ROUTES = [
  "/home",
  "/profile",
  "/learn",
  "/compete",
  "/quize",
  "/ai-lesson",
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch full student profile using stored token
  const fetchProfile = useCallback(async (authToken: string) => {
    try {
      const response = await api.get("/students/profile", {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (response.data && response.data.data) {
        setUser(response.data.data);
      }
    } catch (err: unknown) {
      console.warn("Could not fetch full user profile, falling back to token payload", err);
      // Fallback: extract info from token payload
      const decoded = parseJwt(authToken);
      if (decoded) {
        setUser((prev) => prev || decoded);
      }
    }
  }, []);

  // Initialize auth state from localStorage on first mount
  useEffect(() => {
    const storedToken = localStorage.getItem("alma_token");
    if (storedToken) {
      setToken(storedToken);
      const decoded = parseJwt(storedToken);
      if (decoded) {
        setUser(decoded);
      }
      fetchProfile(storedToken).finally(() => {
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  // Route Protection Guard
  useEffect(() => {
    if (loading) return;

    const isProtectedRoute = PROTECTED_ROUTES.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    );

    if (token) {
      // User is authenticated
      // Check if user has finished required onboarding (gender is required)
      const hasCompletedOnboarding = Boolean(user?.gender);

      if (!hasCompletedOnboarding) {
        // If onboarding is incomplete, allow them on step-2 and step-3
        if (pathname === "/register/step-2" || pathname === "/register/step-3") {
          return;
        }
        // Direct incomplete users to step-2 to finish setting up
        router.replace("/register/step-2");
        return;
      }

      // If user has completed onboarding, disallow visiting auth/onboarding pages
      if (
        pathname === "/" ||
        pathname === "/welcome" ||
        pathname === "/login" ||
        pathname.startsWith("/register")
      ) {
        router.replace("/home");
      }
    } else {
      // User is not authenticated
      // Disallow visiting any protected app route
      if (isProtectedRoute) {
        router.replace("/welcome");
      }
    }
  }, [token, user, loading, pathname, router]);

  const login = async ({ email, password }: { email: string; password: string }) => {
    try {
      const res = await api.post("/students/login", { email, password });
      const data = res.data?.data;
      if (!data?.token) {
        return { success: false, error: "No token returned from server" };
      }

      const receivedToken = data.token;
      localStorage.setItem("alma_token", receivedToken);
      setToken(receivedToken);

      const studentUser = data.student || parseJwt(receivedToken);
      setUser(studentUser);

      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Invalid email or password";
      return { success: false, error: errorMessage };
    }
  };

  const register = async (formData: {
    name?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    password?: string;
  }) => {
    try {
      const res = await api.post("/students", formData);
      const data = res.data?.data;
      if (data?.token) {
        const receivedToken = data.token;
        localStorage.setItem("alma_token", receivedToken);
        setToken(receivedToken);
        const studentUser = data.student || parseJwt(receivedToken);
        setUser(studentUser);
      }
      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Registration failed. Please check your details.";
      return { success: false, error: errorMessage };
    }
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const res = await api.put("/students", data);
      if (res.data?.data) {
        setUser(res.data.data);
      }
      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to update profile";
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem("alma_token");
    setToken(null);
    setUser(null);
    router.replace("/welcome");
  };

  const refreshUser = async () => {
    if (token) {
      await fetchProfile(token);
    }
  };

  // Prevent flicker on protected routes during initial auth verification
  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (loading && isProtectedRoute) {
    return (
      <div className="min-h-screen w-full bg-[#fff8ec] flex flex-col items-center justify-center">
        <MangoIcon size={120} animated className="drop-shadow-md animate-pulse" />
        <p className="mt-4 text-sm font-bold text-[#10292e]">Loading ALMA...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        updateUser,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
