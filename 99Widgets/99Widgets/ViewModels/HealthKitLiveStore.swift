//
//  HealthKitLiveStore.swift
//  99Widgets
//

import Foundation
import HealthKit

final class HealthKitLiveStore {
    private let store = HKHealthStore()

    func requestAuthorization() async throws {
        guard HKHealthStore.isHealthDataAvailable() else { return }
        let readSamples: [HKSampleType] = [
            HKQuantityType.quantityType(forIdentifier: .stepCount),
            HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned),
            HKQuantityType.quantityType(forIdentifier: .heartRate),
            HKQuantityType.quantityType(forIdentifier: .restingHeartRate),
            HKQuantityType.quantityType(forIdentifier: .heartRateVariabilitySDNN),
            HKQuantityType.quantityType(forIdentifier: .vo2Max),
            HKQuantityType.quantityType(forIdentifier: .appleExerciseTime),
            HKQuantityType.quantityType(forIdentifier: .appleStandTime),
            HKQuantityType.quantityType(forIdentifier: .distanceWalkingRunning),
            HKQuantityType.quantityType(forIdentifier: .bodyMass),
            HKQuantityType.quantityType(forIdentifier: .flightsClimbed),
            HKQuantityType.quantityType(forIdentifier: .oxygenSaturation),
            HKQuantityType.quantityType(forIdentifier: .respiratoryRate),
            HKQuantityType.quantityType(forIdentifier: .walkingSpeed),
            HKCategoryType.categoryType(forIdentifier: .mindfulSession),
            HKCategoryType.categoryType(forIdentifier: .sleepAnalysis)
        ]
        .compactMap { $0 }
        let readTypes = Set(readSamples.map { $0 as HKObjectType })

        try await store.requestAuthorization(toShare: [], read: readTypes)
    }

    func fetchLiveSnapshots() async -> [HealthMetricKind: MetricSnapshot] {
        var updated: [HealthMetricKind: MetricSnapshot] = [:]
        for kind in HealthMetricKind.allCases {
            if let live = await snapshot(for: kind) {
                updated[kind] = live
            }
        }
        return updated
    }

    private func snapshot(for kind: HealthMetricKind) async -> MetricSnapshot? {
        switch kind {
        case .steps:
            if let (value, trend) = await cumulativeDayAndTrend(.stepCount, unit: .count()) {
                return makeSnapshot(kind: .steps, value: value, unitText: "steps", trend: trend, goal: 10_000)
            }
        case .activeCalories:
            if let (value, trend) = await cumulativeDayAndTrend(.activeEnergyBurned, unit: .kilocalorie()) {
                return makeSnapshot(kind: .activeCalories, value: value, unitText: "kcal", trend: trend, goal: 600)
            }
        case .exerciseMinutes:
            if let (value, trend) = await cumulativeDayAndTrend(.appleExerciseTime, unit: .minute()) {
                return makeSnapshot(kind: .exerciseMinutes, value: value, unitText: "min", trend: trend, goal: 30)
            }
        case .standHours:
            if let (value, trend) = await cumulativeDayAndTrend(.appleStandTime, unit: .hour()) {
                return makeSnapshot(kind: .standHours, value: value, unitText: "hrs", trend: trend, goal: 12)
            }
        case .heartRate:
            if let (value, trend) = await dailyAverageAndTrend(.heartRate, unit: HKUnit.count().unitDivided(by: .minute())) {
                return makeSnapshot(kind: .heartRate, value: value, unitText: "BPM", trend: trend, goal: nil)
            }
        case .restingHeartRate:
            if let (value, trend) = await dailyAverageAndTrend(.restingHeartRate, unit: HKUnit.count().unitDivided(by: .minute())) {
                return makeSnapshot(kind: .restingHeartRate, value: value, unitText: "BPM", trend: trend, goal: nil)
            }
        case .hrv:
            if let (value, trend) = await dailyAverageAndTrend(.heartRateVariabilitySDNN, unit: .secondUnit(with: .milli)) {
                return makeSnapshot(kind: .hrv, value: value, unitText: "ms", trend: trend, goal: nil)
            }
        case .vo2Max, .cardioFitness:
            if let (value, trend) = await dailyAverageAndTrend(.vo2Max, unit: HKUnit(from: "mL/kg*min")) {
                return makeSnapshot(kind: kind, value: value, unitText: "mL/kg/min", trend: trend, goal: nil)
            }
        case .bodyWeight:
            if let (value, trend) = await dailyAverageAndTrend(.bodyMass, unit: .gramUnit(with: .kilo)) {
                return makeSnapshot(kind: .bodyWeight, value: value, unitText: "kg", trend: trend, goal: nil)
            }
        case .flightsClimbed:
            if let (value, trend) = await cumulativeDayAndTrend(.flightsClimbed, unit: .count()) {
                return makeSnapshot(kind: .flightsClimbed, value: value, unitText: "floors", trend: trend, goal: 10)
            }
        case .bloodOxygen:
            if let (value, trend) = await dailyAverageAndTrend(.oxygenSaturation, unit: .percent()) {
                return makeSnapshot(kind: .bloodOxygen, value: value * 100, unitText: "%", trend: trend.map { $0 * 100 }, goal: 96)
            }
        case .sleepRespiratoryRate:
            if let (value, trend) = await dailyAverageAndTrend(.respiratoryRate, unit: HKUnit.count().unitDivided(by: .minute())) {
                return makeSnapshot(kind: .sleepRespiratoryRate, value: value, unitText: "br/min", trend: trend, goal: nil)
            }
        case .walkingSpeed:
            if let (value, trend) = await dailyAverageAndTrend(.walkingSpeed, unit: .meter().unitDivided(by: .second())) {
                return makeSnapshot(kind: .walkingSpeed, value: value, unitText: "m/s", trend: trend, goal: nil)
            }
        default:
            return nil
        }
        return nil
    }

    private func makeSnapshot(kind: HealthMetricKind, value: Double, unitText: String, trend: [Double], goal: Double?) -> MetricSnapshot {
        let progress = goal.map { min(max(value / max($0, 0.01), 0), 1) } ?? normalizedProgress(value: value, kind: kind)
        let direction: TrendDirection = {
            guard let first = trend.first, let last = trend.last else { return .flat }
            if abs(last - first) < 0.001 { return .flat }
            return last > first ? .up : .down
        }()
        let tint: SemanticTint = {
            if kind.isHigherBetter {
                return direction == .down ? .warning : (direction == .up ? .positive : .neutral)
            } else {
                return direction == .up ? .warning : (direction == .down ? .positive : .neutral)
            }
        }()
        let formatted = value >= 100 ? String(format: "%.0f", value) : String(format: "%.1f", value)
        return MetricSnapshot(
            kind: kind,
            value: value,
            displayValue: formatted,
            unit: unitText,
            goal: goal,
            progress: progress,
            trend: trend,
            trendDirection: direction,
            semanticTint: tint,
            secondary: "Live"
        )
    }

    private func normalizedProgress(value: Double, kind: HealthMetricKind) -> Double {
        switch kind {
        case .heartRate, .restingHeartRate: return min(max((120 - value) / 80, 0), 1)
        case .bodyWeight: return 0.6
        default: return min(max(value / 100, 0), 1)
        }
    }

    private func cumulativeDayAndTrend(_ identifier: HKQuantityTypeIdentifier, unit: HKUnit) async -> (Double, [Double])? {
        guard let type = HKQuantityType.quantityType(forIdentifier: identifier) else { return nil }
        let trend = await sevenDaySeries(for: type, unit: unit, options: .cumulativeSum)
        guard let latest = trend.last else { return nil }
        return (latest, trend)
    }

    private func dailyAverageAndTrend(_ identifier: HKQuantityTypeIdentifier, unit: HKUnit) async -> (Double, [Double])? {
        guard let type = HKQuantityType.quantityType(forIdentifier: identifier) else { return nil }
        let trend = await sevenDaySeries(for: type, unit: unit, options: .discreteAverage)
        guard let latest = trend.last else { return nil }
        return (latest, trend)
    }

    private func sevenDaySeries(for type: HKQuantityType, unit: HKUnit, options: HKStatisticsOptions) async -> [Double] {
        await withCheckedContinuation { continuation in
            let cal = Calendar.current
            let end = cal.startOfDay(for: Date()).addingTimeInterval(24 * 60 * 60)
            guard let start = cal.date(byAdding: .day, value: -6, to: cal.startOfDay(for: Date())) else {
                continuation.resume(returning: [])
                return
            }
            var interval = DateComponents()
            interval.day = 1

            let query = HKStatisticsCollectionQuery(
                quantityType: type,
                quantitySamplePredicate: HKQuery.predicateForSamples(withStart: start, end: end),
                options: options,
                anchorDate: start,
                intervalComponents: interval
            )
            query.initialResultsHandler = { _, collection, _ in
                var points: [Double] = []
                if let collection {
                    collection.enumerateStatistics(from: start, to: end) { stats, _ in
                        let quantity: HKQuantity?
                        if options == .cumulativeSum {
                            quantity = stats.sumQuantity()
                        } else {
                            quantity = stats.averageQuantity()
                        }
                        points.append(quantity?.doubleValue(for: unit) ?? 0)
                    }
                }
                continuation.resume(returning: points)
            }
            self.store.execute(query)
        }
    }
}
