import Stripe from "stripe";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface BookingForStripe {
  id: string;
  guestName: string;
  guestEmail: string;
  propertyName: string;
  depositAmount: number;
  cautionAmount: number;
  totalAmount: number;
}

// ─── Singleton ────────────────────────────────────────────────────────────────

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key || key === "sk_test_TODO") {
    throw new Error("STRIPE_SECRET_KEY non configurée");
  }
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" });
}

// ─── Fonctions ────────────────────────────────────────────────────────────────

async function createDepositCheckout(
  booking: BookingForStripe,
): Promise<string> {
  const stripe = getStripe();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: booking.guestEmail,
    line_items: [
      {
        price_data: {
          currency: "eur",
          unit_amount: booking.depositAmount,
          product_data: {
            name: `Acompte — ${booking.guestName} — ${booking.propertyName}`,
          },
        },
        quantity: 1,
      },
    ],
    success_url: `${appUrl}/bookings/${booking.id}?payment=success`,
    cancel_url: `${appUrl}/bookings/${booking.id}?payment=cancel`,
    metadata: {
      bookingId: booking.id,
      type: "deposit",
    },
  });

  if (!session.url) {
    throw new Error("Stripe n'a pas retourné d'URL pour la session Checkout");
  }

  return session.url;
}

async function createCautionAuthorize(
  booking: BookingForStripe,
): Promise<string> {
  const stripe = getStripe();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: booking.cautionAmount,
    currency: "eur",
    capture_method: "manual",
    metadata: {
      bookingId: booking.id,
      type: "caution_hold",
    },
  });

  if (!paymentIntent.client_secret) {
    throw new Error(
      "Stripe n'a pas retourné de client_secret pour le PaymentIntent caution",
    );
  }

  return paymentIntent.client_secret;
}

async function createBalancePaymentIntent(
  booking: BookingForStripe,
): Promise<string> {
  const stripe = getStripe();

  const balanceAmount = booking.totalAmount - booking.depositAmount;

  const paymentIntent = await stripe.paymentIntents.create({
    amount: balanceAmount,
    currency: "eur",
    receipt_email: booking.guestEmail,
    metadata: {
      bookingId: booking.id,
      type: "balance",
    },
  });

  if (!paymentIntent.client_secret) {
    throw new Error(
      "Stripe n'a pas retourné de client_secret pour le PaymentIntent solde",
    );
  }

  return paymentIntent.client_secret;
}

async function releaseCaution(providerPaymentId: string): Promise<void> {
  const stripe = getStripe();
  await stripe.paymentIntents.cancel(providerPaymentId);
}

async function captureCaution(
  providerPaymentId: string,
  amount?: number,
): Promise<void> {
  const stripe = getStripe();
  await stripe.paymentIntents.capture(providerPaymentId, {
    ...(amount !== undefined ? { amount_to_capture: amount } : {}),
  });
}

function constructWebhookEvent(
  payload: string,
  signature: string,
): Stripe.Event {
  const stripe = getStripe();
  return stripe.webhooks.constructEvent(
    payload,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!,
  );
}

// ─── Export ───────────────────────────────────────────────────────────────────

export const stripeService = {
  createDepositCheckout,
  createCautionAuthorize,
  createBalancePaymentIntent,
  releaseCaution,
  captureCaution,
  constructWebhookEvent,
};
