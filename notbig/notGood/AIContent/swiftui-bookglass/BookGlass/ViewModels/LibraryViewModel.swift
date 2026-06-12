import Foundation

@MainActor
final class LibraryViewModel: ObservableObject {
    @Published private(set) var books: [Book] = []

    private let storageKey = "book_library_v1"

    init() {
        load()
    }

    func add(_ book: Book) {
        guard !books.contains(where: { $0.id == book.id }) else { return }
        books.insert(book, at: 0)
        persist()
    }

    func remove(_ book: Book) {
        books.removeAll { $0.id == book.id }
        persist()
    }

    private func persist() {
        if let encoded = try? JSONEncoder().encode(books) {
            UserDefaults.standard.set(encoded, forKey: storageKey)
        }
    }

    private func load() {
        guard let data = UserDefaults.standard.data(forKey: storageKey),
              let decoded = try? JSONDecoder().decode([Book].self, from: data) else { return }
        books = decoded
    }
}
