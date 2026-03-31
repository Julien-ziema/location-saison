import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, BookOpen, Users, BedDouble, Maximize, Euro } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { Property } from "@/lib/types/property";

interface PropertyCardProps {
  property: Property;
  bookingCount?: number;
}

function formatPrice(centimes: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(centimes / 100);
}

export function PropertyCard({ property, bookingCount }: PropertyCardProps) {
  const hasPhoto = property.photos && property.photos.length > 0;

  return (
    <Link href={`/properties/${property.id}`} className="block focus-visible:outline-none">
      <Card className="overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative h-40 w-full bg-slate-100">
          {hasPhoto ? (
            <Image
              src={property.photos![0]}
              alt={property.name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-slate-300">
              <Maximize className="h-10 w-10" />
            </div>
          )}
        </div>

        <CardContent className="space-y-2 p-4">
          <h3 className="text-base font-semibold text-slate-900 truncate">
            {property.name}
          </h3>

          <div className="flex items-center gap-1.5 text-sm text-slate-500">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">{property.address}</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
            {property.capacity && (
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {property.capacity}
              </span>
            )}
            {property.bedrooms != null && (
              <span className="flex items-center gap-1">
                <BedDouble className="h-3.5 w-3.5" />
                {property.bedrooms}
              </span>
            )}
            {property.surface && (
              <span className="flex items-center gap-1">
                <Maximize className="h-3.5 w-3.5" />
                {property.surface} m²
              </span>
            )}
            {bookingCount !== undefined && (
              <span className="flex items-center gap-1">
                <BookOpen className="h-3.5 w-3.5" />
                {bookingCount}
              </span>
            )}
          </div>

          {property.pricePerNight && (
            <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
              <Euro className="h-3.5 w-3.5" />
              {formatPrice(property.pricePerNight)} / nuit
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
