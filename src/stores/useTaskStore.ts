// src/stores/useTaskStore.ts
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { useUiStore } from "./useUiStore";

/**
 * Task model
 * Dates are represented as ISO strings (e.g. "2025-10-15T08:00:00Z") to simplify JSON transport.
 */
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

/**
 * Local task store state (Zustand) - for UI / filters / selection
 */
export interface TaskStoreState {
  // selection + meta
  selectedTaskId: string | null;
  totalCount: number;
  showingCount: number;

  // search / filters / sorting / view
  searchKeyword: string;
  quickFilter: string; // e.g., "Due Today", "High Priority", "My Tasks"
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

  // advanced filters
  filterByStatus: ("To Do" | "In Progress" | "Done")[];
  filterByPriority: ("Urgent" | "High" | "Normal" | "Low")[];
  showCompletedTasks: boolean;
  showPersonalTasks: boolean;

  // actions / setters
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

  setTaskFilters: (partial: Partial<Omit<TaskStoreState, "setTaskFilters" | "setSelectedTaskId" | "setTotalCount" | "setShowingCount">>) => void;
}

export const useTaskStore = create<TaskStoreState>()(
  devtools((set) => ({
    // defaults
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

    // setters
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

/**
 * React Query integration (server data)
 * API base for tasks
 */
const API_BASE = "/api/tasks";

async function fetchTasksAPI(params: Record<string, any>) {
  const query = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}?${query}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
}

async function fetchTaskByIdAPI(id: string) {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error("Failed to fetch task");
  return res.json();
}

async function createTaskAPI(data: Partial<Task>) {
  const res = await fetch(API_BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
}

async function updateTaskAPI(id: string, data: Partial<Task>) {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
}

async function deleteTaskAPI(id: string) {
  const res = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete task");
  return id;
}

/**
 * React Query hooks for tasks
 */

/**
 * useFetchTasks - uses filters/sort/search from useTaskStore to build query key/params
 */
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
      fetchTasksAPI({
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

/**
 * useFetchTask - fetch single task by id (for edit form)
 */
export function useFetchTask(taskId?: string | null) {
  return useQuery({
    queryKey: ["task", taskId],
    queryFn: () => {
      if (!taskId) return null;
      return fetchTaskByIdAPI(taskId);
    },
    enabled: !!taskId,
  });
}

/**
 * Mutations: create / update / delete / mark complete
 */
export function useCreateTask() {
  const queryClient = useQueryClient();
  const closeModal = useUiStore((s) => s.closeAllModals);

  return useMutation({
    mutationFn: (data: Partial<Task>) => createTaskAPI(data),
    onSuccess: () => {
      toast.success("Task created");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      closeModal();
    },
    onError: (err: any) => {
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
      updateTaskAPI(id, data),
    onSuccess: () => {
      toast.success("Task updated");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
      closeModal();
    },
    onError: (err: any) => {
      console.error(err);
      toast.error("Failed to update task");
    },
  });
}

export function useDeleteTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteTaskAPI(id),
    onSuccess: () => {
      toast.success("Task deleted");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err: any) => {
      console.error(err);
      toast.error("Failed to delete task");
    },
  });
}

/**
 * Convenience: mark complete (updates status to "Done")
 */
export function useMarkTaskComplete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      updateTaskAPI(id, { status: completed ? "Done" : "In Progress", progress: completed ? 100 : undefined }),
    onSuccess: () => {
      toast.success("Task status updated");
      queryClient.invalidateQueries({ queryKey: ["tasks"] });
    },
    onError: (err: any) => {
      console.error(err);
      toast.error("Failed to update task status");
    },
  });
}
