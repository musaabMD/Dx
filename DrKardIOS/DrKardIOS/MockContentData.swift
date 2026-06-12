// MockContentData.swift
// Seeded mock questions & HY summaries tied to PreparedExam blueprint.

import Foundation

enum MockContentData {

    static func blueprint(for exam: PreparedExam) -> [BlueprintSubjectWeight] {
        let total = Double(exam.totalQuestions)
        guard total > 0 else { return [] }
        return exam.subjects.map { s in
            BlueprintSubjectWeight(
                id: s.id,
                name: s.name,
                questionCount: s.questionCount,
                weightFraction: Double(s.questionCount) / total
            )
        }
    }

    static let mockQuestions: [MockQuestion] = [
        MockQuestion(
            id: "q1",
            stem: "A structure fire is spreading vertically through concealed spaces. What is the first tactical priority?",
            choices: [
                "Ventilate the roof immediately",
                "Locate and confine the fire path in void spaces",
                "Deploy exterior master streams",
                "Withdraw all crews and surround and drown"
            ],
            correctIndex: 1,
            subjectId: "building_materials",
            explanation: "Confining path in voids limits vertical extension before committing to aggressive roof work."
        ),
        MockQuestion(
            id: "q2",
            stem: "Which tool is most appropriate for forced entry on a steel security door on a commercial occupancy?",
            choices: ["Axe only", "Hydraulic spreader / rabbit tool", "Halligan with adze", "Chainsaw"],
            correctIndex: 1,
            subjectId: "entry_search_rescue",
            explanation: "Hydraulic tools are often required for hardened commercial doors."
        ),
        MockQuestion(
            id: "q3",
            stem: "A SCBA low-air alarm activates. What is the correct action?",
            choices: [
                "Signal partner and begin exit",
                "Silence alarm and continue briefly",
                "Share air with partner without leaving",
                "Remove mask to conserve air"
            ],
            correctIndex: 0,
            subjectId: "equipment",
            explanation: "Immediate exit with partner is the standard response to low air."
        ),
        MockQuestion(
            id: "q4",
            stem: "A 1¾\" hose line is advanced for interior attack on a residential room-and-contents fire. What flow pattern is most appropriate for cooling overhead?",
            choices: ["Straight stream", "Broken stream", "Fog / wide pattern", "Foam only"],
            correctIndex: 2,
            subjectId: "fire_hose_suppression",
            explanation: "Wide fog pattern cools gases and reduces heat flux overhead."
        ),
        MockQuestion(
            id: "q5",
            stem: "What is the primary purpose of a tactical worksheet on the command board?",
            choices: [
                "Billing for overtime",
                "Tracking PAR, benchmarks, and resource assignments",
                "Public information release",
                "Equipment maintenance logs"
            ],
            correctIndex: 1,
            subjectId: "fire_safety_overview",
            explanation: "Command accountability and tracking benchmarks."
        ),
        MockQuestion(
            id: "q6",
            stem: "A patient has a suspected spinal injury with compromised airway. What is the priority?",
            choices: [
                "Spinal motion restriction first, airway second",
                "Airway management with spinal precautions",
                "Rapid transport without assessment",
                "Splint all injuries before airway"
            ],
            correctIndex: 1,
            subjectId: "scene_response_first_aid",
            explanation: "Airway wins, with spinal precautions maintained."
        ),
        MockQuestion(
            id: "q7",
            stem: "A smoldering fire in deep-seated cellulose insulation is best characterized as:",
            choices: ["A fast-flaming fire", "A Class A deep-seated fire", "A Class C fire", "A Class K fire"],
            correctIndex: 1,
            subjectId: "types_of_fires",
            explanation: "Deep-seated Class A requires overhaul and probing."
        ),
        MockQuestion(
            id: "q8",
            stem: "Horizontal ventilation should be coordinated with:",
            choices: [
                "Media on scene",
                "Interior attack and suppression",
                "Hydrant testing only",
                "After full extinguishment only"
            ],
            correctIndex: 1,
            subjectId: "entry_search_rescue",
            explanation: "Coordinated vent prevents fire growth."
        )
    ]

    /// One-line HY summaries keyed by question id (front of card before revealing MCQ).
    private static let hySummaries: [String: String] = [
        "q1": "Vertical fire in voids — confine path before aggressive roof vent.",
        "q2": "Steel security door — hydraulic spreader beats axe-only entry.",
        "q3": "SCBA low air — signal partner and exit; never silence and stay.",
        "q4": "Interior attack cooling overhead — wide fog beats straight stream.",
        "q5": "Command board worksheet — PAR, benchmarks, resource tracking.",
        "q6": "Airway vs spine — open airway first with spinal precautions.",
        "q7": "Deep smolder in insulation — Class A deep-seated, needs overhaul.",
        "q8": "Horizontal vent timing — coordinate with interior suppression."
    ]

    /// Optional SF Symbols for card fronts (not every card needs art).
    private static let hyCardImages: [String: String] = [
        "q1": "flame.fill",
        "q2": "door.left.hand.open",
        "q3": "wind",
        "q4": "drop.fill",
        "q5": "list.clipboard.fill",
        "q6": "cross.case.fill",
        "q7": "leaf.fill",
        "q8": "arrow.left.arrow.right"
    ]

    static func makeFlashcards(from questions: [MockQuestion]) -> [HYFlashcard] {
        questions.map { q in
            HYFlashcard(
                id: "hy_\(q.id)",
                questionId: q.id,
                subjectId: q.subjectId,
                summary: hySummaries[q.id] ?? String(q.stem.prefix(120)),
                isBookmarked: false,
                imageSystemName: hyCardImages[q.id]
            )
        }
    }

    static func sampleAttempts(for exam: PreparedExam) -> [MockAttemptRecord] {
        let subjects = exam.subjects
        let ids = subjects.map(\.id)
        func perf(_ i: Int, spread: Int) -> [String: Int] {
            Dictionary(uniqueKeysWithValues: ids.enumerated().map { idx, id in
                (id, max(40, min(100, 72 + spread * (idx % 3 - 1) + i * 2)))
            })
        }
        return [
            MockAttemptRecord(
                id: UUID(),
                date: Date().addingTimeInterval(-86400 * 14),
                durationSeconds: 118 * 60,
                scorePercent: 68,
                correct: 54,
                total: 80,
                subjectPerformance: perf(0, spread: 4)
            ),
            MockAttemptRecord(
                id: UUID(),
                date: Date().addingTimeInterval(-86400 * 7),
                durationSeconds: 112 * 60,
                scorePercent: 74,
                correct: 59,
                total: 80,
                subjectPerformance: perf(1, spread: 3)
            ),
            MockAttemptRecord(
                id: UUID(),
                date: Date().addingTimeInterval(-86400 * 2),
                durationSeconds: 105 * 60,
                scorePercent: 81,
                correct: 65,
                total: 80,
                subjectPerformance: perf(2, spread: 2)
            )
        ]
    }
}
