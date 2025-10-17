# 📘 Task Schema (`taskSchema.ts`) — Data Validation Rules

This document describes the **Zod schema** used to validate `TaskForm` fields in the JAS39 Planner app.

---

## 1. Purpose

The `taskSchema` ensures all task-related data submitted by users are **valid, consistent, and logic-safe**, including schedule validation, assignee requirements, and optional subtasks.

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

✅ **Validation details**

* `title` is optional, but if provided, it must not be an empty string.
* `completed` defaults to `false`.
* The parent `subtasks` field defaults to `[]`, preventing `undefined` array errors in forms.

---

## 4. Validation Rules

| Field         | Rule & Condition                                    | Message                                  |
| ------------- | --------------------------------------------------- | ---------------------------------------- |
| `title`       | Required, min(1)                                    | `"Please enter a task title."`           |
| `priority`    | Required enum                                       | `"Please select a priority."`            |
| `status`      | Required enum                                       | `"Please select a status."`              |
| `dueDate`     | Optional, must be today or later                    | `"Due date cannot be in the past."`      |
| `assignees`   | Array, must include at least one ID                 | `"Please select at least one assignee."` |
| `scheduleEnd` | Must be ≥ `scheduleStart` when scheduled is enabled | `"End time must be after start time."`   |
| `subtasks`    | Defaults to `[]` (optional)                         | —                                        |
| `attachments` | Defaults to `[]` (optional)                         | —                                        |

---

## 5. Business Logic

* A **task must have at least one assignee** unless marked as personal (handled in `TaskForm` logic).
* **Scheduling** validation (`scheduleStart`, `scheduleEnd`) only applies when `isScheduled` = `true`.
* `dueDate` is ignored if not provided but must not be in the past if filled.
* Empty subtasks or attachments will automatically be initialized as `[]`.

---

## 6. Integration Example

```ts
const form = useForm<TaskFormValues>({
  resolver: zodResolver(taskSchema),
  defaultValues: {
    isScheduled: false,
    isPersonal: false,
    subtasks: [],
    attachments: [],
  },
});
```

---

✅ **Summary of Key Improvements**

* Added missing `assignees` rule to table.
* Clarified conditional validation for `isScheduled`.
* Matched exact default behaviors (`default([])` for arrays).
* Confirmed that `dueDate` uses `.refine()` and supports `nullable`.

---

**Author:** UI-State & Forms (Lukjeab)
**Last Updated:** 2025-10-17 ✅

---
