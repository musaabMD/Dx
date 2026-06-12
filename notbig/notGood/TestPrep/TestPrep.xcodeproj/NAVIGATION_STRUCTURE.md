# App Navigation Structure

## 📱 New App Flow

```
┌─────────────────────────────────────────────────────────────┐
│                      Exam Selection                          │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Search: [magnifying glass icon]                      │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Medical                                              │  │
│  │    [icon] USMLE Step 1        500 questions    >     │  │
│  │    [icon] USMLE Step 2        600 questions    >     │  │
│  ├──────────────────────────────────────────────────────┤  │
│  │  Engineering                                          │  │
│  │    [icon] FE Exam             450 questions    >     │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Main App (TabView)                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌────────────────────  HOME TAB  ──────────────────────┐  │
│  │                                                        │  │
│  │  Hello, John                    [Grid Button]         │  │
│  │  Ready to study?                                      │  │
│  │                                                        │  │
│  │  ┌─────────────┐  ┌─────────────┐                    │  │
│  │  │ 🔥 Streak   │  │ 📊 Progress │                    │  │
│  │  │     5       │  │    42%      │                    │  │
│  │  │   days      │  │  complete   │                    │  │
│  │  └─────────────┘  └─────────────┘                    │  │
│  │                                                        │  │
│  │  ┌─────────────┐  ┌─────────────┐                    │  │
│  │  │ ⭐ Score    │  │ 🏆 Rank     │                    │  │
│  │  │    78       │  │    #42      │                    │  │
│  │  │ % correct   │  │ leaderboard │                    │  │
│  │  └─────────────┘  └─────────────┘                    │  │
│  │                                                        │  │
│  │  Quick Start                                          │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │ 📘 Study Mode                              > │    │  │
│  │  │    Learn at your own pace                    │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │ ✏️ Practice Questions                       > │    │  │
│  │  │    Test your knowledge                       │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │ ⏱️ Mock Exam                                > │    │  │
│  │  │    Timed practice test                       │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  │                                                        │  │
│  │  Daily Limit (for free users)                        │  │
│  │  ┌──────────────────────────────────────────────┐    │  │
│  │  │ Daily Limit              [Upgrade]           │    │  │
│  │  │ 15 of 30 questions used                      │    │  │
│  │  │ ▓▓▓▓▓▓▓▓▓▓▓░░░░░░░                          │    │  │
│  │  └──────────────────────────────────────────────┘    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────  PRACTICE TAB  ──────────────────┐  │
│  │                                                      │  │
│  │  Practice                             Search        │  │
│  │                                                      │  │
│  │  Study All Questions                            >   │  │
│  │  Random Practice                                >   │  │
│  │                                                      │  │
│  │  By Subject                                         │  │
│  │  ⌄ 📁 Cardiology                                   │  │
│  │      Heart Failure              45 questions    >   │  │
│  │      Arrhythmias                32 questions    >   │  │
│  │      Valvular Disease           28 questions    >   │  │
│  │  ⌄ 📁 Pulmonology                                  │  │
│  │      Asthma                     20 questions    >   │  │
│  │      COPD                       18 questions    >   │  │
│  │  > 📁 Gastroenterology                             │  │
│  │  > 📁 Neurology                                    │  │
│  └────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────  REVIEW TAB  ───────────────────┐  │
│  │                                                      │  │
│  │  Review                               Search        │  │
│  │                                                      │  │
│  │  [ All | Flagged | Incorrect | Correct ]           │  │
│  │                                                      │  │
│  │  Cardiology                    ✅                   │  │
│  │  What is the primary function of...                │  │
│  │                                                      │  │
│  │  Pharmacology         🚩        ❌                  │  │
│  │  Which enzyme converts angioten...                 │  │
│  │                                                      │  │
│  │  Pharmacology                   ❌                  │  │
│  │  Main action of beta blockers?                     │  │
│  │                                                      │  │
│  │  Anatomy                        ✅                   │  │
│  │  What are the layers of the epi...                 │  │
│  └────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌──────────────────  PROFILE TAB  ──────────────────┐  │
│  │                                                      │  │
│  │  Profile                                            │  │
│  │                                                      │  │
│  │  👤  John Smith                                     │  │
│  │      john@example.com                              │  │
│  │      [Premium Member]                              │  │
│  │                                                      │  │
│  │  Statistics                                         │  │
│  │  🔥  Current Streak         5 days                 │  │
│  │  🔥  Longest Streak         12 days                │  │
│  │  ⭐  Total Points           450                    │  │
│  │  ✅  Questions Answered     89                     │  │
│  │                                                      │  │
│  │  Settings                                           │  │
│  │  🔔  Notifications                              >   │  │
│  │  🏆  Leaderboard                                >   │  │
│  │  👑  Upgrade to Premium                         >   │  │
│  │                                                      │  │
│  │  Sign Out                                           │  │
│  └────────────────────────────────────────────────────┘  │
│                                                              │
├─────────────────────────────────────────────────────────────┤
│     🏠 Home    📚 Practice    ✓ Review    👤 Profile       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🎨 Design Patterns Used

### Navigation
- ✅ `NavigationStack` - Modern navigation container
- ✅ `TabView` - Standard iOS bottom tabs
- ✅ `.navigationTitle()` - Standard titles
- ✅ `.toolbar()` - Standard toolbar buttons

### Content Display
- ✅ `List` - Scrollable content with sections
- ✅ `ScrollView` + `VStack` - Custom layouts
- ✅ `LazyVGrid` - Grid layouts for cards
- ✅ `DisclosureGroup` - Expandable sections

### Input
- ✅ `.searchable()` - Native search
- ✅ `Picker` - Segmented control for filters
- ✅ `Button` - Standard actions

### Styling
- ✅ System colors - `.blue`, `.green`, `.red`, `.orange`
- ✅ System backgrounds - `.systemGroupedBackground`
- ✅ Dynamic Type - `.headline`, `.body`, `.caption`
- ✅ SF Symbols - System icons

---

## 🔄 User Flows

### Starting a Practice Session:
```
1. Home Tab
2. Tap "Practice Questions"
3. Choose a subject
4. Expand to see topics
5. Tap a topic
6. Tap "Start Studying"
```

### Reviewing Incorrect Answers:
```
1. Review Tab
2. Select "Incorrect" filter
3. Scroll through list
4. Tap a question to review
```

### Checking Leaderboard:
```
1. Profile Tab
2. Tap "Leaderboard"
3. View rankings
```

### Changing Exam:
```
1. Any tab
2. Tap grid button (top right)
3. Select new exam
4. Returns to Home
```

---

## 📐 Layout Specifications

### Spacing:
- Section spacing: 20pt
- Card spacing: 12pt
- Element padding: 16pt horizontal, 20pt vertical
- Icon spacing: 12-16pt from text

### Typography:
- Page title: `.largeTitle.bold()` (34pt)
- Section header: `.title2.bold()` (22pt)
- Card title: `.headline` (17pt)
- Body text: `.body` (17pt)
- Supporting text: `.subheadline` (15pt)
- Metadata: `.caption` (12pt)

### Colors:
- Primary text: `.primary` (system)
- Secondary text: `.secondary` (system)
- Background: `.systemGroupedBackground`
- Cards: `.secondarySystemGroupedBackground`
- Accent: `.blue`
- Success: `.green`
- Error: `.red`
- Warning: `.orange`

### Icons:
- Large icons: 50x50pt
- Medium icons: 32-36pt
- Small icons: 20-24pt
- Tab bar icons: System default

---

## ✨ Key Features

### Home Tab:
- Personalized greeting
- 4 stat cards at a glance
- Quick action buttons
- Daily limit indicator (free users)

### Practice Tab:
- Browse all questions
- Random practice option
- Organized by subject/topic
- Expandable tree structure
- Search functionality

### Review Tab:
- Filter by status
- Flag important questions
- Search questions
- Clear status indicators

### Profile Tab:
- User information
- Statistics overview
- Settings access
- Account management

---

## 🎯 Design Goals Achieved

✅ **Clean** - Removed unnecessary decoration  
✅ **Simple** - Standard iOS patterns  
✅ **Professional** - Apple-quality design  
✅ **Intuitive** - Familiar navigation  
✅ **Consistent** - Same patterns throughout  
✅ **Accessible** - Support for all users  
✅ **Performant** - Optimized rendering  

---

## 🚀 Implementation Complete!

The app now follows Apple's Human Interface Guidelines and provides a professional, intuitive user experience. All screens use standard SwiftUI components, system colors, and familiar iOS patterns.

**Result: An app that looks and feels like Apple made it!** 🍎
