import { Navigate, Outlet, useLocation } from "react-router-dom";
import { isTokenExpired } from "@/lib/auth-utils";

/**
 * Route guard that checks for an existing JWT in localStorage and verifies it is not expired.
 * If no token exists or if it is expired, the user is redirected to the login page.
 * The intended destination is preserved so we can redirect back after login.
 */
export function ProtectedRoute() {
  const location = useLocation();
  const token = localStorage.getItem("token");

  if (!token || isTokenExpired(token)) {
    if (token) {
      localStorage.removeItem("token");
    }
    // Pass the current location as state so the login page can redirect back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}

