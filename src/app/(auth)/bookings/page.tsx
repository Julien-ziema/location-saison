'use client'

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/shared/PageHeader";
import { BookingTable } from "@/components/bookings/BookingTable";
import { useBookings } from "@/lib/hooks/use-bookings";
import { useProperties } from "@/lib/hooks/use-properties";
import { useBookingStore } from "@/lib/stores/booking-store";
import type { BookingStatus } from "@/lib/types/booking";
import { BOOKING_STATUS_LABELS } from "@/lib/types/booking";

const ALL_STATUSES: BookingStatus[] = [
  "draft",
  "deposit_pending",
  "deposit_paid",
  "caution_pending",
  "caution_held",
  "balance_pending",
  "balance_paid",
  "cancelled",
  "completed",
];

export default function BookingsPage() {
  const { filters, setFilters } = useBookingStore();
  const { data: bookings = [], isLoading } = useBookings({
    propertyId: filters.propertyId ?? undefined,
    status: filters.status ?? undefined,
  });
  const { data: properties = [] } = useProperties();

  function handleStatusChange(value: string) {
    setFilters({ status: value === "all" ? null : (value as BookingStatus) });
  }

  function handlePropertyChange(value: string) {
    setFilters({ propertyId: value === "all" ? null : value });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Réservations"
        action={
          <Button asChild className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150">
            <Link href="/bookings/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle réservation
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap gap-3">
        <Select
          value={filters.status ?? "all"}
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les statuts" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            {ALL_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>
                {BOOKING_STATUS_LABELS[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={filters.propertyId ?? "all"}
          onValueChange={handlePropertyChange}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Tous les biens" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les biens</SelectItem>
            {properties.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <BookingTable bookings={bookings} isLoading={isLoading} />
      </div>
    </div>
  );
}
