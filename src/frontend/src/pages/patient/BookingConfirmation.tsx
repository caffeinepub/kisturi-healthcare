import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  AlertCircle,
  Banknote,
  Building2,
  Calendar,
  CheckCircle2,
  ClipboardList,
  Copy,
  CreditCard,
  Hash,
  Loader2,
  Stethoscope,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Booking } from "../../backend.d";
import { Layout } from "../../components/Layout";
import { useNavigate, useParams } from "../../components/RouterUtils";
import { useActor } from "../../hooks/useActor";

function PaymentBadge({
  method,
  paymentStatus,
}: {
  method: string;
  paymentStatus: string;
}) {
  if (method === "card") {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-primary/10 text-primary border-primary/20 text-xs">
          <CreditCard className="w-3 h-3 mr-1" />
          Card Payment
        </Badge>
        {paymentStatus === "paid" ? (
          <Badge className="bg-medical-green-light text-medical-green border-transparent text-xs">
            Paid
          </Badge>
        ) : (
          <Badge className="bg-warning/10 text-warning border-transparent text-xs capitalize">
            {paymentStatus}
          </Badge>
        )}
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <Badge className="bg-accent/10 text-accent border-accent/20 text-xs">
        <Banknote className="w-3 h-3 mr-1" />
        Pay at Clinic
      </Badge>
      <Badge className="bg-warning/10 text-warning border-transparent text-xs">
        Due at visit
      </Badge>
    </div>
  );
}

export function BookingConfirmation() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();

  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!actor || isFetching || !bookingId) return;
    loadBooking();
  }, [actor, isFetching, bookingId]);

  const loadBooking = async () => {
    if (!actor || !bookingId) return;
    setLoading(true);
    try {
      const data = await actor.getBookingById(BigInt(bookingId));
      if (!data) {
        setError("Booking not found.");
        return;
      }
      setBooking(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load booking details.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopySlot = () => {
    if (booking) {
      navigator.clipboard.writeText(booking.slotNumber);
      toast.success("Slot number copied!");
    }
  };

  if (loading || isFetching) {
    return (
      <Layout showNav userRole="patient">
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (error || !booking) {
    return (
      <Layout showNav userRole="patient">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-3" />
          <p className="font-semibold">{error || "Booking not found"}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate("/patient/home")}
          >
            Go Home
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showNav userRole="patient">
      <div className="flex flex-col items-center py-4">
        {/* Success animation */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="w-20 h-20 rounded-full bg-medical-green-light flex items-center justify-center mb-4"
        >
          <CheckCircle2 className="w-10 h-10 text-medical-green" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <h1 className="font-display font-bold text-2xl text-foreground">
            Appointment Booked!
          </h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Your appointment has been confirmed successfully.
          </p>
        </motion.div>

        {/* Slot number hero */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-sm mb-4"
        >
          <div className="medical-gradient rounded-2xl p-6 text-center shadow-medical">
            <p className="text-white/70 text-xs font-medium uppercase tracking-widest mb-2">
              Your Slot Number
            </p>
            <div className="flex items-center justify-center gap-2">
              <Hash className="w-6 h-6 text-white" />
              <span className="font-display font-bold text-4xl text-white tracking-wider">
                {booking.slotNumber}
              </span>
            </div>
            <p className="text-white/70 text-xs mt-2">
              Show this to the clinic staff
            </p>
            <button
              type="button"
              onClick={handleCopySlot}
              className="mt-3 flex items-center gap-1.5 mx-auto text-white/80 hover:text-white text-xs transition-colors"
            >
              <Copy className="w-3.5 h-3.5" />
              Copy slot number
            </button>
          </div>
        </motion.div>

        {/* Payment badge */}
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full max-w-sm mb-3"
        >
          <div className="bg-card rounded-xl border border-border p-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              Payment
            </span>
            <PaymentBadge
              method={booking.paymentMethod || "cash"}
              paymentStatus={booking.paymentStatus || "pending"}
            />
          </div>
        </motion.div>

        {/* Booking details */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-card p-5 space-y-3"
        >
          <h3 className="font-display font-semibold text-foreground text-sm uppercase tracking-wide">
            Appointment Details
          </h3>

          <Separator />

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg medical-gradient flex items-center justify-center flex-shrink-0">
              <Stethoscope className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Doctor</p>
              <p className="font-semibold text-sm text-foreground">
                {booking.doctorName}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <Building2 className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Hospital</p>
              <p className="font-semibold text-sm text-foreground">
                {booking.hospitalName}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {booking.hospitalAddress}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <Calendar className="w-4 h-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Date</p>
              <p className="font-semibold text-sm text-foreground">
                {new Date(booking.date).toLocaleDateString("en-IN", {
                  dateStyle: "full",
                })}
              </p>
            </div>
          </div>

          <Separator />

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-primary">#</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Booking ID</p>
              <p className="font-semibold text-sm text-foreground">
                {booking.id.toString()}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full max-w-sm mt-5 space-y-2"
        >
          <Button
            className="w-full h-11 medical-gradient text-white font-semibold"
            onClick={() => navigate("/patient/profile")}
          >
            <ClipboardList className="w-4 h-4 mr-2" />
            View My Bookings
          </Button>
          <Button
            variant="outline"
            className="w-full h-11"
            onClick={() => navigate("/patient/home")}
          >
            Back to Home
          </Button>
        </motion.div>
      </div>
    </Layout>
  );
}
