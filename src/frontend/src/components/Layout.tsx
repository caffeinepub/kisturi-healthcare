import { Button } from "@/components/ui/button";
import {
  Activity,
  ArrowLeft,
  LayoutDashboard,
  LogOut,
  User,
} from "lucide-react";
import type { ReactNode } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "./RouterUtils";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  showNav?: boolean;
  userRole?: "patient" | "doctor" | "hospital";
}

export function Layout({
  children,
  title,
  showBack = false,
  showNav = true,
  userRole,
}: LayoutProps) {
  const { logout, patientName, role: authRole } = useAuth();
  const navigate = useNavigate();

  const currentRole = userRole || authRole;

  const handleBack = () => {
    window.history.back();
  };

  const handleHome = () => {
    if (currentRole === "patient") navigate("/patient/home");
    else if (currentRole === "doctor") navigate("/doctor/dashboard");
    else if (currentRole === "hospital") navigate("/hospital/dashboard");
    else navigate("/");
  };

  const handleProfile = () => {
    if (currentRole === "patient") navigate("/patient/profile");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen surface-gradient flex flex-col">
      {/* Header */}
      {showNav && (
        <header className="sticky top-0 z-40 bg-card/95 backdrop-blur-md border-b border-border shadow-xs">
          <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
            {/* Left: back or logo */}
            <div className="flex items-center gap-2">
              {showBack ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors p-1 -ml-1 rounded-lg hover:bg-secondary"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleHome}
                  className="flex items-center gap-2"
                >
                  <div className="w-8 h-8 medical-gradient rounded-lg flex items-center justify-center">
                    <Activity className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-display font-bold text-foreground text-base hidden sm:block">
                    Kisturi Healthcare
                  </span>
                </button>
              )}
            </div>

            {/* Center: title */}
            {title && (
              <h1 className="font-display font-bold text-foreground text-base absolute left-1/2 -translate-x-1/2">
                {title}
              </h1>
            )}

            {/* Right: actions */}
            <div className="flex items-center gap-1">
              {currentRole === "patient" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg"
                  onClick={handleProfile}
                  aria-label="Profile"
                >
                  <User className="w-4 h-4" />
                </Button>
              )}
              {(currentRole === "doctor" || currentRole === "hospital") && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-lg"
                  onClick={handleHome}
                  aria-label="Dashboard"
                >
                  <LayoutDashboard className="w-4 h-4" />
                </Button>
              )}
              {currentRole && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 gap-1 rounded-lg text-muted-foreground hover:text-destructive"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:block text-xs">Logout</span>
                </Button>
              )}
              {!currentRole && patientName && (
                <span className="text-sm text-muted-foreground">
                  {patientName}
                </span>
              )}
            </div>
          </div>
        </header>
      )}

      {/* Main content */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 pb-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border bg-card/50">
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-primary transition-colors"
        >
          Built with ❤️ using caffeine.ai
        </a>
      </footer>
    </div>
  );
}
