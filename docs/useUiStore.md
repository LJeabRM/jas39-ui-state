# 🧩 JAS39 Planner — UI State Store (`useUiStore.ts`)

**Maintainer:** UI-State & Forms Owner  
**Technologies:** Zustand + TypeScript + persist middleware  
**Purpose:** Manage all **local UI state** for modals, filters, sorting, selections, and user preferences in the JAS39 Planner application.

---

## 1. Overview

`useUiStore.ts` is a **Zustand store** that manages all front-end UI states, including:

- Modal visibility (Event/Task forms, panels)  
- Filters & sorting (Quick filters and advanced filters)  
- Selections & preferences (current event/task, theme, sidebar, view mode, dashboard widgets)  
- Persisted states for user preferences using `localStorage`

> **Note:** This store is strictly for UI state. Server data (events, tasks) is handled separately (e.g., via React Query).

---

## 2. State Variables

### 2.1 Modals (boolean)
| State | Description |
|-------|------------|
| `isEventFormOpen` | Controls visibility of the Event form modal (Create/Edit) |
| `isTaskFormOpen` | Controls visibility of the Task form modal (Create/Edit) |
| `isCustomizeDashboardOpen` | Controls visibility of the Customize Dashboard panel |
| `isFilterPanelOpen` | Controls visibility of the Advanced Filters panel |
| `isUserSettingsOpen` | Controls visibility of the User Settings/Profile modal |

### 2.2 Filters & Sorting
| State | Description | Default | Persist |
|-------|------------|---------|--------|
| `taskFilterStatus` | Quick filter (Due Today, High Priority, etc.) | `"Due Date"` | ✅ |
| `taskSortBy` | Sort field (Priority, Recent) | `"Priority"` | ✅ |
| `taskSortDirection` | `"asc"` or `"desc"` | `"desc"` | ✅ |
| `advancedFilters` | Object containing `advancedStatus`, `advancedPriority`, `advancedAssignees`, `advancedDateRange`, `hasActiveFilters` | empty/null | ❌ |
| `showCompletedTasks` | Boolean to show completed tasks | `true` | ✅ |
| `showPersonalTasks` | Boolean to show personal tasks | `true` | ✅ |

### 2.3 Selections & Preferences
| State | Description | Default | Persist |
|-------|------------|---------|--------|
| `currentEventId` | ID of the currently selected Event | `null` | ❌ |
| `currentTaskId` | ID of the currently selected Task | `null` | ❌ |
| `theme` | UI theme (light / dark) | `"dark"` | ✅ |
| `isSidebarCollapsed` | Sidebar collapsed state | `false` | ✅ |
| `dashboardWidgetState` | Visibility state of dashboard widgets | `{upcomingEvents: true, upcomingDeadlines: true, recentActivity: true, progressOverview: true, miniCalendar: false}` | ✅ |
| `viewMode` | Current dashboard view mode (`list`, `calendar`, `board`) | `"list"` | ✅ |

---

## 3. Actions

### 3.1 Modals
- `openEventForm(eventId: string | null)` → Opens Event form modal & sets `currentEventId`  
- `openTaskForm(taskId: string | null)` → Opens Task form modal & sets `currentTaskId`  
- `closeAllModals()` → Closes all modals & resets `currentEventId` and `currentTaskId`  
- `toggleCustomizeDashboard()` → Toggles the Customize Dashboard panel  
- `toggleFilterPanel()` → Toggles the Advanced Filters panel  
- `toggleUserSettings()` → Toggles the User Settings/Profile modal

### 3.2 Filters / Sorting
- `setTaskFilterStatus(status: string)` → Updates the quick filter status  
- `setTaskSortBy(sortBy: string)` → Updates the sorting field  
- `setTaskSortDirection(direction: "asc" | "desc")` → Updates the sorting direction  
- `clearAdvancedFilters()` → Resets all advanced filter fields and sets `hasActiveFilters = false`  
- `setAdvancedFilters(filters: Partial<AdvancedFilters>)` → Merges or updates advanced filter fields  
- `setShowCompletedTasks(show: boolean)` → Toggles showing completed tasks  
- `setShowPersonalTasks(show: boolean)` → Toggles showing personal tasks

### 3.3 Selections & Preferences
- `setTheme(theme: "light" | "dark")` → Sets the theme  
- `toggleSidebar()` → Toggles the sidebar collapsed state  
- `setCurrentEventId(id: string | null)` → Updates the selected Event ID  
- `setCurrentTaskId(id: string | null)` → Updates the selected Task ID  
- `setDashboardWidgetState(widgets: Partial<DashboardWidgetState>)` → Updates dashboard widgets visibility  
- `setViewMode(mode: string)` → Sets the dashboard view mode

---

## 4. Persistence

The following states are persisted to `localStorage` using **Zustand's `persist` middleware**:

- `theme`  
- `isSidebarCollapsed`  
- `taskFilterStatus`, `taskSortBy`, `taskSortDirection`  
- `dashboardWidgetState`  
- `viewMode`  
- `showCompletedTasks`, `showPersonalTasks`

> Non-persisted states (`currentEventId`, `currentTaskId`, `advancedFilters`) reset on page reload.

---

## 5. Best Practices

1. **Use selectors** to reduce unnecessary re-renders in components.  
2. **Keep state atomic**; only use nested objects for `advancedFilters` and `dashboardWidgetState`.  
3. **UI-only store**: Do not store server data here (fetch via React Query).  
4. **Modal consistency**: Always use `openXForm` and `closeAllModals` to ensure selection resets correctly.  
5. **Persist only preferences**: Avoid persisting dynamic selection or temporary form states.

---

## 6. Example Flow

1. User clicks "Add Task" → `openTaskForm(null)`  
2. Task modal opens, `currentTaskId = null`  
3. User fills the form and submits → mutation handles backend  
4. On success → `closeAllModals()` resets modal & selection  
5. Dashboard reacts to filters, sort, and viewMode from the store
