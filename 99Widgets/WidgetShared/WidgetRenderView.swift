//
//  WidgetRenderView.swift
//  WidgetShared
//
//  Pure render pipeline: ([MetricSnapshot], WidgetStyle) → some View
//  Handles both single-metric and multi-metric compositions.
//  No state, no side-effects. Shared by app and widget extension.
//

import SwiftUI

// MARK: - Entry Point

public struct WidgetRenderView: View {
    public let snapshots: [MetricSnapshot]
    public let style: WidgetStyle
    /// When `true` the view fills its container (no aspect-ratio constraint, no shadow).
    /// Use this inside WidgetKit extensions where the system provides the frame.
    public var fillsContainer: Bool = false

    /// Convenience init for single-metric widgets.
    public init(snapshot: MetricSnapshot, style: WidgetStyle, fillsContainer: Bool = false) {
        self.snapshots = [snapshot]
        self.style = style
        self.fillsContainer = fillsContainer
    }

    /// Multi-metric init.
    public init(snapshots: [MetricSnapshot], style: WidgetStyle, fillsContainer: Bool = false) {
        self.snapshots = snapshots
        self.style = style
        self.fillsContainer = fillsContainer
    }

    private var palette: WidgetPalette { WidgetPalette.make(style.palette) }
    private var primary: MetricSnapshot { snapshots.first ?? MetricSnapshot.mock(for: .steps) }
    private var tokens: FamilyTokens { style.family?.tokens ?? .default }

    public var body: some View {
        let radius = tokens.widgetCornerRadius
        let pad    = tokens.innerPadding + (style.composition.isLargeFormat ? -2 : 0)

        if fillsContainer {
            // In a WidgetKit extension the system containerBackground provides the
            // gradient and clips to the widget shape — render content only.
            ZStack {
                accentLayer
                compositionLayer
                    .padding(pad)
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .environment(\.familyTokens, tokens)
        } else {
            ZStack {
                LinearGradient(
                    colors: [palette.backgroundTop, palette.backgroundBottom],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                accentLayer
                compositionLayer
                    .padding(pad)
            }
            .aspectRatio(style.composition.aspectRatio, contentMode: .fit)
            .clipShape(RoundedRectangle(cornerRadius: radius, style: .continuous))
            .overlay(
                style.accent == .border
                    ? AnyView(RoundedRectangle(cornerRadius: radius, style: .continuous)
                        .strokeBorder(palette.accent.opacity(0.7), lineWidth: 2.5))
                    : AnyView(EmptyView())
            )
            .shadow(color: .black.opacity(palette.isDark ? 0.35 : 0.14), radius: 20, y: 10)
            .environment(\.familyTokens, tokens)
        }
    }

    // MARK: Composition Dispatcher

    @ViewBuilder
    private var compositionLayer: some View {
        switch style.composition {
        case .solo:
            soloLayer
        case .heroSidecar:
            HeroSidecarComposition(snapshots: snapshots, style: style, palette: palette)
        case .splitPair:
            SplitPairComposition(snapshots: snapshots, style: style, palette: palette)
        case .ringTrio:
            RingTrioComposition(snapshots: snapshots, palette: palette)
        case .dashboard:
            DashboardComposition(snapshots: snapshots, style: style, palette: palette)
        case .heroStrip:
            HeroStripComposition(snapshots: snapshots, style: style, palette: palette)
        case .journalList:
            JournalListComposition(snapshots: snapshots, style: style, palette: palette)
        }
    }

    // MARK: Solo (single-metric layouts — unchanged)

    @ViewBuilder
    private var soloLayer: some View {
        switch style.layout {
        case .stacked:  StackedLayout(snapshot: primary, style: style, palette: palette)
        case .split:    SplitLayout(snapshot: primary, style: style, palette: palette)
        case .focal:    FocalLayout(snapshot: primary, style: style, palette: palette)
        case .orbital:  OrbitalLayout(snapshot: primary, style: style, palette: palette)
        case .grid:     GridLayout(snapshot: primary, style: style, palette: palette)
        }
    }

    // MARK: Accent Layer

    @ViewBuilder
    private var accentLayer: some View {
        switch style.accent {
        case .none, .border:
            EmptyView()
        case .blob:
            BlobAccent(color: palette.accent)
        case .glow:
            GlowAccent(color: palette.accent)
        case .grain:
            GrainAccent(isDark: palette.isDark)
        case .grid:
            GridAccent(color: palette.muted)
        }
    }
}

// MARK: - Layout: Stacked (value top, chart bottom)

private struct StackedLayout: View {
    let snapshot: MetricSnapshot
    let style: WidgetStyle
    let palette: WidgetPalette
    @Environment(\.familyTokens) private var tokens

    var body: some View {
        let labelText = tokens.labelIsUppercased
            ? snapshot.kind.displayName.uppercased()
            : snapshot.kind.displayName

        VStack(alignment: .leading, spacing: 0) {
            // Header row
            HStack(alignment: .center, spacing: 6) {
                Image(systemName: snapshot.kind.systemSymbol)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(palette.accent)
                Text(labelText)
                    .font(.system(size: 9, weight: .semibold, design: .default))
                    .tracking(tokens.labelTracking)
                    .foregroundStyle(palette.muted)
                Spacer(minLength: 0)
                if style.density != .minimal {
                    trendBadge
                }
            }

            Spacer(minLength: 6)

            // Main value
            HStack(alignment: .lastTextBaseline, spacing: 4) {
                Text(snapshot.displayValue)
                    .font(style.typography.displayFont(size: 38, weight: tokens.displayFontWeight))
                    .foregroundStyle(palette.primary)
                    .minimumScaleFactor(0.5)
                    .lineLimit(1)
                if style.density != .minimal {
                    Text(snapshot.unit)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(palette.muted)
                }
            }

            if style.density == .dense, let sec = snapshot.secondary {
                Text(sec)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(palette.muted)
                    .padding(.top, 1)
            }

            Spacer(minLength: 8)

            // Chart
            if style.density != .minimal && style.chart != .none {
                chartView
                    .frame(maxWidth: .infinity)
                    .frame(height: 30)
            }
        }
    }

    @ViewBuilder private var chartView: some View {
        switch style.chart {
        case .bar:  BarChart(data: snapshot.trend, accent: palette.accent, muted: palette.muted)
        case .line: LineChart(data: snapshot.trend, accent: palette.accent)
        case .area: AreaChart(data: snapshot.trend, accent: palette.accent)
        case .ring: RingChart(progress: snapshot.progress, accent: palette.accent, muted: palette.muted)
        case .dots: DotsChart(data: snapshot.trend, accent: palette.accent, muted: palette.muted)
        case .none: EmptyView()
        }
    }

    private var trendBadge: some View {
        HStack(spacing: 2) {
            Image(systemName: trendSymbol)
                .font(.system(size: 9, weight: .bold))
        }
        .foregroundStyle(trendColor)
    }

    private var trendSymbol: String {
        switch snapshot.trendDirection {
        case .up:   return snapshot.kind.isHigherBetter ? "arrow.up" : "arrow.up"
        case .down: return "arrow.down"
        case .flat: return "minus"
        }
    }

    private var trendColor: Color {
        switch snapshot.semanticTint {
        case .positive: return palette.accent
        case .neutral:  return palette.muted
        case .warning:  return Color.orange
        }
    }
}

// MARK: - Layout: Split (label/chart left, value right)

private struct SplitLayout: View {
    let snapshot: MetricSnapshot
    let style: WidgetStyle
    let palette: WidgetPalette

    var body: some View {
        HStack(spacing: 12) {
            // Left column
            VStack(alignment: .leading, spacing: 4) {
                Image(systemName: snapshot.kind.systemSymbol)
                    .font(.body.weight(.semibold))
                    .foregroundStyle(palette.accent)
                Text(snapshot.kind.displayName)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(palette.muted)
                    .lineLimit(2)

                if style.density == .dense, let sec = snapshot.secondary {
                    Spacer(minLength: 0)
                    Text(sec)
                        .font(.system(size: 9, weight: .medium))
                        .foregroundStyle(palette.muted)
                }

                if style.density != .minimal && style.chart != .none {
                    Spacer(minLength: 4)
                    chartView
                        .frame(maxWidth: .infinity)
                        .frame(height: 28)
                }
            }
            .frame(maxWidth: .infinity, alignment: .leading)

            Rectangle()
                .fill(palette.muted.opacity(0.2))
                .frame(width: 1)

            // Right column – big value
            VStack(alignment: .trailing, spacing: 3) {
                Spacer(minLength: 0)
                Text(snapshot.displayValue)
                    .font(style.typography.displayFont(size: 32))
                    .foregroundStyle(palette.primary)
                    .minimumScaleFactor(0.4)
                    .multilineTextAlignment(.trailing)
                    .lineLimit(1)
                Text(snapshot.unit)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(palette.muted)
                    .multilineTextAlignment(.trailing)
            }
            .frame(maxWidth: .infinity, alignment: .trailing)
        }
    }

    @ViewBuilder private var chartView: some View {
        switch style.chart {
        case .bar:  BarChart(data: snapshot.trend, accent: palette.accent, muted: palette.muted)
        case .line: LineChart(data: snapshot.trend, accent: palette.accent)
        case .area: AreaChart(data: snapshot.trend, accent: palette.accent)
        case .ring: RingChart(progress: snapshot.progress, accent: palette.accent, muted: palette.muted)
        case .dots: DotsChart(data: snapshot.trend, accent: palette.accent, muted: palette.muted)
        case .none: EmptyView()
        }
    }
}

// MARK: - Layout: Focal (giant value, nothing else)

private struct FocalLayout: View {
    let snapshot: MetricSnapshot
    let style: WidgetStyle
    let palette: WidgetPalette
    @Environment(\.familyTokens) private var tokens

    var body: some View {
        VStack(alignment: .center, spacing: 2) {
            Spacer(minLength: 0)

            Text(snapshot.displayValue)
                .font(style.typography.displayFont(size: 52, weight: tokens.displayFontWeight))
                .foregroundStyle(palette.primary)
                .minimumScaleFactor(0.4)
                .lineLimit(1)

            HStack(spacing: 4) {
                Image(systemName: snapshot.kind.systemSymbol)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundStyle(palette.accent)
                Text(snapshot.kind.displayName)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundStyle(palette.muted)
                if style.density != .minimal {
                    Text("·")
                        .foregroundStyle(palette.muted.opacity(0.5))
                    Text(snapshot.unit)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(palette.muted)
                }
            }

            Spacer(minLength: 0)
        }
        .frame(maxWidth: .infinity)
    }
}

// MARK: - Layout: Orbital (ring with value inside)

private struct OrbitalLayout: View {
    let snapshot: MetricSnapshot
    let style: WidgetStyle
    let palette: WidgetPalette

    var body: some View {
        HStack(spacing: 14) {
            // Ring + value inside
            ZStack {
                Circle()
                    .stroke(palette.muted.opacity(0.2), lineWidth: 9)
                Circle()
                    .trim(from: 0, to: CGFloat(min(snapshot.progress, 1)))
                    .stroke(palette.accent,
                            style: StrokeStyle(lineWidth: 9, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                VStack(spacing: 1) {
                    Text(snapshot.displayValue)
                        .font(style.typography.displayFont(size: 16, weight: .black))
                        .foregroundStyle(palette.primary)
                        .minimumScaleFactor(0.4)
                        .lineLimit(1)
                    Text(snapshot.unit)
                        .font(.system(size: 7, weight: .medium))
                        .foregroundStyle(palette.muted)
                }
            }
            .frame(width: 84, height: 84)

            // Side info
            VStack(alignment: .leading, spacing: 5) {
                Image(systemName: snapshot.kind.systemSymbol)
                    .font(.body.weight(.semibold))
                    .foregroundStyle(palette.accent)
                Text(snapshot.kind.displayName)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundStyle(palette.primary)
                    .lineLimit(1)

                if style.density != .minimal {
                    Text("\(Int(snapshot.progress * 100))% of goal")
                        .font(.system(size: 10, weight: .medium))
                        .foregroundStyle(palette.muted)

                    if style.density == .dense, let sec = snapshot.secondary {
                        Text(sec)
                            .font(.system(size: 9, weight: .medium))
                            .foregroundStyle(palette.muted)
                    }
                }

                Spacer(minLength: 0)
            }
            .frame(maxWidth: .infinity, alignment: .leading)
        }
    }
}

// MARK: - Layout: Grid (4-quadrant stats)

private struct GridLayout: View {
    let snapshot: MetricSnapshot
    let style: WidgetStyle
    let palette: WidgetPalette

    private var avg: String {
        let a = snapshot.trend.isEmpty ? snapshot.value : snapshot.trend.reduce(0, +) / Double(snapshot.trend.count)
        return formatValue(a)
    }

    private var goalText: String {
        guard snapshot.goal != nil else { return "—" }
        return "\(Int(snapshot.progress * 100))%"
    }

    private var trendText: String {
        switch snapshot.trendDirection {
        case .up:   return "↑ Rising"
        case .down: return "↓ Falling"
        case .flat: return "→ Stable"
        }
    }

    var body: some View {
        VStack(spacing: 6) {
            HStack(spacing: 6) {
                gridCell(label: snapshot.kind.displayName, value: snapshot.displayValue, unit: snapshot.unit, isMain: true)
                gridCell(label: "7-day avg", value: avg, unit: snapshot.unit, isMain: false)
            }
            HStack(spacing: 6) {
                gridCell(label: "Goal", value: goalText, unit: "", isMain: false)
                gridCell(label: "Trend", value: trendText, unit: "", isMain: false)
            }
        }
    }

    private func gridCell(label: String, value: String, unit: String, isMain: Bool) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label.uppercased())
                .font(.system(size: 8, weight: .semibold))
                .tracking(0.5)
                .foregroundStyle(palette.muted)
            Text(value)
                .font(style.typography.displayFont(size: isMain ? 22 : 16, weight: isMain ? .black : .bold))
                .foregroundStyle(isMain ? palette.primary : palette.primary.opacity(0.85))
                .minimumScaleFactor(0.5)
                .lineLimit(1)
            if !unit.isEmpty {
                Text(unit)
                    .font(.system(size: 8, weight: .medium))
                    .foregroundStyle(palette.muted)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(8)
        .background(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(palette.primary.opacity(isMain ? 0.12 : 0.06))
        )
    }

    private func formatValue(_ v: Double) -> String {
        if v >= 1000 { return String(format: "%.0f", v).replacingOccurrences(of: ",", with: ",") }
        if v < 10 { return String(format: "%.1f", v) }
        return String(format: "%.0f", v)
    }
}

// MARK: - Chart Views

private struct BarChart: View {
    let data: [Double]
    let accent: Color
    let muted: Color
    @Environment(\.familyTokens) private var tokens

    var body: some View {
        GeometryReader { geo in
            let maxVal = data.max() ?? 1
            let count = data.count
            let gap: CGFloat = 3
            let barW = (geo.size.width - gap * CGFloat(count - 1)) / CGFloat(count)
            let radius = tokens.chartBarRadius

            HStack(alignment: .bottom, spacing: gap) {
                ForEach(data.indices, id: \.self) { i in
                    let h = maxVal > 0 ? CGFloat(data[i] / maxVal) * geo.size.height : 4
                    RoundedRectangle(cornerRadius: radius, style: .continuous)
                        .fill(i == data.count - 1 ? accent : muted.opacity(0.5))
                        .frame(width: barW, height: Swift.max(3, h))
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)
        }
    }
}

private struct LineChart: View {
    let data: [Double]
    let accent: Color
    @Environment(\.familyTokens) private var tokens

    var body: some View {
        GeometryReader { geo in
            let pts = points(in: geo.size)
            ZStack {
                Path { p in
                    guard pts.count > 1 else { return }
                    p.move(to: pts[0])
                    pts.dropFirst().forEach { p.addLine(to: $0) }
                }
                .stroke(accent, style: StrokeStyle(lineWidth: tokens.chartStrokeWidth, lineCap: .round, lineJoin: .round))

                if let last = pts.last {
                    Circle()
                        .fill(accent)
                        .frame(width: 5, height: 5)
                        .position(last)
                }
            }
        }
    }

    private func points(in size: CGSize) -> [CGPoint] {
        guard data.count > 1 else { return [] }
        let minV = data.min() ?? 0, maxV = data.max() ?? 1
        let range = maxV - minV > 0 ? maxV - minV : 1
        return data.enumerated().map { i, v in
            CGPoint(
                x: CGFloat(i) / CGFloat(data.count - 1) * size.width,
                y: (1 - CGFloat((v - minV) / range)) * size.height * 0.88 + size.height * 0.06
            )
        }
    }
}

private struct AreaChart: View {
    let data: [Double]
    let accent: Color
    @Environment(\.familyTokens) private var tokens

    var body: some View {
        GeometryReader { geo in
            areaContent(in: geo.size)
        }
    }

    @ViewBuilder
    private func areaContent(in size: CGSize) -> some View {
        let pts = points(in: size)
        if pts.count > 1 {
            // Filled area
            Path { p in
                p.move(to: CGPoint(x: 0, y: size.height))
                pts.forEach { p.addLine(to: $0) }
                p.addLine(to: CGPoint(x: size.width, y: size.height))
                p.closeSubpath()
            }
            .fill(
                LinearGradient(
                    colors: [accent.opacity(0.35), accent.opacity(0.04)],
                    startPoint: .top, endPoint: .bottom
                )
            )

            // Line on top
            Path { p in
                p.move(to: pts[0])
                pts.dropFirst().forEach { p.addLine(to: $0) }
            }
            .stroke(accent, style: StrokeStyle(lineWidth: tokens.chartStrokeWidth, lineCap: .round, lineJoin: .round))
        }
    }

    private func points(in size: CGSize) -> [CGPoint] {
        guard data.count > 1 else { return [] }
        let minV = data.min() ?? 0, maxV = data.max() ?? 1
        let range = maxV - minV > 0 ? maxV - minV : 1
        return data.enumerated().map { i, v in
            CGPoint(
                x: CGFloat(i) / CGFloat(data.count - 1) * size.width,
                y: (1 - CGFloat((v - minV) / range)) * size.height * 0.88 + size.height * 0.06
            )
        }
    }
}

private struct RingChart: View {
    let progress: Double
    let accent: Color
    let muted: Color

    var body: some View {
        GeometryReader { geo in
            let side = min(geo.size.width, geo.size.height)
            ZStack {
                Circle()
                    .stroke(muted.opacity(0.22), lineWidth: side * 0.12)
                Circle()
                    .trim(from: 0, to: CGFloat(min(progress, 1)))
                    .stroke(accent, style: StrokeStyle(lineWidth: side * 0.12, lineCap: .round))
                    .rotationEffect(.degrees(-90))
            }
            .frame(width: side, height: side)
            .position(x: geo.size.width / 2, y: geo.size.height / 2)
        }
    }
}

private struct DotsChart: View {
    let data: [Double]
    let accent: Color
    let muted: Color

    var body: some View {
        GeometryReader { geo in
            let avg = data.isEmpty ? 0 : data.reduce(0, +) / Double(data.count)
            let dotD: CGFloat = min(geo.size.height * 0.7, 10)
            let gap = (geo.size.width - dotD * CGFloat(data.count)) / CGFloat(max(data.count - 1, 1))

            HStack(alignment: .center, spacing: gap) {
                ForEach(data.indices, id: \.self) { i in
                    let isAbove = data[i] >= avg
                    Circle()
                        .fill(isAbove ? accent : muted.opacity(0.35))
                        .frame(width: dotD, height: dotD)
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
        }
    }
}

// MARK: - Accent Decoration Views

private struct BlobAccent: View {
    let color: Color
    var body: some View {
        Ellipse()
            .fill(color.opacity(0.20))
            .frame(width: 130, height: 100)
            .blur(radius: 22)
            .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topTrailing)
            .offset(x: 40, y: -30)
            .allowsHitTesting(false)
    }
}

private struct GlowAccent: View {
    let color: Color
    var body: some View {
        RadialGradient(
            colors: [color.opacity(0.30), .clear],
            center: .topTrailing,
            startRadius: 0,
            endRadius: 130
        )
        .allowsHitTesting(false)
    }
}

private struct GrainAccent: View {
    let isDark: Bool
    var body: some View {
        GeometryReader { geo in
            Canvas { ctx, size in
                let spacing: CGFloat = 7
                var x: CGFloat = 0
                while x < size.width + size.height {
                    ctx.stroke(
                        Path { p in
                            p.move(to: CGPoint(x: x, y: 0))
                            p.addLine(to: CGPoint(x: x - size.height, y: size.height))
                        },
                        with: .color((isDark ? Color.white : Color.black).opacity(0.05)),
                        lineWidth: 0.5
                    )
                    x += spacing
                }
            }
        }
        .allowsHitTesting(false)
    }
}

private struct GridAccent: View {
    let color: Color
    var body: some View {
        GeometryReader { geo in
            Canvas { ctx, size in
                let step: CGFloat = 22
                var x: CGFloat = 0
                while x <= size.width {
                    ctx.stroke(Path { p in p.move(to: .init(x: x, y: 0)); p.addLine(to: .init(x: x, y: size.height)) },
                               with: .color(color.opacity(0.10)), lineWidth: 0.5)
                    x += step
                }
                var y: CGFloat = 0
                while y <= size.height {
                    ctx.stroke(Path { p in p.move(to: .init(x: 0, y: y)); p.addLine(to: .init(x: size.width, y: y)) },
                               with: .color(color.opacity(0.10)), lineWidth: 0.5)
                    y += step
                }
            }
        }
        .allowsHitTesting(false)
    }
}

// MARK: - Helpers

private func formatValue(_ v: Double) -> String {
    if v >= 10_000 { return "\(Int(v / 1000))k" }
    if v >= 1_000 { return String(format: "%.1fk", v / 1000) }
    if v < 10 { return String(format: "%.1f", v) }
    return String(format: "%.0f", v)
}

// MARK: - Slot Role Views
// Each slot role has a distinct information density and visual weight.

// Primary — full hero: big number + chart + trend
struct PrimarySlotView: View {
    let snapshot: MetricSnapshot
    let style: WidgetStyle
    let palette: WidgetPalette
    @Environment(\.familyTokens) private var tokens

    var body: some View {
        let labelText = tokens.labelIsUppercased
            ? snapshot.kind.displayName.uppercased()
            : snapshot.kind.displayName

        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 5) {
                Image(systemName: snapshot.kind.systemSymbol)
                    .font(.caption2.weight(.semibold))
                    .foregroundStyle(palette.accent)
                Text(labelText)
                    .font(.system(size: 8, weight: .semibold))
                    .tracking(tokens.labelTracking)
                    .foregroundStyle(palette.muted)
                Spacer()
                TrendBadge(snapshot: snapshot, palette: palette)
            }

            Spacer(minLength: 4)

            HStack(alignment: .lastTextBaseline, spacing: 4) {
                Text(snapshot.displayValue)
                    .font(style.typography.displayFont(size: 32, weight: tokens.displayFontWeight))
                    .foregroundStyle(palette.primary)
                    .minimumScaleFactor(0.5)
                    .lineLimit(1)
                Text(snapshot.unit)
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(palette.muted)
            }

            if style.density == .dense, let sec = snapshot.secondary {
                Text(sec).font(.system(size: 9, weight: .medium)).foregroundStyle(palette.muted)
            }

            if style.chart != .none {
                Spacer(minLength: 6)
                SlotChartView(snapshot: snapshot, style: style, palette: palette)
                    .frame(maxWidth: .infinity).frame(height: 26)
            }
        }
    }
}

// Secondary — medium: value + sparkline
struct SecondarySlotView: View {
    let snapshot: MetricSnapshot
    let style: WidgetStyle
    let palette: WidgetPalette

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Image(systemName: snapshot.kind.systemSymbol)
                .font(.caption.weight(.semibold))
                .foregroundStyle(palette.accent)

            Text(snapshot.displayValue)
                .font(style.typography.displayFont(size: 20, weight: .bold))
                .foregroundStyle(palette.primary)
                .minimumScaleFactor(0.4)
                .lineLimit(1)

            Text(snapshot.kind.displayName)
                .font(.system(size: 9, weight: .medium))
                .foregroundStyle(palette.muted)
                .lineLimit(1)

            if style.chart != .none && style.density != .minimal {
                SlotChartView(snapshot: snapshot, style: style, palette: palette)
                    .frame(maxWidth: .infinity).frame(height: 18)
            }
        }
    }
}

// Accent — compact: ring + value + label side-by-side
struct AccentSlotView: View {
    let snapshot: MetricSnapshot
    let palette: WidgetPalette

    var body: some View {
        HStack(spacing: 8) {
            ZStack {
                Circle().stroke(palette.muted.opacity(0.2), lineWidth: 4)
                Circle()
                    .trim(from: 0, to: CGFloat(min(snapshot.progress, 1)))
                    .stroke(palette.accent, style: StrokeStyle(lineWidth: 4, lineCap: .round))
                    .rotationEffect(.degrees(-90))
            }
            .frame(width: 28, height: 28)

            VStack(alignment: .leading, spacing: 1) {
                Text(snapshot.displayValue)
                    .font(.system(size: 13, weight: .bold, design: .rounded))
                    .foregroundStyle(palette.primary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.6)
                Text(snapshot.kind.displayName)
                    .font(.system(size: 8, weight: .medium))
                    .foregroundStyle(palette.muted)
                    .lineLimit(1)
            }
        }
    }
}

// Context — ultra-compact: icon + number (no label)
struct ContextSlotView: View {
    let snapshot: MetricSnapshot
    let palette: WidgetPalette

    var body: some View {
        VStack(alignment: .center, spacing: 3) {
            Image(systemName: snapshot.kind.systemSymbol)
                .font(.caption2.weight(.semibold))
                .foregroundStyle(palette.accent)
            Text(snapshot.displayValue)
                .font(.system(size: 13, weight: .black, design: .rounded))
                .foregroundStyle(palette.primary)
                .minimumScaleFactor(0.5)
                .lineLimit(1)
        }
    }
}

// Shared trend badge
struct TrendBadge: View {
    let snapshot: MetricSnapshot
    let palette: WidgetPalette

    var body: some View {
        let symbol: String = {
            switch snapshot.trendDirection {
            case .up:   return "arrow.up"
            case .down: return "arrow.down"
            case .flat: return "minus"
            }
        }()
        let color: Color = snapshot.semanticTint == .positive ? palette.accent :
                           snapshot.semanticTint == .warning  ? .orange : palette.muted

        return Image(systemName: symbol)
            .font(.system(size: 9, weight: .bold))
            .foregroundStyle(color)
    }
}

// Chart dispatch for slot context (uses same existing chart views)
private struct SlotChartView: View {
    let snapshot: MetricSnapshot
    let style: WidgetStyle
    let palette: WidgetPalette

    var body: some View {
        switch style.chart {
        case .bar:  BarChart(data: snapshot.trend, accent: palette.accent, muted: palette.muted)
        case .line: LineChart(data: snapshot.trend, accent: palette.accent)
        case .area: AreaChart(data: snapshot.trend, accent: palette.accent)
        case .ring: RingChart(progress: snapshot.progress, accent: palette.accent, muted: palette.muted)
        case .dots: DotsChart(data: snapshot.trend, accent: palette.accent, muted: palette.muted)
        case .none: EmptyView()
        }
    }
}

// MARK: - Composition Views

// Medium: 1 hero left + 1-2 secondaries right
private struct HeroSidecarComposition: View {
    let snapshots: [MetricSnapshot]
    let style: WidgetStyle
    let palette: WidgetPalette

    var body: some View {
        HStack(spacing: 12) {
            PrimarySlotView(snapshot: snapshots[safe: 0] ?? snapshots[0], style: style, palette: palette)
                .frame(maxWidth: .infinity)

            Rectangle().fill(palette.muted.opacity(0.15)).frame(width: 0.5)

            VStack(alignment: .leading, spacing: 0) {
                if let s1 = snapshots[safe: 1] {
                    SecondarySlotView(snapshot: s1, style: style, palette: palette)
                }
                if let s2 = snapshots[safe: 2] {
                    Spacer(minLength: 8)
                    Rectangle().fill(palette.muted.opacity(0.15)).frame(height: 0.5)
                    Spacer(minLength: 8)
                    AccentSlotView(snapshot: s2, palette: palette)
                }
            }
            .frame(maxWidth: 110, maxHeight: .infinity, alignment: .topLeading)
        }
    }
}

// Medium: 2 equal primaries side-by-side
private struct SplitPairComposition: View {
    let snapshots: [MetricSnapshot]
    let style: WidgetStyle
    let palette: WidgetPalette

    var body: some View {
        HStack(spacing: 0) {
            if let s0 = snapshots[safe: 0] {
                PrimarySlotView(snapshot: s0, style: style, palette: palette)
                    .frame(maxWidth: .infinity)
            }
            Rectangle().fill(palette.muted.opacity(0.15)).frame(width: 0.5)
            if let s1 = snapshots[safe: 1] {
                PrimarySlotView(snapshot: s1, style: style, palette: palette)
                    .frame(maxWidth: .infinity)
                    .padding(.leading, 12)
            }
        }
    }
}

// Medium: 3 ring-progress circles
private struct RingTrioComposition: View {
    let snapshots: [MetricSnapshot]
    let palette: WidgetPalette

    var body: some View {
        HStack(spacing: 6) {
            ForEach(Array(snapshots.prefix(3).enumerated()), id: \.offset) { _, snap in
                RingCell(snapshot: snap, palette: palette)
                    .frame(maxWidth: .infinity)
            }
        }
    }
}

private struct RingCell: View {
    let snapshot: MetricSnapshot
    let palette: WidgetPalette

    var body: some View {
        VStack(spacing: 6) {
            ZStack {
                Circle().stroke(palette.muted.opacity(0.2), lineWidth: 9)
                Circle()
                    .trim(from: 0, to: CGFloat(min(snapshot.progress, 1)))
                    .stroke(palette.accent, style: StrokeStyle(lineWidth: 9, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                VStack(spacing: 1) {
                    Text(snapshot.displayValue)
                        .font(.system(size: 13, weight: .black, design: .rounded))
                        .foregroundStyle(palette.primary)
                        .minimumScaleFactor(0.4)
                        .lineLimit(1)
                    Text(snapshot.unit)
                        .font(.system(size: 7, weight: .medium))
                        .foregroundStyle(palette.muted)
                }
            }
            .aspectRatio(1, contentMode: .fit)

            Text(snapshot.kind.displayName)
                .font(.system(size: 8, weight: .semibold))
                .tracking(0.2)
                .foregroundStyle(palette.muted)
                .lineLimit(1)
        }
    }
}

// Large: 2×2 grid of 4 metrics
private struct DashboardComposition: View {
    let snapshots: [MetricSnapshot]
    let style: WidgetStyle
    let palette: WidgetPalette

    var body: some View {
        LazyVGrid(
            columns: [GridItem(.flexible(), spacing: 8), GridItem(.flexible(), spacing: 8)],
            spacing: 8
        ) {
            ForEach(Array(snapshots.prefix(4).enumerated()), id: \.offset) { i, snap in
                DashCell(snapshot: snap, isHero: i == 0, style: style, palette: palette)
            }
        }
    }
}

private struct DashCell: View {
    let snapshot: MetricSnapshot
    let isHero: Bool
    let style: WidgetStyle
    let palette: WidgetPalette

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 4) {
                Image(systemName: snapshot.kind.systemSymbol)
                    .font(.system(size: 9, weight: .semibold))
                    .foregroundStyle(palette.accent)
                Spacer()
                TrendBadge(snapshot: snapshot, palette: palette)
            }
            Text(snapshot.displayValue)
                .font(style.typography.displayFont(size: isHero ? 24 : 18))
                .foregroundStyle(palette.primary)
                .minimumScaleFactor(0.4)
                .lineLimit(1)
            Text(snapshot.kind.displayName)
                .font(.system(size: 8, weight: .medium))
                .foregroundStyle(palette.muted)
                .lineLimit(1)
            if isHero && style.chart != .none {
                SlotChartView(snapshot: snapshot, style: style, palette: palette)
                    .frame(maxWidth: .infinity).frame(height: 18)
            }
        }
        .padding(9)
        .frame(maxWidth: .infinity, alignment: .topLeading)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(palette.primary.opacity(isHero ? 0.11 : 0.06))
        )
    }
}

// Large: hero top, accent strip bottom
private struct HeroStripComposition: View {
    let snapshots: [MetricSnapshot]
    let style: WidgetStyle
    let palette: WidgetPalette

    var body: some View {
        VStack(spacing: 10) {
            if let hero = snapshots[safe: 0] {
                PrimarySlotView(snapshot: hero, style: style, palette: palette)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
            }

            Rectangle().fill(palette.muted.opacity(0.15)).frame(height: 0.5)

            HStack(spacing: 0) {
                ForEach(Array(snapshots.dropFirst().prefix(4).enumerated()), id: \.offset) { i, snap in
                    if i > 0 {
                        Rectangle().fill(palette.muted.opacity(0.15)).frame(width: 0.5, height: 34)
                    }
                    AccentSlotView(snapshot: snap, palette: palette)
                        .frame(maxWidth: .infinity)
                }
            }
        }
    }
}

// Large: dated list of metrics
private struct JournalListComposition: View {
    let snapshots: [MetricSnapshot]
    let style: WidgetStyle
    let palette: WidgetPalette

    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text("TODAY")
                    .font(.system(size: 8, weight: .semibold)).tracking(0.8)
                    .foregroundStyle(palette.muted)
                Spacer()
                Text(Date().formatted(.dateTime.month(.abbreviated).day()))
                    .font(.system(size: 8, weight: .medium))
                    .foregroundStyle(palette.muted)
            }
            .padding(.bottom, 10)

            // Rows fill all remaining vertical space equally
            GeometryReader { geo in
                let rows = Array(snapshots.prefix(5).enumerated())
                let separatorH: CGFloat = 0.5
                let totalSeparators = CGFloat(max(rows.count - 1, 0)) * separatorH
                let rowH = (geo.size.height - totalSeparators) / CGFloat(max(rows.count, 1))

                VStack(spacing: 0) {
                    ForEach(rows, id: \.offset) { i, snap in
                        if i > 0 {
                            Rectangle()
                                .fill(palette.muted.opacity(0.12))
                                .frame(height: separatorH)
                        }
                        JournalRow(snapshot: snap, style: style, palette: palette)
                            .frame(height: rowH)
                    }
                }
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
}

private struct JournalRow: View {
    let snapshot: MetricSnapshot
    let style: WidgetStyle
    let palette: WidgetPalette

    var body: some View {
        HStack(spacing: 10) {
            // Icon in a small rounded bg
            ZStack {
                RoundedRectangle(cornerRadius: 6, style: .continuous)
                    .fill(palette.accent.opacity(0.15))
                    .frame(width: 24, height: 24)
                Image(systemName: snapshot.kind.systemSymbol)
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundStyle(palette.accent)
            }

            // Name
            Text(snapshot.kind.displayName)
                .font(.system(size: 12, weight: .medium))
                .foregroundStyle(palette.primary)
                .lineLimit(1)

            Spacer(minLength: 6)

            // 7-day sparkline trend
            JournalSparkline(
                data: snapshot.trend,
                accent: palette.accent,
                semanticTint: snapshot.semanticTint
            )
            .frame(width: 46, height: 20)

            // Value + optional trend arrow
            HStack(alignment: .firstTextBaseline, spacing: 2) {
                Text(snapshot.displayValue)
                    .font(style.typography.displayFont(size: 13))
                    .foregroundStyle(palette.primary)
                    .minimumScaleFactor(0.6)
                    .lineLimit(1)
                    .frame(minWidth: 30, alignment: .trailing)

                let arrowSymbol: String = {
                    switch snapshot.trendDirection {
                    case .up:   return "arrow.up"
                    case .down: return "arrow.down"
                    case .flat: return "minus"
                    }
                }()
                let arrowColor: Color = snapshot.semanticTint == .positive ? palette.accent
                    : snapshot.semanticTint == .warning ? .orange : palette.muted

                Image(systemName: arrowSymbol)
                    .font(.system(size: 7, weight: .bold))
                    .foregroundStyle(arrowColor)
            }
        }
        .padding(.horizontal, 2)
    }
}

// A compact area+line sparkline used exclusively in journal rows
private struct JournalSparkline: View {
    let data: [Double]
    let accent: Color
    let semanticTint: SemanticTint

    private var lineColor: Color {
        switch semanticTint {
        case .positive: return accent
        case .neutral:  return accent.opacity(0.7)
        case .warning:  return .orange
        }
    }

    var body: some View {
        GeometryReader { geo in
            let pts = chartPoints(in: geo.size)
            if pts.count > 1 {
                // Subtle fill
                Path { p in
                    p.move(to: CGPoint(x: pts[0].x, y: geo.size.height))
                    pts.forEach { p.addLine(to: $0) }
                    p.addLine(to: CGPoint(x: pts.last!.x, y: geo.size.height))
                    p.closeSubpath()
                }
                .fill(
                    LinearGradient(
                        colors: [lineColor.opacity(0.30), lineColor.opacity(0.04)],
                        startPoint: .top, endPoint: .bottom
                    )
                )

                // Line
                Path { p in
                    p.move(to: pts[0])
                    pts.dropFirst().forEach { p.addLine(to: $0) }
                }
                .stroke(
                    lineColor,
                    style: StrokeStyle(lineWidth: 1.5, lineCap: .round, lineJoin: .round)
                )

                // Terminal dot
                if let last = pts.last {
                    Circle()
                        .fill(lineColor)
                        .frame(width: 3.5, height: 3.5)
                        .position(last)
                }
            }
        }
    }

    private func chartPoints(in size: CGSize) -> [CGPoint] {
        guard data.count > 1 else { return [] }
        let minV = data.min() ?? 0
        let maxV = data.max() ?? 1
        let range = maxV - minV > 0 ? maxV - minV : 1
        return data.enumerated().map { i, v in
            CGPoint(
                x: CGFloat(i) / CGFloat(data.count - 1) * size.width,
                y: (1 - CGFloat((v - minV) / range)) * size.height * 0.84 + size.height * 0.08
            )
        }
    }
}

// MARK: - Preview

#Preview("Multi-metric") {
    ScrollView {
        VStack(spacing: 20) {
            // Solo
            WidgetRenderView(snapshot: .mock(for: .steps), style: .init(layout: .stacked, palette: .graphite, typography: .serif, chart: .area, density: .dense, accent: .none, composition: .solo))
            // Hero + Sidecar
            WidgetRenderView(
                snapshots: [.mock(for: .steps), .mock(for: .heartRate), .mock(for: .sleep)],
                style: .init(layout: .stacked, palette: .nordic, typography: .rounded, chart: .line, density: .balanced, accent: .none, composition: .heroSidecar)
            )
            // Ring Trio
            WidgetRenderView(
                snapshots: [.mock(for: .steps), .mock(for: .activeCalories), .mock(for: .exerciseMinutes)],
                style: .init(layout: .orbital, palette: .ocean, typography: .rounded, chart: .ring, density: .balanced, accent: .glow, composition: .ringTrio)
            )
            // Dashboard
            WidgetRenderView(
                snapshots: [.mock(for: .steps), .mock(for: .heartRate), .mock(for: .sleep), .mock(for: .vo2Max)],
                style: .init(layout: .grid, palette: .graphite, typography: .mono, chart: .bar, density: .dense, accent: .grid, composition: .dashboard)
            )
            // Journal
            WidgetRenderView(
                snapshots: HealthMetricKind.allCases.prefix(5).map { .mock(for: $0) },
                style: .init(layout: .split, palette: .graphite, typography: .sans, chart: .none, density: .dense, accent: .none, composition: .journalList)
            )
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 24)
    }
    .background(Color(.systemGroupedBackground))
}

// MARK: - Safe subscript helper

private extension Array {
    subscript(safe index: Int) -> Element? {
        indices.contains(index) ? self[index] : nil
    }
}
