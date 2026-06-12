import Foundation

struct CourseDetail: Identifiable, Equatable {
    var id: UUID
    var summary: CourseSummary
    var lessons: [LessonDetail]
}

struct LessonDetail: Identifiable, Equatable {
    var id: UUID
    var title: String
    var content: String
    var keyPoints: [String]
    var exercises: [CourseExercise]
}

enum CourseExerciseType: String, Equatable {
    case mcq
    case flashcard
    case fillIn
    case speaking
    case image
    case mixed
}

struct CourseExercise: Identifiable, Equatable {
    var id: UUID
    var type: CourseExerciseType
    var question: String
    var options: [String]
    var correctIndex: Int?
    var answer: String
    var explanation: String
}
