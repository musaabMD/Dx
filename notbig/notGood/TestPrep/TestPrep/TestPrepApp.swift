//
//  TestPrepApp.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI
import ClerkKit
import ClerkKitUI
import UIKit

@main
struct TestPrepApp: App {
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate

    private let clerkTheme = ClerkTheme(
        colors: .init(
            primary: AppTheme.accent,
            background: AppTheme.bgBottom,
            foreground: AppTheme.primaryText,
            mutedForeground: AppTheme.secondaryText,
            border: AppTheme.divider
        ),
        fonts: .init(fontFamily: "Avenir Next"),
        design: .init(borderRadius: 12)
    )

    init() {
        Clerk.configure(publishableKey: ClerkConfig.publishableKey)
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .prefetchClerkImages()
                .environment(Clerk.shared)
                .environment(\.clerkTheme, clerkTheme)
                .preferredColorScheme(.light) // Can be changed based on user preference
        }
    }
}
