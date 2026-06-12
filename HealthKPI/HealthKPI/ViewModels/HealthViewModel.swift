import SwiftUI
import Combine

// MARK: - Appearance Mode

enum AppearanceMode: String, CaseIterable, Identifiable {
    case system = "system"
    case light  = "light"
    case dark   = "dark"

    var id: String { rawValue }

    var label: String {
        switch self {
        case .system: return "System"
        case .light:  return "Light"
        case .dark:   return "Dark"
        }
    }

    var icon: String {
        switch self {
        case .system: return "circle.lefthalf.filled"
        case .light:  return "sun.max.fill"
        case .dark:   return "moon.fill"
        }
    }

    /// Nil = follow system; otherwise force the chosen scheme.
    var colorScheme: ColorScheme? {
        switch self {
        case .system: return nil
        case .light:  return .light
        case .dark:   return .dark
        }
    }
}

// MARK: - Card Display Style

enum CardStyle: String, CaseIterable, Identifiable {
    case minimal    = "minimal"
    case simplified = "simplified"
    case detailed   = "detailed"
    case stats      = "stats"
    case gauge      = "gauge"
    case bars       = "bars"
    case trend      = "trend"

    var id: String { rawValue }

    var label: String {
        switch self {
        case .minimal:    return "Minimal"
        case .simplified: return "Simplified"
        case .detailed:   return "Detailed"
        case .stats:      return "Stats"
        case .gauge:      return "Gauge"
        case .bars:       return "Bars"
        case .trend:      return "Trend"
        }
    }

    var caption: String {
        switch self {
        case .minimal:    return "Icon + bar + score"
        case .simplified: return "Icon, name, status"
        case .detailed:   return "Everything at a glance"
        case .stats:      return "Top 3 stats + mini chart"
        case .gauge:      return "Ring gauge + side stats"
        case .bars:       return "Stacked status bars"
        case .trend:      return "Big number + line chart"
        }
    }

    var icon: String {
        switch self {
        case .minimal:    return "rectangle.compress.vertical"
        case .simplified: return "rectangle.grid.1x2"
        case .detailed:   return "rectangle.stack.fill"
        case .stats:      return "chart.bar.fill"
        case .gauge:      return "gauge.with.dots.needle.67percent"
        case .bars:       return "chart.bar.doc.horizontal"
        case .trend:      return "chart.xyaxis.line"
        }
    }
}

@MainActor
final class HealthViewModel: ObservableObject {

    // MARK: - Published

    @Published var categories: [HealthCategoryItem] = []
    @Published private(set) var goodCategories: [HealthCategoryItem] = []
    @Published private(set) var attentionCategories: [HealthCategoryItem] = []
    @Published var userAge: Int = 30
    @Published var biologicalSex: String = "male" {
        didSet {
            guard oldValue != biologicalSex else { return }
            reload()
        }
    }
    @Published var userName: String = "Musaab"

    // Real HealthKit integration
    @Published var healthKit: HealthKitManager = HealthKitManager()
    @Published var isSyncingHealth: Bool = false
    @Published var lastHealthSync: Date?

    // Screen Time (FamilyControls) integration
    @Published var screenTime: ScreenTimeManager = ScreenTimeManager()
    @Published var isConnectingScreenTime: Bool = false

    // Persisted appearance mode (System / Light / Dark)
    @AppStorage("appearanceMode") private var storedAppearanceRaw: String = AppearanceMode.system.rawValue
    var appearanceMode: AppearanceMode {
        get { AppearanceMode(rawValue: storedAppearanceRaw) ?? .system }
        set {
            storedAppearanceRaw = newValue.rawValue
            objectWillChange.send()
        }
    }

    // Persisted card display style
    @AppStorage("cardStyle") private var storedCardStyleRaw: String = CardStyle.simplified.rawValue
    var cardStyle: CardStyle {
        get { CardStyle(rawValue: storedCardStyleRaw) ?? .simplified }
        set {
            storedCardStyleRaw = newValue.rawValue
            objectWillChange.send()
        }
    }

    // MARK: - Home Widgets
    //
    // Persisted as a comma-separated list of HomeWidgetKind raw values.
    // The order of `activeWidgets` is the render order on the Dashboard.
    @AppStorage("activeWidgets") private var storedActiveWidgetsRaw: String = HomeWidgetKind.summary.rawValue

    /// Temporary product toggle:
    /// keep these widgets available in "Add Widget", but don't show them
    /// on Home until we re-enable them.
    private var temporarilyHiddenWidgets: Set<HomeWidgetKind> {
        [.summary]
    }

    var activeWidgets: [HomeWidgetKind] {
        get {
            storedActiveWidgetsRaw
                .split(separator: ",")
                .compactMap { HomeWidgetKind(rawValue: String($0)) }
                .filter { !temporarilyHiddenWidgets.contains($0) }
        }
        set {
            storedActiveWidgetsRaw = newValue
                .filter { !temporarilyHiddenWidgets.contains($0) }
                .map(\.rawValue)
                .joined(separator: ",")
            objectWillChange.send()
        }
    }

    /// Widgets the user can still add (not currently pinned).
    var availableWidgets: [HomeWidgetKind] {
        let active = Set(activeWidgets)
        return HomeWidgetKind.allCases.filter { !active.contains($0) }
    }

    func addWidget(_ kind: HomeWidgetKind) {
        var next = activeWidgets
        guard !next.contains(kind) else { return }
        next.append(kind)
        activeWidgets = next
    }

    func removeWidget(_ kind: HomeWidgetKind) {
        activeWidgets = activeWidgets.filter { $0 != kind }
    }

    // MARK: - Age & Biological Age

    /// The Biological Age category, if present in the current list.
    /// Its sub-metrics mirror Morgan Levine's PhenoAge panel (9 blood
    /// biomarkers + chronological age) plus two cardiorespiratory modifiers.
    var biologicalAgeCategory: HealthCategoryItem? {
        categories.first { $0.type == .biologicalAge }
    }

    /// Score used to estimate biological age. If the Biological Age category
    /// is present, we use its score directly (driven by PhenoAge biomarkers).
    /// Otherwise we fall back to the overall health score.
    private var biologicalAgeDrivingScore: Double {
        biologicalAgeCategory?.score ?? overallScore
    }

    /// Estimated biological age derived from the PhenoAge-style score.
    /// A score of 70 is neutral (biological age == chronological age).
    /// Every point above 70 trims ~0.25 years; below 70 adds years.
    var biologicalAge: Int {
        let delta = (biologicalAgeDrivingScore - 70.0) * 0.25
        return max(18, userAge - Int(delta.rounded()))
    }

    var biologicalAgeDelta: Int { userAge - biologicalAge }

    // MARK: - Score

    var overallScore: Double {
        guard !categories.isEmpty else { return 0 }
        return categories.map(\.score).reduce(0, +) / Double(categories.count)
    }

    var overallStatus: IndicatorStatus {
        switch overallScore {
        case 85...100: return .excellent
        case 70..<85:  return .good
        case 50..<70:  return .fair
        case 30..<50:  return .poor
        default:       return .critical
        }
    }

    var overallGrade: String {
        switch overallScore {
        case 90...100: return "A+"
        case 85..<90:  return "A"
        case 80..<85:  return "A−"
        case 75..<80:  return "B+"
        case 70..<75:  return "B"
        case 65..<70:  return "C+"
        case 60..<65:  return "C"
        default:       return "D"
        }
    }

    var weakestCategory: HealthCategoryItem? {
        categories.min(by: { $0.score < $1.score })
    }

    var strongestCategory: HealthCategoryItem? {
        categories.max(by: { $0.score < $1.score })
    }

    // MARK: - Init

    init() {
        reload()
    }

    // MARK: - Methods

    /// Rebuild the full category list from the sample template and overlay
    /// any real HealthKit values already cached on the manager.
    func reload() {
        var next = HealthCategoryItem.sampleCategories(
            biologicalSex: biologicalSex,
            age: userAge
        )
        let live = healthKit.values
        if !live.isEmpty {
            for i in next.indices {
                next[i].applyLiveValues(live)
                if next[i].hasLiveData {
                    next[i].lastUpdated = "Live · Apple Health"
                }
            }
        }
        categories = next
        // Pre-compute filtered lists once per reload so views don't filter
        // on every render pass. HomeView's filter pills just read these.
        goodCategories      = next.filter { $0.score >= 70 }
        attentionCategories = next.filter { $0.score <  70 }
    }

    func toggleSex() {
        biologicalSex = biologicalSex == "male" ? "female" : "male"
    }

    // MARK: - HealthKit lifecycle

    /// Request HealthKit authorization (first-run or user-initiated from Settings)
    /// and refresh every live metric. Also syncs biological sex + age from the
    /// Health app when they're available.
    func connectHealthKit() async {
        isSyncingHealth = true
        defer { isSyncingHealth = false }

        await healthKit.requestAuthorization()

        // Pull demographics from Health if the user provided them there.
        if let sex = healthKit.biologicalSexString(), sex != biologicalSex {
            biologicalSex = sex     // didSet triggers reload()
        }
        if let age = healthKit.ageYears(), age != userAge, (10...120).contains(age) {
            userAge = age
        }

        reload()
        lastHealthSync = healthKit.lastUpdated
    }

    /// Pull-to-refresh: re-read the latest values from HealthKit without
    /// re-prompting for authorization.
    func refreshHealthKit() async {
        isSyncingHealth = true
        defer { isSyncingHealth = false }
        await healthKit.refresh()
        reload()
        lastHealthSync = healthKit.lastUpdated
    }

    // MARK: - Screen Time lifecycle

    /// Ask iOS for Screen Time (FamilyControls) authorization. Presents the
    /// system prompt the first time; re-reads status on subsequent calls.
    func connectScreenTime() async {
        isConnectingScreenTime = true
        defer { isConnectingScreenTime = false }
        await screenTime.requestAuthorization()
    }
}
