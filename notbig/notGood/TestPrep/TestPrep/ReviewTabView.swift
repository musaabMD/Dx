import SwiftUI

struct ReviewTabView: View {
    @Environment(AppState.self) private var appState
    @State private var selectedFilter: ReviewSection = .all
    @State private var searchText = ""
    @State private var selectedDetail: ReviewDetailSelection?

    enum ReviewSection: String, CaseIterable, Identifiable {
        case all = "All"
        case incorrect = "Incorrect"
        case flagged = "Flagged"
        case correct = "Correct"
        case flashcard = "Flashcard"
        case summary = "Summary"

        var id: String { rawValue }

        var icon: String {
            switch self {
            case .all: return "square.grid.2x2.fill"
            case .incorrect: return "xmark.circle.fill"
            case .flagged: return "flag.fill"
            case .correct: return "checkmark.circle.fill"
            case .flashcard: return "rectangle.stack.fill"
            case .summary: return "text.alignleft"
            }
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            FixedScreenHeader(title: "Review", showsBottomDivider: false)

            VStack(spacing: 10) {
                minimalTabBar
                    .padding(.horizontal)
                    .padding(.top, 8)

                searchField
                    .padding(.horizontal)

                TabView(selection: $selectedFilter) {
                    reviewList(for: .all)
                        .tag(ReviewSection.all)

                    reviewList(for: .incorrect)
                        .tag(ReviewSection.incorrect)

                    reviewList(for: .flagged)
                        .tag(ReviewSection.flagged)

                    reviewList(for: .correct)
                        .tag(ReviewSection.correct)

                    reviewList(for: .flashcard)
                        .tag(ReviewSection.flashcard)

                    reviewList(for: .summary)
                        .tag(ReviewSection.summary)
                }
                .tabViewStyle(.page(indexDisplayMode: .never))
            }
            .background(AppTheme.bgTop)
        }
        .sheet(item: $selectedDetail) { detail in
            ReviewQuestionDetailSheet(title: detail.title, items: detail.items, initialIndex: detail.initialIndex)
        }
        .toolbar(.hidden, for: .navigationBar)
    }

    private var minimalTabBar: some View {
        HStack(spacing: 8) {
            ForEach(ReviewSection.allCases) { section in
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) {
                        selectedFilter = section
                    }
                } label: {
                    Image(systemName: section.icon)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(selectedFilter == section ? .white : AppTheme.primaryText)
                        .padding(.horizontal, 10)
                        .padding(.vertical, 8)
                        .frame(maxWidth: .infinity)
                        .background(
                            RoundedRectangle(cornerRadius: 10)
                                .fill(selectedFilter == section ? AppTheme.accentBlue : AppTheme.surface.opacity(0.82))
                        )
                        .overlay(
                            RoundedRectangle(cornerRadius: 10)
                                .stroke(selectedFilter == section ? AppTheme.accentBlue : AppTheme.divider, lineWidth: 1)
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

            TextField("Search questions", text: $searchText)
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

    private func reviewList(for filter: ReviewSection) -> some View {
        let items = filteredItems(for: filter)

        return ScrollView {
            if items.isEmpty {
                ContentUnavailableView("No questions", systemImage: "doc.text.magnifyingglass")
                    .padding(.top, 48)
            } else {
                VStack(spacing: 12) {
                    HStack {
                        Text(filter.rawValue)
                            .font(.headline.weight(.semibold))
                            .foregroundStyle(AppTheme.primaryText)

                        Spacer()

                        Text("\(items.count)")
                            .font(.subheadline.weight(.semibold))
                            .monospacedDigit()
                            .foregroundStyle(AppTheme.secondaryText)
                    }
                    .padding(.horizontal, 2)
                    .padding(.bottom, 2)

                    ForEach(Array(items.enumerated()), id: \.element.id) { index, item in
                        Button {
                            selectedDetail = ReviewDetailSelection(
                                title: filter.rawValue,
                                items: items,
                                initialIndex: index
                            )
                        } label: {
                            ReviewRow(item: item, position: index + 1)
                        }
                        .buttonStyle(.plain)
                    }
                }
                .padding(.horizontal, 16)
                .padding(.top, 8)
                .padding(.bottom, 24)
            }
        }
    }

    private func filteredItems(for filter: ReviewSection) -> [ReviewItem] {
        let base = allReviewItems.filter {
            guard !searchText.isEmpty else { return true }
            return $0.question.text.localizedCaseInsensitiveContains(searchText)
                || $0.question.oneLineSummary.localizedCaseInsensitiveContains(searchText)
                || $0.question.tags.contains(where: { $0.localizedCaseInsensitiveContains(searchText) })
        }

        switch filter {
        case .all:
            return base
        case .incorrect:
            return base.filter { !$0.answer.isCorrect }
        case .flagged:
            return base.filter { $0.answer.isFlagged }
        case .correct:
            return base.filter { $0.answer.isCorrect }
        case .flashcard, .summary:
            return base
        }
    }

    private var allReviewItems: [ReviewItem] {
        guard let session = appState.currentSession else {
            return sampleItems
        }

        return session.answers
            .compactMap { questionID, answer -> ReviewItem? in
                guard let question = session.questions.first(where: { $0.id == questionID }) else { return nil }
                return ReviewItem(question: question, answer: answer)
            }
            .sorted { $0.answer.timestamp > $1.answer.timestamp }
    }

    private var sampleItems: [ReviewItem] {
        appState.allQuestions.prefix(4).enumerated().map { index, question in
            let answer = AnswerRecord(
                questionID: question.id,
                selectedAnswerIndex: 0,
                isCorrect: index % 2 == 0,
                timeSpent: 24,
                isFlagged: index == 1,
                timestamp: Date()
            )
            return ReviewItem(question: question, answer: answer)
        }
    }

}

private struct ReviewDetailSelection: Identifiable {
    let id = UUID()
    let title: String
    let items: [ReviewItem]
    let initialIndex: Int
}

private struct ReviewItem: Identifiable {
    var id: UUID { question.id }
    let question: Question
    let answer: AnswerRecord
}

private struct ReviewRow: View {
    let item: ReviewItem
    let position: Int

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(alignment: .firstTextBaseline, spacing: 8) {
                Text("\(position).")
                    .font(.footnote.weight(.bold))
                    .monospacedDigit()
                    .foregroundStyle(AppTheme.accentBlue)

                Text(item.question.text)
                    .font(.footnote.weight(.medium))
                    .foregroundStyle(AppTheme.primaryText)
                    .lineLimit(2)

                Spacer()

                HStack(spacing: 6) {
                    Image(systemName: item.answer.isCorrect ? "checkmark.circle.fill" : "xmark.circle.fill")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(item.answer.isCorrect ? AppTheme.accentGreen : AppTheme.accentRed)

                    if item.answer.isFlagged {
                        Image(systemName: "flag.fill")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(AppTheme.flameOrange)
                    }
                }
            }

            HStack(alignment: .top, spacing: 8) {
                Image(systemName: "lightbulb")
                    .font(.caption2)
                    .foregroundStyle(AppTheme.secondaryText)
                    .padding(.top, 1)

                Text(item.question.oneLineSummary)
                    .font(.caption2)
                    .foregroundStyle(AppTheme.secondaryText)
                    .lineLimit(1)
            }
        }
        .padding(11)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(AppTheme.surface.opacity(0.95))
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(AppTheme.divider, lineWidth: 1)
        )
    }
}

private struct ReviewQuestionDetailSheet: View {
    @Environment(\.dismiss) private var dismiss

    let title: String
    let items: [ReviewItem]
    let initialIndex: Int

    @State private var currentIndex: Int

    init(title: String, items: [ReviewItem], initialIndex: Int) {
        self.title = title
        self.items = items
        self.initialIndex = initialIndex
        _currentIndex = State(initialValue: initialIndex)
    }

    private var current: ReviewItem { items[currentIndex] }

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        statusBar
                        questionCard
                        optionsCard
                        explanationCard
                    }
                    .padding(16)
                }
                .contentShape(Rectangle())
                .gesture(
                    DragGesture(minimumDistance: 20)
                        .onEnded { value in
                            let horizontal = value.translation.width
                            let vertical = value.translation.height
                            guard abs(horizontal) > abs(vertical), abs(horizontal) > 35 else { return }
                            if horizontal < 0 {
                                currentIndex = min(items.count - 1, currentIndex + 1)
                            } else {
                                currentIndex = max(0, currentIndex - 1)
                            }
                        }
                )

                navigationBar
                    .padding(16)
                    .background(AppTheme.bgBottom)
                    .overlay(alignment: .top) {
                        Divider().opacity(0.2)
                    }
            }
            .background(AppTheme.backgroundGradient)
            .navigationTitle("Review \(title)")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Close") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Text("\(currentIndex + 1)/\(items.count)")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(AppTheme.secondaryText)
                        .monospacedDigit()
                }
            }
        }
    }

    private var statusBar: some View {
        HStack(spacing: 8) {
            Spacer()

            Label(current.answer.isCorrect ? "Correct" : "Incorrect", systemImage: current.answer.isCorrect ? "checkmark.circle.fill" : "xmark.circle.fill")
                .font(.caption.weight(.semibold))
                .foregroundStyle(current.answer.isCorrect ? AppTheme.accentGreen : AppTheme.accentRed)
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background((current.answer.isCorrect ? AppTheme.accentGreen : AppTheme.accentRed).opacity(0.12))
                .clipShape(Capsule())

            if current.answer.isFlagged {
                Image(systemName: "flag.fill")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(AppTheme.flameOrange)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(AppTheme.flameOrange.opacity(0.12))
                    .clipShape(Capsule())
            }
        }
    }

    private var questionCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Question")
                .font(.caption.weight(.semibold))
                .foregroundStyle(AppTheme.secondaryText)

            Text(current.question.text)
                .font(.title3.weight(.semibold))
                .foregroundStyle(AppTheme.primaryText)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(AppTheme.surface.opacity(0.92))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(AppTheme.divider, lineWidth: 1)
        )
    }

    private var optionsCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Answers")
                .font(.caption.weight(.semibold))
                .foregroundStyle(AppTheme.secondaryText)

            ForEach(Array(current.question.options.enumerated()), id: \.offset) { index, option in
                HStack(alignment: .top, spacing: 10) {
                    Text("\(index + 1).")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(AppTheme.secondaryText)

                    Text(option)
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.primaryText)
                        .fixedSize(horizontal: false, vertical: true)

                    Spacer(minLength: 8)

                    if index == current.question.correctAnswerIndex {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(AppTheme.accentGreen)
                    } else if index == current.answer.selectedAnswerIndex && !current.answer.isCorrect {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(AppTheme.accentRed)
                    }
                }
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(backgroundForOption(index))
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(borderForOption(index), lineWidth: 1.2)
                )
            }
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(AppTheme.surface.opacity(0.92))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(AppTheme.divider, lineWidth: 1)
        )
    }

    private var explanationCard: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Explanation")
                .font(.caption.weight(.semibold))
                .foregroundStyle(AppTheme.secondaryText)

            Text(current.question.explanation)
                .font(.subheadline)
                .foregroundStyle(AppTheme.primaryText)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(AppTheme.surface.opacity(0.92))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(AppTheme.divider, lineWidth: 1)
        )
    }

    private var navigationBar: some View {
        HStack(spacing: 10) {
            Button {
                currentIndex = max(0, currentIndex - 1)
            } label: {
                Label("Previous", systemImage: "chevron.left")
                    .font(.subheadline.weight(.semibold))
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            .disabled(currentIndex == 0)

            Button {
                currentIndex = min(items.count - 1, currentIndex + 1)
            } label: {
                Label("Next", systemImage: "chevron.right")
                    .font(.subheadline.weight(.semibold))
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .tint(AppTheme.accentBlue)
            .disabled(currentIndex == items.count - 1)
        }
    }

    private func backgroundForOption(_ index: Int) -> Color {
        if index == current.question.correctAnswerIndex {
            return AppTheme.accentGreen.opacity(0.14)
        }
        if index == current.answer.selectedAnswerIndex && !current.answer.isCorrect {
            return AppTheme.accentRed.opacity(0.14)
        }
        return AppTheme.bgTop
    }

    private func borderForOption(_ index: Int) -> Color {
        if index == current.question.correctAnswerIndex {
            return AppTheme.accentGreen.opacity(0.9)
        }
        if index == current.answer.selectedAnswerIndex && !current.answer.isCorrect {
            return AppTheme.accentRed.opacity(0.9)
        }
        return AppTheme.divider
    }
}

#Preview {
    NavigationStack { ReviewTabView().environment(AppState()) }
}
