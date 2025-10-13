# 🧭 UI State & Forms Usage Guide
> JAS39 Planner — UI-State & Forms Owner Documentation  
> Maintained by: Lukjeab  
> Technologies: Zustand + React Hook Form + Zod

---

## Overview

This document describes how **UI state** and **form logic** are structured and maintained across the JAS39 Planner project.  
It defines how to use the Zustand store (`useUiStore`), how to build and validate forms with **React Hook Form (RHF)** and **Zod**, and the standard UX behavior for submission and feedback.

---

## 🧩 1. UI State Management — `useUiStore`

All **client-side UI states** (not coming from the backend) are managed through a single Zustand store.  
These include modal visibility, active filters, current selections, and lightweight UI preferences (like theme or layout).

**Purpose**
- Control modal open/close states  
- Manage filter values (category, status, date range, etc.)  
- Track the currently selected event or task  
- Persist simple UI preferences (theme, view mode, sidebar collapse)

**Design Principles**
- Maintain one central store for UI-related state.  
- Keep each state field atomic (avoid deeply nested objects).  
- Access data via **selectors** `(s) => s.property` to prevent unnecessary re-renders.  
- Use descriptive and consistent action names (`setFilter`, `openEventModal`, `resetSelection`).  
- Do **not** store server-side data here — use **React Query** for that.

---

## 🧾 2. Forms — React Hook Form + Zod

All forms use **React Hook Form** for input state management and **Zod** for validation.  
Each feature (Event, Task, etc.) has its own schema and form component.

**Folder Structure**
```

src/features/events/forms/
src/features/tasks/forms/

```

**Implementation Pattern**
1. Define the schema using **Zod** (`eventSchema`, `taskSchema`).  
2. Use `zodResolver` to connect Zod with React Hook Form.  
3. Follow a consistent 3-step submission flow:  
   **Validate → Mutate → UX Response (toast + modal + reset)**  
4. After successful submission:  
   - Close the modal via `useUiStore`.  
   - Reset form fields.  
   - Display a success toast.  
   - Return focus to the trigger element for accessibility.  
5. Validation messages must always be clear and actionable.

---

## 🎛 3. Filters and Query State

UI filters live in Zustand and are included in the **React Query key**.  
When a filter changes, the query automatically refetches without manual invalidation.

**Guidelines**
- Keep filters lightweight (string, number, or small object).  
- Never mutate query data directly — let React Query handle it.  
- Provide a single store action to clear all filters (`clearFilters()`).

---

## 🧠 4. UX After Submission

After any successful create or edit:
- Show a loading indicator during submission.  
- Disable form inputs while mutating.  
- Display a toast notification on success or error.  
- Close the modal and reset the form state.  
- Automatically refresh displayed data via updated query keys.  
- Restore keyboard focus for accessibility continuity.

---

## 📘 5. Components

Reusable UI components related to state and form behavior are located under `src/components/ui/`.

| Component | Purpose |
|------------|----------|
| `ModalWrapper.tsx` | Provides modal layout and handles open/close logic. |
| `FilterBar.tsx` | Connects filter inputs with Zustand state. |
| `LoadingState.tsx` | Displays skeletons or spinners while loading. |
| `ErrorState.tsx` | Presents friendly error messages. |
| `ZeroState.tsx` | Shown when no data is available. |

All components are **stateless** and receive data through props or Zustand selectors.

---

## 🧱 6. File Summary

### 🗂️ Zustand Stores

| File | Description |
|------|--------------|
| `stores/useUiStore.ts` | Central UI state store (modals, filters, preferences) |
| `stores/useEventStore.ts` | Handles Event data (fetching, mutations, filters) — integrated with React Query |
| `stores/useTaskStore.ts` | (Planned) Handles Task data and local Task filters |
| `stores/types/uiTypes.ts` | Type definitions for UI-related Zustand stores |

---

### 🎨 Feature-Level Forms

| Path | Description |
|------|--------------|
| `features/events/forms/*` | Event creation/editing forms using RHF + Zod |
| `features/tasks/forms/*` | Task creation/editing forms using RHF + Zod |
| `features/calendar/*` | (Future) Calendar view and related local state hooks |

---

### 🧩 UI Components & Utilities

| Path | Description |
|------|--------------|
| `components/ui/ModalWrapper.tsx` | Modal layout and open/close handling |
| `components/ui/FilterBar.tsx` | Filter controls connected to Zustand |
| `components/ui/LoadingState.tsx` | Loading indicator or skeleton view |
| `components/ui/ErrorState.tsx` | Error feedback component |
| `components/ui/ZeroState.tsx` | Empty-state message display |
| `utils/focusManagement.ts` | Utility for focus transitions post-submit |
| `utils/formHelpers.ts` | Optional helper utilities for RHF + Zod integration |

---

### 🧭 Documentation

| File | Description |
|------|--------------|
| `docs/uiStateUsage.md` | Guide for managing UI state and form logic (this file) |
| `docs/useEventStore.md` | Event Store specification and API flow |
| `docs/useTaskStore.md` | (Planned) Task Store design document |

---

## 🪴 7. Best Practices

- Keep **UI state (Zustand)** separate from **server state (React Query)**.  
- Avoid storing fetched data in Zustand.  
- Keep stores small, focused, and well-named.  
- Avoid nested objects — prefer flat, atomic state design.  
- Co-locate Zod schemas next to their forms for easy maintenance.  
- Validation messages should guide users (e.g., “End date must be after start date”).  
- Update this documentation whenever a new shared pattern or hook is introduced.

---

## ✅ Flow Summary

```

User triggers action (e.g. “New Event”)
↓
useUiStore opens modal
↓
Modal renders form (RHF + Zod)
↓
Submit → validate → mutate → toast result
↓
Success → close modal → reset form → refresh query

```

---

### © 2025 JAS39 Event Planner — UI-State Module


---

### 🧩 Summary of Adjustments

* Reworded several headers to be parallel and consistent (e.g., *Design Rules → Design Principles*).
* Changed bullet points into structured **guidelines** instead of imperative sentences — more natural for technical docs.
* Added a short clarification for why certain rules matter (preventing re-renders, separation of concerns).
* Cleaned up extra blank lines for markdown rendering consistency.
* Kept tone professional but friendly — fits repo documentation.

---

