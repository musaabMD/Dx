import SwiftUI

struct NewPaywallView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    @State private var selectedPlan: BillingPlan = .yearly

    enum BillingPlan: CaseIterable {
        case monthly
        case yearly

        var title: String {
            switch self {
            case .monthly: return "Monthly"
            case .yearly: return "Yearly"
            }
        }

        var priceText: String {
            switch self {
            case .monthly: return "$25"
            case .yearly: return "$180"
            }
        }

        var periodText: String {
            switch self {
            case .monthly: return "/month"
            case .yearly: return "/year"
            }
        }

        var footnote: String {
            switch self {
            case .monthly: return "Billed monthly"
            case .yearly: return "Billed yearly • Save 40%"
            }
        }

        var renewalText: String {
            switch self {
            case .monthly: return "Then $25/month after trial"
            case .yearly: return "Then $180/year after trial"
            }
        }
    }

    private let benefits = [
        ("sparkles.rectangle.stack.fill", "AI Explanations", "Understand every mistake instantly with clear, focused breakdowns."),
        ("chart.line.uptrend.xyaxis", "Score Growth", "Track performance trends and improve weaker areas faster."),
        ("bookmark.circle.fill", "Smart Library", "Save key questions and build high-yield revision sets."),
        ("clock.arrow.2.circlepath", "Fast Review", "Revisit incorrect and flagged questions in one tap.")
    ]

    var body: some View {
        ZStack(alignment: .bottom) {
            AppTheme.backgroundGradient.ignoresSafeArea()

            ScrollView {
                VStack(alignment: .leading, spacing: 16) {
                    topBar
                    heroCard
                    planPicker
                    benefitsSection
                    trustRow
                    Spacer(minLength: 140)
                }
                .padding(.horizontal, 16)
                .padding(.top, 12)
            }

            stickyPricingBar
        }
        .toolbar(.hidden, for: .navigationBar)
    }

    private var topBar: some View {
        HStack {
            Button { dismiss() } label: {
                Image(systemName: "xmark")
                    .font(.system(size: 14, weight: .bold))
                    .foregroundStyle(AppTheme.secondaryText)
                    .frame(width: 34, height: 34)
                    .background(AppTheme.surface.opacity(0.82))
                    .clipShape(Circle())
                    .overlay(
                        Circle()
                            .stroke(AppTheme.divider, lineWidth: 1)
                    )
            }

            Spacer()

            Button("Restore") {}
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(AppTheme.secondaryText)
        }
    }

    private var heroCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            ZStack(alignment: .topTrailing) {
                RoundedRectangle(cornerRadius: 20, style: .continuous)
                    .fill(
                        LinearGradient(
                            colors: [AppTheme.accentBlue.opacity(0.92), AppTheme.accentBlue.opacity(0.62)],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        )
                    )
                    .frame(height: 180)
                    .overlay(alignment: .bottomLeading) {
                        Image(systemName: "crown.fill")
                            .font(.system(size: 48, weight: .bold))
                            .foregroundStyle(.white.opacity(0.95))
                            .padding(18)
                    }

                Text("7 DAYS FREE")
                    .font(.caption.weight(.heavy))
                    .foregroundStyle(AppTheme.accentBlue)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(.white)
                    .clipShape(Capsule())
                    .padding(12)
            }

            Text("Upgrade to Premium")
                .font(.title2.weight(.bold))
                .foregroundStyle(AppTheme.primaryText)

            Text("Unlock full access and accelerate your score with personalized practice.")
                .font(.subheadline)
                .foregroundStyle(AppTheme.secondaryText)
        }
    }

    private var planPicker: some View {
        HStack(spacing: 10) {
            ForEach(BillingPlan.allCases, id: \.self) { plan in
                Button {
                    selectedPlan = plan
                } label: {
                    VStack(alignment: .leading, spacing: 4) {
                        HStack {
                            Text(plan.title)
                                .font(.subheadline.weight(.semibold))
                                .foregroundStyle(AppTheme.primaryText)
                            Spacer()
                            if plan == .yearly {
                                Text("Best Value")
                                    .font(.caption2.weight(.bold))
                                    .foregroundStyle(AppTheme.accentBlue)
                            }
                        }
                        Text("\(plan.priceText)\(plan.periodText)")
                            .font(.subheadline.weight(.bold))
                            .foregroundStyle(AppTheme.primaryText)
                        Text(plan.footnote)
                            .font(.caption)
                            .foregroundStyle(AppTheme.secondaryText)
                    }
                    .padding(12)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(AppTheme.surface.opacity(0.93))
                    .clipShape(RoundedRectangle(cornerRadius: 14, style: .continuous))
                    .overlay(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .stroke(selectedPlan == plan ? AppTheme.accentBlue : AppTheme.divider, lineWidth: selectedPlan == plan ? 2 : 1)
                    )
                }
                .buttonStyle(.plain)
            }
        }
    }

    private var benefitsSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("What you get")
                .font(.headline.weight(.bold))
                .foregroundStyle(AppTheme.primaryText)

            ForEach(benefits, id: \.1) { item in
                HStack(alignment: .top, spacing: 12) {
                    Image(systemName: item.0)
                        .font(.subheadline.weight(.semibold))
                        .foregroundStyle(AppTheme.accentBlue)
                        .frame(width: 24, height: 24)
                        .background(AppTheme.accentBlue.opacity(0.14))
                        .clipShape(Circle())

                    VStack(alignment: .leading, spacing: 2) {
                        Text(item.1)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(AppTheme.primaryText)
                        Text(item.2)
                            .font(.caption)
                            .foregroundStyle(AppTheme.secondaryText)
                            .fixedSize(horizontal: false, vertical: true)
                    }

                    Spacer(minLength: 0)
                }
                .padding(12)
                .background(AppTheme.surface.opacity(0.93))
                .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
                .overlay(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .stroke(AppTheme.divider, lineWidth: 1)
                )
            }
        }
    }

    private var trustRow: some View {
        HStack(spacing: 10) {
            trustChip("Cancel anytime")
            trustChip("No charge today")
            trustChip("Secure billing")
        }
    }

    private var stickyPricingBar: some View {
        VStack(spacing: 8) {
            Divider().opacity(0.2)

            HStack(alignment: .center, spacing: 10) {
                VStack(alignment: .leading, spacing: 2) {
                    HStack(spacing: 4) {
                        Text(selectedPlan.priceText)
                            .font(.title3.weight(.bold))
                            .foregroundStyle(AppTheme.primaryText)
                        Text(selectedPlan.periodText)
                            .font(.subheadline.weight(.semibold))
                            .foregroundStyle(AppTheme.secondaryText)
                    }
                    Text(selectedPlan.renewalText)
                        .font(.caption)
                        .foregroundStyle(AppTheme.secondaryText)
                }

                Spacer()

                Button {
                    appState.upgradeToPremium()
                    dismiss()
                } label: {
                    Text("Start Free Trial")
                        .font(.headline.weight(.bold))
                        .foregroundStyle(.white)
                        .padding(.horizontal, 20)
                        .padding(.vertical, 12)
                        .background(AppTheme.accentBlue)
                        .clipShape(Capsule())
                }
            }
            .padding(.horizontal, 16)
            .padding(.top, 10)
            .padding(.bottom, 12)
            .background(AppTheme.bgBottom)
        }
    }

    @ViewBuilder
    private func trustChip(_ title: String) -> some View {
        Text(title)
            .font(.caption.weight(.semibold))
            .foregroundStyle(AppTheme.secondaryText)
            .padding(.horizontal, 10)
            .padding(.vertical, 6)
            .background(AppTheme.surface.opacity(0.9))
            .clipShape(Capsule())
            .overlay(
                Capsule().stroke(AppTheme.divider, lineWidth: 1)
            )
    }
}

#Preview { NewPaywallView().environment(AppState()) }
