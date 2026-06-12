import SwiftUI

enum AppTheme {
    // Cal AI style background tones
    static let bgTop = Color(hex: "F8F7F6")
    static let bgMid = Color(hex: "F3F8F7")
    static let bgBottom = Color(hex: "FFFFFF")

    // Backward-compatible aliases for existing usage
    static let bg = bgMid
    static let secondaryBg = Color.white.opacity(0.96)
    static let surface = Color.white.opacity(0.96)
    static let divider = Color(hex: "EDEDED")

    // Text
    static let primaryText = Color(hex: "111111")
    static let secondaryText = Color(hex: "8E8E93")
    static let tertiaryText = Color(hex: "B0B0B5")

    // Accents
    static let flameOrange = Color(hex: "EF9737")
    static let accentGreen = Color(hex: "36C95D")
    static let accentBlue = Color(hex: "6B99DE")
    static let accentRed = Color(hex: "DE6C57")
    static let accent = accentBlue

    // Status aliases
    static let green = accentGreen
    static let red = accentRed
    static let orange = flameOrange

    static let backgroundGradient = LinearGradient(
        stops: [
            .init(color: bgTop, location: 0.0),
            .init(color: bgMid, location: 0.35),
            .init(color: bgBottom, location: 1.0)
        ],
        startPoint: .top,
        endPoint: .bottom
    )
}

extension Color {
    init(hex: String, alpha: Double = 1.0) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&int)

        let r, g, b: UInt64
        switch cleaned.count {
        case 6:
            (r, g, b) = ((int >> 16) & 0xFF, (int >> 8) & 0xFF, int & 0xFF)
        default:
            (r, g, b) = (255, 255, 255)
        }

        self.init(
            .sRGB,
            red: Double(r) / 255.0,
            green: Double(g) / 255.0,
            blue: Double(b) / 255.0,
            opacity: alpha
        )
    }

    static func scoreColor(_ score: Int) -> Color {
        if score >= 80 { return AppTheme.accentGreen }
        if score >= 60 { return AppTheme.flameOrange }
        return AppTheme.accentRed
    }
}

struct CardStyle: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding(18)
            .background(AppTheme.surface)
            .clipShape(RoundedRectangle(cornerRadius: 24, style: .continuous))
            .shadow(color: .black.opacity(0.06), radius: 18, x: 0, y: 10)
            .overlay(
                RoundedRectangle(cornerRadius: 24, style: .continuous)
                    .stroke(Color.white.opacity(0.7), lineWidth: 1)
            )
    }
}

extension View {
    func appCard() -> some View { 
        modifier(CardStyle())
    }
}
