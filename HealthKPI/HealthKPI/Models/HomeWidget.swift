import SwiftUI

// MARK: - Home Widget Kinds
//
// The catalog of widgets a user can pin to the Dashboard. Adding a new
// widget is a two-step change:
//   1. Add a case here with its metadata.
//   2. Render the case in `HomeView.widgetView(for:)`.
//
// Persisted as a comma-separated list of raw values via @AppStorage.

enum HomeWidgetKind: String, CaseIterable, Identifiable, Codable {
    case summary

    var id: String { rawValue }

    var title: String {
        switch self {
        case .summary: return "Health at a Glance"
        }
    }

    var subtitle: String {
        switch self {
        case .summary: return "Overall ring + every category with check or alert"
        }
    }

    var icon: String {
        switch self {
        case .summary: return "square.grid.2x2.fill"
        }
    }

    var tint: Color {
        switch self {
        case .summary: return Theme.accent
        }
    }
}
