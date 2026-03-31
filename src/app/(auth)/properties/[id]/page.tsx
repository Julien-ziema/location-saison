"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  BedDouble,
  Bath,
  Maximize,
  Euro,
  Percent,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/shared/PageHeader";
import { useProperty } from "@/lib/hooks/use-properties";
import { AMENITIES_OPTIONS } from "@/lib/types/property";
import {
  PhotoGallery,
  StatCard,
  PricingItem,
  PropertyDetailSkeleton,
} from "@/components/properties/PropertyDetailWidgets";

function formatEuros(centimes: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(centimes / 100);
}

function getAmenityLabel(value: string): string {
  return AMENITIES_OPTIONS.find((o) => o.value === value)?.label ?? value;
}

export default function PropertyDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { data: property, isLoading, isError } = useProperty(params.id);

  if (isLoading) {
    return <PropertyDetailSkeleton />;
  }

  if (isError || !property) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/properties")}>
          <ArrowLeft className="mr-1 h-4 w-4" /> Retour
        </Button>
        <p className="text-sm text-slate-500">Bien introuvable.</p>
      </div>
    );
  }

  const photos = property.photos ?? [];
  const amenities = property.amenities ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title={property.name}
        description={property.address}
        action={
          <Button variant="outline" size="sm" onClick={() => router.push("/properties")}>
            <ArrowLeft className="mr-1 h-4 w-4" /> Retour
          </Button>
        }
      />

      <PhotoGallery photos={photos} name={property.name} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Capacité" value={property.capacity ? `${property.capacity} pers.` : "-"} />
        <StatCard icon={BedDouble} label="Chambres" value={property.bedrooms != null ? String(property.bedrooms) : "-"} />
        <StatCard icon={Bath} label="Salles de bain" value={property.bathrooms != null ? String(property.bathrooms) : "-"} />
        <StatCard icon={Maximize} label="Surface" value={property.surface ? `${property.surface} m²` : "-"} />
      </div>

      {property.description && (
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-2 text-sm font-semibold text-slate-700">Description</h2>
            <p className="text-sm text-slate-600 whitespace-pre-line">{property.description}</p>
          </CardContent>
        </Card>
      )}

      {amenities.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">Equipements</h2>
            <div className="flex flex-wrap gap-2">
              {amenities.map((a) => (
                <Badge key={a} variant="secondary">{getAmenityLabel(a)}</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-5">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">Tarification</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <PricingItem
              icon={Euro}
              label="Prix / nuit"
              value={property.pricePerNight ? formatEuros(property.pricePerNight) : "-"}
            />
            <PricingItem
              icon={Percent}
              label="Acompte par défaut"
              value={property.defaultDepositPercent != null ? `${property.defaultDepositPercent} %` : "-"}
            />
            <PricingItem
              icon={Shield}
              label="Caution par défaut"
              value={property.defaultCautionAmount ? formatEuros(property.defaultCautionAmount) : "-"}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
