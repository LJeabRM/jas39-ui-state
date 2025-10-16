// src/features/tasks/forms/TaskForm.tsx
import React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useUiStore } from "@/stores/useUiStore";
import { useCreateTask, useUpdateTask } from "@/stores/useTaskStore";
import { useMembers } from "@/stores/useMemberStore";
import { taskSchema, TaskFormValues } from "./taskSchema";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { MultiSelect } from "@/components/ui/MultiSelect";

// Interface for TaskForm props
interface TaskFormProps {
  mode: "create" | "edit";
  defaultValues?: Partial<TaskFormValues>;
  taskId?: string;
  eventId?: string; // optional for event-related task
}

// Replace this with your actual auth hook/context
import { useAuth } from "@/stores/useAuth"; 

export const TaskForm: React.FC<TaskFormProps> = ({ mode, defaultValues, taskId, eventId }) => {
  const closeModal = useUiStore((s) => s.closeAllModals);
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();

  // Get current user ID from authentication
  const { user } = useAuth(); // assuming your auth store provides `user.id`
  const currentUserId = user?.id;

  // Fetch event members if eventId exists
  const { data: members = [], isLoading: membersLoading, isError: membersError } = useMembers(eventId);

  // Initialize form
  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "Normal",
      status: "To Do",
      dueDate: "",
      assignees: [],
      relatedEventName: "",
      isPersonal: !eventId, // default to personal if no event
      isScheduled: false,
      scheduleStart: "",
      scheduleEnd: "",
      subtasks: [],
      attachments: [],
      ...defaultValues,
    },
  });

  // Manage subtasks dynamically
  const { fields, append, remove } = useFieldArray({ control, name: "subtasks" });

  const isScheduled = watch("isScheduled");
  const isPersonal = watch("isPersonal");

  // Handle form submission
  const onSubmit = async (data: TaskFormValues) => {
    try {
      // If personal task or no event, assign to current user only
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
    } catch (err) {
      console.error(err);
      toast.error("Failed to save task");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4">
      {/* Task title */}
      <div>
        <Label>Task Title *</Label>
        <Input {...register("title")} placeholder="Enter task title" />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
      </div>

      {/* Task description */}
      <div>
        <Label>Description</Label>
        <Textarea {...register("description")} placeholder="Add description..." rows={3} />
      </div>

      {/* Priority and status selection */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label>Priority *</Label>
          <Controller
            name="priority"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Urgent">Urgent</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Normal">Normal</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.priority && <p className="text-red-500 text-sm mt-1">{errors.priority.message}</p>}
        </div>

        <div>
          <Label>Status *</Label>
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="To Do">To Do</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Done">Done</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.status && <p className="text-red-500 text-sm mt-1">{errors.status.message}</p>}
        </div>
      </div>

      {/* Assignees selection (only for event tasks) */}
      {!isPersonal && (
        <div>
          <Label>Assignees</Label>
          {membersLoading ? (
            <p>Loading members...</p>
          ) : membersError ? (
            <p className="text-red-500 text-sm">Failed to load members</p>
          ) : (
            <MultiSelect
              values={watch("assignees") || []}
              onChange={(val) => setValue("assignees", val)}
              options={members.map((m) => ({ label: m.name, value: m.id }))}
              placeholder="Select assignees"
            />
          )}
        </div>
      )}

      {/* Due date */}
      <div>
        <Label>Due Date</Label>
        <Input type="date" {...register("dueDate")} />
        {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>}
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <div className="flex items-center gap-2">
          <Checkbox
            id="personal"
            checked={isPersonal}
            onCheckedChange={(val) => reset({ ...watch(), isPersonal: Boolean(val) })}
          />
          <Label htmlFor="personal">Personal Task</Label>
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="scheduled"
            checked={isScheduled}
            onCheckedChange={(val) => reset({ ...watch(), isScheduled: Boolean(val) })}
          />
          <Label htmlFor="scheduled">Schedule Task</Label>
        </div>
      </div>

      {/* Schedule start/end */}
      {isScheduled && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Schedule Start *</Label>
            <Input type="datetime-local" {...register("scheduleStart")} />
            {errors.scheduleStart && <p className="text-red-500 text-sm mt-1">{errors.scheduleStart.message}</p>}
          </div>
          <div>
            <Label>Schedule End *</Label>
            <Input type="datetime-local" {...register("scheduleEnd")} />
            {errors.scheduleEnd && <p className="text-red-500 text-sm mt-1">{errors.scheduleEnd.message}</p>}
          </div>
        </div>
      )}

      {/* Subtasks */}
      <div>
        <Label>Subtasks (optional)</Label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex items-center gap-2 mt-2">
            <Input {...register(`subtasks.${index}.title` as const)} placeholder="Subtask title" />
            <Button type="button" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => remove(index)}>
              🗑
            </Button>
          </div>
        ))}
        <Button type="button" variant="link" className="text-blue-600 text-sm mt-2" onClick={() => append({ title: "", completed: false })}>
          + Add Subtask
        </Button>
      </div>

      {/* Form actions */}
      <div className="flex justify-end gap-3 mt-4">
        <Button variant="outline" type="button" onClick={closeModal}>Cancel</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Updating..."
            : mode === "create"
            ? "Create Task"
            : "Update Task"}
        </Button>
      </div>
    </form>
  );
};

export default TaskForm;
