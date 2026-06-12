//
//  _9WidgetsApp.swift
//  99Widgets
//
//  Created by Musaab-HQ on 20/04/2026.
//

import SwiftUI

@main
struct _9WidgetsApp: App {
    @StateObject private var viewModel = MainAppViewModel()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(viewModel)
        }
    }
}
