// src/stores/useMemberStore.ts
import { create } from "zustand";
import { useQuery } from "@tanstack/react-query";

export interface Member {
  id: string;
  name: string;
}

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
  fetchMembers: async (eventId: string) => {
    set({ isLoading: true, isError: false });
    try {
      const res = await fetch(`/api/events/${eventId}/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      const data: Member[] = await res.json();
      set({ members: data, isLoading: false });
    } catch (error) {
      console.error(error);
      set({ isError: true, isLoading: false });
    }
  },
}));

// Custom hook for convenience
export const useMembers = (eventId?: string) => {
  const store = useMemberStore();

  const query = useQuery<Member[]>(
    ["members", eventId],
    async () => {
      if (!eventId) return [];
      const res = await fetch(`/api/events/${eventId}/members`);
      if (!res.ok) throw new Error("Failed to fetch members");
      return res.json();
    },
    {
      enabled: !!eventId,
      onSuccess: (data) =>
        useMemberStore.setState({
          members: data,
          isLoading: false,
          isError: false,
        }),
      onError: () =>
        useMemberStore.setState({ isError: true, isLoading: false }),
    }
  );

  return {
    data: store.members,
    isLoading: query.isLoading || store.isLoading,
    isError: query.isError || store.isError,
  };
};
