import SwiftUI

// MARK: - NA Pill
//
// Shown in place of the status / score pill when a category has no
// readable data on this platform (for example Digital Wellness — iOS
// does not expose Screen Time values to third-party apps). Keeping
// this UI visually neutral prevents the app from implying a Critical
// status where the truth is simply that we cannot measure.

struct NAPill: View {
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        Text("NA")
            .font(.system(size: 9, weight: .semibold))
            .foregroundStyle(Theme.textSecondary(colorScheme))
            .padding(.horizontal, 7)
            .padding(.vertical, 3)
            .background(Capsule().fill(Theme.fillTrack(colorScheme)))
    }
}

// MARK: - Category Row Card (style-aware dispatcher)

struct CategoryRowCard: View {
    let item: HealthCategoryItem
    var style: CardStyle = .simplified

    var body: some View {
        switch style {
        case .minimal:    MinimalCategoryCard(item: item)
        case .simplified: SimplifiedCategoryCard(item: item)
        case .detailed:   DetailedCategoryCard(item: item)
        case .stats:      StatsCategoryCard(item: item)
        case .gauge:      GaugeCategoryCard(item: item)
        case .bars:       BarsCategoryCard(item: item)
        case .trend:      TrendCategoryCard(item: item)
        }
    }
}

// MARK: - Minimal

struct MinimalCategoryCard: View {
    let item: HealthCategoryItem
    @Environment(\.colorScheme) var colorScheme

    private let barCount = 24

    var body: some View {
        HStack(spacing: 10) {
            Image(systemName: item.type.icon)
                .font(.system(size: 14, weight: .semibold))
                .foregroundStyle(item.isNA ? Theme.textSecondary(colorScheme) : item.status.themeColor)
                .frame(width: 22)

            Text(item.type.shortName)
                .font(.system(size: 13, weight: .semibold))
                .foregroundStyle(Theme.textPrimary(colorScheme))
                .lineLimit(1)
                .frame(width: 70, alignment: .leading)

            if item.isNA {
                SegmentedProgressBar(
                    progress: 0,
                    total: barCount,
                    color: Theme.fillTrack(colorScheme),
                    trackColor: Theme.fillTrack(colorScheme)
                )
                .frame(height: 22)
            } else {
                SegmentedProgressBar(
                    progress: item.score / 100,
                    total: barCount,
                    color: item.status.themeColor,
                    trackColor: Theme.fillTrack(colorScheme)
                )
                .frame(height: 22)
            }

            Text(item.isNA ? "NA" : "\(Int(item.score))%")
                .font(.monoDigit(14, weight: .bold))
                .foregroundStyle(item.isNA ? Theme.textSecondary(colorScheme) : Theme.textPrimary(colorScheme))
                .frame(width: 46, alignment: .trailing)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .glassEffect(
            .regular.interactive(),
            in: RoundedRectangle(cornerRadius: Theme.Radius.md, style: .continuous)
        )
    }
}

// MARK: - Simplified

struct SimplifiedCategoryCard: View {
    let item: HealthCategoryItem
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        HStack(spacing: 14) {
            iconBadge

            VStack(alignment: .leading, spacing: 4) {
                Text(item.type.rawValue)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(Theme.textPrimary(colorScheme))
                if item.isNA {
                    NAPill()
                } else {
                    StatusPill(status: item.status)
                }
            }

            Spacer(minLength: 4)

            Text(item.isNA ? "NA" : "\(Int(item.score))")
                .font(.display(22, weight: .bold))
                .foregroundStyle(item.isNA ? Theme.textSecondary(colorScheme) : item.status.themeColor)
                .monospacedDigit()
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 12)
        .glassEffect(
            .regular.interactive(),
            in: RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
        )
    }

    private var iconBadge: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(item.type.color.opacity(0.14))
                .frame(width: 40, height: 40)
            Image(systemName: item.type.icon)
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(item.type.color)
        }
    }
}

// MARK: - Detailed

struct DetailedCategoryCard: View {
    let item: HealthCategoryItem
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        HStack(spacing: 14) {
            iconBadge

            VStack(alignment: .leading, spacing: 4) {
                Text(item.type.rawValue)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Theme.textPrimary(colorScheme))

                Text(item.type.tagLine)
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.textSecondary(colorScheme))
                    .lineLimit(1)

                HStack(spacing: 6) {
                    if item.isNA {
                        NAPill()
                    } else {
                        StatusPill(status: item.status)
                    }
                    Text(item.lastUpdated)
                        .font(.system(size: 9))
                        .foregroundStyle(Theme.textTertiary(colorScheme))
                }
            }

            Spacer(minLength: 4)

            scoreRing
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 13)
        .glassEffect(
            .regular.interactive(),
            in: RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
        )
    }

    private var iconBadge: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(item.type.color.opacity(0.14))
                .frame(width: 42, height: 42)
            Image(systemName: item.type.icon)
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(item.type.color)
        }
    }

    private var scoreRing: some View {
        ZStack {
            Circle()
                .stroke(Theme.hairline(colorScheme), lineWidth: 4)
                .frame(width: 46, height: 46)

            if !item.isNA {
                Circle()
                    .trim(from: 0, to: item.score / 100.0)
                    .stroke(item.status.themeColor,
                            style: StrokeStyle(lineWidth: 4, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .frame(width: 46, height: 46)
                    .animation(.easeOut(duration: 0.8), value: item.score)
            }

            Text(item.isNA ? "NA" : "\(Int(item.score))")
                .font(.monoDigit(item.isNA ? 11 : 13, weight: .bold))
                .foregroundStyle(item.isNA ? Theme.textSecondary(colorScheme) : Theme.textPrimary(colorScheme))
        }
        .frame(width: 46, height: 46)
    }
}

// MARK: - Stats Card

struct StatsCategoryCard: View {
    let item: HealthCategoryItem
    @Environment(\.colorScheme) var colorScheme

    private var topThree: [SubMetric] {
        Array(item.subMetrics.prefix(3))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 8) {
                Image(systemName: item.type.icon)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(item.type.color)
                Text(item.type.rawValue)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Theme.textSecondary(colorScheme))
                Spacer()
            }

            HStack(spacing: 0) {
                ForEach(Array(topThree.enumerated()), id: \.element.id) { idx, m in
                    statColumn(m)
                    if idx < topThree.count - 1 {
                        Rectangle()
                            .fill(Theme.hairline(colorScheme))
                            .frame(width: 1, height: 36)
                    }
                }
            }

            StackedMiniBars(
                metrics: topThree,
                barCount: 20,
                trackColor: Theme.fillTrack(colorScheme)
            )
            .frame(height: 42)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .glassEffect(
            .regular.interactive(),
            in: RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
        )
    }

    private func statColumn(_ m: SubMetric) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            HStack(alignment: .lastTextBaseline, spacing: 2) {
                Text(m.value)
                    .font(.display(22, weight: .bold))
                    .foregroundStyle(Theme.textPrimary(colorScheme))
                    .monospacedDigit()
                if !m.unit.isEmpty {
                    Text(m.unit)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(Theme.textSecondary(colorScheme))
                }
            }
            Text(shortLabel(m.name))
                .font(.system(size: 11, weight: .medium))
                .foregroundStyle(m.status.themeColor)
                .lineLimit(1)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 10)
    }

    private func shortLabel(_ name: String) -> String {
        name.components(separatedBy: " ").first ?? name
    }
}

// MARK: - Stacked Mini Bars (Canvas)

struct StackedMiniBars: View {
    let metrics: [SubMetric]
    let barCount: Int
    let trackColor: Color

    var body: some View {
        Canvas { ctx, size in
            guard !metrics.isEmpty else { return }
            let spacing: CGFloat = 3
            let barWidth = max(2.5, (size.width - spacing * CGFloat(barCount - 1)) / CGFloat(barCount))
            let totalScore = max(metrics.map(\.score).reduce(0, +), 1)

            for i in 0..<barCount {
                let wave = 0.55 + 0.45 * sin(Double(i) * 0.9)
                let totalHeight = size.height * CGFloat(wave)

                // track behind
                let trackRect = CGRect(
                    x: CGFloat(i) * (barWidth + spacing),
                    y: 0,
                    width: barWidth,
                    height: max(3, size.height - totalHeight)
                )
                ctx.fill(
                    Path(roundedRect: trackRect, cornerRadius: 1.2),
                    with: .color(trackColor)
                )

                // stacked segments from the bottom
                var y = size.height
                for m in metrics {
                    let frac = CGFloat(m.score / totalScore) * 1.6
                    let h = max(2, totalHeight * frac / 3)
                    let segRect = CGRect(
                        x: CGFloat(i) * (barWidth + spacing),
                        y: y - h,
                        width: barWidth,
                        height: h
                    )
                    ctx.fill(
                        Path(roundedRect: segRect, cornerRadius: 1.2),
                        with: .color(m.status.themeColor.opacity(0.85))
                    )
                    y -= (h + 1)
                    if y <= 0 { break }
                }
            }
        }
    }
}

// MARK: - Gauge Card

struct GaugeCategoryCard: View {
    let item: HealthCategoryItem
    @Environment(\.colorScheme) var colorScheme

    private var scoredMetrics: [SubMetric] {
        item.subMetrics.filter { !$0.isNA }
    }
    private var highest: Double { scoredMetrics.map(\.score).max() ?? item.score }
    private var lowest:  Double { scoredMetrics.map(\.score).min() ?? item.score }

    var body: some View {
        HStack(alignment: .center, spacing: 14) {
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 6) {
                    Circle()
                        .fill(item.isNA ? Theme.textSecondary(colorScheme) : item.status.themeColor)
                        .frame(width: 7, height: 7)
                    Text(item.type.rawValue)
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(Theme.textPrimary(colorScheme))
                    Spacer(minLength: 0)
                }

                Text("Updated \(item.lastUpdated)")
                    .font(.system(size: 10))
                    .foregroundStyle(Theme.textTertiary(colorScheme))
                    .lineLimit(1)

                if item.isNA {
                    HStack {
                        NAPill()
                        Text("Not available on iOS")
                            .font(.system(size: 10))
                            .foregroundStyle(Theme.textTertiary(colorScheme))
                    }
                } else {
                    HStack(alignment: .top, spacing: 14) {
                        miniStat("\(Int(highest))", "Highest", color: Theme.poor)
                        miniStat("\(Int(lowest))",  "Lowest",  color: Theme.fair)
                        miniStat("\(Int(item.score))", "Average", color: Theme.excellent)
                    }
                }
            }

            Spacer(minLength: 4)

            ZStack {
                AdaptiveTickRing(score: item.isNA ? 0 : item.score, size: 78)
                VStack(spacing: -2) {
                    Text(item.isNA ? "NA" : "\(Int(item.score))")
                        .font(.display(22, weight: .bold))
                        .foregroundStyle(item.isNA ? Theme.textSecondary(colorScheme) : Theme.textPrimary(colorScheme))
                    if item.isNA {
                        Text("no data")
                            .font(.system(size: 9, weight: .semibold))
                            .foregroundStyle(Theme.textTertiary(colorScheme))
                    } else {
                        Text(item.status.label.lowercased())
                            .font(.system(size: 9, weight: .semibold))
                            .foregroundStyle(item.status.themeColor)
                    }
                }
            }
            .frame(width: 78, height: 78)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 14)
        .glassEffect(
            .regular.interactive(),
            in: RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
        )
    }

    private func miniStat(_ value: String, _ label: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 1) {
            Text(value)
                .font(.display(18, weight: .bold))
                .foregroundStyle(color)
                .monospacedDigit()
            Text(label)
                .font(.system(size: 10, weight: .medium))
                .foregroundStyle(Theme.textTertiary(colorScheme))
        }
    }
}

// MARK: - Adaptive Tick Ring (Canvas)

struct AdaptiveTickRing: View {
    let score: Double
    var size: CGFloat = 80
    @Environment(\.colorScheme) var colorScheme

    private let totalTicks = 44
    private let startAngle: Double = 140
    private let sweep:      Double = 260

    var body: some View {
        Canvas { ctx, canvasSize in
            let progress = max(0, min(score / 100, 1))
            let filledUpTo = progress * Double(totalTicks - 1)
            let radius = min(canvasSize.width, canvasSize.height) / 2 - 3
            let center = CGPoint(x: canvasSize.width / 2, y: canvasSize.height / 2)

            for i in 0..<totalTicks {
                let t = Double(i) / Double(totalTicks - 1)
                let angle = (startAngle + t * sweep) * .pi / 180
                let isMajor = i % 4 == 0
                let tickH: CGFloat = isMajor ? 7 : 4
                let tickW: CGFloat = 2

                let outer = CGPoint(
                    x: center.x + radius * cos(angle),
                    y: center.y + radius * sin(angle)
                )

                let rect = CGRect(x: -tickW / 2, y: -tickH / 2, width: tickW, height: tickH)
                let path = Path(roundedRect: rect, cornerRadius: 1.2)
                    .applying(.init(rotationAngle: angle + .pi / 2))
                    .applying(.init(translationX: outer.x, y: outer.y))

                let color: Color = Double(i) <= filledUpTo ? colorForIndex(t) : emptyColor
                ctx.fill(path, with: .color(color))
            }
        }
        .frame(width: size, height: size)
    }

    private var emptyColor: Color {
        Theme.fillTrack(colorScheme)
    }

    private func colorForIndex(_ t: Double) -> Color {
        if t < 0.40 { return Theme.excellent }
        if t < 0.70 { return Theme.fair }
        return Theme.poor
    }
}

// MARK: - Bars Card

struct BarsCategoryCard: View {
    let item: HealthCategoryItem
    @Environment(\.colorScheme) var colorScheme

    private var topThree: [SubMetric] {
        Array(item.subMetrics.prefix(3))
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            HStack(spacing: 10) {
                Image(systemName: item.type.icon)
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(item.type.color)
                    .frame(width: 22)
                VStack(alignment: .leading, spacing: 1) {
                    Text(item.type.rawValue)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(Theme.textPrimary(colorScheme))
                    Text(item.lastUpdated)
                        .font(.system(size: 10))
                        .foregroundStyle(Theme.textTertiary(colorScheme))
                }
                Spacer()
                Text(item.isNA ? "NA" : "\(Int(item.score))")
                    .font(.display(18, weight: .bold))
                    .foregroundStyle(item.isNA ? Theme.textSecondary(colorScheme) : item.status.themeColor)
                    .monospacedDigit()
            }

            VStack(spacing: 6) {
                ForEach(topThree) { m in
                    progressRow(m)
                }
            }
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 13)
        .glassEffect(
            .regular.interactive(),
            in: RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
        )
    }

    private func progressRow(_ m: SubMetric) -> some View {
        HStack(spacing: 10) {
            Text(m.name)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(Theme.textPrimary(colorScheme))
                .lineLimit(1)
                .frame(width: 96, alignment: .leading)

            GeometryReader { geo in
                ZStack(alignment: .leading) {
                    Capsule().fill(Theme.fillTrack(colorScheme))
                    if !m.isNA {
                        Capsule()
                            .fill(m.status.themeColor.opacity(0.9))
                            .frame(width: max(8, geo.size.width * CGFloat(m.score / 100.0)))
                    }
                }
            }
            .frame(height: 8)

            if m.isNA {
                Text("NA")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(Theme.textSecondary(colorScheme))
                    .frame(width: 66, alignment: .trailing)
                    .lineLimit(1)
            } else {
                Text(m.status.label)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(m.status.themeColor)
                    .frame(width: 66, alignment: .trailing)
                    .lineLimit(1)
            }
        }
    }
}

// MARK: - Trend Card

struct TrendCategoryCard: View {
    let item: HealthCategoryItem
    @Environment(\.colorScheme) var colorScheme

    private var lead: SubMetric? { item.subMetrics.first }

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack(spacing: 8) {
                Image(systemName: item.type.icon)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Theme.textTertiary(colorScheme))
                Text(item.type.rawValue)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(Theme.textTertiary(colorScheme))
                Spacer()
            }

            HStack(alignment: .lastTextBaseline, spacing: 4) {
                Text(lead?.value ?? (item.isNA ? "NA" : "\(Int(item.score))"))
                    .font(.display(30, weight: .bold))
                    .foregroundStyle(Theme.textPrimary(colorScheme))
                    .monospacedDigit()
                if let unit = lead?.unit, !unit.isEmpty {
                    Text(unit)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(Theme.textTertiary(colorScheme))
                } else if !item.isNA {
                    Text("/100")
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(Theme.textTertiary(colorScheme))
                }
            }

            HStack(spacing: 6) {
                if item.isNA {
                    NAPill()
                    Text("Not available on iOS")
                        .font(.system(size: 12))
                        .foregroundStyle(Theme.textTertiary(colorScheme))
                } else {
                    ZStack {
                        Circle().fill(item.status.themeColor.opacity(0.18))
                            .frame(width: 18, height: 18)
                        Image(systemName: "checkmark")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundStyle(item.status.themeColor)
                    }
                    Text(item.status.label)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(item.status.themeColor)
                }
                Spacer()
            }

            MiniLineChart(
                data: lead?.weeklyData ?? [],
                color: item.status.themeColor
            )
            .frame(height: 52)
            .padding(.top, 2)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .frame(maxWidth: .infinity, alignment: .leading)
        .glassEffect(
            .regular.interactive(),
            in: RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
        )
    }
}

// MARK: - Mini Line Chart (Canvas-backed)

struct MiniLineChart: View {
    let data: [DailyDataPoint]
    let color: Color

    var body: some View {
        Canvas { ctx, size in
            guard data.count > 1 else { return }
            let points = normalizedPoints(in: size)

            // Smooth line
            let line = linePath(points: points)

            // Soft area fill
            var area = line
            if let first = points.first, let last = points.last {
                area.addLine(to: CGPoint(x: last.x, y: size.height))
                area.addLine(to: CGPoint(x: first.x, y: size.height))
                area.closeSubpath()
            }
            ctx.fill(
                area,
                with: .linearGradient(
                    Gradient(colors: [color.opacity(0.22), color.opacity(0.02)]),
                    startPoint: .zero,
                    endPoint: CGPoint(x: 0, y: size.height)
                )
            )

            ctx.stroke(
                line,
                with: .color(color),
                style: StrokeStyle(lineWidth: 2.4, lineCap: .round, lineJoin: .round)
            )

            if let last = points.last {
                let halo = CGRect(x: last.x - 7, y: last.y - 7, width: 14, height: 14)
                ctx.fill(Path(ellipseIn: halo), with: .color(color.opacity(0.22)))
                let dot  = CGRect(x: last.x - 3, y: last.y - 3, width: 6,  height: 6)
                ctx.fill(Path(ellipseIn: dot),  with: .color(color))
            }
        }
    }

    private func normalizedPoints(in size: CGSize) -> [CGPoint] {
        let values  = data.map(\.value)
        let minV    = values.min() ?? 0
        let maxV    = values.max() ?? 1
        let range   = max(maxV - minV, 1)
        let padY:   CGFloat = 6
        let drawH   = size.height - padY * 2

        return data.enumerated().map { i, p in
            let x = size.width * CGFloat(i) / CGFloat(data.count - 1)
            let norm = CGFloat((p.value - minV) / range)
            let y = padY + (1 - norm) * drawH
            return CGPoint(x: x, y: y)
        }
    }

    private func linePath(points: [CGPoint]) -> Path {
        var path = Path()
        guard let first = points.first else { return path }
        path.move(to: first)
        for i in 1..<points.count {
            let prev = points[i - 1]
            let curr = points[i]
            let mid = CGPoint(x: (prev.x + curr.x) / 2, y: (prev.y + curr.y) / 2)
            path.addQuadCurve(to: mid, control: prev)
            if i == points.count - 1 {
                path.addQuadCurve(to: curr, control: curr)
            }
        }
        return path
    }
}

// MARK: - Segmented Progress Bar (Canvas)

struct SegmentedProgressBar: View {
    /// Progress from 0 to 1.
    let progress: Double
    let total: Int
    let color: Color
    let trackColor: Color

    var body: some View {
        Canvas { ctx, size in
            let spacing: CGFloat = 2
            let barWidth = max(1.5, (size.width - spacing * CGFloat(total - 1)) / CGFloat(total))
            let filled = max(1, Int(round(progress * Double(total))))

            for i in 0..<total {
                let rect = CGRect(
                    x: CGFloat(i) * (barWidth + spacing),
                    y: 0,
                    width: barWidth,
                    height: size.height
                )
                let c: Color = i < filled ? color : trackColor
                ctx.fill(Path(roundedRect: rect, cornerRadius: 0.8), with: .color(c))
            }
        }
    }
}

// MARK: - Status Pill

struct StatusPill: View {
    let status: IndicatorStatus

    var body: some View {
        Text(status.label)
            .font(.system(size: 9, weight: .semibold))
            .foregroundStyle(status.themeColor)
            .padding(.horizontal, 7)
            .padding(.vertical, 3)
            .background(Capsule().fill(status.themeColor.opacity(0.14)))
    }
}

// MARK: - Sub-metric row (used inside detail view)

struct SubMetricRow: View {
    let metric: SubMetric
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .stroke(Theme.hairline(colorScheme), lineWidth: 3)
                Circle()
                    .trim(from: 0, to: metric.score / 100.0)
                    .stroke(metric.status.themeColor,
                            style: StrokeStyle(lineWidth: 3, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .animation(.easeOut(duration: 0.7), value: metric.score)
                Text("\(Int(metric.score))")
                    .font(.monoDigit(9, weight: .bold))
                    .foregroundStyle(Theme.textPrimary(colorScheme))
            }
            .frame(width: 34, height: 34)

            VStack(alignment: .leading, spacing: 2) {
                Text(metric.name)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundStyle(Theme.textPrimary(colorScheme))
                Text(metric.trendLabel)
                    .font(.system(size: 11))
                    .foregroundStyle(Theme.textSecondary(colorScheme))
            }

            Spacer()

            VStack(alignment: .trailing, spacing: 3) {
                HStack(alignment: .firstTextBaseline, spacing: 3) {
                    Text(metric.value)
                        .font(.display(15, weight: .bold))
                        .foregroundStyle(Theme.textPrimary(colorScheme))
                    if !metric.unit.isEmpty {
                        Text(metric.unit)
                            .font(.system(size: 10))
                            .foregroundStyle(Theme.textSecondary(colorScheme))
                    }
                }
                StatusPill(status: metric.status)
            }
        }
        .padding(.vertical, 10)
        .padding(.horizontal, 14)
        .glassEffect(
            .regular.tint(metric.status.themeColor.opacity(0.08)),
            in: RoundedRectangle(cornerRadius: Theme.Radius.sm, style: .continuous)
        )
    }
}
