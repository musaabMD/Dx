import SwiftUI

struct PracticeTabView: View {
    @Environment(AppState.self) private var appState
    @State private var selectedSection: PracticeSection = .subjects
    @State private var searchText = ""
    @State private var selectedMetric: PracticeMetric?

    enum PracticeSection: String, CaseIterable, Identifiable {
        case subjects = "Subjects"
        case tags = "Tags"
        case flashcards = "Flashcards"

        var id: String { rawValue }

        var icon: String {
            switch self {
            case .subjects: return "square.grid.2x2.fill"
            case .tags: return "tag.fill"
            case .flashcards: return "rectangle.stack.fill"
            }
        }
    }

    struct PracticeMetric: Identifiable, Hashable {
        var id: String { "\(name)|\(detail)" }
        let name: String
        let detail: String
        let score: Int
        let progress: Double
        let tint: Color
        let correctCount: Int?
        let totalCount: Int?
    }

    var body: some View {
        VStack(spacing: 0) {
            FixedScreenHeader(title: "Practice", showsBottomDivider: false)

            VStack(spacing: 0) {
                modernTabBar
                    .padding(.horizontal, 16)
                    .padding(.top, 10)
                    .padding(.bottom, 6)

                searchField
                    .padding(.horizontal, 16)
                    .padding(.bottom, 6)

                TabView(selection: $selectedSection) {
                    metricsPage(section: .subjects, items: subjectMetrics, emptyTitle: "No subjects available", emptyIcon: "folder")
                        .tag(PracticeSection.subjects)

                    metricsPage(section: .tags, items: tagMetrics, emptyTitle: "No tags found", emptyIcon: "tag")
                        .tag(PracticeSection.tags)

                    metricsPage(section: .flashcards, items: flashcardMetrics, emptyTitle: "No flashcards yet", emptyIcon: "rectangle.stack")
                        .tag(PracticeSection.flashcards)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
            .background(AppTheme.bgTop)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .top)
        .background(AppTheme.bgTop)
        .toolbar(.hidden, for: .navigationBar)
        .sheet(item: $selectedMetric) { metric in
            PracticeMetricDetailSheet(
                section: selectedSection,
                metric: metric,
                relatedQuestions: relatedQuestions(for: metric, in: selectedSection)
            )
        }
    }

    private var modernTabBar: some View {
        HStack(spacing: 8) {
            ForEach(PracticeSection.allCases) { section in
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        selectedSection = section
                    }
                } label: {
                    HStack(spacing: 6) {
                        Image(systemName: section.icon)
                            .font(.subheadline.weight(.bold))
                        Text(section.rawValue)
                            .font(.subheadline.weight(.semibold))
                    }
                    .foregroundStyle(selectedSection == section ? .white : AppTheme.primaryText)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 11)
                    .background(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .fill(selectedSection == section ? AppTheme.accentBlue : AppTheme.surface.opacity(0.82))
                    )
                    .overlay(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .stroke(selectedSection == section ? AppTheme.accentBlue : AppTheme.divider.opacity(0.65), lineWidth: 1)
                    )
                }
                .buttonStyle(.plain)
                .accessibilityLabel(section.rawValue)
            }
        }
    }

    private var searchField: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .foregroundStyle(AppTheme.secondaryText)

            TextField("Search practice", text: $searchText)
                .textInputAutocapitalization(.never)
                .autocorrectionDisabled(true)

            if !searchText.isEmpty {
                Button {
                    searchText = ""
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(AppTheme.secondaryText)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(10)
        .background(AppTheme.surface.opacity(0.82))
        .clipShape(RoundedRectangle(cornerRadius: 10))
        .overlay(
            RoundedRectangle(cornerRadius: 10)
                .stroke(AppTheme.divider, lineWidth: 1)
        )
    }

    private var examSubjects: [Subject] {
        appState.selectedExam?.subjects ?? []
    }

    private var examQuestionPool: [Question] {
        guard let exam = appState.selectedExam else { return appState.allQuestions }
        let subjectIDs = Set(exam.subjects.map(\.id))
        return appState.allQuestions.filter { subjectIDs.contains($0.subjectID) }
    }

    private var answersByQuestionID: [UUID: AnswerRecord] {
        appState.currentSession?.answers ?? [:]
    }

    private var allTagsWithCount: [(tag: String, count: Int)] {
        let tags = examQuestionPool.flatMap(\.tags)
        let counts = Dictionary(grouping: tags, by: { $0 }).mapValues(\.count)
        return counts.sorted { lhs, rhs in
            if lhs.value == rhs.value { return lhs.key < rhs.key }
            return lhs.value > rhs.value
        }
        .map { (tag: $0.key, count: $0.value) }
    }

    private var subjectMetrics: [PracticeMetric] {
        return examSubjects.map { subject in
            let questions = examQuestionPool.filter { $0.subjectID == subject.id }
            let total = max(subject.questionCount, questions.count)
            let stats = correctAndTotal(for: questions, fallbackTotal: total)
            return PracticeMetric(
                name: subject.name,
                detail: "\(stats.correct) of \(stats.total) Correct",
                score: stats.score,
                progress: Double(stats.score) / 100.0,
                tint: Color.scoreColor(stats.score),
                correctCount: stats.correct,
                totalCount: stats.total
            )
        }
    }

    private var tagMetrics: [PracticeMetric] {
        return allTagsWithCount.map { item in
            let taggedQuestions = examQuestionPool.filter { $0.tags.contains(item.tag) }
            let stats = correctAndTotal(for: taggedQuestions, fallbackTotal: item.count)
            return PracticeMetric(
                name: item.tag.capitalized,
                detail: "\(stats.correct) of \(stats.total) Correct",
                score: stats.score,
                progress: Double(stats.score) / 100.0,
                tint: Color.scoreColor(stats.score),
                correctCount: stats.correct,
                totalCount: stats.total
            )
        }
    }

    private var flashcardMetrics: [PracticeMetric] {
        let pool = examQuestionPool.isEmpty ? appState.allQuestions : examQuestionPool
        let decks = Question.Difficulty.allCases.compactMap { difficulty -> PracticeMetric? in
            let questions = pool.filter { $0.difficulty == difficulty }
            guard !questions.isEmpty else { return nil }
            let stats = scoreAndProgress(for: questions, fallbackTotal: questions.count)
            return PracticeMetric(
                name: "\(difficulty.rawValue) Deck",
                detail: "\(questions.count) cards",
                score: stats.score,
                progress: stats.progress,
                tint: Color.scoreColor(stats.score),
                correctCount: nil,
                totalCount: nil
            )
        }
        return decks
    }

    private func correctAndTotal(for questions: [Question], fallbackTotal: Int) -> (correct: Int, total: Int, score: Int) {
        let total = max(1, fallbackTotal)
        guard !questions.isEmpty else { return (0, total, 0) }
        let questionIDs = Set(questions.map(\.id))
        let relevantAnswers = answersByQuestionID.values.filter { questionIDs.contains($0.questionID) }
        let correct = relevantAnswers.filter(\.isCorrect).count
        let score = Int((Double(correct) / Double(total) * 100).rounded())
        return (correct, total, score)
    }

    private func scoreAndProgress(for questions: [Question], fallbackTotal: Int) -> (score: Int, progress: Double) {
        let total = max(1, fallbackTotal)
        guard !questions.isEmpty else { return (0, 0) }
        let questionIDs = Set(questions.map(\.id))
        let relevantAnswers = answersByQuestionID.values.filter { questionIDs.contains($0.questionID) }
        guard !relevantAnswers.isEmpty else { return (0, 0) }
        let correct = relevantAnswers.filter(\.isCorrect).count
        let score = Int((Double(correct) / Double(relevantAnswers.count)) * 100)
        let progress = min(1, Double(relevantAnswers.count) / Double(total))
        return (score, progress)
    }
    private func metricsPage(section: PracticeSection, items: [PracticeMetric], emptyTitle: String, emptyIcon: String) -> some View {
        let filtered = filteredItems(items)

        return ScrollView {
            if filtered.isEmpty {
                ContentUnavailableView(emptyTitle, systemImage: emptyIcon)
                    .padding(.top, 48)
            } else {
                VStack(spacing: 12) {
                    HStack {
                        Text(section.rawValue)
                            .font(.headline.weight(.semibold))
                            .foregroundStyle(AppTheme.primaryText)

                        Spacer()

                        Text("\(filtered.count)")
                            .font(.subheadline.weight(.semibold))
                            .monospacedDigit()
                            .foregroundStyle(AppTheme.secondaryText)
                    }
                    .padding(.horizontal, 2)
                    .padding(.bottom, 2)

                    ForEach(filtered) { item in
                        Button {
                            selectedMetric = item
                        } label: {
                            MetricCard(item: item, section: section)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 6)
                .padding(.bottom, 20)
            }
        }
    }

    private func filteredItems(_ items: [PracticeMetric]) -> [PracticeMetric] {
        guard !searchText.isEmpty else { return items }
        return items.filter { item in
            item.name.localizedCaseInsensitiveContains(searchText) ||
            item.detail.localizedCaseInsensitiveContains(searchText)
        }
    }

    private func relatedQuestions(for metric: PracticeMetric, in section: PracticeSection) -> [Question] {
        switch section {
        case .subjects:
            if let subject = examSubjects.first(where: { $0.name == metric.name }) {
                return examQuestionPool.filter { $0.subjectID == subject.id }
            }
            return []
        case .tags:
            let normalized = metric.name.lowercased()
            return examQuestionPool.filter { q in
                q.tags.contains(where: { $0.lowercased() == normalized })
            }
        case .flashcards:
            if metric.name.hasPrefix(Question.Difficulty.easy.rawValue) {
                return examQuestionPool.filter { $0.difficulty == .easy }
            }
            if metric.name.hasPrefix(Question.Difficulty.medium.rawValue) {
                return examQuestionPool.filter { $0.difficulty == .medium }
            }
            if metric.name.hasPrefix(Question.Difficulty.hard.rawValue) {
                return examQuestionPool.filter { $0.difficulty == .hard }
            }
            return []
        }
    }
}

private struct MetricCard: View {
    let item: PracticeTabView.PracticeMetric
    let section: PracticeTabView.PracticeSection

    var body: some View {
        if section == .subjects || section == .tags {
            VStack(alignment: .leading, spacing: 10) {
                HStack(alignment: .firstTextBaseline) {
                    Text(item.name)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundStyle(AppTheme.primaryText)
                        .lineLimit(1)
                        .minimumScaleFactor(0.9)

                    Spacer(minLength: 10)

                    Text("\(item.score)%")
                        .font(.system(size: 18, weight: .medium))
                        .foregroundStyle(AppTheme.primaryText)
                        .monospacedDigit()
                }

                Text(item.detail)
                    .font(.system(size: 16, weight: .regular))
                    .foregroundStyle(AppTheme.secondaryText)
                    .lineLimit(1)

                GeometryReader { geometry in
                    let totalWidth = max(0, geometry.size.width)
                    let fillWidth = totalWidth * max(0, min(1, item.progress))
                    ZStack(alignment: .leading) {
                        Capsule(style: .continuous)
                            .fill(AppTheme.divider.opacity(0.95))
                        Capsule(style: .continuous)
                            .fill(item.tint)
                            .frame(width: fillWidth)
                    }
                }
                .frame(height: 9)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 10)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(AppTheme.surface.opacity(0.95))
            .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(AppTheme.divider, lineWidth: 1)
            )
        } else {
            VStack(alignment: .leading, spacing: 11) {
                HStack(alignment: .firstTextBaseline, spacing: 10) {
                    Text(item.name)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(AppTheme.primaryText)
                        .fixedSize(horizontal: false, vertical: true)

                    Spacer()

                    Text("\(item.score)%")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(item.tint)
                }

                Text(item.detail)
                    .font(.caption)
                    .foregroundStyle(AppTheme.secondaryText)
                    .fixedSize(horizontal: false, vertical: true)

                VStack(alignment: .leading, spacing: 6) {
                    HStack {
                        Text("Progress")
                            .font(.caption2.weight(.semibold))
                            .foregroundStyle(AppTheme.secondaryText)
                        Spacer()
                        Text("\(Int(item.progress * 100))%")
                            .font(.caption2.weight(.bold))
                            .foregroundStyle(item.tint)
                            .monospacedDigit()
                    }
                    GeometryReader { geometry in
                        let totalWidth = max(0, geometry.size.width)
                        let fillWidth = totalWidth * max(0, min(1, item.progress))
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 5, style: .continuous)
                                .fill(AppTheme.divider.opacity(0.45))
                            RoundedRectangle(cornerRadius: 5, style: .continuous)
                                .fill(
                                    LinearGradient(
                                        colors: [item.tint.opacity(0.65), item.tint],
                                        startPoint: .leading,
                                        endPoint: .trailing
                                    )
                                )
                                .frame(width: fillWidth)
                        }
                    }
                    .frame(height: 10)
                }
            }
            .padding(13)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(AppTheme.surface.opacity(0.95))
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(item.tint.opacity(0.2), lineWidth: 1)
            )
        }
    }
}

private struct PracticeMetricDetailSheet: View {
    let section: PracticeTabView.PracticeSection
    let metric: PracticeTabView.PracticeMetric
    let relatedQuestions: [Question]

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 14) {
                    VStack(alignment: .leading, spacing: 8) {
                        Text(metric.name)
                            .font(.title3.weight(.bold))
                            .foregroundStyle(AppTheme.primaryText)
                        Text(metric.detail)
                            .font(.subheadline)
                            .foregroundStyle(AppTheme.secondaryText)

                        HStack(spacing: 10) {
                            chip("Score \(metric.score)%", tint: metric.tint)
                            chip("Progress \(Int(metric.progress * 100))%", tint: AppTheme.accentBlue)
                            chip(section.rawValue, tint: AppTheme.flameOrange)
                        }
                    }
                    .padding(14)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(AppTheme.surface.opacity(0.95))
                    .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                            .stroke(AppTheme.divider, lineWidth: 1)
                    )

                    if section == .flashcards {
                        FlashcardDeckView(cards: relatedQuestions)
                    } else if relatedQuestions.isEmpty {
                        ContentUnavailableView("No linked questions", systemImage: "doc.text.magnifyingglass")
                            .padding(.top, 30)
                    } else {
                        Text("Questions")
                            .font(.headline.weight(.bold))
                            .foregroundStyle(AppTheme.primaryText)

                        ForEach(Array(relatedQuestions.prefix(12).enumerated()), id: \.element.id) { index, question in
                            HStack(alignment: .top, spacing: 8) {
                                Text("\(index + 1).")
                                    .font(.caption.weight(.bold))
                                    .foregroundStyle(AppTheme.accentBlue)

                                Text(question.text)
                                    .font(.caption)
                                    .foregroundStyle(AppTheme.primaryText)
                                    .fixedSize(horizontal: false, vertical: true)

                                Spacer(minLength: 0)
                            }
                            .padding(10)
                            .background(AppTheme.surface.opacity(0.95))
                            .clipShape(RoundedRectangle(cornerRadius: 10, style: .continuous))
                            .overlay(
                                RoundedRectangle(cornerRadius: 10, style: .continuous)
                                    .stroke(AppTheme.divider, lineWidth: 1)
                            )
                        }
                    }
                }
                .padding(16)
            }
            .background(AppTheme.bgTop)
            .navigationTitle("Practice Detail")
            .navigationBarTitleDisplayMode(.inline)
        }
    }

    @ViewBuilder
    private func chip(_ text: String, tint: Color) -> some View {
        Text(text)
            .font(.caption.weight(.semibold))
            .foregroundStyle(tint)
            .padding(.horizontal, 9)
            .padding(.vertical, 6)
            .background(tint.opacity(0.12))
            .clipShape(Capsule())
    }
}

private struct FlashcardDeckView: View {
    let cards: [Question]

    @State private var currentIndex = 0
    @State private var showBack = false

    private var currentCard: Question? {
        guard !cards.isEmpty, currentIndex < cards.count else { return nil }
        return cards[currentIndex]
    }

    var body: some View {
        if let card = currentCard {
            VStack(alignment: .leading, spacing: 12) {
                HStack {
                    Text("Flashcard")
                        .font(.headline.weight(.bold))
                        .foregroundStyle(AppTheme.primaryText)
                    Spacer()
                    Text("\(currentIndex + 1)/\(cards.count)")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(AppTheme.secondaryText)
                        .monospacedDigit()
                }

                VStack(alignment: .leading, spacing: 10) {
                    Text(showBack ? "Back" : "Front")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(AppTheme.secondaryText)

                    if showBack {
                        Text(card.options[card.correctAnswerIndex])
                            .font(.headline.weight(.semibold))
                            .foregroundStyle(AppTheme.primaryText)

                        Text(card.explanation)
                            .font(.subheadline)
                            .foregroundStyle(AppTheme.secondaryText)
                            .fixedSize(horizontal: false, vertical: true)
                    } else {
                        Text(card.text)
                            .font(.headline.weight(.semibold))
                            .foregroundStyle(AppTheme.primaryText)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
                .padding(14)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(AppTheme.surface.opacity(0.95))
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(AppTheme.accentBlue.opacity(0.25), lineWidth: 1)
                )
                .onTapGesture {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        showBack.toggle()
                    }
                }

                HStack(spacing: 10) {
                    Button {
                        currentIndex = max(0, currentIndex - 1)
                        showBack = false
                    } label: {
                        Label("Previous", systemImage: "chevron.left")
                            .font(.subheadline.weight(.semibold))
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                    .disabled(currentIndex == 0)

                    Button {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            showBack.toggle()
                        }
                    } label: {
                        Label(showBack ? "Show Front" : "Show Answer", systemImage: showBack ? "arrow.uturn.backward" : "eye.fill")
                            .font(.subheadline.weight(.semibold))
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(AppTheme.accentBlue)

                    Button {
                        currentIndex = min(cards.count - 1, currentIndex + 1)
                        showBack = false
                    } label: {
                        Label("Next", systemImage: "chevron.right")
                            .font(.subheadline.weight(.semibold))
                            .frame(maxWidth: .infinity)
                    }
                    .buttonStyle(.bordered)
                    .disabled(currentIndex == cards.count - 1)
                }
            }
        } else {
            ContentUnavailableView("No flashcards", systemImage: "rectangle.stack")
                .padding(.top, 30)
        }
    }
}

#Preview { NavigationStack { PracticeTabView().environment(AppState()) } }
