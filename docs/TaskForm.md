# 📝 Task Form (`TaskForm.tsx`) — Design & Interaction

This document explains the `TaskForm` component, which manages task creation and editing.
The implementation combines **React Hook Form + Zod** validation, **Zustand** (`useUiStore`) for UI modals, and **React Query** hooks for backend integration.

---

## 1. Purpose

`TaskForm` allows users to:

* Create and update task data.
* Validate all input fields with Zod.
* Manage modal state via `useUiStore`.
* Integrate API mutations from `useTaskStore`.

---

## 2. Core Features

* Validation powered by `zodResolver(taskSchema)`.
* Support for both “Create” and “Edit” modes.
* Optional **subtask** management (dynamic list).
* Auto validation for schedule times and due dates.
* Toast feedback for user actions.

---

## 3. Controlled Form Fields

| Field              | Type        | Description                                       |
| ------------------ | ----------- | ------------------------------------------------- |
| `title`            | `string`    | Required task title                               |
| `description`      | `string?`   | Optional description                              |
| `priority`         | enum        | One of: `"Urgent"`, `"High"`, `"Normal"`, `"Low"` |
| `status`           | enum        | `"To Do"`, `"In Progress"`, `"Done"`              |
| `dueDate`          | `string?`   | Optional date (cannot be in the past)             |
| `assignees`        | `string[]`  | At least one required                             |
| `relatedEventName` | `string?`   | Optional link to an event                         |
| `isPersonal`       | `boolean`   | Mark as personal task                             |
| `isScheduled`      | `boolean`   | Enable start/end scheduling                       |
| `scheduleStart`    | `string?`   | Start datetime (if scheduled)                     |
| `scheduleEnd`      | `string?`   | Must be after `scheduleStart`                     |
| `subtasks`         | `Subtask[]` | Optional array of subtasks                        |
| `attachments`      | `string[]`  | Optional array of attachment URLs                 |

---

## 4. UX Flow

1. User opens form (modal).
2. Form validates inputs in real-time.
3. User submits → validated via Zod.
4. On success:

   * Toast success message.
   * Modal closes via `useUiStore.closeAllModals()`.
5. On error:

   * Inline field messages shown.
   * Toast error notification.

---

## 5. Key Hooks Used

```ts
useForm<TaskFormValues>({
  resolver: zodResolver(taskSchema),
});

const { fields, append, remove } = useFieldArray({ name: "subtasks" });
const isScheduled = watch("isScheduled");
```

* `Controller` — used for controlled selects (`priority`, `status`).
* `watch()` — tracks dynamic toggles like `isScheduled`.
* `reset()` — resets or preloads default values.

---

## 6. UI Composition

* **Inputs** → title, description, due date.
* **Selects** → priority & status (controlled via `Controller`).
* **Checkboxes** → toggles for personal & scheduled tasks.
* **Dynamic fields** → scheduleStart / scheduleEnd appear only when scheduled.
* **Subtasks** → optional, managed by `useFieldArray`.

---

**Author:** UI-State & Forms (Lukjeab)
**Last Updated:** 2025

---

