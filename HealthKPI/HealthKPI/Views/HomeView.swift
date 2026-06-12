import SwiftUI

// MARK: - Scroll Offset Tracking (throttled)

private struct ScrollOffsetKey: PreferenceKey {
    static let defaultValue: CGFloat = 0
    static func reduce(value: inout CGFloat, nextValue: () -> CGFloat) {
        value = nextValue()
    }
}

// MARK: - Filter Tab

enum ListFilter: String, CaseIterable {
    case all       = "All"
    case good      = "On Track"
    case attention = "Attention"

    var icon: String {
        switch self {
        case .all:       return "square.grid.2x2"
        case .good:      return "checkmark.circle.fill"
        case .attention: return "exclamationmark.circle.fill"
        }
    }

    func tint(_ scheme: ColorScheme) -> Color {
        switch self {
        case .all:       return Theme.textPrimary(scheme)
        case .good:      return Theme.excellent
        case .attention: return Theme.poor
        }
    }
}

// MARK: - Home View

struct HomeView: View {
    @EnvironmentObject var vm: HealthViewModel
    @Environment(\.colorScheme) private var colorScheme
    @State private var activeFilter: ListFilter = .all
    @State private var scrollOffset: CGFloat = 0
    @State private var showingAddWidget = false
    @Namespace private var filterNS

    /// Temporary: hide score + age hero card from Home.
    private let showHeroMetrics = false

    // MARK: Derived

    private var filteredCategories: [HealthCategoryItem] {
        switch activeFilter {
        case .all:       return vm.categories
        case .good:      return vm.goodCategories
        case .attention: return vm.attentionCategories
        }
    }

    private var heroCollapseProgress: Double {
        let raw = Double(-scrollOffset - 20) / 110.0
        return min(1.0, max(0.0, raw))
    }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ScrollView(showsIndicators: false) {
                    VStack(spacing: 0) {
                        GeometryReader { geo in
                            Color.clear
                                .preference(
                                    key: ScrollOffsetKey.self,
                                    value: geo.frame(in: .named("homeScroll")).minY
                                )
                        }
                        .frame(height: 0)

                        if showHeroMetrics {
                            heroSection
                                .padding(.top, 12)
                                .padding(.bottom, 18)
                        } else {
                            Color.clear
                                .frame(height: 12)
                        }

                        widgetStack
                            .padding(.horizontal, Theme.Space.lg)
                            .padding(.bottom, Theme.Space.lg)

                        filterPills
                            .padding(.horizontal, Theme.Space.lg)
                            .padding(.bottom, Theme.Space.md)

                        listSection

                        Spacer(minLength: 16)
                    }
                }
                .coordinateSpace(name: "homeScroll")
                .onPreferenceChange(ScrollOffsetKey.self) { newValue in
                    // Throttle: only update if we've moved a visible amount.
                    // Avoids re-rendering every sub-pixel the user scrolls.
                    if abs(newValue - scrollOffset) > 2 {
                        scrollOffset = newValue
                    }
                }
                .refreshable { await vm.refreshHealthKit() }

            .navigationBarHidden(true)
            .toolbar(.hidden, for: .navigationBar)
            .sheet(isPresented: $showingAddWidget) {
                AddWidgetSheet()
                    .environmentObject(vm)
                    .presentationDetents([.medium, .large])
                    .presentationDragIndicator(.visible)
            }
        }
    }

    // MARK: - Widget Stack
    //
    // Renders every pinned widget from the view model, followed by an
    // "Add Widget" button so the dashboard is always customizable.

    private var widgetStack: some View {
        VStack(spacing: Theme.Space.md) {
            ForEach(vm.activeWidgets) { kind in
                widgetView(for: kind)
                    .contextMenu {
                        Button(role: .destructive) {
                            withAnimation(.spring(response: 0.32, dampingFraction: 0.85)) {
                                vm.removeWidget(kind)
                            }
                        } label: {
                            Label("Remove Widget", systemImage: "minus.circle")
                        }
                    }
                    .transition(
                        .asymmetric(
                            insertion: .opacity.combined(with: .scale(scale: 0.97)),
                            removal: .opacity
                        )
                    )
            }

            addWidgetButton
        }
        .animation(.spring(response: 0.32, dampingFraction: 0.85), value: vm.activeWidgets)
    }

    @ViewBuilder
    private func widgetView(for kind: HomeWidgetKind) -> some View {
        switch kind {
        case .summary:
            HealthSummaryWidget(categories: vm.categories)
        }
    }

    private var addWidgetButton: some View {
        Button {
            showingAddWidget = true
        } label: {
            HStack(spacing: 10) {
                ZStack {
                    Circle()
                        .fill(Theme.accent.opacity(colorScheme == .dark ? 0.22 : 0.16))
                        .frame(width: 32, height: 32)
                    Image(systemName: "plus")
                        .font(.system(size: 14, weight: .bold))
                        .foregroundStyle(Theme.accent)
                }

                VStack(alignment: .leading, spacing: 2) {
                    Text("Add Widget")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(Theme.textPrimary(colorScheme))
                    Text(addWidgetSubtitle)
                        .font(.system(size: 11, weight: .medium))
                        .foregroundStyle(Theme.textTertiary(colorScheme))
                        .lineLimit(1)
                }

                Spacer(minLength: 0)

                Image(systemName: "chevron.right")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(Theme.textQuaternary(colorScheme))
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: Theme.Radius.lg, style: .continuous)
                    .strokeBorder(
                        Theme.accent.opacity(0.35),
                        style: StrokeStyle(lineWidth: 1, dash: [4, 4])
                    )
            )
        }
        .buttonStyle(.plain)
    }

    private var addWidgetSubtitle: String {
        let remaining = vm.availableWidgets.count
        if remaining == 0 { return "All widgets added" }
        if remaining == 1 { return "1 widget available" }
        return "\(remaining) widgets available"
    }

    // MARK: - Hero Section

    private var heroSection: some View {
        VStack(spacing: 18) {
            ZStack {
                Circle()
                    .fill(vm.overallStatus.themeColor.opacity(0.08))
                    .frame(width: 170, height: 170)
                    .blur(radius: 22)

                DotRingGauge(score: vm.overallScore, size: 150)

                VStack(spacing: 4) {
                    Text("\(Int(vm.overallScore))")
                        .font(.display(52, weight: .bold))
                        .foregroundStyle(Theme.textPrimary(colorScheme))
                        .monospacedDigit()
                        .tracking(-1.2)
                        .scaleEffect(1.0)
                        .opacity(1.0)

                    HStack(spacing: 5) {
                        Text(vm.overallGrade)
                            .font(.system(size: 11, weight: .bold, design: .rounded))
                            .foregroundStyle(vm.overallStatus.themeColor)
                            .padding(.horizontal, 6)
                            .padding(.vertical, 2)
                            .background(
                                Capsule().fill(vm.overallStatus.themeColor.opacity(0.15))
                            )

                        Text("Health Score")
                            .font(.eyebrow(8))
                            .tracking(0.9)
                            .foregroundStyle(Theme.textTertiary(colorScheme))
                    }
                }
            }
            .frame(height: 160)

            VStack(spacing: 5) {
                Text(vm.overallStatus.label.uppercased())
                    .font(.eyebrow(10))
                    .tracking(1.6)
                    .foregroundStyle(vm.overallStatus.themeColor)

                Text(headlineMessage)
                    .font(.system(size: 17, weight: .semibold, design: .rounded))
                    .foregroundStyle(Theme.textPrimary(colorScheme))
                    .multilineTextAlignment(.center)
                    .lineLimit(2)
                    .padding(.horizontal, 32)
            }
            .opacity(1.0 - heroCollapseProgress)

            metricRow
                .padding(.horizontal, Theme.Space.lg)
        }
        .scaleEffect(CGFloat(1.0 - heroCollapseProgress * 0.06))
    }

    private var headlineMessage: String {
        if vm.biologicalAgeDelta > 0 {
            return "You feel \(vm.biologicalAgeDelta) year\(vm.biologicalAgeDelta == 1 ? "" : "s") younger than your age."
        } else if vm.biologicalAgeDelta < 0 {
            let n = abs(vm.biologicalAgeDelta)
            return "Your body is tracking \(n) year\(n == 1 ? "" : "s") older than your age."
        } else {
            return "You are right on pace with your age."
        }
    }

    // MARK: - Metric Row

    private var metricRow: some View {
        HStack(spacing: 8) {
            compactMetricTile(
                label: "Age",
                value: "\(vm.userAge)",
                accent: Theme.textSecondary(colorScheme),
                trailing: AnyView(sexBadge)
            )

            arrow

            compactMetricTile(
                label: "Biological",
                value: "\(vm.biologicalAge)",
                accent: ageDeltaColor,
                trailing: nil
            )

            arrow

            compactMetricTile(
                label: "Delta",
                value: deltaString,
                accent: ageDeltaColor,
                trailing: nil
            )
        }
        .padding(10)
        .cardSurface(cornerRadius: Theme.Radius.md)
    }

    private var arrow: some View {
        Image(systemName: "arrow.right")
            .font(.system(size: 9, weight: .semibold))
            .foregroundStyle(Theme.textQuaternary(colorScheme))
    }

    private func compactMetricTile(
        label: String,
        value: String,
        accent: Color,
        trailing: AnyView?
    ) -> some View {
        VStack(alignment: .leading, spacing: 3) {
            HStack(spacing: 4) {
                Text(label.uppercased())
                    .font(.eyebrow(8))
                    .tracking(0.8)
                    .foregroundStyle(Theme.textTertiary(colorScheme))
                Spacer(minLength: 0)
                if let trailing { trailing }
            }

            Text(value)
                .font(.display(20, weight: .bold))
                .foregroundStyle(accent)
                .monospacedDigit()
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }

    private var deltaString: String {
        let d = vm.biologicalAgeDelta
        if d > 0 { return "−\(d)y" }
        if d < 0 { return "+\(abs(d))y" }
        return "0y"
    }

    private var ageDeltaColor: Color {
        if vm.biologicalAgeDelta > 0 {
            return Theme.excellent
        } else if vm.biologicalAgeDelta < 0 {
            return Theme.poor
        } else {
            return Theme.textPrimary(colorScheme)
        }
    }

    // MARK: - Sex Badge

    private var sexBadge: some View {
        Button {
            withAnimation(.spring(response: 0.25, dampingFraction: 0.82)) {
                vm.toggleSex()
            }
        } label: {
            let male = vm.biologicalSex == "male"
            let tint = male
                ? Color(red: 0.27, green: 0.58, blue: 0.98)
                : Color(red: 0.90, green: 0.40, blue: 0.78)
            HStack(spacing: 2) {
                Image(systemName: male ? "figure.stand" : "figure.wave")
                    .font(.system(size: 7, weight: .bold))
                Text(male ? "M" : "F")
                    .font(.system(size: 8, weight: .heavy))
            }
            .foregroundStyle(tint)
            .padding(.horizontal, 4)
            .padding(.vertical, 1.5)
            .background(Capsule().fill(tint.opacity(0.15)))
        }
        .buttonStyle(.plain)
    }

    // MARK: - Filter Pills

    private var filterPills: some View {
        HStack(spacing: 8) {
            ForEach(ListFilter.allCases, id: \.self) { tab in
                filterPill(tab)
            }
        }
    }

    private func filterPill(_ tab: ListFilter) -> some View {
        let active = activeFilter == tab
        let tint   = tab.tint(colorScheme)
        let count: Int = {
            switch tab {
            case .all:       return vm.categories.count
            case .good:      return vm.goodCategories.count
            case .attention: return vm.attentionCategories.count
            }
        }()

        return Button {
            withAnimation(.spring(response: 0.30, dampingFraction: 0.85)) {
                activeFilter = tab
            }
        } label: {
            HStack(spacing: 5) {
                Image(systemName: tab.icon)
                    .font(.system(size: 10, weight: .semibold))

                Text(tab.rawValue)
                    .font(.system(size: 12, weight: .medium))

                Text("\(count)")
                    .font(.monoDigit(10, weight: .bold))
                    .padding(.horizontal, 5)
                    .padding(.vertical, 1)
                    .background(
                        Capsule().fill(
                            active
                                ? tint.opacity(0.25)
                                : Theme.fillTrack(colorScheme)
                        )
                    )
            }
            .foregroundStyle(active ? tint : Theme.textSecondary(colorScheme))
            .padding(.horizontal, 12)
            .padding(.vertical, 7)
            .background(
                ZStack {
                    if active {
                        Capsule()
                            .fill(tint.opacity(colorScheme == .dark ? 0.14 : 0.09))
                            .overlay(Capsule().strokeBorder(tint.opacity(0.30), lineWidth: 0.5))
                            .matchedGeometryEffect(id: "filterPill", in: filterNS)
                    }
                }
            )
        }
        .buttonStyle(.plain)
    }

    // MARK: - Category List

    private var listSection: some View {
        VStack(spacing: 8) {
            HStack {
                Text(sectionTitle.uppercased())
                    .font(.eyebrow(9))
                    .tracking(1.0)
                    .foregroundStyle(Theme.textTertiary(colorScheme))
                Spacer()
                Text("\(filteredCategories.count)")
                    .font(.monoDigit(10, weight: .bold))
                    .foregroundStyle(Theme.textQuaternary(colorScheme))
            }
            .padding(.horizontal, Theme.Space.xl)
            .padding(.bottom, 2)

            if filteredCategories.isEmpty {
                emptyState
                    .padding(.horizontal, Theme.Space.lg)
            } else {
                LazyVStack(spacing: vm.cardStyle == .minimal ? 5 : 6) {
                    ForEach(filteredCategories) { cat in
                        NavigationLink {
                            CategoryDetailView(item: cat)
                                .environmentObject(vm)
                        } label: {
                            CategoryRowCard(item: cat, style: vm.cardStyle)
                        }
                        .buttonStyle(.plain)
                        .transition(
                            .asymmetric(
                                insertion: .opacity.combined(with: .scale(scale: 0.97)),
                                removal: .opacity
                            )
                        )
                    }
                }
                .padding(.horizontal, Theme.Space.lg)
                .animation(.spring(response: 0.32, dampingFraction: 0.85), value: activeFilter)
                .animation(.spring(response: 0.32, dampingFraction: 0.85), value: vm.cardStyle)
            }
        }
    }

    private var sectionTitle: String {
        switch activeFilter {
        case .all:       return "All Categories"
        case .good:      return "On Track"
        case .attention: return "Needs Attention"
        }
    }

    private var emptyState: some View {
        VStack(spacing: 10) {
            Image(systemName: activeFilter == .good ? "checkmark.seal.fill" : "sparkles")
                .font(.system(size: 28))
                .foregroundStyle(activeFilter == .good ? Theme.excellent : Theme.fair)
            Text(activeFilter == .good
                 ? "Nothing in the good range yet"
                 : "Everything is on track.")
                .font(.system(size: 13, weight: .medium))
                .foregroundStyle(Theme.textSecondary(colorScheme))
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 40)
        .cardSurface(cornerRadius: Theme.Radius.lg)
    }

}

// MARK: - Dot Ring Gauge (Canvas-backed — one draw call)
//
// Previously drew 48 individual `Circle()` views. Canvas composes
// everything in a single render pass and avoids allocating view
// identities per dot, which matters a lot while the score animates
// or the scroll offset changes.

struct DotRingGauge: View {
    let score: Double
    var size: CGFloat = 140

    private let totalDots = 48
    private let sweep:     Double = 280
    private let startAngle: Double = 130

    var body: some View {
        Canvas { ctx, canvasSize in
            let radius = min(canvasSize.width, canvasSize.height) / 2 - 6
            let center = CGPoint(x: canvasSize.width / 2, y: canvasSize.height / 2)
            let progress = max(0, min(score / 100, 1))
            let filledUpTo = progress * Double(totalDots - 1)

            for i in 0..<totalDots {
                let t = Double(i) / Double(totalDots - 1)
                let angle = startAngle + t * sweep
                let rad = angle * .pi / 180
                let x = center.x + radius * cos(rad)
                let y = center.y + radius * sin(rad)
                let isMajor = i % 6 == 0
                let d: CGFloat = isMajor ? 3.5 : 2.5
                let rect = CGRect(x: x - d / 2, y: y - d / 2, width: d, height: d)

                let color: Color
                if Double(i) <= filledUpTo {
                    color = dotColor(t: t)
                } else {
                    color = .white.opacity(0.10)
                }
                ctx.fill(Path(ellipseIn: rect), with: .color(color))
            }
        }
        .frame(width: size, height: size)
    }

    private func dotColor(t: Double) -> Color {
        if t < 0.30 { return Theme.excellent }
        if t < 0.55 { return Theme.good }
        if t < 0.80 { return Theme.fair }
        return Theme.poor
    }
}

// MARK: - App Logo Mark
//
// Branded header logo: a gradient rounded-square glyph pulsing with
// the signature green + status accent, paired with the "healthbase"
// wordmark. Designed to replace a plain text title with something
// that feels like a real product identity.

struct AppLogoMark: View {
    @Environment(\.colorScheme) private var colorScheme

    var body: some View {
        ZStack {
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(
                    LinearGradient(
                        colors: [Theme.excellent, Theme.accentDeep],
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    )
                )
                .frame(width: 34, height: 34)
                .shadow(
                    color: Theme.accent.opacity(colorScheme == .dark ? 0.32 : 0.18),
                    radius: 6, x: 0, y: 2
                )

            Text("L")
                .font(.system(size: 19, weight: .black, design: .rounded))
                .foregroundStyle(.white)
                .offset(y: -0.5)
        }
        .accessibilityLabel("L logo")
    }
}

#Preview {
    HomeView().environmentObject(HealthViewModel())
}
