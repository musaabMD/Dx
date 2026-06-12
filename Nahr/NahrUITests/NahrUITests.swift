import XCTest

final class NahrUITests: XCTestCase {

    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    @MainActor
    func testLaunchShowsMainNavigation() throws {
        let app = XCUIApplication()
        app.launchArguments.append("--uitesting")
        app.launch()

        XCTAssertTrue(app.staticTexts["الرئيسية"].waitForExistence(timeout: 5) || app.staticTexts["Home"].waitForExistence(timeout: 5))
    }
}
