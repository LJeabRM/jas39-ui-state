# 📝 Task Form (`TaskForm.tsx`) — Design & Interaction

This document explains the `TaskForm` component, which manages **task creation and editing**.
It uses **React Hook Form + Zod** for validation, **Zustand** for UI and API state management, and **React Query**-style mutations for backend operations.

---

## 1. Purpose

`TaskForm` enables users to:

* Create or update tasks within or outside an event.
* Validate all input fields using `taskSchema` (Zod).
* Handle modal lifecycle via `useUiStore`.
* Connect to backend mutation hooks from `useTaskStore`.

---

## 2. Core Features

* Zod-based validation (`zodResolver(taskSchema)`).
* Supports **Create** and **Edit** modes.
* Dynamically manages **subtasks** via `useFieldArray`.
* Conditional scheduling with start/end datetime.
* Integration with `useAuth` to assign tasks to the current user.
* Toast feedback for both success and error states.

---

## 3. Controlled Form Fields

| Field              | Type        | Description                                                            |
| ------------------ | ----------- | ---------------------------------------------------------------------- |
| `title`            | `string`    | **Required** — Task name.                                              |
| `description`      | `string?`   | Optional task details.                                                 |
| `priority`         | enum        | One of: `"Urgent"`, `"High"`, `"Normal"`, `"Low"`.                     |
| `status`           | enum        | One of: `"To Do"`, `"In Progress"`, `"Done"`.                          |
| `dueDate`          | `string?`   | Optional — Must be a valid date.                                       |
| `assignees`        | `string[]`  | Optional — Selected only if the task is part of an event.              |
| `relatedEventName` | `string?`   | Optional — For linking to an event title.                              |
| `isPersonal`       | `boolean`   | Marks task as personal (default `true` when no `eventId`).             |
| `isScheduled`      | `boolean`   | Enables scheduling section (shows start/end datetime fields).          |
| `scheduleStart`    | `string?`   | Required if `isScheduled = true` — must be valid datetime.             |
| `scheduleEnd`      | `string?`   | Required if `isScheduled = true` — must be after `scheduleStart`.      |
| `subtasks`         | `Subtask[]` | Optional — dynamically managed list with `title` and `completed` flag. |
| `attachments`      | `string[]`  | Optional — URLs or file references (not yet rendered in UI).           |

---

## 4. UX Flow

1. Form initializes with default or provided values.
2. If `eventId` exists → fetches members via `useMembers(eventId)`.
3. If marked as **personal task** → auto-assigns to the current logged-in user (`useAuth().user.id`).
4. User fills required fields, Zod validates instantly.
5. On submit:

   * `createTask.mutateAsync()` or `updateTask.mutateAsync()` is called.
   * On success → shows toast, closes modal, and resets form.
   * On error → displays toast + inline validation messages.

---

## 5. Key Hooks & Stores Used

```ts
const { user } = useAuth();              // current user
const closeModal = useUiStore(...);      // close all modals
const createTask = useCreateTask();      // create mutation
const updateTask = useUpdateTask();      // update mutation
const { data: members } = useMembers();  // fetch event members

const { control, register, handleSubmit, watch, reset } = useForm<TaskFormValues>({
  resolver: zodResolver(taskSchema),
});
```

* `Controller` — manages controlled fields like `priority` and `status`.
* `useFieldArray` — adds/removes subtasks dynamically.
* `watch()` — observes `isPersonal` and `isScheduled` for conditional rendering.
* `reset()` — reinitializes form on toggle or after submit.

---

## 6. UI Composition

| UI Element              | Description                                                                                 |
| ----------------------- | ------------------------------------------------------------------------------------------- |
| **Title & Description** | Text input and textarea for core content.                                                   |
| **Priority / Status**   | Controlled selects with options defined in component.                                       |
| **Assignees**           | Shown only if task is **not personal** and event members are available (via `MultiSelect`). |
| **Due Date**            | Optional date input.                                                                        |
| **Checkboxes**          | `Personal Task` and `Schedule Task` toggles.                                                |
| **Schedule Section**    | Appears when `isScheduled` = true, includes `scheduleStart` and `scheduleEnd`.              |
| **Subtasks Section**    | Uses `useFieldArray` to dynamically add/remove subtasks.                                    |
| **Buttons**             | Submit (`Create`/`Update`) and Cancel (`closeModal`).                                       |

---

## 7. Submission Logic

```ts
const onSubmit = async (data: TaskFormValues) => {
  if (isPersonal || !eventId) {
    data.assignees = currentUserId ? [currentUserId] : [];
  }

  if (mode === "create") {
    await createTask.mutateAsync(data);
    toast.success("Task created successfully");
  } else if (mode === "edit" && taskId) {
    await updateTask.mutateAsync({ id: taskId, data });
    toast.success("Task updated successfully");
  }

  reset();
  closeModal();
};
```

* Automatically assigns personal tasks to the current user.
* Differentiates between “create” and “edit” actions.
* Provides real-time toast feedback.

---

## 8. Error & Loading Handling

* Inline field errors from `react-hook-form` → displayed below inputs.
* Member loading states:

  * `Loading members...`
  * `Failed to load members`
* Submission errors trigger a toast:
  🔴 `"Failed to save task"`

---

**Author:** UI-State & Forms (Lukjeab)
**Last Updated:** October 2025

---
