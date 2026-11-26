import axios, { isAxiosError } from "axios";
import { isProtectedPage, loginPath } from "@/lib/auth-routes";

const serverBase =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_BASE_API ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:5000/api/v1";
export const api = axios.create({
  baseURL: typeof window === "undefined" ? serverBase : "/api/proxy",
  timeout: 25000,
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    config.baseURL = "/api/proxy";
    // Caller-supplied credentials are ignored; the server reads the HttpOnly session cookie.
    delete config.headers.Authorization;
  }
  if (config.data instanceof FormData) delete config.headers["Content-Type"];
  else config.headers["Content-Type"] = "application/json";
  return config;
});

let signingOut = false;
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      typeof window !== "undefined" &&
      isAxiosError(error) && error.response?.status === 401 &&
      isProtectedPage(window.location.pathname) &&
      !signingOut
    ) {
      signingOut = true;
      const destination = loginPath(`${window.location.pathname}${window.location.search}`);
      void import("next-auth/react")
        .then(({ signOut }) => signOut({ callbackUrl: new URL(destination, window.location.origin).href }))
        .finally(() => { signingOut = false; });
    }
    return Promise.reject(error);
  },
);
export default api;
