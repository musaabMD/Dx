import SwiftUI

// MARK: - Ranged Metric Chart
//
// Apple-Health style chart with a D / W / M / 6M / Y segmented picker,
// a big summary headline (TOTAL or AVERAGE for the selected range), and
// an adaptive bar chart below.
//
// It owns its own `@State` for the selected range and an async reload
// cycle; the parent only supplies the `HealthMetricKey`, an accent color,
// and a reference to the `HealthKitManager` actor that fetches the data.

@MainActor
struct RangedMetricChart: View {
    let metricKey: HealthMetricKey
    let accent: Color
    let manager: HealthKitManager
    /// Fallback weekly data used when HealthKit is unavailable (for example
    /// on the simulator before the user has populated the Health app).
    var fallbackWeekly: [DailyDataPoint] = []

    @Environment(\.colorScheme) private var colorScheme
    @State private var range: StatsRange = .week
    @State private var series: RangeSeries?
    @State private var isLoading: Bool = false

    // MARK: - Adaptive colors

    private var barTrack: Color {
        colorScheme == .dark ? .white.opacity(0.06) : .black.opacity(0.06)
    }
    private var axisColor: Color {
        colorScheme == .dark ? .white.opacity(0.40) : .black.opacity(0.45)
    }
    private var subduedText: Color {
        colorScheme == .dark ? .white.opacity(0.55) : .black.opacity(0.55)
    }
    private var mutedText: Color {
        colorScheme == .dark ? .white.opacity(0.38) : .black.opacity(0.38)
    }
    private var headlineColor: Color {
        colorScheme == .dark ? .white : Color(red: 0.08, green: 0.08, blue: 0.10)
    }
    private var pickerBg: Color {
        colorScheme == .dark ? Color.white.opacity(0.06) : Color.black.opacity(0.05)
    }
    private var pickerActiveBg: Color {
        colorScheme == .dark ? Color.white.opacity(0.14) : Color.white
    }

    // MARK: - Body

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            rangePicker
            summaryHeader
            chart
        }
        .task(id: range) { await reload() }
        .task(id: metricKey) { await reload() }
    }

    // MARK: - Range Picker

    private var rangePicker: some View {
        HStack(spacing: 4) {
            ForEach(StatsRange.allCases) { r in
                Button {
                    withAnimation(.easeInOut(duration: 0.2)) { range = r }
                } label: {
                    Text(r.shortLabel)
                        .font(.system(size: 12, weight: .semibold, design: .rounded))
                        .foregroundColor(range == r ? headlineColor : subduedText)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 6)
                        .background(
                            RoundedRectangle(cornerRadius: 7, style: .continuous)
                                .fill(range == r ? pickerActiveBg : Color.clear)
                                .shadow(color: range == r ? .black.opacity(0.08) : .clear,
                                        radius: 2, y: 1)
                        )
                }
                .buttonStyle(.plain)
            }
        }
        .padding(3)
        .background(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(pickerBg)
        )
    }

    // MARK: - Summary Header

    private var summaryHeader: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(series?.summaryCaption ?? summaryCaptionFallback)
                .font(.system(size: 10, weight: .semibold))
                .foregroundColor(mutedText)
                .tracking(0.6)

            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text(displayHeadline)
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(headlineColor)
                    .contentTransition(.numericText())
                    .animation(.easeOut(duration: 0.25), value: series?.summaryValue)

                Text(series?.unit ?? "")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(subduedText)
            }

            Text(range.subtitle())
                .font(.system(size: 11))
                .foregroundColor(mutedText)
        }
    }

    private var summaryCaptionFallback: String {
        switch range {
        case .day:       return "TODAY"
        case .week:      return "THIS WEEK"
        case .month:     return "THIS MONTH"
        case .sixMonths: return "LAST 6 MONTHS"
        case .year:      return "THIS YEAR"
        }
    }

    private var displayHeadline: String {
        guard let series else { return isLoading ? "—" : "NA" }
        return formatted(series.summaryValue)
    }

    // MARK: - Chart

    @ViewBuilder
    private var chart: some View {
        if let series, !series.points.isEmpty, series.points.contains(where: { $0.value > 0 }) {
            barChart(series: series)
        } else if isLoading {
            placeholderChart(text: "Loading…")
        } else {
            placeholderChart(text: emptyStateText)
        }
    }

    private var emptyStateText: String {
        switch range {
        case .day:       return "No data recorded today"
        case .week:      return "No data in the past 7 days"
        case .month:     return "No data in the past 30 days"
        case .sixMonths: return "No data in the past 6 months"
        case .year:      return "No data in the past year"
        }
    }

    private func placeholderChart(text: String) -> some View {
        HStack {
            Spacer()
            Text(text)
                .font(.system(size: 12))
                .foregroundColor(mutedText)
            Spacer()
        }
        .frame(height: 120)
        .background(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(barTrack.opacity(0.5))
        )
    }

    private func barChart(series: RangeSeries) -> some View {
        let maxVal = max(series.points.map(\.value).max() ?? 1, 0.0001)
        let tickLabels = xAxisTicks(for: series)

        return VStack(alignment: .leading, spacing: 8) {
            GeometryReader { geo in
                let spacing: CGFloat = series.points.count > 20 ? 1.5 : 3
                let totalSpacing = spacing * CGFloat(max(series.points.count - 1, 0))
                let barWidth = max((geo.size.width - totalSpacing) / CGFloat(series.points.count), 2)

                HStack(alignment: .bottom, spacing: spacing) {
                    ForEach(series.points) { point in
                        let h = CGFloat(point.value / maxVal) * geo.size.height
                        RoundedRectangle(
                            cornerRadius: series.points.count > 20 ? 1.5 : 3,
                            style: .continuous
                        )
                        .fill(
                            LinearGradient(
                                colors: [accent, accent.opacity(0.55)],
                                startPoint: .top, endPoint: .bottom
                            )
                        )
                        .frame(width: barWidth, height: max(h, point.value > 0 ? 3 : 1))
                        .opacity(point.value > 0 ? 1 : 0.18)
                    }
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }
            .frame(height: 120)

            HStack {
                ForEach(tickLabels, id: \.self) { label in
                    Text(label)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(axisColor)
                        .frame(maxWidth: .infinity)
                }
            }
        }
    }

    /// Pick a few evenly-spaced ticks from the series so the axis stays
    /// readable for 7, 24, 30, 26, or 12 bars.
    private func xAxisTicks(for series: RangeSeries) -> [String] {
        let points = series.points
        let target: Int
        switch series.range {
        case .day:       target = 4       // 00  06  12  18
        case .week:      return points.map(\.label)   // all 7 single-letter days
        case .month:     target = 5       // every ~7 days
        case .sixMonths: target = 6       // monthly marks
        case .year:      return points.map(\.label)   // 12 months
        }

        guard points.count > 1 else { return points.map(\.label) }
        let step = Double(points.count - 1) / Double(max(target - 1, 1))
        var labels: [String] = []
        for i in 0..<target {
            let idx = Int(Double(i) * step.rounded())
            if idx < points.count { labels.append(points[idx].label) }
        }
        return labels
    }

    // MARK: - Formatting

    private func formatted(_ value: Double) -> String {
        if value.isNaN || value.isInfinite { return "—" }
        let abs = Swift.abs(value)
        switch abs {
        case 0:
            return "0"
        case ..<10:
            return String(format: "%.1f", value)
        case ..<1_000:
            return String(format: "%.0f", value)
        default:
            let f = NumberFormatter()
            f.numberStyle = .decimal
            f.maximumFractionDigits = 0
            return f.string(from: NSNumber(value: value)) ?? "\(Int(value))"
        }
    }

    // MARK: - Data load

    private func reload() async {
        // Blood pressure on `day` range would produce a single snapshot bar;
        // fine, but we still load it.
        isLoading = true
        defer { isLoading = false }

        // Only fetch if HealthKit is authorized; otherwise fall back to
        // whatever weekly data the view-model already has.
        if manager.authState == .authorized {
            series = await manager.fetchSeries(for: metricKey, range: range)
        } else if !fallbackWeekly.isEmpty, range == .week {
            series = syntheticWeeklySeries()
        } else {
            series = nil
        }
    }

    private func syntheticWeeklySeries() -> RangeSeries {
        let pts = fallbackWeekly.enumerated().map { _, d in
            RangePoint(date: Date(), label: String(d.day.prefix(1)), value: d.value)
        }
        let total = pts.map(\.value).reduce(0, +)
        return RangeSeries(
            range: .week, points: pts, unit: "",
            aggregation: .sum,
            summaryValue: total,
            summaryCaption: "THIS WEEK"
        )
    }
}
