// src/features/events/forms/eventSchema.ts
import { z } from "zod";

export const eventSchema = z
  .object({
    title: z
      .string()
      .min(1, "Please fill out this field")
      .max(100, "Title is too long"),
    description: z.string().optional(),
    location: z.string().optional(),
    isMultiDay: z.boolean().default(false),
    startDate: z
      .string()
      .min(1, "Start date is required")
      .refine((val) => !isNaN(Date.parse(val)), "Invalid start date format"),
    endDate: z
      .string()
      .optional()
      .nullable()
      .refine(
        (val) => !val || !isNaN(Date.parse(val)),
        "Invalid end date format"
      ),
    startTime: z
      .string()
      .min(1, "Start time is required")
      .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
    endTime: z
      .string()
      .min(1, "End time is required")
      .regex(/^([0-1]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
    color: z
      .string()
      .optional()
      .regex(/^#([0-9A-F]{3}){1,2}$/i, "Invalid color code")
      .default("#3B82F6"),
    coverImage: z.string().optional().nullable(),
    participants: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      // check multi-day: endDate >= startDate
      if (data.isMultiDay && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be start date or later",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // check endTime > startTime if the day is the same
      if (!data.isMultiDay) {
        const start = new Date(`1970-01-01T${data.startTime}:00`);
        const end = new Date(`1970-01-01T${data.endTime}:00`);
        return end > start;
      }
      return true;
    },
    {
      message: "End time must be after start time",
      path: ["endTime"],
    }
  );

export type EventFormValues = z.infer<typeof eventSchema>;
