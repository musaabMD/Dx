import SwiftUI

struct SplashView: View {
    @EnvironmentObject private var flow: AppFlowViewModel

    @State private var logoScale: CGFloat = 0.7
    @State private var logoOpacity: Double = 0
    @State private var titleOpacity: Double = 0
    @State private var taglineOpacity: Double = 0

    var body: some View {
        ZStack {
            DesignTokens.ColorToken.gradientHero
                .ignoresSafeArea()

            GeometryReader { geo in
                Circle()
                    .fill(Color.white.opacity(0.08))
                    .frame(width: 300, height: 300)
                    .offset(x: geo.size.width * 0.55, y: -80)
                    .blur(radius: 2)

                Circle()
                    .fill(Color.white.opacity(0.06))
                    .frame(width: 200, height: 200)
                    .offset(x: -60, y: geo.size.height * 0.6)
            }

            VStack(spacing: 0) {
                Spacer()

                Text("LX")
                    .font(.largeTitle.weight(.black))
                    .foregroundStyle(.white)
                    .frame(width: 112, height: 112)
                    .background {
                        Circle()
                            .fill(.clear)
                            .glassEffect(.regular, in: Circle())
                    }
                    .overlay {
                        Circle()
                            .strokeBorder(Color.white.opacity(0.35), lineWidth: 1)
                    }
                    .scaleEffect(logoScale)
                    .opacity(logoOpacity)

                Spacer().frame(height: 28)

                VStack(spacing: 8) {
                    Text("LearnX")
                        .font(.largeTitle.weight(.bold))
                        .foregroundStyle(.white)
                        .opacity(titleOpacity)

                    Text("Create. Share. Learn.")
                        .font(.body)
                        .foregroundStyle(Color.white.opacity(0.8))
                        .opacity(taglineOpacity)
                }

                Spacer()

                ProgressView()
                    .tint(.white.opacity(0.75))
                    .padding(.bottom, 52)
                    .opacity(taglineOpacity)
            }
        }
        .onAppear {
            withAnimation(.spring(response: 0.7, dampingFraction: 0.75)) {
                logoScale = 1.0
                logoOpacity = 1.0
            }
            withAnimation(.easeOut(duration: 0.45).delay(0.3)) {
                titleOpacity = 1.0
            }
            withAnimation(.easeOut(duration: 0.4).delay(0.5)) {
                taglineOpacity = 1.0
            }

            Task {
                try? await Task.sleep(nanoseconds: 1_400_000_000)
                await MainActor.run { flow.splashFinished() }
            }
        }
    }
}
