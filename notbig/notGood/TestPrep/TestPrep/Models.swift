//
//  Models.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import Foundation

// MARK: - User & Subscription Models

struct User: Codable, Identifiable {
    let id: UUID
    var name: String
    var email: String
    var isPremium: Bool
    var dailyQuestionsUsed: Int
    var lastResetDate: Date
    var currentStreak: Int
    var longestStreak: Int
    var lastStudyDate: Date?
    var totalPoints: Int
    var favoriteExams: [UUID]
    
    var canAccessQuestion: Bool {
        if isPremium { return true }
        return dailyQuestionsUsed < 30
    }
    
    mutating func resetDailyQuestions() {
        let calendar = Calendar.current
        if !calendar.isDateInToday(lastResetDate) {
            dailyQuestionsUsed = 0
            lastResetDate = Date()
        }
    }
    
    mutating func updateStreak() {
        let calendar = Calendar.current
        if let lastDate = lastStudyDate {
            let daysBetween = calendar.dateComponents([.day], from: lastDate, to: Date()).day ?? 0
            if daysBetween == 1 {
                currentStreak += 1
            } else if daysBetween > 1 {
                currentStreak = 1
            }
        } else {
            currentStreak = 1
        }
        lastStudyDate = Date()
        
        // Update longest streak if current streak exceeds it
        if currentStreak > longestStreak {
            longestStreak = currentStreak
        }
    }
}

// MARK: - Exam Models

struct Exam: Identifiable, Codable, Hashable {
    let id: UUID
    var name: String
    var description: String
    var icon: String
    var subjects: [Subject]
    var totalQuestions: Int
    var category: String
    
    init(id: UUID = UUID(), name: String, description: String, icon: String, subjects: [Subject] = [], totalQuestions: Int = 0, category: String) {
        self.id = id
        self.name = name
        self.description = description
        self.icon = icon
        self.subjects = subjects
        self.totalQuestions = totalQuestions
        self.category = category
    }
}

struct Subject: Identifiable, Codable, Hashable {
    let id: UUID
    var name: String
    var topics: [Topic]
    var questionCount: Int
    
    init(id: UUID = UUID(), name: String, topics: [Topic] = [], questionCount: Int = 0) {
        self.id = id
        self.name = name
        self.topics = topics
        self.questionCount = questionCount
    }
}

struct Topic: Identifiable, Codable, Hashable {
    let id: UUID
    var name: String
    var questionIDs: [UUID]
    
    init(id: UUID = UUID(), name: String, questionIDs: [UUID] = []) {
        self.id = id
        self.name = name
        self.questionIDs = questionIDs
    }
}

// MARK: - Question Models

struct Question: Identifiable, Codable {
    let id: UUID
    var text: String
    var options: [String]
    var correctAnswerIndex: Int
    var explanation: String
    var tags: [String]
    var difficulty: Difficulty
    var subjectID: UUID
    var topicID: UUID
    var oneLineSummary: String
    
    enum Difficulty: String, Codable, CaseIterable {
        case easy = "Easy"
        case medium = "Medium"
        case hard = "Hard"
    }
}

// MARK: - Study Session Models

enum StudyMode {
    case study
    case exam
    case lastMinReview
}

struct StudySession: Identifiable {
    let id: UUID
    var mode: StudyMode
    var questions: [Question]
    var currentIndex: Int
    var answers: [UUID: AnswerRecord]
    var startTime: Date
    var endTime: Date?
    var examID: UUID
    
    var progress: Double {
        guard !questions.isEmpty else { return 0 }
        return Double(answers.count) / Double(questions.count)
    }
    
    var score: Int {
        let correct = answers.values.filter { $0.isCorrect }.count
        return correct
    }
    
    init(id: UUID = UUID(), mode: StudyMode, questions: [Question], examID: UUID) {
        self.id = id
        self.mode = mode
        self.questions = questions
        self.currentIndex = 0
        self.answers = [:]
        self.startTime = Date()
        self.examID = examID
    }
}

struct AnswerRecord: Codable {
    let questionID: UUID
    let selectedAnswerIndex: Int
    let isCorrect: Bool
    let timeSpent: TimeInterval
    var isFlagged: Bool
    let timestamp: Date
}

// MARK: - Mock Exam Models

struct MockExam: Identifiable, Codable {
    let id: UUID
    var examID: UUID
    var name: String
    var duration: TimeInterval // in seconds
    var questionCount: Int
    var passingScore: Int
    var questions: [UUID] // question IDs
    
    init(id: UUID = UUID(), examID: UUID, name: String, duration: TimeInterval, questionCount: Int, passingScore: Int, questions: [UUID] = []) {
        self.id = id
        self.examID = examID
        self.name = name
        self.duration = duration
        self.questionCount = questionCount
        self.passingScore = passingScore
        self.questions = questions
    }
}

struct MockExamResult: Identifiable, Codable {
    let id: UUID
    var mockExamID: UUID
    var userID: UUID
    var score: Int
    var totalQuestions: Int
    var timeSpent: TimeInterval
    var date: Date
    var passed: Bool
    var answers: [UUID: AnswerRecord]
    
    var percentage: Double {
        guard totalQuestions > 0 else { return 0 }
        return Double(score) / Double(totalQuestions) * 100
    }
}

// MARK: - Review Filter

enum ReviewFilter {
    case all
    case correct
    case incorrect
    case flagged
}

// MARK: - Leaderboard Models

struct LeaderboardEntry: Identifiable, Codable {
    let id: UUID
    var userID: UUID
    var userName: String
    var totalPoints: Int
    var currentStreak: Int
    var rank: Int
    
    init(id: UUID = UUID(), userID: UUID, userName: String, totalPoints: Int, currentStreak: Int, rank: Int = 0) {
        self.id = id
        self.userID = userID
        self.userName = userName
        self.totalPoints = totalPoints
        self.currentStreak = currentStreak
        self.rank = rank
    }
}
