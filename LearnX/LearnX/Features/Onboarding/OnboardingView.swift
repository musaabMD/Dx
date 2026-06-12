import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject private var flow: AppFlowViewModel
    @State private var page: Int = 0
    @State private var iconScale: CGFloat = 0.8
    @State private var iconOpacity: Double = 0

    private let pages: [OnboardingPage] = [
        OnboardingPage(
            systemImage: "sparkles",
            title: "Learn anything,\nyour way",
            subtitle: "Type a topic and AI instantly builds a structured course with lessons and exercises tailored to you.",
            accentColor: DesignTokens.ColorToken.brand,
            backgroundColors: [Color(hex: 0x004A99), Color(hex: 0x007AFF)]
        ),
        OnboardingPage(
            systemImage: "rectangle.grid.2x2.fill",
            title: "6 ways to\npractice",
            subtitle: "Quizzes, flashcards, speaking, images, fill-in-the-blank, and AI-mixed exercises keep learning fresh.",
            accentColor: Color(hex: 0x32ADE6),
            backgroundColors: [Color(hex: 0x0E7490), Color(hex: 0x14B8A6)]
        ),
        OnboardingPage(
            systemImage: "chart.line.uptrend.xyaxis",
            title: "Track your\nprogress",
            subtitle: "Daily streaks, XP milestones, and per-course analytics keep you motivated and on track.",
            accentColor: Color(hex: 0x10B981),
            backgroundColors: [Color(hex: 0x059669), Color(hex: 0x34D399)]
        ),
        OnboardingPage(
            systemImage: "square.and.arrow.up.fill",
            title: "Share with\nanyone",
            subtitle: "Public or private links let friends and students learn from your courses — no app required.",
            accentColor: Color(hex: 0xF59E0B),
            backgroundColors: [Color(hex: 0xD97706), Color(hex: 0xFBBF24)]
        ),
    ]

    var body: some View {
        ZStack(alignment: .top) {
            // Page content
            TabView(selection: $page) {
                ForEach(Array(pages.enumerated()), id: \.offset) { idx, p in
                    OnboardingPageView(page: p)
                        .tag(idx)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))
            .animation(.easeInOut(duration: 0.3), value: page)
            .ignoresSafeArea()

            // Top bar
            HStack {
                // Back / logo area
                if page > 0 {
                    Button {
                        withAnimation(.easeInOut(duration: 0.25)) { page -= 1 }
                    } label: {
                        Image(systemName: "chevron.left")
                            .font(.body.weight(.semibold))
                            .foregroundStyle(.white)
                            .frame(width: 40, height: 40)
                            .background {
                                Circle()
                                    .fill(.clear)
                                    .glassEffect(.regular, in: Circle())
                            }
                            .overlay {
                                Circle()
                                    .strokeBorder(Color.white.opacity(0.35), lineWidth: 0.75)
                            }
                    }
                } else {
                    Spacer().frame(width: 36, height: 36)
                }

                Spacer()

                Button("Skip") { flow.skipOnboarding() }
                    .font(.system(size: 15, weight: .semibold))
                    .foregroundStyle(Color.white.opacity(0.85))
            }
            .padding(.horizontal, 24)
            .padding(.top, 56)

            // Bottom bar
            VStack(spacing: 0) {
                Spacer()

                VStack(spacing: 20) {
                    // Page dots
                    HStack(spacing: 8) {
                        ForEach(0..<pages.count, id: \.self) { idx in
                            Capsule()
                                .fill(Color.white.opacity(idx == page ? 1 : 0.3))
                                .frame(width: idx == page ? 24 : 8, height: 8)
                                .animation(.spring(response: 0.35, dampingFraction: 0.7), value: page)
                        }
                    }

                    // Primary CTA
                    Button(action: primaryAction) {
                        Text(page == pages.count - 1 ? "Get Started" : "Continue")
                            .font(.headline)
                            .foregroundStyle(.white)
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 16)
                            .background {
                                RoundedRectangle(cornerRadius: 16, style: .continuous)
                                    .fill(.white.opacity(0.18))
                                    .glassEffect(.regular, in: RoundedRectangle(cornerRadius: 16, style: .continuous))
                            }
                            .overlay {
                                RoundedRectangle(cornerRadius: 16, style: .continuous)
                                    .strokeBorder(Color.white.opacity(0.4), lineWidth: 1)
                            }
                    }
                    .buttonStyle(.plain)

                    if page == pages.count - 1 {
                        Button("I already have an account") { flow.skipOnboarding() }
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundStyle(Color.white.opacity(0.75))
                    } else {
                        Color.clear.frame(height: 20)
                    }
                }
                .padding(.horizontal, 24)
                .padding(.bottom, 48)
            }
        }
    }

    private func primaryAction() {
        if page < pages.count - 1 {
            withAnimation(.easeInOut(duration: 0.25)) { page += 1 }
        } else {
            flow.finishOnboarding()
        }
    }
}

// MARK: - Data model
private struct OnboardingPage {
    let systemImage: String
    let title: String
    let subtitle: String
    let accentColor: Color
    let backgroundColors: [Color]
}

// MARK: - Page View
private struct OnboardingPageView: View {
    let page: OnboardingPage
    @State private var appeared = false

    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: page.backgroundColors,
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            // Decorative circles
            GeometryReader { geo in
                Circle()
                    .fill(Color.white.opacity(0.08))
                    .frame(width: 280, height: 280)
                    .offset(x: geo.size.width - 100, y: 60)
                    .blur(radius: 1)

                Circle()
                    .fill(Color.white.opacity(0.05))
                    .frame(width: 180, height: 180)
                    .offset(x: -40, y: geo.size.height - 200)
            }

            VStack(spacing: 0) {
                Spacer()
                    .frame(height: 120)

                // Illustration / icon
                ZStack {
                    Circle()
                        .fill(.clear)
                        .frame(width: 132, height: 132)
                        .glassEffect(.regular, in: Circle())
                        .overlay {
                            Circle()
                                .strokeBorder(Color.white.opacity(0.35), lineWidth: 1)
                        }

                    Image(systemName: page.systemImage)
                        .font(.system(size: 48, weight: .semibold))
                        .foregroundStyle(.white)
                }
                .scaleEffect(appeared ? 1.0 : 0.7)
                .opacity(appeared ? 1.0 : 0)

                Spacer().frame(height: 48)

                VStack(spacing: 16) {
                    Text(page.title)
                        .font(.largeTitle.weight(.bold))
                        .foregroundStyle(.white)
                        .multilineTextAlignment(.center)
                        .lineSpacing(2)
                        .offset(y: appeared ? 0 : 20)
                        .opacity(appeared ? 1 : 0)

                    Text(page.subtitle)
                        .font(.body)
                        .foregroundStyle(Color.white.opacity(0.88))
                        .multilineTextAlignment(.center)
                        .lineSpacing(4)
                        .padding(.horizontal, 8)
                        .offset(y: appeared ? 0 : 20)
                        .opacity(appeared ? 1 : 0)
                }
                .padding(.horizontal, 28)

                Spacer()
            }
        }
        .onAppear {
            withAnimation(.spring(response: 0.55, dampingFraction: 0.72)) {
                appeared = true
            }
        }
        .onDisappear {
            appeared = false
        }
    }
}
