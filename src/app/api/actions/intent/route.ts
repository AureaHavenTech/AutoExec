// POST /api/actions/intent — Parse a user message into a structured action intent
// Returns the parsed intent without executing anything
import { NextRequest, NextResponse } from "next/server";
import { parseIntent, getActionDefinition, getIntentExamples } from "@/lib/actions";

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { success: false, error: "A message is required" },
        { status: 400 }
      );
    }

    const intent = parseIntent(message);
    const actionDef = getActionDefinition(intent.actionId);

    return NextResponse.json({
      success: true,
      intent: {
        actionId: intent.actionId,
        actionLabel: actionDef?.label || "Unknown",
        actionCategory: actionDef?.category || "system",
        confidence: intent.confidence,
        params: intent.params,
        reasoning: intent.reasoning,
        alternativeActions: intent.alternativeActions,
        requiredPermissions: actionDef?.requiredPermissions || [],
      },
      raw: message,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Intent parsing failed" },
      { status: 500 }
    );
  }
}

// GET /api/actions/intent — return available actions and example phrases
export async function GET() {
  return NextResponse.json({
    success: true,
    examples: getIntentExamples(),
    availableActions: getIntentExamples().map((e) => ({
      actionId: e.actionId,
      label: getActionDefinition(e.actionId)?.label,
    })),
  });
}
