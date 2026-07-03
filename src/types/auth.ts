/**
 * Login request payload.
 * Endpoint: POST /api/auth/login
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Registration request payload.
 * Endpoint: POST /api/auth/register
 */
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  role?: "STUDENT" | "MENTOR" | "ADMIN";
}

/**
 * JWT authentication response from the backend.
 * Both login and register return this shape.
 */
export interface AuthResponse {
  token: string;
}
