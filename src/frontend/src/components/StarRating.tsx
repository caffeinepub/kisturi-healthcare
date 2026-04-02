import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  max?: number;
  size?: number;
  showValue?: boolean;
}

const STAR_KEYS = ["star-1", "star-2", "star-3", "star-4", "star-5"];

export function StarRating({
  rating,
  max = 5,
  size = 14,
  showValue = false,
}: StarRatingProps) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {STAR_KEYS.slice(0, max).map((key, i) => {
          const filled = i < Math.floor(rating);
          const partial = !filled && i < rating;
          return (
            <span key={key} className="relative inline-block">
              <Star
                size={size}
                className="text-muted-foreground/30"
                fill="currentColor"
              />
              {(filled || partial) && (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: partial ? `${(rating % 1) * 100}%` : "100%" }}
                >
                  <Star
                    size={size}
                    fill="currentColor"
                    style={{ color: "oklch(0.72 0.18 65)" }}
                  />
                </span>
              )}
            </span>
          );
        })}
      </div>
      {showValue && (
        <span className="text-sm font-semibold text-foreground ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
