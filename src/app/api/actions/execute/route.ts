import { NextRequest } from "next/server";
import { executeTask, getTask, listRecentTasks } from "@/lib/execution-engine";

/**
 * POST /api/actions/execute
 * Execute a task from a user command
 * Body: { command: string, stream?: boolean }
 */
export async function POST(request: NextRequest) {
  try {
    const { command } = await request.json();

    if (!command || typeof command !== "string" || !command.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "A command is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Check if client wants SSE streaming
    const accept = request.headers.get("accept") || "";
    const wantsStream = accept.includes("text/event-stream");

    if (wantsStream) {
      // SSE streaming response — sends real-time step updates
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const sendEvent = (event: string, data: any) => {
            controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
          };

          try {
            const result = await executeTask(command, (step) => {
              sendEvent("step", step);
            });

            sendEvent("complete", result);
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

    // Regular JSON response
    const result = await executeTask(command);
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    });

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
 * Get status/results of a specific task
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
