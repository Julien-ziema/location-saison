import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { parseId } from "@/lib/api/helpers";

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

  if (existing[0].status !== "balance_paid") {
    return NextResponse.json(
      { error: `Booking must be in "balance_paid" status to complete` },
      { status: 409 },
    );
  }

  const [updated] = await db
    .update(bookings)
    .set({ status: "completed", updatedAt: new Date() })
    .where(eq(bookings.id, id))
    .returning();

  return NextResponse.json(updated);
}
