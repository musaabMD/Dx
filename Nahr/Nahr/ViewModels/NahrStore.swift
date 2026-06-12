import Combine
import Foundation
import SwiftUI

@MainActor
final class NahrStore: ObservableObject {
    @Published var settings = NahrSettings()
    @Published var selectedDate = Date()
    @Published var homeMode: HomeDisplayMode = .timeline
    @Published var plannerMode: PlannerDisplayMode = .month
    @Published var taskFilter: TaskFilter = .today
    @Published var events: [CalendarEvent] = []
    @Published var tasks: [NahrTask] = []
    @Published var showQuickAdd = false
    @Published var selectedEvent: CalendarEvent?
    @Published var showOnboarding = false

    init() {
        seed()
        let hasSeenOnboarding = UserDefaults.standard.bool(forKey: "nahr.hasSeenOnboarding")
        let isUITesting = ProcessInfo.processInfo.arguments.contains("--uitesting")
        showOnboarding = !hasSeenOnboarding && !isUITesting
    }

    func text(ar: String, en: String) -> String {
        settings.language == .arabic ? ar : en
    }

    func completeOnboarding() {
        UserDefaults.standard.set(true, forKey: "nahr.hasSeenOnboarding")
        showOnboarding = false
    }

    var selectedDayEvents: [CalendarEvent] {
        events(for: selectedDate)
    }

    var visibleDates: [Date] {
        let calendar = configuredCalendar
        return (-6...7).compactMap { calendar.date(byAdding: .day, value: $0, to: selectedDate) }
    }

    var weekDates: [Date] {
        let calendar = configuredCalendar
        let start = calendar.dateInterval(of: .weekOfYear, for: selectedDate)?.start ?? selectedDate
        return (0..<7).compactMap { calendar.date(byAdding: .day, value: $0, to: start) }
    }

    var configuredCalendar: Calendar {
        var calendar = Calendar(identifier: .gregorian)
        calendar.locale = settings.language.locale
        calendar.firstWeekday = settings.weekStart == .saturday ? 7 : 1
        return calendar
    }

    func select(date: Date) {
        withAnimation(.spring(response: 0.34, dampingFraction: 0.86)) {
            selectedDate = date
        }
    }

    func moveSelectedDate(by dayOffset: Int) {
        guard let nextDate = configuredCalendar.date(byAdding: .day, value: dayOffset, to: selectedDate) else { return }
        select(date: nextDate)
    }

    func events(for date: Date) -> [CalendarEvent] {
        let calendar = configuredCalendar
        return events
            .filter { calendar.isDate($0.startsAt, inSameDayAs: date) }
            .sorted { $0.startsAt < $1.startsAt }
    }

    func agendaSections() -> [AgendaSection] {
        let calendar = configuredCalendar
        let anchors = [0, 1, 2, 3, 4, 5]
        return anchors.compactMap { offset in
            guard let day = calendar.date(byAdding: .day, value: offset, to: selectedDate) else { return nil }
            let dayEvents = events(for: day)
            guard !dayEvents.isEmpty else { return nil }
            let title: String
            switch offset {
            case 0: title = text(ar: "اليوم", en: "Today")
            case 1: title = text(ar: "غدًا", en: "Tomorrow")
            default: title = DateFormatting.dayName(for: day, language: settings.language, short: false)
            }
            return AgendaSection(title: title, date: day, events: dayEvents)
        }
    }

    func unifiedAgendaSections() -> [UnifiedAgendaSection] {
        let calendar = configuredCalendar
        let anchors = [0, 1, 2, 3, 4, 5]

        return anchors.compactMap { offset in
            guard let day = calendar.date(byAdding: .day, value: offset, to: selectedDate) else { return nil }
            let dayEvents = events(for: day).map { AgendaEntry.event($0) }
            let dueTasks = tasks
                .filter { task in
                    guard let dueDate = task.dueDate else { return false }
                    return calendar.isDate(dueDate, inSameDayAs: day)
                }
                .sorted { ($0.dueDate ?? .distantFuture) < ($1.dueDate ?? .distantFuture) }
                .map { AgendaEntry.task($0) }

            let overdueTasks: [AgendaEntry]
            if offset == 0 {
                overdueTasks = tasks
                    .filter { task in
                        guard let dueDate = task.dueDate else { return false }
                        return dueDate < calendar.startOfDay(for: selectedDate) && !task.completed
                    }
                    .sorted { ($0.dueDate ?? .distantFuture) < ($1.dueDate ?? .distantFuture) }
                    .map { AgendaEntry.task($0) }
            } else {
                overdueTasks = []
            }

            let entries = dayEvents + overdueTasks + dueTasks
            guard !entries.isEmpty else { return nil }

            let title: String
            switch offset {
            case 0: title = text(ar: "اليوم", en: "Today")
            case 1: title = text(ar: "غدًا", en: "Tomorrow")
            default: title = DateFormatting.dayName(for: day, language: settings.language, short: false)
            }

            return UnifiedAgendaSection(title: title, date: day, entries: entries)
        }
    }

    func tasksForCurrentFilter() -> [NahrTask] {
        let calendar = configuredCalendar
        let filtered: [NahrTask]
        switch taskFilter {
        case .today:
            filtered = tasks.filter {
                guard let dueDate = $0.dueDate else { return false }
                return calendar.isDate(dueDate, inSameDayAs: selectedDate) || (!($0.completed) && dueDate < selectedDate)
            }
        case .scheduled:
            filtered = tasks.filter { $0.dueDate != nil }
        case .all:
            filtered = tasks
        }
        return filtered.sorted {
            ($0.dueDate ?? .distantFuture) < ($1.dueDate ?? .distantFuture)
        }
    }

    func toggleTask(_ task: NahrTask) {
        guard let index = tasks.firstIndex(where: { $0.id == task.id }) else { return }
        tasks[index].completed.toggle()
    }

    func addEvent(from naturalInput: String) {
        let parsed = NaturalLanguageParser.parse(naturalInput, relativeTo: selectedDate)
        let newEvent = CalendarEvent(
            title: parsed.title,
            startsAt: parsed.startDate,
            endsAt: parsed.endDate,
            location: parsed.location,
            notes: parsed.naturalInput,
            calendarName: text(ar: "الشخصي", en: "Personal"),
            accent: .mint,
            participants: parsed.invitees.map { EventParticipant(name: $0, initials: String($0.prefix(2)).uppercased()) },
            meetingURL: URL(string: "https://meet.example.com/nahr"),
            weatherSummary: text(ar: "طقس معتدل", en: "Clear skies"),
            travelMinutes: parsed.location == nil ? nil : 18
        )
        events.append(newEvent)
        events.sort { $0.startsAt < $1.startsAt }
        selectedDate = parsed.startDate
    }

    func search(query: String) -> (events: [CalendarEvent], tasks: [NahrTask], locations: [String]) {
        guard !query.isEmpty else {
            return (
                Array(events.sorted { $0.startsAt < $1.startsAt }.prefix(4)),
                Array(tasks.prefix(4)),
                Array(Set(events.compactMap(\.location))).sorted()
            )
        }

        let lowered = query.lowercased()
        let matchedEvents = events.filter {
            $0.title.lowercased().contains(lowered) || ($0.location?.lowercased().contains(lowered) ?? false)
        }
        let matchedTasks = tasks.filter { $0.title.lowercased().contains(lowered) }
        let matchedLocations = Array(Set(events.compactMap(\.location).filter { $0.lowercased().contains(lowered) })).sorted()
        return (matchedEvents, matchedTasks, matchedLocations)
    }

    var searchSuggestions: [String] {
        [
            text(ar: "اجتماعات هذا الأسبوع", en: "Meetings this week"),
            text(ar: "الرحلات", en: "Flights"),
            text(ar: "أعياد الميلاد", en: "Birthdays"),
            text(ar: "مهام اليوم", en: "Today's tasks")
        ]
    }

    private func seed() {
        let calendar = Calendar.current
        let today = calendar.startOfDay(for: Date())

        func date(_ dayOffset: Int, _ hour: Int, _ minute: Int = 0, durationMinutes: Int) -> (Date, Date) {
            let day = calendar.date(byAdding: .day, value: dayOffset, to: today) ?? today
            let start = calendar.date(bySettingHour: hour, minute: minute, second: 0, of: day) ?? day
            let end = calendar.date(byAdding: .minute, value: durationMinutes, to: start) ?? start.addingTimeInterval(Double(durationMinutes) * 60)
            return (start, end)
        }

        let designReview = date(0, 9, 30, durationMinutes: 60)
        let prayerBreak = date(0, 12, 10, durationMinutes: 20)
        let productSync = date(0, 15, 0, durationMinutes: 45)
        let familyDinner = date(1, 20, 0, durationMinutes: 90)
        let flightCheck = date(2, 8, 0, durationMinutes: 30)
        let fridayPlan = date(5, 18, 0, durationMinutes: 120)

        events = [
            CalendarEvent(
                title: text(ar: "مراجعة تصميم نهر", en: "Nahr design review"),
                startsAt: designReview.0,
                endsAt: designReview.1,
                location: text(ar: "مكتب الفريق", en: "Studio"),
                notes: text(ar: "مراجعة وضع اليوم، نسخة الـ RTL، وواجهة الـ Liquid Glass.", en: "Review day view, RTL polish, and glass motion."),
                calendarName: text(ar: "العمل", en: "Work"),
                accent: .azure,
                participants: [EventParticipant(name: "Ahmed", initials: "AH"), EventParticipant(name: "Lina", initials: "LI")],
                meetingURL: URL(string: "https://meet.example.com/review"),
                weatherSummary: text(ar: "26° ومشمس", en: "26° and sunny"),
                travelMinutes: 12
            ),
            CalendarEvent(
                title: text(ar: "تنبيه صلاة الظهر", en: "Dhuhr reminder"),
                startsAt: prayerBreak.0,
                endsAt: prayerBreak.1,
                location: text(ar: "المسجد القريب", en: "Nearby mosque"),
                notes: text(ar: "تنبيه هادئ داخل الجدول اليومي.", en: "A subtle prayer reminder within the daily flow."),
                calendarName: text(ar: "روحاني", en: "Spiritual"),
                accent: .mint,
                participants: [],
                isAllDay: false,
                meetingURL: nil,
                weatherSummary: nil,
                travelMinutes: 5
            ),
            CalendarEvent(
                title: text(ar: "مزامنة المنتج", en: "Product sync"),
                startsAt: productSync.0,
                endsAt: productSync.1,
                location: text(ar: "Zoom", en: "Zoom"),
                notes: text(ar: "مراجعة الإطلاق الأول، الويدجت، ونموذج الدفع الواحد.", en: "Review launch plan, widgets, and one-time purchase packaging."),
                calendarName: text(ar: "العمل", en: "Work"),
                accent: .violet,
                participants: [EventParticipant(name: "Sara", initials: "SA"), EventParticipant(name: "Musaab", initials: "MU")],
                meetingURL: URL(string: "https://zoom.us/j/123456789"),
                weatherSummary: nil,
                travelMinutes: nil
            ),
            CalendarEvent(
                title: text(ar: "عشاء العائلة", en: "Family dinner"),
                startsAt: familyDinner.0,
                endsAt: familyDinner.1,
                location: text(ar: "الرياض بارك", en: "Riyadh Park"),
                notes: text(ar: "حجز مسبق ومواقف سهلة.", en: "Reservation confirmed and easy parking."),
                calendarName: text(ar: "العائلة", en: "Family"),
                accent: .sunset,
                participants: [EventParticipant(name: "Omar", initials: "OM")],
                weatherSummary: text(ar: "هواء لطيف مساءً", en: "Mild evening breeze"),
                travelMinutes: 22
            ),
            CalendarEvent(
                title: text(ar: "متابعة رحلة دبي", en: "Dubai flight check-in"),
                startsAt: flightCheck.0,
                endsAt: flightCheck.1,
                location: text(ar: "المطار", en: "Airport app"),
                notes: text(ar: "تأكيد المقاعد والحقائب.", en: "Confirm seats and baggage."),
                calendarName: text(ar: "السفر", en: "Travel"),
                accent: .azure,
                weatherSummary: text(ar: "رحلة صباحية", en: "Morning departure"),
                travelMinutes: nil
            ),
            CalendarEvent(
                title: text(ar: "خطة الجمعة", en: "Friday planning block"),
                startsAt: fridayPlan.0,
                endsAt: fridayPlan.1,
                location: text(ar: "المنزل", en: "Home office"),
                notes: text(ar: "توزيع مهام الأسبوع القادم وتنظيف التقويم.", en: "Prepare next week and clear calendar clutter."),
                calendarName: text(ar: "شخصي", en: "Personal"),
                accent: .mint,
                weatherSummary: text(ar: "ليلة هادئة", en: "Quiet evening")
            )
        ]

        tasks = [
            NahrTask(title: text(ar: "إرسال مستندات الإطلاق", en: "Send launch assets"), dueDate: designReview.0, priority: .high),
            NahrTask(title: text(ar: "تأكيد ألوان التقويم", en: "Confirm calendar colors"), dueDate: productSync.0, priority: .medium),
            NahrTask(title: text(ar: "إكمال تصميم الويدجت", en: "Finish widget layout"), dueDate: familyDinner.0, priority: .high),
            NahrTask(title: text(ar: "تحديث قائمة الكلمات المفتاحية", en: "Refresh App Store keywords"), dueDate: nil, priority: .low),
            NahrTask(title: text(ar: "مراجعة تجربة البحث", en: "Review search experience"), dueDate: flightCheck.0, priority: .medium, completed: true)
        ]
    }
}
