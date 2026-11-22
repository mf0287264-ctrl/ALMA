"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { signIn, signOut, useSession } from "next-auth/react";
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
  parent_name?: string | null;
  parent_phone?: string | null;
  parent_email?: string | null;
  parent_national_id?: string | null;
  parent_relation?: string | null;
  learning_for?: string;
  age_group?: string | null;
  coding_experience?: string | null;
  learning_styles?: string[];
  gender?: string | null;
  quiz_answers?: unknown[];
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
  // Teacher & Admin specific
  teacher_code?: string;
  admin_code?: string;
  specialization?: string;
  phone_number?: string | null;
  permissions?: string[];
  password?: string;
  // Parent specific
  parent_code?: string;
  relation?: string;
  children?: string[];
}

export interface TeacherRegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  specialization: string;
  school_name?: string | null;
  phone_number?: string | null;
  teacher_code?: string;
}

export interface ParentRegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  phone_number?: string | null;
  national_id?: string | null;
  relation?: "father" | "mother" | "guardian";
  child_email?: string | null;
  child_student_code?: string | null;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (credentials: { email: string; password: string; role?: "student" | "teacher" | "admin" | "parent" }) => Promise<{ success: boolean; role?: string; error?: string }>;
  register: (data: { name?: string; first_name?: string; last_name?: string; email: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  registerTeacher: (data: TeacherRegisterData) => Promise<{ success: boolean; error?: string }>;
  registerParent: (data: ParentRegisterData) => Promise<{ success: boolean; error?: string }>;
  updateUser: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROTECTED_ROUTES = [
  "/home",
  "/profile",
  "/learn",
  "/my-lessons",
  "/courses",
  "/assessments",
  "/compete",
  "/quize",
  "/ai-lesson",
  "/achievements",
  "/teachers",
  "/teacher",
  "/parent",
];

/**
 * Route protection and path-dependent redirection inside Suspense.
 * Next.js requires hooks reading URL data (usePathname, useSearchParams) to be
 * contained within a Suspense boundary when rendered in the RootLayout tree.
 */
function AuthRouteGuard() {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const role = (session?.role as string | undefined) || null;

  useEffect(() => {
    if (loading) return;

    const isAuthenticated = status === "authenticated";
    const isTeacherRoute = pathname === "/teacher" || pathname.startsWith("/teacher/");
    const isParentRoute = pathname === "/parent" || pathname.startsWith("/parent/");
    const isStudentRoute = PROTECTED_ROUTES.some(
      (route) => (pathname === route || pathname.startsWith(`${route}/`)) && !isTeacherRoute && !isParentRoute
    );

    // Guest auth routes where already-logged-in users should be sent to their role dashboard
    const isGuestAuthRoute =
      pathname === "/" ||
      pathname === "/welcome" ||
      pathname === "/choose-role" ||
      pathname === "/login" ||
      pathname === "/register";

    if (isAuthenticated) {
      if (role === "teacher") {
        if (isGuestAuthRoute || pathname === "/home" || isParentRoute) {
          router.replace("/teacher/dashboard");
        }
        return;
      }

      if (role === "parent") {
        if (isGuestAuthRoute || pathname === "/home" || isTeacherRoute) {
          router.replace("/parent/dashboard");
        }
        return;
      }

      // Student or general authenticated user
      if (role === "student" || !role) {
        if (isTeacherRoute || isParentRoute) {
          router.replace("/home");
          return;
        }

        if (isGuestAuthRoute) {
          router.replace("/home");
          return;
        }
      }
    } else {
      // Unauthenticated visitor trying to access protected dashboards
      if (isTeacherRoute) {
        router.replace("/login?role=teacher");
      } else if (isParentRoute) {
        router.replace("/login?role=parent");
      } else if (isStudentRoute) {
        router.replace("/welcome");
      }
    }
  }, [status, role, loading, pathname, router]);

  const isProtectedRoute = PROTECTED_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (loading && isProtectedRoute) {
    return (
      <div className="fixed inset-0 z-50 bg-[#fff8ec] flex flex-col items-center justify-center">
        <MangoIcon size={120} animated className="drop-shadow-md animate-pulse" />
        <p className="mt-4 text-sm font-bold text-[#10292e]">Loading ALMA...</p>
      </div>
    );
  }

  return null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const [user, setUser] = useState<User | null>(null);
  const loading = status === "loading";

  // Derive role from session
  const role = (session?.role as string | undefined) || null;

  // Fetch full profile from backend
  const fetchProfile = useCallback(async () => {
    try {
      const endpoint =
        role === "teacher"
          ? "/teachers/profile"
          : role === "admin"
          ? "/admins/profile"
          : role === "parent"
          ? "/parents/profile"
          : "/students/profile";

      const response = await api.get(endpoint);
      if (response.data?.data) {
        setUser(response.data.data);
      }
    } catch (err) {
      console.warn("[AuthContext] Could not fetch full profile:", err);
    }
  }, [role]);

  // Whenever the session becomes authenticated, load the full profile
  useEffect(() => {
    if (status === "authenticated" && role) {
      fetchProfile();
    } else if (status === "unauthenticated") {
      setUser(null);
    }
  }, [status, role, fetchProfile]);

  // Handle refresh error — force re-login
  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/welcome" });
    }
  }, [session?.error]);

  const login = async ({
    email,
    password,
    role: loginRole,
  }: {
    email: string;
    password: string;
    role?: "student" | "teacher" | "admin" | "parent";
  }) => {
    try {
      const result = await signIn("credentials", {
        email,
        password,
        role: loginRole || "student",
        redirect: false,
      });

      if (result?.error) {
        return { success: false, error: result.error };
      }

      return { success: true, role: loginRole };
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Invalid email or password";
      return { success: false, error: msg };
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
      await api.post("/students", formData);
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        role: "student",
        redirect: false,
      });
      if (result?.error) {
        return { success: false, error: result.error };
      }
      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.details?.[0]?.message ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Registration failed. Please check your details.";
      return { success: false, error: errorMessage };
    }
  };

  const registerTeacher = async (formData: TeacherRegisterData) => {
    try {
      await api.post("/teachers", formData);
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        role: "teacher",
        redirect: false,
      });
      if (result?.error) {
        return { success: false, error: result.error };
      }
      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.details?.[0]?.message ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Teacher registration failed. Please check your details.";
      return { success: false, error: errorMessage };
    }
  };

  const registerParent = async (formData: ParentRegisterData) => {
    try {
      await api.post("/parents", formData);
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        role: "parent",
        redirect: false,
      });
      if (result?.error) {
        return { success: false, error: result.error };
      }
      return { success: true };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.details?.[0]?.message ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Parent registration failed. Please check your details.";
      return { success: false, error: errorMessage };
    }
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const userRole = role || "student";
      let res;
      if (userRole === "teacher") {
        res = await api.put("/teachers/profile", data);
      } else if (userRole === "parent") {
        res = await api.put("/parents/profile", data);
      } else {
        res = await api.put("/students", data);
      }
      if (res.data?.data) {
        setUser((prev) => ({ ...(prev || {}), ...res.data.data }));
      } else {
        setUser((prev) => (prev ? { ...prev, ...data } : null));
      }
      return { success: true };
    } catch {
      setUser((prev) => (prev ? { ...prev, ...data } : null));
      return { success: true };
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // Best-effort
    }
    if (typeof window !== "undefined") {
      try {
        localStorage.clear();
        sessionStorage.clear();
      } catch (e) {
        console.warn("Error clearing browser storage:", e);
      }
    }
    setUser(null);
    await signOut({ callbackUrl: "/welcome" });
  };

  const refreshUser = async () => {
    if (status === "authenticated") {
      await fetchProfile();
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        registerTeacher,
        registerParent,
        updateUser,
        logout,
        refreshUser,
      }}
    >
      <Suspense fallback={null}>
        <AuthRouteGuard />
      </Suspense>
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
