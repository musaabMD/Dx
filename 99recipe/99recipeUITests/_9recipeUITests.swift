//
//  _9recipeUITests.swift
//  99recipeUITests
//
//  Created by Musaab-HQ on 27/04/2026.
//

import XCTest

final class _9recipeUITests: XCTestCase {

    override func setUpWithError() throws {
        // Put setup code here. This method is called before the invocation of each test method in the class.

        // In UI tests it is usually best to stop immediately when a failure occurs.
        continueAfterFailure = false

        // In UI tests it’s important to set the initial state - such as interface orientation - required for your tests before they run. The setUp method is a good place to do this.
    }

    override func tearDownWithError() throws {
        // Put teardown code here. This method is called after the invocation of each test method in the class.
    }

    @MainActor
    func testExample() throws {
        let app = XCUIApplication()
        app.launch()

        XCTAssertTrue(app.wait(for: .runningForeground, timeout: 5))

        let knownCTA = app.buttons["Continue"].firstMatch
        let alternativeOnboardingCTA = app.buttons["Start your journey"].firstMatch
        let clerkCTA = app.buttons["Sign in with Clerk"].firstMatch

        let ctaAppeared = knownCTA.waitForExistence(timeout: 10)
            || alternativeOnboardingCTA.waitForExistence(timeout: 1)
            || clerkCTA.waitForExistence(timeout: 1)
        let hasMainCTA = ctaAppeared || app.staticTexts["99Recipe"].exists
        XCTAssertTrue(hasMainCTA, "Expected onboarding or auth gate CTA to be visible on first launch.")
    }

    @MainActor
    func testLaunchPerformance() throws {
        // This measures how long it takes to launch your application.
        measure(metrics: [XCTApplicationLaunchMetric()]) {
            XCUIApplication().launch()
        }
    }
}
