"use client";

import { FormEvent, useMemo, useState } from "react";
import { ArrowUp, Bot, RefreshCcw } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export function PublicWidget({
  agentId,
  title = "AI Assistant",
}: {
  agentId: string;
  title?: string;
}) {
  const visitorId = useMemo(() => crypto.randomUUID(), []);
  const [conversationId, setConversationId] = useState<string | undefined>();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! What can I help you with?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    setInput("");
    setMessages((current) => [...current, { role: "user", content: message }]);
    setLoading(true);

    try {
      const response = await fetch(`/api/widget/${agentId}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversationId,
          visitorId,
          pageUrl: typeof document !== "undefined" ? document.referrer : "",
        }),
      });
      const data = (await response.json()) as {
        conversationId?: string;
        reply?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Chat failed");
      }

      setConversationId(data.conversationId);
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content: data.reply ?? "I could not answer that yet.",
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-white p-0 text-[#111111] sm:bg-[radial-gradient(circle,#e4e4e7_1.5px,transparent_1.5px)] sm:bg-[length:32px_32px] sm:p-6">
      <section className="flex h-dvh w-full max-w-[420px] flex-col overflow-hidden bg-white shadow-2xl shadow-black/10 sm:h-[680px] sm:rounded-[28px] sm:border sm:border-black/10">
        <header className="flex h-20 shrink-0 items-center justify-between bg-[#6b5cff] px-5 text-white">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-full bg-black text-white">
              <Bot size={20} />
            </div>
            <div>
              <p className="font-semibold">{title}</p>
              <p className="text-xs text-white/70">Online</p>
            </div>
          </div>
          <button
            className="grid size-9 place-items-center rounded-full text-white/80 hover:bg-white/10"
            aria-label="Restart conversation"
            onClick={() => {
              setConversationId(undefined);
              setMessages([
                { role: "assistant", content: "Hi! What can I help you with?" },
              ]);
            }}
          >
            <RefreshCcw size={18} />
          </button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto p-5">
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[84%] rounded-[24px] px-4 py-3 text-sm leading-6 ${
                  message.role === "user"
                    ? "bg-[#6b5cff] text-white"
                    : "bg-[#f4f4f5] text-[#27272a]"
                }`}
              >
                {message.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="w-fit rounded-[24px] bg-[#f4f4f5] px-4 py-3 text-sm text-muted-foreground">
              Thinking...
            </div>
          )}
        </div>

        <form
          onSubmit={sendMessage}
          className="shrink-0 border-t border-black/10 bg-white p-4"
        >
          <div className="flex min-h-12 items-center gap-2 rounded-full border border-black/15 px-4 shadow-sm">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Message..."
              className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="grid size-9 place-items-center rounded-full bg-[#6b5cff] text-white disabled:bg-[#f4f4f5] disabled:text-[#a1a1aa]"
              aria-label="Send message"
            >
              <ArrowUp size={17} />
            </button>
          </div>
          <p className="mt-3 text-center text-xs font-medium text-muted-foreground">
            Powered by Lnkbase
          </p>
        </form>
      </section>
    </main>
  );
}
