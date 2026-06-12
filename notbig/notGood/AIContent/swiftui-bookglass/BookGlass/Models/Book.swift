import Foundation

struct Book: Codable, Identifiable, Hashable {
    let id: String
    let title: String
    let authors: [String]
    let description: String
    let thumbnailURL: String?

    var authorsText: String {
        authors.isEmpty ? "Unknown Author" : authors.joined(separator: ", ")
    }
}
