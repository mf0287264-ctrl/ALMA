import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_API ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor:
 * In browser environment, securely fetch the decrypted token via the Next.js API route
 * (/api/auth/token). The raw JWT is never held unencrypted in localStorage, but is maintained
 * in the secure HTTP-only NextAuth cookie.
 */
api.interceptors.request.use(
  async (config) => {
    // If request contains FormData, let the browser / environment compute the multipart boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    if (typeof window !== "undefined") {
      try {
        const res = await fetch("/api/auth/token", {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.token) {
            config.headers.Authorization = `Bearer ${data.token}`;
          } else {
            delete config.headers.Authorization;
          }
        } else {
          delete config.headers.Authorization;
        }
      } catch (e) {
        delete config.headers.Authorization;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor:
 * Handles 401 Unauthorized globally without causing infinite redirect loops.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      const requestUrl: string = error.config?.url || "";
      // Only trigger sign out if not an auth attempt endpoint
      if (
        !requestUrl.includes("/login") &&
        !requestUrl.includes("/refresh-token") &&
        !window.location.pathname.startsWith("/login") &&
        !window.location.pathname.startsWith("/welcome")
      ) {
        import("next-auth/react")
          .then(({ signOut }) => {
            signOut({ callbackUrl: "/welcome" });
          })
          .catch(() => {
            window.location.href = "/welcome";
          });
      }
    }
    return Promise.reject(error);
  }
);

export default api;
