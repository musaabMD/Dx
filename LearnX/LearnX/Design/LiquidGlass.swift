import SwiftUI

/// Shared “liquid glass” surfaces — frosted panels with a light edge highlight (iOS glass materials).
enum LiquidGlass {
    static let cardRadius: CGFloat = 22
    static let controlRadius: CGFloat = 14
}

struct LiquidBackdrop: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 0.93, green: 0.94, blue: 0.97),
                    Color(red: 0.96, green: 0.97, blue: 0.99),
                    Color(red: 0.90, green: 0.93, blue: 0.98),
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            Circle()
                .fill(DesignTokens.ColorToken.brand.opacity(0.11))
                .frame(width: 340, height: 340)
                .blur(radius: 70)
                .offset(x: -140, y: -240)

            Circle()
                .fill(Color(hex: 0x32ADE6).opacity(0.10))
                .frame(width: 300, height: 300)
                .blur(radius: 65)
                .offset(x: 160, y: 320)

            Circle()
                .fill(Color(hex: 0x5AC8FA).opacity(0.08))
                .frame(width: 220, height: 220)
                .blur(radius: 50)
                .offset(x: 80, y: -80)
        }
        .ignoresSafeArea()
    }
}

extension View {
    /// Full-screen soft gradient + blobs behind scroll content.
    func liquidAppBackground() -> some View {
        background { LiquidBackdrop() }
    }

    /// Frosted glass card with subtle rim light.
    func liquidGlassCard(cornerRadius: CGFloat = LiquidGlass.cardRadius) -> some View {
        self
            .background {
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(.clear)
                    .glassEffect(.regular, in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            }
            .overlay {
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .strokeBorder(
                        LinearGradient(
                            colors: [
                                Color.white.opacity(0.55),
                                Color.white.opacity(0.12),
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            }
    }

    /// Compact glass chip (badges, streak).
    func liquidGlassCapsule() -> some View {
        self
            .background {
                Capsule()
                    .fill(.clear)
                    .glassEffect(.regular, in: Capsule())
            }
            .overlay {
                Capsule()
                    .strokeBorder(Color.white.opacity(0.35), lineWidth: 0.75)
            }
    }

    /// Softer shadow for floating glass (minimal vs. old card shadow).
    func liquidFloatShadow() -> some View {
        shadow(color: Color.black.opacity(0.06), radius: 16, x: 0, y: 8)
    }
}
