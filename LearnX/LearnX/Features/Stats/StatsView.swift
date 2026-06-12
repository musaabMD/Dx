import SwiftUI

struct StatsView: View {
    @EnvironmentObject private var shell: AppShellViewModel
    @StateObject private var taskSync = ConvexTaskSyncViewModel()

    private let weekDays = ["M", "T", "W", "T", "F", "S", "S"]
    private let weekActivity: [Double] = [1.0, 0.6, 0.9, 0.0, 0.75, 0.4, 0.2]

    private var totalCourses: Int { shell.courses.count }
    private var avgProgress: Double {
        guard !shell.courses.isEmpty else { return 0 }
        return shell.courses.reduce(0) { $0 + $1.progress } / Double(shell.courses.count)
    }

    var body: some View {
        ScrollView(showsIndicators: false) {
            VStack(spacing: 20) {
                Text("Your learning momentum")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
                    .frame(maxWidth: .infinity, alignment: .leading)

                HStack(spacing: 12) {
                    StatHeroCard(
                        icon: "flame.fill",
                        iconColor: DesignTokens.ColorToken.streak,
                        value: "\(shell.profile.streakDays)",
                        label: "Day streak"
                    )
                    StatHeroCard(
                        icon: "bolt.circle.fill",
                        iconColor: DesignTokens.ColorToken.xp,
                        value: "\(shell.profile.totalXP)",
                        label: "Total XP"
                    )
                }

                xpMilestoneCard

                weeklyActivityCard

                VStack(alignment: .leading, spacing: 12) {
                    Text("Overview")
                        .font(.footnote.weight(.semibold))
                        .foregroundStyle(.secondary)
                        .textCase(.uppercase)

                    LazyVGrid(
                        columns: [GridItem(.flexible(), spacing: 12), GridItem(.flexible(), spacing: 12)],
                        spacing: 12
                    ) {
                        StatGridCell(title: "Courses", value: "\(totalCourses)", icon: "book.fill", color: DesignTokens.ColorToken.brand)
                        StatGridCell(title: "Avg progress", value: "\(Int(avgProgress * 100))%", icon: "chart.bar.fill", color: DesignTokens.ColorToken.success)
                        StatGridCell(title: "Credits", value: "\(shell.profile.creditsRemaining)", icon: "bolt.fill", color: DesignTokens.ColorToken.xp)
                        StatGridCell(title: "Best streak", value: "\(max(shell.profile.streakDays, 1))d", icon: "flame.fill", color: DesignTokens.ColorToken.streak)
                    }
                }

                convexTasksCard

                Color.clear.frame(height: 16)
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 24)
        }
        .liquidAppBackground()
        .navigationTitle("Stats")
        .navigationBarTitleDisplayMode(.large)
        .toolbarBackground(.ultraThinMaterial, for: .navigationBar)
        .task { taskSync.start() }
        .onDisappear { taskSync.stop() }
    }

    private var xpMilestoneCard: some View {
        let xp = shell.profile.totalXP
        let nextMilestone = nextXPMilestone(from: xp)
        let progress = Double(xp % nextMilestone) / Double(nextMilestone)

        return VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label("XP progress", systemImage: "trophy.fill")
                    .font(.subheadline.weight(.semibold))
                    .foregroundStyle(DesignTokens.ColorToken.xp)
                Spacer()
                Text("\(xp) / \(nextMilestone)")
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.secondary)
            }

            ZStack(alignment: .leading) {
                Capsule()
                    .fill(.thinMaterial)
                    .frame(height: 8)
                GeometryReader { geo in
                    Capsule()
                        .fill(DesignTokens.ColorToken.xp)
                        .frame(width: max(8, geo.size.width * progress), height: 8)
                }
                .frame(height: 8)
            }

            Text("Reach the next milestone to unlock rewards.")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding(18)
        .liquidGlassCard(cornerRadius: LiquidGlass.cardRadius)
        .liquidFloatShadow()
    }

    private func nextXPMilestone(from xp: Int) -> Int {
        let milestones = [100, 250, 500, 1000, 2500, 5000]
        return milestones.first(where: { $0 > xp }) ?? 5000
    }

    private var weeklyActivityCard: some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Text("This week")
                    .font(.headline)
                Spacer()
                Text("Activity")
                    .font(.caption.weight(.medium))
                    .foregroundStyle(.secondary)
            }

            HStack(spacing: 6) {
                ForEach(Array(zip(weekDays, weekActivity).enumerated()), id: \.offset) { _, pair in
                    let (day, activity) = pair
                    VStack(spacing: 6) {
                        ZStack(alignment: .bottom) {
                            RoundedRectangle(cornerRadius: 5, style: .continuous)
                                .fill(.thinMaterial)
                                .frame(height: 52)
                            RoundedRectangle(cornerRadius: 5, style: .continuous)
                                .fill(
                                    activity > 0
                                    ? DesignTokens.ColorToken.gradientBrand
                                    : LinearGradient(colors: [Color.clear], startPoint: .top, endPoint: .bottom)
                                )
                                .frame(height: max(6, 52 * activity))
                        }
                        .frame(maxWidth: .infinity)
                        Text(day)
                            .font(.caption2.weight(.semibold))
                            .foregroundStyle(activity > 0 ? .primary : .tertiary)
                    }
                }
            }
        }
        .padding(18)
        .liquidGlassCard(cornerRadius: LiquidGlass.cardRadius)
        .liquidFloatShadow()
    }

    private var convexTasksCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Label("Live from Convex", systemImage: "dot.radiowaves.left.and.right")
                    .font(.headline)
                Spacer()
                HStack(spacing: 6) {
                    Circle()
                        .fill(taskSync.isConnected ? DesignTokens.ColorToken.success : Color.orange.opacity(0.85))
                        .frame(width: 7, height: 7)
                    Text(taskSync.statusMessage)
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                        .lineLimit(1)
                }
            }

            if taskSync.todos.isEmpty {
                Text("Tasks will appear here when synced.")
                    .font(.subheadline)
                    .foregroundStyle(.secondary)
            } else {
                ForEach(taskSync.todos.prefix(5)) { todo in
                    HStack(spacing: 10) {
                        Image(systemName: todo.isCompleted ? "checkmark.circle.fill" : "circle")
                            .foregroundStyle(todo.isCompleted ? DesignTokens.ColorToken.success : Color.secondary.opacity(0.55))
                            .imageScale(.medium)
                        Text(todo.text)
                            .font(.subheadline.weight(.medium))
                            .lineLimit(1)
                        Spacer()
                    }
                }
            }
        }
        .padding(18)
        .liquidGlassCard(cornerRadius: LiquidGlass.cardRadius)
        .liquidFloatShadow()
    }
}

private struct StatHeroCard: View {
    let icon: String
    let iconColor: Color
    let value: String
    let label: String

    var body: some View {
        VStack(alignment: .leading, spacing: 10) {
            Image(systemName: icon)
                .font(.title3)
                .foregroundStyle(iconColor)
                .symbolRenderingMode(.hierarchical)

            Text(value)
                .font(.title.weight(.bold))
                .minimumScaleFactor(0.8)
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(16)
        .liquidGlassCard(cornerRadius: LiquidGlass.cardRadius)
        .liquidFloatShadow()
    }
}

private struct StatGridCell: View {
    let title: String
    let value: String
    let icon: String
    let color: Color

    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: icon)
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(color)
            Text(value)
                .font(.title2.weight(.bold))
            Text(title)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(14)
        .liquidGlassCard(cornerRadius: 18)
        .liquidFloatShadow()
    }
}
