import { NextRequest } from "next/server";
import { executeTask, getTask, listRecentTasks } from "@/lib/execution-engine";
import { parseIntent, getActionDefinition } from "@/lib/actions";

/**
 * POST /api/actions/execute
 * Parses intent from user command, then executes via the execution engine.
 * Body: { command: string, stream?: boolean, userId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { command, userId } = await request.json();

    if (!command || typeof command !== "string" || !command.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "A command is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // ── Step 1: Parse intent using the action framework ──
    const intent = parseIntent(command);
    const actionDef = getActionDefinition(intent.actionId);

    // ── Step 2: Check if client wants SSE streaming ──
    const accept = request.headers.get("accept") || "";
    const wantsStream = accept.includes("text/event-stream");

    if (wantsStream) {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const sendEvent = (event: string, data: any) => {
            controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
          };

          try {
            // Send intent info first
            sendEvent("intent", {
              actionId: intent.actionId,
              actionLabel: actionDef?.label || "Processing",
              confidence: intent.confidence,
              params: intent.params,
            });

            // Execute via existing execution engine
            const result = await executeTask(command, (step) => {
              sendEvent("step", step);
            });

            // Augment result with intent metadata
            sendEvent("complete", {
              ...result,
              intent: {
                actionId: intent.actionId,
                actionLabel: actionDef?.label,
                confidence: intent.confidence,
              },
            });
          } catch (error: any) {
            sendEvent("error", { error: error.message || "Execution failed" });
          }

          controller.close();
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      });
    }

    // ── Regular JSON response ──
    const result = await executeTask(command);

    return new Response(
      JSON.stringify({
        ...result,
        intent: {
          actionId: intent.actionId,
          actionLabel: actionDef?.label || "Unknown",
          actionCategory: actionDef?.category || "system",
          confidence: intent.confidence,
          params: intent.params,
          reasoning: intent.reasoning,
          requiredPermissions: actionDef?.requiredPermissions || [],
        },
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    return new Response(
      JSON.stringify({
        success: false,
        taskId: "error",
        summary: "Failed to execute task",
        steps: [],
        error: error.message || "Internal server error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

/**
 * GET /api/actions/execute?task=<taskId>
 * Get status/results of a specific task or list recent tasks
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const taskId = searchParams.get("task");
  const list = searchParams.get("list");

  if (list === "recent") {
    const tasks = listRecentTasks(10);
    return new Response(JSON.stringify({ success: true, tasks }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  if (taskId) {
    const task = getTask(taskId);
    if (!task) {
      return new Response(
        JSON.stringify({ success: false, error: "Task not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    return new Response(JSON.stringify({ success: true, task }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ success: false, error: "Provide ?task=<id> or ?list=recent" }),
    { status: 400, headers: { "Content-Type": "application/json" } }
  );
}
