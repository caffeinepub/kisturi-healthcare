import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  MapPin,
  Phone,
  ShieldCheck,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "../../components/RouterUtils";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";
import { generateOTP } from "../../utils/otp";

type Step = "form" | "otp";

const FACILITY_OPTIONS = [
  "ICU",
  "Emergency",
  "X-Ray",
  "Lab",
  "Pharmacy",
  "Surgery",
  "MRI",
  "CT",
  "Cardiology",
  "Pediatrics",
  "Dialysis",
];

export function HospitalSignup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { actor } = useActor();

  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [facilities, setFacilities] = useState<string[]>([]);
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const toggleFacility = (facility: string) => {
    setFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility],
    );
  };

  const handleSendOTP = () => {
    if (!name.trim() || !phone || !password || !address.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    const code = generateOTP();
    setGeneratedOtp(code);
    setOtp("");
    setStep("otp");
  };

  const handleVerifyAndSignup = async () => {
    if (otp !== generatedOtp) {
      toast.error("Invalid OTP. Please try again.");
      return;
    }

    setLoading(true);
    try {
      if (!actor) {
        toast.error("Backend not ready");
        return;
      }

      // Use a default location (can be enhanced with geocoding)
      const hospitalId = await actor.createHospital(
        name.trim(),
        phone,
        address.trim(),
        19.076, // Default Mumbai lat
        72.8777, // Default Mumbai lon
        4.0,
        facilities,
      );

      const profile = {
        userType: "hospital",
        name: name.trim(),
        phone,
        entityId: hospitalId,
      };
      await actor.saveCallerUserProfile(profile);
      login("hospital", hospitalId, name.trim(), phone);
      toast.success("Hospital registered successfully!");
      navigate("/hospital/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to register hospital. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = () => {
    const code = generateOTP();
    setGeneratedOtp(code);
    setOtp("");
    toast.success("New OTP generated");
  };

  return (
    <div className="min-h-screen surface-gradient flex flex-col">
      <div className="max-w-sm mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <button
            type="button"
            onClick={() =>
              step === "otp" ? setStep("form") : navigate("/hospital/login")
            }
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          <div className="w-14 h-14 rounded-2xl green-gradient flex items-center justify-center mb-4 shadow-medical">
            <Building2 className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            {step === "form" ? "Register Hospital" : "Verify Phone"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {step === "form"
              ? "Add your hospital to Kisturi Healthcare"
              : `Verification code for ${phone}`}
          </p>
        </motion.div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="shadow-card border-border">
              <CardContent className="p-5 space-y-3">
                {step === "form" && (
                  <>
                    <div>
                      <label
                        htmlFor="hs-name"
                        className="text-sm font-medium block mb-1.5"
                      >
                        Hospital Name{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <Input
                        id="hs-name"
                        type="text"
                        placeholder="Full hospital name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-10"
                        autoFocus
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="hs-phone"
                        className="text-sm font-medium block mb-1.5"
                      >
                        Mobile Number{" "}
                        <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="hs-phone"
                          type="tel"
                          placeholder="10-digit number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-9 h-10"
                          maxLength={10}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="hs-address"
                        className="text-sm font-medium block mb-1.5"
                      >
                        Address <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <Textarea
                          id="hs-address"
                          placeholder="Full hospital address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          className="pl-9 min-h-[70px] resize-none"
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium block mb-2">
                        Facilities
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {FACILITY_OPTIONS.map((facility) => (
                          <button
                            key={facility}
                            type="button"
                            onClick={() => toggleFacility(facility)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                              facilities.includes(facility)
                                ? "bg-medical-green text-white border-transparent"
                                : "bg-background border-border text-muted-foreground hover:border-medical-green hover:text-medical-green"
                            }`}
                          >
                            {facility}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="hs-password"
                        className="text-sm font-medium block mb-1.5"
                      >
                        Password <span className="text-destructive">*</span>
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="hs-password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Set a password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-9 pr-9 h-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
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
                      className="w-full h-11 green-gradient text-white font-semibold mt-2"
                      onClick={handleSendOTP}
                    >
                      Verify Phone & Register
                    </Button>
                  </>
                )}

                {step === "otp" && (
                  <>
                    {/* OTP display box */}
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <ShieldCheck className="w-4 h-4 text-primary" />
                        <p className="text-xs font-medium text-primary uppercase tracking-wide">
                          Demo OTP Code
                        </p>
                      </div>
                      <p className="font-display font-bold text-3xl text-primary tracking-[0.3em] mt-1">
                        {generatedOtp}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Use this code to verify your phone number
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="hs-otp"
                        className="text-sm font-medium text-foreground block mb-1.5"
                      >
                        Enter OTP
                      </label>
                      <Input
                        id="hs-otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="h-11 text-center text-xl tracking-widest font-bold"
                        maxLength={6}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleVerifyAndSignup()
                        }
                        autoFocus
                      />
                    </div>
                    <Button
                      className="w-full h-11 green-gradient text-white font-semibold"
                      onClick={handleVerifyAndSignup}
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        "Complete Registration"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-sm"
                      onClick={handleResendOTP}
                    >
                      Generate New OTP
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
