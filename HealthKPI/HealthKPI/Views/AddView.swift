import SwiftUI

// MARK: - Add View
//
// Replaces the former "Ask" tab. A lightweight hub for logging
// new health data or adding indicators. Uses Liquid Glass visuals
// consistent with the rest of the app.

struct AddView: View {
    @EnvironmentObject var vm: HealthViewModel
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        NavigationStack {
            ZStack {
                backgroundGradient.ignoresSafeArea()

                ScrollView(showsIndicators: false) {
                    VStack(spacing: 24) {
                        header

                        // Quick-log: the four daily trackers
                        quickLogSection

                        // Broader actions
                        VStack(spacing: 10) {
                            AddOptionRow(
                                icon: "heart.text.square.fill",
                                tint: Theme.critical,
                                title: "Log a Metric",
                                subtitle: "Blood pressure, sleep, steps…"
                            )
                            AddOptionRow(
                                icon: "square.stack.3d.up.fill",
                                tint: Theme.accent,
                                title: "Add Indicator",
                                subtitle: "Track a new health category"
                            )
                            AddOptionRow(
                                icon: "doc.text.fill",
                                tint: Color(red: 0.34, green: 0.56, blue: 0.98),
                                title: "Import Lab Results",
                                subtitle: "Upload a PDF or photo"
                            )
                            AddOptionRow(
                                icon: "applewatch.side.right",
                                tint: Theme.fair,
                                title: "Connect Device",
                                subtitle: "Sync Apple Health or wearables"
                            )
                            AddOptionRow(
                                icon: "iphone.gen2",
                                tint: Color(red: 0.30, green: 0.55, blue: 0.98),
                                title: "Connect Screen Time",
                                subtitle: "Import phone usage, pickups & social"
                            )
                        }
                        .padding(.horizontal, 16)

                        Spacer(minLength: 16)
                    }
                    .padding(.top, 24)
                }
            }
            .navigationBarHidden(true)
            .toolbar(.hidden, for: .navigationBar)
        }
    }

    // MARK: - Header

    private var header: some View {
        VStack(alignment: .leading, spacing: 6) {
            Text("Add")
                .font(.system(size: 32, weight: .black, design: .rounded))
                .foregroundColor(textPrimary)
            Text("Log new data or expand what you track.")
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(textSecondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(.horizontal, 20)
    }

    // MARK: - Quick Log (daily trackers)

    private var quickLogSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Quick Log")
                .font(.system(size: 13, weight: .semibold))
                .foregroundColor(textSecondary)
                .textCase(.uppercase)
                .tracking(0.8)
                .padding(.horizontal, 20)

            LazyVGrid(
                columns: [
                    GridItem(.flexible(), spacing: 10),
                    GridItem(.flexible(), spacing: 10)
                ],
                spacing: 10
            ) {
                QuickLogTile(
                    icon: "drop.fill",
                    tint: Color(red: 0.26, green: 0.65, blue: 0.98),
                    title: "Water",
                    value: "1.9",
                    unit: "L",
                    caption: "Goal 2.5 L"
                )
                QuickLogTile(
                    icon: "flame.fill",
                    tint: Theme.poor,
                    title: "Calories",
                    value: "2,180",
                    unit: "kcal",
                    caption: "vs 2,360 TDEE"
                )
                QuickLogTile(
                    icon: "iphone.gen2",
                    tint: Color(red: 0.30, green: 0.55, blue: 0.98),
                    title: "Screen Time",
                    value: "4.2",
                    unit: "hrs",
                    caption: "Today"
                )
                QuickLogTile(
                    icon: "hand.tap.fill",
                    tint: Color(red: 0.55, green: 0.45, blue: 0.95),
                    title: "Pickups",
                    value: "86",
                    unit: "/day",
                    caption: "Every ~11 min"
                )
            }
            .padding(.horizontal, 16)
        }
    }

    // MARK: - Background

    private var backgroundGradient: some View {
        ZStack {
            Theme.background
            LinearGradient(
                colors: [
                    Theme.accent.opacity(colorScheme == .dark ? 0.08 : 0.05),
                    .clear
                ],
                startPoint: .top,
                endPoint: .center
            )
        }
    }

    // MARK: - Adaptive colors

    private var textPrimary: Color {
        colorScheme == .dark ? .white : Color(red: 0.08, green: 0.08, blue: 0.10)
    }

    private var textSecondary: Color {
        colorScheme == .dark ? .white.opacity(0.5) : .black.opacity(0.5)
    }
}

// MARK: - Row

private struct AddOptionRow: View {
    let icon: String
    let tint: Color
    let title: String
    let subtitle: String

    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        Button { } label: {
            HStack(spacing: 14) {
                ZStack {
                    RoundedRectangle(cornerRadius: 12, style: .continuous)
                        .fill(tint.opacity(0.18))
                        .frame(width: 44, height: 44)
                    Image(systemName: icon)
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(tint)
                }

                VStack(alignment: .leading, spacing: 3) {
                    Text(title)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundColor(textPrimary)
                    Text(subtitle)
                        .font(.system(size: 12))
                        .foregroundColor(textSecondary)
                }

                Spacer(minLength: 0)

                Image(systemName: "chevron.right")
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(textSecondary.opacity(0.7))
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .glassEffect(.regular.interactive(),
                         in: RoundedRectangle(cornerRadius: 18, style: .continuous))
        }
        .buttonStyle(.plain)
    }

    private var textPrimary: Color {
        colorScheme == .dark ? .white : Color(red: 0.08, green: 0.08, blue: 0.10)
    }

    private var textSecondary: Color {
        colorScheme == .dark ? .white.opacity(0.5) : .black.opacity(0.5)
    }
}

// MARK: - Quick Log Tile

private struct QuickLogTile: View {
    let icon: String
    let tint: Color
    let title: String
    let value: String
    let unit: String
    let caption: String

    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        Button { } label: {
            VStack(alignment: .leading, spacing: 10) {
                HStack(spacing: 8) {
                    ZStack {
                        Circle()
                            .fill(tint.opacity(0.18))
                            .frame(width: 30, height: 30)
                        Image(systemName: icon)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(tint)
                    }
                    Text(title)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(textPrimary)
                    Spacer(minLength: 0)
                    Image(systemName: "plus")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundColor(tint)
                        .padding(6)
                        .background(
                            Circle().fill(tint.opacity(0.15))
                        )
                }

                VStack(alignment: .leading, spacing: 2) {
                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        Text(value)
                            .font(.system(size: 24, weight: .bold, design: .rounded))
                            .foregroundColor(textPrimary)
                        Text(unit)
                            .font(.system(size: 12, weight: .semibold))
                            .foregroundColor(textSecondary)
                    }
                    Text(caption)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundColor(textSecondary)
                }
            }
            .padding(14)
            .frame(maxWidth: .infinity, alignment: .leading)
            .glassEffect(
                .regular.interactive(),
                in: RoundedRectangle(cornerRadius: 18, style: .continuous)
            )
        }
        .buttonStyle(.plain)
    }

    private var textPrimary: Color {
        colorScheme == .dark ? .white : Color(red: 0.08, green: 0.08, blue: 0.10)
    }

    private var textSecondary: Color {
        colorScheme == .dark ? .white.opacity(0.55) : .black.opacity(0.55)
    }
}

#Preview {
    AddView().environmentObject(HealthViewModel())
}
