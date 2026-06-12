import SwiftUI

struct NahrSettings {
    var language: AppLanguage = .arabic
    var calendarSystem: CalendarSystemPreference = .dual
    var layoutPreference: LayoutPreference = .automatic
    var appearance: AppearanceMode = .dark
    var accent: AccentPalette = .teal
    var weekStart: WeekStart = .saturday
    var glassIntensity: Double = 0.78
    var showsPrayerTimes: Bool = true
    var denseLayout: Bool = false

    func layoutDirection(for language: AppLanguage) -> LayoutDirection {
        switch layoutPreference {
        case .automatic:
            return language == .arabic ? .rightToLeft : .leftToRight
        case .rtl:
            return .rightToLeft
        case .ltr:
            return .leftToRight
        }
    }
}

enum AppLanguage: String, CaseIterable, Identifiable {
    case arabic
    case english

    var id: String { rawValue }

    var locale: Locale {
        switch self {
        case .arabic: Locale(identifier: "ar_SA")
        case .english: Locale(identifier: "en_US")
        }
    }

    var title: String {
        switch self {
        case .arabic: "العربية"
        case .english: "English"
        }
    }
}

enum CalendarSystemPreference: String, CaseIterable, Identifiable {
    case gregorian
    case hijri
    case dual

    var id: String { rawValue }
}

enum LayoutPreference: String, CaseIterable, Identifiable {
    case automatic
    case rtl
    case ltr

    var id: String { rawValue }
}

enum AppearanceMode: String, CaseIterable, Identifiable {
    case system
    case light
    case dark

    var id: String { rawValue }

    var colorScheme: ColorScheme? {
        switch self {
        case .system: nil
        case .light: .light
        case .dark: .dark
        }
    }
}

enum WeekStart: String, CaseIterable, Identifiable {
    case saturday
    case sunday

    var id: String { rawValue }
}

enum AccentPalette: String, CaseIterable, Identifiable {
    case teal
    case amber
    case rose
    case indigo

    var id: String { rawValue }

    var primary: Color {
        switch self {
        case .teal: Color(red: 0.16, green: 0.82, blue: 0.78)
        case .amber: Color(red: 0.95, green: 0.70, blue: 0.22)
        case .rose: Color(red: 0.95, green: 0.39, blue: 0.58)
        case .indigo: Color(red: 0.47, green: 0.53, blue: 0.96)
        }
    }

    var secondary: Color {
        switch self {
        case .teal: Color(red: 0.09, green: 0.36, blue: 0.42)
        case .amber: Color(red: 0.42, green: 0.28, blue: 0.08)
        case .rose: Color(red: 0.42, green: 0.12, blue: 0.22)
        case .indigo: Color(red: 0.18, green: 0.20, blue: 0.42)
        }
    }
}

enum HomeDisplayMode: String, CaseIterable, Identifiable {
    case timeline
    case agenda

    var id: String { rawValue }
}

enum PlannerDisplayMode: String, CaseIterable, Identifiable {
    case month
    case week

    var id: String { rawValue }
}

enum TaskFilter: String, CaseIterable, Identifiable {
    case today
    case scheduled
    case all

    var id: String { rawValue }
}

enum EventAccent: String, CaseIterable {
    case azure
    case mint
    case sunset
    case violet

    var color: Color {
        switch self {
        case .azure: Color(red: 0.36, green: 0.74, blue: 0.98)
        case .mint: Color(red: 0.22, green: 0.88, blue: 0.65)
        case .sunset: Color(red: 0.97, green: 0.55, blue: 0.35)
        case .violet: Color(red: 0.66, green: 0.52, blue: 0.98)
        }
    }
}

enum TaskPriority: Int, CaseIterable, Identifiable {
    case low = 1
    case medium = 2
    case high = 3

    var id: Int { rawValue }
}

struct EventParticipant: Identifiable, Hashable {
    let id = UUID()
    let name: String
    let initials: String
}

struct CalendarEvent: Identifiable, Hashable {
    let id: UUID
    var title: String
    var startsAt: Date
    var endsAt: Date
    var location: String?
    var notes: String
    var calendarName: String
    var accent: EventAccent
    var participants: [EventParticipant]
    var isAllDay: Bool
    var meetingURL: URL?
    var weatherSummary: String?
    var travelMinutes: Int?

    init(
        id: UUID = UUID(),
        title: String,
        startsAt: Date,
        endsAt: Date,
        location: String? = nil,
        notes: String = "",
        calendarName: String,
        accent: EventAccent,
        participants: [EventParticipant] = [],
        isAllDay: Bool = false,
        meetingURL: URL? = nil,
        weatherSummary: String? = nil,
        travelMinutes: Int? = nil
    ) {
        self.id = id
        self.title = title
        self.startsAt = startsAt
        self.endsAt = endsAt
        self.location = location
        self.notes = notes
        self.calendarName = calendarName
        self.accent = accent
        self.participants = participants
        self.isAllDay = isAllDay
        self.meetingURL = meetingURL
        self.weatherSummary = weatherSummary
        self.travelMinutes = travelMinutes
    }
}

struct NahrTask: Identifiable, Hashable {
    let id: UUID
    var title: String
    var dueDate: Date?
    var priority: TaskPriority
    var completed: Bool

    init(id: UUID = UUID(), title: String, dueDate: Date? = nil, priority: TaskPriority, completed: Bool = false) {
        self.id = id
        self.title = title
        self.dueDate = dueDate
        self.priority = priority
        self.completed = completed
    }
}

struct AgendaSection: Identifiable {
    let id = UUID()
    let title: String
    let date: Date
    let events: [CalendarEvent]
}

enum AgendaEntry: Identifiable, Hashable {
    case event(CalendarEvent)
    case task(NahrTask)

    var id: String {
        switch self {
        case .event(let event):
            return "event-\(event.id.uuidString)"
        case .task(let task):
            return "task-\(task.id.uuidString)"
        }
    }
}

struct UnifiedAgendaSection: Identifiable {
    let id = UUID()
    let title: String
    let date: Date
    let entries: [AgendaEntry]
}

struct QuickAddParseResult: Equatable {
    var title: String
    var startDate: Date
    var endDate: Date
    var location: String?
    var invitees: [String]
    var detectedDateText: String?
    var detectedTimeText: String?
    var naturalInput: String
}
