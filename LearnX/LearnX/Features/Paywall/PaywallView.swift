import SwiftUI

struct PaywallView: View {
    @EnvironmentObject private var flow: AppFlowViewModel
    @State private var appeared = false

    private let features: [(String, String)] = [
        ("Unlimited AI courses", "sparkles"),
        ("All 6 exercise types", "rectangle.grid.2x2.fill"),
        ("Progress tracking & streaks", "chart.line.uptrend.xyaxis"),
        ("Public & private sharing", "square.and.arrow.up.fill"),
        ("100 AI credits / month", "bolt.circle.fill"),
    ]

    var body: some View {
        ZStack(alignment: .bottom) {
            LiquidBackdrop()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    heroSection
                    contentSection
                }
            }
            .ignoresSafeArea(edges: .top)

            bottomCTA
        }
        .onAppear {
            withAnimation(.spring(response: 0.55, dampingFraction: 0.78).delay(0.08)) {
                appeared = true
            }
        }
    }

    private var heroSection: some View {
        ZStack(alignment: .bottom) {
            LinearGradient(
                colors: [Color(hex: 0x0A2540), Color(hex: 0x1E5AA8), Color(hex: 0x2B8CFF)],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .frame(height: 300)

            GeometryReader { geo in
                Circle()
                    .fill(Color.white.opacity(0.08))
                    .frame(width: 240, height: 240)
                    .offset(x: geo.size.width - 70, y: -50)
                Circle()
                    .fill(Color.white.opacity(0.05))
                    .frame(width: 140, height: 140)
                    .offset(x: -30, y: 70)
            }
            .frame(height: 300)

            VStack(spacing: 14) {
                Text("LX")
                    .font(.title.weight(.black))
                    .foregroundStyle(.white)
                    .frame(width: 72, height: 72)
                    .background {
                        Circle()
                            .fill(.clear)
                            .glassEffect(.regular, in: Circle())
                    }
                    .overlay {
                        Circle()
                            .strokeBorder(Color.white.opacity(0.35), lineWidth: 1)
                    }

                Text("Unlock LearnX")
                    .font(.largeTitle.weight(.bold))
                    .foregroundStyle(.white)
                    .multilineTextAlignment(.center)

                HStack(spacing: 6) {
                    HStack(spacing: 2) {
                        ForEach(0..<5, id: \.self) { _ in
                            Image(systemName: "star.fill")
                                .font(.caption2)
                                .foregroundStyle(Color(hex: 0xFBBF24))
                        }
                    }
                    Text("50,000+ learners")
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(.white.opacity(0.92))
                }
                .padding(.horizontal, 14)
                .padding(.vertical, 8)
                .background {
                    Capsule()
                        .fill(.white.opacity(0.14))
                        .glassEffect(.regular, in: Capsule())
                }
            }
            .padding(.bottom, 28)
            .scaleEffect(appeared ? 1 : 0.94)
            .opacity(appeared ? 1 : 0)
        }
    }

    private var contentSection: some View {
        VStack(spacing: 20) {
            VStack(spacing: 0) {
                ForEach(Array(features.enumerated()), id: \.offset) { idx, item in
                    HStack(spacing: 14) {
                        Image(systemName: item.1)
                            .font(.body.weight(.semibold))
                            .foregroundStyle(DesignTokens.ColorToken.brand)
                            .frame(width: 36, height: 36)
                            .background(.thinMaterial, in: RoundedRectangle(cornerRadius: 10, style: .continuous))

                        Text(item.0)
                            .font(.subheadline.weight(.semibold))

                        Spacer()

                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(DesignTokens.ColorToken.success)
                            .imageScale(.large)
                    }
                    .padding(.vertical, 12)
                    .padding(.horizontal, 16)

                    if idx < features.count - 1 {
                        Divider()
                            .padding(.leading, 66)
                    }
                }
            }
            .liquidGlassCard(cornerRadius: LiquidGlass.cardRadius)
            .liquidFloatShadow()

            VStack(alignment: .leading, spacing: 10) {
                Text("Pricing")
                    .font(.footnote.weight(.semibold))
                    .foregroundStyle(.secondary)
                    .textCase(.uppercase)

                VStack(spacing: 0) {
                    pricingRow(
                        title: "24-hour trial",
                        badge: "Trial",
                        price: "$1.99",
                        detail: "Payment method required",
                        highlighted: true
                    )
                    Divider().padding(.horizontal, 16)
                    pricingRow(
                        title: "Monthly",
                        badge: nil,
                        price: "$25/mo",
                        detail: "100 AI credits / month",
                        highlighted: false
                    )
                }
                .liquidGlassCard(cornerRadius: LiquidGlass.cardRadius)
                .liquidFloatShadow()
            }

            Color.clear.frame(height: 120)
        }
        .padding(.horizontal, 20)
        .padding(.top, 20)
    }

    private var bottomCTA: some View {
        VStack(spacing: 10) {
            Button(action: { flow.completePaywallPurchase() }) {
                Text("Start trial — $1.99")
                    .font(.body.weight(.semibold))
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 14)
            }
            .buttonStyle(.borderedProminent)
            .tint(DesignTokens.ColorToken.brand)

            Text("Then $25/month · Cancel anytime")
                .font(.caption)
                .foregroundStyle(.secondary)

            HStack(spacing: 16) {
                Button("Restore") {}
                Button("Privacy") {}
                Button("Terms") {}
            }
            .font(.caption.weight(.semibold))
            .foregroundStyle(.secondary)

            Button("Continue in test mode (no auth)") {
                flow.continueWithoutAuthForTesting()
            }
            .font(.caption.weight(.semibold))
            .foregroundStyle(.secondary)
        }
        .padding(.horizontal, 20)
        .padding(.top, 12)
        .padding(.bottom, 28)
        .background(.ultraThinMaterial)
    }

    private func pricingRow(title: String, badge: String?, price: String, detail: String, highlighted: Bool) -> some View {
        HStack(alignment: .top, spacing: 12) {
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 8) {
                    Text(title)
                        .font(.headline)
                    if let badge {
                        Text(badge)
                            .font(.caption2.weight(.bold))
                            .padding(.horizontal, 8)
                            .padding(.vertical, 4)
                            .background(DesignTokens.ColorToken.brand.opacity(0.15), in: Capsule())
                    }
                }
                Text(detail)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
            Text(price)
                .font(.headline.weight(.bold))
                .foregroundStyle(highlighted ? DesignTokens.ColorToken.brand : .primary)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 14)
        .background(highlighted ? DesignTokens.ColorToken.brand.opacity(0.08) : Color.clear)
    }
}
