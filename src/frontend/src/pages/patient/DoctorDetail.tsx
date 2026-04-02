import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Banknote,
  Building2,
  Calendar,
  CheckCircle,
  ChevronRight,
  CreditCard,
  IndianRupee,
  Loader2,
  Phone,
  Stethoscope,
  XCircle,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Doctor, Hospital } from "../../backend.d";
import { Layout } from "../../components/Layout";
import { useNavigate, useParams } from "../../components/RouterUtils";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";

type BookingStep = "view" | "date" | "payment" | "processing";

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function DoctorDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();
  const { patientId } = useAuth();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [bookingStep, setBookingStep] = useState<BookingStep>("view");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [isBooking, setIsBooking] = useState(false);

  // Generate today and tomorrow
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = tomorrowDate.toISOString().split("T")[0];

  useEffect(() => {
    if (!actor || isFetching || !id) return;
    loadData();
  }, [actor, isFetching, id]);

  const loadData = async () => {
    if (!actor || !id) return;
    setLoading(true);
    setError("");
    try {
      const [doctorData] = await Promise.all([actor.getDoctorById(BigInt(id))]);
      if (!doctorData) {
        setError("Doctor not found.");
        return;
      }
      setDoctor(doctorData);
      const hospitalData = await actor.getHospitalById(doctorData.hospitalId);
      setHospital(hospitalData);
    } catch (err) {
      console.error(err);
      setError("Failed to load doctor details.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDate = (date: string) => {
    setSelectedDate(date);
    setBookingStep("payment");
  };

  const handleCashPayment = async () => {
    if (!actor || !doctor || !patientId || !selectedDate) {
      toast.error("Please log in to book an appointment.");
      return;
    }
    setIsBooking(true);
    setBookingStep("processing");
    try {
      const bookingId = await actor.createBooking(
        patientId,
        doctor.id,
        doctor.hospitalId,
        selectedDate,
        "cash",
      );
      toast.success("Appointment booked! Pay at the clinic.");
      navigate(`/patient/booking/${bookingId.toString()}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to book appointment. Please try again.");
      setBookingStep("payment");
    } finally {
      setIsBooking(false);
    }
  };

  const handleCardPayment = async () => {
    if (!actor || !doctor || !patientId || !selectedDate) {
      toast.error("Please log in to book an appointment.");
      return;
    }

    setIsBooking(true);
    try {
      // First check if Stripe is configured
      const isConfigured = await actor.isStripeConfigured();
      if (!isConfigured) {
        toast.error(
          "Online payment is not configured. Please pay at the clinic or contact admin.",
        );
        setIsBooking(false);
        return;
      }

      // Create booking first with card payment method
      const bookingId = await actor.createBooking(
        patientId,
        doctor.id,
        doctor.hospitalId,
        selectedDate,
        "card",
      );

      const chargeAmount = Number(doctor.charge);
      const successUrl = `${window.location.origin}/patient/payment/success?session_id={CHECKOUT_SESSION_ID}&booking_id=${bookingId.toString()}`;
      const cancelUrl = `${window.location.origin}/patient/doctor/${id}`;

      const checkoutUrl = await actor.createCheckoutSession(
        [
          {
            productName: `Consultation with ${doctor.name}`,
            currency: "inr",
            quantity: BigInt(1),
            priceInCents: BigInt(chargeAmount * 100),
            productDescription: `${doctor.specialty} - ${hospital?.name ?? ""}`,
          },
        ],
        successUrl,
        cancelUrl,
      );

      window.location.href = checkoutUrl;
    } catch (err) {
      console.error(err);
      toast.error("Failed to create payment session. Please try again.");
      setIsBooking(false);
    }
  };

  if (error) {
    return (
      <Layout title="Doctor" showBack showNav userRole="patient">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Layout>
    );
  }

  if (loading || isFetching) {
    return (
      <Layout title="Doctor" showBack showNav userRole="patient">
        <div className="bg-card rounded-2xl border border-border shadow-card p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="w-20 h-20 rounded-2xl" />
            <div className="flex-1">
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
          <Separator className="my-4" />
          <Skeleton className="h-12 w-full rounded-xl mt-2" />
        </div>
      </Layout>
    );
  }

  if (!doctor) return null;

  return (
    <Layout title="Doctor Profile" showBack showNav userRole="patient">
      {/* Doctor profile card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border shadow-card overflow-hidden mb-4"
      >
        {/* Header gradient */}
        <div className="medical-gradient p-6 pb-10 relative">
          <div className="flex items-start gap-4">
            <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-white font-display font-bold text-2xl shadow-lg">
              {getInitials(doctor.name)}
            </div>
            <div className="flex-1">
              <h2 className="font-display font-bold text-2xl text-white">
                {doctor.name}
              </h2>
              <div className="flex items-center gap-1 mt-1 text-white/80">
                <Stethoscope className="w-4 h-4" />
                <span className="text-sm font-medium">{doctor.specialty}</span>
              </div>
              <div className="mt-2">
                {doctor.available ? (
                  <Badge className="bg-white/20 text-white border-white/30 text-xs">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Available Today
                  </Badge>
                ) : (
                  <Badge className="bg-black/20 text-white/70 border-white/20 text-xs">
                    <XCircle className="w-3 h-3 mr-1" />
                    Currently Unavailable
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="p-5 -mt-4 relative z-10">
          <div className="bg-card rounded-xl border border-border shadow-xs p-4 space-y-3">
            {hospital && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Hospital</p>
                  <p className="font-medium text-sm text-foreground">
                    {hospital.name}
                  </p>
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-medical-green-light flex items-center justify-center">
                <IndianRupee className="w-4 h-4 text-medical-green" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Consultation Charge
                </p>
                <p className="font-bold text-lg text-medical-green">
                  ₹{Number(doctor.charge)}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                <Phone className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Contact</p>
                <p className="font-medium text-sm text-foreground">
                  {doctor.phone}
                </p>
              </div>
            </div>
          </div>

          {hospital && (
            <div className="mt-3 p-3 bg-muted/50 rounded-xl text-sm text-muted-foreground">
              <Building2 className="w-3.5 h-3.5 inline mr-1.5 text-primary" />
              {hospital.address}
            </div>
          )}
        </div>
      </motion.div>

      {/* Booking section */}
      <AnimatePresence mode="wait">
        {bookingStep === "view" && (
          <motion.div
            key="view"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ delay: 0.1 }}
            className="bg-card rounded-2xl border border-border shadow-card p-5"
          >
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-display font-semibold text-foreground">
                Book an Appointment
              </h3>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Secure your slot and visit the clinic at your chosen time.
            </p>

            {doctor.available ? (
              <Button
                className="w-full h-12 medical-gradient text-white font-semibold text-base rounded-xl"
                onClick={() => setBookingStep("date")}
              >
                <Calendar className="w-5 h-5 mr-2" />
                Book Appointment — ₹{Number(doctor.charge)}
              </Button>
            ) : (
              <div className="bg-destructive/10 text-destructive rounded-xl p-3 text-sm text-center font-medium">
                This doctor is not available for appointments right now
              </div>
            )}
          </motion.div>
        )}

        {bookingStep === "date" && (
          <motion.div
            key="date"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="bg-card rounded-2xl border border-border shadow-card p-5"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-xs">1</span>
              </div>
              <h3 className="font-display font-semibold text-foreground">
                Select Appointment Date
              </h3>
            </div>

            <div className="space-y-3 mb-4">
              {[
                { date: todayStr, label: "Today" },
                { date: tomorrowStr, label: "Tomorrow" },
              ].map(({ date, label }) => (
                <button
                  key={date}
                  type="button"
                  onClick={() => handleSelectDate(date)}
                  className="w-full flex items-center justify-between p-4 bg-secondary/60 hover:bg-secondary border border-border hover:border-primary rounded-xl transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-primary" />
                    <div className="text-left">
                      <p className="font-semibold text-foreground text-sm">
                        {label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(date)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>

            <Button
              variant="ghost"
              className="w-full text-sm text-muted-foreground"
              onClick={() => setBookingStep("view")}
            >
              ← Back
            </Button>
          </motion.div>
        )}

        {bookingStep === "payment" && (
          <motion.div
            key="payment"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            className="bg-card rounded-2xl border border-border shadow-card p-5"
          >
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-bold text-xs">2</span>
              </div>
              <h3 className="font-display font-semibold text-foreground">
                Choose Payment Method
              </h3>
            </div>

            <p className="text-xs text-muted-foreground mb-4 ml-9">
              {formatDate(selectedDate)}
            </p>

            {/* Amount summary */}
            <div className="bg-secondary/60 rounded-xl p-3 mb-4 flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Consultation fee
              </span>
              <span className="font-bold text-foreground">
                ₹{Number(doctor.charge)}
              </span>
            </div>

            <div className="space-y-3 mb-4">
              {/* Card Payment */}
              <button
                type="button"
                onClick={handleCardPayment}
                disabled={isBooking}
                className="w-full flex items-start gap-4 p-4 bg-gradient-to-r from-primary/5 to-primary/10 border border-primary/20 hover:border-primary/50 rounded-xl transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-xl medical-gradient flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">
                    Pay Online (Card/UPI)
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Secure payment via Stripe — visa, mastercard, UPI
                  </p>
                  <Badge className="mt-2 text-xs bg-primary/10 text-primary border-primary/20">
                    Recommended
                  </Badge>
                </div>
                {isBooking ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary mt-1" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
                )}
              </button>

              {/* Cash Payment */}
              <button
                type="button"
                onClick={handleCashPayment}
                disabled={isBooking}
                className="w-full flex items-start gap-4 p-4 bg-gradient-to-r from-accent/5 to-accent/10 border border-accent/20 hover:border-accent/50 rounded-xl transition-all text-left disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="w-10 h-10 rounded-xl green-gradient flex items-center justify-center flex-shrink-0">
                  <Banknote className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-foreground text-sm">
                    Pay at Clinic (Cash)
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Book now, pay ₹{Number(doctor.charge)} when you visit
                  </p>
                </div>
                {isBooking ? (
                  <Loader2 className="w-4 h-4 animate-spin text-accent mt-1" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-muted-foreground mt-1" />
                )}
              </button>
            </div>

            <Button
              variant="ghost"
              className="w-full text-sm text-muted-foreground"
              onClick={() => setBookingStep("date")}
              disabled={isBooking}
            >
              ← Change Date
            </Button>
          </motion.div>
        )}

        {bookingStep === "processing" && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl border border-border shadow-card p-8 text-center"
          >
            <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto mb-4" />
            <h3 className="font-display font-semibold text-foreground mb-1">
              Booking your appointment...
            </h3>
            <p className="text-sm text-muted-foreground">
              Please wait a moment
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </Layout>
  );
}
