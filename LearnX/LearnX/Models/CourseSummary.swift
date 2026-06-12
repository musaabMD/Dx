import Foundation

struct CourseSummary: Identifiable, Equatable, Hashable, Codable {
    var id: UUID
    var title: String
    var emoji: String
    var style: CourseStyle
    var audience: CourseAudience
    var isPublic: Bool
    var estimatedMinutes: Int
    var progress: Double
    var averageScore: Int?
    var views: Int?
}

enum CourseStyle: String, CaseIterable, Identifiable, Codable, Equatable {
    case duolingo
    case lecture
    case bootcamp
    case custom

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .duolingo: "Duolingo"
        case .lecture: "Lecture"
        case .bootcamp: "Bootcamp"
        case .custom: "Custom"
        }
    }
}

enum CourseAudience: String, CaseIterable, Identifiable, Codable, Equatable {
    case me
    case students
    case kids
    case team

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .me: "Myself"
        case .students: "Students"
        case .kids: "My Kids"
        case .team: "My Team"
        }
    }
}

enum RequestedExerciseType: String, CaseIterable, Identifiable, Codable, Equatable {
    case mcq
    case fillIn
    case speaking
    case image
    case flashcard
    case mixed

    var id: String { rawValue }

    var displayName: String {
        switch self {
        case .mcq: "Multiple Choice"
        case .fillIn: "Fill in the Blank"
        case .speaking: "Speaking"
        case .image: "Image-Based"
        case .flashcard: "Flashcards"
        case .mixed: "Mixed"
        }
    }
}
