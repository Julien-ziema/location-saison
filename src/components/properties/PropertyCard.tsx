import React from "react";
import Link from "next/link";
import { MapPin, BookOpen } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Property } from "@/lib/types/property";

interface PropertyCardProps {
  property: Property;
  bookingCount?: number;
}

export function PropertyCard({ property, bookingCount }: PropertyCardProps) {
  return (
    <Link href={`/properties/${property.id}`} className="block focus-visible:outline-none">
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-slate-900">
            {property.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{property.address}</span>
          </div>
          {bookingCount !== undefined && (
            <div className="flex items-center gap-1.5 text-sm text-slate-500">
              <BookOpen className="h-3.5 w-3.5 shrink-0" />
              <span>
                {bookingCount} réservation{bookingCount !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
