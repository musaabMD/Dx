import SwiftUI

struct SettingsView: View {
    @EnvironmentObject var vm: HealthViewModel
    @Environment(\.colorScheme) var colorScheme

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                pageHeader
                profileCard
                appearanceSection
                cardStyleSection
                dataSourcesSection
                healthSection
                aboutSection
                Spacer(minLength: 8)
            }
            .padding(.horizontal, 16)
            .padding(.top, 8)
        }
        .background(Color(.systemBackground).ignoresSafeArea())
    }

    // MARK: - Page Header

    private var pageHeader: some View {
        HStack {
            Text("Profile")
                .font(.system(size: 24, weight: .bold, design: .rounded))
                .foregroundColor(textPrimary)
            Spacer()
        }
        .padding(.top, 16)
        .padding(.bottom, 4)
    }

    // MARK: - Profile Card

    private var profileCard: some View {
        HStack(spacing: 16) {
            ZStack {
                Circle()
                    .fill(
                        LinearGradient(
                            colors: [Color(red: 0.25, green: 0.60, blue: 0.95),
                                     Color(red: 0.50, green: 0.30, blue: 0.90)],
                            startPoint: .topLeading, endPoint: .bottomTrailing
                        )
                    )
                    .frame(width: 58, height: 58)
                Text(String(vm.userName.prefix(1)))
                    .font(.system(size: 22, weight: .bold))
                    .foregroundColor(.white)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(vm.userName)
                    .font(.system(size: 17, weight: .bold))
                    .foregroundColor(textPrimary)
                HStack(spacing: 8) {
                    Label("Age \(vm.userAge)", systemImage: "calendar")
                    Label("Bio Age \(vm.biologicalAge)", systemImage: "figure.run")
                }
                .font(.system(size: 12))
                .foregroundColor(textSecondary)
            }

            Spacer()

            Image(systemName: "chevron.right")
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(textSecondary)
        }
        .padding(16)
        .background(cardBg)
        .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 18, style: .continuous)
                .stroke(borderColor, lineWidth: 1)
        )
    }

    // MARK: - Appearance

    private var appearanceSection: some View {
        VStack(spacing: 0) {
            sectionHeader("Appearance")

            VStack(spacing: 12) {
                // Header row with contextual icon + caption
                HStack(spacing: 14) {
                    settingIcon(
                        systemName: vm.appearanceMode.icon,
                        color: appearanceAccentColor(for: vm.appearanceMode)
                    )

                    VStack(alignment: .leading, spacing: 2) {
                        Text("Theme")
                            .font(.system(size: 15, weight: .medium))
                            .foregroundColor(textPrimary)
                        Text(appearanceCaption)
                            .font(.system(size: 12))
                            .foregroundColor(textSecondary)
                    }

                    Spacer()
                }

                // 3-way segmented picker: System / Light / Dark
                HStack(spacing: 6) {
                    ForEach(AppearanceMode.allCases) { mode in
                        appearanceChip(mode)
                    }
                }
            }
            .padding(14)
            .background(cardBg)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(borderColor, lineWidth: 1)
            )
        }
    }

    private var appearanceCaption: String {
        switch vm.appearanceMode {
        case .system: return "Follows device setting"
        case .light:  return "Always light"
        case .dark:   return "Always dark"
        }
    }

    private func appearanceAccentColor(for mode: AppearanceMode) -> Color {
        switch mode {
        case .system: return Color(red: 0.35, green: 0.70, blue: 1.0)
        case .light:  return Color(red: 1.0, green: 0.75, blue: 0.20)
        case .dark:   return Color(red: 0.55, green: 0.50, blue: 1.0)
        }
    }

    private func appearanceChip(_ mode: AppearanceMode) -> some View {
        let active = vm.appearanceMode == mode
        let accent = appearanceAccentColor(for: mode)

        return Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                vm.appearanceMode = mode
            }
        } label: {
            VStack(spacing: 4) {
                Image(systemName: mode.icon)
                    .font(.system(size: 13, weight: .semibold))
                Text(mode.label)
                    .font(.system(size: 12, weight: .semibold))
            }
            .foregroundColor(active ? accent : textSecondary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 10)
            .background(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .fill(active ? accent.opacity(0.15) : Color.clear)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 12, style: .continuous)
                    .stroke(active ? accent.opacity(0.45) : borderColor, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Card Style

    private var cardStyleSection: some View {
        VStack(spacing: 0) {
            sectionHeader("Card Layout")

            VStack(spacing: 10) {
                // Wrapping picker grid — fits all styles on two rows.
                LazyVGrid(
                    columns: Array(repeating: GridItem(.flexible(), spacing: 6), count: 4),
                    spacing: 6
                ) {
                    ForEach(CardStyle.allCases) { style in
                        cardStyleChip(style)
                    }
                }

                // Live preview of the chosen style
                if let preview = vm.categories.first {
                    CategoryRowCard(item: preview, style: vm.cardStyle)
                        .allowsHitTesting(false)
                        .transition(.opacity.combined(with: .scale(scale: 0.97)))
                        .animation(.spring(response: 0.35, dampingFraction: 0.85),
                                   value: vm.cardStyle)
                }

                // Caption
                HStack {
                    Image(systemName: vm.cardStyle.icon)
                        .font(.system(size: 10, weight: .semibold))
                        .foregroundColor(textSecondary)
                    Text(vm.cardStyle.caption)
                        .font(.system(size: 11))
                        .foregroundColor(textSecondary)
                    Spacer()
                }
            }
            .padding(14)
            .background(cardBg)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(borderColor, lineWidth: 1)
            )
        }
    }

    private func cardStyleChip(_ style: CardStyle) -> some View {
        let active = vm.cardStyle == style
        let accent = Color(red: 0.35, green: 0.70, blue: 1.0)

        return Button {
            withAnimation(.spring(response: 0.3, dampingFraction: 0.8)) {
                vm.cardStyle = style
            }
        } label: {
            VStack(spacing: 4) {
                Image(systemName: style.icon)
                    .font(.system(size: 12, weight: .semibold))
                Text(style.label)
                    .font(.system(size: 11, weight: .semibold))
                    .lineLimit(1)
                    .minimumScaleFactor(0.85)
            }
            .foregroundColor(active ? accent : textSecondary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 9)
            .background(
                RoundedRectangle(cornerRadius: 11, style: .continuous)
                    .fill(active ? accent.opacity(0.15) : Color.clear)
            )
            .overlay(
                RoundedRectangle(cornerRadius: 11, style: .continuous)
                    .stroke(active ? accent.opacity(0.45) : borderColor, lineWidth: 1)
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Data Sources (Apple Health + Screen Time)

    private var dataSourcesSection: some View {
        VStack(spacing: 12) {
            sectionHeader("Data Sources")
            appleHealthCard
            screenTimeCard
        }
    }

    // MARK: Apple Health card

    private var appleHealthCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 14) {
                settingIcon(
                    systemName: "heart.text.square.fill",
                    color: Color(red: 0.95, green: 0.30, blue: 0.35)
                )

                VStack(alignment: .leading, spacing: 2) {
                    Text("Apple Health")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(textPrimary)
                    Text(healthStatusText)
                        .font(.system(size: 12))
                        .foregroundColor(textSecondary)
                }

                Spacer()

                if vm.isSyncingHealth {
                    ProgressView()
                        .controlSize(.small)
                } else {
                    healthStatusBadge
                }
            }

            Button {
                Task { await vm.connectHealthKit() }
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: healthButtonIcon)
                        .font(.system(size: 13, weight: .semibold))
                    Text(healthButtonLabel)
                        .font(.system(size: 14, weight: .semibold))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(Color(red: 0.95, green: 0.30, blue: 0.35))
                )
            }
            .buttonStyle(.plain)
            .disabled(vm.isSyncingHealth)

            if let last = vm.lastHealthSync {
                Text("Last sync \(last.formatted(date: .abbreviated, time: .shortened))")
                    .font(.system(size: 11))
                    .foregroundColor(textSecondary)
            }
        }
        .padding(14)
        .background(cardBg)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(borderColor, lineWidth: 1)
        )
    }

    // MARK: Screen Time card

    private var screenTimeCard: some View {
        let accent = Color(red: 0.35, green: 0.55, blue: 0.95)
        let unavailable = vm.screenTime.authState == .unavailable

        return VStack(alignment: .leading, spacing: 12) {
            HStack(spacing: 14) {
                settingIcon(systemName: "hourglass", color: accent)

                VStack(alignment: .leading, spacing: 2) {
                    Text("Screen Time")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundColor(textPrimary)
                    Text(screenTimeStatusText)
                        .font(.system(size: 12))
                        .foregroundColor(textSecondary)
                }

                Spacer()

                if vm.isConnectingScreenTime {
                    ProgressView()
                        .controlSize(.small)
                } else {
                    screenTimeStatusBadge
                }
            }

            Button {
                Task { await vm.connectScreenTime() }
            } label: {
                HStack(spacing: 8) {
                    Image(systemName: screenTimeButtonIcon)
                        .font(.system(size: 13, weight: .semibold))
                    Text(screenTimeButtonLabel)
                        .font(.system(size: 14, weight: .semibold))
                }
                .foregroundColor(.white)
                .frame(maxWidth: .infinity)
                .padding(.vertical, 12)
                .background(
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(unavailable ? Color.gray : accent)
                )
            }
            .buttonStyle(.plain)
            .disabled(vm.isConnectingScreenTime || unavailable)

            if let last = vm.screenTime.lastConnected {
                Text("Connected \(last.formatted(date: .abbreviated, time: .shortened))")
                    .font(.system(size: 11))
                    .foregroundColor(textSecondary)
            }
        }
        .padding(14)
        .background(cardBg)
        .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
        .overlay(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .stroke(borderColor, lineWidth: 1)
        )
    }

    private var screenTimeStatusText: String {
        switch vm.screenTime.authState {
        case .unknown:     return "Tap to connect and read app & device usage."
        case .unavailable: return "Not available on this device or simulator."
        case .denied:      return "Access denied. Enable in Settings › Screen Time."
        case .authorized:  return "Connected · usage data available."
        }
    }

    private var screenTimeStatusBadge: some View {
        let (label, color): (String, Color) = {
            switch vm.screenTime.authState {
            case .authorized:  return ("Live", Color(red: 0.20, green: 0.80, blue: 0.45))
            case .denied:      return ("Denied", Color(red: 0.95, green: 0.35, blue: 0.35))
            case .unavailable: return ("N/A", .gray)
            case .unknown:     return ("Off", .gray)
            }
        }()
        return Text(label)
            .font(.system(size: 10, weight: .bold))
            .foregroundColor(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(Capsule().fill(color.opacity(0.15)))
            .overlay(Capsule().stroke(color.opacity(0.35), lineWidth: 1))
    }

    private var screenTimeButtonLabel: String {
        switch vm.screenTime.authState {
        case .authorized:  return "Connected"
        case .denied:      return "Re-request Access"
        case .unavailable: return "Unavailable"
        case .unknown:     return "Connect Screen Time"
        }
    }

    private var screenTimeButtonIcon: String {
        switch vm.screenTime.authState {
        case .authorized:  return "checkmark.circle.fill"
        case .denied:      return "exclamationmark.triangle.fill"
        case .unavailable: return "xmark.circle.fill"
        case .unknown:     return "hourglass"
        }
    }

    private var healthStatusText: String {
        switch vm.healthKit.authState {
        case .unknown:     return "Tap to connect and pull real activity, heart & sleep data."
        case .unavailable: return "Not available on this device."
        case .denied:      return "Access denied. Enable in Settings › Health › Apps."
        case .authorized:
            let live = vm.categories.reduce(0) { $0 + $1.subMetrics.filter(\.isLive).count }
            return live > 0
                ? "Connected · \(live) live metric\(live == 1 ? "" : "s")"
                : "Connected · no data yet"
        }
    }

    private var healthStatusBadge: some View {
        let (label, color): (String, Color) = {
            switch vm.healthKit.authState {
            case .authorized:  return ("Live", Color(red: 0.20, green: 0.80, blue: 0.45))
            case .denied:      return ("Denied", Color(red: 0.95, green: 0.35, blue: 0.35))
            case .unavailable: return ("N/A", .gray)
            case .unknown:     return ("Off", .gray)
            }
        }()
        return Text(label)
            .font(.system(size: 10, weight: .bold))
            .foregroundColor(color)
            .padding(.horizontal, 8)
            .padding(.vertical, 4)
            .background(
                Capsule().fill(color.opacity(0.15))
            )
            .overlay(Capsule().stroke(color.opacity(0.35), lineWidth: 1))
    }

    private var healthButtonLabel: String {
        switch vm.healthKit.authState {
        case .authorized: return "Sync Now"
        case .denied:     return "Re-request Access"
        default:          return "Connect Apple Health"
        }
    }

    private var healthButtonIcon: String {
        switch vm.healthKit.authState {
        case .authorized: return "arrow.clockwise"
        default:          return "heart.fill"
        }
    }

    // MARK: - Health Settings

    private var healthSection: some View {
        VStack(spacing: 0) {
            sectionHeader("Health Profile")

            VStack(spacing: 1) {
                settingRow(
                    icon: "person.fill", iconColor: Color(red: 0.25, green: 0.70, blue: 0.95),
                    title: "Biological Sex",
                    value: vm.biologicalSex.capitalized
                ) {
                    vm.biologicalSex = vm.biologicalSex == "male" ? "female" : "male"
                }

                Divider()
                    .padding(.leading, 52)
                    .opacity(colorScheme == .dark ? 0.08 : 0.10)

                settingRow(
                    icon: "calendar", iconColor: Color(red: 0.35, green: 0.85, blue: 0.60),
                    title: "Chronological Age",
                    value: "\(vm.userAge) yrs"
                ) { }

                Divider()
                    .padding(.leading, 52)
                    .opacity(colorScheme == .dark ? 0.08 : 0.10)

                settingRow(
                    icon: "figure.run", iconColor: Color(red: 1.0, green: 0.55, blue: 0.20),
                    title: "Biological Age",
                    value: "\(vm.biologicalAge) yrs"
                ) { }
            }
            .background(cardBg)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(borderColor, lineWidth: 1)
            )
        }
    }

    // MARK: - About

    private var aboutSection: some View {
        VStack(spacing: 0) {
            sectionHeader("About")

            VStack(spacing: 1) {
                infoRow(icon: "info.circle.fill", iconColor: Color(red: 0.25, green: 0.70, blue: 0.95),
                        title: "Version", value: "1.0.0")

                Divider().padding(.leading, 52).opacity(0.08)

                infoRow(icon: "shield.lefthalf.filled", iconColor: Color(red: 0.55, green: 0.50, blue: 1.0),
                        title: "Privacy Policy", value: "")

                Divider().padding(.leading, 52).opacity(0.08)

                infoRow(icon: "doc.text.fill", iconColor: Color(red: 0.35, green: 0.85, blue: 0.60),
                        title: "Terms of Service", value: "")
            }
            .background(cardBg)
            .clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
            .overlay(
                RoundedRectangle(cornerRadius: 16, style: .continuous)
                    .stroke(borderColor, lineWidth: 1)
            )
        }
    }

    // MARK: - Helpers

    private func sectionHeader(_ title: String) -> some View {
        HStack {
            Text(title)
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(textSecondary)
                .textCase(.uppercase)
                .tracking(0.5)
            Spacer()
        }
        .padding(.bottom, 8)
    }

    private func settingIcon(systemName: String, color: Color) -> some View {
        ZStack {
            RoundedRectangle(cornerRadius: 9, style: .continuous)
                .fill(color.opacity(0.16))
                .frame(width: 34, height: 34)
            Image(systemName: systemName)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(color)
        }
    }

    private func settingRow(icon: String, iconColor: Color, title: String, value: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            HStack(spacing: 14) {
                settingIcon(systemName: icon, color: iconColor)

                Text(title)
                    .font(.system(size: 15, weight: .medium))
                    .foregroundColor(textPrimary)

                Spacer()

                Text(value)
                    .font(.system(size: 14))
                    .foregroundColor(textSecondary)

                Image(systemName: "chevron.right")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(textSecondary.opacity(0.5))
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 13)
        }
        .buttonStyle(.plain)
    }

    private func infoRow(icon: String, iconColor: Color, title: String, value: String) -> some View {
        HStack(spacing: 14) {
            settingIcon(systemName: icon, color: iconColor)

            Text(title)
                .font(.system(size: 15, weight: .medium))
                .foregroundColor(textPrimary)

            Spacer()

            if !value.isEmpty {
                Text(value)
                    .font(.system(size: 14))
                    .foregroundColor(textSecondary)
            }

            Image(systemName: "chevron.right")
                .font(.system(size: 11, weight: .semibold))
                .foregroundColor(textSecondary.opacity(0.5))
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 13)
    }

    // MARK: - Colors

    private var cardBg: Color {
        colorScheme == .dark ? Color(white: 0.115) : .white
    }

    private var textPrimary: Color {
        colorScheme == .dark ? .white : Color(red: 0.08, green: 0.08, blue: 0.10)
    }

    private var textSecondary: Color {
        colorScheme == .dark ? .white.opacity(0.40) : .black.opacity(0.42)
    }

    private var borderColor: Color {
        colorScheme == .dark ? .white.opacity(0.07) : .black.opacity(0.06)
    }
}

#Preview {
    SettingsView().environmentObject(HealthViewModel())
}
