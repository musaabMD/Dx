import SwiftUI
import ClerkKit

struct ContentView: View {
    @State private var appState = AppState()
    @State private var showSplash = true
    @Environment(Clerk.self) private var clerk

    var body: some View {
        ZStack {
            if showSplash {
                SplashView(showSplash: $showSplash)
            } else if clerk.user == nil {
                NewSignUpView()
            } else if appState.selectedExam == nil {
                ExamSelectionView()
            } else {
                NewMainDashboardView()
            }
        }
        .environment(appState)
        .tint(AppTheme.accentBlue)
        .fullScreenCover(isPresented: $appState.showPaywall) {
            NewPaywallView()
                .environment(appState)
        }
        .onChange(of: clerk.user?.id) { _, newValue in
            if newValue == nil {
                appState.signOut()
            } else {
                syncAppStateFromClerkUser()
            }
        }
        .task {
            if clerk.user != nil {
                syncAppStateFromClerkUser()
            }
        }
    }

    private func syncAppStateFromClerkUser() {
        guard let user = clerk.user else { return }
        let email = user.primaryEmailAddress?.emailAddress ?? "unknown@example.com"
        let name = [user.firstName, user.lastName]
            .compactMap { $0 }
            .joined(separator: " ")
            .trimmingCharacters(in: .whitespacesAndNewlines)
        appState.signUp(name: name.isEmpty ? "Clerk User" : name, email: email)
    }
}

#Preview { ContentView() }
