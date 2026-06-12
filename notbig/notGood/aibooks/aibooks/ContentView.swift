import SwiftUI

struct ContentView: View {
    @StateObject private var vm = AppViewModel()

    var body: some View {
        TabView {
            LibraryTabView(vm: vm)
                .tabItem {
                    Label("Library", systemImage: "books.vertical")
                }

            DiscoverTabView(vm: vm)
                .tabItem {
                    Label("Discover", systemImage: "sparkles")
                }

            UpgradeTabView()
                .tabItem {
                    Label("Upgrade", systemImage: "crown")
                }
        }
        .tint(.blue)
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}
