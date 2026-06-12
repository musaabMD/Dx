# LearnX App Store Readiness Checklist

Last updated: 2026-04-27

## What is already implemented in this repo

- [x] Native SwiftUI app structure with onboarding, paywall, library, create flow, stats, profile.
- [x] Local testing path works without login (guest/testing mode available).
- [x] Course creation works in testing mode through local fallback generation.
- [x] OpenRouter API generation path exists (uses `OPENROUTER_API_KEY` when configured).
- [x] Convex schema and server functions exist for courses/lessons/exercises.

## Critical missing items before App Store production publish

### 1) Authentication and accounts
- [ ] Real Clerk iOS integration (sign in/up, session refresh, sign out).
- [ ] Auth gate + protected API calls using user token.
- [ ] Guest -> account upgrade flow without data loss.

### 2) Production backend and persistence
- [ ] Connect iOS app create/library/course detail screens to Convex live data.
- [ ] Persist generated courses to Convex (not only local memory).
- [ ] Per-user ownership, access control, and authorization checks.
- [ ] Server-side input validation and rate limits for generation.

### 3) AI generation reliability and safety
- [ ] Move OpenRouter calls to secure backend function (do not expose raw key in app bundle).
- [ ] Add strict JSON schema validation + retries for malformed model output.
- [ ] Add content safety policy (kids/schools), blocked topics, and moderation logs.
- [ ] Add fallback messaging and user-facing error states (timeout/network/model failure).

### 4) Sharing and social gameplay
- [ ] Public/private share toggle wired to backend.
- [ ] Public web runner for shared course links.
- [ ] Quiz battle/trivia mode (Kahoot-style) with session host/join flow.
- [ ] Access control for private courses and revocable links.

### 5) Monetization and subscriptions
- [ ] Real StoreKit 2 + RevenueCat products and receipt validation.
- [ ] Credits debit/refund logic for failed generations.
- [ ] Restore purchases + entitlement refresh on cold launch.
- [ ] App Review-compliant purchase copy and disclosure text.

### 6) Legal, trust, and App Store compliance
- [ ] Privacy Policy URL and Terms URL with actual pages.
- [ ] Data usage disclosure (`PrivacyInfo.xcprivacy`) and ATT decision.
- [ ] COPPA/child safety policy and parental controls (if targeting kids under 13).
- [ ] Account deletion flow (if account creation is offered).
- [ ] Report content / abuse mechanism.

### 7) Quality and operations
- [ ] Crash reporting (Sentry/Firebase Crashlytics).
- [ ] Analytics funnel + retention dashboards (PostHog events end-to-end).
- [ ] UITests for core path: onboarding -> create -> learn -> share.
- [ ] Offline/poor-network handling and retry UX.
- [ ] App Store assets (screenshots, description, keywords, preview video).

## Work completed in this pass

- [x] Added `LaunchConfiguration` and persisted testing mode toggle.
- [x] Updated app flow to allow immediate entry into app in testing mode.
- [x] Added "Continue in test mode (no auth)" action from paywall.
- [x] Added optional OpenRouter generation service for real course generation.
- [x] Added safe fallback to local sample generation when API key/network/auth is unavailable.

## Required environment setup for real AI testing

- `OPENROUTER_API_KEY` must be provided either:
  - as an environment variable, or
  - in iOS app Info.plist as `OPENROUTER_API_KEY`.

For production, this key should be moved server-side and never shipped in the client app.
