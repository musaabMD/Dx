"use client";

import { Bot, Menu, MessageCircle, Minimize2, RefreshCcw, Send } from "lucide-react";
import { FormEvent, useRef, useState } from "react";

type Message = { id: number; role: "assistant" | "user"; text: string };

const questions = [
  "What is Lnkbase?",
  "Which plan is right for me?",
  "How do I add it to my website?",
  "Can I book a demo?",
];

function reply(text: string) {
  const lower = text.toLowerCase();
  if (lower.includes("plan") || lower.includes("price")) {
    return "Free is best for testing. Hobby is a good first paid plan. Standard fits teams that need API access, higher message volume, and help desk workflows.";
  }
  if (lower.includes("website") || lower.includes("add") || lower.includes("embed")) {
    return "Add the website widget by copying one script into your site. You can also share an agent page or connect support channels later.";
  }
  if (lower.includes("demo") || lower.includes("contact")) {
    return "I can collect your email, company, and website, then send the conversation to the team for a demo follow-up.";
  }
  return "Lnkbase trains an AI agent from your website, files, Q&A, and support content so visitors get fast answers and your team gets chat logs, leads, and analytics.";
}

export function ChatDemo({ compact = false, title = "Lnkbase Assistant" }: { compact?: boolean; title?: string }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      text: "Hi, I am the Lnkbase Assistant. Ask me anything about the product.",
    },
  ]);
  const [input, setInput] = useState("");
  const nextId = useRef(2);

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    const id = nextId.current;
    nextId.current += 2;
    setMessages((current) => [
      ...current,
      { id, role: "user", text: trimmed },
      { id: id + 1, role: "assistant", text: reply(trimmed) },
    ]);
    setInput("");
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    send(input);
  }

  return (
    <div className={`flex h-full min-h-[520px] flex-col overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-xl shadow-black/5 ${compact ? "min-h-[460px]" : ""}`}>
      <div className="flex items-center justify-between border-b border-black/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-[#6b5cff] text-white">
            <Bot size={20} />
          </div>
          <div>
            <p className="font-semibold">{title}</p>
            <p className="text-xs text-[#7b7b84]">Online</p>
          </div>
        </div>
        <button className="grid size-9 place-items-center rounded-full border border-black/10" aria-label="Widget menu">
          <Menu size={16} />
        </button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto bg-[#fbfbf8] p-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[86%] rounded-[20px] px-4 py-3 text-sm leading-6 ${message.role === "user" ? "bg-[#111111] text-white" : "border border-black/10 bg-white text-[#24242a]"}`}>
              {message.text}
            </div>
          </div>
        ))}
        <div className="grid gap-2 pt-2">
          {questions.slice(0, compact ? 3 : 4).map((question) => (
            <button
              key={question}
              onClick={() => send(question)}
              className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-left text-sm font-medium text-[#464650] transition hover:border-[#6b5cff]/30 hover:bg-[#f3f1ff]"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      <form onSubmit={submit} className="border-t border-black/10 bg-white p-3">
        <div className="flex items-center gap-2 rounded-full border border-black/10 bg-[#f6f6f3] px-3 py-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask me anything..."
            className="h-9 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-[#8c8c96]"
          />
          <button type="submit" className="grid size-9 shrink-0 place-items-center rounded-full bg-[#6b5cff] text-white" aria-label="Send demo message">
            <Send size={16} />
          </button>
        </div>
        <p className="pt-2 text-center text-xs font-medium text-[#8a8a93]">Powered by Lnkbase</p>
      </form>
    </div>
  );
}

export function FloatingChatWidget() {
  const [open, setOpen] = useState(false);
  const [showTip, setShowTip] = useState(true);
  const [unread, setUnread] = useState(true);

  function toggle() {
    setOpen(!open);
    setShowTip(false);
    setUnread(false);
  }

  return (
    <div className="fixed bottom-[calc(20px+env(safe-area-inset-bottom))] right-5 z-[999999]">
      {open && (
        <div className="fixed inset-0 z-[999999] flex bg-white sm:inset-auto sm:bottom-24 sm:right-6 sm:h-[650px] sm:max-h-[calc(100vh-120px)] sm:w-[400px] sm:rounded-[28px] sm:border sm:border-black/10 sm:shadow-2xl sm:shadow-black/20">
          <div className="flex h-[100dvh] w-full flex-col overflow-hidden sm:h-full sm:rounded-[28px]">
            <div className="flex h-16 shrink-0 items-center justify-between border-b border-black/10 bg-[#111111] px-4 text-white">
              <div className="flex items-center gap-3">
                <div className="grid size-10 place-items-center rounded-2xl bg-[#6b5cff]">
                  <Bot size={20} />
                </div>
                <div>
                  <p className="font-semibold">Lnkbase Assistant</p>
                  <p className="text-xs text-white/60">Online</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button className="grid size-9 place-items-center rounded-full text-white/70 hover:bg-white/10" aria-label="Restart chat">
                  <RefreshCcw size={16} />
                </button>
                <button onClick={toggle} className="grid size-9 place-items-center rounded-full text-white/70 hover:bg-white/10" aria-label="Close chat widget">
                  <Minimize2 size={17} />
                </button>
              </div>
            </div>
            <ChatDemo compact title="Lnkbase Assistant" />
          </div>
        </div>
      )}
      {!open && showTip && (
        <div className="mb-3 mr-1 hidden rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[#303039] shadow-xl shadow-black/10 sm:block">
          Hi! Ask me anything.
        </div>
      )}
      {!open && (
        <button onClick={toggle} className="relative grid size-16 place-items-center rounded-full bg-[#6b5cff] text-white shadow-xl shadow-[#6b5cff]/30 transition hover:scale-105" aria-label="Open chat widget">
          {unread && <span className="absolute right-1 top-1 grid size-5 place-items-center rounded-full bg-[#111111] text-[11px] font-semibold">1</span>}
          <MessageCircle size={28} />
        </button>
      )}
    </div>
  );
}
