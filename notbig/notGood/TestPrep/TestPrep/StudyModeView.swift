//
//  StudyModeView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI

struct StudyModeView: View {
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    @State private var currentQuestionIndex = 0
    @State private var selectedAnswer: Int?
    @State private var showExplanation = false
    @State private var showReview = false
    @State private var questionStartTime = Date()
    @State private var questionPool: [Question] = []
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color(.systemGroupedBackground)
                    .ignoresSafeArea()
                
                if questionPool.isEmpty {
                    VStack(spacing: 20) {
                        Image(systemName: "questionmark.circle.fill")
                            .font(.system(size: 60))
                            .foregroundStyle(.secondary)
                        
                        Text("No questions available")
                            .font(.headline)
                            .foregroundStyle(.secondary)
                        
                        Button("Go Back") {
                            dismiss()
                        }
                        .buttonStyle(.borderedProminent)
                    }
                } else {
                    VStack(spacing: 0) {
                        // Progress bar
                        ProgressBarView(current: currentQuestionIndex + 1, total: questionPool.count)
                        
                        ScrollView {
                            VStack(spacing: 24) {
                                let question = questionPool[currentQuestionIndex]
                                
                                // Question card
                                VStack(alignment: .leading, spacing: 16) {
                                    HStack {
                                        Text("Question \(currentQuestionIndex + 1)")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                        
                                        Spacer()
                                        
                                        DifficultyBadge(difficulty: question.difficulty)
                                    }
                                    
                                    Text(question.text)
                                        .font(.title3)
                                        .fixedSize(horizontal: false, vertical: true)
                                    
                                    // Tags
                                    ScrollView(.horizontal, showsIndicators: false) {
                                        HStack(spacing: 8) {
                                            ForEach(question.tags, id: \.self) { tag in
                                                Text(tag)
                                                    .font(.caption)
                                                    .padding(.horizontal, 10)
                                                    .padding(.vertical, 5)
                                                    .background(Color.blue.opacity(0.15))
                                                    .clipShape(Capsule())
                                            }
                                        }
                                    }
                                }
                                .padding()
                                .background(Color(.secondarySystemGroupedBackground))
                                .clipShape(RoundedRectangle(cornerRadius: 16))
                                .glassEffect(.regular, in: .rect(cornerRadius: 16))
                                .padding(.horizontal)
                                .padding(.top)
                                
                                // Options
                                VStack(spacing: 12) {
                                    ForEach(question.options.indices, id: \.self) { index in
                                        OptionButton(
                                            text: question.options[index],
                                            index: index,
                                            isSelected: selectedAnswer == index,
                                            isCorrect: showExplanation ? index == question.correctAnswerIndex : nil,
                                            isWrong: showExplanation && selectedAnswer == index && index != question.correctAnswerIndex
                                        ) {
                                            if !showExplanation {
                                                selectedAnswer = index
                                            }
                                        }
                                    }
                                }
                                .padding(.horizontal)
                                
                                // Explanation
                                if showExplanation {
                                    VStack(alignment: .leading, spacing: 16) {
                                        HStack {
                                            Image(systemName: selectedAnswer == question.correctAnswerIndex ? "checkmark.circle.fill" : "xmark.circle.fill")
                                                .font(.title2)
                                                .foregroundStyle(selectedAnswer == question.correctAnswerIndex ? .green : .red)
                                            
                                            Text(selectedAnswer == question.correctAnswerIndex ? "Correct!" : "Incorrect")
                                                .font(.title3.bold())
                                        }
                                        
                                        Divider()
                                        
                                        Text("Explanation")
                                            .font(.headline)
                                        
                                        Text(question.explanation)
                                            .font(.body)
                                        
                                        // Ask AI button
                                        Button {
                                            // TODO: Integrate with AI
                                        } label: {
                                            HStack {
                                                Image(systemName: "sparkles")
                                                Text("Ask AI to Learn More")
                                            }
                                            .font(.subheadline.bold())
                                            .foregroundStyle(.white)
                                            .frame(maxWidth: .infinity)
                                            .padding()
                                            .background(
                                                LinearGradient(colors: [.purple, .blue], startPoint: .leading, endPoint: .trailing)
                                            )
                                            .clipShape(RoundedRectangle(cornerRadius: 12))
                                        }
                                    }
                                    .padding()
                                    .background(Color(.secondarySystemGroupedBackground))
                                    .clipShape(RoundedRectangle(cornerRadius: 16))
                                    .glassEffect(.regular, in: .rect(cornerRadius: 16))
                                    .padding(.horizontal)
                                }
                                
                                // Action buttons
                                HStack(spacing: 16) {
                                    if showExplanation {
                                        if currentQuestionIndex < questionPool.count - 1 {
                                            Button {
                                                nextQuestion()
                                            } label: {
                                                HStack {
                                                    Text("Next Question")
                                                    Image(systemName: "arrow.right")
                                                }
                                                .frame(maxWidth: .infinity)
                                                .padding()
                                                .background(Color.blue)
                                                .foregroundStyle(.white)
                                                .clipShape(RoundedRectangle(cornerRadius: 12))
                                            }
                                        } else {
                                            Button {
                                                showReview = true
                                            } label: {
                                                Text("Review Session")
                                                    .frame(maxWidth: .infinity)
                                                    .padding()
                                                    .background(Color.green)
                                                    .foregroundStyle(.white)
                                                    .clipShape(RoundedRectangle(cornerRadius: 12))
                                            }
                                        }
                                    } else {
                                        Button {
                                            if let selected = selectedAnswer {
                                                submitAnswer(selected)
                                            }
                                        } label: {
                                            Text("Submit Answer")
                                                .frame(maxWidth: .infinity)
                                                .padding()
                                                .background(selectedAnswer == nil ? Color.gray : Color.blue)
                                                .foregroundStyle(.white)
                                                .clipShape(RoundedRectangle(cornerRadius: 12))
                                        }
                                        .disabled(selectedAnswer == nil)
                                    }
                                }
                                .padding(.horizontal)
                                .padding(.bottom, 30)
                            }
                        }
                        .contentShape(Rectangle())
                        .gesture(
                            DragGesture(minimumDistance: 22)
                                .onEnded { value in
                                    handleQuestionSwipe(value.translation)
                                }
                        )
                    }
                }
            }
            .navigationTitle("Study Mode")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button {
                        dismiss()
                    } label: {
                        Image(systemName: "xmark.circle.fill")
                            .foregroundStyle(.secondary)
                    }
                }
            }
            .sheet(isPresented: $showReview) {
                ReviewView()
            }
        }
        .onAppear {
            initializeSession()
        }
    }
    
    func initializeSession() {
        guard !appState.allQuestions.isEmpty else { return }

        if questionPool.isEmpty {
            questionPool = makeLoopedQuestions(from: appState.allQuestions)
        }

        if appState.currentSession == nil || appState.currentSession?.questions.count != questionPool.count {
            appState.startStudySession(
                mode: .study,
                examID: appState.selectedExam?.id ?? UUID(),
                questions: questionPool
            )
        }
        questionStartTime = Date()
    }
    
    func submitAnswer(_ answerIndex: Int) {
        let timeSpent = Date().timeIntervalSince(questionStartTime)
        let question = questionPool[currentQuestionIndex]
        appState.submitAnswer(questionID: question.id, selectedIndex: answerIndex, timeSpent: timeSpent)
        
        withAnimation {
            showExplanation = true
        }
    }
    
    func nextQuestion() {
        withAnimation {
            guard currentQuestionIndex < questionPool.count - 1 else { return }
            currentQuestionIndex += 1
            selectedAnswer = nil
            showExplanation = false
            questionStartTime = Date()
        }
    }

    private func previousQuestion() {
        withAnimation {
            guard currentQuestionIndex > 0 else { return }
            currentQuestionIndex -= 1
            selectedAnswer = nil
            showExplanation = false
            questionStartTime = Date()
        }
    }

    private func handleQuestionSwipe(_ translation: CGSize) {
        let horizontal = translation.width
        let vertical = translation.height
        let threshold: CGFloat = 45
        guard max(abs(horizontal), abs(vertical)) >= threshold else { return }

        if abs(horizontal) > abs(vertical) {
            horizontal < 0 ? nextQuestion() : previousQuestion()
        } else {
            vertical < 0 ? nextQuestion() : previousQuestion()
        }
    }

    private func makeLoopedQuestions(from base: [Question]) -> [Question] {
        guard !base.isEmpty else { return [] }
        let repeatCount = 20
        var expanded: [Question] = []
        expanded.reserveCapacity(base.count * repeatCount)

        for _ in 0..<repeatCount {
            for item in base {
                expanded.append(
                    Question(
                        id: UUID(),
                        text: item.text,
                        options: item.options,
                        correctAnswerIndex: item.correctAnswerIndex,
                        explanation: item.explanation,
                        tags: item.tags,
                        difficulty: item.difficulty,
                        subjectID: item.subjectID,
                        topicID: item.topicID,
                        oneLineSummary: item.oneLineSummary
                    )
                )
            }
        }

        return expanded
    }
}

struct OptionButton: View {
    let text: String
    let index: Int
    let isSelected: Bool
    let isCorrect: Bool?
    let isWrong: Bool
    let action: () -> Void
    
    private let letters = ["A", "B", "C", "D", "E", "F"]
    
    var backgroundColor: Color {
        if isCorrect == true {
            return .green.opacity(0.2)
        } else if isWrong {
            return .red.opacity(0.2)
        } else if isSelected {
            return .blue.opacity(0.2)
        }
        return Color(.secondarySystemGroupedBackground)
    }
    
    var borderColor: Color {
        if isCorrect == true {
            return .green
        } else if isWrong {
            return .red
        } else if isSelected {
            return .blue
        }
        return .clear
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 12) {
                // Letter badge
                Text(letters[index])
                    .font(.headline.bold())
                    .foregroundStyle(.white)
                    .frame(width: 32, height: 32)
                    .background(borderColor != .clear ? borderColor : Color.gray.opacity(0.5))
                    .clipShape(Circle())
                
                Text(text)
                    .font(.body)
                    .foregroundStyle(.primary)
                    .multilineTextAlignment(.leading)
                
                Spacer()
                
                if isCorrect == true {
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                } else if isWrong {
                    Image(systemName: "xmark.circle.fill")
                        .foregroundStyle(.red)
                }
            }
            .padding()
            .background(backgroundColor)
            .clipShape(RoundedRectangle(cornerRadius: 12))
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(borderColor, lineWidth: 2)
            )
        }
    }
}

struct DifficultyBadge: View {
    let difficulty: Question.Difficulty
    
    var color: Color {
        switch difficulty {
        case .easy: return .green
        case .medium: return .orange
        case .hard: return .red
        }
    }
    
    var body: some View {
        Text(difficulty.rawValue)
            .font(.caption.bold())
            .foregroundStyle(.white)
            .padding(.horizontal, 10)
            .padding(.vertical, 5)
            .background(color)
            .clipShape(Capsule())
    }
}

struct ProgressBarView: View {
    let current: Int
    let total: Int
    
    var progress: Double {
        guard total > 0 else { return 0 }
        return Double(current) / Double(total)
    }
    
    var body: some View {
        VStack(spacing: 8) {
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.gray.opacity(0.2))
                    
                    RoundedRectangle(cornerRadius: 4)
                        .fill(
                            LinearGradient(colors: [.blue, .purple], startPoint: .leading, endPoint: .trailing)
                        )
                        .frame(width: geometry.size.width * progress)
                }
            }
            .frame(height: 8)
            
            HStack {
                Text("\(current) of \(total)")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Spacer()
                Text("\(Int(progress * 100))%")
                    .font(.caption.bold())
                    .foregroundStyle(.blue)
            }
        }
        .padding()
        .background(Color(.systemGroupedBackground))
    }
}

#Preview {
    StudyModeView()
        .environment(AppState())
}
