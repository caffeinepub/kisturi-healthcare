import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Banknote,
  Building2,
  Calendar,
  CheckCircle,
  CreditCard,
  Hash,
  IndianRupee,
  Loader2,
  MapPin,
  Phone,
  Save,
  Star,
  Stethoscope,
  User,
  Users,
  XCircle,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { Booking, Doctor, Hospital } from "../../backend.d";
import { Layout } from "../../components/Layout";
import { StarRating } from "../../components/StarRating";
import { useAuth } from "../../context/AuthContext";
import { useActor } from "../../hooks/useActor";

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

const SPECIALTY_COLORS: Record<string, string> = {
  Cardiology: "bg-red-50 text-red-700",
  Orthopedics: "bg-orange-50 text-orange-700",
  Pediatrics: "bg-pink-50 text-pink-700",
  Dermatology: "bg-purple-50 text-purple-700",
  "General Medicine": "bg-blue-50 text-blue-700",
  Neurology: "bg-indigo-50 text-indigo-700",
  Oncology: "bg-rose-50 text-rose-700",
  Gynecology: "bg-fuchsia-50 text-fuchsia-700",
  Ophthalmology: "bg-cyan-50 text-cyan-700",
  ENT: "bg-teal-50 text-teal-700",
  Psychiatry: "bg-violet-50 text-violet-700",
  Urology: "bg-emerald-50 text-emerald-700",
};

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-medical-green-light text-medical-green border-transparent",
  pending: "bg-secondary text-secondary-foreground border-transparent",
  cancelled: "bg-destructive/10 text-destructive border-transparent",
};

export function HospitalDashboard() {
  const { actor, isFetching } = useActor();
  const { hospitalId, patientName } = useAuth();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Profile form
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileFacilities, setProfileFacilities] = useState<string[]>([]);
  const [profileRating, setProfileRating] = useState("4.0");

  useEffect(() => {
    if (!actor || isFetching || !hospitalId) return;
    loadData();
  }, [actor, isFetching, hospitalId]);

  const loadData = async () => {
    if (!actor || !hospitalId) return;
    setLoading(true);
    try {
      const [hospitalData, doctorData, bookingData] = await Promise.all([
        actor.getHospitalById(hospitalId),
        actor.getDoctorsByHospital(hospitalId),
        actor.getBookingsByHospital(hospitalId),
      ]);

      if (hospitalData) {
        setHospital(hospitalData);
        setProfileName(hospitalData.name);
        setProfilePhone(hospitalData.phone);
        setProfileAddress(hospitalData.address);
        setProfileFacilities(hospitalData.facilities);
        setProfileRating(hospitalData.rating.toString());
      }

      setDoctors(doctorData);
      setBookings(
        [...bookingData].sort((a, b) => b.date.localeCompare(a.date)),
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const toggleFacility = (facility: string) => {
    setProfileFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility],
    );
  };

  const handleSaveProfile = async () => {
    if (!actor || !hospitalId || !hospital) return;
    setSaving(true);
    try {
      await actor.updateHospitalProfile(
        hospitalId,
        profileName,
        profilePhone,
        profileAddress,
        hospital.latitude,
        hospital.longitude,
        Number.parseFloat(profileRating) || 4.0,
        profileFacilities,
      );
      toast.success("Hospital profile updated!");
      await loadData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout showNav userRole="hospital">
      {/* Hospital greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="green-gradient rounded-2xl p-5 text-white shadow-medical mb-5"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/70 text-sm">Welcome,</p>
            <h2 className="font-display font-bold text-xl mt-0.5">
              {hospital?.name || patientName || "Hospital"}
            </h2>
            <div className="flex items-center gap-1 mt-1">
              <Star className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              <span className="text-white/80 text-sm">
                {hospital?.rating.toFixed(1)} rating
              </span>
            </div>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
        </div>

        {hospital && (
          <div className="flex items-center gap-1 mt-2 text-white/60 text-xs">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{hospital.address}</span>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <Tabs defaultValue="doctors">
        <TabsList className="w-full mb-4 h-10">
          <TabsTrigger value="doctors" className="flex-1 text-xs">
            <Users className="w-3.5 h-3.5 mr-1.5" />
            Doctors
            {doctors.length > 0 && (
              <span className="ml-1.5 bg-primary text-primary-foreground rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                {doctors.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="bookings" className="flex-1 text-xs">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            Bookings
            {bookings.length > 0 && (
              <span className="ml-1.5 bg-primary text-primary-foreground rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                {bookings.length > 9 ? "9+" : bookings.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex-1 text-xs">
            <Building2 className="w-3.5 h-3.5 mr-1.5" />
            Profile
          </TabsTrigger>
        </TabsList>

        {/* Doctors Tab */}
        <TabsContent value="doctors" className="mt-0">
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="bg-card rounded-xl border border-border p-4"
                >
                  <div className="flex gap-3">
                    <Skeleton className="w-10 h-10 rounded-xl" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-32 mb-1.5" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : doctors.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Users className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="font-semibold text-foreground">No doctors listed</p>
              <p className="text-sm text-muted-foreground mt-1">
                Doctors who join with your hospital ID will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {doctors.map((doctor, idx) => {
                const specialtyClass =
                  SPECIALTY_COLORS[doctor.specialty] ||
                  "bg-secondary text-secondary-foreground";
                return (
                  <motion.div
                    key={doctor.id.toString()}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className="bg-card rounded-xl border border-border p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl medical-gradient flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {getInitials(doctor.name)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-display font-semibold text-sm text-foreground truncate">
                              {doctor.name}
                            </p>
                            <span
                              className={`inline-block text-xs px-2 py-0.5 rounded-md mt-0.5 font-medium ${specialtyClass}`}
                            >
                              {doctor.specialty}
                            </span>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-sm text-medical-green flex items-center gap-0.5">
                              <IndianRupee className="w-3 h-3" />
                              {Number(doctor.charge)}
                            </p>
                            {doctor.available ? (
                              <div className="flex items-center gap-1 text-xs text-medical-green mt-0.5">
                                <CheckCircle className="w-3 h-3" />
                                <span>Available</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                                <XCircle className="w-3 h-3" />
                                <span>Unavailable</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Bookings Tab */}
        <TabsContent value="bookings" className="mt-0">
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
          ) : bookings.length === 0 ? (
            <div className="text-center py-12 bg-card rounded-xl border border-border">
              <Calendar className="w-10 h-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="font-semibold text-foreground">No bookings yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Appointment bookings will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.map((booking, idx) => (
                <motion.div
                  key={booking.id.toString()}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className="bg-card rounded-xl border border-border p-4"
                >
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
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>{booking.doctorName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>
                        {new Date(booking.date).toLocaleDateString("en-IN", {
                          dateStyle: "medium",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      {booking.paymentMethod === "card" ? (
                        <CreditCard className="w-3.5 h-3.5 text-primary" />
                      ) : (
                        <Banknote className="w-3.5 h-3.5 text-accent" />
                      )}
                      <span className="text-xs text-muted-foreground capitalize">
                        {booking.paymentMethod === "card"
                          ? "Card"
                          : "Cash at clinic"}
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
                </motion.div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Profile Tab */}
        <TabsContent value="profile" className="mt-0">
          <Card className="shadow-card border-border">
            <CardContent className="p-5 space-y-4">
              <div>
                <p className="text-sm font-medium block mb-1.5">
                  Hospital Name
                </p>
                <Input
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                  className="h-10"
                />
              </div>

              <div>
                <p className="text-sm font-medium block mb-1.5">
                  Contact Number
                </p>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    className="pl-9 h-10"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium block mb-1.5">Address</p>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Textarea
                    value={profileAddress}
                    onChange={(e) => setProfileAddress(e.target.value)}
                    className="pl-9 min-h-[70px] resize-none"
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium block mb-1.5">Rating (0-5)</p>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Star className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="number"
                      value={profileRating}
                      onChange={(e) => setProfileRating(e.target.value)}
                      className="pl-9 h-10"
                      min={0}
                      max={5}
                      step={0.1}
                    />
                  </div>
                  <StarRating
                    rating={Number.parseFloat(profileRating) || 0}
                    size={16}
                  />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium block mb-2">Facilities</p>
                <div className="flex flex-wrap gap-2">
                  {FACILITY_OPTIONS.map((facility) => (
                    <button
                      key={facility}
                      type="button"
                      onClick={() => toggleFacility(facility)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        profileFacilities.includes(facility)
                          ? "bg-medical-green text-white border-transparent"
                          : "bg-background border-border text-muted-foreground hover:border-medical-green hover:text-medical-green"
                      }`}
                    >
                      {facility}
                    </button>
                  ))}
                </div>
              </div>

              <Button
                className="w-full h-11 green-gradient text-white font-semibold"
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
                    Save Profile
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
