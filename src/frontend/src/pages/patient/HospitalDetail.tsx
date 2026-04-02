import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertCircle,
  Building2,
  Loader2,
  MapPin,
  Phone,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import { useEffect, useState } from "react";
import type { Doctor, Hospital } from "../../backend.d";
import { DoctorCard } from "../../components/DoctorCard";
import { Layout } from "../../components/Layout";
import { useNavigate, useParams } from "../../components/RouterUtils";
import { StarRating } from "../../components/StarRating";
import { useActor } from "../../hooks/useActor";

export function HospitalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!actor || isFetching || !id) return;
    loadData();
  }, [actor, isFetching, id]);

  const loadData = async () => {
    if (!actor || !id) return;
    setLoading(true);
    setError("");
    try {
      const [hospitalData, doctorData] = await Promise.all([
        actor.getHospitalById(BigInt(id)),
        actor.getDoctorsByHospital(BigInt(id)),
      ]);

      if (!hospitalData) {
        setError("Hospital not found.");
        return;
      }
      setHospital(hospitalData);
      setDoctors(doctorData);
    } catch (err) {
      console.error(err);
      setError("Failed to load hospital details.");
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <Layout title="Hospital" showBack showNav userRole="patient">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Layout>
    );
  }

  if (loading || isFetching) {
    return (
      <Layout title="Hospital" showBack showNav userRole="patient">
        <div className="space-y-4">
          <div className="bg-card rounded-2xl p-5 shadow-card border border-border">
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-32 mb-3" />
            <Skeleton className="h-3 w-full" />
            <div className="flex gap-2 mt-3">
              <Skeleton className="h-7 w-20 rounded-full" />
              <Skeleton className="h-7 w-16 rounded-full" />
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-card rounded-2xl p-4 shadow-card border border-border"
            >
              <div className="flex gap-3">
                <Skeleton className="w-12 h-12 rounded-xl" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-36 mb-1.5" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  if (!hospital) return null;

  return (
    <Layout title={hospital.name} showBack showNav userRole="patient">
      {/* Hospital header card */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border shadow-card p-5 mb-4"
      >
        <div className="flex items-start gap-3 mb-3">
          <div className="w-12 h-12 rounded-xl medical-gradient flex items-center justify-center flex-shrink-0 shadow-medical">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h2 className="font-display font-bold text-xl text-foreground">
              {hospital.name}
            </h2>
            <StarRating rating={hospital.rating} showValue size={14} />
          </div>
        </div>

        <Separator className="my-3" />

        <div className="space-y-2">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
            <span>{hospital.address}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="w-4 h-4 text-primary flex-shrink-0" />
            <span>{hospital.phone}</span>
          </div>
        </div>

        {hospital.facilities.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
              Facilities
            </p>
            <div className="flex flex-wrap gap-1.5">
              {hospital.facilities.map((f) => (
                <Badge key={f} variant="secondary" className="text-xs">
                  {f}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {/* Doctors section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Users className="w-4 h-4 text-primary" />
          <h3 className="font-display font-semibold text-foreground">
            Doctors at this Hospital
          </h3>
          <Badge variant="outline" className="ml-auto text-xs">
            {doctors.length}
          </Badge>
        </div>

        {doctors.length === 0 ? (
          <div className="text-center py-10 bg-card rounded-2xl border border-border shadow-card">
            <p className="text-muted-foreground text-sm">
              No doctors listed yet
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {doctors.map((doctor, idx) => (
              <motion.div
                key={doctor.id.toString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <DoctorCard
                  doctor={doctor}
                  onClick={() =>
                    navigate(`/patient/doctor/${doctor.id.toString()}`)
                  }
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
