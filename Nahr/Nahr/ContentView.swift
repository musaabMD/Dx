import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var store: NahrStore
    @State private var selectedTab: RootTab = .home

    var body: some View {
        ZStack(alignment: .bottom) {
            LiquidBackground(accent: store.settings.accent.primary)
                .ignoresSafeArea()

            Group {
                switch selectedTab {
                case .home:
                    HomeView()
                case .planner:
                    PlannerView()
                case .tasks:
                    TasksView()
                case .search:
                    SearchView()
                case .settings:
                    SettingsView()
                }
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)

            FloatingTabBar(selectedTab: $selectedTab)
                .padding(.horizontal, 18)
                .padding(.bottom, 12)
        }
        .sheet(isPresented: $store.showQuickAdd) {
            QuickAddView()
                .environmentObject(store)
                .presentationDetents([.medium, .large])
                .presentationDragIndicator(.visible)
        }
        .sheet(item: $store.selectedEvent) { event in
            EventDetailView(event: event)
                .environmentObject(store)
                .presentationDetents([.medium, .large])
        }
        .fullScreenCover(isPresented: $store.showOnboarding) {
            OnboardingView()
                .environmentObject(store)
        }
    }
}

private enum RootTab: String, CaseIterable, Identifiable {
    case home
    case planner
    case tasks
    case search
    case settings

    var id: String { rawValue }

    var title: String {
        switch self {
        case .home: "Home"
        case .planner: "Planner"
        case .tasks: "Tasks"
        case .search: "Search"
        case .settings: "Settings"
        }
    }

    var arabicTitle: String {
        switch self {
        case .home: "الرئيسية"
        case .planner: "المخطط"
        case .tasks: "المهام"
        case .search: "البحث"
        case .settings: "الإعدادات"
        }
    }

    var icon: String {
        switch self {
        case .home: "sparkles.rectangle.stack"
        case .planner: "calendar"
        case .tasks: "checklist"
        case .search: "magnifyingglass"
        case .settings: "slider.horizontal.3"
        }
    }
}

private struct FloatingTabBar: View {
    @EnvironmentObject private var store: NahrStore
    @Binding var selectedTab: RootTab

    var body: some View {
        HStack(spacing: 10) {
            ForEach(RootTab.allCases) { tab in
                Button {
                    withAnimation(.spring(response: 0.34, dampingFraction: 0.84)) {
                        selectedTab = tab
                    }
                } label: {
                    VStack(spacing: 5) {
                        Image(systemName: tab.icon)
                            .font(.system(size: 16, weight: .semibold))
                        Text(store.text(ar: tab.arabicTitle, en: tab.title))
                            .font(.system(size: 11, weight: .semibold, design: .rounded))
                            .lineLimit(1)
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 10)
                    .foregroundStyle(selectedTab == tab ? Color.white : .white.opacity(0.68))
                    .background {
                        if selectedTab == tab {
                            Capsule()
                                .fill(store.settings.accent.primary.opacity(0.42))
                                .overlay {
                                    Capsule()
                                        .stroke(Color.white.opacity(0.28), lineWidth: 1)
                                }
                        }
                    }
                }
                .buttonStyle(.plain)
            }
        }
        .padding(10)
        .liquidGlass(style: .secondary, tint: store.settings.accent.primary.opacity(0.18), cornerRadius: 28)
    }
}
