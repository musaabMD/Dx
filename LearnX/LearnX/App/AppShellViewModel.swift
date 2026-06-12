import Foundation
import Combine

final class AppShellViewModel: ObservableObject {
    enum Tab: Hashable {
        case library
        case create
        case stats
        case profile
    }

    @Published var selectedTab: Tab = .library
    @Published var previousTab: Tab = .library
    @Published var isCreateCoursePresented: Bool = false

    @Published var profile: UserProfile
    @Published var courses: [CourseSummary]
    @Published private(set) var courseDetails: [UUID: CourseDetail] = [:]

    init(
        profile: UserProfile = .mock,
        courses: [CourseSummary] = []
    ) {
        self.profile = profile
        self.courses = courses
    }

    func selectTab(_ tab: Tab) {
        if tab == .create {
            isCreateCoursePresented = true
            selectedTab = previousTab
        } else {
            previousTab = tab
            selectedTab = tab
        }
    }

    func presentCreateCourse() {
        isCreateCoursePresented = true
    }

    func seedStarterLibraryIfNeeded() {
        guard courses.isEmpty else { return }
        let seeded = MockSeeds.courses.map { summary in
            SampleCourseFactory.makeCourse(from: summary, requestedTypes: [.mcq, .flashcard])
        }

        courseDetails = Dictionary(uniqueKeysWithValues: seeded.map { ($0.id, $0) })
        courses = seeded.map(\.summary).sorted { $0.title.localizedCaseInsensitiveCompare($1.title) == .orderedAscending }
    }

    func addGeneratedCourse(from draft: CreateCourseViewModel) {
        let detail = SampleCourseFactory.makeCourse(
            topic: draft.topic,
            audience: draft.audience,
            style: draft.style,
            requestedTypes: draft.exerciseTypes
        )
        addCourseDetail(detail)
    }

    func courseDetail(id: UUID) -> CourseDetail? {
        courseDetails[id]
    }

    func addCourseDetail(_ detail: CourseDetail) {
        courseDetails[detail.id] = detail
        courses.insert(detail.summary, at: 0)
        profile.totalXP += 50
    }
}

struct UserProfile: Equatable {
    var name: String
    var email: String
    var creditsRemaining: Int
    var streakDays: Int
    var totalXP: Int

    static let mock = UserProfile(
        name: "Alex Rivera",
        email: "alex@example.com",
        creditsRemaining: 100,
        streakDays: 7,
        totalXP: 420
    )
}

enum MockSeeds {
    static let courses: [CourseSummary] = [
        CourseSummary(
            id: UUID(uuidString: "00000000-0000-0000-0000-000000000001")!,
            title: "Spanish in 30 Days",
            emoji: "🇪🇸",
            style: .duolingo,
            audience: .me,
            isPublic: true,
            estimatedMinutes: 30,
            progress: 0.8,
            averageScore: 84,
            views: 1284
        ),
        CourseSummary(
            id: UUID(uuidString: "00000000-0000-0000-0000-000000000002")!,
            title: "History of Rome",
            emoji: "🏛️",
            style: .lecture,
            audience: .students,
            isPublic: false,
            estimatedMinutes: 45,
            progress: 0.33,
            averageScore: nil,
            views: nil
        ),
    ]
}
