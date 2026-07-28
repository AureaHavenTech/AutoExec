/**
 * Gmail API client for Axel AI.
 * Handles reading, drafting, and sending emails via the Gmail REST API.
 * Uses the google-auth module for token management.
 */

import { getValidAccessToken, isGmailConnected, getGmailPermissions } from "@/lib/google-auth";

const GMAIL_API_BASE = "https://gmail.googleapis.com/gmail/v1/users/me";

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  payload?: {
    headers: Array<{ name: string; value: string }>;
    parts?: Array<{
      mimeType: string;
      body: { data?: string; size: number };
    }>;
    body?: { data?: string; size: number };
  };
  internalDate: string;
}

export interface EmailSummary {
  id: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  date: string;
  unread: boolean;
}

export interface DraftEmail {
  to: string;
  subject: string;
  body: string;
  cc?: string;
  bcc?: string;
}

export interface GmailReadResult {
  success: boolean;
  messages: EmailSummary[];
  totalCount: number;
  query?: string;
  error?: string;
}

export interface GmailDraftResult {
  success: boolean;
  draftId?: string;
  messageId?: string;
  error?: string;
}

export interface GmailSendResult {
  success: boolean;
  messageId?: string;
  threadId?: string;
  error?: string;
}

/**
 * Make an authenticated request to the Gmail API.
 */
async function gmailRequest<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = await getValidAccessToken();
  if (!token) {
    throw new Error("Gmail not connected. Please connect your Google account.");
  }

  const url = `${GMAIL_API_BASE}${path}`;
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
    throw new Error(`Gmail API error (${response.status}): ${errorText}`);
  }

  return response.json();
}

/**
 * Decode a base64-encoded email body.
 */
function decodeBase64(data: string): string {
  try {
    return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
  } catch {
    return "[Unable to decode]";
  }
}

/**
 * Extract a header value from a Gmail message.
 */
function getHeader(headers: Array<{ name: string; value: string }>, name: string): string {
  return headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || "";
}

/**
 * Convert a Gmail API message to a simplified summary.
 */
function toEmailSummary(msg: GmailMessage): EmailSummary {
  const headers = msg.payload?.headers || [];
  return {
    id: msg.id,
    threadId: msg.threadId,
    from: getHeader(headers, "From"),
    to: getHeader(headers, "To"),
    subject: getHeader(headers, "Subject"),
    snippet: msg.snippet || "",
    date: getHeader(headers, "Date"),
    unread: msg.labelIds?.includes("UNREAD") || false,
  };
}

// ============================================================
// Public API
// ============================================================

/**
 * Read recent emails from the inbox.
 */
export async function gmailRead(maxResults = 10, query?: string): Promise<GmailReadResult> {
  try {
    if (!isGmailConnected()) {
      return { success: false, messages: [], totalCount: 0, error: "Gmail not connected" };
    }

    const params = new URLSearchParams();
    params.set("maxResults", String(Math.min(maxResults, 50)));
    if (query) params.set("q", query);

    const data = await gmailRequest<{
      messages?: Array<{ id: string; threadId: string }>;
      resultSizeEstimate: number;
    }>(`/messages?${params.toString()}`);

    if (!data.messages || data.messages.length === 0) {
      return {
        success: true,
        messages: [],
        totalCount: 0,
        query,
      };
    }

    // Fetch full message details for each
    const messages: EmailSummary[] = [];
    for (const msg of data.messages) {
      try {
        const full = await gmailRequest<GmailMessage>(`/messages/${msg.id}?format=metadata`);
        messages.push(toEmailSummary(full));
      } catch {
        // Skip messages that fail to fetch
      }
    }

    return {
      success: true,
      messages,
      totalCount: data.resultSizeEstimate || messages.length,
      query,
    };
  } catch (error: any) {
    return {
      success: false,
      messages: [],
      totalCount: 0,
      error: error.message || "Failed to read emails",
    };
  }
}

/**
 * Create a draft email in Gmail.
 */
export async function gmailCreateDraft(draft: DraftEmail): Promise<GmailDraftResult> {
  try {
    if (!isGmailConnected()) {
      return { success: false, error: "Gmail not connected" };
    }

    const perms = getGmailPermissions();
    if (!perms.canDraft && !perms.canSend) {
      return { success: false, error: "Insufficient permissions to create drafts" };
    }

    // Build RFC 2822 email
    const email = [
      `From: me`,
      `To: ${draft.to}`,
      draft.cc ? `Cc: ${draft.cc}` : "",
      draft.bcc ? `Bcc: ${draft.bcc}` : "",
      `Subject: ${draft.subject}`,
      "MIME-Version: 1.0",
      'Content-Type: text/plain; charset="UTF-8"',
      "",
      draft.body,
    ]
      .filter(Boolean)
      .join("\r\n");

    const raw = Buffer.from(email).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");

    const data = await gmailRequest<{ id: string; message: { id: string } }>("/drafts", {
      method: "POST",
      body: JSON.stringify({
        message: { raw },
      }),
    });

    return {
      success: true,
      draftId: data.id,
      messageId: data.message?.id,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to create draft",
    };
  }
}

/**
 * Send an email via Gmail.
 * The user must have explicitly approved each send.
 */
export async function gmailSend(draft: DraftEmail): Promise<GmailSendResult> {
  try {
    if (!isGmailConnected()) {
      return { success: false, error: "Gmail not connected" };
    }

    const perms = getGmailPermissions();
    if (!perms.canSend) {
      return { success: false, error: "Send permission not granted. Please reconnect Gmail with send scope." };
    }

    // Build RFC 2822 email
    const email = [
      `From: me`,
      `To: ${draft.to}`,
      draft.cc ? `Cc: ${draft.cc}` : "",
      draft.bcc ? `Bcc: ${draft.bcc}` : "",
      `Subject: ${draft.subject}`,
      "MIME-Version: 1.0",
      'Content-Type: text/plain; charset="UTF-8"',
      "",
      draft.body,
    ]
      .filter(Boolean)
      .join("\r\n");

    const raw = Buffer.from(email).toString("base64").replace(/\+/g, "-").replace(/\//g, "_");

    const data = await gmailRequest<{ id: string; threadId: string }>("/messages/send", {
      method: "POST",
      body: JSON.stringify({ raw }),
    });

    return {
      success: true,
      messageId: data.id,
      threadId: data.threadId,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to send email",
    };
  }
}

/**
 * Get the Gmail connection status and permissions.
 */
export function getGmailStatus() {
  return {
    connected: isGmailConnected(),
    permissions: getGmailPermissions(),
  };
}
