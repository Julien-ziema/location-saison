import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type { Payment } from "@/lib/types/payment";

async function fetchPayments(bookingId: string): Promise<Payment[]> {
  const res = await fetch(`/api/bookings/${bookingId}/payments`);
  if (!res.ok) throw new Error("Erreur réseau");
  return res.json() as Promise<Payment[]>;
}

async function sendDeposit({ bookingId }: { bookingId: string }): Promise<void> {
  const res = await fetch(`/api/bookings/${bookingId}/send-deposit`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Erreur réseau");
}

async function sendCaution({ bookingId }: { bookingId: string }): Promise<void> {
  const res = await fetch(`/api/bookings/${bookingId}/send-caution`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Erreur réseau");
}

async function sendBalance({ bookingId }: { bookingId: string }): Promise<void> {
  const res = await fetch(`/api/bookings/${bookingId}/send-balance`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Erreur réseau");
}

export function usePayments(bookingId: string) {
  return useQuery({
    queryKey: ["payments", bookingId],
    queryFn: () => fetchPayments(bookingId),
    enabled: Boolean(bookingId),
  });
}

export function useSendDeposit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendDeposit,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      void queryClient.invalidateQueries({
        queryKey: ["booking", variables.bookingId],
      });
    },
    onError: (error: Error) => {
      console.error("useSendDeposit error:", error);
    },
  });
}

export function useSendCaution() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendCaution,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      void queryClient.invalidateQueries({
        queryKey: ["booking", variables.bookingId],
      });
    },
    onError: (error: Error) => {
      console.error("useSendCaution error:", error);
    },
  });
}

export function useSendBalance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sendBalance,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      void queryClient.invalidateQueries({
        queryKey: ["booking", variables.bookingId],
      });
    },
    onError: (error: Error) => {
      console.error("useSendBalance error:", error);
    },
  });
}
