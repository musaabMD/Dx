//
//  OverallHealthKPI.swift
//  WidgetShared
//

import Foundation

public enum KPIBand: String, Codable, CaseIterable, Identifiable {
    case poor
    case average
    case good
    case excellent

    public var id: String { rawValue }
    public var label: String { rawValue.capitalized }
}

public struct KPIThreshold: Codable, Equatable {
    public var poorMax: Double
    public var averageMax: Double
    public var goodMax: Double
    public var excellentMax: Double

    public init(poorMax: Double, averageMax: Double, goodMax: Double, excellentMax: Double) {
        self.poorMax = poorMax
        self.averageMax = averageMax
        self.goodMax = goodMax
        self.excellentMax = excellentMax
    }

    public func band(for score: Double) -> KPIBand {
        if score <= poorMax { return .poor }
        if score <= averageMax { return .average }
        if score <= goodMax { return .good }
        return .excellent
    }
}

public struct EditableMetricRule: Codable, Identifiable, Equatable {
    public let id: String
    public let kind: HealthMetricKind
    public var weight: Double
    public var invertScoring: Bool

    public init(kind: HealthMetricKind, weight: Double, invertScoring: Bool? = nil) {
        self.id = kind.rawValue
        self.kind = kind
        self.weight = max(0.1, weight)
        self.invertScoring = invertScoring ?? !kind.isHigherBetter
    }
}

public struct HealthKPISection: Codable, Identifiable, Equatable {
    public let id: String
    public var title: String
    public var rules: [EditableMetricRule]

    public init(id: String, title: String, rules: [EditableMetricRule]) {
        self.id = id
        self.title = title
        self.rules = rules
    }
}

public struct HealthKPIProfile: Codable, Equatable {
    public var thresholds: KPIThreshold
    public var sections: [HealthKPISection]

    public init(thresholds: KPIThreshold, sections: [HealthKPISection]) {
        self.thresholds = thresholds
        self.sections = sections
    }

    public static let `default` = HealthKPIProfile(
        thresholds: .init(poorMax: 39, averageMax: 64, goodMax: 84, excellentMax: 100),
        sections: [
            .init(id: "sleep_recovery", title: "Sleep & Recovery", rules: [
                .init(kind: .sleep, weight: 1.0),
                .init(kind: .hrv, weight: 1.0),
                .init(kind: .restingHeartRate, weight: 1.0)
            ]),
            .init(id: "activity_fitness", title: "Activity & Fitness", rules: [
                .init(kind: .steps, weight: 1.0),
                .init(kind: .exerciseMinutes, weight: 1.0),
                .init(kind: .activeCalories, weight: 0.8),
                .init(kind: .vo2Max, weight: 1.2)
            ]),
            .init(id: "heart_vitals", title: "Heart & Vitals", rules: [
                .init(kind: .heartRate, weight: 0.8, invertScoring: true),
                .init(kind: .bloodOxygen, weight: 0.8),
                .init(kind: .sleepRespiratoryRate, weight: 0.6, invertScoring: true)
            ]),
            .init(id: "body_composition", title: "Body Composition", rules: [
                .init(kind: .bodyWeight, weight: 0.8, invertScoring: true),
                .init(kind: .bodyFatPercentage, weight: 0.8, invertScoring: true),
                .init(kind: .waistCircumference, weight: 0.8, invertScoring: true)
            ]),
            .init(id: "mindset_lifestyle", title: "Mental & Lifestyle", rules: [
                .init(kind: .mindfulMinutes, weight: 0.8),
                .init(kind: .daylightExposure, weight: 0.8),
                .init(kind: .mood, weight: 0.8)
            ]),
            .init(id: "nutrition", title: "Nutrition", rules: [
                .init(kind: .protein, weight: 0.8),
                .init(kind: .waterIntake, weight: 0.8),
                .init(kind: .caloriesConsumed, weight: 0.6, invertScoring: true)
            ]),
            .init(id: "mobility_stability", title: "Mobility & Stability", rules: [
                .init(kind: .walkingSpeed, weight: 0.8),
                .init(kind: .walkingSteadiness, weight: 0.8),
                .init(kind: .fallEvents, weight: 0.8, invertScoring: true)
            ]),
            .init(id: "hearing_environment", title: "Hearing & Environment", rules: [
                .init(kind: .environmentalSoundLevels, weight: 0.6, invertScoring: true),
                .init(kind: .headphoneAudioLevels, weight: 0.8, invertScoring: true)
            ])
        ]
    )
}

public struct SectionKPIResult: Identifiable {
    public let id: String
    public let title: String
    public let score: Double
    public let band: KPIBand
}

public struct OverallKPIResult {
    public let score: Double
    public let band: KPIBand
    public let sections: [SectionKPIResult]
}

public enum OverallHealthKPICalculator {
    public static func calculate(profile: HealthKPIProfile, snapshots: [HealthMetricKind: MetricSnapshot]) -> OverallKPIResult {
        let sectionResults: [SectionKPIResult] = profile.sections.map { section in
            let score = sectionScore(section, snapshots: snapshots)
            return SectionKPIResult(
                id: section.id,
                title: section.title,
                score: score,
                band: profile.thresholds.band(for: score)
            )
        }

        let globalScore = sectionResults.map(\.score).reduce(0, +) / max(1, Double(sectionResults.count))
        return OverallKPIResult(
            score: globalScore,
            band: profile.thresholds.band(for: globalScore),
            sections: sectionResults
        )
    }

    private static func sectionScore(_ section: HealthKPISection, snapshots: [HealthMetricKind: MetricSnapshot]) -> Double {
        let weighted: [(Double, Double)] = section.rules.compactMap { rule in
            guard let snap = snapshots[rule.kind] else { return nil }
            let base = snap.progress * 100
            let normalized = rule.invertScoring ? (100 - base) : base
            return (normalized, max(0.1, rule.weight))
        }
        let denominator = weighted.map(\.1).reduce(0, +)
        guard denominator > 0 else { return 50 }
        let numerator = weighted.reduce(0) { $0 + ($1.0 * $1.1) }
        return min(100, max(0, numerator / denominator))
    }
}
