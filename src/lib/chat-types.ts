export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
  status?: "sending" | "streaming" | "done" | "error";
  metadata?: Record<string, any>;
}

export interface ChatStreamChunk {
  type: "text" | "status" | "result" | "error" | "done";
  content: string;
  metadata?: any;
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}