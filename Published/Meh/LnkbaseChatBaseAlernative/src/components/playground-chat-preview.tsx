"use client";

import {
  Bot,
  Brain,
  Camera,
  ChevronRight,
  Headphones,
  Link2,
  Loader2,
  Megaphone,
  MessageCircle,
  Mic,
  Monitor,
  Plus,
  RefreshCw,
  Rewind,
  Rocket,
  Search,
  Send,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  X,
} from "lucide-react";
import type { FormEvent, ReactNode, RefObject } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

type WidgetView = "home" | "chat" | "ticket" | "bug" | "help" | "feedback" | "changelog";

export type PlaygroundFeature =
  | "ticket"
  | "bugCapture"
  | "help"
  | "feedback"
  | "changelog"
  | "suggestedPrompts"
  | "sources"
  | "voice"
  | "ratings"
  | "branding";

export type PlaygroundIconName = "bot" | "message" | "sparkles" | "headphones" | "brain" | "rocket";

export const playgroundIconOptions: Array<{
  id: PlaygroundIconName;
  label: string;
  icon: typeof Bot;
}> = [
  { id: "bot", label: "Bot", icon: Bot },
  { id: "message", label: "Chat", icon: MessageCircle },
  { id: "sparkles", label: "Spark", icon: Sparkles },
  { id: "headphones", label: "Support", icon: Headphones },
  { id: "brain", label: "Brain", icon: Brain },
  { id: "rocket", label: "Launch", icon: Rocket },
];

const playgroundIcons = playgroundIconOptions.reduce(
  (icons, option) => ({ ...icons, [option.id]: option.icon }),
  {} as Record<PlaygroundIconName, typeof Bot>
);

const defaultEnabledFeatures: Record<PlaygroundFeature, boolean> = {
  ticket: true,
  bugCapture: true,
  help: true,
  feedback: true,
  changelog: true,
  suggestedPrompts: true,
  sources: true,
  voice: true,
  ratings: true,
  branding: true,
};

const defaultPrompts = [
  "What do you offer?",
  "Which plan is right for me?",
  "How do I add this to my website?",
];

const localAnswers: Record<string, string> = {
  "What do you offer?":
    "Lnkbase lets you create a trained AI support agent, test it in the playground, capture leads, and embed the chat bubble on any website.",
  "Which plan is right for me?":
    "Start with Free while you test the agent. Move to Hobby or Standard when you need more monthly messages, integrations, and analytics.",
  "How do I add this to my website?":
    "Open Deploy, copy the embed script, and paste it before the closing body tag on your website.",
};

export function PlaygroundChatPreview({
  agentId,
  agentName = "Lnkbase Assistant",
  enabledFeatures,
  iconName = "bot",
  welcomeMessage = "Hi! What can I help you with?",
  suggestedQuestions = defaultPrompts,
  themeColor = "#6256ff",
}: {
  agentId?: string;
  agentName?: string;
  enabledFeatures?: Partial<Record<PlaygroundFeature, boolean>>;
  iconName?: PlaygroundIconName;
  welcomeMessage?: string;
  suggestedQuestions?: string[];
  themeColor?: string;
}) {
  const [view, setView] = useState<WidgetView>("chat");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [helpArticles, setHelpArticles] = useState([
    "Installation overview",
    "Tracking user data",
    `${agentName} overview`,
  ]);
  const [ticketOptions, setTicketOptions] = useState(["Bug Report"]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: welcomeMessage,
    },
  ]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const features = { ...defaultEnabledFeatures, ...enabledFeatures };
  const Icon = playgroundIcons[iconName] ?? Bot;

  const prompts = useMemo(
    () => (suggestedQuestions.length ? suggestedQuestions : defaultPrompts).slice(0, 4),
    [suggestedQuestions]
  );

  useEffect(() => {
    if (view === "ticket" && !features.ticket) setView("chat");
    if (view === "bug" && !features.bugCapture) setView("chat");
    if (view === "help" && !features.help) setView("chat");
    if (view === "feedback" && !features.feedback) setView("chat");
    if (view === "changelog" && !features.changelog) setView("chat");
  }, [
    features.bugCapture,
    features.changelog,
    features.feedback,
    features.help,
    features.ticket,
    view,
  ]);

  async function sendMessage(content: string) {
    const clean = content.trim();
    if (!clean || loading) return;

    setView("chat");
    setInput("");
    setShowSources(false);

    const nextMessages: Message[] = [
      ...messages,
      { id: crypto.randomUUID(), role: "user", content: clean },
    ];
    setMessages(nextMessages);
    setLoading(true);

    try {
      const reply = agentId
        ? await requestAgentReply(agentId, nextMessages)
        : localAnswers[clean] ??
          "I can help with product questions, pricing, setup, lead capture, and deployment. Create an agent to connect this preview to live training data.";

      setMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: "assistant", content: reply },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "I had trouble answering. Try again or collect a lead for follow-up.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    sendMessage(input || prompts[0]);
  }

  function resetChat() {
    setMessages([{ id: "welcome", role: "assistant", content: welcomeMessage }]);
    setInput("");
    setShowSources(false);
    setView("chat");
  }

  function addHelpArticle(value: string) {
    const clean = value.trim();
    if (!clean) return;
    setHelpArticles((current) => [...current, clean]);
  }

  function addTicketOption(value: string) {
    const clean = value.trim();
    if (!clean) return;
    setTicketOptions((current) => [...current, clean]);
  }

  return (
    <section className="relative min-h-[780px] overflow-hidden rounded-[2rem] border border-[#e5e5e5] bg-[radial-gradient(#dedee3_1.8px,transparent_1.8px)] bg-[length:36px_36px] p-6 shadow-sm">
      <Card className="mx-auto flex h-[720px] max-w-[560px] gap-0 rounded-[2rem] border-[#e6e6e9] bg-white py-0 shadow-xl shadow-black/5">
        {view === "home" ? (
          <SupportHome
            agentName={agentName}
            features={features}
            helpArticles={helpArticles}
            Icon={Icon}
            onNavigate={setView}
            onAsk={() => {
              setView("chat");
              requestAnimationFrame(() => inputRef.current?.focus());
            }}
            onAddHelpArticle={addHelpArticle}
            onAddTicketOption={addTicketOption}
            onRemoveHelpArticle={(item) =>
              setHelpArticles((current) => current.filter((value) => value !== item))
            }
            onRemoveTicketOption={(item) =>
              setTicketOptions((current) => current.filter((value) => value !== item))
            }
            ticketOptions={ticketOptions}
            themeColor={themeColor}
          />
        ) : (
          <ChatSurface
            agentName={agentName}
            features={features}
            input={input}
            inputRef={inputRef}
            Icon={Icon}
            helpArticles={helpArticles}
            loading={loading}
            messages={messages}
            prompts={prompts}
            showSources={showSources}
            ticketOptions={ticketOptions}
            themeColor={themeColor}
            view={view}
            onAddHelpArticle={addHelpArticle}
            onAddTicketOption={addTicketOption}
            onBack={() => setView("home")}
            onInputChange={setInput}
            onNavigate={setView}
            onReset={resetChat}
            onRemoveHelpArticle={(item) =>
              setHelpArticles((current) => current.filter((value) => value !== item))
            }
            onRemoveTicketOption={(item) =>
              setTicketOptions((current) => current.filter((value) => value !== item))
            }
            onSend={sendMessage}
            onSubmit={handleSubmit}
            onToggleSources={() => setShowSources((value) => !value)}
          />
        )}
      </Card>
      <Button
        type="button"
        size="icon-lg"
        className="absolute bottom-5 right-5 size-16 rounded-full shadow-xl"
        style={{ backgroundColor: themeColor }}
        aria-label="Open playground widget"
        onClick={() => setView((current) => (current === "home" ? "chat" : "home"))}
      >
        <Icon size={24} />
      </Button>
    </section>
  );
}

function ChatSurface({
  agentName,
  features,
  helpArticles,
  Icon,
  input,
  inputRef,
  loading,
  messages,
  prompts,
  showSources,
  ticketOptions,
  themeColor,
  view,
  onAddHelpArticle,
  onAddTicketOption,
  onBack,
  onInputChange,
  onNavigate,
  onReset,
  onRemoveHelpArticle,
  onRemoveTicketOption,
  onSend,
  onSubmit,
  onToggleSources,
}: {
  agentName: string;
  features: Record<PlaygroundFeature, boolean>;
  helpArticles: string[];
  Icon: typeof Bot;
  input: string;
  inputRef: RefObject<HTMLInputElement | null>;
  loading: boolean;
  messages: Message[];
  prompts: string[];
  showSources: boolean;
  ticketOptions: string[];
  themeColor: string;
  view: WidgetView;
  onAddHelpArticle: (value: string) => void;
  onAddTicketOption: (value: string) => void;
  onBack: () => void;
  onInputChange: (value: string) => void;
  onNavigate: (view: WidgetView) => void;
  onReset: () => void;
  onRemoveHelpArticle: (item: string) => void;
  onRemoveTicketOption: (item: string) => void;
  onSend: (message: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToggleSources: () => void;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem] bg-white">
      <header
        className="flex h-20 shrink-0 items-center justify-between rounded-t-[2rem] px-7 text-white"
        style={{ backgroundColor: themeColor }}
      >
        <div className="flex min-w-0 items-center gap-4">
          <button
            type="button"
            className="grid size-11 shrink-0 place-items-center rounded-full bg-black text-white"
            onClick={onBack}
            aria-label="Back to widget home"
          >
            <Icon size={23} />
          </button>
          <div className="min-w-0">
            <h2 className="truncate text-xl font-semibold tracking-tight">
              {agentName}
            </h2>
            <p className="text-xs font-medium text-white/70">Trained and ready</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon-lg"
          className="text-white hover:bg-white/10 hover:text-white"
          aria-label="Restart chat"
          onClick={onReset}
        >
          <RefreshCw size={25} />
        </Button>
      </header>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex-1 overflow-y-auto px-8 py-8">
          {view === "chat" && (
            <div className="space-y-7">
              {messages.map((message, index) => (
                <MessageBubble
                  key={message.id}
                  features={features}
                  message={message}
                  latestAssistant={
                    message.role === "assistant" && index === messages.length - 1
                  }
                  themeColor={themeColor}
                />
              ))}
              {loading && (
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                  <Loader2 className="animate-spin" size={16} />
                  Thinking...
                </div>
              )}
            </div>
          )}

          {view === "ticket" && features.ticket && (
            <Panel title="Submit ticket" description="Send the team a support request.">
              <EditableOptionList
                addLabel="Add ticket type"
                items={ticketOptions}
                placeholder="Refund request"
                onAdd={onAddTicketOption}
                onRemove={onRemoveTicketOption}
              />
              <Input placeholder="Email address" />
              <Input placeholder="Issue title" />
              <textarea
                className="min-h-28 rounded-xl border border-border bg-white p-3 text-sm outline-none focus:border-[#6b5cff] focus:ring-4 focus:ring-[#6b5cff]/15"
                placeholder="What happened?"
              />
              <Button
                type="button"
                className="h-11"
                style={{ backgroundColor: themeColor }}
                onClick={() => onNavigate("chat")}
              >
                Create ticket
              </Button>
            </Panel>
          )}

          {view === "bug" && features.bugCapture && (
            <Panel
              title="Report a bug"
              description="Capture evidence and share a clear bug report link."
            >
              <BugCaptureModes themeColor={themeColor} />
            </Panel>
          )}

          {view === "help" && features.help && (
            <Panel title="Search help" description="Find setup and deployment docs.">
              <div className="flex min-h-12 items-center gap-3 rounded-xl bg-[#f4f4f5] px-4">
                <Search className="text-muted-foreground" size={20} />
                <Input
                  className="h-10 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                  placeholder="Search help articles"
                />
              </div>
              <EditableOptionList
                addLabel="Add help article"
                items={helpArticles}
                placeholder="Billing FAQ"
                onAdd={onAddHelpArticle}
                onOpen={onSend}
                onRemove={onRemoveHelpArticle}
              />
            </Panel>
          )}

          {view === "feedback" && features.feedback && (
            <Panel title="Leave feedback" description="Tell the agent what to improve.">
              <textarea
                className="min-h-36 rounded-xl border border-border bg-white p-3 text-sm outline-none focus:border-[#6b5cff] focus:ring-4 focus:ring-[#6b5cff]/15"
                placeholder="Share feedback..."
              />
              <Button
                type="button"
                className="h-11"
                style={{ backgroundColor: themeColor }}
                onClick={() => onNavigate("chat")}
              >
                Submit feedback
              </Button>
            </Panel>
          )}

          {view === "changelog" && features.changelog && (
            <Panel title="Changelog" description="Recent product updates.">
              {["OpenRouter model selection", "Embeddable website widget", "Lead capture forms"].map(
                (item) => (
                  <div key={item} className="rounded-xl border border-border p-4">
                    <p className="font-semibold">{item}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Available in this Lnkbase agent workspace.
                    </p>
                  </div>
                )
              )}
            </Panel>
          )}
        </div>

        {view === "chat" && (
          <div className="px-7 pb-7">
            {features.suggestedPrompts && (
            <div className="mb-6 grid grid-cols-2 gap-3">
              {prompts.map((prompt, index) => (
                <Button
                  key={prompt}
                  variant="outline"
                  className={cn(
                    "h-auto min-h-12 rounded-full border-[#dddde3] bg-white px-5 text-sm shadow-none hover:bg-[#f7f7ff]",
                    index === 0 && "col-start-2"
                  )}
                  onClick={() => onSend(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
            )}

            {features.sources && showSources && (
              <div className="mb-4 rounded-xl border border-border bg-[#fafafa] p-4 text-sm text-muted-foreground">
                Sources are pulled from the agent knowledge base and website
                training data when the saved agent endpoint responds.
              </div>
            )}

            <div className="mb-5 flex justify-center">
              {features.branding && (
                <Badge
                  variant="secondary"
                  className="h-7 gap-2 rounded-md bg-transparent text-sm text-muted-foreground"
                >
                  <Icon size={17} />
                  Powered by Lnkbase
                </Badge>
              )}
            </div>

            <form
              onSubmit={onSubmit}
              className="flex min-h-16 items-center gap-2 rounded-full border-2 border-black bg-white px-5 shadow-lg shadow-black/5"
            >
              <Input
                ref={inputRef}
                value={input}
                onChange={(event) => onInputChange(event.target.value)}
                placeholder="Message..."
                className="h-12 flex-1 border-0 px-0 text-lg shadow-none focus-visible:ring-0"
              />
              {features.voice && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-lg"
                  className="text-muted-foreground"
                  aria-label="Voice input"
                >
                  <Mic size={25} />
                </Button>
              )}
              <Button
                type="submit"
                size="icon-lg"
                className="rounded-full text-white"
                style={{ backgroundColor: themeColor }}
                disabled={loading}
                aria-label="Send message"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              </Button>
            </form>

            {features.sources && (
              <Button
                variant="outline"
                className="mx-auto mt-5 flex h-11 w-full rounded-xl border-[#dddde3] bg-white font-semibold shadow-sm"
                onClick={onToggleSources}
              >
                {showSources ? "Hide sources" : "Show sources"}
              </Button>
            )}
          </div>
        )}

        {view !== "chat" && (
          <WidgetFooter active={view} features={features} onNavigate={onNavigate} themeColor={themeColor} />
        )}
      </div>
    </div>
  );
}

function SupportHome({
  agentName,
  features,
  helpArticles,
  Icon,
  onAsk,
  onAddHelpArticle,
  onAddTicketOption,
  onNavigate,
  onRemoveHelpArticle,
  onRemoveTicketOption,
  ticketOptions,
  themeColor,
}: {
  agentName: string;
  features: Record<PlaygroundFeature, boolean>;
  helpArticles: string[];
  Icon: typeof Bot;
  onAsk: () => void;
  onAddHelpArticle: (value: string) => void;
  onAddTicketOption: (value: string) => void;
  onNavigate: (view: WidgetView) => void;
  onRemoveHelpArticle: (item: string) => void;
  onRemoveTicketOption: (item: string) => void;
  ticketOptions: string[];
  themeColor: string;
}) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-[2rem]">
      <div className="min-h-0 flex-1 overflow-y-auto bg-[#d7d0ff] px-7 pb-6 pt-7">
        <div className="flex items-center justify-between">
          <div
            className="grid size-12 place-items-center rounded-full text-white"
            style={{ backgroundColor: themeColor }}
          >
            <Icon size={26} />
          </div>
          <div className="flex -space-x-3">
            {["MF", "AD", "JK", "HQ"].map((initials, index) => (
              <div
                key={initials}
                className={cn(
                  "grid size-11 place-items-center rounded-full border-2 border-[#d7d0ff] text-sm font-bold text-white",
                  ["bg-[#513b2f]", "bg-[#716355]", "bg-[#9aa7c5]", "bg-[#80621d]"][index]
                )}
              >
                {initials}
              </div>
            ))}
          </div>
        </div>

        <div className="py-16 text-center">
          <h2 className="text-5xl font-semibold tracking-tight text-[#25223e]">
            Hey Musaab!
          </h2>
          <p className="mt-5 text-5xl font-semibold tracking-tight text-[#25223e]">
            How can we help?
          </p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={onAsk}
            variant="outline"
            className="flex h-20 w-full justify-between rounded-xl border-[#dddde6] bg-white px-6 text-left text-xl font-semibold shadow-sm hover:bg-white"
          >
            Ask a question
            <Send className="text-muted-foreground" size={24} />
          </Button>

          {features.ticket && (
          <div className="rounded-xl border border-[#dddde6] bg-white px-6 py-5 shadow-sm">
            <button
              type="button"
              className="flex w-full items-center justify-between text-left"
              onClick={() => onNavigate("ticket")}
            >
              <span className="text-xl font-semibold">Submit ticket</span>
              <ChevronRight className="text-muted-foreground" size={22} />
            </button>
            <div className="mt-4">
              <EditableOptionList
                compact
                addLabel="Add ticket type"
                items={ticketOptions}
                placeholder="Feature request"
                onAdd={onAddTicketOption}
                onRemove={onRemoveTicketOption}
              />
            </div>
          </div>
          )}

          {features.bugCapture && (
            <div className="rounded-xl border border-[#dddde6] bg-white px-4 py-4 shadow-sm">
              <button
                type="button"
                className="flex min-h-14 w-full items-center justify-between rounded-lg px-2 text-left"
                onClick={() => onNavigate("bug")}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Camera size={24} className="shrink-0 text-[#27272a]" />
                  <span className="truncate text-xl font-semibold">Report a bug</span>
                </span>
                <ChevronRight className="shrink-0 text-muted-foreground" size={22} />
              </button>
              <div className="mt-2 grid grid-cols-3 gap-2 px-1">
                {[
                  ["Screenshot", Camera],
                  ["Desktop", Monitor],
                  ["Replay", Rewind],
                ].map(([label, ModeIcon]) => (
                  <div
                    key={label as string}
                    className="grid min-h-16 justify-items-center gap-1 rounded-lg bg-[#f4f4f5] px-2 py-2 text-center text-xs font-semibold text-[#55555e]"
                  >
                    <ModeIcon size={18} className="text-[#27272a]" />
                    <span className="leading-4">{label as string}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {features.help && (
          <div className="rounded-xl border border-[#dddde6] bg-white p-3 shadow-sm">
            <div className="flex min-h-14 items-center justify-between rounded-lg bg-[#f4f4f5] px-4">
              <button
                type="button"
                className="flex flex-1 items-center text-left text-xl font-semibold"
                onClick={() => onNavigate("help")}
              >
                Search for help
              </button>
              <Search className="text-muted-foreground" size={24} aria-hidden />
            </div>
            <div className="px-2 py-4">
              <EditableOptionList
                compact
                addLabel="Add help article"
                items={helpArticles}
                placeholder={`${agentName} guide`}
                onAdd={onAddHelpArticle}
                onOpen={() => onNavigate("help")}
                onRemove={onRemoveHelpArticle}
              />
            </div>
          </div>
          )}

          {features.feedback && (
            <Button
              variant="outline"
              className="flex h-20 w-full justify-between rounded-xl border-[#dddde6] bg-white px-6 text-left text-xl font-semibold shadow-sm hover:bg-white"
              onClick={() => onNavigate("feedback")}
            >
              Leave us feedback
              <ChevronRight className="text-muted-foreground" size={24} />
            </Button>
          )}
        </div>
      </div>

      <WidgetFooter active="home" features={features} onNavigate={onNavigate} themeColor={themeColor} />
    </div>
  );
}

function EditableOptionList({
  addLabel,
  compact = false,
  items,
  onAdd,
  onOpen,
  onRemove,
  placeholder,
}: {
  addLabel: string;
  compact?: boolean;
  items: string[];
  onAdd: (value: string) => void;
  onOpen?: (item: string) => void;
  onRemove: (item: string) => void;
  placeholder: string;
}) {
  const [draft, setDraft] = useState("");

  function submitDraft() {
    const clean = draft.trim();
    if (!clean) return;
    onAdd(clean);
    setDraft("");
  }

  return (
    <div className={cn("space-y-2", compact && "space-y-1.5")}>
      {items.map((item) => (
        <div
          key={item}
          className={cn(
            "flex items-center gap-2 rounded-xl border border-transparent",
            compact ? "min-h-9 px-1" : "min-h-11 border-border px-3"
          )}
        >
          <button
            type="button"
            className={cn(
              "min-w-0 flex-1 truncate text-left font-semibold hover:text-[#6256ff]",
              compact ? "text-base text-[#45454d]" : "text-sm"
            )}
            onClick={() => onOpen?.(item)}
          >
            {item}
          </button>
          <button
            type="button"
            className="grid size-7 shrink-0 place-items-center rounded-full text-muted-foreground transition hover:bg-red-50 hover:text-red-600"
            aria-label={`Remove ${item}`}
            onClick={() => onRemove(item)}
          >
            <X size={15} />
          </button>
        </div>
      ))}
      <form
        className={cn(
          "flex items-center gap-2 rounded-xl border border-dashed border-[#d8d8df] bg-white p-1.5",
          compact ? "mt-2" : "mt-3"
        )}
        onSubmit={(event) => {
          event.preventDefault();
          submitDraft();
        }}
      >
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          className="h-9 border-0 bg-transparent shadow-none focus-visible:ring-0"
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-1 rounded-lg"
          onClick={submitDraft}
        >
          <Plus size={14} />
          {addLabel}
        </Button>
      </form>
    </div>
  );
}

function MessageBubble({
  features,
  latestAssistant,
  message,
  themeColor,
}: {
  features: Record<PlaygroundFeature, boolean>;
  latestAssistant: boolean;
  message: Message;
  themeColor: string;
}) {
  const user = message.role === "user";

  return (
    <div className={cn(user && "ml-auto max-w-[80%]")}>
      <div
        className={cn(
          "w-fit max-w-[88%] rounded-[1.7rem] px-6 py-4 text-lg leading-8",
          user ? "ml-auto text-white" : "bg-[#f4f4f5] text-[#27272a]"
        )}
        style={user ? { backgroundColor: themeColor } : undefined}
      >
        {message.content}
      </div>
      {latestAssistant && features.ratings && (
        <div className="mt-3 flex items-center gap-4 pl-6 text-sm font-medium text-muted-foreground">
          <span>Just now</span>
          <span className="h-5 w-px bg-border" />
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label="Good answer">
            <ThumbsUp size={19} />
          </Button>
          <Button variant="ghost" size="icon-sm" className="text-muted-foreground" aria-label="Bad answer">
            <ThumbsDown size={19} />
          </Button>
        </div>
      )}
    </div>
  );
}

function BugCaptureModes({ themeColor }: { themeColor: string }) {
  const modes: Array<{
    title: string;
    detail?: string;
    icon: typeof Camera;
    dropdown?: boolean;
  }> = [
    { title: "Capture Screenshot", icon: Camera, dropdown: true },
    { title: "Record Desktop", detail: "Mic On", icon: Monitor, dropdown: true },
    { title: "Instant Replay", icon: Rewind },
  ];

  return (
    <div className="space-y-3">
      {modes.map(({ detail, dropdown, icon: Icon, title }) => (
        <button
          key={title}
          type="button"
          className="flex min-h-16 w-full items-center gap-4 rounded-xl border border-[#dddde6] bg-white px-4 text-left text-lg font-semibold shadow-sm transition hover:bg-[#fafafa]"
        >
          <Icon size={24} className="shrink-0 text-[#27272a]" />
          <span className="min-w-0 flex-1 truncate">{title}</span>
          {detail && (
            <span
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1 text-sm font-semibold"
              style={{ backgroundColor: `${themeColor}18`, color: themeColor }}
            >
              <Mic size={17} />
              On
            </span>
          )}
          {dropdown && (
            <span className="grid h-10 w-9 shrink-0 place-items-center border-l border-[#e5e5e9] text-muted-foreground">
              <ChevronRight size={20} className="rotate-90" />
            </span>
          )}
        </button>
      ))}

      <div className="mt-5 flex min-h-16 items-center gap-3 rounded-xl border border-[#e5e5e9] bg-white px-3 shadow-sm">
        <Input
          className="h-11 flex-1 border-0 px-1 text-base shadow-none focus-visible:ring-0"
          placeholder="Request a recording"
        />
        <Button
          type="button"
          className="h-11 shrink-0 gap-2 rounded-xl px-4 text-base font-semibold"
          style={{ backgroundColor: themeColor }}
        >
          <Link2 size={19} />
          Create link
        </Button>
      </div>
    </div>
  );
}

function Panel({
  children,
  description,
  title,
}: {
  children: ReactNode;
  description: string;
  title: string;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="grid gap-3">{children}</div>
    </div>
  );
}

function WidgetFooter({
  active,
  features,
  onNavigate,
  themeColor,
}: {
  active: WidgetView;
  features: Record<PlaygroundFeature, boolean>;
  onNavigate: (view: WidgetView) => void;
  themeColor: string;
}) {
  const allItems: Array<[WidgetView, string, typeof Bot, PlaygroundFeature?]> = [
    ["home", "Home", Bot],
    ["chat", "Messages", MessageCircle],
    ["bug", "Bugs", Camera, "bugCapture"],
    ["help", "Help", Search, "help"],
    ["changelog", "Changelog", Megaphone, "changelog"],
  ];
  const items = allItems.filter(([, , , feature]) => !feature || features[feature]);

  return (
    <footer className="border-t border-[#e5e5e9] bg-white px-7 pb-4 pt-5">
      <div
        className="grid gap-2 text-center"
        style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}
      >
        {items.map(([view, label, Icon]) => {
          const isActive = active === view;
          return (
            <button
              key={view}
              type="button"
              className={cn(
                "grid justify-items-center gap-2 text-sm font-semibold",
                isActive ? "text-[#7060ff]" : "text-[#55555e]"
              )}
              style={isActive ? { color: themeColor } : undefined}
              onClick={() => onNavigate(view)}
            >
              <Icon size={25} className={isActive ? "fill-current opacity-90" : ""} />
              {label}
            </button>
          );
        })}
      </div>
      {features.branding && (
      <p className="mt-4 text-center text-sm font-semibold text-[#55555e]">
        Powered by Lnkbase
      </p>
      )}
    </footer>
  );
}

async function requestAgentReply(agentId: string, messages: Message[]) {
  const response = await fetch(`/api/widget/${agentId}/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      visitorId: "playground-preview",
      pageUrl: "/dashboard/playground",
    }),
  });

  const data = (await response.json()) as { reply?: string; error?: string };
  if (!response.ok) throw new Error(data.error ?? "Failed to ask the agent.");
  return data.reply ?? "I do not have an answer yet.";
}
