import SwiftUI

struct UpgradeView: View {
    var body: some View {
        ZStack {
            LinearGradient(
                colors: [Color.blue.opacity(0.25), Color.cyan.opacity(0.2), Color.white],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 16) {
                Text("Upgrade")
                    .font(.largeTitle.bold())

                Text("Unlock unlimited summaries, deeper chat context, and premium voices.")
                    .multilineTextAlignment(.center)
                    .foregroundStyle(.secondary)

                Button("Go Premium") {}
                    .buttonStyle(.borderedProminent)
            }
            .padding()
            .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 24, style: .continuous))
            .padding()
        }
    }
}
