import Combine
import Foundation
import SwiftUI

@MainActor
final class AppFlowViewModel: ObservableObject {
    enum Phase: Equatable {
        case splash
        case onboarding
        case paywall
        case main
    }

    @AppStorage("learnx.hasCompletedOnboarding") var hasCompletedOnboarding: Bool = false
    @AppStorage("learnx.isSubscribed") var isSubscribed: Bool = false
    @Published private(set) var isTestingMode: Bool = LaunchConfiguration.isTestingModeEnabled

    @Published private(set) var phase: Phase = .splash

    func startColdLaunch() {
        phase = .splash
    }

    func splashFinished() {
        if isTestingMode {
            phase = .main
            return
        }

        if !hasCompletedOnboarding {
            phase = .onboarding
            return
        }

        if !isSubscribed {
            phase = .paywall
            return
        }

        phase = .main
    }

    func finishOnboarding() {
        hasCompletedOnboarding = true
        phase = isTestingMode ? .main : .paywall
    }

    func skipOnboarding() {
        hasCompletedOnboarding = true
        phase = isTestingMode ? .main : .paywall
    }

    func completePaywallPurchase() {
        isSubscribed = true
        phase = .main
    }

    func continueWithoutAuthForTesting() {
        isTestingMode = true
        UserDefaults.standard.set(true, forKey: "learnx.testingMode")
        phase = .main
    }
}
