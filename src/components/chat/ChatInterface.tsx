"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ChatMessageBubble } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import type { ChatMessage, ChatStreamChunk } from "@/lib/chat-types";
import { Bot, MessageSquare, Trash2, Sparkles, Timer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UpgradeModal } from "@/components/UpgradeModal";
import { canUseFeature, incrementUsage, getTrialStatus } from "@/lib/trial";

function generateId(): string {
  return "msg_" + Math.random().toString(36).substring(2, 11);
}

/**
 * Detect if a user message is an actionable command vs a general chat question.
 * Actionable commands get routed to the execution engine. Questions go to chat AI.
 */
function detectActionableCommand(message: string): boolean {
  const lower = message.toLowerCase().trim();

  // Short/greeting messages are not actionable
  if (lower.length < 8) return false;
  if (/^(hi|hello|hey|thanks|ok|okay|good|great|yes|no|sure)$/i.test(lower)) return false;

  // Pure question patterns (not actionable)
  const questionPatterns = [
    /^(what|how|why|when|where|who|which|can|could|would|will|do|does|did|is|are|was|were)\s/i,
    /^(i have|i need|i want|i am|i was|i would like to know)\s/i,
    /tell me about/i,
    /explain/i,
    /what is/i,
    /how (do|does|can|to)/i,
    /(help|support|question|faq)/i,
  ];

  // Task/action patterns
  const taskPatterns = [
    /find (\d+|me|us)/i,
    /search (for|the)/i,
    /scrape/i,
    /build (me|a|an)/i,
    /create (a|an|me)/i,
    /generate/i,
    /draft/i,
    /send (an|a|email)/i,
    /research (\d+|the|these)/i,
    /compile/i,
    /extract/i,
    /list (\d+|the|of)/i,
    /locate/i,
    /gather/i,
    /analyze/i,
    /collect/i,
    /visit/i,
    /go to/i,
    /market/i,
    /shopify/i,
    /product page/i,
    /landing page/i,
    /email outreach/i,
    /ad (copy|creative|campaign)/i,
    /cross.?promot/i,
  ];

  const isQuestion = questionPatterns.some(p => p.test(lower));
  const isTask = taskPatterns.some(p => p.test(lower));

  // If it looks like a task or doesn't look like a pure question, route to execution
  return isTask || !isQuestion;
}

export function ChatInterface() {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "👋 Hi! I'm **Axel**, your autonomous AI executive assistant.\n\nI can **execute real tasks** for you:\n\n🔍 **Research** — Find companies, products, or market data\n📋 **Build Lists** — Compile prospect lists with contacts\n✉️ **Email Outreach** — Draft and prepare email campaigns\n📊 **Market Intel** — Analyze competitors and trends\n🌐 **Build Pages** — Generate landing and product pages\n📦 **Shopify** — Create product listings with SEO\n\n**Try it:** Just tell me what you need done!",
      timestamp: new Date(),
      status: "done",
    },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationId] = useState(() => "conv_" + Math.random().toString(36).substring(2, 11));
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [trialReason, setTrialReason] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSend = async (content: string) => {
    if (isProcessing) return;

    // === TRIAL CHECK: Block if trial limits reached ===
    const trialCheck = canUseFeature("conversation");
    if (!trialCheck.allowed) {
      setTrialReason(trialCheck.reason || "Trial limit reached");
      setShowUpgradeModal(true);
      return;
    }

    // Add user message
    const userMsg: ChatMessage = {
      id: generateId(),
      role: "user",
      content,
      timestamp: new Date(),
      status: "done",
    };

    // Add placeholder assistant message (streaming)
    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "",
      timestamp: new Date(),
      status: "streaming",
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setIsProcessing(true);

    // Decide: route to action execution engine or chat AI
    const isActionable = detectActionableCommand(content);

    if (isActionable) {
      // === ROUTE TO EXECUTION ENGINE ===
      try {
        // Show initial "starting" message
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: "⏳ **Analyzing your request and preparing execution...**" }
              : m
          )
        );

        const response = await fetch("/api/actions/execute", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "text/event-stream" },
          body: JSON.stringify({ command: content }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || `API error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";
        let resultData: any = null;
        let completedSteps: string[] = [];

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("event: step")) {
              // Next line should be the data
              continue;
            }
            if (line.startsWith("event: complete") || line.startsWith("event: error")) {
              continue;
            }
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              try {
                const parsed = JSON.parse(data);

                if (parsed.error) {
                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsg.id
                        ? { ...m, content: `❌ **Error:** ${parsed.error}`, status: "error" }
                        : m
                    )
                  );
                  continue;
                }

                // Step update event
                if (parsed.id && parsed.label && parsed.status) {
                  const icon = parsed.status === "done" ? "✅" : parsed.status === "error" ? "❌" : "⏳";
                  const stepText = `${icon} ${parsed.label}`;

                  if (parsed.status === "done" && !completedSteps.includes(parsed.id)) {
                    completedSteps.push(parsed.id);
                  }

                  const progress = completedSteps.length;
                  const progressBar = "▓".repeat(progress) + "░".repeat(Math.max(0, 5 - progress));

                  setMessages((prev) =>
                    prev.map((m) =>
                      m.id === assistantMsg.id
                        ? {
                            ...m,
                            content: `⏳ **Executing your request...**\n\n\`${progressBar}\` ${Math.round((progress / 5) * 100)}%\n\n_${parsed.label}_\n\n${completedSteps.length > 0 ? `**Completed:**\n${completedSteps.map((s) => `✅ Step ${s.replace("step_", "")}`).join("\n")}` : ""}`,
                          }
                        : m
                    )
                  );
                }

                // Complete result
                if (parsed.steps || parsed.summary) {
                  resultData = parsed;
                }
              } catch {
                // Skip invalid JSON
              }
            }
          }
        }

        // Format final result
        if (resultData) {
          const stepSummary = resultData.steps
            ?.map((s: any) =>
              s.status === "done" ? `✅ **${s.label}**` :
              s.status === "error" ? `❌ **${s.label}** — ${s.error || ""}` :
              `⏳ **${s.label}**`
            )
            .join("\n") || "";

          let messageContent = `## ✅ Task Complete!\n\n${resultData.summary || "Your task has been executed successfully."}\n\n`;

          if (stepSummary) {
            messageContent += `### 📋 Execution Steps\n${stepSummary}\n\n`;
          }

          // Research results
          if (resultData.data?.results?.length > 0) {
            messageContent += `### 🔍 Search Results\n${resultData.data.results.slice(0, 5).map((r: any, i: number) =>
              `${i + 1}. [${r.title}](${r.url || "#"}) — ${(r.snippet || "").substring(0, 100)}`
            ).join("\n")}\n`;
          }

          // Email drafts
          if (resultData.data?.drafts?.length > 0) {
            messageContent += `### ✉️ Email Drafts\n${resultData.data.drafts.map((d: any) =>
              `**To:** ${d.to}\n**Subject:** ${d.subject}\n`
            ).join("\n")}\n_Requires your approval before sending._\n`;
          }

          // Marketing channels
          if (resultData.data?.channels?.length > 0) {
            messageContent += `### 📊 Marketing Channels\n${resultData.data.channels.map((c: any) =>
              `**${c.name}** — ${c.why.substring(0, 100)}...`
            ).join("\n")}\n`;
          }

          // Webpage URL
          if (resultData.data?.url) {
            messageContent += `\n🔗 **Preview:** [View Page](${resultData.data.url})\n`;
          }

          // List/data items
          if (resultData.data?.items?.length > 0) {
            messageContent += `\n### 📋 Sample Data\n${resultData.data.items.slice(0, 3).map((i: any) =>
              `- ${i.name} ${i.contact ? `(${i.contact})` : ""}`
            ).join("\n")}\n_${resultData.data.totalCount || resultData.data.items.length} total entries_\n`;
          }

          // Product data
          if (resultData.data?.product) {
            messageContent += `\n### 📦 Product\n**${resultData.data.product.name}** — $${resultData.data.product.price}\n_${resultData.data.product.description?.substring(0, 100)}..._\n`;
          }

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: messageContent, status: "done", metadata: resultData }
                : m
            )
          );
        } else {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantMsg.id
                ? { ...m, content: "✅ Task completed. Results are ready.", status: "done" }
                : m
            )
          );
        }
      } catch (error: any) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? { ...m, content: `❌ **Execution failed:** ${error.message}`, status: "error" }
              : m
          )
        );
      } finally {
        incrementUsage("conversation");
        setIsProcessing(false);
      }
    } else {
      // === ROUTE TO CHAT AI (conversational) ===
      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: content,
            conversationId,
            history: messages.map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) throw new Error("No response body");

        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id ? { ...m, status: "done" } : m
                  )
                );
              } else {
                try {
                  const chunk: ChatStreamChunk = JSON.parse(data);
                  if (chunk.type === "text") {
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantMsg.id
                          ? { ...m, content: m.content + chunk.content }
                          : m
                      )
                    );
                  } else if (chunk.type === "result") {
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantMsg.id
                          ? { ...m, metadata: { ...m.metadata, ...chunk.metadata } }
                          : m
                      )
                    );
                  } else if (chunk.type === "error") {
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === assistantMsg.id
                          ? { ...m, content: chunk.content, status: "error" }
                          : m
                      )
                    );
                  }
                } catch {
                  // Skip invalid JSON
                }
              }
            }
          }
        }
      } catch (error: any) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id
              ? {
                  ...m,
                  content: error.message || "Failed to process. Please try again.",
                  status: "error",
                }
              : m
          )
        );
      } finally {
        incrementUsage("conversation");
        setIsProcessing(false);
      }
    }
  };

  const handleViewResults = (taskId: string) => {
    router.push("/dashboard/tasks");
  };

  const clearConversation = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: "👋 Hi! I'm **Axel**, your autonomous AI executive assistant.\n\nStart a new conversation by telling me what you need done!",
        timestamp: new Date(),
        status: "done",
      },
    ]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/60 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center">
            <MessageSquare className="h-5 w-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Axel</h2>
            <p className="text-[11px] text-slate-500">
              {isProcessing ? "Agent is working..." : "Ready to execute tasks"}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={clearConversation}
          className="text-slate-500 hover:text-slate-300 h-8"
        >
          <Trash2 className="h-4 w-4 mr-1.5" /> New Chat
        </Button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-6 pr-2 scroll-smooth min-h-0" style={{ maxHeight: "calc(100vh - 380px)" }}>
        {messages.map((msg) => (
          <ChatMessageBubble
            key={msg.id}
            message={msg}
            onViewResults={handleViewResults}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="pt-4 border-t border-slate-800/60 mt-4">
        <ChatInput onSend={handleSend} disabled={isProcessing} />
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        open={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        reason={trialReason}
      />
    </div>
  );
}
