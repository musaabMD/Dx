//
//  WidgetStyle.swift
//  WidgetShared
//
//  6 independent style dimensions that compose every widget design.
//  Any combination of values is valid — that's how you get "unlimited" templates.
//

import SwiftUI

// MARK: - Dimension 1: Layout Skeleton

public enum LayoutKind: String, Codable, CaseIterable, Identifiable {
    case stacked    // value top, chart bottom
    case split      // label/chart left column, value right
    case focal      // giant number full-bleed center
    case orbital    // progress ring with value inside
    case grid       // 4-quadrant sub-stats

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .stacked:  return "Stacked"
        case .split:    return "Split"
        case .focal:    return "Focal"
        case .orbital:  return "Orbital"
        case .grid:     return "Grid"
        }
    }

    public var symbol: String {
        switch self {
        case .stacked:  return "square.split.bottomrightquarter"
        case .split:    return "rectangle.split.2x1"
        case .focal:    return "circle.fill"
        case .orbital:  return "circle.dashed.inset.filled"
        case .grid:     return "grid"
        }
    }
}

// MARK: - Dimension 2: Palette

public enum PaletteKind: String, Codable, CaseIterable, Identifiable {
    case graphite, noir, ocean, forest, sunset, cyber, nordic
    case clinical, cream, paper, arcade, sunrise

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .graphite: return "Graphite"
        case .noir:     return "Noir"
        case .ocean:    return "Ocean"
        case .forest:   return "Forest"
        case .sunset:   return "Sunset"
        case .cyber:    return "Cyber"
        case .nordic:   return "Nordic"
        case .clinical: return "Clinical"
        case .cream:    return "Cream"
        case .paper:    return "Paper"
        case .arcade:   return "Arcade"
        case .sunrise:  return "Sunrise"
        }
    }

    public var isDark: Bool {
        switch self {
        case .clinical, .cream, .paper, .sunrise: return false
        default: return true
        }
    }
}

// MARK: - Dimension 3: Typography

public enum TypographyKind: String, Codable, CaseIterable, Identifiable {
    case rounded, serif, mono, sans, condensed

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .rounded:   return "Rounded"
        case .serif:     return "Serif"
        case .mono:      return "Mono"
        case .sans:      return "Sans"
        case .condensed: return "Condensed"
        }
    }

    public func displayFont(size: CGFloat, weight: Font.Weight = .bold) -> Font {
        switch self {
        case .rounded:   return .system(size: size, weight: weight, design: .rounded)
        case .serif:     return .system(size: size, weight: weight, design: .serif)
        case .mono:      return .system(size: size, weight: weight, design: .monospaced)
        case .sans:      return .system(size: size, weight: weight)
        case .condensed: return .system(size: size, weight: .black)
        }
    }
}

// MARK: - Dimension 4: Chart Style

public enum ChartKind: String, Codable, CaseIterable, Identifiable {
    case bar, line, area, ring, dots, none

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .bar:  return "Bar"
        case .line: return "Line"
        case .area: return "Area"
        case .ring: return "Ring"
        case .dots: return "Dots"
        case .none: return "None"
        }
    }

    public var symbol: String {
        switch self {
        case .bar:  return "chart.bar.fill"
        case .line: return "chart.xyaxis.line"
        case .area: return "waveform"
        case .ring: return "circle.dashed"
        case .dots: return "smallcircle.filled.circle"
        case .none: return "minus"
        }
    }
}

// MARK: - Dimension 5: Information Density

public enum DensityKind: String, Codable, CaseIterable, Identifiable {
    case minimal    // value + label only
    case balanced   // + trend + chart
    case dense      // + secondary stat + goal delta + time

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .minimal:  return "Minimal"
        case .balanced: return "Balanced"
        case .dense:    return "Data-Dense"
        }
    }
}

// MARK: - Dimension 6: Accent / Texture

public enum AccentKind: String, Codable, CaseIterable, Identifiable {
    case none, blob, glow, grain, border, grid

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .none:   return "None"
        case .blob:   return "Blob"
        case .glow:   return "Glow"
        case .grain:  return "Grain"
        case .border: return "Border"
        case .grid:   return "Grid"
        }
    }
}

// MARK: - Dimension 7: Composition

public enum CompositionKind: String, Codable, CaseIterable, Identifiable {
    case solo           // 1 metric (small widget)
    case heroSidecar    // 1 hero + 1-2 secondary  (medium)
    case splitPair      // 2 equal primaries        (medium)
    case ringTrio       // 3 ring progress metrics  (medium)
    case dashboard      // 2×2 grid of 4 metrics    (large)
    case heroStrip      // 1 hero + 3-4 accents row (large)
    case journalList    // 4-6 list rows            (large)

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .solo:         return "Solo"
        case .heroSidecar:  return "Hero + Sidecar"
        case .splitPair:    return "Split Pair"
        case .ringTrio:     return "Ring Trio"
        case .dashboard:    return "Dashboard"
        case .heroStrip:    return "Hero + Strip"
        case .journalList:  return "Journal"
        }
    }

    public var symbol: String {
        switch self {
        case .solo:         return "square.fill"
        case .heroSidecar:  return "rectangle.split.2x1"
        case .splitPair:    return "rectangle.split.2x1.fill"
        case .ringTrio:     return "circle.grid.3x1.fill"
        case .dashboard:    return "grid"
        case .heroStrip:    return "rectangle.topthird.inset.filled"
        case .journalList:  return "list.bullet"
        }
    }

    /// Minimum number of metric slots this composition needs.
    public var minSlots: Int {
        switch self {
        case .solo:         return 1
        case .heroSidecar:  return 2
        case .splitPair:    return 2
        case .ringTrio:     return 3
        case .dashboard:    return 3
        case .heroStrip:    return 2
        case .journalList:  return 3
        }
    }

    /// Whether this composition renders taller (large widget preview).
    public var isLargeFormat: Bool {
        switch self {
        case .dashboard, .heroStrip, .journalList: return true
        default: return false
        }
    }

    public var aspectRatio: CGFloat {
        isLargeFormat ? 1.0 : (4.0 / 2.2)
    }

    /// Slot roles this composition expects, in order.
    public var slotRoles: [SlotRole] {
        switch self {
        case .solo:         return [.primary]
        case .heroSidecar:  return [.primary, .secondary, .accent]
        case .splitPair:    return [.primary, .primary]
        case .ringTrio:     return [.accent, .accent, .accent]
        case .dashboard:    return [.primary, .secondary, .secondary, .accent]
        case .heroStrip:    return [.primary, .accent, .accent, .accent]
        case .journalList:  return [.secondary, .secondary, .secondary, .accent, .context]
        }
    }
}

// MARK: - Widget Style (7-dimensional composite + optional family binding)

public struct WidgetStyle: Codable, Hashable, Identifiable {
    public var layout: LayoutKind
    public var palette: PaletteKind
    public var typography: TypographyKind
    public var chart: ChartKind
    public var density: DensityKind
    public var accent: AccentKind
    public var composition: CompositionKind
    /// When set, this style was produced by a StyleFamilyDefinition.
    /// Used by WidgetRenderView to inject the family's FamilyTokens,
    /// and by the generator to constrain shuffle operations.
    public var familyID: String?

    public var id: String {
        let base = "\(layout.rawValue)·\(palette.rawValue)·\(typography.rawValue)·\(chart.rawValue)·\(density.rawValue)·\(accent.rawValue)·\(composition.rawValue)"
        if let fid = familyID { return "\(base)·\(fid)" }
        return base
    }

    public init(
        layout: LayoutKind = .stacked,
        palette: PaletteKind = .graphite,
        typography: TypographyKind = .rounded,
        chart: ChartKind = .bar,
        density: DensityKind = .balanced,
        accent: AccentKind = .none,
        composition: CompositionKind = .solo,
        familyID: String? = nil
    ) {
        self.layout = layout
        self.palette = palette
        self.typography = typography
        self.chart = chart
        self.density = density
        self.accent = accent
        self.composition = composition
        self.familyID = familyID
    }

    public static let `default` = WidgetStyle()

    /// Convenience: resolve the family definition this style was built from.
    public var family: StyleFamilyDefinition? {
        familyID.flatMap { StyleFamilies.find(id: $0) }
    }
}

// MARK: - Style Generator

public struct StyleGenerator {

    // MARK: Generate from seed

    /// Deterministically derives a complete WidgetStyle from a seed + primary metric.
    /// Same seed → same style, always. Safe for sharing as a URL.
    public static func generate(
        seed: UInt64,
        primaryMetric: HealthMetricKind,
        slotCount: Int = 1
    ) -> WidgetStyle {
        var rng = SeededRNG(seed: seed)

        let composition = pickComposition(slotCount: slotCount, using: &rng)
        let palette     = weightedPalette(for: primaryMetric, using: &rng)
        let typography  = TypographyKind.allCases.seededRandom(using: &rng) ?? .rounded
        let chart       = weightedChart(for: primaryMetric, using: &rng)
        let density     = DensityKind.allCases.seededRandom(using: &rng) ?? .balanced
        let accent      = AccentKind.allCases.seededRandom(using: &rng) ?? .none
        let layout      = LayoutKind.allCases.seededRandom(using: &rng) ?? .stacked

        // Rejection-sample bad palette+typography combos (max 4 retries)
        var finalTypo = typography
        for _ in 0..<4 where isBlocklisted(palette, finalTypo) {
            finalTypo = TypographyKind.allCases.seededRandom(using: &rng) ?? .rounded
        }

        return WidgetStyle(
            layout: layout,
            palette: palette,
            typography: finalTypo,
            chart: chart,
            density: density,
            accent: accent,
            composition: composition
        )
    }

    /// Mutates 1–2 dimensions (for "Like this" variations).
    public static func mutate(style: WidgetStyle, seed: UInt64) -> WidgetStyle {
        var rng = SeededRNG(seed: seed)
        var s = style
        let dim = rng.nextInt(4)
        switch dim {
        case 0: s.palette    = PaletteKind.allCases.seededRandom(using: &rng) ?? style.palette
        case 1: s.typography = TypographyKind.allCases.seededRandom(using: &rng) ?? style.typography
        case 2: s.chart      = ChartKind.allCases.seededRandom(using: &rng) ?? style.chart
        default: s.accent    = AccentKind.allCases.seededRandom(using: &rng) ?? style.accent
        }
        return s
    }

    // MARK: Smart Fill

    /// Given a primary metric, returns N complementary metrics from the same cluster.
    public static func smartFill(primary: HealthMetricKind, count: Int) -> [HealthMetricKind] {
        let cluster = MetricCluster.cluster(for: primary)
        var candidates = cluster.members.filter { $0 != primary }
        if candidates.count < count {
            let extras = HealthMetricKind.allCases.filter { !candidates.contains($0) && $0 != primary }
            candidates.append(contentsOf: extras)
        }
        return Array(candidates.prefix(count))
    }

    // MARK: Build Slots

    /// Creates a MetricSlot array for a composition, assigning roles automatically.
    public static func buildSlots(
        primary: HealthMetricKind,
        composition: CompositionKind
    ) -> [MetricSlot] {
        let roles = composition.slotRoles
        let extras = smartFill(primary: primary, count: Swift.max(0, roles.count - 1))
        var metrics = [primary] + extras
        metrics = Array(metrics.prefix(roles.count))

        return zip(metrics, roles).map { metric, role in
            MetricSlot(metricKind: metric, role: role)
        }
    }

    // MARK: Privates

    private static func pickComposition(slotCount: Int, using rng: inout SeededRNG) -> CompositionKind {
        if slotCount <= 1 { return .solo }
        let pool: [CompositionKind] = slotCount <= 3
            ? [.heroSidecar, .splitPair, .ringTrio]
            : [.dashboard, .heroStrip, .journalList]
        return pool.seededRandom(using: &rng) ?? .heroSidecar
    }

    private static func weightedPalette(for metric: HealthMetricKind, using rng: inout SeededRNG) -> PaletteKind {
        let preferred: [PaletteKind] = {
            switch metric {
            case .heartRate, .restingHeartRate, .hrv:
                return [.sunset, .arcade, .graphite]
            case .sleep:
                return [.nordic, .ocean, .graphite]
            case .steps, .activeCalories, .exerciseMinutes, .flightsClimbed:
                return [.forest, .ocean, .cyber]
            case .vo2Max:
                return [.nordic, .clinical, .graphite]
            case .mindfulMinutes, .bodyWeight:
                return [.cream, .paper, .sunrise]
            default:
                return Array(PaletteKind.allCases)
            }
        }()
        let pool = rng.chance(65) ? preferred : Array(PaletteKind.allCases)
        return pool.seededRandom(using: &rng) ?? .graphite
    }

    private static func weightedChart(for metric: HealthMetricKind, using rng: inout SeededRNG) -> ChartKind {
        let preferred: [ChartKind] = {
            switch metric {
            case .steps, .activeCalories, .flightsClimbed: return [.bar, .area, .line]
            case .heartRate, .hrv, .vo2Max:         return [.line, .area]
            case .sleep:                            return [.bar, .line]
            case .exerciseMinutes, .standHours:     return [.ring, .bar]
            case .mindfulMinutes, .bodyWeight:      return [.line, .bar]
            default:                                return [.bar, .line, .area]
            }
        }()
        return rng.chance(70) ? (preferred.seededRandom(using: &rng) ?? .bar) : (ChartKind.allCases.seededRandom(using: &rng) ?? .bar)
    }

    private static func isBlocklisted(_ palette: PaletteKind, _ typography: TypographyKind) -> Bool {
        let blocklist: [(PaletteKind, TypographyKind)] = [
            (.arcade, .serif),
            (.arcade, .condensed),
            (.cyber, .serif),
            (.clinical, .condensed),
            (.paper, .mono),
        ]
        return blocklist.contains { $0.0 == palette && $0.1 == typography }
    }
}

// MARK: - Palette Color Values

public struct WidgetPalette {
    public let backgroundTop: Color
    public let backgroundBottom: Color
    public let primary: Color
    public let accent: Color
    public let muted: Color
    public let isDark: Bool

    public static func make(_ kind: PaletteKind) -> WidgetPalette {
        switch kind {
        case .graphite:
            return .dark(top: (30,32,38), bot: (14,15,18), accent: (90,200,250))
        case .noir:
            return .dark(top: (22,22,24), bot: (8,8,8), accent: (220,220,220))
        case .ocean:
            return .dark(top: (12,28,72), bot: (5,10,36), accent: (48,148,255))
        case .forest:
            return .dark(top: (12,36,20), bot: (5,15,9), accent: (48,210,72))
        case .sunset:
            return .dark(top: (42,18,10), bot: (18,7,4), accent: (255,96,64))
        case .cyber:
            return .dark(top: (8,10,14), bot: (3,4,7), accent: (0,255,180))
        case .nordic:
            return .dark(top: (18,26,44), bot: (9,13,26), accent: (110,172,255))
        case .clinical:
            return .light(top: (248,250,252), bot: (232,238,248), accent: (0,118,255))
        case .cream:
            return .light(top: (252,248,238), bot: (242,234,218), accent: (172,96,28))
        case .paper:
            return .light(top: (255,255,255), bot: (244,244,246), accent: (24,24,26))
        case .arcade:
            return .dark(top: (4,4,8), bot: (2,2,6), accent: (255,36,120))
        case .sunrise:
            return .light(top: (255,242,224), bot: (252,224,196), accent: (228,118,38))
        }
    }

    private static func dark(top: (Double,Double,Double), bot: (Double,Double,Double), accent: (Double,Double,Double)) -> WidgetPalette {
        WidgetPalette(
            backgroundTop: .rgb(top.0, top.1, top.2),
            backgroundBottom: .rgb(bot.0, bot.1, bot.2),
            primary: .white,
            accent: .rgb(accent.0, accent.1, accent.2),
            muted: Color(white: 1, opacity: 0.48),
            isDark: true
        )
    }

    private static func light(top: (Double,Double,Double), bot: (Double,Double,Double), accent: (Double,Double,Double)) -> WidgetPalette {
        WidgetPalette(
            backgroundTop: .rgb(top.0, top.1, top.2),
            backgroundBottom: .rgb(bot.0, bot.1, bot.2),
            primary: .rgb(16, 18, 22),
            accent: .rgb(accent.0, accent.1, accent.2),
            muted: Color(red: 16/255, green: 18/255, blue: 22/255, opacity: 0.44),
            isDark: false
        )
    }

    private init(backgroundTop: Color, backgroundBottom: Color, primary: Color, accent: Color, muted: Color, isDark: Bool) {
        self.backgroundTop = backgroundTop
        self.backgroundBottom = backgroundBottom
        self.primary = primary
        self.accent = accent
        self.muted = muted
        self.isDark = isDark
    }
}

// MARK: - Preset Tag

public enum PresetTag: String, CaseIterable, Identifiable, Hashable {
    case sleep   = "Sleep"
    case diet    = "Diet"
    case cardio  = "Cardio"
    case workout = "Workout"
    case heart   = "Heart"
    case mental  = "Mental"
    case steps   = "Steps"

    public var id: String { rawValue }

    public var systemSymbol: String {
        switch self {
        case .sleep:   return "moon.fill"
        case .diet:    return "fork.knife"
        case .cardio:  return "waveform.path.ecg"
        case .workout: return "figure.run"
        case .heart:   return "heart.fill"
        case .mental:  return "brain.head.profile"
        case .steps:   return "figure.walk"
        }
    }
}

// MARK: - Preset Catalog

public struct WidgetPreset: Identifiable {
    public let id: String
    public let name: String
    public let description: String
    public let style: WidgetStyle
    public let defaultMetric: HealthMetricKind
    public let tags: [PresetTag]

    public init(id: String, name: String, description: String, style: WidgetStyle, defaultMetric: HealthMetricKind, tags: [PresetTag] = []) {
        self.id = id
        self.name = name
        self.description = description
        self.style = style
        self.defaultMetric = defaultMetric
        self.tags = tags
    }
}

public extension WidgetPreset {
    static let catalog: [WidgetPreset] = [
        .init(id: "editorial",
              name: "Editorial",
              description: "Serif · dense · solo",
              style: .init(layout: .stacked, palette: .graphite, typography: .serif, chart: .line, density: .dense, accent: .none, composition: .solo),
              defaultMetric: .steps,
              tags: [.steps, .cardio]),

        .init(id: "minimal",
              name: "Minimal",
              description: "Giant number · nothing else",
              style: .init(layout: .focal, palette: .noir, typography: .sans, chart: .none, density: .minimal, accent: .none, composition: .solo),
              defaultMetric: .heartRate,
              tags: [.heart]),

        .init(id: "fitness",
              name: "Fitness",
              description: "Ring trio · activity cluster",
              style: .init(layout: .orbital, palette: .ocean, typography: .rounded, chart: .ring, density: .balanced, accent: .glow, composition: .ringTrio),
              defaultMetric: .steps,
              tags: [.steps, .cardio, .workout]),

        .init(id: "clinical",
              name: "Clinical",
              description: "Light · mono · hero + sidecar",
              style: .init(layout: .split, palette: .clinical, typography: .mono, chart: .line, density: .dense, accent: .grid, composition: .heroSidecar),
              defaultMetric: .heartRate,
              tags: [.heart]),

        .init(id: "nordic",
              name: "Nordic",
              description: "Navy · bar · solo",
              style: .init(layout: .stacked, palette: .nordic, typography: .sans, chart: .bar, density: .balanced, accent: .none, composition: .solo),
              defaultMetric: .sleep,
              tags: [.sleep]),

        .init(id: "zen",
              name: "Zen",
              description: "Warm cream · focal · solo",
              style: .init(layout: .focal, palette: .cream, typography: .serif, chart: .none, density: .minimal, accent: .blob, composition: .solo),
              defaultMetric: .mindfulMinutes,
              tags: [.mental]),

        .init(id: "dashboard",
              name: "Dashboard",
              description: "4-metric grid · dark",
              style: .init(layout: .grid, palette: .graphite, typography: .mono, chart: .bar, density: .dense, accent: .grid, composition: .dashboard),
              defaultMetric: .steps,
              tags: [.steps, .cardio, .workout, .heart]),

        .init(id: "heroStrip",
              name: "Hero + Strip",
              description: "1 hero · 3 accents below",
              style: .init(layout: .stacked, palette: .nordic, typography: .rounded, chart: .area, density: .balanced, accent: .none, composition: .heroStrip),
              defaultMetric: .activeCalories,
              tags: [.cardio, .workout]),

        .init(id: "arcade",
              name: "Arcade",
              description: "Black + neon · retro mono · split",
              style: .init(layout: .grid, palette: .arcade, typography: .mono, chart: .dots, density: .dense, accent: .glow, composition: .splitPair),
              defaultMetric: .activeCalories,
              tags: [.cardio, .workout]),

        .init(id: "cyber",
              name: "Cyber",
              description: "Neon green · area · grain",
              style: .init(layout: .stacked, palette: .cyber, typography: .mono, chart: .area, density: .balanced, accent: .grain, composition: .solo),
              defaultMetric: .vo2Max,
              tags: [.cardio, .workout]),

        .init(id: "sunset",
              name: "Sunset",
              description: "Warm dark · ring trio",
              style: .init(layout: .orbital, palette: .sunset, typography: .rounded, chart: .ring, density: .balanced, accent: .glow, composition: .ringTrio),
              defaultMetric: .activeCalories,
              tags: [.cardio, .workout]),

        .init(id: "journal",
              name: "Journal",
              description: "List view · 5 metrics",
              style: .init(layout: .split, palette: .graphite, typography: .sans, chart: .none, density: .dense, accent: .none, composition: .journalList),
              defaultMetric: .steps,
              tags: [.steps, .sleep, .diet, .mental]),

        .init(id: "activity",
              name: "Activity",
              description: "Steps · Stairs · Exercise · VO₂ Max",
              style: .init(layout: .grid, palette: .forest, typography: .rounded, chart: .bar, density: .dense, accent: .glow, composition: .dashboard),
              defaultMetric: .steps,
              tags: [.steps, .cardio, .workout]),

        .init(id: "performance",
              name: "Performance",
              description: "Steps hero · Stairs · Exercise · VO₂ Max",
              style: .init(layout: .stacked, palette: .ocean, typography: .rounded, chart: .area, density: .balanced, accent: .blob, composition: .heroStrip),
              defaultMetric: .steps,
              tags: [.cardio, .workout, .steps]),
    ]
}

// MARK: - Color Helpers

extension Color {
    static func rgb(_ r: Double, _ g: Double, _ b: Double, opacity: Double = 1) -> Color {
        Color(red: r / 255, green: g / 255, blue: b / 255, opacity: opacity)
    }
}
