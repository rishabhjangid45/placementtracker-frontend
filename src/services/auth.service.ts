import { api } from "@/lib/api";
import type { LoginRequest, RegisterRequest, AuthResponse } from "@/types/auth";
import { isTokenExpired } from "@/lib/auth-utils";


/**
 * Auth service — handles login, registration, and token management.
 * Backend: POST /api/auth/login, POST /api/auth/register
 */
export const authService = {
  /**
   * POST /api/auth/login
   * Authenticate a user and receive a JWT token.
   */
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const { data } = await api.post<AuthResponse>(
      "/api/auth/login",
      credentials
    );
    localStorage.setItem("token", data.token);
    return data;
  },

  /**
   * POST /api/auth/register
   * Register a new user account and receive a JWT token.
   */
  async register(payload: RegisterRequest): Promise<AuthResponse> {
    console.log("Registering user with payload:", {
      role: "STUDENT",
      ...payload,
    });
    const { data } = await api.post<AuthResponse>(
      "/api/auth/register",
      {
        role: "STUDENT",
        ...payload,
      }
    );
    localStorage.setItem("token", data.token);
    return data;
  },

  /**
   * Log the user out by clearing the token and redirecting.
   */
  logout(): void {
    localStorage.removeItem("token");
    window.location.href = "/login";
  },

  /**
   * Check whether a valid token exists and is not expired.
   */
  isAuthenticated(): boolean {
    const token = localStorage.getItem("token");
    return !!token && !isTokenExpired(token);
  },
};

