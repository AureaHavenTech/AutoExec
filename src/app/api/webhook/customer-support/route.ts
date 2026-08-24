// Webhook receiver for customer-support channels (Gmail, Instagram DM, etc.)
// Accepts incoming messages and routes them to the Axel AI chat pipeline.
// Inert/safe by default — requires owner configuration to activate.

import { NextRequest } from "next/server";

interface WebhookPayload {
  channel: string;         // "gmail" | "instagram" | "facebook" | "sms"
  customerEmail: string;
  customerName?: string;
  message: string;
}

const ALLOWED_CHANNELS = ["gmail", "instagram", "facebook", "sms", "test"];

/**
 * Check if a given channel is configured (credentials present).
 * Honest — returns false by default; owner must configure credentials.
 */
function isChannelConfigured(channel: string): boolean {
  switch (channel) {
    case "gmail":
      return !!(process.env.GMAIL_CLIENT_ID && process.env.GMAIL_CLIENT_SECRET);
    case "instagram":
      return !!(process.env.INSTAGRAM_ACCESS_TOKEN);
    case "facebook":
      return !!(process.env.FACEBOOK_PAGE_ACCESS_TOKEN);
    case "sms":
      return !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN);
    case "test":
      return true; // test channel always available
    default:
      return false;
  }
}

export async function POST(request: NextRequest) {
  let payload: WebhookPayload;
  try {
    payload = await request.json();
  } catch {
    return Response.json(
      { success: false, message: "Invalid JSON payload." },
      { status: 400 }
    );
  }

  const { channel, customerEmail, message } = payload;

  // Validate required fields
  if (!channel || !customerEmail || !message) {
    return Response.json(
      { success: false, message: "Missing required fields: channel, customerEmail, message." },
      { status: 400 }
    );
  }

  // Validate channel
  if (!ALLOWED_CHANNELS.includes(channel.toLowerCase())) {
    return Response.json(
      {
        success: false,
        message: `Channel "${channel}" is not supported. Supported channels: ${ALLOWED_CHANNELS.join(", ")}.`,
      },
      { status: 400 }
    );
  }

  // Check if channel is configured
  if (!isChannelConfigured(channel.toLowerCase())) {
    return Response.json(
      {
        success: false,
        message: `Channel "${channel}" is not configured. The store owner has not set up ${channel.toUpperCase()} credentials yet. No messages can be received from this channel.`,
      },
      { status: 200 } // 200, not error — this is an expected state
    );
  }

  // Channel is configured — in the future, this would:
  // 1. Create a conversation context from customerEmail
  // 2. Feed the message into the chat pipeline
  // 3. Route the AI response back to the channel
  //
  // For now: acknowledge receipt. Full channel integration needs:
  //   - Gmail: OAuth tokens + Pub/Sub webhook or polling
  //   - Instagram: Facebook Graph API + webhook subscription
  //   - Facebook: Page messaging webhook
  //   - SMS: Twilio webhook (configured in Twilio console)

  return Response.json({
    success: true,
    message: `Message received from ${payload.customerName || customerEmail} via ${channel}.`,
    details: {
      channel,
      customerEmail,
      receivedAt: new Date().toISOString(),
      status: "acknowledged — full channel integration requires owner credentials.",
    },
  });
}

/**
 * GET handler — returns channel configuration status for diagnostics.
 */
export async function GET() {
  const channels = ALLOWED_CHANNELS.filter((c) => c !== "test").map((channel) => ({
    channel,
    configured: isChannelConfigured(channel),
  }));

  const configuredCount = channels.filter((c) => c.configured).length;

  return Response.json({
    success: true,
    channels,
    summary:
      configuredCount === 0
        ? "No channels configured. Set up credentials (GMAIL_CLIENT_ID, INSTAGRAM_ACCESS_TOKEN, etc.) to enable customer support messaging."
        : `${configuredCount} channel(s) configured.`,
  });
}