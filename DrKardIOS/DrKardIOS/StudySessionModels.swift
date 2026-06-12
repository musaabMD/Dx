// StudySessionModels.swift
// Data models for mock exams, review, analysis, and HY flashcards.

import Foundation

/// One subject row with blueprint weight (share of exam).
struct BlueprintSubjectWeight: Identifiable, Hashable, Codable {
    let id: String
    let name: String
    let questionCount: Int
    /// 0...1 fraction of total blueprint.
    var weightFraction: Double
}

/// Single practice question (mock / review).
struct MockQuestion: Identifiable, Hashable, Codable {
    let id: String
    let stem: String
    let choices: [String]
    let correctIndex: Int
    let subjectId: String
    let explanation: String
}

enum ReviewFilter: String, CaseIterable, Identifiable {
    case all = "All"
    case flagged = "Flagged"
    case incorrect = "Incorrect"
    case correct = "Correct"

    var id: String { rawValue }
}

/// Per-question state after a mock ends.
struct GradedQuestionState: Identifiable, Hashable, Codable {
    var id: String { questionId }
    let questionId: String
    var selectedIndex: Int?
    var isFlagged: Bool

    func isCorrect(questionsById: [String: MockQuestion]) -> Bool {
        guard let selectedIndex,
              let q = questionsById[questionId] else { return false }
        return q.correctIndex == selectedIndex
    }
}

/// Saved mock attempt for analysis charts.
struct MockAttemptRecord: Identifiable, Hashable, Codable {
    let id: UUID
    let date: Date
    /// Time spent on the exam, in seconds (from start until submit or time expired).
    let durationSeconds: Int
    let scorePercent: Int
    let correct: Int
    let total: Int
    /// Subject id -> percent correct (0...100)
    let subjectPerformance: [String: Int]
}

/// High-yield flashcard: summary on the front, full MCQ on expand (same `questionId` as bank).
struct HYFlashcard: Identifiable, Hashable, Codable {
    let id: String
    let questionId: String
    let subjectId: String
    /// One-line recap for fast review.
    let summary: String
    var isBookmarked: Bool
    /// Optional SF Symbol shown on the card (e.g. diagram / topic hint).
    var imageSystemName: String?
}
