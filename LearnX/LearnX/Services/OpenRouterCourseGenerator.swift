import Foundation

struct OpenRouterCourseGenerator {
    enum GeneratorError: LocalizedError {
        case missingAPIKey
        case invalidResponse

        var errorDescription: String? {
            switch self {
            case .missingAPIKey:
                return "Missing OpenRouter API key."
            case .invalidResponse:
                return "Invalid response from OpenRouter."
            }
        }
    }

    private let session: URLSession

    init(session: URLSession = .shared) {
        self.session = session
    }

    func generateCourse(from draft: CreateCourseViewModel) async throws -> CourseDetail {
        guard let apiKey = readAPIKey(), !apiKey.isEmpty else {
            throw GeneratorError.missingAPIKey
        }

        var request = URLRequest(url: URL(string: "https://openrouter.ai/api/v1/chat/completions")!)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(apiKey)", forHTTPHeaderField: "Authorization")
        request.setValue("https://learnx.local", forHTTPHeaderField: "HTTP-Referer")
        request.setValue("LearnX iOS", forHTTPHeaderField: "X-Title")

        let prompt = PromptBuilder.makePrompt(from: draft)
        let payload = OpenRouterRequest(
            model: "openai/gpt-4o-mini",
            messages: [
                .init(role: "system", content: PromptBuilder.systemPrompt),
                .init(role: "user", content: prompt)
            ],
            responseFormat: .init(type: "json_object"),
            temperature: 0.5
        )

        request.httpBody = try JSONEncoder().encode(payload)
        let (data, _) = try await session.data(for: request)
        let decoded = try JSONDecoder().decode(OpenRouterResponse.self, from: data)

        guard
            let content = decoded.choices.first?.message.content,
            let raw = content.data(using: .utf8)
        else {
            throw GeneratorError.invalidResponse
        }

        let generated = try JSONDecoder().decode(GeneratedCourse.self, from: raw)
        return generated.toCourseDetail(fallbackDraft: draft)
    }

    private func readAPIKey() -> String? {
        if let env = ProcessInfo.processInfo.environment["OPENROUTER_API_KEY"], !env.isEmpty {
            return env
        }
        return Bundle.main.object(forInfoDictionaryKey: "OPENROUTER_API_KEY") as? String
    }
}

private enum PromptBuilder {
    static let systemPrompt = """
    You generate educational course JSON for an iOS app.
    Return ONLY valid JSON matching the schema exactly.
    """

    static func makePrompt(from draft: CreateCourseViewModel) -> String {
        """
        Create a course for:
        - Topic: \(draft.topic)
        - Audience: \(draft.audience.rawValue)
        - Style: \(draft.style.rawValue)
        - Exercise types: \(draft.exerciseTypes.map(\.rawValue).sorted().joined(separator: ", "))

        JSON schema:
        {
          "title": "string <= 60 chars",
          "emoji": "single emoji",
          "estimatedMinutes": number,
          "lessons": [
            {
              "title": "string",
              "content": "2-4 short paragraphs",
              "keyPoints": ["string", "string", "string"],
              "exercises": [
                {
                  "type": "mcq|flashcard|fillIn|speaking|image|mixed",
                  "question": "string",
                  "options": ["string"],
                  "correctIndex": 0,
                  "answer": "string",
                  "explanation": "string"
                }
              ]
            }
          ]
        }

        Constraints:
        - Include 2 lessons.
        - Include 4-8 exercises per lesson.
        - Keep content safe for kids and schools.
        """
    }
}

private struct OpenRouterRequest: Encodable {
    struct Message: Encodable {
        let role: String
        let content: String
    }

    struct ResponseFormat: Encodable {
        let type: String

        enum CodingKeys: String, CodingKey {
            case type
        }
    }

    let model: String
    let messages: [Message]
    let responseFormat: ResponseFormat
    let temperature: Double

    enum CodingKeys: String, CodingKey {
        case model
        case messages
        case responseFormat = "response_format"
        case temperature
    }
}

private struct OpenRouterResponse: Decodable {
    struct Choice: Decodable {
        struct Message: Decodable {
            let content: String
        }

        let message: Message
    }

    let choices: [Choice]
}

private struct GeneratedCourse: Decodable {
    struct GeneratedLesson: Decodable {
        struct GeneratedExercise: Decodable {
            let type: String
            let question: String
            let options: [String]
            let correctIndex: Int?
            let answer: String
            let explanation: String
        }

        let title: String
        let content: String
        let keyPoints: [String]
        let exercises: [GeneratedExercise]
    }

    let title: String
    let emoji: String
    let estimatedMinutes: Int
    let lessons: [GeneratedLesson]

    func toCourseDetail(fallbackDraft: CreateCourseViewModel) -> CourseDetail {
        let safeTitle = title.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
            ? fallbackDraft.topic
            : String(title.prefix(60))

        let summary = CourseSummary(
            id: UUID(),
            title: safeTitle,
            emoji: emoji.isEmpty ? "✨" : emoji,
            style: fallbackDraft.style,
            audience: fallbackDraft.audience,
            isPublic: false,
            estimatedMinutes: max(estimatedMinutes, 5),
            progress: 0,
            averageScore: nil,
            views: nil
        )

        let lessonModels = lessons.enumerated().map { _, lesson in
            LessonDetail(
                id: UUID(),
                title: lesson.title,
                content: lesson.content,
                keyPoints: Array(lesson.keyPoints.prefix(5)),
                exercises: lesson.exercises.map { exercise in
                    CourseExercise(
                        id: UUID(),
                        type: CourseExerciseType(rawValue: exercise.type) ?? .mcq,
                        question: exercise.question,
                        options: exercise.options,
                        correctIndex: exercise.correctIndex,
                        answer: exercise.answer,
                        explanation: exercise.explanation
                    )
                }
            )
        }

        if lessonModels.isEmpty {
            return SampleCourseFactory.makeCourse(
                topic: fallbackDraft.topic,
                audience: fallbackDraft.audience,
                style: fallbackDraft.style,
                requestedTypes: fallbackDraft.exerciseTypes
            )
        }

        return CourseDetail(id: summary.id, summary: summary, lessons: lessonModels)
    }
}
