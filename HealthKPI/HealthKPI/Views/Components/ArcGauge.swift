import SwiftUI

// MARK: - Arc Shape

struct ArcShape: Shape {
    var startAngle: Angle
    var endAngle: Angle
    var clockwise: Bool = true

    func path(in rect: CGRect) -> Path {
        var path = Path()
        let center = CGPoint(x: rect.midX, y: rect.midY)
        let radius = min(rect.width, rect.height) / 2
        path.addArc(center: center,
                    radius: radius,
                    startAngle: startAngle,
                    endAngle: endAngle,
                    clockwise: !clockwise)
        return path
    }
}

// MARK: - Main Arc Gauge

struct ArcGauge: View {
    let score: Double          // 0–100
    let color: Color
    var lineWidth: CGFloat = 14
    var showValue: Bool = true
    var label: String = ""
    var sublabel: String = ""

    private let startAngle = Angle(degrees: 140)
    private let endAngle   = Angle(degrees: 40)
    private let totalArc   = 260.0

    var body: some View {
        ZStack {
            // Track
            ArcShape(startAngle: startAngle, endAngle: endAngle)
                .stroke(Color.white.opacity(0.08), style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))

            // Fill with gradient
            ArcShape(startAngle: startAngle,
                     endAngle: Angle(degrees: 140 + totalArc * (score / 100.0)))
                .stroke(
                    AngularGradient(
                        colors: gaugeColors(for: score),
                        center: .center,
                        startAngle: startAngle,
                        endAngle: Angle(degrees: 140 + totalArc)
                    ),
                    style: StrokeStyle(lineWidth: lineWidth, lineCap: .round)
                )
                .animation(.easeOut(duration: 1.0), value: score)

            // Center text
            if showValue {
                VStack(spacing: 2) {
                    Text("\(Int(score))")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    if !label.isEmpty {
                        Text(label)
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(.white.opacity(0.55))
                    }
                    if !sublabel.isEmpty {
                        Text(sublabel)
                            .font(.system(size: 10, weight: .regular))
                            .foregroundColor(.white.opacity(0.35))
                    }
                }
            }
        }
    }

    private func gaugeColors(for score: Double) -> [Color] {
        switch score {
        case 80...100: return [color.opacity(0.6), color]
        case 60..<80:  return [Color.yellow.opacity(0.6), color]
        case 40..<60:  return [Color.orange.opacity(0.6), Color.yellow]
        default:       return [Color.red.opacity(0.6), Color.orange]
        }
    }
}

// MARK: - Small Gauge (for cards)

struct MiniArcGauge: View {
    let score: Double
    let color: Color
    var lineWidth: CGFloat = 5

    private let startAngle = Angle(degrees: 140)
    private let totalArc   = 260.0
    private let endAngle   = Angle(degrees: 40)

    var body: some View {
        ZStack {
            ArcShape(startAngle: startAngle, endAngle: endAngle)
                .stroke(Color.white.opacity(0.08),
                        style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))

            ArcShape(startAngle: startAngle,
                     endAngle: Angle(degrees: 140 + totalArc * (score / 100.0)))
                .stroke(color, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .animation(.easeOut(duration: 0.8), value: score)
        }
    }
}

// MARK: - Tick Ring (like Garmin dial)

struct TickRingGauge: View {
    let score: Double
    let color: Color
    var size: CGFloat = 120

    private let totalTicks = 60
    private let filledColor: Color
    private let emptyColor = Color.white.opacity(0.12)

    init(score: Double, color: Color, size: CGFloat = 120) {
        self.score = score
        self.color = color
        self.size = size
        self.filledColor = color
    }

    var body: some View {
        ZStack {
            ForEach(0..<totalTicks, id: \.self) { i in
                let angle = Double(i) * (260.0 / Double(totalTicks - 1)) + 140.0
                let filled = Double(i) / Double(totalTicks - 1) <= score / 100.0
                let tickHeight: CGFloat = i % 5 == 0 ? 7 : 4

                RoundedRectangle(cornerRadius: 1.5)
                    .fill(filled ? colorForIndex(i) : emptyColor)
                    .frame(width: 2.5, height: tickHeight)
                    .offset(y: -(size / 2 - 4))
                    .rotationEffect(.degrees(angle))
            }
        }
        .frame(width: size, height: size)
    }

    private func colorForIndex(_ i: Int) -> Color {
        let ratio = Double(i) / Double(totalTicks - 1)
        if ratio < 0.33 {
            return Color(red: 0.2, green: 0.85, blue: 0.4)
        } else if ratio < 0.66 {
            return Color(red: 0.9, green: 0.8, blue: 0.1)
        } else {
            return Color(red: 0.95, green: 0.3, blue: 0.2)
        }
    }
}

// MARK: - Bar Chart

struct WeeklyBarChart: View {
    let data: [DailyDataPoint]
    let color: Color
    var highlightLast: Bool = true

    var body: some View {
        let maxVal = data.map(\.value).max() ?? 1
        let minVal = data.map(\.value).min() ?? 0
        let range = max(maxVal - minVal, 1)

        HStack(alignment: .bottom, spacing: 6) {
            ForEach(Array(data.enumerated()), id: \.element.id) { idx, point in
                let normalized = (point.value - minVal) / range
                let isLast = idx == data.count - 1

                VStack(spacing: 4) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(isLast && highlightLast
                              ? color
                              : color.opacity(0.35))
                        .frame(height: max(CGFloat(normalized) * 80, 6))
                    Text(point.day)
                        .font(.system(size: 9, weight: .medium))
                        .foregroundColor(.white.opacity(0.4))
                }
                .frame(maxWidth: .infinity)
            }
        }
        .frame(height: 100)
    }
}
