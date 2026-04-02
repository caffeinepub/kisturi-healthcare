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
import {
  Activity,
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "../../components/RouterUtils";
import { useAuth } from "../../context/AuthContext";

const ADMIN_PASSWORD = "admin123";

export function AdminLogin() {
  const navigate = useNavigate();
  const { loginAdmin } = useAuth();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Please enter the admin password");
      return;
    }

    setLoading(true);
    // Brief delay for UX
    await new Promise((resolve) => setTimeout(resolve, 400));

    if (password === ADMIN_PASSWORD) {
      loginAdmin();
      navigate("/admin/dashboard");
    } else {
      setError("Incorrect password");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen surface-gradient flex flex-col items-center justify-center px-4">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-8"
          style={{ background: "oklch(0.35 0.15 255)" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-8"
          style={{ background: "oklch(0.35 0.12 220)" }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-sm"
      >
        {/* Back link */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl admin-gradient shadow-admin mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Admin Access
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kisturi Healthcare Management Portal
          </p>
        </div>

        <Card className="shadow-card border-border">
          <CardHeader className="pb-4">
            <CardTitle className="font-display text-lg flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              Secure Login
            </CardTitle>
            <CardDescription className="text-xs">
              Enter the admin password to access the management dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label
                  htmlFor="admin-password"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Admin Password
                </Label>
                <div className="relative">
                  <Input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    placeholder="Enter admin password"
                    className={`h-11 pr-10 ${error ? "border-destructive focus-visible:ring-destructive/30" : ""}`}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-destructive text-xs mt-1.5 flex items-center gap-1"
                  >
                    <span>⚠</span> {error}
                  </motion.p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11 admin-gradient text-white font-semibold shadow-admin"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Verifying...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" />
                    Access Dashboard
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* App brand */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-muted-foreground">
          <Activity className="w-3.5 h-3.5" />
          <span>Kisturi Healthcare</span>
        </div>
      </motion.div>
    </div>
  );
}
