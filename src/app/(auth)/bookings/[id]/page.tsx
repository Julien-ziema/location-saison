'use client'

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ChevronLeft, User, Phone, Mail, MapPin, Calendar, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/bookings/BookingStatusBadge";
import { useBooking } from "@/lib/hooks/use-bookings";
import { usePayments, useSendDeposit, useSendCaution, useSendBalance } from "@/lib/hooks/use-payments";
import { useCancelBooking } from "@/lib/hooks/use-bookings";
import type { BookingStatus } from "@/lib/types/booking";
import type { Payment } from "@/lib/types/payment";

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

const PAYMENT_TYPE_LABELS: Record<Payment["type"], string> = {
  deposit: "Acompte",
  balance: "Solde",
  caution_hold: "Caution (empreinte)",
  caution_release: "Caution (libération)",
  refund: "Remboursement",
};

const PAYMENT_STATUS_LABELS: Record<Payment["status"], string> = {
  pending: "En attente",
  succeeded: "Réussi",
  failed: "Échoué",
  refunded: "Remboursé",
};

interface BookingActionsProps {
  bookingId: string;
  status: BookingStatus;
}

function BookingActions({ bookingId, status }: BookingActionsProps) {
  const router = useRouter();
  const sendDeposit = useSendDeposit();
  const sendCaution = useSendCaution();
  const sendBalance = useSendBalance();
  const cancelBooking = useCancelBooking();
  const [isCompleting, setIsCompleting] = useState(false);

  async function handleSendDeposit() {
    await sendDeposit.mutateAsync({ bookingId });
    router.refresh();
  }

  async function handleSendCaution() {
    await sendCaution.mutateAsync({ bookingId });
    router.refresh();
  }

  async function handleSendBalance() {
    await sendBalance.mutateAsync({ bookingId });
    router.refresh();
  }

  async function handleCancel() {
    if (!confirm("Confirmer l'annulation de cette réservation ?")) return;
    await cancelBooking.mutateAsync({ id: bookingId });
    router.refresh();
  }

  async function handleMarkCompleted() {
    setIsCompleting(true);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/complete`, { method: "POST" });
      if (!res.ok) throw new Error("Erreur");
      router.refresh();
    } finally {
      setIsCompleting(false);
    }
  }

  const isTerminated = status === "completed" || status === "cancelled";

  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-slate-800">Actions</h3>
      <div className="flex flex-col gap-2">
        {status === "draft" && (
          <Button
            onClick={handleSendDeposit}
            disabled={sendDeposit.isPending}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150"
          >
            Envoyer l&apos;acompte
          </Button>
        )}
        {status === "deposit_paid" && (
          <Button
            onClick={handleSendCaution}
            disabled={sendCaution.isPending}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150"
          >
            Envoyer la caution
          </Button>
        )}
        {status === "caution_held" && (
          <Button
            onClick={handleSendBalance}
            disabled={sendBalance.isPending}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-150"
          >
            Envoyer le solde maintenant
          </Button>
        )}
        {status === "balance_paid" && (
          <Button
            onClick={handleMarkCompleted}
            disabled={isCompleting}
            className="w-full bg-emerald-600 text-white hover:bg-emerald-700 transition-colors duration-150"
          >
            Marquer comme terminé
          </Button>
        )}
        {!isTerminated && (
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={cancelBooking.isPending}
            className="w-full transition-colors duration-150"
          >
            <AlertTriangle className="mr-2 h-4 w-4" />
            Annuler la réservation
          </Button>
        )}
      </div>
    </div>
  );
}

interface PaymentHistoryProps {
  payments: Payment[];
  isLoading: boolean;
}

function PaymentHistory({ payments, isLoading }: PaymentHistoryProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-base font-semibold text-slate-800">Historique des paiements</h3>
      {isLoading ? (
        <p className="text-sm text-slate-400">Chargement...</p>
      ) : payments.length === 0 ? (
        <p className="text-sm text-slate-400">Aucun paiement enregistré.</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {payments.map((p) => (
            <div key={p.id} className="flex items-center justify-between py-2.5">
              <div>
                <p className="text-sm font-medium text-slate-700">
                  {PAYMENT_TYPE_LABELS[p.type]}
                </p>
                <p className="text-xs text-slate-400">
                  {new Date(p.createdAt).toLocaleDateString("fr-FR")} · {PAYMENT_STATUS_LABELS[p.status]}
                </p>
              </div>
              <span className="font-mono text-sm font-medium text-slate-800">
                {formatEuros(p.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function BookingDetailPage() {
  const params = useParams();
  const bookingId = params.id as string;

  const { data: booking, isLoading, isError } = useBooking(bookingId);
  const { data: payments = [], isLoading: paymentsLoading } = usePayments(bookingId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-sm text-slate-400">
        Chargement...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-sm text-red-500">Erreur lors du chargement de la réservation.</p>
        <Button variant="outline" onClick={() => window.location.reload()}>Réessayer</Button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24">
        <p className="text-sm text-slate-500">Réservation introuvable.</p>
        <Button asChild variant="outline">
          <Link href="/bookings">Retour aux réservations</Link>
        </Button>
      </div>
    );
  }

  const balanceAmount = booking.totalAmount - booking.depositAmount;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="outline" size="sm" className="cursor-pointer transition-colors duration-150">
          <Link href="/bookings">
            <ChevronLeft className="h-4 w-4" />
            Réservations
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <h1 className="font-heading text-2xl text-slate-800">{booking.guestName}</h1>
          <BookingStatusBadge status={booking.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Détails</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Locataire</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    {booking.guestName}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-700">
                    <Mail className="h-3.5 w-3.5 text-slate-400" />
                    {booking.guestEmail}
                  </div>
                  {booking.guestPhone && (
                    <div className="flex items-center gap-2 text-sm text-slate-700">
                      <Phone className="h-3.5 w-3.5 text-slate-400" />
                      {booking.guestPhone}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Bien</p>
                <div className="space-y-1">
                  <p className="text-sm font-medium text-slate-700">{booking.property.name}</p>
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <MapPin className="h-3.5 w-3.5 text-slate-400" />
                    {booking.property.address}
                  </div>
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Dates</p>
                <div className="flex items-center gap-2 text-sm text-slate-700">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" />
                  {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                </div>
              </div>

              <div>
                <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-400">Envoi solde auto</p>
                <p className="text-sm text-slate-700">{formatDate(booking.balanceDueDate)}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Montants</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Total</p>
                <p className="font-mono text-lg font-semibold text-slate-800">
                  {formatEuros(booking.totalAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Acompte ({booking.depositPercent}%)
                </p>
                <p className="font-mono text-lg font-semibold text-slate-800">
                  {formatEuros(booking.depositAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Caution</p>
                <p className="font-mono text-lg font-semibold text-slate-800">
                  {formatEuros(booking.cautionAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Solde restant</p>
                <p className="font-mono text-lg font-semibold text-slate-800">
                  {formatEuros(balanceAmount)}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-slate-800">Historique</h2>
            <div className="flex h-32 items-center justify-center text-sm text-slate-400">
              [BookingTimeline — Wave 3]
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <BookingActions bookingId={bookingId} status={booking.status} />
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <PaymentHistory payments={payments} isLoading={paymentsLoading} />
          </div>
        </div>
      </div>
    </div>
  );
}
