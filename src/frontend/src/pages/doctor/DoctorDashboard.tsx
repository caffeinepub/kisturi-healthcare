import { Badge } from "@/components/ui/badge";
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
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Calendar,
  CheckCircle,
  Hash,
  History,
  IndianRupee,
  Loader2,
  Save,
  Stethoscope,
  ToggleLeft,
  User,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Booking, Doctor, Hospital } from "../../backend.d";
import { Layout } from "../../components/Layout";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";

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

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-medical-green-light text-medical-green border-transparent",
  pending: "bg-secondary text-secondary-foreground border-transparent",
  cancelled: "bg-destructive/10 text-destructive border-transparent",
};

export function DoctorDashboard() {
  const { actor, isFetching } = useActor();
  const { doctorId, patientName } = useAuth();

  const [todayBookings, setTodayBookings] = useState<Booking[]>([]);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile form state
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileSpecialty, setProfileSpecialty] = useState("");
  const [profileHospitalId, setProfileHospitalId] = useState("");
  const [profileCharge, setProfileCharge] = useState("");
  const [profileAvailable, setProfileAvailable] = useState(true);

  useEffect(() => {
    if (!actor || isFetching || !doctorId) return;
    loadData();
  }, [actor, isFetching, doctorId]);

  const loadData = async () => {
    if (!actor || !doctorId) return;
    setLoading(true);
    try {
      const today = new Date().toISOString().split("T")[0];
      const [doctorData, todayData, allData, allHospitals] = await Promise.all([
        actor.getDoctorById(doctorId),
        actor.getBookingsByDoctorAndDate(doctorId, today),
        actor.getBookingsByDoctor(doctorId),
        actor.getAllHospitals(),
      ]);

      if (doctorData) {
        setDoctor(doctorData);
        setProfileName(doctorData.name);
        setProfilePhone(doctorData.phone);
        setProfileSpecialty(doctorData.specialty);
        setProfileHospitalId(doctorData.hospitalId.toString());
        setProfileCharge(doctorData.charge.toString());
        setProfileAvailable(doctorData.available);
      }

      setTodayBookings(todayData);
      setAllBookings([...allData].sort((a, b) => b.date.localeCompare(a.date)));
      setHospitals(allHospitals);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!actor || !doctorId) return;
    if (
      !profileName ||
      !profilePhone ||
      !profileSpecialty ||
      !profileHospitalId ||
      !profileCharge
    ) {
      toast.error("Please fill in all fields");
      return;
    }

    setSaving(true);
    try {
      await actor.updateDoctorProfile(
        doctorId,
        profileName,
        profilePhone,
        profileSpecialty,
        BigInt(profileHospitalId),
        BigInt(profileCharge),
        profileAvailable,
      );
      toast.success("Profile updated successfully!");
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const BookingCard = ({ booking }: { booking: Booking }) => (
    <div className="bg-card rounded-xl border border-border p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Hash className="w-4 h-4 text-primary" />
          <span className="font-display font-bold text-primary">
            {booking.slotNumber}
          </span>
        </div>
        <Badge
          className={`text-xs capitalize ${STATUS_STYLES[booking.status] || STATUS_STYLES.pending}`}
        >
          {booking.status}
        </Badge>
      </div>
      <Separator className="my-2" />
      <div className="space-y-1.5 text-sm">
        <div className="flex items-center gap-2">
          <User className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-medium">{booking.patientName}</span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {new Date(booking.date).toLocaleDateString("en-IN", {
              dateStyle: "medium",
            })}
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Layout showNav userRole="doctor">
      {/* Doctor greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="medical-gradient rounded-2xl p-5 text-white shadow-medical mb-5"
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm">Welcome back,</p>
            <h2 className="font-display font-bold text-xl mt-0.5">
              {doctor?.name || patientName || "Doctor"}
            </h2>
            <p className="text-white/70 text-sm mt-0.5">{doctor?.specialty}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            {doctor?.available ? (
              <Badge className="bg-white/20 text-white border-white/30 text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Available
              </Badge>
            ) : (
              <Badge className="bg-black/20 text-white/70 border-white/20 text-xs">
                <XCircle className="w-3 h-3 mr-1" />
                Unavailable
              </Badge>
            )}
            <span className="text-white/60 text-xs">
              {todayBookings.length} today
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="today">
        <TabsList className="w-full mb-4 h-10">
          <TabsTrigger value="today" className="flex-1 text-xs">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Today
            {todayBookings.length > 0 && (
              <span className="ml-1.5 bg-primary text-primary-foreground rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                {todayBookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex-1 text-xs">
            <History className="w-3.5 h-3.5 mr-1.5" />
            History
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex-1 text-xs">
            <User className="w-3.5 h-3.5 mr-1.5" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* Today */}
        <TabsContent value="today" className="mt-0">
          {loading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </div>
              ))}
            </div>
          ) : todayBookings.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="font-semibold text-foreground">
                No appointments today
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Enjoy your free day!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayBookings.map((b) => (
                <motion.div
                  key={b.id.toString()}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <BookingCard booking={b} />
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* History */}
        <TabsContent value="history" className="mt-0">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-3 w-40" />
                </div>
              ))}
            </div>
          ) : allBookings.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <History className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="font-semibold text-foreground">
                No booking history
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {allBookings.map((b) => (
                <BookingCard key={b.id.toString()} booking={b} />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Profile */}
        <TabsContent value="profile" className="mt-0">
          <Card className="shadow-card border-border">
            <CardContent className="p-5 space-y-4">
              <div>
                <label
                  htmlFor="field-doctordashboard-0"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Full Name
                </label>
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  placeholder="Full name"
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="field-doctordashboard-1"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Phone
                </label>
                <Input
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                  placeholder="Mobile number"
                  className="h-10"
                />
              </div>

              <div>
                <label
                  htmlFor="field-doctordashboard-2"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Specialty
                </label>
                <Select
                  value={profileSpecialty}
                  onValueChange={setProfileSpecialty}
                >
                  <SelectTrigger className="h-10">
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
                <label
                  htmlFor="field-doctordashboard-3"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Hospital
                </label>
                <Select
                  value={profileHospitalId}
                  onValueChange={setProfileHospitalId}
                >
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select hospital" />
                  </SelectTrigger>
                  <SelectContent>
                    {hospitals.map((h) => (
                      <SelectItem key={h.id.toString()} value={h.id.toString()}>
                        {h.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label
                  htmlFor="field-doctordashboard-4"
                  className="text-sm font-medium mb-1.5 block"
                >
                  Consultation Charge (₹)
                </label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="number"
                    value={profileCharge}
                    onChange={(e) => setProfileCharge(e.target.value)}
                    className="pl-9 h-10"
                    min={0}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-secondary rounded-xl">
                <div>
                  <p className="font-medium text-sm">
                    Available for appointments
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Toggle to accept or pause bookings
                  </p>
                </div>
                <Switch
                  checked={profileAvailable}
                  onCheckedChange={setProfileAvailable}
                />
              </div>

              <Button
                className="w-full h-11 medical-gradient text-white font-semibold"
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
