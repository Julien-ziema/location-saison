import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import type {
  BookingWithPayments,
  BookingStatus,
  CreateBookingInput,
} from "@/lib/types/booking";

export interface BookingFilters {
  propertyId?: string;
  status?: BookingStatus;
  month?: string; // YYYY-MM
}

async function fetchBookings(filters?: BookingFilters): Promise<BookingWithPayments[]> {
  const params: Record<string, string> = {};
  if (filters?.propertyId) params.propertyId = filters.propertyId;
  if (filters?.status) params.status = filters.status;
  if (filters?.month) params.month = filters.month;

  const query = new URLSearchParams(params).toString();
  const res = await fetch(`/api/bookings${query ? `?${query}` : ""}`);
  if (!res.ok) throw new Error("Erreur réseau");
  return res.json() as Promise<BookingWithPayments[]>;
}

async function fetchBooking(id: string): Promise<BookingWithPayments> {
  const res = await fetch(`/api/bookings/${id}`);
  if (!res.ok) throw new Error("Erreur réseau");
  return res.json() as Promise<BookingWithPayments>;
}

async function createBooking(data: CreateBookingInput): Promise<BookingWithPayments> {
  const res = await fetch("/api/bookings", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur réseau");
  return res.json() as Promise<BookingWithPayments>;
}

async function updateBooking({
  id,
  data,
}: {
  id: string;
  data: Partial<CreateBookingInput>;
}): Promise<BookingWithPayments> {
  const res = await fetch(`/api/bookings/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Erreur réseau");
  return res.json() as Promise<BookingWithPayments>;
}

async function cancelBooking({ id }: { id: string }): Promise<BookingWithPayments> {
  const res = await fetch(`/api/bookings/${id}/cancel`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Erreur réseau");
  return res.json() as Promise<BookingWithPayments>;
}

export function useBookings(filters?: BookingFilters) {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: () => fetchBookings(filters),
  });
}

export function useBooking(id: string) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => fetchBooking(id),
    enabled: Boolean(id),
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: Error) => {
      console.error("useCreateBooking error:", error);
    },
  });
}

export function useUpdateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBooking,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
    },
    onError: (error: Error) => {
      console.error("useUpdateBooking error:", error);
    },
  });
}

export function useCancelBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: (_, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["bookings"] });
      void queryClient.invalidateQueries({ queryKey: ["booking", variables.id] });
    },
    onError: (error: Error) => {
      console.error("useCancelBooking error:", error);
    },
  });
}
