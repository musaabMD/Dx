// MainStudyShellView.swift
// Five-tab shell: Mock, Review, Analysis, HY, Profile.

import SwiftUI

// MARK: - Shared tab navigation chrome

/// Branded principal toolbar item: tinted glyph + wordmark.
/// Keeps every tab visually anchored to the same app identity.
private struct StudyNavBrand: ToolbarContent {
    let title: String
    let icon: String

    var body: some ToolbarContent {
        ToolbarItem(placement: .principal) {
            HStack(spacing: 8) {
                Image(systemName: icon)
                    .font(.footnote.weight(.bold))
                    .foregroundStyle(.white)
                    .frame(width: 22, height: 22)
                    .background(AppTheme.accentGradient)
                    .clipShape(RoundedRectangle(cornerRadius: 6, style: .continuous))
                Text(title)
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(AppTheme.textPrimary)
            }
            .accessibilityElement(children: .combine)
            .accessibilityLabel(title)
        }
    }
}

private extension View {
    /// Same navigation bar treatment on every main tab:
    /// branded principal item + dark toolbar that blends with the app gradient.
    func studyTabChrome(title: String, icon: String) -> some View {
        self
            .background(AppTheme.backgroundGradient.ignoresSafeArea())
            .navigationTitle(title)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar { StudyNavBrand(title: title, icon: icon) }
            .toolbarBackground(AppTheme.background.opacity(0.85), for: .navigationBar)
            .toolbarBackground(.visible, for: .navigationBar)
            .toolbarColorScheme(.dark, for: .navigationBar)
    }
}

struct MainStudyShellView: View {
    @EnvironmentObject private var study: StudySessionViewModel
    @EnvironmentObject private var auth: AuthSessionManager
    @EnvironmentObject private var subscription: SubscriptionStore

    var body: some View {
        TabView(selection: $study.selectedTab) {
            MockExamTab()
                .tabItem { Label("Mock", systemImage: "doc.text.fill") }
                .tag(0)

            ReviewTab()
                .tabItem { Label("Review", systemImage: "list.bullet.rectangle.fill") }
                .tag(1)

            AnalysisTab()
                .tabItem { Label("Analysis", systemImage: "chart.bar.fill") }
                .tag(2)

            HYTab()
                .tabItem { Label("HY", systemImage: "bolt.fill") }
                .tag(3)

            ProfileTab()
                .tabItem { Label("Profile", systemImage: "person.crop.circle.fill") }
                .tag(4)
        }
        .tint(AppTheme.accent)
        .preferredColorScheme(.dark)
        .task {
            await auth.refreshIdentityState()
            await subscription.refreshEntitlements()
            await study.loadCloudContentIfAvailable()
        }
    }
}

// MARK: - Mock tab (blueprint + instructions + full screen)

private struct MockExamTab: View {
    @EnvironmentObject private var study: StudySessionViewModel
    @EnvironmentObject private var subscription: SubscriptionStore
    @State private var showInstructions = false
    @State private var fullScreenExam = false

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 20) {
                    heroStartCard

                    blueprintSection

                    Button {
                        showInstructions = true
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: "info.circle")
                            Text("How the mock works")
                                .fontWeight(.semibold)
                        }
                        .font(.footnote)
                        .foregroundStyle(AppTheme.accent)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 10)
                    }
                    .buttonStyle(.plain)
                }
                .padding(.horizontal, 20)
                .padding(.top, 12)
                .padding(.bottom, 24)
            }
            .studyTabChrome(title: "Mock", icon: "doc.text.fill")
            .sheet(isPresented: $showInstructions) {
                MockInstructionsSheet(
                    exam: study.activeExam,
                    durationMinutes: study.examDurationMinutes,
                    questionCount: displayedQuestionCount
                )
            }
            .fullScreenCover(isPresented: $fullScreenExam, onDismiss: {
                if study.mockSessionActive {
                    study.endMockExam(saveAttempt: false)
                }
            }) {
                MockExamPlayerView()
                    .environmentObject(study)
                    .environmentObject(subscription)
            }
        }
    }

    private var heroStartCard: some View {
        Button {
            fullScreenExam = true
        } label: {
            VStack(alignment: .leading, spacing: 14) {
                HStack(spacing: 10) {
                    metaChip(icon: "clock", text: "\(study.examDurationMinutes) min")
                    metaChip(icon: "square.stack.3d.up", text: "\(displayedQuestionCount) items")
                    Spacer()
                }

                HStack(alignment: .center) {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("Begin mock exam")
                            .font(.headline)
                            .foregroundStyle(.white)
                        Text(subscription.isPro ? "Timed · full-screen" : "Free sample · upgrade for full bank")
                            .font(.caption)
                            .foregroundStyle(Color.white.opacity(0.8))
                    }
                    Spacer()
                    Image(systemName: "play.fill")
                        .font(.subheadline.weight(.bold))
                        .foregroundStyle(.white)
                        .frame(width: 36, height: 36)
                        .background(Color.white.opacity(0.18))
                        .clipShape(Circle())
                }
            }
            .padding(18)
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(AppTheme.accentGradient)
            .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        }
        .buttonStyle(.plain)
    }

    private var displayedQuestionCount: Int {
        subscription.isPro ? study.questionBank.count : min(study.questionBank.count, 5)
    }

    private func metaChip(icon: String, text: String) -> some View {
        HStack(spacing: 4) {
            Image(systemName: icon)
                .font(.caption2.weight(.semibold))
            Text(text)
                .font(.caption.weight(.semibold))
        }
        .foregroundStyle(.white)
        .padding(.horizontal, 10)
        .padding(.vertical, 5)
        .background(Color.white.opacity(0.18), in: Capsule())
    }

    /// Single-card, dense blueprint list: one line per subject (name · micro-bar · %).
    private var blueprintSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .firstTextBaseline) {
                Text("Exam blueprint")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(AppTheme.textPrimary)
                Spacer()
                Text("\(study.blueprint.count) subjects")
                    .font(.caption2.monospacedDigit())
                    .foregroundStyle(AppTheme.textSecondary)
            }

            VStack(spacing: 0) {
                ForEach(Array(study.blueprint.enumerated()), id: \.element.id) { idx, row in
                    compactBlueprintRow(row)
                    if idx < study.blueprint.count - 1 {
                        Divider()
                            .background(AppTheme.border)
                            .padding(.leading, 2)
                    }
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 6)
            .background(AppTheme.card)
            .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .stroke(AppTheme.border, lineWidth: 1)
            )
        }
    }

    private func compactBlueprintRow(_ row: BlueprintSubjectWeight) -> some View {
        HStack(spacing: 12) {
            Text(row.name)
                .font(.footnote.weight(.medium))
                .foregroundStyle(AppTheme.textPrimary)
                .lineLimit(1)
                .truncationMode(.tail)
                .layoutPriority(1)

            Spacer(minLength: 8)

            Capsule()
                .fill(AppTheme.cardBright)
                .frame(width: 72, height: 4)
                .overlay(alignment: .leading) {
                    Capsule()
                        .fill(AppTheme.accentGradient)
                        .frame(width: max(4, 72 * row.weightFraction), height: 4)
                }

            Text("\(Int(round(row.weightFraction * 100)))%")
                .font(.footnote.monospacedDigit().weight(.semibold))
                .foregroundStyle(AppTheme.textPrimary)
                .frame(width: 36, alignment: .trailing)
        }
        .padding(.vertical, 10)
        .accessibilityElement(children: .combine)
        .accessibilityLabel("\(row.name), \(Int(round(row.weightFraction * 100))) percent, \(row.questionCount) items")
    }
}

private struct MockInstructionsSheet: View {
    let exam: PreparedExam
    let durationMinutes: Int
    let questionCount: Int
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text("\(exam.titlePrimary) — timed self-assessment")
                        .font(.title3.weight(.bold))

                    bullet("This block is \(durationMinutes) minutes — pace like test day.")
                    bullet("You can flag items and return before you submit/end.")
                    bullet("All subjects appear proportional to the blueprint weights.")
                    bullet("After you finish, Review lets you filter All · Flagged · Incorrect · Correct.")

                    Text("Tip")
                        .font(.headline)
                        .padding(.top, 8)
                    Text("Skim the blueprint bars on the Mock tab so you know which systems carry the most items.")
                        .foregroundStyle(.secondary)
                }
                .padding(24)
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .navigationTitle("Instructions")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }

    private func bullet(_ text: String) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "checkmark.circle.fill")
                .foregroundStyle(AppTheme.accent)
            Text(text)
                .foregroundStyle(.primary)
        }
    }
}

// MARK: - Full-screen player

private struct MockExamPlayerView: View {
    @EnvironmentObject private var study: StudySessionViewModel
    @EnvironmentObject private var subscription: SubscriptionStore
    @Environment(\.dismiss) private var dismiss

    @State private var showNavigator = false
    @State private var showEndConfirm = false

    var body: some View {
        ZStack {
            AppTheme.backgroundGradient.ignoresSafeArea()

            VStack(spacing: 0) {
                playerHeader

                ScrollView {
                    if let q = study.currentQuestion {
                        Text(q.stem)
                            .font(.body)
                            .foregroundStyle(AppTheme.textPrimary)
                            .frame(maxWidth: .infinity, alignment: .leading)
                            .padding(.bottom, 16)

                        VStack(spacing: 10) {
                            ForEach(Array(q.choices.enumerated()), id: \.offset) { idx, choice in
                                choiceButton(choice: choice, index: idx)
                            }
                        }
                    }
                }
                .padding(20)

                playerToolbar
            }
        }
        .onAppear {
            if !study.mockSessionActive {
                study.beginMockExam(isPremiumUnlocked: subscription.isPro)
            }
        }
        .sheet(isPresented: $showNavigator) {
            QuestionNavigatorSheet()
                .environmentObject(study)
        }
        .alert("End mock exam?", isPresented: $showEndConfirm) {
            Button("Cancel", role: .cancel) {}
            Button("Discard", role: .destructive) {
                study.endMockExam(saveAttempt: false)
                dismiss()
            }
            Button("Save & exit") {
                study.endMockExam(saveAttempt: true)
                dismiss()
            }
        } message: {
            Text("Your attempt can be saved for Review and Analysis.")
        }
    }

    private var playerHeader: some View {
        HStack(spacing: 12) {
            Button {
                showEndConfirm = true
            } label: {
                Image(systemName: "xmark")
                    .font(.body.weight(.semibold))
                    .foregroundStyle(AppTheme.textSecondary)
                    .padding(10)
                    .background(AppTheme.card)
                    .clipShape(Circle())
            }

            VStack(alignment: .leading, spacing: 2) {
                Text(timeString(study.secondsRemaining))
                    .font(.system(.title3, design: .monospaced).weight(.bold))
                    .foregroundStyle(AppTheme.accent)
                Text("Question \(study.currentMockIndex + 1) of \(study.mockQuestionOrder.count)")
                    .font(.caption)
                    .foregroundStyle(AppTheme.textSecondary)
            }

            Spacer()

            Button {
                study.toggleFlagCurrent()
            } label: {
                Image(systemName: study.isCurrentFlagged ? "flag.fill" : "flag")
                    .foregroundStyle(study.isCurrentFlagged ? AppTheme.accentGold : AppTheme.textSecondary)
                    .padding(10)
                    .background(AppTheme.card)
                    .clipShape(Circle())
            }

            Button {
                showNavigator = true
            } label: {
                Image(systemName: "square.grid.3x3.fill")
                    .foregroundStyle(AppTheme.accent)
                    .padding(10)
                    .background(AppTheme.card)
                    .clipShape(Circle())
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
        .background(AppTheme.card.opacity(0.92))
    }

    private func choiceButton(choice: String, index: Int) -> some View {
        let selected = study.selectedChoiceIndex == index
        return Button {
            study.selectChoice(index)
        } label: {
            HStack(alignment: .top, spacing: 12) {
                Text(choiceLetter(index))
                    .font(.subheadline.weight(.bold))
                    .foregroundStyle(selected ? .white : AppTheme.textSecondary)
                    .frame(width: 28, height: 28)
                    .background(selected ? AppTheme.accent : AppTheme.cardBright)
                    .clipShape(RoundedRectangle(cornerRadius: 8))

                Text(choice)
                    .font(.body)
                    .foregroundStyle(AppTheme.textPrimary)
                    .multilineTextAlignment(.leading)
                Spacer(minLength: 0)
            }
            .padding(14)
            .background(selected ? AppTheme.accent.opacity(0.18) : AppTheme.card)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(selected ? AppTheme.accent : AppTheme.border, lineWidth: selected ? 2 : 1)
            )
        }
        .buttonStyle(.plain)
    }

    private var playerToolbar: some View {
        HStack(spacing: 16) {
            Button("Previous") {
                study.goToPrevious()
            }
            .disabled(study.currentMockIndex == 0)
            .foregroundStyle(study.currentMockIndex == 0 ? AppTheme.textSecondary : AppTheme.accent)

            Spacer()

            if study.currentMockIndex >= study.mockQuestionOrder.count - 1 {
                Button("Finish") {
                    study.endMockExam(saveAttempt: true)
                    dismiss()
                }
                .fontWeight(.bold)
                .foregroundStyle(.white)
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
                .background(AppTheme.success)
                .clipShape(Capsule())
            } else {
                Button("Next") {
                    study.goToNext()
                }
                .fontWeight(.semibold)
                .foregroundStyle(.white)
                .padding(.horizontal, 20)
                .padding(.vertical, 12)
                .background(AppTheme.accentGradient)
                .clipShape(Capsule())
            }
        }
        .padding(20)
        .background(AppTheme.card.opacity(0.95))
    }

    private func timeString(_ sec: Int) -> String {
        let m = sec / 60
        let s = sec % 60
        return String(format: "%d:%02d", m, s)
    }

    private func choiceLetter(_ index: Int) -> String {
        guard (0..<26).contains(index) else { return "?" }
        return String(UnicodeScalar(65 + index)!)
    }
}

private struct QuestionNavigatorSheet: View {
    @EnvironmentObject private var study: StudySessionViewModel
    @Environment(\.dismiss) private var dismiss

    private let columns = [GridItem(.adaptive(minimum: 52), spacing: 10)]

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVGrid(columns: columns, spacing: 10) {
                    ForEach(study.mockQuestionOrder.indices, id: \.self) { i in
                        let answered = study.answers.indices.contains(i) && study.answers[i] != nil
                        let flagged = study.flaggedIndices.contains(i)
                        Button {
                            study.jumpToQuestion(i)
                            dismiss()
                        } label: {
                            ZStack {
                                RoundedRectangle(cornerRadius: 10)
                                    .fill(i == study.currentMockIndex ? AppTheme.accent.opacity(0.35) : AppTheme.cardBright)
                                Text("\(i + 1)")
                                    .font(.headline.monospacedDigit())
                                    .foregroundStyle(AppTheme.textPrimary)
                            }
                            .frame(height: 48)
                            .overlay(
                                RoundedRectangle(cornerRadius: 10)
                                    .stroke(i == study.currentMockIndex ? AppTheme.accent : AppTheme.border, lineWidth: i == study.currentMockIndex ? 2 : 1)
                            )
                            .overlay(alignment: .topTrailing) {
                                if flagged {
                                    Image(systemName: "flag.fill")
                                        .font(.caption2)
                                        .foregroundStyle(AppTheme.accentGold)
                                        .padding(4)
                                }
                            }
                        }
                        .overlay(alignment: .bottom) {
                            if answered {
                                Capsule()
                                    .fill(AppTheme.success)
                                    .frame(width: 20, height: 3)
                                    .padding(.bottom, 4)
                            }
                        }
                    }
                }
                .padding(20)
            }
            .background(AppTheme.backgroundGradient.ignoresSafeArea())
            .navigationTitle("Question map")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Review

private struct ReviewDetailPayload: Identifiable {
    let id = UUID()
    /// Items in the current Review filter (segment), in list order.
    let items: [(question: MockQuestion, state: GradedQuestionState)]
    let startIndex: Int
}

private struct ReviewTab: View {
    @EnvironmentObject private var study: StudySessionViewModel
    @State private var reviewPayload: ReviewDetailPayload?

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Picker("Filter", selection: $study.reviewFilter) {
                    ForEach(ReviewFilter.allCases) { f in
                        Text(f.rawValue).tag(f)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, 16)
                .padding(.vertical, 12)

                if study.lastGradedStates.isEmpty {
                    ContentUnavailableView(
                        "No attempt yet",
                        systemImage: "tray",
                        description: Text("Finish a mock exam to review flagged and missed items here.")
                    )
                    .frame(maxHeight: .infinity)
                } else {
                    let filtered = study.filteredReviewItems()
                    List {
                        ForEach(Array(filtered.enumerated()), id: \.element.state.questionId) { rowIndex, row in
                            Button {
                                let items = filtered.map { (question: $0.question, state: $0.state) }
                                reviewPayload = ReviewDetailPayload(items: items, startIndex: rowIndex)
                            } label: {
                                reviewRow(q: row.question, state: row.state, orderIndex: row.index)
                            }
                            .listRowBackground(AppTheme.card)
                        }
                    }
                    .scrollContentBackground(.hidden)
                }
            }
            .studyTabChrome(title: "Review", icon: "list.bullet.rectangle.fill")
            .sheet(item: $reviewPayload) { payload in
                ReviewDetailSheet(items: payload.items, startIndex: payload.startIndex)
            }
        }
    }

    private func reviewRow(q: MockQuestion, state: GradedQuestionState, orderIndex: Int) -> some View {
        let correct = state.isCorrect(questionsById: Dictionary(uniqueKeysWithValues: study.questionBank.map { ($0.id, $0) }))
        return HStack(alignment: .top, spacing: 12) {
            Text("#\(orderIndex + 1)")
                .font(.caption.monospacedDigit())
                .foregroundStyle(AppTheme.textSecondary)
                .frame(width: 36, alignment: .leading)

            VStack(alignment: .leading, spacing: 6) {
                Text(q.stem)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(AppTheme.textPrimary)
                    .lineLimit(3)
                HStack(spacing: 8) {
                    statusChip(correct: correct, flagged: state.isFlagged)
                    Text(subjectName(for: q.subjectId))
                        .font(.caption2)
                        .foregroundStyle(AppTheme.textSecondary)
                }
            }
            Spacer(minLength: 0)
        }
        .padding(.vertical, 4)
    }

    private func statusChip(correct: Bool, flagged: Bool) -> some View {
        HStack(spacing: 6) {
            Image(systemName: correct ? "checkmark.circle.fill" : "xmark.circle.fill")
                .foregroundStyle(correct ? AppTheme.success : AppTheme.danger)
            if flagged {
                Image(systemName: "flag.fill")
                    .foregroundStyle(AppTheme.accentGold)
            }
        }
        .font(.caption)
    }

    private func subjectName(for id: String) -> String {
        study.blueprint.first { $0.id == id }?.name ?? id
    }
}

private struct ReviewDetailSheet: View {
    let items: [(question: MockQuestion, state: GradedQuestionState)]
    @State private var currentIndex: Int
    @Environment(\.dismiss) private var dismiss

    init(items: [(question: MockQuestion, state: GradedQuestionState)], startIndex: Int) {
        self.items = items
        _currentIndex = State(initialValue: min(max(0, startIndex), max(0, items.count - 1)))
    }

    private var question: MockQuestion { items[currentIndex].question }
    private var state: GradedQuestionState { items[currentIndex].state }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    Text(question.stem)
                        .font(.body)
                        .foregroundStyle(AppTheme.textPrimary)

                    ForEach(Array(question.choices.enumerated()), id: \.offset) { idx, choice in
                        let isUser = state.selectedIndex == idx
                        let isKey = question.correctIndex == idx
                        HStack(alignment: .top, spacing: 10) {
                            Text(choiceLetter(idx))
                                .font(.caption.weight(.bold))
                                .foregroundStyle(AppTheme.textSecondary)
                            Text(choice)
                                .font(.body)
                            Spacer()
                            if isKey {
                                Text("Correct")
                                    .font(.caption2.weight(.bold))
                                    .foregroundStyle(AppTheme.success)
                            } else if isUser && !isKey {
                                Text("Your pick")
                                    .font(.caption2.weight(.bold))
                                    .foregroundStyle(AppTheme.danger)
                            }
                        }
                        .padding(12)
                        .background(isKey ? AppTheme.success.opacity(0.12) : (isUser ? AppTheme.danger.opacity(0.1) : AppTheme.card))
                        .clipShape(RoundedRectangle(cornerRadius: 10))
                    }

                    Divider().background(AppTheme.border)

                    Text("Explanation")
                        .font(.headline)
                        .foregroundStyle(AppTheme.textPrimary)
                    Text(question.explanation)
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.textSecondary)
                }
                .padding(20)
                .id(question.id)
            }
            .background(AppTheme.backgroundGradient.ignoresSafeArea())
            .navigationTitle(items.count > 1 ? "Review (\(currentIndex + 1) of \(items.count))" : "Review item")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
            .safeAreaInset(edge: .bottom, spacing: 0) {
                if items.count > 1 {
                    HStack(spacing: 16) {
                        Button {
                            guard currentIndex > 0 else { return }
                            currentIndex -= 1
                        } label: {
                            Label("Back", systemImage: "chevron.left")
                                .labelStyle(.titleAndIcon)
                                .font(.body.weight(.semibold))
                        }
                        .disabled(currentIndex == 0)

                        Spacer()

                        Text("\(currentIndex + 1) / \(items.count)")
                            .font(.subheadline.weight(.medium).monospacedDigit())
                            .foregroundStyle(AppTheme.textSecondary)

                        Spacer()

                        Button {
                            guard currentIndex < items.count - 1 else { return }
                            currentIndex += 1
                        } label: {
                            Label("Next", systemImage: "chevron.right")
                                .labelStyle(.titleAndIcon)
                                .font(.body.weight(.semibold))
                        }
                        .disabled(currentIndex >= items.count - 1)
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                    .background(AppTheme.card)
                    .overlay(alignment: .top) {
                        Divider().background(AppTheme.border)
                    }
                }
            }
        }
    }

    private func choiceLetter(_ index: Int) -> String {
        guard (0..<26).contains(index) else { return "?" }
        return String(UnicodeScalar(65 + index)!)
    }
}

// MARK: - Analysis

private enum AnalysisSubTab: String, CaseIterable, Identifiable {
    case sessions = "Sessions"
    case overall = "Overall"

    var id: String { rawValue }
}

private struct AnalysisTab: View {
    @EnvironmentObject private var study: StudySessionViewModel
    @State private var subTab: AnalysisSubTab = .sessions

    var body: some View {
        NavigationStack {
            VStack(spacing: 0) {
                Picker("Section", selection: $subTab) {
                    ForEach(AnalysisSubTab.allCases) { tab in
                        Text(tab.rawValue).tag(tab)
                    }
                }
                .pickerStyle(.segmented)
                .padding(.horizontal, 20)
                .padding(.top, 8)
                .padding(.bottom, 12)

                Group {
                    switch subTab {
                    case .sessions:
                        AnalysisSessionsView()
                    case .overall:
                        AnalysisOverallView()
                    }
                }
            }
            .studyTabChrome(title: "Analysis", icon: "chart.bar.fill")
        }
    }
}

private struct AnalysisSessionsView: View {
    @EnvironmentObject private var study: StudySessionViewModel

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 12) {
                if study.pastAttempts.isEmpty {
                    ContentUnavailableView(
                        "No mock exams yet",
                        systemImage: "chart.bar.doc.horizontal",
                        description: Text("Complete a timed mock to build your history.")
                    )
                    .padding(.top, 24)
                } else {
                    ForEach(study.pastAttempts) { attempt in
                        NavigationLink(value: attempt) {
                            sessionRow(attempt)
                        }
                        .buttonStyle(.plain)
                    }
                }
            }
            .padding(20)
        }
        .navigationDestination(for: MockAttemptRecord.self) { attempt in
            MockAttemptDetailView(attempt: attempt)
        }
    }

    private func sessionRow(_ attempt: MockAttemptRecord) -> some View {
        HStack(alignment: .firstTextBaseline, spacing: 12) {
            Text(attempt.date.formatted(date: .abbreviated, time: .omitted))
                .font(.subheadline.weight(.medium))
                .foregroundStyle(AppTheme.textPrimary)
                .frame(maxWidth: .infinity, alignment: .leading)
            Text(formatDuration(attempt.durationSeconds))
                .font(.subheadline.monospacedDigit())
                .foregroundStyle(AppTheme.textSecondary)
            Text("\(attempt.scorePercent)%")
                .font(.subheadline.weight(.bold).monospacedDigit())
                .foregroundStyle(AppTheme.accent)
                .frame(minWidth: 44, alignment: .trailing)
        }
        .padding(14)
        .background(AppTheme.card)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(AppTheme.border, lineWidth: 1))
    }

    private func formatDuration(_ seconds: Int) -> String {
        let m = max(0, seconds) / 60
        if m >= 60 {
            return "\(m / 60)h \(m % 60)m"
        }
        return "\(m)m"
    }
}

private struct MockAttemptDetailView: View {
    let attempt: MockAttemptRecord
    @EnvironmentObject private var study: StudySessionViewModel

    private var sortedSubjects: [BlueprintSubjectWeight] {
        study.blueprint.sorted { $0.name.localizedCaseInsensitiveCompare($1.name) == .orderedAscending }
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 20) {
                VStack(alignment: .leading, spacing: 8) {
                    Text("\(attempt.scorePercent)%")
                        .font(.system(size: 44, weight: .black, design: .rounded))
                        .foregroundStyle(AppTheme.accentGradient)
                    Text(attempt.date.formatted(date: .long, time: .omitted))
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.textSecondary)
                    Text("\(attempt.correct) correct of \(attempt.total)")
                        .font(.subheadline.weight(.semibold).monospacedDigit())
                        .foregroundStyle(AppTheme.textPrimary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(18)
                .background(AppTheme.card)
                .clipShape(RoundedRectangle(cornerRadius: 16))
                .overlay(RoundedRectangle(cornerRadius: 16).stroke(AppTheme.border, lineWidth: 1))

                Text("Blueprint performance")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(AppTheme.textPrimary)

                Text("Your percent correct within each blueprint area for this session.")
                    .font(.caption)
                    .foregroundStyle(AppTheme.textSecondary)

                ForEach(sortedSubjects) { sub in
                    blueprintSessionRow(
                        sub,
                        sessionPercent: attempt.subjectPerformance[sub.id] ?? 0
                    )
                }
            }
            .padding(20)
        }
        .background(AppTheme.backgroundGradient.ignoresSafeArea())
        .navigationTitle("Session detail")
        .navigationBarTitleDisplayMode(.inline)
    }

    private func blueprintSessionRow(_ sub: BlueprintSubjectWeight, sessionPercent: Int) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(alignment: .firstTextBaseline) {
                Text(sub.name)
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(AppTheme.textPrimary)
                    .fixedSize(horizontal: false, vertical: true)
                Spacer()
                Text("\(sessionPercent)%")
                    .font(.headline.monospacedDigit())
                    .foregroundStyle(sessionPercent < 70 ? AppTheme.danger : AppTheme.success)
            }
            HStack {
                Text("Exam weight")
                    .font(.caption2)
                    .foregroundStyle(AppTheme.textSecondary)
                Spacer()
                Text("\(Int(round(sub.weightFraction * 100)))%")
                    .font(.caption2.monospacedDigit())
                    .foregroundStyle(AppTheme.accent)
            }
            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(AppTheme.cardBright)
                    Capsule()
                        .fill(AppTheme.accentGradient)
                        .frame(width: max(8, geo.size.width * CGFloat(sessionPercent) / 100))
                }
            }
            .frame(height: 10)
        }
        .padding(14)
        .background(AppTheme.card)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(AppTheme.border, lineWidth: 1))
    }
}

private struct AnalysisOverallView: View {
    @EnvironmentObject private var study: StudySessionViewModel

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(alignment: .leading, spacing: 12) {
                if study.pastAttempts.isEmpty {
                    ContentUnavailableView(
                        "No data yet",
                        systemImage: "square.grid.2x2",
                        description: Text("Complete a mock to see blueprint movement vs your previous exam.")
                    )
                    .padding(.top, 32)
                } else {
                    ForEach(study.blueprint) { sub in
                        blueprintOverallRow(subject: sub)
                    }
                }
            }
            .padding(20)
        }
    }

    private func blueprintOverallRow(subject: BlueprintSubjectWeight) -> some View {
        let latest = study.latestSubjectPercent(subjectId: subject.id)
        return HStack(alignment: .center, spacing: 12) {
            Text(subject.name)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(AppTheme.textPrimary)
                .fixedSize(horizontal: false, vertical: true)
                .frame(maxWidth: .infinity, alignment: .leading)
            if let delta = study.subjectScoreDeltaSincePrevious(subjectId: subject.id) {
                Group {
                    if delta == 0 {
                        Text("0")
                            .font(.subheadline.weight(.semibold).monospacedDigit())
                            .foregroundStyle(AppTheme.textSecondary)
                    } else {
                        HStack(spacing: 4) {
                            Image(systemName: delta > 0 ? "arrow.up" : "arrow.down")
                                .font(.caption.weight(.bold))
                            Text(String(format: "%@%d", delta > 0 ? "+" : "", delta))
                                .font(.subheadline.weight(.semibold).monospacedDigit())
                        }
                        .foregroundStyle(delta > 0 ? AppTheme.success : AppTheme.danger)
                    }
                }
            } else {
                Text("\(latest)%")
                    .font(.subheadline.weight(.semibold).monospacedDigit())
                    .foregroundStyle(AppTheme.textSecondary)
            }
        }
        .padding(14)
        .background(AppTheme.card)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .overlay(RoundedRectangle(cornerRadius: 14).stroke(AppTheme.border, lineWidth: 1))
    }
}

// MARK: - Profile

private struct ProfileTab: View {
    @EnvironmentObject private var study: StudySessionViewModel
    @EnvironmentObject private var auth: AuthSessionManager
    @EnvironmentObject private var subscription: SubscriptionStore

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 22) {
                    VStack(spacing: 14) {
                        ZStack {
                            Circle()
                                .fill(AppTheme.accentGradient)
                                .frame(width: 96, height: 96)
                            Image(systemName: "person.fill")
                                .font(.system(size: 42))
                                .foregroundStyle(.white)
                        }
                        Text("DrKard Study")
                            .font(.title3.weight(.bold))
                            .foregroundStyle(AppTheme.textPrimary)
                        Text("\(study.activeExam.titlePrimary) · \(study.activeExam.titleSecondary)")
                            .font(.subheadline)
                            .foregroundStyle(AppTheme.textSecondary)
                            .multilineTextAlignment(.center)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)

                    VStack(alignment: .leading, spacing: 10) {
                        profileRow(icon: "clock.fill", title: "Mock duration", value: "\(study.examDurationMinutes) min")
                        profileRow(icon: "doc.text.fill", title: "Question bank", value: "\(study.questionBank.count) items")
                        profileRow(icon: "chart.bar.fill", title: "Attempts logged", value: "\(study.pastAttempts.count)")
                        profileRow(icon: "icloud.fill", title: "Content source", value: study.contentSource)
                        profileRow(icon: "crown.fill", title: "Access", value: subscription.isPro ? "Pro" : "Limited")
                        profileRow(icon: "person.crop.circle.fill", title: "Identity", value: identityLabel)
                    }
                    .padding(16)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(AppTheme.card)
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    .overlay(RoundedRectangle(cornerRadius: 16).stroke(AppTheme.border, lineWidth: 1))
                }
                .padding(20)
            }
            .studyTabChrome(title: "Profile", icon: "person.crop.circle.fill")
        }
    }

    private var identityLabel: String {
        switch auth.identityState {
        case .checking:
            "Checking"
        case .signedOut:
            "Apple sign-in needed"
        case .signedIn(let displayName):
            displayName?.isEmpty == false ? displayName ?? "Signed in" : "Signed in"
        case .iCloudUnavailable:
            "iCloud unavailable"
        }
    }

    private func profileRow(icon: String, title: String, value: String) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.body)
                .foregroundStyle(AppTheme.accent)
                .frame(width: 28, alignment: .center)
            Text(title)
                .font(.subheadline)
                .foregroundStyle(AppTheme.textPrimary)
            Spacer()
            Text(value)
                .font(.subheadline.weight(.semibold).monospacedDigit())
                .foregroundStyle(AppTheme.textSecondary)
        }
        .padding(.vertical, 6)
    }
}

// MARK: - HY (blueprint topics → summary cards → MCQ)

private struct HYTab: View {
    @EnvironmentObject private var study: StudySessionViewModel
    @State private var searchText = ""
    @State private var showCardLoop = false

    private var isSearching: Bool {
        !searchText.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty
    }

    private var searchResults: [HYFlashcard] {
        study.hyFlashcards(matching: searchText)
    }

    private var cardsForLoop: [HYFlashcard] {
        isSearching ? searchResults : study.hyFlashcards
    }

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                VStack(alignment: .leading, spacing: 16) {
                    Text("Skim by blueprint topic. Each card opens with a one-line summary — tap again for the full MCQ.")
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.textSecondary)
                        .fixedSize(horizontal: false, vertical: true)

                    if !study.bookmarkedHYFlashcards.isEmpty {
                        HStack(spacing: 8) {
                            Image(systemName: "bookmark.fill")
                                .foregroundStyle(AppTheme.accentGold)
                            Text("\(study.bookmarkedHYFlashcards.count) bookmarked")
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(AppTheme.textPrimary)
                        }
                        .padding(.bottom, 4)
                    }

                    if isSearching {
                        if searchResults.isEmpty {
                            ContentUnavailableView(
                                "No matches",
                                systemImage: "magnifyingglass",
                                description: Text("Try a different word from the summary or question.")
                            )
                            .padding(.top, 24)
                        } else {
                            Text("\(searchResults.count) cards")
                                .font(.caption.weight(.semibold))
                                .foregroundStyle(AppTheme.textSecondary)
                            ForEach(searchResults) { card in
                                HYFlashcardRow(card: card)
                            }
                        }
                    } else {
                        ForEach(study.blueprint) { subject in
                            let count = study.cardCount(forSubjectId: subject.id)
                            NavigationLink(value: subject.id) {
                                HStack(alignment: .center, spacing: 14) {
                                    VStack(alignment: .leading, spacing: 6) {
                                        Text(subject.name)
                                            .font(.headline)
                                            .foregroundStyle(AppTheme.textPrimary)
                                            .multilineTextAlignment(.leading)
                                        Text("\(count) cards")
                                            .font(.subheadline)
                                            .foregroundStyle(AppTheme.textSecondary)
                                    }
                                    Spacer(minLength: 0)
                                    Image(systemName: "chevron.right")
                                        .font(.caption.weight(.semibold))
                                        .foregroundStyle(AppTheme.textSecondary)
                                }
                                .padding(16)
                                .background(AppTheme.card)
                                .clipShape(RoundedRectangle(cornerRadius: 16))
                                .overlay(RoundedRectangle(cornerRadius: 16).stroke(AppTheme.border, lineWidth: 1))
                            }
                            .buttonStyle(.plain)
                        }
                    }
                }
                .padding(20)
            }
            .studyTabChrome(title: "HY", icon: "bolt.fill")
            .searchable(text: $searchText, prompt: "Search cards")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showCardLoop = true
                    } label: {
                        Label("Preview cards", systemImage: "rectangle.portrait.on.rectangle.portrait.angled.fill")
                    }
                    .accessibilityLabel("Swipe through cards to preview")
                }
            }
            .fullScreenCover(isPresented: $showCardLoop) {
                HYCardLoopPreviewView(cards: cardsForLoop)
                    .environmentObject(study)
            }
            .navigationDestination(for: String.self) { subjectId in
                HYTopicCardsView(subjectId: subjectId)
            }
        }
    }
}

private struct HYTopicCardsView: View {
    let subjectId: String
    @EnvironmentObject private var study: StudySessionViewModel
    @State private var searchText = ""

    private var subjectName: String {
        study.blueprint.first { $0.id == subjectId }?.name ?? "Topic"
    }

    private var allCards: [HYFlashcard] {
        study.cards(forSubjectId: subjectId)
    }

    private var cards: [HYFlashcard] {
        let q = searchText.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
        guard !q.isEmpty else { return allCards }
        return allCards.filter { card in
            card.summary.lowercased().contains(q)
                || (study.question(forQuestionId: card.questionId)?.stem.lowercased().contains(q) ?? false)
        }
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            LazyVStack(spacing: 14) {
                HStack(spacing: 10) {
                    Image(systemName: "magnifyingglass")
                        .foregroundStyle(AppTheme.textSecondary)
                    TextField("Search in topic", text: $searchText)
                        .textInputAutocapitalization(.never)
                        .autocorrectionDisabled()
                }
                .padding(12)
                .background(AppTheme.cardBright)
                .clipShape(RoundedRectangle(cornerRadius: 12))
                .overlay(RoundedRectangle(cornerRadius: 12).stroke(AppTheme.border, lineWidth: 1))

                if cards.isEmpty {
                    ContentUnavailableView(
                        allCards.isEmpty ? "No cards yet" : "No matches",
                        systemImage: "rectangle.stack",
                        description: Text(
                            allCards.isEmpty
                                ? "Questions for this topic will appear here."
                                : "Try another search term."
                        )
                    )
                    .padding(.top, 40)
                } else {
                    ForEach(cards) { card in
                        HYFlashcardRow(card: card)
                    }
                }
            }
            .padding(20)
        }
        .background(AppTheme.backgroundGradient.ignoresSafeArea())
        .navigationTitle(subjectName)
        .navigationBarTitleDisplayMode(.inline)
    }
}

/// Swipeable full-screen preview of card fronts (image + summary + topic).
private struct HYCardLoopPreviewView: View {
    let cards: [HYFlashcard]
    @EnvironmentObject private var study: StudySessionViewModel
    @Environment(\.dismiss) private var dismiss
    @State private var page = 0

    var body: some View {
        NavigationStack {
            ZStack {
                AppTheme.backgroundGradient.ignoresSafeArea()
                if cards.isEmpty {
                    ContentUnavailableView(
                        "No cards to show",
                        systemImage: "rectangle.stack",
                        description: Text("Clear search or pick a topic with cards.")
                    )
                } else {
                    TabView(selection: $page) {
                        ForEach(Array(cards.enumerated()), id: \.element.id) { i, card in
                            hyLoopPage(for: card)
                                .tag(i)
                        }
                    }
                    .tabViewStyle(.page(indexDisplayMode: .automatic))
                }
            }
            .navigationTitle("Card preview")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }

    private func hyLoopPage(for card: HYFlashcard) -> some View {
        let live = study.hyFlashcards.first(where: { $0.id == card.id }) ?? card
        return VStack(spacing: 20) {
            Spacer(minLength: 0)
            if let sys = live.imageSystemName {
                Image(systemName: sys)
                    .font(.system(size: 80))
                    .foregroundStyle(AppTheme.accentGradient)
                    .symbolRenderingMode(.hierarchical)
            }
            Text(study.subjectName(forSubjectId: live.subjectId))
                .font(.caption.weight(.semibold))
                .foregroundStyle(AppTheme.textSecondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 20)
            Text(live.summary)
                .font(.title3.weight(.semibold))
                .multilineTextAlignment(.center)
                .foregroundStyle(AppTheme.textPrimary)
                .padding(.horizontal, 28)
            Spacer(minLength: 0)
            Text("Swipe for the next card")
                .font(.caption)
                .foregroundStyle(AppTheme.textSecondary)
                .padding(.bottom, 32)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

private struct HYFlashcardRow: View {
    let card: HYFlashcard
    @EnvironmentObject private var study: StudySessionViewModel
    @State private var showMCQ = false

    private var liveCard: HYFlashcard {
        study.hyFlashcards.first(where: { $0.id == card.id }) ?? card
    }

    private var question: MockQuestion? {
        study.question(forQuestionId: card.questionId)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(alignment: .center) {
                Label("HY card", systemImage: "bolt.fill")
                    .font(.caption.weight(.bold))
                    .foregroundStyle(AppTheme.accentGold)
                Spacer()
                Button {
                    study.toggleHYBookmark(cardId: card.id)
                } label: {
                    Image(systemName: liveCard.isBookmarked ? "bookmark.fill" : "bookmark")
                        .font(.title3)
                        .foregroundStyle(liveCard.isBookmarked ? AppTheme.accentGold : AppTheme.textSecondary)
                        .frame(width: 44, height: 44)
                        .contentShape(Rectangle())
                }
                .buttonStyle(.plain)
            }
            .padding(.bottom, 10)

            if let sys = liveCard.imageSystemName {
                Image(systemName: sys)
                    .font(.system(size: 40))
                    .foregroundStyle(AppTheme.accentGradient)
                    .symbolRenderingMode(.hierarchical)
                    .frame(maxWidth: .infinity)
                    .padding(.bottom, 8)
            }

            Group {
                if showMCQ, let q = question {
                    mcqBlock(q)
                } else {
                    summaryBlock
                }
            }
            .contentShape(Rectangle())
            .onTapGesture {
                withAnimation(.easeInOut(duration: 0.22)) {
                    showMCQ.toggle()
                }
            }
        }
        .padding(16)
        .background(AppTheme.card)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .overlay(RoundedRectangle(cornerRadius: 16).stroke(AppTheme.border, lineWidth: 1))
    }

    private var summaryBlock: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(liveCard.summary)
                .font(.body.weight(.medium))
                .foregroundStyle(AppTheme.textPrimary)
                .fixedSize(horizontal: false, vertical: true)
            Text("Tap for full question")
                .font(.caption)
                .foregroundStyle(AppTheme.accent)
        }
    }

    private func mcqBlock(_ q: MockQuestion) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text(q.stem)
                .font(.body)
                .foregroundStyle(AppTheme.textPrimary)

            ForEach(Array(q.choices.enumerated()), id: \.offset) { idx, choice in
                let isCorrect = idx == q.correctIndex
                HStack(alignment: .top, spacing: 10) {
                    Text(choiceLetter(idx))
                        .font(.caption.weight(.bold))
                        .foregroundStyle(isCorrect ? AppTheme.success : AppTheme.textSecondary)
                    Text(choice)
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.textPrimary)
                    Spacer(minLength: 0)
                    if isCorrect {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(AppTheme.success)
                    }
                }
                .padding(12)
                .frame(maxWidth: .infinity, alignment: .leading)
                .background(isCorrect ? AppTheme.success.opacity(0.12) : AppTheme.cardBright)
                .clipShape(RoundedRectangle(cornerRadius: 10))
            }

            Text(q.explanation)
                .font(.caption)
                .foregroundStyle(AppTheme.textSecondary)
                .padding(.top, 4)

            Text("Tap to collapse summary")
                .font(.caption)
                .foregroundStyle(AppTheme.accent)
                .padding(.top, 4)
        }
    }

    private func choiceLetter(_ index: Int) -> String {
        guard (0..<26).contains(index) else { return "?" }
        return String(UnicodeScalar(65 + index)!)
    }
}

#Preview {
    MainStudyShellView()
        .environmentObject(StudySessionViewModel())
        .environmentObject(AuthSessionManager())
        .environmentObject(SubscriptionStore())
}
