//
//  ContentView.swift
//  99Widgets
//
//  Created by Musaab-HQ on 20/04/2026.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        HomeShellView()
    }
}

#Preview {
    ContentView()
        .environmentObject(MainAppViewModel())
}
