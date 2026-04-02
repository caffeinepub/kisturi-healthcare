import { Card, CardContent } from "@/components/ui/card";
import {
  Activity,
  ArrowRight,
  Clock,
  Heart,
  MapPin,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { Layout } from "../../components/Layout";
import { useNavigate } from "../../components/RouterUtils";
import { useAuth } from "../../context/AuthContext";

export function PatientHome() {
  const navigate = useNavigate();
  const { patientName } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <Layout showNav userRole="patient">
      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl medical-gradient p-5 text-white shadow-medical mb-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/80 text-sm font-medium">{greeting()},</p>
            <h2 className="font-display font-bold text-2xl mt-0.5">
              {patientName || "Patient"}! 👋
            </h2>
            <p className="text-white/70 text-sm mt-1">
              How can we help you today?
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
        </div>
      </motion.div>

      {/* Main action cards */}
      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
        What are you looking for?
      </p>

      <div className="grid grid-cols-1 gap-3 mb-6">
        {/* Find Nearby Hospital */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            className="cursor-pointer border-border shadow-card hover:shadow-medical hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
            onClick={() => navigate("/patient/nearby")}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl medical-gradient flex items-center justify-center flex-shrink-0 shadow-medical group-hover:scale-105 transition-transform">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Find Nearby Hospital
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Discover hospitals close to your location
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-primary font-medium">
                    <span>Use my location</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Search Doctor */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card
            className="cursor-pointer border-border shadow-card hover:shadow-medical hover:-translate-y-0.5 transition-all duration-200 overflow-hidden group"
            onClick={() => navigate("/patient/search")}
          >
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl green-gradient flex items-center justify-center flex-shrink-0 shadow-medical group-hover:scale-105 transition-transform">
                  <Search className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-display font-bold text-lg text-foreground">
                    Search Doctor / Disease
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Find specialists by name or condition
                  </p>
                  <div className="flex items-center gap-1 mt-2 text-xs text-medical-green font-medium">
                    <span>Browse all doctors</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Quick stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-3 gap-3"
      >
        {[
          {
            icon: Heart,
            label: "Specialties",
            value: "12",
            color: "text-red-500 bg-red-50",
          },
          {
            icon: MapPin,
            label: "Hospitals",
            value: "5",
            color: "text-primary bg-secondary",
          },
          {
            icon: Clock,
            label: "Quick Booking",
            value: "24/7",
            color: "text-medical-green bg-medical-green-light",
          },
        ].map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="shadow-card border-border">
            <CardContent className="p-3 text-center">
              <div
                className={`w-8 h-8 rounded-xl ${color} flex items-center justify-center mx-auto mb-1.5`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <p className="font-display font-bold text-base">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </CardContent>
          </Card>
        ))}
      </motion.div>
    </Layout>
  );
}
