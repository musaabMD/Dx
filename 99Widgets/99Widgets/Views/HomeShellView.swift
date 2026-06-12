//
//  HomeShellView.swift
//  99Widgets
//

import SwiftUI

struct HomeShellView: View {
    @EnvironmentObject private var viewModel: MainAppViewModel
    @State private var showPresets = false
    @State private var showUpgrade = false
    @State private var studioWidget: InstalledWidgetRecord? = nil

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.installedWidgets.isEmpty {
                    emptyState
                } else {
                    widgetList
                }
            }
            .background(Color(.systemGroupedBackground))
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .principal) {
                    Text("99 Widgets")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundStyle(.primary)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button {
                        showPresets = true
                    } label: {
                        ZStack {
                            Circle()
                                .fill(Color(.secondarySystemGroupedBackground))
                                .frame(width: 34, height: 34)
                                .shadow(color: .black.opacity(0.06), radius: 4, x: 0, y: 2)
                            Image(systemName: "plus")
                                .font(.system(size: 14, weight: .bold))
                                .foregroundStyle(.primary)
                        }
                    }
                    .buttonStyle(.plain)
                }
                ToolbarItem(placement: .navigationBarLeading) {
                    Button { showUpgrade = true } label: {
                        HStack(spacing: 5) {
                            Image(systemName: "crown.fill")
                                .font(.system(size: 11, weight: .bold))
                            Text("Pro")
                                .font(.system(size: 13, weight: .bold))
                        }
                        .foregroundStyle(Color(red: 0.85, green: 0.50, blue: 0.10))
                        .padding(.horizontal, 12)
                        .padding(.vertical, 7)
                        .background(
                            Capsule()
                                .fill(Color(red: 1.0, green: 0.88, blue: 0.72))
                        )
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .sheet(isPresented: $showPresets) {
            PresetGalleryView()
                .environmentObject(viewModel)
        }
        .sheet(isPresented: $showUpgrade) {
            UpgradeView(showDoneButton: true)
                .environmentObject(viewModel)
        }
        .sheet(item: $studioWidget) { record in
            WidgetStudioView(record: record)
                .environmentObject(viewModel)
        }
        .alert("Widget", isPresented: Binding(
            get: { viewModel.lastMessage != nil },
            set: { if !$0 { viewModel.clearMessage() } }
        )) {
            Button("OK", role: .cancel) { viewModel.clearMessage() }
        } message: {
            Text(viewModel.lastMessage ?? "")
        }
    }

    // MARK: - Widget List

    private var widgetList: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 0) {
                HealthKPIDashboardView()
                    .padding(.bottom, 24)

                // Active widget
                if let active = viewModel.activeWidget {
                    activeSection(active)
                        .padding(.bottom, 36)
                }

                // Library
                if viewModel.installedWidgets.count > 1 {
                    librarySection
                        .padding(.bottom, 40)
                }
            }
            .padding(.horizontal, 20)
            .padding(.top, 4)
        }
    }

    // MARK: - Active Widget Section

    private func activeSection(_ record: InstalledWidgetRecord) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            sectionLabel("Active Widget")
            HStack(spacing: 6) {
                Image(systemName: viewModel.isUsingLiveData ? "dot.radiowaves.left.and.right" : "exclamationmark.triangle.fill")
                    .font(.caption2.weight(.semibold))
                Text(viewModel.isUsingLiveData ? "Live Data" : "Fallback Data")
                    .font(.caption2.weight(.semibold))
            }
            .foregroundStyle(viewModel.isUsingLiveData ? Color.green : Color.orange)

            TimelineView(.periodic(from: .now, by: 30)) { _ in
                WidgetRenderView(
                    snapshots: viewModel.snapshots(for: record),
                    style: record.style
                )
            }
            .onTapGesture { studioWidget = record }
        }
    }

    // MARK: - Library Section

    private var librarySection: some View {
        VStack(alignment: .leading, spacing: 16) {
            sectionLabel("Library")

            VStack(spacing: 28) {
                ForEach(viewModel.installedWidgets.dropFirst()) { record in
                    LibraryRow(
                        record: record,
                        snapshots: viewModel.snapshots(for: record),
                        onEdit: { studioWidget = record }
                    )
                }
            }
        }
    }

    // MARK: - Empty State

    private var emptyState: some View {
        GeometryReader { geo in
            ScrollView {
                VStack(spacing: 0) {
                    Spacer(minLength: geo.size.height * 0.08)

                    // Hero illustration
                    ZStack {
                        // Outer glow ring
                        Circle()
                            .fill(
                                RadialGradient(
                                    colors: [Color.blue.opacity(0.18), Color.blue.opacity(0)],
                                    center: .center,
                                    startRadius: 44,
                                    endRadius: 110
                                )
                            )
                            .frame(width: 220, height: 220)

                        // Icon background pill
                        RoundedRectangle(cornerRadius: 32, style: .continuous)
                            .fill(
                                LinearGradient(
                                    colors: [Color.blue.opacity(0.15), Color.indigo.opacity(0.10)],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )
                            .frame(width: 112, height: 112)
                            .overlay(
                                RoundedRectangle(cornerRadius: 32, style: .continuous)
                                    .strokeBorder(
                                        LinearGradient(
                                            colors: [Color.blue.opacity(0.35), Color.indigo.opacity(0.15)],
                                            startPoint: .topLeading,
                                            endPoint: .bottomTrailing
                                        ),
                                        lineWidth: 1
                                    )
                            )

                        // Stacked widget icon
                        Image(systemName: "rectangle.on.rectangle")
                            .font(.system(size: 42, weight: .semibold))
                            .foregroundStyle(
                                LinearGradient(
                                    colors: [.blue, .indigo],
                                    startPoint: .topLeading,
                                    endPoint: .bottomTrailing
                                )
                            )

                        // Sparkle accents
                        Image(systemName: "sparkle")
                            .font(.system(size: 14, weight: .bold))
                            .foregroundStyle(.blue.opacity(0.7))
                            .offset(x: 48, y: -42)

                        Image(systemName: "sparkle")
                            .font(.system(size: 9, weight: .bold))
                            .foregroundStyle(.indigo.opacity(0.5))
                            .offset(x: -50, y: 36)
                    }
                    .padding(.bottom, 32)

                    // Headline + body
                    VStack(spacing: 10) {
                        Text("No Widgets Yet")
                            .font(.title2.weight(.bold))
                            .foregroundStyle(.primary)

                        Text("Pick a ready-made preset or build\nyour own in the Studio.")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                            .multilineTextAlignment(.center)
                            .lineSpacing(3)
                    }
                    .padding(.bottom, 36)

                    // Primary CTA
                    Button {
                        showPresets = true
                    } label: {
                        HStack(spacing: 8) {
                            Image(systemName: "square.grid.2x2.fill")
                                .font(.body.weight(.semibold))
                            Text("Browse Presets")
                                .font(.body.weight(.semibold))
                        }
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 16)
                        .background(
                            LinearGradient(
                                colors: [Color.blue, Color.indigo],
                                startPoint: .leading,
                                endPoint: .trailing
                            ),
                            in: RoundedRectangle(cornerRadius: 16, style: .continuous)
                        )
                        .shadow(color: .blue.opacity(0.30), radius: 12, x: 0, y: 6)
                    }
                    .buttonStyle(.plain)
                    .padding(.bottom, 14)

                    // Secondary CTA
                    Button {
                        showPresets = true
                    } label: {
                        HStack(spacing: 6) {
                            Image(systemName: "pencil.and.ruler")
                                .font(.subheadline.weight(.medium))
                            Text("Build Custom Widget")
                                .font(.subheadline.weight(.medium))
                        }
                        .foregroundStyle(.blue)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 14)
                        .background(
                            RoundedRectangle(cornerRadius: 16, style: .continuous)
                                .fill(Color.blue.opacity(0.10))
                        )
                    }
                    .buttonStyle(.plain)

                    Spacer(minLength: 40)
                }
                .padding(.horizontal, 32)
                .frame(minHeight: geo.size.height)
            }
        }
    }

    // MARK: - Section Label

    private func sectionLabel(_ title: String) -> some View {
        Text(title)
            .font(.subheadline.weight(.semibold))
            .foregroundStyle(.secondary)
            .textCase(.uppercase)
            .kerning(0.5)
    }
}

// MARK: - Library Row

private struct LibraryRow: View {
    let record: InstalledWidgetRecord
    let snapshots: [MetricSnapshot]
    let onEdit: () -> Void

    var body: some View {
        WidgetRenderView(snapshots: snapshots, style: record.style)
            .onTapGesture { onEdit() }
    }
}

#Preview {
    HomeShellView()
        .environmentObject(MainAppViewModel())
}
