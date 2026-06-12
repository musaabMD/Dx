//
//  WidgetStudioView.swift
//  99Widgets
//
//  Interactive widget studio — live preview + shuffle + 7 dimension pickers.
//

import SwiftUI

struct WidgetStudioView: View {
    // MARK: - Config

    let record: InstalledWidgetRecord
    var isCreating: Bool = false
    var onSave: ((InstalledWidgetRecord) -> Void)? = nil

    @EnvironmentObject private var vm: MainAppViewModel
    @Environment(\.dismiss) private var dismiss

    // MARK: - Local State

    @State private var slots: [MetricSlot]
    @State private var style: WidgetStyle
    @State private var shuffleScale: CGFloat = 1.0
    @State private var previewID = UUID()   // force preview re-render on shuffle

    // MARK: - Init

    init(record: InstalledWidgetRecord, isCreating: Bool = false, onSave: ((InstalledWidgetRecord) -> Void)? = nil) {
        self.record = record
        self.isCreating = isCreating
        self.onSave = onSave
        _slots = State(initialValue: record.slots)
        _style = State(initialValue: record.style)
    }

    // MARK: - Computed

    private var liveSnapshots: [MetricSnapshot] {
        slots.map { vm.snapshot(for: $0.metricKind) }
    }

    private var primaryMetric: HealthMetricKind { slots.first?.metricKind ?? .steps }

    // MARK: - Body

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 24) {
                    previewSection
                    shuffleButtons
                    Divider().padding(.horizontal)
                    pickerSection
                }
                .padding(.bottom, 32)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle(isCreating ? "New Widget" : "Edit Widget")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .cancellationAction) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .confirmationAction) {
                    Button("Save") { saveAndDismiss() }
                        .fontWeight(.semibold)
                }
            }
        }
    }

    // MARK: - Preview

    private var previewSection: some View {
        WidgetRenderView(snapshots: liveSnapshots, style: style)
            .id(previewID)
            .padding(.horizontal, 32)
            .padding(.top, 12)
            .scaleEffect(shuffleScale)
            .animation(.spring(response: 0.35, dampingFraction: 0.65), value: shuffleScale)
    }

    // MARK: - Shuffle Buttons

    private var shuffleButtons: some View {
        HStack(spacing: 12) {
            Button(action: shuffleFresh) {
                Label("Shuffle", systemImage: "shuffle")
                    .font(.subheadline.weight(.semibold))
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            .tint(.blue)

            Button(action: shuffleMutate) {
                Label("Vary", systemImage: "arrow.triangle.2.circlepath")
                    .font(.subheadline.weight(.semibold))
                    .frame(maxWidth: .infinity)
            }
            .buttonStyle(.bordered)
            .tint(.secondary)
        }
        .padding(.horizontal, 20)
    }

    // MARK: - Pickers

    private var pickerSection: some View {
        VStack(spacing: 0) {
            compositionPicker
            Divider().padding(.leading, 20)
            metricPicker
            Divider().padding(.leading, 20)
            palettePicker
            Divider().padding(.leading, 20)
            typographyPicker
            Divider().padding(.leading, 20)
            chartPicker
            Divider().padding(.leading, 20)
            densityPicker
            Divider().padding(.leading, 20)
            accentPicker
        }
        .background(Color(.systemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12, style: .continuous))
        .padding(.horizontal, 16)
    }

    // MARK: - Composition Picker

    private var compositionPicker: some View {
        PickerRow(label: "Layout", systemImage: "rectangle.3.group") {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(CompositionKind.allCases) { kind in
                        CompositionChip(kind: kind, selected: style.composition == kind) {
                            withAnimation(.spring(response: 0.3)) {
                                style.composition = kind
                                rebuildSlots()
                            }
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
            }
        }
    }

    // MARK: - Metric Picker (primary slot)

    private var metricPicker: some View {
        PickerRow(label: "Metric", systemImage: "heart.text.square") {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(HealthMetricKind.allCases) { kind in
                        MetricGridChip(kind: kind, selected: primaryMetric == kind) {
                            let role = style.composition.slotRoles.first ?? .primary
                            slots = [MetricSlot(metricKind: kind, role: role)]
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
            }
        }
    }

    // MARK: - Palette Picker

    private var palettePicker: some View {
        PickerRow(label: "Palette", systemImage: "paintpalette") {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 10) {
                    ForEach(PaletteKind.allCases) { kind in
                        let p = WidgetPalette.make(kind)
                        Button {
                            withAnimation(.easeInOut(duration: 0.2)) { style.palette = kind }
                        } label: {
                            VStack(spacing: 4) {
                                ZStack {
                                    Circle()
                                        .fill(LinearGradient(colors: [p.backgroundTop, p.backgroundBottom], startPoint: .topLeading, endPoint: .bottomTrailing))
                                        .frame(width: 36, height: 36)
                                    Circle()
                                        .fill(p.accent)
                                        .frame(width: 12, height: 12)
                                    if style.palette == kind {
                                        Circle()
                                            .strokeBorder(Color.white, lineWidth: 2.5)
                                            .frame(width: 40, height: 40)
                                    }
                                }
                                Text(kind.rawValue.capitalized)
                                    .font(.system(size: 8, weight: .medium))
                                    .foregroundStyle(style.palette == kind ? .primary : .secondary)
                            }
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
            }
        }
    }

    // MARK: - Typography Picker

    private var typographyPicker: some View {
        PickerRow(label: "Font", systemImage: "textformat") {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(TypographyKind.allCases) { kind in
                        TypoChip(kind: kind, selected: style.typography == kind) {
                            style.typography = kind
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
            }
        }
    }

    // MARK: - Chart Picker

    private var chartPicker: some View {
        PickerRow(label: "Chart", systemImage: "chart.bar") {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(ChartKind.allCases) { kind in
                        IconChip(
                            symbol: kind.symbol,
                            label: kind.displayName,
                            selected: style.chart == kind
                        ) { style.chart = kind }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
            }
        }
    }

    // MARK: - Density Picker

    private var densityPicker: some View {
        PickerRow(label: "Density", systemImage: "slider.horizontal.3") {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(DensityKind.allCases) { kind in
                        IconChip(
                            symbol: kind.symbol,
                            label: kind.displayName,
                            selected: style.density == kind
                        ) { style.density = kind }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
            }
        }
    }

    // MARK: - Accent Picker

    private var accentPicker: some View {
        PickerRow(label: "Accent", systemImage: "sparkles") {
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(AccentKind.allCases) { kind in
                        IconChip(
                            symbol: kind.symbol,
                            label: kind.displayName,
                            selected: style.accent == kind
                        ) { style.accent = kind }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 10)
            }
        }
    }

    // MARK: - Actions

    private func shuffleFresh() {
        let seed = UInt64.random(in: 1...UInt64.max)
        let newStyle = StyleGenerator.generate(seed: seed, primaryMetric: primaryMetric, slotCount: slots.count)
        applyShuffleAnimation {
            style = newStyle
            rebuildSlots()
        }
    }

    private func shuffleMutate() {
        let seed = UInt64.random(in: 1...UInt64.max)
        let newStyle = StyleGenerator.mutate(style: style, seed: seed)
        applyShuffleAnimation { style = newStyle }
    }

    private func applyShuffleAnimation(changes: @escaping () -> Void) {
        withAnimation(.easeIn(duration: 0.1)) { shuffleScale = 0.92 }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
            changes()
            previewID = UUID()
            withAnimation(.spring(response: 0.4, dampingFraction: 0.6)) { shuffleScale = 1.0 }
        }
    }

    private func rebuildSlots() {
        let role = style.composition.slotRoles.first ?? .primary
        slots = [MetricSlot(metricKind: primaryMetric, role: role)]
    }

    private func saveAndDismiss() {
        var updated = record
        updated.slots = slots
        updated.style = style
        if let onSave {
            onSave(updated)
        } else {
            vm.updateRecord(updated)
        }
        dismiss()
    }
}

// MARK: - Sub-components

private struct PickerRow<Content: View>: View {
    let label: String
    let systemImage: String
    @ViewBuilder let content: Content

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack(spacing: 6) {
                Image(systemName: systemImage)
                    .font(.caption.weight(.semibold))
                    .foregroundStyle(.blue)
                Text(label)
                    .font(.subheadline.weight(.semibold))
            }
            .padding(.horizontal, 16)
            .padding(.top, 12)
            content
        }
    }
}

private struct CompositionChip: View {
    let kind: CompositionKind
    let selected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: kind.symbol)
                    .font(.system(size: 18))
                    .foregroundStyle(selected ? .white : .secondary)
                    .frame(width: 44, height: 36)
                    .background(
                        RoundedRectangle(cornerRadius: 8, style: .continuous)
                            .fill(selected ? Color.blue : Color(.secondarySystemBackground))
                    )
                Text(kind.displayName)
                    .font(.system(size: 9, weight: .medium))
                    .foregroundStyle(selected ? .primary : .secondary)
                    .lineLimit(1)
                    .fixedSize()
            }
        }
    }
}

private struct MetricGridChip: View {
    let kind: HealthMetricKind
    let selected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: kind.systemSymbol)
                    .font(.system(size: 14, weight: .semibold))
                    .foregroundStyle(selected ? .white : .secondary)
                    .frame(width: 40, height: 36)
                    .background(
                        RoundedRectangle(cornerRadius: 8, style: .continuous)
                            .fill(selected ? Color.blue : Color(.secondarySystemBackground))
                    )
                Text(kind.displayName)
                    .font(.system(size: 8, weight: .medium))
                    .foregroundStyle(selected ? .primary : .secondary)
                    .lineLimit(1)
                    .fixedSize()
            }
        }
    }
}

private struct TypoChip: View {
    let kind: TypographyKind
    let selected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            Text("Ag")
                .font(kind.displayFont(size: 18))
                .foregroundStyle(selected ? .white : .secondary)
                .frame(width: 44, height: 36)
                .background(
                    RoundedRectangle(cornerRadius: 8, style: .continuous)
                        .fill(selected ? Color.blue : Color(.secondarySystemBackground))
                )
        }
    }
}

private struct IconChip: View {
    let symbol: String
    let label: String
    let selected: Bool
    let action: () -> Void

    var body: some View {
        Button(action: action) {
            VStack(spacing: 4) {
                Image(systemName: symbol)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(selected ? .white : .secondary)
                    .frame(width: 44, height: 36)
                    .background(
                        RoundedRectangle(cornerRadius: 8, style: .continuous)
                            .fill(selected ? Color.blue : Color(.secondarySystemBackground))
                    )
                Text(label)
                    .font(.system(size: 9, weight: .medium))
                    .foregroundStyle(selected ? .primary : .secondary)
            }
        }
    }
}

// MARK: - WidgetStyle helpers (symbol icons for picker rows)

extension DensityKind {
    var symbol: String {
        switch self {
        case .minimal:  return "square"
        case .balanced: return "square.grid.2x2"
        case .dense:    return "square.grid.3x3.fill"
        }
    }
}

extension AccentKind {
    var symbol: String {
        switch self {
        case .none:   return "nosign"
        case .blob:   return "cloud.fill"
        case .glow:   return "sun.max.fill"
        case .grain:  return "aqi.medium"
        case .border: return "square"
        case .grid:   return "grid"
        }
    }
}
