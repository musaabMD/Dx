import Foundation
import ConvexMobile

enum ConvexUserService {
    static func syncCurrentUser(name: String?, isPremium: Bool?) async throws {
        let cached = await ConvexConfig.authenticatedClient.loginFromCache()
        switch cached {
        case .success:
            break
        case .failure:
            let fresh = await ConvexConfig.authenticatedClient.login()
            if case let .failure(error) = fresh {
                throw error
            }
        }

        let _: String = try await ConvexConfig.authenticatedClient.mutation(
            "users:upsertMe",
            with: [
                "name": name,
                "isPremium": isPremium
            ]
        )
    }
}
