"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { signOutAction } from "@/app/actions/auth";

type HeaderUser = {
  kind: "user" | "guest";
  id: string;
  name: string;
  email: string | null;
  avatarColor: string;
  profilePictureUrl: string | null;
};

function initials(name: string): string {
  const parts = name.replace(/[^A-Za-z0-9]/g, " ").trim().split(/\s+/);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[1][0]).toUpperCase();
}

export function AuthHeader({
  user,
  signInUrl,
  signUpUrl,
}: {
  user: HeaderUser | null;
  signInUrl: string;
  signUpUrl: string;
}) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  if (!user) {
    return (
      <div className="flex items-center shrink-0">
        <a
          href={signUpUrl}
          className="h-9 px-3.5 inline-flex items-center rounded-lg bg-[var(--pill-active-bg)] text-[var(--pill-active-fg)] text-[13px] font-semibold hover:opacity-90 active:scale-[0.97] transition"
        >
          Get started for free
        </a>
      </div>
    );
  }

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-9 px-1.5 inline-flex items-center gap-2 rounded-lg hover:bg-[var(--menu-hover)] active:scale-[0.97] transition"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Avatar user={user} size={28} textSize={11} />
        <span className="text-[13px] text-[var(--chrome-fg)]/80 max-w-[120px] truncate hidden sm:block">
          {user.name}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-[var(--chrome-muted)]"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 w-72 rounded-xl bg-[var(--menu-bg)] text-[var(--menu-fg)] border border-[var(--menu-border)] shadow-2xl shadow-black/20 dark:shadow-black/40 p-1.5 z-30"
        >
          <div className="px-2.5 py-2 flex items-center gap-2.5">
            <Avatar user={user} size={36} textSize={13} />
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate">{user.name}</div>
              <div className="text-[11px] text-[var(--chrome-muted)] truncate">
                {user.kind === "guest"
                  ? "Guest — chats are anonymous"
                  : (user.email ?? "")}
              </div>
            </div>
          </div>
          <div className="my-1 h-px bg-[var(--menu-border)]" />
          {user.kind === "guest" ? (
            <a
              href={signInUrl}
              className="block w-full text-left px-2.5 py-2 rounded-lg text-[13px] text-[var(--menu-fg)] hover:bg-[var(--menu-hover)]"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              Sign in to keep your name across devices
            </a>
          ) : (
            <form
              action={async () => {
                setPending(true);
                try {
                  await signOutAction();
                } finally {
                  setPending(false);
                  setOpen(false);
                }
              }}
            >
              <button
                type="submit"
                disabled={pending}
                className="w-full text-left px-2.5 py-2 rounded-lg text-[13px] hover:bg-[var(--menu-hover)] disabled:opacity-50"
                role="menuitem"
              >
                {pending ? "Signing out…" : "Sign out"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function Avatar({
  user,
  size,
  textSize,
}: {
  user: HeaderUser;
  size: number;
  textSize: number;
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
      className="rounded-md grid place-items-center font-bold text-white"
      aria-hidden
      style={{
        background: user.avatarColor,
        width: size,
        height: size,
        fontSize: textSize,
      }}
    >
      {initials(user.name)}
    </span>
  );
}
