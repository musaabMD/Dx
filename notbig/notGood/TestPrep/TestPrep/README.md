# TestPrep - Exam Preparation App

A comprehensive SwiftUI exam preparation app with a Duolingo-inspired design, featuring glass morphism effects, gamification, and a freemium model.

## Features

### 🎯 Core Features
- **Splash Screen** - Animated intro with glass effects
- **Onboarding Flow** - Feature highlights with smooth transitions
- **User Authentication** - Simple sign-up flow (expandable)
- **Exam Selection** - Searchable list with favorites and bookmarks
- **Multiple Study Modes:**
  - Study Mode - Learn with detailed explanations
  - Exam Mode - Timed practice with real exam conditions
  - Last Minute Review - Quick one-line summaries with flashcard UI
  - Mock Exams - Full exam simulator

### 📚 Question Bank Features
- Browse by Subject, Topic, and Tags
- Advanced filtering system
- Question difficulty levels (Easy, Medium, Hard)
- Detailed explanations for every question
- AI integration placeholder for deeper learning

### 🎮 Gamification
- **Streak System** - Track daily study streaks
- **Leaderboard** - Compete with other users
- **Points System** - Earn points for correct answers
- **Visual Feedback** - Duolingo-style animations and rewards

### 💎 Freemium Model
- **Free Tier**: 30 questions per day
- **Premium Features**:
  - Unlimited questions
  - Advanced analytics
  - Offline access
  - AI learning assistant
  - Priority support
  - Exclusive content

### 🎨 Design
- **Liquid Glass Effects** - Modern Apple design language
- **Smooth Animations** - Spring-based transitions
- **Color-Coded UI** - Intuitive visual hierarchy
- **Responsive Layout** - Works on all iOS devices

### 📊 Review System
- Filter by: All, Correct, Incorrect, Flagged
- Detailed question review with explanations
- Performance statistics
- Flag questions for later review

## App Structure

```
TestPrep/
├── Models.swift                 # Data models (User, Exam, Question, etc.)
├── AppState.swift              # Observable app state management
├── ContentView.swift           # Main app coordinator
├── TestPrepApp.swift          # App entry point
│
├── Onboarding/
│   ├── SplashView.swift       # Animated splash screen
│   ├── IntroView.swift        # Feature highlights
│   └── SignUpView.swift       # Simple sign-up
│
├── Main Flow/
│   ├── ExamSelectionView.swift    # Browse and select exams
│   ├── ExamDetailView.swift       # Exam details and subjects
│   ├── MainDashboardView.swift    # Main tab-based interface
│   └── PaywallView.swift          # Premium upgrade screen
│
├── Study Modes/
│   ├── QBankView.swift            # Question bank browser
│   ├── StudyModeView.swift        # Study with explanations
│   ├── ExamModeView.swift         # Timed exam practice
│   ├── LastMinReviewView.swift   # Quick review flashcards
│   └── MockExamsView.swift        # Full exam simulator
│
├── Review & Stats/
│   ├── ReviewView.swift           # Review answered questions
│   ├── LeaderboardView.swift     # Global leaderboard
│   └── ProfileView.swift          # User profile and stats
```

## Key Models

### User
- Personal info (name, email)
- Premium status
- Daily question usage tracking
- Streak management
- Points and favorites

### Exam
- Name, description, icon
- Subjects and topics hierarchy
- Total questions
- Category classification

### Question
- Question text and options
- Correct answer and explanation
- Tags and difficulty
- One-line summary for quick review

### Study Session
- Mode (study, exam, review)
- Questions and answers
- Progress tracking
- Time tracking

## App Flow

1. **Launch** → Splash Screen (2.5s)
2. **First Time** → Intro Tour → Sign Up
3. **Returning** → Exam Selection or Dashboard
4. **Exam Selection** → Browse/Search → Select Exam
5. **Dashboard** → Choose Study Mode
6. **Study** → Answer Questions → Review Results
7. **Upgrade** → Paywall Modal (any time)

## Freemium Logic

```swift
var canAccessQuestion: Bool {
    if isPremium { return true }
    return dailyQuestionsUsed < 30
}
```

Free users:
- See daily limit card on home screen
- Get prompted to upgrade when limit reached
- Questions reset daily at midnight

## Design System

### Colors
- **Primary**: Blue to Purple gradient
- **Success**: Green
- **Error**: Red
- **Warning**: Orange
- **Premium**: Yellow/Gold

### Glass Effects
Using Apple's Liquid Glass design with `.glassEffect()` modifier:
- Cards and containers
- Buttons and interactive elements
- Floating panels
- Maintains background blur with tint colors

### Animations
- Spring animations for state changes
- Smooth transitions between views
- Progress indicators
- Streak fire animations
- Leaderboard podium effects

## Future Enhancements

### Planned Features
1. **AI Integration** - Use Foundation Models for personalized explanations
2. **Offline Mode** - Download questions for offline study
3. **Advanced Analytics** - Detailed performance insights
4. **Social Features** - Study groups and challenges
5. **Custom Exams** - Create personalized practice tests
6. **Spaced Repetition** - Intelligent review scheduling
7. **Voice Explanations** - Audio explanations for questions
8. **Dark Mode** - Full dark mode support
9. **iPad Optimization** - Split view and multitasking
10. **Watch App** - Quick study sessions on Apple Watch

### StoreKit Integration
To implement real IAP:
1. Configure products in App Store Connect
2. Add StoreKit configuration file
3. Implement purchase flow using StoreKit 2
4. Add subscription management
5. Implement receipt validation

### Backend Integration
Current implementation uses mock data. To add backend:
1. Replace mock data with API calls
2. Implement user authentication (OAuth, Sign in with Apple)
3. Add cloud sync for progress
4. Implement real-time leaderboards
5. Add content management system

## Running the App

1. Open `TestPrep.xcodeproj` in Xcode 15+
2. Select target device (iOS 17+)
3. Build and run (⌘R)

## Requirements
- iOS 17.0+
- Xcode 15.0+
- Swift 5.9+

## Architecture

- **SwiftUI** - Modern declarative UI
- **Swift Concurrency** - Async/await ready
- **@Observable** - Modern state management
- **Environment** - Dependency injection
- **MVVM** - Separation of concerns

## Notes

- All UI is built with SwiftUI
- Uses Apple's latest design language (Liquid Glass)
- Follows iOS Human Interface Guidelines
- Prepared for easy backend integration
- Scalable architecture for future features
- Accessibility-ready structure

## License

Created for TestPrep - Educational purposes

---

**Version**: 1.0.0  
**Date**: February 14, 2026  
**Author**: Musaab-HQ
