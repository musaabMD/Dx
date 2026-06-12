import SwiftUI

enum GlassPalette {
    static let backgroundTop = Color(red: 0.07, green: 0.09, blue: 0.16)
    static let backgroundBottom = Color(red: 0.04, green: 0.06, blue: 0.12)
    static let accent = Color(red: 0.35, green: 0.75, blue: 0.95)
    static let highlight = Color.white.opacity(0.35)
}

struct GlassBackground: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [GlassPalette.backgroundTop, GlassPalette.backgroundBottom],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )

            Circle()
                .fill(
                    RadialGradient(
                        colors: [GlassPalette.accent.opacity(0.45), .clear],
                        center: .center,
                        startRadius: 20,
                        endRadius: 220
                    )
                )
                .frame(width: 360, height: 360)
                .offset(x: -140, y: -220)
                .blur(radius: 10)

            Circle()
                .fill(
                    RadialGradient(
                        colors: [Color.white.opacity(0.25), .clear],
                        center: .center,
                        startRadius: 10,
                        endRadius: 200
                    )
                )
                .frame(width: 320, height: 320)
                .offset(x: 160, y: -120)
                .blur(radius: 20)

            Circle()
                .fill(
                    RadialGradient(
                        colors: [Color(red: 0.6, green: 0.5, blue: 0.95).opacity(0.35), .clear],
                        center: .center,
                        startRadius: 10,
                        endRadius: 240
                    )
                )
                .frame(width: 380, height: 380)
                .offset(x: 40, y: 240)
                .blur(radius: 30)
        }
        .ignoresSafeArea()
    }
}

struct GlassSurface: ViewModifier {
    var cornerRadius: CGFloat = 20
    var tintOpacity: Double = 0.12
    var strokeOpacity: Double = 0.25
    var shadowOpacity: Double = 0.25

    func body(content: Content) -> some View {
        content
            .background(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                            .fill(Color.white.opacity(tintOpacity))
                    )
            )
            .clipShape(RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .stroke(
                        LinearGradient(
                            colors: [GlassPalette.highlight.opacity(strokeOpacity), Color.white.opacity(0.04)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        lineWidth: 1
                    )
            )
            .shadow(color: Color.black.opacity(shadowOpacity), radius: 24, x: 0, y: 14)
    }
}

extension View {
    func glassSurface(
        cornerRadius: CGFloat = 20,
        tintOpacity: Double = 0.12,
        strokeOpacity: Double = 0.25,
        shadowOpacity: Double = 0.25
    ) -> some View {
        modifier(
            GlassSurface(
                cornerRadius: cornerRadius,
                tintOpacity: tintOpacity,
                strokeOpacity: strokeOpacity,
                shadowOpacity: shadowOpacity
            )
        )
    }
}
