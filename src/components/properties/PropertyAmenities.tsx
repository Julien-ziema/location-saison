import {
  Wifi,
  Waves,
  Car,
  TreePine,
  Sun,
  Flame,
  Snowflake,
  Thermometer,
  Shirt,
  Wind,
  UtensilsCrossed,
  Tv,
  PawPrint,
  Mountain,
  Building2,
  ArrowUpDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { AMENITIES_OPTIONS } from "@/lib/types/property";

const AMENITY_ICONS: Record<string, LucideIcon> = {
  wifi: Wifi,
  pool: Waves,
  parking: Car,
  garden: TreePine,
  terrace: Sun,
  bbq: Flame,
  ac: Snowflake,
  heating: Thermometer,
  washer: Shirt,
  dryer: Wind,
  dishwasher: UtensilsCrossed,
  tv: Tv,
  pet_friendly: PawPrint,
  sea_view: Waves,
  mountain_view: Mountain,
  balcony: Building2,
  elevator: ArrowUpDown,
  fireplace: Flame,
};

function getAmenityLabel(value: string): string {
  const found = AMENITIES_OPTIONS.find((a) => a.value === value);
  return found ? found.label : value;
}

export function PropertyAmenities({ amenities }: { amenities: string[] }) {
  return (
    <section>
      <h2 className="font-heading mb-4 text-2xl text-slate-800">
        Equipements
      </h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {amenities.map((amenity) => {
          const Icon = AMENITY_ICONS[amenity];
          return (
            <div
              key={amenity}
              className="flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3"
            >
              {Icon && <Icon className="h-5 w-5 shrink-0 text-blue-600" />}
              <span className="text-sm font-medium text-slate-700">
                {getAmenityLabel(amenity)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
