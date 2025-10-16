# 📘 Task Schema (`taskSchema.ts`) — Data Validation Rules

This document describes the **Zod schema** used to validate `TaskForm` fields in the JAS39 Planner app.

---

## 1. Purpose

The `taskSchema` ensures all task-related data submitted by users are valid and consistent with business logic, including scheduling and optional subtasks.

---

## 2. Schema Overview

```ts
interface TaskFormValues {
  title: string;
  description?: string;
  priority: "Urgent" | "High" | "Normal" | "Low";
  status: "To Do" | "In Progress" | "Done";
  dueDate?: string | null;
  assignees: string[];
  relatedEventName?: string | null;
  isPersonal: boolean;
  isScheduled: boolean;
  scheduleStart?: string | null;
  scheduleEnd?: string | null;
  subtasks?: Subtask[];
  attachments?: string[];
}
```

---

## 3. Subtask Definition

```ts
interface Subtask {
  id?: string;
  title?: string;
  completed: boolean;
}
```

* Optional subtasks.
* Validation: If `title` exists, it must not be empty.
* Default empty array `[]` ensures schema stability when no subtasks are added.

---

## 4. Validation Rules

| Field         | Rule                                   | Message                                |
| ------------- | -------------------------------------- | -------------------------------------- |
| `title`       | Required, min(1)                       | `"Please enter a task title."`         |
| `priority`    | Enum                                   | `"Please select a priority."`          |
| `status`      | Enum                                   | `"Please select a status."`            |
| `dueDate`     | Optional, must be ≥ today              | `"Due date cannot be in the past."`    |
| `scheduleEnd` | Must be ≥ `scheduleStart` if scheduled | `"End time must be after start time."` |

---

## 5. Business Logic

* Tasks **must have at least one assignee**.
* Subtasks are **optional** and can be empty.
* Schedules are validated only when `isScheduled` is `true`.
* Default arrays (`subtasks`, `attachments`) prevent uncontrolled form errors.

---

## 6. Integration Example

```ts
const form = useForm<TaskFormValues>({
  resolver: zodResolver(taskSchema),
  defaultValues: { isScheduled: false, isPersonal: false },
});
```

---

**Author:** UI-State & Forms (Lukjeab)
**Last Updated:** 2025

---
