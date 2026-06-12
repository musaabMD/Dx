import Foundation

struct GoogleBooksService {
    func searchBooks(query: String) async throws -> [Book] {
        let trimmed = query.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !trimmed.isEmpty else { return [] }

        var components = URLComponents(string: "https://www.googleapis.com/books/v1/volumes")!
        components.queryItems = [
            URLQueryItem(name: "q", value: trimmed),
            URLQueryItem(name: "maxResults", value: "20"),
            URLQueryItem(name: "key", value: AppConfig.googleBooksAPIKey)
        ]

        let (data, response) = try await URLSession.shared.data(from: components.url!)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw URLError(.badServerResponse)
        }

        let decoded = try JSONDecoder().decode(GoogleBooksResponse.self, from: data)
        return (decoded.items ?? []).map {
            Book(
                id: $0.id,
                title: $0.volumeInfo.title,
                authors: $0.volumeInfo.authors ?? [],
                description: $0.volumeInfo.description ?? "No description available.",
                thumbnailURL: $0.volumeInfo.imageLinks?.thumbnail
            )
        }
    }
}
