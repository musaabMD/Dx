import Foundation

struct OpenRouterService {
    private let endpoint = URL(string: "https://openrouter.ai/api/v1/chat/completions")!
    private let model = "openai/gpt-4o-mini"

    func generateSummary(for book: Book) async throws -> String {
        let prompt = """
        Give a clean, engaging summary of this book in 6-10 short paragraphs.
        Include: core theme, key ideas, and who should read it.

        Title: \(book.title)
        Authors: \(book.authorsText)
        Description: \(book.description)
        """

        return try await send(messages: [
            .init(role: "system", content: "You summarize books clearly and accurately."),
            .init(role: "user", content: prompt)
        ])
    }

    func chat(book: Book, history: [ChatMessage]) async throws -> String {
        var messages: [Message] = [
            .init(
                role: "system",
                content: "You are a helpful reading companion. Discuss only this book with grounded, practical insights."
            ),
            .init(
                role: "system",
                content: "Book context: Title=\(book.title), Authors=\(book.authorsText), Description=\(book.description)"
            )
        ]

        messages.append(contentsOf: history.map { .init(role: $0.role.rawValue, content: $0.content) })

        return try await send(messages: messages)
    }

    private func send(messages: [Message]) async throws -> String {
        var request = URLRequest(url: endpoint)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(AppConfig.openRouterAPIKey)", forHTTPHeaderField: "Authorization")

        let body = RequestBody(model: model, messages: messages, temperature: 0.7)
        request.httpBody = try JSONEncoder().encode(body)

        let (data, response) = try await URLSession.shared.data(for: request)
        guard let http = response as? HTTPURLResponse, (200..<300).contains(http.statusCode) else {
            let serverError = String(data: data, encoding: .utf8) ?? "Unknown error"
            throw NSError(domain: "OpenRouter", code: 1, userInfo: [NSLocalizedDescriptionKey: serverError])
        }

        let decoded = try JSONDecoder().decode(OpenRouterResponse.self, from: data)
        return decoded.choices.first?.message.content.trimmingCharacters(in: .whitespacesAndNewlines) ?? "No response"
    }
}

private struct RequestBody: Encodable {
    let model: String
    let messages: [Message]
    let temperature: Double
}

private struct Message: Codable {
    let role: String
    let content: String
}

private struct OpenRouterResponse: Decodable {
    let choices: [Choice]
}

private struct Choice: Decodable {
    let message: Message
}
