import SwiftUI

struct NewMainDashboardView: View {
    @State private var selectedTab = 0

    var body: some View {
        TabView(selection: $selectedTab) {
            NavigationStack { HomeDashboardContent() }
                .tabItem { Label("Learn", systemImage: "sparkles.rectangle.stack.fill") }
                .tag(0)

            NavigationStack { PracticeTabView() }
                .tabItem { Label("Practice", systemImage: "book.fill") }
                .tag(1)

            NavigationStack { MockTabView() }
                .tabItem { Label("Mock", systemImage: "doc.text.fill") }
                .tag(2)

            NavigationStack { ReviewTabView() }
                .tabItem { Label("Review", systemImage: "checkmark.circle.fill") }
                .tag(3)

            NavigationStack { UpgradeBenefitsView() }
                .tabItem { Label("Upgrade", systemImage: "crown.fill") }
                .tag(4)
        }
        .tint(AppTheme.accentBlue)
    }
}

private enum LearnDifficultyFilter: String, CaseIterable, Identifiable {
    case all = "All"
    case easy = "Easy"
    case medium = "Medium"
    case hard = "Hard"

    var id: String { rawValue }

    func matches(_ difficulty: Question.Difficulty) -> Bool {
        switch self {
        case .all: return true
        case .easy: return difficulty == .easy
        case .medium: return difficulty == .medium
        case .hard: return difficulty == .hard
        }
    }
}

private enum LearnSortOption: String, CaseIterable, Identifiable {
    case highYield = "High yield"
    case latest = "Latest"
    case alphabetical = "A-Z"

    var id: String { rawValue }
}

private struct LearnFilterConfig: Equatable {
    var selectedSubjectID: UUID? = nil
    var difficulty: LearnDifficultyFilter = .all
    var sort: LearnSortOption = .highYield
    var bookmarkedOnly: Bool = false
    var withImageOnly: Bool = false
}

private struct LearnFeedCard: Identifiable {
    let id: UUID
    let subjectID: UUID
    let subjectName: String
    let title: String
    let body: String
    let tags: [String]
    let difficulty: Question.Difficulty
    let hasImage: Bool
    let imageSystemName: String?
    let sourceOrder: Int
}

struct HomeDashboardContent: View {
    @Environment(AppState.self) private var appState
    @State private var showFilterSheet = false
    @State private var filters = LearnFilterConfig()
    @State private var showAllAnswers = true

    var body: some View {
        ZStack(alignment: .bottomTrailing) {
            VStack(spacing: 0) {
                FixedScreenHeader(
                    title: "Learn",
                    showsBackButton: true,
                    onBackTap: {
                        appState.currentSession = nil
                        appState.selectedExam = nil
                    }
                )

                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        HStack {
                            Spacer()
                            Button {
                                withAnimation(.easeInOut(duration: 0.2)) {
                                    showAllAnswers.toggle()
                                }
                            } label: {
                                Label(showAllAnswers ? "Hide All Answers" : "Show All Answers", systemImage: showAllAnswers ? "eye.slash.fill" : "eye.fill")
                                    .font(.footnote.weight(.semibold))
                                    .foregroundStyle(AppTheme.accentBlue)
                                    .padding(.horizontal, 12)
                                    .padding(.vertical, 8)
                                    .background(AppTheme.surface)
                                    .clipShape(Capsule())
                                    .overlay(
                                        Capsule()
                                            .stroke(AppTheme.divider, lineWidth: 1)
                                    )
                            }
                            .buttonStyle(.plain)
                        }
                        .padding(.horizontal, 16)
                        .padding(.top, 8)

                        if filteredCards.isEmpty {
                            ContentUnavailableView("No cards for this filter", systemImage: "line.3.horizontal.decrease.circle")
                                .padding(.top, 40)
                        } else {
                            ForEach(filteredCards) { card in
                                LearnCardRow(
                                    card: card,
                                    showAllAnswers: showAllAnswers,
                                    isBookmarked: appState.isQuestionBookmarked(card.id),
                                    onToggleBookmark: { appState.toggleQuestionBookmark(card.id) }
                                )
                            }
                            .padding(.horizontal, 16)
                        }
                    }
                    .padding(.bottom, 86)
                }
                .background(AppTheme.backgroundGradient)
            }
            .toolbar(.hidden, for: .navigationBar)

            Button {
                showFilterSheet = true
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: "line.3.horizontal.decrease.circle.fill")
                        .font(.headline.weight(.bold))
                    Text("Filters")
                        .font(.subheadline.weight(.semibold))
                        .lineLimit(1)
                    if filters.bookmarkedOnly {
                        Image(systemName: "bookmark.fill")
                            .font(.caption.weight(.bold))
                    }
                }
                .foregroundStyle(.white)
                .padding(.horizontal, 14)
                .padding(.vertical, 12)
                .background(AppTheme.accentBlue)
                .clipShape(Capsule())
                    .shadow(color: .black.opacity(0.2), radius: 10, x: 0, y: 6)
            }
            .padding(.trailing, 18)
            .padding(.bottom, 18)
        }
        .sheet(isPresented: $showFilterSheet) {
            LearnFilterSheet(
                subjects: examSubjects,
                initialFilters: filters,
                onApply: { updated in
                    filters = updated
                }
            )
        }
    }

    private var examSubjects: [Subject] {
        appState.selectedExam?.subjects ?? []
    }

    private var baseQuestions: [Question] {
        guard let exam = appState.selectedExam else { return appState.allQuestions }
        let subjectIDs = Set(exam.subjects.map(\.id))
        return appState.allQuestions
            .filter { subjectIDs.contains($0.subjectID) }
            .sorted { $0.text < $1.text }
    }

    private var dummyCards: [LearnFeedCard] {
        let subject = examSubjects.first ?? Subject(name: "General", questionCount: 0)
        return [
            LearnFeedCard(
                id: UUID(uuidString: "00000000-0000-0000-0000-000000000101") ?? UUID(),
                subjectID: subject.id,
                subjectName: subject.name,
                title: "Cardiac cycle essentials",
                body: "Systole pumps blood out of ventricles, while diastole allows filling. Focus on valve timing and pressure changes for exam stems.",
                tags: ["cardiology", "physiology", "highyield"],
                difficulty: .medium,
                hasImage: true,
                imageSystemName: "waveform.path.ecg.rectangle",
                sourceOrder: -2
            ),
            LearnFeedCard(
                id: UUID(uuidString: "00000000-0000-0000-0000-000000000102") ?? UUID(),
                subjectID: subject.id,
                subjectName: subject.name,
                title: "Renin-Angiotensin quick memory",
                body: "Renin converts angiotensinogen to angiotensin I. ACE converts I to II. Angiotensin II raises blood pressure and stimulates aldosterone.",
                tags: ["renal", "pharma", "memory"],
                difficulty: .easy,
                hasImage: false,
                imageSystemName: nil,
                sourceOrder: -1
            )
        ]
    }

    private var questionCards: [LearnFeedCard] {
        baseQuestions.enumerated().map { index, question in
            LearnFeedCard(
                id: question.id,
                subjectID: question.subjectID,
                subjectName: examSubjects.first(where: { $0.id == question.subjectID })?.name ?? "General",
                title: question.oneLineSummary.isEmpty ? question.text : question.oneLineSummary,
                body: question.explanation,
                tags: question.tags,
                difficulty: question.difficulty,
                hasImage: false,
                imageSystemName: nil,
                sourceOrder: index
            )
        }
    }

    private var loopedQuestionCards: [LearnFeedCard] {
        let base = questionCards
        guard !base.isEmpty else { return [] }

        let repeatCount = max(30, (40 / max(1, base.count)) + 1)
        var expanded: [LearnFeedCard] = []
        expanded.reserveCapacity(base.count * repeatCount)

        for setIndex in 0..<repeatCount {
            for (itemIndex, card) in base.enumerated() {
                expanded.append(
                    LearnFeedCard(
                        id: UUID(),
                        subjectID: card.subjectID,
                        subjectName: card.subjectName,
                        title: card.title,
                        body: card.body,
                        tags: card.tags,
                        difficulty: card.difficulty,
                        hasImage: card.hasImage,
                        imageSystemName: card.imageSystemName,
                        sourceOrder: (setIndex * 10_000) + itemIndex
                    )
                )
            }
        }

        return expanded
    }

    private var allCards: [LearnFeedCard] {
        dummyCards + loopedQuestionCards
    }

    private var filteredCards: [LearnFeedCard] {
        var result = allCards

        if let selectedSubjectID = filters.selectedSubjectID {
            result = result.filter { $0.subjectID == selectedSubjectID }
        }
        result = result.filter { filters.difficulty.matches($0.difficulty) }

        if filters.bookmarkedOnly {
            result = result.filter { appState.isQuestionBookmarked($0.id) }
        }
        if filters.withImageOnly {
            result = result.filter(\.hasImage)
        }

        switch filters.sort {
        case .highYield:
            result.sort { lhs, rhs in
                let lhsScore = lhs.tags.count + (lhs.difficulty == .hard ? 2 : lhs.difficulty == .medium ? 1 : 0)
                let rhsScore = rhs.tags.count + (rhs.difficulty == .hard ? 2 : rhs.difficulty == .medium ? 1 : 0)
                if lhsScore == rhsScore { return lhs.sourceOrder < rhs.sourceOrder }
                return lhsScore > rhsScore
            }
        case .latest:
            result.sort { $0.sourceOrder < $1.sourceOrder }
        case .alphabetical:
            result.sort { $0.title.localizedCaseInsensitiveCompare($1.title) == .orderedAscending }
        }

        return Array(result.prefix(120))
    }
}

// MARK: - Supporting Views

private struct LearnCardRow: View {
    let card: LearnFeedCard
    let showAllAnswers: Bool
    let isBookmarked: Bool
    let onToggleBookmark: () -> Void
    @State private var showAnswer = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(alignment: .firstTextBaseline) {
                Text(card.subjectName)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(AppTheme.secondaryText)

                Spacer()

                Button(action: onToggleBookmark) {
                    Image(systemName: isBookmarked ? "bookmark.fill" : "bookmark")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(isBookmarked ? AppTheme.accentBlue : AppTheme.secondaryText)
                }
                .buttonStyle(.plain)
            }

            HStack(alignment: .top, spacing: 10) {
                Text(card.title)
                    .font(.headline.weight(.bold))
                    .foregroundStyle(AppTheme.primaryText)
                    .lineLimit(2)
                Spacer(minLength: 0)
            }

            if showAllAnswers || showAnswer {
                Text(card.body)
                    .font(.subheadline)
                    .foregroundStyle(AppTheme.primaryText)
                    .lineLimit(4)
                    .transition(.opacity.combined(with: .move(edge: .top)))
            }

            if card.hasImage {
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(AppTheme.bgTop)
                    .frame(height: 140)
                    .overlay {
                        Image(systemName: card.imageSystemName ?? "photo")
                            .font(.system(size: 34, weight: .semibold))
                            .foregroundStyle(AppTheme.accentBlue)
                    }
                    .overlay(
                        RoundedRectangle(cornerRadius: 12, style: .continuous)
                            .stroke(AppTheme.divider, lineWidth: 1)
                    )
            }

        }
        .padding(14)
        .background(AppTheme.surface.opacity(0.98))
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(AppTheme.divider, lineWidth: 1)
        )
        .shadow(color: .black.opacity(0.03), radius: 6, x: 0, y: 4)
        .contentShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .onTapGesture {
            withAnimation(.easeInOut(duration: 0.2)) {
                showAnswer.toggle()
            }
        }
        .onChange(of: showAllAnswers) { _, newValue in
            if !newValue {
                showAnswer = false
            }
        }
    }
}

private struct LearnFilterSheet: View {
    @Environment(\.dismiss) private var dismiss

    let subjects: [Subject]
    let onApply: (LearnFilterConfig) -> Void
    @State private var draft: LearnFilterConfig

    init(subjects: [Subject], initialFilters: LearnFilterConfig, onApply: @escaping (LearnFilterConfig) -> Void) {
        self.subjects = subjects
        self.onApply = onApply
        _draft = State(initialValue: initialFilters)
    }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VStack(spacing: 0) {
                Capsule()
                    .fill(Color.white.opacity(0.22))
                    .frame(width: 54, height: 6)
                    .padding(.top, 10)
                    .padding(.bottom, 14)

                HStack {
                    Spacer()
                    Text("Filters")
                        .font(.title2.weight(.bold))
                        .foregroundStyle(.white)
                    Spacer()
                }
                .overlay(alignment: .trailing) {
                    Button("Reset") {
                        draft = LearnFilterConfig()
                    }
                    .font(.title3.weight(.regular))
                    .foregroundStyle(Color.white.opacity(0.9))
                }
                .padding(.horizontal, 22)
                .padding(.bottom, 18)

                ScrollView {
                    VStack(spacing: 0) {
                        filterMenuRow(title: "Subject", value: selectedSubjectName, options: [
                            ("All subjects", nil)
                        ] + subjects.map { ($0.name, Optional($0.id)) }) { picked in
                            draft.selectedSubjectID = picked
                        }

                        filterMenuRow(title: "Difficulty", value: draft.difficulty.rawValue, options: LearnDifficultyFilter.allCases.map { ($0.rawValue, $0) }) { picked in
                            draft.difficulty = picked
                        }

                        filterMenuRow(title: "Sort by", value: draft.sort.rawValue, options: LearnSortOption.allCases.map { ($0.rawValue, $0) }) { picked in
                            draft.sort = picked
                        }

                        toggleRow(title: "Bookmarked only", isOn: $draft.bookmarkedOnly)
                        toggleRow(title: "With image only", isOn: $draft.withImageOnly)
                    }
                    .padding(.horizontal, 22)
                    .padding(.top, 8)
                }

                Button {
                    onApply(draft)
                    dismiss()
                } label: {
                    Text("Apply")
                        .font(.title2.weight(.semibold))
                        .foregroundStyle(.black)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 20)
                        .background(Color.white)
                        .clipShape(Capsule())
                }
                .padding(.horizontal, 22)
                .padding(.top, 20)
                .padding(.bottom, 28)
            }
        }
        .presentationDetents([.large])
        .presentationDragIndicator(.hidden)
    }

    private var selectedSubjectName: String {
        guard let selectedSubjectID = draft.selectedSubjectID else { return "All subjects" }
        return subjects.first(where: { $0.id == selectedSubjectID })?.name ?? "All subjects"
    }

    @ViewBuilder
    private func toggleRow(title: String, isOn: Binding<Bool>) -> some View {
        HStack {
            Text(title)
                .font(.title3.weight(.semibold))
                .foregroundStyle(.white)
            Spacer()
            Toggle("", isOn: isOn)
                .labelsHidden()
                .tint(Color.white.opacity(0.9))
        }
        .padding(.vertical, 16)
    }

    @ViewBuilder
    private func filterMenuRow<T: Hashable>(title: String, value: String, options: [(String, T)], onSelect: @escaping (T) -> Void) -> some View {
        HStack {
            Text(title)
                .font(.title3.weight(.semibold))
                .foregroundStyle(.white)
            Spacer()
            Menu {
                ForEach(Array(options.enumerated()), id: \.offset) { _, option in
                    Button(option.0) { onSelect(option.1) }
                }
            } label: {
                HStack(spacing: 8) {
                    Text(value)
                        .font(.title3.weight(.regular))
                        .foregroundStyle(Color.white.opacity(0.58))
                    Image(systemName: "chevron.right")
                        .font(.headline.weight(.semibold))
                        .foregroundStyle(Color.white.opacity(0.28))
                }
            }
        }
        .padding(.vertical, 16)
    }
}

private struct StatCard: View {
    let title: String
    let value: String
    let subtitle: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundStyle(color)
                Spacer()
            }
            
            Text(value)
                .font(.title.bold())
                .foregroundStyle(AppTheme.primaryText)
            
            Text(subtitle)
                .font(.caption)
                .foregroundStyle(AppTheme.secondaryText)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .background(AppTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

private struct QuickActionRow: View {
    let title: String
    let subtitle: String
    let icon: String
    let color: Color
    let destination: AnyView
    @State private var isPresented = false
    
    var body: some View {
        Button {
            isPresented = true
        } label: {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundStyle(.white)
                    .frame(width: 50, height: 50)
                    .background(color.gradient)
                    .clipShape(RoundedRectangle(cornerRadius: 10))
                
                VStack(alignment: .leading, spacing: 4) {
                    Text(title)
                        .font(.headline)
                        .foregroundStyle(AppTheme.primaryText)
                    Text(subtitle)
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.secondaryText)
                }
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .foregroundStyle(AppTheme.tertiaryText)
            }
            .padding()
            .background(AppTheme.surface)
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .sheet(isPresented: $isPresented) {
            destination
        }
    }
}

private struct HomeDailyLimitCard: View {
    let used: Int
    let total: Int
    @Environment(AppState.self) private var appState
    
    var progress: Double {
        Double(used) / Double(total)
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Daily Limit")
                        .font(.headline)
                    Text("\(used) of \(total) questions used")
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.secondaryText)
                }
                
                Spacer()
                
                Button {
                    PaywallService.showUpgradePaywall()
                } label: {
                    Text("Upgrade")
                        .font(.subheadline.bold())
                        .foregroundStyle(.white)
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(AppTheme.accentBlue.gradient)
                        .clipShape(Capsule())
                }
            }
            
            ProgressView(value: progress)
                .tint(progress > 0.8 ? AppTheme.accentRed : AppTheme.accentBlue)
        }
        .padding()
        .background(AppTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 12))
    }
}

private struct ProfileTabView: View {
    @Environment(AppState.self) private var appState
    
    var body: some View {
        List {
            Section {
                if let user = appState.currentUser {
                    HStack(spacing: 16) {
                        Image(systemName: "person.circle.fill")
                            .font(.system(size: 60))
                            .foregroundStyle(.blue)
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text(user.name)
                                .font(.title2.bold())
                            Text(user.email)
                                .font(.subheadline)
                                .foregroundStyle(.secondary)
                            
                            if user.isPremium {
                                Text("Premium Member")
                                    .font(.caption.bold())
                                    .foregroundStyle(.white)
                                    .padding(.horizontal, 8)
                                    .padding(.vertical, 4)
                                    .background(Color.blue.gradient)
                                    .clipShape(Capsule())
                            }
                        }
                    }
                    .padding(.vertical, 8)
                }
            }
            
            Section("Statistics") {
                StatRow(title: "Current Streak", value: "\(appState.currentUser?.currentStreak ?? 0) days", icon: "flame.fill", color: .orange)
                StatRow(title: "Longest Streak", value: "\(appState.currentUser?.longestStreak ?? 0) days", icon: "flame.fill", color: .orange)
                StatRow(title: "Total Points", value: "\(appState.currentUser?.totalPoints ?? 0)", icon: "star.fill", color: .yellow)
                StatRow(title: "Questions Answered", value: "\(appState.currentSession?.answers.count ?? 0)", icon: "checkmark.circle.fill", color: .green)
            }
            
            Section("Settings") {
                NavigationLink {
                    Text("Notifications Settings")
                        .navigationTitle("Notifications")
                } label: {
                    Label("Notifications", systemImage: "bell.fill")
                }
                
                NavigationLink {
                    LeaderboardView()
                } label: {
                    Label("Leaderboard", systemImage: "trophy.fill")
                }
                
                if appState.currentUser?.isPremium == false {
                    Button {
                        PaywallService.showUpgradePaywall()
                    } label: {
                        Label("Upgrade to Premium", systemImage: "crown.fill")
                            .foregroundStyle(.blue)
                    }
                }
            }
            
            Section {
                Button(role: .destructive) {
                    // Sign out logic
                } label: {
                    Text("Sign Out")
                        .frame(maxWidth: .infinity)
                }
            }
        }
        .navigationTitle("Profile")
    }
}

private struct StatRow: View {
    let title: String
    let value: String
    let icon: String
    let color: Color
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundStyle(color)
            Text(title)
            Spacer()
            Text(value)
                .foregroundStyle(.secondary)
        }
    }
}

private struct SummaryView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        List {
            Section("Overview") {
                HStack {
                    Label("Streak", systemImage: "flame.fill")
                    Spacer()
                    Text("\(appState.currentUser?.currentStreak ?? 0) days")
                        .foregroundStyle(.secondary)
                }
                HStack {
                    Label("Score", systemImage: "star.fill")
                    Spacer()
                    Text("\(scorePercent)%")
                        .foregroundStyle(.secondary)
                }
                HStack {
                    Label("Progress", systemImage: "chart.bar.fill")
                    Spacer()
                    Text("\(completedPercent)%")
                        .foregroundStyle(.secondary)
                }
            }
            if let exam = appState.selectedExam {
                Section(exam.name) {
                    HStack {
                        Text("Total Questions")
                        Spacer()
                        Text("\(exam.totalQuestions)")
                            .foregroundStyle(.secondary)
                    }
                }
            }
        }
        .navigationTitle("Summary")
    }

    private var completedPercent: Int {
        guard let exam = appState.selectedExam else { return 0 }
        guard exam.totalQuestions > 0 else { return 0 }
        let answered = appState.currentSession?.answers.count ?? 0
        return min(100, Int((Double(answered) / Double(exam.totalQuestions)) * 100))
    }

    private var scorePercent: Int {
        guard let session = appState.currentSession, !session.answers.isEmpty else { return 0 }
        let correct = session.answers.values.filter { $0.isCorrect }.count
        return Int((Double(correct) / Double(session.answers.count)) * 100)
    }
}

private struct UpgradeBenefitsView: View {
    @Environment(AppState.self) private var appState

    var body: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 18) {
                HStack {
                    Button {
                        appState.currentSession = nil
                        appState.selectedExam = nil
                    } label: {
                        Image(systemName: "line.3.horizontal")
                            .font(.system(size: 14, weight: .black))
                            .foregroundStyle(AppTheme.primaryText)
                            .frame(width: 24, height: 24)
                            .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Back to exam list")
                    Spacer()
                }
                .padding(.horizontal, 16)
                .padding(.top, 10)

                VStack(alignment: .leading, spacing: 6) {
                    Text("Upgrade to Premium")
                        .font(.system(size: 34, weight: .bold, design: .rounded))
                        .foregroundStyle(AppTheme.primaryText)
                        .lineLimit(2)
                        .minimumScaleFactor(0.9)
                    Text("Unlock every feature with no limits.")
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(AppTheme.secondaryText)
                }
                .padding(.horizontal, 16)

                VStack(spacing: 0) {
                    BenefitRow(icon: "infinity", title: "Unlimited Questions", subtitle: "Practice as much as you want", tint: AppTheme.accentBlue)
                    BenefitRow(icon: "chart.xyaxis.line", title: "Advanced Analytics", subtitle: "Deep insights into performance", tint: AppTheme.flameOrange)
                    BenefitRow(icon: "arrow.down.circle.fill", title: "Offline Access", subtitle: "Study anywhere, anytime", tint: AppTheme.accentGreen)
                    BenefitRow(icon: "wand.and.stars", title: "AI Assistant", subtitle: "Get smarter explanations", tint: AppTheme.accentRed)
                    BenefitRow(icon: "crown.fill", title: "Priority Support", subtitle: "Skip the line when you need help", tint: AppTheme.accentBlue)
                }
                .frame(maxWidth: .infinity)
                .background(AppTheme.surface)
                .overlay(
                    RoundedRectangle(cornerRadius: 0, style: .continuous)
                        .stroke(AppTheme.divider, lineWidth: 1)
                )

                Button {
                    appState.showPaywall = true
                } label: {
                    HStack {
                        Spacer()
                        Text("Upgrade Now")
                            .font(.headline.weight(.bold))
                        Spacer()
                    }
                    .foregroundStyle(.white)
                    .padding(.vertical, 16)
                    .background(AppTheme.accentBlue)
                    .clipShape(Capsule())
                }
                .padding(.horizontal, 16)
                .padding(.bottom, 28)
            }
        }
        .background(AppTheme.backgroundGradient)
        .toolbar(.hidden, for: .navigationBar)
    }
}

private struct BenefitRow: View {
    let icon: String
    let title: String
    let subtitle: String
    let tint: Color

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: icon)
                .foregroundStyle(tint)
                .frame(width: 24)
            VStack(alignment: .leading, spacing: 2) {
                Text(title).font(.headline).foregroundStyle(AppTheme.primaryText)
                Text(subtitle).font(.caption).foregroundStyle(AppTheme.secondaryText)
            }
            Spacer()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .overlay(alignment: .bottom) {
            Rectangle()
                .fill(AppTheme.divider)
                .frame(height: 1)
                .padding(.horizontal, 16)
                .opacity(title == "Priority Support" ? 0 : 1)
        }
    }
}

#Preview { NewMainDashboardView().environment(AppState()) }
