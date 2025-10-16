# 🧩 Event Schema (`eventSchema.ts`) — Validation Rules & Usage

This document describes the validation schema used for **Event Form** in the JAS39 Planner project.
It uses **Zod** for type-safe schema validation integrated with **React Hook Form**.

---

## 1. Purpose

The `eventSchema` defines strict validation rules for event creation and editing forms.
It ensures that event data submitted from the UI adheres to business rules such as valid dates, time order, and optional fields.

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

* `endDate >= startDate` only when `isMultiDay` is `true`.
* For single-day events, `endTime` must be later than `startTime`.
* All date and time values must follow ISO formats.

---

## 5. Integration in Form

Used inside `EventForm.tsx` via:

```ts
const form = useForm<EventFormValues>({
  resolver: zodResolver(eventSchema),
});
```

---

## 6. Notes

* Designed to prevent invalid scheduling conflicts.
* Can be shared across backend validation or API layers.
* Works seamlessly with `useCreateEvent` and `useUpdateEvent` hooks.

**Author:** UI-State & Forms (Lukjeab)
**Last Updated:** 2025

---
