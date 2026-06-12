//
//  ReviewView.swift
//  TestPrep
//
//  Created by Musaab-HQ on 14/02/2026.
//

import SwiftUI

struct ReviewView: View {
    var initialFilter: ReviewFilter? = nil
    @Environment(\.dismiss) private var dismiss
    @Environment(AppState.self) private var appState
    @State private var selectedFilter: ReviewFilter = .all
    @State private var selectedQuestionID: UUID?
    @State private var showQuestionDetail = false
    
    var filteredQuestions: [(Question, AnswerRecord)] {
        appState.getQuestions(for: selectedFilter)
    }
    
    var stats: (correct: Int, incorrect: Int, flagged: Int, total: Int) {
        let all = appState.getQuestions(for: .all)
        let correct = all.filter { $0.1.isCorrect }.count
        let incorrect = all.filter { !$0.1.isCorrect }.count
        let flagged = all.filter { $0.1.isFlagged }.count
        return (correct, incorrect, flagged, all.count)
    }
    
    var body: some View {
        NavigationStack {
            ZStack {
                Color(.systemGroupedBackground)
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Summary stats
                    HStack(spacing: 16) {
                        StatBadge(
                            icon: "checkmark.circle.fill",
                            value: "\(stats.correct)",
                            label: "Correct",
                            color: .green
                        )
                        
                        StatBadge(
                            icon: "xmark.circle.fill",
                            value: "\(stats.incorrect)",
                            label: "Incorrect",
                            color: .red
                        )
                        
                        StatBadge(
                            icon: "flag.fill",
                            value: "\(stats.flagged)",
                            label: "Flagged",
                            color: .orange
                        )
                    }
                    .padding()
                    
                    // Filter tabs
                    ScrollView(.horizontal, showsIndicators: false) {
                        HStack(spacing: 12) {
                            FilterTab(
                                title: "All (\(stats.total))",
                                isSelected: selectedFilter == .all
                            ) {
                                withAnimation {
                                    selectedFilter = .all
                                }
                            }
                            
                            FilterTab(
                                title: "Correct (\(stats.correct))",
                                isSelected: selectedFilter == .correct,
                                color: .green
                            ) {
                                withAnimation {
                                    selectedFilter = .correct
                                }
                            }
                            
                            FilterTab(
                                title: "Incorrect (\(stats.incorrect))",
                                isSelected: selectedFilter == .incorrect,
                                color: .red
                            ) {
                                withAnimation {
                                    selectedFilter = .incorrect
                                }
                            }
                            
                            FilterTab(
                                title: "Flagged (\(stats.flagged))",
                                isSelected: selectedFilter == .flagged,
                                color: .orange
                            ) {
                                withAnimation {
                                    selectedFilter = .flagged
                                }
                            }
                        }
                        .padding(.horizontal)
                    }
                    .padding(.bottom)
                    
                    // Questions list
                    if filteredQuestions.isEmpty {
                        VStack(spacing: 16) {
                            Image(systemName: emptyStateIcon)
                                .font(.system(size: 60))
                                .foregroundStyle(.secondary)
                            Text(emptyStateMessage)
                                .font(.headline)
                                .foregroundStyle(.secondary)
                        }
                        .frame(maxHeight: .infinity)
                    } else {
                        ScrollView {
                            LazyVStack(spacing: 12) {
                                ForEach(Array(filteredQuestions.enumerated()), id: \.element.0.id) { index, item in
                                    ReviewQuestionRow(
                                        question: item.0,
                                        answer: item.1,
                                        index: index + 1
                                    ) {
                                        selectedQuestionID = item.0.id
                                        showQuestionDetail = true
                                    }
                                }
                            }
                            .padding()
                        }
                    }
                }
            }
            .navigationTitle("Review")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
            .sheet(isPresented: $showQuestionDetail) {
                if let questionID = selectedQuestionID,
                   let question = appState.allQuestions.first(where: { $0.id == questionID }),
                   let answer = appState.currentSession?.answers[questionID] {
                    QuestionDetailView(question: question, answer: answer)
                } else {
                    EmptyView()
                }
            }
            .onAppear {
                if let f = initialFilter {
                    selectedFilter = f
                }
            }
        }
    }
    
    var emptyStateIcon: String {
        switch selectedFilter {
        case .all: return "tray"
        case .correct: return "checkmark.circle"
        case .incorrect: return "xmark.circle"
        case .flagged: return "flag"
        }
    }
    
    var emptyStateMessage: String {
        switch selectedFilter {
        case .all: return "No questions to review"
        case .correct: return "No correct answers yet"
        case .incorrect: return "No incorrect answers"
        case .flagged: return "No flagged questions"
        }
    }
}

struct StatBadge: View {
    let icon: String
    let value: String
    let label: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 8) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundStyle(color)
            
            Text(value)
                .font(.title.bold())
            
            Text(label)
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .frame(maxWidth: .infinity)
        .padding()
        .background(Color(.secondarySystemGroupedBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .glassEffect(.regular, in: .rect(cornerRadius: 12))
    }
}

struct FilterTab: View {
    let title: String
    let isSelected: Bool
    var color: Color = .blue
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            Text(title)
                .font(.subheadline.bold())
                .foregroundStyle(isSelected ? .white : .primary)
                .padding(.horizontal, 20)
                .padding(.vertical, 10)
                .background(isSelected ? color : Color(.secondarySystemGroupedBackground))
                .clipShape(Capsule())
        }
    }
}

struct ReviewQuestionRow: View {
    let question: Question
    let answer: AnswerRecord
    let index: Int
    let action: () -> Void
    
    var statusIcon: String {
        if answer.isFlagged {
            return "flag.fill"
        }
        return answer.isCorrect ? "checkmark.circle.fill" : "xmark.circle.fill"
    }
    
    var statusColor: Color {
        if answer.isFlagged {
            return .orange
        }
        return answer.isCorrect ? .green : .red
    }
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                // Index
                Text("\(index)")
                    .font(.headline)
                    .foregroundStyle(.secondary)
                    .frame(width: 30)
                
                // Question preview
                VStack(alignment: .leading, spacing: 6) {
                    Text(question.text)
                        .font(.body)
                        .foregroundStyle(.primary)
                        .lineLimit(2)
                    
                    if answer.selectedAnswerIndex >= 0 && answer.selectedAnswerIndex < question.options.count {
                        Text("Your answer: \(question.options[answer.selectedAnswerIndex])")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                            .lineLimit(1)
                    }
                }
                
                Spacer()
                
                // Status
                VStack(spacing: 4) {
                    Image(systemName: statusIcon)
                        .font(.title2)
                        .foregroundStyle(statusColor)
                    
                    if answer.isFlagged {
                        Image(systemName: answer.isCorrect ? "checkmark.circle.fill" : "xmark.circle.fill")
                            .font(.caption)
                            .foregroundStyle(answer.isCorrect ? .green : .red)
                    }
                }
            }
            .padding()
            .background(Color(.secondarySystemGroupedBackground))
            .clipShape(RoundedRectangle(cornerRadius: 12))
        }
        .buttonStyle(.plain)
    }
}

struct QuestionDetailView: View {
    @Environment(\.dismiss) private var dismiss
    let question: Question
    let answer: AnswerRecord
    
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 24) {
                    // Status banner
                    HStack {
                        Image(systemName: answer.isCorrect ? "checkmark.circle.fill" : "xmark.circle.fill")
                            .font(.title)
                            .foregroundStyle(answer.isCorrect ? .green : .red)
                        
                        Text(answer.isCorrect ? "Correct Answer" : "Incorrect Answer")
                            .font(.title2.bold())
                        
                        Spacer()
                        
                        if answer.isFlagged {
                            Image(systemName: "flag.fill")
                                .foregroundStyle(.orange)
                        }
                    }
                    .padding()
                    .background(answer.isCorrect ? Color.green.opacity(0.15) : Color.red.opacity(0.15))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    
                    // Question
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Question")
                            .font(.headline)
                        Text(question.text)
                            .font(.body)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(.secondarySystemGroupedBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    
                    // Your answer
                    if answer.selectedAnswerIndex >= 0 && answer.selectedAnswerIndex < question.options.count {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Your Answer")
                                .font(.headline)
                            Text(question.options[answer.selectedAnswerIndex])
                                .font(.body)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(answer.isCorrect ? Color.green.opacity(0.15) : Color.red.opacity(0.15))
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                    }
                    
                    // Correct answer (if wrong)
                    if !answer.isCorrect {
                        VStack(alignment: .leading, spacing: 12) {
                            Text("Correct Answer")
                                .font(.headline)
                            Text(question.options[question.correctAnswerIndex])
                                .font(.body)
                        }
                        .padding()
                        .frame(maxWidth: .infinity, alignment: .leading)
                        .background(Color.green.opacity(0.15))
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                    }
                    
                    // Explanation
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Explanation")
                            .font(.headline)
                        Text(question.explanation)
                            .font(.body)
                    }
                    .padding()
                    .frame(maxWidth: .infinity, alignment: .leading)
                    .background(Color(.secondarySystemGroupedBackground))
                    .clipShape(RoundedRectangle(cornerRadius: 16))
                    
                    // AI button
                    Button {
                        // TODO: Integrate with AI
                    } label: {
                        HStack {
                            Image(systemName: "sparkles")
                            Text("Ask AI to Learn More")
                        }
                        .font(.headline)
                        .foregroundStyle(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(
                            LinearGradient(colors: [.purple, .blue], startPoint: .leading, endPoint: .trailing)
                        )
                        .clipShape(RoundedRectangle(cornerRadius: 16))
                    }
                }
                .padding()
            }
            .background(Color(.systemGroupedBackground))
            .navigationTitle("Question Details")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                }
            }
        }
    }
}

#Preview {
    ReviewView()
        .environment(AppState())
}

