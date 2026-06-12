// ExamCatalog.swift
// DrKardIOS
// Dummy catalog data for exam prep content.

import SwiftUI

/// One row in the subject breakdown table (name + question count).
struct ExamSubjectRow: Identifiable, Hashable, Codable {
    let id: String
    let name: String
    let questionCount: Int
}

/// Marketing / feature bullets for an exam product.
struct PreparedExam: Identifiable, Hashable, Codable {
    let id: String
    let titlePrimary: String
    let titleSecondary: String
    let totalQuestions: Int
    let subjectCount: Int
    let subjects: [ExamSubjectRow]
    /// Shown after the subject table (e.g. “1000 Questions with Explanations”).
    let coreHighlights: [String]
    /// Short labels for quiz modes (Timed, Missed, Weakest Subject).
    let quizModes: [String]
    /// Extra perks (EMS bundle, pass guarantee, mock exam copy).
    let bundledPerks: [String]
}

extension PreparedExam {
    /// Placeholder Firefighter I & II prep — counts sum to 1000 across 7 subjects.
    static let firefighterIAndIIExamPrep = PreparedExam(
        id: "firefighter_i_ii_exam_prep",
        titlePrimary: "Firefighter I & II",
        titleSecondary: "Exam Prep",
        totalQuestions: 1000,
        subjectCount: 7,
        subjects: [
            ExamSubjectRow(id: "building_materials", name: "Building Materials and Structure", questionCount: 68),
            ExamSubjectRow(id: "entry_search_rescue", name: "Entry, Search and Rescue, Ventilation", questionCount: 115),
            ExamSubjectRow(id: "equipment", name: "Equipment", questionCount: 170),
            ExamSubjectRow(id: "fire_hose_suppression", name: "Fire Hose and Suppression", questionCount: 106),
            ExamSubjectRow(id: "fire_safety_overview", name: "Fire Safety Overview, Communications, Dynamics", questionCount: 161),
            ExamSubjectRow(id: "scene_response_first_aid", name: "Scene Response, First Aid, Risk Reduction", questionCount: 249),
            ExamSubjectRow(id: "types_of_fires", name: "Types of Fires, Scene Operations, Origin and Cause", questionCount: 131),
        ],
        coreHighlights: [
            "1000 Questions with Explanations",
            "Performance by Subject",
            "Mobile & Web Access",
        ],
        quizModes: [
            "Timed Quiz",
            "Missed Questions Quiz",
            "Weakest Subject Quiz",
        ],
        bundledPerks: [
            "Access to 9 EMS Exams",
            "Pass Guarantee",
            "Mock Exam — unlimited forms",
        ],
    )

    static let catalog: [PreparedExam] = [.firefighterIAndIIExamPrep]
}

// MARK: - Exam detail (SwiftUI)

struct ExamDetailView: View {
    let exam: PreparedExam

    var body: some View {
        List {
            Section {
                VStack(alignment: .leading, spacing: 4) {
                    Text(exam.titlePrimary)
                        .font(.title2.weight(.bold))
                    Text(exam.titleSecondary)
                        .font(.title3)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .listRowInsets(EdgeInsets(top: 12, leading: 16, bottom: 12, trailing: 16))
            }

            Section("Question Bank Details") {
                LabeledContent("Questions", value: "\(exam.totalQuestions)")
                LabeledContent("Subjects", value: "\(exam.subjectCount)")
            }

            Section("Subject breakdown") {
                ForEach(exam.subjects) { row in
                    LabeledContent(row.name) {
                        Text("\(row.questionCount)")
                            .monospacedDigit()
                            .foregroundStyle(.secondary)
                    }
                }
            }

            Section("What's included") {
                ForEach(exam.coreHighlights, id: \.self) { line in
                    Label(line, systemImage: "checkmark.circle.fill")
                        .symbolRenderingMode(.palette)
                        .foregroundStyle(.green, .primary)
                }
                ForEach(exam.bundledPerks, id: \.self) { line in
                    Label(line, systemImage: "star.fill")
                        .foregroundStyle(.orange)
                }
            }

            Section("Quiz modes") {
                ForEach(exam.quizModes, id: \.self) { mode in
                    Label(mode, systemImage: "timer")
                }
            }
        }
        .navigationTitle("Exam details")
        .navigationBarTitleDisplayMode(.inline)
    }
}

#Preview("Exam detail") {
    NavigationStack {
        ExamDetailView(exam: .firefighterIAndIIExamPrep)
    }
}
