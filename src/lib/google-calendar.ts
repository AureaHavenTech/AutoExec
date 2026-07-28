/**
 * Google Calendar API client for Axel AI.
 * Handles reading, creating, updating, and deleting calendar events.
 * Uses the google-auth module for token management.
 */

import { getValidAccessToken, isCalendarConnected } from "@/lib/google-auth";

const CALENDAR_API_BASE = "https://www.googleapis.com/calendar/v3";

export interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  attendees?: Array<{ email: string; responseStatus?: string; displayName?: string }>;
  organizer?: { email: string; displayName?: string };
  htmlLink?: string;
  status?: string;
  created?: string;
  updated?: string;
  recurrence?: string[];
  reminders?: { useDefault: boolean; overrides?: Array<{ method: string; minutes: number }> };
}

export interface CalendarEventSummary {
  id: string;
  title: string;
  description?: string;
  location?: string;
  start: string;
  end: string;
  attendees: string[];
  htmlLink?: string;
  status: string;
}

export interface CalendarListEntry {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
  timeZone?: string;
}

export interface CreateEventParams {
  title: string;
  startTime: string; // ISO 8601
  endTime: string;   // ISO 8601
  description?: string;
  location?: string;
  attendees?: string[]; // email addresses
  timeZone?: string;
  recurrence?: string[];
}

export interface CalendarReadResult {
  success: boolean;
  events: CalendarEventSummary[];
  totalCount: number;
  error?: string;
}

export interface CalendarEventResult {
  success: boolean;
  event?: CalendarEventSummary;
  error?: string;
}

export interface CalendarListResult {
  success: boolean;
  calendars: CalendarListEntry[];
  error?: string;
}

/**
 * Make an authenticated request to the Google Calendar API.
 */
async function calendarRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new Error("Google Calendar not connected. Please connect your Google account.");
  }

  const url = `${CALENDAR_API_BASE}${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Calendar API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Convert a full Calendar event to a simplified summary.
 */
function toEventSummary(event: CalendarEvent): CalendarEventSummary {
  return {
    id: event.id,
    title: event.summary || "Untitled Event",
    description: event.description,
    location: event.location,
    start: event.start?.dateTime || event.start as unknown as string,
    end: event.end?.dateTime || event.end as unknown as string,
    attendees: (event.attendees || []).map(a => a.email),
    htmlLink: event.htmlLink,
    status: event.status || "confirmed",
  };
}

// ============================================================
// Public API
// ============================================================

/**
 * List calendars available to the user.
 */
export async function listCalendars(): Promise<CalendarListResult> {
  try {
    if (!isCalendarConnected()) {
      return { success: false, calendars: [], error: "Calendar not connected" };
    }

    const data = await calendarRequest<{ items: CalendarListEntry[] }>(
      "/users/me/calendarList"
    );

    return {
      success: true,
      calendars: data.items || [],
    };
  } catch (error: any) {
    return {
      success: false,
      calendars: [],
      error: error.message || "Failed to list calendars",
    };
  }
}

/**
 * Read upcoming calendar events.
 * @param timeMin - Start of time range (ISO 8601), defaults to now
 * @param timeMax - End of time range (ISO 8601), optional
 * @param maxResults - Maximum events to return (default 10, max 250)
 * @param query - Text search in event titles/descriptions
 * @param calendarId - Calendar ID, defaults to "primary"
 */
export async function readEvents(
  maxResults = 10,
  timeMin?: string,
  timeMax?: string,
  query?: string,
  calendarId = "primary"
): Promise<CalendarReadResult> {
  try {
    if (!isCalendarConnected()) {
      return { success: false, events: [], totalCount: 0, error: "Calendar not connected" };
    }

    const params = new URLSearchParams();
    params.set("maxResults", String(Math.min(maxResults, 250)));
    params.set("singleEvents", "true");
    params.set("orderBy", "startTime");

    // Default to now if no timeMin provided
    params.set("timeMin", timeMin || new Date().toISOString());
    if (timeMax) params.set("timeMax", timeMax);
    if (query) params.set("q", query);

    const data = await calendarRequest<{
      items: CalendarEvent[];
      summary?: string;
      nextPageToken?: string;
    }>(`/calendars/${encodeURIComponent(calendarId)}/events?${params.toString()}`);

    return {
      success: true,
      events: (data.items || []).map(toEventSummary),
      totalCount: (data.items || []).length,
    };
  } catch (error: any) {
    return {
      success: false,
      events: [],
      totalCount: 0,
      error: error.message || "Failed to read calendar events",
    };
  }
}

/**
 * Create a new calendar event.
 */
export async function createEvent(params: CreateEventParams, calendarId = "primary"): Promise<CalendarEventResult> {
  try {
    if (!isCalendarConnected()) {
      return { success: false, error: "Calendar not connected" };
    }

    const eventBody: Record<string, unknown> = {
      summary: params.title,
      start: {
        dateTime: params.startTime,
        timeZone: params.timeZone || "America/Los_Angeles",
      },
      end: {
        dateTime: params.endTime,
        timeZone: params.timeZone || "America/Los_Angeles",
      },
    };

    if (params.description) eventBody.description = params.description;
    if (params.location) eventBody.location = params.location;
    if (params.attendees && params.attendees.length > 0) {
      eventBody.attendees = params.attendees.map(email => ({ email }));
    }
    if (params.recurrence && params.recurrence.length > 0) {
      eventBody.recurrence = params.recurrence;
    }

    // Default reminders
    eventBody.reminders = {
      useDefault: false,
      overrides: [
        { method: "popup", minutes: 30 },
        { method: "email", minutes: 60 },
      ],
    };

    const event = await calendarRequest<CalendarEvent>(
      `/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: "POST",
        body: JSON.stringify(eventBody),
      }
    );

    return {
      success: true,
      event: toEventSummary(event),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create calendar event",
    };
  }
}

/**
 * Update an existing calendar event.
 */
export async function updateEvent(
  eventId: string,
  params: Partial<CreateEventParams>,
  calendarId = "primary"
): Promise<CalendarEventResult> {
  try {
    if (!isCalendarConnected()) {
      return { success: false, error: "Calendar not connected" };
    }

    const eventBody: Record<string, unknown> = {};

    if (params.title) eventBody.summary = params.title;
    if (params.description) eventBody.description = params.description;
    if (params.location) eventBody.location = params.location;
    if (params.startTime) {
      eventBody.start = { dateTime: params.startTime, timeZone: params.timeZone || "America/Los_Angeles" };
    }
    if (params.endTime) {
      eventBody.end = { dateTime: params.endTime, timeZone: params.timeZone || "America/Los_Angeles" };
    }
    if (params.attendees) {
      eventBody.attendees = params.attendees.map(email => ({ email }));
    }

    const event = await calendarRequest<CalendarEvent>(
      `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      {
        method: "PATCH",
        body: JSON.stringify(eventBody),
      }
    );

    return {
      success: true,
      event: toEventSummary(event),
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to update calendar event",
    };
  }
}

/**
 * Delete a calendar event.
 */
export async function deleteEvent(
  eventId: string,
  calendarId = "primary"
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!isCalendarConnected()) {
      return { success: false, error: "Calendar not connected" };
    }

    await calendarRequest(
      `/calendars/${encodeURIComponent(calendarId)}/events/${encodeURIComponent(eventId)}`,
      { method: "DELETE" }
    );

    return { success: true };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to delete calendar event",
    };
  }
}

/**
 * Get the Calendar connection status.
 */
export function getCalendarStatus() {
  return {
    connected: isCalendarConnected(),
  };
}
