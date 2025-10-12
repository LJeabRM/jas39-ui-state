// src/stores/useUiStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// -----------------------------
// Type Definitions
// -----------------------------
export interface DashboardWidgetState {
  upcomingEvents: boolean;
  upcomingDeadlines: boolean;
  recentActivity: boolean;
  progressOverview: boolean;
  miniCalendar: boolean;
}

export interface AdvancedFilters {
  advancedStatus: string[];
  advancedPriority: string[];
  advancedAssignees: string[];
  advancedDateRange: { startDate: Date | null; endDate: Date | null } | null;
  hasActiveFilters: boolean;
}

export interface UiStore {
  // Modals
  isEventFormOpen: boolean;
  isTaskFormOpen: boolean;
  isCustomizeDashboardOpen: boolean;
  isFilterPanelOpen: boolean;
  isUserSettingsOpen: boolean;

  // Filters / Sorting
  taskFilterStatus: string;
  taskSortBy: string;
  taskSortDirection: "asc" | "desc";
  advancedFilters: AdvancedFilters;
  showCompletedTasks: boolean;
  showPersonalTasks: boolean;

  // Selections / UI preferences
  currentEventId: string | null;
  currentTaskId: string | null;
  theme: "light" | "dark";
  isSidebarCollapsed: boolean;
  dashboardWidgetState: DashboardWidgetState;
  viewMode: string;

  // -----------------------------
  // Actions
  // -----------------------------

  // Modals
  openEventForm: (eventId: string | null) => void;
  openTaskForm: (taskId: string | null) => void;
  closeAllModals: () => void;
  toggleCustomizeDashboard: () => void;
  toggleFilterPanel: () => void;
  toggleUserSettings: () => void;

  // Filters / Sorting
  setTaskFilterStatus: (status: string) => void;
  setTaskSortBy: (sortBy: string) => void;
  setTaskSortDirection: (direction: "asc" | "desc") => void;
  clearAdvancedFilters: () => void;
  setAdvancedFilters: (filters: Partial<AdvancedFilters>) => void;
  setShowCompletedTasks: (show: boolean) => void;
  setShowPersonalTasks: (show: boolean) => void;

  // Selections / Preferences
  setTheme: (theme: "light" | "dark") => void;
  toggleSidebar: () => void;
  setCurrentEventId: (id: string | null) => void;
  setCurrentTaskId: (id: string | null) => void;
  setDashboardWidgetState: (widgets: Partial<DashboardWidgetState>) => void;
  setViewMode: (mode: string) => void;
}

// -----------------------------
// Zustand Store
// -----------------------------
export const useUiStore = create<UiStore>()(
  persist(
    (set, get) => ({
      // -----------------------------
      // Initial State
      // -----------------------------
      isEventFormOpen: false,
      isTaskFormOpen: false,
      isCustomizeDashboardOpen: false,
      isFilterPanelOpen: false,
      isUserSettingsOpen: false,

      taskFilterStatus: "Due Date",
      taskSortBy: "Priority",
      taskSortDirection: "desc",
      advancedFilters: {
        advancedStatus: [],
        advancedPriority: [],
        advancedAssignees: [],
        advancedDateRange: null,
        hasActiveFilters: false,
      },
      showCompletedTasks: true,
      showPersonalTasks: true,

      currentEventId: null,
      currentTaskId: null,
      theme: "dark",
      isSidebarCollapsed: false,
      dashboardWidgetState: {
        upcomingEvents: true,
        upcomingDeadlines: true,
        recentActivity: true,
        progressOverview: true,
        miniCalendar: false,
      },
      viewMode: "list",

      // -----------------------------
      // Actions
      // -----------------------------
      // Modals
      openEventForm: (eventId: string | null) => {
        set({ isEventFormOpen: true, currentEventId: eventId });
      },
      openTaskForm: (taskId: string | null) => {
        set({ isTaskFormOpen: true, currentTaskId: taskId });
      },
      closeAllModals: () => {
        set({
          isEventFormOpen: false,
          isTaskFormOpen: false,
          isCustomizeDashboardOpen: false,
          isFilterPanelOpen: false,
          isUserSettingsOpen: false,
          currentEventId: null,
          currentTaskId: null,
        });
      },
      toggleCustomizeDashboard: () =>
        set((state) => ({
          isCustomizeDashboardOpen: !state.isCustomizeDashboardOpen,
        })),
      toggleFilterPanel: () =>
        set((state) => ({ isFilterPanelOpen: !state.isFilterPanelOpen })),
      toggleUserSettings: () =>
        set((state) => ({ isUserSettingsOpen: !state.isUserSettingsOpen })),

      // Filters / Sorting
      setTaskFilterStatus: (status: string) => set({ taskFilterStatus: status }),
      setTaskSortBy: (sortBy: string) => set({ taskSortBy: sortBy }),
      setTaskSortDirection: (direction: "asc" | "desc") =>
        set({ taskSortDirection: direction }),
      clearAdvancedFilters: () =>
        set({
          advancedFilters: {
            advancedStatus: [],
            advancedPriority: [],
            advancedAssignees: [],
            advancedDateRange: null,
            hasActiveFilters: false,
          },
        }),
      setAdvancedFilters: (filters: Partial<AdvancedFilters>) =>
        set((state) => ({
          advancedFilters: { ...state.advancedFilters, ...filters },
        })),
      setShowCompletedTasks: (show: boolean) => set({ showCompletedTasks: show }),
      setShowPersonalTasks: (show: boolean) => set({ showPersonalTasks: show }),

      // Selections / Preferences
      setTheme: (theme: "light" | "dark") => set({ theme }),
      toggleSidebar: () =>
        set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
      setCurrentEventId: (id: string | null) => set({ currentEventId: id }),
      setCurrentTaskId: (id: string | null) => set({ currentTaskId: id }),
      setDashboardWidgetState: (widgets: Partial<DashboardWidgetState>) =>
        set((state) => ({ dashboardWidgetState: { ...state.dashboardWidgetState, ...widgets } })),
      setViewMode: (mode: string) => set({ viewMode: mode }),
    }),
    {
      name: "ui-store", // key in localStorage
      partialize: (state) => ({
        // Only persist selected keys
        theme: state.theme,
        isSidebarCollapsed: state.isSidebarCollapsed,
        taskFilterStatus: state.taskFilterStatus,
        taskSortBy: state.taskSortBy,
        taskSortDirection: state.taskSortDirection,
        dashboardWidgetState: state.dashboardWidgetState,
        viewMode: state.viewMode,
        showCompletedTasks: state.showCompletedTasks,
        showPersonalTasks: state.showPersonalTasks,
      }),
    }
  )
);
