import SwiftUI

// MARK: - Health Summary Widget
//
// A single large, glanceable card that covers every tracked category at
// once. Each row is tagged with either a check icon (on track, score ≥ 70)
// or an alert icon (needs attention, score < 70). NA categories get a
// neutral dash so they are not mistaken for a failing metric.
//
// Layout:
//   • Header  — title + live/sync state
//   • Ring    — overall ratio of on-track vs attention
//   • Stats   — On Track / Attention / Total
//   • Grid    — 2-column list of all categories with status icon

struct HealthSummaryWidget: View {
    let categories: [HealthCategoryItem]

    @Environment(\.colorScheme) private var colorScheme
    @State private var appeared = false

    // MARK: Derived

    private var scoreable: [HealthCategoryItem] {
        categories.filter { !$0.isNA }
    }

    private var onTrackCount: Int {
        scoreable.filter { $0.score >= 70 }.count
    }

    private var attentionCount: Int {
        scoreable.filter { $0.score < 70 }.count
    }

    private var naCount: Int {
        categories.count - scoreable.count
    }

    private var onTrackRatio: Double {
        guard !scoreable.isEmpty else { return 0 }
        return Double(onTrackCount) / Double(scoreable.count)
    }

    private var overallColor: Color {
        if onTrackRatio >= 0.85 { return Theme.excellent }
        if onTrackRatio >= 0.60 { return Theme.good }
        if onTrackRatio >= 0.40 { return Theme.fair }
        return Theme.poor
    }

    // MARK: Body

    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            header
            topRow
            divider
            categoryGrid
            footer
        }
        .padding(18)
        .frame(maxWidth: .infinity, alignment: .leading)
        .cardSurface(cornerRadius: Theme.Radius.xl)
        .opacity(appeared ? 1 : 0)
        .offset(y: appeared ? 0 : 12)
        .onAppear {
            withAnimation(.easeOut(duration: 0.55).delay(0.10)) {
                appeared = true
            }
        }
    }

    // MARK: Header

    private var header: some View {
        HStack(alignment: .firstTextBaseline) {
            VStack(alignment: .leading, spacing: 3) {
                Text("SUMMARY")
                    .font(.eyebrow(9))
                    .tracking(1.2)
                    .foregroundStyle(Theme.textTertiary(colorScheme))
                Text("Health at a Glance")
                    .font(.system(size: 18, weight: .bold, design: .rounded))
                    .foregroundStyle(Theme.textPrimary(colorScheme))
            }

            Spacer()

            HStack(spacing: 5) {
                Circle()
                    .fill(overallColor)
                    .frame(width: 6, height: 6)
                Text("\(onTrackCount)/\(scoreable.count) on track")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundStyle(Theme.textSecondary(colorScheme))
            }
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(
                Capsule().fill(Theme.fillTrack(colorScheme))
            )
        }
    }

    // MARK: Top row — ring + stats

    private var topRow: some View {
        HStack(spacing: 14) {
            ringGauge

            VStack(spacing: 8) {
                statPill(
                    icon: "checkmark.circle.fill",
                    count: onTrackCount,
                    label: "On Track",
                    color: Theme.excellent
                )
                statPill(
                    icon: "exclamationmark.triangle.fill",
                    count: attentionCount,
                    label: "Attention",
                    color: Theme.poor
                )
            }
            .frame(maxWidth: .infinity)
        }
    }

    private var ringGauge: some View {
        ZStack {
            Circle()
                .stroke(Theme.fillTrack(colorScheme), lineWidth: 10)

            Circle()
                .trim(from: 0, to: appeared ? onTrackRatio : 0)
                .stroke(
                    AngularGradient(
                        colors: [
                            overallColor.opacity(0.7),
                            overallColor
                        ],
                        center: .center
                    ),
                    style: StrokeStyle(lineWidth: 10, lineCap: .round)
                )
                .rotationEffect(.degrees(-90))
                .animation(.easeOut(duration: 0.9), value: appeared)

            VStack(spacing: 0) {
                Text("\(Int(onTrackRatio * 100))")
                    .font(.display(26, weight: .bold))
                    .foregroundStyle(Theme.textPrimary(colorScheme))
                    .monospacedDigit()
                Text("percent")
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundStyle(Theme.textTertiary(colorScheme))
                    .tracking(0.6)
            }
        }
        .frame(width: 96, height: 96)
    }

    private func statPill(icon: String, count: Int, label: String, color: Color) -> some View {
        HStack(spacing: 10) {
            ZStack {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(color.opacity(colorScheme == .dark ? 0.18 : 0.14))
                    .frame(width: 30, height: 30)
                Image(systemName: icon)
                    .font(.system(size: 13, weight: .bold))
                    .foregroundStyle(color)
            }

            VStack(alignment: .leading, spacing: 0) {
                Text("\(count)")
                    .font(.display(18, weight: .bold))
                    .foregroundStyle(Theme.textPrimary(colorScheme))
                    .monospacedDigit()
                Text(label)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundStyle(Theme.textSecondary(colorScheme))
                    .tracking(0.3)
            }

            Spacer(minLength: 0)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: Theme.Radius.sm, style: .continuous)
                .fill(color.opacity(colorScheme == .dark ? 0.06 : 0.045))
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.Radius.sm, style: .continuous)
                        .strokeBorder(color.opacity(0.18), lineWidth: 0.5)
                )
        )
    }

    // MARK: Divider

    private var divider: some View {
        HStack(spacing: 10) {
            Text("CATEGORIES")
                .font(.eyebrow(9))
                .tracking(1.1)
                .foregroundStyle(Theme.textTertiary(colorScheme))

            Rectangle()
                .fill(Theme.hairline(colorScheme))
                .frame(height: 0.5)

            Text("\(categories.count)")
                .font(.monoDigit(10, weight: .bold))
                .foregroundStyle(Theme.textQuaternary(colorScheme))
        }
    }

    // MARK: Category grid

    private var columns: [GridItem] {
        [
            GridItem(.flexible(), spacing: 8),
            GridItem(.flexible(), spacing: 8)
        ]
    }

    private var categoryGrid: some View {
        LazyVGrid(columns: columns, spacing: 8) {
            ForEach(categories) { cat in
                categoryCell(cat)
            }
        }
    }

    private func categoryCell(_ item: HealthCategoryItem) -> some View {
        let onTrack = !item.isNA && item.score >= 70
        let na      = item.isNA
        let tone: Color = {
            if na { return Theme.textQuaternary(colorScheme) }
            return onTrack ? Theme.excellent : Theme.poor
        }()

        return HStack(spacing: 9) {
            // Category icon chip
            ZStack {
                RoundedRectangle(cornerRadius: 7, style: .continuous)
                    .fill(item.type.color.opacity(colorScheme == .dark ? 0.18 : 0.14))
                    .frame(width: 26, height: 26)
                Image(systemName: item.type.icon)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(item.type.color)
            }

            VStack(alignment: .leading, spacing: 1) {
                Text(item.type.shortName)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(Theme.textPrimary(colorScheme))
                    .lineLimit(1)

                Text(na ? "N/A" : "\(Int(item.score))/100")
                    .font(.monoDigit(9, weight: .semibold))
                    .foregroundStyle(Theme.textTertiary(colorScheme))
            }

            Spacer(minLength: 2)

            // Status icon — check or alert (or dash for NA)
            statusIcon(onTrack: onTrack, na: na, tone: tone)
        }
        .padding(.horizontal, 9)
        .padding(.vertical, 8)
        .background(
            RoundedRectangle(cornerRadius: Theme.Radius.sm, style: .continuous)
                .fill(
                    colorScheme == .dark
                        ? Color.white.opacity(0.035)
                        : Color.black.opacity(0.025)
                )
                .overlay(
                    RoundedRectangle(cornerRadius: Theme.Radius.sm, style: .continuous)
                        .strokeBorder(tone.opacity(na ? 0.10 : 0.22), lineWidth: 0.5)
                )
        )
    }

    private func statusIcon(onTrack: Bool, na: Bool, tone: Color) -> some View {
        ZStack {
            Circle()
                .fill(tone.opacity(na ? 0.10 : 0.18))
                .frame(width: 20, height: 20)

            Image(systemName: na
                  ? "minus"
                  : (onTrack ? "checkmark" : "exclamationmark"))
                .font(.system(size: 10, weight: .heavy))
                .foregroundStyle(tone)
        }
    }

    // MARK: Footer

    private var footer: some View {
        HStack(spacing: 6) {
            Image(systemName: footerIcon)
                .font(.system(size: 10, weight: .semibold))
                .foregroundStyle(overallColor)

            Text(footerMessage)
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(Theme.textSecondary(colorScheme))
                .lineLimit(2)

            Spacer(minLength: 0)
        }
        .padding(.top, 2)
    }

    private var footerIcon: String {
        if attentionCount == 0 { return "sparkles" }
        if attentionCount <= 2 { return "hand.thumbsup.fill" }
        return "arrow.up.right.circle.fill"
    }

    private var footerMessage: String {
        if scoreable.isEmpty {
            return "Connect Apple Health or log data to start tracking."
        }
        if attentionCount == 0 {
            return "Everything is on track — keep the momentum going."
        }
        if attentionCount == 1 {
            let name = scoreable
                .filter { $0.score < 70 }
                .first?.type.rawValue ?? "one area"
            return "\(name) needs a closer look this week."
        }
        return "\(attentionCount) categories could use attention — tap to explore."
    }
}

// MARK: - Preview

#Preview {
    ScrollView {
        HealthSummaryWidget(
            categories: HealthCategoryItem.sampleCategories()
        )
        .padding()
    }
    .background(Theme.background)
}
