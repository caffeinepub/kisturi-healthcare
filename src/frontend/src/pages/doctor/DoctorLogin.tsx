import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Phone,
  Stethoscope,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "../../components/RouterUtils";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";

export function DoctorLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { actor } = useActor();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!phone || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      if (!actor) {
        toast.error("Backend not ready. Please wait.");
        return;
      }

      const doctor = await actor.getDoctorByPhone(phone);
      if (!doctor) {
        toast.error("Doctor not found with this phone number. Please sign up.");
        return;
      }

      // Demo: accept any password (no real hashing for demo)
      const profile = {
        userType: "doctor",
        name: doctor.name,
        phone: doctor.phone,
        entityId: doctor.id,
      };
      await actor.saveCallerUserProfile(profile);
      login("doctor", doctor.id, doctor.name, doctor.phone);
      toast.success(`Welcome back, ${doctor.name}!`);
      navigate("/doctor/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen surface-gradient flex flex-col">
      <div className="max-w-sm mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          <div className="w-14 h-14 rounded-2xl medical-gradient flex items-center justify-center mb-4 shadow-medical">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            Doctor Login
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Sign in to manage your appointments
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="shadow-card border-border">
            <CardContent className="p-5 space-y-4">
              <div>
                <label
                  htmlFor="doctor-login-phone"
                  className="text-sm font-medium text-foreground block mb-1.5"
                >
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="doctor-login-phone"
                    type="tel"
                    placeholder="Enter mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-9 h-11"
                    maxLength={10}
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="doctor-login-password"
                  className="text-sm font-medium text-foreground block mb-1.5"
                >
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="doctor-login-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-10 h-11"
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                className="w-full h-11 medical-gradient text-white font-semibold"
                onClick={handleLogin}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </CardContent>
          </Card>

          <p className="text-center text-sm text-muted-foreground mt-4">
            New doctor?{" "}
            <button
              type="button"
              onClick={() => navigate("/doctor/signup")}
              className="text-primary font-medium hover:underline"
            >
              Sign up here
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
