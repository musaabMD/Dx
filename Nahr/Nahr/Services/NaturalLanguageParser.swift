import Foundation

struct NaturalLanguageParser {
    static func parse(_ input: String, relativeTo referenceDate: Date = .now) -> QuickAddParseResult {
        let trimmedInput = input.trimmingCharacters(in: .whitespacesAndNewlines)
        let normalized = normalizeDigits(trimmedInput.lowercased())
        let calendar = Calendar.current
        var baseDate = calendar.startOfDay(for: referenceDate)
        var detectedDateText: String?
        var detectedTimeText: String?
        var hour = 9
        var minute = 0

        if normalized.contains("day after tomorrow") || normalized.contains("بعد غد") {
            baseDate = calendar.date(byAdding: .day, value: 2, to: baseDate) ?? baseDate
            detectedDateText = normalized.contains("بعد غد") ? "بعد غد" : "day after tomorrow"
        } else if normalized.contains("tomorrow") || normalized.contains("غد") {
            baseDate = calendar.date(byAdding: .day, value: 1, to: baseDate) ?? baseDate
            detectedDateText = normalized.contains("غد") ? "غدًا" : "tomorrow"
        } else if normalized.contains("today") || normalized.contains("اليوم") {
            detectedDateText = normalized.contains("اليوم") ? "اليوم" : "today"
        }

        if normalized.contains("evening") || normalized.contains("مساء") {
            hour = 19
            detectedTimeText = normalized.contains("مساء") ? "مساء" : "evening"
        } else if normalized.contains("morning") || normalized.contains("صباح") {
            hour = 9
            detectedTimeText = normalized.contains("صباح") ? "صباح" : "morning"
        }

        if let regexTime = match(in: normalized, pattern: "(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)") {
            hour = Int(regexTime[1]) ?? hour
            minute = Int(regexTime[2]) ?? 0
            if regexTime[3] == "pm", hour < 12 { hour += 12 }
            if regexTime[3] == "am", hour == 12 { hour = 0 }
            detectedTimeText = regexTime[0]
        } else if let arabicTime = match(in: normalized, pattern: "الساعة\\s*(\\d{1,2})(?::(\\d{2}))?") {
            hour = Int(arabicTime[1]) ?? hour
            minute = Int(arabicTime[2]) ?? 0
            detectedTimeText = arabicTime[0]
        } else if let looseTime = match(in: normalized, pattern: "\\b(\\d{1,2})(?::(\\d{2}))\\b") {
            hour = Int(looseTime[1]) ?? hour
            minute = Int(looseTime[2]) ?? 0
            detectedTimeText = looseTime[0]
        }

        if normalized.contains("مساء") && hour < 12 { hour += 12 }
        if normalized.contains("صباح") && hour == 12 { hour = 0 }

        let startDate = calendar.date(bySettingHour: hour, minute: minute, second: 0, of: baseDate) ?? referenceDate
        let endDate = calendar.date(byAdding: .minute, value: 60, to: startDate) ?? startDate.addingTimeInterval(3600)

        let location = extractLocation(from: normalized)
        let invitees = extractInvitees(from: trimmedInput)
        let cleanedTitle = cleanTitle(from: trimmedInput, normalized: normalized, location: location)
        let finalTitle = cleanedTitle.isEmpty ? (trimmedInput.isEmpty ? "New Event" : trimmedInput) : cleanedTitle

        return QuickAddParseResult(
            title: finalTitle,
            startDate: startDate,
            endDate: endDate,
            location: location,
            invitees: invitees,
            detectedDateText: detectedDateText,
            detectedTimeText: detectedTimeText,
            naturalInput: trimmedInput
        )
    }

    private static func extractLocation(from normalized: String) -> String? {
        if let arabicLocation = match(in: normalized, pattern: "(?:في|بـ)\\s+([\\p{L}0-9\\s-]{2,}?)(?=\\s+(?:مع|@|$))") {
            return arabicLocation[1].trimmingCharacters(in: .whitespacesAndNewlines)
        }
        if let englishLocation = match(in: normalized, pattern: "\\bat\\s+([a-z0-9 .-]{2,}?)(?=\\s+(?:with|@|$))") {
            return englishLocation[1].trimmingCharacters(in: .whitespacesAndNewlines)
        }
        if let looseEnglishLocation = match(in: normalized, pattern: "(?:am|pm)\\s+([a-z][a-z0-9 .-]{1,}?)(?=\\s+(?:with|@|$))") {
            return looseEnglishLocation[1].trimmingCharacters(in: .whitespacesAndNewlines)
        }
        return nil
    }

    private static func extractInvitees(from input: String) -> [String] {
        let taggedMatches = matchAll(in: input, pattern: "@([A-Za-z0-9._-]+)")
        let englishMatches = matchAll(in: input, pattern: "(?i)\\bwith\\s+([A-Za-z][A-Za-z .'-]{1,})")
        let arabicMatches = matchAll(in: input, pattern: "مع\\s+([\\p{L}][\\p{L}\\s]{1,})")

        let names = taggedMatches.compactMap { $0.count > 1 ? $0[1] : nil }
            + englishMatches.compactMap { $0.count > 1 ? $0[1].trimmingCharacters(in: .whitespacesAndNewlines) : nil }
            + arabicMatches.compactMap { $0.count > 1 ? $0[1].trimmingCharacters(in: .whitespacesAndNewlines) : nil }

        return Array(NSOrderedSet(array: names)) as? [String] ?? names
    }

    private static func cleanTitle(from original: String, normalized: String, location: String?) -> String {
        var working = normalizeDigits(original)
        let tokens = [
            "tomorrow", "today", "day after tomorrow", "evening", "morning",
            "غدًا", "غدا", "غد", "اليوم", "بعد غد", "مساء", "صباح"
        ]

        for token in tokens {
            working = working.replacingOccurrences(of: token, with: "", options: [.caseInsensitive, .diacriticInsensitive])
        }

        let patterns = ["(\\d{1,2})(?::(\\d{2}))?\\s*(am|pm)", "الساعة\\s*(\\d{1,2})(?::(\\d{2}))?", "\\b(\\d{1,2})(?::(\\d{2}))\\b"]
        for pattern in patterns {
            working = replacing(pattern: pattern, in: working)
        }

        if let location {
            working = working.replacingOccurrences(of: location, with: "", options: [.caseInsensitive, .diacriticInsensitive])
        }
        working = working.replacingOccurrences(of: "at", with: "", options: .caseInsensitive)
        working = working.replacingOccurrences(of: "في", with: "")
        working = working.replacingOccurrences(of: "with", with: "", options: .caseInsensitive)
        working = working.replacingOccurrences(of: "مع", with: "")
        working = replacing(pattern: "@[A-Za-z0-9._-]+", in: working)
        working = replacing(pattern: "(?i)with\\s+[A-Za-z][A-Za-z .'-]{1,}", in: working)
        working = replacing(pattern: "مع\\s+[\\p{L}][\\p{L}\\s]{1,}", in: working)

        return working
            .replacingOccurrences(of: "  ", with: " ")
            .trimmingCharacters(in: CharacterSet.whitespacesAndNewlines.union(.punctuationCharacters))
    }

    private static func normalizeDigits(_ input: String) -> String {
        let arabicDigits = ["٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9"]
        return arabicDigits.reduce(input) { partial, pair in
            partial.replacingOccurrences(of: pair.key, with: pair.value)
        }
    }

    private static func replacing(pattern: String, in input: String) -> String {
        guard let regex = try? NSRegularExpression(pattern: pattern, options: [.caseInsensitive]) else { return input }
        let range = NSRange(input.startIndex..., in: input)
        return regex.stringByReplacingMatches(in: input, options: [], range: range, withTemplate: "")
    }

    private static func match(in input: String, pattern: String) -> [String]? {
        guard let regex = try? NSRegularExpression(pattern: pattern, options: [.caseInsensitive]) else { return nil }
        let range = NSRange(input.startIndex..., in: input)
        guard let result = regex.firstMatch(in: input, options: [], range: range) else { return nil }
        return (0..<result.numberOfRanges).compactMap { index in
            let current = result.range(at: index)
            guard let stringRange = Range(current, in: input) else { return nil }
            return String(input[stringRange])
        }
    }

    private static func matchAll(in input: String, pattern: String) -> [[String]] {
        guard let regex = try? NSRegularExpression(pattern: pattern, options: []) else { return [] }
        let range = NSRange(input.startIndex..., in: input)
        return regex.matches(in: input, options: [], range: range).map { result in
            (0..<result.numberOfRanges).compactMap { index in
                let current = result.range(at: index)
                guard let stringRange = Range(current, in: input) else { return nil }
                return String(input[stringRange])
            }
        }
    }
}
