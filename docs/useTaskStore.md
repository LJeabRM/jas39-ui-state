# Task Store (`useTaskStore.ts`) — Design & Usage

This document explains the structure and usage of the Task Store for JAS39 Planner.
The implementation pattern uses **Zustand** for UI-local state (filters, selection, view) and **React Query (TanStack Query)** for server data (fetching and mutations).

---

## 1. Purpose

`useTaskStore` is responsible for:
- Holding UI-local state for tasks (search, filters, sort, selection, view mode).
- Exposing setters to update filter/sort state which drive query keys.
- Providing React Query hooks to fetch tasks and perform CRUD operations.

---

## 2. Task Model

Key fields captured from Figma:

```ts
interface Task {
  id: string;
  title: string;
  description?: string;
  priority: "Urgent" | "High" | "Normal" | "Low";
  status: "To Do" | "In Progress" | "Done";
  dueDate?: string | null;
  assignees: string[];
  relatedEventName?: string | null;
  isPersonal?: boolean;
  subtasks?: Subtask[];
  attachments?: string[];
  isScheduled?: boolean;
  scheduleStart?: string | null;
  scheduleEnd?: string | null;
  isOverdue?: boolean;
  progress?: number;
  createdAt?: string;
  updatedAt?: string;
}
````

Dates are represented as ISO strings for transport and JSON compatibility.

---

## 3. Local Zustand State

`useTaskStore` contains:

* Selection/meta: `selectedTaskId`, `totalCount`, `showingCount`
* Search & quick filter: `searchKeyword`, `quickFilter`
* Sorting & view: `taskSortBy`, `taskSortDirection`, `viewMode`
* Advanced filters: `filterByStatus`, `filterByPriority`
* Toggles: `showCompletedTasks`, `showPersonalTasks`
* Setters for all of the above and a `setTaskFilters` convenience function

These are intentionally only UI/local states — fetched task arrays and loading/error are handled by React Query.

---

## 4. React Query Integration

Exported hooks:

* `useFetchTasks()` — returns `{ data, isLoading, isError }` for the task list.

  * The query key includes the current filter/sort/search values from the Zustand store, so changing filters triggers an automatic refetch.
* `useFetchTask(taskId)` — fetch single task (used for pre-filling edit form).
* `useCreateTask()` — mutation hook for creating tasks. On success: shows toast, invalidates `"tasks"` query, and closes modals via `useUiStore`.
* `useUpdateTask()` — mutation hook for updating tasks. On success: toast + invalidate + close modals.
* `useDeleteTask()` — mutation hook to delete.
* `useMarkTaskComplete()` — convenience mutation to toggle completion (status/progress).

All mutation hooks call `queryClient.invalidateQueries({ queryKey: ["tasks"] })` to keep the list in sync.

---

## 5. UX Flows & Interaction

* **Create Task:** Open Add Task modal (UI store) -> fill RHF+Zod form -> `useCreateTask().mutate(data)` -> onSuccess: toast, close modal, tasks refetch.
* **Edit Task:** Open Edit modal (UI store) with `selectedTaskId` -> prefetch via `useFetchTask()` -> edit -> `useUpdateTask().mutate({id, data})` -> onSuccess behavior same as create.
* **Delete / Mark Complete:** Trigger mutation, show toast on success, list refetches automatically.
* **Filters / Sorting / Search:** Update Zustand state via setters, React Query `useFetchTasks()` automatically refetches because the query key includes those values.

---

## 6. API Endpoints (Assumed)

* `GET /api/tasks` — list (accepts query params for search/filter/sort)
* `GET /api/tasks/:id` — single task
* `POST /api/tasks` — create
* `PUT /api/tasks/:id` — update
* `DELETE /api/tasks/:id` — delete

If backend uses different param names or pagination, update the query param mapping in `fetchTasksAPI`.

---

**Author / Owner:** UI-State & Forms (Lukjeab)
**Last updated:** 2025

```
