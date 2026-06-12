import Foundation

struct Book: Identifiable, Codable, Hashable {
    let id: String
    let title: String
    let authors: [String]
    let description: String
    let thumbnailURL: URL?

    var authorLine: String {
        authors.isEmpty ? "Unknown Author" : authors.joined(separator: ", ")
    }

    var secureThumbnailURL: URL? {
        guard let thumbnailURL else { return nil }
        guard thumbnailURL.scheme?.lowercased() == "http" else { return thumbnailURL }
        var components = URLComponents(url: thumbnailURL, resolvingAgainstBaseURL: false)
        components?.scheme = "https"
        return components?.url ?? thumbnailURL
    }
}

struct ChatMessage: Identifiable, Codable, Hashable {
    let id: UUID
    let role: Role
    let text: String

    enum Role: String, Codable {
        case user
        case assistant
    }

    init(id: UUID = UUID(), role: Role, text: String) {
        self.id = id
        self.role = role
        self.text = text
    }
}
