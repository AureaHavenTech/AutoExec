"use client";

import React from "react";
import { Bot, User, Loader2, CheckCircle2, AlertTriangle, FileSpreadsheet } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ChatMessage } from "@/lib/chat-types";

interface ChatMessageProps {
  message: ChatMessage;
  onViewResults?: (taskId: string) => void;
}

export function ChatMessageBubble({ message, onViewResults }: ChatMessageProps) {
  const isUser = message.role === "user";
  const isAssistant = message.role === "assistant";
  const isStreaming = message.status === "streaming";
  const isError = message.status === "error";

  return (
    <div className={`flex w-full gap-3 ${isUser ? "justify-end" : "justify-start"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
      {/* Avatar (assistant only) */}
      {isAssistant && (
        <div className="h-9 w-9 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center shrink-0 mt-1">
          <Bot className="h-5 w-5 text-brand-400" />
        </div>
      )}

      {/* Message content */}
      <div className={`max-w-[80%] md:max-w-[70%] space-y-2 ${isUser ? "items-end" : "items-start"}`}>
        {/* Sender label */}
        <div className={`text-[11px] font-semibold tracking-wider uppercase ${isUser ? "text-right text-slate-500" : "text-brand-400"}`}>
          {isUser ? "You" : "AutoExec"}
        </div>

        {/* Bubble */}
        <div
          className={`
            rounded-2xl px-5 py-3.5 text-sm leading-relaxed
            ${isUser
              ? "bg-brand-500 text-white rounded-br-md shadow-lg shadow-brand-500/20"
              : isError
                ? "bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-bl-md"
                : "bg-slate-900/60 border border-slate-800/50 text-slate-200 rounded-bl-md"
            }
          `}
        >
          {isStreaming && message.content === "" ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="h-4 w-4 animate-spin text-brand-400" />
              <span className="text-slate-400 text-xs">Thinking...</span>
            </div>
          ) : (
            <div className="whitespace-pre-wrap">{message.content}</div>
          )}

          {isStreaming && message.content && (
            <span className="inline-block w-1.5 h-4 bg-brand-400 animate-pulse ml-0.5 rounded-sm align-middle" />
          )}
        </div>

        {/* Metadata / status indicators */}
        {message.metadata && !isStreaming && (
          <div className="space-y-2">
            {/* Stats bar */}
            {message.metadata.itemsCount && (
              <div className="flex items-center gap-3 text-xs text-slate-400 bg-slate-900/40 rounded-lg px-3 py-2 border border-slate-800/50">
                <span className="flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="font-semibold text-emerald-400">{message.metadata.itemsCount}</span> targets found
                </span>
                {message.metadata.executionTime && (
                  <span className="text-slate-500">⏱ {message.metadata.executionTime}</span>
                )}
              </div>
            )}

            {/* Results preview table */}
            {message.metadata.resultsPreview && message.metadata.resultsPreview.length > 0 && (
              <div className="bg-slate-950/80 border border-slate-800/50 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/60 border-b border-slate-800 text-slate-400 font-semibold">
                      <th className="px-3 py-2">Name</th>
                      <th className="px-3 py-2">Domain / Role</th>
                      <th className="px-3 py-2">Contact</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40">
                    {message.metadata.resultsPreview.slice(0, 5).map((lead, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/30 text-slate-300">
                        <td className="px-3 py-2 font-medium text-white">{lead.name}</td>
                        <td className="px-3 py-2 text-slate-400">{lead.domain || lead.role || "—"}</td>
                        <td className="px-3 py-2 text-brand-400 font-mono">{lead.email || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {message.metadata.resultsPreview.length > 5 && (
                  <div className="px-3 py-2 text-xs text-slate-500 border-t border-slate-800/40 text-center">
                    +{message.metadata.resultsPreview.length - 5} more results
                  </div>
                )}
              </div>
            )}

            {/* View full results button */}
            {message.metadata.taskId && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onViewResults?.(message.metadata!.taskId!)}
                className="w-full text-xs h-8"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 mr-1.5" /> View Full Results in Task Board
              </Button>
            )}
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="flex items-center gap-1.5 text-xs text-rose-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Task execution failed. Please try again.</span>
          </div>
        )}

        {/* Timestamp */}
        <div className={`text-[10px] text-slate-600 ${isUser ? "text-right" : ""}`}>
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>

      {/* Avatar (user only) */}
      {isUser && (
        <div className="h-9 w-9 rounded-xl bg-brand-500 flex items-center justify-center shrink-0 mt-1 shadow-lg shadow-brand-500/20">
          <User className="h-5 w-5 text-white" />
        </div>
      )}
    </div>
  );
}