import Foundation

enum LaunchConfiguration {
    /// Testing mode keeps the app usable without auth/paywall.
    static var isTestingModeEnabled: Bool {
        if ProcessInfo.processInfo.environment["LEARNX_TEST_MODE"] == "1" {
            return true
        }
        return UserDefaults.standard.bool(forKey: "learnx.testingMode")
    }
}
