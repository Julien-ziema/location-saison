import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, properties } from "@/lib/db/schema";
import { eq, and, isNull, desc, sql, SQL } from "drizzle-orm";
import { calcDepositAmount, calcBalanceDueDate } from "@/lib/api/helpers";
import { bookingService } from "@/lib/services/booking-service";
import type { BookingStatus } from "@/lib/types/booking";

const VALID_STATUSES: BookingStatus[] = [
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

const createBookingSchema = z.object({
  propertyId: z.string().uuid(),
  guestName: z.string().min(2),
  guestEmail: z.string().email(),
  guestPhone: z.string().optional(),
  checkIn: z.string(),
  checkOut: z.string(),
  totalAmount: z.number().int().positive(),
  depositPercent: z.number().int().min(10).max(100).default(30),
  cautionAmount: z.number().int().positive(),
  balanceLeadDays: z.number().int().min(1).max(90).default(21),
  notes: z.string().optional(),
  sendDeposit: z.boolean().default(false),
});

export async function GET(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const { searchParams } = new URL(req.url);
  const statusParam = searchParams.get("status");
  const propertyIdParam = searchParams.get("propertyId");
  const monthParam = searchParams.get("month");

  const conditions: SQL[] = [eq(bookings.userId, userId), isNull(bookings.deletedAt)];

  if (statusParam && (VALID_STATUSES as string[]).includes(statusParam)) {
    conditions.push(eq(bookings.status, statusParam as BookingStatus));
  }

  if (propertyIdParam) {
    conditions.push(eq(bookings.propertyId, propertyIdParam));
  }

  if (monthParam) {
    const [year, month] = monthParam.split("-");
    conditions.push(
      sql`date_trunc('month', ${bookings.checkIn}::date) = ${year + "-" + month + "-01"}::date`,
    );
  }

  const result = await db.query.bookings.findMany({
    where: and(...conditions),
    with: { property: true },
    orderBy: [desc(bookings.createdAt)],
  });

  return NextResponse.json(result);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });
  }

  const {
    propertyId,
    guestName,
    guestEmail,
    guestPhone,
    checkIn,
    checkOut,
    totalAmount,
    depositPercent,
    cautionAmount,
    balanceLeadDays,
    notes,
    sendDeposit,
  } = parsed.data;

  const property = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.userId, userId), isNull(properties.deletedAt)))
    .limit(1);

  if (!property[0]) {
    return NextResponse.json({ error: "Property not found or not owned by user" }, { status: 404 });
  }

  const depositAmount = calcDepositAmount(totalAmount, depositPercent);
  const balanceDueDate = calcBalanceDueDate(checkIn, balanceLeadDays);

  const [booking] = await db
    .insert(bookings)
    .values({
      propertyId,
      userId,
      guestName,
      guestEmail,
      guestPhone,
      checkIn,
      checkOut,
      totalAmount,
      depositAmount,
      depositPercent,
      cautionAmount,
      balanceDueDate,
      balanceLeadDays,
      notes,
      status: "draft",
    })
    .returning();

  let finalBooking = booking;

  if (sendDeposit) {
    try {
      await bookingService.sendDeposit(booking.id);
      const [updated] = await db
        .update(bookings)
        .set({ status: "deposit_pending", updatedAt: new Date() })
        .where(eq(bookings.id, booking.id))
        .returning();
      if (updated) finalBooking = updated;
    } catch {
      // booking-service not yet configured — booking remains in draft
    }
  }

  return NextResponse.json(finalBooking, { status: 201 });
}
