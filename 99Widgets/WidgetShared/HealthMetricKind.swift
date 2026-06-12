//
//  HealthMetricKind.swift
//  WidgetShared
//

import Foundation

public enum HealthMetricKind: String, Codable, CaseIterable, Identifiable {
    case steps
    case heartRate
    case activeCalories
    case sleep
    case standHours
    case exerciseMinutes
    case vo2Max
    case restingHeartRate
    case hrv
    case mindfulMinutes
    case bodyWeight
    case flightsClimbed
    case sleepStages
    case sleepConsistency
    case sleepRespiratoryRate
    case wristTemperature
    case cardioFitness
    case walkingHeartRateAverage
    case recoveryHeartRate
    case ecg
    case irregularRhythmEvents
    case bloodPressure
    case bloodOxygen
    case walkingSpeed
    case walkingAsymmetry
    case doubleSupportTime
    case strideLength
    case groundContactTime
    case verticalOscillation
    case workouts
    case bodyFatPercentage
    case bmi
    case leanBodyMass
    case height
    case waistCircumference
    case peakExpiratoryFlowRate
    case inhalerUsage
    case caloriesConsumed
    case protein
    case carbs
    case fat
    case micronutrients
    case waterIntake
    case caffeineIntake
    case walkingSteadiness
    case stepLength
    case stairSpeed
    case fallEvents
    case environmentalSoundLevels
    case headphoneAudioLevels
    case hearingTestScore
    case medicationsAdherence
    case symptomsLogged
    case cycleTracking
    case sexualActivity
    case handwashingDetections
    case daylightExposure
    case mood

    public var id: String { rawValue }

    public var displayName: String {
        switch self {
        case .steps:            return "Steps"
        case .heartRate:        return "Heart Rate"
        case .activeCalories:   return "Calories"
        case .sleep:            return "Sleep"
        case .standHours:       return "Stand Hours"
        case .exerciseMinutes:  return "Exercise"
        case .vo2Max:           return "VO₂ Max"
        case .restingHeartRate: return "Resting HR"
        case .hrv:              return "HRV"
        case .mindfulMinutes:   return "Mindfulness"
        case .bodyWeight:       return "Weight"
        case .flightsClimbed:   return "Stairs"
        case .sleepStages: return "Sleep Stages"
        case .sleepConsistency: return "Sleep Consistency"
        case .sleepRespiratoryRate: return "Sleep Respiratory"
        case .wristTemperature: return "Wrist Temperature"
        case .cardioFitness: return "Cardio Fitness"
        case .walkingHeartRateAverage: return "Walking HR Avg"
        case .recoveryHeartRate: return "Recovery HR"
        case .ecg: return "ECG"
        case .irregularRhythmEvents: return "Irregular Rhythm"
        case .bloodPressure: return "Blood Pressure"
        case .bloodOxygen: return "Blood Oxygen"
        case .walkingSpeed: return "Walking Speed"
        case .walkingAsymmetry: return "Walking Asymmetry"
        case .doubleSupportTime: return "Double Support"
        case .strideLength: return "Stride Length"
        case .groundContactTime: return "Ground Contact"
        case .verticalOscillation: return "Vertical Oscillation"
        case .workouts: return "Workouts"
        case .bodyFatPercentage: return "Body Fat"
        case .bmi: return "BMI"
        case .leanBodyMass: return "Lean Body Mass"
        case .height: return "Height"
        case .waistCircumference: return "Waist"
        case .peakExpiratoryFlowRate: return "Peak Flow"
        case .inhalerUsage: return "Inhaler Usage"
        case .caloriesConsumed: return "Calories Consumed"
        case .protein: return "Protein"
        case .carbs: return "Carbs"
        case .fat: return "Fat"
        case .micronutrients: return "Micronutrients"
        case .waterIntake: return "Water"
        case .caffeineIntake: return "Caffeine"
        case .walkingSteadiness: return "Walking Steadiness"
        case .stepLength: return "Step Length"
        case .stairSpeed: return "Stair Speed"
        case .fallEvents: return "Fall Events"
        case .environmentalSoundLevels: return "Environmental Sound"
        case .headphoneAudioLevels: return "Headphone Audio"
        case .hearingTestScore: return "Hearing Test"
        case .medicationsAdherence: return "Medications"
        case .symptomsLogged: return "Symptoms"
        case .cycleTracking: return "Cycle Tracking"
        case .sexualActivity: return "Sexual Activity"
        case .handwashingDetections: return "Handwashing"
        case .daylightExposure: return "Daylight"
        case .mood: return "Mood"
        }
    }

    public var unit: String {
        switch self {
        case .steps:            return "steps"
        case .heartRate:        return "BPM"
        case .activeCalories:   return "kcal"
        case .sleep:            return "hrs"
        case .standHours:       return "hrs"
        case .exerciseMinutes:  return "min"
        case .vo2Max:           return "mL/kg/min"
        case .restingHeartRate: return "BPM"
        case .hrv:              return "ms"
        case .mindfulMinutes:   return "min"
        case .bodyWeight:       return "kg"
        case .flightsClimbed:   return "floors"
        case .sleepStages: return "score"
        case .sleepConsistency: return "%"
        case .sleepRespiratoryRate: return "br/min"
        case .wristTemperature: return "°C"
        case .cardioFitness: return "mL/kg/min"
        case .walkingHeartRateAverage: return "BPM"
        case .recoveryHeartRate: return "BPM"
        case .ecg: return "status"
        case .irregularRhythmEvents: return "events"
        case .bloodPressure: return "mmHg"
        case .bloodOxygen: return "%"
        case .walkingSpeed: return "m/s"
        case .walkingAsymmetry: return "%"
        case .doubleSupportTime: return "%"
        case .strideLength: return "m"
        case .groundContactTime: return "ms"
        case .verticalOscillation: return "cm"
        case .workouts: return "sessions"
        case .bodyFatPercentage: return "%"
        case .bmi: return "BMI"
        case .leanBodyMass: return "kg"
        case .height: return "cm"
        case .waistCircumference: return "cm"
        case .peakExpiratoryFlowRate: return "L/min"
        case .inhalerUsage: return "uses"
        case .caloriesConsumed: return "kcal"
        case .protein: return "g"
        case .carbs: return "g"
        case .fat: return "g"
        case .micronutrients: return "score"
        case .waterIntake: return "L"
        case .caffeineIntake: return "mg"
        case .walkingSteadiness: return "%"
        case .stepLength: return "m"
        case .stairSpeed: return "steps/s"
        case .fallEvents: return "events"
        case .environmentalSoundLevels: return "dB"
        case .headphoneAudioLevels: return "dB"
        case .hearingTestScore: return "score"
        case .medicationsAdherence: return "%"
        case .symptomsLogged: return "entries"
        case .cycleTracking: return "entries"
        case .sexualActivity: return "entries"
        case .handwashingDetections: return "events"
        case .daylightExposure: return "min"
        case .mood: return "score"
        }
    }

    public var systemSymbol: String {
        switch self {
        case .steps:            return "figure.walk"
        case .heartRate:        return "heart.fill"
        case .activeCalories:   return "flame.fill"
        case .sleep:            return "moon.fill"
        case .standHours:       return "figure.stand"
        case .exerciseMinutes:  return "figure.run"
        case .vo2Max:           return "lungs.fill"
        case .restingHeartRate: return "heart.text.clipboard"
        case .hrv:              return "waveform.path.ecg"
        case .mindfulMinutes:   return "brain.head.profile"
        case .bodyWeight:       return "scalemass.fill"
        case .flightsClimbed:   return "stairs"
        case .sleepStages: return "bed.double.fill"
        case .sleepConsistency: return "clock.badge.checkmark.fill"
        case .sleepRespiratoryRate: return "lungs.fill"
        case .wristTemperature: return "thermometer.medium"
        case .cardioFitness: return "figure.run.circle.fill"
        case .walkingHeartRateAverage: return "heart.circle.fill"
        case .recoveryHeartRate: return "arrow.down.heart.fill"
        case .ecg: return "waveform.path.ecg.rectangle.fill"
        case .irregularRhythmEvents: return "exclamationmark.heart.fill"
        case .bloodPressure: return "stethoscope"
        case .bloodOxygen: return "drop.fill"
        case .walkingSpeed: return "figure.walk.motion"
        case .walkingAsymmetry: return "figure.walk.departure"
        case .doubleSupportTime: return "figure.stand.line.dotted.figure.stand"
        case .strideLength: return "ruler.fill"
        case .groundContactTime: return "timer"
        case .verticalOscillation: return "arrow.up.and.down"
        case .workouts: return "figure.highintensity.intervaltraining"
        case .bodyFatPercentage: return "percent"
        case .bmi: return "scalemass"
        case .leanBodyMass: return "figure.strengthtraining.traditional"
        case .height: return "arrow.up.and.down.text.horizontal"
        case .waistCircumference: return "circle.dashed"
        case .peakExpiratoryFlowRate: return "wind"
        case .inhalerUsage: return "pills.fill"
        case .caloriesConsumed: return "fork.knife"
        case .protein: return "fish.fill"
        case .carbs: return "leaf.fill"
        case .fat: return "drop.triangle.fill"
        case .micronutrients: return "pills.circle.fill"
        case .waterIntake: return "drop.circle.fill"
        case .caffeineIntake: return "cup.and.saucer.fill"
        case .walkingSteadiness: return "figure.walk.circle"
        case .stepLength: return "figure.walk"
        case .stairSpeed: return "stairs"
        case .fallEvents: return "figure.fall"
        case .environmentalSoundLevels: return "speaker.wave.3.fill"
        case .headphoneAudioLevels: return "headphones"
        case .hearingTestScore: return "ear.fill"
        case .medicationsAdherence: return "cross.case.fill"
        case .symptomsLogged: return "list.bullet.clipboard"
        case .cycleTracking: return "drop.circle"
        case .sexualActivity: return "heart.square.fill"
        case .handwashingDetections: return "hands.sparkles.fill"
        case .daylightExposure: return "sun.max.fill"
        case .mood: return "face.smiling.fill"
        }
    }

    public var defaultGoal: Double? {
        switch self {
        case .steps:            return 10_000
        case .activeCalories:   return 600
        case .standHours:       return 12
        case .exerciseMinutes:  return 30
        case .mindfulMinutes:   return 10
        case .flightsClimbed:   return 10
        case .sleep: return 8
        case .sleepConsistency: return 80
        case .bloodOxygen: return 96
        case .protein: return 120
        case .waterIntake: return 2.5
        case .daylightExposure: return 45
        default:                return nil
        }
    }

    /// Whether higher values are "better" (for semantic tint).
    public var isHigherBetter: Bool {
        switch self {
        case .heartRate, .restingHeartRate, .bodyWeight, .bloodPressure, .walkingAsymmetry, .doubleSupportTime, .groundContactTime, .fallEvents, .headphoneAudioLevels, .environmentalSoundLevels, .caffeineIntake, .inhalerUsage, .irregularRhythmEvents: return false
        default: return true
        }
    }
}
