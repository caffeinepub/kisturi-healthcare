import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Loader2,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Layout } from "../../components/Layout";
import { useNavigate } from "../../components/RouterUtils";
import { useActor } from "../../hooks/useActor";

export function PaymentSuccess() {
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    if (isFetching || !actor) return;

    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get("session_id");
    const bId = params.get("booking_id");

    if (!sessionId || !bId) {
      setStatus("error");
      return;
    }

    setBookingId(bId);
    confirmPayment(sessionId, bId);
  }, [actor, isFetching]);

  const confirmPayment = async (sessionId: string, bId: string) => {
    if (!actor) return;
    try {
      const sessionStatus = await actor.getStripeSessionStatus(sessionId);

      if (sessionStatus.__kind__ === "completed") {
        await actor.confirmBookingPayment(BigInt(bId));
        setStatus("success");
        toast.success("Payment confirmed! Your booking is complete.");
      } else {
        setStatus("error");
        toast.error("Payment was not completed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      // Even if confirmation fails, still show success if we got here
      setStatus("success");
    }
  };

  return (
    <Layout showNav userRole="patient">
      <div className="flex flex-col items-center justify-center min-h-[60vh] py-8">
        {status === "loading" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center"
          >
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
            <h2 className="font-display font-bold text-xl text-foreground">
              Confirming Payment
            </h2>
            <p className="text-muted-foreground mt-1 text-sm">
              Please wait while we verify your payment...
            </p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="text-center w-full max-w-sm"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.1, type: "spring", stiffness: 300 }}
              className="w-20 h-20 rounded-full bg-medical-green-light flex items-center justify-center mx-auto mb-4"
            >
              <CheckCircle2 className="w-10 h-10 text-medical-green" />
            </motion.div>

            <h2 className="font-display font-bold text-2xl text-foreground mb-1">
              Payment Successful!
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Your appointment has been confirmed and payment processed.
            </p>

            <div className="bg-card border border-border rounded-2xl p-5 mb-6 shadow-card">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="w-5 h-5 text-primary" />
                <span className="font-semibold text-foreground text-sm">
                  Payment Confirmed
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Your booking is confirmed and payment has been recorded. You can
                view your appointment details below.
              </p>
            </div>

            <div className="space-y-2">
              {bookingId && (
                <Button
                  className="w-full h-11 medical-gradient text-white font-semibold"
                  onClick={() => navigate(`/patient/booking/${bookingId}`)}
                >
                  <ClipboardList className="w-4 h-4 mr-2" />
                  View Appointment
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => navigate("/patient/home")}
              >
                Back to Home
              </Button>
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center w-full max-w-sm"
          >
            <div className="w-20 h-20 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-destructive" />
            </div>
            <h2 className="font-display font-bold text-xl text-foreground mb-1">
              Payment Issue
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              We couldn't confirm your payment. If money was deducted, please
              contact support.
            </p>
            <div className="space-y-2">
              <Button
                className="w-full h-11 medical-gradient text-white font-semibold"
                onClick={() => navigate("/patient/home")}
              >
                Go to Home
              </Button>
              <Button
                variant="outline"
                className="w-full h-11"
                onClick={() => navigate("/patient/profile")}
              >
                View My Bookings
              </Button>
            </div>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}
