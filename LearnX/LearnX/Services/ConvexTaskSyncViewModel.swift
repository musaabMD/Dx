import Foundation
import Combine

struct Todo: Decodable, Identifiable {
    let _id: String
    let text: String
    let isCompleted: Bool
    let priority: String?
    let category: String?

    var id: String { _id }
}

@MainActor
final class ConvexTaskSyncViewModel: ObservableObject {
    @Published var todos: [Todo] = []
    @Published var isConnected: Bool = false
    @Published var statusMessage: String = "Not connected"

    private var subscriptionTask: Task<Void, Never>?

    func start() {
        #if canImport(ConvexMobile)
        guard let convex = ConvexConfig.client else {
            statusMessage = "Missing Convex URL"
            isConnected = false
            return
        }

        subscriptionTask?.cancel()
        subscriptionTask = Task {
            for await tasks: [Todo] in convex.subscribe(to: "tasks:get")
                .replaceError(with: [])
                .values
            {
                self.todos = tasks
                self.isConnected = true
                self.statusMessage = "Connected to Convex"
            }
        }
        #else
        statusMessage = "ConvexMobile package not installed in Xcode yet"
        isConnected = false
        #endif
    }

    func stop() {
        subscriptionTask?.cancel()
        subscriptionTask = nil
    }
}
