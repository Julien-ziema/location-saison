import React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import type { Booking } from "@/lib/types/booking";
import type { Property } from "@/lib/types/property";

interface BookingCardProps {
  booking: Booking & { property: Property };
}

function formatEuros(centimes: number): string {
  return (centimes / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function BookingCard({ booking }: BookingCardProps) {
  return (
    <Link href={`/bookings/${booking.id}`} className="block focus-visible:outline-none">
      <Card className="transition-shadow hover:shadow-md">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-900">{booking.guestName}</p>
              <p className="text-sm text-slate-500">{booking.property.name}</p>
            </div>
            <BookingStatusBadge status={booking.status} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-600">
              {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
            </p>
            <p className="font-semibold text-slate-900">{formatEuros(booking.totalAmount)}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
