/**
 * /api/gmail
 * Gmail API proxy — handles read, draft, and send operations.
 * 
 * GET    /api/gmail?action=status     — Check connection status
 * GET    /api/gmail?action=read&max=10&q=from:example — Read emails
 * POST   /api/gmail                   — Draft or send email
 * DELETE /api/gmail                   — Disconnect Gmail
 */
import { NextRequest, NextResponse } from "next/server";
import { gmailRead, gmailCreateDraft, gmailSend, getGmailStatus } from "@/lib/gmail-client";
import { disconnectGmail } from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get("action") || "status";

  try {
    switch (action) {
      case "status":
        return NextResponse.json(getGmailStatus());

      case "read": {
        const maxResults = parseInt(searchParams.get("max") || "10", 10);
        const query = searchParams.get("q") || undefined;
        const result = await gmailRead(maxResults, query);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gmail API error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, to, subject, body: emailBody, cc, bcc } = body;

    if (!to || !subject || !emailBody) {
      return NextResponse.json(
        { error: "Missing required fields: to, subject, body" },
        { status: 400 }
      );
    }

    const draft = { to, subject, body: emailBody, cc, bcc };

    switch (action) {
      case "draft": {
        const result = await gmailCreateDraft(draft);
        return NextResponse.json(result);
      }

      case "send": {
        const result = await gmailSend(draft);
        return NextResponse.json(result);
      }

      default:
        return NextResponse.json(
          { error: "Unknown action. Use 'draft' or 'send'." },
          { status: 400 }
        );
    }
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Gmail API error" },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    disconnectGmail();
    return NextResponse.json({ success: true, disconnected: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to disconnect" },
      { status: 500 }
    );
  }
}
