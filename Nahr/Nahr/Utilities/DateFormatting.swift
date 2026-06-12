import Foundation

struct DateFormatting {
    static func dualDate(for date: Date, language: AppLanguage, preference: CalendarSystemPreference) -> String {
        switch preference {
        case .gregorian:
            return format(date, calendar: .gregorian, locale: language.locale, template: "EEE d MMM")
        case .hijri:
            return format(date, calendarIdentifier: .islamicUmmAlQura, locale: language.locale, template: "EEE d MMM")
        case .dual:
            let gregorian = format(date, calendar: .gregorian, locale: language.locale, template: "EEE d MMM")
            let hijri = format(date, calendarIdentifier: .islamicUmmAlQura, locale: language.locale, template: "d MMM")
            return "\(gregorian) • \(hijri)"
        }
    }

    static func monthTitle(for date: Date, language: AppLanguage) -> String {
        format(date, calendar: .gregorian, locale: language.locale, template: "MMMM yyyy")
    }

    static func dayName(for date: Date, language: AppLanguage, short: Bool = true) -> String {
        let template = short ? "EEE" : "EEEE"
        return format(date, calendar: .gregorian, locale: language.locale, template: template)
    }

    static func time(for date: Date, language: AppLanguage) -> String {
        let formatter = DateFormatter()
        formatter.locale = language.locale
        formatter.timeStyle = .short
        formatter.dateStyle = .none
        return formatter.string(from: date)
    }

    static func timeRange(start: Date, end: Date, language: AppLanguage) -> String {
        "\(time(for: start, language: language)) – \(time(for: end, language: language))"
    }

    static func weekdaySymbols(language: AppLanguage, weekStart: WeekStart) -> [String] {
        let formatter = DateFormatter()
        formatter.locale = language.locale
        var symbols = formatter.shortStandaloneWeekdaySymbols ?? formatter.shortWeekdaySymbols ?? []
        guard symbols.count == 7 else { return symbols }
        if weekStart == .saturday {
            symbols = [symbols[6]] + symbols[0...5]
        }
        return symbols
    }

    private static func format(_ date: Date, calendar: Calendar.Identifier, locale: Locale, template: String) -> String {
        format(date, calendarIdentifier: calendar, locale: locale, template: template)
    }

    private static func format(_ date: Date, calendarIdentifier: Calendar.Identifier, locale: Locale, template: String) -> String {
        let formatter = DateFormatter()
        formatter.locale = locale
        formatter.calendar = Calendar(identifier: calendarIdentifier)
        formatter.setLocalizedDateFormatFromTemplate(template)
        return formatter.string(from: date)
    }
}
