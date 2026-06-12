import SwiftUI

enum DesignTokens {
    enum ColorToken {
        // Brand — iOS system-style blue (no purple / magenta)
        static let brand        = Color(hex: 0x007AFF)
        static let brandMid     = Color(hex: 0x3395FF)
        static let brandLight   = Color(hex: 0xE8F2FF)
        static let brandDark    = Color(hex: 0x0051D5)

        // Ink / text
        static let ink          = Color(hex: 0x1C1C1E)
        static let inkSoft      = Color(hex: 0x3A3A3C)
        static let muted        = Color(hex: 0x636366)
        static let placeholder  = Color(hex: 0x8E8E93)

        // Surfaces — grouped-background neutrals
        static let surface      = Color(hex: 0xF2F2F7)
        static let surfaceCard  = Color.white
        static let border       = Color(hex: 0xE5E5EA)
        static let borderSoft   = Color(hex: 0xEFEFF4)

        // Semantic
        static let success      = Color(hex: 0x10B981)
        static let successLight = Color(hex: 0xD1FAE5)
        static let danger       = Color(hex: 0xEF4444)
        static let warning      = Color(hex: 0xF59E0B)
        static let warningLight = Color(hex: 0xFEF3C7)

        // Gamification
        static let xp           = Color(hex: 0xFF9500)
        static let streak       = Color(hex: 0xFF6B00)
        static let streakLight  = Color(hex: 0xFFF3E8)

        // Gradients — deep blue → sky (Apple-like, zero magenta)
        static let gradientBrand = LinearGradient(
            colors: [Color(hex: 0x007AFF), Color(hex: 0x32ADE6)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        static let gradientHero = LinearGradient(
            colors: [Color(hex: 0x0A2540), Color(hex: 0x1E5AA8), Color(hex: 0x2B8CFF)],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        static let gradientSurface = LinearGradient(
            colors: [Color(hex: 0xEEF1F5), Color(hex: 0xF8F9FB)],
            startPoint: .top,
            endPoint: .bottom
        )

        /// Third stop for hero cards (replaces purple in local gradients).
        static let brandDeep = Color(hex: 0x004A99)
    }

    enum Spacing {
        static let xs: CGFloat = 4
        static let s:  CGFloat = 8
        static let m:  CGFloat = 12
        static let l:  CGFloat = 16
        static let xl: CGFloat = 20
        static let xxl: CGFloat = 28
        static let xxxl: CGFloat = 40
    }

    enum Radius {
        static let small:   CGFloat = 10
        static let card:    CGFloat = 20
        static let large:   CGFloat = 28
        static let control: CGFloat = 13
        static let pill:    CGFloat = 999
    }

    enum Shadow {
        static let card = ShadowStyle(color: Color.black.opacity(0.07), radius: 12, x: 0, y: 4)
        static let button = ShadowStyle(color: Color(hex: 0x007AFF).opacity(0.28), radius: 16, x: 0, y: 6)
    }
}

struct ShadowStyle {
    let color: Color
    let radius: CGFloat
    let x: CGFloat
    let y: CGFloat
}

extension View {
    /// Prefer `liquidFloatShadow()` or glass surfaces; kept for legacy call sites.
    func cardShadow() -> some View {
        shadow(color: Color.black.opacity(0.05), radius: 10, x: 0, y: 4)
    }

    func brandShadow() -> some View {
        shadow(color: DesignTokens.ColorToken.brand.opacity(0.22), radius: 12, x: 0, y: 6)
    }
}

extension Color {
    init(hex: UInt32, opacity: Double = 1) {
        let r = Double((hex >> 16) & 0xFF) / 255
        let g = Double((hex >> 8) & 0xFF) / 255
        let b = Double(hex & 0xFF) / 255
        self.init(.sRGB, red: r, green: g, blue: b, opacity: opacity)
    }
}
