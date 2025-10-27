// src/stores/useTaskStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useUiStore } from "./useUiStore";
import { supabase } from "@/lib/supabaseClient";

// -----------------------------
// Type Definitions
// -----------------------------
export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "Urgent" | "High" | "Normal" | "Low";
  status: "To Do" | "In Progress" | "Done";
  dueDate?: string | null;
  assignees: string[]; // user ids or names
  relatedEventName?: string | null;
  isPersonal?: boolean;
  subtasks?: Subtask[];
  attachments?: string[];
  isScheduled?: boolean;
  scheduleStart?: string | null;
  scheduleEnd?: string | null;
  isOverdue?: boolean;
  progress?: number; // 0 - 100
  createdAt?: string;
  updatedAt?: string;
}

// -----------------------------
// Zustand Store (local UI state)
// -----------------------------
export interface TaskStoreState {
  selectedTaskId: string | null;
  totalCount: number;
  showingCount: number;

  searchKeyword: string;
  quickFilter: string;
  taskSortBy:
    | "Due Date (Earliest)"
    | "Due Date (Latest)"
    | "Priority (High to Low)"
    | "Priority (Low to High)"
    | "Name (A-Z)"
    | "Name (Z-A)"
    | "Status";
  taskSortDirection: "asc" | "desc";
  viewMode: "List View" | "Board View" | "Calendar View";

  filterByStatus: ("To Do" | "In Progress" | "Done")[];
  filterByPriority: ("Urgent" | "High" | "Normal" | "Low")[];
  showCompletedTasks: boolean;
  showPersonalTasks: boolean;

  setSelectedTaskId: (id: string | null) => void;
  setTotalCount: (n: number) => void;
  setShowingCount: (n: number) => void;

  setSearchKeyword: (s: string) => void;
  setQuickFilter: (f: string) => void;
  setTaskSortBy: (s: TaskStoreState["taskSortBy"]) => void;
  setTaskSortDirection: (d: "asc" | "desc") => void;
  setViewMode: (m: TaskStoreState["viewMode"]) => void;

  setFilterByStatus: (s: TaskStoreState["filterByStatus"]) => void;
  setFilterByPriority: (p: TaskStoreState["filterByPriority"]) => void;
  setShowCompletedTasks: (b: boolean) => void;
  setShowPersonalTasks: (b: boolean) => void;

  setTaskFilters: (
    partial: Partial<
      Omit<
        TaskStoreState,
        | "setTaskFilters"
        | "setSelectedTaskId"
        | "setTotalCount"
        | "setShowingCount"
      >
    >
  ) => void;
}

export const useTaskStore = create<TaskStoreState>()(
  devtools((set) => ({
    selectedTaskId: null,
    totalCount: 0,
    showingCount: 0,

    searchKeyword: "",
    quickFilter: "Due Date",
    taskSortBy: "Due Date (Earliest)",
    taskSortDirection: "asc",
    viewMode: "List View",

    filterByStatus: ["To Do", "In Progress", "Done"],
    filterByPriority: ["Urgent", "High", "Normal", "Low"],
    showCompletedTasks: true,
    showPersonalTasks: true,

    setSelectedTaskId: (id) => set({ selectedTaskId: id }),
    setTotalCount: (n) => set({ totalCount: n }),
    setShowingCount: (n) => set({ showingCount: n }),

    setSearchKeyword: (s) => set({ searchKeyword: s }),
    setQuickFilter: (f) => set({ quickFilter: f }),
    setTaskSortBy: (s) => set({ taskSortBy: s }),
    setTaskSortDirection: (d) => set({ taskSortDirection: d }),
    setViewMode: (m) => set({ viewMode: m }),

    setFilterByStatus: (s) => set({ filterByStatus: s }),
    setFilterByPriority: (p) => set({ filterByPriority: p }),
    setShowCompletedTasks: (b) => set({ showCompletedTasks: b }),
    setShowPersonalTasks: (b) => set({ showPersonalTasks: b }),

    setTaskFilters: (partial) =>
      set((state) => ({
        ...state,
        ...partial,
      })),
  }))
);

// -----------------------------
// Supabase API functions
// -----------------------------
async function fetchTasks(params: Record<string, any>) {
  let query = supabase.from("tasks").select("*");

  // Search
  if (params.search) {
    query = query.ilike("title", `%${params.search}%`);
  }

  // Filter: status / priority
  if (params.status) {
    query = query.in("status", params.status.split(","));
  }
  if (params.priority) {
    query = query.in("priority", params.priority.split(","));
  }

  // Filter completed / personal
  if (params.showCompleted === "0") {
    query = query.neq("status", "Done");
  }
  if (params.showPersonal === "0") {
    query = query.eq("isPersonal", false);
  }

  // Sorting
  const ascending = params.sortDirection === "asc";
  switch (params.sortBy) {
    case "Due Date (Latest)":
      query = query.order("dueDate", { ascending: false });
      break;
    case "Priority (High to Low)":
      query = query.order("priority", { ascending: false });
      break;
    case "Priority (Low to High)":
      query = query.order("priority", { ascending: true });
      break;
    case "Name (A-Z)":
      query = query.order("title", { ascending: true });
      break;
    case "Name (Z-A)":
      query = query.order("title", { ascending: false });
      break;
    default:
      query = query.order("dueDate", { ascending });
  }

  const { data, error } = await query;
  if (error) throw error;
  return data as Task[];
}

async function fetchTaskById(id: string) {
  const { data, error } = await supabase.from("tasks").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Task;
}

async function createTask(data: Partial<Task>) {
  const { data: result, error } = await supabase.from("tasks").insert(data).select().single();
  if (error) throw error;
  return result as Task;
}

async function updateTask(id: string, data: Partial<Task>) {
  const { data: result, error } = await supabase.from("tasks").update(data).eq("id", id).select().single();
  if (error) throw error;
  return result as Task;
}

async function deleteTask(id: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
  return id;
}

// -----------------------------
// React Query Hooks
// -----------------------------
export function useFetchTasks() {
  const {
    searchKeyword,
    quickFilter,
    taskSortBy,
    taskSortDirection,
    filterByStatus,
    filterByPriority,
    showCompletedTasks,
    showPersonalTasks,
  } = useTaskStore();

  return useQuery({
    queryKey: [
      "tasks",
      {
        searchKeyword,
        quickFilter,
        taskSortBy,
        taskSortDirection,
        filterByStatus,
        filterByPriority,
        showCompletedTasks,
        showPersonalTasks,
      },
    ],
    queryFn: () =>
      fetchTasks({
        search: searchKeyword,
        quickFilter,
        sortBy: taskSortBy,
        sortDirection: taskSortDirection,
        status: filterByStatus.join(","),
        priority: filterByPriority.join(","),
        showCompleted: showCompletedTasks ? "1" : "0",
        showPersonal: showPersonalTasks ? "1" : "0",
      }),
    placeholderData: (prev) => prev,
  });
}

export function useFetchTask(taskId?: string | null) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => (taskId ? fetchTaskById(taskId) : null),
    enabled: !!taskId,
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  const closeModal = useUiStore((s) => s.closeAllModals);

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      toast.success("Task created");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      closeModal();
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to create task");
    },
  });
}

export function useUpdateTask() {
  const queryClient = useQueryClient();
  const closeModal = useUiStore((s) => s.closeAllModals);

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Task> }) =>
      updateTask(id, data),
    onSuccess: () => {
      toast.success("Task updated");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      closeModal();
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to update task");
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      toast.success("Task deleted");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to delete task");
    },
  });
}

export function useMarkTaskComplete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateTask(id, {
        status: completed ? "Done" : "In Progress",
        progress: completed ? 100 : undefined,
      }),
    onSuccess: () => {
      toast.success("Task status updated");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err) => {
      console.error(err);
      toast.error("Failed to update task status");
    },
  });
}
