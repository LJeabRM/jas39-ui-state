// src/stores/useMemberStore.ts
import { create } from "zustand";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabaseClient";

// -----------------------------
// Type Definitions
// -----------------------------
export interface Member {
  id: string;
  name: string;
  email?: string;
  role?: string;
  event_id?: string;
  joined_at?: string;
}

// -----------------------------
// Zustand Store
// -----------------------------
interface MemberStore {
  members: Member[];
  isLoading: boolean;
  isError: boolean;
  fetchMembers: (eventId: string) => Promise<void>;
}

export const useMemberStore = create<MemberStore>((set) => ({
  members: [],
  isLoading: false,
  isError: false,

  // Fetch members for a specific event
  fetchMembers: async (eventId: string) => {
    set({ isLoading: true, isError: false });
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("event_id", eventId)
        .order("joined_at", { ascending: true });

      if (error) throw error;
      set({ members: data || [], isLoading: false });
    } catch (error) {
      console.error("Failed to fetch members:", error);
      set({ isError: true, isLoading: false });
    }
  },
}));

// -----------------------------
// Custom Hook (React Query)
// -----------------------------
export const useMembers = (eventId?: string) => {
  const store = useMemberStore();

  const query = useQuery<Member[], Error>(
    ["members", eventId],
    async (): Promise<Member[]> => {
      if (!eventId) return [];
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .eq("event_id", eventId)
        .order("joined_at", { ascending: true });

      if (error) throw error;
      return data || [];
    },
    {
      enabled: !!eventId,
      onSuccess: (data: Member[]) => {
        if (!eventId) return;
        store.setState({
          members: data,
          isLoading: false,
          isError: false,
        });
      },
      onError: (error: Error) => {
        console.error("Error loading members:", error);
        store.setState({
          isError: true,
          isLoading: false,
        });
      },
    }
  );

  return {
    data: store.members,
    isLoading: query.isLoading || store.isLoading,
    isError: query.isError || store.isError,
  };
};
