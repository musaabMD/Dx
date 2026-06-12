import SwiftUI
import Combine
import ClerkKit
import ClerkKitUI

// MARK: - Design System

private extension Color {
    static let brand = Color(red: 0.22, green: 0.86, blue: 0.52)
    static let brandDim = Color(red: 0.22, green: 0.86, blue: 0.52).opacity(0.18)

    static let bgBase = Color(UIColor { t in
        t.userInterfaceStyle == .dark
        ? UIColor(red: 0.07, green: 0.07, blue: 0.12, alpha: 1)
        : UIColor(red: 0.96, green: 0.97, blue: 0.98, alpha: 1)
    })
    static let bgMid = Color(UIColor { t in
        t.userInterfaceStyle == .dark
        ? UIColor(red: 0.10, green: 0.10, blue: 0.18, alpha: 1)
        : UIColor(red: 0.92, green: 0.94, blue: 0.96, alpha: 1)
    })
    static let bgCard = Color(UIColor { t in
        t.userInterfaceStyle == .dark
        ? UIColor(red: 0.13, green: 0.13, blue: 0.22, alpha: 1)
        : UIColor(white: 1.0, alpha: 1)
    })
    static let cardBorder = Color(UIColor { t in
        t.userInterfaceStyle == .dark
        ? UIColor(white: 1, alpha: 0.10)
        : UIColor(white: 0, alpha: 0.08)
    })
    static let labelPrimary = Color(UIColor { t in
        t.userInterfaceStyle == .dark ? .white : .black
    })
    static let labelSecondary = Color(UIColor { t in
        t.userInterfaceStyle == .dark
        ? UIColor(white: 1, alpha: 0.60)
        : UIColor(white: 0, alpha: 0.60)
    })
    static let labelTertiary = Color(UIColor { t in
        t.userInterfaceStyle == .dark
        ? UIColor(white: 1, alpha: 0.38)
        : UIColor(white: 0, alpha: 0.38)
    })
    static let proteinColor = Color(red: 0.38, green: 0.65, blue: 1.0)
    static let carbColor    = Color(red: 1.0, green: 0.80, blue: 0.28)
    static let fatColor     = Color(red: 1.0, green: 0.55, blue: 0.28)

    // Adaptive subtle fills
    static let surfaceSubtle = Color(UIColor { t in
        t.userInterfaceStyle == .dark
        ? UIColor(white: 1, alpha: 0.06)
        : UIColor(white: 0, alpha: 0.05)
    })
    static let ringTrack = Color(UIColor { t in
        t.userInterfaceStyle == .dark
        ? UIColor(white: 1, alpha: 0.08)
        : UIColor(white: 0, alpha: 0.08)
    })
    static let ingredientFill = Color(UIColor { t in
        t.userInterfaceStyle == .dark
        ? UIColor(white: 1, alpha: 0.045)
        : UIColor(white: 0, alpha: 0.04)
    })
    static let stepFill = Color(UIColor { t in
        t.userInterfaceStyle == .dark
        ? UIColor(white: 1, alpha: 0.035)
        : UIColor(white: 0, alpha: 0.03)
    })
    static let progressTrack = Color(UIColor { t in
        t.userInterfaceStyle == .dark
        ? UIColor(white: 1, alpha: 0.12)
        : UIColor(white: 0, alpha: 0.10)
    })
}

private struct AppBackground: View {
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        Group {
            if colorScheme == .dark {
                LinearGradient(
                    colors: [.bgBase, .bgMid, Color(red: 0.09, green: 0.09, blue: 0.18)],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            } else {
                LinearGradient(
                    colors: [
                        Color(red: 0.94, green: 0.96, blue: 0.99),
                        Color(red: 0.97, green: 0.97, blue: 0.99),
                        Color(red: 0.92, green: 0.94, blue: 0.97)
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            }
        }
        .ignoresSafeArea()
    }
}

private extension View {
    func glassCard(padding: CGFloat = 16) -> some View {
        self
            .padding(padding)
            .background(Color.bgCard)
            .overlay(
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .stroke(Color.cardBorder, lineWidth: 1)
            )
            .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
    }

    func appNavBar() -> some View {
        self
            .toolbarBackground(.hidden, for: .navigationBar)
    }

    func screenBackground() -> some View {
        self.background(Color.bgBase.ignoresSafeArea())
    }
}

// MARK: - Root

struct ContentView: View {
    @StateObject private var viewModel = AppViewModel()

    var body: some View {
        Group {
            if !AppDeployment.isClerkEnabled {
                appFlow
            } else {
                ClerkAwareContent(viewModel: viewModel)
            }
        }
    }

    private var appFlow: some View {
        ZStack {
            AppBackground()
            if viewModel.flowStage == .mainApp {
                MainTabView(viewModel: viewModel)
            } else {
                LaunchFlowView(viewModel: viewModel)
            }
        }
    }
}

private struct ClerkAwareContent: View {
    @ObservedObject var viewModel: AppViewModel
    @Environment(Clerk.self) private var clerk

    var body: some View {
        if clerk.user == nil {
            AuthGateView()
        } else {
            ZStack {
                AppBackground()
                if viewModel.flowStage == .mainApp {
                    MainTabView(viewModel: viewModel)
                } else {
                    LaunchFlowView(viewModel: viewModel)
                }
            }
        }
    }
}

struct AuthGateView: View {
    @State private var authPresented = false

    var body: some View {
        ZStack {
            AppBackground()
            VStack(spacing: 18) {
                Image(systemName: "lock.shield.fill")
                    .font(.system(size: 42, weight: .bold))
                    .foregroundStyle(Color.brand)
                Text("Sign in to continue")
                    .font(.title2.bold())
                    .foregroundStyle(Color.labelPrimary)
                Text("Create your private meal history and keep your nutrition data synced.")
                    .font(.subheadline)
                    .foregroundStyle(Color.labelSecondary)
                    .multilineTextAlignment(.center)
                Button("Sign in with Clerk") {
                    authPresented = true
                }
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(Color.brand)
                .foregroundStyle(Color(red: 0.05, green: 0.20, blue: 0.10))
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            }
            .padding(24)
            .glassCard()
            .padding(.horizontal, 20)
        }
        .sheet(isPresented: $authPresented) {
            AuthView()
        }
    }
}

// MARK: - Launch Flow

struct LaunchFlowView: View {
    @ObservedObject var viewModel: AppViewModel

    var body: some View {
        Group {
            switch viewModel.flowStage {
            case .splash:     SplashView(viewModel: viewModel)
            case .onboarding: OnboardingView(viewModel: viewModel)
            case .goalSetup:  GoalSetupView(viewModel: viewModel)
            case .paywall:    PaywallView(viewModel: viewModel)
            case .mainApp:    EmptyView()
            }
        }
        .transition(.opacity.animation(.easeInOut(duration: 0.3)))
    }
}

// MARK: - Splash

struct SplashView: View {
    @ObservedObject var viewModel: AppViewModel
    @State private var appeared = false

    var body: some View {
        VStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(Color.brandDim)
                    .frame(width: 96, height: 96)
                Image(systemName: "leaf.fill")
                    .font(.system(size: 40, weight: .semibold))
                    .foregroundStyle(Color.brand)
            }
            .scaleEffect(appeared ? 1.0 : 0.7)
            .opacity(appeared ? 1 : 0)

            VStack(spacing: 6) {
                Text(viewModel.appBrand)
                    .font(.system(size: 38, weight: .black, design: .rounded))
                    .foregroundStyle(Color.labelPrimary)
                Text("Eat smarter. Automatically.")
                    .font(.subheadline)
                    .foregroundStyle(Color.labelSecondary)
            }
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 12)
        }
        .animation(.spring(response: 0.6, dampingFraction: 0.75), value: appeared)
        .onAppear { appeared = true }
        .task {
            try? await Task.sleep(for: .seconds(1.8))
            viewModel.advanceFromSplash()
        }
    }
}

// MARK: - Onboarding

struct OnboardingView: View {
    @ObservedObject var viewModel: AppViewModel
    @State private var appeared = false

    var body: some View {
        VStack(spacing: 0) {
            Spacer()

            VStack(spacing: 28) {
                ZStack {
                    Circle()
                        .fill(Color.brandDim)
                        .frame(width: 100, height: 100)
                    Image(systemName: viewModel.onboardingPage.icon)
                        .font(.system(size: 40, weight: .semibold))
                        .foregroundStyle(Color.brand)
                }

                VStack(spacing: 12) {
                    Text(viewModel.onboardingPage.title)
                        .font(.title.bold())
                        .foregroundStyle(Color.labelPrimary)
                        .multilineTextAlignment(.center)
                    Text(viewModel.onboardingPage.subtitle)
                        .font(.body)
                        .foregroundStyle(Color.labelSecondary)
                        .multilineTextAlignment(.center)
                        .padding(.horizontal, 32)
                }
            }
            .id(viewModel.onboardingIndex)
            .transition(.asymmetric(
                insertion: .move(edge: .trailing).combined(with: .opacity),
                removal: .move(edge: .leading).combined(with: .opacity)
            ))
            .animation(.easeInOut(duration: 0.28), value: viewModel.onboardingIndex)

            Spacer()

            HStack(spacing: 7) {
                ForEach(0..<viewModel.onboardingPages.count, id: \.self) { idx in
                    Capsule()
                        .fill(idx == viewModel.onboardingIndex ? Color.brand : Color.labelTertiary)
                        .frame(width: idx == viewModel.onboardingIndex ? 24 : 8, height: 8)
                }
            }
            .animation(.spring(response: 0.35), value: viewModel.onboardingIndex)
            .padding(.bottom, 32)

            VStack(spacing: 12) {
                Button {
                    viewModel.nextOnboardingStep()
                } label: {
                    Text(viewModel.onboardingIndex == viewModel.onboardingPages.count - 1 ? "Start your journey" : "Continue")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.brand)
                        .foregroundStyle(Color(red: 0.05, green: 0.20, blue: 0.10))
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }

                Button("Skip") {
                    viewModel.skipOnboarding()
                }
                .font(.subheadline)
                .foregroundStyle(Color.labelSecondary)
            }
            .padding(.horizontal, 24)
            .padding(.bottom, 36)
        }
    }
}

// MARK: - Goal Setup

enum GoalSetupStep: CaseIterable, Hashable {
    case primaryGoal, dietPreference, bodyStats

    var index: Int {
        GoalSetupStep.allCases.firstIndex(of: self) ?? 0
    }
}

struct GoalSetupView: View {
    @ObservedObject var viewModel: AppViewModel

    var body: some View {
        ZStack {
            AppBackground()
            VStack(spacing: 0) {
                GoalSetupHeader(step: viewModel.goalSetupStep)

                ZStack {
                    switch viewModel.goalSetupStep {
                    case .primaryGoal:
                        GoalStepPrimaryGoal(viewModel: viewModel)
                            .transition(.asymmetric(
                                insertion: .move(edge: .trailing).combined(with: .opacity),
                                removal: .move(edge: .leading).combined(with: .opacity)
                            ))
                    case .dietPreference:
                        GoalStepDietPreference(viewModel: viewModel)
                            .transition(.asymmetric(
                                insertion: .move(edge: .trailing).combined(with: .opacity),
                                removal: .move(edge: .leading).combined(with: .opacity)
                            ))
                    case .bodyStats:
                        GoalStepBodyStats(viewModel: viewModel)
                            .transition(.asymmetric(
                                insertion: .move(edge: .trailing).combined(with: .opacity),
                                removal: .move(edge: .leading).combined(with: .opacity)
                            ))
                    }
                }
                .animation(.easeInOut(duration: 0.3), value: viewModel.goalSetupStep)
            }
        }
    }
}

private struct GoalSetupHeader: View {
    let step: GoalSetupStep

    private let totalSteps = GoalSetupStep.allCases.count

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            HStack {
                Text("Setup Goals")
                    .font(.system(size: 34, weight: .black, design: .rounded))
                    .foregroundStyle(Color.labelPrimary)
                Spacer()
                Text("\(step.index + 1) of \(totalSteps)")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(Color.labelSecondary)
            }

            HStack(spacing: 6) {
                ForEach(GoalSetupStep.allCases, id: \.self) { s in
                    Capsule()
                        .fill(s.index <= step.index ? Color.brand : Color.progressTrack)
                        .frame(height: 4)
                        .animation(.spring(response: 0.4), value: step)
                }
            }
        }
        .padding(.horizontal, 20)
        .padding(.top, 60)
        .padding(.bottom, 8)
    }
}

private struct GoalStepPrimaryGoal: View {
    @ObservedObject var viewModel: AppViewModel

    var body: some View {
        VStack(spacing: 0) {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 24) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("What's your primary goal?")
                            .font(.title2.bold())
                            .foregroundStyle(Color.labelPrimary)
                        Text("We'll personalise your meal plan around this.")
                            .font(.subheadline)
                            .foregroundStyle(Color.labelSecondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    SetupSectionCard(title: "Primary Goal") {
                        VStack(spacing: 10) {
                            ForEach(UserGoal.allCases) { goal in
                                GoalOptionRow(
                                    title: goal.title,
                                    icon: goal.icon,
                                    isSelected: viewModel.selectedGoal == goal
                                ) { viewModel.selectedGoal = goal }
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
                .padding(.bottom, 16)
            }

            GoalContinueButton(label: "Continue") {
                withAnimation { viewModel.advanceGoalStep() }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 36)
            .padding(.top, 8)
        }
    }
}

private struct GoalStepDietPreference: View {
    @ObservedObject var viewModel: AppViewModel

    var body: some View {
        VStack(spacing: 0) {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 24) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Your diet preference")
                            .font(.title2.bold())
                            .foregroundStyle(Color.labelPrimary)
                        Text("Choose the eating style that fits you best.")
                            .font(.subheadline)
                            .foregroundStyle(Color.labelSecondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    SetupSectionCard(title: "Diet Preference") {
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                            ForEach(DietType.allCases) { diet in
                                Button {
                                    viewModel.selectedDiet = diet
                                } label: {
                                    Text(diet.title)
                                        .font(.subheadline.weight(.medium))
                                        .frame(maxWidth: .infinity)
                                        .padding(.vertical, 12)
                                        .background(viewModel.selectedDiet == diet ? Color.brand : Color.bgCard)
                                        .foregroundStyle(viewModel.selectedDiet == diet ? Color(red: 0.05, green: 0.20, blue: 0.10) : Color.labelSecondary)
                                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                                .stroke(viewModel.selectedDiet == diet ? Color.brand : Color.cardBorder, lineWidth: 1)
                                        )
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
                .padding(.bottom, 16)
            }

            GoalContinueButton(label: "Continue") {
                withAnimation { viewModel.advanceGoalStep() }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 36)
            .padding(.top, 8)
        }
    }
}

private struct GoalStepBodyStats: View {
    @ObservedObject var viewModel: AppViewModel

    var body: some View {
        VStack(spacing: 0) {
            ScrollView(showsIndicators: false) {
                VStack(spacing: 24) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text("Body stats")
                            .font(.title2.bold())
                            .foregroundStyle(Color.labelPrimary)
                        Text("Optional — helps us fine-tune your calorie targets.")
                            .font(.subheadline)
                            .foregroundStyle(Color.labelSecondary)
                    }
                    .frame(maxWidth: .infinity, alignment: .leading)

                    SetupSectionCard(title: "Body Stats (Optional)") {
                        VStack(spacing: 12) {
                            InputField(label: "Weight (kg)", text: $viewModel.weightInput)
                            InputField(label: "Height (cm)", text: $viewModel.heightInput)
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.top, 20)
                .padding(.bottom, 16)
            }

            GoalContinueButton(label: "Finish") {
                viewModel.completeGoalSetup()
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 36)
            .padding(.top, 8)
        }
    }
}

private struct GoalContinueButton: View {
    let label: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text(label)
                .font(.headline)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 16)
                .background(Color.brand)
                .foregroundStyle(Color(red: 0.05, green: 0.20, blue: 0.10))
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        }
    }
}

private struct SetupSectionCard<Content: View>: View {
    let title: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(title)
                .font(.footnote.weight(.semibold))
                .foregroundStyle(Color.brand)
                .textCase(.uppercase)
                .tracking(0.8)
            content()
        }
        .glassCard()
    }
}

private struct GoalOptionRow: View {
    let title: String
    let icon: String
    let isSelected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                Image(systemName: icon)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundStyle(isSelected ? Color.brand : Color.labelSecondary)
                    .frame(width: 28)
                Text(title)
                    .font(.body.weight(.medium))
                    .foregroundStyle(Color.labelPrimary)
                Spacer()
                if isSelected {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(Color.brand)
                }
            }
            .padding(.vertical, 4)
        }
    }
}

private struct InputField: View {
    let label: String
    @Binding var text: String

    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text(label)
                .font(.caption)
                .foregroundStyle(Color.labelSecondary)
            TextField("", text: $text)
                .keyboardType(.decimalPad)
                .padding(.horizontal, 14)
                .padding(.vertical, 12)
                .background(Color.bgBase)
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(Color.cardBorder, lineWidth: 1)
                )
        }
    }
}

// MARK: - Paywall

struct PaywallView: View {
    @ObservedObject var viewModel: AppViewModel
    @State private var selectedPlan = 1

    private let plans: [(String, String, String)] = [
        ("Weekly", "€4.99", "/week"),
        ("Monthly", "€9.99", "/month"),
        ("Yearly", "€59.99", "/year"),
    ]

    var body: some View {
        VStack(spacing: 0) {
            VStack(spacing: 14) {
                ZStack {
                    Circle().fill(Color.brandDim).frame(width: 72, height: 72)
                    Image(systemName: "sparkles")
                        .font(.system(size: 28, weight: .semibold))
                        .foregroundStyle(Color.brand)
                }
                Text("Your personalized plan\nis ready")
                    .font(.title.bold())
                    .foregroundStyle(Color.labelPrimary)
                    .multilineTextAlignment(.center)
                Text("Unlock all features and smash your goals.")
                    .font(.subheadline)
                    .foregroundStyle(Color.labelSecondary)
                    .multilineTextAlignment(.center)
            }
            .padding(.top, 48)

            VStack(alignment: .leading, spacing: 12) {
                PaywallFeatureRow(icon: "camera.viewfinder", text: "Unlimited AI food scans")
                PaywallFeatureRow(icon: "chart.bar.fill", text: "Advanced macro & progress insights")
                PaywallFeatureRow(icon: "fork.knife", text: "Smarter personalised meal planning")
            }
            .padding(.vertical, 24)
            .padding(.horizontal, 20)
            .frame(maxWidth: .infinity, alignment: .leading)
            .glassCard()
            .padding(.horizontal, 20)
            .padding(.top, 28)

            Spacer()

            VStack(spacing: 10) {
                ForEach(plans.indices, id: \.self) { idx in
                    let plan = plans[idx]
                    Button {
                        selectedPlan = idx
                    } label: {
                        HStack {
                            VStack(alignment: .leading, spacing: 2) {
                                Text(plan.0)
                                    .font(.body.weight(.semibold))
                                    .foregroundStyle(Color.labelPrimary)
                                if idx == 2 {
                                    Text("Save 50%")
                                        .font(.caption.weight(.semibold))
                                        .foregroundStyle(Color.brand)
                                }
                            }
                            Spacer()
                            HStack(alignment: .lastTextBaseline, spacing: 2) {
                                Text(plan.1)
                                    .font(.body.weight(.bold))
                                    .foregroundStyle(Color.labelPrimary)
                                Text(plan.2)
                                    .font(.caption)
                                    .foregroundStyle(Color.labelSecondary)
                            }
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 14)
                        .background(selectedPlan == idx ? Color.brand.opacity(0.15) : Color.bgCard)
                        .overlay(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .stroke(selectedPlan == idx ? Color.brand : Color.cardBorder, lineWidth: selectedPlan == idx ? 1.5 : 1)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    }
                }
            }
            .padding(.horizontal, 20)

            VStack(spacing: 12) {
                Button {
                    viewModel.enterMainApp()
                } label: {
                    Text("Start 7-day free trial")
                        .font(.headline)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(Color.brand)
                        .foregroundStyle(Color(red: 0.05, green: 0.20, blue: 0.10))
                        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                }

                Button("Continue with free plan") {
                    viewModel.enterMainApp()
                }
                .font(.subheadline)
                .foregroundStyle(Color.labelSecondary)
            }
            .padding(.horizontal, 20)
            .padding(.top, 20)
            .padding(.bottom, 36)
        }
    }
}

private struct PaywallFeatureRow: View {
    let icon: String
    let text: String

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 15, weight: .semibold))
                .foregroundStyle(Color.brand)
                .frame(width: 24)
            Text(text)
                .font(.body)
                .foregroundStyle(Color.labelPrimary)
        }
    }
}

// MARK: - Main Tab

struct MainTabView: View {
    @ObservedObject var viewModel: AppViewModel

    var body: some View {
        TabView(selection: $viewModel.selectedTab) {
            NavigationStack {
                HomeView(viewModel: viewModel)
            }
            .tag(AppTab.home)
            .tabItem { Label("Today", systemImage: "house.fill") }

            NavigationStack {
                DiscoverView(viewModel: viewModel)
            }
            .tag(AppTab.discover)
            .tabItem { Label("Discover", systemImage: "safari.fill") }

            NavigationStack {
                AddMealView(viewModel: viewModel)
            }
            .tag(AppTab.add)
            .tabItem { Label("Add", systemImage: "plus.circle.fill") }

            NavigationStack {
                ProgressView(viewModel: viewModel)
            }
            .tag(AppTab.progress)
            .tabItem { Label("Progress", systemImage: "chart.line.uptrend.xyaxis") }

            NavigationStack {
                ProfileView(viewModel: viewModel)
            }
            .tag(AppTab.profile)
            .tabItem { Label("Profile", systemImage: "person.crop.circle") }
        }
        .tint(Color.brand)
        .background(Color.bgBase)
    }
}

// MARK: - Home

struct HomeView: View {
    @ObservedObject var viewModel: AppViewModel

    var body: some View {
        ZStack {
            AppBackground()
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 20) {
                    DailySummaryCard(viewModel: viewModel)

                    PrimaryButton(label: "Add Meal", icon: "plus.circle.fill") {
                        viewModel.selectedTab = .add
                    }

                    SectionWithItems(title: "Today's Meals") {
                        ForEach(viewModel.todayMeals.prefix(3)) { meal in
                            MealRow(meal: meal)
                        }
                    }

                    // Trending Now — horizontal featured scroll
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("🔥 Trending Now")
                                .font(.headline)
                                .foregroundStyle(Color.labelPrimary)
                            Spacer()
                            Button("See all") { viewModel.selectedTab = .discover }
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Color.brand)
                        }

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 12) {
                                ForEach(viewModel.trendingRecipes.prefix(6)) { recipe in
                                    NavigationLink {
                                        RecipeDetailView(viewModel: viewModel, recipe: recipe)
                                    } label: {
                                        FeaturedRecipeCard(recipe: recipe, onShare: { viewModel.share(recipe) })
                                            .frame(width: 230)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                            .padding(.horizontal, 16)
                        }
                        .padding(.horizontal, -16)
                    }

                    // Recommended — 2-col grid
                    VStack(alignment: .leading, spacing: 12) {
                        Text("✨ Recommended for You")
                            .font(.headline)
                            .foregroundStyle(Color.labelPrimary)
                        LazyVGrid(columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)], spacing: 12) {
                            ForEach(viewModel.recommendedRecipes.prefix(4)) { recipe in
                                NavigationLink {
                                    RecipeDetailView(viewModel: viewModel, recipe: recipe)
                                } label: {
                                    RecipeCard(recipe: recipe, onShare: { viewModel.share(recipe) })
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }

                    SectionWithItems(title: "Community Meals") {
                        ForEach(viewModel.communityMeals.prefix(3)) { item in
                            CommunityMealCard(item: item)
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 32)
            }
        }
        .navigationTitle(viewModel.appBrand)
        .navigationBarTitleDisplayMode(.large)
        .appNavBar()
        .screenBackground()
    }
}

private struct SectionWithItems<Content: View>: View {
    let title: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(title)
                .font(.headline)
                .foregroundStyle(Color.labelPrimary)
            content()
        }
    }
}

// MARK: - Daily Summary Card

struct DailySummaryCard: View {
    @ObservedObject var viewModel: AppViewModel

    var body: some View {
        VStack(spacing: 18) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("\(viewModel.caloriesLeft)")
                        .font(.system(size: 52, weight: .black, design: .rounded))
                        .foregroundStyle(Color.labelPrimary)
                    Text("kcal remaining")
                        .font(.subheadline)
                        .foregroundStyle(Color.labelSecondary)
                }
                Spacer()
                CalorieRing(progress: viewModel.progress, calories: viewModel.caloriesConsumed, target: viewModel.dayCaloriesTarget)
            }

            HStack(spacing: 0) {
                MacroStat(label: "Protein", value: "\(viewModel.proteinLeft)g", color: .proteinColor)
                Divider().background(Color.cardBorder).frame(height: 32)
                MacroStat(label: "Carbs", value: "\(viewModel.carbsLeft)g", color: .carbColor)
                Divider().background(Color.cardBorder).frame(height: 32)
                MacroStat(label: "Fat", value: "\(viewModel.fatLeft)g", color: .fatColor)
            }
        }
        .glassCard(padding: 20)
    }
}

private struct CalorieRing: View {
    let progress: CGFloat
    let calories: Int
    let target: Int

    var body: some View {
        ZStack {
            Circle()
                .stroke(Color.ringTrack, lineWidth: 12)
                .frame(width: 88, height: 88)
            Circle()
                .trim(from: 0, to: max(0.02, min(1, progress)))
                .stroke(
                    AngularGradient(
                        colors: [Color.brand.opacity(0.6), Color.brand],
                        center: .center
                    ),
                    style: StrokeStyle(lineWidth: 12, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .frame(width: 88, height: 88)
            VStack(spacing: 1) {
                Text("\(Int(progress * 100))%")
                    .font(.system(size: 14, weight: .bold, design: .rounded))
                    .foregroundStyle(Color.labelPrimary)
                Text("done")
                    .font(.system(size: 9, weight: .medium))
                    .foregroundStyle(Color.labelSecondary)
            }
        }
    }
}

private struct MacroStat: View {
    let label: String
    let value: String
    let color: Color

    var body: some View {
        VStack(spacing: 4) {
            HStack(spacing: 4) {
                Circle().fill(color).frame(width: 6, height: 6)
                Text(label)
                    .font(.caption2.weight(.medium))
                    .foregroundStyle(Color.labelSecondary)
            }
            Text(value)
                .font(.system(size: 16, weight: .bold, design: .rounded))
                .foregroundStyle(Color.labelPrimary)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Discover

struct DiscoverView: View {
    @ObservedObject var viewModel: AppViewModel

    private let gridColumns = [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)]

    var body: some View {
        ZStack {
            AppBackground()
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 24) {

                    // Filter chips
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 8) {
                            ForEach(DietType.allCases) { diet in
                                Button(diet.title) {
                                    viewModel.selectedDiet = diet
                                }
                                .font(.subheadline.weight(.medium))
                                .padding(.horizontal, 14)
                                .padding(.vertical, 8)
                                .background(viewModel.selectedDiet == diet ? Color.brand : Color.bgCard)
                                .foregroundStyle(viewModel.selectedDiet == diet ? Color(red: 0.05, green: 0.20, blue: 0.10) : Color.labelSecondary)
                                .clipShape(Capsule())
                                .overlay(
                                    Capsule().stroke(viewModel.selectedDiet == diet ? Color.brand : Color.cardBorder, lineWidth: 1)
                                )
                            }
                        }
                        .padding(.horizontal, 16)
                    }
                    .padding(.horizontal, -16)

                    // Featured horizontal scroll
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("🔥 Trending Now")
                                .font(.headline)
                                .foregroundStyle(Color.labelPrimary)
                            Spacer()
                            Text("\(viewModel.trendingRecipes.count) recipes")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(Color.labelSecondary)
                        }
                        .padding(.horizontal, 16)

                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 12) {
                                ForEach(viewModel.trendingRecipes.prefix(8)) { recipe in
                                    NavigationLink {
                                        RecipeDetailView(viewModel: viewModel, recipe: recipe)
                                    } label: {
                                        FeaturedRecipeCard(recipe: recipe, onShare: { viewModel.share(recipe) })
                                            .frame(width: 250)
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                            .padding(.horizontal, 16)
                        }
                    }
                    .padding(.horizontal, -16)

                    // Best Rated 2-col grid
                    VStack(alignment: .leading, spacing: 12) {
                        Text("⭐ Best Rated")
                            .font(.headline)
                            .foregroundStyle(Color.labelPrimary)

                        LazyVGrid(columns: gridColumns, spacing: 12) {
                            ForEach(viewModel.bestRatedRecipes.prefix(8)) { recipe in
                                NavigationLink {
                                    RecipeDetailView(viewModel: viewModel, recipe: recipe)
                                } label: {
                                    RecipeCard(recipe: recipe, onShare: { viewModel.share(recipe) })
                                }
                                .buttonStyle(.plain)
                            }
                        }
                    }

                    // Diet-filtered 2-col grid
                    if !viewModel.filteredRecipes.isEmpty {
                        VStack(alignment: .leading, spacing: 12) {
                            HStack {
                                Text("\(viewModel.selectedDiet.title) Picks")
                                    .font(.headline)
                                    .foregroundStyle(Color.labelPrimary)
                                Spacer()
                                Text("\(viewModel.filteredRecipes.count) recipes")
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(Color.labelSecondary)
                            }

                            LazyVGrid(columns: gridColumns, spacing: 12) {
                                ForEach(viewModel.filteredRecipes.prefix(10)) { recipe in
                                    NavigationLink {
                                        RecipeDetailView(viewModel: viewModel, recipe: recipe)
                                    } label: {
                                        RecipeCard(recipe: recipe, onShare: { viewModel.share(recipe) })
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 32)
            }
        }
        .navigationTitle("Discover")
        .navigationBarTitleDisplayMode(.large)
        .appNavBar()
        .screenBackground()
    }
}

// MARK: - Recipe Detail

struct RecipeDetailView: View {
    @ObservedObject var viewModel: AppViewModel
    let recipe: Recipe
    @State private var completedSteps = Set<Int>()

    var body: some View {
        ZStack {
            AppBackground()
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 18) {
                    RecipeHeroView(
                        recipe: recipe,
                        isFavorite: viewModel.favorites.contains(recipe.id),
                        onToggleFavorite: { viewModel.toggleFavorite(recipe) }
                    )

                    RecipeIngredientsCard(ingredients: recipe.ingredients)

                    RecipeVideoCard(recipe: recipe)

                    RecipeStepsChecklist(steps: recipe.steps, completedSteps: $completedSteps)

                    PrimaryButton(label: "Share Recipe", icon: "square.and.arrow.up") {
                        viewModel.share(recipe)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 32)
            }
        }
        .navigationTitle("Recipe")
        .navigationBarTitleDisplayMode(.inline)
        .appNavBar()
        .screenBackground()
        .toolbar(.hidden, for: .tabBar)
    }
}

private struct RecipeHeroView: View {
    let recipe: Recipe
    let isFavorite: Bool
    let onToggleFavorite: () -> Void

    private var imageURL: URL? {
        RecipeMedia.photoURLs[recipe.mediaIndex % RecipeMedia.photoURLs.count]
    }

    var body: some View {
        ZStack(alignment: .bottomLeading) {
            RecipeRemoteImage(url: imageURL)
                .frame(height: 270)
                .overlay(
                    LinearGradient(
                        colors: [.black.opacity(0.08), .black.opacity(0.68)],
                        startPoint: .top,
                        endPoint: .bottom
                    )
                )

            VStack(alignment: .leading, spacing: 14) {
                HStack(alignment: .top) {
                    Text(recipe.diet.title)
                        .font(.caption.weight(.semibold))
                        .padding(.horizontal, 10)
                        .padding(.vertical, 5)
                        .background(Color.brand.opacity(0.9))
                        .foregroundStyle(Color(red: 0.04, green: 0.18, blue: 0.09))
                        .clipShape(Capsule())

                    Spacer()

                    Button(action: onToggleFavorite) {
                        Image(systemName: isFavorite ? "heart.fill" : "heart")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundStyle(isFavorite ? .red : .white)
                            .frame(width: 42, height: 42)
                            .background(.ultraThinMaterial)
                            .clipShape(Circle())
                    }
                }

                Spacer()

                VStack(alignment: .leading, spacing: 10) {
                    Text(recipe.name)
                        .font(.system(size: 30, weight: .black, design: .rounded))
                        .foregroundStyle(Color.labelPrimary)
                        .lineLimit(2)

                    HStack(spacing: 8) {
                        Label(String(format: "%.1f", recipe.rating), systemImage: "star.fill")
                            .foregroundStyle(.yellow)
                        Text("(\(recipe.reviewCount) reviews)")
                            .foregroundStyle(.white.opacity(0.76))
                    }
                    .font(.subheadline.weight(.semibold))

                    HStack(spacing: 8) {
                        RecipeStatChip(icon: "flame.fill", value: "\(recipe.calories) kcal", color: .fatColor)
                        RecipeStatChip(icon: "clock.fill", value: "\(recipe.timeToMakeMinutes) min", color: .proteinColor)
                        RecipeStatChip(icon: "dollarsign.circle.fill", value: recipe.cost, color: .carbColor)
                    }
                }
            }
            .padding(18)
        }
        .clipShape(RoundedRectangle(cornerRadius: 28, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 28, style: .continuous)
                .stroke(Color.cardBorder, lineWidth: 1)
        )
    }
}

private struct RecipeRemoteImage: View {
    let url: URL?

    var body: some View {
        AsyncImage(url: url) { phase in
            switch phase {
            case .success(let image):
                image
                    .resizable()
                    .scaledToFill()
            default:
                ZStack {
                    LinearGradient(
                        colors: [Color.brand.opacity(0.35), Color.bgCard, Color.fatColor.opacity(0.24)],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                    Image(systemName: "fork.knife.circle.fill")
                        .font(.system(size: 72, weight: .semibold))
                        .foregroundStyle(Color.labelTertiary)
                }
            }
        }
        .clipped()
    }
}

private struct RecipeIngredientsCard: View {
    let ingredients: [String]

    private let columns = [
        GridItem(.adaptive(minimum: 132), spacing: 10)
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionTitleRow(title: "Ingredients", subtitle: "\(ingredients.count) items")

            LazyVGrid(columns: columns, alignment: .leading, spacing: 10) {
                ForEach(ingredients, id: \.self) { ingredient in
                    IngredientPill(ingredient: ingredient)
                }
            }
        }
        .glassCard()
    }
}

private struct IngredientPill: View {
    let ingredient: String

    var body: some View {
        HStack(spacing: 10) {
            ZStack {
                Circle()
                    .fill(Color.brandDim)
                    .frame(width: 34, height: 34)
                Image(systemName: iconName)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(Color.brand)
            }

            Text(ingredient)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(Color.labelPrimary)
                .lineLimit(2)
        }
        .padding(10)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.ingredientFill)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(Color.cardBorder, lineWidth: 1)
        )
    }

    private var iconName: String {
        let lowercased = ingredient.lowercased()
        if lowercased.contains("egg") { return "oval.fill" }
        if lowercased.contains("oil") { return "drop.fill" }
        if lowercased.contains("yogurt") { return "cup.and.saucer.fill" }
        if lowercased.contains("salmon") || lowercased.contains("tuna") || lowercased.contains("shrimp") { return "fish.fill" }
        if lowercased.contains("chicken") || lowercased.contains("turkey") || lowercased.contains("beef") { return "fork.knife" }
        return "leaf.fill"
    }
}

private struct RecipeVideoCard: View {
    let recipe: Recipe

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionTitleRow(title: "Video Guide", subtitle: "\(recipe.timeToMakeMinutes) min cook-along")

            ZStack {
                RecipeRemoteImage(url: RecipeMedia.videoThumbnails[recipe.mediaIndex % RecipeMedia.videoThumbnails.count])
                    .frame(height: 150)
                    .overlay(Color.black.opacity(0.36))

                VStack(spacing: 10) {
                    Image(systemName: "play.fill")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundStyle(Color.bgBase)
                        .frame(width: 58, height: 58)
                        .background(Color.brand)
                        .clipShape(Circle())
                    Text("Place recipe video here")
                        .font(.headline)
                        .foregroundStyle(Color.labelPrimary)
                    Text("Add a short prep clip or full cooking tutorial")
                        .font(.caption)
                        .foregroundStyle(Color.white.opacity(0.72))
                }
            }
            .clipShape(RoundedRectangle(cornerRadius: 22, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 22, style: .continuous)
                    .stroke(Color.cardBorder, lineWidth: 1)
            )
        }
        .glassCard()
    }
}

private struct RecipeStepsChecklist: View {
    let steps: [String]
    @Binding var completedSteps: Set<Int>

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            SectionTitleRow(title: "Steps Checklist", subtitle: "\(completedSteps.count)/\(steps.count) done")

            ForEach(Array(steps.enumerated()), id: \.offset) { idx, step in
                Button {
                    if completedSteps.contains(idx) {
                        completedSteps.remove(idx)
                    } else {
                        completedSteps.insert(idx)
                    }
                } label: {
                    HStack(alignment: .top, spacing: 12) {
                        Image(systemName: completedSteps.contains(idx) ? "checkmark.circle.fill" : "circle")
                            .font(.system(size: 22, weight: .semibold))
                            .foregroundStyle(completedSteps.contains(idx) ? Color.brand : Color.labelTertiary)

                        VStack(alignment: .leading, spacing: 4) {
                            Text("Step \(idx + 1)")
                                .font(.caption.weight(.bold))
                                .foregroundStyle(Color.brand)
                            Text(step)
                                .font(.body)
                                .foregroundStyle(completedSteps.contains(idx) ? Color.labelTertiary : Color.labelSecondary)
                                .strikethrough(completedSteps.contains(idx), color: Color.labelTertiary)
                                .fixedSize(horizontal: false, vertical: true)
                        }

                        Spacer(minLength: 0)
                    }
                    .padding(12)
                    .background(completedSteps.contains(idx) ? Color.brand.opacity(0.08) : Color.stepFill)
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .stroke(completedSteps.contains(idx) ? Color.brand.opacity(0.32) : Color.cardBorder, lineWidth: 1)
                    )
                }
                .buttonStyle(.plain)
            }
        }
        .glassCard()
    }
}

private struct SectionTitleRow: View {
    let title: String
    let subtitle: String

    var body: some View {
        HStack {
            Text(title)
                .font(.headline)
                .foregroundStyle(Color.labelPrimary)
            Spacer()
            Text(subtitle)
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.labelSecondary)
                .padding(.horizontal, 10)
                .padding(.vertical, 5)
                .background(Color.surfaceSubtle)
                .clipShape(Capsule())
        }
    }
}

private struct RecipeStatChip: View {
    let icon: String
    let value: String
    let color: Color

    var body: some View {
        HStack(spacing: 5) {
            Image(systemName: icon).foregroundStyle(color)
            Text(value).foregroundStyle(Color.labelPrimary)
        }
        .font(.caption.weight(.semibold))
        .padding(.horizontal, 10)
        .padding(.vertical, 7)
        .background(Color.bgCard)
        .clipShape(Capsule())
        .overlay(Capsule().stroke(Color.cardBorder, lineWidth: 1))
    }
}

private enum RecipeMedia {
    static let photoURLs = [
        URL(string: "https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=1200&q=80"),
        URL(string: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80"),
        URL(string: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80"),
        URL(string: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=1200&q=80"),
        URL(string: "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=1200&q=80")
    ]

    static let videoThumbnails = [
        URL(string: "https://images.unsplash.com/photo-1556911220-bff31c812dba?auto=format&fit=crop&w=1200&q=80"),
        URL(string: "https://images.unsplash.com/photo-1551218808-94e220e084d2?auto=format&fit=crop&w=1200&q=80"),
        URL(string: "https://images.unsplash.com/photo-1495521821757-a1efb6729352?auto=format&fit=crop&w=1200&q=80")
    ]
}

private extension Recipe {
    var mediaIndex: Int {
        name.unicodeScalars.reduce(0) { ($0 + Int($1.value)) % 997 }
    }
    var protein: Int { Int(Double(calories) * 0.26 / 4.0) }
    var carbs: Int { Int(Double(calories) * 0.33 / 4.0) }
}

private extension MealEntry {
    var photoURL: URL? {
        let idx = name.unicodeScalars.reduce(0) { ($0 + Int($1.value)) % RecipeMedia.photoURLs.count }
        return RecipeMedia.photoURLs[idx]
    }
}

// MARK: - Add Meal

struct AddMealView: View {
    @ObservedObject var viewModel: AppViewModel

    var body: some View {
        ZStack {
            AppBackground()
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    VStack(spacing: 12) {
                        AddActionButton(
                            icon: "camera.viewfinder",
                            title: "Scan food with AI",
                            subtitle: "Snap a photo to log instantly",
                            color: .brand
                        ) { viewModel.scanMealUsingAI() }

                        AddActionButton(
                            icon: "magnifyingglass",
                            title: "Search meal database",
                            subtitle: "Browse 200+ tracked recipes",
                            color: .proteinColor
                        ) { viewModel.addFromDiscovery() }

                        AddActionButton(
                            icon: "plus.forwardslash.minus",
                            title: "Quick add calories",
                            subtitle: "Manually enter nutrition data",
                            color: .carbColor
                        ) { viewModel.addManualMeal() }
                    }
                    .glassCard()

                    VStack(alignment: .leading, spacing: 12) {
                        Text("Recent Logs")
                            .font(.headline)
                            .foregroundStyle(Color.labelPrimary)

                        ForEach(viewModel.todayMeals.prefix(5)) { meal in
                            HStack(spacing: 12) {
                                AsyncImage(url: meal.photoURL) { phase in
                                    switch phase {
                                    case .success(let image):
                                        image.resizable().scaledToFill()
                                            .frame(width: 48, height: 48)
                                            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                                    default:
                                        ZStack {
                                            RoundedRectangle(cornerRadius: 12, style: .continuous).fill(Color.brandDim)
                                            Image(systemName: "fork.knife")
                                                .font(.system(size: 15, weight: .semibold))
                                                .foregroundStyle(Color.brand)
                                        }
                                        .frame(width: 48, height: 48)
                                    }
                                }
                                VStack(alignment: .leading, spacing: 5) {
                                    Text(meal.name)
                                        .font(.body.weight(.semibold))
                                        .foregroundStyle(Color.labelPrimary)
                                        .lineLimit(1)
                                    HStack(spacing: 5) {
                                        MacroMiniPill(label: "P", value: meal.protein, color: .proteinColor)
                                        MacroMiniPill(label: "C", value: meal.carbs, color: .carbColor)
                                    }
                                }
                                Spacer()
                                VStack(alignment: .trailing, spacing: 1) {
                                    Text("\(meal.calories)")
                                        .font(.system(size: 15, weight: .bold, design: .rounded))
                                        .foregroundStyle(Color.labelPrimary)
                                    Text("kcal")
                                        .font(.caption2)
                                        .foregroundStyle(Color.labelSecondary)
                                }
                            }
                            .padding(.vertical, 4)
                        }
                    }
                    .glassCard()
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 32)
            }
        }
        .navigationTitle("Add Meal")
        .navigationBarTitleDisplayMode(.large)
        .appNavBar()
        .screenBackground()
    }
}

private struct AddActionButton: View {
    let icon: String
    let title: String
    let subtitle: String
    let color: Color
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(color.opacity(0.18))
                        .frame(width: 46, height: 46)
                    Image(systemName: icon)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(color)
                }
                VStack(alignment: .leading, spacing: 2) {
                    Text(title)
                        .font(.body.weight(.semibold))
                        .foregroundStyle(Color.labelPrimary)
                    Text(subtitle)
                        .font(.caption)
                        .foregroundStyle(Color.labelSecondary)
                }
                Spacer()
                Image(systemName: "chevron.right")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Color.labelTertiary)
            }
        }
    }
}

// MARK: - Progress

struct ProgressView: View {
    @ObservedObject var viewModel: AppViewModel

    var body: some View {
        ZStack {
            AppBackground()
            ScrollView(showsIndicators: false) {
                VStack(spacing: 20) {
                    DailySummaryCard(viewModel: viewModel)

                    HStack(spacing: 12) {
                        MacroProgressPill(
                            title: "Calories",
                            consumed: viewModel.caloriesConsumed,
                            target: viewModel.dayCaloriesTarget,
                            unit: "kcal",
                            color: .brand
                        )
                        MacroProgressPill(
                            title: "Protein",
                            consumed: viewModel.proteinConsumed,
                            target: 180,
                            unit: "g",
                            color: .proteinColor
                        )
                    }
                    HStack(spacing: 12) {
                        MacroProgressPill(
                            title: "Carbs",
                            consumed: viewModel.carbsConsumed,
                            target: 180,
                            unit: "g",
                            color: .carbColor
                        )
                        MacroProgressPill(
                            title: "Fat",
                            consumed: viewModel.fatConsumed,
                            target: 90,
                            unit: "g",
                            color: .fatColor
                        )
                    }

                    VStack(alignment: .leading, spacing: 14) {
                        Text("Weekly Trend")
                            .font(.headline)
                            .foregroundStyle(Color.labelPrimary)
                        ForEach(viewModel.weeklyCalories, id: \.day) { day in
                            WeeklyBar(day: day.day, calories: day.calories, target: viewModel.dayCaloriesTarget)
                        }
                    }
                    .glassCard()
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 32)
            }
        }
        .navigationTitle("Progress")
        .navigationBarTitleDisplayMode(.large)
        .appNavBar()
        .screenBackground()
    }
}

private struct MacroProgressPill: View {
    let title: String
    let consumed: Int
    let target: Int
    let unit: String
    let color: Color

    private var ratio: CGFloat { min(1.0, CGFloat(consumed) / CGFloat(target)) }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text(title)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(Color.labelSecondary)
                Spacer()
                Text("\(consumed)/\(target)\(unit)")
                    .font(.caption2)
                    .foregroundStyle(Color.labelTertiary)
            }
            Text("\(consumed)\(unit)")
                .font(.system(size: 22, weight: .bold, design: .rounded))
                .foregroundStyle(Color.labelPrimary)
            GeometryReader { proxy in
                ZStack(alignment: .leading) {
                    Capsule().fill(Color.surfaceSubtle).frame(height: 6)
                    Capsule().fill(color).frame(width: proxy.size.width * ratio, height: 6)
                }
            }
            .frame(height: 6)
        }
        .glassCard()
    }
}

private struct WeeklyBar: View {
    let day: String
    let calories: Int
    let target: Int

    private var ratio: CGFloat { min(1.0, CGFloat(calories) / CGFloat(target)) }

    var body: some View {
        HStack(spacing: 10) {
            Text(day)
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.labelSecondary)
                .frame(width: 28, alignment: .leading)
            GeometryReader { proxy in
                ZStack(alignment: .leading) {
                    Capsule().fill(Color.surfaceSubtle).frame(height: 8)
                    Capsule()
                        .fill(
                            LinearGradient(colors: [Color.brand.opacity(0.7), Color.brand], startPoint: .leading, endPoint: .trailing)
                        )
                        .frame(width: proxy.size.width * ratio, height: 8)
                }
            }
            .frame(height: 8)
            Text("\(calories)")
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color.labelSecondary)
                .frame(width: 36, alignment: .trailing)
        }
    }
}

// MARK: - Profile

struct ProfileView: View {
    @ObservedObject var viewModel: AppViewModel
    @EnvironmentObject private var convex: ConvexService

    var body: some View {
        ZStack {
            AppBackground()
            ScrollView(showsIndicators: false) {
                VStack(spacing: 16) {
                    VStack(spacing: 12) {
                        ZStack {
                            Circle()
                                .fill(Color.brandDim)
                                .frame(width: 72, height: 72)
                            Text(String(viewModel.profileName.prefix(1)).uppercased())
                                .font(.system(size: 28, weight: .bold))
                                .foregroundStyle(Color.brand)
                        }
                        VStack(spacing: 4) {
                            Text(viewModel.profileName)
                                .font(.title3.bold())
                                .foregroundStyle(Color.labelPrimary)
                            Text(viewModel.profileBio)
                                .font(.subheadline)
                                .foregroundStyle(Color.labelSecondary)
                                .multilineTextAlignment(.center)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .glassCard(padding: 24)

                    HStack(spacing: 12) {
                        StatCard(label: "Meals Today", value: "\(viewModel.todayMeals.count)", icon: "fork.knife", color: .brand)
                        StatCard(label: "Saved", value: "\(viewModel.favorites.count)", icon: "heart.fill", color: Color(red: 1, green: 0.35, blue: 0.35))
                        StatCard(label: "Diet", value: viewModel.selectedDiet.title, icon: "leaf.fill", color: .proteinColor)
                    }

                    ProfileSettingsSection(title: "Preferences") {
                        ProfileTextField(label: "Display name", text: $viewModel.profileName)
                        Divider().background(Color.cardBorder)
                        ProfileTextField(label: "Bio", text: $viewModel.profileBio)
                        Divider().background(Color.cardBorder)
                        ProfileThemeRow(selection: $viewModel.profileTheme)
                        Divider().background(Color.cardBorder)
                        ProfileLayoutRow(selection: $viewModel.dashboardLayout)
                        Divider().background(Color.cardBorder)
                        ProfileUnitsRow(selection: $viewModel.units)
                        Divider().background(Color.cardBorder)
                        HStack {
                            Text("Private meals")
                                .foregroundStyle(Color.labelPrimary)
                            Spacer()
                            Toggle("", isOn: $viewModel.privateMealsEnabled)
                                .tint(Color.brand)
                        }
                    }

                    if AppDeployment.isClerkEnabled {
                        VStack(spacing: 0) {
                            ClerkAccountSection()
                                .environment(Clerk.shared)
                        }
                        .glassCard()
                    }

                    if !convex.todos.isEmpty {
                        ProfileSettingsSection(title: "Synced Data") {
                            ForEach(convex.todos) { todo in
                                Text(todo.text)
                                    .foregroundStyle(Color.labelSecondary)
                                    .font(.subheadline)
                            }
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 32)
            }
        }
        .navigationTitle("Profile")
        .navigationBarTitleDisplayMode(.large)
        .appNavBar()
        .screenBackground()
    }
}

private struct StatCard: View {
    let label: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(color)
            Text(value)
                .font(.system(size: 15, weight: .bold, design: .rounded))
                .foregroundStyle(Color.labelPrimary)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
            Text(label)
                .font(.caption2)
                .foregroundStyle(Color.labelSecondary)
        }
        .frame(maxWidth: .infinity)
        .glassCard(padding: 14)
    }
}

private struct ProfileSettingsSection<Content: View>: View {
    let title: String
    @ViewBuilder let content: () -> Content

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            Text(title)
                .font(.footnote.weight(.semibold))
                .foregroundStyle(Color.brand)
                .textCase(.uppercase)
                .tracking(0.8)
            content()
        }
        .glassCard()
    }
}

private struct ProfileTextField: View {
    let label: String
    @Binding var text: String

    var body: some View {
        HStack {
            Text(label)
                .foregroundStyle(Color.labelSecondary)
                .frame(width: 110, alignment: .leading)
            TextField("", text: $text)
                .foregroundStyle(Color.labelPrimary)
                .multilineTextAlignment(.trailing)
        }
    }
}

private struct ProfileThemeRow: View {
    @Binding var selection: ProfileTheme
    var body: some View {
        HStack {
            Text("Theme").foregroundStyle(Color.labelSecondary)
            Spacer()
            Picker("", selection: $selection) {
                ForEach(ProfileTheme.allCases) { t in Text(t.title).tag(t) }
            }.tint(Color.labelSecondary)
        }
    }
}

private struct ProfileLayoutRow: View {
    @Binding var selection: DashboardLayout
    var body: some View {
        HStack {
            Text("Layout").foregroundStyle(Color.labelSecondary)
            Spacer()
            Picker("", selection: $selection) {
                ForEach(DashboardLayout.allCases) { l in Text(l.title).tag(l) }
            }.tint(Color.labelSecondary)
        }
    }
}

private struct ProfileUnitsRow: View {
    @Binding var selection: UnitsType
    var body: some View {
        HStack {
            Text("Units").foregroundStyle(Color.labelSecondary)
            Spacer()
            Picker("", selection: $selection) {
                ForEach(UnitsType.allCases) { u in Text(u.title).tag(u) }
            }.tint(Color.labelSecondary)
        }
    }
}

// MARK: - Shared Card Components

struct MealRow: View {
    let meal: MealEntry

    var body: some View {
        HStack(spacing: 12) {
            AsyncImage(url: meal.photoURL) { phase in
                switch phase {
                case .success(let image):
                    image
                        .resizable()
                        .scaledToFill()
                        .frame(width: 56, height: 56)
                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                default:
                    ZStack {
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(Color.brandDim)
                        Image(systemName: "fork.knife")
                            .font(.system(size: 18, weight: .semibold))
                            .foregroundStyle(Color.brand)
                    }
                    .frame(width: 56, height: 56)
                }
            }
            VStack(alignment: .leading, spacing: 5) {
                Text(meal.name)
                    .font(.body.weight(.semibold))
                    .foregroundStyle(Color.labelPrimary)
                    .lineLimit(1)
                HStack(spacing: 5) {
                    MacroMiniPill(label: "P", value: meal.protein, color: .proteinColor)
                    MacroMiniPill(label: "C", value: meal.carbs, color: .carbColor)
                    MacroMiniPill(label: "F", value: meal.fat, color: .fatColor)
                }
            }
            Spacer()
            VStack(alignment: .trailing, spacing: 2) {
                Text("\(meal.calories)")
                    .font(.system(size: 16, weight: .bold, design: .rounded))
                    .foregroundStyle(Color.labelPrimary)
                Text("kcal")
                    .font(.caption2)
                    .foregroundStyle(Color.labelSecondary)
            }
        }
        .glassCard()
    }
}


// MARK: - Macro Mini Pill

private struct MacroMiniPill: View {
    let label: String
    let value: Int
    let color: Color

    var body: some View {
        HStack(spacing: 3) {
            Circle()
                .fill(color)
                .frame(width: 5, height: 5)
            Text("\(label) \(value)g")
                .font(.system(size: 10, weight: .bold, design: .rounded))
                .foregroundStyle(color)
        }
        .padding(.horizontal, 7)
        .padding(.vertical, 4)
        .background(color.opacity(0.18))
        .clipShape(Capsule())
    }
}

// MARK: - Recipe Card (image-first, 2-col grid)

struct RecipeCard: View {
    let recipe: Recipe
    let onShare: () -> Void

    private var imageURL: URL? {
        RecipeMedia.photoURLs[recipe.mediaIndex % RecipeMedia.photoURLs.count]
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            RecipeRemoteImage(url: imageURL)
                .frame(height: 200)

            LinearGradient(
                colors: [.clear, .black.opacity(0.82)],
                startPoint: .top,
                endPoint: .bottom
            )

            VStack(alignment: .leading, spacing: 0) {
                HStack(alignment: .top) {
                    Text(recipe.diet.title)
                        .font(.system(size: 9, weight: .bold))
                        .padding(.horizontal, 7)
                        .padding(.vertical, 3)
                        .background(Color.brand.opacity(0.92))
                        .foregroundStyle(Color(red: 0.04, green: 0.18, blue: 0.09))
                        .clipShape(Capsule())
                    Spacer()
                    if recipe.isTrending {
                        Text("🔥")
                            .font(.system(size: 14))
                    }
                }
                .padding([.top, .horizontal], 10)

                Spacer()

                VStack(alignment: .leading, spacing: 5) {
                    Text(recipe.name)
                        .font(.system(size: 13, weight: .bold))
                        .foregroundStyle(.white)
                        .lineLimit(2)

                    HStack(spacing: 4) {
                        Image(systemName: "star.fill")
                            .foregroundStyle(.yellow)
                            .font(.system(size: 10))
                        Text(String(format: "%.1f", recipe.rating))
                            .font(.system(size: 11, weight: .semibold))
                            .foregroundStyle(.white.opacity(0.9))
                        Spacer()
                        MacroMiniPill(label: "P", value: recipe.protein, color: .proteinColor)
                        MacroMiniPill(label: "C", value: recipe.carbs, color: .carbColor)
                    }
                }
                .padding([.bottom, .horizontal], 10)
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .stroke(Color.cardBorder, lineWidth: 1)
        )
    }
}

// MARK: - Featured Recipe Card (horizontal scroll, larger)

private struct FeaturedRecipeCard: View {
    let recipe: Recipe
    let onShare: () -> Void

    private var imageURL: URL? {
        RecipeMedia.photoURLs[recipe.mediaIndex % RecipeMedia.photoURLs.count]
    }

    var body: some View {
        ZStack(alignment: .bottom) {
            RecipeRemoteImage(url: imageURL)
                .frame(height: 270)

            LinearGradient(
                colors: [.clear, .black.opacity(0.85)],
                startPoint: .top,
                endPoint: .bottom
            )

            VStack(alignment: .leading, spacing: 0) {
                HStack(alignment: .top) {
                    Text(recipe.diet.title)
                        .font(.caption2.weight(.bold))
                        .padding(.horizontal, 8)
                        .padding(.vertical, 4)
                        .background(Color.brand.opacity(0.92))
                        .foregroundStyle(Color(red: 0.04, green: 0.18, blue: 0.09))
                        .clipShape(Capsule())
                    Spacer()
                    Button(action: onShare) {
                        Image(systemName: "square.and.arrow.up")
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundStyle(.white)
                            .frame(width: 30, height: 30)
                            .background(.ultraThinMaterial)
                            .clipShape(Circle())
                    }
                }
                .padding([.top, .horizontal], 14)

                Spacer()

                VStack(alignment: .leading, spacing: 7) {
                    Text(recipe.name)
                        .font(.headline.bold())
                        .foregroundStyle(.white)
                        .lineLimit(2)

                    HStack(spacing: 6) {
                        Label(String(format: "%.1f", recipe.rating), systemImage: "star.fill")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.yellow)
                        Text("·")
                            .foregroundStyle(.white.opacity(0.4))
                        Image(systemName: "clock.fill")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.6))
                        Text("\(recipe.timeToMakeMinutes) min")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.75))
                        Text("·")
                            .foregroundStyle(.white.opacity(0.4))
                        Text("\(recipe.calories) kcal")
                            .font(.caption)
                            .foregroundStyle(.white.opacity(0.75))
                    }

                    HStack(spacing: 6) {
                        MacroMiniPill(label: "Protein", value: recipe.protein, color: .proteinColor)
                        MacroMiniPill(label: "Carbs", value: recipe.carbs, color: .carbColor)
                        Spacer()
                    }
                }
                .padding([.bottom, .horizontal], 16)
            }
        }
        .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 24, style: .continuous)
                .stroke(Color.cardBorder, lineWidth: 1)
        )
    }
}

struct CommunityMealCard: View {
    let item: CommunityMeal

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(Color(hue: Double(item.userName.hashValue % 360) / 360.0, saturation: 0.5, brightness: 0.7).opacity(0.25))
                    .frame(width: 40, height: 40)
                Text(String(item.userName.prefix(1)).uppercased())
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(Color(hue: Double(item.userName.hashValue % 360) / 360.0, saturation: 0.6, brightness: 0.9))
            }
            VStack(alignment: .leading, spacing: 3) {
                HStack {
                    Text(item.userName)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(Color.labelSecondary)
                    Spacer()
                    Text(item.diet.title)
                        .font(.caption2)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(Color.brand.opacity(0.12))
                        .foregroundStyle(Color.brand)
                        .clipShape(Capsule())
                }
                Text(item.mealName)
                    .font(.body.weight(.semibold))
                    .foregroundStyle(Color.labelPrimary)
                Text("\(item.calories) kcal · \(item.timeToMakeMinutes) min · \(item.cost)")
                    .font(.caption)
                    .foregroundStyle(Color.labelSecondary)
            }
        }
        .glassCard()
    }
}

struct PrimaryButton: View {
    let label: String
    let icon: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                Text(label).fontWeight(.semibold)
            }
            .font(.body)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 15)
            .background(Color.brand)
            .foregroundStyle(Color(red: 0.05, green: 0.20, blue: 0.10))
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        }
    }
}

// MARK: - Data Models + ViewModel (unchanged)

enum DietType: String, CaseIterable, Identifiable {
    case keto, vegan, lowCarb, highProtein, diabetic, balanced

    var id: Self { self }
    var title: String {
        switch self {
        case .keto: "Keto"
        case .vegan: "Vegan"
        case .lowCarb: "Low Carb"
        case .highProtein: "High Protein"
        case .diabetic: "Diabetic"
        case .balanced: "Balanced"
        }
    }
}

enum AppFlowStage { case splash, onboarding, goalSetup, paywall, mainApp }

enum AppTab: Hashable { case home, discover, add, progress, profile }

enum UserGoal: String, CaseIterable, Identifiable {
    case loseWeight, maintain, gainMuscle
    var id: Self { self }
    var title: String {
        switch self {
        case .loseWeight: "Lose Weight"
        case .maintain: "Maintain"
        case .gainMuscle: "Gain Muscle"
        }
    }
    var icon: String {
        switch self {
        case .loseWeight: "arrow.down.circle"
        case .maintain: "equal.circle"
        case .gainMuscle: "arrow.up.circle"
        }
    }
}

enum ProfileTheme: String, CaseIterable, Identifiable {
    case midnight, ocean, sunset
    var id: Self { self }
    var title: String { rawValue.capitalized }
}

enum DashboardLayout: String, CaseIterable, Identifiable {
    case compact, detailed
    var id: Self { self }
    var title: String { rawValue.capitalized }
}

enum UnitsType: String, CaseIterable, Identifiable {
    case metric, imperial
    var id: Self { self }
    var title: String { rawValue.capitalized }
}

struct OnboardingPage: Identifiable {
    let id = UUID()
    let icon: String
    let title: String
    let subtitle: String
}

struct MealEntry: Identifiable, Hashable {
    let id: UUID
    let name: String
    let calories: Int
    let protein: Int
    let carbs: Int
    let fat: Int

    init(id: UUID = UUID(), name: String, calories: Int, protein: Int, carbs: Int, fat: Int) {
        self.id = id; self.name = name; self.calories = calories
        self.protein = protein; self.carbs = carbs; self.fat = fat
    }
}

struct Recipe: Identifiable, Hashable {
    let id: UUID
    let name: String
    let diet: DietType
    let calories: Int
    let cost: String
    let timeToMakeMinutes: Int
    let rating: Double
    let reviewCount: Int
    let trendScore: Int
    let isTrending: Bool
    let ingredients: [String]
    let steps: [String]

    init(id: UUID = UUID(), name: String, diet: DietType, calories: Int, cost: String,
         timeToMakeMinutes: Int, rating: Double, reviewCount: Int, trendScore: Int,
         isTrending: Bool, ingredients: [String], steps: [String]) {
        self.id = id; self.name = name; self.diet = diet; self.calories = calories
        self.cost = cost; self.timeToMakeMinutes = timeToMakeMinutes; self.rating = rating
        self.reviewCount = reviewCount; self.trendScore = trendScore; self.isTrending = isTrending
        self.ingredients = ingredients; self.steps = steps
    }
}

struct CommunityMeal: Identifiable, Hashable {
    let id: UUID
    let userName: String
    let mealName: String
    let calories: Int
    let diet: DietType
    let cost: String
    let timeToMakeMinutes: Int

    init(id: UUID = UUID(), userName: String, mealName: String, calories: Int,
         diet: DietType, cost: String, timeToMakeMinutes: Int) {
        self.id = id; self.userName = userName; self.mealName = mealName
        self.calories = calories; self.diet = diet; self.cost = cost
        self.timeToMakeMinutes = timeToMakeMinutes
    }
}

struct WeeklyCalories: Hashable {
    let day: String
    let calories: Int
}

final class AppViewModel: ObservableObject {
    let appBrand = "NutraFlow"
    @Published var flowStage: AppFlowStage = .splash
    @Published var goalSetupStep: GoalSetupStep = .primaryGoal
    @Published var onboardingIndex = 0
    @Published var selectedTab: AppTab = .home
    @Published var selectedGoal: UserGoal = .loseWeight
    @Published var selectedDiet: DietType = .keto
    @Published var weightInput = ""
    @Published var heightInput = ""
    @Published var profileName = "Musaab"
    @Published var profileBio = "Building better food habits daily."
    @Published var profileTheme: ProfileTheme = .midnight
    @Published var dashboardLayout: DashboardLayout = .detailed
    @Published var units: UnitsType = .metric
    @Published var privateMealsEnabled = false
    @Published var favorites = Set<UUID>()
    @Published var todayMeals: [MealEntry]
    @Published var allRecipes: [Recipe]
    @Published var communityMeals: [CommunityMeal] = [
        CommunityMeal(userName: "Nora", mealName: "Keto Tuna Salad", calories: 470, diet: .keto, cost: "$6", timeToMakeMinutes: 10),
        CommunityMeal(userName: "Ali", mealName: "Protein Oats", calories: 530, diet: .highProtein, cost: "$4", timeToMakeMinutes: 8),
        CommunityMeal(userName: "Sara", mealName: "Low Carb Egg Wrap", calories: 380, diet: .lowCarb, cost: "$5", timeToMakeMinutes: 12)
    ]
    @Published var weeklyCalories: [WeeklyCalories] = [
        WeeklyCalories(day: "Mon", calories: 2100),
        WeeklyCalories(day: "Tue", calories: 2240),
        WeeklyCalories(day: "Wed", calories: 1980),
        WeeklyCalories(day: "Thu", calories: 2330),
        WeeklyCalories(day: "Fri", calories: 2050),
        WeeklyCalories(day: "Sat", calories: 2190),
        WeeklyCalories(day: "Sun", calories: 2270)
    ]

    let onboardingPages: [OnboardingPage] = [
        OnboardingPage(icon: "camera.viewfinder", title: "Track meals instantly with AI", subtitle: "Snap a photo and log calories in seconds."),
        OnboardingPage(icon: "figure.walk", title: "Plans tailored to your goals", subtitle: "Weight loss, keto, or muscle gain — your call."),
        OnboardingPage(icon: "person.3.fill", title: "Join people improving daily", subtitle: "See trending meals and community results."),
        OnboardingPage(icon: "flame.fill", title: "Start your streak today", subtitle: "Build a daily habit that actually sticks.")
    ]

    let dayCaloriesTarget = 2500

    init() {
        allRecipes = AppViewModel.generateSeedRecipes(count: 220)
        todayMeals = [
            MealEntry(name: "Apple Salmon Salad", calories: 500, protein: 42, carbs: 18, fat: 22),
            MealEntry(name: "Greek Yogurt Bowl", calories: 320, protein: 24, carbs: 29, fat: 12),
            MealEntry(name: "Keto Tuna Salad", calories: 470, protein: 34, carbs: 10, fat: 28)
        ]
    }

    var onboardingPage: OnboardingPage { onboardingPages[onboardingIndex] }
    var filteredRecipes: [Recipe] { allRecipes.filter { $0.diet == selectedDiet } }
    var trendingRecipes: [Recipe] { allRecipes.filter(\.isTrending).sorted { $0.trendScore > $1.trendScore } }
    var recommendedRecipes: [Recipe] { Array(filteredRecipes.sorted { $0.rating > $1.rating }.prefix(8)) }
    var bestRatedRecipes: [Recipe] { allRecipes.sorted { $0.rating > $1.rating } }

    var caloriesConsumed: Int { todayMeals.reduce(0) { $0 + $1.calories } }
    var proteinConsumed: Int { todayMeals.reduce(0) { $0 + $1.protein } }
    var carbsConsumed: Int { todayMeals.reduce(0) { $0 + $1.carbs } }
    var fatConsumed: Int { todayMeals.reduce(0) { $0 + $1.fat } }

    var caloriesLeft: Int { max(0, dayCaloriesTarget - caloriesConsumed) }
    var proteinLeft: Int { max(0, 180 - proteinConsumed) }
    var carbsLeft: Int { max(0, 180 - carbsConsumed) }
    var fatLeft: Int { max(0, 90 - fatConsumed) }
    var progress: CGFloat { CGFloat(caloriesConsumed) / CGFloat(dayCaloriesTarget) }

    func toggleFavorite(_ recipe: Recipe) {
        if favorites.contains(recipe.id) { favorites.remove(recipe.id) } else { favorites.insert(recipe.id) }
    }

    func advanceFromSplash() { flowStage = .onboarding }
    func nextOnboardingStep() {
        if onboardingIndex < onboardingPages.count - 1 { onboardingIndex += 1 }
        else { flowStage = .goalSetup }
    }
    func skipOnboarding() { flowStage = .goalSetup }
    func advanceGoalStep() {
        let all = GoalSetupStep.allCases
        let currentIndex = goalSetupStep.index
        if currentIndex + 1 < all.count {
            goalSetupStep = all[currentIndex + 1]
        } else {
            completeGoalSetup()
        }
    }
    func completeGoalSetup() { flowStage = .paywall }
    func enterMainApp() { flowStage = .mainApp }

    func addManualMeal() {
        todayMeals.insert(MealEntry(name: "Manual Meal", calories: 450, protein: 32, carbs: 40, fat: 18), at: 0)
        selectedTab = .home
    }

    func scanMealUsingAI() {
        todayMeals.insert(MealEntry(name: "AI Scanned Meal", calories: 520, protein: 35, carbs: 42, fat: 21), at: 0)
        selectedTab = .home
    }

    func addFromDiscovery() {
        guard let recipe = trendingRecipes.first else { return }
        todayMeals.insert(
            MealEntry(
                name: recipe.name, calories: recipe.calories,
                protein: Int(Double(recipe.calories) * 0.26 / 4.0),
                carbs: Int(Double(recipe.calories) * 0.33 / 4.0),
                fat: Int(Double(recipe.calories) * 0.41 / 9.0)
            ), at: 0)
        selectedTab = .home
    }

    func share(_ recipe: Recipe) { print("Share \(recipe.name)") }

    static func generateSeedRecipes(count: Int) -> [Recipe] {
        let names = [
            "Chicken Bowl", "Salmon Plate", "Avocado Omelette", "Tofu Stir Fry", "Protein Pasta",
            "Turkey Wrap", "Veggie Soup", "Greek Salad", "Tuna Melt", "Beef Skillet",
            "Lentil Curry", "Quinoa Bowl", "Egg Muffins", "Shrimp Tacos", "Yogurt Parfait"
        ]
        let costs = ["$4", "$5", "$6", "$7", "$8"]
        let ingredientPool = [
            "Chicken breast", "Spinach", "Eggs", "Tofu", "Greek yogurt", "Salmon", "Broccoli",
            "Avocado", "Tomato", "Olive oil", "Garlic", "Lemon", "Cucumber", "Beans", "Rice"
        ]
        let stepTemplates = [
            "Prep fresh ingredients.",
            "Cook protein until done.",
            "Mix with vegetables and seasonings.",
            "Plate and serve warm."
        ]
        return (0..<count).map { idx in
            let diet = DietType.allCases[idx % DietType.allCases.count]
            let calories = 340 + (idx * 17) % 420
            let trend = 15 + (idx * 13) % 90
            return Recipe(
                name: "\(diet.title) \(names[idx % names.count]) \(idx + 1)",
                diet: diet,
                calories: calories,
                cost: costs[idx % costs.count],
                timeToMakeMinutes: 8 + (idx * 3) % 28,
                rating: min(4.9, 4.1 + Double((idx * 7) % 9) * 0.1),
                reviewCount: 10 + (idx * 11) % 390,
                trendScore: trend,
                isTrending: trend > 75,
                ingredients: [
                    ingredientPool[idx % ingredientPool.count],
                    ingredientPool[(idx + 4) % ingredientPool.count],
                    ingredientPool[(idx + 8) % ingredientPool.count]
                ],
                steps: stepTemplates
            )
        }
    }
}

// MARK: - Legacy alias (kept for LiquidGlassBackground references elsewhere)
private typealias LiquidGlassBackground = AppBackground

#Preview {
    ContentView()
        .environmentObject(ConvexService.shared)
}
