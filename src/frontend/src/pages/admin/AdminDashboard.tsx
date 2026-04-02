import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Activity,
  Ban,
  Building2,
  Calendar,
  CreditCard,
  Eye,
  EyeOff,
  Loader2,
  LogOut,
  RefreshCw,
  Save,
  Settings,
  ShieldCheck,
  Stethoscope,
  User,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { Booking, Doctor, Hospital } from "../../backend.d";
import { useNavigate } from "../../components/RouterUtils";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatientSummary {
  patientId: bigint;
  patientName: string;
  bookingCount: number;
}

// ─── Helper ───────────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    confirmed: "bg-medical-green-light text-medical-green border-transparent",
    pending: "bg-secondary text-secondary-foreground border-transparent",
    cancelled: "bg-destructive/10 text-destructive border-transparent",
  };
  return (
    <Badge
      className={`text-xs capitalize ${variants[status] ?? variants.pending}`}
    >
      {status}
    </Badge>
  );
}

function PaymentStatusBadge({ status }: { status: string }) {
  const variants: Record<string, string> = {
    paid: "bg-medical-green-light text-medical-green border-transparent",
    pending: "bg-warning/10 text-warning border-transparent",
    cash: "bg-secondary text-secondary-foreground border-transparent",
  };
  return (
    <Badge
      className={`text-xs capitalize ${variants[status] ?? variants.pending}`}
    >
      {status}
    </Badge>
  );
}

// ─── Skeleton rows ─────────────────────────────────────────────────────────────

function SkeletonRows({ cols, rows = 5 }: { cols: number; rows?: number }) {
  const rowKeys = Array.from({ length: rows }, (_, i) => `sk-row-${i}`);
  const colKeys = Array.from({ length: cols }, (_, j) => `sk-col-${j}`);
  return (
    <>
      {rowKeys.map((rk) => (
        <TableRow key={rk}>
          {colKeys.map((ck) => (
            <TableCell key={ck}>
              <Skeleton className="h-4 w-full" />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

// ─── AdminDashboard ───────────────────────────────────────────────────────────

export function AdminDashboard() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();

  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [patients, setPatients] = useState<PatientSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<bigint | null>(null);

  // Stripe settings
  const [stripeKey, setStripeKey] = useState("");
  const [showStripeKey, setShowStripeKey] = useState(false);
  const [savingStripe, setSavingStripe] = useState(false);
  const [stripeConfigured, setStripeConfigured] = useState(false);

  const loadData = useCallback(async () => {
    if (!actor || isFetching) return;
    setLoading(true);
    try {
      const [allDoctors, allHospitals, stripeStatus] = await Promise.all([
        actor.getAllDoctors(),
        actor.getAllHospitals(),
        actor.isStripeConfigured(),
      ]);

      setDoctors(allDoctors);
      setHospitals(allHospitals);
      setStripeConfigured(stripeStatus);

      // Use getAllBookings if available, otherwise aggregate from doctors
      let allBookings: Booking[] = [];
      try {
        allBookings = await actor.getAllBookings();
      } catch {
        // Fallback: aggregate from doctors
        const bookingArrays = await Promise.all(
          allDoctors.map((doc) => actor.getBookingsByDoctor(doc.id)),
        );
        const bookingMap = new Map<string, Booking>();
        for (const arr of bookingArrays) {
          for (const b of arr) {
            bookingMap.set(b.id.toString(), b);
          }
        }
        allBookings = Array.from(bookingMap.values());
      }

      const sorted = [...allBookings].sort((a, b) =>
        b.date.localeCompare(a.date),
      );
      setBookings(sorted);

      // Derive unique patients
      const patientMap = new Map<
        string,
        { patientId: bigint; patientName: string; bookingCount: number }
      >();
      for (const b of sorted) {
        const key = b.patientId.toString();
        const existing = patientMap.get(key);
        if (existing) {
          existing.bookingCount += 1;
        } else {
          patientMap.set(key, {
            patientId: b.patientId,
            patientName: b.patientName,
            bookingCount: 1,
          });
        }
      }
      setPatients(Array.from(patientMap.values()));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }, [actor, isFetching]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCancelBooking = async (id: bigint) => {
    if (!actor) return;
    setCancellingId(id);
    try {
      await actor.cancelBooking(id);
      toast.success("Booking cancelled");
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "cancelled" } : b)),
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to cancel booking");
    } finally {
      setCancellingId(null);
    }
  };

  const handleSaveStripe = async () => {
    if (!actor || !stripeKey.trim()) {
      toast.error("Please enter a Stripe secret key");
      return;
    }
    setSavingStripe(true);
    try {
      await actor.setStripeConfiguration({
        secretKey: stripeKey.trim(),
        allowedCountries: ["IN", "US", "GB"],
      });
      toast.success("Stripe configuration saved!");
      setStripeConfigured(true);
      setStripeKey("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save Stripe configuration");
    } finally {
      setSavingStripe(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl admin-gradient flex items-center justify-center shadow-admin">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-base text-foreground leading-tight">
                Admin Dashboard
              </h1>
              <p className="text-xs text-muted-foreground">
                Kisturi Healthcare
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              disabled={loading}
              className="h-8 px-3 text-xs gap-1.5"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="h-8 px-3 text-xs gap-1.5 text-destructive hover:bg-destructive/10 border-destructive/30"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="grid grid-cols-4 gap-4">
            {[
              {
                icon: Users,
                label: "Patients",
                value: patients.length,
                color: "text-blue-600",
              },
              {
                icon: Stethoscope,
                label: "Doctors",
                value: doctors.length,
                color: "text-medical-green",
              },
              {
                icon: Building2,
                label: "Hospitals",
                value: hospitals.length,
                color: "text-primary",
              },
              {
                icon: Calendar,
                label: "Bookings",
                value: bookings.length,
                color: "text-amber-600",
              },
            ].map(({ icon: Icon, label, value, color }) => (
              <div key={label} className="text-center">
                <div className={`font-display font-bold text-xl ${color}`}>
                  {loading ? <Skeleton className="h-7 w-10 mx-auto" /> : value}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5 flex items-center justify-center gap-1">
                  <Icon className="w-3 h-3" />
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Tabs defaultValue="patients">
            <TabsList className="mb-5 h-10 bg-secondary border border-border">
              <TabsTrigger value="patients" className="gap-1.5 text-xs">
                <Users className="w-3.5 h-3.5" />
                Patients
              </TabsTrigger>
              <TabsTrigger value="doctors" className="gap-1.5 text-xs">
                <Stethoscope className="w-3.5 h-3.5" />
                Doctors
              </TabsTrigger>
              <TabsTrigger value="hospitals" className="gap-1.5 text-xs">
                <Building2 className="w-3.5 h-3.5" />
                Hospitals
              </TabsTrigger>
              <TabsTrigger value="bookings" className="gap-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5" />
                Bookings
              </TabsTrigger>
              <TabsTrigger value="settings" className="gap-1.5 text-xs">
                <Settings className="w-3.5 h-3.5" />
                Settings
              </TabsTrigger>
            </TabsList>

            {/* ── PATIENTS TAB ── */}
            <TabsContent value="patients" className="mt-0">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-secondary/50">
                  <h2 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
                    <Users className="w-4 h-4 text-primary" />
                    Registered Patients
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Derived from booking records — patients who have made at
                    least one appointment
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30">
                        <TableHead className="text-xs font-semibold w-28">
                          Patient ID
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Name
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-right">
                          Total Bookings
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <SkeletonRows cols={3} />
                      ) : patients.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={3}
                            className="text-center py-12 text-muted-foreground"
                          >
                            <User className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No patients found</p>
                            <p className="text-xs mt-1">
                              Patients appear here once they make a booking
                            </p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        patients.map((p) => (
                          <TableRow
                            key={p.patientId.toString()}
                            className="hover:bg-secondary/30 transition-colors"
                          >
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              #{p.patientId.toString()}
                            </TableCell>
                            <TableCell className="font-medium text-sm">
                              {p.patientName}
                            </TableCell>
                            <TableCell className="text-right">
                              <Badge
                                variant="secondary"
                                className="text-xs font-mono"
                              >
                                {p.bookingCount} booking
                                {p.bookingCount !== 1 ? "s" : ""}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* ── DOCTORS TAB ── */}
            <TabsContent value="doctors" className="mt-0">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-secondary/50">
                  <h2 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
                    <Stethoscope className="w-4 h-4 text-medical-green" />
                    All Doctors
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30">
                        <TableHead className="text-xs font-semibold w-20">
                          ID
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Name
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Phone
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Specialty
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Hospital ID
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-right">
                          Charge
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-center">
                          Available
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <SkeletonRows cols={7} />
                      ) : doctors.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={7}
                            className="text-center py-12 text-muted-foreground"
                          >
                            <Stethoscope className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No doctors registered</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        doctors.map((doc) => (
                          <TableRow
                            key={doc.id.toString()}
                            className="hover:bg-secondary/30 transition-colors"
                          >
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              #{doc.id.toString()}
                            </TableCell>
                            <TableCell className="font-medium text-sm">
                              {doc.name}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground font-mono">
                              {doc.phone}
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs">
                                {doc.specialty}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              #{doc.hospitalId.toString()}
                            </TableCell>
                            <TableCell className="text-right text-sm font-medium">
                              ₹{doc.charge.toString()}
                            </TableCell>
                            <TableCell className="text-center">
                              {doc.available ? (
                                <Badge className="text-xs bg-medical-green-light text-medical-green border-transparent">
                                  Yes
                                </Badge>
                              ) : (
                                <Badge className="text-xs bg-destructive/10 text-destructive border-transparent">
                                  No
                                </Badge>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* ── HOSPITALS TAB ── */}
            <TabsContent value="hospitals" className="mt-0">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-secondary/50">
                  <h2 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    All Hospitals
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30">
                        <TableHead className="text-xs font-semibold w-20">
                          ID
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Name
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Phone
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Address
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-center">
                          Rating
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Facilities
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <SkeletonRows cols={6} />
                      ) : hospitals.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={6}
                            className="text-center py-12 text-muted-foreground"
                          >
                            <Building2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No hospitals registered</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        hospitals.map((h) => (
                          <TableRow
                            key={h.id.toString()}
                            className="hover:bg-secondary/30 transition-colors"
                          >
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              #{h.id.toString()}
                            </TableCell>
                            <TableCell className="font-medium text-sm">
                              {h.name}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground font-mono">
                              {h.phone}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-48 truncate">
                              {h.address}
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className="text-xs font-mono"
                              >
                                ⭐ {h.rating.toFixed(1)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground max-w-56">
                              <div className="flex flex-wrap gap-1">
                                {h.facilities.slice(0, 3).map((f) => (
                                  <Badge
                                    key={f}
                                    variant="secondary"
                                    className="text-[10px] py-0"
                                  >
                                    {f}
                                  </Badge>
                                ))}
                                {h.facilities.length > 3 && (
                                  <Badge
                                    variant="secondary"
                                    className="text-[10px] py-0"
                                  >
                                    +{h.facilities.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* ── BOOKINGS TAB ── */}
            <TabsContent value="bookings" className="mt-0">
              <div className="bg-card rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-3 border-b border-border bg-secondary/50">
                  <h2 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-600" />
                    All Bookings
                  </h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Complete booking records with payment status
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/30">
                        <TableHead className="text-xs font-semibold">
                          Slot
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Patient
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Doctor
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Hospital
                        </TableHead>
                        <TableHead className="text-xs font-semibold">
                          Date
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-center">
                          Status
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-center">
                          Payment
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-center">
                          Pay Status
                        </TableHead>
                        <TableHead className="text-xs font-semibold text-center">
                          Action
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <SkeletonRows cols={9} />
                      ) : bookings.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={9}
                            className="text-center py-12 text-muted-foreground"
                          >
                            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No bookings found</p>
                          </TableCell>
                        </TableRow>
                      ) : (
                        bookings.map((b) => (
                          <TableRow
                            key={b.id.toString()}
                            className="hover:bg-secondary/30 transition-colors"
                          >
                            <TableCell className="font-mono text-xs font-bold text-primary">
                              {b.slotNumber}
                            </TableCell>
                            <TableCell className="text-sm font-medium">
                              {b.patientName}
                            </TableCell>
                            <TableCell className="text-sm">
                              {b.doctorName}
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground max-w-36 truncate">
                              {b.hospitalName}
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {new Date(b.date).toLocaleDateString("en-IN", {
                                dateStyle: "medium",
                              })}
                            </TableCell>
                            <TableCell className="text-center">
                              <StatusBadge status={b.status} />
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant="outline"
                                className="text-xs capitalize"
                              >
                                {b.paymentMethod || "—"}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <PaymentStatusBadge
                                status={b.paymentStatus || "pending"}
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              {b.status !== "cancelled" ? (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-7 px-2 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                                  disabled={cancellingId === b.id}
                                  onClick={() => handleCancelBooking(b.id)}
                                >
                                  {cancellingId === b.id ? (
                                    <span className="w-3 h-3 border-2 border-destructive/30 border-t-destructive rounded-full animate-spin" />
                                  ) : (
                                    <>
                                      <Ban className="w-3 h-3 mr-1" />
                                      Cancel
                                    </>
                                  )}
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground">
                                  —
                                </span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </TabsContent>

            {/* ── SETTINGS TAB ── */}
            <TabsContent value="settings" className="mt-0">
              <div className="max-w-lg">
                {/* Stripe Configuration */}
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <div className="px-5 py-4 border-b border-border bg-secondary/50">
                    <h2 className="font-display font-semibold text-sm text-foreground flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-primary" />
                      Stripe Payment Configuration
                    </h2>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Enable online card payments for appointments
                    </p>
                  </div>

                  <div className="p-5 space-y-4">
                    {/* Status */}
                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl">
                      <span className="text-sm font-medium text-foreground">
                        Stripe Status
                      </span>
                      {stripeConfigured ? (
                        <Badge className="bg-medical-green-light text-medical-green border-transparent text-xs">
                          Configured ✓
                        </Badge>
                      ) : (
                        <Badge className="bg-destructive/10 text-destructive border-transparent text-xs">
                          Not Configured
                        </Badge>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="admin-stripe-key"
                        className="text-sm font-medium text-foreground block mb-1.5"
                      >
                        Stripe Secret Key
                      </label>
                      <div className="relative">
                        <Input
                          id="admin-stripe-key"
                          type={showStripeKey ? "text" : "password"}
                          placeholder="sk_live_... or sk_test_..."
                          value={stripeKey}
                          onChange={(e) => setStripeKey(e.target.value)}
                          className="h-11 pr-10 font-mono text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => setShowStripeKey(!showStripeKey)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                        >
                          {showStripeKey ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        Get your secret key from{" "}
                        <span className="font-mono text-primary">
                          dashboard.stripe.com/apikeys
                        </span>
                      </p>
                    </div>

                    <Button
                      className="w-full h-11 medical-gradient text-white font-semibold"
                      onClick={handleSaveStripe}
                      disabled={savingStripe || !stripeKey.trim()}
                    >
                      {savingStripe ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save Stripe Configuration
                        </>
                      )}
                    </Button>

                    <div className="p-3 bg-secondary/50 rounded-xl">
                      <p className="text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Note:</strong>{" "}
                        Patients can always choose "Pay at Clinic" as an
                        alternative. Online payments require Stripe to be
                        configured. Allowed countries: India, US, UK.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t border-border mt-8">
        <div className="flex items-center justify-center gap-1.5">
          <Activity className="w-3 h-3" />
          <span>Kisturi Healthcare Admin Panel</span>
          <span className="opacity-50">·</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </div>
  );
}
