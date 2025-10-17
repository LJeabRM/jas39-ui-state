# 📘 Task Schema (`taskSchema.ts`) — Data Validation Rules

This document describes the **Zod schema** used to validate `TaskForm` fields in the **JAS39 Planner** app.

---

## 🧭 1. Purpose

The `taskSchema` ensures all task-related data submitted by users are **valid, consistent, and logic-safe**, including:

* Schedule validation (start/end time)
* Required assignees
* Optional subtasks & attachments

---

## 🗂️ 2. Schema Overview

### 🔍 TaskFormValues Structure

| Field              | Type / Example                              | Required | Description                                 |
| ------------------ | ------------------------------------------- | -------- | ------------------------------------------- |
| `title`            | `string` → `"Prepare mission briefing"`     | ✅ Yes    | Task name/title                             |
| `description`      | `string?` → `"Discuss flight plan details"` | ❌ No     | Optional notes or details                   |
| `priority`         | `"Urgent" \| "High" \| "Normal" \| "Low"`   | ✅ Yes    | Task importance level                       |
| `status`           | `"To Do" \| "In Progress" \| "Done"`        | ✅ Yes    | Current progress status                     |
| `dueDate`          | `string?` → `"2025-10-20"`                  | ❌ No     | Deadline date (optional, must not be past)  |
| `assignees`        | `string[]` → `["user123", "user456"]`       | ✅ Yes    | Assigned members’ IDs                       |
| `relatedEventName` | `string?` → `"Exercise Falcon"`             | ❌ No     | Optional link to event                      |
| `isPersonal`       | `boolean` → `false`                         | ✅ Yes    | Marks private tasks (no assignees required) |
| `isScheduled`      | `boolean` → `true`                          | ✅ Yes    | Enables time scheduling                     |
| `scheduleStart`    | `string?` → `"08:30"`                       | ❌ No     | Start time (24h format `HH:mm`)             |
| `scheduleEnd`      | `string?` → `"10:00"`                       | ❌ No     | End time (must ≥ start)                     |
| `subtasks`         | `Subtask[]`                                 | ❌ No     | Optional checklist items                    |
| `attachments`      | `string[]`                                  | ❌ No     | File URLs or names                          |

---

### 🔹 Interface Definition

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

## 🧩 3. Subtask Definition

| Field       | Type      | Required | Description                                        |
| ----------- | --------- | -------- | -------------------------------------------------- |
| `id`        | `string?` | ❌ No     | Optional unique ID                                 |
| `title`     | `string?` | ❌ No     | Optional subtask title (cannot be empty if filled) |
| `completed` | `boolean` | ✅ Yes    | Default `false`                                    |

```ts
interface Subtask {
  id?: string;
  title?: string;
  completed: boolean;
}
```

---

## ✅ 4. Validation Rules

| Field           | Rule / Condition                            | Message                                  |                                        |
| --------------- | ------------------------------------------- | ---------------------------------------- | -------------------------------------- |
| `title`         | Required, min(1)                            | `"Please enter a task title."`           |                                        |
| `priority`      | Required enum                               | `"Please select a priority."`            |                                        |
| `status`        | Required enum                               | `"Please select a status."`              |                                        |
| `dueDate`       | Optional, must be today or later            | `"Due date cannot be in the past."`      |                                        |
| `assignees`     | Array, must include ≥ 1 ID                  | `"Please select at least one assignee."` |                                        |
| `scheduleStart` | Must match regex `^([0-1]\d                 | 2[0-3]):[0-5]\d$`                        | `"Invalid start time format (HH:mm)."` |
| `scheduleEnd`   | Must ≥ `scheduleStart` if scheduled is true | `"End time must be after start time."`   |                                        |
| `subtasks`      | Defaults to `[]`                            | —                                        |                                        |
| `attachments`   | Defaults to `[]`                            | —                                        |                                        |

---

## ⚙️ 5. Business Logic

* A **task must have at least one assignee**, unless it’s marked as **personal** (`isPersonal = true`).
* **Time validation** applies only when `isScheduled = true`.
* `dueDate` is ignored when empty but validated if provided.
* `subtasks` and `attachments` are initialized as empty arrays (`[]`) by default.

---

## 🧩 6. Integration Example

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

## 🧾 7. Summary of Key Improvements

✅ Added **schema overview table** for clarity
✅ Added **regex validation** for `scheduleStart` and `scheduleEnd`
✅ Clarified **conditional validation** for `isScheduled`
✅ Explicit default values (`[]`, `false`, `null`)
✅ Updated documentation for `assignees` and time rules

---

**Author:** UI-State & Forms (Lukjeab)
**Last Updated:** 2025-10-17 ✅

---
