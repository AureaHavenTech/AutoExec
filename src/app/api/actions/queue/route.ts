// GET /api/actions/queue — Get user's action queue
// Supports ?userId=<id>&status=<status>&limit=<n>
import { NextRequest, NextResponse } from "next/server";
import {
  getUserQueue,
  getUserQueueStats,
  getActiveItems,
  getQueueItem,
  cancelItem,
} from "@/lib/actions";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId") || "default";
    const itemId = searchParams.get("itemId");
    const stats = searchParams.get("stats");
    const active = searchParams.get("active");
    const limit = parseInt(searchParams.get("limit") || "50");

    // Stats mode
    if (stats === "true") {
      return NextResponse.json({
        success: true,
        stats: getUserQueueStats(userId),
      });
    }

    // Active items only
    if (active === "true") {
      const items = getActiveItems(userId);
      return NextResponse.json({ success: true, items, count: items.length });
    }

    // Single item lookup
    if (itemId) {
      const item = getQueueItem(itemId);
      if (!item) {
        return NextResponse.json(
          { success: false, error: "Queue item not found" },
          { status: 404 }
        );
      }
      return NextResponse.json({ success: true, item });
    }

    // Full queue for user
    const items = getUserQueue(userId, limit);
    return NextResponse.json({
      success: true,
      items,
      count: items.length,
      stats: getUserQueueStats(userId),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch queue" },
      { status: 500 }
    );
  }
}

// DELETE /api/actions/queue?itemId=<id> — Cancel a queued item
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get("itemId");

    if (!itemId) {
      return NextResponse.json(
        { success: false, error: "itemId is required" },
        { status: 400 }
      );
    }

    const cancelled = cancelItem(itemId);
    if (!cancelled) {
      return NextResponse.json(
        { success: false, error: "Item not found or cannot be cancelled (must be in 'queued' status)" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, item: cancelled });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to cancel item" },
      { status: 500 }
    );
  }
}
