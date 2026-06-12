import Combine
import Foundation
import HealthKit
import SwiftUI

// MARK: - Metric Key

/// Identifier shared between the sample data factory and HealthKit so that
/// we can swap dummy sub-metric values for real ones after authorization.
enum HealthMetricKey: String, CaseIterable {
    // Activity & Fitness
    case steps
    case activeEnergy
    case exerciseMinutes
    case standHours
    case flightsClimbed

    // Heart & Fitness
    case restingHeartRate
    case vo2Max
    case heartRateVariability
    case bloodPressure            // systolic / diastolic combined

    // Body
    case bodyWeight

    // Sleep
    case sleepDuration
    case sleepREM
    case sleepDeep

    // Nutrition
    case dietaryEnergy
    case dietaryWater
    case dietaryProtein

    // Mind / Environment
    case mindfulMinutes
    case environmentalNoise

    // Demographics (read-only)
    case biologicalSex
    case dateOfBirth
}

// MARK: - Live Value

/// A HealthKit-sourced value for a sub-metric. The view-model merges this into
/// the existing SubMetric (keeping name + description, replacing the numbers).
struct LiveHealthValue {
    let displayValue: String
    let unit: String
    let score: Double            // 0–100
    let trend: TrendDirection
    let trendLabel: String
    let weeklyData: [DailyDataPoint]
}

// MARK: - Stats Range (Apple Health style: D / W / M / 6M / Y)

enum StatsRange: String, CaseIterable, Identifiable {
    case day, week, month, sixMonths, year

    var id: String { rawValue }

    /// Short pill label used in the segmented control.
    var shortLabel: String {
        switch self {
        case .day:       return "D"
        case .week:      return "W"
        case .month:     return "M"
        case .sixMonths: return "6M"
        case .year:      return "Y"
        }
    }

    /// Long label used in the summary caption ("THIS WEEK", "LAST 6 MONTHS"…).
    var longLabel: String {
        switch self {
        case .day:       return "Today"
        case .week:      return "This Week"
        case .month:     return "This Month"
        case .sixMonths: return "Last 6 Months"
        case .year:      return "This Year"
        }
    }

    /// Human readable calendar range printed under the headline number,
    /// for example "Apr 17–23, 2026".
    func subtitle(now: Date = Date(), calendar: Calendar = .current) -> String {
        let df = DateFormatter()
        df.locale = .current
        switch self {
        case .day:
            df.dateFormat = "EEEE, MMM d"
            return df.string(from: now)
        case .week:
            let start = calendar.date(byAdding: .day, value: -6, to: calendar.startOfDay(for: now)) ?? now
            df.dateFormat = "MMM d"
            return "\(df.string(from: start)) – \(df.string(from: now))"
        case .month:
            let start = calendar.date(byAdding: .day, value: -29, to: calendar.startOfDay(for: now)) ?? now
            df.dateFormat = "MMM d"
            return "\(df.string(from: start)) – \(df.string(from: now))"
        case .sixMonths:
            let start = calendar.date(byAdding: .month, value: -5, to: calendar.startOfDay(for: now)) ?? now
            df.dateFormat = "MMM yyyy"
            return "\(df.string(from: start)) – \(df.string(from: now))"
        case .year:
            df.dateFormat = "MMM yyyy"
            let start = calendar.date(byAdding: .month, value: -11, to: calendar.startOfDay(for: now)) ?? now
            return "\(df.string(from: start)) – \(df.string(from: now))"
        }
    }
}

/// One bar / data point in a ranged series.
struct RangePoint: Identifiable, Equatable {
    let id = UUID()
    let date: Date
    let label: String        // axis tick text
    let value: Double

    static func == (lhs: RangePoint, rhs: RangePoint) -> Bool {
        lhs.id == rhs.id
    }
}

enum RangeAggregation { case sum, average, latest }

/// Range-scoped result for a single HealthKit metric.
struct RangeSeries {
    let range: StatsRange
    let points: [RangePoint]
    let unit: String
    let aggregation: RangeAggregation
    /// Primary headline number for this range (total for cumulative, mean for
    /// discrete, latest for snapshot-style metrics such as BP).
    let summaryValue: Double
    /// "TOTAL" / "AVERAGE" / "LATEST" — the label above the big number.
    let summaryCaption: String
}

// MARK: - Manager

@MainActor
final class HealthKitManager: ObservableObject {

    enum AuthState {
        case unknown, unavailable, denied, authorized
    }

    @Published private(set) var authState: AuthState = .unknown
    @Published private(set) var lastUpdated: Date?
    @Published private(set) var isLoading: Bool = false
    @Published private(set) var values: [HealthMetricKey: LiveHealthValue] = [:]

    private let store = HKHealthStore()

    // MARK: Requested Types

    private var readQuantityIdentifiers: [HKQuantityTypeIdentifier] {
        [
            .stepCount,
            .activeEnergyBurned,
            .appleExerciseTime,
            .appleStandTime,
            .flightsClimbed,
            .restingHeartRate,
            .vo2Max,
            .heartRateVariabilitySDNN,
            .bloodPressureSystolic,
            .bloodPressureDiastolic,
            .bodyMass,
            .dietaryEnergyConsumed,
            .dietaryWater,
            .dietaryProtein,
            .environmentalAudioExposure,
        ]
    }

    private var readCategoryIdentifiers: [HKCategoryTypeIdentifier] {
        [.sleepAnalysis, .mindfulSession]
    }

    private var readCharacteristicTypes: [HKCharacteristicType] {
        [
            HKCharacteristicType.characteristicType(forIdentifier: .biologicalSex),
            HKCharacteristicType.characteristicType(forIdentifier: .dateOfBirth),
        ].compactMap { $0 }
    }

    // MARK: - Authorization

    func requestAuthorization() async {
        guard HKHealthStore.isHealthDataAvailable() else {
            authState = .unavailable
            return
        }

        var readTypes = Set<HKObjectType>()

        for id in readQuantityIdentifiers {
            if let t = HKQuantityType.quantityType(forIdentifier: id) {
                readTypes.insert(t)
            }
        }
        for id in readCategoryIdentifiers {
            if let t = HKCategoryType.categoryType(forIdentifier: id) {
                readTypes.insert(t)
            }
        }
        readCharacteristicTypes.forEach { readTypes.insert($0) }

        do {
            try await store.requestAuthorization(toShare: [], read: readTypes)
            authState = .authorized
            await refresh()
        } catch {
            authState = .denied
        }
    }

    // MARK: - Public refresh

    func refresh() async {
        guard HKHealthStore.isHealthDataAvailable() else { return }
        isLoading = true
        defer { isLoading = false }

        var out: [HealthMetricKey: LiveHealthValue] = [:]

        // Activity
        if let v = await cumulativeTodayAndWeek(.stepCount, unit: .count()) {
            out[.steps] = format(.steps, value: v.today, week: v.week, unit: "steps", decimals: 0, goal: 10_000, higherIsBetter: true)
        }
        if let v = await cumulativeTodayAndWeek(.activeEnergyBurned, unit: .kilocalorie()) {
            out[.activeEnergy] = format(.activeEnergy, value: v.today, week: v.week, unit: "kcal", decimals: 0, goal: 600, higherIsBetter: true)
        }
        if let v = await cumulativeTodayAndWeek(.appleExerciseTime, unit: .minute()) {
            out[.exerciseMinutes] = format(.exerciseMinutes, value: v.today, week: v.week, unit: "min", decimals: 0, goal: 30, higherIsBetter: true)
        }
        if let v = await cumulativeTodayAndWeek(.appleStandTime, unit: .hour()) {
            out[.standHours] = format(.standHours, value: v.today, week: v.week, unit: "hrs", decimals: 0, goal: 12, higherIsBetter: true)
        }
        if let v = await cumulativeTodayAndWeek(.flightsClimbed, unit: .count()) {
            out[.flightsClimbed] = format(.flightsClimbed, value: v.today, week: v.week, unit: "floors", decimals: 0, goal: 10, higherIsBetter: true)
        }

        // Heart
        if let v = await averageTodayAndWeek(.restingHeartRate, unit: HKUnit.count().unitDivided(by: .minute())) {
            out[.restingHeartRate] = scoreRestingHR(today: v.today, week: v.week)
        }
        if let v = await averageTodayAndWeek(.vo2Max, unit: HKUnit(from: "mL/kg*min")) {
            out[.vo2Max] = scoreVO2(today: v.today, week: v.week)
        }
        if let v = await averageTodayAndWeek(.heartRateVariabilitySDNN, unit: .secondUnit(with: .milli)) {
            out[.heartRateVariability] = scoreHRV(today: v.today, week: v.week)
        }

        // Blood Pressure (latest reading — systolic + diastolic)
        if let bp = await latestBloodPressure() {
            out[.bloodPressure] = scoreBloodPressure(systolic: bp.systolic, diastolic: bp.diastolic)
        }

        // Body
        if let v = await averageTodayAndWeek(.bodyMass, unit: .gramUnit(with: .kilo)) {
            out[.bodyWeight] = format(.bodyWeight, value: v.today, week: v.week, unit: "kg", decimals: 1, goal: nil, higherIsBetter: false)
        }

        // Sleep
        if let sleep = await fetchLastNightSleep() {
            out[.sleepDuration] = scoreSleepDuration(hours: sleep.totalHours, week: sleep.weekHours)
            if let rem = sleep.remHours {
                let remPct = sleep.totalHours > 0 ? (rem / sleep.totalHours) * 100 : 0
                out[.sleepREM] = scoreSleepPhase(
                    key: .sleepREM,
                    percent: remPct,
                    weekPercent: sleep.weekRemPct,
                    targetRange: 20...25,
                    label: "of total sleep"
                )
            }
            if let deep = sleep.deepHours {
                let deepPct = sleep.totalHours > 0 ? (deep / sleep.totalHours) * 100 : 0
                out[.sleepDeep] = scoreSleepPhase(
                    key: .sleepDeep,
                    percent: deepPct,
                    weekPercent: sleep.weekDeepPct,
                    targetRange: 15...25,
                    label: "of total sleep"
                )
            }
        }

        // Nutrition
        if let v = await cumulativeTodayAndWeek(.dietaryEnergyConsumed, unit: .kilocalorie()) {
            out[.dietaryEnergy] = format(.dietaryEnergy, value: v.today, week: v.week, unit: "kcal", decimals: 0, goal: 2_000, higherIsBetter: true)
        }
        if let v = await cumulativeTodayAndWeek(.dietaryWater, unit: .literUnit(with: .none)) {
            out[.dietaryWater] = scoreWater(liters: v.today, week: v.week)
        }
        if let v = await cumulativeTodayAndWeek(.dietaryProtein, unit: .gram()) {
            out[.dietaryProtein] = format(.dietaryProtein, value: v.today, week: v.week, unit: "g", decimals: 0, goal: 100, higherIsBetter: true)
        }

        // Mindful
        if let mindful = await mindfulMinutesWeek() {
            out[.mindfulMinutes] = format(.mindfulMinutes, value: mindful.today, week: mindful.week, unit: "min", decimals: 0, goal: 10, higherIsBetter: true)
        }

        // Environment – Noise (dB average today)
        if let v = await averageTodayAndWeek(.environmentalAudioExposure, unit: .decibelAWeightedSoundPressureLevel()) {
            out[.environmentalNoise] = scoreNoise(today: v.today, week: v.week)
        }

        values = out
        lastUpdated = Date()
    }

    // MARK: - Characteristics

    /// "male", "female", or nil if unavailable / not set.
    func biologicalSexString() -> String? {
        do {
            let sex = try store.biologicalSex().biologicalSex
            switch sex {
            case .male:   return "male"
            case .female: return "female"
            default:      return nil
            }
        } catch {
            return nil
        }
    }

    /// Age in years calculated from the user's date of birth in Health.
    func ageYears() -> Int? {
        do {
            let components = try store.dateOfBirthComponents()
            guard let birthDate = Calendar.current.date(from: components) else { return nil }
            let years = Calendar.current.dateComponents([.year], from: birthDate, to: Date()).year
            return years
        } catch {
            return nil
        }
    }

    // MARK: - Statistics queries

    private struct DailySeries { let today: Double; let week: [Double] }

    private func cumulativeTodayAndWeek(_ id: HKQuantityTypeIdentifier, unit: HKUnit) async -> DailySeries? {
        await statistics(id: id, unit: unit, options: .cumulativeSum)
    }

    private func averageTodayAndWeek(_ id: HKQuantityTypeIdentifier, unit: HKUnit) async -> DailySeries? {
        await statistics(id: id, unit: unit, options: .discreteAverage)
    }

    private func statistics(id: HKQuantityTypeIdentifier, unit: HKUnit, options: HKStatisticsOptions) async -> DailySeries? {
        guard let type = HKQuantityType.quantityType(forIdentifier: id) else { return nil }
        let series = await sevenDaySeries(for: type, unit: unit, options: options)
        guard let last = series.last else { return nil }
        return DailySeries(today: last, week: series)
    }

    private func sevenDaySeries(for type: HKQuantityType, unit: HKUnit, options: HKStatisticsOptions) async -> [Double] {
        await withCheckedContinuation { continuation in
            let cal = Calendar.current
            let endOfToday = cal.startOfDay(for: Date()).addingTimeInterval(24 * 60 * 60)
            guard let start = cal.date(byAdding: .day, value: -6, to: cal.startOfDay(for: Date())) else {
                continuation.resume(returning: [])
                return
            }
            var interval = DateComponents(); interval.day = 1

            let query = HKStatisticsCollectionQuery(
                quantityType: type,
                quantitySamplePredicate: HKQuery.predicateForSamples(withStart: start, end: endOfToday),
                options: options,
                anchorDate: start,
                intervalComponents: interval
            )
            query.initialResultsHandler = { _, collection, _ in
                var points: [Double] = []
                collection?.enumerateStatistics(from: start, to: endOfToday) { stats, _ in
                    let q: HKQuantity?
                    if options == .cumulativeSum { q = stats.sumQuantity() }
                    else { q = stats.averageQuantity() }
                    points.append(q?.doubleValue(for: unit) ?? 0)
                }
                continuation.resume(returning: points)
            }
            store.execute(query)
        }
    }

    // MARK: - Blood Pressure (latest sample)

    private struct BPReading { let systolic: Double; let diastolic: Double }

    private func latestBloodPressure() async -> BPReading? {
        guard
            let sysType = HKQuantityType.quantityType(forIdentifier: .bloodPressureSystolic),
            let diaType = HKQuantityType.quantityType(forIdentifier: .bloodPressureDiastolic)
        else { return nil }

        async let sys = latestQuantity(for: sysType, unit: .millimeterOfMercury())
        async let dia = latestQuantity(for: diaType, unit: .millimeterOfMercury())

        guard let s = await sys, let d = await dia else { return nil }
        return BPReading(systolic: s, diastolic: d)
    }

    private func latestQuantity(for type: HKQuantityType, unit: HKUnit) async -> Double? {
        await withCheckedContinuation { continuation in
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: false)
            let query = HKSampleQuery(sampleType: type, predicate: nil, limit: 1, sortDescriptors: [sort]) { _, samples, _ in
                let value = (samples?.first as? HKQuantitySample)?.quantity.doubleValue(for: unit)
                continuation.resume(returning: value)
            }
            store.execute(query)
        }
    }

    // MARK: - Sleep

    private struct SleepSummary {
        let totalHours: Double
        let remHours: Double?
        let deepHours: Double?
        let weekHours: [Double]
        let weekRemPct: [Double]
        let weekDeepPct: [Double]
    }

    private func fetchLastNightSleep() async -> SleepSummary? {
        guard let type = HKCategoryType.categoryType(forIdentifier: .sleepAnalysis) else { return nil }
        let cal = Calendar.current
        // Use 8 nights to build 7-day trend (we anchor each "night" to wake-day).
        guard let start = cal.date(byAdding: .day, value: -7, to: cal.startOfDay(for: Date())) else { return nil }
        let end = cal.startOfDay(for: Date()).addingTimeInterval(24 * 60 * 60)

        let samples: [HKCategorySample] = await withCheckedContinuation { continuation in
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)
            let query = HKSampleQuery(
                sampleType: type,
                predicate: HKQuery.predicateForSamples(withStart: start, end: end),
                limit: HKObjectQueryNoLimit,
                sortDescriptors: [sort]
            ) { _, samples, _ in
                continuation.resume(returning: (samples as? [HKCategorySample]) ?? [])
            }
            store.execute(query)
        }

        guard !samples.isEmpty else { return nil }

        // Aggregate per wake-day (startOfDay of sample.endDate).
        struct DayBuckets { var total: TimeInterval = 0; var rem: TimeInterval = 0; var deep: TimeInterval = 0 }
        var days: [Date: DayBuckets] = [:]

        for s in samples {
            let key = cal.startOfDay(for: s.endDate)
            let duration = s.endDate.timeIntervalSince(s.startDate)
            var bucket = days[key] ?? DayBuckets()
            switch HKCategoryValueSleepAnalysis(rawValue: s.value) {
            case .asleepREM:
                bucket.rem += duration
                bucket.total += duration
            case .asleepDeep:
                bucket.deep += duration
                bucket.total += duration
            case .asleepCore, .asleepUnspecified, .asleep:
                bucket.total += duration
            default:
                break
            }
            days[key] = bucket
        }

        // Build 7-day series anchored on today — fill missing days with 0.
        var weekHours: [Double] = []
        var weekRemPct: [Double] = []
        var weekDeepPct: [Double] = []
        for offset in (0..<7).reversed() {
            if let day = cal.date(byAdding: .day, value: -offset, to: cal.startOfDay(for: Date())) {
                let b = days[day] ?? DayBuckets()
                let totalHours = b.total / 3600
                weekHours.append(totalHours)
                weekRemPct.append(totalHours > 0 ? (b.rem / b.total) * 100 : 0)
                weekDeepPct.append(totalHours > 0 ? (b.deep / b.total) * 100 : 0)
            }
        }

        let today = days[cal.startOfDay(for: Date())] ?? DayBuckets()
        let totalHoursToday = today.total / 3600

        return SleepSummary(
            totalHours: totalHoursToday > 0 ? totalHoursToday : (weekHours.last ?? 0),
            remHours: today.rem > 0 ? today.rem / 3600 : nil,
            deepHours: today.deep > 0 ? today.deep / 3600 : nil,
            weekHours: weekHours,
            weekRemPct: weekRemPct,
            weekDeepPct: weekDeepPct
        )
    }

    // MARK: - Mindful minutes

    private func mindfulMinutesWeek() async -> DailySeries? {
        guard let type = HKCategoryType.categoryType(forIdentifier: .mindfulSession) else { return nil }
        let cal = Calendar.current
        guard let start = cal.date(byAdding: .day, value: -6, to: cal.startOfDay(for: Date())) else { return nil }
        let end = cal.startOfDay(for: Date()).addingTimeInterval(24 * 60 * 60)

        let samples: [HKCategorySample] = await withCheckedContinuation { continuation in
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)
            let query = HKSampleQuery(
                sampleType: type,
                predicate: HKQuery.predicateForSamples(withStart: start, end: end),
                limit: HKObjectQueryNoLimit,
                sortDescriptors: [sort]
            ) { _, samples, _ in
                continuation.resume(returning: (samples as? [HKCategorySample]) ?? [])
            }
            store.execute(query)
        }

        var perDay: [Date: Double] = [:]
        for s in samples {
            let key = cal.startOfDay(for: s.startDate)
            perDay[key, default: 0] += s.endDate.timeIntervalSince(s.startDate) / 60
        }

        var week: [Double] = []
        for offset in (0..<7).reversed() {
            if let day = cal.date(byAdding: .day, value: -offset, to: cal.startOfDay(for: Date())) {
                week.append(perDay[day] ?? 0)
            }
        }
        return DailySeries(today: week.last ?? 0, week: week)
    }

    // MARK: - Scoring

    private func trendDirection(_ week: [Double], higherIsBetter: Bool) -> TrendDirection {
        guard week.count >= 2 else { return .stable }
        let first = week.first ?? 0
        let last = week.last ?? 0
        let delta = last - first
        if abs(delta) < 0.001 { return .stable }
        if higherIsBetter {
            return delta > 0 ? .up : .down
        } else {
            return delta > 0 ? .up : .down
        }
    }

    private func weeklyPoints(_ week: [Double]) -> [DailyDataPoint] {
        let days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
        let padded = week.suffix(7)
        return zip(days.suffix(padded.count), padded).map { DailyDataPoint(day: $0.0, value: $0.1) }
    }

    private func format(
        _ key: HealthMetricKey,
        value: Double,
        week: [Double],
        unit: String,
        decimals: Int,
        goal: Double?,
        higherIsBetter: Bool
    ) -> LiveHealthValue {
        let fmt = "%.\(decimals)f"
        let display = value >= 1_000
            ? formatted(value, separator: true)
            : String(format: fmt, value)

        let score: Double = {
            guard let goal, goal > 0 else { return 70 }
            if higherIsBetter {
                return min(max(value / goal * 100, 0), 100)
            } else {
                return min(max((goal / max(value, 0.001)) * 100, 0), 100)
            }
        }()

        let trend = trendDirection(week, higherIsBetter: higherIsBetter)
        let label = weekLabel(week: week, unit: unit, decimals: decimals)

        return LiveHealthValue(
            displayValue: display,
            unit: unit,
            score: score,
            trend: trend,
            trendLabel: label,
            weeklyData: weeklyPoints(week)
        )
    }

    private func formatted(_ value: Double, separator: Bool) -> String {
        let f = NumberFormatter()
        f.numberStyle = .decimal
        f.maximumFractionDigits = 0
        f.groupingSeparator = ","
        return f.string(from: NSNumber(value: value)) ?? "\(Int(value))"
    }

    private func weekLabel(week: [Double], unit: String, decimals: Int) -> String {
        guard week.count >= 2 else { return "7-day avg" }
        let avg = (week.dropLast().reduce(0, +)) / Double(max(week.count - 1, 1))
        let today = week.last ?? 0
        let delta = today - avg
        let sign = delta >= 0 ? "+" : "−"
        return "\(sign)\(String(format: "%.\(decimals)f", abs(delta))) vs avg"
    }

    // Specific scoring helpers ------------------------------------------------

    private func scoreRestingHR(today: Double, week: [Double]) -> LiveHealthValue {
        let score: Double
        switch today {
        case ..<50:   score = 95
        case 50..<60: score = 90
        case 60..<70: score = 80
        case 70..<80: score = 65
        case 80..<90: score = 50
        default:      score = 35
        }
        return LiveHealthValue(
            displayValue: String(format: "%.0f", today),
            unit: "bpm",
            score: score,
            trend: trendDirection(week, higherIsBetter: false),
            trendLabel: today < 70 ? "Efficient" : "Trending high",
            weeklyData: weeklyPoints(week)
        )
    }

    private func scoreVO2(today: Double, week: [Double]) -> LiveHealthValue {
        let score: Double
        switch today {
        case 50...: score = 95
        case 42..<50: score = 85
        case 35..<42: score = 72
        case 28..<35: score = 60
        default: score = 45
        }
        return LiveHealthValue(
            displayValue: String(format: "%.1f", today),
            unit: "ml/kg/min",
            score: score,
            trend: trendDirection(week, higherIsBetter: true),
            trendLabel: today >= 42 ? "Above age norm" : "Below age norm",
            weeklyData: weeklyPoints(week)
        )
    }

    private func scoreHRV(today: Double, week: [Double]) -> LiveHealthValue {
        let score: Double
        switch today {
        case 80...: score = 92
        case 60..<80: score = 82
        case 40..<60: score = 70
        case 25..<40: score = 55
        default: score = 40
        }
        return LiveHealthValue(
            displayValue: String(format: "%.0f", today),
            unit: "ms",
            score: score,
            trend: trendDirection(week, higherIsBetter: true),
            trendLabel: "7-day avg",
            weeklyData: weeklyPoints(week)
        )
    }

    private func scoreBloodPressure(systolic: Double, diastolic: Double) -> LiveHealthValue {
        let score: Double
        switch (systolic, diastolic) {
        case (..<120, ..<80):   score = 92      // Optimal
        case (120..<130, ..<80): score = 80     // Elevated
        case (130..<140, _), (_, 80..<90): score = 65  // Stage 1
        case (140..<160, _), (_, 90..<100): score = 45 // Stage 2
        case (160..., _), (_, 100...): score = 25
        default: score = 70
        }
        return LiveHealthValue(
            displayValue: "\(Int(systolic))/\(Int(diastolic))",
            unit: "mmHg",
            score: score,
            trend: .stable,
            trendLabel: systolic < 120 ? "Optimal range" : "Monitor",
            weeklyData: []
        )
    }

    private func scoreSleepDuration(hours: Double, week: [Double]) -> LiveHealthValue {
        let score: Double
        switch hours {
        case 7..<9: score = 90
        case 6..<7, 9..<10: score = 72
        case 5..<6, 10..<11: score = 55
        default: score = 40
        }
        return LiveHealthValue(
            displayValue: String(format: "%.1f", hours),
            unit: "hrs",
            score: score,
            trend: trendDirection(week, higherIsBetter: true),
            trendLabel: "7-night avg",
            weeklyData: weeklyPoints(week)
        )
    }

    private func scoreSleepPhase(
        key: HealthMetricKey,
        percent: Double,
        weekPercent: [Double],
        targetRange: ClosedRange<Double>,
        label: String
    ) -> LiveHealthValue {
        let score: Double
        if targetRange.contains(percent) {
            score = 88
        } else {
            let distance = min(abs(percent - targetRange.lowerBound), abs(percent - targetRange.upperBound))
            score = max(40, 88 - distance * 4)
        }
        return LiveHealthValue(
            displayValue: String(format: "%.0f", percent),
            unit: "%",
            score: score,
            trend: trendDirection(weekPercent, higherIsBetter: true),
            trendLabel: label,
            weeklyData: weeklyPoints(weekPercent)
        )
    }

    private func scoreWater(liters: Double, week: [Double]) -> LiveHealthValue {
        let target = 2.5
        let score = min(max(liters / target * 100, 0), 100)
        return LiveHealthValue(
            displayValue: String(format: "%.1f", liters),
            unit: "/ 2.5 L",
            score: score,
            trend: trendDirection(week, higherIsBetter: true),
            trendLabel: liters >= target ? "Goal met" : "Keep drinking",
            weeklyData: weeklyPoints(week)
        )
    }

    private func scoreNoise(today: Double, week: [Double]) -> LiveHealthValue {
        let score: Double
        switch today {
        case ..<55: score = 90
        case 55..<70: score = 75
        case 70..<85: score = 55
        default: score = 35
        }
        return LiveHealthValue(
            displayValue: String(format: "%.0f", today),
            unit: "dB",
            score: score,
            trend: trendDirection(week, higherIsBetter: false),
            trendLabel: today < 70 ? "Safe range" : "High exposure",
            weeklyData: weeklyPoints(week)
        )
    }

    // MARK: - Ranged Series (Apple Health style)
    //
    // `fetchSeries(for:range:)` is the single entry point used by the detail
    // view's chart. It maps a `HealthMetricKey` to the correct HKQuantityType
    // (or category type) and returns a `RangeSeries` with buckets sized for
    // the requested range:
    //
    //   .day       → 24 hourly buckets (today, midnight → now)
    //   .week      → 7 daily buckets   (last 7 days inclusive)
    //   .month     → 30 daily buckets  (last 30 days inclusive)
    //   .sixMonths → 26 weekly buckets
    //   .year      → 12 monthly buckets
    //
    // The summary number mirrors Apple Health semantics:
    //   • Cumulative metrics (steps, calories, water, minutes)  → TOTAL/AVG
    //   • Discrete metrics    (HR, HRV, VO₂, weight, noise)     → AVERAGE
    //   • Snapshot metrics    (blood pressure)                   → LATEST

    private struct MetricSpec {
        let quantityId:  HKQuantityTypeIdentifier
        let unit:        HKUnit
        let displayUnit: String
        let options:     HKStatisticsOptions   // .cumulativeSum | .discreteAverage
    }

    private func spec(for key: HealthMetricKey) -> MetricSpec? {
        switch key {
        case .steps:
            return .init(quantityId: .stepCount, unit: .count(),
                         displayUnit: "steps", options: .cumulativeSum)
        case .activeEnergy:
            return .init(quantityId: .activeEnergyBurned, unit: .kilocalorie(),
                         displayUnit: "kcal", options: .cumulativeSum)
        case .exerciseMinutes:
            return .init(quantityId: .appleExerciseTime, unit: .minute(),
                         displayUnit: "min", options: .cumulativeSum)
        case .standHours:
            return .init(quantityId: .appleStandTime, unit: .hour(),
                         displayUnit: "hrs", options: .cumulativeSum)
        case .flightsClimbed:
            return .init(quantityId: .flightsClimbed, unit: .count(),
                         displayUnit: "floors", options: .cumulativeSum)
        case .restingHeartRate:
            return .init(quantityId: .restingHeartRate,
                         unit: HKUnit.count().unitDivided(by: .minute()),
                         displayUnit: "bpm", options: .discreteAverage)
        case .vo2Max:
            return .init(quantityId: .vo2Max, unit: HKUnit(from: "mL/kg*min"),
                         displayUnit: "ml/kg/min", options: .discreteAverage)
        case .heartRateVariability:
            return .init(quantityId: .heartRateVariabilitySDNN,
                         unit: .secondUnit(with: .milli),
                         displayUnit: "ms", options: .discreteAverage)
        case .bodyWeight:
            return .init(quantityId: .bodyMass, unit: .gramUnit(with: .kilo),
                         displayUnit: "kg", options: .discreteAverage)
        case .dietaryEnergy:
            return .init(quantityId: .dietaryEnergyConsumed, unit: .kilocalorie(),
                         displayUnit: "kcal", options: .cumulativeSum)
        case .dietaryWater:
            return .init(quantityId: .dietaryWater, unit: .literUnit(with: .none),
                         displayUnit: "L", options: .cumulativeSum)
        case .dietaryProtein:
            return .init(quantityId: .dietaryProtein, unit: .gram(),
                         displayUnit: "g", options: .cumulativeSum)
        case .environmentalNoise:
            return .init(quantityId: .environmentalAudioExposure,
                         unit: .decibelAWeightedSoundPressureLevel(),
                         displayUnit: "dB", options: .discreteAverage)
        // Non-quantity / special-case metrics are handled separately.
        case .sleepDuration, .sleepREM, .sleepDeep,
             .mindfulMinutes, .bloodPressure,
             .biologicalSex, .dateOfBirth:
            return nil
        }
    }

    /// Public entry point for the ranged chart.
    func fetchSeries(for key: HealthMetricKey, range: StatsRange) async -> RangeSeries? {
        // Sleep and mindful use category samples — handle them first.
        switch key {
        case .sleepDuration:
            return await sleepSeries(range: range, component: .total)
        case .sleepREM:
            return await sleepSeries(range: range, component: .rem)
        case .sleepDeep:
            return await sleepSeries(range: range, component: .deep)
        case .mindfulMinutes:
            return await mindfulSeries(range: range)
        case .bloodPressure:
            return await bloodPressureSeries(range: range)
        default:
            break
        }

        guard let spec = spec(for: key),
              let type = HKQuantityType.quantityType(forIdentifier: spec.quantityId) else {
            return nil
        }

        let buckets = await runStatsCollection(
            type: type,
            unit: spec.unit,
            options: spec.options,
            range: range
        )

        return buildSeries(
            range: range,
            buckets: buckets,
            unit: spec.displayUnit,
            aggregation: spec.options == .cumulativeSum ? .sum : .average
        )
    }

    // MARK: - Range → interval helpers

    private struct RangeWindow {
        let start: Date
        let end: Date
        let interval: DateComponents
        let bucketCount: Int
    }

    private func window(for range: StatsRange, now: Date = Date()) -> RangeWindow {
        let cal = Calendar.current
        let startOfToday = cal.startOfDay(for: now)

        switch range {
        case .day:
            let end = cal.date(byAdding: .day, value: 1, to: startOfToday) ?? now
            var interval = DateComponents(); interval.hour = 1
            return RangeWindow(start: startOfToday, end: end, interval: interval, bucketCount: 24)

        case .week:
            let start = cal.date(byAdding: .day, value: -6, to: startOfToday) ?? startOfToday
            let end = cal.date(byAdding: .day, value: 1, to: startOfToday) ?? now
            var interval = DateComponents(); interval.day = 1
            return RangeWindow(start: start, end: end, interval: interval, bucketCount: 7)

        case .month:
            let start = cal.date(byAdding: .day, value: -29, to: startOfToday) ?? startOfToday
            let end = cal.date(byAdding: .day, value: 1, to: startOfToday) ?? now
            var interval = DateComponents(); interval.day = 1
            return RangeWindow(start: start, end: end, interval: interval, bucketCount: 30)

        case .sixMonths:
            // 26 weeks anchored on the start of the current week.
            let weekday = cal.component(.weekday, from: startOfToday)
            let daysFromWeekStart = (weekday - cal.firstWeekday + 7) % 7
            let weekStart = cal.date(byAdding: .day, value: -daysFromWeekStart, to: startOfToday) ?? startOfToday
            let start = cal.date(byAdding: .weekOfYear, value: -25, to: weekStart) ?? weekStart
            let end = cal.date(byAdding: .weekOfYear, value: 1, to: weekStart) ?? now
            var interval = DateComponents(); interval.weekOfYear = 1
            return RangeWindow(start: start, end: end, interval: interval, bucketCount: 26)

        case .year:
            // 12 months anchored on the first day of the current month.
            let comps = cal.dateComponents([.year, .month], from: now)
            let monthStart = cal.date(from: comps) ?? startOfToday
            let start = cal.date(byAdding: .month, value: -11, to: monthStart) ?? monthStart
            let end = cal.date(byAdding: .month, value: 1, to: monthStart) ?? now
            var interval = DateComponents(); interval.month = 1
            return RangeWindow(start: start, end: end, interval: interval, bucketCount: 12)
        }
    }

    /// `Calendar.date(byAdding: DateComponents, to:)` does not take a
    /// multiplier, so we scale the interval's single active unit by `idx`
    /// before adding. This lets category-sample fetchers iterate bucket
    /// starts uniformly across ranges (hour, day, week, month).
    private func bucketStart(idx: Int, interval: DateComponents, anchor: Date, calendar: Calendar) -> Date? {
        var scaled = DateComponents()
        if let h = interval.hour         { scaled.hour        = h * idx }
        if let d = interval.day          { scaled.day         = d * idx }
        if let w = interval.weekOfYear   { scaled.weekOfYear  = w * idx }
        if let m = interval.month        { scaled.month       = m * idx }
        return calendar.date(byAdding: scaled, to: anchor)
    }

    /// Collected bucket result from an HKStatisticsCollectionQuery.
    private struct Bucket { let start: Date; let value: Double }

    private func runStatsCollection(
        type: HKQuantityType,
        unit: HKUnit,
        options: HKStatisticsOptions,
        range: StatsRange
    ) async -> [Bucket] {
        let win = window(for: range)

        return await withCheckedContinuation { continuation in
            let query = HKStatisticsCollectionQuery(
                quantityType: type,
                quantitySamplePredicate: HKQuery.predicateForSamples(withStart: win.start, end: win.end),
                options: options,
                anchorDate: win.start,
                intervalComponents: win.interval
            )
            query.initialResultsHandler = { _, collection, _ in
                var out: [Bucket] = []
                collection?.enumerateStatistics(from: win.start, to: win.end) { stats, _ in
                    let q: HKQuantity?
                    if options == .cumulativeSum { q = stats.sumQuantity() }
                    else { q = stats.averageQuantity() }
                    out.append(Bucket(start: stats.startDate,
                                      value: q?.doubleValue(for: unit) ?? 0))
                }
                continuation.resume(returning: out)
            }
            store.execute(query)
        }
    }

    private func buildSeries(
        range: StatsRange,
        buckets: [Bucket],
        unit: String,
        aggregation: RangeAggregation
    ) -> RangeSeries {
        let points = buckets.map { b in
            RangePoint(date: b.start, label: axisLabel(for: b.start, range: range), value: b.value)
        }

        let nonZero = points.map(\.value).filter { $0 > 0 }
        let summary: Double
        let caption: String
        switch aggregation {
        case .sum:
            summary = points.map(\.value).reduce(0, +)
            caption = range == .day ? "TOTAL TODAY" : "TOTAL"
        case .average:
            summary = nonZero.isEmpty ? 0 : nonZero.reduce(0, +) / Double(nonZero.count)
            caption = "AVERAGE"
        case .latest:
            summary = points.last?.value ?? 0
            caption = "LATEST"
        }

        return RangeSeries(
            range: range,
            points: points,
            unit: unit,
            aggregation: aggregation,
            summaryValue: summary,
            summaryCaption: caption
        )
    }

    private func axisLabel(for date: Date, range: StatsRange) -> String {
        let df = DateFormatter()
        df.locale = .current
        switch range {
        case .day:       df.dateFormat = "H"
        case .week:      df.dateFormat = "EEEEE"       // single-letter weekday
        case .month:     df.dateFormat = "d"
        case .sixMonths: df.dateFormat = "MMM d"
        case .year:      df.dateFormat = "MMM"
        }
        return df.string(from: date)
    }

    // MARK: - Sleep (category samples, bucketed into the requested range)

    private enum SleepComponent { case total, rem, deep }

    private func sleepSeries(range: StatsRange, component: SleepComponent) async -> RangeSeries? {
        // Day range for sleep just shows "last night" as a single bar.
        let win = window(for: range)
        guard let type = HKCategoryType.categoryType(forIdentifier: .sleepAnalysis) else { return nil }

        let samples: [HKCategorySample] = await withCheckedContinuation { continuation in
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)
            let query = HKSampleQuery(
                sampleType: type,
                predicate: HKQuery.predicateForSamples(withStart: win.start, end: win.end),
                limit: HKObjectQueryNoLimit,
                sortDescriptors: [sort]
            ) { _, samples, _ in
                continuation.resume(returning: (samples as? [HKCategorySample]) ?? [])
            }
            store.execute(query)
        }

        // Aggregate per wake-day.
        let cal = Calendar.current
        struct DayBucket { var total: TimeInterval = 0; var rem: TimeInterval = 0; var deep: TimeInterval = 0 }
        var perDay: [Date: DayBucket] = [:]
        for s in samples {
            let dayKey = cal.startOfDay(for: s.endDate)
            let dur = s.endDate.timeIntervalSince(s.startDate)
            var bucket = perDay[dayKey] ?? DayBucket()
            switch HKCategoryValueSleepAnalysis(rawValue: s.value) {
            case .asleepREM:        bucket.rem += dur;  bucket.total += dur
            case .asleepDeep:       bucket.deep += dur; bucket.total += dur
            case .asleepCore, .asleepUnspecified, .asleep: bucket.total += dur
            default: break
            }
            perDay[dayKey] = bucket
        }

        // Reduce per-day buckets into the same bucket grid as the range window.
        var points: [RangePoint] = []
        for idx in 0..<win.bucketCount {
            guard let bStart = bucketStart(idx: idx, interval: win.interval, anchor: win.start, calendar: cal),
                  let bEnd   = bucketStart(idx: idx + 1, interval: win.interval, anchor: win.start, calendar: cal)
            else { continue }

            var aggSec: TimeInterval = 0
            var nights = 0
            for (day, b) in perDay where day >= bStart && day < bEnd {
                let secs: TimeInterval
                switch component {
                case .total: secs = b.total
                case .rem:   secs = b.rem
                case .deep:  secs = b.deep
                }
                if secs > 0 { aggSec += secs; nights += 1 }
            }

            let value: Double
            if range == .day || range == .week || range == .month {
                // Per-night hours (daily grid)
                value = aggSec / 3600
            } else {
                // Weekly / monthly bucket → average hours per night
                value = nights > 0 ? (aggSec / 3600) / Double(nights) : 0
            }

            points.append(RangePoint(date: bStart,
                                     label: axisLabel(for: bStart, range: range),
                                     value: value))
        }

        let nonZero: [Double] = points.map { $0.value }.filter { $0 > 0 }
        let avg = nonZero.isEmpty ? 0 : nonZero.reduce(0, +) / Double(nonZero.count)
        return RangeSeries(
            range: range,
            points: points,
            unit: "hrs",
            aggregation: .average,
            summaryValue: avg,
            summaryCaption: range == .day ? "LAST NIGHT" : "AVERAGE / NIGHT"
        )
    }

    // MARK: - Mindful minutes bucketed into the range

    private func mindfulSeries(range: StatsRange) async -> RangeSeries? {
        let win = window(for: range)
        guard let type = HKCategoryType.categoryType(forIdentifier: .mindfulSession) else { return nil }

        let samples: [HKCategorySample] = await withCheckedContinuation { continuation in
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)
            let query = HKSampleQuery(
                sampleType: type,
                predicate: HKQuery.predicateForSamples(withStart: win.start, end: win.end),
                limit: HKObjectQueryNoLimit,
                sortDescriptors: [sort]
            ) { _, samples, _ in
                continuation.resume(returning: (samples as? [HKCategorySample]) ?? [])
            }
            store.execute(query)
        }

        let cal = Calendar.current
        var points: [RangePoint] = []
        for idx in 0..<win.bucketCount {
            guard let bStart = bucketStart(idx: idx, interval: win.interval, anchor: win.start, calendar: cal),
                  let bEnd   = bucketStart(idx: idx + 1, interval: win.interval, anchor: win.start, calendar: cal)
            else { continue }

            let minutes = samples
                .filter { $0.startDate >= bStart && $0.startDate < bEnd }
                .reduce(0.0) { $0 + $1.endDate.timeIntervalSince($1.startDate) / 60 }

            points.append(RangePoint(date: bStart,
                                     label: axisLabel(for: bStart, range: range),
                                     value: minutes))
        }

        return buildSeries(range: range,
                           buckets: points.map { Bucket(start: $0.date, value: $0.value) },
                           unit: "min", aggregation: .sum)
    }

    // MARK: - Blood pressure (latest reading; bucket by sample end date)

    private func bloodPressureSeries(range: StatsRange) async -> RangeSeries? {
        let win = window(for: range)
        guard
            let sysType = HKQuantityType.quantityType(forIdentifier: .bloodPressureSystolic)
        else { return nil }

        let samples: [HKQuantitySample] = await withCheckedContinuation { continuation in
            let sort = NSSortDescriptor(key: HKSampleSortIdentifierEndDate, ascending: true)
            let query = HKSampleQuery(
                sampleType: sysType,
                predicate: HKQuery.predicateForSamples(withStart: win.start, end: win.end),
                limit: HKObjectQueryNoLimit,
                sortDescriptors: [sort]
            ) { _, samples, _ in
                continuation.resume(returning: (samples as? [HKQuantitySample]) ?? [])
            }
            store.execute(query)
        }

        let cal = Calendar.current
        var points: [RangePoint] = []
        for idx in 0..<win.bucketCount {
            guard let bStart = bucketStart(idx: idx, interval: win.interval, anchor: win.start, calendar: cal),
                  let bEnd   = bucketStart(idx: idx + 1, interval: win.interval, anchor: win.start, calendar: cal)
            else { continue }

            let values = samples
                .filter { $0.endDate >= bStart && $0.endDate < bEnd }
                .map { $0.quantity.doubleValue(for: .millimeterOfMercury()) }

            let avg = values.isEmpty ? 0 : values.reduce(0, +) / Double(values.count)
            points.append(RangePoint(date: bStart,
                                     label: axisLabel(for: bStart, range: range),
                                     value: avg))
        }

        let nonZero: [Double] = points.map { $0.value }.filter { $0 > 0 }
        let avg = nonZero.isEmpty ? 0 : nonZero.reduce(0, +) / Double(nonZero.count)
        return RangeSeries(
            range: range,
            points: points,
            unit: "mmHg",
            aggregation: .average,
            summaryValue: avg,
            summaryCaption: "AVERAGE SYSTOLIC"
        )
    }
}
