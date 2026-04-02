import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, MapPin, Navigation } from "lucide-react";
import { motion } from "motion/react";
import { useCallback, useEffect, useState } from "react";
import type { Hospital } from "../../backend.d";
import { HospitalCard } from "../../components/HospitalCard";
import { Layout } from "../../components/Layout";
import { useNavigate } from "../../components/RouterUtils";
import { useActor } from "../../hooks/useActor";
import { haversineDistance } from "../../utils/haversine";

const DEFAULT_LAT = 19.076;
const DEFAULT_LON = 72.8777;

interface HospitalWithDistance extends Hospital {
  distance: number;
}

export function NearbyHospitals() {
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();

  const [hospitals, setHospitals] = useState<HospitalWithDistance[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationError, setLocationError] = useState(false);
  const [userLat, setUserLat] = useState(DEFAULT_LAT);
  const [userLon, setUserLon] = useState(DEFAULT_LON);
  const [error, setError] = useState("");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLat(pos.coords.latitude);
          setUserLon(pos.coords.longitude);
        },
        () => {
          setLocationError(true);
        },
        { timeout: 5000 },
      );
    } else {
      setLocationError(true);
    }
  }, []);

  const loadHospitals = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    setError("");
    try {
      const all = await actor.getAllHospitals();
      const withDistance: HospitalWithDistance[] = all.map((h) => ({
        ...h,
        distance: haversineDistance(userLat, userLon, h.latitude, h.longitude),
      }));
      withDistance.sort((a, b) => a.distance - b.distance);
      setHospitals(withDistance);
    } catch (err) {
      console.error(err);
      setError("Failed to load hospitals. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [actor, userLat, userLon]);

  useEffect(() => {
    if (!actor || isFetching) return;
    loadHospitals();
  }, [actor, isFetching, loadHospitals]);

  return (
    <Layout title="Nearby Hospitals" showBack showNav userRole="patient">
      {/* Location status */}
      {locationError && (
        <Alert className="mb-4 border-warning bg-warning/10">
          <AlertCircle
            className="h-4 w-4 text-warning"
            style={{ color: "oklch(0.72 0.18 65)" }}
          />
          <AlertDescription className="text-sm">
            Location access denied. Showing hospitals near Mumbai.
          </AlertDescription>
        </Alert>
      )}

      {!locationError && (
        <div className="flex items-center gap-2 text-sm text-primary mb-4 bg-secondary rounded-xl px-3 py-2">
          <Navigation className="w-4 h-4 animate-pulse" />
          <span>Using your current location</span>
        </div>
      )}

      {/* Error */}
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading skeletons */}
      {(loading || isFetching) && (
        <div className="space-y-3">
          {["sk-1", "sk-2", "sk-3"].map((key) => (
            <div
              key={key}
              className="bg-card rounded-2xl p-4 shadow-card border border-border"
            >
              <div className="flex justify-between">
                <div className="flex-1">
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-3 w-24 mb-3" />
                  <Skeleton className="h-3 w-64" />
                </div>
                <Skeleton className="h-16 w-14 rounded-xl ml-3" />
              </div>
              <div className="flex gap-2 mt-3">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20 rounded-full" />
                <Skeleton className="h-6 w-14 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hospital list */}
      {!loading && !isFetching && hospitals.length === 0 && !error && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-display font-semibold text-foreground">
            No hospitals found
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Try expanding your search area
          </p>
        </div>
      )}

      {!loading && !isFetching && hospitals.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-1">
            {hospitals.length} hospital{hospitals.length !== 1 ? "s" : ""} found
            nearby
          </p>
          {hospitals.map((hospital, idx) => (
            <motion.div
              key={hospital.id.toString()}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <HospitalCard
                hospital={hospital}
                distance={hospital.distance}
                onClick={() =>
                  navigate(`/patient/hospital/${hospital.id.toString()}`)
                }
              />
            </motion.div>
          ))}
        </div>
      )}
    </Layout>
  );
}
