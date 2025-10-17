# Event Form (`EventForm.tsx`) — Design & Usage

This document describes the implementation, behavior, and usage of the **Event Form** component used in the **JAS39 Planner** application.
It follows a modular and validated approach using **React Hook Form + Zod**, integrates with **Zustand** for UI state, and uses **React Query-based hooks** for backend mutations and data fetching.

---

## 1. Purpose

`EventForm` provides a unified interface for creating and editing events.

**Core responsibilities:**

* Handle event data creation and update.
* Enforce validation using **Zod** (`eventSchema`).
* Manage modal lifecycle with `useUiStore`.
* Display inline error feedback.
* Support both **single-day** and **multi-day** events.
* Allow member selection (participants) via dynamic API call.

---

## 2. Event Model (Zod Schema)

```ts
interface EventFormData {
  title: string;             // Required, max 100 characters
  description?: string;      // Optional
  location?: string;         // Optional
  isMultiDay: boolean;       // Multi-day toggle
  startDate: string;         // Required
  endDate?: string;          // Optional if not multi-day
  startTime: string;         // Required
  endTime: string;           // Required
  color?: string;            // Optional event color
  coverImage?: string;       // Optional image URL
  participants?: string[];   // Optional participant IDs
}
```

**Validation rules:**

* `title`: required, must not exceed 100 characters.
* `startDate`: required.
* If `isMultiDay` is `true`, `endDate` must be **equal to or later than** `startDate`.
* `startTime` and `endTime`: required.
* Optional: `description`, `location`, `color`, `coverImage`, `participants`.

> 💡 Implemented via `zodResolver(eventSchema)` in React Hook Form.

---

## 3. Local State & Modal Control (Zustand)

`useUiStore` is used to manage modal visibility:

* **`closeAllModals()`** — called after successful submission or user cancellation.

No form values are stored in Zustand; all form inputs are managed internally by **React Hook Form**.

---

## 4. Server Integration (React Query Hooks)

The form interacts with backend mutations and queries using:

* `useFetchEvent(eventId)` — fetches existing event data (for edit mode).
* `useCreateEvent()` — mutation hook for creating new events.
* `useUpdateEvent()` — mutation hook for updating existing events.

**Submit flow:**

1. Validate form with Zod schema.
2. If mode = `"edit"` → call
   `updateMutation.mutateAsync({ id: eventId, data })`
   else → call `createMutation.mutateAsync(data)`.
3. On success:

   * Show toast success message.
   * Close modal (`closeAllModals()`).
   * Trigger optional `onSuccess` callback.
4. On failure:

   * Log error.
   * Show toast error message.
   * Keep form open for user correction.

---

## 5. Member & Participant Integration

Participants are dynamically loaded using `useMembers(eventId)` from `useMemberStore`.

**States handled:**

* `isLoading` → shows “Loading members…” message.
* `isError` → displays error message.
* `members` → mapped into dropdown options: `{ label: name, value: id }`.

Uses `<MultiSelect />` for participant selection:

```tsx
<MultiSelect
  values={watch("participants") || []}
  onChange={(val) => form.setValue("participants", val)}
  options={memberOptions}
/>
```

---

## 6. Form UI & Behavior

### Fields & Components

| Field            | Component              | Required   | Notes                                  |
| ---------------- | ---------------------- | ---------- | -------------------------------------- |
| Title            | `<Input>`              | ✅          | With error message on invalid input    |
| Location         | `<Input>`              | ❌          | Optional text                          |
| Multi-day toggle | `<Checkbox>`           | ❌          | Shows `endDate` only when checked      |
| Start/End Date   | `<Input type="date">`  | ✅/Optional | `endDate` visible only if `isMultiDay` |
| Start/End Time   | `<Input type="time">`  | ✅          | End time label changes dynamically     |
| Description      | `<Textarea>`           | ❌          | Multi-line input                       |
| Event Color      | `<Input type="color">` | ❌          | Default `#3B82F6`                      |
| Cover Image      | `<Input>`              | ❌          | Optional image URL                     |
| Participants     | `<MultiSelect>`        | ❌          | Dynamically loaded members             |

---

## 7. React Hook Form Integration

Main hooks and usage:

```ts
const form = useForm<EventFormData>({
  resolver: zodResolver(eventSchema),
  defaultValues: {
    title: "",
    description: "",
    location: "",
    isMultiDay: false,
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    color: "#3B82F6",
    coverImage: "",
    participants: [],
  },
});
```

**Key Hooks:**

* `register` — bind input fields.
* `watch("isMultiDay")` — control visibility of end-date/time fields.
* `handleSubmit` — wraps submit function.
* `reset` — preloads values in edit mode.
* `formState.errors` — field-level error handling.
* `formState.isSubmitting` — disables form during async submit.

---

## 8. Disabled State & Loading UI

A unified disabled state is computed as:

```ts
const isDisabled = isSubmitting || createMutation.isPending || updateMutation.isPending;
```

This disables:

* Inputs
* Buttons
* MultiSelect

to prevent duplicate submissions.

---

## 9. UX & Workflow Summary

| Mode       | Flow                                                       | Key Behavior           |
| ---------- | ---------------------------------------------------------- | ---------------------- |
| **Create** | Fill → Validate → Submit → Toast → Close modal             | Calls `createMutation` |
| **Edit**   | Fetch data → Prefill → Edit → Submit → Toast → Close modal | Calls `updateMutation` |
| **Cancel** | Closes modal instantly                                     | via `closeAllModals()` |

**Dynamic Behavior:**

* `End Date` appears only if `isMultiDay` = true.
* Inline error messages per field.
* Button labels switch between *"Create Event"* and *"Update Event"*.
* Toast notifications for both success and failure.

---

**Author / Maintainer:** UI-State & Forms (Lukjeab)
**Last updated:** October 2025

---

