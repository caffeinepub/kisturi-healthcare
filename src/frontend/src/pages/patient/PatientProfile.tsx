import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Banknote,
  Building2,
  Calendar,
  ClipboardList,
  CreditCard,
  Hash,
  Loader2,
  Phone,
  Stethoscope,
  User,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Booking } from "../../backend.d";
import { Layout } from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-medical-green-light text-medical-green border-transparent",
  pending: "bg-secondary text-secondary-foreground border-transparent",
  cancelled: "bg-destructive/10 text-destructive border-transparent",
};

export function PatientProfile() {
  const { actor, isFetching } = useActor();
  const { patientId, patientName, phone } = useAuth();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<bigint | null>(null);
  const [confirmCancel, setConfirmCancel] = useState<Booking | null>(null);

  useEffect(() => {
    if (!actor || isFetching || !patientId) return;
    loadBookings();
  }, [actor, isFetching, patientId]);

  const loadBookings = async () => {
    if (!actor || !patientId) return;
    setLoading(true);
    try {
      const data = await actor.getBookingsByPatient(patientId);
      const sorted = [...data].sort((a, b) => b.date.localeCompare(a.date));
      setBookings(sorted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (booking: Booking) => {
    if (!actor) return;
    setCancellingId(booking.id);
    try {
      await actor.cancelBooking(booking.id);
      setBookings((prev) =>
        prev.map((b) =>
          b.id === booking.id ? { ...b, status: "cancelled" } : b,
        ),
      );
      toast.success("Appointment cancelled.");
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel appointment.");
    } finally {
      setCancellingId(null);
      setConfirmCancel(null);
    }
  };

  const initials = patientName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Layout title="My Profile" showBack showNav userRole="patient">
      {/* Profile card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border shadow-card p-5 mb-5"
      >
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl medical-gradient flex items-center justify-center text-white font-display font-bold text-xl shadow-medical">
            {initials || <User className="w-8 h-8" />}
          </div>
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">
              {patientName}
            </h2>
            <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
              <Phone className="w-3.5 h-3.5" />
              <span>{phone}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Booking history */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground">
            Booking History
          </h3>
        </div>
        {!loading && (
          <Badge variant="outline" className="text-xs">
            {bookings.length} total
          </Badge>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card rounded-2xl border border-border shadow-card p-4"
            >
              <div className="flex justify-between mb-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3 w-40 mb-1.5" />
              <Skeleton className="h-3 w-32" />
            </div>
          ))}
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="text-center py-12 bg-card rounded-2xl border border-border shadow-card">
          <ClipboardList className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
          <p className="font-semibold text-foreground">No bookings yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Book your first appointment to see it here
          </p>
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <div className="space-y-3">
          {bookings.map((booking, idx) => (
            <motion.div
              key={booking.id.toString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="bg-card rounded-2xl border border-border shadow-card p-4"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex items-center gap-2">
                  <Hash className="w-4 h-4 text-primary" />
                  <span className="font-display font-bold text-primary text-base">
                    {booking.slotNumber}
                  </span>
                </div>
                <Badge
                  className={`text-xs capitalize ${STATUS_STYLES[booking.status] || STATUS_STYLES.pending}`}
                >
                  {booking.status}
                </Badge>
              </div>

              <Separator className="mb-3" />

              {/* Details */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Stethoscope className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-medium text-foreground">
                    {booking.doctorName}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>{booking.hospitalName}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>
                    {new Date(booking.date).toLocaleDateString("en-IN", {
                      dateStyle: "medium",
                    })}
                  </span>
                </div>

                {/* Payment info */}
                <div className="flex items-center gap-2 pt-1">
                  {booking.paymentMethod === "card" ? (
                    <CreditCard className="w-3.5 h-3.5 text-primary" />
                  ) : (
                    <Banknote className="w-3.5 h-3.5 text-accent" />
                  )}
                  <span className="text-xs text-muted-foreground capitalize">
                    {booking.paymentMethod === "card"
                      ? "Card payment"
                      : "Pay at clinic"}
                  </span>
                  <Badge
                    className={`text-[10px] capitalize ml-auto ${
                      booking.paymentStatus === "paid"
                        ? "bg-medical-green-light text-medical-green border-transparent"
                        : "bg-warning/10 text-warning border-transparent"
                    }`}
                  >
                    {booking.paymentStatus || "pending"}
                  </Badge>
                </div>
              </div>

              {/* Cancel button */}
              {booking.status !== "cancelled" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full h-8 text-destructive hover:text-destructive hover:bg-destructive/10 text-xs"
                  onClick={() => setConfirmCancel(booking)}
                  disabled={cancellingId === booking.id}
                >
                  {cancellingId === booking.id ? (
                    <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />
                  ) : (
                    <XCircle className="w-3.5 h-3.5 mr-1" />
                  )}
                  Cancel Appointment
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Cancel confirmation dialog */}
      <Dialog
        open={!!confirmCancel}
        onOpenChange={(open) => !open && setConfirmCancel(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Appointment?</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel your appointment with{" "}
              <strong>{confirmCancel?.doctorName}</strong> (Slot{" "}
              {confirmCancel?.slotNumber})?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmCancel(null)}>
              Keep it
            </Button>
            <Button
              variant="destructive"
              onClick={() =>
                confirmCancel && handleCancelBooking(confirmCancel)
              }
              disabled={!!cancellingId}
            >
              {cancellingId ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Cancel Appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
