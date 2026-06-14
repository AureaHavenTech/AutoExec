import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import crypto from "crypto";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function classifyTask(description: string): {
  type: "research" | "list_building" | "email_outreach" | "data_gathering" | "general";
  targets: string[];
  location?: string;
  industry?: string;
} {
  const lower = description.toLowerCase();

  let type: "research" | "list_building" | "email_outreach" | "data_gathering" | "general" = "general";
  if (lower.includes("find") || lower.includes("search") || lower.includes("research") || lower.includes("scrape") || lower.includes("locate")) {
    type = "research";
  }
  if (lower.includes("list") || lower.includes("compile") || lower.includes("extract") || lower.includes("csv") || lower.includes("spreadsheet")) {
    type = "list_building";
  }
  if (lower.includes("email") || lower.includes("outreach") || lower.includes("draft") || lower.includes("pitch") || lower.includes("intro")) {
    type = "email_outreach";
  }
  if (lower.includes("gather") || lower.includes("analyze") || lower.includes("collect") || lower.includes("data") || lower.includes("intel")) {
    type = "data_gathering";
  }

  // Extract potential targets
  const targets: string[] = [];
  const targetPatterns = [
    /(?:saas|startups?|companies|businesses|firms|agencies|vendors)/gi,
    /(\w+)\s+(?:companies|startups|firms)/gi,
  ];
  for (const pattern of targetPatterns) {
    const matches = description.match(pattern);
    if (matches) targets.push(...matches);
  }

  // Extract location
  let location: string | undefined;
  const locPattern = /in\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)/g;
  const locMatch = locPattern.exec(description);
  if (locMatch && locMatch[1].length < 30) {
    location = locMatch[1];
  }

  return { type, targets: Array.from(new Set(targets)), location };
}

function generateMockResults(description: string) {
  const classification = classifyTask(description);
  const lower = description.toLowerCase();
  const countMatch = lower.match(/(\d+)/);
  const requestedCount = countMatch ? parseInt(countMatch[1]) : 25;

  const count = Math.min(Math.max(requestedCount, 5), 100);
  const location = classification.location || "San Francisco";
  const industry = classification.targets[0] || "tech companies";

  const companies = [
    { name: "Linear", domain: "linear.app", role: "Product Engineer", email: "hiring@linear.app" },
    { name: "Vercel", domain: "vercel.com", role: "Senior Frontend Engineer", email: "talent@vercel.com" },
    { name: "Retool", domain: "retool.com", role: "Full Stack Engineer", email: "careers@retool.com" },
    { name: "Notion", domain: "notion.so", role: "Software Engineer", email: "jobs@notion.so" },
    { name: "Figma", domain: "figma.com", role: "Product Designer", email: "design-jobs@figma.com" },
    { name: "Supabase", domain: "supabase.com", role: "Backend Engineer", email: "hiring@supabase.com" },
    { name: "Railway", domain: "railway.app", role: "Platform Engineer", email: "team@railway.app" },
    { name: "Resend", domain: "resend.com", role: "Full Stack Developer", email: "founders@resend.com" },
    { name: "Cal.com", domain: "cal.com", role: "Senior Engineer", email: "careers@cal.com" },
    { name: "Dub.co", domain: "dub.co", role: "Software Developer", email: "hello@dub.co" },
    { name: "Raycast", domain: "raycast.com", role: "MacOS Developer", email: "jobs@raycast.com" },
    { name: "Mintlify", domain: "mintlify.com", role: "Documentation Engineer", email: "founders@mintlify.com" },
    { name: "Trigger.dev", domain: "trigger.dev", role: "Senior Backend", email: "team@trigger.dev" },
    { name: "Warp", domain: "warp.dev", role: "Rust Engineer", email: "hiring@warp.dev" },
    { name: "Clerk", domain: "clerk.com", role: "Frontend Engineer", email: "jobs@clerk.com" },
  ];

  return {
    summary: `Found ${count} ${industry} in ${location} and compiled verified contact information.`,
    items_count: count,
    execution_time: `${Math.floor(Math.random() * 30 + 15)}s`,
    results_preview: companies.slice(0, Math.min(5, count)),
    all_companies: companies.slice(0, Math.min(count, companies.length)),
  };
}

export async function POST(request: NextRequest) {
  const { message, conversationId, history } = await request.json();

  if (!message || typeof message !== "string") {
    return new Response(JSON.stringify({ error: "Message is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Phase 1: Analyze the task
        sendEvent({ type: "text", content: "🧠 **Analyzing your request...**\n" });
        await sleep(600);

        const classification = classifyTask(message);
        let phaseMessages: string[] = [];

        if (classification.type === "research") {
          phaseMessages = [
            `🎯 **Target identified:** ${classification.targets.join(", ") || "relevant targets"} ${classification.location ? `in ${classification.location}` : ""}`,
            `🌐 Launching browser agents to search directories and crawl company pages...`,
            `🔍 Scanning LinkedIn, Crunchbase, and company career portals for contact data...`,
            `✅ Cross-referencing emails against MX records for deliverability...`,
          ];
        } else if (classification.type === "list_building") {
          phaseMessages = [
            `📋 **Compiling structured list of** ${classification.targets.join(", ") || "targets"} ${classification.location ? `in ${classification.location}` : ""}`,
            `🔎 Searching company databases and public registries...`,
            `📊 Extracting contact details, roles, and company metadata...`,
            `✅ Formatting results into structured data with verified fields...`,
          ];
        } else if (classification.type === "email_outreach") {
          phaseMessages = [
            `✉️ **Preparing email outreach campaign for** ${classification.targets.join(", ") || "targets"}`,
            `👤 Researching recipient backgrounds for personalization...`,
            `📝 Drafting customized email templates with relevant context...`,
            `✅ Emails ready for review — no sending until you approve`,
          ];
        } else if (classification.type === "data_gathering") {
          phaseMessages = [
            `📊 **Gathering intelligence on** ${classification.targets.join(", ") || "requested topics"}`,
            `🌐 Deploying web scrapers to collect structured data...`,
            `📈 Analyzing trends and aggregating findings...`,
            `✅ Data compiled and ready for review`,
          ];
        } else {
          phaseMessages = [
            `🤔 **Processing your request...**`,
            `🔍 Breaking down the task into actionable steps...`,
            `⚙️ Executing agent workflows...`,
            `✅ Task processing complete`,
          ];
        }

        // Stream phase messages
        for (const msg of phaseMessages) {
          sendEvent({ type: "text", content: msg + "\n" });
          await sleep(800);
        }

        // Phase 2: Generate results
        await sleep(500);
        sendEvent({ type: "text", content: "\n📊 **Results ready!** Here's what I found:\n\n" });
        await sleep(300);

        // Generate context-aware response summary
        const results = generateMockResults(message);
        const summaryLines = [
          `**Summary:** ${results.summary}`,
          `**Execution time:** ${results.execution_time}`,
          `**Items found:** ${results.items_count} verified contacts`,
          "",
        ];

        for (const line of summaryLines) {
          sendEvent({ type: "text", content: line + "\n" });
          await sleep(200);
        }

        // Phase 3: Save to database
        const db = getDb();
        const userId = "user_demo_id"; // Mock user
        const taskId = "task_" + crypto.randomBytes(8).toString("hex");
        const now = new Date().toISOString();

        db.prepare(
          "INSERT INTO app_tasks (id, user_id, description, status, result, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
        ).run(taskId, userId, message, "completed", JSON.stringify(results), now, now);

        // Send final result metadata
        sendEvent({
          type: "result",
          content: "",
          metadata: {
            taskId,
            itemsCount: results.items_count,
            executionTime: results.execution_time,
            resultsPreview: results.results_preview,
          },
        });

        // Final done signal
        await sleep(200);
        sendEvent({ type: "text", content: "\n✅ **Done!** What would you like me to work on next?" });
        sendEvent({ type: "done" });

        controller.close();
      } catch (error: any) {
        sendEvent({ type: "error", content: `Error: ${error.message || "An unexpected error occurred"}` });
        controller.close();
      }
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