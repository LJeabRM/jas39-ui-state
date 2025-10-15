# Event Form (`EventForm.tsx`) — Design & Usage

This document explains the structure and usage of the Event Form component for JAS39 Planner.
The implementation pattern uses **React Hook Form + Zod** for form handling and validation, integrated with **Zustand** (`useUiStore`) for modal management and **React Query hooks** (`useCreateEvent`, `useUpdateEvent`, `useFetchEvent`) for server-side operations.

---

## 1. Purpose

`EventForm` is responsible for:

* Providing a form interface for creating and editing events.
* Handling all validation rules via **Zod**.
* Managing modal lifecycle using `useUiStore`.
* Connecting form submission to server mutations (`create` / `update`) with toast feedback.
* Supporting both single-day and multi-day events.

---

## 2. Event Model (Form Schema)

Key fields in `eventSchema`:

```ts
interface EventFormData {
  title: string;             // Required, max 100 chars
  description?: string;       // Optional
  location?: string;          // Optional
  isMultiDay: boolean;        // Multi-day toggle
  startDate: string;          // Required, ISO date string
  endDate?: string;           // Optional for multi-day events
  startTime: string;          // Required
  endTime: string;            // Required
  color?: string;             // Optional event color
  coverImage?: string;        // Optional cover image URL
  participants?: string[];    // Optional list of participant IDs
}
```

**Validation rules:**

* `title` is required and max 100 characters.
* `startDate` is required; if `isMultiDay` is true, `endDate` must be ≥ `startDate`.
* `startTime` and `endTime` are required.
* Optional fields: `description`, `location`, `color`, `coverImage`, `participants`.

---

## 3. Local UI State (Zustand)

Uses `useUiStore` for modal management:

* `closeAllModals()` — closes the event modal after submit or cancel.
* `openModal()` / other UI toggles can be used for other components in the same form context.

No other form state is stored in Zustand; local form values are fully handled by React Hook Form.

---

## 4. React Query Integration

Exported hooks and usage:

* `useFetchEvent(eventId)` — fetches event data for pre-filling the form in edit mode.
* `useCreateEvent()` — mutation for creating a new event.
* `useUpdateEvent()` — mutation for updating an existing event.

**Behavior on submit:**

1. Validate form with `zodResolver(eventSchema)`.
2. Call either `createMutation.mutateAsync(data)` or `updateMutation.mutateAsync({id, data})`.
3. On success:

   * Show toast success message.
   * Close modal (`useUiStore.closeAllModals()`).
   * Reset form and trigger optional `onSuccess` callback.
4. On error:

   * Show toast error message.
   * Keep form open for corrections.

---

## 5. UX Flows & Interaction

* **Create Event:**
  Open modal → fill form → validate → submit → toast success → close modal → refresh event list.

* **Edit Event:**
  Open modal → fetch existing event → prefill form → edit → validate → submit → toast success → close modal → refresh list.

* **Form features:**

  * Dynamic fields (`endDate`, `endTime`) visible only when `isMultiDay` is checked.
  * Disabled state during submission prevents duplicate requests.
  * Error messages displayed inline per field.
  * Participants selection currently uses a static list (`John, Alice, Sara`) — planned for dynamic integration.

---

## 6. Component Structure

**Main elements:**

* `Input` — text, date, time, color fields.
* `Textarea` — event description.
* `Checkbox` — toggle multi-day event.
* `MultiSelect` — participants selection.
* `Button` — cancel / submit with loading states.

**React Hook Form hooks used:**

* `register` — bind inputs to form state.
* `watch` — track `isMultiDay` toggle.
* `handleSubmit` — handle validation and submission.
* `reset` — prefill data in edit mode or clear after submission.
* `formState` — access errors and `isSubmitting`.

---

## 7. Next Improvements / TODO

* Fetch participants dynamically from API instead of hard-coded values.
* Improve accessibility (keyboard navigation, focus management).
* Add UX polish after submission (focus reset, animations).
* Mirror this pattern for `TaskForm.tsx` with `taskSchema.ts`.

---

**Author / Owner:** UI-State & Forms (Lukjeab)
**Last updated:** 2025

---
