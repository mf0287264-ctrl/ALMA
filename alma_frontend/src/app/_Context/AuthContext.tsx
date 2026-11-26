"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { getSession, signIn, signOut, useSession } from "next-auth/react";
import api from "@/services/api";
import MangoIcon from "@/components/MangoIcon";
import { apiError, signInError } from "@/lib/api-error";
import { isProtectedPage, loginDestination, loginPath, protectedPages } from "@/lib/auth-routes";

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
  is_verified?: boolean;
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
  password: string;
  specialization: string;
  school_name?: string | null;
  phone_number?: string | null;
  teacher_code?: string;
}

export interface ParentRegisterData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone_number?: string | null;
  national_id?: string | null;
  relation?: "father" | "mother" | "guardian";
  child_email?: string | null;
  child_student_code?: string | null;
}

interface AuthContextType {
  user: User | null;
  role: string | null;
  loading: boolean;
  login: (credentials: { email: string; password: string; role?: "student" | "teacher" | "admin" | "parent"; rememberMe?: boolean }) => Promise<{ success: boolean; role?: string; error?: string }>;
  register: (data: { name?: string; first_name?: string; last_name?: string; email: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  registerTeacher: (data: TeacherRegisterData) => Promise<{ success: boolean; error?: string }>;
  registerParent: (data: ParentRegisterData) => Promise<{ success: boolean; error?: string }>;
  updateUser: (data: Partial<User>) => Promise<{ success: boolean; error?: string }>;
  uploadProfilePicture: (file: File) => Promise<{ success: boolean; data?: User & { profileImage?: string | null }; error?: string }>;
  updateName: (first_name: string, last_name: string) => Promise<{ success: boolean; data?: User & { profileImage?: string | null }; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const getProfileImageUrl = (imagePath?: string | null): string => {
  if (!imagePath) return "";
  if (/^data:image\/(png|jpeg|webp);base64,/.test(imagePath)) return imagePath;
  let pathname = imagePath;
  if (/^https?:\/\//.test(imagePath)) {
    try {
      const url = new URL(imagePath);
      if (!/^\/(uploads|uploaded)\//.test(url.pathname)) return url.protocol === "https:" ? url.href : "";
      pathname = url.pathname;
    } catch { return ""; }
  }
  const clean = pathname.replace(/^\//, "");
  if (!/^(uploads|uploaded)\/[a-zA-Z0-9_\/.-]+\.(png|jpe?g|webp)$/i.test(clean)) return "";
  return `/api/media/${clean}`;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PROTECTED_ROUTES = protectedPages;

/**
 * Route protection and path-dependent redirection inside Suspense.
 * Next.js requires hooks reading URL data (usePathname, useSearchParams) to be
 * contained within a Suspense boundary when rendered in the RootLayout tree.
 */
function AuthRouteGuard({ authenticating }: { authenticating: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const loading = status === "loading";
  const role = (session?.role as string | undefined) || null;

  useEffect(() => {
    if (loading || authenticating) return;

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
      pathname === "/login";

    if (isAuthenticated) {
      if (isGuestAuthRoute) {
        router.replace(loginDestination(role, searchParams.get("callbackUrl")));
        return;
      }
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
      if (isTeacherRoute || isParentRoute || isStudentRoute)
        router.replace(loginPath(`${pathname}${searchParams.size ? `?${searchParams}` : ""}`));
    }
  }, [status, role, loading, authenticating, pathname, router, searchParams]);

  const isProtectedRoute = isProtectedPage(pathname);

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
  const [authenticating, setAuthenticating] = useState(false);
  const loading = status === "loading";

  // Derive role from session
  const role = (session?.role as string | undefined) || null;
  const backendId = session?.backendId;

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

      const response = await api.get<{ data?: User }>(endpoint);
      if (response.data?.data) {
        const fetchedUser = response.data.data;
        if (String(fetchedUser._id || fetchedUser.id) !== backendId) return null;
        if (!fetchedUser.role) {
          fetchedUser.role = role || "student";
        }
        return fetchedUser as User;
      }
    } catch {
      console.warn("[AuthContext] Could not fetch full profile.");
    }
    return null;
  }, [role, backendId]);

  // Whenever the session becomes authenticated, load the full profile
  useEffect(() => {
    if (status === "authenticated" && role) {
      let active = true;
      void fetchProfile().then(profile => { if (active && profile) setUser(profile); });
      return () => { active = false; };
    }
  }, [status, role, fetchProfile]);

  // Handle refresh error — force re-login
  useEffect(() => {
    if (session?.error === "RefreshAccessTokenError") {
      const currentPath = `${window.location.pathname}${window.location.search}`;
      void signOut({ callbackUrl: new URL(window.location.pathname === "/login" ? currentPath : loginPath(currentPath), window.location.origin).href });
    }
  }, [session?.error]);

  const login = async ({
    email,
    password,
    role: loginRole,
    rememberMe = false,
  }: {
    email: string;
    password: string;
    role?: "student" | "teacher" | "admin" | "parent";
    rememberMe?: boolean;
  }) => {
    setAuthenticating(true);
    let signedIn = false;
    try {
      const result = await signIn("credentials", {
        email,
        password,
        role: loginRole || "student",
        rememberMe,
        redirect: false,
      });

      if (!result?.ok || result.error) {
        return { success: false, error: signInError(result?.error) };
      }

      const signedInSession = await getSession();
      if (!signedInSession?.backendId || signedInSession.error)
        return { success: false, error: signInError("SessionNotSaved") };
      signedIn = true;
      return { success: true, role: signedInSession.role };
    } catch {
      return { success: false, error: signInError("AuthenticationServiceUnavailable") };
    } finally {
      // A successful form performs a full navigation; keep the route guard
      // from starting a competing client navigation while that happens.
      if (!signedIn) setAuthenticating(false);
    }
  };

  const register = async (formData: {
    name?: string;
    first_name?: string;
    last_name?: string;
    email: string;
    password: string;
  }) => {
    try {
      await api.post("/students", formData);
      const result = await login({
        email: formData.email,
        password: formData.password,
        role: "student",
        rememberMe: true,
      });
      if (!result.success) {
        return { success: false, error: `Your account was created, but sign-in failed. ${result.error}` };
      }
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: apiError(error, "Registration failed. Please check your details.") };
    }
  };

  const registerTeacher = async (formData: TeacherRegisterData) => {
    try {
      await api.post("/teachers", formData);
      const result = await login({
        email: formData.email,
        password: formData.password,
        role: "teacher",
        rememberMe: true,
      });
      if (!result.success) {
        return { success: false, error: `Your account was created, but sign-in failed. ${result.error}` };
      }
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: apiError(error, "Teacher registration failed. Please check your details.") };
    }
  };

  const registerParent = async (formData: ParentRegisterData) => {
    try {
      await api.post("/parents", formData);
      const result = await login({
        email: formData.email,
        password: formData.password,
        role: "parent",
        rememberMe: true,
      });
      if (!result.success) {
        return { success: false, error: `Your account was created, but sign-in failed. ${result.error}` };
      }
      return { success: true };
    } catch (error: unknown) {
      return { success: false, error: apiError(error, "Parent registration failed. Please check your details.") };
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
    } catch (error: unknown) {
      return { success: false, error: apiError(error, "Your profile could not be saved. Please try again.") };
    }
  };

  const uploadProfilePicture = async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("profile", file);

      const res = await api.patch("/users/profile-picture", formData);

      const updatedData = res.data?.data;
      if (updatedData) {
        setUser((prev) => ({
          ...(prev || {}),
          ...updatedData,
          profile_image: updatedData.profile_image || updatedData.profileImage,
        }));
      }
      return { success: true, data: updatedData };
    } catch (error: unknown) {
      return { success: false, error: apiError(error, "Failed to upload profile picture") };
    }
  };

  const updateName = async (first_name: string, last_name: string) => {
    try {
      const res = await api.patch("/users/name", {
        first_name: first_name.trim(),
        last_name: last_name.trim(),
      });
      const updatedData = res.data?.data;
      if (updatedData) {
        setUser((prev) => ({
          ...(prev || {}),
          ...updatedData,
          first_name: updatedData.first_name || first_name.trim(),
          last_name: updatedData.last_name || last_name.trim(),
          name: `${updatedData.first_name || first_name} ${updatedData.last_name || last_name}`.trim(),
        }));
      }
      return { success: true, data: updatedData };
    } catch (error: unknown) {
      return { success: false, error: apiError(error, "Failed to update name") };
    }
  };

  const logout = async () => {
    if (typeof window !== "undefined") {
      try {
        for (const storage of [localStorage, sessionStorage]) {
          for (let index = storage.length - 1; index >= 0; index--) {
            const key = storage.key(index);
            if (key?.startsWith("alma_")) storage.removeItem(key);
          }
        }
      } catch (e) {
        console.warn("Error clearing browser storage:", e);
      }
    }
    setUser(null);
    await signOut({ callbackUrl: new URL("/welcome", window.location.origin).href });
  };

  const refreshUser = async () => {
    if (status === "authenticated") {
      const profile = await fetchProfile();
      if (profile) setUser(profile);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: status === "authenticated" && user?.role === role && String(user?._id || user?.id) === session?.backendId ? user : null,
        role,
        loading,
        login,
        register,
        registerTeacher,
        registerParent,
        updateUser,
        uploadProfilePicture,
        updateName,
        logout,
        refreshUser,
      }}
    >
      <Suspense fallback={null}>
        <AuthRouteGuard authenticating={authenticating} />
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
