// src/features/events/forms/EventForm.tsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { useUiStore } from "@/stores/useUiStore";
import { useCreateEvent, useUpdateEvent, useFetchEvent } from "@/stores/useEventStore";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { MultiSelect } from "@/components/ui/MultiSelect";

// Zod schema
export const eventSchema = z
  .object({
    title: z.string().min(1, "Please fill out this field").max(100, "Title too long"),
    description: z.string().optional(),
    location: z.string().optional(),
    isMultiDay: z.boolean().default(false),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().optional(),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    color: z.string().optional(),
    coverImage: z.string().optional(),
    participants: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.isMultiDay && data.endDate) {
        return new Date(data.endDate) >= new Date(data.startDate);
      }
      return true;
    },
    {
      message: "End date must be start date or later",
      path: ["endDate"],
    }
  );

export type EventFormData = z.infer<typeof eventSchema>;

interface EventFormProps {
  eventId?: string | null;
  mode?: "create" | "edit";
  onSuccess?: () => void;
}

export const EventForm: React.FC<EventFormProps> = ({
  eventId,
  mode = "create",
  onSuccess,
}) => {
  const closeModal = useUiStore((s) => s.closeAllModals);

  const { data: eventData } = useFetchEvent(eventId);

  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();

  const form = useForm<EventFormData>({
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

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = form;

  const isMultiDay = watch("isMultiDay");

  useEffect(() => {
    if (eventData && mode === "edit") {
      reset({
        title: eventData.title ?? "",
        description: eventData.description ?? "",
        location: eventData.location ?? "",
        isMultiDay: eventData.isMultiDay ?? false,
        startDate: eventData.startDate?.slice(0, 10) ?? "",
        endDate: eventData.endDate?.slice(0, 10) ?? "",
        startTime: eventData.startTime ?? "",
        endTime: eventData.endTime ?? "",
        color: eventData.color ?? "#3B82F6",
        coverImage: eventData.coverImage ?? "",
        participants: eventData.participants ?? [],
      });
    }
  }, [eventData, mode, reset]);

  const isDisabled = isSubmitting || createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (data: EventFormData) => {
    try {
      if (mode === "edit" && eventId) {
        await updateMutation.mutateAsync({ id: eventId, data });
        toast.success("Event updated successfully");
      } else {
        await createMutation.mutateAsync(data);
        toast.success("Event created successfully");
      }
      closeModal();
      onSuccess?.();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save event");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-4 bg-white rounded-2xl">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium mb-1">Event Title *</label>
        <Input {...register("title")} placeholder="Enter event title" disabled={isDisabled} />
        {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <Input {...register("location")} placeholder="Event location" disabled={isDisabled} />
      </div>

      {/* Multi-day */}
      <div className="flex items-center gap-2">
        <Checkbox {...register("isMultiDay")} />
        <span>Multi-day event</span>
      </div>

      {/* Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Date *</label>
          <Input type="date" {...register("startDate")} disabled={isDisabled} />
          {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
        </div>
        {isMultiDay && (
          <div>
            <label className="block text-sm font-medium mb-1">End Date *</label>
            <Input type="date" {...register("endDate")} disabled={isDisabled} />
            {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
          </div>
        )}
      </div>

      {/* Times */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Start Time *</label>
          <Input type="time" {...register("startTime")} disabled={isDisabled} />
          {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            {isMultiDay ? "End Time (on last day) *" : "End Time *"}
          </label>
          <Input type="time" {...register("endTime")} disabled={isDisabled} />
          {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime.message}</p>}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea {...register("description")} rows={3} placeholder="Event description" disabled={isDisabled} />
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium mb-1">Event Color</label>
        <Input type="color" {...register("color")} className="w-16 h-8 p-0 border-none" disabled={isDisabled} />
      </div>

      {/* Cover Image */}
      <div>
        <label className="block text-sm font-medium mb-1">Cover Image</label>
        <Input {...register("coverImage")} placeholder="Image URL (optional)" disabled={isDisabled} />
      </div>

      {/* Participants */}
      <div>
        <label className="block text-sm font-medium mb-1">Participants</label>
        <MultiSelect
          values={watch("participants") || []}
          onChange={(val) => form.setValue("participants", val)}
          options={[
            { label: "John", value: "john" },
            { label: "Alice", value: "alice" },
            { label: "Sara", value: "sara" },
          ]}
          placeholder="Select participants"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 pt-4">
        <Button variant="secondary" type="button" onClick={closeModal} disabled={isDisabled}>Cancel</Button>
        <Button variant="primary" type="submit" disabled={isDisabled}>
          {mode === "edit" ? (updateMutation.isPending ? "Updating..." : "Update Event") : (createMutation.isPending ? "Creating..." : "Create Event")}
        </Button>
      </div>
    </form>
  );
};

export default EventForm;
