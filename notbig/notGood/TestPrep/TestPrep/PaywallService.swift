import Foundation
import SuperwallKit

enum PaywallService {
    private static var isConfigured = false
    private static let apiKey = "pk_nCLGX48MXtGhpvd0hqo-Y"

    static func showUpgradePaywall() {
        if !isConfigured {
            Superwall.configure(apiKey: apiKey)
            isConfigured = true
        }
        Superwall.shared.register(placement: "paywall_upgrade")
    }
}

