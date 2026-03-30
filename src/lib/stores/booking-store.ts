import { create } from "zustand";
import type { BookingStatus } from "@/lib/types/booking";

interface BookingFilters {
  propertyId: string | null;
  status: BookingStatus | null;
  month: string | null; // format YYYY-MM
}

interface BookingState {
  viewMode: "table" | "planning" | "kanban";
  filters: BookingFilters;
  selectedBookingId: string | null;
  setViewMode: (mode: "table" | "planning" | "kanban") => void;
  setFilters: (filters: Partial<BookingFilters>) => void;
  resetFilters: () => void;
  selectBooking: (id: string | null) => void;
}

const DEFAULT_FILTERS: BookingFilters = {
  propertyId: null,
  status: null,
  month: null,
};

export const useBookingStore = create<BookingState>((set) => ({
  viewMode: "table",
  filters: DEFAULT_FILTERS,
  selectedBookingId: null,

  setViewMode: (mode) => set({ viewMode: mode }),

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  resetFilters: () => set({ filters: DEFAULT_FILTERS }),

  selectBooking: (id) => set({ selectedBookingId: id }),
}));
