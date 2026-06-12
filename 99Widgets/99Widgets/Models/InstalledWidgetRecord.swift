//
//  InstalledWidgetRecord.swift
//  99Widgets
//
//  Stores one saved widget configuration.
//  slots: ordered array of MetricSlot — first is always the primary hero.
//

import Foundation

struct InstalledWidgetRecord: Codable, Identifiable, Hashable {
    let id: UUID
    var slots: [MetricSlot]       // first slot = primary hero
    var style: WidgetStyle
    var customName: String?
    let addedAt: Date

    // MARK: Convenience

    /// Primary metric (hero slot).
    var primaryMetric: HealthMetricKind { slots.first?.metricKind ?? .steps }

    var displayName: String { customName ?? primaryMetric.displayName }

    // MARK: Init

    init(
        id: UUID = UUID(),
        slots: [MetricSlot],
        style: WidgetStyle = .default,
        customName: String? = nil,
        addedAt: Date = .now
    ) {
        self.id = id
        self.slots = slots
        self.style = style
        self.customName = customName
        self.addedAt = addedAt
    }

    /// Convenience: single-metric widget.
    init(
        id: UUID = UUID(),
        metricKind: HealthMetricKind,
        style: WidgetStyle = .default,
        customName: String? = nil,
        addedAt: Date = .now
    ) {
        let role = style.composition.slotRoles.first ?? .primary
        self.init(
            id: id,
            slots: [MetricSlot(metricKind: metricKind, role: role)],
            style: style,
            customName: customName,
            addedAt: addedAt
        )
    }
}
