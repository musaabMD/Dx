"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { signOutAction } from "@/app/actions/auth";
import { ThemeToggle } from "@/components/ThemeToggle";
import { playReceiveSound, playSendSound, unlockSound } from "@/lib/sound";

type Message = {
  id: string;
  examSlug: string;
  channelKey?: string;
  userId: string;
  username: string;
  avatarColor: string;
  text: string;
  dmToUserId?: string;
  dmToUsername?: string;
  replyTo?: {
    id: string;
    username: string;
    text: string;
  };
  createdAt: number;
};

type ExamMeta = {
  slug: string;
  name: string;
  shortName: string;
  iconLabel: string;
  category: string;
  description: string;
  accent: string;
  baseMembers: number;
};

type Participant = {
  kind: "user" | "guest";
  id: string;
  name: string;
  email: string | null;
  avatarColor: string;
  profilePictureUrl: string | null;
};

type ActiveMember = {
  id: string;
  name: string;
  avatarColor: string;
};

type StudyFile = {
  id: string;
  title: string;
  href: string;
  source: string;
  kind: string;
  comments: number;
  votes: number;
  modified: string;
  size: string;
};

type MainView = "chat" | "files" | "about";
type ChannelKey = "main" | "discussion" | "experience" | "files";

function formatTime(ts: number): string {
  const d = new Date(ts);
  let h = d.getHours();
  const m = d.getMinutes();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function isSameDay(a: number, b: number): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function ChatRoom({
  exam,
  initialMessages,
  initialLive,
  participant: initialParticipant,
  signInUrl,
  signUpUrl,
}: {
  exam: ExamMeta;
  initialMessages: Message[];
  initialLive: number;
  participant: Participant | null;
  signInUrl: string;
  signUpUrl: string;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [, setLive] = useState(initialLive);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [signOutPending, setSignOutPending] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Message | null>(null);
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set());
  const [reportedIds, setReportedIds] = useState<Set<string>>(() => new Set());
  const [dmTarget, setDmTarget] = useState<ActiveMember | null>(null);
  const [participant, setParticipant] = useState<Participant | null>(
    initialParticipant
  );
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mainView, setMainView] = useState<MainView>("chat");
  const [selectedChannel, setSelectedChannel] = useState<ChannelKey>("main");
  const [fileVotes, setFileVotes] = useState<Record<string, -1 | 0 | 1>>({});

  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const seenIds = useRef<Set<string>>(new Set(initialMessages.map((m) => m.id)));
  const soundOnRef = useRef(true);
  const userIdRef = useRef<string | null>(initialParticipant?.id ?? null);

  useEffect(() => {
    userIdRef.current = participant?.id ?? null;
  }, [participant]);

  useEffect(() => {
    if (!menuOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [menuOpen]);

  // SSE connection for live updates.
  useEffect(() => {
    if (mainView !== "chat" || dmTarget) return;
    let cancelled = false;
    const params = new URLSearchParams({ channel: selectedChannel });
    fetch(`/api/exam/${exam.slug}/messages?${params.toString()}`, {
      cache: "no-store",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((json: { messages?: Message[] } | null) => {
        if (cancelled || !json?.messages) return;
        seenIds.current = new Set(json.messages.map((m) => m.id));
        setMessages(json.messages);
      })
      .catch(() => {
        // keep the current messages if a channel fetch fails
      });

    const es = new EventSource(`/api/exam/${exam.slug}/stream?${params.toString()}`);
    es.addEventListener("hello", () => setConnected(true));
    es.addEventListener("presence", (ev) => {
      try {
        const data = JSON.parse((ev as MessageEvent).data) as { live: number };
        setLive(data.live);
      } catch {
        // ignore
      }
    });
    es.addEventListener("message", (ev) => {
      try {
        const msg = JSON.parse((ev as MessageEvent).data) as Message;
        if (seenIds.current.has(msg.id)) return;
        seenIds.current.add(msg.id);
        setMessages((m) => {
          const optimisticIdx = m.findIndex(
            (mm) =>
              mm.id.startsWith("local-") &&
              mm.userId === msg.userId &&
              mm.text === msg.text &&
              Math.abs(mm.createdAt - msg.createdAt) < 5000
          );
          if (optimisticIdx >= 0) {
            const next = m.slice();
            next[optimisticIdx] = msg;
            return next;
          }
          return [...m, msg];
        });
        if (
          soundOnRef.current &&
          msg.userId !== userIdRef.current &&
          document.visibilityState === "visible"
        ) {
          playReceiveSound();
        }
      } catch {
        // ignore
      }
    });
    es.onerror = () => setConnected(false);
    return () => {
      cancelled = true;
      es.close();
    };
  }, [dmTarget, exam.slug, mainView, selectedChannel]);

  // Auto-grow the textarea.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 160) + "px";
  }, [draft]);

  const handleSend = useCallback(async () => {
    const text = draft.trim();
    if (!text || sending) return;
    setSending(true);
    setErrorMsg(null);
    unlockSound();
    if (soundOnRef.current) playSendSound();
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      try {
        navigator.vibrate?.(8);
      } catch {
        // ignore
      }
    }

    // Optimistic placeholder. We may not yet know our identity (first send for
    // a new guest); the server will return the canonical participant.
    const tempUser = participant ?? {
      kind: "guest" as const,
      id: "local-anon",
      name: "You",
      email: null,
      avatarColor: "#6366F1",
      profilePictureUrl: null,
    };
    const optimistic: Message = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      examSlug: exam.slug,
      channelKey: selectedChannel,
      userId: tempUser.id,
      username: tempUser.name,
      avatarColor: tempUser.avatarColor,
      text,
      dmToUserId: dmTarget?.id,
      dmToUsername: dmTarget?.name,
      replyTo: replyTo
        ? {
            id: replyTo.id,
            username: replyTo.username,
            text: replyTo.text.slice(0, 160),
          }
        : undefined,
      createdAt: Date.now(),
    };
    seenIds.current.add(optimistic.id);
    setMessages((m) => [...m, optimistic]);
    setDraft("");

    try {
      const res = await fetch(`/api/exam/${exam.slug}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          channelKey: selectedChannel,
          replyToId: replyTo?.id,
          dmToUserId: dmTarget?.id,
          dmToUsername: dmTarget?.name,
        }),
      });
      if (res.ok) {
        const json = (await res.json()) as {
          message: Message;
          participant: Participant;
        };
        seenIds.current.add(json.message.id);
        setMessages((m) => {
          const alreadyHasCanonical = m.some((mm) => mm.id === json.message.id);
          if (alreadyHasCanonical) {
            return m.filter((mm) => mm.id !== optimistic.id);
          }
          return m.map((mm) => (mm.id === optimistic.id ? json.message : mm));
        });
        // Update our local participant with whatever the server settled on
        // (creates a guest cookie on first send if needed).
        setParticipant(json.participant);
      } else {
        let errText = "Failed to send.";
        try {
          const err = (await res.json()) as { error?: string };
          if (err.error) errText = err.error;
        } catch {
          // ignore
        }
        setMessages((m) => m.filter((mm) => mm.id !== optimistic.id));
        setDraft(text);
        setErrorMsg(errText);
      }
    } catch {
      setMessages((m) => m.filter((mm) => mm.id !== optimistic.id));
      setDraft(text);
      setErrorMsg("Couldn't reach the server. Try again.");
    } finally {
      setSending(false);
      setReplyTo(null);
      textareaRef.current?.focus();
    }
  }, [dmTarget, draft, exam.slug, participant, replyTo, selectedChannel, sending]);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const activeMembers = useMemo(() => {
    const map = new Map<string, ActiveMember>();
    for (const m of messages) {
      map.set(m.userId, {
        id: m.userId,
        name: m.username,
        avatarColor: m.avatarColor,
      });
    }
    if (participant) {
      map.set(participant.id, {
        id: participant.id,
        name: participant.name,
        avatarColor: participant.avatarColor,
      });
    }
    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [messages, participant]);

  const visibleMessages = useMemo(() => {
    const selfId = participant?.id;
    if (!dmTarget || !selfId) {
      return messages.filter((m) => !m.dmToUserId);
    }
    return messages.filter((m) => {
      const outgoing = m.userId === selfId && m.dmToUserId === dmTarget.id;
      const incoming = m.userId === dmTarget.id && m.dmToUserId === selfId;
      return outgoing || incoming;
    });
  }, [dmTarget, messages, participant?.id]);

  const grouped = useMemo(() => {
    const out: { showHeader: boolean; msg: Message }[] = [];
    let prev: Message | null = null;
    for (const m of visibleMessages) {
      const showDay = !prev || !isSameDay(prev.createdAt, m.createdAt);
      const showHeader =
        showDay ||
        !prev ||
        prev.userId !== m.userId ||
        m.createdAt - prev.createdAt > 5 * 60_000;
      out.push({ showHeader, msg: m });
      prev = m;
    }
    return out;
  }, [visibleMessages]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [dmTarget?.id, grouped.length]);

  const messageById = useMemo(() => {
    const map = new Map<string, Message>();
    for (const m of messages) map.set(m.id, m);
    return map;
  }, [messages]);

  const toggleLike = useCallback((id: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const reportMessage = useCallback((id: string) => {
    setReportedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const voteFile = useCallback((id: string, vote: -1 | 1) => {
    setFileVotes((prev) => ({
      ...prev,
      [id]: prev[id] === vote ? 0 : vote,
    }));
  }, []);

  const channelName = exam.shortName.toLowerCase().replace(/\s+/g, "-");
  const selectedChannelName =
    selectedChannel === "main" ? channelName : `${channelName}-${selectedChannel}`;
  const studyFiles = useMemo<StudyFile[]>(
    () => [
      {
        id: "nbme-high-yield",
        title: `${exam.shortName} NBME high-yield notes`,
        href: "#nbme-high-yield",
        source: "Maya",
        kind: "PDF",
        comments: 47,
        votes: 42,
        modified: "Yesterday",
        size: "477 KB",
      },
      {
        id: "uworld-incorrects",
        title: "UWorld incorrects checklist",
        href: "#uworld-incorrects",
        source: "Rita",
        kind: "Sheet",
        comments: 29,
        votes: 31,
        modified: "Yesterday",
        size: "493 KB",
      },
      {
        id: "micro-sketchy-index",
        title: "Sketchy Micro quick index",
        href: "#micro-sketchy-index",
        source: "Owen",
        kind: "Link",
        comments: 18,
        votes: 24,
        modified: "Thursday",
        size: "30.2 KB",
      },
      {
        id: "biochem-pathways",
        title: "Biochem pathways one-pager",
        href: "#biochem-pathways",
        source: "Tariq",
        kind: "PDF",
        comments: 14,
        votes: 18,
        modified: "Thursday",
        size: "337 KB",
      },
      {
        id: "rapid-review",
        title: `${exam.shortName} rapid review deck`,
        href: "#rapid-review",
        source: "Sami",
        kind: "Deck",
        comments: 11,
        votes: 15,
        modified: "Thursday",
        size: "477 KB",
      },
    ],
    [exam.shortName]
  );
  const channels = useMemo(
    () =>
      [
        { key: "discussion" as const, label: `${channelName}-discussion` },
        { key: "experience" as const, label: `${channelName}-experience` },
        { key: "files" as const, label: `${channelName}-files` },
      ].filter(Boolean),
    [channelName]
  );

  return (
    <div className="flex h-dvh max-h-dvh w-full min-h-0 overflow-hidden bg-[var(--chat-body-bg)] text-[var(--chat-body-fg)]">
      {sidebarOpen && (
      <aside className="hidden md:flex w-[17rem] lg:w-[19rem] shrink-0 flex-col border-r border-[var(--chat-sidebar-border)] bg-[var(--chat-sidebar-bg)] text-[var(--chat-sidebar-fg)]">
        <div className="safe-top shrink-0 px-4 pb-3 pt-4">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-[18px] font-bold leading-tight tracking-tight">
                ExamChat
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Link
                href="/"
                aria-label="Home"
                title="Home"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-[var(--chat-sidebar-muted)] hover:bg-[var(--chat-sidebar-hover)] hover:text-[var(--chat-sidebar-fg)] active:scale-[0.97] transition"
              >
                <HomeIcon />
              </Link>
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Hide sidebar"
                title="Hide sidebar"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md text-[var(--chat-sidebar-muted)] hover:bg-[var(--chat-sidebar-hover)] hover:text-[var(--chat-sidebar-fg)] active:scale-[0.97] transition"
              >
                <PanelLeftCloseIcon />
              </button>
            </div>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-3 pt-2">
          <nav className="mb-3 space-y-0.5">
            <SidebarNavItem icon={<CardsIcon />} label="Flashcards" />
            <SidebarNavItem icon={<MockIcon />} label="Mock" />
            <SidebarNavItem
              icon={<FileIcon />}
              label="Files"
              active={mainView === "files"}
              onClick={() => {
                setMainView("files");
                setDmTarget(null);
                setReplyTo(null);
              }}
            />
            <SidebarNavItem
              icon={<InfoIcon />}
              label="About"
              hasDisclosure
              active={mainView === "about"}
              onClick={() => {
                setMainView("about");
                setDmTarget(null);
                setReplyTo(null);
              }}
            />
          </nav>

          <SidebarSection title="Channels">
            <div className="space-y-0.5">
              <button
                type="button"
                onClick={() => {
                  setMainView("chat");
                  setSelectedChannel("main");
                  setDmTarget(null);
                  setReplyTo(null);
                }}
                className={
                  "flex h-9 w-full items-center gap-3 rounded-md px-3 text-left text-[15px] transition " +
                  (mainView === "chat" && selectedChannel === "main" && !dmTarget
                    ? "bg-[var(--chat-sidebar-active)] text-[var(--chat-sidebar-active-fg)]"
                    : "text-[var(--chat-sidebar-muted)] hover:bg-[var(--chat-sidebar-hover)] hover:text-[var(--chat-sidebar-fg)]")
                }
              >
                <span className="text-[22px] leading-none opacity-90">#</span>
                <span className="truncate">{channelName}</span>
              </button>
              {channels.map((channel) => (
                <button
                  key={channel.key}
                  type="button"
                  onClick={() => {
                    setMainView("chat");
                    setSelectedChannel(channel.key);
                    setDmTarget(null);
                    setReplyTo(null);
                  }}
                  className={
                    "flex h-9 w-full items-center gap-3 rounded-md px-3 text-left text-[15px] transition " +
                    (mainView === "chat" && selectedChannel === channel.key && !dmTarget
                      ? "bg-[var(--chat-sidebar-active)] text-[var(--chat-sidebar-active-fg)]"
                      : "text-[var(--chat-sidebar-muted)] hover:bg-[var(--chat-sidebar-hover)] hover:text-[var(--chat-sidebar-fg)]")
                  }
                >
                  <span className="text-[22px] leading-none text-[var(--chat-sidebar-subtle)] opacity-90">#</span>
                  <span className="truncate">{channel.label}</span>
                </button>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection title="Active Members">
            <div className="space-y-0.5">
              {activeMembers
                .filter((member) => member.id !== participant?.id)
                .map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => {
                      setMainView("chat");
                      setDmTarget(member);
                      setReplyTo(null);
                    }}
                    className={
                      "flex h-9 w-full items-center gap-3 rounded-md px-3 text-left transition " +
                      (dmTarget?.id === member.id
                        ? "bg-[var(--chat-sidebar-active)] text-[var(--chat-sidebar-active-fg)]"
                        : "text-[var(--chat-sidebar-muted)] hover:bg-[var(--chat-sidebar-hover)] hover:text-[var(--chat-sidebar-fg)]")
                    }
                  >
                    <span
                      className="grid h-6 w-6 shrink-0 place-items-center rounded-[4px] text-[10px] font-bold text-white"
                      style={{ background: member.avatarColor }}
                    >
                      {member.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span className="truncate text-[14px]">{member.name}</span>
                    <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-emerald-400" />
                  </button>
                ))}
            </div>
          </SidebarSection>
        </div>

        <div className="shrink-0 border-t border-[var(--chat-sidebar-border)] px-4 py-3 safe-bottom">
          <div className="flex items-center gap-2">
            {participant ? (
              <div ref={menuRef} className="relative min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => setMenuOpen((o) => !o)}
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                  aria-label="Account menu"
                  className="flex w-full min-w-0 items-center gap-3 rounded-lg px-2 py-2 text-left transition hover:bg-[var(--chat-sidebar-hover)] active:scale-[0.99]"
                >
                  <ParticipantAvatar user={participant} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold leading-5 text-[var(--chat-sidebar-fg)]">
                      {participant.name}
                    </span>
                    <span className="block truncate text-[12px] leading-4 text-[var(--chat-sidebar-muted)]">
                      {participant.kind === "guest"
                        ? "Guest account"
                        : (participant.email ?? "Signed in")}
                    </span>
                  </span>
                </button>
                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute bottom-11 right-0 z-30 w-72 rounded-xl border border-[var(--menu-border)] bg-[var(--menu-bg)] p-1.5 text-[var(--menu-fg)] shadow-2xl shadow-black/20 dark:shadow-black/40"
                  >
                    <div className="flex items-center gap-2.5 px-2.5 py-2">
                      <ParticipantAvatar user={participant} size={36} />
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">
                          {participant.name}
                        </div>
                        <div className="truncate text-[11px] text-[var(--chat-chrome-muted)]">
                          {participant.kind === "guest"
                            ? "Guest - chats are anonymous"
                            : (participant.email ?? "")}
                        </div>
                      </div>
                    </div>
                    <div className="my-1 h-px bg-[var(--menu-border)]" />
                    {participant.kind === "guest" ? (
                      <a
                        href={signInUrl}
                        onClick={() => setMenuOpen(false)}
                        className="block w-full rounded-lg px-2.5 py-2 text-left text-[13px] hover:bg-[var(--menu-hover)]"
                        role="menuitem"
                      >
                        Sign in to keep your name across devices
                      </a>
                    ) : (
                      <form
                        action={async () => {
                          setSignOutPending(true);
                          try {
                            await signOutAction();
                          } finally {
                            setSignOutPending(false);
                            setMenuOpen(false);
                          }
                        }}
                      >
                        <button
                          type="submit"
                          disabled={signOutPending}
                          className="w-full rounded-lg px-2.5 py-2 text-left text-[13px] hover:bg-[var(--menu-hover)] disabled:opacity-50"
                          role="menuitem"
                        >
                          {signOutPending ? "Signing out..." : "Sign out"}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <a
                href={signInUrl}
                className="inline-flex min-w-0 flex-1 items-center rounded-lg bg-[var(--pill-active-bg)] px-3 py-2 text-[13px] font-semibold text-[var(--pill-active-fg)] active:scale-[0.97]"
              >
                Sign in
              </a>
            )}
            <ThemeToggle className="shrink-0 rounded-lg text-[var(--chat-sidebar-muted)] hover:bg-[var(--chat-sidebar-hover)] hover:text-[var(--chat-sidebar-fg)]" />
          </div>
          {!connected && (
            <div className="px-1 text-[11px] text-amber-500 dark:text-amber-300/80">
              Reconnecting...
            </div>
          )}
        </div>
      </aside>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        {!sidebarOpen && (
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Show sidebar"
            title="Show sidebar"
            className="fixed left-3 top-3 z-30 hidden h-9 w-9 place-items-center rounded-md border border-[var(--chat-body-border)] bg-[var(--chat-body-bg)] text-[var(--chat-body-muted)] shadow-sm transition hover:bg-[var(--chat-body-hover)] hover:text-[var(--chat-body-fg)] active:scale-[0.97] md:grid"
          >
            <PanelLeftOpenIcon />
          </button>
        )}

      <main
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-y-contain"
        style={{ scrollPaddingBottom: 120 }}
      >
        <div
          className={
            mainView === "files"
              ? "mx-auto w-full max-w-6xl px-4 pb-8 pt-8 sm:px-6 lg:px-12 lg:pt-16"
              : "mx-auto max-w-4xl px-3 sm:px-4 pt-4 pb-3"
          }
        >
          <div className="min-w-0">
            {mainView === "files" ? (
              <FilesList
                title={`${channelName} files`}
                files={studyFiles}
                votes={fileVotes}
                onVote={voteFile}
              />
            ) : mainView === "about" ? (
              <AboutExam exam={exam} />
            ) : (
              <ul className="space-y-0.5">
                {grouped.map(({ showHeader, msg }) => (
                  <li key={msg.id}>
                    <MessageRow
                      msg={msg}
                      showHeader={showHeader}
                      isSelf={msg.userId === participant?.id}
                      liked={likedIds.has(msg.id)}
                      reported={reportedIds.has(msg.id)}
                      replyResolved={msg.replyTo ? messageById.get(msg.replyTo.id) : undefined}
                      onReply={() => setReplyTo(msg)}
                      onToggleLike={() => toggleLike(msg.id)}
                      onReport={() => reportMessage(msg.id)}
                    />
                  </li>
                ))}
                {grouped.length === 0 && (
                  <li className="px-2 py-8 text-sm text-[var(--chat-body-muted)]">
                    No messages yet in this conversation.
                  </li>
                )}
              </ul>
            )}
          </div>
        </div>
      </main>

      {mainView === "chat" && (
      <footer className="shrink-0 z-20 bg-[var(--chat-body-bg)] safe-bottom">
        <div className="mx-auto max-w-4xl px-3 sm:px-4 pt-2 pb-2">
          <div>
          {replyTo && (
            <div className="mb-2 flex items-start justify-between gap-2 rounded-lg border border-[var(--chat-body-border)]/70 bg-[var(--chat-body-hover)]/45 px-2.5 py-2">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Replying to {replyTo.username}
                </div>
                <div className="text-[12px] text-[var(--chat-body-subtle)] truncate">
                  {replyTo.text}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReplyTo(null)}
                className="h-6 w-6 shrink-0 grid place-items-center rounded-md hover:bg-[var(--chat-chrome-hover)] text-[var(--chat-body-subtle)]"
                aria-label="Cancel reply"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 6 6 18" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>
          )}
          <div className="flex items-end gap-2 rounded-2xl border border-[var(--chat-input-border)] hover:border-[var(--chat-input-border-hover)] focus-within:border-[var(--chat-input-border-focus)] focus-within:ring-2 focus-within:ring-[var(--chat-input-ring)] bg-[var(--chat-body-bg)] px-3 py-2 transition-colors">
            <textarea
              ref={textareaRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={onKeyDown}
              onFocus={unlockSound}
              rows={1}
              placeholder={dmTarget ? `Message ${dmTarget.name}` : `Message #${selectedChannelName}`}
              className="flex-1 resize-none bg-transparent outline-none text-[15px] leading-6 placeholder:text-[var(--chat-body-subtle)] text-[var(--chat-body-fg)] max-h-40"
              maxLength={1000}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!draft.trim() || sending}
              aria-label="Send message"
              className={
                "shrink-0 h-9 w-9 rounded-lg grid place-items-center transition-all " +
                (draft.trim() && !sending
                  ? "bg-[var(--slack-green)] hover:bg-[var(--slack-green-hover)] text-white shadow-sm active:scale-95"
                  : "bg-[var(--chat-bubble-bg)] text-[var(--chat-body-subtle)] cursor-not-allowed")
              }
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M22 2 11 13" />
                <path d="M22 2 15 22l-4-9-9-4Z" />
              </svg>
            </button>
          </div>
          {errorMsg && (
            <div className="mt-1 px-1 text-[12px] text-rose-500">{errorMsg}</div>
          )}
          <div className="mt-1 px-1 text-[11px] text-[var(--chat-body-subtle)] flex items-center justify-between gap-3">
            <span className="hidden sm:inline">
              <kbd className="px-1 py-0.5 bg-[var(--chat-kbd-bg)] rounded">Enter</kbd>{" "}
              to send,{" "}
              <kbd className="px-1 py-0.5 bg-[var(--chat-kbd-bg)] rounded">Shift</kbd>+
              <kbd className="px-1 py-0.5 bg-[var(--chat-kbd-bg)] rounded">Enter</kbd>{" "}
              for new line
            </span>
            <span className="sm:hidden">
              {participant?.kind === "guest" ? (
                <>
                  Chatting as{" "}
                  <span className="font-medium text-[var(--chat-body-muted)]">
                    {participant.name}
                  </span>
                  {" — "}
                  <a className="underline" href={signInUrl}>
                    sign in
                  </a>
                </>
              ) : participant?.kind === "user" ? (
                <>
                  Signed in as{" "}
                  <span className="font-medium text-[var(--chat-body-muted)]">
                    {participant.name}
                  </span>
                </>
              ) : (
                <>
                  Chatting as guest —{" "}
                  <a className="underline" href={signUpUrl}>
                    sign up
                  </a>
                </>
              )}
            </span>
            <span className={draft.length > 900 ? "text-rose-500" : ""}>
              {draft.length}/1000
            </span>
          </div>
          </div>
        </div>
      </footer>
      )}
      </div>
    </div>
  );
}

function AboutExam({ exam }: { exam: ExamMeta }) {
  const blueprint = [
    "Core concepts and high-yield weak areas",
    "Practice questions, timing, and review strategy",
    "Recent score reports, exam-day logistics, and pacing",
    "Resource comparisons without copyrighted uploads",
  ];

  return (
    <section className="mx-auto max-w-3xl py-2">
      <div className="mb-6 border-b border-[var(--chat-body-border)] pb-5">
        <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--chat-bubble-bg)] text-[13px] font-bold text-[var(--chat-body-muted)] ring-1 ring-[var(--chat-body-border)]">
          {exam.iconLabel}
        </div>
        <h1 className="text-[26px] font-semibold tracking-tight text-[var(--chat-body-fg)]">
          {exam.name}
        </h1>
        <p className="mt-2 max-w-2xl text-[15px] leading-6 text-[var(--chat-body-muted)]">
          {exam.description}
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <section>
          <h2 className="mb-2 text-[14px] font-semibold text-[var(--chat-body-fg)]">
            Blueprint
          </h2>
          <ul className="space-y-2 text-[14px] leading-6 text-[var(--chat-body-muted)]">
            {blueprint.map((item) => (
              <li key={item} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-2 text-[14px] font-semibold text-[var(--chat-body-fg)]">
            Room Guide
          </h2>
          <div className="space-y-3 text-[14px] leading-6 text-[var(--chat-body-muted)]">
            <p>
              Main is for live help and quick questions. Discussion is for study
              planning. Experience is for recent test-day reports.
            </p>
            <p>
              Files are listed separately so resource links stay easy to scan.
            </p>
          </div>
        </section>
      </div>
    </section>
  );
}

function SidebarSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <section className="mb-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="mb-1 flex h-8 w-full items-center gap-2 rounded-md px-3 text-left text-[15px] font-medium text-[var(--chat-sidebar-muted)] transition hover:bg-[var(--chat-sidebar-hover)] hover:text-[var(--chat-sidebar-fg)]"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={
            "shrink-0 text-[var(--chat-sidebar-subtle)] transition-transform " +
            (open ? "rotate-0" : "-rotate-90")
          }
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
        {title === "Channels" && <HashIcon />}
        <span>{title}</span>
      </button>
      {open ? children : null}
    </section>
  );
}

function SidebarNavItem({
  icon,
  label,
  hasDisclosure = false,
  active = false,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  hasDisclosure?: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "flex h-9 w-full items-center gap-3 rounded-md px-3 text-left text-[15px] transition " +
        (active
          ? "bg-[var(--chat-sidebar-active)] text-[var(--chat-sidebar-active-fg)]"
          : "text-[var(--chat-sidebar-muted)] hover:bg-[var(--chat-sidebar-hover)] hover:text-[var(--chat-sidebar-fg)]")
      }
    >
      <span className="grid h-5 w-5 shrink-0 place-items-center text-[var(--chat-sidebar-subtle)]">
        {icon}
      </span>
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {hasDisclosure && (
        <span className="text-[15px] text-[var(--chat-sidebar-subtle)]" aria-hidden>
          &gt;
        </span>
      )}
    </button>
  );
}

function FilesList({
  title,
  files,
  votes,
  onVote,
}: {
  title: string;
  files: StudyFile[];
  votes: Record<string, -1 | 0 | 1>;
  onVote: (id: string, vote: -1 | 1) => void;
}) {
  return (
    <section className="w-full">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-[30px] font-medium tracking-tight text-[var(--chat-body-fg)] sm:text-[34px]">
          Library
        </h1>
        <span className="hidden text-[13px] text-[var(--chat-body-muted)] lg:block">
          {title}
        </span>
        <div className="flex w-full items-center gap-2 sm:w-auto">
          <label className="relative min-w-0 flex-1 sm:w-56 sm:flex-none">
            <span className="sr-only">Search library</span>
            <svg
              className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--chat-body-subtle)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" />
            </svg>
            <input
              placeholder="Search library"
              className="h-9 w-full rounded-full border border-[var(--chat-body-border)] bg-[var(--chat-body-bg)] pl-9 pr-3 text-[13px] text-[var(--chat-body-fg)] outline-none placeholder:text-[var(--chat-body-subtle)] focus:border-[var(--chat-input-border-focus)] focus:ring-2 focus:ring-[var(--chat-input-ring)]"
            />
          </label>
          <button
            type="button"
            className="h-9 shrink-0 rounded-full bg-[var(--pill-active-bg)] px-4 text-[13px] font-semibold text-[var(--pill-active-fg)] transition hover:opacity-90 active:scale-[0.98]"
          >
            Upload
          </button>
        </div>
      </div>

      <div className="mb-7 flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          {["All", "Images", "Files"].map((tab) => (
            <button
              key={tab}
              type="button"
              className={
                "h-9 rounded-full px-4 text-[14px] transition " +
                (tab === "All"
                  ? "bg-[var(--chat-bubble-bg)] text-[var(--chat-body-fg)]"
                  : "text-[var(--chat-body-muted)] hover:bg-[var(--chat-body-hover)] hover:text-[var(--chat-body-fg)]")
              }
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="hidden items-center gap-2 text-[var(--chat-body-subtle)] sm:flex">
          <LibraryFilterIcon />
          <span className="h-5 w-px bg-[var(--chat-body-border)]" />
          <GridIcon />
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--chat-bubble-bg)] text-[var(--chat-body-fg)]">
            <ListIcon />
          </span>
        </div>
      </div>

      <div className="hidden grid-cols-[minmax(0,1fr)_160px_110px_112px] border-b border-[var(--chat-body-border)] pb-4 text-[13px] font-medium text-[var(--chat-body-muted)] md:grid">
        <div>Name</div>
        <div>Modified ↓</div>
        <div>Size</div>
        <div className="text-right">{files.length} links</div>
      </div>

      <ul className="divide-y divide-[var(--chat-body-border)]">
        {files.map((file, index) => {
          const userVote = votes[file.id] ?? 0;
          const score = file.votes + userVote;

          return (
            <li
              key={file.id}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-4 transition-colors hover:bg-[var(--chat-body-hover)] sm:px-1 md:grid-cols-[minmax(0,1fr)_160px_110px_112px] md:gap-4"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="hidden w-6 shrink-0 text-right text-[14px] font-semibold tabular-nums text-[var(--chat-body-muted)] sm:block">
                  {index + 1}.
                </span>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-[var(--chat-body-border)] bg-[var(--chat-body-bg)] text-[10px] font-bold uppercase text-[var(--chat-body-muted)]">
                  {file.kind.slice(0, 1)}
                </span>
                <a
                  href={file.href}
                  className="min-w-0 rounded-md py-0.5 text-[15px] font-medium text-[var(--chat-body-fg)] underline-offset-4 hover:underline focus:outline-none focus:ring-2 focus:ring-[var(--chat-input-ring)]"
                >
                  <span className="block truncate">{file.title}</span>
                  <span className="block truncate text-[13px] font-normal text-[var(--chat-body-muted)] md:hidden">
                    {file.modified} · {file.size} · {file.kind} by {file.source}
                  </span>
                  <span className="hidden truncate text-[13px] font-normal text-[var(--chat-body-muted)] md:block">
                    {file.kind} by {file.source}
                  </span>
                </a>
              </div>
              <div className="hidden text-[14px] text-[var(--chat-body-muted)] md:block">
                {file.modified}
              </div>
              <div className="hidden text-[14px] text-[var(--chat-body-muted)] md:block">
                {file.size}
              </div>
              <div className="ml-auto flex shrink-0 items-center gap-2 md:ml-0 md:justify-end">
                <MetricBox
                  icon="comment"
                  label="Comments"
                  value={file.comments}
                />
                <MetricBox
                  icon="upvote"
                  label={userVote === 1 ? "Remove upvote" : "Upvote file"}
                  value={score}
                  active={userVote === 1}
                  onClick={() => onVote(file.id, 1)}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function MetricBox({
  icon,
  label,
  value,
  active,
  onClick,
}: {
  icon: "comment" | "upvote";
  label: string;
  value: number;
  active?: boolean;
  onClick?: () => void;
}) {
  const content = (
    <>
      {icon === "comment" ? <CommentIcon /> : <UpvoteIcon active={active} />}
      <span className="text-[14px] font-semibold leading-none tabular-nums sm:text-[15px]">
        {value}
      </span>
    </>
  );

  const className =
    "grid h-11 w-11 shrink-0 place-items-center rounded-xl border text-[var(--chat-body-muted)] transition sm:h-12 sm:w-12 " +
    (active
      ? "border-[var(--chat-body-muted)] bg-[var(--chat-bubble-bg)] text-[var(--chat-body-fg)]"
      : "border-[var(--chat-body-border)] bg-[var(--chat-body-bg)]") +
    (onClick
      ? " hover:border-[var(--chat-body-muted)] hover:text-[var(--chat-body-fg)] active:scale-[0.98]"
      : "");

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={label}
        title={label}
        className={className}
      >
        {content}
      </button>
    );
  }

  return (
    <span aria-label={label} title={label} className={className}>
      {content}
    </span>
  );
}

function CommentIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 9 9 0 0 1-4-.9l-4 1 1.2-3.5A8 8 0 0 1 3 11.5 8.6 8.6 0 0 1 12 3a8.6 8.6 0 0 1 9 8.5Z" />
    </svg>
  );
}

function UpvoteIcon({ active = false }: { active?: boolean }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m12 5 7 12H5L12 5Z" />
    </svg>
  );
}

function LibraryFilterIcon() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full hover:bg-[var(--chat-body-hover)]">
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M4 7h16" />
        <path d="M7 12h10" />
        <path d="M10 17h4" />
      </svg>
    </span>
  );
}

function GridIcon() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full hover:bg-[var(--chat-body-hover)]">
      <svg
        width="17"
        height="17"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </svg>
    </span>
  );
}

function ListIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8 6h13" />
      <path d="M8 12h13" />
      <path d="M8 18h13" />
      <path d="M3 6h.01" />
      <path d="M3 12h.01" />
      <path d="M3 18h.01" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m3 10 9-7 9 7" />
      <path d="M5 10v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V10" />
      <path d="M9 21v-6h6v6" />
    </svg>
  );
}

function PanelLeftCloseIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="m16 10-2 2 2 2" />
    </svg>
  );
}

function PanelLeftOpenIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M9 4v16" />
      <path d="m14 10 2 2-2 2" />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="4" y="6" width="14" height="12" rx="2" />
      <path d="M8 6V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2" />
      <path d="M8 11h6" />
      <path d="M8 15h3" />
    </svg>
  );
}

function MockIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9 11h6" />
      <path d="M9 15h4" />
      <path d="M8 3h8l3 3v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h1" />
      <path d="M15 3v4h4" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v5h5" />
      <path d="M9 13h6" />
      <path d="M9 17h4" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function HashIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-[var(--chat-sidebar-subtle)]"
      aria-hidden
    >
      <path d="M4 9h16" />
      <path d="M4 15h16" />
      <path d="M10 3 8 21" />
      <path d="m16 3-2 18" />
    </svg>
  );
}

function ParticipantAvatar({
  user,
  size,
}: {
  user: Participant;
  size: number;
}) {
  if (user.profilePictureUrl) {
    return (
      <Image
        src={user.profilePictureUrl}
        alt={user.name}
        width={size}
        height={size}
        unoptimized
        className="rounded-md object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      className="rounded-xl grid place-items-center bg-rose-50 text-rose-600"
      aria-hidden
      style={{
        width: size,
        height: size,
      }}
    >
      <svg
        width={Math.round(size * 0.68)}
        height={Math.round(size * 0.68)}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2.25c-4.418 0-8 2.574-8 5.75 0 .414.336.75.75.75h14.5a.75.75 0 0 0 .75-.75c0-3.176-3.582-5.75-8-5.75Z" />
      </svg>
    </span>
  );
}

function MessageRow({
  msg,
  showHeader,
  isSelf,
  liked,
  reported,
  replyResolved,
  onReply,
  onToggleLike,
  onReport,
}: {
  msg: Message;
  showHeader: boolean;
  isSelf: boolean;
  liked: boolean;
  reported: boolean;
  replyResolved?: Message;
  onReply: () => void;
  onToggleLike: () => void;
  onReport: () => void;
}) {
  return (
    <div
      className={
        "msg-pop group relative flex items-start gap-2.5 px-2 py-1 rounded-md hover:bg-[var(--chat-body-hover)] transition-colors " +
        (showHeader ? "mt-2" : "mt-0")
      }
    >
      {showHeader ? (
        <span
          className="shrink-0 h-9 w-9 rounded-xl grid place-items-center bg-rose-50 text-rose-600"
          aria-hidden
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 12a4.5 4.5 0 1 0-4.5-4.5A4.5 4.5 0 0 0 12 12Zm0 2.25c-4.418 0-8 2.574-8 5.75 0 .414.336.75.75.75h14.5a.75.75 0 0 0 .75-.75c0-3.176-3.582-5.75-8-5.75Z" />
          </svg>
        </span>
      ) : (
        <span className="shrink-0 w-9" aria-hidden />
      )}
      <div className="min-w-0 flex-1">
        {showHeader && (
          <div className="flex items-baseline gap-2">
            <span className="font-bold text-[15px] truncate">
              {msg.username}
              {isSelf && (
                <span className="ml-1.5 text-[10px] uppercase tracking-wider text-[var(--chat-body-subtle)] font-semibold">
                  you
                </span>
              )}
            </span>
            <span className="text-[11px] text-[var(--chat-body-muted)]">
              {formatTime(msg.createdAt)}
            </span>
          </div>
        )}
        {msg.replyTo && (
          <div className="mb-1.5 rounded-md border border-[var(--chat-body-border)]/60 bg-[var(--chat-body-hover)]/40 pl-2 pr-2 py-1">
            <div className="flex items-start gap-2">
              <span className="mt-0.5 h-7 w-0.5 rounded-full bg-emerald-500/85" aria-hidden />
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 truncate">
              {replyResolved?.username ?? msg.replyTo.username}
                </div>
                <div className="text-[12px] text-[var(--chat-body-muted)] leading-snug truncate">
                  {replyResolved?.text ?? msg.replyTo.text}
                </div>
              </div>
            </div>
          </div>
        )}
        <div className="text-[15px] leading-6 text-[var(--chat-body-fg)] whitespace-pre-wrap break-words">
          {msg.text}
        </div>
        <div
          className={
            "mt-1 flex items-center gap-1 sm:mt-0 transition-opacity " +
            /* Desktop+: toolbar overlays bottom-right so invisible controls don't reserve a blank row */
            "sm:absolute sm:right-2 sm:bottom-1 sm:z-10 sm:rounded-md sm:border sm:border-[var(--chat-body-border)] " +
            "sm:bg-[var(--chat-body-bg)] sm:px-1 sm:shadow-sm sm:opacity-0 sm:pointer-events-none " +
            "sm:group-hover:opacity-100 sm:group-hover:pointer-events-auto " +
            "sm:group-focus-within:opacity-100 sm:group-focus-within:pointer-events-auto"
          }
        >
          <button
            type="button"
            onClick={onReply}
            className="h-6 px-2 rounded-md text-[11px] text-[var(--chat-body-muted)] hover:bg-[var(--chat-chrome-hover)]"
            aria-label="Reply to message"
          >
            Reply
          </button>
          <button
            type="button"
            onClick={onToggleLike}
            className={
              "h-6 px-2 rounded-md text-[11px] inline-flex items-center gap-1 hover:bg-[var(--chat-chrome-hover)] " +
              (liked
                ? "text-emerald-600 dark:text-emerald-400"
                : "text-[var(--chat-body-muted)]")
            }
            aria-label="Thumbs up message"
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill={liked ? "currentColor" : "none"}
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M7 10v10" />
              <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.97 2.36l-1.18 6A2 2 0 0 1 18.66 20H4a2 2 0 0 1-2-2V12a2 2 0 0 1 2-2h3l4-6a2 2 0 0 1 4 1.88Z" />
            </svg>
            {liked ? "Liked" : "Like"}
          </button>
          <button
            type="button"
            onClick={onReport}
            disabled={reported}
            className="h-6 px-2 rounded-md text-[11px] text-[var(--chat-body-muted)] hover:bg-[var(--chat-chrome-hover)] disabled:opacity-60"
            aria-label="Report message"
          >
            {reported ? "Reported" : "Report"}
          </button>
        </div>
      </div>
      {!showHeader && (
        <span className="pointer-events-none absolute right-3 top-1.5 text-[10px] text-[var(--chat-body-subtle)] opacity-0 group-hover:opacity-100 transition-opacity">
          {formatTime(msg.createdAt)}
        </span>
      )}
    </div>
  );
}
