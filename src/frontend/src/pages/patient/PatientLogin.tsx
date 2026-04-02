import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Loader2, Phone, ShieldCheck, User } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import { useNavigate } from "../../components/RouterUtils";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";
import { generateOTP } from "../../utils/otp";

type Step = "phone" | "otp" | "name";

export function PatientLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { actor } = useActor();

  const [step, setStep] = useState<Step>("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }
    const code = generateOTP();
    setGeneratedOtp(code);
    setOtp("");
    setStep("otp");
  };

  const handleVerifyOTP = async () => {
    if (otp !== generatedOtp) {
      toast.error("Invalid OTP. Please check and try again.");
      return;
    }

    setLoading(true);
    try {
      if (!actor) {
        toast.error("Backend not ready. Please wait.");
        return;
      }

      const existing = await actor.getPatientByPhone(phone);
      if (existing) {
        const profile = {
          userType: "patient",
          name: existing.name,
          phone: existing.phone,
          entityId: existing.id,
        };
        await actor.saveCallerUserProfile(profile);
        login("patient", existing.id, existing.name, existing.phone);
        toast.success(`Welcome back, ${existing.name}!`);
        navigate("/patient/home");
      } else {
        setStep("name");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePatient = async () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }

    setLoading(true);
    try {
      if (!actor) {
        toast.error("Backend not ready. Please wait.");
        return;
      }

      const patientId = await actor.createPatient(name.trim(), phone);
      const profile = {
        userType: "patient",
        name: name.trim(),
        phone,
        entityId: patientId,
      };
      await actor.saveCallerUserProfile(profile);
      login("patient", patientId, name.trim(), phone);
      toast.success(`Welcome to Kisturi Healthcare, ${name.trim()}!`);
      navigate("/patient/home");
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
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            type="button"
            onClick={() =>
              step === "phone" ? navigate("/") : setStep("phone")
            }
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">Back</span>
          </button>

          <div className="w-14 h-14 rounded-2xl medical-gradient flex items-center justify-center mb-4 shadow-medical">
            <Phone className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-foreground">
            {step === "phone"
              ? "Patient Login"
              : step === "otp"
                ? "Verify Phone"
                : "Your Name"}
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            {step === "phone"
              ? "Enter your mobile number to continue"
              : step === "otp"
                ? `Verification code sent to ${phone}`
                : "Just one more step to complete your profile"}
          </p>
        </motion.div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.25 }}
          >
            <Card className="shadow-card border-border">
              <CardContent className="p-5 space-y-4">
                {step === "phone" && (
                  <>
                    <div>
                      <label
                        htmlFor="patient-phone"
                        className="text-sm font-medium text-foreground block mb-1.5"
                      >
                        Mobile Number
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="patient-phone"
                          type="tel"
                          placeholder="Enter 10-digit mobile number"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-9 h-11"
                          maxLength={10}
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleSendOTP()
                          }
                          autoFocus
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full h-11 medical-gradient text-white font-semibold"
                      onClick={handleSendOTP}
                      disabled={loading || !phone}
                    >
                      Send OTP
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
                        Use this code to verify your number
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="patient-otp"
                        className="text-sm font-medium text-foreground block mb-1.5"
                      >
                        Enter OTP
                      </label>
                      <Input
                        id="patient-otp"
                        type="text"
                        placeholder="Enter 6-digit OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        className="h-11 text-center text-xl tracking-widest font-bold"
                        maxLength={6}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleVerifyOTP()
                        }
                        autoFocus
                      />
                    </div>
                    <Button
                      className="w-full h-11 medical-gradient text-white font-semibold"
                      onClick={handleVerifyOTP}
                      disabled={loading || otp.length !== 6}
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        "Verify OTP"
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full text-sm text-muted-foreground"
                      onClick={handleResendOTP}
                    >
                      Generate New OTP
                    </Button>
                  </>
                )}

                {step === "name" && (
                  <>
                    <div>
                      <label
                        htmlFor="patient-name"
                        className="text-sm font-medium text-foreground block mb-1.5"
                      >
                        Your Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          id="patient-name"
                          type="text"
                          placeholder="Enter your full name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="pl-9 h-11"
                          onKeyDown={(e) =>
                            e.key === "Enter" && handleCreatePatient()
                          }
                          autoFocus
                        />
                      </div>
                    </div>
                    <Button
                      className="w-full h-11 medical-gradient text-white font-semibold"
                      onClick={handleCreatePatient}
                      disabled={loading || !name.trim()}
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
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <p className="text-center text-xs text-muted-foreground mt-4">
          Demo mode — OTP is shown on screen
        </p>
      </div>
    </div>
  );
}
