//
//  PresetGalleryView.swift  (TemplateGalleryView.swift)
//  99Widgets
//

import SwiftUI

// Renamed logic; file kept as TemplateGalleryView.swift so Xcode doesn't lose it.
typealias TemplateGalleryView = PresetGalleryView

struct PresetGalleryView: View {
    @EnvironmentObject private var viewModel: MainAppViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var detailPreset: WidgetPreset? = nil
    @State private var searchText: String = ""
    @State private var selectedTag: PresetTag? = nil

    private var filteredPresets: [WidgetPreset] {
        WidgetPreset.catalog.filter { preset in
            let matchesTag = selectedTag == nil || preset.tags.contains(selectedTag!)
            let matchesSearch = searchText.isEmpty ||
                preset.name.localizedCaseInsensitiveContains(searchText) ||
                preset.description.localizedCaseInsensitiveContains(searchText) ||
                preset.tags.contains { $0.rawValue.localizedCaseInsensitiveContains(searchText) }
            return matchesTag && matchesSearch
        }
    }

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 0) {
                    // Inline search bar — always visible, no pull-to-reveal
                    searchBar
                        .padding(.top, 8)
                        .padding(.bottom, 14)

                    tagFilterRow
                        .padding(.bottom, 20)

                    if filteredPresets.isEmpty {
                        emptySearchState
                    } else {
                        VStack(spacing: 20) {
                            ForEach(filteredPresets) { preset in
                                PresetCard(
                                    preset: preset,
                                    snapshots: [viewModel.snapshot(for: preset.defaultMetric)],
                                    onTap: { detailPreset = preset }
                                )
                            }
                        }
                    }
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 40)
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Presets")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .confirmationAction) {
                    Button("Done") { dismiss() }
                        .fontWeight(.semibold)
                }
            }
        }
        .sheet(item: $detailPreset) { preset in
            PresetDetailSheet(preset: preset) { dismiss() }
                .environmentObject(viewModel)
        }
    }

    // MARK: - Inline Search Bar

    private var searchBar: some View {
        HStack(spacing: 8) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 15, weight: .medium))
                .foregroundStyle(Color(.tertiaryLabel))
            TextField("Search presets…", text: $searchText)
                .font(.system(size: 15))
                .submitLabel(.search)
            if !searchText.isEmpty {
                Button {
                    withAnimation(.easeOut(duration: 0.15)) { searchText = "" }
                } label: {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 15))
                        .foregroundStyle(Color(.tertiaryLabel))
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 10)
        .background(
            RoundedRectangle(cornerRadius: 12, style: .continuous)
                .fill(Color(.secondarySystemGroupedBackground))
        )
    }

    // MARK: - Tag Filter Row

    private var tagFilterRow: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                TagFilterChip(label: "All", symbol: "square.grid.2x2", isSelected: selectedTag == nil) {
                    withAnimation(.easeInOut(duration: 0.18)) { selectedTag = nil }
                }
                ForEach(PresetTag.allCases) { tag in
                    TagFilterChip(label: tag.rawValue, symbol: tag.systemSymbol, isSelected: selectedTag == tag) {
                        withAnimation(.easeInOut(duration: 0.18)) {
                            selectedTag = selectedTag == tag ? nil : tag
                        }
                    }
                }
            }
            .padding(.horizontal, 20)
        }
        .padding(.horizontal, -20)
    }

    // MARK: - Empty State

    private var emptySearchState: some View {
        VStack(spacing: 12) {
            Image(systemName: "magnifyingglass")
                .font(.system(size: 36, weight: .light))
                .foregroundStyle(Color(.tertiaryLabel))
            Text("No presets found")
                .font(.subheadline.weight(.medium))
                .foregroundStyle(.secondary)
            Text("Try a different search or tag")
                .font(.caption)
                .foregroundStyle(Color(.tertiaryLabel))
        }
        .frame(maxWidth: .infinity)
        .padding(.top, 60)
    }
}

// MARK: - Tag Filter Chip

private struct TagFilterChip: View {
    let label: String
    let symbol: String
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 5) {
                Image(systemName: symbol)
                    .font(.caption.weight(.semibold))
                Text(label)
                    .font(.subheadline.weight(isSelected ? .semibold : .regular))
            }
            .foregroundStyle(isSelected ? .white : .primary)
            .padding(.horizontal, 13)
            .padding(.vertical, 8)
            .background(Capsule().fill(isSelected ? Color.blue : Color(.secondarySystemGroupedBackground)))
        }
        .buttonStyle(.plain)
    }
}

// MARK: - Preset Card
// No text below the widget — name only appears as a short bottom overlay label.
// Uses a custom ButtonStyle so the scroll view always gets priority on drag.

private struct PresetCard: View {
    let preset: WidgetPreset
    let snapshots: [MetricSnapshot]
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            ZStack(alignment: .bottomLeading) {
                WidgetRenderView(snapshots: snapshots, style: preset.style)

                // Slim frosted name badge at the bottom-left corner
                HStack(spacing: 5) {
                    Text(preset.name)
                        .font(.system(size: 11, weight: .semibold))
                        .foregroundStyle(.white)
                    Spacer(minLength: 0)
                    Image(systemName: "chevron.right")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundStyle(.white.opacity(0.7))
                }
                .padding(.horizontal, 10)
                .padding(.vertical, 6)
                .background(
                    .ultraThinMaterial,
                    in: RoundedRectangle(cornerRadius: 10, style: .continuous)
                )
                .padding(10)
            }
        }
        .buttonStyle(PresetCardButtonStyle())
    }
}

/// Scroll-safe press style: never intercepts the drag, only reacts to a confirmed tap.
private struct PresetCardButtonStyle: ButtonStyle {
    func makeBody(configuration: Configuration) -> some View {
        configuration.label
            .scaleEffect(configuration.isPressed ? 0.97 : 1)
            .animation(.easeOut(duration: 0.12), value: configuration.isPressed)
    }
}

// MARK: - Preset Detail Sheet

struct PresetDetailSheet: View {
    let preset: WidgetPreset
    var onAdded: (() -> Void)? = nil

    @EnvironmentObject private var viewModel: MainAppViewModel
    @Environment(\.dismiss) private var dismiss

    @State private var selectedMetric: HealthMetricKind
    @State private var showStudio = false

    init(preset: WidgetPreset, onAdded: (() -> Void)? = nil) {
        self.preset = preset
        self.onAdded = onAdded
        self._selectedMetric = State(initialValue: preset.defaultMetric)
    }

    var body: some View {
        VStack(spacing: 0) {
            // Drag handle
            Capsule()
                .fill(Color(.systemFill))
                .frame(width: 36, height: 4)
                .padding(.top, 10)
                .padding(.bottom, 16)

            ScrollView {
                VStack(alignment: .leading, spacing: 28) {
                    previewSection
                    metricPickerSection
                    addSection
                }
                .padding(.horizontal, 20)
                .padding(.bottom, 48)
            }
        }
        .background(Color(.systemGroupedBackground))
        .ignoresSafeArea(edges: .bottom)
        .sheet(isPresented: $showStudio) {
            WidgetStudioView(
                record: InstalledWidgetRecord(metricKind: selectedMetric, style: preset.style),
                isCreating: true
            ) { record in
                viewModel.addWidget(metricKind: record.primaryMetric, style: record.style, preset: preset)
                dismiss()
                onAdded?()
            }
            .environmentObject(viewModel)
        }
    }

    // Live preview with the selected metric + smart-filled complementary metrics
    private var previewSection: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(preset.name)
                        .font(.title2.weight(.bold))
                    Text(preset.description)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                }
                Spacer()
            }

            TimelineView(.periodic(from: .now, by: 30)) { _ in
                WidgetRenderView(
                    snapshots: [viewModel.snapshot(for: selectedMetric)],
                    style: preset.style
                )
            }
        }
    }

    // Horizontally scrolling metric picker
    private var metricPickerSection: some View {
        VStack(alignment: .leading, spacing: 10) {
            Text("Choose Metric")
                .font(.subheadline.weight(.semibold))
                .foregroundStyle(.secondary)
                .textCase(.uppercase)
                .kerning(0.5)

            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 8) {
                    ForEach(HealthMetricKind.allCases) { kind in
                        MetricChip(
                            kind: kind,
                            isSelected: kind == selectedMetric,
                            onTap: { selectedMetric = kind }
                        )
                    }
                }
                .padding(.horizontal, 20)
            }
            .padding(.horizontal, -20)
        }
    }

    private var addSection: some View {
        VStack(spacing: 10) {
            Button {
                viewModel.addWidget(metricKind: selectedMetric, style: preset.style, preset: preset)
                dismiss()
                onAdded?()
            } label: {
                Text("Add Widget")
                    .font(.body.weight(.semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(
                        RoundedRectangle(cornerRadius: 14, style: .continuous)
                            .fill(Color.blue)
                    )
            }
            .buttonStyle(.plain)

            Button {
                showStudio = true
            } label: {
                Text("Customise in Studio →")
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(.blue)
            }
            .buttonStyle(.plain)
        }
    }
}

// MARK: - Metric Chip

struct MetricChip: View {
    let kind: HealthMetricKind
    let isSelected: Bool
    let onTap: () -> Void

    var body: some View {
        Button(action: onTap) {
            HStack(spacing: 6) {
                Image(systemName: kind.systemSymbol)
                    .font(.caption.weight(.semibold))
                Text(kind.displayName)
                    .font(.subheadline.weight(isSelected ? .semibold : .regular))
            }
            .foregroundStyle(isSelected ? .white : .primary)
            .padding(.horizontal, 14)
            .padding(.vertical, 9)
            .background(
                Capsule()
                    .fill(isSelected ? Color.blue : Color(.secondarySystemGroupedBackground))
            )
        }
        .buttonStyle(.plain)
    }
}

#Preview {
    PresetGalleryView()
        .environmentObject(MainAppViewModel())
}
