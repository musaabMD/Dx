// OnboardingFlow.swift
// DrKardIOS – Complete high-conversion onboarding flow

import SwiftUI
import Combine
import AuthenticationServices
import StoreKit
#if canImport(UIKit)
import UIKit
#elseif canImport(AppKit)
import AppKit
#endif

// MARK: - Design Tokens

private extension Color {
    static let dkBackground    = Color(red: 0.05, green: 0.05, blue: 0.10)
    static let dkCard          = Color(red: 0.10, green: 0.10, blue: 0.18)
    static let dkCardBright    = Color(red: 0.14, green: 0.14, blue: 0.24)
    static let dkAccent        = Color(red: 0.31, green: 0.55, blue: 0.97)
    static let dkAccentPurple  = Color(red: 0.49, green: 0.34, blue: 0.96)
    static let dkAccentGold    = Color(red: 0.98, green: 0.76, blue: 0.18)
    static let dkBorder        = Color.white.opacity(0.12)
    static let dkTextPrimary    = Color.white
    static let dkTextSecondary  = Color.white.opacity(0.55)
    /// Lighter than secondary — `TextField` placeholders must not use system placeholder gray on `dkCard`.
    static let dkTextPlaceholder = Color.white.opacity(0.72)
    static let dkSuccess       = Color(red: 0.20, green: 0.85, blue: 0.55)
}

private enum DKGradient {
    static let accent = LinearGradient(
        colors: [Color.dkAccent, Color.dkAccentPurple],
        startPoint: .leading, endPoint: .trailing
    )
    static let accentVertical = LinearGradient(
        colors: [Color.dkAccent, Color.dkAccentPurple],
        startPoint: .top, endPoint: .bottom
    )
    static let background = LinearGradient(
        colors: [Color.dkBackground, Color(red: 0.07, green: 0.05, blue: 0.14)],
        startPoint: .top, endPoint: .bottom
    )
    static let gold = LinearGradient(
        colors: [Color(red: 0.98, green: 0.76, blue: 0.18), Color(red: 0.98, green: 0.52, blue: 0.18)],
        startPoint: .leading, endPoint: .trailing
    )
}

// MARK: - Shared Components

private struct DKPrimaryButton: View {
    let title: String
    let action: () -> Void
    var isEnabled: Bool = true

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background {
                    ZStack {
                        DKGradient.accent
                        Color.black.opacity(isEnabled ? 0 : 0.5)
                    }
                    .clipShape(RoundedRectangle(cornerRadius: 14))
                }
        }
        .disabled(!isEnabled)
    }
}

private struct DKSecondaryButton: View {
    let title: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(.dkTextSecondary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
        }
    }
}

private struct DKInputField: View {
    let label: String
    let placeholder: String
    @Binding var text: String
    var keyboard: UIKeyboardType = .default
    var isFocused: Bool = false

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(.dkTextSecondary)
            TextField(placeholder, text: $text)
                .foregroundColor(.dkTextPrimary)
                .keyboardType(keyboard)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled()
                .padding(14)
                .background(Color.dkCard)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay {
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(isFocused ? Color.dkAccent.opacity(0.7) : Color.dkBorder, lineWidth: 1)
                }
        }
    }
}

// MARK: - Onboarding Step Enum

enum OnboardingStep: Int, CaseIterable, Identifiable {
    case splash, welcome, examSelection, timeline, skillLevel,
         valueProp1, valueProp2, valueProp3, valueProp4,
         planGeneration, sampleContent, signup, paywall, dashboard

    var id: Int { rawValue }
}

// MARK: - ViewModel

final class OnboardingFlowViewModel: ObservableObject {
    @Published var currentStep: OnboardingStep = .splash
    @Published var selectedExams: [String] = []
    @Published var selectedTimeline: String? = nil
    @Published var selectedSkill: String? = nil
    @Published var signedUp: Bool = false
    @Published var startedFreeTrial: Bool = false
    @Published var userEmail: String = ""
    @Published var userName: String = ""

    func nextStep() {
        if let next = OnboardingStep(rawValue: currentStep.rawValue + 1) {
            withAnimation(.easeInOut(duration: 0.35)) { currentStep = next }
        }
    }

    func goToStep(_ step: OnboardingStep) {
        withAnimation(.easeInOut(duration: 0.35)) { currentStep = step }
    }
}

// MARK: - Main Flow View

struct OnboardingFlowView: View {
    @StateObject private var viewModel = OnboardingFlowViewModel()
    @StateObject private var studySession = StudySessionViewModel()
    @StateObject private var authSession = AuthSessionManager()
    @StateObject private var subscriptionStore = SubscriptionStore()

    var body: some View {
        ZStack {
            if viewModel.currentStep != .dashboard {
                DKGradient.background.ignoresSafeArea()
            }

            switch viewModel.currentStep {
            case .splash:        SplashScreen().environmentObject(viewModel)
            case .welcome:       WelcomeScreen().environmentObject(viewModel)
            case .examSelection: ExamSelectionScreen().environmentObject(viewModel)
            case .timeline:      TimelineScreen().environmentObject(viewModel)
            case .skillLevel:    SkillLevelScreen().environmentObject(viewModel)
            case .valueProp1:    ValuePropScreen(index: 1).environmentObject(viewModel)
            case .valueProp2:    ValuePropScreen(index: 2).environmentObject(viewModel)
            case .valueProp3:    ValuePropScreen(index: 3).environmentObject(viewModel)
            case .valueProp4:    ValuePropScreen(index: 4).environmentObject(viewModel)
            case .planGeneration: PlanGenerationScreen().environmentObject(viewModel)
            case .sampleContent: SampleContentScreen().environmentObject(viewModel)
            case .signup:
                SignupScreen()
                    .environmentObject(viewModel)
                    .environmentObject(authSession)
            case .paywall:
                PaywallScreen()
                    .environmentObject(viewModel)
                    .environmentObject(subscriptionStore)
            case .dashboard:
                MainStudyShellView()
                    .environmentObject(studySession)
                    .environmentObject(authSession)
                    .environmentObject(subscriptionStore)
            }
        }
        .animation(.easeInOut(duration: 0.35), value: viewModel.currentStep)
        .task {
            await authSession.refreshIdentityState()
            await subscriptionStore.loadProducts()
            await subscriptionStore.refreshEntitlements()
            await studySession.loadCloudContentIfAvailable()
        }
    }
}

// MARK: - 1. Splash Screen

struct SplashScreen: View {
    @EnvironmentObject var flow: OnboardingFlowViewModel
    @State private var scale: CGFloat = 0.75
    @State private var opacity: Double = 0

    var body: some View {
        ZStack {
            DKGradient.background.ignoresSafeArea()
            VStack(spacing: 16) {
                ZStack {
                    Circle()
                        .fill(DKGradient.accent)
                        .frame(width: 90, height: 90)
                        .blur(radius: 28)
                        .opacity(0.5)
                    ZStack {
                        Circle()
                            .fill(DKGradient.accentVertical)
                            .frame(width: 96, height: 96)
                        Image(systemName: "graduationcap.fill")
                            .font(.system(size: 44, weight: .bold))
                            .foregroundColor(.white)
                    }
                }
                Text("DrKard")
                    .font(.system(size: 34, weight: .black, design: .rounded))
                    .foregroundColor(.dkTextPrimary)
            }
            .scaleEffect(scale)
            .opacity(opacity)
        }
        .onAppear {
            withAnimation(.spring(response: 0.6, dampingFraction: 0.72)) {
                scale = 1.0
                opacity = 1.0
            }
            DispatchQueue.main.asyncAfter(deadline: .now() + 1.8) {
                flow.nextStep()
            }
        }
    }
}

// MARK: - 2. Welcome Screen

struct WelcomeScreen: View {
    @EnvironmentObject var flow: OnboardingFlowViewModel
    @State private var appeared = false

    private let badges: [(String, Color)] = [
        ("SAT", .dkAccent), ("IELTS", .dkAccentPurple), ("MCAT", .dkAccent),
        ("GRE", .dkAccentPurple), ("BAR Exam", .dkAccent), ("CPA", .dkAccentPurple),
        ("LSAT", .dkAccent), ("USMLE", .dkAccentPurple), ("TOEFL", .dkAccent)
    ]

    var body: some View {
        VStack(spacing: 0) {
            Spacer()
            // Floating exam badges hero
            ZStack {
                Circle()
                    .fill(DKGradient.accent)
                    .frame(width: 180, height: 180)
                    .blur(radius: 55)
                    .opacity(0.22)
                VStack(spacing: 8) {
                    HStack(spacing: 8) {
                        examBadge(badges[0]); examBadge(badges[1]); examBadge(badges[2])
                    }
                    HStack(spacing: 8) {
                        examBadge(badges[3]); examBadge(badges[4]); examBadge(badges[5])
                    }
                    HStack(spacing: 8) {
                        examBadge(badges[6]); examBadge(badges[7]); examBadge(badges[8])
                    }
                }
            }
            .padding(.bottom, 36)

            VStack(spacing: 14) {
                Text("Pass Any Exam\nin Less Time")
                    .font(.system(size: 36, weight: .black, design: .rounded))
                    .foregroundColor(.dkTextPrimary)
                    .multilineTextAlignment(.center)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 18)

                Text("Diagnostic + mistake analysis + targeted recovery loop +\nreadiness by topic — all in one place.")
                    .font(.system(size: 16))
                    .foregroundColor(.dkTextSecondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(3)
                    .opacity(appeared ? 1 : 0)
                    .offset(y: appeared ? 0 : 18)
            }
            .padding(.horizontal, 28)

            Spacer()

            VStack(spacing: 12) {
                DKPrimaryButton(title: "Get Started") { flow.nextStep() }

                Button("Already have an account? Log in") {}
                    .font(.system(size: 15))
                    .foregroundColor(.dkTextSecondary)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 44)
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.55).delay(0.15)) { appeared = true }
        }
    }

    private func examBadge(_ item: (String, Color)) -> some View {
        Text(item.0)
            .font(.system(size: 13, weight: .semibold))
            .foregroundColor(.white)
            .padding(.horizontal, 14)
            .padding(.vertical, 7)
            .background(item.1.opacity(0.22))
            .clipShape(Capsule())
            .overlay(Capsule().stroke(item.1.opacity(0.45), lineWidth: 1))
    }
}

// MARK: - 3. Exam Selection Screen

struct ExamSelectionScreen: View {
    @EnvironmentObject var flow: OnboardingFlowViewModel
    @State private var searchText = ""

    private let allExams = [
        "SAT", "ACT", "GRE", "GMAT", "MCAT", "LSAT",
        "BAR Exam", "CPA", "USMLE", "IELTS", "TOEFL",
        "NCLEX", "PMP", "AWS Cert", "CompTIA A+",
        "CompTIA Security+", "CFA", "DAT", "NAPLEX",
        "Series 7", "AP Exams", "IB Exams", "PSAT",
        "Real Estate", "Custom Exam"
    ]

    private var filtered: [String] {
        searchText.isEmpty ? allExams : allExams.filter {
            $0.localizedCaseInsensitiveContains(searchText)
        }
    }

    private let columns = [GridItem(.flexible()), GridItem(.flexible())]

    var body: some View {
        VStack(spacing: 0) {
            VStack(spacing: 6) {
                Text("What exam are you\npreparing for?")
                    .font(.system(size: 28, weight: .black, design: .rounded))
                    .foregroundColor(.dkTextPrimary)
                    .multilineTextAlignment(.center)
                Text("Select all that apply")
                    .font(.system(size: 14))
                    .foregroundColor(.dkTextSecondary)
            }
            .padding(.top, 56)
            .padding(.bottom, 18)

            // Search bar
            HStack(spacing: 10) {
                Image(systemName: "magnifyingglass")
                    .foregroundColor(.dkTextSecondary)
                TextField(
                    "",
                    text: $searchText,
                    prompt: Text("Search any exam…").foregroundStyle(Color.dkTextPlaceholder)
                )
                .foregroundStyle(Color.dkTextPrimary)
                .tint(.dkAccent)
                .accessibilityLabel("Search any exam")
                if !searchText.isEmpty {
                    Button { searchText = "" } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundColor(.dkTextSecondary)
                    }
                }
            }
            .padding(12)
            .background(Color.dkCard)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.dkBorder, lineWidth: 1))
            .padding(.horizontal, 20)
            .padding(.bottom, 14)

            ScrollView(showsIndicators: false) {
                LazyVGrid(columns: columns, spacing: 10) {
                    ForEach(filtered, id: \.self) { exam in
                        ExamChipButton(
                            title: exam,
                            isSelected: flow.selectedExams.contains(exam)
                        ) {
                            withAnimation(.easeInOut(duration: 0.15)) {
                                if flow.selectedExams.contains(exam) {
                                    flow.selectedExams.removeAll { $0 == exam }
                                } else {
                                    flow.selectedExams.append(exam)
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 16)
            }
        }
        .safeAreaInset(edge: .bottom) {
            VStack(spacing: 0) {
                Divider().background(Color.dkBorder)
                VStack(spacing: 4) {
                    if !flow.selectedExams.isEmpty {
                        Text("\(flow.selectedExams.count) selected")
                            .font(.system(size: 13))
                            .foregroundColor(.dkAccent)
                    }
                    DKPrimaryButton(
                        title: "Continue",
                        action: { flow.nextStep() },
                        isEnabled: !flow.selectedExams.isEmpty
                    )
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 14)
                .background(Color.dkBackground.ignoresSafeArea())
            }
        }
    }
}

private struct ExamChipButton: View {
    let title: String
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            Text(title)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(isSelected ? .white : .dkTextSecondary)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background {
                    if isSelected {
                        DKGradient.accent.clipShape(RoundedRectangle(cornerRadius: 12))
                    } else {
                        Color.dkCard.clipShape(RoundedRectangle(cornerRadius: 12))
                    }
                }
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay {
                    RoundedRectangle(cornerRadius: 12)
                        .stroke(isSelected ? Color.clear : Color.dkBorder, lineWidth: 1)
                }
        }
    }
}

// MARK: - 4. Timeline Screen

struct TimelineScreen: View {
    @EnvironmentObject var flow: OnboardingFlowViewModel

    private let options: [(emoji: String, label: String, sub: String)] = [
        ("⚡", "1 Week",   "Intensive sprint mode"),
        ("🗓", "2 Weeks",  "Focused short prep"),
        ("📅", "1 Month",  "Steady and consistent"),
        ("🌱", "2 Months", "Building a strong base"),
        ("🎯", "3 Months", "Thorough preparation"),
        ("🚀", "6 Months", "Master every topic"),
        ("🏆", "1 Year+",  "Deep expertise")
    ]

    var body: some View {
        VStack(spacing: 0) {
            VStack(spacing: 6) {
                Text("When is your exam?")
                    .font(.system(size: 28, weight: .black, design: .rounded))
                    .foregroundColor(.dkTextPrimary)
                    .multilineTextAlignment(.center)
                Text("We'll build your plan around your timeline")
                    .font(.system(size: 14))
                    .foregroundColor(.dkTextSecondary)
            }
            .padding(.top, 56)
            .padding(.bottom, 24)

            ScrollView(showsIndicators: false) {
                VStack(spacing: 10) {
                    ForEach(options, id: \.label) { opt in
                        TimelineRow(
                            emoji: opt.emoji,
                            label: opt.label,
                            subtitle: opt.sub,
                            isSelected: flow.selectedTimeline == opt.label
                        ) {
                            withAnimation(.easeInOut(duration: 0.15)) {
                                flow.selectedTimeline = opt.label
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 16)
            }
        }
        .safeAreaInset(edge: .bottom) {
            VStack(spacing: 0) {
                Divider().background(Color.dkBorder)
                DKPrimaryButton(
                    title: "Continue",
                    action: { flow.nextStep() },
                    isEnabled: flow.selectedTimeline != nil
                )
                .padding(.horizontal, 24)
                .padding(.vertical, 14)
                .background(Color.dkBackground.ignoresSafeArea())
            }
        }
    }
}

private struct TimelineRow: View {
    let emoji: String
    let label: String
    let subtitle: String
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 14) {
                Text(emoji)
                    .font(.title2)
                    .frame(width: 44)

                VStack(alignment: .leading, spacing: 2) {
                    Text(label)
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(.dkTextPrimary)
                    Text(subtitle)
                        .font(.system(size: 13))
                        .foregroundColor(.dkTextSecondary)
                }

                Spacer()

                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.title3)
                        .foregroundStyle(DKGradient.accent)
                }
            }
            .padding(16)
            .background(isSelected ? Color.dkAccent.opacity(0.12) : Color.dkCard)
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay {
                RoundedRectangle(cornerRadius: 14)
                    .stroke(isSelected ? Color.dkAccent.opacity(0.5) : Color.dkBorder, lineWidth: 1)
            }
        }
    }
}

// MARK: - 5. Skill Level Screen

struct SkillLevelScreen: View {
    @EnvironmentObject var flow: OnboardingFlowViewModel

    private let levels: [(icon: String, title: String, description: String, value: String)] = [
        ("🌱", "Beginner",     "Starting fresh — I need to cover the basics first",  "beginner"),
        ("📚", "Intermediate", "I know some material but need focused practice",      "intermediate"),
        ("🎓", "Advanced",     "Strong foundation — I want to perfect my score",      "advanced")
    ]

    var body: some View {
        VStack(spacing: 0) {
            VStack(spacing: 6) {
                Text("What's your\nskill level?")
                    .font(.system(size: 28, weight: .black, design: .rounded))
                    .foregroundColor(.dkTextPrimary)
                    .multilineTextAlignment(.center)
                Text("We'll personalize your study plan accordingly")
                    .font(.system(size: 14))
                    .foregroundColor(.dkTextSecondary)
                    .multilineTextAlignment(.center)
            }
            .padding(.top, 56)
            .padding(.bottom, 36)

            VStack(spacing: 14) {
                ForEach(levels, id: \.value) { level in
                    SkillCard(
                        icon: level.icon,
                        title: level.title,
                        description: level.description,
                        isSelected: flow.selectedSkill == level.value
                    ) {
                        withAnimation(.easeInOut(duration: 0.15)) {
                            flow.selectedSkill = level.value
                        }
                    }
                }
            }
            .padding(.horizontal, 20)

            Spacer()

            DKPrimaryButton(
                title: "Continue",
                action: { flow.nextStep() },
                isEnabled: flow.selectedSkill != nil
            )
            .padding(.horizontal, 24)
            .padding(.bottom, 44)
        }
    }
}

private struct SkillCard: View {
    let icon: String
    let title: String
    let description: String
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 16) {
                Text(icon)
                    .font(.system(size: 30))
                    .frame(width: 54, height: 54)
                    .background(Color.dkCardBright)
                    .clipShape(RoundedRectangle(cornerRadius: 14))

                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.system(size: 17, weight: .bold))
                        .foregroundColor(.dkTextPrimary)
                    Text(description)
                        .font(.system(size: 13))
                        .foregroundColor(.dkTextSecondary)
                        .fixedSize(horizontal: false, vertical: true)
                }

                Spacer()

                ZStack {
                    Circle()
                        .stroke(isSelected ? Color.dkAccent : Color.dkBorder, lineWidth: 2)
                        .frame(width: 24, height: 24)
                    if isSelected {
                        Circle()
                            .fill(Color.dkAccent)
                            .frame(width: 13, height: 13)
                    }
                }
            }
            .padding(18)
            .background(isSelected ? Color.dkAccent.opacity(0.10) : Color.dkCard)
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .overlay {
                RoundedRectangle(cornerRadius: 16)
                    .stroke(isSelected ? Color.dkAccent.opacity(0.5) : Color.dkBorder, lineWidth: 1)
            }
        }
    }
}

// MARK: - 6. Value Prop Screens (4 screens)

struct ValuePropScreen: View {
    @EnvironmentObject var flow: OnboardingFlowViewModel
    let index: Int

    private struct PropData {
        let systemIcon: String
        let gradientColors: [Color]
        let tag: String
        let title: String
        let description: String
    }

    private let props: [PropData] = [
        PropData(
            systemIcon: "stethoscope",
            gradientColors: [Color.dkAccent, Color.dkAccentPurple],
            tag: "DIAGNOSTIC",
            title: "Find Your Real Gaps",
            description: "Start with a diagnostic that shows where you stand — so you don’t burn time on topics you’ve already mastered"
        ),
        PropData(
            systemIcon: "chart.bar.doc.horizontal",
            gradientColors: [Color(red: 0.20, green: 0.85, blue: 0.55), Color(red: 0.12, green: 0.65, blue: 0.85)],
            tag: "MISTAKE ANALYSIS",
            title: "Learn From Every Miss",
            description: "Mistake analysis surfaces patterns, not one-off wrong taps — so you fix the habit behind the error"
        ),
        PropData(
            systemIcon: "arrow.triangle.2.circlepath",
            gradientColors: [Color(red: 0.98, green: 0.76, blue: 0.18), Color(red: 0.98, green: 0.48, blue: 0.18)],
            tag: "RECOVERY LOOP",
            title: "Targeted Practice That Sticks",
            description: "A targeted recovery loop brings weak areas back on purpose — repeat until the gap actually closes"
        ),
        PropData(
            systemIcon: "gauge.with.dots.needle.67percent",
            gradientColors: [Color.dkAccentPurple, Color.dkAccent],
            tag: "READINESS",
            title: "Ready by Topic,\nNot Just a Score",
            description: "Readiness by topic shows where you’re exam-ready and where to push — no guessing from one headline number"
        )
    ]

    private var prop: PropData { props[min(index - 1, props.count - 1)] }
    private var isLast: Bool { index == 4 }

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            // Icon
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(colors: prop.gradientColors,
                                       startPoint: .topLeading, endPoint: .bottomTrailing)
                    )
                    .frame(width: 120, height: 120)
                    .blur(radius: 36)
                    .opacity(0.35)
                    .scaleEffect(1.4)

                ZStack {
                    Circle()
                        .fill(
                            LinearGradient(colors: prop.gradientColors,
                                           startPoint: .topLeading, endPoint: .bottomTrailing)
                        )
                        .frame(width: 96, height: 96)
                    Image(systemName: prop.systemIcon)
                        .font(.system(size: 40, weight: .semibold))
                        .foregroundColor(.white)
                }
            }
            .padding(.bottom, 36)

            Text(prop.tag)
                .font(.system(size: 11, weight: .black))
                .tracking(2.5)
                .foregroundColor(prop.gradientColors.first ?? .dkAccent)
                .padding(.bottom, 10)

            Text(prop.title)
                .font(.system(size: 32, weight: .black, design: .rounded))
                .foregroundColor(.dkTextPrimary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)
                .padding(.bottom, 16)

            Text(prop.description)
                .font(.system(size: 17))
                .foregroundColor(.dkTextSecondary)
                .multilineTextAlignment(.center)
                .lineSpacing(4)
                .padding(.horizontal, 36)

            Spacer()

            // Page dots
            HStack(spacing: 7) {
                ForEach(0..<4, id: \.self) { i in
                    Capsule()
                        .fill(i == index - 1 ? Color.dkAccent : Color.white.opacity(0.2))
                        .frame(width: i == index - 1 ? 26 : 8, height: 8)
                        .animation(.spring(response: 0.4, dampingFraction: 0.7), value: index)
                }
            }
            .padding(.bottom, 28)

            VStack(spacing: 10) {
                DKPrimaryButton(title: isLast ? "Continue" : "Next") {
                    flow.nextStep()
                }
                if !isLast {
                    Button("Skip intro") { flow.goToStep(.planGeneration) }
                        .font(.system(size: 14))
                        .foregroundColor(.dkTextSecondary)
                }
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 44)
        }
    }
}

// MARK: - 7. Plan Generation Screen

struct PlanGenerationScreen: View {
    @EnvironmentObject var flow: OnboardingFlowViewModel
    @State private var completedSteps: Set<Int> = []
    @State private var activeStep: Int = 0

    private let steps = [
        "Analyzing your exam",
        "Calibrating your diagnostic baseline",
        "Mapping mistakes to topics",
        "Building your targeted recovery loop"
    ]

    private var progressFraction: CGFloat {
        CGFloat(completedSteps.count) / CGFloat(steps.count)
    }

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            ZStack {
                Circle()
                    .fill(DKGradient.accent)
                    .frame(width: 90, height: 90)
                    .blur(radius: 30)
                    .opacity(0.3)
                    .scaleEffect(1.4)

                Circle()
                    .trim(from: 0, to: progressFraction)
                    .stroke(DKGradient.accent, style: StrokeStyle(lineWidth: 5, lineCap: .round))
                    .frame(width: 72, height: 72)
                    .rotationEffect(.degrees(-90))
                    .animation(.easeInOut(duration: 0.5), value: completedSteps.count)

                if completedSteps.count == steps.count {
                    Image(systemName: "checkmark")
                        .font(.system(size: 26, weight: .bold))
                        .foregroundStyle(DKGradient.accent)
                } else {
                    Text("\(completedSteps.count + 1)/\(steps.count)")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.dkTextPrimary)
                }
            }
            .padding(.bottom, 36)

            Text("Building your exam plan…")
                .font(.system(size: 26, weight: .black, design: .rounded))
                .foregroundColor(.dkTextPrimary)
                .padding(.bottom, 6)

            Text("Diagnostic → mistake analysis → recovery → readiness by topic")
                .font(.system(size: 14))
                .foregroundColor(.dkTextSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 24)
                .padding(.bottom, 40)

            VStack(spacing: 14) {
                ForEach(Array(steps.enumerated()), id: \.offset) { i, step in
                    PlanStepRow(
                        label: step,
                        isDone: completedSteps.contains(i),
                        isActive: activeStep == i && !completedSteps.contains(i)
                    )
                }
            }
            .padding(.horizontal, 36)

            Spacer()
        }
        .onAppear { runAnimation() }
    }

    private func runAnimation() {
        for i in 0..<steps.count {
            DispatchQueue.main.asyncAfter(deadline: .now() + Double(i) * 0.85 + 0.3) {
                withAnimation(.spring(response: 0.4)) {
                    completedSteps.insert(i)
                    if i + 1 < steps.count { activeStep = i + 1 }
                }
            }
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + Double(steps.count) * 0.85 + 0.9) {
            flow.nextStep()
        }
    }
}

private struct PlanStepRow: View {
    let label: String
    let isDone: Bool
    let isActive: Bool

    var body: some View {
        HStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(isDone ? Color.dkSuccess : (isActive ? Color.dkAccent.opacity(0.18) : Color.dkCard))
                    .frame(width: 30, height: 30)
                if isDone {
                    Image(systemName: "checkmark")
                        .font(.system(size: 12, weight: .bold))
                        .foregroundColor(.white)
                } else if isActive {
                    Circle()
                        .fill(Color.dkAccent)
                        .frame(width: 11, height: 11)
                }
            }
            .animation(.spring(response: 0.35), value: isDone)

            Text(label)
                .font(.system(size: 15, weight: isDone || isActive ? .semibold : .regular))
                .foregroundColor(isDone || isActive ? .dkTextPrimary : .dkTextSecondary)

            Spacer()
        }
    }
}

// MARK: - 8. Sample Content Screen

private enum SampleStage { case question, explanation, hyperNote }
private enum AnswerChoiceState { case normal, correct, wrong, dimmed }

struct SampleContentScreen: View {
    @EnvironmentObject var flow: OnboardingFlowViewModel
    @State private var stage: SampleStage = .question
    @State private var selectedAnswer: String? = nil
    @State private var showResult = false

    private let question   = "If 3x + 9 = 24, what is the value of x?"
    private let choices    = ["A)  3", "B)  5", "C)  7", "D)  9"]
    private let correct    = "B)  5"

    var body: some View {
        VStack(spacing: 0) {
            // Step header
            VStack(spacing: 10) {
                Text("SAMPLE EXPERIENCE")
                    .font(.system(size: 11, weight: .black))
                    .tracking(2.5)
                    .foregroundColor(.dkAccent)

                HStack(spacing: 7) {
                    ForEach(0..<3, id: \.self) { i in
                        let active = (i == 0 && stage == .question) ||
                                     (i == 1 && stage == .explanation) ||
                                     (i == 2 && stage == .hyperNote)
                        Capsule()
                            .fill(active ? Color.dkAccent : Color.white.opacity(0.18))
                            .frame(height: 4)
                    }
                }
                .padding(.horizontal, 48)
            }
            .padding(.top, 56)
            .padding(.bottom, 20)

            switch stage {
            case .question:    questionView
            case .explanation: explanationView
            case .hyperNote:   hyperNoteView
            }
        }
        .animation(.easeInOut(duration: 0.3), value: stage)
    }

    // MARK: Question
    private var questionView: some View {
        VStack(spacing: 0) {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("Question 1 of 1")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(.dkTextSecondary)
                            Spacer()
                            Text("Mathematics")
                                .font(.system(size: 12, weight: .semibold))
                                .foregroundColor(.dkAccent)
                                .padding(.horizontal, 8).padding(.vertical, 4)
                                .background(Color.dkAccent.opacity(0.14))
                                .clipShape(RoundedRectangle(cornerRadius: 6))
                        }
                        Text(question)
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundColor(.dkTextPrimary)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                    .padding(18)
                    .background(Color.dkCard)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.dkBorder, lineWidth: 1))

                    VStack(spacing: 10) {
                        ForEach(choices, id: \.self) { choice in
                            AnswerChoiceButton(
                                label: choice,
                                state: answerState(for: choice)
                            ) {
                                guard selectedAnswer == nil else { return }
                                withAnimation(.easeInOut(duration: 0.2)) {
                                    selectedAnswer = choice
                                    showResult = true
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 16)
            }

            if showResult {
                VStack(spacing: 12) {
                    HStack(spacing: 10) {
                        Image(systemName: selectedAnswer == correct ? "checkmark.circle.fill" : "xmark.circle.fill")
                            .foregroundColor(selectedAnswer == correct ? .dkSuccess : .red)
                            .font(.title3)
                        Text(selectedAnswer == correct ? "Correct! Well done." : "The correct answer is B) 5")
                            .font(.system(size: 15, weight: .semibold))
                            .foregroundColor(.dkTextPrimary)
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity)
                    .background(Color.dkCard)
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                    .overlay(RoundedRectangle(cornerRadius: 12).stroke(Color.dkBorder, lineWidth: 1))

                    DKPrimaryButton(title: "See Explanation") {
                        withAnimation { stage = .explanation }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 32)
                .transition(.move(edge: .bottom).combined(with: .opacity))
            }
        }
    }

    private func answerState(for choice: String) -> AnswerChoiceState {
        guard let sel = selectedAnswer else { return .normal }
        if choice == correct { return .correct }
        if choice == sel     { return .wrong }
        return .dimmed
    }

    // MARK: Explanation
    private var explanationView: some View {
        VStack(spacing: 0) {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    VStack(alignment: .leading, spacing: 16) {
                        HStack(spacing: 8) {
                            Image(systemName: "checkmark.circle.fill")
                                .foregroundColor(.dkSuccess)
                            Text("Correct Answer: B) 5")
                                .font(.system(size: 15, weight: .bold))
                                .foregroundColor(.dkSuccess)
                        }
                        Divider().background(Color.dkBorder)
                        Text("STEP-BY-STEP")
                            .font(.system(size: 11, weight: .black))
                            .tracking(2)
                            .foregroundColor(.dkTextSecondary)

                        VStack(alignment: .leading, spacing: 12) {
                            expStep("1", "Start with the equation: 3x + 9 = 24")
                            expStep("2", "Subtract 9 from both sides: 3x = 15")
                            expStep("3", "Divide both sides by 3: x = 5")
                            expStep("✓", "Verify: 3(5) + 9 = 15 + 9 = 24 ✓")
                        }
                    }
                    .padding(20)
                    .background(Color.dkCard)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(Color.dkBorder, lineWidth: 1))
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 16)
            }
            Spacer()
            DKPrimaryButton(title: "See Hyper Note") {
                withAnimation { stage = .hyperNote }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 32)
        }
    }

    private func expStep(_ num: String, _ text: String) -> some View {
        HStack(alignment: .top, spacing: 12) {
            Text(num)
                .font(.system(size: 11, weight: .bold))
                .foregroundColor(.dkAccent)
                .frame(width: 26, height: 26)
                .background(Color.dkAccent.opacity(0.14))
                .clipShape(RoundedRectangle(cornerRadius: 7))
            Text(text)
                .font(.system(size: 15))
                .foregroundColor(.dkTextPrimary)
                .fixedSize(horizontal: false, vertical: true)
        }
    }

    // MARK: Hyper Note
    private var hyperNoteView: some View {
        VStack(spacing: 0) {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    VStack(alignment: .leading, spacing: 16) {
                        HStack(spacing: 8) {
                            Image(systemName: "bolt.fill")
                                .foregroundColor(.dkAccentGold)
                            Text("HYPER NOTE")
                                .font(.system(size: 11, weight: .black))
                                .tracking(2.5)
                                .foregroundColor(.dkAccentGold)
                        }
                        Text("Key Concept: Linear Equations")
                            .font(.system(size: 17, weight: .bold))
                            .foregroundColor(.dkTextPrimary)
                        Text("Isolate the variable by performing the same inverse operation on both sides. What you do to one side, you must do to the other.")
                            .font(.system(size: 15))
                            .foregroundColor(.dkTextSecondary)
                            .lineSpacing(4)

                        Divider().background(Color.dkBorder)

                        HStack(alignment: .top, spacing: 10) {
                            Image(systemName: "memorychip")
                                .foregroundColor(.dkSuccess)
                                .font(.system(size: 16))
                            Text("Memory tip: Think of an equation like a seesaw — it must stay balanced at all times.")
                                .font(.system(size: 13))
                                .foregroundColor(.dkTextSecondary)
                                .lineSpacing(3)
                                .fixedSize(horizontal: false, vertical: true)
                        }
                    }
                    .padding(20)
                    .background(
                        LinearGradient(
                            colors: [Color.dkAccentGold.opacity(0.07), Color.dkCard],
                            startPoint: .topLeading, endPoint: .bottomTrailing
                        )
                    )
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Color.dkAccentGold.opacity(0.28), lineWidth: 1)
                    )

                    Text("This is how you learn faster with DrKard")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.dkTextSecondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 16)
            }
            Spacer()
            DKPrimaryButton(title: "Continue") { flow.nextStep() }
                .padding(.horizontal, 20)
                .padding(.bottom, 32)
        }
    }
}

private struct AnswerChoiceButton: View {
    let label: String
    let state: AnswerChoiceState
    let onTap: () -> Void

    private var bgColor: Color {
        switch state {
        case .normal:  return .dkCard
        case .correct: return Color.dkSuccess.opacity(0.14)
        case .wrong:   return Color.red.opacity(0.14)
        case .dimmed:  return Color.dkCard.opacity(0.45)
        }
    }
    private var borderColor: Color {
        switch state {
        case .normal:  return .dkBorder
        case .correct: return Color.dkSuccess.opacity(0.6)
        case .wrong:   return Color.red.opacity(0.55)
        case .dimmed:  return Color.dkBorder.opacity(0.3)
        }
    }
    private var textColor: Color {
        switch state {
        case .normal:  return .dkTextPrimary
        case .correct: return .dkSuccess
        case .wrong:   return .red
        case .dimmed:  return Color.dkTextSecondary.opacity(0.45)
        }
    }

    var body: some View {
        Button(action: onTap) {
            HStack {
                Text(label)
                    .font(.system(size: 16, weight: (state == .correct || state == .wrong) ? .semibold : .regular))
                    .foregroundColor(textColor)
                Spacer()
                switch state {
                case .correct: Image(systemName: "checkmark.circle.fill").foregroundColor(.dkSuccess)
                case .wrong:   Image(systemName: "xmark.circle.fill").foregroundColor(.red)
                default: EmptyView()
                }
            }
            .padding(16)
            .background(bgColor)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(RoundedRectangle(cornerRadius: 12).stroke(borderColor, lineWidth: 1))
        }
        .disabled(state != .normal)
        .animation(.easeInOut(duration: 0.18), value: state)
    }
}

// MARK: - 9. Signup Screen

struct SignupScreen: View {
    @EnvironmentObject var flow: OnboardingFlowViewModel
    @EnvironmentObject var auth: AuthSessionManager
    @State private var name = ""
    @State private var email = ""
    @FocusState private var focused: SignupField?

    private enum SignupField { case name, email }

    private var isValid: Bool {
        !name.trimmingCharacters(in: .whitespaces).isEmpty &&
        email.contains("@") && email.contains(".")
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                VStack(spacing: 10) {
                    ZStack {
                        Circle()
                            .fill(DKGradient.accent)
                            .frame(width: 60, height: 60)
                            .blur(radius: 18)
                            .opacity(0.4)
                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 52))
                            .foregroundStyle(DKGradient.accent)
                    }
                    .padding(.bottom, 4)

                    Text("Save your study plan")
                        .font(.system(size: 28, weight: .black, design: .rounded))
                        .foregroundColor(.dkTextPrimary)

                    Text("Create a free account to keep\nyour personalized plan")
                        .font(.system(size: 15))
                        .foregroundColor(.dkTextSecondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 56)
                .padding(.bottom, 36)

                VStack(spacing: 14) {
                    DKInputField(
                        label: "Your name",
                        placeholder: "e.g. Alex Johnson",
                        text: $name,
                        isFocused: focused == .name
                    )
                    .focused($focused, equals: .name)

                    DKInputField(
                        label: "Email address",
                        placeholder: "e.g. alex@email.com",
                        text: $email,
                        keyboard: .emailAddress,
                        isFocused: focused == .email
                    )
                    .focused($focused, equals: .email)
                }
                .padding(.horizontal, 24)

                HStack {
                    Rectangle().fill(Color.dkBorder).frame(height: 1)
                    Text("or").font(.system(size: 13)).foregroundColor(.dkTextSecondary).padding(.horizontal, 12)
                    Rectangle().fill(Color.dkBorder).frame(height: 1)
                }
                .padding(.horizontal, 24)
                .padding(.vertical, 20)

                SignInWithAppleButton(.continue) { request in
                    auth.configureAppleRequest(request)
                } onCompletion: { result in
                    auth.handleAppleResult(result)
                    if auth.isSignedIn {
                        flow.signedUp = true
                        flow.nextStep()
                    }
                }
                .signInWithAppleButtonStyle(.white)
                .frame(height: 54)
                .clipShape(RoundedRectangle(cornerRadius: 14))
                .padding(.horizontal, 24)
                .padding(.bottom, 14)

                if let errorMessage = auth.errorMessage {
                    Text(errorMessage)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.red.opacity(0.9))
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 24)
                        .padding(.bottom, 10)
                }

                VStack(spacing: 10) {
                    DKPrimaryButton(title: "Create Account", action: {
                        flow.userName = name
                        flow.userEmail = email
                        flow.signedUp = true
                        flow.nextStep()
                    }, isEnabled: isValid)

                    Text("By continuing you agree to our Terms & Privacy Policy")
                        .font(.system(size: 12))
                        .foregroundColor(.dkTextSecondary)
                        .multilineTextAlignment(.center)
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 44)
            }
        }
    }
}

// MARK: - 10. Paywall Screen

struct PaywallScreen: View {
    @EnvironmentObject var flow: OnboardingFlowViewModel
    @EnvironmentObject var subscriptionStore: SubscriptionStore
    @State private var selectedProductID = SubscriptionStore.productIDs.first ?? ""
    @State private var showingSubscriptionManagement = false

    private let features: [(icon: String, label: String)] = [
        ("stethoscope",                      "Diagnostic assessments that surface true gaps"),
        ("chart.bar.doc.horizontal",         "Mistake analysis — patterns, not random misses"),
        ("arrow.triangle.2.circlepath",      "Targeted recovery loop until weak areas stick"),
        ("gauge.with.dots.needle.67percent", "Readiness by topic — know where you stand"),
        ("doc.text.fill",                    "Full mocks, review, and Hyper Notes in one system")
    ]

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 0) {
                // Crown + title
                VStack(spacing: 14) {
                    ZStack {
                        Circle()
                            .fill(DKGradient.gold)
                            .frame(width: 80, height: 80)
                            .blur(radius: 28)
                            .opacity(0.4)
                        Image(systemName: "crown.fill")
                            .font(.system(size: 48))
                            .foregroundStyle(DKGradient.gold)
                    }
                    Text("Unlock Your Full\nPrep System")
                        .font(.system(size: 30, weight: .black, design: .rounded))
                        .foregroundColor(.dkTextPrimary)
                        .multilineTextAlignment(.center)

                    HStack(spacing: 4) {
                        ForEach(0..<5, id: \.self) { _ in
                            Image(systemName: "star.fill")
                                .font(.system(size: 12))
                                .foregroundColor(.dkAccentGold)
                        }
                        Text("Most students improve in the first 3 sessions")
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.dkTextSecondary)
                    }
                }
                .padding(.top, 48)
                .padding(.bottom, 28)

                // Features list
                VStack(spacing: 0) {
                    ForEach(Array(features.enumerated()), id: \.offset) { i, feat in
                        HStack(spacing: 14) {
                            ZStack {
                                Circle()
                                    .fill(Color.dkAccent.opacity(0.14))
                                    .frame(width: 38, height: 38)
                                Image(systemName: feat.icon)
                                    .font(.system(size: 15, weight: .semibold))
                                    .foregroundColor(.dkAccent)
                            }
                            Text(feat.label)
                                .font(.system(size: 15, weight: .medium))
                                .foregroundColor(.dkTextPrimary)
                            Spacer()
                            Image(systemName: "checkmark")
                                .font(.system(size: 12, weight: .bold))
                                .foregroundColor(.dkSuccess)
                        }
                        .padding(.vertical, 14)
                        .padding(.horizontal, 18)

                        if i < features.count - 1 {
                            Divider().background(Color.dkBorder).padding(.horizontal, 18)
                        }
                    }
                }
                .background(Color.dkCard)
                .clipShape(RoundedRectangle(cornerRadius: 18))
                .overlay(RoundedRectangle(cornerRadius: 18).stroke(Color.dkBorder, lineWidth: 1))
                .padding(.horizontal, 20)

                VStack(spacing: 10) {
                    ForEach(planRows, id: \.id) { row in
                        Button {
                            selectedProductID = row.id
                        } label: {
                            HStack(spacing: 12) {
                                Image(systemName: selectedProductID == row.id ? "checkmark.circle.fill" : "circle")
                                    .font(.system(size: 18, weight: .bold))
                                    .foregroundColor(selectedProductID == row.id ? .dkAccent : .dkTextSecondary)
                                VStack(alignment: .leading, spacing: 3) {
                                    Text(row.title)
                                        .font(.system(size: 15, weight: .bold))
                                        .foregroundColor(.dkTextPrimary)
                                    Text(row.price)
                                        .font(.system(size: 13, weight: .medium))
                                        .foregroundColor(.dkTextSecondary)
                                }
                                Spacer()
                                if row.badge != nil {
                                    Text(row.badge ?? "")
                                        .font(.system(size: 11, weight: .bold))
                                        .foregroundColor(.dkAccent)
                                }
                            }
                            .padding(16)
                            .background(Color.dkCard)
                            .clipShape(RoundedRectangle(cornerRadius: 16))
                            .overlay(
                                RoundedRectangle(cornerRadius: 16)
                                    .stroke(selectedProductID == row.id ? Color.dkAccent : Color.dkBorder, lineWidth: 1)
                            )
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)

                VStack(spacing: 10) {
                    DKPrimaryButton(title: "Start Free Trial", action: {
                        Task {
                            if subscriptionStore.products.isEmpty {
                                await subscriptionStore.loadProducts()
                            }
                            guard let product = selectedProduct else {
                                subscriptionStore.purchaseError = "This subscription is not available yet."
                                return
                            }
                            if await subscriptionStore.purchase(product) {
                                flow.startedFreeTrial = true
                                flow.nextStep()
                            }
                        }
                    }, isEnabled: !subscriptionStore.isPurchasing)
                    DKSecondaryButton(title: "Continue with limited access") {
                        flow.nextStep()
                    }
                    Button("Restore Purchases") {
                        Task {
                            await subscriptionStore.restorePurchases()
                            if subscriptionStore.isPro {
                                flow.nextStep()
                            }
                        }
                    }
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.dkTextSecondary)

                    Button("Manage Subscriptions") {
                        showingSubscriptionManagement = true
                    }
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.dkTextSecondary)

                    if subscriptionStore.isLoadingProducts || subscriptionStore.isPurchasing {
                        ProgressView()
                            .tint(.dkAccent)
                    }

                    if let purchaseError = subscriptionStore.purchaseError {
                        Text(purchaseError)
                            .font(.system(size: 12, weight: .medium))
                            .foregroundColor(.red.opacity(0.9))
                            .multilineTextAlignment(.center)
                    }
                }
                .padding(.horizontal, 24)
                .padding(.top, 20)
                .padding(.bottom, 44)
            }
        }
        .task {
            await subscriptionStore.loadProducts()
        }
        .manageSubscriptionsSheet(isPresented: $showingSubscriptionManagement)
    }

    private var selectedProduct: Product? {
        subscriptionStore.products.first(where: { $0.id == selectedProductID })
    }

    private var planRows: [(id: String, title: String, price: String, badge: String?)] {
        let fallback = [
            ("drkard.pro.monthly", "Monthly Pro", "$9.99 / month", nil as String?),
            ("drkard.pro.yearly", "Yearly Pro", "$79.99 / year", "Best value")
        ]

        return fallback.map { row in
            let product = subscriptionStore.products.first(where: { $0.id == row.0 })
            return (row.0, product?.displayName.isEmpty == false ? product?.displayName ?? row.1 : row.1, product?.displayPrice ?? row.2, row.3)
        }
    }
}

// MARK: - Preview

#Preview {
    OnboardingFlowView()
}
