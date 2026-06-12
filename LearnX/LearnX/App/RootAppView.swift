import SwiftUI

struct RootAppView: View {
    @StateObject private var flow = AppFlowViewModel()
    @StateObject private var shell = AppShellViewModel()
    @StateObject private var createCourse = CreateCourseViewModel()

    var body: some View {
        ZStack {
            switch flow.phase {
            case .splash:
                SplashView()
                    .transition(.opacity)
            case .onboarding:
                OnboardingView()
                    .transition(.move(edge: .trailing).combined(with: .opacity))
            case .paywall:
                PaywallView()
                    .transition(.move(edge: .bottom).combined(with: .opacity))
            case .main:
                MainTabView()
                    .transition(.opacity)
            }
        }
        .animation(.easeInOut(duration: 0.35), value: flow.phase)
        .environmentObject(flow)
        .environmentObject(shell)
        .environmentObject(createCourse)
        .onAppear {
            flow.startColdLaunch()
        }
    }
}
