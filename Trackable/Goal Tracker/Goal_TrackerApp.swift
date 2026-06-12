import SwiftUI
import SwiftData

@main
struct Goal_TrackerApp: App {
    private let container = TrackableModelContainer.make()
    @State private var showSplash = true

    var body: some Scene {
        WindowGroup {
            ZStack {
                ContentView()
                    .modelContainer(container)
                if showSplash {
                    SplashView()
                        .transition(.opacity)
                        .zIndex(1)
                }
            }
            .task {
                try? await Task.sleep(nanoseconds: 1_800_000_000)
                withAnimation(.easeOut(duration: 0.55)) {
                    showSplash = false
                }
            }
        }
    }
}

enum TrackableModelContainer {
    static func make() -> ModelContainer {
        let schema = Schema([
            UserProfile.self,
            Goal.self,
            GoalSnapshot.self,
            WidgetConfig.self,
            SubscriptionState.self,
            FocusSession.self,
            LocationActivitySample.self
        ])

        do {
            let configuration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
            return try ModelContainer(for: schema, configurations: [configuration])
        } catch {
            let memoryConfiguration = ModelConfiguration(schema: schema, isStoredInMemoryOnly: true)
            do {
                return try ModelContainer(for: schema, configurations: [memoryConfiguration])
            } catch {
                fatalError("Trackable could not open storage: \(error)")
            }
        }
    }
}
