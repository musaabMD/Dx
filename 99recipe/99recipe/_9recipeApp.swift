//
//  _9recipeApp.swift
//  99recipe
//
//  Created by Musaab-HQ on 27/04/2026.
//

import SwiftUI
import ClerkKit
import ConvexMobile

@main
struct _9recipeApp: App {
    init() {
        if AppDeployment.isClerkEnabled {
            Clerk.configure(publishableKey: AppDeployment.clerkPublishableKey)
        }
        #if DEBUG
        initConvexLogging()
        #endif
    }

    var body: some Scene {
        WindowGroup {
            if !AppDeployment.isClerkEnabled {
                ContentView()
                    .environmentObject(ConvexService.shared)
            } else {
                ContentView()
                    .environmentObject(ConvexService.shared)
                    .environment(Clerk.shared)
            }
        }
    }
}
