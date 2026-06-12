import SwiftUI
import ClerkKit
import ClerkKitUI

struct FixedHeader: View {
    @Environment(AppState.self) private var appState

    let title: String
    var subtitle: String? = nil
    var showHome: Bool = true

    @State private var showDetail: HeaderStat? = nil

    enum HeaderStat: String, Identifiable {
        case streak, progress, rank
        var id: String { rawValue }
    }

    var body: some View {
        HStack(spacing: 10) {
            if showHome {
                Button {
                    appState.selectedExam = nil
                } label: {
                    Image(systemName: "house.fill")
                        .font(.subheadline.bold())
                        .foregroundStyle(AppTheme.primaryText)
                        .frame(width: 34, height: 34)
                        .background(AppTheme.surface)
                        .clipShape(Circle())
                }
                .buttonStyle(.plain)
            }

            VStack(alignment: .leading, spacing: 1) {
                Text("Scoorly")
                    .font(.headline.bold())
                    .foregroundStyle(AppTheme.primaryText)
                Text(title)
                    .font(.caption)
                    .foregroundStyle(AppTheme.secondaryText)
                if let subtitle {
                    Text(subtitle)
                        .font(.caption2)
                        .foregroundStyle(AppTheme.secondaryText.opacity(0.85))
                }
            }

            Spacer()

            statChip(icon: "flame.fill", value: "\(appState.currentUser?.currentStreak ?? 0)", tint: AppTheme.flameOrange) { showDetail = .streak }
            statChip(icon: "chart.bar.fill", value: "\(progressPercent)%", tint: AppTheme.accentBlue) { showDetail = .progress }
            statChip(icon: "rosette", value: "#\(rank)", tint: AppTheme.accentGreen) { showDetail = .rank }

            UserButton(signedOutContent: {
                EmptyView()
            })
            .frame(width: 34, height: 34)

            Button {
                appState.showPaywall = true
            } label: {
                Text(appState.currentUser?.isPremium == true ? "PRO" : "Upgrade")
                    .font(.caption.bold())
                    .foregroundStyle(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(AppTheme.accentBlue)
                    .clipShape(Capsule())
            }
            .buttonStyle(.plain)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(AppTheme.bgTop)
        .overlay(alignment: .bottom) { Divider().opacity(0.4) }
        .sheet(item: $showDetail) { stat in
            HeaderStatDetailView(stat: stat, streak: appState.currentUser?.currentStreak ?? 0, progress: progressPercent, rank: rank)
        }
    }

    private var progressPercent: Int {
        guard let exam = appState.selectedExam else { return 0 }
        let answered = appState.currentSession?.answers.count ?? 0
        guard exam.totalQuestions > 0 else { return 0 }
        return min(100, Int((Double(answered) / Double(exam.totalQuestions)) * 100))
    }

    private var rank: Int {
        max(1, 140 - (appState.currentUser?.totalPoints ?? 0) / 20)
    }

    private func statChip(icon: String, value: String, tint: Color, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.caption.bold())
                Text(value)
                    .font(.caption.bold())
            }
            .foregroundStyle(tint)
            .padding(.horizontal, 9)
            .padding(.vertical, 6)
            .background(AppTheme.surface)
            .clipShape(Capsule())
        }
        .buttonStyle(.plain)
    }
}

private struct HeaderStatDetailView: View {
    @Environment(\.dismiss) private var dismiss
    let stat: FixedHeader.HeaderStat
    let streak: Int
    let progress: Int
    let rank: Int

    var body: some View {
        NavigationStack {
            VStack(alignment: .leading, spacing: 12) {
                Text(title)
                    .font(.title.bold())
                Text(detail)
                    .font(.body)
                    .foregroundStyle(AppTheme.secondaryText)
                VStack(alignment: .leading, spacing: 6) {
                    Text("Compare with others")
                        .font(.headline)
                    Text("You: \(youText)")
                    Text("Average user: \(avgText)")
                    Text("Top 10%: \(topText)")
                }
                .font(.subheadline)
                .padding(12)
                .background(AppTheme.surface)
                .clipShape(RoundedRectangle(cornerRadius: 14))
                Spacer()
            }
            .padding()
            .toolbar { ToolbarItem(placement: .topBarTrailing) { Button("Dismiss") { dismiss() } } }
        }
    }

    private var title: String {
        switch stat {
        case .streak: return "Streak details"
        case .progress: return "Progress details"
        case .rank: return "Rank details"
        }
    }

    private var detail: String {
        switch stat {
        case .streak: return "Your current streak is \(streak) days. Stay consistent to improve retention."
        case .progress: return "You have completed \(progress)% of your selected exam content."
        case .rank: return "Current rank is #\(rank) among active users in this exam category."
        }
    }

    private var youText: String {
        switch stat {
        case .streak: return "\(streak) days"
        case .progress: return "\(progress)%"
        case .rank: return "#\(rank)"
        }
    }

    private var avgText: String {
        switch stat {
        case .streak: return "4 days"
        case .progress: return "36%"
        case .rank: return "#88"
        }
    }

    private var topText: String {
        switch stat {
        case .streak: return "21 days"
        case .progress: return "79%"
        case .rank: return "#12"
        }
    }
}
