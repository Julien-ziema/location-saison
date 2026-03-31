'use client'

import React from "react";
import { Loader2, Ban } from "lucide-react";
import { KanbanColumn } from "@/components/planning/KanbanColumn";
import type { BookingStatus, BookingWithPayments } from "@/lib/types/booking";

interface KanbanBoardProps {
  bookings: BookingWithPayments[];
  isLoading: boolean;
}

const KANBAN_STATUSES: BookingStatus[] = [
  "draft",
  "deposit_pending",
  "deposit_paid",
  "caution_pending",
  "caution_held",
  "balance_pending",
  "balance_paid",
  "completed",
];

function groupByStatus(
  bookings: BookingWithPayments[]
): Record<BookingStatus, BookingWithPayments[]> {
  const groups = {} as Record<BookingStatus, BookingWithPayments[]>;

  for (const status of KANBAN_STATUSES) {
    groups[status] = [];
  }
  groups.cancelled = [];

  for (const booking of bookings) {
    if (groups[booking.status]) {
      groups[booking.status].push(booking);
    }
  }

  return groups;
}

export function KanbanBoard({ bookings, isLoading }: KanbanBoardProps) {
  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const grouped = groupByStatus(bookings);
  const cancelledCount = grouped.cancelled.length;

  return (
    <div className="space-y-3">
      {cancelledCount > 0 && (
        <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">
          <Ban className="h-4 w-4" />
          <span>
            {cancelledCount} reservation{cancelledCount > 1 ? "s" : ""} annulee
            {cancelledCount > 1 ? "s" : ""} (non affichee{cancelledCount > 1 ? "s" : ""})
          </span>
        </div>
      )}

      <div className="flex gap-4 overflow-x-auto pb-4">
        {KANBAN_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            bookings={grouped[status]}
          />
        ))}
      </div>
    </div>
  );
}
