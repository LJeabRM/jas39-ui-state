// src/stores/useEventStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useUiStore } from "./useUiStore";
import { supabase } from "@/lib/supabaseClient";

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
  created_at?: string;
  updated_at?: string;
}

// -----------------------------
// Zustand Store (Local UI State)
// -----------------------------
export interface EventStoreState {
  selectedEventId: string | null;
  searchKeyword: string;
  eventSortBy: string;
  eventSortDirection: "asc" | "desc";
  filterByProgress: string[];
  filterByDate: string[];
  totalCount: number;
  showingCount: number;

  setSelectedEventId: (id: string | null) => void;
  setSearchKeyword: (keyword: string) => void;
  setEventSortBy: (sort: string) => void;
  setEventSortDirection: (dir: "asc" | "desc") => void;
  setEventFilters: (filters: Partial<EventStoreState>) => void;
}

export const useEventStore = create<EventStoreState>()(
  devtools((set) => ({
    selectedEventId: null,
    searchKeyword: "",
    eventSortBy: "startDate",
    eventSortDirection: "asc",
    filterByProgress: ["Not Started", "In Progress", "Completed"],
    filterByDate: ["Past", "This Week", "This Month", "Future"],
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
// Supabase API Helpers
// -----------------------------

async function fetchEvents(params: {
  search?: string;
  sortBy?: string;
  sortDirection?: "asc" | "desc";
  progress?: string;
}) {
  let query = supabase.from("events").select("*");

  // Search
  if (params.search) {
    query = query.ilike("title", `%${params.search}%`);
  }

  // Filter by progress
  if (params.progress) {
    const progressArray = params.progress.split(",");
    query = query.in("progress", progressArray);
  }

  // Sorting
  if (params.sortBy) {
    const ascending = params.sortDirection === "asc";
    query = query.order(params.sortBy, { ascending });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Event[];
}

async function createEvent(data: Partial<Event>) {
  const { data: result, error } = await supabase
    .from("events")
    .insert(data)
    .select()
    .single();

  if (error) throw error;
  return result as Event;
}

async function updateEvent(id: string, data: Partial<Event>) {
  const { data: result, error } = await supabase
    .from("events")
    .update(data)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return result as Event;
}

async function deleteEvent(id: string) {
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
  return id;
}

// -----------------------------
// React Query Hooks
// -----------------------------
export function useFetchEvents() {
  const {
    searchKeyword,
    eventSortBy,
    eventSortDirection,
    filterByProgress,
  } = useEventStore();

  return useQuery({
    queryKey: [
      "events",
      { searchKeyword, eventSortBy, eventSortDirection, filterByProgress },
    ],
    queryFn: () =>
      fetchEvents({
        search: searchKeyword,
        sortBy: eventSortBy,
        sortDirection: eventSortDirection,
        progress: filterByProgress.join(","),
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
    onError: (err) => {
      console.error(err);
      toast.error("Failed to create event");
    },
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
    onError: (err) => {
      console.error(err);
      toast.error("Failed to update event");
    },
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
    onError: (err) => {
      console.error(err);
      toast.error("Failed to delete event");
    },
  });
}
