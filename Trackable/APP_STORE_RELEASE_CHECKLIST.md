# Trackable App Store Release Checklist

Current repo readiness: about 58%.

This percentage covers only what can be verified from this repository and local Xcode tooling. Apple Developer Portal setup, App Store Connect setup, public legal URLs, real-device testing, and sandbox purchases still have to be completed outside the repo.

## Completed In Repo

- SwiftUI app targets iPhone and iPad.
- Bundle ID is configured as `hyperteam.Goal-Tracker`.
- App version is `1.0` and build is `1`.
- App icon asset is present at `Goal Tracker/Assets.xcassets/AppIcon.appiconset/TrackableIcon.png`.
- Privacy manifest exists.
- HealthKit entitlement is declared.
- Unused iCloud, Family Controls, push, and background capabilities are not declared in this build.
- In-app data deletion flow exists in Settings.
- StoreKit 2 product loading, purchase, restore, and subscription management UI exist.
- StoreKit entitlement cache is persisted in SwiftData with product ID, expiration date, lifetime status, and last verification time.
- Focus timer/session tracking exists and persists completed/active focus sessions.
- Time at home/outside goals support home setup, manual/current location sample recording, and daily duration calculation from samples.
- English and Arabic localization files exist.
- Draft privacy policy and terms are in `docs/`.
- Draft App Store metadata is in `APP_STORE_METADATA.md`.

## Must Be Finished Outside The Repo

- Replace `support@example.com` in docs with the real support email.
- Publish privacy policy and terms pages to public URLs.
- Create App Store Connect app record.
- Configure App Store name, subtitle, keywords, description, categories, age rating, and territories using `APP_STORE_METADATA.md`.
- Configure StoreKit products matching:
  - `trackable.pro.weekly`
  - `trackable.pro.monthly`
  - `trackable.pro.yearly`
  - `trackable.pro.lifetime`
- Configure subscription group, pricing, free trials, and review information in App Store Connect.
- Sandbox-test purchases, restore purchases, cancellation, failed billing, and renewal.
- Complete App Privacy questionnaire.
- Confirm HealthKit is enabled on the exact Bundle ID in Apple Developer portal and regenerate the provisioning profile.
- Create final App Store screenshots for required devices.
- Archive and upload a real iPhoneOS build from Xcode.
- Test on real devices with HealthKit, Reminders, Location, and StoreKit sandbox.

## Known Product Gaps

- Screen Time, app category usage, and app blocking are intentionally removed from this build until Apple Family Controls approval and a Device Activity extension are added.
- iCloud/CloudKit sync is intentionally removed from this build until a production container and migration plan are tested.
- Home/outside time is calculated from recorded samples while the app is used; always-on geofence/visit tracking would require background location mode and additional real-device QA.
- Crash monitoring and analytics SDKs are intentionally not included in this private-first version.

## App Store Connect Product Setup

Create these products before sandbox testing:

| Product ID | Type | Notes |
| --- | --- | --- |
| `trackable.pro.weekly` | Auto-renewable subscription | Add to one subscription group. |
| `trackable.pro.monthly` | Auto-renewable subscription | Add to the same subscription group. |
| `trackable.pro.yearly` | Auto-renewable subscription | Add to the same subscription group. |
| `trackable.pro.lifetime` | Non-consumable | Keep separate from subscriptions. |

Sandbox test these flows:

- Product loading on a real device.
- New purchase for every product.
- Restore purchases.
- Subscription management sheet.
- Cancellation and renewal behavior.
- Failed billing/retry behavior for subscriptions.
- Fresh install after purchase.

## Apple Capability Setup

Enable and verify these capabilities for `hyperteam.Goal-Tracker`:

| Capability | In Repo | Apple Portal Check |
| --- | --- | --- |
| HealthKit | Declared | Enabled on Bundle ID and tested on real device. |
| iCloud / CloudKit | Not used | Leave disabled unless sync is reintroduced. |
| Family Controls | Not used | Leave disabled unless Screen Time/app blocking is reintroduced. |
| Push Notifications | Not used | Leave disabled unless notifications are added. |
| Sign in with Apple | Not used | Not required because the app has no third-party login. |

## Final Submission Blockers

- Public support email.
- Public privacy policy URL.
- Public terms URL.
- App Store screenshots.
- App Store Connect IAP/subscription setup.
- App Privacy questionnaire.
- Real-device QA.
- Real iPhoneOS archive upload.
