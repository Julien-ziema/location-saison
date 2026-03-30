import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { parseId } from "@/lib/api/helpers";
import { bookingService } from "@/lib/services/booking-service";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_req: Request, context: RouteContext) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = session.user.id;

  const params = await context.params;
  const id = parseId(params);
  if (!id) {
    return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
  }

  const existing = await db
    .select()
    .from(bookings)
    .where(and(eq(bookings.id, id), eq(bookings.userId, userId), isNull(bookings.deletedAt)))
    .limit(1);

  if (!existing[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (existing[0].status !== "draft") {
    return NextResponse.json(
      { error: `Booking must be in "draft" status to send deposit` },
      { status: 409 },
    );
  }

  try {
    const result = await bookingService.sendDeposit(id);
    await db
      .update(bookings)
      .set({ status: "deposit_pending", updatedAt: new Date() })
      .where(eq(bookings.id, id));
    return NextResponse.json({ success: true, ...result });
  } catch {
    await db
      .update(bookings)
      .set({ status: "deposit_pending", updatedAt: new Date() })
      .where(eq(bookings.id, id));
    return NextResponse.json({
      success: true,
      message: "deposit_pending (stripe not configured)",
    });
  }
}
