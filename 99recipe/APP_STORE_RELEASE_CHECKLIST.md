# 99recipe App Store Release Checklist

## 1) Product and identity

- [ ] Confirm app name shown in App Store Connect.
- [ ] Confirm bundle identifier is `com.hyperteam.recipe99`.
- [ ] Keep semantic versioning:
  - [ ] `MARKETING_VERSION` (for users)
  - [ ] `CURRENT_PROJECT_VERSION` (build number)

## 2) Auth and backend

- [ ] Set Xcode build setting `CLERK_PUBLISHABLE_KEY` for Debug and Release.
- [ ] In Convex dashboard set `CLERK_JWT_ISSUER_DOMAIN`.
- [ ] Verify `convex/auth.config.ts` provider domain resolves correctly.
- [ ] Run `npm run deploy` in `convex` root before release.
- [ ] Validate sign in, sign out, and first-launch onboarding with a fresh account.

## 3) App privacy and legal

- [ ] Host and publish privacy policy URL.
- [ ] Host and publish terms of use URL.
- [ ] Enter both URLs in App Store Connect.
- [ ] Complete App Privacy nutrition labels in App Store Connect.
- [ ] Keep `PrivacyInfo.xcprivacy` in target membership.

## 4) Permissions

- [ ] Verify camera permission prompt copy is correct and truthful.
- [ ] Verify photo library prompt copy is correct and truthful.
- [ ] Request permissions only when user takes a related action.

## 5) Visual assets

- [ ] Replace placeholder app icon with final branded icon assets.
- [ ] Add all required App Store screenshots for iPhone sizes.
- [ ] Add optional preview videos if available.

## 6) QA and stability

- [ ] Run unit tests and UI tests on latest iOS simulator.
- [ ] Run smoke tests on at least one physical device.
- [ ] Verify offline and degraded-network behavior.
- [ ] Validate no crashes during sign in and launch flow.

## 7) Distribution

- [ ] Create archive in Xcode.
- [ ] Validate archive.
- [ ] Upload to App Store Connect.
- [ ] Submit TestFlight build for beta testing.
- [ ] Resolve tester feedback and re-upload if needed.
- [ ] Submit for review.

## 8) App Store metadata

- [ ] App subtitle
- [ ] Description
- [ ] Keywords
- [ ] Support URL
- [ ] Marketing URL (optional)
- [ ] Category
- [ ] Age rating
- [ ] Export compliance answers
