'use client'

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { BookingForm } from "@/components/bookings/BookingForm";
import { useCreateBooking } from "@/lib/hooks/use-bookings";
import { useSendDeposit } from "@/lib/hooks/use-payments";
import { useProperties } from "@/lib/hooks/use-properties";
import type { CreateBookingInput } from "@/lib/types/booking";

export default function NewBookingPage() {
  const router = useRouter();
  const { data: properties = [], isLoading: propertiesLoading } = useProperties();
  const createBooking = useCreateBooking();
  const sendDeposit = useSendDeposit();
  const intentRef = useRef<"draft" | "send">("draft");

  function handleIntentCapture(e: React.MouseEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    const button = target.closest('button[type="submit"]');
    if (!button) return;
    // Detect intent from button position: second submit button = "send"
    const form = button.closest("form");
    if (!form) return;
    const submitButtons = form.querySelectorAll('button[type="submit"]');
    const buttons = Array.from(submitButtons);
    const clickedIndex = buttons.indexOf(button as HTMLButtonElement);
    intentRef.current = clickedIndex === 1 ? "send" : "draft";
  }

  async function handleSubmit(data: CreateBookingInput) {
    const booking = await createBooking.mutateAsync(data);
    if (intentRef.current === "send") {
      await sendDeposit.mutateAsync({ bookingId: booking.id });
    }
    router.push(`/bookings/${booking.id}`);
  }

  if (propertiesLoading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Nouvelle réservation" />
        <div className="text-sm text-slate-500">Chargement des biens...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouvelle réservation"
        description=""
        action={
          <nav className="flex items-center gap-1 text-sm text-slate-500">
            <Link href="/bookings" className="hover:text-slate-700 transition-colors duration-150 cursor-pointer">
              Réservations
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-700">Nouvelle</span>
          </nav>
        }
      />

      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div onClick={handleIntentCapture}>
          <BookingForm
            properties={properties}
            onSubmit={handleSubmit}
            isSubmitting={createBooking.isPending || sendDeposit.isPending}
          />
        </div>
      </div>
    </div>
  );
}
