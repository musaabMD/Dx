// StudySessionViewModel.swift
// MVVM: mock session, review filters, analysis, HY flashcards.

import Foundation
import SwiftUI
import Combine

final class StudySessionViewModel: ObservableObject {

    /// Active exam product (matches catalog).
    @Published var activeExam: PreparedExam = .firefighterIAndIIExamPrep

    @Published private(set) var blueprint: [BlueprintSubjectWeight] = []
    @Published private(set) var questionBank: [MockQuestion] = []
    private var questionsById: [String: MockQuestion] = [:]
    @Published private(set) var contentSource = "Bundled seed"
    @Published private(set) var contentStatusMessage: String?
    @Published private(set) var isLoadingCloudContent = false

    // MARK: Mock session (in progress)

    @Published var mockSessionActive = false
    @Published var mockQuestionOrder: [MockQuestion] = []
    @Published var currentMockIndex: Int = 0
    @Published var selectedChoiceIndex: Int? = nil
    @Published var answers: [Int?] = []
    @Published var flaggedIndices: Set<Int> = []
    @Published var secondsRemaining: Int = 0
    @Published var mockInstructionsAccepted = false

    private var mockTimer: Timer?

    // MARK: After grading

    @Published private(set) var lastGradedStates: [GradedQuestionState] = []
    @Published private(set) var pastAttempts: [MockAttemptRecord] = []

    @Published var reviewFilter: ReviewFilter = .all

    // MARK: HY flashcards (by blueprint topic)

    @Published var hyFlashcards: [HYFlashcard] = []

    /// Main tab selection (0 Mock … 4 Profile).
    @Published var selectedTab: Int = 0

    let examDurationMinutes = 120

    private static let hyBookmarkKey = "hyFlashcardBookmarkIds"
    private let cloudService = CloudKitExamService()
    private let contentCache = ExamContentCache()

    init() {
        reloadExamContent()
    }

    func reloadExamContent() {
        applyContent(
            ExamContentBundle(
                exam: activeExam,
                questions: MockContentData.mockQuestions,
                attempts: MockContentData.sampleAttempts(for: activeExam)
            ),
            source: "Bundled seed"
        )
    }

    @MainActor
    func loadCloudContentIfAvailable() async {
        guard !isLoadingCloudContent else { return }
        isLoadingCloudContent = true
        contentStatusMessage = "Checking iCloud content..."
        defer { isLoadingCloudContent = false }

        do {
            let bundle = try await cloudService.fetchContentBundle()
            applyContent(bundle, source: "CloudKit")
            try? contentCache.save(bundle)
            contentStatusMessage = nil
        } catch CloudKitExamError.noExamContent {
            let seed = ExamContentBundle(
                exam: .firefighterIAndIIExamPrep,
                questions: MockContentData.mockQuestions,
                attempts: []
            )
            try? await cloudService.seedIfEmpty(with: seed)
            applyContent(seed, source: "Bundled seed")
            try? contentCache.save(seed)
            contentStatusMessage = "Using bundled seed until CloudKit content is approved."
        } catch {
            if let cached = try? contentCache.load() {
                applyContent(cached, source: "Offline cache")
                contentStatusMessage = "Offline cache loaded. \(error.localizedDescription)"
            } else {
                reloadExamContent()
                contentStatusMessage = error.localizedDescription
            }
        }
    }

    private func applyContent(_ bundle: ExamContentBundle, source: String) {
        activeExam = bundle.exam
        blueprint = MockContentData.blueprint(for: bundle.exam)
        questionBank = bundle.questions
        questionsById = Dictionary(uniqueKeysWithValues: questionBank.map { ($0.id, $0) })
        pastAttempts = bundle.attempts.isEmpty ? MockContentData.sampleAttempts(for: bundle.exam) : bundle.attempts
        hyFlashcards = MockContentData.makeFlashcards(from: questionBank)
        contentSource = source
        applyHYBookmarkFlags()
    }

    private func applyHYBookmarkFlags() {
        let saved = Set(UserDefaults.standard.stringArray(forKey: Self.hyBookmarkKey) ?? [])
        for i in hyFlashcards.indices {
            var c = hyFlashcards[i]
            c.isBookmarked = saved.contains(c.id)
            hyFlashcards[i] = c
        }
    }

    func cards(forSubjectId subjectId: String) -> [HYFlashcard] {
        hyFlashcards.filter { $0.subjectId == subjectId }.sorted { $0.questionId < $1.questionId }
    }

    func cardCount(forSubjectId subjectId: String) -> Int {
        cards(forSubjectId: subjectId).count
    }

    func question(forQuestionId id: String) -> MockQuestion? {
        questionsById[id]
    }

    func subjectName(forSubjectId id: String) -> String {
        blueprint.first { $0.id == id }?.name ?? id
    }

    /// HY search: summary, subject title, or question stem.
    func hyFlashcards(matching search: String) -> [HYFlashcard] {
        let q = search.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !q.isEmpty else { return hyFlashcards }
        return hyFlashcards.filter { card in
            if card.summary.lowercased().contains(q) { return true }
            if subjectName(forSubjectId: card.subjectId).lowercased().contains(q) { return true }
            if let stem = question(forQuestionId: card.questionId)?.stem.lowercased(), stem.contains(q) { return true }
            return false
        }
    }

    func toggleHYBookmark(cardId: String) {
        guard let idx = hyFlashcards.firstIndex(where: { $0.id == cardId }) else { return }
        hyFlashcards[idx].isBookmarked.toggle()
        var saved = Set(UserDefaults.standard.stringArray(forKey: Self.hyBookmarkKey) ?? [])
        if hyFlashcards[idx].isBookmarked {
            saved.insert(cardId)
        } else {
            saved.remove(cardId)
        }
        UserDefaults.standard.set(Array(saved), forKey: Self.hyBookmarkKey)
    }

    // MARK: Mock lifecycle

    func prepareMockSession(isPremiumUnlocked: Bool) {
        let availableQuestions = isPremiumUnlocked ? questionBank : Array(questionBank.prefix(5))
        mockQuestionOrder = availableQuestions.shuffled()
        currentMockIndex = 0
        answers = Array(repeating: nil, count: mockQuestionOrder.count)
        flaggedIndices = []
        selectedChoiceIndex = nil
        secondsRemaining = examDurationMinutes * 60
    }

    func beginMockExam(isPremiumUnlocked: Bool) {
        prepareMockSession(isPremiumUnlocked: isPremiumUnlocked)
        mockSessionActive = true
        startTimer()
    }

    func endMockExam(saveAttempt: Bool) {
        mockTimer?.invalidate()
        mockTimer = nil
        mockSessionActive = false
        gradeSession()
        if saveAttempt {
            persistAttempt()
        }
    }

    private func startTimer() {
        mockTimer?.invalidate()
        mockTimer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in
            guard let self else { return }
            if self.secondsRemaining > 0 {
                self.secondsRemaining -= 1
            } else {
                self.endMockExam(saveAttempt: true)
            }
        }
        RunLoop.main.add(mockTimer!, forMode: .common)
    }

    private func gradeSession() {
        lastGradedStates = mockQuestionOrder.enumerated().map { i, q in
            GradedQuestionState(
                questionId: q.id,
                selectedIndex: answers.indices.contains(i) ? answers[i] : nil,
                isFlagged: flaggedIndices.contains(i)
            )
        }
    }

    private func persistAttempt() {
        let total = mockQuestionOrder.count
        guard total > 0 else { return }
        var correct = 0
        var bySubject: [String: (right: Int, total: Int)] = [:]
        for (i, q) in mockQuestionOrder.enumerated() {
            bySubject[q.subjectId, default: (0, 0)].total += 1
            let sel = answers.indices.contains(i) ? answers[i] : nil
            if sel == q.correctIndex {
                correct += 1
                bySubject[q.subjectId, default: (0, 0)].right += 1
            }
        }
        let subjectPerformance: [String: Int] = Dictionary(uniqueKeysWithValues: bySubject.map { id, pair in
            let pct = pair.total > 0 ? Int(round(Double(pair.right) / Double(pair.total) * 100)) : 0
            return (id, pct)
        })
        let pct = Int(round(Double(correct) / Double(total) * 100))
        let durationSeconds = max(0, examDurationMinutes * 60 - secondsRemaining)
        let record = MockAttemptRecord(
            id: UUID(),
            date: Date(),
            durationSeconds: durationSeconds,
            scorePercent: pct,
            correct: correct,
            total: total,
            subjectPerformance: subjectPerformance
        )
        pastAttempts.insert(record, at: 0)

        let examID = activeExam.id
        let states = lastGradedStates
        Task {
            try? await cloudService.saveAttempt(record, examID: examID, states: states)
        }
    }

    // MARK: During exam

    var currentQuestion: MockQuestion? {
        guard mockQuestionOrder.indices.contains(currentMockIndex) else { return nil }
        return mockQuestionOrder[currentMockIndex]
    }

    func syncSelectionFromAnswers() {
        guard answers.indices.contains(currentMockIndex) else {
            selectedChoiceIndex = nil
            return
        }
        selectedChoiceIndex = answers[currentMockIndex]
    }

    func selectChoice(_ index: Int) {
        selectedChoiceIndex = index
        guard answers.indices.contains(currentMockIndex) else { return }
        answers[currentMockIndex] = index
    }

    func toggleFlagCurrent() {
        if flaggedIndices.contains(currentMockIndex) {
            flaggedIndices.remove(currentMockIndex)
        } else {
            flaggedIndices.insert(currentMockIndex)
        }
    }

    var isCurrentFlagged: Bool {
        flaggedIndices.contains(currentMockIndex)
    }

    func goToPrevious() {
        guard currentMockIndex > 0 else { return }
        currentMockIndex -= 1
        syncSelectionFromAnswers()
    }

    func goToNext() {
        guard currentMockIndex < mockQuestionOrder.count - 1 else { return }
        currentMockIndex += 1
        syncSelectionFromAnswers()
    }

    func jumpToQuestion(_ index: Int) {
        guard mockQuestionOrder.indices.contains(index) else { return }
        currentMockIndex = index
        syncSelectionFromAnswers()
    }

    // MARK: Review

    func filteredReviewItems() -> [(index: Int, question: MockQuestion, state: GradedQuestionState)] {
        guard !lastGradedStates.isEmpty else { return [] }
        let paired = lastGradedStates.enumerated().compactMap { i, state -> (Int, MockQuestion, GradedQuestionState)? in
            guard let q = questionsById[state.questionId] else { return nil }
            return (i, q, state)
        }
        return paired.filter { _, q, state in
            let correct = state.isCorrect(questionsById: questionsById)
            switch reviewFilter {
            case .all: return true
            case .flagged: return state.isFlagged
            case .incorrect: return !correct
            case .correct: return correct
            }
        }
    }

    func questionNumberDisplay(forOrderIndex i: Int) -> Int {
        i + 1
    }

    // MARK: Analysis

    var bookmarkedHYFlashcards: [HYFlashcard] {
        hyFlashcards.filter(\.isBookmarked)
    }

    /// Oldest → newest (for trend charts).
    var attemptsChronological: [MockAttemptRecord] {
        pastAttempts.sorted { $0.date < $1.date }
    }

    /// Latest mock vs the one before it for a blueprint area (nil if fewer than two attempts).
    func subjectScoreDeltaSincePrevious(subjectId: String) -> Int? {
        let ch = attemptsChronological
        guard ch.count >= 2 else { return nil }
        let last = ch[ch.count - 1]
        let prev = ch[ch.count - 2]
        return (last.subjectPerformance[subjectId] ?? 0) - (prev.subjectPerformance[subjectId] ?? 0)
    }

    func latestSubjectPercent(subjectId: String) -> Int {
        pastAttempts.first?.subjectPerformance[subjectId] ?? 0
    }
}
