import Foundation

#if canImport(ConvexMobile)
import ConvexMobile

enum ConvexConfig {
    // Uses your provided Convex Cloud URL.
    static let deploymentURL = "https://tame-rook-95.convex.cloud"
    static let httpActionsURL = "https://tame-rook-95.convex.site"

    static let client: ConvexClient? = ConvexClient(deploymentUrl: deploymentURL)
}
#else
enum ConvexConfig {
    static let deploymentURL = "https://tame-rook-95.convex.cloud"
    static let httpActionsURL = "https://tame-rook-95.convex.site"
    static let client: Any? = nil
}
#endif
