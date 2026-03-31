'use client'

import React from "react";
import Link from "next/link";
import { CalendarDays, Euro } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUS_COLORS,
  type BookingStatus,
  type BookingWithPayments,
} from "@/lib/types/booking";
import { cn } from "@/lib/utils";

interface KanbanColumnProps {
  status: BookingStatus;
  bookings: BookingWithPayments[];
}

function formatEuros(centimes: number): string {
  return (centimes / 100).toLocaleString("fr-FR", {
    style: "currency",
    currency: "EUR",
  });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
  });
}

export function KanbanColumn({ status, bookings }: KanbanColumnProps) {
  return (
    <div className="flex w-72 flex-shrink-0 flex-col rounded-xl border border-slate-200 bg-slate-50">
      <div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3">
        <span
          className={cn(
            "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
            BOOKING_STATUS_COLORS[status]
          )}
        >
          {bookings.length}
        </span>
        <h3 className="text-sm font-semibold text-slate-700">
          {BOOKING_STATUS_LABELS[status]}
        </h3>
      </div>

      <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-3">
        {bookings.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-400">
            Aucune reservation
          </p>
        )}

        {bookings.map((booking) => (
          <Link
            key={booking.id}
            href={`/bookings/${booking.id}`}
            className="block focus-visible:outline-none"
          >
            <Card className="transition-shadow hover:shadow-md">
              <CardContent className="p-3">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold text-slate-900">
                    {booking.guestName}
                  </p>
                  <BookingStatusBadge status={booking.status} />
                </div>

                {booking.property && (
                  <p className="mb-2 text-xs text-slate-500">
                    {booking.property.name}
                  </p>
                )}

                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                  </span>
                </div>

                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                  <Euro className="h-3.5 w-3.5 text-slate-400" />
                  <span>{formatEuros(booking.totalAmount)}</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
