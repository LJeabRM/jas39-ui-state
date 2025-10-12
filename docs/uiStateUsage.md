# 🧭 UI State & Forms Usage Guide
> JAS39 Planner — UI-State & Forms Owner Documentation  
> Maintained by: Lukjeab  
> Technologies: Zustand + React Hook Form + Zod

---

## Overview

This document outlines how **UI state** and **form logic** are structured in this project.  
It defines how to use the Zustand store (`useUiStore`), how to build forms using React Hook Form (RHF) with Zod validation, and the standard flow for form submission and user experience (UX).

---

## 🧩 1. UI State Management — `useUiStore`

All **local UI states** (not from the server) are managed by Zustand.  
These states include modal visibility, active filters, current selections, and small UI preferences (like theme or layout).

**Purpose:**
- Manage modal open/close states  
- Manage filter values (category, status, date range, etc.)  
- Store currently selected event or task  
- Keep simple UI preferences (e.g., compact mode, theme)  

**Design Rules:**
- One central `useUiStore` should manage all UI state.  
- Each state value should be atomic (separate fields, not nested objects).  
- Access store data via **selectors** `(s) => s.property` to minimize re-renders.  
- Use descriptive setter names (e.g., `setFilter`, `openEventModal`, `resetSelection`).  
- Do not store backend data (that belongs to React Query).  

---

## 🧾 2. Forms — React Hook Form + Zod

All forms use **React Hook Form (RHF)** for input state and **Zod** for schema validation.  
Each feature (Event, Task, etc.) has its own schema and form component.  

**Folder Structure**
```

src/features/events/forms/
src/features/tasks/forms/

```

**Pattern**
1. Define schema using **Zod** (`eventSchema`, `taskSchema`).  
2. Use `zodResolver` with RHF for validation.  
3. Handle form submission in three stages:  
   - **Validate → Mutate → UX Response (toast + modal + reset)**  
4. After successful submission:  
   - Close the modal via `useUiStore`.  
   - Reset form fields.  
   - Show success toast.  
   - Focus back to trigger element if needed.  
5. Error states should always include actionable messages.

---

## 🎛 3. Filters and Query State

UI filters are stored in Zustand and passed as part of the **React Query key**.  
When a filter changes, the query automatically refetches with the new key.  
Manual invalidation of queries is unnecessary.

**Principles**
- Keep filters lightweight (string, number, or small object).  
- Never mutate query data directly.  
- Allow clear reset of filters via one store action.

---

## 🧠 4. UX After Submission

After any successful create or edit:
- Show a loading spinner while submitting.  
- Disable input elements during mutation.  
- Show success toast on completion.  
- Close the modal and reset the form.  
- Automatically refresh displayed data through query key updates.  
- Restore focus to the user’s previous element for accessibility.

---

## 📘 5. Components

Reusable UI components related to state and form handling live under `src/components/ui/`.

| Component | Purpose |
|------------|----------|
| `ModalWrapper.tsx` | Handles modal structure and open/close logic |
| `FilterBar.tsx` | Connects UI filter controls to Zustand |
| `LoadingState.tsx` | Loading indicator or skeleton placeholder |
| `ErrorState.tsx` | User-friendly error display |
| `ZeroState.tsx` | Displayed when no data is available |

All of these components are **stateless** and receive data via props or Zustand selectors.

---

## 🧱 6. File Summary

| File | Description |
|------|--------------|
| `stores/useUiStore.ts` | Main Zustand store for UI state |
| `stores/types/uiTypes.ts` | Type definitions for UI store |
| `features/events/forms/*` | Event form logic and schema |
| `features/tasks/forms/*` | Task form logic and schema |
| `components/ui/*` | Reusable UI components |
| `utils/focusManagement.ts` | Helper for managing focus transitions |
| `utils/formHelpers.ts` | (Optional) Utilities for form integration |
| `docs/uiStateUsage.md` | This documentation |

---

## 🪴 7. Best Practices

- Separate **UI state** (Zustand) from **server data state** (React Query).  
- Keep Zustand stores small and feature-focused.  
- Avoid deep object nesting inside stores.  
- Use descriptive action names for clarity.  
- Use Zod schemas co-located with their form components.  
- Error messages should guide users clearly (“End date must be after start date”).  
- Document every new pattern or shared hook in this file for consistency.  

---

## ✅ Flow Summary

```

User triggers action (e.g., “New Event”)
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
```


