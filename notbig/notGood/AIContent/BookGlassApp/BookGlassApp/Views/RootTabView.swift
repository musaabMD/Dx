import SwiftUI

struct RootTabView: View {
    @StateObject private var libraryVM = LibraryViewModel()

    var body: some View {
        TabView {
            NavigationStack {
                LibraryView(libraryVM: libraryVM)
            }
            .tabItem {
                Label("Library", systemImage: "books.vertical")
            }

            NavigationStack {
                DiscoverView(libraryVM: libraryVM)
            }
            .tabItem {
                Label("Discover", systemImage: "sparkles")
            }

            NavigationStack {
                UpgradeView()
            }
            .tabItem {
                Label("Upgrade", systemImage: "crown")
            }
        }
    }
}
