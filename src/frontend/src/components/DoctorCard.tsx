import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  CheckCircle,
  IndianRupee,
  Stethoscope,
  XCircle,
} from "lucide-react";
import type { Doctor } from "../backend.d";

interface DoctorCardProps {
  doctor: Doctor;
  hospitalName?: string;
  distance?: number;
  onClick?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const SPECIALTY_COLORS: Record<string, string> = {
  Cardiology: "bg-red-50 text-red-700 border-red-200",
  Orthopedics: "bg-orange-50 text-orange-700 border-orange-200",
  Pediatrics: "bg-pink-50 text-pink-700 border-pink-200",
  Dermatology: "bg-purple-50 text-purple-700 border-purple-200",
  "General Medicine": "bg-blue-50 text-blue-700 border-blue-200",
  Neurology: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Oncology: "bg-rose-50 text-rose-700 border-rose-200",
  Gynecology: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200",
  Ophthalmology: "bg-cyan-50 text-cyan-700 border-cyan-200",
  ENT: "bg-teal-50 text-teal-700 border-teal-200",
  Psychiatry: "bg-violet-50 text-violet-700 border-violet-200",
  Urology: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function DoctorCard({
  doctor,
  hospitalName,
  distance,
  onClick,
}: DoctorCardProps) {
  const specialtyClass =
    SPECIALTY_COLORS[doctor.specialty] ||
    "bg-secondary text-secondary-foreground border-border";

  return (
    <Card
      className={`shadow-card border-border hover:shadow-medical transition-all duration-200 ${
        onClick ? "cursor-pointer hover:-translate-y-0.5" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <div className="w-12 h-12 rounded-xl medical-gradient flex items-center justify-center text-white font-display font-bold text-sm flex-shrink-0 shadow-medical">
            {getInitials(doctor.name)}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate font-display">
                  {doctor.name}
                </p>
                <Badge
                  variant="outline"
                  className={`text-xs mt-1 border ${specialtyClass}`}
                >
                  <Stethoscope className="w-3 h-3 mr-1" />
                  {doctor.specialty}
                </Badge>
              </div>
              <div className="flex flex-col items-end gap-1 flex-shrink-0">
                <div className="flex items-center gap-0.5 text-medical-green font-bold text-sm">
                  <IndianRupee className="w-3.5 h-3.5" />
                  {Number(doctor.charge)}
                </div>
                {doctor.available ? (
                  <div className="flex items-center gap-1 text-xs text-medical-green">
                    <CheckCircle className="w-3 h-3" />
                    Available
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <XCircle className="w-3 h-3" />
                    Unavailable
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {hospitalName && (
                <div className="flex items-center gap-1 truncate">
                  <Building2 className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{hospitalName}</span>
                </div>
              )}
              {distance !== undefined && (
                <div className="flex items-center gap-1 flex-shrink-0">
                  <span>{distance.toFixed(1)} km</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
