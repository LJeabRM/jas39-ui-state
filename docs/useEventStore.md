# `useEventStore.ts` – Event State Management Design

This document outlines the structure, state definitions, and action flows required to design and implement the **Event Store** for the JAS39 Planner.
The store integrates **Zustand** (for local UI state) and **React Query** (for API communication and caching).

---

## 1. Event Model / Interface

Based on the **Form Modal** (`image_065635.png`, `image_065612.png`) and **Event Card** (`image_877ef8.png`), the `Event` model contains the following fields:

| Field          | Type             | Description                                             | Source                         |
| :------------- | :--------------- | :------------------------------------------------------ | :----------------------------- |
| `id`           | `string`         | Unique event identifier (used for edit/delete actions). | *Inferred*                     |
| `title`        | `string`         | Event title *(required)*.                               | Form                           |
| `location`     | `string`         | Event location.                                         | Form                           |
| `isMultiDay`   | `boolean`        | Determined by the “Multi-day event” checkbox.           | Form                           |
| `startDate`    | `string`         | Start date *(required)*.                                | Form                           |
| `endDate`      | `string \| null` | End date (only applies if `isMultiDay = true`).         | Form                           |
| `startTime`    | `string \| null` | Start time *(required)*.                                | Form                           |
| `endTime`      | `string \| null` | End time (or “End time on last day”).                   | Form                           |
| `description`  | `string`         | Event description or notes.                             | Form                           |
| `coverImage`   | `string \| null` | Optional cover image URL.                               | Form                           |
| `color`        | `string`         | Event color (e.g., HEX code).                           | Form                           |
| `participants` | `string[]`       | List of assigned team members.                          | Form / Card                    |
| `progress`     | `number`         | Completion percentage (0–100).                          | Card (“Progress 40% Complete”) |

---

## 2. Local Store State (Zustand)

The **Zustand store** holds local UI and filter state to synchronize the Event page.
These states are not persisted; they are reactive and scoped to UI logic.

| State Variable       | Type              | Default Value                                                 | Description                                         |
| :------------------- | :---------------- | :------------------------------------------------------------ | :-------------------------------------------------- |
| `selectedEventId`    | `string \| null`  | `null`                                                        | ID of the event currently selected or being edited. |
| `searchKeyword`      | `string`          | `""`                                                          | Keyword typed in the event search bar.              |
| `eventSortBy`        | `string`          | `"Start Date (Soonest)"`                                      | Selected sort option (dropdown).                    |
| `eventSortDirection` | `"asc" \| "desc"` | `"asc"`                                                       | Sorting direction.                                  |
| `filterByProgress`   | `string[]`        | `["Not Started", "In Progress", "Completed"]`                 | Progress filter (checkbox).                         |
| `filterByDate`       | `string[]`        | `["Past Events", "This Week", "This Month", "Future Events"]` | Date filter (checkbox).                             |
| `totalCount`         | `number`          | `0`                                                           | Total number of events.                             |
| `showingCount`       | `number`          | `0`                                                           | Number of events displayed after filtering.         |

---

## 3. Local Actions (Mutators)

| Method                       | Parameters                 | Description                                   |
| :--------------------------- | :------------------------- | :-------------------------------------------- |
| `setSelectedEventId(id)`     | `string \| null`           | Sets the active event for viewing or editing. |
| `setSearchKeyword(keyword)`  | `string`                   | Updates keyword for searching events.         |
| `setEventSortBy(sort)`       | `string`                   | Changes event sort type.                      |
| `setEventSortDirection(dir)` | `"asc" \| "desc"`          | Toggles ascending/descending sorting.         |
| `setEventFilters(filters)`   | `Partial<EventStoreState>` | Updates multiple filter/sort states at once.  |

---

## 4. API Layer (CRUD Functions)

| Function                | HTTP Method | Endpoint            | Description                                       |
| :---------------------- | :---------- | :------------------ | :------------------------------------------------ |
| `fetchEvents(params)`   | `GET`       | `/api/events?query` | Fetch all events based on filter/sort parameters. |
| `createEvent(data)`     | `POST`      | `/api/events`       | Create a new event with given data.               |
| `updateEvent(id, data)` | `PUT`       | `/api/events/:id`   | Update an existing event.                         |
| `deleteEvent(id)`       | `DELETE`    | `/api/events/:id`   | Delete an event by its ID.                        |

All functions throw an error if the response is not `res.ok`.

---

## 5. React Query Hooks

| Hook               | Purpose                                                               | Success Behavior                                                             | Error Behavior                            |
| :----------------- | :-------------------------------------------------------------------- | :--------------------------------------------------------------------------- | :---------------------------------------- |
| `useFetchEvents()` | Fetches events list from the server, refetches on filter/sort change. | Updates cache (`["events"]`) automatically.                                  | Displays toast: “Failed to fetch events”. |
| `useCreateEvent()` | Creates a new event.                                                  | Shows toast: “Event created successfully!”, invalidates cache, closes modal. | Shows toast: “Failed to create event”.    |
| `useUpdateEvent()` | Updates an existing event.                                            | Shows toast: “Event updated successfully!”, invalidates cache, closes modal. | Shows toast: “Failed to update event”.    |
| `useDeleteEvent()` | Deletes an event.                                                     | Shows toast: “Event deleted!”, invalidates cache.                            | Shows toast: “Failed to delete event”.    |

---

## 6. Interaction & Flow Diagram (Simplified Table Form)

| Action                      | Trigger Source              | Flow Summary                                                         | Connected Components            |
| :-------------------------- | :-------------------------- | :------------------------------------------------------------------- | :------------------------------ |
| **Create Event**            | “Add Event” modal → Submit  | POST `/api/events` → Refetch events → Close modal → Toast success    | `EventFormModal`, `useUiStore`  |
| **Update Event**            | “Edit Event” modal → Save   | PUT `/api/events/:id` → Refetch events → Close modal → Toast success | `EventFormModal`, `useUiStore`  |
| **Delete Event**            | Event card “Delete” button  | DELETE `/api/events/:id` → Refetch → Toast success                   | `EventCard`                     |
| **Filter/Sort Events**      | Filter panel, sort dropdown | Update local filters → Refetch via `useFetchEvents()`                | `EventFilters`, `useEventStore` |
| **View/Edit Event Details** | Card click or edit icon     | Set `selectedEventId` → Load event data                              | `EventDetailsPanel`             |

---

## 7. Integration Example (React Component Usage)

| Integration Point          | Implementation Summary                                                   |
| :------------------------- | :----------------------------------------------------------------------- |
| **Event List Page**        | Uses `useFetchEvents()` to display event cards dynamically with filters. |
| **Event Modal (Add/Edit)** | Uses `useCreateEvent()` or `useUpdateEvent()` mutation hooks.            |
| **Delete Confirmation**    | Uses `useDeleteEvent()` mutation.                                        |
| **Filter Sidebar**         | Connects to `useEventStore()` to control filters and sorting.            |

---

## ✅ Summary

This design ensures:

* **Zustand** → Manages UI, filters, and selection logic.
* **React Query** → Handles data fetching, mutation, and caching from `/api/events`.
* **useUiStore** → Controls modal state and UI interactions.
* **Toast** → Provides instant feedback to users for all CRUD actions.

🧭 **Result:** A modular, reactive, and consistent event management system — ensuring clarity between UI state, server data, and user interactions.

---
