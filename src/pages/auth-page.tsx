import { useState, useCallback, type FormEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/auth-context";
import {
  validateEmail,
  validatePassword,
  validateName,
  validateConfirmPassword,
} from "@/lib/validators";
import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// ── Types ───────────────────────────────────────────────────────────────────
type AuthMode = "login" | "register";

interface FieldErrors {
  name?: string | null;
  email?: string | null;
  password?: string | null;
  confirmPassword?: string | null;
}

// ── Component ───────────────────────────────────────────────────────────────
export function AuthPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register, isLoading, error, clearError } = useAuthContext();

  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Where to redirect after successful auth
  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/";

  // ── Tab switching ───────────────────────────────────────────────────────
  const switchMode = useCallback(
    (newMode: AuthMode) => {
      setMode(newMode);
      setFieldErrors({});
      setTouched({});
      clearError();
    },
    [clearError]
  );

  // ── Inline validation on blur ─────────────────────────────────────────
  const handleBlur = useCallback(
    (field: string) => {
      setTouched((prev) => ({ ...prev, [field]: true }));
      setFieldErrors((prev) => {
        const next = { ...prev };
        switch (field) {
          case "name":
            next.name = validateName(name);
            break;
          case "email":
            next.email = validateEmail(email);
            break;
          case "password":
            next.password = validatePassword(password);
            break;
          case "confirmPassword":
            next.confirmPassword = validateConfirmPassword(password, confirmPassword);
            break;
        }
        return next;
      });
    },
    [name, email, password, confirmPassword]
  );

  // ── Full-form validation ──────────────────────────────────────────────
  const validate = useCallback((): boolean => {
    const errors: FieldErrors = {
      email: validateEmail(email),
      password: validatePassword(password),
    };

    if (mode === "register") {
      errors.name = validateName(name);
      errors.confirmPassword = validateConfirmPassword(password, confirmPassword);
    }

    setFieldErrors(errors);
    // Mark all fields as touched so errors display
    setTouched({ name: true, email: true, password: true, confirmPassword: true });

    return !Object.values(errors).some(Boolean);
  }, [mode, name, email, password, confirmPassword]);

  // ── Submit ────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      try {
        if (mode === "login") {
          await login({ email, password });
        } else {
          await register({ name, email, password, role: "STUDENT" });
        }
        navigate(from, { replace: true });
      } catch {
        // Error is set in AuthContext — no additional handling needed
      }
    },
    [mode, email, password, name, from, validate, login, register, navigate]
  );

  // ── Render ────────────────────────────────────────────────────────────
  const isLogin = mode === "login";

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        {/* ── Branding ─────────────────────────────────────────────── */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-slate-900">
            Placement Tracker
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track your interview progress and land your dream role.
          </p>
        </div>

        {/* ── Tab Switcher ─────────────────────────────────────────── */}
        <div className="mb-4 flex rounded-lg bg-slate-200 p-1">
          <button
            type="button"
            onClick={() => switchMode("login")}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition-all",
              isLogin
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode("register")}
            className={cn(
              "flex-1 rounded-md py-2 text-sm font-medium transition-all",
              !isLogin
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            )}
          >
            Create Account
          </button>
        </div>

        {/* ── Card ─────────────────────────────────────────────────── */}
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">
              {isLogin ? "Welcome back" : "Create your account"}
            </CardTitle>
            <CardDescription className="text-sm text-slate-600">
              {isLogin
                ? "Enter your credentials to access your dashboard."
                : "Fill in the details below to get started."}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* ── Server Error Banner ──────────────────────────────── */}
            {error && (
              <div
                role="alert"
                className="mb-4 rounded-md bg-destructive/10 px-4 py-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
              {/* Name (register only) */}
              {!isLogin && (
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="auth-name" className="text-sm font-medium text-slate-900">
                    Full Name
                  </Label>
                  <Input
                    id="auth-name"
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={() => handleBlur("name")}
                    aria-invalid={!!fieldErrors.name && touched.name}
                    autoComplete="name"
                  />
                  {touched.name && fieldErrors.name && (
                    <p className="text-xs text-destructive">{fieldErrors.name}</p>
                  )}
                </div>
              )}

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-email" className="text-sm font-medium text-slate-900">
                  Email
                </Label>
                <Input
                  id="auth-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={() => handleBlur("email")}
                  aria-invalid={!!fieldErrors.email && touched.email}
                  autoComplete="email"
                />
                {touched.email && fieldErrors.email && (
                  <p className="text-xs text-destructive">{fieldErrors.email}</p>
                )}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="auth-password" className="text-sm font-medium text-slate-900">
                  Password
                </Label>
                <Input
                  id="auth-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur("password")}
                  aria-invalid={!!fieldErrors.password && touched.password}
                  autoComplete={isLogin ? "current-password" : "new-password"}
                />
                {touched.password && fieldErrors.password && (
                  <p className="text-xs text-destructive">{fieldErrors.password}</p>
                )}
              </div>

              {/* Confirm Password (register only) */}
              {!isLogin && (
                <div className="flex flex-col gap-1.5">
                  <Label
                    htmlFor="auth-confirm-password"
                    className="text-sm font-medium text-slate-900"
                  >
                    Confirm Password
                  </Label>
                  <Input
                    id="auth-confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onBlur={() => handleBlur("confirmPassword")}
                    aria-invalid={
                      !!fieldErrors.confirmPassword && touched.confirmPassword
                    }
                    autoComplete="new-password"
                  />
                  {touched.confirmPassword && fieldErrors.confirmPassword && (
                    <p className="text-xs text-destructive">
                      {fieldErrors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Submit */}
              <Button
                type="submit"
                size="sm"
                disabled={isLoading}
                className="mt-2 w-full md:w-auto md:self-end"
              >
                {isLoading
                  ? isLogin
                    ? "Signing in…"
                    : "Creating account…"
                  : isLogin
                    ? "Sign In"
                    : "Create Account"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* ── Footer ───────────────────────────────────────────────── */}
        <p className="mt-6 text-center text-xs text-slate-400">
          By continuing you agree to our Terms of Service.
        </p>
      </div>
    </main>
  );
}
