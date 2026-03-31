import { notFound } from "next/navigation";
import Link from "next/link";
import { eq, and, isNull } from "drizzle-orm";
import {
  MapPin,
  Users,
  BedDouble,
  Bath,
  Ruler,
  Euro,
} from "lucide-react";
import { db } from "@/lib/db";
import { properties } from "@/lib/db/schema";
import { PropertyAmenities } from "@/components/properties/PropertyAmenities";
import type { Metadata } from "next";

type PageProps = { params: Promise<{ id: string }> };

async function getProperty(id: string) {
  const result = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), isNull(properties.deletedAt)))
    .limit(1);
  return result[0] ?? null;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) return { title: "Bien introuvable" };
  return {
    title: `${property.name} - LocaFlow`,
    description: property.description ?? `Decouvrez ${property.name} a ${property.address}`,
  };
}

const stats = [
  { key: "capacity", label: "Personnes", icon: Users, suffix: "" },
  { key: "bedrooms", label: "Chambres", icon: BedDouble, suffix: "" },
  { key: "bathrooms", label: "SdB", icon: Bath, suffix: "" },
  { key: "surface", label: "Surface", icon: Ruler, suffix: " m\u00B2" },
] as const;

export default async function PublicPropertyPage({ params }: PageProps) {
  const { id } = await params;
  const property = await getProperty(id);
  if (!property) notFound();

  const photos = property.photos ?? [];
  const amenities = property.amenities ?? [];
  const price = property.pricePerNight;

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-slate-200 px-6 py-4 md:px-12">
        <Link href="/" className="font-heading text-2xl text-blue-600">
          LocaFlow
        </Link>
        <Link
          href="/auth/signin"
          className="rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
        >
          Espace proprietaire
        </Link>
      </header>

      {/* Hero photo */}
      <section className="relative w-full overflow-hidden bg-gradient-to-br from-blue-600 to-blue-800">
        {photos.length > 0 ? (
          <div className="mx-auto grid max-w-7xl gap-2 p-2 md:grid-cols-4 md:grid-rows-2 md:p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[0]}
              alt={property.name}
              className="h-64 w-full rounded-xl object-cover md:col-span-2 md:row-span-2 md:h-96"
            />
            {photos.slice(1, 4).map((photo, i) => (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                key={i}
                src={photo}
                alt={`${property.name} - photo ${i + 2}`}
                className="hidden h-[11.5rem] w-full rounded-xl object-cover md:block"
              />
            ))}
          </div>
        ) : (
          <div className="flex h-64 items-center justify-center md:h-80">
            <h2 className="font-heading text-4xl text-white/90 md:text-5xl">
              {property.name}
            </h2>
          </div>
        )}
      </section>

      {/* Content */}
      <main className="mx-auto w-full max-w-5xl px-6 py-10 md:px-12 md:py-14">
        {/* Name + address */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl text-slate-800 md:text-4xl">
            {property.name}
          </h1>
          <p className="mt-2 flex items-center gap-1.5 text-slate-500">
            <MapPin className="h-4 w-4" />
            {property.address}
          </p>
        </div>

        {/* Key stats */}
        <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map(({ key, label, icon: Icon, suffix }) => {
            const value = property[key];
            if (value == null) return null;
            return (
              <div
                key={key}
                className="flex flex-col items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 p-5"
              >
                <Icon className="h-6 w-6 text-blue-600" />
                <span className="text-2xl font-bold text-slate-800">
                  {value}{suffix}
                </span>
                <span className="text-sm text-slate-500">{label}</span>
              </div>
            );
          })}
        </div>

        {/* Description */}
        {property.description && (
          <section className="mb-10">
            <h2 className="font-heading mb-4 text-2xl text-slate-800">
              Description
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-slate-600">
              {property.description}
            </p>
          </section>
        )}

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className="mb-10">
            <PropertyAmenities amenities={amenities} />
          </div>
        )}

        {/* Pricing */}
        {price != null && (
          <section className="mb-10 rounded-xl border border-blue-100 bg-blue-50 p-6 md:p-8">
            <h2 className="font-heading mb-4 text-2xl text-slate-800">
              Tarifs
            </h2>
            <div className="flex items-baseline gap-2">
              <Euro className="h-6 w-6 text-blue-600" />
              <span className="text-4xl font-bold text-blue-600">{(price / 100).toLocaleString("fr-FR")}</span>
              <span className="text-lg text-slate-500">/ nuit</span>
            </div>
            <div className="mt-4 flex flex-wrap gap-6 text-sm text-slate-600">
              {property.defaultDepositPercent != null && (
                <span>Acompte : {property.defaultDepositPercent} %</span>
              )}
              {property.defaultCautionAmount != null && (
                <span>Caution : {(property.defaultCautionAmount / 100).toLocaleString("fr-FR")} &euro;</span>
              )}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 py-6 text-center text-sm text-slate-400">
        <p>
          Propulse par{" "}
          <Link href="/" className="text-blue-600 hover:underline">
            LocaFlow
          </Link>
        </p>
      </footer>
    </div>
  );
}
