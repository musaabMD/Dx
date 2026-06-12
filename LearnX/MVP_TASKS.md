# LearnX MVP Build Plan (v1) — iOS-First, Phase 1 (8 Weeks)

This document turns `PRODUCT_DOCUMENTATION.md` into an execution plan for **MVP: Phase 1 (Weeks 1–8)**. It is written for a small team (1–2 mobile engineers + 1 backend engineer), but a solo developer can run it serially with the same ordering.

**MVP success definition (MVP “done”):** A new user can **sign in (Apple + email)**, start the **$1.99 trial (StoreKit)**, **generate a course** with **at least MCQ + flashcards**, **read lessons**, **complete exercises**, see **progress + basic scores**, and **share a public link** that opens a **mobile web** course view for anonymous learners.

**Non-goals for MVP (defer to Phase 2):** speaking exercises, image exercises, full kid-mode quality bar, push notifications, deep creator analytics, spaced repetition, offline mode, Android.

---

## Engineering Principles (to keep the schedule real)

- **Ship vertical slices** (auth -> paywall -> one happy-path course) before polishing secondary screens.
- **Contract-first JSON:** freeze the `Course` JSON early; client + generator must agree.
- **Idempotent course generation API:** client retries should not create duplicates unexpectedly.
- **Web sharing is a separate web app** with strict read-only public endpoints and tight caching/limits.

---

## Week 0 — Repo + Foundations (0.5–1 week, parallel)

### A) Product + program setup

- **App IDs, capabilities, and keys**
  - **Apple:** Sign in with Apple, In-App Purchase, Push (optional for Phase 1), Associated Domains (only if you use universal links later).
  - **Google OAuth:** iOS client IDs, URL schemes, Supabase config.
- **Vendors**
  - **Supabase project** (Postgres + Auth) OR equivalent.
  - **RevenueCat** project linking App Store products.
  - **PostHog** project + `learnx` release environment.
- **Environments**
  - **Dev/Staging/Prod** naming, API base URLs, feature flags (even if manual).

**Exit criteria**
- A written “environments + secrets” checklist exists (not necessarily in-repo).
- A single `staging` environment is usable for daily testing.

### B) API contract freeze (P0)

- **Define minimum endpoints** from `PRODUCT_DOCUMENTATION.md` for:
  - `POST /courses` (generate)
  - `GET /courses` (list)
  - `GET /courses/:id` (details for owner + public mode)
  - `PATCH /courses/:id` (title + `is_public` + public slug behavior)
  - `POST /completions` (lesson completion)
  - `GET /courses/:id/stats` (minimum: views, avg score, completion)
  - `GET /web/:courseId` (public DTO) + `POST /web/:courseId/session` (optional MVP if time)

**Exit criteria**
- A concrete JSON DTO is agreed for **public** vs **owner** course payloads.
- Public endpoints do not leak PII; analytics fields are only for creator when authenticated as owner.

---

## Week 1 — App Skeleton + Design Tokens + Navigation Shell (P0)

### iOS (SwiftUI)

- Replace template UI with a **root coordinator** (MVVM: `AppSessionViewModel` as `ObservableObject`).
- Implement the **3-tab shell**: Library / Create / Stats (Stats can be a placeholder in Week 1).
- Add a shared **DesignTokens** (colors, spacing) matching Liquid Glass v1.0; implement **1 card component** used everywhere.
- **Routing:** `NavigationStack` for Library -> Course -> Lesson; Create uses a `sheet` flow.

**Exit criteria**
- Cold launch -> lands on a non-template screen with the tab bar and navigation stacks working.
- A single `LiquidGlassCard` component is used on at least 2 screens.

### Backend (parallel, thin)

- Supabase auth wired for **Apple + email** (Google can slip to early Week 2, but do not let it block Apple).
- Database tables from `PRODUCT_DOCUMENTATION.md` (minimum viable):
  - `users` profile fields, `credits_remaining`, `streak` fields (can start minimal: credits only).
  - `courses`, `lessons`, `exercises` with ordering fields.
  - `completions` for per-lesson score + XP.

**Exit criteria**
- User can create an account, obtain a session, and `GET /users/me` returns credits (even if static).

### Analytics (P0, lightweight)

- PostHog: `app_open`, `auth_success`, `paywall_view`, `course_generate_start/success/fail`, `lesson_start`, `lesson_complete`.

**Exit criteria**
- Every critical funnel step emits 1 event with stable names + properties (courseId optional).

---

## Week 2 — Paywall + Trial (P0) + Entitlements Gate (P0)

### iOS

- `PaywallView` (matches doc layout) + **gating**:
  - unauthenticated: Auth
  - authenticated + not entitled: Paywall
  - entitled: App
- **RevenueCat + StoreKit 2** for:
  - trial product ($1.99 / 1 day)
  - monthly ($25) **configured**, even if generation is the main gating in MVP
- **Restore purchases** + basic error states.

**Exit criteria**
- Test user can buy trial in sandbox, app unlocks, and reopens still unlocked.
- A failed/cancelled purchase does not dead-end the user (clear retry path).

### Backend

- Subscription state model (at minimum store **RevenueCat `app_user_id` mapping** + mirror status via webhook in staging).
- **Credits** initialization on first entitlement (e.g. 100).

**Exit criteria**
- `GET /users/me` reflects an “active entitlements” boolean used by the client.
- Webhooks update status in a staging DB reliably (monitor logs).

---

## Week 3 — Course Generation: Happy Path (P0)

### Backend: Claude generation

- Implement `POST /courses` that:
  - validates inputs (topic length, selected exercise types, audience/style)
  - debits **10 credits** transactionally
  - calls Anthropic, parses JSON, validates against schema
  - stores normalized rows in SQL
- Add **idempotency** key or safe retry semantics.

**Exit criteria**
- A curl request with a test JWT returns a real persisted course in DB.
- Malformed model output returns a 422 with a user-safe error code.

### iOS: Create flow (Steps 1–4 from doc)

- Multi-step `CreateCourseViewModel` with validation rules:
  - topic `> 3` chars, max 500
  - at least 1 exercise type
- Generation UI: full screen loading w/ skeleton placeholders
- On success, navigate to **Course Detail** for the new id.

**Exit criteria**
- End-to-end: Create -> generating -> new course detail populated.

### PostHog

- Track generation duration, failure reasons, time-to-first-course.

---

## Week 4 — Library + Course Detail (P0)

### iOS: Library (Home)

- `Course` list rows using the shared `CourseCard`
- filter/sort: **min MVP** = All + Last Accessed (other filters can be “nice” if time)

### iOS: Course Detail (Course tab)

- hero header, lesson list, progress, share affordances (public/private toggle can be Week 5 if needed)

**Exit criteria**
- A user with multiple courses can navigate reliably, progress is visible, and last accessed updates on open.

### Backend (if needed)

- `PATCH` course metadata + `updated_at` tracking for sorting.

---

## Week 5 — Lesson Flow: Reading + Exercises (MCQ + Flashcards only) (P0)

### iOS: Lesson

- **Reading** phase: render markdown or plain text consistently (choose one; do not block on fancy rendering).
- **Exercise** phase:
  - implement **state machine** (one exercise at a time) + top progress
  - **MCQ** with explanation reveal + XP rules from doc
  - **flashcards** with Again/Hard/Easy (map to partial XP in MVP, match doc as closely as reasonable)

### Backend

- `POST /completions` to persist:
  - lessonId, overall score, xpEarned, per-exercise results (minimum: store aggregated; detailed optional)

**Exit criteria**
- A lesson can be completed, scores/XP are plausible, and returning user sees completion state in lesson list.

---

## Week 6 — Gamification v0 + Profile v0 (P0/P1 split)

**If schedule tight, ship minimal gamification: XP + total XP only. Defer levels/streak UI.**

### iOS

- **Lesson complete** screen with score + XP (streak can be “coming soon” if not wired)
- **Profile** sheet: user identity + subscription state + credits

### Backend (optional in MVP if time is short)

- streak updates + last active date; otherwise compute later from completions.

**Exit criteria**
- User understands what they earned and can see credit balance in-profile.

---

## Week 7 — Public Sharing + Web Course Runner (MVP: P1, but try to land)

### Backend

- Public DTO: strip internal notes, private fields, and creator analytics from anonymous responses
- `views` increment strategy (at least on web page load) + simple anti-abuse (rate limit by IP, debounce)
- `POST /web/:courseId/session` if you want anonymous scoring persistence (optional MVP; page-local scoring is a fallback)

### Web (Next.js on Vercel)

- `learnx.app/c/[id]` (or your chosen domain) renders:
  - course + lessons list
  - MCQ + flashcard runner (minimum)
- **403** private course view with friendly message

**Exit criteria**
- A creator toggles public, copies link, opens in mobile Safari, anonymous user completes a lesson, creator sees +1 view (minimum).

### iOS

- Share sheet: copy + system share; privacy toggle; revoke can be manual admin-only for MVP if needed

---

## Week 8 — Hardening: QA, Performance, and Release Prep (P0)

### iOS

- **Crash + ANR** checks, memory on lesson player, back navigation edge cases
- **Offline/online**: graceful failure when generation fails; retry UX
- **App Store** metadata, screenshots, review notes (Sign in with Apple, IAP)

### Web

- Mobile layout QA, a11y basics, SEO basics (title + description for shared links)

### Observability

- Sentry (client + server) with PII rules
- PostHog funnels: auth -> paywall -> first course -> first completion -> share

**Exit criteria**
- A scripted test path passes on staging: signup -> trial -> generate -> learn -> share -> open web.
- “Known issues” list is documented for Phase 2.

---

## Parallel Workstream Backlog (pickups anytime, but do not block MVP)

- Web creator analytics (beyond views + view milestone): Phase 2
- True streak freeze and weekly bar polish: Phase 2
- Universal links for shared URLs: nice-to-have
- Admin tooling for content moderation: scale phase

---

## Phase 2 Preview (Weeks 9–16) — what changes planning-wise

- Add exercise types: speaking, image, fill-in, mixed; expand schema + runner UI + grading.
- Credit top-up IAP, deeper RevenueCat entitlements, restore edge cases.
- Push notifications, richer analytics, improved gamification + streak.
- Hardening public web abuse prevention and creator dashboards.

---

## Suggested Jira/Linear Epics (for tracking)

- **E0 Foundations:** env + contracts + analytics baseline
- **E1 Account:** auth + paywall + entitlements
- **E2 Generate:** course generation + credits + error handling
- **E3 Learn:** course/lesson player + completion persistence
- **E4 Share:** public web + views + iOS share UX
- **E5 Release:** TestFlight, App Store, monitoring
