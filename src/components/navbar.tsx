import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function Navbar() {
  const { logout } = useAuthContext();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { name: "Dashboard", path: "/" },
    { name: "Jobs", path: "/jobs" },
    { name: "Resume", path: "/resume" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link
          to="/"
          className="text-lg font-bold text-foreground transition-colors hover:text-foreground/80"
        >
          Placement Tracker
        </Link>

        {/* Desktop Navigation */}
        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-2 sm:flex">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "shadow-sm backdrop-blur-sm transition-all",
                    isActive
                      ? "bg-background/80 border border-border/80 text-foreground font-medium hover:bg-background/95"
                      : "bg-background/30 border border-border/30 text-muted-foreground hover:text-foreground hover:bg-background/50 hover:border-border/50"
                  )}
                  asChild
                >
                  <Link to={item.path}>{item.name}</Link>
                </Button>
              );
            })}
          </nav>
          
          <ThemeToggle />

          <Button
            variant="ghost"
            size="sm"
            onClick={logout}
            className="hidden sm:inline-flex"
          >
            Sign out
          </Button>

          {/* Hamburger Menu Icon for Mobile */}
          <button
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/80 bg-background/80 shadow-sm backdrop-blur-sm hover:bg-background/95 transition-all text-foreground cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring sm:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              // Close Icon
              <svg
                className="h-4.5 w-4.5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              // Hamburger Icon
              <svg
                className="h-4.5 w-4.5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {mobileMenuOpen && (
        <div className="border-t bg-background/95 px-4 py-3 shadow-lg backdrop-blur-md sm:hidden animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  variant="ghost"
                  size="sm"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "w-full justify-start py-2 text-left shadow-sm backdrop-blur-sm transition-all",
                    isActive
                      ? "bg-background/80 border border-border/80 text-foreground font-medium hover:bg-background/95"
                      : "bg-background/30 border border-border/30 text-muted-foreground hover:text-foreground hover:bg-background/50 hover:border-border/50"
                  )}
                  asChild
                >
                  <Link to={item.path}>{item.name}</Link>
                </Button>
              );
            })}
            <div className="my-1 border-t border-border/50" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full justify-start text-red-600 hover:text-red-500 hover:bg-red-500/10"
            >
              Sign out
            </Button>
          </nav>
        </div>
      )}
    </header>
  );
}
