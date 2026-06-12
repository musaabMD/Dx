import Foundation

enum AppDeployment {
    static let convexURL = "https://greedy-rat-734.convex.cloud"
    static let convexHTTPActionsURL = "https://greedy-rat-734.convex.site"

    private static func infoPlistString(_ key: String) -> String? {
        guard let value = Bundle.main.object(forInfoDictionaryKey: key) as? String else { return nil }
        return value.trimmingCharacters(in: .whitespacesAndNewlines)
    }

    static var clerkPublishableKey: String {
        if let s = infoPlistString("CLERK_PUBLISHABLE_KEY"), !s.isEmpty { return s }
        if let s = ProcessInfo.processInfo.environment["CLERK_PUBLISHABLE_KEY"], !s.isEmpty { return s }
        if let s = ProcessInfo.processInfo.environment["VITE_CLERK_PUBLISHABLE_KEY"], !s.isEmpty { return s }
        return ""
    }

    static var isClerkEnabled: Bool {
        #if DEBUG
        // Keep Clerk off during local testing unless explicitly enabled.
        if ProcessInfo.processInfo.environment["ENABLE_CLERK_DEBUG"] != "1" {
            return false
        }
        #endif
        return !clerkPublishableKey.isEmpty
    }
}
