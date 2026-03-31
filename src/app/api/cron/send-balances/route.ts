import { NextResponse } from "next/server";
import { bookingService } from "@/lib/services/booking-service";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const upcomingBookings = await bookingService.getUpcomingBalances();

    const results = [];

    for (const booking of upcomingBookings) {
      try {
        await bookingService.sendBalance(booking.id);
        results.push({ bookingId: booking.id, status: "sent" });
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        results.push({ bookingId: booking.id, status: "failed", error: message });
      }
    }

    return NextResponse.json({
      processed: upcomingBookings.length,
      results,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
