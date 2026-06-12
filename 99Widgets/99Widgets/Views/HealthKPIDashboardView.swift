//
//  HealthKPIDashboardView.swift
//  99Widgets
//

import SwiftUI

struct HealthKPIDashboardView: View {
    @EnvironmentObject private var vm: MainAppViewModel
    @State private var editorProfile: HealthKPIProfile = .default
    @State private var showEditor = false

    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Overall Health KPI")
                    .font(.headline.weight(.semibold))
                Spacer()
                Button("Edit") {
                    editorProfile = vm.healthKPIProfile
                    showEditor = true
                }
                .font(.subheadline.weight(.semibold))
            }

            KPIHeroCard(result: vm.overallHealthKPI)

            ForEach(vm.overallHealthKPI.sections) { section in
                HStack {
                    Text(section.title)
                        .font(.subheadline)
                        .foregroundStyle(.secondary)
                    Spacer()
                    Text("\(Int(section.score))")
                        .font(.subheadline.weight(.bold))
                    Text(section.band.label)
                        .font(.caption.weight(.semibold))
                        .foregroundStyle(bandColor(section.band))
                }
            }
        }
        .padding(16)
        .background(
            RoundedRectangle(cornerRadius: 16, style: .continuous)
                .fill(Color(.systemBackground))
        )
        .sheet(isPresented: $showEditor) {
            NavigationStack {
                Form {
                    Section("Status Bands") {
                        thresholdRow(title: "Poor Max", value: $editorProfile.thresholds.poorMax)
                        thresholdRow(title: "Average Max", value: $editorProfile.thresholds.averageMax)
                        thresholdRow(title: "Good Max", value: $editorProfile.thresholds.goodMax)
                    }

                    ForEach(editorProfile.sections.indices, id: \.self) { sectionIndex in
                        Section(editorProfile.sections[sectionIndex].title) {
                            ForEach(editorProfile.sections[sectionIndex].rules.indices, id: \.self) { ruleIndex in
                                let rule = editorProfile.sections[sectionIndex].rules[ruleIndex]
                                VStack(alignment: .leading, spacing: 8) {
                                    Text(rule.kind.displayName)
                                        .font(.subheadline.weight(.semibold))
                                    HStack {
                                        Text("Weight")
                                        Slider(
                                            value: $editorProfile.sections[sectionIndex].rules[ruleIndex].weight,
                                            in: 0.2...2.0
                                        )
                                        Text(String(format: "%.1f", editorProfile.sections[sectionIndex].rules[ruleIndex].weight))
                                            .font(.caption.monospacedDigit())
                                            .foregroundStyle(.secondary)
                                    }
                                    Toggle(
                                        "Lower is better",
                                        isOn: $editorProfile.sections[sectionIndex].rules[ruleIndex].invertScoring
                                    )
                                }
                            }
                        }
                    }
                }
                .navigationTitle("Edit KPI")
                .toolbar {
                    ToolbarItem(placement: .cancellationAction) {
                        Button("Cancel") { showEditor = false }
                    }
                    ToolbarItem(placement: .confirmationAction) {
                        Button("Save") {
                            normalizeThresholds()
                            vm.updateHealthKPIProfile(editorProfile)
                            showEditor = false
                        }
                    }
                }
            }
        }
    }

    private func thresholdRow(title: String, value: Binding<Double>) -> some View {
        HStack {
            Text(title)
            Spacer()
            TextField(title, value: value, format: .number)
                .keyboardType(.decimalPad)
                .multilineTextAlignment(.trailing)
                .frame(width: 70)
        }
    }

    private func normalizeThresholds() {
        let poor = min(editorProfile.thresholds.poorMax, editorProfile.thresholds.averageMax - 1)
        let average = max(poor + 1, min(editorProfile.thresholds.averageMax, editorProfile.thresholds.goodMax - 1))
        let good = max(average + 1, min(editorProfile.thresholds.goodMax, 99))
        editorProfile.thresholds = .init(poorMax: poor, averageMax: average, goodMax: good, excellentMax: 100)
    }

    private func bandColor(_ band: KPIBand) -> Color {
        switch band {
        case .poor: return .red
        case .average: return .orange
        case .good: return .blue
        case .excellent: return .green
        }
    }
}

private struct KPIHeroCard: View {
    let result: OverallKPIResult

    var body: some View {
        HStack(spacing: 16) {
            Gauge(value: result.score, in: 0...100) {
                EmptyView()
            } currentValueLabel: {
                Text("\(Int(result.score))")
                    .font(.title2.bold())
            }
            .gaugeStyle(.accessoryCircularCapacity)
            VStack(alignment: .leading, spacing: 4) {
                Text(result.band.label)
                    .font(.headline.weight(.bold))
                Text("Aggregate across sleep, cardio, activity, body, lifestyle, nutrition, mobility, and hearing.")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                    .fixedSize(horizontal: false, vertical: true)
            }
        }
    }
}
