import SwiftUI

struct ProfileView: View {
    @EnvironmentObject private var shell: AppShellViewModel
    @State private var isEditing = false

    private var initials: String {
        shell.profile.name
            .split(separator: " ")
            .prefix(2)
            .map { String($0.prefix(1)) }
            .joined()
            .uppercased()
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                profileHero

                statsStrip

                settingsSection(title: "Account") {
                    settingsRow(icon: "person.fill", tint: DesignTokens.ColorToken.brand, label: "Name") {
                        Text(shell.profile.name)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                    settingsRow(icon: "envelope.fill", tint: DesignTokens.ColorToken.brand, label: "Email") {
                        Text(shell.profile.email)
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                    }
                }

                settingsSection(title: "Subscription") {
                    settingsRow(icon: "bolt.circle.fill", tint: DesignTokens.ColorToken.xp, label: "Credits") {
                        Text("\(shell.profile.creditsRemaining)")
                            .font(.subheadline.weight(.semibold))
                    }
                    settingsRow(icon: "crown.fill", tint: DesignTokens.ColorToken.xp, label: "Plan") {
                        Text("Monthly")
                            .font(.caption.weight(.semibold))
                            .padding(.horizontal, 10)
                            .padding(.vertical, 5)
                            .background(.thinMaterial, in: Capsule())
                    }
                }

                settingsSection(title: "App") {
                    settingsRow(icon: "star.fill", tint: DesignTokens.ColorToken.xp, label: "Rate LearnX") {
                        Image(systemName: "chevron.right")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.tertiary)
                    }
                    settingsRow(icon: "square.and.arrow.up", tint: DesignTokens.ColorToken.brand, label: "Share") {
                        Image(systemName: "chevron.right")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.tertiary)
                    }
                    settingsRow(icon: "questionmark.circle", tint: .secondary, label: "Help") {
                        Image(systemName: "chevron.right")
                            .font(.caption.weight(.semibold))
                            .foregroundStyle(.tertiary)
                    }
                }

                Button(role: .destructive) {} label: {
                    Text("Sign Out")
                        .font(.body.weight(.semibold))
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                }
                .buttonStyle(.bordered)
                .tint(.red.opacity(0.9))

                Text("LearnX 1.0")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
                    .padding(.bottom, 24)
            }
            .padding(.horizontal, 20)
            .padding(.top, 12)
        }
        .liquidAppBackground()
        .navigationTitle("Profile")
        .navigationBarTitleDisplayMode(.large)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Edit") { isEditing = true }
                    .font(.body.weight(.semibold))
            }
        }
        .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
        .sheet(isPresented: $isEditing) {
            ProfileSheetView(profile: $shell.profile)
        }
    }

    private var profileHero: some View {
        VStack(spacing: 14) {
            Text(initials.isEmpty ? "LX" : initials)
                .font(.title.weight(.bold))
                .foregroundStyle(.primary)
                .frame(width: 88, height: 88)
                .liquidGlassCard(cornerRadius: 28)
                .liquidFloatShadow()

            VStack(spacing: 4) {
                Text(shell.profile.name)
                    .font(.title3.weight(.semibold))
                Text(shell.profile.email)
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 20)
        .liquidGlassCard(cornerRadius: LiquidGlass.cardRadius)
        .liquidFloatShadow()
    }

    private var statsStrip: some View {
        HStack(spacing: 0) {
            statPill(value: "\(shell.profile.streakDays)", label: "Streak", icon: "flame.fill", color: DesignTokens.ColorToken.streak)
            Divider().frame(height: 36).opacity(0.25)
            statPill(value: "\(shell.profile.totalXP)", label: "XP", icon: "bolt.fill", color: DesignTokens.ColorToken.xp)
            Divider().frame(height: 36).opacity(0.25)
            statPill(value: "\(shell.courses.count)", label: "Courses", icon: "book.fill", color: DesignTokens.ColorToken.brand)
        }
        .padding(.vertical, 12)
        .liquidGlassCard(cornerRadius: LiquidGlass.cardRadius)
        .liquidFloatShadow()
    }

    private func statPill(value: String, label: String, icon: String, color: Color) -> some View {
        VStack(spacing: 4) {
            HStack(spacing: 4) {
                Image(systemName: icon)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(color)
                Text(value)
                    .font(.headline.weight(.bold))
            }
            Text(label)
                .font(.caption2.weight(.medium))
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
    }

    private func settingsSection<Content: View>(title: String, @ViewBuilder content: () -> Content) -> some View {
        VStack(alignment: .leading, spacing: 8) {
            Text(title)
                .font(.footnote.weight(.semibold))
                .foregroundStyle(.secondary)
                .textCase(.uppercase)

            VStack(spacing: 0) {
                content()
            }
            .liquidGlassCard(cornerRadius: LiquidGlass.cardRadius)
            .liquidFloatShadow()
        }
    }

    private func settingsRow<Trailing: View>(icon: String, tint: Color, label: String, @ViewBuilder trailing: () -> Trailing) -> some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(tint)
                .frame(width: 28, height: 28)
                .background(tint.opacity(0.12), in: RoundedRectangle(cornerRadius: 8, style: .continuous))

            Text(label)
                .font(.body.weight(.medium))

            Spacer()

            trailing()
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 12)
    }
}
