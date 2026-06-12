import SwiftUI

struct AppHeader: View {
    struct Model {
        var streak: Int
        var isPaid: Bool
        var creditsUsedToday: Int
        var rank: Int?
        var progressPercent: Int // 0...100
        var examName: String?
    }

    var model: Model

    var body: some View {
        ZStack {
            // Subtle material-like background
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .fill(.ultraThinMaterial)
                .overlay(
                    RoundedRectangle(cornerRadius: 18, style: .continuous)
                        .stroke(Color.black.opacity(0.06), lineWidth: 0.5)
                )

            HStack(spacing: 12) {
                // App name + optional exam context
                HStack(spacing: 8) {
                    Text("Scoorly")
                        .font(.system(size: 22, weight: .bold, design: .rounded))
                        .foregroundStyle(AppTheme.primaryText)
                    if let exam = model.examName, !exam.isEmpty {
                        Text(exam)
                            .font(.footnote.weight(.semibold))
                            .foregroundStyle(AppTheme.secondaryText)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 5)
                            .background(AppTheme.bgMid.opacity(0.8))
                            .clipShape(Capsule())
                    }
                }

                Spacer(minLength: 8)

                // Badges row
                HStack(spacing: 8) {
                    HeaderBadge(icon: "flame.fill", valueText: "\(model.streak)")

                    HeaderBadge(icon: "bolt.fill", valueText: creditsText, tint: creditsTint)

                    HeaderBadge(icon: "trophy.fill", valueText: rankText)

                    HeaderBadge(icon: "chart.bar.fill", valueText: "\(model.progressPercent)%", tint: progressTint)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
        }
        .frame(height: 56)
        .padding(.horizontal)
        .padding(.top, 8)
        .accessibilityElement(children: .contain)
        .accessibilityLabel("App header")
    }

    private var creditsText: String {
        if model.isPaid { return "∞" }
        let remaining = max(0, 30 - model.creditsUsedToday)
        return "\(remaining)"
    }

    private var creditsTint: Color {
        model.isPaid ? AppTheme.accentBlue : AppTheme.flameOrange
    }

    private var rankText: String {
        if let rank = model.rank { return "\(rank)" }
        return "—"
    }

    private var progressTint: Color {
        switch model.progressPercent {
        case ..<60: return AppTheme.accentRed
        case 60...89: return AppTheme.flameOrange
        default: return AppTheme.accentBlue
        }
    }
}

private struct HeaderBadge: View {
    var icon: String
    var valueText: String
    var tint: Color = .primary

    var body: some View {
        HStack(spacing: 6) {
            Image(systemName: icon)
                .font(.caption)
                .foregroundStyle(tint)
            Text(valueText)
                .font(.footnote.weight(.semibold))
                .foregroundStyle(AppTheme.primaryText)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(AppTheme.surface.opacity(0.95))
        )
        .overlay(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .stroke(AppTheme.divider.opacity(0.9), lineWidth: 0.7)
        )
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
    }
}

#Preview {
    VStack(spacing: 0) {
        AppHeader(model: .init(streak: 7, isPaid: false, creditsUsedToday: 4, rank: 12, progressPercent: 33, examName: "SAT"))
        Spacer()
    }
    .background(AppTheme.backgroundGradient)
}
