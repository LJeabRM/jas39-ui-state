// src/features/tasks/forms/taskSchema.ts
import { z } from "zod";

export const subtaskSchema = z.object({
  id: z.string().optional(),
  title: z
    .string()
    .trim()
    .optional()
    .refine((val) => !val || val.length > 0, {
      message: "Subtask name cannot be empty.",
    }),
  completed: z.boolean().default(false),
});

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, "Please enter a task title.")
    .trim(),
  description: z.string().optional(),
  priority: z.enum(["Urgent", "High", "Normal", "Low"], {
    required_error: "Please select a priority.",
  }),
  status: z.enum(["To Do", "In Progress", "Done"], {
    required_error: "Please select a status.",
  }),
  dueDate: z
    .string()
    .nullable()
    .optional()
    .refine(
      (date) => !date || new Date(date) >= new Date(),
      "Due date cannot be in the past."
    ),
  assignees: z
    .array(z.string())
    .min(1, "Please select at least one assignee."),
  relatedEventName: z.string().nullable().optional(),
  isPersonal: z.boolean().default(false),
  isScheduled: z.boolean().default(false),
  scheduleStart: z.string().nullable().optional(),
  scheduleEnd: z
    .string()
    .nullable()
    .optional()
    .refine(
      (end, ctx) => {
        const { scheduleStart, isScheduled } = ctx.parent;
        if (!isScheduled || !end || !scheduleStart) return true;
        return new Date(end) >= new Date(scheduleStart);
      },
      { message: "End time must be after start time." }
    ),
  // ✅ default to [] ensures stability
  subtasks: z.array(subtaskSchema).default([]).optional(),
  attachments: z.array(z.string()).default([]).optional(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
