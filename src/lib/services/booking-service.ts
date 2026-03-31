import { and, eq, isNull, lte } from "drizzle-orm";

import { db } from "@/lib/db";
import { bookings, payments, properties } from "@/lib/db/schema";
import type { Booking, BookingStatus } from "@/lib/types/booking";
import { stripeService } from "@/lib/services/stripe-service";

// ─── Machine à états ──────────────────────────────────────────────────────────

export const VALID_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  draft: ["deposit_pending", "cancelled"],
  deposit_pending: ["deposit_paid", "cancelled"],
  deposit_paid: ["caution_pending", "cancelled"],
  caution_pending: ["caution_held", "cancelled"],
  caution_held: ["balance_pending"],
  balance_pending: ["balance_paid", "cancelled"],
  balance_paid: ["completed"],
  cancelled: [],
  completed: [],
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function getBookingOrThrow(bookingId: string): Promise<Booking> {
  const rows = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, bookingId), isNull(bookings.deletedAt)))
    .limit(1);

  if (rows.length === 0) {
    throw new Error(`Booking introuvable : ${bookingId}`);
  }

  const row = rows[0];

  return {
    id: row.id,
    propertyId: row.propertyId,
    userId: row.userId,
    guestName: row.guestName,
    guestEmail: row.guestEmail,
    guestPhone: row.guestPhone ?? null,
    checkIn: row.checkIn,
    checkOut: row.checkOut,
    totalAmount: row.totalAmount,
    depositAmount: row.depositAmount,
    depositPercent: row.depositPercent,
    cautionAmount: row.cautionAmount,
    balanceDueDate: row.balanceDueDate,
    balanceLeadDays: row.balanceLeadDays,
    status: row.status as BookingStatus,
    notes: row.notes ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? null,
  };
}

// ─── Fonctions ────────────────────────────────────────────────────────────────

async function transitionStatus(
  bookingId: string,
  newStatus: BookingStatus,
): Promise<void> {
  const booking = await getBookingOrThrow(bookingId);
  const current = booking.status;
  const allowed = VALID_TRANSITIONS[current];

  if (!allowed.includes(newStatus)) {
    throw new Error(`Transition invalide: ${current} → ${newStatus}`);
  }

  await db
    .update(bookings)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(bookings.id, bookingId));
}

async function sendDeposit(
  bookingId: string,
): Promise<{ checkoutUrl: string | null }> {
  const booking = await getBookingOrThrow(bookingId);

  const propertyRows = await db
    .select({ name: properties.name })
    .from(properties)
    .where(eq(properties.id, booking.propertyId))
    .limit(1);
  const propertyName = propertyRows[0]?.name ?? "Bien";

  let checkoutUrl: string | null = null;
  let providerPaymentId = "pending_stripe_config";

  try {
    const result = await stripeService.createDepositCheckout({
      id: booking.id,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      propertyName,
      depositAmount: booking.depositAmount,
      cautionAmount: booking.cautionAmount,
      totalAmount: booking.totalAmount,
    });
    checkoutUrl = result.url;
    providerPaymentId = result.sessionId;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("STRIPE_SECRET_KEY non configurée")) {
      console.warn("[STRIPE] Stripe non configurée — passage en mode dégradé");
    } else {
      throw err;
    }
  }

  await db.insert(payments).values({
    bookingId: booking.id,
    type: "deposit",
    amount: booking.depositAmount,
    provider: "stripe",
    providerPaymentId,
    status: "pending",
  });

  await transitionStatus(bookingId, "deposit_pending");

  return { checkoutUrl };
}

async function sendCaution(
  bookingId: string,
): Promise<{ clientSecret: string | null }> {
  const booking = await getBookingOrThrow(bookingId);

  const propertyRows = await db
    .select({ name: properties.name })
    .from(properties)
    .where(eq(properties.id, booking.propertyId))
    .limit(1);
  const propertyName = propertyRows[0]?.name ?? "Bien";

  let clientSecret: string | null = null;
  let providerPaymentId = "pending_stripe_config";

  try {
    const result = await stripeService.createCautionAuthorize({
      id: booking.id,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      propertyName,
      depositAmount: booking.depositAmount,
      cautionAmount: booking.cautionAmount,
      totalAmount: booking.totalAmount,
    });
    clientSecret = result.clientSecret;
    providerPaymentId = result.paymentIntentId;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("STRIPE_SECRET_KEY non configurée")) {
      console.warn("[STRIPE] Stripe non configurée — passage en mode dégradé");
    } else {
      throw err;
    }
  }

  await db.insert(payments).values({
    bookingId: booking.id,
    type: "caution_hold",
    amount: booking.cautionAmount,
    provider: "stripe",
    providerPaymentId,
    status: "pending",
  });

  await transitionStatus(bookingId, "caution_pending");

  return { clientSecret };
}

async function sendBalance(
  bookingId: string,
): Promise<{ clientSecret: string | null }> {
  const booking = await getBookingOrThrow(bookingId);

  const propertyRows = await db
    .select({ name: properties.name })
    .from(properties)
    .where(eq(properties.id, booking.propertyId))
    .limit(1);
  const propertyName = propertyRows[0]?.name ?? "Bien";

  const balanceAmount = booking.totalAmount - booking.depositAmount;
  let clientSecret: string | null = null;
  let providerPaymentId = "pending_stripe_config";

  try {
    const result = await stripeService.createBalancePaymentIntent({
      id: booking.id,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      propertyName,
      depositAmount: booking.depositAmount,
      cautionAmount: booking.cautionAmount,
      totalAmount: booking.totalAmount,
    });
    clientSecret = result.clientSecret;
    providerPaymentId = result.paymentIntentId;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    if (message.includes("STRIPE_SECRET_KEY non configurée")) {
      console.warn("[STRIPE] Stripe non configurée — passage en mode dégradé");
    } else {
      throw err;
    }
  }

  await db.insert(payments).values({
    bookingId: booking.id,
    type: "balance",
    amount: balanceAmount,
    provider: "stripe",
    providerPaymentId,
    status: "pending",
  });

  await transitionStatus(bookingId, "balance_pending");

  return { clientSecret };
}

async function cancelBooking(bookingId: string): Promise<void> {
  const booking = await getBookingOrThrow(bookingId);

  if (booking.status === "cancelled" || booking.status === "completed") {
    throw new Error(
      `Impossible d'annuler un booking en statut "${booking.status}"`,
    );
  }

  await db
    .update(bookings)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(bookings.id, bookingId));
}

async function getUpcomingBalances(): Promise<Booking[]> {
  const today = new Date().toISOString().split("T")[0];

  const rows = await db
    .select()
    .from(bookings)
    .where(
      and(
        eq(bookings.status, "caution_held"),
        lte(bookings.balanceDueDate, today),
        isNull(bookings.deletedAt),
      ),
    );

  return rows.map((row) => ({
    id: row.id,
    propertyId: row.propertyId,
    userId: row.userId,
    guestName: row.guestName,
    guestEmail: row.guestEmail,
    guestPhone: row.guestPhone ?? null,
    checkIn: row.checkIn,
    checkOut: row.checkOut,
    totalAmount: row.totalAmount,
    depositAmount: row.depositAmount,
    depositPercent: row.depositPercent,
    cautionAmount: row.cautionAmount,
    balanceDueDate: row.balanceDueDate,
    balanceLeadDays: row.balanceLeadDays,
    status: row.status as BookingStatus,
    notes: row.notes ?? null,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? null,
  }));
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const bookingService = {
  transitionStatus,
  sendDeposit,
  sendCaution,
  sendBalance,
  cancelBooking,
  getUpcomingBalances,
};
