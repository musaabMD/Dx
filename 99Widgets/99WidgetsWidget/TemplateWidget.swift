//
//  TemplateWidget.swift
//  99WidgetsWidget
//

import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Timeline Provider

private struct WidgetStoredRecord: Codable {
    let id: UUID
    let slots: [MetricSlot]
    let style: WidgetStyle
    let customName: String?

    var displayName: String {
        customName ?? slots.first?.metricKind.displayName ?? "Widget"
    }
}

struct WidgetRecordEntity: AppEntity {
    static var typeDisplayRepresentation: TypeDisplayRepresentation = "Saved Widget"
    static var defaultQuery = WidgetRecordEntityQuery()

    var id: String
    var name: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(name)")
    }
}

struct WidgetRecordEntityQuery: EntityQuery {
    func entities(for identifiers: [WidgetRecordEntity.ID]) async throws -> [WidgetRecordEntity] {
        let all = loadEntities()
        return all.filter { identifiers.contains($0.id) }
    }

    func suggestedEntities() async throws -> [WidgetRecordEntity] {
        loadEntities()
    }

    private func loadEntities() -> [WidgetRecordEntity] {
        guard let defaults = AppGroupConstants.sharedDefaults,
              let data = defaults.data(forKey: AppGroupConstants.Keys.installedWidgetsJSON),
              let records = try? JSONDecoder().decode([WidgetStoredRecord].self, from: data) else {
            return []
        }
        return records.map {
            WidgetRecordEntity(id: $0.id.uuidString, name: $0.displayName)
        }
    }
}

struct WidgetSelectionIntent: WidgetConfigurationIntent {
    static var title: LocalizedStringResource = "Choose Widget"
    static var description = IntentDescription("Pick which saved widget this instance displays.")

    @Parameter(title: "Saved Widget")
    var widget: WidgetRecordEntity?
}

struct TemplateProvider: AppIntentTimelineProvider {
    func placeholder(in context: Context) -> TemplateEntry {
        TemplateEntry(
            date: .now,
            snapshots: [.mock(for: .steps)],
            style: .default,
            configuration: WidgetSelectionIntent()
        )
    }

    func snapshot(for configuration: WidgetSelectionIntent, in context: Context) async -> TemplateEntry {
        makeEntry(configuration: configuration)
    }

    func timeline(for configuration: WidgetSelectionIntent, in context: Context) async -> Timeline<TemplateEntry> {
        let entry = makeEntry(configuration: configuration)
        let next = Calendar.current.date(byAdding: .minute, value: 30, to: .now) ?? .now
        return Timeline(entries: [entry], policy: .after(next))
    }

    private func makeEntry(configuration: WidgetSelectionIntent) -> TemplateEntry {
        guard let defaults = AppGroupConstants.sharedDefaults else {
            return TemplateEntry(date: .now, snapshots: [.mock(for: .steps)], style: .default, configuration: configuration)
        }

        let records: [WidgetStoredRecord]
        if let data = defaults.data(forKey: AppGroupConstants.Keys.installedWidgetsJSON),
           let decoded = try? JSONDecoder().decode([WidgetStoredRecord].self, from: data) {
            records = decoded
        } else {
            records = []
        }

        let selectedRecord: WidgetStoredRecord?
        if let selectedID = configuration.widget?.id, let uuid = UUID(uuidString: selectedID) {
            selectedRecord = records.first { $0.id == uuid }
        } else if let activeString = defaults.string(forKey: AppGroupConstants.Keys.activeWidgetID),
                  let activeUUID = UUID(uuidString: activeString) {
            selectedRecord = records.first { $0.id == activeUUID } ?? records.first
        } else {
            selectedRecord = records.first
        }

        let allSnapshots: [HealthMetricKind: MetricSnapshot]
        if let data = defaults.data(forKey: AppGroupConstants.Keys.allSnapshotsJSON),
           let decoded = try? JSONDecoder().decode([HealthMetricKind: MetricSnapshot].self, from: data) {
            allSnapshots = decoded
        } else {
            allSnapshots = [:]
        }

        let style = selectedRecord?.style ?? .default
        let snapshots: [MetricSnapshot] = selectedRecord?.slots.map {
            allSnapshots[$0.metricKind] ?? MetricSnapshot.mock(for: $0.metricKind)
        } ?? [MetricSnapshot.mock(for: .steps)]

        return TemplateEntry(date: .now, snapshots: snapshots, style: style, configuration: configuration)
    }
}

// MARK: - Entry

struct TemplateEntry: TimelineEntry {
    let date: Date
    let snapshots: [MetricSnapshot]
    let style: WidgetStyle
    let configuration: WidgetSelectionIntent
}

// MARK: - Widget View

struct TemplateWidgetEntryView: View {
    let entry: TemplateEntry

    private var palette: WidgetPalette { WidgetPalette.make(entry.style.palette) }

    var body: some View {
        WidgetRenderView(snapshots: entry.snapshots, style: entry.style, fillsContainer: true)
            .containerBackground(for: .widget) {
                LinearGradient(
                    colors: [palette.backgroundTop, palette.backgroundBottom],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
            }
    }
}

// MARK: - Widget Configuration

struct TemplateWidget: Widget {
    let kind: String = NinetyNineWidgetsKind.templateWidget

    var body: some WidgetConfiguration {
        AppIntentConfiguration(kind: kind, intent: WidgetSelectionIntent.self, provider: TemplateProvider()) { entry in
            TemplateWidgetEntryView(entry: entry)
        }
        .configurationDisplayName("99 Widgets")
        .description("Your personal health & productivity widget.")
        .supportedFamilies([.systemSmall, .systemMedium, .systemLarge])
    }
}

@main
struct NinetyNineWidgetsBundle: WidgetBundle {
    var body: some Widget {
        TemplateWidget()
    }
}
