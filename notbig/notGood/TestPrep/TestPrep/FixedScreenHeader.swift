import SwiftUI

struct FixedScreenHeader: View {
    @Environment(AppState.self) private var appState

    let title: String
    var showsBackButton: Bool = true
    var showsBottomDivider: Bool = true
    var onBackTap: (() -> Void)? = nil

    @State private var activeSheet: ActiveSheet?

    private enum ActiveSheet: String, Identifiable {
        case streak
        case leaderboard
        case score
        case examCountdown
        var id: String { rawValue }
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 12) {
                if showsBackButton {
                    Button {
                        if let onBackTap {
                            onBackTap()
                        } else {
                            appState.currentSession = nil
                            appState.selectedExam = nil
                        }
                    } label: {
                        Image(systemName: "line.3.horizontal")
                        .font(.system(size: 14, weight: .black))
                            .foregroundStyle(AppTheme.primaryText)
                            .frame(width: 24, height: 24)
                            .contentShape(Rectangle())
                    }
                    .buttonStyle(.plain)
                    .accessibilityLabel("Back to exam list")
                }
                Spacer()
            }
            .padding(.horizontal, 16)
            .padding(.top, 6)
            .padding(.bottom, 4)

            Text(title)
                .font(.system(size: 28, weight: .bold, design: .rounded))
                .foregroundStyle(AppTheme.primaryText)
                .lineLimit(2)
                .minimumScaleFactor(0.9)
                .layoutPriority(1)
                .padding(.horizontal, 16)
                .padding(.bottom, 8)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 6) {
                    Button {
                        activeSheet = .streak
                    } label: {
                        badge(icon: "flame.fill", value: "\(streak)", tint: AppTheme.flameOrange)
                    }
                    .buttonStyle(.plain)

                    Button {
                        activeSheet = .leaderboard
                    } label: {
                        badge(icon: "crown.fill", value: "\(rank)", tint: AppTheme.accentBlue)
                    }
                    .buttonStyle(.plain)

                    Button {
                        activeSheet = .score
                    } label: {
                        badge(icon: "chart.bar.fill", value: "\(scorePercent)", tint: AppTheme.accentGreen)
                    }
                    .buttonStyle(.plain)

                    Button {
                        activeSheet = .examCountdown
                    } label: {
                        badge(icon: "calendar", value: countdownDaysText, tint: AppTheme.accentRed)
                    }
                    .buttonStyle(.plain)
                }
                .padding(.horizontal, 16)
            }
            .padding(.bottom, 8)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(AppTheme.bgTop)
        .overlay(alignment: .bottom) {
            if showsBottomDivider {
                Divider().opacity(0.3)
            }
        }
        .sheet(item: $activeSheet) { sheet in
            switch sheet {
            case .streak:
                StreakDetailSheet(streak: streak, studyTimeSeconds: studyTimeSeconds)
            case .leaderboard:
                LeaderboardDetailSheet(rank: rank, entries: appState.leaderboard)
            case .score:
                ScoreDetailSheet(scorePercent: scorePercent)
            case .examCountdown:
                ExamCountdownSheet(
                    examName: appState.selectedExam?.name ?? "Exam",
                    currentDate: appState.examDate(for: appState.selectedExam?.id),
                    onSave: { newDate in
                        appState.setExamDate(newDate, for: appState.selectedExam?.id)
                    }
                )
            }
        }
    }

    private var streak: Int {
        let value = appState.currentUser?.currentStreak ?? 0
        return max(7, value)
    }

    private var rank: Int {
        max(1, 140 - (appState.currentUser?.totalPoints ?? 0) / 20)
    }

    private var studyTimeSeconds: TimeInterval {
        appState.currentSession?.answers.values.reduce(0.0) { $0 + $1.timeSpent } ?? 0
    }

    private var scorePercent: Int {
        guard let session = appState.currentSession, !session.answers.isEmpty else { return 68 }
        let correct = session.answers.values.filter(\.isCorrect).count
        return max(1, Int((Double(correct) / Double(session.answers.count)) * 100))
    }

    private var countdownDaysText: String {
        guard let date = appState.examDate(for: appState.selectedExam?.id) else { return "Set" }
        let days = Calendar.current.dateComponents([.day], from: Calendar.current.startOfDay(for: Date()), to: Calendar.current.startOfDay(for: date)).day ?? 0
        return "\(max(0, days))"
    }

    private func badge(icon: String, value: String, tint: Color) -> some View {
        HStack(spacing: 5) {
            Image(systemName: icon)
                .font(.system(size: 12, weight: .bold))
                .foregroundStyle(tint)
            Text(value)
                .font(.system(size: 13, weight: .heavy, design: .rounded))
                .monospacedDigit()
                .foregroundStyle(AppTheme.primaryText)
                .lineLimit(1)
                .fixedSize(horizontal: true, vertical: false)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 6)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(AppTheme.surface)
        )
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(AppTheme.divider, lineWidth: 0.8)
        )
        .clipShape(Capsule())
        .fixedSize(horizontal: true, vertical: false)
    }
}

private struct LeaderboardDetailSheet: View {
    @Environment(\.dismiss) private var dismiss
    let rank: Int
    let entries: [LeaderboardEntry]

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 14) {
                HStack(spacing: 8) {
                    Image(systemName: "crown.fill")
                        .foregroundStyle(AppTheme.accentBlue)
                    Text("Leaderboard position \(rank)")
                        .font(.title3.weight(.bold))
                        .foregroundStyle(AppTheme.primaryText)
                }

                CompareCard(
                    title: "Compared with other users",
                    items: [
                        .init(label: "You", valueText: "Pos \(rank)", score: Double(max(1, 100 - rank)), tint: AppTheme.accentBlue),
                        .init(label: "Average", valueText: "Pos 46", score: 54, tint: AppTheme.secondaryText),
                        .init(label: "Top", valueText: "Pos 1", score: 99, tint: AppTheme.flameOrange)
                    ]
                )

                VStack(spacing: 8) {
                    ForEach(entries.prefix(5)) { entry in
                        HStack {
                            Text("\(entry.rank)")
                                .font(.subheadline.weight(.bold))
                                .frame(width: 24, alignment: .leading)
                            Text(entry.userName)
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(AppTheme.primaryText)
                            Spacer()
                            Text("\(entry.totalPoints)")
                                .font(.subheadline.weight(.bold))
                                .foregroundStyle(AppTheme.secondaryText)
                        }
                        .padding(.vertical, 3)
                    }
                }
                .padding(12)
                .background(AppTheme.surface)
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(AppTheme.divider, lineWidth: 1)
                )

                Spacer()
            }
            .padding(16)
            .background(AppTheme.backgroundGradient)
            .navigationTitle("Leaderboard")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }
}

private struct StreakDetailSheet: View {
    @Environment(\.dismiss) private var dismiss
    let streak: Int
    let studyTimeSeconds: TimeInterval

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                HStack {
                    Image(systemName: "flame.fill")
                        .font(.title2.weight(.bold))
                        .foregroundStyle(AppTheme.flameOrange)
                    Text("\(streak) day streak")
                        .font(.title2.weight(.bold))
                        .foregroundStyle(AppTheme.primaryText)
                }

                HStack(spacing: 8) {
                    ForEach(Array(weekStatus.enumerated()), id: \.offset) { _, item in
                        VStack(spacing: 6) {
                            Text(item.day)
                                .font(.caption2.weight(.semibold))
                                .foregroundStyle(AppTheme.secondaryText)
                            Circle()
                                .fill(item.done ? AppTheme.flameOrange : AppTheme.divider)
                                .frame(width: 14, height: 14)
                        }
                        .frame(maxWidth: .infinity)
                    }
                }
                .padding(12)
                .background(AppTheme.surface)
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(AppTheme.divider, lineWidth: 1)
                )

                CompareCard(
                    title: "Compared with other users",
                    items: [
                        .init(label: "You", valueText: "\(streak) days", score: Double(streak), tint: AppTheme.accentBlue),
                        .init(label: "Average", valueText: "5 days", score: 5, tint: AppTheme.secondaryText)
                    ]
                )

                HStack {
                    Text("Practice time today")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(AppTheme.primaryText)
                    Spacer()
                    Text("\(formattedDuration(studyTimeSeconds)) • avg 45 min")
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(AppTheme.secondaryText)
                }
                .padding(12)
                .background(AppTheme.surface)
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(AppTheme.divider, lineWidth: 1)
                )

                Text("Next milestone: \(nextMilestone) days")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(AppTheme.secondaryText)

                Spacer()
            }
            .padding(16)
            .background(AppTheme.backgroundGradient)
            .navigationTitle("Streak")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private var nextMilestone: Int {
        if streak < 7 { return 7 }
        if streak < 14 { return 14 }
        if streak < 30 { return 30 }
        return 60
    }

    private var weekStatus: [(day: String, done: Bool)] {
        let days = ["M", "T", "W", "T", "F", "S", "S"]
        let doneCount = min(7, max(0, streak))
        return days.enumerated().map { index, day in
            (day: day, done: index >= (7 - doneCount))
        }
    }

    private func formattedDuration(_ seconds: TimeInterval) -> String {
        if seconds < 3600 {
            return "\(max(0, Int(seconds / 60))) min"
        }
        let hours = Int(seconds) / 3600
        let minutes = (Int(seconds) % 3600) / 60
        return "\(hours)h \(minutes)m"
    }
}

private struct ScoreDetailSheet: View {
    @Environment(\.dismiss) private var dismiss
    let scorePercent: Int

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 16) {
                Text("Current Score")
                    .font(.title3.weight(.bold))
                    .foregroundStyle(AppTheme.primaryText)

                Text("\(scorePercent)%")
                    .font(.system(size: 40, weight: .heavy, design: .rounded))
                    .foregroundStyle(AppTheme.accentGreen)

                CompareCard(
                    title: "Compared with other users",
                    items: [
                        .init(label: "You", valueText: "\(scorePercent)%", score: Double(scorePercent), tint: AppTheme.accentBlue),
                        .init(label: "Average", valueText: "62%", score: 62, tint: AppTheme.secondaryText),
                        .init(label: "Top", valueText: "89%", score: 89, tint: AppTheme.flameOrange)
                    ]
                )

                Text("Score is calculated from correct answers out of 100%.")
                    .font(.caption)
                    .foregroundStyle(AppTheme.secondaryText)

                Spacer()
            }
            .padding(16)
            .background(AppTheme.backgroundGradient)
            .navigationTitle("Score")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") { dismiss() }
                }
            }
        }
        .presentationDetents([.medium, .large])
    }
}

private struct ExamCountdownSheet: View {
    @Environment(\.dismiss) private var dismiss
    let examName: String
    let currentDate: Date?
    let onSave: (Date?) -> Void

    @State private var selectedDate: Date = Date().addingTimeInterval(86400 * 30)

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 14) {
                Text("Set exam date for \(examName)")
                    .font(.headline)
                    .foregroundStyle(AppTheme.primaryText)

                DatePicker(
                    "Exam date",
                    selection: $selectedDate,
                    in: Date()...,
                    displayedComponents: .date
                )
                .datePickerStyle(.compact)
                .padding(8)
                .background(AppTheme.surface)
                .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(AppTheme.divider, lineWidth: 1)
                )

                CompareCard(
                    title: "Compared with other users",
                    items: [
                        .init(label: "You", valueText: "\(countdownDays(from: selectedDate)) days left", score: max(1, 60 - Double(countdownDays(from: selectedDate))), tint: AppTheme.accentBlue),
                        .init(label: "Average", valueText: "28 days left", score: 32, tint: AppTheme.secondaryText),
                        .init(label: "Top", valueText: "14 days left", score: 46, tint: AppTheme.flameOrange)
                    ]
                )

                Spacer()
            }
            .padding(16)
            .background(AppTheme.backgroundGradient)
            .navigationTitle("Exam Countdown")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Clear") {
                        onSave(nil)
                        dismiss()
                    }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Save") {
                        onSave(selectedDate)
                        dismiss()
                    }
                }
            }
            .onAppear {
                if let currentDate {
                    selectedDate = currentDate
                }
            }
        }
        .presentationDetents([.medium, .large])
    }

    private func countdownDays(from date: Date) -> Int {
        max(0, Calendar.current.dateComponents([.day], from: Calendar.current.startOfDay(for: Date()), to: Calendar.current.startOfDay(for: date)).day ?? 0)
    }
}

private struct CompareCard: View {
    struct Item: Identifiable {
        let id = UUID()
        let label: String
        let valueText: String
        let score: Double
        let tint: Color
    }

    let title: String
    let items: [Item]

    private var maxScore: Double {
        max(1, items.map(\.score).max() ?? 1)
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text(title)
                .font(.headline)
                .foregroundStyle(AppTheme.primaryText)

            ForEach(items) { item in
                VStack(alignment: .leading, spacing: 4) {
                    HStack {
                        Text(item.label)
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(AppTheme.secondaryText)
                        Spacer()
                        Text(item.valueText)
                            .font(.caption.weight(.bold))
                            .foregroundStyle(AppTheme.primaryText)
                    }
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 4)
                                .fill(AppTheme.divider.opacity(0.45))
                            RoundedRectangle(cornerRadius: 4)
                                .fill(item.tint.opacity(0.85))
                                .frame(width: geo.size.width * max(0.06, min(1.0, item.score / maxScore)))
                        }
                    }
                    .frame(height: 8)
                }
            }
        }
        .padding(12)
        .background(AppTheme.surface)
        .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .stroke(AppTheme.divider, lineWidth: 1)
        )
    }
}

#Preview {
    VStack(spacing: 0) {
        FixedScreenHeader(title: "Learn")
            .environment(AppState())
        Spacer()
    }
}
