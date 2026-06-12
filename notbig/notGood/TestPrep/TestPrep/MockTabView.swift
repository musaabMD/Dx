import SwiftUI
import Combine

struct MockTabView: View {
    @Environment(AppState.self) private var appState
    @State private var introMock: MockExam?
    @State private var runningMock: MockExam?

    var body: some View {
        VStack(spacing: 0) {
            FixedScreenHeader(title: "Mock", showsBottomDivider: false)

            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    actionButtons
                }
                .padding(.horizontal, 16)
                .padding(.top, 10)
                .padding(.bottom, 24)
            }
            .background(AppTheme.bgTop)
        }
        .background(AppTheme.bgTop)
        .toolbar(.hidden, for: .navigationBar)
        .safeAreaInset(edge: .bottom) {
            startFloatingButton
        }
        .sheet(item: $introMock) { mock in
            MockExamIntroView(mockExam: mock) {
                introMock = nil
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.15) {
                    runningMock = mock
                }
            }
            .presentationDetents([.large])
            .presentationDragIndicator(.visible)
            .environment(appState)
        }
        .fullScreenCover(item: $runningMock) { mock in
            MockExamFullScreenView(mockExam: mock)
                .environment(appState)
        }
    }

    private var currentMock: MockExam {
        ensureMocksIfNeeded()
        return appState.mockExams.first ?? MockExam(examID: appState.selectedExam?.id ?? UUID(), name: "Mock Exam", duration: 3600, questionCount: 50, passingScore: 70)
    }

    private var actionButtons: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("History")
                .font(.headline.weight(.bold))
                .foregroundStyle(AppTheme.primaryText)

            NavigationLink(destination: MockHistoryView().environment(appState)) {
                actionButtonRow(
                    icon: "clock.arrow.circlepath",
                    title: "History",
                    subtitle: "Past mocks, score trends, pass/fail"
                )
            }
            .buttonStyle(.plain)

            NavigationLink(destination: MockAnalysisView().environment(appState)) {
                actionButtonRow(
                    icon: "chart.bar.doc.horizontal",
                    title: "Analysis",
                    subtitle: "Strengths, weaknesses, and score details"
                )
            }
            .buttonStyle(.plain)

            NavigationLink(destination: MockWhyUseItView()) {
                actionButtonRow(
                    icon: "sparkles",
                    title: "Why use it?",
                    subtitle: "See how mock exams improve score and confidence"
                )
            }
            .buttonStyle(.plain)
        }
    }

    private var startFloatingButton: some View {
        VStack(spacing: 0) {
            Divider().opacity(0.18)
            Button {
                ensureMocksIfNeeded()
                introMock = currentMock
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "play.fill")
                    Text("Start Mock Exam")
                        .fontWeight(.bold)
                }
                .foregroundStyle(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 14)
                .background(AppTheme.accentBlue.gradient)
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            }
            .padding(.horizontal, 16)
            .padding(.top, 10)
            .padding(.bottom, 10)
            .background(AppTheme.bgTop)
        }
    }

    @ViewBuilder
    private func actionButtonRow(icon: String, title: String, subtitle: String) -> some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 9, style: .continuous)
                    .fill(AppTheme.accentBlue.opacity(0.14))
                    .frame(width: 38, height: 38)
                Image(systemName: icon)
                    .foregroundStyle(AppTheme.accentBlue)
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(AppTheme.primaryText)
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(AppTheme.secondaryText)
                    .lineLimit(2)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.caption.weight(.bold))
                .foregroundStyle(AppTheme.secondaryText)
        }
        .padding(12)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(LinearGradient(colors: [AppTheme.surface.opacity(0.95), AppTheme.bgTop], startPoint: .topLeading, endPoint: .bottomTrailing))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(AppTheme.divider, lineWidth: 1)
        )
    }

    private func ensureMocksIfNeeded() {
        guard appState.mockExams.isEmpty else { return }
        let examID = appState.selectedExam?.id ?? appState.availableExams.first?.id ?? UUID()
        appState.mockExams = [
            MockExam(examID: examID, name: "Full Mock Exam", duration: 3600, questionCount: 50, passingScore: 70),
            MockExam(examID: examID, name: "Quick Mock", duration: 1800, questionCount: 25, passingScore: 70)
        ]
    }

}

private struct MockWhyUseItView: View {
    private let items: [(title: String, subtitle: String, image: String, tint: Color)] = [
        ("Real Exam Feel", "Timed, exam-style questions.", "rectangle.on.rectangle.angled", AppTheme.accentBlue),
        ("Instant Score Report", "See your score and performance breakdown.", "chart.line.uptrend.xyaxis", AppTheme.accentGreen),
        ("Clear Explanations", "Learn from every question.", "text.book.closed", AppTheme.flameOrange),
        ("Track Progress", "Spot weak areas and improve fast.", "scope", AppTheme.accentRed),
        ("Available Anytime", "Take it whenever you're ready.", "bolt.badge.clock", AppTheme.accentBlue)
    ]

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                ForEach(Array(items.enumerated()), id: \.offset) { _, item in
                    VStack(alignment: .leading, spacing: 10) {
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(
                                LinearGradient(
                                    colors: [item.tint.opacity(0.22), item.tint.opacity(0.08)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(height: 130)
                            .overlay {
                                Image(systemName: item.image)
                                    .font(.system(size: 54, weight: .semibold))
                                    .foregroundStyle(item.tint)
                            }

                        Text(item.title)
                            .font(.headline.weight(.bold))
                            .foregroundStyle(AppTheme.primaryText)

                        Text(item.subtitle)
                            .font(.subheadline)
                            .foregroundStyle(AppTheme.secondaryText)
                    }
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(AppTheme.surface.opacity(0.9))
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .stroke(AppTheme.divider, lineWidth: 1)
                    )
                }
            }
            .padding(16)
        }
        .background(AppTheme.bgTop)
        .navigationTitle("Why use it?")
        .navigationBarTitleDisplayMode(.inline)
    }
}

private struct MockExamIntroView: View {
    let mockExam: MockExam
    let onStart: () -> Void

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                Text("Before you start")
                    .font(.title2.weight(.bold))
                    .foregroundStyle(AppTheme.primaryText)

                VStack(alignment: .leading, spacing: 12) {
                    introRow(icon: "list.number", text: "\(mockExam.questionCount) questions")
                    introRow(icon: "clock.fill", text: "Time: \(durationText(mockExam.duration))")
                    introRow(icon: "target", text: "Passing score: \(mockExam.passingScore)%")
                    introRow(icon: "checkmark.seal", text: "Submit anytime if you finish early")
                    introRow(icon: "xmark.circle", text: "You can exit the exam from top-left")
                }
                .padding(14)
                .background(AppTheme.surface.opacity(0.95))
                .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(AppTheme.divider, lineWidth: 1)
                )

                Spacer()

                Button(action: onStart) {
                    Text("Start Exam")
                        .font(.headline.weight(.bold))
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(AppTheme.accentBlue)
                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                }
            }
            .padding(16)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            .background(AppTheme.bgTop)
            .navigationTitle(mockExam.name)
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func durationText(_ duration: TimeInterval) -> String {
        let minutes = Int(duration / 60)
        if minutes >= 60 {
            return "\(minutes / 60)h \(minutes % 60)m"
        }
        return "\(minutes)m"
    }

    @ViewBuilder
    private func introRow(icon: String, text: String) -> some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .foregroundStyle(AppTheme.accentBlue)
                .frame(width: 18)
            Text(text)
                .font(.subheadline)
                .foregroundStyle(AppTheme.primaryText)
        }
    }
}

private struct MockExamFullScreenView: View {
    @Environment(AppState.self) private var appState
    @Environment(\.dismiss) private var dismiss

    let mockExam: MockExam

    @State private var currentIndex = 0
    @State private var selectedAnswers: [UUID: Int] = [:]
    @State private var showExitAlert = false
    @State private var isSubmitted = false
    @State private var startDate = Date()
    @State private var remainingSeconds: Int = 0

    private let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()

    private var examQuestions: [Question] {
        let pool = appState.allQuestions
        guard !pool.isEmpty else { return [] }
        return Array(pool.prefix(mockExam.questionCount))
    }

    private var currentQuestion: Question? {
        guard currentIndex >= 0, currentIndex < examQuestions.count else { return nil }
        return examQuestions[currentIndex]
    }

    private var correctCount: Int {
        examQuestions.reduce(0) { acc, q in
            acc + ((selectedAnswers[q.id] == q.correctAnswerIndex) ? 1 : 0)
        }
    }

    private var scorePercent: Int {
        guard !examQuestions.isEmpty else { return 0 }
        return Int((Double(correctCount) / Double(examQuestions.count)) * 100)
    }

    private var isPassed: Bool {
        scorePercent >= mockExam.passingScore
    }

    var body: some View {
        NavigationStack {
            Group {
                if isSubmitted {
                    MockScoreResultView(
                        score: correctCount,
                        total: examQuestions.count,
                        percent: scorePercent,
                        passed: isPassed,
                        onDone: {
                            dismiss()
                        }
                    )
                } else if let question = currentQuestion {
                    VStack(spacing: 0) {
                        topMetaBar

                        ScrollView {
                            VStack(alignment: .leading, spacing: 14) {
                                Text(question.text)
                                    .font(.title3.weight(.semibold))
                                    .foregroundStyle(AppTheme.primaryText)

                                ForEach(Array(question.options.enumerated()), id: \.offset) { index, option in
                                    Button {
                                        selectedAnswers[question.id] = index
                                    } label: {
                                        HStack(alignment: .top, spacing: 10) {
                                            Text("\(index + 1).")
                                                .font(.subheadline.weight(.semibold))
                                                .foregroundStyle(AppTheme.secondaryText)

                                            Text(option)
                                                .font(.subheadline)
                                                .foregroundStyle(AppTheme.primaryText)
                                                .fixedSize(horizontal: false, vertical: true)

                                            Spacer(minLength: 0)

                                            if selectedAnswers[question.id] == index {
                                                Image(systemName: "checkmark.circle.fill")
                                                    .foregroundStyle(AppTheme.accentBlue)
                                            }
                                        }
                                        .padding(12)
                                        .background(selectedAnswers[question.id] == index ? AppTheme.accentBlue.opacity(0.12) : AppTheme.surface)
                                        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                                        .overlay(
                                            RoundedRectangle(cornerRadius: 12, style: .continuous)
                                                .stroke(selectedAnswers[question.id] == index ? AppTheme.accentBlue : AppTheme.divider, lineWidth: 1)
                                        )
                                    }
                                    .buttonStyle(.plain)
                                }
                            }
                            .padding(16)
                        }

                        bottomActions
                    }
                    .background(AppTheme.bgTop)
                } else {
                    ContentUnavailableView("No questions", systemImage: "exclamationmark.triangle")
                }
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Exit") {
                        showExitAlert = true
                    }
                }
                ToolbarItem(placement: .principal) {
                    Text("Mock Exam")
                        .font(.headline)
                        .foregroundStyle(AppTheme.primaryText)
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Text(timeText(remainingSeconds))
                        .font(.subheadline.weight(.semibold))
                        .monospacedDigit()
                        .foregroundStyle(AppTheme.accentBlue)
                }
            }
            .alert("Exit exam?", isPresented: $showExitAlert) {
                Button("Cancel", role: .cancel) {}
                Button("Exit", role: .destructive) {
                    dismiss()
                }
            } message: {
                Text("Your progress in this mock will be discarded.")
            }
            .onAppear {
                startDate = Date()
                remainingSeconds = Int(mockExam.duration)
            }
            .onReceive(timer) { _ in
                guard !isSubmitted else { return }
                guard remainingSeconds > 0 else {
                    submitExam()
                    return
                }
                remainingSeconds -= 1
            }
        }
    }

    private var topMetaBar: some View {
        HStack {
            Text("Question \(currentIndex + 1) / \(examQuestions.count)")
                .font(.caption.weight(.semibold))
                .foregroundStyle(AppTheme.secondaryText)
            Spacer()
            Text("Answered \(selectedAnswers.count)")
                .font(.caption.weight(.semibold))
                .foregroundStyle(AppTheme.secondaryText)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(AppTheme.surface.opacity(0.92))
        .overlay(alignment: .bottom) {
            Divider().opacity(0.2)
        }
    }

    private var bottomActions: some View {
        HStack(spacing: 10) {
            Button {
                currentIndex = max(0, currentIndex - 1)
            } label: {
                Label("Previous", systemImage: "chevron.left")
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            .disabled(currentIndex == 0)

            if currentIndex < examQuestions.count - 1 {
                Button {
                    currentIndex = min(examQuestions.count - 1, currentIndex + 1)
                } label: {
                    Label("Next", systemImage: "chevron.right")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(AppTheme.accentBlue)
            } else {
                Button {
                    submitExam()
                } label: {
                    Text("Submit Exam")
                        .frame(maxWidth: .infinity)
                }
                .buttonStyle(.borderedProminent)
                .tint(AppTheme.accentBlue)
            }
        }
        .padding(16)
        .background(AppTheme.bgBottom)
        .overlay(alignment: .top) {
            Divider().opacity(0.2)
        }
    }

    private func submitExam() {
        let spent = Date().timeIntervalSince(startDate)
        let result = MockExamResult(
            id: UUID(),
            mockExamID: mockExam.id,
            userID: appState.currentUser?.id ?? UUID(),
            score: correctCount,
            totalQuestions: examQuestions.count,
            timeSpent: spent,
            date: Date(),
            passed: isPassed,
            answers: examQuestions.reduce(into: [UUID: AnswerRecord]()) { dict, q in
                guard let selected = selectedAnswers[q.id] else { return }
                dict[q.id] = AnswerRecord(
                    questionID: q.id,
                    selectedAnswerIndex: selected,
                    isCorrect: selected == q.correctAnswerIndex,
                    timeSpent: spent / Double(max(1, examQuestions.count)),
                    isFlagged: false,
                    timestamp: Date()
                )
            }
        )
        appState.saveMockResult(result)
        isSubmitted = true
    }

    private func timeText(_ totalSeconds: Int) -> String {
        let m = max(0, totalSeconds) / 60
        let s = max(0, totalSeconds) % 60
        return String(format: "%02d:%02d", m, s)
    }
}

private struct MockScoreResultView: View {
    let score: Int
    let total: Int
    let percent: Int
    let passed: Bool
    let onDone: () -> Void

    var body: some View {
        VStack(spacing: 16) {
            Spacer()

            Image(systemName: passed ? "checkmark.seal.fill" : "xmark.seal.fill")
                .font(.system(size: 54, weight: .bold))
                .foregroundStyle(passed ? AppTheme.accentGreen : AppTheme.accentRed)

            Text("Exam Completed")
                .font(.title2.weight(.bold))

            Text("\(score) / \(total)")
                .font(.title.weight(.bold))
                .foregroundStyle(AppTheme.primaryText)

            Text("\(percent)% • \(passed ? "Passed" : "Failed")")
                .font(.headline)
                .foregroundStyle(passed ? AppTheme.accentGreen : AppTheme.accentRed)

            Button(action: onDone) {
                Text("Done")
                    .font(.headline.weight(.bold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
                    .background(AppTheme.accentBlue)
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            }
            .padding(.top, 8)

            Spacer()
        }
        .padding(20)
        .background(AppTheme.bgTop)
    }
}

private struct MockHistoryView: View {
    @Environment(AppState.self) private var appState
    @State private var selectedResult: MockExamResult?

    private var rows: [MockExamResult] {
        if appState.mockResults.isEmpty {
            return sampleHistory
        }
        return appState.mockResults.sorted { $0.date > $1.date }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                Text("Scores Over Time")
                    .font(.headline.weight(.bold))

                MockScoreTrendChart(results: rows)
                    .frame(height: 260)
                    .padding(12)
                    .background(AppTheme.surface.opacity(0.95))
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .stroke(AppTheme.divider, lineWidth: 1)
                    )

                ForEach(rows) { result in
                    Button {
                        selectedResult = result
                    } label: {
                        HStack(spacing: 10) {
                            VStack(alignment: .leading, spacing: 3) {
                                Text(result.date.formatted(date: .abbreviated, time: .omitted))
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundStyle(AppTheme.primaryText)
                                Text("Tap for details")
                                    .font(.caption)
                                    .foregroundStyle(AppTheme.secondaryText)
                            }

                            Spacer()

                            Text("\(Int(result.percentage))%")
                                .font(.headline.weight(.bold))
                                .foregroundStyle(.white)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(scoreColor(Int(result.percentage)))
                                .clipShape(Capsule())
                        }
                        .padding(12)
                        .background(AppTheme.surface.opacity(0.95))
                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .stroke(AppTheme.divider, lineWidth: 1)
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(16)
        }
        .background(AppTheme.bgTop)
        .navigationTitle("Mock History")
        .navigationBarTitleDisplayMode(.inline)
        .sheet(item: $selectedResult) { result in
            MockHistoryDetailView(result: result, allQuestions: appState.allQuestions, availableExams: appState.availableExams)
        }
    }

    private func durationText(_ duration: TimeInterval) -> String {
        let minutes = Int(duration / 60)
        if minutes >= 60 {
            return "\(minutes / 60)h \(minutes % 60)m"
        }
        return "\(minutes)m"
    }

    private func scoreColor(_ percent: Int) -> Color {
        if percent >= 86 { return AppTheme.accentGreen }
        if percent >= 61 { return AppTheme.flameOrange }
        return AppTheme.accentRed
    }

    private var sampleHistory: [MockExamResult] {
        let dateNow = Date()
        return [
            MockExamResult(id: UUID(), mockExamID: UUID(), userID: UUID(), score: 34, totalQuestions: 50, timeSpent: 3300, date: dateNow.addingTimeInterval(-86400 * 9), passed: false, answers: [:]),
            MockExamResult(id: UUID(), mockExamID: UUID(), userID: UUID(), score: 38, totalQuestions: 50, timeSpent: 3220, date: dateNow.addingTimeInterval(-86400 * 6), passed: true, answers: [:]),
            MockExamResult(id: UUID(), mockExamID: UUID(), userID: UUID(), score: 41, totalQuestions: 50, timeSpent: 3180, date: dateNow.addingTimeInterval(-86400 * 3), passed: true, answers: [:]),
            MockExamResult(id: UUID(), mockExamID: UUID(), userID: UUID(), score: 44, totalQuestions: 50, timeSpent: 3050, date: dateNow.addingTimeInterval(-86400), passed: true, answers: [:])
        ]
    }
}

private struct MockAnalysisView: View {
    @Environment(AppState.self) private var appState

    private struct SubjectScore: Identifiable {
        let id = UUID()
        let name: String
        let correct: Int
        let answered: Int

        var percent: Int {
            guard answered > 0 else { return 0 }
            return Int((Double(correct) / Double(answered)) * 100)
        }

        var incorrect: Int {
            max(0, answered - correct)
        }
    }

    private var history: [MockExamResult] {
        appState.mockResults
    }

    private var aggregateCorrect: Int {
        history.reduce(0) { $0 + $1.answers.values.filter { $0.isCorrect }.count }
    }

    private var aggregateTotal: Int {
        history.reduce(0) { $0 + $1.answers.count }
    }

    private var totalQuestionsAsked: Int {
        history.reduce(0) { $0 + $1.totalQuestions }
    }

    private var totalSkipped: Int {
        max(0, totalQuestionsAsked - aggregateTotal)
    }

    private var totalTimeSpent: TimeInterval {
        history.reduce(0) { $0 + $1.timeSpent }
    }

    private var aggregatePercent: Int {
        guard totalQuestionsAsked > 0 else { return 0 }
        return Int((Double(aggregateCorrect) / Double(totalQuestionsAsked)) * 100)
    }

    private var subjectScores: [SubjectScore] {
        guard !history.isEmpty else {
            return [
                SubjectScore(name: "Anatomy", correct: 17, answered: 25),
                SubjectScore(name: "Physiology", correct: 14, answered: 25),
                SubjectScore(name: "Pharmacology", correct: 10, answered: 20)
            ]
        }

        var questionMap: [UUID: Question] = [:]
        for question in appState.allQuestions {
            questionMap[question.id] = question
        }

        var bucket: [String: (correct: Int, answered: Int)] = [:]

        for result in history {
            for record in result.answers.values {
                guard let q = questionMap[record.questionID] else { continue }
                let key = subjectName(for: q.subjectID)
                let previous = bucket[key, default: (0, 0)]
                bucket[key] = (
                    correct: previous.correct + (record.isCorrect ? 1 : 0),
                    answered: previous.answered + 1
                )
            }
        }

        return bucket.map { entry in
            SubjectScore(name: entry.key, correct: entry.value.correct, answered: entry.value.answered)
        }
        .sorted { $0.percent > $1.percent }
    }

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 14) {
                overallScoreCard

                VStack(alignment: .leading, spacing: 8) {
                    Text("Subjects")
                        .font(.headline.weight(.bold))
                        .foregroundStyle(AppTheme.primaryText)

                    ForEach(Array(subjectScores.enumerated()), id: \.element.id) { index, subject in
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text("\(index + 1)")
                                    .font(.caption.weight(.bold))
                                    .foregroundStyle(.white)
                                    .frame(width: 24, height: 24)
                                    .background(AppTheme.accentBlue)
                                    .clipShape(Circle())

                                Text(subject.name)
                                    .font(.subheadline.weight(.semibold))
                                    .foregroundStyle(AppTheme.primaryText)
                                Spacer()
                                Text("\(subject.percent)%")
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(subjectColor(for: subject.percent))
                            }

                            HStack(spacing: 8) {
                                subjectChip(icon: "checkmark.circle.fill", text: "\(subject.correct)", tint: AppTheme.accentGreen)
                                subjectChip(icon: "xmark.circle.fill", text: "\(subject.incorrect)", tint: AppTheme.accentRed)
                                subjectChip(icon: "questionmark.circle.fill", text: "Questions \(subject.answered)", tint: AppTheme.secondaryText)
                            }

                            GeometryReader { geo in
                                let width = max(0, min(1, Double(subject.percent) / 100.0)) * geo.size.width
                                RoundedRectangle(cornerRadius: 5, style: .continuous)
                                    .fill(AppTheme.bgTop)
                                    .overlay(alignment: .leading) {
                                        RoundedRectangle(cornerRadius: 5, style: .continuous)
                                            .fill(subjectColor(for: subject.percent))
                                            .frame(width: width)
                                    }
                            }
                            .frame(height: 8)
                        }
                        .padding(12)
                        .background(AppTheme.surface.opacity(0.95))
                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .stroke(AppTheme.divider, lineWidth: 1)
                        )
                    }
                }
            }
            .padding(16)
        }
        .background(AppTheme.bgTop)
        .navigationTitle("Mock Analysis")
        .navigationBarTitleDisplayMode(.inline)
    }

    private var overallScoreCard: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text("Overall Score")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.white.opacity(0.9))

            Text("\(aggregatePercent)%")
                .font(.system(size: 38, weight: .heavy, design: .rounded))
                .foregroundStyle(.white)

            Text("Based on all past mock exams")
                .font(.caption)
                .foregroundStyle(.white.opacity(0.9))

            HStack(spacing: 8) {
                subjectChip(icon: "questionmark.circle.fill", text: "Questions \(totalQuestionsAsked)", tint: .white)
                    .background(.white.opacity(0.18))
                    .clipShape(Capsule())
                subjectChip(icon: "checkmark.circle.fill", text: "\(aggregateCorrect)", tint: .white)
                    .background(.white.opacity(0.18))
                    .clipShape(Capsule())
                subjectChip(icon: "xmark.circle.fill", text: "\(max(aggregateTotal - aggregateCorrect, 0))", tint: .white)
                    .background(.white.opacity(0.18))
                    .clipShape(Capsule())
                subjectChip(icon: "minus.circle.fill", text: "\(totalSkipped)", tint: .white)
                    .background(.white.opacity(0.18))
                    .clipShape(Capsule())
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(scoreColor(for: aggregatePercent))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
    }

    private func subjectName(for subjectID: UUID) -> String {
        for exam in appState.availableExams {
            if let subject = exam.subjects.first(where: { $0.id == subjectID }) {
                return subject.name
            }
        }
        return "General"
    }

    @ViewBuilder
    private func subjectChip(icon: String, text: String, tint: Color) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
            Text(text)
        }
        .font(.caption2.weight(.semibold))
        .foregroundStyle(tint)
        .padding(.horizontal, 8)
        .padding(.vertical, 4)
        .background(tint.opacity(0.12))
        .clipShape(Capsule())
    }

    private func subjectColor(for percent: Int) -> Color {
        if percent >= 86 { return AppTheme.accentGreen }
        if percent >= 61 { return AppTheme.flameOrange }
        return AppTheme.accentRed
    }

    private func scoreColor(for percent: Int) -> Color {
        if percent < 60 { return AppTheme.accentRed }
        if percent <= 85 { return AppTheme.flameOrange }
        return AppTheme.accentGreen
    }

    private func durationText(_ duration: TimeInterval) -> String {
        let totalMinutes = Int(duration / 60)
        if totalMinutes >= 60 {
            return "\(totalMinutes / 60)h \(totalMinutes % 60)m"
        }
        return "\(totalMinutes)m"
    }
}

private struct MockHistoryDetailView: View {
    let result: MockExamResult
    let allQuestions: [Question]
    let availableExams: [Exam]

    private struct SubjectDetail: Identifiable {
        let id = UUID()
        let name: String
        let correct: Int
        let answered: Int
        var percent: Int {
            guard answered > 0 else { return 0 }
            return Int((Double(correct) / Double(answered)) * 100)
        }
    }

    private var subjectBreakdown: [SubjectDetail] {
        var questionMap: [UUID: Question] = [:]
        allQuestions.forEach { questionMap[$0.id] = $0 }

        var bucket: [String: (correct: Int, answered: Int)] = [:]
        for record in result.answers.values {
            guard let q = questionMap[record.questionID] else { continue }
            let name = subjectName(for: q.subjectID)
            let prev = bucket[name, default: (0, 0)]
            bucket[name] = (prev.correct + (record.isCorrect ? 1 : 0), prev.answered + 1)
        }

        return bucket.map { SubjectDetail(name: $0.key, correct: $0.value.correct, answered: $0.value.answered) }
            .sorted { $0.percent > $1.percent }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 12) {
                    VStack(alignment: .leading, spacing: 6) {
                        Text(result.date.formatted(date: .abbreviated, time: .omitted))
                            .font(.headline.weight(.bold))
                            .foregroundStyle(AppTheme.primaryText)
                        Text("Overall Score")
                            .font(.caption)
                            .foregroundStyle(AppTheme.secondaryText)
                        Text("\(Int(result.percentage))%")
                            .font(.system(size: 34, weight: .heavy, design: .rounded))
                            .foregroundStyle(scoreColor(for: Int(result.percentage)))
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(AppTheme.surface.opacity(0.95))
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(AppTheme.divider, lineWidth: 1)
                    )

                    Text("Score per subject")
                        .font(.headline.weight(.bold))
                        .foregroundStyle(AppTheme.primaryText)

                    ForEach(Array(subjectBreakdown.enumerated()), id: \.element.id) { index, item in
                        VStack(alignment: .leading, spacing: 6) {
                            HStack {
                                Text("\(index + 1)")
                                    .font(.caption.weight(.bold))
                                    .foregroundStyle(.white)
                                    .frame(width: 22, height: 22)
                                    .background(AppTheme.accentBlue)
                                    .clipShape(Circle())
                                Text(item.name)
                                    .font(.subheadline.weight(.semibold))
                                Spacer()
                                Text("\(item.percent)%")
                                    .font(.caption.weight(.semibold))
                                    .foregroundStyle(scoreColor(for: item.percent))
                            }

                            ProgressView(value: Double(item.percent) / 100.0)
                                .tint(scoreColor(for: item.percent))

                            HStack(spacing: 8) {
                                detailChip("C \(item.correct)", tint: AppTheme.accentGreen)
                                detailChip("Q \(item.answered)", tint: AppTheme.secondaryText)
                            }
                        }
                        .padding(12)
                        .background(AppTheme.surface.opacity(0.95))
                        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                        .overlay(
                            RoundedRectangle(cornerRadius: 14, style: .continuous)
                                .stroke(AppTheme.divider, lineWidth: 1)
                        )
                    }
                }
                .padding(16)
            }
            .background(AppTheme.bgTop)
            .navigationTitle("Exam Details")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    private func subjectName(for subjectID: UUID) -> String {
        for exam in availableExams {
            if let subject = exam.subjects.first(where: { $0.id == subjectID }) {
                return subject.name
            }
        }
        return "General"
    }

    private func scoreColor(for percent: Int) -> Color {
        if percent < 60 { return AppTheme.accentRed }
        if percent <= 85 { return AppTheme.flameOrange }
        return AppTheme.accentGreen
    }

    @ViewBuilder
    private func detailChip(_ text: String, tint: Color) -> some View {
        Text(text)
            .font(.caption2.weight(.semibold))
            .foregroundStyle(tint)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(tint.opacity(0.12))
            .clipShape(Capsule())
    }
}

private struct MockScoreTrendChart: View {
    let results: [MockExamResult]

    var body: some View {
        VStack(spacing: 6) {
            HStack(spacing: 0) {
                VStack(spacing: 0) {
                    ForEach([100, 75, 50, 25, 0], id: \.self) { val in
                        Text("\(val)")
                            .font(.caption2)
                            .foregroundStyle(AppTheme.secondaryText)
                            .frame(height: 34, alignment: .center)
                    }
                }
                .frame(width: 28)

                GeometryReader { geo in
                    let points = normalizedPoints(in: geo.size)
                    ZStack(alignment: .bottomLeading) {
                        RoundedRectangle(cornerRadius: 8)
                            .fill(AppTheme.bgTop)

                        ForEach([0.0, 0.25, 0.5, 0.75, 1.0], id: \.self) { fraction in
                            Rectangle()
                                .fill(AppTheme.divider.opacity(0.45))
                                .frame(height: 1)
                                .offset(y: geo.size.height * CGFloat(1 - fraction))
                        }

                        Path { path in
                            guard !points.isEmpty else { return }
                            path.move(to: points[0])
                            for p in points.dropFirst() {
                                path.addLine(to: p)
                            }
                        }
                        .stroke(AppTheme.accentBlue, style: StrokeStyle(lineWidth: 2.5, lineCap: .round, lineJoin: .round))

                        ForEach(Array(points.enumerated()), id: \.offset) { index, point in
                            ZStack {
                                Circle()
                                    .fill(AppTheme.accentBlue)
                                    .frame(width: 8, height: 8)
                                Text("\(Int(sortedResults[index].percentage))")
                                    .font(.caption2.weight(.bold))
                                    .foregroundStyle(AppTheme.primaryText)
                                    .offset(y: -14)
                            }
                            .position(point)
                        }
                    }
                }
            }
            .frame(height: 175)

            HStack(spacing: 0) {
                Spacer().frame(width: 28)
                ForEach(sortedResults.indices, id: \.self) { idx in
                    Text(sortedResults[idx].date.formatted(.dateTime.month(.abbreviated).day()))
                        .font(.caption2)
                        .foregroundStyle(AppTheme.secondaryText)
                        .frame(maxWidth: .infinity)
                }
            }
        }
    }

    private var sortedResults: [MockExamResult] {
        results.sorted { $0.date < $1.date }
    }

    private func normalizedPoints(in size: CGSize) -> [CGPoint] {
        guard !sortedResults.isEmpty else { return [] }
        let scores = sortedResults.map { CGFloat($0.percentage) }
        let minScore: CGFloat = 0
        let maxScore: CGFloat = 100
        let xStep = sortedResults.count > 1 ? size.width / CGFloat(sortedResults.count - 1) : size.width / 2

        return scores.enumerated().map { index, score in
            let x = CGFloat(index) * xStep
            let normalized = (score - minScore) / (maxScore - minScore)
            let y = size.height - (normalized * (size.height - 10)) - 5
            return CGPoint(x: x, y: y)
        }
    }
}

private struct PassingChanceCard: View {
    let score: Int

    private struct Band: Identifiable {
        let id = UUID()
        let title: String
        let range: ClosedRange<Int>
        let color: Color
    }

    private var bands: [Band] {
        [
            Band(title: "Low", range: 0...39, color: AppTheme.accentRed),
            Band(title: "Borderline", range: 40...59, color: AppTheme.flameOrange),
            Band(title: "High", range: 60...79, color: AppTheme.accentBlue),
            Band(title: "Very High", range: 80...100, color: AppTheme.accentGreen)
        ]
    }

    private var selectedBandTitle: String {
        bands.first(where: { $0.range.contains(score) })?.title ?? "Low"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack {
                Text("Chance of passing")
                    .font(.headline.weight(.bold))
                    .foregroundStyle(AppTheme.primaryText)
                Spacer()
                Text("\(score)% • \(selectedBandTitle)")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(AppTheme.secondaryText)
            }

            GeometryReader { geo in
                let clamped = max(0, min(100, score))
                let x = CGFloat(clamped) / 100.0 * geo.size.width

                VStack(spacing: 6) {
                    HStack(spacing: 0) {
                        ForEach(bands) { band in
                            Rectangle()
                                .fill(band.color.opacity(0.85))
                        }
                    }
                    .frame(height: 14)
                    .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))

                    HStack(spacing: 0) {
                        ForEach(bands) { band in
                            Text(band.title)
                                .font(.caption2.weight(.semibold))
                                .foregroundStyle(AppTheme.secondaryText)
                                .frame(maxWidth: .infinity)
                        }
                    }
                }
                .overlay(alignment: .topLeading) {
                    Image(systemName: "arrowtriangle.down.fill")
                        .font(.caption)
                        .foregroundStyle(AppTheme.primaryText)
                        .offset(x: max(0, min(geo.size.width - 10, x - 5)), y: -12)
                }
            }
            .frame(height: 40)
        }
        .padding(12)
        .background(AppTheme.surface.opacity(0.95))
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(AppTheme.divider, lineWidth: 1)
        )
    }
}

#Preview {
    NavigationStack { MockTabView().environment(AppState()) }
}
