// src/stores/useEventStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useUiStore } from "./useUiStore";

// -----------------------------
// Type Definitions
// -----------------------------
export interface Event {
  id: string;
  title: string;
  location: string;
  isMultiDay: boolean;
  startDate: string;
  endDate?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  description: string;
  coverImage?: string | null;
  color: string;
  participants: string[];
  progress: number;
}

export interface EventStoreState {
  // Local UI State
  selectedEventId: string | null;
  searchKeyword: string;
  eventSortBy: string;
  eventSortDirection: "asc" | "desc";
  filterByProgress: string[];
  filterByDate: string[];
  totalCount: number;
  showingCount: number;

  // Actions (local)
  setSelectedEventId: (id: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
  setEventSortBy: (sort: string) => void;
  setEventSortDirection: (dir: "asc" | "desc") => void;
  setEventFilters: (filters: Partial<EventStoreState>) => void;
}

// -----------------------------
// Zustand Store (local state only)
// -----------------------------
export const useEventStore = create<EventStoreState>()(
  devtools((set) => ({
    selectedEventId: null,
    searchKeyword: "",
    eventSortBy: "Start Date (Soonest)",
    eventSortDirection: "asc",
    filterByProgress: ["Not Started", "In Progress", "Completed"],
    filterByDate: ["Past Events", "This Week", "This Month", "Future Events"],
    totalCount: 0,
    showingCount: 0,

    setSelectedEventId: (id) => set({ selectedEventId: id }),
    setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),
    setEventSortBy: (sort) => set({ eventSortBy: sort }),
    setEventSortDirection: (dir) => set({ eventSortDirection: dir }),
    setEventFilters: (filters) => set((state) => ({ ...state, ...filters })),
  }))
);

// -----------------------------
// React Query Hooks (Server Data)
// -----------------------------

const API_BASE = "/api/events";

async function fetchEvents(params: Record<string, any>) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}?${query}`);
  if (!res.ok) throw new Error("Failed to fetch events");
  return res.json();
}

async function createEvent(data: Partial<Event>) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create event");
  return res.json();
}

async function updateEvent(id: string, data: Partial<Event>) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update event");
  return res.json();
}

async function deleteEvent(id: string) {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete event");
  return id;
}

// -----------------------------
// Custom React Query Hooks
// -----------------------------
export function useFetchEvents() {
  const {
    searchKeyword,
    eventSortBy,
    eventSortDirection,
    filterByProgress,
    filterByDate,
  } = useEventStore();

  return useQuery({
    queryKey: ["events", { searchKeyword, eventSortBy, eventSortDirection, filterByProgress, filterByDate }],
    queryFn: () =>
      fetchEvents({
        search: searchKeyword,
        sortBy: eventSortBy,
        sortDirection: eventSortDirection,
        progress: filterByProgress.join(","),
        dateFilter: filterByDate.join(","),
      }),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const closeModal = useUiStore((s) => s.closeAllModals);

  return useMutation({
    mutationFn: createEvent,
    onSuccess: () => {
      toast.success("Event created successfully!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      closeModal();
    },
    onError: () => toast.error("Failed to create event"),
  });
}

export function useUpdateEvent() {
  const queryClient = useQueryClient();
  const closeModal = useUiStore((s) => s.closeAllModals);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Event> }) =>
      updateEvent(id, data),
    onSuccess: () => {
      toast.success("Event updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      closeModal();
    },
    onError: () => toast.error("Failed to update event"),
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      toast.success("Event deleted!");
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: () => toast.error("Failed to delete event"),
  });
}
