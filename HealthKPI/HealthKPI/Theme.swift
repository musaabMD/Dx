import SwiftUI

// MARK: - Theme
//
// A single source of truth for design tokens: colors, typography,
// spacing, radii and materials. Built to feel native — semantic Apple
// system colors layered with a refined accent palette so the app reads
// as part of iOS rather than a skinned web app.

enum Theme {

    // MARK: Accent (signature green, a touch muted vs iOS 17 system green)

    static let accent      = Color(red: 0.20, green: 0.78, blue: 0.55)
    static let accentSoft  = Color(red: 0.26, green: 0.82, blue: 0.60)
    static let accentDeep  = Color(red: 0.13, green: 0.60, blue: 0.42)

    // MARK: Status (calibrated, less saturated than pure RGB — reads clean on both schemes)

    static let excellent = Color(red: 0.20, green: 0.78, blue: 0.52)
    static let good      = Color(red: 0.56, green: 0.82, blue: 0.25)
    static let fair      = Color(red: 0.98, green: 0.72, blue: 0.18)
    static let poor      = Color(red: 0.98, green: 0.52, blue: 0.20)
    static let critical  = Color(red: 0.94, green: 0.28, blue: 0.28)

    // MARK: Neutral text (reads well over system background)

    static func textPrimary(_ scheme: ColorScheme) -> Color {
        scheme == .dark ? Color.white : Color(red: 0.07, green: 0.07, blue: 0.10)
    }

    static func textSecondary(_ scheme: ColorScheme) -> Color {
        scheme == .dark ? Color.white.opacity(0.60) : Color.black.opacity(0.58)
    }

    static func textTertiary(_ scheme: ColorScheme) -> Color {
        scheme == .dark ? Color.white.opacity(0.40) : Color.black.opacity(0.40)
    }

    static func textQuaternary(_ scheme: ColorScheme) -> Color {
        scheme == .dark ? Color.white.opacity(0.22) : Color.black.opacity(0.18)
    }

    // MARK: Surfaces (system-backed so the OS handles dark/light properly)

    static let background        = Color(.systemBackground)
    static let secondaryBackground = Color(.secondarySystemBackground)
    static let tertiaryBackground  = Color(.tertiarySystemBackground)
    static let groupedBackground   = Color(.systemGroupedBackground)

    static func hairline(_ scheme: ColorScheme) -> Color {
        scheme == .dark ? Color.white.opacity(0.08) : Color.black.opacity(0.07)
    }

    static func fillTrack(_ scheme: ColorScheme) -> Color {
        scheme == .dark ? Color.white.opacity(0.12) : Color.black.opacity(0.08)
    }

    // MARK: Radii

    enum Radius {
        static let xs: CGFloat = 8
        static let sm: CGFloat = 12
        static let md: CGFloat = 16
        static let lg: CGFloat = 20
        static let xl: CGFloat = 26
    }

    // MARK: Spacing

    enum Space {
        static let xs: CGFloat = 4
        static let sm: CGFloat = 8
        static let md: CGFloat = 12
        static let lg: CGFloat = 16
        static let xl: CGFloat = 20
        static let xxl: CGFloat = 28
    }
}

// MARK: - Typography

extension Font {
    /// Rounded display font — used for large numerals and titles (Apple-style).
    static func display(_ size: CGFloat, weight: Font.Weight = .bold) -> Font {
        .system(size: size, weight: weight, design: .rounded)
    }

    /// Monospaced digits — for stats/numerics that sit inline with text.
    static func monoDigit(_ size: CGFloat, weight: Font.Weight = .semibold) -> Font {
        .system(size: size, weight: weight, design: .rounded).monospacedDigit()
    }

    /// Compact ALL-CAPS label (Apple Health uses similar throughout).
    static func eyebrow(_ size: CGFloat = 10) -> Font {
        .system(size: size, weight: .heavy, design: .default)
    }
}

// MARK: - Surface helpers

extension View {
    /// Primary card surface. On iOS 26 this would compose with `.glassEffect`
    /// directly; here we use a refined material that reads clean in both
    /// schemes without the "fake plastic" look of heavy custom fills.
    @ViewBuilder
    func cardSurface(cornerRadius: CGFloat = Theme.Radius.lg) -> some View {
        self
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: cornerRadius, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .strokeBorder(Color.primary.opacity(0.06), lineWidth: 0.5)
            )
    }

    /// Soft inset fill used for secondary surfaces (inside a card, list rows).
    @ViewBuilder
    func insetSurface(cornerRadius: CGFloat = Theme.Radius.md,
                      scheme: ColorScheme) -> some View {
        self
            .background(
                RoundedRectangle(cornerRadius: cornerRadius, style: .continuous)
                    .fill(scheme == .dark ? Color.white.opacity(0.04) : Color.black.opacity(0.03))
            )
    }
}

// MARK: - IndicatorStatus palette bridge (keeps Model untouched)

extension IndicatorStatus {
    var themeColor: Color {
        switch self {
        case .excellent: return Theme.excellent
        case .good:      return Theme.good
        case .fair:      return Theme.fair
        case .poor:      return Theme.poor
        case .critical:  return Theme.critical
        }
    }
}
