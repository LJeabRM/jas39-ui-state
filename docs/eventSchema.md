# 🧩 Event Schema (`eventSchema.ts`) — Validation Rules & Usage

This document describes the validation schema used for **Event Form** in the **JAS39 Planner** project.
It uses **Zod** for type-safe schema validation integrated with **React Hook Form**.

---

## 1. Purpose

The `eventSchema` enforces strict validation rules for event creation and editing forms.
It ensures that user input follows consistent business logic, valid date/time formats, and correct dependencies between fields.

---

## 2. Event Schema Definition

```ts
interface EventFormValues {
  title: string;
  description?: string;
  location?: string;
  isMultiDay: boolean;
  startDate: string;
  endDate?: string | null;
  startTime: string;
  endTime: string;
  color?: string;
  coverImage?: string | null;
  participants?: string[];
}
```

---

## 3. Validation Rules

| Field          | Type             | Required | Validation                                              |
| -------------- | ---------------- | -------- | ------------------------------------------------------- |
| `title`        | `string`         | ✅        | Min 1 char, max 100 chars                               |
| `description`  | `string`         | ❌        | Optional                                                |
| `location`     | `string`         | ❌        | Optional                                                |
| `isMultiDay`   | `boolean`        | ✅        | Default `false`                                         |
| `startDate`    | `string`         | ✅        | Must be valid date                                      |
| `endDate`      | `string \| null` | ❌        | Must be valid date and ≥ `startDate` if multi-day       |
| `startTime`    | `string`         | ✅        | Format `HH:mm`                                          |
| `endTime`      | `string`         | ✅        | Format `HH:mm`, must be after `startTime` if single day |
| `color`        | `string`         | ❌        | HEX format (default: `#3B82F6`)                         |
| `coverImage`   | `string`         | ❌        | Optional URL                                            |
| `participants` | `string[]`       | ❌        | Optional array of IDs                                   |

---

## 4. Refinements & Business Logic

The schema includes custom **refinements** to enforce logical consistency beyond basic field validation:

### 🗓️ Date Refinement

```ts
if (data.isMultiDay && data.endDate) {
  return new Date(data.endDate) >= new Date(data.startDate);
}
```

> Ensures `endDate` is the same or later than `startDate` when `isMultiDay` is enabled.
> Otherwise, the error message shown is:
> **"End date must be start date or later"**

---

### ⏰ Time Refinement

```ts
if (!data.isMultiDay) {
  const start = new Date(`1970-01-01T${data.startTime}:00`);
  const end = new Date(`1970-01-01T${data.endTime}:00`);
  return end > start;
}
```

> Ensures `endTime` occurs after `startTime` when it’s a single-day event.
> Otherwise, the error message shown is:
> **"End time must be after start time"**

---

### 🧾 Regex & Parsing Details

| Field                  | Validation Method                                 | Notes                                      |                                     |
| ---------------------- | ------------------------------------------------- | ------------------------------------------ | ----------------------------------- |
| `startDate`, `endDate` | `Date.parse(val)`                                 | Rejects invalid or unparsable date strings |                                     |
| `startTime`, `endTime` | Regex: `^([0-1]\d                                 | 2[0-3]):([0-5]\d)$`                        | Must match **24-hour format HH:mm** |
| `color`                | Regex: `^#([0-9A-F]{3}){1,2}$` (case-insensitive) | Only allows valid HEX color codes          |                                     |

---

## 5. Integration in Form

The schema is used in the event creation/edit form via **React Hook Form** and **Zod Resolver**:

```ts
const form = useForm<EventFormValues>({
  resolver: zodResolver(eventSchema),
});
```

This ensures real-time validation feedback during user input and consistent typing across form components.

---

## 6. Notes

* Prevents invalid scheduling (e.g., end time before start time).
* Fully type-safe and can be reused in backend validation.
* Compatible with React Query hooks (`useCreateEvent`, `useUpdateEvent`).
* Defaults and optional fields are pre-handled (`isMultiDay = false`, `color = #3B82F6`).

---

**Author:** UI-State & Forms (Lukjeab)
**Last Updated:** October 2025

---
