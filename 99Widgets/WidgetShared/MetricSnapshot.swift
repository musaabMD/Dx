//
//  MetricSnapshot.swift
//  WidgetShared
//
//  Universal data shape. Any HealthKit metric adapter produces one of these.
//  The render pipeline consumes it — zero metric-specific code in the render layer.
//

import Foundation

public enum TrendDirection: String, Codable {
    case up, down, flat
}

public enum SemanticTint: String, Codable {
    case positive   // green — moving in the right direction
    case neutral    // no strong signal
    case warning    // moving the wrong way or below threshold
}

public struct MetricSnapshot: Codable, Identifiable {
    public let id: UUID
    public let kind: HealthMetricKind
    /// Raw numeric value (used for computations).
    public let value: Double
    /// Pre-formatted string (e.g. "8,432" or "7h 24m").
    public let displayValue: String
    public let unit: String
    public let goal: Double?
    /// 0–1 progress toward goal (0.5 if no goal).
    public let progress: Double
    /// 7 data points: oldest → most recent.
    public let trend: [Double]
    public let trendDirection: TrendDirection
    public let capturedAt: Date
    public let semanticTint: SemanticTint
    /// Short secondary label shown in dense mode (e.g. "Avg 7,800").
    public let secondary: String?

    public init(
        id: UUID = UUID(),
        kind: HealthMetricKind,
        value: Double,
        displayValue: String,
        unit: String? = nil,
        goal: Double? = nil,
        progress: Double,
        trend: [Double],
        trendDirection: TrendDirection,
        capturedAt: Date = .now,
        semanticTint: SemanticTint,
        secondary: String? = nil
    ) {
        self.id = id
        self.kind = kind
        self.value = value
        self.displayValue = displayValue
        self.unit = unit ?? kind.unit
        self.goal = goal ?? kind.defaultGoal
        self.progress = min(max(progress, 0), 1)
        self.trend = trend
        self.trendDirection = trendDirection
        self.capturedAt = capturedAt
        self.semanticTint = semanticTint
        self.secondary = secondary
    }
}

// MARK: - Mock Data Factory

public extension MetricSnapshot {
    static func mock(for kind: HealthMetricKind) -> MetricSnapshot {
        switch kind {
        case .steps:
            return .init(kind: .steps, value: 8_432, displayValue: "8,432",
                         goal: 10_000, progress: 0.84,
                         trend: [7200, 9100, 6800, 8900, 7500, 9200, 8432],
                         trendDirection: .up, semanticTint: .neutral, secondary: "Avg 8,100")

        case .heartRate:
            return .init(kind: .heartRate, value: 68, displayValue: "68",
                         goal: nil, progress: 0.68,
                         trend: [72, 65, 70, 68, 71, 66, 68],
                         trendDirection: .down, semanticTint: .positive, secondary: "Resting 58")

        case .activeCalories:
            return .init(kind: .activeCalories, value: 487, displayValue: "487",
                         goal: 600, progress: 0.81,
                         trend: [320, 510, 290, 620, 480, 550, 487],
                         trendDirection: .up, semanticTint: .neutral, secondary: "Goal 600 kcal")

        case .sleep:
            return .init(kind: .sleep, value: 7.4, displayValue: "7h 24m",
                         goal: 8, progress: 0.925,
                         trend: [6.5, 7.8, 6.2, 8.1, 7.0, 7.9, 7.4],
                         trendDirection: .flat, semanticTint: .positive, secondary: "REM 1h 48m")

        case .standHours:
            return .init(kind: .standHours, value: 9, displayValue: "9",
                         goal: 12, progress: 0.75,
                         trend: [8, 10, 7, 11, 9, 10, 9],
                         trendDirection: .flat, semanticTint: .neutral, secondary: "Goal 12 hrs")

        case .exerciseMinutes:
            return .init(kind: .exerciseMinutes, value: 34, displayValue: "34",
                         goal: 30, progress: 1.0,
                         trend: [15, 45, 0, 60, 30, 45, 34],
                         trendDirection: .flat, semanticTint: .positive, secondary: "Goal met ✓")

        case .vo2Max:
            return .init(kind: .vo2Max, value: 42.1, displayValue: "42.1",
                         goal: nil, progress: 0.74,
                         trend: [41.2, 41.8, 41.5, 42.0, 41.9, 42.2, 42.1],
                         trendDirection: .up, semanticTint: .positive, secondary: "Good fitness")

        case .restingHeartRate:
            return .init(kind: .restingHeartRate, value: 58, displayValue: "58",
                         goal: nil, progress: 0.55,
                         trend: [62, 60, 59, 61, 58, 59, 58],
                         trendDirection: .down, semanticTint: .positive, secondary: "7-day low")

        case .hrv:
            return .init(kind: .hrv, value: 42, displayValue: "42",
                         goal: nil, progress: 0.60,
                         trend: [38, 44, 40, 46, 39, 43, 42],
                         trendDirection: .up, semanticTint: .positive, secondary: "Above avg")

        case .mindfulMinutes:
            return .init(kind: .mindfulMinutes, value: 15, displayValue: "15",
                         goal: 10, progress: 1.0,
                         trend: [0, 10, 20, 10, 5, 15, 15],
                         trendDirection: .up, semanticTint: .positive, secondary: "Goal met ✓")

        case .bodyWeight:
            return .init(kind: .bodyWeight, value: 74.2, displayValue: "74.2",
                         goal: 72, progress: 0.85,
                         trend: [74.8, 74.5, 74.3, 74.6, 74.4, 74.3, 74.2],
                         trendDirection: .down, semanticTint: .positive, secondary: "↓ 0.6 kg/wk")

        case .flightsClimbed:
            return .init(kind: .flightsClimbed, value: 8, displayValue: "8",
                         goal: 10, progress: 0.80,
                         trend: [4, 7, 3, 10, 6, 9, 8],
                         trendDirection: .up, semanticTint: .positive, secondary: "Goal 10 floors")

        case .sleepStages:
            return .init(kind: .sleepStages, value: 76, displayValue: "76",
                         progress: 0.76, trend: [70, 72, 68, 74, 75, 77, 76],
                         trendDirection: .up, semanticTint: .positive, secondary: "REM + Deep")
        case .sleepConsistency:
            return .init(kind: .sleepConsistency, value: 82, displayValue: "82%",
                         goal: 80, progress: 0.82, trend: [70, 74, 79, 81, 80, 83, 82],
                         trendDirection: .up, semanticTint: .positive, secondary: "Bedtime stable")
        case .sleepRespiratoryRate:
            return .init(kind: .sleepRespiratoryRate, value: 14.2, displayValue: "14.2",
                         progress: 0.72, trend: [15.1, 14.8, 14.4, 14.2, 14.3, 14.0, 14.2],
                         trendDirection: .down, semanticTint: .positive, secondary: "Stable")
        case .wristTemperature:
            return .init(kind: .wristTemperature, value: 0.2, displayValue: "+0.2",
                         progress: 0.55, trend: [0.0, 0.1, 0.3, 0.2, 0.2, 0.1, 0.2],
                         trendDirection: .flat, semanticTint: .neutral, secondary: "Baseline +0.2")
        case .cardioFitness:
            return .init(kind: .cardioFitness, value: 41.9, displayValue: "41.9",
                         progress: 0.75, trend: [40.2, 40.8, 41.0, 41.4, 41.7, 42.0, 41.9],
                         trendDirection: .up, semanticTint: .positive, secondary: "Above average")
        case .walkingHeartRateAverage:
            return .init(kind: .walkingHeartRateAverage, value: 92, displayValue: "92",
                         progress: 0.62, trend: [98, 96, 95, 94, 93, 92, 92],
                         trendDirection: .down, semanticTint: .positive, secondary: "Improving")
        case .recoveryHeartRate:
            return .init(kind: .recoveryHeartRate, value: 28, displayValue: "28",
                         progress: 0.70, trend: [24, 26, 26, 27, 27, 28, 28],
                         trendDirection: .up, semanticTint: .positive, secondary: "1-min drop")
        case .ecg:
            return .init(kind: .ecg, value: 1, displayValue: "Sinus",
                         progress: 1.0, trend: [1, 1, 1, 1, 1, 1, 1],
                         trendDirection: .flat, semanticTint: .positive, secondary: "No AFib")
        case .irregularRhythmEvents:
            return .init(kind: .irregularRhythmEvents, value: 0, displayValue: "0",
                         progress: 1.0, trend: [0, 0, 1, 0, 0, 0, 0],
                         trendDirection: .down, semanticTint: .positive, secondary: "Last 7 days")
        case .bloodPressure:
            return .init(kind: .bloodPressure, value: 118, displayValue: "118/76",
                         progress: 0.78, trend: [122, 120, 119, 118, 121, 119, 118],
                         trendDirection: .down, semanticTint: .positive, secondary: "Normal range")
        case .bloodOxygen:
            return .init(kind: .bloodOxygen, value: 97, displayValue: "97%",
                         goal: 96, progress: 0.97, trend: [95, 96, 97, 97, 96, 98, 97],
                         trendDirection: .up, semanticTint: .positive, secondary: "Healthy")
        case .walkingSpeed:
            return .init(kind: .walkingSpeed, value: 1.34, displayValue: "1.34",
                         progress: 0.74, trend: [1.20, 1.25, 1.28, 1.30, 1.31, 1.33, 1.34],
                         trendDirection: .up, semanticTint: .positive, secondary: "m/s")
        case .walkingAsymmetry:
            return .init(kind: .walkingAsymmetry, value: 2.6, displayValue: "2.6%",
                         progress: 0.74, trend: [3.4, 3.2, 3.0, 2.8, 2.9, 2.7, 2.6],
                         trendDirection: .down, semanticTint: .positive, secondary: "Lower is better")
        case .doubleSupportTime:
            return .init(kind: .doubleSupportTime, value: 24, displayValue: "24%",
                         progress: 0.70, trend: [28, 27, 26, 25, 25, 24, 24],
                         trendDirection: .down, semanticTint: .positive, secondary: "Stability")
        case .strideLength:
            return .init(kind: .strideLength, value: 1.08, displayValue: "1.08",
                         progress: 0.72, trend: [0.98, 1.00, 1.02, 1.04, 1.06, 1.07, 1.08],
                         trendDirection: .up, semanticTint: .positive, secondary: "Meters")
        case .groundContactTime:
            return .init(kind: .groundContactTime, value: 248, displayValue: "248",
                         progress: 0.68, trend: [262, 258, 255, 252, 250, 249, 248],
                         trendDirection: .down, semanticTint: .positive, secondary: "ms")
        case .verticalOscillation:
            return .init(kind: .verticalOscillation, value: 7.8, displayValue: "7.8",
                         progress: 0.69, trend: [8.6, 8.4, 8.2, 8.1, 8.0, 7.9, 7.8],
                         trendDirection: .down, semanticTint: .positive, secondary: "cm")
        case .workouts:
            return .init(kind: .workouts, value: 5, displayValue: "5",
                         progress: 0.83, trend: [3, 4, 4, 5, 5, 6, 5],
                         trendDirection: .up, semanticTint: .positive, secondary: "This week")
        case .bodyFatPercentage:
            return .init(kind: .bodyFatPercentage, value: 19.8, displayValue: "19.8%",
                         progress: 0.64, trend: [21.1, 20.8, 20.5, 20.3, 20.1, 19.9, 19.8],
                         trendDirection: .down, semanticTint: .positive, secondary: "Trending down")
        case .bmi:
            return .init(kind: .bmi, value: 23.4, displayValue: "23.4",
                         progress: 0.73, trend: [24.1, 23.9, 23.8, 23.7, 23.6, 23.5, 23.4],
                         trendDirection: .down, semanticTint: .positive, secondary: "Healthy")
        case .leanBodyMass:
            return .init(kind: .leanBodyMass, value: 58.2, displayValue: "58.2",
                         progress: 0.79, trend: [57.4, 57.6, 57.8, 58.0, 58.0, 58.1, 58.2],
                         trendDirection: .up, semanticTint: .positive, secondary: "kg")
        case .height:
            return .init(kind: .height, value: 176, displayValue: "176",
                         progress: 1.0, trend: [176, 176, 176, 176, 176, 176, 176],
                         trendDirection: .flat, semanticTint: .neutral, secondary: "cm")
        case .waistCircumference:
            return .init(kind: .waistCircumference, value: 84, displayValue: "84",
                         progress: 0.68, trend: [88, 87, 86, 86, 85, 84, 84],
                         trendDirection: .down, semanticTint: .positive, secondary: "cm")
        case .peakExpiratoryFlowRate:
            return .init(kind: .peakExpiratoryFlowRate, value: 520, displayValue: "520",
                         progress: 0.80, trend: [500, 505, 510, 515, 518, 522, 520],
                         trendDirection: .up, semanticTint: .positive, secondary: "L/min")
        case .inhalerUsage:
            return .init(kind: .inhalerUsage, value: 1, displayValue: "1",
                         progress: 0.80, trend: [3, 2, 2, 2, 1, 1, 1],
                         trendDirection: .down, semanticTint: .positive, secondary: "This week")
        case .caloriesConsumed:
            return .init(kind: .caloriesConsumed, value: 2150, displayValue: "2,150",
                         progress: 0.78, trend: [2300, 2200, 2250, 2100, 2180, 2120, 2150],
                         trendDirection: .down, semanticTint: .neutral, secondary: "kcal/day")
        case .protein:
            return .init(kind: .protein, value: 128, displayValue: "128",
                         goal: 120, progress: 1.0, trend: [90, 110, 105, 125, 130, 120, 128],
                         trendDirection: .up, semanticTint: .positive, secondary: "Goal met")
        case .carbs:
            return .init(kind: .carbs, value: 210, displayValue: "210",
                         progress: 0.72, trend: [240, 230, 220, 215, 210, 205, 210],
                         trendDirection: .down, semanticTint: .neutral, secondary: "g")
        case .fat:
            return .init(kind: .fat, value: 68, displayValue: "68",
                         progress: 0.74, trend: [76, 74, 72, 70, 69, 67, 68],
                         trendDirection: .down, semanticTint: .neutral, secondary: "g")
        case .micronutrients:
            return .init(kind: .micronutrients, value: 78, displayValue: "78",
                         progress: 0.78, trend: [70, 72, 74, 75, 76, 78, 78],
                         trendDirection: .up, semanticTint: .positive, secondary: "coverage score")
        case .waterIntake:
            return .init(kind: .waterIntake, value: 2.6, displayValue: "2.6",
                         goal: 2.5, progress: 1.0, trend: [2.0, 2.1, 2.4, 2.3, 2.5, 2.6, 2.6],
                         trendDirection: .up, semanticTint: .positive, secondary: "L")
        case .caffeineIntake:
            return .init(kind: .caffeineIntake, value: 180, displayValue: "180",
                         progress: 0.72, trend: [260, 230, 210, 190, 180, 170, 180],
                         trendDirection: .down, semanticTint: .positive, secondary: "mg")
        case .walkingSteadiness:
            return .init(kind: .walkingSteadiness, value: 88, displayValue: "88%",
                         progress: 0.88, trend: [81, 83, 84, 85, 86, 87, 88],
                         trendDirection: .up, semanticTint: .positive, secondary: "Low fall risk")
        case .stepLength:
            return .init(kind: .stepLength, value: 0.71, displayValue: "0.71",
                         progress: 0.71, trend: [0.65, 0.66, 0.67, 0.68, 0.69, 0.70, 0.71],
                         trendDirection: .up, semanticTint: .positive, secondary: "m")
        case .stairSpeed:
            return .init(kind: .stairSpeed, value: 1.2, displayValue: "1.2",
                         progress: 0.76, trend: [1.0, 1.0, 1.1, 1.1, 1.2, 1.2, 1.2],
                         trendDirection: .up, semanticTint: .positive, secondary: "steps/s")
        case .fallEvents:
            return .init(kind: .fallEvents, value: 0, displayValue: "0",
                         progress: 1.0, trend: [0, 1, 0, 0, 0, 0, 0],
                         trendDirection: .down, semanticTint: .positive, secondary: "Last 30 days")
        case .environmentalSoundLevels:
            return .init(kind: .environmentalSoundLevels, value: 64, displayValue: "64",
                         progress: 0.73, trend: [70, 69, 67, 66, 65, 64, 64],
                         trendDirection: .down, semanticTint: .positive, secondary: "dB avg")
        case .headphoneAudioLevels:
            return .init(kind: .headphoneAudioLevels, value: 68, displayValue: "68",
                         progress: 0.72, trend: [78, 75, 73, 71, 70, 69, 68],
                         trendDirection: .down, semanticTint: .positive, secondary: "dB")
        case .hearingTestScore:
            return .init(kind: .hearingTestScore, value: 92, displayValue: "92",
                         progress: 0.92, trend: [88, 89, 90, 90, 91, 92, 92],
                         trendDirection: .up, semanticTint: .positive, secondary: "Score")
        case .medicationsAdherence:
            return .init(kind: .medicationsAdherence, value: 96, displayValue: "96%",
                         progress: 0.96, trend: [90, 92, 93, 94, 95, 95, 96],
                         trendDirection: .up, semanticTint: .positive, secondary: "Adherence")
        case .symptomsLogged:
            return .init(kind: .symptomsLogged, value: 2, displayValue: "2",
                         progress: 0.85, trend: [4, 3, 3, 2, 2, 2, 2],
                         trendDirection: .down, semanticTint: .positive, secondary: "This week")
        case .cycleTracking:
            return .init(kind: .cycleTracking, value: 100, displayValue: "Tracked",
                         progress: 1.0, trend: [100, 100, 100, 100, 100, 100, 100],
                         trendDirection: .flat, semanticTint: .positive, secondary: "On time")
        case .sexualActivity:
            return .init(kind: .sexualActivity, value: 3, displayValue: "3",
                         progress: 0.75, trend: [1, 2, 2, 3, 2, 3, 3],
                         trendDirection: .up, semanticTint: .neutral, secondary: "Weekly")
        case .handwashingDetections:
            return .init(kind: .handwashingDetections, value: 11, displayValue: "11",
                         progress: 0.79, trend: [8, 9, 10, 10, 11, 11, 11],
                         trendDirection: .up, semanticTint: .positive, secondary: "Daily avg")
        case .daylightExposure:
            return .init(kind: .daylightExposure, value: 52, displayValue: "52",
                         goal: 45, progress: 1.0, trend: [20, 25, 40, 45, 48, 50, 52],
                         trendDirection: .up, semanticTint: .positive, secondary: "minutes")
        case .mood:
            return .init(kind: .mood, value: 7.8, displayValue: "7.8",
                         progress: 0.78, trend: [6.8, 7.0, 7.2, 7.4, 7.5, 7.6, 7.8],
                         trendDirection: .up, semanticTint: .positive, secondary: "State of mind")
        }
    }
}
