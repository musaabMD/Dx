# ExamChat

Live, Slack-flavored study rooms — one chat per exam. No channels, no DMs, no clutter. Sign in with WorkOS AuthKit, drop into a room, and start talking.

Built with Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind v4, and [@workos-inc/authkit-nextjs](https://github.com/workos/authkit-nextjs).

## Features

- **Discord-style home** — list of exams (USMLE Step 2 CK, MCAT, NCLEX, LSAT, GRE, …) with live online counts that gently drift, total member counts, search, and category filters.
- **Slack-style chat room** — channel header (`#step-2-ck`), avatar + bold name + timestamp, hover-to-reveal time on grouped messages, "Today/Yesterday" date dividers, optimistic send, auto-scroll, auto-grow textarea, `Enter` to send / `Shift+Enter` for newline, character counter.
- **Realtime** — Server-Sent Events stream for new messages and live presence (heartbeat every 15s). In-memory store with seeded demo conversations.
- **Addictive send feedback** — procedurally generated two-tone chirp via the Web Audio API + light haptic vibration on mobile. Mute toggle in the header.
- **Mobile-first** — sticky header & input with iOS safe-area insets, single-column cards on narrow screens.
- **WorkOS AuthKit auth** — read-only browsing for everyone; sign in to post. Authenticated identity (name + avatar) is shown next to your messages and in the header dropdown. Sign out via server action.
- **Graceful unconfigured mode** — the app still renders if WorkOS env vars are missing; sign-in CTAs route to a friendly setup page.

## Setup

```bash
npm install
cp .env.example .env.local
# fill in WORKOS_CLIENT_ID, WORKOS_API_KEY from https://dashboard.workos.com → API keys
# generate WORKOS_COOKIE_PASSWORD with: openssl rand -base64 32
# add http://localhost:3000/callback (or your dev port) to Redirects in WorkOS

npm run dev
# open http://localhost:3000
```

In your WorkOS dashboard:

1. **API Keys** → copy `WORKOS_CLIENT_ID` and `WORKOS_API_KEY`.
2. **Redirects** → add `http://localhost:3000/callback` (and your production URL).
3. **AuthKit** → enable the sign-in methods you want (Email, Google, GitHub, etc.).

That's it. Restart the dev server after editing `.env.local`.

## Architecture

```
app/
  page.tsx                      # Home: exam grid (server-rendered, hydrated)
  exam/[slug]/page.tsx          # Chat room (server-rendered initial state)
  callback/route.ts             # WorkOS AuthKit OAuth callback
  auth/not-configured/page.tsx  # Friendly fallback when env vars missing
  actions/auth.ts               # signOut server action
  api/exams/route.ts            # GET — exams + live online counts
  api/exam/[slug]/messages/...  # GET / POST — POST requires auth
  api/exam/[slug]/stream/...    # SSE — message + presence events
components/
  ExamGrid.tsx                  # Client home list with polling fallback
  AuthHeader.tsx                # Sign-in/up + profile dropdown for the home
  ChatRoom.tsx                  # Client chat UI with SSE + optimistic send
proxy.ts                        # AuthKit proxy (Next.js 16+)
lib/
  exams.ts                      # Static exam catalog
  store.ts                      # In-memory messages + pseudo-live counts
  auth.ts                       # withAuth wrapper, deterministic avatar color
  sound.ts                      # Web Audio send/receive cues
```

The store is in-memory by design — perfect for hacking, demos, and a single-region deploy. To go multi-region or persistent, swap `lib/store.ts` for Redis pub/sub or a hosted message bus and the rest of the app stays the same.

## Notes

- The proxy uses Next.js 16's `proxy.ts` (renamed from `middleware.ts`).
- Live online counts are **simulated** (sine-wave drift around a base number) so the homepage feels alive without needing a real presence backend.
- The matcher excludes the SSE stream so long-lived connections aren't intercepted by the auth proxy.
- Sounds are generated procedurally (no audio files shipped).
