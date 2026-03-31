import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { bookings, payments } from "@/lib/db/schema";
import { stripeService } from "@/lib/services/stripe-service";
import { bookingService } from "@/lib/services/booking-service";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event;
  try {
    event = stripeService.constructWebhookEvent(body, signature);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const bookingId = session.metadata?.bookingId;
        const type = session.metadata?.type;

        if (bookingId && type === "deposit") {
          // Update payment status
          await db
            .update(payments)
            .set({ status: "succeeded", providerPaymentId: session.id })
            .where(eq(payments.bookingId, bookingId));

          // Transition booking
          await bookingService.transitionStatus(bookingId, "deposit_paid");
        }
        break;
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object;
        const bookingId = paymentIntent.metadata?.bookingId;
        const type = paymentIntent.metadata?.type;

        if (!bookingId) break;

        // Update payment record
        await db
          .update(payments)
          .set({ status: "succeeded" })
          .where(eq(payments.providerPaymentId, paymentIntent.id));

        if (type === "caution_hold") {
          await bookingService.transitionStatus(bookingId, "caution_held");
        } else if (type === "balance") {
          await bookingService.transitionStatus(bookingId, "balance_paid");
        }
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object;
        await db
          .update(payments)
          .set({ status: "failed" })
          .where(eq(payments.providerPaymentId, paymentIntent.id));
        break;
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
