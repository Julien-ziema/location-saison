import type { Payment } from "@/lib/types/payment";
import type { Property } from "@/lib/types/property";

export type BookingStatus =
  | "draft"
  | "deposit_pending"
  | "deposit_paid"
  | "caution_pending"
  | "caution_held"
  | "balance_pending"
  | "balance_paid"
  | "cancelled"
  | "completed";

export interface Booking {
  id: string;
  propertyId: string;
  userId: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string | null;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  totalAmount: number; // centimes
  depositAmount: number; // centimes
  depositPercent: number; // ex: 30
  cautionAmount: number; // centimes
  balanceDueDate: string; // YYYY-MM-DD
  balanceLeadDays: number; // ex: 21
  status: BookingStatus;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface CreateBookingInput {
  propertyId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  checkIn: string;
  checkOut: string;
  totalAmount: number;
  depositPercent?: number;
  cautionAmount: number;
  balanceLeadDays?: number;
  notes?: string;
}

export interface BookingWithPayments extends Booking {
  payments: Payment[];
  property: Property;
}

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  draft: "Brouillon",
  deposit_pending: "Acompte envoyé",
  deposit_paid: "Acompte reçu",
  caution_pending: "Caution envoyée",
  caution_held: "Caution validée",
  balance_pending: "Solde envoyé",
  balance_paid: "Solde reçu",
  cancelled: "Annulé",
  completed: "Terminé",
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  draft: "bg-gray-100 text-gray-700",
  deposit_pending: "bg-yellow-100 text-yellow-700",
  deposit_paid: "bg-blue-100 text-blue-700",
  caution_pending: "bg-orange-100 text-orange-700",
  caution_held: "bg-purple-100 text-purple-700",
  balance_pending: "bg-indigo-100 text-indigo-700",
  balance_paid: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-emerald-100 text-emerald-700",
};
