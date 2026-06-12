import Foundation

struct OpenRouterService {
    func discoverBooks(query: String) async throws -> [Book] {
        let prompt = """
        Return ONLY a JSON array (no markdown) of up to 12 real books matching this query: "\(query)".
        Each item must follow:
        {
          "title": "string",
          "authors": ["string"],
          "description": "short summary"
        }
        """

        let response = try await callChat(
            system: "You are a books discovery assistant. Return valid JSON only.",
            user: prompt
        )

        guard let json = extractJSONArray(from: response) else {
            throw APIError.serverError("OpenRouter returned invalid JSON for discovery")
        }

        let items = try JSONDecoder().decode([DiscoveredBook].self, from: json)
        return items.enumerated().map { index, item in
            Book(
                id: "\(item.title)-\(item.authors.joined(separator: ","))-\(index)",
                title: item.title,
                authors: item.authors,
                description: item.description,
                thumbnailURL: nil
            )
        }
    }

    func summarize(book: Book) async throws -> String {
        let prompt = """
        Create a concise, engaging summary of this book in under 180 words.

        Title: \(book.title)
        Author(s): \(book.authorLine)
        Description: \(book.description)
        """
        return try await callChat(system: "You are a helpful book summarizer.", user: prompt)
    }

    func chat(book: Book, summary: String, messages: [ChatMessage]) async throws -> String {
        let transcript = messages.map { "\($0.role.rawValue.capitalized): \($0.text)" }.joined(separator: "\n")
        let userPrompt = """
        Book context:
        Title: \(book.title)
        Author(s): \(book.authorLine)
        Summary: \(summary)

        Conversation so far:
        \(transcript)

        Continue as a thoughtful reading companion.
        """
        return try await callChat(system: "You are a book companion that discusses themes, characters, and ideas clearly.", user: userPrompt)
    }

    private func callChat(system: String, user: String) async throws -> String {
        let key = Secrets.openRouterAPIKey
        guard !key.hasPrefix("PASTE_") else {
            throw APIError.missingKey
        }

        guard let url = URL(string: "https://openrouter.ai/api/v1/chat/completions") else {
            throw APIError.invalidURL
        }

        let body = OpenRouterRequest(
            model: Secrets.openRouterModel,
            messages: [
                .init(role: "system", content: system),
                .init(role: "user", content: user)
            ],
            temperature: 0.7
        )

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(key)", forHTTPHeaderField: "Authorization")
        request.setValue("https://aibooks.local", forHTTPHeaderField: "HTTP-Referer")
        request.setValue("aibooks", forHTTPHeaderField: "X-Title")
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            throw APIError.badResponse
        }

        let decoded = try JSONDecoder().decode(OpenRouterResponse.self, from: data)
        return decoded.choices.first?.message.content.trimmingCharacters(in: .whitespacesAndNewlines) ?? "No response"
    }

    private func extractJSONArray(from text: String) -> Data? {
        guard let start = text.firstIndex(of: "["), let end = text.lastIndex(of: "]"), start <= end else {
            return nil
        }
        let jsonString = String(text[start...end])
        return jsonString.data(using: .utf8)
    }
}

private struct OpenRouterRequest: Codable {
    let model: String
    let messages: [OpenRouterMessage]
    let temperature: Double
}

private struct OpenRouterMessage: Codable {
    let role: String
    let content: String
}

private struct OpenRouterResponse: Codable {
    let choices: [OpenRouterChoice]
}

private struct OpenRouterChoice: Codable {
    let message: OpenRouterMessage
}

private struct DiscoveredBook: Codable {
    let title: String
    let authors: [String]
    let description: String
}
