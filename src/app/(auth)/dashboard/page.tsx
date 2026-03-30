'use client'

import React from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/PageHeader";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { ViewToggle } from "@/components/dashboard/ViewToggle";
import { BookingTable } from "@/components/bookings/BookingTable";
import { useBookings } from "@/lib/hooks/use-bookings";
import { useBookingStore } from "@/lib/stores/booking-store";
import type { BookingWithPayments } from "@/lib/types/booking";

function formatEuros(centimes: number): string {
  return (centimes / 100).toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
}

function getCurrentMonthKey(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  return `${now.getFullYear()}-${mm}`;
}

function computeStats(bookings: BookingWithPayments[]) {
  const monthKey = getCurrentMonthKey();

  const thisMonthBookings = bookings.filter((b) => {
    const created = new Date(b.createdAt);
    const mm = String(created.getMonth() + 1).padStart(2, "0");
    return `${created.getFullYear()}-${mm}` === monthKey;
  });

  const revenueThisMonth = thisMonthBookings
    .filter((b) => b.status === "balance_paid" || b.status === "completed")
    .reduce((sum, b) => sum + b.totalAmount, 0);

  const depositPending = bookings.filter((b) => b.status === "deposit_pending").length;

  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
  const balancesDueSoon = bookings.filter((b) => {
    if (b.status !== "caution_held") return false;
    const dueDate = new Date(b.balanceDueDate);
    return dueDate <= thirtyDaysFromNow;
  }).length;

  return [
    {
      label: "Réservations ce mois",
      value: thisMonthBookings.length,
      description: monthKey,
    },
    {
      label: "CA encaissé ce mois",
      value: formatEuros(revenueThisMonth),
    },
    {
      label: "Acomptes en attente",
      value: depositPending,
    },
    {
      label: "Soldes à venir (≤ 30j)",
      value: balancesDueSoon,
    },
  ];
}

export default function DashboardPage() {
  const { viewMode, setViewMode } = useBookingStore();
  const { data: bookings = [], isLoading } = useBookings();

  const stats = computeStats(bookings);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        action={
          <Button asChild className="bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150">
            <Link href="/bookings/new">
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle réservation
            </Link>
          </Button>
        }
      />

      <DashboardStats stats={stats} />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-800">Réservations</h2>
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {viewMode === "table" && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <BookingTable bookings={bookings} isLoading={isLoading} />
        </div>
      )}

      {viewMode === "planning" && (
        <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm text-slate-400">
          [Planning — Wave 3]
        </div>
      )}

      {viewMode === "kanban" && (
        <div className="flex h-64 items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm text-slate-400">
          [Kanban — Wave 3]
        </div>
      )}
    </div>
  );
}
