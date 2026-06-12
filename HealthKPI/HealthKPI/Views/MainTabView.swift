import SwiftUI

struct MainTabView: View {
    @EnvironmentObject private var vm: HealthViewModel
    @Environment(\.colorScheme) private var colorScheme
    @State private var selectedTab: AppTab = .home
    @Namespace private var tabNS

    enum AppTab: Int, Hashable, CaseIterable {
        case home, ask, screen, stat, profile

        var icon: String {
            switch self {
            case .home:    return "house.fill"
            case .ask:     return "bubble.left.and.bubble.right.fill"
            case .screen:  return "iphone.gen3"
            case .stat:    return "chart.bar.xaxis"
            case .profile: return "person.crop.circle.fill"
            }
        }

        var label: String {
            switch self {
            case .home:    return "Home"
            case .ask:     return "Ask"
            case .screen:  return "Screen"
            case .stat:    return "Stat"
            case .profile: return "Profile"
            }
        }
    }

    var body: some View {
        VStack(spacing: 0) {
            headerBar

            TabView(selection: $selectedTab) {
                HomeView()
                    .tag(AppTab.home)
                AskView()
                    .tag(AppTab.ask)
                ScreenView()
                    .tag(AppTab.screen)
                StatView()
                    .tag(AppTab.stat)
                SettingsView()
                    .tag(AppTab.profile)
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .animation(.spring(response: 0.30, dampingFraction: 0.88), value: selectedTab)
        }
        .background(Theme.background.ignoresSafeArea())
    }

    // MARK: - Header

    private var headerBar: some View {
        ZStack {
            HStack {
                AppLogoMark()
                Spacer()
            }

            tabPicker
        }
        .padding(.horizontal, Theme.Space.lg)
        .padding(.top, 10)
        .padding(.bottom, 10)
        .background(Theme.background)
        .overlay(alignment: .bottom) {
            Rectangle()
                .fill(Theme.hairline(colorScheme))
                .frame(height: 0.33)
        }
    }

    // MARK: - Tab Pill Track

    private var tabPicker: some View {
        HStack(spacing: 0) {
            ForEach(AppTab.allCases, id: \.self) { tab in
                tabButton(tab)
            }
        }
        .padding(4)
        .background(
            Capsule()
                .fill(Theme.fillTrack(colorScheme).opacity(0.7))
        )
    }

    private func tabButton(_ tab: AppTab) -> some View {
        let isActive = selectedTab == tab

        return Button {
            withAnimation(.spring(response: 0.26, dampingFraction: 0.82)) {
                selectedTab = tab
            }
        } label: {
            ZStack {
                if isActive {
                    Capsule()
                        .fill(Theme.background)
                        .shadow(color: .black.opacity(colorScheme == .dark ? 0.35 : 0.10),
                                radius: 6, x: 0, y: 2)
                        .matchedGeometryEffect(id: "tabIndicator", in: tabNS)
                }

                VStack(spacing: 2) {
                    Image(systemName: tab.icon)
                        .font(.system(size: 13, weight: .semibold))
                        .scaleEffect(isActive ? 1.0 : 0.92)
                        .animation(.spring(response: 0.26, dampingFraction: 0.7), value: isActive)

                    Text(tab.label)
                        .font(.system(size: 9, weight: .medium, design: .rounded))
                }
                .foregroundStyle(
                    isActive
                        ? Theme.accent
                        : Theme.textSecondary(colorScheme).opacity(0.7)
                )
            }
            .frame(width: 56, height: 42)
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    MainTabView().environmentObject(HealthViewModel())
}
