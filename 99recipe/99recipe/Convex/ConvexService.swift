import Combine
import ConvexMobile
import Foundation
import SwiftUI
import ClerkConvex

/// Matches Convex `tasks` table rows (and `sampleData.jsonl` import).
struct ConvexTodo: Decodable, Identifiable, Hashable {
    let _id: String
    let _creationTime: Double?
    let text: String
    let isCompleted: Bool

    var id: String { _id }
}

@MainActor
final class ConvexService: ObservableObject {
    static let shared = ConvexService()

    @Published var todos: [ConvexTodo] = []
    @Published var lastError: String?

    private var cancellables = [AnyCancellable]()

    private init() {
        if !AppDeployment.isClerkEnabled {
            let client = ConvexClient(deploymentUrl: AppDeployment.convexURL)
            wireTasks(client: client)
        } else {
            let client = ConvexClientWithAuth(
                deploymentUrl: AppDeployment.convexURL,
                authProvider: ClerkConvexAuthProvider()
            )
            wireTasks(client: client)
        }
    }

    private func wireTasks(client: ConvexClient) {
        client.subscribe(to: "tasks:get", yielding: [ConvexTodo].self)
            .replaceError(with: [])
            .receive(on: DispatchQueue.main)
            .sink { [weak self] value in
                self?.todos = value
            }
            .store(in: &cancellables)
    }

    private func wireTasks(client: ConvexClientWithAuth<String>) {
        client.subscribe(to: "tasks:get", yielding: [ConvexTodo].self)
            .replaceError(with: [])
            .receive(on: DispatchQueue.main)
            .sink { [weak self] value in
                self?.todos = value
            }
            .store(in: &cancellables)
    }
}
