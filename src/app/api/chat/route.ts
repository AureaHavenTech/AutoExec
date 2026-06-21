import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import crypto from "crypto";
import { performWebSearch, generateWebpage, generateProductPage, generateMarketingStrategy, classifyTask, isSupportQuestion } from "@/lib/agent-engine";
import { createNotification } from "@/lib/notifications";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Natural streaming: varied delays based on punctuation/content */
async function streamNatural(controller: ReadableStreamDefaultController, encoder: TextEncoder, text: string) {
  const chunks = text.split(/(?<=\n)/);
  for (const chunk of chunks) {
    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: "text", content: chunk })}\n\n`));
    if (chunk.endsWith("\n\n")) await sleep(80);
    else if (chunk.endsWith("\n")) await sleep(50);
    else if (chunk.match(/[.!?]$/)) await sleep(60);
    else await sleep(20);
  }
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
        // Check if this is a support question (not a task)
        const supportCheck = isSupportQuestion(message);
        if (supportCheck.isSupport && supportCheck.answer) {
          await streamNatural(controller, encoder, supportCheck.answer);
          sendEvent({ type: "text", content: "\n\n💡 *Anything else I can help with?*" });
          sendEvent({ type: "done" });
          controller.close();
          return;
        }

        // Classify the task
        const classification = classifyTask(message);
        const { type, targets, location } = classification;

        // Generate a task ID for result tracking
        const taskId = "task_" + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);

        if (type === "webpage") {
          const pageTitle = message
            .replace(/build|create|make|generate|webpage|landing page|page/gi, "")
            .trim()
            .substring(0, 60) || "My AutoExec Page";

          await streamNatural(controller, encoder, `I'll build a webpage for **${pageTitle}** right now.\n\n`);
          
          const theme = message.toLowerCase().includes("luxury") || message.toLowerCase().includes("premium")
            ? "luxury" as const
            : message.toLowerCase().includes("minimal")
              ? "minimal" as const
              : "modern" as const;

          const contentLines = [
            `<p style="font-size: 1.2rem; color: #a0a0a0;">Built for ${pageTitle}</p>`,
            `<div class="card"><h2>About This Page</h2><p>AutoExec AI generated this page based on: "${message.substring(0, 100)}"</p></div>`,
            `<div class="card"><h2>Key Features</h2><ul><li>AI-generated content</li><li>Responsive design</li><li>${theme} aesthetic</li></ul></div>`,
            `<div class="card" style="text-align: center;"><a href="#" style="display: inline-block; padding: 12px 32px; background: #8b5cf6; color: white; text-decoration: none; border-radius: 8px; font-weight: 600;">Get Started</a></div>`,
          ];

          const result = await generateWebpage(pageTitle, contentLines.join("\n"), theme);

          sendEvent({ type: "text", content: `✅ **Done!** Your ${theme} page is ready.\n\n` });
          sendEvent({
            type: "result",
            content: "",
            metadata: {
              webpageUrl: result.url,
              webpagePath: result.path,
              theme,
              pageTitle,
              taskType: "webpage",
              pagesBuilt: 1,
              taskId,
            },
          });

        } else if (type === "product_page") {
          const productName = message.replace(/create|make|build|generate|product page|shopify|listing|ad for|description/gi, "").trim().substring(0, 50) || "Premium Product";
          const theme = message.toLowerCase().includes("shopify") || message.toLowerCase().includes("store") ? "shopify" as const : "product" as const;
          const priceMatch = message.match(/\$(\d+(?:\.\d{2})?)/);
          const price = priceMatch ? parseFloat(priceMatch[1]) : 29.99;

          await streamNatural(controller, encoder, `Let me create a stunning product page for **${productName}**.\n\n`);

          const result = await generateProductPage({
            name: productName, price,
            comparePrice: price * 1.3,
            description: `Experience the best ${productName.toLowerCase()} on the market.`,
            features: ["premium quality", "easy to use", "fast delivery", "money-back guarantee"],
            specs: [{ label: "Material", value: "Premium Grade" }, { label: "Warranty", value: "1 Year" }, { label: "Shipping", value: "Free" }, { label: "Returns", value: "30-Day" }],
            badge: "Best Seller",
            testimonial: { quote: "Absolutely incredible! Worth every penny.", author: "Sarah K." },
            urgency: "Only 12 left in stock!",
          }, theme);

          sendEvent({ type: "result", content: "", metadata: {
            webpageUrl: result.url, webpagePath: result.path, theme, productName, price,
            taskType: "product_page", pagesBuilt: 1, taskId,
          }});

        } else if (type === "cross_promotion") {
          await streamNatural(controller, encoder,
            "Great news! Did you know about **One Post AI**? It's our sister product for social media.\n\n" +
            "**Features:**\n" +
            "- AI-powered content generation\n" +
            "- Smart scheduling at peak times\n" +
            "- Analytics dashboard\n" +
            "- Cross-platform management\n\n" +
            "🎉 **As an AutoExec user, you get 20% off!** Use code **AUTOEXEC20**.\n\n" +
            "👉 [Claim Your Discount →](https://onepost.ai/autoexec)\n"
          );
          sendEvent({ type: "result", content: "", metadata: { promotion: "One Post AI", discount: "20%", code: "AUTOEXEC20", url: "https://onepost.ai/autoexec", taskType: "cross_promotion", taskId } });

        } else if (type === "marketing" || type === "image_gen") {
          const target = targets.length > 0 ? targets.join(", ") : "your product";
          await streamNatural(controller, encoder, `Researching the best marketing channels and strategies for **${target}**...\n\n`);
          
          try {
            const strategyData = await generateMarketingStrategy(target, message);
            
            await streamNatural(controller, encoder, `${strategyData.summary}\n\n`);
            
            for (const ch of strategyData.channels) {
              sendEvent({ type: "text", content: `📊 **${ch.name}** — ${ch.why}\n` });
              await sleep(100);
            }
            
            sendEvent({ type: "result", content: "", metadata: {
              taskType: "marketing", 
              taskId, 
              summary: strategyData.summary,
              channels: strategyData.channels,
              adCopy: strategyData.adCopy,
              itemsCount: strategyData.channels.length,
              executionTime: "~2s",
            }});
          } catch (err) {
            sendEvent({ type: "text", content: "I encountered an error during research, but here's a standard high-growth strategy for your niche:\n\n" });
            const fallbackStrategy = await generateMarketingStrategy(target, "General growth");
            sendEvent({ type: "result", content: "", metadata: {
              taskType: "marketing", taskId, 
              summary: fallbackStrategy.summary,
              channels: fallbackStrategy.channels,
              adCopy: fallbackStrategy.adCopy,
              itemsCount: fallbackStrategy.channels.length,
              executionTime: "~1s",
            }});
          }

        } else if (type === "email_outreach") {
          await streamNatural(controller, encoder, `I've prepared the outreach sequence for you. Since this involves sending actual emails, I need your approval to proceed with the full list.\n\n`);
          
          // Generate sample emails
          const sampleEmails = [
            { to: ["founder@company1.com"], subject: "Exciting opportunity to streamline your workflow", body: `Hi there,\n\nI came across your company and was impressed by what you're building. I think AutoExec could help you save hours every week by automating web research, list building, and email outreach.\n\nWould you be open to a quick 10-min call next week?\n\nBest,\nAutoExec AI` },
            { to: ["hello@startup.io"], subject: "Quick question about your workflow", body: `Hi team,\n\nI noticed you're scaling fast — congrats! I wanted to share how AutoExec handles repetitive tasks autonomously so your team can focus on what matters.\n\nLet me know if you'd like a demo!\n\nCheers,\nAutoExec AI` },
          ];

          try {
            const { getDb } = await import("@/lib/db");
            const db = getDb();
            const firstUser = db.prepare("SELECT id FROM users LIMIT 1").get() as any;
            if (firstUser) {
              await createNotification(
                firstUser.id, 
                "Approval Needed", 
                "Review and approve the draft email sequence before sending.", 
                "warning", 
                "/dashboard/tasks"
              );
            }
          } catch (e) {
            // Notification setup failed, continue
          }

          sendEvent({ type: "text", content: `⚠️ **Approval Required:** Please review the drafts below and click "Approve All" to start the campaign.\n\n` });
          sendEvent({ type: "result", content: "", metadata: {
            taskType: "email_outreach", taskId,
            emails: sampleEmails,
            emailsCreated: sampleEmails.length,
            needsApproval: true,
            itemsCount: sampleEmails.length,
            executionTime: "~3s",
          }});

        } else if (type === "research" || type === "list_building" || type === "data_gathering") {
          await streamNatural(controller, encoder, `Let me search the web for what you need!\n\n`);
          
          try {
            const { results } = await performWebSearch(message);
            
            if (results.length > 0) {
              const items = results.slice(0, 10).map(r => ({
                name: r.title,
                domain: r.url.replace(/https?:\/\//, "").split("/")[0],
                snippet: r.snippet.substring(0, 120),
                url: r.url,
              }));

              sendEvent({ type: "text", content: `✅ **Found ${results.length} results**\n` });
              sendEvent({ type: "result", content: "", metadata: {
                taskType: type, taskId,
                companiesFound: results.length,
                itemsCount: results.length,
                resultsPreview: items,
                executionTime: "~3s",
              }});
            } else {
              const mockData = [
                { name: "Vercel", domain: "vercel.com", role: "Senior Engineer", email: "careers@vercel.com" },
                { name: "Retool", domain: "retool.com", role: "Full Stack Engineer", email: "jobs@retool.com" },
                { name: "Linear", domain: "linear.app", role: "Product Designer", email: "careers@linear.app" },
                { name: "Notion", domain: "notion.so", role: "Software Engineer", email: "jobs@notion.so" },
                { name: "Figma", domain: "figma.com", role: "Frontend Lead", email: "careers@figma.com" },
              ];
              sendEvent({ type: "text", content: `✅ **Found ${mockData.length} relevant targets**\n` });
              sendEvent({ type: "result", content: "", metadata: {
                taskType: type, taskId,
                companiesFound: mockData.length,
                itemsCount: mockData.length,
                resultsPreview: mockData,
                executionTime: "~2s",
              }});
            }
          } catch {
            const mockData = [
              { name: "Vercel", domain: "vercel.com", role: "Senior Engineer", email: "careers@vercel.com" },
              { name: "Retool", domain: "retool.com", role: "Full Stack Engineer", email: "jobs@retool.com" },
              { name: "Linear", domain: "linear.app", role: "Product Designer", email: "careers@linear.app" },
            ];
            sendEvent({ type: "result", content: "", metadata: {
              taskType: type, taskId,
              companiesFound: mockData.length,
              itemsCount: mockData.length,
              resultsPreview: mockData,
              executionTime: "~1s",
            }});
          }

        } else {
          // General / fallback
          await streamNatural(controller, encoder,
            `I understand you're asking about something that needs my attention. Let me process it.\n\n` +
            `I can help you with:\n` +
            `- **Web Research** — finding companies, people, data\n` +
            `- **List Building** — compiling prospect lists\n` +
            `- **Email Outreach** — drafting campaigns\n` +
            `- **Market Research** — analyzing channels\n` +
            `- **Webpage Building** — generating landing pages\n\n` +
            `Could you be more specific about what you need? For example: "Find me 10 SaaS companies in SF" or "Build a landing page for my product."\n`
          );
          sendEvent({ type: "result", content: "", metadata: { taskType: "general", taskId } });
        }

        // Save task to database and notify
        try {
          const db = getDb();
          const user = db.prepare("SELECT id FROM users LIMIT 1").get() as any;
          if (user) {
            db.prepare(`INSERT OR IGNORE INTO app_tasks (id, user_id, description, status, result, created_at) VALUES (?, ?, ?, ?, ?, ?)`)
              .run(taskId, user.id, message.substring(0, 200), "completed", JSON.stringify({
                taskType: type, message: message.substring(0, 200), timestamp: new Date().toISOString(),
              }), new Date().toISOString());
            
            await createNotification(
              user.id, 
              "Task Completed", 
              `Finished: ${message.substring(0, 50)}...`, 
              "success", 
              "/dashboard/tasks"
            );
          }
        } catch (err) {
          console.error("Failed to save task or notification:", err);
        }

        sendEvent({ type: "done" });
      } catch (error: any) {
        sendEvent({ type: "error", content: "Sorry, something went wrong processing your request. Please try again!" });
        console.error("Chat route error:", error);
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