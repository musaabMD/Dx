import SwiftUI

struct UpgradeTabView: View {
    var body: some View {
        NavigationStack {
            ZStack {
                AppBackground()

                VStack(spacing: 14) {
                    GlassCard {
                        VStack(alignment: .leading, spacing: 8) {
                            Text("AIBooks Plus")
                                .font(.title3).bold()
                            Text("Unlock faster models, longer chats, and premium voices for listening mode.")
                                .foregroundStyle(.secondary)
                            Button("Upgrade") {}
                                .buttonStyle(.borderedProminent)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }

                    GlassCard {
                        VStack(alignment: .leading, spacing: 6) {
                            Text("What You Get")
                                .font(.headline)
                            Text("• Unlimited summaries\n• Deep chapter discussions\n• Smart reading plans")
                                .foregroundStyle(.secondary)
                        }
                        .frame(maxWidth: .infinity, alignment: .leading)
                    }

                    Spacer()
                }
                .padding()
            }
            .navigationTitle("Upgrade")
        }
    }
}
