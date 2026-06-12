import SwiftUI

struct ScreenView: View {
    @EnvironmentObject var vm: HealthViewModel
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: Theme.Space.xl) {
                VStack(spacing: Theme.Space.sm) {
                    Image(systemName: "iphone.gen3")
                        .font(.system(size: 48, weight: .light))
                        .foregroundStyle(Theme.accent)
                    Text("Screen Time")
                        .font(.display(22))
                        .foregroundStyle(Theme.textPrimary(colorScheme))
                    Text("Screen time tracking coming soon.")
                        .font(.system(size: 14))
                        .foregroundStyle(Theme.textSecondary(colorScheme))
                        .multilineTextAlignment(.center)
                }
                .padding(.top, 60)
            }
            .padding(.horizontal, Theme.Space.lg)
        }
        .background(Theme.background.ignoresSafeArea())
    }
}

#Preview {
    ScreenView().environmentObject(HealthViewModel())
}
