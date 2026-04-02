import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Building2,
  Eye,
  EyeOff,
  IndianRupee,
  Loader2,
  Lock,
  Phone,
  ShieldCheck,
  Stethoscope,
  User,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Hospital } from "../../backend.d";
import { useNavigate } from "../../components/RouterUtils";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";
import { generateOTP } from "../../utils/otp";

const SPECIALTIES = [
  "Cardiology",
  "Orthopedics",
  "Pediatrics",
  "Dermatology",
  "General Medicine",
  "Neurology",
  "Oncology",
  "Gynecology",
  "Ophthalmology",
  "ENT",
  "Psychiatry",
  "Urology",
];

type Step = "form" | "otp";

export function DoctorSignup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { actor } = useActor();

  const [step, setStep] = useState<Step>("form");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [hospitalId, setHospitalId] = useState("");
  const [charge, setCharge] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!actor) return;
    actor.getAllHospitals().then(setHospitals).catch(console.error);
  }, [actor]);

  const handleSendOTP = () => {
    if (
      !name.trim() ||
      !phone ||
      !password ||
      !specialty ||
      !hospitalId ||
      !charge
    ) {
      toast.error("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
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

      const doctorId = await actor.createDoctor(
        name.trim(),
        phone,
        specialty,
        BigInt(hospitalId),
        BigInt(charge),
        true,
      );

      // Link doctor to hospital
      await actor.addDoctorToHospital(BigInt(hospitalId), doctorId);

      const profile = {
        userType: "doctor",
        name: name.trim(),
        phone,
        entityId: doctorId,
      };
      await actor.saveCallerUserProfile(profile);
      login("doctor", doctorId, name.trim(), phone);
      toast.success("Account created successfully!");
      navigate("/doctor/dashboard");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create account. Please try again.");
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
              step === "otp" ? setStep("form") : navigate("/doctor/login")
            }
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-5 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          <div className="w-14 h-14 rounded-2xl medical-gradient flex items-center justify-center mb-4 shadow-medical">
            <Stethoscope className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            {step === "form" ? "Doctor Sign Up" : "Verify Phone"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {step === "form"
              ? "Create your doctor account"
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
                      <p className="text-sm font-medium text-foreground block mb-1.5">
                        Full Name
                      </p>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Dr. Full Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-9 h-10"
                          autoFocus
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground block mb-1.5">
                        Mobile Number
                      </p>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="tel"
                          placeholder="10-digit mobile number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-9 h-10"
                          maxLength={10}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground block mb-1.5">
                        Specialty
                      </p>
                      <Select value={specialty} onValueChange={setSpecialty}>
                        <SelectTrigger className="h-10">
                          <Stethoscope className="w-4 h-4 mr-2 text-muted-foreground" />
                          <SelectValue placeholder="Select specialty" />
                        </SelectTrigger>
                        <SelectContent>
                          {SPECIALTIES.map((s) => (
                            <SelectItem key={s} value={s}>
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground block mb-1.5">
                        Hospital
                      </p>
                      <Select value={hospitalId} onValueChange={setHospitalId}>
                        <SelectTrigger className="h-10">
                          <Building2 className="w-4 h-4 mr-2 text-muted-foreground" />
                          <SelectValue placeholder="Select hospital" />
                        </SelectTrigger>
                        <SelectContent>
                          {hospitals.map((h) => (
                            <SelectItem
                              key={h.id.toString()}
                              value={h.id.toString()}
                            >
                              {h.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground block mb-1.5">
                        Consultation Charge (₹)
                      </p>
                      <div className="relative">
                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="number"
                          placeholder="e.g. 500"
                          value={charge}
                          onChange={(e) => setCharge(e.target.value)}
                          className="pl-9 h-10"
                          min={0}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-foreground block mb-1.5">
                        Password
                      </p>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
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

                    <div>
                      <p className="text-sm font-medium text-foreground block mb-1.5">
                        Confirm Password
                      </p>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          type="password"
                          placeholder="Confirm password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="pl-9 h-10"
                        />
                      </div>
                    </div>

                    <Button
                      className="w-full h-11 medical-gradient text-white font-semibold mt-2"
                      onClick={handleSendOTP}
                    >
                      Verify Phone & Continue
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
                      <p className="text-sm font-medium text-foreground block mb-1.5">
                        Enter OTP
                      </p>
                      <Input
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
                      className="w-full h-11 medical-gradient text-white font-semibold"
                      onClick={handleVerifyAndSignup}
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
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
