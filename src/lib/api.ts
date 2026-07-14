import axios from "axios";
import { isTokenExpired } from "@/lib/auth-utils";

/**
 * Centralized Axios instance for all API communication.
 * Never import `axios` directly in components or hooks — always use this instance.
 */
export const api = axios.create({
  // In development, we use relative URL ("") to trigger Vite's proxy.
  // In production, we use VITE_API_BASE_URL (configured on your deployment platform).
  baseURL: import.meta.env.DEV
    ? ""
    : (import.meta.env.VITE_API_BASE_URL || ""),
  headers: {
    "Content-Type": "application/json",
  },
});

// ── Request Interceptor ─────────────────────────────────────────────────────
// Attaches JWT token from localStorage to every outgoing request after verifying it hasn't expired.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      if (isTokenExpired(token)) {
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(new Error("JWT expired"));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── Response Interceptor ────────────────────────────────────────────────────
// Handles 401 Unauthorized and 403 Forbidden globally by clearing auth data and redirecting.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

