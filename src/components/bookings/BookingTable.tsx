"use client";

import React from "react";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import type { Booking } from "@/lib/types/booking";
import type { Property } from "@/lib/types/property";

interface BookingTableProps {
  bookings: Array<Booking & { property: Property }>;
  isLoading?: boolean;
}

function formatEuros(centimes: number): string {
  return (centimes / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 5 }).map((_item, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-4 w-32" /></TableCell>
          <TableCell><Skeleton className="h-4 w-24" /></TableCell>
          <TableCell><Skeleton className="h-4 w-36" /></TableCell>
          <TableCell><Skeleton className="h-4 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24 rounded-full" /></TableCell>
          <TableCell><Skeleton className="h-8 w-16" /></TableCell>
        </TableRow>
      ))}
    </>
  );
}

export function BookingTable({ bookings, isLoading = false }: BookingTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Locataire</TableHead>
          <TableHead>Bien</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead>Montant</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <SkeletonRows />
        ) : bookings.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="py-8 text-center text-slate-500">
              Aucune réservation trouvée.
            </TableCell>
          </TableRow>
        ) : (
          bookings.map((booking) => (
            <TableRow key={booking.id}>
              <TableCell>
                <div>
                  <p className="font-medium text-slate-900">{booking.guestName}</p>
                  <p className="text-xs text-slate-500">{booking.guestEmail}</p>
                </div>
              </TableCell>
              <TableCell className="text-slate-700">{booking.property.name}</TableCell>
              <TableCell className="whitespace-nowrap text-slate-700">
                {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
              </TableCell>
              <TableCell className="font-medium text-slate-900">
                {formatEuros(booking.totalAmount)}
              </TableCell>
              <TableCell>
                <BookingStatusBadge status={booking.status} />
              </TableCell>
              <TableCell>
                <Button asChild size="sm" variant="outline">
                  <Link href={`/bookings/${booking.id}`}>Voir</Link>
                </Button>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
