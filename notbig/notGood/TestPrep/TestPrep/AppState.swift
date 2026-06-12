//
//  AppState.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import Foundation
import SwiftUI

@MainActor
@Observable
class AppState {
    // User state
    var currentUser: User?
    var isAuthenticated: Bool = false
    
    // Navigation
    var selectedExam: Exam?
    var showPaywall: Bool = false
    
    // Data
    var availableExams: [Exam] = []
    var allQuestions: [Question] = []
    var mockExams: [MockExam] = []
    var mockResults: [MockExamResult] = []
    var leaderboard: [LeaderboardEntry] = []
    var bookmarkedQuestionIDs: Set<UUID> = []
    var examTargetDates: [UUID: Date] = [:]
    
    // Current session
    var currentSession: StudySession?
    
    init() {
        loadMockData()
    }

    func saveMockResult(_ result: MockExamResult) {
        mockResults.append(result)
        mockResults.sort { $0.date > $1.date }
    }
    
    // MARK: - User Management
    
    func signUp(name: String, email: String) {
        currentUser = User(
            id: UUID(),
            name: name,
            email: email,
            isPremium: false,
            dailyQuestionsUsed: 0,
            lastResetDate: Date(),
            currentStreak: 0,
            longestStreak: 0,
            lastStudyDate: nil,
            totalPoints: 0,
            favoriteExams: []
        )
        isAuthenticated = true
    }

    func signOut() {
        currentUser = nil
        isAuthenticated = false
        selectedExam = nil
        currentSession = nil
        bookmarkedQuestionIDs.removeAll()
    }
    
    func upgradeToPremium() {
        currentUser?.isPremium = true
    }
    
    func toggleFavoriteExam(_ examID: UUID) {
        guard var user = currentUser else { return }
        if let index = user.favoriteExams.firstIndex(of: examID) {
            user.favoriteExams.remove(at: index)
        } else {
            user.favoriteExams.append(examID)
        }
        currentUser = user
    }
    
    func isFavorite(_ examID: UUID) -> Bool {
        currentUser?.favoriteExams.contains(examID) ?? false
    }

    func toggleQuestionBookmark(_ questionID: UUID) {
        if bookmarkedQuestionIDs.contains(questionID) {
            bookmarkedQuestionIDs.remove(questionID)
        } else {
            bookmarkedQuestionIDs.insert(questionID)
        }
    }

    func isQuestionBookmarked(_ questionID: UUID) -> Bool {
        bookmarkedQuestionIDs.contains(questionID)
    }

    func examDate(for examID: UUID?) -> Date? {
        guard let examID else { return nil }
        return examTargetDates[examID]
    }

    func setExamDate(_ date: Date?, for examID: UUID?) {
        guard let examID else { return }
        if let date {
            examTargetDates[examID] = date
        } else {
            examTargetDates.removeValue(forKey: examID)
        }
    }
    
    // MARK: - Study Session Management
    
    func startStudySession(mode: StudyMode, examID: UUID, questions: [Question]) {
        currentSession = StudySession(mode: mode, questions: questions, examID: examID)
    }
    
    func submitAnswer(questionID: UUID, selectedIndex: Int, timeSpent: TimeInterval) {
        guard var session = currentSession else { return }
        guard let question = session.questions.first(where: { $0.id == questionID }) else { return }
        
        let isCorrect = selectedIndex == question.correctAnswerIndex
        let record = AnswerRecord(
            questionID: questionID,
            selectedAnswerIndex: selectedIndex,
            isCorrect: isCorrect,
            timeSpent: timeSpent,
            isFlagged: false,
            timestamp: Date()
        )
        
        session.answers[questionID] = record
        
        if isCorrect {
            currentUser?.totalPoints += 10
        }
        
        // Update daily usage for free users
        if currentUser?.isPremium == false {
            currentUser?.dailyQuestionsUsed += 1
        }
        
        currentSession = session
    }
    
    func toggleFlag(questionID: UUID) {
        guard var session = currentSession else { return }
        if var record = session.answers[questionID] {
            record.isFlagged.toggle()
            session.answers[questionID] = record
            currentSession = session
        }
    }
    
    func completeSession() {
        guard var session = currentSession else { return }
        session.endTime = Date()
        currentUser?.updateStreak()
        currentSession = nil
    }
    
    // MARK: - Questions Filtering
    
    func getQuestions(for filter: ReviewFilter) -> [(Question, AnswerRecord)] {
        guard let session = currentSession else { return [] }
        
        return session.questions.compactMap { question in
            guard let answer = session.answers[question.id] else {
                return filter == .all ? (question, AnswerRecord(
                    questionID: question.id,
                    selectedAnswerIndex: -1,
                    isCorrect: false,
                    timeSpent: 0,
                    isFlagged: false,
                    timestamp: Date()
                )) : nil
            }
            
            switch filter {
            case .all:
                return (question, answer)
            case .correct:
                return answer.isCorrect ? (question, answer) : nil
            case .incorrect:
                return !answer.isCorrect ? (question, answer) : nil
            case .flagged:
                return answer.isFlagged ? (question, answer) : nil
            }
        }
    }
    
    // MARK: - Mock Data
    
    private func loadMockData() {
        // Create sample exams
        let medicalExam = Exam(
            name: "USMLE Step 1",
            description: "United States Medical Licensing Examination - Step 1",
            icon: "cross.case.fill",
            subjects: [
                Subject(name: "Anatomy", topics: [
                    Topic(name: "Cardiovascular System"),
                    Topic(name: "Respiratory System"),
                    Topic(name: "Nervous System")
                ], questionCount: 150),
                Subject(name: "Physiology", topics: [
                    Topic(name: "Cell Biology"),
                    Topic(name: "Biochemistry")
                ], questionCount: 120),
                Subject(name: "Pharmacology", topics: [
                    Topic(name: "Drug Mechanisms"),
                    Topic(name: "Side Effects")
                ], questionCount: 100)
            ],
            totalQuestions: 370,
            category: "Medical"
        )
        
        let engineeringExam = Exam(
            name: "FE Exam",
            description: "Fundamentals of Engineering Examination",
            icon: "gearshape.fill",
            subjects: [
                Subject(name: "Mathematics", questionCount: 80),
                Subject(name: "Statics", questionCount: 60),
                Subject(name: "Dynamics", questionCount: 50)
            ],
            totalQuestions: 190,
            category: "Engineering"
        )
        
        let itExam = Exam(
            name: "AWS Solutions Architect",
            description: "Amazon Web Services Solutions Architect Certification",
            icon: "cloud.fill",
            subjects: [
                Subject(name: "Design Resilient Architectures", questionCount: 120),
                Subject(name: "Security", questionCount: 100),
                Subject(name: "Cost Optimization", questionCount: 80)
            ],
            totalQuestions: 300,
            category: "IT"
        )
        
        let businessExam = Exam(
            name: "CPA Exam",
            description: "Certified Public Accountant",
            icon: "chart.line.uptrend.xyaxis",
            subjects: [
                Subject(name: "Auditing", questionCount: 150),
                Subject(name: "Financial Accounting", questionCount: 180),
                Subject(name: "Taxation", questionCount: 140)
            ],
            totalQuestions: 470,
            category: "Business"
        )
        
        availableExams = [medicalExam, engineeringExam, itExam, businessExam]
        
        // Create sample questions for first exam
        let sampleQuestions = [
            Question(
                id: UUID(),
                text: "What is the primary function of the left ventricle?",
                options: [
                    "Pump oxygenated blood to the body",
                    "Pump deoxygenated blood to the lungs",
                    "Receive blood from the lungs",
                    "Store blood for later use"
                ],
                correctAnswerIndex: 0,
                explanation: "The left ventricle pumps oxygenated blood from the lungs to the rest of the body through the aorta. It has the thickest muscular wall because it needs to generate enough pressure to circulate blood throughout the entire body.",
                tags: ["cardiovascular", "anatomy", "heart"],
                difficulty: .medium,
                subjectID: medicalExam.subjects[0].id,
                topicID: medicalExam.subjects[0].topics[0].id,
                oneLineSummary: "Left ventricle pumps oxygenated blood to body via aorta"
            ),
            Question(
                id: UUID(),
                text: "Which enzyme is responsible for the conversion of angiotensin I to angiotensin II?",
                options: [
                    "Renin",
                    "Angiotensin-converting enzyme (ACE)",
                    "Aldosterone",
                    "Vasopressin"
                ],
                correctAnswerIndex: 1,
                explanation: "ACE (Angiotensin-Converting Enzyme) converts angiotensin I to angiotensin II in the lungs. This is a crucial step in the renin-angiotensin-aldosterone system (RAAS) that regulates blood pressure and fluid balance.",
                tags: ["physiology", "cardiovascular", "enzymes"],
                difficulty: .hard,
                subjectID: medicalExam.subjects[1].id,
                topicID: medicalExam.subjects[1].topics[0].id,
                oneLineSummary: "ACE converts angiotensin I to II in RAAS system"
            ),
            Question(
                id: UUID(),
                text: "What is the mechanism of action of beta-blockers?",
                options: [
                    "Inhibit sodium channels",
                    "Block beta-adrenergic receptors",
                    "Enhance calcium influx",
                    "Increase sympathetic activity"
                ],
                correctAnswerIndex: 1,
                explanation: "Beta-blockers work by blocking beta-adrenergic receptors, which reduces heart rate, blood pressure, and cardiac output. They're commonly used to treat hypertension, angina, and heart failure.",
                tags: ["pharmacology", "cardiovascular", "medications"],
                difficulty: .easy,
                subjectID: medicalExam.subjects[2].id,
                topicID: medicalExam.subjects[2].topics[0].id,
                oneLineSummary: "Beta-blockers block β-receptors, reducing HR and BP"
            )
        ]
        
        allQuestions = sampleQuestions
        
        // Create leaderboard
        leaderboard = [
            LeaderboardEntry(userID: UUID(), userName: "Sarah Chen", totalPoints: 2450, currentStreak: 15, rank: 1),
            LeaderboardEntry(userID: UUID(), userName: "Michael Johnson", totalPoints: 2180, currentStreak: 12, rank: 2),
            LeaderboardEntry(userID: UUID(), userName: "Emily Davis", totalPoints: 1920, currentStreak: 8, rank: 3),
            LeaderboardEntry(userID: UUID(), userName: "David Kim", totalPoints: 1750, currentStreak: 20, rank: 4),
            LeaderboardEntry(userID: UUID(), userName: "Jessica Martinez", totalPoints: 1640, currentStreak: 5, rank: 5)
        ]
    }
}
