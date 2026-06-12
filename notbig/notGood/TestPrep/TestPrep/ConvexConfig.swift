import Foundation
import ConvexMobile
import ClerkKit

struct ClerkConvexAuthProvider: AuthProvider {
    typealias T = String

    func login() async throws -> String {
        guard let token = try await Clerk.shared.auth.getToken(.init(template: "convex")) else {
            throw NSError(domain: "ConvexAuth", code: 1, userInfo: [NSLocalizedDescriptionKey: "Missing Clerk token"])
        }
        return token
    }

    func logout() async throws {}

    func loginFromCache() async throws -> String {
        guard let token = try await Clerk.shared.auth.getToken(.init(template: "convex")) else {
            throw NSError(domain: "ConvexAuth", code: 2, userInfo: [NSLocalizedDescriptionKey: "Missing cached Clerk token"])
        }
        return token
    }

    func extractIdToken(from authResult: String) -> String {
        authResult
    }
}

enum ConvexConfig {
    static let deploymentURL = "https://nautical-husky-918.convex.cloud"
    static let httpActionsURL = URL(string: "https://nautical-husky-918.convex.site")!

    static let client = ConvexClient(deploymentUrl: deploymentURL)
    static let authenticatedClient = ConvexClientWithAuth<String>(
        deploymentUrl: deploymentURL,
        authProvider: ClerkConvexAuthProvider()
    )
}
