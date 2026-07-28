// Action Queue — tracks task execution with status, steps, and results
// In-memory store (survives within a serverless function instance)
import type { QueueItem, QueueStep, QueueResult, QueueStatus, ParsedIntent, ActionId } from "./types";

// ─── In-Memory Store ────────────────────────────────────────

const queue = new Map<string, QueueItem>();
const MAX_QUEUE_SIZE = 1000;

// ─── Helpers ────────────────────────────────────────────────

function generateId(): string {
  return `q_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function now(): string {
  return new Date().toISOString();
}

function pruneIfNeeded(): void {
  if (queue.size > MAX_QUEUE_SIZE) {
    // Remove oldest completed/failed items first
    const entries = [...queue.entries()];
    const toRemove = entries
      .filter(([, item]) => item.status === "completed" || item.status === "failed" || item.status === "cancelled")
      .sort((a, b) => new Date(a[1].createdAt).getTime() - new Date(b[1].createdAt).getTime())
      .slice(0, queue.size - MAX_QUEUE_SIZE + 100);

    for (const [id] of toRemove) {
      queue.delete(id);
    }
  }
}

// ─── Public API ─────────────────────────────────────────────

/** Create a new queued item from a parsed intent */
export function enqueue(
  userId: string,
  intent: ParsedIntent,
  params?: Record<string, unknown>
): QueueItem {
  pruneIfNeeded();

  const item: QueueItem = {
    id: generateId(),
    actionId: intent.actionId,
    userId,
    params: params || intent.params,
    status: "queued",
    intent,
    createdAt: now(),
    steps: [
      {
        timestamp: now(),
        message: `Task queued: ${intent.actionId}`,
        type: "info",
      },
    ],
  };

  queue.set(item.id, item);
  return item;
}

/** Get a queue item by ID */
export function getQueueItem(id: string): QueueItem | undefined {
  return queue.get(id);
}

/** Update the status of a queue item */
export function updateStatus(
  id: string,
  status: QueueStatus,
  extra?: { error?: string; result?: QueueResult }
): QueueItem | undefined {
  const item = queue.get(id);
  if (!item) return undefined;

  item.status = status;

  if (status === "executing" && !item.startedAt) {
    item.startedAt = now();
  }
  if (status === "completed" || status === "failed" || status === "cancelled") {
    item.completedAt = now();
  }
  if (extra?.error) {
    item.error = extra.error;
  }
  if (extra?.result) {
    item.result = extra.result;
  }

  return item;
}

/** Add a step to a queue item's progress log */
export function addStep(
  id: string,
  message: string,
  type: QueueStep["type"] = "info",
  data?: Record<string, unknown>
): void {
  const item = queue.get(id);
  if (!item) return;
  item.steps.push({ timestamp: now(), message, type, data });
}

/** Get all queue items for a user (most recent first) */
export function getUserQueue(userId: string, limit = 50): QueueItem[] {
  const items: QueueItem[] = [];
  for (const item of queue.values()) {
    if (item.userId === userId) items.push(item);
  }
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return items.slice(0, limit);
}

/** Get active (queued/executing) items for a user */
export function getActiveItems(userId: string): QueueItem[] {
  return getUserQueue(userId).filter(
    (item) => item.status === "queued" || item.status === "executing"
  );
}

/** Get recent completed items */
export function getRecentCompleted(userId: string, limit = 10): QueueItem[] {
  return getUserQueue(userId)
    .filter((item) => item.status === "completed")
    .slice(0, limit);
}

/** Cancel a queued item */
export function cancelItem(id: string): QueueItem | undefined {
  const item = queue.get(id);
  if (!item) return undefined;
  if (item.status !== "queued") return undefined; // can only cancel queued items
  return updateStatus(id, "cancelled");
}

/** Get the total number of items in the queue */
export function getQueueSize(): number {
  return queue.size;
}

/** Clear all items for a user */
export function clearUserQueue(userId: string): number {
  let count = 0;
  for (const [id, item] of queue.entries()) {
    if (item.userId === userId) {
      queue.delete(id);
      count++;
    }
  }
  return count;
}

/** Get queue statistics for a user */
export function getUserQueueStats(userId: string) {
  const items = getUserQueue(userId, 1000);
  let queued = 0, executing = 0, completed = 0, failed = 0, cancelled = 0;
  for (const item of items) {
    switch (item.status) {
      case "queued": queued++; break;
      case "executing": executing++; break;
      case "completed": completed++; break;
      case "failed": failed++; break;
      case "cancelled": cancelled++; break;
    }
  }
  return { total: items.length, queued, executing, completed, failed, cancelled };
}
