# LearnX Product Documentation

AI Course Creation Platform · iOS App · v1.0 · April 2026

## 1) Executive Summary

LearnX is an AI-powered iOS platform that lets any user generate, share, and track structured learning courses in minutes. Users provide a prompt and LearnX creates full lessons with exercises (MCQ, fill-in-the-blank, speaking, image-based, flashcards, mixed). Courses can remain private or be shared via public links that open in any browser.

### Product Snapshot

| Dimension | Detail |
| --- | --- |
| Platform | Native iOS (iPhone) |
| Pricing | $25/month, 1-day paid trial ($1.99), credit top-ups |
| AI Model | Claude (Anthropic) via API |
| Auth | Email, Apple Sign-In, Google Sign-In |
| Sharing | Private or public web link |
| Exercise Types | MCQ, fill-in-the-blank, speaking, image-based, flashcards, mixed |
| Target Users | Self-learners, educators, doctors, trainers, parents |

## 2) Product Vision and Positioning

### Vision

LearnX makes expert-level course creation accessible to everyone by converting simple prompts into high-quality learning experiences.

### Differentiators

- Full AI-generated curriculum, not only single exercises.
- Multiple exercise formats in one product.
- Creator and learner workflows in one app.
- Link-based public sharing with no app required for viewers.
- Serves both child and professional learning use-cases.

### Core Personas

- **Self-learner (Alex, 28):** Rapidly generates courses and studies daily.
- **Medical professional (Dr. Sara, 36):** Builds exam and residency prep quickly.
- **Parent (Maria, 42):** Creates engaging kid-friendly content.
- **Corporate trainer (David, 45):** Produces onboarding and compliance courses.

## 3) End-to-End App Flow

### Primary Journey

1. Splash
2. Onboarding (first launch only)
3. Authentication
4. Paywall / trial start
5. Home (Library)
6. Create Course flow
7. Course Detail
8. Lesson flow (reading -> exercises -> completion)
9. Analytics / Stats
10. Profile and settings

### Screen-Level Requirements (Condensed)

- **Splash:** Max 1.5s, auth status check in background.
- **Onboarding:** 4 cards, skippable, trial CTA on final screen.
- **Auth:** Apple, Google, email/password with create account and password reset.
- **Paywall:** Paid trial entry; no free tier.
- **Home:** Course library, filters/sort, swipe actions (share/delete), progress-first layout.
- **Create:** Multi-step bottom sheet (topic -> audience/style -> exercises -> confirm).
- **Course Detail:** Course tab + Results tab, lessons list, share controls.
- **Lesson:** Reading phase, one-by-one exercises, completion summary with XP/score/streak.

## 4) Sharing and Public Web View

### In-App Sharing

- Copy link
- Share via iOS sheet
- Toggle public/private
- Revoke and regenerate link

### Public Web Experience

- Mobile-optimized web course runner at `learnx.app/c/{courseId}`
- Supports core exercise playback in browser
- Anonymous session-based score tracking
- Private course returns 403 page
- Sticky CTA to create own course in LearnX

### Creator Analytics from Shared Links

- Total views
- Approximate unique sessions
- Per-lesson completion rates
- Average score from web learners

## 5) Design System (Liquid Glass iOS)

### Design Principles

- Native-feeling iOS visual language
- Frosted/translucent surfaces
- Soft depth via blur and subtle shadow
- Bright accent color over light surfaces

### Color Tokens

- Brand: `#5B5FEF`
- Brand Light: `#EEEDFD`
- Accent Amber: `#F59E0B`
- Success: `#10B981`
- Error: `#EF4444`
- Ink: `#111827`
- Ink Soft: `#374151`
- Muted: `#6B7280`
- Surface: `#F9FAFB`
- Border: `#E5E7EB`
- System Blue: `#007AFF`

### Typography

- Display: SF Pro Display 34 Bold
- Title 1: SF Pro Display 28 Bold
- Title 2: SF Pro Text 22 Semibold
- Body: SF Pro Text 17 Regular
- Caption 1: SF Pro Text 13 Regular
- Caption 2: SF Pro Text 11 Medium

### Core UI Components

- Liquid Glass Card
- Course Card with progress and sharing state
- Bottom Sheets
- Exercise cards with correctness states
- Animated progress bars
- XP badge in exercise navigation

## 6) Navigation Architecture

### Tabs

- **Library**
- **Create** (center CTA)
- **Stats**

### Hierarchy

- Library -> Course Detail -> Lesson flow
- Create sheet -> generated Course Detail
- Stats -> Learning and Creator analytics views

### Modals/Sheets

- Share Sheet
- Delete Confirm
- Credit Low
- Subscription
- Profile

## 7) AI Course Generation

### Pipeline

1. User inputs topic, audience, style, exercise types.
2. Prompt assembler builds style-safe system + user prompt.
3. Claude API call executes.
4. JSON parsed and validated against schema.
5. Persist course graph in DB.
6. Navigate to generated course detail.

### Canonical Course Schema

```json
{
  "id": "uuid",
  "title": "string (max 60 chars)",
  "description": "string (1 sentence)",
  "emoji": "single emoji",
  "style": "duolingo | lecture | bootcamp | custom",
  "audience": "self | students | kids | team",
  "difficulty": "Beginner | Intermediate | Advanced",
  "estimatedMinutes": "number",
  "lessons": [
    {
      "id": "uuid",
      "title": "string",
      "content": "string (3-5 paragraphs)",
      "keyPoints": ["string", "string", "string"],
      "exercises": [
        {
          "id": "uuid",
          "type": "quiz | typing | truefalse | flashcard | speaking | image",
          "question": "string",
          "options": ["string x4"],
          "correctIndex": "number (MCQ only)",
          "answer": "string (non-MCQ)",
          "expectedKeywords": ["string"],
          "explanation": "string",
          "imagePrompt": "string (image type only)"
        }
      ]
    }
  ]
}
```

### Style Behavior

- **Duolingo:** short, friendly, gamified.
- **Lecture:** thorough and formal.
- **Bootcamp:** practical and challenge-driven.
- **Kid Mode:** simpler language and image-forward.
- **Custom:** follows user-provided constraints.

## 8) Analytics

### My Learning View

- Current streak + weekly streak bar
- Total XP
- Time active (months/years)
- Courses completed
- Average score
- Exercise time spent
- 12-week activity heatmap

### My Courses (Creator) View

- Total created courses
- Public/private split
- Aggregated views
- Approx. unique web learners
- Per-course score and completion table
- Best-performing course
- Weakest exercise type

## 9) Technical Architecture

### Stack

- iOS: Swift + SwiftUI
- State: `@StateObject` + Combine
- Backend: Node.js + Express (or Supabase Edge Functions)
- DB: PostgreSQL (Supabase)
- Auth: Supabase Auth
- AI: Anthropic Claude
- Payments: RevenueCat + StoreKit 2
- Public web: Next.js on Vercel
- Analytics: PostHog
- Push: APNs via Supabase

### Data Model (Core)

- `users`
- `courses`
- `lessons`
- `exercises`
- `completions`
- `web_sessions`
- `subscriptions`
- `credit_transactions`

### API Surface (Core)

- Auth endpoints (`signup`, `login`)
- Course CRUD + generate + stats
- Completion recording
- Profile retrieval
- Trial and top-up purchase endpoints
- Public web course/session endpoints

## 10) Monetization

### Subscription Mechanics

- Paid trial: $1.99 for 1 day.
- Auto-converts to $25/month.
- 100 credits granted on subscription cycle.
- Cancellation keeps access until period end.

### Credit Economy

- Generate course: 10 credits
- Regenerate full course: 5 credits
- Regenerate lesson: 2 credits
- Monthly reset: +100 credits
- Top-up packs: +50, +120, +300 credits

## 11) User Profile and Gamification

### Profile Data

- Identity (avatar/name/email)
- Member-since and active duration
- Streak details
- XP and level (500 XP per level)
- Subscription and credits
- Notification toggles
- Account controls

### Gamification System

- XP per exercise outcome
- Daily streak with weekly freeze buffer
- Level progression to 100
- Completion badges
- Per-lesson and per-course score visibility

## 12) Push Notifications

- Daily streak reminder
- Trial expiry warning
- Low credits warning
- View milestones for public courses
- Weekly progress summary
- Shared course learner activity updates

## 13) Complete Screen Inventory

1. Splash
2. Onboarding (1-4)
3. Auth sign-in
4. Auth create account
5. Email verification
6. Paywall
7. Home/Library
8. Create step 1
9. Create step 2
10. Create step 3
11. Create step 4/loading
12. Course detail
13. Course detail results
14. Lesson reading
15. Lesson exercise
16. Lesson complete
17. Analytics
18. Profile
19. Share sheet
20. Delete confirm
21. Credit top-up
22. Subscription gate
23. Public web view (browser)

## 14) Success Metrics (Month 6 Targets)

- Trial start rate: 60% of auth completions
- Trial->subscription conversion: 25%
- D1 retention: 70%
- D7 retention: 40%
- D30 retention: 20%
- Courses created/user/month: 3+
- Publicly shared courses/user: 1.5
- XP per active user/week: 200+
- Subscriber top-up rate: 15%
- App Store rating: 4.5+
- Crash-free sessions: 99.5%+

## 15) Launch Plan

### Phase 1 (Weeks 1-8) MVP

- Auth (Apple, email) [P0]
- Paywall + paid trial [P0]
- Course creation with MCQ + flashcards [P0]
- Home library [P0]
- Lesson reading + exercise flow [P0]
- Basic analytics [P0]
- Public/private sharing + web view [P1]

### Phase 2 (Weeks 9-16) Growth

- Speaking exercises [P1]
- Image-based exercises [P1]
- Fill-in-the-blank [P1]
- Kid Mode audience variant [P1]
- Credit top-up IAP [P1]
- Streak/gamification [P2]
- Push notifications [P2]
- Advanced creator analytics [P2]

### Phase 3 (Weeks 17-24) Scale

- Spaced repetition [P2]
- Course templates [P2]
- Team/org accounts [P3]
- Offline mode [P3]
- AI suggestions from history [P3]
- Android app [P3]

---

LearnX · Product Documentation v1.0 · Confidential · April 2026
