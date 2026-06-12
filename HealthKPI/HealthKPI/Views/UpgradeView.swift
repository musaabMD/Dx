import SwiftUI

struct UpgradeView: View {
    @Environment(\.colorScheme) var colorScheme
    @State private var showConfetti: Bool = false

    private let goldColor  = Color(red: 1.0,  green: 0.75, blue: 0.20)
    private let goldLight  = Color(red: 1.0,  green: 0.88, blue: 0.50)

    // One-time purchase price.
    private let priceAmount = "$60"

    private let features: [(icon: String, title: String, subtitle: String)] = [
        ("brain.head.profile",        "Unlimited AI Chat",         "Ask unlimited health questions"),
        ("chart.xyaxis.line",         "Full History & Trends",     "6 months of health data"),
        ("bell.badge.fill",           "Smart Reminders",           "Personalised daily nudges"),
        ("person.2.fill",             "Family Sharing",            "Track up to 4 family members"),
        ("waveform.path.ecg.rectangle","Advanced Analytics",       "Deep-dive reports & insights"),
        ("lock.shield.fill",          "Priority Support",          "24/7 dedicated health support"),
    ]

    var body: some View {
        ZStack {
            bgColor.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 0) {
                    heroSection
                    priceCard
                    featuresList
                    ctaButton
                    footerNote
                    Spacer(minLength: 8)
                }
            }
        }
    }

    // MARK: - Hero

    private var heroSection: some View {
        VStack(spacing: 14) {
            ZStack {
                Circle()
                    .fill(goldColor.opacity(colorScheme == .dark ? 0.14 : 0.10))
                    .frame(width: 80, height: 80)
                Circle()
                    .fill(goldColor.opacity(colorScheme == .dark ? 0.08 : 0.06))
                    .frame(width: 110, height: 110)
                Image(systemName: "crown.fill")
                    .font(.system(size: 34, weight: .semibold))
                    .foregroundStyle(
                        LinearGradient(
                            colors: [goldColor, goldLight],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
            }
            .padding(.top, 28)

            Text("healthbase Pro")
                .font(.system(size: 26, weight: .black, design: .rounded))
                .foregroundColor(textPrimary)

            Text("Unlock your full health potential\nwith advanced insights and AI.")
                .font(.system(size: 14, weight: .regular))
                .foregroundColor(textSecondary)
                .multilineTextAlignment(.center)
                .lineSpacing(3)
        }
        .padding(.horizontal, 24)
        .padding(.bottom, 28)
    }

    // MARK: - Price Card (one-time purchase)

    private var priceCard: some View {
        VStack(spacing: 8) {
            // "Lifetime" label pill
            Text("LIFETIME ACCESS")
                .font(.system(size: 10, weight: .bold))
                .tracking(1.2)
                .foregroundColor(goldColor)
                .padding(.horizontal, 10)
                .padding(.vertical, 4)
                .background(Capsule().fill(goldColor.opacity(colorScheme == .dark ? 0.22 : 0.18)))

            HStack(alignment: .lastTextBaseline, spacing: 6) {
                Text(priceAmount)
                    .font(.system(size: 52, weight: .black, design: .rounded))
                    .foregroundStyle(
                        LinearGradient(colors: [goldColor, goldLight],
                                       startPoint: .topLeading,
                                       endPoint: .bottomTrailing)
                    )
                Text("one-time")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(textSecondary)
            }

            Text("Pay once. Yours forever. No subscription.")
                .font(.system(size: 12, weight: .medium))
                .foregroundColor(goldColor.opacity(0.85))
        }
        .padding(.vertical, 22)
        .frame(maxWidth: .infinity)
        .background(
            RoundedRectangle(cornerRadius: 20, style: .continuous)
                .fill(
                    colorScheme == .dark
                        ? LinearGradient(
                            colors: [Color(red: 0.14, green: 0.13, blue: 0.07),
                                     Color(red: 0.12, green: 0.11, blue: 0.06)],
                            startPoint: .topLeading, endPoint: .bottomTrailing
                        )
                        : LinearGradient(
                            colors: [Color(red: 1.0, green: 0.97, blue: 0.88),
                                     Color(red: 1.0, green: 0.94, blue: 0.78)],
                            startPoint: .topLeading, endPoint: .bottomTrailing
                        )
                )
                .overlay(
                    RoundedRectangle(cornerRadius: 20, style: .continuous)
                        .stroke(goldColor.opacity(0.30), lineWidth: 1)
                )
        )
        .padding(.horizontal, 20)
        .padding(.bottom, 24)
    }

    // MARK: - Features

    private var featuresList: some View {
        VStack(spacing: 0) {
            HStack {
                Text("Everything in Pro")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(textSecondary)
                    .textCase(.uppercase)
                    .tracking(0.5)
                Spacer()
            }
            .padding(.horizontal, 22)
            .padding(.bottom, 12)

            VStack(spacing: 10) {
                ForEach(features, id: \.title) { feature in
                    HStack(spacing: 14) {
                        ZStack {
                            RoundedRectangle(cornerRadius: 10, style: .continuous)
                                .fill(goldColor.opacity(colorScheme == .dark ? 0.14 : 0.10))
                                .frame(width: 40, height: 40)
                            Image(systemName: feature.icon)
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(goldColor)
                        }

                        VStack(alignment: .leading, spacing: 2) {
                            Text(feature.title)
                                .font(.system(size: 14, weight: .semibold))
                                .foregroundColor(textPrimary)
                            Text(feature.subtitle)
                                .font(.system(size: 12))
                                .foregroundColor(textSecondary)
                        }

                        Spacer()

                        Image(systemName: "checkmark.circle.fill")
                            .font(.system(size: 16))
                            .foregroundColor(goldColor)
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(cardBg)
                    )
                }
            }
            .padding(.horizontal, 20)
        }
        .padding(.bottom, 28)
    }

    // MARK: - CTA

    private var ctaButton: some View {
        Button {
            withAnimation(.spring(response: 0.35, dampingFraction: 0.6)) {
                showConfetti = true
            }
        } label: {
            HStack(spacing: 10) {
                Image(systemName: "crown.fill")
                    .font(.system(size: 15, weight: .bold))
                Text("Unlock Pro — \(priceAmount) once")
                    .font(.system(size: 16, weight: .bold))
            }
            .foregroundColor(Color(red: 0.08, green: 0.06, blue: 0.02))
            .frame(maxWidth: .infinity)
            .padding(.vertical, 17)
            .background(
                RoundedRectangle(cornerRadius: 18, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [goldLight, goldColor],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .shadow(color: goldColor.opacity(0.45), radius: 16, x: 0, y: 6)
            )
        }
        .buttonStyle(.plain)
        .padding(.horizontal, 20)
        .padding(.bottom, 12)
        .scaleEffect(showConfetti ? 0.96 : 1.0)
        .animation(.spring(response: 0.25, dampingFraction: 0.6), value: showConfetti)
    }

    private var footerNote: some View {
        Text("One-time payment · Lifetime updates · Restore purchases")
            .font(.system(size: 11))
            .foregroundColor(textSecondary.opacity(0.7))
            .multilineTextAlignment(.center)
            .padding(.horizontal, 24)
    }

    // MARK: - Colors

    private var bgColor: Color {
        colorScheme == .dark
            ? Color(red: 0.07, green: 0.07, blue: 0.09)
            : Color(red: 0.96, green: 0.96, blue: 0.98)
    }

    private var cardBg: Color {
        colorScheme == .dark ? Color(white: 0.115) : .white
    }

    private var textPrimary: Color {
        colorScheme == .dark ? .white : Color(red: 0.08, green: 0.08, blue: 0.10)
    }

    private var textSecondary: Color {
        colorScheme == .dark ? .white.opacity(0.40) : .black.opacity(0.42)
    }
}

#Preview {
    UpgradeView()
}
