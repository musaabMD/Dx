import CloudKit
import Foundation

enum DrKardCloudSchema {
    nonisolated static let containerIdentifier = "iCloud.hyperteam.DrKardIOS"

    enum RecordType {
        nonisolated static let exam = "Exam"
        nonisolated static let subject = "ExamSubject"
        nonisolated static let question = "ExamQuestion"
        nonisolated static let attempt = "UserAttempt"
    }

    enum Field {
        nonisolated static let id = "id"
        nonisolated static let examID = "examID"
        nonisolated static let subjectID = "subjectID"
        nonisolated static let titlePrimary = "titlePrimary"
        nonisolated static let titleSecondary = "titleSecondary"
        nonisolated static let totalQuestions = "totalQuestions"
        nonisolated static let subjectCount = "subjectCount"
        nonisolated static let coreHighlights = "coreHighlights"
        nonisolated static let quizModes = "quizModes"
        nonisolated static let bundledPerks = "bundledPerks"
        nonisolated static let name = "name"
        nonisolated static let questionCount = "questionCount"
        nonisolated static let sortOrder = "sortOrder"
        nonisolated static let stem = "stem"
        nonisolated static let choices = "choices"
        nonisolated static let correctIndex = "correctIndex"
        nonisolated static let explanation = "explanation"
        nonisolated static let date = "date"
        nonisolated static let durationSeconds = "durationSeconds"
        nonisolated static let scorePercent = "scorePercent"
        nonisolated static let correct = "correct"
        nonisolated static let total = "total"
        nonisolated static let subjectPerformanceJSON = "subjectPerformanceJSON"
        nonisolated static let gradedStatesJSON = "gradedStatesJSON"
    }
}

struct ExamContentBundle: Codable, Equatable {
    var exam: PreparedExam
    var questions: [MockQuestion]
    var attempts: [MockAttemptRecord]
}

enum CloudKitExamError: LocalizedError {
    case iCloudUnavailable
    case noExamContent

    var errorDescription: String? {
        switch self {
        case .iCloudUnavailable:
            "iCloud is not available on this device. Sign in to iCloud and enable iCloud Drive."
        case .noExamContent:
            "No CloudKit exam content exists yet."
        }
    }
}

actor CloudKitExamService {
    private let container: CKContainer
    private let publicDatabase: CKDatabase
    private let privateDatabase: CKDatabase

    init(containerIdentifier: String = DrKardCloudSchema.containerIdentifier) {
        container = CKContainer(identifier: containerIdentifier)
        publicDatabase = container.publicCloudDatabase
        privateDatabase = container.privateCloudDatabase
    }

    func accountStatus() async throws -> CKAccountStatus {
        try await container.accountStatus()
    }

    func fetchContentBundle() async throws -> ExamContentBundle {
        guard try await accountStatus() == .available else {
            throw CloudKitExamError.iCloudUnavailable
        }

        let exams = try await fetchExams()
        guard let baseExam = exams.first else {
            throw CloudKitExamError.noExamContent
        }

        let subjects = try await fetchSubjects(examID: baseExam.id)
        let exam = PreparedExam(
            id: baseExam.id,
            titlePrimary: baseExam.titlePrimary,
            titleSecondary: baseExam.titleSecondary,
            totalQuestions: baseExam.totalQuestions,
            subjectCount: baseExam.subjectCount,
            subjects: subjects,
            coreHighlights: baseExam.coreHighlights,
            quizModes: baseExam.quizModes,
            bundledPerks: baseExam.bundledPerks
        )
        let questions = try await fetchQuestions(examID: exam.id)
        let attempts = try await fetchAttempts(examID: exam.id)
        return ExamContentBundle(exam: exam, questions: questions, attempts: attempts)
    }

    func seedIfEmpty(with bundle: ExamContentBundle) async throws {
        let existing = try await fetchExams()
        guard existing.isEmpty else { return }

        try await saveExam(bundle.exam)
        for question in bundle.questions {
            try await saveQuestion(question, examID: bundle.exam.id)
        }
    }

    func saveAttempt(_ attempt: MockAttemptRecord, examID: String, states: [GradedQuestionState]) async throws {
        guard try await accountStatus() == .available else {
            throw CloudKitExamError.iCloudUnavailable
        }

        let recordName = "attempt_\(attempt.id.uuidString)"
        let record = CKRecord(recordType: DrKardCloudSchema.RecordType.attempt, recordID: CKRecord.ID(recordName: recordName))
        record[DrKardCloudSchema.Field.examID] = examID as CKRecordValue
        record[DrKardCloudSchema.Field.date] = attempt.date as CKRecordValue
        record[DrKardCloudSchema.Field.durationSeconds] = attempt.durationSeconds as CKRecordValue
        record[DrKardCloudSchema.Field.scorePercent] = attempt.scorePercent as CKRecordValue
        record[DrKardCloudSchema.Field.correct] = attempt.correct as CKRecordValue
        record[DrKardCloudSchema.Field.total] = attempt.total as CKRecordValue
        record[DrKardCloudSchema.Field.subjectPerformanceJSON] = jsonString(attempt.subjectPerformance) as CKRecordValue
        record[DrKardCloudSchema.Field.gradedStatesJSON] = jsonString(states) as CKRecordValue

        _ = try await privateDatabase.save(record)
    }

    private func fetchExams() async throws -> [PreparedExam] {
        let query = CKQuery(recordType: DrKardCloudSchema.RecordType.exam, predicate: NSPredicate(value: true))
        query.sortDescriptors = [NSSortDescriptor(key: DrKardCloudSchema.Field.titlePrimary, ascending: true)]
        let records = try await records(matching: query, in: publicDatabase)
        return records.compactMap(Self.makeExam)
    }

    private func fetchQuestions(examID: String) async throws -> [MockQuestion] {
        let query = CKQuery(
            recordType: DrKardCloudSchema.RecordType.question,
            predicate: NSPredicate(format: "%K == %@", DrKardCloudSchema.Field.examID, examID)
        )
        query.sortDescriptors = [NSSortDescriptor(key: DrKardCloudSchema.Field.sortOrder, ascending: true)]
        let records = try await records(matching: query, in: publicDatabase)
        return records.compactMap(Self.makeQuestion)
    }

    private func fetchSubjects(examID: String) async throws -> [ExamSubjectRow] {
        let query = CKQuery(
            recordType: DrKardCloudSchema.RecordType.subject,
            predicate: NSPredicate(format: "%K == %@", DrKardCloudSchema.Field.examID, examID)
        )
        query.sortDescriptors = [NSSortDescriptor(key: DrKardCloudSchema.Field.sortOrder, ascending: true)]
        let records = try await records(matching: query, in: publicDatabase)
        return records.compactMap(Self.makeSubject)
    }

    private func fetchAttempts(examID: String) async throws -> [MockAttemptRecord] {
        let query = CKQuery(
            recordType: DrKardCloudSchema.RecordType.attempt,
            predicate: NSPredicate(format: "%K == %@", DrKardCloudSchema.Field.examID, examID)
        )
        query.sortDescriptors = [NSSortDescriptor(key: DrKardCloudSchema.Field.date, ascending: false)]
        let records = try await records(matching: query, in: privateDatabase)
        return records.compactMap(Self.makeAttempt)
    }

    private func saveExam(_ exam: PreparedExam) async throws {
        let record = CKRecord(recordType: DrKardCloudSchema.RecordType.exam, recordID: CKRecord.ID(recordName: exam.id))
        record[DrKardCloudSchema.Field.id] = exam.id as CKRecordValue
        record[DrKardCloudSchema.Field.titlePrimary] = exam.titlePrimary as CKRecordValue
        record[DrKardCloudSchema.Field.titleSecondary] = exam.titleSecondary as CKRecordValue
        record[DrKardCloudSchema.Field.totalQuestions] = exam.totalQuestions as CKRecordValue
        record[DrKardCloudSchema.Field.subjectCount] = exam.subjectCount as CKRecordValue
        record[DrKardCloudSchema.Field.coreHighlights] = exam.coreHighlights as CKRecordValue
        record[DrKardCloudSchema.Field.quizModes] = exam.quizModes as CKRecordValue
        record[DrKardCloudSchema.Field.bundledPerks] = exam.bundledPerks as CKRecordValue
        _ = try await publicDatabase.save(record)

        for (index, subject) in exam.subjects.enumerated() {
            let subjectRecord = CKRecord(recordType: DrKardCloudSchema.RecordType.subject, recordID: CKRecord.ID(recordName: "\(exam.id)_\(subject.id)"))
            subjectRecord[DrKardCloudSchema.Field.id] = subject.id as CKRecordValue
            subjectRecord[DrKardCloudSchema.Field.examID] = exam.id as CKRecordValue
            subjectRecord[DrKardCloudSchema.Field.name] = subject.name as CKRecordValue
            subjectRecord[DrKardCloudSchema.Field.questionCount] = subject.questionCount as CKRecordValue
            subjectRecord[DrKardCloudSchema.Field.sortOrder] = index as CKRecordValue
            _ = try await publicDatabase.save(subjectRecord)
        }
    }

    private func saveQuestion(_ question: MockQuestion, examID: String) async throws {
        let record = CKRecord(recordType: DrKardCloudSchema.RecordType.question, recordID: CKRecord.ID(recordName: question.id))
        record[DrKardCloudSchema.Field.id] = question.id as CKRecordValue
        record[DrKardCloudSchema.Field.examID] = examID as CKRecordValue
        record[DrKardCloudSchema.Field.subjectID] = question.subjectId as CKRecordValue
        record[DrKardCloudSchema.Field.stem] = question.stem as CKRecordValue
        record[DrKardCloudSchema.Field.choices] = question.choices as CKRecordValue
        record[DrKardCloudSchema.Field.correctIndex] = question.correctIndex as CKRecordValue
        record[DrKardCloudSchema.Field.explanation] = question.explanation as CKRecordValue
        record[DrKardCloudSchema.Field.sortOrder] = numericQuestionOrder(question.id) as CKRecordValue
        _ = try await publicDatabase.save(record)
    }

    private func records(matching query: CKQuery, in database: CKDatabase) async throws -> [CKRecord] {
        let response = try await database.records(matching: query, resultsLimit: CKQueryOperation.maximumResults)
        return response.matchResults.compactMap { _, result in try? result.get() }
    }

    private static func makeExam(from record: CKRecord) -> PreparedExam? {
        guard let id = record[DrKardCloudSchema.Field.id] as? String,
              let titlePrimary = record[DrKardCloudSchema.Field.titlePrimary] as? String,
              let titleSecondary = record[DrKardCloudSchema.Field.titleSecondary] as? String,
              let totalQuestions = record[DrKardCloudSchema.Field.totalQuestions] as? Int,
              let subjectCount = record[DrKardCloudSchema.Field.subjectCount] as? Int else {
            return nil
        }

        return PreparedExam(
            id: id,
            titlePrimary: titlePrimary,
            titleSecondary: titleSecondary,
            totalQuestions: totalQuestions,
            subjectCount: subjectCount,
            subjects: [],
            coreHighlights: record[DrKardCloudSchema.Field.coreHighlights] as? [String] ?? [],
            quizModes: record[DrKardCloudSchema.Field.quizModes] as? [String] ?? [],
            bundledPerks: record[DrKardCloudSchema.Field.bundledPerks] as? [String] ?? []
        )
    }

    private static func makeQuestion(from record: CKRecord) -> MockQuestion? {
        guard let id = record[DrKardCloudSchema.Field.id] as? String,
              let stem = record[DrKardCloudSchema.Field.stem] as? String,
              let choices = record[DrKardCloudSchema.Field.choices] as? [String],
              let correctIndex = record[DrKardCloudSchema.Field.correctIndex] as? Int,
              let subjectID = record[DrKardCloudSchema.Field.subjectID] as? String,
              let explanation = record[DrKardCloudSchema.Field.explanation] as? String else {
            return nil
        }

        return MockQuestion(
            id: id,
            stem: stem,
            choices: choices,
            correctIndex: correctIndex,
            subjectId: subjectID,
            explanation: explanation
        )
    }

    private static func makeSubject(from record: CKRecord) -> ExamSubjectRow? {
        guard let id = record[DrKardCloudSchema.Field.id] as? String,
              let name = record[DrKardCloudSchema.Field.name] as? String,
              let questionCount = record[DrKardCloudSchema.Field.questionCount] as? Int else {
            return nil
        }

        return ExamSubjectRow(id: id, name: name, questionCount: questionCount)
    }

    private static func makeAttempt(from record: CKRecord) -> MockAttemptRecord? {
        guard let date = record[DrKardCloudSchema.Field.date] as? Date,
              let durationSeconds = record[DrKardCloudSchema.Field.durationSeconds] as? Int,
              let scorePercent = record[DrKardCloudSchema.Field.scorePercent] as? Int,
              let correct = record[DrKardCloudSchema.Field.correct] as? Int,
              let total = record[DrKardCloudSchema.Field.total] as? Int else {
            return nil
        }

        let subjectPerformance = decodeJSON(
            record[DrKardCloudSchema.Field.subjectPerformanceJSON] as? String,
            as: [String: Int].self
        ) ?? [:]

        return MockAttemptRecord(
            id: UUID(uuidString: record.recordID.recordName.replacingOccurrences(of: "attempt_", with: "")) ?? UUID(),
            date: date,
            durationSeconds: durationSeconds,
            scorePercent: scorePercent,
            correct: correct,
            total: total,
            subjectPerformance: subjectPerformance
        )
    }

    private func jsonString<T: Encodable>(_ value: T) -> String {
        guard let data = try? JSONEncoder().encode(value) else { return "{}" }
        return String(decoding: data, as: UTF8.self)
    }

    private static func decodeJSON<T: Decodable>(_ string: String?, as type: T.Type) -> T? {
        guard let string, let data = string.data(using: .utf8) else { return nil }
        return try? JSONDecoder().decode(type, from: data)
    }

    private func numericQuestionOrder(_ id: String) -> Int {
        Int(id.filter(\.isNumber)) ?? 0
    }
}
