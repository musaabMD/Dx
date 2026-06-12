import Foundation

struct GoogleBooksService {
    func searchBooks(query: String) async throws -> [Book] {
        guard !query.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            return []
        }

        let encoded = query.addingPercentEncoding(withAllowedCharacters: .urlQueryAllowed) ?? query
        let rawKey = Secrets.googleBooksAPIKey.trimmingCharacters(in: .whitespacesAndNewlines)
        let hasUsableKey = !rawKey.isEmpty && !rawKey.hasPrefix("PASTE_")

        var requestURLs: [URL] = []
        if hasUsableKey {
            if let keyedURL = URL(string: "https://www.googleapis.com/books/v1/volumes?q=\(encoded)&maxResults=20&key=\(rawKey)") {
                requestURLs.append(keyedURL)
            }
        }
        if let noKeyURL = URL(string: "https://www.googleapis.com/books/v1/volumes?q=\(encoded)&maxResults=20") {
            requestURLs.append(noKeyURL)
        }
        guard !requestURLs.isEmpty else {
            throw APIError.invalidURL
        }

        var lastError: Error = APIError.badResponse
        for requestURL in requestURLs {
            do {
                let (data, response) = try await URLSession.shared.data(from: requestURL)
                guard let http = response as? HTTPURLResponse else {
                    lastError = APIError.badResponse
                    continue
                }

                guard (200..<300).contains(http.statusCode) else {
                    let apiMessage = parseGoogleErrorMessage(from: data) ?? "HTTP \(http.statusCode)"
                    lastError = APIError.serverError("Google Books: \(apiMessage)")
                    continue
                }

                let decoded = try JSONDecoder().decode(GoogleBooksResponse.self, from: data)
                return decoded.items?.compactMap { item in
                    guard let info = item.volumeInfo else { return nil }
                    let secureThumbnail = secureThumbnailURLString(info.imageLinks?.thumbnail)
                    return Book(
                        id: item.id,
                        title: info.title ?? "Untitled",
                        authors: info.authors ?? [],
                        description: info.description ?? "No description available.",
                        thumbnailURL: URL(string: secureThumbnail ?? "")
                    )
                } ?? []
            } catch {
                lastError = error
            }
        }

        throw lastError
    }

    private func parseGoogleErrorMessage(from data: Data) -> String? {
        let decoded = try? JSONDecoder().decode(GoogleAPIErrorResponse.self, from: data)
        return decoded?.error.message
    }

    private func secureThumbnailURLString(_ raw: String?) -> String? {
        guard let raw, !raw.isEmpty else { return nil }
        if raw.hasPrefix("http://") {
            return "https://" + raw.dropFirst("http://".count)
        }
        return raw
    }
}

enum APIError: LocalizedError {
    case invalidURL
    case badResponse
    case missingKey
    case serverError(String)

    var errorDescription: String? {
        switch self {
        case .invalidURL: return "Invalid URL"
        case .badResponse: return "The server returned an invalid response"
        case .missingKey: return "Missing API key in Secrets.swift"
        case .serverError(let message): return message
        }
    }
}

private struct GoogleBooksResponse: Codable {
    let items: [GoogleBookItem]?
}

private struct GoogleBookItem: Codable {
    let id: String
    let volumeInfo: GoogleVolumeInfo?
}

private struct GoogleVolumeInfo: Codable {
    let title: String?
    let authors: [String]?
    let description: String?
    let imageLinks: GoogleImageLinks?
}

private struct GoogleImageLinks: Codable {
    let thumbnail: String?
}

private struct GoogleAPIErrorResponse: Codable {
    let error: GoogleAPIErrorBody
}

private struct GoogleAPIErrorBody: Codable {
    let message: String
}
