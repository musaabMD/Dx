//
//  _9recipeTests.swift
//  99recipeTests
//
//  Created by Musaab-HQ on 27/04/2026.
//

import Testing
@testable import _9recipe

struct _9recipeTests {

    @MainActor
    @Test func flowAdvancesFromSplashToMainApp() async throws {
        let viewModel = AppViewModel()
        #expect(viewModel.flowStage == .splash)

        viewModel.advanceFromSplash()
        #expect(viewModel.flowStage == .onboarding)

        for _ in 0..<viewModel.onboardingPages.count {
            viewModel.nextOnboardingStep()
        }
        #expect(viewModel.flowStage == .goalSetup)

        viewModel.completeGoalSetup()
        #expect(viewModel.flowStage == .paywall)

        viewModel.enterMainApp()
        #expect(viewModel.flowStage == .mainApp)
    }

    @MainActor
    @Test func addingMealUpdatesDailyTotals() async throws {
        let viewModel = AppViewModel()
        let baselineCalories = viewModel.caloriesConsumed
        let baselineProtein = viewModel.proteinConsumed

        viewModel.addManualMeal()

        #expect(viewModel.todayMeals.first?.name == "Manual Meal")
        #expect(viewModel.caloriesConsumed > baselineCalories)
        #expect(viewModel.proteinConsumed > baselineProtein)
    }
}
