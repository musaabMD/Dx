import SwiftUI

struct LiquidBackground: View {
    let accent: Color

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color(red: 0.03, green: 0.07, blue: 0.14), Color(red: 0.05, green: 0.12, blue: 0.18), Color(red: 0.10, green: 0.06, blue: 0.16)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            Circle()
                .fill(accent.opacity(0.34))
                .frame(width: 280, height: 280)
                .blur(radius: 80)
                .offset(x: 120, y: -260)

            Circle()
                .fill(Color.white.opacity(0.08))
                .frame(width: 220, height: 220)
                .blur(radius: 70)
                .offset(x: -120, y: -120)

            RoundedRectangle(cornerRadius: 80, style: .continuous)
                .fill(Color.white.opacity(0.05))
                .frame(width: 340, height: 280)
                .rotationEffect(.degrees(-18))
                .blur(radius: 32)
                .offset(x: -120, y: 220)
        }
    }
}

enum GlassStyle {
    case primary
    case secondary
    case accent

    var fillOpacity: Double {
        switch self {
        case .primary: 0.28
        case .secondary: 0.18
        case .accent: 0.24
        }
    }

    var strokeOpacity: Double {
        switch self {
        case .primary: 0.28
        case .secondary: 0.16
        case .accent: 0.34
        }
    }
}

struct GlassCardModifier: ViewModifier {
    let style: GlassStyle
    let tint: Color
    let cornerRadius: CGFloat

    func body(content: Content) -> some View {
        content
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .background(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(tint.opacity(style.fillOpacity))
            )
            .overlay {
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .stroke(Color.white.opacity(style.strokeOpacity), lineWidth: 1)
            }
            .overlay(alignment: .topLeading) {
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [Color.white.opacity(0.22), .clear],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .blendMode(.screen)
                    .opacity(0.6)
            }
            .shadow(color: tint.opacity(0.20), radius: 30, x: 0, y: 18)
    }
}

extension View {
    func liquidGlass(style: GlassStyle = .primary, tint: Color = .white, cornerRadius: CGFloat = 26) -> some View {
        modifier(GlassCardModifier(style: style, tint: tint, cornerRadius: cornerRadius))
    }
}

enum MotionTokens {
    static let snappy = Animation.spring(response: 0.28, dampingFraction: 0.84)
    static let smooth = Animation.spring(response: 0.38, dampingFraction: 0.86)
    static let expanded = Animation.spring(response: 0.46, dampingFraction: 0.82)
}

struct SectionHeader: View {
    let title: String
    let subtitle: String?

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundStyle(.white)
            if let subtitle {
                Text(subtitle)
                    .font(.system(size: 13, weight: .medium, design: .rounded))
                    .foregroundStyle(.white.opacity(0.72))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}

struct GlassChip: View {
    let text: String
    let tint: Color
    var systemImage: String? = nil

    var body: some View {
        HStack(spacing: 6) {
            if let systemImage {
                Image(systemName: systemImage)
                    .font(.system(size: 11, weight: .semibold))
            }
            Text(text)
                .font(.system(size: 12, weight: .semibold, design: .rounded))
        }
        .foregroundStyle(.white)
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .liquidGlass(style: .secondary, tint: tint, cornerRadius: 16)
    }
}

struct EmptyStateCard: View {
    let title: String
    let subtitle: String
    let tint: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.system(size: 17, weight: .semibold, design: .rounded))
                .foregroundStyle(.white)
            Text(subtitle)
                .font(.system(size: 13, weight: .medium, design: .rounded))
                .foregroundStyle(.white.opacity(0.68))
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(18)
        .liquidGlass(style: .secondary, tint: tint, cornerRadius: 24)
    }
}
