# Trackable App Store Metadata Draft

Use this as the working copy for App Store Connect. Replace placeholders before submission.

## App Information

App name: Trackable

Bundle ID: `hyperteam.Goal-Tracker`

SKU: `trackable-ios-001`

Primary category: Health & Fitness

Secondary category: Productivity

Age rating: likely 4+, assuming no user-generated content, unrestricted web access, gambling, medical diagnosis, or mature content.

Target countries: start with Saudi Arabia and other English/Arabic markets you can support. Expand only where support, pricing, and legal coverage are ready.

## Subtitle

Private goal tracking

## Promotional Text

Track personal goals from Health, reminders, location, and device signals without creating an account.

## Description

Trackable helps you build a private progress system on your iPhone.

Create goals for steps, sleep, activity, reminders, battery, storage, focus sessions, and optional location samples. Trackable keeps your progress organized with simple goal cards, streaks, and summaries stored on your device.

Trackable is designed to be private by default:

- No username or password required.
- No third-party advertising SDKs.
- No third-party analytics SDKs in this version.
- Your goals and progress are stored on device.
- You can delete app data from Settings.

Trackable Pro unlocks unlimited goals and advanced tracking features through Apple In-App Purchase.

Important: Trackable is for personal tracking and informational use only. It is not a medical device and does not provide medical advice.

## Keywords

goals, habits, tracker, health, steps, sleep, reminders, productivity, streaks

## What's New

Initial release of Trackable for iPhone and iPad.

## Support URL

TODO: publish support page URL.

## Marketing URL

TODO: publish marketing website URL.

## Privacy Policy URL

TODO: publish privacy policy URL.

## Copyright

TODO: add company legal name.

## Review Notes

Trackable is a private, local-first goal tracking app. It does not require account creation or login.

The app may request access to Apple Health, reminders, and location only when the user enables a goal that uses that data source.

Purchases are handled with Apple StoreKit. The app includes restore purchases and subscription management UI.

No demo account is required because the app has no account system.

## In-App Purchases

Configure these exact product IDs in App Store Connect:

- `trackable.pro.weekly`
- `trackable.pro.monthly`
- `trackable.pro.yearly`
- `trackable.pro.lifetime`

Recommended display names:

- Trackable Pro Weekly
- Trackable Pro Monthly
- Trackable Pro Yearly
- Trackable Pro Lifetime

## App Privacy Notes

Current app design:

- No tracking.
- No third-party ads.
- No third-party analytics SDK.
- No account registration.
- Local SwiftData storage.
- StoreKit transaction entitlement status for purchases.

Data that may be accessed after user permission:

- Health data for selected goals.
- Reminders for completed-reminder goals.
- Location for optional home/outside goals.
- Device storage and battery state for device goals.

Before submission, complete App Store Connect privacy labels based on the final shipped behavior and the final public privacy policy.

## Screenshot Plan

Required:

- iPhone screenshots.
- iPad screenshots if iPad support remains enabled.

Recommended screens:

- Onboarding privacy screen.
- Home goal dashboard.
- Add goal screen.
- Goal settings screen.
- Pro/paywall screen.
- Settings/data deletion screen.

## External Launch Tasks

- Replace `support@example.com` in `docs/PRIVACY_POLICY.md`.
- Replace `support@example.com` in `docs/TERMS_OF_USE.md`.
- Publish privacy policy and terms as public web pages.
- Create the App Store Connect record.
- Configure IAP/subscriptions.
- Sandbox test purchases on a real device.
- Archive and upload a real iPhoneOS build.
