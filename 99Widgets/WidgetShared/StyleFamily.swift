//
//  StyleFamily.swift
//  WidgetShared
//
//  A Style Family is a hand-designed mini design system.
//  It locks ~90% of visual decisions so the generator can never produce
//  an ugly result — only composition, chart type, and metric assignment vary.
//

import SwiftUI

// MARK: - Fine-Grained Design Tokens

/// Per-family design tokens that go beyond what WidgetStyle encodes.
/// These cover the details that separate "looks designed" from "looks generated":
/// letter spacing, label casing, stroke weight, corner radius vocabulary.
public struct FamilyTokens: Equatable, Sendable {
    /// Weight used for the hero display number.
    public let displayFontWeight: Font.Weight
    /// Letter-spacing (tracking) for metric name labels.
    public let labelTracking: CGFloat
    /// Whether metric labels are uppercased ("STEPS" vs "Steps").
    public let labelIsUppercased: Bool
    /// Stroke width for line / area chart lines.
    public let chartStrokeWidth: CGFloat
    /// Corner radius on individual bar segments.
    public let chartBarRadius: CGFloat
    /// Outer widget clip corner radius.
    public let widgetCornerRadius: CGFloat
    /// Content inset padding inside the widget.
    public let innerPadding: CGFloat

    public init(
        displayFontWeight: Font.Weight,
        labelTracking: CGFloat,
        labelIsUppercased: Bool,
        chartStrokeWidth: CGFloat,
        chartBarRadius: CGFloat,
        widgetCornerRadius: CGFloat,
        innerPadding: CGFloat
    ) {
        self.displayFontWeight = displayFontWeight
        self.labelTracking = labelTracking
        self.labelIsUppercased = labelIsUppercased
        self.chartStrokeWidth = chartStrokeWidth
        self.chartBarRadius = chartBarRadius
        self.widgetCornerRadius = widgetCornerRadius
        self.innerPadding = innerPadding
    }

    /// Fallback used when no family is active (matches legacy hardcoded values).
    public static let `default` = FamilyTokens(
        displayFontWeight: .bold,
        labelTracking: 0.8,
        labelIsUppercased: true,
        chartStrokeWidth: 1.5,
        chartBarRadius: 3,
        widgetCornerRadius: 22,
        innerPadding: 16
    )
}

// MARK: - SwiftUI Environment

private struct FamilyTokensKey: EnvironmentKey {
    static let defaultValue = FamilyTokens.default
}

public extension EnvironmentValues {
    var familyTokens: FamilyTokens {
        get { self[FamilyTokensKey.self] }
        set { self[FamilyTokensKey.self] = newValue }
    }
}

// MARK: - Style Family Definition

/// One complete aesthetic point of view.
/// Contains every visual decision a designer would make — locked.
/// The generator only picks within `allowedCompositions` and `allowedCharts`.
public struct StyleFamilyDefinition: Identifiable, Sendable {
    public let id: String
    public let displayName: String
    /// One-line flavor text shown in pickers and onboarding.
    public let tagline: String

    // Locked aesthetic dimensions
    public let palette: PaletteKind
    public let typography: TypographyKind
    public let accent: AccentKind
    public let density: DensityKind

    /// Fine-grained tokens beyond WidgetStyle.
    public let tokens: FamilyTokens

    /// Compositions the generator is allowed to produce for this family.
    public let allowedCompositions: [CompositionKind]
    /// Chart types this family supports (constrained to 2-3 per family).
    public let allowedCharts: [ChartKind]
    /// Metrics this family is aesthetically matched to (influences recommendation).
    public let preferredMetrics: [HealthMetricKind]

    // MARK: Style Production

    /// Build a complete WidgetStyle within this family's constraints.
    public func makeStyle(composition: CompositionKind, chart: ChartKind) -> WidgetStyle {
        WidgetStyle(
            layout: canonicalLayout(for: composition),
            palette: palette,
            typography: typography,
            chart: chart,
            density: density,
            accent: accent,
            composition: composition,
            familyID: id
        )
    }

    /// The canonical layout for each composition kind in this family.
    /// Families that are centered / focal-first override this.
    private func canonicalLayout(for composition: CompositionKind) -> LayoutKind {
        switch composition {
        case .solo:         return .stacked
        case .heroSidecar:  return .split
        case .splitPair:    return .split
        case .ringTrio:     return .orbital
        case .dashboard:    return .grid
        case .heroStrip:    return .stacked
        case .journalList:  return .split
        }
    }
}

// MARK: - The 8 Style Families

public enum StyleFamilies {

    // ─────────────────────────────────────────────────────────────────────────
    // 1. Clinical — white, monospace, precise (think Oura, Whoop data screen)
    // ─────────────────────────────────────────────────────────────────────────
    public static let clinical = StyleFamilyDefinition(
        id: "clinical",
        displayName: "Clinical",
        tagline: "White · mono · precise",
        palette: .clinical,
        typography: .mono,
        accent: .grid,
        density: .dense,
        tokens: FamilyTokens(
            displayFontWeight: .bold,
            labelTracking: 1.4,
            labelIsUppercased: true,
            chartStrokeWidth: 1.0,
            chartBarRadius: 1,
            widgetCornerRadius: 18,
            innerPadding: 14
        ),
        allowedCompositions: [.solo, .heroSidecar, .splitPair, .dashboard],
        allowedCharts: [.line, .bar],
        preferredMetrics: [.heartRate, .hrv, .vo2Max, .restingHeartRate, .bodyWeight]
    )

    // ─────────────────────────────────────────────────────────────────────────
    // 2. Noir Editorial — black, serif, cinematic (think Whoop premium)
    // ─────────────────────────────────────────────────────────────────────────
    public static let noirEditorial = StyleFamilyDefinition(
        id: "noir_editorial",
        displayName: "Noir Editorial",
        tagline: "Black · serif · cinematic",
        palette: .noir,
        typography: .serif,
        accent: .border,
        density: .dense,
        tokens: FamilyTokens(
            displayFontWeight: .black,
            labelTracking: 0.4,
            labelIsUppercased: false,
            chartStrokeWidth: 1.0,
            chartBarRadius: 0,
            widgetCornerRadius: 20,
            innerPadding: 16
        ),
        allowedCompositions: [.solo, .heroSidecar, .journalList],
        allowedCharts: [.line, .area, .none],
        preferredMetrics: [.steps, .heartRate, .sleep, .vo2Max, .hrv]
    )

    // ─────────────────────────────────────────────────────────────────────────
    // 3. Soft Pastel — warm pinks, rounded, soft (think Calm, mindfulness)
    // ─────────────────────────────────────────────────────────────────────────
    public static let softPastel = StyleFamilyDefinition(
        id: "soft_pastel",
        displayName: "Soft Pastel",
        tagline: "Warm · rounded · gentle",
        palette: .cream,
        typography: .rounded,
        accent: .blob,
        density: .minimal,
        tokens: FamilyTokens(
            displayFontWeight: .black,
            labelTracking: 0.2,
            labelIsUppercased: false,
            chartStrokeWidth: 2.0,
            chartBarRadius: 8,
            widgetCornerRadius: 26,
            innerPadding: 18
        ),
        allowedCompositions: [.solo, .heroSidecar, .splitPair],
        allowedCharts: [.ring, .bar, .none],
        preferredMetrics: [.mindfulMinutes, .bodyWeight, .sleep, .restingHeartRate]
    )

    // ─────────────────────────────────────────────────────────────────────────
    // 4. Arcade — black + neon pink, mono, playful (think Strava retro)
    // ─────────────────────────────────────────────────────────────────────────
    public static let arcade = StyleFamilyDefinition(
        id: "arcade",
        displayName: "Arcade",
        tagline: "Neon · mono · pixel-crisp",
        palette: .arcade,
        typography: .mono,
        accent: .glow,
        density: .balanced,
        tokens: FamilyTokens(
            displayFontWeight: .black,
            labelTracking: 0.0,
            labelIsUppercased: true,
            chartStrokeWidth: 1.5,
            chartBarRadius: 0,
            widgetCornerRadius: 16,
            innerPadding: 14
        ),
        allowedCompositions: [.solo, .splitPair, .ringTrio],
        allowedCharts: [.dots, .bar],
        preferredMetrics: [.activeCalories, .steps, .exerciseMinutes, .vo2Max]
    )

    // ─────────────────────────────────────────────────────────────────────────
    // 5. Paper — cream, centered serif, minimal (think editorial journal)
    // ─────────────────────────────────────────────────────────────────────────
    public static let paper = StyleFamilyDefinition(
        id: "paper",
        displayName: "Paper",
        tagline: "Cream · serif · editorial",
        palette: .paper,
        typography: .serif,
        accent: .none,
        density: .minimal,
        tokens: FamilyTokens(
            displayFontWeight: .bold,
            labelTracking: 0.3,
            labelIsUppercased: false,
            chartStrokeWidth: 1.0,
            chartBarRadius: 2,
            widgetCornerRadius: 20,
            innerPadding: 18
        ),
        allowedCompositions: [.solo, .heroSidecar, .journalList],
        allowedCharts: [.line, .none],
        preferredMetrics: [.steps, .bodyWeight, .mindfulMinutes, .sleep]
    )

    // ─────────────────────────────────────────────────────────────────────────
    // 6. Nordic — light teal, sans-serif, calm (think Apple Fitness)
    // ─────────────────────────────────────────────────────────────────────────
    public static let nordic = StyleFamilyDefinition(
        id: "nordic",
        displayName: "Nordic",
        tagline: "Navy · sans · calm",
        palette: .nordic,
        typography: .sans,
        accent: .none,
        density: .balanced,
        tokens: FamilyTokens(
            displayFontWeight: .bold,
            labelTracking: 0.6,
            labelIsUppercased: true,
            chartStrokeWidth: 2.0,
            chartBarRadius: 4,
            widgetCornerRadius: 22,
            innerPadding: 16
        ),
        allowedCompositions: [.solo, .heroSidecar, .dashboard, .heroStrip],
        allowedCharts: [.bar, .area],
        preferredMetrics: [.sleep, .steps, .heartRate, .exerciseMinutes, .standHours]
    )

    // ─────────────────────────────────────────────────────────────────────────
    // 7. Forest — deep green, serif, premium (think hiker's aesthetic)
    // ─────────────────────────────────────────────────────────────────────────
    public static let forest = StyleFamilyDefinition(
        id: "forest",
        displayName: "Forest",
        tagline: "Deep green · serif · premium",
        palette: .forest,
        typography: .serif,
        accent: .glow,
        density: .balanced,
        tokens: FamilyTokens(
            displayFontWeight: .bold,
            labelTracking: 0.2,
            labelIsUppercased: false,
            chartStrokeWidth: 1.5,
            chartBarRadius: 4,
            widgetCornerRadius: 22,
            innerPadding: 16
        ),
        allowedCompositions: [.solo, .heroSidecar, .ringTrio, .dashboard],
        allowedCharts: [.line, .area, .ring],
        preferredMetrics: [.steps, .activeCalories, .exerciseMinutes, .vo2Max, .flightsClimbed]
    )

    // ─────────────────────────────────────────────────────────────────────────
    // 8. Sunset — warm dark, ring-first, energetic (think Peloton)
    // ─────────────────────────────────────────────────────────────────────────
    public static let sunset = StyleFamilyDefinition(
        id: "sunset",
        displayName: "Sunset",
        tagline: "Warm · ring-first · energetic",
        palette: .sunset,
        typography: .rounded,
        accent: .glow,
        density: .balanced,
        tokens: FamilyTokens(
            displayFontWeight: .black,
            labelTracking: 0.0,
            labelIsUppercased: false,
            chartStrokeWidth: 2.0,
            chartBarRadius: 5,
            widgetCornerRadius: 24,
            innerPadding: 16
        ),
        allowedCompositions: [.solo, .heroSidecar, .ringTrio],
        allowedCharts: [.ring, .bar],
        preferredMetrics: [.activeCalories, .steps, .heartRate, .exerciseMinutes, .standHours]
    )

    // MARK: - Registry

    public static let all: [StyleFamilyDefinition] = [
        clinical, noirEditorial, softPastel, arcade, paper, nordic, forest, sunset
    ]

    public static func find(id: String) -> StyleFamilyDefinition? {
        all.first { $0.id == id }
    }

    /// Best-matching family for a given primary metric (used in onboarding smart-defaults).
    public static func recommended(for metric: HealthMetricKind) -> StyleFamilyDefinition {
        all.first { $0.preferredMetrics.contains(metric) } ?? nordic
    }
}

// MARK: - Family-Aware Generator Extension

public extension StyleGenerator {

    /// Generate a deterministic WidgetStyle guaranteed to look good
    /// because it stays within the family's allowed compositions and charts.
    static func generate(
        family: StyleFamilyDefinition,
        seed: UInt64,
        primaryMetric: HealthMetricKind,
        slotCount: Int = 1
    ) -> WidgetStyle {
        var rng = SeededRNG(seed: seed)

        // Filter compositions by slot count first, then pick randomly within family
        let eligible = family.allowedCompositions.filter { c in
            slotCount <= 1 ? c == .solo || c.minSlots == 1 : c.minSlots <= slotCount
        }
        let composition = eligible.seededRandom(using: &rng)
            ?? family.allowedCompositions.first { $0.minSlots <= max(slotCount, 1) }
            ?? family.allowedCompositions[0]

        let chart = family.allowedCharts.seededRandom(using: &rng)
            ?? family.allowedCharts[0]

        return family.makeStyle(composition: composition, chart: chart)
    }

    /// Shuffle: keep the family, vary only composition and chart.
    /// This is the "show me another look" operation — aesthetic stays stable.
    static func shuffleWithinFamily(
        style: WidgetStyle,
        seed: UInt64,
        slotCount: Int = 1
    ) -> WidgetStyle {
        guard let familyID = style.familyID,
              let family = StyleFamilies.find(id: familyID) else {
            return mutate(style: style, seed: seed)
        }
        return generate(
            family: family,
            seed: seed,
            primaryMetric: .steps,
            slotCount: slotCount
        )
    }
}
