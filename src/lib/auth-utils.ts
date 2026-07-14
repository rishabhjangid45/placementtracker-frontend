/**
 * Checks if a JWT token is expired.
 * 
 * @param token The JWT token string
 * @returns true if the token is expired or invalid, false otherwise
 */
export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return true; // Not a valid JWT structure
    }
    const payload = parts[1];
    
    // Decode base64url safely
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    
    if (typeof decoded.exp !== "number") {
      return false; // If no exp claim is present, assume token does not expire
    }
    
    // exp is in seconds, Date.now() is in milliseconds
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch (error) {
    return true; // Any parsing error means the token is invalid/expired
  }
}
