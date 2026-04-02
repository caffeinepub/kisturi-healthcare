import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  ArrowRight,
  Building2,
  ChevronDown,
  Shield,
  Stethoscope,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { useNavigate } from "../components/RouterUtils";

export function RoleSelector() {
  const navigate = useNavigate();
  const [showProviderChoice, setShowProviderChoice] = useState(false);

  return (
    <div className="min-h-screen surface-gradient flex flex-col">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full opacity-10"
          style={{ background: "oklch(0.48 0.18 255)" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full opacity-10"
          style={{ background: "oklch(0.55 0.17 145)" }}
        />
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full opacity-5"
          style={{ background: "oklch(0.48 0.18 255)" }}
        />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-12">
        {/* Logo & branding */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl medical-gradient shadow-medical mb-5">
            <Activity className="w-10 h-10 text-white" />
          </div>
          <h1 className="font-display text-4xl font-bold text-foreground mb-2">
            Kisturi Healthcare
          </h1>
          <p className="text-muted-foreground text-base max-w-xs mx-auto leading-relaxed">
            Your trusted healthcare companion — find doctors, book appointments,
            stay healthy.
          </p>
        </motion.div>

        {/* Role selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="w-full max-w-sm space-y-3"
        >
          <p className="text-center text-sm font-medium text-muted-foreground mb-4">
            Who are you?
          </p>

          {/* Patient Card */}
          <Card
            className="cursor-pointer border-border shadow-card hover:shadow-medical hover:-translate-y-0.5 transition-all duration-200 group"
            onClick={() => navigate("/patient/login")}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-medical-blue-light flex items-center justify-center flex-shrink-0 group-hover:bg-primary transition-colors duration-200">
                  <User className="w-7 h-7 text-primary group-hover:text-white transition-colors duration-200" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display font-bold text-foreground text-lg">
                    I'm a Patient
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Find hospitals, book appointments
                  </p>
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-200" />
              </div>
            </CardContent>
          </Card>

          {/* Doctor / Hospital Card */}
          <Card
            className="cursor-pointer border-border shadow-card hover:shadow-medical hover:-translate-y-0.5 transition-all duration-200 group"
            onClick={() => setShowProviderChoice(!showProviderChoice)}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-medical-green-light flex items-center justify-center flex-shrink-0 group-hover:bg-accent transition-colors duration-200">
                  <Stethoscope className="w-7 h-7 text-medical-green group-hover:text-white transition-colors duration-200" />
                </div>
                <div className="flex-1">
                  <h2 className="font-display font-bold text-foreground text-lg">
                    I'm a Doctor / Hospital
                  </h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Manage appointments & profile
                  </p>
                </div>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${showProviderChoice ? "rotate-180" : ""}`}
                />
              </div>
            </CardContent>
          </Card>

          {/* Provider sub-options */}
          <AnimatePresence>
            {showProviderChoice && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <Button
                    variant="outline"
                    className="h-auto py-4 px-4 flex flex-col gap-2 rounded-xl border-border hover:border-primary hover:bg-secondary transition-all"
                    onClick={() => navigate("/doctor/login")}
                  >
                    <Stethoscope className="w-6 h-6 text-primary" />
                    <span className="font-display font-semibold text-sm">
                      Doctor
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">
                      View appointments
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    className="h-auto py-4 px-4 flex flex-col gap-2 rounded-xl border-border hover:border-accent hover:bg-medical-green-light transition-all"
                    onClick={() => navigate("/hospital/login")}
                  >
                    <Building2 className="w-6 h-6 text-medical-green" />
                    <span className="font-display font-semibold text-sm">
                      Hospital
                    </span>
                    <span className="text-xs text-muted-foreground font-normal">
                      Manage doctors
                    </span>
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Stats or trust indicators */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-10 grid grid-cols-3 gap-6 text-center"
        >
          {[
            { value: "5+", label: "Hospitals" },
            { value: "15+", label: "Doctors" },
            { value: "10+", label: "Specialties" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display font-bold text-2xl text-primary">
                {stat.value}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Admin access link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="relative z-10 pb-2 text-center"
      >
        <button
          type="button"
          onClick={() => navigate("/admin/login")}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
        >
          <Shield className="w-3 h-3" />
          Admin Access
        </button>
      </motion.div>

      {/* Footer */}
      <footer className="relative z-10 py-3 text-center text-xs text-muted-foreground">
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
