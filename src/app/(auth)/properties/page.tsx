'use client'

import React from "react";
import Link from "next/link";
import { Plus, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { PropertyCard } from "@/components/properties/PropertyCard";
import { useProperties } from "@/lib/hooks/use-properties";

export default function PropertiesPage() {
  const { data: properties = [], isLoading } = useProperties();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mes biens"
        action={
          <Button asChild className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150">
            <Link href="/properties/new">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un bien
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white shadow-sm"
            />
          ))}
        </div>
      ) : properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-slate-200 bg-white py-16 shadow-sm">
          <Home className="h-12 w-12 text-slate-300" />
          <div className="text-center">
            <p className="text-base font-medium text-slate-700">Aucun bien ajouté</p>
            <p className="mt-1 text-sm text-slate-400">
              Commencez par ajouter votre premier bien immobilier.
            </p>
          </div>
          <Button asChild className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150">
            <Link href="/properties/new">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter votre premier bien
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}
    </div>
  );
}
