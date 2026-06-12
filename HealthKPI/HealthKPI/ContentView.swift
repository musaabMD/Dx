//
//  ContentView.swift
//  HealthKPI
//
//  Created by Musaab-HQ on 22/04/2026.
//

import SwiftUI

struct ContentView: View {
    @StateObject private var vm = HealthViewModel()

    var body: some View {
        MainTabView()
            .environmentObject(vm)
            .preferredColorScheme(vm.appearanceMode.colorScheme)
            .task {
                await vm.connectHealthKit()
            }
    }
}

#Preview {
    ContentView()
}
