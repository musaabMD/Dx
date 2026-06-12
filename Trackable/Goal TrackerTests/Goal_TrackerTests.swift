//
//  Goal_TrackerTests.swift
//  Goal TrackerTests
//
//  Created by Musaab-HQ on 12/05/2026.
//

import Testing
import Foundation
@testable import Goal_Tracker

struct Goal_TrackerTests {

    @Test func goalStoresMetricConfiguration() async throws {
        let goal = Goal(
            title: "Steps",
            metricType: .steps,
            sourceType: .healthKit,
            targetValue: 10_000,
            currentValue: 2_500,
            unit: "steps",
            goalDirection: .increase,
            isStreakGoal: true,
            streakCount: 3,
            sortOrder: 1
        )

        #expect(goal.metricType == .steps)
        #expect(goal.sourceType == .healthKit)
        #expect(goal.period == .daily)
        #expect(goal.goalDirection == .increase)
        #expect(goal.isStreakGoal)
        #expect(goal.streakCount == 3)
    }

    @MainActor
    @Test func storeKitProductIDsMatchPaywallPlans() async throws {
        #expect(AppStoreModel.productIDs == [
            "trackable.pro.weekly",
            "trackable.pro.monthly",
            "trackable.pro.yearly",
            "trackable.pro.lifetime"
        ])
    }

    @Test func unavailableMetricsAreNotSelectable() async throws {
        #expect(!MetricType.selectableCases.contains(.screenTime))
        #expect(!MetricType.selectableCases.contains(.appUsage))
        #expect(!MetricType.selectableCases.contains(.appCategory))
        #expect(!MetricType.selectableCases.contains(.appBlocking))
        #expect(!MetricType.selectableCases.contains(.sleepConsistency))
        #expect(!MetricType.selectableCases.contains(.chargingHabits))
        #expect(MetricType.selectableCases.contains(.focusSessions))
    }

    @Test func screenTimeUnavailableReasonIsExplicit() async throws {
        #expect(MetricType.screenTime.unavailableReason.contains("Device Activity"))
        #expect(MetricType.appBlocking.unavailableReason.contains("Family Controls"))
    }

    @MainActor
    @Test func focusHoursCountsActiveAndCompletedSessionsToday() async throws {
        let now = Date()
        let completed = FocusSession(startedAt: now.addingTimeInterval(-7_200), endedAt: now.addingTimeInterval(-3_600))
        let active = FocusSession(startedAt: now.addingTimeInterval(-1_800))

        let hours = ContentView.focusHoursToday(from: [completed, active], now: now)

        #expect(hours > 1.49)
        #expect(hours < 1.51)
    }

    @MainActor
    @Test func locationHoursUsesRecordedHomeAndOutsideSamples() async throws {
        let now = Date()
        let samples = [
            LocationActivitySample(recordedAt: now.addingTimeInterval(-3_600), latitude: 24.0, longitude: 46.0, isAtHome: true),
            LocationActivitySample(recordedAt: now.addingTimeInterval(-1_800), latitude: 24.1, longitude: 46.1, isAtHome: false),
            LocationActivitySample(recordedAt: now.addingTimeInterval(-900), latitude: 24.1, longitude: 46.1, isAtHome: false)
        ]

        let homeHours = ContentView.locationHoursToday(from: samples, isAtHome: true, now: now)
        let outsideHours = ContentView.locationHoursToday(from: samples, isAtHome: false, now: now)

        #expect(homeHours > 0.49)
        #expect(homeHours < 0.51)
        #expect(outsideHours > 0.49)
        #expect(outsideHours < 0.76)
    }

    @MainActor
    @Test func locationHoursReturnsZeroWhenThereAreNoSamples() async throws {
        #expect(ContentView.locationHoursToday(from: [], isAtHome: true) == 0)
        #expect(ContentView.locationHoursToday(from: [], isAtHome: false) == 0)
    }

}
