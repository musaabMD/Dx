import SwiftUI
import SwiftData
import UIKit
import StoreKit
import HealthKit
import EventKit
import CoreLocation

enum MetricType: String, Codable, CaseIterable, Identifiable {
    case steps
    case walkingDistance
    case activeCalories
    case workouts
    case sleepDuration
    case sleepConsistency
    case heartRate
    case screenTime
    case appUsage
    case appCategory
    case appBlocking
    case batteryLevel
    case chargingHabits
    case batteryHealth
    case storageFree
    case focusSessions
    case remindersCompleted
    case timeAtHome
    case timeOutside
    case batteryDrain
    case bmi
    case biologicalAge
    case noiseLevel
    case headphoneVolume

    var id: String { rawValue }

    var title: LocalizedStringKey {
        switch self {
        case .steps: "Steps"
        case .walkingDistance: "Walking distance"
        case .activeCalories: "Active calories"
        case .workouts: "Workouts"
        case .sleepDuration: "Sleep"
        case .sleepConsistency: "Sleep consistency"
        case .heartRate: "Heart rate"
        case .screenTime: "Screen time"
        case .appUsage: "App usage"
        case .appCategory: "App categories"
        case .appBlocking: "App limits"
        case .batteryLevel: "Battery charge"
        case .chargingHabits: "Charging"
        case .batteryHealth: "Battery max health"
        case .storageFree: "Storage"
        case .focusSessions: "Focus"
        case .remindersCompleted: "Reminders"
        case .timeAtHome: "Time at home"
        case .timeOutside: "Time outside"
        case .batteryDrain: "Battery drain"
        case .bmi: "BMI"
        case .biologicalAge: "Age"
        case .noiseLevel: "Noise level"
        case .headphoneVolume: "Headphone volume"
        }
    }

    var displayTitle: String {
        switch self {
        case .steps: String(localized: "Steps")
        case .walkingDistance: String(localized: "Walking distance")
        case .activeCalories: String(localized: "Active calories")
        case .workouts: String(localized: "Workouts")
        case .sleepDuration: String(localized: "Sleep")
        case .sleepConsistency: String(localized: "Sleep consistency")
        case .heartRate: String(localized: "Heart rate")
        case .screenTime: String(localized: "Screen time")
        case .appUsage: String(localized: "App usage")
        case .appCategory: String(localized: "App categories")
        case .appBlocking: String(localized: "App limits")
        case .batteryLevel: String(localized: "Battery charge")
        case .chargingHabits: String(localized: "Charging")
        case .batteryHealth: String(localized: "Battery max health")
        case .storageFree: String(localized: "Storage")
        case .focusSessions: String(localized: "Focus")
        case .remindersCompleted: String(localized: "Reminders")
        case .timeAtHome: String(localized: "Time at home")
        case .timeOutside: String(localized: "Time outside")
        case .batteryDrain: String(localized: "Battery drain")
        case .bmi: String(localized: "BMI")
        case .biologicalAge: String(localized: "Age")
        case .noiseLevel: String(localized: "Noise level")
        case .headphoneVolume: String(localized: "Headphone volume")
        }
    }

    var emoji: String {
        switch self {
        case .steps: "👟"
        case .walkingDistance: "🗺️"
        case .activeCalories: "🔥"
        case .workouts: "🏋️"
        case .sleepDuration: "🌙"
        case .sleepConsistency: "🛌"
        case .heartRate: "❤️"
        case .screenTime: "📱"
        case .appUsage: "📲"
        case .appCategory: "🧩"
        case .appBlocking: "🚫"
        case .batteryLevel: "🔋"
        case .chargingHabits: "🔌"
        case .batteryHealth: "🩺"
        case .storageFree: "💾"
        case .focusSessions: "⏱️"
        case .remindersCompleted: "✅"
        case .timeAtHome: "🏠"
        case .timeOutside: "☀️"
        case .batteryDrain: "⚡"
        case .bmi: "⚖️"
        case .biologicalAge: "🎂"
        case .noiseLevel: "🔊"
        case .headphoneVolume: "🎧"
        }
    }

    var question: String {
        switch self {
        case .steps: "Reached your step goal?"
        case .walkingDistance: "Walked enough distance?"
        case .activeCalories: "Burned active calories?"
        case .workouts: "Completed workouts?"
        case .sleepDuration: "Slept enough?"
        case .sleepConsistency: "Slept on schedule?"
        case .heartRate: "Checked your heart trend?"
        case .screenTime: "Stayed under screen time?"
        case .appUsage: "Limited selected apps?"
        case .appCategory: "Limited app categories?"
        case .appBlocking: "Block after limits?"
        case .batteryLevel: "Kept charge above target?"
        case .chargingHabits: "Charged at good times?"
        case .batteryHealth: "Checked maximum capacity?"
        case .storageFree: "Track storage usage?"
        case .focusSessions: "Finished focus time?"
        case .remindersCompleted: "Completed reminders?"
        case .timeAtHome: "Tracked time at home?"
        case .timeOutside: "Spent time outside?"
        case .batteryDrain: "Kept battery drain low?"
        case .bmi: "Tracking your BMI?"
        case .biologicalAge: "Checked your age profile?"
        case .noiseLevel: "Noise levels in check?"
        case .headphoneVolume: "Safe headphone volume?"
        }
    }

    var icon: String {
        switch self {
        case .steps: "figure.walk"
        case .walkingDistance: "map"
        case .activeCalories: "flame"
        case .workouts: "dumbbell"
        case .sleepDuration, .sleepConsistency: "moon.zzz"
        case .heartRate: "heart"
        case .screenTime, .appUsage, .appCategory, .appBlocking: "iphone"
        case .batteryLevel, .chargingHabits: "battery.75percent"
        case .batteryHealth: "battery.100percent"
        case .storageFree: "internaldrive"
        case .focusSessions: "timer"
        case .remindersCompleted: "checklist"
        case .timeAtHome: "house"
        case .timeOutside: "sun.max"
        case .batteryDrain: "bolt.fill.batteryblock"
        case .bmi: "scalemass"
        case .biologicalAge: "person.crop.circle"
        case .noiseLevel: "waveform"
        case .headphoneVolume: "headphones"
        }
    }

    var unit: String {
        switch self {
        case .steps: "steps"
        case .walkingDistance: "km"
        case .activeCalories: "kcal"
        case .workouts: "workouts"
        case .sleepDuration, .focusSessions, .screenTime, .appUsage, .appCategory, .timeAtHome, .timeOutside: "h"
        case .heartRate: "bpm"
        case .sleepConsistency, .batteryLevel, .chargingHabits, .batteryHealth, .batteryDrain: "%"
        case .storageFree: "GB"
        case .remindersCompleted: "done"
        case .appBlocking: "limits"
        case .bmi: "BMI"
        case .biologicalAge: "yrs"
        case .noiseLevel, .headphoneVolume: "dB"
        }
    }

    var source: LocalizedStringKey {
        switch self {
        case .steps, .walkingDistance, .activeCalories, .workouts, .sleepDuration, .sleepConsistency, .heartRate: "Apple Health"
        case .screenTime, .appUsage, .appCategory, .appBlocking: "Screen Time"
        case .batteryLevel, .chargingHabits, .batteryHealth, .batteryDrain: "Device"
        case .storageFree: "Device Storage"
        case .focusSessions: "Trackable Timer"
        case .remindersCompleted: "Reminders"
        case .timeAtHome, .timeOutside: "Location"
        case .bmi, .biologicalAge, .noiseLevel, .headphoneVolume: "Apple Health"
        }
    }

    var sourceTitle: String {
        switch self {
        case .steps, .walkingDistance, .activeCalories, .workouts, .sleepDuration, .sleepConsistency, .heartRate: String(localized: "Apple Health")
        case .screenTime, .appUsage, .appCategory, .appBlocking: String(localized: "Screen Time")
        case .batteryLevel, .chargingHabits, .batteryHealth, .batteryDrain: String(localized: "Device")
        case .storageFree: String(localized: "Device Storage")
        case .focusSessions: String(localized: "Trackable Timer")
        case .remindersCompleted: String(localized: "Reminders")
        case .timeAtHome, .timeOutside: String(localized: "Location")
        case .bmi, .biologicalAge, .noiseLevel, .headphoneVolume: String(localized: "Apple Health")
        }
    }

    var target: Double {
        switch self {
        case .steps: 10_000
        case .walkingDistance: 5
        case .activeCalories: 500
        case .workouts: 4
        case .sleepDuration: 8
        case .sleepConsistency: 90
        case .heartRate: 75
        case .screenTime: 3
        case .appUsage: 1
        case .appCategory: 2
        case .appBlocking: 1
        case .batteryLevel: 30
        case .chargingHabits: 85
        case .batteryHealth: 80
        case .storageFree: 80
        case .focusSessions: 2
        case .remindersCompleted: 5
        case .timeAtHome: 10
        case .timeOutside: 2
        case .batteryDrain: 20
        case .bmi: 22.0
        case .biologicalAge: 30
        case .noiseLevel: 70
        case .headphoneVolume: 70
        }
    }

    var direction: GoalDirection {
        switch self {
        case .screenTime, .appUsage, .appCategory, .storageFree, .batteryDrain, .noiseLevel, .headphoneVolume:
            .decrease
        case .batteryLevel, .sleepConsistency, .chargingHabits, .batteryHealth, .heartRate, .bmi, .biologicalAge:
            .maintain
        default:
            .increase
        }
    }

    static var selectableCases: [MetricType] {
        visibleCases.filter(\.isSelectableInCurrentBuild)
    }

    static var unavailableCases: [MetricType] {
        visibleCases.filter { !$0.isSelectableInCurrentBuild }
    }

    static var permissionCases: [MetricType] {
        visibleCases.filter { $0.isSelectableInCurrentBuild }
    }

    private static var visibleCases: [MetricType] {
        allCases.filter { $0 != .focusSessions && $0 != .timeAtHome && $0 != .timeOutside }
    }

    var isSelectableInCurrentBuild: Bool {
        switch self {
        case .screenTime, .appUsage, .appCategory, .appBlocking, .sleepConsistency, .chargingHabits, .focusSessions, .batteryHealth, .timeAtHome, .timeOutside:
            false
        default:
            true
        }
    }

    var unavailableReason: String {
        switch self {
        case .screenTime, .appUsage, .appCategory:
            String(localized: "Requires a Device Activity report extension before Trackable can show real usage values.")
        case .appBlocking:
            String(localized: "Requires the Family Controls entitlement before Trackable can block selected apps.")
        case .sleepConsistency:
            String(localized: "Removed until real sleep schedule consistency is calculated from multiple nights.")
        case .chargingHabits:
            String(localized: "Removed until charging habit history is tracked instead of the current charging state.")
        case .batteryHealth:
            String(localized: "iOS does not expose Battery Health maximum capacity or cycle count to third-party apps.")
        case .focusSessions:
            String(localized: "Removed from this build.")
        default:
            ""
        }
    }

    var permissionExplanation: String {
        switch self {
        case .steps:
            String(localized: "Reads today's step count from Apple Health.")
        case .walkingDistance:
            String(localized: "Reads today's walking and running distance from Apple Health.")
        case .activeCalories:
            String(localized: "Reads today's active energy from Apple Health.")
        case .workouts:
            String(localized: "Counts workouts recorded in Apple Health today.")
        case .sleepDuration:
            String(localized: "Reads sleep analysis from Apple Health to calculate asleep time.")
        case .heartRate:
            String(localized: "Reads your latest heart-rate sample from Apple Health.")
        case .appBlocking:
            String(localized: "Unavailable in this build because Apple Family Controls approval and a Device Activity extension are required.")
        case .batteryLevel:
            String(localized: "Shows the current battery charge percentage from your iPhone. Set a minimum charge target to avoid letting your battery run too low.")
        case .storageFree:
            String(localized: "Shows used device storage in decimal GB from the system volume.")
        case .batteryHealth:
            unavailableReason
        case .focusSessions:
            String(localized: "Uses focus sessions you start and stop inside Trackable.")
        case .remindersCompleted:
            String(localized: "Reads completed reminders from today's Reminders lists.")
        case .timeAtHome, .timeOutside:
            String(localized: "Uses your current location only when Trackable records a sample.")
        case .screenTime, .appUsage, .appCategory, .sleepConsistency, .chargingHabits:
            unavailableReason
        }
    }
}

enum SourceType: String, Codable, CaseIterable {
    case healthKit
    case screenTime
    case device
    case reminders
    case location
    case trackable
}

enum GoalPeriod: String, Codable, CaseIterable, Identifiable {
    case daily
    case weekly
    case monthly

    var id: String { rawValue }
    var title: LocalizedStringKey {
        switch self {
        case .daily: "Daily"
        case .weekly: "Weekly"
        case .monthly: "Monthly"
        }
    }

    var displayTitle: String {
        switch self {
        case .daily: String(localized: "Daily")
        case .weekly: String(localized: "Weekly")
        case .monthly: String(localized: "Monthly")
        }
    }
}

enum GoalDirection: String, Codable, CaseIterable {
    case increase
    case decrease
    case maintain
}

enum GoalStatus: String, Codable, CaseIterable {
    case great
    case notGreat
    case neutral
}

enum GoalFilter: String, CaseIterable, Identifiable {
    case all
    case great
    case notGreat
    case streaks

    var id: String { rawValue }
    var title: LocalizedStringKey {
        switch self {
        case .all: "All"
        case .great: "Great"
        case .notGreat: "Not Great"
        case .streaks: "Streaks"
        }
    }
}

@Model
final class UserProfile {
    var id: UUID = UUID()
    var createdAt: Date = Date()
    var preferredLanguage: String = "en"
    var isPro: Bool = false
    var activePlan: String = "free"
    var onboardingCompleted: Bool = false
    var maxFreeGoals: Int = 100
    var homeLatitude: Double?
    var homeLongitude: Double?
    init(id: UUID = UUID(), createdAt: Date = .now, preferredLanguage: String = Locale.current.language.languageCode?.identifier ?? "en", isPro: Bool = false, activePlan: String = "free", onboardingCompleted: Bool = false, maxFreeGoals: Int = 100, homeLatitude: Double? = nil, homeLongitude: Double? = nil) {
        self.id = id
        self.createdAt = createdAt
        self.preferredLanguage = preferredLanguage
        self.isPro = isPro
        self.activePlan = activePlan
        self.onboardingCompleted = onboardingCompleted
        self.maxFreeGoals = maxFreeGoals
        self.homeLatitude = homeLatitude
        self.homeLongitude = homeLongitude
    }
}

@Model
final class Goal {
    var id: UUID = UUID()
    var title: String = ""
    var metricTypeRaw: String = MetricType.steps.rawValue
    var sourceTypeRaw: String = SourceType.trackable.rawValue
    var targetValue: Double = 0
    var currentValue: Double = 0
    var unit: String = ""
    var periodRaw: String = GoalPeriod.daily.rawValue
    var goalDirectionRaw: String = GoalDirection.increase.rawValue
    var isStreakGoal: Bool = false
    var streakCount: Int = 0
    var sortOrder: Int = 0
    var createdAt: Date = Date()
    var updatedAt: Date = Date()
    var isArchived: Bool = false

    var metricType: MetricType {
        get { MetricType(rawValue: metricTypeRaw) ?? .steps }
        set { metricTypeRaw = newValue.rawValue }
    }

    var sourceType: SourceType {
        get { SourceType(rawValue: sourceTypeRaw) ?? .trackable }
        set { sourceTypeRaw = newValue.rawValue }
    }

    var period: GoalPeriod {
        get { GoalPeriod(rawValue: periodRaw) ?? .daily }
        set { periodRaw = newValue.rawValue }
    }

    var goalDirection: GoalDirection {
        get { GoalDirection(rawValue: goalDirectionRaw) ?? .increase }
        set { goalDirectionRaw = newValue.rawValue }
    }

    init(id: UUID = UUID(), title: String, metricType: MetricType, sourceType: SourceType, targetValue: Double, currentValue: Double = 0, unit: String, period: GoalPeriod = .daily, goalDirection: GoalDirection, isStreakGoal: Bool = false, streakCount: Int = 0, sortOrder: Int = 0, createdAt: Date = .now, updatedAt: Date = .now, isArchived: Bool = false) {
        self.id = id
        self.title = title
        self.metricTypeRaw = metricType.rawValue
        self.sourceTypeRaw = sourceType.rawValue
        self.targetValue = targetValue
        self.currentValue = currentValue
        self.unit = unit
        self.periodRaw = period.rawValue
        self.goalDirectionRaw = goalDirection.rawValue
        self.isStreakGoal = isStreakGoal
        self.streakCount = streakCount
        self.sortOrder = sortOrder
        self.createdAt = createdAt
        self.updatedAt = updatedAt
        self.isArchived = isArchived
    }
}

@Model
final class GoalSnapshot {
    var id: UUID = UUID()
    var goalID: UUID = UUID()
    var date: Date = Date()
    var value: Double = 0
    var targetValue: Double = 0
    var progress: Double = 0
    var statusRaw: String = GoalStatus.neutral.rawValue

    var status: GoalStatus {
        get { GoalStatus(rawValue: statusRaw) ?? .neutral }
        set { statusRaw = newValue.rawValue }
    }

    init(id: UUID = UUID(), goalID: UUID, date: Date = .now, value: Double, targetValue: Double, progress: Double, status: GoalStatus) {
        self.id = id
        self.goalID = goalID
        self.date = date
        self.value = value
        self.targetValue = targetValue
        self.progress = progress
        self.statusRaw = status.rawValue
    }
}

@Model
final class WidgetConfig {
    var id: UUID = UUID()
    var widgetType: String = ""
    var goalIDsRaw: String = ""
    var displayMode: String = "progress"
    var sortOrder: Int = 0

    var goalIDs: [UUID] {
        get {
            goalIDsRaw
                .split(separator: ",")
                .compactMap { UUID(uuidString: String($0)) }
        }
        set {
            goalIDsRaw = newValue.map(\.uuidString).joined(separator: ",")
        }
    }

    init(id: UUID = UUID(), widgetType: String, goalIDs: [UUID] = [], displayMode: String = "progress", sortOrder: Int = 0) {
        self.id = id
        self.widgetType = widgetType
        self.goalIDsRaw = goalIDs.map(\.uuidString).joined(separator: ",")
        self.displayMode = displayMode
        self.sortOrder = sortOrder
    }
}

@Model
final class SubscriptionState {
    var id: UUID = UUID()
    var isPro: Bool = false
    var productID: String?
    var expirationDate: Date?
    var isLifetime: Bool = false
    var lastVerifiedAt: Date = Date()

    init(id: UUID = UUID(), isPro: Bool = false, productID: String? = nil, expirationDate: Date? = nil, isLifetime: Bool = false, lastVerifiedAt: Date = .now) {
        self.id = id
        self.isPro = isPro
        self.productID = productID
        self.expirationDate = expirationDate
        self.isLifetime = isLifetime
        self.lastVerifiedAt = lastVerifiedAt
    }
}

@Model
final class FocusSession {
    var id: UUID = UUID()
    var startedAt: Date = Date()
    var endedAt: Date?

    init(id: UUID = UUID(), startedAt: Date = .now, endedAt: Date? = nil) {
        self.id = id
        self.startedAt = startedAt
        self.endedAt = endedAt
    }

    func durationSeconds(until date: Date = .now) -> TimeInterval {
        max((endedAt ?? date).timeIntervalSince(startedAt), 0)
    }
}

@Model
final class LocationActivitySample {
    var id: UUID = UUID()
    var recordedAt: Date = Date()
    var latitude: Double = 0
    var longitude: Double = 0
    var isAtHome: Bool = false

    init(id: UUID = UUID(), recordedAt: Date = .now, latitude: Double, longitude: Double, isAtHome: Bool) {
        self.id = id
        self.recordedAt = recordedAt
        self.latitude = latitude
        self.longitude = longitude
        self.isAtHome = isAtHome
    }
}

@MainActor
@Observable
final class AppStoreModel {
    static let productIDs = [
        "trackable.pro.weekly",
        "trackable.pro.monthly",
        "trackable.pro.yearly",
        "trackable.pro.lifetime"
    ]

    var products: [Product] = []
    var isPro = false
    var activeProductID: String?
    var activeExpirationDate: Date?
    var isLifetime = false
    var purchaseError: String?
    var isLoadingProducts = false
    var isPurchasing = false
    @ObservationIgnored private var transactionUpdatesTask: Task<Void, Never>?

    init() {
        transactionUpdatesTask = Task {
            for await update in Transaction.updates {
                guard case .verified(let transaction) = update else { continue }
                await transaction.finish()
                await refreshEntitlements()
            }
        }
    }

    deinit {
        transactionUpdatesTask?.cancel()
    }

    func loadProducts() async {
        guard !isLoadingProducts else { return }
        isLoadingProducts = true
        defer { isLoadingProducts = false }

        do {
            products = try await Product.products(for: Self.productIDs).sorted { lhs, rhs in
                Self.productIDs.firstIndex(of: lhs.id) ?? 0 < Self.productIDs.firstIndex(of: rhs.id) ?? 0
            }
            purchaseError = products.isEmpty ? String(localized: "Subscriptions are not available right now. Check the StoreKit products in App Store Connect.") : nil
        } catch {
            purchaseError = error.localizedDescription
        }
    }

    func refreshEntitlements() async {
        var foundPro = false
        var foundProduct: String?
        var foundExpiration: Date?
        var foundLifetime = false

        for await result in Transaction.currentEntitlements {
            guard case .verified(let transaction) = result else { continue }
            if Self.productIDs.contains(transaction.productID) {
                foundPro = true
                foundProduct = transaction.productID
                foundExpiration = transaction.expirationDate
                foundLifetime = transaction.productID == "trackable.pro.lifetime"
            }
        }

        isPro = foundPro
        activeProductID = foundProduct
        activeExpirationDate = foundExpiration
        isLifetime = foundLifetime
    }

    @discardableResult
    func purchase(_ product: Product) async -> Bool {
        isPurchasing = true
        purchaseError = nil
        defer { isPurchasing = false }

        do {
            let result = try await product.purchase()
            switch result {
            case .success(let verification):
                guard case .verified(let transaction) = verification else {
                    purchaseError = String(localized: "Apple could not verify this purchase.")
                    return false
                }
                await transaction.finish()
                await refreshEntitlements()
                return isPro
            case .pending:
                purchaseError = String(localized: "Purchase is pending approval.")
                return false
            case .userCancelled:
                return false
            @unknown default:
                purchaseError = String(localized: "Purchase could not be completed.")
                return false
            }
        } catch {
            purchaseError = error.localizedDescription
            return false
        }
    }

    func restore() async {
        do {
            try await AppStore.sync()
            await refreshEntitlements()
        } catch {
            purchaseError = error.localizedDescription
        }
    }
}

@Observable
final class DeviceDataProvider {
    private let healthStore = HKHealthStore()
    private let eventStore = EKEventStore()
    private let locationManager = CLLocationManager()
    @ObservationIgnored private let locationReader = LocationReader()

    var healthAuthorized = false
    var remindersAuthorized = false
    var locationAuthorized = false
    var lastPermissionMessage: String?

    func requestPermissions(for metrics: [MetricType]) async {
        let uniqueMetrics = Array(Set(metrics))

        if uniqueMetrics.contains(where: { $0 == .remindersCompleted }) {
            await requestPermission(for: .remindersCompleted)
        }

        await requestHealthAccess(for: uniqueMetrics)
    }

    func currentValue(for metric: MetricType) async -> Double? {
        switch metric {
        case .batteryLevel:
            return await MainActor.run {
                UIDevice.current.isBatteryMonitoringEnabled = true
                let battery = UIDevice.current.batteryLevel
                guard battery >= 0 else {
                    lastPermissionMessage = String(localized: "Battery level is unavailable on this device.")
                    return nil
                }
                return Double(battery * 100)
            }
        case .storageFree:
            return usedSpaceOnSystemVolumeGB()
        case .steps:
            return await healthQuantity(.stepCount, unit: .count())
        case .walkingDistance:
            return await healthQuantity(.distanceWalkingRunning, unit: .meterUnit(with: .kilo))
        case .activeCalories:
            return await healthQuantity(.activeEnergyBurned, unit: .kilocalorie())
        case .sleepDuration:
            return await sleepHours()
        case .workouts:
            return await workoutCount()
        case .screenTime, .appUsage, .appCategory:
            lastPermissionMessage = metric.unavailableReason
            return nil
        case .chargingHabits:
            return await MainActor.run {
                UIDevice.current.isBatteryMonitoringEnabled = true
                guard UIDevice.current.batteryState != .unknown else {
                    lastPermissionMessage = String(localized: "Charging state is unavailable on this device.")
                    return nil
                }
                return UIDevice.current.batteryState == .charging || UIDevice.current.batteryState == .full ? 100 : 0
            }
        case .batteryHealth:
            lastPermissionMessage = metric.unavailableReason
            return nil
        case .focusSessions:
            lastPermissionMessage = String(localized: "Focus sessions are calculated from Trackable timer records.")
            return nil
        case .remindersCompleted:
            return await completedReminderCount()
        case .timeOutside:
            lastPermissionMessage = String(localized: "Location time is calculated from saved location samples.")
            return nil
        case .timeAtHome:
            lastPermissionMessage = String(localized: "Location time is calculated from saved location samples.")
            return nil
        case .sleepConsistency:
            lastPermissionMessage = metric.unavailableReason
            return nil
        case .heartRate:
            return await latestHealthQuantity(.heartRate, unit: HKUnit.count().unitDivided(by: .minute()))
        case .appBlocking:
            lastPermissionMessage = String(localized: "App blocking status is calculated from Settings.")
            return nil
        }
    }

    func requestPermission(for metric: MetricType) async {
        switch metric {
        case .steps, .walkingDistance, .activeCalories, .workouts, .sleepDuration, .sleepConsistency, .heartRate:
            await requestHealthAccess(for: metric)
        case .screenTime, .appUsage, .appCategory, .appBlocking, .batteryHealth:
            lastPermissionMessage = metric.unavailableReason
        case .remindersCompleted:
            do {
                remindersAuthorized = try await eventStore.requestFullAccessToReminders()
                lastPermissionMessage = remindersAuthorized ? nil : String(localized: "Reminders permission was denied.")
            } catch {
                remindersAuthorized = false
                lastPermissionMessage = String(localized: "Reminders access is unavailable.")
            }
        case .timeAtHome, .timeOutside:
            locationManager.requestWhenInUseAuthorization()
            let status = locationManager.authorizationStatus
            locationAuthorized = status == .authorizedWhenInUse || status == .authorizedAlways
            lastPermissionMessage = locationAuthorized ? nil : String(localized: "Location permission is needed before Trackable can record location samples.")
        default:
            break
        }
    }

    func currentCoordinate() async -> CLLocationCoordinate2D? {
        locationAuthorized = await MainActor.run {
            let status = locationManager.authorizationStatus
            return status == .authorizedWhenInUse || status == .authorizedAlways
        }
        return await locationReader.currentCoordinate()
    }

    private func requestHealthAccess(for metric: MetricType) async {
        await requestHealthAccess(for: [metric])
    }

    private func requestHealthAccess(for metrics: [MetricType]) async {
        let types = Set(metrics.flatMap { healthTypes(for: $0) })
        await synchronizeHealthAuthorization(for: types)
    }

    /// Requests Health access on the main thread when needed, then updates `healthAuthorized` / `lastPermissionMessage`.
    private func synchronizeHealthAuthorization(for types: Set<HKObjectType>) async {
        guard !types.isEmpty else { return }
        guard HKHealthStore.isHealthDataAvailable() else {
            await MainActor.run {
                healthAuthorized = false
                lastPermissionMessage = String(localized: "Health data is unavailable on this device.")
            }
            return
        }
        guard let shareUsage = Bundle.main.object(forInfoDictionaryKey: "NSHealthShareUsageDescription") as? String,
              !shareUsage.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty else {
            await MainActor.run {
                healthAuthorized = false
                lastPermissionMessage = String(localized: "Apple Health is unavailable in this build.")
            }
            return
        }

        let needsPrompt = types.contains { healthStore.authorizationStatus(for: $0) == .notDetermined }
        if needsPrompt {
            do {
                try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
                    Task { @MainActor in
                        do {
                            try await healthStore.requestAuthorization(toShare: [], read: types)
                            continuation.resume()
                        } catch {
                            continuation.resume(throwing: error)
                        }
                    }
                }
            } catch {
                await MainActor.run {
                    healthAuthorized = false
                    lastPermissionMessage = String(localized: "Health access is unavailable: \(error.localizedDescription)")
                }
                return
            }
        }

        // Read-only access: types often stay `.notDetermined` even after the user allows reading.
        // Treat explicit denial only; otherwise allow queries to run.
        let allDenied = types.allSatisfy { healthStore.authorizationStatus(for: $0) == .sharingDenied }
        await MainActor.run {
            healthAuthorized = !allDenied
            if allDenied {
                lastPermissionMessage = String(localized: "Health access is off for Trackable. Turn it on in Settings → Privacy & Security → Health → Trackable.")
            } else {
                lastPermissionMessage = nil
            }
        }
    }

    private func healthTypes(for metric: MetricType) -> Set<HKObjectType> {
        switch metric {
        case .steps:
            return [HKQuantityType(.stepCount)]
        case .walkingDistance:
            return [HKQuantityType(.distanceWalkingRunning)]
        case .activeCalories:
            return [HKQuantityType(.activeEnergyBurned)]
        case .workouts:
            return [HKObjectType.workoutType()]
        case .sleepDuration, .sleepConsistency:
            return [HKCategoryType(.sleepAnalysis)]
        case .heartRate:
            return [HKQuantityType(.heartRate)]
        default:
            return []
        }
    }

    private func usedSpaceOnSystemVolumeGB() -> Double? {
        let candidateURLs = [
            URL(fileURLWithPath: NSHomeDirectory(), isDirectory: true),
            URL(fileURLWithPath: "/System/Volumes/Data", isDirectory: true)
        ]

        let keys: Set<URLResourceKey> = [
            .volumeTotalCapacityKey,
            .volumeAvailableCapacityKey,
            .volumeAvailableCapacityForOpportunisticUsageKey,
            .volumeAvailableCapacityForImportantUsageKey
        ]

        for url in candidateURLs where FileManager.default.fileExists(atPath: url.path) {
            guard let values = try? url.resourceValues(forKeys: keys) else { continue }
            guard let total = values.volumeTotalCapacity.map(Int64.init) else { continue }
            let available = values.volumeAvailableCapacity.map(Int64.init)
                ?? values.volumeAvailableCapacityForImportantUsage
                ?? values.volumeAvailableCapacityForOpportunisticUsage

            if let available {
                let used = max(total - available, 0)
                return Double(used) / 1_000_000_000.0
            }
        }

        lastPermissionMessage = String(localized: "Storage capacity is unavailable right now.")
        return nil
    }

    private func isHealthAccessDenied(for type: HKObjectType) -> Bool {
        healthStore.authorizationStatus(for: type) == .sharingDenied
    }

    private func healthQuantity(_ identifier: HKQuantityTypeIdentifier, unit: HKUnit) async -> Double? {
        guard HKHealthStore.isHealthDataAvailable() else {
            lastPermissionMessage = String(localized: "Health data is unavailable on this device.")
            return nil
        }
        let type = HKQuantityType(identifier)
        await synchronizeHealthAuthorization(for: [type])
        guard !isHealthAccessDenied(for: type) else {
            return nil
        }
        let start = Calendar.current.startOfDay(for: .now)
        let predicate = HKQuery.predicateForSamples(withStart: start, end: .now)

        return await withCheckedContinuation { continuation in
            let query = HKStatisticsQuery(quantityType: type, quantitySamplePredicate: predicate, options: .cumulativeSum) { [weak self] _, statistics, error in
                if error != nil {
                    Task { @MainActor [weak self] in self?.healthAuthorized = false }
                    continuation.resume(returning: nil)
                    return
                }
                continuation.resume(returning: statistics?.sumQuantity()?.doubleValue(for: unit) ?? 0)
            }
            healthStore.execute(query)
        }
    }

    private func latestHealthQuantity(_ identifier: HKQuantityTypeIdentifier, unit: HKUnit) async -> Double? {
        guard HKHealthStore.isHealthDataAvailable() else {
            lastPermissionMessage = String(localized: "Health data is unavailable on this device.")
            return nil
        }
        let type = HKQuantityType(identifier)
        await synchronizeHealthAuthorization(for: [type])
        guard !isHealthAccessDenied(for: type) else {
            return nil
        }
        let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)

        return await withCheckedContinuation { continuation in
            let query = HKSampleQuery(sampleType: type, predicate: nil, limit: 1, sortDescriptors: [sort]) { _, samples, error in
                guard error == nil else {
                    continuation.resume(returning: nil)
                    return
                }
                guard let sample = samples?.first as? HKQuantitySample else {
                    continuation.resume(returning: nil)
                    return
                }
                continuation.resume(returning: sample.quantity.doubleValue(for: unit))
            }
            healthStore.execute(query)
        }
    }

    private func workoutCount() async -> Double? {
        guard HKHealthStore.isHealthDataAvailable() else {
            lastPermissionMessage = String(localized: "Health data is unavailable on this device.")
            return nil
        }
        let workoutType = HKObjectType.workoutType()
        await synchronizeHealthAuthorization(for: [workoutType])
        guard !isHealthAccessDenied(for: workoutType) else {
            return nil
        }
        let start = Calendar.current.startOfDay(for: .now)
        let predicate = HKQuery.predicateForSamples(withStart: start, end: .now)

        return await withCheckedContinuation { continuation in
            let query = HKSampleQuery(sampleType: HKObjectType.workoutType(), predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, error in
                guard error == nil else {
                    continuation.resume(returning: nil)
                    return
                }
                continuation.resume(returning: Double(samples?.count ?? 0))
            }
            healthStore.execute(query)
        }
    }

    private func sleepHours() async -> Double? {
        guard HKHealthStore.isHealthDataAvailable() else {
            lastPermissionMessage = String(localized: "Health data is unavailable on this device.")
            return nil
        }
        let sleepType = HKCategoryType(.sleepAnalysis)
        await synchronizeHealthAuthorization(for: [sleepType])
        guard !isHealthAccessDenied(for: sleepType) else {
            return nil
        }
        let now = Date()
        let start = Calendar.current.date(byAdding: .hour, value: -18, to: now) ?? Calendar.current.startOfDay(for: now)
        let predicate = HKQuery.predicateForSamples(withStart: start, end: now)

        return await withCheckedContinuation { continuation in
            let query = HKSampleQuery(sampleType: sleepType, predicate: predicate, limit: HKObjectQueryNoLimit, sortDescriptors: nil) { _, samples, error in
                guard error == nil else {
                    continuation.resume(returning: nil)
                    return
                }
                let asleepValues = [
                    HKCategoryValueSleepAnalysis.asleepCore.rawValue,
                    HKCategoryValueSleepAnalysis.asleepDeep.rawValue,
                    HKCategoryValueSleepAnalysis.asleepREM.rawValue,
                    HKCategoryValueSleepAnalysis.asleepUnspecified.rawValue
                ]
                let asleepSamples = samples?
                    .compactMap { $0 as? HKCategorySample }
                    .filter { asleepValues.contains($0.value) } ?? []
                guard !asleepSamples.isEmpty else {
                    continuation.resume(returning: nil)
                    return
                }
                let seconds = asleepSamples
                    .reduce(0) { total, sample in
                        let boundedStart = max(sample.startDate, start)
                        let boundedEnd = min(sample.endDate, now)
                        return total + max(boundedEnd.timeIntervalSince(boundedStart), 0)
                    }
                continuation.resume(returning: seconds / 3_600)
            }
            healthStore.execute(query)
        }
    }

    private func completedReminderCount() async -> Double? {
        guard remindersAuthorized else {
            lastPermissionMessage = String(localized: "Reminders permission is needed before completed reminders can be counted.")
            return nil
        }
        let calendars = eventStore.calendars(for: .reminder)
        let start = Calendar.current.startOfDay(for: .now)
        let predicate = eventStore.predicateForCompletedReminders(withCompletionDateStarting: start, ending: .now, calendars: calendars)

        return await withCheckedContinuation { continuation in
            eventStore.fetchReminders(matching: predicate) { reminders in
                continuation.resume(returning: Double(reminders?.count ?? 0))
            }
        }
    }
}

@MainActor
final class LocationReader: NSObject, CLLocationManagerDelegate {
    private let manager = CLLocationManager()
    private var continuation: CheckedContinuation<CLLocationCoordinate2D?, Never>?

    override init() {
        super.init()
        manager.delegate = self
        manager.desiredAccuracy = kCLLocationAccuracyHundredMeters
    }

    func currentCoordinate() async -> CLLocationCoordinate2D? {
        let status = manager.authorizationStatus
        guard status == .authorizedWhenInUse || status == .authorizedAlways else {
            manager.requestWhenInUseAuthorization()
            return nil
        }

        if let coordinate = manager.location?.coordinate {
            return coordinate
        }

        return await withCheckedContinuation { continuation in
            self.continuation = continuation
            manager.requestLocation()
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didUpdateLocations locations: [CLLocation]) {
        Task { @MainActor in
            continuation?.resume(returning: locations.last?.coordinate)
            continuation = nil
        }
    }

    nonisolated func locationManager(_ manager: CLLocationManager, didFailWithError error: Error) {
        Task { @MainActor in
            continuation?.resume(returning: nil)
            continuation = nil
        }
    }
}

struct ContentView: View {
    @Environment(\.scenePhase) private var scenePhase
    @Environment(\.modelContext) private var modelContext
    @Query private var profiles: [UserProfile]
    @Query private var subscriptions: [SubscriptionState]
    @Query(sort: \Goal.sortOrder) private var allGoals: [Goal]
    @Query(sort: \FocusSession.startedAt) private var focusSessions: [FocusSession]
    @Query(sort: \LocationActivitySample.recordedAt) private var locationSamples: [LocationActivitySample]
    @State private var store = AppStoreModel()
    @State private var dataProvider = DeviceDataProvider()

    private var profile: UserProfile? { profiles.first }

    var body: some View {
        Group {
            if profile?.onboardingCompleted == true {
                HomeView(store: store, dataProvider: dataProvider) {
                    await requestAccessForSupportedMetrics()
                    await refreshGoalValues()
                }
            } else {
                OnboardingView(store: store) {
                    completeOnboarding()
                }
            }
        }
        .task {
            seedProfileIfNeeded()
            seedSupportedGoalsForTestingIfNeeded()
            normalizeGoalMetadataIfNeeded()
            archiveUnsupportedGoalsIfNeeded()
            await store.loadProducts()
            await store.refreshEntitlements()
            syncSubscriptionCache()
            if profiles.first?.onboardingCompleted == true {
                await requestAccessForSupportedMetrics()
                await refreshGoalValues()
            }
        }
        .onChange(of: profile?.onboardingCompleted) { _, completed in
            guard completed == true else { return }
            Task {
                await requestAccessForSupportedMetrics()
                await refreshGoalValues()
            }
        }
        .onChange(of: scenePhase) { _, phase in
            guard phase == .active, profile?.onboardingCompleted == true else { return }
            Task {
                await requestAccessForSupportedMetrics()
                await refreshGoalValues()
            }
        }
        .onChange(of: store.isPro) { _, _ in
            syncSubscriptionCache()
        }
        .onChange(of: store.activeProductID) { _, _ in
            syncSubscriptionCache()
        }
        .onChange(of: store.activeExpirationDate) { _, _ in
            syncSubscriptionCache()
        }
    }

    private func seedProfileIfNeeded() {
        guard profiles.isEmpty else { return }
        modelContext.insert(UserProfile())
    }

    private func completeOnboarding() {
        seedProfileIfNeeded()
        profile?.onboardingCompleted = true
        try? modelContext.save()
        Task {
            await requestAccessForSupportedMetrics()
            await refreshGoalValues()
        }
    }

    private func syncSubscriptionCache() {
        profile?.isPro = store.isPro
        profile?.activePlan = store.activeProductID ?? "free"

        let state = subscriptions.first ?? SubscriptionState()
        if subscriptions.isEmpty {
            modelContext.insert(state)
        }
        state.isPro = store.isPro
        state.productID = store.activeProductID
        state.expirationDate = store.activeExpirationDate
        state.isLifetime = store.isLifetime
        state.lastVerifiedAt = .now

        try? modelContext.save()
    }

    private func seedSupportedGoalsForTestingIfNeeded() {
        let seeds: [MetricType] = [
            .steps,
            .walkingDistance,
            .activeCalories,
            .workouts,
            .sleepDuration,
            .heartRate,
            .batteryLevel,
            .storageFree,
            .remindersCompleted,
        ]
        var nextSortOrder = (allGoals.map(\.sortOrder).max() ?? -1) + 1
        var changed = false

        for metric in seeds {
            if let existing = allGoals.first(where: { $0.metricType == metric }) {
                if existing.isArchived {
                    existing.isArchived = false
                    existing.updatedAt = .now
                    changed = true
                }
                continue
            }

            modelContext.insert(Goal(title: metric.displayTitle, metricType: metric, sourceType: metric.sourceType, targetValue: metric.target, currentValue: 0, unit: metric.unit, goalDirection: metric.direction, isStreakGoal: metric == .steps, streakCount: 0, sortOrder: nextSortOrder))
            nextSortOrder += 1
            changed = true
        }

        if changed {
            try? modelContext.save()
        }
    }

    private func normalizeGoalMetadataIfNeeded() {
        var changed = false

        for goal in allGoals {
            var goalChanged = false
            switch goal.metricType {
            case .storageFree:
                if goal.title == String(localized: "Free storage") || goal.title != MetricType.storageFree.displayTitle {
                    goal.title = MetricType.storageFree.displayTitle
                    goalChanged = true
                }
                if goal.goalDirection != MetricType.storageFree.direction {
                    goal.goalDirection = MetricType.storageFree.direction
                    goalChanged = true
                }
                if goal.targetValue == 10 {
                    goal.targetValue = MetricType.storageFree.target
                    goalChanged = true
                }
                if goal.unit != MetricType.storageFree.unit {
                    goal.unit = MetricType.storageFree.unit
                    goalChanged = true
                }
            case .batteryHealth:
                if goal.title != MetricType.batteryHealth.displayTitle {
                    goal.title = MetricType.batteryHealth.displayTitle
                    goalChanged = true
                }
            default:
                break
            }

            if goalChanged {
                goal.updatedAt = .now
                changed = true
            }
        }

        if changed {
            try? modelContext.save()
        }
    }

    private func archiveUnsupportedGoalsIfNeeded() {
        var changed = false
        for goal in allGoals where !goal.isArchived && !goal.metricType.isSelectableInCurrentBuild {
            goal.isArchived = true
            goal.updatedAt = .now
            changed = true
        }
        if changed {
            try? modelContext.save()
        }
    }

    private func requestAccessForActiveGoals() async {
        let metrics = allGoals
            .filter { !$0.isArchived && $0.metricType.isSelectableInCurrentBuild }
            .map(\.metricType)
        await dataProvider.requestPermissions(for: metrics)
    }

    private func requestAccessForSupportedMetrics() async {
        await dataProvider.requestPermissions(for: MetricType.permissionCases)
    }

    private func refreshGoalValues() async {
        if allGoals.contains(where: { !$0.isArchived && ($0.metricType == .timeAtHome || $0.metricType == .timeOutside) }) {
            await recordLocationSampleIfPossible()
        }

        for goal in allGoals where !goal.isArchived {
            switch goal.metricType {
            case .focusSessions:
                goal.currentValue = Self.focusHoursToday(from: focusSessions)
            case .timeAtHome:
                goal.currentValue = Self.locationHoursToday(from: locationSamples, isAtHome: true)
            case .timeOutside:
                goal.currentValue = Self.locationHoursToday(from: locationSamples, isAtHome: false)
            default:
                if let value = await dataProvider.currentValue(for: goal.metricType) {
                    goal.currentValue = value
                }
            }
            goal.updatedAt = .now
        }
        try? modelContext.save()
    }

    private func recordLocationSampleIfPossible() async {
        guard let profile, let homeLatitude = profile.homeLatitude, let homeLongitude = profile.homeLongitude else { return }
        guard let coordinate = await dataProvider.currentCoordinate() else { return }
        let home = CLLocation(latitude: homeLatitude, longitude: homeLongitude)
        let current = CLLocation(latitude: coordinate.latitude, longitude: coordinate.longitude)
        let isAtHome = current.distance(from: home) <= 150
        modelContext.insert(LocationActivitySample(latitude: coordinate.latitude, longitude: coordinate.longitude, isAtHome: isAtHome))
    }

    static func focusHoursToday(from sessions: [FocusSession], now: Date = .now) -> Double {
        let start = Calendar.current.startOfDay(for: now)
        let seconds = sessions.reduce(0) { total, session in
            let end = session.endedAt ?? now
            guard end > start else { return total }
            let boundedStart = max(session.startedAt, start)
            return total + max(end.timeIntervalSince(boundedStart), 0)
        }
        return seconds / 3_600
    }

    static func locationHoursToday(from samples: [LocationActivitySample], isAtHome: Bool, now: Date = .now) -> Double {
        let start = Calendar.current.startOfDay(for: now)
        let sorted = samples
            .filter { $0.recordedAt >= start }
            .sorted { $0.recordedAt < $1.recordedAt }
        guard let first = sorted.first else { return 0 }

        var seconds: TimeInterval = 0
        for pair in zip(sorted, sorted.dropFirst()) where pair.0.isAtHome == isAtHome {
            seconds += min(max(pair.1.recordedAt.timeIntervalSince(pair.0.recordedAt), 0), 30 * 60)
        }

        if sorted.count == 1, first.isAtHome == isAtHome {
            seconds += min(max(now.timeIntervalSince(first.recordedAt), 0), 30 * 60)
        } else if let last = sorted.last, last.isAtHome == isAtHome {
            seconds += min(max(now.timeIntervalSince(last.recordedAt), 0), 30 * 60)
        }

        return seconds / 3_600
    }
}

private extension MetricType {
    var canBeAddedInCurrentBuild: Bool {
        isSelectableInCurrentBuild
    }

    var sourceType: SourceType {
        switch self {
        case .steps, .walkingDistance, .activeCalories, .workouts, .sleepDuration, .sleepConsistency, .heartRate: .healthKit
        case .screenTime, .appUsage, .appCategory, .appBlocking: .screenTime
        case .batteryLevel, .chargingHabits, .batteryHealth, .storageFree: .device
        case .remindersCompleted: .reminders
        case .timeAtHome, .timeOutside: .location
        case .focusSessions: .trackable
        }
    }
}

private extension String {
    var titleized: String {
        replacingOccurrences(of: "([a-z])([A-Z])", with: "$1 $2", options: .regularExpression)
            .capitalized
    }
}

struct OnboardingView: View {
    let store: AppStoreModel
    let onComplete: () -> Void
    @State private var page = 0

    var body: some View {
        ZStack {
            TrackableTheme.background.ignoresSafeArea()
            TabView(selection: $page) {
                BenefitsOnboardingPage(page: $page).tag(0)
                TracksOnboardingPage(page: $page).tag(1)
                PrivacyOnboardingPage(onComplete: onComplete).tag(2)
            }
            .tabViewStyle(.page(indexDisplayMode: .always))
        }
    }
}

struct BenefitsOnboardingPage: View {
    @Binding var page: Int
    private let benefits: [(String, LocalizedStringKey, LocalizedStringKey)] = [
        ("target", "Automatic goal tracking", "Build goals from Health, reminders, location, storage, and device signals."),
        ("chart.line.uptrend.xyaxis", "Know what changed", "See progress, streaks, and summaries without setting up a spreadsheet."),
        ("lock", "Private by default", "No account required. Your progress stays on this iPhone.")
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 22) {
            Spacer(minLength: 16)
            VStack(alignment: .leading, spacing: 10) {
                Text("Trackable turns your iPhone into a personal progress system.")
                    .font(.system(.largeTitle, design: .rounded, weight: .bold))
                    .foregroundStyle(TrackableTheme.ink)
                    .lineSpacing(2)
                Text("Choose what matters, then let the app keep score quietly.")
                    .font(.body.weight(.medium))
                    .foregroundStyle(TrackableTheme.secondaryInk)
            }

            VStack(spacing: 10) {
                ForEach(benefits, id: \.0) { item in
                    OnboardingBenefitRow(icon: item.0, title: item.1, subtitle: item.2)
                }
            }

            Spacer()
            PrimaryButton(title: "Continue", icon: "arrow.right") {
                withAnimation(.spring(response: 0.45, dampingFraction: 0.85)) { page = 1 }
            }
        }
        .padding(24)
    }
}

struct TracksOnboardingPage: View {
    @Binding var page: Int
    private let metrics: [MetricType] = [.steps, .sleepDuration, .walkingDistance, .activeCalories, .workouts, .heartRate, .batteryLevel, .storageFree, .remindersCompleted]

    var body: some View {
        VStack(alignment: .leading, spacing: 22) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Pick goals that update themselves.")
                    .font(.system(.largeTitle, design: .rounded, weight: .bold))
                    .foregroundStyle(TrackableTheme.ink)
                Text("Start with a few signals. Add more when you need detail.")
                    .font(.body.weight(.medium))
                    .foregroundStyle(TrackableTheme.secondaryInk)
            }
            LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
                ForEach(metrics) { metric in
                    Label(metric.title, systemImage: metric.icon)
                        .font(.subheadline.weight(.semibold))
                        .frame(maxWidth: .infinity, minHeight: 56, alignment: .leading)
                        .padding(.horizontal, 14)
                        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(TrackableTheme.glassStroke, lineWidth: 1))
                }
            }
            Spacer()
            PrimaryButton(title: "Continue", icon: "arrow.right") {
                withAnimation(.spring(response: 0.45, dampingFraction: 0.85)) { page = 2 }
            }
        }
        .padding(24)
    }
}

struct PrivacyOnboardingPage: View {
    let onComplete: () -> Void

    private let rows: [(String, String)] = [
        ("heart.text.square", "Health data comes from Apple Health"),
        ("iphone", "Device data stays local on this iPhone"),
        ("internaldrive", "No account or cloud storage needed"),
        ("person.crop.circle.badge.xmark", "No username or password required"),
        ("hand.raised", "No ads or data selling — ever")
    ]

    var body: some View {
        VStack(alignment: .leading, spacing: 18) {
            VStack(alignment: .leading, spacing: 8) {
                Text("Your data stays personal.")
                    .font(.system(.largeTitle, design: .rounded, weight: .bold))
                    .foregroundStyle(TrackableTheme.ink)
                Text("Trackable works without an account and avoids ads or third-party analytics.")
                    .font(.body.weight(.medium))
                    .foregroundStyle(TrackableTheme.secondaryInk)
            }
            ForEach(rows, id: \.1) { row in
                HStack(spacing: 14) {
                    Image(systemName: row.0)
                        .font(.callout.weight(.semibold))
                        .foregroundStyle(TrackableTheme.mint)
                        .frame(width: 36, height: 36)
                        .background(.thinMaterial, in: Circle())
                    Text(LocalizedStringKey(row.1))
                        .font(.subheadline.weight(.semibold))
                    Spacer()
                }
                .padding(14)
                .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(TrackableTheme.glassStroke, lineWidth: 1))
            }
            Spacer()
            PrimaryButton(title: "Start tracking", icon: "arrow.right") {
                onComplete()
            }
        }
        .padding(24)
    }
}

struct OnboardingBenefitRow: View {
    let icon: String
    let title: LocalizedStringKey
    let subtitle: LocalizedStringKey

    var body: some View {
        HStack(alignment: .top, spacing: 14) {
            Image(systemName: icon)
                .font(.headline.weight(.semibold))
                .foregroundStyle(TrackableTheme.mint)
                .frame(width: 38, height: 38)
                .background(.thinMaterial, in: Circle())
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(TrackableTheme.ink)
                Text(subtitle)
                    .font(.subheadline)
                    .foregroundStyle(TrackableTheme.secondaryInk)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 18, style: .continuous).stroke(TrackableTheme.glassStroke, lineWidth: 1))
    }
}

struct HomeView: View {
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Goal.sortOrder) private var goals: [Goal]
    @Query private var profiles: [UserProfile]
    @State private var filter: GoalFilter = .all
    @State private var expandedGoalID: UUID?
    @State private var configuringGoal: Goal?
    @State private var showingAddGoal = false
    @State private var showingPaywall = false
    @State private var showingSettings = false
    @State private var lastSynced: Date? = nil
    @State private var isSyncing = false
    let store: AppStoreModel
    let dataProvider: DeviceDataProvider
    let onRefresh: () async -> Void

    private var profile: UserProfile? { profiles.first }
    private var activeGoals: [Goal] { goals.filter { !$0.isArchived } }
    private var filteredGoals: [Goal] {
        activeGoals.filter { goal in
            switch filter {
            case .all: true
            case .great: goal.status == .great
            case .notGreat: goal.status == .notGreat
            case .streaks: goal.isStreakGoal
            }
        }
    }
    var body: some View {
        NavigationStack {
            ZStack {
                TrackableTheme.background.ignoresSafeArea()
                ScrollView {
                    VStack(alignment: .leading, spacing: 14) {
                        header
                        syncBanner
                        filterChips
                        goalList
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 10)
                    .padding(.bottom, 38)
                }
                .refreshable {
                    await performSync()
                }
            }
            .navigationBarHidden(true)
            .task {
                await performSync()
            }
            .sheet(isPresented: $showingAddGoal) {
                AddGoalView(dataProvider: dataProvider)
                    .presentationDetents([.large])
            }
            .sheet(isPresented: $showingPaywall) {
                PaywallView(store: store, primaryTitle: "Upgrade to Pro", onClose: { showingPaywall = false })
                    .presentationDetents([.large])
            }
            .sheet(isPresented: $showingSettings) {
                SettingsView(profile: profile, dataProvider: dataProvider)
                    .presentationDetents([.medium, .large])
            }
            .sheet(item: $configuringGoal) { goal in
                TrackableSettingsSheet(
                    metric: goal.metricType,
                    dataProvider: dataProvider,
                    targetValue: Binding(
                        get: { goal.targetValue },
                        set: {
                            goal.targetValue = $0
                            goal.updatedAt = .now
                            try? modelContext.save()
                        }
                    ),
                    period: Binding(
                        get: { goal.period },
                        set: {
                            goal.period = $0
                            goal.updatedAt = .now
                            try? modelContext.save()
                        }
                    )
                )
                .presentationDetents([.medium, .large])
            }
        }
    }

    private var header: some View {
        HStack(alignment: .center, spacing: 10) {
            VStack(alignment: .leading, spacing: 2) {
                Text(Date.now.formatted(.dateTime.weekday(.wide).month(.wide).day()))
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(TrackableTheme.secondaryInk)
                    .textCase(.uppercase)
                    .tracking(0.5)
                Text("Trackable")
                    .font(.system(size: 34, weight: .bold, design: .rounded))
                    .foregroundStyle(TrackableTheme.ink)
            }
            Spacer()
            HStack(spacing: 8) {
                IconButton(systemName: "crown", title: "Upgrade") { showingPaywall = true }
                IconButton(systemName: "gearshape", title: "Settings") { showingSettings = true }
                IconButton(systemName: "plus", title: "Add Goal") { showingAddGoal = true }
            }
        }
        .padding(.top, 6)
    }

    private var syncBanner: some View {
        HStack(spacing: 12) {
            ZStack {
                Circle()
                    .fill(TrackableTheme.mint.opacity(0.14))
                    .frame(width: 40, height: 40)
                Image(systemName: "link")
                    .font(.callout.weight(.semibold))
                    .foregroundStyle(TrackableTheme.mint)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text("Sync device data")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(TrackableTheme.ink)
                Text(lastSynced.map { "Last synced \($0.formatted(date: .omitted, time: .shortened))" } ?? "Tap to sync")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(TrackableTheme.secondaryInk)
            }
            Spacer(minLength: 0)
            Button {
                guard !isSyncing else { return }
                Task { await performSync() }
            } label: {
                Image(systemName: "arrow.clockwise")
                    .font(.callout.weight(.semibold))
                    .foregroundStyle(TrackableTheme.ink)
                    .frame(width: 34, height: 34)
                    .background(TrackableTheme.softSurface, in: Circle())
            }
            .buttonStyle(.plain)
            .disabled(isSyncing)
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(TrackableTheme.surface, in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 18, style: .continuous).stroke(TrackableTheme.hairline, lineWidth: 1))
        .shadow(color: TrackableTheme.shadow, radius: 12, x: 0, y: 6)
    }

    private func performSync() async {
        guard !isSyncing else { return }
        isSyncing = true
        await onRefresh()
        lastSynced = .now
        isSyncing = false
    }

    private var filterChips: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(GoalFilter.allCases) { item in
                    Button {
                        withAnimation(.spring(response: 0.32, dampingFraction: 0.9)) { filter = item }
                    } label: {
                        Text(item.title)
                            .font(.subheadline.weight(.semibold))
                            .padding(.horizontal, 16)
                            .padding(.vertical, 9)
                            .background(filter == item ? TrackableTheme.ink : TrackableTheme.surface, in: Capsule())
                            .foregroundStyle(filter == item ? Color(UIColor.systemBackground) : TrackableTheme.secondaryInk)
                            .overlay(Capsule().stroke(filter == item ? .clear : TrackableTheme.hairline, lineWidth: 1))
                    }
                    .buttonStyle(.plain)
                }
            }
            .padding(.vertical, 2)
        }
    }

    private var goalList: some View {
        LazyVStack(spacing: 12) {
            ForEach(filteredGoals) { goal in
                GoalCard(
                    goal: goal,
                    expanded: expandedGoalID == goal.id,
                    onSettings: { configuringGoal = goal }
                )
                    .onTapGesture {
                        withAnimation(.spring(response: 0.38, dampingFraction: 0.86)) {
                            expandedGoalID = expandedGoalID == goal.id ? nil : goal.id
                        }
                    }
            }
        }
    }

}

struct OverviewMetric: View {
    let value: String
    let title: LocalizedStringKey

    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(value)
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(TrackableTheme.ink)
                .lineLimit(1)
                .minimumScaleFactor(0.72)
            Text(title)
                .font(.caption.weight(.medium))
                .foregroundStyle(TrackableTheme.secondaryInk)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(TrackableTheme.softSurface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

struct GoalCard: View {
    let goal: Goal
    let expanded: Bool
    let onSettings: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: expanded ? 18 : 14) {
            HStack(alignment: .center, spacing: 14) {
                MetricBadge(goal: goal)

                VStack(alignment: .leading, spacing: 4) {
                    Text(goal.title)
                        .font(.system(size: 19, weight: .semibold))
                        .foregroundStyle(TrackableTheme.ink)
                        .lineLimit(2)
                        .minimumScaleFactor(0.82)
                    Text(goal.statusCopy)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(goal.currentValue == 0 ? TrackableTheme.yellow : goal.status.tint)
                }

                Spacer(minLength: 10)

                VStack(alignment: .trailing, spacing: 3) {
                    Button(action: onSettings) {
                        Image(systemName: "gearshape")
                            .font(.callout.weight(.semibold))
                            .frame(width: 34, height: 34)
                            .contentShape(Circle())
                    }
                    .buttonStyle(.plain)
                        .foregroundStyle(TrackableTheme.secondaryInk.opacity(0.7))
                        .accessibilityLabel("Goal settings")
                    Text(goal.progressPercentText)
                        .font(.callout.weight(.semibold))
                        .foregroundStyle(TrackableTheme.ink)
                }
            }

            VStack(alignment: .leading, spacing: 8) {
                HStack(alignment: .firstTextBaseline) {
                    Text(goal.valueLine)
                        .font(.subheadline)
                        .foregroundStyle(TrackableTheme.secondaryInk)
                    Spacer()
                    Text(goal.targetValueText)
                        .font(.caption.weight(.medium))
                        .foregroundStyle(TrackableTheme.tertiaryInk)
                }
                SegmentedProgressBar(progress: goal.progress, tint: goal.status.tint)
            }

            if expanded {
                VStack(alignment: .leading, spacing: 12) {
                    Divider()
                        .overlay(TrackableTheme.hairline)

                    if goal.metricType == .batteryLevel || goal.metricType == .batteryHealth {
                        Text("goal_expanded_battery_help")
                            .font(.caption)
                            .foregroundStyle(TrackableTheme.secondaryInk)
                    } else if goal.metricType == .storageFree {
                        Text("goal_expanded_storage_help")
                            .font(.caption)
                            .foregroundStyle(TrackableTheme.secondaryInk)
                    }

                    Button(action: onSettings) {
                        Label("Data source settings", systemImage: "slider.horizontal.3")
                            .font(.subheadline.weight(.semibold))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 11)
                            .background(TrackableTheme.softSurface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
                    }
                    .buttonStyle(.plain)
                    .foregroundStyle(TrackableTheme.ink)

                    LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 8) {
                        GoalDetailPill(title: "Current", value: goal.currentValueText, icon: "gauge.with.dots.needle.67percent")
                        GoalDetailPill(title: "Target", value: goal.targetValueText, icon: "target")
                        GoalDetailPill(title: "Source", value: goal.metricType.sourceTitle, icon: goal.metricType.icon)
                        GoalDetailPill(title: "Period", value: goal.period.displayTitle, icon: "calendar")
                        GoalDetailPill(title: "Status", value: goal.status.displayTitle, icon: "checkmark.seal")
                        GoalDetailPill(title: "Streak", value: "\(goal.streakCount)", icon: "flame")
                    }
                }
                .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .padding(18)
        .background(TrackableTheme.surface, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 24, style: .continuous).stroke(TrackableTheme.hairline, lineWidth: 1))
        .shadow(color: TrackableTheme.shadow, radius: 20, x: 0, y: 12)
        .accessibilityElement(children: .combine)
    }
}

struct MetricBadge: View {
    let goal: Goal

    var body: some View {
        ZStack {
            ProgressRing(progress: goal.progress, tint: goal.status.tint, lineWidth: 5)
            Circle()
                .fill(goal.status.tint.opacity(0.11))
                .frame(width: 44, height: 44)
            Image(systemName: goal.metricType.icon)
                .font(.system(size: 18, weight: .semibold))
                .foregroundStyle(goal.status.tint)
        }
        .overlay(alignment: .bottomTrailing) {
            if goal.needsAttention {
                Image(systemName: "exclamationmark")
                    .font(.system(size: 10, weight: .black))
                    .foregroundStyle(Color.white)
                    .frame(width: 20, height: 20)
                    .background(TrackableTheme.red, in: Circle())
                    .overlay(Circle().stroke(TrackableTheme.surface, lineWidth: 2))
                    .accessibilityLabel("Needs attention")
            }
        }
        .frame(width: 58, height: 58)
    }
}

struct ProgressRing: View {
    let progress: Double
    let tint: Color
    var lineWidth: CGFloat = 7

    var body: some View {
        ZStack {
            Circle()
                .stroke(TrackableTheme.hairline, lineWidth: lineWidth)
            Circle()
                .trim(from: 0, to: min(max(progress, 0), 1))
                .stroke(tint, style: StrokeStyle(lineWidth: lineWidth, lineCap: .round))
                .rotationEffect(.degrees(-90))
        }
    }
}

struct SegmentedProgressBar: View {
    let progress: Double
    let tint: Color
    private let segmentCount = 26

    var body: some View {
        HStack(spacing: 3) {
            ForEach(0..<segmentCount, id: \.self) { index in
                Capsule()
                    .fill(Double(index) < Double(segmentCount) * min(max(progress, 0), 1) ? tint.opacity(0.72) : TrackableTheme.hairline)
                    .frame(maxWidth: .infinity)
            }
        }
        .frame(height: 8)
    }
}

struct GoalDetailPill: View {
    let title: LocalizedStringKey
    let value: String
    let icon: String

    var body: some View {
        HStack(spacing: 9) {
            Image(systemName: icon)
                .font(.caption.weight(.semibold))
                .foregroundStyle(TrackableTheme.secondaryInk)
                .frame(width: 26, height: 26)
                .background(TrackableTheme.surface, in: Circle())
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.caption2.weight(.medium))
                    .foregroundStyle(TrackableTheme.tertiaryInk)
                Text(value)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(TrackableTheme.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.74)
            }
            Spacer(minLength: 0)
        }
        .padding(.horizontal, 10)
        .padding(.vertical, 9)
        .background(TrackableTheme.softSurface, in: RoundedRectangle(cornerRadius: 14, style: .continuous))
    }
}

struct AddGoalView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @Query(sort: \Goal.sortOrder) private var goals: [Goal]
    let dataProvider: DeviceDataProvider
    @State private var draftTargets = Dictionary(uniqueKeysWithValues: MetricType.allCases.map { ($0, $0.target) })
    @State private var draftPeriods = Dictionary(uniqueKeysWithValues: MetricType.allCases.map { ($0, GoalPeriod.daily) })
    @State private var configuringMetric: MetricType?
    @State private var addGoalErrorMessage: String?

    var body: some View {
        NavigationStack {
            ScrollView {
                LazyVStack(spacing: 2) {
                    ForEach(MetricType.selectableCases) { metric in
                        TrackableToggleRow(
                            metric: metric,
                            isOn: goalExists(for: metric),
                            isAvailable: metric.canBeAddedInCurrentBuild,
                            onSettings: { configuringMetric = metric },
                            onToggle: { enabled in
                                if enabled {
                                    addGoal(for: metric)
                                } else {
                                    archiveGoal(for: metric)
                                }
                            }
                        )
                    }
                    if !MetricType.unavailableCases.isEmpty {
                        VStack(alignment: .leading, spacing: 10) {
                            Text("Unavailable tracking")
                                .font(.headline.weight(.semibold))
                                .foregroundStyle(TrackableTheme.ink)
                                .padding(.horizontal, 16)
                                .padding(.top, 18)
                            ForEach(MetricType.unavailableCases) { metric in
                                UnsupportedMetricRow(metric: metric)
                            }
                        }
                    }
                }
                .padding(.vertical, 18)
            }
            .background(Color(UIColor.systemGroupedBackground).ignoresSafeArea())
            .navigationTitle("New Trackable")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Done") { dismiss() }
                }
            }
            .alert("Goal unavailable", isPresented: Binding(
                get: { addGoalErrorMessage != nil },
                set: { if !$0 { addGoalErrorMessage = nil } }
            )) {
                Button("OK") { addGoalErrorMessage = nil }
            } message: {
                Text(addGoalErrorMessage ?? "")
            }
            .sheet(item: $configuringMetric) { metric in
                TrackableSettingsSheet(
                    metric: metric,
                    dataProvider: dataProvider,
                    targetValue: Binding(
                        get: { draftTargets[metric] ?? metric.target },
                        set: { draftTargets[metric] = $0 }
                    ),
                    period: Binding(
                        get: { draftPeriods[metric] ?? .daily },
                        set: { draftPeriods[metric] = $0 }
                    )
                )
                .presentationDetents([.medium])
            }
        }
    }

    private func goalExists(for metric: MetricType) -> Bool {
        goals.contains { $0.metricType == metric && !$0.isArchived }
    }

    private func archiveGoal(for metric: MetricType) {
        guard let goal = goals.first(where: { $0.metricType == metric && !$0.isArchived }) else { return }
        goal.isArchived = true
        goal.updatedAt = .now
        try? modelContext.save()
    }

    private func addGoal(for metric: MetricType) {
        guard metric.canBeAddedInCurrentBuild else { return }
        guard !goalExists(for: metric) else { return }

        Task {
            await dataProvider.requestPermission(for: metric)
            let value: Double
            if let liveValue = await initialValue(for: metric) {
                value = liveValue
            } else if dataProvider.lastPermissionMessage != nil {
                addGoalErrorMessage = userFacingConnectionMessage(for: metric)
                return
            } else {
                value = 0
            }
            let target = draftTargets[metric] ?? metric.target
            let period = draftPeriods[metric] ?? .daily
            let goal = Goal(title: metric.displayTitle, metricType: metric, sourceType: metric.sourceType, targetValue: target, currentValue: value, unit: metric.unit, period: period, goalDirection: metric.direction, streakCount: value >= target ? 1 : 0, sortOrder: goals.count)
            modelContext.insert(goal)
            try? modelContext.save()
        }
    }

    private func initialValue(for metric: MetricType) async -> Double? {
        switch metric {
        case .focusSessions, .timeAtHome, .timeOutside, .appBlocking, .batteryHealth:
            return 0
        default:
            return await dataProvider.currentValue(for: metric)
        }
    }

    private func userFacingConnectionMessage(for metric: MetricType) -> String {
        switch metric.sourceType {
        case .healthKit:
            String(localized: "Apple Health is not connected yet. Open the metric settings and connect Apple Health.")
        case .reminders:
            String(localized: "Reminders is not connected yet.")
        case .location:
            String(localized: "Location access is not connected yet.")
        case .device:
            metric == .batteryHealth ? metric.unavailableReason : String(localized: "This device value is unavailable right now.")
        case .screenTime, .trackable:
            metric.unavailableReason
        }
    }
}

struct TrackableToggleRow: View {
    let metric: MetricType
    let isOn: Bool
    let isAvailable: Bool
    let onSettings: () -> Void
    let onToggle: (Bool) -> Void

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: metric.icon)
                .font(.system(size: 17, weight: .semibold))
                .symbolRenderingMode(.hierarchical)
                .foregroundStyle(isOn ? TrackableTheme.mint : TrackableTheme.ink.opacity(0.62))
                .frame(width: 36, height: 36)
                .background(.thinMaterial, in: Circle())
            VStack(alignment: .leading, spacing: 4) {
                Text(metric.displayTitle)
                    .font(.body.weight(.semibold))
                    .foregroundStyle(TrackableTheme.ink)
                    .lineLimit(1)
                    .minimumScaleFactor(0.86)
                Text(metric.question)
                    .font(.footnote.weight(.medium))
                    .foregroundStyle(.secondary)
                    .lineLimit(1)
                    .minimumScaleFactor(0.86)
                if !isAvailable {
                    Text(metric.unavailableReason)
                        .font(.caption2.weight(.semibold))
                        .foregroundStyle(TrackableTheme.red)
                        .lineLimit(2)
                        .minimumScaleFactor(0.82)
                }
            }
            Spacer(minLength: 10)
            Button(action: onSettings) {
                Image(systemName: "slider.horizontal.3")
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(TrackableTheme.ink.opacity(0.62))
                    .frame(width: 38, height: 38)
                    .background(.thinMaterial, in: Circle())
                    .overlay(Circle().stroke(TrackableTheme.glassStroke, lineWidth: 1))
            }
            .buttonStyle(.plain)
            .accessibilityLabel("Configure \(metric.displayTitle)")
            .disabled(!isAvailable)
            Toggle("", isOn: Binding(get: { isOn }, set: onToggle))
                .labelsHidden()
                .tint(TrackableTheme.green)
                .scaleEffect(0.88)
                .frame(width: 54)
                .disabled(!isAvailable)
        }
        .opacity(isAvailable ? 1 : 0.58)
        .padding(.horizontal, 14)
        .padding(.vertical, 11)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 20, style: .continuous).stroke(TrackableTheme.glassStroke, lineWidth: 1))
        .padding(.horizontal, 16)
        .padding(.vertical, 4)
    }
}

struct UnsupportedMetricRow: View {
    let metric: MetricType

    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: metric.icon)
                .font(.system(size: 17, weight: .semibold))
                .foregroundStyle(TrackableTheme.tertiaryInk)
                .frame(width: 36, height: 36)
                .background(TrackableTheme.softSurface, in: Circle())
            VStack(alignment: .leading, spacing: 4) {
                Text(metric.displayTitle)
                    .font(.body.weight(.semibold))
                    .foregroundStyle(TrackableTheme.secondaryInk)
                Text(metric.unavailableReason)
                    .font(.footnote.weight(.medium))
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
            Spacer()
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 11)
        .background(TrackableTheme.softSurface, in: RoundedRectangle(cornerRadius: 20, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 20, style: .continuous).stroke(TrackableTheme.hairline, lineWidth: 1))
        .padding(.horizontal, 16)
        .padding(.vertical, 4)
        .accessibilityElement(children: .combine)
    }
}

struct DataSourceConnectionPanel: View {
    let metric: MetricType
    let dataProvider: DeviceDataProvider
    let syncing: Bool
    let currentValue: Double?
    let syncMessage: String?
    let onSync: () -> Void

    var body: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack(alignment: .top, spacing: 12) {
                Image(systemName: sourceIcon)
                    .font(.headline.weight(.semibold))
                    .foregroundStyle(statusTint)
                    .frame(width: 38, height: 38)
                    .background(statusTint.opacity(0.12), in: Circle())

                VStack(alignment: .leading, spacing: 4) {
                    Text(metric.sourceTitle)
                        .font(.headline.weight(.semibold))
                    Text(statusTitle)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(statusTint)
                    Text(statusDetail)
                        .font(.footnote)
                        .foregroundStyle(.secondary)
                        .fixedSize(horizontal: false, vertical: true)
                }
            }

            Button(action: onSync) {
                Label(syncing ? String(localized: "Connecting") : actionTitle, systemImage: syncing ? "arrow.triangle.2.circlepath" : actionIcon)
                    .font(.subheadline.weight(.semibold))
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.borderedProminent)
            .disabled(syncing || actionDisabled)

            if let currentValue {
                LabeledContent("Current value") {
                    Text("\(currentValue.formatted(.number.precision(.fractionLength(0...1)))) \(metric.unit)")
                }
            }

            if let syncMessage {
                Text(syncMessage)
                    .font(.footnote)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }

            Text("Trackable stores the target, selected settings, and progress summary on this iPhone.")
                .font(.footnote)
                .foregroundStyle(.secondary)
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(.vertical, 4)
    }

    private var sourceIcon: String {
        switch metric.sourceType {
        case .healthKit: "heart.text.square"
        case .reminders: "checklist"
        case .location: "location"
        case .device: metric.icon
        case .screenTime: "hourglass"
        case .trackable: "app"
        }
    }

    private var statusTitle: String {
        switch metric.sourceType {
        case .healthKit:
            dataProvider.healthAuthorized ? String(localized: "Connected") : String(localized: "Connection required")
        case .reminders:
            dataProvider.remindersAuthorized ? String(localized: "Connected") : String(localized: "Connection required")
        case .location:
            dataProvider.locationAuthorized ? String(localized: "Connected") : String(localized: "Location access required")
        case .device:
            metric == .batteryHealth ? String(localized: "Unavailable on iOS") : String(localized: "Ready")
        case .screenTime, .trackable:
            String(localized: "Unavailable")
        }
    }

    private var statusDetail: String {
        switch metric.sourceType {
        case .healthKit:
            return dataProvider.healthAuthorized
                ? String(localized: "Trackable can read this metric from Apple Health.")
                : String(localized: "Connect Apple Health to read real values from this iPhone.")
        case .reminders:
            return dataProvider.remindersAuthorized
                ? String(localized: "Completed reminders can be counted from today's lists.")
                : String(localized: "Connect Reminders to count completed items.")
        case .location:
            return dataProvider.locationAuthorized
                ? String(localized: "Location access is available for home and outside goals.")
                : String(localized: "Allow location access to update this goal.")
        case .device:
            return metric == .batteryHealth
                ? metric.unavailableReason
                : String(localized: "No permission prompt is needed. This value refreshes directly from iOS.")
        case .screenTime, .trackable:
            return metric.unavailableReason
        }
    }

    private var actionTitle: String {
        switch metric.sourceType {
        case .healthKit: String(localized: "Connect Apple Health")
        case .reminders: String(localized: "Connect Reminders")
        case .location: String(localized: "Allow Location Access")
        case .device: String(localized: "Refresh Device Value")
        case .screenTime, .trackable: String(localized: "Unavailable")
        }
    }

    private var actionIcon: String {
        switch metric.sourceType {
        case .healthKit: "heart.text.square"
        case .reminders: "checklist"
        case .location: "location"
        case .device: "arrow.clockwise"
        case .screenTime, .trackable: "xmark.circle"
        }
    }

    private var actionDisabled: Bool {
        metric == .batteryHealth || !metric.canBeAddedInCurrentBuild
    }

    private var statusTint: Color {
        switch metric.sourceType {
        case .healthKit where dataProvider.healthAuthorized,
             .reminders where dataProvider.remindersAuthorized,
             .location where dataProvider.locationAuthorized:
            TrackableTheme.green
        case .device where metric != .batteryHealth:
            TrackableTheme.green
        case .screenTime, .trackable:
            TrackableTheme.tertiaryInk
        default:
            TrackableTheme.yellow
        }
    }
}

struct TrackableSettingsSheet: View {
    @Environment(\.dismiss) private var dismiss
    let metric: MetricType
    let dataProvider: DeviceDataProvider
    @Binding var targetValue: Double
    @Binding var period: GoalPeriod
    @State private var syncing = false
    @State private var currentValue: Double?
    @State private var syncMessage: String?

    var body: some View {
        NavigationStack {
            Form {
                Section(metric.displayTitle) {
                    Picker("Period", selection: $period) {
                        ForEach(GoalPeriod.allCases) { period in
                            Text(period.title).tag(period)
                        }
                    }
                    HStack {
                        Text("Target")
                        Spacer()
                        Text("\(targetValue.formatted(.number.precision(.fractionLength(0...1)))) \(metric.unit)")
                            .foregroundStyle(.secondary)
                    }
                    Slider(value: $targetValue, in: targetRange, step: targetStep)
                }
                Section("Data Source") {
                    DataSourceConnectionPanel(
                        metric: metric,
                        dataProvider: dataProvider,
                        syncing: syncing,
                        currentValue: currentValue,
                        syncMessage: syncMessage,
                        onSync: syncMetric
                    )
                }
            }
            .navigationTitle(metric.displayTitle)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                }
            }
        }
    }

    private func syncMetric() {
        guard !syncing else { return }
        syncing = true
        syncMessage = nil
        Task {
            await dataProvider.requestPermission(for: metric)
            let value = await dataProvider.currentValue(for: metric)
            await MainActor.run {
                currentValue = value
                syncMessage = value == nil ? userFacingConnectionMessage : String(localized: "Updated from \(metric.sourceTitle).")
                syncing = false
            }
        }
    }

    private var userFacingConnectionMessage: String {
        switch metric.sourceType {
        case .healthKit:
            String(localized: "Apple Health is not connected. Check Health → Apps → Goal Tracker and enable the data categories for this metric.")
        case .reminders:
            String(localized: "Reminders is not connected. Allow access to count completed reminders.")
        case .location:
            String(localized: "Location is not connected. Allow access to update this goal.")
        case .device:
            metric == .batteryHealth ? metric.unavailableReason : String(localized: "This device value is unavailable right now.")
        case .screenTime, .trackable:
            metric.unavailableReason
        }
    }

    private var targetRange: ClosedRange<Double> {
        switch metric {
        case .steps: 1_000...30_000
        case .storageFree: 1...512
        case .batteryLevel, .sleepConsistency, .heartRate, .chargingHabits, .batteryHealth: 1...100
        default: 0.5...12
        }
    }

    private var targetStep: Double {
        switch metric {
        case .steps: 500
        case .storageFree: 5
        case .batteryLevel, .sleepConsistency, .heartRate, .chargingHabits, .batteryHealth: 1
        default: 0.5
        }
    }
}

struct PaywallView: View {
    let store: AppStoreModel
    let primaryTitle: LocalizedStringKey
    let onClose: () -> Void
    @State private var selectedProductID = "trackable.pro.yearly"
    @State private var showingSubscriptionManagement = false

    private let fallbackPlans = [
        ("Weekly", "$2.99/week", "3-day free trial", "trackable.pro.weekly"),
        ("Monthly", "$7.99/month", "7-day free trial", "trackable.pro.monthly"),
        ("Yearly", "$49.99/year", "7-day free trial", "trackable.pro.yearly"),
        ("Lifetime", "$199 one-time", "Pay once", "trackable.pro.lifetime")
    ]

    var body: some View {
        NavigationStack {
            ZStack {
                TrackableTheme.background.ignoresSafeArea()
                ScrollView {
                    VStack(alignment: .leading, spacing: 18) {
                        VStack(alignment: .leading, spacing: 10) {
                            Image(systemName: "crown.fill")
                                .font(.title2.weight(.bold))
                                .foregroundStyle(TrackableTheme.mint)
                                .frame(width: 48, height: 48)
                                .background(.thinMaterial, in: Circle())
                            Text("Trackable Pro")
                                .font(.system(.largeTitle, design: .rounded, weight: .bold))
                                .foregroundStyle(TrackableTheme.ink)
                            Text("Unlimited automatic goals, widgets, streaks, reports, local history, and personal insights.")
                                .font(.body.weight(.medium))
                                .foregroundStyle(TrackableTheme.secondaryInk)
                        }

                        VStack(alignment: .leading, spacing: 8) {
                            PlanCompare(title: "Free", rows: ["Unlimited goals in this build", "Basic widgets", "Basic weekly summary"])
                            PlanCompare(title: "Pro", rows: ["Unlimited goals", "All widgets", "Streak goals", "Weekly/monthly reports", "Local history", "Personal insights"])
                        }

                        VStack(spacing: 10) {
                            ForEach(fallbackPlans, id: \.3) { plan in
                                Button {
                                    selectedProductID = plan.3
                                } label: {
                                    HStack {
                                        Image(systemName: selectedProductID == plan.3 ? "checkmark.circle.fill" : "circle")
                                            .font(.headline.weight(.bold))
                                            .foregroundStyle(selectedProductID == plan.3 ? TrackableTheme.mint : .secondary.opacity(0.45))
                                        VStack(alignment: .leading, spacing: 3) {
                                            Text(LocalizedStringKey(plan.0))
                                                .font(.subheadline.weight(.semibold))
                                            Text(localizedPrice(for: plan))
                                                .font(.footnote.weight(.semibold))
                                                .foregroundStyle(.secondary)
                                        }
                                        Spacer()
                                        Text(LocalizedStringKey(plan.2))
                                            .font(.caption.weight(.bold))
                                            .foregroundStyle(TrackableTheme.mint)
                                    }
                                    .padding(14)
                                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 16, style: .continuous)
                                            .stroke(selectedProductID == plan.3 ? TrackableTheme.mint : .clear, lineWidth: 2)
                                    )
                                }
                                .buttonStyle(.plain)
                            }
                        }

                        PrimaryButton(title: primaryTitle, icon: "crown.fill") {
                            Task {
                                if store.products.isEmpty {
                                    await store.loadProducts()
                                }
                                guard let product = selectedProduct else {
                                    store.purchaseError = String(localized: "This subscription is not available right now.")
                                    return
                                }
                                if await store.purchase(product) {
                                    onClose()
                                }
                            }
                        }
                        .disabled(store.isPurchasing || store.isLoadingProducts)

                        if store.isLoadingProducts || store.isPurchasing {
                            ProgressView()
                                .frame(maxWidth: .infinity)
                        }

                        if let purchaseError = store.purchaseError {
                            Text(purchaseError)
                                .font(.footnote.weight(.semibold))
                                .foregroundStyle(.red)
                                .frame(maxWidth: .infinity, alignment: .center)
                                .multilineTextAlignment(.center)
                        }

                        Button("Restore Purchases") {
                            Task { await store.restore() }
                        }
                        .frame(maxWidth: .infinity)
                        .font(.footnote.weight(.semibold))

                        Button("Manage Subscriptions") {
                            showingSubscriptionManagement = true
                        }
                        .frame(maxWidth: .infinity)
                        .font(.footnote.weight(.semibold))
                    }
                    .padding(24)
                }
            }
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Close", action: onClose)
                }
            }
            .task {
                await store.loadProducts()
                if store.products.contains(where: { $0.id == store.activeProductID }) {
                    selectedProductID = store.activeProductID ?? selectedProductID
                }
            }
            .manageSubscriptionsSheet(isPresented: $showingSubscriptionManagement)
        }
    }

    private var selectedProduct: Product? {
        store.products.first(where: { $0.id == selectedProductID })
    }

    private func localizedPrice(for fallback: (String, String, String, String)) -> String {
        store.products.first(where: { $0.id == fallback.3 })?.displayPrice ?? fallback.1
    }
}

struct SettingsView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(\.modelContext) private var modelContext
    @Query private var profiles: [UserProfile]
    @Query private var goals: [Goal]
    @Query private var snapshots: [GoalSnapshot]
    @Query private var widgetConfigs: [WidgetConfig]
    @Query private var subscriptions: [SubscriptionState]
    @Query private var focusSessions: [FocusSession]
    @Query private var locationSamples: [LocationActivitySample]
    let profile: UserProfile?
    let dataProvider: DeviceDataProvider
    @State private var showingResetConfirmation = false
    @State private var dataDeletionMessage: String?

    var body: some View {
        NavigationStack {
            List {
                Section("Account") {
                    Label("No login required", systemImage: "person.crop.circle.badge.checkmark")
                    Label(profile?.isPro == true ? "Pro active" : "Free plan", systemImage: "crown")
                    Label("Language: \(profile?.preferredLanguage ?? "en")", systemImage: "globe")
                }
                Section("Data") {
                    Label("Local-only mode", systemImage: "internaldrive")
                    Label("Private on-device database", systemImage: "lock")
                    Label("No ads or data selling", systemImage: "hand.raised")
                    Button(role: .destructive) {
                        showingResetConfirmation = true
                    } label: {
                        Label("Delete all app data", systemImage: "trash")
                    }
                }
            }
            .navigationTitle("Settings")
            .confirmationDialog("Delete all Trackable data?", isPresented: $showingResetConfirmation, titleVisibility: .visible) {
                Button("Delete all data", role: .destructive) {
                    deleteAllData()
                }
                Button("Cancel", role: .cancel) {}
            } message: {
                Text("This removes goals, progress snapshots, widget settings, profile data, and cached subscription state from this device.")
            }
            .alert("Data deletion", isPresented: Binding(
                get: { dataDeletionMessage != nil },
                set: { if !$0 { dataDeletionMessage = nil } }
            )) {
                Button("OK") {
                    dataDeletionMessage = nil
                    dismiss()
                }
            } message: {
                Text(dataDeletionMessage ?? "")
            }
        }
    }

    private func deleteAllData() {
        snapshots.forEach(modelContext.delete)
        goals.forEach(modelContext.delete)
        widgetConfigs.forEach(modelContext.delete)
        subscriptions.forEach(modelContext.delete)
        focusSessions.forEach(modelContext.delete)
        locationSamples.forEach(modelContext.delete)
        profiles.forEach(modelContext.delete)
        do {
            try modelContext.save()
            dataDeletionMessage = String(localized: "All local Trackable data was deleted.")
        } catch {
            dataDeletionMessage = String(localized: "Trackable could not delete all data. Try again.")
        }
    }
}

struct ProgressBar: View {
    let progress: Double
    let tint: Color

    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                Capsule().fill(TrackableTheme.hairline)
                Capsule().fill(tint.opacity(0.78))
                    .frame(width: max(10, geometry.size.width * min(progress, 1)))
            }
        }
        .frame(height: 8)
    }
}

struct PrimaryButton: View {
    let title: LocalizedStringKey
    let icon: String
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Label(title, systemImage: icon)
                .font(.headline.weight(.bold))
                .frame(maxWidth: .infinity, minHeight: 54)
                .background(Color.primary, in: Capsule())
                .foregroundStyle(Color(UIColor.systemBackground))
        }
        .buttonStyle(.plain)
    }
}

struct IconButton: View {
    let systemName: String
    let title: LocalizedStringKey
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.headline.weight(.semibold))
                .foregroundStyle(TrackableTheme.ink)
                .frame(width: 44, height: 44)
                .background(TrackableTheme.surface, in: Circle())
                .overlay(Circle().stroke(TrackableTheme.hairline, lineWidth: 1))
                .shadow(color: TrackableTheme.shadow.opacity(0.65), radius: 12, x: 0, y: 8)
        }
        .buttonStyle(.plain)
        .accessibilityLabel(title)
    }
}

struct DetailRow: View {
    let label: LocalizedStringKey
    let value: LocalizedStringKey

    var body: some View {
        HStack {
            Text(label)
                .foregroundStyle(.secondary)
            Spacer()
            Text(value)
                .fontWeight(.semibold)
                .multilineTextAlignment(.trailing)
        }
        .font(.subheadline)
    }
}

struct SummaryTile: View {
    let title: LocalizedStringKey
    let value: String
    let tint: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(value)
                .font(.title.bold())
            Text(title)
                .font(.caption.weight(.bold))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(tint.opacity(0.14), in: RoundedRectangle(cornerRadius: 18))
    }
}

struct SuggestionStrip: View {
    let goals: [Goal]

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Label("Smart suggestion", systemImage: "sparkles")
                .font(.headline)
                .foregroundStyle(TrackableTheme.ink)
            Text(suggestion)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(TrackableTheme.secondaryInk)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .background(Color(UIColor.secondarySystemGroupedBackground), in: RoundedRectangle(cornerRadius: 18))
    }

    private var suggestion: LocalizedStringKey {
        if goals.contains(where: { $0.metricType == .steps && $0.currentValue > 8_000 }) {
            "You usually pass 8,000 steps. Set 10,000?"
        } else if goals.contains(where: { $0.metricType == .storageFree && $0.currentValue > $0.targetValue }) {
            "Device storage is above your target. Review your storage goal?"
        } else {
            "Add goals from Health, reminders, battery, storage, and focus."
        }
    }
}

struct PlanCompare: View {
    let title: LocalizedStringKey
    let rows: [LocalizedStringKey]

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.headline.weight(.bold))
            ForEach(Array(rows.enumerated()), id: \.offset) { _, row in
                Label(row, systemImage: "checkmark.circle.fill")
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(RoundedRectangle(cornerRadius: 16, style: .continuous).stroke(TrackableTheme.glassStroke, lineWidth: 1))
    }
}

enum TrackableTheme {
    private static func adaptiveRGB(light: (CGFloat, CGFloat, CGFloat), dark: (CGFloat, CGFloat, CGFloat)) -> Color {
        Color(UIColor { traits in
            let tuple = traits.userInterfaceStyle == .dark ? dark : light
            return UIColor(red: tuple.0, green: tuple.1, blue: tuple.2, alpha: 1)
        })
    }

    static let background = LinearGradient(
        colors: [
            adaptiveRGB(light: (0.985, 0.982, 0.965), dark: (0.07, 0.08, 0.10)),
            adaptiveRGB(light: (0.955, 0.965, 0.950), dark: (0.10, 0.11, 0.13)),
            adaptiveRGB(light: (0.976, 0.970, 0.952), dark: (0.08, 0.09, 0.11))
        ],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )

    static let ink = Color(UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor(white: 0.95, alpha: 1)
            : UIColor(red: 0.105, green: 0.112, blue: 0.125, alpha: 1)
    })

    static let secondaryInk = Color(UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor(white: 0.70, alpha: 1)
            : UIColor(red: 0.38, green: 0.40, blue: 0.43, alpha: 1)
    })

    static let tertiaryInk = Color(UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor(white: 0.52, alpha: 1)
            : UIColor(red: 0.60, green: 0.61, blue: 0.63, alpha: 1)
    })

    static let surface = Color(UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor.secondarySystemFill
            : UIColor.white.withAlphaComponent(0.92)
    })

    static let softSurface = Color(UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor.tertiarySystemFill
            : UIColor(red: 0.955, green: 0.958, blue: 0.940, alpha: 1)
    })

    static let hairline = Color(UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor.separator
            : UIColor.black.withAlphaComponent(0.065)
    })

    static let shadow = Color(UIColor { traits in
        traits.userInterfaceStyle == .dark
            ? UIColor.black.withAlphaComponent(0.45)
            : UIColor.black.withAlphaComponent(0.065)
    })

    static let glassFill = surface
    static let glassStroke = hairline
    static let green = Color(red: 0.04, green: 0.70, blue: 0.58)
    static let yellow = Color(red: 0.94, green: 0.63, blue: 0.16)
    static let red = Color(red: 0.93, green: 0.45, blue: 0.18)
    static let mint = green
    static let orange = yellow
    static let blue = Color(red: 0.19, green: 0.43, blue: 0.82)
}

private extension Goal {
    var progress: Double {
        guard targetValue > 0 else { return 0 }
        switch goalDirection {
        case .increase:
            return min(currentValue / targetValue, 1)
        case .decrease:
            return min(max((targetValue * 2 - currentValue) / targetValue, 0), 1)
        case .maintain:
            return min(currentValue / targetValue, 1)
        }
    }

    var status: GoalStatus {
        if progress >= 1 { return .great }
        if progress >= 0.66 { return .neutral }
        return .notGreat
    }

    var valueLine: String {
        let current = currentValue.formatted(.number.precision(.fractionLength(0...1)))
        let target = targetValue.formatted(.number.precision(.fractionLength(0...1)))
        return "\(current) / \(target) \(unit)"
    }

    var progressPercentText: String {
        "\(Int((progress * 100).rounded()))%"
    }

    var statusCopy: LocalizedStringKey {
        switch status {
        case .great: "On track"
        case .neutral: "Nearly there"
        case .notGreat: currentValue == 0 ? "Needs data" : "Below target"
        }
    }

    var currentValueText: String {
        "\(formattedValue(currentValue)) \(unit)"
    }

    var targetValueText: String {
        "\(formattedValue(targetValue)) \(unit)"
    }

    private func formattedValue(_ value: Double) -> String {
        value.formatted(.number.precision(.fractionLength(0...1)))
    }

    var needsAttention: Bool {
        currentValue == 0
    }
}

private extension GoalStatus {
    var tint: Color {
        switch self {
        case .great: TrackableTheme.green
        case .notGreat: TrackableTheme.red
        case .neutral: TrackableTheme.yellow
        }
    }

    var sortRank: Int {
        switch self {
        case .notGreat: 0
        case .neutral: 1
        case .great: 2
        }
    }

    var title: LocalizedStringKey {
        switch self {
        case .great: "Great"
        case .notGreat: "Not Great"
        case .neutral: "Neutral"
        }
    }

    var displayTitle: String {
        switch self {
        case .great: String(localized: "Great")
        case .notGreat: String(localized: "Not Great")
        case .neutral: String(localized: "Neutral")
        }
    }
}

struct SplashView: View {
    @State private var scaleEffect: CGFloat = 0.85
    @State private var opacity: Double = 0

    var body: some View {
        ZStack {
            TrackableTheme.background.ignoresSafeArea()
            VStack(spacing: 20) {
                ZStack {
                    Circle()
                        .fill(TrackableTheme.mint.opacity(0.15))
                        .frame(width: 100, height: 100)
                    Image(systemName: "target")
                        .font(.system(size: 44, weight: .semibold))
                        .foregroundStyle(TrackableTheme.mint)
                }
                VStack(spacing: 6) {
                    Text("Trackable")
                        .font(.system(size: 34, weight: .bold, design: .rounded))
                        .foregroundStyle(TrackableTheme.ink)
                    Text("Your personal progress system")
                        .font(.subheadline.weight(.medium))
                        .foregroundStyle(TrackableTheme.secondaryInk)
                }
            }
            .scaleEffect(scaleEffect)
            .opacity(opacity)
            .onAppear {
                withAnimation(.spring(response: 0.55, dampingFraction: 0.78)) {
                    scaleEffect = 1
                    opacity = 1
                }
            }
        }
    }
}

#Preview {
    ContentView()
        .modelContainer(for: [UserProfile.self, Goal.self, GoalSnapshot.self, WidgetConfig.self, SubscriptionState.self, FocusSession.self, LocationActivitySample.self], inMemory: true)
}
