import { Input } from "@/components/ui/input";
import { Loader2, Search, SlidersHorizontal, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Doctor, Hospital } from "../../backend.d";
import { DoctorCard } from "../../components/DoctorCard";
import { Layout } from "../../components/Layout";
import { useNavigate } from "../../components/RouterUtils";
import { useActor } from "../../hooks/useActor";
import { haversineDistance } from "../../utils/haversine";

type SortOption = "none" | "price-asc" | "price-desc" | "distance";

const DEFAULT_LAT = 19.076;
const DEFAULT_LON = 72.8777;

interface DoctorWithMeta extends Doctor {
  hospitalName: string;
  distance: number;
}

export function SearchDoctors() {
  const navigate = useNavigate();
  const { actor, isFetching } = useActor();

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DoctorWithMeta[]>([]);
  const [allDoctors, setAllDoctors] = useState<DoctorWithMeta[]>([]);
  const [hospitals, setHospitals] = useState<Map<string, Hospital>>(new Map());
  const [sort, setSort] = useState<SortOption>("none");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [userLat, setUserLat] = useState(DEFAULT_LAT);
  const [userLon, setUserLon] = useState(DEFAULT_LON);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setUserLat(pos.coords.latitude);
        setUserLon(pos.coords.longitude);
      },
      () => {},
      { timeout: 5000 },
    );
  }, []);

  const loadInitialData = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const [allDocs, allHospitals] = await Promise.all([
        actor.getAllDoctors(),
        actor.getAllHospitals(),
      ]);

      const hospMap = new Map<string, Hospital>();
      for (const h of allHospitals) {
        hospMap.set(h.id.toString(), h);
      }
      setHospitals(hospMap);

      const withMeta: DoctorWithMeta[] = allDocs.map((d) => {
        const hosp = hospMap.get(d.hospitalId.toString());
        const distance = hosp
          ? haversineDistance(userLat, userLon, hosp.latitude, hosp.longitude)
          : 0;
        return {
          ...d,
          hospitalName: hosp?.name ?? "Unknown Hospital",
          distance,
        };
      });

      setAllDoctors(withMeta);
      setResults(withMeta);
      setInitialized(true);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [actor, userLat, userLon]);

  useEffect(() => {
    if (!actor || isFetching) return;
    loadInitialData();
  }, [actor, isFetching, loadInitialData]);

  const performSearch = useCallback(
    async (searchTerm: string) => {
      if (!actor) return;

      if (!searchTerm.trim()) {
        setResults(allDoctors);
        return;
      }

      setLoading(true);
      try {
        const found = await actor.searchDoctorsByNameOrSpecialty(searchTerm);
        const withMeta: DoctorWithMeta[] = found.map((d) => {
          const hosp = hospitals.get(d.hospitalId.toString());
          const distance = hosp
            ? haversineDistance(userLat, userLon, hosp.latitude, hosp.longitude)
            : 0;
          return {
            ...d,
            hospitalName: hosp?.name ?? "Unknown Hospital",
            distance,
          };
        });
        setResults(withMeta);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [actor, allDoctors, hospitals, userLat, userLon],
  );

  useEffect(() => {
    if (!initialized) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      performSearch(query);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query, initialized, performSearch]);

  const sortedResults = [...results].sort((a, b) => {
    if (sort === "price-asc") return Number(a.charge) - Number(b.charge);
    if (sort === "price-desc") return Number(b.charge) - Number(a.charge);
    if (sort === "distance") return a.distance - b.distance;
    return 0;
  });

  const sortLabels: Record<SortOption, string> = {
    none: "Default",
    "price-asc": "Price ↑",
    "price-desc": "Price ↓",
    distance: "Nearest",
  };

  return (
    <Layout title="Search" showBack showNav userRole="patient">
      {/* Search input */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search doctor or disease (e.g. Cardiology)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-9 h-12 rounded-xl"
          autoFocus
        />
        {query && (
          <button
            type="button"
            onClick={() => setQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Sort options */}
      <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
        <SlidersHorizontal className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        {(["none", "price-asc", "price-desc", "distance"] as SortOption[]).map(
          (option) => (
            <button
              key={option}
              type="button"
              onClick={() => setSort(option)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                sort === option
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {sortLabels[option]}
            </button>
          ),
        )}
      </div>

      {initialized && (
        <p className="text-xs text-muted-foreground mb-3">
          {loading
            ? "Searching..."
            : `${sortedResults.length} doctor${sortedResults.length !== 1 ? "s" : ""} found`}
        </p>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {!loading && (
        <AnimatePresence mode="popLayout">
          {sortedResults.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="w-14 h-14 bg-secondary rounded-full flex items-center justify-center mx-auto mb-3">
                <Search className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">No results found</p>
              <p className="text-sm text-muted-foreground mt-1">
                Try searching by doctor name or specialty
              </p>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {sortedResults.map((doctor, idx) => (
                <motion.div
                  key={doctor.id.toString()}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <DoctorCard
                    doctor={doctor}
                    hospitalName={doctor.hospitalName}
                    distance={doctor.distance}
                    onClick={() =>
                      navigate(`/patient/doctor/${doctor.id.toString()}`)
                    }
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      )}
    </Layout>
  );
}
