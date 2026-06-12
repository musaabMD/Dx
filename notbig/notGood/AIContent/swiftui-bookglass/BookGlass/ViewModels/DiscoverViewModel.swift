import Foundation

@MainActor
final class DiscoverViewModel: ObservableObject {
    @Published var query = ""
    @Published private(set) var results: [Book] = []
    @Published private(set) var isLoading = false
    @Published var errorMessage: String?

    private let service = GoogleBooksService()

    func search() async {
        guard !query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            results = []
            return
        }

        isLoading = true
        errorMessage = nil
        defer { isLoading = false }

        do {
            results = try await service.searchBooks(query: query)
        } catch {
            errorMessage = error.localizedDescription
        }
    }
}
