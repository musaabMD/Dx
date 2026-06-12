import SwiftUI

@main
struct NahrApp: App {
    @StateObject private var store = NahrStore()

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
                .environment(\.layoutDirection, store.settings.layoutDirection(for: store.settings.language))
                .environment(\.locale, store.settings.language.locale)
                .preferredColorScheme(store.settings.appearance.colorScheme)
        }
    }
}
