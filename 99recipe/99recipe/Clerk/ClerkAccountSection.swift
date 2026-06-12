import SwiftUI
import ClerkKit
import ClerkKitUI

struct ClerkAccountSection: View {
    @Environment(Clerk.self) private var clerk
    @State private var authPresented = false

    var body: some View {
        Section {
            if let user = clerk.user {
                HStack {
                    Text("Signed in")
                    Spacer()
                    Text(String(user.id.prefix(12)))
                        .font(.caption.monospaced())
                        .foregroundStyle(.secondary)
                }
            }
            HStack {
                UserButton(
                    signedOutContent: {
                        Button("Sign in") { authPresented = true }
                    }
                )
                .prefetchClerkImages()
            }
        } header: {
            Text("Account (Clerk)")
        }
        .sheet(isPresented: $authPresented) {
            AuthView()
        }
    }
}
