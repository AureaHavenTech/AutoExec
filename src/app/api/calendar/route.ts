/**
 * /api/calendar
 * Google Calendar API proxy — handles read, create, update, and delete operations.
 *
 * GET    /api/calendar?action=status             — Check connection status
 * GET    /api/calendar?action=read&max=10        — Read upcoming events
 * GET    /api/calendar?action=list-calendars     — List available calendars
 * POST   /api/calendar                           — Create or update an event
 * DELETE /api/calendar?eventId=xxx               — Delete an event
 */
import { NextRequest, NextResponse } from "next/server";
import {
  readEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  listCalendars,
  getCalendarStatus,
} from "@/lib/google-calendar";
import { disconnectCalendar } from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "status";

  try {
    switch (action) {
      case "status":
        return NextResponse.json(getCalendarStatus());

      case "list-calendars": {
        const result = await listCalendars();
        return NextResponse.json(result);
      }

      case "read": {
        const maxResults = parseInt(searchParams.get("max") || "10", 10);
        const timeMin = searchParams.get("timeMin") || undefined;
        const timeMax = searchParams.get("timeMax") || undefined;
        const query = searchParams.get("q") || undefined;
        const calendarId = searchParams.get("calendarId") || "primary";
        const result = await readEvents(maxResults, timeMin, timeMax, query, calendarId);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Calendar API error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, eventId, calendarId, ...eventParams } = body;

    switch (action) {
      case "create": {
        if (!eventParams.title || !eventParams.startTime || !eventParams.endTime) {
          return NextResponse.json(
            { error: "Missing required fields: title, startTime, endTime" },
            { status: 400 }
          );
        }
        const result = await createEvent(eventParams, calendarId || "primary");
        return NextResponse.json(result);
      }

      case "update": {
        if (!eventId) {
          return NextResponse.json(
            { error: "eventId is required for update" },
            { status: 400 }
          );
        }
        const result = await updateEvent(eventId, eventParams, calendarId || "primary");
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { error: "Unknown action. Use 'create' or 'update'." },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Calendar API error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  const calendarId = searchParams.get("calendarId") || "primary";

  if (eventId) {
    // Delete a specific event
    try {
      const result = await deleteEvent(eventId, calendarId);
      return NextResponse.json(result);
    } catch (error: any) {
      return NextResponse.json(
        { error: error.message || "Failed to delete event" },
        { status: 500 }
      );
    }
  }

  // Disconnect Calendar entirely
  try {
    disconnectCalendar();
    return NextResponse.json({ success: true, disconnected: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to disconnect" },
      { status: 500 }
    );
  }
}
