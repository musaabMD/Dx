import Foundation
import Combine

final class CreateCourseViewModel: ObservableObject {
    enum Step: Int, CaseIterable, Identifiable {
        case topic = 1
        case audienceAndStyle = 2
        case exerciseTypes = 3
        case confirm = 4

        var id: Int { rawValue }

        var title: String {
            switch self {
            case .topic: "Topic"
            case .audienceAndStyle: "Audience & Style"
            case .exerciseTypes: "Exercise Types"
            case .confirm: "Confirm"
            }
        }
    }

    @Published var step: Step = .topic

    @Published var topic: String = ""
    @Published var audience: CourseAudience = .me
    @Published var style: CourseStyle = .duolingo
    @Published var exerciseTypes: Set<RequestedExerciseType> = [.mcq, .flashcard]

    @Published var isGenerating: Bool = false

    var canContinueFromTopic: Bool {
        topic.trimmingCharacters(in: .whitespacesAndNewlines).count > 3
    }

    var canGenerate: Bool {
        canContinueFromTopic && !exerciseTypes.isEmpty
    }

    func reset() {
        step = .topic
        topic = ""
        audience = .me
        style = .duolingo
        exerciseTypes = [.mcq, .flashcard]
        isGenerating = false
    }

    func toggleExerciseType(_ type: RequestedExerciseType) {
        if exerciseTypes.contains(type) {
            exerciseTypes.remove(type)
        } else {
            exerciseTypes.insert(type)
        }
    }
}
