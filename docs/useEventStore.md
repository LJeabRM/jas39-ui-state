# `useEventStore.ts` – Event State Management Design

This document outlines the structure, state definitions, and action flows required to design and implement the **Event Store** for the JAS39 Planner.  
The store integrates **Zustand** (for local UI state) and **React Query** (for API communication and caching).

---

## 1. Event Model / Interface

Based on the **Form Modal** (`image_065635.png`, `image_065612.png`) and **Event Card** (`image_877ef8.png`), the main fields for the `Event` model are as follows:

| Field Name | Type | Notes | Source |
| :--- | :--- | :--- | :--- |
| **`id`** | `string` | Unique identifier used for edit/delete actions. | *Inferred* |
| **`title`** | `string` | Event title *(required)*. | Form |
| **`location`** | `string` | Event location. | Form |
| **`isMultiDay`** | `boolean` | Determined by the “Multi-day event” checkbox. | Form |
| **`startDate`** | `Date` | Start date *(required)*. | Form |
| **`endDate`** | `Date \| null` | Only applicable when `isMultiDay = true`. | Form |
| **`startTime`** | `Date \| null` | Start time *(required)*. | Form |
| **`endTime`** | `Date \| null` | End time *(or “End Time (on last day)”).* | Form |
| **`description`** | `string` | Event description or notes. | Form |
| **`coverImage`** | `string \| null` | Optional image URL for the event. | Form |
| **`color`** | `string` | Event color (e.g. hex code). | Form |
| **`participants`** | `string[]` | List of team members (IDs or names). | Form / Card |
| **`progress`** | `number` | Completion percentage (0–100). | Card (“Progress 40% Complete”) |

---

## 2. Local Store State

The following local states are used to manage data fetched from the API and maintain the UI state of the Event view:

| State Variable | Type | Default Value | Description |
| :--- | :--- | :--- | :--- |
| **`events`** | `Event[]` | `[]` | List of all events displayed in the **All Events** view. |
| **`selectedEventId`** | `string \| null` | `null` | ID of the currently selected or edited event. |
| **`isLoading`** | `boolean` | `false` | Indicates loading state while fetching (`GET /api/events`). |
| **`isError`** | `boolean` | `false` | Indicates whether an error occurred during fetch or mutation. |
| **`totalCount`** | `number` | `0` | Total number of events (`Showing 6 of 6 events`). |
| **`showingCount`** | `number` | `0` | Number of events currently visible after filtering. |

---

## 3. Filter and Sorting State (Event-Specific)

These states are dedicated to **querying and filtering** event data.  
They will typically synchronize with `useUiStore.ts` to align with UI filter/sort options.

| State Variable | Type / Options | Default Value | Source |
| :--- | :--- | :--- | :--- |
| **`searchKeyword`** | `string` | `""` | Text entered in the “Search events…” bar. |
| **`eventSortBy`** | `string` | `"Start Date (Soonest)"` | Dropdown options: `"Start Date (Soonest)"`, `"Event Name (A-Z)"`, `"Progress (High to Low)"`. |
| **`eventSortDirection`** | `"asc" \| "desc"` | `"asc"` | Sorting direction (Soonest → Ascending). |
| **`filterByProgress`** | `string[]` | `["Not Started", "In Progress", "Completed"]` | Checkboxes in the **Filter Events** panel. |
| **`filterByDate`** | `string[]` | `["Past Events", "This Week", "This Month", "Future Events"]` | Checkboxes in the **Filter Events** panel. |

---

## 4. Interaction with `useUiStore.ts` and API (Actions & Flow)

The following table describes the main action methods, their logic flow, and how they connect with other systems:

| Action (Method) | Flow / Logic | Connected To |
| :--- | :--- | :--- |
| **`createEvent(data)`** | 1. Calls API: `POST /api/events`. <br> 2. **On success:** updates local `events` state, closes modal via `useUiStore.closeAllModals()`, and shows a toast notification. | **API + useUiStore** |
| **`updateEvent(id, data)`** | 1. Calls API: `PUT /api/events/:id`. <br> 2. **On success:** updates the specific event in the local `events` array, closes modal, and shows a toast notification. | **API + useUiStore** |
| **`deleteEvent(id)`** | 1. Calls API: `DELETE /api/events/:id`. <br> 2. **On success:** removes the event from the `events` array and shows a toast notification. | **API** |
| **`fetchEvents(filters)`** | 1. Sets `isLoading = true`. <br> 2. Calls API: `GET /api/events` with **Filter/Sort** parameters. <br> 3. Updates `events` list and count states. | **API** |
| **`loadEventForEdit(id)`** | 1. Sets `selectedEventId = id`. <br> 2. Calls API: `GET /api/events/:id` to retrieve full event details for the edit form. | **API** |
| **`setEventFilters(filters)`** | Updates filter-related local states (`searchKeyword`, `eventSortBy`, etc.) and triggers a **refetch**. | **Local State + Refetch** |

---

## Summary

This plan ensures that:
- **Zustand** manages local UI state and synchronization between components.
- **React Query** efficiently fetches, caches, and mutates data from `/api/events`.
- **useUiStore** handles modal visibility and user interactions seamlessly.
- Toast notifications give immediate feedback to users for create, update, and delete actions.

Together, they provide a clean, predictable data flow for the **Event Management** feature of JAS39 Planner.
