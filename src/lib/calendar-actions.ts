// Registers Google Calendar action handlers with the action execution framework
// Import this module in the app to wire Calendar into the action system
import { registerHandler } from "@/lib/actions";
import type { QueueStep, QueueResult } from "@/lib/actions";
import {
  createEvent,
  readEvents,
  updateEvent,
  deleteEvent,
  listCalendars,
} from "@/lib/google-calendar";

let calendarInitialized = false;

export function initCalendarActions() {
  if (calendarInitialized) return;
  calendarInitialized = true;

  // ── calendar_create_event ──────────────────
  registerHandler("calendar_create_event", async (params, _userId, onStep) => {
    onStep({
      timestamp: new Date().toISOString(),
      message: "Creating calendar event...",
      type: "progress",
    });

    const result = await createEvent({
      title: (params.title as string) || "New Event",
      startTime: params.startTime as string,
      endTime: params.endTime as string,
      description: params.description as string | undefined,
      location: params.location as string | undefined,
      attendees: params.attendees as string[] | undefined,
      timeZone: params.timeZone as string | undefined,
      recurrence: params.recurrence as string[] | undefined,
    });

    if (!result.success || !result.event) {
      onStep({
        timestamp: new Date().toISOString(),
        message: `Failed: ${result.error}`,
        type: "error",
      });
      return {
        success: false,
        output: null,
        summary: `Failed to create calendar event: ${result.error}`,
      };
    }

    onStep({
      timestamp: new Date().toISOString(),
      message: `Event "${result.event.title}" created`,
      type: "success",
      data: { eventId: result.event.id },
    });

    return {
      success: true,
      output: result.event,
      summary: `Calendar event "${result.event.title}" created for ${result.event.start}.`,
      artifacts: [
        { name: "event.json", type: "application/json" },
        ...(result.event.htmlLink ? [{ name: "calendar-link", url: result.event.htmlLink, type: "url" }] : []),
      ],
    };
  });

  // ── calendar_read_events ───────────────────
  registerHandler("calendar_read_events", async (params, _userId, onStep) => {
    onStep({
      timestamp: new Date().toISOString(),
      message: "Reading calendar events...",
      type: "progress",
    });

    const result = await readEvents(
      (params.maxResults as number) || 10,
      params.timeMin as string | undefined,
      params.timeMax as string | undefined,
      params.query as string | undefined,
      (params.calendarId as string) || "primary"
    );

    if (!result.success) {
      onStep({
        timestamp: new Date().toISOString(),
        message: `Failed: ${result.error}`,
        type: "error",
      });
      return {
        success: false,
        output: null,
        summary: `Failed to read calendar events: ${result.error}`,
      };
    }

    onStep({
      timestamp: new Date().toISOString(),
      message: `Found ${result.totalCount} events`,
      type: "success",
      data: { count: result.totalCount },
    });

    return {
      success: true,
      output: result.events,
      summary: result.totalCount > 0
        ? `Found ${result.totalCount} upcoming events. Next: "${result.events[0]?.title}"`
        : "No upcoming events found.",
      artifacts: [{ name: "events.json", type: "application/json" }],
    };
  });
}

// Auto-initialize on import (no env vars needed — uses OAuth)
initCalendarActions();
