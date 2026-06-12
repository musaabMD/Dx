import SwiftUI

struct MainTabView: View {
    @EnvironmentObject private var shell: AppShellViewModel
    @EnvironmentObject private var createCourse: CreateCourseViewModel

    var body: some View {
        TabView(selection: $shell.selectedTab) {
            Tab("Home", systemImage: "house.fill", value: AppShellViewModel.Tab.library) {
                NavigationStack { LibraryView() }
            }

            Tab("Create", systemImage: "plus.circle.fill", value: AppShellViewModel.Tab.create) {
                // Placeholder — selecting this tab opens the sheet via onChange
                Color.clear
            }

            Tab("Stats", systemImage: "chart.bar.fill", value: AppShellViewModel.Tab.stats) {
                NavigationStack { StatsView() }
            }

            Tab("Profile", systemImage: "person.circle.fill", value: AppShellViewModel.Tab.profile) {
                NavigationStack { ProfileView() }
            }
        }
        .tint(DesignTokens.ColorToken.brand)
        .toolbarBackground(.ultraThinMaterial, for: .tabBar)
        .toolbarBackground(.visible, for: .tabBar)
        .onChange(of: shell.selectedTab) { _, newTab in
            if newTab == .create {
                createCourse.reset()
                shell.isCreateCoursePresented = true
                shell.selectedTab = shell.previousTab
            } else {
                shell.previousTab = newTab
            }
        }
        .sheet(isPresented: $shell.isCreateCoursePresented) {
            CreateCourseFlowView()
                .environmentObject(createCourse)
                .environmentObject(shell)
                .presentationDetents([.large])
                .presentationDragIndicator(.visible)
        }
        .onAppear {
            shell.seedStarterLibraryIfNeeded()
        }
    }
}
