# 🧩 Event Schema (`eventSchema.ts`) — Validation Rules & Usage

This document explains the validation schema used for the **Event Form** in the **JAS39 Planner** project.
It uses **Zod** to enforce strict, type-safe validation integrated with **React Hook Form**.

---

## 1. Purpose

The `eventSchema` defines all validation and business rules for event creation and editing.
It ensures that user input — including dates, times, colors, and optional fields — is always valid before submission.

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

## 3. Field Validation Rules

| Field              | Type             | Required | Validation Rules                                                                          |                      |
| ------------------ | ---------------- | -------- | ----------------------------------------------------------------------------------------- | -------------------- |
| **`title`**        | `string`         | ✅        | Min length: 1, Max length: 100 → `"Please fill out this field"`, `"Title is too long"`    |                      |
| **`description`**  | `string`         | ❌        | Optional                                                                                  |                      |
| **`location`**     | `string`         | ❌        | Optional                                                                                  |                      |
| **`isMultiDay`**   | `boolean`        | ✅        | Default: `false`                                                                          |                      |
| **`startDate`**    | `string`         | ✅        | Required, must be a **valid date** (`Date.parse()` must succeed)                          |                      |
| **`endDate`**      | `string \| null` | ❌        | Optional; must be a valid date if provided. If `isMultiDay = true`, must be ≥ `startDate` |                      |
| **`startTime`**    | `string`         | ✅        | Required, must match 24h format `HH:mm` (regex: `^([0-1]\d                                | 2[0-3]):([0-5]\d)$`) |
| **`endTime`**      | `string`         | ✅        | Required, same regex as `startTime`; if not multi-day, must be **later than `startTime`** |                      |
| **`color`**        | `string`         | ❌        | Optional HEX color code (`#RGB` or `#RRGGBB`), default `#3B82F6`                          |                      |
| **`coverImage`**   | `string \| null` | ❌        | Optional string or null                                                                   |                      |
| **`participants`** | `string[]`       | ❌        | Optional array of participant IDs                                                         |                      |

---

## 4. Refinements & Business Logic

The schema includes **two main `refine()` checks** to enforce business logic:

1. **End Date Validation**

   ```ts
   if (data.isMultiDay && data.endDate) {
     return new Date(data.endDate) >= new Date(data.startDate);
   }
   ```

   * Ensures that when `isMultiDay` is enabled, the `endDate` cannot be earlier than `startDate`.
   * Error message: `"End date must be start date or later"`
   * Applied to path: `["endDate"]`

2. **End Time Validation (Single-Day Events)**

   ```ts
   if (!data.isMultiDay) {
     const start = new Date(`1970-01-01T${data.startTime}:00`);
     const end = new Date(`1970-01-01T${data.endTime}:00`);
     return end > start;
   }
   ```

   * Ensures `endTime` is strictly after `startTime` when `isMultiDay` is `false`.
   * Error message: `"End time must be after start time"`
   * Applied to path: `["endTime"]`

---

## 5. Default Values

| Field        | Default Value                                             |
| ------------ | --------------------------------------------------------- |
| `isMultiDay` | `false`                                                   |
| `color`      | `#3B82F6`                                                 |
| Others       | Not pre-filled; handled in `EventForm.tsx` default values |

---

## 6. Integration Example

In `EventForm.tsx`, this schema is used with **React Hook Form** through `zodResolver`:

```ts
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { eventSchema, EventFormValues } from "./eventSchema";

const form = useForm<EventFormValues>({
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

---

## 7. Error Messages Summary

| Field       | Error Message                                                                                    |
| ----------- | ------------------------------------------------------------------------------------------------ |
| `title`     | `"Please fill out this field"`, `"Title is too long"`                                            |
| `startDate` | `"Start date is required"`, `"Invalid start date format"`                                        |
| `endDate`   | `"Invalid end date format"`, `"End date must be start date or later"`                            |
| `startTime` | `"Start time is required"`, `"Invalid time format (HH:mm)"`                                      |
| `endTime`   | `"End time is required"`, `"Invalid time format (HH:mm)"`, `"End time must be after start time"` |
| `color`     | `"Invalid color code"`                                                                           |

---

## 8. Design Notes

* Fully compatible with both **create** and **edit** modes.
* Prevents invalid or conflicting time/date combinations.
* Uses simple regex validation to keep client-side logic lightweight.
* Supports nullable fields (`endDate`, `coverImage`) for better backend compatibility.

---

**Author:** UI-State & Forms (Lukjeab)
**Last Updated:** October 2025

---

