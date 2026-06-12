import Foundation

enum SampleCourseFactory {
    nonisolated static func makeCourse(from summary: CourseSummary, requestedTypes: Set<RequestedExerciseType>) -> CourseDetail {
        let exerciseKinds = exerciseKinds(from: requestedTypes)

        let lessons: [LessonDetail] = [
            LessonDetail(
                id: UUID(),
                title: "Foundations",
                content: """
                \(summary.title) is easiest to learn when you start with a tight mental model, then practice with targeted questions.

                In this lesson, you’ll learn the core vocabulary and the 3–5 ideas you should be able to explain out loud by the end.
                """,
                keyPoints: [
                    "Define the goal in one sentence.",
                    "Learn the 3–5 core terms first.",
                    "Practice retrieval, not re-reading.",
                ],
                exercises: exercises(for: summary.title, kinds: exerciseKinds, seed: 1)
            ),
            LessonDetail(
                id: UUID(),
                title: "Application",
                content: """
                Now that you have the foundations, this lesson focuses on applying them to a realistic scenario.

                You’ll answer questions that mirror how you’d actually use this knowledge in the wild.
                """,
                keyPoints: [
                    "Translate concepts into decisions.",
                    "Catch common misconceptions early.",
                    "Review mistakes with explanations.",
                ],
                exercises: exercises(for: summary.title, kinds: exerciseKinds, seed: 2)
            ),
        ]

        return CourseDetail(id: summary.id, summary: summary, lessons: lessons)
    }

    nonisolated static func makeCourse(
        topic: String,
        audience: CourseAudience,
        style: CourseStyle,
        requestedTypes: Set<RequestedExerciseType>
    ) -> CourseDetail {
        let trimmedTitle = title(from: topic)
        let summary = CourseSummary(
            id: UUID(),
            title: trimmedTitle,
            emoji: emoji(for: trimmedTitle),
            style: style,
            audience: audience,
            isPublic: false,
            estimatedMinutes: max(12, 2 * 10),
            progress: 0,
            averageScore: nil,
            views: nil
        )
        return makeCourse(from: summary, requestedTypes: requestedTypes)
    }

    nonisolated private static func title(from topic: String) -> String {
        let trimmed = topic.trimmingCharacters(in: .whitespacesAndNewlines)
        if trimmed.count <= 60 { return trimmed }
        return String(trimmed.prefix(57)) + "…"
    }

    nonisolated private static func emoji(for topic: String) -> String {
        let t = topic.lowercased()
        if t.contains("spanish") || t.contains("french") || t.contains("language") { return "🗣️" }
        if t.contains("python") || t.contains("swift") || t.contains("code") { return "🐍" }
        if t.contains("ecg") || t.contains("heart") { return "🫀" }
        if t.contains("history") || t.contains("rome") { return "🏛️" }
        if t.contains("math") { return "➗" }
        return "✨"
    }

    nonisolated private static func exerciseKinds(from requested: Set<RequestedExerciseType>) -> [CourseExerciseType] {
        var kinds: [CourseExerciseType] = []
        if requested.contains(.mcq) { kinds.append(.mcq) }
        if requested.contains(.flashcard) { kinds.append(.flashcard) }
        if requested.contains(.fillIn) { kinds.append(.fillIn) }
        if requested.contains(.speaking) { kinds.append(.speaking) }
        if requested.contains(.image) { kinds.append(.image) }
        if requested.contains(.mixed) { kinds.append(.mixed) }

        if kinds.isEmpty { kinds = [.mcq, .flashcard] }
        return kinds
    }

    nonisolated private static func exercises(for title: String, kinds: [CourseExerciseType], seed: Int) -> [CourseExercise] {
        kinds.enumerated().map { idx, kind in
            switch kind {
            case .mcq:
                CourseExercise(
                    id: UUID(),
                    type: .mcq,
                    question: "Which practice most improves retention for \(title)?",
                    options: [
                        "Passively re-reading notes",
                        "Spaced retrieval practice",
                        "Highlighting everything",
                        "Watching long lectures only",
                    ],
                    correctIndex: 1,
                    answer: "Spaced retrieval practice",
                    explanation: "Retrieval strengthens memory more than re-exposure alone."
                )
            case .flashcard:
                CourseExercise(
                    id: UUID(),
                    type: .flashcard,
                    question: "Front: Active recall",
                    options: [],
                    correctIndex: nil,
                    answer: "Back: Testing yourself with questions (not re-reading) to strengthen memory.",
                    explanation: "Flip cards are a lightweight way to practice retrieval."
                )
            case .fillIn:
                CourseExercise(
                    id: UUID(),
                    type: .fillIn,
                    question: "Fill in the blank: The best first step is to define your ______ in one sentence.",
                    options: [],
                    correctIndex: nil,
                    answer: "goal",
                    explanation: "A crisp goal keeps generation and practice aligned."
                )
            case .speaking:
                CourseExercise(
                    id: UUID(),
                    type: .speaking,
                    question: "Say aloud: “My goal for \(title) is to learn the core terms and apply them to one real scenario.”",
                    options: [],
                    correctIndex: nil,
                    answer: "goal",
                    explanation: "Speaking forces clarity—if you stumble, simplify your goal."
                )
            case .image:
                CourseExercise(
                    id: UUID(),
                    type: .image,
                    question: "Imagine a diagram of \(title). Which question should you answer first?",
                    options: [
                        "What is the most advanced detail?",
                        "What is the simplest definition?",
                        "What font should notes use?",
                        "How long should the course be?",
                    ],
                    correctIndex: 1,
                    answer: "What is the simplest definition?",
                    explanation: "Start with the simplest model, then add complexity."
                )
            case .mixed:
                CourseExercise(
                    id: UUID(),
                    type: .mixed,
                    question: "Mixed check (\(seed).\(idx + 1)): What should you do after missing a question?",
                    options: [
                        "Ignore it",
                        "Read the explanation and retry later",
                        "Stop studying",
                        "Change topics immediately",
                    ],
                    correctIndex: 1,
                    answer: "Read the explanation and retry later",
                    explanation: "Mistakes are data—use explanations to update your mental model."
                )
            }
        }
    }
}
