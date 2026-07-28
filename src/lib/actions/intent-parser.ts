// Intent Parser — converts user messages into structured action intents
// Uses pattern matching + keyword heuristics for fast, no-API parsing
import type { ParsedIntent, ActionId, IntentPattern } from "./types";
import { getActionDefinition } from "./registry";

// ─── Intent Patterns ────────────────────────────────────────

const INTENT_PATTERNS: IntentPattern[] = [
  // ── Email ────────────────────────────────
  {
    actionId: "email_send",
    examples: [
      "Send an email to all my customers",
      "Email John about the order",
      "Send a thank you note to recent buyers",
    ],
    patterns: [
      /(?:send|fire\s*off|deliver|shoot)\s+(?:an?\s+)?email\s+(?:to\s+)?(.+?)(?:\s+(?:about|regarding|saying|with)\s+(.+))?$/i,
      /email\s+(.+?)\s+(?:about|regarding|re)\s+(.+)$/i,
    ],
    extractParams: (_m, input) => {
      const to = _m[1]?.trim();
      const body = _m[2]?.trim() || input;
      return { to, body, subject: body ? body.slice(0, 80) : "Message from Axel AI" };
    },
    confidence: 0.85,
  },
  {
    actionId: "email_draft",
    examples: [
      "Draft an email to my list",
      "Write a newsletter about our sale",
      "Compose a welcome email for new subscribers",
    ],
    patterns: [
      /(?:draft|compose|write|prepare)\s+(?:an?\s+)?email\s+(?:to\s+)?(.+?)(?:\s+(?:about|for|regarding)\s+(.+))?$/i,
      /(?:write|draft)\s+(?:a|an)\s+(?:newsletter|email|message)\s+(?:about\s+)?(.+)$/i,
    ],
    extractParams: (_m, input) => {
      return { to: _m[1]?.trim(), subject: _m[2]?.trim() || input.slice(0, 80), body: input };
    },
    confidence: 0.80,
  },
  {
    actionId: "email_search",
    examples: [
      "Search my email for invoices",
      "Find emails from Sarah",
      "Look for any messages about the shipment",
    ],
    patterns: [
      /(?:search|find|look\s*(?:for|through)|check)\s+(?:my\s+)?(?:email|inbox|messages)\s+(?:for\s+)?(.+)$/i,
      /(?:find|search)\s+(?:all\s+)?emails?\s+(?:from|about|matching)\s+(.+)$/i,
    ],
    extractParams: (_m) => ({ query: _m[1]?.trim() }),
    confidence: 0.82,
  },

  // ── Calendar ─────────────────────────────
  {
    actionId: "calendar_create_event",
    examples: [
      "Schedule a meeting with Sarah Tuesday at 2pm",
      "Create a calendar event for the product launch",
      "Set up a call with the design team tomorrow",
    ],
    patterns: [
      /(?:schedule|set\s*up|create|book|add)\s+(?:a\s+)?(?:meeting|call|event|appointment)\s+(?:with\s+)?(.+?)(?:\s+(?:on|at|for)\s+(.+))?$/i,
      /(?:put|add)\s+(.+)\s+(?:on|in|to)\s+(?:my\s+)?calendar/i,
    ],
    extractParams: (_m) => {
      const title = _m[1]?.trim() || "Meeting";
      const timeHint = _m[2]?.trim();
      // Time parsing is best-effort here; AI should normalize
      return { title, description: timeHint || "" };
    },
    confidence: 0.78,
  },
  {
    actionId: "calendar_read_events",
    examples: [
      "What's on my calendar today?",
      "Show me my meetings this week",
      "What do I have scheduled tomorrow?",
    ],
    patterns: [
      /(?:what|show|get|list|pull|check)\s+(?:is\s+)?(?:on\s+)?(?:my\s+)?calendar\s*(?:for\s+)?(.+)?$/i,
      /(?:my\s+)?(?:upcoming\s+)?(?:meetings|events|schedule)(?:\s+(?:for|this|today|tomorrow|this\s+week))?\s*$/i,
      /(?:what|show)\s+(?:do\s+I\s+have|are\s+my)\s+(?:scheduled|coming\s+up)/i,
    ],
    extractParams: (_m) => {
      const hint = _m[1]?.trim() || "upcoming";
      let timeMin = "now";
      if (/today/i.test(hint)) timeMin = "today";
      else if (/tomorrow/i.test(hint)) timeMin = "tomorrow";
      else if (/this week/i.test(hint)) timeMin = "this_week";
      return { timeMin, maxResults: 10 };
    },
    confidence: 0.85,
  },

  // ── Shopify ──────────────────────────────
  {
    actionId: "shopify_get_orders",
    examples: [
      "Show me today's Shopify orders",
      "How many orders did we get this week?",
      "List all pending orders",
    ],
    patterns: [
      /(?:show|get|list|fetch|pull|check)\s+(?:me\s+)?(?:my\s+)?(?:shopify\s+)?orders?\s*(?:for\s+)?(.+)?$/i,
      /(?:how\s+many|what)\s+(?:orders|sales)(?:\s+(?:did|have)\s+we\s+get)?\s*(?:for\s+)?(.+)?$/i,
      /(?:pending|recent|new|today(?:'?s)?)\s+(?:shopify\s+)?orders/i,
    ],
    extractParams: (_m) => {
      const hint = _m[1]?.trim() || "";
      let status = "any";
      let since: string | undefined;
      if (/pending/i.test(hint)) status = "open";
      if (/today/i.test(hint)) since = "today";
      else if (/this week/i.test(hint)) since = "this_week";
      return { status, since, limit: 25 };
    },
    confidence: 0.82,
  },
  {
    actionId: "shopify_get_products",
    examples: [
      "Show me my products",
      "List all active products in my store",
      "What products are selling best?",
    ],
    patterns: [
      /(?:show|list|get|fetch)\s+(?:me\s+)?(?:my\s+)?(?:shopify\s+)?products?/i,
      /(?:what|which)\s+(?:products|items)(?:\s+(?:are|do))\s*(.+)?$/i,
    ],
    extractParams: () => ({ status: "active", limit: 25 }),
    confidence: 0.80,
  },
  {
    actionId: "shopify_create_discount",
    examples: [
      "Create a 20% off discount code",
      "Make a discount code SUMMER25",
      "Set up a free shipping promo",
    ],
    patterns: [
      /(?:create|make|generate|set\s*up)\s+(?:a\s+)?(?:new\s+)?(?:discount|promo|coupon)\s+(?:code\s+)?(?:for\s+)?(.+)$/i,
      /(\d+)%\s*(?:off|discount)\s+(?:code\s+)?(.+)?$/i,
      /(?:free\s+shipping|freeship)/i,
    ],
    extractParams: (_m) => {
      const rest = _m[1]?.trim() || _m[2]?.trim() || "";
      const pctMatch = rest.match(/(\d+)\s*%/);
      const value = pctMatch ? parseInt(pctMatch[1]) : 20;
      const code = rest.replace(/\d+\s*%/, "").trim() || `SAVE${value}`;
      return { code: code.toUpperCase().replace(/\s/g, ""), valueType: "percentage", value };
    },
    confidence: 0.78,
  },

  // ── Web ──────────────────────────────────
  {
    actionId: "web_search",
    examples: [
      "Search for SaaS companies in Austin",
      "Find me 50 leads in the healthcare industry",
      "Look up competitors in my niche",
    ],
    patterns: [
      /(?:search|find|look\s*(?:up|for)|google|research)\s+(?:for\s+)?(?:me\s+)?(.+)$/i,
      /(?:find|locate|identify)\s+(?:me\s+)?(?:some\s+)?(.+)$/i,
      /(?:what|who)\s+(?:are|is)\s+(?:the\s+)?(.+?)\?$/i,
    ],
    extractParams: (_m) => ({ query: _m[1]?.trim(), maxResults: 10 }),
    confidence: 0.70,
  },
  {
    actionId: "web_scrape",
    examples: [
      "Scrape this website for contact info",
      "Extract prices from this page",
      "Pull data from this URL",
    ],
    patterns: [
      /(?:scrape|extract|crawl|pull\s*(?:data\s*)?(?:from)?)\s+(.+)$/i,
      /(?:get|grab|fetch)\s+(?:the\s+)?(?:data|info|content)\s+(?:from\s+)?(.+)$/i,
    ],
    extractParams: (_m) => {
      const rest = _m[1]?.trim() || "";
      const urlMatch = rest.match(/(https?:\/\/[^\s]+)/);
      return { url: urlMatch?.[0] || rest, extract: "text" };
    },
    confidence: 0.75,
  },

  // ── Reports ──────────────────────────────
  {
    actionId: "create_report",
    examples: [
      "Generate a sales report for this month",
      "Create a marketing performance report",
      "Give me a summary of last quarter",
    ],
    patterns: [
      /(?:generate|create|make|build|produce)\s+(?:a\s+)?(?:report|summary|overview|analysis)\s+(?:of\s+)?(.+)$/i,
      /(?:give|show)\s+me\s+(?:a\s+)?(?:report|summary)\s+(?:of|on|for)\s+(.+)$/i,
    ],
    extractParams: (_m) => {
      const rest = _m[1]?.trim() || "business";
      let type = "summary";
      if (/sales|revenue|orders/i.test(rest)) type = "sales";
      else if (/market|campaign|ad/i.test(rest)) type = "marketing";
      else if (/outreach|email/i.test(rest)) type = "outreach";
      return { type, timeRange: "month", format: "text" };
    },
    confidence: 0.80,
  },
  {
    actionId: "generate_invoice",
    examples: [
      "Create an invoice for the Johnson order",
      "Generate an invoice for Acme Corp",
      "Send an invoice for $500 to the client",
    ],
    patterns: [
      /(?:generate|create|make|send)\s+(?:an?\s+)?invoice\s+(?:for\s+)?(.+)$/i,
      /invoice\s+(.+)$/i,
    ],
    extractParams: (_m) => {
      const rest = _m[1]?.trim() || "customer";
      const amountMatch = rest.match(/\$?(\d+)/);
      return { customer: rest, items: [], dueDate: undefined };
    },
    confidence: 0.78,
  },

  // ── Cross-App ────────────────────────────
  {
    actionId: "one_post_ai_create_content",
    examples: [
      "Create social media content for my brand",
      "Post to Instagram about our new product",
      "Generate TikTok content for the sale",
    ],
    patterns: [
      /(?:create|generate|make|post|publish)\s+(?:some\s+)?(?:social\s+)?(?:media\s+)?content\s+(?:for\s+)?(.+)$/i,
      /(?:post|publish)\s+(?:to|on)\s+(tiktok|instagram|facebook|linkedin|youtube)\s+(?:about\s+)?(.+)$/i,
      /(?:make|create)\s+(?:a|some)\s+(tiktok|instagram|facebook|linkedin|youtube)\s+(?:post|video|content)\s+(?:about\s+)?(.+)$/i,
    ],
    extractParams: (_m) => {
      const platform = _m[1]?.toLowerCase();
      const prompt = _m[2]?.trim() || _m[1]?.trim() || "";
      const platforms = ["tiktok", "instagram", "facebook", "linkedin", "youtube"].includes(platform)
        ? [platform]
        : ["tiktok", "instagram"];
      return { brandName: "My Brand", prompt, platforms, captionStyle: "short" };
    },
    confidence: 0.75,
  },
];

// ─── Keyword Boost Map ──────────────────────────────────────

const KEYWORD_BOOST: Record<string, Partial<Record<ActionId, number>>> = {
  email: { email_draft: 0.2, email_send: 0.2, email_search: 0.15 },
  send: { email_send: 0.25 },
  draft: { email_draft: 0.3 },
  calendar: { calendar_create_event: 0.2, calendar_read_events: 0.2 },
  schedule: { calendar_create_event: 0.25 },
  meeting: { calendar_create_event: 0.3 },
  shopify: { shopify_get_orders: 0.2, shopify_get_products: 0.2 },
  order: { shopify_get_orders: 0.25 },
  product: { shopify_get_products: 0.25 },
  discount: { shopify_create_discount: 0.3 },
  coupon: { shopify_create_discount: 0.3 },
  search: { web_search: 0.2 },
  find: { web_search: 0.2 },
  research: { web_search: 0.2 },
  scrape: { web_scrape: 0.3 },
  extract: { web_scrape: 0.25 },
  report: { create_report: 0.25 },
  invoice: { generate_invoice: 0.35 },
  content: { one_post_ai_create_content: 0.2 },
  post: { one_post_ai_create_content: 0.2 },
  tiktok: { one_post_ai_create_content: 0.25 },
  instagram: { one_post_ai_create_content: 0.25 },
};

// ─── Public API ─────────────────────────────────────────────

const CONFIDENCE_THRESHOLD = 0.15;

/**
 * Parse a user message into a structured intent.
 * Returns the best-match action with confidence and extracted parameters.
 */
export function parseIntent(input: string): ParsedIntent {
  const normalized = input.trim();
  const lower = normalized.toLowerCase();

  // Score every pattern against the input
  const scored: { actionId: ActionId; confidence: number; params: Record<string, unknown> }[] = [];

  for (const pattern of INTENT_PATTERNS) {
    for (const regex of pattern.patterns) {
      regex.lastIndex = 0;
      const match = regex.exec(normalized);
      if (match) {
        let confidence = pattern.confidence;

        // Apply keyword boosts
        for (const [keyword, boosts] of Object.entries(KEYWORD_BOOST)) {
          if (lower.includes(keyword) && (pattern.actionId in boosts)) {
            confidence += (boosts as Record<ActionId, number>)[pattern.actionId] || 0;
          }
        }

        // Bonus for longer matches (more specific)
        const matchLength = match[0].length / normalized.length;
        confidence += matchLength * 0.1;

        const params = pattern.extractParams(match, normalized);
        scored.push({ actionId: pattern.actionId, confidence: Math.min(1, confidence), params });
      }
    }
  }

  // Sort by confidence descending
  scored.sort((a, b) => b.confidence - a.confidence);

  if (scored.length === 0 || scored[0].confidence < CONFIDENCE_THRESHOLD) {
    // No intent detected — fallback to conversational
    return {
      actionId: "noop",
      confidence: 0,
      params: { message: normalized },
      rawInput: normalized,
      reasoning: "No actionable intent detected. Message appears conversational or ambiguous.",
    };
  }

  const best = scored[0];
  const alternatives = scored.slice(1, 4).map((s) => ({
    actionId: s.actionId,
    confidence: s.confidence,
  }));

  const def = getActionDefinition(best.actionId);

  return {
    actionId: best.actionId,
    confidence: best.confidence,
    params: best.params,
    rawInput: normalized,
    reasoning: `Matched action "${def?.label || best.actionId}" with confidence ${(best.confidence * 100).toFixed(0)}%. Input matched pattern: "${best.actionId}".`,
    alternativeActions: alternatives.length > 0 ? alternatives : undefined,
  };
}

/**
 * Get all example phrases for the intent parser (useful for testing/docs)
 */
export function getIntentExamples(): { actionId: ActionId; examples: string[] }[] {
  return INTENT_PATTERNS.map((p) => ({
    actionId: p.actionId,
    examples: p.examples,
  }));
}
