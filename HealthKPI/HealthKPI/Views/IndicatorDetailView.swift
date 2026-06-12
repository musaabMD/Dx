import SwiftUI
import UIKit
import UniformTypeIdentifiers

// MARK: - Swipe-Back Support
//
// When a screen hides the navigation bar's back button, UIKit's interactive
// pop gesture is often disabled. This modifier restores a swipe-from-left-edge
// gesture that calls `dismiss()`, so users can always swipe back.
//
// IMPORTANT: the gesture is scoped to a thin strip on the leading edge so
// it does NOT interfere with the ScrollView's vertical scroll gesture or
// with taps on content.

private struct EdgeSwipeBackOverlay: View {
    let dismiss: DismissAction
    private let edgeWidth: CGFloat = 24

    var body: some View {
        HStack(spacing: 0) {
            Color.clear
                .frame(width: edgeWidth)
                .contentShape(Rectangle())
                .gesture(
                    DragGesture(minimumDistance: 12)
                        .onEnded { value in
                            let movedRight       = value.translation.width > 70
                            let mostlyHorizontal = abs(value.translation.width)
                                                 > abs(value.translation.height)
                            if movedRight && mostlyHorizontal {
                                dismiss()
                            }
                        }
                )

            // The rest of the screen does not participate in the gesture,
            // so ScrollView scrolling and card taps work normally.
            Color.clear
                .allowsHitTesting(false)
        }
    }
}

extension View {
    /// Enables a left-edge swipe to pop the current view, even when the
    /// navigation bar (and system back gesture) is hidden. The gesture is
    /// confined to the leading edge so it does not block scrolling or taps.
    func enableSwipeBack(_ dismiss: DismissAction) -> some View {
        overlay(EdgeSwipeBackOverlay(dismiss: dismiss))
    }
}

// MARK: - Uploaded File Model

struct UploadedFile: Identifiable {
    let id   = UUID()
    let name:  String
    let size:  String
    let icon:  String
    let date:  String
}

// MARK: - Category Detail View

struct CategoryDetailView: View {
    let item: HealthCategoryItem
    @EnvironmentObject private var vm: HealthViewModel
    @Environment(\.dismiss) private var dismiss
    @Environment(\.colorScheme) private var colorScheme
    @State private var appeared       = false
    @State private var showFilePicker = false
    @State private var uploadedFiles: [UploadedFile] = []
    @State private var showUploadConfirm = false
    @State private var lastUploadedName = ""

    // MARK: - Adaptive colors

    private var bgColor: Color {
        colorScheme == .dark
            ? Color(red: 0.07, green: 0.07, blue: 0.09)
            : Color(red: 0.96, green: 0.96, blue: 0.98)
    }

    private var cardBg: Color {
        colorScheme == .dark ? Color(white: 0.11) : .white
    }

    private var cardBgElevated: Color {
        colorScheme == .dark ? Color(white: 0.12) : Color(red: 0.98, green: 0.98, blue: 1.0)
    }

    private var cardBgRest: Color {
        colorScheme == .dark ? Color(white: 0.105) : .white
    }

    private var textPrimary: Color {
        colorScheme == .dark ? .white : Color(red: 0.08, green: 0.08, blue: 0.10)
    }

    private var textSecondary: Color {
        colorScheme == .dark ? .white.opacity(0.55) : .black.opacity(0.55)
    }

    private var textMuted: Color {
        colorScheme == .dark ? .white.opacity(0.38) : .black.opacity(0.38)
    }

    private var textFaint: Color {
        colorScheme == .dark ? .white.opacity(0.22) : .black.opacity(0.22)
    }

    private var dividerColor: Color {
        colorScheme == .dark ? .white.opacity(0.07) : .black.opacity(0.08)
    }

    private var headerButtonBg: Color {
        colorScheme == .dark ? Color.white.opacity(0.10) : Color.black.opacity(0.06)
    }

    private var ringTrack: Color {
        colorScheme == .dark ? Color.white.opacity(0.07) : Color.black.opacity(0.08)
    }

    var body: some View {
        ZStack(alignment: .top) {
            bgColor.ignoresSafeArea()

            ScrollView(showsIndicators: false) {
                VStack(spacing: 12) {
                    titleHeader
                    gaugeHeader
                    healthKitBanner
                    subMetricsList

                    // Upload section — only for Labs & Imaging
                    if item.type.allowsUpload {
                        uploadSection
                    }

                    insightCard
                    Spacer(minLength: 10)
                }
                .padding(.top, 56)
            }

            headerBar
        }
        .navigationBarBackButtonHidden(true)
        .toolbar(.hidden, for: .navigationBar)
        .enableSwipeBack(dismiss)
        .onAppear {
            withAnimation(.easeOut(duration: 0.5)) { appeared = true }
        }
        .fileImporter(
            isPresented: $showFilePicker,
            allowedContentTypes: [.pdf, .image, .jpeg, .png, .data],
            allowsMultipleSelection: true
        ) { result in
            handleFileImport(result)
        }
        .overlay(
            uploadToast
                .animation(.spring(response: 0.4, dampingFraction: 0.8), value: showUploadConfirm),
            alignment: .bottom
        )
    }

    // MARK: - Header Bar (floating top controls)

    private var headerBar: some View {
        HStack(spacing: 10) {
            // Back chevron (left)
            Button { dismiss() } label: {
                Image(systemName: "chevron.left")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(textPrimary)
                    .frame(width: 38, height: 38)
                    .background(
                        Circle().fill(headerButtonBg)
                    )
            }
            .buttonStyle(.plain)

            Spacer()

            // Share / Info / More (right)
            HStack(spacing: 0) {
                headerIconButton(systemName: "square.and.arrow.up") { }
                headerIconButton(systemName: "info.circle") { }
                headerIconButton(systemName: "ellipsis") { }
            }
            .padding(.horizontal, 6)
            .frame(height: 38)
            .background(
                Capsule().fill(headerButtonBg)
            )
        }
        .padding(.horizontal, 18)
        .padding(.top, 8)
    }

    private func headerIconButton(systemName: String, action: @escaping () -> Void) -> some View {
        Button(action: action) {
            Image(systemName: systemName)
                .font(.system(size: 15, weight: .semibold))
                .foregroundColor(textPrimary)
                .frame(width: 42, height: 38)
                .contentShape(Rectangle())
        }
        .buttonStyle(.plain)
    }

    // MARK: - HealthKit Permission Banner
    //
    // Only shown when (a) this category has at least one HealthKit-backed
    // sub-metric and (b) the user has not yet granted access (or it was
    // revoked). Tapping re-presents the system authorization sheet.

    private var hasHealthKitMetric: Bool {
        item.subMetrics.contains { $0.metricKey != nil }
    }

    @ViewBuilder
    private var healthKitBanner: some View {
        if hasHealthKitMetric {
            switch vm.healthKit.authState {
            case .authorized:
                EmptyView()
            case .unavailable:
                bannerCard(
                    icon: "exclamationmark.triangle.fill",
                    tint: .orange,
                    title: "Health data unavailable",
                    subtitle: "Apple Health is not supported on this device.",
                    cta: nil
                )
            case .denied, .unknown:
                bannerCard(
                    icon: "heart.text.square.fill",
                    tint: item.type.color,
                    title: "Connect Apple Health",
                    subtitle: "Grant access so steps, heart rate, sleep, and more show real Day / Week / Month / Year trends.",
                    cta: "Connect"
                ) {
                    Task { await vm.connectHealthKit() }
                }
            }
        }
    }

    private func bannerCard(
        icon: String,
        tint: Color,
        title: String,
        subtitle: String,
        cta: String?,
        action: (() -> Void)? = nil
    ) -> some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 10, style: .continuous)
                    .fill(tint.opacity(0.18))
                    .frame(width: 40, height: 40)
                Image(systemName: icon)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(tint)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(textPrimary)
                Text(subtitle)
                    .font(.system(size: 11))
                    .foregroundColor(textSecondary)
                    .lineLimit(3)
            }
            Spacer(minLength: 8)
            if let cta, let action {
                Button(action: action) {
                    Text(cta)
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(.white)
                        .padding(.horizontal, 14)
                        .padding(.vertical, 8)
                        .background(
                            Capsule().fill(tint)
                        )
                }
                .buttonStyle(.plain)
            }
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(cardBgRest)
                .overlay(
                    RoundedRectangle(cornerRadius: 14, style: .continuous)
                        .stroke(tint.opacity(0.22), lineWidth: 1)
                )
        )
        .padding(.horizontal, 16)
    }

    // MARK: - Title Header (below the floating nav)

    private var titleHeader: some View {
        VStack(spacing: 4) {
            Text(item.type.rawValue)
                .font(.system(size: 26, weight: .bold, design: .rounded))
                .foregroundColor(textPrimary)

            HStack(spacing: 4) {
                Text("Updated \(item.lastUpdated)")
                    .font(.system(size: 13))
                    .foregroundColor(textSecondary)
                Image(systemName: "chevron.down")
                    .font(.system(size: 10, weight: .semibold))
                    .foregroundColor(textSecondary)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 4)
        .padding(.bottom, 6)
    }

    // MARK: - Gauge Header

    private var gaugeHeader: some View {
        HStack(spacing: 16) {
            ZStack {
                TickRingGauge(score: appeared && !item.isNA ? item.score : 0,
                              color: item.isNA ? textFaint : item.status.color,
                              size: 126)
                VStack(spacing: 3) {
                    ZStack {
                        RoundedRectangle(cornerRadius: 9, style: .continuous)
                            .fill(item.type.color.opacity(0.15))
                            .frame(width: 34, height: 34)
                        Image(systemName: item.type.icon)
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(item.type.color)
                    }
                    if item.isNA {
                        Text("NA")
                            .font(.system(size: 22, weight: .black, design: .rounded))
                            .foregroundColor(textMuted)
                        Text("No data")
                            .font(.system(size: 9, weight: .semibold))
                            .foregroundColor(textFaint)
                            .textCase(.uppercase)
                            .tracking(0.5)
                    } else {
                        Text("\(Int(item.score))")
                            .font(.system(size: 24, weight: .black, design: .rounded))
                            .foregroundColor(textPrimary)
                        StatusPill(status: item.status)
                    }
                }
            }
            .frame(width: 126, height: 126)

            VStack(alignment: .leading, spacing: 10) {
                if item.isNA {
                    statBit(label: "Score", value: "NA", color: textMuted)
                } else {
                    statBit(label: "Score", value: "\(Int(item.score)) / 100",
                            color: item.status.color)
                }
                Divider().background(dividerColor)
                statBit(label: "Metrics",
                        value: "\(item.subMetrics.count) tracked",
                        color: textSecondary)
                Divider().background(dividerColor)
                if item.isNA {
                    statBit(label: "Source",
                            value: "Not on iOS",
                            color: textMuted)
                } else {
                    let scored = item.subMetrics.filter { !$0.isNA }
                    statBit(label: "Lowest",
                            value: scored.min(by: { $0.score < $1.score })?.name ?? "—",
                            color: .orange)
                }
                if item.type.allowsUpload {
                    Divider().background(dividerColor)
                    statBit(label: "Uploads",
                            value: "\(uploadedFiles.count) file\(uploadedFiles.count == 1 ? "" : "s")",
                            color: item.type.color)
                }
            }
            .padding(13)
            .background(
                RoundedRectangle(cornerRadius: 14, style: .continuous)
                    .fill(cardBg)
            )
        }
        .padding(.horizontal, 16)
    }

    private func statBit(label: String, value: String, color: Color) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(textMuted)
            Text(value)
                .font(.system(size: 12, weight: .bold))
                .foregroundColor(color)
                .lineLimit(1)
                .minimumScaleFactor(0.7)
        }
    }

    // MARK: - Sub-Metrics List

    private var subMetricsList: some View {
        VStack(spacing: 0) {
            sectionLabel("Metrics", count: item.subMetrics.count)

            VStack(spacing: 7) {
                ForEach(item.subMetrics) { metric in
                    metricCard(metric)
                }
            }
            .padding(.horizontal, 16)
        }
    }

    // Report-style metric card: every sub-metric is always fully
    // rendered (summary row + description + weekly chart). There is
    // no tap-to-expand interaction — the whole detail view reads
    // like a printed health report.
    private func metricCard(_ metric: SubMetric) -> some View {
        VStack(spacing: 0) {
            HStack(spacing: 12) {
                // Score ring — suppressed for NA metrics so we don't
                // render a "0" score where we simply don't have data.
                if metric.isNA {
                    ZStack {
                        Circle()
                            .stroke(ringTrack, lineWidth: 3.5)
                        Image(systemName: "questionmark")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundColor(textFaint)
                    }
                    .frame(width: 36, height: 36)
                } else {
                    ZStack {
                        Circle()
                            .stroke(ringTrack, lineWidth: 3.5)
                        Circle()
                            .trim(from: 0, to: appeared ? metric.score / 100 : 0)
                            .stroke(metric.status.color,
                                    style: StrokeStyle(lineWidth: 3.5, lineCap: .round))
                            .rotationEffect(.degrees(-90))
                            .animation(.easeOut(duration: 0.7).delay(0.1), value: appeared)
                        Text("\(Int(metric.score))")
                            .font(.system(size: 9, weight: .bold, design: .rounded))
                            .foregroundColor(textPrimary)
                    }
                    .frame(width: 36, height: 36)
                }

                VStack(alignment: .leading, spacing: 3) {
                    Text(metric.name)
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundColor(textPrimary)
                    HStack(spacing: 4) {
                        if !metric.isNA {
                            Image(systemName: metric.trend.icon)
                                .font(.system(size: 9, weight: .semibold))
                                .foregroundColor(trendColor(metric.trend))
                        }
                        Text(metric.trendLabel)
                            .font(.system(size: 11))
                            .foregroundColor(textMuted)
                    }
                }

                Spacer()

                HStack(alignment: .firstTextBaseline, spacing: 3) {
                    Text(metric.value)
                        .font(.system(size: 15, weight: .bold, design: .rounded))
                        .foregroundColor(metric.isNA ? textMuted : textPrimary)
                    if !metric.unit.isEmpty {
                        Text(metric.unit)
                            .font(.system(size: 10))
                            .foregroundColor(textMuted)
                    }
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 12)

            VStack(alignment: .leading, spacing: 10) {
                Divider().background(dividerColor).padding(.horizontal, 14)
                Text(metric.description)
                    .font(.system(size: 12))
                    .foregroundColor(textSecondary)
                    .lineSpacing(3)
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .padding(.horizontal, 14)

                // When this sub-metric is backed by HealthKit, render the
                // full Apple-Health-style ranged chart (D / W / M / 6M / Y).
                // Otherwise fall back to the simple weekly bar chart, and
                // hide the chart entirely for NA metrics.
                if let key = metric.metricKey {
                    RangedMetricChart(
                        metricKey: key,
                        accent: item.type.color,
                        manager: vm.healthKit,
                        fallbackWeekly: metric.weeklyData
                    )
                    .padding(.horizontal, 14)
                } else if !metric.weeklyData.isEmpty {
                    WeeklyBarChart(data: metric.weeklyData, color: item.type.color)
                        .padding(.horizontal, 14)
                }
            }
            .padding(.bottom, 12)
        }
        .background(
            RoundedRectangle(cornerRadius: 14, style: .continuous)
                .fill(cardBgRest)
        )
    }

    // MARK: - Upload Section

    private var uploadSection: some View {
        VStack(spacing: 0) {
            sectionLabel(
                item.type == .labs ? "Lab Reports" : "Imaging Results",
                icon: "arrow.up.doc.fill",
                count: nil
            )

            VStack(spacing: 10) {
                // Add button
                Button { showFilePicker = true } label: {
                    HStack(spacing: 10) {
                        ZStack {
                            Circle()
                                .fill(item.type.color.opacity(0.15))
                                .frame(width: 38, height: 38)
                            Image(systemName: "plus")
                                .font(.system(size: 15, weight: .semibold))
                                .foregroundColor(item.type.color)
                        }
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Upload \(item.type == .labs ? "Lab Report" : "Scan / Image")")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(textPrimary)
                            Text("PDF, JPG, PNG supported")
                                .font(.system(size: 11))
                                .foregroundColor(textMuted)
                        }
                        Spacer()
                        Image(systemName: "chevron.right")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(textFaint)
                    }
                    .padding(.horizontal, 14)
                    .padding(.vertical, 12)
                    .background(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(cardBgRest)
                            .overlay(
                                RoundedRectangle(cornerRadius: 14, style: .continuous)
                                    .stroke(item.type.color.opacity(0.22), lineWidth: 1)
                                    .strokeBorder(style: StrokeStyle(lineWidth: 1, dash: [5, 4]))
                            )
                    )
                }
                .buttonStyle(.plain)

                // Uploaded files list
                if !uploadedFiles.isEmpty {
                    ForEach(uploadedFiles) { file in
                        uploadedFileRow(file)
                    }
                }
            }
            .padding(.horizontal, 16)
        }
    }

    private func uploadedFileRow(_ file: UploadedFile) -> some View {
        HStack(spacing: 12) {
            ZStack {
                RoundedRectangle(cornerRadius: 8, style: .continuous)
                    .fill(item.type.color.opacity(0.12))
                    .frame(width: 36, height: 36)
                Image(systemName: file.icon)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(item.type.color)
            }
            VStack(alignment: .leading, spacing: 2) {
                Text(file.name)
                    .font(.system(size: 12, weight: .semibold))
                    .foregroundColor(textPrimary)
                    .lineLimit(1)
                HStack(spacing: 6) {
                    Text(file.size)
                        .font(.system(size: 10))
                        .foregroundColor(textMuted)
                    Text("·")
                        .foregroundColor(textFaint)
                    Text(file.date)
                        .font(.system(size: 10))
                        .foregroundColor(textMuted)
                }
            }
            Spacer()
            Image(systemName: "checkmark.circle.fill")
                .font(.system(size: 16))
                .foregroundStyle(Color(red: 0.2, green: 0.85, blue: 0.4),
                                 Color(red: 0.2, green: 0.85, blue: 0.4).opacity(0.15))
        }
        .padding(.horizontal, 14)
        .padding(.vertical, 10)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(cardBgRest)
        )
    }

    // MARK: - Upload Toast

    @ViewBuilder
    private var uploadToast: some View {
        if showUploadConfirm {
            HStack(spacing: 10) {
                Image(systemName: "checkmark.circle.fill")
                    .foregroundStyle(.white, Color(red: 0.2, green: 0.85, blue: 0.4))
                Text("\"\(lastUploadedName)\" uploaded")
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.white)
                    .lineLimit(1)
            }
            .padding(.horizontal, 18)
            .padding(.vertical, 12)
            .background(
                Capsule()
                    .fill(Color(red: 0.12, green: 0.12, blue: 0.14))
                    .shadow(color: .black.opacity(0.35), radius: 12, y: 4)
            )
            .padding(.bottom, 28)
            .transition(.move(edge: .bottom).combined(with: .opacity))
        }
    }

    // MARK: - Insight Card

    private var insightCard: some View {
        HStack(alignment: .top, spacing: 12) {
            Image(systemName: "lightbulb.fill")
                .font(.system(size: 15))
                .foregroundColor(.yellow)
                .padding(.top, 1)
            VStack(alignment: .leading, spacing: 4) {
                Text("Insight")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(colorScheme == .dark ? .yellow.opacity(0.75) : Color(red: 0.70, green: 0.55, blue: 0.05))
                Text(item.insight)
                    .font(.system(size: 13))
                    .foregroundColor(textPrimary.opacity(0.82))
                    .lineSpacing(3)
            }
        }
        .padding(16)
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(cardBgRest)
                .overlay(
                    RoundedRectangle(cornerRadius: 16, style: .continuous)
                        .stroke(Color.yellow.opacity(colorScheme == .dark ? 0.12 : 0.22), lineWidth: 1)
                )
        )
        .padding(.horizontal, 16)
    }

    // MARK: - Helpers

    private func sectionLabel(_ title: String, icon: String? = nil, count: Int?) -> some View {
        HStack {
            if let icon = icon {
                Image(systemName: icon)
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundColor(textMuted)
            }
            Text(title)
                .font(.system(size: 12, weight: .semibold))
                .foregroundColor(textMuted)
                .textCase(.uppercase)
                .tracking(0.5)
            Spacer()
            if let count = count {
                Text("\(count)")
                    .font(.system(size: 12))
                    .foregroundColor(textFaint)
            }
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 8)
    }

    private func trendColor(_ trend: TrendDirection) -> Color {
        switch trend {
        case .up:     return Color(red: 0.2, green: 0.85, blue: 0.4)
        case .down:   return Color(red: 0.95, green: 0.35, blue: 0.2)
        case .stable: return textMuted
        }
    }

    private func handleFileImport(_ result: Result<[URL], Error>) {
        switch result {
        case .success(let urls):
            for url in urls {
                _ = url.startAccessingSecurityScopedResource()
                let name = url.lastPathComponent
                let ext  = url.pathExtension.lowercased()
                let icon: String
                switch ext {
                case "pdf":          icon = "doc.fill"
                case "jpg","jpeg":   icon = "photo.fill"
                case "png":          icon = "photo.fill"
                default:             icon = "doc.fill"
                }
                let sizeStr: String
                if let attrs = try? FileManager.default.attributesOfItem(atPath: url.path),
                   let bytes = attrs[.size] as? Int64 {
                    sizeStr = bytes > 1_000_000
                        ? String(format: "%.1f MB", Double(bytes) / 1_000_000)
                        : "\(bytes / 1000) KB"
                } else {
                    sizeStr = "—"
                }
                let f = DateFormatter()
                f.dateFormat = "MMM d, yyyy"
                let file = UploadedFile(name: name, size: sizeStr,
                                        icon: icon, date: f.string(from: Date()))
                withAnimation { uploadedFiles.append(file) }
                lastUploadedName = name
                url.stopAccessingSecurityScopedResource()
            }
            showToast()
        case .failure:
            break
        }
    }

    private func showToast() {
        withAnimation { showUploadConfirm = true }
        DispatchQueue.main.asyncAfter(deadline: .now() + 2.5) {
            withAnimation { showUploadConfirm = false }
        }
    }
}

#Preview {
    NavigationStack {
        CategoryDetailView(item: HealthCategoryItem.sampleCategories().first!)
            .environmentObject(HealthViewModel())
    }
}
