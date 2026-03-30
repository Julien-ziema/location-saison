export type PaymentType =
  | "deposit"
  | "balance"
  | "caution_hold"
  | "caution_release"
  | "refund";

export type PaymentProvider = "stripe";

export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export interface Payment {
  id: string;
  bookingId: string;
  type: PaymentType;
  amount: number; // en centimes
  provider: PaymentProvider;
  providerPaymentId: string;
  status: PaymentStatus;
  metadata: Record<string, unknown> | null;
  createdAt: Date;
}
