//
//  NewSignUpView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI
import ClerkKit
import ClerkKitUI

struct NewSignUpView: View {
    @Environment(AppState.self) private var appState
    @Environment(Clerk.self) private var clerk
    
    var body: some View {
        ZStack {
            AppTheme.backgroundGradient.ignoresSafeArea()

            VStack(spacing: 18) {
                VStack(spacing: 12) {
                    Image(systemName: "graduationcap.circle.fill")
                        .font(.system(size: 72))
                        .foregroundStyle(AppTheme.accentBlue)

                    Text("TestPrep")
                        .font(.largeTitle.bold())
                        .foregroundStyle(AppTheme.primaryText)

                    Text("Sign in with Apple or Google")
                        .font(.subheadline)
                        .foregroundStyle(AppTheme.secondaryText)
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 16)

                AuthView(mode: .signInOrUp, isDismissable: false)
                    .environment(Clerk.shared)
            }
            .padding(.horizontal, 16)
        }
        .onChange(of: clerk.user?.id) { _, _ in
            if let user = clerk.user {
                let email = user.primaryEmailAddress?.emailAddress ?? "unknown@example.com"
                let name = [user.firstName, user.lastName]
                    .compactMap { $0 }
                    .joined(separator: " ")
                    .trimmingCharacters(in: .whitespacesAndNewlines)
                appState.signUp(name: name.isEmpty ? "Clerk User" : name, email: email)
                Task {
                    try? await ConvexUserService.syncCurrentUser(
                        name: name.isEmpty ? "Clerk User" : name,
                        isPremium: appState.currentUser?.isPremium
                    )
                }
            }
        }
        .task {
            if let user = clerk.user {
                let email = user.primaryEmailAddress?.emailAddress ?? "unknown@example.com"
                let name = [user.firstName, user.lastName]
                    .compactMap { $0 }
                    .joined(separator: " ")
                    .trimmingCharacters(in: .whitespacesAndNewlines)
                appState.signUp(name: name.isEmpty ? "Clerk User" : name, email: email)
                try? await ConvexUserService.syncCurrentUser(
                    name: name.isEmpty ? "Clerk User" : name,
                    isPremium: appState.currentUser?.isPremium
                )
            }
        }
    }
}

#Preview {
    NewSignUpView()
        .environment(AppState())
        .environment(Clerk.shared)
}
