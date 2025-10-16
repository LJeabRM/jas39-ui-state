# uiStateIntegration.md

# UI-State & Forms Integration Guide

**Owner:** Lukjeab
**Repo:** LJeabRM/jas39-ui-state
**Goal:** Integrate local UI state (Zustand) and forms (React Hook Form + Zod) with server mutations for Event & Task management, ready to merge with main project.

---

## 1️⃣ Overview

This module provides:

* **Zustand stores** for local UI state:

  * Modal management (`useUiStore`)
  * Filters, selections, UI preferences
  * Event-specific local state (`useEventStore`)

* **React Hook Form + Zod** forms:

  * Event form (`EventForm.tsx`)
  * Task form (`TaskForm.tsx`) including personal & event-related tasks
  * Validation for multi-day events, scheduled tasks, subtasks, assignees, etc.

* **React Query integration** for server data:

  * Fetching, creating, updating, deleting events/tasks
  * Mutation success/error handling with `toast`
  * Zero state / loading / error handling

---

## 2️⃣ Stores

### **useUiStore**

* Manages modal open/close and global UI state
* Key actions:

  ```ts
  const openModal = useUiStore(s => s.openModal);
  const closeAllModals = useUiStore(s => s.closeAllModals);
  const setFilter = useUiStore(s => s.setFilter);
  ```
* Usage:

  * All forms call `closeAllModals()` after successful submit.
  * Modal state is centralized to reduce redundant re-renders.

### **useEventStore**

* Manages local state for events + React Query hooks
* Local state:

  ```ts
  selectedEventId: string | null
  searchKeyword: string
  eventSortBy: string
  filterByProgress: string[]
  filterByDate: string[]
  ```
* Actions:

  ```ts
  setSelectedEventId(id)
  setSearchKeyword(keyword)
  setEventSortBy(sort)
  setEventSortDirection(dir)
  setEventFilters(filters)
  ```
* Server-side hooks:

  ```ts
  useFetchEvents()
  useCreateEvent()
  useUpdateEvent()
  useDeleteEvent()
  ```

### **useTaskStore**

* Similar structure for tasks:

  * `useCreateTask`, `useUpdateTask`, `useDeleteTask`
  * Personal tasks auto-assign to current user (from `useAuth`)

---

## 3️⃣ Forms

### **EventForm**

* Controlled by `react-hook-form + zod`

* Fields: title, description, location, dates/times, multi-day, color, cover image, participants

* Validation:

  * Required fields
  * Multi-day date validation
  * Start/end time validation

* Flow:

  1. Fill form
  2. Validate via `zodResolver`
  3. Submit → call mutation (`createEvent` or `updateEvent`)
  4. Show toast (success/error)
  5. Close modal & reset form

* Example usage:

  ```tsx
  <EventForm mode="create" onSuccess={() => refetchEvents()} />
  ```

### **TaskForm**

* Fields: title, description, priority, status, assignees, dueDate, personal/scheduled flags, subtasks, attachments

* Event task → assignees = event members

* Personal task → assignees = current user only

* Dynamic subtasks using `useFieldArray`

* Scheduled tasks validate start/end datetime

* Example usage:

  ```tsx
  <TaskForm mode="create" eventId={selectedEventId} />
  <TaskForm mode="create" /> // personal task
  ```

---

## 4️⃣ Multi-Component Integration

**Flow: Event → Task**

1. Open Event modal (`useUiStore.openModal('eventForm')`)
2. Submit → `useCreateEvent` or `useUpdateEvent`
3. Close modal → reset form
4. Open Task form (`useUiStore.openModal('taskForm')`)
5. If `eventId` provided → fetch members for assignees
6. Personal task → auto-assign current user

**Selectors & Performance**

* `useEventStore` and `useUiStore` expose selectors to reduce unnecessary re-renders
* Example:

  ```ts
  const selectedEventId = useEventStore(s => s.selectedEventId);
  ```

---

## 5️⃣ Integration Tips

* **Current User**: Use `useAuth()` for personal tasks
* **Members**: Use `useMembers(eventId)` to populate assignees
* **Mutation Hooks**:

  ```ts
  const createEvent = useCreateEvent();
  await createEvent.mutateAsync(data);
  ```
* **UI Feedback**:

  * Use `react-hot-toast` for success/error messages
  * Reset forms & close modals after submission
* **Validation**:

  * All forms use Zod schemas
  * Ensure fields like dates, times, and multi-day rules are validated

---

## 6️⃣ Caveats / Known Issues

* Participants field may be empty if members API fails
* Focus management on modal open/close is incomplete
* Path alias / import naming must match main repo
* Accessibility (keyboard nav, aria labels) requires testing
* Ensure `queryKey` consistency in React Query to avoid stale cache

---

## 7️⃣ Recommended Next Steps

1. Test integration with main repo
2. Connect missing member APIs if needed
3. Implement focus management & accessibility improvements
4. Document usage of `useUiStore`, `useEventStore`, `useTaskStore` for new developers
5. Verify all forms, modals, and query hooks work in zero state/loading/error scenarios

---

## 8️⃣ Example Quick Start

```tsx
import { EventForm } from "@/features/events/forms/EventForm";
import { TaskForm } from "@/features/tasks/forms/TaskForm";

// Open modal and create an event
<EventForm mode="create" onSuccess={() => refetchEvents()} />

// Create personal task
<TaskForm mode="create" />

// Create event-related task
<TaskForm mode="create" eventId={selectedEventId} />
```

---
