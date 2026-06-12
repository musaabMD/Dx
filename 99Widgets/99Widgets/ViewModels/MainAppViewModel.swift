//
//  MainAppViewModel.swift
//  99Widgets
//

import Combine
import SwiftUI
import WidgetKit

@MainActor
final class MainAppViewModel: ObservableObject {
    // MARK: - Published State

    @Published private(set) var installedWidgets: [InstalledWidgetRecord] = []
    @Published private(set) var activeWidgetID: UUID?
    @Published var isPremiumUnlocked: Bool = false
    @Published var lastMessage: String?
    @Published var healthKPIProfile: HealthKPIProfile = .default
    @Published private(set) var isUsingLiveData: Bool = false

    /// Cached snapshots keyed by metric kind (mock data for now).
    @Published private(set) var snapshots: [HealthMetricKind: MetricSnapshot] = [:]

    // MARK: - Init

    private var defaults: UserDefaults? { AppGroupConstants.sharedDefaults }
    private let healthStore = HealthKitLiveStore()

    init() {
        loadSnapshots()
        reloadFromStorage()
        Task { await startLiveData() }
    }

    // MARK: - Computed

    var activeWidget: InstalledWidgetRecord? {
        guard let id = activeWidgetID else { return installedWidgets.first }
        return installedWidgets.first { $0.id == id }
    }

    func snapshot(for kind: HealthMetricKind) -> MetricSnapshot {
        snapshots[kind] ?? MetricSnapshot.mock(for: kind)
    }

    /// Returns all snapshots for a record's slots (in order).
    func snapshots(for record: InstalledWidgetRecord) -> [MetricSnapshot] {
        record.slots.map { snapshot(for: $0.metricKind) }
    }

    var overallHealthKPI: OverallKPIResult {
        OverallHealthKPICalculator.calculate(profile: healthKPIProfile, snapshots: snapshots)
    }

    // MARK: - Storage

    func reloadFromStorage() {
        guard let defaults else { return }
        isPremiumUnlocked = defaults.bool(forKey: AppGroupConstants.Keys.isPremiumUnlocked)

        if let data = defaults.data(forKey: AppGroupConstants.Keys.installedWidgetsJSON),
           let decoded = try? JSONDecoder().decode([InstalledWidgetRecord].self, from: data) {
            installedWidgets = decoded.sorted { $0.addedAt > $1.addedAt }
        } else {
            installedWidgets = []
        }

        if let idString = defaults.string(forKey: AppGroupConstants.Keys.activeWidgetID),
           let uuid = UUID(uuidString: idString) {
            activeWidgetID = uuid
        }

        if let profileData = defaults.data(forKey: "healthKPIProfile"),
           let profile = try? JSONDecoder().decode(HealthKPIProfile.self, from: profileData) {
            healthKPIProfile = profile
        }
    }

    private func persist() {
        guard let defaults else { return }
        if let data = try? JSONEncoder().encode(installedWidgets) {
            defaults.set(data, forKey: AppGroupConstants.Keys.installedWidgetsJSON)
        }
        defaults.set(activeWidgetID?.uuidString, forKey: AppGroupConstants.Keys.activeWidgetID)
        if let profileData = try? JSONEncoder().encode(healthKPIProfile) {
            defaults.set(profileData, forKey: "healthKPIProfile")
        }
        persistActiveSnapshot()
        WidgetCenter.shared.reloadTimelines(ofKind: NinetyNineWidgetsKind.templateWidget)
    }

    private func persistActiveSnapshot() {
        guard let defaults, let active = activeWidget else { return }
        let snaps = snapshots(for: active)
        if let data = try? JSONEncoder().encode(snaps) {
            defaults.set(data, forKey: AppGroupConstants.Keys.snapshotsJSON)
        }
        if let data = try? JSONEncoder().encode(active.style) {
            defaults.set(data, forKey: "activeWidgetStyle")
        }
        if let allData = try? JSONEncoder().encode(snapshots) {
            defaults.set(allData, forKey: AppGroupConstants.Keys.allSnapshotsJSON)
        }
    }

    // MARK: - Actions

    /// Add a widget manually with one primary metric.
    func addWidget(primaryMetric: HealthMetricKind, style: WidgetStyle, customName: String? = nil) {
        if requiresPremium(style) && !isPremiumUnlocked {
            lastMessage = "Unlock Premium to use this style."
            return
        }
        let role = style.composition.slotRoles.first ?? .primary
        let slots = [MetricSlot(metricKind: primaryMetric, role: role)]
        let record = InstalledWidgetRecord(slots: slots, style: style, customName: customName)
        installedWidgets.insert(record, at: 0)
        activeWidgetID = record.id
        persist()
        lastMessage = "Widget added. Add it to your Home Screen from the widget gallery."
    }

    /// Legacy convenience used by PresetGalleryView.
    func addWidget(metricKind: HealthMetricKind, style: WidgetStyle, preset: WidgetPreset? = nil) {
        addWidget(primaryMetric: metricKind, style: style, customName: preset?.name)
    }

    func setActive(_ record: InstalledWidgetRecord) {
        activeWidgetID = record.id
        persist()
    }

    func updateRecord(_ record: InstalledWidgetRecord) {
        guard let i = installedWidgets.firstIndex(where: { $0.id == record.id }) else { return }
        installedWidgets[i] = record
        persist()
    }

    func updateStyle(for record: InstalledWidgetRecord, style: WidgetStyle) {
        guard let i = installedWidgets.firstIndex(where: { $0.id == record.id }) else { return }
        installedWidgets[i].style = style
        // Re-build slots if composition changed
        if style.composition != installedWidgets[i].style.composition {
            let primary = installedWidgets[i].primaryMetric
            installedWidgets[i].slots = StyleGenerator.buildSlots(primary: primary, composition: style.composition)
        }
        persist()
    }

    func removeWidget(_ record: InstalledWidgetRecord) {
        installedWidgets.removeAll { $0.id == record.id }
        if activeWidgetID == record.id {
            activeWidgetID = installedWidgets.first?.id
        }
        persist()
    }

    func unlockPremiumForDemo() {
        isPremiumUnlocked = true
        defaults?.set(true, forKey: AppGroupConstants.Keys.isPremiumUnlocked)
    }

    func clearMessage() { lastMessage = nil }

    func updateHealthKPIProfile(_ profile: HealthKPIProfile) {
        healthKPIProfile = profile
        persist()
    }

    // MARK: - Shuffle (procedural generation)

    /// Generates a fresh random WidgetStyle from a new seed.
    func shuffledStyle(from current: WidgetStyle, primaryMetric: HealthMetricKind, slotCount: Int = 1) -> WidgetStyle {
        let seed = UInt64.random(in: 1...UInt64.max)
        return StyleGenerator.generate(seed: seed, primaryMetric: primaryMetric, slotCount: slotCount)
    }

    /// Mutates 1–2 dimensions of the current style ("Like this" variation).
    func mutatedStyle(from current: WidgetStyle) -> WidgetStyle {
        let seed = UInt64.random(in: 1...UInt64.max)
        return StyleGenerator.mutate(style: current, seed: seed)
    }

    // MARK: - Helpers

    private func requiresPremium(_ style: WidgetStyle) -> Bool { false }

    private func loadSnapshots() {
        snapshots = Dictionary(uniqueKeysWithValues: HealthMetricKind.allCases.map { kind in
            (kind, MetricSnapshot.mock(for: kind))
        })
        if let defaults,
           let data = defaults.data(forKey: AppGroupConstants.Keys.allSnapshotsJSON),
           let decoded = try? JSONDecoder().decode([HealthMetricKind: MetricSnapshot].self, from: data),
           !decoded.isEmpty {
            snapshots.merge(decoded) { _, new in new }
        }
    }

    private func startLiveData() async {
        do {
            try await healthStore.requestAuthorization()
            await refreshLiveData()
            isUsingLiveData = true
            Task {
                while true {
                    try? await Task.sleep(nanoseconds: 15 * 60 * 1_000_000_000)
                    await refreshLiveData()
                }
            }
        } catch {
            isUsingLiveData = false
            lastMessage = "Health access unavailable. Using fallback data."
        }
    }

    func refreshLiveData() async {
        let live = await healthStore.fetchLiveSnapshots()
        guard !live.isEmpty else { return }
        snapshots.merge(live) { _, new in new }
        persist()
    }
}
