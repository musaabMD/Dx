//
//  MetricSlot.swift
//  WidgetShared
//
//  A slot is one position in a multi-metric composition.
//  The role determines HOW the metric renders, not which metric it is.
//

import Foundation

// MARK: - Slot Role

public enum SlotRole: String, Codable, CaseIterable {
    case primary    // Full-size: big number + chart + trend
    case secondary  // Medium: value + sparkline + label
    case accent     // Compact: small ring + value + label
    case context    // Ultra-compact: icon + number only
}

// MARK: - Metric Slot

public struct MetricSlot: Codable, Identifiable, Hashable {
    public let id: UUID
    public let metricKind: HealthMetricKind
    public let role: SlotRole

    public init(id: UUID = UUID(), metricKind: HealthMetricKind, role: SlotRole) {
        self.id = id
        self.metricKind = metricKind
        self.role = role
    }
}

// MARK: - Metric Cluster (for smart fill)

public enum MetricCluster: String, CaseIterable {
    case cardio     // heart, HR, VO2, HRV
    case activity   // steps, calories, exercise, stand
    case sleep      // sleep
    case wellness   // mindfulness, weight

    public var members: [HealthMetricKind] {
        switch self {
        case .cardio:   return [.heartRate, .restingHeartRate, .vo2Max, .hrv]
        case .activity: return [.steps, .flightsClimbed, .exerciseMinutes, .vo2Max, .activeCalories, .standHours]
        case .sleep:    return [.sleep, .restingHeartRate, .mindfulMinutes]
        case .wellness: return [.mindfulMinutes, .bodyWeight, .sleep]
        }
    }

    public static func cluster(for metric: HealthMetricKind) -> MetricCluster {
        for c in allCases where c.members.contains(metric) { return c }
        return .activity
    }
}
