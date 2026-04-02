import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";
import type { Hospital } from "../backend.d";
import { StarRating } from "./StarRating";

interface HospitalCardProps {
  hospital: Hospital;
  distance?: number;
  onClick?: () => void;
}

const FACILITY_ICONS: Record<string, string> = {
  ICU: "🏥",
  Emergency: "🚨",
  "X-Ray": "📷",
  Lab: "🔬",
  Pharmacy: "💊",
  Surgery: "🩺",
  MRI: "🧲",
  CT: "💻",
  Cardiology: "❤️",
  Pediatrics: "👶",
  Dialysis: "🩸",
};

export function HospitalCard({
  hospital,
  distance,
  onClick,
}: HospitalCardProps) {
  return (
    <Card
      className={`shadow-card border-border hover:shadow-medical transition-all duration-200 overflow-hidden ${
        onClick ? "cursor-pointer hover:-translate-y-0.5" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-display font-bold text-foreground text-base truncate">
              {hospital.name}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <StarRating rating={hospital.rating} size={13} showValue />
            </div>
            <div className="flex items-start gap-1 mt-1.5 text-xs text-muted-foreground">
              <MapPin className="w-3 h-3 mt-0.5 flex-shrink-0 text-medical-blue" />
              <span className="line-clamp-2">{hospital.address}</span>
            </div>
          </div>

          {distance !== undefined && (
            <div className="flex flex-col items-center flex-shrink-0 bg-secondary rounded-xl px-2.5 py-2 text-center">
              <Navigation className="w-3.5 h-3.5 text-primary mb-0.5" />
              <span className="font-bold text-sm text-primary leading-none">
                {distance.toFixed(1)}
              </span>
              <span className="text-[10px] text-muted-foreground">km</span>
            </div>
          )}
        </div>

        {hospital.facilities.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {hospital.facilities.slice(0, 6).map((facility) => (
              <Badge
                key={facility}
                variant="secondary"
                className="text-xs font-medium px-2 py-0.5"
              >
                {FACILITY_ICONS[facility] && (
                  <span className="mr-1">{FACILITY_ICONS[facility]}</span>
                )}
                {facility}
              </Badge>
            ))}
            {hospital.facilities.length > 6 && (
              <Badge variant="outline" className="text-xs">
                +{hospital.facilities.length - 6}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
